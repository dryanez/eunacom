import os
import pypdf

pdf_path = r'd:\Anti\Eunacom\eunacom-app-v2\book\capitulos_v3\Capitulo_1_Arritmias_y_Emergencias\Capitulo_1.13_Taquicardia_Ventricular_y_Canalopat_as.pdf'

if not os.path.exists(pdf_path):
    print("PDF not found at:", pdf_path)
    # Search for 1.13 PDF in chapter 1 folder
    chap1_dir = r'd:\Anti\Eunacom\eunacom-app-v2\book\capitulos_v3\Capitulo_1_Arritmias_y_Emergencias'
    files = os.listdir(chap1_dir)
    print("Files in Chapter 1 folder:", files)
else:
    reader = pypdf.PdfReader(pdf_path)
    print(f"Capitulo 1.13 PDF page count: {len(reader.pages)}")
    for i, page in enumerate(reader.pages):
        print(f"--- PAGE {i+1} ---")
        print("Images on page:", len(page.images))
        for img in page.images:
            print("  Image name:", img.name)
