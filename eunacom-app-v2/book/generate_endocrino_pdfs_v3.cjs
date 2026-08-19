const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const baseCapitulosDir = path.join(__dirname, 'capitulos_v3');
const classesPath = path.join(__dirname, 'scripts', 'online_classes', 'endocrinologia_online_classes.json');
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

const endocrinoTopicDefinitions = [
  { chapNum: 7, topicNum: 1, classIdx: 0, svg: null, algoTitle: null },
  { chapNum: 7, topicNum: 2, classIdx: 1, svg: null, algoTitle: null },
  { chapNum: 7, topicNum: 3, classIdx: 2, svg: null, algoTitle: null },
  { chapNum: 7, topicNum: 4, classIdx: 3, svg: 'algo_hipotiroidismo.svg', algoTitle: 'Algoritmo Diagnóstico y Terapéutico de Hipotiroidismo' },
  { chapNum: 7, topicNum: 5, classIdx: 4, svg: null, algoTitle: null },
  { chapNum: 7, topicNum: 6, classIdx: 5, svg: null, algoTitle: null },
  { chapNum: 7, topicNum: 7, classIdx: 6, svg: null, algoTitle: null },
  { chapNum: 7, topicNum: 8, classIdx: 7, svg: null, algoTitle: null },
  { chapNum: 7, topicNum: 9, classIdx: 8, svg: null, algoTitle: null },
  { chapNum: 7, topicNum: 10, classIdx: 9, svg: null, algoTitle: null },
  { chapNum: 7, topicNum: 11, classIdx: 10, svg: 'algo_nodulo_tiroideo.svg', algoTitle: 'Algoritmo Diagnóstico de Nódulo Tiroideo y Sistema Bethesda' },
  { chapNum: 7, topicNum: 12, classIdx: 11, svg: null, algoTitle: null },
  { chapNum: 7, topicNum: 13, classIdx: 12, svg: null, algoTitle: null },
  { chapNum: 7, topicNum: 14, classIdx: 13, svg: null, algoTitle: null },
  { chapNum: 7, topicNum: 15, classIdx: 14, svg: null, algoTitle: null },
  { chapNum: 7, topicNum: 16, classIdx: 15, svg: null, algoTitle: null }
];

const customVignettesMap = {
  1: { vignette: "Mujer de 28 años consulta por amenorrea secundaria de 6 meses y galactorrea bilateral espontánea. Campimetría visual por confrontación normal. Prolactina sérica: 180 ng/mL (normal < 25). RMN de silla turca muestra microadenoma hipofisiario de 6 mm.", explicacion: "Prolactinoma (Microprolactinoma < 10 mm): tumor hipofisiario funcionante más frecuente. El tratamiento de primera línea es MÉDICO con agonistas dopaminérgicos (Cabergolina de elección por mayor eficacia y tolerancia, o Bromocriptina). La cirugía transesfenoidal se reserva para resistencia, intolerancia o macroadenomas con compromiso visual refractario." },
  2: { vignette: "Mujer de 34 años con antecedente de parto complicado con hemorragia masiva postparto (atrapamiento de placenta y shock hipovolémico) hace 8 meses. No logró amamantar por agalactia y no ha vuelto a reglar. Presenta astenia severa, intolerancia al frío y pérdida de vello axilar y pubiano.", explicacion: "Síndrome de Sheehan (Necrosis isquémica hipofisiaria postparto): hipopituitarismo secundario a shock hipovolémico puerperal. Afecta secuencialmente Prolactina (agalactia precoz), Gonadotrofinas (amenorrea), TSH (hipotiroidismo secundario) y ACTH (insuficiencia suprarrenal secundaria). Tratamiento: reemplazo hormonal de por vida (Levotiroxina + Hidrocortisona; Hidrocortisona siempre antes o concomitante con T4 para evitar crisis adrenal)." },
  3: { vignette: "Hombre de 45 años consulta por dudas sobre exámenes tiroideos. Se explica la síntesis de hormonas tiroideas a partir de yodo y tiroglobulina, la acción de la TPO y la conversión periférica de T4 a T3 por deiodinasas.", explicacion: "Fisiología Tiroidea: la T4 es la hormona principal producida por la tiroides pero la T3 es la forma biológicamente activa periférica. El exceso de yodo puede inhibir la síntesis de hormonas tiroideas transitoriamente (Efecto Wolff-Chaikoff) o inducir hipertiroidismo en bocios nodulares autónomos (Fenómeno de Jod-Basedow)." },
  4: { vignette: "Mujer de 42 años consulta por astenia progresiva de 6 meses, intolerancia al frío, constipación, aumento de 5 kg de peso y piel seca. Al examen: tiroides discretamente aumentada de tamaño, firme e indolora. TSH: 18.5 mUI/L, T4 libre: 0.4 ng/dL. Anticuerpos anti-TPO marcadamente positivos.", explicacion: "Hipotiroidismo Primario por Tiroiditis Autoinmune (Enfermedad de Hashimoto): causa más frecuente en zonas yodosuficientes. Caracterizado por TSH elevada con T4L baja y anti-TPO (+). Tratamiento: Levotiroxina oral 1.6 mcg/kg/día tomada en ayunas 30-60 minutos antes del desayuno. Control de TSH a las 6-8 semanas para ajuste de dosis." },
  5: { vignette: "Mujer de 35 años asintomática, en chequeo laboral presenta TSH de 7.8 mUI/L con T4 libre normal (1.2 ng/dL). Anticuerpos anti-TPO positivos. No está embarazada ni tiene planes de embarazo a corto plazo.", explicacion: "Hipotiroidismo Subclínico: TSH elevada con T4L normal. Indicaciones de tratamiento con Levotiroxina: (1) TSH ≥ 10 mUI/L; (2) Embarazo o deseo de fertilidad; (3) Presencia de síntomas atribuibles en < 65 años o anti-TPO positivo con bocio; (4) Menores de 65 años con riesgo cardiovascular. En esta paciente con anti-TPO (+), se puede indicar inicio de dosis bajas de T4 (25-50 mcg/d) o seguimiento estrecho cada 6 meses." },
  6: { vignette: "Mujer de 78 años con antecedente de hipotiroidismo en abandono de tratamiento es traída en invierno a urgencias por compromiso de conciencia severo (estupor). Al examen: temperatura rectal 34.2 °C, PA 85/50 mmHg, FC 42 lpm, edema periorbitario duro y reflejos osteotendinosos con relajación muy lenta. Sodio: 122 mEq/L, Glicemia: 58 mg/dL.", explicacion: "Coma Mixedematoso: emergencia médica de alta letalidad. Tríada de Hipotermia + Hiponatremia/Hipoglicemia + Bradicardia e hipotensión con compromiso de conciencia. Manejo inmediato en UCI: (1) Hidrocortisona EV 100 mg c/8h (antes de T4 para prevenir crisis suprarrenal aguda); (2) Levotiroxina EV/SNG dosis de carga; (3) Calentamiento pasivo; (4) Manejo hidroelectrolítico cuidadoso con suero salino hipertónico si hiponatremia sintomática grave." },
  7: { vignette: "Recién nacido de 20 días de vida es traído por ictericia persistente, llanto ronco, succión débil, distensión abdominal con hernia umbilical y fontanela posterior amplia (> 1 cm). El tamizaje neonatal (TSH de talón) tomado al 3er día informa TSH de 45 mUI/L.", explicacion: "Hipotiroidismo Congénito: la causa prevenible más frecuente de discapacidad intelectual (cretinismo). El tamizaje neonatal universal permite diagnóstico precoz. El inicio inmediato de Levotiroxina (10-15 mcg/kg/día) antes de los 14 días de vida previene el daño neurológico irreversible." },
  8: { vignette: "Mujer de 28 años con hipotiroidismo primario compensado con Levotiroxina 75 mcg/día confirma embarazo de 6 semanas mediante test de orina. Consulta qué hacer con su tratamiento.", explicacion: "Hipotiroidismo en el Embarazo: el feto depende de la T4 materna en el primer trimestre para el desarrollo neurocognitivo. Apenas se confirma el embarazo, la paciente debe AUMENTAR la dosis de Levotiroxina en un 30-50% (ej. tomar 2 comprimidos adicionales por semana). Metas de TSH: < 2.5 mUI/L en 1er trimestre y < 3.0 mUI/L en 2do y 3er trimestre. Control de TSH cada 4 semanas hasta la semana 20." },
  9: { vignette: "Mujer de 32 años consulta por pérdida de 6 kg de peso en 2 meses con apetito aumentado, temblor distal fino, palpitaciones, intolerancia al calor y diarrea. Al examen: FC 115 lpm regular, bocio difuso con soplo auscultatorio tiroideo, exoftalmos bilateral y retracción palpebral. TSH < 0.01 mUI/L, T4 libre 3.8 ng/dL.", explicacion: "Hipertiroidismo por Enfermedad de Basedow-Graves: causa más frecuente de tirotoxicosis en mujeres jóvenes. Tríada: Bocio difuso + Oftalmopatía infiltrativa (exoftalmos) + Dermopatía (mixedema pretibial). Anticuerpos anti-receptor de TSH (TRAb) positivos. Tratamiento: Betabloqueadores (Propranolol) para control sintomático + Antitiroideos de síntesis (Metimazol como primera línea; Propiltiouracilo en 1er trimestre de embarazo)." },
  10: { vignette: "Recién nacido de 5 días de vida, hijo de madre con Enfermedad de Basedow-Graves tratada con tiroidectomía hace 2 años, presenta taquicardia persistente (FC 190 lpm), irritabilidad, pobre ganancia ponderal, ojos prominentes y bocio palpable.", explicacion: "Enfermedad de Basedow-Graves Neonatal: causada por el paso transplacentario de anticuerpos maternos estimulantes del receptor de TSH (TRAb de tipo IgG). Puede ocurrir incluso si la madre ya fue operada o tratada con yodo radioactivo. Es un cuadro autolimitado que dura 2-3 meses (mientras se eliminan los anticuerpos maternos). Tratamiento agudo: Metimazol + Propranolol + Solución de Lugol para frenar la liberación hormonal." },
  11: { vignette: "Hombre de 48 años asintomático se realiza ecografía cervical por estudio de carótidas que identifica incidentalmente un nódulo tiroideo en lóbulo derecho de 18 mm, sólido, marcadamente hipoecogénico, con microcalcificaciones y bordes irregulares (TIRADS 5). TSH sérica normal (1.8 mUI/L).", explicacion: "Nódulo Tiroideo Sospechoso: el primer paso siempre es medir TSH. Si la TSH es normal o alta, se evalúa el riesgo ecográfico (TIRADS). Con nódulo ≥ 10 mm y características ecográficas de alta sospecha (TIRADS 5: microcalcificaciones, hipoecogenicidad, más alto que ancho), la conducta obligada es Punción Aspirativa con Aguja Fina (PAAF) guiada por ecografía para estudio citológico (Sistema Bethesda)." },
  12: { vignette: "Mujer de 19 años consulta por amenorrea secundaria de 8 meses. Nunca antes había tenido irregularidades. IMC 22 kg/m². Test de embarazo en orina (b-hCG) resulta negativo. Examen físico y ginecológico normal.", explicacion: "Estudio de Amenorrea Secundaria: el paso inicial siempre es descartar Embarazo (b-hCG). Tras descartar embarazo, el algoritmo diagnóstico incluye: (1) Medir TSH y Prolactina; (2) Prueba de Progesterona (Medroxiprogesterona 10 mg/d por 10 días): si sangra, indica anovulación (ej. SOP); si no sangra, sugiere causa uterina o hipoestrogenismo; (3) Medir FSH/LH para diferenciar falla ovárica prematura (FSH alta) de causa hipotalámica-hipofisiaria (FSH baja/normal)." },
  13: { vignette: "Mujer de 38 años operada de tiroidectomía total por nódulo tiroideo. La biopsia definitiva informa Carcinoma Papilar de Tiroides de 2.5 cm con invasión capsular y 2 ganglios linfáticos metastásicos en compartimento central (pT2 N1a M0).", explicacion: "Manejo del Cáncer Papilar de Tiroides: subtipo más frecuente (85-90%) y de excelente pronóstico. En pacientes con tumores > 2-4 cm o metástasis ganglionares (riesgo intermedio/alto), el tratamiento complementario incluye: (1) Ablación de remanente tiroideo con Yodo Radiactivo (I-131); (2) Terapia supresiva con Levotiroxina (meta TSH < 0.1 mUI/L); (3) Seguimiento con Tiroglobulina sérica (marcador tumoral) y ecografía cervical periódica." },
  14: { vignette: "Mujer de 40 años consulta por dolor intenso en cara anterior del cuello irradiado a mandíbula y oídos de 1 semana de evolución, precedido hace 2 semanas por un cuadro respiratorio viral alto. Examen: tiroides aumentada de tamaño y sumamente dolorosa al tacto. VHS: 95 mm/h. TSH suprimida con T4L elevada. Cintigrama tiroideo muestra captación de I-131 marcadamente disminuida (< 1%).", explicacion: "Tiroiditis Subaguda de De Quervain (Granulomatosa): inflamación post-viral caracterizada por dolor tiroideo exquisito, VHS marcadamente elevada y tirotoxicosis con captación de yodo radioactivo prácticamente nula (por lisis folicular con liberación de hormona preformada). Tratamiento: AINEs a dosis altas (o corticoides orales Prednisona si dolor severo) + Propranolol para los síntomas adrenérgicos. Los antitiroideos (Metimazol) NO tienen indicación." },
  15: { vignette: "Mujer de 44 años consulta por aumento de peso progresivo de 12 kg, debilidad muscular proximal en muslos, estrías violáceas anchas (> 1 cm) en abdomen y equimosis espontáneas fáciles. Examen: cara de luna llena, giba dorsal, PA 155/95 mmHg e hirsutismo.", explicacion: "Síndrome de Cushing: sospecha clínica por fenotipo clásico. Tamizaje de primera línea (se requieren al menos 2 pruebas positivas): (1) Cortisol libre urinario en 24 horas; (2) Test de Nugent (cortisol post 1 mg de Dexametasona nocturna > 1.8 mcg/dL); (3) Cortisol salival nocturno x2. Una vez confirmado, se mide ACTH para clasificar en ACTH-dependiente (Enfermedad de Cushing hipofisiaria o tumor ectópico) vs ACTH-independiente (adenoma o carcinoma suprarrenal)." },
  16: { vignette: "Hombre de 50 años con antecedente de vitiligo consulta por astenia severa, mareos ortostáticos, pérdida de 8 kg de peso y náuseas. Al examen: PA 90/55 mmHg con caída ortostática, hiperpigmentación marcada en pliegues palmares, cicatrices y mucosa bucal. Laboratorio: Sodio 128 mEq/L, Potasio 5.8 mEq/L, Glicemia 65 mg/dL. Cortisol basal 8 AM: 2.1 mcg/dL (muy bajo).", explicacion: "Insuficiencia Suprarrenal Primaria (Enfermedad de Addison): destrucción autoinmune de la corteza suprarrenal con déficit de glucocorticoides y mineralocorticoides. Cursa con Hipotensión + Hiperkalemia + Hiponatremia + Hipoglicemia e Hiperpigmentación cutáneo-mucosa (por elevación compensatoria de ACTH y MSH). Diagnóstico: Cortisol basal 8 AM < 3-5 mcg/dL y Test de estimulación con ACTH sintética (Cosintropina). Tratamiento: Hidrocortisona (glucocorticoide) + Fludrocortisona (mineralocorticoide)." }
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
  
  .topic-hdr { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #7c2d12; padding-bottom: 4px; margin-bottom: 8px; }
  .topic-hdr h2 { font-family: 'Merriweather', serif; font-size: 13.5pt; color: #7c2d12; }
  .topic-hdr .num { font-size: 8pt; font-weight: 700; color: #c2410c; text-transform: uppercase; }
  .perfil-tag { background: #fff7ed; border: 1px solid #ffedd5; border-left: 4px solid #ea580c; padding: 3px 6px; font-size: 7.5pt; }

  .two-col-flow { column-count: 2; column-gap: 0.2in; width: 100%; }
  
  .box { border: 1px solid #cbd5e1; border-radius: 2px; padding: 5px 7px; margin-top: 5px; margin-bottom: 5px; font-size: 8pt; width: 100%; break-inside: avoid; }
  .box-title { font-weight: 700; font-size: 7.5pt; text-transform: uppercase; margin-bottom: 2px; letter-spacing: 0.5px; }
  .box.high-yield { background: #f8fafc; border-left: 3.5px solid #ea580c; break-inside: avoid; }
  .box.high-yield .box-title { color: #c2410c; }

  .box.vignette-redesigned { background: #fffdf5; border: 1.5px solid #f59e0b; border-radius: 3px; padding: 0; margin-top: 6px; margin-bottom: 6px; overflow: hidden; break-inside: avoid; }
  .vignette-hdr { background: #d97706; color: #ffffff; font-weight: 700; font-size: 8pt; padding: 3.5px 8px; text-transform: uppercase; letter-spacing: 0.5px; }
  .vignette-body { padding: 6px 8px; }
  .vignette-sec { margin-bottom: 4px; }
  .vignette-sec.concept-sec { border-top: 1px dashed #fcd34d; padding-top: 4px; margin-bottom: 0; }
  .sec-label { font-weight: 700; font-size: 7.5pt; color: #92400e; display: block; margin-bottom: 2px; }
  .sec-text { font-size: 8pt; line-height: 1.35; color: #1e293b; }

  .box.summary-fullwidth { width: 100%; background: #fff7ed; border: 1.5px solid #ea580c; border-radius: 3px; padding: 0; margin-top: 10px; margin-bottom: 6px; overflow: hidden; break-inside: avoid; }
  .summary-hdr { background: #ea580c; color: #ffffff; font-weight: 700; font-size: 8.5pt; padding: 4px 10px; text-transform: uppercase; letter-spacing: 0.5px; }
  .summary-body { padding: 8px 10px; font-size: 8.5pt; line-height: 1.4; color: #9a3412; }

  .box.important-callout { background: #fef2f2; border-color: #fca5a5; border-left: 3.5px solid #ef4444; }
  .box.important-callout .box-title { color: #991b1b; }
  .box.warning-callout { background: #fff7ed; border-color: #ffedd5; border-left: 3.5px solid #f97316; }
  .box.warning-callout .box-title { color: #c2410c; }
  .box.note-callout { background: #f8fafc; border-color: #e2e8f0; border-left: 3.5px solid #64748b; }
  .box.note-callout .box-title { color: #334155; }
  .box.tip-callout { background: #fff5f5; border: 1.5px solid #fca5a5; border-left: 3.5px solid #dc2626; }
  .box.tip-callout .box-title { color: #991b1b; }
  .box.tip-callout p { color: #7f1d1d; }

  .subhead { font-family: 'Merriweather', serif; font-size: 9.5pt; font-weight: 700; color: #7c2d12; margin: 8px 0 4px 0; border-bottom: 1px solid #cbd5e1; padding-bottom: 1px; break-after: avoid; }
  .subhead-small { font-family: 'Inter', sans-serif; font-size: 8.5pt; font-weight: 700; color: #0f172a; margin: 6px 0 3px 0; break-after: avoid; }
  p.txt { font-size: 8pt; line-height: 1.35; margin-bottom: 4px; text-align: justify; }
  ul.lst { padding-left: 12px; margin-bottom: 4px; }
  ul.lst li { font-size: 8pt; margin-bottom: 2px; }

  .tbl-container { width: 100%; margin: 6px 0; break-inside: avoid; }
  .tbl-hdr { font-weight: 700; font-size: 7.5pt; color: #7c2d12; background: #fff7ed; padding: 3px 6px; border: 1px solid #cbd5e1; border-bottom: none; text-transform: uppercase; letter-spacing: 0.5px; }
  .tbl-hdr .tbl-num { color: #ea580c; }
  table.tbl { width: 100%; border-collapse: collapse; font-size: 7.5pt; border: 1px solid #cbd5e1; border-top: 1.5px solid #7c2d12; border-bottom: 1.5px solid #7c2d12; }
  table.tbl th { background: #fff7ed; color: #7c2d12; padding: 4px 5px; text-align: left; font-size: 7pt; text-transform: uppercase; font-weight: 700; border-bottom: 1px solid #cbd5e1; }
  table.tbl td { padding: 4px 5px; border-bottom: 1px solid #e2e8f0; vertical-align: top; line-height: 1.3; }
  table.tbl tr:nth-child(even) td { background: #f8fafc; }

  .diagram-box { width: 100%; border: 1px solid #7c2d12; border-radius: 2px; padding: 5px 8px; margin-top: 6px; margin-bottom: 6px; background: #ffffff; text-align: center; break-inside: avoid; }
  .diagram-box .d-title { font-weight: 700; font-size: 8pt; text-transform: uppercase; color: #7c2d12; text-align: center; margin-bottom: 4px; border-bottom: 1px solid #cbd5e1; padding-bottom: 2px; }
  .svg-centered { display: flex; justify-content: center; align-items: center; width: 100%; text-align: center; }
  .svg-centered svg { max-width: 100%; height: auto; margin: 0 auto; display: block; }

  .topic-questions-container { width: 100%; margin-top: 8px; break-inside: avoid; }
  .t-q-title { font-weight: 700; font-size: 8pt; color: #7c2d12; text-transform: uppercase; border-bottom: 1.5px solid #7c2d12; padding-bottom: 2px; margin-bottom: 4px; }
  .q-full-width { width: 100%; background: #ffffff; border: 1px solid #cbd5e1; border-left: 3.5px solid #ea580c; border-radius: 2px; padding: 5px 8px; margin-bottom: 5px; break-inside: avoid; }
  .q-hdr-link { display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px; }
  .q-full-width .q-hdr { font-weight: 700; font-size: 8pt; color: #ea580c; text-transform: uppercase; letter-spacing: 0.5px; }
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
  console.log(`Generando PDFs para Capítulo 7: Endocrinología (16 temas)...`);

  const chapDirV3 = path.join(baseCapitulosDir, 'Capitulo_7_Endocrinologia');
  if (!fs.existsSync(chapDirV3)) fs.mkdirSync(chapDirV3, { recursive: true });

  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  for (const tDef of endocrinoTopicDefinitions) {
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
      explicacion: "Manejo clínico según protocolo endocrinológico EUNACOM."
    };

    const topicObj = {
      chapNum: tDef.chapNum,
      topicNumInChap: tDef.topicNum,
      topicLabel,
      title: rawClass.topic,
      perfilCode: rawClass.eunacom_code || `1.03.${tDef.topicNum < 10 ? '0' + tDef.topicNum : tDef.topicNum}`,
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
          <div style="font-size: 7.5pt; font-family: 'Inter', sans-serif; color: #ea580c; width: 100%; display: flex; justify-content: space-between; align-items: center; margin: 0 0.35in; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">
            <span>MANUAL EUNACOM &bull; CAPÍTULO ${topicLabel} &bull; ENDOCRINOLOGÍA</span>
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
  console.log(`\n🎉 Capítulo 7: Endocrinología (16 temas) generado con éxito!`);
}

main().catch(console.error);
