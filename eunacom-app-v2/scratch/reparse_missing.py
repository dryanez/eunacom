import fitz
import json
import re

pdf_pauta = "/Users/felipeyanez/.gemini/antigravity/brain/8bb42034-29bc-437e-83c1-b314baa0eec8/media__1782605236475.pdf"

# Extract Pauta text
pauta_doc = fitz.open(pdf_pauta)
pauta_text = ""
for page in pauta_doc:
    pauta_text += page.get_text() + "\n"

def fix_text(t):
    # Fix common font ligatures issues
    t = t.replace("Gco", "tico")
    t = t.replace("Gca", "tica")
    t = t.replace("Gva", "tiva")
    t = t.replace("Gvo", "tivo")
    t = t.replace("Gón", "tión")
    t = t.replace("Na", "fía")
    t = t.replace("Nsico", "físico")
    t = t.replace("diNcil", "difícil")
    t = t.replace("Vfico", "típico")
    t = t.replace("anG", "anti")
    t = t.replace("insG", "insti")
    t = t.replace("vesG", "vesti")
    t = t.replace("arG", "arti")
    t = t.replace("enG", "enti")
    t = t.replace("inG", "inti")
    t = t.replace("esG", "esti")
    t = t.replace("unG", "unti")
    t = t.replace("laV", "latí")
    return t

pauta_text = fix_text(pauta_text)

# Parse Pauta
# Structure can be:
# 1 \n A \n Explicacion
# OR
# 1 \n A Explicacion
# So we make the newline after the letter optional!
# Also, sometimes the text has extra newlines.

pauta_dict = {}
# Regex explanation:
# ^(\d+)\s*\n         -> Number, optional spaces, newline
# ([A-E])             -> Letter
# (?:\s*\n|\s+)       -> Either a newline with spaces, OR just spaces (so "A Es" or "A \n Es")
# (.*?)(?=^\d+\s*\n[A-E](?:\s*\n|\s+)|\Z) -> The explanation text until the next question or EOF

matches = re.findall(r'^(\d+)(?:\s*\n|\s+)([A-E])(?:\s*\n|\s+)(.*?)(?=^\d+(?:\s*\n|\s+)[A-E](?:\s*\n|\s+)|\Z)', pauta_text, re.MULTILINE | re.DOTALL)

for m in matches:
    q_num = int(m[0])
    correct_answer = m[1].lower()
    explanation = m[2].strip().replace('\n', ' ')
    pauta_dict[q_num] = {
        'correctAnswer': correct_answer,
        'explanation': explanation
    }

print(f"Reparsed {len(pauta_dict)} answers from Pauta.")
for q in [1, 2, 3, 141, 159]:
    if q in pauta_dict:
        print(f"Found Q{q}: {pauta_dict[q]['correctAnswer']} - {pauta_dict[q]['explanation'][:30]}")
    else:
        print(f"MISSING Q{q}")

json_path = "/Users/felipeyanez/Desktop/NEWeunacom/eunacom-app-v2/public/data/reconstrucciones/eunacom-dic-2025.json"
with open(json_path, 'r') as f:
    data = json.load(f)

for q in data['questions']:
    if q['id'] in pauta_dict:
        q['correctAnswer'] = pauta_dict[q['id']]['correctAnswer']
        q['explanation'] = pauta_dict[q['id']]['explanation']

data['questions_with_answers'] = len([q for q in data['questions'] if q.get('correctAnswer')])

with open(json_path, 'w') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"JSON updated! Total with answers: {data['questions_with_answers']}")
