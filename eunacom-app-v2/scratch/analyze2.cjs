const fs = require('fs');
const path = require('path');

const dir = '/Users/felipeyanez/Desktop/NEWeunacom/eunacom-app-v2/public/data/reconstrucciones';
const files = ['eunacom-jul-2024.json', 'eunacom-dic-2024.json', 'eunacom-jul-2025.json', 'eunacom-dic-2025.json'];

let questionCounts = {};
let totalQuestionsCount = 0;

function normalizeString(str) {
  if (!str) return '';
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z]/g, "");
}

for (const file of files) {
  const filepath = path.join(dir, file);
  if (fs.existsSync(filepath)) {
    const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    let examQuestions = data.questions || [];
    if (!data.questions && Array.isArray(data)) examQuestions = data;
    
    totalQuestionsCount += examQuestions.length;
    
    for (const q of examQuestions) {
      const qText = q.pregunta || q.question || '';
      const normQ = normalizeString(qText);
      if (normQ.length < 20) continue;
      
      if (!questionCounts[normQ]) {
        questionCounts[normQ] = { text: qText, exams: new Set() };
      }
      questionCounts[normQ].exams.add(file);
    }
  }
}

let crossExamRepeats = 0;
for (const key in questionCounts) {
  if (questionCounts[key].exams.size > 1) {
    crossExamRepeats++;
    console.log(`\nAppears in: ${Array.from(questionCounts[key].exams).join(', ')}`);
    console.log(`Q: ${questionCounts[key].text.substring(0, 200)}...`);
  }
}

console.log(`\nTotal questions analyzed: ${totalQuestionsCount}`);
console.log(`Questions that appear in MORE THAN ONE exam: ${crossExamRepeats}`);
