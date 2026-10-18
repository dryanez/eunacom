# EUNACOM App — Growth Plan & Autonomous Marketing Engine

> Written 2026-10-18. Owner: eunacomapp.cl. This file is also the **brief every marketing agent reads
> before it runs** — keep it current.

---

## 0. TL;DR

1. **Define the target honestly.** "1 million a month" in **CLP** (≈ USD 1,050) is ~35–70 sales a month —
   reachable in 60–90 days. In **USD** it is ~60,000 sales a month, and the whole EUNACOM market is a
   about 5,700 sittings a year (≈ CLP 24M/month of prep spend in total), so it can't come from EUNACOM alone.
   That needs the same engine cloned to other countries' exams such as ENARM in Mexico (§2).
2. **Urgent:** registration for the **16 Dec 2026** EUNACOM closes **30 Oct**. Run the campaign in §2b now.
3. **Fix the plumbing before adding agents.** You already run "autonomous agents", and they report fake
   health. The SEO bot says 92/100 with **0 clicks / 0 impressions** because Search Console isn't
   connected. The drip emails have probably **never been delivered** because the Resend domain isn't
   verified. Signups record **no source**, and the Instagram/content agents **stopped on Sept 1**.
   More agents on top of this produce more fiction.
4. **One funnel, five stages:** free diagnostic exam → score + weak areas → 7-day free trial / daily
   drip → paid plan timed to the exam date → referral + "aprobé" testimonial loop.
5. **Ten agents, daily or weekly, all writing to one scoreboard.** Every agent has one KPI and one owner
   approval point. Nothing is published to customers without passing a guardrail (§6).

---

## 1. Where we are (facts from the repo, 2026-10-18)

| Area | State | Evidence |
|---|---|---|
| Product | Strong: +10,000 questions, +650 videos, reconstructions, simulacros, AI tutor, study plan, leaderboard, iOS/Android shells | `eunacom-app-v2/src/pages/*`, homepage `<title>` |
| Pricing | CLP 14,990 / 34,990 / 54,990 / 89,990 (1m/3m/6m/1y); PayPal USD 16 / 39.99 / 59.99 / 99.99 | `api/user-profiles.js` |
| Users | 744 accounts, **79 paid (~10.6%)**, 657 never paid (as of 2026-10-06) | `HANDOFF_CYBER_WEEK_2026.md` |
| Email | Drip system exists (welcome, discount 30/40/50, streak, weakness sniper, countdown, weekly digest), but **sender domain not verified in Resend → 403s**. SES path added later; confirm it actually sends | `api/email-marketing-cron.js`, handoff §2 |
| SEO | Good on-page tech, sitemap, robots, blog and landing pages. **GSC not connected** (`GSC_SERVICE_ACCOUNT_JSON` secret missing or no access), so daily briefs are empty. `os/projects/seo-growth-pipeline.md` lists GSC positions (#20.5, #10.5…) that **contradict the 0-impression data**; treat them as invented | `os/daily-briefs/*`, `os/cached_seo.json` |
| Telegram | Daily quiz bot runs (GitHub Actions 09:00 CLT); ~2,100 lines of posted history | `.github/workflows/telegram_daily_question.yml` |
| Instagram/TikTok | Competitor scraper and weekly sprint generator **last ran 2026-09-01**. No evidence of actual posting | `os/cached_instagram.json`, `os/weekly-content/` |
| Attribution | **None.** Signups don't store `utm_*` / referrer / first-touch channel | grep for `utm_` in `src/` and `api/` |
| Referral | **None** | — |

**Diagnosis:** the product is ahead of the distribution. Conversion (~10%) is healthy for a freemium
exam-prep app. The bottleneck is **top-of-funnel volume** and **follow-up that actually reaches
people**.

---

## 2. The math

Assume an average ticket of **≈ CLP 35,000** (mix skewed to 3-month plans; check against real
payments) and **10% signup → paid**:

| Target / month | Sales / month | Signups / month | Signups / day |
|---|---|---|---|
| **CLP 1M** | ~29 | ~290 | ~10 |
| CLP 5M | ~145 | ~1,450 | ~48 |
| CLP 10M | ~290 | ~2,900 | ~95 |
| USD 1M (≈ CLP 950M) | ~27,000 | ~270,000 | — impossible in EUNACOM alone |

### How big is the market? (eunacom.cl, CIPER, 2026-10)

- **About 5,700 exam sittings a year**: Dec 2025 had 4,056; Jul 2026 had 1,686.
  - About 2,570 of those are by **foreign-trained doctors**.
  - About 770 are by non-recent Chilean graduates.
  - The rest are the Chilean graduating class, almost all sitting in December.
- **Foreign doctors fail 66%** of the time (2024: average score 47, pass mark 51). Chilean graduates fail 1.6%.
- Foreign doctors and repeat takers pay **CLP 310,000 per attempt**. This is the segment with pain, budget
  and repeat purchases.
- If every sitting spent about CLP 50k on prep, the whole market would be roughly **CLP 285M a year (about 24M a month)**.
  - **CLP 1M/month is about a 4% share.** Mi Eunacom claims 3,000+ sales in its first year, so this is realistic.
  - CLP 5M/month is about a 20% share, which is category leadership.
  - Going beyond that requires other exams.

### Ladder

- **Phase 1 (by Jan 2027): CLP 1M/month.**
  - Fix the plumbing.
  - Run the 16 Dec 2026 campaign (§2b).
  - Turn on the engine.
- **Phase 2 (2027): CLP 3–5M/month.**
  - Own the foreign-doctor segment for the July sitting.
  - Rank #1 on Google for the core terms.
  - Sign B2B convenios.
- **Phase 3: USD scale means more exams.**
  - Clone the platform for ENARM in Mexico (about 50k candidates a year), Peru's ENAM, and Ecuador's CACES.
  - Add FaMED for Germany (already in `os/`).
  - Skip MIR Spain, which AMIR and CTO dominate.
  - The agents are designed to run per exam from a config.

### 2b. Right now: the 16 Dec 2026 sitting

- **Registration closes 30 Oct 2026 at 16:00.** The exam is about 8 weeks away. This is the highest-intent window of the year.
- Today–30 Oct: a "¿Ya te inscribiste?" registration-help content push on SEO, Telegram, email and IG.
  - Every piece ends with a CTA to the free diagnostic.
- **New "Hasta el 16 de diciembre" one-time plan, around CLP 49,990.**
  - It counters Dr. EUNACOM's 59,990 one-time offer.
  - It is simpler than picking 1, 3 or 6 months.
- Weekly free live simulacro on Sundays, with results by email. This builds the list.
- From 17 Dec, sell to people who fail: "Julio 2027 plan + guarantee". Also expect the July 2027
  registration window to open around 1 Nov (not confirmed).

---

## 3. The funnel

```
 ATTENTION            CAPTURE               ACTIVATE               CONVERT                 EXPAND
 SEO pages      ─┐                                                                        
 Telegram quiz   │   Free diagnostic   →   Score + weak areas  →  Drip (D0–D14) timed  →  Renewal before exam
 IG/TikTok reels ├─► "Ensayo EUNACOM   →   + study plan to     →  to exam date; trial  →  "Aprobé" testimonial
 YouTube         │   gratis 30 preg."      exam date               end; promo windows      → referral (1 month free
 FB/WA groups    │   (email + exam date                                                    for both) → convenio leads
 Convenios       │    + WhatsApp opt-in)                                                   
 Paid ads       ─┘                                                                        
```

### Stage rules
1. **Attention.** Every piece of content ends with **one** CTA: the free diagnostic, using a UTM link
   (`?utm_source=telegram&utm_campaign=quiz-2026-10-18`).
2. **Capture.** A free 30-question diagnostic simulacro (no card) that asks for email, **exam date** and
   WhatsApp opt-in. The exam date drives every later message.
3. **Activate.** The aha moment is "your projected score is 58%; you're weak in Pediatría and Salud
   Pública" plus a plan to the exam date. Target: ≥ 60% of signups finish the diagnostic within 24h.
4. **Convert.** Urgency comes from the **real exam calendar**, not invented countdowns. Offer ladder: trial
   ends → 30% → 40% (already coded) → the plan that covers "until your exam". Add a **pass guarantee**
   (free extension if you fail).
5. **Expand.** Ask everyone who passes for a testimonial (video or text + result screenshot) in exchange
   for a free month for a friend. Testimonials feed the content agents.

---

## 4. Channels, ranked by expected ROI for this market

| # | Channel | Why | Owner agent |
|---|---|---|---|
| 1 | **SEO + AI answer engines** (Google, ChatGPT, Perplexity) | High-intent searches (fechas, requisitos, reconstrucciones, ensayo); compounding; free | `seo-agent`, `content-agent` |
| 2 | **Email + WhatsApp lifecycle** | 657 unpaid signups already exist; cheapest revenue | `lifecycle-agent` |
| 3 | **Telegram network** | Already running; strong with foreign doctors; searchable inside Telegram | `telegram-agent` |
| 4 | **Communities** (FB groups and WhatsApp groups of Venezuelan, Colombian, Cuban, Ecuadorian doctors in Chile) | That's where foreign candidates decide | `community-agent` (drafts; human posts) |
| 5 | **Short video** (IG Reels, TikTok, YouTube Shorts) | Clinical-case quizzes and "trampas" travel well | `social-agent` |
| 6 | **Convenios / B2B** | Associations, universities, clinics that hire foreign doctors: one deal = many seats | `partnerships-agent` |
| 7 | **Paid** (Meta + Google Search) | Only after attribution works; start CLP 5–10k/day on "eunacom" search terms | `ads-agent` (proposes; human approves spend) |

---

## 5. Competitive landscape

Research pass from 2026-10-18. Prices are taken from vendor pages and some may be stale. The
competitor-agent re-checks them weekly.

| Competitor | What | Price | Threat |
|---|---|---|---|
| **Mi Eunacom** (mieunacom.cl) | Bank, reconstructions, weekly live class, flashcards, app. IG about 37K. Claims 3,000+ sales in year 1 | Annual CLP 149k (Cyber price 74.5k) | **Closest rival.** Strong social presence |
| **Dr. EUNACOM** (dreunacom.cl) | 13k questions, AI tutor, "Modo Revalidación" for foreign doctors | CLP 29,990/month; **59,990 one-time until 16 Dec**; 3-day trial | Same feature set as ours, plus a simple one-time offer |
| **EunacomIA** (eunacomia.cl) | AI-generated questions, 2.2k bank, aimed at foreign doctors | Free tier; Pro **CLP 14,990** | Same price as ours with a weaker product |
| **EunaPass** (eunapass.com) | Duolingo-style app for Chilean students | CLP 9,980/month, 89,990/year | Owns the Chilean-student segment |
| **ApruebaEunacom** | Free exams, daily simulacro, WhatsApp community, strong SEO blog | Premium price not shown | **SEO rival** for "fechas" and "ensayo" |
| **EUNAMed** | Live classes for foreign doctors. FB about 86K | CLP 1.17–1.95M ("hasta aprobar") | Premium tier; has an audience but an old site |
| **Dr. Guevara**, Entiendo EUNACOM, CEFO, Pulsando, EUNACOM+ | Live or video courses and question apps | CLP 100k–950k | Minor |

**Our positioning:** "The most complete platform for the price." Our 650+ videos and real reconstructions match a live-class course,
at an app's price. Two moves:
- Build a dedicated **"Médico extranjero" track and landing page** for the segment that fails 66% and pays CLP 310k per attempt.
- Add a **pass guarantee**. EUNAMed charges CLP 1.9M for theirs.

**Where foreign doctors gather:** EUNAMed's FB page, MedExtranjeros' FB and WhatsApp groups,
Asociación de Médicos Extranjeros de Chile, @medicosenchile on IG and Threads, and Venezuelan-diaspora sites
(venezolanoenchile.com). We have no verified member counts; the community-agent's first task is to map them.

**Keywords competitors fight over:** fechas eunacom 2026/2027, inscripción eunacom, costo eunacom, eunacom médicos
extranjeros, preguntas tipo eunacom, ensayo/simulacro eunacom, reconstrucción eunacom julio 2026, curso eunacom
gratis, cómo aprobar el eunacom. We have no volume data yet; it will come from GSC once connected.

Sources: eunacom.cl; ciperchile.cl (2025-08-05); infomigra.org; emol.com (2025-06-02); the competitor sites listed above.

---

## 6. The autonomous engine (agents)

### Architecture
- **Runner:** GitHub Actions cron (already used) calling Claude via the Anthropic API, or Claude Code
  Routines (cloud scheduled sessions) for agents that need to edit the repo and open PRs.
- **Memory:** `os/` (Obsidian vault) holds briefs, the wiki and the content queue.
- **⚠️ `dryanez/eunacom` is a PUBLIC repo.** Anything committed, and every Action log, is world-readable.
  Business numbers (revenue, sales, user counts) **never go into commits or logs**. They go only to the owner's
  Telegram DM. The scoreboard follows this rule (`scripts/growth/scoreboard.mjs`).
- **Guardrails (non-negotiable):**
  - Agents **never invent metrics**. If a data source is missing, the report says `NO DATA — <reason>`
    and opens an issue labeled `needs-human`.
  - Customer-facing sends (email > 50 recipients, ads spend, posting in third-party groups) need
    **human approval** via a PR, an issue checkbox, or a Telegram admin message.
  - Medical content passes a fact-check step against the question bank and the official EUNACOM
    content profile (`Perfils/`) before publishing.
  - Respect platform rules: no fake accounts, no automated posting into groups, no scraping behind
    logins.

### Agent roster

| Agent | Cadence (CLT) | Input | Output | KPI | Human gate |
|---|---|---|---|---|---|
| **1. scoreboard-agent** ✅ built | Daily 07:30 | Turso (signups, `signup_source`, PayPal) + Mercado Pago API | Telegram DM to owner: yesterday, 7d, MTD vs target, exam countdown, NO DATA problems | Accuracy | none |
| **2. seo-agent** (fix the existing one) | Daily 08:00 | GSC queries/pages, sitemap | Striking-distance list (pos 4–20); title/meta rewrites as a **PR** | Organic clicks | merge PR |
| **3. content-agent** | Mon/Wed/Fri | seo-agent gaps, question bank, Perfils | 1 long-form guide/week + 2 updates of existing pages (FAQ schema, internal links) as a PR | Indexed pages, clicks | merge PR |
| **4. lifecycle-agent** | Daily 20:00 | User state (exam date, diagnostic score, weak area, trial status) | Triggered emails (already templated) + WhatsApp template messages | Paid conversions from email | approve new templates once |
| **5. telegram-agent** (extend existing) | Daily 09:00 + 20:00 | Question bank | Morning quiz; evening answer + explanation + CTA; weekly mini-ensayo | Channel growth, clicks | none |
| **6. social-agent** | Daily | Question bank, testimonials, competitor outliers | 1 reel script + carousel (rendered images) in `os/weekly-content/`; publishes via Meta Graph API when connected | Reach, profile clicks | approve weekly batch |
| **7. competitor-agent** | Weekly Mon | Competitor sites, prices, IG public profiles | `os/daily-briefs/competitors-YYYY-WW.md`: price changes, new offers, top posts | — | none |
| **8. community-agent** | Weekly | Public groups/forums list | Drafts of genuinely useful answers (exam dates, requisitos) for a human to post | Referral traffic | **human posts** |
| **9. partnerships-agent** | Weekly | List of associations, universities, clinics | Personalized outreach emails (convenio offer) as drafts; follow-up tracking | Convenio meetings | approve each send |
| **10. ads-agent** | Weekly (once attribution exists) | Ads + attribution data | Budget/keyword/creative proposals; CAC vs LTV | CAC < 1/3 LTV | approve spend |

Each agent's prompt starts with: "Read `docs/growth/GROWTH_PLAN.md` and `os/scoreboard.md`. Never fabricate
data."

---

## 7. Week-0 checklist (do before anything else)

### Built on branch `claude/amazing-ritchie-hc5dz4` (2026-10-18)
- [x] `/ensayo-gratis`: free 30-question diagnostic, no login. Shows score by area vs the 51% pass mark, then CTA to register.
- [x] First-touch attribution: `utm_*`, `ref`, referrer and landing page are captured on first visit and saved as
      `user_profiles.signup_*` when the profile is created.
- [x] "Hasta el 16 de diciembre" one-time plan: CLP 49,990 / USD 54. Webpay/MP and PayPal; no coupons; sale ends on exam day.
- [x] Mercado Pago webhook is idempotent. Before this, the `payment` and `merchant_order` notifications for the same
      payment could each add months.
- [x] SEO cron reports **NO DATA** instead of cached or default numbers when Search Console isn't connected.
- [x] Daily scoreboard (`.github/workflows/growth_scoreboard.yml`). Needs repo secrets `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`,
      `MP_ACCESS_TOKEN`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_OWNER_CHAT_ID`.

### Owner to do
- [ ] **Security: rotate the Mercado Pago access token.** A live token is hard-coded as a fallback in `api/user-profiles.js`,
      `api/_admin-finances.js` and `eunacom-mobile/api/user-profiles.js`, inside a public repo. Set the new token as
      `MP_ACCESS_TOKEN` in Vercel, then delete the fallbacks.
- [ ] Decide whether the repo should be private. The growth plan, handoff docs and user counts are public now.

- [ ] **Email deliverability:** verify `eunacomapp.cl` in Resend (or confirm SES is live), set SPF/DKIM/DMARC, send a
      test to Gmail and Outlook, check spam placement.
- [ ] **GSC:** add the service account email as a user on `sc-domain:eunacomapp.cl`; set the
      `GSC_SERVICE_ACCOUNT_JSON` repo secret. Make the SEO cron **fail loudly** when GSC returns nothing.
- [ ] **Delete or mark the fabricated numbers** in `os/projects/seo-growth-pipeline.md`.
- [ ] Show `signup_source` in the AdminUsers page.
- [ ] Carry the diagnostic result (`localStorage.eunacom_diagnostic_result`) into onboarding and the first email.
- [ ] **Referral:** a `ref` code per user; 1 free month to both when the friend pays.
- [ ] **Exam calendar:** one source of truth (`src/config/examDates.json`) used by emails, landing banners and
      agents.
- [ ] **Social accounts and API access:** Meta Graph API (IG business), TikTok, YouTube; tokens as repo secrets.

---

## 8. 90-day roadmap

| Weeks | Focus | Exit criteria |
|---|---|---|
| 1–2 | Week-0 checklist; scoreboard-agent live; **16 Dec campaign** (registration deadline 30 Oct, one-time plan) | Real numbers every morning; emails landing in inbox |
| 3–4 | Re-activate the 657 unpaid signups (lifecycle sequence); diagnostic page live; telegram evening post | ≥ 20 paid from the existing base |
| 5–8 | seo-agent + content-agent shipping PRs weekly; social-agent batches; referral live | 10 signups/day; organic clicks growing week over week |
| 9–12 | Final 3-week push before 16 Dec; "Julio 2027 + guarantee" offer for those who fail; convenios; paid search test (CLP 150k) | **CLP 1M/month run-rate**; known CAC per channel |

---

## 9. KPIs on the scoreboard

North star: **paid revenue per month (CLP)**.
Inputs: signups/day by source · diagnostic completion % · trial→paid % · email inbox rate and click rate ·
organic clicks · Telegram members · CAC by channel · refund/churn · % of payers who pass (collected after
each exam).
