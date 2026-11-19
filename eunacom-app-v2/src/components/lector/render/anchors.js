// Posiciones (caracteres) dentro del texto de un tema ↔ DOM.
// El texto es la suma de los nodos de texto del cuerpo, en orden, sin el texto de los SVG ni lo que el lector
// agrega (elementos con data-lw-ui). Es lo mismo que plainText(topic) en lib/lector/content.js.
// Las marcas (<mark data-lw="…">) parten nodos de texto pero no cambian el texto, así que las posiciones se mantienen.

const skipped = node => { const p = node.parentElement; return !p || !!p.closest('svg, [data-lw-ui]') }

/** Nodos de texto del cuerpo con su posición: [{ node, start, end }] */
export function textNodes(root) {
  const out = []
  if (!root) return out
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let at = 0
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (skipped(n)) continue
    const len = n.data.length
    out.push({ node: n, start: at, end: at + len })
    at += len
  }
  return out
}

export const bodyText = root => textNodes(root).map(x => x.node.data).join('')

const hidden = node => { const p = node.parentElement; return !p || p.offsetParent === null }

// Bloques del texto (celda, fila, párrafo…): el texto del tema no trae espacio entre ellos («Frecuencia cardíaca60 a 100»).
const BLOCKS = 'td,th,tr,li,p,div,h1,h2,h3,h4,h5,h6,dt,dd,figcaption,blockquote,section,pre,summary,details'
const isWord = c => !!c && /[\p{L}\p{N}]/u.test(c)

/** Texto visible entre dos posiciones, para mostrarlo (listas, nota): un espacio donde cambia el bloque y sin el texto
 *  oculto (respuestas sin revelar). Las posiciones no cambian: esto es solo lo que se lee. */
export function displayBetween(root, start, end, nodes = textNodes(root)) {
  let out = '', prev = null
  for (const { node, start: s, end: e } of nodes) {
    if (e <= start) continue
    if (s >= end) break
    if (hidden(node)) continue
    const blk = node.parentElement?.closest(BLOCKS) || null
    if (out && blk !== prev) out += ' '
    prev = blk
    out += node.data.slice(Math.max(0, start - s), Math.min(node.data.length, end - s))
  }
  return out.replace(/\s+/g, ' ').trim().slice(0, 400)
}

/** Selección (Range) → { start, end, text, rect } dentro de `root`, o null. Recorta los espacios de los extremos,
 *  completa las palabras cortadas en los bordes (un dedo rara vez cae justo) y no incluye texto oculto
 *  (respuestas sin revelar) en `text`. */
export function selectionOffsets(root, range) {
  if (!root || !range || range.collapsed) return null
  const nodes = textNodes(root)
  let start = -1, end = -1, raw = '', sawHidden = false, first = null, last = null
  for (const x of nodes) {
    const { node, start: s, end: e } = x
    if (!range.intersectsNode(node)) { if (start >= 0) break; continue }
    const a = node === range.startContainer ? s + range.startOffset : s
    const b = node === range.endContainer ? s + range.endOffset : e
    if (b <= a) continue
    if (hidden(node)) { if (start >= 0) sawHidden = true; continue }
    if (start < 0) { start = a; first = x }
    end = b; last = x
    raw += node.data.slice(a - s, b - s)
  }
  if (start < 0 || end <= start) return null
  const l = raw.length - raw.trimStart().length, r = raw.length - raw.trimEnd().length
  if (l + r >= raw.length) return null
  if (!sawHidden) {
    start += l; end -= r
    // palabras completas (dentro del mismo nodo de texto: no se cruza a la celda o al párrafo vecino)
    const fd = first.node.data, ld = last.node.data
    let i = start - first.start, j = end - last.start
    if (i >= 0 && i < fd.length) while (i > 0 && isWord(fd[i - 1]) && isWord(fd[i])) i--
    if (j > 0 && j <= ld.length) while (j < ld.length && isWord(ld[j]) && isWord(ld[j - 1])) j++
    start = first.start + i; end = last.start + j
  }
  if (end <= start) return null
  return { start, end, text: displayBetween(root, start, end, nodes), rect: range.getBoundingClientRect() }
}

/** Range del DOM para un tramo del texto (o null si ya no existe). */
export function rangeAt(root, start, end) {
  const nodes = textNodes(root)
  const a = nodes.find(x => x.end > start)
  const b = [...nodes].reverse().find(x => x.start < end)
  if (!a || !b) return null
  const r = document.createRange()
  r.setStart(a.node, Math.max(0, start - a.start))
  r.setEnd(b.node, Math.min(b.node.data.length, Math.max(0, end - b.start)))
  return r
}

/** Envuelve en <mark data-lw={kind}> los tramos pedidos: ranges = [{ start, end, cls, id?, note? }]. */
export function paint(root, ranges, kind) {
  if (!root || !ranges?.length) return
  const rs = [...ranges].filter(r => r.end > r.start).sort((a, b) => a.start - b.start)
  let ri = 0
  for (const { node, start, end } of textNodes(root)) {
    while (ri < rs.length && rs[ri].end <= start) ri++
    if (ri >= rs.length) break
    if (rs[ri].start >= end || !node.data.trim()) continue
    const frag = document.createDocumentFragment()
    let at = start
    for (let j = ri; j < rs.length && rs[j].start < end; j++) {
      const a = Math.max(rs[j].start, at), b = Math.min(rs[j].end, end)
      if (b <= a) continue
      if (a > at) frag.append(node.data.slice(at - start, a - start))
      const m = document.createElement('mark')
      m.dataset.lw = kind
      if (rs[j].cls) m.className = rs[j].cls
      if (rs[j].id) m.dataset.id = rs[j].id
      if (rs[j].note) m.dataset.note = '1'
      m.textContent = node.data.slice(a - start, b - start)
      frag.append(m)
      at = b
    }
    if (at === start) continue
    if (at < end) frag.append(node.data.slice(at - start))
    node.replaceWith(frag)
  }
}

/** Quita las marcas de un tipo (el texto queda igual). */
export function unpaint(root, kind) {
  if (!root) return
  const marks = root.querySelectorAll(`mark[data-lw="${kind}"]`)
  if (!marks.length) return
  marks.forEach(m => m.replaceWith(...m.childNodes))
  root.normalize()
}

/** Todas las apariciones de `q` (ya normalizada, mismo largo que el original) en el texto: [{ start, end }] */
export function findAll(text, q, max = 400) {
  const out = []
  if (!q) return out
  for (let at = text.indexOf(q); at >= 0 && out.length < max; at = text.indexOf(q, at + q.length)) out.push({ start: at, end: at + q.length })
  return out
}
