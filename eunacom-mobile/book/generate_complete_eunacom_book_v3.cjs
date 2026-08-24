const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const baseBookDir = path.join(__dirname, 'libro_eunacom_v3');
const classesDir = path.join(__dirname, 'scripts', 'online_classes');
const figurasGaleriaDir = path.join(__dirname, 'figuras_galeria');

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

function getUserPngBase64(imgFilename) {
  if (!imgFilename) return null;
  const p = path.join(figurasGaleriaDir, imgFilename);
  if (fs.existsSync(p)) {
    const data = fs.readFileSync(p);
    return `data:image/png;base64,${data.toString('base64')}`;
  }
  return null;
}

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

function getCss(primaryColor, darkColor, lightBg) {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Merriweather:wght@400;700&display=swap');
    @page { size: letter; margin: 0.42in 0.35in 0.38in 0.35in; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; font-size: 8.5pt; line-height: 1.35; color: #0f172a; background: #ffffff; -webkit-print-color-adjust: exact; }
    .page { width: 100%; page-break-after: always; position: relative; }
    .topic-section { page-break-after: always; }
    
    .topic-hdr { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid ${darkColor}; padding-bottom: 4px; margin-bottom: 8px; }
    .topic-hdr h2 { font-family: 'Merriweather', serif; font-size: 13.5pt; color: ${darkColor}; }
    .topic-hdr .num { font-size: 8pt; font-weight: 700; color: ${primaryColor}; text-transform: uppercase; }
    .perfil-tag { background: ${lightBg}; border: 1px solid #cbd5e1; border-left: 4px solid ${primaryColor}; padding: 3px 6px; font-size: 7.5pt; }

    .two-col-flow { column-count: 2; column-gap: 0.2in; width: 100%; }
    
    .box { border: 1px solid #cbd5e1; border-radius: 2px; padding: 5px 7px; margin-top: 5px; margin-bottom: 5px; font-size: 8pt; width: 100%; break-inside: avoid; }
    .box-title { font-weight: 700; font-size: 7.5pt; text-transform: uppercase; margin-bottom: 2px; letter-spacing: 0.5px; }
    .box.high-yield { background: #f8fafc; border-left: 3.5px solid ${primaryColor}; break-inside: avoid; }
    .box.high-yield .box-title { color: ${primaryColor}; }

    .box.vignette-redesigned { background: #fffdf5; border: 1.5px solid #f59e0b; border-radius: 3px; padding: 0; margin-top: 6px; margin-bottom: 6px; overflow: hidden; break-inside: avoid; }
    .vignette-hdr { background: #d97706; color: #ffffff; font-weight: 700; font-size: 8pt; padding: 3.5px 8px; text-transform: uppercase; letter-spacing: 0.5px; }
    .vignette-body { padding: 6px 8px; }
    .vignette-sec { margin-bottom: 4px; }
    .vignette-sec.concept-sec { border-top: 1px dashed #fcd34d; padding-top: 4px; margin-bottom: 0; }
    .sec-label { font-weight: 700; font-size: 7.5pt; color: #92400e; display: block; margin-bottom: 2px; }
    .sec-text { font-size: 8pt; line-height: 1.35; color: #1e293b; }

    .box.summary-fullwidth { width: 100%; background: ${lightBg}; border: 1.5px solid ${primaryColor}; border-radius: 3px; padding: 0; margin-top: 10px; margin-bottom: 6px; overflow: hidden; break-inside: avoid; }
    .summary-hdr { background: ${primaryColor}; color: #ffffff; font-weight: 700; font-size: 8.5pt; padding: 4px 10px; text-transform: uppercase; letter-spacing: 0.5px; }
    .summary-body { padding: 8px 10px; font-size: 8.5pt; line-height: 1.4; color: ${darkColor}; }

    .box.important-callout { background: #fef2f2; border-color: #fca5a5; border-left: 3.5px solid #ef4444; }
    .box.important-callout .box-title { color: #991b1b; }
    .box.warning-callout { background: #fff7ed; border-color: #ffedd5; border-left: 3.5px solid #f97316; }
    .box.warning-callout .box-title { color: #c2410c; }
    .box.note-callout { background: #f8fafc; border-color: #e2e8f0; border-left: 3.5px solid #64748b; }
    .box.note-callout .box-title { color: #334155; }
    .box.tip-callout { background: #fff5f5; border: 1.5px solid #fca5a5; border-left: 3.5px solid #dc2626; }
    .box.tip-callout .box-title { color: #991b1b; }
    .box.tip-callout p { color: #7f1d1d; }

    .subhead { font-family: 'Merriweather', serif; font-size: 9.5pt; font-weight: 700; color: ${darkColor}; margin: 8px 0 4px 0; border-bottom: 1px solid #cbd5e1; padding-bottom: 1px; break-after: avoid; }
    .subhead-small { font-family: 'Inter', sans-serif; font-size: 8.5pt; font-weight: 700; color: #0f172a; margin: 6px 0 3px 0; break-after: avoid; }
    p.txt { font-size: 8pt; line-height: 1.35; margin-bottom: 4px; text-align: justify; }
    ul.lst { padding-left: 12px; margin-bottom: 4px; }
    ul.lst li { font-size: 8pt; margin-bottom: 2px; }

    .tbl-container { width: 100%; margin: 6px 0; break-inside: avoid; }
    .tbl-hdr { font-weight: 700; font-size: 7.5pt; color: ${darkColor}; background: ${lightBg}; padding: 3px 6px; border: 1px solid #cbd5e1; border-bottom: none; text-transform: uppercase; letter-spacing: 0.5px; }
    .tbl-hdr .tbl-num { color: ${primaryColor}; }
    table.tbl { width: 100%; border-collapse: collapse; font-size: 7.5pt; border: 1px solid #cbd5e1; border-top: 1.5px solid ${darkColor}; border-bottom: 1.5px solid ${darkColor}; }
    table.tbl th { background: ${lightBg}; color: ${darkColor}; padding: 4px 5px; text-align: left; font-size: 7pt; text-transform: uppercase; font-weight: 700; border-bottom: 1px solid #cbd5e1; }
    table.tbl td { padding: 4px 5px; border-bottom: 1px solid #e2e8f0; vertical-align: top; line-height: 1.3; }
    table.tbl tr:nth-child(even) td { background: #f8fafc; }

    .diagram-box { width: 100%; border: 1px solid ${darkColor}; border-radius: 2px; padding: 5px 8px; margin-top: 6px; margin-bottom: 6px; background: #ffffff; text-align: center; break-inside: avoid; }
    .diagram-box .d-title { font-weight: 700; font-size: 8pt; text-transform: uppercase; color: ${darkColor}; text-align: center; margin-bottom: 4px; border-bottom: 1px solid #cbd5e1; padding-bottom: 2px; }
    .svg-centered { display: flex; justify-content: center; align-items: center; width: 100%; text-align: center; }
    .svg-centered svg { max-width: 100%; height: auto; margin: 0 auto; display: block; }
    .user-figure-centered { display: flex; justify-content: center; align-items: center; width: 100%; margin: 4px 0; }
    .user-figure-centered img { max-width: 100%; max-height: 140px; object-fit: contain; }

    .topic-questions-container { width: 100%; margin-top: 8px; break-inside: avoid; }
    .t-q-title { font-weight: 700; font-size: 8pt; color: ${darkColor}; text-transform: uppercase; border-bottom: 1.5px solid ${darkColor}; padding-bottom: 2px; margin-bottom: 4px; }
    .q-full-width { width: 100%; background: #ffffff; border: 1px solid #cbd5e1; border-left: 3.5px solid ${primaryColor}; border-radius: 2px; padding: 5px 8px; margin-bottom: 5px; break-inside: avoid; }
    .q-hdr-link { display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px; }
    .q-full-width .q-hdr { font-weight: 700; font-size: 8pt; color: ${primaryColor}; text-transform: uppercase; letter-spacing: 0.5px; }
    .q-full-width .q-stem { font-size: 8pt; line-height: 1.35; margin-bottom: 4px; }
    .q-options-grid { display: flex; flex-direction: column; gap: 2px; margin-bottom: 2px; }
    .q-opt-item { font-size: 7.5pt; padding: 2px 4px; border-radius: 2px; background: #f8fafc; border: 1px solid #e2e8f0; }
  `;
}

function buildTopicHtml(t, css, moduleTitle) {
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

  let figuresHtml = '';
  if (t.multiFigs && t.multiFigs.length > 0) {
    t.multiFigs.forEach(f => {
      const b64 = getUserPngBase64(f.img);
      if (b64) {
        figuresHtml += `
          <div class="diagram-box">
            <div class="d-title">${f.title.toUpperCase()}</div>
            <div class="user-figure-centered">
              <img src="${b64}" alt="${f.title}">
            </div>
          </div>
        `;
      }
    });
  } else if (t.userPng) {
    const b64 = getUserPngBase64(t.userPng);
    if (b64) {
      figuresHtml += `
        <div class="diagram-box">
          <div class="d-title">FIGURA ${t.topicLabel}: ${t.algoTitle.toUpperCase()}</div>
          <div class="user-figure-centered">
            <img src="${b64}" alt="${t.algoTitle}">
          </div>
        </div>
      `;
    }
  } else if (t.svg) {
    figuresHtml += `
      <div class="diagram-box">
        <div class="d-title">FIGURA ${t.topicLabel}: ${t.algoTitle.toUpperCase()}</div>
        <div class="svg-centered">
          ${getSvg(t.svg)}
        </div>
      </div>
    `;
  }

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>${css}</style>
</head>
<body>
  <div class="page topic-section">
    <div class="topic-hdr">
      <div>
        <div class="num">TEMA ${t.topicLabel} &bull; ${t.chapterTitle.toUpperCase()}</div>
        <h2>${t.title}</h2>
      </div>
      <div class="perfil-tag">
        <strong>PERFIL EUNACOM ${t.perfilCode}</strong><br>
        Dx: ${t.dx} &bull; Tx: ${t.tx} &bull; Seg: ${t.seg}
      </div>
    </div>

    ${twoColContent}
    ${figuresHtml}

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

// Special custom vignettes for Cardiology (unified 47 topics)
const cardioVignettesMap = {
  1: { vignette: "Mujer de 60 años con estenosis mitral severa presenta palpitaciones y disnea aguda. Al examen: PA 85/40 mmHg, FC 150 lpm irregular, edema pulmonar agudo. ECG revela taquicardia de complejo QRS angosto irregular compatible con fibrilación auricular con respuesta ventricular rápida.", explicacion: "En cualquier taquiarritmia o bradiarritmia en urgencias, la presencia de compromiso hemodinámico exige Cardioversión Eléctrica Sincronizada inmediata." },
  2: { vignette: "Hombre de 55 años sufre colapso súbito en la vía pública. El monitor muestra Fibrilación Ventricular (FV). Se realiza la primera descarga eléctrica de 200 J.", explicacion: "En el algoritmo de RCP Avanzado (ACLS) para ritmos desfibrilables, tras la 1ª descarga se reanuda RCP de alta calidad durante 2 minutos." },
  3: { vignette: "Hombre de 70 años colapsa en sala de espera. No responde, no respira. Se inicia RCP básica. A los 2 minutos llega el DEA y analiza ritmo no desfibrilable (asistolía).", explicacion: "En ritmos no desfibrilables (asistolía y AESP), el manejo es RCP de alta calidad continua + Adrenalina 1 mg EV cada 3-5 minutos. No se desfibrila. Buscar causas reversibles (5H y 5T)." },
  4: { vignette: "Hombre de 78 años consulta por astenia severa y síncope de esfuerzo. El ECG demuestra disociación AV completa con QRS anchos a 32 cpm.", explicacion: "El Bloqueo AV de 3er Grado se caracteriza por disociación AV total. En inestabilidad, Atropina 1 mg EV es medida puente inicial; el tratamiento definitivo es Marcapaso." },
  5: { vignette: "Hombre de 68 años consulta por palpitaciones irregulares de 3 semanas. ECG no muestra ondas P e intervalos R-R irregulares a FC 115 lpm.", explicacion: "La FA requiere ausencia de ondas P y ritmo irregularmente irregular. En paciente estable, controlar FC y evaluar CHA₂DS₂-VASc para anticoagulación." },
  6: { vignette: "Hombre de 62 años con antecedente de infarto previo y FEVI 35% presenta FA paroxística recurrente pese a control de frecuencia con betabloqueadores. Se plantea estrategia de control del ritmo.", explicacion: "En pacientes con cardiopatía estructural (FEVI reducida o infarto previo), el único antiarrítmico seguro para mantener ritmo sinusal es la Amiodarona. Flecainida y Propafenona están CONTRAINDICADAS por riesgo proarrítmico. En corazón sano, Flecainida es primera línea (pill-in-the-pocket)." },
  7: { vignette: "Mujer de 72 años con FA no valvular, HTA, diabetes y ACV previo (CHA₂DS₂-VASc = 6). Se indica anticoagulación oral crónica. Clearance de creatinina 35 mL/min.", explicacion: "En FA no valvular con CHA₂DS₂-VASc ≥ 2, se indica anticoagulación. Los ACODs (Rivaroxabán, Apixabán, Dabigatrán) son primera línea sobre Warfarina. Con ClCr 15-30 mL/min se ajustan dosis de ACODs. Con ClCr < 15 mL/min o válvula mecánica: solo Warfarina (INR 2-3)." },
  8: { vignette: "Hombre de 75 años hipertenso y diabético consulta por FA persistente diagnosticada hace 6 meses. FC en reposo 95 lpm, asintomático. CHA₂DS₂-VASc = 4.", explicacion: "Los 3 pilares del manejo de FA son: (1) Anticoagulación según CHA₂DS₂-VASc (≥ 2 en hombres, ≥ 3 en mujeres); (2) Control de frecuencia (meta FC < 110 en reposo con Betabloqueadores o Verapamilo/Diltiazem); (3) Evaluar control del ritmo según síntomas." },
  9: { vignette: "Mujer de 80 años con FA permanente de 5 años, asintomática con FC controlada en 85 lpm con Metoprolol. Ecocardiograma muestra AI dilatada (55 mm) y FEVI conservada.", explicacion: "En FA permanente (aceptada), NO se intenta cardioversión ni control del ritmo. El objetivo es control de frecuencia (FC < 110 lpm en reposo) y anticoagulación crónica según CHA₂DS₂-VASc. La dilatación auricular marcada hace improbable mantener ritmo sinusal." },
  10: { vignette: "Hombre de 55 años previamente sano consulta por palpitaciones de inicio hace 8 horas. ECG confirma FA. Hemodinámicamente estable, sin cardiopatía estructural conocida.", explicacion: "FA de < 48 horas en paciente estable sin cardiopatía: se puede intentar cardioversión farmacológica (Flecainida 'pill-in-the-pocket' o Amiodarona) o eléctrica SIN necesidad de anticoagulación previa ni ETE. Si > 48 horas o duración incierta: anticoagular 3 semanas antes de cardiovertir o realizar ETE para descartar trombo auricular." },
  11: { vignette: "Hombre de 60 años consulta por palpitaciones regulares. ECG muestra taquicardia regular a 150 lpm con ondas F en 'dientes de sierra' en DII, DIII y aVF, sin ondas P identificables.", explicacion: "El Flutter Auricular típico tiene frecuencia auricular de ~300 lpm con conducción AV 2:1 → FC ventricular ~150 lpm. Patrón ECG: ondas F en dientes de sierra. El tratamiento definitivo es la Ablación del Istmo Cavo-Tricuspídeo (éxito > 95%). La anticoagulación sigue las mismas reglas que FA (CHA₂DS₂-VASc)." },
  12: { vignette: "Mujer de 28 años presenta inicio súbito de palpitaciones regulares a 180 lpm sin ondas P visibles.", explicacion: "La TPSV por Reentrada Nodal se maneja con Maniobras Vagales -> Adenosina 6 mg EV -> Verapamilo." },
  13: { vignette: "Hombre de 60 años con infarto previo presenta taquicardia regular de QRS ancho (0.16s) a 160 lpm.", explicacion: "Toda taquicardia de QRS ancho debe manejarse como TV hasta demostrar lo contrario. Amiodarona 150 mg EV o cardioversión eléctrica si inestable." },
  14: { vignette: "Mujer de 35 años sana consulta por palpitaciones intermitentes tipo 'salto' que aumentan con el café y el estrés. Examen físico normal. ECG muestra latidos prematuros aislados con QRS angosto precedidos de onda P diferente al ritmo sinusal.", explicacion: "Las extrasístoles auriculares aisladas en pacientes jóvenes sin cardiopatía estructural son benignas y no requieren tratamiento antiarrítmico. Manejo: tranquilizar al paciente, reducir gatillantes (cafeína, estrés). Derivar a cardiología si son frecuentes (> 10% del total de latidos en Holter) o hay síntomas significativos." },
  15: { vignette: "Hombre de 64 años, diabético, presenta dolor opresivo al caminar 2 cuadras que cede en 5 min de reposo. Test de esfuerzo (+).", explicacion: "Angina Estable Crónica. Tratamiento médico óptimo: Aspirina 100mg + Atorvastatina 80mg + Betabloqueador. Coronariografía si test de alto riesgo." },
  16: { vignette: "Hombre de 58 años en urgencias por dolor torácico intenso de 45 min. ECG < 10 min.", explicacion: "Descartar 5 letales: SCA, Disección Aórtica, TEP, Neumotórax a Tensión y Rotura Esofágica." },
  17: { vignette: "Hombre de 62 años consulta por dolor torácico opresivo de 2 horas. ECG muestra supradesnivel del ST de 3 mm en DII, DIII y aVF con infradesnivel recíproco en DI y aVL.", explicacion: "El supradesnivel del ST en cara inferior (DII, DIII, aVF) con cambios recíprocos en cara lateral indica IAMSDST inferior, generalmente por oclusión de la arteria coronaria derecha. Se deben tomar derivaciones derechas (V3R-V4R) para descartar extensión al ventrículo derecho." },
  18: { vignette: "Mujer de 70 años consulta por dolor torácico atípico de 6 horas. ECG sin cambios agudos. Troponina de alta sensibilidad (TnT-hs) inicial: 25 ng/L (valor normal < 14 ng/L). Se repite a las 3 horas: 85 ng/L.", explicacion: "El delta de troponina (ascenso > 50% a las 3 horas desde un valor inicial elevado) confirma injuria miocárdica aguda tipo infarto. El protocolo 0h/1h o 0h/3h con TnT-hs permite descarte rápido (rule-out) o confirmación (rule-in). CK-MB ya no es marcador de primera línea." },
  19: { vignette: "Hombre de 55 años consulta por dolor opresivo en reposo de 1h. ECG muestra infradesnivel ST de 2 mm con Troponina I elevada.", explicacion: "IAMSEST / Angina Inestable. Tratamiento: Antiagregación dual (Aspirina + Ticagrelor), Anticoagulación (Enoxaparina), Betabloqueadores y Estatinas." },
  20: { vignette: "Hombre de 68 años, día 4 post IAMSDST anterior, presenta súbitamente soplo holosistólico nuevo en borde esternal izquierdo bajo, con frémito palpable. PA cae a 75/50 mmHg con signos de shock cardiogénico.", explicacion: "Soplo holosistólico nuevo post-IAM sugiere rotura del septum interventricular (CIV post-infarto) o insuficiencia mitral aguda por rotura de músculo papilar. Ambas son emergencias quirúrgicas. La CIV post-IAM ocurre típicamente en día 3-5 post-infarto. Diagnóstico: Ecocardiograma urgente. Tratamiento: estabilizar con balón de contrapulsación intraaórtico + cirugía urgente." },
  21: { vignette: "Hombre de 58 años con IAMSDST inferior, tras reperfusión exitosa con angioplastía primaria, presenta ritmo regular de QRS ancho a 80 lpm sin compromiso hemodinámico. Trazado muestra complejos ventriculares idioventriculares.", explicacion: "El ritmo idioventricular acelerado (RIVA) post-reperfusión es un signo de reperfusión exitosa, es benigno y autolimitado. NO requiere tratamiento. No confundir con TV sostenida. En cambio, la TV sostenida o FV en contexto de IAM requiere desfibrilación/cardioversión y Amiodarona EV." },
  22: { vignette: "Hombre de 66 años ingresa por IAMSDST inferior. PA 80/40 mmHg, FC 55 lpm, ingurgitación yugular severa con campos pulmonares limpios.", explicacion: "Tríada de IAM de Ventrículo Derecho: Hipotensión, Ingurgitación yugular y Pulmones limpios en IAM inferior. Tratamiento: Sobrecarga de Volumen con Suero Fisiológico EV. CONTRAINDICADOS Nitratos y Diuréticos." },
  23: { vignette: "Mujer de 72 años consulta por disnea CF III, ortopnea y edema de EEII. Auscultación destaca R3 y rales bilaterales.", explicacion: "Insuficiencia Cardíaca Criterios de Framingham. BNP descarta por alto VPN. Ecocardiograma clasifica por FEVI." },
  24: { vignette: "Hombre de 65 años con IC y FEVI 30% sintomático.", explicacion: "Cuadriplete Fantástico: iSGLT2 + ARNI (Sacubitril/Valsartán) + Betabloqueador + Espironolactona." },
  25: { vignette: "Hombre de 58 años, fumador de 20 paquetes/año, hipertenso, diabético tipo 2, con colesterol LDL 165 mg/dL, consulta por dolor torácico de esfuerzo. Padre falleció de IAM a los 50 años.", explicacion: "Paciente con múltiples factores de riesgo cardiovascular (tabaquismo, HTA, DM2, dislipidemia, antecedente familiar de enfermedad coronaria prematura). El riesgo cardiovascular es muy alto. Tratamiento: Estatinas de alta intensidad (Atorvastatina 40-80 mg), meta LDL < 55 mg/dL, cesación tabáquica, control glicémico y de PA." },
  26: { vignette: "Hombre de 68 años, fumador de 40 paquetes/año, con EPOC Gold IV y oxígeno domiciliario, consulta por edema de EEII progresivo e ingurgitación yugular. PA 110/70, FC 95 lpm. ECG muestra onda P pulmonale y desviación del eje a la derecha. Ecocardiograma: dilatación de cavidades derechas con PSAP 55 mmHg.", explicacion: "Cor Pulmonale crónico por EPOC severa con hipertensión pulmonar secundaria. El tratamiento fundamental es optimizar la enfermedad pulmonar de base + Oxigenoterapia domiciliaria continua (> 15 h/día), que es la ÚNICA medida que reduce la mortalidad en cor pulmonale por EPOC. Los diuréticos se usan para manejo del edema." },
  27: { vignette: "Mujer de 55 años consulta por disnea progresiva. A la auscultación se encuentra un soplo diastólico de baja frecuencia en ápex con chasquido de apertura. Se solicita ecocardiograma que muestra área valvular mitral de 1.2 cm².", explicacion: "Estenosis Mitral con área < 1.5 cm² es severa. Etiología más frecuente: Reumática. Clasificación de soplos: Sistólicos (Estenosis Aórtica, Insuficiencia Mitral) vs Diastólicos (Estenosis Mitral, Insuficiencia Aórtica). El ecocardiograma es el gold standard para diagnóstico y severidad." },
  28: { vignette: "Hombre de 76 años consulta por síncope y angina de esfuerzo. Soplo sistólico áspero aórtico irradiado a carótidas con pulso parvus et tardus.", explicacion: "Estenosis Aórtica Severa. Indicación quirúrgica: Reemplazo Valvular Aórtico (TAVI o cirugía)." },
  29: { vignette: "Mujer de 38 años usuaria de drogas endovenosas consulta por fiebre, escalofríos y disnea. A la auscultación: soplo holosistólico en borde esternal izquierdo bajo que aumenta con la inspiración (signo de Rivero-Carvallo). Hemocultivos positivos para Staphylococcus aureus.", explicacion: "Insuficiencia Tricuspídea secundaria a Endocarditis Infecciosa de válvula tricúspide, frecuente en usuarios de drogas EV. El aumento del soplo con la inspiración (Rivero-Carvallo) es patognomónico de origen tricuspídeo. Tratamiento: Antibióticos EV prolongados (Oxacilina/Vancomicina). Cirugía si vegetaciones > 20 mm o embolias sépticas pulmonares recurrentes." },
  30: { vignette: "Hombre de 22 años, deportista universitario, presenta síncope durante un partido de fútbol. Antecedente de muerte súbita en hermano a los 19 años. Examen físico: soplo sistólico eyectivo que aumenta con maniobra de Valsalva y disminuye en cuclillas. Ecocardiograma: grosor septal 22 mm con SAM de la válvula mitral.", explicacion: "Miocardiopatía Hipertrófica Obstructiva: causa más frecuente de muerte súbita en jóvenes deportistas. El soplo aumenta con Valsalva (disminuye precarga). Diagnóstico: Ecocardiograma con hipertrofia asimétrica ≥ 15 mm. Tratamiento: Betabloqueadores (1ª línea), suspender deporte competitivo, evaluar desfibrilador implantable si factores de riesgo de muerte súbita." },
  31: { vignette: "Mujer de 40 años previamente sana presenta ACV isquémico criptogénico (estudio etiológico completo negativo: sin FA, sin aterosclerosis carotídea, sin trombofilias). Ecocardiograma transesofágico con inyección de burbujas demuestra paso de microburbujas a la aurícula izquierda con maniobra de Valsalva.", explicacion: "ACV criptogénico con Foramen Oval Permeable (FOP) y shunt derecha-izquierda demostrado. La embolia paradojal ocurre cuando un trombo venoso cruza el FOP al lado arterial. En pacientes < 60 años con ACV criptogénico y FOP de alto riesgo (aneurisma del septum o shunt grande), el cierre percutáneo del FOP reduce la recurrencia de ACV." },
  32: { vignette: "Niño de 6 años es derivado por soplo descubierto en control sano. Soplo sistólico eyectivo grado II/VI en borde esternal izquierdo, de tono musical vibratorio, sin irradiación. Desaparece al sentarse. Asintomático, desarrollo pondoestatural normal. Segundo ruido normal.", explicacion: "Soplo funcional o inocente (soplo de Still en niños). Características: sistólico, grado ≤ III/VI, nunca diastólico, sin frémito, varía con la posición, R2 con desdoblamiento fisiológico normal. NO requiere ecocardiograma si cumple todas las características de inocencia. Derivar a cardiología si: soplo diastólico, holosistólico, ≥ III/VI con frémito, R2 fijo, o síntomas asociados." },
  33: { vignette: "Hombre de 42 años con dolor pleurítico posicional que alivia al inclinarse adelante. ECG: ST cóncavo difuso e infradesnivel PR.", explicacion: "Pericarditis Aguda. Tratamiento: AINEs a dosis alta + Colchicina 0.5 mg/día por 3 meses." },
  34: { vignette: "Hombre de 25 años consulta por disnea y dolor torácico 2 semanas después de cuadro viral respiratorio. ECG muestra taquicardia sinusal con inversión de T difusa. Troponina elevada. Ecocardiograma: FEVI 35% con hipocinesia difusa. Coronariografía normal.", explicacion: "Miocarditis aguda viral (causa más frecuente: Coxsackie B, Parvovirus B19). Presentación: ICC aguda + troponina elevada + coronarias normales post cuadro viral. Diagnóstico definitivo: RMN cardíaca con realce tardío con gadolinio (patrón no isquémico, subepicárdico). Tratamiento: soporte de ICC (diuréticos, IECA, betabloqueadores). Restricción deportiva mínimo 3-6 meses." },
  35: { vignette: "Niña de 10 años consulta por fiebre, poliartritis migratoria de grandes articulaciones y soplo de insuficiencia mitral nuevo, 3 semanas después de faringoamigdalitis estreptocócica. ASO elevado.", explicacion: "Fiebre Reumática: cumple Criterios de Jones Modificados: 2 criterios mayores (Carditis + Poliartritis) con evidencia de infección estreptocócica previa (ASO elevado). Tratamiento agudo: Penicilina Benzatina IM + AINEs. Profilaxis secundaria: Penicilina Benzatina 1.2 MUI IM cada 4 semanas. Duración: 10 años o hasta los 40 años si hubo carditis con secuela valvular." },
  36: { vignette: "Hombre de 65 años con IAM anterior extenso presenta PA 75/50 mmHg, FC 120 lpm, piel fría y moteada, oliguria. Catéter de Swan-Ganz muestra: PCP 28 mmHg, índice cardíaco 1.6 L/min/m², RVS elevada.", explicacion: "Shock Cardiogénico: GC bajo + PCP alta + RVS elevada. Mortalidad > 40%. Tratamiento: Reperfusión coronaria urgente + Inotrópicos (Dobutamina) + Vasopresores (Noradrenalina si PA muy baja) + Balón de contrapulsación intraaórtico. Clasificación hemodinámica diferencial: Distributivo (séptico) = GC alto, RVS baja; Hipovolémico = GC bajo, PCP baja; Obstructivo (TEP/taponamiento) = GC bajo, PCP variable." },
  37: { vignette: "Recién nacido de 3 días de vida presenta cianosis severa progresiva que NO mejora con oxígeno al 100% (test de hiperoxia negativo). Ecocardiograma muestra grandes vasos en posición paralela con aorta naciendo del ventrículo derecho.", explicacion: "Transposición de Grandes Arterias (TGA): cardiopatía congénita cianótica neonatal con circulaciones en paralelo. El test de hiperoxia negativo (PaO₂ < 100 mmHg con FiO₂ 100%) confirma shunt intracardíaco fijo. Tratamiento de urgencia: Prostaglandina E1 EV (mantener ductus permeable) + Septostomía de Rashkind (comunicación interauricular). Cirugía definitiva: switch arterial (Jatene) en primeras 2 semanas de vida." },
  38: { vignette: "Lactante de 3 meses presenta soplo holosistólico paraesternal izquierdo grado IV/VI con frémito, hepatomegalia, taquipnea y falla de medro. Radiografía de tórax muestra cardiomegalia con hipervascularización pulmonar.", explicacion: "Comunicación Interventricular (CIV) grande con shunt izquierda-derecha significativo e ICC. La CIV es la cardiopatía congénita más frecuente. Soplo holosistólico con frémito. CIV grande causa hiperflujo pulmonar → ICC. Tratamiento médico: Diuréticos + IECA. Cierre quirúrgico si ICC refractaria o relación Qp/Qs > 2:1. Si no se corrige, puede desarrollar Síndrome de Eisenmenger (irreversible)." },
  39: { vignette: "Hombre de 60 años con dolor torácico lacerante 10/10 irradiado a espalda y asimetría de pulso.", explicacion: "Disección Aórtica. Stanford A (ascendente: Cirugía urgente) vs Stanford B (descendente: Betabloqueadores EV Labetalol)." },
  40: { vignette: "Hombre de 72 años fumador con masa pulsátil epigástrica. Eco-FAST confirma aorta 5.8 cm.", explicacion: "Aneurisma Aorta Abdominal. Indicación quirúrgica si ≥ 5.5 cm en hombres o sintomático." },
  41: { vignette: "Mujer de 74 años con FA presenta dolor súbito, palidez, parestesia y ausencia de pulsos en pierna derecha.", explicacion: "Isquemia Aguda de EEII (6 P). Tratamiento: Heparina EV bolo + Trombectomía Fogarty < 6 horas." },
  42: { vignette: "Hombre de 70 años, fumador y diabético, consulta por dolor en pantorrilla derecha al caminar 100 metros que cede con reposo (claudicación intermitente Fontaine IIb). Índice tobillo-brazo (ITB) de 0.55 en pierna derecha.", explicacion: "Enfermedad Arterial Periférica Crónica. Diagnóstico: ITB < 0.9 confirma EAP. Fontaine IIb (claudicación < 200 m). Tratamiento: Cesación tabáquica + Ejercicio supervisado + Cilostazol + Antiagregación (Aspirina o Clopidogrel) + Estatinas. Revascularización si claudicación invalidante o isquemia crítica (Fontaine III-IV: dolor de reposo o úlceras)." },
  43: { vignette: "Hombre de 71 años presenta amaurosis fugaz y paresia transitoria. Eco-Doppler: estenosis carotídea 82%.", explicacion: "Estenosis Carotídea Sintomática severa (70-99%). Indicación: Endarterectomía Carotídea < 14 días." },
  44: { vignette: "Mujer de 45 años, postoperada de histerectomía hace 7 días, consulta por aumento de volumen, dolor y empastamiento de pantorrilla izquierda. Signo de Homans positivo. Score de Wells para TVP: 3 puntos (probabilidad alta).", explicacion: "TVP proximal post-quirúrgica. Con probabilidad clínica alta (Wells ≥ 3), se solicita directamente Ecografía Doppler venosa (NO Dímero D, que solo sirve para descartar en probabilidad baja). Tratamiento: Anticoagulación con HBPM (Enoxaparina 1 mg/kg c/12h) seguida de ACODs por mínimo 3 meses. El Dímero D se utiliza solo cuando la probabilidad clínica es BAJA para descartar TVP." },
  45: { vignette: "Mujer de 35 años usuaria de ACOs consulta por disnea súbita y dolor pleurítico. FC 115 lpm.", explicacion: "TEP. Wells > 4 -> Angio-TAC de tórax directo. Tratamiento: Anticoagulación continua por 3-6 meses." },
  46: { vignette: "Hombre de 60 años con TVP proximal conocida presenta colapso hemodinámico súbito. PA 70/40 mmHg, FC 130 lpm, saturación 78%, ingurgitación yugular. Ecocardiograma en urgencias muestra dilatación severa del VD con septum paradojal.", explicacion: "TEP masivo (de alto riesgo) con shock obstructivo. Tratamiento de emergencia: Trombólisis sistémica con Alteplasa 100 mg EV en 2 horas. NO dar carga de volumen excesiva (empeora la dilatación del VD). Si contraindicación a trombólisis: Trombectomía quirúrgica o por catéter. En paro cardíaco por TEP: Alteplasa 50 mg en bolo EV durante RCP." },
  47: { vignette: "Mujer de 55 años consulta por úlcera en cara medial del maléolo izquierdo de 3 meses de evolución, poco dolorosa, con fondo granulante y bordes irregulares. Presenta edema vespertino, várices, dermatitis ocre y lipodermatoesclerosis en pierna ipsilateral.", explicacion: "Úlcera venosa crónica por insuficiencia venosa avanzada (clasificación CEAP C6). Características: perimalleolar medial, poco dolorosa, fondo granulante. Diagnóstico diferencial con úlcera arterial (distal, muy dolorosa, fondo pálido). Tratamiento: Compresión elástica gradual multicapa (pilar fundamental) + Curación avanzada de heridas + Pentoxifilina. Prevenir TVP con deambulación precoz." }
};

const cardioFiguresMap = {
  4: {
    multiFigs: [
      { img: 'figura_1.4_bav_completo.png', title: 'Figura 1.4A: Bloqueo Auriculoventricular Completo (3er Grado)' },
      { img: 'figura_1.4b_mobitz_2.png', title: 'Figura 1.4B: Bloqueo AV 2do Grado Mobitz II' }
    ]
  },
  13: {
    multiFigs: [
      { img: 'figura_torsades_de_pointes.png', title: 'Figura 1.13A: Torsades de Pointes (Taquicardia Ventricular Polimorfa)' },
      { img: 'figura_1.13b_tv_monomorfa.png', title: 'Figura 1.13B: Taquicardia Ventricular Monomorfa Sostenida' }
    ]
  },
  17: {
    multiFigs: [
      { img: 'figura_1.17a_infarto_anterior.png', title: 'Figura 1.17A: IAMSDST Anteroseptal Extenso (V1-V4)' },
      { img: 'figura_1.17b_infarto_inferior.png', title: 'Figura 1.17B: IAMSDST Cara Inferior (DII, DIII, aVF)' }
    ]
  }
};

const moduleStructures = [
  // ==========================================
  // SECTION 1: MÓDULO 1 (MEDICINA INTERNA)
  // ==========================================
  {
    moduleFolder: 'Modulo_1_Medicina_Interna',
    moduleTitle: 'Módulo 1: Medicina Interna',
    chapters: [
      { chapNum: 1, title: 'Cardiología', file: 'cardio_online_classes.json', folder: 'Capitulo_01_Cardiologia', color: '#1e3a8a', dark: '#0f172a', bg: '#eff6ff' },
      { chapNum: 2, title: 'Diabetes y Dislipidemias', file: 'diabetes_online_classes.json', folder: 'Capitulo_02_Diabetes', color: '#0f766e', dark: '#115e59', bg: '#f0fdfa' },
      { chapNum: 3, title: 'Endocrinología', file: 'endocrinologia_online_classes.json', folder: 'Capitulo_03_Endocrinologia', color: '#ea580c', dark: '#7c2d12', bg: '#fff7ed' },
      { chapNum: 4, title: 'Gastroenterología', file: 'gastroenterologia_online_classes.json', folder: 'Capitulo_04_Gastroenterologia', color: '#a16207', dark: '#713f12', bg: '#fefce8' },
      { chapNum: 5, title: 'Hematología', file: 'hematologia_online_classes.json', folder: 'Capitulo_05_Hematologia', color: '#be185d', dark: '#831843', bg: '#fdf2f8' },
      { chapNum: 6, title: 'Infectología', file: 'infectologia_online_classes.json', folder: 'Capitulo_06_Infectologia', color: '#059669', dark: '#064e3b', bg: '#ecfdf5' },
      { chapNum: 7, title: 'Nefrología', file: 'nefrologia_online_classes.json', folder: 'Capitulo_07_Nefrologia', color: '#0284c7', dark: '#0c4a6e', bg: '#f0f9ff' },
      { chapNum: 8, title: 'Neurología y Geriatría', file: 'neurologia_geriatria_online_classes.json', folder: 'Capitulo_08_Neurologia_y_Geriatria', color: '#7c3aed', dark: '#4c1d95', bg: '#f5f3ff' },
      { chapNum: 9, title: 'Respiratorio', file: 'respiratorio_online_classes.json', folder: 'Capitulo_09_Respiratorio', color: '#0891b2', dark: '#164e63', bg: '#ecfeff' },
      { chapNum: 10, title: 'Reumatología', file: 'reumatologia_online_classes.json', folder: 'Capitulo_10_Reumatologia', color: '#e11d48', dark: '#881337', bg: '#fff1f2' }
    ]
  },

  // ==========================================
  // SECTION 2: MÓDULO 2 (CIRUGÍA Y ESPECIALIDADES)
  // ==========================================
  {
    moduleFolder: 'Modulo_2_Cirugia_y_Especialidades',
    moduleTitle: 'Módulo 2: Cirugía y Especialidades',
    chapters: [
      { chapNum: 1, title: 'Cirugía General y Anestesia', file: 'm2_cirugia_anestesia_online_classes.json', folder: 'Capitulo_01_Cirugia_General_y_Anestesia', color: '#b91c1c', dark: '#7f1d1d', bg: '#fef2f2' },
      { chapNum: 2, title: 'Traumatología', file: 'm2_traumatologia_online_classes.json', folder: 'Capitulo_02_Traumatologia', color: '#d97706', dark: '#78350f', bg: '#fffbeb' },
      { chapNum: 3, title: 'Urología', file: 'm2_urologia_online_classes.json', folder: 'Capitulo_03_Urologia', color: '#2563eb', dark: '#1e3a8a', bg: '#eff6ff' },
      { chapNum: 4, title: 'Dermatología', file: 'm2_dermatologia_online_classes.json', folder: 'Capitulo_04_Dermatologia', color: '#c026d3', dark: '#701a75', bg: '#fdf4ff' },
      { chapNum: 5, title: 'Oftalmología', file: 'm2_oftalmologia_online_classes.json', folder: 'Capitulo_05_Oftalmologia', color: '#0d9488', dark: '#134e4a', bg: '#f0fdfa' },
      { chapNum: 6, title: 'Otorrinolaringología', file: 'm2_otorrinolaringologia_online_classes.json', folder: 'Capitulo_06_Otorrinolaringologia', color: '#4f46e5', dark: '#312e81', bg: '#eef2ff' },
      { chapNum: 7, title: 'Psiquiatría General', file: 'm2_psiquiatria_online_classes.json', folder: 'Capitulo_07_Psiquiatria_General', color: '#9333ea', dark: '#581c87', bg: '#faf5ff' },
      { chapNum: 8, title: 'Salud Pública', file: 'm2_salud_publica_online_classes.json', folder: 'Capitulo_08_Salud_Publica', color: '#059669', dark: '#064e3b', bg: '#ecfdf5' }
    ]
  },

  // ==========================================
  // SECTION 3: MÓDULO 3 (PEDIATRÍA Y GINECO-OBSTETRICIA)
  // ==========================================
  {
    moduleFolder: 'Modulo_3_Pediatria_y_Gineco_Obstetricia',
    moduleTitle: 'Módulo 3: Pediatría y Gineco-Obstetricia',
    chapters: [
      { chapNum: 1, title: 'Pediatría', file: 'm3_pediatria_online_classes.json', folder: 'Capitulo_01_Pediatria', color: '#0284c7', dark: '#075985', bg: '#f0f9ff' },
      { chapNum: 2, title: 'Ginecología', file: 'm3_ginecologia_online_classes.json', folder: 'Capitulo_02_Ginecologia', color: '#db2777', dark: '#831843', bg: '#fdf2f8' },
      { chapNum: 3, title: 'Obstetricia', file: 'm3_obstetricia_online_classes.json', folder: 'Capitulo_03_Obstetricia', color: '#e11d48', dark: '#881337', bg: '#fff1f2' }
    ]
  }
];

async function main() {
  console.log("Iniciando compilación general del LIBRO EUNACOM COMPLETO (3 Módulos)...");

  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  for (const mod of moduleStructures) {
    const modDir = path.join(baseBookDir, mod.moduleFolder);
    if (!fs.existsSync(modDir)) fs.mkdirSync(modDir, { recursive: true });

    console.log(`\n================================================================`);
    console.log(`🏛️  ${mod.moduleTitle.toUpperCase()}`);
    console.log(`================================================================`);

    for (const chap of mod.chapters) {
      let jsonPath = path.join(classesDir, chap.file);
      if (!fs.existsSync(jsonPath)) {
        // Fallback check in parent book dir for cardio
        const altPath = path.join(__dirname, chap.file);
        if (fs.existsSync(altPath)) jsonPath = altPath;
      }

      if (!fs.existsSync(jsonPath)) {
        console.warn(`  ⚠️ Archivo de clases no encontrado: ${chap.file}, esperando o saltando...`);
        continue;
      }

      const classes = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      const chapDir = path.join(modDir, chap.folder);
      if (!fs.existsSync(chapDir)) fs.mkdirSync(chapDir, { recursive: true });

      const css = getCss(chap.color, chap.dark, chap.bg);
      console.log(`\n📘 Capítulo ${chap.chapNum}: ${chap.title} (${classes.length} temas) -> ${chap.folder}`);

      for (let idx = 0; idx < classes.length; idx++) {
        const rawClass = classes[idx];
        const topicNum = idx + 1;
        const topicLabel = `${chap.chapNum}.${topicNum}`;

        const keyPoints = typeof rawClass.key_points === 'string' ? JSON.parse(rawClass.key_points) : (rawClass.key_points || []);
        const rawQuiz = typeof rawClass.quiz === 'string' ? JSON.parse(rawClass.quiz) : (rawClass.quiz || []);

        const rawArticle = rawClass.article_content || rawClass.clean_transcript || rawClass.summary || '';
        const formattedArticle = formatArticleContent(rawArticle, chap.chapNum, topicNum);

        const questionsForTopic = [];
        const qSourceList = Array.isArray(rawQuiz) ? rawQuiz : (typeof rawQuiz === 'object' && rawQuiz !== null ? [rawQuiz] : []);

        for (let qIdx = 0; qIdx < Math.min(3, Math.max(1, qSourceList.length)); qIdx++) {
          const qObj = qSourceList[qIdx] || qSourceList[0] || {};
          const qText = stripEmojis(qObj.questionText || qObj.question || qObj.pregunta || rawClass.topic);
          let optionsRaw = qObj.options || qObj.opciones || [];
          if (typeof optionsRaw === 'string') {
            try { optionsRaw = JSON.parse(optionsRaw); } catch (e) { optionsRaw = []; }
          }

          let options = [];
          if (Array.isArray(optionsRaw)) {
            options = optionsRaw.map((o, oIdx) => {
              const rawText = stripEmojis(typeof o === 'object' ? (o.text || o.texto || JSON.stringify(o)) : String(o));
              const cleanText = rawText.replace(/^[A-E][\)\.]\s*/i, '');
              return {
                id: (typeof o === 'object' && o.id) ? o.id : String.fromCharCode(65 + oIdx),
                texto: cleanText
              };
            });
          } else if (typeof optionsRaw === 'object' && optionsRaw !== null) {
            options = Object.entries(optionsRaw).map(([key, val]) => {
              const rawText = stripEmojis(typeof val === 'object' ? (val.text || val.texto || JSON.stringify(val)) : String(val));
              const cleanText = rawText.replace(/^[A-E][\)\.]\s*/i, '');
              return {
                id: key.toUpperCase(),
                texto: cleanText
              };
            });
          }

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

        // Custom vignettes lookup (Cardiology 1-47 or general fallback)
        let vignetteText = `Paciente consulta en el servicio de salud por cuadro clínico compatible con ${rawClass.topic}. Se realiza evaluación diagnóstica protocolizada según perfil EUNACOM.`;
        let explicacionText = `Manejo clínico y diagnóstico según normativa MINSAL y perfil EUNACOM para ${rawClass.topic}. Priorizar reconocimiento precoz y tratamiento de primera línea.`;

        if (chap.title === 'Cardiología' && cardioVignettesMap[topicNum]) {
          vignetteText = cardioVignettesMap[topicNum].vignette;
          explicacionText = cardioVignettesMap[topicNum].explicacion;
        } else if (questionsForTopic[0] && questionsForTopic[0].enunciado.length > 35) {
          vignetteText = questionsForTopic[0].enunciado;
        }

        // Figures lookup (Cardio user PNGs or standard SVGs)
        let multiFigs = null;
        let svgFile = null;
        let algoTitle = null;

        if (chap.title === 'Cardiología' && cardioFiguresMap[topicNum]) {
          multiFigs = cardioFiguresMap[topicNum].multiFigs;
        }

        const topicObj = {
          chapNum: chap.chapNum,
          topicNumInChap: topicNum,
          topicLabel,
          chapterTitle: chap.title,
          title: rawClass.topic,
          perfilCode: rawClass.eunacom_code || `1.${chap.chapNum < 10 ? '0' + chap.chapNum : chap.chapNum}.${topicNum < 10 ? '0' + topicNum : topicNum}`,
          dx: "Específico", tx: "Completo", seg: "Completo",
          articleHtml: formattedArticle,
          summaryText: stripEmojis(rawClass.summary || ''),
          keyPoints: keyPoints.map(stripEmojis),
          vignette: vignetteText,
          casoConcepto: explicacionText,
          preguntas: questionsForTopic,
          multiFigs,
          svg: svgFile,
          algoTitle
        };

        const htmlContent = buildTopicHtml(topicObj, css, mod.moduleTitle);
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        const topicPdfName = `Tema_${topicLabel}_${sanitizeFilename(rawClass.topic)}.pdf`;
        const topicPdfPath = path.join(chapDir, topicPdfName);

        try {
          await page.pdf({
            path: topicPdfPath,
            format: 'Letter',
            printBackground: true,
            displayHeaderFooter: true,
            headerTemplate: `
              <div style="font-size: 7.5pt; font-family: 'Inter', sans-serif; color: ${chap.color}; width: 100%; display: flex; justify-content: space-between; align-items: center; margin: 0 0.35in; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">
                <span>MANUAL EUNACOM &bull; CAPÍTULO ${chap.chapNum}: ${chap.title.toUpperCase()} &bull; TEMA ${topicLabel}</span>
                <span>PÁGINA <span class="pageNumber"></span></span>
              </div>
            `,
            footerTemplate: `<div></div>`,
            margin: { top: '0.42in', bottom: '0.38in', left: '0.35in', right: '0.35in' }
          });
          console.log(`  ✅ [${topicLabel}] ${topicPdfName}`);
        } catch (err) {
          console.warn(`  ⚠️ Error al generar ${topicPdfName}: ${err.message}`);
        }

        await page.close();
      }
      console.log(`✨ Capítulo ${chap.chapNum}: ${chap.title} completado.`);
    }
  }

  await browser.close();
  console.log("\n🏆 ¡LIBRO EUNACOM COMPLETO (3 MÓDULOS) GENERADO CON ÉXITO!");
}

main().catch(console.error);
