import os
import shutil
from PIL import Image

gallery_dir = r'd:\Anti\Eunacom\eunacom-app-v2\book\figuras_galeria'
user_media_dir = r'C:\Users\PC\.gemini\antigravity\brain\d1bdaf6b-4817-4e18-9fdd-07c6dc0667c0\.user_uploaded'
pages_dir = r'd:\Anti\Eunacom\eunacom-app-v2\book\generate-book\spanish_cardio_pages'

if os.path.exists(gallery_dir):
    shutil.rmtree(gallery_dir)
os.makedirs(gallery_dir, exist_ok=True)

user_uploads = [
    ('media_1787083215411.png', 'figura_3_arritmia_sinusal_respiratoria.png', 'Figura 3: Arritmia sinusal respiratoria (Derivacion D2)'),
    ('media_1787083215439.png', 'figura_4_paro_sinusal.png', 'Figura 4: Paro sinusal (Derivacion D2)'),
    ('media_1787083212329.png', 'figura_6_marcapasos_migratorio.png', 'Figura 6: Marcapasos migratorio (Derivacion D2)'),
    ('media_1787083212324.png', 'figura_16_bloqueo_sinoauricular_grado_2_tipo_1.png', 'Figura 16: Arritmia sinusal, bloqueo sinoauricular de segundo grado tipo I (Derivacion V1)'),
    ('media_1787083212357.png', 'figura_17_bloqueo_sinoauricular_grado_2_tipo_2.png', 'Figura 17: Arritmia sinusal, bloqueo sinoauricular de segundo grado tipo II (Derivacion D2)')
]

gallery_manifest = []

for u_file, target_name, caption_text in user_uploads:
    u_path = os.path.join(user_media_dir, u_file)
    if os.path.exists(u_path):
        with Image.open(u_path) as img:
            w, h = img.size
            clean_crop = img.crop((0, 0, w, int(h * 0.78)))
            dest_path = os.path.join(gallery_dir, target_name)
            clean_crop.save(dest_path, 'PNG')
            gallery_manifest.append((target_name, caption_text, f"{w}x{int(h*0.78)}px"))

extra_spanish_crops = [
    (53, (100, 1400, 2379, 1850), 'figura_18_torsades_de_pointes.png', 'Figura 18: Taquicardia ventricular polimorfa (Torsades de Pointes)'),
    (37, (100, 1000, 2379, 1420), 'figura_19_bloqueo_av_tercer_grado.png', 'Figura 19: Bloqueo auriculoventricular de tercer grado (completo)'),
    (16, (100, 1400, 2379, 2100), 'figura_20_fonocardiograma_soplos_ruidos.png', 'Figura 20: Diagrama de ruidos cardiacos (R1-R4) y soplos sistolicos/diastolicos')
]

for pnum, box, target_name, caption_text in extra_spanish_crops:
    page_path = os.path.join(pages_dir, f"page_{pnum}.png")
    if os.path.exists(page_path):
        with Image.open(page_path) as img:
            cropped = img.crop(box)
            dest_path = os.path.join(gallery_dir, target_name)
            cropped.save(dest_path, 'PNG')
            w, h = cropped.size
            gallery_manifest.append((target_name, caption_text, f"{w}x{h}px"))

print("=== GALERIA ACTUALIZADA EN ESPANOL (CON CORTE LIMPIO SIN TEXTO INFERIOR) ===")
for fn, cap, dims in gallery_manifest:
    print(f" [*] {fn}: {cap} ({dims})")
