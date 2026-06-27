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

      // Sync completed test answers to user_progress table
      try { await db.execute('ALTER TABLE user_progress ADD COLUMN is_omitted INTEGER DEFAULT 0') } catch {}
      try { await db.execute('ALTER TABLE user_progress ADD COLUMN is_flagged INTEGER DEFAULT 0') } catch {}

      const testRow = await db.execute({ sql: 'SELECT user_id, questions FROM tests WHERE id = ?', args: [id] })
      if (testRow.rows.length > 0) {
        const { user_id, questions: qsRaw } = testRow.rows[0]
        const parsedQuestions = JSON.parse(qsRaw || '[]')
        
        const statements = []
        for (const q of parsedQuestions) {
          const userPick = (answers || {})[q.id]
          const isCorrect = userPick ? (userPick.toLowerCase() === (q.respuestaCorrecta || q.respuesta_correcta)?.toLowerCase()) : false
          const isOmitted = !userPick
          
          statements.push({
            sql: `INSERT INTO user_progress (id, user_id, question_id, is_correct, is_omitted, is_flagged, answered_at)
                  VALUES (lower(hex(randomblob(16))), ?, ?, ?, ?, 0, datetime('now'))
                  ON CONFLICT(user_id, question_id) DO UPDATE SET
                  is_correct = excluded.is_correct,
                  is_omitted = excluded.is_omitted,
                  answered_at = datetime('now')`,
            args: [user_id, q.id, isCorrect ? 1 : 0, isOmitted ? 1 : 0]
          })
        }
        if (statements.length > 0) {
          await db.batch(statements)
        }
      }

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
