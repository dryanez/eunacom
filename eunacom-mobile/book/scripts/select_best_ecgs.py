import os
import shutil
from PIL import Image

out_curated_dir = r'd:\Anti\Eunacom\eunacom-app-v2\book\generate-book\figures_curated'
os.makedirs(out_curated_dir, exist_ok=True)

curated_map = [
    ('cardiologia_p14_img3_Im1.png', 'ecg_bloqueo_av_3er_grado.png', 'ECG de Bloqueo AV Completo / 3er Grado'),
    ('cardiologia_p15_img2_Im0.png', 'ecg_fibrilacion_auricular.png', 'ECG de Fibrilación Auricular (Sin Ondas P, R-R Irregular)'),
    ('cardiologia_p18_img2_Im0.png', 'ecg_tpsv.png', 'ECG de Taquicardia Paroxística Supraventricular (TPSV)'),
    ('cardiologia_p45_img2_Im0.png', 'ecg_iam_sdst_inferior.png', 'ECG de Infarto con Supradesnivel ST (IAMSDST)'),
    ('cardiologia_p47_img2_Im0.png', 'ecg_pericarditis_aguda.png', 'ECG de Pericarditis Aguda (ST Cóncavo Difuso)'),
    ('cardiologia_p48_img2_Im0.png', 'diagrama_diseccion_aortica.png', 'Diagrama de Disección Aórtica Stanford A vs B'),
    ('cardiologia_p29_img2_Im0.png', 'ecg_taquicardia_ventricular.png', 'ECG de Taquicardia Ventricular Monomórfica'),
]

raw_dir = r'd:\Anti\Eunacom\eunacom-app-v2\book\generate-book\figures_ready'

copied_list = []
for src_name, target_name, desc in curated_map:
    src_file = os.path.join(raw_dir, src_name)
    if os.path.exists(src_file):
        dest_file = os.path.join(out_curated_dir, target_name)
        shutil.copy(src_file, dest_file)
        with Image.open(dest_file) as img:
            w, h = img.size
        copied_list.append((target_name, desc, f"{w}x{h}px", os.path.getsize(dest_file)//1024))

print("=== SELECCION CURADA DE TRAZADOS ELECTROCARDIOGRAFICOS Y FIGURAS CLINICAS ===")
for name, desc, dims, sz in copied_list:
    print(f" [*] {name}: {desc} ({dims}, {sz} KB)")
