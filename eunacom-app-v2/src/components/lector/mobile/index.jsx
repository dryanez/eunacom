// Lector web · teléfono (Tomos): inicio del libro → un tema por pantalla. Listas y buscador se abren encima.
// Props (las que entrega LectorWeb a toda vista): { item, fileIdx, title, book, bookKey, user, onClose, onOpenPdf(page?), paused, initialTopicId }
// Historial: el tema abierto (?t=…), las listas, el buscador y la hoja Aa son entradas del historial (lib/lector/nav.js):
// «Atrás» del teléfono cierra lo de arriba, después vuelve del tema al inicio del libro y luego al estante.
// Un tema abierto desde el buscador o desde «Mis apuntes» va encima de esa lista (peek): «Atrás» vuelve a la lista,
// con la búsqueda y los resultados como estaban; lo de abajo (inicio o el tema que se leía) no cambia.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { flatTopics, loadClassRoutes, loadPageMap } from '../../../lib/lector/content'
import { getProgress, useUserData } from '../../../lib/lector/userData'
import { urlWith, useBookUrl, useHistoryLayer } from '../../../lib/lector/nav'
import { useProtection, watermarkText } from '../render'
import StartScreen from './StartScreen'
import TopicScreen from './TopicScreen'
import ListsScreen from './ListsScreen'
import SearchScreen from './SearchScreen'
import AaSheet from './AaSheet'
import '../../../styles/lector-web.css'
import './mobile.css'

export default function LectorMobile({ item, fileIdx = 0, title, book, bookKey, user, onClose, onOpenPdf, paused = false, initialTopicId = null, className = '' }) {
  const [data, store] = useUserData(user?.id)
  const topics = useMemo(() => flatTopics(book), [book])
  // tema de entrada (recarga, vuelta desde una clase, paso desde el computador): se abre ahí, a la altura guardada
  const first = useRef(null)
  if (first.current == null) {
    const i = initialTopicId ? topics.findIndex(t => t.id === initialTopicId) : -1
    const p = getProgress(data, bookKey)
    first.current = { i, scroll: i >= 0 && p?.topicId === initialTopicId ? p.scroll : 0 }
  }
  const [view, setView] = useState(first.current.i >= 0 ? 'topic' : 'start') // 'start' | 'topic'
  const [over, setOver] = useState(null) // null | 'lists' | 'search'
  const [idx, setIdx] = useState(Math.max(0, first.current.i))
  const [peek, setPeek] = useState(null) // { idx, jump }: tema abierto encima del buscador o de las listas
  const [jump, setJump] = useState(() => (first.current.i >= 0 ? { n: Date.now(), scroll: first.current.scroll, restored: true } : null)) // { n, focus?, query?, scroll? }: cómo llegar al tema abierto
  const [aa, setAa] = useState(false)
  const [listTab, setListTab] = useState('hl')
  const [search, setSearch] = useState({ q: '', results: null })
  const [pages, setPages] = useState({})
  const [classes, setClasses] = useState(null)
  const mark = useMemo(() => watermarkText(user), [user])

  useEffect(() => { store.sync(bookKey) }, [store, bookKey])
  useEffect(() => {
    let live = true
    loadPageMap(item, fileIdx).then(m => live && setPages(m))
    loadClassRoutes().then(m => live && setClasses(m))
    return () => { live = false }
  }, [item, fileIdx])

  const open = useCallback((i, how = {}) => {
    const n = Math.min(Math.max(0, i), topics.length - 1)
    setIdx(n); setJump({ n: Date.now(), ...how }); setView('topic'); setOver(null)
  }, [topics.length])
  const openId = useCallback((topicId, how) => { const i = topics.findIndex(t => t.id === topicId); if (i >= 0) open(i, how) }, [topics, open])
  // desde una lista: el tema va encima de ella (Atrás vuelve a la lista)
  const peekAt = useCallback((i, how = {}) => {
    const n = Math.min(Math.max(0, i), topics.length - 1)
    setPeek({ idx: n, jump: { n: Date.now(), ...how } })
  }, [topics.length])
  const peekId = useCallback((topicId, how) => { const i = topics.findIndex(t => t.id === topicId); if (i >= 0) peekAt(i, how) }, [topics, peekAt])
  // con un tema encima de la lista, abrir otra cosa (buscador, siguiente tema) sigue en esa misma capa
  const openOver = (o) => { setPeek(null); setOver(o) }

  const topicId = view === 'topic' ? topics[idx]?.id : null
  useHistoryLayer(view === 'topic', () => setView('start'), { url: topicId ? urlWith({ t: topicId }) : null, adopt: first.current.i >= 0 })
  useHistoryLayer(over === 'lists', () => { setPeek(null); setOver(o => (o === 'lists' ? null : o)) })
  useHistoryLayer(over === 'search', () => { setPeek(null); setOver(o => (o === 'search' ? null : o)) })
  useHistoryLayer(!!(peek && over), () => setPeek(null), { url: peek ? urlWith({ t: topics[peek.idx]?.id }) : null })
  useHistoryLayer(aa, () => setAa(false))
  // en el índice la dirección del libro va sin tema (el libro abierto desde una tarjeta entró con «&t=»)
  useBookUrl(view === 'start' && !over ? { t: null } : null)

  const back = useCallback(() => {
    if (paused) return undefined // hay otro lector encima (PDF): Escape es suyo
    if (aa) return setAa(false)
    if (peek) return setPeek(null)
    if (over) return setOver(null)
    if (view === 'topic') return setView('start')
    onClose?.()
  }, [paused, aa, peek, over, view, onClose])
  const protect = useProtection({ onEscape: back, onSearch: () => { if (!paused) openOver('search') } })
  const showPeek = !!(peek && over && topics[peek.idx])

  const prog = getProgress(data, bookKey)
  const theme = book?.theme || {}
  return (
    <div className={`lw lw-m ${data.prefs.dark ? 'lw-dark' : ''} ${className}`} style={theme} data-kind={book?.kind} {...protect}>
      <div className="lw-view">
        {view === 'start' && !showPeek && (
          <StartScreen item={item} fileIdx={fileIdx} title={title} book={book} bookKey={bookKey} topics={topics} data={data} prog={prog}
            onClose={onClose} onOpen={open} onOpenId={openId} onLists={tab => { setListTab(tab); setOver('lists') }}
            onSearch={() => setOver('search')} onAa={() => setAa(true)} onPdf={() => onOpenPdf?.()} />
        )}
        {view === 'topic' && topics[idx] && !showPeek && (
          <TopicScreen key={topics[idx].id} book={book} bookKey={bookKey} topics={topics} idx={idx} user={user} data={data} store={store} jump={jump} mark={mark}
            page={pages[topics[idx].label]} classes={classes}
            onBack={() => setView('start')} onOpen={open} onSearch={() => setOver('search')} onAa={() => setAa(true)}
            onPdf={onOpenPdf} onClose={onClose} onClearQuery={() => setJump(j => ({ ...j, query: '' }))} />
        )}
        {/* la lista sigue montada (oculta) bajo el tema que se abrió desde ella: vuelve igual, a la misma altura */}
        {over === 'lists' && (
          <ListsScreen bookKey={bookKey} topics={topics} data={data} store={store} tab={listTab} onTab={setListTab} hidden={showPeek}
            onBack={() => setOver(null)} onOpenId={peekId} />
        )}
        {over === 'search' && (
          <SearchScreen book={book} state={search} onState={setSearch} onBack={() => setOver(null)} hidden={showPeek}
            onOpen={(i, hit, q) => peekAt(i, { query: q, focus: hit ? { start: hit.start, end: hit.end } : null })} />
        )}
        {showPeek && (
          <div className="lw-over lw-peek">
            <TopicScreen key={`p:${topics[peek.idx].id}`} book={book} bookKey={bookKey} topics={topics} idx={peek.idx} user={user} data={data} store={store} jump={peek.jump} mark={mark}
              page={pages[topics[peek.idx].label]} classes={classes} backLabel={over === 'search' ? 'Volver a los resultados' : 'Volver a Mis apuntes'}
              onBack={() => setPeek(null)} onOpen={i => peekAt(i)} onSearch={() => openOver('search')} onAa={() => setAa(true)}
              onPdf={onOpenPdf} onClose={onClose} onClearQuery={() => setPeek(p => (p ? { ...p, jump: { ...p.jump, query: '' } } : p))} />
          </div>
        )}
      </div>
      {aa && <AaSheet prefs={data.prefs} store={store} onClose={() => setAa(false)} />}
    </div>
  )
}
