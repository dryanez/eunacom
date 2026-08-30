#!/usr/bin/env node

/**
 * EUNACOM Automated Email Marketing Daemon & Scheduler
 * 
 * Runs continuously and executes marketing automations at scheduled Chile time:
 * - 20:00 CLT: Daily "Joya EUNACOM del Día" AI generation and broadcast
 * - 20:00 CLT: Lifecycle retention discount ladder (30%, 40%, 50%)
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TARGET_HOUR = parseInt(process.env.SCHEDULE_HOUR || '20', 10); // 20:00 PM CLT
const TARGET_MINUTE = parseInt(process.env.SCHEDULE_MINUTE || '0', 10);
const TIMEZONE = process.env.TZ || 'America/Santiago';

let lastRunDateStr = '';

function getChileTime() {
  const now = new Date();
  const options = { timeZone: TIMEZONE, hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
  const formatter = new Intl.DateTimeFormat('en-CA', options);
  const parts = formatter.formatToParts(now);
  const getPart = (type) => parts.find(p => p.type === type)?.value || '';

  const dateStr = `${getPart('year')}-${getPart('month')}-${getPart('day')}`;
  const hour = parseInt(getPart('hour'), 10);
  const minute = parseInt(getPart('minute'), 10);
  const second = parseInt(getPart('second'), 10);

  return { dateStr, hour, minute, second };
}

async function runDailyAutomations() {
  console.log(`\n🚀 [${new Date().toISOString()}] Starting Daily Marketing Automations...`);

  // 1. Run AI Pearl Agent
  console.log(`\n💎 Step 1: Synthesizing and broadcasting 'Joya EUNACOM del Día'...`);
  await new Promise((resolve) => {
    const pearlProcess = spawn('node', [path.resolve(__dirname, 'email_pearl_agent.js'), '--send'], {
      stdio: 'inherit',
      env: process.env
    });
    pearlProcess.on('close', (code) => {
      console.log(`💎 Pearl Agent finished with exit code: ${code}`);
      resolve();
    });
  });

  // 2. Run Lifecycle Drip Funnel
  console.log(`\n⏳ Step 2: Running Lifecycle Retention Funnel (30% -> 40% -> 50%)...`);
  try {
    const { default: cronHandler } = await import('../eunacom-app-v2/api/email-marketing-cron.js');
    const req = {
      headers: { authorization: `Bearer ${process.env.CRON_SECRET || 'eunacom-cron-secret'}` },
      query: { adminEmail: 'dr.felipeyanez@gmail.com' },
      body: {}
    };
    const res = {
      status(code) { this.statusCode = code; return this; },
      json(data) {
        console.log(`⏳ Retention Funnel Result:`, JSON.stringify(data, null, 2));
        return this;
      }
    };
    await cronHandler(req, res);
  } catch (err) {
    console.error(`❌ Retention Funnel Error:`, err.message);
  }

  console.log(`\n✅ Daily Marketing Automations Completed.\n`);
}

async function tick() {
  const { dateStr, hour, minute } = getChileTime();

  if (hour === TARGET_HOUR && minute === TARGET_MINUTE && lastRunDateStr !== dateStr) {
    console.log(`\n⏰ [Scheduler] Time matched (${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${TIMEZONE}). Triggering automations...`);
    lastRunDateStr = dateStr;
    await runDailyAutomations();
  }
}

console.log(`=======================================================`);
console.log(`📬 EUNACOM Email Marketing Daemon Started`);
console.log(`🕒 Scheduled Dispatch: ${TARGET_HOUR.toString().padStart(2, '0')}:${TARGET_MINUTE.toString().padStart(2, '0')} (${TIMEZONE})`);
console.log(`📅 Current Local Date/Time: ${new Date().toLocaleString('es-CL', { timeZone: TIMEZONE })}`);
console.log(`=======================================================\n`);

if (process.argv.includes('--now')) {
  console.log(`🚀 '--now' flag detected. Running immediate execution...`);
  const { dateStr } = getChileTime();
  lastRunDateStr = dateStr;
  runDailyAutomations().catch(console.error);
}

// Tick every 30 seconds
setInterval(tick, 30000);
