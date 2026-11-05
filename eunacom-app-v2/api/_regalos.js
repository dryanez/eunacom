// Libro gratis de los reels «Comenta PALABRA» (página pública /regalo/<slug>). Se monta dentro de
// /api/user-profiles (Vercel ya está en el límite de funciones), igual que _books.js.
// Solo para seguidores: Instagram no deja a una web saber quién sigue la cuenta, así que el filtro real
// lo hace ManyChat («sigue tu cuenta» → DM). El link del DM lleva ?t=<HMAC con REGALO_SECRET> (por libro,
// o por persona con &u=<id de Instagram> vía regalo_dm_link); sin un t válido la página no entrega el PDF.
// Flujo: la persona deja correo o WhatsApp → fila en regalo_leads (Turso) → link firmado de R2 al PDF
// (bucket privado R2_BOOKS_BUCKET, clave libros/<ruta en books/dist>). Nunca un bucket público.
// Al agregar una palabra nueva en AUTOMATIZACIONES_DM.md: sumar el slug aquí y su portada en
// public/regalo/<slug>.jpg (primera página del PDF: scripts/regalo-portadas.sh).

const GORDO = 'gordo', REPASO = 'repaso', ATLAS = 'atlas', GUIA = 'guia'
const KINDS = {
  [GORDO]: { label: 'Libro Gordo', blurb: '90 preguntas de práctica tipo EUNACOM, cada una con su explicación.' },
  [REPASO]: { label: 'Repaso Final', blurb: 'Los temas clave de la especialidad, una página por tema, con plan de repaso de 7 días.' },
  [ATLAS]: { label: 'Atlas de Imágenes', blurb: 'Las imágenes que caen en el EUNACOM, cada una comentada.' },
  [GUIA]: { label: 'Guía', blurb: 'Una guía corta con el mismo formato de nuestros libros.' },
}

// slug → [tipo, especialidad, ruta en books/dist, páginas, { title, blurb } opcional]
// Guías de los reels: books/scripts/build_atlas.cjs --regalo <slug> → books/dist/08_Regalos/
const LIST = {
  endocrinologia: [GORDO, 'Endocrinología', '02_Libros_Gordos_90Q/Libro_Gordo_Endocrinologia_90Q.pdf', 46],
  hematologia: [GORDO, 'Hematología', '02_Libros_Gordos_90Q/Libro_Gordo_Hematologia_90Q.pdf', 45],
  pediatria: [GORDO, 'Pediatría', '02_Libros_Gordos_90Q/Libro_Gordo_Pediatria_90Q.pdf', 37],
  diabetes: [GORDO, 'Diabetes', '02_Libros_Gordos_90Q/Libro_Gordo_Diabetes_90Q.pdf', 34],
  obstetricia: [GORDO, 'Obstetricia', '02_Libros_Gordos_90Q/Libro_Gordo_Obstetricia_90Q.pdf', 40],
  nefrologia: [GORDO, 'Nefrología', '02_Libros_Gordos_90Q/Libro_Gordo_Nefrologia_90Q.pdf', 38],
  urologia: [GORDO, 'Urología', '02_Libros_Gordos_90Q/Libro_Gordo_Urologia_90Q.pdf', 35],
  cardiologia: [GORDO, 'Cardiología', '02_Libros_Gordos_90Q/Libro_Gordo_Cardiologia_90Q.pdf', 32],
  infectologia: [GORDO, 'Infectología', '02_Libros_Gordos_90Q/Libro_Gordo_Infectologia_90Q.pdf', 34],
  neurologia: [GORDO, 'Neurología', '02_Libros_Gordos_90Q/Libro_Gordo_Neurologia_90Q.pdf', 42],
  oftalmologia: [GORDO, 'Oftalmología', '02_Libros_Gordos_90Q/Libro_Gordo_Oftalmologia_90Q.pdf', 29],
  traumatologia: [GORDO, 'Traumatología', '02_Libros_Gordos_90Q/Libro_Gordo_Traumatologia_90Q.pdf', 35],
  otorrinolaringologia: [GORDO, 'Otorrinolaringología', '02_Libros_Gordos_90Q/Libro_Gordo_Otorrinolaringologia_90Q.pdf', 38],
  psiquiatria: [GORDO, 'Psiquiatría', '02_Libros_Gordos_90Q/Libro_Gordo_Psiquiatria_90Q.pdf', 36],
  respiratorio: [GORDO, 'Respiratorio', '02_Libros_Gordos_90Q/Libro_Gordo_Respiratorio_90Q.pdf', 37],
  cirugia: [GORDO, 'Cirugía', '02_Libros_Gordos_90Q/Libro_Gordo_Cirugia_90Q.pdf', 41],
  'repaso-pediatria': [REPASO, 'Pediatría', '05_Repaso_Final/Repaso_Final_Pediatria_2026.pdf', 39],
  'repaso-respiratorio': [REPASO, 'Respiratorio', '05_Repaso_Final/Repaso_Final_Respiratorio_2026.pdf', 35],
  'repaso-oftalmologia': [REPASO, 'Oftalmología', '05_Repaso_Final/Repaso_Final_Oftalmologia_2026.pdf', 26],
  'repaso-otorrinolaringologia': [REPASO, 'Otorrinolaringología', '05_Repaso_Final/Repaso_Final_Otorrinolaringologia_2026.pdf', 28],
  'repaso-diabetes': [REPASO, 'Diabetes', '05_Repaso_Final/Repaso_Final_Diabetes_2026.pdf', 37],
  atlas_imagenes_dermatologia: [ATLAS, 'Dermatología', '06_Atlas/Atlas_Imagenes_Dermatologia_2026.pdf', 68],
  ecg: [GUIA, 'Cardiología', '08_Regalos/Guia_Los_10_ECG_EUNACOM.pdf', 16, {
    title: 'Los 10 ECG que más caen en el EUNACOM',
    blurb: 'Cada trazado con lo que tienes que ver marcado, qué hacer después y su pregunta real del EUNACOM. Al final, autoevaluación.' }],
}

export const REGALOS = Object.fromEntries(Object.entries(LIST).map(([slug, [kind, specialty, file, pages, own = {}]]) => [slug, {
  slug, kind, specialty, file, pages,
  title: own.title || `${KINDS[kind].label} de ${specialty}`,
  blurb: own.blurb || KINDS[kind].blurb,
  cover: `/regalo/${slug}.jpg`,
}]))

const LINK_SECONDS = 3600 // vida del link firmado al PDF
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export async function ensureRegaloTable(db) {
  await db.execute({
    sql: `CREATE TABLE IF NOT EXISTS regalo_leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL,
      email TEXT,
      whatsapp TEXT,
      token TEXT NOT NULL UNIQUE,
      utm_source TEXT,
      utm_medium TEXT,
      utm_campaign TEXT,
      ig_user TEXT,
      downloads INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      last_download_at TEXT
    )`, args: []
  })
  await db.execute({ sql: `ALTER TABLE regalo_leads ADD COLUMN ig_user TEXT`, args: [] }).catch(() => {})
  await db.execute({ sql: `ALTER TABLE regalo_leads ADD COLUMN nombre TEXT`, args: [] }).catch(() => {})
}

// Token del link del DM: HMAC-SHA256(secret, slug[:igUser]) en base64url, 16 caracteres
export async function giftToken(secret, slug, igUser = '') {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(igUser ? `${slug}:${igUser}` : slug)))
  return btoa(String.fromCharCode(...sig.slice(0, 12))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
async function validToken(secret, slug, t, u) {
  if (!secret || !t || !REGALOS[slug]) return false
  const expected = await giftToken(secret, slug, u ? String(u).slice(0, 40) : '')
  return expected.length === String(t).length && expected === String(t)
}
export const giftUrl = (slug, t, u, campaign) =>
  `https://www.eunacomapp.cl/regalo/${slug}?t=${t}${u ? `&u=${encodeURIComponent(u)}` : ''}&utm_source=instagram&utm_medium=dm&utm_campaign=${encodeURIComponent(campaign || slug)}`

const pdfName = r => `${r.title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w]+/g, '_')}_AEE.pdf`
const newToken = () => [...crypto.getRandomValues(new Uint8Array(18))].map(b => b.toString(16).padStart(2, '0')).join('')

async function download(db, lead, opts) {
  const r = REGALOS[lead.slug]
  const url = opts.signFile ? await opts.signFile(r.file, { expiresIn: LINK_SECONDS, filename: pdfName(r), attachment: true }) : null
  if (!url) return null
  await db.execute({ sql: `UPDATE regalo_leads SET downloads = downloads + 1, last_download_at = datetime('now') WHERE id = ?`, args: [lead.id] })
  return url
}

function giftEmail(r, link, nombre) {
  return `<div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;color:#0f172a">
  <h2 style="margin:0 0 12px">Tu ${r.title} 📘</h2>
  <p>¡Hola${nombre ? ` ${nombre.split(' ')[0]}` : ''}! Gracias por seguirnos en Instagram: aquí tienes el libro que pediste. ${r.blurb}</p>
  <p><a href="${link}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:700">Descargar el libro</a></p>
  <p style="font-size:14px">¿Quieres todas las clases y +11.000 preguntas reales? En eunacomapp.cl tienes 20 % en cualquier plan con el código <b>SHORTS20</b>.</p>
  <p style="font-size:12px;color:#64748b">Academia Examen EUNACOM · eunacomapp.cl</p>
</div>`
}

// Devuelve true si atendió la request. La acción va en la query (?action=regalo_…) para que el
// dev server pueda enrutarla sin leer el body. Opciones:
//   signFile(path, { expiresIn, filename }) → URL firmada del bucket privado (null si no hay bucket)
//   sendEmail({ to, subject, html }) → envía el correo con el link (opcional)
//   secret → REGALO_SECRET (sin él no se entrega ningún libro nuevo)
export async function handleRegalo(db, req, res, opts = {}) {
  const q = req.query || {}
  const action = q.action || req.body?.action
  if (!['regalo_lead', 'regalo_link', 'regalo_check', 'regalo_dm_link', 'regalo_baja'].includes(action)) return false

  // Baja de la secuencia de correos (link del pie y List-Unsubscribe one-click): GET muestra la confirmación, POST es el one-click
  if (action === 'regalo_baja') {
    const { regaloBaja } = await import('./_regalo-seq.js')
    const ok = await regaloBaja(db, q.k || req.body?.k)
    res.setHeader?.('Content-Type', 'text/html; charset=utf-8')
    res.status(ok ? 200 : 404).end?.(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><body style="font-family:Arial,sans-serif;max-width:420px;margin:60px auto;padding:0 20px;color:#08365f;text-align:center"><h2>${ok ? 'Listo, no te escribiremos más' : 'Link no válido'}</h2><p style="color:#475569">${ok ? 'Te sacamos de los correos de Academia Examen EUNACOM.' : 'Si quieres darte de baja, responde cualquier correo nuestro.'}</p><p><a href="https://eunacom-examen.cl" style="color:#0b5ea8">eunacom-examen.cl</a></p></body>`)
    return true
  }

  // ¿El link del DM es válido? (la página decide si muestra el formulario)
  if (req.method === 'GET' && action === 'regalo_check') {
    res.json({ ok: await validToken(opts.secret, String(q.slug || ''), q.t, q.u) })
    return true
  }

  // ManyChat Pro, «External Request»: link personal para el seguidor. Header Authorization: Bearer <REGALO_SECRET>
  if (action === 'regalo_dm_link') {
    const auth = String(req.headers?.authorization || '')
    if (!opts.secret || auth !== `Bearer ${opts.secret}`) { res.status(401).json({ error: 'Unauthorized' }); return true }
    const slug = String(q.slug || req.body?.slug || '')
    const uid = String(q.uid || req.body?.uid || '').slice(0, 40)
    if (!REGALOS[slug]) { res.status(404).json({ error: 'Libro no encontrado' }); return true }
    res.json({ url: giftUrl(slug, await giftToken(opts.secret, slug, uid), uid, q.campaign || req.body?.campaign) })
    return true
  }

  // Volver a descargar con el token del correo o del navegador
  if (req.method === 'GET' && action === 'regalo_link') {
    await ensureRegaloTable(db)
    const lead = (await db.execute({ sql: `SELECT * FROM regalo_leads WHERE token = ? AND slug = ?`, args: [String(q.k || ''), String(q.slug || '')] })).rows?.[0]
    if (!lead || !REGALOS[lead.slug]) { res.status(404).json({ error: 'Link no válido' }); return true }
    const url = await download(db, lead, opts)
    if (!url) { res.status(503).json({ error: 'Descarga no disponible por ahora' }); return true }
    res.json({ url })
    return true
  }

  if (req.method !== 'POST' || action !== 'regalo_lead') { res.status(405).json({ error: 'Method not allowed' }); return true }
  const b = req.body || {}
  const r = REGALOS[b.slug]
  if (!r) { res.status(404).json({ error: 'Libro no encontrado' }); return true }
  if (!(await validToken(opts.secret, r.slug, b.t, b.u))) {
    res.status(403).json({ error: 'Este libro es para quienes nos siguen: comenta la palabra en el reel y te llega el link por DM.' }); return true
  }
  const email = String(b.email || '').trim().toLowerCase().slice(0, 160)
  const nombre = String(b.nombre || '').replace(/\s+/g, ' ').trim().slice(0, 80) || null
  const whatsapp = String(b.whatsapp || '').replace(/[^\d+]/g, '').slice(0, 20)
  if (email && !EMAIL_RE.test(email)) { res.status(400).json({ error: 'Revisa tu correo' }); return true }
  if (!email && whatsapp.replace(/\D/g, '').length < 8) { res.status(400).json({ error: 'Escribe tu correo o tu WhatsApp con código de país' }); return true }

  await ensureRegaloTable(db)
  const contactCol = email ? 'email' : 'whatsapp'
  const contact = email || whatsapp
  let lead = (await db.execute({ sql: `SELECT * FROM regalo_leads WHERE slug = ? AND ${contactCol} = ? LIMIT 1`, args: [r.slug, contact] })).rows?.[0]
  const isNew = !lead
  if (!lead) {
    const utm = b.utm || {}
    const cut = v => (v ? String(v).slice(0, 80) : null)
    const token = newToken()
    await db.execute({
      sql: `INSERT INTO regalo_leads (slug, nombre, email, whatsapp, token, utm_source, utm_medium, utm_campaign, ig_user) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [r.slug, nombre, email || null, email ? null : whatsapp, token, cut(utm.source), cut(utm.medium), cut(utm.campaign), b.u ? String(b.u).slice(0, 40) : null]
    })
    lead = (await db.execute({ sql: `SELECT * FROM regalo_leads WHERE token = ?`, args: [token] })).rows[0]
  }

  const url = await download(db, lead, opts)
  if (!url) { res.status(503).json({ error: 'Descarga no disponible por ahora. Te escribiremos con el libro.' }); return true }

  let emailed = false
  if (email && isNew && opts.sendEmail) {
    const link = `https://www.eunacomapp.cl/regalo/${r.slug}?k=${lead.token}&utm_source=email&utm_medium=regalo&utm_campaign=${r.slug}`
    emailed = await opts.sendEmail({ to: email, subject: `Tu ${r.title} gratis 📘`, html: giftEmail(r, link, nombre) }).then(() => true, () => false)
  }
  res.json({ url, token: lead.token, emailed })
  return true
}
