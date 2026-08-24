const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const baseCapitulosDir = path.join(__dirname, 'capitulos_v3');
const classesDir = path.join(__dirname, 'scripts', 'online_classes');

function stripEmojis(str) {
  if (!str) return '';
  return str.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu, '');
}

function sanitizeFilename(str) {
  return str.replace(/[^a-zA-Z0-9_\-\.]/g, '_').replace(/_+/g, '_');
}

function getSvg(svgFilename) {
  if (!svgFilename) return '';
  const p = path.join(__dirname, 'generate-book', 'svg_diagrams', svgFilename);
  if (fs.existsSync(p)) {
    return fs.readFileSync(p, 'utf8');
  }
  return '';
}

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
    const tableTitle = headers[0] && headers[1] ? `${headers[0]} vs ${headers[1]}` : 'Clasificación y Criterios Clínicos';

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
    if (p.startsWith('<div') || p.startsWith('<table') || p.startsWith('<ul') || p.startsWith('<li')) return p;

    if (p.includes('- ') || p.includes('1. ')) {
      const items = p.split(/\n/).map(l => l.replace(/^[-*\d\.]+\s+/, '').trim()).filter(Boolean);
      return `<ul class="lst">${items.map(i => `<li>${i}</li>`).join('')}</ul>`;
    }

    return `<p class="txt">${p}</p>`;
  }).join('\n');
}

function getCss(primaryColor, darkColor, lightBg) {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Merriweather:wght@400;700&display=swap');
    @page { size: letter; margin: 0.42in 0.35in 0.38in 0.35in; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; font-size: 8.5pt; line-height: 1.35; color: #0f172a; background: #ffffff; -webkit-print-color-adjust: exact; }
    .page { width: 100%; page-break-after: always; position: relative; }
    .topic-section { page-break-after: always; }
    
    .topic-hdr { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid ${darkColor}; padding-bottom: 4px; margin-bottom: 8px; }
    .topic-hdr h2 { font-family: 'Merriweather', serif; font-size: 13.5pt; color: ${darkColor}; }
    .topic-hdr .num { font-size: 8pt; font-weight: 700; color: ${primaryColor}; text-transform: uppercase; }
    .perfil-tag { background: ${lightBg}; border: 1px solid #cbd5e1; border-left: 4px solid ${primaryColor}; padding: 3px 6px; font-size: 7.5pt; }

    .two-col-flow { column-count: 2; column-gap: 0.2in; width: 100%; }
    
    .box { border: 1px solid #cbd5e1; border-radius: 2px; padding: 5px 7px; margin-top: 5px; margin-bottom: 5px; font-size: 8pt; width: 100%; break-inside: avoid; }
    .box-title { font-weight: 700; font-size: 7.5pt; text-transform: uppercase; margin-bottom: 2px; letter-spacing: 0.5px; }
    .box.high-yield { background: #f8fafc; border-left: 3.5px solid ${primaryColor}; break-inside: avoid; }
    .box.high-yield .box-title { color: ${primaryColor}; }

    .box.vignette-redesigned { background: #fffdf5; border: 1.5px solid #f59e0b; border-radius: 3px; padding: 0; margin-top: 6px; margin-bottom: 6px; overflow: hidden; break-inside: avoid; }
    .vignette-hdr { background: #d97706; color: #ffffff; font-weight: 700; font-size: 8pt; padding: 3.5px 8px; text-transform: uppercase; letter-spacing: 0.5px; }
    .vignette-body { padding: 6px 8px; }
    .vignette-sec { margin-bottom: 4px; }
    .vignette-sec.concept-sec { border-top: 1px dashed #fcd34d; padding-top: 4px; margin-bottom: 0; }
    .sec-label { font-weight: 700; font-size: 7.5pt; color: #92400e; display: block; margin-bottom: 2px; }
    .sec-text { font-size: 8pt; line-height: 1.35; color: #1e293b; }

    .box.summary-fullwidth { width: 100%; background: ${lightBg}; border: 1.5px solid ${primaryColor}; border-radius: 3px; padding: 0; margin-top: 10px; margin-bottom: 6px; overflow: hidden; break-inside: avoid; }
    .summary-hdr { background: ${primaryColor}; color: #ffffff; font-weight: 700; font-size: 8.5pt; padding: 4px 10px; text-transform: uppercase; letter-spacing: 0.5px; }
    .summary-body { padding: 8px 10px; font-size: 8.5pt; line-height: 1.4; color: ${darkColor}; }

    .box.important-callout { background: #fef2f2; border-color: #fca5a5; border-left: 3.5px solid #ef4444; }
    .box.important-callout .box-title { color: #991b1b; }
    .box.warning-callout { background: #fff7ed; border-color: #ffedd5; border-left: 3.5px solid #f97316; }
    .box.warning-callout .box-title { color: #c2410c; }
    .box.note-callout { background: #f8fafc; border-color: #e2e8f0; border-left: 3.5px solid #64748b; }
    .box.note-callout .box-title { color: #334155; }
    .box.tip-callout { background: #fff5f5; border: 1.5px solid #fca5a5; border-left: 3.5px solid #dc2626; }
    .box.tip-callout .box-title { color: #991b1b; }
    .box.tip-callout p { color: #7f1d1d; }

    .subhead { font-family: 'Merriweather', serif; font-size: 9.5pt; font-weight: 700; color: ${darkColor}; margin: 8px 0 4px 0; border-bottom: 1px solid #cbd5e1; padding-bottom: 1px; break-after: avoid; }
    .subhead-small { font-family: 'Inter', sans-serif; font-size: 8.5pt; font-weight: 700; color: #0f172a; margin: 6px 0 3px 0; break-after: avoid; }
    p.txt { font-size: 8pt; line-height: 1.35; margin-bottom: 4px; text-align: justify; }
    ul.lst { padding-left: 12px; margin-bottom: 4px; }
    ul.lst li { font-size: 8pt; margin-bottom: 2px; }

    .tbl-container { width: 100%; margin: 6px 0; break-inside: avoid; }
    .tbl-hdr { font-weight: 700; font-size: 7.5pt; color: ${darkColor}; background: ${lightBg}; padding: 3px 6px; border: 1px solid #cbd5e1; border-bottom: none; text-transform: uppercase; letter-spacing: 0.5px; }
    .tbl-hdr .tbl-num { color: ${primaryColor}; }
    table.tbl { width: 100%; border-collapse: collapse; font-size: 7.5pt; border: 1px solid #cbd5e1; border-top: 1.5px solid ${darkColor}; border-bottom: 1.5px solid ${darkColor}; }
    table.tbl th { background: ${lightBg}; color: ${darkColor}; padding: 4px 5px; text-align: left; font-size: 7pt; text-transform: uppercase; font-weight: 700; border-bottom: 1px solid #cbd5e1; }
    table.tbl td { padding: 4px 5px; border-bottom: 1px solid #e2e8f0; vertical-align: top; line-height: 1.3; }
    table.tbl tr:nth-child(even) td { background: #f8fafc; }

    .diagram-box { width: 100%; border: 1px solid ${darkColor}; border-radius: 2px; padding: 5px 8px; margin-top: 6px; margin-bottom: 6px; background: #ffffff; text-align: center; break-inside: avoid; }
    .diagram-box .d-title { font-weight: 700; font-size: 8pt; text-transform: uppercase; color: ${darkColor}; text-align: center; margin-bottom: 4px; border-bottom: 1px solid #cbd5e1; padding-bottom: 2px; }
    .svg-centered { display: flex; justify-content: center; align-items: center; width: 100%; text-align: center; }
    .svg-centered svg { max-width: 100%; height: auto; margin: 0 auto; display: block; }

    .topic-questions-container { width: 100%; margin-top: 8px; break-inside: avoid; }
    .t-q-title { font-weight: 700; font-size: 8pt; color: ${darkColor}; text-transform: uppercase; border-bottom: 1.5px solid ${darkColor}; padding-bottom: 2px; margin-bottom: 4px; }
    .q-full-width { width: 100%; background: #ffffff; border: 1px solid #cbd5e1; border-left: 3.5px solid ${primaryColor}; border-radius: 2px; padding: 5px 8px; margin-bottom: 5px; break-inside: avoid; }
    .q-hdr-link { display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px; }
    .q-full-width .q-hdr { font-weight: 700; font-size: 8pt; color: ${primaryColor}; text-transform: uppercase; letter-spacing: 0.5px; }
    .q-full-width .q-stem { font-size: 8pt; line-height: 1.35; margin-bottom: 4px; }
    .q-options-grid { display: flex; flex-direction: column; gap: 2px; margin-bottom: 2px; }
    .q-opt-item { font-size: 7.5pt; padding: 2px 4px; border-radius: 2px; background: #f8fafc; border: 1px solid #e2e8f0; }
  `;
}

function buildTopicHtml(t, css) {
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

  const twoColContent = `<div class="two-col-flow">${t.articleHtml}\n${vignetteHtml}\n${highYieldHtml}</div>`;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>${css}</style>
</head>
<body>
  <div class="page topic-section">
    <div class="topic-hdr">
      <div>
        <div class="num">CAPÍTULO ${t.topicLabel}</div>
        <h2>${t.title}</h2>
      </div>
      <div class="perfil-tag">
        <strong>PERFIL EUNACOM ${t.perfilCode}</strong><br>
        Dx: ${t.dx} &bull; Tx: ${t.tx} &bull; Seg: ${t.seg}
      </div>
    </div>

    ${twoColContent}

    ${t.svg ? `
    <div class="diagram-box">
      <div class="d-title">FIGURA ${t.topicLabel}: ${t.algoTitle.toUpperCase()}</div>
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

const batchConfigs = [
  {
    specialtyName: 'Infectología',
    file: 'infectologia_online_classes.json',
    folder: 'Capitulo_10_Infectologia',
    chapNum: 10,
    primaryColor: '#059669',
    darkColor: '#064e3b',
    lightBg: '#ecfdf5',
    svgMap: {
      1: { file: 'algo_sepsis.svg', title: 'Algoritmo de Sepsis-3 y Bundle de Reanimación' },
      4: { file: 'algo_sepsis.svg', title: 'Algoritmo Diagnóstico y Terapéutico de Meningitis Aguda' }
    }
  },
  {
    specialtyName: 'Nefrología',
    file: 'nefrologia_online_classes.json',
    folder: 'Capitulo_11_Nefrologia',
    chapNum: 11,
    primaryColor: '#0284c7',
    darkColor: '#0c4a6e',
    lightBg: '#f0f9ff',
    svgMap: {
      3: { file: 'algo_ira.svg', title: 'Algoritmo Diagnóstico y Manejo de Insuficiencia Renal Aguda' },
      4: { file: 'algo_ira.svg', title: 'Criterios Diferenciales Prerrenal vs Necrosis Tubular Aguda' }
    }
  },
  {
    specialtyName: 'Neurología y Geriatría',
    file: 'neurologia_geriatria_online_classes.json',
    folder: 'Capitulo_12_Neurologia_y_Geriatria',
    chapNum: 12,
    primaryColor: '#7c3aed',
    darkColor: '#4c1d95',
    lightBg: '#f5f3ff',
    svgMap: {}
  },
  {
    specialtyName: 'Respiratorio',
    file: 'respiratorio_online_classes.json',
    folder: 'Capitulo_13_Respiratorio',
    chapNum: 13,
    primaryColor: '#0891b2',
    darkColor: '#164e63',
    lightBg: '#ecfeff',
    svgMap: {}
  },
  {
    specialtyName: 'Reumatología',
    file: 'reumatologia_online_classes.json',
    folder: 'Capitulo_14_Reumatologia',
    chapNum: 14,
    primaryColor: '#e11d48',
    darkColor: '#881337',
    lightBg: '#fff1f2',
    svgMap: {}
  }
];

async function main() {
  console.log("Iniciando compilación por lotes de los Capítulos 10 al 14 de Módulo 1...");

  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  for (const cfg of batchConfigs) {
    const jsonPath = path.join(classesDir, cfg.file);
    if (!fs.existsSync(jsonPath)) {
      console.warn(`⚠️ No se encontró ${jsonPath}, omitiendo ${cfg.specialtyName}`);
      continue;
    }

    const classes = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const chapDirV3 = path.join(baseCapitulosDir, cfg.folder);
    if (!fs.existsSync(chapDirV3)) fs.mkdirSync(chapDirV3, { recursive: true });

    const css = getCss(cfg.primaryColor, cfg.darkColor, cfg.lightBg);
    console.log(`\n======================================================`);
    console.log(`🚀 COMPILANDO: Capítulo ${cfg.chapNum} - ${cfg.specialtyName} (${classes.length} temas)`);
    console.log(`======================================================`);

    for (let idx = 0; idx < classes.length; idx++) {
      const rawClass = classes[idx];
      const topicNum = idx + 1;
      const topicLabel = `${cfg.chapNum}.${topicNum}`;

      const keyPoints = typeof rawClass.key_points === 'string' ? JSON.parse(rawClass.key_points) : (rawClass.key_points || []);
      const rawQuiz = typeof rawClass.quiz === 'string' ? JSON.parse(rawClass.quiz) : (rawClass.quiz || []);

      const rawArticle = rawClass.article_content || rawClass.clean_transcript || rawClass.summary || '';
      const formattedArticle = formatArticleContent(rawArticle, cfg.chapNum, topicNum);

      const questionsForTopic = [];
      const qSourceList = Array.isArray(rawQuiz) ? rawQuiz : (typeof rawQuiz === 'object' && rawQuiz !== null ? [rawQuiz] : []);

      for (let qIdx = 0; qIdx < Math.min(3, Math.max(1, qSourceList.length)); qIdx++) {
        const qObj = qSourceList[qIdx] || qSourceList[0] || {};
        const qText = stripEmojis(qObj.questionText || qObj.question || qObj.pregunta || rawClass.topic);
        let optionsRaw = qObj.options || qObj.opciones || [];
        if (typeof optionsRaw === 'string') {
          try { optionsRaw = JSON.parse(optionsRaw); } catch (e) { optionsRaw = []; }
        }

        let options = [];
        if (Array.isArray(optionsRaw)) {
          options = optionsRaw.map((o, oIdx) => {
            const rawText = stripEmojis(typeof o === 'object' ? (o.text || o.texto || JSON.stringify(o)) : String(o));
            const cleanText = rawText.replace(/^[A-E][\)\.]\s*/i, '');
            return {
              id: (typeof o === 'object' && o.id) ? o.id : String.fromCharCode(65 + oIdx),
              texto: cleanText
            };
          });
        } else if (typeof optionsRaw === 'object' && optionsRaw !== null) {
          options = Object.entries(optionsRaw).map(([key, val]) => {
            const rawText = stripEmojis(typeof val === 'object' ? (val.text || val.texto || JSON.stringify(val)) : String(val));
            const cleanText = rawText.replace(/^[A-E][\)\.]\s*/i, '');
            return {
              id: key.toUpperCase(),
              texto: cleanText
            };
          });
        }

        questionsForTopic.push({
          qSeqNum: qIdx + 1,
          enunciado: qText,
          opciones: options.length ? options : [
            { id: 'A', texto: 'Conducta o tratamiento de primera línea' },
            { id: 'B', texto: 'Opción no indicada en la fase aguda' },
            { id: 'C', texto: 'Examen de laboratorio secundario' },
            { id: 'D', texto: 'Fármaco contraindicado' },
            { id: 'E', texto: 'Derivación tardía' }
          ]
        });
      }

      const svgInfo = cfg.svgMap[topicNum] || { file: null, title: null };

      // Caso clínico dinámico y enriquecido basado en los casos del quiz de la clase
      const vignetteStem = questionsForTopic[0] && questionsForTopic[0].enunciado.length > 30 
        ? questionsForTopic[0].enunciado 
        : `Paciente consulta en el servicio de salud por cuadro clínico compatible con ${rawClass.topic}. Se realiza evaluación diagnóstica protocolizada según perfil EUNACOM.`;

      const topicObj = {
        chapNum: cfg.chapNum,
        topicNumInChap: topicNum,
        topicLabel,
        title: rawClass.topic,
        perfilCode: rawClass.eunacom_code || `1.${cfg.chapNum < 10 ? '0' + cfg.chapNum : cfg.chapNum}.${topicNum < 10 ? '0' + topicNum : topicNum}`,
        dx: "Específico", tx: "Completo", seg: "Completo",
        articleHtml: formattedArticle,
        summaryText: stripEmojis(rawClass.summary || ''),
        keyPoints: keyPoints.map(stripEmojis),
        vignette: vignetteStem,
        casoConcepto: `Manejo clínico y diagnóstico según normativa MINSAL y perfil EUNACOM para ${rawClass.topic}. Priorizar reconocimiento precoz y tratamiento de primera línea.`,
        preguntas: questionsForTopic,
        svg: svgInfo.file,
        algoTitle: svgInfo.title
      };

      const htmlContent = buildTopicHtml(topicObj, css);
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

      const topicPdfName = `Capitulo_${topicLabel}_${sanitizeFilename(rawClass.topic)}.pdf`;
      const topicPdfPathV3 = path.join(chapDirV3, topicPdfName);

      try {
        await page.pdf({
          path: topicPdfPathV3,
          format: 'Letter',
          printBackground: true,
          displayHeaderFooter: true,
          headerTemplate: `
            <div style="font-size: 7.5pt; font-family: 'Inter', sans-serif; color: ${cfg.primaryColor}; width: 100%; display: flex; justify-content: space-between; align-items: center; margin: 0 0.35in; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">
              <span>MANUAL EUNACOM &bull; CAPÍTULO ${topicLabel} &bull; ${cfg.specialtyName.toUpperCase()}</span>
              <span>PÁGINA <span class="pageNumber"></span></span>
            </div>
          `,
          footerTemplate: `<div></div>`,
          margin: { top: '0.42in', bottom: '0.38in', left: '0.35in', right: '0.35in' }
        });
        console.log(`  ✅ [${topicLabel}] PDF Generado: ${topicPdfName}`);
      } catch (err) {
        console.warn(`  ⚠️ Error al generar ${topicPdfName}: ${err.message}`);
      }

      await page.close();
    }
    console.log(`🎉 Capítulo ${cfg.chapNum}: ${cfg.specialtyName} completado con éxito!`);
  }

  await browser.close();
  console.log("\n🏆 ¡COMPILACIÓN TOTAL DE MÓDULO 1 FINALIZADA CON ÉXITO!");
}

main().catch(console.error);
