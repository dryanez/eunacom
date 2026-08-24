const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

// Function to render PlantUML SVG flowcharts cleanly inside the PDF page
function renderPlantUmlSvg(svgFilename, algoTitle) {
  const svgPath = path.join(__dirname, 'svg_diagrams', svgFilename);
  if (!fs.existsSync(svgPath)) return '';

  const svgContent = fs.readFileSync(svgPath, 'utf8');

  return `
    <div class="diagram-container-step2">
      <div class="d-header">${algoTitle.toUpperCase()}</div>
      <div class="svg-wrapper">
        ${svgContent}
      </div>
    </div>
  `;
}

// Medical Content Data for Chapter 1 Arritmias
const chapterData = {
  title: "Capítulo 1: Arritmias y Emergencias Cardiovasculares",
  subtitle: "Manual de Estudio EUNACOM — Basado en Perfil 2026 y Guías Clínicas MINSAL / GES",
  chapterNumber: "1",
  topics: [
    {
      number: "1.1",
      title: "Manejo de Urgencias en Arritmias",
      perfilCode: "1.01.2.009",
      perfilName: "Taqui y bradiarritmia con compromiso hemodinámico",
      dx: "Específico",
      tx: "Inicial",
      seg: "Derivar",
      aspectosEsenciales: [
        "Inestabilidad hemodinámica (hipotensión, choque, dolor isquémico, edema pulmonar agudo o alteración de conciencia) requiere cardioversión eléctrica sincronizada inmediata en taquiarritmias.",
        "En bradiarritmias sintomáticas o inestables, el tratamiento farmacológico inicial es Atropina 0.5 - 1 mg EV bolo, preparando marcapaso transcutáneo.",
        "Taquicardia de complejo QRS angosto (<0.12s) estable: 1° Maniobras vagales (Valsalva modificada), 2° Adenosina 6 mg EV bolo rápido.",
        "Taquicardia de complejo QRS ancho (>=0.12s) en adulto con antecedentes cardiovasculares debe manejarse como Taquicardia Ventricular hasta demostrar lo contrario."
      ],
      casoClinico: {
        vignette: "Mujer de 60 años con antecedente de estenosis mitral severa e hipertensión arterial, ingresa a urgencias por disnea de reposo y palpitaciones de inicio brusco hace 2 horas. Al examen físico: paciente soporosa, pálida y sudorosa; PA 82/40 mmHg, FC 145x' irregular, MP(+) con crépitos difusos en ambos campos pulmonares y soplo diastólico IV/VI en ápex. ECG confirma Fibrilación Auricular con respuesta ventricular rápida.",
        piensaEn: "Fibrilación Auricular con respuesta ventricular rápida y descompensación hemodinámica aguda (Shock cardiogénico + Edema agudo pulmonar).",
        conducta: "Cardioversión eléctrica sincronizada inmediata con 120-200 Joules previa sedación rápida si la conciencia lo permite."
      },
      conceptoNarrativo: `
        <div class="section-subhead">Definición y Concepto Fundamental</div>
        <p class="narrative-text">El manejo de urgencia en arritmias comprende el conjunto de medidas diagnósticas y terapéuticas inmediatas orientadas a estabilizar al paciente que cursa con un trastorno del ritmo cardíaco asociado a riesgo vital inminente o deterioro hemodinámico severo. La premisa fundamental en la medicina de urgencia no es el diagnóstico electrocardiográfico exacto inicial, sino la determinación del estado de perfusión tisular y la presencia de inestabilidad hemodinámica.</p>

        <div class="section-subhead">Fisiopatología de la Inestabilidad Hemodinámica</div>
        <p class="narrative-text">Tanto las taquiarritmias como las bradiarritmias severas alteran el gasto cardíaco. En las taquiarritmias severas (frecuencias > 150x'), el tiempo de llenado diastólico del ventrículo izquierdo disminuye drásticamente, lo que reduce el volumen sistólico, colapsa el gasto cardíaco y disminuye la perfusión de las arterias coronarias. En las bradiarritmias severas (frecuencias < 40x'), la frecuencia extremadamente baja es insuficiente para mantener el gasto cardíaco mínimo requerido por los órganos nobles.</p>
      `,
      conceptoNarrativoCol2: `
        <div class="section-subhead">Criterios Clínicos de Inestabilidad (Los 4 Signos Cardinales)</div>
        <p class="narrative-text">Ante cualquier arritmia en urgencias, debe buscarse activamente la presencia de al menos uno de los siguientes 4 criterios de inestabilidad:</p>
        <ul class="bullet-list">
          <li><strong>Signos de Choque / Hipotensión:</strong> PAS < 90 mmHg, PAM < 65 mmHg, frialdad distal o llenado capilar lento.</li>
          <li><strong>Alteración Aguda del Estado Mental:</strong> Somnolencia, confusión o síncope secundario a hipoperfusión cerebral.</li>
          <li><strong>Isquemia Miocárdica Activa:</strong> Dolor torácico opresivo de características anginosas o cambios isquémicos en ECG.</li>
          <li><strong>Insuficiencia Cardíaca Aguda:</strong> Congestión pulmonar franca (crépitos bibasales difusos, ortopnea, edema pulmonar agudo).</li>
        </ul>
      `,
      svgFilename: "algo_urgencias.svg",
      algoritmoTitle: "Algoritmo de Evaluación y Manejo Agudo de Arritmias",
      tablaFarmacos: [
        { farmaco: "Adenosina", indicacion: "TPSV regular QRS angosto", dosis: "6 mg EV bolo rápido + 20 ml SF", precauciones: "Contraindicada en asma severo. Causa rubor y pausa asistólica." },
        { farmaco: "Amiodarona", indicacion: "TV monomórfica estable / FA descompensada", dosis: "150 mg EV en 10 min, infusión 1 mg/min", precauciones: "Hipotensión arterial, bradicardia. Monitorizar QT." },
        { farmaco: "Atropina", indicacion: "Bradiarritmia sintomática / BAV nodal", dosis: "0.5 - 1 mg EV bolo (máx 3 mg)", precauciones: "Ineficaz en BAV infranodal (Mobitz II / BAV 3°)." }
      ],
      sidebarTips: [
        { type: "EUNACOM TIP", text: "En el examen EUNACOM, si un paciente con arritmia tiene hipotensión o edema pulmonar, la respuesta correcta SIEMPRE es cardioversión eléctrica. No intente fármacos primero." },
        { type: "DATO CLAVE", text: "Sincronizar el cardioversor con la onda R es vital para evitar descargar sobre la onda T y precipitar una Fibrilación Ventricular (fenómeno R sobre T)." },
        { type: "MINSAL GES", text: "El protocolo SAMU / Red de Urgencia exige monitor con parches de desfibrilación instalados antes del traslado de todo paciente arritmico inestable." }
      ],
      highYieldPearls: [
        "En taquicardia ventricular sin pulso o fibrilación ventricular se realiza DESFIBRILACIÓN NO SINCRONIZADA inmediata.",
        "La dosis de adenosina debe administrarse mediante técnica de dos llaves (bolo rápido seguido inmediatamente de 20 ml de SF).",
        "En bradiarritmias por sobredosis de betabloqueadores el antídoto específico es el Glucagón EV."
      ],
      preguntas: [
        {
          numero: 11,
          pregunta: "Mujer de 60 años, con estenosis mitral severa, inicia bruscamente disnea y palpitaciones. Al examen FC:140x', PA:85/35, MP(+), con crépitos intensos y difusos, RI2T con soplo diastólico IV/VI en ápex. La conducta inicial más adecuada es:",
          opciones: [
            { id: "A", text: "Administrar amiodarona endovenosa en bolo" },
            { id: "B", text: "Entregar oxígeno a FiO2 elevadas y soporte ventilatorio con BiPAP" },
            { id: "C", text: "Reponer fluidos con suero fisiológico" },
            { id: "D", text: "Cardioversión eléctrica inmediata" },
            { id: "E", text: "Administrar furosemida endovenosa asociada a drogas vasoactivas" }
          ],
          respuestaCorrecta: "D",
          explicacion: "Paciente hemodinámicamente inestable (PA 85/35 mmHg) por taquiarritmia con edema pulmonar agudo. La indicación absoluta de primera línea es la cardioversión eléctrica sincronizada inmediata."
        }
      ]
    },
    {
      number: "1.2",
      title: "Paro Cardiorespiratorio",
      perfilCode: "1.01.2.006",
      perfilName: "Paro cardiorespiratorio",
      dx: "Específico",
      tx: "Completo",
      seg: "Derivar",
      aspectosEsenciales: [
        "Diagnóstico de Paro: Paciente inconsciente + no responde + no respira normalmente + ausencia de pulso carotídeo comprobada en < 10 segundos.",
        "Ritmos Desfibrilables: Fibrilación Ventricular (FV) y Taquicardia Ventricular sin pulso (TVsp).",
        "Ritmos NO Desfibrilables: Asistolia y Actividad Eléctrica Sin Pulso (AESP). Requieren RCP inmediata y Adrenalina precoz.",
        "Calidad de las Compresiones: Frecuencia 100-120/min, profundidad 5-6 cm, permitir reexpansión torácica completa, minimizar interrupciones (<10s)."
      ],
      casoClinico: {
        vignette: "Hombre de 58 años, hipertenso y fumador, se desploma súbitamente en urgencias. Al evaluarlo, no responde y no se palpa pulso carotídeo en 5 segundos. El monitor muestra actividad eléctrica caótica e irregular sin complejos QRS reconocibles.",
        piensaEn: "Paro Cardiorespiratorio en Fibrilación Ventricular (Ritmo desfibrilable).",
        conducta: "Iniciar compresiones torácicas inmediatamente -> Aplicar descarga de 200 Joules bifásico e inmediatamente reiniciar RCP por 2 minutos."
      },
      conceptoNarrativo: `
        <div class="section-subhead">Definición y Etiología del Paro Cardiorespiratorio (PCR)</div>
        <p class="narrative-text">El paro cardiorespiratorio es la cesación brusca e inesperada de la actividad mecánica cardíaca y de la respiración espontánea. En adultos, más del 80% de los casos de PCR son de causa cardíaca primaria, siendo la cardiopatía coronaria agudizada la etiología más frecuente.</p>
      `,
      conceptoNarrativoCol2: `
        <div class="section-subhead">Fisiopatología de los Ritmos de Paro</div>
        <p class="narrative-text">Los ritmos de PCR se dividen en Desfibrilables (FV / TVsp) y NO Desfibrilables (Asistolia / AESP). La asistolia representa la ausencia total de actividad eléctrica. La AESP presenta despolarización eléctrica sin contracción mecánica efectiva.</p>
      `,
      svgFilename: "algo_pcr.svg",
      algoritmoTitle: "Algoritmo General de Soporte Vital Avanzado (ACLS)",
      tablaFarmacos: [
        { farmaco: "Adrenalina", indicacion: "PCR (Todos los ritmos)", dosis: "1 mg EV bolo c/3-5 min (1:10.000)", precauciones: "En asistolia/AESP dar de inmediato. En FV/TVsp dar tras 2° descarga." },
        { farmaco: "Amiodarona", indicacion: "FV / TVsp refractaria a descargas", dosis: "1° dosis 300 mg EV, 2° dosis 150 mg", precauciones: "Administrar tras 3° descarga si persiste ritmo desfibrilable." }
      ],
      sidebarTips: [
        { type: "EUNACOM TIP", text: "En asistolia NUNCA desfibrilar. Confirmar el trazado en al menos 2 derivaciones y buscar causas 5H y 5T." },
        { type: "DATO CLAVE", text: "La capnografía cuantitativa (ETCO2) monitoriza la calidad de las compresiones. Un valor < 10 mmHg indica RCP ineficaz." }
      ],
      highYieldPearls: [
        "Frecuencia de ventilación tras intubación endotraqueal: 1 ventilación cada 6 segundos (10 por minuto) sin pausar compresiones.",
        "La causa reversible más común de AESP en pacientes traumatizados o hipotensos es la hipovolemia severa."
      ],
      preguntas: [
        {
          numero: 19,
          pregunta: "Paciente de 58 años sufre paro cardíaco presenciado. Se inicia RCP y el monitor demuestra asistolia. La medida farmacológica más adecuada e inmediata es:",
          opciones: [
            { id: "A", text: "Administrar atropina 1 mg EV" },
            { id: "B", text: "Administrar amiodarona 300 mg EV" },
            { id: "C", text: "Administrar adrenalina 1 mg EV" },
            { id: "D", text: "Realizar choque eléctrico de 200J" },
            { id: "E", text: "Administrar bicarbonato de sodio 1 mEq/kg" }
          ],
          respuestaCorrecta: "C",
          explicacion: "En ritmos NO desfibrilables (asistolia y AESP), la adrenalina 1 mg EV debe administrarse lo antes posible junto con la RCP de alta calidad."
        }
      ]
    }
  ],
  tablasComparativas: [
    {
      title: "Tabla Comparativa: Arritmias Supraventriculares",
      headers: ["Característica", "Fibrilación Auricular", "Flutter Auricular", "TPSV (Reentrada Nodal)", "Extrasístoles Auriculares"],
      rows: [
        ["Frecuencia Auricular", "350 - 600 x'", "250 - 350 x' (típico 300)", "150 - 220 x'", "Variable (prematura)"],
        ["Ritmo Ventricular", "Irregularmente Irregular", "Regular (2:1 a 150x') o Irregular", "Estrictamente Regular", "Regular con pausa prematura"],
        ["Onda P en ECG", "Ausente (Ondas 'f')", "Ondas 'F' en serrucho", "Oculta o P' retrógrada", "P' prematura distinta"],
        ["Respuesta a Adenosina", "Enlentece respuesta ventricular", "Desenmascara ondas en serrucho", "REVIERTE a ritmo sinusal", "Sin efecto relevante"],
        ["Tratamiento Definitivo", "Ablación venas pulmonares / ACO", "Ablación Istmo Cavotricuspídeo", "Ablación vía lenta nodal", "Generalmente no requiere"]
      ]
    }
  ],
  bibliografia: [
    { id: 1, text: "Perfil EUNACOM 2026 Versión 3. Ministerio de Salud de Chile / ASOFAMECH." },
    { id: 2, text: "Guía de Práctica Clínica GES N°5: Infarto Agudo del Miocardio con SDST. MINSAL Chile, 2018." },
    { id: 3, text: "Guía de Práctica Clínica GES N°25: Trastornos de conducción en mayores de 15 años. MINSAL Chile." }
  ]
};

function generateHtml(data) {
  let html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${data.title}</title>
  <link rel="stylesheet" href="book_styles.css">
</head>
<body>

  <!-- COVER PAGE -->
  <div class="cover-page">
    <div class="cover-badge">MANUAL DE ESTUDIO EUNACOM</div>
    <h1>${data.title}</h1>
    <div class="cover-subtitle">${data.subtitle}</div>
    <div class="cover-chapter">CAPÍTULO ${data.chapterNumber}</div>
    <div class="cover-meta">EUNACOM Medicina Interna &bull; República de Chile</div>
  </div>

  <!-- TABLE OF CONTENTS -->
  <div class="toc-page">
    <h2>ÍNDICE DEL CAPÍTULO</h2>
`;

  data.topics.forEach(t => {
    html += `
    <div class="toc-entry">
      <span class="toc-number">${t.number}</span>
      <span class="toc-title">${t.title}</span>
      <span class="toc-dots"></span>
      <span class="toc-page-num">--</span>
    </div>`;
  });

  html += `
    <div class="toc-entry toc-section">Tablas Comparativas del Capítulo</div>
    <div class="toc-entry">
      <span class="toc-title">Comparación de Arritmias Supraventriculares</span>
      <span class="toc-dots"></span>
    </div>

    <div class="toc-entry toc-section">Referencias y Bibliografía</div>
    <div class="toc-entry">
      <span class="toc-title">Referencias Bibliográficas del Capítulo</span>
      <span class="toc-dots"></span>
    </div>
  </div>
`;

  // TOPICS CONTENT — STRICT 50% / 50% SIDE-BY-SIDE TWO-COLUMN FLEX GRID
  data.topics.forEach(t => {
    html += `
  <div class="topic-page">
    <!-- Full-width header spanning top of page -->
    <div class="topic-header-full">
      <div class="topic-title-group">
        <div class="topic-num">TEMA ${t.number}</div>
        <h3>${t.title}</h3>
      </div>
      <div class="perfil-badge-compact">
        <div class="p-code">PERFIL EUNACOM ${t.perfilCode}</div>
        <div class="p-levels">
          <span><strong>Dx:</strong> ${t.dx}</span> &bull;
          <span><strong>Tx:</strong> ${t.tx}</span> &bull;
          <span><strong>Seg:</strong> ${t.seg}</span>
        </div>
      </div>
    </div>

    <!-- ROW 1: TWO EQUAL 50% / 50% SIDE-BY-SIDE COLUMNS -->
    <div class="step2-row">
      <!-- LEFT COLUMN (50% WIDTH) -->
      <div class="step2-col border-right">
        <!-- Aspectos Esenciales -->
        <div class="callout-box high-yield">
          <div class="callout-header">Aspectos Esenciales (High Yield)</div>
          <ul>
            ${t.aspectosEsenciales.map(a => `<li>${a}</li>`).join('')}
          </ul>
        </div>

        <!-- Concepto Narrativo Parte 1 -->
        ${t.conceptoNarrativo}

        <!-- EUNACOM Tips & GES Alerts -->
        ${t.sidebarTips.map(sb => `
          <div class="callout-box ${sb.type.toLowerCase().includes('ges') ? 'ges-alert' : sb.type.toLowerCase().includes('tip') ? 'eunacom-tip' : sb.type.toLowerCase().includes('warning') ? 'warning' : 'high-yield'}">
            <div class="callout-header">${sb.type}</div>
            <p>${sb.text}</p>
          </div>
        `).join('')}
      </div>

      <!-- RIGHT COLUMN (50% WIDTH) -->
      <div class="step2-col">
        <!-- Caso Clínico Tipo -->
        <div class="callout-box vignette">
          <div class="callout-header">Caso Clínico Tipo EUNACOM</div>
          <p>"${t.casoClinico.vignette}"</p>
          <p style="margin-top: 4px;"><strong>Piensa en:</strong> ${t.casoClinico.piensaEn}</p>
          <p><strong>Conducta:</strong> ${t.casoClinico.conducta}</p>
        </div>

        <!-- Concepto Narrativo Parte 2 -->
        ${t.conceptoNarrativoCol2}

        <!-- Perlas Clínicas -->
        <div class="callout-box high-yield">
          <div class="callout-header">Perlas Clínicas EUNACOM</div>
          <ul>
            ${t.highYieldPearls.map(p => `<li>${p}</li>`).join('')}
          </ul>
        </div>

        <!-- Fármacos -->
        ${t.tablaFarmacos && t.tablaFarmacos.length > 0 ? `
        <table class="table-step2">
          <caption>Fármacos Clave en ${t.title}</caption>
          <thead>
            <tr><th>Fármaco</th><th>Indicación</th><th>Dosis</th><th>Precauciones</th></tr>
          </thead>
          <tbody>
            ${t.tablaFarmacos.map(f => `
              <tr>
                <td><strong>${f.farmaco}</strong></td>
                <td>${f.indicacion}</td>
                <td>${f.dosis}</td>
                <td>${f.precauciones}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        ` : ''}

        <!-- Preguntas -->
        ${t.preguntas.map(q => `
          <div class="question-box-step2">
            <div class="q-hdr">Pregunta ${q.numero} EUNACOM</div>
            <div class="q-txt">${q.pregunta}</div>
            <div class="q-opts">
              ${q.opciones.map(o => `
                <div class="q-opt ${o.id === q.respuestaCorrecta ? 'correct' : ''}">
                  <span><strong>${o.id})</strong> ${o.text}</span>
                </div>
              `).join('')}
            </div>
            <div class="q-ans-box">
              <strong>Respuesta Correcta ${q.respuestaCorrecta}:</strong> ${q.explicacion}
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- PlantUML Vector Flowchart across page at bottom -->
    ${t.svgFilename ? renderPlantUmlSvg(t.svgFilename, t.algoritmoTitle || t.algoritmo.title) : ''}
  </div>
`;
  });

  // COMPARISON TABLES (Full-width across page)
  html += `
  <div class="topic-page">
    <div class="toc-page">
      <h2>TABLAS COMPARATIVAS DE CAPÍTULO</h2>
    </div>
    <div class="comparison-section">
`;
  data.tablasComparativas.forEach(tc => {
    html += `
    <table class="table-step2" style="margin-bottom: 20px;">
      <caption>${tc.title}</caption>
      <thead>
        <tr>${tc.headers.map(h => `<th>${h}</th>`).join('')}</tr>
      </thead>
      <tbody>
        ${tc.rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}
      </tbody>
    </table>`;
  });
  html += `
    </div>
  </div>
`;

  // BIBLIOGRAPHY
  html += `
  <div class="topic-page">
    <div class="bibliography">
      <h3>Referencias y Bibliografía del Capítulo</h3>
      <ol>
        ${data.bibliografia.map(b => `<li>${b.text}</li>`).join('')}
      </ol>
    </div>
  </div>

</body>
</html>
`;

  return html;
}

async function run() {
  console.log("Generando HTML V4 Strict 50/50 Flex Grid Layout...");
  const htmlContent = generateHtml(chapterData);
  const htmlPath = path.join(__dirname, 'output', 'capitulo1_step2ck_v4.html');
  fs.writeFileSync(htmlPath, htmlContent, 'utf-8');

  console.log("Lanzando Puppeteer para renderizar PDF V4 Strict 50/50...");
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });

  const pdfPath = path.join(__dirname, 'output', 'cardiologia-cap1-step2ck-v4.pdf');
  await page.pdf({
    path: pdfPath,
    format: 'Letter',
    printBackground: true,
    margin: {
      top: '0.45in',
      bottom: '0.45in',
      left: '0.45in',
      right: '0.45in'
    }
  });

  await browser.close();
  console.log("¡ÉXITO! PDF Strict 50/50 Flex Grid generado en:", pdfPath);
}

run().catch(err => {
  console.error("Error generando PDF Strict 50/50:", err);
});
