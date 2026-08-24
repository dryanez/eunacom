const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { PDFDocument, PDFName, StandardFonts, rgb } = require('pdf-lib');

const baseBookDir = path.join(__dirname, 'libro_eunacom_v3');
const outDir = __dirname;

const moduleMeta = [
  {
    folder: 'Modulo_1_Medicina_Interna',
    title: 'Módulo 1: Medicina Interna',
    chapters: [
      { num: 1, title: 'Cardiología', folder: 'Capitulo_01_Cardiologia' },
      { num: 2, title: 'Diabetes y Dislipidemias', folder: 'Capitulo_02_Diabetes' },
      { num: 3, title: 'Endocrinología', folder: 'Capitulo_03_Endocrinologia' },
      { num: 4, title: 'Gastroenterología', folder: 'Capitulo_04_Gastroenterologia' },
      { num: 5, title: 'Hematología', folder: 'Capitulo_05_Hematologia' },
      { num: 6, title: 'Infectología', folder: 'Capitulo_06_Infectologia' },
      { num: 7, title: 'Nefrología', folder: 'Capitulo_07_Nefrologia' },
      { num: 8, title: 'Neurología y Geriatría', folder: 'Capitulo_08_Neurologia_y_Geriatria' },
      { num: 9, title: 'Respiratorio', folder: 'Capitulo_09_Respiratorio' },
      { num: 10, title: 'Reumatología', folder: 'Capitulo_10_Reumatologia' }
    ]
  },
  {
    folder: 'Modulo_2_Cirugia_y_Especialidades',
    title: 'Módulo 2: Cirugía y Especialidades',
    chapters: [
      { num: 1, title: 'Cirugía General y Anestesia', folder: 'Capitulo_01_Cirugia_General_y_Anestesia' },
      { num: 2, title: 'Traumatología', folder: 'Capitulo_02_Traumatologia' },
      { num: 3, title: 'Urología', folder: 'Capitulo_03_Urologia' },
      { num: 4, title: 'Dermatología', folder: 'Capitulo_04_Dermatologia' },
      { num: 5, title: 'Oftalmología', folder: 'Capitulo_05_Oftalmologia' },
      { num: 6, title: 'Otorrinolaringología', folder: 'Capitulo_06_Otorrinolaringologia' },
      { num: 7, title: 'Psiquiatría General', folder: 'Capitulo_07_Psiquiatria_General' }
    ]
  },
  {
    folder: 'Modulo_3_Pediatria_y_Gineco_Obstetricia',
    title: 'Módulo 3: Pediatría y Gineco-Obstetricia',
    chapters: [
      { num: 1, title: 'Pediatría', folder: 'Capitulo_01_Pediatria' },
      { num: 2, title: 'Ginecología', folder: 'Capitulo_02_Ginecologia' },
      { num: 3, title: 'Obstetricia', folder: 'Capitulo_03_Obstetricia' }
    ]
  }
];

function generateCoverHtml() {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800;900&family=Merriweather:ital,wght@0,300;0,700;0,900;1,300&display=swap');
    @page { size: letter; margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', sans-serif;
      background: linear-gradient(135deg, #09101d 0%, #0f172a 50%, #1e293b 100%);
      color: #ffffff;
      height: 100vh;
      width: 100vw;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 0.8in 0.8in;
      position: relative;
      overflow: hidden;
      -webkit-print-color-adjust: exact;
    }
    .grid-bg {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background-image: radial-gradient(rgba(59, 130, 246, 0.15) 1px, transparent 1px);
      background-size: 24px 24px;
      pointer-events: none;
    }
    .top-badge {
      display: inline-block;
      background: rgba(37, 99, 235, 0.2);
      border: 1px solid #3b82f6;
      color: #60a5fa;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 9pt;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
    }
    .title-sec {
      margin-top: 1.2in;
    }
    .main-title {
      font-family: 'Merriweather', serif;
      font-size: 38pt;
      font-weight: 900;
      color: #ffffff;
      line-height: 1.1;
      letter-spacing: -0.5px;
      margin-bottom: 12px;
      border-left: 6px solid #3b82f6;
      padding-left: 20px;
    }
    .subtitle {
      font-size: 15pt;
      color: #94a3b8;
      font-weight: 300;
      margin-bottom: 25px;
      padding-left: 26px;
      letter-spacing: 0.5px;
    }
    .meta-cards {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
      margin-top: 40px;
      padding-left: 26px;
    }
    .meta-card {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 16px 18px;
    }
    .meta-num {
      font-size: 22pt;
      font-weight: 800;
      color: #38bdf8;
      margin-bottom: 4px;
    }
    .meta-label {
      font-size: 8.5pt;
      color: #cbd5e1;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      font-weight: 600;
    }
    .footer-sec {
      border-top: 1px solid rgba(255, 255, 255, 0.15);
      padding-top: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 8.5pt;
      color: #64748b;
    }
    .footer-highlight {
      color: #38bdf8;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="grid-bg"></div>
  <div>
    <div class="top-badge">EDICIÓN OFICIAL 2026 &bull; EXAMEN ÚNICO NACIONAL</div>
    <div class="title-sec">
      <h1 class="main-title">MANUAL<br>EUNACOM</h1>
      <p class="subtitle">Guía de Estudio, Algoritmos Clínicos y Casos Tipo EUNACOM</p>
      
      <div class="meta-cards">
        <div class="meta-card">
          <div class="meta-num">3</div>
          <div class="meta-label">Módulos Oficiales</div>
        </div>
        <div class="meta-card">
          <div class="meta-num">20</div>
          <div class="meta-label">Especialidades Médicas</div>
        </div>
        <div class="meta-card">
          <div class="meta-num">547</div>
          <div class="meta-label">Temas Clínicos Completos</div>
        </div>
      </div>
    </div>
  </div>

  <div class="footer-sec">
    <div>Basado en el <span class="footer-highlight">Perfil EUNACOM 2026</span> y <span class="footer-highlight">Guías Clínicas AUGE/GES MINSAL</span></div>
    <div>Universidad de Chile &bull; ASOFAMECH</div>
  </div>
</body>
</html>`;
}

async function main() {
  console.log("==================================================================");
  console.log("🚀 CREANDO MASTER PDF CON ÍNDICE INTERACTIVO 50/50...");
  console.log("==================================================================");

  const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox', '--disable-setuid-sandbox'] });

  console.log("🎨 Generando Portada...");
  const coverPage = await browser.newPage();
  await coverPage.setContent(generateCoverHtml(), { waitUntil: 'networkidle0' });
  const coverPdfBytes = await coverPage.pdf({ format: 'Letter', printBackground: true });
  await browser.close();

  console.log("🔗 Preparando Master Document...");
  const masterDoc = await PDFDocument.create();

  // Add cover (Page 1 / Index 0)
  const coverDoc = await PDFDocument.load(coverPdfBytes);
  const [coverP] = await masterDoc.copyPages(coverDoc, [0]);
  masterDoc.addPage(coverP);

  const tocItems = []; // To hold { type, title, height, pageObj, rawOffset }
  
  // Parse all topics and merge them sequentially to get their exact references
  for (const mod of moduleMeta) {
    console.log(`\n--- Procesando: ${mod.title} ---`);
    tocItems.push({ type: 'MODULE', title: mod.title.toUpperCase(), height: 35 });
    
    for (const ch of mod.chapters) {
      tocItems.push({ type: 'CHAPTER', title: `Capítulo ${ch.num}: ${ch.title}`, height: 20 });
      const chPath = path.join(baseBookDir, mod.folder, ch.folder);
      if (!fs.existsSync(chPath)) continue;

      const pdfFiles = fs.readdirSync(chPath).filter(f => f.endsWith('.pdf')).sort((a, b) => {
        const numA = parseFloat(a.match(/Tema_(\d+\.\d+)/)?.[1] || 0);
        const numB = parseFloat(b.match(/Tema_(\d+\.\d+)/)?.[1] || 0);
        return numA - numB;
      });

      for (const file of pdfFiles) {
        const topicTitle = file.replace('.pdf','').replace(/_/g, ' ');
        const fileBytes = fs.readFileSync(path.join(chPath, file));
        try {
          const topicDoc = await PDFDocument.load(fileBytes);
          const copiedPages = await masterDoc.copyPages(topicDoc, topicDoc.getPageIndices());
          const startPageRef = copiedPages[0];
          const rawOffset = masterDoc.getPageCount(); // Exact location index in masterDoc before appending

          copiedPages.forEach(p => masterDoc.addPage(p));

          tocItems.push({
            type: 'TOPIC',
            title: topicTitle,
            height: 12,
            pageObj: startPageRef,
            rawOffset: rawOffset
          });
        } catch (e) {
          console.warn(`⚠️ Error leyendo ${file}: ${e.message}`);
        }
      }
    }
  }

  // --- LAYOUT ENGINE (2-COL 50/50) ---
  console.log("\n📐 Calculando paginación del Índice Interactivo 50/50...");
  let startYPage1 = 660; // Leave space for huge "ÍNDICE" title
  let startYPageN = 730;
  let currentY = startYPage1;
  let currentCol = 1;
  let indexPageCount = 1;

  function allocate(pts) {
    // Check if we need to wrap to next column or page
    if (currentY - pts < 50) {
      if (currentCol === 1) {
        currentCol = 2;
        currentY = (indexPageCount === 1) ? startYPage1 : startYPageN;
      } else {
        currentCol = 1;
        indexPageCount++;
        currentY = startYPageN;
      }
    }
    const y = currentY;
    currentY -= pts;
    return { pageIdx: indexPageCount - 1, col: currentCol, y: y };
  }

  // Allocate layout data for all TOC items
  for (const item of tocItems) {
    Object.assign(item, allocate(item.height));
  }

  console.log(`📑 El índice tomará ${indexPageCount} páginas.`);

  // Insert blank pages for the Index directly after the cover
  const indexPages = [];
  for (let i = 0; i < indexPageCount; i++) {
    const page = masterDoc.insertPage(1 + i, [612, 792]); // Letter size
    indexPages.push(page);
  }

  // --- DRAWING THE INDEX ---
  console.log("✍️ Dibujando textos interactivos (Hyperlinks)...");
  const helv = await masterDoc.embedFont(StandardFonts.Helvetica);
  const helvBold = await masterDoc.embedFont(StandardFonts.HelveticaBold);
  const helvOblique = await masterDoc.embedFont(StandardFonts.HelveticaOblique);

  // Draw header on the first index page
  indexPages[0].drawText('ÍNDICE GENERAL Y PLAN DE ESTUDIOS', { x: 40, y: 720, size: 20, font: helvBold, color: rgb(0.06, 0.09, 0.17) });
  indexPages[0].drawText('Manual EUNACOM 2026 - Versión Oficial Integrada', { x: 40, y: 700, size: 10, font: helvBold, color: rgb(0.14, 0.38, 0.92) });
  indexPages[0].drawText('Instrucción: Haz click sobre cualquier tema para ir directamente a la página correspondiente.', { x: 40, y: 685, size: 9, font: helvOblique, color: rgb(0.4, 0.4, 0.4) });

  for (const item of tocItems) {
    const page = indexPages[item.pageIdx];
    // Col 1: X=40, Col 2: X=320 (Gutter=30, Width=252)
    const x = item.col === 1 ? 40 : 320;
    const colWidth = 252;

    if (item.type === 'MODULE') {
      page.drawText(item.title, { x, y: item.y - 12, size: 11, font: helvBold, color: rgb(0.1, 0.2, 0.5) });
      page.drawLine({ start: {x, y: item.y - 16}, end: {x: x+colWidth, y: item.y - 16}, thickness: 1.5, color: rgb(0.14, 0.38, 0.92) });
    } else if (item.type === 'CHAPTER') {
      page.drawText(item.title, { x, y: item.y - 10, size: 9, font: helvBold, color: rgb(0.15, 0.15, 0.15) });
    } else if (item.type === 'TOPIC') {
      // displayPageNum = existing offset + 1 (for 1-based indexing) + number of inserted index pages
      const displayPageNum = item.rawOffset + 1 + indexPageCount;
      
      let text = item.title;
      // Truncate logic
      const maxTextWidth = colWidth - 25; // Leave room for page number
      if (helv.widthOfTextAtSize(text, 8) > maxTextWidth) {
        while(text.length > 0 && helv.widthOfTextAtSize(text + '...', 8) > maxTextWidth) {
          text = text.substring(0, text.length - 1);
        }
        text += '...';
      }

      page.drawText(text, { x, y: item.y - 8, size: 8, font: helv, color: rgb(0.2, 0.2, 0.2) });

      const pStr = String(displayPageNum);
      const pStrW = helvBold.widthOfTextAtSize(pStr, 8);
      // Right align page number
      const pageNumX = x + colWidth - pStrW;
      page.drawText(pStr, { x: pageNumX, y: item.y - 8, size: 8, font: helvBold, color: rgb(0.14, 0.38, 0.92) });

      // Draw dots leader
      const textW = helv.widthOfTextAtSize(text, 8);
      const dotsSpace = (pageNumX - (x + textW) - 6);
      if (dotsSpace > 10) {
        page.drawText('.'.repeat(Math.floor(dotsSpace / 3)), { x: x + textW + 3, y: item.y - 8, size: 8, font: helv, color: rgb(0.7, 0.7, 0.7) });
      }

      // 🎯 INJECT CLICKABLE LINK ANNOTATION
      const link = masterDoc.context.obj({
        Type: 'Annot',
        Subtype: 'Link',
        Rect: [x, item.y - 10, x + colWidth, item.y + 4],
        Border: [0, 0, 0],
        C: [0, 0, 0], // transparent
        A: {
          Type: 'Action',
          S: 'GoTo',
          D: [item.pageObj.ref, PDFName.of('XYZ'), null, null, null]
        }
      });

      if (!page.node.has(PDFName.of('Annots'))) {
        page.node.set(PDFName.of('Annots'), masterDoc.context.obj([]));
      }
      page.node.get(PDFName.of('Annots')).push(link);
    }
  }

  // Optional: add page numbers to the index pages themselves
  for (let i = 0; i < indexPageCount; i++) {
    indexPages[i].drawText(`Índice - Pág. ${i + 1}`, {
      x: 520, y: 30, size: 8, font: helv, color: rgb(0.5, 0.5, 0.5)
    });
  }

  console.log("💾 Guardando Master PDF final interactivo...");
  const masterOutFile = path.join(outDir, 'Manual_EUNACOM_2026_Completo_Interactivo.pdf');
  const masterPdfBytes = await masterDoc.save();
  fs.writeFileSync(masterOutFile, masterPdfBytes);

  console.log(`\n✨✨✨ LIBRO INTERACTIVO COMPLETADO ✨✨✨`);
  console.log(`📍 Archivo: ${masterOutFile}`);
  console.log(`📦 Tamaño: ${(masterPdfBytes.length / (1024*1024)).toFixed(1)} MB`);
  console.log(`📄 Total páginas: ${masterDoc.getPageCount()}`);
}

main().catch(console.error);
