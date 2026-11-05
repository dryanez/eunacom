import React, { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { REGALOS } from '../../api/_regalos.js'
import { COUPONS, TOMOS, fmtClp } from '../config/tienda'
import '../styles/tienda.css'

// Libro gratis de los reels «Comenta PALABRA» (eunacomapp.cl/regalo/<slug>): pública, sin login, para celular.
// Solo para seguidores: el link del DM de ManyChat trae ?t= (y &u=); sin un token válido se muestra el botón
// de seguir y la instrucción de comentar en el reel. Con token: pide nombre y correo (lead en Turso), descarga el PDF ahí mismo
// (link firmado de 1 hora) y pasa a una segunda pantalla con los libros de la tienda AEE y SHORTS20 ya aplicado.
const API = '/api/user-profiles'
const SHORTS = COUPONS.SHORTS20
// Tienda del sitio AEE (repo eunacom-examen-site, precios en src/data/tienda.js de ese repo: copiarlos aquí si cambian).
// El sitio abre la especialidad con #tienda/<clave> y un formato ya elegido con #tienda/<clave|todo>/<sku>. VITE_AEE_URL permite probar con el sitio local.
const AEE_URL = import.meta.env.VITE_AEE_URL || 'https://eunacom-examen.cl' // eunacom-examen.vercel.app ya no existe (404)
const AEE_KEY = { respiratorio: 'neumologia', otorrinolaringologia: 'otorrino' } // el resto usa la misma clave
const AEE_PACK_PRICE = { cardiologia: 129990 }
const AEE = { tomo: 29990, especialidad: 99990, biblioteca: 199990, total: 299990 }
const IG_USER = 'academiaeunacom'
const IG_URL = `https://www.instagram.com/${IG_USER}/`
const withCoupon = price => Math.round(price * (1 - SHORTS.percent / 100))

function track(event, props) {
  try { window.posthog?.capture?.(event, props) } catch { /* sin analytics */ }
}

// Abanico de portadas que pasa a la siguiente cada 3,2 s (igual que el hero de eunacom-examen-site, Hero.jsx)
const SLOTS = {
  left: { transform: 'translate(-38%, 6%) rotate(-8deg) scale(.9)', zIndex: 1, opacity: 1, filter: 'brightness(.8)' },
  front: { transform: 'translate(0, 0) rotate(0deg) scale(1)', zIndex: 3, opacity: 1, filter: 'brightness(1)' },
  right: { transform: 'translate(38%, 6%) rotate(8deg) scale(.9)', zIndex: 2, opacity: 1, filter: 'brightness(.8)' },
  outLeft: { transform: 'translate(-70%, 10%) rotate(-16deg) scale(.78)', zIndex: 0, opacity: 0, filter: 'brightness(.6)' },
  inRight: { transform: 'translate(70%, 10%) rotate(16deg) scale(.78)', zIndex: 0, opacity: 0, filter: 'brightness(.6)' },
}
function BookFan({ covers }) {
  const n = covers.length
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setInterval(() => setIdx(i => (i + 1) % n), 3200)
    return () => clearInterval(t)
  }, [n])
  const slotFor = pos => ['left', 'front', 'right', 'inRight'][pos] || (pos === n - 1 ? 'outLeft' : null)
  return (
    <div className="gift-fan">
      {covers.map((src, i) => {
        const slot = slotFor((i - idx + n) % n)
        return slot && <img key={src} src={src} alt="" style={SLOTS[slot]} />
      })}
    </div>
  )
}

// El link firmado viene con Content-Disposition: attachment, así que se baja sin salir de la página
function startDownload(url) {
  const a = document.createElement('a')
  a.href = url; a.rel = 'noopener'
  document.body.appendChild(a); a.click(); a.remove()
}

export default function Regalo() {
  const { slug } = useParams()
  const [params] = useSearchParams()
  const r = REGALOS[slug]
  const storeKey = `regalo_${slug}`
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [state, setState] = useState({ status: 'idle' }) // idle | sending | ready | error
  const t = params.get('t'), u = params.get('u')
  const [gate, setGate] = useState(t ? 'checking' : 'no') // checking | ok | no (link del DM válido)
  const utm = { source: params.get('utm_source'), medium: params.get('utm_medium'), campaign: params.get('utm_campaign') }
  // el sitio AEE guarda ?code= para el checkout: SHORTS20 ya aplicado al llegar desde el regalo
  const aeeQuery = `?code=SHORTS20&utm_source=${utm.source || 'regalo'}&utm_medium=regalo&utm_campaign=${slug}`
  const aeeKey = r ? (AEE_KEY[r.specialty.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()] || r.specialty.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()) : ''
  const aee = path => `${AEE_URL}/${aeeQuery}#tienda/${path}`
  const especialidadUrl = aee(aeeKey)
  const spec2 = r ? r.specialty.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().slice(0, 7) : ''
  const tomoCover = (TOMOS.find(x => x.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(spec2)) || TOMOS[0]).cover
  // portadas flotantes: los libros de la especialidad
  const storeCovers = [tomoCover, `/tienda/gordo_${aeeKey}.jpg`, `/tienda/atlas_${aeeKey}.jpg`, `/tienda/repaso_${aeeKey}.jpg`, `/tienda/perfil_${aeeKey}.jpg`]
  // en este orden: el manual solo, el pack de la especialidad, la biblioteca y el pack total
  const offers = r ? [
    { sku: 'manual', name: `Manual de ${r.specialty}`, desc: `Toda la teoría de ${r.specialty} que pide el EUNACOM, con algoritmos, tablas y fotos clínicas.`, price: AEE.tomo, href: aee(`${aeeKey}/tomo-${aeeKey}`), badge: '⭐ Empieza aquí' },
    { sku: 'esp', name: `Pack ${r.specialty} completo`, desc: 'El manual más las clases en video, 90 preguntas con explicación, Repaso Final, Atlas y Anki.', price: AEE_PACK_PRICE[aeeKey] || AEE.especialidad, href: aee(`${aeeKey}/esp-${aeeKey}`) },
    { sku: 'biblioteca', name: 'Biblioteca completa', desc: 'Los 21 manuales y todos los libros de repaso, imágenes y preguntas: el examen entero.', price: AEE.biblioteca, href: aee('todo/biblioteca') },
    { sku: 'total', name: 'Pack Total EUNACOM', desc: 'Toda la biblioteca más las 468 clases en video y el banco de preguntas online.', price: AEE.total, href: aee('todo/pack-total') },
  ] : []

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
      const body = { slug, utm, t, u, nombre, email }
      const res = await fetch(`${API}?action=regalo_lead`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const d = await res.json()
      if (!res.ok || !d.url) throw new Error(d.error || 'No pudimos preparar tu libro')
      localStorage.setItem(storeKey, d.token)
      track('regalo_lead', { slug, via: 'email', ...utm })
      startDownload(d.url)
      setState({ status: 'ready', url: d.url, emailed: d.emailed, fresh: true })
      window.scrollTo({ top: 0, behavior: 'smooth' })
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

  // Tienda AEE con SHORTS20 ya aplicado (el sitio guarda ?code= para el checkout)
  const store = (
    <section className="gift-store" id="tienda">
      <span className="gift-store__kicker">📚 Libros AEE · {SHORTS.percent} % de descuento ya aplicado</span>
      <h2>Sigue estudiando {r.specialty}</h2>
      <a className="gift-store__covers" href={especialidadUrl} onClick={() => track('regalo_tienda', { slug, cta: 'portadas' })} aria-label={`Ver los libros de ${r.specialty}`}>
        <BookFan covers={storeCovers} />
      </a>
      <div className="gift-store__packs">
        {offers.map((p, i) => (
          <a key={p.sku} className={`gift-pack gift-pack--${i}`} href={p.href} onClick={() => track('regalo_tienda', { slug, cta: p.sku })}>
            {p.badge && <span className="gift-pack__badge">{p.badge}</span>}
            <strong>{p.name}</strong>
            <span className="gift-pack__desc">{p.desc}</span>
            <span className="gift-pack__price"><s>{fmtClp(p.price)}</s> <b>{fmtClp(withCoupon(p.price))}</b></span>
          </a>
        ))}
      </div>
      <a className="gift-store__cta" href={especialidadUrl} onClick={() => track('regalo_tienda', { slug, cta: 'boton' })}>
        Ver la tienda de {r.specialty} →
      </a>
    </section>
  )

  // Segunda pantalla: la descarga ya partió; ahora la tienda
  if (state.status === 'ready') {
    return (
      <div className="bio-page">
        <div className="bio">
          <header className="bio-head">
            <img src="/tienda/aee-logo.svg" alt="Academia Examen EUNACOM" className="bio-logo" width="120" height="60" />
            <div className="gift-cover gift-cover--done gift-float"><img src={r.cover} alt="" width="480" height="680" /><span className="gift-ok" aria-hidden="true">✅</span></div>
            <h1>{state.fresh ? 'Tu guía se está descargando' : 'Tu guía está lista'}</h1>
            <p>{r.title} · PDF · {r.pages} páginas{state.emailed ? ' · también te la mandamos a tu correo' : ''}</p>
          </header>
          <a className="bio-btn gift-redl" href={state.url} rel="noopener" onClick={() => track('regalo_download', { slug, cta: 'pantalla2' })}>
            <span className="bio-btn__icon" aria-hidden="true">⬇️</span>
            <span className="bio-btn__text"><strong>{state.fresh ? '¿No empezó? Descárgala aquí' : 'Descargar la guía'}</strong><span>El link dura 1 hora</span></span>
            <span className="bio-btn__arrow" aria-hidden="true">→</span>
          </a>
          {store}
          <footer className="bio-foot">Academia Examen EUNACOM · eunacomapp.cl</footer>
        </div>
      </div>
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

        <div className="gift-cover gift-float">
          <img src={r.cover} alt={`Portada: ${r.title}`} width="480" height="680" />
          <span className="gift-cover__meta">PDF · {r.pages} páginas · gratis</span>
        </div>

        {gate === 'checking' ? (
          <div className="bio-card gift-form"><p className="gift-note">Revisando tu link…</p></div>
        ) : gate === 'no' ? (
          <div className="bio-card gift-steps">
            <div className="bio-card__title">¿Cómo lo recibo?</div>
            <ol>
              <li><b>Síguenos</b> en Instagram:
                <a className="gift-follow__btn" href={IG_URL} target="_blank" rel="noopener noreferrer" onClick={() => track('regalo_follow', { slug })}>Seguir a @{IG_USER}</a>
              </li>
              <li><b>Comenta la palabra</b> del reel (por ejemplo <b>ECG</b>, <b>CRISIS</b> o <b>ATLAS</b>).</li>
              <li>Te llega <b>por DM</b> el link para descargarlo gratis.</li>
            </ol>
          </div>
        ) : (
          <form className="bio-card gift-form" onSubmit={submit}>
            <div className="bio-card__title">Déjanos tu nombre y correo, y se descarga al tiro</div>
            <input className="gift-input" type="text" autoComplete="name" required minLength={2} placeholder="Tu nombre" value={nombre} onChange={e => setNombre(e.target.value)} />
            <input className="gift-input" type="email" inputMode="email" autoComplete="email" required placeholder="tucorreo@gmail.com" value={email} onChange={e => setEmail(e.target.value)} />
            <button className="bio-btn primary gift-submit" type="submit" disabled={state.status === 'sending'}>
              <span className="bio-btn__text"><strong>{state.status === 'sending' ? 'Preparando tu descarga…' : 'Descargar gratis'}</strong></span>
              <span className="bio-btn__arrow" aria-hidden="true">⬇️</span>
            </button>
            {state.status === 'error' && <p className="gift-error">{state.error}</p>}
            <p className="gift-note">Te escribiremos de vez en cuando con material para el EUNACOM; puedes darte de baja cuando quieras.</p>
          </form>
        )}

        {store}

        <footer className="bio-foot">Academia Examen EUNACOM · eunacomapp.cl</footer>
      </div>
    </div>
  )
}
