import pypdf

pdf_path = r'd:\Anti\Eunacom\eunacom-app-v2\book\cardiologia.pdf'
reader = pypdf.PdfReader(pdf_path)

print("=== EXACT FIGURE CAPTIONS FROM CARDIOLOGIA.PDF (PAGES 34-38) ===")

for page_num in range(33, 39):
    text = reader.pages[page_num].extract_text()
    print(f"\n--- PAGE {page_num+1} ---")
    for line in text.split('\n'):
        if any(w in line.lower() for w in ['figura', 'derivaci', 'paro', 'sinusal', 'marcapasos', 'bloqueo']):
            print(f" [*] {line.strip()}")
