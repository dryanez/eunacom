// Bloqueos del lector (los mismos del lector PDF y del modo celular): sin copiar, cortar, seleccionar todo,
// imprimir, guardar ni menú de clic derecho; marca de agua con el correo. Seleccionar texto sí se puede
// (para destacar): lo que se bloquea es sacarlo del libro.
import { useEffect, useMemo, useRef } from 'react'

const stop = e => e.preventDefault()

/** Marca de agua repetida como fondo (SVG, no seleccionable). */
export function watermarkUrl(text, dark = false) {
  const t = String(text || '').replace(/[<&>"]/g, '')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="200"><text x="160" y="100" text-anchor="middle" transform="rotate(-28 160 100)" font-family="sans-serif" font-size="12" font-weight="700" fill="${dark ? 'rgba(148,163,184,0.10)' : 'rgba(30,58,138,0.09)'}">${t}</text></svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}
export const watermarkText = user => `${user?.email || 'EUNACOM App'} · ${new Date().toLocaleDateString('es-CL')} · eunacomapp.cl`

// Capas que se cierran con Escape antes que el lector (imagen ampliada, hoja de nota): la última abierta va primero.
// El lector escucha en window (captura), así que una capa no puede adelantársele con su propio listener:
// se anota aquí y useProtection le da el Escape a ella en vez de al lector.
const escLayers = []
const escHandled = new WeakSet()
// cuándo se cerró la última capa: un Escape de más justo después (doble Escape para cerrar una tarjeta) no cierra el lector
let lastLayerEsc = 0
const ESC_GRACE = 1000
/** useEscapeLayer(fn): mientras el componente está montado, Escape llama a `fn` y no llega al lector de atrás. */
export function useEscapeLayer(fn) {
  const ref = useRef(fn)
  useEffect(() => { ref.current = fn })
  useEffect(() => {
    const layer = () => ref.current?.()
    escLayers.push(layer)
    return () => { const i = escLayers.indexOf(layer); if (i >= 0) escLayers.splice(i, 1); lastLayerEsc = Date.now() }
  }, [])
}
function escapeToLayer(e) {
  if (escHandled.has(e)) return true // otro lector montado ya se lo dio a la capa
  const top = escLayers[escLayers.length - 1]
  if (!top) return false
  escHandled.add(e)
  e.preventDefault(); e.stopPropagation()
  top()
  lastLayerEsc = Date.now()
  return true
}
export const isTouch = () => typeof window !== 'undefined' && !!window.matchMedia?.('(pointer: coarse)').matches

/**
 * useProtection({ onEscape, onSearch }) → props para el contenedor raíz del lector
 * ({ onContextMenu, onDragStart, onCopy, onCut }). Mientras está montado: bloquea Ctrl/⌘ + S, P, C, A, X,
 * Ctrl/⌘+F abre el buscador del lector, no se imprime nada y la página de atrás no se desplaza.
 */
export function useProtection({ onEscape, onSearch } = {}) {
  const cb = useRef({})
  cb.current = { onEscape, onSearch }
  const lastTouch = useRef(0)

  useEffect(() => {
    const onKey = e => {
      const k = e.key?.toLowerCase()
      const typing = /^(input|textarea)$/i.test(e.target?.tagName || '')
      if ((e.metaKey || e.ctrlKey) && ['s', 'p'].includes(k)) { e.preventDefault(); e.stopPropagation() }
      // en un campo propio (nota, buscador) se puede copiar/pegar lo que uno mismo escribe
      if ((e.metaKey || e.ctrlKey) && ['c', 'a', 'x'].includes(k) && !typing) { e.preventDefault(); e.stopPropagation() }
      // con una capa encima (imagen ampliada, hoja de nota) el buscador no se abre debajo
      if ((e.metaKey || e.ctrlKey) && k === 'f' && cb.current.onSearch) { e.preventDefault(); if (!escLayers.length) cb.current.onSearch() }
      if (k === 'printscreen') { e.preventDefault(); try { navigator.clipboard?.writeText('') } catch { /* sin permiso */ } }
      if (k === 'escape' && !escapeToLayer(e) && !e.repeat && Date.now() - lastLayerEsc > ESC_GRACE) cb.current.onEscape?.()
    }
    const onTouch = () => { lastTouch.current = Date.now() }
    window.addEventListener('keydown', onKey, true)
    window.addEventListener('touchstart', onTouch, { passive: true, capture: true })
    const style = document.createElement('style')
    style.textContent = '@media print { body * { visibility: hidden !important; } }'
    document.head.appendChild(style)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey, true)
      window.removeEventListener('touchstart', onTouch, { capture: true })
      style.remove()
      document.body.style.overflow = prev
    }
  }, [])

  return useMemo(() => {
    const inField = e => /^(input|textarea)$/i.test(e.target?.tagName || '')
    const noCopy = e => {
      if (inField(e)) return
      e.preventDefault()
      try { e.clipboardData?.setData('text/plain', 'El contenido de los libros de EUNACOM App no se puede copiar.') } catch { /* sin acceso */ }
    }
    return {
      // En pantallas táctiles el toque largo sobre el texto es la forma de seleccionar: ahí no se cancela
      // (en Android cancelarlo impide la selección). Sobre imágenes, enlaces y con mouse, sí.
      onContextMenu: e => {
        const touch = Date.now() - lastTouch.current < 1500
        if (touch && e.target?.closest?.('.lw-body') && !e.target.closest('img, a, svg, figure')) return
        if (inField(e)) return
        e.preventDefault()
      },
      onDragStart: stop,
      onCopy: noCopy,
      onCut: noCopy,
    }
  }, [])
}

export default useProtection
