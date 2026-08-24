const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const baseCapitulosDir = path.join(__dirname, 'capitulos_v3');
const classesPath = path.join(__dirname, 'scripts', 'online_classes', 'gastroenterologia_online_classes.json');
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

const gastroTopicDefinitions = [
  { chapNum: 8, topicNum: 1, classIdx: 0, svg: null, algoTitle: null },
  { chapNum: 8, topicNum: 2, classIdx: 1, svg: null, algoTitle: null },
  { chapNum: 8, topicNum: 3, classIdx: 2, svg: null, algoTitle: null },
  { chapNum: 8, topicNum: 4, classIdx: 3, svg: null, algoTitle: null },
  { chapNum: 8, topicNum: 5, classIdx: 4, svg: 'algo_hda.svg', algoTitle: 'Algoritmo Diagnóstico y Terapéutico de Hemorragia Digestiva Alta' },
  { chapNum: 8, topicNum: 6, classIdx: 5, svg: null, algoTitle: null },
  { chapNum: 8, topicNum: 7, classIdx: 6, svg: null, algoTitle: null },
  { chapNum: 8, topicNum: 8, classIdx: 7, svg: null, algoTitle: null },
  { chapNum: 8, topicNum: 9, classIdx: 8, svg: null, algoTitle: null },
  { chapNum: 8, topicNum: 10, classIdx: 9, svg: null, algoTitle: null },
  { chapNum: 8, topicNum: 11, classIdx: 10, svg: null, algoTitle: null },
  { chapNum: 8, topicNum: 12, classIdx: 11, svg: null, algoTitle: null },
  { chapNum: 8, topicNum: 13, classIdx: 12, svg: null, algoTitle: null },
  { chapNum: 8, topicNum: 14, classIdx: 13, svg: null, algoTitle: null },
  { chapNum: 8, topicNum: 15, classIdx: 14, svg: null, algoTitle: null },
  { chapNum: 8, topicNum: 16, classIdx: 15, svg: null, algoTitle: null },
  { chapNum: 8, topicNum: 17, classIdx: 16, svg: null, algoTitle: null },
  { chapNum: 8, topicNum: 18, classIdx: 17, svg: null, algoTitle: null },
  { chapNum: 8, topicNum: 19, classIdx: 18, svg: null, algoTitle: null },
  { chapNum: 8, topicNum: 20, classIdx: 19, svg: null, algoTitle: null },
  { chapNum: 8, topicNum: 21, classIdx: 20, svg: null, algoTitle: null },
  { chapNum: 8, topicNum: 22, classIdx: 21, svg: null, algoTitle: null },
  { chapNum: 8, topicNum: 23, classIdx: 22, svg: null, algoTitle: null }
];

const customVignettesMap = {
  1: { vignette: "Mujer de 32 años consulta por dolor abdominal recurrente en hipogastrio de 8 meses de evolución, que alivia tras la defecación y se asocia a períodos alternados de diarrea y constipación. Sin baja de peso, sin rectorragia ni anemia. Examen físico y hemograma normales.", explicacion: "Síndrome de Intestino Irritable (Criterios de Roma IV): dolor abdominal recurrente al menos 1 día por semana en los últimos 3 meses, asociado a ≥ 2 criterios: relacionado con la defecación, cambio en la frecuencia o en la forma de las heces. En ausencia de banderas rojas (edad > 50 años, anemia, rectorragia, baja de peso, fiebre, historia familiar de CCR), el manejo es con cambios dietéticos (FODMAPs), antiespasmódicos (Trimebutina/Mebeverina) y probióticos." },
  2: { vignette: "Hombre de 26 años presenta cuadro de 24 horas de evolución de deposiciones líquidas frecuentes (8 episodios), con estrías de sangre y mucosidad, dolor cólico intenso, pujo y tenesmo rectal, asociado a fiebre de 38.8 °C. Refiere haber comido mayonesa casera en un cumpleaños.", explicacion: "Diarrea Aguda Inflamatoria / Disentería: caracterizada por fiebre alta, dolor cólico con tenesmo y deposiciones con sangre y pus (frecuente por Salmonella, Shigella, Campylobacter, E. coli enteroinvasiva). Indicación: Coprocultivo, hidratación oral/EV y antibióticos empíricos (Ciprofloxacino 500 mg c/12h o Azitromicina 500 mg/d por 3-5 días). CONTRAINDICADOS los antidiarreicos opiáceos (Loperamida)." },
  3: { vignette: "Mujer de 28 años consulta por astenia crónica, diarrea intermitente con meteorismo y pérdida de 5 kg. Laboratorio destaca anemia microcítica (Hb 10.2 g/dL, Ferritina 8 ng/mL) refractaria a sulfato ferroso oral. Anticuerpos anti-transglutaminasa tisular IgA (tTG-IgA) marcadamente positivos (> 100 U/mL).", explicacion: "Enfermedad Celíaca: enteropatía autoinmune gatillada por el gluten. Se manifiesta por malabsorción (anemia ferropénica refractaria, osteopenia, diarrea crónica). Diagnóstico: serología (tTG-IgA + IgA total) y confirmación con Endoscopia Digestiva Alta con biopsias duodenales múltiples (atrofia vellositaria, hiperplasia de criptas e infiltrado linfocítico intraepitelial, clasificación de Marsh). Tratamiento: Dieta estricta sin gluten de por vida (eliminar Trigo, Avena, Cebada y Centeno - TACC)." },
  4: { vignette: "Hombre de 24 años consulta por diarrea con mucosidad y rectorragia de 3 meses de evolución (4-6 deposiciones al día) asociada a pujo, tenesmo y dolor en fosa ilíaca izquierda. Colonoscopía revela eritema difuso continuo, friabilidad de la mucosa con sangrado fácil y pérdida del patrón vascular desde el margen anal hasta el ángulo esplénico.", explicacion: "Colitis Ulcerosa (CU): enfermedad inflamatoria intestinal caracterizada por inflamación CONTINUA y limitada a la MUCOSA, originada siempre en el recto con extensión proximal. Anticuerpos p-ANCA positivos (a diferencia de Crohn, que es transmural, parcheada y ASCA +). Tratamiento de inducción y mantención en brote leve-moderado: Mesalazina oral + tópica (supositorios/enemas). En brote severo: Corticoides sistémicos EV (Hidrocortisona) e inmunomoduladores/biológicos (Anti-TNF)." },
  5: { vignette: "Hombre de 58 años con antecedente de consumo problemático de alcohol ingresa a urgencias por hematemesis masiva de sangre roja fresca con coágulos y lipotimia. Al examen: PA 80/40 mmHg, FC 128 lpm, estigmas de daño hepático crónico (eritema palmar, telangiectasias y ascitis leve).", explicacion: "Hemorragia Digestiva Alta Varicial: emergencia médica de alta letalidad. Manejo inicial inmediato: (1) ABC + 2 vías venosas periféricas gruesas (14-16G) + Cristaloides con meta PA sistólica 90-100 mmHg; (2) Transfusión restrictiva de GR (meta Hb 7-8 g/dL); (3) Fármaco vasoactivo precoz: Terlipresina EV (o Octreótido); (4) Profilaxis antibiótica obligatoria: Ceftriaxona 1g EV/día x 7 días (reduce peritonitis bacteriana y mortalidad); (5) Endoscopia Digestiva Alta precoz (< 12 horas) con Ligadura de Várices con bandas elásticas." },
  6: { vignette: "Hombre de 68 años fumador de 30 paquetes/año consulta por dificultad para deglutir que comenzó hace 3 meses con carnes y panes sólidos, y que ha progresado en las últimas semanas a papillas y líquidos. Refiere baja involuntaria de 8 kg de peso en 2 meses.", explicacion: "Disfagia Esofágica Mecánica u Orgánica Progresiva (Lógica: de sólidos a líquidos): altamente sugerente de Cáncer de Esófago (o estenosis péptica severa). En contraste, la disfagia motora (Acalasia) es ilógica (comienza con sólidos y líquidos simultáneamente). Conducta inicial inmediata: Endoscopia Digestiva Alta (EDA) con toma de biopsias." },
  7: { vignette: "Mujer de 48 años consulta por pirosis retroesternal y regurgitación ácida de 2 años de evolución que empeora al acostarse. Ha usado antiácidos esporádicos sin mejoría sostenida. No tiene disfagia, ni anemia, ni baja de peso.", explicacion: "Enfermedad por Reflujo Gastroesofágico (ERGE) no complicada: en pacientes < 40-50 años sin signos de alarma, la conducta es prueba terapéutica con Inhibidores de la Bomba de Protones (Omeprazol 20-40 mg/día o Esomeprazol) en ayunas durante 4 a 8 semanas. Si no hay respuesta o si presenta banderas rojas (o pirosis > 5 años con riesgo de Esófago de Barrett), se indica Endoscopia Digestiva Alta." },
  8: { vignette: "Hombre de 52 años con antecedente de uso crónico de Ketoprofeno por lumbago presenta inicio súbito de dolor epigástrico lacerante de intensidad 10/10 en 'puñalada', que se generaliza rápidamente a todo el abdomen. Al examen: vientre 'en tabla' con contractura abdominal involuntaria difusa y dolor intenso a la descompresión (signo de Blumberg generalizado). Radiografía de tórax de pie muestra aire libre subdiafragmático bilateral (neumoperitoneo).", explicacion: "Úlcera Péptica Perforada: complicación aguda grave del uso de AINEs. La presencia de peritonitis difusa con neumoperitoneo en radiografía de tórax confirma abdomen agudo quirúrgico. Manejo inmediato: Régimen cero + Sonda nasogástrica a caída libre + Hidratación enérgica con cristaloides + Antibióticos EV de amplio espectro (Ceftriaxona + Metronidazol) + Laparotomía exploradora de urgencia para rafia de la úlcera y parche de Graham." },
  9: { vignette: "Hombre de 55 años consulta por epigastralgia sorda de 2 meses de evolución, saciedad precoz y pérdida de 6 kg de peso. Examen físico: palidez mucocutánea, se palpa adenopatía supraclavicular izquierda dura de 2 cm (ganglio de Virchow).", explicacion: "Sospecha de Cáncer Gástrico avanzado (Garantía GES en Chile: toda persona ≥ 40 años con síntomas dispépticos de > 15-30 días o cualquier signo de alarma tiene acceso garantizado a Endoscopia Digestiva Alta en < 30 días). El ganglio de Virchow (supraclavicular izquierdo) y el nódulo de la hermana María José (umbilical) son signos de diseminación metastásica. Diagnóstico definitivo: EDA con biopsia." },
  10: { vignette: "Mujer de 64 años consulta por ictericia indolora progresiva en piel y escleras de 3 semanas de evolución, asociada a coluria intensa, acolia y baja de peso de 4 kg. Al examen: ictericia verdínica, se palpa vesícula biliar distendida indolora en hipocondrio derecho (signo de Bard y Pick / Ley de Courvoisier-Terrier). Laboratorio: Bilirrubina Total 14 mg/dL (Directa 11.5 mg/dL), Fosfatasa Alcalina 580 UI/L, GGT 420 UI/L, transaminasas levemente elevadas.", explicacion: "Ictericia Colestásica Obstructiva Extrahepática Maligna: la vesícula palpable indolora en paciente con ictericia obstructiva indolora orienta fuertemente a Adenocarcinoma de Cabeza de Páncreas o Tumor Periampular (Ley de Courvoisier-Terrier). Primer examen de imagen: Ecografía abdominal (demuestra dilatación de vía biliar intra y extrahepática con vesícula dilatada); estudio de etapificación con TAC de abdomen y pelvis con protocolo de páncreas trifásico." },
  11: { vignette: "Hombre de 28 años consulta por astenia, náuseas, coluria y dolor en hipocondrio derecho. Examen: ictericia franca con hepatomegalia sensible. Laboratorio: GOT 1850 UI/L, GPT 2200 UI/L, Bilirrubina Total 6.5 mg/dL. Serología viral: HBsAg positivo, Anti-HBc IgM positivo, Anti-VHA IgM negativo, Anti-VHC negativo.", explicacion: "Hepatitis B Aguda: el marcador patognomónico de infección aguda por virus hepatitis B es el Anti-HBc IgM positivo junto al HBsAg (+). Cursa con elevación marcada de transaminasas (> 1000 UI/L). Tratamiento: sintomático y de soporte en la gran mayoría (95% de los adultos autolimitan y aclaran el virus). Se indica antiviral (Tenofovir/Entecavir) solo si presenta falla hepática fulminante o hepatitis grave con coagulopatía (INR > 1.5)." },
  12: { vignette: "Hombre de 60 años con cirrosis hepática Child-Pugh C consulta por aumento de volumen abdominal y dolor sordo difuso. Examen: ascitis a tensión y dolor a la palpación abdominal. Se realiza paracentesis diagnóstica: líquido turbio con recuento de Leucocitos de 850/mm³ y 72% de Polimorfonucleares (PMN = 612/mm³). Gradiente albúmina suero-ascitis (GASA): 1.6 g/dL.", explicacion: "Peritonitis Bacteriana Espontánea (PBE): definida por recuento de Polimorfonucleares (PMN) en líquido ascítico ≥ 250/mm³, independiente del cultivo. Germen más frecuente: E. coli y Klebsiella. Tratamiento urgente: Ceftriaxona 2g EV/día por 5 días + Albúmina humana EV (1.5 g/kg el día 1 y 1.0 g/kg el día 3, para prevenir el síndrome hepatorrenal y reducir la mortalidad). Profilaxis secundaria de por vida con Ciprofloxacino o Norfloxacino." },
  13: { vignette: "Mujer de 30 años usuaria de anticonceptivos orales combinados por 10 años se realiza ecografía abdominal por cólico renal que describe incidentalmente una masa hepática solitaria de 4.5 cm en lóbulo derecho. RMN con contraste muestra lesión hipervascular con captación precoz en fase arterial y lavado en fase venosa, sin cicatriz central.", explicacion: "Adenoma Hepático: tumor benigno fuertemente asociado al uso prolongado de anticonceptivos orales en mujeres jóvenes. Tiene riesgo de rotura con hemoperitoneo y transformación maligna a hepatocarcinoma (especialmente si es > 5 cm). Conducta: suspender inmediatamente los anticonceptivos orales; si mide > 5 cm, es sintomático o no regresa, se indica resección quirúrgica." },
  14: { vignette: "Mujer de 48 años con antecedentes de cálculos biliares conocidos consulta por dolor cólico en hipocondrio derecho irradiado a dorso de 12 horas de evolución que no cede con analgésicos comunes, acompañado de náuseas y fiebre de 38.2 °C. Examen físico: dolor a la palpación en hipocondrio derecho con detención de la respiración profunda (Signo de Murphy positivo). Laboratorio: Leucocitos 14.200/mm³ con desviación izquierda.", explicacion: "Colecistitis Aguda Litiásica: inflamación e infección de la pared vesicular por impacto prolongado de un cálculo en el cístico. Criterios de Tokio: Signo de Murphy (+) + Fiebre/Leucocitosis + Ecografía abdominal con signos inflamatorios (cálculos, engrosamiento pared > 4 mm, líquido perivesicular, signo de Murphy ecográfico). Tratamiento: Hospitalización + Régimen cero + Hidratación EV + Analgesia (AINEs/Opioides) + Antibióticos EV (Ceftriaxona + Metronidazol) + Colecistectomía laparoscópica precoz (< 72 horas)." },
  15: { vignette: "Mujer de 72 años con antecedentes de colelitiasis ingresa por compromiso del estado general, fiebre con calofríos (39 °C), ictericia franca y dolor en hipocondrio derecho (Tríada de Charcot). Examen: PA 85/55 mmHg, FC 120 lpm, desorientada en tiempo y espacio (Péntada de Reynolds). Laboratorio: Bilirrubina 8.5 mg/dL, Leucocitos 19.000/mm³.", explicacion: "Colangitis Aguda Severa (Supurada): infección bacteriana de la vía biliar secundaria a coledocolitiasis obstructiva. La Péntada de Reynolds (Tríada de Charcot: Dolor + Ictericia + Fiebre, más Shock e hipotensión y Compromiso de conciencia) define emergencia médica extrema. Manejo: Reanimación intensiva con cristaloides + Antibióticos EV de amplio espectro inmediatos (Ceftriaxona + Metronidazol o Piperacilina/Tazobactam) + Descompresión y drenaje urgente de la vía biliar mediante CPRE (o drenaje percutáneo transparietohepático)." },
  16: { vignette: "Hombre de 74 años con fibrilación auricular no anticoagulada consulta en urgencias por dolor abdominal periumbilical de inicio brusco e intensidad 10/10 de 3 horas de evolución. Al examen físico el abdomen está blando, depresible, sin contractura ni signos peritoneales (dolor absolutamente desproporcionado al examen físico). Laboratorio: Gases arteriales muestran Acidosis Metabólica con Hiperlactatemia marcada (Lactato 5.8 mmol/L).", explicacion: "Isquemia Mesentérica Aguda (Embolia de la arteria mesentérica superior): cuadro clásico de dolor abdominal severísimo desproporcionado a la palpación en paciente con FA. La acidosis metabólica con lactato elevado es signo de necrosis/isquemia intestinal avanzada. Gold standard diagnóstico: Angio-TAC de abdomen (TAC con contraste arterial y venoso). Tratamiento de urgencia: Reanimación + Anticoagulación con Heparina EV + Laparotomía exploradora urgente con embolectomía / revascularización y resección de asas desvitalizadas." },
  17: { vignette: "Hombre de 62 años con antecedente de RGE severo consulta por dolor retroesternal postprandial opresivo y saciedad precoz. Radiografía de esófago-estómago-duodeno con bario revela herniación de la unión esofagogástrica y del fundus gástrico hacia el mediastino posterior a través del hiato diafragmático.", explicacion: "Hernia Hiatal Paraesofágica o Mixta (Tipo II/III): a diferencia de la hernia por deslizamiento tipo I (que solo causa RGE y se maneja médicamente), las hernias paraesofágicas tienen riesgo de vólvulo gástrico, estrangulación e isquemia gástrica. Por este motivo, las hernias paraesofágicas sintomáticas tienen indicación de corrección quirúrgica (reducción herniaria, cierre de pilares y funduplicatura laparoscópica)." },
  18: { vignette: "Hombre de 35 años consulta por dolor anal punzante y desgarrador de gran intensidad durante y después de la defecación, de 2 meses de duración, que dura varias horas post-evacuación y se acompaña de estrías de sangre roja fresca en el papel higiénico. Examen proctológico revela úlcera longitudinal en línea media posterior anal con pliegue centinela en el margen externo.", explicacion: "Fisura Anal Crónica: desgarro del anodermo distal a la línea dentada, predominantemente en la línea media posterior (90%). El dolor postdefecatorio prolongado se debe al hipertono del esfínter anal interno. Manejo de primera línea: Dieta rica en fibra y agua + Baños de asiento tibios + Relajantes del esfínter anal tópicos (Diltiazem al 2% o Nitroglicerina tópica) por 6-8 semanas. En casos refractarios: Toxina botulínica o Esfinterotomía Lateral Interna quirúrgica." },
  19: { vignette: "Hombre de 28 años ingresa tras colisión vehicular a alta velocidad. Está taquicárdico (FC 125 lpm), hipotenso (PA 85/50 mmHg), pálido y con abdomen doloroso y distendido. En el box de reanimación se realiza Ecografía FAST (Focused Assessment with Sonography for Trauma) que demuestra líquido libre abundante en el espacio hepatorrenal (Morrison) y en la pelvis.", explicacion: "Trauma Abdominal Cerrado con Shock Hipovolémico y FAST (+): la demostración de líquido libre intraabdominal (hemoperitoneo) en un paciente hemodinámicamente inestable (que no responde a volumen) es indicación formal e inmediata de Laparotomía Exploradora Urgente sin necesidad de realizar TAC." },
  20: { vignette: "Lactante de 14 meses es llevado a urgencias por sus padres tras haber ingerido accidentalmente una pila de botón de 20 mm hace 1 hora. La radiografía de tórax y abdomen muestra imagen radiopaca redondeada de doble contorno en el tercio medio del esófago.", explicacion: "Cuerpo Extraño Esofágico (Pila de Botón): la presencia de una pila de botón impactada en el esófago genera necrosis por licuefacción, perforación esofágica y fístula aortoesofágica exanguinante en menos de 2 horas por generación de corriente eléctrica e hidróxido de sodio. Conducta de emergencia absoluta: Extracción endoscópica inmediata (< 2 horas) bajo anestesia general." },
  21: { vignette: "Lactante de 10 meses presenta cuadro de 2 días de vómitos y deposiciones líquidas abundantes (8 al día). Al examen: irritable, ojos hundidos, llanto sin lágrimas, boca muy seca, saliva filante, signo del pliegue cutáneo que desaparece lentamente (en 2 segundos) y sed intensa (bebe ávidamente la solución).", explicacion: "Deshidratación Aguda Moderada por Gastroenteritis Aguda (Plan B de la OMS): manejo con Solución de Rehidratación Oral (SRO con osmolaridad reducida 245 mOsm/L) a 50-100 mL/kg en 4 horas fraccionado en pequeñas cucharaditas. Reevaluar al término de las 4 horas. Continuar lactancia materna en todo momento. No se indican antibióticos ni antieméticos de rutina." },
  22: { vignette: "Lactante de 2 meses alimentado con lactancia materna exclusiva presenta regurgitaciones frecuentes de leche no digerida tras casi todas las tomas. No presenta tos, ni dificultad respiratoria, ni irritabilidad; su curva de crecimiento y peso se mantiene en el percentil 50.", explicacion: "Reflujo Gastroesofágico Fisiológico del Lactante ('Regurgitador Feliz'): debido a la inmadurez fisiológica del esfínter esofágico inferior y dieta líquida. No requiere exámenes complementarios ni fármacos (no usar IBP ni proquinéticos). Manejo: medidas posturales (mantener en posición vertical 20-30 minutos tras la toma), fraccionar tomas y tranquilizar a los padres." },
  23: { vignette: "Lactante de 5 semanas de vida, primogénito varón, consulta por vómitos explosivos de contenido lácteo no bilioso inmediatamente después de cada mamada desde hace 5 días. Tras vomitar muestra hambre voraz. Examen: deshidratado, se palpa pequeña masa móvil firme de 2 cm en epigastrio (oliva pilórica). Laboratorio: Gases venosos muestran Alcalosis Metabólica Hipoclorémica e Hipokalémica.", explicacion: "Estenosis Hipertrófica del Píloro: hipertrofia de la capa muscular circular del píloro. Típica en varones de 3 a 6 semanas con vómitos explosivos no biliosos y alcalosis metabólica hipoclorémica hipokalémica por pérdida de ácido clorhídrico gástrico. Diagnóstico de elección: Ecografía abdominal (grosor muscular pilórico > 3 mm y longitud > 15 mm). Manejo: Corrección hidroelectrolítica rigurosa previa a la cirugía + Piloromiotomía extramucosa de Ramstedt." }
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
  
  .topic-hdr { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #854d0e; padding-bottom: 4px; margin-bottom: 8px; }
  .topic-hdr h2 { font-family: 'Merriweather', serif; font-size: 13.5pt; color: #854d0e; }
  .topic-hdr .num { font-size: 8pt; font-weight: 700; color: #a16207; text-transform: uppercase; }
  .perfil-tag { background: #fefce8; border: 1px solid #fef08a; border-left: 4px solid #ca8a04; padding: 3px 6px; font-size: 7.5pt; }

  .two-col-flow { column-count: 2; column-gap: 0.2in; width: 100%; }
  
  .box { border: 1px solid #cbd5e1; border-radius: 2px; padding: 5px 7px; margin-top: 5px; margin-bottom: 5px; font-size: 8pt; width: 100%; break-inside: avoid; }
  .box-title { font-weight: 700; font-size: 7.5pt; text-transform: uppercase; margin-bottom: 2px; letter-spacing: 0.5px; }
  .box.high-yield { background: #f8fafc; border-left: 3.5px solid #ca8a04; break-inside: avoid; }
  .box.high-yield .box-title { color: #a16207; }

  .box.vignette-redesigned { background: #fffdf5; border: 1.5px solid #f59e0b; border-radius: 3px; padding: 0; margin-top: 6px; margin-bottom: 6px; overflow: hidden; break-inside: avoid; }
  .vignette-hdr { background: #d97706; color: #ffffff; font-weight: 700; font-size: 8pt; padding: 3.5px 8px; text-transform: uppercase; letter-spacing: 0.5px; }
  .vignette-body { padding: 6px 8px; }
  .vignette-sec { margin-bottom: 4px; }
  .vignette-sec.concept-sec { border-top: 1px dashed #fcd34d; padding-top: 4px; margin-bottom: 0; }
  .sec-label { font-weight: 700; font-size: 7.5pt; color: #92400e; display: block; margin-bottom: 2px; }
  .sec-text { font-size: 8pt; line-height: 1.35; color: #1e293b; }

  .box.summary-fullwidth { width: 100%; background: #fefce8; border: 1.5px solid #ca8a04; border-radius: 3px; padding: 0; margin-top: 10px; margin-bottom: 6px; overflow: hidden; break-inside: avoid; }
  .summary-hdr { background: #ca8a04; color: #ffffff; font-weight: 700; font-size: 8.5pt; padding: 4px 10px; text-transform: uppercase; letter-spacing: 0.5px; }
  .summary-body { padding: 8px 10px; font-size: 8.5pt; line-height: 1.4; color: #713f12; }

  .box.important-callout { background: #fef2f2; border-color: #fca5a5; border-left: 3.5px solid #ef4444; }
  .box.important-callout .box-title { color: #991b1b; }
  .box.warning-callout { background: #fff7ed; border-color: #ffedd5; border-left: 3.5px solid #f97316; }
  .box.warning-callout .box-title { color: #c2410c; }
  .box.note-callout { background: #f8fafc; border-color: #e2e8f0; border-left: 3.5px solid #64748b; }
  .box.note-callout .box-title { color: #334155; }
  .box.tip-callout { background: #fff5f5; border: 1.5px solid #fca5a5; border-left: 3.5px solid #dc2626; }
  .box.tip-callout .box-title { color: #991b1b; }
  .box.tip-callout p { color: #7f1d1d; }

  .subhead { font-family: 'Merriweather', serif; font-size: 9.5pt; font-weight: 700; color: #854d0e; margin: 8px 0 4px 0; border-bottom: 1px solid #cbd5e1; padding-bottom: 1px; break-after: avoid; }
  .subhead-small { font-family: 'Inter', sans-serif; font-size: 8.5pt; font-weight: 700; color: #0f172a; margin: 6px 0 3px 0; break-after: avoid; }
  p.txt { font-size: 8pt; line-height: 1.35; margin-bottom: 4px; text-align: justify; }
  ul.lst { padding-left: 12px; margin-bottom: 4px; }
  ul.lst li { font-size: 8pt; margin-bottom: 2px; }

  .tbl-container { width: 100%; margin: 6px 0; break-inside: avoid; }
  .tbl-hdr { font-weight: 700; font-size: 7.5pt; color: #854d0e; background: #fefce8; padding: 3px 6px; border: 1px solid #cbd5e1; border-bottom: none; text-transform: uppercase; letter-spacing: 0.5px; }
  .tbl-hdr .tbl-num { color: #a16207; }
  table.tbl { width: 100%; border-collapse: collapse; font-size: 7.5pt; border: 1px solid #cbd5e1; border-top: 1.5px solid #854d0e; border-bottom: 1.5px solid #854d0e; }
  table.tbl th { background: #fefce8; color: #854d0e; padding: 4px 5px; text-align: left; font-size: 7pt; text-transform: uppercase; font-weight: 700; border-bottom: 1px solid #cbd5e1; }
  table.tbl td { padding: 4px 5px; border-bottom: 1px solid #e2e8f0; vertical-align: top; line-height: 1.3; }
  table.tbl tr:nth-child(even) td { background: #f8fafc; }

  .diagram-box { width: 100%; border: 1px solid #854d0e; border-radius: 2px; padding: 5px 8px; margin-top: 6px; margin-bottom: 6px; background: #ffffff; text-align: center; break-inside: avoid; }
  .diagram-box .d-title { font-weight: 700; font-size: 8pt; text-transform: uppercase; color: #854d0e; text-align: center; margin-bottom: 4px; border-bottom: 1px solid #cbd5e1; padding-bottom: 2px; }
  .svg-centered { display: flex; justify-content: center; align-items: center; width: 100%; text-align: center; }
  .svg-centered svg { max-width: 100%; height: auto; margin: 0 auto; display: block; }

  .topic-questions-container { width: 100%; margin-top: 8px; break-inside: avoid; }
  .t-q-title { font-weight: 700; font-size: 8pt; color: #854d0e; text-transform: uppercase; border-bottom: 1.5px solid #854d0e; padding-bottom: 2px; margin-bottom: 4px; }
  .q-full-width { width: 100%; background: #ffffff; border: 1px solid #cbd5e1; border-left: 3.5px solid #a16207; border-radius: 2px; padding: 5px 8px; margin-bottom: 5px; break-inside: avoid; }
  .q-hdr-link { display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px; }
  .q-full-width .q-hdr { font-weight: 700; font-size: 8pt; color: #a16207; text-transform: uppercase; letter-spacing: 0.5px; }
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
  console.log(`Generando PDFs para Capítulo 8: Gastroenterología (23 temas)...`);

  const chapDirV3 = path.join(baseCapitulosDir, 'Capitulo_8_Gastroenterologia');
  if (!fs.existsSync(chapDirV3)) fs.mkdirSync(chapDirV3, { recursive: true });

  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  for (const tDef of gastroTopicDefinitions) {
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
      explicacion: "Manejo clínico según protocolo de gastroenterología EUNACOM."
    };

    const topicObj = {
      chapNum: tDef.chapNum,
      topicNumInChap: tDef.topicNum,
      topicLabel,
      title: rawClass.topic,
      perfilCode: rawClass.eunacom_code || `1.04.${tDef.topicNum < 10 ? '0' + tDef.topicNum : tDef.topicNum}`,
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
          <div style="font-size: 7.5pt; font-family: 'Inter', sans-serif; color: #a16207; width: 100%; display: flex; justify-content: space-between; align-items: center; margin: 0 0.35in; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">
            <span>MANUAL EUNACOM &bull; CAPÍTULO ${topicLabel} &bull; GASTROENTEROLOGÍA</span>
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
  console.log(`\n🎉 Capítulo 8: Gastroenterología (23 temas) generado con éxito!`);
}

main().catch(console.error);
