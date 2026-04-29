// GET /api/admin-user-detail?userId=xxx&adminEmail=xxx
// Admin-only: returns full test history + clase progress for one user
import { getTurso } from './_turso.js'

export default async function handler(req, res) {
  const db = getTurso()

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { userId, adminEmail } = req.query
  if (adminEmail !== 'dr.felipeyanez@gmail.com') {
    return res.status(403).json({ error: 'Forbidden' })
  }
  if (!userId) return res.status(400).json({ error: 'userId required' })

  try {
    const [testsResult, clasesResult] = await Promise.all([
      db.execute({
        sql: `SELECT id, mode, status, score, total_questions, created_at, completed_at
              FROM tests WHERE user_id = ? ORDER BY created_at DESC LIMIT 200`,
        args: [userId]
      }),
      db.execute({
        sql: `SELECT cp.clase_id, cp.read_clase, cp.read_puntos, cp.quiz_completed,
                     cp.quiz_score, cp.quiz_correct, cp.quiz_total, cp.video_watched,
                     cp.updated_at, c.topic
              FROM clase_progress cp
              LEFT JOIN clases c ON c.id = cp.clase_id
              WHERE cp.user_id = ? ORDER BY cp.updated_at DESC`,
        args: [userId]
      })
    ])

    return res.json({
      tests: testsResult.rows,
      clases: clasesResult.rows
    })
  } catch (err) {
    console.error('admin-user-detail error:', err)
    return res.status(500).json({ error: err.message })
  }
}
