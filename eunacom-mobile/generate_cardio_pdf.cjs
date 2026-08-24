const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const jsonPath = '/Users/felipeyanez/Desktop/NEWeunacom/eunacom-app-v2/public/data/study-guides/cardiologia-high-yield.json';
const outPath = '/Users/felipeyanez/.gemini/antigravity/brain/e34085e3-46c6-458b-a25c-7607ab903e3a/cardiologia_v3_book.pdf';

if (!fs.existsSync(jsonPath)) {
    console.error("Cardiology high yield JSON not found!");
    process.exit(1);
}

const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const topics = data.topics;
const meta = data.meta;

// ── Perfil Data Arrays for Index generation ────────────────────────────────
const SITUACIONES_CLINICAS = [
    { code: '1.01.1.001', name: 'Angina crónica estable', diag: 'Específico', trat: 'Inicial', seg: 'Completo', topic: 'cardiopatia-isquemia' },
    { code: '1.01.1.002', name: 'Bloqueos aurículo-ventriculares', diag: 'Específico', trat: 'Inicial', seg: 'Derivar', topic: 'arritmias' },
    { code: '1.01.1.003', name: 'Cardiopatía congénita en adulto', diag: 'Sospecha', trat: 'Inicial', seg: 'Derivar', topic: 'valvulopatias' },
    { code: '1.01.1.004', name: 'Corazón pulmonar crónico', diag: 'Específico', trat: 'Inicial', seg: 'Derivar', topic: 'insuficiencia-cardiaca' },
    { code: '1.01.1.005', name: 'Dislipidemias', diag: 'Específico', trat: 'Completo', seg: 'Completo', topic: 'hta-riesgo' },
    { code: '1.01.1.006', name: 'Embolia pulmonar', diag: 'Sospecha', trat: 'Inicial', seg: 'Derivar', topic: 'urgencias-reanimacion' },
    { code: '1.01.1.007', name: 'Endocarditis infecciosa y no infecciosa', diag: 'Sospecha', trat: 'Inicial', seg: 'Derivar', topic: 'pericardio-infeccion' },
    { code: '1.01.1.008', name: 'Enfermedad reumática activa', diag: 'Específico', trat: 'Completo', seg: 'Completo', topic: 'pericardio-infeccion' },
    { code: '1.01.1.009', name: 'Estenosis aórtica', diag: 'Específico', trat: 'Inicial', seg: 'Derivar', topic: 'valvulopatias' },
    { code: '1.01.1.010', name: 'Estenosis mitral', diag: 'Específico', trat: 'Inicial', seg: 'Derivar', topic: 'valvulopatias' },
    { code: '1.01.1.011', name: 'Extrasistolía ventricular benigna', diag: 'Específico', trat: 'Inicial', seg: 'Completo', topic: 'arritmias' },
    { code: '1.01.1.012', name: 'Fibrilación auricular crónica', diag: 'Específico', trat: 'Inicial', seg: 'Completo', topic: 'arritmias' },
    { code: '1.01.1.013', name: 'Fibrilación auricular paroxística', diag: 'Específico', trat: 'Inicial', seg: 'Derivar', topic: 'arritmias' },
    { code: '1.01.1.014', name: 'Flutter auricular', diag: 'Específico', trat: 'Inicial', seg: 'Derivar', topic: 'arritmias' },
    { code: '1.01.1.015', name: 'Hipertensión arterial esencial', diag: 'Específico', trat: 'Completo', seg: 'Completo', topic: 'hta-riesgo' },
    { code: '1.01.1.016', name: 'Hipertensión arterial secundaria', diag: 'Sospecha', trat: 'Inicial', seg: 'Derivar', topic: 'hta-riesgo' },
    { code: '1.01.1.017', name: 'Insuficiencia aórtica', diag: 'Específico', trat: 'Inicial', seg: 'Derivar', topic: 'valvulopatias' },
    { code: '1.01.1.018', name: 'Insuficiencia cardíaca', diag: 'Específico', trat: 'Inicial', seg: 'Completo', topic: 'insuficiencia-cardiaca' },
    { code: '1.01.1.019', name: 'Insuficiencia mitral', diag: 'Específico', trat: 'Inicial', seg: 'Derivar', topic: 'valvulopatias' },
    { code: '1.01.1.020', name: 'Miocardiopatías', diag: 'Sospecha', trat: 'Inicial', seg: 'Derivar', topic: 'insuficiencia-cardiaca' },
    { code: '1.01.1.021', name: 'Paciente con soplo', diag: 'Específico', trat: 'Inicial', seg: 'Derivar', topic: 'valvulopatias' },
    { code: '1.01.1.022', name: 'Pericarditis aguda', diag: 'Sospecha', trat: 'Inicial', seg: 'No requiere', topic: 'pericardio-infeccion' },
    { code: '1.01.1.023', name: 'Síndrome metabólico', diag: 'Específico', trat: 'Completo', seg: 'Completo', topic: 'hta-riesgo' },
    { code: '1.01.1.024', name: 'Taquicardia paroxística supraventricular (TPSV)', diag: 'Específico', trat: 'Inicial', seg: 'Completo', topic: 'arritmias' }
];

const SITUACIONES_URGENCIAS = [
    { code: '1.01.2.001', name: 'Angina inestable', diag: 'Específico', trat: 'Inicial', seg: 'Derivar', topic: 'cardiopatia-isquemia' },
    { code: '1.01.2.002', name: 'Disección aórtica', diag: 'Sospecha', trat: 'Inicial', seg: 'Derivar', topic: 'urgencias-reanimacion' },
    { code: '1.01.2.003', name: 'Embolia cardiogénica', diag: 'Específico', trat: 'Inicial', seg: 'Derivar', topic: 'arritmias' },
    { code: '1.01.2.004', name: 'Infarto agudo al miocardio', diag: 'Específico', trat: 'Inicial', seg: 'Completo', topic: 'cardiopatia-isquemia' },
    { code: '1.01.2.005', name: 'Insuficiencia cardíaca aguda', diag: 'Específico', trat: 'Inicial', seg: 'Derivar', topic: 'insuficiencia-cardiaca' },
    { code: '1.01.2.006', name: 'Paro cardiorespiratorio', diag: 'Específico', trat: 'Completo', seg: 'Derivar', topic: 'urgencias-reanimacion' },
    { code: '1.01.2.007', name: 'Shock', diag: 'Específico', trat: 'Inicial', seg: 'Derivar', topic: 'urgencias-reanimacion' },
    { code: '1.01.2.008', name: 'Taponamiento pericárdico', diag: 'Específico', trat: 'Inicial', seg: 'Derivar', topic: 'pericardio-infeccion' },
    { code: '1.01.2.009', name: 'Taqui y bradiarritmia con compromiso hemodinámico', diag: 'Específico', trat: 'Inicial', seg: 'Derivar', topic: 'arritmias' }
];

const CONOCIMIENTOS_GENERALES = [
    { code: '1.01.3.001', name: 'Alimentación saludable', topic: 'hta-riesgo' },
    { code: '1.01.3.002', name: 'Cardiopatía y embarazo', topic: 'valvulopatias' },
    { code: '1.01.3.003', name: 'Manejo del paciente en tratamiento anticoagulante', topic: 'hta-riesgo' },
    { code: '1.01.3.004', name: 'Obesidad y sobrepeso', topic: 'insuficiencia-cardiaca' },
    { code: '1.01.3.005', name: 'Prevención de enfermedad reumática', topic: 'pericardio-infeccion' },
    { code: '1.01.3.006', name: 'Sedentarismo vs actividad física', topic: 'hta-riesgo' },
    { code: '1.01.3.007', name: 'Tabaquismo: prevención, cesación y efectos nocivos', topic: 'hta-riesgo' }
];

const EXAMENES = [
    { code: '1.01.4.001', name: 'Coronariografía', level: 'Interpreta y emplea', topic: 'cardiopatia-isquemia' },
    { code: '1.01.4.002', name: 'Angiotac de tórax y aorta', level: 'Emplea informe', topic: 'urgencias-reanimacion' },
    { code: '1.01.4.003', name: 'Radiografía de tórax', level: 'Interpreta y emplea', topic: 'urgencias-reanimacion' },
    { code: '1.01.4.005', name: 'Cintigrafía de perfusión miocárdica', level: 'Emplea informe', topic: 'cardiopatia-isquemia' },
    { code: '1.01.4.006', name: 'Ecocardiografía', level: 'Emplea informe', topic: 'insuficiencia-cardiaca' },
    { code: '1.01.4.007', name: 'Electrocardiograma', level: 'Realiza, interpreta y emplea', topic: 'arritmias' },
    { code: '1.01.4.008', name: 'Test de esfuerzo', level: 'Emplea informe', topic: 'cardiopatia-isquemia' },
    { code: '1.01.4.009', name: 'Enzimas cardíacas (CPK, MB, troponinas)', level: 'Interpreta y emplea', topic: 'cardiopatia-isquemia' },
    { code: '1.01.4.010', name: 'Hemograma y velocidad de sedimentación (VHS)', level: 'Interpreta y emplea', topic: 'pericardio-infeccion' },
    { code: '1.01.4.011', name: 'Holter de presión arterial', level: 'Emplea informe', topic: 'hta-riesgo' },
    { code: '1.01.4.012', name: 'Perfil bioquímico', level: 'Interpreta y emplea', topic: 'hta-riesgo' },
    { code: '1.01.4.013', name: 'Perfil lipídico', level: 'Interpreta y emplea', topic: 'hta-riesgo' },
    { code: '1.01.4.014', name: 'Holter de ritmo', level: 'Emplea informe', topic: 'arritmias' }
];

const PROCEDIMIENTOS = [
    { code: '1.01.5.002', name: 'Cardioversión eléctrica', level: 'Derivar a especialista', topic: 'arritmias' },
    { code: '1.01.5.003', name: 'Cateterismo venoso central', level: 'Derivar a especialista', topic: 'urgencias-reanimacion' },
    { code: '1.01.5.004', name: 'Desfibrilación', level: 'Realizar', topic: 'urgencias-reanimacion' },
    { code: '1.01.5.005', name: 'Intubación traqueal', level: 'Realizar', topic: 'urgencias-reanimacion' },
    { code: '1.01.5.006', name: 'Resucitación cardiorespiratoria', level: 'Realizar', topic: 'urgencias-reanimacion' },
    { code: '1.01.5.007', name: 'Punción pericárdica', level: 'Derivar a especialista', topic: 'pericardio-infeccion' },
    { code: '1.01.5.008', name: 'Punción venosa', level: 'Realizar', topic: 'hta-riesgo' },
    { code: '1.01.5.009', name: 'Trombolisis', level: 'Realizar', topic: 'cardiopatia-isquemia' }
];

// Helper to collect codes covered by a specific topic ID
function getCodesForTopic(topicId) {
    const codes = [];
    SITUACIONES_CLINICAS.forEach(x => { if (x.topic === topicId) codes.push(x.code); });
    SITUACIONES_URGENCIAS.forEach(x => { if (x.topic === topicId) codes.push(x.code); });
    CONOCIMIENTOS_GENERALES.forEach(x => { if (x.topic === topicId) codes.push(x.code); });
    EXAMENES.forEach(x => { if (x.topic === topicId) codes.push(x.code); });
    PROCEDIMIENTOS.forEach(x => { if (x.topic === topicId) codes.push(x.code); });
    return codes;
}

let html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>EUNACOM V3 - Libro de Cardiología</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        body {
            font-family: 'Inter', Helvetica, Arial, sans-serif;
            color: #1f2937;
            line-height: 1.5;
            margin: 0;
            padding: 0;
            background-color: #ffffff;
            font-size: 10pt;
        }

        /* Page Layout & Breaks */
        .page-break { page-break-before: always; }
        .avoid-break { page-break-inside: avoid; }
        
        /* Cover Page */
        .cover {
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: center;
            padding: 40px;
            box-sizing: border-box;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            color: #ffffff;
            text-align: center;
            page-break-after: always;
        }
        .cover-top {
            margin-top: 60px;
        }
        .cover-tag {
            background-color: #ef4444;
            color: white;
            padding: 6px 16px;
            font-weight: 800;
            font-size: 10pt;
            border-radius: 9999px;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            display: inline-block;
            margin-bottom: 20px;
        }
        .cover-title {
            font-size: 36pt;
            font-weight: 800;
            line-height: 1.1;
            margin: 0 0 15px 0;
            letter-spacing: -1.5px;
            background: linear-gradient(to right, #fca5a5, #f87171, #ef4444);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .cover-subtitle {
            font-size: 15pt;
            font-weight: 500;
            color: #94a3b8;
            max-width: 600px;
            margin: 0 auto;
        }
        .cover-middle {
            margin: 40px 0;
        }
        .cover-heartbeat {
            font-size: 70pt;
            color: #ef4444;
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.08); }
            100% { transform: scale(1); }
        }
        .cover-bottom {
            margin-bottom: 60px;
            border-top: 1px solid #334155;
            padding-top: 25px;
            width: 80%;
            max-width: 450px;
        }
        .cover-meta {
            font-size: 11pt;
            color: #64748b;
            margin-bottom: 5px;
        }
        
        /* Interactive Index / Tables */
        .toc-page {
            padding: 30px;
            box-sizing: border-box;
            background-color: #ffffff;
            page-break-after: always;
        }
        .toc-area-header {
            font-size: 11pt;
            font-weight: 700;
            color: #ef4444;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 2px;
        }
        .toc-title {
            font-size: 24pt;
            font-weight: 800;
            color: #0f172a;
            margin-top: 0;
            margin-bottom: 5px;
        }
        .toc-subtitle {
            font-size: 13pt;
            font-weight: 600;
            color: #475569;
            margin-bottom: 20px;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 10px;
        }
        .section-header {
            font-size: 12pt;
            font-weight: 700;
            color: #1e293b;
            margin-top: 25px;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        /* Interactive profile tables */
        .profile-table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0 20px 0;
            font-size: 8.5pt;
        }
        .profile-table th {
            background-color: #f1f5f9;
            color: #334155;
            font-weight: 700;
            text-align: left;
            padding: 6px 10px;
            border: 1px solid #cbd5e1;
        }
        .profile-table td {
            padding: 6px 10px;
            border: 1px solid #e2e8f0;
            vertical-align: middle;
        }
        .profile-table tr:nth-child(even) {
            background-color: #f8fafc;
        }
        .profile-table tr:hover {
            background-color: #eff6ff;
        }
        .index-link {
            text-decoration: none;
            color: #2563eb;
            font-weight: 600;
            display: block;
        }
        .index-link-text {
            text-decoration: none;
            color: #1e293b;
            font-weight: 500;
            display: block;
        }
        .index-link:hover, .index-link-text:hover {
            color: #ef4444;
            text-decoration: underline;
        }

        /* Generic Content Styles */
        .chapter-header {
            border-bottom: 2px solid #ef4444;
            padding-bottom: 8px;
            margin-top: 35px;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .chapter-icon {
            font-size: 24pt;
        }
        .chapter-title {
            font-size: 18pt;
            font-weight: 800;
            color: #0f172a;
            margin: 0;
        }
        
        h3 {
            font-size: 12pt;
            font-weight: 700;
            color: #1e3a8a;
            margin-top: 25px;
            margin-bottom: 10px;
            border-left: 4px solid #3b82f6;
            padding-left: 10px;
        }
        
        p {
            margin-top: 0;
            margin-bottom: 12px;
            text-align: justify;
        }

        /* Content block tables */
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            font-size: 9pt;
            page-break-inside: avoid;
        }
        th {
            background-color: #1e293b;
            color: #ffffff;
            font-weight: 700;
            text-align: left;
            padding: 8px 12px;
            border: 1px solid #334155;
        }
        td {
            padding: 8px 12px;
            border: 1px solid #e2e8f0;
        }
        tr:nth-child(even) {
            background-color: #f8fafc;
        }

        /* High Yield Pearls Box */
        .pearls-section {
            background-color: #fef2f2;
            border-left: 5px solid #ef4444;
            padding: 15px;
            border-radius: 4px;
            margin: 25px 0;
            page-break-inside: avoid;
        }
        .pearls-title {
            font-size: 11pt;
            font-weight: 800;
            color: #991b1b;
            margin-top: 0;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .pearls-list {
            margin: 0;
            padding-left: 20px;
        }
        .pearls-list li {
            margin-bottom: 8px;
            font-size: 9.5pt;
        }

        /* Flashcard Cloze Display */
        .flashcards-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 12px;
            margin: 20px 0;
            page-break-inside: avoid;
        }
        .flashcard-card {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 12px 16px;
        }
        .flashcard-front {
            font-weight: 700;
            color: #0f172a;
            font-size: 9.5pt;
            margin-bottom: 6px;
        }
        .flashcard-back {
            color: #ef4444;
            font-weight: 600;
            font-size: 9.5pt;
            border-top: 1px dashed #cbd5e1;
            padding-top: 6px;
        }

        /* Rapid Checks & Practice Questions */
        .question-box {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
            page-break-inside: avoid;
        }
        .question-header {
            font-size: 9pt;
            font-weight: 700;
            color: #64748b;
            margin-bottom: 5px;
            text-transform: uppercase;
        }
        .question-text {
            font-size: 10pt;
            font-weight: 600;
            color: #0f172a;
            margin-bottom: 12px;
        }
        .options-list {
            list-style: none;
            padding: 0;
            margin: 0 0 15px 0;
        }
        .option-item {
            padding: 6px 12px;
            margin-bottom: 6px;
            border-radius: 4px;
            font-size: 9.5pt;
            background-color: #ffffff;
            border: 1px solid #e2e8f0;
        }
        .option-item.correct {
            border-color: #10b981;
            background-color: #ecfdf5;
            color: #065f46;
            font-weight: 600;
        }
        .explanation-box {
            font-size: 9pt;
            line-height: 1.45;
            color: #4b5563;
            border-top: 1px solid #e2e8f0;
            padding-top: 10px;
            margin-top: 10px;
        }
    </style>
</head>
<body>

    <!-- Cover Page -->
    <div class="cover">
        <div class="cover-top">
            <span class="cover-tag">EUNACOM Medicina Interna</span>
            <h1 class="cover-title">CARDIOLOGÍA</h1>
            <div class="cover-subtitle">Libro de Conceptos Clave y Alta Complejidad</div>
        </div>
        <div class="cover-middle">
            <div class="cover-heartbeat">♥</div>
        </div>
        <div class="cover-bottom">
            <div class="cover-meta"><strong>Perfil de Conocimientos V3</strong> (Diciembre 2026)</div>
            <div class="cover-meta">Estructura dinámica de preparación EUNACOM</div>
            <div class="cover-meta" style="margin-top: 15px; font-size: 9.5pt; color: #475569;">Generado: ${meta.generated}</div>
        </div>
    </div>

    <!-- Table of Contents Page 1 (Interactive Index) -->
    <div class="toc-page">
        <div class="toc-area-header">Medicina Interna</div>
        <h1 class="toc-title">Cardiología</h1>
        <div class="toc-subtitle">Índice del Perfil de Conocimientos (Haga clic para navegar)</div>
        
        <div class="section-header">Situaciones Clínicas (1.01.1)</div>
        <table class="profile-table">
            <thead>
                <tr>
                    <th style="width: 14%;">Código</th>
                    <th style="width: 46%;">Situación Clínica</th>
                    <th style="width: 14%;">Diagnóstico</th>
                    <th style="width: 13%;">Tratamiento</th>
                    <th style="width: 9%;">Seguimiento</th>
                    <th style="width: 4%; text-align: center;">Pág.</th>
                </tr>
            </thead>
            <tbody>
`;

SITUACIONES_CLINICAS.forEach(row => {
    html += `
                <tr>
                    <td><a href="#topic-${row.topic}" class="index-link">${row.code}</a></td>
                    <td><a href="#topic-${row.topic}" class="index-link-text">${row.name}</a></td>
                    <td>${row.diag}</td>
                    <td>${row.trat}</td>
                    <td>${row.seg}</td>
                    <td style="text-align: center; font-weight: bold; color: #ef4444;">{{PAGE_${row.topic}}}</td>
                </tr>
    `;
});

html += `
            </tbody>
        </table>
    </div>

    <!-- Table of Contents Page 2 (Interactive Index) -->
    <div class="toc-page">
        <div class="section-header">Situaciones Clínicas de Urgencia (1.01.2)</div>
        <table class="profile-table">
            <thead>
                <tr>
                    <th style="width: 14%;">Código</th>
                    <th style="width: 46%;">Situación de Urgencia</th>
                    <th style="width: 14%;">Diagnóstico</th>
                    <th style="width: 13%;">Tratamiento</th>
                    <th style="width: 9%;">Seguimiento</th>
                    <th style="width: 4%; text-align: center;">Pág.</th>
                </tr>
            </thead>
            <tbody>
`;

SITUACIONES_URGENCIAS.forEach(row => {
    html += `
                <tr>
                    <td><a href="#topic-${row.topic}" class="index-link">${row.code}</a></td>
                    <td><a href="#topic-${row.topic}" class="index-link-text">${row.name}</a></td>
                    <td>${row.diag}</td>
                    <td>${row.trat}</td>
                    <td>${row.seg}</td>
                    <td style="text-align: center; font-weight: bold; color: #ef4444;">{{PAGE_${row.topic}}}</td>
                </tr>
    `;
});

html += `
            </tbody>
        </table>

        <div class="section-header">Conocimientos Generales (1.01.3)</div>
        <table class="profile-table" style="margin-bottom: 25px;">
            <thead>
                <tr>
                    <th style="width: 14%;">Código</th>
                    <th style="width: 82%;">Tema General</th>
                    <th style="width: 4%; text-align: center;">Pág.</th>
                </tr>
            </thead>
            <tbody>
`;

CONOCIMIENTOS_GENERALES.forEach(row => {
    html += `
                <tr>
                    <td><a href="#topic-${row.topic}" class="index-link">${row.code}</a></td>
                    <td><a href="#topic-${row.topic}" class="index-link-text">${row.name}</a></td>
                    <td style="text-align: center; font-weight: bold; color: #ef4444;">{{PAGE_${row.topic}}}</td>
                </tr>
    `;
});

html += `
            </tbody>
        </table>
    </div>

    <!-- Table of Contents Page 3 (Interactive Index) -->
    <div class="toc-page">
        <div class="section-header">Exámenes e Imagenología (1.01.4)</div>
        <table class="profile-table">
            <thead>
                <tr>
                    <th style="width: 14%;">Código</th>
                    <th style="width: 46%;">Examen / Imagen</th>
                    <th style="width: 36%;">Nivel Requerido</th>
                    <th style="width: 4%; text-align: center;">Pág.</th>
                </tr>
            </thead>
            <tbody>
`;

EXAMENES.forEach(row => {
    html += `
                <tr>
                    <td><a href="#topic-${row.topic}" class="index-link">${row.code}</a></td>
                    <td><a href="#topic-${row.topic}" class="index-link-text">${row.name}</a></td>
                    <td>${row.level}</td>
                    <td style="text-align: center; font-weight: bold; color: #ef4444;">{{PAGE_${row.topic}}}</td>
                </tr>
    `;
});

html += `
            </tbody>
        </table>

        <div class="section-header">Procedimientos Diagnósticos y Terapéuticos (1.01.5)</div>
        <table class="profile-table">
            <thead>
                <tr>
                    <th style="width: 14%;">Código</th>
                    <th style="width: 46%;">Procedimiento</th>
                    <th style="width: 36%;">Nivel Requerido</th>
                    <th style="width: 4%; text-align: center;">Pág.</th>
                </tr>
            </thead>
            <tbody>
`;

PROCEDIMIENTOS.forEach(row => {
    html += `
                <tr>
                    <td><a href="#topic-${row.topic}" class="index-link">${row.code}</a></td>
                    <td><a href="#topic-${row.topic}" class="index-link-text">${row.name}</a></td>
                    <td>${row.level}</td>
                    <td style="text-align: center; font-weight: bold; color: #ef4444;">{{PAGE_${row.topic}}}</td>
                </tr>
    `;
});

html += `
            </tbody>
        </table>
    </div>
`;

// Build Chapter Content
topics.forEach((t, index) => {
    // Add page break and anchor ID
    html += `
        <!-- Chapter: ${t.title} -->
        <div class="page-break" id="topic-${t.id}">
            <!-- Page Number Locator Tag -->
            <span style="color: #ffffff; font-size: 8px;">__LOC_${t.id}__</span>
            
            <div class="chapter-header">
                <span class="chapter-icon">${t.icon}</span>
                <h2 class="chapter-title">${t.title}</h2>
            </div>
    `;

    // Add Covered EUNACOM Codes block directly at the top of the chapter content
    const coveredCodes = getCodesForTopic(t.id);
    if (coveredCodes.length > 0) {
        html += `
            <div style="background-color: #f1f5f9; border-left: 4px solid #475569; border-radius: 4px; padding: 10px 15px; margin-bottom: 25px; font-size: 8.8pt; color: #334155; line-height: 1.45;">
                <strong style="color: #0f172a; text-transform: uppercase; font-size: 8pt; letter-spacing: 0.5px; display: block; margin-bottom: 5px;">Códigos del Perfil Cubiertos:</strong>
                ${coveredCodes.map(c => `<span style="background-color: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-weight: 700; margin-right: 6px; display: inline-block; margin-bottom: 4px;">${c}</span>`).join('')}
            </div>
        `;
    }

    // 1. Render Didactic Lessons HTML
    t.lesson.forEach(block => {
        if (block.type === 'text') {
            html += block.html;
        } else if (block.type === 'rapid_check') {
            html += `
                <div class="question-box">
                    <div class="question-header">Chequeo Rápido - Didáctico</div>
                    <div class="question-text">${block.question}</div>
                    <ul class="options-list">
            `;
            block.options.forEach(opt => {
                const optLetter = opt.charAt(0);
                const isCorrect = optLetter === block.correct;
                const correctClass = isCorrect ? 'correct' : '';
                html += `
                    <li class="option-item ${correctClass}">
                        ${opt}
                    </li>
                `;
            });
            html += `
                    </ul>
                    <div class="explanation-box">
                        <strong>💡 Pista/Explicación:</strong> ${block.wrong_hint}
                    </div>
                </div>
            `;
        }
    });

    // 2. Render Pearls (Clave EUNACOM)
    if (t.pearls && t.pearls.length > 0) {
        html += `
            <div class="pearls-section">
                <div class="pearls-title">🎯 FOCO EUNACOM (PUNTOS CLAVE)</div>
                <ul class="pearls-list">
        `;
        t.pearls.forEach(p => {
            html += `<li><strong>${p.cat}:</strong> ${p.pearl}</li>`;
        });
        html += `
                </ul>
            </div>
        `;
    }

    // 3. Render Flashcards Grid
    if (t.flashcards && t.flashcards.length > 0) {
        html += `
            <h3>Tarjetas de Memoria (Active Recall)</h3>
            <div class="flashcards-grid">
        `;
        t.flashcards.forEach(fc => {
            const match = fc.cloze.match(/^(.+?)\s*→\s*\{\{c\d+::(.*?)\}\}/);
            const front = match ? match[1] : fc.cloze;
            const back = match ? match[2] : "";
            html += `
                <div class="flashcard-card">
                    <div class="flashcard-front">Pregunta: ${front}</div>
                    <div class="flashcard-back">Respuesta: ${back}</div>
                </div>
            `;
        });
        html += `
            </div>
        `;
    }

    // 4. Render Practice Questions (MCQs)
    if (t.questions && t.questions.length > 0) {
        html += `
            <h3 style="page-break-before: avoid;">Preguntas de Práctica Vinculadas</h3>
        `;
        t.questions.forEach((q, qIndex) => {
            html += `
                <div class="question-box">
                    <div class="question-header">Pregunta de Examen ${qIndex + 1}</div>
                    <div class="question-text">${q.pregunta}</div>
                    <ul class="options-list">
            `;
            (q.opciones || []).forEach(opt => {
                const optLetter = opt.substring(0, 1);
                const isCorrect = optLetter === q.respuestaCorrecta;
                const correctClass = isCorrect ? 'correct' : '';
                html += `
                    <li class="option-item ${correctClass}">
                        ${opt}
                    </li>
                `;
            });
            html += `
                    </ul>
                    <div class="explanation-box">
                        <strong>Explicación:</strong> ${q.explicacion}
                    </div>
                </div>
            `;
        });
    }

    html += `
        </div>
    `;
});

html += `
</body>
</html>
`;

// Start Puppeteer PDF compilation (two-pass for page numbers)
(async () => {
    console.log("Launching Puppeteer...");
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    console.log("Pass 1: Rendering initial PDF layout...");
    await page.setContent(html, { waitUntil: 'load', timeout: 0 });
    
    const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '15mm', right: '15mm', bottom: '20mm', left: '15mm' },
        displayHeaderFooter: true,
        headerTemplate: '<div></div>',
        footerTemplate: '<div style="width: 100%; text-align: right; font-size: 9px; color: #64748b; font-family: Helvetica; font-weight: bold; padding-right: 15mm;"><span class="pageNumber"></span></div>'
    });
    
    console.log("Parsing PDF layout for Table of Contents page mapping...");
    const pdfParse = require('pdf-parse');
    const pageMapping = {};
    
    function render_page(pageData) {
        let render_options = { normalizeWhitespace: false, disableCombineTextItems: false };
        return pageData.getTextContent(render_options).then(function(textContent) {
            let text = '';
            for (let item of textContent.items) {
                text += item.str + ' ';
            }
            // Strip all spaces to bypass the PDF character-spacing parsing artifact
            const cleanText = text.replace(/\s+/g, '');
            const regex = /__LOC_([a-zA-Z0-9-]+)__/g;
            let match;
            while ((match = regex.exec(cleanText)) !== null) {
                pageMapping[match[1]] = pageData.pageIndex + 1;
            }
            return text;
        });
    }
    
    await pdfParse(pdfBuffer, { pagerender: render_page });
    console.log("Found page mappings:", pageMapping);
    
    let finalHtml = html;
    Object.keys(pageMapping).forEach(key => {
        finalHtml = finalHtml.replace(new RegExp(`{{PAGE_${key}}}`, 'g'), pageMapping[key]);
    });
    
    // Replace any fallback
    finalHtml = finalHtml.replace(/{{PAGE_[a-zA-Z0-9-]+}}/g, '?');
    // Strip locator tags
    finalHtml = finalHtml.replace(/<span style="color: #ffffff; font-size: 8px;">__LOC_[a-zA-Z0-9-]+__<\/span>/g, '');
    
    console.log("Pass 2: Generating final hyperlinked PDF...");
    await page.setContent(finalHtml, { waitUntil: 'load', timeout: 0 });
    
    await page.pdf({
        path: outPath,
        format: 'A4',
        printBackground: true,
        margin: { top: '15mm', right: '15mm', bottom: '20mm', left: '15mm' },
        displayHeaderFooter: true,
        headerTemplate: '<div></div>',
        footerTemplate: '<div style="width: 100%; text-align: right; font-size: 9px; color: #64748b; font-family: Helvetica; font-weight: bold; padding-right: 15mm;">Página <span class="pageNumber"></span> de <span class="totalPages"></span></div>'
    });
    
    await browser.close();
    
    // Copy to the app's static data folder for access in client UI
    const publicPdfPath = '/Users/felipeyanez/Desktop/NEWeunacom/eunacom-app-v2/public/data/study-guides/cardiologia-libro.pdf';
    fs.copyFileSync(outPath, publicPdfPath);
    console.log(`✅ Beautiful PDF successfully generated and saved to: ${outPath} and ${publicPdfPath}`);
})();
