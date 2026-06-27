import { getTurso } from './_turso.js'

export default async function handler(req, res) {
  const db = getTurso()

  try {
    try { await db.execute('ALTER TABLE user_progress ADD COLUMN is_omitted INTEGER DEFAULT 0') } catch {}
    try { await db.execute('ALTER TABLE user_progress ADD COLUMN is_flagged INTEGER DEFAULT 0') } catch {}

    if (req.method === 'GET') {
      const { period, userId } = req.query // period: 'today' | 'week' | 'all'

      // Leaderboard: top users by XP (correct*10 + incorrect*2)
      // We read directly from tests where status = 'completed'
      let dateFilter = ''
      if (period === 'today') {
        dateFilter = "AND date(t.completed_at) = date('now')"
      } else if (period === 'week') {
        dateFilter = "AND t.completed_at >= datetime('now', '-7 days')"
      }

      const lb = await db.execute({
        sql: `SELECT 
          t.user_id,
          COALESCE(pr.first_name, '') as first_name,
          COALESCE(pr.last_name, '') as last_name,
          COALESCE(pr.email, t.user_id) as email,
          SUM(t.total_questions) as total_answers,
          SUM(ROUND((t.score * 1.0 / 100) * t.total_questions)) as correct,
          SUM(
              ROUND((t.score * 1.0 / 100) * t.total_questions) * 10 + 
              (t.total_questions - ROUND((t.score * 1.0 / 100) * t.total_questions)) * 2
          ) as xp
        FROM tests t
        LEFT JOIN user_profiles pr ON t.user_id = pr.id
        WHERE t.status = 'completed' ${dateFilter}
        GROUP BY t.user_id
        ORDER BY xp DESC
        LIMIT 50`,
        args: []
      })

      // Streak for requesting user
      let streak = 0
      if (userId) {
        const days = await db.execute({
          sql: `SELECT DISTINCT date(completed_at) as d 
                FROM tests 
                WHERE user_id = ? AND status = 'completed'
                ORDER BY d DESC 
                LIMIT 60`,
          args: [userId]
        })
        // Count consecutive days from today/yesterday
        const today = new Date()
        today.setHours(0,0,0,0)
        const dates = days.rows.map(r => r.d)
        
        // Check if today or yesterday has activity (allow ongoing day)
        const todayStr = today.toISOString().split('T')[0]
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = yesterday.toISOString().split('T')[0]
        
        let checkDate
        if (dates.includes(todayStr)) {
          checkDate = new Date(today)
          streak = 1
        } else if (dates.includes(yesterdayStr)) {
          checkDate = new Date(yesterday)
          streak = 1
        } else {
          checkDate = null
          streak = 0
        }

        if (checkDate) {
          let prev = new Date(checkDate)
          prev.setDate(prev.getDate() - 1)
          while (dates.includes(prev.toISOString().split('T')[0])) {
            streak++
            prev.setDate(prev.getDate() - 1)
          }
        }

        // Also get today's stats for the user
        const todayStats = await db.execute({
          sql: `SELECT 
                  SUM(t.total_questions) as today_answers,
                  SUM(ROUND((t.score * 1.0 / 100) * t.total_questions)) as today_correct
                FROM tests t
                WHERE t.user_id = ? AND t.status = 'completed' AND date(t.completed_at) = date('now')`,
          args: [userId]
        })

        return res.json({
          leaderboard: lb.rows,
          streak,
          todayAnswers: todayStats.rows[0]?.today_answers || 0,
          todayCorrect: todayStats.rows[0]?.today_correct || 0,
        })
      }

      return res.json({ leaderboard: lb.rows, streak: 0 })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error('leaderboard error:', err)
    return res.status(500).json({ error: err.message })
  }
}
