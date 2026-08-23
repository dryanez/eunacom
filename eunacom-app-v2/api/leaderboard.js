import { getTurso } from './_turso.js'

export default async function handler(req, res) {
  const db = getTurso()

  try {
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

    try { await db.execute('ALTER TABLE user_progress ADD COLUMN is_omitted INTEGER DEFAULT 0') } catch {}
    try { await db.execute('ALTER TABLE user_progress ADD COLUMN is_flagged INTEGER DEFAULT 0') } catch {}

    if (req.method === 'GET') {
      const { period, userId, university, sede, country } = req.query // period: 'today' | 'week' | 'all'

      // Date filtering for user_progress and tests
      let upDateFilter = ''
      let testDateFilter = ''
      if (period === 'today') {
        upDateFilter = "AND date(answered_at) = date('now')"
        testDateFilter = "AND date(completed_at) = date('now')"
      } else if (period === 'week') {
        upDateFilter = "AND answered_at >= datetime('now', '-7 days')"
        testDateFilter = "AND completed_at >= datetime('now', '-7 days')"
      }

      let filterSql = ''
      const filterArgs = []

      if (university) {
        filterSql += ' AND LOWER(pr.university) LIKE ?'
        filterArgs.push(`%${university.toLowerCase().trim()}%`)
      }
      if (sede) {
        filterSql += ' AND LOWER(pr.sede) LIKE ?'
        filterArgs.push(`%${sede.toLowerCase().trim()}%`)
      }
      if (country) {
        filterSql += ' AND (LOWER(pr.country) LIKE ? OR LOWER(pr.nationality) LIKE ?)'
        const cLower = `%${country.toLowerCase().trim()}%`
        filterArgs.push(cLower, cLower)
      }

      let lb, sedeLb, countryLb

      if (period === 'today' || period === 'week') {
        // Activity for specific period (today or week)
        lb = await db.execute({
          sql: `WITH user_activity AS (
            SELECT 
              user_id,
              COUNT(*) as total_answers,
              SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct,
              SUM(CASE WHEN is_correct = 1 THEN 10 WHEN is_correct = 0 AND COALESCE(is_omitted, 0) = 0 THEN 2 ELSE 0 END) as xp
            FROM user_progress
            WHERE user_id IS NOT NULL ${upDateFilter}
            GROUP BY user_id

            UNION ALL

            SELECT 
              user_id,
              SUM(total_questions) as total_answers,
              SUM(ROUND((score * 1.0 / 100) * total_questions)) as correct,
              SUM(
                ROUND((score * 1.0 / 100) * total_questions) * 10 + 
                (total_questions - ROUND((score * 1.0 / 100) * total_questions)) * 2
              ) as xp
            FROM tests
            WHERE status = 'completed' AND user_id IS NOT NULL ${testDateFilter}
            GROUP BY user_id
          ),
          aggregated_activity AS (
            SELECT 
              user_id,
              MAX(total_answers) as total_answers,
              MAX(correct) as correct,
              MAX(xp) as xp
            FROM user_activity
            GROUP BY user_id
          )
          SELECT 
            act.user_id,
            COALESCE(pr.first_name, '') as first_name,
            COALESCE(pr.last_name, '') as last_name,
            COALESCE(pr.email, act.user_id) as email,
            COALESCE(pr.university, '') as university,
            COALESCE(pr.sede, '') as sede,
            COALESCE(pr.country, pr.nationality, 'Chile') as country,
            COALESCE(pr.country_code, '+56') as country_code,
            COALESCE(pr.avatar_character, 'dr_strange') as avatar_character,
            act.total_answers,
            act.correct,
            act.xp
          FROM aggregated_activity act
          LEFT JOIN user_profiles pr ON act.user_id = pr.id
          WHERE act.xp > 0 ${filterSql}
          ORDER BY act.xp DESC
          LIMIT 100`,
          args: filterArgs
        })

        sedeLb = await db.execute({
          sql: `WITH user_activity AS (
            SELECT 
              user_id,
              COUNT(*) as total_answers,
              SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct,
              SUM(CASE WHEN is_correct = 1 THEN 10 WHEN is_correct = 0 AND COALESCE(is_omitted, 0) = 0 THEN 2 ELSE 0 END) as xp
            FROM user_progress
            WHERE user_id IS NOT NULL ${upDateFilter}
            GROUP BY user_id

            UNION ALL

            SELECT 
              user_id,
              SUM(total_questions) as total_answers,
              SUM(ROUND((score * 1.0 / 100) * total_questions)) as correct,
              SUM(
                ROUND((score * 1.0 / 100) * total_questions) * 10 + 
                (total_questions - ROUND((score * 1.0 / 100) * total_questions)) * 2
              ) as xp
            FROM tests
            WHERE status = 'completed' AND user_id IS NOT NULL ${testDateFilter}
            GROUP BY user_id
          ),
          aggregated_activity AS (
            SELECT 
              user_id,
              MAX(total_answers) as total_answers,
              MAX(correct) as correct,
              MAX(xp) as xp
            FROM user_activity
            GROUP BY user_id
          )
          SELECT 
            COALESCE(NULLIF(pr.university, ''), 'Otra Universidad') as university,
            COALESCE(NULLIF(pr.sede, ''), 'Sede Principal') as sede,
            COALESCE(pr.country, 'Chile') as country,
            COUNT(DISTINCT act.user_id) as total_doctors,
            SUM(act.total_answers) as total_answers,
            SUM(act.correct) as correct,
            SUM(act.xp) as xp
          FROM aggregated_activity act
          LEFT JOIN user_profiles pr ON act.user_id = pr.id
          WHERE act.xp > 0 AND pr.university IS NOT NULL AND pr.university != ''
          GROUP BY university, sede
          ORDER BY xp DESC
          LIMIT 50`,
          args: []
        })

        countryLb = await db.execute({
          sql: `WITH user_activity AS (
            SELECT 
              user_id,
              COUNT(*) as total_answers,
              SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct,
              SUM(CASE WHEN is_correct = 1 THEN 10 WHEN is_correct = 0 AND COALESCE(is_omitted, 0) = 0 THEN 2 ELSE 0 END) as xp
            FROM user_progress
            WHERE user_id IS NOT NULL ${upDateFilter}
            GROUP BY user_id

            UNION ALL

            SELECT 
              user_id,
              SUM(total_questions) as total_answers,
              SUM(ROUND((score * 1.0 / 100) * total_questions)) as correct,
              SUM(
                ROUND((score * 1.0 / 100) * total_questions) * 10 + 
                (total_questions - ROUND((score * 1.0 / 100) * total_questions)) * 2
              ) as xp
            FROM tests
            WHERE status = 'completed' AND user_id IS NOT NULL ${testDateFilter}
            GROUP BY user_id
          ),
          aggregated_activity AS (
            SELECT 
              user_id,
              MAX(total_answers) as total_answers,
              MAX(correct) as correct,
              MAX(xp) as xp
            FROM user_activity
            GROUP BY user_id
          )
          SELECT 
            COALESCE(NULLIF(pr.country, ''), NULLIF(pr.nationality, ''), 'Chile') as country,
            COALESCE(pr.country_code, '+56') as country_code,
            COUNT(DISTINCT act.user_id) as total_doctors,
            SUM(act.total_answers) as total_answers,
            SUM(act.correct) as correct,
            SUM(act.xp) as xp
          FROM aggregated_activity act
          LEFT JOIN user_profiles pr ON act.user_id = pr.id
          WHERE act.xp > 0
          GROUP BY country
          ORDER BY xp DESC
          LIMIT 30`,
          args: []
        })
      } else {
        // PERIOD === 'all' (General Historical Rankings)
        // Combines all registered user profiles, user_progress questions, and completed tests
        lb = await db.execute({
          sql: `SELECT 
            pr.id as user_id,
            COALESCE(pr.first_name, '') as first_name,
            COALESCE(pr.last_name, '') as last_name,
            COALESCE(pr.email, pr.id) as email,
            COALESCE(pr.university, '') as university,
            COALESCE(pr.sede, '') as sede,
            COALESCE(pr.country, pr.nationality, 'Chile') as country,
            COALESCE(pr.country_code, '+56') as country_code,
            COALESCE(pr.avatar_character, 'dr_strange') as avatar_character,
            MAX(COALESCE(q.total_answers, 0), COALESCE(t.total_questions, 0)) as total_answers,
            MAX(COALESCE(q.correct, 0), COALESCE(t.correct, 0)) as correct,
            MAX(
              COALESCE(q.xp, 0),
              COALESCE(pr.xp, 50),
              (COALESCE(t.total_questions, 0) * 8)
            ) as xp
          FROM user_profiles pr
          LEFT JOIN (
            SELECT 
              user_id,
              COUNT(*) as total_answers,
              SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct,
              SUM(CASE WHEN is_correct = 1 THEN 10 WHEN is_correct = 0 AND COALESCE(is_omitted, 0) = 0 THEN 2 ELSE 0 END) as xp
            FROM user_progress
            GROUP BY user_id
          ) q ON pr.id = q.user_id
          LEFT JOIN (
            SELECT 
              user_id,
              SUM(total_questions) as total_questions,
              SUM(ROUND((score * 1.0 / 100) * total_questions)) as correct
            FROM tests
            WHERE status = 'completed'
            GROUP BY user_id
          ) t ON pr.id = t.user_id
          WHERE (COALESCE(q.total_answers, 0) > 0 OR COALESCE(pr.xp, 0) > 0 OR COALESCE(t.total_questions, 0) > 0)
          ${filterSql}
          ORDER BY xp DESC
          LIMIT 100`,
          args: filterArgs
        })

        sedeLb = await db.execute({
          sql: `SELECT 
            COALESCE(NULLIF(pr.university, ''), 'Otra Universidad') as university,
            COALESCE(NULLIF(pr.sede, ''), 'Sede Principal') as sede,
            COALESCE(pr.country, 'Chile') as country,
            COUNT(DISTINCT pr.id) as total_doctors,
            SUM(MAX(COALESCE(q.total_answers, 0), COALESCE(t.total_questions, 0))) as total_answers,
            SUM(MAX(COALESCE(q.correct, 0), COALESCE(t.correct, 0))) as correct,
            SUM(
              MAX(
                COALESCE(q.xp, 0),
                COALESCE(pr.xp, 50),
                (COALESCE(t.total_questions, 0) * 8)
              )
            ) as xp
          FROM user_profiles pr
          LEFT JOIN (
            SELECT 
              user_id,
              COUNT(*) as total_answers,
              SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct,
              SUM(CASE WHEN is_correct = 1 THEN 10 WHEN is_correct = 0 AND COALESCE(is_omitted, 0) = 0 THEN 2 ELSE 0 END) as xp
            FROM user_progress
            GROUP BY user_id
          ) q ON pr.id = q.user_id
          LEFT JOIN (
            SELECT 
              user_id,
              SUM(total_questions) as total_questions,
              SUM(ROUND((score * 1.0 / 100) * total_questions)) as correct
            FROM tests
            WHERE status = 'completed'
            GROUP BY user_id
          ) t ON pr.id = t.user_id
          WHERE pr.university IS NOT NULL AND pr.university != ''
          GROUP BY university, sede
          HAVING xp > 0
          ORDER BY xp DESC
          LIMIT 50`,
          args: []
        })

        countryLb = await db.execute({
          sql: `SELECT 
            COALESCE(NULLIF(pr.country, ''), NULLIF(pr.nationality, ''), 'Chile') as country,
            COALESCE(pr.country_code, '+56') as country_code,
            COUNT(DISTINCT pr.id) as total_doctors,
            SUM(MAX(COALESCE(q.total_answers, 0), COALESCE(t.total_questions, 0))) as total_answers,
            SUM(MAX(COALESCE(q.correct, 0), COALESCE(t.correct, 0))) as correct,
            SUM(
              MAX(
                COALESCE(q.xp, 0),
                COALESCE(pr.xp, 50),
                (COALESCE(t.total_questions, 0) * 8)
              )
            ) as xp
          FROM user_profiles pr
          LEFT JOIN (
            SELECT 
              user_id,
              COUNT(*) as total_answers,
              SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct,
              SUM(CASE WHEN is_correct = 1 THEN 10 WHEN is_correct = 0 AND COALESCE(is_omitted, 0) = 0 THEN 2 ELSE 0 END) as xp
            FROM user_progress
            GROUP BY user_id
          ) q ON pr.id = q.user_id
          LEFT JOIN (
            SELECT 
              user_id,
              SUM(total_questions) as total_questions,
              SUM(ROUND((score * 1.0 / 100) * total_questions)) as correct
            FROM tests
            WHERE status = 'completed'
            GROUP BY user_id
          ) t ON pr.id = t.user_id
          GROUP BY country
          HAVING xp > 0
          ORDER BY xp DESC
          LIMIT 30`,
          args: []
        })
      }

      // Streak & user stats for requesting user
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
          sedeLeaderboard: sedeLb.rows,
          countryLeaderboard: countryLb.rows,
          streak,
          todayAnswers: todayStats.rows[0]?.today_answers || 0,
          todayCorrect: todayStats.rows[0]?.today_correct || 0,
        })
      }

      return res.json({ 
        leaderboard: lb.rows, 
        sedeLeaderboard: sedeLb.rows,
        countryLeaderboard: countryLb.rows,
        streak: 0 
      })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error('leaderboard error:', err)
    return res.status(500).json({ error: err.message })
  }
}
