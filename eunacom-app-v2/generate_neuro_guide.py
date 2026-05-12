"""
Generates neurologia-high-yield.json and neurologia-anki.apkg
from public/data/pruebas/modulo-1-neurologia.json

Run from eunacom-app-v2/:
    python3 generate_neuro_guide.py
"""

import json, os, re, sqlite3, struct, time, zipfile, hashlib, random
from lessons_neuro import LESSONS

# ─── paths ────────────────────────────────────────────────────────────────
BASE = os.path.dirname(os.path.abspath(__file__))
PRUEBAS_DIR = os.path.join(BASE, "public", "data", "pruebas")
OUT_DIR     = os.path.join(BASE, "public", "data", "study-guides")
os.makedirs(OUT_DIR, exist_ok=True)

# ─── topic definitions ────────────────────────────────────────────────────
TOPICS = [
    {
        "id": "acv-stroke",
        "title": "ACV, TIA y Hemorragia Cerebral",
        "icon": "🧠",
        "color": "#ef4444",
        "keywords": [
            "acv", "ictus", "stroke", "infarto cerebral", "ataque isquémico transitorio",
            "tia", "hemiparesia", "afasia", "trombólisis", "tpa", "alteplasa",
            "hemorragia subaracnoi", "hematoma subdural", "hematoma epidural",
            "aneurisma intracraneal", "hipertensión endocraneana", "arteria cerebral",
            "cerebelosa", "basilar", "lúcido", "meníngea media", "bridging",
            "cefalea en truen", "cefalea fulminante", "xantocrom",
        ],
        "pearls": [
            "🔑 **Ventana trombolítica:** rtPA IV solo si &lt;4,5h desde inicio de síntomas Y TC sin hemorragia.",
            "🔑 **Lo primero:** TC cerebral sin contraste para descartar hemorragia antes de trombolizar.",
            "🔑 **ACV hemorrágico:** causa más frecuente = HTA crónica. Ubicación típica: ganglios basales (putamen).",
            "🔑 **FA + ACV isquémico** → anticoagulación oral indefinida (no aspirina).",
            "🔑 **SAH:** cefalea 'en trueno' de máxima intensidad. TC negativo no descarta → hacer PL (xantocromía).",
            "🔑 **Hematoma EPIDURAL:** arteria meníngea media, lente biconvexo, lúcido intervalo. Trauma temporal.",
            "🔑 **Hematoma SUBDURAL:** venas puente, medialuna cóncava. Anciano con trauma mínimo + ACO.",
            "🔑 **TIA:** riesgo ACV 10-15% en los próximos 7 días → es una urgencia. Estudio completo en 48h.",
        ],
        "flashcards": [
            {"front": "Tiempo máximo para trombolizar en ACV isquémico", "back": "4,5 horas desde inicio de síntomas"},
            {"front": "Primer examen en ACV sospechoso", "back": "TC cerebral sin contraste (descartar hemorragia)"},
            {"front": "Causa #1 de ACV hemorrágico en adultos", "back": "Hipertensión arterial crónica (ganglio basal/putamen)"},
            {"front": "ACV isquémico por FA → tratamiento crónico", "back": "Anticoagulación oral (NOAC o warfarina INR 2-3)"},
            {"front": "Imagen TC del hematoma epidural", "back": "Lente biconvexo hiperdensa (no cruza suturas)"},
            {"front": "Imagen TC del hematoma subdural", "back": "Medialuna hiperdensa/hipodensa (cruza suturas)"},
            {"front": "Lúcido intervalo: diagnóstico", "back": "Hematoma epidural (arteria meníngea media)"},
            {"front": "LCR xantocrómico: diagnóstico", "back": "Hemorragia subaracnoidea (SAH)"},
            {"front": "Causa #1 de SAH no traumática", "back": "Rotura de aneurisma intracraneal"},
            {"front": "Tratamiento empírico de TIA en urgencias", "back": "Aspirina 300 mg stat + estudio etiológico urgente en 48h"},
        ],
    },
    {
        "id": "cefalea",
        "title": "Cefalea y Migraña",
        "icon": "🤕",
        "color": "#f97316",
        "keywords": [
            "cefalea", "migraña", "jaqueca", "cluster", "racimos", "cefalalgia",
            "trigémino", "neuralgia", "cefalea tensional", "hemicránea",
            "fotofobia", "fonofobia", "triptán", "sumatriptán", "ergotamina",
            "propranolol profilaxis", "topiramato profilaxis", "amitriptilina profilaxis",
            "cefalea rebote", "sobreuso", "tic doloroso",
        ],
        "pearls": [
            "🔑 **Migraña:** unilateral, pulsátil, 4-72h, náuseas/foto/fonofobia. Triptanes en la crisis.",
            "🔑 **Cluster:** periocular, hombre joven, 15-180 min, síntomas autonómicos ipsilaterales. O₂ + sumatriptán SC.",
            "🔑 **SAH:** cefalea 'en trueno' máxima en segundos. TC normal no descarta → PL obligatoria.",
            "🔑 **Profilaxis migraña:** propranolol (1ª elección), amitriptilina, valproato, topiramato.",
            "🔑 **Neuralgia del trigémino:** descarga eléctrica de segundos, puntos gatillo, tratamiento = carbamazepina.",
            "🔑 **Cefalea de rebote:** analgésico &gt;10-15 días/mes → cefalea diaria. Solución: suspender el analgésico.",
            "🔑 **Profilaxis en embarazo:** evitar valproato (teratogénico). Usar propranolol o amitriptilina.",
        ],
        "flashcards": [
            {"front": "Tratamiento agudo de la migraña", "back": "Triptanes (sumatriptán) + AINEs"},
            {"front": "Profilaxis de migraña, primera elección", "back": "Propranolol (β-bloqueador)"},
            {"front": "Tratamiento de cefalea en racimos (crisis)", "back": "O₂ 100% alta tasa + sumatriptán SC"},
            {"front": "Neuralgia del trigémino: tratamiento", "back": "Carbamazepina (primera línea)"},
            {"front": "Cefalea que empeora con analgésicos frecuentes", "back": "Cefalea por sobreuso / cefalea de rebote"},
            {"front": "Valproato en migraña: contraindicación", "back": "Embarazo (teratogénico — espina bífida)"},
            {"front": "Cefalea en trueno + TC normal → siguiente paso", "back": "Punción lumbar (buscar xantocromía)"},
            {"front": "Síntoma que distingue cluster de migraña", "back": "Síntomas autonómicos ipsilaterales (lagrimeo, rinorrea, miosis)"},
        ],
    },
    {
        "id": "epilepsia",
        "title": "Epilepsia y Convulsiones",
        "icon": "⚡",
        "color": "#eab308",
        "keywords": [
            "epilepsi", "convuls", "crisis convulsiva", "antiepilép", "fenitoína",
            "valproato", "carbamazepina", "levetiracetam", "etosuximida", "lamotrigina",
            "status epilépticus", "estado epiléptico", "convulsión febril", "ausencia",
            "tónico-clónica", "focal", "síndrome de west", "espasmo infantil",
            "período post-ictal", "aura", "diazepam convulsión",
        ],
        "pearls": [
            "🔑 **Ausencias:** niño que 'se desconecta' brevemente, EEG punta-onda 3Hz. Tratamiento: etosuximida.",
            "🔑 **Status epilépticus:** &gt;5 min → 1° línea benzodiacepina (diazepam IV), 2° línea fenitoína IV.",
            "🔑 **Convulsión febril simple:** &lt;15 min, generalizada, &lt;5 años → NO requiere antiepiléptico crónico.",
            "🔑 **Convulsión febril compleja:** focal O &gt;15 min O recurrente en 24h → estudio y posible antiepiléptico.",
            "🔑 **Epilepsia en embarazo:** evitar valproato. Preferir levetiracetam o lamotrigina.",
            "🔑 **Carbamazepina:** CONTRAINDICADA en crisis de ausencias (las empeora). Solo para focales y TC generalizadas.",
            "🔑 **Síndrome de West:** espasmos en flexión en salvas, lactante 3-12 meses. Tratamiento: ACTH o vigabatrina.",
        ],
        "flashcards": [
            {"front": "Primera línea del status epilépticus", "back": "Benzodiacepina IV (diazepam o lorazepam)"},
            {"front": "Antiepiléptico en crisis de ausencias", "back": "Etosuximida (primera línea)"},
            {"front": "EEG típico de epilepsia de ausencias", "back": "Punta-onda a 3 Hz (generalizada)"},
            {"front": "Convulsión febril simple: definición", "back": "Generalizada, &lt;15 min, 6m-5 años, primera vez, sin déficit post-ictal"},
            {"front": "Convulsión febril simple: ¿requiere antiepiléptico?", "back": "No. Solo controlar la fiebre y tranquilizar a los padres."},
            {"front": "Carbamazepina: contraindicación en epilepsia", "back": "Crisis de ausencias (las empeora)"},
            {"front": "Antiepiléptico preferido en embarazo", "back": "Levetiracetam o lamotrigina (evitar valproato)"},
            {"front": "Síndrome de West: tratamiento", "back": "ACTH o vigabatrina"},
        ],
    },
    {
        "id": "demencia-delirium-geriatria",
        "title": "Demencia, Delirium y Geriatría",
        "icon": "👴",
        "color": "#06b6d4",
        "keywords": [
            "demencia", "alzheimer", "delirium", "deterioro cognitivo", "adulto mayor",
            "anciano", "geriátri", "caída", "polifarmacia", "fragilidad",
            "cuerpos de lewy", "frontotemporal", "demencia vascular",
            "donepezilo", "memantina", "inhibidor colinesterasa", "mmse",
            "mini-mental", "confusión aguda", "agitación nocturna",
            "beers", "benzodiazepina anciano", "desorientación",
            "sarcopenia", "osteoporosis senil", "confusión en el anciano",
            "síndrome confusional", "demencia tipo", "minimental",
            "paciente mayor", "paciente de 80", "paciente de 75", "paciente de 78",
            "cuadro confusional", "alteración cognitiva",
        ],
        "pearls": [
            "🔑 **Alzheimer:** inicio insidioso, amnesia precoz (memoria reciente), causa más frecuente (60-80%).",
            "🔑 **Vascular:** escalonado, FRC cardiovasculares, historia de ACV.",
            "🔑 **Cuerpos de Lewy:** alucinaciones VISUALES + parkinsonismo + fluctuación cognitiva.",
            "🔑 **Frontotemporal:** cambios de conducta/personalidad, inicio presenil (45-65 años), sin amnesia inicial.",
            "🔑 **Delirium vs Demencia:** delirium = AGUDO, fluctuante, causa tratable. Demencia = crónica, progresiva.",
            "🔑 **Causa #1 de delirium en hospitalizados:** infección (ITU, neumonía).",
            "🔑 **Alzheimer leve-moderado:** inhibidores colinesterasa (donepezilo, rivastigmina). Moderado-grave + memantina.",
            "🔑 **Criterios Beers:** benzodiacepinas, AINEs, anticolinérgicos, antipsicóticos → inapropiados en ancianos.",
        ],
        "flashcards": [
            {"front": "Demencia más frecuente", "back": "Alzheimer (60-80% de todas las demencias)"},
            {"front": "Demencia con alucinaciones visuales + parkinsonismo", "back": "Demencia con cuerpos de Lewy"},
            {"front": "Demencia con cambios de conducta precoz, inicio &lt;65 años", "back": "Demencia frontotemporal"},
            {"front": "Demencia con inicio escalonado + FRC cardiovasculares", "back": "Demencia vascular"},
            {"front": "Diferencia clave delirium vs demencia", "back": "Delirium = inicio AGUDO (horas-días) y fluctuante. Demencia = crónica e insidiosa."},
            {"front": "Tratamiento farmacológico Alzheimer leve-moderado", "back": "Inhibidores de acetilcolinesterasa (donepezilo, rivastigmina, galantamina)"},
            {"front": "Causa #1 de delirium en anciano hospitalizado", "back": "Infección (ITU o neumonía)"},
            {"front": "Benzodiacepinas en el anciano → riesgo principal", "back": "Caídas y delirium (Criterios de Beers)"},
            {"front": "Criterios de Fried para fragilidad (necesita ≥3)", "back": "Pérdida de peso, fatiga, baja actividad, marcha lenta, debilidad"},
            {"front": "Prueba funcional para riesgo de caídas", "back": "Timed Up and Go (TUG) ≥12 segundos = riesgo aumentado"},
        ],
    },
    {
        "id": "parkinson-movimiento",
        "title": "Parkinson y Trastornos del Movimiento",
        "icon": "🖐️",
        "color": "#a855f7",
        "keywords": [
            "parkinson", "parkinsonismo", "temblor en reposo", "bradicinesia", "acinesia",
            "rigidez en rueda dentada", "rigidez rueda", "micrografía", "levodopa", "carbidopa",
            "pramipexol", "ropinirol", "dopaminérgic", "ppd", "parkinsonismo farmacológico",
            "temblor esencial", "propranolol temblor", "corea", "distonía", "balismo",
            "metoclopramida", "haloperidol parkinson", "selegilina",
            "trastorno movimiento", "síndrome hipercinético", "síndrome hipocinético",
            "cuerpo de lewy", "temblor", "festinación", "marcha parkinsoniana",
        ],
        "pearls": [
            "🔑 **Parkinson - TRAP:** Temblor en reposo, Rigidez rueda dentada, Acinesia/Bradicinesia, Postura/inestabilidad.",
            "🔑 **Temblor de reposo:** desaparece al moverse (Parkinson). vs Acción/postural (esencial). vs Intención (cerebeloso).",
            "🔑 **PPD:** metoclopramida, haloperidol, risperidona → bloquean dopamina → parkinsonismo. Suspender el fármaco.",
            "🔑 **Levodopa + carbidopa:** gold standard. Carbidopa evita metabolismo periférico de levodopa.",
            "🔑 **Parkinson &lt;65 años:** agonistas dopaminérgicos (pramipexol) para retrasar levodopa.",
            "🔑 **Parkinson &gt;65 años con discapacidad:** levodopa + carbidopa directamente.",
            "🔑 **NUNCA metoclopramida en Parkinson** — bloquea dopamina y empeora el cuadro dramáticamente.",
            "🔑 **Temblor esencial:** postural, sin rigidez/bradicinesia. Responde a propranolol.",
        ],
        "flashcards": [
            {"front": "Tríada TRAP de Parkinson", "back": "Temblor reposo + Rigidez rueda dentada + Acinesia/bradicinesia + Postura/inestabilidad"},
            {"front": "Temblor de Parkinson vs temblor esencial", "back": "Parkinson: en reposo, desaparece al moverse. Esencial: postural/acción, no hay bradicinesia."},
            {"front": "PPD: causa más frecuente en atención primaria", "back": "Metoclopramida (bloqueador D2)"},
            {"front": "Tratamiento 1ª línea Parkinson &gt;65 años con discapacidad", "back": "Levodopa + carbidopa"},
            {"front": "¿Para qué sirve la carbidopa en la combinación?", "back": "Inhibe dopa-descarboxilasa periférica → más levodopa llega al cerebro, menos efectos periféricos"},
            {"front": "Medicamento CONTRAINDICADO en Parkinson", "back": "Metoclopramida (y en general todos los antagonistas D2)"},
            {"front": "Tratamiento del temblor esencial", "back": "Propranolol (primera línea)"},
            {"front": "Parkinson &lt;65 años con discapacidad funcional", "back": "Agonistas dopaminérgicos (pramipexol, ropinirol) — reservar levodopa"},
        ],
    },
    {
        "id": "meningitis-encefalitis",
        "title": "Meningitis y Encefalitis",
        "icon": "🦠",
        "color": "#10b981",
        "keywords": [
            "meningitis", "encefalitis", "rigidez de nuca", "kernig", "brudzinski",
            "punción lumbar", "líquido cefalorraquídeo", "lcr", "xantocrom",
            "meningococo", "neumococo", "listeria", "haemophilus",
            "aciclovir", "vhs", "herpes simplex", "petequias", "purpura",
            "cryptococcus", "meningitis tuberculosa", "meningitis bacteriana",
            "meningitis viral", "meningismo", "fotofobia fiebre rigidez",
            "ceftriaxona + dexametasona", "antibiótico meningitis",
            "dexametasona meningitis", "punción lumbar urgente",
        ],
        "pearls": [
            "🔑 **LCR bacteriano:** turbio, glucosa muy baja, proteínas muy altas, PMN (neutrófilos).",
            "🔑 **LCR viral:** claro, glucosa normal, proteínas levemente altas, linfocitos.",
            "🔑 **Meningitis &gt;60 años o inmunosupr.:** agregar ampicilina (cubre Listeria).",
            "🔑 **Dexametasona:** dar ANTES o CON la primera dosis de ATB (no después). Reduce sordera.",
            "🔑 **Encefalitis herpética:** fiebre + confusión + convulsiones + lóbulos temporales en RMN → aciclovir IV URGENTE.",
            "🔑 **Meningococcemia:** rash petequial-purpúrico no blanqueable → ceftriaxona INMEDIATO, PL puede esperar.",
            "🔑 **SAH:** también da xantocromía en LCR — diferente de meningitis (sin fiebre, sin cells inflamatorias).",
        ],
        "flashcards": [
            {"front": "LCR en meningitis bacteriana: patrón", "back": "Turbio, glucosa &lt;40, proteínas &gt;150, PMN (neutrófilos) ↑↑"},
            {"front": "LCR en meningitis viral: patrón", "back": "Claro, glucosa normal, proteínas leve ↑, linfocitos ↑"},
            {"front": "Meningitis en &gt;60 años: antibiótico adicional", "back": "Ampicilina (cubre Listeria monocytogenes)"},
            {"front": "Gérmenes meningitis en adulto joven (3m-60a)", "back": "N. meningitidis y S. pneumoniae → ceftriaxona"},
            {"front": "Dexametasona en meningitis: cuándo darla", "back": "Antes o simultánea con el primer ATB"},
            {"front": "Encefalitis herpética: hallazgo en RMN", "back": "Hiperintensidad T2 en lóbulos temporales (bilateral asimétrica)"},
            {"front": "Tratamiento encefalitis herpética", "back": "Aciclovir IV 10 mg/kg c/8h × 14-21 días"},
            {"front": "Meningococcemia: signo cutáneo clave", "back": "Rash petequial-purpúrico NO blanqueable a la presión"},
            {"front": "LCR disociación albúmino-citológica (proteínas ↑, células normales)", "back": "Guillain-Barré"},
        ],
    },
    {
        "id": "enfermedades-neuromusculares",
        "title": "Enfermedades Neuromusculares y Columna",
        "icon": "💪",
        "color": "#3b82f6",
        "keywords": [
            "miastenia", "gravis", "guillain", "barré", "esclerosis múltiple",
            "esclerosis lateral", "ela", "neuropatía periférica", "cola de caballo",
            "hernia discal", "ciática", "lasègue", "túnel carpiano", "mediano",
            "tinel", "phalen", "bell", "parálisis facial", "fatigabilidad",
            "edrofonio", "piridostigmina", "desmielinización", "placas em",
            "neuritis óptica", "lhermitte", "uhthoff", "bandas oligoclonales em",
            "neuropatía diabética", "polineuropatía",
        ],
        "pearls": [
            "🔑 **Miastenia gravis:** debilidad que EMPEORA con ejercicio/tarde. Ptosis + diplopía. Anti-RACh (+).",
            "🔑 **Guillain-Barré:** debilidad ASCENDENTE post-infecciosa (Campylobacter). LCR: disociación albúmino-citológica.",
            "🔑 **GBS tratamiento:** Ig IV o plasmaféresis. Monitoreo respiratorio (riesgo parálisis respiratoria).",
            "🔑 **Esclerosis múltiple:** mujer joven, brotes-remisiones, criterios McDonald (2 lugar + 2 tiempo).",
            "🔑 **EM: signo de Uhthoff:** empeora con el calor (duchas calientes). Signo de Lhermitte: descarga al flexionar cuello.",
            "🔑 **Parálisis facial PERIFÉRICA (Bell):** toda la hemicara incluyendo frente. CENTRAL: respeta la frente.",
            "🔑 **Síndrome de cauda equina:** incontinencia + anestesia en silla de montar → cirugía urgente &lt;48h.",
            "🔑 **Hernia discal:** manejo conservador primero (analgesia + fisioterapia). Cirugía solo si cauda equina o fracaso.",
        ],
        "flashcards": [
            {"front": "Miastenia gravis: hallazgo característico en la debilidad", "back": "Fatigabilidad: empeora con ejercicio/tarde, mejora con reposo"},
            {"front": "Miastenia gravis: anticuerpo diagnóstico", "back": "Anti-receptor de acetilcolina (anti-RACh)"},
            {"front": "Guillain-Barré: patrón de debilidad", "back": "Ascendente, simétrica, arrefléxica, post-infecciosa"},
            {"front": "Guillain-Barré: LCR característico", "back": "Disociación albúmino-citológica (proteínas altas, células normales)"},
            {"front": "Guillain-Barré: tratamiento", "back": "Ig IV o plasmaféresis (+ UCI si falla respiratoria)"},
            {"front": "Esclerosis múltiple: criterios diagnósticos (concepto)", "back": "Diseminación en espacio (2 lugares) + tiempo (2 episodios distintos) — criterios de McDonald"},
            {"front": "EM: signo de Uhthoff", "back": "Empeoramiento de síntomas con el calor (baño caliente)"},
            {"front": "Parálisis facial periférica vs central: diferencia clave", "back": "Periférica: afecta TODA la hemicara (incluyendo frente). Central: respeta la frente (inervación bilateral)."},
            {"front": "Síndrome de cauda equina: síntomas de alarma", "back": "Incontinencia vesical/intestinal + anestesia en silla de montar → cirugía &lt;48h"},
            {"front": "Neuralgia del trigémino: tratamiento", "back": "Carbamazepina (primera línea)"},
        ],
    },
]

# ─── load source questions ─────────────────────────────────────────────────
def load_questions():
    questions = []
    for fname in sorted(os.listdir(PRUEBAS_DIR)):
        if "neurologia" in fname and fname.endswith(".json"):
            fpath = os.path.join(PRUEBAS_DIR, fname)
            with open(fpath, encoding="utf-8") as f:
                data = json.load(f)
            # {"pruebas": [{..., "questions": [...]}, ...]}
            if isinstance(data, dict) and "pruebas" in data:
                for prueba in data["pruebas"]:
                    questions.extend(prueba.get("questions", prueba.get("preguntas", [])))
            elif isinstance(data, dict) and "preguntas" in data:
                questions.extend(data["preguntas"])
            elif isinstance(data, list):
                for prueba in data:
                    if isinstance(prueba, dict) and "preguntas" in prueba:
                        questions.extend(prueba["preguntas"])
                    elif isinstance(prueba, dict) and "pregunta" in prueba:
                        questions.append(prueba)
    return questions

def text_of(q):
    parts = [q.get("pregunta", ""), q.get("explicacion", "")]
    ei = q.get("explicacionIncorrectas") or {}
    if not isinstance(ei, dict): ei = {}
    for v in ei.values():
        parts.append(str(v))
    return " ".join(parts).lower()

def assign_questions(topics, questions):
    """Assign each question to the topic with the highest keyword match score."""
    for topic in topics:
        topic["questions"] = []

    for q in questions:
        txt = text_of(q)
        best, best_score = None, 0
        for topic in topics:
            score = sum(1 for kw in topic["keywords"] if kw.lower() in txt)
            if score > best_score:
                best_score, best = score, topic
        if best and best_score > 0:
            best["questions"].append(q)
        elif topics:
            # fallback: first topic
            topics[0]["questions"].append(q)

    return topics

# ─── build JSON ───────────────────────────────────────────────────────────
def build_json(topics):
    out = []
    for t in topics:
        qs = []
        for q in t.get("questions", []):
            opciones = q.get("opciones", [])
            if isinstance(opciones, dict):
                opciones = [f"{k}. {v}" for k, v in opciones.items()]
            qs.append({
                "numero": q.get("numero") or q.get("codigo_eunacom", ""),
                "pregunta": q.get("pregunta", ""),
                "opciones": opciones,
                "respuestaCorrecta": q.get("respuestaCorrecta", ""),
                "explicacion": q.get("explicacion", ""),
            })

        # Convert pearls: "🔑 **Cat:** text" → {cat, pearl}
        pearls_out = []
        for i, p in enumerate(t.get("pearls", [])):
            p_clean = re.sub(r"^🔑\s*", "", p)
            m = re.match(r"\*\*(.+?)\*\*[:\s]*(.*)", p_clean, re.DOTALL)
            if m:
                pearls_out.append({"cat": m.group(1).strip(), "pearl": m.group(2).strip()})
            else:
                pearls_out.append({"cat": "CLAVE", "pearl": p_clean.strip()})

        # Convert flashcards: {front, back} → {id, cloze}
        flashcards_out = []
        for i, fc in enumerate(t.get("flashcards", [])):
            fc_id = f"{t['id']}-fc{i+1}"
            cloze = f"{fc['front']} → {{{{c1::{fc['back']}}}}}"
            flashcards_out.append({"id": fc_id, "cloze": cloze})

        lesson_blocks = LESSONS.get(t["id"], [])
        rapid_check_count = sum(1 for b in lesson_blocks if b.get("type") == "rapid_check")
        out.append({
            "id": t["id"],
            "title": t["title"],
            "icon": t["icon"],
            "color": t["color"],
            "pearls": pearls_out,
            "flashcards": flashcards_out,
            "questions": qs,
            "lesson": lesson_blocks,
            "lessonRapidCheckCount": rapid_check_count,
        })
    return out

# ─── build Anki .apkg ─────────────────────────────────────────────────────
def build_apkg(topics, out_path):
    now_ms = int(time.time() * 1000)

    col_db = "/tmp/neuro_col.db"
    if os.path.exists(col_db):
        os.remove(col_db)

    conn = sqlite3.connect(col_db)
    c = conn.cursor()

    c.executescript("""
    CREATE TABLE col (
        id integer primary key,
        crt integer not null,
        mod integer not null,
        scm integer not null,
        ver integer not null,
        dty integer not null,
        usn integer not null,
        ls integer not null,
        conf text not null,
        models text not null,
        decks text not null,
        dconf text not null,
        tags text not null
    );
    CREATE TABLE notes (
        id integer primary key,
        guid text not null,
        mid integer not null,
        mod integer not null,
        usn integer not null,
        tags text not null,
        flds text not null,
        sfld integer not null,
        csum integer not null,
        flags integer not null,
        data text not null
    );
    CREATE TABLE cards (
        id integer primary key,
        nid integer not null,
        did integer not null,
        ord integer not null,
        mod integer not null,
        usn integer not null,
        type integer not null,
        queue integer not null,
        due integer not null,
        ivl integer not null,
        factor integer not null,
        reps integer not null,
        lapses integer not null,
        left integer not null,
        odue integer not null,
        odid integer not null,
        flags integer not null,
        data text not null
    );
    CREATE TABLE revlog (
        id integer primary key,
        cid integer not null,
        usn integer not null,
        ease integer not null,
        ivl integer not null,
        lastIvl integer not null,
        factor integer not null,
        time integer not null,
        type integer not null
    );
    CREATE TABLE graves (
        usn integer not null,
        oid integer not null,
        type integer not null
    );
    """)

    model_id = 1715000000001
    deck_id  = 1715000000002

    models = {
        str(model_id): {
            "id": model_id, "name": "Neurologia Cloze",
            "type": 1, "mod": int(time.time()), "usn": -1,
            "sortf": 0, "did": deck_id, "tmpls": [{
                "name": "Cloze", "ord": 0,
                "qfmt": "{{cloze:Text}}",
                "afmt": "{{cloze:Text}}<br>{{Extra}}",
                "did": None, "bqfmt": "", "bafmt": ""
            }],
            "flds": [
                {"name": "Text",  "ord": 0, "sticky": False, "rtl": False, "font": "Arial", "size": 20},
                {"name": "Extra", "ord": 1, "sticky": False, "rtl": False, "font": "Arial", "size": 20},
            ],
            "css": ".card{font-family:Arial;font-size:18px;} .cloze{font-weight:bold;color:#00f;}",
            "latexPre": "", "latexPost": "", "vers": [], "tags": [],
        }
    }
    decks = {
        str(deck_id): {
            "id": deck_id, "name": "Neurología y Geriatría - High Yield EUNACOM",
            "desc": "", "extendRev": 50, "usn": -1, "newToday": [0, 0],
            "timeToday": [0, 0], "revToday": [0, 0], "lrnToday": [0, 0],
            "mod": int(time.time()), "collapsed": False, "browserCollapsed": False,
            "conf": 1, "dyn": 0
        }
    }
    dconf = {"1": {"id": 1, "name": "Default", "replayq": True, "lapse": {"leechFails": 8, "minInt": 1, "delays": [10], "leechAction": 0, "mult": 0}, "rev": {"perDay": 200, "ease4": 1.3, "hardFactor": 1.2, "ivlFct": 1, "maxIvl": 36500, "minSpace": 1, "bury": True, "fuzz": 0.05}, "timer": 0, "maxTaken": 60, "usn": -1, "new": {"perDay": 20, "delays": [1, 10], "separate": True, "ints": [1, 4, 7], "initialFactor": 2500, "bury": True, "order": 1}, "mod": 0, "autoplay": True}}

    c.execute("INSERT INTO col VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)", (
        1, int(time.time()), int(time.time()), int(time.time() * 1000),
        11, 0, -1, 0,
        json.dumps({"nextPos": 1, "estTimes": True, "activeDecks": [deck_id], "sortType": "noteFld", "timeLim": 0, "sortBackwards": False, "addToCur": True, "curDeck": deck_id, "newBury": True, "newSpread": 0, "dueCounts": True, "curModel": str(model_id), "collapseTime": 1200}),
        json.dumps(models), json.dumps(decks), json.dumps(dconf), "{}"
    ))

    note_id = now_ms
    card_id = now_ms + 100000

    for topic in topics:
        for fc in topic.get("flashcards", []):
            front = fc["front"].replace("'", "'")
            back  = fc["back"].replace("'", "'")
            cloze_text = f"{{{{c1::{back}}}}}"
            flds = f"{front} → {cloze_text}\x1f"
            guid = hashlib.md5(flds.encode()).hexdigest()[:10]
            csum = struct.unpack(">I", hashlib.sha1(front.encode()).digest()[:4])[0]
            c.execute("INSERT INTO notes VALUES (?,?,?,?,?,?,?,?,?,?,?)",
                      (note_id, guid, model_id, int(time.time()), -1,
                       topic["title"], flds, 0, csum, 0, ""))
            c.execute("INSERT INTO cards VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                      (card_id, note_id, deck_id, 0, int(time.time()), -1,
                       0, 0, card_id, 0, 0, 0, 0, 0, 0, 0, 0, ""))
            note_id += 1
            card_id += 1

    conn.commit()
    conn.close()

    meta_content = json.dumps({"mod": int(time.time()), "scm": int(time.time() * 1000)})
    with zipfile.ZipFile(out_path, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.write(col_db, "collection.anki2")
        zf.writestr("media", "{}")
        zf.writestr("meta", meta_content)
    os.remove(col_db)
    print(f"✅ Anki deck: {out_path}")

# ─── main ─────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("Loading questions...")
    questions = load_questions()
    print(f"  Loaded {len(questions)} questions")

    print("Assigning questions to topics...")
    topics = assign_questions(TOPICS, questions)
    for t in topics:
        lesson_rcs = sum(1 for b in LESSONS.get(t["id"],[]) if b.get("type")=="rapid_check")
        print(f"  {t['icon']} {t['title']}: {len(t['questions'])} questions | {lesson_rcs} rapid-checks")

    print("Building JSON...")
    topics_out = build_json(topics)
    total_q   = sum(len(t["questions"]) for t in topics)
    total_fc  = sum(len(t["flashcards"]) for t in topics)
    total_pearls = sum(len(t["pearls"]) for t in topics)
    total_rc  = sum(sum(1 for b in LESSONS.get(t["id"],[]) if b.get("type")=="rapid_check") for t in topics)
    guide = {
        "meta": {
            "subject": "Neurología y Geriatría",
            "totalQuestions": total_q,
            "totalFlashcards": total_fc,
            "totalPearls": total_pearls,
            "totalRapidChecks": total_rc,
            "generated": "2026-05-12",
        },
        "topics": topics_out,
    }
    json_path = os.path.join(OUT_DIR, "neurologia-high-yield.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(guide, f, ensure_ascii=False, indent=2)
    print(f"✅ JSON: {json_path}")

    print("Building Anki .apkg...")
    apkg_path = os.path.join(OUT_DIR, "neurologia-anki.apkg")
    build_apkg(topics, apkg_path)

    print(f"\n🎉 Done! {total_q} questions | {total_fc} flashcards | {total_rc} rapid-checks across {len(topics)} topics")
