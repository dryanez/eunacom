import os
import shutil
from PIL import Image

gallery_dir = r'd:\Anti\Eunacom\eunacom-app-v2\book\figuras_galeria'
user_media_dir = r'C:\Users\PC\.gemini\antigravity\brain\d1bdaf6b-4817-4e18-9fdd-07c6dc0667c0\.user_uploaded'
curated_dir = r'd:\Anti\Eunacom\eunacom-app-v2\book\generate-book\figures_curated'
pages_dir = r'd:\Anti\Eunacom\eunacom-app-v2\book\generate-book\spanish_cardio_pages'

if not os.path.exists(gallery_dir):
    os.makedirs(gallery_dir, exist_ok=True)

all_figures = []

# 1. The 5 User-Uploaded ECGs (Cropped clean without raw bottom text)
user_uploads = [
    ('media_1787083215411.png', 'figura_01_arritmia_sinusal_respiratoria.png', 'Figura 1: Arritmia Sinusal Respiratoria (Derivacion D2)'),
    ('media_1787083215439.png', 'figura_02_paro_sinusal.png', 'Figura 2: Paro Sinusal (Derivacion D2)'),
    ('media_1787083212329.png', 'figura_03_marcapasos_migratorio.png', 'Figura 3: Marcapasos Migratorio (Derivacion D2)'),
    ('media_1787083212324.png', 'figura_04_bloqueo_sinoauricular_grado_2_tipo_1.png', 'Figura 4: Bloqueo Sinoauricular II Tipo I Wenckebach (Derivacion V1)'),
    ('media_1787083212357.png', 'figura_05_bloqueo_sinoauricular_grado_2_tipo_2.png', 'Figura 5: Bloqueo Sinoauricular II Tipo II (Derivacion D2)')
]

for u_file, target_name, caption_text in user_uploads:
    u_path = os.path.join(user_media_dir, u_file)
    if os.path.exists(u_path):
        with Image.open(u_path) as img:
            w, h = img.size
            clean_crop = img.crop((0, 0, w, int(h * 0.78)))
            dest_path = os.path.join(gallery_dir, target_name)
            clean_crop.save(dest_path, 'PNG')
            all_figures.append((target_name, caption_text, f"{w}x{int(h*0.78)}px"))

# 2. Re-include ALL Previously Curated ECGs & Figures
curated_map = [
    ('ecg_fibrilacion_auricular.png', 'figura_06_fibrilacion_auricular.png', 'Figura 6: Fibrilacion Auricular (Sin Ondas P, R-R Irregular)'),
    ('ecg_tpsv.png', 'figura_07_tpsv.png', 'Figura 7: Taquicardia Paroxistica Supraventricular (TPSV)'),
    ('ecg_bloqueo_av_3er_grado.png', 'figura_08_bloqueo_av_3er_grado.png', 'Figura 8: Bloqueo AV Completo / 3er Grado (Disociacion AV)'),
    ('ecg_taquicardia_ventricular.png', 'figura_09_taquicardia_ventricular.png', 'Figura 9: Taquicardia Ventricular Monomorfica (QRS Ancho Regular)'),
    ('ecg_iam_sdst_inferior.png', 'figura_10_iam_supradesnivel_st_inferior.png', 'Figura 10: Infarto con Supradesnivel ST Inferior (IAMSDST DII, DIII, aVF)'),
    ('ecg_pericarditis_aguda.png', 'figura_11_pericarditis_aguda.png', 'Figura 11: Pericarditis Aguda (ST Concavo Difuso e Infradesnivel PR)'),
    ('diagrama_diseccion_aortica.png', 'figura_12_diseccion_aortica_stanford.png', 'Figura 12: Diseccion Aortica Anatomia Stanford A vs Stanford B')
]

for src_name, target_name, caption_text in curated_map:
    src_path = os.path.join(curated_dir, src_name)
    if os.path.exists(src_path):
        dest_path = os.path.join(gallery_dir, target_name)
        shutil.copy(src_path, dest_path)
        with Image.open(dest_path) as img:
            w, h = img.size
        all_figures.append((target_name, caption_text, f"{w}x{h}px"))

# 3. Add Torsades de Pointes & Heart Sounds (Soplos)
extra_crops = [
    (53, (100, 1400, 2379, 1850), 'figura_13_torsades_de_pointes.png', 'Figura 13: Taquicardia Ventricular Polimorfa (Torsades de Pointes)'),
    (16, (100, 1400, 2379, 2100), 'figura_14_fonocardiograma_ruidos_soplos.png', 'Figura 14: Diagrama de Ruidos Cardiacos (R1-R4) y Soplos en Espanol')
]

for pnum, box, target_name, caption_text in extra_crops:
    page_path = os.path.join(pages_dir, f"page_{pnum}.png")
    if os.path.exists(page_path):
        with Image.open(page_path) as img:
            cropped = img.crop(box)
            dest_path = os.path.join(gallery_dir, target_name)
            cropped.save(dest_path, 'PNG')
            w, h = cropped.size
            all_figures.append((target_name, caption_text, f"{w}x{h}px"))

print("=== GALERÍA COMPLETA RESTAURADA Y CON NOMBRES EN ESPAÑOL ===")
print(f"Total figuras en figuras_galeria: {len(all_figures)}")
for fn, cap, dims in all_figures:
    print(f"  [*] {fn}: {cap} ({dims})")
