import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, Bookmark, ChevronLeft, ChevronRight, Check, PlayCircle, FileText, X } from 'lucide-react'
import { topicClassId } from '../../../lib/lector/content'
import { SIZES, isBookmarked, isDone } from '../../../lib/lector/userData'
import { TopicBody, watermarkUrl } from '../render'

// Un tema por pantalla. Arriba: volver, título, buscar, Aa, marcador. Abajo: anterior / estudiado / siguiente.
export default function TopicScreen({ book, bookKey, topics, idx, user, data, store, jump, mark, page, classes, backLabel = 'Volver al índice', onBack, onOpen, onSearch, onAa, onPdf, onClose, onClearQuery }) {
  const topic = topics[idx]
  const navigate = useNavigate()
  const scrollRef = useRef(null)
  const done = isDone(data, bookKey, topic.id)
  const marked = isBookmarked(data, bookKey, topic.id)
  const classRoute = classes?.get(topicClassId(topic)) || null
  const fs = SIZES[Math.min(SIZES.length - 1, Math.max(0, data.prefs.size))]

  // al abrir: queda como «donde quedaste» y, si corresponde, vuelve a la altura guardada.
  // Reabierto solo por la dirección (recarga, «Adelante», enlace con &t=): no cuenta como leer hasta que la persona
  // desplaza, toca o escribe en el tema.
  const engaged = useRef(!jump?.restored)
  useLayoutEffect(() => {
    const sc = scrollRef.current
    const frac = jump?.focus ? 0 : Number(jump?.scroll) || 0
    if (engaged.current) store.setProgress(bookKey, { topicId: topic.id, scroll: frac })
    if (!sc || !frac) return undefined
    const go = () => { sc.scrollTop = frac * Math.max(0, sc.scrollHeight - sc.clientHeight) }
    go()
    const t = setTimeout(go, 350) // las fotos terminan de medirse después
    return () => clearTimeout(t)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // guarda la altura mientras se lee (sin escribir en cada movimiento)
  useEffect(() => {
    const sc = scrollRef.current
    if (!sc) return undefined
    let t = 0, frac = null
    const cur = () => { const max = sc.scrollHeight - sc.clientHeight; return max > 0 ? sc.scrollTop / max : 0 }
    const save = () => { t = 0; if (frac != null && engaged.current) store.setProgress(bookKey, { topicId: topic.id, scroll: frac }) }
    const onScroll = () => {
      frac = cur()
      clearTimeout(t); t = setTimeout(save, 900)
    }
    const user = () => {
      if (engaged.current) return
      engaged.current = true
      store.setProgress(bookKey, { topicId: topic.id, scroll: cur() })
    }
    const evs = ['wheel', 'touchmove', 'keydown', 'pointerdown']
    evs.forEach(e => sc.addEventListener(e, user, { passive: true }))
    sc.addEventListener('scroll', onScroll, { passive: true })
    return () => { sc.removeEventListener('scroll', onScroll); evs.forEach(e => sc.removeEventListener(e, user)); if (t) { clearTimeout(t); save() } }
  }, [store, bookKey, topic.id])

  const prev = topics[idx - 1], next = topics[idx + 1]
  const focus = useMemo(() => (jump?.focus ? { ...jump.focus, n: jump.n } : null), [jump?.focus, jump?.n])
  // a la clase sin cerrar el lector: «Atrás» desde la clase vuelve a este tema (la dirección del libro queda en el historial)
  const goClass = () => navigate(classRoute)

  return (
    <>
      <div className="lw-top">
        <button className="lw-ib plain" onClick={onBack} aria-label={backLabel} title={backLabel}><ArrowLeft size={20} /></button>
        <div className="lw-top-t"><small>{topic.label} · Bloque {topic.block.n}</small><b>{topic.title}</b></div>
        <button className="lw-ib" onClick={onSearch} aria-label="Buscar en el libro"><Search size={18} /></button>
        <button className="lw-ib" onClick={onAa} aria-label="Letra y tema">Aa</button>
        <button className={`lw-ib ${marked ? 'marked' : ''}`} onClick={() => store.toggleBookmark({ bookKey, topicId: topic.id, title: `${topic.label} · ${topic.title}` })}
          aria-label={marked ? 'Quitar marcador' : 'Poner marcador'} aria-pressed={marked}><Bookmark size={18} fill={marked ? 'currentColor' : 'none'} /></button>
      </div>

      <div ref={scrollRef} className="lw-scroll" style={{ backgroundImage: watermarkUrl(mark, data.prefs.dark) }}>
        <article className={`lw-doc${jump?.query ? ' has-chip' : ''}`} style={{ fontSize: fs }}>
          <div className="lw-kicker">Bloque {topic.block.n} · {topic.block.name}</div>
          <h2><span className="lw-num">{topic.label}</span> {topic.title}</h2>
          <div className="lw-acts">
            {classRoute && <button className="lw-act clase" onClick={goClass}><PlayCircle size={16} />Ver la clase</button>}
            <button className="lw-act" onClick={() => onPdf?.(page)}><FileText size={15} />PDF original{page ? ` · p. ${page}` : ''}</button>
          </div>
          <TopicBody userId={user?.id} bookKey={bookKey} book={book} topic={topic} query={jump?.query || ''}
            focus={focus} mark={mark} />
          {next && (
            <button className="lw-next" onClick={() => onOpen(idx + 1)}>
              <span><small>Siguiente tema</small><b>{next.label} · {next.title}</b></span><ChevronRight size={20} />
            </button>
          )}
        </article>
      </div>

      {jump?.query && (
        <div className="lw-chip"><span>Buscando «{jump.query}»</span><button onClick={onClearQuery} aria-label="Quitar las marcas de búsqueda"><X size={14} /></button></div>
      )}

      <div className="lw-bottom">
        <button className="lw-step" onClick={() => onOpen(idx - 1)} disabled={!prev} aria-label="Tema anterior"><ChevronLeft size={18} />{prev?.label}</button>
        <button className={`lw-done ${done ? 'on' : ''}`} onClick={() => store.setDone(bookKey, topic.id, !done)} aria-pressed={done}>
          <Check size={17} strokeWidth={3} />{done ? 'Estudiado' : 'Marcar como estudiado'}
        </button>
        <button className="lw-step" onClick={() => onOpen(idx + 1)} disabled={!next} aria-label="Tema siguiente">{next?.label}<ChevronRight size={18} /></button>
      </div>
    </>
  )
}
