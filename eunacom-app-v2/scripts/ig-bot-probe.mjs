#!/usr/bin/env node
// Prueba del bot de Instagram SIN webhook: ¿Meta deja mandar una respuesta privada a alguien sin rol en la app?
// Lee el token de un archivo .env (nunca se imprime). Busca en los últimos reels un comentario con la palabra
// de prueba (PRUEBABOT por defecto) hecho por otra cuenta, y le manda la respuesta privada (con --send).
//
//   node scripts/ig-bot-probe.mjs --env ~/Desktop/organization/office-app/.env            (solo mira)
//   node scripts/ig-bot-probe.mjs --env ~/Desktop/organization/office-app/.env --send     (manda el DM)
// Opciones: --var NOMBRE_DEL_TOKEN (si no, el primero que tenga IG|INSTAGRAM y TOKEN), --word PALABRA
import fs from 'node:fs'
import os from 'node:os'

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d }
const envFile = String(arg('--env', '')).replace(/^~/, os.homedir())
const word = String(arg('--word', 'PRUEBABOT')).toUpperCase()
const send = process.argv.includes('--send')
const GRAPH = 'https://graph.instagram.com/v24.0'

let token = process.env.IG_ACCESS_TOKEN
if (!token && envFile) {
  const vars = Object.fromEntries(fs.readFileSync(envFile, 'utf8').split('\n').map(l => l.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?/)).filter(Boolean).map(m => [m[1], m[2].trim()]))
  const name = arg('--var') || Object.keys(vars).find(k => /IG|INSTAGRAM/.test(k) && /TOKEN/.test(k))
  token = vars[name]
  console.log(`token: variable ${name || '(ninguna)'} de ${envFile}`)
}
if (!token) { console.error('Falta el token (--env archivo o IG_ACCESS_TOKEN)'); process.exit(1) }

async function g(path, body) {
  const r = await fetch(`${GRAPH}${path}`, { method: body ? 'POST' : 'GET', headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined })
  const j = await r.json().catch(() => ({}))
  return { ok: r.ok && !j.error, j }
}
const show = (label, r) => console.log(`${r.ok ? '✅' : '❌'} ${label}:`, JSON.stringify(r.ok ? r.j : r.j.error))

const me = await g('/me?fields=user_id,username')
show('cuenta', me)
if (!me.ok) process.exit(1)
show('webhooks suscritos (subscribed_apps)', await g(`/${me.j.user_id}/subscribed_apps`))

const media = await g('/me/media?fields=id,caption,timestamp,permalink&limit=15')
if (!media.ok) { show('media', media); process.exit(1) }
const week = Date.now() - 7 * 864e5
let target = null
for (const m of media.j.data || []) {
  const c = await g(`/${m.id}/comments?fields=id,text,username,timestamp,from&limit=50`)
  if (!c.ok) { show(`comentarios de ${m.id}`, c); continue }
  for (const x of c.j.data || []) {
    const mine = (x.username || x.from?.username || '').toLowerCase() === me.j.username.toLowerCase()
    if (!mine && String(x.text || '').toUpperCase().includes(word) && Date.parse(x.timestamp) > week) { target = { ...x, permalink: m.permalink }; break }
  }
  if (target) break
}
if (!target) { console.log(`No hay comentarios con «${word}» de otra cuenta en los últimos 7 días (15 últimas publicaciones).`); process.exit(0) }
console.log(`comentario: ${target.id} de @${target.username} «${target.text}» en ${target.permalink}`)
if (!send) { console.log('Solo mirando. Agrega --send para mandar la respuesta privada.'); process.exit(0) }

const link = 'https://eunacom-examen.cl/?regalo=ecg&utm_source=instagram&utm_medium=dm&utm_campaign=pruebabot'
const tries = [
  ['generic', { attachment: { type: 'template', payload: { template_type: 'generic', elements: [{ title: 'Los 10 ECG que más caen en el EUNACOM', subtitle: 'Prueba del bot 👇', image_url: 'https://eunacom-examen.cl/regalo/ecg.jpg', buttons: [{ type: 'web_url', url: link, title: 'Quiero mi libro' }] }] } } }],
  ['button', { attachment: { type: 'template', payload: { template_type: 'button', text: 'Prueba del bot: tu guía de ECG 🎁', buttons: [{ type: 'web_url', url: link, title: 'Quiero mi libro' }] } } }],
  ['text', { text: `Prueba del bot: tu guía de ECG 🎁 ${link}` }],
]
for (const [name, message] of tries) {
  const r = await g('/me/messages', { recipient: { comment_id: target.id }, message })
  show(`respuesta privada (${name})`, r)
  if (r.ok) break
}
show('respuesta pública', await g(`/${target.id}/replies`, { message: '¡Listo! Te lo mandé por DM 📩' }))
