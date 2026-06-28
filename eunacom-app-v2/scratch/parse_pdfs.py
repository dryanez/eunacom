import fitz
import json
import re
import os

pdf_pauta = "/Users/felipeyanez/.gemini/antigravity/brain/8bb42034-29bc-437e-83c1-b314baa0eec8/media__1782605236475.pdf"
pdf_questions = "/Users/felipeyanez/.gemini/antigravity/brain/8bb42034-29bc-437e-83c1-b314baa0eec8/media__1782605236970.pdf"

# 1. Extract Pauta text
pauta_doc = fitz.open(pdf_pauta)
pauta_text = ""
for page in pauta_doc:
    pauta_text += page.get_text() + "\n"

# 2. Extract Questions text and images
q_doc = fitz.open(pdf_questions)
q_text = ""
images = []
for i in range(len(q_doc)):
    page = q_doc[i]
    q_text += page.get_text() + "\n"
    for img in page.get_images(full=True):
        xref = img[0]
        pix = fitz.Pixmap(q_doc, xref)
        if pix.n - pix.alpha > 3:
            pix = fitz.Pixmap(fitz.csRGB, pix)
        images.append(pix)

# Save images
out_dir = "/Users/felipeyanez/Desktop/NEWeunacom/eunacom-app-v2/public/img/dic-2025"
os.makedirs(out_dir, exist_ok=True)
question_ids = [3, 4, 26, 44, 80, 81, 106, 115, 132, 138, 162, 176]

for i, pix in enumerate(images):
    if i < len(question_ids):
        q_id = question_ids[i]
        pix.save(os.path.join(out_dir, f"q{q_id}.png"))

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
q_text = fix_text(q_text)

# Parse Pauta
# Structure: "1 \nA \nExplicacion...\n2 \nB \nExplicacion"
pauta_dict = {}
matches = re.findall(r'^(\d+)\s*\n([A-E])\s*\n(.*?)(?=^\d+\s*\n[A-E]\s*\n|\Z)', pauta_text, re.MULTILINE | re.DOTALL)
for m in matches:
    q_num = int(m[0])
    correct_answer = m[1].lower()
    explanation = m[2].strip().replace('\n', ' ')
    pauta_dict[q_num] = {
        'correctAnswer': correct_answer,
        'explanation': explanation
    }

# Parse Questions
# Structure: "1) Pregunta...\na) opcion\nb) opcion..."
q_blocks = re.split(r'(?m)^(\d+)\)\s*', q_text)
questions_dict = {}

for i in range(1, len(q_blocks), 2):
    q_num = int(q_blocks[i])
    block = q_blocks[i+1]
    
    # Split the block into question text and options
    opt_split = re.split(r'(?m)^([a-e]\)) ', block)
    q_t = opt_split[0].strip().replace('\n', ' ')
    
    options = []
    for j in range(1, len(opt_split), 2):
        opt_letter = opt_split[j].replace(')', '')
        opt_text = opt_split[j+1].strip().replace('\n', ' ')
        options.append(f"{opt_letter}) {opt_text}")
        
    questions_dict[q_num] = {
        'id': q_num,
        'question': q_t,
        'options': options,
        'correctAnswer': pauta_dict.get(q_num, {}).get('correctAnswer', ''),
        'explanation': pauta_dict.get(q_num, {}).get('explanation', '')
    }

image_mapping = {qid: f"/img/dic-2025/q{qid}.png" for qid in question_ids}

final_questions = []
for i in range(1, 181):
    if i in questions_dict:
        q = questions_dict[i]
        if i in image_mapping:
            q['imageUrl'] = image_mapping[i]
        # Some fallback for missing options/answer
        final_questions.append(q)

print(f"Parsed {len(pauta_dict)} answers/explanations from Pauta.")
print(f"Parsed {len(questions_dict)} questions from PDF.")
print(f"Final merged questions: {len(final_questions)}")

json_path = "/Users/felipeyanez/Desktop/NEWeunacom/eunacom-app-v2/public/data/reconstrucciones/eunacom-dic-2025.json"
with open(json_path, 'r') as f:
    data = json.load(f)

data['questions'] = final_questions
data['total_questions'] = len(final_questions)
data['questions_with_answers'] = len([q for q in final_questions if q.get('correctAnswer')])

with open(json_path, 'w') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("JSON updated successfully.")
