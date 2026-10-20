// Tienda de libros + planes de la app — fuente única de precios y reglas (API y cliente).
// src/config/tienda.js re-exporta este archivo. PRECIOS POR CONFIRMAR: cambiarlos solo aquí.

// ── Planes de la app ──────────────────────────────────────────────────────────
// includesLibrary: el plan desbloquea la biblioteca completa en /biblioteca.
export const APP_PLANS = [
  { id: '1m', name: '1 Mes', months: 1, price: 14990, includesLibrary: false, paypal: 'https://www.paypal.com/ncp/payment/KMT3QCWH9M96A' },
  { id: '3m', name: '3 Meses', months: 3, price: 34990, includesLibrary: false, paypal: 'https://www.paypal.com/ncp/payment/FJSVXQV45GHWC' },
  { id: '6m', name: '6 Meses', months: 6, price: 54990, includesLibrary: true, popular: true, paypal: 'https://www.paypal.com/ncp/payment/UE9AAX3JRPS7Y' },
  { id: '1y', name: '1 Año', months: 12, price: 89990, includesLibrary: true, paypal: 'https://www.paypal.com/ncp/payment/XWTMQC3CJ4V9L' },
]
export const LIBRARY_MIN_PLAN_MONTHS = 6 // plan_months >= 6 (incluye founders, 1200) → biblioteca completa

// ── Cupones de planes ─────────────────────────────────────────────────────────
// Solo planes de la app (los packs de libros ya vienen con descuento). No se suman a la promo: gana el mayor.
export const COUPONS = {
  SHORTS20: { percent: 20, label: 'Código de redes SHORTS20' },
}
export function resolveCoupon(code) {
  const key = String(code || '').trim().toUpperCase()
  return COUPONS[key] ? { code: key, ...COUPONS[key] } : null
}

// ── Upgrade libros → plan ─────────────────────────────────────────────────────
export const UPGRADE_CREDIT_DAYS = 7 // lo pagado en libros se descuenta del plan si se pasa dentro de este plazo
export const MIN_CHARGE_CLP = 1000   // piso del cobro en Webpay tras descontar el crédito

// ── Pago de libros ────────────────────────────────────────────────────────────
// TODO(dueño): crear los links de PayPal de cada producto y pegarlos aquí. Mientras sea null,
// el botón de PayPal no aparece para ese producto (sí Webpay y transferencia).
const PAYPAL_PENDIENTE = null

export const TRANSFER = {
  bank: 'BancoEstado', account: 'Cuenta RUT', number: '18.842-443-0', name: 'Felipe Yanez',
  whatsapp: '+1 (929) 360-3799',
}

// ── Catálogo ──────────────────────────────────────────────────────────────────
const COVER = '/tienda/'
export const MODULES = [
  { id: 1, name: 'Medicina Interna', from: 1, to: 10 },
  { id: 2, name: 'Cirugía y especialidades', from: 11, to: 17 },
  { id: 3, name: 'Materno-infantil', from: 18, to: 20 },
  { id: 4, name: 'Salud Pública', from: 21, to: 21 },
]

// file = ruta dentro de books/dist (para entregar el PDF desde R2 más adelante)
const TOMO_LIST = [
  ['Cardiología', 'Modulo_1_Medicina_Interna/Manual_EUNACOM_Cardiologia_Completo_2026.pdf'],
  ['Diabetes Mellitus', 'Modulo_1_Medicina_Interna/Manual_EUNACOM_Diabetes_Completo_2026.pdf'],
  ['Endocrinología', 'Modulo_1_Medicina_Interna/Manual_EUNACOM_Endocrinologia_Completo_2026.pdf'],
  ['Gastroenterología', 'Modulo_1_Medicina_Interna/Manual_EUNACOM_Gastroenterologia_Completo_2026.pdf'],
  ['Hematología', 'Modulo_1_Medicina_Interna/Manual_EUNACOM_Hematologia_Completo_2026.pdf'],
  ['Enfermedades Infecciosas', 'Modulo_1_Medicina_Interna/Manual_EUNACOM_Infectologia_Completo_2026.pdf'],
  ['Nefrología', 'Modulo_1_Medicina_Interna/Manual_EUNACOM_Nefrologia_Completo_2026.pdf'],
  ['Neurología', 'Modulo_1_Medicina_Interna/Manual_EUNACOM_Neurologia_Completo_2026.pdf'],
  ['Enfermedades Respiratorias', 'Modulo_1_Medicina_Interna/Manual_EUNACOM_Respiratorio_Completo_2026.pdf'],
  ['Reumatología', 'Modulo_1_Medicina_Interna/Manual_EUNACOM_Reumatologia_Completo_2026.pdf'],
  ['Cirugía General', 'Modulo_2_Cirugia/Tomo_11_Cirugia_General_Completo_2026.pdf'],
  ['Traumatología', 'Modulo_2_Cirugia/Tomo_12_Traumatologia_Completo_2026.pdf'],
  ['Urología', 'Modulo_2_Cirugia/Tomo_13_Urologia_Completo_2026.pdf'],
  ['Otorrinolaringología', 'Modulo_2_Cirugia/Tomo_14_Otorrinolaringologia_Completo_2026.pdf'],
  ['Oftalmología', 'Modulo_2_Cirugia/Tomo_15_Oftalmologia_Completo_2026.pdf'],
  ['Dermatología', 'Modulo_2_Cirugia/Tomo_16_Dermatologia_Completo_2026.pdf'],
  ['Psiquiatría', 'Modulo_2_Cirugia/Tomo_17_Psiquiatria_Completo_2026.pdf'],
  ['Pediatría', 'Modulo_3_Materno_Infantil/Tomo_18_Pediatria_Completo_2026.pdf'],
  ['Obstetricia', 'Modulo_3_Materno_Infantil/Tomo_19_Obstetricia_Completo_2026.pdf'],
  ['Ginecología', 'Modulo_3_Materno_Infantil/Tomo_20_Ginecologia_Completo_2026.pdf'],
  ['Salud Pública', 'Modulo_4_Salud_Publica/Tomo_21_Salud_Publica_Completo_2026.pdf'],
]

export const TOMOS = TOMO_LIST.map(([name, file], i) => {
  const n = i + 1
  return {
    sku: `tomo-${n}`, n, name, price: 6990, file: `01_Tomos/${file}`,
    module: MODULES.find(m => n >= m.from && n <= m.to).id,
    cover: `${COVER}cov_${String(n).padStart(2, '0')}.jpg`, paypal: PAYPAL_PENDIENTE,
  }
})

const REC_LIST = [
  ['JUL', 2013], ['JUL', 2015], ['JUL', 2016], ['JUL', 2017], ['DIC', 2017], ['JUL', 2018], ['DIC', 2018], ['JUL', 2019],
  ['DIC', 2019], ['AGO', 2021], ['', 2022], ['ENE', 2023], ['JUL', 2024], ['DIC', 2024], ['JUL', 2025], ['DIC', 2025],
]
export const RECONS = REC_LIST.map(([month, year]) => ({
  sku: `rec-${month}${year}`, month, year, name: `Reconstrucción ${month ? month[0] + month.slice(1).toLowerCase() + ' ' : ''}${year}`,
  price: 4990, questions: 180, paypal: PAYPAL_PENDIENTE,
}))

// Libros que solo vienen dentro de los packs
export const EXTRAS = [
  { sku: 'gran-recons', name: 'Gran Libro de Reconstrucciones 2013–2025', cover: `${COVER}q_recons.jpg`, file: '03_Reconstrucciones/El_Gran_Libro_EUNACOM_Reconstrucciones_2013_2025.pdf' },
  { sku: 'gordos', name: 'Gran Libro Gordo + 22 Libros Gordos (90 preguntas por tema)', cover: `${COVER}q_gordo.jpg`, file: '02_Libros_Gordos_90Q/' },
  { sku: 'perfil-v3', name: 'Guía Perfil V3 código por código', cover: `${COVER}q_perfil.jpg`, file: '04_Perfil_V3_Codigo_por_Codigo/Perfil_V3_Codigo_por_Codigo_Completo_2026.pdf' },
]

const ALL_TOMOS = TOMOS.map(t => t.sku)
const ALL_RECS = RECONS.map(r => r.sku)

export const PACKS = [
  {
    sku: 'pack-tomos', name: 'Pack 21 Tomos AEE', price: 29990, desc: 'Toda la teoría del Perfil V3, especialidad por especialidad.',
    covers: [1, 5, 8, 11, 18].map(n => TOMOS[n - 1].cover),
    features: ['Los 21 tomos en PDF (4 módulos)', 'Algoritmos, tablas y perlas EUNACOM', 'Actualizados 2026'],
    includes: ALL_TOMOS, paypal: PAYPAL_PENDIENTE,
  },
  {
    sku: 'biblioteca', name: 'Biblioteca completa', price: 39990, star: true, desc: 'Teoría + todas las preguntas: lo que necesitas para estudiar sin la app.',
    covers: [TOMOS[0].cover, TOMOS[17].cover, EXTRAS[0].cover, EXTRAS[1].cover, TOMOS[18].cover],
    features: ['Los 21 tomos AEE', 'Gran Libro de Reconstrucciones 2013–2025', 'Gran Libro Gordo + 22 Libros Gordos (90 preguntas por tema)', 'Guía Perfil V3 código por código'],
    includes: [...ALL_TOMOS, ...ALL_RECS, 'gran-recons', 'gordos', 'perfil-v3'], paypal: PAYPAL_PENDIENTE,
  },
  {
    sku: 'pack-recons', name: 'Gran Libro de Reconstrucciones', price: 19990, desc: 'Los 16 EUNACOM desde 2013, pregunta por pregunta y con explicación.',
    covers: [EXTRAS[0].cover],
    features: ['2.739 preguntas reales 2013–2025', 'Ordenado por examen y por tema', 'Respuesta y explicación de cada una'],
    includes: [...ALL_RECS, 'gran-recons'], paypal: PAYPAL_PENDIENTE,
  },
]

export const PRODUCTS = Object.fromEntries(
  [...PACKS, ...TOMOS, ...RECONS].map(p => [p.sku, { includes: [p.sku], ...p }])
)
export const LIBRARY_ITEMS = PACKS.find(p => p.sku === 'biblioteca').includes

// Lo que desbloquea una lista de SKUs comprados
export function expandSkus(skus = []) {
  const out = new Set()
  for (const s of skus) for (const i of PRODUCTS[s]?.includes || [s]) out.add(i)
  return out
}

// Valor "suelto" de un producto (para mostrar el ahorro)
export function looseValue(sku) {
  return (PRODUCTS[sku]?.includes || []).reduce((a, i) => a + (PRODUCTS[i]?.price || 0), 0)
}

export function cartTotal(skus = []) {
  return skus.reduce((a, s) => a + (PRODUCTS[s]?.price || 0), 0)
}

export const fmtClp = n => `$${Math.round(n).toLocaleString('es-CL')}`
