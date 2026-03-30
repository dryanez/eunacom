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
    const { id, answers, currentIndex, status, score } = req.body
    if (status === 'completed') {
      await db.execute({
        sql: `UPDATE tests SET answers = ?, current_question_index = ?, status = 'completed', score = ?, completed_at = datetime('now') WHERE id = ?`,
        args: [JSON.stringify(answers || {}), currentIndex ?? 0, score ?? 0, id]
      })
    } else {
      await db.execute({
        sql: 'UPDATE tests SET answers = ?, current_question_index = ? WHERE id = ?',
        args: [JSON.stringify(answers || {}), currentIndex ?? 0, id]
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
