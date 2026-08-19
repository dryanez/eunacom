import os
import shutil
from PIL import Image

gallery_dir = r'd:\Anti\Eunacom\eunacom-app-v2\book\figuras_galeria'
if os.path.exists(gallery_dir):
    shutil.rmtree(gallery_dir)
os.makedirs(gallery_dir, exist_ok=True)

dir_2ck = r'd:\Anti\Eunacom\eunacom-app-v2\book\generate-book\figures_2ck_rendered'
if os.path.exists(dir_2ck):
    for f in os.listdir(dir_2ck):
        if f.endswith('.png'):
            shutil.copy(os.path.join(dir_2ck, f), os.path.join(gallery_dir, f"2CK_{f}"))

dir_curated = r'd:\Anti\Eunacom\eunacom-app-v2\book\generate-book\figures_curated'
if os.path.exists(dir_curated):
    for f in os.listdir(dir_curated):
        if f.endswith('.png'):
            shutil.copy(os.path.join(dir_curated, f), os.path.join(gallery_dir, f"CURATED_{f}"))

dir_ready = r'd:\Anti\Eunacom\eunacom-app-v2\book\generate-book\figures_ready'
ecg_strips = []
if os.path.exists(dir_ready):
    for f in os.listdir(dir_ready):
        if f.endswith('.png') and 'cardiologia' in f:
            fp = os.path.join(dir_ready, f)
            try:
                with Image.open(fp) as img:
                    w, h = img.size
                    ratio = w / float(h)
                    if ratio >= 2.0 and w >= 400:
                        dest_f = f"ECG_STRIP_{f}"
                        shutil.copy(fp, os.path.join(gallery_dir, dest_f))
                        ecg_strips.append((dest_f, f"{w}x{h}px", os.path.getsize(fp)//1024))
            except Exception:
                pass

print(f"=== GALERIA CREADA CON EXITO EN: {gallery_dir} ===")
print(f"Total imagenes copiadas a la galeria: {len(os.listdir(gallery_dir))}")
print(f"Trazados ECG reales aislados (Ratio ancho >= 2.0): {len(ecg_strips)}")
for name, dims, sz in ecg_strips[:15]:
    print(f" [*] {name} ({dims}, {sz} KB)")
