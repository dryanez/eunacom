// GET  /api/progress?userId=xxx           → user progress records
// POST /api/progress                       → record answer
// PATCH /api/progress                      → flag question
// GET  /api/progress?stats=true&questionId=xxx → answer stats (merged from answer-stats.js)
// POST /api/progress?stats=true            → record answer stat pick
// PUT  /api/progress?stats=true            → batch get stats
import { getTurso } from './_turso.js';
import { randomUUID } from 'crypto';

export default async function handler(req, res) {
  const db = getTurso()

  // ── ANSWER STATS (merged from answer-stats.js) ──────────────────────────
  if (req.query.stats === 'true') {
    await db.execute({
      sql: `CREATE TABLE IF NOT EXISTS answer_stats (
        question_id TEXT NOT NULL,
        option_id TEXT NOT NULL,
        pick_count INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (question_id, option_id)
      )`,
      args: []
    })

    if (req.method === 'GET') {
      const { questionId } = req.query
      if (!questionId) return res.status(400).json({ error: 'questionId required' })
      const result = await db.execute({
        sql: 'SELECT option_id, pick_count FROM answer_stats WHERE question_id = ?',
        args: [questionId]
      })
      const stats = {}
      result.rows.forEach(r => { stats[r.option_id] = r.pick_count })
      const total = Object.values(stats).reduce((s, v) => s + v, 0)
      return res.json({ data: stats, total })
    }

    if (req.method === 'POST') {
      const { questionId, optionId } = req.body
      if (!questionId || !optionId) return res.status(400).json({ error: 'questionId and optionId required' })
      await db.execute({
        sql: `INSERT INTO answer_stats (question_id, option_id, pick_count)
              VALUES (?, ?, 1)
              ON CONFLICT(question_id, option_id) DO UPDATE SET
              pick_count = pick_count + 1`,
        args: [questionId, optionId]
      })
      return res.json({ ok: true })
    }

    if (req.method === 'PUT') {
      const { questionIds } = req.body
      if (!questionIds || !Array.isArray(questionIds)) return res.status(400).json({ error: 'questionIds array required' })
      const placeholders = questionIds.map(() => '?').join(',')
      const result = await db.execute({
        sql: `SELECT question_id, option_id, pick_count FROM answer_stats WHERE question_id IN (${placeholders})`,
        args: questionIds
      })
      const stats = {}
      result.rows.forEach(r => {
        if (!stats[r.question_id]) stats[r.question_id] = {}
        stats[r.question_id][r.option_id] = r.pick_count
      })
      return res.json({ data: stats })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  }

  // ── USER PROGRESS ────────────────────────────────────────────────────────
  try { await db.execute('ALTER TABLE user_progress ADD COLUMN is_omitted INTEGER DEFAULT 0') } catch {}
  try { await db.execute('ALTER TABLE user_progress ADD COLUMN is_flagged INTEGER DEFAULT 0') } catch {}

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

