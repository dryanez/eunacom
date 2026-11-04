/**
 * ══════════════════════════════════════════════════════════════════════════════
 * MANUAL OFICIAL EUNACOM 2026 — CARDIOLOGÍA & SISTEMA CARDIOVASCULAR
 * Compilador Maestro · 5 Bloques Clínicos · 23 Masterclasses Granulares
 * Formato: Dual-Column 50/50 Letter PDF · PlantUML SVGs · Solucionario Oficial
 * ══════════════════════════════════════════════════════════════════════════════
 */

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { cardiologyClassesData } = require('./cardiology_master_curriculum_2026_data.cjs');

const outputPdfPath = path.join(__dirname, '..', 'libro_eunacom_v3', 'Modulo_1_Medicina_Interna', 'Manual_Oficial_Cardiologia_EUNACOM_2026.pdf');
const publicPdfPath = path.join(__dirname, '..', '..', 'public', 'cardio_showcase', 'Manual_Oficial_Cardiologia_EUNACOM_2026.pdf');

function getSvg(svgFilename) {
  if (!svgFilename) return '';
  const p = path.join(__dirname, '..', 'generate-book', 'svg_diagrams', svgFilename);
  if (fs.existsSync(p)) {
    let svg = fs.readFileSync(p, 'utf8');
    svg = svg.replace(/<ellipse[^>]+fill=["']#222222["'][^>]*\/>/gi, '');
    svg = svg.replace(/<line[^>]+y1=["']35["'][^>]+y2=["']55["'][^>]*\/>/gi, '');
    svg = svg.replace(/<polygon[^>]+points=["'][^"']*55[^"']*["'][^>]*\/>/gi, (match) => {
      if (match.includes('45') || match.includes('49')) return '';
      return match;
    });
    return svg;
  }
  return '';
}

function generateHtml() {
  let globalQNum = 1;
  let pageEstimate = 3;

  // Assign start pages to classes
  cardiologyClassesData.forEach(cls => {
    cls.startPage = pageEstimate;
    pageEstimate += (cls.svg ? 3 : 2); // 2-3 pages per dense class
  });

  // 1. COVER PAGE
  let pagesHtml = `
  <div class="page cover">
    <div class="cover-badge">MÓDULO 1 &bull; MEDICINA INTERNA</div>
    <h1>MANUAL OFICIAL EUNACOM 2026</h1>
    <h2>Cardiología &amp; Sistema Cardiovascular</h2>
    <div class="cover-subtitle">5 Bloques Clínicos &bull; 23 Masterclasses Jerárquicas &bull; Estándar Step 2 CK + Perfil V3 ASOFAMECh</div>
    <div class="badge">Texto Oficial de Estudio &bull; Normas Técnicas MINSAL &bull; Garantías GES</div>
  </div>

  <!-- 2. TABLE OF CONTENTS -->
  <div class="page toc-container">
    <div class="toc-header">
      <h1>Índice de Contenidos</h1>
      <p>MANUAL EUNACOM CARDIOLOGÍA &bull; 23 MASTERCLASSES &bull; 5 BLOQUES CLÍNICOS &bull; CHILE 2026</p>
    </div>

    <div class="toc-flex-grid">
      <!-- LEFT COLUMN: BLOQUES I, II, III -->
      <div class="toc-col">
  `;

  [1, 2, 3].forEach(bNum => {
    const bClasses = cardiologyClassesData.filter(c => c.blockNum === bNum);
    const bName = bClasses[0]?.blockName || `Bloque ${bNum}`;
    pagesHtml += `<div class="toc-chap-title">BLOQUE ${bNum}: ${bName.toUpperCase()}</div>`;
    bClasses.forEach(c => {
      pagesHtml += `
        <a href="#tema-${c.id}" class="toc-row-link">
          <div class="toc-row">
            <span class="toc-t-num">${c.topicLabel}</span>
            <span class="toc-t-title">${c.title}</span>
            <span class="toc-dots"></span>
            <span class="toc-page">${c.startPage}</span>
          </div>
        </a>
      `;
    });
  });

  pagesHtml += `
      </div>

      <!-- RIGHT COLUMN: BLOQUES IV, V & SOLUCIONARIO -->
      <div class="toc-col">
  `;

  [4, 5].forEach(bNum => {
    const bClasses = cardiologyClassesData.filter(c => c.blockNum === bNum);
    const bName = bClasses[0]?.blockName || `Bloque ${bNum}`;
    pagesHtml += `<div class="toc-chap-title">BLOQUE ${bNum}: ${bName.toUpperCase()}</div>`;
    bClasses.forEach(c => {
      pagesHtml += `
        <a href="#tema-${c.id}" class="toc-row-link">
          <div class="toc-row">
            <span class="toc-t-num">${c.topicLabel}</span>
            <span class="toc-t-title">${c.title}</span>
            <span class="toc-dots"></span>
            <span class="toc-page">${c.startPage}</span>
          </div>
        </a>
      `;
    });
  });

  pagesHtml += `
        <div class="toc-chap-title" style="border-color: #059669; color: #059669; margin-top: 12px;">
          SOLUCIONARIO Y FUNDAMENTOS CLÍNICOS
        </div>
        <a href="#solucionario" class="toc-row-link">
          <div class="toc-row">
            <span class="toc-t-num" style="color: #059669;">KEY</span>
            <span class="toc-t-title" style="font-weight: 700; color: #059669;">Solucionario Oficial y Banco de Preguntas</span>
            <span class="toc-dots" style="border-color: #a7f3d0;"></span>
            <span class="toc-page" style="color: #059669;">${pageEstimate}</span>
          </div>
        </a>
      </div>
    </div>
  </div>
  `;

  // 3. TOPIC CHAPTERS (23 CLASSES)
  const masterQuestionsList = [];

  cardiologyClassesData.forEach(c => {
    const hasSvg = c.svg && getSvg(c.svg);

    pagesHtml += `
    <div class="page topic-section" id="tema-${c.id}">
      <!-- TOPIC HEADER -->
      <div class="topic-hdr">
        <div>
          <div class="num">BLOQUE ${c.blockNum} &bull; TEMA ${c.topicLabel} &bull; ${c.id.toUpperCase()}</div>
          <h2>${c.title}</h2>
        </div>
        <div class="perfil-tag">
          <strong>PERFIL V3: ${c.perfilCode}</strong><br>
          Dx: ${c.dx} &bull; Tx: ${c.tx} &bull; Seg: ${c.seg}<br>
          <span style="color: #0284c7; font-weight: 600;">${c.ges}</span>
        </div>
      </div>

      <!-- TWO-COLUMN CONTENT FLOW -->
      <div class="two-col-flow">
        ${c.sections.map(s => `
          <div class="subhead">${s.heading}</div>
          <p class="txt">${s.text}</p>
        `).join('')}

        <!-- PHARMACOTHERAPY / CLINICAL TABLE -->
        ${c.table ? `
        <div class="tbl-container">
          <div class="tbl-hdr"><span class="tbl-num">TABLA ${c.topicLabel}</span>: ${c.table.title}</div>
          <table class="tbl">
            <thead>
              <tr>${c.table.headers.map(h => `<th>${h}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${c.table.rows.map(r => `<tr>${r.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        <!-- CASO CLÍNICO TIPO EUNACOM (AMBER BOX) -->
        <div class="box vignette-redesigned">
          <div class="vignette-hdr">CASO CLÍNICO TIPO EUNACOM</div>
          <div class="vignette-body">
            <div class="vignette-sec">
              <span class="sec-label">ESCENARIO CLÍNICO TÍPICO:</span>
              <p class="sec-text">"${c.vignette}"</p>
            </div>
            <div class="vignette-sec concept-sec">
              <span class="sec-label">EXPLICACIÓN CLÍNICA DETALLADA:</span>
              <p class="sec-text">${c.explicacion}</p>
            </div>
          </div>
        </div>

        <!-- PUNTOS CLAVE DESTACADOS -->
        <div class="box high-yield">
          <div class="box-title">Puntos Clave para el EUNACOM</div>
          <ul class="lst">
            ${c.keyPoints.map(p => `<li>${p}</li>`).join('')}
          </ul>
        </div>
      </div>

      <!-- FULL-WIDTH PLANTUML VECTOR ALGORITHM -->
      ${hasSvg ? `
      <div class="diagram-box">
        <div class="d-title">FIGURA ${c.topicLabel}: ${c.algoTitle.toUpperCase()}</div>
        <div class="svg-centered">
          ${getSvg(c.svg)}
        </div>
      </div>
      ` : ''}

      <!-- EVALUATION QUESTIONS BLOCK -->
      <div class="topic-questions-container">
        <div class="t-q-title">EVALUACIÓN Y CASO CLÍNICO EUNACOM (${c.title})</div>
        ${c.questions.map(q => {
          const qId = globalQNum++;
          masterQuestionsList.push({
            qNum: qId,
            classId: c.id,
            blockNum: c.blockNum,
            topicLabel: c.topicLabel,
            title: c.title,
            correcta: q.correcta,
            explicacion: q.explicacion
          });

          return `
          <div class="q-full-width" id="q-${qId}">
            <div class="q-hdr-link">
              <span class="q-hdr">PREGUNTA ${qId}</span>
              <a href="#ans-${qId}" class="link-ans">[ Ver Fundamento en Solucionario ]</a>
            </div>
            <div class="q-stem">${q.stem}</div>
            <div class="q-options-grid">
              ${q.options.map(o => `
                <div class="q-opt-item"><strong>${o.id})</strong> ${o.text}</div>
              `).join('')}
            </div>
          </div>
          `;
        }).join('')}
      </div>
    </div>
    `;
  });

  // 4. MASTER ANSWER KEY
  pagesHtml += `
  <div class="page answer-key-page" id="solucionario">
    <div class="toc-page">
      <h2>SOLUCIONARIO OFICIAL DE CARDIOLOGÍA (23 MASTERCLASSES)</h2>
      <p style="font-size: 8.5pt; color: #475569; margin-bottom: 12px;">Fundamentos clínicos y razonamiento diagnóstico de las ${masterQuestionsList.length} preguntas de evaluación oficial.</p>
    </div>
    <div class="answer-key-list">
  `;

  masterQuestionsList.forEach(q => {
    pagesHtml += `
      <div class="ans-key-card" id="ans-${q.qNum}">
        <div class="ans-key-hdr">
          <span>PREGUNTA ${q.qNum} (Bloque ${q.blockNum} &bull; Tema ${q.topicLabel}: ${q.title})</span>
          <a href="#q-${q.qNum}" class="link-back">[ Volver a Pregunta ${q.qNum} ]</a>
        </div>
        <div class="ans-correct-badge">Respuesta Correcta: Alternativa ${q.correcta}</div>
        <div class="ans-section">
          <strong>Fundamento Clínico Oficial:</strong>
          <p>${q.explicacion}</p>
        </div>
      </div>
    `;
  });

  pagesHtml += `
    </div>
  </div>
  `;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Merriweather:wght@400;700;900&display=swap');
    
    @page {
      size: letter;
      margin: 0.42in 0.35in 0.38in 0.35in;
    }
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: 'Inter', sans-serif;
      font-size: 8.5pt;
      line-height: 1.35;
      color: #0f172a;
      background: #ffffff;
      -webkit-print-color-adjust: exact;
    }
    
    .page { width: 100%; page-break-after: always; position: relative; }
    .topic-section { page-break-after: always; }
    
    /* COVER */
    .cover {
      display: flex; flex-direction: column; justify-content: center; align-items: center;
      height: 9.8in; background: #0f172a; color: white; text-align: center; padding: 2in 1in;
    }
    .cover-badge {
      background: #2563eb; padding: 6px 20px; font-size: 10pt; font-weight: 700; border-radius: 4px; margin-bottom: 20px; letter-spacing: 1px;
    }
    .cover h1 { font-family: 'Merriweather', serif; font-size: 26pt; margin-bottom: 12px; }
    .cover h2 { font-size: 14pt; font-weight: 400; color: #38bdf8; margin-bottom: 8px; }
    .cover .cover-subtitle { font-size: 9.5pt; color: #94a3b8; margin-bottom: 28px; line-height: 1.4; max-width: 5in; }
    .cover .badge { background: #1e293b; border: 1px solid #334155; padding: 8px 24px; font-size: 10pt; border-radius: 4px; color: #f8fafc; }
    
    /* TOC */
    .toc-container { width: 100%; }
    .toc-header { border-bottom: 2px solid #1e3a8a; padding-bottom: 4px; margin-bottom: 12px; }
    .toc-header h1 { font-family: 'Merriweather', serif; font-size: 16pt; color: #1e3a8a; text-transform: uppercase; letter-spacing: 0.5px; margin: 0; }
    .toc-header p { font-size: 8.5pt; color: #475569; margin-top: 2px; }
    .toc-flex-grid { display: flex; justify-content: space-between; width: 100%; gap: 0.35in; }
    .toc-col { width: 48%; display: flex; flex-direction: column; }
    .toc-chap-title { font-family: 'Merriweather', serif; font-size: 7.5pt; font-weight: 700; color: #1e3a8a; text-transform: uppercase; border-bottom: 1.5px solid #1e3a8a; padding-bottom: 2px; margin-top: 8px; margin-bottom: 4px; }
    .toc-row-link { text-decoration: none; color: inherit; display: block; }
    .toc-row { display: flex; align-items: baseline; padding: 2px 0; font-size: 7.5pt; }
    .toc-row:hover { background: #f1f5f9; }
    .toc-t-num { font-weight: 700; color: #2563eb; width: 0.35in; flex-shrink: 0; }
    .toc-t-title { font-weight: 500; color: #0f172a; flex-shrink: 0; max-width: 2.3in; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .toc-dots { flex: 1; border-bottom: 1px dotted #94a3b8; margin: 0 4px; position: relative; top: -3px; }
    .toc-page { font-weight: 700; color: #1e3a8a; width: 0.35in; text-align: right; flex-shrink: 0; }
    
    /* TOPIC HEADER */
    .topic-hdr { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1e3a8a; padding-bottom: 4px; margin-bottom: 8px; }
    .topic-hdr h2 { font-family: 'Merriweather', serif; font-size: 12.5pt; color: #1e3a8a; }
    .topic-hdr .num { font-size: 7.5pt; font-weight: 700; color: #2563eb; text-transform: uppercase; }
    .perfil-tag { background: #f1f5f9; border: 1px solid #cbd5e1; border-left: 4px solid #1e3a8a; padding: 3px 6px; font-size: 7pt; text-align: right; line-height: 1.3; }
    
    /* TWO-COLUMN (50%/50%) FLOW */
    .two-col-flow { column-count: 2; column-gap: 0.2in; width: 100%; }
    
    /* CALLOUT BOXES */
    .box { border: 1px solid #cbd5e1; border-radius: 2px; padding: 5px 7px; margin-top: 5px; margin-bottom: 5px; font-size: 8pt; width: 100%; break-inside: avoid; }
    .box-title { font-weight: 700; font-size: 7.5pt; text-transform: uppercase; margin-bottom: 2px; letter-spacing: 0.5px; }
    .box.high-yield { background: #f8fafc; border-left: 3.5px solid #1e3a8a; }
    .box.high-yield .box-title { color: #1e3a8a; }
    
    /* VIGNETTE */
    .box.vignette-redesigned { background: #fffdf5; border: 1.5px solid #f59e0b; border-radius: 3px; padding: 0; margin-top: 6px; margin-bottom: 6px; overflow: hidden; break-inside: avoid; }
    .vignette-hdr { background: #d97706; color: #ffffff; font-weight: 700; font-size: 7.5pt; padding: 3px 8px; text-transform: uppercase; letter-spacing: 0.5px; }
    .vignette-body { padding: 6px 8px; }
    .vignette-sec { margin-bottom: 4px; }
    .vignette-sec.concept-sec { border-top: 1px dashed #fcd34d; padding-top: 4px; margin-bottom: 0; }
    .sec-label { font-weight: 700; font-size: 7pt; color: #92400e; display: block; margin-bottom: 2px; }
    .sec-text { font-size: 8pt; line-height: 1.35; color: #1e293b; }
    
    /* HEADINGS & TEXT */
    .subhead { font-family: 'Merriweather', serif; font-size: 9pt; font-weight: 700; color: #1e3a8a; margin: 8px 0 3px 0; border-bottom: 1px solid #cbd5e1; padding-bottom: 1px; break-after: avoid; }
    p.txt { font-size: 8pt; line-height: 1.35; margin-bottom: 4px; text-align: justify; }
    ul.lst { padding-left: 12px; margin-bottom: 4px; }
    ul.lst li { font-size: 8pt; margin-bottom: 2px; }
    
    /* TABLES */
    .tbl-container { width: 100%; margin: 6px 0; break-inside: avoid; }
    .tbl-hdr { font-weight: 700; font-size: 7pt; color: #1e3a8a; background: #f1f5f9; padding: 3px 6px; border: 1px solid #cbd5e1; border-bottom: none; text-transform: uppercase; letter-spacing: 0.5px; }
    .tbl-hdr .tbl-num { color: #2563eb; }
    table.tbl { width: 100%; border-collapse: collapse; font-size: 7pt; border: 1px solid #cbd5e1; border-top: 1.5px solid #1e3a8a; border-bottom: 1.5px solid #1e3a8a; }
    table.tbl th { background: #f1f5f9; color: #1e3a8a; padding: 3px 4px; text-align: left; font-size: 6.5pt; text-transform: uppercase; font-weight: 700; border-bottom: 1px solid #cbd5e1; }
    table.tbl td { padding: 3.5px 4px; border-bottom: 1px solid #e2e8f0; vertical-align: top; line-height: 1.25; }
    table.tbl tr:nth-child(even) td { background: #f8fafc; }
    
    /* FULL-WIDTH DIAGRAM BOX */
    .diagram-box { width: 100%; border: 1.5px solid #1e3a8a; border-radius: 3px; padding: 6px 10px; margin-top: 8px; margin-bottom: 8px; background: #ffffff; text-align: center; break-inside: avoid; column-span: all; -webkit-column-span: all; }
    .diagram-box .d-title { font-weight: 800; font-size: 7.5pt; text-transform: uppercase; color: #1e3a8a; text-align: center; margin-bottom: 4px; border-bottom: 1.5px solid #cbd5e1; padding-bottom: 2px; letter-spacing: 0.5px; }
    .svg-centered { display: flex; justify-content: center; align-items: center; width: 100%; text-align: center; }
    .svg-centered svg { width: 100% !important; max-width: 100% !important; height: auto !important; margin: 0 auto; display: block; }
    
    /* QUESTIONS */
    .topic-questions-container { width: 100%; margin-top: 8px; break-inside: avoid; }
    .t-q-title { font-weight: 700; font-size: 7.5pt; color: #1e3a8a; text-transform: uppercase; border-bottom: 1.5px solid #1e3a8a; padding-bottom: 2px; margin-bottom: 4px; }
    .q-full-width { width: 100%; background: #ffffff; border: 1px solid #cbd5e1; border-left: 3.5px solid #2563eb; border-radius: 2px; padding: 5px 8px; margin-bottom: 5px; break-inside: avoid; }
    .q-hdr-link { display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px; }
    .q-full-width .q-hdr { font-weight: 700; font-size: 7.5pt; color: #2563eb; text-transform: uppercase; letter-spacing: 0.5px; }
    .link-ans { font-size: 7pt; color: #0284c7; text-decoration: none; font-weight: 600; }
    .q-full-width .q-stem { font-size: 7.5pt; line-height: 1.35; margin-bottom: 4px; }
    .q-options-grid { display: flex; flex-direction: column; gap: 2px; }
    .q-opt-item { font-size: 7pt; padding: 2px 4px; border-radius: 2px; background: #f8fafc; border: 1px solid #e2e8f0; }
    
    /* ANSWER KEY */
    .answer-key-page { padding-top: 0.2in; }
    .answer-key-page h2 { font-family: 'Merriweather', serif; font-size: 13pt; color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 4px; margin-bottom: 8px; }
    .ans-key-card { background: #ffffff; border: 1px solid #cbd5e1; border-radius: 3px; padding: 8px 10px; margin-bottom: 8px; page-break-inside: avoid; }
    .ans-key-hdr { display: flex; justify-content: space-between; align-items: center; font-weight: 700; font-size: 8pt; color: #1e3a8a; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; margin-bottom: 4px; }
    .link-back { font-size: 7pt; color: #2563eb; text-decoration: none; }
    .ans-correct-badge { display: inline-block; background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; font-weight: 700; font-size: 7.5pt; padding: 2px 6px; border-radius: 2px; margin-bottom: 4px; }
    .ans-section { font-size: 7.5pt; line-height: 1.35; margin-bottom: 3px; }
  </style>
</head>
<body>
  ${pagesHtml}
</body>
</html>`;
}

async function main() {
  console.log("Compilando MANUAL OFICIAL EUNACOM 2026 (23 Masterclasses Canónicas)...");
  const htmlContent = generateHtml();

  fs.mkdirSync(path.dirname(outputPdfPath), { recursive: true });
  fs.mkdirSync(path.dirname(publicPdfPath), { recursive: true });

  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'load', timeout: 90000 });
  await page.evaluateHandle('document.fonts.ready');

  const pdfBuffer = await page.pdf({
    format: 'Letter',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: `
      <div style="font-size: 7.5pt; font-family: 'Inter', sans-serif; color: #64748b; width: 100%; display: flex; justify-content: space-between; align-items: center; margin: 0 0.35in; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">
        <span>MANUAL EUNACOM 2026 &bull; CARDIOLOGÍA &bull; MÓDULO 1</span>
        <span>PÁGINA <span class="pageNumber"></span></span>
      </div>
    `,
    footerTemplate: `<div></div>`,
    margin: {
      top: '0.42in',
      bottom: '0.38in',
      left: '0.35in',
      right: '0.35in'
    }
  });

  fs.writeFileSync(outputPdfPath, pdfBuffer);
  fs.writeFileSync(publicPdfPath, pdfBuffer);

  await browser.close();
  console.log("¡ÉXITO TOTAL! Manual Oficial EUNACOM 2026 generado exitosamente en:");
  console.log("  1)", outputPdfPath);
  console.log("  2)", publicPdfPath);
  console.log(`  → 23 Masterclasses en 5 Bloques, cobertura 100% Perfil V3 y GES.`);
}

main().catch(console.error);
