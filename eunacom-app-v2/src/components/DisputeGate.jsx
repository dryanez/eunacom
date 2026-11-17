// Bloquea toda la app a un usuario con reclamo PayPal abierto (src/config/disputeHolds.js),
// salvo las rutas para pagar. Al comprar el SKU pendiente, se desbloquea solo.
import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useSubscription } from '../contexts/SubscriptionContext'
import { holdFor, HOLD_OPEN_PATHS } from '../config/disputeHolds'
import AccesoPausado from '../pages/AccesoPausado'

export default function DisputeGate({ children }) {
  const { user } = useAuth()
  const { ownedBooks } = useSubscription()
  const { pathname, key } = useLocation()
  const [closedKey, setClosedKey] = useState(null)
  const hold = holdFor(user?.id)
  const paid = hold?.payToUnlock && ownedBooks?.has?.(hold.payToUnlock)
  if (hold?.blockApp && !paid && !HOLD_OPEN_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))) return <AccesoPausado />
  if (hold?.karma && pathname === '/test-runner' && closedKey !== key) {
    return (
      <>
        {children}
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(3,6,15,.82)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ maxWidth: 420, width: '100%', background: '#0f1730', color: '#e8eef7', border: '1px solid rgba(255,255,255,.1)', borderRadius: 20, padding: 26, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 6 }}>☯️</div>
            <h2 style={{ fontSize: 20, margin: '0 0 10px' }}>El karma se paga en vida</h2>
            <p style={{ lineHeight: 1.6, margin: '0 0 18px', color: '#c7d2e4' }}>
              PayPal revisó tu reclamo y lo resolvió a nuestro favor. Sigues estudiando con la plataforma que dijiste que no funcionaba. Que te vaya como mereces en el examen.
            </p>
            <button onClick={() => setClosedKey(key)} style={{ width: '100%', background: '#2ea6ff', color: '#fff', fontWeight: 700, padding: '13px 16px', border: 0, borderRadius: 14, cursor: 'pointer' }}>
              Entendido
            </button>
          </div>
        </div>
      </>
    )
  }
  return children
}
