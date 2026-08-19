const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const outputPdfPath = path.join(__dirname, 'test_toc_step2ck_clean.pdf');
const onlineClasses = JSON.parse(fs.readFileSync(path.join(__dirname, 'cardio_online_classes.json'), 'utf8'));

const chapterStructure = [
  { chapterNum: 1, title: 'Arritmias y Emergencias Cardiovasculares', range: [1, 14] },
  { chapterNum: 2, title: 'Cardiopatía Coronaria y Síndrome Coronario Agudo', range: [15, 22] },
  { chapterNum: 3, title: 'Insuficiencia Cardíaca, Miocardiopatías y Shock', range: [23, 26] },
  { chapterNum: 4, title: 'Valvulopatías, Miopericardio y Cardiopatías Congénitas', range: [27, 38] },
  { chapterNum: 5, title: 'Patología Vascular Periférica y Tromboembólica', range: [39, 47] }
];

let estPage = 3;
const topics = onlineClasses.map((item, idx) => {
  const globalNum = idx + 1;
  let chapNum = 1;
  let topicNumInChap = globalNum;

  if (globalNum <= 14) {
    chapNum = 1;
    topicNumInChap = globalNum;
  } else if (globalNum <= 22 || globalNum === 25) {
    chapNum = 2;
    topicNumInChap = globalNum <= 22 ? (globalNum - 14) : 9;
  } else if (globalNum === 23 || globalNum === 24 || globalNum === 26 || globalNum === 30 || globalNum === 36) {
    chapNum = 3;
    topicNumInChap = globalNum === 23 ? 1 : globalNum === 24 ? 2 : globalNum === 26 ? 3 : globalNum === 30 ? 4 : 5;
  } else if (globalNum <= 38) {
    chapNum = 4;
    topicNumInChap = globalNum - 26;
  } else {
    chapNum = 5;
    topicNumInChap = globalNum - 38;
  }

  const startP = estPage;
  estPage += 3;

  return {
    globalNum,
    chapNum,
    topicLabel: `${chapNum}.${topicNumInChap}`,
    title: item.topic,
    startPage: startP
  };
});

function generateTocHtml() {
  let html = `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Merriweather:wght@700&display=swap');
      @page { size: letter; margin: 0.45in 0.4in 0.45in 0.4in; }
      body { font-family: 'Inter', sans-serif; color: #0f172a; background: #fff; -webkit-print-color-adjust: exact; }
      
      .toc-container { width: 100%; }
      .toc-header { border-bottom: 2px solid #1e3a8a; padding-bottom: 4px; margin-bottom: 12px; }
      .toc-header h1 { font-family: 'Merriweather', serif; font-size: 16pt; color: #1e3a8a; text-transform: uppercase; letter-spacing: 0.5px; margin: 0; }
      .toc-header p { font-size: 8.5pt; color: #475569; margin-top: 2px; }

      .toc-two-col {
        column-count: 2;
        column-gap: 0.35in;
        width: 100%;
      }

      .toc-chap-title {
        font-family: 'Merriweather', serif;
        font-size: 9pt;
        font-weight: 700;
        color: #1e3a8a;
        text-transform: uppercase;
        border-bottom: 1.5px solid #1e3a8a;
        padding-bottom: 2px;
        margin-top: 10px;
        margin-bottom: 4px;
        break-after: avoid;
      }

      .toc-row-link {
        text-decoration: none;
        color: inherit;
        display: block;
        break-inside: avoid;
      }

      .toc-row {
        display: flex;
        align-items: baseline;
        padding: 2.5px 0;
        font-size: 8pt;
      }

      .toc-row:hover {
        background: #f1f5f9;
      }

      .toc-t-num {
        font-weight: 700;
        color: #2563eb;
        width: 0.5in;
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
        margin: 0 6px;
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

      <div class="toc-two-col">
  `;

  let currentChap = 0;

  topics.forEach(t => {
    if (t.chapNum !== currentChap) {
      currentChap = t.chapNum;
      const cObj = chapterStructure.find(c => c.chapterNum === currentChap);
      html += `
        <div class="toc-chap-title">
          CAPÍTULO ${cObj.chapterNum}: ${cObj.title}
        </div>
      `;
    }

    html += `
      <a href="#tema-${t.globalNum}" class="toc-row-link">
        <div class="toc-row">
          <span class="toc-t-num">${t.topicLabel}</span>
          <span class="toc-t-title">${t.title}</span>
          <span class="toc-dots"></span>
          <span class="toc-page">${t.startPage}</span>
        </div>
      </a>
    `;
  });

  html += `
        <div class="toc-chap-title" style="border-color: #059669; color: #059669; margin-top: 12px;">
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
    margin: { top: '0.4in', bottom: '0.4in', left: '0.4in', right: '0.4in' }
  });
  await browser.close();
  console.log('Clean Step 2 CK TOC test compiled to:', outputPdfPath);
}

main().catch(console.error);
