const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'generate-book', 'svg_diagrams');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.svg'));

function cleanSvg(content) {
  let svg = content;
  // 1. Remove black start ellipse dot
  svg = svg.replace(/<ellipse[^>]+fill=["']#222222["'][^>]*\/>/gi, '');
  // 2. Remove initial line from y1="35" to y2="55"
  svg = svg.replace(/<line[^>]+y1=["']35["'][^>]+y2=["']55["'][^>]*\/>/gi, '');
  // 3. Remove initial arrow head polygon at y2="55"
  svg = svg.replace(/<polygon[^>]+points=["'][^"']*55[^"']*["'][^>]*\/>/gi, (match) => {
    // Only strip if it's near the top (y=45, y=55)
    if (match.includes('45') || match.includes('49')) return '';
    return match;
  });
  return svg;
}

files.forEach(f => {
  const content = fs.readFileSync(path.join(dir, f), 'utf8');
  const cleaned = cleanSvg(content);
  console.log(`File: ${f} | Original len: ${content.length} | Cleaned len: ${cleaned.length}`);
  const hasDot = cleaned.includes('ellipse') && cleaned.includes('#222222');
  console.log(`  Black dot present? ${hasDot}`);
});
