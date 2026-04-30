#!/usr/bin/env python3
"""
Auto-tagger for EUNACOM questions.
Uses keyword-based NLP on Spanish medical text.
No external API needed — runs entirely locally.
"""

import json
import os
import re
from collections import defaultdict

# ─────────────────────────────────────────────
# MEDICAL KEYWORD → TAG MAPPING (Spanish)
# Each entry: (regex_pattern, [tags_to_apply])
# Tags are ordered from most specific to most general
# ─────────────────────────────────────────────

RULES = [
    # ── PEDIATRÍA ──────────────────────────────────────────
    (r'vacuna|DTP|difteria|tétanos|pertussis|BCG|polio|sarampión|rubéola|paperas|hepatitis B|neumocócic|meningocócic|rotavirus|influenza|PAI|esquema de vacunación', ['Vacunas', 'Inmunización', 'Pediatría', 'EUNACOM']),
    (r'laringitis|croup|estridor|disfon|tos perruna|parainfluenza', ['Laringitis obstructiva', 'Croup', 'Vía aérea', 'Pediatría']),
    (r'espasmo.*masiv|síndrome de West|hipsarritmia|espasmo infantil', ['Síndrome de West', 'Epilepsia', 'Neuropediatría', 'Pediatría']),
    (r'convuls|epilepsia|crisis epiléptica|anticonvulsivante|fenobarbital|valproato|fenitoína', ['Epilepsia', 'Crisis convulsivas', 'Neurología', 'Pediatría']),
    (r'retraso mental|discapacidad intelectual|retardo del desarrollo', ['Retraso mental', 'Neurodesarrollo', 'Pediatría']),
    (r'lactante|recién nacido|neonato|prematuro|RNPT|RNT|reciennacido', ['Neonatología', 'Pediatría']),
    (r'ictericia neonatal|ictericia.*neonatal|bilirrubina|kernícterus|fototerapia|exsanguinotransfusión|ictericia fisiológica|ictericia prolongada.*predominio indirecto', ['Ictericia neonatal', 'Hiperbilirrubinemia', 'Neonatología', 'Pediatría']),
    (r'sepsis neonatal|infección neonatal|estreptococo grupo B|microorganismos.*neumonía neonatal|neumonía neonatal.*microorganismos|agente.*neumonía.*recién nacido|parálisis cerebral|PC.*espástica', ['Sepsis neonatal', 'Infección neonatal', 'Neonatología']),
    (r'diarrea aguda|diarrea acuosa|gastroenteritis aguda|deshidratación|\bSRO\b|suero oral', ['Gastroenteritis aguda', 'Deshidratación', 'Gastroenterología pediátrica', 'Pediatría']),
    (r'neumonía.*niño|neumonía.*prescolar|neumonía.*lactante|bronconeumonía|bronquiolitis|VSR|virus sincicial|cuadro respiratorio.*sala cuna|sala cuna.*cuadro respiratorio|cuadro respiratorio.*meses.*fiebre', ['Infección respiratoria', 'Neumonía pediátrica', 'Pediatría']),
    (r'asma bronquial|asma.*niño|sibilancias|broncoespasmo|obstrucción bronquial|tos.*ejercicio.*niño|tos nocturna.*disnea|tos con el ejercicio|tos.*en relación al ejercicio|tos nocturna.*ejercicio|tratamiento inhalatorio.*asmático|tos.*frío.*ejercicio|tos.*ejercicio.*frío|tos frecuente.*ejercicio|tos.*duerme.*ejercicio', ['Asma bronquial', 'Obstrucción bronquial', 'Pediatría']),
    (r'desnutrición|marasmo|kwashiorkor|malnutrición|déficit nutricional', ['Desnutrición', 'Nutrición pediátrica', 'Pediatría']),
    (r'talla baja|hipocrecimiento|hormona de crecimiento|déficit.*GH|déficit estatural|más bajo.*curso|más baj.*curso|bajo.*del curso|velocidad.*crecimiento.*\bDS\b|\bITE\b.*-[0-9]|detención del crecimiento|retraso del crecimiento.*niño', ['Talla baja', 'Déficit de crecimiento', 'Endocrinología pediátrica', 'Pediatría']),
    (r'pubertad precoz|pubertad tardía|desarrollo puberal|Tanner|adrenarquia|pubarca|telarquia|ginecomastia|retroareolar.*niño', ['Desarrollo puberal', 'Pubertad', 'Endocrinología pediátrica', 'Pediatría']),
    (r'celíaca|intolerancia al gluten|enteropatía.*gluten|deposiciones.*amarillentas|deposiciones.*brillantes|esteatorrea|malabsorción', ['Enfermedad celíaca', 'Malabsorción', 'Gastroenterología pediátrica', 'Pediatría']),
    (r'intususcepción|invaginación intestinal|obstrucción intestinal.*niño|deposiciones rojas.*niño|niño.*deposiciones rojas|dolor.*deposiciones rojas|deposiciones rojas.*dolor|dolor abdominal.*cede.*reinicia', ['Intususcepción', 'Urgencia quirúrgica pediátrica', 'Pediatría']),
    (r'testículo no descendido|criptorquidia|criptorquidea|hidrocele|hernia inguinal.*niño|testículo no palpable|testículo.*no.*palpa|no.*palpa.*testículo|no.*palpable.*testículo|ausencia.*testículo|testículo.*conductos inguinales', ['Criptorquidia', 'Genitourinario pediátrico', 'Cirugía pediátrica', 'Pediatría']),
    (r'cardiopatías? congénitas?|comunicación.*interauricular|comunicación.*interventricul|\bCIA\b|\bCIV\b|Fallot|ductus|persistencia.*ductus|coartación|estenosis.*pulmonar|transposición.*grandes', ['Cardiopatía congénita', 'Cardiología pediátrica', 'Pediatría']),
    (r'soplo.*cardíaco|soplo.*sistólico|soplo.*diastólico', ['Soplo cardíaco', 'Semiología cardiovascular', 'Cardiología']),
    (r'fiebre reumática|carditis reumática|Jones|corea de Sydenham', ['Fiebre reumática', 'Cardiología pediátrica', 'Pediatría']),
    (r'Kawasaki', ['Enfermedad de Kawasaki', 'Cardiología pediátrica', 'Vasculitis', 'Pediatría']),
    (r'ITU pediátrica|infección urinaria.*niño|pielonefritis.*niño|reflujo vesicoureteral|disuria.*niño|poliaquiuria.*niño|orinas turbias.*niño|urocultivo.*niño|exámenes.*fiebre.*niño|laboratorio.*niño.*fiebre|exámenes.*solicitar.*niño.*fiebre', ['Infección urinaria pediátrica', 'Nefrología pediátrica', 'Pediatría']),
    (r'síndrome nefrótico|proteinuria|edema.*niño|hipoalbuminemia', ['Síndrome nefrótico', 'Nefrología pediátrica', 'Pediatría']),
    (r'síndrome hemolítico urémico|\bSHU\b', ['Síndrome hemolítico urémico', 'Nefrología pediátrica', 'Pediatría']),
    (r'acidosis tubular renal', ['Acidosis tubular renal', 'Nefrología pediátrica', 'Pediatría']),
    (r'maltrato infantil|abuso.*niño|violencia intrafamiliar|negligencia', ['Maltrato infantil', 'Pediatría social', 'Pediatría']),
    (r'TDAH|déficit atencional|hiperactividad|trastorno.*atención|trastorno oposicionista|TOD', ['TDAH', 'Neurodesarrollo', 'Psiquiatría infantil', 'Pediatría']),
    (r'autismo|trastorno del espectro autista|\bTEA\b|no habla.*niño|no.*dice.*palabras|no dice.*palabra|no dice.*ninguna palabra|retraso.*lenguaje|retraso.*habla', ['Autismo', 'Neurodesarrollo', 'Neuropediatría', 'Pediatría']),
    (r'anemia.*niño|ferropenia.*niño|déficit de hierro.*niño|niño.*anemia|\bVCM\b.*niño|niño.*\bVCM\b', ['Anemia ferropénica', 'Hematología pediátrica', 'Pediatría']),
    # Neonatología específica
    (r'test de Apgar|Apgar', ['Evaluación neonatal', 'Neonatología', 'Pediatría']),
    (r'síndrome.*dificultad respiratoria|distres respiratorio|\bSDR\b|membrana hialina|surfactante|corticoides antenatales|corticoides.*maduración pulmonar|betametasona.*embarazo|dexametasona.*prematurez', ['SDR neonatal', 'Maduración pulmonar', 'Neonatología', 'Pediatría']),
    (r'fontanela|circunferencia craneana|perímetro cefálico|macrocefalia|hidrocefalia', ['Desarrollo neurológico', 'Neonatología', 'Neuropediatría', 'Pediatría']),
    (r'baja fisiológica.*peso|pérdida.*peso.*neonatal|baja.*peso.*RN', ['Neonatología', 'Crecimiento neonatal', 'Pediatría']),
    (r'muerte perinatal|mortalidad perinatal|mortalidad neonatal|causa.*muerte.*perinatal', ['Mortalidad perinatal', 'Neonatología', 'Salud pública pediátrica', 'Pediatría']),
    (r'hijo.*madre diabética|hijos.*madre diabética|madre diabética.*mayor riesgo|riesgo.*hijo.*diabética', ['Hijo de madre diabética', 'Neonatología', 'Endocrinología pediátrica', 'Pediatría']),
    (r'agenesia renal bilateral|ausencia bilateral.*riñones|potter.*agenesia', ['Agenesia renal bilateral', 'Nefrología pediátrica', 'Neonatología', 'Pediatría']),
    (r'malformaciones congénitas.*frecuentes|malformaciones congénitas.*más frecuentes|frecuencia.*malformaciones congénitas', ['Malformaciones congénitas', 'Genética médica', 'Neonatología', 'Pediatría']),
    (r'hernia.*diafragmática|hernia diafragmática congénita', ['Hernia diafragmática congénita', 'Cirugía neonatal', 'Neonatología', 'Pediatría']),
    (r'espina bífida|meningocele|mielomeningocele|disrafismo espinal', ['Espina bífida', 'Malformaciones congénitas', 'Neonatología', 'Pediatría']),
    (r'taquipnea transitoria|TTN|taquipnea.*recién nacido|taquipnea.*neonatal', ['Taquipnea transitoria neonatal', 'Patología respiratoria neonatal', 'Neonatología', 'Pediatría']),
    (r'mácula eritematosa.*occipital|angioma.*occipital|lesión vascular.*neonato|hemangioma.*recién nacido|aumenta de coloración.*llanto', ['Lesión vascular cutánea neonatal', 'Dermatología neonatal', 'Neonatología', 'Pediatría']),
    (r'distención abdominal.*vómitos.*deposiciones sanguinolentas|enterocolitis necrotizante|\bECN\b|distensión abdominal.*deposiciones sanguinolentas.*neonato', ['Enterocolitis necrotizante', 'Gastroenterología neonatal', 'Neonatología', 'Pediatría']),
    (r'eritema.*exudado purulento.*ombligo|onfalitis|infección.*ombligo.*neonato|eritema.*ombligo.*fiebre', ['Onfalitis', 'Infección neonatal', 'Neonatología', 'Pediatría']),
    (r'fractura.*parto|fractura.*recién nacido|traumatismo.*obstétrico|huesos.*lesionados.*parto|lesion[ae].*durante.*parto|fractura.*clavícula.*parto|lesionas.*parto|huesos.*frecuencia.*parto', ['Traumatismo obstétrico', 'Neonatología', 'Pediatría']),
    (r'reflejo.*prensión|reflejo de prensión|rojo pupilar|estrabismo|prueba de Hirschberg|Hirschberg|ambliopía', ['Oftalmología pediátrica', 'Neonatología', 'Pediatría']),
    # Nutrición pediátrica
    (r'lactancia materna|lactancia.*beneficios|lactancia.*exclusiva', ['Lactancia materna', 'Nutrición del lactante', 'Pediatría']),
    (r'alimentación complementaria|ablactación|papilla|alimentos sólidos.*meses|qué.*comer.*meses|qué alimento.*niño|4 meses.*alimentar|niño.*4 meses.*puede.*recibir|niño.*7 meses.*no consume.*leche', ['Alimentación complementaria', 'Nutrición del lactante', 'Pediatría']),
    (r'dientes.*de leche|erupción.*dentaria|dentición', ['Desarrollo pediátrico', 'Odontología pediátrica', 'Pediatría']),
    # Infecciones pediátricas
    (r'faringitis|amigdalitis|odinofagia.*exantema|faringe.*purulenta|angina.*estreptocócica|odinofagia.*tos|tos.*odinofagia|fiebre.*odinofagia', ['Faringoamigdalitis', 'Infectología pediátrica', 'Pediatría']),
    (r'otitis media|otalgia|otorrea', ['Otitis media aguda', 'ORL pediátrica', 'Pediatría']),
    (r'varicela|exantema.*pruriginoso.*cabeza|exantema.*pruriginoso.*generalizado|exantema.*polimorfo', ['Varicela', 'Enfermedades exantemáticas', 'Pediatría']),
    (r'eritema infeccioso|quinta enfermedad|parvovirus|eritema.*mejillas|eritema facial|eritema.*facial|eritema.*mejillas.*exantema', ['Eritema infeccioso', 'Enfermedades exantemáticas', 'Pediatría']),
    (r'escarlatina|piel de gallina|líneas de Pastia|exantema.*amigdalitis', ['Escarlatina', 'Enfermedades exantemáticas', 'Infectología pediátrica', 'Pediatría']),
    (r'máculas.*purpúricas|lesiones purpúricas.*crecen|petequias.*fiebre alta|meningococcemia|sepsis meningocócica', ['Sepsis meningocócica', 'Infectología pediátrica', 'Urgencia pediátrica', 'Pediatría']),
    (r'fiebre.*7 días|fiebre.*semanas.*niño|fiebre prolongada.*niño|fiebre.*origen desconocido', ['Fiebre prolongada', 'Infectología pediátrica', 'Pediatría']),
    (r'inmunodeficiencia primaria|agammaglobulinemia|hipogammaglobulinemia|infecciones recurrentes.*niño|otitis.*neumonías.*niño|inmunodeficiencia.*inmunoglobulinas|producción de inmunoglobulinas', ['Inmunodeficiencia primaria', 'Infectología pediátrica', 'Inmunología', 'Pediatría']),
    # Ortopedia pediátrica
    (r'displasia.*cadera|luxación.*cadera|\bDDC\b|factores de riesgo.*cadera|Ortolani|Barlow.*cadera', ['Displasia de cadera', 'Ortopedia pediátrica', 'Pediatría']),
    (r'escroto agudo|torsión testicular', ['Torsión testicular', 'Urgencia urológica pediátrica', 'Pediatría']),
    (r'cojera.*niño|artritis séptica.*cadera|sinovitis|claudicación.*marcha.*niño', ['Ortopedia pediátrica', 'Infectología pediátrica', 'Pediatría']),
    (r'pie plano|arco plantar.*niño', ['Pie plano', 'Ortopedia pediátrica', 'Pediatría']),
    # Evaluación del desarrollo y nutrición
    (r'pensamiento.*niño|desarrollo psicomotor|hito.*desarrollo|hitos.*desarrollo|etapas.*desarrollo|torre de.*cubos|dice frases.*palabras|frases de.*palabras.*niño', ['Desarrollo psicomotor', 'Neurodesarrollo', 'Pediatría']),
    (r'desarrollo.*adolescente|tareas.*adolescente|identidad.*adolescente|adolescencia', ['Desarrollo del adolescente', 'Adolescencia', 'Pediatría']),
    (r'talla.*nacimiento|peso.*nacer|antropometría.*neonatal|crecimiento.*varón|aumento.*talla.*año|promedio.*talla|primer año.*talla|talla.*primer año|al cumplir un año.*pesa.*mide|un año de edad.*pesa.*mide|niño.*pesa.*mide.*aproximadamente', ['Crecimiento y desarrollo', 'Neonatología', 'Pediatría']),
    (r'\bIPE\b|\bIPT\b|\bITE\b|índice.*peso.*talla|índice.*talla.*edad|evaluación nutricional.*niño|enuresis', ['Evaluación nutricional', 'Crecimiento y desarrollo', 'Pediatría']),
    (r'tumor de Wilms|nefroblastoma|masa.*abdominal.*niño|masa.*flanco.*niño|masa.*flanco abdominal|masa abdominal.*flanco|masa.*cada flanco', ['Tumor de Wilms', 'Oncología pediátrica', 'Pediatría']),
    (r'dermatomiositis|miositis.*niño|eritema.*nudillos.*niño|debilidad.*brazos.*eritema.*niño|eritema.*nudillos.*alrededor.*ojos|eritema.*nudillos.*rodillas.*niño', ['Dermatomiositis', 'Reumatología pediátrica', 'Pediatría']),
    (r'diarrea crónica|diarrea.*mes.*niño|diarrea.*meses.*niño|deposiciones explosivas.*niño|diarrea intermitente.*niño|niño.*diarrea.*mes|niño.*diarrea.*meses|diarrea.*evolución.*mes', ['Diarrea crónica', 'Gastroenterología pediátrica', 'Pediatría']),
    (r'diarrea disentérica|disentería|deposiciones con sangre.*fiebre.*CEG', ['Disentería', 'Infectología pediátrica', 'Pediatría']),
    (r'constipación.*niño|estreñimiento.*niño|no.*defecado.*días|evacúa.*vez.*semana.*niño|encopresis|incontinencia fecal|manchado.*ropa.*interior.*niño|causa.*constipación.*pediátrica|causa.*frecuente.*constipación', ['Constipación', 'Gastroenterología pediátrica', 'Pediatría']),
    (r'cuerpo extraño.*niño|traga.*moneda|ingirió.*moneda|atragantamiento|tos.*inicio súbito.*niño|disnea.*inicio súbito.*niño|cuerpo extraño.*oído|objeto.*oído.*niño|poroto.*oído|tos.*disnea.*inicio súbito|asimetría del murmullo pulmonar.*niño|traga.*bolita|bolita.*cristal|imposibilidad de tragar.*sialorrea|sialorrea.*imposibilidad.*tragar|traga.*bola.*vidrio', ['Cuerpo extraño', 'Urgencias pediátricas', 'Pediatría']),
    (r'dolor abdominal.*periumbilical|dolor abdominal funcional.*niño|dolor periumbilical.*niño', ['Dolor abdominal funcional', 'Gastroenterología pediátrica', 'Pediatría']),
    (r'intoxicación.*niño|ingiere.*sustancia.*niño|sustancia desconocida.*niño|consume.*sustancia.*niño|sialorrea.*vómitos.*temblor|ingiere accidentalmente|ingirió.*sustancia|midriasis.*ingirió|miosis.*ingirió|midriasis.*taquicardia.*sequedad bucal', ['Intoxicación pediátrica', 'Urgencias pediátricas', 'Pediatría']),
    (r'mordedura.*perro|profilaxis.*rabia|vacunación.*rabia|picadura.*avispa.*niño|convivir.*perro.*niño|perro.*niño.*convivir|perro.*San Bernardo', ['Mordedura y rabia', 'Urgencias pediátricas', 'Infectología']),
    (r'palpitaciones.*niño|taquicardia.*paroxística.*niño|cuadros autolimitados.*palpitaciones|palpitaciones.*inicio brusco.*término brusco|acortamiento.*PR.*delta|Wolff.*Parkinson', ['Taquicardia supraventricular', 'Cardiología pediátrica', 'Pediatría']),
    (r'herencia.*autosómica|herencia.*ligada.*X|pedigrí|tipo de herencia', ['Genética médica', 'Medicina básica', 'Pediatría']),
    (r'coqueluche|tosferina|Bordetella pertussis|tos.*en accesos|tos paroxística.*cianosis|tos.*accesos.*cianosis|petequias.*cara.*tos.*accesos|tos intensa.*accesos', ['Coqueluche', 'Infectología pediátrica', 'Pediatría']),
    (r'herpangina|vesículas.*paladar.*niño|paladar.*vesículas.*úlceras|vesículas.*úlceras.*paladar blando|úlceras.*paladar.*niño|Coxsackie|mano.*pie.*boca|Hand.*Foot.*Mouth|faringe.*vesículas.*úlceras|vesículas y úlceras.*paladar', ['Herpangina', 'Infectología pediátrica', 'Pediatría']),
    (r'traccionando.*mano|codo.*pronación.*llora|codo.*extendido.*pronación|codo.*niñera|luxación.*codo.*niño|pronación dolorosa', ['Pronación dolorosa', 'Ortopedia pediátrica', 'Pediatría']),
    (r'celulitis.*pierna.*niño|linfangitis.*niño|placa.*bordes.*definidos.*pierna|celulitis.*extremidad.*niño', ['Celulitis', 'Infectología pediátrica', 'Pediatría']),
    (r'exantema petequial|petequias.*generalizadas.*epistaxis|petequias.*extremidades.*post.*infección|sangrado.*petequias.*resfriado|epistaxis.*petequias.*niño|púrpura.*post.*infección.*viral|petequias.*sangramiento gingival', ['PTI', 'Trombocitopenia', 'Hematología pediátrica', 'Pediatría']),
    (r'hepatis A|hepatitis.*severidad|causa.*hepatitis A|transaminasas.*hepatitis', ['Hepatitis A', 'Hepatología pediátrica', 'Infectología pediátrica', 'Pediatría']),
    (r'causa.*frecuente.*shock.*pediatría|causa.*shock.*niño|shock.*causa.*frecuente.*pediátric', ['Shock en pediatría', 'Urgencias pediátricas', 'Pediatría']),
    (r'hernia.*zona inguinal|aumento de volumen.*inguinal.*blando.*tos|reducible.*anillo.*inguinal|hernia inguinal.*aumenta.*tos', ['Hernia inguinal', 'Cirugía pediátrica', 'Pediatría']),
    (r'reflejo de Moro|reflejo.*moro|reflejo.*arcaico|período.*reflejo.*moro', ['Reflejos del recién nacido', 'Neonatología', 'Pediatría']),
    (r'quiebre matrimonial.*notas|quiebre matrimonial.*rendimiento|caída.*notas.*dejado.*participar|bajo rendimiento.*actividades.*grupales|notas.*caída.*compañeros', ['Trastorno adaptativo', 'Psiquiatría infantil', 'Pediatría']),
    (r'alteración menstrual.*hipotiroi|menstruación.*hipotiroi|hipotiroi.*ciclo menstrual', ['Hipotiroidismo', 'Tiroides', 'Endocrinología']),
    (r'dolor abdominal crónico.*causa ginecológica|causa ginecológica.*dolor abdominal|origen ginecológico.*dolor', ['Endometriosis', 'Ginecología', 'Dolor pélvico']),
    (r'dolor.*palpación anexial.*fiebre|leucorrea.*fiebre.*dolor.*anexial|fiebre.*dolor.*palpación anexial', ['EPI', 'Infección ginecológica', 'Ginecología']),
    (r'genitorragia|sangrado genital.*postmenopáusica|sangrado genital.*menopausia', ['Sangrado uterino anormal', 'Ginecología oncológica', 'Ginecología']),
    (r'úlcera.*indolora.*labio mayor|úlcera.*indolora.*genitales|úlcera.*fondo limpio.*genitales|sífilis.*labio mayor', ['Sífilis', 'ITS', 'Infectología']),
    (r'cetoacidosis.*niño|CAD.*niño|coma.*orinando.*niño|desorientación.*coma.*orinando|cefalea.*coma.*poliuria.*niño|CAD.*escolar', ['Cetoacidosis diabética', 'Endocrinología pediátrica', 'Pediatría']),
    (r'Guillain.*Barré|Guillain-Barré|debilidad.*progresiva.*abolición.*reflejos.*niño|arreflexia.*debilidad.*progresiva|hipotonía.*arreflexia.*progresiva|debilidad.*cuatro extremidades.*abolición.*reflejos|parestesias.*debilidad.*cuatro extremidades', ['Síndrome de Guillain-Barré', 'Neuropediatría', 'Neurología']),
    (r'eritema.*mejillas.*disposición reticular|exantema.*reticular.*tronco|eritema infeccioso.*mejillas|eritema.*mejillas.*extremidades.*reticular', ['Eritema infeccioso', 'Enfermedades exantemáticas', 'Pediatría']),
    (r'niño.*peso.*talla.*equivalentes.*5 años|peso.*talla.*mayor.*edad.*niño|peso.*talla.*niño.*normalidad', ['Crecimiento y desarrollo', 'Evaluación nutricional', 'Pediatría']),
    (r'DM2.*embarazo|diabética.*tipo 2.*embarazo|glicemia.*ayuno.*sobre 120.*embarazo|hemoglobina glicosilada.*embarazo.*7%', ['Diabetes en el embarazo', 'Diabetes gestacional', 'Obstetricia']),
    # Nuevas reglas Pediatría
    (r'fibrosis quística|heces esteatorreicas.*neumonías|mal incremento ponderal.*esteatorrea|esteatorrea.*infecciones respiratorias|mal incremento.*esteatorre', ['Fibrosis quística', 'Gastroenterología pediátrica', 'Pediatría']),
    (r'glicemia.*250|glicemia.*ayuno.*niño.*obeso|poliuria.*baja.*peso.*niño.*glicemia|diabetes.*niño.*poliuria', ['Diabetes mellitus tipo 1', 'Endocrinología pediátrica', 'Pediatría']),
    (r'desobediente.*berrinches|pataleta|trastorno oposicionista|muy desobediente.*niño|niño.*muy desobediente|rabietas.*insolente|rabietas.*oposición|no.*controlar.*rabietas', ['Trastorno oposicionista desafiante', 'Psiquiatría infantil', 'Pediatría']),
    (r'cojera.*niño|cojera|claudicación.*niño|marcha antálgica.*niño|no.*caminar.*niño|dejó de caminar', ['Ortopedia pediátrica', 'Reumatología pediátrica', 'Pediatría']),
    (r'fiebre sin foco|fiebre.*sin otros síntomas|fiebre.*sin foco.*niño|fiebre.*examen físico.*no aporta|decaimiento.*fiebre.*meses.*sin otros|fiebre.*llanto.*6 meses|fiebre.*llanto.*lactante|llanto fácil.*fiebre.*meses', ['Fiebre sin foco', 'Infectología pediátrica', 'Pediatría']),
    (r'artritis séptica|claudicación.*fiebre.*niño|fiebre.*claudicación.*niño|dolor.*articular.*fiebre.*niño', ['Artritis séptica', 'Ortopedia pediátrica', 'Pediatría']),
    (r'rendimiento escolar.*bajó|bajó.*notas|bajo rendimiento.*niño|caída.*notas.*escolar|rendimiento escolar.*bajo', ['Bajo rendimiento escolar', 'Neurodesarrollo', 'Pediatría']),
    (r'sinovitis transitoria|claudicación.*infección respiratoria.*niño|cojera.*posterior.*infección', ['Sinovitis transitoria', 'Ortopedia pediátrica', 'Pediatría']),
    (r'P\/E.*p[0-9]|P\/T.*percentil|índice.*peso.*edad|evaluación.*antropométrica|peso.*talla.*niño.*normal|talla.*peso.*5 años.*niño.*4', ['Evaluación nutricional', 'Crecimiento y desarrollo', 'Pediatría']),
    (r'suplemento.*hierro.*término|hierro.*niño.*término|profilaxis.*hierro.*lactante|qué.*edad.*suplementar.*hierro', ['Suplementación de hierro', 'Nutrición del lactante', 'Pediatría']),
    (r'educación en salud.*preescolar|programa.*salud.*escolar|salud infantil.*prevención|primera prioridad.*salud.*niño', ['Salud infantil', 'Salud pública pediátrica', 'Pediatría']),
    (r'licencia postnatal|período.*postnatal.*madre|fuero maternal|período de licencia.*madre', ['Salud materno-infantil', 'Legislación sanitaria', 'Pediatría']),
    (r'impétigo|vesículas flácidas.*periumbilical|lesiones.*costra.*melicérica|vesículas.*pústulas.*costra.*niño|pápulares.*pustulares.*vesiculares.*costras', ['Impétigo', 'Dermatología pediátrica', 'Infectología pediátrica', 'Pediatría']),
    (r'molluscum|lesiones solevantadas.*indoloras.*milímetros|lesiones.*ombligo.*milímetros.*niño', ['Molluscum contagiosum', 'Dermatología pediátrica', 'Pediatría']),
    (r'dermatitis.*pañal|eritema.*pañal|zona del pañal|rash.*pañal', ['Dermatitis del pañal', 'Dermatología pediátrica', 'Pediatría']),
    (r'celulitis periorbitaria|enrojecimiento periocular|enrojecimiento periorbitario|celulitis orbitaria|eritema periocular|eritema alrededor.*ojo', ['Celulitis periorbitaria', 'ORL pediátrica', 'Oftalmología pediátrica', 'Pediatría']),
    (r'epistaxis.*niño|sangrado nasal.*niño', ['Epistaxis', 'ORL pediátrica', 'Pediatría']),
    (r'escoliosis|giba costal|desviación.*eje.*vertebral|curva.*vertebral', ['Escoliosis', 'Ortopedia pediátrica', 'Pediatría']),
    (r'vicios de refracción|miopía|hipermetropía|astigmatismo.*niño', ['Vicios de refracción', 'Oftalmología pediátrica', 'Pediatría']),
    (r'epifisiolisis|dolor.*ingle.*obeso.*adolescente|epifisis.*cadera.*adolescente|marcha antiálgica.*cadera.*adolescente', ['Epifisiolisis', 'Ortopedia pediátrica', 'Pediatría']),
    (r'déficit de IgA|deficiencia.*IgA|inmunodeficiencia.*IgA', ['Inmunodeficiencia por déficit de IgA', 'Inmunología pediátrica', 'Pediatría']),
    (r'atresia biliar|colestasis neonatal|ictericia.*neonatal.*prolongada|bilirrubina.*directa.*neonatal', ['Atresia biliar', 'Hepatología pediátrica', 'Neonatología', 'Pediatría']),
    (r'atresia duodenal|doble burbuja|imagen.*doble burbuja', ['Atresia duodenal', 'Cirugía neonatal', 'Neonatología', 'Pediatría']),
    (r'Henoch|Schönlein|Schonlein|púrpura.*HSP|hematuria.*dolor abdominal.*exantema.*flancos|púrpura.*hematuria.*artritis', ['Púrpura de Henoch-Schönlein', 'Reumatología pediátrica', 'Nefrología pediátrica', 'Pediatría']),
    (r'fiebre tifoidea|Salmonella typhi|Widal|hemograma.*tifoidea|leucopenia.*linfocitosis.*fiebre', ['Fiebre tifoidea', 'Infectología pediátrica', 'Pediatría']),
    (r'hernia umbilical.*niño|hernia.*umbilical.*anillo|anillo herniario.*niño', ['Hernia umbilical', 'Cirugía pediátrica', 'Pediatría']),
    (r'síndrome hemolítico urémico|\bSHU\b|oliguria.*cuadro diarreico.*creatinina', ['Síndrome hemolítico urémico', 'Nefrología pediátrica', 'Pediatría']),
    (r'regresión.*desarrollo|perdió habilidades.*niño|dejó de caminar.*aprendido|dejó de hacerlo.*desde hace', ['Regresión del desarrollo', 'Neuropediatría', 'Pediatría']),
    (r'TCE.*niño|trauma.*cráneo.*niño|caída.*golpe.*cabeza.*niño|golpe.*cabeza.*niño.*cayó|golpe.*cabeza.*niño.*bicicleta|golpe.*cabeza.*niño.*cefalea|indicación.*hospitalización.*niño.*golpe|hospitalización.*golpe.*cabeza', ['TCE pediátrico', 'Urgencias pediátricas', 'Pediatría']),
    (r'RCP.*niño|paro.*cardiorrespiratorio.*niño|masaje cardíaco.*niño|reanimación.*niño', ['RCP pediátrica', 'Urgencias pediátricas', 'Pediatría']),
    (r'fractura.*tallo verde|fractura.*antebrazo.*niño|fractura.*diáfisis.*niño', ['Fractura pediátrica', 'Ortopedia pediátrica', 'Pediatría']),
    (r'primera causa.*muerte.*mayores.*un año|causa.*muerte.*niños.*mayores.*año', ['Mortalidad en la infancia', 'Salud pública pediátrica', 'Pediatría']),
    (r'hormona.*crecimiento fetal|IGF.*fetal|somatomedina|insulina.*hormona.*crecimiento fetal', ['Fisiología fetal', 'Obstetricia', 'Endocrinología']),
    (r'aspiración meconial|síndrome aspiración.*meconial|\bSAM\b|meconio.*factor riesgo|factor.*riesgo.*meconio', ['Síndrome de aspiración meconial', 'Neonatología', 'Pediatría']),
    (r'policitemia neonatal|poliglobulia neonatal|hematocrito.*elevado.*recién nacido', ['Policitemia neonatal', 'Neonatología', 'Pediatría']),
    (r'primera causa.*muerte neonatal|causa.*muerte neonatal|mortalidad neonatal.*causa', ['Mortalidad neonatal', 'Neonatología', 'Salud pública pediátrica', 'Pediatría']),
    (r'anemia normocítica.*niño.*4 meses|anemia.*normocítica.*hemoglobina.*niño|hemoglobina.*fetal|anemia.*fisiológica', ['Anemia fisiológica del lactante', 'Hematología pediátrica', 'Pediatría']),
    (r'trastorno afectivo-separación|llanto.*colegio.*difícil consolar|ansiedad.*separación.*niño', ['Ansiedad de separación', 'Psiquiatría infantil', 'Pediatría']),
    # Nuevas reglas pediátricas
    (r'fibrosis quística|heces esteatorreicas.*neumonías|mal incremento.*ponderal.*esteatorreic|test del sudor|\bCFTR\b', ['Fibrosis quística', 'Neumología pediátrica', 'Gastroenterología pediátrica', 'Pediatría']),
    (r'sinovitis transitoria|claudicación.*post.*infección.*respiratoria|cojera.*sin fiebre.*semana.*infección|claudicación.*buenas condiciones.*leve dolor', ['Sinovitis transitoria', 'Ortopedia pediátrica', 'Pediatría']),
    (r'artritis séptica.*cadera|claudicación.*fiebre.*40|claudicación.*fiebre.*decaído.*dolor.*movilización|dolor.*movilización.*cadera.*fiebre', ['Artritis séptica', 'Ortopedia pediátrica', 'Infectología pediátrica', 'Pediatría']),
    (r'fiebre sin foco|fiebre.*sin otros síntomas.*examen.*no aporta|lactante.*fiebre.*no presenta.*síntomas', ['Fiebre sin foco', 'Infectología pediátrica', 'Pediatría']),
    (r'poliuria.*baja de peso.*niño|glicemia.*250.*niño|niño.*obeso.*poliuria.*baja de peso|diabético.*tipo 1.*niño|niño.*diabetes.*tipo 1', ['Diabetes mellitus tipo 1', 'Endocrinología pediátrica', 'Pediatría']),
    (r'trastorno adaptativo|rendimiento escolar.*separación.*padres|retraído.*agresivo.*separación.*padres|notas.*separación.*padres|notas.*quiebre.*matrimonial|baja.*notas.*padres.*separación|rendimiento escolar.*retraído.*agresivo|bajado.*rendimiento escolar.*retraído', ['Trastorno adaptativo', 'Psiquiatría infantil', 'Pediatría']),
    (r'molluscum|lesiones solevantadas.*color amari.*ojos|pápulas.*ombligo.*central.*niño', ['Molluscum contagiosum', 'Dermatología pediátrica', 'Pediatría']),
    (r'celulitis orbitaria|celulitis periorbitaria|enrojecimiento periocular|eritema periocular.*sinusitis', ['Celulitis orbitaria', 'ORL pediátrica', 'Oftalmología pediátrica', 'Pediatría']),
    (r'impétigo|vesículas flácidas.*turbio.*costras mielicéricas|costras melicéricas|pénfigo escolar', ['Impétigo', 'Infección cutánea pediátrica', 'Pediatría']),
    (r'enuresis|orinarse.*duerme|orinarse en la cama|orinarse mientras duerme', ['Enuresis', 'Urología pediátrica', 'Pediatría']),
    (r'atresia biliar|ictericia.*heces.*decoloradas.*neonatal|ictericia.*orina oscura.*neonatal', ['Atresia biliar', 'Cirugía pediátrica', 'Neonatología', 'Pediatría']),
    (r'escoliosis|giba costal.*desviación.*eje', ['Escoliosis', 'Ortopedia pediátrica', 'Pediatría']),
    (r'fiebre tifoidea|hemograma tífico|leucopenia.*desviación.*izquierda.*fiebre prolongada', ['Fiebre tifoidea', 'Infectología pediátrica', 'Pediatría']),
    (r'epifisiolisis|deslizamiento.*epífisis|adolescente.*obeso.*dolor.*ingle.*cojear|dolor.*cadera.*obeso.*adolescente', ['Epifisiolisis de cadera', 'Ortopedia pediátrica', 'Pediatría']),
    (r'púrpura.*Schönlein|Henoch|hematuria.*dolor abdominal.*exantema.*extremidades|púrpura.*extremidades.*artralgias', ['Púrpura Schönlein-Henoch', 'Vasculitis pediátrica', 'Nefrología pediátrica', 'Pediatría']),
    (r'déficit.*\bIgA\b|inmunodeficiencia.*\bIgA\b|\bIgA\b.*deficiencia', ['Inmunodeficiencia por déficit de IgA', 'Inmunología pediátrica', 'Pediatría']),
    (r'regresión.*hitos|había aprendido.*caminar.*dejado|perdió.*habilidad.*niño|niño.*dejó de.*hablar|niño.*dejó de.*caminar', ['Regresión del desarrollo', 'Neuropediatría', 'Pediatría']),
    (r'hernia umbilical.*niño|anillo herniario.*niño', ['Hernia umbilical', 'Cirugía pediátrica', 'Pediatría']),
    (r'vicios de refracción|miopía.*niño|hipermetropía.*niño|astigmatismo.*niño|refracción.*pediatría', ['Vicios de refracción', 'Oftalmología pediátrica', 'Pediatría']),
    (r'eritema.*mejillas.*artralgias|eritema.*mejillas.*fiebre.*astenia|eritema.*mejillas.*exantema.*tronco.*extremidades', ['Eritema infeccioso', 'Enfermedades exantemáticas', 'Pediatría']),
    (r'suplementar.*hierro.*niños|suplementación.*hierro.*nacidos de término|suplemento.*hierro.*meses', ['Suplementación de hierro', 'Nutrición del lactante', 'Pediatría']),
    (r'licencia postnatal|postnatal parental|fuero maternal|legislación.*postnatal', ['Licencia postnatal', 'Salud pública', 'Legislación sanitaria']),
    (r'picadura.*avispa|reacción alérgica.*picadura|anafilaxia.*picadura', ['Reacción a picadura', 'Alergología pediátrica', 'Pediatría']),
    (r'policitemia neonatal|poliglobulia neonatal|hematocrito.*elevado.*recién nacido', ['Policitemia neonatal', 'Hematología neonatal', 'Neonatología']),
    (r'síndrome.*aspiración meconial|aspiración de meconio|líquido.*teñido.*meconio|meconio.*aspiración', ['Síndrome de aspiración meconial', 'Neonatología', 'Pediatría']),
    (r'educación en salud.*preescolar|programa.*salud.*preescolar|primera prioridad.*prevenir.*niños', ['Salud del preescolar', 'Salud pública pediátrica', 'Pediatría']),
    (r'peso.*talla.*un año de vida|mide.*pesa.*niño.*año|cuánto mide.*niño.*año', ['Crecimiento y desarrollo', 'Antropometría pediátrica', 'Pediatría']),
    (r'principal hormona.*crecimiento fetal|hormona.*crecimiento.*feto|insulina.*crecimiento fetal', ['Fisiología fetal', 'Endocrinología pediátrica', 'Obstetricia']),
    (r'anemia normocítica.*niño.*meses|hemoglobina.*baja.*niño.*4 meses|anemia.*4 meses.*lactante', ['Anemia fisiológica del lactante', 'Hematología pediátrica', 'Pediatría']),
    (r'síndrome purpúrico.*petequias.*equimosis generalizadas|petequias.*equimosis.*generaliz.*conducta', ['Trombocitopenia', 'Hematología pediátrica', 'Pediatría']),
    # Inmunodeficiencia combinada severa / SCID
    (r'linfopenia.*candidiasis|candidiasis.*linfopenia|inmunodeficiencia.*linfopenia|\bSCID\b|linfopenia.*neumonía.*candidiasis', ['Inmunodeficiencia combinada severa', 'Inmunología pediátrica', 'Pediatría']),
    # HDA pediátrica
    (r'ortostatismo.*deposiciones negras|deposiciones negras.*taquicardia.*niño|melena.*niño|hematemesis.*niño', ['Hemorragia digestiva alta', 'Urgencias pediátricas', 'Gastroenterología pediátrica', 'Pediatría']),
    # Deshidratación grave
    (r'cuadro diarreico.*severo.*sopor|sopor profundo.*deshidratación|deshidratación.*sopor|deshidratación.*grave.*sopor', ['Deshidratación grave', 'Gastroenterología pediátrica', 'Pediatría']),
    # Mortalidad por grupo etario
    (r'primera causa.*muerte.*adolescentes|causa.*muerte.*adolescentes|principal causa.*muerte.*adolescentes', ['Mortalidad en adolescentes', 'Salud pública pediátrica', 'Pediatría']),
    (r'primera causa.*muerte.*edad escolar|principal causa.*muerte.*escolar|causa.*muerte.*escolares', ['Mortalidad escolar', 'Salud pública pediátrica', 'Pediatría']),
    (r'primera causa.*muerte fetal tardía|causa.*muerte fetal tardía|causa.*muerte fetal', ['Mortalidad fetal', 'Obstetricia', 'Salud pública']),
    # Artritis pediátrica
    (r'primera causa.*artritis.*pediátrica|causa.*artritis.*niños|artritis.*causa más frecuente.*niño|artritis más frecuente.*niño', ['Artritis pediátrica', 'Reumatología pediátrica', 'Pediatría']),
    # Pensamiento del escolar / desarrollo cognitivo
    (r'pensamiento del escolar.*caracteriza|característica.*pensamiento.*escolar|operaciones concretas.*escolar|escolar.*operaciones concretas', ['Desarrollo cognitivo', 'Neurodesarrollo', 'Pediatría']),
    # Alimentación del lactante (tipo de leche)
    (r'qué tipo de leche.*12 meses|tipo de leche.*un año|niño.*leche.*cumplir.*año|lactante.*12 meses.*qué.*leche|suspender.*leche materna.*recomienda', ['Alimentación del lactante', 'Nutrición del lactante', 'Pediatría']),
    # Turner syndrome
    (r'cuello.*corto.*ancho.*tórax.*ancho.*plano|síndrome de Turner|tórax.*escudo.*baja talla.*niña|pterigium coli.*niña|pterigium.*cuello.*niña', ['Síndrome de Turner', 'Genética médica', 'Pediatría']),
    # Modificación insulina / DM1 manejo
    (r'modificación.*insulina cristalina.*NPH|hipoglucemias repetidas.*insulina|dosis.*insulina.*hipoglucemia|insulina.*ajuste.*hipoglucemia', ['Manejo de insulina', 'Diabetes mellitus tipo 1', 'Endocrinología']),

    # TCE pediátrico — fix pattern order (niño before golpe)
    (r'niño.*golpe.*cabeza|niño.*golpea.*cabeza|niño.*se golpe.*cabeza|niño.*atropellado|paciente.*18 meses.*caída.*irritable|caída a nivel.*irritable.*niño|atropellado.*golpe.*cabeza|paciente.*atropellado.*cabeza', ['TCE pediátrico', 'Urgencias pediátricas', 'Pediatría']),
    # Desarrollo psicomotor — more hitos
    (r'fija mirada|sentarse con apoyo.*objetos|monosílabos.*niño|niño.*monosílabos|sostener la cabeza.*objeto|sostener.*cabeza.*objeto|se pone de pie afirmado.*muebles|desconoce a los ext|caracteriza.*niño.*10 meses|niño.*10 meses.*opción|niño de 10 meses.*caracteriza|niño.*caminar.*silla.*desvestirse|camina.*sube.*silla.*ayuda.*desvestirse', ['Desarrollo psicomotor', 'Neurodesarrollo', 'Pediatría']),
    # Sífilis en genitales — "lesión ulcerada" pattern
    (r'lesión ulcerada.*no dolorosa.*indurada.*labio|lesión ulcerada.*no dolorosa.*labio|lesión ulcerada.*indurada.*no dolorosa.*genital|lesión.*indurada.*no dolorosa.*zona genital|trabajadora sexual.*lesión.*indolora|promiscuidad sexual.*lesión ulcerada', ['Sífilis', 'ITS', 'Infectología']),
    # Alimentación pediátrica — preparación leche, alimentos prohibidos
    (r'preparación.*leche.*niño.*meses|preparación.*leche.*7 meses|alimento.*no.*ofrecer.*niño.*10 meses|alimento.*no.*ofrecerse.*niño|alimento.*niño.*10 meses|cuál.*alimentos.*niño.*meses|niño cumplió un año.*leche|qué tipo de leche.*recibir.*niño|leche materna se caracteriza|características.*leche materna', ['Alimentación complementaria', 'Nutrición del lactante', 'Pediatría']),
    # Adrenarquia / mal olor axilar — niño BEFORE olor
    (r'niño.*olor axilar|mal olor axilar|olor.*axilar.*deporte.*niño|olor axilar.*causa.*niño', ['Adrenarquia', 'Desarrollo puberal', 'Endocrinología pediátrica', 'Pediatría']),
    # Cardiopatía cianótica — con typo "cadiopatía"
    (r'cardiopatía cianótica|cadiopatías?.*cianótica|NO corresponde.*cardiopatía cianótica|cardiopatía.*NO corresponde', ['Cardiopatía congénita', 'Cardiología pediátrica', 'Pediatría']),
    # Cáncer mama — nódulo duro, inversión pezón, 60 años
    (r'nódulo mamario.*consistencia dura|nódulo mamario.*dura.*lento crecimiento|nódulo mamario.*inversión.*pezón|nódulo.*retracción.*pezón|nódulo mamario.*indoloro.*60 años', ['Cáncer de mama', 'Oncología', 'Ginecología']),
    # Mononucleosis infecciosa
    (r'linfocitos.*atípicos|monospot|mononucleosis|heterófilos|esplenomegalia.*adenopatías.*fiebre.*adolescente|linfocitosis.*atípicos.*hemograma|leucopenia.*85%.*linfocitos|2\.100 glóbulos blancos.*linfocitos|35\.000.*linfocitos.*atípicos', ['Mononucleosis infecciosa', 'Infectología pediátrica', 'Pediatría']),
    # Dispareunia
    (r'dispareunia|dolor.*relaciones sexuales.*mujer|dolor.*coito.*mujer|dolor.*penetración.*mujer', ['Dispareunia', 'Ginecología', 'Disfunción sexual']),
    # DG adicional — glicemia 115, "diabetes mellitus gestacional"
    (r'glicemia.*115.*embarazo|glicemia.*ayuno.*115|diagnóstico.*diabetes.*gestacional.*paciente|diabetes mellitus gestacional', ['Diabetes gestacional', 'Obstetricia', 'Endocrinología']),
    # Epifisiolisis — typo "inglee"
    (r'dolor en la inglee|inglee.*marcha|inglee.*adolescente', ['Epifisiolisis de cadera', 'Ortopedia pediátrica', 'Pediatría']),
    # Guillain-Barré pediátrico adicional — niño BEFORE debilidad
    (r'niño.*debilidad muscular.*generalizada.*progresiv|debilidad muscular.*generalizada.*progresiv|niño.*debilidad.*generalizada.*24 horas|debilidad.*impide.*caminar.*niño', ['Síndrome de Guillain-Barré', 'Neuropediatría', 'Neurología']),
    # Eritema infeccioso — patrón mejillas → tronco
    (r'exantema.*inició.*mejillas|exantema.*mejillas.*luego.*tronco|fiebre.*exantema.*mejillas.*niño', ['Eritema infeccioso', 'Enfermedades exantemáticas', 'Pediatría']),
    # SHU — oliguria + cuadro diarreico (sin requerir niño después)
    (r'oliguria.*cuadro diarreico|oliguria.*diarrea.*creatinina|creatinina.*4.*mg.*diarrea.*niño', ['Síndrome hemolítico urémico', 'Nefrología pediátrica', 'Pediatría']),
    # Síndrome nefrótico adicional
    (r'edema palpebral.*EEII|edema.*palpebral.*extremidades.*niño|edema.*párpados.*piernas.*niño|edema periorbitario.*niño', ['Síndrome nefrótico', 'Nefrología pediátrica', 'Pediatría']),
    # Fiebre sin foco / meningitis en lactante
    (r'fiebre.*40.*9 meses.*regulares condiciones|9 meses.*fiebre.*40|niño.*9 meses.*fiebre.*40.*regulares|niño.*2 meses.*decaimiento.*fiebre', ['Fiebre sin foco', 'Infectología pediátrica', 'Pediatría']),
    # Anemia en embarazo — hemoglobina 10
    (r'hemoglobina.*10.*embarazo|embarazo.*hemoglobina.*10 mg|hemoglobina.*10 mg.*dl.*embarazo|hemoglobina baja.*embarazo', ['Anemia en el embarazo', 'Hematología obstétrica', 'Obstetricia']),
    # Meningitis bacteriana (LCR) — truncated question
    (r'leucocitos.*predominio polimorfonuclear.*glucosa baja|leucocitos.*polimorfonuclear.*proteínas elevadas|Gram.*diplococos.*meningitis|glucosa.*baja.*proteínas.*elevadas.*LCR', ['Meningitis bacteriana', 'Infectología', 'Neurología']),
    # Torsión testicular adicional
    (r'dolor testicular.*hora.*evolución|dolor testicular.*brusco.*joven|dolor.*escroto.*brusco.*adolescente', ['Torsión testicular', 'Urgencia urológica pediátrica', 'Pediatría']),
    # Deshidratación — signos clínicos (sin requerir niño al final)
    (r'ojos.*hundidos.*mucosa seca|mucosa seca.*llanto.*diarrea|irritable.*ojos.*hundidos.*diarrea', ['Deshidratación', 'Gastroenterología pediátrica', 'Pediatría']),
    # Celulitis pierna — patrón simplificado
    (r'placa.*cm.*pierna.*niño|placa.*pierna.*eritema.*niño|fiebre.*placa.*pierna.*niño|lesión.*pierna.*placa.*eritema.*niño', ['Celulitis', 'Infectología pediátrica', 'Pediatría']),
    # Inmunodeficiencia IgG/inmunoglobulinas
    (r'déficit de inmunoglobulina G|déficit.*IgG|inmunodeficiencia.*inmunoglobulina G|manifestaciones.*déficit.*IgG|tipo de infecciones.*déficit.*inmunoglobulina', ['Inmunodeficiencia humoral', 'Inmunología pediátrica', 'Pediatría']),
    # Preeclampsia 31 semanas con cefalea
    (r'primigesta.*31 semanas.*cefalea|31 semanas.*cefalea progresiva.*embarazo|embarazo.*31 semanas.*cefalea.*malestar', ['Preeclampsia', 'Hipertensión en el embarazo', 'Obstetricia']),
    # Corioamnionitis — fiebre sin otros síntomas embarazo
    (r'embarazo.*29 semanas.*fiebre persistente.*sin presentar otros|fiebre.*sin causa aparente.*embarazo.*semanas', ['Corioamnionitis', 'Infección obstétrica', 'Obstetricia']),
    # Ansiedad de separación — jardín infantil y colegio
    (r'ansioso.*jardín infantil|llora.*jardín infantil|difícil de consolar.*jardín infantil|llora.*grita.*colegio.*difícil.*consolar|llora.*colegio.*no quiere separarse', ['Ansiedad de separación', 'Psiquiatría infantil', 'Pediatría']),
    # Medida 12 meses
    (r'cuánto mide.*12 meses|mide.*12 meses.*niño|talla.*12 meses.*promedio', ['Crecimiento y desarrollo', 'Antropometría pediátrica', 'Pediatría']),
    # EPI — dolor hipogástrico + dispareunia + edad fértil
    (r'edad fértil.*dolor hipogástrico.*dispareunia|dolor hipogástrico.*dispareunia.*semana', ['EPI', 'Infección ginecológica', 'Ginecología']),
    # Quiste ovárico — hallazgo ecográfico asintomático
    (r'asintomática.*ecografía transvaginal.*muestra|ecografía transvaginal.*imagen.*ovárica|lesión.*ovárica.*ecografía.*asintomática', ['Quiste ovárico', 'Ginecología', 'Patología ovárica']),
    # DG — afirmación FALSA
    (r'afirmación.*FALSA.*diabetes.*gestacional|FALSA.*diabetes mellitus gestacional|diabetes mellitus gestacional.*FALSA', ['Diabetes gestacional', 'Obstetricia', 'Endocrinología']),
    # Mordedura perro — "mordido" (no "mordedura")
    (r'mordido.*perro|perro.*mordió|mordido por su perro|perro.*mordió.*niño', ['Mordedura y rabia', 'Urgencias pediátricas', 'Infectología']),
    # Sinovitis transitoria — claudicación sin fiebre, sin infección previa
    (r'claudicación.*sin fiebre|claudicación.*no ha presentado fiebre|claudicación.*no.*fiebre|claudicación.*infección respiratoria', ['Sinovitis transitoria', 'Ortopedia pediátrica', 'Pediatría']),
    # Hernia umbilical — niño before hernia
    (r'niño.*hernia umbilical|hernia umbilical.*niño|hernia umbilical.*18 meses|hernia umbilical.*diámetro', ['Hernia umbilical', 'Cirugía pediátrica', 'Pediatría']),
    # Malabsorción con typo "malaabsorción"
    (r'malaabsorción intestinal|diagnóstico.*malaabsorción|examen.*diagnósticar.*malabsorción|diagnosticar.*malabsorción', ['Malabsorción', 'Gastroenterología pediátrica', 'Pediatría']),
    # Amenorrea — "ausencia de menstruación"
    (r'ausencia de menstruación|falta.*menstruación.*test.*embarazo.*negativo', ['Amenorrea', 'Trastorno menstrual', 'Ginecología']),
    # Control prenatal — "evaluar" edad gestacional
    (r'parámetro.*evaluar.*edad gestacional|parámetro.*para evaluar.*edad gestacional', ['Control prenatal', 'Diagnóstico obstétrico', 'Obstetricia']),
    # Peso fetal — "pesa un feto"
    (r'pesa.*feto.*semanas|cuán pesa.*feto|cuánto pesa.*feto', ['Control prenatal', 'Diagnóstico obstétrico', 'Obstetricia']),
    # PTI — epistaxis + petequias
    (r'epistaxis.*petequias|petequias.*epistaxis|niño.*epistaxis.*resfriado|epistaxis.*resfriado.*niño', ['PTI', 'Trombocitopenia', 'Hematología pediátrica', 'Pediatría']),
    # Talla baja — curva de crecimiento muy bajo
    (r'curva de crecimiento.*muy bajo|curva.*crecimiento.*bajo.*niño|muy bajo.*curva.*crecimiento', ['Talla baja', 'Déficit de crecimiento', 'Pediatría']),
    # Fisiología embarazo — "alteración...embarazo normal"
    (r'alteración.*parte.*embarazo normal|alteración.*embarazo normal|alteración.*ES parte.*embarazo', ['Fisiología del embarazo', 'Obstetricia']),
    # Neumonía pediátrica adicional — expectoración mucopurulenta
    (r'expectoración mucopurulenta.*fiebre|tos.*expectoración mucopurulenta|mucopurulenta.*niño', ['Neumonía pediátrica', 'Infección respiratoria', 'Pediatría']),
    # RCP pediátrica — niño before paro
    (r'niño.*paro cardiorrespiratorio|niño.*masaje cardíaco|niño.*reanimación cardiopulmonar', ['RCP pediátrica', 'Urgencias pediátricas', 'Pediatría']),
    # Gastroenteritis — diarrea explosiva
    (r'diarrea.*explosiva|diarrea abundante.*fiebre.*niño|diarrea explosiva.*abundante', ['Gastroenteritis aguda', 'Deshidratación', 'Gastroenterología pediátrica', 'Pediatría']),
    # Vulvovaginitis — flujo vaginal
    (r'aumento del flujo vaginal|flujo vaginal.*aumento|aumento.*flujo.*vaginal.*mujer', ['Vulvovaginitis', 'Infección ginecológica', 'Ginecología']),
    # Hiperemesis gravidarum — semana quinta (invertido orden)
    (r'semana quinta.*náuseas.*vómitos|semana.*quinta.*vómitos.*embarazo|desde.*semana.*quinta.*náuseas', ['Hiperemesis gravidarum', 'Obstetricia', 'Gastroenterología']),
    # Fiebre reumática — odinofagia + mejora + artritis posterior
    (r'odinofagia.*mejora.*artr|odinofagia.*espontáneamente.*fiebre.*artrit|odinofagia.*días.*mejora.*siete días.*artr', ['Fiebre reumática', 'Cardiología pediátrica', 'Pediatría']),
    # Intususcepción — deposiciones manchadas ropa
    (r'manchado.*ropa.*dolor abdominal|dolor abdominal.*manchado.*ropa|ha manchado.*ropa.*niño.*dolor', ['Intususcepción', 'Urgencia quirúrgica pediátrica', 'Pediatría']),
    # EII adolescente — deposiciones con sangre
    (r'dolor abdominal.*semanas.*deposiciones.*sangre|deposiciones con sangre.*adolescente.*dolor|deposiciones.*adolescente.*dolor abdominal.*semanas', ['Enfermedad inflamatoria intestinal', 'Gastroenterología', 'Coloproctología']),
    # Diarrea crónica — semanas en niño
    (r'diarrea intermitente.*semanas.*niño|diarrea.*6 semanas.*niño|diarrea.*4 semanas.*niño|paciente.*diarrea.*semanas.*sin elementos patológicos', ['Diarrea crónica', 'Gastroenterología pediátrica', 'Pediatría']),
    # Mastitis puerperal — parto reciente + dolor mamario
    (r'parto.*días.*dolor mamario|dolor mamario.*bilateral.*parto|primer parto.*días.*dolor mamario', ['Mastitis', 'Puerperio', 'Complicación puerperal', 'Obstetricia']),
    # Laringitis — tos disfónica con acento
    (r'tos disfónica|tos.*disfón', ['Laringitis obstructiva', 'Croup', 'Vía aérea', 'Pediatría']),
    # Sinovitis transitoria final — buenas condiciones + signos vitales normales + claudicación
    (r'claudicación.*buenas condiciones generales.*signos vitales normales|claudicación.*buenas condiciones generales.*cojea|niño.*claudicación.*buenas condiciones', ['Sinovitis transitoria', 'Ortopedia pediátrica', 'Pediatría']),
    # Celulitis pierna final — "placa...bordes bien defi[nidos]" or niño→fiebre→pierna→placa
    (r'niño.*fiebre.*pierna.*placa|placa.*bordes bien defi|placa.*diámetro.*bordes.*pierna', ['Celulitis', 'Infectología pediátrica', 'Pediatría']),
    # EII adolescente — "deposiciones sanguinolentas"
    (r'deposiciones.*sanguinolentas.*adolescente|adolescente.*deposiciones.*sanguinolentas|deposiciones líquidas sanguinolentas', ['Enfermedad inflamatoria intestinal', 'Gastroenterología', 'Coloproctología']),
    # Diarrea crónica final
    (r'diarrea intermitente.*sin elementos patológicos|diarrea.*hace 6 semanas|diarrea.*hace 4 semanas|diarrea.*patológicos.*semanas', ['Diarrea crónica', 'Gastroenterología pediátrica', 'Pediatría']),

    # ── GINECOLOGÍA ────────────────────────────────────────
    (r'mioma|leiomioma|fibroma uterino', ['Mioma uterino', 'Ginecología', 'Patología uterina']),
    (r'endometriosis|adenomiosis|endometrio ectópico|algia pélvica crónica.*cíclica|dolor pélvico.*cíclico.*progresivo|algia pélvica crónica.*ginecológico', ['Endometriosis', 'Ginecología', 'Dolor pélvico']),
    (r'cáncer.*cérvix|carcinoma.*cervical|cervicouterino|cáncer.*cuello.*uterino|cáncer de cuello|\bPAP\b|Papanicolaou|Papanicolau|\bVPH\b|virus papiloma|LIEAG|LIEBG|\bNIC\b|patología cervical|cáncer.*mayor precocidad|mayor precocidad.*cáncer', ['Cáncer cervicouterino', 'Ginecología oncológica', 'Ginecología']),
    (r'cáncer.*endometrio|carcinoma.*endometrial|adenocarcinoma.*uterino', ['Cáncer de endometrio', 'Ginecología oncológica', 'Ginecología']),
    (r'cáncer.*ovario|carcinoma.*ovárico|tumor.*ovario', ['Cáncer de ovario', 'Ginecología oncológica', 'Ginecología']),
    (r'cáncer.*mama|carcinoma.*mamario|tumor.*mama|mastectomía|mamografía|mamogafía|lesión.*espiculada.*mama|microcalcificaciones.*mama|nódulo.*espiculado.*mama', ['Cáncer de mama', 'Oncología', 'Ginecología']),
    (r'menopausia|climaterio|sofocos|bochornos|terapia hormonal.*menopausia|perimenopausia|terapia.*remplazo hormonal|terapia.*reemplazo hormonal|\bTRH\b|terapia hormonal de reemplazo|terapia de reemplazo hormonal|sequedad vaginal.*menopausia|reglas irregulares.*bochornos|bochornos.*sequedad', ['Menopausia', 'Climaterio', 'Ginecología']),
    (r'menorragia|metrorragia|hipermenorrea|sangrado uterino anormal|polimenorrea|oligomenorrea|amenorrea|ciclos menstruales.*sólo.*días|reglas.*muy abundantes.*coágulos|reglas.*cada 2.*meses|ciclos.*más cortos.*normal|ciclos irregulares.*adolescente|prueba de progesterona|diagnóstico de amenorrea', ['Trastorno menstrual', 'Ginecología', 'Endocrinología ginecológica']),
    (r'síndrome de ovario poliquístico|\bSOP\b|ovario poliquístico', ['Síndrome de ovario poliquístico', 'Endocrinología ginecológica', 'Ginecología']),
    (r'embarazo ectópico|tuba.*embarazo|gestación ectópica|Arias Stella|atraso menstrual.*positivo.*dolor|dolor.*anexial.*amenorrea|salpingooforectomía.*quiste|salpingooforectomia.*quiste|ausencia de gestación intrauterina|atraso menstrual.*promiscuidad|promiscuidad.*atraso menstrual|embarazo tubario|biopsia.*endometrial.*tubari|test.*embarazo.*positivo.*asintomática.*ecografía|atraso menstrual.*test.*embarazo.*positivo.*ecografía', ['Embarazo ectópico', 'Urgencia ginecológica', 'Ginecología']),
    (r'anticoncepción|anticonceptivo|\bDIU\b|dispositivos? intrauterinos?|dispositivo.*intrauterino|píldora|preservativo|planificación familiar|método anticonceptivo|contraindicación.*ACO|contraindicación.*anticonceptivo|goteo.*anticonceptivo|spoting|spotting.*anticonceptivo|efecto adverso.*anticonceptivo|contraceptivos? orales?|contraindicación.*contraceptivo', ['Anticoncepción', 'Planificación familiar', 'Ginecología']),
    (r'enfermedad pélvica inflamatoria|\bEPI\b|salpingitis|anexitis|proceso inflamatorio pélvico|factor.*riesgo.*proceso inflamatorio|promiscuidad sexual.*dolor.*hipogástrico|palpación hipogástrica.*palpación anexial.*movilización cervical|dolor.*palpación hipogástrica.*movilización cervical|movilización.*cervical.*subfebril|subfebril.*palpación hipogástrica.*palpación anexial|palpación anexial.*movilización cervical|movilización del cuello uterino.*dolor|dolor.*movilización del cuello uterino', ['EPI', 'Infección ginecológica', 'Ginecología']),
    (r'vulvovaginitis|vaginitis|candidiasis vaginal|vaginosis bacteriana|tricomoniasis|secreción blanco grisácea.*mal olor|clue cells|prurito vulvar.*leucorrea|leucorrea grumosa|leucorrea.*amoxicilina|leucorrea.*grisácea.*pescado', ['Vulvovaginitis', 'Infección ginecológica', 'Ginecología']),
    (r'prolapso genital|prolapso.*uterino|prolapso.*vaginal|cistocele|rectocele', ['Prolapso genital', 'Uroginecología', 'Ginecología']),
    (r'incontinencia urinaria|incontinencia de orina|escapes de orina|escapes.*orina|pérdida involuntaria de orina', ['Incontinencia urinaria', 'Uroginecología', 'Ginecología']),
    (r'hiperplasia endometrial|hiperplasia.*endometrio', ['Hiperplasia endometrial', 'Ginecología', 'Patología uterina']),
    (r'quiste.*ovario|quiste folicular|quiste.*cuerpo lúteo|tumor.*anexial|masa.*anexial', ['Quiste ovárico', 'Ginecología', 'Patología ovárica']),
    (r'infertilidad|esterilidad.*pareja|factor tubárico|factor masculino|intentando tener hijos', ['Infertilidad', 'Reproducción asistida', 'Ginecología']),
    (r'síndrome premenstrual|SPM|irritable.*días previos.*menstruación|5 días previos.*menstruación|síntomas.*días previos.*regla', ['Síndrome premenstrual', 'Ginecología', 'Endocrinología ginecológica']),
    (r'mastalgia|mastopatía fibroquística|múltiples nódulos.*mama|dolor mamario.*premenstrual|nódulos.*ambas mamas|asociación.*historia clínica.*patología mamaria|historia clínica.*patología.*mama', ['Patología mamaria benigna', 'Ginecología', 'Mastología']),
    (r'nódulo mamario.*bordes (lisos|regulares)|nódulo mamario.*se moviliza|fibroadenoma|nódulo mamario.*indoloro.*sólido|nódulo mamario.*fácil de movilizar', ['Fibroadenoma', 'Patología mamaria benigna', 'Ginecología']),
    (r'sinusorragia|sangrado.*contacto.*cervical|sangrado.*post coital', ['Sinusorragia', 'Ginecología', 'Patología cervical']),
    (r'período fértil|días fértiles|días.*ciclo.*ovulación|ciclo.*fértil se extiende', ['Ciclo menstrual', 'Fisiología reproductiva', 'Ginecología']),
    (r'mejor pronóstico.*cáncer|cáncer.*mejor pronóstico|pronóstico.*cáncer.*ginecológico', ['Oncología ginecológica', 'Ginecología oncológica', 'Ginecología']),
    (r'sangrado genital fuera.*ciclo|sangrado genital.*post menopausia|sangrado.*postmenopáusico', ['Sangrado uterino anormal', 'Ginecología oncológica', 'Ginecología']),
    (r'sífilis.*genital|lesión ulcerada.*no dolorosa.*indurada.*genital|úlcera.*no dolorosa.*genital|chancro.*genital|úlcera.*indurada.*labio', ['Sífilis', 'ITS', 'Infectología']),
    (r'factor.*riesgo.*cáncer.*endometrio|factor.*riesgo.*endometrio', ['Cáncer de endometrio', 'Ginecología oncológica', 'Ginecología']),
    # EPI etiología
    (r'agentes causales.*procesos inflamatorios pelvianos|etiología.*procesos inflamatorios pelvianos|bacterias.*EPI|agentes.*EPI|microorganismos.*inflamatorios pelvianos', ['EPI', 'Infección ginecológica', 'Ginecología']),
    # Ciclo menstrual (conocimiento teórico)
    (r'respecto.*ciclo menstrual|ciclo menstrual.*verdadero|ciclo menstrual.*FALSO|durante el ciclo menstrual|fases.*ciclo menstrual|hormona.*ciclo menstrual|LH.*FSH.*ciclo|período fértil.*ciclo', ['Ciclo menstrual', 'Fisiología reproductiva', 'Ginecología']),
    # Melasma / cloasma — fix: "embarazo" comes BEFORE "máculas hiperpigmentadas" in text
    (r'máculas hiperpigmentadas.*mejillas.*embarazo|embarazo.*máculas hiperpigmentadas|cloasma|melasma.*embarazo|máculas hiperpigmentadas.*mejillas', ['Melasma', 'Dermatología', 'Obstetricia']),
    # HTA crónica en embarazo (< 20 semanas)
    (r'presiones arteriales elevadas.*16 semanas|hipertensión.*16 semanas.*embarazo|HTA.*16 semanas|hipertensión arterial.*primera mitad.*embarazo', ['HTA crónica en el embarazo', 'Hipertensión en el embarazo', 'Obstetricia']),

    # ── OBSTETRICIA ────────────────────────────────────────
    (r'preeclampsia|eclampsia|preclamsia|hipertensión.*embarazo|HELLP|tinitus.*fotopsias.*embarazo|cefalea.*embarazo.*hipertensión|reflejos rotulianos.*embarazo|presión arterial.*embarazo|presión arterial.*semanas.*gestación|presión arterial.*primigesta|presión arterial.*multípara|presión arterial.*144|presión arterial.*148|presión arterial.*150|presión arterial.*160|presiones arteriales.*150|PA: 150|PA:.*150/100|reflejos osteotendíneos exaltados.*embarazo|reflejos osteotendíneos exaltados.*gestación|mejor predictor.*eclamsia', ['Preeclampsia', 'Hipertensión en el embarazo', 'Obstetricia']),
    (r'diabetes gestacional|diabetes.*embarazo|intolerancia.*glucosa.*embarazo|glicemia.*ayuno.*embarazada|glicemia.*108.*embarazo|test.*tolerancia.*glucosa.*embarazo|polihidramnios.*glicemia|tolerancia.*glucosa.*75 gramos|TTOG.*75|75 gramos.*glucosa.*embarazo|glicemia.*120.*minutos.*embarazo|glicemia de ayuno.*108|glicemia.*108 mg/dl', ['Diabetes gestacional', 'Obstetricia', 'Endocrinología']),
    (r'placenta previa|sangrado.*tercer trimestre|hemorragia anteparto', ['Placenta previa', 'Hemorragia obstétrica', 'Obstetricia']),
    (r'desprendimiento.*placenta|DPPNI|abruptio placentae', ['DPPNI', 'Hemorragia obstétrica', 'Obstetricia']),
    (r'trabajo de parto|dilatación|borramiento|contracciones.*regulares|expulsivo|período.*expulsivo', ['Trabajo de parto', 'Atención del parto', 'Obstetricia']),
    (r'cesárea|parto por cesárea|indicación.*cesárea', ['Cesárea', 'Vía del parto', 'Obstetricia']),
    (r'parto pretérmino|parto prematuro|amenaza.*parto pretérmino|tocolisis|tocolítico|contracciones.*33 semanas|33 semanas.*contracciones uterinas|contracciones.*20 semanas', ['Parto pretérmino', 'Prematurez', 'Obstetricia']),
    (r'rotura.*membranas|\bRPM\b|\bRPMO\b|amniorrea|\bRPO\b|test de cristalización|pérdida de líquido claro.*genitales|líquido claro.*olor.*cloro.*genitales|salida de líquido claro.*genitales|factores de riesgo.*rotura prematura ovular|rotura prematura ovular', ['Rotura de membranas', 'Obstetricia', 'Complicación obstétrica']),
    (r'hemorragia postparto|\bHPP\b|atonía uterina|alumbramiento|primera causa.*hemorragia puerperal|hemorragia.*parto vaginal.*útero.*ombligo|primera causa.*muerte materna|mortalidad materna|muerte materna.*Chile|inercia uterina|manejo.*inercia.*uterina|fármaco.*inercia', ['Hemorragia postparto', 'Obstetricia', 'Urgencia obstétrica']),
    (r'aborto|pérdida gestacional|amenaza.*aborto|aborto séptico|aborto incompleto', ['Aborto', 'Pérdida gestacional', 'Obstetricia']),
    (r'mola hidatiforme|enfermedad trofoblástica|coriocarcinoma|embarazo molar|síntoma.*molar|hemorragia.*molar', ['Enfermedad trofoblástica', 'Obstetricia oncológica', 'Obstetricia']),
    (r'sufrimiento fetal|\bRCIU\b|restricción crecimiento intrauterino|retraso del crecimiento intrauterino|bienestar fetal|\bNST\b|monitorización fetal|registro basal no estresante|disminución.*movimientos fetales|percepción.*movimientos fetales', ['Bienestar fetal', 'RCIU', 'Obstetricia']),
    (r'presentaci[oó]n.*pod[aá]lica|versión cefálica|parto en podálica|presentaci[oó]n.*opci[oó]n.*parto|presentaciones.*opci[oó]n.*parto|opci[oó]n de parto vaginal|sin opci[oó]n.*parto vaginal|contraindicaci[oó]n.*parto vaginal', ['Presentación podálica', 'Distocia', 'Obstetricia']),
    (r'presentación de cara|punto de reparo.*cara|presentación.*cara.*mentón', ['Presentación de cara', 'Distocia', 'Obstetricia']),
    (r'screening prenatal|TORCH|toxoplasmosis.*embarazo|rubéola.*embarazo|CMV.*embarazo', ['Control prenatal', 'Infección en embarazo', 'Obstetricia']),
    (r'semana de gestación|FUR|fecha última regla|ecografía.*primer trimestre|ecografía obstétrica|parámetro.*estimar.*edad gestacional|edad gestacional.*embarazo avanzado|biometría fetal|saco gestacional.*ecografía transvaginal|edad gestacional.*saco gestacional|desde qué.*saco gestacional', ['Control prenatal', 'Diagnóstico obstétrico', 'Obstetricia']),
    (r'streptococo.*grupo B|GBS.*embarazo|profilaxis intraparto|\bSGB\b.*embarazo|cultivo vaginal.*SGB|profilaxis.*SGB', ['Streptococo grupo B', 'Infección perinatal', 'Obstetricia']),
    (r'puerperio|postparto|mastitis|endometritis postparto|puérpera.*fiebre.*dolor mamario|puérpera.*aumento.*volumen.*mama|puérpera.*dolor.*mama.*eritema|puérpera.*eritema.*mama|puérpera.*aumento.*volumen.*axila|puérpera.*dolor torácico.*disnea.*brusca|dolor torácico.*disnea.*brusca.*puérpera', ['Puerperio', 'Complicación puerperal', 'Obstetricia']),
    (r'analgesia.*parto|epidural.*parto|anestesia.*obstétrica', ['Analgesia obstétrica', 'Atención del parto', 'Obstetricia']),
    (r'síntoma principal de la colestasia|colestasis.*embarazo|pruerito palmoplantar|prurito palmoplantar|embarazo.*prurito|prurito.*embarazo|prurito.*gestante|prurito.*embarazada|colestasia intrahepét', ['Colestasis intrahepática del embarazo', 'Obstetricia', 'Hepatología']),
    (r'embarazo gemelar|gestación gemelar|signo de la.*T.*embarazo|bicorial|monocorial|dos sacos gestacionales|gemelos', ['Embarazo gemelar', 'Obstetricia', 'Alto riesgo obstétrico']),
    (r'isoinmunización Rh|Coombs.*embarazo|Coombs.*indirecto.*embarazo|Coombs indir|Rh negativa.*embarazo|Rh negativo.*embarazo|inmunoglobulina anti-D|anti-D.*embarazo|Rh\(-\).*embarazo|Rh\(-\).*semanas', ['Isoinmunización Rh', 'Obstetricia', 'Inmunohematología']),
    (r'corioamnionitis|infección.*intraamniótica|dolor.*palpación uterina.*fiebre.*embarazo|fiebre.*taquicardia.*dolor.*palpación uterina', ['Corioamnionitis', 'Infección obstétrica', 'Obstetricia']),
    (r'VDRL.*embarazo|sífilis.*embarazo|sífilis.*gestante|VDRL.*semanas.*embarazo|asintomática.*embarazo.*VDRL|VDRL.*positivo.*embarazo', ['Sífilis en el embarazo', 'Infectología obstétrica', 'Obstetricia']),
    (r'hiperemesis gravidarum|náuseas.*vómitos.*embarazo.*intensos|náuseas.*vómitos.*incoercibles.*embarazo|vómitos.*embarazo.*semana.*quinta', ['Hiperemesis gravidarum', 'Obstetricia', 'Gastroenterología']),
    (r'acretismo placentario|placenta.*acreta', ['Acretismo placentario', 'Obstetricia', 'Alto riesgo obstétrico']),
    (r'oligohidramnios|oligohidroamnios|causas.*oligohidr|índice.*líquido amniótico.*bajo', ['Oligohidramnios', 'Patología del líquido amniótico', 'Obstetricia']),
    (r'alfafetoproteína|déficit tubo neural|diagnóstico prenatal.*marcador|marcador.*prenatal', ['Diagnóstico prenatal', 'Obstetricia', 'Genética']),
    (r'translucencia nucal|TN.*fetal|aumento.*translucencia', ['Cribado prenatal', 'Diagnóstico prenatal', 'Obstetricia']),
    (r'polihidroamnios|polihidramnios|causa.*polihidro|NO es.*causa.*polihidro', ['Polihidramnios', 'Patología del líquido amniótico', 'Obstetricia']),
    (r'causa.*anemia.*embarazo|anemia.*frecuente.*embarazo|anemia.*durante.*embarazo|hemoglobina.*11.*VCM.*embarazo|hematocrito.*33.*embarazo|embarazo.*hemoglobina.*11|embarazo.*hematocrito.*33', ['Anemia en el embarazo', 'Hematología obstétrica', 'Obstetricia']),
    (r'antibiótico.*riesgo.*embarazo|riesgo.*antibiótico.*embarazo|fármaco.*contraindicado.*embarazo', ['Farmacología en el embarazo', 'Obstetricia', 'Farmacología']),
    (r'salida de escaso líquido genital filante|líquido filante.*sangre|show.*parto|inicio.*trabajo.*parto.*escaso.*sangre', ['Inicio de trabajo de parto', 'Atención del parto', 'Obstetricia']),
    (r'test de tolerancia.*contracciones|RBNE.*no reactivo|FCF.*lpm.*variabilidad.*desaceleraciones|bradicardia fetal.*contracciones', ['Monitoreo fetal', 'Bienestar fetal', 'Obstetricia']),
    (r'qué.*disminuye.*embarazo|parámetro.*disminuye.*normalmente.*embarazo|alteración.*normal.*embarazo|cambio.*fisiológico.*embarazo|cambios.*embarazo normal|embarazo normal.*EXCEPTO|son cambios.*embarazo', ['Fisiología del embarazo', 'Obstetricia']),
    (r'asociación.*edad gestacional|hallazgo.*edad gestacional|identifique.*edad gestacional|feto pesa|pesa aproximadamente.*semanas|peso.*fetal.*semanas|semanas.*gestación.*pesa', ['Control prenatal', 'Diagnóstico obstétrico', 'Obstetricia']),
    # Distocia / presentaciones anómalas
    (r'presentación de frente|punto de referencia.*frente|presentaci.*frente.*punto|punto de reparo.*Bregma|presentación.*Bregma|bregma.*presentación', ['Distocia de presentación', 'Distocia', 'Obstetricia']),
    # Macrosomía fetal
    (r'feto grande para la edad gestacional|macrosomía fetal|macrosomía|GEG.*define.*como|recién nacido.*grande.*gestación', ['Macrosomía fetal', 'Obstetricia', 'Diabetes gestacional']),
    # Asfixia neonatal
    (r'signo.*asfixia neonatal|asfixia neonatal|asfixia.*perinatal|hipoxia neonatal', ['Asfixia neonatal', 'Neonatología', 'Pediatría']),
    # Desaceleraciones tardías
    (r'etiología.*desaceleraciones tardías|causa.*desaceleraciones tardías|mecanismo.*desaceleraciones tardías|desaceleraciones tardías.*causa', ['Bienestar fetal', 'Monitoreo fetal', 'Obstetricia']),

    # ── CARDIOLOGÍA ────────────────────────────────────────
    (r'insuficiencia cardíaca|IC.*sistólica|IC.*diastólica|fracción.*eyección|FEVI|edema agudo.*pulmón', ['Insuficiencia cardíaca', 'Cardiología', 'EUNACOM']),
    (r'infarto.*miocardio|\bIAM\b|IAMCEST|IAMSEST|síndrome coronario agudo|\bSCA\b|angina inestable', ['Síndrome coronario agudo', 'Cardiopatía isquémica', 'Cardiología']),
    (r'fibrilación auricular|\bFA\b|flutter auricular|arritmia supraventricular', ['Fibrilación auricular', 'Arritmia', 'Cardiología']),
    (r'taquicardia.*ventricular|fibrilación ventricular|muerte súbita|desfibrilación', ['Arritmia ventricular', 'Muerte súbita', 'Cardiología']),
    (r'bradicardia|bloqueo.*AV|bloqueo.*rama|marcapasos', ['Bradiarritmia', 'Trastorno de conducción', 'Cardiología']),
    (r'hipertensión arterial|\bHTA\b|presión arterial.*elevada|antihipertensivo|IECA|ARA II|calcioantagonista', ['Hipertensión arterial', 'Cardiología', 'EUNACOM']),
    (r'estenosis.*aórtica|insuficiencia aórtica|estenosis.*mitral|insuficiencia mitral|valvulopatía', ['Valvulopatía', 'Cardiología', 'Cirugía cardíaca']),
    (r'endocarditis|endocarditis infecciosa|vegetación.*válvula', ['Endocarditis infecciosa', 'Infección cardíaca', 'Cardiología']),
    (r'pericarditis|derrame pericárdico|taponamiento cardíaco', ['Pericarditis', 'Patología pericárdica', 'Cardiología']),
    (r'tromboembolismo pulmonar|\bTEP\b|embolia pulmonar|\bTVP\b|trombosis venosa profunda', ['TEP', 'Tromboembolismo', 'Cardiología']),
    (r'disección.*aórtica|aneurisma.*aorta', ['Disección aórtica', 'Patología aórtica', 'Cardiología']),
    (r'estatina|atorvastatina|simvastatina|dislipidemia|hipercolesterolemia|LDL|HDL', ['Dislipidemia', 'Riesgo cardiovascular', 'Cardiología']),

    # ── ENDOCRINOLOGÍA ─────────────────────────────────────
    (r'diabetes mellitus tipo 1|DM1|diabetes.*tipo 1|insulina.*dependiente', ['Diabetes mellitus tipo 1', 'Endocrinología', 'EUNACOM']),
    (r'diabetes mellitus tipo 2|DM2|diabetes.*tipo 2|metformina|glipizida|hipoglicemiante oral', ['Diabetes mellitus tipo 2', 'Endocrinología', 'EUNACOM']),
    (r'hipoglicemia|glicemia baja|coma hipoglicémico|glucagón|sudoración.*temblor.*agresividad.*inconciencia|sudoración.*temblor.*actitud agresiva.*inconciencia|diabético.*insulina.*temblor.*sudoración', ['Hipoglicemia', 'Endocrinología', 'Urgencia endocrina']),
    (r'cetoacidosis diabética|\bCAD\b|acidosis.*diabética|cuerpos cetónicos', ['Cetoacidosis diabética', 'Endocrinología', 'Urgencia endocrina']),
    (r'hipotiroidismo|levotiroxina|\bTSH\b.*elevada|T4.*bajo|mixedema|alteración menstrual.*hipotiro|hipotiroid|hipotiroíd', ['Hipotiroidismo', 'Tiroides', 'Endocrinología']),
    (r'hipertiroidismo|tirotoxicosis|\bTSH\b.*suprimida|T4.*elevada|Graves|bocio tóxico|propiltiouracilo|metimazol', ['Hipertiroidismo', 'Tiroides', 'Endocrinología']),
    (r'tiroides.*nódulo|nódulo tiroideo|bocio nodular|cáncer.*tiroides|carcinoma.*tiroideo', ['Nódulo tiroideo', 'Cáncer de tiroides', 'Endocrinología']),
    (r'cortisol|Cushing|hipercortisolismo|insuficiencia suprarrenal|Addison|ACTH', ['Patología suprarrenal', 'Endocrinología', 'Eje hipotálamo-hipófisis']),
    (r'osteoporosis|densitometría|DEXA|fractura osteoporótica|bifosfonato|calcio.*vitamina D', ['Osteoporosis', 'Metabolismo óseo', 'Endocrinología']),
    (r'hipercalcemia|hiperparatiroidismo|\bPTH\b.*elevada|hipocalcemia|hipoparatiroidismo', ['Calcio y paratiroides', 'Endocrinología', 'Metabolismo mineral']),
    (r'obesidad|\bIMC\b|índice de masa corporal|sobrepeso|bariatría', ['Obesidad', 'Endocrinología', 'Nutrición']),
    (r'hipófisis|prolactina|acromegalia|\bGH\b.*adulto|adenoma.*hipofisario', ['Patología hipofisaria', 'Endocrinología', 'Neuroendocrinología']),

    # ── GASTROENTEROLOGÍA ──────────────────────────────────
    (r'úlcera.*gástrica|úlcera.*péptica|úlcera.*duodenal|H. pylori|Helicobacter|gastritis', ['Úlcera péptica', 'Gastroenterología', 'EUNACOM']),
    (r'reflujo gastroesofágico|ERGE|pirosis|esofagitis|omeprazol|\bIBP\b', ['ERGE', 'Gastroenterología', 'Patología esofágica']),
    (r'pancreatitis aguda|pancreatitis crónica|lipasa|amilasa', ['Pancreatitis', 'Gastroenterología', 'Patología pancreática']),
    (r'cirrosis|hepatitis crónica|fibrosis hepática|hipertensión portal|varices esofágicas|ascitis.*hepática', ['Cirrosis hepática', 'Hepatología', 'Gastroenterología']),
    (r'hepatitis.*viral|hepatitis A|hepatitis B|hepatitis C|\bVHB\b|\bVHC\b|\bVHA\b', ['Hepatitis viral', 'Hepatología', 'Infectología']),
    (r'colecistitis|colelitiasis|cólico biliar|litiasis biliar|colangitis|coledocolitiasis', ['Patología biliar', 'Gastroenterología', 'Cirugía general']),
    (r'enfermedad de Crohn|colitis ulcerosa|enfermedad inflamatoria intestinal|\bEII\b|diarrea.*semanas.*adolescente|adolescente.*diarrea.*semanas|diarrea.*sanguinolenta.*adolescente|adolescente.*diarrea.*sanguinolenta|diarrea crónica.*adolescente', ['Enfermedad inflamatoria intestinal', 'Gastroenterología', 'Coloproctología']),
    (r'colon irritable|síndrome.*intestino irritable|\bSII\b|colon espástico', ['Síndrome de intestino irritable', 'Gastroenterología', 'Funcional digestivo']),
    (r'cáncer.*colon|cáncer.*recto|cáncer colorrectal|adenocarcinoma.*colon|colonoscopia.*screening', ['Cáncer colorrectal', 'Gastroenterología oncológica', 'Oncología']),
    (r'cáncer.*gástrico|adenocarcinoma.*gástrico|cáncer.*estómago', ['Cáncer gástrico', 'Gastroenterología oncológica', 'Oncología']),
    (r'hemorragia digestiva alta|melena|hematemesis|HDA', ['Hemorragia digestiva alta', 'Urgencia gastroenterológica', 'Gastroenterología']),
    (r'hemorragia digestiva baja|rectorragia|hematoquezia|HDB', ['Hemorragia digestiva baja', 'Urgencia gastroenterológica', 'Gastroenterología']),
    (r'apendicitis|signo.*McBurney|dolor.*fosa ilíaca.*derecha', ['Apendicitis', 'Cirugía de urgencia', 'Cirugía general']),
    (r'íleo.*paralítico|obstrucción.*intestinal|abdomen agudo|laparotomía.*urgencia', ['Abdomen agudo', 'Cirugía de urgencia', 'Cirugía general']),

    # ── INFECTOLOGÍA ───────────────────────────────────────
    (r'tuberculosis|\bTBC\b|Mycobacterium tuberculosis|baciloscopia|Koch|tratamiento.*HRZE|rifampicina.*isoniazida', ['Tuberculosis', 'Infectología', 'EUNACOM']),
    (r'VIH|SIDA|HIV|AIDS|CD4|carga viral|antirretroviral|\bARV\b|\bTARV\b', ['VIH/SIDA', 'Infectología', 'Inmunología']),
    (r'neumonía.*comunitaria|\bNAC\b|Streptococcus pneumoniae|neumococo|neumonía.*adquirida', ['Neumonía comunitaria', 'Infectología', 'Neumología']),
    (r'meningitis|meningoencefalitis|rigidez de nuca|signos meníngeos|cuadro meníngeo|síndrome meníngeo|Kernig|Brudzinski|sopor.*fiebre.*lactante|fiebre.*sopor.*lactante|poco reactivo.*hipotónico.*fiebre|fiebre.*reticencia a alimentarse|rechazo alimentario.*letargia.*fiebre', ['Meningitis', 'Infectología', 'Neurología']),
    (r'sepsis|shock séptico|bacteriemia|SRIS|septicemia', ['Sepsis', 'Medicina intensiva', 'Infectología']),
    (r'endocarditis infecciosa|bacteriemia.*válvula', ['Endocarditis infecciosa', 'Infectología', 'Cardiología']),
    (r'\bITU\b|infección.*urinaria|cistitis|pielonefritis|E. coli.*urinaria|disuria|poliaquiuria|urocultivo', ['Infección urinaria', 'Infectología', 'Nefrología']),
    (r'dengue|zika|chikungunya|arbovirus|Aedes aegypti', ['Arbovirosis', 'Infectología', 'Salud pública']),
    (r'malaria|plasmodium|paludismo|fiebre palúdica', ['Malaria', 'Infectología', 'Medicina tropical']),
    (r'leptospirosis|ictericia.*fiebre|Weil', ['Leptospirosis', 'Infectología', 'Zoonosis']),
    (r'ITS|infección.*transmisión sexual|gonorrea|clamidia|sífilis|herpes genital|condiloma|chancro', ['Infección de transmisión sexual', 'Infectología', 'Ginecología']),
    (r'COVID|SARS-CoV|coronavirus', ['COVID-19', 'Infectología', 'Neumología']),

    # ── HEMATOLOGÍA ────────────────────────────────────────
    (r'anemia ferropénica|ferropenia|déficit.*hierro|ferritina baja|anemia.*microcítica', ['Anemia ferropénica', 'Hematología', 'EUNACOM']),
    (r'anemia.*megaloblástica|déficit.*vitamina B12|déficit.*folato|anemia macrocítica', ['Anemia megaloblástica', 'Hematología', 'Nutrición']),
    (r'anemia hemolítica|esferocitosis|drepanocitosis|talasemia|G6PD', ['Anemia hemolítica', 'Hematología', 'Eritropatía']),
    (r'leucemia|linfoma|mieloma|neoplasia hematológica|blastos', ['Neoplasia hematológica', 'Hematología oncológica', 'Oncología']),
    (r'leucemia linfática crónica|\bLLC\b|leucemia mieloide crónica|\bLMC\b', ['Leucemia crónica', 'Hematología oncológica', 'Oncología']),
    (r'leucemia aguda|leucemia linfoblástica|\bLLA\b|leucemia mieloide aguda|\bLMA\b', ['Leucemia aguda', 'Hematología oncológica', 'Oncología']),
    (r'linfoma de Hodgkin|linfoma no Hodgkin|Reed-Sternberg', ['Linfoma', 'Hematología oncológica', 'Oncología']),
    (r'trombocitopenia|púrpura trombocitopénic[oa]|\bPTI\b|plaquetas bajas|hemorragia.*plaquetas|púrpura petequial', ['Trombocitopenia', 'Hematología', 'Hemostasia']),
    (r'coagulación intravascular diseminada|\bCID\b|coagulopatía de consumo', ['CID', 'Coagulopatía', 'Hematología']),
    (r'hemofilia|enfermedad de von Willebrand|trastorno.*coagulación|tiempo de sangría', ['Trastorno de coagulación', 'Hematología', 'Hemostasia']),
    (r'transfusión|hemoderivados|banco de sangre|reacción transfusional', ['Transfusión sanguínea', 'Hematología', 'Medicina transfusional']),
    (r'anticoagulante|warfarina|heparina|HBPM|NOAC|rivaroxaban|apixaban', ['Anticoagulación', 'Hematología', 'Cardiología']),

    # ── NEUMOLOGÍA ─────────────────────────────────────────
    (r'\bEPOC\b|enfermedad pulmonar obstructiva|bronquitis crónica|enfisema|espirometría|obstrucción.*flujo aéreo', ['EPOC', 'Neumología', 'EUNACOM']),
    (r'asma bronquial|asma.*adulto|crisis.*asmática|broncodilatador|corticoide.*inhalado|salbutamol', ['Asma bronquial', 'Neumología', 'EUNACOM']),
    (r'derrame pleural|pleuritis|neumotórax|toracocentesis', ['Patología pleural', 'Neumología', 'Cirugía torácica']),
    (r'cáncer.*pulmón|carcinoma bronquial|nódulo pulmonar solitario|adenocarcinoma.*pulmón', ['Cáncer de pulmón', 'Oncología', 'Neumología']),
    (r'hipertensión pulmonar|cor pulmonale', ['Hipertensión pulmonar', 'Neumología', 'Cardiología']),
    (r'fibrosis pulmonar|enfermedad pulmonar intersticial|EPI pulmonar', ['Enfermedad pulmonar intersticial', 'Neumología', 'Reumatología']),
    (r'apnea.*sueño|SAHOS|polisomnografía|CPAP', ['Apnea del sueño', 'Neumología', 'Trastorno del sueño']),

    # ── NEFROLOGÍA ─────────────────────────────────────────
    (r'insuficiencia renal aguda|\bIRA\b|lesión renal aguda|\bLRA\b|creatinina.*elevada.*aguda', ['Lesión renal aguda', 'Nefrología', 'Medicina intensiva']),
    (r'enfermedad renal crónica|\bERC\b|insuficiencia renal crónica|\bIRC\b|diálisis|hemodiálisis', ['Enfermedad renal crónica', 'Nefrología', 'EUNACOM']),
    (r'glomerulonefritis|síndrome nefrítico|hematuria.*cilindros|proteinuria.*hematuria', ['Glomerulonefritis', 'Nefrología', 'Inmunología']),
    (r'hiperkalemia|hipokalemia|hiponatremia|hipernatremia|trastorno.*electrolítico', ['Trastorno electrolítico', 'Nefrología', 'Medicina interna']),
    (r'acidosis.*metabólica|alcalosis.*metabólica|acidosis.*respiratoria|alcalosis.*respiratoria|equilibrio ácido-base', ['Trastorno ácido-base', 'Nefrología', 'Medicina interna']),
    (r'litiasis renal|cólico renal|urolitiasis|nefrolitiasis|cálculo renal', ['Litiasis renal', 'Nefrología', 'Urología']),

    # ── NEUROLOGÍA ─────────────────────────────────────────
    (r'accidente cerebrovascular|\bACV\b|ictus|infarto.*cerebral|hemorragia.*cerebral|\bTIA\b|ataque isquémico transitorio', ['ACV', 'Neurología', 'Urgencia neurológica']),
    (r'cefalea.*tensional|migraña|cluster|cefalea en racimos|tratamiento.*cefalea', ['Cefalea', 'Neurología', 'EUNACOM']),
    (r'enfermedad de Parkinson|parkinsonismo|temblor.*reposo|levodopa|dopamina.*sustancia negra', ['Enfermedad de Parkinson', 'Neurología', 'Neurodegenerativo']),
    (r'alzheimer|demencia|deterioro cognitivo|declive cognitivo|inhibidor.*colinesterasa', ['Demencia', 'Neurología', 'Geriatría']),
    (r'esclerosis múltiple|EM.*placas|desmielinizante|resonancia.*esclerosis', ['Esclerosis múltiple', 'Neurología', 'Autoinmune']),
    (r'epilepsia.*adulto|status epilepticus|crisis.*gran mal|crisis.*petit mal|benzodiazepina.*crisis', ['Epilepsia', 'Neurología', 'Urgencia neurológica']),
    (r'polineuropatía|neuropatía periférica|síndrome de Guillain-Barré|neuropatía.*diabética', ['Neuropatía periférica', 'Neurología', 'Electromiografía']),
    (r'miastenia gravis|unión neuromuscular|anticuerpos.*receptor acetilcolina', ['Miastenia gravis', 'Neurología', 'Enfermedades neuromusculares']),
    (r'lumbalgia|dolor.*lumbar|hernia.*discal|ciática|estenosis.*canal|radiculopatía', ['Lumbalgia', 'Neurología', 'Traumatología']),

    # ── REUMATOLOGÍA ───────────────────────────────────────
    (r'artritis reumatoide|AR.*articulaciones|factor reumatoide|anti-CCP', ['Artritis reumatoide', 'Reumatología', 'Autoinmune']),
    (r'lupus eritematoso sistémico|\bLES\b|anti-DNA|ANA.*positivo|mariposa.*malar', ['Lupus eritematoso sistémico', 'Reumatología', 'Autoinmune']),
    (r'espondiloartropatía|espondilitis anquilosante|HLA-B27|sacroilitis|artritis.*psoriásica', ['Espondiloartropatía', 'Reumatología', 'Autoinmune']),
    (r'gota|hiperuricemia|ácido úrico|tofos|artritis gotosa|colchicina|alopurinol', ['Gota', 'Reumatología', 'Metabolismo']),
    (r'artrosis|osteoartritis|desgaste.*articular|osteofitos|prótesis.*rodilla|prótesis.*cadera', ['Artrosis', 'Reumatología', 'Traumatología']),
    (r'fibromialgia|dolor.*difuso.*crónico|puntos gatillo', ['Fibromialgia', 'Reumatología', 'Dolor crónico']),
    (r'esclerodermia|esclerosis sistémica|fenómeno de Raynaud.*autoinmune', ['Esclerodermia', 'Reumatología', 'Autoinmune']),

    # ── PSIQUIATRÍA / SALUD MENTAL ─────────────────────────
    (r'depresión.*mayor|trastorno depresivo|antidepresivo|ISRS|fluoxetina|sertralina|episodio depresivo', ['Depresión', 'Psiquiatría', 'Salud mental']),
    (r'trastorno bipolar|manía|episodio maníaco|litio.*psiquiatría|valproato.*psiquiatría', ['Trastorno bipolar', 'Psiquiatría', 'Salud mental']),
    (r'esquizofrenia|psicosis|alucinaciones|delirios|antipsicótico|haloperidol|clozapina|risperidona', ['Esquizofrenia', 'Psicosis', 'Psiquiatría']),
    (r'trastorno.*ansiedad|ansiedad generalizada|fobia|pánico|benzodiacepina.*ansiedad', ['Trastorno de ansiedad', 'Psiquiatría', 'Salud mental']),
    (r'suicidio|ideación suicida|conducta suicida|intentó.*suicidio|riesgo suicida', ['Suicidio', 'Urgencia psiquiátrica', 'Psiquiatría']),
    (r'adicción|dependencia.*alcohol|alcoholismo|dependencia.*sustancias|síndrome de abstinencia|etilismo crónico', ['Adicciones', 'Psiquiatría', 'Salud pública']),
    (r'trastorno.*alimentario|anorexia|bulimia|atracones', ['Trastorno alimentario', 'Psiquiatría', 'Salud mental']),
    (r'trastorno de personalidad|personalidad esquizoide|personalidad borderline|personalidad antisocial', ['Trastorno de personalidad', 'Psiquiatría', 'Salud mental']),
    (r'fobia social|miedo.*situaciones sociales|ansiedad.*hablar en público|ansiedad.*rendir.*frente a otros', ['Fobia social', 'Trastorno de ansiedad', 'Psiquiatría']),
    (r'trastorno conversivo|síntoma.*neurológico.*sin.*orgánico|parálisis.*sin.*causa orgánica|trastorno.*somatomorfo', ['Trastorno somatomorfo', 'Psiquiatría', 'Salud mental']),
    (r'inquietud.*desasosiego.*insomnio.*hipocondría|hipocondría.*sin.*antecedentes.*psiquiátricos|hipocondría.*inicio.*tardío', ['Hipocondría', 'Trastorno somatomorfo', 'Psiquiatría']),
    (r'protrusión de lengua.*espasmo|tortícolis.*ingreso psiquiátrico|reacción extrapiramidal|distonía aguda.*antipsicótico', ['Reacción extrapiramidal', 'Psiquiatría', 'Farmacología']),
    (r'trastorno facticio|Munchausen|simula síntomas', ['Trastorno facticio', 'Psiquiatría', 'Salud mental']),
    (r'mecanismo de defensa|disociación.*trauma|disociación.*angustia', ['Mecanismos de defensa', 'Psicología clínica', 'Psiquiatría']),

    # ── GERIATRÍA ──────────────────────────────────────────
    (r'adulto mayor|anciano|geriatría|fragilidad.*anciano|síndrome geriátrico', ['Geriatría', 'Adulto mayor', 'Medicina interna']),
    (r'caída.*anciano|fractura.*cadera.*anciano|osteoporosis.*anciano', ['Caídas en el adulto mayor', 'Geriatría', 'Traumatología']),
    (r'delirium|confusión aguda.*anciano|síndrome confusional agudo', ['Delirium', 'Geriatría', 'Urgencia neurológica']),

    # ── URGENCIAS / MEDICINA DE EMERGENCIA ─────────────────
    (r'paro cardíaco|reanimación|RCP|reanimación cardiopulmonar|desfibrilación|amiodarona.*paro', ['Paro cardiorrespiratorio', 'Urgencias', 'RCP']),
    (r'shock.*hipovolémico|shock.*hemorrágico|hemorragia.*masiva|politraumatizado', ['Shock hipovolémico', 'Urgencias', 'Trauma']),
    (r'quemadura|superficie corporal.*quemada|regla de los 9', ['Quemaduras', 'Urgencias', 'Cirugía plástica']),
    (r'intoxicación|sobredosis|toxicología|antídoto|carbón activado', ['Intoxicación', 'Toxicología', 'Urgencias']),
    (r'anafilaxia|shock anafiláctico|reacción.*alérgica.*severa|epinefrina.*anafilaxia', ['Anafilaxia', 'Urgencias', 'Inmunología']),
    (r'trauma craneoencefálico|\bTCE\b|traumatismo.*cráneo|Glasgow|hipertensión intracraneal', ['TCE', 'Urgencias neurológicas', 'Neurocirugía']),

    # ── DERMATOLOGÍA ───────────────────────────────────────
    (r'melanoma|carcinoma.*basocelular|carcinoma.*espinocelular|cáncer.*piel|queratosis actínica', ['Cáncer de piel', 'Dermatología oncológica', 'Dermatología']),
    (r'psoriasis|placas eritematosas.*descamativas', ['Psoriasis', 'Dermatología', 'Autoinmune']),
    (r'dermatitis.*atópica|eccema atópico|piel seca.*niño|prurigo', ['Dermatitis atópica', 'Dermatología', 'Alergia']),
    (r'acné|comedones|Propionibacterium', ['Acné', 'Dermatología', 'Adolescencia']),
    (r'herpes zóster|zóster|varicela.*adulto|neuralgia postherpética', ['Herpes zóster', 'Dermatología', 'Infectología']),
    (r'celulitis.*piel|erisipela|infección.*piel y partes blandas', ['Infección de piel', 'Dermatología', 'Infectología']),

    # ── TRAUMATOLOGÍA / ORTOPEDIA ──────────────────────────
    (r'fractura.*fémur|fractura.*cadera|fractura.*muñeca|fractura.*húmero|fractura.*radio', ['Fractura', 'Traumatología', 'Ortopedia']),
    (r'fractura.*columna|lesión.*medular|paraplejia|tetraplejia', ['Lesión medular', 'Traumatología', 'Neurocirugía']),
    (r'esguince|luxación|rotura.*ligamento|LCA|menisco', ['Traumatismo articular', 'Traumatología', 'Ortopedia']),

    # ── ONCOLOGÍA ──────────────────────────────────────────
    (r'quimioterapia|citostático|neoplasia|metástasis|estadio.*cáncer|TNM', ['Oncología', 'Quimioterapia', 'Medicina interna']),
    (r'radioterapia|irradiación.*tumor', ['Radioterapia', 'Oncología', 'Medicina interna']),

    # ── SALUD PÚBLICA / EPIDEMIOLOGÍA ──────────────────────
    (r'epidemiología|incidencia|prevalencia|sensibilidad|especificidad|valor predictivo|VPP|VPN|razón de verosimilitud', ['Epidemiología', 'Bioestadística', 'Salud pública']),
    (r'tamizaje|screening.*poblacional|programa.*prevención', ['Tamizaje', 'Prevención', 'Salud pública']),
    (r'vacunación.*adulto|programa.*inmunización.*adulto|esquema.*adulto', ['Inmunización adulto', 'Salud pública', 'Infectología']),
    (r'notificación.*obligatoria|ENO|enfermedad.*notificación|vigilancia epidemiológica', ['Vigilancia epidemiológica', 'Salud pública', 'EUNACOM']),
    (r'\bAPS\b|atención primaria|CESFAM|médico de familia|consultorio', ['Atención primaria', 'Salud familiar', 'Salud pública']),
    (r'\bGES\b|garantía.*explícita|AUGE|patología.*GES', ['GES/AUGE', 'Salud pública', 'Sistema de salud chileno']),
    (r'FONASA|ISAPRE|sistema.*salud.*Chile|seguro.*salud', ['Sistema de salud chileno', 'Salud pública', 'EUNACOM']),

    # ── FARMACOLOGÍA ───────────────────────────────────────
    (r'farmacocinética|biodisponibilidad|vida media|distribución.*fármaco|metabolismo.*hepático.*fármaco', ['Farmacocinética', 'Farmacología', 'Medicina básica']),
    (r'reacción adversa.*medicamento|\bRAM\b|efectos secundarios', ['Reacción adversa', 'Farmacología', 'Seguridad del paciente']),
    (r'interacción.*medicamento|interacción.*fármaco', ['Interacción farmacológica', 'Farmacología', 'Seguridad del paciente']),

    # ── FALLBACK: tópico general por palabras clave ─────────
    (r'diagnóstico diferencial|cuál.*diagnóstico.*probable|cuál.*diagnóstico.*más probable', ['Diagnóstico diferencial', 'Medicina interna', 'EUNACOM']),
    (r'tratamiento.*elección|droga.*elección|primera línea.*tratamiento|manejo inicial', ['Terapéutica', 'Medicina interna', 'EUNACOM']),
    (r'fisiopatología|mecanismo.*patogenia|patogénesis', ['Fisiopatología', 'Medicina básica', 'EUNACOM']),
]

def generate_tags(question_text: str, extra_context: str = '', specialty: str = '') -> str:
    """Generate comma-separated tags from question text using rule-based matching."""
    # Normalize newlines to spaces so patterns like 'baja fisiológica.*peso' don't break on multiline text
    text = (question_text + ' ' + extra_context).replace('\n', ' ').replace('\r', ' ')
    text = ' '.join(text.split())  # collapse multiple spaces
    
    matched_tags = []
    seen = set()
    for pattern, tags in RULES:
        if re.search(pattern, text, re.IGNORECASE | re.DOTALL):
            for tag in tags:
                if tag.lower() not in seen:
                    matched_tags.append(tag)
                    seen.add(tag.lower())
            if len(matched_tags) >= 6:
                break
    
    if not matched_tags:
        # Fall back to the module specialty (e.g. "Pediatría") instead of useless "Medicina"
        fallback = specialty if specialty else 'Medicina'
        matched_tags = [fallback, 'EUNACOM']
    
    return ', '.join(matched_tags[:6])


def get_question_text(q: dict) -> str:
    """Use ONLY the question stem for tagging."""
    return q.get('pregunta') or q.get('question') or ''


def tag_question_list(questions: list, specialty: str = '') -> int:
    """Tag ALL question dicts in place (always overwrites). Returns count tagged."""
    count = 0
    for q in questions:
        if not isinstance(q, dict):
            continue
        text = get_question_text(q)
        # Use question's own topic field as best fallback, then module specialty
        fallback = q.get('topic') or q.get('category') or specialty
        if text.strip():
            q['tags'] = generate_tags(text, specialty=fallback)
            count += 1
    return count


if __name__ == '__main__':
    BASE = '/Volumes/Install macOS Sequoia/Eunacom/eunacom-app-v2/public/data'
    tagged_count = 0
    skipped_count = 0

    # Map filename keywords → specialty name for fallback tagging
    SPECIALTY_MAP = {
        'cardiologia': 'Cardiología',
        'endocrinologia': 'Endocrinología',
        'gastroenterologia': 'Gastroenterología',
        'hematologia': 'Hematología',
        'infectologia': 'Infectología',
        'neumologia': 'Neumología',
        'nefrologia': 'Nefrología',
        'neurologia': 'Neurología',
        'reumatologia': 'Reumatología',
        'psiquiatria': 'Psiquiatría',
        'geriatria': 'Geriatría',
        'dermatologia': 'Dermatología',
        'traumatologia': 'Traumatología',
        'pediatria': 'Pediatría',
        'ginecologia': 'Ginecología',
        'obstetricia': 'Obstetricia',
        'cirugia': 'Cirugía',
        'oftalmologia': 'Oftalmología',
        'otorrino': 'Otorrinolaringología',
        'urologia': 'Urología',
        'salud_publica': 'Salud pública',
        'salud-publica': 'Salud pública',
        'farmacologia': 'Farmacología',
        'medicina_interna': 'Medicina interna',
    }

    def specialty_from_filename(fname: str) -> str:
        fname_lower = fname.lower()
        for key, val in SPECIALTY_MAP.items():
            if key in fname_lower:
                return val
        return ''

    def tag_question_list(questions: list, specialty: str = '') -> int:
        """Tag ALL question dicts in place (always overwrites). Returns count tagged."""
        count = 0
        for q in questions:
            if not isinstance(q, dict):
                continue
            text = get_question_text(q)
            if text.strip():
                q_specialty = q.get('topic') or q.get('subtopic') or specialty
                q['tags'] = generate_tags(text, specialty=q_specialty)
                count += 1
        return count

    # 1. Process prueba files
    print('=== Processing pruebas/ ===')
    prueba_dir = os.path.join(BASE, 'pruebas')
    for fname in sorted(os.listdir(prueba_dir)):
        if not fname.endswith('.json') or fname == 'index.json':
            continue
        fpath = os.path.join(prueba_dir, fname)
        with open(fpath) as f:
            data = json.load(f)
        count = 0
        pruebas = data.get('pruebas', [])
        specialty = specialty_from_filename(fname)
        for prueba in pruebas:
            count += tag_question_list(prueba.get('questions', []), specialty=specialty)
        if count > 0:
            with open(fpath, 'w') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f'  {fname}: +{count} tags')
            tagged_count += count
        else:
            skipped_count += 1

    # 2. Process questionDB.json
    print('=== Processing questionDB.json ===')
    db_path = os.path.join(BASE, 'questionDB.json')
    with open(db_path) as f:
        db = json.load(f)
    questions = db if isinstance(db, list) else db.get('preguntas', db.get('questions', []))
    count = tag_question_list(questions)
    if count > 0:
        with open(db_path, 'w') as f:
            json.dump(db, f, ensure_ascii=False, indent=2)
        print(f'  questionDB.json: +{count} tags')
        tagged_count += count

    # 3. Process reconstrucciones/
    print('=== Processing reconstrucciones/ ===')
    recon_dir = os.path.join(BASE, 'reconstrucciones')
    for fname in sorted(os.listdir(recon_dir)):
        if not fname.endswith('.json'):
            continue
        fpath = os.path.join(recon_dir, fname)
        with open(fpath) as f:
            data = json.load(f)
        qs = data if isinstance(data, list) else data.get('preguntas', [])
        count = tag_question_list(qs)
        if count > 0:
            with open(fpath, 'w') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f'  {fname}: +{count} tags')
            tagged_count += count

    print(f'\n✅ DONE — Total questions tagged: {tagged_count}')
