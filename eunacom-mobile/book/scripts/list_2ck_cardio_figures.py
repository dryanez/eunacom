import os
import pypdf

pdf_path = r'd:\Anti\Eunacom\eunacom-app-v2\book\First_Aid_Clinical_Algorithms_for_the_USMLE_Step_2_Ck.pdf'
reader = pypdf.PdfReader(pdf_path)

print("=== ALL CARDIOLOGY FIGURES IN FIRST AID STEP 2 CK (PAGES 20-75) ===")

for pidx in range(20, 75):
    page = reader.pages[pidx]
    text = page.extract_text().encode('ascii', 'ignore').decode('ascii')
    
    for line in text.split('\n'):
        if '1-' in line or 'FIGURE' in line or 'Aortic' in line or 'Infarction' in line or 'Failure' in line or 'Shock' in line:
            if len(line.strip()) > 5:
                print(f" Page {pidx+1}: {line.strip()}")
