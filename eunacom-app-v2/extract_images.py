import fitz
import os
import json

pdf_path = "/Users/felipeyanez/Desktop/Reconstruciones/carpeta sin título/Eunacom diciembre 2025 second one.pdf"
json_path = "/Users/felipeyanez/Desktop/NEWeunacom/eunacom-app-v2/public/data/reconstrucciones/eunacom-dic-2025.json"
output_dir = "/Users/felipeyanez/Desktop/NEWeunacom/eunacom-app-v2/public/img/dic-2025"

os.makedirs(output_dir, exist_ok=True)

doc = fitz.open(pdf_path)

images = []
for i in range(len(doc)):
    for img in doc.get_page_images(i):
        xref = img[0]
        pix = fitz.Pixmap(doc, xref)
        # Convert to RGB if it's CMYK
        if pix.n - pix.alpha > 3:
            pix = fitz.Pixmap(fitz.csRGB, pix)
        images.append(pix)

# List of question IDs that correspond to the images in order
question_ids = [3, 4, 26, 44, 80, 81, 106, 115, 132, 138, 162, 176]

print(f"Found {len(images)} images in the PDF.")
if len(images) != len(question_ids):
    print("WARNING: Mismatch between number of images found and question IDs provided!")
    
for i, pix in enumerate(images):
    if i < len(question_ids):
        q_id = question_ids[i]
        filename = f"q{q_id}.png"
        filepath = os.path.join(output_dir, filename)
        pix.save(filepath)
        print(f"Saved {filename}")

# Now update the JSON file
with open(json_path, 'r') as f:
    data = json.load(f)

for q in data:
    if int(q['id']) in question_ids:
        q['imageUrl'] = f"/img/dic-2025/q{q['id']}.png"

with open(json_path, 'w') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("JSON updated successfully.")
