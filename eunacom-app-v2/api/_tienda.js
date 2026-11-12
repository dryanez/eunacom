// Tienda de libros + planes de la app — fuente única de precios y reglas (API y cliente).
// src/config/tienda.js re-exporta este archivo. PRECIOS POR CONFIRMAR: cambiarlos solo aquí.

// ── Planes de la app ──────────────────────────────────────────────────────────
// includesLibrary: el plan desbloquea la biblioteca completa en /biblioteca.
// Planes a la venta desde nov-2026 (informe auditoria-2026-11/precios): 1 mes, 3 meses con libros y de por vida.
// 6m y 1y quedan `hidden`: ya no se venden, pero el checkout y los webhooks los reconocen (pagos y links antiguos).
export const LIFETIME_MONTHS = 1200 // plan_months de «De por vida» (y de los founders)
export const APP_PLANS = [
  { id: '1m', name: '1 Mes', months: 1, price: 29990, includesLibrary: false, tagline: 'La recta final antes del examen', paypal: null },
  { id: '3m', name: '3 Meses', months: 3, price: 55990, includesLibrary: true, tagline: 'Prepárate para este EUNACOM', paypal: null },
  { id: '6m', name: '6 Meses', months: 6, price: 75990, includesLibrary: true, popular: true, tagline: 'Dos convocatorias con tiempo de sobra', paypal: null },
  { id: 'life', name: 'De por vida', months: LIFETIME_MONTHS, price: 129990, includesLibrary: true, lifetime: true, tagline: 'Hasta que apruebes, sin volver a pagar', paypal: null },
  { id: '1y', name: '1 Año', months: 12, price: 89990, includesLibrary: true, hidden: true, paypal: 'https://www.paypal.com/ncp/payment/XWTMQC3CJ4V9L' },
]
export const SALE_PLANS = APP_PLANS.filter(p => !p.hidden)
export const LIBRARY_MIN_PLAN_MONTHS = 3 // plan_months >= 3 (3 meses, de por vida, founders 1200) → biblioteca completa

// ── Cupones de planes ─────────────────────────────────────────────────────────
// Solo planes de la app (los packs de libros ya vienen con descuento). No se suman a la promo: gana el mayor.
export const COUPONS = {
  SHORTS20: { percent: 20, label: 'Código de redes SHORTS20' },
  LIBROGORDO20: { percent: 20, label: 'Descuento Libro Gordo online' }, // upsell al terminar un Libro Gordo (src/components/LibroGordoUpsell.jsx)
}
export function resolveCoupon(code) {
  const key = String(code || '').trim().toUpperCase()
  return COUPONS[key] ? { code: key, ...COUPONS[key] } : null
}

// ── Upgrade libros → plan ─────────────────────────────────────────────────────
export const UPGRADE_CREDIT_DAYS = 7 // lo pagado en libros se descuenta del plan si se pasa dentro de este plazo
// Solo los planes que traen la biblioteca (6 meses y 1 año) reciben el crédito
export const creditApplies = planId => !!APP_PLANS.find(p => p.id === planId)?.includesLibrary
export const MIN_CHARGE_CLP = 1000   // piso del cobro en Webpay tras descontar el crédito

// ── Pago de libros ────────────────────────────────────────────────────────────
// Mercado Pago cobra en CLP. PayPal (y Apple Pay / Google Pay dentro de PayPal) cobra en USD:
// precio CLP / CLP_PER_USD, redondeado hacia arriba a .99
export const CLP_PER_USD = 920
export const usdPrice = clp => Math.max(0.99, Math.ceil(clp / CLP_PER_USD) - 0.01)

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
    cover: `${COVER}cov_${String(n).padStart(2, '0')}.jpg`,
  }
})

const REC_LIST = [
  ['JUL', 2013], ['JUL', 2015], ['JUL', 2016], ['JUL', 2017], ['DIC', 2017], ['JUL', 2018], ['DIC', 2018], ['JUL', 2019],
  ['DIC', 2019], ['AGO', 2021], ['', 2022], ['ENE', 2023], ['JUL', 2024], ['DIC', 2024], ['JUL', 2025], ['DIC', 2025],
]
const REC_MES = { ENE: 'Enero', JUL: 'Julio', AGO: 'Agosto', DIC: 'Diciembre' }
export const RECONS = REC_LIST.map(([month, year]) => ({
  sku: `rec-${month}${year}`, month, year, name: `Reconstrucción ${REC_MES[month] || 'Diciembre'} ${year}`,
  price: 4990, questions: 180, cover: `${COVER}rec_${month}${year}.jpg`,
  // PDF por examen: books/scripts/build_reconstrucciones_por_examen.cjs (publishing hub) → libros/03_Reconstrucciones/
  file: `03_Reconstrucciones/Reconstruccion_EUNACOM_${REC_MES[month] || 'Diciembre'}_${year}.pdf`,
}))

// Reconstrucción Julio 2026 (enviada por Mario Sánchez). Libro aparte, NO entra en el Gran Libro ni en la Biblioteca:
// se vende suelto a $12.999 y viene GRATIS con cualquier suscripción activa. Se compra desde el 16-nov-2026 (hora Chile).
export const RECON_JUL2026 = {
  sku: 'rec-JUL2026', month: 'JUL', year: 2026, name: 'Reconstrucción Julio 2026', price: 12999, questions: 180, cover: `${COVER}rec_JUL2026.jpg`,
  releaseDate: '2026-11-16', freeWithPlan: true, isNew: true,
  file: '03_Reconstrucciones/Reconstruccion_EUNACOM_Julio_2026.pdf', // TODO(entrega): subir el PDF a R2 libros/<ruta> antes del 16-nov
}
export const isReleased = (p, now = Date.now()) => !p?.releaseDate || now >= Date.parse(`${p.releaseDate}T00:00:00-03:00`)
// Ítems que trae cualquier plan activo (aunque no incluya la biblioteca)
export const PLAN_FREE_ITEMS = [RECON_JUL2026.sku]

// Libros que solo vienen dentro de los packs
export const EXTRAS = [
  { sku: 'gran-recons', name: 'Gran Libro de Reconstrucciones 2013–2025', cover: `${COVER}q_recons.jpg`, file: '03_Reconstrucciones/El_Gran_Libro_EUNACOM_Reconstrucciones_2013_2025.pdf' },
  {
    sku: 'gordos', name: 'Gran Libro Gordo + 22 Libros Gordos (90 preguntas por tema)', cover: `${COVER}q_gordo.jpg`,
    files: [
      ['Gran Libro Gordo (1.890 preguntas)', 'El_Gran_Libro_Gordo_EUNACOM_1890Q_Actualizado.pdf'],
      ['Módulo 1 ponderado', 'Libro_Gordo_EUNACOM_Modulo_1_Ponderado_90Q.pdf'],
      ...['Cardiologia', 'Cirugia', 'Dermatologia', 'Diabetes', 'Endocrinologia', 'Gastroenterologia', 'Ginecologia', 'Hematologia',
        'Infectologia', 'Nefrologia', 'Neurologia', 'Obstetricia', 'Oftalmologia', 'Otorrinolaringologia', 'Pediatria', 'Psiquiatria',
        'Respiratorio', 'Reumatologia', 'SaludPublica', 'Traumatologia', 'Urologia'].map(e => [e.replace('SaludPublica', 'Salud Pública'), `Libro_Gordo_${e}_90Q.pdf`]),
    ].map(([label, f]) => ({ label, file: `02_Libros_Gordos_90Q/${f}` })),
  },
  {
    sku: 'perfil-v3', name: 'Perfil V3 código por código: los 1.569 códigos explicados', cover: `${COVER}q_perfil.jpg`,
    files: [
      { label: 'Perfil V3 completo (1.569 códigos)', file: '04_Perfil_V3_Codigo_por_Codigo/Perfil_V3_Codigo_por_Codigo_Completo_2026.pdf' },
      { label: 'Cardiología', file: '04_Perfil_V3_Codigo_por_Codigo/Perfil_V3_Codigo_por_Codigo_Cardiología.pdf' },
      { label: 'Cirugía General y Anestesia', file: '04_Perfil_V3_Codigo_por_Codigo/Perfil_V3_Codigo_por_Codigo_Cirugía_General_y_Anestesia.pdf' },
      { label: 'Dermatología', file: '04_Perfil_V3_Codigo_por_Codigo/Perfil_V3_Codigo_por_Codigo_Dermatología.pdf' },
      { label: 'Diabetes y Nutrición', file: '04_Perfil_V3_Codigo_por_Codigo/Perfil_V3_Codigo_por_Codigo_Diabetes_y_Nutrición.pdf' },
      { label: 'Endocrinología', file: '04_Perfil_V3_Codigo_por_Codigo/Perfil_V3_Codigo_por_Codigo_Endocrinología.pdf' },
      { label: 'Enfermedades Infecciosas', file: '04_Perfil_V3_Codigo_por_Codigo/Perfil_V3_Codigo_por_Codigo_Enfermedades_Infecciosas.pdf' },
      { label: 'Enfermedades Respiratorias', file: '04_Perfil_V3_Codigo_por_Codigo/Perfil_V3_Codigo_por_Codigo_Enfermedades_Respiratorias.pdf' },
      { label: 'Gastroenterología', file: '04_Perfil_V3_Codigo_por_Codigo/Perfil_V3_Codigo_por_Codigo_Gastroenterología.pdf' },
      { label: 'Geriatría', file: '04_Perfil_V3_Codigo_por_Codigo/Perfil_V3_Codigo_por_Codigo_Geriatría.pdf' },
      { label: 'Hemato-oncología', file: '04_Perfil_V3_Codigo_por_Codigo/Perfil_V3_Codigo_por_Codigo_Hemato-oncología.pdf' },
      { label: 'Nefrología', file: '04_Perfil_V3_Codigo_por_Codigo/Perfil_V3_Codigo_por_Codigo_Nefrología.pdf' },
      { label: 'Neurología', file: '04_Perfil_V3_Codigo_por_Codigo/Perfil_V3_Codigo_por_Codigo_Neurología.pdf' },
      { label: 'Obstetricia y Ginecología', file: '04_Perfil_V3_Codigo_por_Codigo/Perfil_V3_Codigo_por_Codigo_Obstetricia_y_Ginecología.pdf' },
      { label: 'Oftalmología', file: '04_Perfil_V3_Codigo_por_Codigo/Perfil_V3_Codigo_por_Codigo_Oftalmología.pdf' },
      { label: 'Otorrinolaringología', file: '04_Perfil_V3_Codigo_por_Codigo/Perfil_V3_Codigo_por_Codigo_Otorrinolaringología.pdf' },
      { label: 'Pediatría', file: '04_Perfil_V3_Codigo_por_Codigo/Perfil_V3_Codigo_por_Codigo_Pediatría.pdf' },
      { label: 'Psiquiatría', file: '04_Perfil_V3_Codigo_por_Codigo/Perfil_V3_Codigo_por_Codigo_Psiquiatría.pdf' },
      { label: 'Reumatología', file: '04_Perfil_V3_Codigo_por_Codigo/Perfil_V3_Codigo_por_Codigo_Reumatología.pdf' },
      { label: 'Salud Pública', file: '04_Perfil_V3_Codigo_por_Codigo/Perfil_V3_Codigo_por_Codigo_Salud_Pública.pdf' },
      { label: 'Traumatología', file: '04_Perfil_V3_Codigo_por_Codigo/Perfil_V3_Codigo_por_Codigo_Traumatología.pdf' },
      { label: 'Urología', file: '04_Perfil_V3_Codigo_por_Codigo/Perfil_V3_Codigo_por_Codigo_Urología.pdf' },
      { label: 'Preguntas de práctica', file: '04_Perfil_V3_Codigo_por_Codigo/Preguntas_de_Practica_Perfil_V3.pdf' },
    ],
  },
  {
    sku: 'repasos', name: 'Repaso Final: 21 libros de repaso, uno por especialidad', cover: `${COVER}q_repaso.jpg`,
    files: [
      { label: 'Cardiología', file: '05_Repaso_Final/Repaso_Final_Cardiologia_2026.pdf' },
      { label: 'Cirugía', file: '05_Repaso_Final/Repaso_Final_Cirugia_2026.pdf' },
      { label: 'Dermatología', file: '05_Repaso_Final/Repaso_Final_Dermatologia_2026.pdf' },
      { label: 'Diabetes', file: '05_Repaso_Final/Repaso_Final_Diabetes_2026.pdf' },
      { label: 'Endocrinología', file: '05_Repaso_Final/Repaso_Final_Endocrinologia_2026.pdf' },
      { label: 'Gastroenterología', file: '05_Repaso_Final/Repaso_Final_Gastroenterologia_2026.pdf' },
      { label: 'Ginecología', file: '05_Repaso_Final/Repaso_Final_Ginecologia_2026.pdf' },
      { label: 'Hematología', file: '05_Repaso_Final/Repaso_Final_Hematologia_2026.pdf' },
      { label: 'Infectología', file: '05_Repaso_Final/Repaso_Final_Infectologia_2026.pdf' },
      { label: 'Nefrología', file: '05_Repaso_Final/Repaso_Final_Nefrologia_2026.pdf' },
      { label: 'Neurología', file: '05_Repaso_Final/Repaso_Final_Neurologia_2026.pdf' },
      { label: 'Obstetricia', file: '05_Repaso_Final/Repaso_Final_Obstetricia_2026.pdf' },
      { label: 'Oftalmología', file: '05_Repaso_Final/Repaso_Final_Oftalmologia_2026.pdf' },
      { label: 'Otorrinolaringología', file: '05_Repaso_Final/Repaso_Final_Otorrinolaringologia_2026.pdf' },
      { label: 'Pediatría', file: '05_Repaso_Final/Repaso_Final_Pediatria_2026.pdf' },
      { label: 'Psiquiatría', file: '05_Repaso_Final/Repaso_Final_Psiquiatria_2026.pdf' },
      { label: 'Respiratorio', file: '05_Repaso_Final/Repaso_Final_Respiratorio_2026.pdf' },
      { label: 'Reumatología', file: '05_Repaso_Final/Repaso_Final_Reumatologia_2026.pdf' },
      { label: 'Salud Pública', file: '05_Repaso_Final/Repaso_Final_SaludPublica_2026.pdf' },
      { label: 'Traumatología', file: '05_Repaso_Final/Repaso_Final_Traumatologia_2026.pdf' },
      { label: 'Urología', file: '05_Repaso_Final/Repaso_Final_Urologia_2026.pdf' },
    ],
  },
  {
    sku: 'atlas', name: 'Atlas de Imágenes: 19 atlas, uno por especialidad (1.144 imágenes comentadas)', cover: `${COVER}q_atlas.jpg`,
    files: [
      { label: 'Cardiología', file: '06_Atlas/Atlas_Imagenes_Cardiologia_2026.pdf' },
      { label: 'Cirugía', file: '06_Atlas/Atlas_Imagenes_Cirugia_2026.pdf' },
      { label: 'Dermatología', file: '06_Atlas/Atlas_Imagenes_Dermatologia_2026.pdf' },
      { label: 'Diabetes', file: '06_Atlas/Atlas_Imagenes_Diabetes_2026.pdf' },
      { label: 'Endocrinología', file: '06_Atlas/Atlas_Imagenes_Endocrinologia_2026.pdf' },
      { label: 'Gastroenterología', file: '06_Atlas/Atlas_Imagenes_Gastroenterologia_2026.pdf' },
      { label: 'Ginecología', file: '06_Atlas/Atlas_Imagenes_Ginecologia_2026.pdf' },
      { label: 'Hematología', file: '06_Atlas/Atlas_Imagenes_Hematologia_2026.pdf' },
      { label: 'Infectología', file: '06_Atlas/Atlas_Imagenes_Infectologia_2026.pdf' },
      { label: 'Nefrología', file: '06_Atlas/Atlas_Imagenes_Nefrologia_2026.pdf' },
      { label: 'Neurología', file: '06_Atlas/Atlas_Imagenes_Neurologia_2026.pdf' },
      { label: 'Obstetricia', file: '06_Atlas/Atlas_Imagenes_Obstetricia_2026.pdf' },
      { label: 'Oftalmología', file: '06_Atlas/Atlas_Imagenes_Oftalmologia_2026.pdf' },
      { label: 'Otorrinolaringología', file: '06_Atlas/Atlas_Imagenes_Otorrinolaringologia_2026.pdf' },
      { label: 'Pediatría', file: '06_Atlas/Atlas_Imagenes_Pediatria_2026.pdf' },
      { label: 'Respiratorio', file: '06_Atlas/Atlas_Imagenes_Respiratorio_2026.pdf' },
      { label: 'Reumatología', file: '06_Atlas/Atlas_Imagenes_Reumatologia_2026.pdf' },
      { label: 'Traumatología', file: '06_Atlas/Atlas_Imagenes_Traumatologia_2026.pdf' },
      { label: 'Urología', file: '06_Atlas/Atlas_Imagenes_Urologia_2026.pdf' },
    ],
  },
]

const ALL_TOMOS = TOMOS.map(t => t.sku)
const ALL_RECS = RECONS.map(r => r.sku)

// Cada archivo de las colecciones (Libros Gordos, Repaso Final, Atlas, Perfil V3) también se vende suelto.
// sku `<prefix>-<slug>`; los libros grandes (Gran Libro Gordo, Perfil V3 completo) a BIG_PRICE.
const SINGLE_PRICE = 4990
const BIG_PRICE = 14990
const COLLECTION_PACK_PRICE = 14990
const slug = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const ACCENT = { Cardiologia: 'Cardiología', Cirugia: 'Cirugía', Dermatologia: 'Dermatología', Endocrinologia: 'Endocrinología', Gastroenterologia: 'Gastroenterología', Ginecologia: 'Ginecología', Hematologia: 'Hematología', Infectologia: 'Infectología', Nefrologia: 'Nefrología', Neurologia: 'Neurología', Oftalmologia: 'Oftalmología', Otorrinolaringologia: 'Otorrinolaringología', Pediatria: 'Pediatría', Psiquiatria: 'Psiquiatría', Reumatologia: 'Reumatología', Traumatologia: 'Traumatología', Urologia: 'Urología' }
export const COLLECTIONS = [
  { sku: 'gordos', prefix: 'gordo', title: 'Libro Gordo', section: 'Libros Gordos', sub: '90 preguntas por tema, con respuesta y explicación.' },
  { sku: 'repasos', prefix: 'repaso', title: 'Repaso Final', section: 'Repaso Final', sub: 'Lo esencial de cada especialidad para la última semana.' },
  { sku: 'atlas', prefix: 'atlas', title: 'Atlas de Imágenes', section: 'Atlas de Imágenes', sub: 'Imágenes comentadas de cada especialidad.' },
  { sku: 'perfil-v3', prefix: 'perfil', title: 'Perfil V3', section: 'Perfil V3 código por código', sub: 'Cada código del Perfil V3 explicado, por especialidad.' },
].map(c => ({ ...c, cover: EXTRAS.find(x => x.sku === c.sku).cover }))
export const SINGLES = COLLECTIONS.flatMap(c => EXTRAS.find(x => x.sku === c.sku).files.map(f => {
  const label = ACCENT[f.label] || f.label
  const big = /gran libro|completo/i.test(label)
  return { sku: `${c.prefix}-${slug(f.label.replace(/\s*\(.*\)/, ''))}`, collection: c.sku, label, name: big ? label : `${c.title} · ${label}`, price: big ? BIG_PRICE : SINGLE_PRICE, file: f.file }
}))
const singlesOf = col => SINGLES.filter(s => s.collection === col).map(s => s.sku)
const COLLECTION_PACKS = [
  { sku: 'pack-gordos', col: 'gordos', name: 'Pack Libros Gordos', desc: 'El Gran Libro Gordo + los 22 Libros Gordos por tema.', features: ['Gran Libro Gordo (1.890 preguntas)', '22 libros de 90 preguntas por tema', 'Respuesta y explicación de cada pregunta'] },
  { sku: 'pack-repasos', col: 'repasos', name: 'Pack 21 Repaso Final', desc: 'Un libro de repaso por especialidad, para la recta final.', features: ['21 libros, uno por especialidad', 'Lo que más se pregunta', 'Actualizados 2026'] },
  { sku: 'pack-atlas', col: 'atlas', name: 'Pack 19 Atlas de Imágenes', desc: '1.144 imágenes comentadas, un atlas por especialidad.', features: ['19 atlas, uno por especialidad', '1.144 imágenes comentadas', 'Para reconocer lo que sale en el examen'] },
  { sku: 'pack-perfil', col: 'perfil-v3', name: 'Pack Perfil V3 código por código', desc: 'Los 1.569 códigos del Perfil V3 explicados.', features: ['Perfil V3 completo', 'Un libro por especialidad', 'Preguntas de práctica'] },
].map(({ col, ...p }) => ({ ...p, price: COLLECTION_PACK_PRICE, covers: [EXTRAS.find(x => x.sku === col).cover], includes: [col, ...singlesOf(col)] }))

export const PACKS = [
  {
    sku: 'pack-tomos', name: 'Pack 21 Tomos AEE', price: 29990, desc: 'Toda la teoría del Perfil V3, especialidad por especialidad.',
    covers: [1, 5, 8, 11, 18].map(n => TOMOS[n - 1].cover),
    features: ['Los 21 tomos (4 módulos), para leer en la app', 'Algoritmos, tablas y perlas EUNACOM', 'Actualizados 2026'],
    includes: ALL_TOMOS,
  },
  {
    sku: 'biblioteca', name: 'Biblioteca completa', price: 39990, star: true, desc: 'Teoría + todas las preguntas: lo que necesitas para estudiar sin la app.',
    covers: [TOMOS[0].cover, EXTRAS[3].cover, EXTRAS[0].cover, EXTRAS[1].cover, EXTRAS[2].cover, EXTRAS[4].cover],
    features: ['Los 21 tomos AEE', 'Gran Libro de Reconstrucciones 2013–2025', 'Gran Libro Gordo + 22 Libros Gordos (90 preguntas por tema)', '21 libros Repaso Final, uno por especialidad', 'Perfil V3: los 1.569 códigos explicados', '19 Atlas de Imágenes, uno por especialidad'],
    includes: [...ALL_TOMOS, ...ALL_RECS, 'gran-recons', 'gordos', 'perfil-v3', 'repasos', 'atlas', ...SINGLES.map(x => x.sku)],
  },
  {
    sku: 'pack-recons', name: 'Gran Libro de Reconstrucciones', price: 19990, desc: 'Los 16 EUNACOM desde 2013, pregunta por pregunta y con explicación.',
    covers: [EXTRAS[0].cover],
    features: ['2.739 preguntas reales 2013–2025', 'Ordenado por examen y por tema', 'Respuesta y explicación de cada una'],
    includes: [...ALL_RECS, 'gran-recons'],
  },
  ...COLLECTION_PACKS,
]

export const PRODUCTS = Object.fromEntries(
  [...PACKS, ...TOMOS, ...RECONS, RECON_JUL2026, ...SINGLES].map(p => [p.sku, { includes: [p.sku], ...p }])
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

// Archivos legibles de un ítem desbloqueado (ruta dentro de books/dist; en producción, clave `libros/<ruta>` en R2)
export function itemFiles(item) {
  const x = TOMOS.find(t => t.sku === item) || EXTRAS.find(t => t.sku === item) || RECONS.find(t => t.sku === item) || (item === RECON_JUL2026.sku && RECON_JUL2026) || SINGLES.find(t => t.sku === item)
  if (!x) return []
  if (x.files) return x.files
  return x.file ? [{ label: x.label || x.name, file: x.file }] : []
}
