import os
import io
import pypdf
from PIL import Image

pdf_path = r'd:\Anti\Eunacom\eunacom-app-v2\book\First_Aid_Clinical_Algorithms_for_the_USMLE_Step_2_Ck.pdf'
out_dir = r'd:\Anti\Eunacom\eunacom-app-v2\book\generate-book\figures_2ck_clean'
os.makedirs(out_dir, exist_ok=True)

reader = pypdf.PdfReader(pdf_path)

fig_mapping = {
    24: ('fig_1_1_chest_pain.png', 'Algoritmo Diagnóstico de Dolor Torácico'),
    25: ('fig_1_2_ischemic_chest_pain_sca.png', 'Algoritmo de Síndrome Coronario Agudo (STEMI vs NSTEMI)'),
    28: ('fig_1_3_post_mi_complications.png', 'Algoritmo de Complicaciones Mecánicas y Eléctricas del IAM'),
    34: ('fig_1_8_congestive_heart_failure.png', 'Clasificación y Criterios de Insuficiencia Cardíaca Congestiva'),
    35: ('fig_1_9_acute_decompensated_hf.png', 'Algoritmo de Insuficiencia Cardíaca Aguda Descompensada'),
    37: ('fig_1_10_cardiogenic_shock.png', 'Clasificación Hemodinámica y Manejo de Shock Cardiógeno'),
    49: ('fig_1_15a_acls_cardiac_arrest.png', 'Protocolo ACLS: Paro Cardiorespiratorio (FV / TVSP / Asistolia / AEP)'),
    50: ('fig_1_15b_acls_bradycardia.png', 'Protocolo ACLS: Bradiarritmias e Inestabilidad'),
    51: ('fig_1_15c_acls_tachycardia.png', 'Protocolo ACLS: Taquiarritmias con Pulso'),
    52: ('fig_1_16_bradyarrhythmias_ecg.png', 'Criterios ECG y Manejo de Bradiarritmias y Bloqueos AV'),
    54: ('fig_1_17_supraventricular_tachy.png', 'Algoritmo ECG: Taquiarritmias Supraventriculares (FA / Flutter / TPSV)'),
    57: ('fig_1_18_ventricular_tachy.png', 'Algoritmo ECG: Taquiarritmias Ventriculares (TV / Torsades)'),
    59: ('fig_1_19_antiarrhythmic_drugs.png', 'Clasificación y Mecanismo de Fármacos Antiarrítmicos'),
    60: ('fig_1_20_pericardial_diseases.png', 'Diagnóstico y Manejo de Enfermedades del Pericardio'),
    65: ('fig_1_21_valvulopathies.png', 'Diagnóstico y Soplos en Valvulopatías (Estenosis Aórtica / Mitral)')
}

extracted = []

for pidx, (filename, desc) in fig_mapping.items():
    page = reader.pages[pidx]
    imgs = page.images
    
    best_img = None
    max_area = 0
    
    for img_obj in imgs:
        try:
            img_data = img_obj.data
            img = Image.open(io.BytesIO(img_data))
            w, h = img.size
            if w * h > max_area and w >= 250 and h >= 150:
                max_area = w * h
                best_img = img
        except Exception:
            pass
            
    if best_img:
        dest_path = os.path.join(out_dir, filename)
        best_img.convert('RGB').save(dest_path, 'PNG')
        w, h = best_img.size
        sz_kb = os.path.getsize(dest_path) // 1024
        extracted.append((filename, desc, f"{w}x{h}px", sz_kb))

print("=== FIGURAS LIMPIAS DEL LIBRO FIRST AID STEP 2 CK ===")
for fn, desc, dims, sz in extracted:
    print(f" [*] {fn}: {desc} ({dims}, {sz} KB)")
