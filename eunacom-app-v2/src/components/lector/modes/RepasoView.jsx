// Lector web · Repaso Final: por tema, las tarjetas (frente → toca → reverso) con «Lo sé» / «Repasar», y debajo la hoja
// completa del tema. «Repasar pendientes» recorre solo las tarjetas marcadas «Repasar» o todavía sin ver.
// Guarda: cards[`<tema>.<tarjeta>`] = 'se' | 'rep', tema estudiado (progress.done) y último tema (progress.topicId).
// Props (las de toda vista de LectorWeb): { item, fileIdx, title, book, bookKey, user, onClose, onOpenPdf(page?), paused, initialTopicId }
// Historial (?t=…): «<extra>» (sección final), «<tema>», «<tema>~rep» (repaso de las pendientes del tema), «rep» (de todo el libro),
// con «<extra>~» delante si el tema se abrió desde una sección final. «Atrás» sale de a un nivel; al recargar se reabre lo mismo.
import React, { useDeferredValue, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Check, RotateCcw, FileText, BookOpen, Layers, PlayCircle, Hash, Pill, ShieldCheck, CalendarDays, Star } from 'lucide-react'
import { flatTopics, loadClassRoutes, norm, searchBook } from '../../../lib/lector/content'
import { cardsFor, getProgress, getStore, isDone } from '../../../lib/lector/userData'
import { useHistoryLayer } from '../../../lib/lector/nav'
import { TopicBody, watermarkUrl } from '../render'
import { Bottom, Filter, Hero, PDF_LABEL, PdfButton, Progress, Root, Top, plural, tParts, tUrl, useBoot, useFine, useKeys, useReader, useSwipe } from './common'

const cardKey = (topicId, cardId) => `${topicId}.${cardId}`
const stars = n => '★'.repeat(Math.max(0, Math.min(3, Number(n) || 0)))
const EXTRA_ICON = { 'x-num': Hash, 'x-drug': Pill, 'x-ges': ShieldCheck, 'x-plan': CalendarDays, 'x-prio': Star }

// Frente de una tarjeta «Completa el dato» (punto sin «dato: respuesta»): el comienzo de la frase con «…».
// Misma regla que clozeFront() de build_movil_repaso.cjs (se arma aquí también: así los JSON viejos salen bien).
//  · si la primera frase termina pronto (punto, punto y coma o dos puntos), el frente es esa frase: nunca se corta
//    justo después de un punto («…contraindicada. La…»);
//  · no termina en un número, un signo (<, >, =, +) ni una palabra suelta como «de», «a», «entre» («…entre +1.0…»);
//  · si no queda otra, se alarga hasta una palabra con contenido («A los 2 meses…»);
//  · deja al menos dos palabras para completar.
const STOP = new Set('a al ante bajo con contra de del desde e el en entre es está están hacia hasta la las le les lo los más menos ni no o para pero por que se según sin sobre son su sus tras u un una uno unos unas y ya vs'.split(' '))
const isEnd = (w, next) => /[;:]$/.test(w) || (/[.]$/.test(w) && !/^\d/.test(w) && w.length > 3 && /^[A-ZÁÉÍÓÚÑ¿¡(«]/.test(next || ''))
const weak = w => STOP.has(w.toLowerCase().replace(/[,;:.]+$/, '')) || /\d/.test(w) || /^[<>≤≥=+\-–/±~*]+$/.test(w)
export function clozeFront(text) {
  const w = String(text || '').trim().split(/\s+/).filter(Boolean), L = w.length
  if (L < 6) return '¿Qué te preguntan de este tema?'
  let n = Math.min(8, Math.max(3, Math.round(L * 0.4)))
  for (let i = 0; i < Math.min(L - 2, n + 3); i++) if (isEnd(w[i], w[i + 1])) { if (i >= 2) n = i + 1; else n = Math.max(n, i + 4); break }
  n = Math.min(n, L - 2)
  while (n > 3 && weak(w[n - 1])) n--
  if (weak(w[n - 1])) {
    let m = n + 1
    while (m < L - 2 && weak(w[m - 1])) m++
    if (!weak(w[m - 1])) n = m
  }
  if (n < 2) return '¿Qué te preguntan de este tema?'
  return `${w.slice(0, n).join(' ').replace(/[,;:.]+$/, '')}…`
}
const enteraFront = card => clozeFront(card.back)

// Una tarjeta: frente; al tocar, el reverso y los botones.
function Card({ card, state, open, onToggle, onRate, big = false, fine = false }) {
  return (
    <div className={`lwx-card ${open ? 'open' : ''} ${state || ''} ${big ? 'big' : ''}`}>
      <button className="lwx-card-f" onClick={onToggle} aria-expanded={open}>
        <small>{card.kind === 'trampa' ? `Trampa · ${card.frontLabel || 'Dato'}` : card.entera ? 'Completa el dato' : 'Te preguntan'}</small>
        <b>{card.entera ? enteraFront(card) : card.front}</b>
        {!open && <em>{fine ? 'Haz clic para ver la respuesta' : 'Toca para ver la respuesta'}</em>}
      </button>
      {open && (
        <div className="lwx-card-b">
          {card.campos?.length
            ? <dl>{card.campos.map((c, i) => <div key={i} className={/error/i.test(c.k) ? 'bad' : ''}><dt>{c.k}</dt><dd>{c.v}</dd></div>)}</dl>
            : <p>{card.back}</p>}
          <div className="lwx-card-a">
            <button className={`lwx-rate rep ${state === 'rep' ? 'on' : ''}`} onClick={() => onRate('rep')} aria-pressed={state === 'rep'}><RotateCcw size={15} />Repasar</button>
            <button className={`lwx-rate se ${state === 'se' ? 'on' : ''}`} onClick={() => onRate('se')} aria-pressed={state === 'se'}><Check size={16} strokeWidth={3} />Lo sé</button>
          </div>
        </div>
      )}
    </div>
  )
}

// Secciones finales del libro. Los temas que nombran se pueden abrir.
function Extra({ x, onTopic, body }) {
  const T = ({ id, label, title, children }) => (
    <button className="lwx-x-t" onClick={() => onTopic(id)}><i>{label}</i><span>{title}</span>{children}</button>
  )
  const groups = rows => {
    const out = []
    for (const row of rows || []) { const g = out[out.length - 1]; if (g && g.tema === row.tema) g.rows.push(row); else out.push({ tema: row.tema, label: row.label, title: row.title, rows: [row] }) }
    return out
  }
  if (x.id === 'x-num') {
    return groups(x.rows).map(g => (
      <section key={g.tema} className="lwx-x-g">
        <T id={g.tema} label={g.label} title={g.title} />
        <ul>{g.rows.map((n, i) => <li key={i}><span>{n.text}</span>{n.tipo && <em>{n.tipo}</em>}</li>)}</ul>
      </section>
    ))
  }
  if (x.id === 'x-drug') {
    return groups(x.rows).map(g => (
      <section key={g.tema} className="lwx-x-g">
        <T id={g.tema} label={g.label} title={g.title} />
        <ul>{g.rows.map((d, i) => <li key={i} className="col"><small>{d.sit}</small><b>{d.drug}</b>{d.det && <span>{d.det}</span>}</li>)}</ul>
      </section>
    ))
  }
  if (x.id === 'x-ges') {
    return (
      <>
        {(x.rows || []).map((g, i) => (
          <section key={i} className="lwx-x-g">
            <T id={g.tema} label={g.label} title={g.title} />
            <ul><li className="col"><b>{g.ges}</b></li></ul>
          </section>
        ))}
        {x.sinGes?.length > 0 && <p className="lwx-x-note">Temas sin GES: {x.sinGes.join(', ')}.</p>}
      </>
    )
  }
  if (x.id === 'x-plan') {
    return (x.dias || []).map(d => (
      <section key={d.dia} className="lwx-x-g">
        <h3>Día {d.dia}{d.temas?.length ? <span>{plural(d.temas.length, 'tema', 'temas')}</span> : null}</h3>
        {(d.temas || []).map(t => <T key={t.tema} id={t.tema} label={t.label} title={t.title}>{t.stars ? <em className="st">{stars(t.stars)}</em> : null}</T>)}
        {d.tareas?.length > 0 && <ul>{d.tareas.map((t, i) => <li key={i}><span>{t}</span></li>)}</ul>}
        {d.practica?.length > 0 && <p className="lwx-x-note">Preguntas del Libro Gordo: {d.practica.join(', ')}.</p>}
      </section>
    ))
  }
  if (x.id === 'x-prio') {
    return (x.grupos || []).map(g => (
      <section key={g.stars} className="lwx-x-g">
        <h3><em className="st">{stars(g.stars)}</em> {g.label}<span>{plural(g.temas.length, 'tema', 'temas')}</span></h3>
        {g.temas.map(t => <T key={t.tema} id={t.tema} label={t.label} title={t.title}><em>{t.real}{t.ges ? ' · GES' : ''}</em></T>)}
      </section>
    ))
  }
  return body
}

// Sesión: primero las marcadas «Repasar», después las que aún no se ven
function sessionOf(list, cards, from) {
  const p = list.filter(c => cards[c.key] !== 'se')
  if (!p.length) return null
  return { list: [...p.filter(c => cards[c.key] === 'rep'), ...p.filter(c => cards[c.key] !== 'rep')], pos: 0, open: false, from, se: 0, rep: 0 }
}

export default function RepasoView({ item, fileIdx, title, book, bookKey, user, onClose, onOpenPdf, paused = false, initialTopicId = null }) {
  const navigate = useNavigate()
  const topics = useMemo(() => flatTopics(book), [book])
  const allCards = useMemo(() => topics.flatMap(t => (t.cards || []).map(c => ({ card: c, topic: t, key: cardKey(t.id, c.id) }))), [topics])
  const extras = Array.isArray(book.extras) ? book.extras : []
  const boot = useBoot()
  // entrada desde la dirección (recarga, vuelta desde una clase)
  const [first] = useState(() => {
    const p = tParts(initialTopicId)
    if (!p.length) return null
    const ex = extras.some(x => x.id === p[0]) ? p.shift() : null
    const ti = p.length ? topics.findIndex(t => t.id === p[0]) : -1
    if (ti >= 0) p.shift()
    const out = { extraId: ex, idx: ti, topicFrom: ex ? 'extra' : 'start', view: ti >= 0 ? 'topic' : ex ? 'extra' : 'start', ses: null }
    if (p[0] === 'rep') {
      const cardsNow = user?.id ? cardsFor(getStore(user.id).get(), bookKey) : {}
      const list = ti >= 0 ? allCards.filter(c => c.topic.id === topics[ti].id) : allCards
      out.ses = sessionOf(list, cardsNow, ti >= 0 ? 'topic' : 'start')
      if (out.ses) out.view = 'session'
    }
    return out.view === 'start' ? null : out
  })
  const [view, setView] = useState(first?.view || 'start') // 'start' | 'topic' | 'session' | 'extra'
  const [idx, setIdx] = useState(Math.max(0, first?.idx ?? 0))
  const [topicFrom, setTopicFrom] = useState(first?.topicFrom || 'start') // de dónde se abrió el tema: 'start' | 'extra'
  const [openCards, setOpenCards] = useState({})
  const [extraId, setExtraId] = useState(first?.extraId || null)
  const [ses, setSes] = useState(first?.ses || null) // { list: [{card, topic, key}], pos, open, from, se, rep }
  const [classes, setClasses] = useState(null)
  const [q, setQ] = useState('')
  const dq = useDeferredValue(q)
  const [jump, setJump] = useState(null) // { query, focus } al abrir un tema desde el buscador
  const [sheetOpen, setSheetOpen] = useState({}) // [tema] = la hoja del tema abierta / cerrada (si el estudiante la tocó)
  const fine = useFine()
  useEffect(() => { let live = true; loadClassRoutes().then(m => live && setClasses(m)); return () => { live = false } }, [])

  const back = () => {
    if (view === 'session') return setView(ses?.from || 'start')
    if (view === 'topic') return setView(topicFrom)
    if (view === 'extra') return setView('start')
    return onClose?.()
  }
  const r = useReader({ user, bookKey, paused, onBack: back })
  const { data, store } = r
  const prog = getProgress(data, bookKey)
  const cards = cardsFor(data, bookKey)
  const topic = topics[idx]
  const last = prog?.topicId ? topics.find(t => t.id === prog.topicId) : null
  const nSe = allCards.filter(c => cards[c.key] === 'se').length
  const nRep = allCards.filter(c => cards[c.key] === 'rep').length
  const pending = list => list.filter(c => cards[c.key] !== 'se')
  const count = t => { const l = t.cards || []; return { total: l.length, se: l.filter(c => cards[cardKey(t.id, c.id)] === 'se').length, rep: l.filter(c => cards[cardKey(t.id, c.id)] === 'rep').length } }

  const openTopic = (i, from, j = null) => {
    const n = Math.min(Math.max(0, i), topics.length - 1)
    if (from) setTopicFrom(from)
    setJump(j)
    if (j) setSheetOpen(o => ({ ...o, [topics[n].id]: true })) // el resultado de la búsqueda está en la hoja
    setIdx(n); setOpenCards({}); setView('topic')
    store.setProgress(bookKey, { topicId: topics[n].id })
  }
  const openId = (id, from) => { const i = topics.findIndex(t => t.id === id); if (i >= 0) openTopic(i, from) }
  const startSession = (list, from) => {
    const s = sessionOf(list, cards, from)
    if (s) { setSes(s); setView('session') }
  }
  const sesCur = ses && ses.list[ses.pos]
  const sesRate = v => {
    if (!sesCur) return
    store.setCard(bookKey, sesCur.key, v)
    setSes(s => ({ ...s, pos: s.pos + 1, open: false, [v]: s[v] + 1 }))
  }
  const sesMove = d => setSes(s => (s && s.pos + d >= 0 && s.pos + d <= s.list.length ? { ...s, pos: s.pos + d, open: false } : s))

  useKeys(e => {
    if (r.aa) return false
    if (view === 'session' && sesCur) {
      if (e.key === ' ' || e.key === 'Enter') { setSes(s => ({ ...s, open: !s.open })); return true }
      if (e.key === 'ArrowRight') { sesMove(1); return true }
      if (e.key === 'ArrowLeft') { sesMove(-1); return true }
      if (ses.open && e.key === '1') { sesRate('rep'); return true }
      if (ses.open && e.key === '2') { sesRate('se'); return true }
    }
    if (view === 'topic') {
      if (e.key === 'ArrowRight') { if (idx < topics.length - 1) openTopic(idx + 1); return true }
      if (e.key === 'ArrowLeft') { if (idx > 0) openTopic(idx - 1); return true }
    }
    return false
  }, !paused)
  const scrollRef = useRef(null)
  const sesRef = useRef(null)
  useSwipe(sesRef, { onLeft: () => sesMove(1), onRight: () => sesMove(-1) }, view === 'session')
  useLayoutEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = 0 }, [idx, view, extraId])
  // índice (con los resultados del buscador): al volver de un tema queda a la misma altura
  const homeRef = useRef(null)
  const homeY = useRef(0)
  useLayoutEffect(() => {
    const el = homeRef.current
    if (view !== 'start' || !el || !homeY.current) return undefined
    const y = homeY.current
    el.scrollTop = y
    const t = setTimeout(() => { if (homeRef.current && Math.abs(homeRef.current.scrollTop - y) > 4) homeRef.current.scrollTop = y }, 80)
    return () => clearTimeout(t)
  }, [view])

  const extra = extras.find(x => x.id === extraId)
  const extraTopic = useMemo(() => (extra ? { id: extra.id, title: extra.title, html: extra.html || '' } : null), [extra])
  const done = topic ? isDone(data, bookKey, topic.id) : false
  const tc = topic ? count(topic) : null
  const topicCards = topic ? (topic.cards || []).map(c => ({ card: c, topic, key: cardKey(topic.id, c.id) })) : []
  const classRoute = topic?.classId ? classes?.get(topic.classId) : null
  const nPending = allCards.length - nSe
  // buscador del libro: en el texto de cada tema (la hoja trae «Lo que te preguntan», la tabla y las trampas: lo mismo que las
  // tarjetas) y en el número del tema. Al abrir un resultado se abre la hoja en ese punto, con lo buscado marcado.
  const query = dq.trim()
  const results = useMemo(() => {
    if (query.length < 2) return null
    const res = searchBook(book, query, { perTopic: 2 }).map(x => {
      // la hoja trae las respuestas: mientras el tema tenga tarjetas sin marcar, los fragmentos salen solo del frente de las tarjetas
      const list = x.topic.cards || []
      if (!list.length || list.every(c => cards[cardKey(x.topic.id, c.id)])) return x
      const nq = norm(query)
      const hits = []
      for (const c of list) {
        const f = String(c.front || '')
        const at = norm(f).indexOf(nq)
        if (at < 0) continue
        const pre = f.slice(Math.max(0, at - 48), at), post = f.slice(at + nq.length, at + nq.length + 72)
        hits.push({ front: true, pre: at > 48 ? pre.replace(/^\S*\s/, '') : pre, match: f.slice(at, at + nq.length), post: post.length >= 72 ? post.replace(/\s\S*$/, '') : post })
        if (hits.length >= 2) break
      }
      return { ...x, hits, front: true }
    })
    const got = new Set(res.map(x => x.topic.id))
    return [...topics.filter(t => !got.has(t.id) && String(t.label).startsWith(query)).map(t => ({ topic: t, count: 0, inTitle: false, hits: [] })), ...res]
  }, [book, topics, query]) // eslint-disable-line react-hooks/exhaustive-deps
  // la hoja del tema tiene las respuestas de las tarjetas: cerrada mientras queden tarjetas sin marcar (se abre con un botón)
  const sheetDefault = useMemo(() => !topic || !(topic.cards || []).length || (topic.cards || []).every(c => cards[cardKey(topic.id, c.id)]), [topic?.id]) // eslint-disable-line react-hooks/exhaustive-deps
  const sheetShown = topic ? sheetOpen[topic.id] ?? sheetDefault : false
  const sheetRef = useRef(null)
  const toggleSheet = () => {
    if (!topic) return
    setSheetOpen(o => ({ ...o, [topic.id]: !sheetShown }))
    // al abrirla: arriba de la hoja (en computador pasa a la columna derecha)
    if (!sheetShown) requestAnimationFrame(() => sheetRef.current?.scrollIntoView({ block: 'start' }))
  }

  // Historial: sección final (también debajo de un tema abierto desde ahí) → tema → sesión de repaso.
  // Cerrar con la flecha, Escape o «Volver al tema» vuelve atrás en el historial (no quedan entradas muertas).
  const inTopic = view === 'topic' || (view === 'session' && ses?.from === 'topic')
  const inExtra = view === 'extra' || (inTopic && topicFrom === 'extra')
  const exPart = inExtra ? extraId : null
  useHistoryLayer(inExtra, () => setView('start'), { url: inExtra ? tUrl(extraId) : null, adopt: boot && !!first?.extraId })
  useHistoryLayer(inTopic, () => setView(v => (v === 'topic' ? topicFrom : v)), { url: inTopic && topic ? tUrl(exPart, topic.id) : null, adopt: boot && first?.idx >= 0 })
  useHistoryLayer(view === 'session', () => setView(v => (v === 'session' ? ses?.from || 'start' : v)),
    { url: view === 'session' ? tUrl(exPart, ses?.from === 'topic' ? topic?.id : null, 'rep') : null, adopt: boot && !!first?.ses })

  return (
    <Root book={book} r={r}>
      {view === 'start' && (
        <>
          <Top close onBack={onClose} title={title || book.title} onAa={() => r.setAa(true)} onPdf={onOpenPdf} r={r} />
          <div className="lw-scroll" ref={homeRef} onScroll={e => { homeY.current = e.currentTarget.scrollTop }}>
            <div className="lw-start lwx-home">
              <aside className="lwx-home-side">
                <Hero item={item} fileIdx={fileIdx} book={book} />
                <button className="lw-continue" onClick={() => (last ? openId(last.id, 'start') : openTopic(0, 'start'))}>
                  <BookOpen size={22} />
                  <span>
                    <small>{last ? 'Continuar donde quedaste' : 'Empezar el repaso'}</small>
                    <b>{(last || topics[0]) ? `${(last || topics[0]).label} · ${(last || topics[0]).title}` : ''}</b>
                  </span>
                  <ChevronRight size={20} />
                </button>
                <Progress n={nSe} total={allCards.length}><b>{nSe}</b> de {allCards.length} tarjetas que ya sabes</Progress>
                <div className="lwx-stats">
                  <span className="rep"><RotateCcw size={14} />{nRep} para repasar</span>
                  <span>{allCards.length - nSe - nRep} sin ver</span>
                </div>
                <button className="lw-btn lwx-wide lwx-sec-btn" disabled={!nPending} onClick={() => startSession(allCards, 'start')}>
                  <Layers size={16} />{nPending ? `Repasar las tarjetas pendientes (${nPending})` : 'No te quedan tarjetas pendientes'}
                </button>

                {extras.length > 0 && (
                  <>
                    <div className="lw-toc-b"><div>Para el final</div></div>
                    <div className="lwx-more lwx-more-list">
                      {extras.map(x => {
                        const Icon = EXTRA_ICON[x.id] || FileText
                        return <button key={x.id} onClick={() => { setExtraId(x.id); setView('extra') }}><Icon size={18} /><b>{x.title}</b><ChevronRight size={16} className="lwx-more-go" /></button>
                      })}
                    </div>
                  </>
                )}
                <PdfButton onPdf={onOpenPdf} />
              </aside>

              <div className="lwx-home-main">
                <div className="lwx-home-h">
                  <h2>Temas</h2>
                  <Filter value={q} onChange={setQ} placeholder="Buscar en el libro" />
                </div>
                {results ? (
                  results.length ? (
                    <div className="lwx-hits">
                      <p className="lwx-hits-n">{plural(results.length, 'tema', 'temas')} con «{query.length > 60 ? `${query.slice(0, 60)}…` : query}»</p>
                      {results.map(({ topic: t, count: n, hits, front }) => (
                        <div key={t.id} className="lwx-hit">
                          <button className="lw-toc-t lwx-hit-t" onClick={() => openTopic(t.index, 'start', { query, focus: hits[0] ? { start: hits[0].start, end: hits[0].end, n: Date.now() } : null })}>
                            <span className="lw-toc-n">{t.label}</span>
                            <span>{t.title}</span>
                            {n > 0 && <span className="lwx-count">{n}</span>}
                          </button>
                          {hits.map((h, i) => (
                            <button key={i} className="lwx-hit-s" onClick={() => openTopic(t.index, 'start', { query, focus: h.front ? null : { start: h.start, end: h.end, n: Date.now() } })}>
                              {h.pre ? '…' : ''}{h.pre}<mark>{h.match}</mark>{h.post}{h.post ? '…' : ''}
                            </button>
                          ))}
                          {front
                            ? n > 0 && <small className="lwx-hit-more">{plural(n, 'vez', 'veces')} en la hoja del tema (con las respuestas): ábrela cuando termines las tarjetas</small>
                            : n > hits.length && <small className="lwx-hit-more">y {plural(n - hits.length, 'vez más', 'veces más')} en este tema: ábrelo para verlas marcadas</small>}
                        </div>
                      ))}
                    </div>
                  ) : <p className="lw-empty"><b>Sin resultados</b>Prueba con otra palabra o con el número del tema.</p>
                ) : (
                <div className="lwx-cols">
                  {(book.blocks || []).map(b => {
                    const list = topics.filter(t => t.block.n === b.n)
                    if (!list.length) return null
                    const tot = list.reduce((a, t) => { const c = count(t); return { se: a.se + c.se, total: a.total + c.total } }, { se: 0, total: 0 })
                    return (
                      <section key={b.n} className="lwx-sec">
                        <div className="lw-toc-b"><div>Bloque {b.n} · {b.name}</div><span>{tot.se}/{tot.total}</span></div>
                        <div className="lw-toc">
                          {list.map(t => {
                            const c = count(t)
                            return (
                              <button key={t.id} className={`lw-toc-t ${last?.id === t.id ? 'cur' : ''}`} onClick={() => openTopic(t.index, 'start')}>
                                <span className="lw-toc-n">{t.label}</span>
                                <span>{t.title}{t.stars ? <em className="lwx-st" aria-label={t.prioridad || ''}> {stars(t.stars)}</em> : null}</span>
                                <span className={`lwx-count ${c.total && c.se === c.total ? 'full' : ''} ${c.rep ? 'rep' : ''}`}>{c.se}/{c.total}</span>
                              </button>
                            )
                          })}
                        </div>
                      </section>
                    )
                  })}
                </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {view === 'topic' && topic && (
        <>
          <Top onBack={back} backLabel="Volver al índice" kicker={`${topic.label} · Bloque ${topic.block.n}`} title={topic.title} onAa={() => r.setAa(true)} r={r} />
          <div ref={scrollRef} className="lw-scroll" style={{ backgroundImage: watermarkUrl(r.mark, data.prefs.dark) }}>
            <article className={`lw-doc lwx-rt ${sheetShown ? 'with-sheet' : ''}`} style={{ fontSize: r.fs }}>
              <header className="lwx-rt-h">
                <div className="lw-kicker">Bloque {topic.block.n} · {topic.block.name}</div>
                <h2><span className="lw-num">{topic.label}</span> {topic.title}</h2>
                <div className="lw-acts">
                  {classRoute && <button className="lw-act clase" onClick={() => navigate(classRoute)}><PlayCircle size={16} />Ver la clase</button>}
                  <button className="lw-act" onClick={() => onOpenPdf?.()}><FileText size={15} />{PDF_LABEL}</button>
                </div>
              </header>

              <section className="lwx-rt-cards">
                <div className="lwx-deck-h">
                  <div><b>Tarjetas</b><span>{tc.se} de {tc.total} ya las sabes{tc.rep ? ` · ${tc.rep} para repasar` : ''}</span></div>
                  <button className="lw-btn" disabled={tc.se === tc.total} onClick={() => startSession(topicCards, 'topic')}><Layers size={15} />Repasar pendientes{tc.total - tc.se ? ` (${tc.total - tc.se})` : ''}</button>
                </div>
                <div className="lwx-cards">
                  {topicCards.map(({ card, key }) => (
                    <Card key={key} card={card} state={cards[key]} open={!!openCards[key]} fine={fine}
                      onToggle={() => setOpenCards(o => ({ ...o, [key]: !o[key] }))}
                      onRate={v => store.setCard(bookKey, key, cards[key] === v ? null : v)} />
                  ))}
                </div>
              </section>

              <section ref={sheetRef} className={`lwx-rt-sheet ${sheetShown ? 'open' : 'shut'}`}>
                <div className="lwx-sheet-h">
                  <div>
                    <b>La hoja del tema</b>
                    <span>{sheetShown ? 'Todo el tema en una página: puedes destacar y poner notas.' : 'Trae las respuestas de las tarjetas: ábrela cuando las termines.'}</span>
                  </div>
                  <button className={`lw-btn ${sheetShown ? '' : 'pri'}`} onClick={toggleSheet} aria-expanded={sheetShown}>
                    <BookOpen size={15} />{sheetShown ? 'Ocultar la hoja' : 'Ver la hoja del tema'}
                  </button>
                </div>
                {sheetShown && <TopicBody userId={user?.id} bookKey={bookKey} book={book} topic={topic} mark={r.mark} query={jump?.query || ''} focus={jump?.focus || null} />}
                {topics[idx + 1] && (
                  <button className="lw-next" onClick={() => openTopic(idx + 1)}>
                    <span><small>Siguiente tema</small><b>{topics[idx + 1].label} · {topics[idx + 1].title}</b></span><ChevronRight size={20} />
                  </button>
                )}
              </section>
            </article>
          </div>
          <Bottom>
            <button className="lw-step" onClick={() => openTopic(idx - 1)} disabled={idx === 0} aria-label="Tema anterior"><ChevronLeft size={18} />{topics[idx - 1]?.label}</button>
            <button className={`lw-done ${done ? 'on' : ''}`} onClick={() => store.setDone(bookKey, topic.id, !done)} aria-pressed={done}>
              <Check size={17} strokeWidth={3} />{done ? 'Estudiado' : 'Marcar como estudiado'}
            </button>
            <button className="lw-step" onClick={() => openTopic(idx + 1)} disabled={idx >= topics.length - 1} aria-label="Tema siguiente">{topics[idx + 1]?.label}<ChevronRight size={18} /></button>
          </Bottom>
        </>
      )}

      {view === 'session' && ses && (
        <>
          <Top onBack={back} backLabel="Salir del repaso" title="Repasar pendientes" onAa={() => r.setAa(true)} r={r}
            kicker={sesCur ? `Tarjeta ${ses.pos + 1} de ${ses.list.length}` : 'Repaso terminado'} />
          <div className="lwx-ses-bar"><i style={{ width: `${Math.round((Math.min(ses.pos, ses.list.length) / ses.list.length) * 100)}%` }} /></div>
          <div ref={sesRef} className="lw-scroll">
            {sesCur ? (
              <div className="lwx-ses" style={{ fontSize: r.fs }}>
                <div className="lw-kicker">{sesCur.topic.label} · {sesCur.topic.title}</div>
                <Card big fine={fine} card={sesCur.card} state={cards[sesCur.key]} open={ses.open}
                  onToggle={() => setSes(s => ({ ...s, open: !s.open }))} onRate={sesRate} />
              </div>
            ) : (
              <div className="lwx-ses lwx-end">
                <h2>Repaso terminado</h2>
                <p>{plural(ses.se, 'tarjeta', 'tarjetas')} que ya sabes y {ses.rep} para repasar.</p>
                {ses.rep > 0 && (
                  <button className="lw-btn pri" onClick={() => startSession(ses.list, ses.from)}><RotateCcw size={16} />Repasar otra vez las {pending(ses.list).length} que quedan</button>
                )}
                <button className="lw-btn" onClick={back}>{ses.from === 'topic' ? 'Volver al tema' : 'Volver al índice'}</button>
              </div>
            )}
          </div>
          {sesCur && (
            <Bottom>
              <button className="lw-step" onClick={() => sesMove(-1)} disabled={ses.pos === 0} aria-label="Tarjeta anterior"><ChevronLeft size={18} /></button>
              <button className="lwx-rate show" onClick={() => (ses.open ? sesMove(1) : setSes(s => ({ ...s, open: true })))}>{ses.open ? 'Saltar esta tarjeta' : 'Ver la respuesta'}</button>
              <button className="lw-step" onClick={() => sesMove(1)} aria-label="Tarjeta siguiente"><ChevronRight size={18} /></button>
            </Bottom>
          )}
        </>
      )}

      {view === 'extra' && extra && (
        <>
          <Top onBack={back} backLabel="Volver al índice" kicker={book.title} title={extra.title} onAa={() => r.setAa(true)} onPdf={onOpenPdf} r={r} />
          <div ref={scrollRef} className="lw-scroll" style={{ backgroundImage: watermarkUrl(r.mark, data.prefs.dark) }}>
            <article className="lw-doc lwx-x" style={{ fontSize: r.fs }}>
              <h2>{extra.title}</h2>
              {extra.lead && <p className="lwx-x-lead">{extra.lead}</p>}
              <Extra x={extra} onTopic={id => openId(id, 'extra')}
                body={<TopicBody userId={user?.id} bookKey={bookKey} book={book} topic={extraTopic} mark={r.mark} />} />
            </article>
          </div>
        </>
      )}
    </Root>
  )
}
