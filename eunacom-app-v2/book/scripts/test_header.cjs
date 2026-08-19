const puppeteer = require('puppeteer');
const path = require('path');

async function testHeader() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setContent('<html><body><div style="page-break-after:always;">Page 1</div><div>Page 2</div></body></html>');
  await page.pdf({
    path: path.join(__dirname, 'test_header.pdf'),
    format: 'Letter',
    displayHeaderFooter: true,
    headerTemplate: `
      <div style="font-size: 8pt; font-family: 'Inter', sans-serif; color: #1e3a8a; width: 100%; display: flex; justify-content: space-between; margin: 0 0.35in; border-bottom: 1.5px solid #1e3a8a; padding-bottom: 3px; font-weight: 700; text-transform: uppercase;">
        <span>CARDIOLOGÍA &bull; CAPÍTULO 1: ARRITMIAS</span>
        <span>PÁGINA <span class="pageNumber"></span></span>
      </div>
    `,
    footerTemplate: '<div></div>',
    margin: { top: '0.45in', bottom: '0.35in', left: '0.35in', right: '0.35in' }
  });
  await browser.close();
  console.log('Test header compiled successfully');
}

testHeader().catch(console.error);
