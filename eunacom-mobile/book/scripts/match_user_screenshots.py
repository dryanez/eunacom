import os
import numpy as np
from PIL import Image

galeria_dir = r'd:\Anti\Eunacom\eunacom-app-v2\book\figuras_galeria'
main_path = os.path.join(galeria_dir, 'Screenshot 2026-08-19 121444.png')
main_img = Image.open(main_path).convert('RGB')
main_arr = np.array(main_img)

screenshots = [
    'Screenshot 2026-08-19 121453.png',
    'Screenshot 2026-08-19 121500.png',
    'Screenshot 2026-08-19 123014.png',
    'Screenshot 2026-08-19 123033.png',
    'Screenshot 2026-08-19 123726.png'
]

print(f"=== PIXEL MATCHING DE CAPTURAS CONTRA EL MAIN OVERVIEW ===")
print(f"Main Image Size: {main_img.size}")

for s_name in screenshots:
    sp = os.path.join(galeria_dir, s_name)
    s_img = Image.open(sp).convert('RGB')
    s_arr = np.array(s_img)
    sh, sw, _ = s_arr.shape
    
    best_y = -1
    min_diff = float('inf')
    
    for y in range(0, main_arr.shape[0] - sh + 1):
        sub_arr = main_arr[y:y+sh, 0:sw]
        diff = np.mean(np.abs(sub_arr.astype(float) - s_arr.astype(float)))
        if diff < min_diff:
            min_diff = diff
            best_y = y
            
    print(f" [*] {s_name} ({sw}x{sh}): Matched at Y={best_y}..{best_y+sh} (diff={min_diff:.2f})")
