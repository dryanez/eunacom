import { getTurso } from './_turso.js'

// Admin-only endpoint — lists all user profiles + stats
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
      // Verify admin - check the email header (simple approach)
      const adminEmail = req.query.adminEmail
      if (adminEmail !== 'dr.felipeyanez@gmail.com') {
        return res.status(403).json({ error: 'Forbidden' })
      }

      // Get all profiles with question counts, test counts, clase counts
      const profiles = await db.execute({
        sql: `SELECT
          up.*,
          COALESCE(q.total_answers, 0) as total_answers,
          COALESCE(q.correct_answers, 0) as correct_answers,
          COALESCE(t.total_tests, 0) as total_tests,
          COALESCE(t.completed_tests, 0) as total_pruebas,
          COALESCE(c.total_classes, 0) as total_classes
        FROM user_profiles up
        LEFT JOIN (
          SELECT user_id, COUNT(*) as total_answers,
                 SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct_answers
          FROM user_progress GROUP BY user_id
        ) q ON up.id = q.user_id
        LEFT JOIN (
          SELECT user_id, COUNT(*) as total_tests,
                 SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tests
          FROM tests GROUP BY user_id
        ) t ON up.id = t.user_id
        LEFT JOIN (
          SELECT user_id, COUNT(*) as total_classes
          FROM clase_progress WHERE video_watched = 1 OR quiz_completed = 1
          GROUP BY user_id
        ) c ON up.id = c.user_id
        ORDER BY up.created_at DESC`,
        args: []
      })

      return res.json({ data: profiles.rows })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error('admin-users error:', err)
    return res.status(500).json({ error: err.message })
  }
}
