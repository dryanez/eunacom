// Amazon SES bounce/complaint notifications via SNS (HTTPS subscription to /api/ses-events).
// Permanent bounces and complaints go into email_suppressions, which every campaign send excludes.
// Only messages from the configured topic (SES_SNS_TOPIC_ARN) are accepted.
import { getTurso } from './_turso.js'

const SNS_HOST = /^sns\.[a-z0-9-]+\.amazonaws\.com$/

export default async function sesEventsHandler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })
  let msg = req.body
  try { if (typeof msg === 'string') msg = JSON.parse(msg) } catch { return res.status(400).json({ error: 'Bad JSON' }) }
  if (!msg?.Type) return res.status(400).json({ error: 'Not an SNS message' })

  const topic = process.env.SES_SNS_TOPIC_ARN
  if (!topic || msg.TopicArn !== topic) return res.status(403).json({ error: 'Unknown topic' })

  if (msg.Type === 'SubscriptionConfirmation') {
    const url = new URL(msg.SubscribeURL)
    if (url.protocol !== 'https:' || !SNS_HOST.test(url.hostname)) return res.status(400).json({ error: 'Bad SubscribeURL' })
    await fetch(url)
    return res.json({ confirmed: true })
  }
  if (msg.Type !== 'Notification') return res.json({ ignored: msg.Type })

  let event
  try { event = JSON.parse(msg.Message) } catch { return res.json({ ignored: 'non-JSON message' }) }
  const type = event.notificationType || event.eventType
  let reason = null
  let recipients = []
  if (type === 'Bounce' && event.bounce?.bounceType === 'Permanent') {
    reason = 'bounce'
    recipients = event.bounce.bouncedRecipients || []
  } else if (type === 'Complaint') {
    reason = 'complaint'
    recipients = event.complaint?.complainedRecipients || []
  }
  if (!reason) return res.json({ ignored: type })

  const db = getTurso()
  await db.execute(`CREATE TABLE IF NOT EXISTS email_suppressions (
    email TEXT PRIMARY KEY, reason TEXT, detail TEXT, created_at TEXT DEFAULT (datetime('now')))`)
  for (const r of recipients) {
    const email = String(r.emailAddress || '').trim().toLowerCase()
    if (!email) continue
    await db.execute({
      sql: `INSERT INTO email_suppressions (email, reason, detail) VALUES (?, ?, ?)
            ON CONFLICT(email) DO UPDATE SET reason = excluded.reason, detail = excluded.detail`,
      args: [email, reason, String(r.diagnosticCode || event.complaint?.complaintFeedbackType || '').slice(0, 500)]
    })
  }
  return res.json({ suppressed: recipients.length, reason })
}
