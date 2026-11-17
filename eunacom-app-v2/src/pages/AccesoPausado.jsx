// Pantalla para usuarios con un reclamo de PayPal abierto (ver src/config/disputeHolds.js).
import React from 'react'
import { Link } from 'react-router-dom'
import { RECON_JUL2026, fmtClp } from '../config/tienda'

export default function AccesoPausado() {
  return (
    <div style={{ minHeight: '100vh', background: '#070b18', color: '#e8eef7', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 460, width: '100%', background: '#0f1730', border: '1px solid rgba(255,255,255,.08)', borderRadius: 20, padding: 28, textAlign: 'center' }}>
        <div style={{ fontSize: 42, marginBottom: 8 }}>⛔</div>
        <h1 style={{ fontSize: 22, margin: '0 0 12px' }}>Acceso denegado</h1>
        <p style={{ lineHeight: 1.6, margin: '0 0 12px', color: '#c7d2e4' }}>
          Tienes un reclamo abierto en PayPal por tu plan. Mientras PayPal decide el caso, el acceso a la
          <b> Reconstrucción EUNACOM Julio 2026</b> queda suspendido en tu cuenta.
        </p>
        <p style={{ lineHeight: 1.6, margin: '0 0 20px', color: '#c7d2e4' }}>
          Es un producto de pago: si quieres usarla ahora, puedes comprarla suelta por <b>{fmtClp(RECON_JUL2026.price)}</b>.
        </p>
        <Link to={`/biblioteca?add=${RECON_JUL2026.sku}`} style={{ display: 'block', background: '#2ea6ff', color: '#fff', fontWeight: 700, padding: '14px 18px', borderRadius: 14, textDecoration: 'none', marginBottom: 12 }}>
          Pagar {fmtClp(RECON_JUL2026.price)}
        </Link>
        <Link to="/reconstructions" style={{ color: '#8fb3e8', fontSize: 14 }}>Volver a las reconstrucciones</Link>
      </div>
    </div>
  )
}
