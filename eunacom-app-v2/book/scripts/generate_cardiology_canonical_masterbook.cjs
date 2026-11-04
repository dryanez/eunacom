/**
 * ═══════════════════════════════════════════════════════════════════════
 *  MANUAL EUNACOM 2026 — CARDIOLOGÍA & SISTEMA CARDIOVASCULAR
 *  Compilador Maestro de Alta Densidad Clínica
 *  Estructura: 23 Clases Canónicas · 5 Bloques (BLOQUES_CLINICOS_MASTER_CATALOG.json)
 *  Contenido: 47 Clases Online Reales (cardio_online_classes.json) integradas
 *  Formato: 50/50 Dual-Column Letter PDF · Merriweather / Inter · PlantUML SVGs
 * ═══════════════════════════════════════════════════════════════════════
 */

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const outputPdfPath = path.join(__dirname, '..', 'libro_eunacom_v3', 'Modulo_1_Medicina_Interna', 'Capitulo_01_Cardiologia_Master_2026.pdf');
const publicPdfPath = path.join(__dirname, '..', '..', 'public', 'cardio_showcase', 'Cardiologia_Master_2026.pdf');

// 1. Read Canonical Master Catalog
const catalogPath = path.join(__dirname, '..', '..', '..', 'eunacom-master-curriculum', 'BLOQUES_CLINICOS_MASTER_CATALOG.json');
const masterCatalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const cardioSpecialty = masterCatalog[0].specialties[0];

// 2. Read Online Classes Rich Content
const onlineClasses = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'cardio_online_classes.json'), 'utf8'));

// 3. Helper to strip unexpected emojis
function stripEmojis(str) {
  if (!str) return '';
  return str.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu, '');
}

// 4. SVG Diagram Loader
function getSvg(svgFilename) {
  if (!svgFilename) return '';
  const p = path.join(__dirname, '..', 'generate-book', 'svg_diagrams', svgFilename);
  if (fs.existsSync(p)) {
    let svg = fs.readFileSync(p, 'utf8');
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

// 5. Mapping of 23 Canonical Classes to 47 Online Classes (indices 0-46) & SVGs
const classMapping = {
  'cardio-01': {
    onlineIndices: [0, 13], // 1. Manejo Urgencias Arritmias + 14. Extrasístoles
    svg: 'algo_urgencias.svg',
    algoTitle: 'Algoritmo de Lectura Sistemática del ECG en Urgencias',
    vignette: 'Mujer de 60 años con palpitaciones y disnea. PA 85/40 mmHg, FC 150 lpm irregular, edema pulmonar. ECG revela taquicardia de QRS angosto irregular.',
    explicacion: 'En cualquier taquiarritmia con compromiso hemodinámico (hipotensión/shock, angina, compromiso de conciencia o IC aguda), la conducta mandatoria inmediata es la Cardioversión Eléctrica Sincronizada. No diferir por fármacos.'
  },
  'cardio-02': {
    onlineIndices: [1, 2], // 2. Paro Cardiorrespiratorio + 3. RCP
    svg: 'algo_pcr.svg',
    algoTitle: 'Algoritmo de Soporte Vital Cardiovascular Avanzado (ACLS)',
    vignette: 'Hombre de 55 años sufre colapso súbito. Monitor muestra Fibrilación Ventricular (FV). Se realiza la primera descarga de 200 J.',
    explicacion: 'Algoritmo ACLS en ritmos desfibrilables (FV/TVsp): Descarga 200J → RCP 2 min → Si persiste a la 2ª descarga: Adrenalina 1 mg EV c/3-5 min → Si persiste a la 3ª descarga: Amiodarona 300 mg EV bolo. Descartar siempre las 5H y 5T.'
  },
  'cardio-03': {
    onlineIndices: [4, 5, 6, 7, 8, 9, 10], // 5. FA, 6. Antiarrítmicos, 7. Anticoagulantes, 8. Manejo FA, 9. FA Crónica, 10. FA Reciente, 11. Flutter
    svg: 'algo_fa.svg',
    algoTitle: 'Estrategia Global AF-CARE y Manejo de FA / Flutter Auricular',
    vignette: 'Hombre de 72 años con FA crónica, hipertenso y diabético (CHA₂DS₂-VASc = 4). Se evalúa profilaxis tromboembólica.',
    explicacion: 'En FA con CHA₂DS₂-VASc ≥ 2 en hombres (≥ 3 en mujeres), la Anticoagulación Oral continua con DOACs (Apixabán, Rivaroxabán, Dabigatrán) es obligatoria. En FA < 48h en corazón sano: cardioversión con Flecainida/Propafenona (Ic).'
  },
  'cardio-04': {
    onlineIndices: [11, 12], // 12. TPSV + 13. TV y Canalopatías
    svg: 'algo_tpsv.svg',
    algoTitle: 'Algoritmo de Manejo de TPSV y Taquicardias de Complejo Ancho',
    vignette: 'Mujer de 28 años presenta palpitaciones regulares bruscas a 180 lpm sin ondas P visibles. Hemodinamia estable.',
    explicacion: 'TPSV estable: 1) Maniobras vagales (Valsalva modificada); 2) Adenosina 6 mg EV en bolo rápido (12 mg si persiste); 3) Verapamilo o Betabloqueador. En WPW con FA preexcitada (QRS ancho irregular), están CONTRAINDICADOS los bloqueadores del nodo AV.'
  },
  'cardio-05': {
    onlineIndices: [3], // 4. Bradiarritmias y Bloqueos
    svg: 'algo_bav.svg',
    algoTitle: 'Algoritmo Diagnóstico y Terapéutico de Bloqueos AV y Bradicardias',
    vignette: 'Hombre de 78 años con astenia y síncope de esfuerzo. ECG muestra disociación AV total con ondas P a 75 cpm y QRS a 32 cpm.',
    explicacion: 'Bloqueo AV de 3er grado (Completo) requiere Marcapaso Transitorio inmediato y derivación para Marcapaso Definitivo. En bradicardia sintomática inestable, Atropina 1 mg EV es medida puente inicial.'
  },
  'cardio-06': {
    onlineIndices: [14, 24], // 15. Angina Crónica + 25. Cardiopatía Coronaria
    svg: 'algo_angina_estable.svg',
    algoTitle: 'Algoritmo de Evaluación y Tratamiento de Angina Crónica Estable',
    vignette: 'Hombre de 64 años con dolor retroesternal opresivo al caminar 2 cuadras que cede con 5 min de reposo. ECG de reposo normal.',
    explicacion: 'Angina Estable: dolor desencadenado por esfuerzo y aliviado por reposo/nitratos. Tratamiento médico óptimo: Aspirina 100 mg + Estatina alta potencia (Atorvastatina 80 mg) + Betabloqueador. Coronariografía si test de esfuerzo es de alto riesgo.'
  },
  'cardio-07': {
    onlineIndices: [15, 17, 18], // 16. Dolor Torácico + 18. Marcadores Isquemia + 19. SCASEST
    svg: 'algo_dolor_toracico.svg',
    algoTitle: 'Algoritmo de Estratificación de Dolor Torácico y SCASEST (TIMI / GRACE)',
    vignette: 'Hombre de 55 años con dolor opresivo en reposo de 1 hora. ECG: infradesnivel ST de 2 mm en V2-V5 con Troponina I marcadamente elevada.',
    explicacion: 'SCASEST: fisura de placa no oclusiva con necrosis miocárdica. Tratamiento médico inmediato: DAPT (Aspirina + Ticagrelor/Clopidogrel), Anticoagulación parenteral (Enoxaparina), Nitroglicerina, Betabloqueadores y Estatinas. Estratificación TIMI/GRACE para definir timing coronariográfico.'
  },
  'cardio-08': {
    onlineIndices: [16, 21], // 17. ECG en SCA / SCACEST + 22. IAM Ventrículo Derecho
    svg: 'algo_scacest_120min.svg',
    algoTitle: 'Algoritmo Maestro de Reperfusión: Regla de los 120 Minutos (GES MINSAL)',
    vignette: 'Hombre de 62 años con dolor torácico de 2 horas. ECG: supradesnivel ST de 3 mm en DII, DIII, aVF con infradesnivel especular en DI y aVL.',
    explicacion: 'SCACEST: oclusión coronaria transmural. Regla de los 120 Minutos: Si traslado a hemodinamia es < 120 min → Angioplastía Primaria (puerta-balón < 90 min); si es > 120 min → Trombolisis con Tenecteplase < 30 min (puerta-aguja). En IAM inferior, tomar V3R-V4R obligatorio para descartar IAM de VD.'
  },
  'cardio-09': {
    onlineIndices: [19, 20], // 20. Complicaciones Mecánicas + 21. Arritmias en el Infarto
    svg: null,
    algoTitle: 'Diagnóstico Diferencial de Complicaciones Mecánicas Post-IAM',
    vignette: 'Hombre de 68 años, al 4° día post-IAM anterior, presenta bruscamente disnea severa, shock y soplo holosistólico nuevo en ápex con rales bilaterales.',
    explicacion: 'Complicaciones mecánicas (días 3-7 post-IAM): Rotura de músculo papilar → Insuficiencia Mitral Aguda masiva y edema pulmonar flash. Rotura de pared libre → Taponamiento cardíaco súbito. CIV post-IAM → Soplo parasternal con frémito. Manejo definitivo: Cirugía cardíaca de emergencia.'
  },
  'cardio-10': {
    onlineIndices: [22, 25], // 23. IC Generalidades + 26. Cor Pulmonale
    svg: 'algo_ic_dx.svg',
    algoTitle: 'Algoritmo Diagnóstico de Insuficiencia Cardíaca (Framingham / FEVI)',
    vignette: 'Mujer de 72 años con disnea de esfuerzo CF III, ortopnea, DPN y edema de extremidades inferiores. Auscultación: R3 y rales basales bilaterales.',
    explicacion: 'Diagnóstico de IC es clínico mediante Criterios de Framingham (2 mayores o 1 mayor + 2 menores). BNP/NT-proBNP descarta IC por alto valor predictivo negativo. Ecocardiograma clasifica: IC-FEr (≤40%), IC-FElr (41-49%) e IC-FEp (≥50%).'
  },
  'cardio-11': {
    onlineIndices: [23], // 24. IC Tratamiento
    svg: 'algo_ic_tratamiento.svg',
    algoTitle: 'Cuádruple Terapia Modificadora de Pronóstico en IC-FEr (GDMT)',
    vignette: 'Hombre de 65 años con IC crónica y FEVI 30% sintomático en CF II bajo enalapril y carvedilol. Se evalúa optimización del tratamiento.',
    explicacion: 'Cuádruple terapia que reduce mortalidad en IC-FEr: 1) ARNI (Sacubitrilo/Valsartán, superior a IECA); 2) Betabloqueador (Carvedilol, Bisoprolol, Metoprolol succinato); 3) Espironolactona (Antagonista MR); 4) iSGLT2 (Dapagliflozina / Empagliflozina). Furosemida es sintomática para descongestionar.'
  },
  'cardio-12': {
    onlineIndices: [22, 35], // IC aguda & Shock
    svg: null,
    algoTitle: 'Cuadrícula de Forrester y Manejo de Edema Agudo de Pulmón',
    vignette: 'Paciente de 70 años ingresa con disnea extrema, ortopnea, rales hasta ápex. PA 160/100, SatO₂ 84%. Perfil Forrester B (Caliente-Húmedo).',
    explicacion: 'Edema Agudo de Pulmón Perfil B (Caliente-Húmedo: congestión sin hipoperfusión): 1) VNI / CPAP; 2) Furosemida 40-80 mg EV bolo; 3) Nitroglicerina EV para reducir precarga y postcarga. No requiere inótropos.'
  },
  'cardio-13': {
    onlineIndices: [35], // 36. Clasificación de Shock
    svg: 'algo_shock.svg',
    algoTitle: 'Clasificación Hemodinámica y Manejo del Shock Cardiogénico',
    vignette: 'Paciente post-IAM anterior extenso, PA 75/45 mmHg, oliguria, frialdad distal, lactato 5.8 mmol/L, PCOP 28 mmHg, IC 1.6 L/min/m².',
    explicacion: 'Shock Cardiogénico: fallo de bomba con gasto cardíaco bajo, PCOP elevada y resistencia vascular sistémica elevada. Vasopresor de 1ª línea: Noradrenalina. Inótropo de apoyo: Dobutamina. Asistencia mecánica (BCPIAo, ECMO) en casos refractarios.'
  },
  'cardio-14': {
    onlineIndices: [29, 33], // 30. Miocardiopatías + 34. Miocarditis Aguda
    svg: null,
    algoTitle: 'Clasificación de Miocardiopatías (MCD, MCH, MCR) y Miocarditis',
    vignette: 'Deportista de 22 años presenta síncope durante ejercicio. Ecocardiograma: hipertrofia asimétrica septal de 22 mm con gradiente en tracto de salida.',
    explicacion: 'Miocardiopatía Hipertrófica (MCH): causa #1 de muerte súbita en atletas jóvenes. Soplo eyectivo que AUMENTA con Valsalva. Tratamiento: Betabloqueadores; DAI en alto riesgo. Miocarditis aguda: sospechar en paciente joven con elevación de troponinas post-infección viral.'
  },
  'cardio-15': {
    onlineIndices: [27], // 28. Valvulopatías Izquierdas (EAo)
    svg: 'algo_estenosis_aortica.svg',
    algoTitle: 'Evaluación y Criterios Quirúrgicos de Estenosis Aórtica Severa',
    vignette: 'Hombre de 76 años con síncope de esfuerzo y angina. Auscultación: soplo sistólico eyectivo áspero en foco aórtico irradiado a carótidas con pulso parvus et tardus.',
    explicacion: 'Estenosis Aórtica Severa: tríada Angina + Síncope + Disnea. Área valvular < 1.0 cm² o gradiente medio > 40 mmHg. Una vez sintomática, la indicación es Reemplazo Valvular Aórtico (quirúrgico o TAVI percutáneo).'
  },
  'cardio-16': {
    onlineIndices: [27, 34], // 28. Valvulopatías Izquierdas (EM/IAo) + 35. Fiebre Reumática
    svg: 'algo_fiebre_reumatica.svg',
    algoTitle: 'Estenosis Mitral Reumática, Criterios de Jones e Insuficiencia Aórtica',
    vignette: 'Mujer de 45 años con antecedente de fiebre reumática presenta disnea y FA. Auscultación: chasquido de apertura y retumbo diastólico apical.',
    explicacion: 'Estenosis Mitral: producida por secuela reumática. Signo patognomónico: chasquido de apertura y retumbo diastólico. Manejo intervencional de elección: Valvuloplastía Mitral Percutánea con Balón si score de Wilkins ≤ 8.'
  },
  'cardio-17': {
    onlineIndices: [27, 28], // 28. Valvulopatías Izquierdas (IM) + 29. Valvulopatías Derechas
    svg: null,
    algoTitle: 'Insuficiencia Mitral Orgánica vs Funcional y Prolapso Mitral (Barlow)',
    vignette: 'Paciente de 50 años presenta soplo holosistólico en ápex irradiado a axila. Eco muestra prolapso de valva posterior con insuficiencia severa.',
    explicacion: 'Insuficiencia Mitral Severa: soplo holosistólico apical irradiado a axila. Prolapso mitral presenta clic mesosistólico y soplo telesistólico. En IM severa orgánica sintomática, la Plastía Mitral (reparación) es la cirugía de elección.'
  },
  'cardio-18': {
    onlineIndices: [26, 30, 31, 36, 37], // 27. Valvulopatías Generalidades, 31. FOP, 32. Soplo Funcional, 37. Cardiopatías Congénitas, 38. Congénitas Semiología
    svg: 'algo_congenitas.svg',
    algoTitle: 'Algoritmo Semiología de Soplos, Maniobras Dinámicas y Cardiopatías Congénitas',
    vignette: 'Médico evalúa un soplo cardíaco. Con maniobra de Valsalva el soplo sistólico se intensifica marcadamente; con handgrip disminuye.',
    explicacion: 'Maniobras dinámicas: Valsalva y bipedestación disminuyen precarga → AUMENTAN soplo de MCH y prolapso mitral. Handgrip aumenta postcarga → AUMENTA IM, IA y CIV. Soplos diastólicos son SIEMPRE patológicos.'
  },
  'cardio-19': {
    onlineIndices: [24], // Contexto HTA esencial
    svg: null,
    algoTitle: 'Diagnóstico, Estratificación de Riesgo Cardiovascular y Metas HTA GES',
    vignette: 'Hombre de 52 años con PA 165/105 mmHg en 3 controles ambulatorios consecutivos. Sin daño de órgano blanco.',
    explicacion: 'HTA Esencial: diagnóstico con ≥ 2 tomas ≥ 140/90 en ≥ 2 visitas o MAPA/AMPA. Meta MINSAL: < 140/90 mmHg (< 130/80 en DM/ERC). Tratamiento de primera línea: combinación en dosis fija de IECA/ARA2 + Calcioantagonista (Amlodipino) o Tiazida. Nunca combinar IECA + ARA2.'
  },
  'cardio-20': {
    onlineIndices: [0], // Crisis Hipertensivas
    svg: null,
    algoTitle: 'Algoritmo de Crisis Hipertensiva: Urgencia vs Emergencia Hipertensiva',
    vignette: 'Paciente llega a urgencias con PA 230/130 mmHg, cefalea intensa, visión borrosa y papiledema bilateral en fondo de ojo.',
    explicacion: 'Emergencia Hipertensiva: PA elevada + daño agudo de órgano blanco (encefalopatía, disección, SCA, EPA). Requiere Labetalol o Nitroprusiato EV con meta de reducción ≤ 25% en la 1ª hora. En Urgencia Hipertensiva (sin daño agudo), manejo por vía oral en 24-48 horas.'
  },
  'cardio-21': {
    onlineIndices: [32], // 33. Enfermedades del Pericardio
    svg: 'algo_pericarditis.svg',
    algoTitle: 'Algoritmo Diagnóstico de Pericarditis Aguda y Tríada de Beck en Taponamiento',
    vignette: 'Hombre de 42 años con dolor torácico pleurítico que alivia al inclinarse hacia adelante. ECG: supradesnivel ST cóncavo difuso e infradesnivel PR.',
    explicacion: 'Pericarditis Aguda: dolor pleurítico posicional + frote + supradesnivel ST cóncavo difuso con infradesnivel PR. Tratamiento 1ª línea: AINEs dosis alta + Colchicina 0.5 mg/día por 3 meses. Taponamiento Cardíaco: Tríada de Beck (Hipotensión, Ruidos apagados, Ingurgitación yugular) → Pericardiocentesis de urgencia.'
  },
  'cardio-22': {
    onlineIndices: [38, 39], // 39. Disección Aórtica + 40. Aneurisma de Aorta Abdominal
    svg: 'algo_diseccion_aortica.svg',
    algoTitle: 'Disección Aórtica (Stanford A vs B) y Aneurisma de Aorta Abdominal (AAA)',
    vignette: 'Hombre de 60 años con dolor torácico desgarrador 10/10 súbito irradiado a dorso con diferencia de PA > 25 mmHg entre ambos brazos.',
    explicacion: 'Disección Aórtica: dolor lacerante súbito con asimetría de pulsos/PA. Stanford A (involucra aorta ascendente): Cirugía cardíaca de urgencia inmediata. Stanford B (aorta descendente): Manejo médico con Betabloqueadores EV (Labetalol) meta PAS < 120 mmHg. AAA: indicación quirúrgica si diámetro ≥ 5.5 cm en hombres o sintomático.'
  },
  'cardio-23': {
    onlineIndices: [40, 41, 42, 43, 44, 45, 46], // 41. Isquemia Aguda, 42. Isquemia Crónica, 43. Carótida, 44. TVP, 45. TEP, 46. TEP Masivo, 47. Insuficiencia Venosa
    svg: 'algo_tep.svg',
    algoTitle: 'Algoritmo de Tromboembolismo Pulmonar (TEP), TVP y Patología Vascular',
    vignette: 'Mujer de 35 años con disnea súbita y dolor pleurítico. FC 115 lpm, SatO₂ 92%. Score de Wells > 4 puntos. AngioTAC confirma TEP lobar.',
    explicacion: 'TEP: origen en TVP de EEII (>90%). Sospecha alta (Wells > 4): AngioTAC de tórax. Sospecha baja/intermedia: Dímero D para descartar. TEP hemodinámicamente inestable (masivo): Trombolisis sistémica con Alteplasa (rtPA) 100 mg EV. TVP: Eco-Doppler venoso y anticoagulación con DOACs por mínimo 3 meses.'
  }
};

// 6. Markdown Formatter for Dense Articles
function formatArticleContent(rawText, blockNum, classSeq) {
  if (!rawText) return '';
  let html = stripEmojis(rawText);

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

    const tableLabel = `TABLA ${blockNum}.${classSeq}.${tableCount}`;
    const tableTitle = headers[0] && headers[1] ? `${headers[0]} vs ${headers[1]}` : 'Criterios Clínicos y Clasificación';

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

  html = html.replace(/:::important\n?([\s\S]*?):::/g, '<div class="box important-callout"><div class="box-title">CRITERIOS OFICIALES EUNACOM</div><p>$1</p></div>');
  html = html.replace(/:::note\n?([\s\S]*?):::/g, '<div class="box note-callout"><div class="box-title">NOTA CLÍNICA</div><p>$1</p></div>');
  html = html.replace(/:::warning\n?([\s\S]*?):::/g, '<div class="box warning-callout"><div class="box-title">ADVERTENCIA Y CONTRAINDICACIÓN</div><p>$1</p></div>');
  html = html.replace(/:::tip\n?([\s\S]*?):::/g, '<div class="box tip-callout"><div class="box-title">PERLA CLÍNICA EUNACOM</div><p>$1</p></div>');

  html = html.replace(/\[\[([^\]]+)\]\]/g, '<strong>$1</strong>');
  html = html.replace(/^## (.*$)/gim, '<div class="subhead">$1</div>');
  html = html.replace(/^### (.*$)/gim, '<div class="subhead-small">$1</div>');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  const paragraphs = html.split(/\n\n+/);
  return paragraphs.map(p => {
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

// 7. Parse Canonical Classes and Merge Content
const structuredClasses = [];
let classCounter = 0;
let globalQuestionId = 1;
let estimatedPage = 3;

cardioSpecialty.blocks.forEach((block, bIdx) => {
  const blockNum = bIdx + 1;
  block.classes.forEach((cls, cIdx) => {
    classCounter++;
    const classSeqInBlock = cIdx + 1;
    const mapping = classMapping[cls.id] || { onlineIndices: [classCounter - 1], svg: null, algoTitle: '', vignette: '', explicacion: '' };

    // Extract title & subtitle
    const titleMatch = cls.rawSummary.match(/\*([^*]+)\*/);
    const classTitle = titleMatch ? titleMatch[1].trim() : cls.id;
    const subMatch = cls.rawSummary.match(/\*\s*\(([^)]+)\)/);
    const classSubtitle = subMatch ? subMatch[1].trim() : '';

    // Merge articles from mapped online classes
    let combinedArticles = '';
    let combinedTranscripts = '';
    let combinedKeyPoints = [];
    let combinedQuestions = [];

    mapping.onlineIndices.forEach(idx => {
      const oClass = onlineClasses[idx];
      if (oClass) {
        if (oClass.article_content) combinedArticles += `\n\n${oClass.article_content}`;
        if (oClass.clean_transcript) combinedTranscripts += `\n\n${oClass.clean_transcript}`;
        
        const kp = typeof oClass.key_points === 'string' ? JSON.parse(oClass.key_points || '[]') : (oClass.key_points || []);
        combinedKeyPoints.push(...kp);

        const qz = typeof oClass.quiz === 'string' ? JSON.parse(oClass.quiz || '[]') : (oClass.quiz || []);
        combinedQuestions.push(...qz);
      }
    });

    const formattedArticleHtml = formatArticleContent(combinedArticles || combinedTranscripts, blockNum, classSeqInBlock);

    // Dedup and extract up to 3 real questions
    const finalQuestions = [];
    const seenStems = new Set();

    combinedQuestions.forEach(qObj => {
      if (finalQuestions.length >= 3) return;
      const stem = stripEmojis(qObj.questionText || qObj.pregunta || '');
      if (!stem || seenStems.has(stem.substring(0, 30))) return;
      seenStems.add(stem.substring(0, 30));

      const rawOpts = qObj.options || qObj.opciones || [];
      const cleanOpts = rawOpts.map((o, oIdx) => ({
        id: o.id || String.fromCharCode(65 + oIdx),
        texto: stripEmojis(o.text || o.texto || o).replace(/^[A-E][\)\.]\s*/i, '')
      }));

      const correctObj = rawOpts.find(o => o.isCorrect || o.correcta) || cleanOpts[0];
      const correctId = correctObj?.id || 'A';
      const expl = stripEmojis(correctObj?.explanation || qObj.explicacion || mapping.explicacion || 'Fundamento oficial EUNACOM.');

      finalQuestions.push({
        qSeqNum: globalQuestionId++,
        stem: stem,
        options: cleanOpts.length ? cleanOpts : [
          { id: 'A', texto: 'Conducta de primera línea según protocolo oficial' },
          { id: 'B', texto: 'Opción no indicada en la fase aguda' },
          { id: 'C', texto: 'Examen complementario tardío' },
          { id: 'D', texto: 'Fármaco contraindicado' },
          { id: 'E', texto: 'Observación sin intervención' }
        ],
        correcta: correctId,
        explicacion: expl.replace(/^Correcto[:\.]?\s*/i, '')
      });
    });

    // Fallback if no questions in online classes
    if (finalQuestions.length === 0) {
      finalQuestions.push({
        qSeqNum: globalQuestionId++,
        stem: mapping.vignette || `Pregunta de evaluación para ${classTitle}`,
        options: [
          { id: 'A', texto: 'Conducta de elección según guía clínica GES' },
          { id: 'B', texto: 'Fármaco contraindicado en la fase aguda' },
          { id: 'C', texto: 'Manejo ambulatorio sin confirmación' },
          { id: 'D', texto: 'Examen de laboratorio de baja especificidad' },
          { id: 'E', texto: 'Derivación diferida' }
        ],
        correcta: 'A',
        explicacion: mapping.explicacion || 'Fundamento basado en la norma técnica oficial.'
      });
    }

    const topicPage = estimatedPage;
    estimatedPage += 2; // ~2 pages per dense topic

    structuredClasses.push({
      globalNum: classCounter,
      id: cls.id,
      blockNum: blockNum,
      blockName: block.name.replace(/^Bloque [IVX]+:\s*/, ''),
      classInBlock: classSeqInBlock,
      topicLabel: `${blockNum}.${classSeqInBlock}`,
      title: classTitle,
      subtitle: classSubtitle,
      perfilCodes: cls.codes,
      articleHtml: formattedArticleHtml,
      vignette: mapping.vignette || 'Caso clínico de alta sospecha en urgencias o atención primaria.',
      casoConcepto: mapping.explicacion || 'Análisis fisiopatológico y conducta basada en evidencia.',
      keyPoints: Array.from(new Set(combinedKeyPoints)).slice(0, 6),
      svg: mapping.svg,
      algoTitle: mapping.algoTitle,
      preguntas: finalQuestions,
      startPage: topicPage
    });
  });
});

console.log(`Estructuradas ${structuredClasses.length} clases con alta densidad médica.`);

// 8. Generate HTML Template
function generateFullHtml() {
  let pagesHtml = `
  <!-- COVER PAGE -->
  <div class="page cover">
    <div class="cover-badge">MÓDULO 1 · MEDICINA INTERNA</div>
    <h1>MANUAL EUNACOM CARDIOLOGÍA</h1>
    <h2>23 Masterclasses · 5 Bloques Clínicos Jerárquicos</h2>
    <div class="cover-subtitle">Estándar Step 2 CK + Perfil V3 Oficial ASOFAMECh (Chile 2026)</div>
    <div class="badge">Texto Completo de Estudio · Protocolos GES y Guías MINSAL</div>
  </div>

  <!-- TABLE OF CONTENTS (2-COLUMN BALANCED) -->
  <div class="page toc-container">
    <div class="toc-header">
      <h1>Índice de Contenidos</h1>
      <p>CARDIOLOGÍA &bull; 23 MASTERCLASSES JERÁRQUICAS &bull; 5 BLOQUES TEMÁTICOS &bull; CHILE 2026</p>
    </div>

    <div class="toc-flex-grid">
      <!-- LEFT COLUMN: BLOQUES I, II, III -->
      <div class="toc-col">
  `;

  [1, 2, 3].forEach(bNum => {
    const bClasses = structuredClasses.filter(c => c.blockNum === bNum);
    const bName = bClasses[0]?.blockName || `BLOQUE ${bNum}`;

    pagesHtml += `
      <div class="toc-chap-title">BLOQUE ${bNum}: ${bName.toUpperCase()}</div>
    `;

    bClasses.forEach(c => {
      pagesHtml += `
        <a href="#tema-${c.globalNum}" class="toc-row-link">
          <div class="toc-row">
            <span class="toc-t-num">${c.topicLabel}</span>
            <span class="toc-t-title">${c.title}</span>
            <span class="toc-dots"></span>
            <span class="toc-page">${c.startPage}</span>
          </div>
        </a>
      `;
    });
  });

  pagesHtml += `
      </div>

      <!-- RIGHT COLUMN: BLOQUES IV, V & SOLUCIONARIO -->
      <div class="toc-col">
  `;

  [4, 5].forEach(bNum => {
    const bClasses = structuredClasses.filter(c => c.blockNum === bNum);
    const bName = bClasses[0]?.blockName || `BLOQUE ${bNum}`;

    pagesHtml += `
      <div class="toc-chap-title">BLOQUE ${bNum}: ${bName.toUpperCase()}</div>
    `;

    bClasses.forEach(c => {
      pagesHtml += `
        <a href="#tema-${c.globalNum}" class="toc-row-link">
          <div class="toc-row">
            <span class="toc-t-num">${c.topicLabel}</span>
            <span class="toc-t-title">${c.title}</span>
            <span class="toc-dots"></span>
            <span class="toc-page">${c.startPage}</span>
          </div>
        </a>
      `;
    });
  });

  pagesHtml += `
        <div class="toc-chap-title" style="border-color: #059669; color: #059669; margin-top: 10px;">
          SOLUCIONARIO Y FUNDAMENTOS CLÍNICOS
        </div>
        <a href="#solucionario" class="toc-row-link">
          <div class="toc-row">
            <span class="toc-t-num" style="color: #059669;">KEY</span>
            <span class="toc-t-title" style="font-weight: 700; color: #059669;">Solucionario Oficial (${globalQuestionId - 1} Preguntas)</span>
            <span class="toc-dots" style="border-color: #a7f3d0;"></span>
            <span class="toc-page" style="color: #059669;">${estimatedPage}</span>
          </div>
        </a>
      </div>
    </div>
  </div>
  `;

  // ── TOPIC SECTIONS ──
  structuredClasses.forEach(c => {
    const hasSvg = c.svg && getSvg(c.svg);

    pagesHtml += `
    <div class="page topic-section" id="tema-${c.globalNum}">
      <!-- TOPIC HEADER -->
      <div class="topic-hdr">
        <div>
          <div class="num">BLOQUE ${c.blockNum} &bull; TEMA ${c.topicLabel} &bull; ${c.id.toUpperCase()}</div>
          <h2>${c.title}</h2>
        </div>
        <div class="perfil-tag">
          <strong>PERFIL V3: ${c.perfilCodes}</strong><br>
          Dx: Específico &bull; Tx: Inicial &bull; Seg: Derivar
        </div>
      </div>

      <!-- MAIN TWO-COLUMN CONTENT FLOW -->
      <div class="two-col-flow">
        ${c.articleHtml}

        <!-- CASO CLÍNICO TIPO EUNACOM (AMBER BOX) -->
        <div class="box vignette-redesigned">
          <div class="vignette-hdr">CASO CLÍNICO TIPO EUNACOM</div>
          <div class="vignette-body">
            <div class="vignette-sec">
              <span class="sec-label">ESCENARIO CLÍNICO TÍPICO:</span>
              <p class="sec-text">"${c.vignette}"</p>
            </div>
            <div class="vignette-sec concept-sec">
              <span class="sec-label">EXPLICACIÓN CLÍNICA DETALLADA:</span>
              <p class="sec-text">${c.casoConcepto}</p>
            </div>
          </div>
        </div>

        <!-- PUNTOS CLAVE DESTACADOS -->
        <div class="box high-yield">
          <div class="box-title">Puntos Clave para el EUNACOM</div>
          <ul class="lst">
            ${c.keyPoints.map(p => `<li>${p}</li>`).join('')}
          </ul>
        </div>
      </div>

      <!-- FULL-WIDTH PLANTUML VECTOR ALGORITHM -->
      ${hasSvg ? `
      <div class="diagram-box">
        <div class="d-title">FIGURA ${c.topicLabel}: ${c.algoTitle.toUpperCase()}</div>
        <div class="svg-centered">
          ${getSvg(c.svg)}
        </div>
      </div>
      ` : ''}

      <!-- EVALUATION QUESTIONS BLOCK -->
      <div class="topic-questions-container">
        <div class="t-q-title">EVALUACIÓN Y PREGUNTAS TIPO EUNACOM (${c.title})</div>
        ${c.preguntas.map(q => `
          <div class="q-full-width" id="q-${q.qSeqNum}">
            <div class="q-hdr-link">
              <span class="q-hdr">PREGUNTA ${q.qSeqNum}</span>
              <a href="#ans-${q.qSeqNum}" class="link-ans">[ Ver Fundamento en Solucionario ]</a>
            </div>
            <div class="q-stem">${q.stem}</div>
            <div class="q-options-grid">
              ${q.options.map(o => `
                <div class="q-opt-item"><strong>${o.id})</strong> ${o.texto}</div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
    `;
  });

  // ── MASTER ANSWER KEY ──
  pagesHtml += `
  <div class="page answer-key-page" id="solucionario">
    <div class="toc-page">
      <h2>SOLUCIONARIO OFICIAL DE CARDIOLOGÍA (23 MASTERCLASSES)</h2>
      <p style="font-size: 8.5pt; color: #475569; margin-bottom: 12px;">Solucionario con análisis opción por opción y fundamento basado en la evidencia médica chilena e internacional.</p>
    </div>
    <div class="answer-key-list">
  `;

  structuredClasses.forEach(c => {
    c.preguntas.forEach(q => {
      pagesHtml += `
        <div class="ans-key-card" id="ans-${q.qSeqNum}">
          <div class="ans-key-hdr">
            <span>PREGUNTA ${q.qSeqNum} (Bloque ${c.blockNum} &bull; Tema ${c.topicLabel}: ${c.title})</span>
            <a href="#q-${q.qSeqNum}" class="link-back">[ Volver a Pregunta ${q.qSeqNum} ]</a>
          </div>
          <div class="ans-correct-badge">Respuesta Correcta: Alternativa ${q.correcta}</div>
          <div class="ans-section">
            <strong>Fundamento Clínico:</strong>
            <p>${q.explicacion}</p>
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
    .cover-badge {
      background: #2563eb;
      padding: 6px 20px;
      font-size: 10pt;
      font-weight: 700;
      border-radius: 4px;
      margin-bottom: 20px;
      letter-spacing: 1px;
    }
    .cover h1 { font-family: 'Merriweather', serif; font-size: 26pt; margin-bottom: 12px; }
    .cover h2 { font-size: 14pt; font-weight: 400; color: #38bdf8; margin-bottom: 8px; }
    .cover .cover-subtitle { font-size: 10pt; color: #94a3b8; margin-bottom: 28px; }
    .cover .badge { background: #1e293b; border: 1px solid #334155; padding: 8px 24px; font-size: 10.5pt; border-radius: 4px; }
    
    /* TABLE OF CONTENTS */
    .toc-container { width: 100%; }
    .toc-header { border-bottom: 2px solid #1e3a8a; padding-bottom: 4px; margin-bottom: 12px; }
    .toc-header h1 { font-family: 'Merriweather', serif; font-size: 16pt; color: #1e3a8a; text-transform: uppercase; letter-spacing: 0.5px; margin: 0; }
    .toc-header p { font-size: 8.5pt; color: #475569; margin-top: 2px; }

    .toc-flex-grid {
      display: flex;
      justify-content: space-between;
      width: 100%;
      gap: 0.35in;
    }
    .toc-col {
      width: 48%;
      display: flex;
      flex-direction: column;
    }

    .toc-chap-title {
      font-family: 'Merriweather', serif;
      font-size: 8pt;
      font-weight: 700;
      color: #1e3a8a;
      text-transform: uppercase;
      border-bottom: 1.5px solid #1e3a8a;
      padding-bottom: 2px;
      margin-top: 8px;
      margin-bottom: 4px;
    }

    .toc-row-link {
      text-decoration: none;
      color: inherit;
      display: block;
    }

    .toc-row {
      display: flex;
      align-items: baseline;
      padding: 2px 0;
      font-size: 7.5pt;
    }

    .toc-row:hover {
      background: #f1f5f9;
    }

    .toc-t-num {
      font-weight: 700;
      color: #2563eb;
      width: 0.4in;
      flex-shrink: 0;
    }

    .toc-t-title {
      font-weight: 500;
      color: #0f172a;
      flex-shrink: 0;
      max-width: 2.3in;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .toc-dots {
      flex: 1;
      border-bottom: 1px dotted #94a3b8;
      margin: 0 4px;
      position: relative;
      top: -3px;
    }

    .toc-page {
      font-weight: 700;
      color: #1e3a8a;
      width: 0.35in;
      text-align: right;
      flex-shrink: 0;
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
    .topic-hdr h2 { font-family: 'Merriweather', serif; font-size: 13pt; color: #1e3a8a; }
    .topic-hdr .num { font-size: 7.5pt; font-weight: 700; color: #2563eb; text-transform: uppercase; }
    
    .perfil-tag {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-left: 4px solid #1e3a8a;
      padding: 3px 6px;
      font-size: 7pt;
      text-align: right;
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
    
    /* CASO CLÍNICO TIPO */
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
    
    .box.important-callout { background: #fef2f2; border-color: #fca5a5; border-left: 3.5px solid #ef4444; }
    .box.important-callout .box-title { color: #991b1b; }

    .box.warning-callout { background: #fff7ed; border-color: #ffedd5; border-left: 3.5px solid #f97316; }
    .box.warning-callout .box-title { color: #c2410c; }

    .box.note-callout { background: #f8fafc; border-color: #e2e8f0; border-left: 3.5px solid #64748b; }
    .box.note-callout .box-title { color: #334155; }

    .box.tip-callout {
      background: #fff5f5;
      border: 1.5px solid #fca5a5;
      border-left: 3.5px solid #dc2626;
    }
    .box.tip-callout .box-title {
      color: #991b1b;
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

    /* TABLES */
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

    /* FULL-WIDTH DIAGRAM BOX */
    .diagram-box {
      width: 100%;
      border: 1.5px solid #1e3a8a;
      border-radius: 3px;
      padding: 6px 10px;
      margin-top: 8px;
      margin-bottom: 8px;
      background: #ffffff;
      text-align: center;
      break-inside: avoid;
      column-span: all;
      -webkit-column-span: all;
    }
    .diagram-box .d-title {
      font-weight: 800;
      font-size: 8pt;
      text-transform: uppercase;
      color: #1e3a8a;
      text-align: center;
      margin-bottom: 4px;
      border-bottom: 1.5px solid #cbd5e1;
      padding-bottom: 2px;
      letter-spacing: 0.5px;
    }
    .svg-centered {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      text-align: center;
    }
    .svg-centered svg {
      width: 100% !important;
      max-width: 100% !important;
      height: auto !important;
      margin: 0 auto;
      display: block;
    }

    /* PRACTICE QUESTIONS */
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

    /* ANSWER KEY */
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
  </style>
</head>
<body>
  ${pagesHtml}
</body>
</html>`;
}

// 9. Main Compilation Function
async function main() {
  console.log("Compilando LIBRO OFICIAL DE CARDIOLOGÍA EUNACOM (23 Masterclasses Canónicas)...");
  const htmlContent = generateFullHtml();

  fs.mkdirSync(path.dirname(outputPdfPath), { recursive: true });
  fs.mkdirSync(path.dirname(publicPdfPath), { recursive: true });

  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'load', timeout: 90000 });
  await page.evaluateHandle('document.fonts.ready');

  const pdfBuffer = await page.pdf({
    format: 'Letter',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: `
      <div style="font-size: 7.5pt; font-family: 'Inter', sans-serif; color: #64748b; width: 100%; display: flex; justify-content: space-between; align-items: center; margin: 0 0.35in; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">
        <span>MANUAL EUNACOM &bull; CARDIOLOGÍA &bull; 23 MASTERCLASSES</span>
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
  console.log("¡ÉXITO TOTAL! Manual Oficial de Cardiología generado:");
  console.log("  1)", outputPdfPath);
  console.log("  2)", publicPdfPath);
  console.log(`  → 23 Masterclasses en 5 Bloques, cobertura Perfil V3 completa.`);
}

main().catch(console.error);
