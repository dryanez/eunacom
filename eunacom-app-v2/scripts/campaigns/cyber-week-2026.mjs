#!/usr/bin/env node
// Cyber Week 2026 campaign: 50% off email to users who signed up but never paid.
//
//   node scripts/campaigns/cyber-week-2026.mjs --preview            # writes recipients CSV, sends nothing
//   node scripts/campaigns/cyber-week-2026.mjs --test you@mail.com  # sends one test email
//   node scripts/campaigns/cyber-week-2026.mjs --send [--limit 450] # sends to everyone not yet sent
//
// Env: TURSO_DATABASE_URL, TURSO_AUTH_TOKEN (from `vercel env pull`),
//      GMAIL_USER (e.g. eunacomapp@gmail.com), GMAIL_APP_PASSWORD (Google account → App passwords).
// Every send is logged in email_campaign_logs, so re-running --send never emails anyone twice.

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomUUID } from 'node:crypto'
import { createClient } from '@libsql/client'
import nodemailer from 'nodemailer'

const CAMPAIGN = 'cyber_week_2026'
const SUBJECT = '🔥 Cyber Week: 50% DCTO en EUNACOM App (+10.600 preguntas y 16 reconstrucciones)'
const HERE = dirname(fileURLToPath(import.meta.url))
const TEMPLATE = readFileSync(join(HERE, 'cyber_week_2026.html'), 'utf8')
const GMAIL_DAILY_SAFE_LIMIT = 450 // personal Gmail allows ~500 recipients/day

const args = process.argv.slice(2)
const mode = args.includes('--send') ? 'send' : args.includes('--test') ? 'test' : 'preview'
const limitArg = args.indexOf('--limit')
const limit = limitArg >= 0 ? Number(args[limitArg + 1]) : GMAIL_DAILY_SAFE_LIMIT

const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

function render(firstName, unsubscribeUrl) {
  const name = (firstName || '').trim().split(/\s+/)[0]
  const greeting = name ? `Hola Dr(a). ${escapeHtml(name)},` : 'Hola,'
  return TEMPLATE.replace('Hola Dr(a). {{nombre}},', greeting).replace('{{unsubscribe_url}}', unsubscribeUrl)
}

function unsubscribeMailto() {
  const user = process.env.GMAIL_USER
  return `mailto:${user}?subject=${encodeURIComponent('Baja correos EUNACOM App')}`
}

function mailer() {
  const { GMAIL_USER, GMAIL_APP_PASSWORD } = process.env
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    console.error('Missing GMAIL_USER / GMAIL_APP_PASSWORD.')
    process.exit(1)
  }
  return nodemailer.createTransport({ service: 'gmail', auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD } })
}

async function sendOne(transport, to, firstName) {
  const unsub = unsubscribeMailto()
  return transport.sendMail({
    from: `EUNACOM App <${process.env.GMAIL_USER}>`,
    to,
    subject: SUBJECT,
    html: render(firstName, unsub),
    headers: { 'List-Unsubscribe': `<${unsub}>` },
  })
}

async function recipients(db) {
  await db.execute(`CREATE TABLE IF NOT EXISTS email_campaign_logs (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL, email TEXT NOT NULL, campaign_type TEXT NOT NULL,
    subject TEXT NOT NULL, discount_percent INTEGER, sent_at TEXT DEFAULT (datetime('now')), metadata TEXT)`)
  // Signed up but never paid: not premium now and no premium_until ever set (expired payers are excluded).
  const { rows } = await db.execute({
    sql: `SELECT up.id, lower(trim(up.email)) AS email, up.first_name, up.last_name, up.created_at
          FROM user_profiles up
          WHERE up.email LIKE '%_@_%._%'
            AND COALESCE(up.is_premium, 0) <> 1
            AND up.premium_until IS NULL
            AND up.id NOT IN ('screenshot-mock', 'dev_test')
            AND lower(trim(up.email)) NOT IN ('dr.felipeyanez@gmail.com', 'eunacomapp@gmail.com', 'creativetestp@gmail.com')
            AND up.id NOT IN (SELECT user_id FROM email_campaign_logs WHERE campaign_type = ?)
            AND lower(trim(up.email)) NOT IN (SELECT lower(trim(email)) FROM email_campaign_logs WHERE campaign_type = ?)
          ORDER BY up.created_at DESC`,
    args: [CAMPAIGN, CAMPAIGN],
  })
  const seen = new Set()
  return rows.filter(r => !seen.has(r.email) && seen.add(r.email))
}

async function main() {
  if (mode === 'test') {
    const to = args[args.indexOf('--test') + 1]
    if (!to || to.startsWith('--')) throw new Error('Usage: --test you@mail.com')
    const info = await sendOne(mailer(), to, 'Felipe')
    console.log(`Test sent to ${to} (${info.messageId})`)
    return
  }

  const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN })
  const list = await recipients(db)

  if (mode === 'preview') {
    const csv = ['email,first_name,last_name,created_at',
      ...list.map(r => [r.email, r.first_name, r.last_name, r.created_at].map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))]
    const out = join(HERE, 'cyber_week_2026_recipients.csv')
    writeFileSync(out, csv.join('\n'))
    console.log(`${list.length} recipients (nothing sent). List: ${out}`)
    list.slice(0, 20).forEach(r => console.log(`  ${r.email}  ${r.first_name ?? ''}`))
    if (list.length > 20) console.log(`  … and ${list.length - 20} more`)
    return
  }

  const transport = mailer()
  const batch = list.slice(0, limit)
  console.log(`Sending to ${batch.length} of ${list.length} pending recipients…`)
  let ok = 0
  for (const r of batch) {
    try {
      await sendOne(transport, r.email, r.first_name)
      await db.execute({
        sql: `INSERT INTO email_campaign_logs (id, user_id, email, campaign_type, subject, discount_percent) VALUES (?, ?, ?, ?, ?, 50)`,
        args: [randomUUID(), r.id, r.email, CAMPAIGN, SUBJECT],
      })
      ok++
      console.log(`  ✓ ${r.email}`)
    } catch (err) {
      console.error(`  ✗ ${r.email}: ${err.message}`)
      if (/daily|limit|quota/i.test(err.message)) break // Gmail cap hit — resume tomorrow
    }
    await new Promise(res => setTimeout(res, 1500))
  }
  console.log(`Done: ${ok} sent, ${list.length - ok} still pending.`)
}

main().catch(err => { console.error(err); process.exit(1) })
