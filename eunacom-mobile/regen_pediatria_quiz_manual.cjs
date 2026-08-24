'use strict';
const fs = require('fs');
const path = require('path');
const { createClient } = require('@libsql/client');

const TRANSCRIPT_BASE = '/Volumes/Install macOS Sequoia/Eunacom/eunacom-app-v2/medscribe/medscribe-eunacom/transcripts/Módulo 3/Pediatría/Pediatría';

const db = createClient({
  url: 'libsql://eunacom-db-dryanez.aws-us-east-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NzQ4NDI4NjgsImlkIjoiMDE5ZDNjZTAtY2IwMS03NWUxLTgwNGQtZTY4MjAzODAyYjliIiwicmlkIjoiZmJlMzc3YTQtYjQ5OC00ZGRkLTlhZjAtNTllZDlkZjQ2ZjczIn0.Sz0Y_e6H-Q4ANst6iBevPXL0kfBD0J2n58Wb04cdgkuEMvvhbP-yKMqMyLfd_qEN9jmMFgH1igvXyd-LkcWIAg'
});

const lessons = [
  {
    id: 'Módulo 3_Pediatría_Pediatría_03-Tipos-de-Recién-Nacido',
    keyPoints: [
      'RN pretérmino <37 sem, término 37-41+6, postérmino ≥42 semanas de gestación',
      'PEG <P10, AEG P10-P90, GEG >P90 del peso para la edad gestacional',
      'Membrana hialina (HMD): déficit de surfactante en pretérminos, distrés desde nacimiento',
      'Ictericia fisiológica: aparece >24h, pico día 3-5, siempre bilirrubina indirecta',
      'Ictericia patológica: aparece <24h, causa incompatibilidad ABO/Rh, requiere fototerapia urgente',
      'Hipoxia al nacer: APGAR <7 a los 5 min indica asfixia; reanimar con O2 + ventilación'
    ],
    quiz: [
      {
        questionText: 'Un RN de 35 semanas presenta dificultad respiratoria desde el nacimiento con quejido, aleteo nasal y retracción subcostal. Rx tórax muestra opacidad en vidrio esmerilado bilateral. ¿Cuál es el diagnóstico más probable?',
        options: [
          { id: 'A', text: 'Neumonía neonatal por Streptococcus grupo B', isCorrect: false, explanation: 'La neumonía neonatal puede ser similar, pero la presentación inmediata al nacer en pretérmino sin fiebre materna apunta más a HMD.' },
          { id: 'B', text: 'Síndrome de aspiración meconial', isCorrect: false, explanation: 'El SAM ocurre en postérminos con líquido amniótico teñido, no en pretérminos de 35 semanas.' },
          { id: 'C', text: 'Enfermedad de membrana hialina por déficit de surfactante', isCorrect: true, explanation: 'La HMD afecta preferentemente a pretérminos por inmadurez pulmonar y déficit de surfactante, produciendo la imagen en vidrio esmerilado característica.' },
          { id: 'D', text: 'Taquipnea transitoria del recién nacido', isCorrect: false, explanation: 'La taquipnea transitoria es más leve, aparece en RN a término o cercanos, y se resuelve en 24-72h sin requerir surfactante.' },
          { id: 'E', text: 'Neumotórax espontáneo neonatal', isCorrect: false, explanation: 'El neumotórax muestra hiperlucencia asimétrica en Rx, no opacidad bilateral en vidrio esmerilado.' }
        ]
      },
      {
        questionText: 'Recién nacido de 38 semanas, peso 2.100 g (P5 para la EG). ¿Cómo se clasifica este RN?',
        options: [
          { id: 'A', text: 'Pretérmino AEG', isCorrect: false, explanation: '38 semanas es término. Pretérmino implica <37 semanas.' },
          { id: 'B', text: 'Término PEG', isCorrect: true, explanation: '38 semanas = término; peso en P5 (< P10) = pequeño para la edad gestacional (PEG). Clasificación correcta: término PEG.' },
          { id: 'C', text: 'Término AEG', isCorrect: false, explanation: 'AEG requiere peso entre P10 y P90 para la EG. Este RN está en P5, por lo que es PEG.' },
          { id: 'D', text: 'Postérmino PEG', isCorrect: false, explanation: 'Postérmino requiere ≥42 semanas. Este nació a las 38 semanas.' },
          { id: 'E', text: 'Pretérmino PEG', isCorrect: false, explanation: 'La EG es 38 semanas, que corresponde a término, no pretérmino.' }
        ]
      },
      {
        questionText: 'Un RN de 2 días de vida presenta ictericia. La bilirrubina total es 14 mg/dL (indirecta 13). Nació a término, peso adecuado, y la madre es A+ y el RN O+. ¿Cuál es la conducta más adecuada?',
        options: [
          { id: 'A', text: 'Exanguinotransfusión inmediata', isCorrect: false, explanation: 'La exanguinotransfusión se reserva para bilirrubinas muy altas con riesgo de kernicterus, no es la primera línea a las 48h con bilirrubina de 14.' },
          { id: 'B', text: 'Fototerapia según nomograma de Bhutani para RN término', isCorrect: true, explanation: 'Con bilirrubina indirecta de 13 a las 48h en RN término, se indica fototerapia según nomograma. La incompatibilidad de grupo ABO es la causa más probable.' },
          { id: 'C', text: 'Alta con control ambulatorio en 48 horas', isCorrect: false, explanation: 'Con bilirrubina en zona de riesgo intermedio-alto a las 48h y posible incompatibilidad ABO, el alta sin tratamiento sería inapropiada.' },
          { id: 'D', text: 'Observación sin tratamiento, es ictericia fisiológica normal', isCorrect: false, explanation: 'Aunque el momento y tipo de bilirrubina coinciden con fisiológica, el nivel de 14 a las 48h requiere evaluación con nomograma y posiblemente fototerapia.' },
          { id: 'E', text: 'Suspender lactancia materna 48 horas', isCorrect: false, explanation: 'Suspender la lactancia materna solo se considera en ictericia por leche materna (tardía, semana 2-3) y nunca es de primera línea.' }
        ]
      }
    ]
  },
  {
    id: 'Módulo 3_Pediatría_Pediatría_04-Patología-Neonatal-General',
    keyPoints: [
      'Hipoglicemia neonatal: glucosa <45 mg/dL; factores de riesgo: macrosómico, prematuro, madre diabética',
      'Hipocalcemia precoz (días 1-3): Ca total <7 mg/dL o Ca iónico <1.1; en prematuros y asfícticos',
      'Poliglobulia neonatal: Hto venoso >65%; hiperviscosidad; tratamiento eritroféresis parcial',
      'EHI (encefalopatía hipóxico-isquémica): clasificación Sarnat I/II/III; hipotermia en moderada-severa',
      'Sepsis neonatal precoz (<72h): Streptococcus grupo B; tratamiento: ampicilina + cefotaxima',
      'Sepsis tardía (>72h): S. aureus y estafilococos coagulasa negativo; vancomicina + aminoglucósido'
    ],
    quiz: [
      {
        questionText: 'RN de 39 semanas, madre con diabetes gestacional mal controlada, peso al nacer 4.200 g. A las 2 horas de vida presenta temblores finos y succión débil. Glucosa capilar: 35 mg/dL. ¿Cuál es la conducta inmediata?',
        options: [
          { id: 'A', text: 'Administrar glucagón intramuscular', isCorrect: false, explanation: 'El glucagón se usa solo si no hay acceso venoso y el paciente no puede alimentarse. No es la primera línea en este contexto.' },
          { id: 'B', text: 'Alimentación oral o por SNG con fórmula', isCorrect: false, explanation: 'Si hay síntomas (temblores, succión débil), no es suficiente la alimentación oral; se requiere corrección IV.' },
          { id: 'C', text: 'Bolo de suero glucosado 10% 2 mL/kg IV + infusión continua de glucosa', isCorrect: true, explanation: 'Con glucosa <45 y síntomas, se indica bolo de SG10% 2 mL/kg IV seguido de infusión continua de glucosa para mantener >50 mg/dL.' },
          { id: 'D', text: 'Repetir glucosa capilar en 30 minutos sin tratamiento', isCorrect: false, explanation: 'Hay síntomas de hipoglicemia, lo que obliga a tratamiento inmediato, no a esperar.' },
          { id: 'E', text: 'Administrar corticoides para estimular gluconeogénesis', isCorrect: false, explanation: 'Los corticoides no son el tratamiento de hipoglicemia neonatal aguda; pueden usarse en casos refractarios crónicos como hiperinsulinismo.' }
        ]
      },
      {
        questionText: 'RN de 33 semanas presenta apneas repetidas, hipotonía marcada y convulsiones a las 12 horas de vida. Antecedente de sufrimiento fetal agudo en el parto. ¿Cuál clasificación y manejo corresponde?',
        options: [
          { id: 'A', text: 'EHI grado I (leve) – observación ambulatoria', isCorrect: false, explanation: 'EHI leve presenta irritabilidad e hiperreflexia, sin convulsiones ni hipotonía marcada; no requiere hipotermia.' },
          { id: 'B', text: 'EHI grado II (moderada) – hipotermia terapéutica sistémica', isCorrect: true, explanation: 'EHI grado II incluye hipotonía, convulsiones y apneas. La hipotermia (33-34°C por 72h) es el único neuroprotector con evidencia en EHI moderada-severa.' },
          { id: 'C', text: 'EHI grado III (severa) – solo cuidados paliativos', isCorrect: false, explanation: 'EHI severa presenta ausencia de reflejos y coma profundo. Este RN tiene convulsiones controlables, compatible con grado II.' },
          { id: 'D', text: 'Sepsis neonatal – antibióticos empíricos', isCorrect: false, explanation: 'El cuadro encaja con EHI dado el antecedente de sufrimiento fetal agudo, no con sepsis como primera causa.' },
          { id: 'E', text: 'Meningitis neonatal – punción lumbar y antibióticos', isCorrect: false, explanation: 'Sin fiebre ni otros signos infecciosos, la causa más probable es EHI. La PL puede diferirse en inestabilidad.' }
        ]
      },
      {
        questionText: 'RN de 38 semanas presenta a las 18 horas de vida fiebre 38.5°C, rechazo alimentario e irritabilidad. Madre tuvo fiebre intraparto y colonización positiva por Streptococcus agalactiae en cultivo vaginal. ¿Qué tratamiento iniciar?',
        options: [
          { id: 'A', text: 'Vancomicina + gentamicina', isCorrect: false, explanation: 'Vancomicina se usa para sepsis tardía por S. aureus o gérmenes resistentes, no es la primera línea en sepsis precoz por Streptococcus grupo B.' },
          { id: 'B', text: 'Cefazolina en monoterapia', isCorrect: false, explanation: 'Cefazolina no cubre adecuadamente los gérmenes de sepsis neonatal precoz ni listeria.' },
          { id: 'C', text: 'Ampicilina + cefotaxima (o gentamicina)', isCorrect: true, explanation: 'En sepsis neonatal precoz se cubre Streptococcus grupo B y Listeria con ampicilina, más cefotaxima o gentamicina para gramnegativos.' },
          { id: 'D', text: 'Penicilina G en monoterapia', isCorrect: false, explanation: 'Penicilina G cubre Streptococcus pero no Listeria ni gramnegativos, que deben cubrirse en sepsis neonatal precoz empírica.' },
          { id: 'E', text: 'Observación y repetir hemograma en 6 horas', isCorrect: false, explanation: 'Con factores de riesgo alto (colonización materna, fiebre intraparto) y síntomas, no se puede diferir el inicio de antibióticos.' }
        ]
      }
    ]
  },
  {
    id: 'Módulo 3_Pediatría_Pediatría_05-Microcefalia-Macrocefalia-y-Cefalea-en-Niños',
    keyPoints: [
      'Microcefalia: PC <-2DS para edad/sexo; causas: TORCH (CMV, Toxoplasma), genéticas, alcohol prenatal',
      'Macrocefalia: PC >+2DS; causa más frecuente hidrocefalia; también megalencefalia familiar benigna',
      'Hidrocefalia: dilatación ventricular en TC; tratamiento derivación ventriculoperitoneal',
      'Migraña pediátrica: unilateral o bilateral, pulsátil, con/sin aura; ibuprofeno 1ª línea, sumatriptán si falla',
      'Cefalea tensional: bilateral, opresiva no pulsátil, no vómitos, no agravada por actividad; analgésicos simples',
      'Señales de alarma en cefalea: nocturna, empeora acostado, edema papilar, déficit neurológico → neuroimagen urgente'
    ],
    quiz: [
      {
        questionText: 'Niño de 8 años consulta por cefaleas recurrentes de 6 meses. Describe dolor pulsátil hemicraneal derecho, náuseas y fotofobia, que dura 4-6 horas. Cede con ibuprofeno. Examen neurológico normal. ¿Cuál es el diagnóstico?',
        options: [
          { id: 'A', text: 'Cefalea tensional episódica', isCorrect: false, explanation: 'La cefalea tensional es bilateral, opresiva, sin náuseas ni fotofobia. No coincide con la descripción pulsátil hemicraneal con náuseas.' },
          { id: 'B', text: 'Migraña sin aura', isCorrect: true, explanation: 'Cumple criterios ICHD-3 de migraña: dolor pulsátil hemicraneal, náuseas, fotofobia, duración 2-72h, sin déficit neurológico. Diagnóstico: migraña sin aura.' },
          { id: 'C', text: 'Neuralgia del trigémino', isCorrect: false, explanation: 'La neuralgia del trigémino cursa con dolor eléctrico breve (segundos) en territorio facial, muy inusual en niños de esta edad.' },
          { id: 'D', text: 'Hipertensión endocraneana', isCorrect: false, explanation: 'La HEC produce cefalea progresiva, nocturna, con vómitos en proyectil y edema papilar. No cede con ibuprofeno ni es episódica.' },
          { id: 'E', text: 'Sinusitis frontal', isCorrect: false, explanation: 'La sinusitis produce dolor frontal constante con fiebre y rinorrea. No es episódica ni pulsátil.' }
        ]
      },
      {
        questionText: 'Lactante de 6 meses con perímetro cefálico en P98 (+2.5 DS). Fontanela anterior abombada, suturas diástasis, ojos en sol poniente. Desarrollo psicomotor normal hasta ahora. ¿Cuál es la conducta?',
        options: [
          { id: 'A', text: 'Tranquilizar a los padres: macrocefalia familiar benigna', isCorrect: false, explanation: 'Fontanela abombada, suturas diástasis y ojos en sol poniente son signos de HEC; no se puede atribuir a variante familiar sin descartar hidrocefalia.' },
          { id: 'B', text: 'Ecografía transfontanelar o TC cerebral para descartar hidrocefalia', isCorrect: true, explanation: 'Los signos clínicos (fontanela abombada, diástasis sutural, signo del sol poniente) son compatibles con hidrocefalia obstructiva, que requiere neuroimagen urgente.' },
          { id: 'C', text: 'Punción lumbar diagnóstica', isCorrect: false, explanation: 'La PL está contraindicada ante sospecha de HEC sin neuroimagen previa, por riesgo de herniación.' },
          { id: 'D', text: 'Fondo de ojo y control en 1 mes', isCorrect: false, explanation: 'El fondo de ojo puede mostrar edema papilar, pero no reemplaza a la neuroimagen. El control diferido sería inadecuado ante signos de HEC activa.' },
          { id: 'E', text: 'Resonancia magnética con sedación en forma programada', isCorrect: false, explanation: 'Si bien la RM es el gold standard, la urgencia clínica requiere TC cerebral de forma inmediata, no una RM programada.' }
        ]
      },
      {
        questionText: 'Niña de 10 años presenta cefalea intensa que la despierta a las 3 AM, asociada a vómitos en proyectil. Ha tenido 3 episodios similares en las últimas 2 semanas. Sin fiebre. ¿Qué conducta es prioritaria?',
        options: [
          { id: 'A', text: 'Diagnosticar migraña y prescribir triptanes', isCorrect: false, explanation: 'La cefalea nocturna que despierta al paciente con vómitos en proyectil es una señal de alarma que obliga a descartar lesión ocupante antes de tratar como migraña.' },
          { id: 'B', text: 'Solicitar TC o RM cerebral urgente', isCorrect: true, explanation: 'Cefalea nocturna que despierta, con vómitos en proyectil y patrón progresivo, son señales de alarma de HEC; se requiere neuroimagen urgente para descartar tumor u obstrucción.' },
          { id: 'C', text: 'Analgésicos orales y control en 1 semana', isCorrect: false, explanation: 'Las señales de alarma presentes no permiten manejo expectante ambulatorio.' },
          { id: 'D', text: 'EEG para descartar epilepsia', isCorrect: false, explanation: 'El EEG no es el estudio inicial ante cefalea con señales de alarma de HEC; la neuroimagen tiene prioridad.' },
          { id: 'E', text: 'Punción lumbar para medir presión de apertura', isCorrect: false, explanation: 'La PL no puede realizarse sin neuroimagen previa ante sospecha de HEC, por riesgo de herniación transtentorial.' }
        ]
      }
    ]
  },
  {
    id: 'Módulo 3_Pediatría_Pediatría_06-Temas-de-Neurología-Pediátrica',
    keyPoints: [
      'Parálisis cerebral: daño motor no progresivo en encéfalo inmaduro; espástica >70%, causa: prematuridad/hipoxia',
      'Convulsión febril simple: >38°C, 6m-6 años, <15 min generalizada, única; no requiere anticonvulsivantes',
      'Crisis epiléptica: ABC + benzodiacepinas; DZP rectal 0.5 mg/kg o midazolam bucal/nasal 0.2 mg/kg',
      'Síndrome hipotónico: central (PC alterado, reflejos normales) vs periférico (reflejos abolidos, fasciculaciones)',
      'Reflejos arcaicos: Moro desaparece a los 3-6m, prensión palmar 3-4m, Babinski normal hasta 2 años',
      'Epilepsia: ≥2 crisis no provocadas; EEG y neuroimagen; primera línea: levetiracetam o ácido valproico'
    ],
    quiz: [
      {
        questionText: 'Niño de 2 años, sin antecedentes, presenta episodio de 3 minutos de sacudidas generalizadas con pérdida de conciencia durante fiebre de 39.5°C. Cede espontáneamente. Post-crisis: somnoliento pero reactivo. ¿Cuál es la conducta correcta?',
        options: [
          { id: 'A', text: 'Iniciar anticonvulsivantes profilácticos de forma crónica', isCorrect: false, explanation: 'La convulsión febril simple no requiere tratamiento anticonvulsivante crónico; el riesgo de epilepsia posterior es bajo (2-3%).' },
          { id: 'B', text: 'Hospitalizar para EEG y RM cerebral urgente', isCorrect: false, explanation: 'La convulsión febril simple no requiere EEG ni neuroimagen de rutina; se indica en convulsiones febriles complejas o signos focales.' },
          { id: 'C', text: 'Buscar foco de fiebre, tratar la causa y educación familiar; no anticonvulsivantes', isCorrect: true, explanation: 'Convulsión febril simple (<15 min, generalizada, única, sin déficit post-ictal prolongado): buscar causa de fiebre, tratar y educar a la familia sobre manejo del episodio. No anticonvulsivantes.' },
          { id: 'D', text: 'Punción lumbar para descartar meningitis bacteriana', isCorrect: false, explanation: 'La PL no es rutinaria en convulsión febril simple en niños >18 meses bien examinados sin signos meníngeos ni inmunodepresión.' },
          { id: 'E', text: 'Administrar diazepam rectal en domicilio como protocolo', isCorrect: false, explanation: 'El diazepam de rescate se reserva para convulsiones febriles complejas o prolongadas, no para convulsión febril simple resuelta.' }
        ]
      },
      {
        questionText: 'Niño de 4 años lleva 8 minutos con crisis tónico-clónica generalizada activa, sin responder a estimulación. No hay acceso venoso disponible. ¿Cuál es el tratamiento de primera línea?',
        options: [
          { id: 'A', text: 'Fenitoína EV 20 mg/kg', isCorrect: false, explanation: 'La fenitoína es segunda línea en status epiléptico, no primera, y requiere acceso venoso.' },
          { id: 'B', text: 'Fenobarbital EV 20 mg/kg', isCorrect: false, explanation: 'Fenobarbital es alternativa de segunda línea y también requiere acceso venoso.' },
          { id: 'C', text: 'Midazolam bucal o intranasal 0.2 mg/kg', isCorrect: true, explanation: 'Sin acceso venoso, la primera línea para crisis prolongada es midazolam bucal o intranasal 0.2 mg/kg. Alternativa: diazepam rectal 0.5 mg/kg.' },
          { id: 'D', text: 'Esperar hasta 15 minutos antes de intervenir', isCorrect: false, explanation: 'Una crisis >5 minutos ya es un status epiléptico y debe tratarse de inmediato. No se debe esperar 15 minutos.' },
          { id: 'E', text: 'Glucosa IV empírica ante sospecha de hipoglicemia', isCorrect: false, explanation: 'Aunque la hipoglicemia puede causar convulsiones, la glucosa empírica no reemplaza el anticonvulsivante; se administra solo si glucosa baja es confirmada o altamente probable.' }
        ]
      },
      {
        questionText: 'Lactante de 6 meses con hipotonía marcada desde el nacimiento, llanto débil, reflejos osteotendinosos abolidos y fasciculaciones linguales. ¿Cuál es el diagnóstico más probable?',
        options: [
          { id: 'A', text: 'Síndrome de Down', isCorrect: false, explanation: 'Síndrome de Down puede dar hipotonía central, pero no cursa con reflejos abolidos ni fasciculaciones.' },
          { id: 'B', text: 'Hipotiroidismo congénito', isCorrect: false, explanation: 'El hipotiroidismo produce hipotonía moderada, pero no abolición de reflejos ni fasciculaciones linguales.' },
          { id: 'C', text: 'Atrofia muscular espinal tipo I (Werdnig-Hoffmann)', isCorrect: true, explanation: 'AME tipo I: hipotonía periférica severa desde el nacimiento, reflejos abolidos, fasciculaciones linguales, sin compromiso cognitivo. Causa: mutación SMN1.' },
          { id: 'D', text: 'Parálisis cerebral hipotónica', isCorrect: false, explanation: 'La PC hipotónica es de origen central: reflejos conservados o exaltados, sin fasciculaciones.' },
          { id: 'E', text: 'Miastenia gravis neonatal transitoria', isCorrect: false, explanation: 'La miastenia neonatal transitoria es por transferencia de anticuerpos maternos, dura semanas y no produce fasciculaciones.' }
        ]
      }
    ]
  },
  {
    id: 'Módulo 3_Pediatría_Pediatría_07-Síndrome-de-Down-Trisomía-21',
    keyPoints: [
      'Trisomía 21: no disyunción materna (95%); riesgo aumenta con edad materna >35 años',
      'Cardiopatía congénita en 40-50% de SD: canal aurículo-ventricular completo (CAV) es la más frecuente',
      'Malformaciones GI: atresia duodenal (imagen doble burbuja) y enfermedad de Hirschsprung',
      'Hipotiroidismo: 15-20% de niños con SD; TSH anual obligatoria desde el nacimiento',
      'Screening prenatal: translucencia nucal + PAPP-A + βhCG semanas 11-13; cariotipo confirma',
      'Inestabilidad atlantoaxoidea en ~15%: Rx lateral cuello antes de deportes de contacto'
    ],
    quiz: [
      {
        questionText: 'RN con rasgos dismórficos (epicanto, fisuras mongoloides, hipotonía, clinodactilia V dedo). A las 48h de vida presenta distensión abdominal y vómitos biliosos. Rx de abdomen muestra doble burbuja. ¿Cuál es el diagnóstico de la complicación intestinal?',
        options: [
          { id: 'A', text: 'Enfermedad de Hirschsprung', isCorrect: false, explanation: 'Hirschsprung produce obstrucción baja (ausencia de ganglios en colon), con demora en eliminación de meconio, no imagen de doble burbuja.' },
          { id: 'B', text: 'Atresia de esófago', isCorrect: false, explanation: 'La atresia esofágica produce regurgitación desde el primer intento de alimentación y no genera imagen de doble burbuja en abdomen.' },
          { id: 'C', text: 'Atresia duodenal', isCorrect: true, explanation: 'La atresia duodenal produce la imagen de "doble burbuja" (estómago + D1 dilatado), vómitos biliosos y es frecuente en Síndrome de Down.' },
          { id: 'D', text: 'Malrotación intestinal con vólvulo', isCorrect: false, explanation: 'El vólvulo puede dar imagen en caracol en imagen de contraste, pero no la clásica doble burbuja.' },
          { id: 'E', text: 'Íleo meconial por fibrosis quística', isCorrect: false, explanation: 'El íleo meconial produce obstrucción en íleon distal con imagen en "piel de vidrio", no doble burbuja duodenal.' }
        ]
      },
      {
        questionText: 'Niño de 3 años con diagnóstico de Síndrome de Down, sin cardiopatía conocida, asintomático. ¿Qué examen de seguimiento es obligatorio anualmente?',
        options: [
          { id: 'A', text: 'Ecocardiograma anual', isCorrect: false, explanation: 'El ecocardiograma se indica al diagnóstico para descartar cardiopatía; si fue normal al nacer, no es obligatorio repetirlo anualmente.' },
          { id: 'B', text: 'TSH anual para screening de hipotiroidismo', isCorrect: true, explanation: 'El hipotiroidismo afecta al 15-20% de niños con SD y puede ser de aparición tardía; la TSH anual es parte del protocolo de seguimiento obligatorio.' },
          { id: 'C', text: 'TC cerebral anual', isCorrect: false, explanation: 'No se recomienda TC cerebral de rutina en niños con SD asintomáticos.' },
          { id: 'D', text: 'Audiometría cada 5 años', isCorrect: false, explanation: 'La audiometría se recomienda cada 1-2 años en SD (alta prevalencia de hipoacusia conductiva por otitis serosa), no cada 5.' },
          { id: 'E', text: 'Cariotipo anual para detectar mosaicismo', isCorrect: false, explanation: 'El cariotipo se realiza una vez al diagnóstico para confirmar el tipo de trisomía 21; no se repite anualmente.' }
        ]
      },
      {
        questionText: 'Pareja consulta por embarazo de 12 semanas. Screening combinado del primer trimestre muestra translucencia nucal 4.5 mm (>P99), PAPP-A baja y βhCG elevada. ¿Cuál es el paso siguiente?',
        options: [
          { id: 'A', text: 'Repetir ecografía en 4 semanas', isCorrect: false, explanation: 'Una TN >3.5 mm con marcadores bioquímicos alterados da riesgo alto de aneuploidía; repetir ecografía posterga el diagnóstico.' },
          { id: 'B', text: 'Amniocentesis en semana 16 para cariotipo', isCorrect: false, explanation: 'La biopsia de vellosidades coriales (semana 11-14) permite diagnóstico más precoz que amniocentesis (semana 16).' },
          { id: 'C', text: 'Biopsia de vellosidades coriales para cariotipo fetal', isCorrect: true, explanation: 'Ante riesgo muy alto por screening combinado, se ofrece diagnóstico invasivo: BVC semana 11-14 para cariotipo fetal y confirmar Trisomía 21.' },
          { id: 'D', text: 'Test de ADN fetal libre en sangre materna (NIPT)', isCorrect: false, explanation: 'El NIPT es una opción de segunda línea de screening (muy sensible), pero no diagnóstica; si el riesgo es muy alto, se prefiere diagnóstico invasivo directo.' },
          { id: 'E', text: 'Tranquilizar a la pareja, riesgo bajo', isCorrect: false, explanation: 'Los hallazgos descritos configuran un riesgo alto de aneuploidía. Tranquilizar sin estudio adicional sería inapropiado.' }
        ]
      }
    ]
  },
  {
    id: 'Módulo 3_Pediatría_Pediatría_08-Inmunodeficiencias-en-Pediatría',
    keyPoints: [
      'Bruton (agammaglobulinemia ligada a X): gen BTK, solo varones, infecciones bacterianas recurrentes >6 meses',
      'SCID: déficit combinado severo (T+B o T-B+NK-); infecciones desde nacimiento; trasplante de médula ósea',
      'Déficit de IgA: inmunodeficiencia primaria más frecuente; infecciones respiratorias y GI recurrentes',
      'Inmunodeficiencias humorales: infecciones por bacterias encapsuladas (Neumococo, Haemophilus, Meningococo)',
      'VIH pediátrico: diagnóstico <18m por PCR viral; >18m anticuerpos; profilaxis cotrimoxazol si CD4 <25%',
      'DiGeorge (deleción 22q11): aplasia tímica, hipocalcemia por hipoparatiroidismo, cardiopatías conotruncales'
    ],
    quiz: [
      {
        questionText: 'Niño de 9 meses con 4 episodios de otitis media aguda, 2 neumonías por Streptococcus pneumoniae y 1 meningitis bacteriana. Inmunoglobulinas: IgG 120 mg/dL (VN >300), IgA e IgM indetectables. ¿Cuál es el diagnóstico más probable?',
        options: [
          { id: 'A', text: 'Inmunodeficiencia variable común (IDVC)', isCorrect: false, explanation: 'La IDVC típicamente se manifiesta en adultos jóvenes o adolescentes, no en lactantes de 9 meses.' },
          { id: 'B', text: 'Agammaglobulinemia de Bruton', isCorrect: true, explanation: 'Bruton (ligada a X): varones, inicio >6m (protección materna hasta entonces), infecciones por bacterias encapsuladas, todas las inmunoglobulinas muy bajas o indetectables.' },
          { id: 'C', text: 'SCID', isCorrect: false, explanation: 'SCID comienza desde el nacimiento con infecciones graves por bacterias, virus y hongos; no solo bacterias encapsuladas.' },
          { id: 'D', text: 'Déficit selectivo de IgA', isCorrect: false, explanation: 'El déficit de IgA preserva IgG e IgM; aquí IgG también está muy baja, lo que no corresponde a déficit aislado de IgA.' },
          { id: 'E', text: 'Neutropenia cíclica', isCorrect: false, explanation: 'La neutropenia cíclica produce infecciones bacterianas recurrentes en ciclos de ~21 días, pero sin hipogammaglobulinemia.' }
        ]
      },
      {
        questionText: 'RN de término presenta al día 2 de vida tetania hipocalcémica, cardiopatía conotruncal (truncus arteriosus) y dismorfias faciales. ¿Cuál es el diagnóstico y qué examen confirma la inmunodeficiencia subyacente?',
        options: [
          { id: 'A', text: 'SCID – recuento de linfocitos T en sangre periférica', isCorrect: false, explanation: 'SCID no se asocia específicamente a cardiopatías conotruncales ni hipocalcemia neonatal.' },
          { id: 'B', text: 'Síndrome de DiGeorge – deleción 22q11 por FISH o array-CGH', isCorrect: true, explanation: 'DiGeorge = deleción 22q11: hipocalcemia (hipoparatiroidismo), cardiopatías conotruncales (tronco, tetralogía, arco interrumpido), aplasia tímica. Se confirma con FISH 22q11 o array-CGH.' },
          { id: 'C', text: 'Bruton – niveles de inmunoglobulinas', isCorrect: false, explanation: 'Bruton no produce hipocalcemia ni cardiopatías conotruncales; se manifiesta tardíamente con infecciones bacterianas.' },
          { id: 'D', text: 'Déficit de IgA – niveles de IgA sérica', isCorrect: false, explanation: 'El déficit de IgA no explica hipocalcemia ni cardiopatía conotruncal neonatal.' },
          { id: 'E', text: 'Síndrome de Wiskott-Aldrich – gen WAS', isCorrect: false, explanation: 'Wiskott-Aldrich: trombocitopenia, eccema, infecciones; no hipocalcemia ni cardiopatías conotruncales.' }
        ]
      },
      {
        questionText: 'Lactante de 3 meses, hijo de madre con VIH, asintomático. ¿Cómo se confirma o descarta la infección por VIH en este lactante?',
        options: [
          { id: 'A', text: 'ELISA para anticuerpos anti-VIH', isCorrect: false, explanation: 'Los anticuerpos maternos anti-VIH persisten hasta los 18 meses en el lactante; el ELISA no es diagnóstico antes de esa edad.' },
          { id: 'B', text: 'PCR para ARN viral (carga viral VIH)', isCorrect: true, explanation: 'En menores de 18 meses, el diagnóstico de VIH se hace por PCR viral (ARN o ADN del VIH), ya que los anticuerpos son de origen materno y no diagnósticos.' },
          { id: 'C', text: 'Western blot', isCorrect: false, explanation: 'El Western blot detecta anticuerpos, al igual que ELISA; no es útil antes de los 18 meses por los anticuerpos maternos.' },
          { id: 'D', text: 'Recuento de CD4', isCorrect: false, explanation: 'El recuento de CD4 sirve para estadificar la enfermedad o guiar profilaxis, no para diagnosticar infección VIH.' },
          { id: 'E', text: 'Esperar hasta los 18 meses para hacer ELISA', isCorrect: false, explanation: 'Esperar 18 meses retrasa el diagnóstico y el tratamiento precoz que mejora el pronóstico.' }
        ]
      }
    ]
  },
  {
    id: 'Módulo 3_Pediatría_Pediatría_09-Fiebre-en-Pediatría',
    keyPoints: [
      'Fiebre: temperatura rectal >38°C; paracetamol 10-15 mg/kg c/6-8h; ibuprofeno >3m 5-10 mg/kg c/8h',
      '<4 semanas con fiebre: hospitalizar siempre + punción lumbar + hemocultivo + antibióticos empíricos',
      '4 semanas-3 meses con buen estado: exámenes (hemograma, PCR, orina), no PL obligatoria si bajo riesgo',
      '>3 meses con T°>39°C sin foco: urocultivo obligatorio (ITU es la causa más frecuente de FSF)',
      'Fiebre sin foco >6m: Rx tórax si signos resp; hemocultivo si <6m o aspecto tóxico',
      'Criterios de hospitalización: <29 días siempre; mal estado general; T°>38°C en inmunocomprometido'
    ],
    quiz: [
      {
        questionText: 'Lactante de 22 días consulta por fiebre de 38.2°C rectal desde hace 6 horas. Nació a término, examen físico sin foco aparente, buen estado general, con lactancia activa. ¿Cuál es la conducta correcta?',
        options: [
          { id: 'A', text: 'Alta con paracetamol y control en 24h si no mejora', isCorrect: false, explanation: 'Todo lactante <29 días con fiebre debe hospitalizarse independientemente del estado general, por riesgo de infección bacteriana grave.' },
          { id: 'B', text: 'Hospitalizar, realizar hemocultivo, urocultivo, PL y comenzar antibióticos empíricos', isCorrect: true, explanation: 'En <4 semanas de vida con fiebre, la conducta siempre es hospitalizar, pancultivar (hemocultivo, urocultivo, PL) e iniciar antibióticos empíricos (ampicilina + cefotaxima).' },
          { id: 'C', text: 'Observar en urgencias 2 horas y alta si mejora', isCorrect: false, explanation: 'No hay criterio de seguridad que permita el alta ambulatoria en menores de 4 semanas con fiebre.' },
          { id: 'D', text: 'Exámenes ambulatorios y control en 12 horas', isCorrect: false, explanation: 'Manejo ambulatorio en <4 semanas con fiebre es inapropiado; el riesgo de bacteriemia y sepsis es muy alto.' },
          { id: 'E', text: 'Hospitalizar y antibióticos solo si hemograma muestra leucocitosis', isCorrect: false, explanation: 'El inicio de antibióticos no espera el resultado del hemograma en <4 semanas; se inician empíricamente al ingreso.' }
        ]
      },
      {
        questionText: 'Niño de 18 meses en buenas condiciones generales, fiebre de 39.8°C de 24 horas sin foco clínico aparente. ¿Qué examen es prioritario solicitar?',
        options: [
          { id: 'A', text: 'Hemocultivo', isCorrect: false, explanation: 'El hemocultivo se reserva para menores de 6 meses o aspecto tóxico; no es prioritario en un niño de 18m con buen estado general.' },
          { id: 'B', text: 'Radiografía de tórax', isCorrect: false, explanation: 'La Rx tórax se solicita si hay síntomas respiratorios (tos, taquipnea, rales). Sin signos resp, no es prioritaria.' },
          { id: 'C', text: 'Urocultivo (mediante sondeo vesical o punción suprapúbica)', isCorrect: true, explanation: 'En >3 meses con fiebre >39°C sin foco, la ITU es la causa más frecuente; el urocultivo obtenido por método seguro es el estudio prioritario.' },
          { id: 'D', text: 'Punción lumbar', isCorrect: false, explanation: 'La PL no es rutinaria en niños >3 meses bien vacunados sin signos meníngeos.' },
          { id: 'E', text: 'Ecografía renal', isCorrect: false, explanation: 'La ecografía renal se solicita después del urocultivo positivo para buscar malformaciones, no como primer paso.' }
        ]
      },
      {
        questionText: 'Niño de 6 semanas con fiebre de 38.5°C. Según criterios de bajo riesgo de Rochester, es catalogado como bajo riesgo (buen estado, sin foco, exámenes en rangos normales). ¿Cuál es la conducta?',
        options: [
          { id: 'A', text: 'Alta ambulatoria inmediata con paracetamol', isCorrect: false, explanation: 'Los criterios de Rochester aplican para decidir si se puede obviar PL y diferir ATB, pero en 4-8 semanas aún requiere hospitalización y seguimiento estrecho.' },
          { id: 'B', text: 'Hospitalizar, observar sin antibióticos con reevaluación frecuente', isCorrect: true, explanation: 'En 4-8 semanas de bajo riesgo, puede diferirse PL y antibióticos, pero se hospitaliza para observación y reevaluación; si empeora, se completa estudio y se inician ATB.' },
          { id: 'C', text: 'Punción lumbar obligatoria y antibióticos independientemente del riesgo', isCorrect: false, explanation: 'En bajo riesgo de Rochester entre 4-8 semanas, la PL y los antibióticos pueden diferirse, a diferencia de <4 semanas donde son obligatorios.' },
          { id: 'D', text: 'Alta con amoxicilina oral empírica', isCorrect: false, explanation: 'La amoxicilina oral empírica no es adecuada en este grupo de edad; si se indican antibióticos, deben ser EV.' },
          { id: 'E', text: 'Repetir temperatura en 1 hora y decidir según resultado', isCorrect: false, explanation: 'Diferir la conducta basándose solo en repetir la temperatura no es apropiado en un lactante de 6 semanas con fiebre confirmada.' }
        ]
      }
    ]
  },
  {
    id: 'Módulo 3_Pediatría_Pediatría_10-Muerte-Súbita-del-Lactante-y-ALTE',
    keyPoints: [
      'SMSL: muerte inesperada <1 año sin causa tras autopsia; pico 2-6 meses; dormir supino previene',
      'Factores de riesgo SMSL: prono, tabaquismo en hogar, colecho, colchón blando, temperatura excesiva',
      'ALTE: apnea ≥20 seg o con cianosis/palidez/hipotonía/bradicardia; requiere evaluación diagnóstica',
      'ALTE alto riesgo: <1 mes, prematuro, ≥2 episodios, necesitó reanimación → hospitalizar siempre',
      'ALTE bajo riesgo: >1 mes, término, primer episodio, se recuperó solo → alta con monitor opcional',
      'Apnea emotiva (espasmo del sollozo): llanto → apnea → pérdida de conciencia; benigno, 6m-5 años'
    ],
    quiz: [
      {
        questionText: 'Madre consulta porque su hijo de 3 meses estaba durmiendo en posición prona y lo encontró cianótico y sin respirar. Comenzó a respirar al estimularlo. Nació a término, sin antecedentes. Es el primer episodio. ¿Cuál es la conducta?',
        options: [
          { id: 'A', text: 'Alta con instrucciones de posición supina para dormir', isCorrect: false, explanation: 'Un ALTE en <3 meses requiere hospitalización y evaluación diagnóstica completa, no solo alta con instrucciones.' },
          { id: 'B', text: 'Hospitalizar para evaluación diagnóstica y monitorización', isCorrect: true, explanation: 'Este lactante de 3 meses con ALTE (apnea + cianosis que requirió estimulación) califica como ALTE. Debe hospitalizarse para descartar causas subyacentes (infección, reflujo, arritmia, epilepsia).' },
          { id: 'C', text: 'Alta con monitor cardiorrespiratorio domiciliario', isCorrect: false, explanation: 'El monitor domiciliario puede complementar el manejo, pero no reemplaza la hospitalización para estudio diagnóstico en ALTE de este tipo.' },
          { id: 'D', text: 'RCP inmediata en urgencias aunque ya esté reactivo', isCorrect: false, explanation: 'Si el lactante ya está reactivo y con buenas condiciones, no se indica RCP; se procede a hospitalización y evaluación.' },
          { id: 'E', text: 'Educación sobre tabaquismo pasivo y control en 1 semana', isCorrect: false, explanation: 'El episodio descrito requiere evaluación inmediata hospitalaria, no solo consejería y control diferido.' }
        ]
      },
      {
        questionText: 'Para prevenir el síndrome de muerte súbita del lactante, ¿cuál de las siguientes recomendaciones es INCORRECTA?',
        options: [
          { id: 'A', text: 'Colocar al lactante boca arriba (supino) para dormir', isCorrect: false, explanation: 'La posición supina para dormir es la recomendación más importante para prevenir SMSL; es correcta.' },
          { id: 'B', text: 'Compartir la cama con los padres (colecho) para facilitar lactancia nocturna', isCorrect: true, explanation: 'El colecho aumenta el riesgo de SMSL por riesgo de aplastamiento, sobrecalentamiento y superficies blandas. Se recomienda habitación compartida pero cama separada.' },
          { id: 'C', text: 'Evitar tabaquismo en el ambiente del lactante', isCorrect: false, explanation: 'El tabaquismo ambiental es factor de riesgo significativo para SMSL; evitarlo es una recomendación correcta.' },
          { id: 'D', text: 'Usar colchón firme y retirar almohadas o peluches del lugar de sueño', isCorrect: false, explanation: 'Colchón firme y entorno de sueño limpio son recomendaciones correctas para prevenir SMSL.' },
          { id: 'E', text: 'Mantener temperatura ambiental entre 20-22°C', isCorrect: false, explanation: 'Ambiente templado sin sobrecalentamiento es recomendación preventiva correcta para SMSL.' }
        ]
      },
      {
        questionText: 'Niño de 18 meses presenta episodios repetidos en los que, tras frustrarse o golpearse, llora fuertemente, luego deja de respirar, se pone pálido y pierde el conocimiento brevemente, recuperándose solo. Sin ictericia, sin fiebre. Examen neurológico normal. ¿Cuál es el diagnóstico?',
        options: [
          { id: 'A', text: 'Epilepsia de ausencia', isCorrect: false, explanation: 'Las ausencias son breves desconexiones sin llanto previo ni cianosis/palidez; se desencadenan espontáneamente, no por estímulo emocional.' },
          { id: 'B', text: 'ALTE recurrente', isCorrect: false, explanation: 'ALTE es un evento agudo que no ocurre en contexto de llanto-frustración repetido; ALTE se aplica en menores de 1 año.' },
          { id: 'C', text: 'Síncope vasovagal', isCorrect: false, explanation: 'El síncope vasovagal ocurre más en preadolescentes/adolescentes, generalmente en ortostatismo prolongado o visión de sangre, no en respuesta a llanto.' },
          { id: 'D', text: 'Apnea emotiva (espasmo del sollozo)', isCorrect: true, explanation: 'Espasmo del sollozo: llanto → apnea → pérdida de conciencia, desencadenado por emoción o dolor, recuperación espontánea, benigno, pico 6m-5 años. No requiere tratamiento.' },
          { id: 'E', text: 'Crisis hipóxico-isquémica cerebral', isCorrect: false, explanation: 'Las crisis hipóxico-isquémicas no tienen el patrón desencadenado sistemáticamente por llanto con recuperación completa.' }
        ]
      }
    ]
  },
  {
    id: 'Módulo 3_Pediatría_Pediatría_11-Diarrea-en-Pediatría',
    keyPoints: [
      'Plan A: <5% deshidratación → SRO en casa 50-100 mL/kg en 4h; Plan B: 5-10% → en centro 100 mL/kg 4h SRO',
      'Plan C: >10% deshidratación → Ringer lactato EV 100 mL/kg en 3h (lactante) o 2h (niño)',
      'Rotavirus: diarrea acuosa + vómitos sin sangre <2 años; vacuna a los 2 y 4 meses de vida',
      'Alergia proteína leche de vaca (APLV): 4% lactantes; diarrea + vómitos + dermatitis; fórmula hidrolizada',
      'Enfermedad celíaca: anti-transglutaminasa IgA + biopsia duodenal; diarrea crónica + déficit estatural',
      'Fibrosis quística: cloro en sudor >60 mEq/L; esteatorrea + infecciones pulmonares recurrentes'
    ],
    quiz: [
      {
        questionText: 'Niño de 14 meses con diarrea acuosa profusa hace 2 días, vómitos frecuentes y rechazo a líquidos. Al examen: ojos hundidos, mucosa seca, piel con turgencia disminuida, llanto sin lágrimas, frecuencia cardíaca 155/min. ¿Cuál es el plan de rehidratación?',
        options: [
          { id: 'A', text: 'Plan A: suero oral en casa, 50-100 mL/kg en 4 horas', isCorrect: false, explanation: 'El Plan A es para deshidratación leve (<5%) con mucosas húmedas y sin signos de compromiso. Este niño tiene signos de deshidratación moderada-severa.' },
          { id: 'B', text: 'Plan B: suero oral en centro de salud, 100 mL/kg en 4 horas bajo supervisión', isCorrect: false, explanation: 'Plan B es para deshidratación 5-10%. Este niño con taquicardia, piel con turgencia disminuida y rechazo a líquidos sugiere deshidratación >10% o con signos de compromiso que requieren EV.' },
          { id: 'C', text: 'Plan C: rehidratación EV con Ringer lactato 100 mL/kg en 3 horas', isCorrect: true, explanation: 'Deshidratación severa (>10%) con signos clínicos graves: ojos hundidos, mucosa seca, turgencia reducida, taquicardia, rechazo oral → Plan C con Ringer lactato EV.' },
          { id: 'D', text: 'Antidiarreico (loperamida) + suero oral', isCorrect: false, explanation: 'Loperamida está contraindicada en menores de 2 años por riesgo de íleo paralítico y toxicidad.' },
          { id: 'E', text: 'Antibiótico empírico oral + suero oral', isCorrect: false, explanation: 'La diarrea acuosa en lactantes habitualmente es viral; el antibiótico no está indicado en este contexto y la rehidratación EV es prioritaria.' }
        ]
      },
      {
        questionText: 'Lactante de 4 meses con lactancia materna exclusiva presenta deposiciones con sangre, dermatitis atópica y vómitos frecuentes. Sin fiebre ni mal estado general. ¿Cuál es el diagnóstico más probable y el manejo?',
        options: [
          { id: 'A', text: 'Enterocolitis bacteriana – antibióticos y hospitalización', isCorrect: false, explanation: 'Sin fiebre y con dermatitis atópica, la causa alérgica es más probable que una enterocolitis bacteriana.' },
          { id: 'B', text: 'Alergia a proteína de leche de vaca – dieta de exclusión materna o fórmula hidrolizada', isCorrect: true, explanation: 'APLV en lactante con LME: la madre elimina lácteos de su dieta. Si la diarrea con sangre persiste o la madre no tolera la dieta, se cambia a fórmula extensamente hidrolizada.' },
          { id: 'C', text: 'Intolerancia a la lactosa – fórmula sin lactosa', isCorrect: false, explanation: 'La intolerancia a la lactosa primaria en lactantes es rara; no produce sangre en deposiciones ni dermatitis atópica.' },
          { id: 'D', text: 'Fibrosis quística – test del sudor', isCorrect: false, explanation: 'La FQ produce esteatorrea, no sangrado rectal, y no se asocia específicamente a dermatitis atópica.' },
          { id: 'E', text: 'Enfermedad celíaca – suspender gluten', isCorrect: false, explanation: 'La celíaca requiere exposición a gluten; a los 4 meses con solo LM no hay exposición a gluten.' }
        ]
      },
      {
        questionText: 'Niño de 3 años con deposiciones líquidas con moco y sangre, fiebre 39°C, dolor abdominal. Coprocultivo positivo para Escherichia coli O157:H7. ¿Cuál es la conducta correcta respecto a los antibióticos?',
        options: [
          { id: 'A', text: 'Iniciar azitromicina para acortar la evolución', isCorrect: false, explanation: 'Azitromicina no es el antibiótico indicado para E.coli. Además, en STEC está contraindicado usar antibióticos.' },
          { id: 'B', text: 'Iniciar ciprofloxacino para eliminar la bacteria', isCorrect: false, explanation: 'Los antibióticos, incluyendo quinolonas, están contraindicados en infección por STEC (O157:H7) porque aumentan el riesgo de SHU al liberar toxina Shiga.' },
          { id: 'C', text: 'No usar antibióticos; rehidratación y seguimiento con hemograma y creatinina', isCorrect: true, explanation: 'En infección por E.coli enterohemorrágica (STEC O157:H7), los antibióticos están contraindicados porque aumentan hasta 17 veces el riesgo de SHU. Manejo: rehidratación + monitorización renal.' },
          { id: 'D', text: 'Iniciar ceftriaxona EV por riesgo de bacteriemia', isCorrect: false, explanation: 'Igual que otras opciones antibióticas, ceftriaxona en STEC aumenta el riesgo de SHU por mayor liberación de toxina Shiga.' },
          { id: 'E', text: 'Metronidazol por sospecha de Giardia o Clostridium', isCorrect: false, explanation: 'El coprocultivo ya aisló E.coli O157:H7; metronidazol no es el tratamiento y los antibióticos están contraindicados en STEC.' }
        ]
      }
    ]
  },
  {
    id: 'Módulo 3_Pediatría_Pediatría_12-Reflujo-Dolor-Abdominal-y-Constipación-en-Pediatría',
    keyPoints: [
      'Reflujo fisiológico: regurgitaciones sin complicaciones <1 año; manejo: tranquilizar + espesar tomas',
      'ERGE patológica: esofagitis, aspiraciones, falla ponderal; omeprazol 1 mg/kg/día es primera línea',
      'Dolor abdominal crónico funcional: >3 episodios en 3 meses; periumbilical, psicógeno, examen normal',
      'Constipación: <3 deposiciones/semana; fecaloma = PEG oral + laxantes osmóticos por 4-6 semanas',
      'Invaginación intestinal: 5-18 meses; cólico + vómitos + deposición en jalea de grosella; enema diagnóstico-terapéutico',
      'Apendicitis aguda: dolor periumbilical → fosa ilíaca derecha; McBurney + Blumberg; eco/TAC; cirugía'
    ],
    quiz: [
      {
        questionText: 'Lactante de 3 meses con regurgitaciones frecuentes luego de cada toma, sin irritabilidad, sin vómitos en proyectil, curva de peso adecuada. ¿Cuál es el manejo más apropiado?',
        options: [
          { id: 'A', text: 'Omeprazol 1 mg/kg/día por 4 semanas', isCorrect: false, explanation: 'El omeprazol se reserva para ERGE patológica con complicaciones (esofagitis, aspiraciones, falla ponderal). Este lactante tiene reflujo fisiológico sin complicaciones.' },
          { id: 'B', text: 'Metoclopramida como procinético', isCorrect: false, explanation: 'Metoclopramida no está recomendada en lactantes <1 año por riesgo de efectos extrapiramidales.' },
          { id: 'C', text: 'Espesar las tomas, posición semiincorporada y tranquilizar a la familia', isCorrect: true, explanation: 'Reflujo fisiológico sin complicaciones: espesar la leche materna o fórmula, tomas más frecuentes y de menor volumen, posición semiincorporada post-toma. No requiere medicación.' },
          { id: 'D', text: 'Cambiar a fórmula hidrolizada para descartar APLV', isCorrect: false, explanation: 'La APLV se sospecha cuando hay sangre en deposiciones, dermatitis y baja ponderal, no en regurgitaciones fisiológicas sin complicaciones.' },
          { id: 'E', text: 'Endoscopía digestiva alta para descartar esofagitis', isCorrect: false, explanation: 'La endoscopía se reserva para sospecha de ERGE complicada; en reflujo fisiológico sin señales de alarma no está indicada.' }
        ]
      },
      {
        questionText: 'Niño de 9 meses es traído por episodios de llanto intenso, encogimiento de piernas, vómitos y palidez. Entre los episodios está tranquilo. Deposición con aspecto en "jalea de grosella". ¿Cuál es la conducta inmediata?',
        options: [
          { id: 'A', text: 'Cirugía de urgencia sin estudios previos', isCorrect: false, explanation: 'La cirugía es solo para casos de invaginación no reductible o con peritonitis; el enema debe intentarse primero.' },
          { id: 'B', text: 'Enema con contraste o aire bajo control radioscópico (diagnóstico y terapéutico)', isCorrect: true, explanation: 'Invaginación intestinal clásica (5-18m, cólico + vómitos + deposición en jalea de grosella): el enema hidrostático o neumático bajo control radioscópico es diagnóstico y terapéutico en el 80-90% de los casos.' },
          { id: 'C', text: 'Iniciar antibióticos EV por sospecha de colitis bacteriana', isCorrect: false, explanation: 'El cuadro es clásico de invaginación, no de colitis bacteriana. Los antibióticos no son el tratamiento.' },
          { id: 'D', text: 'Ecografía abdominal y si confirma, observación 48h', isCorrect: false, explanation: 'La ecografía puede confirmar (imagen en dona), pero la invaginación no se maneja expectativamente; requiere desinvaginación.' },
          { id: 'E', text: 'Rehidratación oral y alta con control en 24h', isCorrect: false, explanation: 'La invaginación intestinal es una urgencia que no puede manejarse ambulatoriamente.' }
        ]
      },
      {
        questionText: 'Niña de 7 años con dolor abdominal recurrente de 5 meses, 3-4 veces por semana, periumbilical, de intensidad leve a moderada. Sin pérdida de peso, sin sangre en deposiciones, examen físico y hemograma normales. ¿Cuál es el diagnóstico más probable?',
        options: [
          { id: 'A', text: 'Apendicitis crónica', isCorrect: false, explanation: 'La apendicitis crónica es excepcional y cursa con sensibilidad localizada en FID, no dolor periumbilical funcional.' },
          { id: 'B', text: 'Enfermedad de Crohn', isCorrect: false, explanation: 'Crohn cursa con síntomas de alarma como diarrea con sangre, baja ponderal, anemia, y elevación de PCR/calprotectina fecal.' },
          { id: 'C', text: 'Dolor abdominal crónico funcional (psicógeno)', isCorrect: true, explanation: 'Criterios de dolor abdominal funcional: >3 episodios en 3 meses, localización periumbilical, sin síntomas de alarma, examen y exámenes normales. Enfoque biopsicosocial.' },
          { id: 'D', text: 'Infección por Helicobacter pylori', isCorrect: false, explanation: 'H. pylori no es causa bien establecida de dolor abdominal funcional recurrente en niños; se investiga solo si hay síntomas de úlcera péptica.' },
          { id: 'E', text: 'Enfermedad celíaca', isCorrect: false, explanation: 'La celíaca produce síntomas de malabsorción (diarrea, distensión, bajo peso) y marcadores positivos (anti-transglutaminasa IgA).' }
        ]
      }
    ]
  },
  {
    id: 'Módulo 3_Pediatría_Pediatría_13-Púrpura-y-Anemia-en-Pediatría',
    keyPoints: [
      'PSH (Púrpura de Schönlein-Henoch): vasculitis IgA; púrpura palpable EEII + artritis + dolor abdominal + nefritis',
      'PSH: post-estreptocócica o viral, diagnóstico clínico, autolimitada; nefritis seguimiento 6 meses',
      'PTI: plaquetas <100k post-viral; >20k sin sangrado → observar; <20k o sangrado → prednisona 1 mg/kg',
      'PTI con hemorragia grave: IgG EV 1 g/kg + plaquetas; esplenectomía si PTI crónica refractaria',
      'Anemia por déficit de hierro: más frecuente; hierro elemental 3-6 mg/kg/día por 3 meses',
      'Valores normales Hb: RN >15 g/dL, 3 meses >9 g/dL (nadir fisiológico), 12 meses >12 g/dL'
    ],
    quiz: [
      {
        questionText: 'Niño de 7 años con aparición brusca de púrpura palpable simétrica en piernas y glúteos, artritis de tobillos, dolor abdominal cólico y hematuria microscópica. 2 semanas antes tuvo faringitis. Plaquetas 280.000. ¿Cuál es el diagnóstico?',
        options: [
          { id: 'A', text: 'Púrpura trombocitopénica inmune (PTI)', isCorrect: false, explanation: 'En PTI las plaquetas están muy bajas (<100k) y no hay artritis, dolor abdominal ni afección renal asociada.' },
          { id: 'B', text: 'Leucemia aguda', isCorrect: false, explanation: 'La leucemia produce pancitopenia (anemia, leucocitos anormales, trombocitopenia), no plaquetas normales ni púrpura palpable localizada.' },
          { id: 'C', text: 'Púrpura de Schönlein-Henoch', isCorrect: true, explanation: 'PSH: vasculitis IgA post-infecciosa; tétrada clásica: púrpura palpable EEII/glúteos + artritis + dolor abdominal + afección renal. Plaquetas normales. Diagnóstico clínico.' },
          { id: 'D', text: 'Meningococcemia', isCorrect: false, explanation: 'La meningococcemia produce púrpura no palpable de evolución rápida con sepsis grave, no la tétrada de PSH.' },
          { id: 'E', text: 'Síndrome hemolítico urémico', isCorrect: false, explanation: 'SHU produce IRA + anemia hemolítica + trombocitopenia tras diarrea con sangre (E.coli O157), sin artritis ni púrpura palpable EEII.' }
        ]
      },
      {
        questionText: 'Niño de 5 años con petequias y equimosis diseminadas de aparición súbita. Hace 2 semanas tuvo varicela. Plaquetas 12.000/mm³. Hemograma normal excepto plaquetopenia. ¿Cuál es el tratamiento inicial?',
        options: [
          { id: 'A', text: 'Observación sin tratamiento, resolución espontánea esperada', isCorrect: false, explanation: 'Con plaquetas <20.000 la conducta activa es obligatoria para disminuir el riesgo de hemorragia intracraneal.' },
          { id: 'B', text: 'Transfusión de plaquetas profiláctica', isCorrect: false, explanation: 'La transfusión de plaquetas se reserva para hemorragia grave activa; en PTI sin sangrado activo no está indicada de rutina.' },
          { id: 'C', text: 'Prednisona 1-2 mg/kg/día por 2-4 semanas', isCorrect: true, explanation: 'PTI post-viral con plaquetas <20.000: se indica corticoides (prednisona 1-2 mg/kg/día). Alternativa: IgG EV. La mayoría resuelve en <6 meses (PTI aguda).' },
          { id: 'D', text: 'Esplenectomía de urgencia', isCorrect: false, explanation: 'La esplenectomía se reserva para PTI crónica (>12 meses) refractaria a tratamiento médico, nunca como primera línea.' },
          { id: 'E', text: 'Antibióticos EV por sospecha de sepsis', isCorrect: false, explanation: 'Sin fiebre ni estado tóxico, y con varicela reciente como antecedente, la causa es PTI post-viral, no sepsis.' }
        ]
      },
      {
        questionText: 'Lactante de 10 meses con lactancia materna exclusiva hasta los 8 meses, pálido, irritable, con anorexia. Hemoglobina 8.5 g/dL, VCM 65 fL, ferritina 4 ng/mL. ¿Cuál es el tratamiento?',
        options: [
          { id: 'A', text: 'Transfusión de glóbulos rojos', isCorrect: false, explanation: 'La transfusión se reserva para anemia severa sintomática (Hb <7 g/dL con compromiso cardiorrespiratorio). Con Hb 8.5 el tratamiento es hierro oral.' },
          { id: 'B', text: 'Hierro elemental oral 3-6 mg/kg/día por 3 meses', isCorrect: true, explanation: 'Anemia ferropénica: hierro elemental 3-6 mg/kg/día; reticulocitosis a los 5-7 días confirma diagnóstico; tratamiento por 3 meses (1 mes para normalizar Hb + 2 meses para reponer depósitos).' },
          { id: 'C', text: 'Ácido fólico 1 mg/día', isCorrect: false, explanation: 'El ácido fólico trata la anemia megaloblástica (VCM elevado). Aquí el VCM es bajo, compatible con ferropenia.' },
          { id: 'D', text: 'Vitamina B12 IM', isCorrect: false, explanation: 'La B12 trata anemia megaloblástica; no corresponde a anemia microcítica hipocrómica con ferritina baja.' },
          { id: 'E', text: 'Cambiar a fórmula de soya', isCorrect: false, explanation: 'El cambio a fórmula de soya no aporta hierro adecuado; el tratamiento específico es hierro medicamentoso oral.' }
        ]
      }
    ]
  },
  {
    id: 'Módulo 3_Pediatría_Pediatría_14-Diagnóstico-Nutricional-y-Talla-Baja-en-Pediatría',
    keyPoints: [
      '<1 año: Índice Peso/Edad (IPE) y Peso/Talla (IPT); 1-5 años: IPT; ≥6 años: IMC para diagnóstico nutricional',
      'Desnutrición: P/T o IMC <-2DS; riesgo desnutrición: -1DS a -2DS; sobrepeso +1DS a +2DS; obesidad >+2DS',
      'Talla baja: estatura <-2DS para edad y sexo según tablas OMS/CDC',
      'Talla baja familiar: edad ósea = cronológica, velocidad de crecimiento normal, talla blanco familiar baja',
      'Retraso constitucional: edad ósea < cronológica, historia familiar, pubertad tardía, pronóstico de talla normal',
      'Talla baja patológica: velocidad de crecimiento baja + edad ósea retrasada → descartar hipotiroidismo, GH, celíaca'
    ],
    quiz: [
      {
        questionText: 'Niño de 8 años con talla -2.5DS. Edad ósea (radiografía muñeca) equivalente a 6 años. Velocidad de crecimiento 3 cm/año (baja para la edad). Sin otros síntomas. Padre creció tarde y llegó a talla normal. ¿Cuál es el diagnóstico más probable?',
        options: [
          { id: 'A', text: 'Talla baja familiar', isCorrect: false, explanation: 'En talla baja familiar la edad ósea es igual a la cronológica y la velocidad de crecimiento es normal.' },
          { id: 'B', text: 'Retraso constitucional del crecimiento y la pubertad', isCorrect: true, explanation: 'RCCP: edad ósea < cronológica, historia familiar de pubertad tardía, velocidad de crecimiento baja-normal, pronóstico de talla adulta normal. Patrón familiar típico.' },
          { id: 'C', text: 'Déficit de hormona de crecimiento', isCorrect: false, explanation: 'El déficit de GH produce velocidad de crecimiento muy baja (<4 cm/año) y requiere confirmación con test de estimulación; la historia familiar de RCCP orienta primero a diagnóstico funcional.' },
          { id: 'D', text: 'Hipotiroidismo primario', isCorrect: false, explanation: 'El hipotiroidismo produce talla baja + retraso edad ósea, pero también otros signos (bradipsiquia, aumento de peso, estreñimiento, bocio). Debe descartarse con TSH.' },
          { id: 'E', text: 'Síndrome de Turner', isCorrect: false, explanation: 'Turner es en niñas (45,X); en varones con historia familiar de pubertad tardía, el RCCP es más probable.' }
        ]
      },
      {
        questionText: 'Niña de 4 años con peso/talla -2.3DS (desnutrición). Madre refiere deposiciones grasosas frecuentes, distensión abdominal, y que la niña come poco. Hemoglobina 10 g/dL. ¿Qué examen de laboratorio solicitar primero para orientar el diagnóstico?',
        options: [
          { id: 'A', text: 'Test del sudor para fibrosis quística', isCorrect: false, explanation: 'Aunque la FQ puede presentar este cuadro, en niñas sin síntomas respiratorios la celíaca es más frecuente; anticuerpos anti-transglutaminasa van primero.' },
          { id: 'B', text: 'Anticuerpos anti-transglutaminasa IgA (ATC-IgA)', isCorrect: true, explanation: 'Cuadro de malabsorción (deposiciones grasosas, distensión, bajo peso, anemia) en niña que ya consume gluten: la enfermedad celíaca es la primera sospecha. ATC-IgA es el test serológico de elección.' },
          { id: 'C', text: 'Ecografía abdominal', isCorrect: false, explanation: 'La ecografía puede mostrar asa de intestino delgado llena de líquido, pero no es el examen diagnóstico para celíaca.' },
          { id: 'D', text: 'Calprotectina fecal', isCorrect: false, explanation: 'La calprotectina orienta a inflamación intestinal (EII), no es específica de celíaca ni es el primer paso.' },
          { id: 'E', text: 'Biopsia duodenal por endoscopía', isCorrect: false, explanation: 'La biopsia duodenal confirma el diagnóstico de celíaca, pero la serología (ATC-IgA) es el primer paso diagnóstico no invasivo.' }
        ]
      },
      {
        questionText: 'Para calcular el diagnóstico nutricional de un niño de 3 años, ¿qué indicador se usa?',
        options: [
          { id: 'A', text: 'Índice de masa corporal (IMC)', isCorrect: false, explanation: 'El IMC se usa en niños ≥6 años y adolescentes. Entre 1-5 años se usa Peso/Talla (IPT) como indicador principal.' },
          { id: 'B', text: 'Peso para la edad (IPE)', isCorrect: false, explanation: 'Peso/Edad se usa en <1 año (junto con P/T). En 1-5 años el indicador principal es Peso/Talla.' },
          { id: 'C', text: 'Índice Peso/Talla (IPT)', isCorrect: true, explanation: 'Entre 1 y 5 años el indicador de elección para diagnóstico nutricional es Peso/Talla (IPT), que evalúa el estado nutricional actual independientemente de la edad.' },
          { id: 'D', text: 'Perímetro braquial', isCorrect: false, explanation: 'El perímetro braquial se usa en contexto de emergencias nutricionales o en terreno; no es el indicador rutinario de diagnóstico nutricional en APS.' },
          { id: 'E', text: 'Talla para la edad', isCorrect: false, explanation: 'Talla/Edad evalúa el crecimiento lineal (desnutrición crónica), pero no el estado nutricional actual. No es el indicador principal a los 3 años.' }
        ]
      }
    ]
  },
  {
    id: 'Módulo 3_Pediatría_Pediatría_15-Nefrología-en-Pediatría',
    keyPoints: [
      'SHU: E.coli O157:H7 (STEC); tríada IRA + anemia hemolítica microangiopática + trombocitopenia; NO antibióticos',
      'Síndrome nefrítico: hematuria + proteinuria no masiva + HTA + edema; GN post-estreptocócica más frecuente',
      'GN post-estreptocócica: ASLO elevado, C3 bajo, complemento normaliza en 8 semanas, autolimitada',
      'Síndrome nefrótico: proteinuria masiva >40 mg/m²/h + hipoalbuminemia + edema; nefrosis lipoidea 5-10 años',
      'Nefrosis lipoidea: corticoides 1ª línea (prednisona 2 mg/kg/día); 90% responden; biopsia si no responde',
      'HTA pediátrica: PA ≥P95; 90% secundaria en niños; <6 años buscar causa renovascular o renal'
    ],
    quiz: [
      {
        questionText: 'Niño de 4 años con edema palpebral matutino, edema de extremidades, oliguria y orina espumosa de 5 días de evolución. Proteinuria 4+ en tira reactiva, albúmina sérica 1.8 g/dL. Sin hematuria. PA normal. ¿Cuál es el diagnóstico?',
        options: [
          { id: 'A', text: 'Síndrome nefrítico por GN post-estreptocócica', isCorrect: false, explanation: 'El nefrítico cursa con hematuria, HTA y proteinuria no masiva. Aquí hay proteinuria masiva sin hematuria ni HTA → nefrótico.' },
          { id: 'B', text: 'Síndrome nefrótico (nefrosis lipoidea)', isCorrect: true, explanation: 'Síndrome nefrótico: proteinuria masiva + hipoalbuminemia + edema, sin hematuria ni HTA. En niño de 4 años la causa más frecuente es nefrosis lipoidea (enfermedad de cambios mínimos), con 90% de respuesta a corticoides.' },
          { id: 'C', text: 'Síndrome hemolítico urémico', isCorrect: false, explanation: 'SHU: IRA + anemia hemolítica + trombocitopenia tras diarrea con sangre. No corresponde a este cuadro.' },
          { id: 'D', text: 'Falla cardíaca congestiva', isCorrect: false, explanation: 'La ICC produce edema pero no proteinuria masiva ni hipoalbuminemia por sí sola.' },
          { id: 'E', text: 'Nefritis lúpica', isCorrect: false, explanation: 'Lúpico es infrecuente a los 4 años y suele cursar con hematuria, complemento bajo y anticuerpos anti-dsDNA.' }
        ]
      },
      {
        questionText: 'Niño de 8 años con hematuria macroscópica, edema facial, HTA 130/90 mmHg. Hace 3 semanas tuvo faringitis tratada con amoxicilina. ASLO elevado, C3 bajo (C4 normal). ¿Cuál es el pronóstico de este cuadro?',
        options: [
          { id: 'A', text: 'Progresión a insuficiencia renal crónica en 80% de los casos', isCorrect: false, explanation: 'La GN post-estreptocócica es autolimitada con excelente pronóstico en niños; <1% evoluciona a IRC.' },
          { id: 'B', text: 'Requiere biopsia renal y corticoides de inmediato', isCorrect: false, explanation: 'La GN post-estreptocócica es un diagnóstico clínico-serológico; la biopsia no es necesaria en el cuadro típico.' },
          { id: 'C', text: 'Autolimitada; C3 normaliza en 8 semanas y función renal se recupera en la mayoría', isCorrect: true, explanation: 'GN post-estreptocócica: pronóstico excelente en niños. El C3 bajo se normaliza antes de 8 semanas. Manejo: restricción hídrica, antihipertensivos si es necesario, seguimiento.' },
          { id: 'D', text: 'Requiere antibióticos prolongados para erradicar el estreptococo renal', isCorrect: false, explanation: 'Los antibióticos tratan la infección activa, pero no modifican la evolución de la GN ya instaurada.' },
          { id: 'E', text: 'Derivar a diálisis por IRA severa', isCorrect: false, explanation: 'La mayoría de los casos tiene IRA leve que se recupera espontáneamente; la diálisis es excepcional.' }
        ]
      },
      {
        questionText: 'Niña de 2 años con ITU febril confirmada por urocultivo (>100.000 UFC de E.coli en orina obtenida por sonda). Es su primera ITU. ¿Qué estudio de imagen se debe realizar?',
        options: [
          { id: 'A', text: 'Cistouretrografía miccional seriada (CUMS) de urgencia', isCorrect: false, explanation: 'La CUMS se indica para descartar reflujo vesicoureteral, pero no es urgente; se realiza tras completar el tratamiento antibiótico.' },
          { id: 'B', text: 'Ecografía renal y vesical en fase aguda + CUMS diferida', isCorrect: true, explanation: 'En <2 años con primera ITU febril: ecografía renal en fase aguda para descartar obstrucción/anomalía + CUMS diferida para buscar reflujo vesicoureteral (causa más frecuente de ITU recurrente en lactantes).' },
          { id: 'C', text: 'Gammagrafía renal DMSA de urgencia', isCorrect: false, explanation: 'La DMSA detecta cicatrices renales; se realiza 3-6 meses después del episodio agudo, no de urgencia.' },
          { id: 'D', text: 'TAC abdominopélvico', isCorrect: false, explanation: 'El TAC implica radiación y no es el estudio de primera línea en ITU pediátrica.' },
          { id: 'E', text: 'No se requieren imágenes en primera ITU en niñas', isCorrect: false, explanation: 'En <2 años con ITU febril se requiere estudio de imagen para descartar anomalías urológicas que predispongan a daño renal.' }
        ]
      }
    ]
  },
  {
    id: 'Módulo 3_Pediatría_Pediatría_16-Infecciones-Respiratorias-en-Pediatría',
    keyPoints: [
      'Resfrío e influenza: pulmón NORMAL en radiografía; tratamiento sintomático; oseltamivir solo en grupos de riesgo <48h',
      'Neumonía bacteriana >1 año: Streptococcus pneumoniae, condensación lobar; amoxicilina oral 80 mg/kg/día',
      'Neumonía atípica (adolescentes): Mycoplasma pneumoniae; infiltrado bilateral; azitromicina 3-5 días',
      'Coqueluche: tos quintosa + gallito inspiratorio + petequias faciales; PCR nasofaríngea; azitromicina + notificación',
      'Crup (laringitis aguda): parainfluenza, estridor inspiratorio, tos perruna; dexametasona IM + adrenalina nebulizada',
      'Bronquiolitis: VRS <2 años, sibilancias + taquipnea; soporte con O2, SNG; sin broncodilatadores de rutina'
    ],
    quiz: [
      {
        questionText: 'Escolar de 12 años con tos persistente de 10 días, fiebre 38°C, malestar general. Rx tórax: infiltrado intersticial bilateral difuso. Hemograma con leucocitos normales. ¿Cuál es el tratamiento de elección?',
        options: [
          { id: 'A', text: 'Amoxicilina oral 80 mg/kg/día por 7 días', isCorrect: false, explanation: 'Amoxicilina cubre Streptococcus pneumoniae (neumonía típica con condensación lobar), no Mycoplasma (atípica con infiltrado intersticial).' },
          { id: 'B', text: 'Azitromicina 10 mg/kg/día por 3-5 días', isCorrect: true, explanation: 'Neumonía atípica por Mycoplasma (adolescente, infiltrado intersticial bilateral, cuadro arrastrado, leucocitos normales): azitromicina es el tratamiento de elección.' },
          { id: 'C', text: 'Oseltamivir 75 mg c/12h por 5 días', isCorrect: false, explanation: 'Oseltamivir trata influenza; no actúa sobre Mycoplasma.' },
          { id: 'D', text: 'Cefuroxima EV hospitalaria', isCorrect: false, explanation: 'Cefuroxima es betalactámico que no cubre Mycoplasma (no tiene pared celular). Además, el cuadro atípico no amerita hospitalización con buen estado general.' },
          { id: 'E', text: 'Observación sin antibióticos, es viral', isCorrect: false, explanation: 'La neumonía por Mycoplasma no se resuelve espontáneamente con seguridad; el tratamiento antibiótico acorta la evolución.' }
        ]
      },
      {
        questionText: 'Lactante de 5 meses con cuadro de 2 días de tos, coriza, y ahora taquipnea (FR 60), sibilancias espiratorias y retracción subcostal. T° 37.8°C. Es invierno. ¿Cuál es el manejo correcto?',
        options: [
          { id: 'A', text: 'Salbutamol nebulizado 2 puff cada 20 minutos por 1 hora', isCorrect: false, explanation: 'Los broncodilatadores no están indicados de rutina en bronquiolitis en menores de 2 años; las guías actuales los desaconsejan.' },
          { id: 'B', text: 'Corticoides sistémicos para reducir la inflamación', isCorrect: false, explanation: 'Los corticoides sistémicos no tienen evidencia de beneficio en bronquiolitis; no se recomiendan.' },
          { id: 'C', text: 'Suporte con oxígeno suplementario si SpO2 <90-92% + hidratación por SNG si no tolera oral', isCorrect: true, explanation: 'Bronquiolitis VRS: tratamiento de soporte. O2 si SpO2 <90-92%, SNG si no tolera oral por taquipnea, sin broncodilatadores ni corticoides de rutina.' },
          { id: 'D', text: 'Amoxicilina oral por sobreinfección bacteriana probable', isCorrect: false, explanation: 'La bronquiolitis es viral (VRS en su mayoría); los antibióticos no están indicados salvo sobreinfección bacteriana confirmada.' },
          { id: 'E', text: 'Alta con corticoide inhalado preventivo', isCorrect: false, explanation: 'Los corticoides inhalados no previenen el asma post-bronquiolitis ni tienen beneficio en el episodio agudo.' }
        ]
      },
      {
        questionText: 'Lactante de 3 meses con tos paroxística nocturna de 2 semanas con emisión de vómito al final y un episodio de apnea. Antecedente de contacto con hermano mayor con "resfrío prolongado". PCR nasofaríngea positiva para Bordetella pertussis. ¿Cuál es la conducta?',
        options: [
          { id: 'A', text: 'Amoxicilina oral ambulatoria por 7 días', isCorrect: false, explanation: 'Amoxicilina no cubre Bordetella pertussis. El antibiótico de elección es azitromicina (o cotrimoxazol). Además, un lactante de 3 meses con coqueluche y apnea debe hospitalizarse.' },
          { id: 'B', text: 'Azitromicina oral ambulatoria + notificación obligatoria', isCorrect: false, explanation: 'La azitromicina y la notificación son correctas, pero un lactante de 3 meses con apnea por coqueluche requiere hospitalización.' },
          { id: 'C', text: 'Hospitalizar + azitromicina + monitorización cardiorrespiratoria + notificación obligatoria', isCorrect: true, explanation: 'Coqueluche en lactante <3 meses o con apnea: hospitalización obligatoria, azitromicina 10 mg/kg/día x 5 días, monitorización cardiorrespiratoria continua y notificación epidemiológica obligatoria.' },
          { id: 'D', text: 'Oseltamivir + hospitalización por influenza severa', isCorrect: false, explanation: 'PCR positiva para Bordetella pertussis confirma coqueluche; oseltamivir no tiene indicación.' },
          { id: 'E', text: 'Alta con salbutamol inhalado para los episodios de tos', isCorrect: false, explanation: 'Los broncodilatadores no tienen eficacia en coqueluche. El manejo requiere antibiótico específico y hospitalización.' }
        ]
      }
    ]
  },
  {
    id: 'Módulo 3_Pediatría_Pediatría_17-Síndrome-Bronquial-Obstructivo-SBO-en-Pediatría',
    keyPoints: [
      'Score Tal: evalúa FR + musculatura accesoria + cianosis + sibilancias; leve 0-5, moderado 6-8, severo 9-12',
      'SBO leve (0-5): 2 puff salbutamol (con aerocámara) → evaluación y alta si SpO2 >95%',
      'SBO moderado (6-8): salbutamol 2 puff c/10min x3 en 1h + corticoide sistémico oral o IM',
      'SBO severo (9-12): O2 + salbutamol nebulizado continuo + corticoide EV + hospitalizar urgente',
      'SBO recurrente: ≥3 crisis al año = diagnóstico de asma → iniciar corticoide inhalado preventivo',
      'Causas secundarias de SBO: fibrosis quística, cardiopatía congénita, displasia broncopulmonar, sínd. de Kartagener'
    ],
    quiz: [
      {
        questionText: 'Niño de 3 años llega a urgencias con dificultad respiratoria. Al examen: FR 42/min, uso de musculatura accesoria (intercostal y subcostal), sin cianosis, sibilancias bilaterales. Score Tal: 7. ¿Cuál es el tratamiento inicial?',
        options: [
          { id: 'A', text: 'Alta con 2 puff de salbutamol y control en 24 horas', isCorrect: false, explanation: 'Score Tal 7 es moderado (6-8); el alta con solo 2 puff corresponde al manejo de SBO leve.' },
          { id: 'B', text: 'Salbutamol 2 puff c/10min por 3 dosis (1 hora) + corticoide sistémico', isCorrect: true, explanation: 'SBO moderado (Score Tal 6-8): broncodilatador en series de 2 puff cada 10 min por 1 hora + corticoide oral o IM para disminuir la inflamación y acortar el episodio.' },
          { id: 'C', text: 'Salbutamol nebulizado continuo + O2 + corticoide EV + hospitalización', isCorrect: false, explanation: 'Este manejo corresponde al SBO severo (Score Tal 9-12); con Score 7 se intenta primero manejo ambulatorio de crisis moderada.' },
          { id: 'D', text: 'Adrenalina nebulizada como primera línea', isCorrect: false, explanation: 'La adrenalina nebulizada se usa en laringitis (crup), no en SBO; el broncodilatador de primera línea en SBO es salbutamol.' },
          { id: 'E', text: 'Antibióticos por sospecha de sobreinfección', isCorrect: false, explanation: 'El SBO en lactantes y preescolares es habitualmente viral; los antibióticos no están indicados sin evidencia de infección bacteriana.' }
        ]
      },
      {
        questionText: 'Niño de 5 años con cuarta crisis de SBO en el año. Entre las crisis está asintomático, sin tos nocturna. ¿Cuál es el paso diagnóstico y terapéutico siguiente?',
        options: [
          { id: 'A', text: 'Test del sudor para descartar fibrosis quística', isCorrect: false, explanation: 'El test del sudor se indica si hay sospecha de FQ (infecciones pulmonares recurrentes, esteatorrea, falla de crecimiento); 4 crisis de SBO en escolar sin otros síntomas orienta a asma.' },
          { id: 'B', text: 'Diagnóstico de asma + iniciar corticoide inhalado preventivo', isCorrect: true, explanation: 'SBO recurrente (≥3 crisis/año) = asma en pediatría. Se inicia tratamiento preventivo con corticoide inhalado (budesonida o fluticasona) en dosis baja según guías GINA.' },
          { id: 'C', text: 'Espirometría basal y solo si altamente alterada iniciar tratamiento', isCorrect: false, explanation: 'En preescolares la espirometría no siempre es realizable; el diagnóstico de asma en <6 años es clínico (patrón de SBO recurrente).' },
          { id: 'D', text: 'Salbutamol de rescate a demanda y seguimiento cada 6 meses', isCorrect: false, explanation: 'Con 4 crisis al año ya se superó el umbral para tratamiento preventivo; solo salbutamol de rescate es insuficiente.' },
          { id: 'E', text: 'Ecocardiograma para descartar cardiopatía como causa', isCorrect: false, explanation: 'La cardiopatía como causa de sibilancias recurrentes es inusual sin otros signos (soplo, falla de crecimiento, cianosis); no es el primer paso en asma típica.' }
        ]
      },
      {
        questionText: 'Adolescente de 14 años con sibilancias recurrentes desde la infancia, bronquiectasias en TC de tórax, situs inversus (órganos en espejo) y espermiograma con motilidad espermática alterada. ¿Cuál es el diagnóstico?',
        options: [
          { id: 'A', text: 'Fibrosis quística', isCorrect: false, explanation: 'FQ produce bronquiectasias e infecciones pulmonares, pero no situs inversus.' },
          { id: 'B', text: 'Inmunodeficiencia combinada severa (SCID)', isCorrect: false, explanation: 'SCID debuta en la infancia con infecciones graves y no se asocia a situs inversus ni bronquiectasias aisladas.' },
          { id: 'C', text: 'Síndrome de Kartagener (discinesia ciliar primaria)', isCorrect: true, explanation: 'Síndrome de Kartagener: tríada bronquiectasias + situs inversus + infertilidad por disfunción ciliar (espermatozoides inmóviles, bronquios que no aclarean). Causa de SBO recurrente secundario.' },
          { id: 'D', text: 'Asma no controlada con bronquiectasias por remodelado', isCorrect: false, explanation: 'El asma no produce situs inversus ni infertilidad masculina por disfunción ciliar.' },
          { id: 'E', text: 'Displasia broncopulmonar', isCorrect: false, explanation: 'La displasia broncopulmonar ocurre en prematuros con antecedente de ventilación mecánica prolongada, no se asocia a situs inversus.' }
        ]
      }
    ]
  },
  {
    id: 'Módulo 3_Pediatría_Pediatría_18-Vacunas-y-Alimentación-en-Pediatría',
    keyPoints: [
      'Lactancia materna exclusiva los primeros 6 meses; continuar junto a alimentación complementaria hasta los 2 años',
      'Alimentación complementaria: inicio a los 6 meses; alimentos blandos, sin sal ni azúcar, sin miel antes de 1 año',
      'No leche de vaca entera antes de los 12 meses (proteínas inadecuadas + bajo hierro)',
      'Vitamina D: 400 UI/día desde RN, especialmente en lactantes con LM exclusiva sin exposición solar',
      'Hierro profiláctico: 2 mg/kg/día desde los 4 meses en prematuros; a los 6 meses para todos los lactantes',
      'Vacunas PANI Chile: BCG (RN), Hepatitis B (RN), Pentavalente 2-4-6m, Neumococo 2-4-12m, VPH niñas 4°básico'
    ],
    quiz: [
      {
        questionText: '¿A qué edad se recomienda iniciar la alimentación complementaria en un lactante con lactancia materna exclusiva sin problemas de crecimiento?',
        options: [
          { id: 'A', text: '3 meses', isCorrect: false, explanation: 'Antes de los 4 meses el sistema digestivo no está maduro para alimentos sólidos; el inicio precoz aumenta el riesgo de obesidad y alergias.' },
          { id: 'B', text: '4 meses', isCorrect: false, explanation: 'El inicio a los 4 meses puede considerarse en fórmula artificial, pero en LM exclusiva la recomendación actual (OMS/MINSAL Chile) es 6 meses.' },
          { id: 'C', text: '6 meses', isCorrect: true, explanation: 'La OMS y MINSAL Chile recomiendan LM exclusiva los primeros 6 meses y luego introducir alimentación complementaria manteniendo la LM hasta los 2 años.' },
          { id: 'D', text: '9 meses', isCorrect: false, explanation: 'Esperar hasta los 9 meses es tardío; la introducción a los 6 meses es necesaria para cubrir requerimientos de hierro y zinc que la LM ya no cubre completamente.' },
          { id: 'E', text: '12 meses', isCorrect: false, explanation: 'A los 12 meses ya se introduce la leche de vaca, pero la alimentación complementaria debe iniciarse a los 6 meses, no esperar hasta entonces.' }
        ]
      },
      {
        questionText: 'RN de término, alimentado con lactancia materna exclusiva. ¿Qué suplemento debe indicarse desde el primer mes de vida?',
        options: [
          { id: 'A', text: 'Hierro 2 mg/kg/día', isCorrect: false, explanation: 'El hierro profiláctico en RN de término a término se inicia a los 4-6 meses, no desde el primer mes (los depósitos al nacer son suficientes hasta esa edad).' },
          { id: 'B', text: 'Vitamina D 400 UI/día', isCorrect: true, explanation: 'La LM contiene poca vitamina D. Se recomienda suplementar con 400 UI/día de vitamina D desde los primeros días de vida en todos los lactantes con LM, independientemente de la exposición solar.' },
          { id: 'C', text: 'Flúor 0.25 mg/día', isCorrect: false, explanation: 'El flúor profiláctico oral se indica desde los 6 meses solo en zonas sin fluoración del agua, no de rutina desde el primer mes.' },
          { id: 'D', text: 'Vitamina K 1 mg IM dosis única al nacer', isCorrect: false, explanation: 'La vitamina K se da al nacer (dosis única) para prevenir enfermedad hemorrágica del RN, no como suplemento mensual continuo.' },
          { id: 'E', text: 'Calcio 500 mg/día', isCorrect: false, explanation: 'La LM provee calcio adecuado para el lactante sano a término; no se requiere suplementación adicional de calcio.' }
        ]
      },
      {
        questionText: 'Madre pregunta si puede darle miel a su bebé de 8 meses para aliviar la tos. ¿Cuál es la respuesta correcta?',
        options: [
          { id: 'A', text: 'Sí, la miel es segura y tiene propiedades antitusivas comprobadas en lactantes', isCorrect: false, explanation: 'La miel está contraindicada en menores de 12 meses por riesgo de botulismo infantil (esporas de Clostridium botulinum).' },
          { id: 'B', text: 'Solo si es miel orgánica certificada sin aditivos', isCorrect: false, explanation: 'Toda miel, independientemente de su origen o procesamiento, puede contener esporas de C. botulinum. Está contraindicada en <12 meses.' },
          { id: 'C', text: 'No, la miel está contraindicada en menores de 12 meses por riesgo de botulismo', isCorrect: true, explanation: 'La miel puede contener esporas de Clostridium botulinum que el intestino del lactante no neutraliza, causando botulismo infantil (hipototonía, llanto débil, constipación, parálisis). Contraindicada hasta los 12 meses.' },
          { id: 'D', text: 'Solo en dosis menores de 5 mL no representa riesgo', isCorrect: false, explanation: 'No existe dosis segura de miel en menores de 12 meses; cualquier cantidad puede contener esporas.' },
          { id: 'E', text: 'Sí, si se calienta previamente elimina las esporas', isCorrect: false, explanation: 'Las esporas de C. botulinum son resistentes al calor doméstico; calentar la miel no garantiza la eliminación de las esporas.' }
        ]
      }
    ]
  }
];

async function main() {
  // Fetch real IDs from DB (NFD encoding) keyed by lesson_number
  const rows = await db.execute(
    "SELECT id, lesson_number FROM clases WHERE id LIKE '%Pediatr%Pediatr%' ORDER BY lesson_number"
  );
  const idByLesson = {};
  rows.rows.forEach(r => { idByLesson[Number(r.lesson_number)] = r.id; });

  console.log(`Updating ${lessons.length} Pediatría lessons in DB + JSON files...`);
  for (const lesson of lessons) {
    const folderName = lesson.id.split('_').pop();
    const lessonNum = parseInt(folderName.split('-')[0], 10);
    const dbId = idByLesson[lessonNum];

    if (!dbId) {
      console.log(`  ⚠ No DB row found for lesson ${lessonNum}: ${folderName}`);
      continue;
    }

    const kpJson = JSON.stringify(lesson.keyPoints);
    const quizJson = JSON.stringify(lesson.quiz);

    // Update Turso DB using the exact NFD id from the DB
    const result = await db.execute({
      sql: 'UPDATE clases SET key_points = ?, quiz = ? WHERE id = ?',
      args: [kpJson, quizJson, dbId]
    });

    // Update clase.json on disk
    const jsonPath = path.join(TRANSCRIPT_BASE, folderName, 'clase.json');
    if (fs.existsSync(jsonPath)) {
      const clase = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      clase.keyPoints = lesson.keyPoints;
      clase.quiz = lesson.quiz;
      fs.writeFileSync(jsonPath, JSON.stringify(clase, null, 2), 'utf8');
    }

    console.log(`  ✓ (${result.rowsAffected} row) DB + JSON: ${folderName}`);
    await new Promise(r => setTimeout(r, 100));
  }
  console.log('\nDone.');
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
