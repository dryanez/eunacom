// Lector web de libros: se lee por tema, no por página. Mismas props que LectorLibro
// ({ item, title, initialFileIdx, onClose }). Los libros sin edición web (hoy, todo lo que no es un Tomo)
// se abren en el lector PDF exactamente como antes.
// Cada tipo de libro (lib/lector/content.js → registerKind) trae su vista de teléfono y, si tiene, de computador
// (ancho ≥ 1024). La vista recibe { item, fileIdx, title, book, bookKey, user, onClose, onOpenPdf(page?), paused, initialTopicId }.
// initialTopicId (opcional): tema a abrir de entrada (dirección ?t=…, o el tema que se leía al pasar de computador a teléfono).
import React, { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Loader2, X, FileText } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import LectorLibro, { LectorPdf } from '../tienda/LectorLibro'
import { bookKey, bookKind, errorStatus, hasWebEdition, loadBook } from '../../lib/lector/content'
import { getStore } from '../../lib/lector/userData'
import { NavScope, navDepth, urlWith, useHistoryLayer, whenSettled } from '../../lib/lector/nav'
import { bookTitle } from '../../lib/lector/red'
import { LinksContext } from './render/links'
import '../../styles/lector-web.css'

// Otros tipos de libro (atlas, repaso, perfil) se registran en ./modes/index.js, si existe.
import.meta.glob('./modes/index.{js,jsx}', { eager: true })

const DESKTOP = '(min-width: 1024px)'
function useWide() {
  const [wide, setWide] = useState(() => !!window.matchMedia?.(DESKTOP).matches)
  useEffect(() => {
    const mq = window.matchMedia?.(DESKTOP)
    if (!mq) return undefined
    const on = () => setWide(mq.matches)
    mq.addEventListener?.('change', on)
    return () => mq.removeEventListener?.('change', on)
  }, [])
  return wide
}

const views = new Map() // `${kind}|${forma}` → componente lazy
function viewFor(kind, wide) {
  const v = kind.views || {}
  const form = wide && v.desktop ? 'desktop' : 'mobile'
  const loader = v[form] || v.mobile || v.desktop
  const key = `${kind.id}|${form}`
  if (!views.has(key)) views.set(key, lazy(loader))
  return views.get(key)
}

function Shell({ title, onClose, children }) {
  return (
    <div className="lw">
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 8px', paddingTop: 'max(7px, env(safe-area-inset-top))', background: 'var(--lw-bar)', color: '#e2e8f0' }}>
        <button className="lw-ib plain" onClick={onClose} aria-label="Cerrar el libro"><X size={20} /></button>
        <strong style={{ fontSize: '0.86rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</strong>
      </div>
      <div className="lw-msg">{children}</div>
    </div>
  )
}

export default function LectorWeb(props) {
  if (!hasWebEdition(props.item, props.initialFileIdx || 0)) return <LectorLibro {...props} />
  return <Stack {...props} />
}

// «Red de temas»: un libro abierto desde la tarjeta de un término va ENCIMA del que se leía (que queda montado, en pausa,
// en el mismo tema y a la misma altura). Es una entrada del historial (?leer=<item>:<archivo>&t=<tema>): «Atrás» vuelve
// al libro de abajo, también desde el tema con que se abrió (onReturn).
// La pila va en el estado de esa entrada (history.state.lwStack: el libro de abajo y los de encima, cada uno con su tema y
// la profundidad de su entrada), y las entradas de encima la heredan: al recargar se vuelve a armar igual (de abajo hacia
// arriba, cada libro cuando el de abajo ya tomó sus entradas), así «Atrás» sigue volviendo al libro y tema de antes.
const STACK_V = 1
const locOf = (item, fileIdx) => `${item}:${Number(fileIdx) || 0}`
const urlTopic = () => { try { return new URLSearchParams(window.location.search).get('t') || null } catch { return null } }
const urlLeer = () => { try { return new URLSearchParams(window.location.search).get('leer') || '' } catch { return '' } }
const cleanLevel = x => (x && typeof x.item === 'string' && x.item && hasWebEdition(x.item, Number(x.fileIdx) || 0)
  ? { item: x.item, fileIdx: Number(x.fileIdx) || 0, title: typeof x.title === 'string' ? x.title : '', topicId: typeof x.topicId === 'string' ? x.topicId : null }
  : null)

/** La pila guardada en la entrada actual, si su libro de arriba es el que se abre. → { base, books } o null */
function readStack(item, fileIdx) {
  try {
    const s = window.history.state?.lwStack
    if (!s || s.v !== STACK_V || !Array.isArray(s.books) || !s.books.length) return null
    const base = cleanLevel(s.base)
    const books = s.books.map(b => { const c = cleanLevel(b); return c && Number(b.depth) > 1 ? { ...c, depth: Number(b.depth) } : null })
    if (!base || books.some(b => !b)) return null
    if (books.some((b, i) => b.depth <= (i ? books[i - 1].depth : 1)) || books[books.length - 1].depth > navDepth()) return null
    const top = books[books.length - 1]
    if (locOf(top.item, top.fileIdx) !== locOf(item, fileIdx)) return null
    return { base, books }
  } catch { return null }
}

function Stack(props) {
  const restored = useRef(undefined)
  if (restored.current === undefined) restored.current = readStack(props.item, props.initialFileIdx || 0)
  const r = restored.current
  // libro de abajo: el de las props o, al recargar con libros encima, el que estaba abajo
  const base = useMemo(() => (r ? { ...r.base, title: r.base.title || bookTitle(r.base.item, r.base.fileIdx) }
    : { item: props.item, fileIdx: props.initialFileIdx || 0, title: props.title, topicId: props.initialTopicId || null }), []) // eslint-disable-line react-hooks/exhaustive-deps
  const [stack, setStack] = useState(() => (r ? r.books.map((b, i) => ({
    ...b, title: b.title || bookTitle(b.item, b.fileIdx), n: i + 1, restore: true,
    // el de arriba abre el tema de la dirección (pudo cambiar después de abrirse); los de abajo, el que tenían
    topicId: i === r.books.length - 1 ? (props.initialTopicId || b.topicId) : b.topicId,
  })) : [])) // [{ item, fileIdx, topicId, title, n, depth?, restore?, at? }]
  // al recargar: cuántos libros de la pila ya se pueden montar (cada uno espera a que el de abajo tome sus entradas)
  const [ready, setReady] = useState(r ? 0 : Infinity)
  const pending = stack.some((e, i) => e.restore && i >= ready)
  const live = useRef({ base, stack })
  live.current = { base, stack }

  const openBook = useCallback(t => {
    if (!t?.item || !hasWebEdition(t.item, t.fileIdx || 0)) return
    const { base: b, stack: s } = live.current
    // el tema que se lee en el libro de arriba (el que abre el nuevo): el de la dirección, si es la suya
    const top = s.length ? s[s.length - 1] : b
    const at = urlLeer() === locOf(top.item, top.fileIdx) ? urlTopic() : null
    const levels = [b, ...s].map((x, i, all) => ({ item: x.item, fileIdx: x.fileIdx, title: x.title || '',
      topicId: i === all.length - 1 ? (at || x.at || x.topicId || null) : (x.at || x.topicId || null), depth: x.depth || 0 }))
    const entry = { item: t.item, fileIdx: Number(t.fileIdx) || 0, topicId: t.topicId || null, title: t.title || '', n: Date.now() + s.length }
    // estado de la entrada nueva (se calcula al crearla: ahí se sabe su profundidad)
    entry.state = d => {
      entry.depth = d
      const [lb, ...lbooks] = levels
      return { lwStack: { v: STACK_V, base: { ...lb, depth: undefined }, books: [...lbooks, { ...entry, state: undefined, n: undefined, depth: d }].map(x => ({
        item: x.item, fileIdx: x.fileIdx, title: x.title, topicId: x.topicId, depth: x.depth })) } }
    }
    if (s.length) setStack(cur => cur.map((x, i) => (i === cur.length - 1 ? { ...x, at } : x)).concat(entry))
    else { b.at = at; setStack(cur => [...cur, entry]) }
  }, [])
  const settledAt = useCallback(i => setReady(n => Math.max(n, i + 1)), [])

  return (
    <>
      <WebReader {...props} item={base.item} title={base.title} initialFileIdx={base.fileIdx} initialTopicId={base.topicId}
        covered={stack.length > 0} onOpenBook={openBook} onSettled={r ? () => settledAt(0) : null} />
      {stack.map((e, i) => (!e.restore || i < ready) && (
        <Linked key={e.n} entry={e} covered={i < stack.length - 1} onOpenBook={openBook} onClose={() => setStack(s => s.slice(0, i))}
          onSettled={e.restore ? () => settledAt(i + 1) : null} />
      ))}
      {pending && <Shell title={stack[stack.length - 1]?.title || ''} onClose={props.onClose}><Loader2 size={22} className="lw-spin" /><p>Abriendo el libro…</p></Shell>}
    </>
  )
}

function Linked({ entry, covered, onOpenBook, onClose, onSettled }) {
  // el id de una ficha del Atlas dice el diagnóstico: no va en la dirección (la vista pone la suya, «c12»)
  const url = useMemo(() => (entry.restore ? null : urlWith({ leer: locOf(entry.item, entry.fileIdx), t: bookKind(entry.item, entry.fileIdx)?.id === 'atlas' ? null : entry.topicId, pdf: null })), []) // eslint-disable-line react-hooks/exhaustive-deps
  // «Atrás» desde el tema con que se abrió este libro vuelve al libro de abajo (no al índice de este). Solo eso: volver a esta
  // entrada porque se cerró otra cosa (la tarjeta de un término, el buscador, el PDF) no cierra el libro.
  const token = useRef({}).current
  const onReturn = useCallback(gone => { if (gone?.some(l => l.initial && l.token === token)) onClose() }, [token, onClose])
  const layer = useHistoryLayer(true, onClose, { url, onReturn: entry.topicId ? onReturn : null, adoptDepth: entry.restore ? entry.depth : 0, state: entry.state || null })
  return <WebReader item={entry.item} title={entry.title} initialFileIdx={entry.fileIdx} initialTopicId={entry.topicId} onClose={onClose}
    covered={covered} onOpenBook={onOpenBook} linked layer={layer} token={token} onSettled={onSettled} />
}

// Avisa (una vez) cuando la vista ya se montó y el historial terminó de tomar sus entradas
function Settled({ fn }) {
  const done = useRef(false)
  useEffect(() => { if (!fn || done.current) return; done.current = true; whenSettled(fn) }, [fn])
  return null
}

function WebReader({ item, title, initialFileIdx = 0, initialTopicId = null, onClose, covered = false, onOpenBook, linked = false, layer = null, token = null, onSettled = null }) {
  const { user } = useAuth()
  const fileIdx = initialFileIdx
  const kind = bookKind(item, fileIdx)
  const [book, setBook] = useState(null)
  const [error, setError] = useState(null)
  const [pdf, setPdf] = useState(null) // { page } → lector PDF encima («PDF original»)
  const wide = useWide()
  useHistoryLayer(!!pdf, () => setPdf(null)) // «Atrás» cierra el PDF de encima

  // Al cruzar el ancho de computador (1024 px) la otra vista abre el mismo tema que se estaba leyendo
  // (se decide al dibujar: la vista nueva lee initialTopicId solo al montarse)
  const startTopic = useRef(initialTopicId)
  const lastWide = useRef(wide)
  if (lastWide.current !== wide) {
    lastWide.current = wide
    startTopic.current = (user?.id && getStore(user.id).get().progress[bookKey(item, fileIdx)]?.topicId) || null
  }

  useEffect(() => {
    let live = true
    setBook(null); setError(null)
    loadBook(user, item, fileIdx).then(b => { if (live) setBook(b) }).catch(err => {
      if (!live) return
      const st = errorStatus(err)
      setError(st === 403 ? 'No tienes este libro en tu cuenta.' : st === 404 ? 'Este libro todavía no tiene edición para leer por temas.' : 'No pudimos abrir el libro. Inténtalo de nuevo en un momento.')
    })
    return () => { live = false }
  }, [item, fileIdx, user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // con otro libro encima, este no recibe foco ni toques (queda montado, en pausa, para volver igual)
  const stackRef = useRef(null)
  useEffect(() => { const el = stackRef.current; if (el) { if (covered) el.setAttribute('inert', ''); else el.removeAttribute('inert') } }, [covered, book])
  const links = useMemo(() => ({ here: { item, fileIdx }, openBook: onOpenBook, linked }), [item, fileIdx, onOpenBook, linked])
  const scope = useMemo(() => ({ layer, covered, token, leer: locOf(item, fileIdx) }), [layer, covered, token, item, fileIdx])
  const openPdf = page => setPdf({ page: Number(page) > 1 ? Number(page) : 0 })
  const pdfView = pdf && <LectorPdf item={item} title={title} initialFileIdx={fileIdx} initialPage={pdf.page} onClose={() => setPdf(null)} />

  if (error) {
    return pdfView || (
      <Shell title={title} onClose={onClose}>
        <p>{error}</p>
        <button className="lw-btn pri" onClick={() => openPdf(0)}><FileText size={16} />PDF original</button>
        <Settled fn={onSettled} />
      </Shell>
    )
  }
  const loading = <Shell title={title} onClose={onClose}><Loader2 size={22} className="lw-spin" /><p>Abriendo el libro…</p></Shell>
  if (!book) return loading
  const View = viewFor(kind, wide)
  return (
    <NavScope.Provider value={scope}>
      <LinksContext.Provider value={links}>
        <div className="lw-stack" ref={stackRef} aria-hidden={covered || undefined}>
          <Suspense fallback={loading}>
            <View item={item} fileIdx={fileIdx} title={title} book={book} bookKey={bookKey(item, fileIdx)} user={user} onClose={onClose} onOpenPdf={openPdf} paused={!!pdf || covered} initialTopicId={startTopic.current} />
            <Settled fn={onSettled} />
          </Suspense>
          {pdfView}
        </div>
      </LinksContext.Provider>
    </NavScope.Provider>
  )
}
