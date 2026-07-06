const fs = require('fs');
const path = require('path');

const dir = '/Users/felipeyanez/Desktop/NEWeunacom/eunacom-app-v2/public/data/reconstrucciones';
const files = fs.readdirSync(dir).filter(f => f.startsWith('eunacom-') && f.endsWith('.json'));

let allQuestions = [];
let topicCounts = {};
let questionsByTopic = {};

function getTopic(q) {
    if (q.tags && q.tags.length > 0) {
        return Array.isArray(q.tags) ? q.tags[0].toString().trim() : q.tags.toString().trim();
    }
    if (q.topic) return q.topic.toString().trim();
    if (q.explanation) {
        const match = q.explanation.match(/^([^:]+):/);
        if (match && match[1].length < 60) {
            return match[1].trim();
        }
        const shortTopic = q.explanation.split('.')[0];
        if (shortTopic.length < 50) {
            return shortTopic.trim();
        }
    }
    return 'Tema General';
}

function cleanString(str) {
    return str ? str.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim() : '';
}

function createAnchor(text) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

let qIdCounter = 1;

for (const file of files) {
  const filepath = path.join(dir, file);
  const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  let examQuestions = data.questions || [];
  if (!data.questions && Array.isArray(data)) examQuestions = data;
  
  for (const q of examQuestions) {
      if (!q.pregunta && !q.question) continue;
      
      let topic = getTopic(q);
      // Clean up common topic prefixes or issues if any, but let's keep it simple
      if (topic.length > 50) topic = "Otros";
      
      const qObj = {
          id: `q${qIdCounter++}`,
          exam: file.replace('.json', ''),
          text: cleanString(q.pregunta || q.question),
          options: q.options || q.opciones || [],
          correct: q.correctAnswer || q.respuestaCorrecta || q.correct || '',
          explanation: cleanString(q.explanation || q.explicacion || 'No explanation provided.')
      };
      
      topicCounts[topic] = (topicCounts[topic] || 0) + 1;
      if (!questionsByTopic[topic]) questionsByTopic[topic] = [];
      questionsByTopic[topic].push(qObj);
  }
}

// Sort topics by frequency
const sortedTopics = Object.entries(topicCounts).sort((a, b) => b[1] - a[1]);

// We will only take the top 100 topics to prevent the PDF from being gigantically unreadable, 
// or maybe take topics with >= 2 questions.
const filteredTopics = sortedTopics.filter(t => t[1] >= 2); 

let md = `# EUNACOM: Análisis de Reconstrucciones\n\n`;

// PART 1: TOPICS AND SHORTCUTS
md += `## Parte 1: Temas Más Preguntados\n\n`;
md += `A continuación, se listan los temas más frecuentes extraídos de todas las reconstrucciones, con enlaces directos a las preguntas correspondientes.\n\n`;

for (const [topic, count] of filteredTopics) {
    const anchor = createAnchor(topic);
    md += `- [${topic}](#${anchor}) (${count} preguntas)\n`;
}

// PART 2: QUESTIONS BY TOPIC
md += `\n<div style="page-break-after: always;"></div>\n\n`;
md += `## Parte 2: Preguntas por Tema\n\n`;

for (const [topic, count] of filteredTopics) {
    const anchor = createAnchor(topic);
    md += `### ${topic} <a id="${anchor}"></a>\n\n`;
    
    const qs = questionsByTopic[topic];
    for (const q of qs) {
        md += `**Pregunta (${q.exam}) [Ir a la respuesta](#resp-${q.id})]**\n`;
        md += `${q.text}\n\n`;
        
        if (Array.isArray(q.options) && q.options.length > 0) {
            // handle both string array and object array {id, text}
            for (const opt of q.options) {
                if (typeof opt === 'string') {
                    md += `- ${opt}\n`;
                } else if (opt.id && opt.text) {
                    md += `- ${opt.id}: ${opt.text}\n`;
                }
            }
            md += `\n`;
        }
    }
}

// PART 3: ANSWERS AND EXPLANATIONS
md += `\n<div style="page-break-after: always;"></div>\n\n`;
md += `## Parte 3: Respuestas y Explicaciones\n\n`;

for (const [topic, count] of filteredTopics) {
    const qs = questionsByTopic[topic];
    for (const q of qs) {
        md += `### Respuesta a Pregunta de ${topic} (${q.exam}) <a id="resp-${q.id}"></a>\n\n`;
        md += `**Pregunta:** ${q.text.substring(0, 100)}...\n\n`;
        md += `**Respuesta Correcta:** ${q.correct}\n\n`;
        md += `**Explicación:**\n${q.explanation}\n\n`;
        md += `---\n\n`;
    }
}

fs.writeFileSync(path.join(__dirname, 'analisis_reconstrucciones.md'), md);
console.log('Markdown generated at scratch/analisis_reconstrucciones.md');
