import React, { useState } from 'react'
import { X, Loader2, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { createBookCheckout } from '../../lib/api'
import { PRODUCTS, TRANSFER, cartTotal, fmtClp } from '../../config/tienda'

// Pago del carro de libros: Webpay (Mercado Pago, se desbloquea solo), PayPal (link fijo por
// producto, ver api/_tienda.js) o transferencia (el admin lo registra en Admin → Libros).
export default function BookCheckoutModal({ skus, onClose, onPaid }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const total = cartTotal(skus)
  const paypalLink = skus.length === 1 ? PRODUCTS[skus[0]]?.paypal : null

  const payWebpay = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await createBookCheckout(user.id, skus)
      if (!res.init_point) throw new Error('sin init_point')
      if (res.init_point.startsWith('/')) { onPaid?.(); return } // dev: pago simulado
      window.location.href = res.init_point
    } catch (err) {
      console.error(err)
      setError('No pudimos abrir el pago. Inténtalo de nuevo o usa transferencia.')
      setLoading(false)
    }
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(11,17,32,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.75rem' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--surface-700)', borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: 460, border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--surface-50)', margin: 0 }}>Comprar libros</h2>
            <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600, marginTop: 2 }}>PDF · pago único · son tuyos para siempre</div>
          </div>
          <button onClick={onClose} aria-label="Cerrar" style={{ background: 'none', border: 'none', color: 'var(--surface-400)', cursor: 'pointer' }}><X size={18} /></button>
        </div>

        <div style={{ padding: '1rem 1.25rem' }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {skus.map(s => (
              <li key={s} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--surface-200)' }}>
                <span>{PRODUCTS[s].name}</span><strong style={{ color: 'var(--surface-50)' }}>{fmtClp(PRODUCTS[s].price)}</strong>
              </li>
            ))}
          </ul>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.6rem', marginBottom: '1rem' }}>
            <span style={{ fontWeight: 700, color: 'var(--surface-300)' }}>Total</span>
            <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--surface-50)' }}>{fmtClp(total)}</span>
          </div>

          <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', padding: '0.55rem 0.75rem', borderRadius: 8, marginBottom: '0.75rem', fontSize: '0.76rem', color: '#34d399', textAlign: 'center' }}>
            <CheckCircle2 size={14} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: 4 }} />
            Con Webpay quedan <strong>desbloqueados al tiro</strong> en tu Biblioteca.
          </div>

          <button onClick={payWebpay} disabled={loading} style={{ width: '100%', padding: '0.75rem', background: '#009ee3', color: 'white', border: 'none', borderRadius: 8, fontSize: '0.95rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: loading ? 0.8 : 1 }}>
            {loading ? <><Loader2 size={16} className="spin" /> Procesando...</> : 'Pagar Seguro con Webpay'}
          </button>

          {paypalLink ? (
            <a href={paypalLink} style={{ display: 'flex', justifyContent: 'center', marginTop: '0.4rem', width: '100%', padding: '0.75rem', background: '#003087', color: 'white', borderRadius: 8, fontSize: '0.95rem', fontWeight: 700, textDecoration: 'none', boxSizing: 'border-box' }}>
              Pagar Internacional con PayPal
            </a>
          ) : (
            <div style={{ marginTop: '0.4rem', fontSize: '0.74rem', color: 'var(--surface-400)', textAlign: 'center' }}>
              ¿Pagas desde fuera de Chile con PayPal? Escríbenos por WhatsApp al {TRANSFER.whatsapp} y te mandamos el link.
            </div>
          )}
          {error && <div style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '0.4rem' }}>{error}</div>}

          <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '0.9rem 0' }} />
          <h4 style={{ margin: '0 0 0.35rem', color: 'var(--surface-200)', fontSize: '0.85rem' }}>Transferencia Directa</h4>
          <div style={{ background: 'var(--surface-600)', padding: '0.65rem 0.75rem', borderRadius: 8, border: '1px dashed rgba(255,255,255,0.2)' }}>
            <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.78rem', color: 'var(--surface-100)', lineHeight: 1.45 }}>
              <li><strong>Banco:</strong> {TRANSFER.bank}</li>
              <li><strong>{TRANSFER.account}:</strong> {TRANSFER.number}</li>
              <li><strong>Nombre:</strong> {TRANSFER.name}</li>
              <li><strong>Monto:</strong> {fmtClp(total)}</li>
            </ul>
            <p style={{ margin: '0.4rem 0 0', fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>
              Envía el comprobante y el correo de tu cuenta por WhatsApp al {TRANSFER.whatsapp}. Te los desbloqueamos ese mismo día.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
