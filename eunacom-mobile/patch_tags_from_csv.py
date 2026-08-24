#!/usr/bin/env python3
"""
Patch questionDB.json tags from the Eunacom2026 source CSVs.
The CSVs have real tags + codigo_eunacom that were lost during import.
Match by normalizing question text, copy tags + codigo_eunacom back.
"""
import os, csv, json, glob, re, unicodedata

def normalize(text: str) -> str:
    """Normalize text for fuzzy matching: lowercase, strip accents, collapse whitespace."""
    text = text.strip().lower()
    text = unicodedata.normalize('NFD', text)
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn')
    text = re.sub(r'\s+', ' ', text)
    return text

# ── Load all Eunacom2026 CSVs ──────────────────────────────
csv_lookup = {}  # normalized_pregunta -> {tags, codigo_eunacom}
base = '/Volumes/Install macOS Sequoia/Eunacom/Eunacom2026'
csv_total = 0
for fpath in glob.glob(base + '/**/*.csv', recursive=True):
    try:
        with open(fpath, encoding='utf-8-sig') as f:
            for row in csv.DictReader(f):
                pregunta = row.get('pregunta', '').strip()
                tags = row.get('tags', '').strip()
                codigo = row.get('codigo_eunacom', '').strip()
                if pregunta and tags:
                    key = normalize(pregunta)
                    csv_lookup[key] = {'tags': tags, 'codigo_eunacom': codigo}
                    csv_total += 1
    except Exception as e:
        print(f'  ERR {fpath}: {e}')

print(f'CSV questions loaded: {csv_total} → unique normalized: {len(csv_lookup)}')

# ── Patch questionDB.json ──────────────────────────────────
db_path = '/Volumes/Install macOS Sequoia/Eunacom/eunacom-app-v2/public/data/questionDB.json'
with open(db_path) as f:
    db = json.load(f)

qs = db if isinstance(db, list) else db.get('questions', db.get('preguntas', []))

matched = 0
unmatched = 0
for q in qs:
    text = q.get('question', q.get('pregunta', '')).strip()
    key = normalize(text)
    if key in csv_lookup:
        q['tags'] = csv_lookup[key]['tags']
        if csv_lookup[key]['codigo_eunacom']:
            q['codigo_eunacom'] = csv_lookup[key]['codigo_eunacom']
        matched += 1
    else:
        # Keep existing tags (already set by generate_tags.py specialty fallback)
        unmatched += 1

print(f'Matched: {matched} / {len(qs)} questions')
print(f'Unmatched (kept existing tag): {unmatched}')

with open(db_path, 'w') as f:
    json.dump(db, f, ensure_ascii=False, indent=2)
print('✅ questionDB.json updated')
