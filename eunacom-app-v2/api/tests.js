// GET  /api/tests?userId=xxx         → list of tests
// POST /api/tests  body: { id, userId, mode, timeLimitSeconds, totalQuestions, questions }
// PATCH /api/tests body: { id, answers, currentIndex, status, score }
// DELETE /api/tests?id=xxx
import { getTurso } from './_turso.js';

export default async function handler(req, res) {
  const db = getTurso()

  if (req.method === 'GET') {
    const { userId, id } = req.query
    if (id) {
      const result = await db.execute({ sql: 'SELECT * FROM tests WHERE id = ?', args: [id] })
      return res.json({ data: result.rows[0] || null })
    }
    if (!userId) return res.status(400).json({ error: 'userId required' })
    const result = await db.execute({
      sql: 'SELECT * FROM tests WHERE user_id = ? ORDER BY created_at DESC',
      args: [userId]
    })
    return res.json({ data: result.rows })
  }

  if (req.method === 'POST') {
    const { id, userId, mode, timeLimitSeconds, totalQuestions, questions } = req.body
    await db.execute({
      sql: `INSERT INTO tests (id, user_id, mode, time_limit_seconds, total_questions, questions, status, current_question_index)
            VALUES (?, ?, ?, ?, ?, ?, 'in_progress', 0)`,
      args: [id, userId, mode, timeLimitSeconds || null, totalQuestions, JSON.stringify(questions)]
    })
    return res.json({ ok: true, id })
  }

  if (req.method === 'PATCH') {
    const { id, answers, currentIndex, status, score, timeLeftSeconds } = req.body

    try { await db.execute('ALTER TABLE tests ADD COLUMN time_left_seconds INTEGER DEFAULT NULL') } catch {}

    if (status === 'completed') {
      await db.execute({
        sql: `UPDATE tests SET answers = ?, current_question_index = ?, status = 'completed', score = ?, completed_at = datetime('now') WHERE id = ?`,
        args: [JSON.stringify(answers || {}), currentIndex ?? 0, score ?? 0, id]
      })

      // Sync completed test answers to user_progress table
      try { await db.execute('ALTER TABLE user_progress ADD COLUMN is_omitted INTEGER DEFAULT 0') } catch {}
      try { await db.execute('ALTER TABLE user_progress ADD COLUMN is_flagged INTEGER DEFAULT 0') } catch {}
      try { await db.execute('CREATE UNIQUE INDEX IF NOT EXISTS idx_up_user_question ON user_progress(user_id, question_id)') } catch (e) {
        try {
          await db.execute(`DELETE FROM user_progress WHERE rowid NOT IN (SELECT MIN(rowid) FROM user_progress GROUP BY user_id, question_id)`)
          await db.execute('CREATE UNIQUE INDEX idx_up_user_question ON user_progress(user_id, question_id)')
        } catch (err) {}
      }

      const testRow = await db.execute({ sql: 'SELECT user_id, questions FROM tests WHERE id = ?', args: [id] })
      if (testRow.rows.length > 0) {
        // TestRunner handles progress insertion via insertProgress frontend call.
      }

    } else {
      await db.execute({
        sql: 'UPDATE tests SET answers = ?, current_question_index = ?, time_left_seconds = ? WHERE id = ?',
        args: [JSON.stringify(answers || {}), currentIndex ?? 0, timeLeftSeconds ?? null, id]
      })
    }
    return res.json({ ok: true })
  }

  if (req.method === 'DELETE') {
    const { id } = req.query
    await db.execute({ sql: 'DELETE FROM tests WHERE id = ?', args: [id] })
    return res.json({ ok: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
