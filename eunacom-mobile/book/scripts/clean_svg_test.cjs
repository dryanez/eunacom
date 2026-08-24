const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'generate-book', 'svg_diagrams');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.svg'));

files.forEach(f => {
  const content = fs.readFileSync(path.join(dir, f), 'utf8');
  console.log('\n================ ' + f + ' (First 35 lines) ================');
  const lines = content.split('\n');
  lines.slice(0, 30).forEach((l, idx) => {
    if (l.includes('ellipse') || l.includes('path') || l.includes('polygon') || l.includes('start')) {
      console.log(`L${idx+1}: ${l}`);
    }
  });
});
