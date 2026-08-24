const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const baseCapitulosDir = path.join(__dirname, '..', 'capitulos_v3');
const onlineClasses = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'cardio_online_classes.json'), 'utf8'));
const bankRaw = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'public', 'data', 'pruebas', 'modulo-1-cardiologia.json'), 'utf8'));
const questionBank = Array.isArray(bankRaw) ? bankRaw : (bankRaw.pruebas || []);

function stripEmojis(str) {
  if (!str) return '';
  return str.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu, '');
}

function sanitizeFilename(str) {
  return str.replace(/[^a-zA-Z0-9_\-\.]/g, '_').replace(/_+/g, '_');
}

function getSvg(svgFilename) {
  if (!svgFilename) return '';
  const p = path.join(__dirname, '..', 'generate-book', 'svg_diagrams', svgFilename);
  if (fs.existsSync(p)) {
    let svg = fs.readFileSync(p, 'utf8');

    svg = svg.replace(/<ellipse[^>]+fill=["']#222222["'][^>]*\/>/gi, '');
    svg = svg.replace(/<line[^>]+y1=["']35["'][^>]+y2=["']55["'][^>]*\/>/gi, '');
    svg = svg.replace(/<polygon[^>]+points=["'][\^"']*55[\^"']*["'][^>]*\/>/gi, (match) => {
      if (match.includes('45') || match.includes('49')) return '';
      return match;
    });

    if (svg.includes('viewBox="0 0 743 435"')) {
      svg = svg.replace('viewBox="0 0 743 435"', 'viewBox="0 42 743 320"');
      svg = svg.replace('height="435px"', 'height="240px"');
      svg = svg.replace('style="width:743px;height:435px;', 'style="width:743px;height:240px;');
    }
    return svg;
  }
  return '';
}

function getUserPngBase64(imgFilename) {
  if (!imgFilename) return '';
  const p = path.join(__dirname, '..', 'figuras_galeria', imgFilename);
  if (fs.existsSync(p)) {
    const buf = fs.readFileSync(p);
    return `data:image/png;base64,${buf.toString('base64')}`;
  }
  return '';
}

// ONLY THE SPECIFIC CHAPTERS THAT NEED AN UPDATE
const targetTopicDefinitions = [
  { 
    chapNum: 1, topicNum: 4, classIdx: 3, svg: 'algo_bav.svg', 
    multiFigs: [
      { file: 'figura_bloqueo_av_1er_grado.png', title: 'FIGURA 1.4A: RITMO SINUSAL CON BLOQUEO AV DE 1er GRADO' },
      { file: 'figura_bloqueo_av_2do_grado_mobitz_1_wenckebach.png', title: 'FIGURA 1.4B: BLOQUEO AV DE 2º GRADO MOBITZ TIPO I (FENÓMENO DE WENCKEBACH)' },
      { file: 'figura_bloqueo_av_2do_grado_mobitz_2.png', title: 'FIGURA 1.4C: BLOQUEO AV DE 2º GRADO MOBITZ TIPO II (CONDUCCIÓN 2:1 A 3:1)' },
      { file: 'figura_bloqueo_av_3er_grado_completo.png', title: 'FIGURA 1.4D: BLOQUEO AV COMPLETO DE 3er GRADO (DISOCIACIÓN AV TOTAL)' }
    ],
    algoTitle: 'Algoritmo Diagnóstico y Terapéutico de Bloqueos AV', 
    folder: 'Capitulo_1_Arritmias_y_Emergencias' 
  },
  { 
    chapNum: 1, topicNum: 13, classIdx: 12, svg: 'algo_tv.svg', 
    multiFigs: [
      { file: 'figura_taquicardia_ventricular_monomorfica.png', title: 'FIGURA 1.13A: TAQUICARDIA VENTRICULAR MONOMÓRFICA (QRS ANCHO REGULAR)' },
      { file: 'figura_torsades_de_pointes.png', title: 'FIGURA 1.13B: TAQUICARDIA VENTRICULAR POLIMÓRFA (TORSADES DE POINTES)' }
    ],
    algoTitle: 'Algoritmo de Taquicardia de QRS Ancho', 
    folder: 'Capitulo_1_Arritmias_y_Emergencias' 
  }
];

const customVignettesMap = {
  4: { vignette: "Hombre de 78 años consulta por astenia severa y síncope de esfuerzo. El ECG demuestra disociación AV completa con QRS anchos a 32 cpm.", explicacion: "El Bloqueo AV de 3er Grado se caracteriza por disociación AV total. En inestabilidad, Atropina 1 mg EV es medida puente inicial; el tratamiento definitivo es Marcapaso." },
  13: { vignette: "Hombre de 60 años con infarto previo presenta taquicardia regular de QRS ancho (0.16s) a 160 lpm.", explicacion: "Toda taquicardia de QRS ancho debe manejarse como TV hasta demostrar lo contrario. Amiodarona 150 mg EV o cardioversión eléctrica si inestable." }
};

function formatArticleContent(text, chapNum, topicNumInChap) {
  if (!text) return '';
  let html = stripEmojis(text);

  html = html.replace(/:::important\s*\n?[\s\S]*?(?:Perfil|Nivel de conocimiento|Código|Dx:|1\.0\d)[\s\S]*?:::/gi, '');
  html = html.replace(/^[\d\.]+\s*\|\s*[^|\n]+\s*\|\s*Dx:[^\n]+/gim, '');
  html = html.replace(/Perfil EUNACOM[\s\S]*?Seg:\s*\w+/gi, '');
  html = html.replace(/^[ \t]*---+[ \t]*$/gim, '');

  let tableCount = 0;
  html = html.replace(/(?:^[ \t]*\|[^\n]+\|[ \t]*\r?\n){2,}/gm, (match) => {
    tableCount++;
    const lines = match.trim().split(/\r?\n/).filter(l => l.includes('|'));
    if (lines.length < 2) return match;

    let headers = [];
    let rows = [];

    lines.forEach((line) => {
      if (/^[ \t]*\|[\s\-:]+(\|[\s\-:]+)+\|?[ \t]*$/.test(line.trim())) return;
      let cells = line.split('|').map(c => c.trim());
      if (cells[0] === '') cells.shift();
      if (cells[cells.length - 1] === '') cells.pop();

      if (headers.length === 0) headers = cells;
      else rows.push(cells);
    });

    if (headers.length === 0) return match;

    const tableLabel = `TABLA ${chapNum}.${topicNumInChap}.${tableCount}`;
    const tableTitle = headers[0] && headers[1] ? `${headers[0]} vs ${headers[1]}` : 'Clasificación y Criterios';

    if (match.includes('Cumarínicos') || match.includes('NACOs') || headers.length >= 4) {
      let fullTbl = `__BREAK_COL_START__<div class="full-width-tbl-block"><div class="tbl-hdr"><span class="tbl-num">${tableLabel}</span>: ${tableTitle}</div><table class="tbl full-width-tbl"><thead><tr>`;
      headers.forEach(h => fullTbl += `<th>${h}</th>`);
      fullTbl += '</tr></thead><tbody>';
      rows.forEach(r => {
        fullTbl += '<tr>';
        r.forEach(c => fullTbl += `<td>${c}</td>`);
        fullTbl += '</tr>';
      });
      fullTbl += '</tbody></table></div>__BREAK_COL_END__';
      return fullTbl;
    }

    let tableHtml = `<div class="tbl-container"><div class="tbl-hdr"><span class="tbl-num">${tableLabel}</span>: ${tableTitle}</div><table class="tbl"><thead><tr>`;
    headers.forEach(h => tableHtml += `<th>${h}</th>`);
    tableHtml += '</tr></thead><tbody>';
    rows.forEach(r => {
      tableHtml += '<tr>';
      r.forEach(c => tableHtml += `<td>${c}</td>`);
      tableHtml += '</tr>';
    });
    tableHtml += '</tbody></table></div>';
    return tableHtml;
  });

  html = html.replace(/:::important\n?([\s\S]*?):::/g, '<div class="box important-callout"><div class="box-title">EUNACOM CRITERIOS</div><p>$1</p></div>');
  html = html.replace(/:::note\n?([\s\S]*?):::/g, '<div class="box note-callout"><div class="box-title">NOTA CLÍNICA</div><p>$1</p></div>');
  html = html.replace(/:::warning\n?([\s\S]*?):::/g, '<div class="box warning-callout"><div class="box-title">ADVERTENCIA Y PRECAUCIÓN</div><p>$1</p></div>');
  html = html.replace(/:::tip\n?([\s\S]*?):::/g, '<div class="box tip-callout"><div class="box-title">PERLA CLÍNICA EUNACOM</div><p>$1</p></div>');

  html = html.replace(/\[\[([^\]]+)\]\]/g, '<strong>$1</strong>');
  html = html.replace(/---/g, '');

  html = html.replace(/^## (.*$)/gim, '<div class="subhead">$1</div>');
  html = html.replace(/^### (.*$)/gim, '<div class="subhead-small">$1</div>');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  const rawParagraphs = html.split(/\n\n+/);
  return rawParagraphs.map(p => {
    p = p.trim();
    if (!p) return '';
    if (p.includes('__BREAK_COL_START__')) return p;
    if (p.startsWith('<div') || p.startsWith('<table') || p.startsWith('<ul') || p.startsWith('<li')) return p;

    if (p.includes('- ') || p.includes('1. ')) {
      const items = p.split(/\n/).map(l => l.replace(/^[-*\d\.]+\s+/, '').trim()).filter(Boolean);
      return `<ul class="lst">${items.map(i => `<li>${i}</li>`).join('')}</ul>`;
    }

    return `<p class="txt">${p}</p>`;
  }).join('\n');
}

const baseCss = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Merriweather:wght@400;700&display=swap');
  @page { size: letter; margin: 0.42in 0.35in 0.38in 0.35in; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; font-size: 8.5pt; line-height: 1.35; color: #0f172a; background: #ffffff; -webkit-print-color-adjust: exact; }
  .page { width: 100%; page-break-after: always; position: relative; }
  .topic-section { page-break-after: always; }
  
  .topic-hdr { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1e3a8a; padding-bottom: 4px; margin-bottom: 8px; }
  .topic-hdr h2 { font-family: 'Merriweather', serif; font-size: 13.5pt; color: #1e3a8a; }
  .topic-hdr .num { font-size: 8pt; font-weight: 700; color: #2563eb; text-transform: uppercase; }
  .perfil-tag { background: #f1f5f9; border: 1px solid #cbd5e1; border-left: 4px solid #1e3a8a; padding: 3px 6px; font-size: 7.5pt; }

  .two-col-flow { column-count: 2; column-gap: 0.2in; width: 100%; }
  
  .box { border: 1px solid #cbd5e1; border-radius: 2px; padding: 5px 7px; margin-top: 5px; margin-bottom: 5px; font-size: 8pt; width: 100%; break-inside: avoid; }
  .box-title { font-weight: 700; font-size: 7.5pt; text-transform: uppercase; margin-bottom: 2px; letter-spacing: 0.5px; }
  .box.high-yield { background: #f8fafc; border-left: 3.5px solid #1e3a8a; break-inside: avoid; }
  .box.high-yield .box-title { color: #1e3a8a; }

  .box.vignette-redesigned { background: #fffdf5; border: 1.5px solid #f59e0b; border-radius: 3px; padding: 0; margin-top: 6px; margin-bottom: 6px; overflow: hidden; break-inside: avoid; }
  .vignette-hdr { background: #d97706; color: #ffffff; font-weight: 700; font-size: 8pt; padding: 3.5px 8px; text-transform: uppercase; letter-spacing: 0.5px; }
  .vignette-body { padding: 6px 8px; }
  .vignette-sec { margin-bottom: 4px; }
  .vignette-sec.concept-sec { border-top: 1px dashed #fcd34d; padding-top: 4px; margin-bottom: 0; }
  .sec-label { font-weight: 700; font-size: 7.5pt; color: #92400e; display: block; margin-bottom: 2px; }
  .sec-text { font-size: 8pt; line-height: 1.35; color: #1e293b; }

  .box.summary-fullwidth { width: 100%; background: #f0f9ff; border: 1.5px solid #0284c7; border-radius: 3px; padding: 0; margin-top: 10px; margin-bottom: 6px; overflow: hidden; break-inside: avoid; }
  .summary-hdr { background: #0284c7; color: #ffffff; font-weight: 700; font-size: 8.5pt; padding: 4px 10px; text-transform: uppercase; letter-spacing: 0.5px; }
  .summary-body { padding: 8px 10px; font-size: 8.5pt; line-height: 1.4; color: #0369a1; }

  .box.important-callout { background: #fef2f2; border-color: #fca5a5; border-left: 3.5px solid #ef4444; }
  .box.important-callout .box-title { color: #991b1b; }
  .box.warning-callout { background: #fff7ed; border-color: #ffedd5; border-left: 3.5px solid #f97316; }
  .box.warning-callout .box-title { color: #c2410c; }
  .box.note-callout { background: #f8fafc; border-color: #e2e8f0; border-left: 3.5px solid #64748b; }
  .box.note-callout .box-title { color: #334155; }
  .box.tip-callout { background: #fff5f5; border: 1.5px solid #fca5a5; border-left: 3.5px solid #dc2626; }
  .box.tip-callout .box-title { color: #991b1b; }
  .box.tip-callout p { color: #7f1d1d; }

  .subhead { font-family: 'Merriweather', serif; font-size: 9.5pt; font-weight: 700; color: #1e3a8a; margin: 8px 0 4px 0; border-bottom: 1px solid #cbd5e1; padding-bottom: 1px; break-after: avoid; }
  .subhead-small { font-family: 'Inter', sans-serif; font-size: 8.5pt; font-weight: 700; color: #0f172a; margin: 6px 0 3px 0; break-after: avoid; }
  p.txt { font-size: 8pt; line-height: 1.35; margin-bottom: 4px; text-align: justify; }
  ul.lst { padding-left: 12px; margin-bottom: 4px; }
  ul.lst li { font-size: 8pt; margin-bottom: 2px; }

  .tbl-container { width: 100%; margin: 6px 0; break-inside: avoid; }
  .tbl-hdr { font-weight: 700; font-size: 7.5pt; color: #1e3a8a; background: #f1f5f9; padding: 3px 6px; border: 1px solid #cbd5e1; border-bottom: none; text-transform: uppercase; letter-spacing: 0.5px; }
  .tbl-hdr .tbl-num { color: #2563eb; }
  table.tbl { width: 100%; border-collapse: collapse; font-size: 7.5pt; border: 1px solid #cbd5e1; border-top: 1.5px solid #1e3a8a; border-bottom: 1.5px solid #1e3a8a; }
  table.tbl th { background: #f1f5f9; color: #1e3a8a; padding: 4px 5px; text-align: left; font-size: 7pt; text-transform: uppercase; font-weight: 700; border-bottom: 1px solid #cbd5e1; }
  table.tbl td { padding: 4px 5px; border-bottom: 1px solid #e2e8f0; vertical-align: top; line-height: 1.3; }
  table.tbl tr:nth-child(even) td { background: #f8fafc; }
  .full-width-tbl-block { width: 100%; margin: 8px 0; break-inside: avoid; }

  .diagram-box { width: 100%; border: 1px solid #1e3a8a; border-radius: 2px; padding: 5px 8px; margin-top: 6px; margin-bottom: 6px; background: #ffffff; text-align: center; break-inside: avoid; }
  .diagram-box .d-title { font-weight: 700; font-size: 8pt; text-transform: uppercase; color: #1e3a8a; text-align: center; margin-bottom: 4px; border-bottom: 1px solid #cbd5e1; padding-bottom: 2px; }
  .svg-centered { display: flex; justify-content: center; align-items: center; width: 100%; text-align: center; }
  .svg-centered svg { max-width: 100%; height: auto; margin: 0 auto; display: block; }

  .ecg-strip-img { max-width: 100%; max-height: 220px; border-radius: 2px; margin: 4px auto; display: block; border: 1px solid #cbd5e1; object-fit: contain; }

  .topic-questions-container { width: 100%; margin-top: 8px; break-inside: avoid; }
  .t-q-title { font-weight: 700; font-size: 8pt; color: #1e3a8a; text-transform: uppercase; border-bottom: 1.5px solid #1e3a8a; padding-bottom: 2px; margin-bottom: 4px; }
  .q-full-width { width: 100%; background: #ffffff; border: 1px solid #cbd5e1; border-left: 3.5px solid #2563eb; border-radius: 2px; padding: 5px 8px; margin-bottom: 5px; break-inside: avoid; }
  .q-hdr-link { display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px; }
  .q-full-width .q-hdr { font-weight: 700; font-size: 8pt; color: #2563eb; text-transform: uppercase; letter-spacing: 0.5px; }
  .q-full-width .q-stem { font-size: 8pt; line-height: 1.35; margin-bottom: 4px; }
  .q-options-grid { display: flex; flex-direction: column; gap: 2px; margin-bottom: 2px; }
  .q-opt-item { font-size: 7.5pt; padding: 2px 4px; border-radius: 2px; background: #f8fafc; border: 1px solid #e2e8f0; }
`;

function buildTopicHtml(t) {
  const vignetteHtml = `
    <div class="box vignette-redesigned">
      <div class="vignette-hdr">CASO CLÍNICO TIPO EUNACOM</div>
      <div class="vignette-body">
        <div class="vignette-sec">
          <span class="sec-label">ESCENARIO CLÍNICO TÍPICO:</span>
          <p class="sec-text">"${t.vignette}"</p>
        </div>
        <div class="vignette-sec concept-sec">
          <span class="sec-label">EXPLICACIÓN CLÍNICA DETALLADA:</span>
          <p class="sec-text">${t.casoConcepto}</p>
        </div>
      </div>
    </div>
  `;

  const highYieldHtml = `
    <div class="box high-yield">
      <div class="box-title">Puntos Clave Destacados</div>
      <ul class="lst">
        ${(t.keyPoints || []).map(p => `<li>${p}</li>`).join('')}
      </ul>
    </div>
  `;

  let twoColContent = `${t.articleHtml}\n${vignetteHtml}\n${highYieldHtml}`;

  if (twoColContent.includes('__BREAK_COL_START__')) {
    const parts = twoColContent.split('__BREAK_COL_START__');
    const part1 = parts[0];
    const rest = parts[1].split('__BREAK_COL_END__');
    const tableBlock = rest[0];
    const part2 = rest[1];

    twoColContent = `<div class="two-col-flow">${part1}</div>${tableBlock}<div class="two-col-flow">${part2}</div>`;
  } else {
    twoColContent = `<div class="two-col-flow">${twoColContent}</div>`;
  }

  let multiFigsHtml = '';
  if (t.multiFigs && t.multiFigs.length > 0) {
    t.multiFigs.forEach((mf) => {
      const src = getUserPngBase64(mf.file);
      if (src) {
        multiFigsHtml += `
          <div class="diagram-box">
            <div class="d-title">${mf.title}</div>
            <img src="${src}" class="ecg-strip-img" alt="${mf.title}" />
          </div>
        `;
      }
    });
  }

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>${baseCss}</style>
</head>
<body>
  <div class="page topic-section">
    <div class="topic-hdr">
      <div>
        <div class="num">CAPÍTULO ${t.topicLabel}</div>
        ` + '<h2>' + t.title + '</h2>' + `
      </div>
      <div class="perfil-tag">
        <strong>PERFIL EUNACOM ${t.perfilCode}</strong><br>
        Dx: ${t.dx} &bull; Tx: ${t.tx} &bull; Seg: ${t.seg}
      </div>
    </div>

    ${twoColContent}
    ${multiFigsHtml}

    ${t.svg ? `
    <div class="diagram-box">
      <div class="d-title">FIGURA ${t.topicLabel}B: ${t.algoTitle.toUpperCase()}</div>
      <div class="svg-centered">
        ${getSvg(t.svg)}
      </div>
    </div>
    ` : ''}

    <div class="topic-questions-container">
      <div class="t-q-title">EVALUACIÓN DE CLASE Y PREGUNTAS TIPO EUNACOM (${t.title})</div>
      ${t.preguntas.map(q => `
        <div class="q-full-width">
          <div class="q-hdr-link">
            <span class="q-hdr">PREGUNTA ${q.qSeqNum}</span>
          </div>
          <div class="q-stem">${q.enunciado}</div>
          <div class="q-options-grid">
            ${q.opciones.map(o => `
              <div class="q-opt-item">
                <strong>${o.id})</strong> ${o.texto}
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </div>

    <div class="box summary-fullwidth">
      <div class="summary-hdr">RESUMEN: ${t.title.toUpperCase()}</div>
      <div class="summary-body">
        <p>${t.summaryText}</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

async function main() {
  console.log(`Actualizando ÚNICAMENTE los 2 capítulos modificados (Capítulo 1.4 y 1.13)...`);

  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  for (const tDef of targetTopicDefinitions) {
    const chapDirV3 = path.join(baseCapitulosDir, tDef.folder);
    if (!fs.existsSync(chapDirV3)) fs.mkdirSync(chapDirV3, { recursive: true });

    const rawClass = onlineClasses[tDef.classIdx];
    const topicLabel = `${tDef.chapNum}.${tDef.topicNum}`;

    const keyPoints = typeof rawClass.key_points === 'string' ? JSON.parse(rawClass.key_points) : (rawClass.key_points || []);
    const rawQuiz = typeof rawClass.quiz === 'string' ? JSON.parse(rawClass.quiz) : (rawClass.quiz || []);

    const rawArticle = rawClass.article_content || rawClass.clean_transcript || rawClass.summary || '';
    const formattedArticle = formatArticleContent(rawArticle, tDef.chapNum, tDef.topicNum);

    const questionsForTopic = [];
    const qSourceList = [...rawQuiz];

    for (let qIdx = 0; qIdx < Math.min(3, Math.max(1, qSourceList.length)); qIdx++) {
      const qObj = qSourceList[qIdx] || qSourceList[0] || {};
      const qText = stripEmojis(qObj.questionText || qObj.pregunta || rawClass.topic);
      const optionsRaw = qObj.options || qObj.opciones || [];

      const options = optionsRaw.map((o, oIdx) => {
        const rawText = stripEmojis(o.text || o.texto || o);
        const cleanText = rawText.replace(/^[A-E][\)\.]\s*/i, '');
        return {
          id: o.id || String.fromCharCode(65 + oIdx),
          texto: cleanText
        };
      });

      questionsForTopic.push({
        qSeqNum: qIdx + 1,
        enunciado: qText,
        opciones: options.length ? options : [
          { id: 'A', texto: 'Conducta o tratamiento de primera línea' },
          { id: 'B', texto: 'Opción no indicada en urgencias' },
          { id: 'C', texto: 'Examen de laboratorio secundario' },
          { id: 'D', texto: 'Fármaco contraindicado en la fase aguda' },
          { id: 'E', texto: 'Derivación o manejo tardío' }
        ]
      });
    }

    const richCasoData = customVignettesMap[tDef.classIdx + 1] || {
      vignette: questionsForTopic[0].enunciado,
      explicacion: "Manejo clínico según protocolo de urgencia EUNACOM."
    };

    const topicObj = {
      chapNum: tDef.chapNum,
      topicNumInChap: tDef.topicNum,
      topicLabel,
      title: rawClass.topic,
      perfilCode: rawClass.eunacom_code || `${tDef.chapNum}.01.${tDef.topicNum < 10 ? '0' + tDef.topicNum : tDef.topicNum}`,
      dx: "Específico", tx: "Inicial", seg: "Derivar",
      articleHtml: formattedArticle,
      summaryText: stripEmojis(rawClass.summary || ''),
      keyPoints: keyPoints.map(stripEmojis),
      vignette: richCasoData.vignette,
      casoConcepto: richCasoData.explicacion,
      preguntas: questionsForTopic,
      svg: tDef.svg,
      multiFigs: tDef.multiFigs,
      algoTitle: tDef.algoTitle
    };

    const htmlContent = buildTopicHtml(topicObj);
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const topicPdfName = `Capitulo_${topicLabel}_${sanitizeFilename(rawClass.topic)}.pdf`;
    const topicPdfPathV3 = path.join(chapDirV3, topicPdfName);

    await page.pdf({
      path: topicPdfPathV3,
      format: 'Letter',
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size: 7.5pt; font-family: 'Inter', sans-serif; color: #64748b; width: 100%; display: flex; justify-content: space-between; align-items: center; margin: 0 0.35in; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">
          <span>MANUAL EUNACOM &bull; CAPÍTULO ${topicLabel}</span>
          <span>PÁGINA <span class="pageNumber"></span></span>
        </div>
      `,
      footerTemplate: `<div></div>`,
      margin: { top: '0.42in', bottom: '0.38in', left: '0.35in', right: '0.35in' }
    });
    console.log(`  ✅ [${topicLabel}] PDF Actualizado: ${topicPdfName}`);
    await page.close();
  }

  await browser.close();
  console.log(`\n¡LISTO! Se actualizaron ÚNICAMENTE los 2 capítulos requeridos.`);
}

main().catch(console.error);
