/**
 * DATASET · Gastroenterología — MUESTRA DE AUDITORÍA (3 clases, una por tier).
 * Estructura definitiva para el pipeline de Módulo 1. Fuentes:
 *   · códigos + Dx/Tx/Seg  → eunacom-master-curriculum/perfil_v3_full.json (Perfil v3 2026)
 *   · prosa / tablas / pearls → src/data/classesCatalog.json  (verificado vs ACTUALIZACION_2026_CHECKLIST.md)
 *   · preguntas → public/data/reconstrucciones/topic_index.json (banco real EUNACOM)
 * Campos nuevos vs cardiología:  contexto ("¿Por qué?")  ·  classId (enlaces libro↔web)
 */
module.exports = { gastroenterologiaClasses: [

  /* ───────────────────────── 🟡 STANDARD ───────────────────────── */
  {
    id: 'gastro-01', classId: 'gastro-01', tier: 2,
    blockNum: 1, blockName: 'Esófago y Estómago',
    topicLabel: '1.1', title: 'Enfermedad por Reflujo Gastroesofágico y Esófago de Barrett',
    perfilCode: '1.06.1.027', dx: 'Específico', tx: 'Completo', seg: 'Completo',
    ges: 'Sin garantía GES específica · Norma MINSAL de dispepsia y uso racional de IBP',
    reconstrucciones: 'EUNACOM 2013 (Q#12) · EUNACOM Julio 2015 (Q#124) · EUNACOM Diciembre 2019 (Q#88)',
    frecuencia: 'Alta rentabilidad · tema de tratamiento farmacológico (16 de 31 preguntas del banco son de manejo)',
    svg: null, algoTitle: 'Enfrentamiento de la pirosis crónica y decisión de endoscopía',
    contexto: 'El esfínter esofágico inferior no es una válvula anatómica sino un tono muscular mantenido que se relaja de forma transitoria decenas de veces al día. El reflujo se vuelve patológico cuando esas relajaciones son demasiado frecuentes o el aclaramiento esofágico falla: por eso el tratamiento es funcional (suprimir ácido, mejorar el vaciamiento) y la cirugía queda reservada para la excepción.',
    contentSections: [
      {
        subhead: '1. Definición y presentación clínica',
        paragraphs: [
          'La enfermedad por reflujo gastroesofágico (ERGE) es el paso retrógrado del contenido gástrico al esófago con síntomas o lesión de la mucosa. Su mecanismo es la <strong>relajación transitoria del esfínter esofágico inferior</strong>, no una obstrucción.',
          '<strong>Presentación típica:</strong> pirosis retroesternal y regurgitación ácida, que empeoran al acostarse y con la ingesta abundante. <strong>Presentación atípica:</strong> tos crónica, asma de difícil control, disfonía, erosiones dentales y dolor torácico no cardíaco.',
        ],
      },
      {
        subhead: '2. Diagnóstico: cuándo basta la clínica y cuándo se endoscopia',
        paragraphs: [
          'En un paciente menor de 40–50 años con pirosis y regurgitación <strong>típicas y sin signos de alarma</strong>, el diagnóstico es clínico y se inicia prueba terapéutica con inhibidor de la bomba de protones (IBP) por 4 a 8 semanas: la respuesta confirma el diagnóstico.',
          'La <strong>pH-metría esofágica de 24 horas</strong> es el patrón de referencia y se reserva para la duda diagnóstica, la clínica atípica o la evaluación prequirúrgica.',
          '<strong>Endoscopía digestiva alta obligatoria</strong> si hay signos de alarma: disfagia, odinofagia, baja de peso, anemia o hemorragia, síntomas que despiertan al paciente, inicio después de los 50 años o pirosis de más de 5 años de evolución (riesgo de esófago de Barrett).',
        ],
      },
      {
        subhead: '3. Tratamiento',
        paragraphs: [
          '<strong>Medidas generales:</strong> fraccionar la alimentación, elevar la cabecera de la cama, bajar de peso, suspender tabaco y evitar alcohol, cafeína, comidas grasas y relajantes musculares antes de dormir.',
          '<strong>Farmacoterapia:</strong> el IBP (omeprazol, esomeprazol, lansoprazol) es el fármaco de elección y debe tomarse <strong>en ayunas, 30–60 minutos antes del desayuno</strong>. Los antagonistas H₂ (ranitidina, famotidina) están desplazados y no deben combinarse con IBP.',
          '<strong>Cirugía antirreflujo (funduplicatura de Nissen):</strong> paciente joven con ERGE grave dependiente de IBP, hernia hiatal voluminosa sintomática, o esófago de Barrett con displasia de alto grado.',
        ],
      },
      {
        subhead: '4. Esófago de Barrett',
        paragraphs: [
          'Es la <strong>metaplasia intestinal</strong> del epitelio esofágico (reemplazo del epitelio plano por cilíndrico) secundaria a la exposición ácida crónica. Es asintomático; los síntomas son los del RGE de base.',
          'Su importancia es el riesgo de progresión a <strong>adenocarcinoma de esófago</strong>. La conducta la define la biopsia: metaplasia sin displasia → IBP y endoscopía de vigilancia; displasia de bajo grado → ablación endoscópica; <strong>displasia de alto grado → resección endoscópica o esofagectomía</strong>.',
        ],
      },
    ],
    table: {
      title: 'ERGE — decisiones clave que se preguntan en el EUNACOM',
      headers: ['Escenario', 'Conducta correcta', 'Error frecuente'],
      rows: [
        ['Pirosis típica, < 50 años, sin alarma', 'Prueba con IBP 4–8 semanas', 'Pedir endoscopía de entrada'],
        ['Pirosis + disfagia o baja de peso', 'Endoscopía digestiva alta', 'Subir la dosis de IBP sin estudiar'],
        ['Duda diagnóstica / clínica atípica', 'pH-metría de 24 h', 'Tratar empíricamente de forma indefinida'],
        ['Barrett con metaplasia sin displasia', 'IBP + vigilancia endoscópica', 'Indicar cirugía por el hallazgo de metaplasia'],
        ['Barrett con displasia de alto grado', 'Resección endoscópica / esofagectomía', 'Solo aumentar IBP y controlar'],
      ],
    },
    vignette: 'Mujer de 44 años consulta por pirosis retroesternal y regurgitación ácida de 2 años de evolución, que empeora al acostarse. Ha usado antiácidos ocasionales con alivio parcial. No refiere disfagia, baja de peso ni anemia. Examen físico normal.',
    explicacion: 'ERGE no complicada en una paciente menor de 50 años sin signos de alarma: la conducta es prueba terapéutica con IBP en ayunas por 4 a 8 semanas junto con medidas antirreflujo, sin necesidad de endoscopía inicial. La endoscopía se reservaría para falta de respuesta, recurrencia precoz al suspender el IBP o aparición de signos de alarma.',
    keyPoints: [
      'Pirosis + regurgitación típicas, sin alarma y < 50 años: diagnóstico clínico y prueba con IBP; no se endoscopia de entrada.',
      'El IBP se toma en ayunas, 30–60 min antes de comer. Los antagonistas H₂ están obsoletos y no se combinan con IBP.',
      'Signos de alarma (disfagia, baja de peso, anemia, hemorragia, síntomas nocturnos, > 50 años, > 5 años de pirosis) obligan a endoscopía.',
      'Barrett = biopsia con metaplasia intestinal. Lo que decide la cirugía es la displasia, no la metaplasia — son conceptos distintos.',
      'No se erradica H. pylori por ERGE; sí es obligatorio erradicarlo en úlcera péptica y linfoma MALT.',
    ],
    questions: [
      {
        stem: 'Hombre de 27 años, sin antecedentes, consulta por 3 meses de dolor epigástrico urente que aumenta con el ayuno y el estrés, con pirosis ocasional. La endoscopía digestiva alta muestra una úlcera duodenal activa y el test de ureasa resulta negativo. No usa AINE. ¿Cuál es la conducta más adecuada?',
        options: [
          { id: 'A', text: 'Iniciar omeprazol, amoxicilina y claritromicina por 14 días' },
          { id: 'B', text: 'Indicar omeprazol y repetir la endoscopía en 6 semanas' },
          { id: 'C', text: 'Solicitar una nueva endoscopía con test de ureasa' },
          { id: 'D', text: 'Iniciar medidas antirreflujo y omeprazol a permanencia' },
          { id: 'E', text: 'Indicar solo omeprazol por 8 semanas y control clínico' },
        ],
        correcta: 'A',
        explicacion: 'Úlcera duodenal activa en un paciente que no usa AINE: se asume infección por Helicobacter pylori aunque el test de ureasa sea negativo (falso negativo frecuente si hay sangrado reciente o uso previo de IBP/antibióticos), porque el 90 % de las úlceras duodenales son por H. pylori. La conducta es la terapia erradicadora de primera línea (IBP + amoxicilina + claritromicina, 14 días), no solo supresión ácida. B y E tratan la úlcera pero no la causa. D corresponde a manejo de ERGE, no de úlcera. C retrasa el tratamiento sin cambiar la conducta.',
        recTag: 'Reconstrucción EUNACOM 2013 · Pregunta #12',
      },
      {
        stem: 'Paciente con úlcera gástrica y test de ureasa positivo recibe amoxicilina, claritromicina y omeprazol por 10 días, seguido de omeprazol por 4 semanas. El control con test de ureasa a las 6 semanas post-tratamiento sigue positivo. ¿Cuál es la conducta más adecuada?',
        options: [
          { id: 'A', text: 'Repetir el mismo esquema por 14 días' },
          { id: 'B', text: 'Realizar endoscopía digestiva alta con biopsias' },
          { id: 'C', text: 'Indicar terapia erradicadora de segunda línea' },
          { id: 'D', text: 'Repetir el test de ureasa en 3 meses' },
          { id: 'E', text: 'Observar la evolución clínica' },
        ],
        correcta: 'C',
        explicacion: 'Falla de la erradicación de primera línea confirmada por test de control positivo: se indica un esquema de segunda línea que evite la claritromicina (terapia cuádruple con bismuto, o levofloxacino + amoxicilina + IBP). Repetir el mismo esquema (A) mantiene la resistencia a claritromicina. La endoscopía (B) sería obligatoria para el control de la úlcera gástrica en sí, pero la pregunta apunta a la conducta frente a la falla de erradicación. D y E no corrigen la infección persistente.',
        recTag: 'Reconstrucción EUNACOM Julio 2015 · Pregunta #124',
      },
    ],
  },

  /* ───────────────────────── 🟢 FOCUSED ───────────────────────── */
  {
    id: 'gastro-06', classId: 'gastro-06', tier: 1,
    blockNum: 2, blockName: 'Intestino y Colon',
    topicLabel: '2.1', title: 'Trastornos Digestivos Funcionales y Síndrome de Intestino Irritable',
    perfilCode: '1.06.1.008', dx: 'Específico', tx: 'Completo', seg: 'Completo',
    ges: 'Sin garantía GES · manejo completo en Atención Primaria',
    reconstrucciones: 'EUNACOM Diciembre 2018 (Q#41) · EUNACOM Julio 2022 (Q#66)',
    frecuencia: 'Rentabilidad media · aparece como diagnóstico diferencial de dolor abdominal crónico y como pregunta de signos de alarma',
    svg: null, algoTitle: null,
    contexto: null,
    contentSections: [
      {
        subhead: '1. Concepto y peso en el examen',
        paragraphs: [
          'Los trastornos digestivos funcionales (TDF) son síntomas digestivos crónicos o recurrentes sin una anomalía estructural o bioquímica que los explique. Son la <strong>primera causa de consulta gastroenterológica</strong> y la principal causa de dolor abdominal crónico, diarrea crónica y constipación crónica.',
          'Hoy se entienden como trastornos del <strong>eje cerebro-intestino</strong>: hipersensibilidad visceral y alteración de la motilidad, gatilladas por estrés, dieta y disbiosis. El síndrome de intestino irritable (SII) es el prototipo.',
        ],
      },
      {
        subhead: '2. Diagnóstico del SII (criterios de Roma IV)',
        paragraphs: [
          '<strong>Dolor abdominal recurrente</strong> al menos 1 día por semana en los últimos 3 meses, asociado a <strong>2 o más</strong> de: relación con la defecación, cambio en la frecuencia de las deposiciones o cambio en su consistencia.',
          'Es un diagnóstico <strong>clínico y positivo</strong>, no de descarte: si el paciente cumple los criterios y no tiene signos de alarma, no se requiere una batería de exámenes. Sí se solicitan de rutina hemograma, PCR, TSH, anticuerpos de enfermedad celíaca y —en diarrea— calprotectina fecal.',
        ],
      },
      {
        subhead: '3. Signos de alarma que obligan a estudio orgánico',
        paragraphs: [
          'Cualquier signo de alarma cambia la conducta: se abandona la hipótesis funcional y se estudia con <strong>endoscopía digestiva alta o colonoscopía</strong> según la localización del síntoma.',
          'Regla mnemotécnica <strong>ABCDEFH</strong>: <strong>A</strong>nemia, <strong>B</strong>aja de peso, <strong>C</strong>ambio reciente del hábito o del patrón de síntomas, <strong>D</strong>isfagia, <strong>E</strong>dad de inicio &gt; 50 años, <strong>F</strong>amiliar de primer grado con cáncer digestivo, <strong>H</strong>emorragia (rectorragia, melena) y síntomas nocturnos que despiertan al paciente.',
        ],
      },
      {
        subhead: '4. Tratamiento del SII',
        paragraphs: [
          'Base: <strong>educación</strong> (explicar la naturaleza benigna y descartar cáncer explícitamente en la conversación), <strong>manejo del estrés</strong> y ajuste dietético (dieta baja en FODMAP, fibra soluble).',
          'Farmacoterapia dirigida al síntoma predominante: antiespasmódicos (trimebutino, bromuro de pinaverio) para el dolor; <strong>antidepresivos tricíclicos en dosis baja (amitriptilina)</strong> para el SII con predominio de diarrea; laxantes osmóticos (polietilenglicol) para el predominio de constipación.',
        ],
      },
    ],
    table: {
      title: 'Funcional vs orgánico — cómo se distingue en la práctica',
      headers: ['Rasgo', 'Trastorno funcional (SII)', 'Enfermedad orgánica'],
      rows: [
        ['Edad de inicio', 'Joven (< 50 años)', '> 50 años'],
        ['Síntomas nocturnos', 'Ausentes (no despiertan)', 'Presentes'],
        ['Baja de peso / anemia', 'Ausentes', 'Presentes'],
        ['Relación con la defecación', 'Característica (alivia o cambia)', 'Sin relación clara'],
        ['Exámenes de rutina', 'Normales', 'Alterados (VHS, PCR, calprotectina, Hb)'],
      ],
    },
    vignette: 'Mujer de 32 años consulta por dolor abdominal en hipogastrio de 8 meses de evolución que alivia tras defecar, con períodos alternados de diarrea y constipación. Sin baja de peso, rectorragia ni anemia. Examen físico y hemograma normales.',
    explicacion: 'Cumple criterios de Roma IV para síndrome de intestino irritable (dolor recurrente relacionado con la defecación y con cambio en la frecuencia y la forma de las deposiciones) y no presenta signos de alarma. El diagnóstico es clínico y positivo, no requiere endoscopía. El manejo es educación, dieta baja en FODMAP y fármacos según el síntoma predominante.',
    keyPoints: [
      'El diagnóstico de SII es clínico y positivo (criterios de Roma IV), no de descarte: no se necesita endoscopía si no hay signos de alarma.',
      'Signos de alarma (ABCDEFH): anemia, baja de peso, cambio del hábito, disfagia, edad > 50 a, familiar con cáncer, hemorragia y síntomas nocturnos.',
      'Cualquier signo de alarma obliga a estudio con endoscopía o colonoscopía para descartar cáncer.',
      'Tratamiento: educación + manejo del estrés + dieta baja en FODMAP; amitriptilina si predomina la diarrea, polietilenglicol si predomina la constipación.',
    ],
    questions: [
      {
        stem: 'Mujer de 48 años consulta por distensión y dolor abdominal de 1 año, alternando diarrea y constipación. En los últimos 2 meses refiere deposiciones más frecuentes, baja de 4 kg de peso no buscada y un episodio de rectorragia. Su madre tuvo cáncer de colon a los 55 años. ¿Cuál es la conducta más adecuada?',
        options: [
          { id: 'A', text: 'Diagnosticar síndrome de intestino irritable e iniciar dieta baja en FODMAP' },
          { id: 'B', text: 'Solicitar colonoscopía' },
          { id: 'C', text: 'Indicar antiespasmódicos y control en 3 meses' },
          { id: 'D', text: 'Solicitar test de sangre oculta en deposiciones y repetir en 1 año' },
          { id: 'E', text: 'Iniciar amitriptilina en dosis baja' },
        ],
        correcta: 'B',
        explicacion: 'Tiene múltiples signos de alarma: edad > 50 (límite), baja de peso involuntaria, cambio reciente del hábito intestinal, rectorragia y antecedente familiar de cáncer de colon. Eso descarta el manejo como trastorno funcional (A, C, E) y obliga a colonoscopía para descartar cáncer colorrectal. El test de sangre oculta (D) es una herramienta de tamizaje poblacional en personas asintomáticas, no sirve para estudiar a un paciente sintomático con banderas rojas.',
        recTag: 'Reconstrucción EUNACOM Diciembre 2018 · Pregunta #41',
      },
      {
        stem: 'Hombre de 29 años consulta por dolor abdominal recurrente de 6 meses que alivia al defecar, asociado a deposiciones más blandas cuando aparece el dolor. Sin baja de peso, anemia ni antecedentes familiares. Hemograma, PCR y anticuerpos anti-transglutaminasa normales. ¿Cuál es la conducta más adecuada?',
        options: [
          { id: 'A', text: 'Colonoscopía para descartar enfermedad inflamatoria intestinal' },
          { id: 'B', text: 'Diagnóstico de síndrome de intestino irritable e iniciar manejo' },
          { id: 'C', text: 'Endoscopía digestiva alta con biopsias duodenales' },
          { id: 'D', text: 'TAC de abdomen y pelvis con contraste' },
          { id: 'E', text: 'Prueba terapéutica con inhibidor de la bomba de protones' },
        ],
        correcta: 'B',
        explicacion: 'Cumple criterios de Roma IV (dolor recurrente que alivia con la defecación y se asocia a cambio en la consistencia de las deposiciones) sin ningún signo de alarma y con exámenes básicos normales, incluyendo serología celíaca negativa. El diagnóstico de SII es clínico y positivo; corresponde iniciar tratamiento (educación, dieta, fármacos según síntoma) sin más estudios. Las alternativas A, C y D son estudios invasivos innecesarios en ausencia de banderas rojas.',
        recTag: 'Caso tipo EUNACOM (banco 2022)',
      },
    ],
  },

  /* ───────────────────────── 🔴 DENSE-EMERGENCY ───────────────────────── */
  {
    id: 'gastro-29', classId: 'gastro-29', tier: 3,
    blockNum: 3, blockName: 'Vía biliar y Páncreas',
    topicLabel: '3.1', title: 'Pancreatitis Aguda',
    perfilCode: '1.06.2.010', dx: 'Específico', tx: 'Inicial', seg: 'Derivar',
    ges: 'Sin garantía GES específica · manejo hospitalario según Norma MINSAL de urgencia abdominal',
    reconstrucciones: 'EUNACOM 2013 (Q#66) · EUNACOM 2013 (Q#121) · EUNACOM Julio 2016 (Q#54) · EUNACOM Diciembre 2019 (Q#101)',
    frecuencia: 'Alta rentabilidad · 18 de 21 preguntas del banco son de diagnóstico diferencial del dolor epigástrico agudo',
    svg: null, algoTitle: 'Diagnóstico, estratificación de gravedad y manejo inicial de la pancreatitis aguda',
    contexto: 'La pancreatitis aguda es autodigestión: la activación intraacinar prematura del tripsinógeno desencadena una cascada de enzimas que digieren el propio páncreas y el retroperitoneo. Eso explica el dolor transfixiante, el íleo, la pérdida masiva de líquido al tercer espacio y por qué el pilar del tratamiento en las primeras 24 horas es la reposición agresiva de volumen — el paciente está perdiendo litros hacia el retroperitoneo aunque su piel esté seca.',
    contentSections: [
      {
        subhead: '1. Diagnóstico: 2 de 3 criterios',
        paragraphs: [
          'El diagnóstico de pancreatitis aguda requiere <strong>2 de los siguientes 3</strong> (criterios de Atlanta revisada 2012): (1) dolor abdominal compatible —epigástrico, intenso, transfixiante, irradiado en faja al dorso—; (2) <strong>lipasa o amilasa &gt; 3 veces el límite superior normal</strong>; (3) hallazgos de pancreatitis en imagen (TAC con contraste, ecografía o resonancia).',
          'La <strong>lipasa es más sensible y específica</strong> que la amilasa y permanece elevada más días. La magnitud de la elevación enzimática <strong>no</strong> se correlaciona con la gravedad.',
          'Si el paciente cumple los dos primeros criterios, <strong>no se necesita TAC para el diagnóstico</strong>. La TAC con contraste se indica a las 72 horas si hay duda diagnóstica o si el paciente evoluciona mal (para evaluar necrosis).',
        ],
      },
      {
        subhead: '2. Etiología: buscar siempre la causa',
        paragraphs: [
          'Las dos causas más frecuentes en Chile son la <strong>litiasis biliar</strong> (cálculo que obstruye la ampolla de Vater; más frecuente en mujeres, con elevación de transaminasas y de fosfatasas alcalinas) y el <strong>alcohol</strong> (varón, consumo intenso y sostenido).',
          'Otras: hipertrigliceridemia (&gt; 1000 mg/dL), post-CPRE, fármacos, hipercalcemia, autoinmune, trauma y tumores. A todo paciente se le solicita <strong>ecografía abdominal</strong> en las primeras 24–48 h para buscar colelitiasis y perfil lipídico y calcemia.',
        ],
      },
      {
        subhead: '3. Estratificación de gravedad',
        paragraphs: [
          'La clasificación de Atlanta revisada define pancreatitis <strong>leve</strong> (sin falla orgánica ni complicaciones locales), <strong>moderadamente grave</strong> (falla orgánica transitoria &lt; 48 h o complicación local) y <strong>grave</strong> (falla orgánica persistente &gt; 48 h).',
          'Scores predictivos: <strong>BISAP</strong> (BUN &gt; 25, alteración de conciencia, SIRS, edad &gt; 60, derrame pleural) es el más simple; APACHE-II el más usado en UCI; los criterios de Ranson requieren 48 h. Un <strong>hematocrito elevado y en ascenso, o un BUN que sube</strong> a las 24 h, predicen necrosis y mala evolución.',
        ],
      },
      {
        subhead: '4. Manejo inicial (primeras 24–48 horas)',
        paragraphs: [
          '<strong>Reposición de volumen agresiva y precoz:</strong> cristaloides, de preferencia <strong>Ringer lactato</strong>, 5–10 mL/kg/h ajustando por diuresis (meta &gt; 0,5 mL/kg/h), frecuencia cardíaca y hematocrito. Es la intervención que más impacta en la mortalidad.',
          '<strong>Analgesia</strong> potente (opioides; la meperidina ya no se prefiere). <strong>Régimen cero</strong> inicial, con <strong>realimentación oral precoz</strong> (dentro de 24–72 h) apenas cede el dolor y el íleo, incluso en pancreatitis grave (nutrición enteral por sonda nasoyeyunal si no tolera vía oral). La nutrición parenteral se evita.',
          '<strong>NO se indican antibióticos profilácticos</strong> en la pancreatitis aguda no infectada, ni siquiera en la necrótica estéril. Los antibióticos se reservan para la necrosis infectada demostrada o la colangitis concomitante.',
          '<strong>Pancreatitis biliar:</strong> colecistectomía en el mismo ingreso una vez resuelto el episodio leve; <strong>CPRE urgente (&lt; 24 h)</strong> solo si hay colangitis asociada u obstrucción biliar persistente.',
        ],
      },
    ],
    table: {
      title: 'Dolor epigástrico agudo — cómo se separa la pancreatitis de sus imitadores',
      headers: ['Diagnóstico', 'Clave que lo distingue', 'Examen que confirma'],
      rows: [
        ['Pancreatitis aguda', 'Dolor transfixiante al dorso + lipasa > 3× · íleo', 'Lipasa/amilasa; TAC a las 72 h si evoluciona mal'],
        ['Coledocolitiasis', 'Dolor + ictericia, sin fiebre · lipasa normal o poco elevada', 'Ecografía (colédoco > 7 mm) → colangio-RM'],
        ['Colangitis aguda', 'Tríada de Charcot: dolor + ictericia + fiebre', 'Ecografía + hemocultivos → CPRE'],
        ['Úlcera perforada', 'Dolor brusco "en puñalada", abdomen en tabla', 'Radiografía de tórax de pie: neumoperitoneo'],
        ['IAM de cara inferior', 'Factores de riesgo CV, síntomas vagales', 'ECG de 12 derivaciones + troponina'],
        ['Isquemia mesentérica', 'Dolor desproporcionado al examen, FA, acidosis con lactato', 'Angio-TAC de abdomen'],
      ],
    },
    vignette: 'Hombre de 45 años, sin antecedentes, consulta por dolor epigástrico intenso de 12 horas irradiado al dorso, con vómitos biliosos. Al examen: FC 90/min, PA 140/90, escleras levemente ictéricas, abdomen blando y doloroso a la palpación epigástrica sin signos peritoneales. Laboratorio: leucocitos 13.000/mm³, PCR 55 mg/L, lipasa 640 U/L (VN < 60), bilirrubina total 2,8 mg/dL de predominio directo, ecografía con colelitiasis y colédoco de 6 mm.',
    explicacion: 'Cumple 2 de 3 criterios de Atlanta (dolor típico + lipasa > 3 veces el límite superior), por lo que el diagnóstico es pancreatitis aguda, de etiología biliar (colelitiasis, patrón colestásico leve). Aunque coexista una probable coledocolitiasis, "manda" la pancreatitis por ser la condición más grave. El manejo inicial es hospitalización, reposición agresiva con Ringer lactato ajustada a diuresis, analgesia, régimen cero con realimentación precoz y ecografía ya realizada; NO se inician antibióticos profilácticos. La CPRE urgente solo se justificaría si apareciera colangitis (fiebre alta, mayor ictericia, compromiso hemodinámico).',
    keyPoints: [
      'Diagnóstico = 2 de 3: dolor típico + lipasa/amilasa > 3× el límite superior + imagen compatible. Con los dos primeros no se necesita TAC.',
      'La magnitud de la elevación enzimática NO se correlaciona con la gravedad; el hematocrito y el BUN en ascenso a las 24 h sí predicen necrosis.',
      'Pilar del tratamiento: reposición de volumen precoz y agresiva con Ringer lactato, ajustada a diuresis. Es lo que más reduce la mortalidad.',
      'Realimentación oral precoz (24–72 h) apenas cede el dolor, incluso en pancreatitis grave. Se evita la nutrición parenteral.',
      'NO antibióticos profilácticos en pancreatitis no infectada. CPRE urgente (< 24 h) solo si hay colangitis asociada.',
      'Pancreatitis biliar leve: colecistectomía en el mismo ingreso para prevenir la recurrencia.',
    ],
    questions: [
      {
        stem: 'Hombre de 45 años consulta por dolor epigástrico intenso y vómitos biliosos. Al examen: FC 90/min, PA 140/90, escleras levemente ictéricas, abdomen blando y doloroso a la palpación epigástrica. Exámenes: escleras ictéricas leves, lipasa 190 U/L (VN < 60), bilirrubina total 3,1 mg/dL directa, ecografía con colédoco de 9 mm y microlitiasis. ¿Cuál es el diagnóstico más probable?',
        options: [
          { id: 'A', text: 'Colangitis aguda' },
          { id: 'B', text: 'Pancreatitis aguda' },
          { id: 'C', text: 'Coledocolitiasis' },
          { id: 'D', text: 'Colecistitis aguda' },
          { id: 'E', text: 'Cólico biliar simple' },
        ],
        correcta: 'B',
        explicacion: 'La lipasa está sobre 3 veces el límite superior (> 180 U/L) junto con dolor típico: cumple criterios de pancreatitis aguda, y aunque coexista una coledocolitiasis (colédoco dilatado, patrón colestásico), "manda" la pancreatitis por ser la condición más grave y la que define la conducta. No hay fiebre ni compromiso hemodinámico que hagan pensar en colangitis (A). El colédoco dilatado y la ictericia descartan un cólico biliar simple (E) y la colecistitis (D) cursaría con Murphy y sin esta magnitud de ictericia.',
        recTag: 'Reconstrucción EUNACOM 2013 · Pregunta #121',
      },
      {
        stem: 'Paciente de 55 años con pancreatitis aguda biliar de 36 horas de evolución. Está hemodinámicamente estable, afebril, con dolor en disminución y tolera líquidos. Ecografía: colelitiasis, vía biliar de calibre normal, sin cálculos en el colédoco. ¿Cuál es la conducta más adecuada respecto de la vía biliar?',
        options: [
          { id: 'A', text: 'CPRE de urgencia en las próximas 24 horas' },
          { id: 'B', text: 'Colecistectomía laparoscópica durante el mismo ingreso, una vez resuelto el episodio' },
          { id: 'C', text: 'Alta con colecistectomía programada en 6 a 8 semanas' },
          { id: 'D', text: 'Colangiorresonancia y luego CPRE si es positiva' },
          { id: 'E', text: 'Manejo médico indefinido, sin cirugía, por el riesgo quirúrgico' },
        ],
        correcta: 'B',
        explicacion: 'En la pancreatitis biliar leve que ya resolvió, la colecistectomía laparoscópica debe realizarse en el mismo ingreso, porque diferirla se asocia a alta tasa de recurrencia de pancreatitis, colecistitis o colangitis en las semanas siguientes. La CPRE urgente (A) solo se indica si hay colangitis u obstrucción biliar persistente, lo que aquí no ocurre (afebril, vía biliar normal). La colangiorresonancia (D) no aporta porque la probabilidad de coledocolitiasis es baja. Diferir la cirugía (C) o no operar (E) deja al paciente expuesto a un nuevo evento.',
        recTag: 'Reconstrucción EUNACOM Julio 2016 · Pregunta #54',
      },
    ],
  },

]};
