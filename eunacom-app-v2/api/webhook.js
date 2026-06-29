import { getTurso } from './_turso.js'

export default async function handler(req, res) {
  // Mercado Pago sends a POST request with query params for webhooks or a JSON body
  // It can be tested via MP panel.
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { type, data, action } = req.body

    // Mercado Pago webhooks send type="payment" and action="payment.created" or "payment.updated"
    // Also support older IPN format where topic="payment" and id is passed.
    let paymentId = null;

    if (type === 'payment' || req.body.topic === 'payment') {
       paymentId = data?.id || req.body.resource || req.query.id || req.query['data.id'];
    }

    if (!paymentId && req.query.id && req.query.topic === 'payment') {
       paymentId = req.query.id;
    }

    if (!paymentId && req.body.action === 'payment.created' && req.body.data && req.body.data.id) {
       paymentId = req.body.data.id;
    }

    if (!paymentId) {
       return res.status(200).json({ received: true, msg: "Not a payment event or missing ID" })
    }

    // 1. Fetch payment details from MP to verify it's legitimate and check its status
    const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || 'APP_USR-7082707557004383-062820-0010b807284702f3c66366d196d3cefa-3123324373'
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`
      }
    })

    if (!mpRes.ok) {
      console.error('Failed to fetch payment from MP', await mpRes.text())
      return res.status(200).json({ received: true, msg: "Failed to fetch payment details" })
    }

    const paymentData = await mpRes.json()

    // 2. Check if the payment was approved
    if (paymentData.status === 'approved') {
      const externalReference = paymentData.external_reference
      if (externalReference) {
        // externalReference is formatted as: userId|planId|timestamp
        const [userId, planId] = externalReference.split('|')
        
        if (userId) {
           // 3. Mark the user as premium in Turso
           const db = getTurso()
           await db.execute({
             sql: `UPDATE user_profiles SET is_premium = 1, updated_at = datetime('now') WHERE id = ?`,
             args: [userId]
           })
           console.log(`User ${userId} marked as premium for plan ${planId}`)
        }
      }
    }

    // Always return 200 OK to Mercado Pago so they don't retry
    return res.status(200).json({ received: true })

  } catch (err) {
    console.error('Webhook error:', err)
    // Return 200 even on error to prevent MP from retrying continuously, or 500 if you want retries
    return res.status(500).json({ error: err.message })
  }
}
