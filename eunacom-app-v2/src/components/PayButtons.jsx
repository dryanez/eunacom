import React from 'react'
import { Loader2 } from 'lucide-react'

// Botones de pago: Mercado Pago (Webpay, CLP) y PayPal en USD. Apple Pay y Google Pay
// también abren PayPal, que los ofrece en su página de pago.
const AppleLogo = () => (
  <svg width="15" height="18" viewBox="0 0 814 1000" aria-hidden="true" fill="currentColor">
    <path d="M788 341c-6 4-108 62-108 190 0 148 130 200 134 202-1 3-21 72-69 142-43 62-88 124-157 124s-87-40-166-40c-78 0-105 41-168 41s-107-57-158-128C37 790 0 657 0 530c0-204 133-312 263-312 70 0 128 46 172 46 42 0 107-49 187-49 30 0 139 3 210 104zM543 153c32-38 55-91 55-144 0-7-1-15-2-21-52 2-114 35-151 78-29 33-56 86-56 140 0 8 1 16 2 19 3 1 9 1 14 1 47 0 106-31 138-73z" />
  </svg>
)

const GoogleG = () => (
  <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.9 6.1C12.5 13.6 17.8 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.7c4.3-4 6.9-9.9 6.9-17.1z" />
    <path fill="#FBBC05" d="M10.6 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6l-7.9-6.1C1 16.6 0 20.2 0 24s1 7.4 2.7 10.7l7.9-6.1z" />
    <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2.1 1.4-4.8 2.3-8.5 2.3-6.2 0-11.5-4.1-13.4-9.9l-7.9 6.1C6.6 42.6 14.6 48 24 48z" />
  </svg>
)

const PayPalWord = () => (
  <span style={{ fontWeight: 800, fontStyle: 'italic', fontSize: '0.95rem', letterSpacing: '-0.01em' }}>
    <span style={{ color: '#003087' }}>Pay</span><span style={{ color: '#009cde' }}>Pal</span>
  </span>
)

const alt = {
  flex: 1, minWidth: 0, height: 42, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center',
  justifyContent: 'center', gap: 5, fontSize: '0.88rem', fontWeight: 700, fontFamily: 'inherit', padding: '0 0.4rem',
}

export default function PayButtons({ onMercadoPago, onPaypal, loading, showMercadoPago = true, usdLabel }) {
  return (
    <div>
      {showMercadoPago && (
        <button
          onClick={onMercadoPago}
          disabled={loading}
          style={{ width: '100%', height: 46, background: '#009ee3', color: 'white', border: 'none', borderRadius: 8, fontSize: '0.95rem', fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading ? 0.8 : 1, fontFamily: 'inherit' }}
        >
          {loading ? <><Loader2 size={16} className="spin" /> Procesando...</> : <span style={{ lineHeight: 1.1 }}>Mercado Pago<span style={{ display: 'block', fontWeight: 600, opacity: 0.85, fontSize: '0.68rem' }}>Webpay · débito · crédito</span></span>}
        </button>
      )}
      <div style={{ display: 'flex', gap: 6, marginTop: showMercadoPago ? 6 : 0 }}>
        <button onClick={onPaypal} disabled={loading} aria-label="Pagar con Apple Pay" style={{ ...alt, background: '#000', color: '#fff', border: '1px solid #000' }}>
          <AppleLogo /> Pay
        </button>
        <button onClick={onPaypal} disabled={loading} aria-label="Pagar con Google Pay" style={{ ...alt, background: '#fff', color: '#3c4043', border: '1px solid #dadce0' }}>
          <GoogleG /> Pay
        </button>
        <button onClick={onPaypal} disabled={loading} aria-label="Pagar con PayPal" style={{ ...alt, background: '#ffc439', border: '1px solid #ffc439' }}>
          <PayPalWord />
        </button>
      </div>
      <div style={{ fontSize: '0.68rem', color: 'var(--surface-400)', textAlign: 'center', marginTop: 5 }}>
        Apple Pay, Google Pay y PayPal se pagan en dólares en la página segura de PayPal{usdLabel ? ` (${usdLabel})` : ''}.
      </div>
    </div>
  )
}
