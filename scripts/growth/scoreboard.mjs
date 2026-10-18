#!/usr/bin/env node
/**
 * Daily growth scoreboard (agent #1 in docs/growth/GROWTH_PLAN.md).
 *
 * Reads real numbers only: Turso (signups, attribution, PayPal) and the Mercado Pago API (CLP revenue).
 * Any source that can't be read is reported as NO DATA, never estimated.
 *
 * The repo and its Action logs are PUBLIC: business numbers go only to the owner's Telegram DM.
 * Logs carry the list of problems (no numbers). Pass --print to see the full report locally.
 *
 * Env: TURSO_DATABASE_URL, TURSO_AUTH_TOKEN, MP_ACCESS_TOKEN,
 *      TELEGRAM_BOT_TOKEN + TELEGRAM_OWNER_CHAT_ID (optional), GROWTH_TARGET_CLP (default 1000000)
 */
import { createClient } from '@libsql/client'

const TARGET = Number(process.env.GROWTH_TARGET_CLP || 1000000)
const USD_TO_CLP = 930 // same rate as api/_admin-finances.js
const TZ = 'America/Santiago'
const EXAM = { date: '2026-12-16', registrationCloses: '2026-10-30' } // keep in sync with api/_exam-plan.js

const chileDate = (d = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(d)
const today = chileDate()
const yesterday = chileDate(new Date(Date.now() - 86400000))
const weekAgo = chileDate(new Date(Date.now() - 7 * 86400000))
const monthStart = `${today.slice(0, 7)}-01`
const daysInMonth = new Date(Number(today.slice(0, 4)), Number(today.slice(5, 7)), 0).getDate()
const dayOfMonth = Number(today.slice(8, 10))
const daysUntil = d => Math.ceil((new Date(`${d}T12:00:00-03:00`) - new Date(`${today}T12:00:00-03:00`)) / 86400000)
const clp = n => `$${Math.round(n).toLocaleString('es-CL')}`

const problems = []

// ── Turso ───────────────────────────────────────────────────────────────────
let db = null
if (process.env.TURSO_DATABASE_URL) {
  db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN })
} else {
  problems.push('Turso: TURSO_DATABASE_URL not set')
}

async function q(sql, args = []) {
  if (!db) return null
  try {
    return (await db.execute({ sql, args })).rows
  } catch (e) {
    problems.push(`Turso query failed: ${e.message.split('\n')[0]}`)
    return null
  }
}

// created_at is stored in UTC by SQLite datetime('now'); shift to Chile time (UTC-3) before taking the date
const CL_DATE = "date(datetime(created_at, '-3 hours'))"

const signups = {}
for (const [key, from] of [['yesterday', yesterday], ['week', weekAgo], ['month', monthStart]]) {
  const to = key === 'yesterday' ? yesterday : today
  const rows = await q(`SELECT COUNT(*) AS n FROM user_profiles WHERE ${CL_DATE} >= ? AND ${CL_DATE} <= ?`, [from, to])
  signups[key] = rows ? Number(rows[0].n) : null
}
const totals = await q(`SELECT COUNT(*) AS users, SUM(CASE WHEN is_premium = 1 AND (premium_until IS NULL OR datetime(premium_until) > datetime('now')) THEN 1 ELSE 0 END) AS active FROM user_profiles`)

let sources = null
const srcRows = await q(`SELECT COALESCE(NULLIF(signup_source, ''), CASE WHEN NULLIF(signup_referrer, '') IS NOT NULL THEN 'ref:' || signup_referrer ELSE '(direct)' END) AS src, COUNT(*) AS n
  FROM user_profiles WHERE ${CL_DATE} >= ? AND signup_landing IS NOT NULL GROUP BY src ORDER BY n DESC LIMIT 10`, [weekAgo])
if (srcRows) {
  sources = srcRows.map(r => ({ src: r.src, n: Number(r.n) }))
} else if (db) {
  problems.pop() // the generic query error: say what it means instead
  problems.push('Attribution: signup_* columns not created yet (they appear with the first signup after deploy)')
}

// ── Revenue: Mercado Pago (CLP) ─────────────────────────────────────────────
async function mpApproved(fromDate, toDate) {
  const token = process.env.MP_ACCESS_TOKEN
  if (!token) { problems.push('Mercado Pago: MP_ACCESS_TOKEN not set'); return null }
  const payments = []
  for (let offset = 0; offset < 2000; offset += 100) {
    const url = `https://api.mercadopago.com/v1/payments/search?status=approved&range=date_approved` +
      `&begin_date=${fromDate}T00:00:00.000-03:00&end_date=${toDate}T23:59:59.999-03:00&limit=100&offset=${offset}`
    const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    if (!r.ok) { problems.push(`Mercado Pago API ${r.status}`); return null }
    const data = await r.json()
    payments.push(...(data.results || []))
    if (!data.results || data.results.length < 100) break
  }
  return payments.filter(p => !/donaci/i.test(p.description || ''))
}
const mpMonth = await mpApproved(monthStart, today)
const mpSum = (list, from, to) => list
  ? list.filter(p => { const d = chileDate(new Date(p.date_approved)); return d >= from && d <= to })
      .reduce((s, p) => ({ n: s.n + 1, clp: s.clp + Number(p.transaction_amount || 0) }), { n: 0, clp: 0 })
  : null

// ── Revenue: PayPal (USD, stored by webhook) ────────────────────────────────
const ppRows = await q(`SELECT amount, currency, payment_date FROM paypal_transactions WHERE UPPER(status) = 'COMPLETED' AND date(datetime(payment_date, '-3 hours')) >= ?`, [monthStart])
const ppSum = (from, to) => ppRows
  ? ppRows.filter(r => { const d = chileDate(new Date(r.payment_date)); return d >= from && d <= to })
      .reduce((s, r) => ({ n: s.n + 1, clp: s.clp + Number(r.amount || 0) * (String(r.currency).toUpperCase() === 'CLP' ? 1 : USD_TO_CLP) }), { n: 0, clp: 0 })
  : null

const add = (a, b) => (a && b ? { n: a.n + b.n, clp: a.clp + b.clp } : a || b || null)
const rev = {
  yesterday: add(mpSum(mpMonth, yesterday, yesterday), ppSum(yesterday, yesterday)),
  month: add(mpSum(mpMonth, monthStart, today), ppSum(monthStart, today)),
}
const revenueComplete = mpMonth !== null && ppRows !== null

// ── Report ──────────────────────────────────────────────────────────────────
const fmt = v => (v === null || v === undefined ? 'NO DATA' : v)
const projected = rev.month ? (rev.month.clp / dayOfMonth) * daysInMonth : null
const neededPerDay = rev.month ? Math.max(0, (TARGET - rev.month.clp) / Math.max(1, daysInMonth - dayOfMonth + 1)) : null

const lines = [
  `# 📊 Growth Scoreboard · ${today}`,
  '',
  `Real data only. Target: **${clp(TARGET)}/month**.`,
  '',
  '## Revenue',
  '',
  '| | Sales | CLP |',
  '|---|---|---|',
  `| Yesterday (${yesterday}) | ${fmt(rev.yesterday?.n)} | ${rev.yesterday ? clp(rev.yesterday.clp) : 'NO DATA'} |`,
  `| Month to date | ${fmt(rev.month?.n)} | ${rev.month ? clp(rev.month.clp) : 'NO DATA'} |`,
  `| Projected month | | ${projected !== null ? clp(projected) : 'NO DATA'} (${projected !== null ? Math.round((projected / TARGET) * 100) : '?'}% of target) |`,
  `| Needed per day from today | | ${neededPerDay !== null ? clp(neededPerDay) : 'NO DATA'} |`,
  revenueComplete ? '' : '\n> ⚠️ Revenue is incomplete: a payment source could not be read (see Problems).',
  '',
  '## Funnel',
  '',
  `- Signups yesterday: **${fmt(signups.yesterday)}** · last 7 days: **${fmt(signups.week)}** · month: **${fmt(signups.month)}**`,
  `- Total accounts: ${fmt(totals?.[0]?.users)} · active premium: ${fmt(totals?.[0]?.active)}`,
  `- Signup → paid this month: ${rev.month && signups.month ? `${((rev.month.n / signups.month) * 100).toFixed(1)}%` : 'NO DATA'}`,
  '',
  '## Signups by source (7 days, tracked signups only)',
  '',
  sources?.length ? sources.map(s => `- ${s.src}: ${s.n}`).join('\n') : '- NO DATA yet',
  '',
  '## Calendar',
  '',
  `- EUNACOM registration closes ${EXAM.registrationCloses}: **${daysUntil(EXAM.registrationCloses)} days**`,
  `- EUNACOM exam ${EXAM.date}: **${daysUntil(EXAM.date)} days**`,
  '',
  '## Problems',
  '',
  problems.length ? problems.map(p => `- ⛔ ${p}`).join('\n') : '- none',
  '',
]
const md = lines.filter(l => l !== null).join('\n')

if (process.argv.includes('--print')) console.log(md)

// ── Telegram DM to the owner ────────────────────────────────────────────────
const { TELEGRAM_BOT_TOKEN, TELEGRAM_OWNER_CHAT_ID } = process.env
if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_OWNER_CHAT_ID) {
  problems.push('Telegram: TELEGRAM_BOT_TOKEN / TELEGRAM_OWNER_CHAT_ID not set, so the scoreboard was not delivered')
} else {
  const text = [
    `📊 EUNACOM ${today}`,
    `Ayer: ${fmt(rev.yesterday?.n)} ventas · ${rev.yesterday ? clp(rev.yesterday.clp) : 'NO DATA'} · ${fmt(signups.yesterday)} registros`,
    `Mes: ${rev.month ? clp(rev.month.clp) : 'NO DATA'} / ${clp(TARGET)} · proyección ${projected !== null ? clp(projected) : 'NO DATA'}`,
    `Inscripción EUNACOM cierra en ${daysUntil(EXAM.registrationCloses)} días · examen en ${daysUntil(EXAM.date)}`,
    problems.length ? `⛔ ${problems.length} problema(s): ${problems.join(' | ')}` : '',
  ].filter(Boolean).join('\n')
  const r = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: TELEGRAM_OWNER_CHAT_ID, text }),
  })
  if (!r.ok) problems.push(`Telegram DM failed: HTTP ${r.status}`)
  else console.log('Scoreboard sent to the owner on Telegram.')
}
for (const p of problems) console.log(`::warning title=Scoreboard NO DATA::${p}`)
