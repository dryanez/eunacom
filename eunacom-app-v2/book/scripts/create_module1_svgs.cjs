const fs = require('fs');
const path = require('path');

const svgDir = path.join(__dirname, '..', 'generate-book', 'svg_diagrams');
if (!fs.existsSync(svgDir)) fs.mkdirSync(svgDir, { recursive: true });

function wrapSvg(content, height = 240) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 42 743 320" width="100%" height="${height}px" style="max-width:743px;height:${height}px;font-family:'Inter',system-ui,sans-serif;">
  <defs>
    <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e3a8a" />
      <stop offset="100%" stop-color="#2563eb" />
    </linearGradient>
    <linearGradient id="amberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#b45309" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>
    <linearGradient id="redGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#991b1b" />
      <stop offset="100%" stop-color="#dc2626" />
    </linearGradient>
    <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#065f46" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>
    <filter id="cardShadow" x="-5%" y="-5%" width="110%" height="115%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#0f172a" flood-opacity="0.08"/>
    </filter>
  </defs>
  ${content}
</svg>`;
}

const diagrams = {
  // 1. Diagnóstico Diabetes Mellitus
  'algo_dm2_dx.svg': wrapSvg(`
    <!-- Step 1: Sospecha -->
    <g filter="url(#cardShadow)">
      <rect x="20" y="55" width="210" height="75" rx="6" fill="#f8fafc" stroke="#1e3a8a" stroke-width="1.5"/>
      <rect x="20" y="55" width="210" height="22" rx="6" fill="url(#blueGrad)"/>
      <text x="125" y="70" fill="#ffffff" font-size="10" font-weight="700" text-anchor="middle">1. CRITERIOS DIAGNÓSTICOS (ADA/GES)</text>
      <text x="30" y="93" fill="#1e293b" font-size="8.5" font-weight="600">• Glicemia Ayuno ≥ 126 mg/dL (x2)</text>
      <text x="30" y="107" fill="#1e293b" font-size="8.5" font-weight="600">• PTGO 75g (2h) ≥ 200 mg/dL</text>
      <text x="30" y="121" fill="#1e293b" font-size="8.5" font-weight="600">• HbA1c ≥ 6.5% estandarizada</text>
    </g>

    <!-- Arrow 1 -->
    <path d="M 230 92 L 265 92" stroke="#64748b" stroke-width="2" marker-end="url(#arrow)" />

    <!-- Step 2: Síntomas Clásicos -->
    <g filter="url(#cardShadow)">
      <rect x="270" y="55" width="200" height="75" rx="6" fill="#fffbeb" stroke="#d97706" stroke-width="1.5"/>
      <rect x="270" y="55" width="200" height="22" rx="6" fill="url(#amberGrad)"/>
      <text x="370" y="70" fill="#ffffff" font-size="10" font-weight="700" text-anchor="middle">2. CRISIS O SÍNTOMAS 4P</text>
      <text x="280" y="93" fill="#92400e" font-size="8.5" font-weight="700">Glicemia al Azar ≥ 200 mg/dL</text>
      <text x="280" y="108" fill="#78350f" font-size="8">+ Poliuria, Polidipsia, Polifagia</text>
      <text x="280" y="121" fill="#78350f" font-size="8">+ Baja de peso inexplicable</text>
    </g>

    <!-- Arrow 2 -->
    <path d="M 470 92 L 505 92" stroke="#64748b" stroke-width="2"/>

    <!-- Step 3: Confirmación -->
    <g filter="url(#cardShadow)">
      <rect x="510" y="55" width="210" height="75" rx="6" fill="#f0fdf4" stroke="#059669" stroke-width="1.5"/>
      <rect x="510" y="55" width="210" height="22" rx="6" fill="url(#greenGrad)"/>
      <text x="615" y="70" fill="#ffffff" font-size="10" font-weight="700" text-anchor="middle">3. CONDUCTA / DIAGNÓSTICO</text>
      <text x="520" y="93" fill="#065f46" font-size="8.5" font-weight="700">DIABETES MELLITUS CONFIRMADA</text>
      <text x="520" y="108" fill="#047857" font-size="8">• Si asintomático: Requiere 2do test</text>
      <text x="520" y="121" fill="#047857" font-size="8">• Si síntomas 4P + Azar ≥ 200: Directo</text>
    </g>

    <!-- Bottom Step: Prediabetes -->
    <g filter="url(#cardShadow)">
      <rect x="20" y="155" width="700" height="150" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2"/>
      <rect x="20" y="155" width="700" height="22" rx="6" fill="#334155"/>
      <text x="370" y="170" fill="#ffffff" font-size="9.5" font-weight="700" text-anchor="middle">ESTADOS DE PREDIABETES Y CONDUCTA PREVENTIVA</text>
      
      <rect x="35" y="188" width="200" height="100" rx="4" fill="#ffffff" stroke="#94a3b8"/>
      <text x="135" y="205" fill="#1e3a8a" font-size="8.5" font-weight="700" text-anchor="middle">Glicemia Ayuno Alterada (GAA)</text>
      <text x="45" y="225" fill="#334155" font-size="8">Glicemia 100 – 125 mg/dL</text>
      <text x="45" y="242" fill="#64748b" font-size="7.5">Indicar PTGO para descartar</text>
      <text x="45" y="255" fill="#64748b" font-size="7.5">Intolerancia a la Glucosa o DM2</text>

      <rect x="270" y="188" width="200" height="100" rx="4" fill="#ffffff" stroke="#94a3b8"/>
      <text x="370" y="205" fill="#b45309" font-size="8.5" font-weight="700" text-anchor="middle">Intolerancia a la Glucosa (ITG)</text>
      <text x="280" y="225" fill="#334155" font-size="8">PTGO 2h: 140 – 199 mg/dL</text>
      <text x="280" y="242" fill="#64748b" font-size="7.5">Cambio estilo de vida estricto</text>
      <text x="280" y="255" fill="#64748b" font-size="7.5">Control anual con PTGO</text>

      <rect x="505" y="188" width="200" height="100" rx="4" fill="#ffffff" stroke="#94a3b8"/>
      <text x="605" y="205" fill="#065f46" font-size="8.5" font-weight="700" text-anchor="middle">HbA1c en Rango Prediabetes</text>
      <text x="515" y="225" fill="#334155" font-size="8">HbA1c 5.7% – 6.4%</text>
      <text x="515" y="242" fill="#64748b" font-size="7.5">Dieta mediterránea + Ejercicio</text>
      <text x="515" y="255" fill="#64748b" font-size="7.5">Baja de peso meta ≥ 7%</text>
    </g>
  `),

  // 2. Manejo Escalonado DM2
  'algo_dm2_manejo.svg': wrapSvg(`
    <g filter="url(#cardShadow)">
      <rect x="20" y="55" width="215" height="110" rx="6" fill="#f8fafc" stroke="#1e3a8a" stroke-width="1.5"/>
      <rect x="20" y="55" width="215" height="22" rx="6" fill="url(#blueGrad)"/>
      <text x="127" y="70" fill="#ffffff" font-size="9.5" font-weight="700" text-anchor="middle">1ª LÍNEA: BASE GENERAL</text>
      <text x="30" y="93" fill="#1e3a8a" font-size="8.5" font-weight="700">Metformina 850 – 2550 mg/d</text>
      <text x="30" y="108" fill="#334155" font-size="8">+ Estilo de Vida Saludable</text>
      <text x="30" y="122" fill="#64748b" font-size="7.5">• Titular lento por síntomas GI</text>
      <text x="30" y="136" fill="#64748b" font-size="7.5">• Contraindicada si VFG &lt; 30 mL/min</text>
      <text x="30" y="150" fill="#dc2626" font-size="7.5">• Riesgo de acidosis láctica</text>
    </g>

    <!-- Center Box: Comorbilidades -->
    <g filter="url(#cardShadow)">
      <rect x="260" y="55" width="220" height="110" rx="6" fill="#fffbeb" stroke="#d97706" stroke-width="1.5"/>
      <rect x="260" y="55" width="220" height="22" rx="6" fill="url(#amberGrad)"/>
      <text x="370" y="70" fill="#ffffff" font-size="9.5" font-weight="700" text-anchor="middle">2ª LÍNEA: COMORBILIDAD</text>
      <text x="270" y="93" fill="#b45309" font-size="8.5" font-weight="700">• ECV Aterosclerótica:</text>
      <text x="280" y="106" fill="#334155" font-size="8">arGLP-1 o iSGLT2 (beneficio CV)</text>
      <text x="270" y="121" fill="#b45309" font-size="8.5" font-weight="700">• Insuficiencia Cardíaca / ERC:</text>
      <text x="280" y="134" fill="#334155" font-size="8">iSGLT2 (Dapa / Empagliflozina)</text>
      <text x="270" y="149" fill="#047857" font-size="8">• Obesidad: arGLP-1 / Tirzepatida</text>
    </g>

    <!-- Right Box: Sin Comorbilidad -->
    <g filter="url(#cardShadow)">
      <rect x="505" y="55" width="215" height="110" rx="6" fill="#f0fdf4" stroke="#059669" stroke-width="1.5"/>
      <rect x="505" y="55" width="215" height="22" rx="6" fill="url(#greenGrad)"/>
      <text x="612" y="70" fill="#ffffff" font-size="9.5" font-weight="700" text-anchor="middle">SEGUNDA LÍNEA (SIN ECV)</text>
      <text x="515" y="93" fill="#065f46" font-size="8.5" font-weight="700">• iDPP-4 (Vildagliptina/Lina):</text>
      <text x="525" y="106" fill="#334155" font-size="8">Seguros, neutros en peso</text>
      <text x="515" y="121" fill="#065f46" font-size="8.5" font-weight="700">• Sulfonilureas (Gliclazida):</text>
      <text x="525" y="134" fill="#334155" font-size="8">Bajo costo. Riesgo hipoglicemia</text>
      <text x="515" y="149" fill="#dc2626" font-size="8">• Glibenclamida: Evitar en AM</text>
    </g>

    <!-- Bottom Box: Metas y Descompensación -->
    <g filter="url(#cardShadow)">
      <rect x="20" y="180" width="700" height="125" rx="6" fill="#ffffff" stroke="#94a3b8" stroke-width="1.2"/>
      <rect x="20" y="180" width="700" height="22" rx="6" fill="#1e293b"/>
      <text x="370" y="195" fill="#ffffff" font-size="9.5" font-weight="700" text-anchor="middle">METAS DE CONTROL GLICÉMICO (HbA1c) &amp; CRITERIOS DE INSULINIZACIÓN</text>
      
      <text x="35" y="220" fill="#1e3a8a" font-size="8.5" font-weight="700">Metas HbA1c Individualizadas:</text>
      <text x="35" y="235" fill="#334155" font-size="8">• Joven, sin comorbilidad: &lt; 6.5% - 7.0%</text>
      <text x="35" y="248" fill="#334155" font-size="8">• Adulto mayor frágil / hipoglicemias: &lt; 8.0% - 8.5%</text>
      <text x="35" y="261" fill="#64748b" font-size="7.5">• Embarazo: &lt; 6.0% - 6.5%</text>

      <text x="380" y="220" fill="#dc2626" font-size="8.5" font-weight="700">Indicaciones Inmediatas de Insulina:</text>
      <text x="380" y="235" fill="#334155" font-size="8">• HbA1c &gt; 10% o Glicemia &gt; 300 mg/dL sintomática</text>
      <text x="380" y="248" fill="#334155" font-size="8">• Pérdida de peso acelerada o cetonuria / CAD</text>
      <text x="380" y="261" fill="#334155" font-size="8">• Embarazo descompensado, Falla renal VFG &lt; 30</text>
    </g>
  `),

  // 3. CAD vs EHH
  'algo_cad_ehh.svg': wrapSvg(`
    <g filter="url(#cardShadow)">
      <rect x="20" y="55" width="340" height="115" rx="6" fill="#fef2f2" stroke="#dc2626" stroke-width="1.5"/>
      <rect x="20" y="55" width="340" height="22" rx="6" fill="url(#redGrad)"/>
      <text x="190" y="70" fill="#ffffff" font-size="10" font-weight="700" text-anchor="middle">CETOACIDOSIS DIABÉTICA (CAD)</text>
      <text x="30" y="93" fill="#991b1b" font-size="8.5" font-weight="700">• Típica en DM1 (joven, rápida evolución &lt; 24h)</text>
      <text x="30" y="108" fill="#334155" font-size="8">• Glicemia &gt; 250 mg/dL + Cetonemia / Cetonuria +++</text>
      <text x="30" y="122" fill="#334155" font-size="8">• Acidosis metabólica: pH &lt; 7.30, HCO3 &lt; 18 mEq/L</text>
      <text x="30" y="136" fill="#334155" font-size="8">• Anion Gap Elevado (&gt; 10 - 12)</text>
      <text x="30" y="150" fill="#7f1d1d" font-size="8">• Respiración Kussmaul, dolor abdominal, aliento cetósico</text>
    </g>

    <g filter="url(#cardShadow)">
      <rect x="380" y="55" width="340" height="115" rx="6" fill="#fffbeb" stroke="#d97706" stroke-width="1.5"/>
      <rect x="380" y="55" width="340" height="22" rx="6" fill="url(#amberGrad)"/>
      <text x="550" y="70" fill="#ffffff" font-size="10" font-weight="700" text-anchor="middle">ESTADO HIPEROSMOLAR HIPERGLICÉMICO (EHH)</text>
      <text x="390" y="93" fill="#92400e" font-size="8.5" font-weight="700">• Típica en DM2 (adulto mayor, evolución días a sem)</text>
      <text x="390" y="108" fill="#334155" font-size="8">• Glicemia Marcada &gt; 600 mg/dL (severa deshidratación)</text>
      <text x="390" y="122" fill="#334155" font-size="8">• Osmolaridad Plasmática Efectiva &gt; 320 mOsm/kg</text>
      <text x="390" y="136" fill="#334155" font-size="8">• Sin acidosis significativa (pH &gt; 7.30, HCO3 &gt; 18)</text>
      <text x="390" y="150" fill="#78350f" font-size="8">• Compromiso de conciencia severo / estupor / coma</text>
    </g>

    <!-- Bottom Treatment Flow -->
    <g filter="url(#cardShadow)">
      <rect x="20" y="185" width="700" height="120" rx="6" fill="#f8fafc" stroke="#1e3a8a" stroke-width="1.2"/>
      <rect x="20" y="185" width="700" height="22" rx="6" fill="url(#blueGrad)"/>
      <text x="370" y="200" fill="#ffffff" font-size="9.5" font-weight="700" text-anchor="middle">PILALRES DE TRATAMIENTO DE URGENCIA (CAD &amp; EHH)</text>

      <text x="35" y="225" fill="#1e3a8a" font-size="8.5" font-weight="700">1. Hidratación EV (Pilar #1):</text>
      <text x="35" y="240" fill="#334155" font-size="8">SF 0.9% 1000 mL en 1ª hora</text>
      <text x="35" y="253" fill="#64748b" font-size="7.5">Déficit: 4-6 L en CAD, 8-10 L en EHH</text>
      <text x="35" y="266" fill="#64748b" font-size="7.5">Pasar a SG 5% al llegar a 200-250 mg/dL</text>

      <text x="275" y="225" fill="#1e3a8a" font-size="8.5" font-weight="700">2. Insulina Cristalina EV:</text>
      <text x="275" y="240" fill="#334155" font-size="8">Bolo 0.1 UI/kg + 0.1 UI/kg/h infusión</text>
      <text x="275" y="253" fill="#dc2626" font-size="7.5">¡NO INICIAR SI K+ &lt; 3.3 mEq/L!</text>
      <text x="275" y="266" fill="#64748b" font-size="7.5">Meta descenso: 50-75 mg/dL por hora</text>

      <text x="515" y="225" fill="#1e3a8a" font-size="8.5" font-weight="700">3. Potasio y Bicarbonato:</text>
      <text x="515" y="240" fill="#334155" font-size="8">• K+ 3.3-5.2: Agregar 20-30 mEq/L SF</text>
      <text x="515" y="253" fill="#334155" font-size="8">• K+ &gt; 5.2: No aportar K+, monitorizar</text>
      <text x="515" y="266" fill="#dc2626" font-size="7.5">• Bicarbonato SOLO si pH &lt; 6.9</text>
    </g>
  `),

  // 4. Hipotiroidismo
  'algo_hipotiroidismo.svg': wrapSvg(`
    <g filter="url(#cardShadow)">
      <rect x="20" y="55" width="210" height="95" rx="6" fill="#f8fafc" stroke="#1e3a8a" stroke-width="1.5"/>
      <rect x="20" y="55" width="210" height="22" rx="6" fill="url(#blueGrad)"/>
      <text x="125" y="70" fill="#ffffff" font-size="9.5" font-weight="700" text-anchor="middle">SOSPECHA CLÍNICA</text>
      <text x="30" y="93" fill="#1e293b" font-size="8.5">• Astenia, intolerancia al frío</text>
      <text x="30" y="106" fill="#1e293b" font-size="8.5">• Aumento de peso, piel seca</text>
      <text x="30" y="119" fill="#1e293b" font-size="8.5">• Constipación, bradipsiquia</text>
      <text x="30" y="132" fill="#1e3a8a" font-size="8.5" font-weight="700">→ Solicitar TSH</text>
    </g>

    <path d="M 230 102 L 270 102" stroke="#64748b" stroke-width="2"/>

    <g filter="url(#cardShadow)">
      <rect x="275" y="55" width="200" height="95" rx="6" fill="#f0fdf4" stroke="#059669" stroke-width="1.5"/>
      <rect x="275" y="55" width="200" height="22" rx="6" fill="url(#greenGrad)"/>
      <text x="375" y="70" fill="#ffffff" font-size="9.5" font-weight="700" text-anchor="middle">TSH ELEVADA &gt; 4.5</text>
      <text x="285" y="93" fill="#065f46" font-size="8.5" font-weight="700">Solicitar T4 Libre (T4L):</text>
      <text x="285" y="110" fill="#334155" font-size="8">• T4L Baja → Hipotiroidismo Primario</text>
      <text x="285" y="125" fill="#334155" font-size="8">• T4L Normal → Hipo. Subclínico</text>
      <text x="285" y="138" fill="#64748b" font-size="7.5">• Anti-TPO: Causa Hashimoto</text>
    </g>

    <path d="M 475 102 L 515 102" stroke="#64748b" stroke-width="2"/>

    <g filter="url(#cardShadow)">
      <rect x="520" y="55" width="200" height="95" rx="6" fill="#fffbeb" stroke="#d97706" stroke-width="1.5"/>
      <rect x="520" y="55" width="200" height="22" rx="6" fill="url(#amberGrad)"/>
      <text x="620" y="70" fill="#ffffff" font-size="9.5" font-weight="700" text-anchor="middle">TRATAMIENTO</text>
      <text x="530" y="93" fill="#b45309" font-size="8.5" font-weight="700">Levotiroxina (T4 oral):</text>
      <text x="530" y="108" fill="#334155" font-size="8">• Adulto joven: 1.6 mcg/kg/día</text>
      <text x="530" y="121" fill="#334155" font-size="8">• AM o Cardiopatía: 25-50 mcg/d</text>
      <text x="530" y="135" fill="#64748b" font-size="7.5">• Ayunas 30-60 min antes desayuno</text>
    </g>

    <!-- Bottom Special Scenarios -->
    <g filter="url(#cardShadow)">
      <rect x="20" y="165" width="700" height="140" rx="6" fill="#ffffff" stroke="#94a3b8" stroke-width="1.2"/>
      <rect x="20" y="165" width="700" height="22" rx="6" fill="#1e293b"/>
      <text x="370" y="180" fill="#ffffff" font-size="9.5" font-weight="700" text-anchor="middle">ESCENARIOS ESPECIALES DE ALTO RENDIMIENTO (EUNACOM)</text>

      <text x="35" y="205" fill="#1e3a8a" font-size="8.5" font-weight="700">1. Hipotiroidismo Subclínico (Tratar si):</text>
      <text x="35" y="220" fill="#334155" font-size="8">• TSH ≥ 10 mUI/L (independiente de edad)</text>
      <text x="35" y="233" fill="#334155" font-size="8">• Embarazo o búsqueda de fertilidad</text>
      <text x="35" y="246" fill="#334155" font-size="8">• Anti-TPO (+) o Bocio sintomático</text>
      <text x="35" y="259" fill="#334155" font-size="8">• Síntomas claros / &lt; 65 años</text>

      <text x="275" y="205" fill="#065f46" font-size="8.5" font-weight="700">2. Hipotiroidismo en Embarazo:</text>
      <text x="275" y="220" fill="#334155" font-size="8">• Meta TSH: &lt; 2.5 en 1T, &lt; 3.0 en 2T/3T</text>
      <text x="275" y="233" fill="#334155" font-size="8">• Aumentar dosis de Levotiroxina 30-50%</text>
      <text x="275" y="246" fill="#334155" font-size="8">  apenas se confirma el embarazo</text>
      <text x="275" y="259" fill="#64748b" font-size="7.5">• Control TSH cada 4-6 semanas</text>

      <text x="515" y="205" fill="#dc2626" font-size="8.5" font-weight="700">3. Coma Mixedematoso (Urgencia):</text>
      <text x="515" y="220" fill="#334155" font-size="8">• Hipotermia + Hiponatremia + Bradicardia</text>
      <text x="515" y="233" fill="#334155" font-size="8">• Desencadenante: Infección, frío, sedantes</text>
      <text x="515" y="246" fill="#334155" font-size="8">• Tto: Levotiroxina EV + Hidrocortisona EV</text>
      <text x="515" y="259" fill="#7f1d1d" font-size="7.5">  (Hidrocortisona antes para evitar crisis adrenal)</text>
    </g>
  `),

  // 5. Nódulo Tiroideo
  'algo_nodulo_tiroideo.svg': wrapSvg(`
    <g filter="url(#cardShadow)">
      <rect x="20" y="55" width="210" height="95" rx="6" fill="#f8fafc" stroke="#1e3a8a" stroke-width="1.5"/>
      <rect x="20" y="55" width="210" height="22" rx="6" fill="url(#blueGrad)"/>
      <text x="125" y="70" fill="#ffffff" font-size="9.5" font-weight="700" text-anchor="middle">1. HALLAZGO NÓDULO</text>
      <text x="30" y="93" fill="#1e293b" font-size="8.5">• Palpación o Incidentaloma</text>
      <text x="30" y="108" fill="#1e3a8a" font-size="8.5" font-weight="700">PRIMER PASO: Medir TSH</text>
      <text x="30" y="123" fill="#334155" font-size="8">• Si TSH Baja → Cintigrama</text>
      <text x="30" y="137" fill="#334155" font-size="8">• Si TSH Normal/Alta → Ecografía</text>
    </g>

    <path d="M 230 102 L 270 102" stroke="#64748b" stroke-width="2"/>

    <g filter="url(#cardShadow)">
      <rect x="275" y="55" width="210" height="95" rx="6" fill="#fffbeb" stroke="#d97706" stroke-width="1.5"/>
      <rect x="275" y="55" width="210" height="22" rx="6" fill="url(#amberGrad)"/>
      <text x="380" y="70" fill="#ffffff" font-size="9.5" font-weight="700" text-anchor="middle">2. ECOGRAFÍA TIROIDEA</text>
      <text x="285" y="93" fill="#92400e" font-size="8.5" font-weight="700">Criterios de Sospecha (TIRADS):</text>
      <text x="285" y="107" fill="#334155" font-size="7.5">• Hipoecogénico, más alto que ancho</text>
      <text x="285" y="119" fill="#334155" font-size="7.5">• Microcalcificaciones, bordes irregulares</text>
      <text x="285" y="131" fill="#334155" font-size="7.5">• Extensión extratiroidea / Adenopatías</text>
    </g>

    <path d="M 485 102 L 525 102" stroke="#64748b" stroke-width="2"/>

    <g filter="url(#cardShadow)">
      <rect x="530" y="55" width="190" height="95" rx="6" fill="#f0fdf4" stroke="#059669" stroke-width="1.5"/>
      <rect x="530" y="55" width="190" height="22" rx="6" fill="url(#greenGrad)"/>
      <text x="625" y="70" fill="#ffffff" font-size="9.5" font-weight="700" text-anchor="middle">3. PAAF (PUNCIÓN)</text>
      <text x="540" y="93" fill="#065f46" font-size="8.5" font-weight="700">Indicaciones PAAF:</text>
      <text x="540" y="108" fill="#334155" font-size="8">• Nódulo sospechoso ≥ 1 cm</text>
      <text x="540" y="122" fill="#334155" font-size="8">• Nódulo moderado ≥ 1.5 cm</text>
      <text x="540" y="136" fill="#334155" font-size="8">• Espongiforme / Quístico &gt; 2 cm</text>
    </g>

    <!-- Bottom Bethesda System -->
    <g filter="url(#cardShadow)">
      <rect x="20" y="165" width="700" height="140" rx="6" fill="#ffffff" stroke="#94a3b8" stroke-width="1.2"/>
      <rect x="20" y="165" width="700" height="22" rx="6" fill="#1e293b"/>
      <text x="370" y="180" fill="#ffffff" font-size="9.5" font-weight="700" text-anchor="middle">SISTEMA DE BETHESDA PARA CITOPATOLOGÍA TIROIDEA</text>

      <text x="35" y="205" fill="#047857" font-size="8.5" font-weight="700">Bethesda II: Benigno (60-70%)</text>
      <text x="35" y="220" fill="#334155" font-size="8">• Riesgo malignidad &lt; 3%</text>
      <text x="35" y="233" fill="#334155" font-size="8">• Conducta: Seguimiento ecográfico</text>

      <text x="275" y="205" fill="#b45309" font-size="8.5" font-weight="700">Bethesda III - IV: Indeterminado</text>
      <text x="275" y="220" fill="#334155" font-size="8">• III (AUS/FLUS): Repetir PAAF / Genético</text>
      <text x="275" y="233" fill="#334155" font-size="8">• IV (Neoplasia folicular): Lobectomía</text>

      <text x="515" y="205" fill="#dc2626" font-size="8.5" font-weight="700">Bethesda V - VI: Maligno / Sospecha</text>
      <text x="515" y="220" fill="#334155" font-size="8">• V (Sospecha 60-75%): Tiroidectomía</text>
      <text x="515" y="233" fill="#334155" font-size="8">• VI (Maligno 97-99% Papilar): Cirugía</text>
    </g>
  `)
};

for (const [filename, svgContent] of Object.entries(diagrams)) {
  const p = path.join(svgDir, filename);
  fs.writeFileSync(p, svgContent);
  console.log(`✅ Created SVG: ${filename}`);
}
