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
    (r'vacuna|DTP|difteria|tétanos|pertussis|BCG|polio|sarampión|rubéola|paperas|varicela|hepatitis B|neumocócic|meningocócic|rotavirus|influenza|PAI|esquema de vacunación', ['Vacunas', 'Inmunización', 'Pediatría', 'EUNACOM']),
    (r'laringitis|croup|estridor|disfon|tos perruna|parainfluenza', ['Laringitis obstructiva', 'Croup', 'Vía aérea', 'Pediatría']),
    (r'espasmo.*masiv|síndrome de West|hipsarritmia|espasmo infantil', ['Síndrome de West', 'Epilepsia', 'Neuropediatría', 'Pediatría']),
    (r'convuls|epilepsia|crisis epiléptica|anticonvulsivante|fenobarbital|valproato|fenitoína', ['Epilepsia', 'Crisis convulsivas', 'Neurología', 'Pediatría']),
    (r'retraso mental|discapacidad intelectual|retardo del desarrollo', ['Retraso mental', 'Neurodesarrollo', 'Pediatría']),
    (r'lactante|recién nacido|neonato|prematuro|RNPT|RNT|reciennacido', ['Neonatología', 'Pediatría']),
    (r'ictericia neonatal|bilirrubina|kernícterus|fototerapia|exsanguinotransfusión', ['Ictericia neonatal', 'Hiperbilirrubinemia', 'Neonatología', 'Pediatría']),
    (r'sepsis neonatal|infección neonatal|estreptococo grupo B', ['Sepsis neonatal', 'Infección neonatal', 'Neonatología']),
    (r'diarrea aguda|deshidratación|SRO|suero oral|gastroenteritis aguda', ['Diarrea aguda', 'Deshidratación', 'Gastroenterología pediátrica', 'Pediatría']),
    (r'neumonía.*niño|bronconeumonía|bronquiolitis|VSR|virus sincicial', ['Infección respiratoria', 'Neumonía pediátrica', 'Pediatría']),
    (r'asma.*niño|sibilancias|broncoespasmo|obstrucción bronquial', ['Asma bronquial', 'Obstrucción bronquial', 'Pediatría']),
    (r'desnutrición|marasmo|kwashiorkor|malnutrición|déficit nutricional', ['Desnutrición', 'Nutrición pediátrica', 'Pediatría']),
    (r'talla baja|hipocrecimiento|hormona de crecimiento|déficit de GH|déficit estatural', ['Talla baja', 'Déficit de crecimiento', 'Endocrinología pediátrica', 'Pediatría']),
    (r'pubertad precoz|pubertad tardía|desarrollo puberal|Tanner', ['Desarrollo puberal', 'Pubertad', 'Endocrinología pediátrica', 'Pediatría']),
    (r'celíaca|intolerancia al gluten|enteropatía.*gluten', ['Enfermedad celíaca', 'Gastroenterología pediátrica', 'Pediatría']),
    (r'intususcepción|invaginación intestinal|obstrucción intestinal.*niño', ['Intususcepción', 'Urgencia quirúrgica pediátrica', 'Pediatría']),
    (r'testículo no descendido|criptorquidia|hidrocele|hernia inguinal.*niño', ['Genitourinario pediátrico', 'Cirugía pediátrica', 'Pediatría']),
    (r'cardiopatía congénita|comunicación.*interauricular|comunicación.*interventricular|\bCIA\b|\bCIV\b|Fallot|ductus|persistencia.*ductus|coartación|estenosis.*pulmonar|transposición.*grandes', ['Cardiopatía congénita', 'Cardiología pediátrica', 'Pediatría']),
    (r'soplo.*cardíaco|soplo.*sistólico|soplo.*diastólico', ['Soplo cardíaco', 'Semiología cardiovascular', 'Cardiología']),
    (r'fiebre reumática|carditis reumática|Jones|corea de Sydenham', ['Fiebre reumática', 'Cardiología pediátrica', 'Pediatría']),
    (r'ITU pediátrica|infección urinaria.*niño|pielonefritis.*niño|reflujo vesicoureteral', ['Infección urinaria pediátrica', 'Nefrología pediátrica', 'Pediatría']),
    (r'síndrome nefrótico|proteinuria|edema.*niño|hipoalbuminemia', ['Síndrome nefrótico', 'Nefrología pediátrica', 'Pediatría']),
    (r'maltrato infantil|abuso.*niño|violencia intrafamiliar|negligencia', ['Maltrato infantil', 'Pediatría social', 'Pediatría']),
    (r'TDAH|déficit atencional|hiperactividad|trastorno.*atención', ['TDAH', 'Neurodesarrollo', 'Pediatría']),
    (r'autismo|trastorno del espectro autista|TEA', ['Autismo', 'Neurodesarrollo', 'Pediatría']),
    (r'anemia.*niño|ferropenia.*niño|déficit de hierro.*niño', ['Anemia ferropénica', 'Hematología pediátrica', 'Pediatría']),

    # ── GINECOLOGÍA ────────────────────────────────────────
    (r'mioma|leiomioma|fibroma uterino', ['Mioma uterino', 'Ginecología', 'Patología uterina']),
    (r'endometriosis|adenomiosis|endometrio ectópico', ['Endometriosis', 'Ginecología', 'Dolor pélvico']),
    (r'cáncer.*cérvix|carcinoma.*cervical|cervicouterino|\bPAP\b|Papanicolaou|\bVPH\b|virus papiloma|LIEAG|LIEBG|\bNIC\b', ['Cáncer cervicouterino', 'Ginecología oncológica', 'Ginecología']),
    (r'cáncer.*endometrio|carcinoma.*endometrial|adenocarcinoma.*uterino', ['Cáncer de endometrio', 'Ginecología oncológica', 'Ginecología']),
    (r'cáncer.*ovario|carcinoma.*ovárico|tumor.*ovario', ['Cáncer de ovario', 'Ginecología oncológica', 'Ginecología']),
    (r'cáncer.*mama|carcinoma.*mamario|tumor.*mama|mastectomía|mamografía', ['Cáncer de mama', 'Oncología', 'Ginecología']),
    (r'menopausia|climaterio|sofocos|terapia hormonal.*menopausia|perimenopausia', ['Menopausia', 'Climaterio', 'Ginecología']),
    (r'menorragia|metrorragia|hipermenorrea|sangrado uterino anormal|polimenorrea|oligomenorrea|amenorrea', ['Trastorno menstrual', 'Ginecología', 'Endocrinología ginecológica']),
    (r'síndrome de ovario poliquístico|\bSOP\b|ovario poliquístico', ['Síndrome de ovario poliquístico', 'Endocrinología ginecológica', 'Ginecología']),
    (r'embarazo ectópico|tuba.*embarazo|gestación ectópica', ['Embarazo ectópico', 'Urgencia ginecológica', 'Ginecología']),
    (r'anticoncepción|anticonceptivo|DIU|píldora|preservativo|planificación familiar|método anticonceptivo', ['Anticoncepción', 'Planificación familiar', 'Ginecología']),
    (r'enfermedad pélvica inflamatoria|\bEPI\b|salpingitis|anexitis', ['EPI', 'Infección ginecológica', 'Ginecología']),
    (r'vulvovaginitis|vaginitis|candidiasis vaginal|vaginosis bacteriana|tricomoniasis', ['Vulvovaginitis', 'Infección ginecológica', 'Ginecología']),
    (r'prolapso.*uterino|prolapso.*vaginal|incontinencia urinaria.*mujer|cistocele|rectocele', ['Prolapso genital', 'Uroginecología', 'Ginecología']),
    (r'quiste.*ovario|quiste folicular|quiste.*cuerpo lúteo', ['Quiste ovárico', 'Ginecología', 'Patología ovárica']),
    (r'infertilidad|esterilidad.*pareja|factor tubárico|factor masculino', ['Infertilidad', 'Reproducción asistida', 'Ginecología']),

    # ── OBSTETRICIA ────────────────────────────────────────
    (r'preeclampsia|eclampsia|hipertensión.*embarazo|HELLP', ['Preeclampsia', 'Hipertensión en el embarazo', 'Obstetricia']),
    (r'diabetes gestacional|diabetes.*embarazo|intolerancia.*glucosa.*embarazo', ['Diabetes gestacional', 'Obstetricia', 'Endocrinología']),
    (r'placenta previa|sangrado.*tercer trimestre|hemorragia anteparto', ['Placenta previa', 'Hemorragia obstétrica', 'Obstetricia']),
    (r'desprendimiento.*placenta|DPPNI|abruptio placentae', ['DPPNI', 'Hemorragia obstétrica', 'Obstetricia']),
    (r'trabajo de parto|dilatación|borramiento|contracciones.*regulares|expulsivo|período.*expulsivo', ['Trabajo de parto', 'Atención del parto', 'Obstetricia']),
    (r'cesárea|parto por cesárea|indicación.*cesárea', ['Cesárea', 'Vía del parto', 'Obstetricia']),
    (r'parto pretérmino|parto prematuro|amenaza.*parto pretérmino|tocolisis', ['Parto pretérmino', 'Prematurez', 'Obstetricia']),
    (r'rotura.*membranas|\bRPM\b|\bRPMO\b|amniorrea', ['Rotura de membranas', 'Obstetricia', 'Complicación obstétrica']),
    (r'hemorragia postparto|\bHPP\b|atonía uterina|alumbramiento', ['Hemorragia postparto', 'Obstetricia', 'Urgencia obstétrica']),
    (r'aborto|pérdida gestacional|amenaza.*aborto|aborto séptico|aborto incompleto', ['Aborto', 'Pérdida gestacional', 'Obstetricia']),
    (r'mola hidatiforme|enfermedad trofoblástica|coriocarcinoma', ['Enfermedad trofoblástica', 'Obstetricia oncológica', 'Obstetricia']),
    (r'sufrimiento fetal|\bRCIU\b|restricción crecimiento intrauterino|bienestar fetal|\bNST\b|monitorización fetal', ['Bienestar fetal', 'RCIU', 'Obstetricia']),
    (r'presentación.*podálica|versión cefálica|parto en podálica', ['Presentación podálica', 'Distocia', 'Obstetricia']),
    (r'screening prenatal|TORCH|toxoplasmosis.*embarazo|rubéola.*embarazo|CMV.*embarazo', ['Control prenatal', 'Infección en embarazo', 'Obstetricia']),
    (r'semana de gestación|FUR|fecha última regla|ecografía.*primer trimestre|ecografía obstétrica', ['Control prenatal', 'Diagnóstico obstétrico', 'Obstetricia']),
    (r'streptococo.*grupo B|GBS.*embarazo|profilaxis intraparto', ['Streptococo grupo B', 'Infección perinatal', 'Obstetricia']),
    (r'puerperio|postparto|lactancia.*madre|mastitis|endometritis postparto', ['Puerperio', 'Complicación puerperal', 'Obstetricia']),
    (r'analgesia.*parto|epidural.*parto|anestesia.*obstétrica', ['Analgesia obstétrica', 'Atención del parto', 'Obstetricia']),

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
    (r'hipoglicemia|glicemia baja|coma hipoglicémico|glucagón', ['Hipoglicemia', 'Endocrinología', 'Urgencia endocrina']),
    (r'cetoacidosis diabética|\bCAD\b|acidosis.*diabética|cuerpos cetónicos', ['Cetoacidosis diabética', 'Endocrinología', 'Urgencia endocrina']),
    (r'hipotiroidismo|levotiroxina|\bTSH\b.*elevada|T4.*bajo|mixedema', ['Hipotiroidismo', 'Tiroides', 'Endocrinología']),
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
    (r'enfermedad de Crohn|colitis ulcerosa|enfermedad inflamatoria intestinal|\bEII\b', ['Enfermedad inflamatoria intestinal', 'Gastroenterología', 'Coloproctología']),
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
    (r'meningitis|meningoencefalitis|rigidez de nuca|signos meníngeos|Kernig|Brudzinski', ['Meningitis', 'Infectología', 'Neurología']),
    (r'sepsis|shock séptico|bacteriemia|SRIS|septicemia', ['Sepsis', 'Medicina intensiva', 'Infectología']),
    (r'endocarditis infecciosa|bacteriemia.*válvula', ['Endocarditis infecciosa', 'Infectología', 'Cardiología']),
    (r'\bITU\b|infección.*urinaria|cistitis|pielonefritis|E. coli.*urinaria', ['Infección urinaria', 'Infectología', 'Nefrología']),
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
    (r'trombocitopenia|púrpura trombocitopénica|\bPTI\b|plaquetas bajas|hemorragia.*plaquetas', ['Trombocitopenia', 'Hematología', 'Hemostasia']),
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
    (r'adicción|dependencia.*alcohol|alcoholismo|dependencia.*sustancias|síndrome de abstinencia', ['Adicciones', 'Psiquiatría', 'Salud pública']),
    (r'trastorno.*alimentario|anorexia|bulimia|atracones', ['Trastorno alimentario', 'Psiquiatría', 'Salud mental']),

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
    text = (question_text + ' ' + extra_context).lower()
    
    matched_tags = []
    seen = set()
    
    for pattern, tags in RULES:
        if re.search(pattern, text, re.IGNORECASE):
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
    """Use ONLY the question stem (pregunta) for tagging.
    We exclude:
    - explicacion: full of differential diagnoses (wrong diseases get tagged)
    - opciones: wrong-answer options contain disease names that mislead the tagger
    - topic/subtopic: not always accurate
    Only the pregunta stem reliably describes what the question is about.
    """
    return q.get('pregunta', '') or ''


# ─────────────────────────────────────────────
# PROCESS ALL FILES
# ─────────────────────────────────────────────

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
            q['tags'] = generate_tags(text, specialty=specialty)
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


# 3. Process reconstrucciones/ (may already be tagged, but tag any missing)
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
            json.dump(data if isinstance(data, list) else data, f, ensure_ascii=False, indent=2)
        print(f'  {fname}: +{count} tags')
        tagged_count += count


print(f'\n✅ DONE — Total questions tagged: {tagged_count}')
