/**
 * ══════════════════════════════════════════════════════════════════════════════
 * MANUAL OFICIAL EUNACOM 2026 — CARDIOLOGÍA & SISTEMA CARDIOVASCULAR
 * Dataset Médico Completo: 5 Bloques · 23 Masterclasses Granulares
 * Normas Técnicas MINSAL · Garantías GES · Guías AHA/ACC/ESC 2024-2026
 * ══════════════════════════════════════════════════════════════════════════════
 */

const cardiologyClassesData = [
  // ── BLOQUE I: ARRITMIAS, CONDUCCIÓN & URGENCIAS ELÉCTRICAS ───────────────
  {
    id: 'cardio-01',
    blockNum: 1,
    blockName: 'Arritmias, Conducción & Urgencias Eléctricas',
    topicLabel: '1.1',
    title: 'Lectura Sistemática del ECG en Urgencias',
    perfilCode: '1.01.4.001',
    dx: 'Específico', tx: 'Inicial', seg: 'Derivar',
    ges: 'No GES (Herramienta Diagnóstica Universal)',
    svg: 'algo_urgencias.svg',
    algoTitle: 'Algoritmo de Lectura Sistemática del ECG en Urgencias',
    sections: [
      {
        heading: 'Sistemática de Interpretación en 5 Pasos',
        text: 'La lectura del ECG en urgencias debe ser protocolizada para evitar pasar por alto emergencias tiempo-dependientes: 1) Frecuencia Cardíaca (regla de los 300: 300, 150, 100, 75, 60, 50 lpm o contar complejos en 6 segundos y multiplicar por 10 en ritmo irregular); 2) Ritmo (onda P positiva en DII, DIII, aVF y negativa en aVR, seguida siempre de QRS); 3) Eje Eléctrico (normal entre -30° y +90°; DI y aVF positivos = eje normal); 4) Intervalos (PR: 120-200 ms; QRS: < 120 ms; QTc: < 440 ms en hombres y < 460 ms en mujeres mediante fórmula de Bazett); 5) Segmento ST y onda T (búsqueda de isquemia, lesión y necrosis).'
      },
      {
        heading: 'Criterios de Hipertrofia Ventricular Izquierda (HVI)',
        text: 'El índice de Sokolow-Lyon (S en V1 + R en V5 o V6 ≥ 35 mm) y el índice de Cornell (R en aVL + S en V3 > 28 mm en hombres o > 20 mm en mujeres) son los criterios electrocardiográficos estándar exigidos en EUNACOM para documentar daño de órgano blanco en hipertensión arterial.'
      }
    ],
    table: {
      title: 'Intervalos Electrocardiográficos y Significado Patológico',
      headers: ['Intervalo', 'Valor Normal', 'Alteración Clave', 'Diagnóstico EUNACOM'],
      rows: [
        ['PR', '120 - 200 ms (3-5 mm)', 'PR > 200 ms / PR < 120 ms', 'Bloqueo AV 1° / WPW (Preexcitación)'],
        ['QRS', '< 120 ms (< 3 mm)', 'QRS ≥ 120 ms (≥ 3 mm)', 'Bloqueo Completo de Rama (BCRI / BCRD)'],
        ['QTc', '< 440 ms (H) / < 460 ms (M)', 'QTc > 500 ms', 'Riesgo inminente de Torsades de Pointes'],
        ['Segmento ST', 'Isoeléctrico', 'Supra ST ≥ 1 mm en ≥ 2 derivaciones', 'SCACEST (Oclusión coronaria total)']
      ]
    },
    vignette: 'Hombre de 32 años sin antecedentes mórbidos consulta en SAPU por palpitaciones bruscas. El ECG de urgencia muestra taquicardia regular a 170 lpm con QRS estrecho (80 ms) y ausencia de ondas P visibles. PA 125/80 mmHg, vigil y bien perfundido.',
    explicacion: 'En un paciente con taquiarritmia estable de complejo estrecho regular, el diagnóstico es Taquicardia Paroxística Supraventricular (TPSV) por reentrada nodal. La conducta escalonada de primera línea son las Maniobras Vagales (Valsalva modificada con elevación pasiva de piernas) y, si no revierte, Adenosina 6 mg EV en bolo rápido.',
    keyPoints: [
      'Todo ECG en urgencias debe evaluarse en orden: Ritmo → Frecuencia → Eje → Intervalos (PR/QRS/QT) → Isquemia (ST/T).',
      'QTc > 500 ms es el predictor principal de Torsades de Pointes (TV polimorfa); suspender fármacos prolongadores de QT.',
      'Sokolow-Lyon ≥ 35 mm confirma HVI como daño de órgano blanco en HTA crónica.'
    ],
    questions: [
      {
        stem: 'Hombre de 48 años con HTA en control. El ECG muestra onda S en V1 de 20 mm y onda R en V5 de 22 mm. QRS de 90 ms sin supradesnivel del ST. ¿Cuál es la interpretación correcta?',
        options: [
          { id: 'A', text: 'Hipertrofia ventricular izquierda por índice de Sokolow-Lyon positivo (42 mm)' },
          { id: 'B', text: 'Bloqueo completo de rama izquierda del haz de His' },
          { id: 'C', text: 'Infarto transmural de miocardio antiguo de pared anterior' },
          { id: 'D', text: 'Electrocardiograma normal sin criterios de repercusión hemodinámica' },
          { id: 'E', text: 'Bloqueo bifascicular anterior izquierdo' }
        ],
        correcta: 'A',
        explicacion: 'El índice de Sokolow-Lyon se calcula sumando la onda S en V1 (20 mm) y la onda R en V5 (22 mm), totalizando 42 mm (criterio positivo ≥ 35 mm), lo que confirma Hipertrofia Ventricular Izquierda.'
      }
    ]
  },

  {
    id: 'cardio-02',
    blockNum: 1,
    blockName: 'Arritmias, Conducción & Urgencias Eléctricas',
    topicLabel: '1.2',
    title: 'Paro Cardiorrespiratorio & Algoritmos ACLS',
    perfilCode: '1.01.2.006',
    dx: 'Específico', tx: 'Completo', seg: 'Derivar',
    ges: 'Patología GES (Urgencia Vital)',
    svg: 'algo_pcr.svg',
    algoTitle: 'Algoritmo de Soporte Vital Cardiovascular Avanzado (ACLS)',
    sections: [
      {
        heading: 'Diferenciación de Ritmos Desfibrilables vs No Desfibrilables',
        text: 'El Paro Cardiorrespiratorio (PCR) exige el reconocimiento instantáneo de dos vías terapéuticas: 1) Ritmos Desfibrilables: Fibrilación Ventricular (FV) y Taquicardia Ventricular sin pulso (TVsp). La intervención más determinante para la sobrevida es la Desfibrilación Precoz (200 J bifásico); 2) Ritmos No Desfibrilables: Asistolia y Actividad Eléctrica Sin Pulso (AESP). No responden a choques eléctricos; su manejo se basa en RCP de alta calidad ininterrumpida, Adrenalina precoz y corrección de causas reversibles.'
      },
      {
        heading: 'Cronograma Farmacológico y Regla de las 5H y 5T',
        text: 'En ritmos desfibrilables: Descarga inicial → RCP 2 min → Si persiste FV/TVsp tras la 2ª descarga: Adrenalina 1 mg EV cada 3-5 min → Si persiste tras la 3ª descarga: Amiodarona 300 mg EV en bolo (segunda dosis de 150 mg) o Lidocaína (1-1.5 mg/kg). En ritmos no desfibrilables: Adrenalina 1 mg EV lo antes posible. En todo momento buscar activamente las causas reversibles: Hipovolemia, Hipoxia, Hidrogeniones (acidosis), Hipo/Hiperkalemia, Hipotermia; y las 5T: Trombosis coronaria, Trombosis pulmonar (TEP), Tensión neumotórax, Taponamiento cardíaco, Tóxicos.'
      }
    ],
    table: {
      title: 'Resumen Terapéutico ACLS 2026',
      headers: ['Parámetro', 'Ritmos Desfibrilables (FV / TVsp)', 'Ritmos No Desfibrilables (Asistolia / AESP)'],
      rows: [
        ['Terapia Eléctrica', 'Desfibrilación 200 J bifásico inmediata', 'CONTRAINDICADA (No desfibrilar)'],
        ['Adrenalina 1 mg EV', 'Tras la 2ª descarga eléctrica (minuto 4)', 'Inmediata, lo antes posible (minuto 0-2)'],
        ['Antiarrítmico', 'Amiodarona 300 mg EV tras la 3ª descarga', 'Ninguno indicado'],
        ['Calidad de RCP', '100-120 cpm, profundidad 5-6 cm, expansión total', 'Minimizar interrupciones (< 10 segundos)']
      ]
    },
    vignette: 'Hombre de 58 años sufre colapso en sala de espera. Al monitorizar se observa ritmo caótico y desorganizado compatible con Fibrilación Ventricular. Se aplica descarga de 200 J.',
    explicacion: 'Tras aplicar la primera descarga en FV/TVsp, la conducta obligatoria inmediata es reanudar las compresiones torácicas (RCP 30:2 o continua si hay vía aérea avanzada) durante 2 minutos completos antes de volver a chequear el ritmo o el pulso.',
    keyPoints: [
      'Inmediatamente después de cualquier descarga eléctrica, reanudar RCP por 2 minutos sin chequear pulso.',
      'Amiodarona 300 mg EV se indica tras la 3ª descarga no exitosa en FV/TVsp.',
      'En AESP/Asistolia la adrenalina se administra lo antes posible; la desfibrilación empeora el pronóstico.'
    ],
    questions: [
      {
        stem: 'Durante la reanimación de un paciente en asistolia que lleva 4 minutos de RCP y ya recibió 1 mg de adrenalina, el monitor continúa mostrando una línea isoeléctrica plana. ¿Cuál es la conducta correcta?',
        options: [
          { id: 'A', text: 'Continuar RCP de alta calidad, ventilar y buscar activamente causas reversibles (5H y 5T)' },
          { id: 'B', text: 'Aplicar descarga eléctrica de 200 J bifásicos' },
          { id: 'C', text: 'Administrar Atropina 3 mg en bolo endovenoso' },
          { id: 'D', text: 'Administrar Amiodarona 300 mg endovenosa' },
          { id: 'E', text: 'Suspender maniobras por futilidad a los 5 minutos' }
        ],
        correcta: 'A',
        explicacion: 'La asistolia es un ritmo no desfibrilable. No se usa electricidad, amiodarona ni atropina. El tratamiento consiste en RCP continua de alta calidad, adrenalina cada 3-5 min y corrección de 5H y 5T.'
      }
    ]
  },

  {
    id: 'cardio-03',
    blockNum: 1,
    blockName: 'Arritmias, Conducción & Urgencias Eléctricas',
    topicLabel: '1.3',
    title: 'Fibrilación Auricular & Flutter Auricular',
    perfilCode: '1.01.1.012, 1.01.1.013, 1.01.1.014',
    dx: 'Específico', tx: 'Inicial', seg: 'Completo',
    ges: 'Patología GES (Fibrilación Auricular y Prevención de ACV)',
    svg: 'algo_fa.svg',
    algoTitle: 'Estrategia Global AF-CARE y Manejo de Fibrilación Auricular',
    sections: [
      {
        heading: 'Diagnóstico Electrocardiográfico y Estratificación Tromboembólica',
        text: 'La Fibrilación Auricular (FA) se define en el ECG por: 1) Ausencia de ondas P; 2) Ondas f fibrilatorias desorganizadas; 3) Intervalos R-R absolutamente irregulares. En todo paciente con FA no valvular se debe calcular el score CHA₂DS₂-VASc (ICC: 1, HTA: 1, Edad ≥ 75: 2, Diabetes: 1, Stroke/AIT previo: 2, Vascular: 1, Edad 65-74: 1, Sexo femenino: 1). Indicación de Anticoagulación Oral (ACO): Hombres score ≥ 2, Mujeres score ≥ 3. En score = 1 en hombres o 2 en mujeres se debe considerar.'
      },
      {
        heading: 'Anticoagulantes Orales Directos (DOACs) vs Antagonistas de Vitamina K',
        text: 'Los DOACs (Apixabán 5 mg c/12h, Rivaroxabán 20 mg c/24h, Dabigatrán 150 mg c/12h) son la primera línea de elección sobre el Acenocumarol/Warfarina por menor tasa de hemorragia intracraneal y no requerir monitorización de INR. Excepciones donde los DOACs están estrictamente CONTRAINDICADOS: Estenosis Mitral Reumática Moderada/Severa y Prótesis Valvulares Mecánicas (en estos casos se debe usar AVK con meta INR 2.0-3.0 o 2.5-3.5).'
      },
      {
        heading: 'Control de Ritmo vs Frecuencia & Flutter Auricular',
        text: 'Control de Frecuencia (meta FC < 110 lpm en reposo): Betabloqueadores (Metoprolol, Atenolol, Bisoprolol) o Calcioantagonistas no dihidropiridínicos (Verapamilo, Diltiazem). Si hay IC-FEr, usar solo Betabloqueador o Digoxina. Cardioversión en FA < 48h: Flecainida o Propafenona en corazón estructuralmente sano; Amiodarona si hay cardiopatía estructural o IC. Si la FA dura > 48h: anticoagular 3 semanas antes de cardiovertir o realizar ETE para descartar trombo en orejuela izquierda. El Flutter Auricular presenta ondas F en serrucho a 300 cpm con respuesta 2:1 (150 lpm); su tratamiento curativo definitivo es la Ablación por Radiofrecuencia del istmo cavotricuspídeo.'
      }
    ],
    table: {
      title: 'Estratificación CHA₂DS₂-VASc y Conducta de Anticoagulación',
      headers: ['Puntaje CHA₂DS₂-VASc', 'Riesgo Tromboembólico Anual', 'Conducta Terapéutica 2026'],
      rows: [
        ['0 (Hombres) / 1 (Mujeres)', 'Bajo (< 1% anual)', 'No anticoagular. No usar Aspirina.'],
        ['1 (Hombres) / 2 (Mujeres)', 'Intermedio (1.3% anual)', 'Considerar Anticoagulación Oral con DOACs'],
        ['≥ 2 (Hombres) / ≥ 3 (Mujeres)', 'Alto (> 2.2% a 15% anual)', 'Anticoagulación Oral OBLIGATORIA (DOAC de 1ª línea)'],
        ['Estenosis Mitral Reumática o Válvula Mecánica', 'Muy Alto independiente de score', 'Anticoagulación con AVK (Acenocumarol / Warfarina)']
      ]
    },
    vignette: 'Mujer de 72 años con HTA y Diabetes tipo 2 consulta por palpitaciones irregulares de 3 semanas de evolución. ECG confirma FA con FC 120 lpm. PA 135/85 mmHg, asintomática de disnea.',
    explicacion: 'La paciente tiene CHA₂DS₂-VASc = 4 (Edad 72: 1, HTA: 1, DM: 1, Sexo Femenino: 1). Al tener FA > 48h, no se debe cardiovertir de urgencia. Se inicia control de frecuencia con Betabloqueadores y Anticoagulación Oral con DOACs (ej. Apixabán 5 mg c/12h) permanente.',
    keyPoints: [
      'DOACs (Apixabán, Rivaroxabán, Dabigatrán) son de 1ª elección en FA no valvular.',
      'La Aspirina está contraindicada como profilaxis de ACV en FA (no reduce embolias y aumenta sangrados).',
      'Si la FA tiene > 48h de evolución, la cardioversión sin anticoagulación previa de 3 semanas causa embolia cerebral.'
    ],
    questions: [
      {
        stem: 'Hombre de 68 años con antecedente de infarto previo y FEVI 35% presenta primer episodio de fibrilación auricular paroxística de 6 horas de evolución. PA 130/80 mmHg. ¿Cuál es el fármaco de elección para cardioversión farmacológica?',
        options: [
          { id: 'A', text: 'Amiodarona endovenosa' },
          { id: 'B', text: 'Flecainida oral' },
          { id: 'C', text: 'Propafenona oral' },
          { id: 'D', text: 'Digoxina endovenosa' },
          { id: 'E', text: 'Verapamilo endovenoso' }
        ],
        correcta: 'A',
        explicacion: 'En pacientes con cardiopatía estructural, antecedente de infarto o IC-FEr, los antiarrítmicos Clase Ic (Flecainida y Propafenona) están estrictamente contraindicados por riesgo de proarritmia ventricular letal. La Amiodarona es el antiarrítmico de elección en cardiopatía estructural.'
      }
    ]
  },

  {
    id: 'cardio-04',
    blockNum: 1,
    blockName: 'Arritmias, Conducción & Urgencias Eléctricas',
    topicLabel: '1.4',
    title: 'TPSV & Síndrome de Wolff-Parkinson-White',
    perfilCode: '1.01.1.024, 1.01.2.008',
    dx: 'Específico', tx: 'Inicial', seg: 'Completo',
    ges: 'No GES',
    svg: 'algo_tpsv.svg',
    algoTitle: 'Algoritmo de Manejo de TPSV y Síndrome de Wolff-Parkinson-White',
    sections: [
      {
        heading: 'Fisiopatología y Manejo Escalonado de la TPSV',
        text: 'La Taquicardia Paroxística Supraventricular (TPSV) comprende la Reentrada Nodal (60%) y la Reentrada por Vía Accesoria ortodrómica (30%). Se manifiesta con taquicardia regular súbita de QRS estrecho (< 120 ms) a 150-220 lpm. Manejo escalonado en paciente estable: 1) Maniobras Vagales (Valsalva modificada con paciente sentado, soplar jeringa de 10 mL por 15 seg y acostar elevando piernas a 45°); 2) Adenosina 6 mg EV en bolo ultrarrápido seguido de flush de 20 mL de SF (si no revierte en 2 min, segunda dosis de 12 mg EV); 3) Verapamilo 5-10 mg EV o Betabloqueadores.'
      },
      {
        heading: 'Síndrome de Wolff-Parkinson-White (WPW) y Fibrilación Auricular Preexcitada',
        text: 'El WPW se caracteriza en ritmo sinusal por la tríada: PR corto (< 120 ms), onda Delta (empastamiento inicial del QRS) y QRS ancho (> 120 ms). En caso de FA preexcitada (conducción anterógrada por el haz de Kent): se observa taquicardia irregular de complejo ancho a frecuencias extremas (> 200-250 lpm). FÁRMACOS ESTRICTAMENTE PROHIBIDOS: Adenosina, Verapamilo, Diltiazem, Digoxina y Betabloqueadores, ya que al frenar el nodo AV desvían todo el flujo por la vía accesoria gatillando Fibrilación Ventricular y paro cardíaco. Tratamiento de FA con WPW: Cardioversión Eléctrica de urgencia o Procainamida/Ibutilide.'
      }
    ],
    table: {
      title: 'Diagnóstico Diferencial y Contraindicaciones en Taquicardias',
      headers: ['Entidad Clínica', 'Hallazgo ECG', 'Fármaco de Elección', 'FÁRMACO CONTRAINDICADO'],
      rows: [
        ['TPSV por Reentrada Nodal', 'QRS estrecho regular, FC 180 lpm', 'Adenosina 6 mg EV bolo rápido', 'Antiarrítmicos sin monitor'],
        ['FA con WPW (Preexcitada)', 'QRS ancho irregular, FC > 200 lpm', 'Cardioversión Eléctrica / Procainamida', 'Verapamilo, Digoxina, Adenosina, BB'],
        ['Taquicardia Ventricular (TV)', 'QRS ancho regular, disociación AV', 'Amiodarona 150 mg EV (estable) / CVE', 'Verapamilo (gatilla colapso hemodinámico)']
      ]
    },
    vignette: 'Joven de 21 años consulta por palpitaciones severas. ECG muestra taquicardia irregular con complejos QRS anchos de morfología variable a 230 lpm. El médico tratante sospecha FA asociada a vía accesoria (WPW).',
    explicacion: 'En una FA preexcitada con QRS ancho irregular a alta frecuencia, el uso de frenadores del nodo AV (como Verapamilo, Adenosina o Digoxina) acelera la conducción por la vía accesoria provocando Fibrilación Ventricular. La conducta es Cardioversión Eléctrica inmediata.',
    keyPoints: [
      'Adenosina en bolo rápido de 6 mg es el tratamiento farmacológico de 1ª línea para TPSV estable.',
      'En WPW + FA (QRS ancho irregular) están estrictamente PROHIBIDOS: Verapamilo, Digoxina, Adenosina y Betabloqueadores.',
      'El tratamiento definitivo curativo del WPW sintomático es la Ablación por Radiofrecuencia de la vía accesoria.'
    ],
    questions: [
      {
        stem: 'Mujer de 25 años con diagnóstico previo de Síndrome de Wolff-Parkinson-White llega a urgencias por taquicardia con QRS ancho de 140 ms, ritmo totalmente irregular a 210 lpm, PA 110/70 mmHg. ¿Cuál de los siguientes fármacos está CONTRAINDICADO administrar?',
        options: [
          { id: 'A', text: 'Verapamilo' },
          { id: 'B', text: 'Procainamida' },
          { id: 'C', text: 'Ibutilide' },
          { id: 'D', text: 'Amiodarona' },
          { id: 'E', text: 'Sulfato de Magnesio' }
        ],
        correcta: 'A',
        explicacion: 'El Verapamilo bloquea el nodo AV, facilitando la conducción masiva 1:1 a través de la vía accesoria de conducción rápida, lo que puede inducir Fibrilación Ventricular y muerte súbita.'
      }
    ]
  },

  {
    id: 'cardio-05',
    blockNum: 1,
    blockName: 'Arritmias, Conducción & Urgencias Eléctricas',
    topicLabel: '1.5',
    title: 'Bradicardias Sintomáticas & Bloqueos AV',
    perfilCode: '1.01.1.002, 1.01.2.009',
    dx: 'Específico', tx: 'Inicial', seg: 'Derivar',
    ges: 'Patología GES (Marcapasos Definitivos en Bloqueos AV de Alto Grado)',
    svg: 'algo_bav.svg',
    algoTitle: 'Algoritmo Diagnóstico y Terapéutico de Bloqueos AV y Bradicardias',
    sections: [
      {
        heading: 'Clasificación Electrocardiográfica de los Bloqueos AV',
        text: '1) BAV de 1er Grado: PR prolongado constante > 200 ms, todas las ondas P conducen. Benigno, no requiere tratamiento; 2) BAV de 2° Grado Mobitz I (Wenckebach): Prolongación progresiva del intervalo PR hasta que una onda P no conduce. Localización nodal, generalmente benigno; 3) BAV de 2° Grado Mobitz II: Intervalo PR constante con fallo súbito e intermitente de la conducción de ondas P. Localización infranodal (His-Purkinje), alto riesgo de progresión a BAV completo, REQUIERE MARCAPASOS; 4) BAV de 3er Grado (Completo): Disociación auriculoventricular total, ondas P y complejos QRS laten de forma independiente. REQUIERE MARCAPASOS DEFINITIVO.'
      },
      {
        heading: 'Manejo de Urgencias de la Bradicardia Sintomática',
        text: 'Ante bradicardia (FC < 50 lpm) con signos de inestabilidad (hipotensión, síncope, shock, dolor torácico, disnea): 1) Atropina 1 mg EV en bolo cada 3-5 min (hasta máx 3 mg); 2) Si no responde: Marcapaso Transcutáneo de urgencia o Infusión de Dopamina (5-20 mcg/kg/min) / Adrenalina (2-10 mcg/min); 3) Instalación de Marcapaso Transitorio Transvenoso y derivación a centro con cardiología para Marcapaso Definitivo GES.'
      }
    ],
    table: {
      title: 'Clasificación de Bloqueos AV e Indicación Quirúrgica',
      headers: ['Tipo de Bloqueo AV', 'Patrón Electrocardiográfico', 'Nivel Anatómico', 'Indicación de Marcapaso'],
      rows: [
        ['BAV 1° Grado', 'PR > 200 ms constante, todas las P conducen', 'Nodo AV', 'No requiere marcapaso'],
        ['BAV 2° Mobitz I (Wenckebach)', 'PR se alarga progresivamente hasta que una P no conduce', 'Nodo AV', 'Solo si es sintomático'],
        ['BAV 2° Mobitz II', 'PR constante con ondas P bloqueadas súbitas', 'Infranodal (His-Purkinje)', 'MARCAPASO DEFINITIVO GES'],
        ['BAV 3° Grado (Completo)', 'Disociación AV total (P y QRS independientes)', 'Infranodal', 'MARCAPASO DEFINITIVO GES']
      ]
    },
    vignette: 'Hombre de 79 años consulta por astenia severa y dos episodios sincopales en la última semana. ECG: ondas P a 75 cpm y complejos QRS anchos a 32 cpm sin ninguna relación entre sí. PA 90/50 mmHg.',
    explicacion: 'El paciente presenta Bloqueo AV de 3er grado (completo) sintomático. Requiere monitorización continua, atropina como medida puente inicial, instalación de Marcapaso Transitorio y derivación urgente para implante de Marcapaso Definitivo bajo garantía GES.',
    keyPoints: [
      'BAV Mobitz II y BAV de 3er Grado tienen indicación formal de Marcapaso Definitivo GES.',
      'La Atropina (1 mg EV) es efectiva principalmente en bloqueos nodales (Mobitz I), con poca respuesta en bloqueos infranodales.',
      'La presencia de síncope en un BAV completo constituye el Síndrome de Stokes-Adams.'
    ],
    questions: [
      {
        stem: 'Hombre de 72 años ingresa con FC 34 lpm y PA 70/40 mmHg. ECG muestra BAV completo. Se administra Atropina 1 mg EV sin aumento de la frecuencia cardíaca ni mejoría hemodinámica. ¿Cuál es la conducta inmediata más adecuada?',
        options: [
          { id: 'A', text: 'Instalar marcapaso externo transcutáneo e iniciar infusión de drogas vasoactivas' },
          { id: 'B', text: 'Repetir Atropina 1 mg EV hasta completar 6 mg' },
          { id: 'C', text: 'Administrar Amiodarona 300 mg endovenosa' },
          { id: 'D', text: 'Realizar cardioversión eléctrica sincronizada' },
          { id: 'E', text: 'Esperar traslado en ambulancia básica sin monitor' }
        ],
        correcta: 'A',
        explicacion: 'En una bradiarritmia inestable refractaria a atropina, la conducta de emergencia inmediata es la estimulación eléctrica mediante marcapaso transcutáneo y el soporte con infusión de adrenalina o dopamina.'
      }
    ]
  },

  // ── BLOQUE II: CARDIOPATÍA ISQUÉMICA & ATEROSCLEROSIS ─────────────────────
  {
    id: 'cardio-06',
    blockNum: 2,
    blockName: 'Cardiopatía Isquémica & Aterosclerosis',
    topicLabel: '2.1',
    title: 'Angina Crónica Estable & Test de Esfuerzo',
    perfilCode: '1.01.1.001, 1.01.4.004',
    dx: 'Específico', tx: 'Inicial', seg: 'Completo',
    ges: 'Patología GES (Cardiopatía Coronaria)',
    svg: 'algo_angina_estable.svg',
    algoTitle: 'Algoritmo de Evaluación y Manejo de Angina Crónica Estable',
    sections: [
      {
        heading: 'Definición Clínica de Angina Típica (Criterios Diamond-Forrester)',
        text: 'La Angina Típica cumple 3 de 3 criterios: 1) Dolor opresivo retroesternal con irradiación clásica a mandíbula o brazo izquierdo; 2) Desencadenado por el esfuerzo físico o estrés emocional; 3) Aliviado por el reposo o nitroglicerina sublingual en < 5 minutos. Angina atípica cumple 2 criterios; dolor no anginoso cumple ≤ 1 criterio.'
      },
      {
        heading: 'Test de Esfuerzo (Ergometría) y Criterios de Positividad',
        text: 'El test de esfuerzo en cinta rodante (Protocolo de Bruce) evalúa isquemia miocárdica inducible. Criterio diagnóstico de positividad: Infradesnivel del segmento ST ≥ 1 mm (0.1 mV) horizontal o descendente a los 80 ms del punto J. Criterios de alto riesgo (indicación directa de Coronariografía): Infradesnivel ST ≥ 2 mm precoz (< 6 min), infradesnivel en múltiples derivaciones, caída de la presión arterial sistólica durante el esfuerzo o arritmias ventriculares complejas. Contraindicaciones de ergometría: Bloqueo Completo de Rama Izquierda (BCRI), WPW o marcapasos (en estos casos realizar Eco-Estrés o SPECT miocárdico).'
      },
      {
        heading: 'Terapia Médica Óptima (TMO) para Reducir Mortalidad',
        text: '1) Antiagregación Plaquetaria: Aspirina 100 mg/día de por vida; 2) Estatinas de Alta Potencia: Atorvastatina 80 mg o Rosuvastatina 40 mg (meta LDL < 55 mg/dL en muy alto riesgo); 3) Betabloqueadores (Bisoprolol, Atenolol, Carvedilol) como antianginoso de 1ª línea; 4) Nitroglicerina sublingual SOS para crisis de dolor.'
      }
    ],
    table: {
      title: 'Tratamiento Farmacológico en Cardiopatía Coronaria Estable',
      headers: ['Fármaco', 'Dosis Estándar', 'Objetivo Clínico', 'Efecto en Mortalidad'],
      rows: [
        ['Aspirina (AAS)', '100 mg / día VO', 'Antiagregación plaquetaria primaria/secundaria', 'REDUCE MORTALIDAD'],
        ['Atorvastatina', '80 mg / día VO noche', 'Estabilización de placa y meta LDL < 55 mg/dL', 'REDUCE MORTALIDAD'],
        ['Bisoprolol / Carvedilol', '5-10 mg / 12.5-25 mg día', 'Antianginoso 1ª línea, reduce consumo O₂', 'REDUCE MORTALIDAD (si hay IC/IAM)'],
        ['Nitroglicerina Sublingual', '0.6 mg SL en crisis de dolor', 'Vasodilatador coronario de rescate', 'Alivio sintomático (No reduce mortalidad)']
      ]
    },
    vignette: 'Hombre de 64 años, fumador e hipertenso, consulta en CESFAM por dolor opresivo precordial al caminar 2 cuadras en subida que cede en 3 minutos de reposo. ECG de reposo sin alteraciones.',
    explicacion: 'El cuadro corresponde a Angina Típica de Esfuerzo. La conducta en APS es iniciar Terapia Médica Óptima con Aspirina 100 mg, Atorvastatina 80 mg y Betabloqueador, solicitar Test de Esfuerzo para estratificación y derivar a cardiología bajo garantía GES.',
    keyPoints: [
      'Aspirina 100 mg y Estatinas en dosis máxima son los dos pilares que reducen eventos cardiovasculares.',
      'Si el ECG basal tiene BCRI, el test de esfuerzo convencional no sirve; se solicita Eco-Estrés o SPECT.',
      'Test de esfuerzo con caída de PA durante el ejercicio indica enfermedad de tronco coronario izquierdo o 3 vasos.'
    ],
    questions: [
      {
        stem: 'Hombre de 62 años con angina estable presenta en test de esfuerzo infradesnivel de 2.5 mm del segmento ST en derivaciones II, III, aVF y V4-V6 en el minuto 3 del protocolo de Bruce, acompañado de caída de 20 mmHg en la presión arterial sistólica. ¿Cuál es la conducta indicada?',
        options: [
          { id: 'A', text: 'Coronariografía invasiva urgente por criterios de alto riesgo' },
          { id: 'B', text: 'Aumentar dosis de betabloqueador y repetir test de esfuerzo en 6 meses' },
          { id: 'C', text: 'Solicitar ecocardiograma de reposo ambulatorio' },
          { id: 'D', text: 'Indicar reposo absoluto y suspender estatinas' },
          { id: 'E', text: 'Indicar tratamiento médico con nitratos orales exclusivamente' }
        ],
        correcta: 'A',
        explicacion: 'El infradesnivel precoz severo acompañado de caída de la presión arterial sistólica durante el esfuerzo son criterios de altísimo riesgo que sugieren enfermedad de tronco o multivaso, indicando coronariografía invasiva inmediata.'
      }
    ]
  },

  {
    id: 'cardio-07',
    blockNum: 2,
    blockName: 'Cardiopatía Isquémica & Aterosclerosis',
    topicLabel: '2.2',
    title: 'SCASEST: Angina Inestable e IAM sin SDST',
    perfilCode: '1.01.2.001, 1.01.2.003',
    dx: 'Específico', tx: 'Inicial', seg: 'Derivar',
    ges: 'Patología GES (Síndrome Coronario Agudo)',
    svg: 'algo_dolor_toracico.svg',
    algoTitle: 'Algoritmo de Estratificación y Manejo de SCASEST (TIMI / GRACE)',
    sections: [
      {
        heading: 'Definición y Diferenciación entre Angina Inestable e IAMSEST',
        text: 'El Síndrome Coronario Agudo sin Supradesnivel del ST (SCASEST) se debe a la fisura o erosión de una placa aterosclerótica con trombosis no oclusiva. Se clasifica en: 1) Angina Inestable: Isquemia miocárdica sin necrosis celular (Troponinas ultrasensibles normales). Se presenta como angina de reposo (> 20 min), angina de reciente comienzo (clase III-IV en últimos 2 meses) o angina acelerada (aumento en frecuencia, duración o umbral); 2) IAMSEST: Isquemia miocárdica con necrosis celular documentada por elevación y caída típica de Troponinas Ultrasensibles (hs-cTn) con al menos un valor sobre el percentil 99.'
      },
      {
        heading: 'Tratamiento Médico Inmediato y Terapia Antitrombótica',
        text: 'Todo paciente con SCASEST requiere ingreso a Unidad Coronaria/Intermedio e inicio inmediato de: 1) Antiagregación Plaquetaria Dual (DAPT): Aspirina 250-500 mg de carga oral + Ticagrelor 180 mg carga (o Clopidogrel 300-600 mg si hay contraindicación de Ticagrelor); 2) Anticoagulación Parenteral: Enoxaparina 1 mg/kg cada 12 horas SC (ajustar a 1 mg/kg/día si clearance < 30 mL/min) o Fondaparinux 2.5 mg/día; 3) Antiisquémicos: Nitroglicerina sublingual o EV si persiste dolor, Betabloqueadores orales (si no hay signos de IC aguda o shock); 4) Estatinas: Atorvastatina 80 mg/día precoz.'
      },
      {
        heading: 'Estratificación de Riesgo TIMI / GRACE y Timing Invasivo',
        text: 'El Score TIMI (Edad ≥ 65, ≥ 3 FR coronarios, coronariopatía conocida > 50%, uso de AAS en 7 días, angina severa reciente, elevación de biomarcadores, infradesnivel ST ≥ 0.5 mm) define el timing de coronariografía: Muy Alto Riesgo (inestabilidad hemodinámica, shock, angina refractaria, arritmias ventriculares) → Coronariografía inmediata (< 2h); Alto Riesgo (GRACE > 140 o TIMI ≥ 5, elevación de troponinas, cambios dinámicos del ST) → Coronariografía precoz (< 24h); Riesgo Intermedio (TIMI 3-4, DM, clearance < 60) → Coronariografía electiva (< 72h).'
      }
    ],
    table: {
      title: 'Estratificación de Riesgo y Timing de Coronariografía en SCASEST',
      headers: ['Categoría de Riesgo', 'Criterios Clínicos', 'Timing de Coronariografía'],
      rows: [
        ['Muy Alto Riesgo', 'Inestabilidad hemodinámica, shock cardiogénico, angina refractaria a NTG', 'Inmediata (< 2 horas)'],
        ['Alto Riesgo', 'Troponinas elevadas, cambios dinámicos del ST (infradesnivel), GRACE > 140', 'Precoz (< 24 horas)'],
        ['Riesgo Intermedio', 'Diabetes Mellitus, ERC (GFR < 60), FEVI < 40%, TIMI 3-4', 'Invasiva (< 72 horas)'],
        ['Bajo Riesgo', 'Troponinas negativas repetidas, ECG normal, sin recurrencia de dolor', 'Test no invasivo previo al alta']
      ]
    },
    vignette: 'Hombre de 56 años con dolor retroesternal opresivo en reposo de 40 minutos. ECG muestra infradesnivel del ST de 1.5 mm en derivaciones V4-V6. Troponina T ultrasensible de ingreso: 85 ng/L (elevada). PA 140/85 mmHg, FC 80 lpm.',
    explicacion: 'El paciente presenta un IAMSEST de alto riesgo por troponinas positivas y cambios dinámicos del ST. La conducta médica inmediata es iniciar DAPT (Aspirina + Ticagrelor), Enoxaparina 1 mg/kg SC cada 12h, Atorvastatina 80 mg y programar Coronariografía invasiva en < 24 horas.',
    keyPoints: [
      'En SCASEST la Trombólisis con fibrinolíticos está estrictamente CONTRAINDICADA (aumenta mortalidad).',
      'Ticagrelor 180 mg carga es superior a Clopidogrel en SCASEST.',
      'Troponina ultrasensible a las 0h y 1h permite regla de descarte (rule-out) o confirmación (rule-in) rápida.'
    ],
    questions: [
      {
        stem: 'Hombre de 59 años ingresa por SCASEST con troponina elevada y dolor precordial refractario a nitroglicerina endovenosa, desarrollando hipotensión (PA 85/50 mmHg) y estertores crepitantes bilaterales. ¿Cuál es la conducta prioritaria?',
        options: [
          { id: 'A', text: 'Coronariografía invasiva de emergencia inmediata (< 2 horas)' },
          { id: 'B', text: 'Trombolisis con Tenecteplase endovenoso' },
          { id: 'C', text: 'Aumentar infusión de nitroglicerina y esperar 24 horas' },
          { id: 'D', text: 'Administrar Betabloqueadores endovenosos a dosis altas' },
          { id: 'E', text: 'Realizar ecocardiograma transesofágico electivo' }
        ],
        correcta: 'A',
        explicacion: 'La presencia de inestabilidad hemodinámica, shock o angina refractaria sitúa al paciente en la categoría de Muy Alto Riesgo, indicando coronariografía invasiva de rescate inmediata en < 2 horas. La trombólisis está contraindicada en SCASEST.'
      }
    ]
  },

  {
    id: 'cardio-08',
    blockNum: 2,
    blockName: 'Cardiopatía Isquémica & Aterosclerosis',
    topicLabel: '2.3',
    title: 'SCACEST: IAM con SDST & Reperfusión GES',
    perfilCode: '1.01.2.002, 1.01.3.005',
    dx: 'Específico', tx: 'Inicial', seg: 'Completo',
    ges: 'Patología GES #14 (Infarto Agudo del Miocardio con Supradesnivel ST)',
    svg: 'algo_scacest_120min.svg',
    algoTitle: 'Algoritmo Maestro de Reperfusión: Regla de los 120 Minutos (GES MINSAL)',
    sections: [
      {
        heading: 'Criterios Electrocardiográficos Diagnósticos de SCACEST',
        text: 'El SCACEST representa una oclusión coronaria transmural completa. Diagnóstico ECG: Supradesnivel del segmento ST medido en el punto J en ≥ 2 derivaciones contiguas: ≥ 1 mm (0.1 mV) en todas las derivaciones excepto V2-V3; en V2-V3: ≥ 2.5 mm en hombres < 40 años, ≥ 2 mm en hombres ≥ 40 años, o ≥ 1.5 mm en mujeres. El Bloqueo Completo de Rama Izquierda (BCRI) nuevo o presumiblemente nuevo con clínica isquémica se maneja como equivalente a SCACEST (Criterios de Sgarbossa).'
      },
      {
        heading: 'Algoritmo Maestro de Reperfusión: La Regla de los 120 Minutos (GES)',
        text: 'El tiempo es miocardio. La garantía legal GES exige ECG tomado e interpretado en < 10 minutos desde el primer contacto médico: 1) Si el centro cuenta con hemodinamia o el traslado a un centro con hemodinamia permite inflar el balón en ≤ 120 minutos: ANGIOSTAPLASTÍA PRIMARIA (meta tiempo puerta-balón < 90 min en centro con PCI o < 120 min si es trasladado); 2) Si el tiempo estimado de traslado a PCI es > 120 minutos: TROMBÓLISIS FARMACOLÓGICA INMEDIATA con Fibrinoespecífico (Tenecteplase bolo único ajustado por peso en < 30 minutos tiempo puerta-aguja). Tras la trombólisis exitosa (criterios de reperfusión: alivio del dolor > 50% y descenso del supra ST > 50% a los 60-90 min), se traslada siempre a coronariografía electiva en 2 a 24 horas (Estrategia Fármaco-Invasiva).'
      },
      {
        heading: 'Infarto del Ventrículo Derecho (V3R - V4R)',
        text: 'En todo IAM de pared inferior (DII, DIII, aVF - arteria coronaria derecha), es OBLIGATORIO tomar derivaciones derechas (V3R y V4R). La presencia de supradesnivel ST ≥ 1 mm en V4R confirma compromiso del ventrículo derecho. Tríada clínica: Hipotensión arterial, Ingurgitación yugular y Campos pulmonares limpios. TRATAMIENTO: Sobrecarga de volumen con Suero Fisiológico 0.9% para mantener precarga del VD. ESTÁN ESTRICTAMENTE CONTRAINDICADOS los nitratos, la morfina y los diuréticos, ya que reducen la precarga y provocan shock hemodinámico irreversible.'
      }
    ],
    table: {
      title: 'Estrategia de Reperfusión y Tiempos GES en SCACEST',
      headers: ['Estrategia', 'Criterio de Tiempo', 'Fármaco / Procedimiento', 'Meta Temporal GES'],
      rows: [
        ['Diagnóstico ECG', 'Primer Contacto Médico', 'ECG 12 derivaciones', '< 10 minutos'],
        ['Angioplastía Primaria (PCI)', 'Traslado a PCI ≤ 120 min', 'Cateterismo con Stent Farmacoactivo', '< 90 min (Puerta-Balón)'],
        ['Trombolisis Sistémica', 'Traslado a PCI > 120 min', 'Tenecteplase (TNK-tPA) bolo EV', '< 30 min (Puerta-Aguja)'],
        ['Estrategia Fármaco-Invasiva', 'Post-Trombólisis Exitosa', 'Traslado a Coronariografía', '2 a 24 horas post-lisis']
      ]
    },
    vignette: 'Hombre de 54 años consulta en hospital rural por dolor torácico opresivo de 1 hora. ECG: supradesnivel ST de 3 mm en V1-V4. El centro con hemodinamia más cercano está a 3.5 horas de distancia.',
    explicacion: 'Dado que el tiempo de traslado para Angioplastía Primaria supera ampliamente los 120 minutos, la indicación inmediata según protocolo GES es realizar Trombólisis con Tenecteplase (TNK-tPA) en < 30 minutos (puerta-aguja) asociada a DAPT y Enoxaparina.',
    keyPoints: [
      'Si el traslado a PCI toma > 120 min, se debe trombolizar de inmediato en < 30 minutos.',
      'En IAM inferior (DII, DIII, aVF) tomar V3R-V4R obligatorio para descartar infarto de ventrículo derecho.',
      'En IAM de ventrículo derecho están PROHIBIDOS los nitratos y diuréticos; se maneja con fluidos EV.'
    ],
    questions: [
      {
        stem: 'Hombre de 60 años con IAM inferior (supradesnivel ST en DII, DIII, aVF) y supradesnivel de 1.5 mm en V4R presenta PA 75/40 mmHg y marcada ingurgitación yugular con murmullo pulmonar limpio. ¿Cuál es el tratamiento prioritario?',
        options: [
          { id: 'A', text: 'Carga de Suero Fisiológico 0.9% endovenoso' },
          { id: 'B', text: 'Furosemida 40 mg endovenosa' },
          { id: 'C', text: 'Nitroglicerina en infusión continua' },
          { id: 'D', text: 'Morfina 5 mg endovenosa' },
          { id: 'E', text: 'Dobutamina en monoterapia sin fluidos' }
        ],
        correcta: 'A',
        explicacion: 'El paciente presenta la tríada clásica de infarto de ventrículo derecho (hipotensión, ingurgitación yugular y campos limpios). El VD es dependiente de volumen, por lo que la reposición rápida con solución salina es la medida salvadora inicial. Los nitratos y diuréticos colapsan la precarga.'
      }
    ]
  },

  {
    id: 'cardio-09',
    blockNum: 2,
    blockName: 'Cardiopatía Isquémica & Aterosclerosis',
    topicLabel: '2.4',
    title: 'Complicaciones Mecánicas del IAM & Angina de Prinzmetal',
    perfilCode: '1.01.2.004, 1.01.4.005',
    dx: 'Específico', tx: 'Inicial', seg: 'Derivar',
    ges: 'Patología GES',
    svg: null,
    algoTitle: 'Diagnóstico Diferencial de Complicaciones Mecánicas Post-Infarto',
    sections: [
      {
        heading: 'Complicaciones Mecánicas del Infarto (Días 3 a 7)',
        text: 'Las complicaciones mecánicas ocurren típicamente entre el 3° y 7° día post-IAM por necrosis coagulativa transmural: 1) Rotura de Músculo Papilar (más frecuente posteromedial en IAM inferior): Genera Insuficiencia Mitral Aguda masiva con soplo holosistólico apical nuevo y Edema Agudo de Pulmón flash catastrófico; 2) Comunicación Interventricular (CIV) post-IAM (pared anterior o inferior): Shunt izquierda-derecha con soplo holosistólico rudo en borde esternal izquierdo asociado a frémito táctil y shock cardiogénico; 3) Rotura de Pared Libre de VI: Hemopericardio masivo con Taponamiento Cardíaco súbito, disociación electromecánica y muerte fulminante. TRATAMIENTO: Cirugía cardíaca de emergencia y estabilización con Balón de Contrapulsación Intraaórtico (BCPIAo).'
      },
      {
        heading: 'Angina Vasoespástica (de Prinzmetal)',
        text: 'La Angina de Prinzmetal es un vasoespasmo coronario focal transitorio que ocurre típicamente en reposo o durante la noche en mujeres o fumadores jóvenes sin lesiones coronarias obstructivas fijas. En el ECG muestra supradesnivel del segmento ST transitorio que desaparece al ceder el dolor. TRATAMIENTO DE ELECCIÓN: Calcioantagonistas (Diltiazem, Amlodipino) y Nitratos. FÁRMACOS CONTRAINDICADOS: Betabloqueadores no selectivos (ej. Propranolol), ya que al bloquear los receptores beta-2 dejan libre el estímulo alfa-1 agravando el vasoespasmo coronario.'
      }
    ],
    table: {
      title: 'Diferenciación de Complicaciones Mecánicas Post-IAM',
      headers: ['Complicación Mecánica', 'Soplo Auscultatorio', 'Manifestación Clínica Cardinal', 'Tratamiento Definitivo'],
      rows: [
        ['Rotura de Músculo Papilar', 'Soplo holosistólico apical (sin frémito)', 'Insuficiencia Mitral aguda + Edema Pulmonar flash', 'Cirugía cardíaca urgente'],
        ['Rotura de Septum (CIV)', 'Soplo holosistólico rudo parasternal + FRÉMITO', 'Shock cardiogénico con salto oximétrico en VD', 'Cirugía cardíaca urgente'],
        ['Rotura de Pared Libre', 'Sin soplo característico', 'Taponamiento cardíaco súbito + Paro en AESP', 'Pericardiocentesis + Cirugía'],
        ['Aneurisma Ventricular VI', 'Soplo sistólico apical tardío (> 6 semanas)', 'Supra ST persistente > 6 semanas, IC crónica, embolias', 'Anticoagulación / Cirugía']
      ]
    },
    vignette: 'Mujer de 42 años fumadora consulta por dolor opresivo retroesternal nocturno recurrente en reposo. El ECG tomado durante el dolor muestra supradesnivel ST transitorio de 2 mm en derivaciones anteriores que se normaliza completamente a los 10 minutos tras nitroglicerina sublingual. Coronariografía sin estenosis ateroscleróticas.',
    explicacion: 'El cuadro corresponde a Angina de Prinzmetal (vasoespástica). El tratamiento de elección son los Calcioantagonistas (Diltiazem o Amlodipino). Los betabloqueadores están contraindicados por riesgo de vasoespasmo refractario.',
    keyPoints: [
      'Soplo holosistólico nuevo con frémito en borde esternal izquierdo al 4° día post-IAM confirma CIV.',
      'Soplo holosistólico apical nuevo con edema pulmonar flash masivo al 4° día post-IAM confirma Rotura de Papilar.',
      'En Angina de Prinzmetal los Betabloqueadores están contraindicados; se trata con Calcioantagonistas.'
    ],
    questions: [
      {
        stem: 'Hombre de 67 años al quinto día de evolución de un IAM anterior extenso presenta súbitamente hipotensión severa (PA 75/40 mmHg), disnea extrema y auscultación con soplo holosistólico nuevo grado IV/VI en el cuarto espacio intercostal izquierdo con frémito palpable. ¿Cuál es el diagnóstico más probable?',
        options: [
          { id: 'A', text: 'Rotura de tabique interventricular (CIV post-IAM)' },
          { id: 'B', text: 'Rotura de músculo papilar mitral' },
          { id: 'C', text: 'Taponamiento cardíaco por rotura de pared libre' },
          { id: 'D', text: 'Reinfarto de miocardio' },
          { id: 'E', text: 'Aneurisma ventricular apical' }
        ],
        correcta: 'A',
        explicacion: 'La presencia de soplo holosistólico parasternal izquierdo asociado a frémito palpable al 5° día post-infarto es patognomónica de Rotura del Septum Interventricular (CIV post-IAM). La rotura de papilar da soplo en ápex sin frémito.'
      }
    ]
  },

  // ── BLOQUE III: INSUFICIENCIA CARDÍACA & SHOCK ────────────────────────────
  {
    id: 'cardio-10',
    blockNum: 3,
    blockName: 'Insuficiencia Cardíaca & Shock',
    topicLabel: '3.1',
    title: 'Insuficiencia Cardíaca Crónica: Fenotipos & Diagnóstico',
    perfilCode: '1.01.1.018, 1.01.4.006',
    dx: 'Específico', tx: 'Inicial', seg: 'Completo',
    ges: 'Patología GES #38 (Tratamiento Quirúrgico y Médico de la Insuficiencia Cardíaca)',
    svg: 'algo_ic_dx.svg',
    algoTitle: 'Algoritmo Diagnóstico de Insuficiencia Cardíaca (Framingham / FEVI)',
    sections: [
      {
        heading: 'Criterios Diagnósticos de Framingham y Biomarcadores',
        text: 'El diagnóstico de Insuficiencia Cardíaca (IC) es eminentemente clínico mediante Criterios de Framingham (se requieren 2 criterios mayores o 1 mayor + 2 menores). Criterios Mayores: Disnea Paroxística Nocturna (DPN), Ortopnea, Ingurgitación Yugular, Crepitantes pulmonares, Galope por R3, Cardiomegalia radiológica, Reflujo hepatoyugular. Criterios Menores: Edema bilateral de extremidades inferiores, Tos nocturna, Disnea de esfuerzo, Hepatomegalia, Taquicardia (> 120 lpm). El Péptido Natriurético (BNP < 35 pg/mL o NT-proBNP < 125 pg/mL en ambulatorio) tiene un alto Valor Predictivo Negativo para descartar IC.'
      },
      {
        heading: 'Fenotipos Ecocardiográficos según Fracción de Eyección (FEVI)',
        text: '1) IC con Fracción de Eyección Reducida (IC-FEr): FEVI ≤ 40% (disfunción sistólica predominante); 2) IC con Fracción de Eyección Levemente Reducida (IC-FElr): FEVI 41-49%; 3) IC con Fracción de Eyección Preservada (IC-FEp): FEVI ≥ 50% con evidencia de disfunción diastólica (elevación de presiones de llenado del VI, relación E/e\' > 14 o hipertrofia auricular izquierda). El Cor Pulmonale Crónico es la hipertrofia/dilatación aislada del VD por hipertensión pulmonar secundaria a neumopatía crónica (EPOC la causa más común).'
      }
    ],
    table: {
      title: 'Clasificación de Insuficiencia Cardíaca según FEVI (Guías ESC/AHA 2026)',
      headers: ['Fenotipo Clínico', 'FEVI', 'Fisiopatología Principal', 'Respuesta Terapéutica'],
      rows: [
        ['IC-FEr (Reducida)', 'FEVI ≤ 40%', 'Fallo sistólico (inotropismo deficiente)', 'Excelente a Cuádruple Terapia GDMT'],
        ['IC-FElr (Levemente Reducida)', 'FEVI 41 - 49%', 'Fallo mixto sisto-diastólico', 'Beneficio con iSGLT2, ARNI, BB y ARM'],
        ['IC-FEp (Preservada)', 'FEVI ≥ 50%', 'Fallo diastólico (rigidez ventricular)', 'iSGLT2 (Dapagliflozina/Empagliflozina) + Diuréticos'],
        ['Cor Pulmonale', 'VD dilatado / VI normal', 'Hipertensión Pulmonar por EPOC', 'Tratar patología pulmonar + O₂ continuo']
      ]
    },
    vignette: 'Mujer de 72 años con HTA y Diabetes consulta por disnea progresiva CF III, ortopnea a 3 almohadas y edema maleolar bilateral. Al examen: ingurgitación yugular a 45°, R3 palpable en ápex y rales crepitantes basales bilaterales.',
    explicacion: 'La paciente cumple criterios de Framingham mayores (ortopnea, R3, rales, ingurgitación) y menores (edema). El examen diagnóstico confirmatorio obligatorio de elección es el Ecocardiograma Transtorácico para medir la FEVI y orientar la terapia médica.',
    keyPoints: [
      'El diagnóstico de IC es clínico (Framingham); el ecocardiograma clasifica la FEVI.',
      'BNP normal descarta insuficiencia cardíaca con > 95% de seguridad.',
      'R3 (tercer ruido) es el signo auscultatorio más específico de sobrecarga de volumen y fallo sistólico.'
    ],
    questions: [
      {
        stem: 'Hombre de 68 años consulta por disnea de esfuerzo y edema de tobillos. Al examen destaca PA 150/90, sin ingurgitación yugular, murmullo vesicular limpio. NT-proBNP en sangre es de 50 pg/mL (normal < 125 pg/mL). ¿Cuál es la conducta más apropiada?',
        options: [
          { id: 'A', text: 'Descartar insuficiencia cardíaca y buscar causas alternativas de disnea/edema' },
          { id: 'B', text: 'Iniciar de inmediato cuádruple terapia con ARNI y betabloqueadores' },
          { id: 'C', text: 'Indicar Furosemida 40 mg cada 12 horas por IC descompensada' },
          { id: 'D', text: 'Hospitalizar en unidad coronaria para coronariografía' },
          { id: 'E', text: 'Solicitar biopsia endomiocárdica' }
        ],
        correcta: 'A',
        explicacion: 'Los péptidos natriuréticos tienen un altísimo valor predictivo negativo (> 95-98%). Un NT-proBNP < 125 pg/mL en paciente no tratado prácticamente descarta insuficiencia cardíaca.'
      }
    ]
  },

  {
    id: 'cardio-11',
    blockNum: 3,
    blockName: 'Insuficiencia Cardíaca & Shock',
    topicLabel: '3.2',
    title: 'Cuádruple Terapia GDMT en IC-FEr',
    perfilCode: '1.01.1.018, 1.01.3.007',
    dx: 'Específico', tx: 'Completo', seg: 'Completo',
    ges: 'Patología GES (Fármacos Modificadores de Pronóstico en IC)',
    svg: 'algo_ic_tratamiento.svg',
    algoTitle: 'Cuádruple Terapia Modificadora de Pronóstico en IC-FEr (GDMT)',
    sections: [
      {
        heading: 'Los 4 Pilares Farmacológicos que Reducen Mortalidad (GDMT)',
        text: 'En toda IC con FEVI reducida (≤ 40%), se debe iniciar simultáneamente o en rápida titulación el "Cuádruple Pilar Fantástico" que ha demostrado reducir drásticamente la mortalidad y hospitalizaciones: 1) ARNI (Sacubitrilo/Valsartán 24/26 mg a 97/103 mg c/12h): Reemplaza a los IECAs como primera línea. Si el paciente tomaba Enalapril, suspender 36 horas antes por riesgo de angioedema; 2) Betabloqueadores de Evidencia (Carvedilol, Bisoprolol o Metoprolol succinato): Iniciar solo en paciente euvolémico y titular lentamente; 3) Antagonistas del Receptor Mineralocorticoide (ARM) (Espironolactona 25-50 mg/día o Eplerenona): Monitorizar potasio y creatinina; 4) Inhibidores de SGLT2 (Dapagliflozina 10 mg/día o Empagliflozina 10 mg/día): Beneficio independiente de si el paciente es diabético o no.'
      },
      {
        heading: 'Rol de los Diuréticos de Asa y Fármacos de Segunda Línea',
        text: 'La Furosemida es un diurético sintomático para aliviar la congestión pulmonar y periférica; NO reduce la mortalidad por sí sola. Si la FC persiste ≥ 70 lpm en ritmo sinusal bajo dosis máxima tolerada de Betabloqueador, se añade Ivabradina. En pacientes afrodescendientes o intolerantes a ARNI/IECA se usa Hidralazina + Dinitrato de Isosorbide.'
      }
    ],
    table: {
      title: 'Los 4 Pilares de la Cuádruple Terapia en IC-FEr (Guías 2026)',
      headers: ['Pilar Farmacológico', 'Fármaco de Elección', 'Dosis Inicial / Meta', 'Efecto Demostrado'],
      rows: [
        ['1. ARNI', 'Sacubitrilo / Valsartán', '49/51 mg c/12h → 97/103 mg c/12h', 'Reduce mortalidad 20% vs Enalapril'],
        ['2. Betabloqueador', 'Carvedilol / Bisoprolol', '3.125 mg c/12h → 25 mg c/12h / 1.25 → 10 mg', 'Reduce muerte súbita y mortalidad 35%'],
        ['3. Antagonista MR', 'Espironolactona', '12.5-25 mg/día → 50 mg/día', 'Reduce mortalidad 30% en CF II-IV'],
        ['4. iSGLT2', 'Dapagliflozina / Empagliflozina', '10 mg / día (dosis fija sin titulación)', 'Reduce hospitalizaciones y muerte CV 25%']
      ]
    },
    vignette: 'Hombre de 63 años con IC-FEr (FEVI 30%) en CF II, actualmente en tratamiento con Enalapril 10 mg c/12h y Carvedilol 25 mg c/12h. Examen físico: sin edemas ni rales, PA 120/75, K+ 4.4 mEq/L, GFR 65 mL/min.',
    explicacion: 'Para optimizar el pronóstico vital según guías 2026, la conducta es: 1) Agregar Dapagliflozina 10 mg/día; 2) Agregar Espironolactona 25 mg/día; 3) Reemplazar Enalapril por Sacubitrilo/Valsartán respetando el lavado de 36 horas.',
    keyPoints: [
      'Los 4 fármacos que reducen mortalidad en IC-FEr: ARNI + Betabloqueador + Espironolactona + iSGLT2.',
      'Dapagliflozina y Empagliflozina se indican en IC-FEr e IC-FEp independientemente de si hay Diabetes.',
      'Al cambiar de IECA a ARNI, se debe esperar un periodo de lavado de 36 horas para evitar angioedema.'
    ],
    questions: [
      {
        stem: '¿Cuál de los siguientes fármacos utilizados en insuficiencia cardíaca con FEVI reducida NO ha demostrado reducir la mortalidad global y solo tiene un rol en el control sintomático de la congestión?',
        options: [
          { id: 'A', text: 'Furosemida' },
          { id: 'B', text: 'Sacubitrilo / Valsartán' },
          { id: 'C', text: 'Carvedilol' },
          { id: 'D', text: 'Espironolactona' },
          { id: 'E', text: 'Empagliflozina' }
        ],
        correcta: 'A',
        explicacion: 'La Furosemida (diurético de asa) es fundamental para controlar la sobrecarga hídrica y los síntomas congestivos, pero no modifica la historia natural ni reduce la mortalidad a largo plazo.'
      }
    ]
  },

  {
    id: 'cardio-12',
    blockNum: 3,
    blockName: 'Insuficiencia Cardíaca & Shock',
    topicLabel: '3.3',
    title: 'Edema Agudo de Pulmón & Cuadrícula de Forrester',
    perfilCode: '1.01.2.005, 1.01.3.006',
    dx: 'Específico', tx: 'Inicial', seg: 'Derivar',
    ges: 'Patología GES (Urgencia de la Insuficiencia Cardíaca Aguda)',
    svg: null,
    algoTitle: 'Cuadrícula de Forrester y Manejo de Insuficiencia Cardíaca Aguda',
    sections: [
      {
        heading: 'Clasificación Hemodinámica de Forrester y Stevenson',
        text: 'La IC aguda se clasifica según la presencia de Congestión (Húmedo vs Seco) e Hipoperfusión (Caliente vs Frío): 1) Perfil A (Caliente y Seco): Compensado, sin congestión ni hipoperfusión; 2) Perfil B (Caliente y Húmedo): El más frecuente (70%). Paciente hipertenso con EPA, congestión pulmonar masiva pero buena perfusión periférica; 3) Perfil L (Frío y Seco): Hipovolémico / deshidratado por exceso de diuréticos; 4) Perfil C (Frío y Húmedo): Shock Cardiogénico con congestión pulmonar e hipoperfusión tisular severa.'
      },
      {
        heading: 'Manejo del Edema Agudo de Pulmón Hipertensivo (Perfil B)',
        text: '1) Ventilación No Invasiva (VNI - CPAP / BiPAP): Reduce el trabajo respiratorio, aumenta la presión intratorácica y disminuye la precarga/postcarga; 2) Vasodilatadores EV: Nitroglicerina en infusión continua (comenzar a 10-20 mcg/min y titular) para reducir rápidamente la postcarga; 3) Diuréticos de Asa: Furosemida 40-80 mg EV en bolo directo (o el doble de la dosis oral habitual); 4) Posición sentada con piernas colgando y Oxigenoterapia para SatO₂ > 90%.'
      }
    ],
    table: {
      title: 'Cuadrícula de Forrester / Stevenson y Conducta Terapéutica',
      headers: ['Perfil Clínico', 'Estado Hemodinámico', 'Signos Clínicos Clave', 'Tratamiento de Urgencia'],
      rows: [
        ['Perfil A (Warm & Dry)', 'Normoperfundido / Euvolemico', 'Sin rales, piel tibia, PA normal', 'Ajustar fármacos orales ambulatorios'],
        ['Perfil B (Warm & Wet)', 'Normoperfundido / Congestivo', 'EPA, rales hasta ápex, PA elevada, ortopnea', 'VNI + Nitroglicerina EV + Furosemida EV'],
        ['Perfil L (Cold & Dry)', 'Hipoperfundido / Seco', 'Frialdad, oliguria, sin rales, hipotensión', 'Carga cautelosa de volumen (SF 0.9%)'],
        ['Perfil C (Cold & Wet)', 'Hipoperfundido / Congestivo', 'Shock cardiogénico, EPA, lactato alto', 'Inótropos (Dobutamina) + Noradrenalina']
      ]
    },
    vignette: 'Mujer de 70 años con crisis hipertensiva (PA 190/110 mmHg) llega en insuficiencia respiratoria severa, ortopnea, sudoración fría y rales crepitantes difusos hasta los vértices pulmonares. SatO₂ 83% con FiO₂ ambiental.',
    explicacion: 'La paciente presenta un Edema Agudo de Pulmón Perfil B (Caliente-Húmedo). El tratamiento de emergencia inmediato consiste en VNI (CPAP), Nitroglicerina endovenosa para bajar la postcarga y Furosemida 40-80 mg EV en bolo.',
    keyPoints: [
      'En EPA hipertensivo (Perfil B), los vasodilatadores (Nitroglicerina EV) son más importantes que los diuréticos.',
      'La VNI reduce la necesidad de intubación endotraqueal y la mortalidad en EPA cardiogénico.',
      'En Perfil C (Shock Cardiogénico) los vasodilatadores están contraindicados; se requiere Noradrenalina/Dobutamina.'
    ],
    questions: [
      {
        stem: 'Hombre de 74 años ingresa por edema agudo de pulmón con PA 185/105 mmHg, frecuencia respiratoria 34 rpm y SatO₂ 85%. ¿Cuál es la combinación terapéutica inicial más efectiva para revertir el cuadro?',
        options: [
          { id: 'A', text: 'Ventilación No Invasiva (CPAP) + Nitroglicerina EV + Furosemida EV' },
          { id: 'B', text: 'Intubación orotraqueal inmediata + Noradrenalina en infusión' },
          { id: 'C', text: 'Dobutamina en infusión + Suero Fisiológico 1000 mL en bolo' },
          { id: 'D', text: 'Morfina 15 mg EV + Hidroclorotiazida oral' },
          { id: 'E', text: 'Amiodarona 300 mg EV + Digoxina 0.5 mg EV' }
        ],
        correcta: 'A',
        explicacion: 'En el EPA cardiogénico hipertenso (Perfil B), la combinación de VNI (CPAP) con vasodilatadores endovenosos (Nitroglicerina) y diuréticos de asa (Furosemida) es la terapia estándar de primera línea.'
      }
    ]
  },

  {
    id: 'cardio-13',
    blockNum: 3,
    blockName: 'Insuficiencia Cardíaca & Shock',
    topicLabel: '3.4',
    title: 'Shock Cardiogénico: Vasopresores & Inótropos',
    perfilCode: '1.01.2.005, 1.01.3.003',
    dx: 'Específico', tx: 'Inicial', seg: 'Derivar',
    ges: 'Patología GES (Urgencia Crítica)',
    svg: 'algo_shock.svg',
    algoTitle: 'Clasificación Hemodinámica y Manejo del Shock Cardiogénico',
    sections: [
      {
        heading: 'Definición Hemodinámica del Shock Cardiogénico',
        text: 'El Shock Cardiogénico es el estado de hipoperfusión tisular sistémica severa por fallo primario de la bomba cardíaca. Criterios diagnósticos: 1) Hipotensión arterial sostenida (PAS < 90 mmHg o caída de PAM > 30 mmHg durante > 30 min); 2) Signos de hipoperfusión orgánica: oliguria (< 0.5 mL/kg/h), compromiso de conciencia, extremidades frías/moteadas, lactato sérico > 2.0 mmol/L; 3) Parámetros invasivos (Catéter de Swan-Ganz): Índice Cardíaco (IC) < 2.2 L/min/m² y Presión Capilar Pulmonar en Cuña (PCOP) > 15-18 mmHg (congestión).'
      },
      {
        heading: 'Manejo Farmacológico: Vasopresores vs Inótropos',
        text: '1) Vasopresor de Primera Línea: NORADRENALINA (0.05 - 1.0 mcg/kg/min): Agonista alfa-1 potente con moderado efecto beta-1, restaura la PAM para perfundir coronarias con menor taquicardia/arritmias que la dopamina; 2) Inótropo de Apoyo: DOBUTAMINA (2.5 - 20 mcg/kg/min): Agonista beta-1 puro, aumenta el gasto cardíaco y volumen sistólico (usar asociada a noradrenalina si hay hipotensión severa); 3) Soporte Mecánico Circulatorio: Balón de Contrapulsación Intraaórtico (BCPIAo), Impella o ECMO Veno-Arterial como puente a revascularización o trasplante cardíaco.'
      }
    ],
    table: {
      title: 'Diagnóstico Diferencial Hemodinámico de los 4 Tipos de Shock',
      headers: ['Tipo de Shock', 'Gasto Cardíaco (GC)', 'Precarga (PCOP / PVC)', 'Resistencia Vascular (RVS)'],
      rows: [
        ['Cardiogénico', 'DISMINUIDO (↓↓)', 'ELEVADA (↑↑)', 'ELEVADA (↑↑ compensatoria)'],
        ['Hipovolémico', 'DISMINUIDO (↓↓)', 'DISMINUIDA (↓↓)', 'ELEVADA (↑↑ compensatoria)'],
        ['Distributivo (Séptico)', 'ELEVADO (↑↑ hiperdinámico)', 'DISMINUIDA o Normal', 'DISMINUIDA (↓↓ vasodilatación)'],
        ['Obstructivo (TEP / Taponamiento)', 'DISMINUIDO (↓↓)', 'ELEVADA (↑↑ PVC)', 'ELEVADA (↑↑)']
      ]
    },
    vignette: 'Hombre de 62 años post-IAM anterior extenso presenta PA 70/40 mmHg, FC 120 lpm, frialdad distal con livedo reticularis, anuria y lactato en 6.2 mmol/L. Ecocardiograma de urgencia muestra FEVI 18% con hipocinesia anterior masiva.',
    explicacion: 'El cuadro corresponde a Shock Cardiogénico severo (Perfil C). La conducta farmacológica de primera línea es iniciar infusión continua de Noradrenalina para recuperar PAM > 65 mmHg y perfundir el miocardio, asociando Dobutamina y derivando de inmediato a hemodinamia para revascularización de emergencia.',
    keyPoints: [
      'Noradrenalina es el vasopresor de 1ª elección en shock cardiogénico (superior a dopamina).',
      'Dobutamina es el inótropo de elección, pero requiere PAM adecuada o soporte con noradrenalina.',
      'En shock séptico la RVS está baja (piel caliente); en shock cardiogénico la RVS está alta (piel fría).'
    ],
    questions: [
      {
        stem: '¿Cuál de los siguientes perfiles hemodinámicos medidos por catéter de arteria pulmonar es característico del shock cardiogénico puro?',
        options: [
          { id: 'A', text: 'Índice cardíaco bajo (< 2.2 L/min/m²), PCOP elevada (> 18 mmHg) y RVS elevada' },
          { id: 'B', text: 'Índice cardíaco alto (> 4.0 L/min/m²), PCOP baja y RVS muy disminuida' },
          { id: 'C', text: 'Índice cardíaco bajo, PCOP baja (< 8 mmHg) y RVS elevada' },
          { id: 'D', text: 'Índice cardíaco normal, PCOP normal y RVS normal' },
          { id: 'E', text: 'Saturación venosa mixta de oxígeno (SvO₂) > 80%' }
        ],
        correcta: 'A',
        explicacion: 'El shock cardiogénico se caracteriza por fallo de bomba (Índice Cardíaco < 2.2 L/min/m²), congestión retrógrada (PCOP > 18 mmHg) y vasoconstricción periférica compensatoria (RVS elevada).'
      }
    ]
  },

  {
    id: 'cardio-14',
    blockNum: 3,
    blockName: 'Insuficiencia Cardíaca & Shock',
    topicLabel: '3.5',
    title: 'Miocardiopatías (MCH, MCD & Restrictiva)',
    perfilCode: '1.01.1.020, 1.01.4.006',
    dx: 'Sospecha', tx: 'Inicial', seg: 'Derivar',
    ges: 'No GES',
    svg: null,
    algoTitle: 'Diagnóstico Diferencial y Manejo de Miocardiopatías',
    sections: [
      {
        heading: 'Miocardiopatía Hipertrófica (MCH): Fisiopatología y Muerte Súbita',
        text: 'La MCH es una enfermedad autosómica dominante por mutaciones en genes sarcoméricos (cadena pesada de miosina, proteína C fijadora). Causa #1 de muerte súbita en atletas jóvenes. Características: Hipertrofia asimétrica del septum interventricular (> 15 mm) con obstrucción dinámica del tracto de salida del VI (efecto Venturi sobre la valva anterior mitral). Auscultación: Soplo sistólico eyectivo en borde esternal izquierdo que AUMENTA con maniobras que disminuyen la precarga (Valsalva, bipedestación) y DISMINUYE con maniobras que aumentan la postcarga/precarga (Handgrip, cuclillas). TRATAMIENTO: Betabloqueadores (atenolol, metoprolol) o Verapamilo. Desfibrilador Automático Implantable (DAI) para prevención de muerte súbita si hay factores de alto riesgo.'
      },
      {
        heading: 'Miocardiopatía Dilatada (MCD) y Miocardiopatía Restrictiva (MCR)',
        text: '1) MCD: Dilatación ventricular progresiva con disfunción sistólica severa (FEVI < 40%). Causas: idiopática/genética, alcohólica, post-miocarditis viral (Coxsackie, Parvovirus B19), Chagas o drogas (Doxorrubicina). Tratamiento: Cuádruple terapia GDMT estándar; 2) MCR: Rigidez miocárdica con llenado ventricular restrictivo y función sistólica casi preservada. Dilatación biauricular marcada. Causas: Amiloidosis cardíaca (la más común, engrosamiento en eco pero bajo voltaje en ECG), Hemocromatosis, Sarcoidosis.'
      }
    ],
    table: {
      title: 'Comparativa de las Tres Principales Miocardiopatías',
      headers: ['Característica', 'MCH (Hipertrófica)', 'MCD (Dilatada)', 'MCR (Restrictiva)'],
      rows: [
        ['Espesor Ventricular', 'Hipertrofia asimétrica septal (> 15 mm)', 'Normal o adelgazado', 'Engrosado (con bajo voltaje ECG)'],
        ['Función Sistólica (FEVI)', 'Normal o Hiperdinámica (> 65%)', 'SEVERAMENTE REDUCIDA (< 40%)', 'Preservada o levemente disminuida'],
        ['Clínica Principal', 'Síncope de esfuerzo, angina, muerte súbita', 'Insuficiencia cardíaca congestiva global', 'Falla cardíaca derecha predominante'],
        ['Maniobra de Valsalva', 'AUMENTA EL SOPLO SISTÓLICO', 'Disminuye o no varía', 'Sin efecto auscultatorio'],
        ['Tratamiento de Elección', 'Betabloqueadores / Implante de DAI', 'Cuádruple terapia GDMT (ARNI/BB/ARM/iSGLT2)', 'Tratar etiología (ej. Tafamidis en amiloidosis)']
      ]
    },
    vignette: 'Futbolista de 19 años presenta síncope durante un partido. Examen físico: soplo sistólico eyectivo grado III/VI en borde esternal izquierdo que se intensifica claramente al ponerse de pie y durante la fase de pujo de Valsalva. Antecedente de tío fallecido súbitamente a los 25 años.',
    explicacion: 'El cuadro clínico, la intensificación del soplo con Valsalva y los antecedentes familiares confirman Miocardiopatía Hipertrófica Obstructiva. La conducta es iniciar Betabloqueadores, suspender actividad física competitiva y evaluar criterios para implante de DAI.',
    keyPoints: [
      'El soplo de la MCH es el único soplo eyectivo que AUMENTA con la maniobra de Valsalva y bipedestación.',
      'En MCH obstructiva están CONTRAINDICADOS los digitálicos, vasodilatadores y diuréticos a dosis altas.',
      'Amiloidosis cardíaca: Engrosamiento concéntrico en ecocardiograma pero ECG con bajo voltaje paradójico.'
    ],
    questions: [
      {
        stem: 'Joven de 22 años asintomático es evaluado en chequeo deportivo. Se detecta un soplo sistólico eyectivo en foco aórtico accesorio. ¿Cuál de las siguientes maniobras semiológicas aumentará la intensidad del soplo si el paciente presenta una Miocardiopatía Hipertrófica Obstructiva?',
        options: [
          { id: 'A', text: 'Ponerse de pie bruscamente (bipedestación)' },
          { id: 'B', text: 'Realizar ejercicio de prensión isométrica manual (Handgrip)' },
          { id: 'C', text: 'Colocarse en posición de cuclillas (squatting)' },
          { id: 'D', text: 'Elevación pasiva de ambas piernas en decúbito dorsal' },
          { id: 'E', text: 'Inspiración profunda sostenida (Rivero-Carvallo)' }
        ],
        correcta: 'A',
        explicacion: 'La bipedestación y la maniobra de Valsalva reducen el retorno venoso (precarga), disminuyendo el volumen ventricular y aumentando la obstrucción en el tracto de salida del VI en la MCH, lo que intensifica el soplo.'
      }
    ]
  },

  // ── BLOQUE IV: VALVULOPATÍAS & SEMIOLOGÍA DE SOPLOS ───────────────────────
  {
    id: 'cardio-15',
    blockNum: 4,
    blockName: 'Valvulopatías & Semiología de Soplos',
    topicLabel: '4.1',
    title: 'Estenosis Aórtica: Semiología, Severidad & TAVI',
    perfilCode: '1.01.1.009, 1.01.1.021',
    dx: 'Específico', tx: 'Inicial', seg: 'Derivar',
    ges: 'Patología GES #38 (Cirugía Valvular y Reemplazo Percutáneo)',
    svg: 'algo_estenosis_aortica.svg',
    algoTitle: 'Evaluación y Criterios Quirúrgicos de Estenosis Aórtica Severa',
    sections: [
      {
        heading: 'Etiología, Semiología y Tríada de la Estenosis Aórtica (EAo)',
        text: 'La Estenosis Aórtica es la valvulopatía más frecuente en adultos mayores. Causas: Calcificación senil degenerativa (> 70 años) y Válvula Aórtica Bicúspide (en < 65 años). Tríada Clásica de Síntomas: 1) Angina de esfuerzo (sobrevida media 5 años); 2) Síncope de esfuerzo (sobrevida media 3 años); 3) Disnea de esfuerzo / IC (sobrevida media 2 años sin cirugía). Hallazgos al examen físico: Pulso Parvus et Tardus (amplitud disminuida y ascenso lento), Soplo sistólico eyectivo rudo en foco aórtico irradiado a carótidas, Frémito sistólico, Desdoblamiento paradójico del 2° ruido o R2 único apagado.'
      },
      {
        heading: 'Criterios Ecocardiográficos de Severidad e Indicación Quirúrgica',
        text: 'Estenosis Aórtica Severa: 1) Área Valvular Aórtica (AVA) < 1.0 cm² (o < 0.6 cm²/m²); 2) Gradiente Medio transvalvular > 40 mmHg; 3) Velocidad Pico > 4.0 m/s. INDICACIONES DE TRATAMIENTO INVASIVO: Todo paciente con EAo severa SINTOMÁTICO, o paciente asintomático con FEVI < 50%. Modalidades: Reemplazo Valvular Aórtico Quirúrgico (SAVR) en < 75 años de bajo riesgo quirúrgico; o Implante Percutáneo de Prótesis Aórtica (TAVI) en ≥ 75 años o alto riesgo quirúrgico.'
      }
    ],
    table: {
      title: 'Gradación Ecocardiográfica de Severidad en Estenosis Aórtica',
      headers: ['Parámetro Ecocardiográfico', 'Leve', 'Moderada', 'SEVERA (Quirúrgica si hay síntomas)'],
      rows: [
        ['Velocidad Pico del Chorro (Vmax)', '< 3.0 m/s', '3.0 - 4.0 m/s', '≥ 4.0 m/s'],
        ['Gradiente Medio de Presión', '< 20 mmHg', '20 - 40 mmHg', '≥ 40 mmHg'],
        ['Área Valvular Aórtica (AVA)', '> 1.5 cm²', '1.0 - 1.5 cm²', '< 1.0 cm² (< 0.6 cm²/m²)'],
        ['Conducta Terapéutica', 'Control eco anual', 'Control eco cada 6-12m', 'Reemplazo Valvular (SAVR / TAVI GES)']
      ]
    },
    vignette: 'Hombre de 78 años consulta por disnea progresiva y un episodio de síncope al subir escaleras. Al examen: pulso carotídeo de baja amplitud y retrasado (parvus et tardus), soplo mesosistólico rudo IV/VI en 2° EIC derecho irradiado a carótidas con segundo ruido abolido.',
    explicacion: 'El cuadro clínico y semiológico es diagnóstico de Estenosis Aórtica Severa Sintomática. Al haberse iniciado los síntomas, la sobrevida es < 2-3 años con manejo médico. La indicación perentoria es la derivación a cardiocirugía para Reemplazo Valvular Aórtico (TAVI/SAVR bajo GES).',
    keyPoints: [
      'Tríada de EAo: Angina, Síncope y Disnea. La aparición de disnea marca la peor sobrevida (< 2 años).',
      'Pulso parvus et tardus + soplo sistólico irradiado a carótidas con R2 disminuido confirma EAo severa.',
      'EAo severa sintomática = indicación quirúrgica inmediata (TAVI en ancianos/alto riesgo).'
    ],
    questions: [
      {
        stem: 'Mujer de 76 años asintomática en control por soplo. Ecocardiograma Doppler revela área valvular aórtica de 0.8 cm², gradiente medio de 46 mmHg y FEVI del 38%. ¿Cuál es la conducta indicada según las guías clínicas?',
        options: [
          { id: 'A', text: 'Reemplazo valvular aórtico (SAVR o TAVI) por EAo severa con disfunción sistólica' },
          { id: 'B', text: 'Observación y seguimiento ecocardiográfico anual por estar asintomática' },
          { id: 'C', text: 'Iniciar Betabloqueadores a dosis plenas y diuréticos' },
          { id: 'D', text: 'Indicar test de esfuerzo para desenmascarar síntomas' },
          { id: 'E', text: 'Valvuloplastía aórtica con balón como tratamiento definitivo' }
        ],
        correcta: 'A',
        explicacion: 'Aunque el paciente con Estenosis Aórtica severa (área < 1.0 cm², gradiente > 40) esté asintomático, la presencia de FEVI reducida (< 50%) es una indicación formal y prioritaria de intervención quirúrgica valvular.'
      }
    ]
  },

  {
    id: 'cardio-16',
    blockNum: 4,
    blockName: 'Valvulopatías & Semiología de Soplos',
    topicLabel: '4.2',
    title: 'Insuficiencia Aórtica & Estenosis Mitral',
    perfilCode: '1.01.1.010, 1.01.1.017, 1.01.1.008',
    dx: 'Específico', tx: 'Inicial', seg: 'Derivar',
    ges: 'Patología GES (Valvulopatías Quirúrgicas)',
    svg: 'algo_fiebre_reumatica.svg',
    algoTitle: 'Estenosis Mitral Reumática, Criterios de Jones e Insuficiencia Aórtica',
    sections: [
      {
        heading: 'Estenosis Mitral (EM) y Fiebre Reumática',
        text: 'La Estenosis Mitral es causada casi exclusivamente por secuela tardía de Fiebre Reumática (99%). Fisiopatología: Fusión de comisuras con obstrucción al llenado diastólico del VI, hipertensión auricular izquierda retrógrada, congestión pulmonar y dilatación masiva de la aurícula izquierda (altísimo riesgo de Fibrilación Auricular y trombos en orejuela). Hallazgos Auscultatorios (Ritmo de Duroziez): 1) Primer ruido brillante/reforzado (R1); 2) Chasquido de apertura mitral tras R2; 3) Retumbo diastólico apical de baja frecuencia con refuerzo presistólico (si está en ritmo sinusal). TRATAMIENTO: Valvuloplastía Mitral Percutánea con Balón (VMPB) si la anatomía es favorable (Score de Wilkins ≤ 8).'
      },
      {
        heading: 'Insuficiencia Aórtica (IAo) y Signos Periféricos Hiperdinámicos',
        text: 'Causas: Dilatación de raíz aórtica (aneurisma, Marfan, disección), endocarditis o válvula bicúspide. Produce sobrecarga de volumen y presión en el VI con aumento masivo de la presión de pulso diferencial (PA sistólica alta con diastólica muy baja, ej. 160/40 mmHg). Auscultación: Soplo diastólico aspirativo de alta frecuencia en borde esternal izquierdo con R2 disminuido y soplo funcional de Austin Flint (retumbo apical por choque del chorro regurgitante contra la valva mitral anterior). Signos periféricos: Pulso de Corrigan / Celler (en martillo de agua), Signo de Musset (balanceo de la cabeza), Signo de Quincke (pulsación capilar subungueal).'
      }
    ],
    table: {
      title: 'Comparativa Semiología: Estenosis Mitral vs Insuficiencia Aórtica',
      headers: ['Valvulopatía', 'Momento Auscultatorio', 'Signo Auscultatorio Patognomónico', 'Signo Físico Cardinal'],
      rows: [
        ['Estenosis Mitral', 'Diastólico', 'Chasquido de apertura + Retumbo diastólico apical', 'Chapa mitral (facies mitral rubicunda)'],
        ['Insuficiencia Aórtica', 'Diastólico', 'Soplo diastólico decreciente en foco aórtico accesorio', 'Presión diferencial amplia + Pulso de Corrigan'],
        ['Fiebre Reumática Aguda', 'Aguda post-faringitis', 'Criterios de Jones (Carditis, Poliartritis, Corea)', 'Tratamiento: Penicilina Benzatina']
      ]
    },
    vignette: 'Mujer de 44 años con antecedente de fiebre reumática en la infancia consulta por disnea de esfuerzo progresiva y palpitaciones irregulares. Al examen: pulso irregular y deficitario compatible con FA, primer ruido aumentado, chasquido de apertura tras el segundo ruido y retumbo diastólico con refuerzo en el ápex.',
    explicacion: 'Los hallazgos auscultatorios corresponden a Estenosis Mitral Reumática descompensada con Fibrilación Auricular. El estudio ecocardiográfico con Score de Wilkins definirá si es candidata a Valvuloplastía Percutánea con Balón o Reemplazo Quirúrgico.',
    keyPoints: [
      'Estenosis Mitral = Chasquido de apertura + Retumbo diastólico en ápex.',
      'Insuficiencia Aórtica = Presión de pulso amplia + Soplo diastólico aspirativo + Signos de Corrigan/Musset.',
      'La Estenosis Mitral severa sintomática con Wilkins ≤ 8 se trata con Valvuloplastía Percutánea con Balón.'
    ],
    questions: [
      {
        stem: 'Hombre de 42 años con soplo cardíaco presenta PA 165/45 mmHg. Al examen se observa cabeceo rítmico sincrónico con el pulso arterial (signo de Musset) y pulsación capilar visible al comprimir el lecho ungueal (signo de Quincke). ¿Cuál es la lesión valvular responsable?',
        options: [
          { id: 'A', text: 'Insuficiencia aórtica crónica severa' },
          { id: 'B', text: 'Estenosis mitral reumática' },
          { id: 'C', text: 'Insuficiencia mitral por prolapso' },
          { id: 'D', text: 'Estenosis aórtica senil' },
          { id: 'E', text: 'Coartación aórtica' }
        ],
        correcta: 'A',
        explicacion: 'La gran presión de pulso diferencial (165/45 mmHg = 120 mmHg de diferencial) y los signos periféricos hiperdinámicos (Musset, Quincke, Corrigan) son patognomónicos de Insuficiencia Aórtica severa.'
      }
    ]
  },

  {
    id: 'cardio-17',
    blockNum: 4,
    blockName: 'Valvulopatías & Semiología de Soplos',
    topicLabel: '4.3',
    title: 'Insuficiencia Mitral & Prolapso Valvular (Barlow)',
    perfilCode: '1.01.1.019, 1.01.1.021',
    dx: 'Específico', tx: 'Inicial', seg: 'Derivar',
    ges: 'Patología GES (Cirugía de Plastía o Reemplazo Mitral)',
    svg: null,
    algoTitle: 'Insuficiencia Mitral Orgánica vs Funcional y Prolapso Mitral (Barlow)',
    sections: [
      {
        heading: 'Insuficiencia Mitral (IM) Primaria vs Secundaria',
        text: '1) IM Primaria (Orgánica): Daño intrínseco del aparato valvular (Prolapso Valvular Mitral / Degeneración Mixomatosa de Barlow, Rotura de cuerdas tendíneas, Endocarditis). Auscultación: Soplo holosistólico en ápex que irradia a la axila izquierda con R1 disminuido; 2) IM Secundaria (Funcional): Valvas normales pero anillo dilatado o tracción de cuerdas por dilatación/remodelado del VI (IC-FEr, miocardiopatía dilatada o IAM previo). Auscultación: Soplo holosistólico apical con R3 por sobrecarga.'
      },
      {
        heading: 'Prolapso de la Válvula Mitral (Síndrome de Barlow) y Plastía Mitral',
        text: 'El Prolapso Mitral es el desplazamiento de una o ambas valvas mitrales > 2 mm hacia la aurícula izquierda durante la sístole. Típico en mujeres jóvenes o tejido conectivo (Marfan, Ehlers-Danlos). Auscultación: Clic mesosistólico seguido de un soplo telesistólico. Maniobras dinámicas: La bipedestación o Valsalva disminuyen el volumen del VI, provocando que el clic se adelante (ocurra más temprano en la sístole) y el soplo se alargue. TRATAMIENTO: En IM severa orgánica sintomática, la Plastía Mitral Quirúrgica (reparación preservando la válvula nativa) es la técnica de elección superior al reemplazo protésico.'
      }
    ],
    table: {
      title: 'Diferencias Clínicas y Quirúrgicas en Insuficiencia Mitral',
      headers: ['Tipo de Insuficiencia Mitral', 'Etiología Predominante', 'Hallazgo Auscultatorio', 'Tratamiento Quirúrgico Preferido'],
      rows: [
        ['IM Primaria / Orgánica', 'Prolapso mixomatoso (Barlow), rotura cuerdas', 'Soplo holosistólico en ápex irradiado a axila', 'Plastía Mitral Quirúrgica (Reparación)'],
        ['Prolapso Mitral Simple', 'Degeneración mixomatosa benigna', 'Clic mesosistólico + Soplo telesistólico', 'Observación / Betabloqueador si palpitaciones'],
        ['IM Secundaria / Funcional', 'Dilatación de VI por IC-FEr o infarto', 'Soplo holosistólico suave con R3', 'Terapia médica GDMT + MitraClip percutáneo']
      ]
    },
    vignette: 'Mujer de 28 años consulta por palpitaciones y dolor torácico atípico punzante. Al examen: contextura delgada, PA 115/70 mmHg. A la auscultación en ápex se escucha un chasquido agudo mesosistólico (clic) seguido de un soplo sistólico breve. Al pedirle que se ponga de pie, el clic se ausculta más precozmente y el soplo se prolonga.',
    explicacion: 'El cuadro corresponde a Prolapso de la Válvula Mitral (Síndrome de Barlow). La intensificación/adelantamiento del clic con la bipedestación es el hallazgo clásico por disminución del volumen ventricular.',
    keyPoints: [
      'IM severa = Soplo holosistólico en ápex con irradiación típica a la axila.',
      'Prolapso Mitral = Clic mesosistólico + soplo telesistólico (con Valsalva el clic se adelanta).',
      'En IM primaria severa operable, la Plastía Mitral (reparación) tiene menor mortalidad que el reemplazo.'
    ],
    questions: [
      {
        stem: 'Hombre de 58 años presenta disnea de esfuerzo progresiva. Ecocardiograma confirma Insuficiencia Mitral severa por rotura de cuerda tendínea de la valva posterior con FEVI conservada (62%) y diámetro telesistólico del VI de 42 mm. ¿Cuál es el tratamiento de elección?',
        options: [
          { id: 'A', text: 'Reparación quirúrgica de la válvula mitral (Plastía Mitral)' },
          { id: 'B', text: 'Reemplazo valvular con prótesis mecánica monodisco' },
          { id: 'C', text: 'Tratamiento médico con vasodilatadores y diuréticos de por vida' },
          { id: 'D', text: 'Valvuloplastía mitral percutánea con balón' },
          { id: 'E', text: 'Conducta expectante hasta que la FEVI caiga bajo 30%' }
        ],
        correcta: 'A',
        explicacion: 'En la Insuficiencia Mitral severa primaria (orgánica) sintomática con anatomía adecuada, la Reparación Quirúrgica (Plastía Mitral) es la técnica de elección recomendada por guías internacionales por preservar la función ventricular y evitar la anticoagulación permanente.'
      }
    ]
  },

  {
    id: 'cardio-18',
    blockNum: 4,
    blockName: 'Valvulopatías & Semiología de Soplos',
    topicLabel: '4.4',
    title: 'Semiología de Soplos & Maniobras Dinámicas',
    perfilCode: '1.01.1.021, 1.01.1.003',
    dx: 'Específico', tx: 'Inicial', seg: 'Derivar',
    ges: 'No GES',
    svg: 'algo_congenitas.svg',
    algoTitle: 'Algoritmo Semiología de Soplos, Maniobras Dinámicas y Cardiopatías Congénitas',
    sections: [
      {
        heading: 'Reglas de Oro en Semiología Cardiovascular de Soplos',
        text: '1) Todos los soplos DIASTÓLICOS (Estenosis Mitral, Insuficiencia Aórtica) son SIEMPRE PATOLÓGICOS y requieren ecocardiograma; 2) Todos los soplos CONTINUOS (Ductus Arterioso Persistente - soplo en maquinaria de Gibson) u HOLOSISTÓLICOS (IM, IT, CIV) son patológicos; 3) Los Soplos Inocentes/Funcionales (Soplo de Still) son siempre mesosistólicos, de baja intensidad (I-II/VI), sin frémito, no irradian, varían con la postura y se presentan con R1-R2 normales en pacientes asintomáticos.'
      },
      {
        heading: 'Maniobras Dinámicas y Efecto Hemodinámico',
        text: '1) Maniobra de Rivero-Carvallo (Inspiración profunda): Aumenta el retorno venoso al corazón derecho → AUMENTA TODOS LOS SOPLOS DEL CORAZÓN DERECHO (Insuficiencia Tricuspídea, Estenosis Pulmonar); 2) Maniobra de Valsalva / Bipedestación: Disminuye la precarga/retorno venoso → AUMENTA ÚNICAMENTE DOS SOPLOS: Miocardiopatía Hipertrófica (MCH) y Prolapso de Válvula Mitral (todos los demás soplos disminuyen); 3) Maniobra de Handgrip (Prensión isométrica): Aumenta la postcarga y resistencia vascular sistémica → AUMENTA los soplos regurgitantes izquierdos (Insuficiencia Mitral, Insuficiencia Aórtica y CIV) y DISMINUYE el soplo de Estenosis Aórtica y MCH.'
      }
    ],
    table: {
      title: 'Efecto de las Maniobras Dinámicas sobre los Soplos Cardíacos',
      headers: ['Maniobra Clínica', 'Efecto Fisiológico', 'Soplos que AUMENTAN', 'Soplos que DISMINUYEN'],
      rows: [
        ['Valsalva / Ponerse de pie', 'Disminuye precarga (volumen VI)', 'MCH (Hipertrófica) y Prolapso Mitral', 'Estenosis Aórtica, IM, IA, CIV'],
        ['Cuclillas / Elevar piernas', 'Aumenta precarga y postcarga', 'Estenosis Aórtica, IM, IA, CIV', 'MCH y Prolapso Mitral'],
        ['Handgrip (Prensión manual)', 'Aumenta postcarga (RVS)', 'Insuficiencia Mitral, IAo, CIV', 'Estenosis Aórtica y MCH'],
        ['Rivero-Carvallo (Inspiración)', 'Aumenta retorno venoso derecho', 'TODOS los soplos derechos (IT, ET, IP, EP)', 'Soplos izquierdos']
      ]
    },
    vignette: 'Niño de 7 años asintomático es derivado por hallazgo de soplo. Al examen: soplo sistólico grado II/VI en foco pulmonar, suave, de timbre musical, que disminuye de intensidad al sentarse y desaparece en bipedestación. R1 y R2 normales sin clics ni galopes.',
    explicacion: 'El cuadro corresponde a un Soplo Inocente o Funcional (Soplo de Still). Al ser mesosistólico de baja intensidad, sin irradiación y que disminuye con el cambio de postura en un niño sano, no requiere restricción física ni exámenes complementarios.',
    keyPoints: [
      'Los soplos diastólicos son SIEMPRE patológicos.',
      'Signo de Rivero-Carvallo (inspiración) diferencia soplos derechos (aumentan) de soplos izquierdos.',
      'Valsalva intensifica solo dos soplos: Miocardiopatía Hipertrófica y Prolapso Mitral.'
    ],
    questions: [
      {
        stem: 'Durante la auscultación de un paciente con sospecha de valvulopatía, el médico solicita que realice una inspiración profunda sostenida, observando un incremento muy significativo en la intensidad de un soplo holosistólico en el borde esternal izquierdo inferior. ¿Cuál es el origen más probable del soplo?',
        options: [
          { id: 'A', text: 'Insuficiencia tricuspídea (Signo de Rivero-Carvallo positivo)' },
          { id: 'B', text: 'Insuficiencia mitral orgánica' },
          { id: 'C', text: 'Estenosis aórtica severa' },
          { id: 'D', text: 'Comunicación interventricular' },
          { id: 'E', text: 'Insuficiencia aórtica' }
        ],
        correcta: 'A',
        explicacion: 'El aumento de la intensidad de un soplo con la inspiración profunda (maniobra de Rivero-Carvallo) es característico de las lesiones valvulares del corazón derecho, principalmente la Insuficiencia Tricuspídea.'
      }
    ]
  },

  // ── BLOQUE V: PATOLOGÍA VASCULAR, AORTA & PERICARDIO ─────────────────────
  {
    id: 'cardio-19',
    blockNum: 5,
    blockName: 'Patología Vascular, Aorta & Pericardio',
    topicLabel: '5.1',
    title: 'Hipertensión Arterial Esencial: Diagnóstico & Metas GES',
    perfilCode: '1.01.1.015, 1.01.4.003',
    dx: 'Específico', tx: 'Completo', seg: 'Completo',
    ges: 'Patología GES #21 (Hipertensión Arterial Primaria o Esencial en personas de 15 años y más)',
    svg: null,
    algoTitle: 'Diagnóstico, Estratificación Cardiovascular y Metas HTA GES',
    sections: [
      {
        heading: 'Criterios Diagnósticos MINSAL / GES y Medición de PA',
        text: 'La Hipertensión Arterial (HTA) se define como PA sistólica ≥ 140 mmHg y/o PA diastólica ≥ 90 mmHg. Diagnóstico clínico en Chile: 1) Perfil de Presión Arterial en APS: Promedio de ≥ 2 tomas en días distintos con cifras ≥ 140/90 mmHg; 2) MAPA (Monitoreo Ambulatorio de PA de 24 horas): Criterio diagnóstico con promedio 24h ≥ 130/80 mmHg (diurno ≥ 135/85 o nocturno ≥ 120/70); 3) AMPA (Automonitoreo domiciliario): Promedio ≥ 135/85 mmHg; 4) Confirmación directa inmediata: PA ≥ 180/110 mmHg o presencia de emergencia hipertensiva / daño de órgano blanco evidente.'
      },
      {
        heading: 'Estrategia Farmacológica Inicial: Terapia Combinada Fija (MINSAL 2026)',
        text: 'En la gran mayoría de los pacientes con HTA Grado 1 y 2, la guía GES 2026 recomienda iniciar directamente con COMBINACIÓN EN DOSIS FIJA de dos fármacos de primera línea en un solo comprimido para mejorar adherencia y control: 1) IECA o ARA2 (Enalapril / Losartán / Candesartán); 2) MÁS un Calcioantagonista Dihidropiridínico (Amlodipino 5-10 mg); 3) O MÁS un Diurético Tiazídico (Hidroclorotiazida o Indapamida). REGLA PROHIBIDA: NUNCA COMBINAR UN IECA CON UN ARA2 (aumenta falla renal e hiperkalemia sin beneficio clínico). Si no se logra meta con 2 fármacos: pasar a Triple Terapia (IECA/ARA2 + Amlodipino + Tiazida). HTA Resistente (no control con 3 fármacos a dosis plenas incluyendo diurético): agregar Espironolactona 25-50 mg/día.'
      },
      {
        heading: 'Metas Terapéuticas GES',
        text: 'Meta general para todo paciente adulto: PA < 140/90 mmHg. Meta estricta en pacientes de alto riesgo cardiovascular, diabéticos o con Enfermedad Renal Crónica / proteinuria: PA < 130/80 mmHg. En adultos mayores frágiles (> 80 años): meta sistólica entre 130-139 mmHg.'
      }
    ],
    table: {
      title: 'Esquema de Farmacoterapia Escalonada en HTA GES',
      headers: ['Paso Terapéutico', 'Combinación Recomendada', 'Ejemplo Farmacológico', 'Meta GES'],
      rows: [
        ['Paso 1 (Inicio)', 'Doble Terapia en Dosis Fija (IECA/ARA2 + BCC o Tiazida)', 'Losartán 50 mg + Amlodipino 5 mg', '< 140/90 (< 130/80 en DM/ERC)'],
        ['Paso 2 (No meta)', 'Triple Terapia Fija (IECA/ARA2 + BCC + Tiazida)', 'Losartán 100 mg + Amlodipino 10 mg + HCTZ 25 mg', '< 140/90 mmHg'],
        ['Paso 3 (Resistente)', 'Triple Terapia + Antagonista Aldosterona', 'Agregar Espironolactona 25 mg/día', '< 140/90 mmHg'],
        ['Regla de Seguridad', 'PROHIBIDA LA COMBINACIÓN IECA + ARA2', 'Enalapril + Losartán = Nefrotoxicidad', 'Contraindicación Absoluta']
      ]
    },
    vignette: 'Hombre de 52 años diabético y fumador consulta en CESFAM. Se realiza perfil de PA con registros de 155/95 mmHg y 160/98 mmHg en dos semanas consecutivas. Examen físico y fondo de ojo sin alteraciones agudas.',
    explicacion: 'El paciente es un hipertenso grado 1 de alto riesgo por ser diabético. Según la guía clínica GES MINSAL, se debe confirmar el diagnóstico e iniciar terapia combinada en dosis fija con un IECA/ARA2 (ej. Losartán 50 mg) más un Calcioantagonista (ej. Amlodipino 5 mg), con meta estricta de PA < 130/80 mmHg.',
    keyPoints: [
      'Diagnóstico de HTA: Perfil de PA (≥ 2 tomas ≥ 140/90 en días distintos) o MAPA 24h ≥ 130/80.',
      'El tratamiento inicial moderno es la combinación fija de dos fármacos (IECA/ARA2 + Amlodipino/Tiazida).',
      'Está estrictamente PROHIBIDO combinar un IECA con un ARA2.',
      'En HTA resistente (3 fármacos a dosis plenas), el 4° fármaco de elección es la Espironolactona.'
    ],
    questions: [
      {
        stem: 'Hombre de 58 años hipertenso y con antecedente de infarto previo se encuentra en tratamiento con Enalapril 20 mg/día y Carvedilol 25 mg/día, manteniendo cifras tensionales de 155/95 mmHg en controles repetidos. ¿Cuál es la modificación terapéutica más adecuada?',
        options: [
          { id: 'A', text: 'Agregar Amlodipino 5 mg o Hidroclorotiazida al esquema' },
          { id: 'B', text: 'Agregar Losartán 50 mg al Enalapril' },
          { id: 'C', text: 'Suspender Carvedilol y dejar monoterapia con Diltiazem' },
          { id: 'D', text: 'Indicar reposo y dieta sin modificar fármacos' },
          { id: 'E', text: 'Agregar Captopril sublingual en cada control' }
        ],
        correcta: 'A',
        explicacion: 'Para optimizar el control de la PA se debe asociar un fármaco de una familia complementaria (Calcioantagonista dihidropiridínico como Amlodipino o Diurético tiazídico). Nunca se debe asociar Losartán al Enalapril.'
      }
    ]
  },

  {
    id: 'cardio-20',
    blockNum: 5,
    blockName: 'Patología Vascular, Aorta & Pericardio',
    topicLabel: '5.2',
    title: 'Crisis Hipertensiva: Urgencia vs Emergencia',
    perfilCode: '1.01.2.006',
    dx: 'Específico', tx: 'Inicial', seg: 'Derivar',
    ges: 'Patología GES (Atención de Urgencia Vital)',
    svg: null,
    algoTitle: 'Algoritmo de Manejo de Crisis Hipertensiva: Urgencia vs Emergencia',
    sections: [
      {
        heading: 'Diferenciación Conceptual: Urgencia vs Emergencia Hipertensiva',
        text: 'Se define Crisis Hipertensiva como una elevación aguda de la PA generalmente > 180/120 mmHg: 1) Urgencia Hipertensiva: Cifras de PA severamente elevadas SIN daño agudo de órgano blanco. El paciente puede tener cefalea leve o mareos. Manejo: Fármacos por VÍA ORAL (Captopril 25 mg VO, Labetalol oral o Amlodipino), con meta de reducción gradual de la PA en 24 a 48 horas de forma ambulatoria; 2) Emergencia Hipertensiva: Cifras de PA elevadas ASOCIADAS A DAÑO AGUDO DE ÓRGANO BLANCO con riesgo vital inmediato: Encefalopatía hipertensiva, ACV isquémico/hemorrágico, Síndrome Coronario Agudo, Edema Agudo de Pulmón, Disección Aórtica aguda, Preeclampsia severa/Eclampsia o Falla Renal Aguda. Manejo: Hospitalización inmediata en UCI/UTI con Fármacos por VÍA ENDOVENOSA continua.'
      },
      {
        heading: 'Metas de Descenso de PA y Fármacos Endovenosos',
        text: 'Regla de Oro en Emergencias Hipertensivas: Reducir la Presión Arterial Media (PAM) en NO MÁS DE UN 20% a 25% durante la primera hora (un descenso brusco excesivo provoca isquemia cerebral o coronaria por pérdida de la autorregulación). Fármacos EV de elección: 1) Labetalol EV (alfa y beta bloqueador en bolo de 20 mg o infusión); 2) Nitroprusiato de Sodio EV (vasodilatador arteriovenoso potente para edema pulmonar o encefalopatía); 3) Nitroglicerina EV (de elección en SCA o EPA). Excepción a la regla del 25%: En Disección Aórtica aguda se debe descender la PAS a < 120 mmHg y FC < 60 lpm en los primeros 20 minutos con Labetalol/Esmolol. FÁRMACO CONTRAINDICADO: Nifedipino sublingual (provoca hipotensión no controlada, taquicardia refleja y ACV/IAM isquémico).'
      }
    ],
    table: {
      title: 'Comparativa Clínica: Urgencia vs Emergencia Hipertensiva',
      headers: ['Característica', 'Urgencia Hipertensiva', 'Emergencia Hipertensiva'],
      rows: [
        ['Daño de Órgano Blanco', 'AUSENTE (Sin daño agudo)', 'PRESENTE (Cerebro, Corazón, Riñón, Aorta)'],
        ['Vía de Administración', 'Vía Oral (Captopril, Amlodipino, Labetalol)', 'Vía Endovenosa continua (Labetalol, Nitroprusiato)'],
        ['Meta Temporal', 'Reducción en 24 a 48 horas', 'Reducción ≤ 20-25% en la 1ª hora'],
        ['Lugar de Tratamiento', 'Ambulatorio / Observación en SAPU/Urgencia', 'Hospitalización obligatoria en UCI / UTI'],
        ['Fármaco Contraindicado', 'Nifedipino Sublingual (Prohibido)', 'Descenso brusco excesivo de PA']
      ]
    },
    vignette: 'Hombre de 60 años es traído a urgencias por cefalea intensa, náuseas, confusión y visión borrosa. PA 220/130 mmHg. El fondo de ojo revela hemorragias en llama y papiledema bilateral.',
    explicacion: 'El paciente presenta una Emergencia Hipertensiva con Encefalopatía Hipertensiva (daño agudo de órgano blanco confirmado por papiledema). Requiere ingreso a UCI e inicio de Labetalol o Nitroprusiato endovenoso con meta de descenso de la PAM de no más del 20-25% en la primera hora.',
    keyPoints: [
      'Emergencia Hipertensiva = PA elevada + daño agudo de órgano blanco → Fármacos EV (Labetalol/Nitroprusiato).',
      'Urgencia Hipertensiva = PA elevada sin daño agudo → Fármacos VO (reducción gradual en 24-48h).',
      'El Nifedipino sublingual está formalmente CONTRAINDICADO por riesgo de infarto y ACV.',
      'En Emergencia Hipertensiva la PA se reduce máximo un 20-25% en la 1ª hora (salvo en Disección Aórtica).'
    ],
    questions: [
      {
        stem: 'Hombre de 54 años consulta en urgencias por cefalea occipital leve. Al control de signos vitales se constata PA 200/115 mmHg. Se encuentra vigil, orientado, sin déficit neurológico focal, examen cardiovascular normal y fondo de ojo sin papiledema ni exudados. ¿Cuál es el manejo adecuado?',
        options: [
          { id: 'A', text: 'Administrar antihipertensivo por vía oral (ej. Captopril oral) y control ambulatorio en 24-48h' },
          { id: 'B', text: 'Hospitalizar en UCI e iniciar infusión continua de Nitroprusiato de Sodio' },
          { id: 'C', text: 'Administrar Nifedipino 10 mg cápsula sublingual perforada' },
          { id: 'D', text: 'Realizar punción lumbar de urgencia' },
          { id: 'E', text: 'Administrar Furosemida 80 mg endovenosa en bolo' }
        ],
        correcta: 'A',
        explicacion: 'El cuadro corresponde a una Urgencia Hipertensiva (PA elevada sin daño agudo de órgano blanco). El manejo se realiza por vía oral con descenso paulatino en 24 a 48 horas sin requerir hospitalización en UCI ni vasodilatadores endovenosos.'
      }
    ]
  },

  {
    id: 'cardio-21',
    blockNum: 5,
    blockName: 'Patología Vascular, Aorta & Pericardio',
    topicLabel: '5.3',
    title: 'Pericarditis Aguda & Taponamiento Cardíaco',
    perfilCode: '1.01.1.022, 1.01.2.010',
    dx: 'Específico', tx: 'Inicial', seg: 'No requiere',
    ges: 'No GES',
    svg: 'algo_pericarditis.svg',
    algoTitle: 'Algoritmo Diagnóstico de Pericarditis Aguda y Tríada de Beck en Taponamiento',
    sections: [
      {
        heading: 'Diagnóstico de Pericarditis Aguda (Criterios ESC)',
        text: 'El diagnóstico de Pericarditis Aguda requiere al menos 2 de los siguientes 4 criterios: 1) Dolor torácico pleurítico característico (punzante, retroesternal, que aumenta con la inspiración profunda y el decúbito supino, y ALIVIA AL INCLINARSE HACIA ADELANTE); 2) Frote Pericárdico a la auscultación (ruido áspero y superficial en borde esternal izquierdo); 3) Cambios electrocardiográficos típicos en 4 fases: Fase 1 con Supradesnivel del segmento ST cóncavo ("en carita feliz") difuso en casi todas las derivaciones e Infradesnivel del segmento PR (muy específico, especialmente en DII); 4) Derrame pericárdico nuevo o empeorado en Ecocardiograma. TRATAMIENTO DE 1ª LÍNEA: AINEs a dosis altas (Ibuprofeno 600 mg c/8h o Aspirina 500-1000 mg c/8h) MÁS COLCHICINA 0.5 mg/día por 3 meses (reduce recidivas a la mitad).'
      },
      {
        heading: 'Taponamiento Cardíaco y Tríada de Beck',
        text: 'El Taponamiento Cardíaco es una emergencia hemodinámica producida por la acumulación de líquido pericárdico a presión que colapsa las cavidades derechas (impidiendo el llenado diastólico). Tríada Clásica de Beck: 1) Hipotensión arterial; 2) Ingurgitación yugular severa; 3) Ruidos cardíacos apagados o velados. Signo de Pulso Paradojal: Caída de la Presión Arterial Sistólica > 10 mmHg durante la inspiración normal. ECG: Bajo voltaje difuso y Alternancia Eléctrica (complejos QRS de distinta amplitud latido a latido por balanceo del corazón). TRATAMIENTO DE EMERGENCIA: PERICARDIOCENTESIS EVACUADORA INMEDIATA guiada por ecografía o punción subxifoidea.'
      }
    ],
    table: {
      title: 'Diagnóstico Diferencial: Pericarditis Aguda vs Taponamiento Cardíaco',
      headers: ['Entidad Clínica', 'Hallazgo Clínico Patognomónico', 'Hallazgo Electrocardiográfico', 'Tratamiento de Elección'],
      rows: [
        ['Pericarditis Aguda', 'Dolor pleurítico que alivia al inclinarse adelante', 'Supra ST cóncavo difuso + Infra PR en DII', 'AINEs dosis alta + Colchicina 3 meses'],
        ['Taponamiento Cardíaco', 'Tríada de Beck + Pulso Paradojal (> 10 mmHg)', 'Alternancia eléctrica + Bajo voltaje', 'PERICARDIOCENTESIS evacuadora de urgencia'],
        ['Pericarditis Constrictiva', 'Signo de Kussmaul (aumento de IY en inspiración)', 'Calcificación pericárdica en Rx tórax', 'Pericardiectomía quirúrgica']
      ]
    },
    vignette: 'Hombre de 38 años consulta por disnea súbita y mareos. Presenta PA 85/55 mmHg, FC 115 lpm, marcada ingurgitación yugular hasta el ángulo mandibular y ruidos cardíacos apenas audibles. Al tomar la presión se constata que la PAS cae 18 mmHg durante la inspiración.',
    explicacion: 'El paciente presenta la Tríada de Beck (hipotensión, ingurgitación yugular, ruidos apagados) y Pulso Paradojal severo (> 10 mmHg), confirmando Taponamiento Cardíaco. La conducta salvadora inmediata es la Pericardiocentesis de urgencia.',
    keyPoints: [
      'Pericarditis = Dolor que alivia al inclinarse hacia adelante + Supra ST cóncavo + Infra PR.',
      'Tratamiento de Pericarditis = AINEs + Colchicina por 3 meses.',
      'Taponamiento = Tríada de Beck + Pulso Paradojal → Pericardiocentesis de urgencia.'
    ],
    questions: [
      {
        stem: 'Hombre de 28 años consulta por dolor precordial urente de 2 días de evolución que empeora al acostarse y se alivia al sentarse e inclinarse hacia el frente. El ECG muestra supradesnivel del segmento ST cóncavo difuso en derivaciones DI, DII, aVF y V2-V6 con infradesnivel del PR en DII. ¿Cuál es el tratamiento médico de primera línea indicado?',
        options: [
          { id: 'A', text: 'Ibuprofeno a dosis altas asociado a Colchicina por 3 meses' },
          { id: 'B', text: 'Angioplastía coronaria primaria de urgencia' },
          { id: 'C', text: 'Prednisona oral a dosis plenas' },
          { id: 'D', text: 'Anticoagulación con Heparina de bajo peso molecular' },
          { id: 'E', text: 'Pericardiocentesis evacuadora inmediata' },
        ],
        correcta: 'A',
        explicacion: 'El cuadro corresponde a Pericarditis Aguda no complicada. El tratamiento de primera línea según las guías internacionales es la combinación de AINEs a dosis plenas (ej. Ibuprofeno 600 mg c/8h o AAS) asociado a Colchicina 0.5 mg/día durante 3 meses para reducir la tasa de recidiva.'
      }
    ]
  },

  {
    id: 'cardio-22',
    blockNum: 5,
    blockName: 'Patología Vascular, Aorta & Pericardio',
    topicLabel: '5.4',
    title: 'Disección Aórtica Aguda (Stanford A vs B) & AAA',
    perfilCode: '1.01.2.011, 1.01.4.005',
    dx: 'Sospecha', tx: 'Inicial', seg: 'Derivar',
    ges: 'Patología GES #38 (Cirugía Aórtica de Urgencia)',
    svg: 'algo_diseccion_aortica.svg',
    algoTitle: 'Disección Aórtica (Stanford A vs B) y Aneurisma de Aorta Abdominal (AAA)',
    sections: [
      {
        heading: 'Disección Aórtica Aguda: Clasificación de Stanford y Clínica',
        text: 'La Disección Aórtica se produce por un desgarro de la íntima aórtica con creación de una falsa luz en la capa media. Factor de riesgo principal: Hipertensión Arterial crónica severa y enfermedades del colágeno (Marfan). Clínica cardinal: Dolor torácico lacerante o desgarrador de inicio súbito máximo desde el primer segundo, irradiado al dorso interescapular o abdomen, asociado a Asimetría de pulsos o Diferencia de Presión Arterial > 20 mmHg entre ambos brazos y soplo de insuficiencia aórtica nuevo.'
      },
      {
        heading: 'Clasificación de Stanford y Manejo Diferenciado',
        text: '1) Stanford Tipo A (65%): Afecta la AORTA ASCENDENTE (independiente de dónde termine). Es una EMERGENCIA QUIRÚRGICA INMEDIATA por riesgo inminente de rotura a saco pericárdico (taponamiento), oclusión coronaria o insuficiencia aórtica aguda masiva; 2) Stanford Tipo B (35%): Afecta exclusivamente la AORTA DESCENDENTE (distal a la arteria subclavia izquierda). TRATAMIENTO MÉDICO INICIAL en UCI: Betabloqueadores EV (Labetalol o Esmolol) para lograr metas estrictas de PAS < 120 mmHg y FC < 60 lpm en los primeros 20 minutos (reduciendo el dP/dt o estrés de cizallamiento aórtico). Cirugía o stent endovascular (TEVAR) solo si hay complicaciones (isquemia de órganos, dolor refractario o expansión).'
      },
      {
        heading: 'Aneurisma de Aorta Abdominal (AAA)',
        text: 'El AAA es la dilatación de la aorta abdominal > 3.0 cm (más frecuente infrarrenal en hombres mayores fumadores). Generalmente asintomático hasta su rotura. Indicación de reparación electiva: Diámetro ≥ 5.5 cm en hombres (≥ 5.0 cm en mujeres), crecimiento rápido (> 1.0 cm/año o > 0.5 cm en 6 meses) o presencia de dolor/síntomas atribuibles. Tríada de rotura de AAA: Dolor abdominal/lumbar súbito + Masa abdominal pulsátil + Shock/hipotensión → Laparotomía exploradora de emergencia.'
      }
    ],
    table: {
      title: 'Clasificación de Stanford en Disección Aórtica',
      headers: ['Tipo Stanford', 'Compromiso Anatómico', 'Mortalidad / Riesgo', 'Conducta Terapéutica Inmediata'],
      rows: [
        ['Stanford Tipo A', 'Aorta Ascendente (± descendente)', '1-2% por hora las primeras 48h', 'CIRUGÍA CARDÍACA DE EMERGENCIA'],
        ['Stanford Tipo B', 'Aorta Descendente exclusiva', 'Menor riesgo de rotura aguda', 'Tratamiento Médico: Labetalol EV (PAS < 120, FC < 60)'],
        ['Examen de Elección', 'Diagnóstico confirmatorio', 'AngioTAC de Tórax y Abdomen', 'Inmediato en paciente hemodinámicamente estable']
      ]
    },
    vignette: 'Hombre de 62 años hipertenso ingresa por dolor torácico lacerante 10/10 súbito irradiado a la espalda entre ambas escápulas. Al examen: PA brazo derecho 185/100 mmHg, PA brazo izquierdo 130/75 mmHg. Se ausculta soplo diastólico aspirativo nuevo en foco aórtico.',
    explicacion: 'La clínica de dolor desgarrador súbito con asimetría de presiones entre brazos (> 20 mmHg) y soplo de IAo confirma una Disección Aórtica Stanford Tipo A. La conducta inmediata es iniciar Labetalol EV para controlar PA/FC, solicitar AngioTAC urgente y activar equipo de cirugía cardíaca de emergencia.',
    keyPoints: [
      'Dolor torácico desgarrador súbito máximo desde el inicio + asimetría de pulsos = Disección Aórtica.',
      'Stanford A (aorta ascendente) = Cirugía de emergencia inmediata.',
      'Stanford B (aorta descendente) = Manejo médico con Betabloqueadores EV (Labetalol meta PAS < 120).',
      'AAA se opera electivamente si diámetro ≥ 5.5 cm o si es sintomático.'
    ],
    questions: [
      {
        stem: 'Hombre de 64 años con dolor torácico desgarrador interescapular. AngioTAC confirma Disección Aórtica que se origina distal al ostium de la arteria subclavia izquierda y se extiende hacia la aorta abdominal sin compromiso de ramas viscerales ni signos de isquemia (Stanford B). PA 180/105 mmHg, FC 88 lpm. ¿Cuál es el tratamiento inicial indicado?',
        options: [
          { id: 'A', text: 'Tratamiento médico en UCI con Labetalol endovenoso con metas de PAS < 120 mmHg y FC < 60 lpm' },
          { id: 'B', text: 'Cirugía abierta de reemplazo aórtico urgente inmediata' },
          { id: 'C', text: 'Trombolisis sistémica con Alteplasa' },
          { id: 'D', text: 'Nitroprusiato de Sodio en monoterapia sin betabloqueador' },
          { id: 'E', text: 'Anticoagulación con Heparina no fraccionada en bolo' }
        ],
        correcta: 'A',
        explicacion: 'La Disección Aórtica Stanford Tipo B no complicada se maneja inicialmente en UCI con terapia médica basada en Betabloqueadores endovenosos (Labetalol) para reducir el estrés de cizallamiento aórtico con metas estrictas de PAS < 120 mmHg y FC < 60 lpm.'
      }
    ]
  },

  {
    id: 'cardio-23',
    blockNum: 5,
    blockName: 'Patología Vascular, Aorta & Pericardio',
    topicLabel: '5.5',
    title: 'Tromboembolismo Pulmonar (TEP) & TVP',
    perfilCode: '1.01.1.006, 1.01.1.023',
    dx: 'Sospecha', tx: 'Inicial', seg: 'Derivar',
    ges: 'Patología GES (Atención de Urgencia en TEP)',
    svg: 'algo_tep.svg',
    algoTitle: 'Algoritmo de Tromboembolismo Pulmonar (TEP), TVP y Patología Vascular',
    sections: [
      {
        heading: 'Fisiopatología y Tríada de Virchow',
        text: 'La Enfermedad Tromboembólica Venosa comprende la Trombosis Venosa Profunda (TVP) y el Tromboembolismo Pulmonar (TEP). Se origina por la Tríada de Virchow: 1) Estasis venosa (inmovilización, cirugía ortopédica, vuelos largos); 2) Lesión endotelial (trauma, catéteres); 3) Hipercoagulabilidad (cáncer activo, trombofilias, anticonceptivos orales/estrógenos, embarazo). Más del 90% de los TEP se originan de trombos en venas proximales de las extremidades inferiores (ilíacas, femorales, poplíteas).'
      },
      {
        heading: 'Estratificación con Score de Wells y Diagnóstico Escalonado',
        text: 'Score de Wells para TEP: Signos de TVP (3 pts), Diagnóstico alternativo menos probable que TEP (3 pts), FC > 100 lpm (1.5 pts), Inmovilización o cirugía en 4 sem (1.5 pts), Antecedente de TVP/TEP previo (1.5 pts), Hemoptisis (1 pt), Cáncer activo (1 pt). Conducta según Probabilidad: 1) Probabilidad Baja/Intermedia (Wells ≤ 4 pts): Solicitar D-DÍMERO (alto valor predictivo negativo; si es < 500 ng/mL o ajustado por edad descarta TEP sin imágenes); 2) Probabilidad Alta (Wells > 4 pts): Solicitar ANGIOTAC DE TÓRAX DE ENTRADA (Gold Standard); 3) Sospecha de TVP: Eco-Doppler Venoso de Extremidades Inferiores.'
      },
      {
        heading: 'Tratamiento del TEP: Hemodinámicamente Inestable (Masivo) vs Estable',
        text: '1) TEP de Alto Riesgo / Masivo (Hipotensión con PAS < 90 mmHg, shock o paro): El fallo del VD colapsa el gasto cardíaco. TRATAMIENTO: TROMBÓLISIS SISTÉMICA DE EMERGENCIA con Alteplasa (rtPA 100 mg EV en infusión de 2 horas) o Tenecteplase, asociada a Heparina No Fraccionada; 2) TEP No Masivo (Hemodinámicamente Estable): ANTICOAGULACIÓN ORAL CONTINUA con DOACs (Apixabán 10 mg c/12h por 7 días y luego 5 mg c/12h; o Rivaroxabán 15 mg c/12h por 21 días y luego 20 mg/día) durante un mínimo de 3 a 6 meses.'
      }
    ],
    table: {
      title: 'Algoritmo Diagnóstico y Terapéutico en Sospecha de TEP',
      headers: ['Escenario Clínico', 'Score de Wells', 'Examen de Elección', 'Tratamiento Farmacológico'],
      rows: [
        ['Baja / Intermedia Probabilidad', 'Wells ≤ 4 puntos', 'D-Dímero ultrasensitivo', 'Si Dímero D negativo: Descartar TEP'],
        ['Alta Probabilidad (Estable)', 'Wells > 4 puntos', 'AngioTAC de Tórax', 'Anticoagulación con DOACs (Apixabán / Rivaroxabán)'],
        ['TEP Inestable / Shock (Masivo)', 'Hipotensión PAS < 90 mmHg', 'AngioTAC o Eco-Cardio bedside', 'TROMBÓLISIS SISTÉMICA (Alteplasa 100 mg EV)'],
        ['Trombosis Venosa Profunda (TVP)', 'Asimetría pantorrilla > 3 cm', 'Eco-Doppler Venoso EEII', 'Anticoagulación por mínimo 3 meses']
      ]
    },
    vignette: 'Mujer de 34 años usuaria de anticonceptivos orales consulta por disnea súbita y dolor pleurítico derecho tras viaje en avión de 12 horas. Al examen: FC 118 lpm, SatO₂ 91%, PA 125/80 mmHg. Pantorrilla izquierda con aumento de volumen doloroso y edema.',
    explicacion: 'La paciente tiene alta probabilidad clínica de TEP (Wells = 7.5: TVP clínica + taquicardia + inmovilización). La conducta diagnóstica de elección es realizar AngioTAC de Tórax e iniciar anticoagulación terapéutica inmediata con DOACs.',
    keyPoints: [
      'Si probabilidad de TEP es baja/intermedia → Dímero D; si es alta → AngioTAC de entrada.',
      'TEP Masivo (inestabilidad hemodinámica / shock) = Trombólisis sistémica con Alteplasa (rtPA).',
      'TEP estable = Anticoagulación oral con DOACs (Apixabán/Rivaroxabán) por mínimo 3 a 6 meses.'
    ],
    questions: [
      {
        stem: 'Mujer de 65 años en su tercer día postoperatorio de reemplazo de cadera presenta disnea súbita severa, pérdida de conciencia y colapso circulatorio con PA 65/40 mmHg y cianosis. Ecocardiograma de urgencia muestra ventrículo derecho severamente dilatado e hipocinético con hipertensión pulmonar aguda. ¿Cuál es el tratamiento de elección inmediato?',
        options: [
          { id: 'A', text: 'Trombolisis sistémica con Alteplasa (rtPA 100 mg EV) de emergencia' },
          { id: 'B', text: 'Anticoagulación con Heparina de bajo peso molecular en dosis profiláctica' },
          { id: 'C', text: 'Instalación de filtro de vena cava inferior exclusivo' },
          { id: 'D', text: 'Aspirina 100 mg y observación en sala básica' },
          { id: 'E', text: 'Administración de fluidos EV masivos sin fármacos' }
        ],
        correcta: 'A',
        explicacion: 'El cuadro corresponde a un Tromboembolismo Pulmonar Masivo de Alto Riesgo con inestabilidad hemodinámica y shock obstructivo por fallo agudo del ventrículo derecho. La terapia de rescate salvadora de primera línea es la Trombólisis Sistémica inmediata con fibrinolíticos (Alteplasa).'
      }
    ]
  }
];

module.exports = { cardiologyClassesData };
