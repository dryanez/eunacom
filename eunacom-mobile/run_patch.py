import os, csv, glob, json, re, unicodedata, sys

def normalize(text):
    text = text.strip().lower()
    text = unicodedata.normalize('NFD', text)
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn')
    text = re.sub(r'\s+', ' ', text)
    return text

TMP = '/Volumes/Install macOS Sequoia/Eunacom/.tmp'
csv_lookup = {}
n = 0

print('Loading CSVs...', flush=True)
for folder in sorted(os.listdir(TMP)):
    if not folder.startswith('enriched_'):
        continue
    folder_path = os.path.join(TMP, folder)
    for fname in sorted(os.listdir(folder_path)):
        if not fname.endswith('.csv'):
            continue
        fpath = os.path.join(folder_path, fname)
        try:
            with open(fpath, encoding='utf-8-sig') as f:
                for row in csv.DictReader(f):
                    p = row.get('pregunta','').strip()
                    t = row.get('tags','').strip()
                    c = row.get('codigo_eunacom','').strip()
                    if p and t:
                        csv_lookup[normalize(p)] = {'tags': t, 'codigo': c}
                        n += 1
        except Exception as e:
            print(f'ERR {fpath}: {e}', flush=True)

print(f'Loaded {n} rows -> {len(csv_lookup)} unique questions with tags', flush=True)

PRUEBA_DIR = '/Volumes/Install macOS Sequoia/Eunacom/eunacom-app-v2/public/data/pruebas'
total_matched = total_miss = 0

for fpath in sorted(glob.glob(PRUEBA_DIR + '/modulo-*.json')):
    fname = os.path.basename(fpath)
    with open(fpath) as f:
        data = json.load(f)
    matched = miss = 0
    for prueba in data.get('pruebas', []):
        for q in prueba.get('questions', []):
            key = normalize(q.get('pregunta',''))
            if key in csv_lookup:
                q['tags'] = csv_lookup[key]['tags']
                if csv_lookup[key]['codigo']:
                    q['codigo_eunacom'] = csv_lookup[key]['codigo']
                matched += 1
            else:
                miss += 1
    with open(fpath, 'w') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    pct = int(100*matched/(matched+miss)) if (matched+miss) else 0
    print(f'{fname}: {matched}/{matched+miss} ({pct}%)', flush=True)
    total_matched += matched
    total_miss += miss

print(f'\nDONE: {total_matched} matched, {total_miss} still fallback', flush=True)
