// GET /api/dashboard?adminEmail=dr.felipeyanez@gmail.com
// Private metrics endpoint for the Obsidian Command Center plugin.
import { getTurso } from './_turso.js'

const ADMIN_EMAIL = 'dr.felipeyanez@gmail.com'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { adminEmail } = req.query
  if (adminEmail !== ADMIN_EMAIL) return res.status(403).json({ error: 'Forbidden' })

  const db = getTurso()

  try {
    const [
      usersTotal,
      usersPremium,
      usersNewWeek,
      usersNewMonth,
      paypalMonth,
      paypalAllTime,
      paypalRecent,
      planBreakdown,
      recentActivations,
      classProgress,
      testsCompleted,
    ] = await Promise.all([
      db.execute({ sql: `SELECT COUNT(*) as n FROM user_profiles`, args: [] }),

      db.execute({ sql: `SELECT COUNT(*) as n FROM user_profiles WHERE is_premium = 1`, args: [] }),

      db.execute({
        sql: `SELECT COUNT(*) as n FROM user_profiles WHERE created_at > datetime('now', '-7 days')`,
        args: [],
      }),

      db.execute({
        sql: `SELECT COUNT(*) as n FROM user_profiles WHERE created_at > datetime('now', '-30 days')`,
        args: [],
      }),

      // PayPal revenue this calendar month
      db.execute({
        sql: `SELECT
                COALESCE(SUM(CAST(amount AS FLOAT)), 0) as revenue,
                COUNT(*) as transactions
              FROM paypal_transactions
              WHERE status IN ('COMPLETED','SUCCESS')
              AND payment_date >= date('now','start of month')`,
        args: [],
      }),

      // PayPal all-time revenue
      db.execute({
        sql: `SELECT
                COALESCE(SUM(CAST(amount AS FLOAT)), 0) as revenue,
                COUNT(*) as transactions
              FROM paypal_transactions
              WHERE status IN ('COMPLETED','SUCCESS')`,
        args: [],
      }),

      // Last 5 PayPal transactions
      db.execute({
        sql: `SELECT payer_name, payer_email, amount, currency, plan_id, plan_months, payment_date
              FROM paypal_transactions
              WHERE status IN ('COMPLETED','SUCCESS')
              ORDER BY payment_date DESC LIMIT 5`,
        args: [],
      }),

      // Premium plan breakdown by months purchased
      db.execute({
        sql: `SELECT plan_months, COUNT(*) as count,
                     COALESCE(SUM(CAST(amount AS FLOAT)), 0) as revenue
              FROM paypal_transactions
              WHERE status IN ('COMPLETED','SUCCESS')
              GROUP BY plan_months
              ORDER BY plan_months`,
        args: [],
      }).catch(() => ({ rows: [] })),

      // Recent premium activations from user_profiles
      db.execute({
        sql: `SELECT email, first_name, last_name, plan_months, premium_until, updated_at
              FROM user_profiles
              WHERE is_premium = 1
              ORDER BY updated_at DESC LIMIT 10`,
        args: [],
      }).catch(() => ({ rows: [] })),

      // Total class completions
      db.execute({
        sql: `SELECT COUNT(*) as n FROM clase_progress WHERE quiz_completed = 1 OR video_watched = 1`,
        args: [],
      }).catch(() => ({ rows: [{ n: 0 }] })),

      // Completed tests
      db.execute({
        sql: `SELECT COUNT(*) as n FROM tests WHERE status = 'completed'`,
        args: [],
      }).catch(() => ({ rows: [{ n: 0 }] })),
    ])

    return res.json({
      synced_at: new Date().toISOString(),
      students: {
        total: Number(usersTotal.rows[0]?.n ?? 0),
        premium: Number(usersPremium.rows[0]?.n ?? 0),
        new_week: Number(usersNewWeek.rows[0]?.n ?? 0),
        new_month: Number(usersNewMonth.rows[0]?.n ?? 0),
      },
      engagement: {
        class_completions: Number(classProgress.rows[0]?.n ?? 0),
        tests_completed: Number(testsCompleted.rows[0]?.n ?? 0),
      },
      paypal: {
        month_revenue: Number(paypalMonth.rows[0]?.revenue ?? 0),
        month_transactions: Number(paypalMonth.rows[0]?.transactions ?? 0),
        alltime_revenue: Number(paypalAllTime.rows[0]?.revenue ?? 0),
        alltime_transactions: Number(paypalAllTime.rows[0]?.transactions ?? 0),
        recent: paypalRecent.rows.map(r => ({
          name: r.payer_name,
          amount: r.amount,
          currency: r.currency,
          plan: r.plan_id,
          months: r.plan_months,
          date: r.payment_date,
        })),
        plan_breakdown: planBreakdown.rows.map(r => ({
          months: Number(r.plan_months),
          count: Number(r.count),
          revenue: Number(r.revenue),
        })),
      },
      premium_activations: recentActivations.rows.map(r => ({
        email: r.email,
        name: [r.first_name, r.last_name].filter(Boolean).join(' ') || r.email,
        plan_months: Number(r.plan_months),
        premium_until: r.premium_until,
        activated_at: r.updated_at,
      })),
    })
  } catch (err) {
    console.error('dashboard error:', err)
    return res.status(500).json({ error: err.message })
  }
}
