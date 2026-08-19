const fs = require('fs');
const path = require('path');

const svgDir = path.join(__dirname, 'generate-book', 'svg_diagrams');
if (!fs.existsSync(svgDir)) {
  fs.mkdirSync(svgDir, { recursive: true });
}

function buildPlantUmlSvg({ title, nodes, lines, width = 750, height = 420 }) {
  // Generates SVG styled EXACTLY like PlantUML Activity Diagrams
  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" contentStyleType="text/css" data-diagram-type="ACTIVITY" height="${height}px" preserveAspectRatio="none" style="width:${width}px;height:${height}px;background:#FFFFFF;" version="1.1" viewBox="0 0 ${width} ${height}" width="${width}px" zoomAndPan="magnify">
  <defs/>
  <g>
    <!-- Start node -->
    <ellipse cx="${width / 2}" cy="25" fill="#222222" rx="10" ry="10" style="stroke:#222222;stroke-width:1;"/>
`;

  nodes.forEach(n => {
    if (n.type === 'rect') {
      const bg = n.bg || '#F1F1F1';
      const border = n.stroke || '#181818';
      const rx = n.rx || 12.5;
      svgContent += `
        <g>
          <rect fill="${bg}" height="${n.h || 32.8}" rx="${rx}" ry="${rx}" style="stroke:${border};stroke-width:0.5;" width="${n.w}" x="${n.x}" y="${n.y}"/>
          <text fill="#000000" font-family="Arial, sans-serif" font-size="11" text-anchor="middle" x="${n.x + n.w / 2}" y="${n.y + 20}">${n.text1}</text>
          ${n.text2 ? `<text fill="#000000" font-family="Arial, sans-serif" font-size="11" text-anchor="middle" x="${n.x + n.w / 2}" y="${n.y + 33}">${n.text2}</text>` : ''}
        </g>
      `;
    } else if (n.type === 'polygon') {
      // Hexagonal diamond
      const pts = `${n.x + 12},${n.y} ${n.x + n.w - 12},${n.y} ${n.x + n.w},${n.y + n.h / 2} ${n.x + n.w - 12},${n.y + n.h} ${n.x + 12},${n.y + n.h} ${n.x},${n.y + n.h / 2} ${n.x + 12},${n.y}`;
      svgContent += `
        <g>
          <polygon fill="${n.bg || '#FFFFFF'}" points="${pts}" style="stroke:#1E293B;stroke-width:0.5;stroke-linejoin:miter;stroke-miterlimit:10;"/>
          <text fill="#0F172A" font-family="Arial, sans-serif" font-size="11" text-anchor="middle" x="${n.x + n.w / 2}" y="${n.y + 17}">${n.text1}</text>
          ${n.text2 ? `<text fill="#0F172A" font-family="Arial, sans-serif" font-size="11" text-anchor="middle" x="${n.x + n.w / 2}" y="${n.y + 30}">${n.text2}</text>` : ''}
        </g>
      `;
    } else if (n.type === 'label') {
      svgContent += `<text fill="#000000" font-family="Arial, sans-serif" font-size="11" font-weight="bold" x="${n.x}" y="${n.y}">${n.text}</text>`;
    }
  });

  lines.forEach(l => {
    if (l.type === 'line') {
      svgContent += `<line style="stroke:#181818;stroke-width:1;" x1="${l.x1}" x2="${l.x2}" y1="${l.y1}" y2="${l.y2}"/>`;
      if (l.arrow !== false) {
        // Compute arrow head at (x2, y2)
        const dx = l.x2 - l.x1;
        const dy = l.y2 - l.y1;
        if (Math.abs(dy) > Math.abs(dx)) {
          // Vertical arrow pointing down
          if (dy > 0) {
            svgContent += `<polygon fill="#181818" points="${l.x2 - 4},${l.y2 - 10} ${l.x2},${l.y2} ${l.x2 + 4},${l.y2 - 10} ${l.x2},${l.y2 - 6}" style="stroke:#181818;stroke-width:1;"/>`;
          } else {
            svgContent += `<polygon fill="#181818" points="${l.x2 - 4},${l.y2 + 10} ${l.x2},${l.y2} ${l.x2 + 4},${l.y2 + 10} ${l.x2},${l.y2 + 6}" style="stroke:#181818;stroke-width:1;"/>`;
          }
        } else {
          // Horizontal arrow
          if (dx > 0) {
            svgContent += `<polygon fill="#181818" points="${l.x2 - 10},${l.y2 - 4} ${l.x2},${l.y2} ${l.x2 - 10},${l.y2 + 4} ${l.x2 - 6},${l.y2}" style="stroke:#181818;stroke-width:1;"/>`;
          } else {
            svgContent += `<polygon fill="#181818" points="${l.x2 + 10},${l.y2 - 4} ${l.x2},${l.y2} ${l.x2 + 10},${l.y2 + 4} ${l.x2 + 6},${l.y2}" style="stroke:#181818;stroke-width:1;"/>`;
          }
        }
      }
    }
  });

  svgContent += `</g></svg>`;
  return svgContent;
}

// Map of high-yield PlantUML SVG definitions matching Chapter 1 exact aesthetics
const plantUmlDiagrams = [
  {
    filename: 'algo_angina_estable.svg',
    svg: buildPlantUmlSvg({
      title: 'Angina Estable',
      width: 780, height: 420,
      nodes: [
        { type: 'rect', x: 230, y: 55, w: 320, h: 32.8, text1: 'Sospecha de Angina Estable (Dolor de Esfuerzo cede en reposo)' },
        { type: 'rect', x: 250, y: 110, w: 280, h: 32.8, text1: 'ECG de Reposo (Normal en 50%) + Biomarcadores Normales' },
        { type: 'polygon', x: 210, y: 165, w: 360, h: 26, text1: '¿Capacidad de realizar ejercicio y ECG interpretable?' },
        { type: 'label', x: 140, y: 182, text: 'SÍ' },
        { type: 'label', x: 580, y: 182, text: 'NO' },
        { type: 'rect', x: 50, y: 215, w: 260, h: 32.8, text1: 'Test de Esfuerzo en Banda (Ergometría)' },
        { type: 'rect', x: 470, y: 215, w: 260, h: 32.8, text1: 'Ecocardiograma / Cintigrafía con Dipiridamol' },
        { type: 'polygon', x: 230, y: 275, w: 320, h: 26, text1: '¿Criterios de Alto Riesgo o Infradesnivel ST ≥ 2 mm?' },
        { type: 'label', x: 180, y: 292, text: 'SÍ - Alto Riesgo' },
        { type: 'label', x: 560, y: 292, text: 'NO - Bajo Riesgo' },
        { type: 'rect', x: 60, y: 325, w: 300, h: 45.6, bg: '#FFE4E6', text1: 'CORONARIOGRAFÍA / ANGIOPLASTIA (PCI)', text2: 'o Cirugía de Revascularización Miocárdica (CRM)' },
        { type: 'rect', x: 420, y: 325, w: 320, h: 45.6, bg: '#E0F2FE', text1: 'TRATAMIENTO MÉDICO ÓPTIMO (TMO)', text2: 'Aspirina + Atorvastatina 80 mg + Betabloqueador' }
      ],
      lines: [
        { type: 'line', x1: 390, y1: 35, x2: 390, y2: 55 },
        { type: 'line', x1: 390, y1: 87.8, x2: 390, y2: 110 },
        { type: 'line', x1: 390, y1: 142.8, x2: 390, y2: 165 },
        { type: 'line', x1: 210, y1: 178, x2: 180, y2: 178 },
        { type: 'line', x1: 180, y1: 178, x2: 180, y2: 215 },
        { type: 'line', x1: 570, y1: 178, x2: 600, y2: 178 },
        { type: 'line', x1: 600, y1: 178, x2: 600, y2: 215 },
        { type: 'line', x1: 180, y1: 247.8, x2: 180, y2: 288 },
        { type: 'line', x1: 180, y1: 288, x2: 230, y2: 288, arrow: false },
        { type: 'line', x1: 600, y1: 247.8, x2: 600, y2: 288 },
        { type: 'line', x1: 600, y1: 288, x2: 550, y2: 288, arrow: false },
        { type: 'line', x1: 230, y1: 288, x2: 210, y2: 325 },
        { type: 'line', x1: 550, y1: 288, x2: 580, y2: 325 }
      ]
    })
  },
  {
    filename: 'algo_dolor_toracico.svg',
    svg: buildPlantUmlSvg({
      title: 'Dolor Torácico',
      width: 780, height: 420,
      nodes: [
        { type: 'rect', x: 250, y: 55, w: 280, h: 32.8, text1: 'Paciente con Dolor Torácico Agudo en Urgencias' },
        { type: 'rect', x: 210, y: 105, w: 360, h: 32.8, bg: '#FFE4E6', text1: 'ECG DE 12 DERIVACIONES EN < 10 MINUTOS', text2: 'Evaluar presencia de Supradesnivel ST' },
        { type: 'polygon', x: 230, y: 160, w: 320, h: 26, text1: '¿Supradesnivel ST ≥ 1 mm en ≥ 2 derivaciones contiguas?' },
        { type: 'label', x: 130, y: 177, text: 'SÍ - IAMSDST' },
        { type: 'label', x: 560, y: 177, text: 'NO - Evaluar 5 Letales' },
        { type: 'rect', x: 40, y: 210, w: 280, h: 45.6, bg: '#FFE4E6', text1: 'REPERFUSIÓN MIOCÁRDICA INMEDIATA', text2: 'Angioplastia Primaria < 120 min o Fibrinólisis < 30 min' },
        { type: 'rect', x: 400, y: 210, w: 340, h: 45.6, text1: 'DESCARTAR 5 EMERGENCIAS TORÁCICAS MORTALES', text2: '1. SCA (Troponinas) 2. Disección Aorta 3. TEP 4. Neumotórax 5. Rotura Esofágica' },
        { type: 'rect', x: 420, y: 285, w: 300, h: 32.8, bg: '#E0F2FE', text1: 'Estratificación de Riesgo & Observación' }
      ],
      lines: [
        { type: 'line', x1: 390, y1: 35, x2: 390, y2: 55 },
        { type: 'line', x1: 390, y1: 87.8, x2: 390, y2: 105 },
        { type: 'line', x1: 390, y1: 137.8, x2: 390, y2: 160 },
        { type: 'line', x1: 230, y1: 173, x2: 180, y2: 173 },
        { type: 'line', x1: 180, y1: 173, x2: 180, y2: 210 },
        { type: 'line', x1: 550, y1: 173, x2: 570, y2: 173 },
        { type: 'line', x1: 570, y1: 173, x2: 570, y2: 210 },
        { type: 'line', x1: 570, y1: 255.6, x2: 570, y2: 285 }
      ]
    })
  },
  {
    filename: 'algo_sca_reperfusion.svg',
    svg: buildPlantUmlSvg({
      title: 'Reperfusión SCA',
      width: 780, height: 420,
      nodes: [
        { type: 'rect', x: 230, y: 55, w: 320, h: 32.8, text1: 'Síndrome Coronario Agudo con Supradesnivel ST (IAMSDST)' },
        { type: 'rect', x: 210, y: 105, w: 360, h: 32.8, bg: '#E0F2FE', text1: 'Manejo Inicial: Aspirina 300 mg + Ticagrelor 180 mg + Heparina EV' },
        { type: 'polygon', x: 200, y: 160, w: 380, h: 26, text1: '¿Disponibilidad de Angioplastia Primaria en < 120 min?' },
        { type: 'label', x: 120, y: 177, text: 'SÍ - < 120 min' },
        { type: 'label', x: 590, y: 177, text: 'NO - > 120 min' },
        { type: 'rect', x: 30, y: 210, w: 300, h: 45.6, bg: '#E0F2FE', text1: 'ANGIOPLASTIA CORONARIA PRIMARIA (PCI)', text2: 'Meta: Tiempo Balón < 120 min desde primer contacto' },
        { type: 'rect', x: 450, y: 210, w: 300, h: 45.6, bg: '#FFE4E6', text1: 'FIBRINÓLISIS EN URGENCIAS (Alteplasa / Tenecteplasa)', text2: 'Meta: Tiempo Aguja < 30 min (si no hay contraindicaciones)' },
        { type: 'rect', x: 450, y: 285, w: 300, h: 32.8, text1: 'Traslado Inmediato a Centro con Hemodinamia (PCI)' }
      ],
      lines: [
        { type: 'line', x1: 390, y1: 35, x2: 390, y2: 55 },
        { type: 'line', x1: 390, y1: 87.8, x2: 390, y2: 105 },
        { type: 'line', x1: 390, y1: 137.8, x2: 390, y2: 160 },
        { type: 'line', x1: 200, y1: 173, x2: 180, y2: 173 },
        { type: 'line', x1: 180, y1: 173, x2: 180, y2: 210 },
        { type: 'line', x1: 580, y1: 173, x2: 600, y2: 173 },
        { type: 'line', x1: 600, y1: 173, x2: 600, y2: 210 },
        { type: 'line', x1: 600, y1: 255.6, x2: 600, y2: 285 }
      ]
    })
  },
  {
    filename: 'algo_iam_vd.svg',
    svg: buildPlantUmlSvg({
      title: 'IAM VD',
      width: 780, height: 420,
      nodes: [
        { type: 'rect', x: 230, y: 55, w: 320, h: 32.8, text1: 'IAM Inferior (ST ↑ DII, DIII, aVF) + Hipotensión Arterioclínica' },
        { type: 'rect', x: 210, y: 105, w: 360, h: 32.8, bg: '#FFE4E6', text1: 'TOMAR DERIVACIONES DERECHAS V3R - V4R OBLIGATORIAS', text2: 'Supradesnivel ST ≥ 1 mm en V4R confirma compromiso del VD' },
        { type: 'rect', x: 120, y: 170, w: 540, h: 45.6, bg: '#E0F2FE', text1: 'PILAR 1: SOBRECARGA DE VOLUMEN (Suero Fisiológico 500-1000 cc EV)', text2: 'Mantener precarga adecuada del Ventrículo Derecho para sostener Gasto Cardíaco' },
        { type: 'rect', x: 120, y: 245, w: 540, h: 45.6, bg: '#FFE4E6', text1: '⚠️ CONTRAINDICADOS ABSOLUTAMENTE:', text2: 'Nitratos (Nitroglicerina), Morfina, Diuréticos y Betabloqueadores (Colapsan precarga)' }
      ],
      lines: [
        { type: 'line', x1: 390, y1: 35, x2: 390, y2: 55 },
        { type: 'line', x1: 390, y1: 87.8, x2: 390, y2: 105 },
        { type: 'line', x1: 390, y1: 137.8, x2: 390, y2: 170 },
        { type: 'line', x1: 390, y1: 215.6, x2: 390, y2: 245 }
      ]
    })
  },
  {
    filename: 'algo_ic_dx.svg',
    svg: buildPlantUmlSvg({
      title: 'Diagnóstico IC',
      width: 780, height: 420,
      nodes: [
        { type: 'rect', x: 230, y: 55, w: 320, h: 32.8, text1: 'Sospecha de Insuficiencia Cardíaca (Disnea, Ortopnea, Edema)' },
        { type: 'polygon', x: 210, y: 105, w: 360, h: 26, text1: '¿Criterios de Framingham (2 Mayores o 1 Mayor + 2 Menores)?' },
        { type: 'label', x: 150, y: 122, text: 'SÍ' },
        { type: 'rect', x: 50, y: 150, w: 260, h: 32.8, text1: 'Dosificación de Péptidos Natriuréticos (BNP)' },
        { type: 'rect', x: 470, y: 150, w: 260, h: 32.8, text1: 'Buscar Causa No Cardíaca de Disnea' },
        { type: 'polygon', x: 60, y: 205, w: 240, h: 26, text1: '¿BNP > 35 pg/ml o NT-proBNP > 125 pg/ml?' },
        { type: 'label', x: 160, y: 245, text: 'SÍ' },
        { type: 'rect', x: 40, y: 265, w: 280, h: 45.6, bg: '#E0F2FE', text1: 'ECOCARDIOGRAMA DOPPLER OBLIGATORIO', text2: 'Clasificar según FEVI: Reducida (≤40%), Leve (41-49%), Preservada (≥50%)' }
      ],
      lines: [
        { type: 'line', x1: 390, y1: 35, x2: 390, y2: 55 },
        { type: 'line', x1: 390, y1: 87.8, x2: 390, y2: 105 },
        { type: 'line', x1: 210, y1: 118, x2: 180, y2: 118 },
        { type: 'line', x1: 180, y1: 118, x2: 180, y2: 150 },
        { type: 'line', x1: 570, y1: 118, x2: 600, y2: 118 },
        { type: 'line', x1: 600, y1: 118, x2: 600, y2: 150 },
        { type: 'line', x1: 180, y1: 182.8, x2: 180, y2: 205 },
        { type: 'line', x1: 180, y1: 231, x2: 180, y2: 265 }
      ]
    })
  },
  {
    filename: 'algo_ic_tratamiento.svg',
    svg: buildPlantUmlSvg({
      title: 'Tratamiento IC',
      width: 780, height: 420,
      nodes: [
        { type: 'rect', x: 210, y: 55, w: 360, h: 32.8, text1: 'Insuficiencia Cardíaca Sintomática con FEVI Reducida (FEVI ≤ 40%)' },
        { type: 'rect', x: 80, y: 110, w: 620, h: 50, bg: '#E0F2FE', text1: 'INICIAR EL "CUADRIPLETE FANTÁSTICO" (REDUCE MORTALIDAD CARDIOVASCULAR):', text2: '1. ARNI (Sacubitril/Valsartán)  2. Betabloqueador (Bisoprolol/Carvedilol)  3. iSGLT2 (Dapa/Empagliflozina)  4. ARM (Espironolactona)' },
        { type: 'polygon', x: 230, y: 185, w: 320, h: 26, text1: '¿Persisten síntomas (CF II-IV) y congestión?' },
        { type: 'label', x: 160, y: 202, text: 'SÍ' },
        { type: 'rect', x: 60, y: 230, w: 300, h: 32.8, text1: 'Agregar Diuréticos de Asa (Furosemida) dosis respuesta' },
        { type: 'rect', x: 420, y: 230, w: 300, h: 32.8, text1: 'Evaluar Terapia de Resincronización o DAI' }
      ],
      lines: [
        { type: 'line', x1: 390, y1: 35, x2: 390, y2: 55 },
        { type: 'line', x1: 390, y1: 87.8, x2: 390, y2: 110 },
        { type: 'line', x1: 390, y1: 160, x2: 390, y2: 185 },
        { type: 'line', x1: 230, y1: 198, x2: 210, y2: 198 },
        { type: 'line', x1: 210, y1: 198, x2: 210, y2: 230 },
        { type: 'line', x1: 550, y1: 198, x2: 570, y2: 198 },
        { type: 'line', x1: 570, y1: 198, x2: 570, y2: 230 }
      ]
    })
  },
  {
    filename: 'algo_shock.svg',
    svg: buildPlantUmlSvg({
      title: 'Clasificación de Shock',
      width: 780, height: 420,
      nodes: [
        { type: 'rect', x: 230, y: 55, w: 320, h: 32.8, bg: '#FFE4E6', text1: 'Paciente con Hipoperfusión Tisular (PAS < 90, Lactato > 2)' },
        { type: 'rect', x: 190, y: 105, w: 400, h: 32.8, text1: 'Evaluar Precarga (PCOP / PVC) y Resistencias Vasculares (RVS)' },
        { type: 'rect', x: 20, y: 165, w: 160, h: 45.6, text1: 'SHOCK HIPOVOLÉMICO', text2: 'PCOP baja, GC bajo, RVS alta (Fluidos EV)' },
        { type: 'rect', x: 200, y: 165, w: 170, h: 45.6, bg: '#FFE4E6', text1: 'SHOCK CARDIOGÉNICO', text2: 'PCOP alta, GC bajo, RVS alta (Inótropos/PCI)' },
        { type: 'rect', x: 390, y: 165, w: 170, h: 45.6, bg: '#E0F2FE', text1: 'SHOCK DISTRIBUTIVO', text2: 'PCOP normal, GC alto, RVS baja (Norepinefrina)' },
        { type: 'rect', x: 580, y: 165, w: 180, h: 45.6, text1: 'SHOCK OBSTRUCTIVO', text2: 'TEP Masivo / Taponamiento (Descompresión)' }
      ],
      lines: [
        { type: 'line', x1: 390, y1: 35, x2: 390, y2: 55 },
        { type: 'line', x1: 390, y1: 87.8, x2: 390, y2: 105 },
        { type: 'line', x1: 390, y1: 137.8, x2: 100, y2: 165 },
        { type: 'line', x1: 390, y1: 137.8, x2: 285, y2: 165 },
        { type: 'line', x1: 390, y1: 137.8, x2: 475, y2: 165 },
        { type: 'line', x1: 390, y1: 137.8, x2: 670, y2: 165 }
      ]
    })
  },
  {
    filename: 'algo_estenosis_aortica.svg',
    svg: buildPlantUmlSvg({
      title: 'Estenosis Aórtica',
      width: 780, height: 420,
      nodes: [
        { type: 'rect', x: 230, y: 55, w: 320, h: 32.8, text1: 'Soplo Sistólico Eyectivo Foco Aórtico irradiado a Carótidas' },
        { type: 'rect', x: 210, y: 105, w: 360, h: 32.8, text1: 'Ecocardiograma: Área Valvular < 1.0 cm² o Gradiente > 40 mmHg' },
        { type: 'polygon', x: 230, y: 160, w: 320, h: 26, text1: '¿Presenta Síntomas (Angina, Síncope o Disnea)?' },
        { type: 'label', x: 150, y: 177, text: 'SÍ - Sintomático' },
        { type: 'label', x: 570, y: 177, text: 'NO - Asintomático' },
        { type: 'rect', x: 40, y: 210, w: 300, h: 45.6, bg: '#FFE4E6', text1: 'REEMPLAZO VALVULAR AÓRTICO INMEDIATO', text2: 'Cirugía Valvular o TAVI (Sobrevida < 2 años sin cirugía)' },
        { type: 'rect', x: 440, y: 210, w: 300, h: 45.6, bg: '#E0F2FE', text1: 'Seguimiento Clínico y Ecocardiográfico estricto', text2: 'Cirugía si FEVI < 50% o prueba de esfuerzo (+) ' }
      ],
      lines: [
        { type: 'line', x1: 390, y1: 35, x2: 390, y2: 55 },
        { type: 'line', x1: 390, y1: 87.8, x2: 390, y2: 105 },
        { type: 'line', x1: 390, y1: 137.8, x2: 390, y2: 160 },
        { type: 'line', x1: 230, y1: 173, x2: 190, y2: 173 },
        { type: 'line', x1: 190, y1: 173, x2: 190, y2: 210 },
        { type: 'line', x1: 550, y1: 173, x2: 590, y2: 173 },
        { type: 'line', x1: 590, y1: 173, x2: 590, y2: 210 }
      ]
    })
  },
  {
    filename: 'algo_pericarditis.svg',
    svg: buildPlantUmlSvg({
      title: 'Pericarditis Aguda',
      width: 780, height: 420,
      nodes: [
        { type: 'rect', x: 230, y: 55, w: 320, h: 32.8, text1: 'Dolor Pleurítico Posicional + ECG ST Cóncavo Difuso' },
        { type: 'polygon', x: 210, y: 105, w: 360, h: 26, text1: '¿Signos de Taponamiento (Tríada de Beck / Pulso Paradojal)?' },
        { type: 'label', x: 130, y: 122, text: 'SÍ - Taponamiento' },
        { type: 'label', x: 570, y: 122, text: 'NO - Pericarditis' },
        { type: 'rect', x: 30, y: 150, w: 300, h: 45.6, bg: '#FFE4E6', text1: 'PERICARDIOCENTESIS DE URGENCIA', text2: 'Drenaje pericárdico guiado por eco' },
        { type: 'rect', x: 440, y: 150, w: 300, h: 45.6, bg: '#E0F2FE', text1: 'TRATAMIENTO MÉDICO DE 1ª LÍNEA', text2: 'Aspirina 750-1000 mg c/8h + Colchicina 0.5 mg/día por 3 meses' }
      ],
      lines: [
        { type: 'line', x1: 390, y1: 35, x2: 390, y2: 55 },
        { type: 'line', x1: 390, y1: 87.8, x2: 390, y2: 105 },
        { type: 'line', x1: 210, y1: 118, x2: 180, y2: 118 },
        { type: 'line', x1: 180, y1: 118, x2: 180, y2: 150 },
        { type: 'line', x1: 570, y1: 118, x2: 590, y2: 118 },
        { type: 'line', x1: 590, y1: 118, x2: 590, y2: 150 }
      ]
    })
  },
  {
    filename: 'algo_diseccion_aortica.svg',
    svg: buildPlantUmlSvg({
      title: 'Disección Aórtica',
      width: 780, height: 420,
      nodes: [
        { type: 'rect', x: 210, y: 55, w: 360, h: 32.8, bg: '#FFE4E6', text1: 'Dolor Torácico Lacerante Súbito irradiado a Espalda (AngioTAC)' },
        { type: 'polygon', x: 230, y: 110, w: 320, h: 26, text1: '¿Compromete Aorta Ascendente (Stanford A)?' },
        { type: 'label', x: 130, y: 127, text: 'SÍ - Stanford A' },
        { type: 'label', x: 570, y: 127, text: 'NO - Stanford B' },
        { type: 'rect', x: 40, y: 155, w: 300, h: 45.6, bg: '#FFE4E6', text1: 'CIRUGÍA CARDÍACA DE URGENCIA INMEDIATA', text2: 'Reemplazo de aorta ascendente (Alto riesgo de taponamiento)' },
        { type: 'rect', x: 440, y: 155, w: 300, h: 45.6, bg: '#E0F2FE', text1: 'TRATAMIENTO MÉDICO EN UCI (Stanford B)', text2: 'Betabloqueadores EV (Labetalol/Esmolol) para PAS < 120 mmHg' }
      ],
      lines: [
        { type: 'line', x1: 390, y1: 35, x2: 390, y2: 55 },
        { type: 'line', x1: 390, y1: 87.8, x2: 390, y2: 110 },
        { type: 'line', x1: 230, y1: 123, x2: 190, y2: 123 },
        { type: 'line', x1: 190, y1: 123, x2: 190, y2: 155 },
        { type: 'line', x1: 550, y1: 123, x2: 590, y2: 123 },
        { type: 'line', x1: 590, y1: 123, x2: 590, y2: 155 }
      ]
    })
  },
  {
    filename: 'algo_aaa.svg',
    svg: buildPlantUmlSvg({
      title: 'Aneurisma Aorta Abdominal',
      width: 780, height: 420,
      nodes: [
        { type: 'rect', x: 230, y: 55, w: 320, h: 32.8, text1: 'Masa Pulsátil Epigástrica / Eco-FAST > 3.0 cm' },
        { type: 'polygon', x: 230, y: 110, w: 320, h: 26, text1: '¿Sintomático o Diámetro ≥ 5.5 cm?' },
        { type: 'label', x: 150, y: 127, text: 'SÍ' },
        { type: 'label', x: 570, y: 127, text: 'NO' },
        { type: 'rect', x: 40, y: 155, w: 300, h: 45.6, bg: '#FFE4E6', text1: 'REPARACIÓN QUIRÚRGICA O ENDOVASCULAR (EVAR)', text2: 'Indicación electiva o de urgencia' },
        { type: 'rect', x: 440, y: 155, w: 300, h: 45.6, bg: '#E0F2FE', text1: 'Seguimiento con Ultrasonido periódico', text2: 'Control estricto de PA y cese tabáquico' }
      ],
      lines: [
        { type: 'line', x1: 390, y1: 35, x2: 390, y2: 55 },
        { type: 'line', x1: 390, y1: 87.8, x2: 390, y2: 110 },
        { type: 'line', x1: 230, y1: 123, x2: 190, y2: 123 },
        { type: 'line', x1: 190, y1: 123, x2: 190, y2: 155 },
        { type: 'line', x1: 550, y1: 123, x2: 590, y2: 123 },
        { type: 'line', x1: 590, y1: 123, x2: 590, y2: 155 }
      ]
    })
  },
  {
    filename: 'algo_isquemia_aguda.svg',
    svg: buildPlantUmlSvg({
      title: 'Isquemia Aguda EEII',
      width: 780, height: 420,
      nodes: [
        { type: 'rect', x: 210, y: 55, w: 360, h: 32.8, bg: '#FFE4E6', text1: 'Dolor Súbito e Insoportable en EEII + Tríada de las 6 P' },
        { type: 'rect', x: 190, y: 105, w: 400, h: 32.8, bg: '#E0F2FE', text1: 'INICIAR ANTICOAGULACIÓN INMEDIATA CON HEPARINA EV BOLO' },
        { type: 'rect', x: 190, y: 160, w: 400, h: 45.6, bg: '#FFE4E6', text1: 'TROMBECTOMÍA QUIRÚRGICA CON CATÉTER DE FOGARTY', text2: 'Revascularización de urgencia antes de las 6 horas de isquemia' }
      ],
      lines: [
        { type: 'line', x1: 390, y1: 35, x2: 390, y2: 55 },
        { type: 'line', x1: 390, y1: 87.8, x2: 390, y2: 105 },
        { type: 'line', x1: 390, y1: 137.8, x2: 390, y2: 160 }
      ]
    })
  },
  {
    filename: 'algo_estenosis_carotidea.svg',
    svg: buildPlantUmlSvg({
      title: 'Estenosis Carotídea',
      width: 780, height: 420,
      nodes: [
        { type: 'rect', x: 230, y: 55, w: 320, h: 32.8, text1: 'AIT o ACV Isquémico Leve Ipsilateral (<6 meses)' },
        { type: 'rect', x: 210, y: 105, w: 360, h: 32.8, text1: 'Eco-Doppler Carotídeo / AngioTAC de Vasos del Cuello' },
        { type: 'polygon', x: 230, y: 160, w: 320, h: 26, text1: '¿Estenosis Carotídea Severa 70% - 99%?' },
        { type: 'label', x: 150, y: 177, text: 'SÍ' },
        { type: 'label', x: 570, y: 177, text: 'NO' },
        { type: 'rect', x: 40, y: 210, w: 300, h: 45.6, bg: '#FFE4E6', text1: 'ENDARTERECTOMÍA CAROTÍDEA QUIRÚRGICA', text2: 'Realizar precozmente (idealmente < 14 días)' },
        { type: 'rect', x: 440, y: 210, w: 300, h: 45.6, bg: '#E0F2FE', text1: 'Tratamiento Médico Óptimo', text2: 'Antiagregación + Estatinas dosis alta' }
      ],
      lines: [
        { type: 'line', x1: 390, y1: 35, x2: 390, y2: 55 },
        { type: 'line', x1: 390, y1: 87.8, x2: 390, y2: 105 },
        { type: 'line', x1: 390, y1: 137.8, x2: 390, y2: 160 },
        { type: 'line', x1: 230, y1: 173, x2: 190, y2: 173 },
        { type: 'line', x1: 190, y1: 173, x2: 190, y2: 210 },
        { type: 'line', x1: 550, y1: 173, x2: 590, y2: 173 },
        { type: 'line', x1: 590, y1: 173, x2: 590, y2: 210 }
      ]
    })
  },
  {
    filename: 'algo_tep.svg',
    svg: buildPlantUmlSvg({
      title: 'Tromboembolismo Pulmonar',
      width: 780, height: 420,
      nodes: [
        { type: 'rect', x: 230, y: 55, w: 320, h: 32.8, text1: 'Sospecha de TEP (Disnea Súbita, Dolor Pleurítico)' },
        { type: 'polygon', x: 230, y: 105, w: 320, h: 26, text1: '¿Inestabilidad Hemodinámica (PAS < 90 mmHg)?' },
        { type: 'label', x: 130, y: 122, text: 'SÍ - TEP Masivo' },
        { type: 'label', x: 570, y: 122, text: 'NO - TEP Estable' },
        { type: 'rect', x: 30, y: 150, w: 300, h: 45.6, bg: '#FFE4E6', text1: 'TROMBOLISIS SISTÉMICA (Alteplasa tPA EV)', text2: 'Rescate de Urgencia por falla VD agudo' },
        { type: 'polygon', x: 430, y: 150, w: 320, h: 26, text1: '¿Puntaje Escala de Wells TEP > 4 (Alta Probabilidad)?' },
        { type: 'label', x: 380, y: 197, text: 'SÍ' },
        { type: 'label', x: 740, y: 197, text: 'NO' },
        { type: 'rect', x: 330, y: 220, w: 220, h: 32.8, bg: '#E0F2FE', text1: 'ANGIOTAC DE TÓRAX DIRECTO' },
        { type: 'rect', x: 580, y: 220, w: 180, h: 32.8, text1: 'Dosificación D-Dímero' }
      ],
      lines: [
        { type: 'line', x1: 390, y1: 35, x2: 390, y2: 55 },
        { type: 'line', x1: 390, y1: 87.8, x2: 390, y2: 105 },
        { type: 'line', x1: 230, y1: 118, x2: 180, y2: 118 },
        { type: 'line', x1: 180, y1: 118, x2: 180, y2: 150 },
        { type: 'line', x1: 550, y1: 118, x2: 590, y2: 118 },
        { type: 'line', x1: 590, y1: 118, x2: 590, y2: 150 },
        { type: 'line', x1: 430, y1: 163, x2: 440, y2: 163 },
        { type: 'line', x1: 440, y1: 163, x2: 440, y2: 220 },
        { type: 'line', x1: 750, y1: 163, x2: 670, y2: 163 },
        { type: 'line', x1: 670, y1: 163, x2: 670, y2: 220 }
      ]
    })
  }
];

console.log("Generando SVGs con estilo PlantUML idéntico...");
plantUmlDiagrams.forEach(d => {
  const p = path.join(svgDir, d.filename);
  fs.writeFileSync(p, d.svg, 'utf8');
  console.log(`  └─ PlantUML SVG generado: ${d.filename}`);
});

console.log("¡ÉXITO TOTAL!");
