// Bloquea toda la app a un usuario con reclamo PayPal abierto (src/config/disputeHolds.js),
// salvo las rutas para pagar. Al comprar el SKU pendiente, se desbloquea solo.
import React from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useSubscription } from '../contexts/SubscriptionContext'
import { holdFor, HOLD_OPEN_PATHS } from '../config/disputeHolds'
import AccesoPausado from '../pages/AccesoPausado'

export default function DisputeGate({ children }) {
  const { user } = useAuth()
  const { ownedBooks } = useSubscription()
  const { pathname } = useLocation()
  const hold = holdFor(user?.id)
  const paid = hold?.payToUnlock && ownedBooks?.has?.(hold.payToUnlock)
  if (hold?.blockApp && !paid && !HOLD_OPEN_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))) return <AccesoPausado />
  return children
}
