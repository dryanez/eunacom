import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { ChevronLeft, ChevronRight, Check, Bookmark, PlayCircle, FileText, X } from 'lucide-react'
import { topicQuestionCount } from '../../../lib/lector/content'
import { TopicBody, watermarkUrl } from '../render'

// Un tema en su columna de lectura, con su barra (anterior/siguiente, estudiado, marcador, clase, página original).
// `main` = el tema de la pestaña activa: es el que queda como «donde quedaste» (junto con su altura).
export default function Pane({ book, bookKey, user, topics, topic, store, mark, dark, fontSize, page, classRoute, done, marked, jump, scrollMem, consumed,
  main = false, canSave = false, opened = true, onRead, focused = false, onFocus, onStep, onDone, onMark, onPdf, onClass, onClearQuery, onCloseSplit }) {
  const scrollRef = useRef(null)
  const prev = topics[topic.index - 1], next = topics[topic.index + 1]
  const nQ = useMemo(() => topicQuestionCount(topic), [topic])
  // un salto (buscador, nota, «donde quedaste») se usa una vez; al volver a la pestaña se vuelve a la altura que tenía
  const fresh = !!jump && consumed.get(topic.id) !== jump.n
  const lastN = useRef(null)
  if (fresh) lastN.current = jump.n
  useEffect(() => () => { if (lastN.current != null) consumed.set(topic.id, lastN.current) }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const focus = useMemo(() => (fresh && jump.focus ? { ...jump.focus, n: jump.n } : null), [jump?.n]) // eslint-disable-line react-hooks/exhaustive-deps

  const frac = () => { const sc = scrollRef.current; if (!sc) return 0; const max = sc.scrollHeight - sc.clientHeight; return max > 0 ? Math.min(1, sc.scrollTop / max) : 0 }

  useLayoutEffect(() => {
    const sc = scrollRef.current
    if (!sc) return undefined
    if (fresh && jump.focus) return undefined // TopicBody baja hasta el texto
    const f = fresh ? Number(jump.scroll) || 0 : scrollMem.get(topic.id) || 0
    const go = () => { sc.scrollTop = f * Math.max(0, sc.scrollHeight - sc.clientHeight) }
    go()
    if (!f) return undefined
    const t = setTimeout(go, 350) // las fotos terminan de medirse después
    return () => clearTimeout(t)
  }, [jump?.n]) // eslint-disable-line react-hooks/exhaustive-deps

  // «donde quedaste»: el tema al abrirlo y la altura mientras se lee (sin escribir en cada movimiento)
  // (opened = el usuario ya eligió un tema o leyó: el tema que solo se mostró al abrir el libro no cuenta)
  const save = main && canSave
  useEffect(() => {
    if (!save || !opened) return undefined
    store.setProgress(bookKey, { topicId: topic.id, scroll: frac() })
    return undefined
  }, [save, opened, store, bookKey, topic.id])
  const readRef = useRef(onRead)
  readRef.current = onRead
  const openedRef = useRef(opened)
  openedRef.current = opened
  useEffect(() => {
    const sc = scrollRef.current
    if (!sc) return undefined
    let t = 0, dirty = false
    const write = () => { t = 0; if (dirty && save && openedRef.current) store.setProgress(bookKey, { topicId: topic.id, scroll: scrollMem.get(topic.id) || 0 }); dirty = false }
    // desplazar el texto a mano, tocarlo o responder es leer (un salto del programa no lo es: no hay rueda, tecla ni toque)
    const user = () => { if (main) readRef.current?.() }
    const onScroll = () => { scrollMem.set(topic.id, frac()); dirty = true; clearTimeout(t); t = setTimeout(write, 900) }
    sc.addEventListener('wheel', user, { passive: true }); sc.addEventListener('touchmove', user, { passive: true }); sc.addEventListener('keydown', user); sc.addEventListener('pointerdown', user)
    sc.addEventListener('scroll', onScroll, { passive: true })
    return () => { sc.removeEventListener('scroll', onScroll); sc.removeEventListener('wheel', user); sc.removeEventListener('touchmove', user); sc.removeEventListener('keydown', user); sc.removeEventListener('pointerdown', user); if (t) { clearTimeout(t); write() } }
  }, [save, main, store, bookKey, topic.id, scrollMem])

  return (
    <section className={`lwd-pane ${focused ? 'focused' : ''}`} onPointerDownCapture={onFocus} aria-label={`${topic.label} · ${topic.title}`}>
      <div className="lwd-bar">
        <div className="lwd-nav">
          <button onClick={() => onStep(-1)} disabled={!prev} aria-label="Tema anterior" title={prev ? `Anterior: ${prev.label} · ${prev.title}` : 'Tema anterior'}><ChevronLeft size={18} /></button>
          <button onClick={() => onStep(1)} disabled={!next} aria-label="Tema siguiente" title={next ? `Siguiente: ${next.label} · ${next.title}` : 'Tema siguiente'}><ChevronRight size={18} /></button>
        </div>
        <div className="lwd-bar-t"><i>{topic.label}</i><span>{topic.title}</span></div>
        {classRoute && <button className="lwd-act clase" onClick={() => onClass(classRoute)} title="Ver la clase de este tema"><PlayCircle size={16} /><span>Ver la clase</span></button>}
        <button className="lwd-act" onClick={() => onPdf?.(page)} title={page ? `Abrir el PDF original en la página ${page}` : 'Abrir el PDF original'}><FileText size={15} /><span>PDF original{page ? ` · p. ${page}` : ''}</span></button>
        <button className={`lwd-act icon ${marked ? 'marked' : ''}`} onClick={onMark} aria-pressed={marked} aria-label={marked ? 'Quitar marcador' : 'Poner marcador'} title={marked ? 'Quitar marcador (B)' : 'Poner marcador (B)'}>
          <Bookmark size={16} fill={marked ? 'currentColor' : 'none'} />
        </button>
        <button className={`lwd-act done ${done ? 'on' : ''}`} onClick={onDone} aria-pressed={done} title={done ? 'Quitar la marca de estudiado (M)' : 'Marcar como estudiado (M)'}>
          <Check size={16} strokeWidth={3} /><span>{done ? 'Estudiado' : 'Marcar como estudiado'}</span>
        </button>
        {onCloseSplit && <button className="lwd-act icon" onClick={onCloseSplit} aria-label="Cerrar el segundo tema" title="Cerrar el segundo tema"><X size={16} /></button>}
      </div>

      <div ref={scrollRef} className="lw-scroll lwd-scroll" style={{ backgroundImage: watermarkUrl(mark, dark) }}>
        <article className="lw-doc" style={{ fontSize }}>
          <div className="lw-kicker">Bloque {topic.block.n} · {topic.block.name}</div>
          <h2><span className="lw-num">{topic.label}</span> {topic.title}</h2>
          {nQ > 0 && <p className="lwd-meta">{nQ} {nQ === 1 ? 'pregunta para responder' : 'preguntas para responder'} en este tema</p>}
          <TopicBody userId={user?.id} bookKey={bookKey} book={book} topic={topic} query={jump?.query || ''} focus={focus} mark={mark} />
          <div className="lwd-end">
            <button className={`lwd-end-done ${done ? 'on' : ''}`} onClick={onDone} aria-pressed={done}>
              <Check size={18} strokeWidth={3} />{done ? 'Tema estudiado' : 'Marcar como estudiado'}
            </button>
            <div className="lwd-end-nav">
              {prev ? <button onClick={() => onStep(-1)}><ChevronLeft size={18} /><span><small>Tema anterior</small><b>{prev.label} · {prev.title}</b></span></button> : <span />}
              {next ? <button className="next" onClick={() => onStep(1)}><span><small>Tema siguiente</small><b>{next.label} · {next.title}</b></span><ChevronRight size={18} /></button> : <span />}
            </div>
          </div>
        </article>
      </div>

      {jump?.query && (
        <div className="lwd-chip"><span>Buscando «{jump.query}»</span><button onClick={onClearQuery} aria-label="Quitar las marcas de búsqueda"><X size={14} /></button></div>
      )}
    </section>
  )
}
