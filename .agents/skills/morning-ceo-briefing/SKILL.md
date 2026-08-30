---
name: morning-ceo-briefing
description: >-
  Generates a daily executive briefing for the EUNACOM solopreneur by aggregating KPIs from
  Turso database (users, subscribers, engagement), PayPal transactions (revenue, MRR),
  Telegram channels (subscriber counts), and content pipeline status into a single markdown report.
---

# Morning CEO Briefing Skill (EUNACOM Solopreneur Dashboard)

Use this skill whenever generating a daily business briefing, checking KPI health, auditing revenue metrics, reviewing user growth, or producing a periodic business report for the EUNACOM platform.

---

## 1. Purpose

This skill aggregates data from all EUNACOM platform systems into a single, scannable morning report. It answers the 5 questions every solopreneur needs answered before starting their day:

1. **💰 How much money came in?** (Revenue, MRR, new payments)
2. **👥 How many users do I have?** (Total, new, premium, churn risk)
3. **📊 Are users engaged?** (DAU, questions answered, streaks, leaderboard)
4. **📚 Is my content pipeline healthy?** (Tag coverage, masterclass progress)
5. **🤖 Are automations running?** (Telegram bot, deployments, DB health)

---

## 2. Data Sources & API Endpoints

### A. Turso Database (Primary — via Vercel API routes)

All queries go through the existing Vercel serverless API. The admin email `dr.felipeyanez@gmail.com` is required for admin endpoints.

| KPI | API Endpoint | Method | Key Params |
|-----|-------------|--------|-----------|
| **Total Users** | `/api/admin-users` | GET | `adminEmail` |
| **User Detail** | `/api/admin-users` | GET | `adminEmail, userId` |
| **App Settings** | `/api/admin-users` | GET | `adminEmail, action=settings` |
| **PayPal Transactions** | `/api/paypal-export` | GET | `adminEmail` |
| **PayPal CSV Export** | `/api/paypal-export` | GET | `adminEmail, format=csv` |
| **Leaderboard (All)** | `/api/leaderboard` | GET | `period=all` |
| **Leaderboard (Today)** | `/api/leaderboard` | GET | `period=today` |
| **Leaderboard (Week)** | `/api/leaderboard` | GET | `period=week` |
| **User Streak** | `/api/leaderboard` | GET | `userId` |

### B. Database Schema (Turso/LibSQL)

Key tables for KPI extraction:

```sql
-- User counts, premium status, demographics
user_profiles (id, email, first_name, last_name, university, sede, country,
               is_premium, premium_until, plan_months, xp, created_at)

-- Revenue tracking
paypal_transactions (transaction_id, amount, currency, status, plan_id,
                     plan_months, user_id, payer_country, payment_date)

-- Engagement: questions answered
user_progress (user_id, question_id, is_correct, is_omitted, answered_at)

-- Engagement: tests taken
tests (id, user_id, mode, total_questions, score, status, created_at, completed_at)

-- Content consumption
clase_progress (user_id, clase_id, read_clase, video_watched, quiz_completed, quiz_score)
```

### C. External APIs (Not in current app — need integration)

| Source | What It Provides | API |
|--------|-----------------|-----|
| **Telegram Bot API** | Subscriber count per channel | `GET https://api.telegram.org/bot<TOKEN>/getChatMemberCount?chat_id=@channel` |
| **Vercel Analytics** | Web traffic, pageviews, unique visitors | Vercel Analytics API or `@vercel/analytics` dashboard |
| **Mercado Pago** | Transaction ledger (currently not stored in DB) | `GET https://api.mercadopago.com/v1/payments/search` |
| **Cloudflare R2** | Video streaming bandwidth usage | Cloudflare Analytics API |

### D. Pricing Plans (for MRR calculation)

| Plan | PayPal (USD) | Mercado Pago (CLP) | Duration |
|------|-------------|-------------------|----------|
| 1 Month | $20 | $14,990 | 1 month |
| 3 Months | $45 | $34,990 | 3 months |
| 6 Months | $70 | $54,990 | 6 months |
| 1 Year | $90+ | $89,990 | 12 months |

**MRR Normalization:** `monthly_value = amount / plan_months`

---

## 3. Briefing Template

Generate the following markdown report:

```markdown
# 🩺 EUNACOM CEO Briefing — {date}

## 💰 Revenue & Monetization
- **Total PayPal Revenue (All Time):** ${total_revenue} USD
- **Revenue This Month:** ${month_revenue} USD
- **New Payments Today:** {new_payments_count} ({new_payments_value} USD)
- **Estimated MRR:** ${mrr} USD
- **Active Premium Subscribers:** {premium_count}
- **Free-to-Premium Conversion:** {conversion_rate}%

## ⚠️ Churn Alert
- **Expiring in 7 Days:** {expiring_count} subscribers
- **Expired This Week:** {churned_count} subscribers

## 👥 User Base
- **Total Registered Users:** {total_users}
- **New Signups Today:** {new_today}
- **New Signups This Week:** {new_week}
- **Onboarding Completed:** {onboarded}%
- **Top Universities:** {top_3_universities}
- **Countries:** {country_breakdown}

## 📊 Engagement (Today)
- **Daily Active Users:** {dau}
- **Questions Answered Today:** {questions_today}
- **Platform Accuracy:** {accuracy}%
- **Exams Completed Today:** {exams_today}
- **Top Streak:** {top_streak} days ({streak_user})

## 📚 Content Pipeline
- **Question Bank:** {total_questions} questions
- **Tag Coverage:** {tag_coverage}% (Module 3: {module3_coverage}%)
- **Masterclasses Completed:** {masterclasses_done} / {masterclasses_total}
- **Video Classes Available:** {video_count}

## 🤖 Automation Health
- **Telegram Bot:** {bot_status} (Last post: {last_post_date})
- **Telegram Subscribers:** {telegram_total} across 3 channels
- **Last Deploy:** {last_deploy}
- **GitHub Actions:** {actions_status}
```

---

## 4. SQL Queries for Key Metrics

### Total & Premium Users
```sql
SELECT
  COUNT(*) AS total_users,
  SUM(CASE WHEN is_premium = 1 AND (premium_until IS NULL OR premium_until > datetime('now')) THEN 1 ELSE 0 END) AS active_premium,
  SUM(CASE WHEN created_at >= date('now') THEN 1 ELSE 0 END) AS new_today,
  SUM(CASE WHEN created_at >= date('now', '-7 days') THEN 1 ELSE 0 END) AS new_week,
  SUM(CASE WHEN onboarding_done = 1 THEN 1 ELSE 0 END) AS onboarded
FROM user_profiles;
```

### Churn Risk (Expiring in 7 days)
```sql
SELECT COUNT(*) AS expiring_soon
FROM user_profiles
WHERE is_premium = 1
  AND premium_until BETWEEN datetime('now') AND datetime('now', '+7 days');
```

### Revenue This Month (PayPal)
```sql
SELECT
  SUM(CAST(amount AS REAL)) AS month_revenue,
  COUNT(*) AS payment_count
FROM paypal_transactions
WHERE status = 'COMPLETED'
  AND payment_date >= date('now', 'start of month');
```

### MRR Estimate
```sql
SELECT SUM(CAST(amount AS REAL) / COALESCE(plan_months, 1)) AS estimated_mrr
FROM paypal_transactions
WHERE status = 'COMPLETED'
  AND transaction_id IN (
    SELECT transaction_id FROM paypal_transactions
    WHERE user_id IN (
      SELECT id FROM user_profiles WHERE is_premium = 1 AND premium_until > datetime('now')
    )
    ORDER BY payment_date DESC
  );
```

### Daily Active Users & Engagement
```sql
SELECT
  COUNT(DISTINCT user_id) AS dau,
  COUNT(*) AS questions_answered,
  ROUND(100.0 * SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) / COUNT(*), 1) AS accuracy
FROM user_progress
WHERE answered_at >= date('now');
```

### Top Universities
```sql
SELECT university, sede, COUNT(*) AS doctors
FROM user_profiles
WHERE university IS NOT NULL AND university != ''
GROUP BY university, sede
ORDER BY doctors DESC
LIMIT 5;
```

---

## 5. Telegram Subscriber Count Script

```bash
# Get subscriber count for each channel
TOKEN="$TELEGRAM_BOT_TOKEN"
for CHANNEL in "@preguntas_eunacom" "@exameneunacom" "@eunacomteorico2026"; do
  curl -s "https://api.telegram.org/bot${TOKEN}/getChatMemberCount?chat_id=${CHANNEL}" | \
    python3 -c "import sys,json; d=json.load(sys.stdin); print(f'{sys.argv[1]}: {d[\"result\"]} subscribers')" "$CHANNEL"
done
```

---

## 6. Implementation Steps

### Phase 1: Script-Based (Immediate)
1. Create `scripts/morning_briefing.cjs` that calls the admin API endpoints
2. Formats output as markdown
3. Run manually: `node scripts/morning_briefing.cjs`
4. Output to terminal or save to `os/daily-briefs/{date}.md` (Obsidian vault)

### Phase 2: Automated Cron (Next)
1. Add GitHub Actions workflow running at 08:00 AM Chile
2. Saves briefing to Obsidian vault via Git commit
3. Optionally sends summary via Telegram DM or email (Resend)

### Phase 3: Live Dashboard (Future)
1. Build an admin-only `/ceo` route in the app
2. Real-time KPI cards pulling from the same API endpoints
3. Charts for trend lines (revenue, users, engagement over time)
