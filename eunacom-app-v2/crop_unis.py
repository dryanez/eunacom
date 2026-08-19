from PIL import Image
import os

img = Image.open('public/img/universities.png')
w, h = img.size

os.makedirs('public/img/unis', exist_ok=True)

cols = 7
rows = 4
cell_w = w / cols
cell_h = h / rows

for r in range(rows):
    for c in range(cols):
        left = int(c * cell_w)
        top = int(r * cell_h)
        right = int((c + 1) * cell_w)
        bottom = int((r + 1) * cell_h)
        
        # Crop cell
        cell = img.crop((left, top, right, bottom))
        
        # Save cropped icon
        idx = r * cols + c + 1
        cell.save(f'public/img/unis/uni_{idx}.png')

print("Generated 28 university icons.")
