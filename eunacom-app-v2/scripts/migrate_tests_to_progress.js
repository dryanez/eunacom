import { getTurso } from '../api/_turso.js'

async function run() {
  const db = getTurso()
  try { await db.execute('ALTER TABLE user_progress ADD COLUMN is_omitted INTEGER DEFAULT 0') } catch {}
  try { await db.execute('ALTER TABLE user_progress ADD COLUMN is_flagged INTEGER DEFAULT 0') } catch {}

  const result = await db.execute("SELECT * FROM tests WHERE status = 'completed'")
  console.log(`Found ${result.rows.length} completed tests to migrate.`)

  for (const test of result.rows) {
    const { id, user_id, questions: qsRaw, answers: ansRaw } = test
    const parsedQuestions = JSON.parse(qsRaw || '[]')
    const parsedAnswers = JSON.parse(ansRaw || '{}')

    let synced = 0
    for (const q of parsedQuestions) {
      const userPick = parsedAnswers[q.id]
      const isCorrect = userPick ? (userPick.toLowerCase() === (q.respuestaCorrecta || q.respuesta_correcta)?.toLowerCase()) : false
      const isOmitted = !userPick
      
      await db.execute({
        sql: `INSERT INTO user_progress (id, user_id, question_id, is_correct, is_omitted, is_flagged, answered_at)
              VALUES (lower(hex(randomblob(16))), ?, ?, ?, ?, 0, datetime('now'))
              ON CONFLICT(user_id, question_id) DO UPDATE SET
              is_correct = excluded.is_correct,
              is_omitted = excluded.is_omitted,
              answered_at = datetime('now')`,
        args: [user_id, q.id, isCorrect ? 1 : 0, isOmitted ? 1 : 0]
      })
      synced++
    }
    console.log(`Test ${id}: Synced ${synced} questions to user_progress.`)
  }
}

run().catch(console.error)
