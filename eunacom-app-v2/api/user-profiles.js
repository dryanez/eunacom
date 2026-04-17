import { getTurso } from './_turso.js'

export default async function handler(req, res) {
  const db = getTurso()

  try {
    // Ensure table exists
    await db.execute({
      sql: `CREATE TABLE IF NOT EXISTS user_profiles (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        first_name TEXT,
        last_name TEXT,
        exam_month TEXT,
        exam_year TEXT,
        prep_months TEXT,
        nationality TEXT,
        country TEXT,
        country_code TEXT,
        whatsapp TEXT,
        onboarding_done INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      )`,
      args: []
    })

    if (req.method === 'GET') {
      const userId = req.query.userId
      if (!userId) return res.status(400).json({ error: 'userId required' })

      const result = await db.execute({
        sql: 'SELECT * FROM user_profiles WHERE id = ?',
        args: [userId]
      })
      return res.json({ data: result.rows[0] || null })
    }

    if (req.method === 'POST') {
      const {
        id, email, first_name, last_name,
        exam_month, exam_year, prep_months,
        nationality, country, country_code, whatsapp,
        inscrito_eunacom, onboarding_done
      } = req.body

      if (!id || !email) return res.status(400).json({ error: 'id and email required' })

      // Ensure inscrito_eunacom column exists
      await db.execute({ sql: `ALTER TABLE user_profiles ADD COLUMN inscrito_eunacom TEXT`, args: [] }).catch(() => {})

      await db.execute({
        sql: `INSERT INTO user_profiles (id, email, first_name, last_name, exam_month, exam_year, prep_months, nationality, country, country_code, whatsapp, inscrito_eunacom, onboarding_done, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
              ON CONFLICT(id) DO UPDATE SET
                email = excluded.email,
                first_name = excluded.first_name,
                last_name = excluded.last_name,
                exam_month = excluded.exam_month,
                exam_year = excluded.exam_year,
                prep_months = excluded.prep_months,
                nationality = excluded.nationality,
                country = excluded.country,
                country_code = excluded.country_code,
                whatsapp = excluded.whatsapp,
                inscrito_eunacom = excluded.inscrito_eunacom,
                onboarding_done = excluded.onboarding_done,
                updated_at = datetime('now')`,
        args: [
          id, email, first_name || null, last_name || null,
          exam_month || null, exam_year || null, prep_months || null,
          nationality || null, country || null, country_code || null, whatsapp || null,
          inscrito_eunacom || null,
          onboarding_done ? 1 : 0
        ]
      })
      return res.json({ ok: true })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error('user-profiles error:', err)
    return res.status(500).json({ error: err.message })
  }
}
