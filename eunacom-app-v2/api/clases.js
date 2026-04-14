// GET    /api/clases?userId=xxx   → list saved classes
// POST   /api/clases              → save a new class
// DELETE /api/clases?id=xxx       → delete a class
import { getTurso } from './_turso.js';

export default async function handler(req, res) {
  try {
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
      specialty TEXT,
      subsystem TEXT,
      lesson_number INTEGER,
      slides_file TEXT,
      video_dir TEXT,
      saved_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`
  })

  // Add migration for old table
  try { await db.execute('ALTER TABLE clases ADD COLUMN specialty TEXT'); } catch (e) {}
  try { await db.execute('ALTER TABLE clases ADD COLUMN subsystem TEXT'); } catch (e) {}
  try { await db.execute('ALTER TABLE clases ADD COLUMN lesson_number INTEGER'); } catch (e) {}
  try { await db.execute('ALTER TABLE clases ADD COLUMN slides_file TEXT'); } catch (e) {}
  try { await db.execute('ALTER TABLE clases ADD COLUMN video_dir TEXT'); } catch (e) {}

  if (req.method === 'GET') {
    const { userId, id } = req.query

    // Single class detail (normalize Unicode for macOS NFC/NFD compat)
    if (id) {
      let result = await db.execute({ sql: 'SELECT * FROM clases WHERE id = ?', args: [id] })
      if (!result.rows.length) {
        result = await db.execute({ sql: 'SELECT * FROM clases WHERE id = ?', args: [id.normalize('NFD')] })
      }
      if (!result.rows.length) {
        result = await db.execute({ sql: 'SELECT * FROM clases WHERE id = ?', args: [id.normalize('NFC')] })
      }
      return res.json({ data: result.rows[0] || null })
    }

    // List mode: return ALL classes (shared catalog for all users)
    // Progress is tracked per-user in clase_progress table, not here
    const result = await db.execute({
      sql: 'SELECT id, user_id, topic, specialty, subsystem, lesson_number, slides_file, video_dir, saved_at FROM clases ORDER BY specialty, subsystem, lesson_number',
      args: []
    })
    return res.json({ data: result.rows })
  }

  if (req.method === 'POST') {
    const { id, userId, topic, summary, keyPoints, quiz, specialty, subsystem, lessonNumber, slidesFile, videoDir } = req.body
    if (!userId || !topic) return res.status(400).json({ error: 'userId and topic required' })
    await db.execute({
      sql: `INSERT INTO clases (id, user_id, topic, summary, key_points, quiz, specialty, subsystem, lesson_number, slides_file, video_dir, saved_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now')) ON CONFLICT(id) DO UPDATE SET 
            topic=excluded.topic, summary=excluded.summary, key_points=excluded.key_points, quiz=excluded.quiz,
            specialty=excluded.specialty, subsystem=excluded.subsystem, lesson_number=excluded.lesson_number,
            slides_file=excluded.slides_file, video_dir=excluded.video_dir`,
      args: [
        id || crypto.randomUUID(),
        userId,
        topic,
        summary || '',
        JSON.stringify(keyPoints || []),
        JSON.stringify(quiz || []),
        specialty || 'General',
        subsystem || 'General',
        lessonNumber || 1,
        slidesFile || null,
        videoDir || null
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
  } catch (err) {
    console.error('clases handler error:', err)
    return res.status(500).json({ error: err.message, stack: err.stack })
  }
}
