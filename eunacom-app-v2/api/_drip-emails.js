// Secuencia de correos después del registro (nov-2026, informe auditoria-2026-11/precios):
//   día 2 → «Mira una clase» (sin descuento)
//   día 4 → cupón 30 % (vence en 72 h), A/B entre 4 modelos: m1 «Clase en movimiento», m2 «Biblioteca»,
//            m3 «Por especialidad», m4 «Cupón» (el modelo 5 «Cuenta regresiva» lo descartó Felipe)
//   día 6 → recordatorio «tu 30 % vence mañana», con el mismo modelo que recibió el día 4
// Sin precios fijos: el botón lleva a /oferta, que muestra los precios del momento con el descuento aplicado.
// Imágenes en public/email/. Baja en un clic: ?action=app_baja&u=<id>&k=<HMAC> (user-profiles.js).
import { createHmac } from 'node:crypto'

const SITE = 'https://www.eunacomapp.cl'
const IMG = `${SITE}/email/`
const API = `${SITE}/api/user-profiles`
const F = "Montserrat,'Segoe UI',-apple-system,Helvetica,Arial,sans-serif"
const NAVY = '#0b2545', BLUE = '#0f62b0', CYAN = '#22d3ee', ORANGE = '#f97316'

export const DRIP_TYPES = ['drip_clase', 'discount_30', 'discount_30_reminder']
export const DISCOUNT_30_HOURS = 72

const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
const first = n => String(n || '').trim().split(/\s+/)[0]

export const unsubKey = userId => createHmac('sha256', process.env.REGALO_SECRET || 'eunacomapp').update(`baja:${userId}`).digest('hex').slice(0, 24)
export const unsubUrl = userId => `${API}?action=app_baja&u=${encodeURIComponent(userId)}&k=${unsubKey(userId)}`

// A/B fijo por persona (mismo modelo siempre)
export const VARIANTS = ['m1', 'm2', 'm3', 'm4']
export const variantFor = userId => VARIANTS[[...String(userId)].reduce((s, c) => s + c.charCodeAt(0), 0) % VARIANTS.length]

const fmtDate = d => d.toLocaleString('es-CL', { timeZone: 'America/Santiago', weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }) + ' h'

function shell(inner, pre, userId) {
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>EUNACOM App</title></head>
<body style="margin:0;padding:0;background:#e8eef6;font-family:${F}">
<div style="display:none;max-height:0;overflow:hidden">${esc(pre)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#e8eef6"><tr><td align="center" style="padding:20px 8px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px">${inner}
<tr><td style="padding:22px 16px;text-align:center;font-size:12px;color:#64748b;line-height:1.6">EUNACOM App · eunacomapp.cl · ¿Dudas? Responde este correo<br><a href="${unsubUrl(userId)}" style="color:#64748b">Dejar de recibir estos correos</a></td></tr>
</table></td></tr></table></body></html>`
}
const brand = () => `<table role="presentation" width="100%"><tr><td style="padding:4px 2px 16px"><img src="${SITE}/logo.png" width="36" height="36" alt="" style="vertical-align:middle;border-radius:8px;background:#fff"><span style="font-weight:900;font-size:17px;color:#fff;vertical-align:middle">&nbsp; EUNACOM<span style="color:${CYAN}">App</span></span></td></tr></table>`
const pill = (t, bg = 'rgba(255,255,255,.12)', c = CYAN) => `<span style="display:inline-block;background:${bg};color:${c};font-size:11px;font-weight:800;letter-spacing:2px;padding:6px 12px;border-radius:99px">${t}</span>`
const btn = (url, txt, bg = CYAN, color = NAVY) => `<a href="${url}" style="display:inline-block;background:${bg};color:${color};font-weight:900;font-size:18px;text-decoration:none;padding:18px 34px;border-radius:10px">${txt}</a>`
const gif = (url, f, alt) => `<a href="${url}"><img src="${IMG}${f}" width="100%" alt="${alt}" style="display:block;width:100%;border-radius:12px;border:0"></a>`
const stats = () => `<table role="presentation" width="100%"><tr>${[['+650', 'CLASES EN VIDEO'], ['+47.000', 'PREGUNTAS'], ['2013–26', 'RECONSTRUCCIONES'], ['21', 'ESPECIALIDADES']].map(([n, t]) => `<td width="25%" style="padding:8px 4px;vertical-align:top"><div style="font-size:22px;font-weight:900;color:#fff">${n}</div><div style="font-size:10px;font-weight:800;letter-spacing:1px;color:#93c5fd">${t}</div></td>`).join('')}</tr></table>`
const CLASES = [['play-neuro-04.jpg', 'NEUROLOGÍA', 'Rotura de un aneurisma del polígono de Willis'], ['play-cirugia-01.jpg', 'CIRUGÍA', 'Por qué el dolor migra en la apendicitis'], ['play-trauma-08.jpg', 'TRAUMATOLOGÍA', 'Rotura del ligamento cruzado anterior'], ['play-gastro-01.jpg', 'GASTRO', 'Reflujo: falla la barrera']]
const claseList = url => CLASES.map(([f, k, t]) => `<tr><td style="padding:6px 0"><table role="presentation" width="100%"><tr><td width="42%" style="vertical-align:middle"><a href="${url}"><img src="${IMG}${f}" width="100%" alt="" style="display:block;width:100%;border-radius:8px;border:0"></a></td><td style="padding-left:14px;vertical-align:middle"><div style="font-size:10px;font-weight:800;letter-spacing:1px;color:${CYAN}">${k} · EN MOVIMIENTO</div><div style="font-size:15px;font-weight:700;color:#fff;margin-top:4px;line-height:1.35">${t}</div></td></tr></table></td></tr>`).join('')
const ROW6 = [['cardiologia', 'Cardio'], ['neurologia', 'Neuro'], ['pediatria', 'Pediatría'], ['ginecologia', 'Gineco'], ['cirugia', 'Cirugía'], ['traumatologia', 'Trauma']]
const libros = url => `${gif(url, 'libros_slide.gif', 'Libros por especialidad')}
<table role="presentation" width="100%" style="margin-top:8px"><tr>${ROW6.map(([s, n]) => `<td width="16.6%" style="padding:3px;text-align:center;vertical-align:top"><a href="${url}"><img src="${IMG}tomo_${s}.jpg" width="100%" alt="" style="display:block;width:100%;border-radius:4px;border:0"></a><div style="font-size:10px;font-weight:800;color:#bfdbfe;padding-top:4px">${n}</div></td>`).join('')}</tr></table>`
const ok = c => `<div style="font-size:13px;font-weight:700;color:${c}">✓ Ya viene aplicado en todos los planes · no escribes ningún código</div>`
const link = (pct, kind, variant) => `${SITE}/oferta${pct ? `?discount=${pct}&` : '?'}utm_source=email&utm_medium=registro&utm_campaign=${kind}&utm_content=${variant}`

// ── Día 2: mira una clase (sin descuento) ──
function clase(user) {
  const n = esc(first(user.first_name))
  const url = link(0, 'drip_clase', 'clase')
  return {
    subject: `${n ? `${n}, así` : 'Así'} se ve un neumotórax a tensión por dentro`,
    html: shell(`
<tr><td style="background:${NAVY};border-radius:18px 18px 0 0;padding:22px 24px 6px">${brand()}${pill('▶ CLASE REAL · EN MOVIMIENTO')}
  <h1 style="margin:14px 0 6px;color:#fff;font-size:28px;line-height:1.15;font-weight:900">${n ? `Dr(a). ${n}, así` : 'Así'} se ven las clases.</h1>
  <div style="color:#bfdbfe;font-size:15px;line-height:1.5">Anatomía en 3D que se mueve, explicada para el EUNACOM. Ves lo que pasa en el cuerpo, no solo lo lees.</div></td></tr>
<tr><td style="background:${NAVY};padding:16px 24px 0">${gif(url, 'anim_neumotorax.gif', 'Neumotórax a tensión en 3D')}
  <div style="font-size:17px;font-weight:800;color:#fff;padding:10px 0 18px">Neumotórax a tensión y hemotórax traumático</div></td></tr>
<tr><td style="background:${NAVY};padding:0 24px 24px;border-radius:0 0 18px 18px">
  <div style="color:#fff;font-weight:800;font-size:17px;padding-bottom:6px">Más clases de muestra</div>
  <table role="presentation" width="100%">${claseList(url)}</table>
  <div style="padding-top:16px">${stats()}</div>
  <div style="text-align:center;padding-top:18px">${btn(url, 'Ver las clases →')}</div></td></tr>`, 'Anatomía en 3D que se mueve, explicada para el EUNACOM.', user.id)
  }
}

// ── Día 4 (cupón) y día 6 (recordatorio): 4 modelos ──
const claseGrid = url => `<table role="presentation" width="100%"><tr>${CLASES.slice(0, 2).map(([f, , t]) => `<td width="50%" style="padding:5px;vertical-align:top"><a href="${url}"><img src="${IMG}${f}" width="100%" alt="" style="display:block;width:100%;border-radius:8px;border:0"></a><div style="font-size:13px;font-weight:700;color:#0f172a;padding:6px 2px 0">${t}</div></td>`).join('')}</tr><tr>${CLASES.slice(2).map(([f, , t]) => `<td width="50%" style="padding:5px;vertical-align:top"><a href="${url}"><img src="${IMG}${f}" width="100%" alt="" style="display:block;width:100%;border-radius:8px;border:0"></a><div style="font-size:13px;font-weight:700;color:#0f172a;padding:6px 2px 0">${t}</div></td>`).join('')}</tr></table>`
const librosLight = url => `${gif(url, 'libros_slide.gif', 'Libros por especialidad')}
<table role="presentation" width="100%" style="margin-top:8px"><tr>${ROW6.map(([s, n]) => `<td width="16.6%" style="padding:3px;text-align:center;vertical-align:top"><a href="${url}"><img src="${IMG}tomo_${s}.jpg" width="100%" alt="" style="display:block;width:100%;border-radius:4px;border:0"></a><div style="font-size:10px;font-weight:800;color:${NAVY};padding-top:4px">${n}</div></td>`).join('')}</tr></table>`
const statsCard = () => `<div style="background:${NAVY};border-radius:12px;padding:12px 10px">${stats()}</div>`
const urgBar = vence => `<tr><td style="background:#dc2626;border-radius:14px;padding:11px;text-align:center;color:#fff;font-weight:900;font-size:13px;letter-spacing:1px">⏳ TU 30 % VENCE MAÑANA · ${esc(vence).toUpperCase()}</td></tr><tr><td style="height:10px"></td></tr>`

function cupon(user, variant, expires, reminder) {
  const n = esc(first(user.first_name))
  const kind = reminder ? 'discount_30_reminder' : 'discount_30'
  const url = link(30, kind, variant)
  const vence = fmtDate(expires)
  const top = reminder ? urgBar(vence) : ''
  const cta = reminder ? 'Usar mi 30% ahora →' : 'Usar mi 30% →'
  const priceBlock = `<tr><td style="background:${BLUE};padding:22px 24px;text-align:center">
  <div style="font-size:64px;font-weight:900;color:#fff;line-height:1">-30%</div>
  <div style="color:#fff;font-size:17px;font-weight:800">en todos los planes</div>
  <div style="color:#bfdbfe;font-size:13px;margin-top:8px">⏳ Vence el ${vence}</div>
  <div style="padding-top:10px">${ok('#bfdbfe')}</div>
  <div style="margin-top:18px">${btn(url, cta)}</div></td></tr>`
  let body
  if (variant === 'm1') { // Clase en movimiento
    body = `${top}<tr><td style="background:${NAVY};border-radius:18px 18px 0 0;padding:22px 24px 6px">${brand()}${pill('▶ CLASE REAL · EN MOVIMIENTO')}
  <h1 style="margin:14px 0 6px;color:#fff;font-size:28px;line-height:1.15;font-weight:900">${n ? `Dr(a). ${n}, así` : 'Así'} se ven las clases.</h1>
  <div style="color:#bfdbfe;font-size:15px">Anatomía en 3D que se mueve, explicada para el EUNACOM.</div></td></tr>
<tr><td style="background:${NAVY};padding:16px 24px 18px">${gif(url, 'anim_neumotorax.gif', 'Neumotórax a tensión en 3D')}</td></tr>${priceBlock}
<tr><td style="background:${NAVY};padding:22px 24px;border-radius:0 0 18px 18px">
  <div style="color:#fff;font-weight:800;font-size:17px;padding-bottom:6px">Más clases de muestra</div><table role="presentation" width="100%">${claseList(url)}</table>
  <div style="color:#fff;font-weight:800;font-size:17px;padding:18px 0 8px">Y tus libros, especialidad por especialidad</div>${libros(url)}
  <div style="padding-top:16px">${stats()}</div>
  <div style="text-align:center;padding-top:18px">${btn(url, cta, '#fff', NAVY)}</div></td></tr>`
  } else if (variant === 'm2') { // Biblioteca
    body = `${top}<tr><td style="background:${NAVY};border-radius:18px 18px 0 0;padding:22px 24px 6px">${brand()}${pill('🎟️ TU CUPÓN · 30 %', ORANGE, '#fff')}
  <h1 style="margin:14px 0 6px;color:#fff;font-size:28px;line-height:1.15;font-weight:900">Clases, preguntas, reconstrucciones y 86 libros.</h1>
  <div style="color:#bfdbfe;font-size:15px">${n ? `Dr(a). ${n}, todo` : 'Todo'} en un solo lugar, con 30 % ya aplicado.</div></td></tr>
<tr><td style="background:${NAVY};padding:16px 24px 18px">${libros(url)}<div style="padding-top:12px">${stats()}</div></td></tr>${priceBlock}
<tr><td style="background:#fff;padding:22px 24px;border-radius:0 0 18px 18px">
  <div style="font-size:11px;font-weight:800;color:${BLUE};letter-spacing:2px">CLASES · MIRA UNA</div>
  <div style="font-size:22px;font-weight:900;color:${NAVY};margin:4px 0 10px">Mira una clase <span style="color:${BLUE}">real</span> del curso</div>
  ${gif(url, 'anim_aneurisma.gif', 'Aneurisma del polígono de Willis')}<div style="padding-top:10px">${claseGrid(url)}</div>
  <div style="text-align:center;padding-top:18px">${btn(url, cta, NAVY, '#fff')}</div></td></tr>`
  } else if (variant === 'm3') { // Por especialidad
    const esp = [['tomo_cardiologia.jpg', 'Cardiología', '38 clases', ORANGE], ['tomo_neumologia.jpg', 'Respiratorio', '25 clases', '#14b8a6'], ['tomo_neurologia.jpg', 'Neurología', '26 clases', '#a855f7'], ['tomo_gastroenterologia.jpg', 'Gastro', '26 clases', '#22c55e']]
    body = `${top}<tr><td style="background:#fff;border-radius:18px;padding:22px">
  <table role="presentation" width="100%"><tr><td style="padding-bottom:12px"><img src="${SITE}/logo.png" width="32" height="32" alt="" style="vertical-align:middle;border-radius:8px"><span style="font-weight:900;font-size:16px;color:${NAVY};vertical-align:middle">&nbsp; EUNACOM<span style="color:${BLUE}">App</span></span></td></tr></table>
  <div style="font-size:11px;font-weight:800;color:${BLUE};letter-spacing:2px">TU ACCESO · 21 ESPECIALIDADES</div>
  <h1 style="margin:6px 0 4px;font-size:27px;line-height:1.15;color:${NAVY};font-weight:900">${n ? `Dr(a). ${n}, elige` : 'Elige'} por dónde empezar.</h1>
  <div style="color:#475569;font-size:15px">Cada especialidad trae sus clases en video, su manual y sus preguntas.</div>
  <table role="presentation" width="100%" style="margin-top:14px"><tr>${esp.map(([f, nm, c, a]) => `<td width="25%" style="padding:4px;vertical-align:top"><a href="${url}" style="text-decoration:none"><div style="border:1px solid #e2e8f0;border-top:4px solid ${a};border-radius:10px;padding:8px;background:#fff"><img src="${IMG}${f}" width="100%" alt="" style="display:block;width:100%;border-radius:4px"><div style="font-size:12px;font-weight:800;color:${NAVY};padding-top:6px">${nm}</div><div style="font-size:11px;color:#64748b">${c}</div><div style="font-size:11px;font-weight:800;color:${a}">Ver →</div></div></a></td>`).join('')}</tr></table></td></tr>
<tr><td style="padding:14px 0"><table role="presentation" width="100%" style="background:${NAVY};border-radius:18px"><tr>
  <td width="52%" style="padding:22px;vertical-align:middle">
    <div style="font-size:11px;font-weight:800;color:${CYAN};letter-spacing:2px">COLECCIÓN COMPLETA</div>
    <div style="font-size:24px;font-weight:900;color:#fff;margin:4px 0">Todo EUNACOM</div>
    <div style="font-size:48px;font-weight:900;color:${CYAN};line-height:1">-30%</div>
    <div style="color:#fff;font-size:14px;font-weight:700;margin-top:6px">en todos los planes</div>
    <div style="color:#bfdbfe;font-size:12px;margin-top:6px">Ya viene aplicado · vence el ${vence}</div>
    <div style="margin-top:14px"><a href="${url}" style="display:inline-block;background:${CYAN};color:${NAVY};font-weight:900;font-size:15px;text-decoration:none;padding:13px 22px;border-radius:10px">${cta}</a></div></td>
  <td width="48%" style="padding:12px 12px 12px 0;vertical-align:middle">${gif(url, 'libros_slide.gif', 'Libros')}</td></tr></table></td></tr>
<tr><td style="background:#fff;border-radius:18px;padding:20px 22px">
  <div style="font-size:18px;font-weight:900;color:${NAVY};padding-bottom:10px">▶ Clases en movimiento</div>
  ${gif(url, 'anim_neumotorax.gif', 'Clase en 3D')}<div style="padding-top:10px">${claseGrid(url)}</div>
  <div style="text-align:center;padding-top:16px">${btn(url, cta, NAVY, '#fff')}</div></td></tr>`
  } else { // m4 · Cupón
    body = `${top}<tr><td style="background:${NAVY};border-radius:18px;padding:18px 10px 10px"><div style="text-align:center">${brand().replace('padding:4px 2px 16px', 'padding:0 0 12px;text-align:center')}</div>
<table role="presentation" width="100%" style="background:#fff;border-radius:16px"><tr><td style="padding:10px">
 <table role="presentation" width="100%" style="border:3px dashed ${ORANGE};border-radius:14px"><tr><td style="padding:24px 18px;text-align:center">
  <div style="font-size:12px;font-weight:800;color:${ORANGE};letter-spacing:3px">🎟️ CUPÓN PERSONAL${n ? ` · DR(A). ${n.toUpperCase()}` : ''}</div>
  <div style="font-size:100px;font-weight:900;color:${NAVY};line-height:1;margin:8px 0 0;letter-spacing:-3px">30%</div>
  <div style="font-size:18px;font-weight:900;color:${BLUE};letter-spacing:4px">DE DESCUENTO</div>
  <div style="display:inline-block;margin-top:14px;background:${NAVY};color:#fff;font-weight:900;font-size:16px;padding:10px 16px;border-radius:10px">En todos los planes: clases, preguntas y libros</div>
  <div style="margin-top:18px">${btn(url, reminder ? 'Canjear hoy →' : 'Canjear mi cupón →', ORANGE, '#fff')}</div>
  <div style="font-size:12px;color:#64748b;margin-top:8px">✓ Ya viene aplicado: no escribes ningún código · vence el ${vence}</div>
 </td></tr></table>
 <div style="padding:18px 6px 6px;font-size:11px;font-weight:800;color:${BLUE};letter-spacing:2px">LO QUE DESBLOQUEA TU CUPÓN</div>
 <div style="padding:0 6px">${gif(url, 'anim_aneurisma.gif', 'Clase en 3D')}</div>
 <div style="padding:8px 2px">${claseGrid(url)}</div>
 <div style="padding:0 6px">${librosLight(url)}</div>
 <div style="padding:12px 6px">${statsCard()}</div>
 <div style="text-align:center;padding:6px 6px 18px">${btn(url, 'Canjear 30% →', ORANGE, '#fff')}</div>
</td></tr></table></td></tr>`
  }
  return {
    subject: reminder ? `Último día de tu 30 %${n ? `, ${n}` : ''}` : `${n ? `${n}, tu` : 'Tu'} 30 % ya está aplicado (vence en 3 días)`,
    html: shell(body, reminder ? `Tu 30 % vence el ${vence}.` : `Tu 30 % en todos los planes ya está aplicado. Vence el ${vence}.`, user.id)
  }
}

// kind: 'drip_clase' | 'discount_30' | 'discount_30_reminder'. expires: Date en que vence el 30 % (día 4 + 72 h)
export function dripEmail(kind, user, { variant, expires } = {}) {
  const v = variant || variantFor(user.id)
  const e = expires || new Date(Date.now() + DISCOUNT_30_HOURS * 3600000)
  const m = kind === 'drip_clase' ? clase(user) : cupon(user, v, e, kind === 'discount_30_reminder')
  return { ...m, variant: kind === 'drip_clase' ? 'clase' : v, headers: { 'List-Unsubscribe': `<${unsubUrl(user.id)}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' } }
}

// Baja en un clic desde los correos de la app
export async function appBaja(db, userId, key) {
  if (!userId || key !== unsubKey(userId)) return false
  const r = await db.execute({ sql: `SELECT email FROM user_profiles WHERE id = ?`, args: [String(userId)] })
  const email = String(r.rows?.[0]?.email || '').toLowerCase().trim()
  if (!email) return false
  await db.execute({ sql: `INSERT OR IGNORE INTO email_suppressions (email, reason, detail) VALUES (?, 'unsubscribed', 'app')`, args: [email] }).catch(() => {})
  return true
}
