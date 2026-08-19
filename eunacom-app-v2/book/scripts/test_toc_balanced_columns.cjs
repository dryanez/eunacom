const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const outputPdfPath = path.join(__dirname, 'test_toc_balanced_columns.pdf');
const onlineClasses = JSON.parse(fs.readFileSync(path.join(__dirname, 'cardio_online_classes.json'), 'utf8'));

const chapterDefinitions = [
  { chapNum: 1, title: 'Arritmias y Emergencias Cardiovasculares', indices: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] },
  { chapNum: 2, title: 'Cardiopatía Coronaria y Síndrome Coronario Agudo', indices: [14, 15, 16, 17, 18, 19, 20, 21, 24] },
  { chapNum: 3, title: 'Insuficiencia Cardíaca, Miocardiopatías y Shock', indices: [22, 23, 25, 29, 35] },
  { chapNum: 4, title: 'Valvulopatías, Miopericardio y Cardiopatías Congénitas', indices: [26, 27, 28, 30, 31, 32, 33, 34, 36, 37] },
  { chapNum: 5, title: 'Patología Vascular Periférica y Tromboembólica', indices: [38, 39, 40, 41, 42, 43, 44, 45, 46] }
];

const orderedTopics = [];
chapterDefinitions.forEach(cDef => {
  cDef.indices.forEach((classIdx, itemChapIdx) => {
    const rawClass = onlineClasses[classIdx];
    orderedTopics.push({
      rawClass,
      chapNum: cDef.chapNum,
      chapTitle: cDef.title,
      topicNumInChap: itemChapIdx + 1,
      topicLabel: `${cDef.chapNum}.${itemChapIdx + 1}`
    });
  });
});

let estPage = 3;
const topics = orderedTopics.map((item) => {
  const startP = estPage;
  estPage += 3;
  return {
    ...item,
    startPage: startP
  };
});

// Separate into explicit Left Column (Chaps 1, 2, 3) and Right Column (Chaps 4, 5, Solucionario)
const leftChaps = [1, 2, 3];
const rightChaps = [4, 5];

function generateTocHtml() {
  let html = `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Merriweather:wght@700&display=swap');
      @page { size: letter; margin: 0.42in 0.35in 0.38in 0.35in; }
      body { font-family: 'Inter', sans-serif; color: #0f172a; background: #fff; -webkit-print-color-adjust: exact; }
      
      .toc-container { width: 100%; }
      .toc-header { border-bottom: 2px solid #1e3a8a; padding-bottom: 4px; margin-bottom: 10px; }
      .toc-header h1 { font-family: 'Merriweather', serif; font-size: 16pt; color: #1e3a8a; text-transform: uppercase; letter-spacing: 0.5px; margin: 0; }
      .toc-header p { font-size: 8.5pt; color: #475569; margin-top: 2px; }

      /* EXPLICIT 2-COLUMN FLEX GRID PREVENTING UNWANTED EARLY COLUMN BREAKS */
      .toc-flex-grid {
        display: flex;
        justify-content: space-between;
        width: 100%;
        gap: 0.35in;
      }
      .toc-col {
        width: 48%;
        display: flex;
        flex-direction: column;
      }

      .toc-chap-title {
        font-family: 'Merriweather', serif;
        font-size: 8.5pt;
        font-weight: 700;
        color: #1e3a8a;
        text-transform: uppercase;
        border-bottom: 1.5px solid #1e3a8a;
        padding-bottom: 2px;
        margin-top: 8px;
        margin-bottom: 4px;
      }

      .toc-row-link {
        text-decoration: none;
        color: inherit;
        display: block;
      }

      .toc-row {
        display: flex;
        align-items: baseline;
        padding: 2px 0;
        font-size: 7.5pt;
      }

      .toc-row:hover {
        background: #f1f5f9;
      }

      .toc-t-num {
        font-weight: 700;
        color: #2563eb;
        width: 0.45in;
        flex-shrink: 0;
      }

      .toc-t-title {
        font-weight: 500;
        color: #0f172a;
        flex-shrink: 0;
        max-width: 2.2in;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .toc-dots {
        flex: 1;
        border-bottom: 1px dotted #94a3b8;
        margin: 0 4px;
        position: relative;
        top: -3px;
      }

      .toc-page {
        font-weight: 700;
        color: #1e3a8a;
        width: 0.35in;
        text-align: right;
        flex-shrink: 0;
      }
    </style>
  </head>
  <body>
    <div class="toc-container">
      <div class="toc-header">
        <h1>Índice de Contenidos</h1>
        <p>MANUAL EUNACOM CARDIOLOGÍA &bull; 47 TEMAS DE MEDICINA INTERNA &bull; CHILE 2026</p>
      </div>

      <div class="toc-flex-grid">
        <!-- LEFT COLUMN (CHAPTERS 1, 2, 3) -->
        <div class="toc-col">
  `;

  // Left Column Content
  leftChaps.forEach(cNum => {
    const cObj = chapterDefinitions.find(c => c.chapNum === cNum);
    const cTopics = topics.filter(t => t.chapNum === cNum);

    html += `
      <div class="toc-chap-title">
        CAPÍTULO ${cObj.chapNum}: ${cObj.title.toUpperCase()}
      </div>
    `;

    cTopics.forEach(t => {
      html += `
        <a href="#tema-${t.topicLabel}" class="toc-row-link">
          <div class="toc-row">
            <span class="toc-t-num">${t.topicLabel}</span>
            <span class="toc-t-title">${t.rawClass.topic}</span>
            <span class="toc-dots"></span>
            <span class="toc-page">${t.startPage}</span>
          </div>
        </a>
      `;
    });
  });

  html += `
        </div>

        <!-- RIGHT COLUMN (CHAPTERS 4, 5 & SOLUCIONARIO) -->
        <div class="toc-col">
  `;

  // Right Column Content
  rightChaps.forEach(cNum => {
    const cObj = chapterDefinitions.find(c => c.chapNum === cNum);
    const cTopics = topics.filter(t => t.chapNum === cNum);

    html += `
      <div class="toc-chap-title">
        CAPÍTULO ${cObj.chapNum}: ${cObj.title.toUpperCase()}
      </div>
    `;

    cTopics.forEach(t => {
      html += `
        <a href="#tema-${t.topicLabel}" class="toc-row-link">
          <div class="toc-row">
            <span class="toc-t-num">${t.topicLabel}</span>
            <span class="toc-t-title">${t.rawClass.topic}</span>
            <span class="toc-dots"></span>
            <span class="toc-page">${t.startPage}</span>
          </div>
        </a>
      `;
    });
  });

  // Add Solucionario at bottom of Right Column
  html += `
          <div class="toc-chap-title" style="border-color: #059669; color: #059669; margin-top: 10px;">
            SOLUCIONARIO OFICIAL
          </div>
          <a href="#solucionario" class="toc-row-link">
            <div class="toc-row">
              <span class="toc-t-num" style="color: #059669;">KEY</span>
              <span class="toc-t-title" style="font-weight: 700; color: #059669;">Clave de Respuestas (141 Preguntas)</span>
              <span class="toc-dots" style="border-color: #a7f3d0;"></span>
              <span class="toc-page" style="color: #059669;">${estPage}</span>
            </div>
          </a>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;

  return html;
}

async function main() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setContent(generateTocHtml(), { waitUntil: 'networkidle0' });
  await page.pdf({
    path: outputPdfPath,
    format: 'Letter',
    printBackground: true,
    margin: { top: '0.42in', bottom: '0.38in', left: '0.35in', right: '0.35in' }
  });
  await browser.close();
  console.log('Balanced 2-column TOC test compiled to:', outputPdfPath);
}

main().catch(console.error);
