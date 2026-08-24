import os
import pypdfium2 as pdfium
from PIL import Image

pdf_path = r'd:\Anti\Eunacom\eunacom-app-v2\book\First_Aid_Clinical_Algorithms_for_the_USMLE_Step_2_Ck.pdf'
out_dir = r'd:\Anti\Eunacom\eunacom-app-v2\book\generate-book\figures_2ck_rendered'
os.makedirs(out_dir, exist_ok=True)

pdf = pdfium.PdfDocument(pdf_path)

pages_map = {
    25: ('fig_1_1_chest_pain.png', 'Algoritmo Diagnóstico de Dolor Torácico'),
    26: ('fig_1_2_ischemic_chest_pain_sca.png', 'Algoritmo de Síndrome Coronario Agudo (STEMI vs NSTEMI)'),
    29: ('fig_1_3_post_mi_complications.png', 'Algoritmo de Complicaciones Mecánicas y Eléctricas del IAM'),
    35: ('fig_1_8_congestive_heart_failure.png', 'Clasificación y Criterios de Insuficiencia Cardíaca Congestiva'),
    36: ('fig_1_9_acute_decompensated_hf.png', 'Algoritmo de Insuficiencia Cardíaca Aguda Descompensada'),
    38: ('fig_1_10_cardiogenic_shock.png', 'Clasificación Hemodinámica y Manejo de Shock Cardiógeno'),
    50: ('fig_1_15a_acls_cardiac_arrest.png', 'Protocolo ACLS: Paro Cardiorespiratorio (FV / TVSP / Asistolia / AEP)'),
    51: ('fig_1_15b_acls_bradycardia.png', 'Protocolo ACLS: Bradiarritmias e Inestabilidad'),
    52: ('fig_1_15c_acls_tachycardia.png', 'Protocolo ACLS: Taquiarritmias con Pulso'),
    53: ('fig_1_16_bradyarrhythmias_ecg.png', 'Criterios ECG y Manejo de Bradiarritmias y Bloqueos AV'),
    55: ('fig_1_17_supraventricular_tachy.png', 'Algoritmo ECG: Taquiarritmias Supraventriculares (FA / Flutter / TPSV)'),
    58: ('fig_1_18_ventricular_tachy.png', 'Algoritmo ECG: Taquiarritmias Ventriculares (TV / Torsades)'),
    60: ('fig_1_19_antiarrhythmic_drugs.png', 'Clasificación y Mecanismo de Fármacos Antiarrítmicos'),
    61: ('fig_1_20_pericardial_diseases.png', 'Diagnóstico y Manejo de Enfermedades del Pericardio'),
    66: ('fig_1_21_valvulopathies.png', 'Diagnóstico y Soplos en Valvulopatías (Estenosis Aórtica / Mitral)')
}

rendered_list = []

for pnum, (fname, desc) in pages_map.items():
    page = pdf[pnum - 1]
    bitmap = page.render(scale=3)
    pil_image = bitmap.to_pil()
    
    w, h = pil_image.size
    crop_box = (int(w * 0.05), int(h * 0.08), int(w * 0.95), int(h * 0.92))
    cropped = pil_image.crop(crop_box)
    
    dest_path = os.path.join(out_dir, fname)
    cropped.save(dest_path, 'PNG')
    
    cw, ch = cropped.size
    sz_kb = os.path.getsize(dest_path) // 1024
    rendered_list.append((fname, desc, f"{cw}x{ch}px", sz_kb))

print("=== 15 FIGURAS VECTORIALES RENDERIZADAS DE FIRST AID STEP 2 CK ===")
for fn, desc, dims, sz in rendered_list:
    print(f" [*] {fn}: {desc} ({dims}, {sz} KB)")
