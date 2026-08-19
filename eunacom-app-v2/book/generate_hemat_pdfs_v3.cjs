const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const baseCapitulosDir = path.join(__dirname, 'capitulos_v3');
const classesPath = path.join(__dirname, 'scripts', 'online_classes', 'hematologia_online_classes.json');
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

const hematTopicDefinitions = [
  { chapNum: 9, topicNum: 1, classIdx: 0, svg: 'algo_anemias.svg', algoTitle: 'Algoritmo Diagnóstico de Anemias según VCM e Índice Reticulocitario' },
  { chapNum: 9, topicNum: 2, classIdx: 1, svg: null, algoTitle: null },
  { chapNum: 9, topicNum: 3, classIdx: 2, svg: null, algoTitle: null },
  { chapNum: 9, topicNum: 4, classIdx: 3, svg: null, algoTitle: null },
  { chapNum: 9, topicNum: 5, classIdx: 4, svg: null, algoTitle: null },
  { chapNum: 9, topicNum: 6, classIdx: 5, svg: null, algoTitle: null },
  { chapNum: 9, topicNum: 7, classIdx: 6, svg: null, algoTitle: null },
  { chapNum: 9, topicNum: 8, classIdx: 7, svg: null, algoTitle: null },
  { chapNum: 9, topicNum: 9, classIdx: 8, svg: null, algoTitle: null },
  { chapNum: 9, topicNum: 10, classIdx: 9, svg: null, algoTitle: null },
  { chapNum: 9, topicNum: 11, classIdx: 10, svg: null, algoTitle: null },
  { chapNum: 9, topicNum: 12, classIdx: 11, svg: null, algoTitle: null },
  { chapNum: 9, topicNum: 13, classIdx: 12, svg: null, algoTitle: null },
  { chapNum: 9, topicNum: 14, classIdx: 13, svg: null, algoTitle: null },
  { chapNum: 9, topicNum: 15, classIdx: 14, svg: null, algoTitle: null },
  { chapNum: 9, topicNum: 16, classIdx: 15, svg: null, algoTitle: null },
  { chapNum: 9, topicNum: 17, classIdx: 16, svg: null, algoTitle: null },
  { chapNum: 9, topicNum: 18, classIdx: 17, svg: null, algoTitle: null }
];

const customVignettesMap = {
  1: { vignette: "Mujer de 35 años consulta por astenia progresiva, adinamia y cefalea. Al examen: palidez conjuntival y palmar, FC 98 lpm con soplo sistólico eyectivo I/VI multifocal. Hemograma: Hb 8.8 g/dL, Hematocrito 27%, VCM 74 fL, HCM 24 pg, Leucocitos y Plaquetas normales.", explicacion: "Síndrome Anémico Microcítico Hipocrómico: caracterizado por síntomas de hipoxemia tisular y compensación cardiovascular hiperdinámica. El paso inicial tras el hemograma con VCM bajo (< 80 fL) es solicitar Perfil de Hierro completo (Ferritina, Sideremia, TIBC, Capacidad de fijación y Saturación de Transferrina) e Índice de Producción Reticulocitaria (IPR)." },
  2: { vignette: "Hombre de 65 años en estudio de anemia presenta: Ferritina 14 ng/mL, Sideremia 28 mcg/dL, TIBC 420 mcg/dL y Saturación de Transferrina (IST) 8%. RDW/ADE 17.5%.", explicacion: "Perfil de Hierro Típico de Ferropenia: la Ferritina < 30 ng/mL es el parámetro más sensible y específico de ferropenia verdadera (depósitos agotados). Cursa con TIBC elevada, Sideremia baja, IST < 20% y RDW elevado (anisocitosis)." },
  3: { vignette: "Hombre de 62 años asintomático se realiza chequeo de rutina que evidencia Hemoglobina de 9.4 g/dL con VCM 72 fL y Ferritina de 9 ng/mL. No refiere sangrados visibles por heces ni orina, niega uso de AINEs.", explicacion: "Anemia Ferropénica en Adulto Mayor / Hombre: en hombres adultos y mujeres postmenopáusicas, la anemia ferropénica es SÍNTOMA DE SANGRADO DIGESTIVO hasta demostrar lo contrario. Conducta obligada: Endoscopia Digestiva Alta (EDA) y Colonoscopía total para descartar Cáncer Gástrico y Cáncer Colorrectal. Tratamiento: Sulfato ferroso oral 200 mg/d (60 mg Fe elemental) en ayunas con jugo de naranja (Vitamina C) por 3-6 meses post normalización de Hb." },
  4: { vignette: "Mujer de 54 años con Artritis Reumatoide activa de larga data presenta anemia moderada (Hb 10.1 g/dL, VCM 82 fL). Perfil de hierro: Ferritina 380 ng/mL (elevada), Sideremia 35 mcg/dL (baja), TIBC 210 mcg/dL (baja), IST 16%.", explicacion: "Anemia por Enfermedades Crónicas / Inflamación: causada por la elevación de Hepcidina inducida por citoquinas inflamatorias (IL-6), lo que bloquea la salida de hierro desde los macrófagos hacia el plasma. Caracterizada por Ferritina normal o alta (reactante de fase aguda) con TIBC disminuida. Tratamiento: optimizar el control de la enfermedad inflamatoria de base (no responde a hierro oral)." },
  5: { vignette: "Mujer de 30 años con antecedente de Lupus Eritematoso Sistémico consulta por astenia, ictericia escleral e ictericia cutánea leve sin coluria ni acolia. Hemograma: Hb 7.8 g/dL, VCM 98 fL, Reticulocitos 6.5% (IPR 3.8%). Laboratorio: LDH 920 UI/L, Bilirrubina Total 4.2 mg/dL (Indirecta 3.6 mg/dL), Haptoglobina < 5 mg/dL (indetectable). Test de Coombs Directo positivo (IgG + C3d).", explicacion: "Anemia Hemolítica Autoinmune (AHAI) por Anticuerpos Calientes (IgG): tríada de Anemia + Ictericia a expensas de Bilirrubina Indirecta + Reticulocitosis marcada (regenerativa), con LDH elevada y Haptoglobina consumida. Coombs directo positivo confirma el mecanismo inmunológico. Tratamiento de primera línea: Corticoides sistémicos a dosis altas (Prednisona 1-1.5 mg/kg/día). Ácido fólico de mantención." },
  6: { vignette: "Hombre de 68 años con antecedente de gastrectomía total hace 4 años consulta por astenia y parestesias en guante y calcetín en extremidades con inestabilidad de la marcha. Hemograma: Hb 8.2 g/dL, VCM 118 fL (macrocítica franca), Leucocitos 3.200/mm³, Plaquetas 110.000/mm³. Frotis sanguíneo: Neutrófilos polimorfonucleares hipersegmentados (pleocariocitos).", explicacion: "Anemia Megaloblástica por Déficit de Vitamina B12: la gastrectomía total elimina la producción de Factor Intrínseco por las células parietales gástricas, agotando las reservas hepáticas de B12 en 3-5 años. Cursa con macrocitosis, pancitopenia leve, pleocariocitos y COMPROMISO NEUROLÓGICO (Degeneración combinada subaguda de la médula espinal). Tratamiento: Vitamina B12 (Cianocobalamina/Hidroxocobalamina) 1000 mcg IM diaria por 1 semana, luego semanal por 1 mes, y luego mensual de por vida." },
  7: { vignette: "Hombre de 22 años de ascendencia afrodescendiente consulta por dolor óseo agudo e intenso en extremidades y tórax tras cuadro respiratorio viral. Al examen: subictericia escleral, palidez, dolor a la palpación de huesos largos. Hemograma muestra anemia con VCM normal y frotis sanguíneo con eritrocitos en forma de hoz o medialuna (drepanocitos).", explicacion: "Anemia de Células Falciformes (Drepanocitosis): mutación puntual en gen de globina beta (HbS). La desoxigenación causa polimerización de la HbS, deformando los hematíes en hoz y provocando oclusión microvascular e isquemia tisular (crisis vasooclusivas dolorosas). Manejo agudo: Hidratación EV enérgica + Oxigenoterapia + Analgesia con Opioides potentes (Morfina) + Tratamiento de infecciones desencadenantes. Prevención crónica: Hidroxiurea." },
  8: { vignette: "Hombre de 60 años con Enfermedad Renal Crónica etapa 4 (VFG 22 mL/min/1.73m²) presenta Hb de 8.6 g/dL normocítica normocrómica arregenerativa. Perfil de hierro: Ferritina 280 ng/mL, IST 28%.", explicacion: "Anemia de la Enfermedad Renal Crónica: secundaria al déficit relativo y absoluto de síntesis de Eritropoyetina (EPO) por las células peritubulares renales dañadas. Indicación de Agentes Estimulantes de la Eritropoyesis (Eritropoyetina humana recombinante o Darbepoetina alfa): cuando la Hb es < 10 g/dL, habiendo descartado y corregido previamente la ferropenia (Ferritina meta > 200 ng/mL e IST > 20%). Meta de Hb: 10 - 11.5 g/dL (no superar 12-13 g/dL por riesgo trombótico cardiovascular)." },
  9: { vignette: "Hombre de 72 años con antecedentes de cardiopatía coronaria e infarto previo ingresa por neumonía. Se encuentra hemodinámicamente estable (PA 120/75, FC 80 lpm), sin angina ni disnea. El hemograma de ingreso muestra Hb de 7.4 g/dL.", explicacion: "Criterios Transfusionales de Glóbulos Rojos: en pacientes hospitalizados hemodinámicamente estables con antecedente de enfermedad cardiovascular, el umbral transfusional restrictivo recomendado por guías es Hb < 8.0 g/dL (y < 7.0 g/dL en pacientes sin cardiopatía). 1 unidad de Concentrado de Glóbulos Rojos (CGR) aumenta aproximadamente 1 g/dL la Hb y 3% el hematocrito en un adulto de 70 kg." },
  10: { vignette: "Lactante de 6 meses, nacido de término con peso adecuado, alimentado con lactancia materna exclusiva sin suplementos previos. Acude a control de salud. La madre pregunta sobre prevención de anemia.", explicacion: "Prevención de Anemia Ferropénica en Lactantes (Norma MINSAL Chile): en recién nacidos de término con lactancia materna exclusiva, los depósitos fetales de hierro se agotan hacia el 4°-6° mes de vida. Se indica suplementación profiláctica universal con Hierro elemental (Sulfato ferroso gotas a 1 mg/kg/día) desde los 4 meses hasta el año de vida. En prematuros o bajo peso al nacer (< 2500g), la profilaxis se inicia antes, a los 2 meses de vida a 2-4 mg/kg/día." },
  11: { vignette: "Mujer de 25 años consulta por epistaxis frecuentes, gingivorragia al cepillarse los dientes y petequias en piernas. Examen: petequias y equimosis cutáneas múltiples, sin esplenomegalia ni hemartrosis. Tiempo de sangría prolongado, recuento plaquetario 35.000/mm³, TP y TTPA normales.", explicacion: "Trastorno de la Hemostasia Primaria: caracterizado por hemorragias mucocutáneas superficiales (petequias, púrpura, epistaxis, metrorragia) y alteración plaquetaria / tiempo de sangría. En contraste, los trastornos de la hemostasia secundaria (factores de coagulación como hemofilia) producen hematomas musculares profundos y hemartrosis con alteración del TP o TTPA." },
  12: { vignette: "Hombre de 42 años consulta por aparición de lesiones eritematosas redondeadas puntiformes en piernas y tobillos que NO desaparecen a la vitropresión y se palpan claramente al tacto (púrpura palpable). Plaquetas: 240.000/mm³ (normales).", explicacion: "Púrpura Palpable: es el signo cardinal de Vasculitis de Vaso Pequeño (leucocitoclástica, Vasculitis por IgA, crioglobulinemia o ANCA). Las lesiones púrpuras que se palpan son causadas por necrosis fibrinoide e inflamación de la pared vascular con extravasación eritrocitaria, a diferencia de la púrpura no palpable (petequias planas) típica de trombocitopenia." },
  13: { vignette: "Mujer de 22 años sin antecedentes mórbidos consulta por petequias en extremidades inferiores y gingivorragia de 3 días de evolución. Examen físico normal, sin adenopatías ni esplenomegalia. Hemograma: Plaquetas 18.000/mm³, Hb 13.5 g/dL, Leucocitos 6.800/mm³. Frotis sanguíneo: trombocitopenia severa con plaquetas gigantes sin blastos ni esquistocitos.", explicacion: "Trombocitopenia Inmune Primaria (PTI): destrucción autoinmune periférica de plaquetas mediada por autoanticuerpos anti-glicoproteínas plaquetarias (GPIIb/IIIa). Es un diagnóstico de exclusión (trombocitopenia aislada con frotis normal y examen sin organomegalias). Indicación de tratamiento: Plaquetas < 20.000-30.000/mm³ o sangrado mucoso activo. Primera línea: Corticoides orales (Prednisona 1 mg/kg/d o Dexametasona 40 mg/d x 4d) o Inmunoglobulina EV (IgEV) si urgencia hemorrágica." },
  14: { vignette: "Mujer de 35 años es traída a urgencias por confusión fluctuante y cefalea de 24 horas. Examen: temperatura 38.2 °C, palidez intensa, ictericia y petequias difusas. Laboratorio: Hb 6.9 g/dL, Plaquetas 12.000/mm³, LDH 1450 UI/L, Bilirrubina indirecta elevada, Creatinina 2.3 mg/dL. Frotis sanguíneo: abundantes esquistocitos (3.5%). TP y TTPA normales. Test de Coombs directo negativo.", explicacion: "Púrpura Trombocitopénica Trombótica (PTT): emergencia hematológica definida por la Péntada de Moschcowitz: (1) Trombocitopenia severa de consumo; (2) Anemia hemolítica microangiopática con esquistocitos; (3) Síntomas neurológicos fluctuantes; (4) Falla renal aguda; (5) Fiebre. Causada por deficiencia de la metaloproteasa ADAMTS13. Conducta urgente inmediata: Plasmaféresis terapéutica (recambio plasmático) con infusión de plasma fresco congelado + Corticoides EV. CONTRAINDICADA la transfusión de plaquetas (empeora las trombosis microvasculares)." },
  15: { vignette: "Niño de 6 años presenta cuadro de 4 días de dolor abdominal cólico intermitente, dolor e inflamación en ambos tobillos y rodillas, y aparición de lesiones maculopapulares eritematosas palpables simétricas en glúteos y cara posterior de piernas, 2 semanas después de una faringitis aguda. Sedimento de orina: hematuria microscópica y proteinuria leve. Hemograma con plaquetas normales (280.000/mm³).", explicacion: "Vasculitis por IgA (Púrpura de Schönlein-Henoch): vasculitis leucocitoclástica por depósito de inmunocomplejos IgA más frecuente en pediatría. Tétrada clásica: Púrpura palpable de predominio en EEII y glúteos + Artralgias/artritis no erosiva + Dolor abdominal (por isquemia submucosa, riesgo de invaginación intestinal) + Nefritis por IgA. Las plaquetas son estrictamente normales. Manejo: reposo, analgesia con AINEs/Paracetamol y seguimiento de función renal y PA por 6 meses." },
  16: { vignette: "Mujer de 20 años consulta por menorragias abundantes desde la menarquia que duran 8 días, y antecedentes de epistaxis frecuentes y sangrado prolongado tras extracción dental. Antecedente materno de sangrado fácil. Laboratorio: Hemograma y recuento de plaquetas normales (220.000/mm³), TP normal, TTPA levemente prolongado (42 seg, control 30s), Tiempo de sangría / Tiempo de oclusión PFA-100 marcadamente prolongado.", explicacion: "Enfermedad de Von Willebrand (EvW): la coagulopatía hereditaria más frecuente (autosómica dominante). El Factor von Willebrand permite la adhesión plaquetaria al subendotelio y transporta/estabiliza al Factor VIII en plasma (de ahí el TTPA prolongado). Tratamiento de episodios hemorrágicos: Desmopresina (DDAVP nasal o EV, libera FvW endógeno desde los cuerpos de Weibel-Palade) en EvW tipo 1, o concentrados de FvW/Factor VIII en casos severos o tipo 2/3. Ácido tranexámico (antifibrinolítico) como coadyuvante." },
  17: { vignette: "Niño de 3 años presenta aumento de volumen doloroso, caliente y con impotencia funcional severa en la rodilla derecha tras una caída leve mientras jugaba (hemartrosis). Antecedente de tío materno con problemas de sangrado. Laboratorio: Recuento plaquetario normal (310.000/mm³), Tiempo de Protrombina (TP) normal (100%), TTPA marcadamente prolongado (68 seg, control 28s) que corrige completamente al mezclar con plasma normal.", explicacion: "Hemofilia A (Déficit de Factor VIII) / Hemofilia B (Déficit de Factor IX): coagulopatías congénitas graves con herencia recesiva ligada al cromosoma X (afectan casi exclusivamente a varones transmitidas por madres portadoras). Clínica cardinal: Hemartrosis espontáneas o post-trauma menor en rodillas, codos y tobillos, y hematomas musculares profundos. Diagnóstico: TTPA prolongado que corrige con plasma normal y dosificación específica de Factor VIII o IX. Tratamiento: Infusión inmediata de concentrado recombinante del factor deficitario." },
  18: { vignette: "Mujer de 32 años ingresa a UTI por sepsis grave secundaria a pielonefritis aguda por E. coli. Presenta sangrado en sitios de punción venosa, hematuria macroscópica y petequias difusas. Laboratorio: Plaquetas 32.000/mm³ (consumo), TP prolongado (INR 2.4), TTPA prolongado (62 seg), Fibrinógeno 65 mg/dL (marcadamente bajo, normal 200-400), Dímero D > 20.000 ng/mL (muy elevado) y presencia de esquistocitos en frotis.", explicacion: "Coagulación Intravascular Diseminada (CID) Aguda Descompensada: activación descontrolada y masiva de la cascada de la coagulación que genera microtrombos diseminados y simultáneamente coagulopatía de consumo y sangrado profuso. Diagnóstico: Trombocitopenia + Fibrinógeno bajo + TP y TTPA prolongados + Dímero D / PDF extremadamente elevados. Tratamiento: PRIORIDAD es el tratamiento agresivo de la causa subyacente (Antibióticos EV para sepsis). Soporte hemoterápico si sangrado: Transfusión de Plaquetas si < 50.000 con sangrado, Plasma Fresco Congelado (PFC) para coagulopatía y Crioprecipitados si Fibrinógeno < 100-150 mg/dL." }
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
  
  .topic-hdr { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #831843; padding-bottom: 4px; margin-bottom: 8px; }
  .topic-hdr h2 { font-family: 'Merriweather', serif; font-size: 13.5pt; color: #831843; }
  .topic-hdr .num { font-size: 8pt; font-weight: 700; color: #be185d; text-transform: uppercase; }
  .perfil-tag { background: #fdf2f8; border: 1px solid #fce7f3; border-left: 4px solid #db2777; padding: 3px 6px; font-size: 7.5pt; }

  .two-col-flow { column-count: 2; column-gap: 0.2in; width: 100%; }
  
  .box { border: 1px solid #cbd5e1; border-radius: 2px; padding: 5px 7px; margin-top: 5px; margin-bottom: 5px; font-size: 8pt; width: 100%; break-inside: avoid; }
  .box-title { font-weight: 700; font-size: 7.5pt; text-transform: uppercase; margin-bottom: 2px; letter-spacing: 0.5px; }
  .box.high-yield { background: #f8fafc; border-left: 3.5px solid #db2777; break-inside: avoid; }
  .box.high-yield .box-title { color: #be185d; }

  .box.vignette-redesigned { background: #fffdf5; border: 1.5px solid #f59e0b; border-radius: 3px; padding: 0; margin-top: 6px; margin-bottom: 6px; overflow: hidden; break-inside: avoid; }
  .vignette-hdr { background: #d97706; color: #ffffff; font-weight: 700; font-size: 8pt; padding: 3.5px 8px; text-transform: uppercase; letter-spacing: 0.5px; }
  .vignette-body { padding: 6px 8px; }
  .vignette-sec { margin-bottom: 4px; }
  .vignette-sec.concept-sec { border-top: 1px dashed #fcd34d; padding-top: 4px; margin-bottom: 0; }
  .sec-label { font-weight: 700; font-size: 7.5pt; color: #92400e; display: block; margin-bottom: 2px; }
  .sec-text { font-size: 8pt; line-height: 1.35; color: #1e293b; }

  .box.summary-fullwidth { width: 100%; background: #fdf2f8; border: 1.5px solid #db2777; border-radius: 3px; padding: 0; margin-top: 10px; margin-bottom: 6px; overflow: hidden; break-inside: avoid; }
  .summary-hdr { background: #db2777; color: #ffffff; font-weight: 700; font-size: 8.5pt; padding: 4px 10px; text-transform: uppercase; letter-spacing: 0.5px; }
  .summary-body { padding: 8px 10px; font-size: 8.5pt; line-height: 1.4; color: #9d174d; }

  .box.important-callout { background: #fef2f2; border-color: #fca5a5; border-left: 3.5px solid #ef4444; }
  .box.important-callout .box-title { color: #991b1b; }
  .box.warning-callout { background: #fff7ed; border-color: #ffedd5; border-left: 3.5px solid #f97316; }
  .box.warning-callout .box-title { color: #c2410c; }
  .box.note-callout { background: #f8fafc; border-color: #e2e8f0; border-left: 3.5px solid #64748b; }
  .box.note-callout .box-title { color: #334155; }
  .box.tip-callout { background: #fff5f5; border: 1.5px solid #fca5a5; border-left: 3.5px solid #dc2626; }
  .box.tip-callout .box-title { color: #991b1b; }
  .box.tip-callout p { color: #7f1d1d; }

  .subhead { font-family: 'Merriweather', serif; font-size: 9.5pt; font-weight: 700; color: #831843; margin: 8px 0 4px 0; border-bottom: 1px solid #cbd5e1; padding-bottom: 1px; break-after: avoid; }
  .subhead-small { font-family: 'Inter', sans-serif; font-size: 8.5pt; font-weight: 700; color: #0f172a; margin: 6px 0 3px 0; break-after: avoid; }
  p.txt { font-size: 8pt; line-height: 1.35; margin-bottom: 4px; text-align: justify; }
  ul.lst { padding-left: 12px; margin-bottom: 4px; }
  ul.lst li { font-size: 8pt; margin-bottom: 2px; }

  .tbl-container { width: 100%; margin: 6px 0; break-inside: avoid; }
  .tbl-hdr { font-weight: 700; font-size: 7.5pt; color: #831843; background: #fdf2f8; padding: 3px 6px; border: 1px solid #cbd5e1; border-bottom: none; text-transform: uppercase; letter-spacing: 0.5px; }
  .tbl-hdr .tbl-num { color: #db2777; }
  table.tbl { width: 100%; border-collapse: collapse; font-size: 7.5pt; border: 1px solid #cbd5e1; border-top: 1.5px solid #831843; border-bottom: 1.5px solid #831843; }
  table.tbl th { background: #fdf2f8; color: #831843; padding: 4px 5px; text-align: left; font-size: 7pt; text-transform: uppercase; font-weight: 700; border-bottom: 1px solid #cbd5e1; }
  table.tbl td { padding: 4px 5px; border-bottom: 1px solid #e2e8f0; vertical-align: top; line-height: 1.3; }
  table.tbl tr:nth-child(even) td { background: #f8fafc; }

  .diagram-box { width: 100%; border: 1px solid #831843; border-radius: 2px; padding: 5px 8px; margin-top: 6px; margin-bottom: 6px; background: #ffffff; text-align: center; break-inside: avoid; }
  .diagram-box .d-title { font-weight: 700; font-size: 8pt; text-transform: uppercase; color: #831843; text-align: center; margin-bottom: 4px; border-bottom: 1px solid #cbd5e1; padding-bottom: 2px; }
  .svg-centered { display: flex; justify-content: center; align-items: center; width: 100%; text-align: center; }
  .svg-centered svg { max-width: 100%; height: auto; margin: 0 auto; display: block; }

  .topic-questions-container { width: 100%; margin-top: 8px; break-inside: avoid; }
  .t-q-title { font-weight: 700; font-size: 8pt; color: #831843; text-transform: uppercase; border-bottom: 1.5px solid #831843; padding-bottom: 2px; margin-bottom: 4px; }
  .q-full-width { width: 100%; background: #ffffff; border: 1px solid #cbd5e1; border-left: 3.5px solid #db2777; border-radius: 2px; padding: 5px 8px; margin-bottom: 5px; break-inside: avoid; }
  .q-hdr-link { display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px; }
  .q-full-width .q-hdr { font-weight: 700; font-size: 8pt; color: #db2777; text-transform: uppercase; letter-spacing: 0.5px; }
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
  console.log(`Generando PDFs para Capítulo 9: Hematología (18 temas)...`);

  const chapDirV3 = path.join(baseCapitulosDir, 'Capitulo_9_Hematologia');
  if (!fs.existsSync(chapDirV3)) fs.mkdirSync(chapDirV3, { recursive: true });

  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  for (const tDef of hematTopicDefinitions) {
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
      explicacion: "Manejo clínico según protocolo hematológico EUNACOM."
    };

    const topicObj = {
      chapNum: tDef.chapNum,
      topicNumInChap: tDef.topicNum,
      topicLabel,
      title: rawClass.topic,
      perfilCode: rawClass.eunacom_code || `1.05.${tDef.topicNum < 10 ? '0' + tDef.topicNum : tDef.topicNum}`,
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
          <div style="font-size: 7.5pt; font-family: 'Inter', sans-serif; color: #db2777; width: 100%; display: flex; justify-content: space-between; align-items: center; margin: 0 0.35in; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">
            <span>MANUAL EUNACOM &bull; CAPÍTULO ${topicLabel} &bull; HEMATOLOGÍA</span>
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
  console.log(`\n🎉 Capítulo 9: Hematología (18 temas) generado con éxito!`);
}

main().catch(console.error);
