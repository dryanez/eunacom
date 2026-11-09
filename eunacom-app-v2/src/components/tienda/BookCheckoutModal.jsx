import React, { useState } from 'react'
import { X, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { createBookCheckout, createBookPaypalOrder } from '../../lib/api'
import { PRODUCTS, TRANSFER, cartTotal, fmtClp, usdPrice } from '../../config/tienda'
import PayButtons from '../PayButtons'
import PlayBookCheckout from './PlayBookCheckout'
import { isAndroidApp } from '../../lib/playBilling'

// Pago del carro de libros: Mercado Pago (CLP) o PayPal en USD (con Apple Pay / Google Pay);
// ambos desbloquean solos. Transferencia: el admin lo registra en Admin → Libros.
export default function BookCheckoutModal(props) {
  if (isAndroidApp()) return <PlayBookCheckout {...props} />
  return <WebBookCheckout {...props} />
}

function WebBookCheckout({ skus, onClose, onPaid }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const total = cartTotal(skus)
  const usd = skus.reduce((a, s) => a + usdPrice(PRODUCTS[s].price), 0)

  const go = async (create, key) => {
    setLoading(true)
    setError(null)
    try {
      const res = await create(user.id, skus)
      const url = res[key]
      if (!url) throw new Error('sin url de pago')
      if (url.startsWith('/')) { onPaid?.(); return } // dev: pago simulado
      window.location.href = url
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
            <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600, marginTop: 2 }}>Lectura en línea · pago único · acceso para siempre</div>
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
            Al pagar quedan <strong>desbloqueados al tiro</strong> para leer en tu Biblioteca.
          </div>

          <PayButtons
            loading={loading}
            onMercadoPago={() => go(createBookCheckout, 'init_point')}
            onPaypal={() => go(createBookPaypalOrder, 'approve_url')}
            usdLabel={`US$${usd.toFixed(2)}`}
          />
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
