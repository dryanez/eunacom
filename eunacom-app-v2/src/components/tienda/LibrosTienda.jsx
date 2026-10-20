import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useSubscription } from '../../contexts/SubscriptionContext'
import {
  PACKS, TOMOS, RECONS, EXTRAS, MODULES, PRODUCTS, APP_PLANS, UPGRADE_CREDIT_DAYS, TRANSFER,
  expandSkus, looseValue, cartTotal, fmtClp, itemFiles,
} from '../../config/tienda'
import { captureBookPaypal } from '../../lib/api'
import BookCheckoutModal from './BookCheckoutModal'
import LectorLibro from './LectorLibro'
import '../../styles/tienda.css'

const CART_KEY = 'eunacom_book_cart'
const PLAN_6M = APP_PLANS.find(p => p.id === '6m')
const BIBLIOTECA = PRODUCTS.biblioteca

function Cover({ src, alt, style }) {
  return <img className="book-cover" src={src} alt={alt} loading="lazy" style={style} />
}

// Tienda de libros: oferta primero, la app como upgrade (en el checkout de planes es al revés).
export default function LibrosTienda() {
  const { user, openAuthModal } = useAuth()
  const { isPremium, planMonths, libraryIncluded, ownedBooks, purchasedBookSkus, setShowPaymentModal, refreshBooks } = useSubscription()

  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]').filter(s => PRODUCTS[s]) } catch { return [] }
  })
  const [module, setModule] = useState('all')
  const [checkout, setCheckout] = useState(false)
  const [paidBanner, setPaidBanner] = useState(() => new URLSearchParams(window.location.search).get('books'))
  const [reading, setReading] = useState(null) // { item, title }

  useEffect(() => { try { localStorage.setItem(CART_KEY, JSON.stringify(cart)) } catch {} }, [cart])

  // Vuelta desde PayPal (?paypal_books=return&token=ORDER): capturar y desbloquear
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    if (params.get('paypal_books') !== 'return' || !token || !user?.id) return
    window.history.replaceState(null, '', window.location.pathname)
    captureBookPaypal(user.id, token)
      .then(() => { refreshBooks(); setPaidBanner('success') })
      .catch(err => { console.error('PayPal books capture failed:', err); setPaidBanner('failure') })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  // Vuelta desde Webpay: el webhook puede tardar unos segundos en registrar la compra
  useEffect(() => {
    if (paidBanner !== 'success') return
    setCart([])
    const t1 = setTimeout(refreshBooks, 2500)
    const t2 = setTimeout(refreshBooks, 7000)
    window.history.replaceState(null, '', window.location.pathname)
    return () => { clearTimeout(t1); clearTimeout(t2) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paidBanner])

  const inCartItems = useMemo(() => expandSkus(cart), [cart])
  const isOwned = sku => (PRODUCTS[sku]?.includes || [sku]).every(i => ownedBooks.has(i))
  const coveredByCart = sku => !cart.includes(sku) && (PRODUCTS[sku]?.includes || [sku]).every(i => inCartItems.has(i))

  const toggle = sku => {
    if (isOwned(sku)) return
    setCart(prev => {
      if (prev.includes(sku)) return prev.filter(s => s !== sku)
      // un pack reemplaza lo que ya contiene
      const inc = new Set(PRODUCTS[sku].includes)
      return [...prev.filter(s => !PRODUCTS[s].includes.every(i => inc.has(i))), sku]
    })
  }

  const swapToPack = packSku => {
    const inc = new Set(PRODUCTS[packSku].includes)
    setCart(prev => [...prev.filter(s => !PRODUCTS[s].includes.every(i => inc.has(i))), packSku])
  }

  const openPlans = () => {
    if (user) return setShowPaymentModal(true)
    try { sessionStorage.setItem('eunacom_open_checkout', '1') } catch {}
    openAuthModal('register', 'Crea tu cuenta gratis para ver los planes')
  }

  const pay = () => {
    if (!user) return openAuthModal('login', 'Inicia sesión para comprar: los libros quedan guardados en tu cuenta')
    setCheckout(true)
  }

  const total = cartTotal(cart)
  const nT = cart.filter(s => s.startsWith('tomo-')).length
  const nR = cart.filter(s => s.startsWith('rec-')).length
  let hint = null
  if (total >= BIBLIOTECA.price) {
    hint = <>Por {fmtClp(Math.max(0, PLAN_6M.price - total))} más tienes la app 6 meses con toda la biblioteca, las clases y las preguntas. <button onClick={openPlans}>Ver plan →</button></>
  } else if (nT >= 5) {
    hint = <>Llevas {nT} tomos ({fmtClp(nT * TOMOS[0].price)}). El pack de los 21 cuesta {fmtClp(PRODUCTS['pack-tomos'].price)}. <button onClick={() => swapToPack('pack-tomos')}>Cambiar al pack →</button></>
  } else if (nR >= 4) {
    hint = <>Llevas {nR} reconstrucciones. Las 16 en el Gran Libro cuestan {fmtClp(PRODUCTS['pack-recons'].price)}. <button onClick={() => swapToPack('pack-recons')}>Cambiar al pack →</button></>
  }

  const btnState = sku => isOwned(sku) ? 'owned' : (cart.includes(sku) || coveredByCart(sku)) ? 'added' : ''
  const btnLabel = (sku, idle) => isOwned(sku) ? '✓ Tuyo' : cart.includes(sku) ? '✓ En el carro' : coveredByCart(sku) ? '✓ En tu pack' : idle

  // Mis libros: biblioteca completa por plan, o lo comprado
  const shelf = [
    ...TOMOS.filter(t => ownedBooks.has(t.sku)).map(t => ({ key: t.sku, cover: t.cover, label: `Tomo ${t.n} · ${t.name}` })),
    ...EXTRAS.filter(x => ownedBooks.has(x.sku)).map(x => ({ key: x.sku, cover: x.cover, label: x.name })),
    ...(ownedBooks.has('gran-recons') ? [] : RECONS.filter(r => ownedBooks.has(r.sku)).map(r => ({ key: r.sku, rec: r, label: r.name }))),
  ]
  const shortPlan = isPremium && !libraryIncluded && planMonths > 0

  return (
    <div className="tienda">
      {paidBanner === 'success' && (
        <div className="tienda-banner ok">
          <span>✅ ¡Pago recibido! Tus libros quedan desbloqueados en «Mis libros» (puede tardar unos segundos).</span>
          <button className="mini-btn" onClick={() => setPaidBanner(null)}>OK</button>
        </div>
      )}
      {(paidBanner === 'failure' || paidBanner === 'pending') && (
        <div className="tienda-banner info">
          <span>{paidBanner === 'pending' ? '⏳ Tu pago está pendiente. Apenas se confirme, los libros se desbloquean solos.' : 'El pago no se completó. Puedes intentarlo de nuevo o pagar por transferencia.'}</span>
          <button className="mini-btn" onClick={() => setPaidBanner(null)}>OK</button>
        </div>
      )}

      {shelf.length > 0 && (
        <section className="tienda-section">
          <h2>📚 Mis libros</h2>
          <p className="sub">
            {libraryIncluded ? 'Tu plan incluye la biblioteca completa.' : `Tienes ${purchasedBookSkus.length} compra${purchasedBookSkus.length === 1 ? '' : 's'} de libros en tu cuenta.`}
          </p>
          <div className="shelf">
            {shelf.map(b => (
              <div key={b.key} className="shelf-item">
                {b.rec
                  ? <div className="rec-cover"><small>EUNACOM {b.rec.month}</small><strong>{b.rec.year}</strong></div>
                  : <Cover src={b.cover} alt={b.label} />}
                <b>{b.label}</b>
                {itemFiles(b.key).length
                  ? <button className="mini-btn" onClick={() => setReading({ item: b.key, title: b.label })}>📖 Leer</button>
                  : <span className="mini-btn owned" title={`Escríbenos por WhatsApp al ${TRANSFER.whatsapp}`}>Próximamente</span>}
              </div>
            ))}
          </div>
          <p className="sub" style={{ marginTop: '0.75rem' }}>Los libros se leen en línea dentro de la app, con tu cuenta.</p>
        </section>
      )}

      {libraryIncluded ? null : (
        <>
          {shortPlan && (
            <div className="tienda-banner info">
              <span>Tu plan de {planMonths} {planMonths === 1 ? 'mes' : 'meses'} no incluye la biblioteca. Agrégala por <strong>{fmtClp(BIBLIOTECA.price)}</strong> o pásate al plan de 6 meses, que la trae incluida.</span>
              <button className="mini-btn" onClick={() => toggle('biblioteca')}>{cart.includes('biblioteca') ? '✓ En el carro' : 'Agregar biblioteca'}</button>
            </div>
          )}

          <div className="tienda-hero">
            <div>
              <span className="tienda-kick">Biblioteca AEE · Perfil EUNACOM V3</span>
              <h1>Los libros para aprobar el EUNACOM, <span>en la app</span></h1>
              <p>Los 21 tomos de Academia Examen EUNACOM y las reconstrucciones de cada EUNACOM desde 2013. Pago único: los lees en línea, en el computador o el celular, sin vencimiento.</p>
              <div className="tienda-stats">
                <div><b>21</b><span>tomos, todas las especialidades</span></div>
                <div><b>16</b><span>EUNACOM reconstruidos</span></div>
                <div><b>2.739</b><span>preguntas reales con explicación</span></div>
                <div><b>23</b><span>Libros Gordos de 90 preguntas</span></div>
              </div>
            </div>
            <div className="tienda-fan" aria-hidden="true">
              {[1, 5, 8, 18, 'recons', 19, 11].map((k, i) => (
                <Cover key={k} alt="" src={k === 'recons' ? EXTRAS[0].cover : TOMOS[k - 1].cover}
                  style={{ position: 'absolute', width: 110, left: `${i * 13}%`, top: 30 + Math.abs(i - 3) * 16, transform: `rotate(${(i - 3) * 5}deg)`, zIndex: 10 - Math.abs(i - 3) }} />
              ))}
            </div>
          </div>

          <section className="tienda-section" id="packs">
            <h2>Elige tu pack</h2>
            <p className="sub">Comprar por pack sale mucho más barato que libro por libro.</p>
            <div className="tienda-packs">
              {PACKS.map(p => {
                const was = looseValue(p.sku)
                const save = Math.round((1 - p.price / was) * 100)
                return (
                  <div key={p.sku} className={`pack-card ${p.star ? 'star' : ''}`}>
                    {p.star && <span className="pack-ribbon">⭐ Más conveniente · Ahorra {save} %</span>}
                    <div className="pack-covers">{p.covers.map((c, i) => <Cover key={i} src={c} alt="" />)}</div>
                    <h3>{p.name}</h3>
                    <p className="desc">{p.desc}</p>
                    <div className="pack-price">{fmtClp(p.price)}<span className="was">{fmtClp(was)}</span></div>
                    <ul className="pack-feat">{p.features.map(f => <li key={f}><i>✓</i>{f}</li>)}</ul>
                    <button className={`t-btn ${btnState(p.sku)}`} onClick={() => toggle(p.sku)}>{btnLabel(p.sku, 'Agregar al carro')}</button>
                  </div>
                )
              })}
            </div>
          </section>

          <section className="tienda-section" id="tomos">
            <h2>Tomos sueltos</h2>
            <p className="sub">¿Te falta una especialidad? Cada tomo a {fmtClp(TOMOS[0].price)}. Si llevas 5 o más, te conviene el pack.</p>
            <div className="tienda-chips">
              <button className={module === 'all' ? 'on' : ''} onClick={() => setModule('all')}>Todos</button>
              {MODULES.map(m => <button key={m.id} className={module === m.id ? 'on' : ''} onClick={() => setModule(m.id)}>Módulo {m.id} · {m.name}</button>)}
            </div>
            <div className="tomo-grid">
              {TOMOS.filter(t => module === 'all' || t.module === module).map(t => (
                <div key={t.sku} className="tomo-item">
                  <Cover src={t.cover} alt={`Tomo ${t.n} ${t.name}`} />
                  <span className="n">TOMO {t.n}</span>
                  <b>{t.name}</b>
                  <div className="tomo-row">
                    <span className="p">{fmtClp(t.price)}</span>
                    <button className={`mini-btn ${btnState(t.sku)}`} onClick={() => toggle(t.sku)}>{btnLabel(t.sku, '+ Agregar').replace('En el carro', '').replace('En tu pack', 'Pack').trim()}</button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="tienda-section" id="recs">
            <h2>Reconstrucciones por examen</h2>
            <p className="sub">Cada EUNACOM reconstruido, 180 preguntas con explicación. Ideal para hacerlo cronometrado como simulacro.</p>
            <div className="rec-grid">
              {RECONS.map(r => (
                <div key={r.sku} className="rec-item">
                  <div className="band" />
                  <div className="top"><div className="m">EUNACOM {r.month}</div><div className="y">{r.year}</div><div className="q">{r.questions} preguntas</div></div>
                  <div className="tomo-row">
                    <span className="p">{fmtClp(r.price)}</span>
                    <button className={`mini-btn ${btnState(r.sku)}`} onClick={() => toggle(r.sku)} aria-label={`Agregar ${r.name}`}>{isOwned(r.sku) ? '✓ Tuyo' : btnState(r.sku) ? '✓' : '+'}</button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Ancla: la app como upgrade */}
          <section className="tienda-section">
            <h2>¿Libros solos o libros + clases?</h2>
            <p className="sub">El plan de 6 meses de la app incluye toda la biblioteca. La diferencia son las clases y el banco de preguntas.</p>
            <div className="tienda-anchor">
              <div className="pack-card">
                <h3>{BIBLIOTECA.name}</h3>
                <div className="pack-price">{fmtClp(BIBLIOTECA.price)}</div>
                <ul className="pack-feat">
                  <li><i>✓</i>21 tomos + Libros Gordos + Perfil V3</li>
                  <li><i>✓</i>Reconstrucciones 2013–2025</li>
                  <li className="no"><i>✕</i>+650 clases en video</li>
                  <li className="no"><i>✕</i>+10.000 preguntas en la app y simulacros</li>
                  <li className="no"><i>✕</i>Plan de estudio y estadísticas</li>
                </ul>
                <button className={`t-btn ${btnState('biblioteca')}`} onClick={() => toggle('biblioteca')}>{btnLabel('biblioteca', 'Solo los libros')}</button>
              </div>
              <div className="vs">vs</div>
              <div className="pack-card star">
                <span className="pack-ribbon">Lo que más eligen</span>
                <h3>App · Plan 6 meses</h3>
                <div className="pack-price">{fmtClp(PLAN_6M.price)}</div>
                <ul className="pack-feat">
                  <li><i>✓</i><b>La misma biblioteca completa</b></li>
                  <li><i>✓</i>+650 clases en video, con animaciones</li>
                  <li><i>✓</i>+10.000 preguntas reales y simulacros cronometrados</li>
                  <li><i>✓</i>Reconstrucciones resueltas en la app</li>
                  <li><i>✓</i>Plan de estudio y estadísticas por especialidad</li>
                </ul>
                <button className="t-btn fill" onClick={openPlans}>Ver el plan de 6 meses →</button>
              </div>
            </div>
            <div className="tienda-diff">
              Por <b>{fmtClp(PLAN_6M.price - BIBLIOTECA.price)} más</b>, el plan de 6 meses ({fmtClp(PLAN_6M.price)}) incluye la misma biblioteca + clases + preguntas.
            </div>
          </section>

          <section className="tienda-section">
            <div className="tienda-note">
              <div className="ic">🔁</div>
              <div>
                <h3>¿Compraste libros y ahora quieres la app?</h3>
                <p>Si te pasas a un plan dentro de {UPGRADE_CREDIT_DAYS} días, te descontamos lo que pagaste en libros. El descuento aparece solo al elegir el plan.</p>
              </div>
            </div>
          </section>

          <section className="tienda-section">
            <h2>Gratis en nuestras redes</h2>
            <p className="sub">Comenta la palabra en el video de Instagram o TikTok y te mandamos el libro por mensaje.</p>
            <div className="tienda-free">
              <div><b>Libro Gordo de la especialidad</b>90 preguntas reales con explicación<br /><code>Comenta POTASIO, CRISIS, PTT…</code></div>
              <div><b>Repaso Final</b>Lo que más se pregunta, en una guía<br /><code>Comenta SUERO, OJO, EPLEY…</code></div>
              <div><b>Atlas de Dermatología</b>Las lesiones que hay que reconocer<br /><code>Comenta ATLAS</code></div>
            </div>
          </section>

          <section className="tienda-section tienda-faq">
            <h2>Preguntas frecuentes</h2>
            <details open><summary>¿Cómo leo los libros?</summary><p>En línea, dentro de la app: quedan en «Mis libros» de tu cuenta y los abres en el computador, la tablet o el celular. No se descargan.</p></details>
            <details><summary>¿Los libros vencen?</summary><p>No. Es un pago único y el acceso a lo que compras no vence. La app, en cambio, se contrata por meses.</p></details>
            <details><summary>¿Cómo pago?</summary><p>Con Mercado Pago (Webpay, débito o crédito), Apple Pay, Google Pay o PayPal (en dólares), o por transferencia.</p></details>
            <details><summary>¿Sirve el código SHORTS20 en los libros?</summary><p>SHORTS20 es para los planes de la app (20 % en cualquier plan). Los packs de libros ya vienen con el descuento aplicado.</p></details>
          </section>
        </>
      )}

      {cart.length > 0 && !libraryIncluded && (
        <div className="tienda-cart" role="region" aria-label="Carro de libros">
          {hint && <div className="hint">{hint}</div>}
          <div className="row">
            <div className="items">{cart.map(s => PRODUCTS[s].name).join(' · ')}</div>
            <div className="tot">{fmtClp(total)}</div>
            <button className="mini-btn" onClick={() => setCart([])} title="Vaciar carro">Vaciar</button>
            <button className="pay" onClick={pay}>Comprar</button>
          </div>
        </div>
      )}

      {reading && <LectorLibro item={reading.item} title={reading.title} onClose={() => setReading(null)} />}

      {checkout && (
        <BookCheckoutModal
          skus={cart.filter(s => !isOwned(s))}
          onClose={() => setCheckout(false)}
          onPaid={() => { setCheckout(false); setPaidBanner('success') }}
        />
      )}
    </div>
  )
}
