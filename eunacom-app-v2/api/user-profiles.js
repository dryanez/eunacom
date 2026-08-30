import { getTurso } from './_turso.js'

const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || 'APP_USR-7082707557004383-062820-0010b807284702f3c66366d196d3cefa-3123324373'

const PLANS = {
  '1m': { title: 'EUNACOM Examen - 1 Mes Premium', price: 14990 },
  '3m': { title: 'EUNACOM Examen - 3 Meses Premium', price: 34990 },
  '6m': { title: 'EUNACOM Examen - 6 Meses Premium', price: 54990 },
  '1y': { title: 'EUNACOM Examen - 1 Año Premium', price: 89990 },
  'offer': { title: 'Oferta Última Semana - 1 Mes', price: 5000 }
}

export default async function handler(req, res) {
  const db = getTurso()

  try {
    // Ensure table exists and has all columns
    await db.execute({
      sql: `CREATE TABLE IF NOT EXISTS user_profiles (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        first_name TEXT,
        last_name TEXT,
        avatar_character TEXT,
        exam_month TEXT,
        exam_year TEXT,
        prep_months TEXT,
        nationality TEXT,
        country TEXT,
        country_code TEXT,
        whatsapp TEXT,
        inscrito_eunacom TEXT,
        ayuda_inscripcion TEXT,
        profile_type TEXT,
        graduation_year TEXT,
        university TEXT,
        sede TEXT,
        goal TEXT,
        study_hours TEXT,
        weak_area TEXT,
        xp INTEGER DEFAULT 50,
        onboarding_done INTEGER DEFAULT 0,
        is_premium INTEGER DEFAULT 0,
        premium_until TEXT,
        plan_months INTEGER,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      )`,
      args: []
    }).catch(() => {})

    const ensureCols = [
      'first_name TEXT', 'last_name TEXT', 'avatar_character TEXT',
      'exam_month TEXT', 'exam_year TEXT', 'prep_months TEXT',
      'nationality TEXT', 'country TEXT', 'country_code TEXT',
      'whatsapp TEXT', 'inscrito_eunacom TEXT', 'ayuda_inscripcion TEXT',
      'profile_type TEXT', 'graduation_year TEXT', 'university TEXT', 'sede TEXT',
      'goal TEXT', 'study_hours TEXT', 'weak_area TEXT', 'xp INTEGER DEFAULT 50',
      'onboarding_done INTEGER DEFAULT 0', 'is_premium INTEGER DEFAULT 0',
      'premium_until TEXT', 'plan_months INTEGER'
    ]
    for (const col of ensureCols) {
      await db.execute({ sql: `ALTER TABLE user_profiles ADD COLUMN ${col}`, args: [] }).catch(() => {})
    }

    // --- MERCADO PAGO WEBHOOK & IPN HANDLING ---
    const topic = req.query?.topic || req.body?.topic || req.query?.type || req.body?.type
    const action = req.body?.action
    const isMpWebhook =
      topic === 'payment' ||
      topic === 'merchant_order' ||
      req.body?.type === 'payment' ||
      (typeof action === 'string' && action.startsWith('payment.')) ||
      (req.query?.id && req.query?.topic) ||
      (req.query?.['data.id'] && (req.query?.type || req.query?.topic)) ||
      Boolean(req.body?.data?.id && (req.body?.type === 'payment' || (typeof action === 'string' && action.startsWith('payment.'))))

    if (isMpWebhook) {
      try {
        let paymentId =
          req.body?.data?.id ||
          req.query?.['data.id'] ||
          req.query?.id ||
          req.body?.id ||
          (req.body?.resource ? String(req.body.resource).split('/').pop() : null)

        if (topic === 'merchant_order' && paymentId) {
          const moRes = await fetch(`https://api.mercadopago.com/merchant_orders/${paymentId}`, {
            headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` }
          })
          if (moRes.ok) {
            const moData = await moRes.json()
            const approvedPayment = moData.payments?.find(p => p.status === 'approved')
            if (approvedPayment?.id) {
              paymentId = approvedPayment.id
            }
          }
        }

        if (!paymentId) {
          return res.status(200).json({ received: true, msg: 'Not a payment event or missing ID' })
        }

        console.log(`[MP Webhook] Processing payment ID: ${paymentId}`)

        const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
          headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` }
        })

        if (!mpRes.ok) {
          console.error(`[MP Webhook] Failed to fetch payment ${paymentId}: ${mpRes.status}`)
          return res.status(200).json({ received: true, msg: 'Failed to fetch payment details' })
        }

        const paymentData = await mpRes.json()
        console.log(`[MP Webhook] Payment ${paymentId} status: ${paymentData.status}, ext_ref: ${paymentData.external_reference}`)

        if (paymentData.status === 'approved') {
          const externalReference = paymentData.external_reference
          if (externalReference) {
            const [userId, planId] = externalReference.split('|')
            if (userId) {
              // Calculate expiration date - accumulate if existing subscription is active
              const existing = await db.execute({
                sql: `SELECT is_premium, premium_until, plan_months FROM user_profiles WHERE id = ?`,
                args: [userId]
              }).catch(() => ({ rows: [] }))

              let baseDate = new Date()
              if (existing.rows && existing.rows.length > 0 && existing.rows[0].premium_until) {
                const currentExpires = new Date(existing.rows[0].premium_until)
                if (currentExpires > baseDate) {
                  baseDate = currentExpires
                }
              }

              let monthsToAdd = 1
              if (planId === '1m' || planId === 'offer') monthsToAdd = 1
              else if (planId === '3m') monthsToAdd = 3
              else if (planId === '6m') monthsToAdd = 6
              else if (planId === '1y') monthsToAdd = 12

              if (monthsToAdd === 12) {
                baseDate.setFullYear(baseDate.getFullYear() + 1)
              } else {
                baseDate.setMonth(baseDate.getMonth() + monthsToAdd)
              }
              const premiumUntil = baseDate.toISOString()

              await db.execute({ sql: `ALTER TABLE user_profiles ADD COLUMN is_premium INTEGER DEFAULT 0`, args: [] }).catch(() => {})
              await db.execute({ sql: `ALTER TABLE user_profiles ADD COLUMN premium_until TEXT`, args: [] }).catch(() => {})
              await db.execute({ sql: `ALTER TABLE user_profiles ADD COLUMN plan_months INTEGER`, args: [] }).catch(() => {})

              await db.execute({
                sql: `UPDATE user_profiles SET is_premium = 1, premium_until = ?, plan_months = ?, updated_at = datetime('now') WHERE id = ?`,
                args: [premiumUntil, monthsToAdd, userId]
              })

              console.log(`[MP Webhook] Premium activated for ${userId} until ${premiumUntil}`)
            }
          }
        }
        return res.status(200).json({ received: true })
      } catch (err) {
        console.error('[MP Webhook] Error:', err)
        return res.status(200).json({ received: true, error: err.message })
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
          items: [{ title: plan.title, quantity: 1, unit_price: plan.price, currency_id: 'CLP' }],
          payer: { email: payerEmail },
          external_reference: externalReference,
          back_urls: {
            success: 'https://www.eunacomapp.cl/dashboard?payment=success',
            failure: 'https://www.eunacomapp.cl/dashboard?payment=failure',
            pending: 'https://www.eunacomapp.cl/dashboard?payment=pending'
          },
          auto_return: 'approved',
          notification_url: 'https://www.eunacomapp.cl/api/user-profiles'
        })
      })

      if (!mpRes.ok) return res.status(500).json({ error: 'Error creando preferencia Mercado Pago' })
      const data = await mpRes.json()
      return res.json({ init_point: data.init_point })
    }

    // --- DONATE CREATION ---
    if (req.method === 'POST' && req.body?.action === 'donate') {
      const { userId } = req.body
      if (!userId) return res.status(400).json({ error: 'userId required' })

      const result = await db.execute({ sql: 'SELECT email FROM user_profiles WHERE id = ?', args: [userId] })
      let payerEmail = 'test@test.com'
      if (result.rows && result.rows.length > 0) payerEmail = result.rows[0].email
      
      const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ title: "Donación App EUNACOM", description: "Aporte voluntario (USD $9 approx)", quantity: 1, unit_price: 9000, currency_id: "CLP" }],
          payer: { email: payerEmail },
          back_urls: {
            success: "https://www.eunacomapp.cl/dashboard?donation=success",
            failure: "https://www.eunacomapp.cl/dashboard?donation=failure",
            pending: "https://www.eunacomapp.cl/dashboard?donation=pending"
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

    // --- CREATE / UPDATE PROFILE ---
    if (req.method === 'POST') {
      const {
        id, email, first_name, last_name,
        exam_month, exam_year, prep_months,
        nationality, country, country_code, whatsapp,
        inscrito_eunacom, ayuda_inscripcion, onboarding_done,
        profile_type, graduation_year, university, sede, goal,
        study_hours, weak_area, xp
      } = req.body

      if (!id || !email) return res.status(400).json({ error: 'id and email required' })

      // Ensure all columns exist if adding to old DB (catch errors if they already exist)
      const newCols = [
        'exam_month TEXT', 'exam_year TEXT', 'prep_months TEXT',
        'nationality TEXT', 'country TEXT', 'country_code TEXT',
        'whatsapp TEXT', 'inscrito_eunacom TEXT', 'ayuda_inscripcion TEXT',
        'profile_type TEXT', 'graduation_year TEXT', 'university TEXT', 'sede TEXT',
        'goal TEXT', 'study_hours TEXT', 'weak_area TEXT', 'xp INTEGER DEFAULT 50',
        'avatar_character TEXT',
        'onboarding_done INTEGER DEFAULT 0', 'is_premium INTEGER DEFAULT 0',
        'premium_until TEXT', 'plan_months INTEGER',
        "created_at TEXT DEFAULT (datetime('now'))",
        "updated_at TEXT DEFAULT (datetime('now'))"
      ]
      for (const col of newCols) {
        await db.execute({ sql: `ALTER TABLE user_profiles ADD COLUMN ${col}`, args: [] }).catch(() => {})
      }

      await db.execute({
        sql: `INSERT INTO user_profiles (
                id, email, first_name, last_name, avatar_character, exam_month, exam_year, prep_months,
                nationality, country, country_code, whatsapp, inscrito_eunacom, ayuda_inscripcion,
                profile_type, graduation_year, university, sede, goal, study_hours, weak_area, xp,
                onboarding_done, is_premium, updated_at
              )
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, datetime('now'))
              ON CONFLICT(id) DO UPDATE SET
                email = excluded.email,
                first_name = COALESCE(excluded.first_name, user_profiles.first_name),
                last_name = COALESCE(excluded.last_name, user_profiles.last_name),
                avatar_character = COALESCE(excluded.avatar_character, user_profiles.avatar_character),
                exam_month = COALESCE(excluded.exam_month, user_profiles.exam_month),
                exam_year = COALESCE(excluded.exam_year, user_profiles.exam_year),
                prep_months = COALESCE(excluded.prep_months, user_profiles.prep_months),
                nationality = COALESCE(excluded.nationality, user_profiles.nationality),
                country = COALESCE(excluded.country, user_profiles.country),
                country_code = COALESCE(excluded.country_code, user_profiles.country_code),
                whatsapp = COALESCE(excluded.whatsapp, user_profiles.whatsapp),
                inscrito_eunacom = COALESCE(excluded.inscrito_eunacom, user_profiles.inscrito_eunacom),
                ayuda_inscripcion = COALESCE(excluded.ayuda_inscripcion, user_profiles.ayuda_inscripcion),
                profile_type = COALESCE(excluded.profile_type, user_profiles.profile_type),
                graduation_year = COALESCE(excluded.graduation_year, user_profiles.graduation_year),
                university = COALESCE(excluded.university, user_profiles.university),
                sede = COALESCE(excluded.sede, user_profiles.sede),
                goal = COALESCE(excluded.goal, user_profiles.goal),
                study_hours = COALESCE(excluded.study_hours, user_profiles.study_hours),
                weak_area = COALESCE(excluded.weak_area, user_profiles.weak_area),
                xp = COALESCE(excluded.xp, user_profiles.xp, 50),
                onboarding_done = MAX(excluded.onboarding_done, user_profiles.onboarding_done),
                updated_at = datetime('now')`,
        args: [
          id, email, first_name || '', last_name || '', req.body.avatar_character || 'dr_strange',
          exam_month || 'Diciembre', exam_year || '2026', prep_months || '',
          nationality || '', country || '', country_code || '', whatsapp || '',
          inscrito_eunacom || '', ayuda_inscripcion || '',
          profile_type || '', graduation_year || '', university || '', sede || '', goal || '',
          study_hours || '', weak_area || '', xp || 50, onboarding_done ? 1 : 0
        ]
      })
      return res.json({ ok: true })
    }
    // --- DELETE PROFILE ---
    if (req.method === 'DELETE') {
      const { userId } = req.body
      if (!userId) return res.status(400).json({ error: 'userId required' })

      // Delete all user data across all tables
      await db.execute({ sql: 'DELETE FROM tests WHERE user_id = ?', args: [userId] }).catch(() => {})
      await db.execute({ sql: 'DELETE FROM user_progress WHERE user_id = ?', args: [userId] }).catch(() => {})
      await db.execute({ sql: 'DELETE FROM clase_progress WHERE user_id = ?', args: [userId] }).catch(() => {})
      await db.execute({ sql: 'DELETE FROM user_profiles WHERE id = ?', args: [userId] })
      
      return res.json({ ok: true })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error('user-profiles error:', err)
    return res.status(500).json({ error: err.message })
  }
}
