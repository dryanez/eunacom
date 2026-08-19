const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const outputPdfPath = path.join(__dirname, 'cardiologia-capitulo1-clean.pdf');

function getSvg(svgFilename) {
  const p = path.join(__dirname, 'generate-book', 'svg_diagrams', svgFilename);
  if (fs.existsSync(p)) {
    return fs.readFileSync(p, 'utf8');
  }
  return '';
}

const fullTopicsData = [
  {
    number: "1.1",
    title: "Manejo de Urgencias en Arritmias",
    perfilCode: "1.01.2.009",
    dx: "Específico", tx: "Inicial", seg: "Derivar",
    defText: "El manejo de urgencia en arritmias se centra en determinar inmediatamente el estado de perfusión tisular y la presencia de inestabilidad hemodinámica antes que el diagnóstico electrocardiográfico específico. La prioridad vital es estabilizar la función de bomba del corazón.",
    fisioText: "Las taquiarritmias severas (>150x') reducen drásticamente el tiempo de llenado diastólico del ventrículo izquierdo, disminuyendo el volumen sistólico, colapsando el gasto cardíaco y la perfusión coronaria. En bradiarritmias severas (<40x'), la frecuencia es insuficiente para mantener el gasto cardíaco mínimo.",
    criterios: [
      "Choque / Hipotensión: PAS < 90 mmHg, PAM < 65 mmHg, frialdad distal o llenado capilar > 3 segundos.",
      "Alteración Aguda del Estado Mental: Somnolencia, confusión o síncope secundario a hipoperfusión cerebral.",
      "Angina Isquémica Activa: Dolor torácico opresivo anginoso o desnivel agudo del segmento ST.",
      "Insuficiencia Cardíaca Aguda: Congestión pulmonar franca, crépitos bibasales difusos o edema agudo de pulmón."
    ],
    vignette: "Mujer de 60 años con estenosis mitral severa e HTA, ingresa por disnea de reposo y palpitaciones bruscas de 2 horas. Pálida, sudorosa, PA 82/40 mmHg, FC 145x' irregular, crépitos difusos bibasales y soplo diastólico IV/VI en ápex. ECG: Fibrilación Auricular rápida.",
    piensaEn: "FA rápida descompensada con Shock Cardiogénico y Edema Agudo de Pulmón.",
    conducta: "Cardioversión eléctrica sincronizada inmediata con 120-200 Joules bifásico previa sedación rápida si la conciencia lo permite.",
    tip: "En EUNACOM, arritmia + hipotensión o edema pulmonar -> La respuesta SIEMPRE es Cardioversión Eléctrica. Nunca perder tiempo con fármacos.",
    ges: "Protocolo SAMU: Exige monitor desfibrilador con parches conectados previo a cualquier traslado de paciente inestable.",
    farmacos: [
      { f: "Adenosina", ind: "TPSV QRS angosto estable", dosis: "6 mg EV bolo rápido + 20 ml SF (repetir 12 mg)", prec: "Contraindicada en asma severo." },
      { f: "Amiodarona", ind: "TV monomórfica / FA descompensada", dosis: "150 mg EV en 10 min, infusión 1 mg/min", prec: "Monitorizar presión arterial y QT." },
      { f: "Atropina", ind: "Bradiarritmia sintomática / BAV nodal", dosis: "0.5 - 1 mg EV bolo (máx 3 mg)", prec: "Ineficaz en BAV infranodal Mobitz II / BAV 3°." }
    ],
    pearls: [
      "En TV sin pulso o FV se realiza DESFIBRILACIÓN NO SINCRONIZADA inmediata a 200J.",
      "Sincronizar en la onda R evita descargar sobre la onda T (previene FV por fenómeno R sobre T).",
      "La dosis de adenosina se administra por técnica de dos llaves (bolo rápido + 20 ml de SF e infusión en vena antecubital)."
    ],
    preguntaCompleta: {
      numero: 11,
      enunciado: "Mujer de 60 años con antecedente de estenosis mitral severa, inicia bruscamente disnea y palpitaciones de reposo. Al examen físico se encuentra soporosa, PA: 85/35 mmHg, FC: 140x' irregular, crépitos bibasales intensos y difusos, y soplo diastólico IV/VI en ápex. ECG confirma Fibrilación Auricular con respuesta ventricular rápida. ¿Cuál es la conducta inicial más adecuada?",
      opciones: [
        { id: "A", texto: "Administrar amiodarona 150 mg EV en bolo en 10 minutos" },
        { id: "B", texto: "Entregar oxígeno a FiO2 elevadas y soporte ventilatorio no invasivo con BiPAP" },
        { id: "C", text: "Reponer fluidos con suero fisiológico 500 cc EV rápido" },
        { id: "D", texto: "Cardioversión eléctrica sincronizada inmediata" },
        { id: "E", texto: "Administrar furosemida EV asociada a infusión de noradrenalina" }
      ],
      correcta: "D",
      explicacion: "La paciente cursa con inestabilidad hemodinámica severa (PA 85/35 mmHg, compromiso de conciencia y edema agudo de pulmón) secundaria a una taquiarritmia. En toda taquiarritmia inestable, la indicación prioritaria de primera línea es la Cardioversión Eléctrica Sincronizada inmediata."
    },
    svg: "algo_urgencias.svg",
    algoTitle: "Algoritmo de Manejo de Urgencias en Arritmias"
  },
  {
    number: "1.2",
    title: "Paro Cardiorespiratorio",
    perfilCode: "1.01.2.006",
    dx: "Específico", tx: "Completo", seg: "Derivar",
    defText: "El paro cardiorespiratorio es la cesación brusca e inesperada de la actividad mecánica cardíaca y respiratoria. En adultos, más del 80% es de etiología coronaria aguda (Síndrome Coronario Agudo).",
    fisioText: "Los ritmos se dividen en Desfibrilables (FV / TVsp), donde la desfibrilación precoz es determinante, y NO Desfibrilables (Asistolia / AESP), donde predomina la RCP de alta calidad y la Adrenalina precoz.",
    criterios: [
      "Las 5 H: Hipoxia, Hipovolemia, Hidrogeniones (acidosis), Hipopotasemia/Hiperpotasemia, Hipotermia.",
      "Las 5 T: Tensión (neumotórax), Taponamiento cardíaco, Toxinas, Trombosis pulmonar (TEP), Trombosis coronaria (IAM)."
    ],
    vignette: "Hombre de 58 años, hipertenso y fumador, colapsa en urgencias. Inconsciente, sin pulso carotídeo en 5s. El monitor muestra actividad eléctrica caótica e irregular de amplitud variable sin QRS.",
    piensaEn: "Paro Cardiorespiratorio en Fibrilación Ventricular (Ritmo Desfibrilable).",
    conducta: "Iniciar compresiones torácicas inmediatamente -> Descarga 200J bifásico -> Reanudar RCP por 2 minutos.",
    tip: "En asistolia NUNCA desfibrilar. Confirmar en al menos 2 derivaciones y buscar causas 5H y 5T.",
    ges: "Evento adverso notificable en paro postanestésico o quirúrgico intrahospitalario.",
    farmacos: [
      { f: "Adrenalina", ind: "PCR (Todos los ritmos)", dosis: "1 mg EV bolo c/3-5 min (1:10.000)", prec: "En asistolia/AESP dar de inmediato. En FV/TVsp tras 2° descarga." },
      { f: "Amiodarona", ind: "FV / TVsp refractaria", dosis: "300 mg EV bolo (2° dosis 150 mg)", prec: "Dar tras la 3° descarga." }
    ],
    pearls: [
      "Frecuencia de ventilación tras intubación: 1 ventilación cada 6 segundos (10 rpm) sin pausar compresiones.",
      "La causa reversible más común de AESP en traumatizados o hipotensos es la hipovolemia severa.",
      "El ETCO2 > 35-40 mmHg es el indicador más precoz de Retorno de la Circulación Espontánea (RCE)."
    ],
    preguntaCompleta: {
      numero: 19,
      enunciado: "Paciente de 58 años sufre paro cardíaco presenciado en el servicio de urgencias. Se inicia RCP de alta calidad y se conecta el monitor desfibrilador, demostrando un trazado plano correspondiente a asistolia confirmado en dos derivaciones. ¿Cuál es la medida farmacológica inicial más adecuada e inmediata?",
      opciones: [
        { id: "A", texto: "Administrar atropina 1 mg EV bolo" },
        { id: "B", texto: "Administrar amiodarona 300 mg EV bolo" },
        { id: "C", texto: "Administrar adrenalina 1 mg EV de inmediato" },
        { id: "D", texto: "Realizar descarga eléctrica de 200 Joules" },
        { id: "E", texto: "Administrar bicarbonato de sodio 1 mEq/kg EV" }
      ],
      correcta: "C",
      explicacion: "En ritmos NO desfibrilables (asistolia y actividad eléctrica sin pulso), la administración precoz de Adrenalina 1 mg EV lo antes posible es la medida farmacológica determinante para mejorar la probabilidad de retorno de la circulación espontánea."
    },
    svg: "algo_pcr.svg",
    algoTitle: "Algoritmo de Soporte Vital Avanzado (ACLS)"
  },
  {
    number: "1.4",
    title: "Bradiarritmias y Bloqueos Cardíacos",
    perfilCode: "1.01.1.002",
    dx: "Específico", tx: "Inicial", seg: "Derivar",
    defText: "Los bloqueos auriculoventriculares representan la interrupción o retardo de la conducción del impulso eléctrico desde las aurículas a los ventrículos por daño anatómicofuncional en el nodo AV o sistema His-Purkinje.",
    fisioText: "Los bloqueos nodales (1° Grado y Mobitz I) suelen ser benignos y responden a Atropina. Los bloqueos infranodales (Mobitz II y BAV 3°) presentan alto riesgo de síncope/paro y requieren marcapaso definitivo.",
    criterios: [
      "BAV 1° Grado: PR > 0.20s fijo, todas las P conducen -> Observación.",
      "BAV 2° Mobitz I (Wenckebach): PR se alarga progresivamente hasta bloquear P -> Observar.",
      "BAV 2° Mobitz II: PR fijo con bloqueo súbito de P -> Marcapaso Definitivo.",
      "BAV 3° Grado (Completo): Disociación AV total -> Marcapaso Definitivo (GES N° 25)."
    ],
    vignette: "Hombre de 74 años consulta por síncope. FC 34x' regular, PA 145/80. ECG: Ondas P a 75x' y complejos QRS anchos a 34x' independientes sin relación.",
    piensaEn: "Bloqueo Auriculoventricular Completo (BAV 3° Grado).",
    conducta: "Hospitalizar, marcapaso transitorio si inestable e implante de Marcapaso Definitivo (Garantía GES N° 25).",
    tip: "Paciente mayor con síncope y QRS ancho a FC 30-35x' -> Pensar en BAV 3° y marcar Marcapaso Definitivo.",
    ges: "GES N° 25: Trastornos de conducción en mayores de 15 años que requieren marcapaso definitivo cubiertos al 100%.",
    farmacos: [
      { f: "Atropina", ind: "Bradicardia nodal", dosis: "0.5 - 1 mg EV bolo (máx 3 mg)", prec: "Ineficaz en Mobitz II o BAV 3° infranodal." },
      { f: "Isoproterenol", ind: "Puente infranodal", dosis: "2 - 10 mcg/min infusión", prec: "Aumenta consumo O2 miocárdico." }
    ],
    pearls: [
      "El IAM inferior suele causar BAV 2° Mobitz I o BAV 3° nodal transitorio que responde a Atropina.",
      "El IAM anterior extenso causa BAV infranodal Mobitz II o 3° que NO responde a Atropina y requiere marcapaso urgente.",
      "La hiperkalemia es la causa metabólica reversible clásica de bradicardia con QRS ancho."
    ],
    preguntaCompleta: {
      numero: 7,
      enunciado: "Paciente de 72 años con antecedentes de HTA y diabetes, ingresa por episodio sincopal brusco sin traumatismo. Al ECG se evidencia ritmo sinusal con FC 35x', ondas P independientes de los complejos QRS, los cuales son anchos (QRS 0.14s). ¿Cuál es el diagnóstico y conducta de elección?",
      opciones: [
        { id: "A", texto: "BAV 2° Mobitz I - Observación clínica y Holter ECG" },
        { id: "B", texto: "BAV 1° Grado - Atropina EV a permanencia" },
        { id: "C", texto: "Enfermedad del nodo sinusal - Amiodarona EV" },
        { id: "D", texto: "BAV 3° Grado - Instalación de marcapaso definitivo" },
        { id: "E", texto: "Bloqueo completo de rama izquierda - Coronariografía urgente" }
      ],
      correcta: "D",
      explicacion: "La presencia de disociación AV completa con ritmo de escape idioventricular lento en un paciente con síncope confirma un BAV de 3° Grado. La terapia definitiva obligatoria es la instalación de un Marcapaso Definitivo (Garantía GES N° 25)."
    },
    svg: "algo_bav.svg",
    algoTitle: "Algoritmo Diagnóstico y Terapéutico de Bloqueos AV"
  },
  {
    number: "1.5",
    title: "Fibrilación Auricular",
    perfilCode: "1.01.1.012",
    dx: "Específico", tx: "Inicial", seg: "Completo",
    defText: "La Fibrilación Auricular (FA) es la arritmia cardíaca sostenida más frecuente. Su etiología principal es la Hipertensión Arterial (HTA), seguida de la enfermedad valvular mitral y la cardiopatía isquémica.",
    fisioText: "Desencadenada por focos ectópicos en las venas pulmonares. Provoca estasis sanguínea en la orejuela izquierda con alto riesgo de formación de trombos y cardioembolismo cerebral (ACV isquémico).",
    criterios: [
      "Escala CHA2DS2-VASc: HTA(1), Edad 65-74(1), Edad >=75(2), DM(1), ACV(2), Vascular(1), Femenino(1).",
      "Indicación de ACO: Puntaje >= 2 en hombres o >= 3 en mujeres indica Anticoagulación Oral a permanencia."
    ],
    vignette: "Mujer de 68 años, hipertensa, consulta por palpitaciones de 2 semanas y astenia. PA 138/84, FC 118x' irregular. ECG: FA.",
    piensaEn: "Fibrilación Auricular no valvular hemodinámicamente estable.",
    conducta: "Anticoagulación Oral a permanencia (CHA2DS2-VASc = 3) + Betabloqueador para control de FC.",
    tip: "FA Valvular (Estenosis Mitral o Prótesis Mecánica) REQUIERE Warfarina/Acenocumarol. DOACs contraindicados.",
    ges: "En APS Chile (FONASA), el Acenocumarol es el anticoagulante de primera línea entregado en el PSCV.",
    farmacos: [
      { f: "Bisoprolol", ind: "Control FC en FA", dosis: "2.5 - 10 mg/día VO", prec: "Evitar en asma severo y bradicardia." },
      { f: "Acenocumarol", ind: "Anticoagulación FA", dosis: "Ajustada por INR (Meta 2.0 - 3.0)", prec: "Control periódico de coagulación." }
    ],
    pearls: [
      "Aspirina descatalogada en FA no valvular por falta de eficacia frente al riesgo de sangrado.",
      "La FA asintomática tiene idéntico riesgo embólico que la FA sintomática.",
      "Solicitar ecocardiograma transtorácico basal en toda FA."
    ],
    preguntaCompleta: {
      numero: 6,
      enunciado: "Mujer de 65 años, hipertensa en tratamiento con enalapril, consulta por palpitaciones e intolerancia al esfuerzo de 3 semanas. ECG demuestra fibrilación auricular con FC 110x'. Ecocardiograma muestra aurícula izquierda de 44 mm y FE 55%. Su puntaje CHA2DS2-VASc es de 3 puntos. La conducta antitrombótica más adecuada es:",
      opciones: [
        { id: "A", texto: "Aspirina 100 mg/día VO" },
        { id: "B", texto: "Clopidogrel 75 mg/día VO" },
        { id: "C", texto: "Anticoagulación oral a permanencia" },
        { id: "D", texto: "Doble terapia antiagregante con aspirina y clopidogrel" },
        { id: "E", texto: "No requiere tratamiento antitrombótico" }
      ],
      correcta: "C",
      explicacion: "En Fibrilación Auricular no valvular con puntaje CHA₂DS₂-VASc >= 2 en hombres o >= 3 en mujeres, la indicación de Anticoagulación Oral a permanencia es absoluta para prevenir accidentes cerebrovasculares cardioembólicos."
    },
    svg: "algo_fa.svg",
    algoTitle: "Estrategia Global AF-CARE de Manejo de Fibrilación Auricular"
  },
  {
    number: "1.12",
    title: "Taquicardia Paroxística Supraventricular (TPSV)",
    perfilCode: "1.01.1.024",
    dx: "Específico", tx: "Inicial", seg: "Completo",
    defText: "La TPSV es una taquicardia regular de complejo angosto (<0.12s) común en jóvenes sin cardiopatía. Inicio y término brusco ('efecto interruptor').",
    fisioText: "El mecanismo más común es la Reentrada Nodal AV (TRNAV) por doble vía nodal (rápida y lenta). El segundo es la Reentrada AV por vía accesoria (WPW).",
    criterios: [
      "1° Línea: Maniobras Vagales (Valsalva modificada elevada a 45°).",
      "2° Línea: Adenosina 6mg EV bolo rápido -> 12mg EV.",
      "3° Línea: Verapamilo 5mg EV o Diltiazem."
    ],
    vignette: "Mujer de 28 años consulta por palpitaciones bruscas e intensas. FC 185x', PA 115/75. ECG: QRS angosto regular sin P.",
    piensaEn: "Taquicardia Paroxística Supraventricular por Reentrada Nodal.",
    conducta: "Maniobras Vagales (Valsalva modificada). Si falla -> Adenosina 6 mg EV bolo rápido.",
    tip: "Paciente joven con TPSV estable -> La PRIMERA MEDIDA a realizar son Maniobras Vagales.",
    ges: "Ablación por catéter curativa disponible en electrofisiología.",
    farmacos: [
      { f: "Adenosina", ind: "TPSV estable", dosis: "6 mg EV bolo -> 12 mg EV", prec: "Contraindicada en asma severo." },
      { f: "Verapamilo", ind: "TPSV refractaria", dosis: "5 mg EV en 2 min", prec: "CONTRAINDICADO en WPW + FA." }
    ],
    pearls: [
      "En WPW con FA está CONTRAINDICADO Verapamilo, Adenosina o Digoxina por riesgo de FV.",
      "El patrón ECG de WPW en sinusal muestra PR corto (<0.12s), onda Delta y QRS ancho."
    ],
    preguntaCompleta: {
      numero: 8,
      enunciado: "Mujer de 30 años sin antecedentes médicos, consulta por palpitaciones muy intensas de inicio y término brusco. Al examen se encuentra vigil, normotensa (PA: 110/70 mmHg), con FC: 180x'. ECG demuestra taquicardia regular de complejo QRS angosto (0.08s) sin ondas P visibles. ¿Cuál es la primera medida a seguir?",
      opciones: [
        { id: "A", texto: "Administrar adenosina 6 mg EV en bolo rápido" },
        { id: "B", texto: "Administrar amiodarona 150 mg EV en 10 minutos" },
        { id: "C", texto: "Realizar cardioversión eléctrica sincronizada" },
        { id: "D", texto: "Realizar maniobras vagales (Valsalva modificada)" },
        { id: "E", texto: "Administrar propafenona 300 mg VO" }
      ],
      correcta: "D",
      explicacion: "En un paciente estable con TPSV (QRS angosto regular), la primera intervención no invasiva recomendada por todas las guías clínicas es la realización de Maniobras Vagales (Valsalva modificada). Si estas fracasan, la primera opción farmacológica es la Adenosina EV."
    },
    svg: "algo_tpsv.svg",
    algoTitle: "Algoritmo de Manejo de TPSV en Urgencias"
  },
  {
    number: "1.13",
    title: "TV y Canalopatías",
    perfilCode: "1.01.2.009",
    dx: "Sospecha", tx: "Inicial", seg: "Derivar",
    defText: "Toda taquicardia de QRS ancho (>=0.12s) en adulto con antecedentes cardiovasculares debe manejarse como Taquicardia Ventricular hasta probar lo contrario.",
    fisioText: "La TV se origina en el miocardio ventricular por circuitos de reentrada post-infarto o automatismo. Dar Verapamilo creyendo que es TPSV provoca choque y colapso letal.",
    criterios: [
      "Sin Pulso: Desfibrilación 200J + RCP.",
      "Con Pulso e Inestable: Cardioversión Eléctrica Sincronizada (100-200J).",
      "Con Pulso y Estable: Amiodarona 150mg EV en 10 min o Procainamida."
    ],
    vignette: "Hombre de 65 años con infarto antiguo presenta palpitaciones y mareos. PA 105/65, FC 170x'. ECG: QRS ancho a 0.16s con disociación AV.",
    piensaEn: "Taquicardia Ventricular Monomórfica Sostenida.",
    conducta: "Amiodarona 150 mg EV en 10 min si estable.",
    tip: "Ante la duda en QRS ancho en adulto -> SIEMPRE tratar como Taquicardia Ventricular.",
    ges: "Derivación urgente a Cuidados Coronarios / UCI.",
    farmacos: [
      { f: "Amiodarona", ind: "TV monomórfica estable", dosis: "150 mg EV en 10 min", prec: "Monitorear presión arterial." },
      { f: "Sulfato Magnesio", ind: "Torsades de Pointes", dosis: "1-2 g EV en 10 min", prec: "Indicado en QT largo." }
    ],
    pearls: [
      "Latidos de captura y fusión confirman 100% el diagnóstico de Taquicardia Ventricular.",
      "Síndrome de Brugada: Mutación SCN5A, ST ensillado V1-V3, riesgo muerte súbita en hombres jóvenes."
    ],
    preguntaCompleta: {
      numero: 14,
      enunciado: "Paciente de 68 años con antecedente de infarto agudo de miocardio antiguo, ingresa al servicio de urgencias por palpitaciones y mareos. Al examen: PA: 110/70 mmHg, FC: 160x'. El ECG demuestra taquicardia regular de complejo QRS ancho (0.16s) con presencia de latidos de captura. ¿Cuál es la conducta terapéutica más adecuada?",
      opciones: [
        { id: "A", texto: "Administrar amiodarona 150 mg EV en 10 minutos" },
        { id: "B", texto: "Administrar verapamilo 5 mg EV bolo" },
        { id: "C", texto: "Realizar maniobras vagales" },
        { id: "D", texto: "Administrar adenosina 6 mg EV bolo rápido" },
        { id: "E", texto: "Dar de alta con propranolol 40 mg VO" }
      ],
      correcta: "A",
      explicacion: "Taquicardia de QRS ancho con capturas en paciente con antecedentes coronarios confirma Taquicardia Ventricular. Al encontrarse hemodinámicamente estable (PA 110/70 mmHg), el tratamiento farmacológico inicial de elección es Amiodarona 150 mg EV administrados en 10 minutos."
    },
    svg: "algo_tv.svg",
    algoTitle: "Algoritmo de Taquicardia de QRS Ancho"
  }
];

function generateHtml() {
  let pagesHtml = `
  <!-- COVER PAGE -->
  <div class="page cover">
    <h1>EUNACOM CARDIOLOGÍA</h1>
    <h2>Capítulo 1: Arritmias y Emergencias Cardiovasculares</h2>
    <div class="badge">Manual de Estudio EUNACOM &bull; Chile 2026</div>
  </div>
  `;

  fullTopicsData.forEach(t => {
    pagesHtml += `
    <div class="page">
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

      <!-- TOP CONTENT: 2 EQUAL COLUMNS (50% LEFT / 50% RIGHT) -->
      <div class="two-cols">
        <!-- LEFT COLUMN (50%) -->
        <div class="col-left">
          <div class="subhead">Definición y Concepto Fundamental</div>
          <p class="txt">${t.defText}</p>

          <div class="subhead">Fisiopatología Detallada</div>
          <p class="txt">${t.fisioText}</p>

          <div class="subhead">Criterios Clínicos y Diagnóstico</div>
          <ul class="lst">
            ${(t.criterios || []).map(c => `<li>${c}</li>`).join('')}
          </ul>

          <div class="box tip">
            <div class="box-title">EUNACOM TIP</div>
            <p>${t.tip || ''}</p>
          </div>

          <div class="box ges">
            <div class="box-title">MINSAL GES / PROTOCOLO</div>
            <p>${t.ges || ''}</p>
          </div>
        </div>

        <!-- RIGHT COLUMN (50%) -->
        <div class="col-right">
          <div class="box vignette">
            <div class="box-title">Caso Clínico Tipo EUNACOM</div>
            <p><em>"${t.vignette || ''}"</em></p>
            <p style="margin-top:4px;"><strong>Piensa en:</strong> ${t.piensaEn || ''}</p>
            <p><strong>Conducta:</strong> ${t.conducta || ''}</p>
          </div>

          <table class="tbl">
            <caption>Fármacos Clave y Manejo</caption>
            <thead><tr><th>Fármaco</th><th>Indicación</th><th>Dosis</th></tr></thead>
            <tbody>
              ${(t.farmacos || []).map(f => `<tr><td><strong>${f.f}</strong></td><td>${f.ind}</td><td>${f.dosis}</td></tr>`).join('')}
            </tbody>
          </table>

          <div class="box high-yield">
            <div class="box-title">Perlas Clínicas EUNACOM</div>
            <ul class="lst">
              ${(t.pearls || []).map(p => `<li>${p}</li>`).join('')}
            </ul>
          </div>
        </div>
      </div>

      <!-- FULL-WIDTH PLANTUML SVG ALGORITHM -->
      <div class="diagram-box">
        <div class="d-title">${t.algoTitle.toUpperCase()}</div>
        ${getSvg(t.svg)}
      </div>

      <!-- FULL 100% PAGE WIDTH PRACTICE QUESTION AT THE BOTTOM -->
      <div class="q-full-width">
        <div class="q-hdr">PREGUNTA ${t.preguntaCompleta.numero} EUNACOM</div>
        <div class="q-stem">${t.preguntaCompleta.enunciado}</div>
        <div class="q-options-grid">
          ${t.preguntaCompleta.opciones.map(o => `
            <div class="q-opt-item ${o.id === t.preguntaCompleta.correcta ? 'correct' : ''}">
              <strong>${o.id})</strong> ${o.texto}
            </div>
          `).join('')}
        </div>
        <div class="q-explanation">
          <strong>Respuesta Correcta ${t.preguntaCompleta.correcta}:</strong> ${t.preguntaCompleta.explicacion}
        </div>
      </div>
    </div>
    `;
  });

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Merriweather:wght@400;700&display=swap');
    
    @page {
      size: letter;
      margin: 0.35in;
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: 'Inter', sans-serif;
      font-size: 9pt;
      line-height: 1.38;
      color: #0f172a;
      background: #ffffff;
      -webkit-print-color-adjust: exact;
    }
    
    .page {
      width: 100%;
      page-break-after: always;
      position: relative;
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
    .cover .badge { background: #1e293b; border: 1px solid #334155; padding: 8px 24px; font-size: 12pt; border-radius: 4px; }
    
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
    
    /* STRICT TWO EQUAL COLUMNS (50% / 50% HALF PAGE WIDTH) */
    .two-cols {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-gap: 0.2in;
      width: 100%;
      align-items: start;
    }
    
    .col-left {
      border-right: 1px solid #cbd5e1;
      padding-right: 0.1in;
    }
    
    .col-right {
      padding-left: 0.05in;
    }
    
    /* STEP 2 CK BOXES */
    .box {
      border: 1px solid #cbd5e1;
      border-radius: 2px;
      padding: 6px 8px;
      margin-bottom: 6px;
      font-size: 8.5pt;
    }
    .box-title {
      font-weight: 700;
      font-size: 7.5pt;
      text-transform: uppercase;
      margin-bottom: 3px;
      letter-spacing: 0.5px;
    }
    .box.high-yield { background: #f8fafc; border-left: 3.5px solid #1e3a8a; }
    .box.high-yield .box-title { color: #1e3a8a; }
    
    .box.vignette { background: #fffbeb; border-color: #fcd34d; border-left: 3.5px solid #d97706; }
    .box.vignette .box-title { color: #92400e; }
    
    .box.tip { background: #f0f9ff; border-color: #bae6fd; border-left: 3.5px solid #0284c7; }
    .box.tip .box-title { color: #0369a1; }
    
    .box.ges { background: #f0fdf4; border-color: #bbf7d0; border-left: 3.5px solid #16a34a; }
    .box.ges .box-title { color: #15803d; }

    .subhead {
      font-family: 'Merriweather', serif;
      font-size: 9.5pt;
      font-weight: 700;
      color: #1e3a8a;
      margin: 6px 0 3px 0;
      border-bottom: 1px solid #cbd5e1;
    }
    
    p.txt { font-size: 8.5pt; line-height: 1.35; margin-bottom: 5px; text-align: justify; }
    ul.lst { padding-left: 12px; margin-bottom: 5px; }
    ul.lst li { font-size: 8.5pt; margin-bottom: 2px; }

    /* TABLES */
    table.tbl {
      width: 100%;
      border-collapse: collapse;
      margin: 5px 0;
      font-size: 7.5pt;
      border-top: 1.5px solid #1e3a8a;
      border-bottom: 1.5px solid #1e3a8a;
    }
    table.tbl th { background: #f1f5f9; color: #1e3a8a; padding: 3px 4px; text-align: left; font-size: 7pt; text-transform: uppercase; }
    table.tbl td { padding: 3px 4px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }

    /* DIAGRAM CONTAINER (FULL WIDTH) */
    .diagram-box {
      width: 100%;
      border: 1px solid #1e3a8a;
      border-radius: 2px;
      padding: 5px;
      margin-top: 6px;
      margin-bottom: 6px;
      background: #ffffff;
    }
    .diagram-box .d-title {
      font-weight: 700;
      font-size: 7.5pt;
      text-transform: uppercase;
      color: #1e3a8a;
      text-align: center;
      margin-bottom: 3px;
      border-bottom: 1px solid #cbd5e1;
    }
    .diagram-box svg { width: 100%; height: auto; display: block; }
    
    /* FULL 100% WIDTH PRACTICE QUESTION AT THE BOTTOM */
    .q-full-width {
      width: 100%;
      background: #ffffff;
      border: 1px solid #64748b;
      border-radius: 2px;
      padding: 6px 10px;
      margin-top: 4px;
    }
    .q-full-width .q-hdr {
      font-weight: 700;
      font-size: 8pt;
      color: #2563eb;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 2px;
    }
    .q-full-width .q-stem {
      font-size: 8.5pt;
      line-height: 1.35;
      margin-bottom: 5px;
    }
    .q-options-grid {
      display: flex;
      flex-direction: column;
      gap: 2px;
      margin-bottom: 4px;
    }
    .q-opt-item {
      font-size: 8pt;
      padding: 2px 4px;
      border-radius: 2px;
    }
    .q-opt-item.correct {
      background: #f0fdf4;
      font-weight: 600;
      color: #15803d;
      border-left: 3px solid #16a34a;
    }
    .q-explanation {
      background: #f8fafc;
      border-top: 1px solid #cbd5e1;
      padding-top: 3px;
      margin-top: 3px;
      font-size: 7.5pt;
      color: #0f172a;
      line-height: 1.3;
    }
    .q-explanation strong { color: #15803d; }
  </style>
</head>
<body>
  ${pagesHtml}
</body>
</html>`;
}

async function main() {
  console.log("Generando PDF (Preguntas en 100% ancho, Sin título High Yield, PlantUML en full width)...");
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
    margin: {
      top: '0.35in',
      bottom: '0.35in',
      left: '0.35in',
      right: '0.35in'
    }
  });

  await browser.close();
  console.log("¡ÉXITO! PDF generado en:", outputPdfPath);
}

main().catch(console.error);
