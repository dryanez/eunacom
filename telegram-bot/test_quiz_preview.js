#!/usr/bin/env node

/**
 * EUNACOM Telegram Bot - Batch Quiz Preview & Validation Tool
 * Simulates multiple questions from questionDB.json to verify character limits,
 * formatting, and parsing across all specialties.
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

const dbPath = path.resolve(__dirname, '../eunacom-app-v2/public/data/questionDB.json');
const questions = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

console.log(`\n🔍 Verifying ${questions.length} questions from question bank...\n`);

let passed = 0;
let errors = 0;
const errorSamples = [];

for (let i = 0; i < questions.length; i++) {
  const q = questions[i];
  try {
    if (!q.question || !q.choices || q.choices.length < 2 || !q.correctAnswer) {
      continue;
    }
    
    const payload = prepareQuizPayload(q);

    // Validate Telegram limits
    if (payload.question.length > 300) {
      throw new Error(`Poll question length (${payload.question.length}) exceeds 300 characters limit.`);
    }
    if (payload.options.length < 2 || payload.options.length > 10) {
      throw new Error(`Poll options count (${payload.options.length}) outside 2-10 range.`);
    }
    for (const opt of payload.options) {
      if (opt.length > 100) {
        throw new Error(`Poll option "${opt}" length (${opt.length}) exceeds 100 characters limit.`);
      }
    }
    if (payload.correct_option_id < 0 || payload.correct_option_id >= payload.options.length) {
      throw new Error(`Invalid correct_option_id: ${payload.correct_option_id} for ${payload.options.length} options.`);
    }
    if (payload.explanation && payload.explanation.length > 200) {
      throw new Error(`Poll explanation length (${payload.explanation.length}) exceeds 200 characters limit.`);
    }

    const vignette = formatVignetteMessage(q);
    const explanation = formatExplanationMessage(q);

    if (vignette.length > 4000) {
      throw new Error(`Vignette message length (${vignette.length}) exceeds 4096 characters limit.`);
    }
    if (explanation.length > 4000) {
      throw new Error(`Explanation message length (${explanation.length}) exceeds 4096 characters limit.`);
    }

    passed++;
  } catch (err) {
    errors++;
    if (errorSamples.length < 5) {
      errorSamples.push({ id: q.id, error: err.message, qText: q.question.slice(0, 100) });
    }
  }
}

console.log(`========================================`);
console.log(`📊 Validation Results:`);
console.log(`✅ Passed perfectly: ${passed} / ${questions.length} (${((passed / questions.length) * 100).toFixed(1)}%)`);
if (errors > 0) {
  console.log(`❌ Errors detected: ${errors}`);
  console.log(`Error samples:`, JSON.stringify(errorSamples, null, 2));
} else {
  console.log(`🎉 100% of questions conform strictly to Telegram API constraints!`);
}
console.log(`========================================\n`);

// Preview 3 diverse samples
console.log(`--- SAMPLE PREVIEW 1 ---`);
const s1 = questions.find(q => q.topic === 'Cirugía y Anestesia' && q.question.length > 250);
if (s1) {
  console.log(formatVignetteMessage(s1));
  console.log(`\nPOLL:`, prepareQuizPayload(s1));
}

console.log(`\n--- SAMPLE PREVIEW 2 ---`);
const s2 = questions.find(q => q.topic === 'Pediatría y Ginecología' && q.choices?.length === 5);
if (s2) {
  console.log(formatVignetteMessage(s2));
  console.log(`\nPOLL:`, prepareQuizPayload(s2));
}
