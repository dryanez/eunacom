import fs from 'fs';
import path from 'path';
import {
  formatVignetteMessage,
  prepareQuizPayload,
  formatExplanationMessage
} from '../../telegram-bot/format_utils.js';

async function callTelegramApi(endpoint, body, botToken) {
  const url = `https://api.telegram.org/bot${botToken}/${endpoint}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok || !data.ok) {
    throw new Error(`Telegram API [${endpoint}] error: ${data.description || res.statusText}`);
  }
  return data.result;
}

export default async function handler(req, res) {
  // Optional security check
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.authorization;
  const querySecret = req.query.secret;

  if (cronSecret) {
    const isAuthorized = 
      authHeader === `Bearer ${cronSecret}` || 
      querySecret === cronSecret;
    if (!isAuthorized) {
      return res.status(401).json({ error: 'Unauthorized: invalid cron secret' });
    }
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const channelIds = (process.env.TELEGRAM_CHANNEL_IDS || process.env.TELEGRAM_CHAT_ID || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  if (!botToken || channelIds.length === 0) {
    return res.status(500).json({
      error: 'Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHANNEL_IDS in environment variables'
    });
  }

  try {
    // Read question database
    let questions = [];
    const localDbPath = path.join(process.cwd(), 'public/data/questionDB.json');
    if (fs.existsSync(localDbPath)) {
      questions = JSON.parse(fs.readFileSync(localDbPath, 'utf8'));
    } else {
      // Fallback fetch via relative/origin URL if on serverless edge
      const host = req.headers.host || 'www.eunacomapp.cl';
      const protocol = req.headers['x-forwarded-proto'] || 'https';
      const response = await fetch(`${protocol}://${host}/data/questionDB.json`);
      questions = await response.json();
    }

    const validQuestions = questions.filter(q => q.question && q.choices && q.choices.length >= 2 && q.correctAnswer);
    if (validQuestions.length === 0) {
      return res.status(500).json({ error: 'No valid questions found in database' });
    }

    const results = [];
    const usedIndices = new Set();

    // Broadcast a UNIQUE random question for each channel
    for (let i = 0; i < channelIds.length; i++) {
      const channelId = channelIds[i];
      
      // Find an unused random question for this channel
      let randomIndex;
      let attempts = 0;
      do {
        randomIndex = Math.floor(Math.random() * validQuestions.length);
        attempts++;
      } while (usedIndices.has(randomIndex) && attempts < 100);

      usedIndices.add(randomIndex);
      const question = validQuestions[randomIndex];

      const vignetteMsg = formatVignetteMessage(question, { channelName: channelId, siteUrl: 'https://www.eunacomapp.cl' });
      const quizPayload = prepareQuizPayload(question);
      const explanationMsg = formatExplanationMessage(question, { siteUrl: 'https://www.eunacomapp.cl' });

      // 1. Send Vignette
      const vignetteRes = await callTelegramApi('sendMessage', {
        chat_id: channelId,
        text: vignetteMsg,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      }, botToken);

      // 2. Send Quiz Poll
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

      // 3. Send Explanation & CTA
      const explRes = await callTelegramApi('sendMessage', {
        chat_id: channelId,
        text: explanationMsg,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
        reply_to_message_id: pollRes.message_id,
      }, botToken);

      results.push({
        channelId,
        questionId: question.id,
        topic: question.topic,
        vignetteMessageId: vignetteRes.message_id,
        pollMessageId: pollRes.message_id,
        explanationMessageId: explRes.message_id,
      });

      // Brief delay between channels
      if (i < channelIds.length - 1) {
        await new Promise(r => setTimeout(r, 1500));
      }
    }

    return res.status(200).json({
      ok: true,
      totalChannels: channelIds.length,
      results
    });
  } catch (err) {
    console.error('Error in telegram-cron handler:', err);
    return res.status(500).json({ error: err.message });
  }
}
