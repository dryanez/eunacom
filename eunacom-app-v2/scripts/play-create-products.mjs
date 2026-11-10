// Creates/updates every Play product for com.eunacom.app through the Android Publisher API:
// books + packs (one-time, ids book_<sku>), «De por vida» (plan_de_por_vida) and the
// eunacom_premium subscription with base plans mensual / trimestral / semestral.
// Usage: node scripts/play-create-products.mjs /path/to/service-account.json [--dry]
import { readFileSync } from 'node:fs'
import { createSign } from 'node:crypto'
import { PRODUCTS, APP_PLANS } from '../api/_tienda.js'

const PKG = 'com.eunacom.app'
const [keyPath, flag] = process.argv.slice(2)
const DRY = flag === '--dry'
const key = JSON.parse(readFileSync(keyPath, 'utf8'))
const API = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PKG}`

async function token() {
  const b64 = o => Buffer.from(JSON.stringify(o)).toString('base64url')
  const now = Math.floor(Date.now() / 1000)
  const head = b64({ alg: 'RS256', typ: 'JWT' })
  const body = b64({ iss: key.client_email, scope: 'https://www.googleapis.com/auth/androidpublisher', aud: key.token_uri, iat: now, exp: now + 3600 })
  const sig = createSign('RSA-SHA256').update(`${head}.${body}`).sign(key.private_key, 'base64url')
  const r = await fetch(key.token_uri, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${head}.${body}.${sig}` })
  const j = await r.json()
  if (!j.access_token) throw new Error('token: ' + JSON.stringify(j))
  return j.access_token
}
const TOKEN = await token()
async function call(method, path, body, tries = 5) {
  for (let i = 1; ; i++) {
    try { return await call1(method, path, body) } catch (e) {
      if (i >= tries || !/→ (429|500|502|503)/.test(e.message)) throw e
      await new Promise(r => setTimeout(r, 2000 * i))
    }
  }
}
async function call1(method, path, body) {
  const r = await fetch(API + path, { method, headers: { authorization: `Bearer ${TOKEN}`, 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined })
  const t = await r.text()
  if (!r.ok) throw new Error(`${method} ${path} → ${r.status} ${t.slice(0, 400)}`)
  return t ? JSON.parse(t) : {}
}
const money = clp => ({ currencyCode: 'CLP', units: String(clp) })
const clean = s => String(s).replace(/\s+/g, ' ').trim()

// Prices for every Play region, converted from the CLP price
let RV = '2022/02'
async function regions(clp) {
  const r = await call('POST', '/pricing:convertRegionPrices', { price: money(clp) })
  if (r.regionVersion?.version) RV = r.regionVersion.version
  const out = r.convertedRegionPrices || {}
  if (out.CL) out.CL = { ...out.CL, price: money(clp) } // Chile: el precio exacto en CLP, sin redondeo de Google
  return out
}

const bookPlayId = sku => 'book_' + sku.toLowerCase().replace(/[^a-z0-9]/g, '_')
const life = APP_PLANS.find(p => p.id === 'life')
const oneTime = [
  ...Object.entries(PRODUCTS).map(([sku, p]) => ({ id: bookPlayId(sku), title: p.name, desc: `Libro digital EUNACOM: ${p.name}. Pago único, tuyo para siempre.`, clp: p.price })),
  { id: 'plan_de_por_vida', title: 'EUNACOM De por vida', desc: 'Acceso completo a EUNACOM App para siempre: clases, preguntas, simulacros y biblioteca.', clp: life.price },
]

const priceCache = {}
const regionsFor = async clp => (priceCache[clp] ||= await regions(clp))

let ok = 0, fail = 0
for (const p of oneTime) {
  const conv = await regionsFor(p.clp)
  const regionalPricingAndAvailabilityConfigs = Object.entries(conv).map(([regionCode, v]) => ({ regionCode, price: v.price, availability: 'AVAILABLE' }))
  const body = {
    packageName: PKG, productId: p.id,
    listings: [{ languageCode: 'es-419', title: clean(p.title).slice(0, 55), description: clean(p.desc).slice(0, 200) }],
    purchaseOptions: [{ purchaseOptionId: 'compra', buyOption: { legacyCompatible: true }, regionalPricingAndAvailabilityConfigs }],
  }
  if (DRY) { console.log('dry', p.id, p.clp, regionalPricingAndAvailabilityConfigs.length, 'regions'); continue }
  try {
    await call('PATCH', `/onetimeproducts/${p.id}?allowMissing=true&updateMask=listings,purchaseOptions&regionsVersion.version=${RV}`, body)
    try { await call('POST', `/oneTimeProducts/${p.id}/purchaseOptions:batchUpdateStates`, { requests: [{ activatePurchaseOptionRequest: { packageName: PKG, productId: p.id, purchaseOptionId: 'compra' } }] }) } catch (e) { if (!/already/i.test(e.message)) throw e }
    ok++; process.stdout.write('.')
  } catch (e) { fail++; console.log('\n✗', p.id, e.message) }
}
console.log(`\none-time: ${ok} ok, ${fail} failed`)

// Subscription
const SUB = 'eunacom_premium'
const basePlans = [['mensual', '1m', 'P1M'], ['trimestral', '3m', 'P3M'], ['semestral', '6m', 'P6M']]
const bp = []
for (const [id, planId, period] of basePlans) {
  const clp = APP_PLANS.find(p => p.id === planId).price
  const conv = await regionsFor(clp)
  bp.push({
    basePlanId: id,
    autoRenewingBasePlanType: { billingPeriodDuration: period, gracePeriodDuration: 'P7D', resubscribeState: 'RESUBSCRIBE_STATE_ACTIVE', prorationMode: 'SUBSCRIPTION_PRORATION_MODE_CHARGE_ON_NEXT_BILLING_DATE', legacyCompatible: id === 'mensual' },
    regionalConfigs: Object.entries(conv).map(([regionCode, v]) => ({ regionCode, newSubscriberAvailability: true, price: v.price })),
  })
}
if (DRY) { console.log('dry sub', bp.map(b => b.basePlanId)); process.exit(0) }
const sub = {
  packageName: PKG, productId: SUB,
  listings: [{ languageCode: 'es-419', title: 'EUNACOM Premium', benefits: ['+650 clases en video', '+47.000 preguntas y simulacros', 'Biblioteca completa (3 y 6 meses)'], description: 'Acceso completo a EUNACOM App mientras tu suscripción esté activa.' }],
  basePlans: bp,
}
try {
  await call('PATCH', `/subscriptions/${SUB}?allowMissing=true&updateMask=listings,basePlans&regionsVersion.version=${RV}`, sub)
  for (const b of bp) {
    try { await call('POST', `/subscriptions/${SUB}/basePlans/${b.basePlanId}:activate`, { packageName: PKG, productId: SUB, basePlanId: b.basePlanId }) } catch (e) { if (!/already|ACTIVE/i.test(e.message)) throw e }
  }
  console.log('subscription ok:', bp.map(b => b.basePlanId).join(', '))
} catch (e) { console.log('✗ subscription', e.message) }
