import os

chap1_dir = r'd:\Anti\Eunacom\eunacom-app-v2\book\capitulos_v3\Capitulo_1_Arritmias_y_Emergencias'

# Official 14 exact PDF filenames for Chapter 1
official_14_files = {
    'Capitulo_1.1_Manejo_de_Urgencias_en_Arritmias.pdf',
    'Capitulo_1.2_Paro_Cardiorespiratorio.pdf',
    'Capitulo_1.3_RCP_-_Reanimaci_n_Cardiopulmonar.pdf',
    'Capitulo_1.4_Bradiarritmias_y_Bloqueos_Card_acos.pdf',
    'Capitulo_1.5_Fibrilaci_n_Auricular.pdf',
    'Capitulo_1.6_Fibrilaci_n_Auricular_Antiarr_tmicos.pdf',
    'Capitulo_1.7_F_rmacos_Anticoagulantes.pdf',
    'Capitulo_1.8_Fibrilaci_n_Auricular_Manejo.pdf',
    'Capitulo_1.9_Fibrilaci_n_Auricular_Cr_nica.pdf',
    'Capitulo_1.10_Fibrilaci_n_Auricular_de_Reciente_Comienzo.pdf',
    'Capitulo_1.11_Flutter_Auricular.pdf',
    'Capitulo_1.12_Taquicardia_Parox_stica_Supraventricular.pdf',
    'Capitulo_1.13_Taquicardia_Ventricular_y_Canalopat_as.pdf',
    'Capitulo_1.14_Extras_stoles.pdf'
}

deleted = []
kept = []

for fname in os.listdir(chap1_dir):
    fp = os.path.join(chap1_dir, fname)
    if fname not in official_14_files:
        os.remove(fp)
        deleted.append(fname)
    else:
        kept.append(fname)

print("=== CLEANED DUPLICATE / OBSOLETE PDFs IN CHAPTER 1 ===")
print("Deleted duplicates:", deleted)
print(f"Kept exact 14 official PDFs (count: {len(kept)})")
