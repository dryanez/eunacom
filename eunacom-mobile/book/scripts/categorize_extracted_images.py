import os
from PIL import Image

img_dir = r'd:\Anti\Eunacom\eunacom-app-v2\book\generate-book\extracted_images'
files = os.listdir(img_dir)

meaningful_images = []
for f in files:
    fp = os.path.join(img_dir, f)
    try:
        with Image.open(fp) as img:
            w, h = img.size
            if w >= 150 and h >= 80:
                meaningful_images.append((f, w, h, os.path.getsize(fp)))
    except Exception:
        pass

meaningful_images.sort(key=lambda x: x[3], reverse=True)

print(f"Meaningful diagrams/images count: {len(meaningful_images)}")
for name, w, h, sz in meaningful_images[:30]:
    print(f" [IMG] {name} ({w}x{h}px, {sz//1024} KB)")
