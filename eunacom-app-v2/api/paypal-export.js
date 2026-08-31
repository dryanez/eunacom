import { getTurso } from './_turso.js'

// GET  /api/paypal-export?adminEmail=xxx         → export transactions as JSON
// GET  /api/paypal-export?adminEmail=xxx&format=csv → export as CSV
// POST /api/paypal-export                         → PayPal webhook receiver (merged from paypal-webhook.js)

const PAYPAL_MODE = process.env.PAYPAL_MODE || 'live'
const PAYPAL_API = PAYPAL_MODE === 'sandbox'
  ? 'https://api-m.sandbox.paypal.com'
  : 'https://api-m.paypal.com'

const PLAN_MAP = {
  'KMT3QCWH9M96A': { id: '1m', months: 1 },
  'FJSVXQV45GHWC': { id: '3m', months: 3 },
  'UE9AAX3JRPS7Y': { id: '6m', months: 6 },
  'XWTMQC3CJ4V9L': { id: '1y', months: 12 },
}

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

async function verifyWebhookSignature(req, body) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID
  const clientId = process.env.PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET
  if (!webhookId || !clientId || !clientSecret) return true
  try {
    const tokenRes = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    })
    const tokenData = await tokenRes.json()
    const verifyRes = await fetch(`${PAYPAL_API}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tokenData.access_token}`, 'Content-Type': 'application/json' },
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
  const db = getTurso()

  // ── POST: PayPal Webhook (merged from paypal-webhook.js) ─────────────────
  if (req.method === 'POST') {
    try {
      await ensureTable(db)
      const event = req.body
      const eventType = event?.event_type || ''
      const paymentEvents = ['PAYMENT.CAPTURE.COMPLETED','CHECKOUT.ORDER.APPROVED','PAYMENT.SALE.COMPLETED','CHECKOUT.ORDER.COMPLETED']
      if (!paymentEvents.includes(eventType)) {
        return res.status(200).json({ received: true, msg: `Ignored event: ${eventType}` })
      }
      const isValid = await verifyWebhookSignature(req, event)
      if (!isValid) return res.status(401).json({ error: 'Invalid webhook signature' })

      const resource = event.resource || {}
      let transactionId, payerName, payerEmail, itemName, amount, currency, status, payerCountry, paymentDate

      if (eventType === 'PAYMENT.CAPTURE.COMPLETED' || eventType === 'PAYMENT.SALE.COMPLETED') {
        transactionId = resource.id
        amount = resource.amount?.total || resource.amount?.value
        currency = resource.amount?.currency || resource.amount?.currency_code
        status = resource.state || resource.status || 'COMPLETED'
        payerEmail = resource.payer?.email_address || resource.payer?.payer_info?.email
        payerName = resource.payer?.name ? `${resource.payer.name.given_name || ''} ${resource.payer.name.surname || ''}`.trim() : null
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
        payerName = resource.payer?.name ? `${resource.payer.name.given_name || ''} ${resource.payer.name.surname || ''}`.trim() : null
        payerCountry = resource.payer?.address?.country_code
        itemName = resource.purchase_units?.[0]?.description || resource.purchase_units?.[0]?.custom_id || null
        paymentDate = resource.create_time || new Date().toISOString()
      }

      if (!transactionId) return res.status(200).json({ received: true, msg: 'No transaction ID found' })

      let plan = null
      const customField = resource.custom_id || resource.custom || resource.purchase_units?.[0]?.custom_id || ''
      let matchedUserId = null
      if (customField && customField.includes('|')) {
        const parts = customField.split('|')
        matchedUserId = parts[0]
        const planId = parts[1]
        if (planId && PLAN_MAP[planId]) plan = PLAN_MAP[planId]
      }
      if (!plan) {
        for (const [ref, p] of Object.entries(PLAN_MAP)) {
          if (itemName?.includes(ref) || customField?.includes(ref)) { plan = p; break }
        }
      }
      if (!plan && amount) plan = matchPlanByAmount(amount)

      let userMatch = null
      if (!matchedUserId && payerEmail) {
        userMatch = await matchUserByEmail(db, payerEmail)
        if (userMatch) matchedUserId = userMatch.id
      }

      await db.execute({
        sql: `INSERT INTO paypal_transactions
              (transaction_id, payer_name, payer_email, item_name, amount, currency, status, plan_id, plan_months, user_id, user_email_match, payer_country, payment_date, raw_data)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(transaction_id) DO UPDATE SET
                status = excluded.status,
                user_id = COALESCE(excluded.user_id, paypal_transactions.user_id),
                raw_data = excluded.raw_data`,
        args: [transactionId, payerName||null, payerEmail||null, itemName||null, amount||null, currency||null, status||null, plan?.id||null, plan?.months||null, matchedUserId||null, userMatch?'auto':(matchedUserId?'custom':null), payerCountry||null, paymentDate||null, JSON.stringify(event)]
      })

      if (matchedUserId && plan) {
        const premiumUntil = await activatePremium(db, matchedUserId, plan.months)
        console.log(`PayPal auto-activated premium for user ${matchedUserId}: ${plan.id} until ${premiumUntil}`)
      }

      return res.status(200).json({ received: true, transaction_id: transactionId, user_matched: !!matchedUserId, plan: plan?.id || null })
    } catch (err) {
      console.error('PayPal webhook error:', err)
      return res.status(200).json({ received: true, error: err.message })
    }
  }

  // ── GET: Admin Export ────────────────────────────────────────────────────
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { adminEmail, format } = req.query
  const isDev = process.env.NODE_ENV !== 'production'
  if (!isDev && adminEmail !== 'dr.felipeyanez@gmail.com') return res.status(403).json({ error: 'Forbidden' })

  try {
    await ensureTable(db)

    const result = await db.execute({
      sql: `SELECT pt.*, up.first_name as profile_first_name, up.last_name as profile_last_name,
              up.email as profile_email, up.country as profile_country, up.whatsapp as profile_whatsapp,
              up.is_premium, up.premium_until
            FROM paypal_transactions pt
            LEFT JOIN user_profiles up ON pt.user_id = up.id
            ORDER BY pt.created_at DESC`,
      args: []
    })

    const transactions = result.rows.map(row => ({
      transaction_id: row.transaction_id, payer_name: row.payer_name, payer_email: row.payer_email,
      item_name: row.item_name, amount: row.amount, currency: row.currency, status: row.status,
      plan_id: row.plan_id, plan_months: row.plan_months, user_id: row.user_id,
      user_matched: row.user_email_match, payer_country: row.payer_country, payment_date: row.payment_date,
      profile_name: row.profile_first_name ? `${row.profile_first_name} ${row.profile_last_name || ''}`.trim() : null,
      profile_email: row.profile_email, profile_country: row.profile_country, profile_whatsapp: row.profile_whatsapp,
      is_premium: row.is_premium, premium_until: row.premium_until, created_at: row.created_at
    }))

    if (format === 'csv') {
      const headers = ['Transaction ID','Payer Name','Payer Email','Item','Amount','Currency','Status','Plan','Months','User Matched','Profile Name','Profile Email','Country','WhatsApp','Premium Until','Payment Date']
      const csvRows = [headers.join(',')]
      for (const t of transactions) {
        csvRows.push([escCsv(t.transaction_id),escCsv(t.payer_name),escCsv(t.payer_email),escCsv(t.item_name),escCsv(t.amount),escCsv(t.currency),escCsv(t.status),escCsv(t.plan_id),escCsv(t.plan_months),escCsv(t.user_matched?'Yes':'No'),escCsv(t.profile_name),escCsv(t.profile_email),escCsv(t.payer_country||t.profile_country),escCsv(t.profile_whatsapp),escCsv(t.premium_until),escCsv(t.payment_date)].join(','))
      }
      res.setHeader('Content-Type', 'text/csv; charset=utf-8')
      res.setHeader('Content-Disposition', `attachment; filename="paypal_transactions_${new Date().toISOString().slice(0,10)}.csv"`)
      return res.status(200).send('\uFEFF' + csvRows.join('\n'))
    }

    return res.json({ data: transactions, total: transactions.length })
  } catch (err) {
    console.error('paypal-export error:', err)
    return res.status(500).json({ error: err.message })
  }
}

function escCsv(val) {
  if (val === null || val === undefined) return ''
  const str = String(val)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) return `"${str.replace(/"/g, '""')}"`
  return str
}

