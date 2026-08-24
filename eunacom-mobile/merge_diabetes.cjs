const fs = require('fs');
const path = require('path');

const srcDir = '/Volumes/Install macOS Sequoia/Eunacom/eunacom-app-v2';

// 1. Merge diabetes files
const oldDiabetesRaw = fs.readFileSync(path.join(srcDir, 'src/data/diabetes_questions.json'), 'utf-8');
const newDiabetesRaw = fs.readFileSync(path.join(srcDir, 'new_diabetes.json'), 'utf-8');

const oldDiabetes = JSON.parse(oldDiabetesRaw);
const newDiabetes = JSON.parse(newDiabetesRaw);

const combinedDiabetes = [...oldDiabetes, ...newDiabetes];
fs.writeFileSync(path.join(srcDir, 'src/data/diabetes_questions.json'), JSON.stringify(combinedDiabetes, null, 2));

console.log('Merged diabetes questions! Total: ' + combinedDiabetes.length);

// 2. Re-run formation
const respiratoryRaw = fs.readFileSync(path.join(srcDir, 'respiratory.json'), 'utf-8');
const respiratory = JSON.parse(respiratoryRaw);

let globalId = 1;

function processDataset(data, topic, category) {
    return data.map(item => {
        let formattedChoices = item.choices;
        if (typeof item.choices[0] === 'string') {
            formattedChoices = item.choices.map(c => {
                const match = c.match(/^([a-eA-E])\.(.*)$/);
                if (match) {
                    return { id: match[1].toUpperCase(), text: match[2].trim() };
                }
                return { id: c.charAt(0).toUpperCase(), text: c.substring(1).trim() };
            });
        }

        let correctId = item.correctAnswer;
        if (correctId.length > 1) { 
            const found = formattedChoices.find(c => c.text.toLowerCase().includes(correctId.toLowerCase()) || correctId.toLowerCase().includes(c.text.toLowerCase()));
            if (found) {
                correctId = found.id;
            } else {
                const match = item.correctAnswer.match(/^([a-eA-E])\.(.*)$/);
                if (match) {
                    correctId = match[1].toUpperCase();
                } else {
                     console.warn('Could not map correct answer for: ', item.question);
                }
            }
        }

        const cleanQuestion = item.question ? item.question.trim().replace(/^\d+\.\s*/, '') : '';

        return {
            id: globalId++,
            question: cleanQuestion,
            choices: formattedChoices,
            correctAnswer: correctId.toUpperCase(),
            explanation: item.explanation,
            topic: topic,
            category: category
        };
    });
}

const pDiabetes = processDataset(combinedDiabetes, 'Diabetes', 'Medicina Interna');
const pRespiratory = processDataset(respiratory, 'Respiratorio', 'Medicina Interna');

const unified = [...pDiabetes, ...pRespiratory];

fs.writeFileSync(path.join(srcDir, 'src/data/questionDB.json'), JSON.stringify(unified, null, 2));
console.log(`Saved ${unified.length} total questions to questionDB.json`);
