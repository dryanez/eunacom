// GET    /api/clases?userId=xxx   → list saved classes
// POST   /api/clases              → save a new class
// DELETE /api/clases?id=xxx       → delete a class
import { getTurso } from './_turso.js';

export default async function handler(req, res) {
  const db = getTurso()

  // Ensure table exists (idempotent)
  await db.execute({
    sql: `CREATE TABLE IF NOT EXISTS clases (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      topic TEXT NOT NULL,
      summary TEXT,
      key_points TEXT,
      quiz TEXT,
      saved_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`
  })

  if (req.method === 'GET') {
    const { userId } = req.query
    if (!userId) return res.status(400).json({ error: 'userId required' })
    const result = await db.execute({
      sql: 'SELECT * FROM clases WHERE user_id = ? ORDER BY saved_at DESC',
      args: [userId]
    })
    return res.json({ data: result.rows })
  }

  if (req.method === 'POST') {
    const { id, userId, topic, summary, keyPoints, quiz } = req.body
    if (!userId || !topic) return res.status(400).json({ error: 'userId and topic required' })
    await db.execute({
      sql: `INSERT INTO clases (id, user_id, topic, summary, key_points, quiz, saved_at)
            VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
      args: [
        id || crypto.randomUUID(),
        userId,
        topic,
        summary || '',
        JSON.stringify(keyPoints || []),
        JSON.stringify(quiz || [])
      ]
    })
    return res.json({ ok: true, id })
  }

  if (req.method === 'DELETE') {
    const { id } = req.query
    if (!id) return res.status(400).json({ error: 'id required' })
    await db.execute({ sql: 'DELETE FROM clases WHERE id = ?', args: [id] })
    return res.json({ ok: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
