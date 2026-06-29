const fs = require('fs');
const path = require('path');

const reconsDir = path.join(__dirname, 'public', 'data', 'reconstrucciones');
const files = fs.readdirSync(reconsDir).filter(f => f.endsWith('.json') && !f.includes('index'));

let allRecons = [];

files.forEach(file => {
    const data = JSON.parse(fs.readFileSync(path.join(reconsDir, file), 'utf8'));
    
    // Parse year/month from filename or data
    let year = 0;
    let monthWeight = 0;
    
    // Extract year from filename, e.g., eunacom-dic-2024.json
    const match = file.match(/(\d{4})/);
    if (match) year = parseInt(match[1]);
    
    if (file.includes('dic')) monthWeight = 12;
    else if (file.includes('jul')) monthWeight = 7;
    else if (file.includes('ago')) monthWeight = 8;
    else if (file.includes('ene')) monthWeight = 1;
    
    // Filter questions
    const spQuestions = data.questions.filter(q => {
        const cat = (q.category || '').toLowerCase();
        const top = (q.topic || '').toLowerCase();
        return cat.includes('salud pública') || top.includes('salud pública') || cat.includes('salud publica') || top.includes('salud publica');
    });
    
    allRecons.push({
        file: file,
        name: data.title || file.replace('.json', '').replace(/-/g, ' ').toUpperCase(),
        year: year,
        monthWeight: monthWeight,
        questions: spQuestions
    });
});

// Sort from latest to earliest
allRecons.sort((a, b) => {
    if (b.year !== a.year) return b.year - a.year;
    return b.monthWeight - a.monthWeight;
});

// Generate Markdown
let md = `# Preguntas de Salud Pública por Reconstrucción\n\n`;

md += `## Resumen\n\n`;
let total = 0;
allRecons.forEach(r => {
    if (r.questions.length > 0) {
        md += `- **${r.name} (${r.year})**: ${r.questions.length} preguntas\n`;
        total += r.questions.length;
    }
});
md += `\n**Total:** ${total} preguntas\n\n`;
md += `---\n\n`;

allRecons.forEach(r => {
    if (r.questions.length === 0) return;
    
    md += `## ${r.name} (${r.year})\n\n`;
    
    r.questions.forEach((q, idx) => {
        md += `### Pregunta ${idx + 1}\n`;
        md += `${q.text}\n\n`;
        
        q.choices.forEach(c => {
            md += `- ${c.id}) ${c.text}\n`;
        });
        
        md += `\n**Respuesta correcta:** ${q.correctAnswer}\n`;
        if (q.explanation) {
            md += `\n**Explicación:** ${q.explanation}\n`;
        }
        md += `\n---\n\n`;
    });
});

fs.writeFileSync('salud_publica.md', md);
console.log('salud_publica.md generated successfully.');
