// Genera public/data/rs2026_index.json: índice liviano (ids numéricos por Módulo › tema) de las preguntas
// importadas con fuente='rs2026', para que «Crear examen» pueda contarlas y filtrarlas sin bajar los 40k enunciados.
// El id real en Turso es `rs2026-<id>`. Uso:
//   node scripts/perfil/build_rs2026_index.mjs [--dump ruta.json]
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '../..')
const argv = process.argv.slice(2)
const dumpArg = argv.indexOf('--dump')
const DUMP = dumpArg !== -1 ? argv[dumpArg + 1] : path.join(process.env.HOME, 'Documents/Archive/eunacom-regionalsantiago/data/eunacom_regionalsantiago_dump.json')
const OUT = path.join(root, 'public/data/rs2026_index.json')

// Mismos «Módulos» que usa questionDB.json en Crear examen
const AREA_TO_MODULO = {
  'Medicina Interna': 'Módulo 1',
  'Cirugía': 'Módulo 2', 'Psiquiatría': 'Módulo 2', 'Especialidades': 'Módulo 2', 'Salud Pública': 'Módulo 2',
  'Pediatría': 'Módulo 3', 'Obstetricia y Ginecología': 'Módulo 3',
}

const temas = JSON.parse(fs.readFileSync(DUMP, 'utf8'))
const modulos = {}
let n = 0
for (const t of temas) {
  const mod = AREA_TO_MODULO[t.area]
  if (!mod) throw new Error(`área sin módulo: ${t.area}`)
  const topic = t.esp
  const arr = ((modulos[mod] ??= {})[topic] ??= [])
  for (const p of t.preguntas) {
    if (!/^\d+$/.test(String(p.id))) throw new Error(`id no numérico: ${p.id}`)
    arr.push(Number(p.id)); n++
  }
}
for (const m of Object.values(modulos)) for (const k of Object.keys(m)) m[k].sort((a, b) => a - b)
fs.mkdirSync(path.dirname(OUT), { recursive: true })
fs.writeFileSync(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), fuente: 'rs2026', prefix: 'rs2026-', total: n, modulos }))
console.log(`${OUT}: ${n} ids, ${Object.keys(modulos).length} módulos, ${(fs.statSync(OUT).size / 1024).toFixed(0)} KB`)
for (const [m, topics] of Object.entries(modulos)) console.log(` ${m}: ${Object.entries(topics).map(([k, v]) => `${k} ${v.length}`).join(', ')}`)
