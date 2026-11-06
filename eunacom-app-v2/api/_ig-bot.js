// Bot propio de Instagram «Comenta PALABRA → DM con el libro» (reemplazo de ManyChat) para @academiaeunacom.
// Se monta dentro de /api/user-profiles (Vercel está en el límite de 12 funciones), igual que _regalos.js.
//   GET  ?action=ig_webhook&hub.mode=subscribe&hub.verify_token=…&hub.challenge=…  → verificación de Meta
//   POST (body.object === 'instagram')  → evento `comments`: respuesta privada (DM) + respuesta pública
//   GET  ?action=ig_status  (Authorization: Bearer REGALO_SECRET) → config + últimas 30 respuestas
// API: Instagram API with Instagram Login (graph.instagram.com). Guía de configuración: docs/IG_BOT_SETUP.md
//
// Variables (Vercel, las pone Felipe; nunca en git):
//   IG_BOT_ENABLED=1     interruptor. Apagado (por defecto) solo responde la palabra de prueba IG_BOT_TEST_WORD,
//                        para que ManyChat y el bot nunca contesten el mismo comentario.
//   IG_ACCESS_TOKEN      token largo (60 días) de usuario de Instagram de @academiaeunacom. Se renueva solo
//                        (se guarda el nuevo en Turso, tabla ig_bot_state).
//   IG_VERIFY_TOKEN      el texto que se pone en «Verify token» del webhook en Meta for Developers.
//   IG_APP_SECRET        «Instagram app secret» (opcional): valida X-Hub-Signature-256.
//   IG_BOT_TEST_WORD     palabra de prueba (por defecto PRUEBABOT → guía ECG). ManyChat no la conoce.
//   REGALO_SECRET        el mismo de _regalos.js (token ?t= del link del regalo).

import { REGALOS, giftToken } from './_regalos.js'

const GRAPH = `https://graph.instagram.com/${process.env.IG_GRAPH_VERSION || 'v24.0'}`
const OWN_USERNAME = 'academiaeunacom'

// Palabra → slug del regalo. Las mismas 52 de ManyChat (Essential, «cualquier publicación o reel»).
// La palabra en minúsculas es el utm_campaign. Al sumar un reel nuevo: agregar la palabra aquí.
export const IG_KEYWORDS = {
  ECG: 'ecg', ATLAS: 'atlas_imagenes_dermatologia', OJO: 'oftalmologia', TORSION: 'urologia', URETRA: 'urologia',
  ACV: 'neurologia', EPLEY: 'repaso-otorrinolaringologia', POTASIO: 'nefrologia', MAGNESIO: 'obstetricia',
  CROUP: 'pediatria', LITIO: 'psiquiatria', SUERO: 'repaso-diabetes', NEUMOTORAX: 'respiratorio',
  COMPARTIMENTO: 'traumatologia', INFARTO: 'cardiologia', TAPONAMIENTO: 'cardiologia', SEPSIS: 'infectologia',
  CAPTOPRIL: 'cardiologia', PTT: 'hematologia', TBC: 'respiratorio', AORTA: 'cardiologia', FEBRIL: 'neurologia',
  CEFALEA: 'neurologia', ECTOPICO: 'obstetricia', EDEMA: 'cardiologia', GRAVES: 'endocrinologia',
  TRICICLICO: 'psiquiatria', GLAUCOMA: 'oftalmologia', HIPOGLICEMIA: 'repaso-diabetes', SODA: 'oftalmologia',
  FERRITINA: 'hematologia', SABANA: 'traumatologia', OIDO: 'otorrinolaringologia', OTITIS: 'otorrinolaringologia',
  PILORO: 'pediatria', PIELO: 'nefrologia', MALARIA: 'infectologia', HEMANGIOMA: 'atlas_imagenes_dermatologia',
  TREMENS: 'psiquiatria', COLICO: 'urologia', METACOLINA: 'respiratorio', MIXEDEMA: 'endocrinologia',
  TIROIDITIS: 'endocrinologia', TROMBO: 'cardiologia', HEMORRAGIA: 'obstetricia', QUEMADURA: 'cirugia',
  SALES: 'pediatria', PSICOSIS: 'psiquiatria', CRISIS: 'endocrinologia', ESTRIDOR: 'repaso-pediatria',
  PEDIATRIA: 'pediatria', AGUJA: 'repaso-respiratorio',
}

const PUBLIC_REPLIES = ['¡Listo! Te lo mandé por DM 📩', 'Revisa tus mensajes, ya te llegó 📘', '¡Enviado! Mira tu DM 🚀']

const norm = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase()
const testWord = () => norm(process.env.IG_BOT_TEST_WORD || 'PRUEBABOT')
const enabled = () => process.env.IG_BOT_ENABLED === '1'

// Primera palabra del comentario que sea una palabra clave («torsión 🙏» → TORSION). Palabras completas, sin tildes.
export function matchKeyword(text) {
  const words = norm(text).split(/[^A-Z0-9]+/).filter(Boolean)
  const test = testWord()
  for (const w of words) {
    if (w === test) return { word: w, slug: 'ecg', test: true }
    if (IG_KEYWORDS[w]) return { word: w, slug: IG_KEYWORDS[w], test: false }
  }
  return null
}

export async function giftLink(secret, slug, word) {
  return `https://eunacom-examen.cl/?regalo=${slug}&t=${await giftToken(secret, slug)}&utm_source=instagram&utm_medium=dm&utm_campaign=${encodeURIComponent(word.toLowerCase())}`
}

// Los 3 formatos de DM, del más lindo al más simple. Meta documenta solo texto para respuestas privadas;
// se prueba en orden y se usa el primero que Meta acepte (queda anotado en ig_bot_replies.format).
export function dmMessages(r, link, username) {
  const hola = username ? `¡Hola @${username}! ` : '¡Hola! '
  return [
    ['generic', { attachment: { type: 'template', payload: { template_type: 'generic', elements: [{
      title: r.title.slice(0, 80),
      subtitle: `Gratis · PDF de ${r.pages} páginas. Toca el botón 👇`.slice(0, 80),
      image_url: `https://eunacom-examen.cl${r.cover}`,
      default_action: { type: 'web_url', url: link },
      buttons: [{ type: 'web_url', url: link, title: 'Quiero mi libro' }],
    }] } } }],
    ['button', { attachment: { type: 'template', payload: { template_type: 'button',
      text: `${hola}Aquí está tu regalo: ${r.title} 🎁 Toca el botón y te lo mando a tu correo.`.slice(0, 640),
      buttons: [{ type: 'web_url', url: link, title: 'Quiero mi libro' }],
    } } }],
    ['text', { text: `${hola}Aquí está tu regalo: ${r.title} 🎁\nPídelo aquí y te llega a tu correo 👉 ${link}` }],
  ]
}

async function ensureTables(db) {
  await db.execute({ sql: `CREATE TABLE IF NOT EXISTS ig_bot_replies (
    comment_id TEXT PRIMARY KEY, media_id TEXT, from_id TEXT, username TEXT, text TEXT, word TEXT, slug TEXT,
    status TEXT, format TEXT, error TEXT, public_reply_id TEXT, created_at TEXT DEFAULT (datetime('now')))`, args: [] })
  await db.execute({ sql: `CREATE TABLE IF NOT EXISTS ig_bot_state (k TEXT PRIMARY KEY, v TEXT, updated_at TEXT DEFAULT (datetime('now')))`, args: [] })
}

// Token: el más nuevo entre la env y el renovado en Turso. Se renueva cada ~7 días (dura 60).
async function accessToken(db) {
  const row = (await db.execute({ sql: `SELECT v, updated_at FROM ig_bot_state WHERE k = 'token'`, args: [] }).catch(() => ({ rows: [] }))).rows?.[0]
  const token = row?.v || process.env.IG_ACCESS_TOKEN
  if (!token) return null
  const age = row ? Date.now() - Date.parse(`${row.updated_at}Z`) : Infinity
  if (age > 7 * 864e5) {
    const r = await fetch(`https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(token)}`).catch(() => null)
    const j = r && r.ok ? await r.json().catch(() => null) : null
    if (j?.access_token) {
      await db.execute({ sql: `INSERT INTO ig_bot_state (k, v, updated_at) VALUES ('token', ?, datetime('now'))
        ON CONFLICT(k) DO UPDATE SET v = excluded.v, updated_at = excluded.updated_at`, args: [j.access_token] })
      return j.access_token
    }
  }
  return token
}

async function graph(token, path, { method = 'GET', body } = {}) {
  const r = await fetch(`${GRAPH}${path}`, {
    method, headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  })
  const j = await r.json().catch(() => ({}))
  if (!r.ok || j.error) throw new Error(j.error ? `${j.error.code}/${j.error.error_subcode || ''} ${j.error.message}` : `HTTP ${r.status}`)
  return j
}

// X-Hub-Signature-256. Vercel ya parseó el body, así que se reconstruye: Meta firma JSON con unicode y «/» escapados.
async function signatureOk(req) {
  const secret = process.env.IG_APP_SECRET
  const sig = String(req.headers?.['x-hub-signature-256'] || '')
  if (!secret || !sig.startsWith('sha256=')) return false
  const raw = JSON.stringify(req.body)
  const escaped = raw.replace(/[\u007f-\uffff]/g, c => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`).replace(/\//g, '\\/')
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  for (const body of [raw, escaped]) {
    const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(body)))
    if (`sha256=${[...mac].map(b => b.toString(16).padStart(2, '0')).join('')}` === sig) return true
  }
  return false
}

async function handleComment(db, token, accountId, v, opts) {
  const commentId = String(v?.id || '')
  if (!commentId) return { skip: 'sin id' }
  // Nunca a nuestros propios comentarios (incluye las respuestas públicas del bot)
  if (String(v.from?.id || '') === String(accountId) || String(v.from?.username || '').toLowerCase() === OWN_USERNAME) return { skip: 'propio' }
  const m = matchKeyword(v.text)
  if (!m) return { skip: 'sin palabra' }
  if (!m.test && !enabled()) return { skip: 'bot apagado (IG_BOT_ENABLED≠1): responde ManyChat' }
  const r = REGALOS[m.slug]
  if (!r) return { skip: `slug desconocido ${m.slug}` }

  // Sin firma válida, el comentario se confirma en la API (así un POST falso no hace responder nada)
  if (!opts.signed) {
    const c = await graph(token, `/${commentId}?fields=id,text,from`).catch(() => null)
    if (!c || norm(c.text) !== norm(v.text)) return { skip: 'comentario no confirmado en la API' }
  }

  // Una sola respuesta por comentario (Meta reintenta webhooks; la PK lo impide)
  const ins = await db.execute({
    sql: `INSERT OR IGNORE INTO ig_bot_replies (comment_id, media_id, from_id, username, text, word, slug, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
    args: [commentId, String(v.media?.id || ''), String(v.from?.id || ''), String(v.from?.username || ''), String(v.text || '').slice(0, 300), m.word, m.slug],
  })
  if (!ins.rowsAffected) return { skip: 'ya respondido' }

  const link = await giftLink(opts.secret, m.slug, m.test ? 'pruebabot' : m.word)
  let format = null, errors = []
  for (const [name, message] of dmMessages(r, link, v.from?.username)) {
    try {
      await graph(token, '/me/messages', { method: 'POST', body: { recipient: { comment_id: commentId }, message } })
      format = name
      break
    } catch (e) {
      errors.push(`${name}: ${e.message}`)
      // 7 días, ya respondido, sin permiso: ningún formato va a funcionar
      if (!/template|attachment|param|payload|element|button/i.test(e.message)) break
    }
  }

  let publicId = null
  if (format) {
    const text = PUBLIC_REPLIES[[...commentId].reduce((a, c) => a + c.charCodeAt(0), 0) % PUBLIC_REPLIES.length]
    publicId = await graph(token, `/${commentId}/replies`, { method: 'POST', body: { message: text } })
      .then(j => j.id || null, e => { errors.push(`public: ${e.message}`); return null })
  }
  await db.execute({
    sql: `UPDATE ig_bot_replies SET status = ?, format = ?, error = ?, public_reply_id = ? WHERE comment_id = ?`,
    args: [format ? 'sent' : 'failed', format, errors.join(' | ').slice(0, 1000) || null, publicId, commentId],
  })
  console.log(`[ig-bot] ${commentId} @${v.from?.username} ${m.word} → ${format || 'FALLÓ'} ${errors.join(' | ')}`)
  return { sent: format, errors }
}

// Devuelve true si atendió la request
export async function handleIgBot(db, req, res, opts = {}) {
  const q = req.query || {}
  const isEvent = req.method === 'POST' && req.body?.object === 'instagram'
  const isVerify = req.method === 'GET' && q['hub.mode'] === 'subscribe'
  if (!isEvent && !isVerify && !['ig_webhook', 'ig_status'].includes(q.action)) return false

  if (isVerify || (req.method === 'GET' && q.action === 'ig_webhook')) {
    const ok = process.env.IG_VERIFY_TOKEN && q['hub.verify_token'] === process.env.IG_VERIFY_TOKEN
    res.setHeader?.('Content-Type', 'text/plain')
    res.status(ok ? 200 : 403).end?.(ok ? String(q['hub.challenge'] || '') : 'Forbidden')
    return true
  }

  await ensureTables(db)

  if (q.action === 'ig_status') {
    if (!opts.secret || String(req.headers?.authorization || '') !== `Bearer ${opts.secret}`) { res.status(401).json({ error: 'Unauthorized' }); return true }
    const token = await accessToken(db)
    const me = token ? await graph(token, '/me?fields=user_id,username').catch(e => ({ error: e.message })) : null
    const rows = (await db.execute({ sql: `SELECT * FROM ig_bot_replies ORDER BY created_at DESC LIMIT 30`, args: [] })).rows
    res.json({ enabled: enabled(), testWord: testWord(), hasToken: Boolean(token), hasVerifyToken: Boolean(process.env.IG_VERIFY_TOKEN), hasAppSecret: Boolean(process.env.IG_APP_SECRET), me, replies: rows })
    return true
  }

  if (!isEvent) { res.status(405).json({ error: 'Method not allowed' }); return true }

  // Siempre 200 a Meta (si no, reintenta y termina desactivando el webhook); los errores quedan en la tabla y en el log
  const results = []
  try {
    const token = await accessToken(db)
    const signed = await signatureOk(req)
    if (!token) throw new Error('falta IG_ACCESS_TOKEN')
    for (const entry of req.body.entry || []) {
      for (const ch of entry.changes || []) {
        if (ch.field !== 'comments') continue
        results.push(await handleComment(db, token, entry.id, ch.value, { ...opts, signed }).catch(e => ({ error: e.message })))
      }
    }
  } catch (e) {
    console.error('[ig-bot]', e.message)
    results.push({ error: e.message })
  }
  res.status(200).json({ received: true, results })
  return true
}
