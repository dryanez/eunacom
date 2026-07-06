import { getTurso } from './_turso.js'

export default async function handler(req, res) {
  const db = getTurso()

  try {
    // Ensure table exists and default setting is inserted
    await db.execute({
      sql: `CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT
      )`,
      args: []
    })

    // Insert default if it doesn't exist (using strict mode as requested)
    await db.execute({
      sql: `INSERT OR IGNORE INTO app_settings (key, value) VALUES ('freemium_mode', 'strict')`,
      args: []
    })

    if (req.method === 'GET') {
      const result = await db.execute({
        sql: `SELECT key, value FROM app_settings`,
        args: []
      })
      
      const settings = {}
      for (const row of result.rows) {
        settings[row.key] = row.value
      }
      return res.json({ settings })
    }

    if (req.method === 'POST') {
      const { adminEmail, key, value } = req.body
      if (adminEmail !== 'dr.felipeyanez@gmail.com') {
        return res.status(403).json({ error: 'Forbidden' })
      }
      if (!key || value === undefined) {
        return res.status(400).json({ error: 'Missing key or value' })
      }

      await db.execute({
        sql: `INSERT INTO app_settings (key, value) VALUES (?, ?)
              ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
        args: [key, value]
      })

      return res.json({ success: true, key, value })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error('app-settings error:', err)
    return res.status(500).json({ error: err.message })
  }
}
