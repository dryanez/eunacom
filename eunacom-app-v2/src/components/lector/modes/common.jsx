// Piezas comunes de las vistas de Atlas, Repaso Final y Perfil V3.
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, X, FileText, Moon, Sun, Search } from 'lucide-react'
import { bookCover } from '../../../lib/lector/content'
import { SIZES, useUserData } from '../../../lib/lector/userData'
import { urlWith, useHistoryLayer } from '../../../lib/lector/nav'
import { useProtection, watermarkText } from '../render'
import AaSheet from '../mobile/AaSheet'
import '../../../styles/lector-web.css'
import '../mobile/mobile.css'
import './modes.css'

/** Lo que toda vista necesita: datos del usuario, bloqueos de copia, marca de agua, tamaño de letra y la hoja «Aa».
 *  `onBack` se llama con Escape (si no hay otro lector encima). La hoja «Aa» es una entrada del historial. */
export function useReader({ user, bookKey, paused, onBack }) {
  const [data, store] = useUserData(user?.id)
  const [aa, setAa] = useState(false)
  useHistoryLayer(aa, () => setAa(false))
  useEffect(() => { store.sync(bookKey) }, [store, bookKey])
  const protect = useProtection({ onEscape: () => { if (paused) return; if (aa) setAa(false); else onBack?.() } })
  const mark = useMemo(() => watermarkText(user), [user])
  const fs = SIZES[Math.min(SIZES.length - 1, Math.max(0, data.prefs.size))]
  return { data, store, aa, setAa, protect, mark, fs }
}

export function Root({ book, r, children }) {
  return (
    <div className={`lw lw-m lwx ${r.data.prefs.dark ? 'lw-dark' : ''}`} style={book?.theme} data-kind={book?.kind} {...r.protect}>
      <div className="lw-view">{children}</div>
      {r.aa && <AaSheet prefs={r.data.prefs} store={r.store} onClose={() => r.setAa(false)} />}
    </div>
  )
}

/** `matchMedia` como estado (se actualiza al cambiar el ancho de la ventana). */
export function useMedia(query) {
  const [on, setOn] = useState(() => typeof window !== 'undefined' && !!window.matchMedia?.(query).matches)
  useEffect(() => {
    const mq = window.matchMedia?.(query)
    if (!mq) return undefined
    const f = () => setOn(mq.matches)
    f()
    mq.addEventListener?.('change', f)
    return () => mq.removeEventListener?.('change', f)
  }, [query])
  return on
}
/** Computador (mismo corte que LectorWeb: 1024 px). */
export const useWide = () => useMedia('(min-width: 1024px)')
/** Mouse o trackpad: los textos dicen «haz clic» en vez de «toca». */
export const useFine = () => useMedia('(hover: hover) and (pointer: fine)')

/** Rótulo del botón que abre el libro en PDF (el mismo en todo el lector). */
export const PDF_LABEL = 'PDF original'

/** Botón «PDF original» al pie de la columna de inicio (teléfono). */
export function PdfButton({ onPdf }) {
  return <button className="lw-btn lw-start-pdf lwx-only-narrow" onClick={() => onPdf?.()}><FileText size={16} />{PDF_LABEL}</button>
}

/** Barra superior. `close`: X (cerrar el libro) en vez de la flecha. `onPdf`: botón del libro original en PDF.
 *  `r` (de useReader): agrega en computador el botón claro / oscuro junto a «Aa». */
export function Top({ onBack, close = false, backLabel, kicker, title, onAa, onPdf, r, children }) {
  const dark = !!r?.data.prefs.dark
  return (
    <div className="lw-top lwx-top">
      <button className="lw-ib plain" onClick={onBack} aria-label={backLabel || (close ? 'Cerrar el libro' : 'Volver')} title={backLabel || (close ? 'Cerrar el libro' : 'Volver')}>{close ? <X size={20} /> : <ArrowLeft size={20} />}</button>
      <div className="lw-top-t">{kicker && <small>{kicker}</small>}<b>{title}</b></div>
      {children}
      {onPdf && <button className="lw-ib lwx-top-pdf" onClick={() => onPdf()} aria-label={PDF_LABEL} title={PDF_LABEL}><FileText size={17} /><span>{PDF_LABEL}</span></button>}
      {r && <button className="lw-ib lwx-only-wide" onClick={() => r.store.setPrefs({ dark: !dark })} aria-label={dark ? 'Modo claro' : 'Modo oscuro'} title={dark ? 'Modo claro' : 'Modo oscuro'}>{dark ? <Sun size={17} /> : <Moon size={17} />}</button>}
      {onAa && <button className="lw-ib" onClick={onAa} aria-label="Letra y tema" title="Letra y tema">Aa</button>}
    </div>
  )
}

/** Campo para filtrar el índice (Atlas, Repaso). */
export function Filter({ value, onChange, placeholder }) {
  return (
    <div className="lwx-q lwx-filter">
      <Search size={17} />
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} enterKeyHint="search" inputMode="search"
        autoComplete="off" autoCorrect="off" spellCheck={false} aria-label={placeholder} />
      {value && <button onClick={() => onChange('')} aria-label="Borrar la búsqueda"><X size={16} /></button>}
    </div>
  )
}

export function Hero({ item, fileIdx, book }) {
  const cover = bookCover(item, fileIdx)
  return (
    <header className="lw-hero">
      {cover && <img src={cover} alt="" draggable={false} />}
      <div>
        <div className="lw-hero-k">{book.module}</div>
        <h1>{book.title}</h1>
        {book.subtitle && <p>{book.subtitle}</p>}
      </div>
    </header>
  )
}

export function Progress({ n, total, children }) {
  const pct = total ? Math.round((n / total) * 100) : 0
  return (
    <div className="lw-prog">
      <div className="lw-prog-l"><span>{children}</span><span>{pct} %</span></div>
      <div className="lw-bar" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={n}><i style={{ width: `${pct}%` }} /></div>
    </div>
  )
}

/** Barra inferior con el contenido centrado (en computador no se estira de lado a lado). */
export function Bottom({ children }) {
  return <div className="lw-bottom lwx-bottom"><div className="lwx-bottom-in">{children}</div></div>
}

/** Teclas de la vista (no mientras se escribe ni con otro lector encima). `fn(e)` devuelve true si usó la tecla.
 *  Espacio y Enter sobre un botón enfocado se dejan pasar: ya hacen clic en ese botón. */
export function useKeys(fn, on = true) {
  const ref = useRef(fn)
  ref.current = fn
  useEffect(() => {
    if (!on) return undefined
    const onKey = e => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const tag = e.target?.tagName || ''
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) return
      if ((e.key === ' ' || e.key === 'Enter') && (/^(BUTTON|A|SUMMARY)$/.test(tag) || e.target?.getAttribute?.('role') === 'button')) return
      if (ref.current(e)) e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [on])
}

/** Deslizar con el dedo hacia los lados sobre `ref` (no interfiere con el desplazamiento vertical). */
export function useSwipe(ref, { onLeft, onRight }, on = true) {
  const cb = useRef({})
  cb.current = { onLeft, onRight }
  useEffect(() => {
    const el = ref.current
    if (!el || !on) return undefined
    let s = null
    const start = e => { s = e.touches.length === 1 ? { x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now() } : null }
    const end = e => {
      if (!s) return
      const t = e.changedTouches[0], dx = t.clientX - s.x, dy = t.clientY - s.y, quick = Date.now() - s.t < 700
      s = null
      if (!quick || Math.abs(dx) < 64 || Math.abs(dx) < Math.abs(dy) * 2) return
      if (window.getSelection && !window.getSelection().isCollapsed) return // estaba seleccionando texto
      if (dx < 0) cb.current.onLeft?.(); else cb.current.onRight?.()
    }
    el.addEventListener('touchstart', start, { passive: true })
    el.addEventListener('touchend', end, { passive: true })
    return () => { el.removeEventListener('touchstart', start); el.removeEventListener('touchend', end) }
  }, [ref, on])
}

export const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`

/* Historial (lib/lector/nav.js): cada pantalla interior (ficha, tema, lista de extras, sesión de repaso) es una entrada
   con ?t=<partes unidas por «~»>, así «Atrás» sale de a un nivel y al recargar se vuelve a abrir lo mismo. */
/** `true` solo en el primer dibujo de la vista: las capas abiertas de entrada adoptan la entrada que ya existe. */
export function useBoot() {
  const ref = useRef(true)
  useEffect(() => { ref.current = false }, [])
  return ref.current
}
/** Dirección actual con t = las partes unidas por «~» (null si no hay partes). */
export const tUrl = (...parts) => { const t = parts.filter(Boolean).join('~'); return t ? urlWith({ t }) : null }
/** Partes de initialTopicId (?t=…). */
export const tParts = t => String(t || '').split('~').filter(Boolean)
