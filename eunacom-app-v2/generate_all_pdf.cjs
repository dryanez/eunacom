const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const pdfParse = require('pdf-parse');

const dataDir = '/Users/felipeyanez/Desktop/NEWeunacom/eunacom-app-v2/public/data/reconstrucciones';
const pubDir = '/Users/felipeyanez/Desktop/NEWeunacom/eunacom-app-v2/public';

const indexJson = JSON.parse(fs.readFileSync(`${dataDir}/index.json`));
const topicIndex = JSON.parse(fs.readFileSync(`${dataDir}/topic_index.json`));

// Build category map
const qToCategory = {};

function processQuestions(questions, subjectName, topicName) {
    if (!questions) return;
    questions.forEach(q => {
        qToCategory[q.id] = { subject: subjectName, topic: topicName };
    });
}

topicIndex.forEach(subj => {
    const subjectName = subj.subject || subj.name;
    
    if (subj.questions) {
        processQuestions(subj.questions, subjectName, 'General');
    }
    
    if (subj.topics) {
        subj.topics.forEach(top => {
            if (top.questions) {
                processQuestions(top.questions, subjectName, top.name);
            }
            if (top.subtopics) {
                top.subtopics.forEach(subtop => {
                    if (subtop.questions) {
                        processQuestions(subtop.questions, subjectName, top.name);
                    }
                });
            }
        });
    }
});

function guessCategory(questionText) {
    if (!questionText) return { subject: 'Medicina General', topic: 'General' };
    const q = questionText.toLowerCase();
    
    if (q.match(/embaraz|gestante|parto|cesárea|puerperio|amenorrea|menstrua|ovario|útero|cérvix|vagina|mioma|preeclampsia|eclampsia|feto|obstétric|ginecológic|pap|mamografía/)) return { subject: 'Obstetricia y Ginecología', topic: 'General' };
    if (q.match(/niño|niña|lactante|recién nacido|pediátric|escolar|menor de|meses de vida/)) return { subject: 'Pediatría', topic: 'General' };
    if (q.match(/psiquiat|depresi|ansiedad|esquizofrenia|bipolar|suicid|antidepresivo|neuroléptico|psicosis|delirio|obsesivo|compulsivo|alcoholismo/)) return { subject: 'Psiquiatría', topic: 'General' };
    if (q.match(/cirugía|quirúrgic|apendicitis|colecistitis|hernia|obstrucción intestinal|postoperatori|laparotomía|abdomen agudo|peritonitis/)) return { subject: 'Cirugía', topic: 'General' };
    if (q.match(/cardiol|presión arterial|hipertensión|infarto|arritmia|electrocardiograma|soplo|insuficiencia cardíaca|valvular|ecocardiograma|taquicardia|bradicardia/)) return { subject: 'Cardiología', topic: 'General' };
    if (q.match(/respirator|asma|epoc|neumonía|tos|disnea|saturación|oxígeno|pulmón|pleural|bronquitis/)) return { subject: 'Enfermedades Respiratorias', topic: 'General' };
    if (q.match(/gastro|diarrea|vómito|hígado|hepatitis|cirrosis|úlcera|reflujo|endoscopía|colon|sangrado digestivo/)) return { subject: 'Gastroenterología', topic: 'General' };
    if (q.match(/infecci|antibiótico|fiebre|vih|tuberculosis|sarna|sífilis|sepsis|vacuna|meningitis|bacteri/)) return { subject: 'Enfermedades Infecciosas', topic: 'General' };
    if (q.match(/endocrin|tiroides|hipertiroidismo|hipotiroidismo|cortisol|cushing|addison|calcio|paratiroides/)) return { subject: 'Endocrinología', topic: 'General' };
    if (q.match(/diabet|insulina|glicemia|nutrición|obesidad|colesterol/)) return { subject: 'Diabetes y Nutrición', topic: 'General' };
    if (q.match(/neurolog|cefalea|convulsiones|epilepsia|accidente cerebrovascular|acv|parkinson|alzheimer|coma|motor|sensitivo/)) return { subject: 'Neurología', topic: 'General' };
    if (q.match(/nefrolog|riñón|renal|creatinina|orina|hematuria|proteinuria|diálisis|ácido base|potasio/)) return { subject: 'Nefrología', topic: 'General' };
    if (q.match(/reumatol|artritis|artrosis|lupus|gota|articular|vasculitis|autoinmune/)) return { subject: 'Reumatología', topic: 'General' };
    if (q.match(/hematol|anemia|sangrado|plaquetas|leucemia|linfoma|coagulación|transfusión/)) return { subject: 'Hematología / Oncología', topic: 'General' };
    if (q.match(/traumatol|fractura|esguince|luxación|hueso|ortopedi|lesión ligamentosa/)) return { subject: 'Traumatología', topic: 'General' };
    if (q.match(/oftalmol|ojo|visión|catarata|glaucoma|conjuntivitis|retina/)) return { subject: 'Oftalmología', topic: 'General' };
    if (q.match(/dermatol|piel|lesión cutánea|melanoma|psoriasis|acné|dermatitis/)) return { subject: 'Dermatología', topic: 'General' };
    if (q.match(/orl|oído|audición|otitis|vértigo|faringitis|amigdalitis|nariz|sinusitis/)) return { subject: 'ORL', topic: 'General' };
    if (q.match(/urolog|próstata|testículo|cálculo|cólico renal|infección urinaria|itu|escroto/)) return { subject: 'Urología', topic: 'General' };
    if (q.match(/salud pública|epidemiología|incidencia|prevalencia|estudio de cohorte|ensayo clínico|auge|ges|minsal/)) return { subject: 'Salud Pública', topic: 'General' };
    
    return { subject: 'Medicina General', topic: 'General' };
}

// Sort exams by year (descending) and month
const monthOrder = {
    'Enero': 1, 'Julio': 7, 'Agosto': 8, 'Diciembre': 12
};
const sortedExams = indexJson.exams.sort((a, b) => {
    const scoreA = a.year * 100 + (monthOrder[a.month] || 0);
    const scoreB = b.year * 100 + (monthOrder[b.month] || 0);
    return scoreB - scoreA;
});

// Read logo as base64
const logoBase64 = fs.readFileSync(`${pubDir}/logo.png`, 'base64');
const logoDataUri = `data:image/png;base64,${logoBase64}`;

function getBase64Image(url) {
    const filePath = pubDir + url;
    if (fs.existsSync(filePath)) {
        const ext = filePath.split('.').pop();
        const base64 = fs.readFileSync(filePath, 'base64');
        return `data:image/${ext};base64,${base64}`;
    }
    return '';
}

function fixOCR(text) {
    if (!text) return '';
    return text
        .replace(/\b8([a-z]+)\b/g, 'ti$1')
        .replace(/([a-zA-ZáéíóúÁÉÍÓÚñÑ])8([a-zA-ZáéíóúÁÉÍÓÚñÑ])/g, '$1ti$2')
        .replace(/\bG([a-z]+)\b/g, 'ti$1')
        .replace(/([a-záéíóúñ])G([a-záéíóúñ])/g, '$1ti$2')
        .replace(/([a-záéíóúñ])2([a-záéíóúñ])/g, '$1ti$2')
        .replace(/\bFsic/g, 'Físic')
        .replace(/\bfsic/g, 'físic')
        .replace(/\b8empo\b/g, 'tiempo')
        .replace(/\b8ene\b/g, 'tiene')
        .replace(/\bhxps\b/g, 'https');
}

let html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #1f2937;
            line-height: 1.3;
            margin: 0;
            padding: 0;
        }
        .page-break { page-break-before: always; }
        .avoid-break { page-break-inside: avoid; }
        a { text-decoration: none; color: #2563eb; }
        
        .title-page {
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
        }
        .logo-img {
            max-width: 300px;
            margin-bottom: 40px;
        }
        .main-title {
            font-size: 42px;
            font-weight: 800;
            color: #1d4ed8;
            margin-bottom: 20px;
            letter-spacing: -1px;
        }
        .subtitle {
            font-size: 24px;
            color: #4b5563;
            margin-bottom: 40px;
        }
        .promo-box {
            background-color: #eff6ff;
            border: 2px dashed #3b82f6;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 30px;
            max-width: 600px;
        }
        .promo-text {
            font-size: 20px;
            font-weight: bold;
            color: #1e40af;
        }
        .cta-link {
            display: inline-block;
            background-color: #2563eb;
            color: white !important;
            padding: 12px 24px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: bold;
            font-size: 18px;
            margin-bottom: 40px;
        }
        .copyright {
            position: absolute;
            bottom: 40px;
            font-size: 14px;
            color: #9ca3af;
        }
        
        .header {
            font-size: 24px;
            font-weight: bold;
            border-bottom: 2px solid #1d4ed8;
            padding-bottom: 5px;
            margin-bottom: 15px;
            margin-top: 20px;
            color: #1d4ed8;
        }
        
        .category-breakdown {
            background: #f3f4f6;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 13px;
        }
        .category-breakdown h3 { margin-top: 0; font-size: 16px; color: #111827; }
        .category-breakdown ul { margin: 0; padding-left: 20px; }
        .category-breakdown li { margin-bottom: 5px; }
        
        .question-block {
            margin-bottom: 12px;
            padding: 10px;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            background: #f9fafb;
        }
        .q-number {
            font-weight: 800;
            font-size: 14px;
            color: #111827;
            margin-bottom: 8px;
        }
        .q-text {
            font-size: 13px;
            margin-bottom: 12px;
            text-align: justify;
        }
        .q-image {
            max-width: 100%;
            max-height: 250px;
            display: block;
            margin: 10px auto;
            border-radius: 4px;
            border: 1px solid #d1d5db;
        }
        .options {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .option {
            margin-bottom: 4px;
            padding: 6px 10px;
            background: #ffffff;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            font-size: 12px;
        }
        .option-letter {
            font-weight: 900;
            color: #2563eb;
            margin-right: 8px;
            font-size: 13px;
        }
        
        .answer-key table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        .answer-key th, .answer-key td {
            border: 1px solid #d1d5db;
            padding: 6px;
            text-align: left;
            vertical-align: top;
            font-size: 12px;
        }
        .answer-key th {
            background-color: #f3f4f6;
            font-weight: bold;
            color: #1f2937;
        }
    </style>
</head>
<body>

    <!-- Title Page -->
    <div class="title-page">
        <img src="${logoDataUri}" class="logo-img" alt="Logo">
        <div class="main-title">EUNACOM Reconstrucciones</div>
        <div class="subtitle">Recopilación Completa de Exámenes</div>
        
        <div class="promo-box">
            <p class="promo-text">Obtén un 50% de descuento con el código: <strong>Eunacom-</strong></p>
        </div>
        
        <a href="https://eunacom.app/reconstrucciones" class="cta-link">¡Haz tus reconstrucciones online aquí!</a>
        
        <div style="margin-top: auto; font-size: 14px; padding-top: 30px; border-top: 1px solid #d1d5db; color: #4b5563;">
        ¿Quieres hacer estas reconstrucciones online?<br>
        Visita: <a href="https://eunacom.famedtesprep.com/reconstrucciones" style="color: #2563eb; text-decoration: underline;">https://eunacom.famedtesprep.com/reconstrucciones</a>
    </div>
    </div>
    
    <div class="page-break"></div>
    
    <!-- Promo Page -->
    <div style="font-family: 'Helvetica', sans-serif; padding: 20px; text-align: center;">
        <h1 style="color: #1e40af; font-size: 30px; font-weight: 900; margin-bottom: 20px; text-transform: uppercase;">¡Prepárate con Famedtesprep!</h1>
        <p style="font-size: 15px; color: #4b5563; max-width: 800px; margin: 0 auto 15px auto; line-height: 1.6;">
            Únete a la plataforma más moderna y completa de Chile. Deja de estudiar con PDFs desactualizados. Te ofrecemos <strong>reconstrucciones interactivas, explicaciones detalladas y análisis de rendimiento inteligente</strong>.
        </p>

        <div style="margin-bottom: 25px;">
            <img src="${getBase64Image('/img/app-screenshot.png')}" style="max-width: 600px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border: 1px solid #e5e7eb;" />
        </div>
        
        <div style="display: flex; justify-content: center; gap: 20px; margin-bottom: 30px;">
            <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 15px; width: 30%;">
                <h3 style="color: #2563eb; font-size: 16px; margin-top: 0;">🚀 Inteligencia Artificial</h3>
                <p style="font-size: 12px; color: #4b5563;">Analizamos tus puntos débiles y te recomendamos exactamente qué estudiar.</p>
            </div>
            <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 15px; width: 30%;">
                <h3 style="color: #2563eb; font-size: 16px; margin-top: 0;">📱 100% Interactivo</h3>
                <p style="font-size: 12px; color: #4b5563;">Simula el examen real en cualquier dispositivo. Modo oscuro incluido.</p>
            </div>
            <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 15px; width: 30%;">
                <h3 style="color: #2563eb; font-size: 16px; margin-top: 0;">🥇 Top en el Mercado</h3>
                <p style="font-size: 12px; color: #4b5563;">La alternativa número 1 en Chile para médicos nacionales y extranjeros.</p>
            </div>
        </div>

        <h2 style="color: #111827; font-size: 22px; margin-bottom: 20px;">Planes de Suscripción</h2>
        <div style="display: flex; justify-content: center; gap: 15px; margin-bottom: 30px;">
            <div style="border: 2px solid #e5e7eb; border-radius: 10px; padding: 10px; width: 22%;">
                <h4 style="margin:0; font-size: 15px;">1 Mes</h4>
                <p style="font-size: 14px; font-weight: bold; color: #111827; margin: 5px 0;">$14.990</p>
                <p style="font-size: 11px; color: #6b7280; margin: 0;">Para repaso rápido</p>
            </div>
            <div style="border: 2px solid #e5e7eb; border-radius: 10px; padding: 10px; width: 22%;">
                <h4 style="margin:0; font-size: 15px;">3 Meses</h4>
                <p style="font-size: 14px; font-weight: bold; color: #111827; margin: 5px 0;">$34.990</p>
                <p style="font-size: 11px; color: #6b7280; margin: 0;">Preparación intensiva</p>
            </div>
            <div style="border: 2px solid #3b82f6; border-radius: 10px; padding: 10px; width: 22%; background: #eff6ff; position: relative;">
                <span style="position: absolute; top: -10px; right: 10px; background: #ef4444; color: white; font-size: 9px; padding: 2px 6px; border-radius: 4px; font-weight: bold;">MÁS POPULAR</span>
                <h4 style="margin:0; font-size: 15px; color: #1d4ed8;">6 Meses</h4>
                <p style="font-size: 14px; font-weight: bold; color: #1d4ed8; margin: 5px 0;">$54.990</p>
                <p style="font-size: 11px; color: #6b7280; margin: 0;">Estudio con calma</p>
            </div>
            <div style="border: 2px solid #e5e7eb; border-radius: 10px; padding: 10px; width: 22%;">
                <h4 style="margin:0; font-size: 15px;">1 Año</h4>
                <p style="font-size: 14px; font-weight: bold; color: #111827; margin: 5px 0;">$89.990</p>
                <p style="font-size: 11px; color: #6b7280; margin: 0;">Acceso total sin apuros</p>
            </div>
        </div>

        <div style="background: #fef08a; padding: 15px; border-radius: 10px; display: inline-block; margin-bottom: 30px; border: 2px dashed #ca8a04;">
            <h3 style="margin: 0; color: #854d0e; font-size: 18px;">🎉 ¡CÓDIGO DE DESCUENTO: <strong>DRYANEZ</strong>! 🎉</h3>
            <p style="margin: 5px 0 0 0; color: #a16207; font-weight: bold; font-size: 15px;">Usa este código hoy y obtén un 50% DE DESCUENTO INMEDIATO.</p>
        </div>

        <h3 style="color: #374151; font-size: 16px; margin-bottom: 15px;">Métodos de Pago Aceptados</h3>
        <div style="background: #f9fafb; padding: 15px; border-radius: 12px; text-align: left; max-width: 500px; margin: 0 auto;">
            <ul style="font-size: 13px; color: #4b5563; line-height: 1.8; list-style-type: none; padding: 0; margin: 0;">
                <li>✅ <strong>Mercado Libre / Mercado Pago</strong> (Tarjetas de crédito y débito)</li>
                <li>✅ <strong>PayPal</strong> (Internacional)</li>
                <li>✅ <strong>Transferencia Directa Cuenta RUT:</strong> 18.842-443-0</li>
            </ul>
        </div>
        
        <div style="margin-top: 30px;">
            <a href="https://eunacom.famedtesprep.com" style="background: #2563eb; color: white; text-decoration: none; padding: 10px 25px; border-radius: 8px; font-size: 15px; font-weight: bold;">¡Suscríbete Ahora!</a>
        </div>
    </div>

    <div class="page-break"></div>
`;

    // Index
    html += `<div class="header">Índice de Exámenes</div>
    <div style="font-size: 14px; line-height: 1.6; margin-top: 20px;">`;

sortedExams.forEach((exam, idx) => {
    html += `
    <div style="margin-bottom: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: baseline; font-weight: bold; font-size: 15px;">
            <div>${idx + 1}. <a href="#exam-${exam.id}" style="color: #111827; text-decoration: none;">${exam.name}</a></div>
            <div style="flex-grow: 1; border-bottom: 2px dotted #cbd5e1; margin: 0 10px; position: relative; top: -4px;"></div>
            <div style="color: #111827;"><a href="#exam-${exam.id}" style="color: #111827; text-decoration: none;">Pág. {{PAGE_exam-${exam.id}}}</a></div>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: baseline; padding-left: 20px; margin-top: 2px; font-size: 13px; color: #4b5563;">
            <div>↳ <a href="#key-${exam.id}" style="color: #4b5563; text-decoration: none;">Plantilla de Respuestas</a></div>
            <div style="flex-grow: 1; border-bottom: 1px dotted #e2e8f0; margin: 0 10px; position: relative; top: -4px;"></div>
            <div style="color: #4b5563;"><a href="#key-${exam.id}" style="color: #4b5563; text-decoration: none;">{{PAGE_key-${exam.id}}}</a></div>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: baseline; padding-left: 20px; margin-top: 2px; font-size: 13px; color: #4b5563;">
            <div>↳ <a href="#exp-${exam.id}" style="color: #4b5563; text-decoration: none;">Explicaciones Detalladas</a></div>
            <div style="flex-grow: 1; border-bottom: 1px dotted #e2e8f0; margin: 0 10px; position: relative; top: -4px;"></div>
            <div style="color: #4b5563;"><a href="#exp-${exam.id}" style="color: #4b5563; text-decoration: none;">{{PAGE_exp-${exam.id}}}</a></div>
        </div>
    </div>`;
});
html += `
    </div>

    <div class="page-break"></div>
`;

const letters = ['A', 'B', 'C', 'D', 'E'];

// Questions section
sortedExams.forEach((examInfo, examIndex) => {
    const examFile = JSON.parse(fs.readFileSync(`${dataDir}/${examInfo.file}`));
    
    // Add page break only for exams after the first one
    if (examIndex > 0) {
        html += `<div class="page-break"></div>`;
    }
    
    html += `<div id="exam-${examInfo.id}" class="header">${examInfo.name} <span style="color: white; font-size: 1px;">__LOC_exam-${examInfo.id}__</span></div>`;
    
    // Build breakdown for this exam
    const breakdown = {
        'Módulo 1 (Medicina Interna)': { total: 0, subjects: {} },
        'Módulo 2 (Cirugía, Psiquiatría y Especialidades)': { total: 0, subjects: {} },
        'Módulo 3 (Pediatría y Gineco-Obstetricia)': { total: 0, subjects: {} }
    };
    
    const moduleMapping = {
        'Cardiología': 'Módulo 1 (Medicina Interna)',
        'Enfermedades Respiratorias': 'Módulo 1 (Medicina Interna)',
        'Gastroenterología': 'Módulo 1 (Medicina Interna)',
        'Enfermedades Infecciosas': 'Módulo 1 (Medicina Interna)',
        'Endocrinología': 'Módulo 1 (Medicina Interna)',
        'Diabetes y Nutrición': 'Módulo 1 (Medicina Interna)',
        'Neurología': 'Módulo 1 (Medicina Interna)',
        'Nefrología': 'Módulo 1 (Medicina Interna)',
        'Reumatología': 'Módulo 1 (Medicina Interna)',
        'Hematología / Oncología': 'Módulo 1 (Medicina Interna)',
        'Medicina General': 'Módulo 1 (Medicina Interna)',
        
        'Cirugía': 'Módulo 2 (Cirugía, Psiquiatría y Especialidades)',
        'Psiquiatría': 'Módulo 2 (Cirugía, Psiquiatría y Especialidades)',
        'Salud Pública': 'Módulo 2 (Cirugía, Psiquiatría y Especialidades)',
        'Traumatología': 'Módulo 2 (Cirugía, Psiquiatría y Especialidades)',
        'Dermatología': 'Módulo 2 (Cirugía, Psiquiatría y Especialidades)',
        'ORL': 'Módulo 2 (Cirugía, Psiquiatría y Especialidades)',
        'Urología': 'Módulo 2 (Cirugía, Psiquiatría y Especialidades)',
        'Oftalmología': 'Módulo 2 (Cirugía, Psiquiatría y Especialidades)',
        
        'Pediatría': 'Módulo 3 (Pediatría y Gineco-Obstetricia)',
        'Obstetricia y Ginecología': 'Módulo 3 (Pediatría y Gineco-Obstetricia)'
    };
    
    examFile.questions.forEach((q, idx) => {
        const fullId = `${examInfo.id}_q${q.id}`;
        const questionText = q.question || q.pregunta || '';
        const cat = qToCategory[fullId] || guessCategory(questionText);
        
        let mod = moduleMapping[cat.subject];
        if (!mod) mod = 'Módulo 1 (Medicina Interna)'; // fallback
        
        breakdown[mod].total++;
        if (!breakdown[mod].subjects[cat.subject]) breakdown[mod].subjects[cat.subject] = { total: 0, topics: {} };
        breakdown[mod].subjects[cat.subject].total++;
        
        if (!breakdown[mod].subjects[cat.subject].topics[cat.topic]) breakdown[mod].subjects[cat.subject].topics[cat.topic] = [];
        breakdown[mod].subjects[cat.subject].topics[cat.topic].push(idx + 1);
    });
    
    // Render breakdown
    html += `<div class="category-breakdown" style="margin-bottom: 20px;">`;
    html += `<h3 style="text-align: center; font-size: 18px; margin-bottom: 15px;">Perfil del Examen (Distribución por áreas)</h3>`;
    html += `<div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-start;">`;
    
    Object.keys(breakdown).forEach(mod => {
        if (breakdown[mod].total === 0) return;
        
        html += `<div style="width: 48%; margin-bottom: 15px;">`;
        html += `<h4 style="margin: 0 0 8px 0; font-size: 14px; color: #1e40af; border-bottom: 1px solid #bfdbfe; padding-bottom: 4px;">${mod} - ${breakdown[mod].total} preguntas</h4>`;
        html += `<ul style="list-style-type: none; padding-left: 0; margin: 0; font-size: 12px;">`;
        
        const subjects = breakdown[mod].subjects;
        Object.keys(subjects).sort((a,b) => subjects[b].total - subjects[a].total).forEach(subj => {
            html += `<li style="margin-bottom: 6px;"><strong>${subj}</strong> <span style="color: #6b7280; font-size: 11px;">(${subjects[subj].total})</span>`;
            
            const topics = subjects[subj].topics;
            const topicKeys = Object.keys(topics);
            
            if (topicKeys.length > 0 && !(topicKeys.length === 1 && topicKeys[0] === 'General')) {
                html += `<ul style="list-style-type: disc; padding-left: 15px; margin-top: 3px; color: #4b5563;">`;
                topicKeys.forEach(top => {
                    const qLinks = topics[top].map(n => `<a href="#exam-${examInfo.id}-q-${n}" style="color:#6b7280;text-decoration:underline;">${n}</a>`).join(', ');
                    html += `<li>${top} - ${topics[top].length} preg. (${qLinks})</li>`;
                });
                html += `</ul>`;
            } else {
                const qLinks = topics['General'] ? topics['General'].map(n => `<a href="#exam-${examInfo.id}-q-${n}" style="color:#6b7280;text-decoration:underline;">${n}</a>`).join(', ') : '';
                html += ` <br><span style="color: #6b7280; font-size: 11px; display: block; line-height: 1.4;">Preguntas: ${qLinks}</span>`;
            }
            html += `</li>`;
        });
        
        html += `</ul></div>`;
    });
    html += `</div></div>`;
    
    // Page break before first question of the exam
    html += `<div class="page-break"></div>`;
    
    examFile.questions.forEach((q, idx) => {
        const questionText = fixOCR(q.question || q.pregunta);
        
        html += `
        <div id="exam-${examInfo.id}-q-${idx + 1}" class="question-block avoid-break">
            <div class="q-number">Pregunta ${idx + 1}</div>
            <div class="q-text">${questionText}</div>
        `;
        
        if (q.imageUrl) {
            const b64 = getBase64Image(q.imageUrl);
            if (b64) {
                html += `<img src="${b64}" class="q-image" />`;
            }
        }
        
        html += `<ul class="options">`;
        
        const options = q.options || q.opciones || [];
        options.forEach((opt, i) => {
            let text = fixOCR(opt);
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
    
    // Compact Answer Key for this test
    html += `<div class="page-break"></div>`;
    html += `<div id="key-${examInfo.id}" class="header" style="font-size: 20px; text-align: center;">Plantilla de Respuestas: ${examInfo.name} <span style="color: white; font-size: 1px;">__LOC_key-${examInfo.id}__</span></div>`;
    html += `<table style="width: 100%; border-collapse: collapse; font-size: 11px; text-align: center; margin-top: 15px;"><tbody>`;
    
    const totalQ = examFile.questions.length;
    const cols = 10;
    const rows = Math.ceil(totalQ / cols);
    
    for (let r = 0; r < rows; r++) {
        html += `<tr>`;
        for (let c = 0; c < cols; c++) {
            const index = r * cols + c;
            if (index < totalQ) {
                const q = examFile.questions[index];
                let ans = (q.correctAnswer || q.respuesta_correcta || q.respuestaCorrecta || '').toUpperCase();
                if (!ans.match(/^[A-E]$/i)) ans = '-';
                html += `<td style="border: 1px solid #d1d5db; padding: 4px;"><strong>${index + 1}.</strong> <span style="color: #059669; font-weight: 900;">${ans}</span></td>`;
            } else {
                html += `<td style="border: 1px solid #d1d5db; padding: 4px;"></td>`;
            }
        }
        html += `</tr>`;
    }
    html += `</tbody></table>`;
    
    // Link to explanations
    html += `<div style="text-align: center; margin-top: 30px; margin-bottom: 20px;">
        <a href="#exp-${examInfo.id}" style="display: inline-block; background-color: #2563eb; color: white; padding: 10px 20px; border-radius: 6px; font-weight: bold; text-decoration: none; font-size: 14px;">
            ¡Haz clic aquí para ir a las Explicaciones Detalladas!
        </a>
    </div>`;
});

// Answer Keys section
html += `<div class="page-break"></div>
<div id="claves" class="header" style="font-size: 32px; text-align: center; margin-top: 60px;">Explicaciones Detalladas</div>`;

sortedExams.forEach(examInfo => {
    const examFile = JSON.parse(fs.readFileSync(`${dataDir}/${examInfo.file}`));
    
    html += `
    <div id="exp-${examInfo.id}" class="header" style="font-size: 20px; margin-top: 30px;"><a href="#exam-${examInfo.id}">Explicaciones: ${examInfo.name}</a> <span style="color: white; font-size: 1px;">__LOC_exp-${examInfo.id}__</span></div>
    <div class="answer-key">
        <table>
            <thead>
                <tr>
                    <th style="width: 8%">Nº</th>
                    <th style="width: 12%">Respuesta</th>
                    <th style="width: 80%">Explicación</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    examFile.questions.forEach((q, idx) => {
        let ans = (q.correctAnswer || q.respuesta_correcta || q.respuestaCorrecta || '').toUpperCase();
        if (!ans.match(/^[A-E]$/i)) {
            ans = '-';
        }
        const exp = fixOCR(q.explanation || q.explicacion || q.respuesta_texto || '');
        
        html += `
            <tr class="avoid-break">
                <td><a href="#exam-${examInfo.id}-q-${idx + 1}"><strong>${idx + 1}</strong></a></td>
                <td style="color: #059669; font-weight: 900; font-size: 14px; text-align: center;">${ans}</td>
                <td style="font-size: 11.5px; text-align: justify;">${exp}</td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
    </div>
    `;
});

html += `
</body>
</html>
`;

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    console.log("Pass 1: Rendering PDF to calculate page numbers...");
    await page.setContent(html, { waitUntil: 'load', timeout: 0 });
    
    const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '12mm', right: '12mm', bottom: '15mm', left: '12mm' },
        displayHeaderFooter: true,
        headerTemplate: '<div></div>',
        footerTemplate: '<div style="width: 100%; text-align: right; font-size: 11px; color: #4b5563; font-family: Helvetica; font-weight: bold; padding-right: 15mm;"><span class="pageNumber"></span></div>'
    });
    
    console.log("Parsing PDF layout for page numbers...");
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
    console.log("Found mappings:", Object.keys(pageMapping).length);
    
    let finalHtml = html;
    Object.keys(pageMapping).forEach(key => {
        finalHtml = finalHtml.replace(new RegExp(`{{PAGE_${key}}}`, 'g'), pageMapping[key]);
    });
    
    // Replace missing
    finalHtml = finalHtml.replace(/{{PAGE_[a-zA-Z0-9-]+}}/g, '?');
    // Strip LOC tags
    finalHtml = finalHtml.replace(/<span style="color: white; font-size: 1px;">__LOC_[a-zA-Z0-9-]+__<\/span>/g, '');
    
    console.log("Pass 2: Generating final PDF with accurate Index...");
    await page.setContent(finalHtml, { waitUntil: 'load', timeout: 0 });
    
    await page.pdf({
        path: '/Users/felipeyanez/.gemini/antigravity/brain/8fbf6583-737c-4c04-9fb1-4184c67d057c/reconstrucciones_completas_optimizado.pdf',
        format: 'A4',
        printBackground: true,
        margin: { top: '12mm', right: '12mm', bottom: '15mm', left: '12mm' },
        displayHeaderFooter: true,
        headerTemplate: '<div></div>',
        footerTemplate: '<div style="width: 100%; text-align: right; font-size: 11px; color: #4b5563; font-family: Helvetica; font-weight: bold; padding-right: 15mm;"><span class="pageNumber"></span></div>'
    });
    
    await browser.close();
    console.log("Hyperlinked PDF created successfully!");
})();
