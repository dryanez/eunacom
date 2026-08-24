const fs = require('fs');

let content = fs.readFileSync('generate_all_pdf.cjs', 'utf-8');

// 1. Add pdf-parse import at the top
content = content.replace("const puppeteer = require('puppeteer');", "const puppeteer = require('puppeteer');\nconst pdfParse = require('pdf-parse');");

// 2. Add the promotional page before the index
const promoHTML = `
    <div class="page-break"></div>
    <div style="font-family: 'Helvetica', sans-serif; padding: 40px; text-align: center;">
        <h1 style="color: #1e40af; font-size: 32px; font-weight: 900; margin-bottom: 20px; text-transform: uppercase;">¡Prepárate con Famedtesprep!</h1>
        <p style="font-size: 16px; color: #4b5563; max-width: 800px; margin: 0 auto 30px auto; line-height: 1.6;">
            Únete a la plataforma más moderna y completa de Chile. Deja de estudiar con PDFs desactualizados o plataformas anticuadas. Nosotros te ofrecemos <strong>reconstrucciones interactivas, explicaciones detalladas y análisis de rendimiento inteligente</strong>.
        </p>
        
        <div style="display: flex; justify-content: center; gap: 20px; margin-bottom: 40px;">
            <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 20px; width: 30%;">
                <h3 style="color: #2563eb; font-size: 18px; margin-top: 0;">🚀 Inteligencia Artificial</h3>
                <p style="font-size: 13px; color: #4b5563;">Analizamos tus puntos débiles y te recomendamos exactamente qué estudiar.</p>
            </div>
            <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 20px; width: 30%;">
                <h3 style="color: #2563eb; font-size: 18px; margin-top: 0;">📱 100% Interactivo</h3>
                <p style="font-size: 13px; color: #4b5563;">Simula el examen real en cualquier dispositivo. Modo oscuro incluido.</p>
            </div>
            <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 20px; width: 30%;">
                <h3 style="color: #2563eb; font-size: 18px; margin-top: 0;">🥇 Top en el Mercado</h3>
                <p style="font-size: 13px; color: #4b5563;">La alternativa número 1 en Chile para médicos nacionales y extranjeros.</p>
            </div>
        </div>

        <h2 style="color: #111827; font-size: 24px; margin-bottom: 20px;">Planes de Suscripción</h2>
        <div style="display: flex; justify-content: center; gap: 15px; margin-bottom: 30px;">
            <div style="border: 2px solid #e5e7eb; border-radius: 10px; padding: 15px; width: 22%;">
                <h4 style="margin:0; font-size: 16px;">1 Mes</h4>
                <p style="font-size: 12px; color: #6b7280;">Para repaso rápido</p>
            </div>
            <div style="border: 2px solid #e5e7eb; border-radius: 10px; padding: 15px; width: 22%;">
                <h4 style="margin:0; font-size: 16px;">3 Meses</h4>
                <p style="font-size: 12px; color: #6b7280;">Preparación intensiva</p>
            </div>
            <div style="border: 2px solid #3b82f6; border-radius: 10px; padding: 15px; width: 22%; background: #eff6ff; position: relative;">
                <span style="position: absolute; top: -10px; right: 10px; background: #ef4444; color: white; font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: bold;">MÁS POPULAR</span>
                <h4 style="margin:0; font-size: 16px; color: #1d4ed8;">6 Meses</h4>
                <p style="font-size: 12px; color: #6b7280;">Estudio con calma</p>
            </div>
            <div style="border: 2px solid #e5e7eb; border-radius: 10px; padding: 15px; width: 22%;">
                <h4 style="margin:0; font-size: 16px;">1 Año</h4>
                <p style="font-size: 12px; color: #6b7280;">Acceso total sin apuros</p>
            </div>
        </div>

        <div style="background: #fef08a; padding: 15px; border-radius: 10px; display: inline-block; margin-bottom: 30px; border: 2px dashed #ca8a04;">
            <h3 style="margin: 0; color: #854d0e; font-size: 20px;">🎉 ¡CÓDIGO DE DESCUENTO: <strong>DRYANEZ</strong>! 🎉</h3>
            <p style="margin: 5px 0 0 0; color: #a16207; font-weight: bold; font-size: 16px;">Usa este código hoy y obtén un 50% DE DESCUENTO INMEDIATO.</p>
        </div>

        <h3 style="color: #374151; font-size: 18px; margin-bottom: 15px;">Métodos de Pago Aceptados</h3>
        <div style="background: #f9fafb; padding: 20px; border-radius: 12px; text-align: left; max-width: 600px; margin: 0 auto;">
            <ul style="font-size: 14px; color: #4b5563; line-height: 1.8; list-style-type: none; padding: 0; margin: 0;">
                <li>✅ <strong>Mercado Libre / Mercado Pago</strong> (Tarjetas de crédito y débito)</li>
                <li>✅ <strong>PayPal</strong> (Internacional)</li>
                <li>✅ <strong>Transferencia Directa Cuenta RUT:</strong> 18.842-443-0</li>
            </ul>
        </div>
        
        <div style="margin-top: 30px;">
            <a href="https://eunacom.famedtesprep.com" style="background: #2563eb; color: white; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-size: 16px; font-weight: bold;">¡Suscríbete Ahora!</a>
        </div>
    </div>
    
    <div class="page-break"></div>
`;
content = content.replace('// Index', promoHTML + '\n    // Index');

// 3. Update Index to use placeholders {{PAGE_exam-xyz}} instead of "Ir al examen"
content = content.replace(
    /<div><a href="#exam-\${exam\.id}".*?Ir al Examen<\/a><\/div>/g,
    `<div style="color: #111827;">{{PAGE_exam-\${exam.id}}}</div>`
);
content = content.replace(
    /<div><a href="#key-\${exam\.id}".*?Ver Plantilla<\/a><\/div>/g,
    `<div style="color: #4b5563;">{{PAGE_key-\${exam.id}}}</div>`
);
content = content.replace(
    /<div><a href="#exp-\${exam\.id}".*?Ver Explicaciones<\/a><\/div>/g,
    `<div style="color: #4b5563;">{{PAGE_exp-\${exam.id}}}</div>`
);

// 4. Inject hidden markers __LOC_...__ for pdf-parse to find
// Title marker
content = content.replace(
    /html \+= \`<div id="exam-\${examInfo\.id}" class="header">\${examInfo\.name}<\/div>\`;/g,
    `html += \`<div id="exam-\${examInfo.id}" class="header">\${examInfo.name} <span style="color: white; font-size: 1px;">__LOC_exam-\${examInfo.id}__</span></div>\`;`
);
// Key marker
content = content.replace(
    /html \+= \`<div id="key-\${examInfo\.id}" class="header" style="font-size: 20px; text-align: center;">Plantilla de Respuestas: \${examInfo\.name}<\/div>\`;/g,
    `html += \`<div id="key-\${examInfo.id}" class="header" style="font-size: 20px; text-align: center;">Plantilla de Respuestas: \${examInfo.name} <span style="color: white; font-size: 1px;">__LOC_key-\${examInfo.id}__</span></div>\`;`
);
// Explanation marker
content = content.replace(
    /html \+= \`\\n    <div id="exp-\${examInfo\.id}" class="header" style="font-size: 20px; margin-top: 30px;"><a href="#exam-\${examInfo\.id}">Explicaciones: \${examInfo\.name}<\/a><\/div>/g,
    `html += \`\\n    <div id="exp-\${examInfo.id}" class="header" style="font-size: 20px; margin-top: 30px;"><a href="#exam-\${examInfo.id}">Explicaciones: \${examInfo.name}</a> <span style="color: white; font-size: 1px;">__LOC_exp-\${examInfo.id}__</span></div>`
);

// 5. Wrap puppeteer generation in 2-pass logic
const oldPuppeteerBlock = `(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 0 });
    
    await page.pdf({
        path: '/Users/felipeyanez/.gemini/antigravity/brain/8fbf6583-737c-4c04-9fb1-4184c67d057c/reconstrucciones_completas_optimizado.pdf',
        format: 'A4',
        printBackground: true,
        margin: {
            top: '12mm',
            right: '12mm',
            bottom: '15mm',
            left: '12mm'
        },
        displayHeaderFooter: true,
        headerTemplate: '<div></div>',
        footerTemplate: '<div style="width: 100%; text-align: right; font-size: 11px; color: #4b5563; font-family: Helvetica; font-weight: bold; padding-right: 15mm;"><span class="pageNumber"></span></div>'
    });
    
    await browser.close();
    console.log("Hyperlinked PDF created successfully!");
})();`;

const newPuppeteerBlock = `(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    // PASS 1: Render to memory to find page numbers
    console.log("Pass 1: Rendering PDF to calculate page numbers...");
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 0 });
    
    const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
            top: '12mm',
            right: '12mm',
            bottom: '15mm',
            left: '12mm'
        },
        displayHeaderFooter: true,
        headerTemplate: '<div></div>',
        footerTemplate: '<div style="width: 100%; text-align: right; font-size: 11px; color: #4b5563; font-family: Helvetica; font-weight: bold; padding-right: 15mm;"><span class="pageNumber"></span></div>'
    });
    
    console.log("Parsing PDF layout...");
    const pageMapping = {};
    
    function render_page(pageData) {
        let render_options = { normalizeWhitespace: false, disableCombineTextItems: false };
        return pageData.getTextContent(render_options).then(function(textContent) {
            let text = '';
            for (let item of textContent.items) {
                text += item.str + ' ';
            }
            const regex = /__LOC_([a-zA-Z0-9-]+)__/g;
            let match;
            while ((match = regex.exec(text)) !== null) {
                pageMapping[match[1]] = pageData.pageIndex + 1;
            }
            return text;
        });
    }
    
    await pdfParse(pdfBuffer, { pagerender: render_page });
    
    console.log("Page mappings found:", pageMapping);
    
    // Replace placeholders in HTML with actual page numbers, and remove LOC markers
    let finalHtml = html;
    Object.keys(pageMapping).forEach(key => {
        finalHtml = finalHtml.replace(new RegExp(\`{{PAGE_\${key}}}\`, 'g'), pageMapping[key]);
    });
    
    // If any placeholders missed, replace with a default (e.g. "?")
    finalHtml = finalHtml.replace(/{{PAGE_[a-zA-Z0-9-]+}}/g, '?');
    
    // Remove LOC markers from final render so they don't mess with anything (even though they are white and 1px)
    finalHtml = finalHtml.replace(/<span style="color: white; font-size: 1px;">__LOC_[a-zA-Z0-9-]+__<\\/span>/g, '');
    
    // PASS 2: Render Final PDF
    console.log("Pass 2: Generating final PDF with accurate Index...");
    await page.setContent(finalHtml, { waitUntil: 'networkidle0', timeout: 0 });
    
    await page.pdf({
        path: '/Users/felipeyanez/.gemini/antigravity/brain/8fbf6583-737c-4c04-9fb1-4184c67d057c/reconstrucciones_completas_optimizado.pdf',
        format: 'A4',
        printBackground: true,
        margin: {
            top: '12mm',
            right: '12mm',
            bottom: '15mm',
            left: '12mm'
        },
        displayHeaderFooter: true,
        headerTemplate: '<div></div>',
        footerTemplate: '<div style="width: 100%; text-align: right; font-size: 11px; color: #4b5563; font-family: Helvetica; font-weight: bold; padding-right: 15mm;"><span class="pageNumber"></span></div>'
    });
    
    await browser.close();
    console.log("Hyperlinked PDF with perfect Index created successfully!");
})();`;

content = content.replace(oldPuppeteerBlock, newPuppeteerBlock);

fs.writeFileSync('generate_all_pdf.cjs', content, 'utf-8');
console.log('Script updated with 2-pass PDF rendering and promo page.');
