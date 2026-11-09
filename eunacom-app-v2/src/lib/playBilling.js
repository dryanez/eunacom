// Google Play Billing for the Android app. Inside Google Play we may only sell plans through
// Play (Google Pay, cards and Play balance appear in Google's own sheet); the server checks
// the purchase with Google and activates the plan (api/_play-billing.js).
import { NativePurchases, PURCHASE_TYPE } from '@capgo/native-purchases'

export const isAndroidApp = () =>
  typeof window !== 'undefined' && window.Capacitor?.getPlatform?.() === 'android'

// Plans in the app = one auto-renewing Play subscription with a base plan per length
// (create in Play Console → Subscriptions; ids must match api/_play-billing.js)
export const PLAY_SUBSCRIPTION = 'eunacom_premium'
export const PLAY_BASE_PLANS = { '1m': 'mensual', '3m': 'trimestral', '6m': 'semestral', '1y': 'anual' }

// Localized prices from Play (e.g. "$14.990"), keyed by app plan id
export async function getPlayPrices() {
  const { products } = await NativePurchases.getProducts({
    productIdentifiers: [PLAY_SUBSCRIPTION],
    productType: PURCHASE_TYPE.SUBS,
  })
  const byBasePlan = Object.fromEntries(products.filter(p => p.planIdentifier).map(p => [p.planIdentifier, p.priceString]))
  return Object.fromEntries(Object.entries(PLAY_BASE_PLANS).map(([plan, base]) => [plan, byBasePlan[base]]))
}

async function post(body) {
  const r = await fetch('/api/user-profiles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(data.error || 'No pudimos confirmar el pago')
  return data
}

export async function buyPlanWithPlay(planId, userId) {
  const tx = await NativePurchases.purchaseProduct({
    productIdentifier: PLAY_SUBSCRIPTION,
    planIdentifier: PLAY_BASE_PLANS[planId],
    productType: PURCHASE_TYPE.SUBS,
    appAccountToken: userId,          // → obfuscatedAccountId, checked by the server
    autoAcknowledgePurchases: false,  // the server acknowledges after activating the plan
  })
  if (!tx?.purchaseToken) throw new Error('Google Play no devolvió la compra')
  return post({ action: 'play_subscription', userId, purchaseToken: tx.purchaseToken })
}

// Manage / cancel the subscription (Google's own page)
export const manageSubscription = () => NativePurchases.manageSubscriptions()

// At app start: re-sync subscriptions (renewal date, or a purchase the server never got) and
// finish book purchases that were paid but not saved (app closed mid-payment, network error)
export async function finishPendingPlayPurchases(userId) {
  const { purchases: subs } = await NativePurchases.getPurchases({ productType: PURCHASE_TYPE.SUBS })
  for (const p of subs || []) {
    if (p.purchaseToken && p.productIdentifier === PLAY_SUBSCRIPTION) {
      await post({ action: 'play_subscription', userId, purchaseToken: p.purchaseToken }).catch(() => {})
    }
  }
  const { purchases: books } = await NativePurchases.getPurchases({ productType: PURCHASE_TYPE.INAPP })
  for (const p of books || []) {
    // Acknowledged = the server already saved it; only retry the unfinished ones
    if (p.purchaseToken && !p.isAcknowledged && p.productIdentifier?.startsWith('book_')) {
      await confirmBookOnServer(userId, p.productIdentifier, p.purchaseToken).catch(() => {})
    }
  }
}

// ── Libros (compra única que queda para siempre) ──────────────────────────────
// Same id rule as api/_play-billing.js: tomo-1 → book_tomo_1, rec-JUL2013 → book_rec_jul2013
export const bookPlayId = sku => 'book_' + sku.toLowerCase().replace(/[^a-z0-9]/g, '_')

export async function getPlayBookPrices(skus) {
  const { products } = await NativePurchases.getProducts({
    productIdentifiers: skus.map(bookPlayId),
    productType: PURCHASE_TYPE.INAPP,
  })
  const byProduct = Object.fromEntries(products.map(p => [p.identifier, p.priceString]))
  return Object.fromEntries(skus.map(s => [s, byProduct[bookPlayId(s)]]))
}

async function confirmBookOnServer(userId, productId, purchaseToken) {
  const r = await fetch('/api/user-profiles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'book_play_purchase', userId, productId, purchaseToken }),
  })
  const data = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(data.error || 'No pudimos confirmar el pago')
  return data
}

export async function buyBookWithPlay(sku, userId) {
  const productId = bookPlayId(sku)
  const tx = await NativePurchases.purchaseProduct({
    productIdentifier: productId,
    productType: PURCHASE_TYPE.INAPP,
    appAccountToken: userId,
    autoAcknowledgePurchases: false, // the server acknowledges after saving the book
  })
  if (!tx?.purchaseToken) throw new Error('Google Play no devolvió la compra')
  return confirmBookOnServer(userId, productId, tx.purchaseToken)
}
