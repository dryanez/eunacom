import { getTurso } from './_turso.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const db = getTurso()
  const { userId } = req.query

  if (!userId) {
    return res.status(400).json({ error: 'userId required' })
  }

  // Ensure columns exist just in case they haven't been created yet
  try { await db.execute('ALTER TABLE user_progress ADD COLUMN is_omitted INTEGER DEFAULT 0') } catch {}
  try { await db.execute('ALTER TABLE user_progress ADD COLUMN is_flagged INTEGER DEFAULT 0') } catch {}

  try {
    const result = await db.execute({
      sql: `
        SELECT 
          q.id, q.eunacom_code, q.specialty, q.pregunta, 
          q.opcion_a, q.opcion_b, q.opcion_c, q.opcion_d, q.opcion_e,
          q.respuesta_correcta, q.explicacion, q.tags, q.video_recomendado, q.clase_id,
          up.answered_at
        FROM user_progress up
        JOIN eunacom_questions q ON up.question_id = q.id
        WHERE up.user_id = ? AND up.is_correct = 0 AND up.is_omitted = 0
        ORDER BY up.answered_at DESC
        LIMIT 200
      `,
      args: [userId]
    })

    const questions = result.rows.map(r => ({
      id: r.id,
      eunacomCode: r.eunacom_code,
      specialty: r.specialty,
      pregunta: r.pregunta,
      opciones: [
        r.opcion_a && { id: 'A', text: r.opcion_a },
        r.opcion_b && { id: 'B', text: r.opcion_b },
        r.opcion_c && { id: 'C', text: r.opcion_c },
        r.opcion_d && { id: 'D', text: r.opcion_d },
        r.opcion_e && { id: 'E', text: r.opcion_e },
      ].filter(Boolean),
      respuestaCorrecta: r.respuesta_correcta,
      explicacion: r.explicacion,
      tags: r.tags || '',
      videoRecomendado: r.video_recomendado,
      claseId: r.clase_id,
      answeredAt: r.answered_at,
    }))

    return res.json({ data: questions, total: questions.length })
  } catch (err) {
    console.error('[review]', err)
    return res.status(500).json({ error: err.message })
  }
}
