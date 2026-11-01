#!/usr/bin/env node

/**
 * EUNACOM Autonomous AI Medical Research & Copywriting Agent
 * 
 * Ingests questions from questionDB.json and clinical topics,
 * synthesizes high-yield clinical pearls ("Joya EUNACOM del Día"),
 * and formats responsive HTML emails for doctors.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDailyJoyaEmailHtml } from '../eunacom-app-v2/api/_email-templates.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env files
const envPaths = [
  path.resolve(__dirname, '../eunacom-app-v2/.env.local'),
  path.resolve(__dirname, '../eunacom-app-v2/.env')
];

for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq > -1) {
        const k = trimmed.slice(0, eq).trim();
        const v = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[k]) process.env[k] = v;
      }
    }
  }
}

const QUESTION_DB_PATH = path.resolve(__dirname, '../eunacom-app-v2/public/data/questionDB.json');
const HISTORY_FILE = path.resolve(__dirname, 'joyas_history.json');

function loadHistory() {
  if (!fs.existsSync(HISTORY_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function saveHistory(history) {
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf8');
}

/**
 * Intelligent Synthesis Engine
 * Attempts Gemini API first; falls back to structured medical heuristics if API is unavailable.
 */
async function synthesizePearl(questionItem) {
  const apiKey = process.env.GEMINI_API_KEY;
  const topic = questionItem.topic || questionItem.category || 'Medicina Interna';
  const rawQuestion = questionItem.question || '';
  const explanation = questionItem.explanation || '';
  const choices = questionItem.choices || [];
  const correctChoice = choices.find(c => c.id === questionItem.correctAnswer) || choices[0] || { text: '' };

  let pearlData = null;

  if (apiKey && apiKey.startsWith('AIza') && apiKey.length > 20) {
    try {
      const prompt = `
Eres un médico docente experto en el examen médico EUNACOM de Chile.
A partir de la siguiente pregunta oficial y su explicación:

Tópico: ${topic}
Pregunta: ${rawQuestion}
Respuesta Correcta: ${correctChoice.text}
Explicación: ${explanation}

Genera un JSON con esta estructura exacta para un micro-boletín clínico para médicos:
{
  "topicTitle": "Título atractivo y conciso del concepto clínico (ej: Manejo de Fibrilación Auricular en Urgencias)",
  "specialty": "Especialidad médica (ej: Cardiología, Pediatría, etc.)",
  "clinicalVignette": "Breve caso clínico o dilema de 2 a 3 líneas extraído de la pregunta",
  "pearlRule": "La Regla de Oro EUNACOM: La perla médica de alto rendimiento que no se debe olvidar para responder esta pregunta en el examen oficial.",
  "pitfall": "La trampa o error frecuente que cometen los postulantes"
}
Devuelve SOLO el JSON sin código markdown ni comentarios.
      `.trim();

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          pearlData = JSON.parse(text);
        }
      }
    } catch (e) {
      // Fallback silently to rule-based synthesis
    }
  }

  // Fallback Rule-Based Synthesis if Gemini is unavailable
  if (!pearlData) {
    // Extract first 2 sentences from vignette
    const sentences = rawQuestion.split(/(?<=[.?!])\s+/);
    const vignette = sentences.slice(0, Math.min(2, sentences.length)).join(' ');

    // Clean explanation to extract rule
    let rule = explanation.replace(/^La alternativa correcta es.*?(\.|$)/i, '').trim();
    if (rule.length > 280) {
      const firstDot = rule.indexOf('.', 120);
      if (firstDot > -1) rule = rule.slice(0, firstDot + 1);
    }
    if (!rule) rule = `En ${topic}, la conducta de elección es ${correctChoice.text.toLowerCase()}.`;

    pearlData = {
      topicTitle: `${topic}: ${correctChoice.text.replace(/\.$/, '')}`,
      specialty: questionItem.category || topic,
      clinicalVignette: vignette || rawQuestion.slice(0, 160) + '...',
      pearlRule: rule,
      pitfall: 'Confundir el manejo agudo inicial con el tratamiento de mantención a largo plazo.'
    };
  }

  return {
    ...pearlData,
    rawQuestion,
    choices: choices.map(c => c.text),
    correctAnswerId: questionItem.correctAnswer,
    questionId: questionItem.id
  };
}

async function main() {
  const args = process.argv.slice(2);
  const isPreview = args.includes('--preview');
  const isDryRun = args.includes('--dry-run');
  const isSend = args.includes('--send');
  const testEmailIdx = args.indexOf('--test-email');
  const testEmail = testEmailIdx > -1 ? args[testEmailIdx + 1] : null;

  console.log(`=======================================================`);
  console.log(`🤖 EUNACOM Medical Research & Copywriting Agent`);
  console.log(`=======================================================\n`);

  if (!fs.existsSync(QUESTION_DB_PATH)) {
    console.error(`❌ questionDB.json not found at ${QUESTION_DB_PATH}`);
    process.exit(1);
  }

  const db = JSON.parse(fs.readFileSync(QUESTION_DB_PATH, 'utf8'));
  const history = loadHistory();
  const sentIds = new Set(history.map(h => h.questionId));

  // Find a candidate question with high quality explanation that hasn't been used yet
  const candidates = db.filter(q => 
    q.choices &&
    q.choices.length >= 4 &&
    q.explanation &&
    q.explanation.length > 50 &&
    !sentIds.has(q.id)
  );

  if (candidates.length === 0) {
    console.log(`⚠️ All candidate questions have been used! Resetting history...`);
    history.length = 0;
  }

  const selectedQuestion = candidates[Math.floor(Math.random() * candidates.length)] || db[0];
  console.log(`📖 Researching Topic: ${selectedQuestion.topic || selectedQuestion.category} (ID: ${selectedQuestion.id})`);

  const pearl = await synthesizePearl(selectedQuestion);

  console.log(`\n💎 JOY GENERATED:`);
  console.log(`📌 Título: ${pearl.topicTitle}`);
  console.log(`🩺 Especialidad: ${pearl.specialty}`);
  console.log(`📖 Caso: "${pearl.clinicalVignette}"`);
  console.log(`🎯 Regla de Oro: ${pearl.pearlRule}`);

  // Render HTML
  const emailHtml = getDailyJoyaEmailHtml({
    topic: pearl.topicTitle,
    specialty: pearl.specialty,
    clinicalVignette: pearl.clinicalVignette,
    pearlRule: pearl.pearlRule,
    questionText: pearl.rawQuestion,
    questionOptions: pearl.choices,
    deepLinkUrl: `https://www.eunacomapp.cl/tests?qid=${pearl.questionId}`
  });

  const previewPath = path.resolve(__dirname, 'preview_joya.html');
  fs.writeFileSync(previewPath, emailHtml, 'utf8');
  console.log(`\n✅ HTML Preview saved to: ${previewPath}`);

  // Track in history
  history.push({
    questionId: pearl.questionId,
    topic: pearl.topicTitle,
    specialty: pearl.specialty,
    date: new Date().toISOString()
  });
  saveHistory(history);

  if (isSend) {
    const resendKey = process.env.RESEND_API_KEY;
    const sender = process.env.RESEND_SENDER_EMAIL || 'equipo@eunacomapp.cl';
    
    if (testEmail) {
      console.log(`\n📤 Dispatching Joya Test to ${testEmail}...`);
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(resendKey);
        const result = await resend.emails.send({
          from: `EUNACOM App <${sender}>`,
          to: testEmail,
          subject: `💎 Joya EUNACOM: ${pearl.topicTitle}`,
          html: emailHtml
        });
        console.log(`📧 Result:`, result);
      } catch (e) {
        console.error(`❌ Failed to send via Resend:`, e.message);
      }
    } else {
      console.log(`\n📤 Broadcasting Joya to all active subscribers via Turso...`);
      try {
        const { getTurso } = await import('../eunacom-app-v2/api/_turso.js');
        const { Resend } = await import('resend');
        const db = getTurso();
        const resend = new Resend(resendKey);

        const usersRes = await db.execute({
          sql: `SELECT id, email, first_name FROM user_profiles
                WHERE email IS NOT NULL AND email LIKE '%@%' AND id NOT IN ('screenshot-mock', 'dev_test')`,
          args: []
        });

        console.log(`👥 Found ${usersRes.rows.length} subscribers.`);
        const BATCH_SIZE = 50;
        let totalSent = 0;

        for (let i = 0; i < usersRes.rows.length; i += BATCH_SIZE) {
          const chunk = usersRes.rows.slice(i, i + BATCH_SIZE);
          const batchPayload = chunk.map(u => ({
            from: `EUNACOM App <${sender}>`,
            to: u.email,
            subject: `💎 Joya EUNACOM: ${pearl.topicTitle}`,
            html: emailHtml
          }));

          const { error } = await resend.batch.send(batchPayload);
          if (error) {
            console.error(`Resend batch broadcast error:`, error);
            continue;
          }

          for (const u of chunk) {
            const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
            await db.execute({
              sql: `INSERT INTO email_campaign_logs (id, user_id, email, campaign_type, subject)
                    VALUES (?, ?, ?, 'joya_daily', ?)`,
              args: [logId, u.id, u.email, `💎 Joya EUNACOM: ${pearl.topicTitle}`]
            }).catch(() => {});
          }

          totalSent += chunk.length;
        }

        console.log(`✅ Joya broadcasted to ${totalSent} subscribers!`);
      } catch (e) {
        console.error(`❌ Broadcast error:`, e.message);
      }
    }
  }

  console.log(`\n✨ Done!`);
}

main().catch(console.error);
