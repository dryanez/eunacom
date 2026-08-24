// Interactive Question Engine & Bank for MedLingo EUNACOM
// Implements the "TEACH FIRST, THEN ASK" pedagogy (Concept Slide -> Practice Challenges)
// Supports: concept_card, flash_mcq, match_pairs, order_sequence, fill_blanks, speed_true_false

export const NODE_QUESTIONS = {
  // ══════════════════════════════════════════════════════════════════════════
  // CARDIOLOGÍA 1.1: Focos, Ruidos Cardíacos y Semiología
  // ══════════════════════════════════════════════════════════════════════════
  'cardio_1_1': [
    // ── STEP 1: TEACH FIRST (Micro-Concept Card) ──
    {
      id: 'c11_concept_1',
      type: 'concept_card',
      title: 'Focos de Auscultación y Ruidos Cardinales',
      subtitle: 'Aprende la regla de oro antes de auscultar a tu paciente de guardia',
      mentorId: 'dr_yang',
      dialogue: '¡Atención, doctor(a)! Grábate la anatomía de los focos antes de poner el estetoscopio. Un error en la auscultación y el diagnóstico se derrumba.',
      keyPoints: [
        'Foco Aórtico (2° EIC Derecho, paraesternal): Soplo eyectivo rudo con irradiación a carótidas.',
        'Foco Mitral / Ápex (5° EIC Izquierdo): Soplo holosistólico con irradiación a la axila.',
        'R3 vs R4: R3 = Sobrecarga de volumen (IC descompensada) | R4 = Rigidez ventricular (¡IMPOSIBLE en Fibrilación Auricular!).'
      ],
      mnemonic: '💡 Regla Nemotécnica: "A-P-T-M" (Aórtico derecho, Pulmonar izquierdo, Tricúspide bajo, Mitral ápex).'
    },
    // ── STEP 2: TEST THE CONCEPT (Flash MCQ) ──
    {
      id: 'c11_q1',
      type: 'flash_mcq',
      prompt: '¿En qué foco auscultatorio se ausculta con máxima intensidad el soplo de la Estenosis Aórtica con irradiación a carótidas?',
      choices: [
        { id: 'A', text: '2° espacio intercostal derecho, línea paraesternal', isCorrect: true },
        { id: 'B', text: '5° espacio intercostal izquierdo, línea medioclavicular (ápex)', isCorrect: false },
        { id: 'C', text: '2° espacio intercostal izquierdo, borde esternal', isCorrect: false },
        { id: 'D', text: '4° espacio intercostal izquierdo, borde esternal', isCorrect: false }
      ],
      explanation: 'El foco aórtico principal se ubica en el 2° EIC derecho, línea paraesternal. El soplo de la estenosis aórtica es mesosistólico eyectivo, rudo y con irradiación carotídea bilateral.',
      minsalPearl: 'En el adulto mayor con estenosis aórtica severa sintomática (tríada SAD: Síncope, Angina o Disnea), el reemplazo valvular o TAVI es prioritario.',
      hint: 'Recuerda: la válvula aórtica es la única que se ausculta a la DERECHA del esternón.',
      mentorTip: { mentorId: 'dr_yang', dialogue: '¡La válvula aórtica está a la DERECHA del esternón! Los cirujanos nunca perdonan confundir derecha con izquierda.' }
    },
    // ── STEP 3: MATCH PAIRS (Soplos Clásicos) ──
    {
      id: 'c11_q2',
      type: 'match_pairs',
      prompt: 'Une cada hallazgo semiológico con su diagnóstico patognomónico:',
      pairs: [
        { left: 'Desdoblamiento fijo de S2', right: 'Comunicación Interauricular (CIA)' },
        { left: 'Soplo continuo en maquinaria', right: 'Ductus Arterioso Persistente (DAP)' },
        { left: 'Chasquido de apertura mitral', right: 'Estenosis Mitral Reumática' },
        { left: 'Soplo holosistólico en barra', right: 'Comunicación Interventricular (CIV)' }
      ],
      explanation: 'El desdoblamiento fijo de S2 se produce por la sobrecarga constante de volumen en el ventrículo derecho originada por el shunt interauricular.',
      minsalPearl: 'El DAP sintomático requiere cierre oportuno para prevenir hipertensión pulmonar y síndrome de Eisenmenger.',
      hint: 'Piensa en el flujo continuo del Ductus como una maquinaria que nunca se detiene entre sístole y diástole.'
    },
    // ── STEP 4: FILL BLANKS (Guía Semiología) ──
    {
      id: 'c11_q3',
      type: 'fill_blanks',
      prompt: 'Completa la norma semiológica sobre el Tercer Ruido Cardíaco (S3):',
      textTemplate: 'El tercer ruido cardíaco (S3) se produce por {0} ventricular rápido durante el llenado pasivo y es un signo cardinal de {1}.',
      blanks: ['sobrecarga de volumen', 'insuficiencia cardíaca'],
      wordBank: ['sobrecarga de volumen', 'insuficiencia cardíaca', 'estenosis mitral', 'hipertensión pulmonar', 'bloqueo AV'],
      explanation: 'El S3 (galope ventricular) traduce sobrecarga de volumen y presiones de llenado elevadas en el ventrículo izquierdo.',
      minsalPearl: 'La combinación de R3 + Ingurgitación Yugular son los signos con mayor especificidad clínica para Insuficiencia Cardíaca descompensada en APS.',
      hint: 'S3 = Volumen (Sobrecarga). S4 = Presión / Rigidez.'
    },
    // ── STEP 5: SPEED TRIAGE (V/F) ──
    {
      id: 'c11_q4',
      type: 'speed_true_false',
      prompt: 'Triage Clínico Rápido: ¿Verdadero o Falso?',
      statement: 'El cuarto ruido cardíaco (S4) puede auscultarse en pacientes con Fibrilación Auricular activa.',
      isCorrect: false,
      explanation: 'FALSO: El cuarto ruido (S4) es generado por la contracción auricular activa ("patada auricular"). En la fibrilación auricular no existe contracción auricular coordinada, por lo que el S4 es biológicamente imposible.',
      hint: '¿Existe contracción auricular en la fibrilación auricular? No, solo fibrilación desorganizada.',
      mentorTip: { mentorId: 'dr_house', dialogue: 'Sin contracción auricular no hay patada auricular ni S4. Es pura fisiología básica, doctor.' }
    }
  ],

  // ══════════════════════════════════════════════════════════════════════════
  // CARDIOLOGÍA 1.2: Soplos Sistólicos y Pulsos
  // ══════════════════════════════════════════════════════════════════════════
  'cardio_1_2': [
    // ── TEACH FIRST: Soplos y Pulsos ──
    {
      id: 'c12_concept_1',
      type: 'concept_card',
      title: 'Pulsos Arteriales y Valvulopatías Aórticas',
      subtitle: 'La conexión directa entre la curva de pulso y la válvula',
      mentorId: 'dr_house',
      dialogue: 'Toca la arteria carótida del paciente antes de pedir exámenes caros. El pulso te da el diagnóstico en 5 segundos.',
      keyPoints: [
        '🩺 Pulso Parvus et Tardus: Baja amplitud y ascenso lento = Estenosis Aórtica Severa.',
        '🩺 Pulso Celer et Magnus (Corrigan): Salto rápido y colapso brusco = Insuficiencia Aórtica Grave.',
        '🩺 Pulso Paradójico: Caída >10 mmHg de la PAS en inspiración = Taponamiento Cardíaco o Crisis Asmática Severa.',
        '🩺 Pulso Alternante: Amplitud que varía latido a latido = Disfunción Ventricular Izquierda Grave.'
      ],
      mnemonic: '💡 "Parvus et Tardus" = Pequeño y Tardío como el orificio aórtico estenosado.'
    },
    {
      id: 'c12_q1',
      type: 'flash_mcq',
      prompt: 'Hombre de 74 años consulta por síncope de esfuerzo. Al examen: pulso carotídeo de baja amplitud y ascenso lento (parvus et tardus) y soplo sistólico eyectivo rudo en 2° EIC derecho. ¿Diagnóstico?',
      choices: [
        { id: 'A', text: 'Estenosis Aórtica severa', isCorrect: true },
        { id: 'B', text: 'Insuficiencia Mitral aguda', isCorrect: false },
        { id: 'C', text: 'Miocardiopatía Dilatada', isCorrect: false },
        { id: 'D', text: 'Insuficiencia Aórtica crónica', isCorrect: false }
      ],
      explanation: 'La tríada clásica de Estenosis Aórtica es Síncope, Angina y Disnea (SAD), asociada al pulso parvus et tardus y soplo mesosistólico en diamante.',
      minsalPearl: 'Todo paciente mayor de 65 años con soplo sistólico y síncope requiere Ecocardiograma Doppler urgente en la canasta GES de valvulopatías.',
      hint: 'Pulso parvus et tardus + síncope en adulto mayor = Estenosis Aórtica.',
      mentorTip: { mentorId: 'dr_yang', dialogue: 'El pulso parvus et tardus es la firma de la válvula aórtica estenosada. ¡Directo al ecocardio!' }
    },
    {
      id: 'c12_q2',
      type: 'match_pairs',
      prompt: 'Relaciona cada valvulopatía o condición con su pulso periférico característico:',
      pairs: [
        { left: 'Estenosis Aórtica', right: 'Pulso Parvus et Tardus' },
        { left: 'Insuficiencia Aórtica', right: 'Pulso Celer et Magnus (Corrigan)' },
        { left: 'Taponamiento Cardíaco', right: 'Pulso Paradójico' },
        { left: 'Fibrilación Auricular', right: 'Déficit de Pulso' }
      ],
      explanation: 'El pulso celer et magnus refleja la gran presión diferencial originada por el reflujo aórtico masivo hacia el ventrículo.',
      hint: 'El reflujo aórtico provoca eyección hiperdinámica seguida de colapso diastólico inmediato.'
    },
    {
      id: 'c12_q3',
      type: 'order_sequence',
      prompt: 'Ordena la secuencia diagnóstica ante un paciente con soplo sistólico nuevo y síncope en APS:',
      steps: [
        { id: 's1', text: '1. Anamnesis dirigida (búsqueda de síncope, angina o disnea)', correctOrder: 1 },
        { id: 's2', text: '2. ECG de 12 derivaciones (evaluación de hipertrofia ventricular izquierda)', correctOrder: 2 },
        { id: 's3', text: '3. Solicitud prioritaria de Ecocardiograma Transtorácico Doppler', correctOrder: 3 },
        { id: 's4', text: '4. Derivación a Cardiología para resolución quirúrgica/TAVI según gradiente', correctOrder: 4 }
      ],
      explanation: 'El ecocardiograma transtorácico es el examen confirmatorio estándar para calcular el área valvular y el gradiente medio.',
      hint: 'Primero evalúa los síntomas de alarma, luego ECG, y confirma con ecocardiografía.'
    }
  ],

  // ══════════════════════════════════════════════════════════════════════════
  // CARDIOLOGÍA 2.1: Taquiarritmias y Manejo de Urgencia
  // ══════════════════════════════════════════════════════════════════════════
  'cardio_2_1': [
    // ── TEACH FIRST: Taquiarritmias ──
    {
      id: 'c21_concept_1',
      type: 'concept_card',
      title: 'Algoritmo de Taquicardias en el Box de Urgencias',
      subtitle: 'La regla de oro: ¿Estable o Inestable?',
      mentorId: 'dr_yang',
      dialogue: 'En taquiarritmias no dudas: Si el paciente está INESTABLE (hipotensión, dolor torácico, shock, edema agudo de pulmón o compromiso de conciencia), ¡descarga eléctrica sincronizada inmediata! Si está ESTABLE, usamos fármacos.',
      keyPoints: [
        '⚡ INESTABLE: Cardioversión Eléctrica Sincronizada (50-100-200 Joules) de inmediato.',
        '💊 ESTABLE QRS Angosto Regular (TPSV): Maniobras vagales → Adenosina 6 mg EV en bolo rápido (+ push de SF y brazo elevado) → 2ª dosis 12 mg si persiste.',
        '💊 ESTABLE Fibrilación Auricular / Flutter: Control de frecuencia con Betabloqueador (Metoprolol/Esmolol) o Diltiazem EV.',
        '⚠️ TV Sin Pulso / FV: ¡Desfibrilación No Sincronizada Inmediata!'
      ],
      mnemonic: '💡 "Inestable = Electroshocks; Estable = Farmacología".'
    },
    {
      id: 'c21_q1',
      type: 'flash_mcq',
      prompt: 'Mujer de 34 años consulta en SAPU por palpitaciones súbitas. El monitor muestra taquicardia regular de QRS estrecho a 190 lpm. Presión arterial 122/78 mmHg, vigil, orientada, sin dolor torácico ni disnea. Tras maniobras vagales sin respuesta, ¿cuál es el fármaco de 1ª línea?',
      choices: [
        { id: 'A', text: 'Adenosina 6 mg en bolo EV rápido', isCorrect: true },
        { id: 'B', text: 'Amiodarona 300 mg EV en infusión lenta', isCorrect: false },
        { id: 'C', text: 'Cardioversión eléctrica sincronizada 100 J', isCorrect: false },
        { id: 'D', text: 'Digoxina 0.5 mg EV en bolo', isCorrect: false }
      ],
      explanation: 'En TPSV hemodinámicamente estable, el tratamiento farmacológico de primera elección tras maniobras vagales es Adenosina 6 mg EV en bolo rápido proximal. Si no revierte en 1-2 minutos, se administra una segunda dosis de 12 mg EV.',
      minsalPearl: 'La adenosina tiene una vida media de menos de 10 segundos, por lo que debe administrarse por una vía venosa gruesa antecubital seguida de un bolo de 20 mL de suero fisiológico.',
      hint: 'La paciente está estable. Fármaco de ultra-rápida acción que bloquea transitoriamente el nodo AV.',
      mentorTip: { mentorId: 'dr_cox', dialogue: '¡Bolo en 2 segundos y levanta el brazo de la paciente! Si lo pasas lento, se destruye en la sangre antes de llegar al corazón.' }
    },
    {
      id: 'c21_q2',
      type: 'order_sequence',
      prompt: 'Ordena el algoritmo de Paro Cardiorrespiratorio en Ritmo Desfibrilable (TVSP / FV) según ACLS & MINSAL:',
      steps: [
        { id: 't1', text: '1. Iniciar RCP de alta calidad 30:2 y conectar Monitor / Desfibrilador', correctOrder: 1 },
        { id: 't2', text: '2. Administrar 1 Choque Desfibrilatorio no sincronizado (200J bifásico)', correctOrder: 2 },
        { id: 't3', text: '3. Reanudar RCP inmediatamente por 2 minutos sin chequear pulso', correctOrder: 3 },
        { id: 't4', text: '4. Administrar Adrenalina 1 mg EV tras el 2° choque fallido (repetir c/ 3-5 min)', correctOrder: 4 },
        { id: 't5', text: '5. Administrar Amiodarona 300 mg EV en bolo tras el 3er choque fallido', correctOrder: 5 }
      ],
      explanation: 'En ritmos desfibrilables, la descarga precoz es la única maniobra que revierte la arritmia mortal. La adrenalina se administra desde el 2° ciclo y los antiarrítmicos (Amiodarona o Lidocaína) tras el 3er choque.',
      hint: 'Desfibrilar -> 2 min RCP -> 2° choque + Adrenalina -> 3er choque + Amiodarona.'
    },
    {
      id: 'c21_q3',
      type: 'match_pairs',
      prompt: 'Empareja la arritmia y estado del paciente con su conducta terapéutica inmediata:',
      pairs: [
        { left: 'TPSV Inestable (PAS 70, estupor)', right: 'Cardioversión Eléctrica Sincronizada' },
        { left: 'Fibrilación Ventricular (en paro)', right: 'Desfibrilación Asincrónica Inmediata' },
        { left: 'TPSV Estable', right: 'Maniobras Vagales → Adenosina EV' },
        { left: 'Fibrilación Auricular RVR Estable', right: 'Betabloqueador o Diltiazem EV' }
      ],
      explanation: 'Toda taquiarritmia con inestabilidad hemodinámica requiere cardioversión sincronizada de emergencia.',
      hint: 'Inestable = Sincronizada. Paro en FV = Asincrónica.'
    }
  ],

  // ══════════════════════════════════════════════════════════════════════════
  // GASTROENTEROLOGÍA 1.1: Hemorragia Digestiva Alta (HDA)
  // ══════════════════════════════════════════════════════════════════════════
  'gastro_1_1': [
    // ── TEACH FIRST: HDA ──
    {
      id: 'g11_concept_1',
      type: 'concept_card',
      title: 'Hemorragia Digestiva Alta: Variceal vs Úlcera Péptica',
      subtitle: 'Tratamiento farmacológico de urgencia antes de la endoscopía',
      mentorId: 'dr_house',
      dialogue: 'En el paciente cirrótico que vomita sangre, no esperes a la endoscopía para actuar: Inicia Terlipresina y Ceftriaxona de inmediato. El antibiótico reduce la mortalidad un 50% por prevención de peritonitis bacteriana espontánea.',
      keyPoints: [
        '🩸 Reanimación Restrictiva: Meta de Hemoglobina 7 - 8 g/dL (evita aumentar la presión portal y el resangrado).',
        '💊 HDA Variceal (Cirrótico): Terlipresina EV (o Somatostatina / Octreotide) + Ceftriaxona 1g/día EV profiláctica.',
        '💊 HDA No Variceal (Úlcera Péptica): Omeprazol bolo 80 mg EV + infusión 8 mg/h (o bolos cada 12h).',
        '⏱️ Endoscopía Digestiva Alta (EDA): En las primeras 12-24 horas tras la estabilización hemodinámica.'
      ],
      mnemonic: '💡 Tríada del Cirrótico con HDA: "Cristaloides restrictivos + Terlipresina + Ceftriaxona".'
    },
    {
      id: 'g11_q1',
      type: 'flash_mcq',
      prompt: 'Paciente de 54 años con cirrosis hepática Child B ingresa por hematemesis masiva y melena. PA 85/55 mmHg, FC 118 lpm. Tras iniciar reanimación con suero fisiológico restrictivo, ¿cuál es el tratamiento farmacológico prioritario a iniciar ANTES de la endoscopía?',
      choices: [
        { id: 'A', text: 'Terlipresina EV + Ceftriaxona EV profiláctica', isCorrect: true },
        { id: 'B', text: 'Propranolol oral en dosis alta', isCorrect: false },
        { id: 'C', text: 'Ácido Tranexámico en infusión continua', isCorrect: false },
        { id: 'D', text: 'Furosemida EV para prevenir sobrecarga', isCorrect: false }
      ],
      explanation: 'En sospecha de HDA variceal, el tratamiento médico precoz con vasoconstrictores esplácnicos (Terlipresina) y profilaxis antibiótica con Ceftriaxona reduce significativamente la mortalidad y el resangrado precoz.',
      minsalPearl: 'La ligadura endoscópica con bandas elásticas es el tratamiento de elección definitivo durante la EDA.',
      hint: 'Vasoconstrictor esplácnico + profilaxis antibiótica contra PBE.',
      mentorTip: { mentorId: 'dr_house', dialogue: 'El betabloqueador (propranolol) es prevención secundaria para cuando el paciente esté estable, ¡jamás en hemorragia aguda activa!' }
    },
    {
      id: 'g11_q2',
      type: 'order_sequence',
      prompt: 'Ordena el algoritmo de manejo en el box de reanimación para HDA grave:',
      steps: [
        { id: 'h1', text: '1. Vía aérea segura y 2 accesos venosos periféricos gruesos (14G o 16G)', correctOrder: 1 },
        { id: 'h2', text: '2. Reanimación hemodinámica restrictiva (meta PAS 90-100 mmHg / Hb 7-8 g/dL)', correctOrder: 2 },
        { id: 'h3', text: '3. Inicio de IBP bolo EV + Vasoactivo (Terlipresina) y Ceftriaxona si hay cirrosis', correctOrder: 3 },
        { id: 'h4', text: '4. Endoscopía Digestiva Alta terapéutica de urgencia (< 12-24h)', correctOrder: 4 }
      ],
      explanation: 'La secuencia ABC y estabilización hemodinámica restrictiva siempre precede al procedimiento endoscópico.',
      hint: 'Asegura accesos venosos -> Reanima con restricción -> Fármacos -> Endoscopía.'
    }
  ]
}

// Fallback generator for nodes without custom questions yet
export const getQuestionsForNode = (nodeId, moduleInfo) => {
  if (NODE_QUESTIONS[nodeId] && NODE_QUESTIONS[nodeId].length > 0) {
    return NODE_QUESTIONS[nodeId]
  }

  const mentorId = moduleInfo?.mentorId || 'dr_house'
  return [
    {
      id: `${nodeId}_concept_gen`,
      type: 'concept_card',
      title: `Perla de Guardia: ${moduleInfo?.name || 'Medicina Interna'}`,
      subtitle: 'Guías Clínicas GES / MINSAL 2026',
      mentorId,
      dialogue: 'Revisa este concepto fundamental antes de enfrentar las preguntas de este turno.',
      keyPoints: [
        `📌 En ${moduleInfo?.name || 'esta especialidad'}, la evaluación clínica precoz y estratificación de riesgo según las Guías Clínicas GES/MINSAL es la clave del éxito.`,
        '📌 Siempre prioriza la estabilización inicial (ABCDE) antes de exámenes complementarios de alta complejidad.',
        '📌 En Chile, las patologías con garantía GES tienen plazos máximos por ley para confirmación y tratamiento.'
      ],
      mnemonic: '💡 Principio EUNACOM: Enfoque clínico estructurado + Guía MINSAL vigente.'
    },
    {
      id: `${nodeId}_q1_gen`,
      type: 'flash_mcq',
      prompt: `Pregunta de Guardia: ¿Cuál es el pilar diagnóstico principal en ${moduleInfo?.name || 'Medicina'} según las Guías Clínicas GES/MINSAL?`,
      choices: [
        { id: 'A', text: 'Evaluación clínica estructurada y estratificación de riesgo según guías chilenas', isCorrect: true },
        { id: 'B', text: 'Solicitud indiscriminada de imágenes complejas sin anamnesis', isCorrect: false },
        { id: 'C', text: 'Manejo expectante sin registro en ficha clínica', isCorrect: false },
        { id: 'D', text: 'Derivación terciaria sin estabilización previa en APS', isCorrect: false }
      ],
      explanation: 'Las guías clínicas chilenas del MINSAL enfatizan la estratificación clínica oportuna y el tratamiento protocolizado.',
      minsalPearl: 'El cumplimiento de las garantías de oportunidad y acceso GES es de carácter prioritario.',
      hint: 'Piensa en el rol del médico general en la red asistencial pública chilena.',
      mentorTip: { mentorId, dialogue: 'En el EUNACOM las guías MINSAL son la ley suprema. ¡Léelas bien!' }
    },
    {
      id: `${nodeId}_q2_gen`,
      type: 'speed_true_false',
      prompt: 'Triage Clínico Rápido: ¿Verdadero o Falso?',
      statement: 'En el sistema de salud chileno, las patologías GES tienen plazos máximos de atención garantizados por ley.',
      isCorrect: true,
      explanation: 'VERDADERO: Las Garantías Explícitas en Salud (GES) establecen por ley el Acceso, Oportunidad, Protección Financiera y Calidad.',
      hint: 'Ley 19.966 del Régimen General de Garantías en Salud.',
      mentorTip: { mentorId, dialogue: 'Conocer los plazos GES es clave para las preguntas de salud pública del examen.' }
    }
  ]
}
