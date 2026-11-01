# 🤖 EUNACOM Telegram Daily Quiz Bot

Automated Telegram bot that broadcasts interactive daily EUNACOM clinical quiz polls from the 6,099+ question bank to a multi-channel network in Chile.

## 🚀 Quick Start

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Fill in `TELEGRAM_BOT_TOKEN` (from [@BotFather](https://t.me/botfather)) and `TELEGRAM_CHANNEL_IDS` (e.g. `@preguntas_eunacom,@exameneunacom,@eunacomteorico2026`).
3. Add your bot as Administrator in your Telegram channel(s) with permission to post messages.

## 🧪 Commands

```bash
# Preview formatting and validate all 6,000+ questions
npm run preview

# Dry-run test (simulates publication without sending messages or modifying history)
npm run post:dry

# Send a daily question live now
npm run post

# Start continuous daemon scheduler (posts daily at 09:00 AM Chile time)
npm start

# Run immediately and start scheduler
npm run start:now
```

## 📖 Full Guide & SEO Strategy
See [TELEGRAM_SEO_AND_CHANNEL_SETUP.md](../TELEGRAM_SEO_AND_CHANNEL_SETUP.md) for the complete multi-channel growth and Telegram search SEO playbook.
