// GET /api/questions?clase_id=xxx        → questions for a specific class
// GET /api/questions?eunacom_code=x.xx   → questions for a code
// GET /api/questions?specialty=xxx&limit=N → questions by specialty
import { getTurso } from './_turso.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const db = getTurso()

  // Ensure table exists (idempotent – safe if already created by upload script)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS eunacom_questions (
      id TEXT PRIMARY KEY,
      eunacom_code TEXT,
      specialty TEXT,
      pregunta TEXT NOT NULL,
      opcion_a TEXT,
      opcion_b TEXT,
      opcion_c TEXT,
      opcion_d TEXT,
      opcion_e TEXT,
      respuesta_correcta TEXT,
      explicacion TEXT,
      tags TEXT,
      video_recomendado TEXT,
      clase_id TEXT,
      saved_at TEXT DEFAULT (datetime('now'))
    )
  `)
  try { await db.execute('CREATE INDEX IF NOT EXISTS idx_eq_code ON eunacom_questions(eunacom_code)') } catch {}
  try { await db.execute('CREATE INDEX IF NOT EXISTS idx_eq_clase ON eunacom_questions(clase_id)') } catch {}
  try { await db.execute('CREATE INDEX IF NOT EXISTS idx_eq_spec ON eunacom_questions(specialty)') } catch {}

  const { clase_id, eunacom_code, specialty, limit = '50', offset = '0' } = req.query
  const lim = Math.min(parseInt(limit) || 50, 200)
  const off = parseInt(offset) || 0

  try {
    let rows = []

    if (clase_id) {
      // Primary: questions matched directly to this class
      const direct = await db.execute({
        sql: `SELECT * FROM eunacom_questions WHERE clase_id = ? ORDER BY id LIMIT ? OFFSET ?`,
        args: [clase_id, lim, off]
      })
      rows = direct.rows
    } else if (eunacom_code) {
      const result = await db.execute({
        sql: `SELECT * FROM eunacom_questions WHERE eunacom_code = ? ORDER BY id LIMIT ? OFFSET ?`,
        args: [eunacom_code, lim, off]
      })
      rows = result.rows
    } else if (specialty) {
      const result = await db.execute({
        sql: `SELECT * FROM eunacom_questions WHERE specialty = ? ORDER BY id LIMIT ? OFFSET ?`,
        args: [specialty, lim, off]
      })
      rows = result.rows
    } else {
      return res.status(400).json({ error: 'Provide clase_id, eunacom_code, or specialty' })
    }

    // Normalise rows into a consistent shape for the frontend
    const questions = rows.map(r => ({
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
    }))

    return res.json({ data: questions, total: questions.length })
  } catch (err) {
    console.error('[questions]', err)
    return res.status(500).json({ error: err.message })
  }
}
