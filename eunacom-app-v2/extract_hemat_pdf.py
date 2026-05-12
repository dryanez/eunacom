#!/usr/bin/env python3
"""
Extract questions from hematología PDF (Guevara format),
match to existing modulo-1-hematologia.json questions,
and merge: PDF question text + PDF answer + existing explanation.
"""

import json
import re
import sys
from pathlib import Path
from pypdf import PdfReader
from difflib import SequenceMatcher

PDF_PATH   = Path(__file__).parent / "public/data/pruebas/hrmatologia question tomo 1.pdf"
JSON_PATH  = Path(__file__).parent / "public/data/pruebas/modulo-1-hematologia.json"
OUT_PATH   = Path(__file__).parent / "public/data/pruebas/modulo-1-hematologia.json"
DRY_RUN    = "--dry-run" in sys.argv  # pass --dry-run to preview without saving

# ─── 1. Extract raw text from PDF ──────────────────────────────────────────────

def get_all_text(pdf_path):
    reader = PdfReader(str(pdf_path))
    pages = [p.extract_text() or "" for p in reader.pages]
    return pages

# ─── 2. Parse answer key ────────────────────────────────────────────────────────

def parse_answer_key(pages):
    """Returns {prueba_num: {q_num: 'A'/'B'/...}}"""
    # Join last pages into one block
    tail = "\n".join(pages[-3:])
    answers = {}
    # Find each "Prueba N" block in the answer section
    blocks = re.split(r'Prueba\s+(\d+)', tail)
    # blocks = ['prefix', '1', 'answers for 1', '2', 'answers for 2', ...]
    i = 1
    while i < len(blocks) - 1:
        prueba_num = int(blocks[i])
        block_text = blocks[i + 1]
        # Parse lines like "1 E", "2 A" etc
        qa = {}
        for m in re.finditer(r'\b(\d+)\s+([A-Ea-e])\b', block_text):
            qa[int(m.group(1))] = m.group(2).upper()
        if qa:
            answers[prueba_num] = qa
        i += 2
    return answers

# ─── 3. Parse questions from PDF pages ─────────────────────────────────────────

def clean_block(text):
    """Collapse split lines (PDF column artifacts) while preserving structure."""
    lines = text.split('\n')
    merged = []
    buf = ""
    for line in lines:
        stripped = line.strip()
        if not stripped:
            if buf:
                merged.append(buf)
                buf = ""
            continue
        # Option lines: start with "a)" … "e)" — keep as own line
        if re.match(r'^[a-eA-E]\)', stripped):
            if buf:
                merged.append(buf)
            buf = stripped
        elif buf:
            buf += " " + stripped
        else:
            buf = stripped
    if buf:
        merged.append(buf)
    return "\n".join(merged)

def parse_pruebas_from_pages(pages):
    """
    Parse page by page, tracking current prueba number.
    Returns dict: {prueba_num: [{'numero': N, 'pregunta': str, 'opciones': [...]}]}
    """
    result = {}
    current_prueba = None
    current_text_lines = []

    def flush(prueba_num, lines):
        if prueba_num and lines:
            block = clean_block("\n".join(lines))
            qs = parse_questions_from_block(block)
            if qs:
                result.setdefault(prueba_num, []).extend(qs)

    for i, page_text in enumerate(pages[:-1]):  # skip last 3 (answer key)
        for line in page_text.split('\n'):
            stripped = line.strip()
            # Skip page number and author header lines
            if re.match(r'^\d{3}$', stripped):
                continue
            if 'Dr. Guillermo Guevara' in stripped:
                continue
            if 'IX) HEMATO' in stripped:
                continue
            # Detect prueba header (may have trailing text like "(HEMATO-ONCOLOGÍA PEDIÁTRICA)")
            m = re.match(r'^Prueba\s+(\d+)', stripped)
            if m:
                # Flush previous prueba's accumulated lines immediately
                flush(current_prueba, current_text_lines)
                current_prueba = int(m.group(1))
                current_text_lines = []
                continue
            current_text_lines.append(line)

    flush(current_prueba, current_text_lines)
    return result

def parse_questions_from_block(text):
    """Parse numbered questions + a-e options from a text block."""
    questions = []
    # Split on question numbers: "1)", "2)", etc.
    parts = re.split(r'(?<!\w)(\d{1,2})\)\s*', text)
    # parts = ['preamble', '1', 'text for Q1', '2', 'text for Q2', ...]
    i = 1
    while i < len(parts) - 1:
        q_num = int(parts[i])
        q_text = parts[i + 1].strip()
        # Separate question stem from options
        # Options start with "a)" or "a) " etc
        opt_split = re.split(r'\n\s*([a-e])\)\s*', q_text)
        if len(opt_split) < 3:
            # try inline split
            opt_split = re.split(r'(?<!\w)([a-e])\)\s', q_text)

        stem = opt_split[0].strip()
        opciones = []
        j = 1
        while j < len(opt_split) - 1:
            opt_id = opt_split[j].upper()
            opt_text = opt_split[j + 1].strip().rstrip()
            opciones.append({"id": opt_id, "text": opt_text})
            j += 2

        # Only keep if we got the stem and at least some options
        if stem and len(opciones) >= 2:
            questions.append({
                "numero": q_num,
                "pregunta": stem,
                "opciones": opciones
            })
        i += 2
    return questions

# ─── 4. Fuzzy match ────────────────────────────────────────────────────────────

def normalize(s):
    s = s.lower()
    s = re.sub(r'\s+', ' ', s)
    s = re.sub(r'[^\w\s]', '', s)
    return s.strip()

def similarity(a, b):
    return SequenceMatcher(None, normalize(a), normalize(b)).ratio()

def find_best_match(pdf_q, existing_qs, threshold=0.65):
    """Return (best_q, score) or (None, 0) if no match above threshold."""
    best = None
    best_score = 0
    for eq in existing_qs:
        s = similarity(pdf_q['pregunta'], eq['pregunta'])
        if s > best_score:
            best_score = s
            best = eq
    if best_score >= threshold:
        return best, best_score
    return None, best_score

# ─── 5. Main merge logic ───────────────────────────────────────────────────────

def letter_to_index(letter):
    return ord(letter.upper()) - ord('A')

def main():
    print("📄 Reading PDF...")
    pages = get_all_text(PDF_PATH)
    print(f"   {len(pages)} pages")

    print("🔑 Parsing answer key...")
    answer_key = parse_answer_key(pages)
    for pn, qs in sorted(answer_key.items()):
        print(f"   Prueba {pn}: {len(qs)} answers")

    print("📝 Parsing questions...")
    pdf_pruebas = parse_pruebas_from_pages(pages)
    for pn, qs in sorted(pdf_pruebas.items()):
        print(f"   Prueba {pn}: {len(qs)} questions")

    print("📂 Loading existing JSON...")
    with open(JSON_PATH) as f:
        data = json.load(f)
    pruebas_json = data['pruebas']
    print(f"   {len(pruebas_json)} existing pruebas")

    # Build a flat list of all existing questions for matching
    all_existing = []
    for p in pruebas_json:
        for q in p.get('questions', []):
            all_existing.append({'prueba': p['id'], 'q': q})

    # ─── Process each PDF prueba ───────────────────────────────────────────────
    stats = {'matched': 0, 'no_match': 0, 'answer_fixed': 0, 'answer_ok': 0}

    for prueba_num, pdf_qs in sorted(pdf_pruebas.items()):
        pdf_answers = answer_key.get(prueba_num, {})

        # Find the matching prueba in the JSON (by index: PDF prueba 1 → json prueba 0)
        json_prueba = None
        for p in pruebas_json:
            # Match by name "Prueba N" or by position
            if p.get('name', '').strip() == f"Prueba {prueba_num}":
                json_prueba = p
                break
        if not json_prueba and prueba_num - 1 < len(pruebas_json):
            json_prueba = pruebas_json[prueba_num - 1]

        print(f"\n{'='*60}")
        print(f"PDF Prueba {prueba_num} → JSON: {json_prueba['name'] if json_prueba else 'NOT FOUND'}")

        for pdf_q in pdf_qs:
            q_num = pdf_q['numero']
            correct_letter = pdf_answers.get(q_num)

            # Try to find match in all existing questions
            match, score = find_best_match(pdf_q, [item['q'] for item in all_existing])

            if match:
                stats['matched'] += 1
                # Check if answer matches
                existing_answer = match.get('respuestaCorrecta', '')
                answer_matches = existing_answer.upper() == (correct_letter or '').upper()

                if not answer_matches and correct_letter:
                    stats['answer_fixed'] += 1
                    print(f"  Q{q_num} ✓ match (score={score:.2f}) | answer: {existing_answer} → {correct_letter} FIXED")
                    # Update the match answer
                    match['respuestaCorrecta'] = correct_letter
                    # Update opciones isCorrect if present
                    for opt in match.get('opciones', []):
                        opt['esCorrecta'] = (opt['id'].upper() == correct_letter.upper())
                else:
                    stats['answer_ok'] += 1
                    print(f"  Q{q_num} ✓ match (score={score:.2f}) | answer: {correct_letter} ✓")

                # If the pdf has better/cleaner question text, use it
                # (only if similarity is high enough that it's clearly the same question)
                if score > 0.80 and len(pdf_q['pregunta']) > 20:
                    match['pregunta_pdf'] = pdf_q['pregunta']  # keep original, add pdf version

            else:
                stats['no_match'] += 1
                print(f"  Q{q_num} ✗ NO MATCH (best score={score:.2f}) | {pdf_q['pregunta'][:80]}")
                # Add as new question to the corresponding prueba
                if json_prueba and correct_letter:
                    new_q = {
                        "numero": q_num,
                        "pregunta": pdf_q['pregunta'],
                        "opciones": pdf_q['opciones'],
                        "respuestaCorrecta": correct_letter,
                        "explicacion": "",
                        "explicacionIncorrectas": "",
                        "codigoEunacom": "",
                        "tags": "",
                        "fuente": "PDF Guevara Hematología"
                    }
                    # Check if this question number already exists in the prueba
                    existing_nums = {q['numero'] for q in json_prueba.get('questions', [])}
                    if q_num not in existing_nums:
                        json_prueba.setdefault('questions', []).append(new_q)
                        print(f"        → Added as new question to {json_prueba['name']}")

    print(f"\n{'='*60}")
    print(f"📊 Results:")
    print(f"   Matched:       {stats['matched']}")
    print(f"   Answers fixed: {stats['answer_fixed']}")
    print(f"   Answers OK:    {stats['answer_ok']}")
    print(f"   No match:      {stats['no_match']}")

    if DRY_RUN:
        print("\n⚠️  DRY RUN — not saving. Remove --dry-run to save.")
        return

    # Save
    with open(OUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"\n✅ Saved to {OUT_PATH}")

if __name__ == '__main__':
    main()
