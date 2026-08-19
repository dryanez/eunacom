import os
from PIL import Image

ready_dir = r'd:\Anti\Eunacom\eunacom-app-v2\book\generate-book\figures_ready'
files = os.listdir(ready_dir)

# Focus strictly on First Aid 2CK files (ALGORITHMS_ or page_)
_2ck_files = [f for f in files if f.startswith('ALGORITHMS_') or f.startswith('page_')]

valid_2ck = []
for f in _2ck_files:
    fp = os.path.join(ready_dir, f)
    try:
        with Image.open(fp) as img:
            w, h = img.size
            # Check average background color to avoid pure black images
            # Convert sample to RGB
            sample = img.resize((50, 50)).convert('RGB')
            pixels = list(sample.getdata())
            avg_brightness = sum(r + g + b for r, g, b in pixels) / (len(pixels) * 3)
            
            # If width >= 300, height >= 150 and avg_brightness > 50 (light background!)
            if w >= 300 and h >= 150 and avg_brightness > 50:
                valid_2ck.append((f, w, h, avg_brightness, os.path.getsize(fp)))
    except Exception as e:
        pass

valid_2ck.sort(key=lambda x: x[4], reverse=True)

print(f"Found {len(valid_2ck)} CLEAN 2CK figures with light background and readable text:")
for name, w, h, bright, sz in valid_2ck[:35]:
    print(f"  - {name}: {w}x{h}px (Brightness {bright:.1f}, Size {sz//1024} KB)")
