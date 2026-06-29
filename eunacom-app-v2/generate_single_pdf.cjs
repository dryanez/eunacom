const fs = require('fs');
const puppeteer = require('puppeteer');

const dataDir = '/Users/felipeyanez/Desktop/NEWeunacom/eunacom-app-v2/public/data/reconstrucciones';
const indexJson = JSON.parse(fs.readFileSync(`${dataDir}/index.json`));

// Grab just the latest exam for the sample
const examInfo = indexJson.exams.find(e => e.id === 'eunacom-dic-2025');
const examFile = JSON.parse(fs.readFileSync(`${dataDir}/${examInfo.file}`));

let html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #333;
            line-height: 1.6;
            margin: 0;
            padding: 0;
        }
        .page-break { page-break-before: always; }
        .avoid-break { page-break-inside: avoid; }
        
        .title-page {
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
        }
        .main-title {
            font-size: 36px;
            font-weight: bold;
            color: #1d4ed8;
            margin-bottom: 20px;
        }
        .subtitle {
            font-size: 24px;
            color: #4b5563;
        }
        
        .header {
            font-size: 24px;
            font-weight: bold;
            border-bottom: 2px solid #1d4ed8;
            padding-bottom: 10px;
            margin-bottom: 20px;
            margin-top: 40px;
            color: #1d4ed8;
        }
        
        .question-block {
            margin-bottom: 30px;
            padding: 15px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            background: #f9fafb;
        }
        .q-number {
            font-weight: bold;
            font-size: 16px;
            color: #111827;
            margin-bottom: 10px;
        }
        .q-text {
            font-size: 15px;
            margin-bottom: 15px;
        }
        .options {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .option {
            margin-bottom: 8px;
            padding: 8px 12px;
            background: #ffffff;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            font-size: 14px;
        }
        .option-letter {
            font-weight: bold;
            color: #2563eb;
            margin-right: 8px;
        }
        
        .answer-key table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        .answer-key th, .answer-key td {
            border: 1px solid #d1d5db;
            padding: 8px;
            text-align: left;
        }
        .answer-key th {
            background-color: #f3f4f6;
            font-weight: bold;
        }
    </style>
</head>
<body>

    <!-- Title Page -->
    <div class="title-page">
        <div class="main-title">EUNACOM Reconstrucciones</div>
        <div class="subtitle">Muestra de Prueba: ${examInfo.name}</div>
        <p style="margin-top: 50px; color: #6b7280;">Documento generado automáticamente</p>
    </div>

    <div class="page-break"></div>

    <!-- Index -->
    <div class="header">Índice</div>
    <ul style="font-size: 18px; line-height: 2;">
        <li>1. Portada</li>
        <li>2. Índice</li>
        <li>3. Examen: ${examInfo.name}</li>
        <li>4. Claves de Respuestas y Explicaciones</li>
    </ul>

    <div class="page-break"></div>

    <!-- Questions -->
    <div class="header">${examInfo.name}</div>
`;

const letters = ['A', 'B', 'C', 'D', 'E'];

examFile.questions.forEach((q, idx) => {
    html += `
    <div class="question-block avoid-break">
        <div class="q-number">Pregunta ${idx + 1}</div>
        <div class="q-text">${q.question || q.pregunta}</div>
        <ul class="options">
    `;
    const options = q.options || q.opciones || [];
    options.forEach((opt, i) => {
        let text = opt;
        if (text.match(/^[A-Ea-e]\)/)) {
            text = text.substring(2).trim();
        }
        html += `
            <li class="option"><span class="option-letter">${letters[i]})</span> ${text}</li>
        `;
    });
    html += `
        </ul>
    </div>
    `;
});

html += `
    <div class="page-break"></div>
    <!-- Answer Key -->
    <div class="header">Claves de Respuestas - ${examInfo.name}</div>
    <div class="answer-key">
        <table>
            <thead>
                <tr>
                    <th style="width: 10%">Nº</th>
                    <th style="width: 15%">Respuesta</th>
                    <th style="width: 75%">Explicación</th>
                </tr>
            </thead>
            <tbody>
`;

examFile.questions.forEach((q, idx) => {
    const ans = (q.correctAnswer || q.respuesta_correcta || q.respuestaCorrecta || '').toUpperCase();
    const exp = q.explanation || q.explicacion || q.respuesta_texto || '';
    html += `
        <tr class="avoid-break">
            <td><strong>${idx + 1}</strong></td>
            <td style="color: #059669; font-weight: bold;">${ans}</td>
            <td style="font-size: 13px;">${exp}</td>
        </tr>
    `;
});

html += `
            </tbody>
        </table>
    </div>
</body>
</html>
`;

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    await page.pdf({
        path: '/Users/felipeyanez/.gemini/antigravity/brain/8fbf6583-737c-4c04-9fb1-4184c67d057c/sample_test.pdf',
        format: 'A4',
        printBackground: true,
        margin: {
            top: '20mm',
            right: '20mm',
            bottom: '20mm',
            left: '20mm'
        },
        displayHeaderFooter: true,
        headerTemplate: '<div></div>',
        footerTemplate: '<div style="width: 100%; text-align: center; font-size: 10px; color: #9ca3af;">Página <span class="pageNumber"></span> de <span class="totalPages"></span></div>'
    });
    
    await browser.close();
    console.log("Sample PDF created successfully!");
})();
