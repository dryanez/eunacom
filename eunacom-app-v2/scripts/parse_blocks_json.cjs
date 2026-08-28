const fs = require('fs');
const path = require('path');

const mdPath = path.join(__dirname, '..', '..', 'eunacom-master-curriculum', 'BLOQUES_CLINICOS_JERARQUICOS_EUNACOM_2026.md');
const md = fs.readFileSync(mdPath, 'utf8');

const modules = [];
let currentModule = null;
let currentSpecialty = null;
let currentBlock = null;

const lines = md.split('\n');

for (let line of lines) {
  line = line.trim();
  if (line.startsWith('# ') && line.includes('MÓDULO')) {
    currentModule = {
      name: line.replace('# ', '').trim(),
      specialties: []
    };
    modules.push(currentModule);
  } else if (line.startsWith('## ') && currentModule) {
    currentSpecialty = {
      name: line.replace('## ', '').trim(),
      blocks: []
    };
    currentModule.specialties.push(currentSpecialty);
  } else if (line.startsWith('### Bloque') && currentSpecialty) {
    currentBlock = {
      name: line.replace('### ', '').trim(),
      classes: []
    };
    currentSpecialty.blocks.push(currentBlock);
  } else if (line.startsWith('* **`') && currentBlock) {
    const parts = line.split(':');
    const id = line.substring(line.indexOf('`') + 1, line.indexOf('`', line.indexOf('`') + 1));
    const titleStart = line.indexOf('*', line.indexOf('`') + 3);
    const titleEnd = line.indexOf('*', titleStart + 1);
    const title = titleStart !== -1 && titleEnd !== -1 ? line.substring(titleStart + 1, titleEnd).trim() : '';
    const codeIdx = line.indexOf('Cód:');
    const codes = codeIdx !== -1 ? line.substring(codeIdx + 4).replace(/`/g, '').trim() : '';

    currentBlock.classes.push({
      id,
      title,
      codes,
      rawSummary: line
    });
  }
}

const outPath = path.join(__dirname, '..', '..', 'eunacom-master-curriculum', 'BLOQUES_CLINICOS_MASTER_CATALOG.json');
fs.writeFileSync(outPath, JSON.stringify(modules, null, 2), 'utf8');
console.log('Successfully generated BLOQUES_CLINICOS_MASTER_CATALOG.json with', modules.length, 'modules');
