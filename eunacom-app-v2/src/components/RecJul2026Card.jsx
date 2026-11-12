// Aviso de la Reconstrucción EUNACOM Julio 2026 (inicio de la app y landing pública de reconstrucciones).
// Con plan: «ya es tuya» → /reconstructions. Sin plan o sin sesión: → landing /reconstruccion-julio-2026.
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import { RECON_JUL2026, isReleased, fmtClp } from '../config/tienda'
import '../styles/recJul2026Card.css'

const KEY = 'recjul26_card_closed'

export default function RecJul2026Card({ owned = false, dismissible = false, utm = 'app_inicio' }) {
  const [closed, setClosed] = useState(() => dismissible && typeof localStorage !== 'undefined' && localStorage.getItem(KEY) === '1')
  if (closed) return null
  const out = isReleased(RECON_JUL2026)
  const landing = `/reconstruccion-julio-2026?utm_source=eunacomapp&utm_medium=${utm}`
  const close = () => { try { localStorage.setItem(KEY, '1') } catch { /* sin storage */ } setClosed(true) }

  return (
    <section className="rj26">
      <img className="rj26-cover" src={RECON_JUL2026.cover} alt="" width="88" />
      <div className="rj26-txt">
        <span className="rj26-k">Nueva · {out ? 'ya disponible' : 'llega el 16 de noviembre'}</span>
        <h3>Reconstrucción EUNACOM Julio 2026</h3>
        <p>
          {owned
            ? (out ? 'Las 180 preguntas del examen de julio, con su explicación. Ya está en tu cuenta.'
                   : 'Viene incluida en tu plan: el 16 de noviembre aparece sola en Reconstrucciones y en tu biblioteca.')
            : <>Las 180 preguntas del examen de julio, con su explicación. <b>Gratis con cualquier plan</b> o suelta a {fmtClp(RECON_JUL2026.price)}.</>}
        </p>
      </div>
      {owned
        ? <Link className="rj26-btn" to="/reconstructions">{out ? 'Hacer la reconstrucción' : 'Verla en Reconstrucciones'}</Link>
        : <Link className="rj26-btn" to={landing}>Ver la reconstrucción</Link>}
      {dismissible && <button className="rj26-x" onClick={close} aria-label="Ocultar aviso"><X size={16} /></button>}
    </section>
  )
}
