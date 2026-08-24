const fs = require('fs');

// 1. Load the active JSON files (with new format)
const diabetesDb = JSON.parse(fs.readFileSync('src/data/diabetes_questions.json', 'utf8'));
const respiratoryDb = JSON.parse(fs.readFileSync('respiratory.json', 'utf8'));
const hematologyDb = JSON.parse(fs.readFileSync('Hematologia.json', 'utf8'));

// Format base mapping: We must attach topic and category to these files
function processDataset(data, topic, category) {
    return data.map(item => {
        let formattedChoices = item.choices;
        if (formattedChoices && typeof formattedChoices[0] === 'string') {
            formattedChoices = formattedChoices.map(c => {
                const match = c.match(/^([a-eA-E])\.(.*)$/);
                if (match) {
                    return { id: match[1].toUpperCase(), text: match[2].trim() };
                }
                return { id: c.charAt(0).toUpperCase(), text: c.substring(1).trim() };
            });
        }

        let correctId = item.correctAnswer;
        if (correctId && correctId.length > 1) { 
            const found = formattedChoices.find(c => c.text.toLowerCase().includes(correctId.toLowerCase()) || correctId.toLowerCase().includes(c.text.toLowerCase()));
            if (found) {
                correctId = found.id;
            } else {
                const match = item.correctAnswer.match(/^([a-eA-E])\.(.*)$/);
                if (match) {
                    correctId = match[1].toUpperCase();
                } else {
                     correctId = 'A'; // fallback
                }
            }
        }

        const cleanQuestion = item.question ? item.question.trim().replace(/^\d+\.\s*/, '') : '';

        return {
            question: cleanQuestion,
            choices: formattedChoices || [],
            correctAnswer: correctId ? correctId.toUpperCase() : 'A',
            explanation: item.explanation,
            incorrectExplanations: null, // New questions don't have this separated yet
            topic: topic,
            category: category
        };
    });
}

const activeQs = [
    ...processDataset(diabetesDb, 'Diabetes', 'Medicina Interna'),
    ...processDataset(respiratoryDb, 'Respiratorio', 'Medicina Interna'),
    ...processDataset(hematologyDb, 'Hematología', 'Medicina Interna')
];

let globalId = 1;

function calculateSimilarity(str1, str2) {
    const words1 = str1.split(/\W+/).filter(w => w.length > 3);
    const words2 = str2.split(/\W+/).filter(w => w.length > 3);
    if (words1.length === 0 || words2.length === 0) return 0;
    let intersection = 0;
    const set2 = new Set(words2);
    words1.forEach(w => { if (set2.has(w)) intersection++; });
    return intersection / Math.min(words1.length, words2.length);
}

// 2. Load the Master Database
const masterData = JSON.parse(fs.readFileSync('../master_data_full.json', 'utf8'));

let oldExtracted = [];

function extractTargeted(obj) {
    if (!obj) return;
    if (Array.isArray(obj)) {
        obj.forEach(o => extractTargeted(o));
        return;
    }
    if (typeof obj === 'object') {
        if (obj.pregunta && typeof obj.pregunta === 'string') {
            let tags = (obj.tags || '').toLowerCase();
            let code = (obj.codigo_eunacom || '').toLowerCase();
            let isTarget = false;
            let assignedTopic = '';

            // Map old tags/codes to the 3 topics
            if (tags.includes('diabet') || code.includes('diabet') || tags.includes('endocrin') || code.includes('endocrin')) {
                // To be safe, let's only catch Diabetes if they are actually diabetes OR endocrinology.
                // Wait, if it's endocrinology but not diabetes, the topic should be Diabetes? 
                // The user's active JSON is called "diabetes_questions.json" but they said "per the topics we alreay have here are , diabtes trespiratoy...".
                // I will assign "Diabetes" to everything diabetes-related.
                if (tags.includes('diabet') || code.includes('diabet') || obj.pregunta.toLowerCase().includes('diabét')) {
                     isTarget = true; assignedTopic = 'Diabetes';
                }
            } 
            if (tags.includes('respiratorio') || tags.includes('bronco') || code.includes('respirat') || code.includes('bronco') || tags.includes('neumon') || tags.includes('asma') || tags.includes('epoc')) {
                isTarget = true; assignedTopic = 'Respiratorio';
            } 
            if (tags.includes('hematolog') || code.includes('hematolog') || tags.includes('anemia') || tags.includes('leucemia') || tags.includes('linfoma') || tags.includes('plaquet')) {
                isTarget = true; assignedTopic = 'Hematología';
            }

            if (isTarget) {
                oldExtracted.push({
                    rawItem: obj,
                    assignedTopic: assignedTopic
                });
            }
        }
        
        for (let key in obj) {
            if (!['pregunta', 'opcion_a', 'opcion_b', 'opcion_c', 'opcion_d', 'opcion_e', 'respuesta_correcta', 'explicacion_correcta', 'por_que_incorrectas', 'tags', 'codigo_eunacom', 'video_recomendado', 'numero'].includes(key)) {
                extractTargeted(obj[key]);
            }
        }
    }
}

console.log('Scanning master database for targeted topics...');
extractTargeted(masterData);

console.log(`Found ${oldExtracted.length} targeted questions in Master DB.`);

let newCount = 0;
let duplicatesCount = 0;

oldExtracted.forEach(oldPkg => {
    let q = oldPkg.rawItem;
    let cleanQ = q.pregunta.replace(/^\d+\.\s*/, '').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
    let lowerQ = cleanQ.toLowerCase();

    // Check against activeQs
    let isFound = activeQs.some(aq => {
        let aqLower = aq.question.toLowerCase();
        if (cleanQ.length > 50 && (aqLower.includes(cleanQ.substring(0, 50)) || lowerQ.includes(aqLower.substring(0, 50)))) return true;
        let sim = calculateSimilarity(lowerQ, aqLower);
        return sim > 0.8;
    });

    if (isFound) {
        duplicatesCount++;
    } else {
        newCount++;
        // Format to V2
        let choices = [
            { id: 'A', text: q.opcion_a },
            { id: 'B', text: q.opcion_b },
            { id: 'C', text: q.opcion_c },
            { id: 'D', text: q.opcion_d },
            { id: 'E', text: q.opcion_e }
        ].filter(c => c.text !== undefined && c.text !== null && c.text !== '');
        
        activeQs.push({
            question: cleanQ,
            choices: choices,
            correctAnswer: q.respuesta_correcta ? q.respuesta_correcta.toUpperCase() : "A",
            explanation: q.explicacion_correcta || "Sin explicación correcta especificada.",
            incorrectExplanations: q.por_que_incorrectas || null, // PRESERVES SEPARATION!
            topic: oldPkg.assignedTopic,
            category: 'Medicina Interna'
        });
    }
});

console.log(`Avoided ${duplicatesCount} duplicates.`);
console.log(`Added ${newCount} completely unique questions from V1.`);

// Assign IDs
activeQs.forEach(q => q.id = globalId++);

// Save
fs.writeFileSync('src/data/questionDB.json', JSON.stringify(activeQs, null, 2));
console.log(`Saved ${activeQs.length} total questions to questionDB.json`);
