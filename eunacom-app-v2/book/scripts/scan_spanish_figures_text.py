import pypdf

pdf_path = r'd:\Anti\Eunacom\eunacom-app-v2\book\cardiologia.pdf'
reader = pypdf.PdfReader(pdf_path)

print("=== BÚSQUEDA DE FIGURAS Y TRAZADOS ESPAÑOLES EN CARDIOLOGIA.PDF ===")

for pidx, page in enumerate(reader.pages):
    text = page.extract_text()
    lines = text.split('\n')
    for line in lines:
        if 'Figura' in line or 'figura' in line or 'torsade' in line.lower() or 'soplo' in line.lower() or 'ruido' in line.lower() or 'bloqueo' in line.lower() or 'flutter' in line.lower() or 'fibrilaci' in line.lower():
            if len(line.strip()) > 3:
                print(f" Pág {pidx+1}: {line.strip().encode('ascii', 'ignore').decode('ascii')}")
