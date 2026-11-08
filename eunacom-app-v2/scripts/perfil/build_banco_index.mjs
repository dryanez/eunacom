// Genera public/data/banco_index.json para «Crear examen»:
//   - rs2026: ids numéricos por Módulo › especialidad › tipo de situación (desde el dump del competidor)
//   - propio: ids del banco propio por tipo de situación (dígito 3 del código del Perfil, leído de Turso)
// Uso:
//   node scripts/perfil/build_banco_index.mjs            → Turso (env/.env.local o CLI ~/.turso/turso)
//   node scripts/perfil/build_banco_index.mjs --local    → SQLite local (scratch/banco-dev.db)
//   node scripts/perfil/build_banco_index.mjs --dump ruta.json
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { openDb } from '../libro-gordo/db.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '../..')
const argv = process.argv.slice(2)
const dumpArg = argv.indexOf('--dump')
const DUMP = dumpArg !== -1 ? argv[dumpArg + 1] : path.join(process.env.HOME, 'Documents/Archive/eunacom-regionalsantiago/data/eunacom_regionalsantiago_dump.json')
const OUT = path.join(root, 'public/data/banco_index.json')
const CODE_RE = /^(\d)\.(\d\d)\.(\d)\.(\d{3})$/

export const TIPOS = {
  1: 'Situaciones clínicas',
  2: 'Situaciones clínicas de urgencia',
  3: 'Conocimientos generales',
  4: 'Exámenes e imagenología',
  5: 'Procedimientos diagnósticos y terapéuticos',
  0: 'Sin clasificar',
}
const TIPO_NAME_TO_KEY = Object.fromEntries(Object.entries(TIPOS).map(([k, v]) => [v, k]))

// Mismos «Módulos» que usa questionDB.json en Crear examen
const AREA_TO_MODULO = {
  'Medicina Interna': 'Módulo 1',
  'Cirugía': 'Módulo 2', 'Psiquiatría': 'Módulo 2', 'Especialidades': 'Módulo 2', 'Salud Pública': 'Módulo 2',
  'Pediatría': 'Módulo 3', 'Obstetricia y Ginecología': 'Módulo 3',
}

// ── rs2026 ──
const temas = JSON.parse(fs.readFileSync(DUMP, 'utf8'))
const modulos = {}
let nRs = 0
for (const t of temas) {
  const mod = AREA_TO_MODULO[t.area]
  if (!mod) throw new Error(`área sin módulo: ${t.area}`)
  const m = CODE_RE.exec(t.codigo)
  const tipo = m ? m[3] : TIPO_NAME_TO_KEY[t.tipo] ?? '0'
  const arr = (((modulos[mod] ??= {})[t.esp] ??= {})[tipo] ??= [])
  for (const p of t.preguntas) {
    if (!/^\d+$/.test(String(p.id))) throw new Error(`id no numérico: ${p.id}`)
    arr.push(Number(p.id)); nRs++
  }
}
for (const m of Object.values(modulos)) for (const esp of Object.values(m)) for (const k of Object.keys(esp)) esp[k].sort((a, b) => a - b)

// ── propio: tipo por id desde el código en la base ──
const db = openDb(argv)
const r = await db.execute({ sql: `SELECT id, eunacom_code FROM eunacom_questions WHERE fuente IS NULL OR fuente = 'propio'`, cols: ['id', 'eunacom_code'] })
const propio = {}
for (const row of r.rows) {
  const m = CODE_RE.exec(row.eunacom_code || '')
  const tipo = m && TIPOS[m[3]] ? m[3] : '0'
  ;(propio[tipo] ??= []).push(row.id)
}
for (const k of Object.keys(propio)) propio[k].sort()

fs.mkdirSync(path.dirname(OUT), { recursive: true })
fs.writeFileSync(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), tipos: TIPOS, rs2026: { prefix: 'rs2026-', total: nRs, modulos }, propio }))
console.log(`${OUT}: rs2026 ${nRs} ids, propio ${r.rows.length} ids (${Object.entries(propio).map(([k, v]) => `tipo ${k}: ${v.length}`).join(', ')}), ${(fs.statSync(OUT).size / 1024).toFixed(0)} KB`)
