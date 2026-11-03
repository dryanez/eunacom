// Links de los DM de ManyChat (plan gratis): uno por libro, con su token. No los publiques fuera del DM.
// Uso: REGALO_SECRET=... node scripts/regalo-links.mjs   (el mismo valor que en Vercel)
import { REGALOS, giftToken, giftUrl } from '../api/_regalos.js'

const secret = process.env.REGALO_SECRET
if (!secret) { console.error('Falta REGALO_SECRET'); process.exit(1) }
for (const slug of Object.keys(REGALOS)) console.log(`${slug.padEnd(30)} ${giftUrl(slug, await giftToken(secret, slug))}`)
