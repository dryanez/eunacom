// Secuencia de correos para quienes bajaron un libro gratis de los reels (tabla regalo_leads, ver _regalos.js).
// La corre el cron diario (api/email-marketing-cron.js): a cada persona a lo más un correo cada 2 días, según los días
// desde que descargó. El correo del día 0 (el link del libro) ya lo manda _regalos.js al descargar.
//   día 1: cómo sacarle partido a la guía · día 3: cómo estudiar la especialidad · día 5: qué trae el Manual · día 8: cierre
// La oferta es la de la página del regalo (eunacom-examen.cl/?regalo=<slug>&k=<token>): el Manual a $9.990 (código REGALO).
// Nada de plazos falsos: el precio de regalo no vence. Baja en un clic (?action=regalo_baja&k=) → email_suppressions.
import { REGALOS } from './_regalos.js'

const AEE = 'https://eunacom-examen.cl'
const API = 'https://www.eunacomapp.cl/api/user-profiles'
const PRICE = { manual: '$19.990', regalo: '$9.990' }
export const REGALO_SEQ = [
  { step: 1, day: 1, key: 'uso' },
  { step: 2, day: 3, key: 'estudio' },
  { step: 3, day: 5, key: 'manual' },
  { step: 4, day: 8, key: 'cierre' },
]

const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
const first = n => String(n || '').trim().split(/\s+/)[0]
const utm = (slug, key) => `utm_source=email&utm_medium=regalo_seq&utm_campaign=${encodeURIComponent(slug)}&utm_content=${key}`
const giftUrl = (lead, key) => `${AEE}/?regalo=${encodeURIComponent(lead.slug)}&k=${encodeURIComponent(lead.token)}&${utm(lead.slug, key)}`
const libUrl = (lead, key) => `${AEE}/?code=SHORTS20&${utm(lead.slug, key)}#tienda`
export const unsubUrl = lead => `${API}?action=regalo_baja&k=${encodeURIComponent(lead.token)}`

// Consejos de uso según el tipo de regalo (texto de método de estudio, no contenido médico)
const USO = {
  guia: ['Mira cada trazado primero solo, sin leer, y di tú el diagnóstico.', 'Después compara con los marcadores numerados y con «Qué tienes que ver».', 'Al final haz la autoevaluación: las imágenes sin marcas, como en el examen.'],
  atlas: ['Tapa el texto y mira cada foto: ¿qué ves y qué diagnóstico es?', 'Compara con los marcadores y la conducta inicial de cada ficha.', 'Cierra con la autoevaluación del final, sin respuestas a la vista.'],
  gordo: ['Hazlo como examen: 90 preguntas, reloj corriendo, sin mirar la clave.', 'Corrige después y anota los códigos del Perfil V3 donde fallaste.', 'Repite solo esas preguntas en 3 días.'],
  repaso: ['Lee una página por tema, sin saltarte el recuadro de perlas.', 'Sigue el plan de 7 días del final del libro.', 'El día antes del examen, solo los recuadros.'],
}

function layout({ lead, preheader, body, cta, ctaUrl, ps }) {
  return `<!DOCTYPE html><html lang="es-CL"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#eef4fb;font-family:Arial,Helvetica,sans-serif;color:#2f3e4d">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef4fb"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#fff;border-radius:16px;overflow:hidden">
<tr><td style="background:#08365f;padding:18px 24px"><a href="${AEE}" style="text-decoration:none;color:#fff;font-weight:bold;font-size:18px;letter-spacing:.3px">AEE <span style="font-weight:normal;font-size:13px;color:#9cc3ea">· Academia Examen EUNACOM</span></a></td></tr>
<tr><td style="padding:26px 28px 6px;font-size:16px;line-height:1.6">${body}</td></tr>
${cta ? `<tr><td align="center" style="padding:14px 28px 6px"><a href="${ctaUrl}" style="display:inline-block;background:#08365f;color:#fff;font-size:16px;font-weight:bold;text-decoration:none;padding:15px 30px;border-radius:12px">${esc(cta)}</a></td></tr>` : ''}
${ps ? `<tr><td style="padding:14px 28px 4px;font-size:14px;line-height:1.55;color:#475569">${ps}</td></tr>` : ''}
<tr><td style="padding:18px 28px 26px;font-size:15px;line-height:1.6">Mucho éxito,<br><strong>Dr. Felipe Yáñez</strong><br>Academia Examen EUNACOM</td></tr>
<tr><td align="center" style="background:#f4f7fb;padding:18px 28px;font-size:12px;line-height:1.6;color:#64748b">
Recibes este correo porque descargaste «${esc(REGALOS[lead.slug]?.title || 'un libro gratis')}» desde Instagram (@academiaeunacom).<br>
¿Dudas? Responde este correo. · <a href="${unsubUrl(lead)}" style="color:#64748b">No quiero más correos</a>
</td></tr></table></td></tr></table></body></html>`
}

// Asunto + HTML de un paso para un lead
export function regaloEmail(lead, step) {
  const r = REGALOS[lead.slug] || { title: 'tu libro', specialty: 'la especialidad', kind: 'guia' }
  const n = first(lead.nombre)
  const hola = n ? `Hola ${esc(n)},` : 'Hola,'
  const esp = esc(r.specialty)
  const manualLine = `El <b>Manual de ${esp}</b> completo (toda la teoría del Perfil V3) está a <b>${PRICE.regalo}</b> en vez de ${PRICE.manual} para quienes bajaron la guía.`
  const s = REGALO_SEQ.find(x => x.step === step)
  if (s.key === 'uso') {
    const tips = USO[r.kind] || USO.guia
    return {
      subject: n ? `${n}, cómo sacarle partido a tu guía` : 'Cómo sacarle partido a tu guía',
      html: layout({
        lead, preheader: `3 pasos para que «${r.title}» te sirva de verdad.`,
        body: `<p style="margin:0 0 14px">${hola}</p><p style="margin:0 0 14px">Hace poco bajaste <b>${esc(r.title)}</b>. Para que no quede en la carpeta de descargas, úsala así:</p>
<ol style="margin:0 0 14px;padding-left:20px">${tips.map(t => `<li style="margin:0 0 8px">${esc(t)}</li>`).join('')}</ol>
<p style="margin:0">Son 20 minutos y te quedan los conceptos que más se preguntan.</p>`,
        cta: 'Abrir mi guía', ctaUrl: giftUrl(lead, 'uso'),
        ps: `PD: ${manualLine}`,
      }),
    }
  }
  if (s.key === 'estudio') return {
    subject: `Cómo estudiar ${r.specialty} para el EUNACOM`,
    html: layout({
      lead, preheader: `El orden que funciona: teoría, preguntas y repaso.`,
      body: `<p style="margin:0 0 14px">${hola}</p><p style="margin:0 0 14px">${esp} pesa mucho en el EUNACOM. El orden que mejor funciona:</p>
<ol style="margin:0 0 14px;padding-left:20px">
<li style="margin:0 0 8px"><b>Teoría una vez, completa.</b> Todo el Perfil V3 de la especialidad, de principio a fin, con algoritmos y tablas.</li>
<li style="margin:0 0 8px"><b>Preguntas tipo examen.</b> Cada error te dice qué código del Perfil repasar.</li>
<li style="margin:0 0 8px"><b>Repaso corto la última semana.</b> Solo perlas y algoritmos.</li></ol>
<p style="margin:0">Para el paso 1 hicimos el <b>Manual de ${esp}</b>: lo descargas al tiro en PDF.</p>`,
      cta: `Ver el Manual a ${PRICE.regalo}`, ctaUrl: giftUrl(lead, 'estudio'),
      ps: `PD: es el mismo formato de la guía que bajaste, pero con la especialidad entera.`,
    }),
  }
  if (s.key === 'manual') return {
    subject: `Qué trae el Manual de ${r.specialty}`,
    html: layout({
      lead, preheader: `Toda la teoría del Perfil V3 de ${r.specialty} en un PDF.`,
      body: `<p style="margin:0 0 14px">${hola}</p><p style="margin:0 0 14px">Varios nos preguntaron qué trae el Manual de ${esp}. Esto:</p>
<ul style="margin:0 0 14px;padding-left:20px">
<li style="margin:0 0 8px">Todo el <b>Perfil V3 de ${esp}</b>, tema por tema, en el orden del examen.</li>
<li style="margin:0 0 8px">Algoritmos, tablas y perlas EUNACOM en recuadros.</li>
<li style="margin:0 0 8px">Fotos clínicas junto al párrafo que las explica.</li>
<li style="margin:0 0 8px">PDF para el celular o el computador, para siempre.</li></ul>
<p style="margin:0">${manualLine}</p>`,
      cta: 'Quiero el Manual', ctaUrl: giftUrl(lead, 'manual'),
      ps: 'PD: si ya lo compraste, ¡gracias! Ignora este correo.',
    }),
  }
  return {
    subject: n ? `${n}, ¿seguimos con ${r.specialty}?` : `¿Seguimos con ${r.specialty}?`,
    html: layout({
      lead, preheader: 'El Manual o la librería completa, tú eliges.',
      body: `<p style="margin:0 0 14px">${hola}</p><p style="margin:0 0 14px">Este es el último correo sobre tu guía. Si te sirvió, tienes dos caminos:</p>
<p style="margin:0 0 10px">📘 <b>Solo ${esp}:</b> el Manual completo a <b>${PRICE.regalo}</b>.</p>
<p style="margin:0 0 14px">📚 <b>Todo el examen:</b> la librería completa (manuales, clases en video, Libros Gordos, Repaso Final, Atlas y banco de preguntas) con <b>20 % de descuento</b> usando SHORTS20. <a href="${libUrl(lead, 'cierre')}" style="color:#0b5ea8">Ver la librería →</a></p>
<p style="margin:0">Cada semana publicamos una guía gratis nueva en Instagram: comenta la palabra del reel y te llega por DM.</p>`,
      cta: `Manual de ${r.specialty} a ${PRICE.regalo}`, ctaUrl: giftUrl(lead, 'cierre'),
    }),
  }
}

export async function ensureSeqColumns(db) {
  for (const col of ['seq_step INTEGER DEFAULT 0', 'seq_sent_at TEXT', 'unsub INTEGER DEFAULT 0'])
    await db.execute({ sql: `ALTER TABLE regalo_leads ADD COLUMN ${col}`, args: [] }).catch(() => {})
}

// Leads a los que hoy les toca un correo (uno por persona y día; el más reciente de cada correo si pidió varios libros)
export async function dueLeads(db, now = new Date()) {
  await ensureSeqColumns(db)
  const rows = (await db.execute({
    sql: `SELECT * FROM regalo_leads WHERE email IS NOT NULL AND COALESCE(unsub, 0) = 0
            AND lower(trim(email)) NOT IN (SELECT email FROM email_suppressions)
            AND COALESCE(seq_step, 0) < ? ORDER BY created_at DESC`,
    args: [REGALO_SEQ.length],
  })).rows || []
  const seen = new Set(), due = []
  for (const l of rows) {
    const email = String(l.email).toLowerCase().trim()
    if (seen.has(email)) continue // un correo por persona
    seen.add(email)
    if (l.seq_sent_at && (now - new Date(String(l.seq_sent_at).replace(' ', 'T').replace(/Z?$/, 'Z'))) / 864e5 < 1.9) continue // ≥ 2 días entre correos
    const next = REGALO_SEQ[Number(l.seq_step || 0)]
    const days = (now - new Date(String(l.created_at).replace(' ', 'T') + 'Z')) / 864e5
    if (next && days >= next.day) due.push({ lead: l, step: next.step })
  }
  return due
}

// Envía los correos que tocan hoy. sender = { name, sendMany([{from,to,reply_to,subject,html,headers}]) } (ver promoSender)
export async function runRegaloSequence(db, sender, { dryRun = false, limit = 400, now = new Date() } = {}) {
  const due = (await dueLeads(db, now)).slice(0, limit)
  if (dryRun || !sender || !due.length) return { due: due.length, sent: 0, dryRun, preview: due.slice(0, 20).map(d => ({ email: d.lead.email, slug: d.lead.slug, step: d.step })) }
  const from = `Academia Examen EUNACOM <${process.env.RESEND_SENDER_EMAIL || 'equipo@eunacomapp.cl'}>`
  const msgs = due.map(({ lead, step }) => {
    const m = regaloEmail(lead, step)
    return { from, to: lead.email, reply_to: 'eunacomapp@gmail.com', subject: m.subject, html: m.html, headers: { 'List-Unsubscribe': `<${unsubUrl(lead)}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' } }
  })
  const results = []
  for (let i = 0; i < msgs.length; i += 50) results.push(...await sender.sendMany(msgs.slice(i, i + 50)))
  let sent = 0
  for (let i = 0; i < due.length; i++) {
    if (results[i]?.error) continue
    sent++
    await db.execute({ sql: `UPDATE regalo_leads SET seq_step = ?, seq_sent_at = ? WHERE id = ?`, args: [due[i].step, now.toISOString(), due[i].lead.id] })
  }
  return { due: due.length, sent, failed: due.length - sent, sender: sender.name }
}

// Baja en un clic (link del pie y cabecera List-Unsubscribe; GET o POST)
export async function regaloBaja(db, token) {
  await ensureSeqColumns(db)
  const lead = (await db.execute({ sql: `SELECT email FROM regalo_leads WHERE token = ?`, args: [String(token || '')] })).rows?.[0]
  if (!lead?.email) return false
  const email = String(lead.email).toLowerCase().trim()
  await db.execute({ sql: `UPDATE regalo_leads SET unsub = 1 WHERE lower(trim(email)) = ?`, args: [email] })
  await db.execute({ sql: `INSERT OR IGNORE INTO email_suppressions (email, reason, detail) VALUES (?, 'unsubscribed', 'regalo')`, args: [email] }).catch(() => {})
  return true
}
