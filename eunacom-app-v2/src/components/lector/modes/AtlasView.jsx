// Lector web · Atlas de imágenes: la imagen primero, «¿Qué ves aquí?», y al tocar aparece la respuesta
// (marcadores numerados sobre la imagen, qué hay que ver, diagnóstico, conducta, con qué se confunde, pregunta real).
// Guarda por ficha: vista (progress.done), «Lo reconocí» / «Repasar» (cards) y la última ficha abierta (progress.topicId).
// Props (las de toda vista de LectorWeb): { item, fileIdx, title, book, bookKey, user, onClose, onOpenPdf(page?), paused, initialTopicId }
import React, { useDeferredValue, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Check, RotateCcw, Eye, Maximize2, Images, GitCompare, Tag, ListChecks, BookOpen, ArrowLeft } from 'lucide-react'
import { cardsFor, getProgress, getStore } from '../../../lib/lector/userData'
import { TopicBody, ZoomViewer, watermarkUrl } from '../render'
import { norm } from '../../../lib/lector/content'
import { useHistoryLayer } from '../../../lib/lector/nav'
import { Bottom, Filter, Hero, PdfButton, Progress, Root, Top, plural, tParts, tUrl, useBoot, useFine, useKeys, useReader, useSwipe } from './common'

/* Marcadores de «Qué tienes que ver» sobre la imagen, igual que en el libro (build_atlas.cjs → markerSvg):
   anillo en la zona, línea y número. m = [x, y, radio] en fracción del ancho / alto / lado menor; radio 0 = flecha a un punto.
   `sz` = unidades de la imagen por píxel de pantalla (para que el número se lea igual en cualquier tamaño). */
let mkSeq = 0
function markerParts(c, sz = 1) {
  const W = c.w, H = c.h, R = 11 * sz, mn = Math.min(W, H), placed = [], id = `lwx-ah${++mkSeq}`
  const f = n => n.toFixed(1)
  const halo = `fill:none;stroke:rgba(15,23,42,.75);stroke-width:${f(4.2 * sz)}`
  const parts = (c.claves || []).map((k, i) => ({ ...k, n: i + 1 })).filter(k => Array.isArray(k.m)).map(k => {
    const [fx, fy, fr = 0.07] = k.m
    const x = fx * W, y = fy * H, r = fr * mn
    let dx = fx - 0.5, dy = fy - 0.5
    if (Math.hypot(dx, dy) < 0.08) { dx = 0.7; dy = -0.7 }
    let ang = Math.atan2(dy, dx), bx, by, tries = 0
    const dist = (r > 0 ? r : 6 * sz) + R + 12 * sz
    do {
      bx = Math.min(W - R - 3, Math.max(R + 3, x + Math.cos(ang) * dist))
      by = Math.min(H - R - 3, Math.max(R + 3, y + Math.sin(ang) * dist))
      ang += Math.PI / 3; tries++
    } while (tries < 7 && placed.some(p => Math.hypot(p[0] - bx, p[1] - by) < 2.6 * R))
    placed.push([bx, by])
    const L = Math.hypot(x - bx, y - by) || 1, ux = (x - bx) / L, uy = (y - by) / L
    const sx = bx + ux * R, sy = by + uy * R, ex = x - ux * (r > 0 ? r : 2 * sz), ey = y - uy * (r > 0 ? r : 2 * sz)
    const pts = `x1="${f(sx)}" y1="${f(sy)}" x2="${f(ex)}" y2="${f(ey)}"`
    const line = L > R + (r > 0 ? r : 0) + 2 * sz
      ? `<line ${pts} style="${halo}"/><line ${pts} style="stroke:#fde047;stroke-width:${f(2 * sz)}"${r > 0 ? '' : ` marker-end="url(#${id})"`}/>` : ''
    const ring = r > 0 ? `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" style="${halo}"/><circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" style="fill:none;stroke:#fde047;stroke-width:${f(2.2 * sz)}"/>` : ''
    return `${ring}${line}<circle cx="${f(bx)}" cy="${f(by)}" r="${f(R)}" style="fill:var(--acc,#2563eb);stroke:#fff;stroke-width:${f(2.2 * sz)}"/>`
      + `<text x="${f(bx)}" y="${f(by + 4.6 * sz)}" style="fill:#fff;font:700 ${f(13 * sz)}px system-ui,sans-serif;text-anchor:middle">${k.n}</text>`
  }).join('')
  return `<defs><marker id="${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#fde047"/></marker></defs>${parts}`
}
const markerSvg = (c, sz, withImage = false) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${c.w} ${c.h}" width="${c.w}" height="${c.h}">${withImage ? `<image href="${c.img}" x="0" y="0" width="${c.w}" height="${c.h}"/>` : ''}${markerParts(c, sz)}</svg>`

// La imagen de la ficha, con los marcadores encima cuando ya se reveló.
// Ancho: el de la columna, sin pasar el alto disponible ni agrandar la foto mucho más que su tamaño real (se vería borrosa).
function Figure({ c, revealed, onTap, onZoom }) {
  const ref = useRef(null)
  const [dw, setDw] = useState(0)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const measure = () => setDw(el.clientWidth || 0)
    measure()
    if (typeof ResizeObserver === 'undefined') return undefined
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [c.id])
  const svg = useMemo(() => (revealed && dw ? markerSvg(c, Math.max(0.6, c.w / dw)) : ''), [c, revealed, dw])
  const maxW = Math.max(c.w || 0, 560)
  return (
    <div className="lwx-fig">
      <div ref={ref} className="lwx-fig-in" style={{ aspectRatio: `${c.w} / ${c.h}`, width: `min(100%, calc(var(--lwx-fig-h) * ${(c.w / c.h).toFixed(4)}), ${maxW}px)` }}
        onClick={onTap} role="button" tabIndex={0} aria-label={revealed ? 'Ampliar la imagen' : 'Ver la respuesta'}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onTap() } }}>
        <img src={c.img} alt="" draggable={false} />
        {svg && <div className="lwx-mk" dangerouslySetInnerHTML={{ __html: svg }} />}
      </div>
      <button className="lwx-zoom" onClick={onZoom} aria-label="Ampliar la imagen"><Maximize2 size={15} /><span>Ampliar</span></button>
    </div>
  )
}

// Miniatura que abre la imagen grande (visor compartido). `wide`: la imagen entera, sin recortar (trazados de ECG, pares).
function Thumb({ c, onClick, label, wide = false }) {
  return (
    <button className={`lwx-thumb ${wide ? 'wide' : ''}`} onClick={onClick} aria-label={label || 'Ampliar la imagen'} style={wide && c.w && c.h ? { aspectRatio: `${c.w} / ${c.h}` } : undefined}>
      <img src={c.img} alt="" draggable={false} loading="lazy" />
      <i className="lwx-thumb-z" aria-hidden="true"><Maximize2 size={14} /></i>
    </button>
  )
}

// Historial: ?t= dice qué hay abierto. «<ficha>» (todas las fichas), «rep~<ficha>» / «auto~<ficha>» (Repasar / Autoevaluación),
// «x-<extra>» (pantalla de extras) y «x-<extra>~<ficha>» (ficha abierta desde esa pantalla).
// En la dirección la ficha va con un nombre neutro, «c<n.º de ficha>» (c12): el id de la ficha («bav-1», «ecg-intervalos»)
// dice el diagnóstico y quedaría a la vista en la barra de direcciones y en el historial antes de pensar la respuesta.
// Lo guardado (vistas, «Lo reconocí» / «Repasar», última ficha) sigue con el id de la ficha; los enlaces viejos con el id también abren.
const EXTRAS = ['pares', 'signos', 'tipos']
const caseToken = c => (c ? `c${c.index + 1}` : null)
function caseIdOf(part, byId, allIds) {
  if (byId.has(part)) return part
  const m = /^c(\d+)$/.exec(part || '')
  if (m) return allIds[Number(m[1]) - 1] || null
  // el id de un tema (t-1-4, enlaces de la red de temas): su primera ficha, sin revelar
  if (/^t-\d/.test(part || '')) { for (const c of byId.values()) if (c.topicId === part) return c.id }
  return null
}
// Solo el recorrido de todas las fichas (sin src) mueve «Continuar donde quedaste»; Signos, Por tipo, pares, Repasar y
// Autoevaluación son sesiones aparte.
const isMain = d => !d.src
// Mazo con que se abre una ficha desde una pantalla de extras (el mismo que arman sus botones).
function extraDeck(x, extra, id) {
  if (extra === 'pares') { const p = (x.pares || []).find(p => p.a === id || p.b === id); return p ? { ids: [p.a, p.b], label: 'Comparación', open: true } : null }
  if (extra === 'signos') return (x.signos || []).some(s => s.caso === id) ? { ids: [id], label: 'Signo', open: true } : null
  if (extra === 'tipos') { const t = (x.tipos || []).find(t => (t.casos || []).includes(id)); return t ? { ids: t.casos, label: t.label } : null }
  return null
}
// Estado de entrada a partir de initialTopicId
function bootState(t, { byId, allIds, x, repIds }) {
  const p = tParts(t)
  const id = caseIdOf(p[p.length - 1], byId, allIds)
  const ex = p[0]?.startsWith('x-') && EXTRAS.includes(p[0].slice(2)) ? p[0].slice(2) : null
  const deck = (ids, o = {}) => {
    const list = ids.filter(i => byId.has(i))
    return { ids: list, pos: Math.max(0, list.indexOf(id)), label: '', from: 'start', rep: false, src: '', ...o }
  }
  if (ex && p.length === 1) return { view: 'extra', extra: ex }
  if (!id) return null
  if (ex) {
    const d = extraDeck(x, ex, id)
    if (d) return { view: 'case', extra: ex, deck: deck(d.ids, { label: d.label, from: 'extra', src: `x-${ex}`, open: !!d.open }) }
  }
  if (p.length === 2 && p[0] === 'rep' && repIds.includes(id)) return { view: 'case', deck: deck(repIds, { label: 'Para repasar', rep: true, src: 'rep' }) }
  if (p.length === 2 && p[0] === 'auto' && (x.auto || []).some(a => a.caso === id)) return { view: 'case', deck: deck(x.auto.map(a => a.caso), { label: 'Autoevaluación', src: 'auto' }) }
  return { view: 'case', deck: deck(allIds) }
}

export default function AtlasView({ item, fileIdx, title, book, bookKey, user, onClose, onOpenPdf, paused = false, initialTopicId = null }) {
  const cases = useMemo(() => {
    const list = []
    for (const b of book.blocks || []) for (const t of b.topics || []) for (const c of t.cases || []) {
      list.push({ ...c, index: list.length, topicId: t.id, label: t.label, topicTitle: t.title, blockN: b.n })
    }
    return list
  }, [book])
  const byId = useMemo(() => new Map(cases.map(c => [c.id, c])), [cases])
  const boot = useBoot()
  const [first] = useState(() => {
    if (!initialTopicId) return null
    const cardsNow = user?.id ? cardsFor(getStore(user.id).get(), bookKey) : {}
    return bootState(initialTopicId, { byId, allIds: cases.map(c => c.id), x: book.extras || {}, repIds: cases.filter(c => cardsNow[c.id] === 'rep').map(c => c.id) })
  })
  const [view, setView] = useState(first?.view || 'start') // 'start' | 'case' | 'extra'
  const [deck, setDeck] = useState(first?.deck || { ids: [], pos: 0, label: '', from: 'start', rep: false, src: '' })
  const [extra, setExtra] = useState(first?.extra || 'pares')
  const [onlyRep, setOnlyRep] = useState(false)
  const [revealed, setRevealed] = useState(!!first?.deck?.open)
  const [zoom, setZoom] = useState(null)
  const [q, setQ] = useState('')
  const dq = useDeferredValue(q)
  const fine = useFine()

  const back = () => {
    if (zoom) return setZoom(null)
    if (view === 'case') return setView(deck.from || 'start')
    if (view === 'extra') return setView('start')
    return onClose?.()
  }
  const r = useReader({ user, bookKey, paused, onBack: back })
  const { data, store } = r
  const prog = getProgress(data, bookKey)
  const seen = prog?.done || {}
  const cards = cardsFor(data, bookKey)
  const nSeen = cases.filter(c => seen[c.id]).length
  const nSe = cases.filter(c => cards[c.id] === 'se').length
  const nRep = cases.filter(c => cards[c.id] === 'rep').length
  const last = prog?.topicId ? byId.get(prog.topicId) : null
  const atEnd = view === 'case' && deck.ids.length > 0 && deck.pos >= deck.ids.length
  const cur = view === 'case' && !atEnd ? byId.get(deck.ids[deck.pos]) : null

  // reveal: abrir ya con la respuesta (la lista de donde viene ya mostró el nombre: Signos, pares)
  const openDeck = (ids, { at, label = '', from = 'start', rep = false, reveal: open = false } = {}) => {
    const list = ids.filter(id => byId.has(id))
    if (!list.length) return
    const pos = Math.max(0, list.indexOf(at))
    const src = from === 'extra' ? `x-${extra}` : rep ? 'rep' : label === 'Autoevaluación' ? 'auto' : ''
    setDeck({ ids: list, pos, label, from, rep, src, open })
    setRevealed(open); setView('case')
    if (open) store.setDone(bookKey, list[pos], true)
    if (!src) store.setProgress(bookKey, { topicId: list[pos] })
  }
  // d = +1 en la última ficha → pantalla final del recorrido
  const go = d => {
    const pos = deck.pos + d
    if (pos < 0 || pos > deck.ids.length || (pos === deck.ids.length && d < 0)) return
    setDeck(k => ({ ...k, pos })); setRevealed(!!deck.open)
    if (deck.open && pos < deck.ids.length) store.setDone(bookKey, deck.ids[pos], true)
    if (pos < deck.ids.length && isMain(deck)) store.setProgress(bookKey, { topicId: deck.ids[pos] })
  }
  const reveal = () => { if (!cur || revealed) return; setRevealed(true); store.setDone(bookKey, cur.id, true) }
  const rate = v => {
    if (!cur) return
    store.setCard(bookKey, cur.id, cards[cur.id] === v ? null : v)
    if (cards[cur.id] !== v) go(1)
  }
  const zoomCase = (c, title) => setZoom({ svg: markerSvg(c, Math.max(0.6, c.w / Math.min(window.innerWidth, 900)), true), title: title || c.dx })
  const openZoom = () => {
    if (!cur) return
    if (revealed) zoomCase(cur)
    else setZoom({ img: cur.img, title: '¿Qué ves aquí?' })
  }
  const allIds = useMemo(() => cases.map(c => c.id), [cases])
  const repIds = () => cases.filter(c => cards[c.id] === 'rep').map(c => c.id)
  const pool = () => (onlyRep ? repIds() : allIds)
  const poolOpts = onlyRep ? { label: 'Para repasar', rep: true } : {}

  useKeys(e => {
    if (zoom || r.aa) return false
    if (view !== 'case' || atEnd) return false
    if (e.key === 'ArrowRight') { go(1); return true }
    if (e.key === 'ArrowLeft') { go(-1); return true }
    if (e.key === ' ' || e.key === 'Enter') { if (!revealed) reveal(); return true }
    return false
  }, !paused)
  const scrollRef = useRef(null)
  useSwipe(scrollRef, { onLeft: () => go(1), onRight: () => go(-1) }, view === 'case' && !zoom && !atEnd)
  useLayoutEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = 0 }, [cur?.id, view, atEnd])

  const topic = useMemo(() => (cur ? { id: cur.id, title: cur.dx, html: cur.html } : null), [cur])
  const x = book.extras || {}
  const words = norm(dq.trim()).split(/\s+/).filter(Boolean)
  // búsqueda: si el tema calza (número o título) entran todas sus fichas; si no, solo las fichas que calzan (diagnóstico o tipo)
  const hitCases = (t, list) => {
    if (!words.length) return list
    const tk = norm(`${t.label} ${t.title}`)
    if (words.every(w => tk.includes(w))) return list
    return list.filter(c => { const k = `${tk} ${norm(`${c.dx} ${c.tipoLabel || ''}`)}`; return words.every(w => k.includes(w)) })
  }
  // resumen del recorrido que se acaba de terminar
  const endStats = atEnd ? { se: deck.ids.filter(id => cards[id] === 'se').length, rep: deck.ids.filter(id => cards[id] === 'rep').length } : null
  const restart = () => openDeck(deck.ids, { label: deck.label, from: deck.from, rep: deck.rep, reveal: !!deck.open })
  // Historial: pantalla de extras (también debajo de una ficha abierta desde ahí) → ficha o pantalla final.
  // El visor de imágenes es su propia entrada (ZoomViewer). Cerrar con la flecha o Escape vuelve atrás en el historial.
  const inExtra = view === 'extra' || (view === 'case' && deck.from === 'extra')
  useHistoryLayer(inExtra, () => setView('start'), { url: inExtra ? tUrl(`x-${extra}`) : null, adopt: boot && !!first })
  const caseId = view === 'case' ? deck.ids[Math.min(deck.pos, deck.ids.length - 1)] : null
  useHistoryLayer(view === 'case', () => setView(v => (v === 'case' ? deck.from || 'start' : v)), { url: caseId ? tUrl(deck.src, caseToken(byId.get(caseId))) : null, adopt: boot && first?.view === 'case' })
  const caseKicker = cur ? [deck.label && deck.label !== cur.tipoLabel ? deck.label : '', `Ficha ${deck.pos + 1} de ${deck.ids.length}`].filter(Boolean).join(' · ') : ''
  let shown = 0

  return (
    <Root book={book} r={r}>
      {view === 'start' && (
        <>
          <Top close onBack={onClose} title={title || book.title} onAa={() => r.setAa(true)} onPdf={onOpenPdf} r={r} />
          <div className="lw-scroll">
            <div className="lw-start lwx-home">
              <aside className="lwx-home-side">
                <Hero item={item} fileIdx={fileIdx} book={book} />
                <button className="lw-continue" onClick={() => openDeck(allIds, { at: last?.id })}>
                  <BookOpen size={22} />
                  <span>
                    <small>{last ? 'Continuar donde quedaste' : 'Empezar'}</small>
                    <b>{last ? `Ficha ${last.index + 1} de ${cases.length} · tema ${last.label}` : `${plural(cases.length, 'ficha', 'fichas')}: mira, piensa y comprueba`}</b>
                  </span>
                  <ChevronRight size={20} />
                </button>
                <Progress n={nSeen} total={cases.length}><b>{nSeen}</b> de {cases.length} fichas vistas</Progress>
                <div className="lwx-stats">
                  <span className="se"><Check size={14} strokeWidth={3} />{plural(nSe, 'reconocida', 'reconocidas')}</span>
                  <span className="rep"><RotateCcw size={14} />{nRep} para repasar</span>
                </div>

                <label className="lwx-switch">
                  <input type="checkbox" checked={onlyRep} onChange={e => setOnlyRep(e.target.checked)} />
                  <i aria-hidden="true" />
                  <span><b>Solo las que debo repasar</b><small>{nRep ? `${plural(nRep, 'ficha marcada', 'fichas marcadas')} con «Repasar»` : nSe ? 'No te quedan fichas para repasar' : 'Todavía no marcas ninguna con «Repasar»'}</small></span>
                </label>

                {(x.auto?.length > 0 || x.pares?.length > 0 || x.signos?.length > 0 || x.tipos?.length > 0) && (
                  <>
                    <div className="lw-toc-b"><div>Más del libro</div></div>
                    <div className="lwx-more">
                      {x.auto?.length > 0 && (
                        <button onClick={() => openDeck(x.auto.map(a => a.caso), { label: 'Autoevaluación' })}>
                          <ListChecks size={18} /><b>Autoevaluación</b><small>{plural(x.auto.length, 'ficha', 'fichas')} sin pistas</small>
                        </button>
                      )}
                      {x.pares?.length > 0 && <button onClick={() => { setExtra('pares'); setView('extra') }}><GitCompare size={18} /><b>Se parecen, no son lo mismo</b><small>{plural(x.pares.length, 'par', 'pares')} para comparar</small></button>}
                      {x.signos?.length > 0 && <button onClick={() => { setExtra('signos'); setView('extra') }}><Tag size={18} /><b>Signos con nombre</b><small>{plural(x.signos.length, 'signo', 'signos')}</small></button>}
                      {x.tipos?.length > 0 && <button onClick={() => { setExtra('tipos'); setView('extra') }}><Images size={18} /><b>Por tipo de imagen</b><small>{plural(x.tipos.length, 'tipo', 'tipos')}</small></button>}
                    </div>
                  </>
                )}
                <PdfButton onPdf={onOpenPdf} />
              </aside>

              <div className="lwx-home-main">
                <div className="lwx-home-h">
                  <h2>{onlyRep ? 'Fichas para repasar' : 'Índice por tema'}</h2>
                  <Filter value={q} onChange={setQ} placeholder="Busca un tema o un diagnóstico" />
                </div>
                {onlyRep && nRep > 0 && (
                  <button className="lw-btn pri lwx-rep-go" onClick={() => openDeck(repIds(), { label: 'Para repasar', rep: true })}><RotateCcw size={16} />{nRep === 1 ? 'Repasar esa ficha ahora' : `Repasar las ${nRep} ahora`}</button>
                )}
                {(book.blocks || []).map(b => {
                  const rows = (b.topics || []).map(t => {
                    const all = cases.filter(c => c.topicId === t.id)
                    const list = hitCases(t, onlyRep ? all.filter(c => cards[c.id] === 'rep') : all)
                    return { t, list, nSeen: all.filter(c => seen[c.id]).length, total: all.length }
                  }).filter(row => row.list.length)
                  if (!rows.length) return null
                  shown += rows.length
                  return (
                    <section key={b.n} className="lwx-sec">
                      <div className="lw-toc-b"><div>Bloque {b.n} · {b.name}</div><span>{plural(rows.reduce((a, row) => a + row.list.length, 0), 'ficha', 'fichas')}</span></div>
                      <div className="lw-toc lwx-tgrid">
                        {rows.map(({ t, list, nSeen: n, total }) => (
                          <button key={t.id} className={`lw-toc-t lwx-tcard ${last?.topicId === t.id ? 'cur' : ''}`} onClick={() => openDeck(pool(), { at: list[0].id, ...poolOpts })}>
                            <img className="lwx-tcard-img" src={list[0].img} alt="" draggable={false} loading="lazy" />
                            <span className="lw-toc-n">{t.label}</span>
                            <span className="lwx-tcard-t">{t.title}</span>
                            <span className={`lwx-count ${!onlyRep && !words.length && n === total ? 'full' : ''}`}>{onlyRep ? plural(list.length, 'ficha', 'fichas') : words.length ? (list.length === total ? plural(total, 'ficha', 'fichas') : `${list.length} de ${total} fichas`) : `${n}/${total}`}</span>
                          </button>
                        ))}
                      </div>
                    </section>
                  )
                })}
                {onlyRep && !nRep && (nSe
                  ? <p className="lw-empty"><b>No te quedan fichas para repasar</b>Las que marcaste ya las reconociste. Cuando otra imagen te cueste, márcala con «Repasar» y la encontrarás aquí.</p>
                  : <p className="lw-empty"><b>Nada para repasar</b>Cuando una imagen te cueste, márcala con «Repasar» y la encontrarás aquí.</p>)}
                {(!onlyRep || nRep > 0) && !shown && <p className="lw-empty"><b>Sin resultados</b>Prueba con otra palabra: el nombre del tema o un diagnóstico.</p>}
              </div>
            </div>
          </div>
        </>
      )}

      {view === 'case' && cur && (
        <>
          <Top onBack={back} backLabel="Volver al índice" onAa={() => r.setAa(true)} onPdf={onOpenPdf} r={r}
            kicker={caseKicker} title={revealed ? cur.dx : cur.tipoLabel || 'Imagen'} />
          <div ref={scrollRef} className="lw-scroll" style={{ backgroundImage: watermarkUrl(r.mark, data.prefs.dark) }}>
            <div className={`lwx-case ${revealed ? 'open' : ''} ${cur.w && cur.h && cur.w / cur.h >= 2.2 ? 'strip' : ''}`}>
              <Figure c={cur} revealed={revealed} onTap={() => (revealed ? openZoom() : reveal())} onZoom={openZoom} />
              <div className="lwx-side">
                {!revealed ? (
                  <button className="lwx-ask" onClick={reveal}>
                    <b>¿Qué ves aquí?</b>
                    <span>{deck.label === 'Autoevaluación' && book.pregunta ? book.pregunta : 'Piensa el diagnóstico y qué harías.'}</span>
                    <em><Eye size={16} />{fine ? 'Haz clic o pulsa Espacio para ver la respuesta' : 'Toca para ver la respuesta'}</em>
                  </button>
                ) : (
                  <article className="lw-doc lwx-doc" style={{ fontSize: r.fs }}>
                    <div className="lw-kicker">Tema {cur.label} · {cur.topicTitle}</div>
                    <TopicBody userId={user?.id} bookKey={bookKey} book={book} topic={topic} mark={r.mark} />
                  </article>
                )}
              </div>
            </div>
          </div>
          <Bottom>
            <button className="lw-step" onClick={() => go(-1)} disabled={deck.pos === 0} aria-label="Ficha anterior"><ChevronLeft size={18} /></button>
            {revealed ? (
              <>
                <button className={`lwx-rate rep ${cards[cur.id] === 'rep' ? 'on' : ''}`} onClick={() => rate('rep')} aria-pressed={cards[cur.id] === 'rep'}><RotateCcw size={16} />Repasar</button>
                <button className={`lwx-rate se ${cards[cur.id] === 'se' ? 'on' : ''}`} onClick={() => rate('se')} aria-pressed={cards[cur.id] === 'se'}><Check size={17} strokeWidth={3} />Lo reconocí</button>
              </>
            ) : (
              <button className="lwx-rate show" onClick={reveal}><Eye size={17} />Ver la respuesta</button>
            )}
            <button className="lw-step" onClick={() => go(1)} aria-label={deck.pos >= deck.ids.length - 1 ? 'Terminar' : 'Ficha siguiente'}><ChevronRight size={18} /></button>
          </Bottom>
        </>
      )}

      {atEnd && (
        <>
          <Top onBack={back} backLabel="Volver al índice" onAa={() => r.setAa(true)} onPdf={onOpenPdf} r={r}
            kicker={deck.label || book.title} title={deck.ids.length === 1 ? 'Ficha terminada' : 'Fichas terminadas'} />
          <div ref={scrollRef} className="lw-scroll">
            <div className="lwx-ses lwx-end">
              <span className="lwx-end-ic" aria-hidden="true"><Check size={26} strokeWidth={3} /></span>
              <h2>{deck.rep ? 'Repaso terminado' : deck.ids.length === 1 ? 'Terminaste la ficha' : `Terminaste las ${deck.ids.length} fichas`}</h2>
              <div className="lwx-stats lwx-end-stats">
                <span className="se"><Check size={14} strokeWidth={3} />{plural(endStats.se, 'reconocida', 'reconocidas')}</span>
                <span className="rep"><RotateCcw size={14} />{endStats.rep} para repasar</span>
                <span>{deck.ids.length - endStats.se - endStats.rep} sin marcar</span>
              </div>
              {!deck.rep && endStats.rep > 0 && (
                <button className="lw-btn pri" onClick={() => openDeck(deck.ids.filter(id => cards[id] === 'rep'), { label: 'Para repasar', from: deck.from, rep: true })}>
                  <RotateCcw size={16} />{endStats.rep === 1 ? 'Repasar la que marcaste' : `Repasar las ${endStats.rep} que marcaste`}
                </button>
              )}
              {deck.rep && !nRep && <p>Ya no te quedan fichas marcadas con «Repasar».</p>}
              {!(deck.rep && !nRep) && <button className="lw-btn" onClick={restart}><RotateCcw size={16} />Volver a empezar</button>}
              <button className="lw-btn" onClick={() => setView(deck.from || 'start')}><ArrowLeft size={16} />{deck.from === 'extra' ? 'Volver a la lista' : 'Volver al índice'}</button>
            </div>
          </div>
        </>
      )}

      {view === 'extra' && (
        <>
          <Top onBack={back} backLabel="Volver al índice" onAa={() => r.setAa(true)} onPdf={onOpenPdf} kicker={book.title} r={r}
            title={extra === 'pares' ? 'Se parecen, no son lo mismo' : extra === 'signos' ? 'Signos con nombre' : 'Por tipo de imagen'} />
          <div className="lw-scroll">
            <div className={`lw-start lwx-extra ${extra}`}>
              {extra === 'pares' && (
                <div className="lwx-pairs">
                  {(x.pares || []).map((p, i) => {
                    const a = byId.get(p.a), b = byId.get(p.b)
                    const openPair = at => openDeck([p.a, p.b], { at, label: 'Comparación', from: 'extra', reveal: true })
                    return (
                      <section key={i} className="lwx-pair">
                        <h3>{p.title}</h3>
                        <div className="lwx-pair-cols">
                          {[[a, p.la], [b, p.lb]].map(([c, l], j) => (
                            <div key={j}>
                              {c && <Thumb wide c={c} onClick={() => zoomCase(c)} label={`Ampliar la imagen: ${c.dx}`} />}
                              {c && <b>{c.dx}</b>}
                              <ul>{(l || []).map((s, k) => <li key={k}>{s}</li>)}</ul>
                              {c && <button className="lwx-link" onClick={() => openPair(c.id)}>Ver la ficha completa<ChevronRight size={15} /></button>}
                            </div>
                          ))}
                        </div>
                        {p.diff && <p className="lwx-diff"><b>La diferencia</b>{p.diff}</p>}
                      </section>
                    )
                  })}
                </div>
              )}
              {extra === 'signos' && (
                <div className="lwx-list lwx-signs">
                  {(x.signos || []).map((s, i) => {
                    const c = s.caso ? byId.get(s.caso) : null
                    return (
                      <div key={i} className="lwx-sign">
                        {c && <Thumb c={c} onClick={() => zoomCase(c, s.name)} label={`Ampliar la imagen: ${s.name}`} />}
                        <div>
                          <b>{s.name}</b><p>{s.def}</p>{s.dx && <p className="dx"><span>Piensa en</span> {s.dx}</p>}
                          {c && <button className="lwx-link" onClick={() => openDeck([c.id], { label: 'Signo', from: 'extra', reveal: true })}>Ver la ficha<ChevronRight size={15} /></button>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
              {extra === 'tipos' && (x.tipos || []).map(t => {
                const list = (t.casos || []).filter(id => byId.has(id))
                if (!list.length) return null
                return (
                  <section key={t.k} className="lwx-type">
                    <div className="lw-toc-b"><div>{t.label}</div><span>{plural(list.length, 'ficha', 'fichas')}</span></div>
                    <div className="lwx-grid">
                      {list.map(id => (
                        <button key={id} className="lwx-thumb" onClick={() => openDeck(list, { at: id, label: t.label, from: 'extra' })} aria-label="Abrir la ficha">
                          <img src={byId.get(id).img} alt="" draggable={false} loading="lazy" />
                        </button>
                      ))}
                    </div>
                  </section>
                )
              })}
            </div>
          </div>
        </>
      )}

      {zoom && <ZoomViewer z={zoom} style={book.theme} mark={r.mark} onClose={() => setZoom(null)} />}
    </Root>
  )
}
