// GET  /api/clase-progress?userId=xxx  → { data: [...] }
// POST /api/clase-progress             → upsert progress for a class
import { getTurso } from './_turso.js'
import { randomUUID } from 'crypto'

export default async function handler(req, res) {
  const db = getTurso()

  // Ensure table + columns exist (idempotent migrations)
  await db.execute({
    sql: `CREATE TABLE IF NOT EXISTS clase_progress (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      clase_id TEXT NOT NULL,
      read_clase INTEGER DEFAULT 0,
      read_puntos INTEGER DEFAULT 0,
      quiz_completed INTEGER DEFAULT 0,
      quiz_score INTEGER DEFAULT 0,
      quiz_correct INTEGER DEFAULT 0,
      quiz_total INTEGER DEFAULT 0,
      quiz_answers TEXT,
      video_watched INTEGER DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, clase_id)
    )`
  })
  // Migrations for old tables missing columns
  try { await db.execute({ sql: 'ALTER TABLE clase_progress ADD COLUMN video_watched INTEGER DEFAULT 0', args: [] }) } catch {}
  try { await db.execute({ sql: 'ALTER TABLE clase_progress ADD COLUMN quiz_correct INTEGER DEFAULT 0', args: [] }) } catch {}
  try { await db.execute({ sql: 'ALTER TABLE clase_progress ADD COLUMN quiz_total INTEGER DEFAULT 0', args: [] }) } catch {}
  try { await db.execute({ sql: 'ALTER TABLE clase_progress ADD COLUMN quiz_answers TEXT', args: [] }) } catch {}

  if (req.method === 'GET') {
    const { userId } = req.query
    if (!userId) return res.status(400).json({ error: 'userId required' })
    const result = await db.execute({
      sql: 'SELECT * FROM clase_progress WHERE user_id = ?',
      args: [userId]
    })
    return res.json({ data: result.rows })
  }

  if (req.method === 'POST') {
    const {
      userId, claseId,
      readClase, readPuntos,
      quizCompleted, quizScore, quizCorrect, quizTotal, quizAnswers,
      videoWatched
    } = req.body

    if (!userId || !claseId) return res.status(400).json({ error: 'userId and claseId required' })

    await db.execute({
      sql: `INSERT INTO clase_progress
              (id, user_id, clase_id, read_clase, read_puntos,
               quiz_completed, quiz_score, quiz_correct, quiz_total, quiz_answers,
               video_watched, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
            ON CONFLICT(user_id, clase_id) DO UPDATE SET
              read_clase     = COALESCE(excluded.read_clase,     read_clase),
              read_puntos    = COALESCE(excluded.read_puntos,    read_puntos),
              quiz_completed = COALESCE(excluded.quiz_completed, quiz_completed),
              quiz_score     = COALESCE(excluded.quiz_score,     quiz_score),
              quiz_correct   = COALESCE(excluded.quiz_correct,   quiz_correct),
              quiz_total     = COALESCE(excluded.quiz_total,     quiz_total),
              quiz_answers   = COALESCE(excluded.quiz_answers,   quiz_answers),
              video_watched  = COALESCE(excluded.video_watched,  video_watched),
              updated_at     = datetime('now')`,
      args: [
        userId + '_' + claseId,
        userId,
        claseId,
        readClase    ?? null,
        readPuntos   ?? null,
        quizCompleted ?? null,
        quizScore    ?? null,
        quizCorrect  ?? null,
        quizTotal    ?? null,
        quizAnswers  ? JSON.stringify(quizAnswers) : null,
        videoWatched ?? null,
      ]
    })
    return res.json({ ok: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
