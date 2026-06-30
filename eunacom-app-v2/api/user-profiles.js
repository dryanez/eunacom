import { getTurso } from './_turso.js'

const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || 'APP_USR-7082707557004383-062820-0010b807284702f3c66366d196d3cefa-3123324373'

const PLANS = {
  '1m': { title: 'EUNACOM Examen - 1 Mes Premium', price: 14990 },
  '3m': { title: 'EUNACOM Examen - 3 Meses Premium', price: 34990 },
  '6m': { title: 'EUNACOM Examen - 6 Meses Premium', price: 54990 },
  '1y': { title: 'EUNACOM Examen - 1 Año Premium', price: 89990 }
}

export default async function handler(req, res) {
  const db = getTurso()

  try {
    // Ensure table exists
    await db.execute({
      sql: `CREATE TABLE IF NOT EXISTS user_profiles (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        first_name TEXT,
        last_name TEXT,
        exam_month TEXT,
        exam_year TEXT,
        prep_months TEXT,
        nationality TEXT,
        country TEXT,
        country_code TEXT,
        whatsapp TEXT,
        inscrito_eunacom TEXT,
        onboarding_done INTEGER DEFAULT 0,
        is_premium INTEGER DEFAULT 0,
        premium_until TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      )`,
      args: []
    })

    // --- WEBHOOK HANDLING ---
    if (req.method === 'POST') {
      const type = req.body?.type;
      const topic = req.body?.topic || req.query?.topic;
      const action = req.body?.action;
      
      if (type === 'payment' || topic === 'payment' || action === 'payment.created') {
        let paymentId = req.body?.data?.id || req.body?.resource || req.query?.id || req.query['data.id'];
        if (!paymentId) return res.status(200).json({ received: true, msg: "Not a payment event or missing ID" })
  
        const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
          headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` }
        })
  
        if (!mpRes.ok) return res.status(200).json({ received: true, msg: "Failed to fetch payment details" })
  
        const paymentData = await mpRes.json()
        if (paymentData.status === 'approved') {
          const externalReference = paymentData.external_reference
          if (externalReference) {
            const [userId, planId] = externalReference.split('|')
            if (userId) {
               // Calculate expiration date
               const now = new Date()
               if (planId === '1m') now.setMonth(now.getMonth() + 1)
               else if (planId === '3m') now.setMonth(now.getMonth() + 3)
               else if (planId === '6m') now.setMonth(now.getMonth() + 6)
               else if (planId === '1y') now.setFullYear(now.getFullYear() + 1)
               const premiumUntil = now.toISOString()

               await db.execute({ sql: `ALTER TABLE user_profiles ADD COLUMN premium_until TEXT`, args: [] }).catch(() => {})

               await db.execute({
                 sql: `UPDATE user_profiles SET is_premium = 1, premium_until = ?, updated_at = datetime('now') WHERE id = ?`,
                 args: [premiumUntil, userId]
               })
            }
          }
        }
        return res.status(200).json({ received: true })
      }
    }

    // --- CHECKOUT CREATION ---
    if (req.method === 'POST' && req.body?.action === 'checkout') {
      const { userId, planId } = req.body
      if (!userId || !planId || !PLANS[planId]) return res.status(400).json({ error: 'Missing or invalid parameters' })

      const result = await db.execute({ sql: 'SELECT email FROM user_profiles WHERE id = ?', args: [userId] })
      let payerEmail = 'test@test.com'
      if (result.rows && result.rows.length > 0) payerEmail = result.rows[0].email

      const plan = PLANS[planId]
      const externalReference = `${userId}|${planId}|${Date.now()}`

      const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ title: plan.title, description: "Acceso Premium EUNACOM Examen", quantity: 1, unit_price: plan.price, currency_id: "CLP" }],
          payer: { email: payerEmail },
          external_reference: externalReference,
          back_urls: {
            success: "https://eunacom.vercel.app/dashboard?payment=success",
            failure: "https://eunacom.vercel.app/dashboard?payment=failure",
            pending: "https://eunacom.vercel.app/dashboard?payment=pending"
          },
          auto_return: "approved",
          notification_url: "https://eunacom.vercel.app/api/user-profiles"
        })
      })

      if (!mpRes.ok) return res.status(500).json({ error: 'Error creando preferencia' })
      const data = await mpRes.json()
      return res.json({ init_point: data.init_point })
    }

    // --- DONATE CREATION ---
    if (req.method === 'POST' && req.body?.action === 'donate') {
      const { userId } = req.body
      let payerEmail = 'donante@anonimo.com'
      if (userId) {
         const result = await db.execute({ sql: 'SELECT email FROM user_profiles WHERE id = ?', args: [userId] })
         if (result.rows && result.rows.length > 0) payerEmail = result.rows[0].email
      }
      
      const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ title: "Donación App EUNACOM", description: "Aporte voluntario (USD $9 approx)", quantity: 1, unit_price: 9000, currency_id: "CLP" }],
          payer: { email: payerEmail },
          back_urls: {
            success: "https://eunacom.vercel.app/dashboard?donation=success",
            failure: "https://eunacom.vercel.app/dashboard?donation=failure",
            pending: "https://eunacom.vercel.app/dashboard?donation=pending"
          },
          auto_return: "approved"
        })
      })

      if (!mpRes.ok) return res.status(500).json({ error: 'Error creando preferencia de donación' })
      const data = await mpRes.json()
      return res.json({ init_point: data.init_point })
    }

    // --- GET PROFILE ---
    if (req.method === 'GET') {
      const userId = req.query.userId
      if (!userId) return res.status(400).json({ error: 'userId required' })

      const result = await db.execute({
        sql: 'SELECT * FROM user_profiles WHERE id = ?',
        args: [userId]
      })
      return res.json({ data: result.rows[0] || null })
    }

    // --- CREATE PROFILE ---
    if (req.method === 'POST') {
      const {
        id, email, first_name, last_name,
        exam_month, exam_year, prep_months,
        nationality, country, country_code, whatsapp,
        inscrito_eunacom, onboarding_done
      } = req.body

      if (!id || !email) return res.status(400).json({ error: 'id and email required' })

      // Ensure columns exist if adding to old DB
      await db.execute({ sql: `ALTER TABLE user_profiles ADD COLUMN inscrito_eunacom TEXT`, args: [] }).catch(() => {})
      await db.execute({ sql: `ALTER TABLE user_profiles ADD COLUMN is_premium INTEGER DEFAULT 0`, args: [] }).catch(() => {})

      await db.execute({
        sql: `INSERT INTO user_profiles (id, email, first_name, last_name, exam_month, exam_year, prep_months, nationality, country, country_code, whatsapp, inscrito_eunacom, onboarding_done, is_premium, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, datetime('now'))
              ON CONFLICT(id) DO UPDATE SET
                email = excluded.email,
                first_name = excluded.first_name,
                last_name = excluded.last_name,
                exam_month = excluded.exam_month,
                exam_year = excluded.exam_year,
                prep_months = excluded.prep_months,
                nationality = excluded.nationality,
                country = excluded.country,
                country_code = excluded.country_code,
                whatsapp = excluded.whatsapp,
                inscrito_eunacom = excluded.inscrito_eunacom,
                onboarding_done = excluded.onboarding_done,
                updated_at = datetime('now')`,
        args: [
          id, email, first_name || null, last_name || null,
          exam_month || null, exam_year || null, prep_months || null,
          nationality || null, country || null, country_code || null, whatsapp || null,
          inscrito_eunacom || null,
          onboarding_done ? 1 : 0
        ]
      })
      return res.json({ ok: true })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error('user-profiles error:', err)
    return res.status(500).json({ error: err.message })
  }
}
