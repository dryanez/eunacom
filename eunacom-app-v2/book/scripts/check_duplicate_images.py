import os
import hashlib
from PIL import Image
import numpy as np

galeria_dir = r'd:\Anti\Eunacom\eunacom-app-v2\book\figuras_galeria'

files = [
    'figura_03_arritmia_sinusal_respiratoria.png',
    'figura_04_paro_sinusal.png',
    'figura_06_marcapasos_migratorio.png',
    'figura_16_bloqueo_sinoauricular_grado_2_tipo_1.png',
    'figura_17_bloqueo_sinoauricular_grado_2_tipo_2.png'
]

print("=== CHECKING IMAGE HASHES AND COMPARISONS ===")

images = {}
for f in files:
    fp = os.path.join(galeria_dir, f)
    if os.path.exists(fp):
        with open(fp, 'rb') as file_obj:
            data = file_obj.read()
            h_val = hashlib.md5(data).hexdigest()
        img = Image.open(fp).convert('RGB')
        images[f] = (img, h_val)
        print(f" [*] {f}: MD5={h_val}, Size={img.size}")

file_list = list(images.keys())
for i in range(len(file_list)):
    for j in range(i+1, len(file_list)):
        f1, f2 = file_list[i], file_list[j]
        img1, h1 = images[f1]
        img2, h2 = images[f2]
        
        if h1 == h2:
            print(f" [!] EXACT DUPLICATE: {f1} and {f2} have identical MD5 hash!")
        elif img1.size == img2.size:
            arr1 = np.array(img1).astype(float)
            arr2 = np.array(img2).astype(float)
            diff = np.mean(np.abs(arr1 - arr2))
            if diff < 5.0:
                print(f" [!] VERY SIMILAR ({diff:.2f} diff): {f1} and {f2}")
