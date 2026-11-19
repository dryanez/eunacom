// Lector web: lo que es del usuario (avance, destacados, notas, marcadores, tarjetas, respuestas, preferencias).
// Vive en localStorage `lw:<userId>`; se sincroniza con el servidor si se puede (reader_get / reader_put en
// api/_books.js, tabla book_reader_data). La sincronización nunca bloquea ni muestra errores: sin red, todo sigue igual.
//
// Forma:
// { v: 1,
//   progress:  { [bookKey]: { topicId, scroll (0–1), done: { [topicId]: ts }, ts } },
//   highlights: [{ id, bookKey, topicId, start, end, color: 'imp'|'se'|'rep', text, note?, ts }],
//   bookmarks:  [{ id, bookKey, topicId, title, ts }],
//   cards:     { [bookKey]: { [topicId]: 'se'|'rep' } },
//   answers:   { [bookKey]: { [topicId]: { [nºpregunta]: 'A'… } } },
//   prefs:     { size (índice de SIZES), dark, tablas: 'tarjetas'|'tabla', layout, links (enlaces entre libros) },
//   mod:       { [bookKey | '_prefs']: ts },  // última modificación local (para la sincronización)
//   meta:      { [bookKey]: { hd: { [idDestacado]: ts }, bd: { [topicId]: ts }, ud: { [topicId]: ts },   // borrados (lápidas)
//                             c: { [claveTarjeta]: ts }, a: { [`${topicId}|${nº}`]: ts } } }            // hora de cada tarjeta / respuesta
// }
// `meta` solo lo usa la sincronización: al juntar dos dispositivos nada borrado revive y nada se pierde (ver mergeSlices).
// Las vistas leen lo de siempre (progress, highlights, bookmarks, cards, answers, prefs).
// bookKey = `<item>:<fileIdx>`. start/end = posiciones en el texto del tema (ver plainText en content.js).
import { useMemo, useSyncExternalStore } from 'react'

export const HL_COLORS = [
  { id: 'imp', label: 'Importante', color: '#fde047' },
  { id: 'se', label: 'Ya lo sé', color: '#86efac' },
  { id: 'rep', label: 'Repasar', color: '#f9a8d4' },
]
export const hlColor = id => HL_COLORS.find(c => c.id === id) || HL_COLORS[0]
export const SIZES = [15, 16.5, 18, 20, 22, 25]
export const DEFAULT_PREFS = { size: 1, dark: false, tablas: 'tarjetas', layout: 'auto', links: true }
const PREFS_KEY = '_prefs'
const COLOR_IDS = HL_COLORS.map(c => c.id)

const isObj = v => !!v && typeof v === 'object' && !Array.isArray(v)
const str = (v, max) => typeof v === 'string' && v.length > 0 && v.length <= max
let seq = 0
export const newId = () => `${Date.now().toString(36)}${(seq++ % 1296).toString(36).padStart(2, '0')}${Math.random().toString(36).slice(2, 6)}`

export const emptyData = () => ({ v: 1, progress: {}, highlights: [], bookmarks: [], cards: {}, answers: {}, prefs: { ...DEFAULT_PREFS }, mod: {}, meta: {} })

function cleanHighlight(h) {
  if (!isObj(h) || !str(h.id, 40) || !str(h.bookKey, 80) || !str(h.topicId, 60)) return null
  if (!Number.isInteger(h.start) || !Number.isInteger(h.end) || h.start < 0 || h.end <= h.start) return null
  return {
    id: h.id, bookKey: h.bookKey, topicId: h.topicId, start: h.start, end: h.end,
    color: COLOR_IDS.includes(h.color) ? h.color : 'imp',
    text: typeof h.text === 'string' ? h.text.slice(0, 400) : '',
    ...(typeof h.note === 'string' && h.note.trim() ? { note: h.note.slice(0, 4000) } : {}),
    ts: Number(h.ts) || 0,
  }
}
function cleanBookmark(b) {
  if (!isObj(b) || !str(b.id, 40) || !str(b.bookKey, 80) || !str(b.topicId, 60)) return null
  return { id: b.id, bookKey: b.bookKey, topicId: b.topicId, title: typeof b.title === 'string' ? b.title.slice(0, 200) : '', ts: Number(b.ts) || 0 }
}
function cleanPrefs(p) {
  const out = { ...DEFAULT_PREFS }
  if (!isObj(p)) return out
  if (Number.isInteger(p.size) && p.size >= 0 && p.size < SIZES.length) out.size = p.size
  if (typeof p.dark === 'boolean') out.dark = p.dark
  if (p.tablas === 'tabla' || p.tablas === 'tarjetas') out.tablas = p.tablas
  if (str(p.layout, 20)) out.layout = p.layout
  if (typeof p.links === 'boolean') out.links = p.links // «Enlaces entre libros» (red de temas)
  return out
}
function cleanProgress(p) {
  if (!isObj(p)) return null
  const done = {}
  if (isObj(p.done)) for (const [k, v] of Object.entries(p.done)) if (str(k, 60) && Number(v) > 0) done[k] = Number(v)
  return { topicId: str(p.topicId, 60) ? p.topicId : null, scroll: Math.min(1, Math.max(0, Number(p.scroll) || 0)), done, ts: Number(p.ts) || 0 }
}
const cleanMap = (m, okVal) => {
  const out = {}
  if (isObj(m)) for (const [k, v] of Object.entries(m)) if (str(k, 60) && okVal(v)) out[k] = v
  return out
}
const cleanCards = m => cleanMap(m, v => v === 'se' || v === 'rep')
const cleanAnswers = m => {
  const out = {}
  if (isObj(m)) for (const [t, qs] of Object.entries(m)) {
    const a = cleanMap(qs, v => str(v, 4))
    if (str(t, 60) && Object.keys(a).length) out[t] = a
  }
  return out
}

const META_KEYS = ['hd', 'bd', 'ud', 'c', 'a']
const emptyMeta = () => ({ hd: {}, bd: {}, ud: {}, c: {}, a: {} })
function cleanMeta(m) {
  const out = emptyMeta()
  if (isObj(m)) for (const f of META_KEYS) if (isObj(m[f])) for (const [k, v] of Object.entries(m[f])) if (str(k, 130) && Number(v) > 0) out[f][k] = Number(v)
  return out
}
const metaOf = (d, bookKey) => d.meta?.[bookKey] || emptyMeta()
/** Anota en meta[bookKey][campo] las horas de `entries` ({ clave: ts }; ts null = quitar la marca). */
function stamp(d, bookKey, field, entries) {
  const m = metaOf(d, bookKey), f = { ...m[field] }
  for (const [k, v] of Object.entries(entries)) { if (v == null) delete f[k]; else f[k] = v }
  return { ...d, meta: { ...d.meta, [bookKey]: { ...m, [field]: f } } }
}
const aKey = (topicId, q) => `${topicId}|${q}`

/** Cualquier cosa (versión vieja, fila remota) → objeto bien formado. */
export function normalize(raw) {
  const d = emptyData()
  if (!isObj(raw)) return d
  if (isObj(raw.progress)) for (const [k, p] of Object.entries(raw.progress)) { const c = str(k, 80) && cleanProgress(p); if (c) d.progress[k] = c }
  d.highlights = (Array.isArray(raw.highlights) ? raw.highlights : []).map(cleanHighlight).filter(Boolean)
  d.bookmarks = (Array.isArray(raw.bookmarks) ? raw.bookmarks : []).map(cleanBookmark).filter(Boolean)
  if (isObj(raw.cards)) for (const [k, m] of Object.entries(raw.cards)) if (str(k, 80)) d.cards[k] = cleanCards(m)
  if (isObj(raw.answers)) for (const [k, m] of Object.entries(raw.answers)) if (str(k, 80)) d.answers[k] = cleanAnswers(m)
  d.prefs = cleanPrefs(raw.prefs)
  if (isObj(raw.mod)) for (const [k, v] of Object.entries(raw.mod)) if (str(k, 80) && Number(v) > 0) d.mod[k] = Number(v)
  if (isObj(raw.meta)) for (const [k, m] of Object.entries(raw.meta)) if (str(k, 80)) d.meta[k] = cleanMeta(m)
  return d
}

/* ───────── cambios puros: (data, …args, now) → data nueva ───────── */
const touch = (d, key, now) => ({ ...d, mod: { ...d.mod, [key]: now } })
const prog = (d, bookKey) => d.progress[bookKey] || { topicId: null, scroll: 0, done: {}, ts: 0 }

export function setProgress(d, bookKey, { topicId, scroll = 0 }, now = Date.now()) {
  if (!str(bookKey, 80) || !str(topicId, 60)) return d
  const p = prog(d, bookKey), s = Math.min(1, Math.max(0, Number(scroll) || 0))
  if (p.topicId === topicId && Math.abs(p.scroll - s) < 0.002) return d
  return touch({ ...d, progress: { ...d.progress, [bookKey]: { ...p, topicId, scroll: s, ts: now } } }, bookKey, now)
}
export function setDone(d, bookKey, topicId, on = true, now = Date.now()) {
  if (!str(bookKey, 80) || !str(topicId, 60)) return d
  const p = prog(d, bookKey)
  if (!!p.done[topicId] === !!on) return d
  const done = { ...p.done }
  const ud = metaOf(d, bookKey).ud[topicId] || 0
  if (on) done[topicId] = Math.max(now, ud + 1); else delete done[topicId]
  const next = stamp(d, bookKey, 'ud', { [topicId]: on ? null : Math.max(now, (p.done[topicId] || 0) + 1) })
  return touch({ ...next, progress: { ...d.progress, [bookKey]: { ...p, done, ts: now } } }, bookKey, now)
}
export function addHighlight(d, h, now = Date.now()) {
  const c = cleanHighlight({ ...h, id: h.id || newId(), ts: now })
  if (!c) return d
  const base = metaOf(d, c.bookKey).hd[c.id] ? stamp(d, c.bookKey, 'hd', { [c.id]: null }) : d
  return touch({ ...base, highlights: [...d.highlights.filter(x => x.id !== c.id), c] }, c.bookKey, now)
}
export function updateHighlight(d, id, patch, now = Date.now()) {
  const cur = d.highlights.find(h => h.id === id)
  if (!cur) return d
  const next = cleanHighlight({ ...cur, ...patch, id, bookKey: cur.bookKey, topicId: cur.topicId, ts: now })
  if (!next) return d
  return touch({ ...d, highlights: d.highlights.map(h => (h.id === id ? next : h)) }, cur.bookKey, now)
}
export function removeHighlight(d, id, now = Date.now()) {
  const cur = d.highlights.find(h => h.id === id)
  if (!cur) return d
  return touch({ ...stamp(d, cur.bookKey, 'hd', { [id]: now }), highlights: d.highlights.filter(h => h.id !== id) }, cur.bookKey, now)
}
/** Destacado nuevo que absorbe los que se cruzan con él en el mismo tema. `textOf(start, end)` da el texto del rango unido.
 *  Con `note` sobre algo ya destacado se conserva el color anterior. → [data, id] */
export function mergeHighlight(d, { bookKey, topicId, start, end, color, text, note }, textOf, now = Date.now()) {
  const over = d.highlights.filter(h => h.bookKey === bookKey && h.topicId === topicId && h.start < end && h.end > start)
  const s = Math.min(start, ...over.map(h => h.start)), e = Math.max(end, ...over.map(h => h.end))
  const keepNote = note ?? over.find(h => h.note)?.note
  const col = note != null && over[0] ? over[0].color : color
  const id = newId()
  // los absorbidos quedan como borrados: en otro dispositivo no deben volver al sincronizar
  const base = { ...(over.length ? stamp(d, bookKey, 'hd', Object.fromEntries(over.map(h => [h.id, now]))) : d), highlights: d.highlights.filter(h => !over.includes(h)) }
  const txt = (over.length && textOf ? textOf(s, e) : null) || text || ''
  const next = addHighlight(base, { id, bookKey, topicId, start: s, end: e, color: col, text: txt, ...(keepNote ? { note: keepNote } : {}) }, now)
  return [next === base ? d : next, id]
}
export function toggleBookmark(d, { bookKey, topicId, title }, now = Date.now()) {
  const found = d.bookmarks.find(b => b.bookKey === bookKey && b.topicId === topicId)
  if (found) return touch({ ...stamp(d, bookKey, 'bd', { [topicId]: Math.max(now, found.ts + 1) }), bookmarks: d.bookmarks.filter(b => b !== found) }, bookKey, now)
  const b = cleanBookmark({ id: newId(), bookKey, topicId, title, ts: Math.max(now, (metaOf(d, bookKey).bd[topicId] || 0) + 1) })
  return b ? touch({ ...d, bookmarks: [...d.bookmarks, b] }, bookKey, now) : d
}
export function setCard(d, bookKey, topicId, value, now = Date.now()) {
  if (!str(bookKey, 80) || !str(topicId, 60)) return d
  const m = { ...(d.cards[bookKey] || {}) }
  if (value === 'se' || value === 'rep') m[topicId] = value; else delete m[topicId]
  return touch({ ...stamp(d, bookKey, 'c', { [topicId]: now }), cards: { ...d.cards, [bookKey]: m } }, bookKey, now)
}
/** Respuesta a una pregunta del tema (`value` null = reintentar). */
export function setAnswer(d, bookKey, topicId, q, value, now = Date.now()) {
  if (!str(bookKey, 80) || !str(topicId, 60)) return d
  const book = { ...(d.answers[bookKey] || {}) }
  const t = { ...(book[topicId] || {}) }
  if (str(value, 4)) t[q] = value; else delete t[q]
  if (Object.keys(t).length) book[topicId] = t; else delete book[topicId]
  return touch({ ...stamp(d, bookKey, 'a', { [aKey(topicId, q)]: now }), answers: { ...d.answers, [bookKey]: book } }, bookKey, now)
}
export function setPrefs(d, patch, now = Date.now()) {
  return touch({ ...d, prefs: cleanPrefs({ ...d.prefs, ...patch }) }, PREFS_KEY, now)
}

/* ───────── lecturas ───────── */
const NONE = Object.freeze([])
const NO_OBJ = Object.freeze({})
export const getProgress = (d, bookKey) => d.progress[bookKey] || null
export const isDone = (d, bookKey, topicId) => !!d.progress[bookKey]?.done?.[topicId]
export const doneCount = (d, bookKey, topicIds) => { const done = d.progress[bookKey]?.done || NO_OBJ; return topicIds ? topicIds.filter(id => done[id]).length : Object.keys(done).length }
export const highlightsFor = (d, bookKey, topicId) => { const l = d.highlights.filter(h => h.bookKey === bookKey && (topicId == null || h.topicId === topicId)); return l.length ? l : NONE }
export const bookmarksFor = (d, bookKey) => d.bookmarks.filter(b => b.bookKey === bookKey)
export const isBookmarked = (d, bookKey, topicId) => d.bookmarks.some(b => b.bookKey === bookKey && b.topicId === topicId)
export const answersFor = (d, bookKey, topicId) => d.answers[bookKey]?.[topicId] || NO_OBJ
export const cardsFor = (d, bookKey) => d.cards[bookKey] || NO_OBJ

/* ───────── sincronización: una fila por libro (y una para las preferencias) ─────────
 * El servidor guarda lo que le llega, así que el cuidado va aquí:
 *  1. Nunca se sube un libro sin haber leído antes su fila (cada subida es leer → juntar → subir).
 *     Si la lectura falla (sin red), no se sube nada: se reintenta la lectura.
 *  2. Lo local y lo remoto se JUNTAN (mergeSlices); no se reemplaza uno por otro. */
export function bookSlice(d, key) {
  if (key === PREFS_KEY) return { prefs: d.prefs, ts: d.mod[key] || 0 }
  return {
    progress: d.progress[key] || null,
    highlights: d.highlights.filter(h => h.bookKey === key),
    bookmarks: d.bookmarks.filter(b => b.bookKey === key),
    cards: d.cards[key] || {},
    answers: d.answers[key] || {},
    meta: metaOf(d, key),
    ts: d.mod[key] || 0,
  }
}
/** Fila de un libro (remota o local, de cualquier versión) → forma completa y limpia. */
export function cleanSlice(key, slice) {
  const s = isObj(slice) ? slice : {}
  const fix = x => (isObj(x) ? { ...x, bookKey: key } : x)
  return {
    progress: cleanProgress(s.progress),
    highlights: (Array.isArray(s.highlights) ? s.highlights : []).map(h => cleanHighlight(fix(h))).filter(Boolean),
    bookmarks: (Array.isArray(s.bookmarks) ? s.bookmarks : []).map(b => cleanBookmark(fix(b))).filter(Boolean),
    cards: cleanCards(s.cards),
    answers: cleanAnswers(s.answers),
    meta: cleanMeta(s.meta),
    ts: Number(s.ts) || 0,
  }
}
/** Pone la fila de un libro (o las preferencias) en los datos, reemplazando lo que había de ese libro. */
export function applySlice(d, key, slice) {
  if (!isObj(slice)) return d
  const ts = Number(slice.ts) || 0
  if (key === PREFS_KEY) return { ...d, prefs: cleanPrefs(slice.prefs), mod: { ...d.mod, [key]: ts } }
  const c = cleanSlice(key, slice)
  const progress = { ...d.progress }
  if (c.progress) progress[key] = c.progress; else delete progress[key]
  return {
    ...d, progress,
    highlights: [...d.highlights.filter(h => h.bookKey !== key), ...c.highlights],
    bookmarks: [...d.bookmarks.filter(b => b.bookKey !== key), ...c.bookmarks],
    cards: { ...d.cards, [key]: c.cards },
    answers: { ...d.answers, [key]: c.answers },
    meta: { ...d.meta, [key]: c.meta },
    mod: { ...d.mod, [key]: ts },
  }
}

const TOMB_MAX_AGE = 400 * 864e5 // las lápidas de más de ~13 meses se olvidan
const j = v => (v === undefined ? '' : JSON.stringify(v))
/** El más nuevo; con la misma hora decide el contenido (igual en ambos dispositivos → convergen). */
const newer = (a, ta, b, tb) => (ta > tb ? a : tb > ta ? b : j(a) >= j(b) ? a : b)
const maxMap = (a, b) => { const out = { ...a }; for (const [k, v] of Object.entries(b)) if (!(out[k] >= v)) out[k] = v; return out }
const prune = (m, now, keep) => { const out = {}; for (const [k, v] of Object.entries(m)) if (now - v < TOMB_MAX_AGE || keep?.(k)) out[k] = v; return out }

/** Junta la fila local y la remota de un libro. Pura, conmutativa e idempotente:
 *  - destacados: unión por id; si está en ambos gana el de `ts` mayor; un borrado (meta.hd) gana siempre.
 *  - marcadores: uno por tema; el borrado (meta.bd) gana salvo que el marcador sea posterior.
 *  - estudiados (done): unión con la hora mayor; el desmarcado (meta.ud) gana si es posterior.
 *  - tarjetas / respuestas: por clave, la de hora mayor (meta.c / meta.a); sin horas (datos viejos) se unen.
 *  - posición de lectura: la de `ts` mayor. */
export function mergeSlices(key, localRaw, remoteRaw, now = Date.now()) {
  const L = cleanSlice(key, localRaw), R = cleanSlice(key, remoteRaw)
  const meta = emptyMeta()
  for (const f of META_KEYS) meta[f] = maxMap(L.meta[f], R.meta[f])

  const hl = new Map()
  for (const h of [...L.highlights, ...R.highlights]) {
    if (meta.hd[h.id]) continue
    const cur = hl.get(h.id)
    hl.set(h.id, cur ? newer(cur, cur.ts, h, h.ts) : h)
  }
  const highlights = [...hl.values()].sort((a, b) => a.ts - b.ts || (a.id < b.id ? -1 : 1))

  const bm = new Map()
  for (const b of [...L.bookmarks, ...R.bookmarks]) {
    if ((meta.bd[b.topicId] || 0) > b.ts) continue
    const cur = bm.get(b.topicId)
    bm.set(b.topicId, cur ? newer(cur, cur.ts, b, b.ts) : b)
  }
  const bookmarks = [...bm.values()].sort((a, b) => a.ts - b.ts || (a.id < b.id ? -1 : 1))

  let progress = null
  if (L.progress || R.progress) {
    const a = L.progress || { topicId: null, scroll: 0, done: {}, ts: 0 }, b = R.progress || { topicId: null, scroll: 0, done: {}, ts: 0 }
    const pos = newer([a.topicId, a.scroll], a.ts, [b.topicId, b.scroll], b.ts)
    const done = {}
    for (const [t, ts] of Object.entries(maxMap(a.done, b.done))) if (ts >= (meta.ud[t] || 0)) done[t] = ts
    progress = { topicId: pos[0], scroll: pos[1], done, ts: Math.max(a.ts, b.ts) }
  }
  for (const t of Object.keys(meta.ud)) if (progress?.done[t]) delete meta.ud[t]

  const cards = {}
  for (const k of new Set([...Object.keys(L.cards), ...Object.keys(R.cards), ...Object.keys(meta.c)])) {
    const tl = L.meta.c[k] || 0, tr = R.meta.c[k] || 0
    const v = tl || tr ? newer(L.cards[k], tl, R.cards[k], tr) : (L.cards[k] && R.cards[k] ? newer(L.cards[k], 0, R.cards[k], 0) : L.cards[k] ?? R.cards[k])
    if (v) cards[k] = v
  }

  const answers = {}
  const seen = new Set(), liveA = new Set()
  const put = (t, q) => {
    const k = aKey(t, q)
    if (seen.has(k)) return
    seen.add(k)
    const lv = L.answers[t]?.[q], rv = R.answers[t]?.[q], tl = L.meta.a[k] || 0, tr = R.meta.a[k] || 0
    const v = tl || tr ? newer(lv, tl, rv, tr) : (lv && rv ? newer(lv, 0, rv, 0) : lv ?? rv)
    if (v) { (answers[t] ||= {})[q] = v; liveA.add(k) }
  }
  for (const src of [L.answers, R.answers]) for (const [t, qs] of Object.entries(src)) for (const q of Object.keys(qs)) put(t, q)

  meta.hd = prune(meta.hd, now)
  meta.bd = prune(meta.bd, now)
  meta.ud = prune(meta.ud, now)
  meta.c = prune(meta.c, now, k => k in cards)
  meta.a = prune(meta.a, now, k => liveA.has(k))
  return { progress, highlights, bookmarks, cards, answers, meta, ts: Math.max(L.ts, R.ts) }
}

const canon = v => {
  if (Array.isArray(v)) return `[${v.map(canon).sort().join(',')}]`
  if (isObj(v)) return `{${Object.keys(v).sort().map(k => `${JSON.stringify(k)}:${canon(v[k])}`).join(',')}}`
  return JSON.stringify(v ?? null)
}
/** ¿Dicen lo mismo dos filas de un libro? (sin mirar la hora ni el orden) */
export function sameSlice(key, a, b) {
  if (key === PREFS_KEY) return canon(cleanPrefs(a?.prefs)) === canon(cleanPrefs(b?.prefs))
  const strip = s => { const c = cleanSlice(key, s); delete c.ts; if (c.progress) c.progress = { ...c.progress, ts: 0 }; return c }
  return canon(strip(a)) === canon(strip(b))
}
const emptySlice = (key, s) => (key === PREFS_KEY ? !(Number(s?.ts) > 0) : sameSlice(key, s, null))

/** Junta en `d` lo que hay en el servidor para `key` (fila remota o null si no hay). Pura. */
export function mergeRemote(d, key, remote, now = Date.now()) {
  if (!isObj(remote)) return d
  if (key === PREFS_KEY) return (Number(remote.ts) || 0) > (d.mod[key] || 0) ? applySlice(d, key, remote) : d
  const local = bookSlice(d, key)
  const merged = mergeSlices(key, local, remote, now)
  return sameSlice(key, merged, local) && merged.ts === local.ts && (merged.progress?.ts || 0) === (local.progress?.ts || 0) ? d : applySlice(d, key, merged)
}

/* ───────── almacén ───────── */
const storageKey = userId => `lw:${userId || 'anon'}`
const ls = () => { try { return typeof localStorage !== 'undefined' ? localStorage : null } catch { return null } }
function readStored(key, s) {
  let raw = null
  try { raw = JSON.parse(s?.getItem(key) || 'null') } catch { /* dato roto */ }
  const d = normalize(raw)
  if (!raw && s) {
    // primera vez: hereda las preferencias del lector celular anterior
    const old = k => { try { return JSON.parse(s.getItem(k)) } catch { return null } }
    d.prefs = cleanPrefs({ size: old('lm-size'), dark: old('lm-dark'), tablas: old('lm-tablas') })
  }
  return d
}

const PUSH_DELAY = 4000, MIN_BACKOFF = 30e3, MAX_BACKOFF = 10 * 60e3
export const backoffMs = failures => Math.min(MAX_BACKOFF, MIN_BACKOFF * 2 ** Math.max(0, failures - 1))

/** Almacén (también usable fuera de React). Para pruebas: `remote` = { get(userId, key), put(userId, key, data) }
 *  y `storage` (como localStorage). Por defecto usa fetchReaderData / saveReaderData de lib/api. */
export function createStore(userId, { remote = null, sync = true, storage = null } = {}) {
  const key = storageKey(userId)
  const disk = storage || ls()
  let data = readStored(key, disk)
  const subs = new Set()
  const dirty = new Set()    // claves con cambios locales sin subir
  const want = new Set()     // claves abiertas cuya fila aún no se ha podido leer
  const inflight = new Map() // clave → Promise de la sincronización en curso
  let timer = null, failures = 0, blockedUntil = 0, api = remote

  const persist = () => { try { disk?.setItem(key, JSON.stringify(data)) } catch { /* sin espacio / modo privado */ } }
  const emit = () => subs.forEach(fn => { try { fn() } catch { /* un suscriptor roto no detiene al resto */ } })
  const canSync = () => sync && !!userId && typeof window !== 'undefined'
  const getApi = async () => {
    // getAll: reader_get sin bookKey → { books: { [bookKey]: { data, updated_at } } } (todas las filas del usuario)
    if (!api) { const m = await import('../api'); api = { get: m.fetchReaderData, put: m.saveReaderData, getAll: uid => m.fetchReaderData(uid, '') } }
    return api
  }
  const pending = () => dirty.size > 0 || want.size > 0
  const schedule = (ms = PUSH_DELAY) => { if (canSync() && !timer && pending()) timer = setTimeout(tick, Math.max(ms, blockedUntil - Date.now())) }
  const failed = () => { failures += 1; blockedUntil = Date.now() + backoffMs(failures); schedule() }

  /** Leer → juntar → subir (solo si lo local tiene algo que el servidor no). Lanza si falla la red: entonces NO se sube nada.
   *  → true si lo local cambió con lo que llegó. */
  function syncKey(k) {
    if (inflight.has(k)) return inflight.get(k)
    const p = (async () => {
      const a = await getApi()
      const r = await a.get(userId, k)
      if (!isObj(r) || !('data' in r)) throw new Error('respuesta inesperada')
      const remoteData = isObj(r.data) ? r.data : null
      // se junta con lo local de AHORA (no con lo de antes de la espera): lo escrito mientras tanto también cuenta
      const merged = mergeRemote(data, k, remoteData)
      const changed = merged !== data
      if (changed) { data = merged; persist(); emit() }
      want.delete(k)
      const slice = bookSlice(data, k)
      if (remoteData ? sameSlice(k, slice, remoteData) : emptySlice(k, slice)) { dirty.delete(k); return changed }
      await a.put(userId, k, slice)
      if (sameSlice(k, bookSlice(data, k), slice)) dirty.delete(k); else dirty.add(k)
      return changed
    })()
    inflight.set(k, p)
    const clear = () => { if (inflight.get(k) === p) inflight.delete(k) }
    p.then(clear, clear)
    return p
  }

  async function tick(force = false) {
    timer = null
    if (!canSync() || !pending()) return
    if (!force && Date.now() < blockedUntil) return schedule()
    for (const k of new Set([...want, ...dirty])) {
      try { await syncKey(k); failures = 0; blockedUntil = 0 } catch { return failed() }
    }
    schedule()
  }

  /** Al abrir un libro: trae y junta su fila ahora mismo. Nunca falla hacia afuera; si no hay red se reintenta sola. */
  async function open(k) {
    if (!canSync()) return false
    want.add(k)
    try { const changed = await syncKey(k); failures = 0; blockedUntil = 0; schedule(); return changed } catch { failed(); return false }
  }

  /** Estante: trae TODAS las filas del usuario en una sola consulta y las junta con lo local (sin subir nada:
   *  cada libro se sube recién al abrirlo, después de leer su fila). Como mucho una vez por minuto. */
  let shelfAt = 0
  async function syncShelf() {
    if (!canSync() || Date.now() - shelfAt < 60e3) return false
    shelfAt = Date.now()
    try {
      const a = await getApi()
      if (typeof a.getAll !== 'function') return false
      const r = await a.getAll(userId)
      if (!isObj(r) || !isObj(r.books)) return false
      let next = data
      for (const [k, row] of Object.entries(r.books)) {
        if (!str(k, 80) || inflight.has(k) || !isObj(row) || !isObj(row.data)) continue // un libro abierto se junta solo
        next = mergeRemote(next, k, row.data)
      }
      if (next !== data) { data = next; persist(); emit() }
      return true
    } catch { shelfAt = 0; return false }
  }

  const update = fn => {
    const before = data
    const next = fn(data, Date.now())
    if (!next || next === before) return
    data = next
    for (const k of Object.keys(next.mod)) if (next.mod[k] !== before.mod[k]) dirty.add(k)
    persist(); emit(); schedule()
  }
  const bind = fn => (...args) => update((d, now) => fn(d, ...args, now))

  const store = {
    userId,
    get: () => data,
    subscribe: fn => { subs.add(fn); return () => subs.delete(fn) },
    update,
    reload: () => { data = readStored(key, disk); emit() },
    /** Sincroniza un libro (y las preferencias) al abrirlo. */
    sync: bookKey => Promise.all([open(PREFS_KEY), bookKey ? open(bookKey) : null]).catch(() => {}),
    /** Avance de todos los libros (para el estante), en una sola consulta. */
    syncShelf,
    /** Intenta ahora lo pendiente (al cerrar la página, al volver la red). */
    flush: () => { if (timer) { clearTimeout(timer); timer = null } return tick(true) },
    /** Para pruebas / diagnóstico. */
    pending: () => ({ dirty: [...dirty], want: [...want] }),
    setProgress: bind(setProgress),
    setDone: bind(setDone),
    addHighlight: bind(addHighlight),
    updateHighlight: bind(updateHighlight),
    removeHighlight: bind(removeHighlight),
    /** → id del destacado creado */
    mergeHighlight: (h, textOf) => { let id = null; update((d, now) => { const [n, i] = mergeHighlight(d, h, textOf, now); id = i; return n }); return id },
    toggleBookmark: bind(toggleBookmark),
    setCard: bind(setCard),
    setAnswer: bind(setAnswer),
    setPrefs: bind(setPrefs),
  }
  return store
}

const stores = new Map()
/** Un almacén compartido por usuario; sigue los cambios hechos en otras pestañas. */
export function getStore(userId) {
  const key = storageKey(userId)
  if (!stores.has(key)) {
    const store = createStore(userId)
    stores.set(key, store)
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', e => { if (e.key === key) store.reload() })
      window.addEventListener('pagehide', () => { store.flush() })
      window.addEventListener('online', () => { store.flush() })
    }
  }
  return stores.get(key)
}

/** React: `const [data, store] = useUserData(user?.id)`; `data` cambia de identidad con cada cambio. */
export function useUserData(userId) {
  const store = useMemo(() => getStore(userId), [userId])
  const data = useSyncExternalStore(store.subscribe, store.get, store.get)
  return [data, store]
}
