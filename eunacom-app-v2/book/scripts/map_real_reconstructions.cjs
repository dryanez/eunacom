const fs = require('fs');
const path = require('path');

const recDir = path.join(__dirname, '..', '..', 'public', 'data', 'reconstrucciones');
const index = JSON.parse(fs.readFileSync(path.join(recDir, 'index.json'), 'utf8'));

console.log('=== MAPEO DE RECONSTRUCCIONES REALES CON MES Y AÑO ===');

const examFiles = index.exams;

// Let's load all questions across all 16 exams
const allReconstructedQuestions = [];

examFiles.forEach(ex => {
  const filePath = path.join(recDir, ex.file);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const qList = data.questions || data || [];
    qList.forEach(q => {
      allReconstructedQuestions.push({
        examName: ex.name,
        month: ex.month,
        year: ex.year,
        numero: q.numero || q.number || q.id,
        pregunta: q.pregunta || q.enunciado || q.stem || q.questionText || '',
        opciones: q.opciones || q.options || [],
        correcta: q.respuestaCorrecta || q.correct_answer || q.answer || '',
        explicacion: q.explicacion || q.explanation || ''
      });
    });
  }
});

console.log('Total de preguntas reales cargadas:', allReconstructedQuestions.length);

// Let's search for exact real questions for Bloque I topics
const topicsQueries = {
  'ECG / Hipertrofia / QT': ['sokolow', 'cornell', 'qtc', 'eje', 'hipertrofia ventricular izquierda'],
  'Paro / ACLS / Desfibrilacion': ['paro cardiorrespiratorio', 'asistolia', 'desfibrilaci', 'adrenalina', 'amiodarona'],
  'Fibrilacion Auricular / Anticoagulacion': ['fibrilaci', 'chads', 'cha2ds2', 'doac', 'apixab', 'acenocumarol', 'anticoagulaci'],
  'TPSV / WPW': ['tpsv', 'supraventricular', 'adenosina', 'valsalva', 'wolff', 'wpw', 'preexcitaci'],
  'Bloqueos AV / Marcapasos': ['bloqueo av', 'mobitz', 'wenckebach', 'tercer grado', 'stokes-adams', 'marcapaso']
};

Object.entries(topicsQueries).forEach(([topic, queries]) => {
  console.log(`\n========================================`);
  console.log(`TEMA: ${topic}`);
  console.log(`========================================`);
  
  const matches = allReconstructedQuestions.filter(q => {
    const text = (q.pregunta + ' ' + (q.explicacion || '')).toLowerCase();
    return queries.some(term => text.includes(term));
  });

  console.log(`Total encontrados en exámenes reales: ${matches.length}`);
  matches.slice(0, 5).forEach((m, idx) => {
    console.log(`\n  [${idx + 1}] ${m.examName} (${m.month} ${m.year}) — Pregunta #${m.numero}`);
    console.log(`      Enunciado: "${m.pregunta.substring(0, 140).replace(/\n/g, ' ')}..."`);
    console.log(`      Respuesta Correcta: ${m.correcta}`);
  });
});
