import os
import pypdfium2 as pdfium
from PIL import Image

pdf_path = r'd:\Anti\Eunacom\eunacom-app-v2\book\cardiologia.pdf'
pdf = pdfium.PdfDocument(pdf_path)

out_dir = r'd:\Anti\Eunacom\eunacom-app-v2\book\generate-book\spanish_cardio_pages'
os.makedirs(out_dir, exist_ok=True)

print(f"Total pages in cardiologia.pdf: {len(pdf)}")

# Render all 54 pages of cardiologia.pdf at 3x scale (300 DPI)
for pidx in range(len(pdf)):
    page = pdf[pidx]
    bitmap = page.render(scale=3)
    pil_image = bitmap.to_pil()
    dest_path = os.path.join(out_dir, f"page_{pidx+1}.png")
    pil_image.save(dest_path, 'PNG')

print(f"Rendered all 54 pages of cardiologia.pdf into {out_dir}")
