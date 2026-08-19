const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'generate-book', 'svg_diagrams');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.svg'));

console.log('SVG files:', files);

files.forEach(f => {
  const content = fs.readFileSync(path.join(dir, f), 'utf8');
  console.log('\n================ ' + f + ' ================');
  // Print elements with start dots or initial arrows
  const matches = content.match(/<ellipse[^>]*>/g) || [];
  console.log('Found ellipses in ' + f + ':', matches);
});
