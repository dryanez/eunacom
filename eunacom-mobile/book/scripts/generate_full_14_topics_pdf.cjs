const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const outputPdfPath = path.join(__dirname, 'cardiologia-capitulo1-v30-clickable-toc.pdf');

// Read the downloaded live classes
const onlineClasses = JSON.parse(fs.readFileSync(path.join(__dirname, 'cardio_online_classes.json'), 'utf8'));
// Read question bank for additional questions if needed
const bankRaw = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'public', 'data', 'pruebas', 'modulo-1-cardiologia.json'), 'utf8'));
const questionBank = Array.isArray(bankRaw) ? bankRaw : (bankRaw.pruebas || []);

// Read SVG and strip the initial black start dot and connecting arrow
function getSvg(svgFilename) {
  if (!svgFilename) return '';
  const p = path.join(__dirname, 'generate-book', 'svg_diagrams', svgFilename);
  if (fs.existsSync(p)) {
    let svg = fs.readFileSync(p, 'utf8');
    // 1. Remove black start ellipse dot
    svg = svg.replace(/<ellipse[^>]+fill=["']#222222["'][^>]*\/>/gi, '');
    // 2. Remove initial arrow line from y1="35" to y2="55"
    svg = svg.replace(/<line[^>]+y1=["']35["'][^>]+y2=["']55["'][^>]*\/>/gi, '');
    // 3. Remove initial arrow tip polygon pointing to the top box
    svg = svg.replace(/<polygon[^>]+points=["'][^"']*55[^"']*["'][^>]*\/>/gi, (match) => {
      if (match.includes('45') || match.includes('49')) return '';
      return match;
    });
    return svg;
  }
  return '';
}

// Helper to strip any unexpected emojis for formal medical textbook standard
function stripEmojis(str) {
  if (!str) return '';
  return str.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu, '');
}

const diagramMap = {
  1: { svg: 'algo_urgencias.svg', title: 'Algoritmo de Manejo de Urgencias en Arritmias' },
  2: { svg: 'algo_pcr.svg', title: 'Algoritmo de Soporte Vital Avanzado (ACLS)' },
  4: { svg: 'algo_bav.svg', title: 'Algoritmo Diagnóstico y Terapéutico de Bloqueos AV' },
  5: { svg: 'algo_fa.svg', title: 'Estrategia Global AF-CARE de Manejo de Fibrilación Auricular' },
  12: { svg: 'algo_tpsv.svg', title: 'Algoritmo de Manejo de TPSV en Urgencias' },
  13: { svg: 'algo_tv.svg', title: 'Algoritmo de Taquicardia de QRS Ancho' }
};

// Map estimated starting page numbers for each topic for internal book references
const topicPageMap = {
  1: 3,   // Tema 1.1: Manejo de Urgencias (Page 3 after Cover & TOC)
  2: 6,   // Tema 1.2: Paro Cardiorrespiratorio
  3: 9,   // Tema 1.3: RCP
  4: 12,  // Tema 1.4: Bradiarritmias y Bloqueos
  5: 15,  // Tema 1.5: Fibrilación Auricular
  6: 18,  // Tema 1.6: FA Antiarrítmicos
  7: 21,  // Tema 1.7: Anticoagulantes
  8: 25,  // Tema 1.8: FA Manejo
  9: 28,  // Tema 1.9: FA Crónica
  10: 31, // Tema 1.10: FA Reciente Comienzo
  11: 34, // Tema 1.11: Flutter Auricular
  12: 37, // Tema 1.12: TPSV
  13: 40, // Tema 1.13: TV y Canalopatías
  14: 43  // Tema 1.14: Extrasístoles
};

// Convert markdown callouts & wiki links to HTML for the book with formal Table & Figure numbering
function formatArticleMarkdown(text, topicIndex, hasDiagram) {
  if (!text) return '';
  let html = stripEmojis(text);

  // 1. Delete ALL internal Perfil callout blocks from the body text of all classes
  html = html.replace(/:::important\s*\n?[\s\S]*?(?:Perfil|Nivel de conocimiento|Código|Dx:|1\.0\d)[\s\S]*?:::/gi, '');
  html = html.replace(/^[\d\.]+\s*\|\s*[^|\n]+\s*\|\s*Dx:[^\n]+/gim, '');
  html = html.replace(/Perfil EUNACOM[\s\S]*?Seg:\s*\w+/gi, '');

  // Strip any literal '---' or markdown horizontal rules
  html = html.replace(/^[ \t]*---+[ \t]*$/gim, '');

  // 2. PARSE MARKDOWN TABLES WITH FORMAL CAPTIONS (TABLA 1.X.Y)
  let tableCount = 0;
  html = html.replace(/(?:^[ \t]*\|[^\n]+\|[ \t]*\r?\n){2,}/gm, (match) => {
    tableCount++;
    const lines = match.trim().split(/\r?\n/).filter(l => l.includes('|'));
    if (lines.length < 2) return match;

    let headers = [];
    let rows = [];

    lines.forEach((line) => {
      // Skip separator line |---|---| or |:---|:---|
      if (/^[ \t]*\|[\s\-:]+(\|[\s\-:]+)+\|?[ \t]*$/.test(line.trim())) {
        return; // skip separator row
      }

      let cells = line.split('|').map(c => c.trim());
      if (cells[0] === '') cells.shift();
      if (cells[cells.length - 1] === '') cells.pop();

      if (headers.length === 0) {
        headers = cells;
      } else {
        rows.push(cells);
      }
    });

    if (headers.length === 0) return match;

    const tableLabel = `TABLA 1.${topicIndex}.${tableCount}`;
    const tableTitle = headers[0] && headers[1] ? `${headers[0]} vs ${headers[1]}` : 'Clasificación y Criterios';

    // FOR TABLE 1.7.1: BREAK OUT OF 2-COLUMN FLOW, PLACE FULL-WIDTH TABLE, THEN RESUME 2-COLUMN FLOW
    if (topicIndex === 7 || match.includes('Cumarínicos') || match.includes('NACOs')) {
      let fullTbl = `__BREAK_COL_START__<div class="full-width-tbl-block"><div class="tbl-hdr"><span class="tbl-num">${tableLabel}</span>: ${tableTitle}</div><table class="tbl full-width-tbl"><thead><tr>`;
      headers.forEach(h => fullTbl += `<th>${h}</th>`);
      fullTbl += '</tr></thead><tbody>';
      rows.forEach(r => {
        fullTbl += '<tr>';
        r.forEach(c => fullTbl += `<td>${c}</td>`);
        fullTbl += '</tr>';
      });
      fullTbl += '</tbody></table></div>__BREAK_COL_END__';
      return fullTbl;
    }

    // STANDARD TABLES STAY IN 2-COLUMN FLOW WITH FORMAL CAPTION (TABLA 1.X.Y)
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

  // 3. Replace :::important, :::note, :::warning, :::tip callouts
  html = html.replace(/:::important\n?([\s\S]*?):::/g, '<div class="box important-callout"><div class="box-title">EUNACOM CRITERIOS</div><p>$1</p></div>');
  html = html.replace(/:::note\n?([\s\S]*?):::/g, '<div class="box note-callout"><div class="box-title">NOTA CLÍNICA</div><p>$1</p></div>');
  html = html.replace(/:::warning\n?([\s\S]*?):::/g, '<div class="box warning-callout"><div class="box-title">ADVERTENCIA Y PRECAUCIÓN</div><p>$1</p></div>');
  html = html.replace(/:::tip\n?([\s\S]*?):::/g, '<div class="box tip-callout"><div class="box-title">PERLA CLÍNICA EUNACOM</div><p>$1</p></div>');

  // 4. Remove blue styling from wiki links [[Topic Name]] -> plain text "Topic Name"
  html = html.replace(/\[\[([^\]]+)\]\]/g, '<strong>$1</strong>');

  // Strip residual '---' in inline text
  html = html.replace(/---/g, '');

  // Convert ## headings (NEVER PUT CROSS-REFERENCES ON HEADINGS)
  html = html.replace(/^## (.*$)/gim, '<div class="subhead">$1</div>');
  html = html.replace(/^### (.*$)/gim, '<div class="subhead-small">$1</div>');

  // Convert bold **text**
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
  // Convert italics *text*
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Paragraphs & Lists
  const rawParagraphs = html.split(/\n\n+/);
  let figureInserted = !hasDiagram; // If no diagram, consider already done

  html = rawParagraphs.map(p => {
    p = p.trim();
    if (!p) return '';
    if (p.includes('__BREAK_COL_START__')) {
      return p;
    }
    if (p.startsWith('<div') || p.startsWith('<table') || p.startsWith('<ul') || p.startsWith('<li')) {
      return p;
    }

    if (p.includes('- ') || p.includes('1. ')) {
      const items = p.split(/\n/).map(l => l.replace(/^[-*\d\.]+\s+/, '').trim()).filter(Boolean);
      return `<ul class="lst">${items.map(i => `<li>${i}</li>`).join('')}</ul>`;
    }

    let paragraphText = p;

    // Inject (ver Figura 1.X) strictly inside the first normal body paragraph (<p class="txt">)
    if (!figureInserted) {
      figureInserted = true;
      paragraphText += ` (ver Figura 1.${topicIndex})`;
    }

    return `<p class="txt">${paragraphText}</p>`;
  }).join('\n');

  // Handle __BREAK_COL_START__ / __BREAK_COL_END__ markers to split 2-column flow around Table 1.7.1
  if (html.includes('__BREAK_COL_START__')) {
    const parts = html.split('__BREAK_COL_START__');
    const part1 = parts[0];
    const rest = parts[1].split('__BREAK_COL_END__');
    const tableBlock = rest[0];
    const part2 = rest[1];

    return `<div class="two-col-flow">${part1}</div>${tableBlock}<div class="two-col-flow">${part2}</div>`;
  }

  return `<div class="two-col-flow">${html}`;
}

// In-depth clinical explanations for Caso Clínico boxes with Internal Book Cross-References
const casoExplanationsMap = {
  1: `En la evaluación inicial de cualquier arritmia en urgencias, la primera prioridad no es interpretar el trazado electrocardiográfico de 12 derivaciones, sino determinar el estado hemodinámico del paciente (ver Figura 1.1). Los 4 signos cardinales de inestabilidad hemodinámica son: hipotensión/shock, compromiso agudo de conciencia, dolor torácico isquémico e insuficiencia cardíaca aguda (edema pulmonar). Ante la presencia de cualquiera de estos signos en una taquiarritmia (independiente de si es de complejo ancho o estrecho), la conducta inmediata de elección es la Cardioversión Eléctrica Sincronizada inmediata. No se debe diferir la intervención eléctrica para administrar antiarrítmicos o tomar exámenes, ya que la hipoperfusión tisular puede evolucionar rápidamente a paro cardiorrespiratorio (ver Tema 1.2: PCR, pág. ${topicPageMap[2]}).`,
  
  2: `La Fibrilación Ventricular (FV) y la Taquicardia Ventricular sin pulso (TVSP) constituyen los ritmos desfibrilables en el algoritmo de RCP Avanzado (ver Figura 1.2). Cuando la FV persiste tras la primera descarga eléctrica, la conducta prioritaria incluye: continuar compresiones torácicas ininterrumpidas de alta calidad durante 2 minutos (ver Tema 1.3: RCP, pág. ${topicPageMap[3]}), administrar una 2ª descarga eléctrica, e indicar Adrenalina 1 mg EV bolo (repetir cada 3 a 5 minutos). Si la arritmia persiste tras la 3ª descarga, se administra Amiodarona 300 mg EV en bolo (o Lidocaína 1-1.5 mg/kg) como antiarrítmico de primera línea. La clave para la supervivencia radica en minimizar las interrupciones de las compresiones y revertir causas tratables (las 5 H y 5 T).`,
  
  3: `Ante un colapso súbito presenciado en un adulto sin pulso, el primer paso según el protocolo universal de Soporte Vital Básico (BLS) y Avanzado (ACLS) es activar el código de emergencia, solicitar un Desfibrilador Externo Automático (DEA) e iniciar de inmediato compresiones torácicas de alta calidad (frecuencia 100-120 cpm, profundidad 5-6 cm, permitiendo reexpansión torácica completa). Las compresiones torácicas continuas mantienen la presión de perfusión coronaria y cerebral (ver Tema 1.2: PCR, pág. ${topicPageMap[2]}). El desfibrilador debe conectarse lo antes posible para evaluar si se trata de un ritmo desfibrilable (FV/TVSP) y aplicar la descarga sin demoras.`,
  
  4: `El Bloqueo AV de 3er Grado (Completo) se caracteriza por la disociación aurículoventricular total, donde ningún impulso sinusal se conduce a los ventrículos (ver Figura 1.4). El ritmo de escape ventricular resultante es bradicárdico (20-40 lpm) y con complejo QRS ancho. Debido a la incapacidad del nodo AV para responder a estímulos simpáticos, el paciente presenta hipotensión, insuficiencia cardíaca o síncope cardiogénico de esfuerzo (Síndrome de Stokes-Adams). En la urgencia con compromiso sintomático, el manejo de primera línea incluye Atropina 1 mg EV (repetible hasta 3 mg) como medida inicial puente, seguida de Marcapaso Transcutáneo/Transvenoso de inmediato y derivación prioritaria para la instalación de un Marcapaso Definitivo (ver Tema 1.1: Urgencias, pág. ${topicPageMap[1]}).`,
  
  5: `La Fibrilación Auricular (FA) es la arritmia cardíaca sostenida más frecuente en la práctica médica (ver Figura 1.5). Su diagnóstico electrocardiográfico se confirma por la ausencia de ondas P bien definidas, la presencia de ondas de fibrilación 'f' desorganizadas y una respuesta ventricular irregularmente irregular. La causa etiológica subyacente más frecuente es la Hipertensión Arterial, seguida de las valvulopatías mitral y la cardiopatía isquémica. En el paciente hemodinámicamente estable, la estrategia inicial requiere definir el control de frecuencia ventricular (betabloqueadores o calcioantagonistas) y la estratificación del riesgo tromboembólico mediante la escala CHA₂DS₂-VASc para decidir la anticoagulación oral permanente (ver Tema 1.7: Anticoagulantes, pág. ${topicPageMap[7]}).`,
  
  6: `En la Fibrilación Auricular de reciente comienzo (<48 horas) en un paciente hemodinámicamente estable y sin cardiopatía estructural (corazón sano), la cardioversión farmacológica para restaurar el ritmo sinusal se realiza preferentemente con fármacos Antiarrítmicos de Clase Ic como la Flecainida o Propafenona (estrategia 'Pill-in-the-Pocket'). En cambio, si el paciente presenta cardiopatía estructural severa, hipertrofia ventricular izquierda o insuficiencia cardíaca, los fármacos de Clase Ic están contraindicados por su potencial proarrítmico y se debe emplear Amiodarona (ver Tema 1.5: FA, pág. ${topicPageMap[5]}).`,
  
  7: `La prevención de accidentes cerebrovasculares isquémicos es el pilar central del manejo a largo plazo en Fibrilación Auricular. En pacientes masculinos con CHA₂DS₂-VASc ≥ 2 (o femeninos ≥ 3), la anticoagulación oral permanente está fuertemente indicada (ver Tabla 1.7.1). En la práctica clínica actual y guías internacionales, los Anticoagulantes Orales Directos (DOACs: Apixabán, Rivaroxabán, Dabigatrán) son de primera elección sobre los antagonistas de la vitamina K (Warfarina/Acenocumarol) debido a su menor riesgo de hemorragia intracraneal y la ausencia de necesidad de monitorización continua de INR (ver Tema 1.8: FA Manejo, pág. ${topicPageMap[8]}).`,
  
  8: `El manejo integral de la Fibrilación Auricular sigue el esquema internacional AF-CARE. Implica: 1) Tratar Comorbilidades e Hipertensión; 2) Prevenir Evacuación/Tromboembolismo mediante Anticoagulación según CHA₂DS₂-VASc (ver Tema 1.7: Anticoagulantes, pág. ${topicPageMap[7]}); 3) Control de Síntomas mediante Control de Frecuencia o Control de Ritmo (ver Tema 1.6: Antiarrítmicos, pág. ${topicPageMap[6]}). Si el paciente está hemodinámicamente inestable en cualquier momento, la Cardioversión Eléctrica Sincronizada es mandatoria de urgencia.`,
  
  9: `En la Fibrilación Auricular Crónica/Permanente (donde el paciente y el médico aceptan la arritmia y no se buscarán más intentos de restauración del ritmo sinusal), la estrategia terapéutica se centra en dos objetivos: 1) Control estricto de frecuencia ventricular (meta inicial FC < 110 lpm en reposo mediante Betabloqueadores o Verapamilo/Diltiazem); y 2) Anticoagulación oral continua si el riesgo tromboembólico CHA₂DS₂-VASc lo indica (ver Tema 1.7: Anticoagulantes, pág. ${topicPageMap[7]}). En FA crónica no se intenta cardioversión sin anticoagulación previa prolongada (mínimo 3 semanas).`,
  
  10: `En la Fibrilación Auricular de reciente comienzo (<48 horas de evolución) en un paciente hemodinámicamente estable, el riesgo de tromboembolismo poscardioversión es bajo, por lo que se puede intentar la Cardioversión (farmacológica o eléctrica) de forma inmediata (ver Tema 1.6: Antiarrítmicos, pág. ${topicPageMap[6]}). Se debe iniciar anticoagulación de acción rápida antes o inmediatamente después del procedimiento. Si la duración de la FA es >48 horas o desconocida, NO se debe cardiovertir de inmediato sin antes realizar anticoagulación efectiva durante al menos 3 semanas consecutivas.`,
  
  11: `El Flutter Auricular Típico se origina por una macrorreentrada alrededor del anillo tricuspídeo en la aurícula derecha (istmo cavotricuspídeo). Electrocardiográficamente se reconoce por la presencia de ondas 'F' en serrucho bien definidas, típicamente negativas en DII, DIII y aVF, con un ritmo ventricular regular a 150 lpm (conducción AV 2:1 clásica). El manejo de urgencia en estabilidad se basa en control de frecuencia o cardioversión. El tratamiento definitivo de elección con tasa de curación >95% es la Ablación por Catéter de Radiofrecuencia. El riesgo tromboembólico y las indicaciones de anticoagulación son idénticos a los de la FA (ver Tema 1.7: Anticoagulantes, pág. ${topicPageMap[7]}).`,
  
  12: `La Taquicardia Paroxística Supraventricular (TPSV) se produce más frecuentemente por Reentrada Nodal (TRNAV) o Reentrada Auriculoventricular por vía accesoria (TRAV). Se presenta característicamente en adultos jóvenes como episodios de taquicardia paroxística regular de complejo QRS angosto (<0.12s) a 150-220 lpm (ver Figura 1.12). En el paciente hemodinámicamente estable, el algoritmo escalonado de urgencia es: 1) Maniobras Vagales; 2) Adenosina 6 mg EV en bolo rápido; 3) Verapamilo 5 mg EV o Betabloqueadores. Si estuviera inestable, la conducta es Cardioversión Eléctrica Sincronizada (ver Tema 1.1: Urgencias, pág. ${topicPageMap[1]}).`,
  
  13: `Ante cualquier Taquicardia de Complejo QRS Ancho (>0.12s) en urgencias, la regla de oro para el EUNACOM es asumir que es una Taquicardia Ventricular (TV) hasta demostrar lo contrario (ver Figura 1.13), especialmente si hay antecedente de infarto previo. En el paciente hemodinámicamente estable, el tratamiento farmacológico de elección es Amiodarona 150 mg EV infundidos en 10 minutos o Procainamida. Nunca deben administrarse calcioantagonistas en taquicardias de QRS ancho. Si el paciente está inestable, se realiza Cardioversión Eléctrica Sincronizada inmediata (ver Tema 1.1: Urgencias, pág. ${topicPageMap[1]}).`,
  
  14: `Las Extrasístoles Ventriculares (EV) son latidos prematuros originados en el miocardio ventricular que se caracterizan por complejos QRS anchos y de morfología aberrante no precedidos de onda P. En pacientes sin cardiopatía estructural de base y con ecocardiograma normal, las extrasístoles suelen ser benignas y no requieren tratamiento farmacológico específico salvo tranquilidad al paciente y evitar desencadenantes. Si los síntomas son muy molestos o la carga de EV es elevada (>10%), los Betabloqueadores son la primera línea de tratamiento (ver Tema 1.13: Taquicardia Ventricular, pág. ${topicPageMap[13]}).`
};

// Map the first 14 online classes
const arritmiaClasses = onlineClasses.slice(0, 14);

let globalQuestionNum = 1;

const topicsData = arritmiaClasses.map((item, idx) => {
  const num = idx + 1;
  const keyPoints = typeof item.key_points === 'string' ? JSON.parse(item.key_points) : (item.key_points || []);
  const rawQuiz = typeof item.quiz === 'string' ? JSON.parse(item.quiz) : (item.quiz || []);
  const diagram = diagramMap[num] || null;
  
  // Format Article Content with Clean SVG diagrams
  const rawArticle = item.article_content || item.clean_transcript || item.summary || '';
  const formattedArticle = formatArticleMarkdown(rawArticle, num, !!diagram);

  // Extract 3 questions per topic
  const questionsForTopic = [];
  const qSourceList = [...rawQuiz];
  
  // Fallback to question bank if class has fewer than 3 questions
  if (qSourceList.length < 3) {
    const topicFirstWord = item.topic.toLowerCase().split(' ')[0];
    const bankMatches = questionBank.filter(q => 
      (q.tags && q.tags.some(t => t.toLowerCase().includes(topicFirstWord))) ||
      (q.pregunta && q.pregunta.toLowerCase().includes(topicFirstWord))
    );
    for (const bq of bankMatches) {
      if (qSourceList.length >= 3) break;
      qSourceList.push(bq);
    }
  }

  // Build 3 question objects with CLEANED OPTION LETTERS (Deduplicated A) B) C))
  for (let qIdx = 0; qIdx < Math.min(3, Math.max(1, qSourceList.length)); qIdx++) {
    const qObj = qSourceList[qIdx] || qSourceList[0] || {};
    const qNum = globalQuestionNum++;
    const qText = stripEmojis(qObj.questionText || qObj.pregunta || item.topic);
    const optionsRaw = qObj.options || qObj.opciones || [];
    
    const options = optionsRaw.map((o, oIdx) => {
      const rawText = stripEmojis(o.text || o.texto || o);
      // Clean leading A), B), C), A., B., C. to prevent duplicate A) A) rendering
      const cleanText = rawText.replace(/^[A-E][\)\.]\s*/i, '');
      return {
        id: o.id || String.fromCharCode(65 + oIdx),
        texto: cleanText
      };
    });

    const correctOptObj = optionsRaw.find(o => o.isCorrect || o.correcta);
    const correctOpt = correctOptObj?.id || 'A';
    let explicacionCorrecta = stripEmojis(correctOptObj?.explanation || qObj.explicacion || 'Fundamento basado en el protocolo clínico oficial EUNACOM.');
    
    // Strip "Correcto. " or "Correcto: " prefix from explanations
    explicacionCorrecta = explicacionCorrecta.replace(/^Correcto[:\.]?\s*/i, '');

    const explicacionIncorrectas = optionsRaw.filter(o => !o.isCorrect).map(o => `${o.id}: ${stripEmojis(o.explanation || 'Opción no indicada en primera línea.')}`).join(' ');

    questionsForTopic.push({
      qSeqNum: qNum,
      enunciado: qText,
      opciones: options.length ? options : [
        { id: 'A', texto: 'Opción A de manejo agudo' },
        { id: 'B', texto: 'Opción B de tratamiento' },
        { id: 'C', texto: 'Opción C de observación' },
        { id: 'D', texto: 'Opción D de conducta prioritaria' },
        { id: 'E', texto: 'Opción E de derivación' }
      ],
      correcta: correctOpt,
      explicacionCorrecta: explicacionCorrecta,
      explicacionIncorrectas: explicacionIncorrectas
    });
  }

  // Use rich clinical explanation for Caso Clinico box
  const mainQ = questionsForTopic[0];
  const richCasoExplanation = casoExplanationsMap[num] || mainQ.explicacionCorrecta;

  return {
    number: `1.${num}`,
    title: item.topic,
    perfilCode: item.eunacom_code || `1.01.${num < 10 ? '1' : '2'}.0${num < 10 ? '0' + num : num}`,
    dx: "Específico", tx: "Inicial", seg: "Derivar",
    articleHtml: formattedArticle,
    summaryText: stripEmojis(item.summary || ''),
    keyPoints: keyPoints.map(stripEmojis),
    vignette: mainQ.enunciado,
    casoConcepto: richCasoExplanation,
    preguntas: questionsForTopic,
    svg: diagram ? diagram.svg : null,
    algoTitle: diagram ? diagram.title : '',
    startPage: topicPageMap[num] || (num + 1)
  };
});

function generateHtml() {
  let pagesHtml = `
  <!-- COVER PAGE -->
  <div class="page cover">
    <h1>EUNACOM CARDIOLOGÍA</h1>
    <h2>Capítulo 1: Arritmias y Emergencias Cardiovasculares</h2>
    <div class="badge">Manual de Estudio EUNACOM &bull; Chile 2026</div>
  </div>

  <!-- CLICKABLE INDEX / TABLE OF CONTENTS PAGE -->
  <div class="page toc-page-container">
    <div class="toc-hdr">
      <h2>ÍNDICE GENERAL Y CONTENIDO DEL CAPÍTULO 1</h2>
      <p class="toc-sub">Capítulo 1: Arritmias y Emergencias Cardiovasculares &bull; Perfil EUNACOM Chile 2026</p>
    </div>

    <div class="toc-grid">
  `;

  topicsData.forEach(t => {
    pagesHtml += `
      <a href="#tema-${t.number}" class="toc-item-link">
        <div class="toc-item">
          <div class="toc-num-box">
            <span class="toc-t-num">TEMA ${t.number}</span>
            <span class="toc-p-code">${t.perfilCode}</span>
          </div>
          <div class="toc-t-title">${t.title}</div>
          <div class="toc-dots"></div>
          <div class="toc-page-num">Pág. ${t.startPage}</div>
        </div>
      </a>
    `;
  });

  pagesHtml += `
      <a href="#solucionario" class="toc-item-link">
        <div class="toc-item toc-sol-item">
          <div class="toc-num-box">
            <span class="toc-t-num">SOLUCIONARIO</span>
            <span class="toc-p-code">CLAVE OFICIAL</span>
          </div>
          <div class="toc-t-title">Solucionario y Clave de Respuestas Detalladas (${globalQuestionNum - 1} Preguntas)</div>
          <div class="toc-dots"></div>
          <div class="toc-page-num">Pág. 46</div>
        </div>
      </a>
    </div>
  </div>
  `;

  topicsData.forEach(t => {
    pagesHtml += `
    <div class="page topic-section" id="tema-${t.number}">
      <!-- TOPIC HEADER (FULL WIDTH) -->
      <div class="topic-hdr">
        <div>
          <div class="num">TEMA ${t.number}</div>
          <h2>${t.title}</h2>
        </div>
        <div class="perfil-tag">
          <strong>PERFIL EUNACOM ${t.perfilCode}</strong><br>
          Dx: ${t.dx} &bull; Tx: ${t.tx} &bull; Seg: ${t.seg}
        </div>
      </div>

      <!-- FORMATTED ARTICLE CONTENT (TWO-COLUMN FLOW WITH CLEAN BREAK AROUND TABLE 1.7.1) -->
      ${t.articleHtml}

        <!-- REDESIGNED CASO CLÍNICO TIPO WITH RICH CLINICAL EXPLANATION AND BOOK CROSS-REFERENCES -->
        <div class="box vignette-redesigned">
          <div class="vignette-hdr">CASO CLÍNICO TIPO EUNACOM</div>
          <div class="vignette-body">
            <div class="vignette-sec">
              <span class="sec-label">ESCENARIO CLÍNICO TÍPICO:</span>
              <p class="sec-text">"${t.vignette}"</p>
            </div>
            <div class="vignette-sec concept-sec">
              <span class="sec-label">EXPLICACIÓN:</span>
              <p class="sec-text">${t.casoConcepto}</p>
            </div>
          </div>
        </div>

        <!-- PUNTOS CLAVE DESTACADOS INLINE WITHIN TWO-COLUMN FLOW -->
        <div class="box high-yield">
          <div class="box-title">Puntos Clave Destacados</div>
          <ul class="lst">
            ${(t.keyPoints || []).map(p => `<li>${p}</li>`).join('')}
          </ul>
        </div>
      </div>

      <!-- FULL-WIDTH CENTERED PLANTUML SVG ALGORITHM (NUMBERED AS FIGURA 1.X, CLEANED NO START DOT) -->
      ${t.svg ? `
      <div class="diagram-box">
        <div class="d-title">FIGURA ${t.number}: ${t.algoTitle.toUpperCase()}</div>
        <div class="svg-centered">
          ${getSvg(t.svg)}
        </div>
      </div>
      ` : ''}

      <!-- 3 FULL 100% PAGE WIDTH PRACTICE QUESTIONS AT THE END OF THE TOPIC -->
      <div class="topic-questions-container">
        <div class="t-q-title">EVALUACIÓN DE CLASE Y PREGUNTAS TIPO EUNACOM (${t.title})</div>
        ${t.preguntas.map(q => `
          <div class="q-full-width" id="q-${q.qSeqNum}">
            <div class="q-hdr-link">
              <span class="q-hdr">PREGUNTA ${q.qSeqNum}</span>
              <a href="#ans-${q.qSeqNum}" class="link-ans">[ Ver Explicación en Solucionario ]</a>
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

      <!-- REDESIGNED STYLED RESUMEN EJECUTIVO BOX (MATCHES CASO CLÍNICO BOX AESTHETIC) -->
      <div class="box summary-redesigned">
        <div class="summary-hdr">RESUMEN EJECUTIVO: ${t.title.toUpperCase()}</div>
        <div class="summary-body">
          <p>${t.summaryText}</p>
        </div>
      </div>
    </div>
    `;
  });

  // ANSWER KEY SECTION AT THE END OF THE CHAPTER
  pagesHtml += `
  <div class="page answer-key-page" id="solucionario">
    <div class="toc-page">
      <h2>SOLUCIONARIO Y CLAVE DE RESPUESTAS DETALLADAS</h2>
      <p style="font-size: 8.5pt; color: #475569; margin-bottom: 12px;">Solucionario oficial de las ${globalQuestionNum - 1} preguntas del Capítulo 1 (Arritmias). Incluye fundamento clínico y análisis de opciones.</p>
    </div>
    <div class="answer-key-list">
  `;

  topicsData.forEach(t => {
    t.preguntas.forEach(q => {
      pagesHtml += `
        <div class="ans-key-card" id="ans-${q.qSeqNum}">
          <div class="ans-key-hdr">
            <span>RESPUESTA PREGUNTA ${q.qSeqNum} (Tema ${t.number}: ${t.title})</span>
            <a href="#q-${q.qSeqNum}" class="link-back">[ Volver a Pregunta ${q.qSeqNum} ]</a>
          </div>
          <div class="ans-correct-badge">Respuesta Correcta: Alternativa ${q.correcta}</div>
          <div class="ans-section">
            <strong>Fundamento Clínico:</strong>
            <p>${q.explicacionCorrecta}</p>
          </div>
          <div class="ans-section incorrects">
            <strong>Análisis de Opciones:</strong>
            <p>${q.explicacionIncorrectas}</p>
          </div>
        </div>
      `;
    });
  });

  pagesHtml += `
    </div>
  </div>
  `;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Merriweather:wght@400;700&display=swap');
    
    @page {
      size: letter;
      margin: 0.42in 0.35in 0.38in 0.35in;
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: 'Inter', sans-serif;
      font-size: 8.5pt;
      line-height: 1.35;
      color: #0f172a;
      background: #ffffff;
      -webkit-print-color-adjust: exact;
    }
    
    .page {
      width: 100%;
      page-break-after: always;
      position: relative;
    }

    .topic-section {
      page-break-after: always;
    }
    
    /* COVER */
    .cover {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 9.8in;
      background: #0f172a;
      color: white;
      text-align: center;
      padding: 2in 1in;
    }
    .cover h1 { font-family: 'Merriweather', serif; font-size: 28pt; margin-bottom: 12px; }
    .cover h2 { font-size: 14pt; font-weight: 400; color: #38bdf8; margin-bottom: 30px; }
    .cover .badge { background: #1e293b; border: 1px solid #334155; padding: 8px 24px; font-size: 11pt; border-radius: 4px; }
    
    /* CLICKABLE INDEX / TOC PAGE STYLING */
    .toc-page-container {
      padding: 0.3in 0.1in;
    }
    .toc-hdr {
      border-bottom: 2px solid #1e3a8a;
      padding-bottom: 6px;
      margin-bottom: 16px;
    }
    .toc-hdr h2 {
      font-family: 'Merriweather', serif;
      font-size: 15pt;
      color: #1e3a8a;
    }
    .toc-sub {
      font-size: 8.5pt;
      color: #475569;
      margin-top: 3px;
    }
    .toc-grid {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .toc-item-link {
      text-decoration: none;
      color: inherit;
    }
    .toc-item {
      display: flex;
      align-items: center;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-left: 4px solid #2563eb;
      border-radius: 3px;
      padding: 6px 10px;
      transition: background 0.2s;
    }
    .toc-sol-item {
      border-left-color: #059669;
      background: #f0fdf4;
    }
    .toc-num-box {
      width: 1.2in;
      display: flex;
      flex-direction: column;
    }
    .toc-t-num {
      font-weight: 700;
      font-size: 8pt;
      color: #2563eb;
      text-transform: uppercase;
    }
    .toc-sol-item .toc-t-num { color: #059669; }
    .toc-p-code {
      font-size: 6.5pt;
      color: #64748b;
    }
    .toc-t-title {
      font-size: 8.5pt;
      font-weight: 600;
      color: #0f172a;
      flex-shrink: 0;
    }
    .toc-dots {
      flex: 1;
      border-bottom: 1px dashed #cbd5e1;
      margin: 0 10px;
    }
    .toc-page-num {
      font-weight: 700;
      font-size: 8pt;
      color: #1e3a8a;
      width: 0.6in;
      text-align: right;
    }

    /* TOPIC HEADER */
    .topic-hdr {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #1e3a8a;
      padding-bottom: 4px;
      margin-bottom: 8px;
    }
    .topic-hdr h2 { font-family: 'Merriweather', serif; font-size: 13.5pt; color: #1e3a8a; }
    .topic-hdr .num { font-size: 8pt; font-weight: 700; color: #2563eb; text-transform: uppercase; }
    
    .perfil-tag {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-left: 4px solid #1e3a8a;
      padding: 3px 6px;
      font-size: 7.5pt;
    }
    
    /* TWO-COLUMN (50%/50%) FLOW */
    .two-col-flow {
      column-count: 2;
      column-gap: 0.2in;
      width: 100%;
    }
    
    /* CALLOUT BOXES BASE STYLING */
    .box {
      border: 1px solid #cbd5e1;
      border-radius: 2px;
      padding: 5px 7px;
      margin-top: 5px;
      margin-bottom: 5px;
      font-size: 8pt;
      width: 100%;
      break-inside: avoid;
    }
    .box-title {
      font-weight: 700;
      font-size: 7.5pt;
      text-transform: uppercase;
      margin-bottom: 2px;
      letter-spacing: 0.5px;
    }
    .box.high-yield { background: #f8fafc; border-left: 3.5px solid #1e3a8a; }
    .box.high-yield .box-title { color: #1e3a8a; }
    
    /* REDESIGNED CASO CLÍNICO TIPO WITH RICH EXPLICACIÓN LABEL */
    .box.vignette-redesigned {
      background: #fffdf5;
      border: 1.5px solid #f59e0b;
      border-radius: 3px;
      padding: 0;
      margin-top: 6px;
      margin-bottom: 6px;
      overflow: hidden;
      break-inside: avoid;
    }
    .vignette-hdr {
      background: #d97706;
      color: #ffffff;
      font-weight: 700;
      font-size: 8pt;
      padding: 3.5px 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .vignette-body {
      padding: 6px 8px;
    }
    .vignette-sec {
      margin-bottom: 4px;
    }
    .vignette-sec.concept-sec {
      border-top: 1px dashed #fcd34d;
      padding-top: 4px;
      margin-bottom: 0;
    }
    .sec-label {
      font-weight: 700;
      font-size: 7.5pt;
      color: #92400e;
      display: block;
      margin-bottom: 2px;
    }
    .sec-text {
      font-size: 8pt;
      line-height: 1.35;
      color: #1e293b;
    }
    
    /* REDESIGNED STYLED RESUMEN EJECUTIVO BOX (MATCHES CASO CLÍNICO BOX AESTHETIC) */
    .box.summary-redesigned {
      background: #f0f9ff;
      border: 1.5px solid #0284c7;
      border-radius: 3px;
      padding: 0;
      margin-top: 8px;
      overflow: hidden;
      break-inside: avoid;
    }
    .summary-hdr {
      background: #0284c7;
      color: #ffffff;
      font-weight: 700;
      font-size: 8pt;
      padding: 3.5px 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .summary-body {
      padding: 6px 8px;
      font-size: 8pt;
      line-height: 1.35;
      color: #0369a1;
    }
    
    .box.important-callout { background: #fef2f2; border-color: #fca5a5; border-left: 3.5px solid #ef4444; }
    .box.important-callout .box-title { color: #991b1b; font-weight: 700; font-size: 7.5pt; text-transform: uppercase; margin-bottom: 2px; letter-spacing: 0.5px; }

    .box.warning-callout { background: #fff7ed; border-color: #ffedd5; border-left: 3.5px solid #f97316; }
    .box.warning-callout .box-title { color: #c2410c; font-weight: 700; font-size: 7.5pt; text-transform: uppercase; margin-bottom: 2px; letter-spacing: 0.5px; }

    .box.note-callout { background: #f8fafc; border-color: #e2e8f0; border-left: 3.5px solid #64748b; }
    .box.note-callout .box-title { color: #334155; font-weight: 700; font-size: 7.5pt; text-transform: uppercase; margin-bottom: 2px; letter-spacing: 0.5px; }

    /* PERLA CLÍNICA EUNACOM - MATCHED TYPOGRAPHY (FONT SIZE, WEIGHT, SPACING) TO ADVERTENCIA Y PRECAUCIÓN WITH HIGH-CONTRAST CRIMSON RED ACCENT */
    .box.tip-callout {
      background: #fff5f5;
      border: 1.5px solid #fca5a5;
      border-left: 3.5px solid #dc2626;
    }
    .box.tip-callout .box-title {
      color: #991b1b;
      font-weight: 700;
      font-size: 7.5pt;
      text-transform: uppercase;
      margin-bottom: 2px;
      letter-spacing: 0.5px;
    }
    .box.tip-callout p {
      color: #7f1d1d;
      font-size: 8pt;
      line-height: 1.35;
    }

    .subhead {
      font-family: 'Merriweather', serif;
      font-size: 9.5pt;
      font-weight: 700;
      color: #1e3a8a;
      margin: 8px 0 4px 0;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 1px;
      break-after: avoid;
    }

    .subhead-small {
      font-family: 'Inter', sans-serif;
      font-size: 8.5pt;
      font-weight: 700;
      color: #0f172a;
      margin: 6px 0 3px 0;
      break-after: avoid;
    }
    
    p.txt { font-size: 8pt; line-height: 1.35; margin-bottom: 4px; text-align: justify; }
    ul.lst { padding-left: 12px; margin-bottom: 4px; }
    ul.lst li { font-size: 8pt; margin-bottom: 2px; }

    /* EXACT V21 CLEAN TABLES STYLING (DEFAULT 50%/50% FLOW) */
    .tbl-container {
      width: 100%;
      margin: 6px 0;
      break-inside: avoid;
    }
    .tbl-hdr {
      font-weight: 700;
      font-size: 7.5pt;
      color: #1e3a8a;
      background: #f1f5f9;
      padding: 3px 6px;
      border: 1px solid #cbd5e1;
      border-bottom: none;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .tbl-hdr .tbl-num {
      color: #2563eb;
    }
    table.tbl {
      width: 100%;
      border-collapse: collapse;
      font-size: 7.5pt;
      border: 1px solid #cbd5e1;
      border-top: 1.5px solid #1e3a8a;
      border-bottom: 1.5px solid #1e3a8a;
    }
    table.tbl th { background: #f1f5f9; color: #1e3a8a; padding: 4px 5px; text-align: left; font-size: 7pt; text-transform: uppercase; font-weight: 700; border-bottom: 1px solid #cbd5e1; }
    table.tbl td { padding: 4px 5px; border-bottom: 1px solid #e2e8f0; vertical-align: top; line-height: 1.3; }
    table.tbl tr:nth-child(even) td { background: #f8fafc; }

    /* FULL-WIDTH STANDALONE BLOCK FOR TABLE 1.7.1 ONLY */
    .full-width-tbl-block {
      width: 100%;
      margin: 8px 0;
      break-inside: avoid;
    }

    /* DIAGRAM CONTAINER WITH FORMAL FIGURE CAPTION (FIGURA 1.X) */
    .diagram-box {
      width: 100%;
      border: 1px solid #1e3a8a;
      border-radius: 2px;
      padding: 5px;
      margin-top: 6px;
      margin-bottom: 6px;
      background: #ffffff;
      text-align: center;
      break-inside: avoid;
    }
    .diagram-box .d-title {
      font-weight: 700;
      font-size: 7.5pt;
      text-transform: uppercase;
      color: #1e3a8a;
      text-align: center;
      margin-bottom: 3px;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 1px;
    }
    .svg-centered {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      text-align: center;
    }
    .svg-centered svg {
      max-width: 100%;
      height: auto;
      margin: 0 auto;
      display: block;
    }

    /* TOPIC QUESTIONS CONTAINER (3 QUESTIONS PER TOPIC) */
    .topic-questions-container {
      width: 100%;
      margin-top: 8px;
      break-inside: avoid;
    }
    .t-q-title {
      font-weight: 700;
      font-size: 8pt;
      color: #1e3a8a;
      text-transform: uppercase;
      border-bottom: 1.5px solid #1e3a8a;
      padding-bottom: 2px;
      margin-bottom: 4px;
    }
    
    .q-full-width {
      width: 100%;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-left: 3.5px solid #2563eb;
      border-radius: 2px;
      padding: 5px 8px;
      margin-bottom: 5px;
      break-inside: avoid;
    }
    .q-hdr-link {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 3px;
    }
    .q-full-width .q-hdr {
      font-weight: 700;
      font-size: 8pt;
      color: #2563eb;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .link-ans {
      font-size: 7.5pt;
      color: #0284c7;
      text-decoration: none;
      font-weight: 600;
    }
    .link-ans:hover { text-decoration: underline; }
    
    .q-full-width .q-stem {
      font-size: 8pt;
      line-height: 1.35;
      margin-bottom: 4px;
    }
    .q-options-grid {
      display: flex;
      flex-direction: column;
      gap: 2px;
      margin-bottom: 2px;
    }
    .q-opt-item {
      font-size: 7.5pt;
      padding: 2px 4px;
      border-radius: 2px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
    }

    /* ANSWER KEY SECTION AT THE END */
    .answer-key-page {
      padding-top: 0.2in;
    }
    .answer-key-page h2 {
      font-family: 'Merriweather', serif;
      font-size: 14pt;
      color: #1e3a8a;
      border-bottom: 2px solid #1e3a8a;
      padding-bottom: 4px;
      margin-bottom: 8px;
    }
    .ans-key-card {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 3px;
      padding: 8px 10px;
      margin-bottom: 10px;
      page-break-inside: avoid;
    }
    .ans-key-hdr {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 700;
      font-size: 8.5pt;
      color: #1e3a8a;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 3px;
      margin-bottom: 4px;
    }
    .link-back {
      font-size: 7.5pt;
      color: #2563eb;
      text-decoration: none;
    }
    .ans-correct-badge {
      display: inline-block;
      background: #f0fdf4;
      color: #15803d;
      border: 1px solid #bbf7d0;
      font-weight: 700;
      font-size: 8pt;
      padding: 2px 6px;
      border-radius: 2px;
      margin-bottom: 4px;
    }
    .ans-section {
      font-size: 8pt;
      line-height: 1.35;
      margin-bottom: 4px;
    }
    .ans-section.incorrects {
      background: #f8fafc;
      border-left: 3.5px solid #64748b;
      padding: 4px 6px;
      margin-top: 4px;
    }
  </style>
</head>
<body>
  ${pagesHtml}
</body>
</html>`;
}

async function main() {
  console.log("Generando PDF V30 (Índice General 100% Clicable y Cabecera 'PÁGINA X' Limpia)...");
  const htmlContent = generateHtml();

  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

  await page.pdf({
    path: outputPdfPath,
    format: 'Letter',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: `
      <div style="font-size: 7.5pt; font-family: 'Inter', sans-serif; color: #64748b; width: 100%; display: flex; justify-content: space-between; align-items: center; margin: 0 0.35in; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">
        <span>CARDIOLOGÍA &bull; ARRITMIAS Y EMERGENCIAS</span>
        <span>PÁGINA <span class="pageNumber"></span></span>
      </div>
    `,
    footerTemplate: `<div></div>`,
    margin: {
      top: '0.42in',
      bottom: '0.38in',
      left: '0.35in',
      right: '0.35in'
    }
  });

  await browser.close();
  console.log("¡ÉXITO! PDF V30 generado en:", outputPdfPath);
}

main().catch(console.error);
