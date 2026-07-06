const fs = require('fs');
const path = require('path');

const dir = '/Users/felipeyanez/Desktop/NEWeunacom/eunacom-app-v2/public/data/reconstrucciones';
const files = ['eunacom-jul-2024.json', 'eunacom-dic-2024.json', 'eunacom-jul-2025.json', 'eunacom-dic-2025.json'];

let topicCounts = {};

for (const file of files) {
  const filepath = path.join(dir, file);
  if (fs.existsSync(filepath)) {
    const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    let examQuestions = data.questions || [];
    if (!data.questions && Array.isArray(data)) examQuestions = data;
    
    for (const q of examQuestions) {
      if (q.explanation) {
          // Extract text before the first colon
          const match = q.explanation.match(/^([^:]+):/);
          if (match && match[1].length < 50) { // arbitrary length limit for a topic
              const topic = match[1].trim();
              topicCounts[topic] = (topicCounts[topic] || 0) + 1;
          } else {
             // Try to see if it's just the first few words or the explanation itself is short
             const shortTopic = q.explanation.split('.')[0];
             if (shortTopic.length < 40) {
                 topicCounts[shortTopic] = (topicCounts[shortTopic] || 0) + 1;
             }
          }
      }
    }
  }
}

console.log('--- TEMAS MÁS PREGUNTADOS EN LAS ÚLTIMAS 4 PRUEBAS (Extraídos de las explicaciones) ---');
const sortedTopics = Object.entries(topicCounts).sort((a, b) => b[1] - a[1]);
for (let i = 0; i < Math.min(30, sortedTopics.length); i++) {
  console.log(`${sortedTopics[i][0]}: ${sortedTopics[i][1]} preguntas`);
}
