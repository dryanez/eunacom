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

INDEX_PATH = Path(__file__).parent / "public/data/pruebas/index.json"

def main():
    print("📄 Reading PDF...")
    pages = get_all_text(PDF_PATH)
    print(f"   {len(pages)} pages")

    print("🔑 Parsing answer key...")
    answer_key = parse_answer_key(pages)
    for pn, qs in sorted(answer_key.items()):
        print(f"   Prueba {pn}: {len(qs)} answers")

    print("📝 Parsing questions from PDF...")
    pdf_pruebas = parse_pruebas_from_pages(pages)
    for pn, qs in sorted(pdf_pruebas.items()):
        print(f"   Prueba {pn}: {len(qs)} questions")

    print("📂 Loading existing JSON for explanation mining...")
    with open(JSON_PATH) as f:
        old_data = json.load(f)
    all_existing_qs = [q for p in old_data['pruebas'] for q in p.get('questions', [])]
    print(f"   {len(all_existing_qs)} existing questions to mine explanations from")

    # ─── Rebuild from scratch using only PDF pruebas ──────────────────────────
    stats = {'matched': 0, 'no_match': 0, 'answer_fixed': 0}
    new_pruebas = []

    for prueba_num, pdf_qs in sorted(pdf_pruebas.items()):
        pdf_answers = answer_key.get(prueba_num, {})
        prueba_id = f"modulo-1-hematologia-{prueba_num}"
        built_questions = []

        print(f"\n{'='*60}")
        print(f"Building Prueba {prueba_num} ({len(pdf_qs)} questions)")

        for pdf_q in pdf_qs:
            q_num   = pdf_q['numero']
            correct = pdf_answers.get(q_num, '')

            # Try to find matching existing question to grab explanation
            match, score = find_best_match(pdf_q, all_existing_qs)

            if match and score >= 0.65:
                stats['matched'] += 1
                existing_ans = match.get('respuestaCorrecta', '')
                if existing_ans.upper() != correct.upper() and correct:
                    stats['answer_fixed'] += 1
                    print(f"  Q{q_num} ✓ match({score:.2f}) answer {existing_ans}→{correct} FIXED")
                else:
                    print(f"  Q{q_num} ✓ match({score:.2f}) answer={correct}")

                new_q = {
                    "numero":               q_num,
                    "pregunta":             pdf_q['pregunta'],
                    "opciones":             pdf_q['opciones'],
                    "respuestaCorrecta":    correct or existing_ans,
                    "explicacion":          match.get('explicacion', ''),
                    "explicacionIncorrectas": match.get('explicacionIncorrectas', ''),
                    "codigoEunacom":        match.get('codigoEunacom', '') or match.get('codigo_eunacom', ''),
                    "tags":                 match.get('tags', ''),
                    "videoRecomendado":     match.get('videoRecomendado', ''),
                }
            else:
                stats['no_match'] += 1
                print(f"  Q{q_num} ✗ no match (best={score:.2f}) — no explanation")
                new_q = {
                    "numero":               q_num,
                    "pregunta":             pdf_q['pregunta'],
                    "opciones":             pdf_q['opciones'],
                    "respuestaCorrecta":    correct,
                    "explicacion":          "",
                    "explicacionIncorrectas": "",
                    "codigoEunacom":        "",
                    "tags":                 "",
                    "videoRecomendado":     "",
                }

            built_questions.append(new_q)

        new_pruebas.append({
            "id":            prueba_id,
            "name":          f"Prueba {prueba_num}",
            "sourceFile":    "hrmatologia question tomo 1.pdf",
            "questionCount": len(built_questions),
            "questions":     built_questions,
        })

    print(f"\n{'='*60}")
    print(f"📊 Results:")
    print(f"   PDF pruebas:        {len(new_pruebas)}")
    print(f"   Total questions:    {sum(len(p['questions']) for p in new_pruebas)}")
    print(f"   With explanations:  {stats['matched']}")
    print(f"   Answers fixed:      {stats['answer_fixed']}")
    print(f"   Without explanation:{stats['no_match']}")

    if DRY_RUN:
        print("\n⚠️  DRY RUN — not saving. Remove --dry-run to save.")
        return

    # ─── Save rebuilt hematología JSON ────────────────────────────────────────
    new_data = {"pruebas": new_pruebas}
    with open(OUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(new_data, f, ensure_ascii=False, indent=2)
    print(f"\n✅ Saved {OUT_PATH}")

    # ─── Update index.json ────────────────────────────────────────────────────
    with open(INDEX_PATH) as f:
        index = json.load(f)

    index['Módulo 1']['Hematología']['pruebas'] = [
        {"id": p["id"], "name": p["name"], "questionCount": p["questionCount"]}
        for p in new_pruebas
    ]
    with open(INDEX_PATH, 'w', encoding='utf-8') as f:
        json.dump(index, f, ensure_ascii=False, indent=2)
    print(f"✅ Updated index.json — Hematología now has {len(new_pruebas)} pruebas")

if __name__ == '__main__':
    main()
