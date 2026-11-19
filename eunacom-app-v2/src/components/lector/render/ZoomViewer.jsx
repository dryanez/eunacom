import React, { useEffect, useRef, useState } from 'react'
import { X, ZoomIn, ZoomOut } from 'lucide-react'
import { isTouch, useEscapeLayer, watermarkUrl } from './useProtection'
import { useHistoryLayer } from '../../../lib/lector/nav'

// Visor a pantalla completa de un algoritmo o foto: pellizco o botones para acercar, se mueve con el dedo.
// z = { svg?: string, img?: string, title?: string }
export default function ZoomViewer({ z, style, mark, onClose }) {
  const [k, setK] = useState(1)
  const boxRef = useRef(null)
  const kRef = useRef(1)
  kRef.current = k
  useEscapeLayer(onClose) // Escape cierra solo el visor, no el lector de atrás
  useHistoryLayer(true, onClose) // «Atrás» del teléfono también
  const clamp = v => Math.min(4, Math.max(1, Math.round(v * 100) / 100))
  useEffect(() => {
    const box = boxRef.current
    if (!box) return
    let p = null
    const d = t => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY)
    const start = e => { if (e.touches.length === 2) p = { d: d(e.touches), k: kRef.current } }
    const move = e => { if (p && e.touches.length === 2) { e.preventDefault(); setK(clamp(p.k * d(e.touches) / p.d)) } }
    const end = e => { if (e.touches.length < 2) p = null }
    box.addEventListener('touchstart', start, { passive: true })
    box.addEventListener('touchmove', move, { passive: false })
    box.addEventListener('touchend', end)
    return () => { box.removeEventListener('touchstart', start); box.removeEventListener('touchmove', move); box.removeEventListener('touchend', end) }
  }, [])
  // al acercar con botones, mantener el centro
  const zoomBy = f => {
    const box = boxRef.current
    const cx = box ? (box.scrollLeft + box.clientWidth / 2) / box.scrollWidth : 0.5
    const cy = box ? (box.scrollTop + box.clientHeight / 2) / box.scrollHeight : 0.5
    setK(v => clamp(v * f))
    requestAnimationFrame(() => { if (box) { box.scrollLeft = cx * box.scrollWidth - box.clientWidth / 2; box.scrollTop = cy * box.scrollHeight - box.clientHeight / 2 } })
  }
  return (
    <div className="lw-visor" style={style} role="dialog" aria-label={z.title || 'Imagen ampliada'}>
      <div className="lw-visor-bar">
        <span className="lw-visor-t">{z.title}</span>
        <button onClick={() => zoomBy(1 / 1.5)} disabled={k <= 1} aria-label="Alejar" className="lw-ib"><ZoomOut size={17} /></button>
        <button onClick={() => zoomBy(1.5)} disabled={k >= 4} aria-label="Acercar" className="lw-ib"><ZoomIn size={17} /></button>
        <button onClick={onClose} aria-label="Cerrar" className="lw-ib"><X size={18} /></button>
      </div>
      <div ref={boxRef} className="lw-visor-box" style={{ backgroundImage: mark ? watermarkUrl(mark, false) : undefined }}>
        <div className="lw-visor-in" style={{ width: `${k * 100}%` }}>
          {z.svg ? <div className="lw-visor-svg" dangerouslySetInnerHTML={{ __html: z.svg }} /> : <img src={z.img} alt="" draggable={false} />}
        </div>
      </div>
      {isTouch() && <p className="lw-visor-hint">Pellizca para acercar · gira el teléfono para verlo más grande</p>}
    </div>
  )
}
