const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const baseCapitulosDir = path.join(__dirname, 'capitulos');

// Read live online classes & question bank
const onlineClasses = JSON.parse(fs.readFileSync(path.join(__dirname, 'cardio_online_classes.json'), 'utf8'));
const bankRaw = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'public', 'data', 'pruebas', 'modulo-1-cardiologia.json'), 'utf8'));
const questionBank = Array.isArray(bankRaw) ? bankRaw : (bankRaw.pruebas || []);

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

const diagramMap = {
  1: { svg: 'algo_urgencias.svg', title: 'Algoritmo de Manejo de Urgencias en Arritmias' },
  2: { svg: 'algo_pcr.svg', title: 'Algoritmo de Soporte Vital Avanzado (ACLS)' },
  4: { svg: 'algo_bav.svg', title: 'Algoritmo Diagnóstico y Terapéutico de Bloqueos AV' },
  5: { svg: 'algo_fa.svg', title: 'Estrategia Global AF-CARE de Manejo de Fibrilación Auricular' },
  12: { svg: 'algo_tpsv.svg', title: 'Algoritmo de Manejo de TPSV en Urgencias' },
  13: { svg: 'algo_tv.svg', title: 'Algoritmo de Taquicardia de QRS Ancho' }
};

const customVignettesMap = {
  1: {
    vignette: "Mujer de 60 años con estenosis mitral severa presenta palpitaciones y disnea aguda. Al examen: PA 85/40 mmHg, FC 150 lpm irregular, edema pulmonar agudo. ECG revela taquicardia de complejo QRS angosto irregular compatible con fibrilación auricular con respuesta ventricular rápida.",
    explicacion: "En cualquier taquiarritmia o bradiarritmia en urgencias, la presencia de compromiso hemodinámico (hipotensión/shock, angina isquémica, compromiso agudo de conciencia o insuficiencia cardíaca aguda) exige la realización de Cardioversión Eléctrica Sincronizada inmediata (o marcapaso de urgencia en bradiarritmias). No se debe diferir la intervención eléctrica para administrar fármacos antiarrítmicos."
  },
  2: {
    vignette: "Hombre de 55 años sufre colapso súbito en la vía pública. Al llegar el equipo de emergencia se constata paro cardiorrespiratorio. El monitor electrocardiográfico muestra Fibrilación Ventricular (FV). Se realiza la primera descarga eléctrica de 200 J.",
    explicacion: "En el algoritmo de RCP Avanzado (ACLS) para ritmos desfibrilables (FV / TV sin pulso), tras la 1ª descarga eléctrica se debe reanudar de inmediato la RCP de alta calidad durante 2 minutos. Si la FV persiste a la 2ª descarga, se administra Adrenalina 1 mg EV bolo cada 3-5 min. Si persiste tras la 3ª descarga, se indica Amiodarona 300 mg EV bolo como antiarrítmico de primera línea."
  },
  3: {
    vignette: "Enfermero presenciar el colapso súbito de un adulto en la sala de espera del hospital. El paciente no responde y no respira normalmente.",
    explicacion: "Ante un paro cardiorrespiratorio presenciado en un adulto, la primera acción inmediata es evaluar la capacidad de respuesta, pedir ayuda y solicitar un Desfibrilador Externo Automático (DEA), e iniciar compresiones torácicas ininterrumpidas de alta calidad a una frecuencia de 100-120 cpm y profundidad de 5-6 cm, minimizando las interrupciones."
  },
  4: {
    vignette: "Hombre de 78 años consulta por astenia severa y síncope de esfuerzo. El ECG demuestra disociación aurículoventricular completa con ráfagas de ondas P a 75 cpm y complejos QRS anchos a 32 cpm sin relación entre sí.",
    explicacion: "El Bloqueo AV de 3er Grado (Completo) se caracteriza por la disociación AV total. En presencia de síntomas o inestabilidad, la Atropina 1 mg EV es una medida puente inicial (efectiva principalmente en bloqueos nodales), pero el tratamiento definitivo de elección es la instalación inmediata de Marcapaso Transitorio y la derivación para Marcapaso Definitivo."
  },
  5: {
    vignette: "Hombre de 68 años consulta por palpitaciones irregulares de 3 semanas de evolución. En el ECG no se observan ondas P y los intervalos R-R son completamente irregulares a una FC promedio de 115 lpm.",
    explicacion: "La Fibrilación Auricular es la arritmia sostenida más frecuente. El diagnóstico ECG requiere la ausencia de ondas P y un ritmo irregularmente irregular. En el paciente estable, el manejo requiere controlar la frecuencia ventricular (betabloqueadores/calcioantagonistas) y evaluar el riesgo tromboembólico mediante CHA₂DS₂-VASc para iniciar anticoagulación oral continua."
  },
  6: {
    vignette: "Mujer de 52 años sin antecedentes mórbidos ni cardiopatía estructural consulta por primer episodio de fibrilación auricular de 6 horas de evolución. Se encuentra hemodinámicamente estable.",
    explicacion: "En la FA de reciente comienzo (<48h) en pacientes con corazón sano (sin cardiopatía estructural ni isquemia), la cardioversión farmacológica para restaurar el ritmo sinusal se realiza preferentemente con Antiarrítmicos Clase Ic (Flecainida o Propafenona). Si existiera cardiopatía estructural o falla cardíaca, los Clase Ic están contraindicados y se debe usar Amiodarona."
  },
  7: {
    vignette: "Hombre de 72 años con FA crónica, hipertenso y diabético (CHA₂DS₂-VASc = 4 puntos). Se analiza la indicación de profilaxis tromboembólica primaria.",
    explicacion: "En pacientes con FA no valvular y CHA₂DS₂-VASc ≥ 2 en hombres (o ≥ 3 en mujeres), la Anticoagulación Oral permanente está fuertemente indicada. Los Anticoagulantes Orales Directos (DOACs: Apixabán, Rivaroxabán, Dabigatrán) son de primera elección sobre los AVK (Warfarina/Acenocumarol) por menor riesgo de hemorragia intracraneal y no requerir ajuste continuo de INR."
  },
  8: {
    vignette: "Paciente de 65 años con FA recurrente sintomática evaluado para definir la estrategia terapéutica global según las guías clínicas internacionales AF-CARE.",
    explicacion: "El esquema AF-CARE abarca: C (Comorbilidades e hipertensión), A (Anticoagulación para prevención de ACV), R (Reducción de síntomas mediante control de Ritmo o Frecuencia), y E (Evaluación continua). Si el paciente se inestabiliza en cualquier momento, se realiza cardioversión eléctrica de urgencia."
  },
  9: {
    vignette: "Hombre de 75 años con FA permanente aceptada de larga data. Se encuentra asintomático en reposo con FC 90 lpm bajo atenolol 50 mg/día.",
    explicacion: "En la FA Crónica/Permanente no se intentan más procedimientos de cardioversión. Las dos metas terapéuticas permanentes son: 1) Control de frecuencia ventricular (meta FC < 110 lpm en reposo con betabloqueadores o verapamilo); y 2) Anticoagulación oral continua si CHA₂DS₂-VASc lo indica."
  },
  10: {
    vignette: "Mujer de 61 años consulta por palpitaciones de 12 horas de evolución. ECG confirma FA con respuesta rápida 130 lpm. No presenta fallas estructurales previas.",
    explicacion: "En la FA de reciente comienzo (<48h de evolución), el riesgo de tromboembolismo poscardioversión es bajo, permitiendo la cardioversión (eléctrica o farmacológica) inmediata tras iniciar anticoagulación de acción rápida. Si la FA dura >48h o se desconoce el tiempo, se requiere anticoagulación efectiva por 3 semanas previas antes de intentar la cardioversión."
  },
  11: {
    vignette: "Hombre de 63 años consulta por palpitaciones regulares. El ECG muestra ondas 'F' en dientes de serrucho continuas en derivaciones inferiores (DII, DIII, aVF) con conducción AV regular 2:1 y FC 150 lpm.",
    explicacion: "El Flutter Auricular Típico es una macrorreentrada a nivel del istmo cavotricuspídeo auricular derecho. Presenta ondas 'F' negativas en serrucho en DII, DIII, aVF a 300 cpm con respuesta ventricular regular a 150 lpm (2:1). El tratamiento curativo definitivo de elección es la Ablación por Radiofrecuencia del istmo. La anticoagulación sigue los mismos criterios CHA₂DS₂-VASc de la FA."
  },
  12: {
    vignette: "Mujer de 28 años sin antecedentes presenta inicio súbito de palpitaciones regulares y mareos tras ingesta de café. ECG: taquicardia regular de complejo angosto (QRS < 0.12s) a 180 lpm sin ondas P visibles.",
    explicacion: "La Taquicardia Paroxística Supraventricular (TPSV) se produce más frecuentemente por Reentrada Nodal. En el paciente hemodinámicamente estable, el manejo escalonado inicial es: 1) Maniobras Vagales (masaje del seno carotídeo o Valsalva modificada); 2) Adenosina 6 mg EV en bolo rápido; 3) Verapamilo 5 mg EV o Betabloqueadores."
  },
  13: {
    vignette: "Hombre de 60 años con antecedente de infarto previo consulta por palpitaciones e intolerancia al esfuerzo. ECG evidencia taquicardia regular de complejo QRS ancho (QRS 0.16s) a 160 lpm.",
    explicacion: "Toda taquicardia de QRS ancho (>0.12s) debe manejarse como Taquicardia Ventricular (TV) hasta demostrar lo contrario, especialmente en pacientes con cardiopatía isquémica previa. Si el paciente está estable, se trata con Amiodarona 150 mg EV infundidos en 10 min o Procainamida. Si está inestable, se indica Cardioversión Eléctrica Sincronizada inmediata."
  },
  14: {
    vignette: "Hombre de 45 años asintomático realiza chequeo preventivo. El Holter de 24 horas muestra 450 extrasístoles ventriculares aisladas, monomórficas, sin dupletas ni rachas de TV. Ecocardiograma normal.",
    explicacion: "Las Extrasístoles Ventriculares (EV) en pacientes con corazón sano y ecocardiograma normal son benignas y no incrementan la mortalidad. Si el paciente está asintomático, NO se tratan con antiarrítmicos. Si generan síntomas molestos o palmitaciones frecuentes, los Betabloqueadores a dosis bajas son el tratamiento sintomático de elección."
  },
  15: {
    vignette: "Hombre de 64 años, diabético e hipertenso, consulta por dolor retroesternal opresivo de 3 meses de evolución que desencadena al caminar 2 cuadras y cede en 5 minutos de reposo. ECG de reposo es normal. Test de esfuerzo positivo a los 6 minutos.",
    explicacion: "La Angina Estable Crónica presenta dolor retroesternal desencadenado por el ejercicio y aliviado por el reposo o nitroglicerina sublingual. El tratamiento médico óptimo para reducir mortalidad incluye Aspirina 100 mg/día, Estatinas de alta potencia (Atorvastatina 80 mg) y Betabloqueadores como antianginoso. La coronariografía se reserva para test de esfuerzo de alto riesgo o refractariedad sintomática."
  },
  16: {
    vignette: "Hombre de 58 años es traído a urgencias por dolor torácico intenso de 45 minutos. El médico debe descarta sistemáticamente las 5 causas letales de dolor torácico.",
    explicacion: "Frente a dolor torácico agudo en urgencias, la primera medida obligatoria es un ECG de 12 derivaciones en <10 minutos. Se debe descartar rápidamente las 5 emergencias torácicas mortales: Síndrome Coronario Agudo, Disección Aórtica, Tromboembolismo Pulmonar, Neumotórax a Tensión y Rotura Esofágica."
  },
  17: {
    vignette: "Hombre de 62 años consulta por dolor torácico opresivo de 2 horas. ECG muestra supradesnivel del segmento ST de 3 mm en DII, DIII y aVF, con infradesnivel especular en DI y aVL.",
    explicacion: "El supradesnivel ST ≥ 1 mm en ≥2 derivaciones contiguas confirma IAMSDST. La pared inferior se evalúa en DII, DIII y aVF (coronaria derecha). Es obligatorio tomar derivaciones derechas (V3R-V4R) para descartar compromiso del VD. La conducta prioritaria es la reperfusión miocárdica inmediata (Angioplastia Primaria <120 min o Fibrinólisis)."
  },
  18: {
    vignette: "Mujer de 70 años diabética consulta por disnea súbita y malestar epigástrico de 3 horas. No presenta dolor torácico típico.",
    explicacion: "En ancianos, mujeres y diabéticos, el SCA suele presentarse con síntomas atípicos ('equivalentes anginosos'). La Troponina T/I ultrasensible es el biomarcador de elección con curva a las 0 y 3h. Para detectar reinfarto precoz (<14 días), la CK-MB es el marcador útil pues se normaliza en 48-72h mientras la troponina sigue elevada."
  },
  19: {
    vignette: "Hombre de 55 años consulta por dolor opresivo en reposo de 1 hora. ECG muestra infradesnivel ST de 2 mm en V2-V5 con Troponina I marcadamente elevada.",
    explicacion: "El IAMSEST / Angina Inestable se debe a la fisura de placa con trombosis parcial no oclusiva. El tratamiento farmacológico inmediato incluye Antiagregación Plaquetaria Dual (Aspirina + Ticagrelor/Clopidogrel), Anticoagulación parenteral (HBPM / Enoxaparina), Nitroglicerina sublingual/EV, Betabloqueadores y Estatinas dosis alta."
  },
  20: {
    vignette: "Hombre de 68 años, al 4° día post-IAM anterior extenso, presenta bruscamente disnea severa, shock y soplo holosistólico nuevo IV/VI en el apex irradiado a la axila con rales difusos bilaterales.",
    explicacion: "Las complicaciones mecánicas ocurren del 3° al 7° día post-IAM. La Rotura de Músculo Papilar genera Insuficiencia Mitral Aguda masiva y edema pulmonar cardiogénico 'flash' con soplo apical. La Rotura de Pared Libre provoca taponamiento cardíaco súbito; la CIV post-IAM genera soplo holosistólico parasternal izquierdo con frémito. El manejo definitivo es la Cirugía Cardíaca de Urgencia."
  },
  21: {
    vignette: "Paciente de 60 años en su 2° día post-IAM anterior presenta ráfagas de extrasístoles ventriculares monomórficas en el monitor, manteniéndose estable.",
    explicacion: "Las Extrasístoles Ventriculares tras un IAM son muy frecuentes debido al automatismo periinfarto; si el paciente está hemodinámicamente estable, NO requieren antiarrítmicos (su uso profiláctico aumenta la mortalidad). Si presenta Fibrilación Ventricular o TV inestable, la desfibrilación/cardioversión eléctrica es inmediata."
  },
  22: {
    vignette: "Hombre de 66 años ingresa por IAMSDST inferior. Presenta PA 80/40 mmHg, FC 55 lpm, ingurgitación yugular severa pero auscultación pulmonar limpia sin crepitantes.",
    explicacion: "La tríada del IAM del Ventrículo Derecho incluye: Hipotensión, Ingurgitación yugular y Campos pulmonares limpios en IAM inferior. Se confirma con supradesnivel ST en V3R-V4R. La conducta de primera línea es la Sobrecarga de Volumen con Suero Fisiológico EV. Están CONTRAINDICADOS los vasodilatadores (nitratos, morfina) y diuréticos pues colapsan la precarga del VD."
  },
  23: {
    vignette: "Mujer de 72 años con HTA y diabetes consulta por disnea de esfuerzo CF III, ortopnea y edema de extremidades inferiores. Auscultación destaca R3 y rales basal bilaterales.",
    explicacion: "El diagnóstico de Insuficiencia Cardíaca es fundamentalmente clínico según Criterios de Framingham (requiere 2 mayores o 1 mayor + 2 menores). El péptido natriurético (BNP / NT-proBNP) descarta la IC por alto valor predictivo negativo. El ecocardiograma Doppler clasifica la IC según FEVI: reducida (≤40%), levemente reducida (41-49%) o preservada (≥50%)."
  },
  24: {
    vignette: "Hombre de 65 años con IC crónica y FEVI 30% sintomático en CF II bajo enalapril y carvedilol. Se evalúa optimización del tratamiento según guías GES/MINSAL.",
    explicacion: "El tratamiento farmacológico modificador de enfermedad que reduce la mortalidad en IC con FEVI reducida ('Cuadriplete Fantástico') comprende: 1) iSGLT2 (Dapagliflozina / Empagliflozina); 2) ARNI (Sacubitril/Valsartán); 3) Betabloqueadores (Carvedilol, Bisoprolol, Metoprolol succinato); y 4) Antagonistas Mineralocorticoides (Espironolactona). Los diuréticos de asa (Furosemida) son solo sintomáticos."
  },
  25: {
    vignette: "Paciente de 58 años en control ambulatorio post-evento coronario agudo consulta por metas de prevención secundaria.",
    explicacion: "En Cardiopatía Coronaria establecida (muy alto riesgo cardiovascular), la estrategia comprende: Antiagregación plaquetaria permanente (Aspirina 100 mg), meta estricta de Colesterol LDL < 55 mg/dL con Estatinas de alta potencia (Atorvastatina 80 mg), control tensional PA < 130/80 mmHg y cese tabáquico absoluto."
  },
  26: {
    vignette: "Hombre de 68 años con EPOC severo presenta disnea progresiva, ingurgitación yugular con onda 'v' gigante, edema de EEII y hepatomegalia congestiva sin rales pulmonares.",
    explicacion: "El Cor Pulmonale es la hipertrofia/dilatación del Ventrículo Derecho secundaria a Hipertensión Arterial Pulmonar por neumopatía crónica (EPOC la causa más frecuente). Se presenta con falla derecha pura sin congestión izquierda. El tratamiento se centra en la patología pulmonar de base (oxigenoterapia continua si PaO₂ < 55 mmHg) y diuréticos moderados."
  },
  27: {
    vignette: "Médico evalúa a un paciente con hallazgo de soplo cardíaco en examen de rutina. Debe precisar criterios semiológicos diferenciadores.",
    explicacion: "Los soplos diastólicos (Estenosis Mitral, Insuficiencia Aórtica) y los soplos holosistólicos o continuos son SIEMPRE patológicos y requieren ecocardiograma Doppler. Los soplos sistólicos eyectivos suaves (I-II/VI), no irradiados, que varían con la postura en jóvenes asintomáticos suelen ser inocentes."
  },
  28: {
    vignette: "Hombre de 76 años consulta por síncope de esfuerzo y angina. Auscultación: soplo sistólico eyectivo áspero en foco aórtico irradiado a carótidas con pulso parvus et tardus.",
    explicacion: "La Estenosis Aórtica Severa senil se manifiesta por la tríada: Angina, Síncope y Disnea de esfuerzo. Al examen destaca soplo sistólico eyectivo irradiado a carótidas, A2 disminuido y pulso parvus et tardus. Una vez sintomática, la sobrevida es <2-3 años sin tratamiento; la indicación definitiva es el Reemplazo Valvular Aórtico (quirúrgico o TAVI)."
  },
  29: {
    vignette: "Mujer de 45 años con antecedente de fiebre reumática en la infancia presenta disnea y FA. Auscultación: chasquido de apertura y retumbo diastólico en el apex.",
    explicacion: "La Estenosis Mitral es producida casi exclusivamente por secuela de Fiebre Reumática. Produce obstrucción al llenado del VI durante la diástole, dilatación de aurícula izquierda, congestión pulmonar y FA. El signo patognomónico es el chasquido de apertura y retumbo diastólico apical. El tratamiento intervencional de elección es la Valvuloplastía Mitral Percutánea con Balón."
  },
  30: {
    vignette: "Joven deportista de 22 años sufre síncope durante ejercicio. Ecocardiograma muestra hipertrofia asimétrica septal del VI de 22 mm con gradiente dinámico en el tracto de salida.",
    explicacion: "La Miocardiopatía Hipertrófica (MCH) es la causa #1 de muerte súbita en atletas jóvenes (autosómica dominante). Presenta soplo sistólico eyectivo parasternal izquierdo que AUMENTA con maniobra de Valsalva. Tratamiento inicial son Betabloqueadores; en alto riesgo de muerte súbita se indica Desfibrilador Automático Implantable (DAI)."
  },
  31: {
    vignette: "Mujer de 38 años presenta ACV isquémico agudo criptogénico. Ecocardiograma transesofágico con microburbujas demuestra paso precoz de burbujas de AD a AI tras Valsalva.",
    explicacion: "El Foramen Oval Permeable (FOP) está presente en 20-25% de la población. Es la causa principal de Embolía Paradojal en adultos jóvenes con ACV criptogénico (paso de trombo venoso a circulación izquierda). En pacientes jóvenes (<60 años) con ACV criptogénico y FOP de alto riesgo, se indica Cierre Percutáneo del FOP con dispositivo."
  },
  32: {
    vignette: "Escolar de 8 años en control de salud asintomático presenta soplo sistólico Grado II/VI en foco pulmonar, suave, musical, que disminuye al sentarse. Examen neurológico y cardíaco normal.",
    explicacion: "Los soplos funcionales o inocentes son muy frecuentes en niños. Caracterizados por: intensidad leve (I-II/VI), fase mesosistólica, variación postural/respiratoria y ruidos cardíacos R1-R2 normales sin soplos diastólicos ni clicks. El manejo es la tranquilidad familiar sin requerir restricción deportiva ni ecocardiograma."
  },
  33: {
    vignette: "Hombre de 42 años consulta por dolor torácico pleurítico de 2 días que aumenta en decúbito dorsal y alivia al inclinarse hacia adelante. ECG: supradesnivel ST cóncavo difuso e infradesnivel PR.",
    explicacion: "La Pericarditis Aguda es la inflamación del pericardio (causa más frecuente viral). Se diagnostica por ≥2 criterios: dolor pleurítico posicional (alivia al inclinarse adelante), frote pericárdico, ECG con supradesnivel ST cóncavo difuso e infradesnivel PR, y derrame en ecocardiograma. Tratamiento de 1ª línea: AINEs a dosis altas + Colchicina 0.5 mg/día por 3 meses."
  },
  34: {
    vignette: "Joven de 26 años presenta disnea progresiva y arritmias 10 días después de un cuadro gripal febril. Troponinas elevadas y ecocardiograma muestra FEVI 32% con hipocinesia global.",
    explicacion: "La Miocarditis Aguda es la inflamación del miocardio (causa viral frecuente). Se presenta desde dolor coronario sintomático hasta insuficiencia cardíaca aguda o shock cardiogénico fulminante en pacientes jóvenes post-infección viral. La Resonancia Magnética Cardíaca es el examen de elección. Tratamiento: manejo estándar de IC y reposo deportivo por 3-6 meses."
  },
  35: {
    vignette: "Escolar de 11 años presenta fiebre, artritis migratoria de rodillas, nódulos subcutáneos y soplo holosistólico apical nuevo tras odinofagia no tratada hace 3 semanas.",
    explicacion: "La Fiebre Reumática Aguda es una reacción autoinmune post-estreptocócica. Diagnóstico por Criterios de Jones (2 mayores o 1 mayor + 2 menores más ASO positivo). Criterios mayores: Carditis, Poliartritis, Corea, Eritema marginado, Nódulos subcutáneos. Tratamiento: Penicilina Benzatina dosis única, AINEs para artritis y Profilaxis Secundaria con Penicilina Benzatina IM c/3-4 semanas."
  },
  36: {
    vignette: "Hombre de 70 años post-cirugía presenta PA 75/40 mmHg, oliguria, frialdad distal, llenado capilar 5s, lactato 6.5 mmol/L y SvO₂ 52%.",
    explicacion: "El Shock es la hipoperfusión tisular sistémica. Se clasifica en: 1) Hipovolémico (baja precarga); 2) Cardiogénico (fallo miocárdico, GC bajo, PCOP alta); 3) Distributivo (Séptico/Anafiláctico: vasodilatación, RVS baja, GC alto); 4) Obstructivo (TEP masivo, taponamiento, neumotórax). Manejo: fluidos, vasopresores (Norepinefrina de 1ª línea) y corrección etiológica."
  },
  37: {
    vignette: "Lactante de 4 meses se cansa al mamar y presenta sudoración en la frente. Auscultación: soplo holosistólico IV/VI en 3er-4° espacio intercostal izquierdo con frémito.",
    explicacion: "La Comunicación Interventricular (CIV) es la cardiopatía congénita acianótica más frecuente. Las CIV grandes causan sobrecarga pulmonar e insuficiencia cardíaca del lactante (dificultad alimentaria, escaso peso) a las 4-8 semanas al caer la resistencia pulmonar. Requieren cirugía precoz antes de desarrollar Síndrome de Eisenmenger irreversible."
  },
  38: {
    vignette: "Recién nacido a término presenta cianosis central que no responde a O₂ al 100% (test hiperoxia negativo). Radiografía de tórax muestra silueta cardíaca en 'huevo en un hilo'.",
    explicacion: "La presencia de Cianosis neonatal precoz indica cortocircuito de derecha a izquierda (Cardiopatía Cianótica). La Transposición de Grandes Arterias (TGA) es la causa #1 en <24h. Ante la sospecha de lesión cianótica ductus-dependiente, la medida inmediata de rescate es la infusión continua de Prostaglandina E1 (Alprostadil) para mantener el ductus abierto."
  },
  39: {
    vignette: "Hombre de 60 años hipertenso ingresa por dolor torácico lacerante súbito 10/10 irradiado a espalda. PA 190/110 en brazo derecho y 130/70 en brazo izquierdo con soplito aórtico nuevo.",
    explicacion: "La Disección Aórtica presenta dolor torácico desgarrador agudo máximo al inicio irradiado a espalda con asimetría de presiones (>20 mmHg entre brazos). Clasificación Stanford: Tipo A (aorta ascendente; Cirugía de Urgencia inmediata) y Tipo B (aorta descendente; tratamiento médico con Betabloqueadores EV Esmolol/Labetalol para controlar PA < 120/80)."
  },
  40: {
    vignette: "Hombre de 72 años fumador presenta dolor lumbar sordo. Palpación abdominal detecta masa pulsátil expansiva epigástrica. Eco-FAST confirma diámetro aórtico infrarrenal de 5.8 cm.",
    explicacion: "El Aneurisma de Aorta Abdominal (AAA) es la dilatación aórtica >3.0 cm (más frecuente infrarrenal). El tabaquismo es el factor de riesgo principal. Las indicaciones de reparación electiva (quirúrgica o endovascular EVAR) son: diámetro ≥ 5.5 cm en hombres (≥ 5.0 cm en mujeres) o aneurismas sintomáticos/dolorosos independientemente del diámetro."
  },
  41: {
    vignette: "Mujer de 74 años con FA no anticoagulada presenta dolor súbito e insoportable en pierna derecha de 3h. Al examen: extremidad pálida, fría, parestésica sin pulsos poplíteo ni pedio.",
    explicacion: "La Isquemia Aguda de EEII se debe a oclusión arterial brusca (embolía de origen cardíaco por FA la causa #1). Manifestada por las 6 P: Pain, Pallor, Pulselessness, Paresthesia, Paralysis, Poikilothermia. Tratamiento: anticoagulación con bolo de Heparina No Fraccionada EV y Trombectomía Quirúrgica con catéter de Fogarty antes de las 6h."
  },
  42: {
    vignette: "Hombre de 67 años diabético y fumador consulta por dolor tipo calambre en pantorrilla al caminar 150m que cede en 3 min de reposo. Índice Tobillo-Brazo (ITB) es de 0.62.",
    explicacion: "La Claudicación Intermitente es el síntoma cardinal de la Isquemia Crónica de EEII por ateroesclerosis periférica. El diagnóstico no invasivo de elección es el Índice Tobillo-Brazo (ITB ≤ 0.90 confirma EAP). Tratamiento conservador: cese tabáquico estricto, ejercicio de caminata programada, Aspirina 100 mg, Estatinas dosis alta y Cilostazol."
  },
  43: {
    vignette: "Hombre de 71 años presenta amaurosis fugaz izquierda de 10 min seguida de paresia de mano derecha recuperada totalmente. Eco-Doppler carotídeo revela estenosis del 82% en carótida interna izquierda.",
    explicacion: "La Estenosis Carotídea Sintomática (post-AIT o ACV leve ipsilateral en últimos 6 meses) con estenosis severa (70-99%) requiere Endarterectomía Carotídea quirúrgica precoz (idealmente <14 días del síntoma) asociada a tratamiento médico óptimo para prevenir ACV isquémico recurrente."
  },
  44: {
    vignette: "Mujer de 52 años en 5° día post-operatorio de cadera presenta aumento de volumen doloroso en pierna izquierda, calor local, eritema y diferencia de diámetro de pantorrilla de 4.5 cm.",
    explicacion: "La Trombosis Venosa Profunda (TVP) se desencadena por la Tríada de Virchow (estasis, hipercoagulabilidad, daño endotelial). La evaluación clínica se realiza con la Escala de Wells. Con probabilidad alta (Wells ≥ 2), el examen confirmatorio es el Eco-Doppler Venoso. Tratamiento: Anticoagulación oral continua (DOACs) por mínimo 3 meses."
  },
  45: {
    vignette: "Mujer de 35 años usuaria de ACOs consulta por disnea súbita y dolor pleurítico derecho. FC 115 lpm, SatO₂ 92%. Angio-TAC de tórax confirma defecto de relleno en arteria lobar inferior derecha.",
    explicacion: "El Tromboembolismo Pulmonar (TEP) proviene en >90% de TVP de EEII. Síntomas clave: disnea brusca, dolor pleurítico y taquicardia. En pacientes estables con sospecha alta (Wells > 4), el examen confirmatorio es el Angio-TAC de tórax. Con probabilidad baja/intermedia, el D-Dímero descarta la patología. Tratamiento: Anticoagulación por 3-6 meses."
  },
  46: {
    vignette: "Hombre de 58 años con fractura de fémur presenta disnea extrema súbita, síncope y shock (PA 65/40 mmHg). Ecocardiograma de urgencia muestra dilatación e hipocinesia del VD (signo de McConnell).",
    explicacion: "El TEP Masivo (alto riesgo) se define por TEP con inestabilidad hemodinámica (PAS < 90 mmHg por >15 min). La falla ventricular derecha aguda causa colapso del gasto cardíaco. La conducta prioritaria de rescate es la Terapia Trombolítica Sistémica con tPA (Alteplasa 100 mg EV en 2h), seguida de heparina no fraccionada."
  },
  47: {
    vignette: "Mujer de 48 años consulta por pesadez, cansancio y edema declive en piernas al final del día. Examen: varices tortuosas dilatadas en safena magna e hiperpigmentación ocrácea en tobillo.",
    explicacion: "La Insuficiencia Venosa Crónica de EEII se debe a incompetencia valvular e hipertensión venosa. Síntomas: pesadez, edema declive y cambios cutáneos (clasificación CEAP). Examen confirmatorio: Eco-Doppler Venoso. Tratamiento de primera línea: Terapia de Compresión Elástica graduada (20-30 mmHg) y elevación de extremidades."
  }
};

const chapterDefinitions = [
  {
    chapNum: 1,
    folderName: 'Capitulo_1_Arritmias_y_Emergencias',
    title: 'Arritmias y Emergencias Cardiovasculares',
    indices: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
  },
  {
    chapNum: 2,
    folderName: 'Capitulo_2_Cardiopatia_Coronaria_y_SCA',
    title: 'Cardiopatía Coronaria y Síndrome Coronario Agudo',
    indices: [14, 15, 16, 17, 18, 19, 20, 21, 24]
  },
  {
    chapNum: 3,
    folderName: 'Capitulo_3_Insuficiencia_Cardiaca_Miocardiopatias_y_Shock',
    title: 'Insuficiencia Cardíaca, Miocardiopatías y Shock',
    indices: [22, 23, 25, 29, 35]
  },
  {
    chapNum: 4,
    folderName: 'Capitulo_4_Valvulopatias_Miopericardio_y_Congenitas',
    title: 'Valvulopatías, Miopericardio y Cardiopatías Congénitas',
    indices: [26, 27, 28, 30, 31, 32, 33, 34, 36, 37]
  },
  {
    chapNum: 5,
    folderName: 'Capitulo_5_Patologia_Vascular_Periferica_y_Tromboembolica',
    title: 'Patología Vascular Periférica y Tromboembólica',
    indices: [38, 39, 40, 41, 42, 43, 44, 45, 46]
  }
];

function formatArticleMarkdown(text, chapNum, topicNumInChap, hasDiagram) {
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
    const tableTitle = headers[0] && headers[1] ? `${headers[0]} vs ${headers[1]}` : 'Clasificación y Criterios';

    if (match.includes('Cumarínicos') || match.includes('NACOs') || headers.length >= 4) {
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
  let figureInserted = !hasDiagram;

  html = rawParagraphs.map(p => {
    p = p.trim();
    if (!p) return '';
    if (p.includes('__BREAK_COL_START__')) return p;
    if (p.startsWith('<div') || p.startsWith('<table') || p.startsWith('<ul') || p.startsWith('<li')) return p;

    if (p.includes('- ') || p.includes('1. ')) {
      const items = p.split(/\n/).map(l => l.replace(/^[-*\d\.]+\s+/, '').trim()).filter(Boolean);
      return `<ul class="lst">${items.map(i => `<li>${i}</li>`).join('')}</ul>`;
    }

    let paragraphText = p;
    if (!figureInserted) {
      figureInserted = true;
      paragraphText += ` (ver Figura ${chapNum}.${topicNumInChap})`;
    }

    return `<p class="txt">${paragraphText}</p>`;
  }).join('\n');

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

const baseCss = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Merriweather:wght@400;700&display=swap');
  @page { size: letter; margin: 0.42in 0.35in 0.38in 0.35in; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; font-size: 8.5pt; line-height: 1.35; color: #0f172a; background: #ffffff; -webkit-print-color-adjust: exact; }
  .page { width: 100%; page-break-after: always; position: relative; }
  .topic-section { page-break-after: always; }
  
  .topic-hdr { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1e3a8a; padding-bottom: 4px; margin-bottom: 8px; }
  .topic-hdr h2 { font-family: 'Merriweather', serif; font-size: 13.5pt; color: #1e3a8a; }
  .topic-hdr .num { font-size: 8pt; font-weight: 700; color: #2563eb; text-transform: uppercase; }
  .perfil-tag { background: #f1f5f9; border: 1px solid #cbd5e1; border-left: 4px solid #1e3a8a; padding: 3px 6px; font-size: 7.5pt; }

  .two-col-flow { column-count: 2; column-gap: 0.2in; width: 100%; }
  
  .box { border: 1px solid #cbd5e1; border-radius: 2px; padding: 5px 7px; margin-top: 5px; margin-bottom: 5px; font-size: 8pt; width: 100%; break-inside: avoid; }
  .box-title { font-weight: 700; font-size: 7.5pt; text-transform: uppercase; margin-bottom: 2px; letter-spacing: 0.5px; }
  .box.high-yield { background: #f8fafc; border-left: 3.5px solid #1e3a8a; }
  .box.high-yield .box-title { color: #1e3a8a; }

  .box.vignette-redesigned { background: #fffdf5; border: 1.5px solid #f59e0b; border-radius: 3px; padding: 0; margin-top: 6px; margin-bottom: 6px; overflow: hidden; break-inside: avoid; }
  .vignette-hdr { background: #d97706; color: #ffffff; font-weight: 700; font-size: 8pt; padding: 3.5px 8px; text-transform: uppercase; letter-spacing: 0.5px; }
  .vignette-body { padding: 6px 8px; }
  .vignette-sec { margin-bottom: 4px; }
  .vignette-sec.concept-sec { border-top: 1px dashed #fcd34d; padding-top: 4px; margin-bottom: 0; }
  .sec-label { font-weight: 700; font-size: 7.5pt; color: #92400e; display: block; margin-bottom: 2px; }
  .sec-text { font-size: 8pt; line-height: 1.35; color: #1e293b; }

  .box.summary-redesigned { background: #f0f9ff; border: 1.5px solid #0284c7; border-radius: 3px; padding: 0; margin-top: 8px; overflow: hidden; break-inside: avoid; }
  .summary-hdr { background: #0284c7; color: #ffffff; font-weight: 700; font-size: 8pt; padding: 3.5px 8px; text-transform: uppercase; letter-spacing: 0.5px; }
  .summary-body { padding: 6px 8px; font-size: 8pt; line-height: 1.35; color: #0369a1; }

  .box.important-callout { background: #fef2f2; border-color: #fca5a5; border-left: 3.5px solid #ef4444; }
  .box.important-callout .box-title { color: #991b1b; }
  .box.warning-callout { background: #fff7ed; border-color: #ffedd5; border-left: 3.5px solid #f97316; }
  .box.warning-callout .box-title { color: #c2410c; }
  .box.note-callout { background: #f8fafc; border-color: #e2e8f0; border-left: 3.5px solid #64748b; }
  .box.note-callout .box-title { color: #334155; }
  .box.tip-callout { background: #fff5f5; border: 1.5px solid #fca5a5; border-left: 3.5px solid #dc2626; }
  .box.tip-callout .box-title { color: #991b1b; }
  .box.tip-callout p { color: #7f1d1d; }

  .subhead { font-family: 'Merriweather', serif; font-size: 9.5pt; font-weight: 700; color: #1e3a8a; margin: 8px 0 4px 0; border-bottom: 1px solid #cbd5e1; padding-bottom: 1px; break-after: avoid; }
  .subhead-small { font-family: 'Inter', sans-serif; font-size: 8.5pt; font-weight: 700; color: #0f172a; margin: 6px 0 3px 0; break-after: avoid; }
  p.txt { font-size: 8pt; line-height: 1.35; margin-bottom: 4px; text-align: justify; }
  ul.lst { padding-left: 12px; margin-bottom: 4px; }
  ul.lst li { font-size: 8pt; margin-bottom: 2px; }

  .tbl-container { width: 100%; margin: 6px 0; break-inside: avoid; }
  .tbl-hdr { font-weight: 700; font-size: 7.5pt; color: #1e3a8a; background: #f1f5f9; padding: 3px 6px; border: 1px solid #cbd5e1; border-bottom: none; text-transform: uppercase; letter-spacing: 0.5px; }
  .tbl-hdr .tbl-num { color: #2563eb; }
  table.tbl { width: 100%; border-collapse: collapse; font-size: 7.5pt; border: 1px solid #cbd5e1; border-top: 1.5px solid #1e3a8a; border-bottom: 1.5px solid #1e3a8a; }
  table.tbl th { background: #f1f5f9; color: #1e3a8a; padding: 4px 5px; text-align: left; font-size: 7pt; text-transform: uppercase; font-weight: 700; border-bottom: 1px solid #cbd5e1; }
  table.tbl td { padding: 4px 5px; border-bottom: 1px solid #e2e8f0; vertical-align: top; line-height: 1.3; }
  table.tbl tr:nth-child(even) td { background: #f8fafc; }
  .full-width-tbl-block { width: 100%; margin: 8px 0; break-inside: avoid; }

  .diagram-box { width: 100%; border: 1px solid #1e3a8a; border-radius: 2px; padding: 5px; margin-top: 6px; margin-bottom: 6px; background: #ffffff; text-align: center; break-inside: avoid; }
  .diagram-box .d-title { font-weight: 700; font-size: 7.5pt; text-transform: uppercase; color: #1e3a8a; text-align: center; margin-bottom: 3px; border-bottom: 1px solid #cbd5e1; padding-bottom: 1px; }
  .svg-centered { display: flex; justify-content: center; align-items: center; width: 100%; text-align: center; }
  .svg-centered svg { max-width: 100%; height: auto; margin: 0 auto; display: block; }

  .topic-questions-container { width: 100%; margin-top: 8px; break-inside: avoid; }
  .t-q-title { font-weight: 700; font-size: 8pt; color: #1e3a8a; text-transform: uppercase; border-bottom: 1.5px solid #1e3a8a; padding-bottom: 2px; margin-bottom: 4px; }
  .q-full-width { width: 100%; background: #ffffff; border: 1px solid #cbd5e1; border-left: 3.5px solid #2563eb; border-radius: 2px; padding: 5px 8px; margin-bottom: 5px; break-inside: avoid; }
  .q-hdr-link { display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px; }
  .q-full-width .q-hdr { font-weight: 700; font-size: 8pt; color: #2563eb; text-transform: uppercase; letter-spacing: 0.5px; }
  .q-full-width .q-stem { font-size: 8pt; line-height: 1.35; margin-bottom: 4px; }
  .q-options-grid { display: flex; flex-direction: column; gap: 2px; margin-bottom: 2px; }
  .q-opt-item { font-size: 7.5pt; padding: 2px 4px; border-radius: 2px; background: #f8fafc; border: 1px solid #e2e8f0; }

  .answer-key-page { padding-top: 0.2in; }
  .answer-key-page h2 { font-family: 'Merriweather', serif; font-size: 14pt; color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 4px; margin-bottom: 8px; }
  .ans-key-card { background: #ffffff; border: 1px solid #cbd5e1; border-radius: 3px; padding: 8px 10px; margin-bottom: 10px; page-break-inside: avoid; }
  .ans-key-hdr { font-weight: 700; font-size: 8.5pt; color: #1e3a8a; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; margin-bottom: 4px; }
  .ans-correct-badge { display: inline-block; background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; font-weight: 700; font-size: 8pt; padding: 2px 6px; border-radius: 2px; margin-bottom: 4px; }
  .ans-section { font-size: 8pt; line-height: 1.35; margin-bottom: 4px; }
  .ans-section.incorrects { background: #f8fafc; border-left: 3.5px solid #64748b; padding: 4px 6px; margin-top: 4px; }
`;

function buildTopicHtml(t) {
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

    ${t.articleHtml}

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

    <div class="box high-yield">
      <div class="box-title">Puntos Clave Destacados</div>
      <ul class="lst">
        ${(t.keyPoints || []).map(p => `<li>${p}</li>`).join('')}
      </ul>
    </div>

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

    <div class="box summary-redesigned">
      <div class="summary-hdr">RESUMEN EJECUTIVO: ${t.title.toUpperCase()}</div>
      <div class="summary-body">
        <p>${t.summaryText}</p>
      </div>
    </div>
  </div>

  <div class="page answer-key-page">
    <h2>SOLUCIONARIO Y FUNDAMENTO CLÍNICO</h2>
    ${t.preguntas.map(q => `
      <div class="ans-key-card">
        <div class="ans-key-hdr">
          <span>RESPUESTA PREGUNTA ${q.qSeqNum}</span>
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
    `).join('')}
  </div>
</body>
</html>`;
}

function buildChapterHtml(cDef, chapterTopics) {
  let pagesHtml = `
  <div class="page cover" style="height: 9.8in; display: flex; flex-direction: column; justify-content: center; align-items: center; background: #0f172a; color: white; text-align: center;">
    <h1 style="font-family: 'Merriweather', serif; font-size: 24pt; color: #38bdf8; margin-bottom: 10px;">CAPÍTULO ${cDef.chapNum}</h1>
    <h2 style="font-size: 16pt; font-weight: 400; color: #ffffff; margin-bottom: 20px;">${cDef.title.toUpperCase()}</h2>
    <div style="background: #1e293b; border: 1px solid #334155; padding: 6px 20px; font-size: 10pt; border-radius: 4px;">Manual EUNACOM Cardiología 2026</div>
  </div>
  `;

  chapterTopics.forEach(t => {
    pagesHtml += `
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

      ${t.articleHtml}

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

      <div class="box high-yield">
        <div class="box-title">Puntos Clave Destacados</div>
        <ul class="lst">
          ${(t.keyPoints || []).map(p => `<li>${p}</li>`).join('')}
        </ul>
      </div>

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

      <div class="box summary-redesigned">
        <div class="summary-hdr">RESUMEN EJECUTIVO: ${t.title.toUpperCase()}</div>
        <div class="summary-body">
          <p>${t.summaryText}</p>
        </div>
      </div>
    </div>
    `;
  });

  // Chapter Answer Key
  pagesHtml += `
  <div class="page answer-key-page">
    <h2>SOLUCIONARIO Y FUNDAMENTO CLÍNICO - CAPÍTULO ${cDef.chapNum}</h2>
    ${chapterTopics.map(t => t.preguntas.map(q => `
      <div class="ans-key-card">
        <div class="ans-key-hdr">
          <span>RESPUESTA PREGUNTA ${q.qSeqNum} (Capítulo ${t.topicLabel}: ${t.title})</span>
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
    `).join('')).join('')}
  </div>
  `;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>${baseCss}</style>
</head>
<body>
  ${pagesHtml}
</body>
</html>`;
}

async function main() {
  console.log("Generando PDFs Nombra dos como Capitulo_1.1, Capitulo_1.2, Capitulo_2.1, etc...");

  if (!fs.existsSync(baseCapitulosDir)) {
    fs.mkdirSync(baseCapitulosDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  let globalQuestionNum = 1;

  for (const cDef of chapterDefinitions) {
    const chapDir = path.join(baseCapitulosDir, cDef.folderName);
    if (!fs.existsSync(chapDir)) {
      fs.mkdirSync(chapDir, { recursive: true });
    }

    console.log(`\nProcesando Capítulo ${cDef.chapNum}: ${cDef.title}...`);
    const chapterTopics = [];

    for (let itemChapIdx = 0; itemChapIdx < cDef.indices.length; itemChapIdx++) {
      const classIdx = cDef.indices[itemChapIdx];
      const rawClass = onlineClasses[classIdx];
      const topicNumInChap = itemChapIdx + 1;
      const topicLabel = `${cDef.chapNum}.${topicNumInChap}`;

      const keyPoints = typeof rawClass.key_points === 'string' ? JSON.parse(rawClass.key_points) : (rawClass.key_points || []);
      const rawQuiz = typeof rawClass.quiz === 'string' ? JSON.parse(rawClass.quiz) : (rawClass.quiz || []);
      const diagram = diagramMap[classIdx + 1] || null;

      const rawArticle = rawClass.article_content || rawClass.clean_transcript || rawClass.summary || '';
      const formattedArticle = formatArticleMarkdown(rawArticle, cDef.chapNum, topicNumInChap, !!diagram);

      const questionsForTopic = [];
      const qSourceList = [...rawQuiz];

      const topicFirstWord = rawClass.topic.toLowerCase().split(' ')[0];
      const bankMatches = questionBank.filter(q => 
        (q.tags && q.tags.some(t => t.toLowerCase().includes(topicFirstWord))) ||
        (q.pregunta && q.pregunta.toLowerCase().includes(topicFirstWord))
      );

      for (const bq of bankMatches) {
        if (qSourceList.length >= 3) break;
        qSourceList.push(bq);
      }

      for (let qIdx = 0; qIdx < Math.min(3, Math.max(1, qSourceList.length)); qIdx++) {
        const qObj = qSourceList[qIdx] || qSourceList[0] || {};
        const qNum = globalQuestionNum++;
        const qText = stripEmojis(qObj.questionText || qObj.pregunta || rawClass.topic);
        const optionsRaw = qObj.options || qObj.opciones || [];

        const options = optionsRaw.map((o, oIdx) => {
          const rawText = stripEmojis(o.text || o.texto || o);
          const cleanText = rawText.replace(/^[A-E][\)\.]\s*/i, '');
          return {
            id: o.id || String.fromCharCode(65 + oIdx),
            texto: cleanText
          };
        });

        const correctOptObj = optionsRaw.find(o => o.isCorrect || o.correcta);
        const correctOpt = correctOptObj?.id || 'A';
        let explicacionCorrecta = stripEmojis(correctOptObj?.explanation || qObj.explicacion || 'Fundamento basado en el protocolo clínico oficial EUNACOM.');
        explicacionCorrecta = explicacionCorrecta.replace(/^Correcto[:\.]?\s*/i, '');

        const explicacionIncorrectas = optionsRaw.filter(o => !o.isCorrect).map(o => `${o.id}: ${stripEmojis(o.explanation || 'Opción no indicada en primera línea.')}`).join(' ');

        questionsForTopic.push({
          qSeqNum: qNum,
          enunciado: qText,
          opciones: options.length ? options : [
            { id: 'A', texto: 'Conducta o tratamiento de primera línea' },
            { id: 'B', texto: 'Opción no indicada en urgencias' },
            { id: 'C', texto: 'Examen de laboratorio secundario' },
            { id: 'D', texto: 'Fármaco contraindicado en la fase aguda' },
            { id: 'E', texto: 'Derivación o manejo tardío' }
          ],
          correcta: correctOpt,
          explicacionCorrecta: explicacionCorrecta,
          explicacionIncorrectas: explicacionIncorrectas
        });
      }

      const richCasoData = customVignettesMap[classIdx + 1] || {
        vignette: questionsForTopic[0].enunciado,
        explicacion: questionsForTopic[0].explicacionCorrecta
      };

      const topicObj = {
        chapNum: cDef.chapNum,
        topicNumInChap,
        topicLabel,
        title: rawClass.topic,
        perfilCode: rawClass.eunacom_code || `${cDef.chapNum}.01.${topicNumInChap < 10 ? '0' + topicNumInChap : topicNumInChap}`,
        dx: "Específico", tx: "Inicial", seg: "Derivar",
        articleHtml: formattedArticle,
        summaryText: stripEmojis(rawClass.summary || ''),
        keyPoints: keyPoints.map(stripEmojis),
        vignette: richCasoData.vignette,
        casoConcepto: richCasoData.explicacion,
        preguntas: questionsForTopic,
        svg: diagram ? diagram.svg : null,
        algoTitle: diagram ? diagram.title : ''
      };

      chapterTopics.push(topicObj);

      // Render Individual Topic PDF with Capitulo_X.Y naming prefix
      const topicPdfName = `Capitulo_${topicLabel}_${sanitizeFilename(rawClass.topic)}.pdf`;
      const topicPdfPath = path.join(chapDir, topicPdfName);
      const htmlContent = buildTopicHtml(topicObj);
      
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      await page.pdf({
        path: topicPdfPath,
        format: 'Letter',
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: `
          <div style="font-size: 7.5pt; font-family: 'Inter', sans-serif; color: #64748b; width: 100%; display: flex; justify-content: space-between; align-items: center; margin: 0 0.35in; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">
            <span>CARDIOLOGÍA &bull; CAPÍTULO ${topicLabel}</span>
            <span>PÁGINA <span class="pageNumber"></span></span>
          </div>
        `,
        footerTemplate: `<div></div>`,
        margin: { top: '0.42in', bottom: '0.38in', left: '0.35in', right: '0.35in' }
      });
      await page.close();
      console.log(`  └─ Topic PDF: ${topicPdfName}`);
    }

    // Render Full Chapter Compilation PDF inside the chapter directory
    const chapPdfName = `${cDef.folderName}_COMPLETO.pdf`;
    const chapPdfPath = path.join(chapDir, chapPdfName);
    const chapHtml = buildChapterHtml(cDef, chapterTopics);

    const chapPage = await browser.newPage();
    await chapPage.setContent(chapHtml, { waitUntil: 'networkidle0' });
    await chapPage.pdf({
      path: chapPdfPath,
      format: 'Letter',
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size: 7.5pt; font-family: 'Inter', sans-serif; color: #64748b; width: 100%; display: flex; justify-content: space-between; align-items: center; margin: 0 0.35in; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">
          <span>CARDIOLOGÍA &bull; CAPÍTULO ${cDef.chapNum}</span>
          <span>PÁGINA <span class="pageNumber"></span></span>
        </div>
      `,
      footerTemplate: `<div></div>`,
      margin: { top: '0.42in', bottom: '0.38in', left: '0.35in', right: '0.35in' }
    });
    await chapPage.close();
    console.log(`  🌟 CAPÍTULO COMPLETO GENERADO: ${chapPdfName}`);
  }

  await browser.close();
  console.log("\n¡ÉXITO TOTAL! Todas las carpetas y los 47 PDFs nombrados Capitulo_X.Y han sido generados en:", baseCapitulosDir);
}

main().catch(console.error);
