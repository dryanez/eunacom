import os
import shutil
from PIL import Image

galeria_dir = r'd:\Anti\Eunacom\eunacom-app-v2\book\figuras_galeria'

files = sorted(os.listdir(galeria_dir))
print("=== ALL 6 IMAGES IN FIGURAS_GALERIA ===")
for f in files:
    fp = os.path.join(galeria_dir, f)
    with Image.open(fp) as img:
        w, h = img.size
        sz_kb = os.path.getsize(fp) // 1024
        print(f" [*] {f}: {w}x{h} px ({sz_kb} KB)")
