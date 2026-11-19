// Lector web · «Red de temas»: términos médicos enlazados entre libros, clases y su explicación.
// Datos (los arma RED-GEN, formato v2), pedidos con red_read en api/_books.js:
//   movil/_red/index.json — { v:2, generated, terms:[{ id, name, code, spec, scope?, tambien? }], match:[[frase, id]], books?:{ loc: spec } }:
//     se pide una sola vez, cuando algún texto lo necesita, y queda en memoria (loadRed).
//   movil/_red/t/<spec>.json — { [termId]: { explica[], clases[], libros[], aliases[] } }: lo que muestra la tarjeta; se pide
//     al abrir la primera tarjeta de un término de esa especialidad y queda en memoria (loadDetails / useTermDetails).
//
// linkTerms(body, red, ctx) envuelve en <span class="lw-term" data-term> los tramos de los nodos de texto que
// coinciden con un término. NO cambia el texto: las posiciones de destacados, buscador y respuestas ocultas siguen igual.
import { useEffect, useState } from 'react'
import { apiFetch } from '../api'
import { norm } from './content'
import { COLLECTIONS, EXTRAS, SINGLES, TOMOS, itemFiles } from '../../config/tienda'

/* ───────── carga ───────── */
const RETRY_MS = 60_000
const SPEC_RE = /^[a-z0-9-]{1,40}$/
async function readRed(userId, file) {
  const { url } = await apiFetch(`/api/user-profiles?action=red_read&file=${encodeURIComponent(file)}&userId=${encodeURIComponent(userId)}`)
  const r = await fetch(url)
  if (!r.ok) throw new Error(String(r.status))
  return r.json()
}

let red = null
let pending = null
let failedAt = 0
/** El índice (términos y frases) → Promise<red | null>. Sin sesión, sin libros o con error: null (el lector sigue igual, sin enlaces). */
export function loadRed(userId) {
  if (red) return Promise.resolve(red)
  if (!userId || Date.now() - failedAt < RETRY_MS) return Promise.resolve(null)
  if (!pending) {
    pending = readRed(userId, 'index').then(j => {
      const r = buildRed(j)
      if (!r.terms.size) throw new Error('vacío')
      red = r
      return red
    }).catch(() => { failedAt = Date.now(); return null }).finally(() => { pending = null })
  }
  return pending
}
/** La red ya cargada (o null). */
export const getRed = () => red

/** useRed(userId, enabled) → red | null. Se carga la primera vez que algún texto la necesita. */
export function useRed(userId, enabled = true) {
  const [r, setR] = useState(red)
  useEffect(() => {
    if (!enabled || r) return undefined
    let live = true
    loadRed(userId).then(x => { if (live && x) setR(x) })
    return () => { live = false }
  }, [userId, enabled, r])
  return enabled ? r : null
}

// detalle de las tarjetas, por especialidad: spec → Map(termId → { explica, clases, libros })
const details = new Map()
const detailPending = new Map()
const detailFailed = new Map()
/** Lo que muestra la tarjeta de los términos de una especialidad → Promise<Map | null>. */
export function loadDetails(userId, spec) {
  if (details.has(spec)) return Promise.resolve(details.get(spec))
  if (!userId || !SPEC_RE.test(String(spec || '')) || Date.now() - (detailFailed.get(spec) || 0) < 5_000) return Promise.resolve(null)
  if (!detailPending.has(spec)) {
    detailPending.set(spec, readRed(userId, `t/${spec}`).then(j => {
      const m = new Map()
      for (const [id, d] of Object.entries(j && typeof j === 'object' ? j : {})) m.set(id, cleanDetail(d))
      details.set(spec, m)
      return m
    }).catch(() => { detailFailed.set(spec, Date.now()); return null }).finally(() => { detailPending.delete(spec) }))
  }
  return detailPending.get(spec)
}
const NO_DETAIL = Object.freeze({ explica: [], clases: [], libros: [] })
/** useTermDetails(userId, term) → { status: 'loading' | 'ok' | 'error', d: { explica, clases, libros } } */
export function useTermDetails(userId, term) {
  const spec = term?.spec || ''
  const get = () => {
    const m = details.get(spec)
    if (m) return { status: 'ok', d: m.get(term.id) || NO_DETAIL }
    return { status: SPEC_RE.test(spec) ? 'loading' : 'error', d: NO_DETAIL }
  }
  const [st, setSt] = useState(get)
  const [retry, setRetry] = useState(0)
  useEffect(() => {
    if (!term) return undefined
    const now = get()
    setSt(now)
    if (now.status !== 'loading') return undefined
    let live = true
    loadDetails(userId, spec).then(m => { if (live) setSt(m ? { status: 'ok', d: m.get(term.id) || NO_DETAIL } : { status: 'error', d: NO_DETAIL }) })
    return () => { live = false }
  }, [userId, term?.id, retry]) // eslint-disable-line react-hooks/exhaustive-deps
  return { ...st, retry: () => { detailFailed.delete(spec); setRetry(n => n + 1) } }
}

/* ───────── normalización ───────── */
const SP = /[\s ]+/g
const phrase = s => norm(String(s || '')).replace(SP, ' ').trim()
const isStr = v => typeof v === 'string' && v.trim().length > 0
const KINDS = ['tomo', 'repaso', 'atlas', 'perfil']

/** Ubicación canónica de un libro: los libros sueltos (repaso-endocrinologia…) → su colección y archivo ('repasos:4'). */
export function canonLoc(item, fileIdx = 0) {
  const s = SINGLES.find(x => x.sku === item)
  if (s) {
    const i = itemFiles(s.collection).findIndex(f => f.file === s.file)
    if (i >= 0) return `${s.collection}:${i}`
  }
  return `${item}:${Number(fileIdx) || 0}`
}

function cleanLibro(l) {
  if (!l || !KINDS.includes(l.kind) || !isStr(l.item) || !isStr(l.topicId)) return null
  const fileIdx = Number(l.fileIdx) || 0
  if (!itemFiles(l.item)[fileIdx]) return null
  return { kind: l.kind, item: l.item, fileIdx, topicId: l.topicId, caseId: isStr(l.caseId) ? l.caseId : null,
    label: isStr(l.label) ? l.label : '', title: isStr(l.title) ? l.title : '' }
}
function cleanDetail(d) {
  return {
    explica: (Array.isArray(d?.explica) ? d.explica : []).filter(isStr).slice(0, 2),
    clases: (Array.isArray(d?.clases) ? d.clases : []).filter(c => c && isStr(c.id) && isStr(c.route) && c.route.startsWith('/')),
    libros: (Array.isArray(d?.libros) ? d.libros : []).map(cleanLibro).filter(Boolean),
  }
}

const codePrefix = code => (/^\d+\.\d+\./.test(code || '') ? code.split('.').slice(0, 2).join('.') : '')
/** Especialidad del código de un término (la de su grupo de códigos del Perfil). */
export const codeSpec = (r, term) => r?.prefixSpec.get(codePrefix(term?.code)) || term?.spec || ''

const STOP = '\u0000stop' // id de los topes en el árbol de frases
/** Índice v2 → red: términos, árbol de frases y búsquedas por código / «también». */
export function buildRed(json) {
  const terms = new Map()
  for (const t of Array.isArray(json?.terms) ? json.terms : []) {
    if (!t || !isStr(t.id) || !isStr(t.name)) continue
    terms.set(t.id, {
      id: t.id, name: t.name.trim(), code: isStr(t.code) ? t.code : '', spec: isStr(t.spec) ? t.spec : '',
      scope: isStr(t.scope) ? t.scope : '', tambien: (Array.isArray(t.tambien) ? t.tambien : []).filter(isStr),
    })
  }
  // id null = tope: la frase se consume como la coincidencia más larga y no se enlaza nada dentro de ella
  // («colangitis esclerosante primaria» no es «colangitis»)
  const pairs = Array.isArray(json?.match) ? json.match.filter(m => Array.isArray(m) && isStr(m[0]) && (m[1] === null || terms.has(m[1]))) : []
  const trie = { c: new Map(), id: undefined }
  for (const [p, id] of pairs) {
    const n = phrase(p)
    if (n.length < 3) continue
    let node = trie
    for (const ch of n) {
      let next = node.c.get(ch)
      if (!next) { next = { c: new Map(), id: undefined }; node.c.set(ch, next) }
      node = next
    }
    if (node.id === undefined) node.id = id === null ? STOP : id // la primera gana (el archivo va del más largo al más corto)
  }
  const byCode = new Map(), byName = new Map(), parents = new Map() // parents: id → términos que lo tienen en «también»
  const add = (map, k, id) => { if (!map.has(k)) map.set(k, new Set()); map.get(k).add(id) }
  for (const t of terms.values()) {
    if (t.code) add(byCode, t.code, t.id)
    add(byName, phrase(t.name), t.id)
    for (const x of t.tambien) add(parents, x, t.id)
  }
  // especialidad de cada grupo de códigos («1.01» → la especialidad más común de sus términos): la tarjeta pone primero
  // las clases de la especialidad del propio código
  const pv = new Map()
  for (const t of terms.values()) {
    const k = codePrefix(t.code)
    if (!k || !t.spec) continue
    if (!pv.has(k)) pv.set(k, new Map())
    pv.get(k).set(t.spec, (pv.get(k).get(t.spec) || 0) + 1)
  }
  const prefixSpec = new Map([...pv].map(([k, v]) => [k, [...v.entries()].sort((a, b) => b[1] - a[1])[0][0]]))
  // especialidad de cada libro, si el índice la trae ({ 'tomo-1:0': 'cardiologia', … }); si no, se calcula (bookSpec)
  const books = new Map(Object.entries(json?.books && typeof json.books === 'object' ? json.books : {}).filter(([k, v]) => isStr(k) && SPEC_RE.test(String(v))))
  return { v: json?.v || 0, generated: json?.generated || '', terms, trie, byCode, byName, parents, prefixSpec, books, phrases: pairs.length, stops: pairs.filter(m => m[1] === null).length }
}

/* ───────── búsqueda en el texto ───────── */
const isWordCode = c => (c >= 97 && c <= 122) || (c >= 48 && c <= 57) || (c >= 65 && c <= 90) || (c > 127 && /[\p{L}\p{N}]/u.test(String.fromCharCode(c)))
// Separan palabras dentro de una frase: espacios y guiones/barras («Graves-Basedow» = «graves basedow», como en el índice).
// Comas, puntos, paréntesis… cortan la frase.
const isSpaceCode = c => c === 32 || c === 10 || c === 9 || c === 13 || c === 160 || c === 45 || c === 47 || c === 8208 || c === 8209 || c === 8211

/** Términos en un texto (ya normalizado con norm: mismo largo que el original). → [{ start, end, id }], sin solaparse,
 *  el más largo primero, solo palabras completas. id null = tope (frase que no se enlaza ni por partes). */
export function findTerms(r, n) {
  const out = []
  const root = r.trie.c
  const len = n.length
  for (let i = 0; i < len; i++) {
    if (i > 0 && isWordCode(n.charCodeAt(i - 1))) continue
    let node = root.get(n[i])
    if (!node) continue
    let j = i + 1, best = null
    if (node.id !== undefined && (j >= len || !isWordCode(n.charCodeAt(j)))) best = { end: j, id: node.id }
    while (j < len) {
      const c = n.charCodeAt(j)
      let next
      if (isSpaceCode(c)) {
        next = node.c.get(' ')
        if (!next) break
        while (j < len && isSpaceCode(n.charCodeAt(j))) j++
      } else {
        next = node.c.get(n[j])
        if (!next) break
        j++
      }
      node = next
      if (node.id !== undefined && (j >= len || !isWordCode(n.charCodeAt(j)))) best = { end: j, id: node.id }
    }
    if (best) { out.push({ start: i, end: best.end, id: best.id === STOP ? null : best.id }); i = best.end - 1 }
  }
  return out
}

/* ───────── enlaces en el DOM ───────── */
// Donde nunca va un enlace: títulos, encabezados de tabla, las preguntas enteras (enunciado, alternativas y respuesta:
// la tarjeta explica el término y podría dar la respuesta), metadatos (códigos, niveles, frecuencia, GES, la lista de
// códigos del Repaso, prioridad), enlaces internos, algoritmos y fotos, «Dónde se enseña» del Perfil, en el Atlas el
// diagnóstico (es el término de la ficha), la pregunta real y su respuesta y el crédito de la imagen, el plan por días
// del Repaso (lista de temas) y lo que agrega el lector.
const SKIP = [
  'h1,h2,h3,h4,h5,h6,th,thead,.m-tbl-h',
  '.m-q,.m-opts,.m-ans,.m-q-h',
  '.m-meta,.m-code,.m-lvl,.m-frec,.m-ges,.m-link',
  '.m-algo-h,.m-algo,.m-algo-b,.m-figs-h,.m-fig,figcaption',
  '.r-code-n,.r-prio,.r-ges,.r-day',
  '.a-dx-t,.a-real,.a-ans,.a-cred',
  '.p-donde',
  'svg,a,button,mark,.lw-term,[data-lw-ui]',
].join(',')
// Como mucho tantos enlaces por párrafo / ítem / celda (las listas de exámenes se llenaban de enlaces); un término que
// no cupo se puede enlazar más abajo.
const MAX_PER_BLOCK = 3
const BLOCK = 'p,li,td,dd,dt,blockquote,summary'

// especialidad de cada libro (la de los códigos del Perfil de sus temas), una vez por libro
const bookSpecs = new WeakMap()
const CODE_RE = /class="m-code">([^<]+)</g
function bookSpec(r, book) {
  if (!book || typeof book !== 'object') return ''
  if (bookSpecs.has(book)) return bookSpecs.get(book)
  const votes = new Map()
  let total = 0
  const walk = (x, depth) => {
    if (!x || depth > 6) return
    if (Array.isArray(x)) { for (const y of x) walk(y, depth + 1); return }
    if (typeof x !== 'object') return
    if (typeof x.html === 'string') {
      for (const m of x.html.matchAll(CODE_RE)) {
        for (const id of r.byCode.get(m[1].trim()) || []) {
          const t = r.terms.get(id), sp = t?.scope || t?.spec
          if (sp) { votes.set(sp, (votes.get(sp) || 0) + 1); total++ }
        }
      }
    }
    for (const k of ['blocks', 'topics', 'cases', 'extras', 'sections']) if (x[k]) walk(x[k], depth + 1)
  }
  walk(book, 0)
  const best = [...votes.entries()].sort((a, b) => b[1] - a[1])[0]
  const sp = best && best[1] / total >= 0.25 ? best[0] : ''
  bookSpecs.set(book, sp)
  return sp
}

const metaCodes = topic => [...String(topic?.html || '').slice(0, 6000).matchAll(CODE_RE)].map(m => m[1].trim())

/** Contexto de un tema: { skip, spec }. skip = sus propios términos, que no se enlazan: los de los códigos del Perfil del
 *  tema (`.m-code`, `topic.code`), los que nombra su título, y sus «también» en las dos direcciones (el canónico de un código
 *  «también» y los otros códigos con ese mismo nombre). spec = especialidad del libro (o, en el Perfil completo, la del
 *  código), para la regla de contexto. */
export function contextFor(r, bookKey, topic, book = null) {
  const skip = new Set()
  if (!r || !topic) return { skip, spec: '' }
  const [item, idx] = String(bookKey || '').split(':')
  const loc = canonLoc(item, idx)
  for (const code of [...metaCodes(topic), topic.code].filter(Boolean)) for (const id of r.byCode.get(code) || []) skip.add(id)
  for (const id of r.byName.get(phrase(topic.title)) || []) skip.add(id)
  for (const m of findTerms(r, norm(String(topic.title || '')))) if (m.id) skip.add(m.id)
  let spec = loc === 'perfil-v3:0' ? '' : r.books.get(loc) || bookSpec(r, book)
  if (!spec) for (const id of skip) { const t = r.terms.get(id); if (t?.scope || t?.spec) { spec = t.scope || t.spec; break } }
  // «también» en las dos direcciones: los del término propio y el canónico (con sus otros «también») de un código propio
  for (const id of [...skip]) {
    for (const x of r.terms.get(id)?.tambien || []) skip.add(x)
    for (const p of r.parents.get(id) || []) { skip.add(p); for (const x of r.terms.get(p)?.tambien || []) skip.add(x) }
  }
  return { skip, spec }
}

/** Regla de contexto (README de _red): en un libro de especialidad `spec`, un término con un «también» de esa
 *  especialidad se enlaza a ese; uno con `scope` (pediatría, geriatría) solo en libros de su especialidad. → id o null */
export function resolveTerm(r, id, spec) {
  let t = r.terms.get(id)
  if (!t) return null
  if (spec && t.spec !== spec && t.tambien.length) {
    const alt = t.tambien.map(x => r.terms.get(x)).find(x => x?.spec === spec)
    if (alt) t = alt
  }
  if (t.scope && t.scope !== spec) return null
  return t.id
}

/** Envuelve la primera aparición de cada término. ctx = contextFor(…). → { links, ms } */
export function linkTerms(body, r, ctx = {}) {
  const t0 = performance.now()
  if (!body || !r) return { links: 0, ms: 0 }
  const skip = ctx.skip || new Set(), spec = ctx.spec || ''
  const seen = new Set(skip)
  const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT)
  const todo = [] // [{ node, ms: [{ start, end, id }] }] en orden del documento
  const perBlock = new Map()
  let lastParent = null, lastSkip = false
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (n.data.length < 4) continue
    const p = n.parentElement
    if (p !== lastParent) { lastParent = p; lastSkip = !p || !!p.closest(SKIP) }
    if (lastSkip) continue
    const found = findTerms(r, norm(n.data))
    if (!found.length) continue
    const ms = []
    const block = p.closest(BLOCK) || p
    let used = perBlock.get(block) || 0
    for (const m of found) {
      if (used >= MAX_PER_BLOCK) break
      if (!m.id || skip.has(m.id)) continue // tope: se consumió y no se enlaza
      const id = resolveTerm(r, m.id, spec)
      if (!id || skip.has(id) || seen.has(id) || seen.has(m.id)) continue
      seen.add(id); seen.add(m.id)
      ms.push({ ...m, id })
      used++
    }
    perBlock.set(block, used)
    if (ms.length) todo.push({ node: n, ms })
  }
  let links = 0
  for (const { node, ms } of todo) {
    // de atrás hacia adelante: las posiciones del resto del nodo no cambian
    for (let k = ms.length - 1; k >= 0; k--) {
      const m = ms[k]
      const mid = node.splitText(m.start)
      mid.splitText(m.end - m.start)
      const span = document.createElement('span')
      span.className = 'lw-term'
      span.dataset.term = m.id
      span.setAttribute('role', 'button')
      span.tabIndex = 0
      mid.replaceWith(span)
      span.appendChild(mid)
      links++
    }
  }
  return { links, ms: performance.now() - t0 }
}

/** Quita los enlaces (el texto queda igual). */
export function unlinkTerms(body) {
  if (!body) return
  const spans = body.querySelectorAll('span.lw-term')
  if (!spans.length) return
  spans.forEach(s => s.replaceWith(...s.childNodes))
  body.normalize()
}

/* ───────── libros del usuario ───────── */
/** ¿Con qué ítem del usuario se abre esta ubicación? → { item, fileIdx } o null si no lo tiene. */
export function ownedTarget(l, owned) {
  if (!l || !owned) return null
  if (owned.has(l.item)) return { item: l.item, fileIdx: l.fileIdx }
  const file = itemFiles(l.item)[l.fileIdx]?.file
  const single = file && SINGLES.find(s => s.collection === l.item && s.file === file)
  if (single && owned.has(single.sku)) return { item: single.sku, fileIdx: 0 }
  return null
}

/** Nombre del libro para el encabezado del lector y la tarjeta. */
export function bookTitle(item, fileIdx = 0) {
  const t = TOMOS.find(x => x.sku === item)
  if (t) return `Tomo ${t.n} · ${t.name}`
  const single = SINGLES.find(x => x.sku === item)
  if (single) return single.name
  const col = COLLECTIONS.find(c => c.sku === item)
  if (col) {
    const file = itemFiles(item)[Number(fileIdx) || 0]?.file
    const s = SINGLES.find(x => x.collection === item && x.file === file)
    if (s) return s.name
  }
  const x = EXTRAS.find(e => e.sku === item)
  return x?.files?.[Number(fileIdx) || 0]?.label || x?.name || item
}
