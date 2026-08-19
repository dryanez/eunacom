import os
import shutil

galeria_dir = r'd:\Anti\Eunacom\eunacom-app-v2\book\figuras_galeria'

rename_map = {
    'Screenshot 2026-08-19 121453.png': ('figura_03_arritmia_sinusal_respiratoria.png', 'Figura 3: Arritmia sinusal respiratoria (Derivacion D2)'),
    'Screenshot 2026-08-19 121500.png': ('figura_04_paro_sinusal.png', 'Figura 4: Paro sinusal (Derivacion D2)'),
    'Screenshot 2026-08-19 123014.png': ('figura_06_marcapasos_migratorio.png', 'Figura 6: Marcapasos migratorio (Derivacion D2)'),
    'Screenshot 2026-08-19 123033.png': ('figura_16_bloqueo_sinoauricular_grado_2_tipo_1.png', 'Figura 16: Arritmia sinusal, bloqueo sinoauricular de segundo grado tipo I (Derivacion V1)'),
    'Screenshot 2026-08-19 123726.png': ('figura_17_bloqueo_sinoauricular_grado_2_tipo_2.png', 'Figura 17: Arritmia sinusal, bloqueo sinoauricular de segundo grado tipo II (Derivacion D2)')
}

processed_files = []

for old_name, (new_name, caption) in rename_map.items():
    old_path = os.path.join(galeria_dir, old_name)
    new_path = os.path.join(galeria_dir, new_name)
    if os.path.exists(old_path):
        if os.path.exists(new_path):
            os.remove(new_path)
        os.rename(old_path, new_path)
        processed_files.append((new_name, caption))

print("=== ARCHIVOS EN FIGURAS_GALERIA RENOMBRADOS CON EXITO ===")
for nf, cap in processed_files:
    print(f" [*] {nf} -> {cap}")
