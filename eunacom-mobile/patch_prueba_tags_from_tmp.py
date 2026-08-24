#!/usr/bin/env python3
"""
Patch prueba JSON tags from .tmp/enriched_* source CSVs.
These CSVs have real tags + codigo_eunacom for every prueba question.
"""
import os, csv, glob, json, re, unicodedata
from collections import defaultdict

def normalize(text: str) -> str:
    text = text.strip().lower()
    text = unicodedata.normalize('NFD', text)
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn')
    text = re.sub(r'\s+', ' ', text)
    return text

# ── Load ALL .tmp/enriched_* CSVs ─────────────────────────
TMP = '/Volumes/Install macOS Sequoia/Eunacom/.tmp'
csv_lookup = {}  # normalized_pregunta -> {tags, codigo_eunacom}
csv_total = 0

for fpath in glob.glob(TMP + '/enriched_*/*.csv'):
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

print(f'Loaded {csv_total} CSV rows → {len(csv_lookup)} unique questions with tags')

# ── Patch all prueba JSON files ────────────────────────────
PRUEBA_DIR = '/Volumes/Install macOS Sequoia/Eunacom/eunacom-app-v2/public/data/pruebas'
total_matched = total_fallback = total_q = 0

for fpath in sorted(glob.glob(PRUEBA_DIR + '/modulo-*.json')):
    fname = os.path.basename(fpath)
    with open(fpath) as f:
        data = json.load(f)

    matched = fallback = 0
    for prueba in data.get('pruebas', []):
        for q in prueba.get('questions', []):
            pregunta = q.get('pregunta', '').strip()
            key = normalize(pregunta)
            if key in csv_lookup:
                q['tags'] = csv_lookup[key]['tags']
                if csv_lookup[key]['codigo_eunacom']:
                    q['codigo_eunacom'] = csv_lookup[key]['codigo_eunacom']
                matched += 1
            else:
                fallback += 1

    total_matched += matched
    total_fallback += fallback
    total_q += matched + fallback

    with open(fpath, 'w') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    pct = int(100 * matched / (matched + fallback)) if (matched + fallback) else 0
    print(f'  {fname}: {matched}/{matched+fallback} matched ({pct}%)')

print(f'\n✅ DONE — {total_matched}/{total_q} prueba questions now have real tags')
print(f'   Still fallback: {total_fallback}')
