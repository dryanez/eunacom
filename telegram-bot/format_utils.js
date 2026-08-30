/**
 * EUNACOM Telegram Bot - Formatting & Validation Utilities
 */

/**
 * Maps letter answer (A, B, C, D, E) to 0-based Telegram quiz index.
 */
export function getCorrectOptionIndex(correctAnswer, choices) {
  if (typeof correctAnswer === 'number') {
    return correctAnswer;
  }
  const cleanAns = String(correctAnswer || '').trim().toUpperCase();
  
  // First check if matching choice ID directly
  const foundIndex = choices.findIndex(
    (c, idx) => c.id?.trim().toUpperCase() === cleanAns || String.fromCharCode(65 + idx) === cleanAns
  );
  
  if (foundIndex !== -1) return foundIndex;

  // Fallback to letter conversion
  const letterMap = { A: 0, B: 1, C: 2, D: 3, E: 4 };
  return letterMap[cleanAns] ?? 0;
}

/**
 * Clean up text by un-wrapping hard linebreaks, removing HTML, and standardizing whitespace.
 */
export function cleanText(text) {
  if (!text) return '';
  return String(text)
    .replace(/<[^>]*>/g, '') // remove HTML tags
    .replace(/\r\n/g, '\n')
    // Un-wrap hard-wrapped lines within paragraphs: replace single \n not followed by \n with space
    .replace(/([^\n])\n([^\n])/g, '$1 $2')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim();
}

/**
 * Safely sanitizes body text so Telegram Markdown parser won't crash on unclosed tags.
 */
export function sanitizeMarkdown(text) {
  if (!text) return '';
  let str = cleanText(text);

  // Convert bullet point asterisks (* Item) to bullet symbol (• Item)
  str = str.replace(/(^|\n)\s*[*:-]\s+/g, '$1• ');

  // Standardize double bold **text** to single *text* for Telegram Legacy Markdown
  str = str.replace(/\*\*([^*]+)\*\*/g, '*$1*');

  // Strip any remaining stray asterisks or underscores that are unmatched
  const asteriskCount = (str.match(/\*/g) || []).length;
  if (asteriskCount % 2 !== 0) {
    // If odd number of asterisks, remove all asterisks to prevent syntax error
    str = str.replace(/\*/g, '');
  }

  const underscoreCount = (str.match(/_/g) || []).length;
  if (underscoreCount % 2 !== 0) {
    str = str.replace(/_/g, ' ');
  }

  return str;
}

/**
 * Extracts a concise question prompt suitable for Telegram sendPoll (max 300 chars)
 */
export function extractPollQuestion(fullText) {
  const text = cleanText(fullText);
  if (text.length <= 285) {
    return text;
  }

  // 1. Look for question marks (e.g. ¿Cuál es el diagnóstico más probable?)
  const questionMarkMatch = text.match(/¿[^?]+(?:\?|$)/i);
  if (questionMarkMatch && questionMarkMatch[0].length >= 10 && questionMarkMatch[0].length <= 285) {
    return questionMarkMatch[0].trim();
  }

  // 2. Look for common Spanish clinical question triggers
  const triggers = [
    /La conducta más adecuada es:?/i,
    /El diagnóstico más probable es:?/i,
    /El tratamiento de elección es:?/i,
    /La sospecha diagnóstica es:?/i,
    /El examen de elección es:?/i,
    /La complicación más frecuente es:?/i,
    /La causa más probable es:?/i,
    /El manejo más adecuado es:?/i,
    /La actitud más correcta es:?/i,
    /Respecto a[^,.:]+,/i,
  ];

  for (const trigger of triggers) {
    const match = text.match(trigger);
    if (match && match.index !== undefined) {
      const prompt = text.slice(match.index).trim();
      if (prompt.length >= 10 && prompt.length <= 285) {
        return `❓ ` + prompt;
      }
    }
  }

  // 3. Fallback: split by sentences and get the last complete sentence
  const sentences = text.split(/(?<=[.?!])\s+/).filter(Boolean);
  if (sentences.length > 1) {
    const lastSentence = sentences[sentences.length - 1].trim();
    if (lastSentence.length >= 15 && lastSentence.length <= 285) {
      return `❓ ` + lastSentence;
    }
  }

  // 4. Default: truncate nicely
  return text.slice(0, 282).trim() + '...';
}

/**
 * Format the clinical case vignette message for Telegram channel post.
 */
export function formatVignetteMessage(q, { siteUrl = 'https://www.eunacomapp.cl' } = {}) {
  const specialty = q.topic || 'Medicina General';
  const code = q.codigo_eunacom || '';
  const cleanQuestion = cleanText(q.question);

  let msg = `🩺 *CASO CLÍNICO DEL DÍA #EUNACOM*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `📚 *Especialidad:* ${specialty}\n`;
  if (code) {
    msg += `🏷 *Tema / Código:* \`${code.replace(/`/g, '')}\`\n`;
  }
  msg += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
  msg += `${cleanQuestion}\n\n`;
  msg += `👇 *¡Toca tu respuesta en la encuesta abajo para ver si acertaste y ver las estadísticas del grupo!*`;

  return msg;
}

/**
 * Prepares the Telegram sendPoll payload conforming to Telegram Quiz limits:
 * - question: 1 - 300 characters
 * - options: 2 - 10 strings, each 1 - 100 characters
 * - type: 'quiz'
 * - correct_option_id: index (0-based)
 */
export function prepareQuizPayload(q) {
  const choices = Array.isArray(q.choices) ? q.choices : [];
  if (choices.length < 2) {
    throw new Error(`Question ${q.id} has less than 2 choices.`);
  }

  const pollQuestion = extractPollQuestion(q.question);

  // Format options (Telegram limit: max 100 characters per option)
  const options = choices.map((c, idx) => {
    const letter = c.id || String.fromCharCode(65 + idx);
    let optText = cleanText(c.text);
    // Strip leading "A)", "A -", etc. if present in text
    optText = optText.replace(/^[A-Ea-e][\)\.\:\-]\s*/, '').trim();
    
    // Prefix with clean letter
    let formattedOption = `${letter}) ${optText}`;
    if (formattedOption.length > 100) {
      formattedOption = formattedOption.slice(0, 97) + '...';
    }
    return formattedOption;
  });

  const correctIndex = getCorrectOptionIndex(q.correctAnswer, choices);

  // Short explanation for the Telegram native poll popup (limit: 200 chars)
  let shortExplanation = '';
  if (q.explanation) {
    const cleanExpl = cleanText(q.explanation).replace(/[\*\_\`]/g, '');
    shortExplanation = cleanExpl.length > 195 ? cleanExpl.slice(0, 195) + '...' : cleanExpl;
  }

  return {
    question: pollQuestion,
    options,
    type: 'quiz',
    correct_option_id: Math.min(Math.max(correctIndex, 0), options.length - 1),
    is_anonymous: true,
    explanation: shortExplanation || undefined,
  };
}

/**
 * Format the official explanation & CTA message.
 */
export function formatExplanationMessage(q, { siteUrl = 'https://www.eunacomapp.cl' } = {}) {
  const correctLetter = (q.correctAnswer || 'A').toUpperCase();
  const sanitizedExpl = sanitizeMarkdown(q.explanation || 'Consulta la guía clínica oficial en la plataforma.');
  
  let msg = `📖 *RESOLUCIÓN Y FUNDAMENTO OFICIAL*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `✅ *Respuesta Correcta: Alternativa ${correctLetter}*\n\n`;
  
  // Truncate explanation if excessively long for a single Telegram message (limit ~3500 chars)
  let displayExplanation = sanitizedExpl;
  if (displayExplanation.length > 2500) {
    displayExplanation = displayExplanation.slice(0, 2450) + '\n\n_(Explicación completa disponible en la plataforma)_';
  }
  msg += `||${displayExplanation}||\n\n`;

  // High converting CTA
  msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `🎯 *¿Preparando el EUNACOM 2026?*\n`;
  msg += `Practica gratis más de 6.000 preguntas oficiales comentadas, filtra por especialidad y rinde ensayos cronometrados con ranking nacional en:\n`;
  msg += `👉 🌐 [www.eunacomapp.cl](${siteUrl}?utm_source=telegram&utm_medium=daily_quiz&utm_campaign=pregunta_del_dia)\n`;

  return msg;
}
