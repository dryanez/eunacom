const fs = require('fs');
const path = require('path');

const svgDir = path.join(__dirname, 'generate-book', 'svg_diagrams');
if (!fs.existsSync(svgDir)) {
  fs.mkdirSync(svgDir, { recursive: true });
}

function createBoxSvg(title, steps) {
  // Generate a clean 600x320 SVG flowchart matching the navy/blue theme
  const width = 680;
  const height = 280;

  let boxesHtml = '';
  let linesHtml = '';

  const stepCount = steps.length;
  const boxWidth = Math.min(180, Math.floor((width - 40 - (stepCount - 1) * 20) / stepCount));
  const boxHeight = 75;
  const startX = Math.floor((width - (stepCount * boxWidth + (stepCount - 1) * 20)) / 2);
  const y = 140;

  steps.forEach((step, idx) => {
    const x = startX + idx * (boxWidth + 20);
    const isUrgent = step.urgent;
    const isDecision = step.decision;

    const bg = isUrgent ? '#fef2f2' : (isDecision ? '#fffdf5' : '#f0f9ff');
    const border = isUrgent ? '#ef4444' : (isDecision ? '#d97706' : '#0284c7');
    const textColor = isUrgent ? '#991b1b' : (isDecision ? '#92400e' : '#0369a1');

    boxesHtml += `
      <g>
        <rect x="${x}" y="${y}" width="${boxWidth}" height="${boxHeight}" rx="4" fill="${bg}" stroke="${border}" stroke-width="1.5"/>
        <text x="${x + boxWidth / 2}" y="${y + 22}" font-family="Inter, sans-serif" font-size="9" font-weight="700" fill="${textColor}" text-anchor="middle">${step.header.toUpperCase()}</text>
        <text x="${x + boxWidth / 2}" y="${y + 42}" font-family="Inter, sans-serif" font-size="8" fill="#1e293b" text-anchor="middle">${step.line1}</text>
        ${step.line2 ? `<text x="${x + boxWidth / 2}" y="${y + 56}" font-family="Inter, sans-serif" font-size="8" fill="#64748b" text-anchor="middle">${step.line2}</text>` : ''}
      </g>
    `;

    if (idx < stepCount - 1) {
      const nextX = startX + (idx + 1) * (boxWidth + 20);
      const lineY = y + boxHeight / 2;
      linesHtml += `
        <line x1="${x + boxWidth}" y1="${lineY}" x2="${nextX - 6}" y2="${lineY}" stroke="#64748b" stroke-width="1.5" stroke-dasharray="${step.label ? 'none' : '3,3'}"/>
        <polygon points="${nextX},${lineY} ${nextX - 6},${lineY - 4} ${nextX - 6},${lineY + 4}" fill="#64748b"/>
        ${step.label ? `<text x="${x + boxWidth + 10}" y="${lineY - 6}" font-family="Inter, sans-serif" font-size="7.5" font-weight="700" fill="#2563eb" text-anchor="middle">${step.label}</text>` : ''}
      `;
    }
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="auto">
    <rect width="${width}" height="${height}" fill="#ffffff" rx="4" stroke="#cbd5e1" stroke-width="1"/>
    <rect x="0" y="0" width="${width}" height="32" fill="#1e3a8a" rx="4"/>
    <rect x="0" y="24" width="${width}" height="8" fill="#1e3a8a"/>
    <text x="${width / 2}" y="20" font-family="Inter, sans-serif" font-size="10" font-weight="700" fill="#ffffff" text-anchor="middle" letter-spacing="0.5">${title.toUpperCase()}</text>
    
    <!-- Subtitle / Context -->
    <text x="${width / 2}" y="52" font-family="Inter, sans-serif" font-size="8.5" font-weight="600" fill="#1e3a8a" text-anchor="middle">ALGORITMO CLÍNICO PASO A PASO (FIRST AID STEP 2 CK &bull; MINSAL)</text>

    <!-- Connectors -->
    ${linesHtml}

    <!-- Steps -->
    ${boxesHtml}
  </svg>`;
}

const svgsToGenerate = [
  {
    filename: 'algo_angina_estable.svg',
    title: 'Algoritmo Diagnóstico y Manejo de Angina Estable Crónica',
    steps: [
      { header: '1. Sospecha Clínica', line1: 'Dolor retroesternal opresivo', line2: 'Desencadenado por ejercicio', label: 'Evaluación' },
      { header: '2. Test de Esfuerzo', line1: 'Ergometría / Test Esfuerzo', line2: 'Evalúa infradesnivel ST', label: 'Refractario', decision: true },
      { header: '3. Coronariografía', line1: 'Estudio de Anatomía', line2: 'Angioplastia vs Cirugía', urgent: true }
    ]
  },
  {
    filename: 'algo_dolor_toracico.svg',
    title: 'Algoritmo de Descarte de las 5 Causas Letales de Dolor Torácico',
    steps: [
      { header: '1. ECG < 10 min', line1: 'Triage de Urgencias', line2: 'Descartar IAMSDST', label: 'Triage' },
      { header: '2. Evaluar 5 Letales', line1: 'SCA, Disección Aórtica, TEP', line2: 'Neumotórax, Rotura Esofágica', decision: true, label: 'Alerta' },
      { header: '3. Conducta Inmediata', line1: 'Reperfusión / AngioTAC', line2: 'Manejo de Emergencia', urgent: true }
    ]
  },
  {
    filename: 'algo_sca_reperfusion.svg',
    title: 'Algoritmo de Reperfusión Miocárdica en SCA (GES Chile)',
    steps: [
      { header: '1. ECG 12 Derivaciones', line1: 'Supradesnivel ST ≥ 1 mm', line2: 'en ≥ 2 derivaciones contiguas', label: 'SDST' },
      { header: '2. Angioplastia Primaria', line1: 'Centro con Hemodinamia', line2: 'Meta: Tiempo Balón < 120 min', urgent: true, label: 'Si >120m' },
      { header: '3. Fibrinólisis', line1: 'Alteplasa / Tenecteplasa EV', line2: 'Meta: Tiempo Aguja < 30 min', decision: true }
    ]
  },
  {
    filename: 'algo_iam_vd.svg',
    title: 'Algoritmo Diagnóstico y Manejo de IAM del Ventrículo Derecho',
    steps: [
      { header: '1. Tríada de VD', line1: 'IAM Inferior + Hipotensión', line2: 'Ingurgitación yugular sin rales', label: 'Confirmar' },
      { header: '2. Derivaciones V3R-V4R', line1: 'Supradesnivel ST ≥ 1 mm', line2: 'en derivaciones derechas', decision: true, label: 'Manejo' },
      { header: '3. Sobrecarga Volumen', line1: 'Suero Fisiológico 500-1000 cc', line2: 'CONTRAINDICADO: Nitratos', urgent: true }
    ]
  },
  {
    filename: 'algo_ic_dx.svg',
    title: 'Algoritmo Diagnóstico de Insuficiencia Cardíaca (Framingham + BNP)',
    steps: [
      { header: '1. Criterios Framingham', line1: '2 Criterios Mayores o', line2: '1 Mayor + 2 Menores', label: 'Laboratorio' },
      { header: '2. Dosificación BNP', line1: 'NT-proBNP / BNP elevado', line2: 'Descarta causa no cardíaca', decision: true, label: 'Ecocardiograma' },
      { header: '3. FEVI Ecocardiográfica', line1: 'FEVI Reducida (≤ 40%)', line2: 'Preservada (≥ 50%)', urgent: true }
    ]
  },
  {
    filename: 'algo_ic_tratamiento.svg',
    title: 'Algoritmo Terapéutico del Cuadriplete Fantástico en IC con FEVI Reducida',
    steps: [
      { header: '1. iSGLT2 + ARNI', line1: 'Dapagliflozina / Empagliflozina', line2: 'Sacubitril / Valsartán', label: 'Asociar' },
      { header: '2. Betabloqueador', line1: 'Carvedilol / Bisoprolol', line2: 'Titulación progresiva', decision: true, label: 'Persiste' },
      { header: '3. Antagonista ARM', line1: 'Espironolactona 25 mg/día', line2: 'Reduce Mortalidad', urgent: true }
    ]
  },
  {
    filename: 'algo_shock.svg',
    title: 'Algoritmo Hemodinámico Diferencial en Clasificación de Shock',
    steps: [
      { header: '1. Signos Hipoperfusión', line1: 'Hipotensión + Oliguria', line2: 'Lactato > 2 mmol/L', label: 'Perfil' },
      { header: '2. Evaluar PCOP y GC', line1: 'PCOP alta: Cardiogénico', line2: 'RVS baja: Séptico/Distributivo', decision: true, label: 'Rescates' },
      { header: '3. Norepinefrina EV', line1: 'Vasopresor de 1ª elección', line2: 'Restaurar PAM ≥ 65 mmHg', urgent: true }
    ]
  },
  {
    filename: 'algo_estenosis_aortica.svg',
    title: 'Algoritmo de Estenosis Aórtica Severa e Indicación Quirúrgica',
    steps: [
      { header: '1. Tríada Semiológica', line1: 'Angina + Síncope + Disnea', line2: 'Soplo eyectivo foco aórtico', label: 'Eco-Doppler' },
      { header: '2. Criterios Severidad', line1: 'Área Valvular < 1.0 cm²', line2: 'Gradiente Medio > 40 mmHg', decision: true, label: 'Tratamiento' },
      { header: '3. Reemplazo Valvular', line1: 'Cirugía Aórtica o TAVI', line2: 'Indicación Definitiva', urgent: true }
    ]
  },
  {
    filename: 'algo_pericarditis.svg',
    title: 'Algoritmo de Pericarditis Aguda vs Taponamiento Cardíaco',
    steps: [
      { header: '1. Dolor Pleurítico', line1: 'Aumenta en decúbito', line2: 'ECG: ST cóncavo difuso', label: 'Evaluar' },
      { header: '2. AINEs + Colchicina', line1: 'Aspirina/Ibuprofeno 7-14d', line2: 'Colchicina 0.5 mg x 3 meses', decision: true, label: 'Inestabilidad' },
      { header: '3. Pericardiocentesis', line1: 'Tríada de Beck + Pulso Paradojal', line2: 'Drenaje de Urgencia', urgent: true }
    ]
  },
  {
    filename: 'algo_fiebre_reumatica.svg',
    title: 'Algoritmo de Criterios de Jones en Fiebre Reumática Aguda',
    steps: [
      { header: '1. Antecedente S. pyogenes', line1: 'Odinofagia previa 2-3 sem', line2: 'Título ASO (+) elevado', label: 'Criterios' },
      { header: '2. Jones 2 Mayores', line1: 'Carditis, Poliartritis, Corea', line2: 'Eritema marginado, Nódulos', decision: true, label: 'Manejo' },
      { header: '3. Penicilina Benzatina', line1: 'Dosis única IM + AINEs', line2: 'Profilaxis c/ 3-4 semanas', urgent: true }
    ]
  },
  {
    filename: 'algo_congenitas.svg',
    title: 'Algoritmo Diferencial de Cardiopatías Congénitas Neonatales',
    steps: [
      { header: '1. Cianosis Neonatal', line1: 'Test Hiperoxia Negativo', line2: 'Cortocircuito Derecha-Izquierda', label: 'Evaluación' },
      { header: '2. Lesión Ductus-Dependiente', line1: 'TGA / Tetralogía de Fallot', line2: 'Cierre de Ductus provoca colapso', decision: true, label: 'Rescate' },
      { header: '3. Prostaglandina E1', line1: 'Infusión Continua PGE1', line2: 'Mantener Ductus Abierto', urgent: true }
    ]
  },
  {
    filename: 'algo_diseccion_aortica.svg',
    title: 'Algoritmo de Disección Aórtica: Stanford A vs Stanford B',
    steps: [
      { header: '1. Dolor Lacerante', line1: 'Inicio súbito 10/10 espalda', line2: 'Asimetría de PA > 20 mmHg', label: 'AngioTAC' },
      { header: '2. Stanford A (Ascendente)', line1: 'Cirugía Cardíaca Urgente', line2: 'Riesgo Taponamiento / IAM', urgent: true, label: 'Stanford B' },
      { header: '3. Stanford B (Descendente)', line1: 'Tratamiento Médico EV', line2: 'Labetalol / Esmolol PA < 120/80', decision: true }
    ]
  },
  {
    filename: 'algo_aaa.svg',
    title: 'Algoritmo Diagnóstico y Manejo de Aneurisma de Aorta Abdominal',
    steps: [
      { header: '1. Masa Pulsátil', line1: 'Palpación Abdominal', line2: 'Hallazgo Eco-FAST / Eco', label: 'Medición' },
      { header: '2. Diámetro Aórtico', line1: '< 5.5 cm: Control periódico', line2: '≥ 5.5 cm o Sintomático', decision: true, label: 'Cirugía' },
      { header: '3. Reparación EVAR/Cirugía', line1: 'Prótesis Endovascular o Abierta', line2: 'Prevención de Rotura', urgent: true }
    ]
  },
  {
    filename: 'algo_isquemia_aguda.svg',
    title: 'Algoritmo de Isquemia Aguda de Extremidades Inferiores (6 P)',
    steps: [
      { header: '1. Tríada de las 6 P', line1: 'Pain, Pallor, Pulselessness', line2: 'Paresthesia, Paralysis, Poikilothermia', label: 'Sospecha' },
      { header: '2. Heparina EV Bolo', line1: 'Heparina No Fraccionada', line2: 'Previene extensión de trombo', decision: true, label: 'Urgencia' },
      { header: '3. Trombectomía Fogarty', line1: 'Revascularización Quirúrgica', line2: 'Meta: Reperfusión < 6 horas', urgent: true }
    ]
  },
  {
    filename: 'algo_estenosis_carotidea.svg',
    title: 'Algoritmo de Estenosis Carotídea Sintomática (AIT / ACV)',
    steps: [
      { header: '1. Evento Neurológico', line1: 'AIT o ACV leve ipsilateral', line2: 'en los últimos 6 meses', label: 'Eco-Doppler' },
      { header: '2. Grado de Estenosis', line1: 'Estenosis 70% - 99%', line2: 'Confirmada por AngioTAC/Eco', decision: true, label: 'Intervención' },
      { header: '3. Endarterectomía', line1: 'Cirugía Carotídea Precoz', line2: 'Idealmente < 14 días', urgent: true }
    ]
  },
  {
    filename: 'algo_tep.svg',
    title: 'Algoritmo Diagnóstico y Terapéutico de Tromboembolismo Pulmonar',
    steps: [
      { header: '1. Escala de Wells TEP', line1: 'Disnea súbita + Taquicardia', line2: 'Puntaje Wells > 4 (Alta Prob)', label: 'Diagnóstico' },
      { header: '2. AngioTAC de Tórax', line1: 'Defecto de relleno en A. Pulmonar', line2: 'D-Dímero si Wells ≤ 4', decision: true, label: 'Tratamiento' },
      { header: '3. Anticoagulación / tPA', line1: 'DOACs 3-6m (Estable)', line2: 'Alteplasa tPA EV (Si Inestable)', urgent: true }
    ]
  }
];

console.log("Generando todos los SVGs de diagramas de flujo...");
svgsToGenerate.forEach(s => {
  const content = createBoxSvg(s.title, s.steps);
  const p = path.join(svgDir, s.filename);
  fs.writeFileSync(p, content, 'utf8');
  console.log(`  └─ SVG Creado: ${s.filename}`);
});

console.log("¡ÉXITO! Todos los SVGs han sido creados en:", svgDir);
