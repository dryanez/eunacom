import re
import json

with open('/Users/felipeyanez/Desktop/NEWeunacom/eunacom-app-v2/scratch/raw_message.txt', 'r') as f:
    text = f.read()

parts = text.split('==Start of PDF==')
pauta_text = parts[1]
questions_text = parts[2]

# Parse Pauta
# Format in OCR:
# N° RC Explicación
# 1
# A Es una insuficiencia mitral clásica...
# 2
# D Es una angina crónica estable...

pauta_dict = {}

# Clean up pauta_text (remove header lines like ==Start of OCR for page...==)
pauta_clean = re.sub(r'==.*?==', '', pauta_text)
pauta_clean = re.sub(r'N° RC Explicación', '', pauta_clean)
# We can find questions by looking for a line with just a number, followed by a letter, followed by explanation
matches = re.findall(r'^(\d+)\s*\n([A-E])\s+(.*?)(?=^\d+\s*\n[A-E]\s+|\Z)', pauta_clean, re.MULTILINE | re.DOTALL)
for m in matches:
    q_num = int(m[0])
    correct_answer = m[1].lower()
    explanation = m[2].strip().replace('\n', ' ')
    pauta_dict[q_num] = {
        'correctAnswer': correct_answer,
        'explanation': explanation
    }

# Parse Questions
# Format in OCR:
# 1) Una paciente de 45 años...
# a) Insuficiencia mitral
# b) Insuficiencia aórtica
# c) Estenosis mitral
# d) Estenosis aórtica
# e) Ductus arterioso persistente

questions_clean = re.sub(r'==.*?==', '', questions_text)

q_matches = re.findall(r'^(\d+)\)\s*(.*?)(?=^[a-e]\) |\Z)', questions_clean, re.MULTILINE | re.DOTALL)

questions_dict = {}
for m in q_matches:
    q_num = int(m[0])
    question_text = m[1].strip().replace('\n', ' ')
    questions_dict[q_num] = {
        'question': question_text,
        'options': []
    }

# We also need to extract options
# Let's do it by splitting by \d+) 
q_blocks = re.split(r'(?m)^(\d+)\)\s*', questions_clean)
# q_blocks[0] is garbage before Q1
# q_blocks[1] is '1'
# q_blocks[2] is the question + options for Q1

for i in range(1, len(q_blocks), 2):
    q_num = int(q_blocks[i])
    block = q_blocks[i+1]
    
    # Split the block into question text and options
    # Options start with "a) "
    opt_split = re.split(r'(?m)^([a-e]\)) ', block)
    # opt_split[0] is question text
    q_text = opt_split[0].strip().replace('\n', ' ')
    
    options = []
    # from opt_split[1] onwards, they come in pairs: 'a)', 'Text...'
    for j in range(1, len(opt_split), 2):
        opt_letter = opt_split[j]
        opt_text = opt_split[j+1].strip().replace('\n', ' ')
        options.append(f"{opt_letter} {opt_text}")
        
    questions_dict[q_num] = {
        'id': q_num,
        'question': q_text,
        'options': options,
        'correctAnswer': pauta_dict.get(q_num, {}).get('correctAnswer', ''),
        'explanation': pauta_dict.get(q_num, {}).get('explanation', '')
    }

# Images:
image_mapping = {
    3: "/img/dic-2025/q3.png",
    4: "/img/dic-2025/q4.png",
    26: "/img/dic-2025/q26.png",
    44: "/img/dic-2025/q44.png",
    80: "/img/dic-2025/q80.png",
    81: "/img/dic-2025/q81.png",
    106: "/img/dic-2025/q106.png",
    115: "/img/dic-2025/q115.png",
    132: "/img/dic-2025/q132.png",
    138: "/img/dic-2025/q138.png",
    162: "/img/dic-2025/q162.png",
    176: "/img/dic-2025/q176.png"
}

final_questions = []
for i in range(1, 181):
    if i in questions_dict:
        q = questions_dict[i]
        if i in image_mapping:
            q['imageUrl'] = image_mapping[i]
        final_questions.append(q)

print(f"Parsed {len(pauta_dict)} answers/explanations from Pauta.")
print(f"Parsed {len(questions_dict)} questions from PDF.")
print(f"Final merged questions: {len(final_questions)}")

with open('/Users/felipeyanez/Desktop/NEWeunacom/eunacom-app-v2/scratch/parsed_questions.json', 'w') as f:
    json.dump(final_questions, f, indent=2, ensure_ascii=False)
