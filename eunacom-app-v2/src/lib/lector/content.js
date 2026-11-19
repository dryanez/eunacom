// Lector web: contenido de los libros (por tema, no por página).
// Registro de «tipos» de libro con edición web (hoy: `tomo`; después `atlas`, `repaso`, `perfil`).
// Cada tipo dice a qué archivos aplica, cómo se carga su JSON y qué componente lo muestra.
import { fetchBookRead } from '../api'
import { itemFiles, TOMOS, EXTRAS, RECONS, RECON_JUL2026, SINGLES, COLLECTIONS } from '../../config/tienda'
import { fileCover } from '../../config/covers'

/* ───────── registro de tipos ─────────
   registerKind({
     id: 'atlas',
     match: (file, item, fileIdx) => bool,              // file = ruta dentro de books/dist (p. ej. '01_Tomos/…pdf')
     load: async (user, item, fileIdx) => json,         // contenido (se guarda en memoria)
     views: { mobile: () => import('…'), desktop: () => import('…') }  // módulos con `export default` (desktop opcional)
   })
   La vista recibe { item, fileIdx, title, book, bookKey, user, onClose, onOpenPdf(page?) }. */
const KINDS = []
export function registerKind(def) {
  if (!def?.id || typeof def.match !== 'function') throw new Error('registerKind: faltan id o match')
  const i = KINDS.findIndex(k => k.id === def.id)
  if (i >= 0) KINDS[i] = def; else KINDS.push(def)
  return def
}
export const listKinds = () => KINDS.slice()
export const bookFile = (item, fileIdx = 0) => itemFiles(item)[Number(fileIdx) || 0] || null
export function bookKind(item, fileIdx = 0) {
  const f = bookFile(item, fileIdx)
  if (!f) return null
  return KINDS.find(k => { try { return !!k.match(f.file, item, Number(fileIdx) || 0) } catch { return false } }) || null
}
export const hasWebEdition = (item, fileIdx = 0) => !!bookKind(item, fileIdx)
export const bookKey = (item, fileIdx = 0) => `${item}:${Number(fileIdx) || 0}`
/** Portada del libro, la misma del estante: por archivo en las colecciones (Atlas, Repaso, Perfil, Libros Gordos)
 *  y en los libros sueltos. `fileIdx` es opcional (sin él, el primer archivo). */
export function bookCover(item, fileIdx = 0) {
  const t = TOMOS.find(x => x.sku === item) || RECONS.find(x => x.sku === item) || (item === RECON_JUL2026.sku ? RECON_JUL2026 : null)
  if (t) return t.cover || null
  const x = EXTRAS.find(e => e.sku === item)
  if (x) {
    const f = x.files?.[Number(fileIdx) || 0]
    return f ? fileCover(x.sku, f.label, x.cover) : x.cover || null
  }
  const single = SINGLES.find(e => e.sku === item)
  if (single) return fileCover(single.collection, single.label, COLLECTIONS.find(c => c.sku === single.collection)?.cover || null)
  return null
}

/* ───────── carga (con memoria) ───────── */
const cache = new Map() // `${userId}|${bookKey}` → Promise<book>
export function loadBook(user, item, fileIdx = 0) {
  const kind = bookKind(item, fileIdx)
  if (!kind) return Promise.reject(Object.assign(new Error('Este libro no tiene edición web'), { status: 404 }))
  if (!user?.id) return Promise.reject(Object.assign(new Error('Sin sesión'), { status: 401 }))
  const key = `${user.id}|${bookKey(item, fileIdx)}`
  if (!cache.has(key)) {
    cache.set(key, Promise.resolve(kind.load(user, item, Number(fileIdx) || 0)).then(book => {
      book.kind = kind.id
      book.bookKey = bookKey(item, fileIdx)
      return book
    }).catch(err => { cache.delete(key); throw err }))
  }
  return cache.get(key)
}
export const errorStatus = err => err?.status || Number((String(err?.message || '').match(/\b(401|403|404|5\d\d)\b/) || [])[1]) || 0

// Tomos: JSON de build_movil.cjs por link temporal (book_read&mode=movil)
async function loadTomo(user, item, fileIdx) {
  const { url } = await fetchBookRead(user.id, item, fileIdx, 'movil')
  const r = await fetch(url)
  if (!r.ok) throw Object.assign(new Error(String(r.status)), { status: r.status })
  return r.json()
}
registerKind({
  id: 'tomo',
  match: file => /^01_Tomos\/.+\.pdf$/.test(file),
  load: loadTomo,
  views: {
    mobile: () => import('../../components/lector/mobile/index.jsx'),
    desktop: () => import('../../components/lector/desktop/index.jsx'),
  },
})

/* ───────── temas ───────── */
const flat = new WeakMap()
/** Temas del libro en orden: [{ ...topic, index, block: { n, name } }] (misma lista en cada llamada). */
export function flatTopics(book) {
  if (!book) return []
  if (!flat.has(book)) {
    const list = []
    for (const b of book.blocks || []) for (const t of b.topics || []) list.push({ ...t, index: list.length, block: { n: b.n, name: b.name } })
    flat.set(book, list)
  }
  return flat.get(book)
}

const plain = new WeakMap()
const plainById = new Map()
/** Texto del tema tal como queda en pantalla (textContent, sin el texto de los SVG). Los destacados y el
 *  buscador usan posiciones (caracteres) dentro de este texto. */
export function plainText(topic) {
  if (!topic) return ''
  if (plain.has(topic)) return plain.get(topic)
  const html = String(topic.html || '')
  const idKey = `${html.length}|${topic.id}|${topic.title}`
  let text = plainById.get(idKey)
  if (text == null) {
    const tpl = document.createElement('template')
    tpl.innerHTML = html.replace(/<svg[\s\S]*?<\/svg>/gi, '').replace(/<img[^>]*>/gi, '')
    text = tpl.content.textContent || ''
    plainById.set(idKey, text)
  }
  plain.set(topic, text)
  return text
}

/** Códigos del Perfil V3 del tema (`.m-code`). */
export const topicCodes = topic => [...String(topic?.html || '').slice(0, 4000).matchAll(/class="m-code">([^<]+)</g)].map(m => m[1].trim())
/** Preguntas del tema (cantidad de `.m-q`). */
export const topicQuestionCount = topic => (String(topic?.html || '').match(/class="m-q"/g) || []).length

/* ───────── buscador ───────── */
// sin tildes ni mayúsculas, conservando el largo (las posiciones sirven para el texto original)
export const norm = s => String(s).replace(/[^\x00-\x7f]/g, c => c.normalize('NFD')[0]).toLowerCase()
const squash = s => s.replace(/\s+/g, ' ')
// Posiciones de plainText donde empieza otro bloque (celda, párrafo, ítem…). El texto no trae espacio ahí
// («AuricularFármaco»); los fragmentos del buscador lo ponen solo al mostrarse: las posiciones no cambian.
const BLOCKS = 'td,th,tr,li,p,div,h1,h2,h3,h4,h5,h6,dt,dd,figcaption,blockquote,section,pre,summary,details'
// Lo que no se ve hasta responder (la respuesta y su explicación) y los enlaces internos ocultos: el buscador no lo
// encuentra ni lo muestra en los fragmentos (plainText sigue igual: es la base de las posiciones de los destacados).
const HIDDEN = '.m-ans, .m-link'
const breaks = new WeakMap()
const hiddenRanges = new WeakMap()
function scan(topic) {
  if (breaks.has(topic)) return
  const out = [], hid = []
  try {
    const tpl = document.createElement('template')
    tpl.innerHTML = String(topic.html || '').replace(/<svg[\s\S]*?<\/svg>/gi, '').replace(/<img[^>]*>/gi, '') // igual que plainText
    const walker = document.createTreeWalker(tpl.content, NodeFilter.SHOW_TEXT)
    let pos = 0, prev
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const block = n.parentElement?.closest(BLOCKS) || null
      // el espacio entre etiquetas (saltos de línea entre celdas) no abre un bloque nuevo
      if (/\S/.test(n.data)) {
        if (pos > 0 && block !== prev && out[out.length - 1] !== pos) out.push(pos)
        prev = block
      }
      if (n.parentElement?.closest(HIDDEN)) {
        const last = hid[hid.length - 1]
        if (last && last[1] === pos) last[1] = pos + n.data.length; else hid.push([pos, pos + n.data.length])
      }
      pos += n.data.length
    }
    if (pos !== plainText(topic).length) { out.length = 0; hid.length = 0; hid.push([0, plainText(topic).length]) } // no calza: mejor no mostrar nada dudoso
  } catch { out.length = 0 }
  breaks.set(topic, out)
  hiddenRanges.set(topic, hid)
}
function blockBreaks(topic) { scan(topic); return breaks.get(topic) }
/** Tramos [inicio, fin) de plainText que no se ven hasta responder (respuestas y explicaciones). */
export function hiddenText(topic) { if (!topic) return []; scan(topic); return hiddenRanges.get(topic) }
const blank = (txt, ranges, ch) => {
  if (!ranges.length) return txt
  let out = '', at = 0
  for (const [a, b] of ranges) { out += txt.slice(at, a) + ch.repeat(Math.max(0, b - a)); at = b }
  return out + txt.slice(at)
}
/** Texto de un tramo del tema para mostrarlo (listas de destacados): con espacio entre celdas y párrafos.
 *  null si el tramo toca texto que solo se ve después de responder (entonces se usa el texto guardado). */
export function topicTextBetween(topic, start, end) {
  if (!topic || !(end > start)) return null
  if (hiddenText(topic).some(([a, b]) => a < end && b > start)) return null
  return squash(spaced(topic, plainText(topic), start, end)).trim().slice(0, 400) || null
}
/** txt[from, to) para mostrar: con un espacio (o `sep`) donde cambia el bloque. */
function spaced(topic, txt, from, to, sep = ' ') {
  let out = '', last = from
  for (const b of blockBreaks(topic)) {
    if (b < from || b === 0) continue
    if (b > to) break
    out += txt.slice(last, b)
    if (b < to || to < txt.length) out += sep
    last = b
  }
  return out + txt.slice(last, to)
}
// fragmentos del buscador: celdas y párrafos separados con « · » (no se leen pegados como una sola frase)
const SEP = ' \u00b7 '
const tidySep = s => s.replace(/(\s*\u00b7\s*){2,}/g, SEP)
const tidyPre = s => tidySep(s).replace(/^\s*\u00b7\s*/, '') // nunca empieza con « · »; antes de lo buscado sí puede ir
const tidyPost = s => tidySep(s).replace(/\s*\u00b7\s*$/, '')
const index = new WeakMap()
function searchIndex(book) {
  // n: texto normalizado sin lo oculto (cambiado por \u0001: mismo largo, nunca coincide); vis: texto para los fragmentos
  if (!index.has(book)) index.set(book, flatTopics(book).map(t => ({ n: blank(norm(plainText(t)), hiddenText(t), '\u0001'), vis: blank(plainText(t), hiddenText(t), ' '), title: norm(t.title) })))
  return index.get(book)
}
/** Busca en todo el libro. → [{ topic, count, inTitle, hits: [{ start, end, pre, match, post }] }] (hasta `perTopic` fragmentos por tema). */
export function searchBook(book, query, { perTopic = 3 } = {}) {
  const q = norm(String(query || '').trim())
  if (q.length < 2 || !book) return []
  const topics = flatTopics(book), idx = searchIndex(book), out = []
  topics.forEach((topic, i) => {
    const { n, vis: txt, title } = idx[i]
    const hits = []
    let count = 0
    for (let at = n.indexOf(q); at >= 0; at = n.indexOf(q, at + q.length)) {
      count++
      if (hits.length < perTopic) {
        hits.push({
          start: at, end: at + q.length,
          pre: tidyPre(squash(spaced(topic, txt, Math.max(0, at - 48), at, SEP)).replace(/^\S*\s/, '')),
          match: txt.slice(at, at + q.length),
          post: tidyPost(squash(spaced(topic, txt, at + q.length, Math.min(txt.length, at + q.length + 72), SEP)).replace(/\s\S*$/, '')),
        })
      }
    }
    const inTitle = title.includes(q)
    if (count || inTitle) out.push({ topic, count, inTitle, hits })
  })
  return out.sort((a, b) => (b.inTitle - a.inTitle) || (b.count - a.count) || (a.topic.index - b.topic.index))
}

/* ───────── página del PDF original ─────────
   public/libros-indice/<ruta con __>.json (scripts/build-book-index.mjs): entradas «1.1. Título» → página. */
const pageMaps = new Map()
export function loadPageMap(item, fileIdx = 0) {
  const file = bookFile(item, fileIdx)?.file
  if (!file) return Promise.resolve({})
  if (!pageMaps.has(file)) {
    pageMaps.set(file, fetch(`/libros-indice/${file.split('/').map(encodeURIComponent).join('__')}.json`)
      .then(r => (r.ok ? r.json() : null))
      .then(j => {
        const map = {}
        for (const e of j?.toc || []) {
          const m = String(e.t || '').match(/^(\d{1,2}\.\d{1,2})\.?\s/)
          if (m && !(m[1] in map)) map[m[1]] = e.p
        }
        return map
      }).catch(() => ({})))
  }
  return pageMaps.get(file)
}

/* ───────── «Ver la clase» ─────────
   El contenido ya trae el enlace del tema a su clase V3: <p class="m-link"><a href="/clase/<id>">. La ruta real
   en la app es /mis-clases/<especialidad>/<id>; la especialidad sale de /data/clases-v3/index.json. */
export const topicClassId = topic => (String(topic?.html || '').match(/class="m-link"><a href="\/clase\/([\w-]+)"/) || [])[1] || null
let classRoutes = null
/** → Map(idClase → '/mis-clases/<spec>/<id>') con las clases que existen hoy. */
export function loadClassRoutes() {
  if (!classRoutes) {
    classRoutes = fetch('/data/clases-v3/index.json').then(r => (r.ok ? r.json() : null)).then(j => {
      const map = new Map()
      for (const m of j?.modules || []) for (const s of m.specialties || []) for (const b of s.blocks || []) for (const id of b.ids || []) map.set(id, `/mis-clases/${s.key}/${id}`)
      return map
    }).catch(() => { classRoutes = null; return new Map() })
  }
  return classRoutes
}
