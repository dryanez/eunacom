#!/usr/bin/env node
// Genera src/data/perfilTree.json: el árbol Área › Especialidad › Tipo › Tema (código del Perfil EUNACOM 2026)
// a partir del codemap oficial (v3_codemap.json) y, opcionalmente, del dump de regionalsantiago
// (para incorporar los pocos códigos que el dump trae y el codemap no).
//
//   node scripts/perfil/build_perfil_tree.mjs \
//     --codemap ~/Documents/Archive/Apps/eunacom-fotos/books/data/v3_codemap.json \
//     --dump ~/Documents/Archive/eunacom-regionalsantiago/data/eunacom_regionalsantiago_dump.json
//
// El árbol es estático (1.5k nodos ≈ 100 KB). Los conteos de preguntas se piden aparte a /api/questions?tree=1.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const args = Object.fromEntries(process.argv.slice(2).map((a, i, arr) => a.startsWith('--') ? [a.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true] : []).filter(x => x.length))
const HOME = process.env.HOME
const codemapPath = args.codemap || path.join(HOME, 'Documents/Archive/Apps/eunacom-fotos/books/data/v3_codemap.json')
const dumpPath = args.dump || path.join(HOME, 'Documents/Archive/eunacom-regionalsantiago/data/eunacom_regionalsantiago_dump.json')
const outPath = args.out || path.join(__dirname, '../../src/data/perfilTree.json')

export const AREAS = {
  1: 'Medicina Interna',
  2: 'Pediatría',
  3: 'Obstetricia y Ginecología',
  4: 'Cirugía',
  5: 'Psiquiatría',
  6: 'Especialidades',
  7: 'Salud Pública',
}
export const TIPOS = {
  1: 'Situaciones clínicas',
  2: 'Situaciones clínicas de urgencia',
  3: 'Conocimientos generales',
  4: 'Exámenes e imagenología',
  5: 'Procedimientos diagnósticos y terapéuticos',
}
export const CODE_RE = /^(\d)\.(\d\d)\.(\d)\.(\d{3})$/

const codemap = JSON.parse(fs.readFileSync(codemapPath, 'utf8'))
const temas = new Map() // code -> { code, name, specKey, specialty, extra? }
for (const [code, v] of Object.entries(codemap)) {
  if (!CODE_RE.test(code)) { console.warn('codemap: código raro', code); continue }
  temas.set(code, { code, name: v.name, specKey: v.specKey, specialty: v.specialty })
}

let dumpTemas = []
if (fs.existsSync(dumpPath)) {
  dumpTemas = JSON.parse(fs.readFileSync(dumpPath, 'utf8'))
  let added = 0, mismatches = 0
  for (const t of dumpTemas) {
    const m = CODE_RE.exec(t.codigo || '')
    if (!m) { console.warn('dump: código raro', t.codigo, t.tema); continue }
    // Comprobación: área/tipo derivados del código deben coincidir con lo que muestra el competidor
    if (AREAS[+m[1]] !== t.area || TIPOS[+m[3]] !== t.tipo) { mismatches++; console.warn('dump: área/tipo no coinciden', t.codigo, t.area, t.tipo) }
    if (!temas.has(t.codigo)) {
      const specKey = `${m[1]}.${m[2]}`
      const sibling = [...temas.values()].find(x => x.specKey === specKey)
      temas.set(t.codigo, { code: t.codigo, name: t.tema, specKey, specialty: sibling?.specialty || t.esp, extra: true })
      added++
    }
  }
  console.log(`dump: ${dumpTemas.length} temas, ${added} códigos agregados que no estaban en el codemap, ${mismatches} discrepancias área/tipo`)
} else {
  console.warn('sin dump (', dumpPath, '); el árbol sale solo del codemap')
}

// Construir árbol
const areas = {}
for (const t of [...temas.values()].sort((a, b) => a.code.localeCompare(b.code))) {
  const m = CODE_RE.exec(t.code)
  const areaKey = m[1], tipoKey = m[3]
  const area = areas[areaKey] ??= { key: areaKey, name: AREAS[+areaKey] || `Área ${areaKey}`, specs: {} }
  const spec = area.specs[t.specKey] ??= { key: t.specKey, name: t.specialty, tipos: {} }
  const tipo = spec.tipos[tipoKey] ??= { key: tipoKey, name: TIPOS[+tipoKey] || `Tipo ${tipoKey}`, temas: [] }
  const node = { code: t.code, name: t.name }
  if (t.extra) node.extra = true
  tipo.temas.push(node)
}
const tree = {
  generatedAt: new Date().toISOString().slice(0, 10),
  source: 'Perfil de Conocimientos EUNACOM 2026 (v3_codemap.json)',
  areas: Object.values(areas).map(a => ({
    ...a,
    specs: Object.values(a.specs).map(s => ({ ...s, tipos: Object.values(s.tipos) })),
  })),
}
const nTemas = tree.areas.reduce((n, a) => n + a.specs.reduce((m, s) => m + s.tipos.reduce((k, t) => k + t.temas.length, 0), 0), 0)
fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(tree))
console.log(`OK ${outPath}: ${tree.areas.length} áreas, ${tree.areas.reduce((n, a) => n + a.specs.length, 0)} especialidades, ${nTemas} temas (${(fs.statSync(outPath).size / 1024).toFixed(0)} KB)`)
