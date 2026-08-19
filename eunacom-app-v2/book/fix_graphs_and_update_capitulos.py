import os

svg_dir = r"d:\Anti\Eunacom\eunacom-app-v2\book\generate-book\svg_diagrams"

def make_plantuml_svg(title, main_box, decision_text, yes_label, no_label, yes_boxes, no_boxes, width=743):
    cx = width / 2.0
    
    # Balanced padding: y=12 start, y=52 decision, y=95 branches
    max_branch = max(len(yes_boxes), len(no_boxes))
    content_h = 95 + (max_branch * 45) + 12
    height = int(content_h)

    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" contentStyleType="text/css" data-diagram-type="ACTIVITY" height="{height}px" preserveAspectRatio="none" style="width:{width}px;height:{height}px;background:#FFFFFF;" version="1.1" viewBox="0 0 {width} {height}" width="{width}px" zoomAndPan="magnify">
<defs/><g>
'''
    
    # Main Box 1 (y=12 to y=42)
    m1_w = 340
    m1_x = cx - m1_w / 2.0
    svg += f'''<rect fill="#F1F1F1" height="30" rx="12.5" ry="12.5" style="stroke:#181818;stroke-width:0.5;" width="{m1_w}" x="{m1_x:.4f}" y="12"/>
<text fill="#000000" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle" x="{cx:.4f}" y="31">{main_box}</text>
'''

    # Decision Hexagon (y=52 to y=78)
    d_w = 320
    d_x1 = cx - d_w / 2.0
    d_x2 = cx + d_w / 2.0
    pts = f"{d_x1+12:.4f},52 {d_x2-12:.4f},52 {d_x2:.4f},65 {d_x2-12:.4f},78 {d_x1+12:.4f},78 {d_x1:.4f},65 {d_x1+12:.4f},52"
    
    svg += f'''<polygon fill="#F1F1F1" points="{pts}" style="stroke:#181818;stroke-width:0.5;stroke-linejoin:miter;stroke-miterlimit:10;"/>
<text fill="#000000" font-family="Arial, sans-serif" font-size="11" text-anchor="middle" x="{cx:.4f}" y="69">{decision_text}</text>
'''

    # Arrow from Main Box (y=42) to Decision (y=52)
    svg += f'''<line style="stroke:#181818;stroke-width:1;" x1="{cx:.4f}" x2="{cx:.4f}" y1="42" y2="52"/>
<polygon fill="#181818" points="{cx-3.5:.4f},46 {cx:.4f},52 {cx+3.5:.4f},46 {cx:.4f},48" style="stroke:#181818;stroke-width:1;"/>
'''

    # Decision Branch Labels
    svg += f'''<text fill="#000000" font-family="Arial, sans-serif" font-size="10.5" font-weight="bold" x="{d_x1 - 85:.4f}" y="62">{yes_label}</text>'''
    svg += f'''<text fill="#000000" font-family="Arial, sans-serif" font-size="10.5" font-weight="bold" x="{d_x2 + 15:.4f}" y="62">{no_label}</text>'''

    # Left Branch (SÍ) - Starts at y=95
    left_x = cx - 180
    y_curr = 95.0
    for idx, b in enumerate(yes_boxes):
        bg = b.get('bg', '#FFE4E6' if idx == 0 else '#F1F1F1')
        w = b.get('w', 280)
        bx = left_x - w / 2.0
        svg += f'''<rect fill="{bg}" height="30" rx="12.5" ry="12.5" style="stroke:#181818;stroke-width:0.5;" width="{w}" x="{bx:.4f}" y="{y_curr:.4f}"/>
<text fill="#000000" font-family="Arial, sans-serif" font-size="11" text-anchor="middle" x="{left_x:.4f}" y="{y_curr + 19:.4f}">{b['text']}</text>
'''
        if idx > 0:
            svg += f'''<line style="stroke:#181818;stroke-width:1;" x1="{left_x:.4f}" x2="{left_x:.4f}" y1="{y_curr - 15:.4f}" y2="{y_curr:.4f}"/>
<polygon fill="#181818" points="{left_x-3.5:.4f},{y_curr-7:.4f} {left_x:.4f},{y_curr:.4f} {left_x+3.5:.4f},{y_curr-7:.4f} {left_x:.4f},{y_curr-4:.4f}" style="stroke:#181818;stroke-width:1;"/>
'''
        y_curr += 45.0

    # Right Branch (NO) - Starts at y=95
    right_x = cx + 180
    y_curr_r = 95.0
    for idx, b in enumerate(no_boxes):
        bg = b.get('bg', '#F1F1F1')
        w = b.get('w', 280)
        bx = right_x - w / 2.0
        svg += f'''<rect fill="{bg}" height="30" rx="12.5" ry="12.5" style="stroke:#181818;stroke-width:0.5;" width="{w}" x="{bx:.4f}" y="{y_curr_r:.4f}"/>
<text fill="#000000" font-family="Arial, sans-serif" font-size="11" text-anchor="middle" x="{right_x:.4f}" y="{y_curr_r + 19:.4f}">{b['text']}</text>
'''
        if idx > 0:
            svg += f'''<line style="stroke:#181818;stroke-width:1;" x1="{right_x:.4f}" x2="{right_x:.4f}" y1="{y_curr_r - 15:.4f}" y2="{y_curr_r:.4f}"/>
<polygon fill="#181818" points="{right_x-3.5:.4f},{y_curr_r-7:.4f} {right_x:.4f},{y_curr_r:.4f} {right_x+3.5:.4f},{y_curr_r-7:.4f} {right_x:.4f},{y_curr_r-4:.4f}" style="stroke:#181818;stroke-width:1;"/>
'''
        y_curr_r += 45.0

    # Branch arrows from decision (y=65) to y=95
    svg += f'''<line style="stroke:#181818;stroke-width:1;" x1="{d_x1:.4f}" x2="{left_x:.4f}" y1="65" y2="65"/>
<line style="stroke:#181818;stroke-width:1;" x1="{left_x:.4f}" x2="{left_x:.4f}" y1="65" y2="95"/>
<polygon fill="#181818" points="{left_x-3.5:.4f},88 {left_x:.4f},95 {left_x+3.5:.4f},88 {left_x:.4f},91" style="stroke:#181818;stroke-width:1;"/>

<line style="stroke:#181818;stroke-width:1;" x1="{d_x2:.4f}" x2="{right_x:.4f}" y1="65" y2="65"/>
<line style="stroke:#181818;stroke-width:1;" x1="{right_x:.4f}" x2="{right_x:.4f}" y1="65" y2="95"/>
<polygon fill="#181818" points="{right_x-3.5:.4f},88 {right_x:.4f},95 {right_x+3.5:.4f},88 {right_x:.4f},91" style="stroke:#181818;stroke-width:1;"/>
'''

    svg += '</g></svg>'
    return svg

diagrams_data = {
  'algo_angina_estable.svg': {
    'title': 'Angina Estable Crónica',
    'main': 'Sospecha de Angina Estable Crónica (Dolor de esfuerzo cede en reposo)',
    'dec': '¿Criterios de Alto Riesgo o Ergometría Positiva Precoz?',
    'yes_lbl': 'SÍ - Alto Riesgo',
    'no_lbl': 'NO - Bajo Riesgo',
    'yes': [
      {'text': 'Coronariografía Inmediata (Estudio de Anatomía)', 'bg': '#FFE4E6', 'w': 290},
      {'text': 'Revascularización: Angioplastia (PCI) o Cirugía (CRM)', 'bg': '#FFE4E6', 'w': 310}
    ],
    'no': [
      {'text': 'Tratamiento Médico Óptimo (TMO) Ambulatorio', 'bg': '#E0F2FE', 'w': 290},
      {'text': 'Aspirina 100mg + Atorvastatina 80mg + Betabloqueador', 'bg': '#F1F1F1', 'w': 320}
    ]
  },
  'algo_dolor_toracico.svg': {
    'title': 'Dolor Torácico Agudo',
    'main': 'Paciente con Dolor Torácico Agudo en Urgencias (ECG < 10 min)',
    'dec': '¿Supradesnivel ST ≥ 1 mm en ≥ 2 derivaciones contiguas?',
    'yes_lbl': 'SÍ - IAMSDST',
    'no_lbl': 'NO - Descarte',
    'yes': [
      {'text': 'REPERFUSIÓN INMEDIATA: Angioplastia < 120m o Fibrinólisis', 'bg': '#FFE4E6', 'w': 330},
      {'text': 'Traslado Inmediato a Unidad de Cuidados Coronarios', 'bg': '#F1F1F1', 'w': 310}
    ],
    'no': [
      {'text': 'Descartar 5 Letales: SCA, Disección, TEP, Neumotórax, Rotura', 'bg': '#F1F1F1', 'w': 340},
      {'text': 'Curva de Troponinas Ultrasensibles 0h y 3h + Observación', 'bg': '#E0F2FE', 'w': 330}
    ]
  },
  'algo_sca_reperfusion.svg': {
    'title': 'Reperfusión Miocárdica SCA',
    'main': 'Síndrome Coronario Agudo con Supradesnivel ST (IAMSDST)',
    'dec': '¿Disponibilidad de Angioplastia Primaria en < 120 minutos?',
    'yes_lbl': 'SÍ - PCI < 120m',
    'no_lbl': 'NO - Fibrinólisis',
    'yes': [
      {'text': 'ANGIOPLASTIA CORONARIA PRIMARIA (Tiempo Balón < 120m)', 'bg': '#E0F2FE', 'w': 330},
      {'text': 'Aspirina 300mg + Ticagrelor 180mg + Heparina EV', 'bg': '#F1F1F1', 'w': 310}
    ],
    'no': [
      {'text': 'FIBRINÓLISIS EN URGENCIAS (Alteplasa / Tenecteplasa)', 'bg': '#FFE4E6', 'w': 320},
      {'text': 'Traslado Inmediato para Angioplastia de Rescate / Rutina', 'bg': '#F1F1F1', 'w': 330}
    ]
  },
  'algo_iam_vd.svg': {
    'title': 'IAM Ventrículo Derecho',
    'main': 'IAM Inferior (DII, DIII, aVF) con Hipotensión e Ingurgitación Yugular',
    'dec': '¿Supradesnivel ST ≥ 1 mm en Derivaciones Derechas V3R-V4R?',
    'yes_lbl': 'SÍ - IAM VD',
    'no_lbl': 'NO - IAM Inferior',
    'yes': [
      {'text': 'SOBRECARGA DE VOLUMEN (Suero Fisiológico 500-1000 cc EV)', 'bg': '#E0F2FE', 'w': 330},
      {'text': '⚠️ CONTRAINDICADOS: Nitratos, Morfina, Diuréticos', 'bg': '#FFE4E6', 'w': 310}
    ],
    'no': [
      {'text': 'Manejo Estándar de Infarto de Pared Inferior', 'bg': '#F1F1F1', 'w': 290},
      {'text': 'Monitorización Hemodinámica Contínua', 'bg': '#F1F1F1', 'w': 280}
    ]
  },
  'algo_ic_dx.svg': {
    'title': 'Diagnóstico Insuficiencia Cardíaca',
    'main': 'Sospecha de Insuficiencia Cardíaca (Disnea, Ortopnea, Edema)',
    'dec': '¿Criterios de Framingham Positivos (2 Mayores / 1 Mayor + 2 Menores)?',
    'yes_lbl': 'SÍ - Criterios (+)',
    'no_lbl': 'NO - Buscar Otra Causa',
    'yes': [
      {'text': 'Dosificación de Péptidos Natriuréticos (BNP / NT-proBNP)', 'bg': '#F1F1F1', 'w': 320},
      {'text': 'Ecocardiograma Doppler: FEVI Reducida (≤40%) vs Preservada', 'bg': '#E0F2FE', 'w': 340}
    ],
    'no': [
      {'text': 'Evaluar Causas Pulmonares, Anemia o Enfermedad Renal', 'bg': '#F1F1F1', 'w': 310},
      {'text': 'Seguimiento Ambulatorio por Medicina Interna', 'bg': '#F1F1F1', 'w': 290}
    ]
  },
  'algo_ic_tratamiento.svg': {
    'title': 'Tratamiento IC FEVI Reducida',
    'main': 'Insuficiencia Cardíaca Sintomática con FEVI Reducida (FEVI ≤ 40%)',
    'dec': '¿Iniciado el Cuadriplete Fantástico (iSGLT2+ARNI+BB+ARM)?',
    'yes_lbl': 'SÍ - Titulado',
    'no_lbl': 'NO - Iniciar',
    'yes': [
      {'text': 'Evaluar Diuréticos de Asa (Furosemida) si persiste congestión', 'bg': '#F1F1F1', 'w': 330},
      {'text': 'Considerar DAI / Terapia de Resincronización Cardíaca', 'bg': '#E0F2FE', 'w': 320}
    ],
    'no': [
      {'text': 'INICIAR CUADRIPLETE: Dapagliflozina + Sacubitril + BB + Espironolactona', 'bg': '#FFE4E6', 'w': 350},
      {'text': 'Titulación Progresiva cada 2-4 semanas', 'bg': '#F1F1F1', 'w': 280}
    ]
  },
  'algo_shock.svg': {
    'title': 'Perfil Hemodinámico del Shock',
    'main': 'Paciente con Hipoperfusión Tisular Aguda (PAS < 90, Lactato > 2)',
    'dec': '¿PCOP Elevada y Gasto Cardíaco Disminuido?',
    'yes_lbl': 'SÍ - Cardiogénico',
    'no_lbl': 'NO - Distributivo/Hipovol',
    'yes': [
      {'text': 'SHOCK CARDIOGÉNICO: Inótropos (Dobutamina) + Reperfusión', 'bg': '#FFE4E6', 'w': 330},
      {'text': 'Soporte Mecánico Circulatorio / Balón de Contrapulsación', 'bg': '#F1F1F1', 'w': 320}
    ],
    'no': [
      {'text': 'SHOCK SÉPTICO / DISTRIBUTIVO: Norepinefrina + Cargas SF', 'bg': '#E0F2FE', 'w': 330},
      {'text': 'Control de Foco Infeccioso / Antibióticos Precoces', 'bg': '#F1F1F1', 'w': 300}
    ]
  },
  'algo_estenosis_aortica.svg': {
    'title': 'Estenosis Aórtica Severa',
    'main': 'Soplo Sistólico Eyectivo Foco Aórtico irradiado a Carótidas',
    'dec': '¿Presenta Tríada Sintomática (Angina, Síncope, Disnea)?',
    'yes_lbl': 'SÍ - Sintomático',
    'no_lbl': 'NO - Asintomático',
    'yes': [
      {'text': 'REEMPLAZO VALVULAR AÓRTICO INMEDIATO (Cirugía / TAVI)', 'bg': '#FFE4E6', 'w': 320},
      {'text': 'Sobrevida < 2 años sin Intervención Valvular', 'bg': '#F1F1F1', 'w': 280}
    ],
    'no': [
      {'text': 'Seguimiento Ecocardiográfico cada 6-12 meses', 'bg': '#E0F2FE', 'w': 290},
      {'text': 'Indicación Quirúrgica si FEVI < 50% o Test Esfuerzo (+)', 'bg': '#F1F1F1', 'w': 320}
    ]
  },
  'algo_pericarditis.svg': {
    'title': 'Pericarditis Aguda vs Taponamiento',
    'main': 'Dolor Torácico Pleurítico Posicional + ECG ST Cóncavo Difuso',
    'dec': '¿Presenta Tríada de Beck (Hipotensión, Ingurgitación, Ruidos Apagados)?',
    'yes_lbl': 'SÍ - Taponamiento',
    'no_lbl': 'NO - Pericarditis',
    'yes': [
      {'text': 'PERICARDIOCENTESIS DE URGENCIA (Drenaje guiado por eco)', 'bg': '#FFE4E6', 'w': 320},
      {'text': 'Infusión de Volumen EV Puente mientras se prepara drenaje', 'bg': '#F1F1F1', 'w': 330}
    ],
    'no': [
      {'text': 'TRATAMIENTO MÉDICO: Aspirina/Ibuprofeno + Colchicina 3 meses', 'bg': '#E0F2FE', 'w': 330},
      {'text': 'Reposo Deportivo hasta resolución sintomática', 'bg': '#F1F1F1', 'w': 290}
    ]
  },
  'algo_diseccion_aortica.svg': {
    'title': 'Disección Aórtica Stanford A vs B',
    'main': 'Dolor Torácico Lacerante Súbito irradiado a Espalda (AngioTAC)',
    'dec': '¿Compromete Aorta Ascendente (Stanford Tipo A)?',
    'yes_lbl': 'SÍ - Stanford A',
    'no_lbl': 'NO - Stanford B',
    'yes': [
      {'text': 'CIRUGÍA CARDÍACA DE URGENCIA INMEDIATA', 'bg': '#FFE4E6', 'w': 280},
      {'text': 'Riesgo inminente de Taponamiento / Rotura / IAM', 'bg': '#F1F1F1', 'w': 300}
    ],
    'no': [
      {'text': 'TRATAMIENTO MÉDICO EN UCI (Betabloqueadores EV)', 'bg': '#E0F2FE', 'w': 310},
      {'text': 'Control estricto de PA (PAS < 120 mmHg) con Labetalol', 'bg': '#F1F1F1', 'w': 320}
    ]
  },
  'algo_aaa.svg': {
    'title': 'Aneurisma Aorta Abdominal',
    'main': 'Masa Pulsátil Epigástrica o Eco-FAST Aorta ≥ 3.0 cm',
    'dec': '¿Sintomático o Diámetro Aórtico ≥ 5.5 cm?',
    'yes_lbl': 'SÍ - Criterio Quirúrgico',
    'no_lbl': 'NO - Seguimiento',
    'yes': [
      {'text': 'REPARACIÓN QUIRÚRGICA O ENDOVASCULAR (EVAR)', 'bg': '#FFE4E6', 'w': 310},
      {'text': 'Prevención de Rotura Aórtica de Alta Mortalidad', 'bg': '#F1F1F1', 'w': 300}
    ],
    'no': [
      {'text': 'Seguimiento Eco-Doppler cada 6-12 meses', 'bg': '#E0F2FE', 'w': 280},
      {'text': 'Cese Tabáquico Estricto + Control de Presión Arterial', 'bg': '#F1F1F1', 'w': 320}
    ]
  },
  'algo_isquemia_aguda.svg': {
    'title': 'Isquemia Aguda EEII (6 P)',
    'main': 'Dolor Súbito e Insoportable en Extremidad Inferior + 6 P',
    'dec': '¿Presenta Parestesias o Parálisis de la Extremidad?',
    'yes_lbl': 'SÍ - Amenaza Inminente',
    'no_lbl': 'NO - Viable',
    'yes': [
      {'text': 'HEPARINA EV BOLO + TROMBECTOMÍA DE FOGARTY < 6 HORAS', 'bg': '#FFE4E6', 'w': 330},
      {'text': 'Revascularización quirúrgica urgente previene amputación', 'bg': '#F1F1F1', 'w': 320}
    ],
    'no': [
      {'text': 'Anticoagulación con Heparina EV + Angiografía de Urgencia', 'bg': '#E0F2FE', 'w': 330},
      {'text': 'Evaluación Quirúrgica Vascular Inmediata', 'bg': '#F1F1F1', 'w': 280}
    ]
  },
  'algo_estenosis_carotidea.svg': {
    'title': 'Estenosis Carotídea Sintomática',
    'main': 'AIT o ACV Isquémico Leve Ipsilateral en últimos 6 meses',
    'dec': '¿Estenosis Carotídea Severa (70% - 99%) en Eco-Doppler?',
    'yes_lbl': 'SÍ - Severa',
    'no_lbl': 'NO - Moderada/Leve',
    'yes': [
      {'text': 'ENDARTERECTOMÍA CAROTÍDEA QUIRÚRGICA (< 14 DÍAS)', 'bg': '#FFE4E6', 'w': 330},
      {'text': 'Prevención Secundaria de ACV Isquémico Recurrente', 'bg': '#F1F1F1', 'w': 310}
    ],
    'no': [
      {'text': 'Tratamiento Médico Óptimo: Antiagregación + Estatinas', 'bg': '#E0F2FE', 'w': 320},
      {'text': 'Control Estricto de Factores de Riesgo Cardiovascular', 'bg': '#F1F1F1', 'w': 320}
    ]
  },
  'algo_tep.svg': {
    'title': 'Tromboembolismo Pulmonar',
    'main': 'Disnea Súbita + Dolor Pleurítico + Taquicardia',
    'dec': '¿Inestabilidad Hemodinámica (PAS < 90 mmHg / TEP Masivo)?',
    'yes_lbl': 'SÍ - TEP Masivo',
    'no_lbl': 'NO - TEP Estable',
    'yes': [
      {'text': 'TROMBOLISIS SISTÉMICA INMEDIATA (Alteplasa tPA EV)', 'bg': '#FFE4E6', 'w': 320},
      {'text': 'Rescate de Falla Ventricular Derecha Aguda en UCI', 'bg': '#F1F1F1', 'w': 310}
    ],
    'no': [
      {'text': 'Wells > 4: AngioTAC Directo / Wells ≤ 4: D-Dímero', 'bg': '#E0F2FE', 'w': 310},
      {'text': 'Anticoagulación Oral Continua (DOACs) por 3-6 meses', 'bg': '#F1F1F1', 'w': 320}
    ]
  }
}

print("Generando SVGs con márgenes superiores balanceados en:", svg_dir)
for filename, d in diagrams_data.items():
    svg_str = make_plantuml_svg(d['title'], d['main'], d['dec'], d['yes_lbl'], d['no_lbl'], d['yes'], d['no'])
    p = os.path.join(svg_dir, filename)
    with open(p, 'w', encoding='utf-8') as f:
        f.write(svg_str)
    print(f"-> PlantUML SVG actualizado: {filename}")

print("\n¡ÉXITO TOTAL!")
