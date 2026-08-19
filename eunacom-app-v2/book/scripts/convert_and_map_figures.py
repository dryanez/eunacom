import os
from PIL import Image

img_dir = r'd:\Anti\Eunacom\eunacom-app-v2\book\generate-book\extracted_images'
out_converted_dir = r'd:\Anti\Eunacom\eunacom-app-v2\book\generate-book\figures_ready'
os.makedirs(out_converted_dir, exist_ok=True)

files = os.listdir(img_dir)
converted_count = 0

for f in files:
    fp = os.path.join(img_dir, f)
    try:
        with Image.open(fp) as img:
            w, h = img.size
            if w >= 150 and h >= 80:
                base_name = os.path.splitext(f)[0] + '.png'
                dest_path = os.path.join(out_converted_dir, base_name)
                img.convert('RGB').save(dest_path, 'PNG')
                converted_count += 1
    except Exception as e:
                pass

print(f"Converted {converted_count} clinical figures into PNG format in {out_converted_dir}")
