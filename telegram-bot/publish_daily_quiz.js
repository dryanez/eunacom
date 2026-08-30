#!/usr/bin/env node

/**
 * EUNACOM Automated Telegram Quiz Publisher
 * 
 * Selects UNIQUE, RANDOM clinical questions from the question bank for each
 * configured channel (so different channels get different questions every day),
 * broadcasts them as interactive Telegram Quiz Polls, followed by
 * the official explanation and CTA linking to https://www.eunacomapp.cl
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  cleanText,
  formatVignetteMessage,
  prepareQuizPayload,
  formatExplanationMessage,
  getCorrectOptionIndex
} from './format_utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env if present
const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

// Configuration
const CONFIG = {
  botToken: process.env.TELEGRAM_BOT_TOKEN || '',
  // Comma-separated list of channel usernames or numeric IDs
  channelIds: (process.env.TELEGRAM_CHANNEL_IDS || process.env.TELEGRAM_CHAT_ID || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean),
  siteUrl: process.env.SITE_URL || 'https://www.eunacomapp.cl',
  questionDbPath: path.resolve(__dirname, '../eunacom-app-v2/public/data/questionDB.json'),
  historyFilePath: path.resolve(__dirname, 'posted_history.json'),
};

/**
 * Telegram API wrapper with rate-limit retries
 */
async function callTelegramApi(endpoint, body, botToken) {
  const url = `https://api.telegram.org/bot${botToken}/${endpoint}`;
  
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        if (data.error_code === 429) {
          const retryAfter = data.parameters?.retry_after || 5;
          console.warn(`[Telegram API] 429 Too Many Requests. Retrying in ${retryAfter}s...`);
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          continue;
        }
        throw new Error(`Telegram API [${endpoint}] error: ${data.description || res.statusText} (Code: ${data.error_code})`);
      }
      return data.result;
    } catch (err) {
      if (attempt === 3) throw err;
      console.warn(`[Telegram API] Attempt ${attempt} failed: ${err.message}. Retrying in 2s...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

/**
 * Load questions database
 */
function loadQuestionDb() {
  if (!fs.existsSync(CONFIG.questionDbPath)) {
    throw new Error(`Question database not found at ${CONFIG.questionDbPath}`);
  }
  const raw = fs.readFileSync(CONFIG.questionDbPath, 'utf8');
  return JSON.parse(raw);
}

/**
 * Load posted question history (tracks history per channel and globally)
 */
function loadHistory() {
  if (!fs.existsSync(CONFIG.historyFilePath)) {
    return { postedIds: [], channelHistory: {}, history: [] };
  }
  try {
    const raw = fs.readFileSync(CONFIG.historyFilePath, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      postedIds: Array.isArray(parsed.postedIds) ? parsed.postedIds : [],
      channelHistory: parsed.channelHistory || {},
      history: Array.isArray(parsed.history) ? parsed.history : [],
    };
  } catch {
    return { postedIds: [], channelHistory: {}, history: [] };
  }
}

/**
 * Save updated history
 */
function saveHistory(historyData) {
  fs.writeFileSync(CONFIG.historyFilePath, JSON.stringify(historyData, null, 2), 'utf8');
}

/**
 * Pick a unique random question for a specific channel
 * that has not been posted to this channel before AND was not already selected
 * for another channel in the current broadcast run.
 */
function selectQuestionForChannel({ channelId, forceId, topic, questions, history, usedInCurrentRun = new Set() }) {
  if (forceId) {
    const found = questions.find(q => q.id === forceId);
    if (!found) throw new Error(`Question with id "${forceId}" not found in database.`);
    return found;
  }

  const channelPostedSet = new Set(history.channelHistory?.[channelId] || []);
  
  // Filter valid questions
  let pool = questions.filter(q => {
    if (usedInCurrentRun.has(q.id)) return false; // Must be different from other channels today
    if (channelPostedSet.has(q.id)) return false; // Must not have been posted to this channel
    if (!q.question || !q.choices || q.choices.length < 2 || !q.correctAnswer) return false;
    if (topic && q.topic?.toLowerCase() !== topic.toLowerCase()) return false;
    return true;
  });

  // Fallback 1: If channel pool exhausted, ignore previous channel history but maintain uniqueness in this run
  if (pool.length === 0) {
    console.log(`[Question Selection] Channel ${channelId} exhausted its previous history pool. Resetting channel history.`);
    pool = questions.filter(q => {
      if (usedInCurrentRun.has(q.id)) return false;
      if (!q.question || !q.choices || q.choices.length < 2 || !q.correctAnswer) return false;
      if (topic && q.topic?.toLowerCase() !== topic.toLowerCase()) return false;
      return true;
    });
  }

  // Fallback 2: Any valid question
  if (pool.length === 0) {
    pool = questions.filter(q => q.question && q.choices && q.choices.length >= 2 && q.correctAnswer);
  }

  // Pick random question from pool
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}

/**
 * Publish the question(s) to Telegram channels
 */
export async function publishDailyQuestion(options = {}) {
  const isDryRun = options.dryRun || process.argv.includes('--dry-run');
  const forceId = options.forceId || getArgValue('--force-id');
  const topic = options.topic || getArgValue('--topic');
  const customChannels = options.channels || (getArgValue('--channels') ? getArgValue('--channels').split(',') : null);
  
  const botToken = options.botToken || CONFIG.botToken;
  const channelIds = (customChannels || CONFIG.channelIds).length > 0 ? (customChannels || CONFIG.channelIds) : ['@preguntas_eunacom', '@exameneunacom', '@eunacomteorico2026'];

  console.log(`\n======================================================`);
  console.log(`🚀 EUNACOM Daily Multi-Channel Telegram Quiz Publisher`);
  console.log(`⏰ Time: ${new Date().toISOString()}`);
  console.log(`📢 Target Channels (${channelIds.length}): ${channelIds.join(', ')}`);
  console.log(`🎲 Mode: Unique & Different Random Question for Each Channel`);
  console.log(`======================================================\n`);

  const questions = loadQuestionDb();
  const history = loadHistory();

  console.log(`📚 Total questions in database: ${questions.length}`);
  console.log(`📝 Total globally logged posts: ${history.postedIds.length}`);

  const usedInCurrentRun = new Set();
  const broadcastResults = [];

  for (let i = 0; i < channelIds.length; i++) {
    const rawChannelId = channelIds[i];
    const channelId = rawChannelId.trim();
    
    // Select unique question for this channel
    const question = selectQuestionForChannel({
      channelId,
      forceId,
      topic,
      questions,
      history,
      usedInCurrentRun,
    });

    usedInCurrentRun.add(question.id);

    console.log(`\n──────────────────────────────────────────────────────`);
    console.log(`📢 Channel [${i + 1}/${channelIds.length}]: ${channelId}`);
    console.log(`🎯 Assigned Question ID: ${question.id}`);
    console.log(`🏷 Specialty: ${question.topic || 'General'}`);
    console.log(`📌 Code: ${question.codigo_eunacom || 'N/A'}`);
    console.log(`✅ Correct Answer: ${question.correctAnswer}`);

    const vignetteMsg = formatVignetteMessage(question, { channelName: channelId, siteUrl: CONFIG.siteUrl });
    const quizPayload = prepareQuizPayload(question);
    const explanationMsg = formatExplanationMessage(question, { siteUrl: CONFIG.siteUrl });

    if (isDryRun) {
      console.log(`\n[DRY-RUN PREVIEW FOR ${channelId}]`);
      console.log(`--- VIGNETTE ---`);
      console.log(vignetteMsg.slice(0, 200) + '...');
      console.log(`--- POLL QUESTION ---: ${quizPayload.question}`);
      console.log(`--- OPTIONS ---:`);
      quizPayload.options.forEach(o => console.log(`   ${o}`));
      console.log(`--- CORRECT OPTION ID ---: ${quizPayload.correct_option_id} (${question.correctAnswer})`);
      
      broadcastResults.push({
        channelId,
        questionId: question.id,
        topic: question.topic,
        dryRun: true,
        success: true,
      });
      continue;
    }

    if (!botToken) {
      throw new Error('TELEGRAM_BOT_TOKEN is missing. Set it in telegram-bot/.env or as an environment variable.');
    }

    try {
      // 1. Send Clinical Case Vignette
      const vignetteRes = await callTelegramApi('sendMessage', {
        chat_id: channelId,
        text: vignetteMsg,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      }, botToken);
      console.log(`   ✓ Vignette sent (msg_id: ${vignetteRes.message_id})`);

      // 2. Send Native Interactive Quiz Poll
      const pollRes = await callTelegramApi('sendPoll', {
        chat_id: channelId,
        question: quizPayload.question,
        options: quizPayload.options,
        type: 'quiz',
        correct_option_id: quizPayload.correct_option_id,
        is_anonymous: quizPayload.is_anonymous,
        explanation: quizPayload.explanation,
        reply_to_message_id: vignetteRes.message_id,
      }, botToken);
      console.log(`   ✓ Quiz Poll sent (msg_id: ${pollRes.message_id})`);

      // Small pause between messages
      await new Promise(r => setTimeout(r, 1500));

      // 3. Send Official Explanation & Free Practice CTA
      const explRes = await callTelegramApi('sendMessage', {
        chat_id: channelId,
        text: explanationMsg,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
        reply_to_message_id: pollRes.message_id,
      }, botToken);
      console.log(`   ✓ Explanation & CTA sent (msg_id: ${explRes.message_id})`);

      // Record in history
      if (!history.channelHistory[channelId]) {
        history.channelHistory[channelId] = [];
      }
      history.channelHistory[channelId].push(question.id);
      if (!history.postedIds.includes(question.id)) {
        history.postedIds.push(question.id);
      }

      broadcastResults.push({
        channelId,
        questionId: question.id,
        topic: question.topic,
        success: true,
        vignetteMessageId: vignetteRes.message_id,
        pollMessageId: pollRes.message_id,
        explanationMessageId: explRes.message_id,
      });

      // Pause before next channel to respect rate limits
      if (i < channelIds.length - 1) {
        await new Promise(r => setTimeout(r, 2000));
      }
    } catch (err) {
      console.error(`   ❌ Failed to broadcast to ${channelId}:`, err.message);
      broadcastResults.push({ channelId, questionId: question.id, success: false, error: err.message });
    }
  }

  if (!isDryRun) {
    history.history.push({
      postedAt: new Date().toISOString(),
      channels: broadcastResults,
    });
    saveHistory(history);
  }

  console.log(`\n======================================================`);
  console.log(`🎉 Daily multi-channel broadcast finished!`);
  console.log(`======================================================\n`);
  return { success: true, broadcastResults };
}

function getArgValue(flag) {
  const idx = process.argv.indexOf(flag);
  if (idx !== -1 && process.argv[idx + 1] && !process.argv[idx + 1].startsWith('--')) {
    return process.argv[idx + 1];
  }
  return null;
}

// Run directly if invoked from CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  publishDailyQuestion().catch(err => {
    console.error('\n💥 Fatal Error:', err.message);
    process.exit(1);
  });
}
