import os
from PIL import Image

galeria_dir = r'd:\Anti\Eunacom\eunacom-app-v2\book\figuras_galeria'

av_files = [
    'figura_bloqueo_av_1er_grado.png',
    'figura_bloqueo_av_2do_grado_mobitz_1_wenckebach.png',
    'figura_bloqueo_av_2do_grado_mobitz_2.png',
    'figura_bloqueo_av_3er_grado_completo.png'
]

print("=== TRIMMING ANY REMAINING ENGLISH TEXT FROM AV BLOCK GRAPHS ===")

for fname in av_files:
    fp = os.path.join(galeria_dir, fname)
    if os.path.exists(fp):
        with Image.open(fp) as img:
            w, h = img.size
            # Crop off the bottom ~30px where English text is located, leaving ONLY the graph
            graph_only = img.crop((0, 0, w, int(h * 0.72)))
            graph_only.save(fp, 'PNG')
            print(f"  [*] Trimmed {fname} -> Graph Only ({w}x{int(h*0.72)} px)")
