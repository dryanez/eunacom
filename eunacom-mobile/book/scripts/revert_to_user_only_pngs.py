import os

galeria_dir = r'd:\Anti\Eunacom\eunacom-app-v2\book\figuras_galeria'

# User's exact 5 PNGs + 1 overview screenshot
user_exact_files = {
    'Screenshot 2026-08-19 121444.png',
    'figura_03_arritmia_sinusal_respiratoria.png',
    'figura_04_paro_sinusal.png',
    'figura_06_marcapasos_migratorio.png',
    'figura_16_bloqueo_sinoauricular_grado_2_tipo_1.png',
    'figura_17_bloqueo_sinoauricular_grado_2_tipo_2.png'
}

deleted = []
kept = []

for item in os.listdir(galeria_dir):
    item_path = os.path.join(galeria_dir, item)
    if item not in user_exact_files:
        if os.path.isfile(item_path):
            os.remove(item_path)
            deleted.append(item)
    else:
        kept.append(item)

print("=== REVERTED: ONLY USER PNGS REMAIN IN FIGURAS_GALERIA ===")
print("Deleted extra PDF images:", deleted)
print("Kept User PNGs:", kept)
