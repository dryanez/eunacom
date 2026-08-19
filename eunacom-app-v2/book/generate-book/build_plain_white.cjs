const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

// Function to render 100% clean, professional, plain white vector flowcharts (Publication Grade)
function renderVectorFlowchart(algo) {
  if (!algo || !algo.steps) return '';

  let nodesHtml = '';
  algo.steps.forEach((step, index) => {
    let nodeStyle = '';
    let classNames = 'flow-node';

    if (step.type === 'start') {
      classNames += ' node-start';
    } else if (step.type === 'decision') {
      classNames += ' node-decision';
    } else if (step.type === 'urgent') {
      classNames += ' node-urgent';
    } else if (step.type === 'action') {
      classNames += ' node-action';
    }

    nodesHtml += `
      <div class="${classNames}">
        <div class="node-text">${step.label.replace(/\n/g, '<br>')}</div>
      </div>
    `;

    if (index < algo.steps.length - 1) {
      nodesHtml += `
        <div class="flow-connector">
          <div class="line"></div>
          <div class="arrow-head"></div>
        </div>
      `;
    }
  });

  return `
    <div class="plain-white-diagram">
      <div class="diagram-title">${algo.title.toUpperCase()}</div>
      <div class="flow-container">
        ${nodesHtml}
      </div>
    </div>
  `;
}

// Medical Content (Zero emojis, deep conceptual narrative, plain white style)
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
        <div class="narrative-block">
          <h4>Definición y Concepto Fundamental</h4>
          <p>El manejo de urgencia en arritmias comprende el conjunto de medidas diagnósticas y terapéuticas inmediatas orientadas a estabilizar al paciente que cursa con un trastorno del ritmo cardíaco asociado a riesgo vital inminente o deterioro hemodinámico severo. La premisa fundamental en la medicina de urgencia no es el diagnóstico electrocardiográfico exacto inicial, sino la determinación del estado de perfusión tisular y la presencia de inestabilidad hemodinámica.</p>
        </div>

        <div class="narrative-block">
          <h4>Fisiopatología de la Inestabilidad Hemodinámica</h4>
          <p>Tanto las taquiarritmias como las bradiarritmias severas alteran el gasto cardíaco. En las taquiarritmias severas (frecuencias > 150x'), el tiempo de llenado diastólico del ventrículo izquierdo disminuye drásticamente, lo que reduce el volumen sistólico, colapsa el gasto cardíaco y disminuye la perfusión de las arterias coronarias (que ocurre predominantemente en diástole). En las bradiarritmias severas (frecuencias < 40x'), a pesar de un volumen sistólico compensatorio, la frecuencia extremadamente baja es insuficiente para mantener el gasto cardíaco mínimo requerido por los órganos nobles.</p>
        </div>

        <div class="narrative-block">
          <h4>Criterios Clínicos de Inestabilidad (Los 4 Signos Cardinales)</h4>
          <p>Ante cualquier arritmia en urgencias, debe buscarse activamente la presencia de al menos uno de los siguientes 4 criterios de inestabilidad:</p>
          <ul>
            <li><strong>Signos de Choque / Hipotensión:</strong> Presión arterial sistólica < 90 mmHg, presión arterial media (PAM) < 65 mmHg, frialdad distal, llenado capilar lento (>3 segundos) u oliguria.</li>
            <li><strong>Alteración Aguda del Estado Mental:</strong> Somnolencia, confusión, agitación psicomotora o síncope secundario a hipoperfusión cerebral aguda.</li>
            <li><strong>Isquemia Miocárdica Activa:</strong> Dolor torácico opresivo de características anginosas o cambios isquémicos agudos en el ECG.</li>
            <li><strong>Insuficiencia Cardíaca Aguda:</strong> Congestión pulmonar franca (crépitos bibasales difusos, ortopnea, tercer ruido, edema pulmonar agudo en radiografía).</li>
          </ul>
        </div>
      `,
      algoritmo: {
        title: "Algoritmo de Manejo Agudo de Arritmias en Urgencias",
        steps: [
          { label: "PACIENTE CON ARRITMIA EN URGENCIAS", type: "start" },
          { label: "¿PRESENTA SIGNOS DE INESTABILIDAD HEMODINÁMICA?\n(Hipotensión, Choque, Angina, Edema Pulmonar, Síncope)", type: "decision" },
          { label: "SÍ (INESTABLE) → Taquiarritmia: Cardioversión Eléctrica Sincronizada\nBradiarritmia: Atropina 0.5-1mg EV / Marcapaso", type: "urgent" },
          { label: "NO (ESTABLE) → Tomar ECG de 12 derivaciones y evaluar ancho del QRS", type: "action" },
          { label: "QRS Angosto (<0.12s) → Maniobras vagales → Adenosina 6mg EV → Betabloqueador", type: "action" },
          { label: "QRS Ancho (>=0.12s) → Tratar como Taquicardia Ventricular: Amiodarona 150mg EV", type: "action" }
        ]
      },
      tablaFarmacos: [
        { farmaco: "Adenosina", indicacion: "TPSV regular de complejo angosto estable", dosis: "6 mg EV bolo rápido en vena antecubital + 20 ml SF", precauciones: "Contraindicada en asma severo. Causa rubor y pausa asistólica corta." },
        { farmaco: "Amiodarona", indicacion: "TV monomórfica estable / FA descompensada", dosis: "150 mg EV en 10 min, infusión 1 mg/min x 6h", precauciones: "Hipotensión arterial, bradicardia. Monitorizar QT." },
        { farmaco: "Atropina", indicacion: "Bradiarritmia sintomática / BAV nodal", dosis: "0.5 - 1 mg EV bolo (repetir c/3-5 min max 3mg)", precauciones: "Ineficaz en BAV infranodal (Mobitz II / BAV 3° alto)." }
      ],
      sidebarTips: [
        { type: "EUNACOM TIP", text: "En el examen EUNACOM, si un paciente con arritmia tiene hipotensión o edema pulmonar, la respuesta correcta SIEMPRE es cardioversión eléctrica. No intente fármacos primero." },
        { type: "DATO CLAVE", text: "Sincronizar el cardioversor con la onda R es vital para evitar descargar sobre la onda T y precipitar una Fibrilación Ventricular (fenómeno R sobre T)." },
        { type: "MINSAL GES", text: "El protocolo SAMU / Red de Urgencia exige monitor con parches de desfibrilación instalados antes del traslado de todo paciente arritmico inestable." }
      ],
      highYieldPearls: [
        "En taquicardia ventricular sin pulso o fibrilación ventricular se realiza DESFIBRILACIÓN NO SINCRONIZADA inmediata.",
        "La dosis de adenosina debe administrarse mediante técnica de dos llaves (bolo rápido de fármaco seguido inmediatamente de 20 ml de SF y elevación del brazo).",
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
    }
  ],
  bibliografia: [
    { id: 1, text: "Perfil EUNACOM 2026 Versión 3. Ministerio de Salud de Chile / ASOFAMECH." },
    { id: 2, text: "Guía de Práctica Clínica GES N°5: Infarto Agudo del Miocardio con Supradesnivel del Segmento ST. MINSAL Chile, 2018." },
    { id: 3, text: "Guía de Práctica Clínica GES N°25: Trastornos de generación del impulso y conducción en personas mayores de 15 años. MINSAL Chile." },
    { id: 4, text: "Consenso Chileno de Fibrilación Auricular. SOCHICAR / Revista Chilena de Cardiología, 2020-2024." }
  ]
};

function generateHtml(data) {
  let html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${data.title}</title>
  <link rel="stylesheet" href="book_styles.css">
  <style>
    /* PLAIN WHITE PUBLICATION VECTOR DIAGRAM STYLES */
    .plain-white-diagram {
      background: #ffffff;
      border: 1px solid #0f172a;
      border-radius: 2px;
      padding: 16px;
      margin: 18px 0;
    }
    .plain-white-diagram .diagram-title {
      font-family: var(--font-body);
      font-weight: 700;
      font-size: 8.5pt;
      letter-spacing: 0.8px;
      color: #0f172a;
      text-align: center;
      margin-bottom: 16px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 6px;
    }
    .flow-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0;
    }
    .flow-node {
      width: 100%;
      max-width: 480px;
      padding: 10px 16px;
      background: #ffffff;
      border: 1px solid #1e293b;
      border-radius: 2px;
      text-align: center;
      font-size: 8.5pt;
      line-height: 1.4;
      color: #0f172a;
    }
    .flow-node.node-start {
      background: #0f172a;
      color: #ffffff;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    .flow-node.node-decision {
      background: #ffffff;
      border: 1.5px solid #1e3a8a;
      font-weight: 600;
      color: #1e3a8a;
    }
    .flow-node.node-urgent {
      background: #ffffff;
      border: 2px solid #b91c1c;
      font-weight: 700;
      color: #991b1b;
    }
    .flow-node.node-action {
      background: #f8fafc;
      border: 1px solid #475569;
    }
    .flow-connector {
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 18px;
    }
    .flow-connector .line {
      width: 1.5px;
      height: 12px;
      background: #0f172a;
    }
    .flow-connector .arrow-head {
      width: 0;
      height: 0;
      border-left: 4px solid transparent;
      border-right: 4px solid transparent;
      border-top: 6px solid #0f172a;
    }
  </style>
</head>
<body>

  <!-- TOPIC CONTENT -->
`;

  data.topics.forEach(t => {
    html += `
  <div class="topic-page">
    <div class="topic-header">
      <div>
        <div class="topic-number-label">TEMA ${t.number}</div>
        <h3>${t.title}</h3>
      </div>
      <div class="perfil-badge">
        <div class="perfil-code">PERFIL EUNACOM ${t.perfilCode}</div>
        <div class="perfil-name">${t.perfilName}</div>
        <div class="perfil-levels">
          <span><span class="label">Dx:</span> ${t.dx}</span>
          <span><span class="label">Tx:</span> ${t.tx}</span>
          <span><span class="label">Seg:</span> ${t.seg}</span>
        </div>
      </div>
    </div>

    <div class="split-layout">
      <!-- MAIN COLUMN (70%) -->
      <div class="main-content">
        <!-- Aspectos Esenciales -->
        <div class="aspectos-box">
          <div class="aspectos-title">ASPECTOS ESENCIALES (HIGH YIELD)</div>
          <ul>
            ${t.aspectosEsenciales.map(a => `<li>${a}</li>`).join('')}
          </ul>
        </div>

        <!-- Caso Clínico Tipo -->
        <div class="caso-clinico">
          <div class="caso-title">CASO CLÍNICO TIPO EUNACOM</div>
          <div class="caso-text">"${t.casoClinico.vignette}"</div>
          <div class="caso-answer">
            <strong>Piensa en:</strong> ${t.casoClinico.piensaEn}<br>
            <strong>Conducta:</strong> ${t.casoClinico.conducta}
          </div>
        </div>

        <!-- Concepto Narrativo Ampliado (Estilo Libro de Texto) -->
        <div class="narrative-section">
          ${t.conceptoNarrativo}
        </div>

        <!-- Plain White Vector Flowchart -->
        ${renderVectorFlowchart(t.algoritmo)}

        <!-- Tabla de Fármacos -->
        ${t.tablaFarmacos && t.tablaFarmacos.length > 0 ? `
        <table class="data-table">
          <caption>FÁRMACOS CLAVE EN ${t.title.toUpperCase()}</caption>
          <thead>
            <tr><th>Fármaco</th><th>Indicación</th><th>Dosis / Vía</th><th>Precauciones / EUNACOM Tip</th></tr>
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

        <!-- Preguntas de Práctica -->
        <div class="questions-section">
          <div class="questions-header">PREGUNTAS EUNACOM DEL TEMA</div>
          ${t.preguntas.map(q => `
            <div class="question-block">
              <div class="q-number">Pregunta ${q.numero}</div>
              <div class="q-text">${q.pregunta}</div>
              <div class="q-options">
                ${q.opciones.map(o => `
                  <div class="q-option ${o.id === q.respuestaCorrecta ? 'correct' : ''}">
                    <span class="option-letter">${o.id})</span>
                    <span>${o.text}</span>
                  </div>
                `).join('')}
              </div>
              <div class="q-answer">
                <div class="answer-label">Respuesta Correcta: ${q.respuestaCorrecta}</div>
                <div>${q.explicacion}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- SIDEBAR COLUMN (30%) -->
      <div class="sidebar-content">
        ${t.sidebarTips.map(sb => `
          <div class="sidebar-box ${sb.type.toLowerCase().includes('ges') ? 'ges' : sb.type.toLowerCase().includes('tip') ? 'tip' : sb.type.toLowerCase().includes('warning') ? 'warning' : 'dato'}">
            <div class="sidebar-label">${sb.type}</div>
            <div>${sb.text}</div>
          </div>
        `).join('')}

        <div class="pearls-box">
          <div class="pearls-title">PERLAS CLÍNICAS</div>
          <ul>
            ${t.highYieldPearls.map(p => `<li>${p}</li>`).join('')}
          </ul>
        </div>
      </div>
    </div>
  </div>
`;
  });

  html += `
</body>
</html>
`;

  return html;
}

async function run() {
  console.log("Generando HTML V4 Plain White Vector...");
  const htmlContent = generateHtml(chapterData);
  const htmlPath = path.join(__dirname, 'output', 'capitulo1_plain_white.html');
  fs.writeFileSync(htmlPath, htmlContent, 'utf-8');

  console.log("Lanzando Puppeteer para renderizar PDF Plain White...");
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });

  const pdfPath = path.join(__dirname, 'output', 'cardiologia-plain-white-sample.pdf');
  await page.pdf({
    path: pdfPath,
    format: 'Letter',
    printBackground: true,
    margin: {
      top: '0.65in',
      bottom: '0.75in',
      left: '0.5in',
      right: '0.5in'
    }
  });

  await browser.close();
  console.log("¡ÉXITO! PDF Plain White generado en:", pdfPath);
}

run().catch(err => {
  console.error("Error generando PDF Plain White:", err);
});
