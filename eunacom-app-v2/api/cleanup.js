import { createClient } from '@libsql/client'

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
})

export default async function handler(req, res) {
  try {
    await db.execute("DELETE FROM user_profiles WHERE id = 'screenshot-mock' OR email = 'test@test.com'")
    await db.execute("DELETE FROM user_profiles WHERE email LIKE '%test%' OR first_name LIKE '%test%'")
    res.status(200).json({ success: true, message: 'Cleaned up test accounts' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
