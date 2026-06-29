import { getTurso } from './_turso.js'

// You should set this in your Vercel Environment Variables:
const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || 'APP_USR-7082707557004383-062820-0010b807284702f3c66366d196d3cefa-3123324373'

const PLANS = {
  '1m': { title: 'EUNACOM Examen - 1 Mes Premium', price: 14990 },
  '3m': { title: 'EUNACOM Examen - 3 Meses Premium', price: 34990 },
  '6m': { title: 'EUNACOM Examen - 6 Meses Premium', price: 54990 },
  '1y': { title: 'EUNACOM Examen - 1 Año Premium', price: 89990 }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { userId, planId } = req.body
  if (!userId || !planId || !PLANS[planId]) {
    return res.status(400).json({ error: 'Missing or invalid parameters' })
  }

  try {
    // 1. Get user email
    const db = getTurso()
    const result = await db.execute({
      sql: 'SELECT email FROM user_profiles WHERE id = ?',
      args: [userId]
    })
    
    let payerEmail = 'test@test.com'
    if (result.rows && result.rows.length > 0) {
      payerEmail = result.rows[0].email
    }

    const plan = PLANS[planId]
    
    // Create reference format: userId|planId|timestamp
    const externalReference = `${userId}|${planId}|${Date.now()}`

    // 2. Call Mercado Pago API
    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        items: [
          {
            title: plan.title,
            description: "Acceso Premium EUNACOM Examen",
            quantity: 1,
            unit_price: plan.price,
            currency_id: "CLP"
          }
        ],
        payer: {
          email: payerEmail
        },
        external_reference: externalReference,
        back_urls: {
          success: "https://eunacom.vercel.app/dashboard?payment=success",
          failure: "https://eunacom.vercel.app/dashboard?payment=failure",
          pending: "https://eunacom.vercel.app/dashboard?payment=pending"
        },
        auto_return: "approved",
        // The webhook URL that Mercado Pago will hit
        notification_url: "https://eunacom.vercel.app/api/webhook"
      })
    })

    if (!mpRes.ok) {
      const errText = await mpRes.text()
      console.error('Mercado Pago Error:', errText)
      return res.status(500).json({ error: 'Error creando la preferencia de pago en Mercado Pago' })
    }

    const data = await mpRes.json()
    
    // Return the init_point (the checkout URL)
    return res.json({ init_point: data.init_point })
    
  } catch (err) {
    console.error('Checkout error:', err)
    return res.status(500).json({ error: err.message })
  }
}
