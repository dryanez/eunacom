const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { PDFDocument } = require('pdf-lib');

const baseBookDir = path.join(__dirname, 'libro_eunacom_v3');
const outDir = __dirname;

const moduleMeta = [
  {
    folder: 'Modulo_1_Medicina_Interna',
    title: 'Módulo 1: Medicina Interna',
    roman: 'I',
    color: '#1e3a8a',
    accent: '#2563eb',
    chapters: [
      { num: 1, title: 'Cardiología', folder: 'Capitulo_01_Cardiologia', count: 47 },
      { num: 2, title: 'Diabetes y Dislipidemias', folder: 'Capitulo_02_Diabetes', count: 24 },
      { num: 3, title: 'Endocrinología', folder: 'Capitulo_03_Endocrinologia', count: 16 },
      { num: 4, title: 'Gastroenterología', folder: 'Capitulo_04_Gastroenterologia', count: 23 },
      { num: 5, title: 'Hematología', folder: 'Capitulo_05_Hematologia', count: 18 },
      { num: 6, title: 'Infectología', folder: 'Capitulo_06_Infectologia', count: 24 },
      { num: 7, title: 'Nefrología', folder: 'Capitulo_07_Nefrologia', count: 26 },
      { num: 8, title: 'Neurología y Geriatría', folder: 'Capitulo_08_Neurologia_y_Geriatria', count: 11 },
      { num: 9, title: 'Respiratorio', folder: 'Capitulo_09_Respiratorio', count: 67 },
      { num: 10, title: 'Reumatología', folder: 'Capitulo_10_Reumatologia', count: 36 }
    ]
  },
  {
    folder: 'Modulo_2_Cirugia_y_Especialidades',
    title: 'Módulo 2: Cirugía y Especialidades',
    roman: 'II',
    color: '#991b1b',
    accent: '#dc2626',
    chapters: [
      { num: 1, title: 'Cirugía General y Anestesia', folder: 'Capitulo_01_Cirugia_General_y_Anestesia', count: 14 },
      { num: 2, title: 'Traumatología', folder: 'Capitulo_02_Traumatologia', count: 15 },
      { num: 3, title: 'Urología', folder: 'Capitulo_03_Urologia', count: 15 },
      { num: 4, title: 'Dermatología', folder: 'Capitulo_04_Dermatologia', count: 24 },
      { num: 5, title: 'Oftalmología', folder: 'Capitulo_05_Oftalmologia', count: 24 },
      { num: 6, title: 'Otorrinolaringología', folder: 'Capitulo_06_Otorrinolaringologia', count: 47 },
      { num: 7, title: 'Psiquiatría General', folder: 'Capitulo_07_Psiquiatria_General', count: 24 }
    ]
  },
  {
    folder: 'Modulo_3_Pediatria_y_Gineco_Obstetricia',
    title: 'Módulo 3: Pediatría y Gineco-Obstetricia',
    roman: 'III',
    color: '#065f46',
    accent: '#059669',
    chapters: [
      { num: 1, title: 'Pediatría', folder: 'Capitulo_01_Pediatria', count: 18 },
      { num: 2, title: 'Ginecología', folder: 'Capitulo_02_Ginecologia', count: 20 },
      { num: 3, title: 'Obstetricia', folder: 'Capitulo_03_Obstetricia', count: 54 }
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

function generateIndexHtml(tocData) {
  let moduleCardsHtml = '';

  tocData.forEach(mod => {
    let chapterRowsHtml = '';
    mod.chapters.forEach(ch => {
      chapterRowsHtml += `
        <div class="ch-row">
          <div class="ch-left">
            <span class="ch-num">Cap. ${ch.num}</span>
            <span class="ch-title">${ch.title}</span>
          </div>
          <div class="ch-right">
            <span class="ch-topics-count">${ch.count} temas</span>
          </div>
        </div>
      `;
    });

    moduleCardsHtml += `
      <div class="mod-card">
        <div class="mod-hdr" style="background: ${mod.color}; border-left: 5px solid ${mod.accent};">
          <div class="mod-title">${mod.title.toUpperCase()}</div>
          <div class="mod-badge">${mod.chapters.reduce((a,c)=>a+c.count, 0)} TEMAS</div>
        </div>
        <div class="mod-body">
          ${chapterRowsHtml}
        </div>
      </div>
    `;
  });

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Merriweather:wght@400;700;900&display=swap');
    @page { size: letter; margin: 0.5in 0.45in; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; font-size: 8.5pt; color: #0f172a; background: #ffffff; -webkit-print-color-adjust: exact; }
    
    .idx-header { text-align: center; border-bottom: 2.5px solid #0f172a; padding-bottom: 8px; margin-bottom: 15px; }
    .idx-header h1 { font-family: 'Merriweather', serif; font-size: 18pt; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; }
    .idx-header p { font-size: 8.5pt; color: #64748b; margin-top: 2px; }

    .modules-grid { display: flex; flex-direction: column; gap: 14px; }
    .mod-card { border: 1px solid #cbd5e1; border-radius: 4px; overflow: hidden; break-inside: avoid; }
    .mod-hdr { color: #ffffff; padding: 6px 12px; display: flex; justify-content: space-between; align-items: center; }
    .mod-title { font-weight: 800; font-size: 9.5pt; letter-spacing: 0.5px; }
    .mod-badge { font-size: 7.5pt; font-weight: 700; background: rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 3px; }

    .mod-body { padding: 8px 12px; background: #f8fafc; }
    .ch-row { display: flex; justify-content: space-between; align-items: center; padding: 4px 0; border-bottom: 1px solid #e2e8f0; font-size: 8pt; }
    .ch-row:last-child { border-bottom: none; }
    .ch-left { display: flex; align-items: center; gap: 8px; }
    .ch-num { font-weight: 700; color: #2563eb; width: 45px; }
    .ch-title { font-weight: 600; color: #1e293b; }
    .ch-right { font-size: 7.5pt; color: #64748b; font-weight: 600; }
  </style>
</head>
<body>
  <div class="idx-header">
    <h1>ÍNDICE GENERAL Y PLAN DE ESTUDIOS</h1>
    <p>Manual EUNACOM 2026 &bull; 3 Módulos &bull; 20 Especialidades &bull; 547 Temas de Alto Rendimiento</p>
  </div>

  <div class="modules-grid">
    ${moduleCardsHtml}
  </div>
</body>
</html>`;
}

async function main() {
  console.log("==================================================================");
  console.log("📚 GENERANDO LIBRO EUNACOM COMPLETO EN UN SOLO ARCHIVO PDF...");
  console.log("==================================================================");

  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  // 1. Generate Cover
  console.log("🎨 Generando Portada oficial...");
  const coverPage = await browser.newPage();
  await coverPage.setContent(generateCoverHtml(), { waitUntil: 'networkidle0' });
  const coverPdfBytes = await coverPage.pdf({ format: 'Letter', printBackground: true, margin: { top: 0, bottom: 0, left: 0, right: 0 } });
  await coverPage.close();

  // 2. Generate Index
  console.log("📑 Generando Índice General...");
  const indexPage = await browser.newPage();
  await indexPage.setContent(generateIndexHtml(moduleMeta), { waitUntil: 'networkidle0' });
  const indexPdfBytes = await indexPage.pdf({ format: 'Letter', printBackground: true, margin: { top: '0.5in', bottom: '0.45in', left: '0.45in', right: '0.45in' } });
  await indexPage.close();
  await browser.close();

  // 3. Merge Master PDF
  console.log("🔗 Uniendo todos los temas en el Master PDF...");
  const masterDoc = await PDFDocument.create();

  // Add Cover
  const coverDoc = await PDFDocument.load(coverPdfBytes);
  const [coverP] = await masterDoc.copyPages(coverDoc, [0]);
  masterDoc.addPage(coverP);

  // Add Index
  const idxDoc = await PDFDocument.load(indexPdfBytes);
  const idxPages = await masterDoc.copyPages(idxDoc, idxDoc.getPageIndices());
  idxPages.forEach(p => masterDoc.addPage(p));

  // Iterate over all 3 modules and chapters
  let totalTopicsAppended = 0;

  for (const mod of moduleMeta) {
    console.log(`\n--- Uniendo: ${mod.title} ---`);
    const modPath = path.join(baseBookDir, mod.folder);

    // Also create individual Module Doc
    const moduleDoc = await PDFDocument.create();
    const [modCover] = await moduleDoc.copyPages(coverDoc, [0]);
    moduleDoc.addPage(modCover);

    for (const ch of mod.chapters) {
      const chPath = path.join(modPath, ch.folder);
      if (!fs.existsSync(chPath)) {
        console.warn(`  ⚠️ Carpeta no encontrada: ${chPath}`);
        continue;
      }

      const pdfFiles = fs.readdirSync(chPath).filter(f => f.endsWith('.pdf')).sort((a, b) => {
        const numA = parseFloat(a.match(/Tema_(\d+\.\d+)/)?.[1] || 0);
        const numB = parseFloat(b.match(/Tema_(\d+\.\d+)/)?.[1] || 0);
        return numA - numB;
      });

      console.log(`  📘 Cap. ${ch.num}: ${ch.title} (${pdfFiles.length} PDFs)...`);

      for (const file of pdfFiles) {
        const filePath = path.join(chPath, file);
        try {
          const fileBytes = fs.readFileSync(filePath);
          const topicDoc = await PDFDocument.load(fileBytes);
          const topicPages = await masterDoc.copyPages(topicDoc, topicDoc.getPageIndices());
          topicPages.forEach(p => masterDoc.addPage(p));

          const modTopicPages = await moduleDoc.copyPages(topicDoc, topicDoc.getPageIndices());
          modTopicPages.forEach(p => moduleDoc.addPage(p));

          totalTopicsAppended++;
        } catch (err) {
          console.warn(`    ⚠️ Error al cargar ${file}: ${err.message}`);
        }
      }
    }

    const modOutFile = path.join(outDir, `Manual_EUNACOM_2026_${mod.folder}.pdf`);
    const modPdfBytes = await moduleDoc.save();
    fs.writeFileSync(modOutFile, modPdfBytes);
    console.log(`  ✅ Guardado PDF Módulo: ${modOutFile} (${(modPdfBytes.length / (1024*1024)).toFixed(1)} MB)`);
  }

  console.log(`\n💾 Guardando Master PDF Completo (${totalTopicsAppended} temas)...`);
  const masterOutFile = path.join(outDir, 'Manual_EUNACOM_2026_Completo.pdf');
  const masterPdfBytes = await masterDoc.save();
  fs.writeFileSync(masterOutFile, masterPdfBytes);

  console.log(`\n🎉🎉🎉 MASTER PDF CREADO CON ÉXITO! 🎉🎉🎉`);
  console.log(`📍 Archivo: ${masterOutFile}`);
  console.log(`📦 Tamaño: ${(masterPdfBytes.length / (1024*1024)).toFixed(1)} MB`);
  console.log(`📄 Total páginas: ${masterDoc.getPageCount()}`);
}

main().catch(console.error);
