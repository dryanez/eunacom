import { getTurso } from './_turso.js'

// PayPal Webhook endpoint — receives payment notifications and logs transactions
// Configure this URL in PayPal Developer Dashboard → Webhooks:
//   https://eunacom.vercel.app/api/paypal-webhook
//
// Required env vars (add to Vercel):
//   PAYPAL_WEBHOOK_ID — from PayPal Developer Dashboard
//   PAYPAL_CLIENT_ID — PayPal REST API client ID
//   PAYPAL_CLIENT_SECRET — PayPal REST API client secret
//   PAYPAL_MODE — 'sandbox' or 'live' (default: 'live')

const PAYPAL_MODE = process.env.PAYPAL_MODE || 'live'
const PAYPAL_API = PAYPAL_MODE === 'sandbox'
  ? 'https://api-m.sandbox.paypal.com'
  : 'https://api-m.paypal.com'

// Plan mapping — maps PayPal NCP item names/amounts to internal plan IDs
const PLAN_MAP = {
  'KMT3QCWH9M96A': { id: '1m', months: 1 },
  'FJSVXQV45GHWC': { id: '3m', months: 3 },
  'UE9AAX3JRPS7Y': { id: '6m', months: 6 },
  'XWTMQC3CJ4V9L': { id: '1y', months: 12 },
}

// Fallback: match plan by approximate USD amount
function matchPlanByAmount(amount) {
  const n = parseFloat(amount)
  if (n <= 20) return { id: '1m', months: 1 }
  if (n <= 45) return { id: '3m', months: 3 }
  if (n <= 70) return { id: '6m', months: 6 }
  return { id: '1y', months: 12 }
}

async function ensureTable(db) {
  await db.execute({
    sql: `CREATE TABLE IF NOT EXISTS paypal_transactions (
      transaction_id TEXT PRIMARY KEY,
      payer_name TEXT,
      payer_email TEXT,
      item_name TEXT,
      amount TEXT,
      currency TEXT,
      status TEXT,
      plan_id TEXT,
      plan_months INTEGER,
      user_id TEXT,
      user_email_match TEXT,
      payer_country TEXT,
      payment_date TEXT,
      raw_data TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    args: []
  })
}

async function matchUserByEmail(db, payerEmail) {
  if (!payerEmail) return null
  const result = await db.execute({
    sql: `SELECT id, email FROM user_profiles WHERE LOWER(email) = LOWER(?) LIMIT 1`,
    args: [payerEmail]
  })
  return result.rows?.[0] || null
}

async function activatePremium(db, userId, months) {
  const now = new Date()
  if (months === 12) now.setFullYear(now.getFullYear() + 1)
  else now.setMonth(now.getMonth() + months)
  const premiumUntil = now.toISOString()

  await db.execute({ sql: `ALTER TABLE user_profiles ADD COLUMN is_premium INTEGER DEFAULT 0`, args: [] }).catch(() => {})
  await db.execute({ sql: `ALTER TABLE user_profiles ADD COLUMN premium_until TEXT`, args: [] }).catch(() => {})
  await db.execute({ sql: `ALTER TABLE user_profiles ADD COLUMN plan_months INTEGER`, args: [] }).catch(() => {})

  await db.execute({
    sql: `UPDATE user_profiles SET is_premium = 1, premium_until = ?, plan_months = ?, updated_at = datetime('now') WHERE id = ?`,
    args: [premiumUntil, months, userId]
  })

  return premiumUntil
}

// Verify PayPal webhook signature (optional — requires PAYPAL_WEBHOOK_ID + API credentials)
async function verifyWebhookSignature(req, body) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID
  const clientId = process.env.PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET

  if (!webhookId || !clientId || !clientSecret) {
    console.log('PayPal webhook verification skipped — credentials not configured')
    return true // Skip verification if not configured
  }

  try {
    // Get access token
    const tokenRes = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    })
    const tokenData = await tokenRes.json()

    // Verify signature
    const verifyRes = await fetch(`${PAYPAL_API}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        auth_algo: req.headers['paypal-auth-algo'],
        cert_url: req.headers['paypal-cert-url'],
        transmission_id: req.headers['paypal-transmission-id'],
        transmission_sig: req.headers['paypal-transmission-sig'],
        transmission_time: req.headers['paypal-transmission-time'],
        webhook_id: webhookId,
        webhook_event: body
      })
    })
    const result = await verifyRes.json()
    return result.verification_status === 'SUCCESS'
  } catch (err) {
    console.error('Webhook verification error:', err)
    return false
  }
}

export default async function handler(req, res) {
  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const db = getTurso()

  try {
    await ensureTable(db)

    const event = req.body
    const eventType = event?.event_type || ''

    console.log(`PayPal Webhook received: ${eventType}`, JSON.stringify(event).slice(0, 500))

    // We care about completed payment events
    const paymentEvents = [
      'PAYMENT.CAPTURE.COMPLETED',
      'CHECKOUT.ORDER.APPROVED',
      'PAYMENT.SALE.COMPLETED',
      'CHECKOUT.ORDER.COMPLETED'
    ]

    if (!paymentEvents.includes(eventType)) {
      // Log but don't process non-payment events
      return res.status(200).json({ received: true, msg: `Ignored event: ${eventType}` })
    }

    // Verify webhook signature
    const isValid = await verifyWebhookSignature(req, event)
    if (!isValid) {
      console.error('PayPal webhook signature verification failed')
      return res.status(401).json({ error: 'Invalid webhook signature' })
    }

    // Extract payment data from different event structures
    const resource = event.resource || {}
    let transactionId, payerName, payerEmail, itemName, amount, currency, status, payerCountry, paymentDate

    if (eventType === 'PAYMENT.CAPTURE.COMPLETED' || eventType === 'PAYMENT.SALE.COMPLETED') {
      transactionId = resource.id
      amount = resource.amount?.total || resource.amount?.value
      currency = resource.amount?.currency || resource.amount?.currency_code
      status = resource.state || resource.status || 'COMPLETED'
      payerEmail = resource.payer?.email_address || resource.payer?.payer_info?.email
      payerName = resource.payer?.name
        ? `${resource.payer.name.given_name || ''} ${resource.payer.name.surname || ''}`.trim()
        : resource.payer?.payer_info?.first_name
          ? `${resource.payer.payer_info.first_name} ${resource.payer.payer_info.last_name || ''}`.trim()
          : null
      payerCountry = resource.payer?.address?.country_code || resource.payer?.payer_info?.country_code
      itemName = resource.description || resource.custom || null
      paymentDate = resource.create_time || resource.update_time || new Date().toISOString()
    } else if (eventType.startsWith('CHECKOUT.ORDER')) {
      transactionId = resource.id
      const capture = resource.purchase_units?.[0]?.payments?.captures?.[0]
      amount = capture?.amount?.value || resource.purchase_units?.[0]?.amount?.value
      currency = capture?.amount?.currency_code || resource.purchase_units?.[0]?.amount?.currency_code
      status = resource.status || 'COMPLETED'
      payerEmail = resource.payer?.email_address
      payerName = resource.payer?.name
        ? `${resource.payer.name.given_name || ''} ${resource.payer.name.surname || ''}`.trim()
        : null
      payerCountry = resource.payer?.address?.country_code
      itemName = resource.purchase_units?.[0]?.description || resource.purchase_units?.[0]?.custom_id || null
      paymentDate = resource.create_time || new Date().toISOString()
    }

    if (!transactionId) {
      return res.status(200).json({ received: true, msg: 'No transaction ID found' })
    }

    // Try to determine plan from item name, custom field, or amount
    let plan = null
    const customField = resource.custom_id || resource.custom || resource.purchase_units?.[0]?.custom_id || ''
    
    // Check if custom field contains plan info (e.g., "userId|planId")
    let matchedUserId = null
    if (customField && customField.includes('|')) {
      const parts = customField.split('|')
      matchedUserId = parts[0]
      const planId = parts[1]
      if (planId && PLAN_MAP[planId]) {
        plan = PLAN_MAP[planId]
      }
    }

    // Try matching by NCP payment link reference
    if (!plan) {
      for (const [ref, p] of Object.entries(PLAN_MAP)) {
        if (itemName?.includes(ref) || customField?.includes(ref)) {
          plan = p
          break
        }
      }
    }

    // Fallback: match by amount
    if (!plan && amount) {
      plan = matchPlanByAmount(amount)
    }

    // Try to match user by email if not already matched
    let userMatch = null
    if (!matchedUserId && payerEmail) {
      userMatch = await matchUserByEmail(db, payerEmail)
      if (userMatch) matchedUserId = userMatch.id
    }

    // Store transaction
    await db.execute({
      sql: `INSERT INTO paypal_transactions 
            (transaction_id, payer_name, payer_email, item_name, amount, currency, status, plan_id, plan_months, user_id, user_email_match, payer_country, payment_date, raw_data)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(transaction_id) DO UPDATE SET
              status = excluded.status,
              user_id = COALESCE(excluded.user_id, paypal_transactions.user_id),
              raw_data = excluded.raw_data`,
      args: [
        transactionId,
        payerName || null,
        payerEmail || null,
        itemName || null,
        amount || null,
        currency || null,
        status || null,
        plan?.id || null,
        plan?.months || null,
        matchedUserId || null,
        userMatch ? 'auto' : (matchedUserId ? 'custom' : null),
        payerCountry || null,
        paymentDate || null,
        JSON.stringify(event)
      ]
    })

    // Auto-activate premium if user was matched
    if (matchedUserId && plan) {
      const premiumUntil = await activatePremium(db, matchedUserId, plan.months)
      console.log(`PayPal auto-activated premium for user ${matchedUserId}: ${plan.id} until ${premiumUntil}`)
    } else {
      console.log(`PayPal transaction ${transactionId} logged — user not matched (email: ${payerEmail})`)
    }

    return res.status(200).json({
      received: true,
      transaction_id: transactionId,
      user_matched: !!matchedUserId,
      plan: plan?.id || null
    })

  } catch (err) {
    console.error('PayPal webhook error:', err)
    // Always return 200 to PayPal to prevent retries on our errors
    return res.status(200).json({ received: true, error: err.message })
  }
}
