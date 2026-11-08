// Banco «Por área y tema» / «Por código»: consultas sobre eunacom_questions agrupadas por código del Perfil EUNACOM 2026.
// Compartido por api/questions.js (Vercel) y por el middleware de desarrollo de vite.config.js (SQLite local).
//
// La columna `fuente` la agrega scripts/perfil/import_rs2026.mjs. Si todavía no existe (producción antes del import),
// todo el banco se trata como «propio», así el endpoint sirve aunque el import no haya corrido.

const CODE_RE = /(\d\.\d\d\.\d\.\d{3})/
const CODE_GLOB = `'[0-9].[0-9][0-9].[0-9].[0-9][0-9][0-9]'`
const MAX_LIMIT = 500
const DEFAULT_LIMIT = 300

let hasFuenteCache = null
export async function hasFuente(db) {
  if (hasFuenteCache !== null) return hasFuenteCache
  try {
    const r = await db.execute('PRAGMA table_info(eunacom_questions)')
    hasFuenteCache = r.rows.some(c => c.name === 'fuente')
  } catch { hasFuenteCache = false }
  return hasFuenteCache
}

export function normalizeRow(r) {
  return {
    id: r.id,
    eunacomCode: r.eunacom_code,
    modulo: r.modulo,
    specialty: r.specialty,
    pregunta: r.pregunta,
    opciones: [
      r.opcion_a && { id: 'A', text: r.opcion_a },
      r.opcion_b && { id: 'B', text: r.opcion_b },
      r.opcion_c && { id: 'C', text: r.opcion_c },
      r.opcion_d && { id: 'D', text: r.opcion_d },
      r.opcion_e && { id: 'E', text: r.opcion_e },
    ].filter(Boolean),
    respuestaCorrecta: r.respuesta_correcta,
    explicacion: r.explicacion,
    explicacionIncorrectas: r.explicacion_incorrectas || '',
    tags: r.tags || '',
    videoRecomendado: r.video_recomendado,
    claseId: r.clase_id,
    fuente: r.fuente || 'propio',
  }
}

export async function handleBanco(db, req, res) {
  const q = req.query
  const withFuente = await hasFuente(db)
  const fuenteExpr = withFuente ? `COALESCE(fuente, 'propio')` : `'propio'`
  const fuente = (q.fuente || 'all').toLowerCase()
  const fuenteWhere = fuente === 'all' || !withFuente && fuente === 'propio' ? '' : fuente === 'propio' ? ' AND fuente IS NULL' : ' AND fuente = ?'
  const fuenteArgs = fuenteWhere.includes('?') ? [fuente] : []
  if (!withFuente && fuente !== 'all' && fuente !== 'propio') return res.json({ data: [], total: 0, fuenteDisponible: false })

  try {
    // ── Árbol: conteos por código/fuente + preguntas sin código por especialidad ──
    if (q.tree) {
      const byCode = await db.execute(`SELECT eunacom_code AS code, ${fuenteExpr} AS f, COUNT(*) AS c FROM eunacom_questions GROUP BY eunacom_code, f`)
      const counts = {}        // code → { propio, rs2026 }
      const sinCodigoRaw = []  // filas cuyo código no es válido (se resuelven abajo por especialidad)
      for (const r of byCode.rows) {
        const m = CODE_RE.exec(r.code || '')
        if (!m) { sinCodigoRaw.push(r); continue }
        const e = counts[m[1]] ??= {}
        e[r.f] = (e[r.f] || 0) + Number(r.c)
      }
      const sinCodigo = {}     // specialty → { propio, rs2026 }
      if (sinCodigoRaw.length) {
        const bySpec = await db.execute(`SELECT COALESCE(specialty, 'Sin especialidad') AS s, ${fuenteExpr} AS f, COUNT(*) AS c FROM eunacom_questions WHERE eunacom_code IS NULL OR eunacom_code NOT GLOB ${CODE_GLOB} GROUP BY s, f`)
        for (const r of bySpec.rows) { (sinCodigo[r.s] ??= {})[r.f] = Number(r.c) }
      }
      const totals = {}
      for (const e of Object.values(counts)) for (const [f, n] of Object.entries(e)) totals[f] = (totals[f] || 0) + n
      for (const e of Object.values(sinCodigo)) for (const [f, n] of Object.entries(e)) totals[f] = (totals[f] || 0) + n
      res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=86400')
      return res.json({ counts, sinCodigo, totals, fuenteDisponible: withFuente })
    }

    // ── Por lista de ids (Crear examen con preguntas rs2026, reanudar desde Historial) ──
    if (q.ids) {
      const ids = [...new Set(String(q.ids).split(',').map(s => s.trim()).filter(Boolean))].slice(0, MAX_LIMIT)
      if (!ids.length) return res.json({ data: [], total: 0 })
      const rows = (await db.execute({ sql: `SELECT * FROM eunacom_questions WHERE id IN (${ids.map(() => '?').join(',')})`, args: ids })).rows
      const byId = Object.fromEntries(rows.map(r => [r.id, normalizeRow(r)]))
      const data = ids.map(id => byId[id]).filter(Boolean)
      return res.json({ data, total: data.length })
    }

    const lim = Math.min(Math.max(1, parseInt(q.limit) || DEFAULT_LIMIT), MAX_LIMIT)
    let where, args
    if (q.code) {
      const m = CODE_RE.exec(q.code)
      if (!m) return res.status(400).json({ error: 'code inválido (formato 1.01.1.018)' })
      where = 'eunacom_code = ?'; args = [m[1]]
    } else if (q.code_prefix) {
      const prefix = String(q.code_prefix).trim()
      if (!/^\d(\.\d{0,2}(\.\d?(\.\d{0,3})?)?)?$/.test(prefix)) return res.status(400).json({ error: 'code_prefix inválido (p. ej. 1.01.2)' })
      where = `eunacom_code LIKE ? ESCAPE '\\'`; args = [prefix.replace(/[%_\\]/g, '\\$&') + '%']
    } else if (q.sin_codigo) {
      if (!q.specialty) return res.status(400).json({ error: 'specialty requerido con sin_codigo' })
      where = `(eunacom_code IS NULL OR eunacom_code NOT GLOB ${CODE_GLOB}) AND COALESCE(specialty, 'Sin especialidad') = ?`; args = [q.specialty]
    }
    where += fuenteWhere; args = [...args, ...fuenteArgs]

    const total = Number((await db.execute({ sql: `SELECT COUNT(*) AS n FROM eunacom_questions WHERE ${where}`, args })).rows[0]?.n || 0)
    // Si caben todas: propias primero y en orden estable; si no, muestra al azar (el alumno pidió «todas», pero hay tope)
    const order = total > lim ? 'random()' : `${withFuente ? '(fuente IS NOT NULL), ' : ''}eunacom_code, id`
    const rows = (await db.execute({ sql: `SELECT * FROM eunacom_questions WHERE ${where} ORDER BY ${order} LIMIT ?`, args: [...args, lim] })).rows
    return res.json({ data: rows.map(normalizeRow), total, truncated: total > rows.length })
  } catch (err) {
    console.error('[questions/banco]', err)
    return res.status(500).json({ error: err.message })
  }
}
