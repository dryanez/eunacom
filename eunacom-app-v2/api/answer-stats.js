// GET  /api/answer-stats?questionId=xxx  → { data: { A: 12, B: 3, C: 1, D: 5, E: 0 } }
// POST /api/answer-stats                → record a pick  { questionId, optionId }
import { getTurso } from './_turso.js'

export default async function handler(req, res) {
  const db = getTurso()

  // Ensure table exists
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

  // Batch GET — get stats for multiple questions at once
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
