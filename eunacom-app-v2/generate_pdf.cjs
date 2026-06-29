const fs = require('fs');
const PDFDocument = require('pdfkit');

const dataDir = '/Users/felipeyanez/Desktop/NEWeunacom/eunacom-app-v2/public/data/reconstrucciones';
const topicIndex = JSON.parse(fs.readFileSync(`${dataDir}/topic_index.json`));
const indexJson = JSON.parse(fs.readFileSync(`${dataDir}/index.json`));

const sp = topicIndex.find(s => s.subject.toLowerCase().includes('salud'));
if (!sp) {
    console.error("Salud Publica not found!");
    process.exit(1);
}

// Collect all question IDs for Salud Publica
const qIds = new Set();
sp.topics.forEach(t => {
    t.questions.forEach(q => {
        qIds.add(q.id);
    });
});

console.log(`Found ${qIds.size} Salud Publica questions.`);

// We need to map exam ID to year, month
const examInfo = {};
indexJson.exams.forEach(ex => {
    examInfo[ex.id] = ex;
});

// We want to sort exams from latest to earliest
// Year descending, then month descending (assume Jul is earlier than Dic, Ene is earlier than Jul)
const monthOrder = {
    'Enero': 1, 'Julio': 7, 'Agosto': 8, 'Diciembre': 12
};

const getExamDateScore = (exam) => {
    if (!exam) return 0;
    const m = monthOrder[exam.month] || 0;
    return exam.year * 100 + m;
};

// Now we need to read each exam file and find the questions that are in qIds
const questionsByExam = {};

indexJson.exams.forEach(ex => {
    const examFile = JSON.parse(fs.readFileSync(`${dataDir}/${ex.file}`));
    examFile.questions.forEach(q => {
        const fullQid = `${ex.id}_q${q.id}`;
        if (qIds.has(fullQid)) {
            if (!questionsByExam[ex.id]) {
                questionsByExam[ex.id] = [];
            }
            questionsByExam[ex.id].push(q);
        }
    });
});

const sortedExamIds = Object.keys(questionsByExam).sort((a, b) => {
    return getExamDateScore(examInfo[b]) - getExamDateScore(examInfo[a]);
});

// Create PDF
const doc = new PDFDocument({ margin: 50 });
doc.pipe(fs.createWriteStream('/Users/felipeyanez/.gemini/antigravity/brain/8fbf6583-737c-4c04-9fb1-4184c67d057c/salud_publica.pdf'));

doc.font('Helvetica-Bold').fontSize(20).text('Preguntas de Salud Pública', { align: 'center' });
doc.moveDown(0.5);
doc.fontSize(12).font('Helvetica').text(`Total de preguntas: ${qIds.size}`, { align: 'center' });
doc.moveDown(2);

sortedExamIds.forEach(examId => {
    const exam = examInfo[examId];
    const examQs = questionsByExam[examId];
    
    doc.font('Helvetica-Bold').fontSize(16).text(`${exam.name} (${examQs.length} preguntas)`, { underline: true });
    doc.moveDown(1);
    
    examQs.forEach((q, index) => {
        // Prevent widows/orphans by keeping question block somewhat together if possible, or just let it break naturally.
        doc.font('Helvetica-Bold').fontSize(12).text(`Pregunta ${index + 1}: `);
        doc.font('Helvetica').fontSize(11).text(q.question || q.pregunta);
        doc.moveDown(0.5);
        
        const options = q.options || q.opciones || [];
        const letters = ['a', 'b', 'c', 'd', 'e'];
        options.forEach((opt, i) => {
            const isCorrect = (q.correctAnswer || q.respuesta_correcta || q.respuestaCorrecta)?.toLowerCase() === letters[i];
            const prefix = isCorrect ? '[CORRECTA] ' : '';
            doc.font(isCorrect ? 'Helvetica-Bold' : 'Helvetica').fontSize(10).text(`  ${letters[i]}) ${prefix}${opt}`);
        });
        
        const explanation = q.explanation || q.explicacion || q.respuesta_texto;
        if (explanation) {
            doc.moveDown(0.5);
            doc.font('Helvetica-Oblique').fontSize(10).text(`Explicación: ${explanation}`, { color: 'grey' });
            doc.fillColor('black'); // reset
        }
        
        doc.moveDown(1.5);
    });
});

doc.end();
console.log("PDF generated!");
