// Banco «Por área y tema» / «Por código»: árbol del Perfil EUNACOM 2026 + conteos del servidor + helpers.
import perfilTree from '../data/perfilTree.json'
import { apiFetch } from './api'

export const FUENTES = [
  { id: 'all', label: 'Todas' },
  { id: 'propio', label: 'Banco EUNACOM App' },
  { id: 'rs2026', label: 'Nuevas 2026' },
]
export const FUENTE_LABEL = { propio: 'propias', rs2026: 'nuevas' }

// Etiquetas de especialidad del banco propio → especialidad del Perfil (specKey). Las ambiguas van al área.
const SPECIALTY_TO_SPEC = {
  'Cardiología': '1.01', 'Endocrinología': '1.03', 'Gastroenterología': '1.06', 'Hematología': '1.08',
  'Infectología': '1.04', 'Nefrología': '1.09', 'Neurología': '1.10', 'Respiratorio': '1.05', 'Reumatología': '1.11',
  'Pediatría': '2.01', 'Neonatología': '2.01', 'Ginecología': '3.01', 'Obstetricia': '3.01',
  'Cirugía y Anestesia': '4.01', 'Cirugía y anastesia': '4.01', 'Traumatología': '4.02', 'Urología': '4.03',
  'Psiquiatría': '5.01', 'Dermatología': '6.01', 'Oftalmología': '6.02', 'Otorrinolaringología': '6.03', 'Salud Pública': '7.01',
}
const SPECIALTY_TO_AREA = { 'Medicina Interna': '1', 'Especialidades': '6', 'Pediatría y Ginecología': '2' }

const TIPO_NAMES = { 1: 'Situaciones clínicas', 2: 'Situaciones clínicas de urgencia', 3: 'Conocimientos generales', 4: 'Exámenes e imagenología', 5: 'Procedimientos diagnósticos y terapéuticos' }
const add = (a, b) => { for (const [k, v] of Object.entries(b || {})) a[k] = (a[k] || 0) + v; return a }
export const total = (n, fuente = 'all') => fuente === 'all' ? Object.values(n || {}).reduce((s, v) => s + v, 0) : (n?.[fuente] || 0)

export async function fetchBancoTree() {
  return apiFetch('/api/questions?tree=1')
}

export async function fetchBancoQuestions({ code, prefix, sinCodigo, fuente = 'all', limit = 300 } = {}) {
  const p = new URLSearchParams()
  if (code) p.set('code', code)
  else if (prefix) p.set('code_prefix', prefix)
  else if (sinCodigo) { p.set('sin_codigo', '1'); p.set('specialty', sinCodigo) }
  if (fuente && fuente !== 'all') p.set('fuente', fuente)
  p.set('limit', String(limit))
  return apiFetch(`/api/questions?${p.toString()}`)
}

// Une el árbol estático con los conteos de /api/questions?tree=1 → árbol con n = { propio, rs2026 } en cada nodo
export function buildTree(serverCounts) {
  const counts = serverCounts?.counts || {}
  const sinCodigo = serverCounts?.sinCodigo || {}
  const areas = perfilTree.areas.map(a => {
    const specs = a.specs.map(s => {
      const tipos = s.tipos.map(t => {
        const temas = t.temas.map(x => ({ ...x, n: { ...(counts[x.code] || {}) } }))
        return { ...t, temas, n: temas.reduce((acc, x) => add(acc, x.n), {}) }
      })
      return { ...s, tipos, n: tipos.reduce((acc, t) => add(acc, t.n), {}) }
    })
    return { ...a, specs, n: specs.reduce((acc, s) => add(acc, s.n), {}) }
  })
  // Códigos presentes en el banco pero ausentes del Perfil 2026 (p. ej. 1.02.1.000 de versiones anteriores):
  // se cuelgan de su especialidad/tipo por prefijo para que ninguna pregunta quede fuera del árbol
  const known = new Set(areas.flatMap(a => a.specs.flatMap(s => s.tipos.flatMap(t => t.temas.map(x => x.code)))))
  for (const [code, n] of Object.entries(counts)) {
    if (known.has(code) || !total(n)) continue
    const [areaKey, specNum, tipoKey] = code.split('.')
    const area = areas.find(a => a.key === areaKey)
    if (!area) continue
    const specKey = `${areaKey}.${specNum}`
    let spec = area.specs.find(s => s.key === specKey)
    if (!spec) spec = area.specs.find(s => s.pseudo) || (area.specs.push({ key: `${area.key}.sin`, name: 'Sin especialidad asignada', pseudo: true, tipos: [], n: {} }), area.specs[area.specs.length - 1])
    let tipo = spec.tipos.find(t => t.key === tipoKey)
    if (!tipo) { tipo = { key: tipoKey, name: TIPO_NAMES[tipoKey] || `Tipo ${tipoKey}`, temas: [], n: {} }; spec.tipos.push(tipo); spec.tipos.sort((x, y) => x.key.localeCompare(y.key)) }
    tipo.temas.push({ code, name: 'Código no vigente en el Perfil 2026', extra: true, n: { ...n } })
    add(tipo.n, n); add(spec.n, n); add(area.n, n)
  }
  // «Sin código»: preguntas propias aún sin clasificar, por especialidad (hasta que se clasifiquen)
  for (const [specialty, n] of Object.entries(sinCodigo)) {
    if (!total(n)) continue
    const tema = { code: null, sinCodigo: specialty, name: `${specialty} · sin código`, n: { ...n } }
    const specKey = SPECIALTY_TO_SPEC[specialty]
    const areaKey = specKey ? specKey.split('.')[0] : SPECIALTY_TO_AREA[specialty]
    const area = areas.find(a => a.key === areaKey) || areas[0]
    let spec = specKey ? area.specs.find(s => s.key === specKey) : null
    if (!spec) {
      spec = area.specs.find(s => s.pseudo) || (area.specs.push({ key: `${area.key}.sin`, name: 'Sin especialidad asignada', pseudo: true, tipos: [], n: {} }), area.specs[area.specs.length - 1])
    }
    let tipo = spec.tipos.find(t => t.key === 'sin')
    if (!tipo) { tipo = { key: 'sin', name: 'Sin código del Perfil', pseudo: true, temas: [], n: {} }; spec.tipos.push(tipo) }
    tipo.temas.push(tema); add(tipo.n, n); add(spec.n, n); add(area.n, n)
  }
  return { areas, totals: serverCounts?.totals || {}, fuenteDisponible: serverCounts?.fuenteDisponible !== false }
}

export function allTemas(tree) {
  const out = []
  for (const a of tree.areas) for (const s of a.specs) for (const t of s.tipos) for (const x of t.temas) out.push({ ...x, area: a, spec: s, tipo: t })
  return out
}

export const isCodePrefix = v => /^\d(\.\d{0,2}(\.\d?(\.\d{0,3})?)?)?$/.test(v.trim())
export const norm = s => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

// Fila de /api/questions → forma que espera TestRunner (la de questionDB.json)
export function toRunnerQuestion(q) {
  return {
    id: q.id,
    question: q.pregunta,
    choices: q.opciones,
    correctAnswer: q.respuestaCorrecta,
    explanation: q.explicacion,
    incorrectExplanations: q.explicacionIncorrectas || '',
    topic: q.specialty,
    category: q.modulo,
    tags: q.tags,
    eunacomCode: q.eunacomCode,
    fuente: q.fuente,
    videoUrl: q.videoRecomendado || undefined,
  }
}
