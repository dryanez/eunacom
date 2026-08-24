const fs = require('fs');
const topicIndex = JSON.parse(fs.readFileSync('public/data/reconstrucciones/topic_index.json'));
const qToCategory = {};

function processQuestions(questions, subjectName, topicName) {
    if (!questions) return;
    questions.forEach(q => {
        qToCategory[q.id] = { subject: subjectName, topic: topicName };
    });
}

topicIndex.forEach(subj => {
    const subjectName = subj.subject || subj.name;
    
    if (subj.questions) {
        processQuestions(subj.questions, subjectName, 'General');
    }
    
    if (subj.topics) {
        subj.topics.forEach(top => {
            if (top.questions) {
                processQuestions(top.questions, subjectName, top.name);
            }
            if (top.subtopics) {
                top.subtopics.forEach(subtop => {
                    if (subtop.questions) {
                        processQuestions(subtop.questions, subjectName, top.name);
                    }
                });
            }
        });
    }
});

console.log("Total keys:", Object.keys(qToCategory).length);
