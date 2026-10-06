import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useSubscription } from '../contexts/SubscriptionContext'
import { promoPrice } from '../config/promo'

const HIDDEN_ON = ['/admin', '/test-runner', '/simulation', '/studio', '/deck', '/script-progress']
const PRICES = [
  { name: '1 Mes', price: '$14.990' },
  { name: '3 Meses', price: '$34.990' },
  { name: '6 Meses', price: '$54.990', popular: true },
  { name: '1 Año', price: '$89.990' },
]

// Shown once per browser session to non-premium visitors while the promo is active.
export default function CyberWeekPopup() {
  const { user, openAuthModal } = useAuth()
  const { isPremium, loadingPremium, setShowPaymentModal, showPaymentModal, promo } = useSubscription()
  const { pathname, search } = useLocation()
  const [open, setOpen] = useState(false)

  // One key per promo window, so the next cyber week shows the pop-up again
  const seenKey = promo ? `eunacom_promo_seen_${promo.name}_${promo.end ? new Date(promo.end).toISOString().slice(0, 10) : 'on'}` : null

  useEffect(() => {
    if (!promo || loadingPremium || isPremium || showPaymentModal) return
    if (new URLSearchParams(search).get('export') === 'true') return
    if (HIDDEN_ON.some(p => pathname.startsWith(p))) return
    try {
      // Already heading to checkout (came from the email link) → no pop-up on top of login/checkout
      if (sessionStorage.getItem(seenKey) || sessionStorage.getItem('eunacom_open_checkout')) return
    } catch {}
    const t = setTimeout(() => setOpen(true), 1500)
    return () => clearTimeout(t)
  }, [promo, seenKey, pathname, search, isPremium, loadingPremium, showPaymentModal])

  if (!open || !promo) return null

  const close = () => {
    try { sessionStorage.setItem(seenKey, '1') } catch {}
    setOpen(false)
  }
  const claim = () => {
    close()
    if (user) setShowPaymentModal(true)
    else openAuthModal('register')
  }

  return (
    <div onClick={close} style={{
      position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(11,17,32,0.75)',
      backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div onClick={e => e.stopPropagation()} role="dialog" aria-label={`${promo.name} ${promo.percent}% de descuento`} style={{
        width: '100%', maxWidth: 420, background: '#ffffff', borderRadius: 20, overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', fontFamily: 'var(--font, Arial, sans-serif)', position: 'relative',
      }}>
        <button onClick={close} aria-label="Cerrar" style={{
          position: 'absolute', top: 10, right: 10, background: 'rgba(255,255,255,0.15)', border: 'none',
          borderRadius: 999, padding: 6, cursor: 'pointer', color: '#ffffff', display: 'flex',
        }}><X size={18} /></button>

        <div style={{ background: '#0f2a5c', padding: '28px 20px 24px', textAlign: 'center' }}>
          <img src="/logo.png" alt="EUNACOM App" width="54" height="41" style={{ display: 'block', margin: '0 auto 10px', background: '#ffffff', borderRadius: 10, padding: 4 }} />
          <div style={{ display: 'inline-block', background: '#22d3ee', color: '#0f2a5c', fontSize: 12, fontWeight: 800, letterSpacing: 1.5, padding: '5px 12px', borderRadius: 999 }}>
            {promo.name.toUpperCase()}
          </div>
          <div style={{ fontSize: 48, lineHeight: 1, fontWeight: 800, color: '#ffffff', marginTop: 12 }}>{promo.percent}% DCTO</div>
          <div style={{ fontSize: 15, color: '#c7d6f5', marginTop: 8 }}>en todos los planes</div>
          {promo.endLabel && <div style={{ fontSize: 13, color: '#ffffff', marginTop: 10 }}>⏳ Hasta el <strong>{promo.endLabel}</strong></div>}
        </div>

        <div style={{ padding: '18px 20px 20px' }}>
          {PRICES.map(p => (
            <div key={p.name} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', marginBottom: 6,
              borderRadius: 10, background: p.popular ? '#e6efff' : '#f5f8fe', border: p.popular ? '2px solid #2563eb' : '2px solid transparent',
            }}>
              <span style={{ fontWeight: 700, color: '#1f2937', fontSize: 14 }}>{p.name}</span>
              <span>
                <span style={{ color: '#8a94a6', textDecoration: 'line-through', fontSize: 13, marginRight: 10 }}>{p.price}</span>
                <span style={{ color: '#2563eb', fontWeight: 800, fontSize: 17 }}>{promoPrice(p.price, promo.percent)}</span>
              </span>
            </div>
          ))}
          <div style={{ fontSize: 12.5, color: '#4b5563', lineHeight: 1.5, margin: '10px 2px 14px' }}>
            +10.600 preguntas · 16 reconstrucciones de exámenes reales · 21 libros por especialidad · nueva plataforma de clases la próxima semana.
          </div>
          <button onClick={claim} style={{
            width: '100%', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: 12,
            padding: '14px 0', fontSize: 16, fontWeight: 800, cursor: 'pointer',
          }}>
            Quiero mi {promo.percent}% DCTO →
          </button>
          <button onClick={close} style={{
            width: '100%', background: 'none', border: 'none', color: '#6b7280', fontSize: 13, marginTop: 8, cursor: 'pointer', padding: 6,
          }}>
            Ahora no
          </button>
        </div>
      </div>
    </div>
  )
}
