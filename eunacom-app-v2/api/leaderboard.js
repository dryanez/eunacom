import { getTurso } from './_turso.js'

export default async function handler(req, res) {
  const db = getTurso()

  try {
    if (req.method === 'GET') {
      const { period, userId } = req.query // period: 'today' | 'week' | 'all'

      // Leaderboard: top users by XP (correct*10 + incorrect*2)
      let dateFilter = ''
      if (period === 'today') {
        dateFilter = "AND date(up.answered_at) = date('now')"
      } else if (period === 'week') {
        dateFilter = "AND up.answered_at >= datetime('now', '-7 days')"
      }

      const lb = await db.execute({
        sql: `SELECT 
          up.user_id,
          COALESCE(pr.first_name, '') as first_name,
          COALESCE(pr.last_name, '') as last_name,
          COALESCE(pr.email, up.user_id) as email,
          COUNT(*) as total_answers,
          SUM(CASE WHEN up.is_correct = 1 THEN 1 ELSE 0 END) as correct,
          (SUM(CASE WHEN up.is_correct = 1 THEN 10 ELSE 2 END)) as xp
        FROM user_progress up
        LEFT JOIN user_profiles pr ON up.user_id = pr.id
        WHERE 1=1 ${dateFilter}
        GROUP BY up.user_id
        ORDER BY xp DESC
        LIMIT 50`,
        args: []
      })

      // Streak for requesting user
      let streak = 0
      if (userId) {
        const days = await db.execute({
          sql: `SELECT DISTINCT date(answered_at) as d 
                FROM user_progress 
                WHERE user_id = ? 
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
          sql: `SELECT COUNT(*) as today_answers,
                SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as today_correct
                FROM user_progress 
                WHERE user_id = ? AND date(answered_at) = date('now')`,
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
