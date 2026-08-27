#!/usr/bin/env node

/**
 * EUNACOM Telegram Bot - Daily Scheduler Daemon
 * 
 * Runs continuously and triggers the daily quiz broadcast at the scheduled time
 * (default: 09:00 AM America/Santiago timezone).
 */

import { publishDailyQuestion } from './publish_daily_quiz.js';

const TARGET_HOUR = parseInt(process.env.SCHEDULE_HOUR || '9', 10);
const TARGET_MINUTE = parseInt(process.env.SCHEDULE_MINUTE || '0', 10);
const TIMEZONE = process.env.TZ || 'America/Santiago';

let lastRunDateStr = '';

function getChileTime() {
  const now = new Date();
  const options = { timeZone: TIMEZONE, hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
  const formatter = new Intl.DateTimeFormat('en-CA', options);
  // Returns "YYYY-MM-DD, HH:mm:ss"
  const parts = formatter.formatToParts(now);
  const getPart = (type) => parts.find(p => p.type === type)?.value || '';

  const dateStr = `${getPart('year')}-${getPart('month')}-${getPart('day')}`;
  const hour = parseInt(getPart('hour'), 10);
  const minute = parseInt(getPart('minute'), 10);
  const second = parseInt(getPart('second'), 10);

  return { dateStr, hour, minute, second };
}

async function checkAndRun() {
  const { dateStr, hour, minute } = getChileTime();

  // If target time is reached and hasn't run yet today
  if (hour === TARGET_HOUR && minute === TARGET_MINUTE && lastRunDateStr !== dateStr) {
    console.log(`\n⏰ [Scheduler] Time matched (${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${TIMEZONE}). Triggering daily broadcast...`);
    lastRunDateStr = dateStr;
    try {
      await publishDailyQuestion();
    } catch (err) {
      console.error(`❌ [Scheduler] Error during broadcast:`, err.message);
    }
  }
}

console.log(`=======================================================`);
console.log(`🤖 EUNACOM Telegram Bot Scheduler Started`);
console.log(`🕒 Scheduled Time: ${TARGET_HOUR.toString().padStart(2, '0')}:${TARGET_MINUTE.toString().padStart(2, '0')} (${TIMEZONE})`);
console.log(`📅 Current Local Date/Time: ${new Date().toLocaleString('es-CL', { timeZone: TIMEZONE })}`);
console.log(`=======================================================\n`);

// If started with --now, run immediately
if (process.argv.includes('--now')) {
  console.log(`🚀 '--now' flag detected. Running immediate broadcast...`);
  const { dateStr } = getChileTime();
  lastRunDateStr = dateStr;
  publishDailyQuestion().catch(err => console.error(`❌ Error during initial run:`, err.message));
}

// Check every 30 seconds
const interval = setInterval(checkAndRun, 30 * 1000);

// Graceful exit
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping scheduler gracefully...');
  clearInterval(interval);
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Terminating scheduler...');
  clearInterval(interval);
  process.exit(0);
});
