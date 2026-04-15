import { getTurso } from './_turso.js'

export default async function handler(req, res) {
  const db = getTurso()

  try {
    // Ensure table
    await db.execute({
      sql: `CREATE TABLE IF NOT EXISTS study_plan_settings (
        user_id TEXT PRIMARY KEY,
        exam_date TEXT NOT NULL,
        excluded_topics TEXT DEFAULT '[]',
        daily_question_goal INTEGER DEFAULT 50,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      )`,
      args: []
    })

    if (req.method === 'GET') {
      const { userId } = req.query
      if (!userId) return res.status(400).json({ error: 'userId required' })
      
      const result = await db.execute({
        sql: 'SELECT * FROM study_plan_settings WHERE user_id = ?',
        args: [userId]
      })
      return res.json({ data: result.rows[0] || null })
    }

    if (req.method === 'POST') {
      const { userId, examDate, excludedTopics, dailyQuestionGoal } = req.body
      if (!userId) return res.status(400).json({ error: 'userId required' })

      await db.execute({
        sql: `INSERT INTO study_plan_settings (user_id, exam_date, excluded_topics, daily_question_goal, updated_at)
              VALUES (?, ?, ?, ?, datetime('now'))
              ON CONFLICT(user_id) DO UPDATE SET
                exam_date = excluded.exam_date,
                excluded_topics = excluded.excluded_topics,
                daily_question_goal = excluded.daily_question_goal,
                updated_at = datetime('now')`,
        args: [
          userId,
          examDate || '2026-07-10',
          JSON.stringify(excludedTopics || []),
          dailyQuestionGoal || 50
        ]
      })
      return res.json({ ok: true })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error('study-plan error:', err)
    return res.status(500).json({ error: err.message })
  }
}
