import { isAndroidApp } from '../../lib/playBilling'
import { Check, X as XIcon, Star, RefreshCw, CheckCircle2, Smartphone, GraduationCap, Clock, PlayCircle } from 'lucide-react'
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useNavigationType } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useSubscription } from '../../contexts/SubscriptionContext'
import {
  PACKS, TOMOS, RECONS, RECON_JUL2026, isReleased, EXTRAS, COLLECTIONS, SINGLES, MODULES, PRODUCTS, APP_PLANS, UPGRADE_CREDIT_DAYS, TRANSFER,
  expandSkus, looseValue, cartTotal, fmtClp, itemFiles,
} from '../../config/tienda'
import { captureBookPaypal, createTest, genId, fetchTests, fetchLibroGordoQuestions } from '../../lib/api'
import { LIBROS_GORDOS } from '../../../api/_libro-gordo.js'
import BookCheckoutModal, { GUEST_BUYER_KEY } from './BookCheckoutModal'
import { SPECIALTY_KEYS, fileCover } from '../../config/covers'
import { getStore, useUserData } from '../../lib/lector/userData'
import { navDepth, replaceUrl, setForwardHandler, urlWith, useHistoryLayer } from '../../lib/lector/nav'
import '../../styles/tienda.css'
import '../../styles/biblioteca-anim.css'

// Lectores aparte del paquete de la biblioteca: se descargan al abrir un libro
const LectorWeb = React.lazy(() => import('../lector/LectorWeb'))
const LectorLibro = React.lazy(() => import('./LectorLibro'))

const CART_KEY = 'eunacom_book_cart'
const SCROLL_KEY = 'eunacom_biblio_scroll' // sessionStorage: altura del estante
const PLAN_3M = APP_PLANS.find(p => p.id === '3m')
const BIBLIOTECA = PRODUCTS.biblioteca

const ACCENTED = { Cardiologia: 'Cardiología', Cirugia: 'Cirugía', Dermatologia: 'Dermatología', Endocrinologia: 'Endocrinología', Gastroenterologia: 'Gastroenterología', Ginecologia: 'Ginecología', Hematologia: 'Hematología', Infectologia: 'Infectología', Nefrologia: 'Nefrología', Neurologia: 'Neurología', Oftalmologia: 'Oftalmología', Otorrinolaringologia: 'Otorrinolaringología', Pediatria: 'Pediatría', Psiquiatria: 'Psiquiatría', Reumatologia: 'Reumatología', Traumatologia: 'Traumatología', Urologia: 'Urología' }
// Módulo de cada especialidad (para filtrar los libros sueltos que no son tomos)
const KEY_MODULE = {
  cardiologia: 1, diabetes: 1, endocrinologia: 1, gastroenterologia: 1, hematologia: 1, infectologia: 1, nefrologia: 1,
  neurologia: 1, neumologia: 1, reumatologia: 1, cirugia: 2, traumatologia: 2, urologia: 2, otorrino: 2, oftalmologia: 2,
  dermatologia: 2, psiquiatria: 2, pediatria: 3, obstetricia: 3, ginecologia: 3, saludpublica: 4,
}
function labelModule(label) {
  const norm = label.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  if (/completo|gran libro|ponderado/.test(norm)) return null
  const key = SPECIALTY_KEYS.find(([k]) => norm.includes(k))?.[1]
  return key ? KEY_MODULE[key] : null
}
// Pestañas de «Libros sueltos»: primero el tipo de libro, después el módulo
const LOOSE_TYPES = [
  { id: 'tomos', title: 'Manuales' },
  ...COLLECTIONS.map(c => ({ id: c.sku, title: c.section.replace(' código por código', '') })),
  { id: 'recons', title: 'Reconstrucciones' },
]
const SHORT_MODULE = { 1: 'Medicina Interna', 2: 'Cirugía y especialidades', 3: 'Materno-infantil', 4: 'Salud Pública' }
// Mis libros por tipo: cada archivo de los packs (Libros Gordos, Repaso, Atlas, Perfil) es su propia tarjeta
const SHELF_SECTIONS = [
  { id: 'tomos', title: 'Manuales' },
  { id: 'gordos', title: 'Libros Gordos' },
  { id: 'repasos', title: 'Repaso Final' },
  { id: 'atlas', title: 'Atlas de Imágenes' },
  { id: 'perfil-v3', title: 'Perfil V3 código por código' },
  { id: 'recons', title: 'Reconstrucciones' },
]

function looseItems(type) {
  if (type === 'tomos') return TOMOS.map(t => ({ sku: t.sku, cover: t.cover, alt: `Tomo ${t.n} ${t.name}`, kicker: `TOMO ${t.n}`, title: t.name, price: t.price, module: t.module }))
  const c = COLLECTIONS.find(x => x.sku === type)
  return SINGLES.filter(x => x.collection === type).map(x => ({
    sku: x.sku, cover: fileCover(type, x.label, c.cover), alt: x.name, kicker: null, title: x.label, price: x.price, module: labelModule(x.label),
  }))
}
function looseSub(type) {
  if (type === 'tomos') return `Cada manual a ${fmtClp(TOMOS[0].price)}. Si llevas 5 o más, te conviene el pack.`
  if (type === 'recons') return `Cada EUNACOM reconstruido, 180 preguntas con explicación, a ${fmtClp(RECONS[0].price)}.`
  const c = COLLECTIONS.find(x => x.sku === type)
  const one = SINGLES.find(x => x.collection === type && x.price < 10000)
  const pack = PACKS.find(p => p.includes[0] === type)
  return `${c.sub} Cada uno a ${fmtClp(one.price)}${pack ? `, o todos en el ${pack.name} por ${fmtClp(pack.price)}` : ''}.`
}

const plain = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

// Libros de preguntas → su test en línea. Sin inventar: un Libro Gordo solo se enlaza si su especialidad existe
// en api/_libro-gordo.js, y una reconstrucción solo si su examen (mismo mes y año) está en /data/reconstrucciones/index.json.
function gordoBookKey(item, fileIdx) {
  if (item !== 'gordos' && SINGLES.find(x => x.sku === item)?.collection !== 'gordos') return null
  const norm = plain(itemFiles(item)[fileIdx || 0]?.label)
  if (!norm || /gran libro|ponderado/.test(norm)) return null // sin test propio: son varios libros en uno
  const key = SPECIALTY_KEYS.find(([k]) => norm.includes(k))?.[1]
  return LIBROS_GORDOS.some(b => b.key === key) ? key : null
}
function reconExam(rec, exams) {
  const [, month, year] = rec.name.split(' ') // «Reconstrucción Julio 2025»
  const found = (exams || []).filter(e => Number(e.year) === Number(year) && plain(e.month) === plain(month))
  return found.length === 1 ? found[0] : null
}
const examSoon = e => !!e.coming_soon && Date.now() < Date.parse(`${e.release_date}T00:00:00-03:00`)

// Avance del lector web (lib/lector/userData.js): progress[`<item>:<fileIdx>`] = { topicId, done: { [topicId]: ts }, ts },
// cards[bookKey] (Repaso, Atlas: 'se' | 'rep') y answers[bookKey][topicId][nº] (preguntas respondidas).
const isStarted = p => !!p && typeof p === 'object' && !!(p.topicId || Object.keys(p.done || {}).length)
// Qué cuenta `done` en cada familia de libro: la carpeta del archivo, igual que los `match` de components/lector/modes/index.js
// (no se usa bookKind de lib/lector/content.js: los tipos solo se registran cuando se carga el lector).
const PROGRESS_NOUN = [
  [/^06_Atlas\//, 'imagen vista', 'imágenes vistas'],
  [/^04_Perfil_V3_Codigo_por_Codigo\//, 'código estudiado', 'códigos estudiados'],
]
const plural = (n, one, many) => `${n.toLocaleString('es-CL')} ${n === 1 ? one : many}`
/** «3 temas estudiados · 12 tarjetas que ya sabes · 5 preguntas respondidas» (lo que haya, hasta dos datos). */
function progressLabel(item, fileIdx, data) {
  const key = `${item}:${Number(fileIdx) || 0}`
  const file = itemFiles(item)[Number(fileIdx) || 0]?.file || ''
  const [, one, many] = PROGRESS_NOUN.find(([re]) => re.test(file)) || [null, 'tema estudiado', 'temas estudiados']
  const done = Object.keys(data.progress[key]?.done || {}).length
  const known = Object.values(data.cards[key] || {}).filter(v => v === 'se').length
  const answered = Object.values(data.answers[key] || {}).reduce((a, qs) => a + Object.keys(qs || {}).length, 0)
  const atlas = /^06_Atlas\//.test(file)
  const parts = []
  if (done) parts.push(plural(done, one, many))
  if (known) parts.push(plural(known, atlas ? 'imagen que reconoces' : 'tarjeta que ya sabes', atlas ? 'imágenes que reconoces' : 'tarjetas que ya sabes'))
  if (answered) parts.push(plural(answered, 'pregunta respondida', 'preguntas respondidas'))
  return parts.slice(0, 2).join(' · ')
}

// Libro abierto en la dirección: /biblioteca?leer=<item>:<fileIdx>[&t=<tema>][&pdf=1]. Así «Atrás» del teléfono o del
// navegador cierra el lector (y antes el tema y lo que esté encima), y al recargar o volver de una clase se reabre.
function readUrlBook() {
  try {
    const q = new URLSearchParams(window.location.search)
    const m = String(q.get('leer') || '').match(/^([\w.-]{1,60}):(\d{1,2})$/)
    return m ? { item: m[1], fileIdx: Number(m[2]), topicId: q.get('t') || null, pdf: q.get('pdf') === '1' } : null
  } catch { return null }
}
const bookUrl = (item, fileIdx, pdf) => urlWith({ leer: `${item}:${Number(fileIdx) || 0}`, t: null, pdf: pdf ? 1 : null })

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
  const navigate = useNavigate()
  const navType = useNavigationType()
  const { user, openAuthModal } = useAuth()
  const { isPremium, planMonths, libraryIncluded, ownedBooks, purchasedBookSkus, hasExceededReconstructions, setShowPaymentModal, refreshBooks, loadingPremium } = useSubscription()

  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]').filter(s => PRODUCTS[s]) } catch { return [] }
  })
  const [module, setModule] = useState('all')
  const [looseType, setLooseType] = useState('tomos')
  const [checkout, setCheckout] = useState(false)
  const [paidBanner, setPaidBanner] = useState(() => new URLSearchParams(window.location.search).get('books'))
  // { item, title, fileIdx, pdf, topicId?, url, adopt? } · pdf: abre directo el PDF (libros de preguntas)
  const [reading, setReading] = useState(null)
  const [online, setOnline] = useState(null) // test en línea elegido: { kind: 'lg' | 'rec', … }
  const [recExams, setRecExams] = useState(null) // exámenes de /data/reconstrucciones/index.json
  // Avance de lectura: el mismo almacén del lector (se actualiza solo, también con lo que llega del servidor)
  const [readerData] = useUserData(user?.id)
  const progress = readerData.progress

  // El lector abierto es una entrada del historial: «Atrás» lo cierra; cerrarlo con la X vuelve atrás.
  useHistoryLayer(!!reading, () => setReading(null), { url: reading?.url, adopt: !!reading?.adopt })
  const restore = useRef(readUrlBook()) // libro en la dirección al entrar (recarga, vuelta desde «Ver la clase»)

  useEffect(() => { try { localStorage.setItem(CART_KEY, JSON.stringify(cart)) } catch {} }, [cart])

  // Compra sin cuenta (guardada antes de ir a pagar): para la ventana «¡felicitaciones! crea tu cuenta»
  const [guestBuyer, setGuestBuyer] = useState(() => { try { return JSON.parse(localStorage.getItem(GUEST_BUYER_KEY) || 'null') } catch { return null } })
  const [guestPaid, setGuestPaid] = useState(false)
  useEffect(() => {
    // Ya con cuenta: el servidor pasa sola la compra a su usuario al leer sus libros
    if (user?.id && guestBuyer) { try { localStorage.removeItem(GUEST_BUYER_KEY) } catch {} setGuestBuyer(null); setGuestPaid(false); refreshBooks() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  // Vuelta desde PayPal (?paypal_books=return&token=ORDER): capturar y desbloquear
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    const buyerId = user?.id || guestBuyer?.id
    if (params.get('paypal_books') !== 'return' || !token || !buyerId) return
    window.history.replaceState(null, '', window.location.pathname)
    captureBookPaypal(buyerId, token)
      .then(() => { refreshBooks(); setPaidBanner('success') })
      .catch(err => { console.error('PayPal books capture failed:', err); setPaidBanner('failure') })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  // Vuelta desde Webpay: el webhook puede tardar unos segundos en registrar la compra
  useEffect(() => {
    if (paidBanner !== 'success') return
    if (!user && guestBuyer) setGuestPaid(true)
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

  // ?add=<sku> (landing de la reconstrucción, correos): deja ese libro en el carro al entrar
  useEffect(() => {
    const sku = new URLSearchParams(window.location.search).get('add')
    if (!sku || !PRODUCTS[sku] || !isReleased(PRODUCTS[sku]) || isOwned(sku)) return
    setCart(prev => (prev.includes(sku) ? prev : [...prev, sku]))
  }, [ownedBooks]) // eslint-disable-line react-hooks/exhaustive-deps

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
    // En la app Android el pago es por Google Play y necesita la cuenta; en la web se puede pagar sin cuenta
    if (!user && isAndroidApp()) return openAuthModal('login', 'Inicia sesión para comprar: los libros quedan guardados en tu cuenta')
    setCheckout(true)
  }

  const total = cartTotal(cart)
  const nT = cart.filter(s => s.startsWith('tomo-')).length
  const nR = cart.filter(s => s.startsWith('rec-')).length
  let hint = null
  if (total >= BIBLIOTECA.price) {
    const d = PLAN_3M.price - total
    const lead = d > 0 ? <>Por {fmtClp(d)} más tienes</> : d < 0 ? <>Por {fmtClp(-d)} menos tienes</> : <>Por el mismo precio tienes</>
    hint = <>{lead} la app 3 meses con toda la biblioteca, las clases y las preguntas. <button onClick={openPlans}>Ver plan →</button></>
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
  // Julio 2026 va primero, sin sacar lo que ya está en la sección (el Gran Libro de Reconstrucciones)
  if (ownedBooks.has(RECON_JUL2026.sku)) shelfBySection.recons = [{ key: RECON_JUL2026.sku, item: RECON_JUL2026.sku, rec: RECON_JUL2026, label: RECON_JUL2026.name, soon: !isReleased(RECON_JUL2026) }, ...(shelfBySection.recons || [])]
  if (!ownedBooks.has('gran-recons')) {
    shelfBySection.recons = [...(shelfBySection.recons || []), ...RECONS.filter(r => ownedBooks.has(r.sku)).map(r => ({ key: r.sku, item: r.sku, rec: r, label: r.name }))]
  }
  const shelf = SHELF_SECTIONS.flatMap(s => shelfBySection[s.id] || [])
  const shelfSig = shelf.map(b => b.key).join('|')

  // Avance del estante desde el servidor (otro dispositivo): una sola consulta con todos los libros, al entrar
  useEffect(() => {
    if (user?.id && shelfSig) getStore(user.id).syncShelf?.()
  }, [user?.id, !!shelfSig]) // eslint-disable-line react-hooks/exhaustive-deps

  // Reabrir el libro de la dirección, solo si está en el estante de esta cuenta. Si no está (o no hay sesión), se limpia la dirección.
  const shelfBook = r => (r ? shelf.find(x => x.item === r.item && (x.fileIdx || 0) === r.fileIdx && !x.soon && itemFiles(x.item).length > 0) || null : null)
  const live = useRef({})
  Object.assign(live.current, { shelfBook, reading, loaded: !!shelfSig && !loadingPremium })
  // «Adelante» del navegador hasta un libro que se había cerrado: se reabre ahí (si ya no se puede, nav.js vuelve atrás)
  useEffect(() => setForwardHandler(() => {
    const { shelfBook: find, reading: open } = live.current
    if (open) return false
    const r = readUrlBook()
    const b = find(r)
    if (!b) return false
    setReading({ item: b.item, title: b.label, fileIdx: b.fileIdx || 0, pdf: r.pdf, topicId: r.topicId, adopt: true, url: null })
    return true
  }), [])
  // ?leer= que no se entiende (p. ej. ?leer=foo): se limpia al entrar (se decide con la dirección del primer dibujo)
  const badLeer = useRef(null)
  if (badLeer.current === null) { try { badLeer.current = !restore.current && new URLSearchParams(window.location.search).has('leer') } catch { badLeer.current = false } }
  useEffect(() => {
    if (!badLeer.current) return
    badLeer.current = false
    replaceUrl(urlWith({ leer: null, t: null, pdf: null }))
  }, [])
  useEffect(() => {
    const r = restore.current
    if (!r || reading) return undefined
    const b = shelfBook(r)
    const clean = () => { restore.current = null; replaceUrl(urlWith({ leer: null, t: null, pdf: null })) }
    if (b) {
      restore.current = null
      const adopt = navDepth() >= 1 // la entrada del libro ya existe (recarga, «Atrás» desde una clase)
      if (!adopt) replaceUrl(urlWith({ leer: null, t: null, pdf: null })) // enlace directo: la entrada actual queda como el estante
      setReading({ item: b.item, title: b.label, fileIdx: b.fileIdx || 0, pdf: r.pdf, topicId: r.topicId, adopt, url: adopt ? null : bookUrl(b.item, b.fileIdx, r.pdf) })
      return undefined
    }
    if (loadingPremium) return undefined
    if (!user) { clean(); return undefined }
    if (shelfSig) { clean(); return undefined } // los libros de la cuenta ya llegaron y ese no está (o el enlace no es válido)
    const t = setTimeout(clean, 8000) // los libros de la cuenta llegan después del perfil
    return () => clearTimeout(t)
  }, [shelfSig, loadingPremium, user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Altura del estante: al volver con «Atrás» (desde un test, /reconstructions o una clase) se vuelve a la misma altura.
  // Lo que se desplaza es el contenedor de la app (.main-content en el computador) o la ventana.
  const rootRef = useRef(null)
  const scroller = () => {
    for (let el = rootRef.current?.parentElement; el && el !== document.body; el = el.parentElement) {
      if (/(auto|scroll)/.test(getComputedStyle(el).overflowY) && el.scrollHeight > el.clientHeight) return el
    }
    return document.scrollingElement || document.documentElement
  }
  // Lo guardado al entrar: mientras se reaplica no se guarda la altura (la página aún crece y el contenedor la recorta).
  const savedY = useRef(null)
  if (savedY.current === null) { try { savedY.current = Number(sessionStorage.getItem(SCROLL_KEY)) || 0 } catch { savedY.current = 0 } }
  const scrollDone = useRef(navType !== 'POP')
  useEffect(() => {
    let raf = 0
    const save = () => {
      raf = 0
      const l = live.current
      l.pending = false
      if (l.reading || l.leaving || !scrollDone.current || l.restoring) return
      try { sessionStorage.setItem(SCROLL_KEY, String(Math.round(scroller().scrollTop))) } catch { /* nada */ }
    }
    const on = () => { live.current.pending = true; if (!raf) raf = setTimeout(save, 120) } // (no rAF: en una pestaña de fondo no corre)
    window.addEventListener('scroll', on, { passive: true, capture: true })
    return () => { window.removeEventListener('scroll', on, { capture: true }); clearTimeout(raf) }
  }, [])
  // Al salir del estante a otra página (test, /reconstructions, otra sección) esa página parte arriba: el contenedor
  // de la app es el mismo para todas. La altura del estante ya quedó guardada para «Atrás».
  useLayoutEffect(() => {
    live.current.leaving = false
    const anc = [] // contenedores que pueden desplazarse (al desmontar, rootRef ya no está)
    for (let el = rootRef.current?.parentElement; el && el !== document.body; el = el.parentElement) anc.push(el)
    return () => {
      const l = live.current
      const el = anc.find(a => a.scrollTop > 0) || null
      // la última altura (el guardado espera 120 ms)
      if (el && l.pending && !l.reading && scrollDone.current && !l.restoring) { try { sessionStorage.setItem(SCROLL_KEY, String(Math.round(el.scrollTop))) } catch { /* nada */ } }
      l.leaving = true
      anc.forEach(a => { if (a.scrollTop) a.scrollTop = 0 })
      window.scrollTo(0, 0)
    }
  }, [])
  useEffect(() => {
    if (scrollDone.current || !shelfSig) return undefined
    const y = savedY.current
    if (y <= 0) { scrollDone.current = true; return undefined }
    // lo de más abajo (packs, tienda, portadas) termina de dibujarse después: se insiste hasta que la página alcanza
    // esa altura y se queda ahí un momento, o hasta que la persona se mueve sola, o 8 s.
    live.current.restoring = true
    const t0 = Date.now()
    let okSince = 0
    let iv = 0
    const EVS = ['wheel', 'touchstart', 'keydown', 'pointerdown']
    const off = () => { clearInterval(iv); live.current.restoring = false; EVS.forEach(e => window.removeEventListener(e, stop, true)) }
    function stop() { off(); scrollDone.current = true }
    const go = () => {
      if (live.current.reading) return stop()
      const el = scroller()
      if (Math.abs(el.scrollTop - y) > 4) { el.scrollTop = y; okSince = 0 } else if (!okSince) okSince = Date.now()
      if ((okSince && Date.now() - okSince > 1200) || Date.now() - t0 > 8000) stop()
    }
    EVS.forEach(e => window.addEventListener(e, stop, true))
    go()
    iv = setInterval(go, 120)
    return off // desmontar (o el doble montaje de desarrollo) no cuenta como terminado
  }, [!!shelfSig]) // eslint-disable-line react-hooks/exhaustive-deps

  // Reconstrucciones en el estante → hace falta el índice de exámenes para saber cuál se responde en línea
  const hasRecons = !!shelfBySection.recons?.length
  useEffect(() => {
    if (!hasRecons || recExams) return
    let alive = true
    fetch('/data/reconstrucciones/index.json').then(r => r.json()).then(d => { if (alive) setRecExams(d.exams || []) }).catch(() => {})
    return () => { alive = false }
  }, [hasRecons]) // eslint-disable-line react-hooks/exhaustive-deps

  // Test en línea de un libro del estante, solo si existe y la cuenta puede usarlo hoy (mismas reglas que
  // api/_libro-gordo.js y pages/Reconstructions.jsx; aquí no se cambia quién tiene acceso).
  const canRecons = isPremium || !hasExceededReconstructions
  const onlineFor = b => {
    if (!user || b.soon) return null
    const book = gordoBookKey(b.item, b.fileIdx)
    if (book) return isPremium ? { kind: 'lg', book, title: `Libro Gordo · ${LIBROS_GORDOS.find(x => x.key === book).name}`, count: 90 } : null
    if (b.item === 'gran-recons') return canRecons ? { kind: 'recs' } : null
    if (!b.rec) return null
    const exam = reconExam(b.rec, recExams)
    if (!exam || examSoon(exam)) return null
    const allowed = exam.requires_sku ? (isPremium || ownedBooks.has(exam.requires_sku)) : canRecons
    return allowed ? { kind: 'rec', exam, title: exam.name, count: exam.total_questions } : null
  }
  const openOnline = t => (t.kind === 'recs' ? navigate('/reconstructions') : setOnline(t))

  const lastRead = Object.entries(progress).filter(([, p]) => isStarted(p)).sort((a, b) => (Number(b[1].ts) || 0) - (Number(a[1].ts) || 0))[0]?.[0]
  const shortPlan = isPremium && !libraryIncluded && planMonths > 0

  return (
    <div className="tienda" ref={rootRef}>
      {guestPaid && guestBuyer && !user && (
        <GuestPaidModal
          buyer={guestBuyer}
          onRegister={() => openAuthModal('register', `Crea tu cuenta con ${guestBuyer.email} y tus libros aparecen en tu Biblioteca`, guestBuyer.email)}
          onLogin={() => openAuthModal('login', `Inicia sesión con ${guestBuyer.email} y tus libros aparecen en tu Biblioteca`, guestBuyer.email)}
          onClose={() => setGuestPaid(false)}
        />
      )}
      {paidBanner === 'success' && (user || !guestBuyer) && (
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
                {shelfBySection[s.id].map(b => {
                  const hasPdf = itemFiles(b.item).length > 0
                  const test = onlineFor(b)
                  const open = pdf => setReading({ item: b.item, title: b.label, fileIdx: b.fileIdx || 0, pdf, url: bookUrl(b.item, b.fileIdx, pdf) })
                  const pKey = `${b.item}:${b.fileIdx || 0}`
                  const started = !test && isStarted(progress[pKey])
                  const studied = started ? progressLabel(b.item, b.fileIdx, readerData) : ''
                  return (
                    <div key={b.key} className="shelf-item">
                      <div className="shelf-cover">
                        {b.rec && !b.rec.cover
                          ? <div className="rec-cover"><small>EUNACOM {b.rec.month}</small><strong>{b.rec.year}</strong></div>
                          : <Cover src={b.cover || b.rec?.cover} alt={b.label} />}
                        {started && pKey === lastRead && <span className="shelf-tag">Última lectura</span>}
                      </div>
                      <b>{b.label}</b>
                      {studied && <small className="shelf-prog">{studied}</small>}
                      {b.soon
                        ? <span className="mini-btn owned">16 nov</span>
                        : test
                        ? (
                          <div className="shelf-actions">
                            <button className="mini-btn fill" onClick={() => openOnline(test)}>Responder en línea</button>
                            {hasPdf && <button className="shelf-link" onClick={() => open(true)}>PDF original</button>}
                          </div>
                        )
                        : hasPdf
                        ? <button className={`mini-btn${started ? ' fill' : ''}`} onClick={() => open(false)}>{started ? 'Continuar' : 'Leer'}</button>
                        : <span className="mini-btn owned" title={`Escríbenos por WhatsApp al ${TRANSFER.whatsapp}`}>Próximamente</span>}
                    </div>
                  )
                })}
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


          {!isOwned(RECON_JUL2026.sku) && (
            <section className="tienda-section rec-new" id="reconstruccion-julio-2026">
              <div className="rec-new__card">
                <Cover src={RECON_JUL2026.cover} alt="Reconstrucción EUNACOM Julio 2026" style={{ width: 150 }} />
                <div className="rec-new__body">
                  <span className="rec-new__kicker">Nuevo · {isReleased(RECON_JUL2026) ? 'ya disponible' : 'llega el 16 de noviembre'}</span>
                  <h2>Reconstrucción EUNACOM Julio 2026</h2>
                  <p className="sub">La última reconstrucción antes de tu examen: el EUNACOM de julio 2026, pregunta por pregunta. <strong>Gratis con cualquier plan</strong>, o suelta por {fmtClp(RECON_JUL2026.price)}.</p>
                  <div className="rec-new__cta">
                    <button className="t-btn" onClick={openPlans}>Obtenerla gratis con un plan</button>
                    {isReleased(RECON_JUL2026)
                      ? <button className={`t-btn ghost ${btnState(RECON_JUL2026.sku)}`} onClick={() => toggle(RECON_JUL2026.sku)}>{btnLabel(RECON_JUL2026.sku, `Comprar suelta · ${fmtClp(RECON_JUL2026.price)}`)}</button>
                      : <span className="mini-btn owned">Suelta {fmtClp(RECON_JUL2026.price)} desde el 16 nov</span>}
                  </div>
                </div>
              </div>
            </section>
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
            <h2>Libros sueltos</h2>
            <p className="sub">{looseSub(looseType)}</p>
            <div className="tienda-chips tienda-chips-type" role="tablist" aria-label="Tipo de libro">
              {LOOSE_TYPES.map(t => (
                <button key={t.id} role="tab" aria-selected={looseType === t.id} className={looseType === t.id ? 'on' : ''} onClick={() => setLooseType(t.id)}>{t.title}</button>
              ))}
            </div>
            {looseType !== 'recons' && (
              <div className="tienda-chips tienda-chips-mod" aria-label="Módulo">
                <button className={module === 'all' ? 'on' : ''} onClick={() => setModule('all')}>Todos</button>
                {MODULES.map(m => <button key={m.id} className={module === m.id ? 'on' : ''} onClick={() => setModule(m.id)}>{SHORT_MODULE[m.id]}</button>)}
              </div>
            )}

            {looseType === 'recons' ? (
              <div className="tomo-grid">
                {RECONS.map(r => (
                  <div key={r.sku} className="tomo-item">
                    <Cover src={r.cover} alt={r.name} />
                    <span className="n">{r.questions} PREGUNTAS</span>
                    <b>{r.name}</b>
                    <div className="tomo-row">
                      <span className="p">{fmtClp(r.price)}</span>
                      <button className={`mini-btn ${btnState(r.sku)}`} onClick={() => toggle(r.sku)} aria-label={`Agregar ${r.name}`}>{isOwned(r.sku) ? 'Tuyo' : btnState(r.sku) ? <Check size={15} strokeWidth={3} /> : '+'}</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="tomo-grid">
                {looseItems(looseType).filter(x => module === 'all' || x.module === module).map(x => (
                  <div key={x.sku} className="tomo-item">
                    <Cover src={x.cover} alt={x.alt} />
                    {x.kicker && <span className="n">{x.kicker}</span>}
                    <b>{x.title}</b>
                    <div className="tomo-row">
                      <span className="p">{fmtClp(x.price)}</span>
                      <button className={`mini-btn ${btnState(x.sku)}`} onClick={() => toggle(x.sku)}>{btnLabel(x.sku, '+ Agregar').replace('En el carro', '').replace('En tu pack', 'Pack').trim() || <Check size={15} strokeWidth={3} />}</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

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
                  <li><i><Check size={13} strokeWidth={3} /></i>1.556 códigos explicados + 19 atlas de imágenes</li>
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
                <div className="anchor-combo" aria-label="Manual y app eunacomapp">
                  <img className="ac-book" src={TOMOS[0].cover} alt="Manual de Cardiología" loading="lazy" />
                  <span className="ac-plus">+</span>
                  <span className="ac-app">
                    <img src="/apple-touch-icon.png" alt="App eunacomapp" loading="lazy" />
                    <b>eunacomapp</b>
                  </span>
                </div>
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
              {PLAN_3M.price > BIBLIOTECA.price
                ? <>Por <b>{fmtClp(PLAN_3M.price - BIBLIOTECA.price)} más</b>, el plan de 3 meses ({fmtClp(PLAN_3M.price)}) incluye la misma biblioteca + clases + preguntas.</>
                : PLAN_3M.price < BIBLIOTECA.price
                  ? <>El plan de 3 meses ({fmtClp(PLAN_3M.price)}) cuesta <b>{fmtClp(BIBLIOTECA.price - PLAN_3M.price)} menos</b> que los libros solos e incluye la misma biblioteca + clases + preguntas.</>
                  : <>Por <b>el mismo precio</b>, el plan de 3 meses ({fmtClp(PLAN_3M.price)}) incluye la misma biblioteca + clases + preguntas.</>}
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

      {reading && (
        <React.Suspense fallback={<div className="gp-back" role="status"><span className="lector-wait">Abriendo el libro…</span></div>}>
          {reading.pdf
            ? <LectorLibro item={reading.item} title={reading.title} initialFileIdx={reading.fileIdx} onClose={() => setReading(null)} />
            : <LectorWeb item={reading.item} title={reading.title} initialFileIdx={reading.fileIdx} initialTopicId={reading.topicId} onClose={() => setReading(null)} />}
        </React.Suspense>
      )}

      {online && <TestOnlineModal target={online} onClose={() => setOnline(null)} />}

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

// Después de pagar sin cuenta: felicitaciones + crear la cuenta con el mismo correo
function GuestPaidModal({ buyer, onRegister, onLogin, onClose }) {
  const names = (buyer.skus || []).map(s => PRODUCTS[s]?.name).filter(Boolean)
  return (
    <div className="gp-back" onClick={onClose}>
      <div className="gp" role="dialog" aria-modal="true" aria-labelledby="gp-title" onClick={e => e.stopPropagation()}>
        <button className="gp-x" onClick={onClose} aria-label="Cerrar"><XIcon size={18} /></button>
        <div className="gp-ok"><CheckCircle2 size={34} /></div>
        <h2 id="gp-title">¡Felicitaciones, ya es tuyo!</h2>
        <p className="gp-sub">Recibimos tu pago. Esto quedó guardado a nombre de <b>{buyer.email}</b>:</p>
        {names.length > 0 && <ul>{names.map(n => <li key={n}>{n}</li>)}</ul>}
        <div className="gp-step"><b>Último paso:</b> crea tu cuenta con <b>ese mismo correo</b> y lo verás al tiro en tu Biblioteca.</div>
        <button className="gp-btn" onClick={onRegister}>Crear mi cuenta</button>
        <button className="gp-link" onClick={onLogin}>Ya tengo cuenta: iniciar sesión</button>
      </div>
    </div>
  )
}

// Reconstrucciones: mismo formato que usa pages/Reconstructions.jsx para el TestRunner
const LETTERS = ['A', 'B', 'C', 'D', 'E']
function reconQuestion(q, examId) {
  const choices = (q.options || q.opciones || []).map((text, i) => ({ id: LETTERS[i] || String(i), text }))
  const rc = q.correctAnswer || q.respuesta_correcta
  let correctAnswer = null
  if (typeof rc === 'string' && /^[A-Ea-e]$/.test(rc)) correctAnswer = rc.toUpperCase()
  else if (typeof rc === 'number' && rc < choices.length) correctAnswer = LETTERS[rc]
  return { id: `${examId}_q${q.id}`, question: q.question || q.pregunta, choices, correctAnswer, explanation: q.explanation || q.explicacion || q.respuesta_texto || '', imageUrl: q.imageUrl || q.image?.src, imageNote: q.image?.nota, imageCredit: q.image?.credit }
}
const parseJson = (v, fb) => { try { return typeof v === 'string' ? JSON.parse(v) : (v ?? fb) } catch { return fb } }

// «Responder en línea»: abre el libro como test en el TestRunner de la app (modo tutor o simulacro),
// igual que pages/LibroGordo.jsx (intentos "lg-<libro>-<uuid>") y pages/Reconstructions.jsx.
function TestOnlineModal({ target, onClose }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [pending, setPending] = useState([]) // intentos en curso de este libro

  const isLg = target.kind === 'lg'
  const mine = t => {
    if (t.status !== 'in_progress') return false
    if (isLg) return String(t.id).startsWith(`lg-${target.book}-`) && !/^lg-[a-z]+-d\d-/.test(String(t.id)) // sin las pruebas por día de Mis clases
    return String(parseJson(t.questions, [])?.[0] || '').startsWith(`${target.exam.id}_q`)
  }
  useEffect(() => {
    let alive = true
    fetchTests(user.id).then(ts => {
      if (!alive) return
      const byMode = {}
      for (const t of (ts || []).filter(mine)) if (!byMode[t.mode] || String(t.created_at) > String(byMode[t.mode].created_at)) byMode[t.mode] = t
      setPending(Object.values(byMode))
    }).catch(() => {})
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadQuestions = async () => {
    if (isLg) {
      const res = await fetchLibroGordoQuestions(target.book, user.id)
      if (res.error) throw new Error(res.error === 'no_access' ? 'Tu cuenta no tiene acceso al test en línea de este libro.' : 'No pudimos cargar las preguntas. Intenta de nuevo en unos minutos.')
      return res.data || []
    }
    const data = await fetch(`/data/reconstrucciones/${target.exam.file}`).then(r => r.json())
    return data.questions.filter(q => !q.excluir && (q.opciones || q.options || []).length >= 2).map(q => reconQuestion(q, target.exam.id))
  }

  const go = async (mode, attempt) => {
    if (busy) return
    setBusy(true); setError(null)
    try {
      const questions = await loadQuestions()
      if (!questions.length) throw new Error('Este libro todavía no tiene preguntas en línea.')
      const timeLimitSeconds = mode === 'exam' ? questions.length * 60 : 0
      const base = { questions, mode, isSimulation: mode === 'exam', returnTo: '/biblioteca', ...(isLg ? {} : { isReconstruction: true, examName: target.exam.name }) }
      if (attempt) {
        navigate('/test-runner', {
          state: {
            ...base, testId: attempt.id,
            timeLimitSeconds: attempt.time_limit_seconds || timeLimitSeconds,
            timeLeftSeconds: attempt.time_left_seconds ?? undefined,
            tutorState: parseJson(attempt.tutor_state, null),
            savedIndex: attempt.current_question_index || 0,
            savedAnswers: parseJson(attempt.answers, {}) || {},
          },
        })
        return
      }
      const testId = isLg ? `lg-${target.book}-${genId()}` : genId()
      await createTest({ id: testId, userId: user.id, mode, timeLimitSeconds, totalQuestions: questions.length, questions: questions.map(q => q.id) })
      navigate('/test-runner', { state: { ...base, testId, timeLimitSeconds } })
    } catch (e) {
      setError(e?.message && !/fetch|JSON|token/i.test(e.message) ? e.message : 'No pudimos abrir el test. Revisa tu conexión e intenta de nuevo.')
      setBusy(false)
    }
  }

  const modeName = m => (m === 'exam' ? 'Simulacro' : 'Tutor')
  return (
    <div className="gp-back" onClick={onClose}>
      <div className="gp ol" role="dialog" aria-modal="true" aria-labelledby="ol-title" onClick={e => e.stopPropagation()}>
        <button className="gp-x" onClick={onClose} aria-label="Cerrar"><XIcon size={18} /></button>
        <span className="ol-kicker">Responder en línea</span>
        <h2 id="ol-title">{target.title}</h2>
        <p className="gp-sub">{target.count} preguntas con su explicación. Tu puntaje queda guardado en tu historial.</p>
        {pending.map(a => (
          <button key={a.id} className="ol-resume" disabled={busy} onClick={() => go(a.mode, a)}>
            <PlayCircle size={18} />
            <span><b>Continuar donde quedaste</b><small>Modo {modeName(a.mode)} · pregunta {(a.current_question_index || 0) + 1}</small></span>
          </button>
        ))}
        <button className="ol-mode" disabled={busy} onClick={() => go('tutor')}>
          <i><GraduationCap size={20} /></i>
          <span><b>Modo Tutor</b><small>Sin límite de tiempo, con la explicación después de cada pregunta.</small></span>
        </button>
        <button className="ol-mode amber" disabled={busy} onClick={() => go('exam')}>
          <i><Clock size={20} /></i>
          <span><b>Modo Simulacro</b><small>Cronometrado ({target.count} minutos). Las explicaciones al final.</small></span>
        </button>
        {busy && <p className="ol-note" role="status">Preparando tus preguntas…</p>}
        {error && <p className="ol-note bad" role="alert">{error}</p>}
      </div>
    </div>
  )
}
