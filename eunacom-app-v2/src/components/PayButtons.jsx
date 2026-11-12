import React, { useState } from 'react'
import { Loader2, Landmark, ChevronDown, Copy, Check, MessageCircle, Lock } from 'lucide-react'
import PayLogo from './PayLogo'
import { TRANSFER } from '../config/tienda'
import '../styles/payButtons.css'

// Pago en un toque, igual que el checkout de Academia Examen EUNACOM: un botón por medio, con los colores de cada marca.
//   Mercado Pago (CLP): tarjeta, Webpay o cuotas.
//   Apple Pay, Google Pay y PayPal: abren la página segura de PayPal (en USD).
//   Transferencia: se despliegan los datos para copiar y el botón para mandar el comprobante por WhatsApp.
const AppleLogo = () => (
  <svg width="16" height="19" viewBox="0 0 814 1000" aria-hidden="true" fill="currentColor">
    <path d="M788 341c-6 4-108 62-108 190 0 148 130 200 134 202-1 3-21 72-69 142-43 62-88 124-157 124s-87-40-166-40c-78 0-105 41-168 41s-107-57-158-128C37 790 0 657 0 530c0-204 133-312 263-312 70 0 128 46 172 46 42 0 107-49 187-49 30 0 139 3 210 104zM543 153c32-38 55-91 55-144 0-7-1-15-2-21-52 2-114 35-151 78-29 33-56 86-56 140 0 8 1 16 2 19 3 1 9 1 14 1 47 0 106-31 138-73z" />
  </svg>
)
const GoogleG = () => (
  <svg width="17" height="17" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.9 6.1C12.5 13.6 17.8 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.7c4.3-4 6.9-9.9 6.9-17.1z" />
    <path fill="#FBBC05" d="M10.6 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6l-7.9-6.1C1 16.6 0 20.2 0 24s1 7.4 2.7 10.7l7.9-6.1z" />
    <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2.1 1.4-4.8 2.3-8.5 2.3-6.2 0-11.5-4.1-13.4-9.9l-7.9 6.1C6.6 42.6 14.6 48 24 48z" />
  </svg>
)

const waNumber = TRANSFER.whatsapp.replace(/\D/g, '')

export default function PayButtons({ onMercadoPago, onPaypal, loading, showMercadoPago = true, usdLabel, transferAmount, transferWhat }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState('')
  const copy = (k, v) => { navigator.clipboard?.writeText(v); setCopied(k); setTimeout(() => setCopied(''), 1500) }
  const rows = [['Banco', TRANSFER.bank], ['Tipo de cuenta', TRANSFER.account], ['N° de cuenta', TRANSFER.number, true], ['Titular', TRANSFER.name]]
  const waText = `Hola, transferí ${transferAmount || ''}${transferWhat ? ` por *${transferWhat}*` : ''}. Adjunto el comprobante y el correo de mi cuenta:`

  return (
    <div className="pb">
      {showMercadoPago && (
        <>
          <button className="pb-brand pb-mp" onClick={onMercadoPago} disabled={loading}>
            {loading ? <Loader2 size={22} className="spin" /> : <PayLogo name="mercadopago" size={30} color="#fff" />}
            <span className="pb-txt"><b>{loading ? 'Abriendo el pago…' : 'Pagar con Mercado Pago'}</b><small>Tarjeta de crédito o débito, Webpay o cuotas</small></span>
          </button>
          <div className="pb-cards" aria-label="Tarjetas aceptadas">
            <span className="pb-card"><PayLogo name="visa" size={30} color="#1a1f71" title="Visa" /></span>
            <span className="pb-card"><PayLogo name="mastercard" size={22} color="#eb001b" title="Mastercard" /></span>
            <span className="pb-card"><PayLogo name="americanexpress" size={22} color="#2e77bc" title="American Express" /></span>
            <span className="pb-card pb-card--t">Webpay</span>
            <span className="pb-card pb-card--t">Cuotas</span>
          </div>
        </>
      )}

      <div className="pb-wallets">
        <button className="pb-brand pb-apple" onClick={onPaypal} disabled={loading} aria-label="Pagar con Apple Pay"><AppleLogo /> <b>Pay</b></button>
        <button className="pb-brand pb-google" onClick={onPaypal} disabled={loading} aria-label="Pagar con Google Pay"><GoogleG /> <b>Pay</b></button>
      </div>
      <button className="pb-brand pb-pp" onClick={onPaypal} disabled={loading}>
        <span>Pagar con</span> <PayLogo name="paypal" size={19} color="#003087" /><i><span>Pay</span><span>Pal</span></i>
      </button>
      <p className="pb-usd">Apple Pay, Google Pay y PayPal se cobran en dólares en la página segura de PayPal{usdLabel ? ` (${usdLabel})` : ''}. Sirven desde cualquier país.</p>

      {transferAmount && (
        <>
          <button className={`pb-brand pb-tr ${open ? 'on' : ''}`} onClick={() => setOpen(v => !v)} aria-expanded={open}>
            <Landmark size={20} /><b>Transferencia bancaria</b><ChevronDown size={18} className="pb-chev" />
          </button>
          {open && (
            <div className="pb-transfer">
              <div className="pb-amount">Transfiere <b>{transferAmount}</b> a:</div>
              <dl>
                {rows.map(([k, v, canCopy]) => (
                  <div key={k}><dt>{k}</dt><dd>{v}{canCopy && (
                    <button type="button" onClick={() => copy(k, v.replace(/\./g, ''))} aria-label={`Copiar ${k}`}>{copied === k ? <Check size={14} /> : <Copy size={14} />}</button>
                  )}</dd></div>
                ))}
              </dl>
              <a className="pb-wa" href={`https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}`} target="_blank" rel="noopener noreferrer">
                <MessageCircle size={18} /> Enviar comprobante por WhatsApp
              </a>
              <p className="pb-hint">Te activamos el acceso ese mismo día.</p>
            </div>
          )}
        </>
      )}

      <div className="pb-safe"><Lock size={13} /> {open ? 'Tu acceso se activa al confirmar la transferencia.' : 'Pago seguro. Tu acceso se activa apenas se aprueba el pago.'}</div>
    </div>
  )
}
