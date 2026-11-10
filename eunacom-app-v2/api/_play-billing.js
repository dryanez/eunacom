// Google Play Billing (Android app).
// - Plans: one auto-renewing subscription "eunacom_premium" with 4 base plans (mensual,
//   trimestral, semestral, anual). Bought in the app → renews through Google Play; on the web
//   plans stay one-time payments. premium_until follows the subscription's expiry, updated on
//   purchase, on app start and by Google's real-time notifications (Pub/Sub push → /api/user-profiles?play_rtdn=SECRET).
// - Books: one-time products that stay owned (see below).
//
// Env: GOOGLE_PLAY_SERVICE_ACCOUNT_JSON — key of a Google Cloud service account that has
// "View financial data" + "Manage orders" in Play Console (Users and permissions).
import crypto from 'node:crypto'

export const PLAY_PACKAGE = 'com.eunacom.app'
export const PLAY_SUBSCRIPTION = 'eunacom_premium'
// base plan id in Play Console → app plan id / months
export const PLAY_BASE_PLANS = { mensual: { planId: '1m', months: 1 }, trimestral: { planId: '3m', months: 3 }, semestral: { planId: '6m', months: 6 }, anual: { planId: '1y', months: 12 } }

let cached = { token: null, exp: 0 }

async function googleToken() {
  if (cached.token && Date.now() < cached.exp - 60_000) return cached.token
  const raw = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON
  if (!raw) return null
  const sa = JSON.parse(raw)
  const now = Math.floor(Date.now() / 1000)
  const b64 = obj => Buffer.from(JSON.stringify(obj)).toString('base64url')
  const unsigned = `${b64({ alg: 'RS256', typ: 'JWT' })}.${b64({
    iss: sa.client_email, scope: 'https://www.googleapis.com/auth/androidpublisher',
    aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600,
  })}`
  const signature = crypto.createSign('RSA-SHA256').update(unsigned).sign(sa.private_key, 'base64url')
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${signature}` }),
  })
  const data = await r.json()
  if (!r.ok) throw new Error(`Google auth failed: ${data.error || r.status}`)
  cached = { token: data.access_token, exp: Date.now() + data.expires_in * 1000 }
  return cached.token
}

const productUrl = (productId, token) =>
  `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PLAY_PACKAGE}/purchases/products/${encodeURIComponent(productId)}/tokens/${encodeURIComponent(token)}`

// Books: each store product is a one-time Play product that stays owned (book_tomo_1,
// book_rec_jul2013, book_biblioteca…). Play ids allow only a-z, 0-9, _ and .
// «De por vida»: compra única de Play (no puede ser suscripción). Debe existir en Play Console → Productos únicos.
export const PLAY_LIFETIME = 'plan_de_por_vida'

// Lifetime plan bought in the Android app → { ok, orderId, acknowledged } like a book
export async function verifyPlayLifetime({ userId, purchaseToken }) {
  return readPurchase({ userId, productId: PLAY_LIFETIME, purchaseToken })
}

export const bookPlayId = sku => 'book_' + sku.toLowerCase().replace(/[^a-z0-9]/g, '_')

// Reads a purchase from Google and checks it belongs to this user and is paid.
// Returns { ok, orderId, consumed, acknowledged } or { ok: false, status, error }
async function readPurchase({ userId, productId, purchaseToken }) {
  const auth = await googleToken()
  if (!auth) return { ok: false, status: 503, error: 'Google Play no configurado' }
  const r = await fetch(productUrl(productId, purchaseToken), { headers: { Authorization: `Bearer ${auth}` } })
  const p = await r.json()
  if (!r.ok) return { ok: false, status: 400, error: 'Compra no encontrada en Google Play' }
  // purchaseState: 0 purchased, 1 canceled, 2 pending. consumptionState 1 = already used.
  if (p.purchaseState !== 0) return { ok: false, status: 402, error: p.purchaseState === 2 ? 'Pago pendiente' : 'Pago cancelado' }
  if (p.obfuscatedExternalAccountId && p.obfuscatedExternalAccountId !== userId) {
    return { ok: false, status: 403, error: 'La compra pertenece a otra cuenta' }
  }
  return { ok: true, orderId: p.orderId || purchaseToken, consumed: p.consumptionState === 1, acknowledged: p.acknowledgementState === 1 }
}

const API = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PLAY_PACKAGE}`

// Reads a subscription. Returns { ok, basePlan, months, expiry, active, acknowledged, linkedToken, userId }
export async function readPlaySubscription(purchaseToken) {
  const auth = await googleToken()
  if (!auth) return { ok: false, status: 503, error: 'Google Play no configurado' }
  const r = await fetch(`${API}/purchases/subscriptionsv2/tokens/${encodeURIComponent(purchaseToken)}`, { headers: { Authorization: `Bearer ${auth}` } })
  const s = await r.json()
  if (!r.ok) return { ok: false, status: 400, error: 'Suscripción no encontrada en Google Play' }
  const item = s.lineItems?.[0] || {}
  const basePlan = item.offerDetails?.basePlanId
  const plan = PLAY_BASE_PLANS[basePlan]
  if (item.productId !== PLAY_SUBSCRIPTION || !plan) return { ok: false, status: 400, error: 'Plan desconocido' }
  // Paid time: active, cancelled-but-not-expired, and grace period still give access
  const active = ['SUBSCRIPTION_STATE_ACTIVE', 'SUBSCRIPTION_STATE_CANCELED', 'SUBSCRIPTION_STATE_IN_GRACE_PERIOD'].includes(s.subscriptionState)
  return {
    ok: true, basePlan, months: plan.months, planId: plan.planId,
    expiry: item.expiryTime ? new Date(item.expiryTime).toISOString() : null,
    active, state: s.subscriptionState,
    acknowledged: s.acknowledgementState === 'ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED',
    linkedToken: s.linkedPurchaseToken || null,
    userId: s.externalAccountIdentifiers?.obfuscatedExternalAccountId || null,
  }
}

export async function acknowledgePlaySubscription(purchaseToken) {
  const auth = await googleToken()
  await fetch(`${API}/purchases/subscriptions/${PLAY_SUBSCRIPTION}/tokens/${encodeURIComponent(purchaseToken)}:acknowledge`, {
    method: 'POST', headers: { Authorization: `Bearer ${auth}`, 'Content-Type': 'application/json' }, body: '{}',
  })
}

// Saves the subscription and moves premium_until to Google's expiry. userId comes from the
// purchase (app) or from our table (renewal notifications). Returns the stored row data.
export async function syncPlaySubscription(db, purchaseToken, claimedUserId = null) {
  const sub = await readPlaySubscription(purchaseToken)
  if (!sub.ok) return sub
  await db.execute({ sql: `CREATE TABLE IF NOT EXISTS play_subscriptions (purchase_token TEXT PRIMARY KEY, user_id TEXT NOT NULL, base_plan TEXT, state TEXT, expiry TEXT, updated_at TEXT DEFAULT (datetime('now')))`, args: [] })
  const known = (await db.execute({ sql: `SELECT user_id FROM play_subscriptions WHERE purchase_token = ? OR purchase_token = ?`, args: [purchaseToken, sub.linkedToken || ''] })).rows?.[0]?.user_id
  const userId = sub.userId || known
  if (!userId) return { ok: false, status: 404, error: 'Suscripción sin usuario' }
  if (claimedUserId && claimedUserId !== userId) return { ok: false, status: 403, error: 'La suscripción pertenece a otra cuenta' }
  await db.execute({
    sql: `INSERT INTO play_subscriptions (purchase_token, user_id, base_plan, state, expiry) VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(purchase_token) DO UPDATE SET base_plan = excluded.base_plan, state = excluded.state, expiry = excluded.expiry, updated_at = datetime('now')`,
    args: [purchaseToken, userId, sub.basePlan, sub.state, sub.expiry],
  })
  if (sub.active && sub.expiry) {
    // Never shorten access the user got some other way (e.g. a longer web plan)
    await db.execute({
      sql: `UPDATE user_profiles SET is_premium = 1, plan_months = MAX(COALESCE(plan_months, 0), ?),
              premium_until = CASE WHEN premium_until IS NULL OR datetime(premium_until) < datetime(?) THEN ? ELSE premium_until END,
              updated_at = datetime('now') WHERE id = ?`,
      args: [sub.months, sub.expiry, sub.expiry, userId],
    })
  }
  if (sub.state === 'SUBSCRIPTION_STATE_REVOKED') {
    // Refunded: end the access this subscription gave (only if it still ends on this subscription's date)
    await db.execute({ sql: `UPDATE user_profiles SET premium_until = datetime('now'), updated_at = datetime('now') WHERE id = ? AND premium_until = ?`, args: [userId, sub.expiry] })
  }
  if (!sub.acknowledged && sub.active) await acknowledgePlaySubscription(purchaseToken).catch(e => console.error('[Play] ack failed', e))
  return { ...sub, ok: true, userId }
}

export async function verifyPlayBook({ userId, productId, purchaseToken, products }) {
  const sku = Object.keys(products).find(s => bookPlayId(s) === productId)
  if (!sku) return { ok: false, status: 400, error: 'Libro desconocido' }
  const v = await readPurchase({ userId, productId, purchaseToken })
  return v.ok ? { ...v, sku } : v
}

// Books stay owned: acknowledge instead of consume (Google refunds unacknowledged purchases after 3 days)
export async function acknowledgePlayPurchase({ productId, purchaseToken }) {
  const auth = await googleToken()
  await fetch(`${productUrl(productId, purchaseToken)}:acknowledge`, {
    method: 'POST', headers: { Authorization: `Bearer ${auth}`, 'Content-Type': 'application/json' }, body: '{}',
  })
}
