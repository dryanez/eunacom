const fs = require('fs');
const path = require('path');

const dir = '/Users/felipeyanez/Desktop/NEWeunacom/eunacom-app-v2/public/data/reconstrucciones';
const files = ['eunacom-jul-2024.json', 'eunacom-dic-2024.json', 'eunacom-jul-2025.json', 'eunacom-dic-2025.json'];

let allQuestions = [];
let questionCounts = {};
let topicCounts = {};
let totalQuestionsCount = 0;

function normalizeString(str) {
  if (!str) return '';
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
}

for (const file of files) {
  const filepath = path.join(dir, file);
  if (fs.existsSync(filepath)) {
    const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    let examQuestions = data.questions || [];
    
    // Some formats might be different, let's check
    if (!data.questions && Array.isArray(data)) {
        examQuestions = data;
    }
    
    console.log(`Loaded ${file}: ${examQuestions.length} questions`);
    totalQuestionsCount += examQuestions.length;
    
    for (const q of examQuestions) {
      const qText = q.pregunta || q.question || '';
      const topic = q.topic || q.tags || 'Unknown';
      const normQ = normalizeString(qText);
      
      if (normQ.length < 10) continue; // Skip very short/empty questions
      
      if (!questionCounts[normQ]) {
        questionCounts[normQ] = { text: qText, count: 0, exams: [], topics: topic };
      }
      questionCounts[normQ].count++;
      if (!questionCounts[normQ].exams.includes(file)) {
          questionCounts[normQ].exams.push(file);
      }
      
      const topicKey = Array.isArray(topic) ? topic.join(', ') : topic;
      if (!topicCounts[topicKey]) topicCounts[topicKey] = 0;
      topicCounts[topicKey]++;
    }
  } else {
    console.log(`File not found: ${file}`);
  }
}

// Calculate repetitions
let repeatedCount = 0;
let uniqueCount = 0;
const sortedQuestions = [];

for (const key in questionCounts) {
  uniqueCount++;
  if (questionCounts[key].count > 1) {
    repeatedCount += questionCounts[key].count;
  }
  sortedQuestions.push(questionCounts[key]);
}

sortedQuestions.sort((a, b) => b.count - a.count);

console.log(`\nTotal questions across 4 exams: ${totalQuestionsCount}`);
console.log(`Unique questions: ${uniqueCount}`);
console.log(`Questions that appeared multiple times (total instances): ${repeatedCount}`);
const repetitionRate = ((repeatedCount / totalQuestionsCount) * 100).toFixed(2);
console.log(`Repetition Rate: ${repetitionRate}% of questions in these exams are repeats of another question within this set.\n`);

console.log('--- MOST REPEATED QUESTIONS ---');
for (let i = 0; i < Math.min(10, sortedQuestions.length); i++) {
  if (sortedQuestions[i].count > 1) {
      console.log(`[x${sortedQuestions[i].count}] (${sortedQuestions[i].exams.join(', ')})`);
      console.log(`Q: ${sortedQuestions[i].text.substring(0, 150)}...`);
      console.log(`Topic: ${sortedQuestions[i].topics}\n`);
  }
}

const sortedTopics = Object.entries(topicCounts).sort((a, b) => b[1] - a[1]);
console.log('--- MOST FREQUENT TOPICS ---');
for (let i = 0; i < Math.min(10, sortedTopics.length); i++) {
  console.log(`${sortedTopics[i][0]}: ${sortedTopics[i][1]} questions`);
}
