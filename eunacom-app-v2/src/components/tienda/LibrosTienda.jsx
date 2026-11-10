import { isAndroidApp } from '../../lib/playBilling'
import { Check, X as XIcon, Star, RefreshCw, CheckCircle2, Smartphone } from 'lucide-react'
import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useSubscription } from '../../contexts/SubscriptionContext'
import {
  PACKS, TOMOS, RECONS, EXTRAS, COLLECTIONS, SINGLES, MODULES, PRODUCTS, APP_PLANS, UPGRADE_CREDIT_DAYS, TRANSFER,
  expandSkus, looseValue, cartTotal, fmtClp, itemFiles,
} from '../../config/tienda'
import { captureBookPaypal } from '../../lib/api'
import BookCheckoutModal from './BookCheckoutModal'
import LectorLibro from './LectorLibro'
import '../../styles/tienda.css'
import '../../styles/biblioteca-anim.css'

const CART_KEY = 'eunacom_book_cart'
const PLAN_3M = APP_PLANS.find(p => p.id === '3m')
const BIBLIOTECA = PRODUCTS.biblioteca

// Portada por especialidad (public/tienda/<tipo>_<clave>.jpg, copiadas de la Academia) a partir de la etiqueta del archivo
const SPECIALTY_KEYS = [
  ['cardiolog', 'cardiologia'], ['cirug', 'cirugia'], ['dermatolog', 'dermatologia'], ['diabetes', 'diabetes'],
  ['endocrinolog', 'endocrinologia'], ['gastroenterolog', 'gastroenterologia'], ['hemato', 'hematologia'],
  ['infectolog', 'infectologia'], ['infecciosas', 'infectologia'], ['nefrolog', 'nefrologia'], ['neurolog', 'neurologia'],
  ['obstetricia', 'obstetricia'], ['ginecolog', 'ginecologia'], ['oftalmolog', 'oftalmologia'], ['otorrino', 'otorrino'],
  ['pediatr', 'pediatria'], ['psiquiatr', 'psiquiatria'], ['respirator', 'neumologia'], ['reumatolog', 'reumatologia'],
  ['salud publica', 'saludpublica'], ['traumatolog', 'traumatologia'], ['urolog', 'urologia'],
]
const ACCENTED = { Cardiologia: 'Cardiología', Cirugia: 'Cirugía', Dermatologia: 'Dermatología', Endocrinologia: 'Endocrinología', Gastroenterologia: 'Gastroenterología', Ginecologia: 'Ginecología', Hematologia: 'Hematología', Infectologia: 'Infectología', Nefrologia: 'Nefrología', Neurologia: 'Neurología', Oftalmologia: 'Oftalmología', Otorrinolaringologia: 'Otorrinolaringología', Pediatria: 'Pediatría', Psiquiatria: 'Psiquiatría', Reumatologia: 'Reumatología', Traumatologia: 'Traumatología', Urologia: 'Urología' }
const COVER_PREFIX = { gordos: 'gordo', repasos: 'repaso', atlas: 'atlas', 'perfil-v3': 'perfil' }
function fileCover(sku, label, fallback) {
  const norm = label.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  if (/completo|gran libro|ponderado|practica|geriatr/.test(norm)) return fallback
  const key = SPECIALTY_KEYS.find(([k]) => norm.includes(k))?.[1]
  return key && COVER_PREFIX[sku] ? `/tienda/${COVER_PREFIX[sku]}_${key}.jpg` : fallback
}
// Mis libros por tipo: cada archivo de los packs (Libros Gordos, Repaso, Atlas, Perfil) es su propia tarjeta
const SHELF_SECTIONS = [
  { id: 'tomos', title: 'Manuales' },
  { id: 'gordos', title: 'Libros Gordos' },
  { id: 'repasos', title: 'Repaso Final' },
  { id: 'atlas', title: 'Atlas de Imágenes' },
  { id: 'perfil-v3', title: 'Perfil V3 código por código' },
  { id: 'recons', title: 'Reconstrucciones' },
]

function Cover({ src, alt, style }) {
  return <img className="book-cover" src={src} alt={alt} loading="lazy" style={style} />
}

// Los libros entran con animación al aparecer en pantalla (escalonados dentro de su grilla).
// Mide la posición directamente (no depende de IntersectionObserver) y nunca deja un libro oculto.
function useBookReveal() {
  React.useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const SEL = '.tomo-item, .shelf-item, .pack-card, .rec-item'
    let raf = 0
    const check = () => {
      raf = 0
      const vh = window.innerHeight || 800
      document.querySelectorAll(SEL).forEach(el => {
        if (el.classList.contains('bk-in')) return
        if (!el.classList.contains('bk-anim')) {
          const i = Array.prototype.indexOf.call(el.parentNode.children, el)
          el.style.setProperty('--d', `${Math.min(i % 12, 8) * 70}ms`)
          el.classList.add('bk-anim')
        }
        const r = el.getBoundingClientRect()
        if (r.top < vh * 0.94) el.classList.add('bk-in') // en pantalla o ya pasado
      })
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(check) }
    check()
    const t = setInterval(check, 700)
    window.addEventListener('scroll', onScroll, { capture: true, passive: true })
    window.addEventListener('resize', onScroll)
    return () => { clearInterval(t); cancelAnimationFrame(raf); window.removeEventListener('scroll', onScroll, { capture: true }); window.removeEventListener('resize', onScroll) }
  })
}

// Tienda de libros: oferta primero, la app como upgrade (en el checkout de planes es al revés).
export default function LibrosTienda() {
  useBookReveal()
  const { user, openAuthModal } = useAuth()
  const { isPremium, planMonths, libraryIncluded, ownedBooks, purchasedBookSkus, setShowPaymentModal, refreshBooks } = useSubscription()

  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]').filter(s => PRODUCTS[s]) } catch { return [] }
  })
  const [module, setModule] = useState('all')
  const [checkout, setCheckout] = useState(false)
  const [paidBanner, setPaidBanner] = useState(() => new URLSearchParams(window.location.search).get('books'))
  const [reading, setReading] = useState(null) // { item, title, fileIdx }

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
    hint = <>Por {fmtClp(Math.max(0, PLAN_3M.price - total))} más tienes la app 3 meses con toda la biblioteca, las clases y las preguntas. <button onClick={openPlans}>Ver plan →</button></>
  } else if (nT >= 5) {
    hint = <>Llevas {nT} tomos ({fmtClp(nT * TOMOS[0].price)}). El pack de los 21 cuesta {fmtClp(PRODUCTS['pack-tomos'].price)}. <button onClick={() => swapToPack('pack-tomos')}>Cambiar al pack →</button></>
  } else if (nR >= 4) {
    hint = <>Llevas {nR} reconstrucciones. Las 16 en el Gran Libro cuestan {fmtClp(PRODUCTS['pack-recons'].price)}. <button onClick={() => swapToPack('pack-recons')}>Cambiar al pack →</button></>
  }

  const btnState = sku => isOwned(sku) ? 'owned' : (cart.includes(sku) || coveredByCart(sku)) ? 'added' : ''
  const btnLabel = (sku, idle) => isOwned(sku) ? 'Tuyo' : cart.includes(sku) ? 'En el carro' : coveredByCart(sku) ? 'En tu pack' : idle

  // Mis libros: biblioteca completa por plan, o lo comprado, separados por tipo
  const shelfBySection = { tomos: TOMOS.filter(t => ownedBooks.has(t.sku)).map(t => ({ key: t.sku, item: t.sku, cover: t.cover, label: `Tomo ${t.n} · ${t.name}` })) }
  for (const x of EXTRAS.filter(x => ownedBooks.has(x.sku))) {
    const section = x.sku === 'gran-recons' ? 'recons' : x.sku
    shelfBySection[section] = [...(shelfBySection[section] || []), ...(x.files
      ? x.files.map((f, i) => ({ key: `${x.sku}-${i}`, item: x.sku, fileIdx: i, cover: fileCover(x.sku, f.label, x.cover), label: ACCENTED[f.label] || f.label }))
      : [{ key: x.sku, item: x.sku, cover: x.cover, label: x.name }])]
  }
  // Libros sueltos comprados sin su colección completa
  for (const x of SINGLES.filter(x => ownedBooks.has(x.sku) && !ownedBooks.has(x.collection))) {
    const fallback = COLLECTIONS.find(c => c.sku === x.collection).cover
    shelfBySection[x.collection] = [...(shelfBySection[x.collection] || []), { key: x.sku, item: x.sku, cover: fileCover(x.collection, x.label, fallback), label: x.label }]
  }
  if (!ownedBooks.has('gran-recons')) {
    shelfBySection.recons = [...(shelfBySection.recons || []), ...RECONS.filter(r => ownedBooks.has(r.sku)).map(r => ({ key: r.sku, item: r.sku, rec: r, label: r.name }))]
  }
  const shelf = SHELF_SECTIONS.flatMap(s => shelfBySection[s.id] || [])
  const shortPlan = isPremium && !libraryIncluded && planMonths > 0

  return (
    <div className="tienda">
      {paidBanner === 'success' && (
        <div className="tienda-banner ok">
          <span><CheckCircle2 size={16} style={{ verticalAlign: -3, marginRight: 6 }} />¡Pago recibido! Tus libros quedan desbloqueados en «Mis libros» (puede tardar unos segundos).</span>
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
          <h2>Mis libros</h2>
          <p className="sub">
            {libraryIncluded ? 'Tu plan incluye la biblioteca completa.' : `Tienes ${purchasedBookSkus.length} compra${purchasedBookSkus.length === 1 ? '' : 's'} de libros en tu cuenta.`}
          </p>
          {SHELF_SECTIONS.filter(s => shelfBySection[s.id]?.length).map(s => (
            <div key={s.id} id={`shelf-${s.id}`} className="shelf-section">
              <h3 className="shelf-section__title">{s.title} <span>{shelfBySection[s.id].length}</span></h3>
              <div className="shelf">
                {shelfBySection[s.id].map(b => (
                  <div key={b.key} className="shelf-item">
                    {b.rec
                      ? <div className="rec-cover"><small>EUNACOM {b.rec.month}</small><strong>{b.rec.year}</strong></div>
                      : <Cover src={b.cover} alt={b.label} />}
                    <b>{b.label}</b>
                    {itemFiles(b.item).length
                      ? <button className="mini-btn" onClick={() => setReading({ item: b.item, title: b.label, fileIdx: b.fileIdx || 0 })}>Leer</button>
                      : <span className="mini-btn owned" title={`Escríbenos por WhatsApp al ${TRANSFER.whatsapp}`}>Próximamente</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <p className="sub" style={{ marginTop: '0.75rem' }}>Los libros se leen en línea dentro de la app, con tu cuenta.</p>
        </section>
      )}

      {libraryIncluded ? null : (
        <>
          {shortPlan && (
            <div className="tienda-banner info">
              <span>Tu plan de {planMonths} {planMonths === 1 ? 'mes' : 'meses'} no incluye la biblioteca. Agrégala por <strong>{fmtClp(BIBLIOTECA.price)}</strong> o pásate al plan de 3 meses, que la trae incluida.</span>
              <button className="mini-btn" onClick={() => toggle('biblioteca')}>{cart.includes('biblioteca') ? 'En el carro' : 'Agregar biblioteca'}</button>
            </div>
          )}


          <section className="tienda-section" id="packs">
            <h2>Elige tu pack</h2>
            <p className="sub">Comprar por pack sale mucho más barato que libro por libro.</p>
            <div className="tienda-packs">
              {PACKS.map(p => {
                const was = looseValue(p.sku)
                const save = Math.round((1 - p.price / was) * 100)
                return (
                  <div key={p.sku} id={p.star ? 'pack-completa' : `pack-${p.sku}`} className={`pack-card ${p.star ? 'star' : ''}`}>
                    {p.star && <span className="pack-ribbon"><Star size={12} fill="currentColor" style={{ verticalAlign: -1, marginRight: 4 }} />Más conveniente · Ahorra {save} %</span>}
                    <div className="pack-covers">{p.covers.map((c, i) => <Cover key={i} src={c} alt="" />)}</div>
                    <h3>{p.name}</h3>
                    <p className="desc">{p.desc}</p>
                    <div className="pack-price">{fmtClp(p.price)}<span className="was">{fmtClp(was)}</span></div>
                    <ul className="pack-feat">{p.features.map(f => <li key={f}><i><Check size={13} strokeWidth={3} /></i>{f}</li>)}</ul>
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
                    <button className={`mini-btn ${btnState(r.sku)}`} onClick={() => toggle(r.sku)} aria-label={`Agregar ${r.name}`}>{isOwned(r.sku) ? 'Tuyo' : btnState(r.sku) ? <Check size={15} strokeWidth={3} /> : '+'}</button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {COLLECTIONS.map(c => {
            const pack = PACKS.find(p => p.includes[0] === c.sku)
            return (
              <section key={c.sku} className="tienda-section" id={`sueltos-${c.sku}`}>
                <h2>{c.section}, uno por uno</h2>
                <p className="sub">{c.sub} Cada uno a {fmtClp(SINGLES.find(x => x.collection === c.sku && x.price < 10000).price)}{pack ? <>, o todos en el {pack.name} por {fmtClp(pack.price)}.</> : '.'}</p>
                <div className="tomo-grid">
                  {SINGLES.filter(x => x.collection === c.sku).map(x => (
                    <div key={x.sku} className="tomo-item">
                      <Cover src={fileCover(c.sku, x.label, c.cover)} alt={x.name} />
                      <b>{x.label}</b>
                      <div className="tomo-row">
                        <span className="p">{fmtClp(x.price)}</span>
                        <button className={`mini-btn ${btnState(x.sku)}`} onClick={() => toggle(x.sku)}>{btnLabel(x.sku, '+ Agregar').replace('En el carro', '').replace('En tu pack', 'Pack').trim() || <Check size={15} strokeWidth={3} />}</button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )
          })}

          {/* Ancla: la app como upgrade */}
          <section className="tienda-section">
            <h2>¿Libros solos o libros + clases?</h2>
            <p className="sub">El plan de 3 meses de la app incluye toda la biblioteca. La diferencia son las clases y el banco de preguntas.</p>
            <div className="tienda-anchor">
              <div className="pack-card">
                <h3>{BIBLIOTECA.name}</h3>
                <div className="pack-price">{fmtClp(BIBLIOTECA.price)}</div>
                <ul className="pack-feat">
                  <li><i><Check size={13} strokeWidth={3} /></i>21 tomos + 23 Libros Gordos + 21 Repaso Final</li>
                  <li><i><Check size={13} strokeWidth={3} /></i>1.569 códigos explicados + 19 atlas de imágenes</li>
                  <li><i><Check size={13} strokeWidth={3} /></i>Reconstrucciones 2013–2026</li>
                  <li className="no"><i><XIcon size={13} strokeWidth={3} /></i>+650 clases en video</li>
                  <li className="no"><i><XIcon size={13} strokeWidth={3} /></i>+47.000 preguntas en la app y simulacros</li>
                  <li className="no"><i><XIcon size={13} strokeWidth={3} /></i>Plan de estudio y estadísticas</li>
                </ul>
                <button className={`t-btn ${btnState('biblioteca')}`} onClick={() => toggle('biblioteca')}>{btnLabel('biblioteca', 'Solo los libros')}</button>
              </div>
              <div className="vs">vs</div>
              <div className="pack-card star">
                <span className="pack-ribbon">Lo que más eligen</span>
                <h3>App · Plan 3 meses</h3>
                <div className="pack-price">{fmtClp(PLAN_3M.price)}</div>
                <ul className="pack-feat">
                  <li><i><Check size={13} strokeWidth={3} /></i><b>La misma biblioteca completa</b></li>
                  <li><i><Check size={13} strokeWidth={3} /></i>+650 clases en video, con animaciones</li>
                  <li><i><Check size={13} strokeWidth={3} /></i>+47.000 preguntas reales y simulacros cronometrados</li>
                  <li><i><Check size={13} strokeWidth={3} /></i>Reconstrucciones resueltas en la app</li>
                  <li><i><Check size={13} strokeWidth={3} /></i>Plan de estudio y estadísticas por especialidad</li>
                </ul>
                <button className="t-btn fill" onClick={openPlans}>Ver el plan de 3 meses →</button>
              </div>
            </div>
            <div className="tienda-diff">
              Por <b>{fmtClp(PLAN_3M.price - BIBLIOTECA.price)} más</b>, el plan de 3 meses ({fmtClp(PLAN_3M.price)}) incluye la misma biblioteca + clases + preguntas.
            </div>
          </section>

          <section className="tienda-section">
            <div className="tienda-note">
              <div className="ic"><RefreshCw size={22} /></div>
              <div>
                <h3>¿Compraste libros y ahora quieres la app?</h3>
                <p>Si te pasas a un plan dentro de {UPGRADE_CREDIT_DAYS} días, te descontamos lo que pagaste en libros. El descuento aparece solo al elegir el plan.</p>
              </div>
            </div>
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

      {reading && <LectorLibro item={reading.item} title={reading.title} initialFileIdx={reading.fileIdx} onClose={() => setReading(null)} />}

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
