import os
import shutil

galeria_dir = r'd:\Anti\Eunacom\eunacom-app-v2\book\figuras_galeria'
curated_dir = r'd:\Anti\Eunacom\eunacom-app-v2\book\generate-book\figures_curated'

curated_items = [
    ('ecg_fibrilacion_auricular.png', 'figura_07_fibrilacion_auricular.png'),
    ('ecg_tpsv.png', 'figura_08_tpsv.png'),
    ('ecg_bloqueo_av_3er_grado.png', 'figura_09_bloqueo_av_tercer_grado.png'),
    ('ecg_taquicardia_ventricular.png', 'figura_10_taquicardia_ventricular.png'),
    ('ecg_iam_sdst_inferior.png', 'figura_11_iam_supradesnivel_st_inferior.png'),
    ('ecg_pericarditis_aguda.png', 'figura_12_pericarditis_aguda.png'),
    ('diagrama_diseccion_aortica.png', 'figura_13_diseccion_aortica_stanford.png')
]

for src_f, dest_f in curated_items:
    src_p = os.path.join(curated_dir, src_f)
    dest_p = os.path.join(galeria_dir, dest_f)
    if os.path.exists(src_p):
        shutil.copy(src_p, dest_p)
        print(f" [*] Copied {src_f} -> {dest_f}")

print(f"\n=== MASTER GALLERY POPULATED IN: {galeria_dir} ===")
print("Total items:", len(os.listdir(galeria_dir)))
