import React, { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { REGALOS } from '../../api/_regalos.js'
import { APP_PLANS, COUPONS, TOMOS, EXTRAS, fmtClp } from '../config/tienda'
import '../styles/tienda.css'

// Libro gratis de los reels «Comenta PALABRA» (eunacomapp.cl/regalo/<slug>): pública, sin login, para celular.
// Solo para seguidores: el link del DM de ManyChat trae ?t= (y &u=); sin un token válido se muestra el botón
// de seguir y la instrucción de comentar en el reel. Con token: pide correo o WhatsApp (lead en Turso), entrega el PDF con un link firmado de 1 hora y ofrece los planes con SHORTS20.
const API = '/api/user-profiles'
const SHORTS = COUPONS.SHORTS20
const PLAN_6M = APP_PLANS.find(p => p.id === '6m')
const STORE_COVERS = [TOMOS[0].cover, ...['gran-recons', 'repasos', 'atlas'].map(sku => EXTRAS.find(x => x.sku === sku).cover)]
// Tienda del sitio AEE (repo eunacom-examen-site, precios en src/data/tienda.js de ese repo: copiarlos aquí si cambian).
// El sitio abre la especialidad con #tienda/<clave>. VITE_AEE_URL permite probar con el sitio local.
const AEE_URL = import.meta.env.VITE_AEE_URL || 'https://eunacom-examen.cl'
const AEE_KEY = { respiratorio: 'neumologia', otorrinolaringologia: 'otorrino' } // el resto usa la misma clave
const AEE_PACK_PRICE = { cardiologia: 129990 }
const AEE = { especialidad: 99990, biblioteca: 199990, total: 299990, gordo: 14990 }
const IG_USER = 'academiaeunacom'
const IG_URL = `https://www.instagram.com/${IG_USER}/`
const withCoupon = price => Math.round(price * (1 - SHORTS.percent / 100))

function track(event, props) {
  try { window.posthog?.capture?.(event, props) } catch { /* sin analytics */ }
}

export default function Regalo() {
  const { slug } = useParams()
  const [params] = useSearchParams()
  const r = REGALOS[slug]
  const storeKey = `regalo_${slug}`
  const [mode, setMode] = useState('email')
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('+56 9 ')
  const [state, setState] = useState({ status: 'idle' }) // idle | sending | ready | error
  const t = params.get('t'), u = params.get('u')
  const [gate, setGate] = useState(t ? 'checking' : 'no') // checking | ok | no (link del DM válido)
  const utm = { source: params.get('utm_source'), medium: params.get('utm_medium'), campaign: params.get('utm_campaign') }
  const aeeQuery = `?utm_source=${utm.source || 'regalo'}&utm_medium=regalo&utm_campaign=${slug}`
  const aeeKey = r ? (AEE_KEY[r.specialty.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()] || r.specialty.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()) : ''
  const tiendaUrl = `${AEE_URL}/${aeeQuery}#tienda`
  const especialidadUrl = `${AEE_URL}/${aeeQuery}#tienda/${aeeKey}`
  const storePacks = r ? [
    { sku: 'esp', name: `Pack ${r.specialty}`, desc: `Todos los libros y las clases en video de ${r.specialty}, en un solo pack.`, price: AEE_PACK_PRICE[aeeKey] || AEE.especialidad, href: especialidadUrl, star: true },
    { sku: 'biblioteca', name: 'Biblioteca completa', desc: 'Los 21 manuales, Libros Gordos, Repaso Final, Atlas, Perfil V3, Anki y reconstrucciones.', price: AEE.biblioteca, href: tiendaUrl },
    { sku: 'total', name: 'Pack Total EUNACOM', desc: 'Toda la biblioteca más las 468 clases en video y el banco de preguntas.', price: AEE.total, href: tiendaUrl },
  ] : []
  const planesUrl = `/planes?code=SHORTS20&utm_source=${utm.source || 'regalo'}&utm_medium=regalo&utm_campaign=${slug}`

  useEffect(() => {
    if (!r) return
    document.title = `${r.title} gratis | Academia Examen EUNACOM`
    const robots = document.createElement('meta')
    robots.name = 'robots'; robots.content = 'noindex'
    document.head.appendChild(robots)
    track('regalo_view', { slug, ...utm })
    // Ya lo pidió antes (token en el link del correo o en este navegador): link nuevo directo
    if (t) {
      fetch(`${API}?action=regalo_check&slug=${encodeURIComponent(slug)}&t=${encodeURIComponent(t)}${u ? `&u=${encodeURIComponent(u)}` : ''}`)
        .then(x => x.json())
        .then(d => setGate(d.ok ? 'ok' : 'no'))
        .catch(() => setGate('no'))
    }
    const k = params.get('k') || localStorage.getItem(storeKey)
    if (k) {
      fetch(`${API}?action=regalo_link&slug=${encodeURIComponent(slug)}&k=${encodeURIComponent(k)}`)
        .then(x => x.json())
        .then(d => {
          if (d.url) { localStorage.setItem(storeKey, k); setState({ status: 'ready', url: d.url }) }
        })
        .catch(() => {})
    }
    return () => robots.remove()
  }, [slug]) // eslint-disable-line react-hooks/exhaustive-deps

  async function submit(e) {
    e.preventDefault()
    setState({ status: 'sending' })
    try {
      const body = { slug, utm, t, u, ...(mode === 'email' ? { email } : { whatsapp }) }
      const res = await fetch(`${API}?action=regalo_lead`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const d = await res.json()
      if (!res.ok || !d.url) throw new Error(d.error || 'No pudimos preparar tu libro')
      localStorage.setItem(storeKey, d.token)
      track('regalo_lead', { slug, via: mode, ...utm })
      setState({ status: 'ready', url: d.url, emailed: d.emailed })
    } catch (err) {
      setState({ status: 'error', error: err.message })
    }
  }

  if (!r) {
    return (
      <div className="bio-page"><div className="bio">
        <header className="bio-head">
          <img src="/tienda/aee-logo.svg" alt="Academia Examen EUNACOM" className="bio-logo" width="150" height="75" />
          <h1>Este libro ya no está disponible</h1>
          <p>Revisa el link del mensaje o mira todo lo que tenemos para ti.</p>
        </header>
        <a className="bio-btn primary" href="/links"><span className="bio-btn__text"><strong>Ver más recursos gratis</strong></span><span className="bio-btn__arrow">→</span></a>
      </div></div>
    )
  }

  return (
    <div className="bio-page">
      <div className="bio">
        <header className="bio-head">
          <img src="/tienda/aee-logo.svg" alt="Academia Examen EUNACOM" className="bio-logo" width="120" height="60" />
          <span className="gift-tags">
            <span className="gift-tag">🎁 Regalo de Instagram</span>
            <a className="gift-tag gift-tag--store" href="#tienda" onClick={() => track('regalo_tienda', { slug, cta: 'chip' })}>📚 Tienda de libros</a>
          </span>
          <h1>{r.title}</h1>
          <p>{r.blurb}</p>
        </header>

        <div className="gift-cover">
          <img src={r.cover} alt={`Portada: ${r.title}`} width="480" height="680" />
          <span className="gift-cover__meta">PDF · {r.pages} páginas · gratis</span>
        </div>

        {state.status === 'ready' ? (
          <div className="bio-card gift-done">
            <div className="bio-card__title">¡Listo! Tu libro está aquí 📘</div>
            <a className="bio-btn primary" href={state.url} target="_blank" rel="noopener noreferrer" onClick={() => track('regalo_download', { slug })}>
              <span className="bio-btn__icon" aria-hidden="true">⬇️</span>
              <span className="bio-btn__text"><strong>Descargar el libro</strong><span>El link dura 1 hora</span></span>
              <span className="bio-btn__arrow" aria-hidden="true">→</span>
            </a>
            <p className="gift-note">
              {state.emailed ? 'También te lo mandamos a tu correo para que lo tengas a mano. ' : ''}
              Si el link vence, vuelve a esta página desde el mismo celular y te damos uno nuevo.
            </p>
          </div>
        ) : gate === 'checking' ? (
          <div className="bio-card gift-form"><p className="gift-note">Revisando tu link…</p></div>
        ) : gate === 'no' ? (
          <div className="bio-card gift-steps">
            <div className="bio-card__title">¿Cómo lo recibo?</div>
            <ol>
              <li><b>Síguenos</b> en Instagram:
                <a className="gift-follow__btn" href={IG_URL} target="_blank" rel="noopener noreferrer" onClick={() => track('regalo_follow', { slug })}>Seguir a @{IG_USER}</a>
              </li>
              <li><b>Comenta la palabra</b> del reel (por ejemplo <b>CRISIS</b>, <b>POTASIO</b> o <b>ATLAS</b>).</li>
              <li>Te llega <b>por DM</b> el link para descargarlo gratis.</li>
            </ol>
          </div>
        ) : (
          <form className="bio-card gift-form" onSubmit={submit}>
            <div className="bio-card__title">¿A dónde te lo mandamos?</div>
            <div className="gift-tabs" role="tablist">
              <button type="button" role="tab" aria-selected={mode === 'email'} className={mode === 'email' ? 'on' : ''} onClick={() => setMode('email')}>✉️ Correo</button>
              <button type="button" role="tab" aria-selected={mode === 'whatsapp'} className={mode === 'whatsapp' ? 'on' : ''} onClick={() => setMode('whatsapp')}>💬 WhatsApp</button>
            </div>
            {mode === 'email' ? (
              <input className="gift-input" type="email" inputMode="email" autoComplete="email" required placeholder="tucorreo@gmail.com" value={email} onChange={e => setEmail(e.target.value)} />
            ) : (
              <input className="gift-input" type="tel" inputMode="tel" autoComplete="tel" required placeholder="+56 9 1234 5678" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} />
            )}
            <button className="bio-btn primary gift-submit" type="submit" disabled={state.status === 'sending'}>
              <span className="bio-btn__text"><strong>{state.status === 'sending' ? 'Preparando tu libro…' : 'Quiero mi libro gratis'}</strong></span>
              <span className="bio-btn__arrow" aria-hidden="true">→</span>
            </button>
            {state.status === 'error' && <p className="gift-error">{state.error}</p>}
            <p className="gift-note">Lo descargas al tiro aquí mismo. Te escribiremos de vez en cuando con material para el EUNACOM; puedes darte de baja cuando quieras.</p>
          </form>
        )}

        <section className="gift-store" id="tienda">
          <span className="gift-store__kicker">📚 Tienda de libros AEE</span>
          <h2>Estudia con todos nuestros libros</h2>
          <p>Manuales, clases en video, Libros Gordos, Repaso Final, Atlas y reconstrucciones 2013–2025, en la tienda de Academia Examen EUNACOM.</p>
          <a className="gift-store__covers" href={especialidadUrl} onClick={() => track('regalo_tienda', { slug, cta: 'portadas' })} aria-label="Ver la tienda de libros">
            {STORE_COVERS.map(c => <img key={c} src={c} alt="" width="90" height="127" loading="lazy" />)}
          </a>
          <div className="gift-store__packs">
            {storePacks.map((p, i) => (
              <a key={p.sku} className={`gift-pack gift-pack--${i}`} href={p.href} onClick={() => track('regalo_tienda', { slug, cta: p.sku })}>
                {p.star && <span className="gift-pack__badge">⭐ Tu especialidad</span>}
                <strong>{p.name}</strong>
                <span className="gift-pack__desc">{p.desc}</span>
                <span className="gift-pack__price"><b>{fmtClp(p.price)}</b></span>
              </a>
            ))}
          </div>
          <a className="gift-store__cta" href={especialidadUrl} onClick={() => track('regalo_tienda', { slug, cta: 'boton' })}>
            🛒 Ver la tienda de {r.specialty} →
            <span>También libros sueltos, desde {fmtClp(AEE.gordo)} · Academia Examen EUNACOM</span>
          </a>
        </section>

        <a className="bio-offer" href={planesUrl} onClick={() => track('regalo_planes', { slug })}>
          <span className="bio-offer__pct">{SHORTS.percent}%</span>
          <span>
            <strong>¿Quieres el resto? {SHORTS.percent} % en cualquier plan</strong>
            <span>Clases, +11.000 preguntas reales y simulacros con el código <code>SHORTS20</code> (ya viene aplicado)</span>
          </span>
        </a>
        <a className="bio-btn" href={planesUrl} onClick={() => track('regalo_planes', { slug, cta: '6m' })}>
          <span className="bio-btn__icon" aria-hidden="true">⭐</span>
          <span className="bio-btn__text">
            <strong>Plan 6 meses: <s>{fmtClp(PLAN_6M.price)}</s> {fmtClp(withCoupon(PLAN_6M.price))}</strong>
            <span>Incluye la biblioteca completa: todos los Libros Gordos, Repaso Final, Atlas y los 21 tomos</span>
          </span>
          <span className="bio-btn__arrow" aria-hidden="true">→</span>
        </a>

        <footer className="bio-foot">Academia Examen EUNACOM · eunacomapp.cl</footer>
      </div>
    </div>
  )
}
