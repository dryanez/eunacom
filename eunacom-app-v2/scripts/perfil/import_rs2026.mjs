#!/usr/bin/env node
// Importa el banco de eunacom.regionalsantiago.cl (fuente «rs2026») a la tabla eunacom_questions
// con el código del Perfil 2026 de su tema, SIN tocar las preguntas existentes (INSERT OR IGNORE por id).
//
//   node scripts/perfil/import_rs2026.mjs --local --sync-questiondb   → SQLite de desarrollo (scratch/banco-dev.db)
//   node scripts/perfil/import_rs2026.mjs --dry-run                   → Turso: solo muestra qué haría
//   node scripts/perfil/import_rs2026.mjs                             → Turso (TURSO_DATABASE_URL+TURSO_AUTH_TOKEN en env/.env.local,
//                                                                       o la CLI ~/.turso/turso con la sesión de dryanez)
//   node scripts/perfil/import_rs2026.mjs --verify                    → solo compara conteos por código contra el JSON
//
// Opciones:
//   --dump <ruta>        JSON del dump (por defecto ~/Documents/Archive/eunacom-regionalsantiago/data/eunacom_regionalsantiago_dump.json)
//   --sync-questiondb    además inserta en la tabla las preguntas de public/data/questionDB.json que falten (por id),
//                        para que el banco actual completo (7.002) quede navegable por código. No modifica filas existentes.
//   --apply-codes <tsv>  (solo local) rellena eunacom_code NULL desde un id<TAB>codigo (p. ej. snapshot de producción)
//   --batch <n>          tamaño de lote (300)
import fs from 'fs'
import os from 'os'
import path from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@libsql/client'
import { openDb } from '../libro-gordo/db.mjs'
import { LOCAL_DB_URL, LOCAL_DB_PATH } from './local-db.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '../..')
const argv = process.argv.slice(2)
const flag = n => argv.includes(n)
const opt = (n, d) => { const i = argv.indexOf(n); return i > -1 ? argv[i + 1] : d }
const DRY = flag('--dry-run')
const VERIFY_ONLY = flag('--verify')
const BATCH = parseInt(opt('--batch', '300')) || 300
const DUMP = opt('--dump', path.join(os.homedir(), 'Documents/Archive/eunacom-regionalsantiago/data/eunacom_regionalsantiago_dump.json'))
const CODE_RE = /^\d\.\d\d\.\d\.\d{3}$/
const FUENTE = 'rs2026'

function db() {
  if (flag('--local')) {
    fs.mkdirSync(path.dirname(LOCAL_DB_PATH), { recursive: true })
    const c = createClient({ url: LOCAL_DB_URL })
    return { label: LOCAL_DB_URL, execute: q => c.execute(q), batch: s => c.batch(s, 'write') }
  }
  return openDb(argv)
}

async function ensureSchema(d) {
  await d.execute(`CREATE TABLE IF NOT EXISTS eunacom_questions (
      id TEXT PRIMARY KEY, eunacom_code TEXT, specialty TEXT, pregunta TEXT NOT NULL,
      opcion_a TEXT, opcion_b TEXT, opcion_c TEXT, opcion_d TEXT, opcion_e TEXT,
      respuesta_correcta TEXT, explicacion TEXT, tags TEXT, video_recomendado TEXT, clase_id TEXT,
      saved_at TEXT DEFAULT (datetime('now')), modulo TEXT, explicacion_incorrectas TEXT)`)
  // Columnas nuevas (ALTER ADD COLUMN no toca las filas existentes: quedan en NULL = banco propio)
  for (const col of ['fuente TEXT', 'fuente_ref TEXT']) {
    try { await d.execute(`ALTER TABLE eunacom_questions ADD COLUMN ${col}`) } catch (e) { if (!/duplicate column/i.test(e.message)) throw e }
  }
  for (const [name, cols] of [['idx_eq_code', 'eunacom_code'], ['idx_eq_fuente', 'fuente'], ['idx_eq_spec', 'specialty']]) {
    await d.execute(`CREATE INDEX IF NOT EXISTS ${name} ON eunacom_questions(${cols})`)
  }
}

const COLS = ['id', 'eunacom_code', 'specialty', 'modulo', 'pregunta', 'opcion_a', 'opcion_b', 'opcion_c', 'opcion_d', 'opcion_e', 'respuesta_correcta', 'explicacion', 'explicacion_incorrectas', 'tags', 'fuente', 'fuente_ref']
const INSERT = `INSERT OR IGNORE INTO eunacom_questions (${COLS.join(', ')}) VALUES (${COLS.map(() => '?').join(', ')})`
const row = o => ({ sql: INSERT, args: COLS.map(c => o[c] ?? null) })

async function insertAll(d, rows, label) {
  let done = 0
  for (let i = 0; i < rows.length; i += BATCH) {
    await d.batch(rows.slice(i, i + BATCH).map(row))
    done += Math.min(BATCH, rows.length - i)
    if (done % (BATCH * 20) === 0 || done === rows.length) process.stdout.write(`  ${label}: ${done}/${rows.length}\n`)
  }
}

async function countByFuente(d) {
  // antes del primer import la columna fuente no existe: todo cuenta como propio
  const cols = await d.execute({ sql: `SELECT name FROM pragma_table_info('eunacom_questions')`, cols: ['name'] })
  const hasFuente = cols.rows.some(x => x.name === 'fuente')
  const f = hasFuente ? `COALESCE(fuente,'propio')` : `'propio'`
  const r = await d.execute({ sql: `SELECT ${f} AS f, COUNT(*) AS c FROM eunacom_questions GROUP BY f`, cols: ['f', 'c'] })
  return Object.fromEntries(r.rows.map(x => [x.f, Number(x.c)]))
}

function loadDump() {
  const temas = JSON.parse(fs.readFileSync(DUMP, 'utf8'))
  const rows = [], perCode = {}
  let bad = 0
  for (const t of temas) {
    if (!CODE_RE.test(t.codigo)) { console.warn('tema sin código válido:', t.codigo, t.tema); bad++; continue }
    for (const p of t.preguntas) {
      const by = Object.fromEntries(p.opts.map(o => [o.letra, o.texto]))
      const correctaOpt = p.opts.find(o => o.correcta)?.letra
      const correcta = (p.correcta || correctaOpt || '').toUpperCase()
      if (!/^[A-E]$/.test(correcta) || (correctaOpt && correctaOpt !== correcta) || p.opts.length !== 5 || !p.texto) { bad++; console.warn('pregunta inconsistente', t.codigo, p.id); continue }
      rows.push({
        id: `${FUENTE}-${p.id}`,
        eunacom_code: t.codigo,
        specialty: t.esp,
        modulo: t.area,
        pregunta: p.texto,
        opcion_a: by.A, opcion_b: by.B, opcion_c: by.C, opcion_d: by.D, opcion_e: by.E,
        respuesta_correcta: correcta,
        explicacion: p.exp || null,
        tags: `${FUENTE}, ${t.tipo}`,
        fuente: FUENTE,
        fuente_ref: `${t.codigo}#${p.num}`,
      })
      perCode[t.codigo] = (perCode[t.codigo] || 0) + 1
    }
  }
  return { temas, rows, perCode, bad }
}

function loadQuestionDB() {
  const qdb = JSON.parse(fs.readFileSync(path.join(repoRoot, 'public/data/questionDB.json'), 'utf8'))
  return qdb.map(q => {
    const ch = Object.fromEntries((q.choices || []).map(c => [String(c.id).toUpperCase(), c.text]))
    const m = /(\d\.\d\d\.\d\.\d{3})/.exec(q.codigo_eunacom || '')
    return {
      id: q.id, eunacom_code: m ? m[1] : null, specialty: q.topic || null, modulo: q.category || null,
      pregunta: q.question, opcion_a: ch.A, opcion_b: ch.B, opcion_c: ch.C, opcion_d: ch.D, opcion_e: ch.E,
      respuesta_correcta: (q.correctAnswer || '').toUpperCase(), explicacion: q.explanation || null,
      explicacion_incorrectas: q.incorrectExplanations || null, tags: q.tags || null, fuente: null, fuente_ref: 'questionDB.json',
    }
  }).filter(q => q.id && q.pregunta)
}

async function verify(d, perCode, total) {
  const r = await d.execute({ sql: `SELECT eunacom_code AS code, COUNT(*) AS c FROM eunacom_questions WHERE fuente = '${FUENTE}' GROUP BY eunacom_code`, cols: ['code', 'c'] })
  const inDb = Object.fromEntries(r.rows.map(x => [x.code, Number(x.c)]))
  const codes = new Set([...Object.keys(perCode), ...Object.keys(inDb)])
  const diffs = [...codes].filter(c => (perCode[c] || 0) !== (inDb[c] || 0))
  const sum = Object.values(inDb).reduce((a, b) => a + b, 0)
  console.log(`verificación: ${Object.keys(perCode).length} códigos en JSON, ${Object.keys(inDb).length} en BD; ${total} preguntas en JSON, ${sum} en BD; ${diffs.length} códigos con conteo distinto`)
  for (const c of diffs.slice(0, 20)) console.log(`  ${c}: json=${perCode[c] || 0} bd=${inDb[c] || 0}`)
  return diffs.length === 0 && sum === total
}

async function main() {
  const d = db()
  console.log('destino:', d.label, DRY ? '(dry-run)' : '')
  const { temas, rows, perCode, bad } = loadDump()
  console.log(`dump: ${temas.length} temas, ${rows.length} preguntas válidas, ${bad} descartadas`)

  if (VERIFY_ONLY) { process.exit(await verify(d, perCode, rows.length) ? 0 : 1) }

  if (DRY) {
    try { console.log('conteo actual por fuente:', await countByFuente(d)) } catch (e) { console.log('(sin tabla aún)') }
    console.log(`haría: ALTER TABLE eunacom_questions ADD COLUMN fuente/fuente_ref (si faltan); INSERT OR IGNORE ${rows.length} filas con fuente='${FUENTE}' e ids '${FUENTE}-<id>'`)
    if (flag('--sync-questiondb')) console.log(`haría: INSERT OR IGNORE ${loadQuestionDB().length} filas de questionDB.json (solo las que falten por id)`)
    return
  }

  await ensureSchema(d)
  const before = await countByFuente(d)
  console.log('antes:', before)

  if (flag('--sync-questiondb')) {
    const q = loadQuestionDB()
    await insertAll(d, q, 'questionDB.json')
  }
  const applyCodes = opt('--apply-codes')
  if (applyCodes) {
    const pairs = fs.readFileSync(applyCodes, 'utf8').split('\n').map(l => l.split('\t')).filter(p => p.length === 2 && CODE_RE.test(p[1].trim()))
    for (let i = 0; i < pairs.length; i += BATCH) {
      await d.batch(pairs.slice(i, i + BATCH).map(([id, code]) => ({ sql: `UPDATE eunacom_questions SET eunacom_code = ? WHERE id = ? AND (eunacom_code IS NULL OR eunacom_code = '')`, args: [code.trim(), id.trim()] })))
    }
    console.log(`códigos aplicados desde ${applyCodes}: ${pairs.length} pares`)
  }

  await insertAll(d, rows, FUENTE)
  const after = await countByFuente(d)
  console.log('después:', after)
  console.log(`insertadas ${FUENTE}: ${(after[FUENTE] || 0) - (before[FUENTE] || 0)} (ya existían ${(before[FUENTE] || 0)})`)
  const ok = await verify(d, perCode, rows.length)
  process.exit(ok ? 0 : 1)
}

main().catch(e => { console.error(e); process.exit(1) })
