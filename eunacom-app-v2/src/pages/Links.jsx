import { isAndroidApp } from '../lib/playBilling'
import React, { useState } from 'react'
import { APP_PLANS, PRODUCTS, TRANSFER, COUPONS, fmtClp } from '../config/tienda'
import '../styles/tienda.css'

// «Link en la bio» de Instagram (eunacomapp.cl/links): pública, sin login, pensada para celular.
// TODO(dueño): completar los placeholders marcados abajo.
const INSTAGRAM_USER = 'academiaeunacom' // usuario de Instagram de AEE (sin @)
const TELEGRAM_URL = null                        // TODO: link de invitación del grupo de Telegram (https://t.me/...)
const WHATSAPP_URL = `https://wa.me/${TRANSFER.whatsapp.replace(/\D/g, '')}`
const IG_DM_URL = `https://ig.me/m/${INSTAGRAM_USER}`

const UTM = 'utm_source=instagram&utm_medium=bio&utm_campaign=links'
const withUtm = url => `${url}${url.includes('?') ? '&' : '?'}${UTM}`

const PLAN_6M = APP_PLANS.find(p => p.id === '6m')
const SHORTS = COUPONS.SHORTS20

// Evento de PostHog por click. PostHog solo se inicia si la persona aceptó cookies
// (public/cookie-consent.js); sin consentimiento los eventos quedan en la cola y no se envían.
function track(link) {
  try { window.posthog?.capture?.('bio_link_click', { link }) } catch { /* sin analytics */ }
}

function LinkBtn({ href, id, icon, title, sub, variant = '', external }) {
  return (
    <a
      className={`bio-btn ${variant}`}
      href={href}
      onClick={() => track(id)}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      <span className="bio-btn__icon" aria-hidden="true">{icon}</span>
      <span className="bio-btn__text">
        <strong>{title}</strong>
        {sub && <span>{sub}</span>}
      </span>
      <span className="bio-btn__arrow" aria-hidden="true">→</span>
    </a>
  )
}

export default function Links() {
  const [intl, setIntl] = useState(false)

  return (
    <div className="bio-page">
    <div className="bio">
      <header className="bio-head">
        <img src="/tienda/aee-logo.svg" alt="Academia Examen EUNACOM" className="bio-logo" width="150" height="75" />
        <h1>Academia Examen EUNACOM</h1>
        <p>Preguntas reales + animaciones para aprobar el EUNACOM</p>
      </header>

      <a className="bio-offer" href={withUtm(`/planes?code=SHORTS20`)} onClick={() => track('oferta_shorts20')}>
        <span className="bio-offer__pct">{SHORTS.percent}%</span>
        <span>
          <strong>{SHORTS.percent} % en cualquier plan</strong>
          <span>con el código <code>SHORTS20</code> · ya viene aplicado</span>
        </span>
      </a>

      <LinkBtn
        id="planes" variant="primary" icon="🎓"
        href={withUtm('/planes?code=SHORTS20')}
        title="Ver planes de la app"
        sub={`⭐ 6 meses ${fmtClp(PLAN_6M.price)}: clases + preguntas + biblioteca de libros`}
      />
      <LinkBtn
        id="tienda" icon="📚"
        href={withUtm('/biblioteca')}
        title="Tienda de libros"
        sub={`Tomos, reconstrucciones, Libros Gordos, Repaso Final · todo ${fmtClp(PRODUCTS.biblioteca.price)}`}
      />

      <div className="bio-card">
        <div className="bio-card__title">🎁 Libro gratis de tu especialidad</div>
        <p>Comenta la palabra del reel (por ejemplo <b>POTASIO</b>, <b>CRISIS</b>, <b>EPLEY</b> o <b>ATLAS</b>) y te mandamos el libro por mensaje directo.</p>
        <a className="bio-mini" href={`https://www.instagram.com/${INSTAGRAM_USER}/`} target="_blank" rel="noopener noreferrer" onClick={() => track('libro_gratis_reels')}>Ver los reels →</a>
      </div>

      {/* Android app: Google Play only allows paying through Play, so no other payment options here */}
      {!isAndroidApp() && <>
      <button className={`bio-btn ${intl ? 'open' : ''}`} onClick={() => { setIntl(v => !v); track('pago_internacional') }} aria-expanded={intl}>
        <span className="bio-btn__icon" aria-hidden="true">🌎</span>
        <span className="bio-btn__text">
          <strong>¿Pagas desde Bolivia, Venezuela u otro país?</strong>
          <span>Transferencia, PayPal o USDT</span>
        </span>
        <span className="bio-btn__arrow" aria-hidden="true">{intl ? '▾' : '▸'}</span>
      </button>
      {intl && (
        <div className="bio-card">
          <p><b>PayPal, Apple Pay o Google Pay:</b> se paga en dólares al elegir el plan en la app.</p>
          <p><b>Transferencia (Chile):</b> {TRANSFER.bank} · {TRANSFER.account} {TRANSFER.number} · {TRANSFER.name}. Envía el comprobante por WhatsApp.</p>
          <p><b>USDT (Binance):</b> escríbenos y te mandamos la dirección.</p>
          <div className="bio-row">
            <a className="bio-mini" href={`${WHATSAPP_URL}?text=${encodeURIComponent('Hola, quiero pagar un plan desde fuera de Chile')}`} target="_blank" rel="noopener noreferrer" onClick={() => track('whatsapp_pago')}>WhatsApp →</a>
            <a className="bio-mini" href={IG_DM_URL} target="_blank" rel="noopener noreferrer" onClick={() => track('ig_dm_pago')}>Instagram DM →</a>
          </div>
        </div>
      )}
      </>}

      {TELEGRAM_URL ? (
        <LinkBtn id="telegram" icon="✈️" href={TELEGRAM_URL} external title="Grupo de Telegram gratis" sub="Preguntas diarias y avisos del EUNACOM" />
      ) : (
        <div className="bio-btn disabled" aria-disabled="true">
          <span className="bio-btn__icon" aria-hidden="true">✈️</span>
          <span className="bio-btn__text"><strong>Grupo de Telegram gratis</strong><span>Muy pronto</span></span>
        </div>
      )}

      <footer className="bio-foot">eunacomapp.cl</footer>
    </div>
    </div>
  )
}
