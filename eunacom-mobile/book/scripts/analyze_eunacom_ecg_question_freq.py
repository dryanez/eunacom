import json

bank_path = r'd:\Anti\Eunacom\eunacom-app-v2\public\data\pruebas\modulo-1-cardiologia.json'
with open(bank_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

all_questions = []
for p in data.get('pruebas', []):
    for q in p.get('questions', []):
        all_questions.append(q)

print(f"Total questions analyzed: {len(all_questions)}")

keywords = {
    '1. Fibrilación Auricular & Flutter Auricular': ['fibrilac', 'flutter', 'fa ', 'respuesta ventricular', 'ondas f', 'anticoagulac'],
    '2. IAM / Supradesnivel ST / Derivaciones Derechas (V3R-V4R)': ['supradesnivel', 'infradesnivel', 'iam', 'st ', 'v3r', 'v4r', 'troponina', 'reperfusi'],
    '3. Bloqueos AV (1º, 2º Mobitz I, Mobitz II, 3º Grado)': ['bloqueo av', 'bloqueo auriculoventricular', 'wenckebach', 'mobitz', 'completo', 'disociaci'],
    '4. TPSV / Maniobras Vagales / Adenosina': ['tpsv', 'supraventricular', 'adenosina', 'maniobra vagal', 'reentrada'],
    '5. Taquicardia Ventricular / TV Monomórfica / Torsades': ['ventricular', 'torsade', 'qrs ancho', 'amiodarona', 'cardioversi'],
    '6. Pericarditis Aguda / Taponamiento / Alternancia Eléctrica': ['pericard', 'taponamiento', 'alternancia', 'frote', 'colchicina'],
    '7. Trastornos del Potasio (Hiperkalemia / Hipokalemia)': ['hiperkalemia', 'hipokalemia', 'potasio', 't picuda', 'onda u'],
    '8. Valvulopatías / Soplos (Estenosis Aórtica / Mitral)': ['soplo', 'estenosis a', 'insuficiencia a', 'estenosis m', 'insuficiencia m', 'chasquido', 'retumbo']
}

counts = {k: 0 for k in keywords}

for q in all_questions:
    q_text = (q.get('pregunta', '') + ' ' + q.get('questionText', '') + ' ' + q.get('explicacion', '') + ' ' + ' '.join(q.get('tags', []))).lower()
    for cat, terms in keywords.items():
        if any(t in q_text for t in terms):
            counts[cat] += 1

print("\n=== RANKING DE FRECUENCIA EN EL BANCO DE PREGUNTAS EUNACOM CARDIOLOGÍA ===")
for cat, count in sorted(counts.items(), key=lambda x: x[1], reverse=True):
    print(f"  [*] {cat}: {count} preguntas")
