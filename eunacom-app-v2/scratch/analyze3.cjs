const fs = require('fs');
const path = require('path');

const dir = '/Users/felipeyanez/Desktop/NEWeunacom/eunacom-app-v2/public/data/reconstrucciones';
const files = ['eunacom-jul-2024.json', 'eunacom-dic-2024.json', 'eunacom-jul-2025.json', 'eunacom-dic-2025.json'];

let topicCounts = {};
let wordCounts = {};
let stopWords = new Set(["el", "la", "los", "las", "un", "una", "unos", "unas", "y", "o", "pero", "si", "no", "en", "por", "para", "con", "de", "del", "al", "a", "que", "se", "su", "sus", "es", "son", "paciente", "años", "consulta", "cual", "como", "mas", "diagnostico", "tratamiento", "conducta", "adecuada", "mas", "lo", "le", "sus", "este", "esta", "estos", "estas", "tiene", "presenta", "examen", "fisico", "historia", "antecedentes", "horas", "dias", "meses", "evolucion", "encuentra", "observa", "evidencia", "muestra"]);

for (const file of files) {
  const filepath = path.join(dir, file);
  if (fs.existsSync(filepath)) {
    const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    let examQuestions = data.questions || [];
    if (!data.questions && Array.isArray(data)) examQuestions = data;
    
    for (const q of examQuestions) {
      // Tags
      const tags = q.tags || [];
      const tagsArray = Array.isArray(tags) ? tags : [tags];
      for (const tag of tagsArray) {
        if (tag) {
          const t = tag.toString().trim();
          topicCounts[t] = (topicCounts[t] || 0) + 1;
        }
      }
      
      // Words in question
      const qText = q.pregunta || q.question || '';
      const words = qText.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z]/g, " ").split(/\s+/);
      for (const word of words) {
        if (word.length > 3 && !stopWords.has(word)) {
          wordCounts[word] = (wordCounts[word] || 0) + 1;
        }
      }
    }
  }
}

console.log('--- MOST FREQUENT TAGS ---');
const sortedTopics = Object.entries(topicCounts).sort((a, b) => b[1] - a[1]);
for (let i = 0; i < Math.min(20, sortedTopics.length); i++) {
  console.log(`${sortedTopics[i][0]}: ${sortedTopics[i][1]}`);
}

console.log('\n--- MOST FREQUENT WORDS IN QUESTIONS ---');
const sortedWords = Object.entries(wordCounts).sort((a, b) => b[1] - a[1]);
for (let i = 0; i < Math.min(20, sortedWords.length); i++) {
  console.log(`${sortedWords[i][0]}: ${sortedWords[i][1]}`);
}
