---
name: telegram-quiz-publisher
description: >-
  Automates the full lifecycle of publishing daily EUNACOM clinical quizzes to Telegram channels:
  question selection from 6,099+ question bank, Telegram-safe formatting, preview/dry-run validation,
  multi-channel broadcasting (3 channels), GitHub Actions cron automation, and history tracking.
---

# Telegram Quiz Publisher Skill (EUNACOM Daily Clinical Cases)

Use this skill whenever publishing EUNACOM clinical quizzes to Telegram channels, configuring the Telegram bot, previewing formatted quizzes, debugging failed broadcasts, scheduling automated daily posts, or managing quiz broadcast history.

---

## 1. System Overview

The Telegram Quiz Publisher broadcasts a **3-message sequence** per channel:

1. **Clinical Vignette** — Full case presentation with specialty tag and EUNACOM code
2. **Native Quiz Poll** — Interactive Telegram poll (`type: quiz`) with 5 options, correct answer indicator, and 200-char popup explanation
3. **Official Resolution & CTA** — Full explanation with correct answer rationale and link to `www.eunacomapp.cl`

Each of the 3 target channels (`@preguntas_eunacom`, `@exameneunacom`, `@eunacomteorico2026`) receives a **unique, different question** on the same day.

---

## 2. Architecture & File Map

```
NEWeunacom/
├── telegram-bot/
│   ├── publish_daily_quiz.js      # Core publisher engine (selection + API calls)
│   ├── scheduler.js               # Background daemon (Chile timezone cron)
│   ├── format_utils.js            # Telegram formatting, sanitization, poll extraction
│   ├── test_quiz_preview.js       # Offline validation (all 6,099 questions)
│   ├── posted_history.json        # Persistent history (per-channel dedup)
│   ├── package.json               # Zero dependencies — Node 18+ built-ins only
│   └── .env / .env.example        # Bot token, channel IDs, schedule config
├── eunacom-app-v2/
│   ├── public/data/questionDB.json   # Source: 6,099+ questions (flat array)
│   └── api/telegram-cron.js          # Vercel serverless endpoint alternative
└── .github/workflows/
    └── telegram_daily_question.yml   # GitHub Actions daily cron (09:00 AM Chile)
```

---

## 3. Question Selection Algorithm

The selection engine guarantees **no repeats** per channel and **unique questions** across simultaneous multi-channel broadcasts:

1. If `--force-id <id>` is provided → use that exact question
2. Otherwise, filter the 6,099-question pool:
   - Exclude questions already posted to *this specific channel* (`channelHistory[channelId]`)
   - Exclude questions already used in *this run* (`usedInCurrentRun` Set — ensures 3 channels get 3 different questions)
   - Require valid structure: question text + ≥2 choices
   - Apply `--topic` filter if provided (case-insensitive match)
3. Pick random question from filtered pool: `Math.floor(Math.random() * pool.length)`
4. If pool is exhausted → reset that channel's history (the bot has posted all 6,099 questions and starts fresh)

---

## 4. Telegram API Constraints & Sanitization

The `format_utils.js` module enforces all Telegram API limits:

| Element | Telegram Limit | Enforcement |
|---------|---------------|-------------|
| Poll question | 300 chars max | `extractPollQuestion()`: regex for Spanish question patterns (`¿...?`), 10 clinical trigger phrases, sentence extraction, or truncation at 282 + `...` |
| Poll options | 2–10 options, 100 chars each | Strips redundant `A)` prefixes, re-prepends standardized letters, truncates at 97 + `...` |
| Poll explanation popup | 200 chars max | Strips markdown, truncates at 195 + `...` |
| Message body | 4096 chars max | Explanation body capped at 2500 chars with referral notice |
| Markdown parsing | Unclosed `*` or `_` crashes API (HTTP 400) | `sanitizeMarkdown()` counts and strips unmatched formatting characters |

---

## 5. Environment Variables

Create or edit `telegram-bot/.env`:

```env
TELEGRAM_BOT_TOKEN=<token from @BotFather>
TELEGRAM_CHANNEL_IDS=@preguntas_eunacom,@exameneunacom,@eunacomteorico2026
SITE_URL=https://www.eunacomapp.cl
SCHEDULE_HOUR=9
SCHEDULE_MINUTE=0
TZ=America/Santiago
```

For Vercel cron endpoint, also set `CRON_SECRET` in Vercel environment variables.

---

## 6. Operational Commands

### Preview & Validate (No messages sent)
```bash
# Dry run — shows formatted output without posting
node telegram-bot/publish_daily_quiz.js --dry-run

# Validate all 6,099 questions against Telegram constraints
node telegram-bot/test_quiz_preview.js
```

### Publish Immediately
```bash
# Post to all 3 channels (unique question per channel)
node telegram-bot/publish_daily_quiz.js

# Post a specific topic
node telegram-bot/publish_daily_quiz.js --topic "Cardiología"

# Post a specific question by ID
node telegram-bot/publish_daily_quiz.js --force-id "eb303d0f-a216-45c7-be70-c98d6c8b7767"

# Override target channels
node telegram-bot/publish_daily_quiz.js --channels "@my_test_channel"
```

### Run as Daemon (Long-lived server / VPS)
```bash
# Start scheduler daemon (publishes at 09:00 AM Chile daily)
node telegram-bot/scheduler.js

# Start with immediate first run
node telegram-bot/scheduler.js --now
```

### npm Scripts (from telegram-bot/)
```bash
npm start           # scheduler daemon
npm run start:now   # scheduler + immediate run
npm run post         # publish now
npm run post:dry     # dry run
npm run preview      # validate all questions
```

---

## 7. Automation Methods (3 Options)

### Option A: GitHub Actions (Recommended — Free, Serverless)
Already configured in `.github/workflows/telegram_daily_question.yml`:
- Cron: `0 12 * * *` (12:00 UTC = 09:00 AM Chile)
- Secrets needed: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHANNEL_IDS`, `SITE_URL`
- Auto-commits `posted_history.json` after each run

### Option B: Local / VPS Daemon
```bash
cd telegram-bot && npm start
```
Runs `scheduler.js` — checks every 30 seconds, executes once per calendar day.

### Option C: Vercel Cron / Webhook
```
GET https://www.eunacomapp.cl/api/telegram-cron?secret=<CRON_SECRET>
```
Or configure as Vercel Cron or external webhook from cron-job.org.

---

## 8. History & Deduplication

`posted_history.json` maintains:
- `postedIds[]` — Global list of all question IDs ever posted
- `channelHistory{}` — Per-channel list of posted IDs (independent rotation per channel)
- `history[]` — Timestamped audit log with message IDs, topics, success status

When all 6,099 questions have been posted to a channel, that channel's history auto-resets.

---

## 9. Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| `can't parse entities` (HTTP 400) | Unclosed `*` or `_` in Telegram Markdown | Already handled by `sanitizeMarkdown()` — if still occurs, check for new edge cases in question text |
| `429 Too Many Requests` | Telegram rate limit | Built-in retry with `retry_after` header extraction (default 5s backoff) |
| Same question posted to multiple channels | `usedInCurrentRun` Set not persisting | Ensure single run publishes to all channels sequentially |
| History not saving in GitHub Actions | Git push failing | Check workflow has `contents: write` permission and correct Git identity config |
| No questions available for topic | Topic name mismatch | Use exact topic name from `questionDB.json` (e.g., `"Cardiología"` not `"Cardio"`) |
