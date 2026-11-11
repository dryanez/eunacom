// Secuencia de correos para quienes bajaron un libro gratis de los reels (tabla regalo_leads, ver _regalos.js).
// La corre el cron diario (api/email-marketing-cron.js): a cada persona a lo más un correo cada 2 días, según los días
// desde que descargó. El correo del día 0 (el link del libro) ya lo manda _regalos.js al descargar.
//   día 1: una pregunta real de su especialidad + cómo usar el libro · día 3: el método (clases, manual, preguntas, repaso)
//   día 5: por dentro del Manual · día 8: el Manual o la librería completa
// Mismo diseño que el correo del día 0 (portadas, cajas, precio). Datos reales por especialidad en _regalo-seq-data.js
// (generado: preguntas de los shorts, catálogo del Aula, banco AEE). Imágenes en public/email/regalo/.
// La oferta es la de la página del regalo (eunacom-examen.cl/?regalo=<slug>&k=<token>): el Manual a $9.990 (código REGALO).
// Nada de plazos falsos: el precio de regalo no vence. Baja en un clic (?action=regalo_baja&k=) → email_suppressions.
import { REGALOS } from './_regalos.js'
import { SEQ_DATA } from './_regalo-seq-data.js'

const AEE = 'https://eunacom-examen.cl'
const IMG = 'https://www.eunacomapp.cl/email/regalo'
const API = 'https://www.eunacomapp.cl/api/user-profiles'
const IG = 'https://www.instagram.com/academiaeunacom/'
const PRICE = { manual: '$19.990', regalo: '$9.990', clases: '$24.990', banco: '$9.990', repaso: '$12.990' }
export const REGALO_SEQ = [
  { step: 1, day: 1, key: 'uso' },
  { step: 2, day: 3, key: 'estudio' },
  { step: 3, day: 5, key: 'manual' },
  { step: 4, day: 8, key: 'cierre' },
]
const NAVY = '#0a365f', BLUE = '#0b5ea8', INK = '#334155', MUTED = '#64748b'

const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
const first = n => String(n || '').trim().split(/\s+/)[0]
const fmt = n => Number(n).toLocaleString('es-CL')
const utm = (slug, key) => `utm_source=email&utm_medium=regalo_seq&utm_campaign=${encodeURIComponent(slug)}&utm_content=${key}`
const giftUrl = (lead, key) => `${AEE}/?regalo=${encodeURIComponent(lead.slug)}&k=${encodeURIComponent(lead.token)}&${utm(lead.slug, key)}`
const libUrl = (lead, key) => `${AEE}/?code=SHORTS20&${utm(lead.slug, key)}#tienda`
export const unsubUrl = lead => `${API}?action=regalo_baja&k=${encodeURIComponent(lead.token)}`
const cov = name => `${AEE}/covers/${name}.jpg`
const specKey = s => {
  const k = String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  return { respiratorio: 'neumologia', otorrinolaringologia: 'otorrino' }[k] || k
}

// Qué es cada regalo, para hablar de él con propiedad
const KIND = {
  gordo: { label: 'Libro Gordo', art: 'lo', have: esp => `Tienes <b>90 preguntas de ${esp}</b> con su explicación.` },
  repaso: { label: 'Repaso Final', art: 'lo', have: esp => `Tienes <b>los temas clave de ${esp}</b>, una página por tema.` },
  atlas: { label: 'Atlas', art: 'lo', have: esp => `Tienes <b>las imágenes de ${esp}</b> que caen en el EUNACOM, comentadas.` },
  guia: { label: 'Guía', art: 'la', have: () => '' },
}
// Cómo usar cada tipo de regalo (método de estudio, no contenido médico)
const USO = {
  gordo: [['Hazlo como examen:', 'bloques de 30 preguntas, reloj corriendo, sin mirar la clave.'], ['Corrige y anota', 'el código del Perfil V3 de cada error.'], ['En 3 días repite solo esas.', 'Ahí se queda lo que más cae.']],
  repaso: [['Una página por tema,', 'sin saltarte el recuadro de perlas.'], ['Sigue el plan de 7 días', 'del final del libro.'], ['El día antes del examen,', 'solo los recuadros.']],
  atlas: [['Tapa el texto', 'y mira cada foto: ¿qué ves y qué diagnóstico es?'], ['Compara', 'con los marcadores y la conducta inicial de cada ficha.'], ['Cierra con la autoevaluación', 'del final, sin respuestas a la vista.']],
  guia: [['Mira cada trazado primero solo,', 'sin leer, y di tú el diagnóstico.'], ['Compara', 'con los marcadores numerados y con «Qué tienes que ver».'], ['Al final haz la autoevaluación:', 'las imágenes sin marcas, como en el examen.']],
}

// ── piezas ───────────────────────────────────────────────────────────────────
const btn = (href, text, bg = NAVY) => `<a href="${href}" style="display:inline-block;background:${bg};color:#fff;padding:14px 26px;border-radius:12px;text-decoration:none;font-weight:800;font-size:16px">${text}</a>`
const coverImg = (src, w = 110, alt = '') => `<img src="${src}" width="${w}" alt="${esc(alt)}" style="display:block;width:${w}px;border-radius:6px;box-shadow:0 6px 16px rgba(10,54,95,.25)">`
const pill = (t, bg = '#fef3c7', fg = '#92400e') => `<span style="display:inline-block;background:${bg};color:${fg};font-size:12px;font-weight:800;padding:4px 10px;border-radius:999px">${t}</span>`
const li = t => `<tr><td style="padding:3px 8px 3px 0;color:${BLUE};font-weight:800;vertical-align:top">✓</td><td style="padding:3px 0;color:#1e293b;font-size:14px">${t}</td></tr>`
const price = (big = 28) => `<span style="color:#94a3b8;text-decoration:line-through;font-size:15px">${PRICE.manual}</span> <span style="color:${NAVY};font-size:${big}px;font-weight:900">${PRICE.regalo}</span> <span style="background:#fce7f3;color:#9d174d;font-size:12px;font-weight:800;padding:3px 8px;border-radius:6px">Precio de regalo</span>`
const rule = t => esc(t).replace(/\*([^*]+)\*/g, '<span style="background:#fde68a;padding:0 4px">$1</span>')
const stat = (big, small, w = '33%') => `<td width="${w}" align="center" style="padding:10px 4px;background:#fff;border:1px solid #e2e8f0;border-radius:10px"><div style="color:${NAVY};font-size:20px;font-weight:900;line-height:1.15">${big}</div><div style="color:${MUTED};font-size:11px">${small}</div></td>`

function layout({ lead, r, preheader, rows }) {
  return `<!DOCTYPE html><html lang="es-CL"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#eef4fb">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef4fb;font-family:Arial,Helvetica,sans-serif"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#fff;border-radius:18px;overflow:hidden">
<tr><td style="padding:18px 24px;border-bottom:1px solid #e2e8f0"><a href="${AEE}" style="text-decoration:none"><table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td style="padding-right:12px;vertical-align:middle"><img src="${IMG}/aee.png" width="64" height="35" alt="AEE" style="display:block;width:64px;height:35px"></td>
<td style="vertical-align:middle;color:${NAVY};font-size:18px;font-weight:900;letter-spacing:-.2px">Academia Examen EUNACOM</td></tr></table></a></td></tr>
${rows}
<tr><td style="padding:4px 24px 22px;font-size:15px;line-height:1.6;color:${INK}">Mucho éxito,<br><b>Dr. Felipe Yáñez</b><br><span style="color:${MUTED};font-size:13px">Academia Examen EUNACOM</span></td></tr>
<tr><td style="padding:16px 24px 22px;background:#f8fafc;color:${MUTED};font-size:12px;line-height:1.5">
Academia Examen EUNACOM · <a href="${AEE}" style="color:${BLUE}">eunacom-examen.cl</a> · Instagram <a href="${IG}" style="color:${BLUE}">@academiaeunacom</a><br>
Recibes este correo porque descargaste «${esc(r.title)}» en eunacom-examen.cl. · <a href="${unsubUrl(lead)}" style="color:${MUTED}">No quiero más correos</a>
</td></tr></table></td></tr></table></body></html>`
}

const hero = (kicker, title, text, img, alt) => `<tr><td style="padding:26px 24px 8px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td width="110" style="vertical-align:top;padding-right:16px">${coverImg(img, 110, alt)}</td>
<td style="vertical-align:top"><div style="color:${BLUE};font-size:13px;font-weight:800">${kicker}</div>
<h1 style="margin:6px 0 8px;color:${NAVY};font-size:22px;line-height:1.25">${title}</h1>
<p style="margin:0;color:${INK};font-size:14px;line-height:1.5">${text}</p></td></tr></table></td></tr>`

const manualBox = (lead, key, esp, pages, title, tag, utmKey) => `<tr><td style="padding:8px 24px 26px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:2px solid ${NAVY};border-radius:16px">
<tr><td style="padding:20px 20px 6px">${pill(tag)}<h2 style="margin:10px 0 0;color:${NAVY};font-size:21px">${title}</h2></td></tr>
<tr><td style="padding:12px 20px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td width="120" style="vertical-align:top;padding-right:16px"><a href="${giftUrl(lead, utmKey)}">${coverImg(cov(`tomo_${key}`), 120, `Manual de ${esp}`)}</a></td>
<td style="vertical-align:top"><table role="presentation" cellpadding="0" cellspacing="0">
${pages ? li(`${pages} páginas: toda la teoría de ${esp} del Perfil V3`) : li(`Toda la teoría de ${esp} del Perfil V3`)}${li('Algoritmos, tablas y perlas EUNACOM')}${li('Fotos clínicas en contexto')}${li('Lo descargas al tiro, en PDF')}
</table></td></tr></table></td></tr>
<tr><td style="padding:4px 20px 0">${price()}</td></tr>
<tr><td style="padding:14px 20px 22px">${btn(giftUrl(lead, utmKey), `Quiero el Manual a ${PRICE.regalo} →`, BLUE)}<div style="color:${MUTED};font-size:12px;margin-top:8px">Mercado Pago, Webpay, PayPal o transferencia.</div></td></tr>
</table></td></tr>`

// La pregunta real del día 1: de su especialidad y, si se puede, distinta del reel donde comentó (utm_campaign = palabra)
function pickQuestion(d, lead) {
  const qs = d?.questions || []
  const seen = String(lead.utm_campaign || '').toUpperCase()
  return qs.find(q => q.kw && q.kw !== seen) || qs.find(q => q.kw !== seen) || qs[0] || null
}

// Asunto + HTML de un paso para un lead
export function regaloEmail(lead, step) {
  const r = REGALOS[lead.slug] || { title: 'tu libro', specialty: 'la especialidad', kind: 'guia', cover: '' }
  const key = specKey(r.specialty), d = SEQ_DATA[key] || null
  const n = first(lead.nombre), esp = esc(r.specialty)
  const k = KIND[r.kind] || KIND.guia
  const gift = r.cover ? `${AEE}${r.cover}` : cov(`gordo_${key}`)
  const q = pickQuestion(d, lead)
  const s = REGALO_SEQ.find(x => x.step === step)
  const L = rows => layout({ lead, r, ...rows })

  if (s.key === 'uso') {
    const pregunta = !q ? '' : `<tr><td style="padding:18px 24px 6px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${NAVY};border-radius:16px"><tr>
<td width="150" style="vertical-align:top;padding:16px 0 16px 16px"><a href="${IG}"><img src="${IMG}/${q.id}.jpg" width="134" alt="Reel: ${esc(q.top)}" style="display:block;width:134px;border-radius:10px;border:1px solid #1e4f80"></a>
<div style="margin-top:8px;text-align:center"><a href="${IG}" style="color:#fde68a;font-size:13px;font-weight:800;text-decoration:none">▶ Ver el reel</a></div></td>
<td style="vertical-align:top;padding:18px 18px 18px 16px;color:#fff">${pill(`PREGUNTA REAL · EUNACOM ${esc(q.date).toUpperCase()}`, '#fde68a', '#78350f')}
<div style="margin:12px 0 6px;font-size:15px;line-height:1.5;color:#cfe3f7">${q.case.map(esc).join(' · ')}</div>
<div style="font-size:19px;font-weight:900;line-height:1.3">${esc(q.q)}</div>
<div style="margin-top:10px;font-size:13px;color:#9cc3ea">Piénsalo 5 segundos y baja 👇</div></td></tr></table></td></tr>
<tr><td style="padding:10px 24px 6px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:14px"><tr><td style="padding:16px 18px;color:#064e3b;font-size:14px;line-height:1.55">
<div style="font-size:16px;font-weight:900;margin-bottom:6px">✅ ${esc(q.ans)}</div>${esc(q.why)}
<div style="margin-top:12px;background:#fff;border-radius:10px;padding:10px 12px;color:${NAVY};font-weight:800">⭐ Regla de oro: ${rule(q.rule)}</div>
</td></tr></table></td></tr>`
    const pasos = (USO[r.kind] || USO.guia).map(([b, t], i) => `<tr><td width="34" style="vertical-align:top;padding:0 10px 12px 0"><div style="width:28px;height:28px;border-radius:999px;background:${BLUE};color:#fff;font-weight:900;font-size:14px;text-align:center;line-height:28px">${i + 1}</div></td>
<td style="vertical-align:top;padding:4px 0 12px;color:${INK};font-size:14px;line-height:1.5"><b>${esc(b)}</b> ${esc(t)}</td></tr>`).join('')
    const have = r.kind === 'guia' ? esc(r.blurb) : k.have(esp)
    return {
      subject: q ? `${n ? `${n}, ` : ''}¿qué harías aquí? Pregunta real de ${r.specialty}` : `${n ? `${n}, ` : ''}cómo sacarle el jugo a tu ${k.label}`,
      html: L({
        preheader: q ? `${q.top}: pregunta real del EUNACOM, con su respuesta.` : `3 pasos para que tu ${k.label} te sirva de verdad.`,
        rows: hero(`📘 TU ${k.label.toUpperCase()}`, `¿Ya ${k.art} abriste${n ? `, ${esc(n)}` : ''}?`, `${have}${q ? ' Antes de partir, prueba con esta, que salió en el EUNACOM:' : ''}`, gift, r.title)
          + pregunta
          + `<tr><td style="padding:22px 24px 4px"><div style="color:${NAVY};font-size:17px;font-weight:900;margin-bottom:12px">Cómo sacarle el jugo a tu ${k.label}</div><table role="presentation" cellpadding="0" cellspacing="0">${pasos}</table></td></tr>`
          + `<tr><td style="padding:6px 24px 24px">${btn(giftUrl(lead, 'uso'), `📘 Abrir mi ${k.label}`)}</td></tr>`,
      }),
    }
  }

  if (s.key === 'estudio') {
    const paso = (num, titulo, texto, img, estado) => `<tr><td style="padding:0 24px 12px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px"><tr>
<td width="78" style="vertical-align:top;padding:14px 0 14px 14px">${coverImg(img, 64)}</td>
<td style="vertical-align:top;padding:14px 16px"><div style="color:${BLUE};font-size:12px;font-weight:900;letter-spacing:.5px">PASO ${num}</div>
<div style="color:${NAVY};font-size:17px;font-weight:900;margin:2px 0 4px">${titulo}</div>
<div style="color:${INK};font-size:14px;line-height:1.5">${texto}</div><div style="margin-top:8px">${estado}</div></td></tr></table></td></tr>`
    const c = d?.classes, b = d?.bank
    const hm = c ? `${Math.floor(c.min / 60)} h ${String(c.min % 60).padStart(2, '0')} min` : ''
    const lista = !c ? '' : `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:10px;background:#fff;border:1px solid #e2e8f0;border-radius:10px">
${c.list.map(([num, t, m]) => `<tr><td style="padding:5px 8px;color:${MUTED};font-size:12px;font-weight:800;white-space:nowrap;vertical-align:top">▶ ${esc(num)}</td><td style="padding:5px 4px;color:#1e293b;font-size:13px;line-height:1.35">${esc(t)}</td><td style="padding:5px 8px;color:${MUTED};font-size:12px;white-space:nowrap;vertical-align:top;text-align:right">${m} min</td></tr>`).join('')}
${c.n > c.list.length ? `<tr><td colspan="3" style="padding:6px 8px 8px;color:${BLUE};font-size:13px;font-weight:800">+ ${c.n - c.list.length} clases más de ${esp}</td></tr>` : ''}</table>`
    const preg = !b ? '' : `<table role="presentation" width="100%" cellpadding="0" cellspacing="4" style="margin-top:8px"><tr>
${stat('90', r.kind === 'gordo' ? 'en tu Libro Gordo ✓' : 'en el Libro Gordo')}${stat(`+${fmt(b.total)}`, 'en el banco AEE')}${stat(fmt(b.real), 'de exámenes reales')}</tr></table>`
    const tengo = pill('✓ Ya lo tienes', '#dcfce7', '#166534')
    return {
      subject: `Cómo estudiar ${r.specialty} para el EUNACOM`,
      html: L({
        preheader: `El orden que funciona: clases, manual, preguntas y repaso.`,
        rows: hero('🧭 MÉTODO AEE', `Cómo estudiar ${esp} para el EUNACOM`, `${n ? `Hola ${esc(n)}. ` : ''}${esp} se aprueba en cuatro pasos y en este orden:`, gift, r.title)
          + '<tr><td style="height:14px"></td></tr>'
          + (c ? paso(1, `Mira las clases · ${c.n} clases, ${hm}`, `Una clase por tema del Perfil V3, con animaciones y casos tipo examen al final.${lista}`, cov(`clase_${key}`), pill(`Clases de ${esp} · ${PRICE.clases}`, '#dbeafe', '#1e3a8a')) : '')
          + paso(c ? 2 : 1, 'Lee el Manual, una vez y completo', `Todo el Perfil V3 de ${esp} de principio a fin, con algoritmos y tablas.`, cov(`tomo_${key}`), pill(`Manual · ${PRICE.regalo} con tu regalo`, '#fce7f3', '#9d174d'))
          + paso(c ? 3 : 2, 'Haz preguntas', `Cada error te dice qué código del Perfil repasar.${preg}`, cov(`gordo_${key}`), r.kind === 'gordo' ? tengo : pill(`Banco de ${esp} · ${PRICE.banco}`, '#dbeafe', '#1e3a8a'))
          + paso(c ? 4 : 3, 'Repaso corto la última semana', 'Solo perlas y algoritmos, una página por tema.', cov(`repaso_${key}`), r.kind === 'repaso' ? tengo : pill(`Repaso Final · ${PRICE.repaso}`, '#f1f5f9', '#334155'))
          + manualBox(lead, key, esp, d?.manualPages, 'Empieza por el Manual', 'Con tu regalo, a mitad de precio', 'estudio'),
      }),
    }
  }

  if (s.key === 'manual') {
    const st = (big, small) => `<td align="center" style="padding:12px 6px;background:#f8fafc;border-radius:12px"><div style="color:${NAVY};font-size:24px;font-weight:900">${big}</div><div style="color:${MUTED};font-size:12px">${small}</div></td>`
    return {
      subject: `Por dentro del Manual de ${r.specialty}`,
      html: L({
        preheader: `Toda la teoría del Perfil V3 de ${r.specialty} en un PDF.`,
        rows: `<tr><td align="center" style="padding:28px 24px 6px">${pill('POR DENTRO DEL MANUAL')}
<h1 style="margin:12px 0 6px;color:${NAVY};font-size:24px;line-height:1.25">Manual de ${esp}</h1>
<p style="margin:0 0 18px;color:${INK};font-size:15px;line-height:1.5">${n ? `Hola ${esc(n)}. ` : ''}Si tu ${k.label} te mostró dónde fallas, el Manual es donde lo arreglas.</p>
<a href="${giftUrl(lead, 'manual')}"><img src="${cov(`tomo_${key}`)}" width="200" alt="Manual de ${esp}" style="display:block;width:200px;border-radius:8px;box-shadow:0 14px 30px rgba(10,54,95,.30)"></a></td></tr>
<tr><td style="padding:22px 24px 4px"><table role="presentation" width="100%" cellpadding="0" cellspacing="6"><tr>${d?.manualPages ? st(d.manualPages, 'páginas') : ''}${st('V3', 'todo el Perfil')}${st('PDF', 'celular y PC')}</tr></table></td></tr>
<tr><td style="padding:14px 24px 4px"><table role="presentation" cellpadding="0" cellspacing="0">
${li('Tema por tema, en el orden del Perfil V3 del EUNACOM')}${li('Algoritmos y tablas para decidir rápido')}${li('Perlas EUNACOM en recuadros: lo que más se pregunta')}${li('Fotos clínicas junto al párrafo que las explica')}</table></td></tr>
${q ? `<tr><td style="padding:12px 24px 4px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef4fb;border-radius:14px"><tr><td style="padding:14px 16px;color:${NAVY};font-size:14px;line-height:1.5">
💡 <b>¿Te acuerdas de «${esc(q.top)}»?</b> Ese tema está en el Manual, explicado de principio a fin.</td></tr></table></td></tr>` : ''}
<tr><td style="padding:18px 24px 6px">${price()}</td></tr>
<tr><td style="padding:10px 24px 24px">${btn(giftUrl(lead, 'manual'), `Quiero el Manual a ${PRICE.regalo} →`, BLUE)}<div style="color:${MUTED};font-size:12px;margin-top:8px">Si ya lo compraste, ¡gracias! Ignora este correo.</div></td></tr>`,
      }),
    }
  }

  // cierre: dos caminos
  const grid = ['tomo_cardiologia', 'tomo_pediatria', 'gordo_cirugia', 'repaso_obstetricia', 'atlas_dermatologia', 'gordo_neurologia'].map(c => `<td style="padding:0 3px">${coverImg(cov(c), 56)}</td>`).join('')
  const cell = (num, t, sub) => `<td width="33%" align="center" style="padding:10px 4px;background:#f8fafc;border-radius:10px"><div style="color:${NAVY};font-size:20px;font-weight:900;line-height:1.1">${num}</div><div style="color:#1e293b;font-size:12px;font-weight:800">${t}</div><div style="color:${MUTED};font-size:11px">${sub}</div></td>`
  const lib = `<table role="presentation" width="100%" cellpadding="0" cellspacing="6" style="margin-top:10px">
<tr>${cell('21', 'Manuales', '+2.500 páginas')}${cell('21', 'Libros Gordos', '1.890 preguntas')}${cell('21', 'Repaso Final', '1 por especialidad')}</tr>
<tr>${cell('19', 'Atlas', 'de imágenes')}${cell('468', 'clases en video', '96 horas')}${cell('+10.800', 'preguntas', 'en el banco')}</tr></table>
<div style="color:${INK};font-size:13px;line-height:1.5;margin:4px 0 0">+ 21 guías Perfil V3 código por código, 21 mazos Anki y 16 reconstrucciones de exámenes reales (2013–2025).</div>`
  const camino = (tag, titulo, cuerpo, precio, boton, borde) => `<tr><td style="padding:0 24px 14px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:2px solid ${borde};border-radius:16px"><tr><td style="padding:18px 20px">
${tag}<div style="color:${NAVY};font-size:19px;font-weight:900;margin:8px 0 8px">${titulo}</div>${cuerpo}<div style="margin:10px 0 12px">${precio}</div>${boton}</td></tr></table></td></tr>`
  return {
    subject: n ? `${n}, ¿seguimos con ${r.specialty}?` : `¿Seguimos con ${r.specialty}?`,
    html: L({
      preheader: `El Manual de ${r.specialty} o la librería completa: tú eliges.`,
      rows: hero('✉️ ÚLTIMO CORREO SOBRE TU REGALO', `${n ? `${esc(n)}, ` : ''}¿seguimos?`, `Si ${esc(r.title)} te sirvió, tienes dos caminos:`, gift, r.title)
        + '<tr><td style="height:12px"></td></tr>'
        + camino(pill(`SOLO ${esp.toUpperCase()}`, '#dbeafe', '#1e3a8a'), `Manual de ${esp}`,
          `<table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="padding-right:14px">${coverImg(cov(`tomo_${key}`), 70)}</td><td style="color:${INK};font-size:14px;line-height:1.5">Toda la teoría del Perfil V3 de ${esp}, en PDF.</td></tr></table>`,
          `<span style="color:#94a3b8;text-decoration:line-through">${PRICE.manual}</span> <b style="color:${NAVY};font-size:24px">${PRICE.regalo}</b>`, btn(giftUrl(lead, 'cierre'), 'Quiero el Manual →', BLUE), '#cbd5e1')
        + camino(pill('TODO EL EXAMEN'), 'La librería AEE completa', `<table role="presentation" cellpadding="0" cellspacing="0"><tr>${grid}</tr></table>${lib}`,
          `<b style="color:${NAVY};font-size:20px">20 % de descuento</b> <span style="color:${MUTED};font-size:13px">con el código</span> <span style="background:${NAVY};color:#fff;font-weight:900;padding:3px 8px;border-radius:6px;font-size:13px">SHORTS20</span>`,
          btn(libUrl(lead, 'cierre'), 'Ver la librería →'), NAVY)
        + `<tr><td style="padding:4px 24px 20px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fdf2f8;border-radius:14px"><tr><td style="padding:14px 16px;color:#831843;font-size:14px;line-height:1.5">
🎁 <b>Cada semana hay un regalo nuevo en Instagram.</b> Comenta la palabra del reel y te llega por DM. <a href="${IG}" style="color:#9d174d;font-weight:800">Seguir a @academiaeunacom →</a></td></tr></table></td></tr>`,
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
