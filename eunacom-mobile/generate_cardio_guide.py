#!/usr/bin/env python3
"""
Generates cardiologia-high-yield.json and cardiologia-anki.apkg
from public/data/pruebas/modulo-1-cardiologia.json

Run from eunacom-app-v2/:
    python3 generate_cardio_guide.py
"""

import json, os, re, sqlite3, struct, time, zipfile, hashlib, random
from lessons_cardiologia import LESSONS

# ─── paths ────────────────────────────────────────────────────────────────
BASE = os.path.dirname(os.path.abspath(__file__))
PRUEBAS_DIR = os.path.join(BASE, "public", "data", "pruebas")
OUT_DIR     = os.path.join(BASE, "public", "data", "study-guides")
os.makedirs(OUT_DIR, exist_ok=True)

# ─── topic definitions ────────────────────────────────────────────────────
TOPICS = [
    {
        "id": "insuficiencia-cardiaca",
        "title": "Insuficiencia Cardíaca y Miocardiopatías",
        "icon": "❤️",
        "color": "#ef4444",
        "keywords": [
            "insuficiencia cardíaca", "insuficiencia cardiaca", "fevi", "miocardiopatía", "miocardiopatia",
            "framingham", "espironolactona", "furosemida", "enalapril", "carvedilol", "sacubitrilo",
            "cor pulmonale", "corazón pulmonar", "corazon pulmonar", "congestion pulmonar", "ingurgitación yugular"
        ],
        "pearls": [
            "🔑 **Etiología:** Causa más frecuente de IC en Chile es la cardiopatía coronaria e hipertensiva.",
            "🔑 **Framingham:** 2 mayores o 1 mayor + 2 menores para diagnóstico clínico de IC.",
            "🔑 **FEVI reducida (≤40%):** Requiere cuádruple terapia bloqueadora neurohumoral (IECA/ARA II/ARNI + Betabloqueador + Espironolactona + iSGLT2) para disminuir mortalidad.",
            "🔑 **Furosemida:** Solo sintomático. NO disminuye mortalidad a largo plazo.",
            "🔑 **Miocardiopatía Hipertrófica (MCHO):** Causa común de muerte súbita en atletas jóvenes. Soplo sistólico que aumenta con Valsalva y bipedestación (menor precarga/llenado ventricular).",
        ],
        "flashcards": [
            {"front": "Causa más frecuente de insuficiencia cardíaca en Chile", "back": "Cardiopatía coronaria y cardiopatía hipertensiva"},
            {"front": "Fármaco diurético sintomático en IC que NO reduce la mortalidad", "back": "Furosemida (diurético de asa)"},
            {"front": "Fármacos pilares en ICFEr que reducen la mortalidad", "back": "IECAs/ARA II/ARNI, Betabloqueadores, Espironolactona e iSGLT2"},
            {"front": "Criterios clínicos diagnósticos de insuficiencia cardíaca", "back": "Criterios de Framingham (2 mayores o 1 mayor + 2 menores)"},
            {"front": "Examen estándar de oro inicial para clasificar IC y medir FEVI", "back": "Ecocardiograma transtorácico"},
        ],
    },
    {
        "id": "cardiopatia-isquemia",
        "title": "Cardiopatía Isquémica e Infarto (SCA)",
        "icon": "⚡",
        "color": "#f97316",
        "keywords": [
            "infarto", "iam", "isquémica", "isquemica", "angina", "coronario", "troponina",
            "trombolisis", "angioplastia", "sdst", "snesd", "isquemia", "reperfusión", "mononitrato", "nitroglicerina"
        ],
        "pearls": [
            "🔑 **IAM con SDST:** Supradesnivel del ST en ≥2 derivadas contiguas. Tratamiento: Angioplastia si ventana &lt; 120 min, de lo contrario realizar trombolisis inmediata.",
            "🔑 **SCA sin SDST vs Angina Inestable:** Ambos tienen clínica/ECG similar, pero IAMSEST tiene troponinas (+) y la Angina Inestable tiene troponinas (-).",
            "🔑 **Nitroglicerina sublingual:** Fármaco sintomático de elección para crisis anginosas. Contraindicado si hay hipotensión o uso de sildenafil.",
            "🔑 **Prevención secundaria post-IAM:** Aspirina 100 mg + Betabloqueador + Estatina de alta intensidad + IECA (disminuyen mortalidad).",
        ],
        "flashcards": [
            {"front": "Tiempo límite de traslado para preferir Angioplastia (ICP) sobre Trombolisis", "back": "120 minutos"},
            {"front": "Diferencia analítica clave entre IAMSEST y Angina Inestable", "back": "Troponinas: positivas en IAMSEST, negativas en Angina Inestable"},
            {"front": "Tratamiento de elección para la angina crónica estable (sintomático)", "back": "Betabloqueadores"},
            {"front": "Tratamiento farmacológico de prevención secundaria post-infarto", "back": "Aspirina + Betabloqueador + Estatina de alta intensidad + IECA"},
            {"front": "Contraindicación absoluta de nitroglicerina sublingual", "back": "Hipotensión o uso de inhibidores de la 5-fosfodiesterasa (Sildenafil)"},
        ],
    },
    {
        "id": "hta-riesgo",
        "title": "Hipertensión Arterial y Prevención RCV",
        "icon": "📊",
        "color": "#eab308",
        "keywords": [
            "hipertensión", "hipertension", "hta", "presión arterial", "presion arterial", "mapa", "holter de presión", "holter de presion",
            "tiazida", "amlodipino", "losartán", "losartan", "dislipidemia", "lipídico", "lipidico", "colesterol", "estatina", "anticoagulante",
            "anticoagulación", "anticoagulacion", "inr", "acenocumarol", "warfarina", "cumarin"
        ],
        "pearls": [
            "🔑 **Diagnóstico de HTA:** Promedio ≥140/90 mmHg clínica o MAPA ≥130/80 mmHg (24 horas).",
            "🔑 **HTA en diabéticos/ERC:** Primera línea obligatoria son IECAs o ARA II por su efecto antiproteinúrico y nefroprotector.",
            "🔑 **Objetivo LDL en Riesgo Muy Alto:** &lt; 55 mg/dL en prevención secundaria (post-SCA, ACV o enfermedad arterial periférica).",
            "🔑 **Intoxicación cumarínica con sangrado grave:** Revertir inmediatamente con Vitamina K IV lenta + Complejo Protrombínico / Plasma Fresco.",
            "🔑 **Contraindicación de IECA + ARA II:** NUNCA asociar. Aumenta drásticamente el riesgo de hiperkalemia e insuficiencia renal aguda.",
        ],
        "flashcards": [
            {"front": "Presión promedio de 24 horas diagnóstica de HTA en MAPA", "back": "130/80 mmHg"},
            {"front": "Fármaco antihipertensivo de primera elección en diabéticos y nefrópatas", "back": "IECAs (Enalapril) o ARA II (Losartán)"},
            {"front": "Objetivo de colesterol LDL en prevención secundaria (Riesgo Muy Alto)", "back": "< 55 mg/dL"},
            {"front": "Antídoto de urgencia para hemorragia grave por taco cumarínico", "back": "Vitamina K IV + Complejo Protrombínico (o Plasma Fresco Congelado)"},
            {"front": "Combinación antihipertensiva contraindicada por riesgo de falla renal", "back": "IECAs + ARA II"},
        ],
    },
    {
        "id": "arritmias",
        "title": "Arritmias y Trastornos de Conducción",
        "icon": "🔊",
        "color": "#8b5cf6",
        "keywords": [
            "fibrilación auricular", "fibrilacion auricular", "arritmia", "bloqueo av", "mobitz", "wenckebach",
            "pr prolongado", "tpsv", "adenosina", "ritmo de", "marcapasos", "extrasistolía", "extrasistolia", "flutter"
        ],
        "pearls": [
            "🔑 **ECG de Fibrilación Auricular:** Ritmo irregular (RR variable) con ausencia de ondas P (reemplazadas por ondas f de fibrilación).",
            "🔑 **Bloqueo AV Mobitz II y Completo:** Requieren marcapasos definitivo por alto riesgo de asistolia, síncope y muerte súbita.",
            "🔑 **Regla de las 48h en FA:** Cardiovertir directo si dura &lt;48h. Si dura &gt;48h o tiempo desconocido, requiere 3 semanas de anticoagulación previa o ecocardiograma transesofágico.",
            "🔑 **Manejo de TPSV estable:** Maniobras vagales (Valsalva, masaje carotídeo); si fallan, usar Adenosina IV rápido.",
            "🔑 **Inestabilidad hemodinámica en taquiarritmias:** Indicación absoluta de Cardioversión eléctrica sincronizada inmediata.",
        ],
        "flashcards": [
            {"front": "Arritmia con ausencia de ondas P y ritmo ventricular completamente irregular", "back": "Fibrilación Auricular"},
            {"front": "Bloqueos de segundo grado Mobitz II y completo: tratamiento", "back": "Marcapasos definitivo"},
            {"front": "Conducta ante FA de tiempo de evolución desconocido o >48 horas", "back": "Anticoagulación oral por 3 semanas antes de cardiovertir (o ecotransesofágico)"},
            {"front": "Tratamiento de elección para TPSV estable tras falla de maniobras vagales", "back": "Adenosina IV en bolo rápido"},
            {"front": "Indicación de cardioversión eléctrica sincronizada inmediata en taquiarritmias", "back": "Inestabilidad hemodinámica (hipotensión, shock, dolor anginoso, falla cardíaca)"},
        ],
    },
    {
        "id": "valvulopatias",
        "title": "Valvulopatías y Soplos Cardíacos",
        "icon": "📣",
        "color": "#0ea5e9",
        "keywords": [
            "soplo", "estenosis aórtica", "estenosis aortica", "estenosis mitral", "insuficiencia aórtica",
            "insuficiencia aortica", "insuficiencia mitral", "valvulopatía", "valvulopatia", "apertura",
            "chasquido", "irradiación a carótidas", "irradiacion a carotidas", "axila", "comunicación interauricular",
            "comunicacion interauricular", "cia", "desdoblamiento fijo", "ductus", "coartación", "coartacion"
        ],
        "pearls": [
            "🔑 **Etenosis Aórtica:** Soplo sistólico eyectivo irradiado a carótidas. Tríada clásica de gravedad: Angina, Síncope y Disnea (IC).",
            "🔑 **Estenosis Mitral:** Rolido diastólico con chasquido de apertura. Fuertemente asociada a antecedentes de Fiebre Reumática crónica.",
            "🔑 **Comunicación Interauricular (CIA):** Soplo sistólico pulmonar con desdoblamiento fijo del segundo ruido (S2) en jóvenes.",
            "🔑 **Coartación Aórtica:** HTA en extremidades superiores con pulsos femorales débiles, disminuidos y retrasados respecto al radial.",
            "🔑 **Insuficiencia Mitral Aguda:** Frecuente tras IAM por rotura de músculo papilar o en endocarditis. Causa edema agudo de pulmón súbito.",
        ],
        "flashcards": [
            {"front": "Soplo sistólico de eyección áspero irradiado a carótidas", "back": "Estenosis Aórtica"},
            {"front": "Tríada clásica de gravedad en la estenosis aórtica", "back": "Angina, Síncope y Disnea (Insuficiencia Cardíaca)"},
            {"front": "Valvulopatía más frecuentemente asociada a Fiebre Reumática", "back": "Estenosis Mitral"},
            {"front": "Hallazgo semiológico patognomónico de la CIA", "back": "Desdoblamiento fijo y constante del segundo ruido (S2)"},
            {"front": "Hallazgo clínico sugerente de Coartación Aórtica en el examen físico", "back": "Disminución y retraso de pulsos femorales en comparación con el pulso radial"},
        ],
    },
    {
        "id": "pericardio-infeccion",
        "title": "Patología Pericárdica e Infecciosa",
        "icon": "🛡️",
        "color": "#10b981",
        "keywords": [
            "pericarditis", "taponamiento", "beck", "frote", "endocarditis", "vegetación", "vegetacion",
            "reumática", "reumatica", "jones", "duke", "penicilina benzatina", "penicilina benzatínica"
        ],
        "pearls": [
            "🔑 **Pericarditis aguda:** Dolor retroesternal pleurítico posicional (alivia al inclinarse adelante). ECG: elevación difusa del ST cóncavo (emoticón feliz).",
            "🔑 **Tríada de Beck (Taponamiento):** Hipotensión + ruidos cardíacos apagados + ingurgitación yugular. Tratamiento: Pericardiocentesis de urgencia.",
            "🔑 **Endocarditis infecciosa:** Fiebre persistente + soplo cardíaco nuevo o cambiante. Tomar 3 sets de hemocultivos antes de iniciar antibióticos.",
            "🔑 **Fiebre Reumática:** Criterios de Jones (poliartritis migratoria, carditis, corea, eritema marginado, nódulos subcutáneos). Prevención con Penicilina benzatina.",
        ],
        "flashcards": [
            {"front": "Electrocardiograma en pericarditis aguda", "back": "Supradesnivel del segmento ST difuso con concavidad superior (cara feliz)"},
            {"front": "Tratamiento farmacológico de primera línea en pericarditis aguda", "back": "AINEs (Aspirina/Ibuprofeno) + Colquicina"},
            {"front": "Tríada de Beck: componentes y diagnóstico", "back": "Hipotensión + ruidos apagados + ingurgitación yugular (indica Taponamiento Cardíaco)"},
            {"front": "Manejo inmediato del taponamiento cardíaco severo", "back": "Punción pericárdica (pericardiocentesis) de urgencia"},
            {"front": "Primer paso diagnóstico obligatorio en sospecha de Endocarditis Infecciosa", "back": "Tomar hemocultivos (3 sets) antes de iniciar antibióticos"},
        ],
    },
    {
        "id": "urgencias-reanimacion",
        "title": "Urgencias Cardiovasculares y PCR",
        "icon": "🚨",
        "color": "#ef4444",
        "keywords": [
            "paro", "pcr", "desfibrilación", "desfibrilacion", "asistolia", "aesp", "adrenalina", "amiodarona",
            "disección aórtica", "diseccion aortica", "tep", "embolia pulmonar", "shock", "trombolisis", "reanimación", "reanimacion"
        ],
        "pearls": [
            "🔑 **Ritmos desfibrilables:** Fibrilación Ventricular (FV) y Taquicardia Ventricular sin pulso (TVSP). Requieren descarga inmediata asincrónica.",
            "🔑 **Ritmos no desfibrilables:** Asistolia y Actividad Eléctrica Sin Pulso (AESP). Requieren RCP inmediato y Adrenalina precoz.",
            "🔑 **Disección Aórtica:** Dolor interescapular lancinante y desgarrador de inicio súbito. Diferencia de presión arterial &gt;20 mmHg entre brazos.",
            "🔑 **Tromboembolismo Pulmonar (TEP) inestable:** TEP con shock o hipotensión severa. Requiere trombolisis farmacológica de urgencia (rtPA/Alteplasa).",
            "🔑 **Desfibrilación vs Cardioversión:** Desfibrilación es descarga asincrónica para ritmos sin pulso. Cardioversión es sincronizada con la onda R para taquicardias inestables con pulso.",
        ],
        "flashcards": [
            {"front": "Los dos ritmos de paro desfibrilables", "back": "Fibrilación Ventricular (FV) y Taquicardia Ventricular sin pulso (TVSP)"},
            {"front": "Primer fármaco a administrar en ritmos no desfibrilables de inmediato", "back": "Adrenalina 1 mg IV/IO"},
            {"front": "Diferencia clave entre desfibrilación y cardioversión eléctrica", "back": "Desfibrilación es asincrónica (sin pulso). Cardioversión es sincronizada con la onda R (con pulso)."},
            {"front": "Dolor interescapular lancinante y asimetría de presiones entre brazos", "back": "Disección Aórtica (Confirmar con AngioTAC)"},
            {"front": "Conducta ante Tromboembolismo Pulmonar (TEP) masivo con shock", "back": "Trombolisis farmacológica de urgencia (rtPA/Alteplasa)"},
        ],
    },
]

# ─── load source questions ─────────────────────────────────────────────────
def load_questions():
    questions = []
    fpath = os.path.join(PRUEBAS_DIR, "modulo-1-cardiologia.json")
    if os.path.exists(fpath):
        with open(fpath, encoding="utf-8") as f:
            data = json.load(f)
        if isinstance(data, dict) and "pruebas" in data:
            for prueba in data["pruebas"]:
                questions.extend(prueba.get("questions", []))
    return questions

def text_of(q):
    parts = [q.get("pregunta", ""), q.get("explicacion", ""), q.get("explicacionIncorrectas", "")]
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
            # fallback: first topic (insuficiencia-cardiaca)
            topics[0]["questions"].append(q)

    return topics

# ─── build JSON ───────────────────────────────────────────────────────────
def build_json(topics):
    out = []
    for t in topics:
        qs = []
        # Take at most 12 representative questions per topic to keep size balanced
        shuffled_qs = list(t.get("questions", []))
        random.seed(42)
        random.shuffle(shuffled_qs)
        for q in shuffled_qs[:12]:
            opciones = q.get("opciones", [])
            # If options are in the format [{"id": "A", "text": "..."}]
            formatted_opts = []
            for opt in opciones:
                if isinstance(opt, dict) and "id" in opt and "text" in opt:
                    formatted_opts.append(f"{opt['id']}. {opt['text']}")
                else:
                    formatted_opts.append(str(opt))
            qs.append({
                "numero": q.get("numero") or q.get("codigo_eunacom", ""),
                "pregunta": q.get("pregunta", ""),
                "opciones": formatted_opts,
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

    col_db = "/tmp/cardio_col.db"
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

    model_id = 1716000000001
    deck_id  = 1716000000002

    models = {
        str(model_id): {
            "id": model_id, "name": "Cardiologia Cloze",
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
            "id": deck_id, "name": "Cardiología - High Yield EUNACOM",
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
            front = fc["front"].replace("'", "''")
            back  = fc["back"].replace("'", "''")
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

    # meta must be a binary Protobuf AnkiPackageMetadata
    with zipfile.ZipFile(out_path, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.write(col_db, "collection.anki2")
        zf.writestr("media", "{}")
        zf.writestr("meta", b'\x08\x01')
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
            "subject": "Cardiología",
            "totalQuestions": total_q,
            "totalFlashcards": total_fc,
            "totalPearls": total_pearls,
            "totalRapidChecks": total_rc,
            "generated": time.strftime("%Y-%m-%d"),
        },
        "topics": topics_out,
    }
    
    json_path = os.path.join(OUT_DIR, "cardiologia-high-yield.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(guide, f, ensure_ascii=False, indent=2)
    print(f"✅ JSON: {json_path}")

    print("Building Anki .apkg...")
    apkg_path = os.path.join(OUT_DIR, "cardiologia-anki.apkg")
    build_apkg(topics, apkg_path)

    print(f"\n🎉 Done! {total_q} questions | {total_fc} flashcards | {total_rc} rapid-checks across {len(topics)} topics")
