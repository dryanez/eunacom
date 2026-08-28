const fs = require('fs');
const path = require('path');

// 1. Load Question Bank
const bankPath = path.join(__dirname, '..', '..', 'public', 'data', 'pruebas', 'modulo-1-cardiologia.json');
let bankQuestions = [];
if (fs.existsSync(bankPath)) {
  const rawBank = JSON.parse(fs.readFileSync(bankPath, 'utf8'));
  bankQuestions = Array.isArray(rawBank) ? rawBank : (rawBank.preguntas || rawBank.pruebas || []);
}

// 2. Load Online Classes Quizzes
const onlineClasses = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'cardio_online_classes.json'), 'utf8'));
let onlineQuizzes = [];
onlineClasses.forEach((c, idx) => {
  const qz = typeof c.quiz === 'string' ? JSON.parse(c.quiz || '[]') : (c.quiz || []);
  qz.forEach(q => onlineQuizzes.push({ topicNum: idx + 1, topic: c.topic, ...q }));
});

console.log('=== INVENTARIO DE PREGUNTAS EN LA APP ===');
console.log('1. Preguntas en Banco General (modulo-1-cardiologia.json):', bankQuestions.length);
console.log('2. Preguntas en Quizzes Online (cardio_online_classes.json):', onlineQuizzes.length);

const terms = ['arritmia', 'fibrilaci', 'flutter', 'aleteo', 'bloqueo', 'bav', 'tpsv', 'supraventricular', 'ventricular', 'paro', 'rcp', 'desfibril', 'marcapaso', 'bradicardia', 'taquicardia', 'wolff', 'wpw', 'extras', 'qt', 'adrenalina', 'amiodarona', 'adenosina', 'atropina', 'cardioversi', 'chads', 'cha2ds2'];

const arrhythmiaBank = bankQuestions.filter(q => {
  const text = JSON.stringify(q).toLowerCase();
  return terms.some(t => text.includes(t));
});

const arrhythmiaQuizzes = onlineQuizzes.filter(q => {
  const text = JSON.stringify(q).toLowerCase();
  return terms.some(t => text.includes(t));
});

console.log('Total Preguntas de Arritmias en Banco General:', arrhythmiaBank.length);
console.log('Total Preguntas de Arritmias en Quizzes Online:', arrhythmiaQuizzes.length);

// Analyze core concept coverage
console.log('\n=== ANÁLISIS DE CONCEPTOS CLAVE EVALUADOS EN LA APP ===');
const allArrhythmiaQuestions = [...arrhythmiaBank, ...arrhythmiaQuizzes];

const conceptAudit = {
  'Manejo Inestabilidad Hemodinámica (CVE inmediata)': 0,
  'ACLS: Ritmos Desfibrilables vs No Desfibrilables': 0,
  'ACLS: Fármacos (Adrenalina / Amiodarona / Atropina / Gluconato Calcio)': 0,
  'Fibrilación Auricular: Diagnóstico ECG (ondas f, RR irregular)': 0,
  'Fibrilación Auricular: Score CHA2DS2-VASc y uso de DOACs': 0,
  'Fibrilación Auricular: Contraindicación DOACs en Válvula Mecánica/Reumática': 0,
  'Fibrilación Auricular: Regla de 48h para Cardioversión': 0,
  'Fibrilación Auricular: Antiarrítmicos Ic (Flecainida) vs Clase III (Amiodarona)': 0,
  'Flutter Auricular: Criterios ECG y Ablación por Radiofrecuencia': 0,
  'TPSV: Maniobras Vagales (Valsalva) y Adenosina bolo rápido': 0,
  'Síndrome de Wolff-Parkinson-White: PR corto + Delta + QRS ancho': 0,
  'WPW con FA: Contraindicación de Bloqueadores del Nodo AV (Verapamilo/Digoxina/BB)': 0,
  'Bloqueos AV: Diagnóstico Diferencial (1°, Mobitz I, Mobitz II, 3° Completo)': 0,
  'Bloqueos AV: Indicación de Marcapaso Definitivo GES (Mobitz II / 3°)': 0,
  'Bradicardias: Manejo agudo con Atropina y Marcapaso Transcutáneo': 0,
  'Extrasístoles Ventriculares Benignas vs TV': 0,
  'QT Largo y Torsades de Pointes': 0
};

allArrhythmiaQuestions.forEach(q => {
  const text = JSON.stringify(q).toLowerCase();
  if (text.includes('inestable') || text.includes('cardioversi')) conceptAudit['Manejo Inestabilidad Hemodinámica (CVE inmediata)']++;
  if (text.includes('desfibril') || text.includes('fv') || text.includes('asistolia')) conceptAudit['ACLS: Ritmos Desfibrilables vs No Desfibrilables']++;
  if (text.includes('adrenalina') || text.includes('amiodarona')) conceptAudit['ACLS: Fármacos (Adrenalina / Amiodarona / Atropina / Gluconato Calcio)']++;
  if (text.includes('fibrilaci') && (text.includes('ecg') || text.includes('diagn') || text.includes('irregular'))) conceptAudit['Fibrilación Auricular: Diagnóstico ECG (ondas f, RR irregular)']++;
  if (text.includes('chads') || text.includes('cha2ds2') || text.includes('anticoagul') || text.includes('doac') || text.includes('apixab')) conceptAudit['Fibrilación Auricular: Score CHA2DS2-VASc y uso de DOACs']++;
  if (text.includes('mec') || text.includes('reum') || text.includes('acenocumarol') || text.includes('inr')) conceptAudit['Fibrilación Auricular: Contraindicación DOACs en Válvula Mecánica/Reumática']++;
  if (text.includes('48') || text.includes('reciente')) conceptAudit['Fibrilación Auricular: Regla de 48h para Cardioversión']++;
  if (text.includes('flecainida') || text.includes('propafenona') || text.includes('estructural')) conceptAudit['Fibrilación Auricular: Antiarrítmicos Ic (Flecainida) vs Clase III (Amiodarona)']++;
  if (text.includes('flutter') || text.includes('aleteo') || text.includes('ablaci')) conceptAudit['Flutter Auricular: Criterios ECG y Ablación por Radiofrecuencia']++;
  if (text.includes('tpsv') || text.includes('adenosina') || text.includes('valsalva') || text.includes('reentrada')) conceptAudit['TPSV: Maniobras Vagales (Valsalva) y Adenosina bolo rápido']++;
  if (text.includes('wolff') || text.includes('wpw') || text.includes('delta')) conceptAudit['Síndrome de Wolff-Parkinson-White: PR corto + Delta + QRS ancho']++;
  if ((text.includes('wpw') || text.includes('preexcit')) && (text.includes('verapamil') || text.includes('contraindic') || text.includes('prohib'))) conceptAudit['WPW con FA: Contraindicación de Bloqueadores del Nodo AV (Verapamilo/Digoxina/BB)']++;
  if (text.includes('bloqueo') || text.includes('bav') || text.includes('mobitz') || text.includes('wenckebach') || text.includes('tercer')) conceptAudit['Bloqueos AV: Diagnóstico Diferencial (1°, Mobitz I, Mobitz II, 3° Completo)']++;
  if (text.includes('marcapaso') && (text.includes('definitivo') || text.includes('ges') || text.includes('mobitz') || text.includes('completo'))) conceptAudit['Bloqueos AV: Indicación de Marcapaso Definitivo GES (Mobitz II / 3°)']++;
  if (text.includes('atropina') || text.includes('transcutaneo') || text.includes('bradicardia')) conceptAudit['Bradicardias: Manejo agudo con Atropina y Marcapaso Transcutáneo']++;
  if (text.includes('extras') || text.includes('benigna')) conceptAudit['Extrasístoles Ventriculares Benignas vs TV']++;
  if (text.includes('qt') || text.includes('torsade') || text.includes('pointes')) conceptAudit['QT Largo y Torsades de Pointes']++;
});

console.log(JSON.stringify(conceptAudit, null, 2));
