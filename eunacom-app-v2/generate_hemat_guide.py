#!/usr/bin/env python3
"""
Generate hematologia-high-yield.json + hematologia-anki.apkg
Reads modulo-1-hematologia.json, builds a structured study guide.
"""
import json, os, re, struct, time, zipfile, hashlib, sqlite3, tempfile, shutil
from lessons_hemat import LESSONS

OUT_DIR = "public/data/study-guides"
HEMAT_JSON = "public/data/pruebas/modulo-1-hematologia.json"

# ─────────────────────────────────────────────────────────
# TOPIC DEFINITIONS  (pearls + flashcards + question filter)
# ─────────────────────────────────────────────────────────
TOPICS = [
    {
        "id": "anemias-clasificacion",
        "title": "Clasificación & Comparación de Anemias",
        "icon": "🔴",
        "color": "#ef4444",
        "questionKeywords": ["ferropéni", "ferritin", "transferrin", "megaloblást", "hemolíti", "talasemi", "enfermedades cróni", "fisiológi", "macrocíti", "microcíti", "VCM", "anisocit"],
        "pearls": [
            {"cat": "COMPARACIÓN CLAVE", "pearl": "Ferropénica vs Enf. Crónicas: AMBAS tienen ferremia ↓. Las diferencias: ferropénica → ferritina ↓, transferrina ↑. Enf. crónicas → ferritina ↑ (reactante fase aguda), transferrina ↓."},
            {"cat": "TRUCO EUNACOM", "pearl": "Talasemia: microcítica-hipocrómica CON ferritina NORMAL o ALTA. Si piden perfil de hierro normal pero anemia microcítica → sospecha talasemia."},
            {"cat": "MORFOLOGÍA", "pearl": "Microcítica (VCM<80): Ferropénica, Talasemia, Enf. Crónicas (a veces). Normocítica: Hemolítica, Enf. Crónicas, Aplásica. Macrocítica (VCM>100): B12/Folatos, SMD, Hipotiroidismo."},
            {"cat": "HEMOLÍTICA", "pearl": "Marcadores de hemólisis: Reticulocitos ↑, LDH ↑, Bilirrubina INDIRECTA ↑, Haptoglobina ↓. Orina oscura = hemoglobinuria. Coombs directo (+) = autoinmune."},
            {"cat": "FERROPÉNICA ANEMIA EN HOMBRE", "pearl": "Anemia ferropénica en hombre adulto SIEMPRE requiere colonoscopía para descartar cáncer de colon. No solo dar hierro y ya."},
            {"cat": "ANEMIA FISIOLÓGICA LACTANTE", "pearl": "A los 2-4 meses Hb puede ser 9-10 g/dl — es NORMAL (fisiológica). No se trata. A los 10 meses con LM sin diversificación → ya es ferropénica."},
            {"cat": "ANEMIA FERROPÉNICA VCM TRAMPA", "pearl": "P7-Q1 trampa: Hto 30%, Hb 9.8 g/dl, GR 4.5 millones. Los GR están 'conservados' relativamente = células pequeñas (microcitosis). Anisocitosis +++ = ferropénica."},
            {"cat": "DURACIÓN TRATAMIENTO", "pearl": "Hierro en ferropénica: dar hasta normalizar hemoglobina + 3 meses más para reponer reservas. No parar al normalizar el hematocrito."},
            {"cat": "B12 vs FOLATOS", "pearl": "Ambos dan macrocitosis y pancitopenia. Diferencia: B12 da síntomas neurológicos (parestesias, ataxia). Folatos no. Respuesta reticulocitaria en 5-7 días si es nutritional."},
            {"cat": "POLIGLOBULIA SECUNDARIA vs VERA", "pearl": "Secundaria (hipoxia, EPOC, TBC): solo ↑ eritrocitos, blancos y plaquetas NORMALES. Policitemia Vera: PANCITOSIS (↑ las 3 series). Eritropoyetina ↓ en Vera (producción autónoma)."},
        ],
        "flashcards": [
            {"id": "hem-a1", "cloze": "En anemia ferropénica la ferritina está {{c1::baja}} y la transferrina está {{c2::alta}}. En anemia de enfermedades crónicas la ferritina está {{c3::alta}} y la transferrina está {{c4::baja}}."},
            {"id": "hem-a2", "cloze": "La talasemia es microcítica-hipocrómica pero a diferencia de la ferropénica, la ferritina está {{c1::normal o alta}}. El perfil de hierro {{c2::es normal}}."},
            {"id": "hem-a3", "cloze": "En anemia hemolítica autoinmune: reticulocitos {{c1::↑}}, LDH {{c2::↑}}, bilirrubina {{c3::indirecta ↑}}, haptoglobina {{c4::↓}}, Coombs directo {{c5::positivo}}."},
            {"id": "hem-a4", "cloze": "La anemia fisiológica del lactante ocurre entre los {{c1::2-4 meses}}, con Hb que puede llegar a {{c2::9-10 g/dl}} y es {{c3::normal, no requiere tratamiento}}."},
            {"id": "hem-a5", "cloze": "En anemia ferropénica de hombre adulto, además de dar sulfato ferroso, siempre se debe solicitar {{c1::colonoscopía}} para descartar {{c2::neoplasia de colon}}."},
            {"id": "hem-a6", "cloze": "Poliglobulia secundaria (por hipoxia): solo aumentan {{c1::los eritrocitos/Hcto}}. En policitemia vera aumentan {{c2::las 3 series (pancitosis)}}. La eritropoyetina en PV está {{c3::baja}}."},
            {"id": "hem-a7", "cloze": "VCM <80 fl = anemia {{c1::microcítica}}. Causas: {{c2::ferropénica, talasemia, enf. crónicas}}. VCM >100 fl = anemia {{c3::macrocítica}}. Causas: {{c4::B12, folatos, SMD, hipotiroidismo}}."},
            {"id": "hem-a8", "cloze": "Anemia hemolítica: la orina oscura se debe a {{c1::hemoglobinuria}}. La ictericia es de predominio {{c2::indirecto (bilirrubina no conjugada)}}. Los reticulocitos están {{c3::elevados}}."},
        ],
    },
    {
        "id": "leucemias",
        "title": "Leucemias: LLA vs LMA vs LLC vs LMC",
        "icon": "🩸",
        "color": "#f97316",
        "questionKeywords": ["leucemi", "blasto", "linfocit", "mieloid", "cróni", "aguda", "linfoid", "leucocit"],
        "pearls": [
            {"cat": "LLA (LINFÁTICA AGUDA)", "pearl": "La más frecuente en NIÑOS. Pronóstico 85% con tto actual. Clínica: pancitopenia + blastos + dolores óseos (periostio infiltrado) + fiebre + esplenomegalia."},
            {"cat": "LMA (MIELOIDE AGUDA)", "pearl": "Adultos. Blastos mieloides. Urgencia hematológica. Puede dar leucostasis. Bastones de Auer en blastos = patognomónico de LMA."},
            {"cat": "LLC (LINFÁTICA CRÓNICA)", "pearl": "Adultos MAYORES. Hemograma: linfocitosis masiva >30k con 90% linfocitos. Curso INDOLENTE. Esplenomegalia moderada. No se ve desviación izquierda mieloide."},
            {"cat": "LMC (MIELOIDE CRÓNICA)", "pearl": "ESPLENOMEGALIA MASIVA + leucocitosis >30k con DESVIACIÓN IZQUIERDA MIELOIDE (promielocitos, mielocitos, baciliformes). Blastos <5%. Plaquetas ↑. Cromosoma Philadelphia (BCR-ABL). Tto: Imatinib."},
            {"cat": "LLC vs LMC — TRUCO CLAVE", "pearl": "LLC: linfocitosis (90% linfocitos). LMC: leucocitosis con serie MIELOIDE completa (todos los estadios). Esplenomegalia es masiva en LMC, moderada en LLC."},
            {"cat": "REACCIÓN LEUCEMOIDE", "pearl": "Bordetella pertussis → linfocitosis hasta 50.000 con 90% linfocitos. PARECE leucemia pero es infecciosa/reactiva. Diferencia de LLC: clínica de tos convulsiva, bebé pequeño."},
            {"cat": "LMC vs LEUCEMIA AGUDA", "pearl": "LMC: blastos <5%, curso subagudo-crónico. Leucemia aguda: blastos >20%, pancitopenia más severa, más urgente. En la leucemia aguda el hematopoyesis normal está suprimida."},
            {"cat": "PRONÓSTICO LLA PEDIÁTRICA", "pearl": "LLA infancia: pronóstico ~85% de curación. Es el cáncer más frecuente en niños y el de MEJOR pronóstico entre las leucemias."},
        ],
        "flashcards": [
            {"id": "hem-l1", "cloze": "La leucemia más frecuente en niños es {{c1::LLA (leucemia linfática aguda)}} con un pronóstico de sobrevida actual del {{c2::85%}}."},
            {"id": "hem-l2", "cloze": "LMC: esplenomegalia {{c1::masiva}}, leucocitosis con desviación {{c2::izquierda mieloide}} (promielocitos, baciliformes), blastos {{c3::<5%}}, plaquetas {{c4::elevadas}}, cromosoma {{c5::Philadelphia (BCR-ABL)}}."},
            {"id": "hem-l3", "cloze": "LLC: adultos mayores, linfocitosis masiva con {{c1::>90% linfocitos}}, curso {{c2::indolente}}. Se diferencia de LMC en que en LLC predominan {{c3::linfocitos}} no células mieloides."},
            {"id": "hem-l4", "cloze": "Los bastones de Auer en el frotis son patognomónicos de {{c1::LMA (leucemia mieloide aguda)}}. La LMA afecta principalmente a {{c2::adultos}}."},
            {"id": "hem-l5", "cloze": "Bordetella pertussis produce linfocitosis hasta 50.000/mm³ que se llama {{c1::reacción leucemoide}}. Se diferencia de LLC porque el paciente es un {{c2::lactante con tos convulsiva}}."},
            {"id": "hem-l6", "cloze": "En LLA el hemograma muestra: pancitopenia + {{c1::blastos}} en frotis. Los dolores óseos se deben a {{c2::infiltración del periostio medular}}. La esplenomegalia es por {{c3::infiltración leucémica}}."},
            {"id": "hem-l7", "cloze": "Diagnóstico diferencial esplenomegalia + leucocitosis >30k: si hay desviación izquierda mieloide → {{c1::LMC}}. Si hay 90% linfocitos → {{c2::LLC}}. Si hay blastos >20% + pancitopenia → {{c3::leucemia aguda}}."},
        ],
    },
    {
        "id": "linfomas",
        "title": "Linfomas: Hodgkin vs No Hodgkin",
        "icon": "🟣",
        "color": "#a855f7",
        "questionKeywords": ["linfom", "Hodgkin", "adenopat", "mediastin", "síntomas B", "alcohol", "bajo grado"],
        "pearls": [
            {"cat": "HODGKIN — CLÍNICA CLÁSICA", "pearl": "Adultos jóvenes 15-35 años. Adenopatías cervicales DURAS + síntomas B (fiebre, baja de peso >10%, sudoración nocturna) + mediastino ensanchado en Rx. Hemograma NORMAL o leve alteración."},
            {"cat": "HODGKIN — SIGNO PATOGNOMÓNICO", "pearl": "Dolor en las adenopatías al ingerir ALCOHOL. Es patognomónico del Linfoma de Hodgkin. Si aparece en la pregunta → la respuesta es Hodgkin."},
            {"cat": "DIAGNÓSTICO LINFOMA", "pearl": "Sospecha linfoma → BIOPSIA GANGLIONAR (no biopsia de médula ósea, no TAC solo). La biopsia de ganglios da el diagnóstico histológico definitivo."},
            {"cat": "LINFOMA BAJO GRADO", "pearl": "ALTO grado de recaídas (este es el hecho FALSO que preguntan). Suelen estar diseminados al diagnóstico. Sobrevida >10 años. Frecuentes en adultos mayores. Diagnóstico por biopsia ganglionar."},
            {"cat": "MONONUCLEOSIS vs LINFOMA", "pearl": "MN: adolescente, fiebre AGUDA (1-2 sem), odinofagia intensa, splenomegalia blanda, ictericia, Monospot/Paul-Bunnell (+). Linfoma: más insidioso, semanas-meses, adenopatías duras, sin odinofagia intensa."},
            {"cat": "DIAGNÓSTICO DIFERENCIAL ADENOPATÍAS", "pearl": "Bartonella (arañazo de gato): adenopatía unilateral axilar/cervical, historia de contacto con gato joven. TBC: puede dar adenopatías pero con otros signos. Linfoma: adenopatías indoloras, firmes, progresivas."},
            {"cat": "LINFOMA NO HODGKIN", "pearl": "Mayor variedad de subtipos. Puede ser agresivo (difuso célula grande B) o indolente (folicular). Más frecuente que Hodgkin. Tratamiento según subtipo."},
        ],
        "flashcards": [
            {"id": "hem-lf1", "cloze": "El linfoma de Hodgkin afecta principalmente a adultos {{c1::jóvenes (15-35 años)}}. El signo patognomónico es {{c2::dolor en las adenopatías al tomar alcohol}}."},
            {"id": "hem-lf2", "cloze": "Síntomas B en linfoma: {{c1::fiebre}}, {{c2::baja de peso >10% en 6 meses}} y {{c3::sudoración nocturna}}. El hemograma en Hodgkin suele ser {{c4::normal}}."},
            {"id": "hem-lf3", "cloze": "Ante sospecha de linfoma, el examen diagnóstico es {{c1::biopsia ganglionar}}. NO se pide biopsia de médula ósea de primera línea."},
            {"id": "hem-lf4", "cloze": "Los linfomas de bajo grado tienen {{c1::alta tasa de recaídas}} (no baja — esto es la respuesta FALSA que piden). Se presentan {{c2::diseminados al diagnóstico}} y tienen sobrevida de {{c3::>10 años}}."},
            {"id": "hem-lf5", "cloze": "Diferencia clave Mononucleosis vs Linfoma: MN tiene {{c1::odinofagia intensa y fiebre aguda (1-2 sem)}}. Linfoma tiene {{c2::adenopatías duras, curso insidioso de semanas-meses}}. MN se confirma con {{c3::Paul-Bunnell/Monospot}}."},
            {"id": "hem-lf6", "cloze": "Linfoma de Hodgkin en Rx tórax: {{c1::mediastino ensanchado}} por {{c2::adenopatías mediastínicas}}. Esto junto con adenopatías cervicales y síntomas B es la presentación clásica."},
        ],
    },
    {
        "id": "mieloma-mielofibrosis-smd",
        "title": "Mieloma Múltiple · Mielofibrosis · SMD",
        "icon": "🦴",
        "color": "#eab308",
        "questionKeywords": ["mielom", "mielofibrosi", "dacriocit", "displasi", "mielodisplas", "SMD", "hipercalcemi", "proteín", "paraproteín", "plasmocit"],
        "pearls": [
            {"cat": "MIELOMA MÚLTIPLE — TRÍADA", "pearl": "Dolor óseo + Anemia + Hipercalcemia en adulto mayor. Laboratorio: proteínas totales ↑, albúmina ↓ (gammapatía monoclonal), electroforesis con pico M. Riñón afectado (proteinuria Bence-Jones)."},
            {"cat": "MIELOMA — SMOLDERING", "pearl": "Mieloma asintomático (smoldering): alteración en electroforesis (pico M) SIN síntomas ni daño orgánico → OBSERVAR, no tratar."},
            {"cat": "MIELOFIBROSIS — SIGNO PATOGNOMÓNICO", "pearl": "DACRIOCITOS (hematíes en forma de lágrima o teardrop) en el frotis = mielofibrosis hasta demostrar lo contrario. + esplenomegalia masiva (hematopoyesis extramedular) + pancitopenia."},
            {"cat": "SMD (MIELODISPLASIA)", "pearl": "Adultos >60 años. Pancitopenia + macrocitosis + NO responde a B12/folatos/hierro tras 60 días. Diagnóstico: biopsia de médula ósea. Puede evolucionar a leucemia aguda (pre-leucemia)."},
            {"cat": "APLASIA MEDULAR vs SMD", "pearl": "Aplasia: médula vacía, pancitopenia severa. SMD: médula con células displásicas. Ambas requieren biopsia de médula ósea para diagnóstico definitivo."},
            {"cat": "EUNACOM TRICK — SMD vs B12", "pearl": "Pancitopenia + macrocitosis en adulto mayor que NO mejora con 60 días de B12 oral → biopsia médula ósea (SMD), NO pasar a B12 parenteral."},
        ],
        "flashcards": [
            {"id": "hem-m1", "cloze": "La tríada del Mieloma Múltiple es: {{c1::dolor óseo}} + {{c2::anemia}} + {{c3::hipercalcemia}}. En el laboratorio: proteínas totales {{c4::↑}}, albúmina {{c5::↓}}."},
            {"id": "hem-m2", "cloze": "Los dacriocitos (hematíes en lágrima) en el frotis son patognomónicos de {{c1::mielofibrosis}}. Se acompañan de {{c2::esplenomegalia masiva}} por {{c3::hematopoyesis extramedular}}."},
            {"id": "hem-m3", "cloze": "El SMD (síndrome mielodisplásico) afecta a adultos de {{c1::>60 años}}, cursa con {{c2::pancitopenia + macrocitosis}}, y NO responde a {{c3::B12/folatos/hierro oral}}. El diagnóstico se hace con {{c4::biopsia de médula ósea}}."},
            {"id": "hem-m4", "cloze": "Mieloma asintomático (smoldering): pico M en electroforesis SIN síntomas → conducta: {{c1::observar evolución, sin tratamiento}}. Mieloma sintomático (CRAB: {{c2::Calcio↑, Renal, Anemia, Bone}}) → quimioterapia."},
            {"id": "hem-m5", "cloze": "Diferencia Mielofibrosis vs Mielodisplasia: Mielofibrosis tiene {{c1::dacriocitos en frotis + esplenomegalia masiva}}. SMD tiene {{c2::pancitopenia macrocítica sin dacriocitos}} y no responde a nutrientes."},
        ],
    },
    {
        "id": "hemostasia",
        "title": "Hemostasia: Plaquetario vs Coagulación · Hemofilia · PTI",
        "icon": "💉",
        "color": "#06b6d4",
        "questionKeywords": ["plaqueta", "hemofili", "sangría", "TTPA", "tiempo de", "PTI", "púrpura", "hemartrosi", "coagulaci", "von Willebrand", "anticoagul", "acenocumarol", "warfarin", "heparin"],
        "pearls": [
            {"cat": "PLAQUETARIO vs COAGULACIÓN — TABLA", "pearl": "Trastorno plaquetario: lesiones SUPERFICIALES (petequias, equimosis, epistaxis, gingivorragia), tiempo de sangría ↑, TP/TTPA normal. Trastorno coagulación: lesiones PROFUNDAS (hematomas, hemartrosis), tiempo sangría normal, TTPA ↑ (o TP ↑)."},
            {"cat": "HEMOFILIA — HERENCIA", "pearl": "Ligada al X RECESIVA. Afecta casi exclusivamente HOMBRES (XY). Mujer portadora: 50% hijos varones afectados, 50% hijas portadoras. Si madre NO portadora y padre hemofílico → todos los hijos normales (hijos Y reciben X materno normal)."},
            {"cat": "HEMOFILIA A — TRUCO GENÉTICA", "pearl": "Si padre hemofílico A espera hijo VARÓN → probabilidad de hemofilia es 0% (el padre le da el Y, la madre da el X normal). El hijo recibe X sin mutación de la madre."},
            {"cat": "HEMOFILIA — CLÍNICA", "pearl": "HEMARTROSIS + hematomas profundos ante traumas MENORES. TTPA prolongado. TP normal. Tiempo de sangría NORMAL (plaquetas OK). Gingivorragia/petequias NO son de hemofilia — esas son plaquetarias."},
            {"cat": "PTI NIÑO vs ADULTO", "pearl": "PTI en NIÑO: autolimitado, manejo conservador → OBSERVAR y reposo si plaquetas >20k sin sangrado activo. PTI en ADULTO: tratar con CORTICOIDES orales. NO dar aspirina nunca en PTI (inhibe plaquetas)."},
            {"cat": "ANTICOAGULACIÓN — CONTROL", "pearl": "Heparina → controlar con TTPA. Warfarina/acenocumarol → controlar con TP/INR (no TTPA). Si paciente en acenocumarol tiene TTPA alargado → MANTENER tto (cumarol alarga TP no TTPA → valor TTPA irrelevante aquí)."},
            {"cat": "AINEs Y HEMOSTASIA", "pearl": "AINEs (ibuprofeno, aspirina) → inhiben COX → ↓ TXA2 → ↓ agregación plaquetaria → alargan el TIEMPO DE SANGRÍA. No alargan TP ni TTPA ni disminuyen recuento de plaquetas."},
            {"cat": "TROMBOFILIA MÁS FRECUENTE CHILE", "pearl": "Resistencia del Factor V a la Proteína C (Factor V Leiden) = trombofilia congénita más frecuente en Chile y mundo occidental. Se manifiesta como TEP o TVP recurrente."},
            {"cat": "DÉFICIT ANTITROMBINA III", "pearl": "Es una TROMBOFILIA (predisposición a trombosis, no a sangrado). Tto con anticoagulantes. Si está en acenocumarol y el TTPA aparece alargado → MANTENER (el TTPA no es el examen correcto para monitorear cumarínicos)."},
            {"cat": "VON WILLEBRAND vs HEMOFILIA", "pearl": "Von Willebrand: tiempo de sangría ↑ + TTPA ↑ (VWF transporta FVIII). Afecta a ambos sexos. Clínica: epistaxis, menorragia, equimosis. Hemofilia: solo TTPA ↑, tiempo sangría normal. Solo hombres."},
        ],
        "flashcards": [
            {"id": "hem-h1", "cloze": "Trastorno plaquetario → lesiones {{c1::superficiales (petequias, equimosis, epistaxis)}}. Examen alterado: {{c2::tiempo de sangría}}. TP/TTPA: {{c3::normales}}."},
            {"id": "hem-h2", "cloze": "Trastorno de coagulación → lesiones {{c1::profundas (hematomas, hemartrosis)}}. En hemofilia el examen alterado es {{c2::TTPA}}. El tiempo de sangría está {{c3::normal}}."},
            {"id": "hem-h3", "cloze": "Hemofilia: herencia {{c1::ligada al X recesiva}}, afecta casi exclusivamente a {{c2::hombres}}. Clínica: {{c3::hemartrosis + hematomas profundos ante traumas menores}}. TTPA {{c4::prolongado}}, tiempo sangría {{c5::normal}}."},
            {"id": "hem-h4", "cloze": "PTI en NIÑO con plaquetas >20k sin sangrado activo → conducta: {{c1::observar y reposo}}. PTI en ADULTO → {{c2::corticoides orales}}. NUNCA dar {{c3::aspirina}} en PTI."},
            {"id": "hem-h5", "cloze": "Heparina → monitorear con {{c1::TTPA}}. Warfarina/acenocumarol → monitorear con {{c2::TP/INR}}. Si paciente en acenocumarol tiene TTPA alargado → {{c3::mantener el tratamiento}} (no es el examen correcto)."},
            {"id": "hem-h6", "cloze": "Los AINEs producen alargamiento del {{c1::tiempo de sangría}} por inhibición de {{c2::COX → ↓ TXA2 → ↓ agregación plaquetaria}}. No alteran {{c3::TP ni TTPA ni recuento de plaquetas}}."},
            {"id": "hem-h7", "cloze": "Trombofilia congénita más frecuente en Chile: {{c1::resistencia del Factor V a la Proteína C (Factor V Leiden)}}. Se manifiesta como {{c2::TEP o TVP recurrente}}."},
            {"id": "hem-h8", "cloze": "Si el padre tiene hemofilia A y espera un hijo VARÓN, la probabilidad de que el hijo sea hemofílico es {{c1::0%}}, porque el padre le da el {{c2::cromosoma Y}} y la madre da su {{c3::X normal}}."},
            {"id": "hem-h9", "cloze": "Von Willebrand afecta a {{c1::ambos sexos}}. Tiene tiempo de sangría {{c2::↑}} + TTPA {{c3::↑}} (porque transporta FVIII). Hemofilia: solo TTPA {{c4::↑}}, tiempo sangría {{c5::normal}}, solo {{c6::hombres}}."},
        ],
    },
    {
        "id": "hematologia-pediatrica",
        "title": "Hematología Pediátrica Especial",
        "icon": "👶",
        "color": "#10b981",
        "questionKeywords": ["neonatal", "lactante", "prematuro", "neonato", "pediátri", "niño", "infantil", "ictericia neonatal", "ABO", "Rh", "poliglobulia neonatal", "anti-D"],
        "pearls": [
            {"cat": "ICTERICIA NEONATAL <24H", "pearl": "Ictericia en las primeras 24 horas de vida = HEMOLÍTICA. Causa más FRECUENTE: incompatibilidad ABO (más común que Rh porque anticuerpos IgG ya presentes en madre sin sensibilización previa)."},
            {"cat": "PROFILAXIS Rh", "pearl": "Inmunoglobulina anti-D se da a mujeres Rh NEGATIVAS NO sensibilizadas (Coombs indirecto negativo), a las 28 semanas + postparto si RN es Rh(+). NO sirve si ya está sensibilizada."},
            {"cat": "POLIGLOBULIA NEONATAL — FR", "pearl": "Factores de RIESGO: hijo de madre diabética, preeclampsia, RCIU, RN postérmino. La PREMATUREZ NO es factor de riesgo (los prematuros tienen Hcto más BAJO). Definición: Hcto >65%."},
            {"cat": "HIERRO EN PREMATURO", "pearl": "Prematuro con LME: suplementar hierro al DOBLAR el peso de nacimiento. RN término con LME: a los 4 meses. RN prematuro: sus reservas son menores (se acumulan en 3er trimestre)."},
            {"cat": "CÁNCER PEDIÁTRICO", "pearl": "1er lugar en pediatría: Leucemias/Linfomas (hematológicos). 2do lugar: Tumores del SNC. El cáncer es la 2da causa de muerte en niños >1 año (1ra = accidentes)."},
            {"cat": "INMUNODEFICIENCIA MÁS FRECUENTE", "pearl": "Inmunodeficiencia primaria más frecuente en pediatría: alteraciones de la inmunidad HUMORAL (déficit de anticuerpos, principalmente déficit selectivo de IgA). Se manifiesta con infecciones bacterianas recurrentes."},
            {"cat": "DÉFICIT COMPLEMENTO", "pearl": "Infecciones meningocócicas A REPETICIÓN → déficit del complemento terminal (C5-C9). Neisseria necesita la lisis por complemento para ser eliminada."},
        ],
        "flashcards": [
            {"id": "hem-p1", "cloze": "Ictericia neonatal en las primeras {{c1::24 horas}} de vida = hemolítica. Causa más frecuente: {{c2::incompatibilidad ABO}} (más que Rh porque ya hay IgG anti-A/B maternos)."},
            {"id": "hem-p2", "cloze": "Profilaxis Rh: inmunoglobulina anti-D se da a mujeres {{c1::Rh negativas NO sensibilizadas}}, a las {{c2::28 semanas}} de gestación y {{c3::postparto si RN es Rh(+)}}."},
            {"id": "hem-p3", "cloze": "Poliglobulia neonatal: el factor que NO es de riesgo es {{c1::prematurez}} (los prematuros tienen Hcto más bajo). Factores de riesgo reales: {{c2::hijo de madre diabética, preeclampsia, RCIU, postérmino}}."},
            {"id": "hem-p4", "cloze": "Hierro en prematuro con lactancia materna exclusiva: se inicia al {{c1::doblar el peso de nacimiento}}. En RN término con LME: al {{c2::4to mes}}. Los prematuros tienen menores reservas porque se acumulan en el {{c3::3er trimestre}}."},
            {"id": "hem-p5", "cloze": "Los dos grupos de cáncer más importantes en pediatría son {{c1::hematológicos (leucemias/linfomas)}} y {{c2::tumores del SNC}}. La leucemia más frecuente en niños es {{c3::LLA}} con pronóstico del {{c4::85%}}."},
            {"id": "hem-p6", "cloze": "Infecciones meningocócicas a repetición → sospechar déficit de {{c1::complemento (componentes terminales C5-C9)}}. Neisseria meningitidis es destruida por {{c2::lisis dependiente del complemento}}."},
            {"id": "hem-p7", "cloze": "Inmunodeficiencia primaria más frecuente en pediatría: alteraciones de la inmunidad {{c1::humoral (anticuerpos)}}. La más común individualmente es el déficit selectivo de {{c2::IgA}}."},
        ],
    },
]

# ─────────────────────────────────────────────────────────
# LOAD QUESTIONS & ASSIGN TO TOPICS
# ─────────────────────────────────────────────────────────
def load_questions():
    with open(HEMAT_JSON, encoding="utf-8") as f:
        data = json.load(f)
    all_q = []
    for prueba in data["pruebas"]:
        for q in prueba["questions"]:
            all_q.append(q)
    return all_q

def match_question(q, keywords):
    text = (q.get("pregunta","") + " " + " ".join(o.get("text","") for o in q.get("opciones",[])) + " " + (q.get("explicacion","") or "")).lower()
    return any(kw.lower() in text for kw in keywords)

def assign_questions(all_q, topics):
    used = set()
    for topic in topics:
        topic["questions"] = []
        kws = topic["questionKeywords"]
        for i, q in enumerate(all_q):
            if i not in used and match_question(q, kws):
                topic["questions"].append(q)
                used.add(i)
        topic["questionCount"] = len(topic["questions"])
        topic["flashcardCount"] = len(topic["flashcards"])
        # Inject lesson content
        lesson = LESSONS.get(topic["id"], [])
        topic["lesson"] = lesson
        topic["lessonRapidCheckCount"] = sum(1 for b in lesson if b["type"] == "rapid_check")

# ─────────────────────────────────────────────────────────
# ANKI .APKG GENERATION
# ─────────────────────────────────────────────────────────
def build_apkg(topics, out_path):
    """Build a minimal valid .apkg (Anki 2.1 format, Cloze deck)."""
    tmpdir = tempfile.mkdtemp()
    db_path = os.path.join(tmpdir, "collection.anki2")

    now_ms = int(time.time() * 1000)
    now_s = int(time.time())
    deck_id = 1716000000001
    model_id = 1716000000002

    # All cloze cards from all topics
    all_cards = []
    for t in topics:
        for fc in t.get("flashcards", []):
            all_cards.append({"topic": t["title"], "cloze": fc["cloze"]})

    conn = sqlite3.connect(db_path)
    c = conn.cursor()

    # Minimal Anki schema
    c.executescript("""
    CREATE TABLE col (id integer primary key, crt integer, mod integer, scm integer,
        ver integer, dty integer, usn integer, ls integer, conf text, models text,
        decks text, dconf text, tags text);
    CREATE TABLE notes (id integer primary key, guid text not null, mid integer not null,
        mod integer not null, usn integer not null, tags text not null, flds text not null,
        sfld text not null, csum integer not null, flags integer not null, data text not null);
    CREATE TABLE cards (id integer primary key, nid integer not null, did integer not null,
        ord integer not null, mod integer not null, usn integer not null, type integer not null,
        queue integer not null, due integer not null, ivl integer not null, factor integer not null,
        reps integer not null, lapses integer not null, left integer not null, odue integer not null,
        odid integer not null, flags integer not null, data text not null);
    CREATE TABLE revlog (id integer primary key, cid integer not null, usn integer not null,
        ease integer not null, ivl integer not null, lastIvl integer not null,
        factor integer not null, time integer not null, type integer not null);
    CREATE TABLE graves (usn integer not null, oid integer not null, type integer not null);
    CREATE INDEX ix_notes_usn on notes (usn);
    CREATE INDEX ix_cards_usn on cards (usn);
    CREATE INDEX ix_cards_nid on cards (nid);
    CREATE INDEX ix_cards_sched on cards (did, queue, due);
    CREATE INDEX ix_revlog_usn on revlog (usn);
    CREATE INDEX ix_revlog_cid on revlog (cid);
    """)

    # Count cloze deletions per card
    def count_cloze(text):
        nums = set(int(m) for m in re.findall(r'\{\{c(\d+)::', text))
        return max(nums) if nums else 1

    # Model (Cloze)
    cloze_model = {
        str(model_id): {
            "id": model_id,
            "name": "Cloze Hematología",
            "type": 1,
            "mod": now_s,
            "usn": -1,
            "sortf": 0,
            "did": deck_id,
            "tmpls": [{"name": "Cloze", "ord": 0, "qfmt": "{{cloze:Text}}", "afmt": "{{cloze:Text}}<br>{{Extra}}", "did": None, "bqfmt": "", "bafmt": ""}],
            "flds": [
                {"name": "Text", "ord": 0, "sticky": False, "rtl": False, "font": "Arial", "size": 20, "media": []},
                {"name": "Extra", "ord": 1, "sticky": False, "rtl": False, "font": "Arial", "size": 20, "media": []},
            ],
            "css": ".card{font-size:16px;} .cloze{font-weight:bold;color:#00a;}",
            "latexPre": "", "latexPost": "",
            "tags": [], "vers": [],
        }
    }

    # Deck
    decks = {
        "1": {"id": 1, "name": "Default", "conf": 1, "extendNew": 0, "extendRev": 0, "collapsed": False, "browserCollapsed": False, "desc": "", "dyn": 0, "mod": now_s, "usn": -1},
        str(deck_id): {
            "id": deck_id,
            "name": "Hematología High Yield EUNACOM 🩸",
            "conf": 1,
            "extendNew": 0, "extendRev": 0,
            "collapsed": False, "browserCollapsed": False,
            "desc": "Flashcards cloze hematología EUNACOM generadas desde preguntas del Dr. Guevara.",
            "dyn": 0, "mod": now_s, "usn": -1,
        }
    }

    dconf = {"1": {"id": 1, "name": "Default", "replayq": True, "lapse": {"delays": [10], "leechAction": 0, "leechFails": 8, "minInt": 1, "mult": 0}, "rev": {"bury": False, "ease4": 1.3, "fuzz": 0.05, "ivlFct": 1, "maxIvl": 36500, "minSpace": 1, "perDay": 200}, "new": {"bury": False, "delays": [1, 10], "initialFactor": 2500, "ints": [1, 4, 7], "order": 1, "perDay": 20, "separate": True}, "maxTaken": 60, "timer": 0, "autoplay": True, "mod": 0, "usn": 0}}

    conf = '{"activeDecks":[1],"curDeck":1,"newSpread":0,"collapseTime":1200,"timeLim":0,"estTimes":true,"dueCounts":true,"curModel":' + str(model_id) + ',"nextPos":1,"sortType":"noteFld","sortBackwards":false}'

    c.execute("INSERT INTO col VALUES (1,?,?,?,11,0,-1,0,?,?,?,?,'')",
              (now_s, now_s, now_ms, conf, json.dumps(cloze_model), json.dumps(decks), json.dumps(dconf)))

    # Insert notes + cards
    card_due = 1
    for i, card in enumerate(all_cards):
        note_id = now_ms + i
        guid = hashlib.sha1(card["cloze"].encode()).hexdigest()[:10]
        flds = card["cloze"] + "\x1f" + card["topic"]
        sfld = card["cloze"][:50]
        csum = int(hashlib.sha1(sfld.encode()).hexdigest()[:8], 16)

        c.execute("INSERT INTO notes VALUES (?,?,?,?,?,?,?,?,?,0,'')",
                  (note_id, guid, model_id, now_s, -1, "", flds, sfld, csum))

        n_cloze = count_cloze(card["cloze"])
        for ord_n in range(n_cloze):
            card_id = note_id * 100 + ord_n
            c.execute("INSERT INTO cards VALUES (?,?,?,?,?,?,0,0,?,0,2500,0,0,0,0,0,0,'')",
                      (card_id, note_id, deck_id, ord_n, now_s, -1, card_due))
            card_due += 1

    conn.commit()
    conn.close()

    # Zip into .apkg
    with zipfile.ZipFile(out_path, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.write(db_path, "collection.anki2")
        zf.writestr("media", "{}")
        zf.writestr("meta", json.dumps({"created": now_s, "deck_configs_enabled": False}))

    shutil.rmtree(tmpdir)
    print(f"✅ Anki .apkg written → {out_path}  ({len(all_cards)} cards)")

# ─────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────
def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    all_q = load_questions()
    assign_questions(all_q, TOPICS)

    total_fc = sum(len(t["flashcards"]) for t in TOPICS)
    total_q = sum(t["questionCount"] for t in TOPICS)
    total_pearls = sum(len(t.get("pearls",[])) for t in TOPICS)
    total_rc = sum(t.get("lessonRapidCheckCount", 0) for t in TOPICS)

    guide = {
        "meta": {
            "subject": "Hematología",
            "totalFlashcards": total_fc,
            "totalQuestions": total_q,
            "totalPearls": total_pearls,
            "totalRapidChecks": total_rc,
            "generated": time.strftime("%Y-%m-%d"),
        },
        "topics": TOPICS,
    }

    json_path = os.path.join(OUT_DIR, "hematologia-high-yield.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(guide, f, ensure_ascii=False, indent=2)
    print(f"✅ JSON written → {json_path}")
    print(f"   Topics: {len(TOPICS)}, Questions: {total_q}, Flashcards: {total_fc}, Pearls: {total_pearls}, RapidChecks: {total_rc}")

    apkg_path = os.path.join(OUT_DIR, "hematologia-anki.apkg")
    build_apkg(TOPICS, apkg_path)

if __name__ == "__main__":
    main()
