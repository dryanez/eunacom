// Genera el índice (tabla de contenidos) de cada PDF de libros a partir de los títulos (texto grande).
// Los PDF no traen marcadores, así que se deducen por tamaño de letra. Salida: public/libros-indice/<ruta con __>.json
// Uso: node scripts/build-book-index.mjs [BOOKS_DIST_DIR]
import * as lib from 'pdfjs-dist/legacy/build/pdf.mjs'
import fs from 'fs'
import path from 'path'
import { TOMOS, EXTRAS, RECONS } from '../api/_tienda.js'

const DIST = process.argv[2] || process.env.BOOKS_DIST_DIR || '/Users/felipeyanez/Documents/Archive/Apps/eunacom-fotos/books/dist'
const OUT = 'public/libros-indice'
fs.mkdirSync(OUT, { recursive: true })
const clean = s => s.replace(/\s+/g, ' ').replace(/(?:\b\p{Lu} ){3,}\p{Lu}\b/gu, m => m.replace(/ /g, '')).trim()
const isNum = s => /^\d{1,2}(\.\d{1,2})?\.?$/.test(s)

async function indexOf(file) {
  const doc = await lib.getDocument({ data: new Uint8Array(fs.readFileSync(file)), verbosity: 0 }).promise
  const pages = [], hist = {}
  for (let n = 1; n <= doc.numPages; n++) {
    const page = await doc.getPage(n)
    const vh = page.getViewport({ scale: 1 }).height
    const its = (await page.getTextContent()).items.filter(i => i.str.trim())
      .map(i => ({ s: i.str, h: Math.round(Math.abs(i.transform[3]) * 10) / 10, y: vh - i.transform[5], x: i.transform[4] }))
    for (const i of its) hist[Math.round(i.h)] = (hist[Math.round(i.h)] || 0) + i.s.length
    // líneas: mismo tamaño y misma altura
    const lines = []
    for (const it of its) {
      const l = lines.find(l => Math.abs(l.y - it.y) < it.h * 0.6 && Math.abs(l.h - it.h) < 1)
      l ? (l.s += ' ' + it.s) : lines.push({ ...it })
    }
    pages.push(lines.map(l => ({ ...l, s: clean(l.s) })).filter(l => l.s))
  }
  const body = +Object.entries(hist).sort((a, b) => b[1] - a[1])[0][0]
  const min = body * 1.45
  // portada y páginas previas al índice impreso (si existe) no cuentan
  const tocPage = pages.findIndex((ls, i) => i < 12 && ls.some(l => l.h >= min && /^[ÍI]ndice/i.test(l.s)))
  const startAt = Math.max(1, tocPage + 1)
  const cands = []
  pages.forEach((ls, i) => {
    if (i < startAt || ls.some(l => /^[ÍI]ndice/i.test(l.s))) return
    const heads = ls.filter(l => l.h >= min)
    if (!heads.length) return
    const top = Math.max(...heads.map(l => l.h))
    const big = heads.filter(l => l.h === top).sort((a, b) => a.y - b.y)
    // títulos de varias líneas se juntan; número suelto (01, 1.1) → se le suma el título de al lado/abajo
    const groups = []
    for (const l of big) {
      const prev = groups[groups.length - 1]
      if (prev && !prev.isNum && !isNum(l.s) && Math.abs(l.x - prev.x) < 40 && l.y - prev.y2 < l.h * 1.8) { prev.t += ' ' + l.s; prev.y2 = l.y; continue }
      groups.push({ t: l.s, y2: l.y, x: l.x, h: l.h, isNum: isNum(l.s) })
    }
    for (const g of groups.filter(g => g.isNum)) {
      const near = ls.filter(x => !isNum(x.s) && x.h >= body * 1.45 && x.h < g.h && !/^[★\s]+$/.test(x.s) && x.y > g.y2 - g.h && x.y - g.y2 < g.h * 4 && Math.abs(x.x - g.x) < 260)
        .sort((a, b) => b.h - a.h || a.y - b.y)
      // atlas: el número va a la izquierda y el nombre de la imagen más abajo a la derecha
      if (!near[0]) near.push(...ls.filter(x => !isNum(x.s) && x.h >= body * 1.6 && x.h < g.h && x.y > g.y2 && x.y - g.y2 < 260).sort((a, b) => a.y - b.y))
      if (!near[0]) continue
      const lines = ls.filter(x => x.h === near[0].h && Math.abs(x.x - near[0].x) < 40 && x.y >= near[0].y && x.y - near[0].y < near[0].h * 3.2).sort((a, b) => a.y - b.y)
      g.t = `${g.t.replace(/\.$/, '')} · ${lines.map(x => x.s).join(' ')}`
    }
    // una entrada por página, salvo listas numeradas (atlas: varias imágenes por página)
    if (!(groups.length > 1 && groups.every(g => g.isNum))) groups.splice(1)
    if (groups[0]?.isNum && !groups[0].t.includes('·')) groups.splice(0)
    for (const g of groups) cands.push({ p: i + 1, t: g.t.slice(0, 120), h: g.h })
  })
  // quitar repeticiones (encabezados que se repiten página a página)
  const key = t => (t.match(/^\d+(\.\d+)?/) || [t])[0] + '|' + t.slice(0, 25)
  const out = []
  for (const c of cands) {
    const last = out.findLast(o => o.h === c.h)
    if (last && (key(last.t) === key(c.t) || /^\d+\.\d+/.test(c.t) && last.t.match(/^\d+\.\d+/)?.[0] === c.t.match(/^\d+\.\d+/)?.[0])) continue
    out.push(c)
  }
  const sizes = [...new Set(out.map(o => o.h))].sort((a, b) => b - a)
  const count = h => out.filter(o => o.h === h).length
  // nivel 1 = tamaños más grandes y escasos; nivel 2 = el resto
  const l1 = sizes.length > 1 && count(sizes[0]) * 3 <= out.length ? sizes[0] : null
  return { pages: doc.numPages, toc: out.map(o => ({ p: o.p, t: o.t, l: o.h === l1 ? 1 : 2 })) }
}

const files = [...TOMOS, ...EXTRAS, ...RECONS].flatMap(x => x.files ? x.files.map(f => f.file) : x.file ? [x.file] : [])
let n = 0
for (const f of [...new Set(files)]) {
  const abs = path.join(DIST, f)
  if (!fs.existsSync(abs)) { console.log('falta', f); continue }
  const idx = await indexOf(abs)
  fs.writeFileSync(path.join(OUT, f.replace(/\//g, '__') + '.json'), JSON.stringify(idx))
  n++
  if (process.env.VERBOSE) console.log(`\n== ${f} (${idx.toc.length})\n` + idx.toc.slice(0, 14).map(e => `${e.l === 1 ? '' : '   '}${e.p} ${e.t}`).join('\n'))
}
console.log(`${n} índices en ${OUT}`)
