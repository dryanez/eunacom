#!/usr/bin/env python3
"""Convert AEE Anki .apkg decks to public/data/flashcards/*.json. Run: python3 -I scripts/anki-to-json.py"""
import glob, html, json, os, re, sqlite3, tempfile, zipfile

SRC = '/Users/felipeyanez/Documents/Archive/Apps/eunacom-fotos/books/dist/07_Anki'
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'public', 'data', 'flashcards')

# file key -> (slug, display name, module)
DECKS = {
 'Cardiologia': ('cardiologia', 'Cardiología', 1), 'Diabetes': ('diabetes', 'Diabetes', 1),
 'Endocrinologia': ('endocrinologia', 'Endocrinología', 1), 'Gastroenterologia': ('gastroenterologia', 'Gastroenterología', 1),
 'Hematologia': ('hematologia', 'Hematología', 1), 'Infectologia': ('infectologia', 'Infectología', 1),
 'Nefrologia': ('nefrologia', 'Nefrología', 1), 'Neurologia': ('neurologia', 'Neurología', 1),
 'Neumologia': ('respiratorio', 'Respiratorio', 1), 'Reumatologia': ('reumatologia', 'Reumatología', 1),
 'Cirugia': ('cirugia', 'Cirugía', 2), 'Traumatologia': ('traumatologia', 'Traumatología', 2),
 'Urologia': ('urologia', 'Urología', 2), 'Otorrino': ('otorrinolaringologia', 'Otorrinolaringología', 2),
 'Oftalmologia': ('oftalmologia', 'Oftalmología', 2), 'Dermatologia': ('dermatologia', 'Dermatología', 2),
 'Psiquiatria': ('psiquiatria', 'Psiquiatría', 2),
 'Pediatria': ('pediatria', 'Pediatría', 3), 'Obstetricia': ('obstetricia', 'Obstetricia', 3),
 'Ginecologia': ('ginecologia', 'Ginecología', 3),
 'SaludPublica': ('salud-publica', 'Salud Pública', 4),
}
CODE_RE = re.compile(r'<b>\s*([\d.]+)\s*</b>\s*([^<]*)')
CLOZE_RE = re.compile(r'\{\{c(\d+)::')
IMG_RE = re.compile(r'<img[^>]*>', re.I)

def clean(s):
    return re.sub(r'\s+', ' ', IMG_RE.sub('', s)).strip()

def main():
    os.makedirs(OUT, exist_ok=True)
    index = []
    for key, (slug, name, mod) in DECKS.items():
        path = os.path.join(SRC, f'AEE_EUNACOM_V3_{key}.apkg')
        with tempfile.TemporaryDirectory(dir='/tmp') as tmp:
            with zipfile.ZipFile(path) as z:
                names = z.namelist()
                db = 'collection.anki21' if 'collection.anki21' in names else 'collection.anki2'
                z.extract(db, tmp)
            con = sqlite3.connect(os.path.join(tmp, db))
            rows = con.execute('select id, flds from notes order by id').fetchall()
            con.close()
        cards = []
        for nid, flds in rows:
            f = flds.split('\x1f')
            f += [''] * (5 - len(f))
            text = clean(f[0])
            if not text:
                continue
            source = html.unescape(re.sub(r'<[^>]+>', '', f[3])).strip()
            codes = [{'code': m.group(1), 'name': html.unescape(m.group(2)).strip().rstrip('· ').strip()} for m in CODE_RE.finditer(f[4])]
            for n in sorted({int(x) for x in CLOZE_RE.findall(text)}):
                cards.append({'id': f'{slug}-{nid}-{n}', 'text': text, 'cloze': n, 'source': source, 'codes': codes})
        with open(os.path.join(OUT, f'{slug}.json'), 'w', encoding='utf-8') as fh:
            json.dump(cards, fh, ensure_ascii=False, separators=(',', ':'))
        index.append({'id': slug, 'name': name, 'count': len(cards), 'module': mod})
        print(slug, len(cards))
    index.sort(key=lambda d: (d['module'], d['name']))
    with open(os.path.join(OUT, 'index.json'), 'w', encoding='utf-8') as fh:
        json.dump(index, fh, ensure_ascii=False, separators=(',', ':'))
    print('total', sum(d['count'] for d in index))

main()
