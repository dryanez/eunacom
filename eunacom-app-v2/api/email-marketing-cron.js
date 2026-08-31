import { getTurso } from './_turso.js';
import { Resend } from 'resend';
import { 
  getDiscountEmailHtml, 
  getWelcomeEmailHtml, 
  getDailyJoyaEmailHtml, 
  getStreakFreezeWarningEmailHtml,
  getWeaknessSniperEmailHtml,
  getCartAbandonmentEmailHtml,
  getExamCountdownEmailHtml,
  getWeeklyPerformanceDigestHtml
} from './_email-templates.js';

export default async function handler(req, res) {
  const db = getTurso();

  try {
    // 1. Ensure table exists
    await db.execute({
      sql: `CREATE TABLE IF NOT EXISTS email_campaign_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        email TEXT NOT NULL,
        campaign_type TEXT NOT NULL,
        subject TEXT NOT NULL,
        discount_percent INTEGER,
        sent_at TEXT DEFAULT (datetime('now')),
        metadata TEXT
      )`,
      args: []
    }).catch(() => {});

    await db.execute({
      sql: `CREATE INDEX IF NOT EXISTS idx_ecl_user_campaign ON email_campaign_logs(user_id, campaign_type)`,
      args: []
    }).catch(() => {});

    // 2. Auth check
    const authHeader = req.headers['authorization'] || '';
    const cronSecret = process.env.CRON_SECRET || 'eunacom-cron-secret';
    const isCronAuth = authHeader === `Bearer ${cronSecret}`;
    const adminEmail = req.query.adminEmail || req.body?.adminEmail;
    const isAdminAuth = adminEmail === 'dr.felipeyanez@gmail.com';
    const isLocalDev = process.env.NODE_ENV !== 'production' && !authHeader;

    if (!isCronAuth && !isAdminAuth && !isLocalDev) {
      return res.status(401).json({ error: 'Unauthorized. Admin email or Cron Bearer token required.' });
    }

    const { action, dryRun: queryDryRun, testEmail, campaignType } = req.query;
    const isDryRun = queryDryRun === 'true' || req.body?.dryRun === true;

    // --- TEST SEND ROUTE ---
    if (action === 'send_test') {
      const recipient = testEmail || 'dr.felipeyanez@gmail.com';
      const type = campaignType || 'discount_30';
      
      let html = '';
      let subject = '';
      if (type === 'welcome') {
        subject = '🩺 ¡Bienvenido/a Dr(a). Felipe! Tu plan para aprobar el EUNACOM';
        html = getWelcomeEmailHtml({ firstName: 'Felipe' });
      } else if (type === 'discount_30') {
        subject = '⏳ Dr(a). Felipe, no dejes tu preparación a medias (+ 30% DCTO)';
        html = getDiscountEmailHtml({ firstName: 'Felipe', discountPercent: 30, questionsAnswered: 42 });
      } else if (type === 'discount_40') {
        subject = '🩺 ¿Poco tiempo para estudiar? La estrategia de alto rendimiento (+ 40% DCTO)';
        html = getDiscountEmailHtml({ firstName: 'Felipe', discountPercent: 40, questionsAnswered: 42 });
      } else if (type === 'discount_50') {
        subject = '🚨 Última oportunidad: 50% DCTO exclusivo para asegurar tu EUNACOM';
        html = getDiscountEmailHtml({ firstName: 'Felipe', discountPercent: 50, questionsAnswered: 42 });
      } else if (type === 'streak_warning') {
        subject = '🔥 Dr(a). Felipe, tu racha de 3 días se congelará en 3 horas';
        html = getStreakFreezeWarningEmailHtml({ firstName: 'Felipe', streakDays: 3, hoursRemaining: 3 });
      } else if (type === 'weakness_sniper') {
        subject = '🩺 Notamos una duda en Cardiología: Aquí tienes el algoritmo en 1 minuto';
        html = getWeaknessSniperEmailHtml({ name: 'Felipe' });
      } else if (type === 'cart_abandonment') {
        subject = 'Dr(a). Felipe, ¿tuviste algún problema con tu activación en EUNACOM App?';
        html = getCartAbandonmentEmailHtml({ name: 'Felipe' });
      } else if (type === 'exam_countdown') {
        subject = '⏳ Faltan 30 días para el EUNACOM: Plan de Reconstrucciones Reales';
        html = getExamCountdownEmailHtml({ name: 'Felipe', daysRemaining: 30 });
      } else if (type === 'weekly_digest') {
        subject = '📊 Tu Resumen Semanal de Rendimiento EUNACOM';
        html = getWeeklyPerformanceDigestHtml({ firstName: 'Felipe', totalWeeklyQuestions: 45, accuracyRate: 68, rankPosition: 42, strongestSpecialty: 'Cardiología', focusSpecialty: 'Pediatría' });
      } else if (type === 'joya') {
        subject = '💎 Joya EUNACOM: IAM y Angioplastia Primaria';
        html = getDailyJoyaEmailHtml({
          topic: 'Infarto Agudo al Miocardio con Supradesnivel del ST',
          specialty: 'Cardiología',
          clinicalVignette: 'Paciente de 62 años con dolor torácico opresivo de 45 minutos y supradesnivel de ST en V1-V4.',
          pearlRule: 'En IAMCEST, la angioplastia primaria (PCI) es de elección si el tiempo puerta-balón es < 90 min en centro con hemodinamia, o < 120 min si requiere traslado.',
          questionText: '¿Cuál es la conducta inicial prioritaria además de oxígeno si Sat < 90% y monitorización?',
          questionOptions: ['Aspirina 300 mg + Clopidogrel 300-600 mg VO de inmediato', 'Fibrinolisis con Alteplasa sin esperar traslado', 'Ecocardiograma transtorácico de urgencia', 'Betabloqueadores endovenosos'],
          correctOptionIndex: 0
        });
      }

      if (!process.env.RESEND_API_KEY) {
        return res.status(500).json({ error: 'RESEND_API_KEY is not configured.' });
      }

      const resend = new Resend(process.env.RESEND_API_KEY);
      const sender = process.env.RESEND_SENDER_EMAIL || 'equipo@eunacomapp.cl';
      const sendResult = await resend.emails.send({
        from: `EUNACOM App <${sender}>`,
        to: recipient,
        subject,
        html
      });

      return res.json({ success: true, message: `Test email (${type}) sent to ${recipient}`, sendResult });
    }

    // --- MAIN LIFECYCLE DRIP & STREAK PROCESSING ---
    // Fetch all users with valid emails
    const [usersResult, logsResult, activityResult, streakLogsResult] = await Promise.all([
      db.execute({
        sql: `SELECT
                up.id,
                up.email,
                up.first_name,
                up.created_at,
                up.is_premium,
                COALESCE(q.total_answers, 0) as total_answers
              FROM user_profiles up
              LEFT JOIN (
                SELECT user_id, COUNT(*) as total_answers FROM user_progress GROUP BY user_id
              ) q ON up.id = q.user_id
              WHERE up.email IS NOT NULL
                AND up.email LIKE '%@%'
                AND up.id NOT IN ('screenshot-mock', 'dev_test')
              ORDER BY up.created_at DESC`,
        args: []
      }),
      db.execute({
        sql: `SELECT user_id, campaign_type, sent_at FROM email_campaign_logs
              WHERE campaign_type IN ('discount_30', 'discount_40', 'discount_50')`,
        args: []
      }),
      db.execute({
        sql: `SELECT user_id, date(answered_at) as act_date
              FROM (
                SELECT user_id, answered_at FROM user_progress WHERE answered_at IS NOT NULL
                UNION ALL
                SELECT user_id, completed_at as answered_at FROM tests WHERE completed_at IS NOT NULL AND status = 'completed'
              )
              WHERE user_id IS NOT NULL AND user_id NOT IN ('screenshot-mock', 'dev_test')
              GROUP BY user_id, act_date
              ORDER BY user_id, act_date DESC`,
        args: []
      }),
      db.execute({
        sql: `SELECT user_id, campaign_type, sent_at FROM email_campaign_logs
              WHERE campaign_type = 'streak_warning' AND date(sent_at) = date('now')`,
        args: []
      })
    ]);

    const userLogsMap = new Map();
    for (const row of logsResult.rows) {
      if (!userLogsMap.has(row.user_id)) userLogsMap.set(row.user_id, new Set());
      userLogsMap.get(row.user_id).add(row.campaign_type);
    }

    const streakSentToday = new Set(streakLogsResult.rows.map(r => r.user_id));

    // Map user activity dates
    const userActivityDatesMap = new Map();
    for (const row of activityResult.rows) {
      if (!userActivityDatesMap.has(row.user_id)) userActivityDatesMap.set(row.user_id, new Set());
      userActivityDatesMap.get(row.user_id).add(row.act_date);
    }

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const eligible30 = [];
    const eligible40 = [];
    const eligible50 = [];
    const eligibleStreakWarning = [];

    for (const u of usersResult.rows) {
      // 1. Retention Discount Funnel (Non-Premium only)
      if (u.is_premium === 0 && u.created_at) {
        const createdDate = new Date(u.created_at);
        const diffMs = now - createdDate;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const sentTypes = userLogsMap.get(u.id) || new Set();

        if (diffDays >= 7 && diffDays < 14 && !sentTypes.has('discount_30')) {
          eligible30.push({ user: u, diffDays });
        } else if (diffDays >= 14 && diffDays < 21 && !sentTypes.has('discount_40')) {
          eligible40.push({ user: u, diffDays });
        } else if (diffDays >= 21 && !sentTypes.has('discount_50')) {
          eligible50.push({ user: u, diffDays });
        }
      }

      // 2. Streak Freeze Warning Trigger (Streak >= 3 days, no activity today, not notified today)
      const userDates = userActivityDatesMap.get(u.id) || new Set();
      const hasActivityToday = userDates.has(todayStr);

      if (!hasActivityToday && userDates.has(yesterdayStr) && !streakSentToday.has(u.id)) {
        // Calculate consecutive active days backwards from yesterday
        let streak = 1;
        let checkDate = new Date(yesterday);
        checkDate.setDate(checkDate.getDate() - 1);

        while (userDates.has(checkDate.toISOString().split('T')[0])) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        }

        // Trigger condition: streak of 3 or more days
        if (streak >= 3) {
          eligibleStreakWarning.push({
            user: u,
            streakDays: streak,
            hoursRemaining: 3
          });
        }
      }
    }

    const freeUsersCount = usersResult.rows.filter(u => u.is_premium === 0).length;

    const summary = {
      totalUsers: usersResult.rows.length,
      totalFreeUsers: freeUsersCount,
      eligibleWeek1_30Pct: eligible30.length,
      eligibleWeek2_40Pct: eligible40.length,
      eligibleWeek3_50Pct: eligible50.length,
      eligibleStreakWarning: eligibleStreakWarning.length,
      isDryRun
    };

    if (isDryRun) {
      return res.json({
        success: true,
        dryRun: true,
        summary,
        samples: {
          week1_30: eligible30.slice(0, 5).map(e => ({ email: e.user.email, name: e.user.first_name, days: e.diffDays })),
          week2_40: eligible40.slice(0, 5).map(e => ({ email: e.user.email, name: e.user.first_name, days: e.diffDays })),
          week3_50: eligible50.slice(0, 5).map(e => ({ email: e.user.email, name: e.user.first_name, days: e.diffDays })),
          streak_warning: eligibleStreakWarning.slice(0, 5).map(e => ({ email: e.user.email, name: e.user.first_name, streak: e.streakDays, hoursRemaining: e.hoursRemaining })),
        }
      });
    }

    // Live Execution via Resend
    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({ error: 'RESEND_API_KEY is not configured on the server.' });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const SENDER_EMAIL = process.env.RESEND_SENDER_EMAIL || 'equipo@eunacomapp.cl';

    let totalDispatched = 0;
    const sendBatch = async (list, discountPercent, campaignKey, subjectGenerator) => {
      const BATCH_SIZE = 50;
      for (let i = 0; i < list.length; i += BATCH_SIZE) {
        const chunk = list.slice(i, i + BATCH_SIZE);
        const emailPayloads = chunk.map(({ user }) => {
          const subject = subjectGenerator(user.first_name || 'Colega');
          const html = getDiscountEmailHtml({
            firstName: user.first_name || 'Colega',
            discountPercent,
            questionsAnswered: user.total_answers || 0,
            checkoutUrl: `https://www.eunacomapp.cl/pricing?discount=${discountPercent}&uid=${user.id}`
          });
          return {
            from: `EUNACOM App <${SENDER_EMAIL}>`,
            to: user.email,
            subject,
            html,
            user_id: user.id
          };
        });

        // Send via Resend batch API
        const batchPayload = emailPayloads.map(({ user_id, ...rest }) => rest);
        const { data, error } = await resend.batch.send(batchPayload);
        if (error) {
          console.error(`Resend batch error for ${campaignKey}:`, error);
          continue;
        }

        // Insert into email_campaign_logs
        for (const item of emailPayloads) {
          const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          await db.execute({
            sql: `INSERT INTO email_campaign_logs (id, user_id, email, campaign_type, subject, discount_percent)
                  VALUES (?, ?, ?, ?, ?, ?)`,
            args: [logId, item.user_id, item.to, campaignKey, item.subject, discountPercent]
          }).catch(e => console.error('Log insert error:', e));
        }

        totalDispatched += chunk.length;
      }
    };

    // 1. Process 30% OFF (Day 7)
    await sendBatch(
      eligible30,
      30,
      'discount_30',
      (name) => `⏳ Dr(a). ${name}, no dejes tu preparación a medias (+ 30% DCTO)`
    );

    // 2. Process 40% OFF (Day 14)
    await sendBatch(
      eligible40,
      40,
      'discount_40',
      (name) => `🩺 ¿Poco tiempo para estudiar? La estrategia de alto rendimiento (+ 40% DCTO)`
    );

    // 3. Process 50% OFF (Day 21)
    await sendBatch(
      eligible50,
      50,
      'discount_50',
      (name) => `🚨 Última oportunidad: 50% DCTO exclusivo para asegurar tu EUNACOM`
    );

    // 4. Process Streak Freeze Warnings (Streak >= 3 days)
    if (eligibleStreakWarning.length > 0) {
      const BATCH_SIZE = 50;
      for (let i = 0; i < eligibleStreakWarning.length; i += BATCH_SIZE) {
        const chunk = eligibleStreakWarning.slice(i, i + BATCH_SIZE);
        const emailPayloads = chunk.map(({ user, streakDays, hoursRemaining }) => {
          const name = user.first_name || 'Colega';
          const subject = `🔥 Dr(a). ${name}, tu racha de ${streakDays} días se congelará en ${hoursRemaining} horas`;
          const html = getStreakFreezeWarningEmailHtml({
            firstName: name,
            streakDays,
            hoursRemaining,
            rescueUrl: `https://www.eunacomapp.cl/dashboard?action=save_streak&uid=${user.id}`
          });
          return {
            from: `EUNACOM App <${SENDER_EMAIL}>`,
            to: user.email,
            subject,
            html,
            user_id: user.id,
            streakDays
          };
        });

        const batchPayload = emailPayloads.map(({ user_id, streakDays, ...rest }) => rest);
        const { data, error } = await resend.batch.send(batchPayload);
        if (error) {
          console.error('Resend batch error for streak_warning:', error);
          continue;
        }

        for (const item of emailPayloads) {
          const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          await db.execute({
            sql: `INSERT INTO email_campaign_logs (id, user_id, email, campaign_type, subject, metadata)
                  VALUES (?, ?, ?, ?, ?, ?)`,
            args: [logId, item.user_id, item.to, 'streak_warning', item.subject, JSON.stringify({ streakDays: item.streakDays })]
          }).catch(e => console.error('Log insert error for streak warning:', e));
        }

        totalDispatched += chunk.length;
      }
    }

    return res.json({
      success: true,
      dryRun: false,
      totalDispatched,
      summary
    });
  } catch (err) {
    console.error('email-marketing-cron error:', err);
    return res.status(500).json({ error: err.message });
  }
}
