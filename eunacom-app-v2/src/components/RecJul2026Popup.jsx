// Pop-up de la Reconstrucción EUNACOM Julio 2026 en el Inicio (mismo formato que el pop-up del bundle de FaMED).
// Aparece 1,5 s después de entrar; al cerrarlo no vuelve en 3 días.
// Con plan: «viene incluida en tu plan». Sin plan o sin sesión: «Gratis con cualquier plan» → landing.
import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { X, ArrowRight } from 'lucide-react'
import { RECON_JUL2026, isReleased, fmtClp } from '../config/tienda'
import '../styles/recJul2026Popup.css'

const KEY = 'recjul26_popup_closed_at'
const HIDE_FOR_MS = 3 * 24 * 60 * 60 * 1000
const recentlyClosed = () => { try { return Date.now() - Number(localStorage.getItem(KEY) || 0) < HIDE_FOR_MS } catch { return false } }

export default function RecJul2026Popup({ owned = false }) {
  const [open, setOpen] = useState(false)
  const out = isReleased(RECON_JUL2026)

  useEffect(() => {
    if (recentlyClosed()) return undefined
    if (!document.getElementById('rj-font')) { const l = document.createElement('link'); l.id = 'rj-font'; l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800&display=swap'; document.head.appendChild(l) }
    const t = setTimeout(() => setOpen(true), 1500)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!open) return undefined
    const onKey = e => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  function close() {
    setOpen(false)
    try { localStorage.setItem(KEY, String(Date.now())) } catch { /* modo privado */ }
  }

  if (!open) return null
  const landing = '/reconstruccion-julio-2026?utm_source=eunacomapp&utm_medium=popup_inicio'
  const cta = owned
    ? { to: '/reconstructions', label: out ? 'Hacer la reconstrucción' : 'Verla en Reconstrucciones' }
    : { to: landing, label: 'Llevármela gratis' }

  return createPortal(
    <div className="rjp-back" onClick={close}>
      <div className="rjp" role="dialog" aria-modal="true" aria-labelledby="rjp-title" onClick={e => e.stopPropagation()}>
        <button className="rjp-x" onClick={close} aria-label="Cerrar"><X size={18} /></button>
        <div className="rjp-hero">
          <span className="rjp-tag">{out ? 'Nueva · ya disponible' : 'Nueva · 16 nov'}</span>
          <img src={RECON_JUL2026.cover} alt="Portada Reconstrucción EUNACOM Julio 2026" />
        </div>
        <div className="rjp-body">
          <div className="rjp-k">La última antes de tu examen</div>
          <h2 id="rjp-title">Reconstrucción EUNACOM Julio 2026</h2>
          <ul>
            <li>Las 180 preguntas del examen de julio</li>
            <li>La explicación de cada respuesta</li>
            <li>Modo examen y el libro en PDF</li>
          </ul>
          {owned ? (
            <>
              <div className="rjp-price"><b>Incluida</b><s>{fmtClp(RECON_JUL2026.price)}</s></div>
              <p className="rjp-sub">{out ? 'Ya está en tu cuenta, en Reconstrucciones y en tu biblioteca.' : 'Viene en tu plan: el 16 de noviembre aparece sola en tu cuenta.'}</p>
            </>
          ) : (
            <>
              <div className="rjp-price"><b>Gratis</b><s>{fmtClp(RECON_JUL2026.price)}</s></div>
              <p className="rjp-sub">con cualquier plan de EUNACOM App</p>
            </>
          )}
          <Link className="rjp-btn" to={cta.to} onClick={close}>{cta.label} <ArrowRight size={18} /></Link>
          <button className="rjp-later" onClick={close}>Más tarde</button>
        </div>
      </div>
    </div>,
    document.body
  )
}
