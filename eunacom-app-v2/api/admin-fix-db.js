import { getTurso } from './_turso.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  
  // Simple auth to prevent abuse
  if (req.query.secret !== 'fixit123') return res.status(401).json({ error: 'Unauthorized' })

  const db = getTurso()
  try {
    const results = {}
    
    // 1. Delete test@test.com
    const r1 = await db.execute({
      sql: 'DELETE FROM user_profiles WHERE email = ?',
      args: ['test@test.com']
    })
    results.deletedTestEmail = r1.rowsAffected

    // 2. Delete TESTANN
    const r2 = await db.execute({
      sql: 'DELETE FROM user_profiles WHERE first_name LIKE ? OR email LIKE ?',
      args: ['%TESTANN%', '%testann%']
    })
    results.deletedTestann = r2.rowsAffected

    // 3. Mark existing users as onboarding_done = 1 (if they have a name)
    const r3 = await db.execute({
      sql: 'UPDATE user_profiles SET onboarding_done = 1 WHERE first_name IS NOT NULL AND first_name != ""'
    })
    results.updatedExistingUsers = r3.rowsAffected

    // 4. Specifically mark admin
    const r4 = await db.execute({
      sql: 'UPDATE user_profiles SET onboarding_done = 1 WHERE email = ?',
      args: ['dr.felipeyanez@gmail.com']
    })
    results.updatedAdmin = r4.rowsAffected

    return res.status(200).json({ success: true, results })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
}
