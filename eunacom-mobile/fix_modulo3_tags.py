"""Re-tag only the modulo-3 prueba files — small/fast, won't crash PTY."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from generate_tags import generate_tags  # safe now — big loop is under __main__

import json, glob

# ── inline the same RULES from generate_tags.py ──────────────────────────
# (imported directly so we don't re-run the big loop)

BASE = '/Volumes/Install macOS Sequoia/Eunacom/eunacom-app-v2/public/data/pruebas'
FALLBACK = ('Medicina, EUNACOM', '', 'Pediatría, EUNACOM', 'Ginecología, EUNACOM',
            'Obstetricia, EUNACOM', 'Neonatología, EUNACOM')

SPECIALTY_MAP = {
    'pediatria': 'Pediatría',
    'ginecologia': 'Ginecología',
    'obstetricia': 'Obstetricia',
    'neonatologia': 'Neonatología',
}

def specialty_from_filename(fname):
    fl = fname.lower()
    for k, v in SPECIALTY_MAP.items():
        if k in fl:
            return v
    return ''

total_fixed = 0
for fn in sorted(glob.glob(os.path.join(BASE, 'modulo-3-*.json'))):
    name = os.path.basename(fn)
    specialty = specialty_from_filename(name)
    d = json.load(open(fn))
    fixed = 0
    for prueba in d.get('pruebas', []):
        for q in prueba.get('questions', []):
            pregunta = q.get('pregunta', '')
            if not pregunta.strip():
                continue
            old_tag = q.get('tags', '')
            if old_tag in FALLBACK:
                new_tag = generate_tags(pregunta, specialty=specialty)
                if new_tag not in FALLBACK:
                    q['tags'] = new_tag
                    fixed += 1
    with open(fn, 'w') as f:
        json.dump(d, f, ensure_ascii=False, indent=2)
    print(f'{name}: fixed {fixed} fallback tags')
    total_fixed += fixed

print(f'\nTotal fixed: {total_fixed}')

# Coverage report
print('\n--- Coverage ---')
for fn in sorted(glob.glob(os.path.join(BASE, 'modulo-3-*.json'))):
    name = os.path.basename(fn)
    d = json.load(open(fn))
    q = [x for p in d.get('pruebas', []) for x in p.get('questions', [])]
    fb = [x for x in q if not x.get('tags') or x['tags'] in FALLBACK]
    pct = round((len(q) - len(fb)) / len(q) * 100) if q else 0
    print(f'  {name}: {len(q)-len(fb)}/{len(q)} ({pct}%)')
    for x in fb[:3]:
        print(f'    STILL FALLBACK: {x.get("pregunta","")[:80]}')
