import os
from PIL import Image

galeria_dir = r'd:\Anti\Eunacom\eunacom-app-v2\book\figuras_galeria'
fp = os.path.join(galeria_dir, 'figura_torsades_de_pointes.png')

with Image.open(fp) as img:
    w, h = img.size
    print(f"New Real Torsades de Pointes Image: {w}x{h} px ({os.path.getsize(fp)//1024} KB)")
