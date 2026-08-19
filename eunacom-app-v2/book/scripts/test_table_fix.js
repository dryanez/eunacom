const fs = require('fs');
const path = require('path');

const classes = JSON.parse(fs.readFileSync(path.join(__dirname, 'cardio_online_classes.json'), 'utf8'));

function convertMarkdownToHtml(markdown) {
  if (!markdown) return '';
  let text = markdown;

  // 1. Delete ALL internal Perfil callout blocks
  text = text.replace(/:::important\s*\n?[\s\S]*?(?:Perfil|Nivel de conocimiento|Código|Dx:|1\.0\d)[\s\S]*?:::/gi, '');
  text = text.replace(/^[\d\.]+\s*\|\s*[^|\n]+\s*\|\s*Dx:[^\n]+/gim, '');
  text = text.replace(/Perfil EUNACOM[\s\S]*?Seg:\s*\w+/gi, '');

  // 2. Parse Markdown Tables BEFORE ANY PARAGRAPH OR BLOCK SPLITTING!
  text = text.replace(/((?:^\|[^\n]+\|\r?\n)+)/gm, (match) => {
    const lines = match.trim().split(/\r?\n/).filter(l => l.trim().startsWith('|'));
    if (lines.length < 2) return match;

    let headers = [];
    let rows = [];

    lines.forEach((line) => {
      // Check if it's the separator line |---|---| or |:---|:---|
      if (/^\|[\s\-:]+(\|[\s\-:]+)+\|?$/.test(line.trim())) {
        return; // skip separator row
      }

      let cells = line.split('|').map(c => c.trim());
      if (cells[0] === '') cells.shift();
      if (cells[cells.length - 1] === '') cells.pop();

      if (headers.length === 0) {
        headers = cells;
      } else {
        rows.push(cells);
      }
    });

    if (headers.length === 0) return match;

    let html = '<table class="tbl"><thead><tr>';
    headers.forEach(h => html += `<th>${h}</th>`);
    html += '</tr></thead><tbody>';

    rows.forEach(r => {
      html += '<tr>';
      r.forEach(c => html += `<td>${c}</td>`);
      html += '</tr>';
    });

    html += '</tbody></table>';
    return html;
  });

  return text;
}

classes.slice(0, 5).forEach((c, idx) => {
  console.log(`\n=================== CLASS ${idx+1}: ${c.topic} ===================`);
  const res = convertMarkdownToHtml(c.article_content || '');
  const tables = res.match(/<table[\s\S]*?<\/table>/g);
  if (tables) {
    tables.forEach((t, i) => console.log(`--- Table ${i+1} ---\n${t}`));
  } else {
    console.log('No tables found');
  }
});
