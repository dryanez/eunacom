const fs = require('fs');
const masterData = JSON.parse(fs.readFileSync('../master_data_full.json', 'utf8'));

console.log("Capítulos y Subtópicos:");

for (let capKey in masterData.capitulos) {
    let cap = masterData.capitulos[capKey];
    console.log("- " + capKey); // The key is probably the title
    if (cap.sub_topics) {
        if (Array.isArray(cap.sub_topics)) {
            // Unlikely based on previous bug, but let's be safe
            cap.sub_topics.forEach(sub => console.log("  [A] " + sub.title));
        } else {
             for (let subKey in cap.sub_topics) {
                 console.log("  - " + subKey);
             }
        }
    }
}
