import os
from PIL import Image

pages_dir = r'd:\Anti\Eunacom\eunacom-app-v2\book\generate-book\spanish_cardio_pages'
gallery_dir = r'd:\Anti\Eunacom\eunacom-app-v2\book\figuras_galeria'

if os.path.exists(gallery_dir):
    for f in os.listdir(gallery_dir):
        os.remove(os.path.join(gallery_dir, f))
else:
    os.makedirs(gallery_dir, exist_ok=True)

crops_def = [
    (34, (100, 1200, 2379, 1650), 'fig_1_arritmia_sinusal_respiratoria.png', 'FIGURA 1.3: ARRITMIA SINUSAL RESPIRATORIA', 'Trazado ECG en derivación D2 mostrando variación del intervalo P-P con la respiración.'),
    (34, (100, 1850, 2379, 2300), 'fig_2_paro_sinusal.png', 'FIGURA 1.4: PARO SINUSAL', 'Trazado ECG en derivación D2 mostrando pausa sinusal prolongada sin onda P.'),
    (35, (100, 450, 2379, 900), 'fig_3_marcapasos_migratorio.png', 'FIGURA 1.5: MARCAPASOS MIGRATORIO', 'Trazado ECG en derivación D2 mostrando cambios en la morfología de la onda P.'),
    (36, (100, 1000, 2379, 1500), 'fig_4_bloqueo_sa_grado_2_tipo_1.png', 'FIGURA 1.6: BLOQUEO SINOAURICULAR GRADO II TIPO I (WENCKEBACH)', 'Trazado ECG en V1 mostrando acortamiento progresivo del intervalo P-P previo a la pausa.'),
    (36, (100, 1750, 2379, 2250), 'fig_5_bloqueo_sa_grado_2_tipo_2.png', 'FIGURA 1.7: BLOQUEO SINOAURICULAR GRADO II TIPO II', 'Trazado ECG en derivación D2 mostrando pausa sinusal que es múltiplo exacto del intervalo P-P.'),
    (37, (100, 1000, 2379, 1500), 'fig_6_bloqueo_av_grado_3_completo.png', 'FIGURA 1.8: BLOQUEO AV DE TERCER GRADO (COMPLETO)', 'Trazado ECG mostrando disociación AV completa entre aurículas (P-P regular) y ventrículos (R-R regular).'),
    (32, (100, 1200, 2379, 1700), 'fig_7_fibrilacion_auricular.png', 'FIGURA 1.9: FIBRILACIÓN AURICULAR (FA)', 'Trazado ECG mostrando ausencia de ondas P, línea fibrilatoria e intervalos R-R irregularmente irregulares.'),
    (33, (100, 1100, 2379, 1600), 'fig_8_flutter_auricular.png', 'FIGURA 1.10: FLUTTER AURICULAR', 'Trazado ECG mostrando ondas F en serrucho (dientes de sierra) a 300 cpm con conducción AV 2:1/4:1.'),
    (53, (100, 1400, 2379, 1950), 'fig_9_torsades_de_pointes.png', 'FIGURA 1.11: TAQUICARDIA VENTRICULAR POLIMORFA (TORSADES DE POINTES)', 'Trazado ECG mostrando torsión sinusoidal de los complejos QRS alrededor de la línea isoeléctrica.'),
    (16, (100, 1400, 2379, 2200), 'fig_10_fonocardiograma_ruidos_soplos.png', 'FIGURA 4.1: DIAGRAMA DE RUIDOS CARDÍACOS Y SOPLOS (FONOCARDIOGRAMA)', 'Diagrama visual de soplos cardíacos: Estenosis Aórtica (sistólico eyectivo) vs Insuficiencia Mitral / Aórtica.')
]

cropped_results = []

for pnum, box, out_name, title, caption in crops_def:
    page_img_path = os.path.join(pages_dir, f"page_{pnum}.png")
    if os.path.exists(page_img_path):
        with Image.open(page_img_path) as img:
            cropped = img.crop(box)
            dest_path = os.path.join(gallery_dir, out_name)
            cropped.save(dest_path, 'PNG')
            w, h = cropped.size
            sz_kb = os.path.getsize(dest_path) // 1024
            cropped_results.append((out_name, title, f"{w}x{h}px", sz_kb))

print("=== NUEVA GALERIA DE FIGURAS Y TRAZADOS ESPANOLES PROCESADA ===")
for fn, title, dims, sz in cropped_results:
    print(f" [*] {fn}: {title} ({dims}, {sz} KB)")
