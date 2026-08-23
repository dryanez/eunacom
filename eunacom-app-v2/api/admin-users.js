import { getTurso } from './_turso.js'
import { Resend } from 'resend'

// Admin-only endpoint — lists all user profiles + stats
export default async function handler(req, res) {
  const db = getTurso()

  try {
    // Ensure table exists and has all columns
    await db.execute({
      sql: `CREATE TABLE IF NOT EXISTS user_profiles (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        first_name TEXT,
        last_name TEXT,
        avatar_character TEXT,
        exam_month TEXT,
        exam_year TEXT,
        prep_months TEXT,
        nationality TEXT,
        country TEXT,
        country_code TEXT,
        whatsapp TEXT,
        inscrito_eunacom TEXT,
        ayuda_inscripcion TEXT,
        profile_type TEXT,
        graduation_year TEXT,
        university TEXT,
        sede TEXT,
        goal TEXT,
        study_hours TEXT,
        weak_area TEXT,
        xp INTEGER DEFAULT 50,
        onboarding_done INTEGER DEFAULT 0,
        is_premium INTEGER DEFAULT 0,
        premium_until TEXT,
        plan_months INTEGER,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      )`,
      args: []
    }).catch(() => {})

    const ensureCols = [
      'first_name TEXT', 'last_name TEXT', 'avatar_character TEXT',
      'exam_month TEXT', 'exam_year TEXT', 'prep_months TEXT',
      'nationality TEXT', 'country TEXT', 'country_code TEXT',
      'whatsapp TEXT', 'inscrito_eunacom TEXT', 'ayuda_inscripcion TEXT',
      'profile_type TEXT', 'graduation_year TEXT', 'university TEXT', 'sede TEXT',
      'goal TEXT', 'study_hours TEXT', 'weak_area TEXT', 'xp INTEGER DEFAULT 50',
      'onboarding_done INTEGER DEFAULT 0', 'is_premium INTEGER DEFAULT 0',
      'premium_until TEXT', 'plan_months INTEGER'
    ]
    for (const col of ensureCols) {
      await db.execute({ sql: `ALTER TABLE user_profiles ADD COLUMN ${col}`, args: [] }).catch(() => {})
    }

    if (req.method === 'GET') {
      const { adminEmail, userId, action } = req.query

      // Public settings fetch
      if (action === 'settings') {
        await db.execute({
          sql: `CREATE TABLE IF NOT EXISTS app_settings (key TEXT PRIMARY KEY, value TEXT)`, args: []
        })
        await db.execute({
          sql: `INSERT OR IGNORE INTO app_settings (key, value) VALUES ('freemium_mode', 'strict')`, args: []
        })
        const result = await db.execute({ sql: `SELECT key, value FROM app_settings`, args: [] })
        const settings = {}
        for (const row of result.rows) { settings[row.key] = row.value }
        return res.json({ settings })
      }

      if (adminEmail !== 'dr.felipeyanez@gmail.com') {
        return res.status(403).json({ error: 'Forbidden' })
      }

      // Temporary cleanup route
      if (req.query.cleanup === '1') {
        await db.execute({ sql: "DELETE FROM user_profiles WHERE id = 'screenshot-mock' OR email = 'test@test.com'", args: [] })
        return res.json({ success: true, message: 'Deleted test account' })
      }

      // Detail view: ?userId=xxx — returns tests + clase progress for one user
      if (userId) {
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
        return res.json({ tests: testsResult.rows, clases: clasesResult.rows })
      }

      // List view: all profiles with aggregate stats
      const profiles = await db.execute({
        sql: `SELECT
          up.*,
          COALESCE(q.total_answers, 0) as total_answers,
          COALESCE(q.correct_answers, 0) as correct_answers,
          COALESCE(t.total_tests, 0) as total_tests,
          COALESCE(t.completed_tests, 0) as total_pruebas,
          COALESCE(c.total_classes, 0) as total_classes
        FROM user_profiles up
        LEFT JOIN (
          SELECT user_id, COUNT(*) as total_answers,
                 SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct_answers
          FROM user_progress GROUP BY user_id
        ) q ON up.id = q.user_id
        LEFT JOIN (
          SELECT user_id, COUNT(*) as total_tests,
                 SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tests
          FROM tests GROUP BY user_id
        ) t ON up.id = t.user_id
        LEFT JOIN (
          SELECT user_id, COUNT(*) as total_classes
          FROM clase_progress WHERE video_watched = 1 OR quiz_completed = 1
          GROUP BY user_id
        ) c ON up.id = c.user_id
        ORDER BY up.created_at DESC`,
        args: []
      })
      return res.json({ data: profiles.rows })
    }

    if (req.method === 'PATCH') {
      const { adminEmail, userId, months } = req.body
      if (adminEmail !== 'dr.felipeyanez@gmail.com') {
        return res.status(403).json({ error: 'Forbidden' })
      }
      if (!userId || !months) {
        return res.status(400).json({ error: 'Missing userId or months' })
      }

      await db.execute({ sql: `ALTER TABLE user_profiles ADD COLUMN is_premium INTEGER DEFAULT 0`, args: [] }).catch(() => {})
      await db.execute({ sql: `ALTER TABLE user_profiles ADD COLUMN premium_until TEXT`, args: [] }).catch(() => {})
      await db.execute({ sql: `ALTER TABLE user_profiles ADD COLUMN plan_months INTEGER`, args: [] }).catch(() => {})

      const now = new Date()
      if (months === 12) now.setFullYear(now.getFullYear() + 1)
      else now.setMonth(now.getMonth() + months)
      const premiumUntil = now.toISOString()

      await db.execute({
        sql: `UPDATE user_profiles SET is_premium = 1, premium_until = ?, plan_months = ?, updated_at = datetime('now') WHERE id = ?`,
        args: [premiumUntil, months, userId]
      })

      return res.json({ success: true, premium_until: premiumUntil, plan_months: months })
    }

    if (req.method === 'POST') {
      const { adminEmail, targetEmails, subject, htmlContent, action, key, value } = req.body
      if (adminEmail !== 'dr.felipeyanez@gmail.com') {
        return res.status(403).json({ error: 'Unauthorized' })
      }

      // App Settings update route
      if (action === 'settings') {
        if (!key || value === undefined) return res.status(400).json({ error: 'Missing key or value' })
        
        await db.execute({
          sql: `CREATE TABLE IF NOT EXISTS app_settings (key TEXT PRIMARY KEY, value TEXT)`, args: []
        })
        await db.execute({
          sql: `INSERT INTO app_settings (key, value) VALUES (?, ?)
                ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
          args: [key, value]
        })
        return res.json({ success: true, key, value })
      }

      // Campaign route
      if (!targetEmails || !Array.isArray(targetEmails) || targetEmails.length === 0) {
        return res.status(400).json({ error: 'targetEmails must be a non-empty array' })
      }
      if (!subject || !htmlContent) {
        return res.status(400).json({ error: 'subject and htmlContent are required' })
      }
      if (!process.env.RESEND_API_KEY) {
        return res.status(500).json({ error: 'RESEND_API_KEY is not configured on the server' })
      }

      const resend = new Resend(process.env.RESEND_API_KEY)
      const SENDER_EMAIL = process.env.RESEND_SENDER_EMAIL || 'equipo@eunacom.app'

      const chunkArray = (arr, size) => arr.length > size ? [arr.slice(0, size), ...chunkArray(arr.slice(size), size)] : [arr]
      const batches = chunkArray(targetEmails, 100)
      let totalSent = 0

      for (const batch of batches) {
        const payload = batch.map(email => ({
          from: `EUNACOM App <${SENDER_EMAIL}>`,
          to: email,
          subject: subject,
          html: htmlContent,
        }))
        const { error } = await resend.batch.send(payload)
        if (error) {
          console.error('Resend Error on batch:', error)
          throw new Error(error.message)
        }
        totalSent += batch.length
      }

      return res.status(200).json({ success: true, message: `Campaign sent to ${totalSent} users` })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error('admin-users error:', err)
    return res.status(500).json({ error: err.message })
  }
}
