import os
import pypdf

pdf_path = r'd:\Anti\Eunacom\eunacom-app-v2\book\First_Aid_Clinical_Algorithms_for_the_USMLE_Step_2_Ck.pdf'
pdf_algo = r'd:\Anti\Eunacom\eunacom-app-v2\book\ALGORITHMS.pdf'

reader_2ck = pypdf.PdfReader(pdf_path)
reader_algo = pypdf.PdfReader(pdf_algo)

pages_to_check_2ck = [57, 58, 59, 60, 61, 62, 63, 64, 65, 66]
pages_to_check_algo = range(1, 40)

print("=== FIRST AID 2CK PDF (CARDIOLOGY SECTION) ===")
for pnum in pages_to_check_2ck:
    if pnum <= len(reader_2ck.pages):
        text = reader_2ck.pages[pnum-1].extract_text().encode('ascii', 'ignore').decode('ascii')
        lines = [l.strip() for l in text.split('\n') if l.strip()]
        hdr = ' | '.join(lines[:4])
        print(f"Page {pnum}: {hdr[:120]}")

print("\n=== ALGORITHMS PDF (FIRST 40 PAGES) ===")
for pnum in pages_to_check_algo:
    if pnum <= len(reader_algo.pages):
        text = reader_algo.pages[pnum-1].extract_text().encode('ascii', 'ignore').decode('ascii')
        lines = [l.strip() for l in text.split('\n') if l.strip()]
        hdr = ' | '.join(lines[:2])
        if any(w in hdr.lower() for w in ['cardio', 'chest', 'shock', 'syncope', 'hypertension', 'failure', 'arrhythmia', 'infarction', 'murmur']):
            print(f"Page {pnum}: {hdr[:120]}")
