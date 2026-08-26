import { getTurso } from './_turso.js'

const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || 'APP_USR-7082707557004383-062820-0010b807284702f3c66366d196d3cefa-3123324373'
const USD_TO_CLP_RATE = 930

const MONTH_NAMES_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

function getMonthLabel(ymStr) {
  if (!ymStr) return ymStr
  const [year, month] = ymStr.split('-')
  const mIndex = parseInt(month, 10) - 1
  return `${MONTH_NAMES_ES[mIndex] || month} ${year}`
}

function normalizePlanId(planId, desc, amount) {
  if (planId) {
    if (planId === '1m') return { id: '1m', name: '1 Mes ($14.990)' }
    if (planId === '3m') return { id: '3m', name: '3 Meses ($34.990)' }
    if (planId === '6m') return { id: '6m', name: '6 Meses ($54.990)' }
    if (planId === '1y') return { id: '1y', name: '1 Año ($89.990)' }
    if (planId === 'offer') return { id: 'offer', name: 'Oferta 1 Mes ($5.000)' }
    if (planId === 'donate') return { id: 'donation', name: 'Donación ($9.000)' }
  }
  const d = (desc || '').toLowerCase()
  if (d.includes('donación') || d.includes('donacion')) return { id: 'donation', name: 'Donación ($9.000)' }
  if (d.includes('oferta')) return { id: 'offer', name: 'Oferta 1 Mes ($5.000)' }
  if (d.includes('1 mes') || d.includes('1m')) return { id: '1m', name: '1 Mes ($14.990)' }
  if (d.includes('3 meses') || d.includes('3m')) return { id: '3m', name: '3 Meses ($34.990)' }
  if (d.includes('6 meses') || d.includes('6m')) return { id: '6m', name: '6 Meses ($54.990)' }
  if (d.includes('1 año') || d.includes('1 ano') || d.includes('1y')) return { id: '1y', name: '1 Año ($89.990)' }

  const n = parseFloat(amount || 0)
  if (n === 5000) return { id: 'offer', name: 'Oferta 1 Mes ($5.000)' }
  if (n === 9000) return { id: 'donation', name: 'Donación ($9.000)' }
  if (n === 14990 || n <= 20) return { id: '1m', name: '1 Mes ($14.990)' }
  if (n === 34990 || (n > 20 && n <= 45)) return { id: '3m', name: '3 Meses ($34.990)' }
  if (n === 54990 || (n > 45 && n <= 75)) return { id: '6m', name: '6 Meses ($54.990)' }
  if (n === 89990 || n > 75) return { id: '1y', name: '1 Año ($89.990)' }

  return { id: 'other', name: 'Plan EUNACOM' }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { adminEmail, format } = req.query
  if (adminEmail !== 'dr.felipeyanez@gmail.com') {
    return res.status(403).json({ error: 'Forbidden' })
  }

  let db = null
  if (process.env.TURSO_DATABASE_URL) {
    try {
      db = getTurso()
    } catch (e) {
      console.error('[Finances] Could not get Turso client:', e)
    }
  }

  try {
    // 1. Fetch user profiles to match student info
    let usersById = new Map()
    let usersByEmail = new Map()
    if (db) {
      try {
        const upResult = await db.execute({
          sql: `SELECT id, email, first_name, last_name, country, whatsapp, university, sede, is_premium, premium_until FROM user_profiles`,
          args: []
        })
        for (const u of (upResult.rows || [])) {
          usersById.set(u.id, u)
          if (u.email) usersByEmail.set(u.email.toLowerCase(), u)
        }
      } catch (e) {
        console.error('[Finances] Error loading user profiles:', e)
      }
    }

    // 2. Fetch Mercado Pago Payments (EUNACOM App only)
    let mpTransactions = []
    try {
      let offset = 0
      const limit = 50
      let allRawMp = []
      
      while (true) {
        const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/search?sort=date_created&criteria=desc&limit=${limit}&offset=${offset}`, {
          headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` }
        })
        if (!mpRes.ok) break
        const mpData = await mpRes.json()
        if (!mpData.results || mpData.results.length === 0) break
        allRawMp = allRawMp.concat(mpData.results)
        if (allRawMp.length >= (mpData.paging?.total || 0) || mpData.results.length < limit) break
        offset += limit
      }

      // Filter for EUNACOM platform transactions strictly
      for (const p of allRawMp) {
        const ext = p.external_reference || ''
        const desc = p.description || ''
        const isEunacomExt = ext.includes('|') && (
          ext.includes('|1m') || ext.includes('|3m') || ext.includes('|6m') || ext.includes('|1y') || ext.includes('|offer') || ext.includes('|donate')
        )
        const isEunacomDesc = desc.toLowerCase().includes('eunacom') || desc.toLowerCase().includes('donación app') || desc.toLowerCase().includes('oferta')

        if (!isEunacomExt && !isEunacomDesc) continue

        let userId = null
        let rawPlanId = null
        if (ext.includes('|')) {
          const parts = ext.split('|')
          userId = parts[0]
          rawPlanId = parts[1]
        }

        const payerEmail = p.payer?.email || null
        const matchedUser = (userId ? usersById.get(userId) : null) || (payerEmail ? usersByEmail.get(payerEmail.toLowerCase()) : null)

        const planInfo = normalizePlanId(rawPlanId, desc, p.transaction_amount)

        const payerName = p.card?.cardholder?.name ||
          (p.payer?.first_name ? `${p.payer.first_name} ${p.payer.last_name || ''}`.trim() : null) ||
          (matchedUser?.first_name ? `${matchedUser.first_name} ${matchedUser.last_name || ''}`.trim() : null)

        mpTransactions.push({
          id: String(p.id),
          gateway: 'mercadopago',
          gateway_name: 'Mercado Pago',
          date: p.date_created,
          date_approved: p.date_approved,
          amount: p.transaction_amount || 0,
          currency: p.currency_id || 'CLP',
          net_amount: p.transaction_details?.net_received_amount || p.transaction_amount || 0,
          fee: p.fee_details?.[0]?.amount || 0,
          status: p.status, // 'approved', 'rejected', 'pending', etc.
          status_detail: p.status_detail,
          plan_id: planInfo.id,
          plan_name: planInfo.name,
          description: desc,
          payer_name: payerName,
          payer_email: payerEmail,
          user_id: matchedUser?.id || userId,
          user_name: matchedUser ? `${matchedUser.first_name || ''} ${matchedUser.last_name || ''}`.trim() : payerName,
          user_email: matchedUser?.email || payerEmail,
          user_country: matchedUser?.country || p.card?.country || null,
          user_university: matchedUser?.university || null,
          user_whatsapp: matchedUser?.whatsapp || null,
          is_user_premium: matchedUser ? (matchedUser.is_premium === 1) : false,
          payment_method: p.payment_method_id || null,
          external_reference: ext
        })
      }
    } catch (e) {
      console.error('[Finances] Error loading Mercado Pago transactions:', e)
    }

    // 3. Fetch PayPal Transactions from DB
    let paypalTransactions = []
    if (db) {
      try {
        await db.execute({
        sql: `CREATE TABLE IF NOT EXISTS paypal_transactions (
          transaction_id TEXT PRIMARY KEY,
          payer_name TEXT,
          payer_email TEXT,
          item_name TEXT,
          amount TEXT,
          currency TEXT,
          status TEXT,
          plan_id TEXT,
          plan_months INTEGER,
          user_id TEXT,
          user_email_match TEXT,
          payer_country TEXT,
          payment_date TEXT,
          raw_data TEXT,
          created_at TEXT DEFAULT (datetime('now'))
        )`,
        args: []
      }).catch(() => {})

      const ppResult = await db.execute({
        sql: `SELECT pt.*, up.first_name as profile_first_name, up.last_name as profile_last_name,
                up.email as profile_email, up.country as profile_country, up.whatsapp as profile_whatsapp,
                up.university as profile_university, up.is_premium, up.premium_until
              FROM paypal_transactions pt
              LEFT JOIN user_profiles up ON pt.user_id = up.id
              ORDER BY pt.created_at DESC`,
        args: []
      })

      for (const row of (ppResult.rows || [])) {
        const planInfo = normalizePlanId(row.plan_id, row.item_name, row.amount)
        const amt = parseFloat(row.amount || 0)
        paypalTransactions.push({
          id: row.transaction_id,
          gateway: 'paypal',
          gateway_name: 'PayPal',
          date: row.payment_date || row.created_at,
          date_approved: row.payment_date || row.created_at,
          amount: amt,
          currency: row.currency || 'USD',
          net_amount: amt,
          fee: 0,
          status: (row.status || 'COMPLETED').toLowerCase(),
          status_detail: row.status,
          plan_id: planInfo.id,
          plan_name: planInfo.name,
          description: row.item_name || 'EUNACOM PayPal Subscription',
          payer_name: row.payer_name || null,
          payer_email: row.payer_email || null,
          user_id: row.user_id || null,
          user_name: row.profile_first_name ? `${row.profile_first_name} ${row.profile_last_name || ''}`.trim() : (row.payer_name || null),
          user_email: row.profile_email || row.payer_email || null,
          user_country: row.payer_country || row.profile_country || null,
          user_university: row.profile_university || null,
          user_whatsapp: row.profile_whatsapp || null,
          is_user_premium: row.is_premium === 1,
          payment_method: 'paypal',
          external_reference: row.plan_id || null
        })
      }
    } catch (e) {
      console.error('[Finances] Error loading PayPal transactions:', e)
    }
  }

    // 4. Combine all transactions
    const allTransactions = [...mpTransactions, ...paypalTransactions].sort((a, b) => {
      const da = new Date(a.date || 0).getTime()
      const dbDate = new Date(b.date || 0).getTime()
      return dbDate - da
    })

    // 5. Compute Monthly Aggregations
    const monthlyMap = new Map()

    for (const t of allTransactions) {
      const ym = (t.date || '').slice(0, 7) // 'YYYY-MM'
      if (!ym || ym.length < 7) continue

      if (!monthlyMap.has(ym)) {
        monthlyMap.set(ym, {
          monthKey: ym,
          monthLabel: getMonthLabel(ym),
          mpTotalCLP: 0,
          mpNetCLP: 0,
          mpCount: 0,
          paypalTotalUSD: 0,
          paypalCount: 0,
          totalEstimatedCLP: 0,
          successfulCount: 0,
          rejectedCount: 0,
          pendingCount: 0,
          plans: {
            '1m': { count: 0, totalCLP: 0, totalUSD: 0 },
            '3m': { count: 0, totalCLP: 0, totalUSD: 0 },
            '6m': { count: 0, totalCLP: 0, totalUSD: 0 },
            '1y': { count: 0, totalCLP: 0, totalUSD: 0 },
            'offer': { count: 0, totalCLP: 0, totalUSD: 0 },
            'donation': { count: 0, totalCLP: 0, totalUSD: 0 },
            'other': { count: 0, totalCLP: 0, totalUSD: 0 }
          }
        })
      }

      const m = monthlyMap.get(ym)
      const isApproved = t.status === 'approved' || t.status === 'completed' || t.status === 'COMPLETED'

      if (isApproved) {
        m.successfulCount++
        if (t.gateway === 'mercadopago') {
          m.mpTotalCLP += t.amount
          m.mpNetCLP += t.net_amount
          m.mpCount++
          m.totalEstimatedCLP += t.amount
          if (m.plans[t.plan_id]) {
            m.plans[t.plan_id].count++
            m.plans[t.plan_id].totalCLP += t.amount
          } else {
            m.plans.other.count++
            m.plans.other.totalCLP += t.amount
          }
        } else if (t.gateway === 'paypal') {
          m.paypalTotalUSD += t.amount
          m.paypalCount++
          m.totalEstimatedCLP += Math.round(t.amount * USD_TO_CLP_RATE)
          if (m.plans[t.plan_id]) {
            m.plans[t.plan_id].count++
            m.plans[t.plan_id].totalUSD += t.amount
          } else {
            m.plans.other.count++
            m.plans.other.totalUSD += t.amount
          }
        }
      } else if (t.status === 'rejected' || t.status === 'cancelled') {
        m.rejectedCount++
      } else {
        m.pendingCount++
      }
    }

    const monthly = Array.from(monthlyMap.values()).sort((a, b) => b.monthKey.localeCompare(a.monthKey))

    // 6. Global KPIs
    let totalRevenueCLP = 0
    let totalNetCLP = 0
    let totalRevenueUSD = 0
    let totalApprovedCount = 0
    let totalRejectedCount = 0
    let totalPendingCount = 0
    let globalPlans = {
      '1m': { count: 0, totalCLP: 0, totalUSD: 0, name: '1 Mes' },
      '3m': { count: 0, totalCLP: 0, totalUSD: 0, name: '3 Meses' },
      '6m': { count: 0, totalCLP: 0, totalUSD: 0, name: '6 Meses' },
      '1y': { count: 0, totalCLP: 0, totalUSD: 0, name: '1 Año' },
      'offer': { count: 0, totalCLP: 0, totalUSD: 0, name: 'Oferta 1 Mes' },
      'donation': { count: 0, totalCLP: 0, totalUSD: 0, name: 'Donaciones' },
      'other': { count: 0, totalCLP: 0, totalUSD: 0, name: 'Otros' }
    }

    for (const t of allTransactions) {
      const isApproved = t.status === 'approved' || t.status === 'completed' || t.status === 'COMPLETED'
      if (isApproved) {
        totalApprovedCount++
        if (t.gateway === 'mercadopago') {
          totalRevenueCLP += t.amount
          totalNetCLP += t.net_amount
          if (globalPlans[t.plan_id]) {
            globalPlans[t.plan_id].count++
            globalPlans[t.plan_id].totalCLP += t.amount
          } else {
            globalPlans.other.count++
            globalPlans.other.totalCLP += t.amount
          }
        } else if (t.gateway === 'paypal') {
          totalRevenueUSD += t.amount
          if (globalPlans[t.plan_id]) {
            globalPlans[t.plan_id].count++
            globalPlans[t.plan_id].totalUSD += t.amount
          } else {
            globalPlans.other.count++
            globalPlans.other.totalUSD += t.amount
          }
        }
      } else if (t.status === 'rejected' || t.status === 'cancelled') {
        totalRejectedCount++
      } else {
        totalPendingCount++
      }
    }

    const totalEstimatedCLP = totalRevenueCLP + Math.round(totalRevenueUSD * USD_TO_CLP_RATE)

    // Current month & previous month comparison
    const currentYM = new Date().toISOString().slice(0, 7)
    const prevDate = new Date()
    prevDate.setMonth(prevDate.getMonth() - 1)
    const prevYM = prevDate.toISOString().slice(0, 7)

    const currentMonthData = monthly.find(m => m.monthKey === currentYM) || {
      monthKey: currentYM, monthLabel: getMonthLabel(currentYM),
      mpTotalCLP: 0, paypalTotalUSD: 0, totalEstimatedCLP: 0, successfulCount: 0
    }
    const prevMonthData = monthly.find(m => m.monthKey === prevYM) || {
      monthKey: prevYM, monthLabel: getMonthLabel(prevYM),
      mpTotalCLP: 0, paypalTotalUSD: 0, totalEstimatedCLP: 0, successfulCount: 0
    }

    let growthCLP = 0
    if (prevMonthData.totalEstimatedCLP > 0) {
      growthCLP = Math.round(((currentMonthData.totalEstimatedCLP - prevMonthData.totalEstimatedCLP) / prevMonthData.totalEstimatedCLP) * 100)
    }

    const averageTicketCLP = totalApprovedCount > 0 ? Math.round(totalEstimatedCLP / totalApprovedCount) : 0

    // 7. CSV Export
    if (format === 'csv') {
      const headers = [
        'ID Transacción', 'Pasarela', 'Fecha', 'Estado', 'Monto', 'Moneda',
        'Plan', 'Nombre Pagador', 'Email Pagador', 'Usuario Nombre', 'Usuario Email',
        'Universidad', 'País', 'WhatsApp', 'Método Pago', 'Referencia Externa'
      ]
      const esc = (val) => {
        if (val === null || val === undefined) return ''
        const s = String(val)
        if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`
        return s
      }

      const rows = [headers.join(',')]
      for (const t of allTransactions) {
        rows.push([
          esc(t.id),
          esc(t.gateway_name),
          esc(t.date),
          esc(t.status),
          esc(t.amount),
          esc(t.currency),
          esc(t.plan_name),
          esc(t.payer_name),
          esc(t.payer_email),
          esc(t.user_name),
          esc(t.user_email),
          esc(t.user_university),
          esc(t.user_country),
          esc(t.user_whatsapp),
          esc(t.payment_method),
          esc(t.external_reference)
        ].join(','))
      }

      res.setHeader('Content-Type', 'text/csv; charset=utf-8')
      res.setHeader('Content-Disposition', `attachment; filename="eunacom_finanzas_${new Date().toISOString().slice(0, 10)}.csv"`)
      return res.status(200).send('\uFEFF' + rows.join('\n'))
    }

    return res.json({
      kpis: {
        totalRevenueCLP,
        totalNetCLP,
        totalRevenueUSD,
        totalEstimatedCLP,
        usdToClpRate: USD_TO_CLP_RATE,
        totalApprovedCount,
        totalRejectedCount,
        totalPendingCount,
        averageTicketCLP,
        currentMonth: currentMonthData,
        previousMonth: prevMonthData,
        growthCLP
      },
      monthly,
      globalPlans,
      transactions: allTransactions
    })
  } catch (err) {
    console.error('[Finances] Server error:', err)
    return res.status(500).json({ error: err.message })
  }
}
