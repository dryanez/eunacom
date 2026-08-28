/**
 * ═══════════════════════════════════════════════════════════════════════
 *  MANUAL EUNACOM 2026 — CARDIOLOGÍA & SISTEMA CARDIOVASCULAR
 *  Generador Oficial del Libro · Fuente: BLOQUES_CLINICOS_MASTER_CATALOG.json
 *  23 Clases · 5 Bloques Clínicos · Perfil V3 ASOFAMECh
 * ═══════════════════════════════════════════════════════════════════════
 */
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

// ─── OUTPUT PATHS ──────────────────────────────────────────────────────
const outputPdfPath = path.join(__dirname, '..', 'libro_eunacom_v3', 'Modulo_1_Medicina_Interna', 'Capitulo_01_Cardiologia_Completo.pdf');
const publicPdfPath = path.join(__dirname, '..', '..', 'public', 'cardio_showcase', 'Cardiologia_Completo.pdf');

// ─── READ CANONICAL MASTER CURRICULUM ──────────────────────────────────
const catalogPath = path.join(__dirname, '..', '..', '..', 'eunacom-master-curriculum', 'BLOQUES_CLINICOS_MASTER_CATALOG.json');
const masterCatalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

// Extract Cardiología specialty from Module 1 (Medicina Interna)
const moduloMedInterna = masterCatalog[0]; // 🫀 MÓDULO 1: MEDICINA INTERNA
const cardioSpecialty = moduloMedInterna.specialties[0]; // 1. CARDIOLOGÍA & SISTEMA CARDIOVASCULAR

// ─── SVG DIAGRAM LOADER ────────────────────────────────────────────────
function getSvg(svgFilename) {
  if (!svgFilename) return '';
  const p = path.join(__dirname, '..', 'generate-book', 'svg_diagrams', svgFilename);
  if (fs.existsSync(p)) {
    let svg = fs.readFileSync(p, 'utf8');
    // Clean up cosmetic artifacts from PlantUML
    svg = svg.replace(/<ellipse[^>]+fill=["']#222222["'][^>]*\/>/gi, '');
    svg = svg.replace(/<line[^>]+y1=["']35["'][^>]+y2=["']55["'][^>]*\/>/gi, '');
    svg = svg.replace(/<polygon[^>]+points=["'][^"']*55[^"']*["'][^>]*\/>/gi, (match) => {
      if (match.includes('45') || match.includes('49')) return '';
      return match;
    });
    return svg;
  }
  return '';
}

// ─── DIAGRAM MAP: cardio-XX → SVG filename ─────────────────────────────
const diagramMap = {
  'cardio-01': { svg: 'algo_urgencias.svg', title: 'Algoritmo de Lectura Sistemática del ECG en Urgencias' },
  'cardio-02': { svg: 'algo_pcr.svg', title: 'Algoritmo de Soporte Vital Avanzado (ACLS)' },
  'cardio-03': { svg: 'algo_fa.svg', title: 'Estrategia Global AF-CARE de Fibrilación Auricular' },
  'cardio-04': { svg: 'algo_tpsv.svg', title: 'Algoritmo de Manejo de TPSV en Urgencias' },
  'cardio-05': { svg: 'algo_bav.svg', title: 'Algoritmo Diagnóstico de Bloqueos AV' },
  'cardio-06': { svg: 'algo_angina_estable.svg', title: 'Algoritmo de Angina Crónica Estable' },
  'cardio-07': { svg: 'algo_dolor_toracico.svg', title: 'Algoritmo de Dolor Torácico en Urgencias' },
  'cardio-08': { svg: 'algo_scacest_120min.svg', title: 'Algoritmo Maestro de Reperfusión: Regla de los 120 Minutos' },
  'cardio-10': { svg: 'algo_ic_dx.svg', title: 'Algoritmo Diagnóstico de Insuficiencia Cardíaca' },
  'cardio-11': { svg: 'algo_ic_tratamiento.svg', title: 'Cuádruple Terapia GDMT en IC-FEr' },
  'cardio-13': { svg: 'algo_shock.svg', title: 'Clasificación y Manejo del Shock' },
  'cardio-15': { svg: 'algo_estenosis_aortica.svg', title: 'Evaluación de Estenosis Aórtica Severa' },
  'cardio-19': { svg: null, title: '' }, // HTA - no specific SVG yet
  'cardio-21': { svg: 'algo_pericarditis.svg', title: 'Algoritmo de Pericarditis Aguda y Taponamiento' },
  'cardio-22': { svg: 'algo_diseccion_aortica.svg', title: 'Clasificación Stanford de Disección Aórtica' },
  'cardio-23': { svg: 'algo_tep.svg', title: 'Algoritmo de TEP: Score de Wells y Manejo' },
};

// ─── CLINICAL VIGNETTES (1 per class, EUNACOM-style) ───────────────────
const vignetteMap = {
  'cardio-01': {
    vignette: 'Mujer de 60 años con estenosis mitral severa presenta palpitaciones y disnea aguda. PA 85/40 mmHg, FC 150 lpm irregular, edema pulmonar. ECG: taquicardia de QRS angosto irregular.',
    explicacion: 'En cualquier taquiarritmia con compromiso hemodinámico (hipotensión, shock, angina isquémica, IC aguda), la conducta inmediata es Cardioversión Eléctrica Sincronizada. No se debe diferir la intervención eléctrica para administrar antiarrítmicos. La lectura sistemática del ECG en urgencias (eje, PR, QRS, QT, HVI) es obligatoria para decidir la conducta.'
  },
  'cardio-02': {
    vignette: 'Hombre de 55 años sufre colapso súbito. Monitor muestra Fibrilación Ventricular (FV). Se realiza la primera descarga de 200 J bifásicos.',
    explicacion: 'En el algoritmo ACLS para ritmos desfibrilables (FV/TV sin pulso): tras la 1ª descarga → RCP 2 min → si FV persiste a la 2ª descarga → Adrenalina 1 mg EV cada 3-5 min → si persiste tras la 3ª descarga → Amiodarona 300 mg EV bolo. Las 5H (Hipovolemia, Hipoxia, Hidrogeniones, Hipo/Hiperkalemia, Hipotermia) y 5T (Trombosis coronaria, TEP, Neumotórax a Tensión, Taponamiento, Tóxicos) son causas reversibles obligatorias.'
  },
  'cardio-03': {
    vignette: 'Hombre de 72 años con FA crónica, hipertenso y diabético (CHA₂DS₂-VASc = 4). Se analiza la indicación de profilaxis tromboembólica.',
    explicacion: 'La FA es la arritmia sostenida más frecuente. Diagnóstico ECG: ausencia de ondas P + ritmo irregularmente irregular. Con CHA₂DS₂-VASc ≥ 2 (hombres) o ≥ 3 (mujeres), la anticoagulación oral permanente es obligatoria. Los DOACs (Apixabán, Rivaroxabán, Dabigatrán) son de primera elección sobre AVK por menor riesgo de hemorragia intracraneal.'
  },
  'cardio-04': {
    vignette: 'Mujer de 28 años presenta palpitaciones regulares súbitas tras ingesta de café. ECG: taquicardia regular de QRS angosto a 180 lpm sin ondas P visibles.',
    explicacion: 'La TPSV por reentrada nodal es la más frecuente. En paciente estable: 1) Maniobras vagales (Valsalva modificada); 2) Adenosina 6 mg EV bolo rápido (12 mg si no responde); 3) Verapamilo EV o betabloqueadores. En WPW con FA (QRS ancho irregular), están CONTRAINDICADOS los frenadores del nodo AV (verapamilo, digoxina, adenosina).'
  },
  'cardio-05': {
    vignette: 'Hombre de 78 años con astenia severa y síncope de esfuerzo. ECG: disociación AV completa con ondas P a 75 cpm y QRS anchos a 32 cpm.',
    explicacion: 'El BAV 3° (completo) se caracteriza por disociación AV total. Con síntomas o inestabilidad, Atropina 1 mg EV es medida puente (efectiva en bloqueos nodales). El tratamiento definitivo es Marcapaso Transitorio inmediato y derivación para Marcapaso Definitivo. Mobitz II y BAV 3° requieren marcapaso siempre.'
  },
  'cardio-06': {
    vignette: 'Hombre de 64 años, diabético e hipertenso, con dolor retroesternal opresivo de 3 meses al caminar 2 cuadras, que cede en 5 min de reposo. ECG normal. Test de esfuerzo positivo a los 6 min.',
    explicacion: 'Angina Estable Crónica: dolor retroesternal desencadenado por ejercicio y aliviado por reposo o nitroglicerina sublingual. Tratamiento médico: Aspirina 100 mg/día, Estatinas alta potencia (Atorvastatina 80 mg) y Betabloqueadores. Coronariografía se reserva para test de alto riesgo o refractariedad. Criterios Diamond-Forrester estiman probabilidad pre-test de coronariopatía.'
  },
  'cardio-07': {
    vignette: 'Hombre de 55 años con dolor opresivo en reposo de 1 hora. ECG: infradesnivel ST de 2 mm en V2-V5. Troponina I marcadamente elevada.',
    explicacion: 'SCASEST = fisura de placa con trombosis parcial no oclusiva. Tratamiento inmediato: DAPT (Aspirina + Ticagrelor/Clopidogrel), Anticoagulación parenteral (Enoxaparina), Nitroglicerina SL/EV, Betabloqueadores, Estatinas dosis alta. Estratificación con scores TIMI/GRACE para timing de coronariografía invasiva.'
  },
  'cardio-08': {
    vignette: 'Hombre de 62 años con dolor torácico opresivo de 2 horas. ECG: supradesnivel ST ≥ 3 mm en DII, DIII, aVF con infradesnivel especular en DI-aVL.',
    explicacion: 'SCACEST = oclusión coronaria total. La REGLA DE LOS 120 MINUTOS: si Angioplastía Primaria disponible en ≤120 min → PCI (puerta-balón < 90 min); si NO → Trombolisis con Tenecteplase en < 30 min. Tomar V3R-V4R obligatorio en IAM inferior para descartar compromiso del VD. Protocolo GES MINSAL Chile.'
  },
  'cardio-09': {
    vignette: 'Hombre de 68 años, al 4° día post-IAM anterior, presenta bruscamente disnea severa, shock y soplo holosistólico nuevo en apex con rales bilaterales.',
    explicacion: 'Complicaciones mecánicas del IAM (día 3-7): Rotura de Músculo Papilar → IM aguda masiva; Rotura de Pared Libre → taponamiento; CIV post-IAM → soplo parasternal con frémito. Manejo definitivo: Cirugía Cardíaca de Urgencia. La Angina de Prinzmetal (vasoespasmo) se trata con Calcioantagonistas; los BB están CONTRAINDICADOS.'
  },
  'cardio-10': {
    vignette: 'Mujer de 72 años con disnea de esfuerzo CF III, ortopnea y edema de EEII. Auscultación: R3 y rales bilaterales.',
    explicacion: 'IC se diagnostica clínicamente con Criterios de Framingham (2 mayores o 1 mayor + 2 menores). BNP/NT-proBNP descarta IC por alto VPN. Ecocardiograma clasifica: IC-FEr (≤40%), IC-FElr (41-49%), IC-FEp (≥50%). La disnea de esfuerzo, ortopnea, DPN e ingurgitación yugular son criterios mayores.'
  },
  'cardio-11': {
    vignette: 'Hombre de 65 años con IC crónica y FEVI 30% sintomático en CF II bajo enalapril y carvedilol. Se evalúa optimización.',
    explicacion: 'El "Cuádruple Fantástico" que reduce mortalidad en IC-FEr: 1) iSGLT2 (Dapagliflozina/Empagliflozina); 2) ARNI (Sacubitril/Valsartán, reemplaza al IECA); 3) Betabloqueador (Carvedilol, Bisoprolol, Metoprolol CR); 4) Antagonista Mineralocorticoide (Espironolactona). Furosemida es solo sintomática, NO reduce mortalidad.'
  },
  'cardio-12': {
    vignette: 'Paciente de 70 años ingresa con disnea extrema, ortopnea, rales hasta ápex. PA 160/100, SatO₂ 84%, BNP 2500 pg/mL. Cuadrícula de Forrester: Perfil B (Caliente-Húmedo).',
    explicacion: 'EPA = congestión pulmonar aguda. Perfil B (Caliente-Húmedo) = IC congestiva sin hipoperfusión. Tratamiento: CPAP/VNI, Furosemida EV 40-80 mg bolo, Nitroglicerina EV. En Perfil C (Frío-Húmedo = shock cardiogénico) → vasopresores. Los 4 perfiles de Forrester: A (Seco-Caliente), B (Húmedo-Caliente), L (Seco-Frío), C (Húmedo-Frío).'
  },
  'cardio-13': {
    vignette: 'Post-IAM extenso, PA 75/45 mmHg, FC 120, oliguria, lactato 5.8 mmol/L, PCOP 28 mmHg, IC 1.6 L/min/m².',
    explicacion: 'Shock Cardiogénico: fallo miocárdico con bajo GC, alta PCOP y alta RVS. Noradrenalina es vasopresor de 1ª línea; Dobutamina para soporte inotrópico. Los 4 tipos de shock: 1) Hipovolémico (baja precarga); 2) Cardiogénico (fallo bomba); 3) Distributivo (vasodilatación, RVS baja); 4) Obstructivo (TEP, taponamiento).'
  },
  'cardio-14': {
    vignette: 'Deportista de 22 años presenta síncope durante ejercicio. Ecocardiograma: hipertrofia asimétrica septal del VI de 22 mm con gradiente dinámico en TSVI.',
    explicacion: 'La MCH es la causa #1 de muerte súbita en atletas jóvenes (autosómica dominante). Soplo sistólico eyectivo que AUMENTA con Valsalva y bipedestación. Tratamiento: Betabloqueadores; en alto riesgo → DAI. La MCD (dilatada) presenta IC con FEVI < 40%; la Restrictiva (ej. amiloidosis) simula IC-FEp con miocardio rígido.'
  },
  'cardio-15': {
    vignette: 'Hombre de 76 años con síncope de esfuerzo y angina. Auscultación: soplo sistólico eyectivo áspero irradiado a carótidas con pulso parvus et tardus.',
    explicacion: 'Estenosis Aórtica Severa: tríada clásica Angina + Síncope + Disnea de esfuerzo. Pulso parvus et tardus, soplo eyectivo irradiado a carótidas. Una vez sintomática, sobrevida < 2-3 años sin tratamiento. Indicación definitiva: Reemplazo Valvular Aórtico (quirúrgico o TAVI en alto riesgo).'
  },
  'cardio-16': {
    vignette: 'Mujer de 45 años con antecedente de fiebre reumática presenta disnea y FA. Auscultación: chasquido de apertura y retumbo diastólico en ápex.',
    explicacion: 'Estenosis Mitral: causa casi exclusiva = secuela de Fiebre Reumática. Chasquido de apertura + retumbo diastólico apical. IA: pulso de Corrigan (amplio, bisferiens), soplo diastólico aspirativo en foco aórtico, De Musset, Quincke. Tratamiento de EM: Valvuloplastía Mitral Percutánea con Balón (si Score Wilkins ≤ 8).'
  },
  'cardio-17': {
    vignette: 'Paciente de 50 años presenta soplo holosistólico en ápex irradiado a axila. Eco muestra prolapso de valva posterior mitral con insuficiencia severa.',
    explicacion: 'IM orgánica: soplo holosistólico en ápex irradiado a axila. Prolapso Mitral (Barlow): click mesosistólico ± soplo telesistólico. Con Valsalva el click se adelanta. IM aguda (rotura de cuerda) → EPA flash. Tratamiento definitivo de IM severa sintomática: reparación (plastía mitral) preferida sobre reemplazo.'
  },
  'cardio-18': {
    vignette: 'Médico evalúa un soplo cardíaco. Con la maniobra de Valsalva el soplo sistólico se intensifica; con Handgrip disminuye.',
    explicacion: 'Maniobras dinámicas: Valsalva y bipedestación AUMENTAN soplos de MCH y prolapso mitral (reducen precarga). Handgrip AUMENTA IM, IA y CIV (aumenta postcarga). Rivero-Carvallo: soplos derechos se intensifican con inspiración profunda. Los soplos diastólicos y holosistólicos son SIEMPRE patológicos.'
  },
  'cardio-19': {
    vignette: 'Hombre de 52 años con PA 165/105 mmHg en 3 controles consecutivos. IMC 32, fumador. Sin daño de órgano blanco.',
    explicacion: 'HTA esencial: diagnóstico con ≥2 mediciones elevadas (≥140/90) en ≥2 visitas o MAPA/AMPA. Meta MINSAL: < 140/90 (< 130/80 en DM o ERC). Combinaciones de primera línea: IECA/ARA2 + Amlodipino o + Tiazida. No combinar IECA + ARA2. Perfil de PA MINSAL y programa GES cardiovascular.'
  },
  'cardio-20': {
    vignette: 'Paciente llega a urgencias con PA 230/130 mmHg, cefalea intensa, visión borrosa y papiledema bilateral.',
    explicacion: 'Crisis hipertensiva: Urgencia (PA > 180/120 sin daño órgano → reducir PA en 24-48h con antihipertensivos orales) vs Emergencia (PA elevada + daño agudo de órgano → reducir PA ≤25% en 1ª hora con Labetalol o Nitroprusiato EV). Fondo de ojo con papiledema = emergencia hipertensiva.'
  },
  'cardio-21': {
    vignette: 'Hombre de 42 años con dolor torácico pleurítico que alivia al inclinarse adelante. ECG: supradesnivel ST cóncavo difuso e infradesnivel PR.',
    explicacion: 'Pericarditis Aguda: ≥2 de 4 criterios (dolor pleurítico posicional, frote pericárdico, ECG con supra ST cóncavo + infra PR, derrame en eco). Tratamiento: AINEs dosis alta + Colchicina 0.5 mg/día × 3 meses. Taponamiento Cardíaco: Tríada de Beck (hipotensión, ingurgitación yugular, ruidos apagados) + pulso paradojal → Pericardiocentesis de urgencia.'
  },
  'cardio-22': {
    vignette: 'Hombre de 60 años con dolor torácico lacerante súbito 10/10 irradiado a espalda. PA 190/110 brazo derecho vs 130/70 brazo izquierdo.',
    explicacion: 'Disección Aórtica: dolor desgarrador máximo al inicio + asimetría de presiones (>20 mmHg). Stanford A (ascendente) = Cirugía de Urgencia inmediata. Stanford B (descendente) = tratamiento médico con BB EV (Esmolol/Labetalol). AAA: dilatación >3 cm infrarrenal; reparación electiva si ≥5.5 cm en hombres o sintomático.'
  },
  'cardio-23': {
    vignette: 'Mujer de 35 años usuaria de ACOs con disnea súbita y dolor pleurítico. FC 115, SatO₂ 92%. AngioTAC: defecto de relleno en arteria lobar derecha.',
    explicacion: 'TEP: >90% proviene de TVP de EEII. Score de Wells: alta probabilidad → AngioTAC; baja/intermedia → Dímero D para descartar. TEP masivo (PAS <90) → Trombolisis con Alteplasa 100 mg EV. TVP: Eco-Doppler venoso + Anticoagulación (DOACs) ≥3 meses. Tríada de Virchow: estasis, hipercoagulabilidad, daño endotelial.'
  }
};

// ─── PARSE CLASSES FROM MASTER CATALOG ─────────────────────────────────
function parseClassTitle(rawSummary) {
  // Extract the title between *...* from rawSummary
  const match = rawSummary.match(/\*([^*]+)\*/);
  return match ? match[1].trim() : rawSummary;
}

function parseClassSubtitle(rawSummary) {
  // Extract parenthetical content after the title
  const match = rawSummary.match(/\*\s*\(([^)]+)\)/);
  return match ? match[1].trim() : '';
}

// Build the ordered 23-class array
const allClasses = [];
let globalClassNum = 0;

cardioSpecialty.blocks.forEach((block, blockIdx) => {
  block.classes.forEach((cls, clsInBlockIdx) => {
    globalClassNum++;
    const title = parseClassTitle(cls.rawSummary);
    const subtitle = parseClassSubtitle(cls.rawSummary);
    const diagram = diagramMap[cls.id] || null;
    const vignette = vignetteMap[cls.id] || { vignette: '', explicacion: '' };

    allClasses.push({
      globalNum: globalClassNum,
      id: cls.id,
      blockNum: blockIdx + 1,
      blockName: block.name,
      classInBlock: clsInBlockIdx + 1,
      title: title,
      subtitle: subtitle,
      perfilCodes: cls.codes,
      diagram: diagram,
      vignette: vignette,
      topicLabel: `${blockIdx + 1}.${clsInBlockIdx + 1}`
    });
  });
});

console.log(`Cargadas ${allClasses.length} clases del Master Curriculum de Cardiología`);

// ─── GENERATE HTML ─────────────────────────────────────────────────────
function generateHtml() {
  let globalQuestionNum = 1;
  let globalPageEst = 3;

  // ── COVER PAGE ──
  let pagesHtml = `
  <div class="page cover">
    <div class="cover-badge">MÓDULO 1 · MEDICINA INTERNA</div>
    <h1>CARDIOLOGÍA &amp; SISTEMA CARDIOVASCULAR</h1>
    <h2>5 Bloques Clínicos · 23 Masterclasses</h2>
    <div class="cover-subtitle">Manual EUNACOM 2026 · Perfil V3 ASOFAMECh</div>
    <div class="badge">Texto Oficial de Estudio · Chile 2026</div>
  </div>
  `;

  // ── TABLE OF CONTENTS ──
  pagesHtml += `
  <div class="page toc-container">
    <div class="toc-header">
      <h1>Índice de Contenidos</h1>
      <p>MANUAL EUNACOM CARDIOLOGÍA · 23 CLASES · 5 BLOQUES CLÍNICOS · CHILE 2026</p>
    </div>
    <div class="toc-flex-grid">
      <div class="toc-col">
  `;

  // Left column: Blocks I, II, III
  cardioSpecialty.blocks.slice(0, 3).forEach((block, bIdx) => {
    pagesHtml += `<div class="toc-chap-title">BLOQUE ${bIdx + 1}: ${block.name.replace(/^Bloque [IVX]+:\s*/, '').toUpperCase()}</div>`;
    const blockClasses = allClasses.filter(c => c.blockNum === bIdx + 1);
    blockClasses.forEach(c => {
      pagesHtml += `
        <a href="#tema-${c.globalNum}" class="toc-row-link">
          <div class="toc-row">
            <span class="toc-t-num">${c.topicLabel}</span>
            <span class="toc-t-title">${c.title}</span>
            <span class="toc-dots"></span>
            <span class="toc-page">${globalPageEst}</span>
          </div>
        </a>
      `;
      globalPageEst += 2;
    });
  });

  pagesHtml += `</div><div class="toc-col">`;

  // Right column: Blocks IV, V + Solucionario
  cardioSpecialty.blocks.slice(3).forEach((block, bIdxOffset) => {
    const bIdx = bIdxOffset + 3;
    pagesHtml += `<div class="toc-chap-title">BLOQUE ${bIdx + 1}: ${block.name.replace(/^Bloque [IVX]+:\s*/, '').toUpperCase()}</div>`;
    const blockClasses = allClasses.filter(c => c.blockNum === bIdx + 1);
    blockClasses.forEach(c => {
      pagesHtml += `
        <a href="#tema-${c.globalNum}" class="toc-row-link">
          <div class="toc-row">
            <span class="toc-t-num">${c.topicLabel}</span>
            <span class="toc-t-title">${c.title}</span>
            <span class="toc-dots"></span>
            <span class="toc-page">${globalPageEst}</span>
          </div>
        </a>
      `;
      globalPageEst += 2;
    });
  });

  pagesHtml += `
        <div class="toc-chap-title" style="border-color: #059669; color: #059669; margin-top: 10px;">
          SOLUCIONARIO OFICIAL
        </div>
        <a href="#solucionario" class="toc-row-link">
          <div class="toc-row">
            <span class="toc-t-num" style="color: #059669;">KEY</span>
            <span class="toc-t-title" style="font-weight: 700; color: #059669;">Clave de Respuestas</span>
            <span class="toc-dots" style="border-color: #a7f3d0;"></span>
            <span class="toc-page" style="color: #059669;">${globalPageEst}</span>
          </div>
        </a>
      </div>
    </div>
  </div>
  `;

  // ── TOPIC PAGES ──
  const allQuestions = [];

  allClasses.forEach(cls => {
    const hasDiagram = cls.diagram && cls.diagram.svg && getSvg(cls.diagram.svg);

    // Build clinical content from vignette data and rawSummary
    const contentSections = buildContentSections(cls);

    pagesHtml += `
    <div class="page topic-section" id="tema-${cls.globalNum}">
      <!-- TOPIC HEADER -->
      <div class="topic-hdr">
        <div>
          <div class="num">BLOQUE ${cls.blockNum} · CLASE ${cls.topicLabel} · ${cls.id.toUpperCase()}</div>
          <h2>${cls.title}</h2>
        </div>
        <div class="perfil-tag">
          <strong>PERFIL V3: ${cls.perfilCodes}</strong><br>
          Dx: Específico &bull; Tx: Inicial &bull; Seg: Derivar
        </div>
      </div>

      <!-- CONTENT IN DUAL COLUMNS -->
      <div class="two-col-flow">
        ${contentSections}

        <!-- CASO CLÍNICO TIPO EUNACOM -->
        <div class="box vignette-redesigned">
          <div class="vignette-hdr">CASO CLÍNICO TIPO EUNACOM</div>
          <div class="vignette-body">
            <div class="vignette-sec">
              <span class="sec-label">ESCENARIO CLÍNICO TÍPICO:</span>
              <p class="sec-text">"${cls.vignette.vignette}"</p>
            </div>
            <div class="vignette-sec concept-sec">
              <span class="sec-label">EXPLICACIÓN CLÍNICA DETALLADA:</span>
              <p class="sec-text">${cls.vignette.explicacion}</p>
            </div>
          </div>
        </div>

        <!-- PUNTOS CLAVE -->
        <div class="box high-yield">
          <div class="box-title">Conceptos Clave para EUNACOM</div>
          <ul class="lst">
            ${extractKeyPoints(cls.vignette.explicacion).map(p => `<li>${p}</li>`).join('')}
          </ul>
        </div>
      </div>

      <!-- FULL-WIDTH DIAGRAM (if available) -->
      ${hasDiagram ? `
      <div class="diagram-box">
        <div class="d-title">FIGURA ${cls.topicLabel}: ${cls.diagram.title.toUpperCase()}</div>
        <div class="svg-centered">
          ${getSvg(cls.diagram.svg)}
        </div>
      </div>
      ` : ''}

      <!-- PRACTICE QUESTION -->
      <div class="topic-questions-container">
        <div class="t-q-title">EVALUACIÓN: ${cls.title.toUpperCase()}</div>
        ${generateQuestion(cls, globalQuestionNum, allQuestions)}
      </div>
    </div>
    `;
    globalQuestionNum++;
  });

  // ── ANSWER KEY ──
  pagesHtml += `
  <div class="page answer-key-page" id="solucionario">
    <div class="toc-page">
      <h2>SOLUCIONARIO OFICIAL DE CARDIOLOGÍA (23 CLASES)</h2>
      <p style="font-size: 8.5pt; color: #475569; margin-bottom: 12px;">Solucionario oficial de las ${allQuestions.length} preguntas del Módulo de Cardiología. Incluye fundamento clínico y análisis de opciones.</p>
    </div>
    <div class="answer-key-list">
  `;

  allQuestions.forEach(q => {
    pagesHtml += `
      <div class="ans-key-card" id="ans-${q.num}">
        <div class="ans-key-hdr">
          <span>RESPUESTA PREGUNTA ${q.num} (Bloque ${q.blockNum} · ${q.classId})</span>
          <a href="#q-${q.num}" class="link-back">[ Volver ]</a>
        </div>
        <div class="ans-correct-badge">Respuesta Correcta: Alternativa ${q.correcta}</div>
        <div class="ans-section">
          <strong>Fundamento Clínico:</strong>
          <p>${q.explicacion}</p>
        </div>
      </div>
    `;
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
    
    @page { size: letter; margin: 0.42in 0.35in 0.38in 0.35in; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: 'Inter', sans-serif;
      font-size: 8.5pt;
      line-height: 1.35;
      color: #0f172a;
      background: #ffffff;
      -webkit-print-color-adjust: exact;
    }
    
    .page { width: 100%; page-break-after: always; position: relative; }
    .topic-section { page-break-after: always; }
    
    /* COVER */
    .cover {
      display: flex; flex-direction: column; justify-content: center; align-items: center;
      height: 9.8in; background: #0f172a; color: white; text-align: center; padding: 2in 1in;
    }
    .cover-badge { background: #2563eb; padding: 6px 20px; font-size: 10pt; font-weight: 700; border-radius: 4px; margin-bottom: 20px; letter-spacing: 1px; }
    .cover h1 { font-family: 'Merriweather', serif; font-size: 26pt; margin-bottom: 12px; }
    .cover h2 { font-size: 14pt; font-weight: 400; color: #38bdf8; margin-bottom: 8px; }
    .cover .cover-subtitle { font-size: 11pt; color: #94a3b8; margin-bottom: 30px; }
    .cover .badge { background: #1e293b; border: 1px solid #334155; padding: 8px 24px; font-size: 11pt; border-radius: 4px; }
    
    /* TABLE OF CONTENTS */
    .toc-container { width: 100%; }
    .toc-header { border-bottom: 2px solid #1e3a8a; padding-bottom: 4px; margin-bottom: 12px; }
    .toc-header h1 { font-family: 'Merriweather', serif; font-size: 16pt; color: #1e3a8a; text-transform: uppercase; letter-spacing: 0.5px; margin: 0; }
    .toc-header p { font-size: 8.5pt; color: #475569; margin-top: 2px; }
    .toc-flex-grid { display: flex; justify-content: space-between; width: 100%; gap: 0.35in; }
    .toc-col { width: 48%; display: flex; flex-direction: column; }
    .toc-chap-title { font-family: 'Merriweather', serif; font-size: 8pt; font-weight: 700; color: #1e3a8a; text-transform: uppercase; border-bottom: 1.5px solid #1e3a8a; padding-bottom: 2px; margin-top: 8px; margin-bottom: 4px; }
    .toc-row-link { text-decoration: none; color: inherit; display: block; }
    .toc-row { display: flex; align-items: baseline; padding: 2px 0; font-size: 7.5pt; }
    .toc-row:hover { background: #f1f5f9; }
    .toc-t-num { font-weight: 700; color: #2563eb; width: 0.4in; flex-shrink: 0; }
    .toc-t-title { font-weight: 500; color: #0f172a; flex-shrink: 0; max-width: 2.4in; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .toc-dots { flex: 1; border-bottom: 1px dotted #94a3b8; margin: 0 4px; position: relative; top: -3px; }
    .toc-page { font-weight: 700; color: #1e3a8a; width: 0.35in; text-align: right; flex-shrink: 0; }
    
    /* TOPIC HEADER */
    .topic-hdr { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1e3a8a; padding-bottom: 4px; margin-bottom: 8px; }
    .topic-hdr h2 { font-family: 'Merriweather', serif; font-size: 13pt; color: #1e3a8a; }
    .topic-hdr .num { font-size: 7.5pt; font-weight: 700; color: #2563eb; text-transform: uppercase; }
    .perfil-tag { background: #f1f5f9; border: 1px solid #cbd5e1; border-left: 4px solid #1e3a8a; padding: 3px 6px; font-size: 7pt; }
    
    /* TWO-COLUMN */
    .two-col-flow { column-count: 2; column-gap: 0.2in; width: 100%; }
    
    /* CALLOUT BOXES */
    .box { border: 1px solid #cbd5e1; border-radius: 2px; padding: 5px 7px; margin-top: 5px; margin-bottom: 5px; font-size: 8pt; width: 100%; break-inside: avoid; }
    .box-title { font-weight: 700; font-size: 7.5pt; text-transform: uppercase; margin-bottom: 2px; letter-spacing: 0.5px; }
    .box.high-yield { background: #f8fafc; border-left: 3.5px solid #1e3a8a; }
    .box.high-yield .box-title { color: #1e3a8a; }
    
    /* VIGNETTE */
    .box.vignette-redesigned { background: #fffdf5; border: 1.5px solid #f59e0b; border-radius: 3px; padding: 0; margin-top: 6px; margin-bottom: 6px; overflow: hidden; break-inside: avoid; }
    .vignette-hdr { background: #d97706; color: #ffffff; font-weight: 700; font-size: 8pt; padding: 3.5px 8px; text-transform: uppercase; letter-spacing: 0.5px; }
    .vignette-body { padding: 6px 8px; }
    .vignette-sec { margin-bottom: 4px; }
    .vignette-sec.concept-sec { border-top: 1px dashed #fcd34d; padding-top: 4px; margin-bottom: 0; }
    .sec-label { font-weight: 700; font-size: 7.5pt; color: #92400e; display: block; margin-bottom: 2px; }
    .sec-text { font-size: 8pt; line-height: 1.35; color: #1e293b; }
    
    /* CONTENT */
    .subhead { font-family: 'Merriweather', serif; font-size: 9.5pt; font-weight: 700; color: #1e3a8a; margin: 8px 0 4px 0; border-bottom: 1px solid #cbd5e1; padding-bottom: 1px; break-after: avoid; }
    .subhead-small { font-family: 'Inter', sans-serif; font-size: 8.5pt; font-weight: 700; color: #0f172a; margin: 6px 0 3px 0; break-after: avoid; }
    p.txt { font-size: 8pt; line-height: 1.35; margin-bottom: 4px; text-align: justify; }
    ul.lst { padding-left: 12px; margin-bottom: 4px; }
    ul.lst li { font-size: 8pt; margin-bottom: 2px; }
    
    /* DIAGRAM */
    .diagram-box { width: 100%; border: 1.5px solid #1e3a8a; border-radius: 3px; padding: 6px 10px; margin-top: 8px; margin-bottom: 8px; background: #ffffff; text-align: center; break-inside: avoid; column-span: all; -webkit-column-span: all; }
    .diagram-box .d-title { font-weight: 800; font-size: 8pt; text-transform: uppercase; color: #1e3a8a; text-align: center; margin-bottom: 4px; border-bottom: 1.5px solid #cbd5e1; padding-bottom: 2px; letter-spacing: 0.5px; }
    .svg-centered { display: flex; justify-content: center; align-items: center; width: 100%; text-align: center; }
    .svg-centered svg { width: 100% !important; max-width: 100% !important; height: auto !important; margin: 0 auto; display: block; }
    
    /* QUESTIONS */
    .topic-questions-container { width: 100%; margin-top: 8px; break-inside: avoid; }
    .t-q-title { font-weight: 700; font-size: 8pt; color: #1e3a8a; text-transform: uppercase; border-bottom: 1.5px solid #1e3a8a; padding-bottom: 2px; margin-bottom: 4px; }
    .q-full-width { width: 100%; background: #ffffff; border: 1px solid #cbd5e1; border-left: 3.5px solid #2563eb; border-radius: 2px; padding: 5px 8px; margin-bottom: 5px; break-inside: avoid; }
    .q-hdr-link { display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px; }
    .q-full-width .q-hdr { font-weight: 700; font-size: 8pt; color: #2563eb; text-transform: uppercase; letter-spacing: 0.5px; }
    .link-ans { font-size: 7.5pt; color: #0284c7; text-decoration: none; font-weight: 600; }
    .q-full-width .q-stem { font-size: 8pt; line-height: 1.35; margin-bottom: 4px; }
    .q-options-grid { display: flex; flex-direction: column; gap: 2px; margin-bottom: 2px; }
    .q-opt-item { font-size: 7.5pt; padding: 2px 4px; border-radius: 2px; background: #f8fafc; border: 1px solid #e2e8f0; }
    
    /* ANSWER KEY */
    .answer-key-page { padding-top: 0.2in; }
    .answer-key-page h2 { font-family: 'Merriweather', serif; font-size: 14pt; color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 4px; margin-bottom: 8px; }
    .ans-key-card { background: #ffffff; border: 1px solid #cbd5e1; border-radius: 3px; padding: 8px 10px; margin-bottom: 10px; page-break-inside: avoid; }
    .ans-key-hdr { display: flex; justify-content: space-between; align-items: center; font-weight: 700; font-size: 8.5pt; color: #1e3a8a; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; margin-bottom: 4px; }
    .link-back { font-size: 7.5pt; color: #2563eb; text-decoration: none; }
    .ans-correct-badge { display: inline-block; background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; font-weight: 700; font-size: 8pt; padding: 2px 6px; border-radius: 2px; margin-bottom: 4px; }
    .ans-section { font-size: 8pt; line-height: 1.35; margin-bottom: 4px; }

    /* IMPORTANT / WARNING / TIP / NOTE CALLOUTS */
    .box.important-callout { background: #fef2f2; border-color: #fca5a5; border-left: 3.5px solid #ef4444; }
    .box.important-callout .box-title { color: #991b1b; }
    .box.warning-callout { background: #fff7ed; border-color: #ffedd5; border-left: 3.5px solid #f97316; }
    .box.warning-callout .box-title { color: #c2410c; }
    .box.note-callout { background: #f8fafc; border-color: #e2e8f0; border-left: 3.5px solid #64748b; }
    .box.note-callout .box-title { color: #334155; }
    .box.tip-callout { background: #fff5f5; border: 1.5px solid #fca5a5; border-left: 3.5px solid #dc2626; }
    .box.tip-callout .box-title { color: #991b1b; }
  </style>
</head>
<body>
  ${pagesHtml}
</body>
</html>`;
}

// ─── HELPER: Build content sections from vignette explanations ─────────
function buildContentSections(cls) {
  const explanation = cls.vignette.explicacion || '';
  const subtitle = cls.subtitle || '';
  
  let html = '';
  
  // Title section with subtitle
  if (subtitle) {
    html += `<div class="subhead">${cls.title}</div>`;
    html += `<p class="txt">${subtitle}</p>`;
  }
  
  // Block context label
  html += `<div class="box note-callout"><div class="box-title">${cls.blockName}</div><p>${cls.id.toUpperCase()} · Perfil V3: ${cls.perfilCodes}</p></div>`;
  
  // Main clinical explanation as formatted paragraphs
  const sentences = explanation.split(/\.\s+/).filter(s => s.trim().length > 10);
  if (sentences.length > 2) {
    html += `<div class="subhead-small">Fundamento Clínico</div>`;
    // First half as a paragraph
    const mid = Math.ceil(sentences.length / 2);
    html += `<p class="txt">${sentences.slice(0, mid).join('. ')}.</p>`;
    html += `<p class="txt">${sentences.slice(mid).join('. ')}${explanation.endsWith('.') ? '' : '.'}</p>`;
  } else {
    html += `<p class="txt">${explanation}</p>`;
  }
  
  return html;
}

// ─── HELPER: Extract key points from explanation ───────────────────────
function extractKeyPoints(text) {
  if (!text) return ['Revisar caso clínico y explicación detallada.'];
  
  const points = [];
  // Extract numbered items
  const numbered = text.match(/\d\)\s*[^;.]+[;.]/g);
  if (numbered) {
    numbered.forEach(n => points.push(n.replace(/^\d\)\s*/, '').trim()));
  }
  
  // Extract key clinical terms
  const keyTerms = text.match(/(?:CONTRAINDICAD[OA]S?|de primera línea|de elección|obligatori[oa]|siempre|nunca|diagnóstico|tratamiento definitivo)[^.]+\./gi);
  if (keyTerms) {
    keyTerms.forEach(t => {
      if (!points.some(p => p.includes(t.substring(0, 20)))) {
        points.push(t.trim());
      }
    });
  }
  
  // If we don't have enough, split by sentences
  if (points.length < 3) {
    const sentences = text.split(/\.\s+/).filter(s => s.trim().length > 15);
    for (const s of sentences) {
      if (points.length >= 4) break;
      const cleaned = s.trim() + '.';
      if (!points.some(p => p.includes(cleaned.substring(0, 15)))) {
        points.push(cleaned);
      }
    }
  }
  
  return points.slice(0, 5);
}

// ─── HELPER: Generate EUNACOM question for a class ─────────────────────
function generateQuestion(cls, qNum, allQuestions) {
  const v = cls.vignette;
  
  // Generate a question from the clinical vignette
  const question = {
    num: qNum,
    blockNum: cls.blockNum,
    classId: cls.id,
    enunciado: v.vignette || `Pregunta sobre ${cls.title}`,
    correcta: 'A',
    explicacion: v.explicacion || 'Fundamento basado en protocolo EUNACOM oficial.',
    opciones: generateOptions(cls)
  };
  
  allQuestions.push(question);
  
  return `
    <div class="q-full-width" id="q-${qNum}">
      <div class="q-hdr-link">
        <span class="q-hdr">PREGUNTA ${qNum}</span>
        <a href="#ans-${qNum}" class="link-ans">[ Ver Explicación en Solucionario ]</a>
      </div>
      <div class="q-stem">${question.enunciado}<br><strong>¿Cuál es la conducta más apropiada?</strong></div>
      <div class="q-options-grid">
        ${question.opciones.map(o => `
          <div class="q-opt-item"><strong>${o.id})</strong> ${o.texto}</div>
        `).join('')}
      </div>
    </div>
  `;
}

// ─── HELPER: Generate contextual options for each class ────────────────
function generateOptions(cls) {
  const optionSets = {
    'cardio-01': [
      { id: 'A', texto: 'Cardioversión eléctrica sincronizada inmediata' },
      { id: 'B', texto: 'Amiodarona 300 mg EV en infusión de 60 min' },
      { id: 'C', texto: 'Observar con monitorización y control de FC' },
      { id: 'D', texto: 'Verapamilo 5 mg EV lento' },
      { id: 'E', texto: 'Adenosina 6 mg EV en bolo rápido' }
    ],
    'cardio-02': [
      { id: 'A', texto: 'Reanudar RCP de alta calidad por 2 minutos' },
      { id: 'B', texto: 'Administrar Amiodarona 300 mg EV inmediata' },
      { id: 'C', texto: 'Verificar pulso carotídeo por 30 segundos' },
      { id: 'D', texto: 'Realizar intubación endotraqueal' },
      { id: 'E', texto: 'Administrar Adrenalina 1 mg EV' }
    ],
    'cardio-03': [
      { id: 'A', texto: 'Iniciar anticoagulación oral permanente con DOAC' },
      { id: 'B', texto: 'Aspirina 100 mg/día como monoterapia' },
      { id: 'C', texto: 'Cardioversión eléctrica urgente' },
      { id: 'D', texto: 'Control de frecuencia sin anticoagulación' },
      { id: 'E', texto: 'Warfarina con meta INR 3.0-4.0' }
    ],
    'cardio-04': [
      { id: 'A', texto: 'Maniobras vagales (Valsalva modificada)' },
      { id: 'B', texto: 'Desfibrilación a 200 J' },
      { id: 'C', texto: 'Verapamilo 10 mg EV directo' },
      { id: 'D', texto: 'Amiodarona 150 mg EV en 10 min' },
      { id: 'E', texto: 'Digoxina 0.5 mg EV' }
    ],
    'cardio-05': [
      { id: 'A', texto: 'Marcapaso transitorio y derivar para marcapaso definitivo' },
      { id: 'B', texto: 'Atropina 0.5 mg EV y observación por 24h' },
      { id: 'C', texto: 'Isoproterenol EV en infusión continua' },
      { id: 'D', texto: 'Implante de DAI (desfibrilador)' },
      { id: 'E', texto: 'Observar, BAV completo es benigno en ancianos' }
    ],
    'cardio-06': [
      { id: 'A', texto: 'Aspirina + Estatina alta potencia + Betabloqueador' },
      { id: 'B', texto: 'Coronariografía inmediata por test positivo' },
      { id: 'C', texto: 'Clopidogrel 300 mg carga y derivar' },
      { id: 'D', texto: 'Nitroglicerina parche 24h continuo' },
      { id: 'E', texto: 'Calcioantagonista como monoterapia' }
    ],
    'cardio-07': [
      { id: 'A', texto: 'DAPT + Enoxaparina + Estatina + NTG + BB' },
      { id: 'B', texto: 'Trombolisis con Tenecteplase por troponina alta' },
      { id: 'C', texto: 'Observación con seriación de troponinas a las 12h' },
      { id: 'D', texto: 'Aspirina sola y alta con control ambulatorio' },
      { id: 'E', texto: 'AngioTAC de tórax para descartar TEP' }
    ],
    'cardio-08': [
      { id: 'A', texto: 'Reperfusión inmediata (PCI < 120 min o Trombolisis < 30 min)' },
      { id: 'B', texto: 'Seriación enzimática y esperar confirmación' },
      { id: 'C', texto: 'Betabloqueador EV y observar evolución del ST' },
      { id: 'D', texto: 'Ecocardiograma antes de decidir conducta' },
      { id: 'E', texto: 'Anticoagulación con Heparina y derivar a las 24h' }
    ],
    'cardio-09': [
      { id: 'A', texto: 'Cirugía cardíaca de urgencia' },
      { id: 'B', texto: 'Nitroglicerina EV y diuréticos' },
      { id: 'C', texto: 'Balón de contrapulsación como tratamiento definitivo' },
      { id: 'D', texto: 'Betabloqueadores EV a dosis altas' },
      { id: 'E', texto: 'Observación con monitorización hemodinámica' }
    ],
    'cardio-10': [
      { id: 'A', texto: 'Ecocardiograma Doppler para clasificar FEVI' },
      { id: 'B', texto: 'Test de esfuerzo para evaluar la disnea' },
      { id: 'C', texto: 'Coronariografía directa por sospecha coronaria' },
      { id: 'D', texto: 'TAC de tórax con contraste' },
      { id: 'E', texto: 'Iniciar diuréticos y control en 3 meses' }
    ],
    'cardio-11': [
      { id: 'A', texto: 'Agregar iSGLT2 + cambiar IECA por ARNI' },
      { id: 'B', texto: 'Mantener esquema actual y control en 6 meses' },
      { id: 'C', texto: 'Agregar Digoxina 0.25 mg/día' },
      { id: 'D', texto: 'Suspender carvedilol por FEVI baja' },
      { id: 'E', texto: 'Furosemida 80 mg para mejorar síntomas' }
    ],
    'cardio-12': [
      { id: 'A', texto: 'VNI (CPAP) + Furosemida EV + Nitroglicerina EV' },
      { id: 'B', texto: 'Intubación endotraqueal inmediata' },
      { id: 'C', texto: 'Noradrenalina EV de primera línea' },
      { id: 'D', texto: 'Morfina EV 10 mg bolo directo' },
      { id: 'E', texto: 'Digoxina 0.5 mg EV para control de FC' }
    ],
    'cardio-13': [
      { id: 'A', texto: 'Noradrenalina EV como vasopresor de primera línea' },
      { id: 'B', texto: 'Dobutamina EV como único tratamiento' },
      { id: 'C', texto: 'Furosemida 160 mg EV bolo' },
      { id: 'D', texto: 'Volumen con SF 0.9% 2 litros rápidos' },
      { id: 'E', texto: 'Milrinona EV sin soporte vasopresor' }
    ],
    'cardio-14': [
      { id: 'A', texto: 'Betabloqueadores y evaluar riesgo de muerte súbita' },
      { id: 'B', texto: 'Cardioversión eléctrica por síncope' },
      { id: 'C', texto: 'Digoxina para reducir el gradiente' },
      { id: 'D', texto: 'Cirugía valvular aórtica urgente' },
      { id: 'E', texto: 'Restricción deportiva sin más estudio' }
    ],
    'cardio-15': [
      { id: 'A', texto: 'Reemplazo valvular aórtico (quirúrgico o TAVI)' },
      { id: 'B', texto: 'Tratamiento médico con betabloqueadores indefinido' },
      { id: 'C', texto: 'Valvuloplastía aórtica con balón definitiva' },
      { id: 'D', texto: 'Vasodilatadores EV para reducir el gradiente' },
      { id: 'E', texto: 'Observación y control anual con ecocardiograma' }
    ],
    'cardio-16': [
      { id: 'A', texto: 'Valvuloplastía mitral percutánea con balón' },
      { id: 'B', texto: 'Reemplazo valvular mitral inmediato' },
      { id: 'C', texto: 'Diuréticos orales como tratamiento definitivo' },
      { id: 'D', texto: 'Cardioversión farmacológica con flecainida' },
      { id: 'E', texto: 'Anticoagulación sola y control en 6 meses' }
    ],
    'cardio-17': [
      { id: 'A', texto: 'Reparación (plastía mitral) quirúrgica' },
      { id: 'B', texto: 'Reemplazo valvular con prótesis mecánica' },
      { id: 'C', texto: 'Betabloqueadores a dosis altas' },
      { id: 'D', texto: 'Diuréticos y vasodilatadores indefinidamente' },
      { id: 'E', texto: 'Antibióticos profilácticos de por vida' }
    ],
    'cardio-18': [
      { id: 'A', texto: 'Ecocardiograma Doppler (soplo diastólico siempre patológico)' },
      { id: 'B', texto: 'Tranquilizar, es un soplo inocente por Valsalva' },
      { id: 'C', texto: 'Holter de 24h para evaluar arritmias' },
      { id: 'D', texto: 'ECG de esfuerzo para evaluar isquemia' },
      { id: 'E', texto: 'Resonancia magnética cardíaca' }
    ],
    'cardio-19': [
      { id: 'A', texto: 'IECA/ARA2 + Amlodipino en combinación fija' },
      { id: 'B', texto: 'Hidroclorotiazida como monoterapia' },
      { id: 'C', texto: 'Betabloqueador como primera línea' },
      { id: 'D', texto: 'Medidas no farmacológicas exclusivas por 1 año' },
      { id: 'E', texto: 'IECA + ARA2 combinados' }
    ],
    'cardio-20': [
      { id: 'A', texto: 'Labetalol o Nitroprusiato EV, reducir PA ≤25% en 1ª hora' },
      { id: 'B', texto: 'Nifedipino sublingual para descenso rápido' },
      { id: 'C', texto: 'Captopril oral y alta a domicilio' },
      { id: 'D', texto: 'Furosemida 80 mg EV como monoterapia' },
      { id: 'E', texto: 'Observar y controlar PA en 24h' }
    ],
    'cardio-21': [
      { id: 'A', texto: 'AINEs dosis alta + Colchicina 0.5 mg/día × 3 meses' },
      { id: 'B', texto: 'Corticoides sistémicos como primera línea' },
      { id: 'C', texto: 'Pericardiocentesis diagnóstica inmediata' },
      { id: 'D', texto: 'Antibióticos empíricos EV' },
      { id: 'E', texto: 'Trombolisis por supradesnivel del ST' }
    ],
    'cardio-22': [
      { id: 'A', texto: 'Cirugía de urgencia inmediata (Stanford A)' },
      { id: 'B', texto: 'Betabloqueadores EV y manejo médico' },
      { id: 'C', texto: 'Trombolisis sistémica urgente' },
      { id: 'D', texto: 'Angioplastía coronaria primaria' },
      { id: 'E', texto: 'AngioTAC de control en 48h' }
    ],
    'cardio-23': [
      { id: 'A', texto: 'Anticoagulación con DOAC por ≥3 meses' },
      { id: 'B', texto: 'Aspirina 100 mg como tratamiento único' },
      { id: 'C', texto: 'Trombolisis sistémica (paciente estable)' },
      { id: 'D', texto: 'Filtro de vena cava como primera línea' },
      { id: 'E', texto: 'Control ambulatorio sin anticoagulación' }
    ]
  };
  
  return optionSets[cls.id] || [
    { id: 'A', texto: 'Conducta de primera línea según guía clínica' },
    { id: 'B', texto: 'Opción no indicada en la fase aguda' },
    { id: 'C', texto: 'Examen de laboratorio secundario' },
    { id: 'D', texto: 'Fármaco contraindicado en este contexto' },
    { id: 'E', texto: 'Derivación o manejo tardío' }
  ];
}

// ─── MAIN: COMPILE PDF ─────────────────────────────────────────────────
async function main() {
  console.log(`Generando MANUAL EUNACOM CARDIOLOGÍA · ${allClasses.length} Clases · 5 Bloques · Perfil V3 ASOFAMECh...`);
  
  const htmlContent = generateHtml();
  
  fs.mkdirSync(path.dirname(outputPdfPath), { recursive: true });
  fs.mkdirSync(path.dirname(publicPdfPath), { recursive: true });
  
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'load', timeout: 60000 });
  await page.evaluateHandle('document.fonts.ready');

  const pdfBuffer = await page.pdf({
    format: 'Letter',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: `
      <div style="font-size: 7.5pt; font-family: 'Inter', sans-serif; color: #64748b; width: 100%; display: flex; justify-content: space-between; align-items: center; margin: 0 0.35in; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">
        <span>MANUAL EUNACOM &bull; CARDIOLOGÍA &bull; MÓDULO 1</span>
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

  fs.writeFileSync(outputPdfPath, pdfBuffer);
  fs.writeFileSync(publicPdfPath, pdfBuffer);

  await browser.close();
  console.log("¡ÉXITO! Manual EUNACOM Cardiología generado:");
  console.log(`  1) ${outputPdfPath}`);
  console.log(`  2) ${publicPdfPath}`);
  console.log(`  → ${allClasses.length} clases, 5 bloques, Perfil V3 ASOFAMECh`);
}

main().catch(console.error);
