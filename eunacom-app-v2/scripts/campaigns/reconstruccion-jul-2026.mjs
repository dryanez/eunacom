#!/usr/bin/env node
// Lanzamiento Reconstrucción EUNACOM Julio 2026 (16-nov-2026). Va a TODAS las cuentas, en dos versiones:
//   · plan  → tiene un plan activo: «ya la tienes gratis en tu plan, entra a hacerla».
//   · libre → sin plan: «gratis con cualquier plan, o suelta por $12.999».
//
//   node scripts/campaigns/reconstruccion-jul-2026.mjs --preview              # CSV por segmento, no envía nada
//   node scripts/campaigns/reconstruccion-jul-2026.mjs --html                 # escribe las 2 versiones en HTML para revisarlas
//   node scripts/campaigns/reconstruccion-jul-2026.mjs --test you@mail.com    # envía las 2 versiones a una casilla
//   node scripts/campaigns/reconstruccion-jul-2026.mjs --send [--limit 500]   # envía a quien falte (solo desde el 16-nov)
//
// Env: TURSO_DATABASE_URL, TURSO_AUTH_TOKEN; SES_SMTP_USER/PASS[/HOST] (o GMAIL_USER + GMAIL_APP_PASSWORD).
// Nunca escribe a email_suppressions; cada envío queda en email_campaign_logs → re-ejecutar --send no repite a nadie.

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomUUID } from 'node:crypto'
import { createClient } from '@libsql/client'
import nodemailer from 'nodemailer'

const CAMPAIGN = 'reconstruccion_jul_2026'
const RELEASE = Date.parse('2026-11-16T00:00:00-03:00')
const HERE = dirname(fileURLToPath(import.meta.url))
// HTML generado con el kit de eunacomapp: redes-hub/emails/campanas/reconstruccion-jul-2026.mjs
const TEMPLATES = { plan: readFileSync(join(HERE, 'reconstruccion_jul_2026_plan.html'), 'utf8'), libre: readFileSync(join(HERE, 'reconstruccion_jul_2026_libre.html'), 'utf8') }
const USE_SES = !!process.env.SES_SMTP_USER
const FROM = USE_SES ? 'equipo@eunacomapp.cl' : process.env.GMAIL_USER
const REPLY_TO = 'eunacomapp@gmail.com'
const UTM = 'utm_source=email&utm_medium=email&utm_campaign=reconstruccion_jul_2026'

const SEGMENTS = {
  plan: {
    subject: '🆕 Ya está la Reconstrucción EUNACOM Julio 2026 (gratis en tu plan)',
  },
  libre: {
    subject: '🆕 Reconstrucción EUNACOM Julio 2026: la última antes de tu examen',
  },
}

const args = process.argv.slice(2)
const mode = ['send', 'test', 'html'].find(m => args.includes(`--${m}`)) || 'preview'
const limitArg = args.indexOf('--limit')
const limit = limitArg >= 0 ? Number(args[limitArg + 1]) : USE_SES ? Infinity : 450

const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
const unsubscribe = () => `mailto:${REPLY_TO}?subject=${encodeURIComponent('Baja correos EUNACOM App')}`

function render(segment, firstName) {
  const name = (firstName || '').trim().split(/\s+/)[0]
  return TEMPLATES[segment]
    .replace(/Dr\(a\)\. \{\{nombre\}\}/g, name ? `Dr(a). ${escapeHtml(name)}` : 'Doctor(a)')
    .replace(/\{\{unsubscribe_url\}\}/g, unsubscribe())
}

function mailer() {
  if (USE_SES) {
    const { SES_SMTP_USER, SES_SMTP_PASS, SES_SMTP_HOST } = process.env
    if (!SES_SMTP_PASS) { console.error('Falta SES_SMTP_PASS.'); process.exit(1) }
    return nodemailer.createTransport({ host: SES_SMTP_HOST || 'email-smtp.sa-east-1.amazonaws.com', port: 587, secure: false, auth: { user: SES_SMTP_USER, pass: SES_SMTP_PASS } })
  }
  const { GMAIL_USER, GMAIL_APP_PASSWORD } = process.env
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) { console.error('Faltan SES_SMTP_* o GMAIL_USER / GMAIL_APP_PASSWORD.'); process.exit(1) }
  return nodemailer.createTransport({ service: 'gmail', auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD } })
}

const sendOne = (t, to, segment, firstName) => t.sendMail({
  from: `EUNACOM App <${FROM}>`, to, replyTo: REPLY_TO, subject: SEGMENTS[segment].subject,
  html: render(segment, firstName), headers: { 'List-Unsubscribe': `<${unsubscribe()}>` },
})

async function recipients(db) {
  await db.execute(`CREATE TABLE IF NOT EXISTS email_campaign_logs (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL, email TEXT NOT NULL, campaign_type TEXT NOT NULL,
    subject TEXT NOT NULL, discount_percent INTEGER, sent_at TEXT DEFAULT (datetime('now')), metadata TEXT)`)
  await db.execute(`CREATE TABLE IF NOT EXISTS email_suppressions (
    email TEXT PRIMARY KEY, reason TEXT, detail TEXT, created_at TEXT DEFAULT (datetime('now')))`)
  const { rows } = await db.execute({
    sql: `SELECT up.id, lower(trim(up.email)) AS email, up.first_name, up.created_at,
                 CASE WHEN up.is_premium = 1 AND (up.premium_until IS NULL OR datetime(up.premium_until) > datetime('now')) THEN 'plan' ELSE 'libre' END AS segment
          FROM user_profiles up
          WHERE up.email LIKE '%_@_%._%'
            AND up.id NOT IN ('screenshot-mock', 'dev_test')
            AND lower(trim(up.email)) NOT IN ('dr.felipeyanez@gmail.com', 'eunacomapp@gmail.com', 'creativetestp@gmail.com')
            AND up.id NOT IN (SELECT user_id FROM email_campaign_logs WHERE campaign_type = ?)
            AND lower(trim(up.email)) NOT IN (SELECT lower(trim(email)) FROM email_campaign_logs WHERE campaign_type = ?)
            AND lower(trim(up.email)) NOT IN (SELECT email FROM email_suppressions)
          ORDER BY segment, up.created_at DESC`,
    args: [CAMPAIGN, CAMPAIGN],
  })
  const seen = new Set()
  return rows.filter(r => !seen.has(r.email) && seen.add(r.email))
}

async function main() {
  if (mode === 'html') {
    for (const seg of Object.keys(SEGMENTS)) {
      const out = join(HERE, `reconstruccion_jul_2026_${seg}.preview.html`)
      writeFileSync(out, render(seg, 'Camila')); console.log(out)
    }
    return
  }
  if (mode === 'test') {
    const to = args[args.indexOf('--test') + 1]
    if (!to || to.startsWith('--')) throw new Error('Uso: --test tu@mail.com')
    const t = mailer()
    for (const seg of Object.keys(SEGMENTS)) console.log(`Prueba «${seg}» enviada a ${to} (${(await sendOne(t, to, seg, 'Felipe')).messageId})`)
    return
  }

  const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN })
  const list = await recipients(db)
  const count = seg => list.filter(r => r.segment === seg).length

  if (mode === 'preview') {
    const csv = ['segment,email,first_name,created_at', ...list.map(r => [r.segment, r.email, r.first_name, r.created_at].map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))]
    const out = join(HERE, 'reconstruccion_jul_2026_recipients.csv')
    writeFileSync(out, csv.join('\n'))
    console.log(`${list.length} destinatarios (plan ${count('plan')}, libre ${count('libre')}); no se envió nada. Lista: ${out}`)
    return
  }

  if (Date.now() < RELEASE && !args.includes('--force')) {
    console.error('La reconstrucción sale el 16-nov-2026 (hora Chile). Antes de esa fecha no se envía (usa --force si de verdad quieres).')
    process.exit(1)
  }
  const transport = mailer()
  const batch = list.slice(0, limit)
  console.log(`Enviando a ${batch.length} de ${list.length} pendientes (plan ${count('plan')}, libre ${count('libre')})…`)
  let ok = 0
  for (const r of batch) {
    try {
      await sendOne(transport, r.email, r.segment, r.first_name)
      await db.execute({
        sql: `INSERT INTO email_campaign_logs (id, user_id, email, campaign_type, subject, discount_percent, metadata) VALUES (?, ?, ?, ?, ?, NULL, ?)`,
        args: [randomUUID(), r.id, r.email, CAMPAIGN, SEGMENTS[r.segment].subject, JSON.stringify({ provider: USE_SES ? 'ses' : 'gmail', segment: r.segment })],
      })
      ok++; console.log(`  ✓ [${r.segment}] ${r.email}`)
    } catch (err) {
      console.error(`  ✗ ${r.email}: ${err.message}`)
      if (/daily|limit|quota|throttl|sandbox|not verified/i.test(err.message)) break
    }
    await new Promise(res => setTimeout(res, USE_SES ? 150 : 1500))
  }
  console.log(`Listo: ${ok} enviados, ${list.length - ok} pendientes.`)
}

main().catch(err => { console.error(err); process.exit(1) })
