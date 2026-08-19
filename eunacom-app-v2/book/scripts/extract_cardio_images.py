import os
import pypdf

pdf_paths = [
    r'd:\Anti\Eunacom\eunacom-app-v2\book\cardiologia.pdf',
    r'd:\Anti\Eunacom\eunacom-app-v2\book\ALGORITHMS.pdf',
    r'd:\Anti\Eunacom\eunacom-app-v2\book\Perfil2026.pdf'
]

out_dir = r'd:\Anti\Eunacom\eunacom-app-v2\book\generate-book\extracted_images'
os.makedirs(out_dir, exist_ok=True)

for pdf_path in pdf_paths:
    if not os.path.exists(pdf_path):
        continue
    base_name = os.path.basename(pdf_path).replace('.pdf', '')
    reader = pypdf.PdfReader(pdf_path)
    print(f"Scanning {base_name} ({len(reader.pages)} pages)...")
    
    count = 0
    for page_idx, page in enumerate(reader.pages):
        for img_idx, img_file in enumerate(page.images):
            try:
                img_data = img_file.data
                img_name = f"{base_name}_p{page_idx+1}_img{img_idx+1}_{img_file.name}"
                img_path = os.path.join(out_dir, img_name)
                with open(img_path, 'wb') as f:
                    f.write(img_data)
                count += 1
            except Exception as e:
                pass
    print(f" -> Extracted {count} images from {base_name}")
