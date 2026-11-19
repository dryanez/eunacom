// Lector web · computador (Tomos, ancho ≥ 1024): vista de estudio.
// Izquierda: índice con avance. Centro: el tema (o dos temas lado a lado) con pestañas. Derecha: notas y destacados.
// Props (las que entrega LectorWeb a toda vista): { item, fileIdx, title, book, bookKey, user, onClose, onOpenPdf(page?), paused, initialTopicId }
// Historial: el libro es una entrada (?leer=…); el tema activo va en ?t=… (se reemplaza, no se apila: en el computador
// «Atrás» cierra el buscador o el visor y después el libro). Al volver de una clase se reabre en ese tema.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PanelLeft, PanelRight, Search, X, Sun, Moon, Square, Columns2, AArrowDown, AArrowUp, Link2, Link2Off } from 'lucide-react'
import { flatTopics, loadClassRoutes, loadPageMap, topicClassId } from '../../../lib/lector/content'
import { SIZES, getProgress, isBookmarked, isDone, useUserData } from '../../../lib/lector/userData'
import { useProtection, watermarkText } from '../render'
import { useBookUrl, useHistoryLayer } from '../../../lib/lector/nav'
import Sidebar from './Sidebar'
import TabsBar from './TabsBar'
import Pane from './Pane'
import NotesPanel from './NotesPanel'
import Palette from './Palette'
import '../../../styles/lector-web.css'
import './desk.css'

const NARROW = '(max-width: 1180px)'
const MAX_TABS = 10
const isMac = typeof navigator !== 'undefined' && /mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent || '')
const typing = el => !!el && (/^(input|textarea|select)$/i.test(el.tagName || '') || el.isContentEditable)

// Lo que es de este computador (pestañas abiertas, paneles): localStorage `lwd:<usuario>:<libro>`
const deskKey = (userId, bookKey) => `lwd:${userId || 'anon'}:${bookKey}`
function readDesk(key) { try { const v = JSON.parse(localStorage.getItem(key) || 'null'); return v && typeof v === 'object' ? v : {} } catch { return {} } }

function useNarrow() {
  const [narrow, setNarrow] = useState(() => !!window.matchMedia?.(NARROW).matches)
  useEffect(() => {
    const mq = window.matchMedia?.(NARROW)
    if (!mq) return undefined
    const on = () => setNarrow(mq.matches)
    mq.addEventListener?.('change', on)
    return () => mq.removeEventListener?.('change', on)
  }, [])
  return narrow
}

export default function LectorDesktop({ item, fileIdx = 0, title, book, bookKey, user, onClose, onOpenPdf, paused = false, initialTopicId = null }) {
  const [data, store] = useUserData(user?.id)
  const routerNavigate = useNavigate()
  const topics = useMemo(() => flatTopics(book), [book])
  const byId = useMemo(() => Object.fromEntries(topics.map(t => [t.id, t])), [topics])
  const mark = useMemo(() => watermarkText(user), [user])
  const narrow = useNarrow()
  const key = deskKey(user?.id, bookKey)
  const rootRef = useRef(null)

  // ── espacio de trabajo: pestañas, tema activo, tema del lado derecho ──
  const [ws, setWs] = useState(() => {
    const saved = readDesk(key)
    const prog = getProgress(store.get(), bookKey)
    let tabs = (Array.isArray(saved.tabs) ? saved.tabs : []).filter(id => byId[id]).slice(0, MAX_TABS)
    let active = byId[saved.active] && tabs.includes(saved.active) ? saved.active : tabs[0]
    const last = byId[initialTopicId] ? initialTopicId : prog?.topicId && byId[prog.topicId] ? prog.topicId : null
    if (last) { if (!tabs.includes(last)) tabs = active ? tabs.map(id => (id === active ? last : id)) : [last]; active = last }
    if (!tabs.length && topics[0]) { tabs = [topics[0].id]; active = topics[0].id }
    return { tabs, active, splitId: byId[saved.splitId] ? saved.splitId : null }
  })
  // cómo llegar a cada tema: { [topicId]: { n, scroll?, focus?, query? } }
  const [jumps, setJumps] = useState(() => {
    const prog = getProgress(store.get(), bookKey)
    if (byId[initialTopicId]) return { [initialTopicId]: { n: Date.now(), scroll: prog?.topicId === initialTopicId ? prog.scroll : 0 } }
    return prog?.topicId ? { [prog.topicId]: { n: Date.now(), scroll: prog.scroll } } : {}
  })
  const [side, setSide] = useState(() => !window.matchMedia?.(NARROW).matches && readDesk(key).side !== false)
  const [panel, setPanel] = useState(() => !window.matchMedia?.(NARROW).matches && readDesk(key).panel === true)
  const [palette, setPalette] = useState(false) // false | true | 'new' (abierto con «+»: Enter abre en una pestaña nueva)
  const [focusPane, setFocusPane] = useState(0) // 0 = izquierda (pestañas), 1 = derecha (comparación)
  const [pages, setPages] = useState({})
  const [classes, setClasses] = useState(null)
  const scrollMem = useRef(new Map()) // topicId → altura (0–1) mientras el libro está abierto
  const consumed = useRef(new Map()) // topicId → n del salto ya usado
  const touched = useRef(!!byId[initialTopicId]) // el usuario ya eligió un tema (o viene en la dirección): no se le cambia por lo que llegue del servidor
  // abrir el libro no es leerlo: el tema que se muestra solo al entrar no queda como «donde quedaste» (ni pone «Continuar»
  // en el estante) hasta que el usuario elige un tema, cambia de pestaña o desplaza el texto. Tampoco el tema que solo
  // viene en la dirección (&t= al recargar, «Adelante» o un enlace): eso es reabrir, no leer.
  const [engaged, setEngaged] = useState(false)
  const lastUsed = useRef(new Map()) // topicId → cuándo se usó la pestaña (para cerrar la más antigua al pasar de MAX_TABS)
  const [notice, setNotice] = useState(null)
  const [synced, setSynced] = useState(false) // hasta saber qué hay en el servidor no se escribe el avance
  const panelEsc = useRef(null)

  const split = data.prefs.layout === 'dos' && topics.length > 1
  const pane = split ? focusPane : 0
  const activeTopic = byId[ws.active] || topics[0]
  const splitTopic = split ? (byId[ws.splitId] || topics[(activeTopic?.index ?? 0) + 1] || topics[(activeTopic?.index ?? 1) - 1]) : null
  const current = pane === 1 && splitTopic ? splitTopic : activeTopic
  useEffect(() => { if (ws.active) lastUsed.current.set(ws.active, Date.now()) }, [ws.active])
  useEffect(() => {
    if (!notice) return undefined
    const t = setTimeout(() => setNotice(null), 3500)
    return () => clearTimeout(t)
  }, [notice])
  // el tema activo en la dirección (sin crear entradas): recargar o volver de una clase abre aquí
  useBookUrl(ws.active ? { t: ws.active } : null) // (con otro libro encima no se toca: la dirección es la de ese)
  useHistoryLayer(palette, () => setPalette(false)) // «Atrás» cierra el buscador

  // al pasar a ancho angosto los paneles se cierran (van encima del tema); al volver, quedan como estaban
  const wasNarrow = useRef(narrow)
  useEffect(() => {
    if (wasNarrow.current === narrow) return
    wasNarrow.current = narrow
    if (narrow) { setSide(false); setPanel(false) } else { const s = readDesk(key); setSide(s.side !== false); setPanel(s.panel === true) }
  }, [narrow, key])

  useEffect(() => {
    // en ancho angosto los paneles van encima y se cierran solos: ahí no se guarda si estaban abiertos
    const prev = readDesk(key)
    const keep = narrow ? { side: prev.side, panel: prev.panel } : { side, panel }
    try { localStorage.setItem(key, JSON.stringify({ tabs: ws.tabs, active: ws.active, splitId: ws.splitId, ...keep })) } catch { /* sin espacio */ }
  }, [key, ws, side, panel, narrow])

  useEffect(() => {
    let live = true
    loadPageMap(item, fileIdx).then(m => live && setPages(m))
    loadClassRoutes().then(m => live && setClasses(m))
    return () => { live = false }
  }, [item, fileIdx])

  // «Continuar donde quedaste» entre teléfono y computador: si el servidor trae un lugar más nuevo, se va ahí.
  useEffect(() => {
    let live = true, ended = false
    const before = getProgress(store.get(), bookKey)
    const done = () => {
      if (!live || ended) return
      ended = true
      const p = getProgress(store.get(), bookKey)
      if (!touched.current && p?.topicId && byId[p.topicId] && (p.topicId !== before?.topicId || p.ts !== before?.ts)) {
        setJumps(j => ({ ...j, [p.topicId]: { n: Date.now(), scroll: p.scroll } }))
        setWs(w => (w.tabs.includes(p.topicId) ? { ...w, active: p.topicId } : { ...w, tabs: w.tabs.map(id => (id === w.active ? p.topicId : id)), active: p.topicId }))
      }
      setSynced(true)
    }
    const t = setTimeout(done, 4000)
    Promise.resolve(store.sync(bookKey)).then(() => { clearTimeout(t); done() })
    return () => { live = false; clearTimeout(t) }
  }, [store, bookKey]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── abrir temas ──
  const open = useCallback((id, how = null, { newTab = false, target = null } = {}) => {
    if (!byId[id]) return
    touched.current = true; setSynced(true); setEngaged(true)
    const where = target ?? (newTab ? 0 : pane)
    setWs(w => {
      if (where === 1) return { ...w, splitId: id }
      if (w.tabs.includes(id)) return { ...w, active: id }
      if (newTab) {
        let tabs = w.tabs
        if (tabs.length >= MAX_TABS) {
          // al máximo: se cierra la pestaña menos usada (nunca la activa) y se avisa
          const old = tabs.filter(t => t !== w.active).sort((a, b) => (lastUsed.current.get(a) || 0) - (lastUsed.current.get(b) || 0))[0]
          tabs = tabs.filter(t => t !== old)
          setNotice({ n: Date.now(), text: `Máximo ${MAX_TABS} pestañas: se cerró ${byId[old]?.label || 'la más antigua'}` })
        }
        const at = tabs.indexOf(w.active) + 1
        return { ...w, tabs: [...tabs.slice(0, at), id, ...tabs.slice(at)], active: id }
      }
      return { ...w, tabs: w.tabs.map(t => (t === w.active ? id : t)), active: id }
    })
    const known = where === 0 && ws.tabs.includes(id) && id !== ws.active // pestaña ya abierta: vuelve a donde estaba
    if (how || !known) setJumps(j => ({ ...j, [id]: { n: Date.now(), scroll: 0, ...(how || {}) } }))
    if (where === 0 && (newTab || target === 0)) setFocusPane(0)
    if (narrow) setSide(false)
  }, [byId, pane, ws.tabs, ws.active, narrow])

  const step = useCallback((delta, which = pane) => {
    const from = which === 1 && splitTopic ? splitTopic : activeTopic
    const t = topics[(from?.index ?? 0) + delta]
    if (t) open(t.id, null, { target: which })
  }, [pane, splitTopic, activeTopic, topics, open])

  const selectTab = id => { touched.current = true; setSynced(true); setEngaged(true); setFocusPane(0); setWs(w => ({ ...w, active: id })) }
  const closeTab = id => setWs(w => {
    if (w.tabs.length < 2) return w
    const at = w.tabs.indexOf(id), tabs = w.tabs.filter(t => t !== id)
    return { ...w, tabs, active: w.active === id ? tabs[Math.min(at, tabs.length - 1)] : w.active }
  })
  const closeOthers = id => { setWs(w => ({ ...w, tabs: [id], active: id })); if (id !== ws.active) { touched.current = true; setEngaged(true); setFocusPane(0) } }
  // dos temas lado a lado con el índice y las notas abiertos dejan columnas muy angostas (bajo 1600 px): no van los tres.
  // Al pasar a dos temas se esconden las notas; con dos temas, abrir las notas esconde el índice y abrir el índice
  // esconde las notas; si la ventana se achica con los tres abiertos, se esconden las notas.
  const SPLIT_ROOM = 1600
  const roomForSplit = () => window.innerWidth >= SPLIT_ROOM || !(side && panel)
  const setLayout = v => { store.setPrefs({ layout: v }); if (v !== 'dos') setFocusPane(0); else if (!roomForSplit()) setPanel(false) }
  const toggleSide = () => {
    if (!side && split && panel && !narrow && window.innerWidth < SPLIT_ROOM) { setPanel(false); setNotice({ n: Date.now(), text: 'Con dos temas no caben el índice y las notas a la vez: se ocultaron las notas' }) }
    setSide(s => !s)
  }
  const togglePanel = () => {
    if (!panel && split && side && !narrow && window.innerWidth < SPLIT_ROOM) { setSide(false); setNotice({ n: Date.now(), text: 'Con dos temas no caben el índice y las notas a la vez: se ocultó el índice' }) }
    setPanel(p => !p)
  }
  useEffect(() => {
    if (!(split && side && panel) || narrow) return undefined
    const check = () => { if (window.innerWidth < SPLIT_ROOM) setPanel(false) }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [split, side, panel, narrow])
  const openBeside = id => {
    touched.current = true; setSynced(true); setEngaged(true)
    setWs(w => ({ ...w, splitId: id })); setJumps(j => ({ ...j, [id]: { n: Date.now(), scroll: 0 } }))
    store.setPrefs({ layout: 'dos' }); setFocusPane(1)
    if (narrow) setSide(false)
    else if (!roomForSplit()) setPanel(false)
  }

  const toggleDone = t => store.setDone(bookKey, t.id, !isDone(store.get(), bookKey, t.id))
  const toggleMark = t => store.toggleBookmark({ bookKey, topicId: t.id, title: `${t.label} · ${t.title}` })
  // a la clase sin cerrar el lector: «Atrás» desde la clase vuelve al libro, en este tema
  const goClass = route => routerNavigate(route)

  // ── teclado ──
  const escape = useCallback(() => {
    if (paused) return // hay otro lector encima (PDF): Escape es suyo
    const root = rootRef.current
    // la imagen ampliada y la hoja de nota se cierran solas con Escape (useEscapeLayer); aquí, el menú de colores
    if (root?.querySelector('.lw-selmenu')) {
      try { window.getSelection()?.removeAllRanges() } catch { /* nada */ }
      document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
      return
    }
    if (palette) { setPalette(false); return }
    if (panelEsc.current?.()) return
    if (typing(document.activeElement) && root?.contains(document.activeElement)) { document.activeElement.blur(); return }
    if (narrow && side) { setSide(false); return }
    if (panel) { setPanel(false); return }
    onClose?.()
  }, [paused, palette, narrow, side, panel, onClose])
  const protect = useProtection({ onEscape: escape, onSearch: () => { if (!paused) setPalette(true) } })

  const live = useRef({})
  live.current = { paused, palette, current, step, toggleDone, toggleMark }
  useEffect(() => {
    const onKey = e => {
      const s = live.current
      if (s.paused) return
      const k = e.key?.toLowerCase()
      // con el visor o la hoja de nota encima no se abre nada debajo (tampoco ⌘K)
      const covered = !!rootRef.current?.querySelector('.lw-visor, .lw-sheet')
      if ((e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey && k === 'k') { e.preventDefault(); if (!covered) setPalette(p => !p); return }
      if (e.metaKey || e.ctrlKey || e.altKey || s.palette || typing(e.target)) return
      if (covered) return
      if (k === 'arrowright' || k === 'j') { e.preventDefault(); s.step(1) }
      else if (k === 'arrowleft' || k === 'k') { e.preventDefault(); s.step(-1) }
      else if (k === 'm' && s.current) { e.preventDefault(); s.toggleDone(s.current) }
      else if (k === 'b' && s.current) { e.preventDefault(); s.toggleMark(s.current) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const size = Math.min(SIZES.length - 1, Math.max(0, data.prefs.size))
  const dark = !!data.prefs.dark
  const linksOn = data.prefs.links !== false
  const doneMap = getProgress(data, bookKey)?.done
  const paneProps = t => ({
    book, bookKey, user, topics, topic: t, store, mark, dark, fontSize: SIZES[size], split,
    page: pages[t.label], classRoute: classes?.get(topicClassId(t)) || null,
    done: isDone(data, bookKey, t.id), marked: isBookmarked(data, bookKey, t.id),
    jump: jumps[t.id] || null, scrollMem: scrollMem.current, consumed: consumed.current,
    onDone: () => toggleDone(t), onMark: () => toggleMark(t), onPdf: onOpenPdf, onClass: goClass,
    onClearQuery: () => setJumps(j => ({ ...j, [t.id]: { ...j[t.id], query: '' } })),
  })

  return (
    <div ref={rootRef} className={`lw lw-d ${dark ? 'lw-dark' : ''} ${narrow ? 'lwd-narrow' : ''}`} style={book?.theme || {}} data-kind={book?.kind} {...protect}>
      <header className="lwd-top">
        <button className={`lw-ib ${side ? 'on' : ''}`} onClick={toggleSide} aria-pressed={side} aria-label={side ? 'Ocultar el índice' : 'Mostrar el índice'} title="Índice"><PanelLeft size={18} /></button>
        <div className="lwd-brand"><small>{book.module || 'Libro'}</small><b>{title || book.title}</b></div>
        <button className="lwd-search" onClick={() => setPalette(true)} aria-label="Buscar en el libro">
          <Search size={16} /><span><span className="full">Buscar en el libro…</span><span className="short">Buscar</span></span><kbd>{isMac ? '⌘K' : 'Ctrl K'}</kbd>
        </button>
        <div className="lwd-seg" role="group" aria-label="Distribución">
          <button aria-pressed={!split} onClick={() => setLayout('una')} title="Un tema"><Square size={15} /><span>Un tema</span></button>
          <button aria-pressed={split} onClick={() => setLayout('dos')} title="Dos temas lado a lado" disabled={topics.length < 2}><Columns2 size={15} /><span>Dos temas</span></button>
        </div>
        <div className="lwd-seg" role="group" aria-label="Tamaño de la letra">
          <button onClick={() => store.setPrefs({ size: size - 1 })} disabled={size <= 0} aria-label="Letra más chica" title="Letra más chica"><AArrowDown size={17} /></button>
          <button onClick={() => store.setPrefs({ size: size + 1 })} disabled={size >= SIZES.length - 1} aria-label="Letra más grande" title="Letra más grande"><AArrowUp size={17} /></button>
        </div>
        <button className={`lw-ib ${linksOn ? 'on' : ''}`} onClick={() => store.setPrefs({ links: !linksOn })} aria-pressed={linksOn}
          aria-label={linksOn ? 'Quitar los enlaces entre libros' : 'Mostrar los enlaces entre libros'} title={linksOn ? 'Enlaces entre libros: sí' : 'Enlaces entre libros: no'}>
          {linksOn ? <Link2 size={17} /> : <Link2Off size={17} />}
        </button>
        <button className="lw-ib" onClick={() => store.setPrefs({ dark: !dark })} aria-label={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'} title={dark ? 'Modo claro' : 'Modo oscuro'}>{dark ? <Sun size={17} /> : <Moon size={17} />}</button>
        <button className={`lw-ib ${panel ? 'on' : ''}`} onClick={togglePanel} aria-pressed={panel} aria-label={panel ? 'Ocultar mis notas y destacados' : 'Mostrar mis notas y destacados'} title="Mis notas y destacados"><PanelRight size={18} /><span className="lwd-ib-t">Mis notas</span></button>
        <button className="lw-ib plain" onClick={onClose} aria-label="Cerrar el libro" title="Cerrar el libro"><X size={20} /></button>
      </header>

      <div className="lwd-main">
        {side && narrow && <div className="lwd-dim" onClick={() => setSide(false)} />}
        {side && (
          <Sidebar book={book} title={title} topics={topics} done={doneMap} currentId={current?.id} openIds={ws.tabs} splitId={split ? splitTopic?.id : null}
            onOpen={id => open(id)} onNewTab={id => open(id, null, { newTab: true })} onBeside={openBeside} />
        )}

        <div className="lwd-center">
          <TabsBar tabs={ws.tabs} byId={byId} active={ws.active} done={doneMap} onSelect={selectTab} onClose={closeTab} onCloseOthers={closeOthers} onAdd={() => setPalette('new')}
            onMove={(id, to) => setWs(w => { const rest = w.tabs.filter(t => t !== id), at = Math.max(0, Math.min(rest.length, to - (w.tabs.indexOf(id) < to ? 1 : 0))); return { ...w, tabs: [...rest.slice(0, at), id, ...rest.slice(at)] } })} />
          <div className={`lwd-panes ${split ? 'two' : ''}`}>
            {activeTopic && (
              <Pane key={`a:${activeTopic.id}`} {...paneProps(activeTopic)} main canSave={synced} opened={engaged} onRead={() => setEngaged(true)} focused={split && pane === 0}
                onFocus={() => setFocusPane(0)} onStep={d => step(d, 0)} />
            )}
            {split && splitTopic && (
              <Pane key={`b:${splitTopic.id}`} {...paneProps(splitTopic)} focused={pane === 1}
                onFocus={() => setFocusPane(1)} onStep={d => step(d, 1)} onCloseSplit={() => setLayout('una')} />
            )}
          </div>
        </div>

        {panel && narrow && <div className="lwd-dim" onClick={() => setPanel(false)} />}
        {panel && current && (
          <NotesPanel bookKey={bookKey} topics={topics} byId={byId} topic={current} data={data} store={store} escRef={panelEsc}
            onJump={h => { open(h.topicId, { focus: { start: h.start, end: h.end } }, { target: split && h.topicId === splitTopic?.id && h.topicId !== activeTopic?.id ? 1 : 0 }); if (narrow) setPanel(false) }}
            onOpen={id => { open(id, null, { target: 0 }); if (narrow) setPanel(false) }} onClose={() => setPanel(false)} />
        )}
      </div>

      {notice && <div className="lwd-notice" role="status" key={notice.n}>{notice.text}</div>}

      {palette && (
        <Palette book={book} topics={topics} isMac={isMac} newTab={palette === 'new'} onClose={() => setPalette(false)}
          onOpen={(id, hit, q, newTab) => { const fromAdd = palette === 'new'; setPalette(false); open(id, { query: q || '', focus: hit ? { start: hit.start, end: hit.end } : null }, { newTab: newTab || fromAdd }) }} />
      )}
    </div>
  )
}
