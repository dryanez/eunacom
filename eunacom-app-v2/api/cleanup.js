import { getTurso } from './_turso.js'

export default async function handler(req, res) {
  try {
    const db = getTurso()
    
    // 1. Delete test@test.com
    await db.execute({
      sql: 'DELETE FROM user_profiles WHERE email = ?',
      args: ['test@test.com']
    })

    // 2. Delete TESTANN
    await db.execute({
      sql: 'DELETE FROM user_profiles WHERE first_name LIKE ? OR email LIKE ?',
      args: ['%TESTANN%', '%testann%']
    })

    // 3. Mark existing users as onboarding_done = 1
    await db.execute({
      sql: 'UPDATE user_profiles SET onboarding_done = 1 WHERE first_name IS NOT NULL AND first_name != ""',
      args: []
    })

    // 4. Specifically mark admin
    await db.execute({
      sql: 'UPDATE user_profiles SET onboarding_done = 1 WHERE email = ?',
      args: ['dr.felipeyanez@gmail.com']
    })

    return res.status(200).json({ success: true, message: 'All done!' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message || err.toString() })
  }
}
