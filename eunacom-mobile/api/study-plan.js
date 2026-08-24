import { getTurso } from './_turso.js'

export default async function handler(req, res) {
  const db = getTurso()

  try {
    await db.execute({
      sql: `CREATE TABLE IF NOT EXISTS study_plan_settings (
        user_id TEXT PRIMARY KEY,
        exam_date TEXT NOT NULL,
        excluded_topics TEXT DEFAULT '[]',
        daily_question_goal INTEGER DEFAULT 50,
        weekday_minutes INTEGER DEFAULT 120,
        saturday_minutes INTEGER DEFAULT 90,
        sunday_minutes INTEGER DEFAULT 60,
        completed_subjects TEXT DEFAULT '[]',
        plan_start TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      )`,
      args: []
    })
    // Migrations for existing tables missing new columns
    try { await db.execute({ sql: 'ALTER TABLE study_plan_settings ADD COLUMN weekday_minutes INTEGER DEFAULT 120', args: [] }) } catch {}
    try { await db.execute({ sql: 'ALTER TABLE study_plan_settings ADD COLUMN saturday_minutes INTEGER DEFAULT 90', args: [] }) } catch {}
    try { await db.execute({ sql: 'ALTER TABLE study_plan_settings ADD COLUMN sunday_minutes INTEGER DEFAULT 60', args: [] }) } catch {}
    try { await db.execute({ sql: 'ALTER TABLE study_plan_settings ADD COLUMN completed_subjects TEXT DEFAULT "[]"', args: [] }) } catch {}
    try { await db.execute({ sql: 'ALTER TABLE study_plan_settings ADD COLUMN plan_start TEXT', args: [] }) } catch {}

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
      const {
        userId, examDate, excludedTopics, dailyQuestionGoal,
        weekdayMinutes, saturdayMinutes, sundayMinutes,
        completedSubjects, planStart,
      } = req.body
      if (!userId) return res.status(400).json({ error: 'userId required' })

      await db.execute({
        sql: `INSERT INTO study_plan_settings
                (user_id, exam_date, excluded_topics, daily_question_goal,
                 weekday_minutes, saturday_minutes, sunday_minutes,
                 completed_subjects, plan_start, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
              ON CONFLICT(user_id) DO UPDATE SET
                exam_date           = excluded.exam_date,
                excluded_topics     = excluded.excluded_topics,
                daily_question_goal = excluded.daily_question_goal,
                weekday_minutes     = excluded.weekday_minutes,
                saturday_minutes    = excluded.saturday_minutes,
                sunday_minutes      = excluded.sunday_minutes,
                completed_subjects  = excluded.completed_subjects,
                plan_start          = excluded.plan_start,
                updated_at          = datetime('now')`,
        args: [
          userId,
          examDate || '2026-07-08',
          JSON.stringify(excludedTopics || []),
          dailyQuestionGoal || 50,
          weekdayMinutes ?? 120,
          saturdayMinutes ?? 90,
          sundayMinutes ?? 60,
          JSON.stringify(completedSubjects || []),
          planStart || new Date().toISOString().split('T')[0],
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
