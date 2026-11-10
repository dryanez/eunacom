// Server-side identity for API routes.
// The browser sends its Supabase access token as `Authorization: Bearer <token>`;
// we ask Supabase who it belongs to. Never trust userId / adminEmail from the request.
import { getTurso } from './_turso.js'

const ADMIN_EMAILS = ['dr.felipeyanez@gmail.com']
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

const cache = new Map() // token -> { user, exp }

export async function getAuthUser(req) {
  const header = req.headers?.authorization || req.headers?.Authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : ''
  if (!token) return null

  const hit = cache.get(token)
  if (hit && hit.exp > Date.now()) return hit.user

  const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` }
  }).catch(() => null)
  if (!r || !r.ok) return null
  const u = await r.json()
  if (!u?.id) return null

  const user = { id: u.id, email: (u.email || '').toLowerCase() }
  if (cache.size > 5000) cache.clear()
  cache.set(token, { user, exp: Date.now() + 5 * 60 * 1000 })
  return user
}

export function isAdminUser(user) {
  return !!user && ADMIN_EMAILS.includes(user.email)
}

// Returns the user, or sends 401 and returns null.
export async function requireUser(req, res) {
  const user = await getAuthUser(req)
  if (!user) {
    res.status(401).json({ error: 'Login required' })
    return null
  }
  return user
}

export async function requireAdmin(req, res) {
  const user = await getAuthUser(req)
  if (!isAdminUser(user)) {
    res.status(403).json({ error: 'Forbidden' })
    return null
  }
  return user
}

// The userId an endpoint should act on: the caller's own id. Admins may act on others.
// Sends 403 and returns null when a non-admin asks for someone else's data.
export function ownUserId(req, res, user, requested) {
  if (requested && requested !== user.id && !isAdminUser(user)) {
    res.status(403).json({ error: 'Forbidden' })
    return null
  }
  return requested || user.id
}

// Active subscription, checked against the database (never the browser).
export async function isPremiumUser(user) {
  if (!user) return false
  if (isAdminUser(user)) return true
  const db = getTurso()
  const r = await db.execute({
    sql: `SELECT 1 FROM user_profiles
          WHERE (id = ? OR LOWER(email) = ?) AND is_premium = 1
            AND (premium_until IS NULL OR datetime(premium_until) > datetime('now'))
          LIMIT 1`,
    args: [user.id, user.email]
  }).catch(() => ({ rows: [] }))
  return r.rows.length > 0
}
