// Lector web · Perfil V3 código por código: lista de códigos con buscador (código o nombre, sin importar tildes) y
// filtros por sección / especialidad y nivel; al tocar un código se abre su ficha (con preguntas que se responden ahí).
// El archivo «Preguntas de práctica» (book.variant === 'preguntas') se muestra como una corrida de preguntas.
// Guarda: código estudiado (progress.done), último código o pregunta (progress.topicId) y respuestas (answers).
// «Estudiado» es uno por código: los libros por especialidad y el Completo usan el mismo id de código (c-1-01-1-005), así que
// al marcarlo se escribe en los dos libros (el de la especialidad y el Completo, `perfil-v3:<n>`) y cada uno lee el suyo.
// En computador: lista a la izquierda y la ficha (o el resumen del libro) a la derecha.
// Props (las de toda vista de LectorWeb): { item, fileIdx, title, book, bookKey, user, onClose, onOpenPdf(page?), paused, initialTopicId }
// Historial: la ficha de un código (o la pregunta abierta) es una entrada con ?t=<id>: «Atrás» vuelve a la lista o al inicio
// y al recargar se reabre la misma ficha.
import React, { useDeferredValue, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Check, Search, X, BookOpen, PlayCircle, ListFilter, FileText } from 'lucide-react'
import { bookFile, bookKey as keyOf, flatTopics, loadClassRoutes, norm } from '../../../lib/lector/content'
import { getProgress, isDone } from '../../../lib/lector/userData'
import { urlWith, useHistoryLayer } from '../../../lib/lector/nav'
import { TopicBody, watermarkUrl } from '../render'
import { Bottom, Hero, PDF_LABEL, PdfButton, Progress, Root, Top, plural, useBoot, useKeys, useReader, useSwipe, useWide } from './common'

const SECTIONS = [
  ['situacion', 'Situaciones clínicas'], ['urgencia', 'Situaciones clínicas de urgencia'], ['conocimiento', 'Conocimientos generales'],
  ['examen', 'Exámenes e imagenología'], ['procedimiento', 'Procedimientos'],
]
/* Niveles del Perfil V3. Situaciones clínicas: Diagnóstico (Sospecha / Específico), Tratamiento (Inicial / Completo) y
   Seguimiento (Completo / Derivar / No requiere). Exámenes y procedimientos tienen una sola escala («nivel») cada uno, con verbos
   distintos en el Perfil («Realizar» frente a «Realiza, interpreta y emplea»): aquí se muestran todos igual, en presente, y con
   el nombre de la escala delante, para que el filtro no mezcle «Realizar» (procedimiento) con «Realiza…» (examen). */
const NIVEL_TXT = { 'Realizar': 'Realiza', 'Derivar a especialista': 'Deriva a especialista' }
const nivelTxt = v => NIVEL_TXT[v] || v
const SCALE = [
  ['dx', 'Diagnóstico', null], ['tx', 'Tratamiento', null], ['seg', 'Seguimiento', null],
  ['nivel', 'Exámenes', 'examen'], ['nivel', 'Procedimientos', 'procedimiento'],
]
const LEVEL_ORDER = ['Sospecha', 'Específico', 'Inicial', 'Completo', 'Derivar', 'No requiere', 'Emplea informe', 'Interpreta y emplea', 'Realiza, interpreta y emplea', 'Realizar', 'Derivar a especialista']
const levelLabel = (k, v) => (k === 'nivel' ? nivelTxt(v) : v)
const nf = n => Number(n).toLocaleString('es-CL')
const levelText = t => {
  const n = t.niveles || {}
  const parts = [n.dx && `Dx ${n.dx}`, n.tx && `Tx ${n.tx}`, n.seg && `Seg ${n.seg}`,
    n.nivel && `${t.section === 'procedimiento' ? 'Procedimiento' : t.section === 'examen' ? 'Examen' : 'Nivel'}: ${nivelTxt(n.nivel)}`].filter(Boolean)
  return parts.join(' · ')
}

// Archivos del mismo producto: Completo ↔ libro de cada especialidad (por el nombre del archivo, igual que en api/_tienda.js).
const fileKey = s => String(s || '').normalize('NFC').toLowerCase().replace(/\s+/g, '_')
function perfilFiles(item) {
  const out = []
  for (let i = 0; i < 60; i++) { const f = bookFile(item, i); if (!f) break; out.push({ i, file: fileKey(f.file) }) }
  return out
}

/* ───────── lista con ventana: solo se dibujan las filas visibles (1.556 códigos en el Completo) ───────── */
const ROW = 66
function VirtualList({ items, render, resetKey, initialIndex = 0, ROW = 66 }) {
  const ref = useRef(null)
  const [win, setWin] = useState({ top: 0, h: 800 })
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const read = () => setWin(w => (w.top === el.scrollTop && w.h === el.clientHeight ? w : { top: el.scrollTop, h: el.clientHeight }))
    read()
    el.addEventListener('scroll', read, { passive: true })
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(read) : null
    ro?.observe(el)
    return () => { el.removeEventListener('scroll', read); ro?.disconnect() }
  }, [])
  // al cambiar la búsqueda o los filtros, vuelve arriba; al volver de una ficha, queda donde estaba ese código
  const first = useRef(true)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.scrollTop = first.current && initialIndex > 3 ? Math.max(0, (initialIndex - 2) * ROW) : 0
    first.current = false
  }, [resetKey]) // eslint-disable-line react-hooks/exhaustive-deps
  const from = Math.max(0, Math.floor(win.top / ROW) - 6)
  const to = Math.min(items.length, Math.ceil((win.top + win.h) / ROW) + 6)
  return (
    <div ref={ref} className="lw-scroll lwx-vscroll">
      <div className="lwx-vlist" style={{ height: items.length * ROW }}>
        <div style={{ transform: `translateY(${from * ROW}px)` }}>
          {items.slice(from, to).map((it, i) => render(it, from + i))}
        </div>
      </div>
    </div>
  )
}

export default function PerfilView(props) {
  return props.book?.variant === 'preguntas' ? <PreguntasRun {...props} /> : <Codigos {...props} />
}

/* ───────── códigos ───────── */
function Codigos({ item, fileIdx = 0, title, book, bookKey, user, onClose, onOpenPdf, paused = false, initialTopicId = null }) {
  const navigate = useNavigate()
  const wide = useWide()
  const topics = useMemo(() => flatTopics(book), [book])
  const completo = useMemo(() => (book.blocks || []).some(b => b.specKey), [book])
  const rowH = wide ? (completo ? 72 : 58) : (completo ? 80 : ROW) // Completo: la especialidad en su propia línea
  // texto de búsqueda de cada código: código + nombre (+ especialidad), sin tildes ni mayúsculas
  const keys = useMemo(() => topics.map(t => norm(`${t.code || t.label} ${t.name || t.title} ${completo ? t.block.name : ''}`)), [topics, completo])
  const [q, setQ] = useState('')
  const [spec, setSpec] = useState('') // Completo: especialidad (bloque)
  const [sec, setSec] = useState('')
  const [lvl, setLvl] = useState('') // 'dx=Específico'
  const [pend, setPend] = useState(false)
  const boot = useBoot()
  // ficha de entrada (?t=…): se abre en la lista completa
  const [first] = useState(() => { const i = initialTopicId ? topics.findIndex(t => t.id === initialTopicId) : -1; return i >= 0 ? { ids: topics.map(t => t.id), pos: i } : null })
  const [open, setOpen] = useState(first) // { ids, pos }
  const [classes, setClasses] = useState(null)
  useEffect(() => { let live = true; loadClassRoutes().then(m => live && setClasses(m)); return () => { live = false } }, [])
  const dq = useDeferredValue(q)

  const back = () => (open ? setOpen(null) : onClose?.())
  const r = useReader({ user, bookKey, paused, onBack: back })
  const { data, store } = r
  const prog = getProgress(data, bookKey)
  const doneMap = prog?.done || {}
  const nDone = topics.filter(t => doneMap[t.id]).length

  // el otro libro donde está el mismo código: Completo → libro de su especialidad; especialidad → Completo
  const peerKeyOf = useMemo(() => {
    const files = perfilFiles(item)
    const full = files.find(f => /_completo_/.test(f.file))
    if (!completo) return () => (full && full.i !== Number(fileIdx) ? keyOf(item, full.i) : null)
    const bySpec = new Map((book.blocks || []).map(b => {
      const f = files.find(x => x.file.endsWith(`_${fileKey(b.name)}.pdf`))
      return [b.n, f && f.i !== Number(fileIdx) ? keyOf(item, f.i) : null]
    }))
    return t => bySpec.get(t.block.n) || null
  }, [item, fileIdx, completo, book])
  const setDone = (t, on) => {
    store.setDone(bookKey, t.id, on)
    const peer = peerKeyOf(t)
    if (peer) store.setDone(peer, t.id, on)
  }

  // filtro de nivel: un grupo por escala, con los valores que hay en este libro
  const levels = useMemo(() => SCALE.map(([k, label, sec]) => {
    const vals = new Set()
    for (const t of topics) { const v = t.niveles?.[k]; if (v && (!sec || t.section === sec)) vals.add(v) }
    const opts = [...vals].sort((a, b) => LEVEL_ORDER.indexOf(a) - LEVEL_ORDER.indexOf(b) || a.localeCompare(b, 'es'))
      .map(v => [`${k}=${v}`, `${label === 'Exámenes' ? 'Examen' : label === 'Procedimientos' ? 'Procedimiento' : label}: ${levelLabel(k, v)}`])
    return { label, opts }
  }).filter(g => g.opts.length), [topics])
  const sections = useMemo(() => SECTIONS.filter(([k]) => topics.some(t => t.section === k)), [topics])

  const list = useMemo(() => {
    const words = norm(dq.trim()).split(/\s+/).filter(Boolean)
    const [lk, lv] = lvl ? lvl.split('=') : []
    const out = []
    for (let i = 0; i < topics.length; i++) {
      const t = topics[i]
      if (spec && String(t.block.n) !== spec) continue
      if (sec && t.section !== sec) continue
      if (lk && t.niveles?.[lk] !== lv) continue
      if (pend && doneMap[t.id]) continue
      if (words.length && !words.every(w => keys[i].includes(w))) continue
      out.push(t)
    }
    return out
  }, [topics, keys, dq, spec, sec, lvl, pend, pend ? doneMap : null]) // eslint-disable-line react-hooks/exhaustive-deps

  const openCode = (ids, pos) => { setOpen({ ids, pos }); store.setProgress(bookKey, { topicId: ids[pos] }) }
  const openFromList = t => { const ids = list.map(x => x.id); openCode(ids, Math.max(0, ids.indexOf(t.id))) }
  const move = d => { if (open && open.pos + d >= 0 && open.pos + d < open.ids.length) openCode(open.ids, open.pos + d) }
  const byId = useMemo(() => new Map(topics.map(t => [t.id, t])), [topics])
  const cur = open ? byId.get(open.ids[open.pos]) : null
  // la ficha abierta es una entrada del historial; cerrarla (flecha, «Resumen del libro», Escape) vuelve atrás
  useHistoryLayer(!!open, () => setOpen(null), { url: cur ? urlWith({ t: cur.id }) : null, adopt: boot && !!first })
  const last = prog?.topicId ? byId.get(prog.topicId) : null
  const filtered = !!(dq.trim() || spec || sec || lvl || pend)
  const clear = () => { setQ(''); setSpec(''); setSec(''); setLvl(''); setPend(false) }

  useKeys(e => {
    if (!open || r.aa) return false
    if (e.key === 'ArrowRight') { move(1); return true }
    if (e.key === 'ArrowLeft') { move(-1); return true }
    return false
  }, !paused)
  const scrollRef = useRef(null)
  useSwipe(scrollRef, { onLeft: () => move(1), onRight: () => move(-1) }, !!open)
  useLayoutEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = 0 }, [cur?.id])

  const done = cur ? isDone(data, bookKey, cur.id) : false
  const classBtn = cur ? (cur.donde || []).map(d => ({ d, route: d.classId && classes?.get(d.classId) })).filter(x => x.route) : []
  const lastIndex = last ? list.indexOf(last) : -1
  const progKicker = `${nf(nDone)} de ${nf(topics.length)} estudiados`
  // el número de códigos ya va arriba (en la línea del avance): el título queda sin el paréntesis y cabe en el teléfono
  const topTitle = String(title || book.title || '').replace(/\s*\([\d.\s]+códigos\)\s*$/, '')

  // resumen por grupo (computador, sin ficha abierta): especialidades en el Completo, secciones en los demás
  const groups = useMemo(() => {
    if (completo) return (book.blocks || []).map(b => ({ key: String(b.n), name: b.name, ids: (b.topics || []).map(t => t.id), pick: () => { clear(); setSpec(String(b.n)) } }))
    return sections.map(([k, label]) => ({ key: k, name: label, ids: topics.filter(t => t.section === k).map(t => t.id), pick: () => { clear(); setSec(k) } }))
  }, [completo, book, sections, topics]) // eslint-disable-line react-hooks/exhaustive-deps

  const finder = (
    <div className="lwx-find">
      <div className="lwx-find-in">
        <div className="lwx-q">
          <Search size={17} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Busca un código o una enfermedad" enterKeyHint="search" inputMode="search"
            autoComplete="off" autoCorrect="off" spellCheck={false} aria-label="Buscar un código o una enfermedad" />
          {q && <button onClick={() => setQ('')} aria-label="Borrar la búsqueda"><X size={16} /></button>}
        </div>
        <div className={`lwx-filters ${completo ? 'n4' : 'n3'}`}>
          {completo && (
            <select value={spec} onChange={e => setSpec(e.target.value)} aria-label="Especialidad" className={spec ? 'on' : ''}>
              <option value="">Especialidad: todas</option>
              {(book.blocks || []).map(b => <option key={b.n} value={String(b.n)}>{b.name} ({b.topics.length})</option>)}
            </select>
          )}
          <select value={sec} onChange={e => setSec(e.target.value)} aria-label="Sección" className={sec ? 'on' : ''}>
            <option value="">Sección: todas</option>
            {sections.map(([k, label]) => <option key={k} value={k}>{label}</option>)}
          </select>
          <select value={lvl} onChange={e => setLvl(e.target.value)} aria-label="Nivel" className={lvl ? 'on' : ''}>
            <option value="">Nivel: todos</option>
            {levels.map(g => <optgroup key={g.label} label={g.label}>{g.opts.map(([k, label]) => <option key={k} value={k}>{label}</option>)}</optgroup>)}
          </select>
          <button className={`lwx-chip ${pend ? 'on' : ''}`} onClick={() => setPend(p => !p)} aria-pressed={pend}>
            <i className={`lw-tick ${pend ? 'on' : ''}`} aria-hidden="true"><Check size={11} strokeWidth={3} /></i>Solo sin estudiar
          </button>
        </div>
        <div className="lwx-find-n">
          <span>{filtered ? `${nf(list.length)} ${list.length === 1 ? 'código' : 'códigos'} de ${nf(topics.length)}` : `${nf(topics.length)} códigos`}</span>
          {filtered
            ? <button onClick={clear}>Quitar filtros</button>
            : last && !wide && <button onClick={() => openCode(topics.map(t => t.id), last.index)}>Continuar: {last.label}</button>}
        </div>
      </div>
    </div>
  )
  const listEl = list.length ? (
    <VirtualList items={list} ROW={rowH} resetKey={`${dq}|${spec}|${sec}|${lvl}|${pend}|${rowH}`} initialIndex={lastIndex}
      render={t => (
        <button key={t.id} className={`lwx-code ${last?.id === t.id ? 'cur' : ''} ${cur?.id === t.id ? 'open' : ''}`} style={{ height: rowH }} onClick={() => openFromList(t)} aria-current={cur?.id === t.id ? 'true' : undefined}>
          <span className="lwx-code-n">{t.code || t.label}</span>
          <span className="lwx-code-t"><b>{t.name || t.title}</b>{completo && <small className="lwx-code-sp">{t.block.name} · {t.sectionLabel}</small>}{(levelText(t) || !completo) && <small>{levelText(t) || t.sectionLabel}</small>}</span>
          <span className={`lw-tick ${doneMap[t.id] ? 'on' : ''}`} role="img" aria-label={doneMap[t.id] ? 'Estudiado' : 'Sin estudiar'}><Check size={14} strokeWidth={3} /></span>
        </button>
      )} />
  ) : (
    <div className="lw-scroll"><p className="lw-empty"><b>Sin resultados</b>Prueba con otra palabra o con el número del código (por ejemplo, 1.01.1.012).</p></div>
  )
  const sheet = cur && (
    <>
      <div ref={scrollRef} className="lw-scroll" style={{ backgroundImage: watermarkUrl(r.mark, data.prefs.dark) }}>
        <article className="lw-doc" style={{ fontSize: r.fs }}>
          <div className="lw-kicker">{completo ? `${cur.block.name} · ` : ''}{cur.sectionLabel || cur.block.name}</div>
          <h2><span className="lw-num">{cur.code || cur.label}</span> {cur.name || cur.title}</h2>
          <div className="lw-acts">
            {classBtn.map(({ d, route }, i) => (
              <button key={i} className="lw-act clase" onClick={() => navigate(route)}><PlayCircle size={16} />Ver la clase{d.libro ? ` · ${d.libro}` : ''} {d.tema}</button>
            ))}
            {onOpenPdf && <button className="lw-act" onClick={() => onOpenPdf()}><FileText size={15} />{PDF_LABEL}</button>}
          </div>
          <TopicBody key={cur.id} userId={user?.id} bookKey={bookKey} book={book} topic={cur} mark={r.mark} />
        </article>
      </div>
      <Bottom>
        <button className="lw-step" onClick={() => move(-1)} disabled={open.pos === 0} aria-label="Código anterior"><ChevronLeft size={18} /></button>
        <button className={`lw-done ${done ? 'on' : ''}`} onClick={() => setDone(cur, !done)} aria-pressed={done}>
          <Check size={17} strokeWidth={3} />{done ? 'Estudiado' : 'Marcar como estudiado'}
        </button>
        <button className="lw-step" onClick={() => move(1)} disabled={open.pos >= open.ids.length - 1} aria-label="Código siguiente"><ChevronRight size={18} /></button>
      </Bottom>
    </>
  )

  if (wide) {
    return (
      <Root book={book} r={r}>
        <Top close onBack={onClose} title={topTitle} kicker={progKicker} onAa={() => r.setAa(true)} onPdf={onOpenPdf} r={r} />
        <div className="lwx-md">
          <aside className="lwx-md-list">
            {finder}
            {listEl}
          </aside>
          <section className="lwx-md-main">
            {cur ? (
              <>
                <div className="lwx-md-bar">
                  <button className="lwx-link" onClick={() => setOpen(null)}><ChevronLeft size={15} />Resumen del libro</button>
                  <span>{nf(open.pos + 1)} de {nf(open.ids.length)}{filtered ? ' en la lista filtrada' : ''}</span>
                </div>
                {sheet}
              </>
            ) : (
              <div className="lw-scroll">
                <div className="lwx-md-home">
                  <Hero item={item} fileIdx={fileIdx} book={book} />
                  <button className="lw-continue" onClick={() => (last ? openCode(topics.map(t => t.id), last.index) : openCode(list.map(t => t.id), 0))} disabled={!last && !list.length}>
                    <BookOpen size={22} />
                    <span>
                      <small>{last ? 'Continuar donde quedaste' : 'Empezar'}</small>
                      <b>{last ? `${last.code || last.label} · ${last.name || last.title}` : `${nf(topics.length)} códigos, uno por uno`}</b>
                    </span>
                    <ChevronRight size={20} />
                  </button>
                  <Progress n={nDone} total={topics.length}><b>{nf(nDone)}</b> de {nf(topics.length)} códigos estudiados</Progress>
                  <div className="lw-toc-b"><div>{completo ? 'Por especialidad' : 'Por sección'}</div><span><ListFilter size={13} /> elige una para filtrar la lista</span></div>
                  <div className="lwx-ggrid">
                    {groups.map(g => {
                      const n = g.ids.filter(id => doneMap[id]).length, pct = g.ids.length ? Math.round((n / g.ids.length) * 100) : 0
                      const on = completo ? spec === g.key : sec === g.key
                      return (
                        <button key={g.key} className={`lwx-gcard ${on ? 'on' : ''}`} onClick={g.pick} aria-pressed={on}>
                          <b>{g.name}</b>
                          <small>{nf(n)} de {nf(g.ids.length)} estudiados</small>
                          <span className="lwx-gbar"><i style={{ width: `${pct}%` }} /></span>
                        </button>
                      )
                    })}
                  </div>
                  <p className="lwx-md-tip">Elige un código en la lista para ver su ficha. Con las flechas ← → pasas al anterior o al siguiente.</p>
                </div>
              </div>
            )}
          </section>
        </div>
      </Root>
    )
  }

  return (
    <Root book={book} r={r}>
      {/* la lista sigue montada debajo de la ficha: al volver conserva búsqueda, filtros y lugar */}
      <div className="lwx-layer" hidden={!!open}>
        <Top close onBack={onClose} title={topTitle} onAa={() => r.setAa(true)} onPdf={onOpenPdf} kicker={progKicker} />
        {finder}
        {listEl}
      </div>
      {cur && (
        <div className="lwx-layer lwx-detail">
          <Top onBack={back} backLabel="Volver a la lista" kicker={`${cur.sectionLabel || cur.block.name} · ${open.pos + 1} de ${open.ids.length}`} title={cur.name || cur.title} onAa={() => r.setAa(true)} />
          {sheet}
        </div>
      )}
    </Root>
  )
}

/* ───────── preguntas de práctica: una pregunta por pantalla ───────── */
const rightOf = t => (String(t.html || '').match(/Respuesta:\s*([A-E])/) || [])[1] || ''

function PreguntasRun({ item, fileIdx, title, book, bookKey, user, onClose, onOpenPdf, paused = false, initialTopicId = null }) {
  const topics = useMemo(() => flatTopics(book), [book])
  const right = useMemo(() => new Map(topics.map(t => [t.id, rightOf(t)])), [topics])
  const boot = useBoot()
  const [first] = useState(() => { const i = initialTopicId ? topics.findIndex(t => t.id === initialTopicId) : -1; return i >= 0 ? i : null })
  const [idx, setIdx] = useState(first) // null = inicio
  // la pregunta abierta es una entrada del historial (?t=<id>): «Atrás» vuelve al inicio del libro
  useHistoryLayer(idx != null, () => setIdx(null), { url: idx != null && topics[idx] ? urlWith({ t: topics[idx].id }) : null, adopt: boot && first != null })
  const back = () => (idx != null ? setIdx(null) : onClose?.())
  const r = useReader({ user, bookKey, paused, onBack: back })
  const { data, store } = r
  const prog = getProgress(data, bookKey)
  const answers = data.answers[bookKey] || {}
  const picked = t => answers[t.id]?.['0'] || ''
  const stat = list => {
    let done = 0, ok = 0
    for (const t of list) { const p = picked(t); if (p) { done++; if (p === right.get(t.id)) ok++ } }
    return { done, ok, total: list.length }
  }
  const all = stat(topics)
  const last = prog?.topicId ? topics.find(t => t.id === prog.topicId) : null
  const firstPending = topics.find(t => !picked(t))
  const cur = idx != null ? topics[idx] : null

  const openQ = i => {
    const n = Math.min(Math.max(0, i), topics.length - 1)
    setIdx(n); store.setProgress(bookKey, { topicId: topics[n].id })
  }
  useKeys(e => {
    if (idx == null || r.aa) return false
    if (e.key === 'ArrowRight') { if (idx < topics.length - 1) openQ(idx + 1); return true }
    if (e.key === 'ArrowLeft') { if (idx > 0) openQ(idx - 1); return true }
    return false
  }, !paused)
  const scrollRef = useRef(null)
  useSwipe(scrollRef, { onLeft: () => idx != null && idx < topics.length - 1 && openQ(idx + 1), onRight: () => idx != null && idx > 0 && openQ(idx - 1) }, idx != null)
  useLayoutEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = 0 }, [idx])
  const curPicked = cur ? picked(cur) : ''
  const pct = all.done ? Math.round((all.ok / all.done) * 100) : 0

  return (
    <Root book={book} r={r}>
      {!cur && (
        <>
          <Top close onBack={onClose} title={title || book.title} onAa={() => r.setAa(true)} onPdf={onOpenPdf} r={r} />
          <div className="lw-scroll">
            <div className="lw-start lwx-home">
              <aside className="lwx-home-side">
                <Hero item={item} fileIdx={fileIdx} book={book} />
                <button className="lw-continue" onClick={() => openQ(last ? last.index : 0)}>
                  <BookOpen size={22} />
                  <span>
                    <small>{last ? 'Continuar donde quedaste' : 'Empezar'}</small>
                    <b>{last ? `Pregunta ${last.label} de ${topics.length} · ${last.block.name}` : `${topics.length} preguntas, una por una`}</b>
                  </span>
                  <ChevronRight size={20} />
                </button>
                <Progress n={all.done} total={all.total}><b>{all.done}</b> de {all.total} preguntas respondidas</Progress>
                <div className="lwx-stats">
                  <span className="se"><Check size={14} strokeWidth={3} />{plural(all.ok, 'correcta', 'correctas')}{all.done ? ` (${pct} %)` : ''}</span>
                  <span className="rep">{plural(all.done - all.ok, 'incorrecta', 'incorrectas')}</span>
                </div>
                {last && firstPending && firstPending.id !== last.id && (
                  <button className="lw-btn lwx-wide" onClick={() => openQ(firstPending.index)}>Ir a la primera sin responder (n.º {firstPending.label})</button>
                )}
                <PdfButton onPdf={onOpenPdf} />
              </aside>
              <div className="lwx-home-main">
                <div className="lwx-home-h"><h2>Preguntas por especialidad</h2></div>
                <div className="lwx-ggrid lwx-qgroups">
                  {(book.blocks || []).map(b => {
                    const list = topics.filter(t => t.block.n === b.n)
                    if (!list.length) return null
                    const st = stat(list)
                    const full = st.done === st.total
                    return (
                      <button key={b.n} className={`lwx-gcard ${last?.block.n === b.n ? 'cur' : ''}`} onClick={() => openQ((list.find(t => !picked(t)) || list[0]).index)}>
                        <span className="lwx-gcard-h"><b>{b.name}</b><em>{list[0].label}–{list[list.length - 1].label}</em></span>
                        <small className={full ? 'full' : ''}>
                          {st.done ? `${st.done} de ${st.total} respondidas · ${plural(st.ok, 'correcta', 'correctas')}` : plural(st.total, 'pregunta', 'preguntas')}
                        </small>
                        <span className="lwx-gbar"><i style={{ width: `${st.total ? Math.round((st.done / st.total) * 100) : 0}%` }} /></span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      {cur && (
        <>
          <Top onBack={back} backLabel="Volver al inicio" kicker={`Pregunta ${idx + 1} de ${topics.length}`} title={cur.block.name} onAa={() => r.setAa(true)} r={r}>
            <span className="lwx-score" aria-label={`${all.ok} correctas de ${all.done} respondidas`}><Check size={13} strokeWidth={3} />{all.ok}/{all.done}</span>
          </Top>
          <div ref={scrollRef} className="lw-scroll" style={{ backgroundImage: watermarkUrl(r.mark, data.prefs.dark) }}>
            <article className="lw-doc lwx-qrun" style={{ fontSize: r.fs }}>
              <div className="lw-kicker">{cur.name || cur.title}</div>
              {onOpenPdf && <div className="lw-acts"><button className="lw-act" onClick={() => onOpenPdf()}><FileText size={15} />{PDF_LABEL}</button></div>}
              <TopicBody key={cur.id} userId={user?.id} bookKey={bookKey} book={book} topic={cur} mark={r.mark} />
              {curPicked && topics[idx + 1] && (
                <button className="lw-next" onClick={() => openQ(idx + 1)}>
                  <span><small>Siguiente pregunta</small><b>Pregunta {topics[idx + 1].label}</b></span><ChevronRight size={20} />
                </button>
              )}
            </article>
          </div>
          <Bottom>
            <button className="lw-step" onClick={() => openQ(idx - 1)} disabled={idx === 0} aria-label="Pregunta anterior"><ChevronLeft size={18} />{topics[idx - 1]?.label}</button>
            <span className={`lwx-qstate ${curPicked ? (curPicked === right.get(cur.id) ? 'ok' : 'bad') : ''}`}>
              {curPicked ? (curPicked === right.get(cur.id) ? 'Correcta' : 'Incorrecta') : 'Sin responder'}
            </span>
            <button className="lw-step" onClick={() => openQ(idx + 1)} disabled={idx >= topics.length - 1} aria-label="Pregunta siguiente">{topics[idx + 1]?.label}<ChevronRight size={18} /></button>
          </Bottom>
        </>
      )}
    </Root>
  )
}
