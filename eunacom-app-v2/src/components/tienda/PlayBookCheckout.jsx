import React, { useEffect, useState } from 'react'
import { X, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useSubscription } from '../../contexts/SubscriptionContext'
import { PRODUCTS } from '../../config/tienda'
import { buyBookWithPlay, getPlayBookPrices } from '../../lib/playBilling'

// Android app: Google Play charges one product at a time, so each book/pack in the cart gets
// its own "Comprar" button (Google Pay, card or Play balance in Google's sheet).
export default function PlayBookCheckout({ skus, onClose, onPaid }) {
  const { user } = useAuth()
  const { refreshBooks } = useSubscription()
  const [prices, setPrices] = useState({})
  const [bought, setBought] = useState(() => new Set())
  const [busy, setBusy] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => { getPlayBookPrices(skus).then(setPrices).catch(() => {}) }, [skus.join()])

  const buy = async sku => {
    setBusy(sku); setError('')
    try {
      await buyBookWithPlay(sku, user.id)
      const next = new Set(bought).add(sku)
      setBought(next)
      refreshBooks()
      if (skus.every(s => next.has(s))) onPaid?.()
    } catch (e) {
      if (!/cancel/i.test(String(e?.message || e))) setError(e?.message || 'No se pudo completar el pago')
    }
    setBusy(null)
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(11,17,32,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.75rem' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--surface-700)', borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: 460, border: '1px solid rgba(255,255,255,0.08)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--surface-50)', margin: 0 }}>Comprar libros</h2>
            <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600, marginTop: 2 }}>Pago único con Google Play · tuyos para siempre</div>
          </div>
          <button onClick={onClose} aria-label="Cerrar" style={{ background: 'none', border: 'none', color: 'var(--surface-400)', cursor: 'pointer' }}><X size={18} /></button>
        </div>

        <div style={{ padding: '1rem 1.25rem' }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            {skus.map(s => (
              <li key={s} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', fontSize: '0.88rem', color: 'var(--surface-100)' }}>
                <span>{PRODUCTS[s].name}</span>
                {bought.has(s) ? (
                  <span style={{ color: '#34d399', fontWeight: 700, whiteSpace: 'nowrap' }}><CheckCircle2 size={14} style={{ verticalAlign: 'text-bottom' }} /> Tuyo</span>
                ) : (
                  <button
                    onClick={() => buy(s)}
                    disabled={!!busy}
                    style={{ whiteSpace: 'nowrap', padding: '0.5rem 0.8rem', borderRadius: 10, border: 'none', background: '#fff', color: '#111', fontWeight: 700, cursor: 'pointer', opacity: busy && busy !== s ? 0.5 : 1 }}
                  >
                    {busy === s ? 'Abriendo…' : `Comprar${prices[s] ? ` · ${prices[s]}` : ''}`}
                  </button>
                )}
              </li>
            ))}
          </ul>
          <p style={{ color: 'var(--surface-300)', fontSize: '0.75rem', margin: '0.9rem 0 0', textAlign: 'center' }}>
            Paga con Google Pay, tarjeta o saldo de Google Play. Quedan en tu Biblioteca al tiro.
          </p>
          {error && <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.5rem', textAlign: 'center' }}>{error}</div>}
        </div>
      </div>
    </div>
  )
}
