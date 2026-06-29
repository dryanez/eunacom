const fs = require('fs');
const data = JSON.parse(fs.readFileSync('/Users/felipeyanez/Desktop/NEWeunacom/eunacom-app-v2/public/data/reconstrucciones/topic_index.json'));
const sp = data.find(s => s.subject.toLowerCase().includes('salud'));
if (sp) {
    console.log("Found subject:", sp.subject);
    console.log("Total questions:", sp.total);
    console.log("First question ID:", sp.topics[0]?.questions[0]?.id);
} else {
    console.log("Not found. Available subjects:");
    console.log(data.map(s => s.subject));
}
