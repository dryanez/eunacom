const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const baseCapitulosDir = path.join(__dirname, 'capitulos_v3');
const classesPath = path.join(__dirname, 'scripts', 'online_classes', 'diabetes_online_classes.json');
const onlineClasses = JSON.parse(fs.readFileSync(classesPath, 'utf8'));

function stripEmojis(str) {
  if (!str) return '';
  return str.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu, '');
}

function sanitizeFilename(str) {
  return str.replace(/[^a-zA-Z0-9_\-\.]/g, '_').replace(/_+/g, '_');
}

function getSvg(svgFilename) {
  if (!svgFilename) return '';
  const p = path.join(__dirname, 'generate-book', 'svg_diagrams', svgFilename);
  if (fs.existsSync(p)) {
    return fs.readFileSync(p, 'utf8');
  }
  return '';
}

const diabetesTopicDefinitions = [
  { chapNum: 6, topicNum: 1, classIdx: 0, svg: null, algoTitle: null },
  { chapNum: 6, topicNum: 2, classIdx: 1, svg: 'algo_dm2_dx.svg', algoTitle: 'Algoritmo Diagnóstico de Diabetes Mellitus y Prediabetes' },
  { chapNum: 6, topicNum: 3, classIdx: 2, svg: null, algoTitle: null },
  { chapNum: 6, topicNum: 4, classIdx: 3, svg: 'algo_dm2_manejo.svg', algoTitle: 'Algoritmo de Tipos de Insulina y Esquema Basal-Bolo' },
  { chapNum: 6, topicNum: 5, classIdx: 4, svg: null, algoTitle: null },
  { chapNum: 6, topicNum: 6, classIdx: 5, svg: null, algoTitle: null },
  { chapNum: 6, topicNum: 7, classIdx: 6, svg: null, algoTitle: null },
  { chapNum: 6, topicNum: 8, classIdx: 7, svg: 'algo_dm2_manejo.svg', algoTitle: 'Algoritmo Terapéutico Escalonado en Diabetes Mellitus Tipo 2' },
  { chapNum: 6, topicNum: 9, classIdx: 8, svg: null, algoTitle: null },
  { chapNum: 6, topicNum: 10, classIdx: 9, svg: null, algoTitle: null },
  { chapNum: 6, topicNum: 11, classIdx: 10, svg: null, algoTitle: null },
  { chapNum: 6, topicNum: 12, classIdx: 11, svg: null, algoTitle: null },
  { chapNum: 6, topicNum: 13, classIdx: 12, svg: null, algoTitle: null },
  { chapNum: 6, topicNum: 14, classIdx: 13, svg: null, algoTitle: null },
  { chapNum: 6, topicNum: 15, classIdx: 14, svg: null, algoTitle: null },
  { chapNum: 6, topicNum: 16, classIdx: 15, svg: null, algoTitle: null },
  { chapNum: 6, topicNum: 17, classIdx: 16, svg: null, algoTitle: null },
  { chapNum: 6, topicNum: 18, classIdx: 17, svg: 'algo_cad_ehh.svg', algoTitle: 'Algoritmo Diagnóstico Diferencial: CAD vs EHH' },
  { chapNum: 6, topicNum: 19, classIdx: 18, svg: 'algo_cad_ehh.svg', algoTitle: 'Algoritmo de Manejo de Urgencia en Crisis Hiperglicémicas' },
  { chapNum: 6, topicNum: 20, classIdx: 19, svg: null, algoTitle: null },
  { chapNum: 6, topicNum: 21, classIdx: 20, svg: null, algoTitle: null },
  { chapNum: 6, topicNum: 22, classIdx: 21, svg: null, algoTitle: null },
  { chapNum: 6, topicNum: 23, classIdx: 22, svg: null, algoTitle: null },
  { chapNum: 6, topicNum: 24, classIdx: 23, svg: null, algoTitle: null }
];

const customVignettesMap = {
  1: { vignette: "Hombre de 24 años consulta por pérdida de 7 kg de peso en 3 semanas, astenia, poliuria y polidipsia intensa. Examen: IMC 21 kg/m², aliento cetósico, glicemia capilar 340 mg/dL con cetonuria +++. Sin antecedentes familiares de DM.", explicacion: "Diabetes Mellitus Tipo 1: destrucción autoinmune de células beta pancreáticas con déficit absoluto de insulina en adulto joven no obeso. Requiere insulinoterapia inmediata. Anticuerpos anti-GAD y anti-IA2 confirman etiología autoinmune." },
  2: { vignette: "Mujer de 52 años asintomática en EMPA presenta glicemia en ayuno de 132 mg/dL. Se repite a la semana resultando en 128 mg/dL. IMC 31 kg/m².", explicacion: "Diagnóstico de Diabetes Mellitus Tipo 2: requiere dos glicemias en ayunas ≥ 126 mg/dL en días distintos en paciente asintomático. Criterios alternativos: PTGO 2h ≥ 200 mg/dL, HbA1c ≥ 6.5%, o glicemia al azar ≥ 200 mg/dL con síntomas clásicos (4P)." },
  3: { vignette: "Primigesta de 26 semanas de gestación, sin antecedentes mórbidos, se realiza PTGO 75g de rutina: glicemia basal 88 mg/dL, glicemia a las 2 horas: 154 mg/dL.", explicacion: "Diabetes Gestacional: diagnóstico en Chile (MINSAL) se realiza con PTGO 75g a las 24-28 semanas con glicemia a las 2h ≥ 140 mg/dL (o glicemia en ayunas ≥ 100 mg/dL en 1er trimestre). Primera línea: dieta y ejercicio por 2 semanas; si no logra metas (< 95 ayuno, < 120 2h postprandial), se inicia Insulina." },
  4: { vignette: "Hombre de 58 años con DM2 de 12 años de evolución, en tratamiento con Metformina 850 mg c/8h y Empagliflozina 25 mg/día. Presenta HbA1c de 9.8% y astenia. Se decide iniciar insulinoterapia.", explicacion: "Inicio de Insulinoterapia en DM2: se comienza con Insulina Basal (NPH nocturna 10 UI o 0.2 UI/kg, o análogo de acción prolongada Glargina/Degludec). Se titula dosis cada 3-4 días según glicemia de ayunas (meta 80-130 mg/dL). Se mantiene la Metformina." },
  5: { vignette: "Hombre de 64 años con DM2 en esquema NPH nocturna (22:00h) presenta glicemias en ayunas elevadas (190-210 mg/dL). Se realiza control a las 03:00 AM que muestra glicemia de 55 mg/dL.", explicacion: "Efecto Somogyi: hipoglicemia nocturna (03:00 AM) que genera rebote hiperglicémico matinal por liberación de hormonas contrarreguladoras (cortisol, adrenalina). Conducta: REDUCIR la dosis de insulina NPH nocturna o dar colación antes de dormir. Diferenciar del Fenómeno del Alba (03:00 AM normal/alta), donde se debe AUMENTAR la NPH nocturna." },
  6: { vignette: "Hombre de 60 años con DM2 e infarto previo consulta para control. Examen: PA 125/75 mmHg, IMC 28 kg/m², HbA1c 6.8%, LDL 52 mg/dL, RAC urinario 18 mg/g.", explicacion: "Objetivos de Control Metabólico en DM2: HbA1c < 7.0% (individualizar < 6.5% en jóvenes, < 8.0% en adultos mayores frágiles), PA < 130/80 mmHg, LDL < 55 mg/dL en muy alto riesgo CV (con infarto previo), y RAC < 30 mg/g." },
  7: { vignette: "Mujer de 62 años con DM2 y antecedentes de insuficiencia cardíaca con FEVI 38% consulta por mal control glicémico (HbA1c 8.4%) bajo Metformina.", explicacion: "En DM2 con Insuficiencia Cardíaca (o ERC con albuminuria), los inhibidores de SGLT2 (Dapagliflozina, Empagliflozina) son el fármaco de elección de segunda línea por su beneficio demostrado en reducción de hospitalizaciones por IC y progresión renal." },
  8: { vignette: "Hombre de 50 años con DM2 recién diagnosticada, asintomático, HbA1c 7.6%, IMC 32 kg/m², función renal normal. Sin antecedentes cardiovasculares.", explicacion: "Tratamiento inicial de DM2: Metformina 850 mg/día (titular hasta 1700-2550 mg/día) asociada a cambios en el estilo de vida. Si HbA1c de inicio está > 1.5% sobre la meta (ej. > 8.5%), se recomienda terapia dual combinada desde el inicio." },
  9: { vignette: "Mujer de 30 años con Diabetes Gestacional a las 30 semanas de gestación mantiene glicemias postprandiales elevadas (140-160 mg/dL) pese a 2 semanas de dieta estricta supervisada.", explicacion: "Tratamiento farmacológico en Diabetes Gestacional: la Insulina es el gold standard (NPH basal + Lispro/Aspart preprandial). La metformina es alternativa en casos seleccionados, pero la insulina es la indicación de primera línea si no se alcanzan metas glicémicas." },
  10: { vignette: "Embarazada con DM pregestacional consulta para control en semana 12. Monitoreo capilar: ayuno 85 mg/dL, 1h postprandial 115 mg/dL, 2h postprandial 105 mg/dL.", explicacion: "Metas de Control Glicémico en Embarazo: Glicemia en ayunas < 95 mg/dL, 1 hora postprandial < 140 mg/dL, y 2 horas postprandial < 120 mg/dL. El control estricto previene macrosomía fetal, polihidramnios, preeclampsia y distocia de hombros." },
  11: { vignette: "Hombre de 54 años con DM2 consulta por baja de 10 kg en 1 mes, polidipsia intensa y glicemia de 360 mg/dL con HbA1c 11.2%.", explicacion: "Indicación de Insulinoterapia Inmediata en DM2: presencia de síntomas cardinales severos con pérdida de peso rápida, HbA1c > 10% o glicemia > 300 mg/dL. La insulinización intensiva revierte la glucotoxicidad sobre las células beta." },
  12: { vignette: "Mujer de 56 años con DM2 e Hipertensión Arterial de reciente diagnóstico. Examen: PA 148/92 mmHg. Fondo de ojo normal. Creatinina 0.9 mg/dL con RAC 85 mg/g (microalbuminuria).", explicacion: "Hipertensión en paciente Diabético: el antihipertensivo de primera elección es un IECA (Enalapril) o ARA-II (Losartán) por su efecto nefroprotector demostrado al reducir la presión intraglomerular y frenar la progresión de la nefropatía diabética." },
  13: { vignette: "Hombre de 63 años con DM2 de 15 años de evolución. Control de orina muestra Relación Albúmina/Creatinina (RAC) de 180 mg/g confirmada en 2 muestras en 3 meses. VFG 75 mL/min.", explicacion: "Nefropatía Diabética Incipiente (Microalbuminuria, RAC 30-300 mg/g). Manejo: control estricto de PA (< 130/80) con IECA/ARA-II, control glicémico (iSGLT2 que reducen progresión renal), estatinas y cese tabáquico." },
  14: { vignette: "Hombre de 48 años con DM2 en tratamiento con Insulina NPH y Metformina decide comenzar entrenamiento aeróbico de alta intensidad 3 veces por semana.", explicacion: "Ejercicio y Diabetes: mejora la sensibilidad a la insulina y el control glicémico. En pacientes con insulina o sulfonilureas, se debe medir glicemia antes del ejercicio; si es < 100 mg/dL, ingerir 15-30g de hidratos de carbono para prevenir hipoglicemias inducidas por ejercicio." },
  15: { vignette: "Mujer de 60 años con DM2 de 18 años de evolución consulta por disminución progresiva de agudeza visual. Fondo de ojo revela neovasos en papila y retina con microhemorragias difusas.", explicacion: "Retinopatía Diabética Proliferativa: caracterizada por la presencia de neovascularización. Es indicación de Panfotocoagulación con Láser de urgencia o inyección intravítrea de anti-VEGF para prevenir hemorragia vítrea y desprendimiento traccional de retina." },
  16: { vignette: "Hombre de 68 años con DM2 consulta por lesión ulcerada indolora de 2 cm en cabeza del primer metatarsiano del pie derecho, de 1 mes de evolución, con halo hiperqueratósico y sin compromiso óseo ni signos de infección.", explicacion: "Pie Diabético Grado 1 (Wagner) / Ulcera Neuropática: localizada en zonas de presión. Manejo: descarga de la zona de apoyo (bota o plantilla de descarga), desbridamiento del tejido hiperqueratósico y curación avanzada. Evaluar pulsos y descartar osteomielitis si sonda contacta hueso (probe-to-bone test)." },
  17: { vignette: "Hombre de 62 años con DM2 consulta por dolor quemante, disestesias y sensación de 'hormigueo' en ambos pies de predominio nocturno. Examen: hipoestesia táctil y vibratoria en calcetín.", explicacion: "Polineuropatía Diabética Sensitiva Distal Simétrica: complicación microvascular más frecuente. Tratamiento sintomático del dolor neuropático: Pregabalina, Gabapentina o Duloxetina como primera línea. Los AINEs no son efectivos." },
  18: { vignette: "Hombre de 22 años con DM1 ingresa a urgencias por dolor abdominal, vómitos y disnea. Al examen: PA 90/60 mmHg, FC 125 lpm, respiración profunda y rápida (Kussmaul), aliento afrutado. Glicemia 420 mg/dL, pH 7.15, HCO3 9 mEq/L, Anion Gap 22, cetonuria ++++.", explicacion: "Cetoacidosis Diabética (CAD): tríada de Hiperglicemia (> 250) + Acidosis Metabólica con Anion Gap elevado (pH < 7.30, HCO3 < 18) + Cetonemia/Cetonuria. Diferenciar de EHH (glicemia > 600, osmolaridad > 320, sin acidosis)." },
  19: { vignette: "Mujer de 75 años con DM2 ingresa estuporosa y deshidratada severa tras cuadro de neumonía. PA 80/50 mmHg, FC 130 lpm, glicemia 850 mg/dL, osmolaridad plasmática efectiva 335 mOsm/kg, pH 7.38, HCO3 22 mEq/L. K+ sérico 4.2 mEq/L.", explicacion: "Estado Hiperosmolar Hiperglicémico (EHH): prioridad absoluta es la Hidratación enérgica con Suero Fisiológico 0.9% (1000 mL en 1ª hora). Luego Insulina Cristalina EV en infusión a 0.1 UI/kg/h asegurando K+ > 3.3 mEq/L. Aportar SG 5% cuando glicemia llegue a 250-300 mg/dL." },
  20: { vignette: "Hombre de 70 años con DM2 en tratamiento con Glibenclamida es traído por familiares por sudoración profusa, temblor y desorientación. Glicemia capilar en urgencias: 42 mg/dL. Se administra dextrosa EV recuperando la conciencia.", explicacion: "Hipoglicemia por Sulfonilureas (Glibenclamida): por la vida media prolongada de sus metabolitos activos, tiene alto riesgo de hipoglicemia recurrente y prolongada. Requiere HOSPITALIZACIÓN y observación con infusión de glucosa continua por al menos 24-48 horas." },
  21: { vignette: "Mujer de 45 años, no diabética, presenta episodios recurrentes de mareos, sudoración y palpitaciones en ayunas que ceden inmediatamente al comer. Durante una crisis en ayuno se documenta glicemia de 38 mg/dL con insulina plasmática y péptido C elevados.", explicacion: "Insulinoma: tumor neuroendocrino pancreático productor de insulina. Cumple la Tríada de Whipple. La elevación concomitante de Insulina y Péptido C confirma secreción endógena de insulina (descarta hipoglicemia facticia por insulina exógena, donde el péptido C está suprimido). Diagnóstico por TAC/RMN pancreática y tratamiento quirúrgico." },
  22: { vignette: "Hombre de 56 años con antecedente de IAM hace 6 meses. Perfil lipídico: Colesterol Total 240 mg/dL, HDL 38 mg/dL, Triglicéridos 180 mg/dL, LDL 155 mg/dL. Se plantea terapia hipolipemiante.", explicacion: "Tratamiento de Dislipidemias en Prevención Secundaria (Riesgo Muy Alto): requiere Estatinas de Alta Intensidad (Atorvastatina 40-80 mg o Rosuvastatina 20-40 mg) con meta de LDL < 55 mg/dL y reducción ≥ 50% del LDL basal. Si no logra meta, asociar Ezetimiba 10 mg." },
  23: { vignette: "Mujer de 62 años en tratamiento con Atorvastatina 80 mg/día por cardiopatía coronaria consulta por dolores musculares difusos en muslos y hombros de 2 semanas de evolución. CK total: 850 UI/L (valor normal < 170).", explicacion: "Miopatía / Miositis por Estatinas: elevación de CK > 4-5 veces el límite superior normal con mialgias. Conducta: suspender temporalmente la estatina hasta resolución de síntomas y normalización de CK; luego reiniciar a menor dosis o cambiar a otra estatina (Rosuvastatina o Pravastatina) o asociar Ezetimiba." },
  24: { vignette: "Hombre de 32 años consulta por xantomas tendinosos en tendón de Aquiles y xantelasmas bilaterales. Padre falleció de IAM a los 42 años. Perfil lipídico muestra Colesterol Total 380 mg/dL y LDL 310 mg/dL con triglicéridos normales.", explicacion: "Hipercolesterolemia Familiar Heterocigota: enfermedad autosómica dominante por mutación en el receptor de LDL. Se caracteriza por LDL > 190 mg/dL, xantomas tendinosos y enfermedad coronaria precoz. Tratamiento agresivo: Estatinas alta potencia + Ezetimiba +/- Inhibidores de PCSK9 (Evolocumab)." }
};

function formatArticleContent(text, chapNum, topicNumInChap) {
  if (!text) return '';
  let html = stripEmojis(text);

  html = html.replace(/:::important\s*\n?[\s\S]*?(?:Perfil|Nivel de conocimiento|Código|Dx:|1\.0\d)[\s\S]*?:::/gi, '');
  html = html.replace(/^[\d\.]+\s*\|\s*[^|\n]+\s*\|\s*Dx:[^\n]+/gim, '');
  html = html.replace(/Perfil EUNACOM[\s\S]*?Seg:\s*\w+/gi, '');
  html = html.replace(/^[ \t]*---+[ \t]*$/gim, '');

  let tableCount = 0;
  html = html.replace(/(?:^[ \t]*\|[^\n]+\|[ \t]*\r?\n){2,}/gm, (match) => {
    tableCount++;
    const lines = match.trim().split(/\r?\n/).filter(l => l.includes('|'));
    if (lines.length < 2) return match;

    let headers = [];
    let rows = [];

    lines.forEach((line) => {
      if (/^[ \t]*\|[\s\-:]+(\|[\s\-:]+)+\|?[ \t]*$/.test(line.trim())) return;
      let cells = line.split('|').map(c => c.trim());
      if (cells[0] === '') cells.shift();
      if (cells[cells.length - 1] === '') cells.pop();

      if (headers.length === 0) headers = cells;
      else rows.push(cells);
    });

    if (headers.length === 0) return match;

    const tableLabel = `TABLA ${chapNum}.${topicNumInChap}.${tableCount}`;
    const tableTitle = headers[0] && headers[1] ? `${headers[0]} vs ${headers[1]}` : 'Clasificación y Criterios Clínicos';

    let tableHtml = `<div class="tbl-container"><div class="tbl-hdr"><span class="tbl-num">${tableLabel}</span>: ${tableTitle}</div><table class="tbl"><thead><tr>`;
    headers.forEach(h => tableHtml += `<th>${h}</th>`);
    tableHtml += '</tr></thead><tbody>';
    rows.forEach(r => {
      tableHtml += '<tr>';
      r.forEach(c => tableHtml += `<td>${c}</td>`);
      tableHtml += '</tr>';
    });
    tableHtml += '</tbody></table></div>';
    return tableHtml;
  });

  html = html.replace(/:::important\n?([\s\S]*?):::/g, '<div class="box important-callout"><div class="box-title">EUNACOM CRITERIOS</div><p>$1</p></div>');
  html = html.replace(/:::note\n?([\s\S]*?):::/g, '<div class="box note-callout"><div class="box-title">NOTA CLÍNICA</div><p>$1</p></div>');
  html = html.replace(/:::warning\n?([\s\S]*?):::/g, '<div class="box warning-callout"><div class="box-title">ADVERTENCIA Y PRECAUCIÓN</div><p>$1</p></div>');
  html = html.replace(/:::tip\n?([\s\S]*?):::/g, '<div class="box tip-callout"><div class="box-title">PERLA CLÍNICA EUNACOM</div><p>$1</p></div>');

  html = html.replace(/\[\[([^\]]+)\]\]/g, '<strong>$1</strong>');
  html = html.replace(/---/g, '');

  html = html.replace(/^## (.*$)/gim, '<div class="subhead">$1</div>');
  html = html.replace(/^### (.*$)/gim, '<div class="subhead-small">$1</div>');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  const rawParagraphs = html.split(/\n\n+/);
  return rawParagraphs.map(p => {
    p = p.trim();
    if (!p) return '';
    if (p.startsWith('<div') || p.startsWith('<table') || p.startsWith('<ul') || p.startsWith('<li')) return p;

    if (p.includes('- ') || p.includes('1. ')) {
      const items = p.split(/\n/).map(l => l.replace(/^[-*\d\.]+\s+/, '').trim()).filter(Boolean);
      return `<ul class="lst">${items.map(i => `<li>${i}</li>`).join('')}</ul>`;
    }

    return `<p class="txt">${p}</p>`;
  }).join('\n');
}

const baseCss = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Merriweather:wght@400;700&display=swap');
  @page { size: letter; margin: 0.42in 0.35in 0.38in 0.35in; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; font-size: 8.5pt; line-height: 1.35; color: #0f172a; background: #ffffff; -webkit-print-color-adjust: exact; }
  .page { width: 100%; page-break-after: always; position: relative; }
  .topic-section { page-break-after: always; }
  
  .topic-hdr { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f766e; padding-bottom: 4px; margin-bottom: 8px; }
  .topic-hdr h2 { font-family: 'Merriweather', serif; font-size: 13.5pt; color: #0f766e; }
  .topic-hdr .num { font-size: 8pt; font-weight: 700; color: #0d9488; text-transform: uppercase; }
  .perfil-tag { background: #f0fdfa; border: 1px solid #ccfbf1; border-left: 4px solid #0f766e; padding: 3px 6px; font-size: 7.5pt; }

  .two-col-flow { column-count: 2; column-gap: 0.2in; width: 100%; }
  
  .box { border: 1px solid #cbd5e1; border-radius: 2px; padding: 5px 7px; margin-top: 5px; margin-bottom: 5px; font-size: 8pt; width: 100%; break-inside: avoid; }
  .box-title { font-weight: 700; font-size: 7.5pt; text-transform: uppercase; margin-bottom: 2px; letter-spacing: 0.5px; }
  .box.high-yield { background: #f8fafc; border-left: 3.5px solid #0f766e; break-inside: avoid; }
  .box.high-yield .box-title { color: #0f766e; }

  .box.vignette-redesigned { background: #fffdf5; border: 1.5px solid #f59e0b; border-radius: 3px; padding: 0; margin-top: 6px; margin-bottom: 6px; overflow: hidden; break-inside: avoid; }
  .vignette-hdr { background: #d97706; color: #ffffff; font-weight: 700; font-size: 8pt; padding: 3.5px 8px; text-transform: uppercase; letter-spacing: 0.5px; }
  .vignette-body { padding: 6px 8px; }
  .vignette-sec { margin-bottom: 4px; }
  .vignette-sec.concept-sec { border-top: 1px dashed #fcd34d; padding-top: 4px; margin-bottom: 0; }
  .sec-label { font-weight: 700; font-size: 7.5pt; color: #92400e; display: block; margin-bottom: 2px; }
  .sec-text { font-size: 8pt; line-height: 1.35; color: #1e293b; }

  .box.summary-fullwidth { width: 100%; background: #f0fdfa; border: 1.5px solid #0d9488; border-radius: 3px; padding: 0; margin-top: 10px; margin-bottom: 6px; overflow: hidden; break-inside: avoid; }
  .summary-hdr { background: #0d9488; color: #ffffff; font-weight: 700; font-size: 8.5pt; padding: 4px 10px; text-transform: uppercase; letter-spacing: 0.5px; }
  .summary-body { padding: 8px 10px; font-size: 8.5pt; line-height: 1.4; color: #115e59; }

  .box.important-callout { background: #fef2f2; border-color: #fca5a5; border-left: 3.5px solid #ef4444; }
  .box.important-callout .box-title { color: #991b1b; }
  .box.warning-callout { background: #fff7ed; border-color: #ffedd5; border-left: 3.5px solid #f97316; }
  .box.warning-callout .box-title { color: #c2410c; }
  .box.note-callout { background: #f8fafc; border-color: #e2e8f0; border-left: 3.5px solid #64748b; }
  .box.note-callout .box-title { color: #334155; }
  .box.tip-callout { background: #fff5f5; border: 1.5px solid #fca5a5; border-left: 3.5px solid #dc2626; }
  .box.tip-callout .box-title { color: #991b1b; }
  .box.tip-callout p { color: #7f1d1d; }

  .subhead { font-family: 'Merriweather', serif; font-size: 9.5pt; font-weight: 700; color: #0f766e; margin: 8px 0 4px 0; border-bottom: 1px solid #cbd5e1; padding-bottom: 1px; break-after: avoid; }
  .subhead-small { font-family: 'Inter', sans-serif; font-size: 8.5pt; font-weight: 700; color: #0f172a; margin: 6px 0 3px 0; break-after: avoid; }
  p.txt { font-size: 8pt; line-height: 1.35; margin-bottom: 4px; text-align: justify; }
  ul.lst { padding-left: 12px; margin-bottom: 4px; }
  ul.lst li { font-size: 8pt; margin-bottom: 2px; }

  .tbl-container { width: 100%; margin: 6px 0; break-inside: avoid; }
  .tbl-hdr { font-weight: 700; font-size: 7.5pt; color: #0f766e; background: #f0fdfa; padding: 3px 6px; border: 1px solid #cbd5e1; border-bottom: none; text-transform: uppercase; letter-spacing: 0.5px; }
  .tbl-hdr .tbl-num { color: #0d9488; }
  table.tbl { width: 100%; border-collapse: collapse; font-size: 7.5pt; border: 1px solid #cbd5e1; border-top: 1.5px solid #0f766e; border-bottom: 1.5px solid #0f766e; }
  table.tbl th { background: #f0fdfa; color: #0f766e; padding: 4px 5px; text-align: left; font-size: 7pt; text-transform: uppercase; font-weight: 700; border-bottom: 1px solid #cbd5e1; }
  table.tbl td { padding: 4px 5px; border-bottom: 1px solid #e2e8f0; vertical-align: top; line-height: 1.3; }
  table.tbl tr:nth-child(even) td { background: #f8fafc; }

  .diagram-box { width: 100%; border: 1px solid #0f766e; border-radius: 2px; padding: 5px 8px; margin-top: 6px; margin-bottom: 6px; background: #ffffff; text-align: center; break-inside: avoid; }
  .diagram-box .d-title { font-weight: 700; font-size: 8pt; text-transform: uppercase; color: #0f766e; text-align: center; margin-bottom: 4px; border-bottom: 1px solid #cbd5e1; padding-bottom: 2px; }
  .svg-centered { display: flex; justify-content: center; align-items: center; width: 100%; text-align: center; }
  .svg-centered svg { max-width: 100%; height: auto; margin: 0 auto; display: block; }

  .topic-questions-container { width: 100%; margin-top: 8px; break-inside: avoid; }
  .t-q-title { font-weight: 700; font-size: 8pt; color: #0f766e; text-transform: uppercase; border-bottom: 1.5px solid #0f766e; padding-bottom: 2px; margin-bottom: 4px; }
  .q-full-width { width: 100%; background: #ffffff; border: 1px solid #cbd5e1; border-left: 3.5px solid #0d9488; border-radius: 2px; padding: 5px 8px; margin-bottom: 5px; break-inside: avoid; }
  .q-hdr-link { display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px; }
  .q-full-width .q-hdr { font-weight: 700; font-size: 8pt; color: #0d9488; text-transform: uppercase; letter-spacing: 0.5px; }
  .q-full-width .q-stem { font-size: 8pt; line-height: 1.35; margin-bottom: 4px; }
  .q-options-grid { display: flex; flex-direction: column; gap: 2px; margin-bottom: 2px; }
  .q-opt-item { font-size: 7.5pt; padding: 2px 4px; border-radius: 2px; background: #f8fafc; border: 1px solid #e2e8f0; }
`;

function buildTopicHtml(t) {
  const vignetteHtml = `
    <div class="box vignette-redesigned">
      <div class="vignette-hdr">CASO CLÍNICO TIPO EUNACOM</div>
      <div class="vignette-body">
        <div class="vignette-sec">
          <span class="sec-label">ESCENARIO CLÍNICO TÍPICO:</span>
          <p class="sec-text">"${t.vignette}"</p>
        </div>
        <div class="vignette-sec concept-sec">
          <span class="sec-label">EXPLICACIÓN CLÍNICA DETALLADA:</span>
          <p class="sec-text">${t.casoConcepto}</p>
        </div>
      </div>
    </div>
  `;

  const highYieldHtml = `
    <div class="box high-yield">
      <div class="box-title">Puntos Clave Destacados</div>
      <ul class="lst">
        ${(t.keyPoints || []).map(p => `<li>${p}</li>`).join('')}
      </ul>
    </div>
  `;

  const twoColContent = `<div class="two-col-flow">${t.articleHtml}\n${vignetteHtml}\n${highYieldHtml}</div>`;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>${baseCss}</style>
</head>
<body>
  <div class="page topic-section">
    <div class="topic-hdr">
      <div>
        <div class="num">CAPÍTULO ${t.topicLabel}</div>
        <h2>${t.title}</h2>
      </div>
      <div class="perfil-tag">
        <strong>PERFIL EUNACOM ${t.perfilCode}</strong><br>
        Dx: ${t.dx} &bull; Tx: ${t.tx} &bull; Seg: ${t.seg}
      </div>
    </div>

    ${twoColContent}

    ${t.svg ? `
    <div class="diagram-box">
      <div class="d-title">FIGURA ${t.topicLabel}: ${t.algoTitle.toUpperCase()}</div>
      <div class="svg-centered">
        ${getSvg(t.svg)}
      </div>
    </div>
    ` : ''}

    <div class="topic-questions-container">
      <div class="t-q-title">EVALUACIÓN DE CLASE Y PREGUNTAS TIPO EUNACOM (${t.title})</div>
      ${t.preguntas.map(q => `
        <div class="q-full-width">
          <div class="q-hdr-link">
            <span class="q-hdr">PREGUNTA ${q.qSeqNum}</span>
          </div>
          <div class="q-stem">${q.enunciado}</div>
          <div class="q-options-grid">
            ${q.opciones.map(o => `
              <div class="q-opt-item">
                <strong>${o.id})</strong> ${o.texto}
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </div>

    <div class="box summary-fullwidth">
      <div class="summary-hdr">RESUMEN: ${t.title.toUpperCase()}</div>
      <div class="summary-body">
        <p>${t.summaryText}</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

async function main() {
  console.log(`Generando PDFs para Capítulo 6: Diabetes y Dislipidemias (24 temas)...`);

  const chapDirV3 = path.join(baseCapitulosDir, 'Capitulo_6_Diabetes_y_Dislipidemias');
  if (!fs.existsSync(chapDirV3)) fs.mkdirSync(chapDirV3, { recursive: true });

  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  for (const tDef of diabetesTopicDefinitions) {
    const rawClass = onlineClasses[tDef.classIdx];
    const topicLabel = `${tDef.chapNum}.${tDef.topicNum}`;

    const keyPoints = typeof rawClass.key_points === 'string' ? JSON.parse(rawClass.key_points) : (rawClass.key_points || []);
    const rawQuiz = typeof rawClass.quiz === 'string' ? JSON.parse(rawClass.quiz) : (rawClass.quiz || []);

    const rawArticle = rawClass.article_content || rawClass.clean_transcript || rawClass.summary || '';
    const formattedArticle = formatArticleContent(rawArticle, tDef.chapNum, tDef.topicNum);

    const questionsForTopic = [];
    const qSourceList = [...rawQuiz];

    for (let qIdx = 0; qIdx < Math.min(3, Math.max(1, qSourceList.length)); qIdx++) {
      const qObj = qSourceList[qIdx] || qSourceList[0] || {};
      const qText = stripEmojis(qObj.questionText || qObj.question || qObj.pregunta || rawClass.topic);
      const optionsRaw = qObj.options || qObj.opciones || [];

      const options = optionsRaw.map((o, oIdx) => {
        const rawText = stripEmojis(o.text || o.texto || o);
        const cleanText = rawText.replace(/^[A-E][\)\.]\s*/i, '');
        return {
          id: o.id || String.fromCharCode(65 + oIdx),
          texto: cleanText
        };
      });

      questionsForTopic.push({
        qSeqNum: qIdx + 1,
        enunciado: qText,
        opciones: options.length ? options : [
          { id: 'A', texto: 'Conducta o tratamiento de primera línea' },
          { id: 'B', texto: 'Opción no indicada en la fase aguda' },
          { id: 'C', texto: 'Examen de laboratorio secundario' },
          { id: 'D', texto: 'Fármaco contraindicado' },
          { id: 'E', texto: 'Derivación tardía' }
        ]
      });
    }

    const richCasoData = customVignettesMap[tDef.topicNum] || {
      vignette: questionsForTopic[0].enunciado,
      explicacion: "Manejo clínico según protocolo de diabetes EUNACOM."
    };

    const topicObj = {
      chapNum: tDef.chapNum,
      topicNumInChap: tDef.topicNum,
      topicLabel,
      title: rawClass.topic,
      perfilCode: rawClass.eunacom_code || `1.02.${tDef.topicNum < 10 ? '0' + tDef.topicNum : tDef.topicNum}`,
      dx: "Específico", tx: "Completo", seg: "Completo",
      articleHtml: formattedArticle,
      summaryText: stripEmojis(rawClass.summary || ''),
      keyPoints: keyPoints.map(stripEmojis),
      vignette: richCasoData.vignette,
      casoConcepto: richCasoData.explicacion,
      preguntas: questionsForTopic,
      svg: tDef.svg,
      algoTitle: tDef.algoTitle
    };

    const htmlContent = buildTopicHtml(topicObj);
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const topicPdfName = `Capitulo_${topicLabel}_${sanitizeFilename(rawClass.topic)}.pdf`;
    const topicPdfPathV3 = path.join(chapDirV3, topicPdfName);

    try {
      await page.pdf({
        path: topicPdfPathV3,
        format: 'Letter',
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: `
          <div style="font-size: 7.5pt; font-family: 'Inter', sans-serif; color: #0d9488; width: 100%; display: flex; justify-content: space-between; align-items: center; margin: 0 0.35in; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">
            <span>MANUAL EUNACOM &bull; CAPÍTULO ${topicLabel} &bull; DIABETES Y METABOLISMO</span>
            <span>PÁGINA <span class="pageNumber"></span></span>
          </div>
        `,
        footerTemplate: `<div></div>`,
        margin: { top: '0.42in', bottom: '0.38in', left: '0.35in', right: '0.35in' }
      });
      console.log(`  ✅ [${topicLabel}] PDF Generado: ${topicPdfName}`);
    } catch (err) {
      console.warn(`  ⚠️ Archivo bloqueado o error: ${topicPdfName} - ${err.message}`);
    }

    await page.close();
  }

  await browser.close();
  console.log(`\n🎉 Capítulo 6: Diabetes y Dislipidemias (24 temas) generado con éxito!`);
}

main().catch(console.error);
