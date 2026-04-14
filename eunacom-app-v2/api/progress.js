// GET /api/progress?userId=xxx → { data: [...] }
// POST /api/progress  body: { userId, questionId, isCorrect, isOmitted }
import { getTurso } from './_turso.js';
import { randomUUID } from 'crypto';

export default async function handler(req, res) {
  const db = getTurso()

  if (req.method === 'GET') {
    const { userId } = req.query
    if (!userId) return res.status(400).json({ error: 'userId required' })
    const result = await db.execute({
      sql: 'SELECT question_id, is_correct, is_omitted, is_flagged FROM user_progress WHERE user_id = ?',
      args: [userId]
    })
    return res.json({ data: result.rows })
  }

  if (req.method === 'POST') {
    const { userId, questionId, isCorrect, isOmitted } = req.body
    await db.execute({
      sql: `INSERT INTO user_progress (id, user_id, question_id, is_correct, is_omitted, is_flagged, answered_at)
            VALUES (?, ?, ?, ?, ?, 0, datetime('now'))
            ON CONFLICT(user_id, question_id) DO UPDATE SET
            is_correct = excluded.is_correct,
            is_omitted = excluded.is_omitted,
            answered_at = datetime('now')`,
      args: [randomUUID(), userId, questionId, isCorrect ? 1 : 0, isOmitted ? 1 : 0]
    })
    return res.json({ ok: true })
  }

  if (req.method === 'PATCH') {
    const { userId, questionId, isFlagged } = req.body
    if (!userId || !questionId) return res.status(400).json({ error: 'userId and questionId required' })
    await db.execute({
      sql: `UPDATE user_progress SET is_flagged = ? WHERE user_id = ? AND question_id = ?`,
      args: [isFlagged ? 1 : 0, userId, questionId]
    })
    return res.json({ ok: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
