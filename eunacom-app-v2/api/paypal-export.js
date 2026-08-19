import { getTurso } from './_turso.js'

// Admin-only endpoint to fetch PayPal transactions and export as JSON
// GET /api/paypal-export?adminEmail=dr.felipeyanez@gmail.com
// GET /api/paypal-export?adminEmail=dr.felipeyanez@gmail.com&format=csv

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { adminEmail, format } = req.query

  if (adminEmail !== 'dr.felipeyanez@gmail.com') {
    return res.status(403).json({ error: 'Forbidden' })
  }

  const db = getTurso()

  try {
    // Ensure table exists
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

    // Fetch all transactions, joined with user_profiles for extra context
    const result = await db.execute({
      sql: `SELECT 
              pt.*,
              up.first_name as profile_first_name,
              up.last_name as profile_last_name,
              up.email as profile_email,
              up.country as profile_country,
              up.whatsapp as profile_whatsapp,
              up.is_premium,
              up.premium_until
            FROM paypal_transactions pt
            LEFT JOIN user_profiles up ON pt.user_id = up.id
            ORDER BY pt.created_at DESC`,
      args: []
    })

    const transactions = result.rows.map(row => ({
      transaction_id: row.transaction_id,
      payer_name: row.payer_name,
      payer_email: row.payer_email,
      item_name: row.item_name,
      amount: row.amount,
      currency: row.currency,
      status: row.status,
      plan_id: row.plan_id,
      plan_months: row.plan_months,
      user_id: row.user_id,
      user_matched: row.user_email_match,
      payer_country: row.payer_country,
      payment_date: row.payment_date,
      // Matched profile info
      profile_name: row.profile_first_name ? `${row.profile_first_name} ${row.profile_last_name || ''}`.trim() : null,
      profile_email: row.profile_email,
      profile_country: row.profile_country,
      profile_whatsapp: row.profile_whatsapp,
      is_premium: row.is_premium,
      premium_until: row.premium_until,
      created_at: row.created_at
    }))

    if (format === 'csv') {
      // Return as CSV for direct download
      const headers = [
        'Transaction ID', 'Payer Name', 'Payer Email', 'Item',
        'Amount', 'Currency', 'Status', 'Plan', 'Months',
        'User Matched', 'Profile Name', 'Profile Email',
        'Country', 'WhatsApp', 'Premium Until', 'Payment Date'
      ]

      const csvRows = [headers.join(',')]
      for (const t of transactions) {
        csvRows.push([
          escCsv(t.transaction_id),
          escCsv(t.payer_name),
          escCsv(t.payer_email),
          escCsv(t.item_name),
          escCsv(t.amount),
          escCsv(t.currency),
          escCsv(t.status),
          escCsv(t.plan_id),
          escCsv(t.plan_months),
          escCsv(t.user_matched ? 'Yes' : 'No'),
          escCsv(t.profile_name),
          escCsv(t.profile_email),
          escCsv(t.payer_country || t.profile_country),
          escCsv(t.profile_whatsapp),
          escCsv(t.premium_until),
          escCsv(t.payment_date),
        ].join(','))
      }

      res.setHeader('Content-Type', 'text/csv; charset=utf-8')
      res.setHeader('Content-Disposition', `attachment; filename="paypal_transactions_${new Date().toISOString().slice(0,10)}.csv"`)
      return res.status(200).send('\uFEFF' + csvRows.join('\n')) // BOM for Excel UTF-8
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
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}
