import { Resend } from 'resend'

// Only allow the real admin to send campaigns
const isAdmin = (email) => {
  return email && Buffer.from(email).toString('base64') === 'ZHIuZmVsaXBleWFuZXpAZ21haWwuY29t'
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { adminEmail, targetEmails, subject, htmlContent } = req.body

  if (!isAdmin(adminEmail)) {
    return res.status(403).json({ error: 'Unauthorized: Only admins can send campaigns' })
  }

  if (!targetEmails || !Array.isArray(targetEmails) || targetEmails.length === 0) {
    return res.status(400).json({ error: 'targetEmails must be a non-empty array' })
  }

  if (!subject || !htmlContent) {
    return res.status(400).json({ error: 'subject and htmlContent are required' })
  }

  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: 'RESEND_API_KEY is not configured on the server' })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const SENDER_EMAIL = process.env.RESEND_SENDER_EMAIL || 'equipo@eunacom.app'

  try {
    // Resend batch API allows sending up to 100 emails in a single request
    // If targetEmails > 100, we need to chunk it.
    const chunkArray = (arr, size) =>
      arr.length > size ? [arr.slice(0, size), ...chunkArray(arr.slice(size), size)] : [arr]

    const batches = chunkArray(targetEmails, 100)
    let totalSent = 0

    for (const batch of batches) {
      const payload = batch.map(email => ({
        from: `EUNACOM App <${SENDER_EMAIL}>`,
        to: email,
        subject: subject,
        html: htmlContent,
      }))

      const { data, error } = await resend.batch.send(payload)

      if (error) {
        console.error('Resend Error on batch:', error)
        throw new Error(error.message)
      }
      totalSent += batch.length
    }

    return res.status(200).json({ success: true, message: `Campaign sent to ${totalSent} users` })
  } catch (error) {
    console.error('Error sending campaign:', error)
    return res.status(500).json({ error: error.message || 'Error sending campaign' })
  }
}
