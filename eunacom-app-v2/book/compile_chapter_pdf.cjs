const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function generatePdf() {
  console.log('🚀 Iniciando compilación de PDF para Capítulo 08 (SCACEST)...');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  // Use running local dev server
  const url = 'http://localhost:5173/cardio_showcase/book_chapter_08.html';
  console.log(`Cargando URL: ${url}`);
  
  await page.goto(url, { waitUntil: 'load', timeout: 30000 });
  await page.evaluateHandle('document.fonts.ready');

  // Destination directories
  const targetDir = path.join(__dirname, 'libro_eunacom_v3', 'Modulo_1_Medicina_Interna', 'Capitulo_01_Cardiologia');
  fs.mkdirSync(targetDir, { recursive: true });
  
  const pdfPath1 = path.join(targetDir, 'Tema_1.8_SCACEST_y_Protocolo_Reperfusion_GES.pdf');
  const pdfPath2 = path.join(__dirname, '..', 'public', 'cardio_showcase', 'Capitulo_08_SCACEST.pdf');

  console.log('Compilando a PDF con márgenes oficiales Letter (Full Width Diagram)...');
  const pdfBuffer = await page.pdf({
    format: 'Letter',
    printBackground: true,
    margin: {
      top: '0.42in',
      right: '0.35in',
      bottom: '0.38in',
      left: '0.35in'
    }
  });

  fs.writeFileSync(pdfPath1, pdfBuffer);
  fs.writeFileSync(pdfPath2, pdfBuffer);

  await browser.close();
  console.log(`✅ PDF generado exitosamente en:`);
  console.log(`  1) ${pdfPath1} (${pdfBuffer.length} bytes)`);
  console.log(`  2) ${pdfPath2} (${pdfBuffer.length} bytes)`);
}

generatePdf().catch(err => {
  console.error('❌ Error generando PDF:', err);
  process.exit(1);
});
