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

const newDiagrams = {
  // Sepsis Bundle
  'algo_sepsis.svg': wrapSvg(`
    <g filter="url(#cardShadow)">
      <rect x="20" y="55" width="215" height="100" rx="6" fill="#fef2f2" stroke="#dc2626" stroke-width="1.5"/>
      <rect x="20" y="55" width="215" height="22" rx="6" fill="url(#redGrad)"/>
      <text x="127" y="70" fill="#ffffff" font-size="9.5" font-weight="700" text-anchor="middle">1. RECONOCIMIENTO (qSOFA ≥ 2)</text>
      <text x="30" y="93" fill="#991b1b" font-size="8.5" font-weight="700">• FR ≥ 22 rpm</text>
      <text x="30" y="107" fill="#334155" font-size="8">• Alteración de conciencia (Glasgow &lt; 15)</text>
      <text x="30" y="120" fill="#334155" font-size="8">• Presión Arterial Sistólica ≤ 100 mmHg</text>
      <text x="30" y="134" fill="#dc2626" font-size="8" font-weight="700">→ Disfunción de órgano aguda (SOFA ≥ 2)</text>
    </g>

    <path d="M 235 105 L 265 105" stroke="#64748b" stroke-width="2"/>

    <g filter="url(#cardShadow)">
      <rect x="270" y="55" width="210" height="100" rx="6" fill="#fffbeb" stroke="#d97706" stroke-width="1.5"/>
      <rect x="270" y="55" width="210" height="22" rx="6" fill="url(#amberGrad)"/>
      <text x="375" y="70" fill="#ffffff" font-size="9.5" font-weight="700" text-anchor="middle">2. BUNDLE DE LA 1ª HORA</text>
      <text x="280" y="93" fill="#92400e" font-size="8.5" font-weight="700">1. Medir Lactato sérico</text>
      <text x="280" y="107" fill="#334155" font-size="8">2. Hemocultivos x 2 antes de ATB</text>
      <text x="280" y="120" fill="#1e3a8a" font-size="8" font-weight="700">3. Antibióticos EV amplio espectro &lt; 1h</text>
      <text x="280" y="134" fill="#334155" font-size="8">4. Cristaloides 30 mL/kg si hipotensión</text>
    </g>

    <path d="M 480 105 L 510 105" stroke="#64748b" stroke-width="2"/>

    <g filter="url(#cardShadow)">
      <rect x="515" y="55" width="205" height="100" rx="6" fill="#f8fafc" stroke="#1e3a8a" stroke-width="1.5"/>
      <rect x="515" y="55" width="205" height="22" rx="6" fill="url(#blueGrad)"/>
      <text x="617" y="70" fill="#ffffff" font-size="9.5" font-weight="700" text-anchor="middle">3. SHOCK SÉPTICO</text>
      <text x="525" y="93" fill="#1e3a8a" font-size="8.5" font-weight="700">• Hipotensión persistente tras volumen</text>
      <text x="525" y="107" fill="#334155" font-size="8">• Lactato &gt; 2 mmol/L (18 mg/dL)</text>
      <text x="525" y="121" fill="#dc2626" font-size="8" font-weight="700">• Noradrenalina EV para PAM ≥ 65 mmHg</text>
      <text x="525" y="135" fill="#047857" font-size="7.5">• Segunda línea: Vasopresina / Adrenalina</text>
    </g>

    <!-- Bottom Box -->
    <g filter="url(#cardShadow)">
      <rect x="20" y="170" width="700" height="135" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2"/>
      <rect x="20" y="170" width="700" height="22" rx="6" fill="#1e293b"/>
      <text x="370" y="185" fill="#ffffff" font-size="9.5" font-weight="700" text-anchor="middle">REGLAS CLÍNICAS DE ALTO RENDIMIENTO EN SEPSIS Y MENINGITIS</text>
      
      <text x="35" y="210" fill="#1e3a8a" font-size="8.5" font-weight="700">Meningitis Aguda Bacteriana (Manejo de Urgencia):</text>
      <text x="35" y="224" fill="#334155" font-size="8">• Punción Lumbar (PL) inmediata. Si hay signos de focalidad neurológica, papiledema, crisis convulsivas o inmunosupresión → TAC de cerebro antes de PL</text>
      <text x="35" y="238" fill="#334155" font-size="8">• Tratamiento empírico inmediato: Ceftriaxona 2g c/12h EV + Dexametasona 10 mg EV (iniciar ANTES o junto al ATB para reducir secuelas auditivas por Neumococo)</text>
      <text x="35" y="252" fill="#dc2626" font-size="7.5">• En &gt; 50 años o inmunodeprimidos: AGREGAR Ampicilina 2g c/4h EV para cubrir Listeria monocytogenes</text>

      <text x="380" y="210" fill="#047857" font-size="8.5" font-weight="700">Profilaxis de Contactos (Meningococo):</text>
      <text x="380" y="224" fill="#334155" font-size="8">• Contactos intradomiciliarios estrechos (&gt; 4 horas): Rifampicina 600 mg c/12h x 2 días (o Ciprofloxacino 500 mg dosis única oral o Ceftriaxona 250 mg IM en embarazadas)</text>
    </g>
  `),

  // Algoritmo IRA
  'algo_ira.svg': wrapSvg(`
    <g filter="url(#cardShadow)">
      <rect x="20" y="55" width="215" height="100" rx="6" fill="#f8fafc" stroke="#1e3a8a" stroke-width="1.5"/>
      <rect x="20" y="55" width="215" height="22" rx="6" fill="url(#blueGrad)"/>
      <text x="127" y="70" fill="#ffffff" font-size="9.5" font-weight="700" text-anchor="middle">1. IRA PRERRENAL (70%)</text>
      <text x="30" y="93" fill="#1e3a8a" font-size="8.5" font-weight="700">• Causa: Hipovolemia, shock, IC, AINEs</text>
      <text x="30" y="107" fill="#334155" font-size="8">• FeNa &lt; 1% (reabsorción máxima de Na)</text>
      <text x="30" y="120" fill="#334155" font-size="8">• Na urinario &lt; 20 mEq/L, Osm U &gt; 500</text>
      <text x="30" y="134" fill="#047857" font-size="8" font-weight="700">• Responde rápidamente a Volumen EV</text>
    </g>

    <path d="M 235 105 L 265 105" stroke="#64748b" stroke-width="2"/>

    <g filter="url(#cardShadow)">
      <rect x="270" y="55" width="210" height="100" rx="6" fill="#fef2f2" stroke="#dc2626" stroke-width="1.5"/>
      <rect x="270" y="55" width="210" height="22" rx="6" fill="url(#redGrad)"/>
      <text x="375" y="70" fill="#ffffff" font-size="9.5" font-weight="700" text-anchor="middle">2. RENAL / NTA (25%)</text>
      <text x="280" y="93" fill="#991b1b" font-size="8.5" font-weight="700">• Causa: Isquemia prolongada, tóxicos</text>
      <text x="280" y="107" fill="#334155" font-size="8">• FeNa &gt; 2% (túbulo incapaz de reabsorber)</text>
      <text x="280" y="120" fill="#334155" font-size="8">• Na urinario &gt; 40 mEq/L, Osm U &lt; 350</text>
      <text x="280" y="134" fill="#7f1d1d" font-size="8" font-weight="700">• Sedimento: Cilindros granulosos pardos</text>
    </g>

    <path d="M 480 105 L 510 105" stroke="#64748b" stroke-width="2"/>

    <g filter="url(#cardShadow)">
      <rect x="515" y="55" width="205" height="100" rx="6" fill="#fffbeb" stroke="#d97706" stroke-width="1.5"/>
      <rect x="515" y="55" width="205" height="22" rx="6" fill="url(#amberGrad)"/>
      <text x="617" y="70" fill="#ffffff" font-size="9.5" font-weight="700" text-anchor="middle">3. POSTRENAL / OBSTRUCTIVA (5%)</text>
      <text x="525" y="93" fill="#92400e" font-size="8.5" font-weight="700">• Causa: HPB, litiasis bilateral, cáncer</text>
      <text x="525" y="107" fill="#334155" font-size="8">• Primer examen: ECOGRAFÍA RENAL</text>
      <text x="525" y="120" fill="#334155" font-size="8">• Signo clave: Hidronefrosis bilateral</text>
      <text x="525" y="134" fill="#b45309" font-size="8" font-weight="700">• Desobstrucción urgente (Sonda Foley)</text>
    </g>

    <!-- Bottom Box -->
    <g filter="url(#cardShadow)">
      <rect x="20" y="170" width="700" height="135" rx="6" fill="#ffffff" stroke="#94a3b8" stroke-width="1.2"/>
      <rect x="20" y="170" width="700" height="22" rx="6" fill="#1e293b"/>
      <text x="370" y="185" fill="#ffffff" font-size="9.5" font-weight="700" text-anchor="middle">INDICACIONES ABSOLUTAS DE HEMODIÁLISIS DE URGENCIA (AEIOU)</text>
      
      <text x="35" y="210" fill="#dc2626" font-size="8.5" font-weight="700">A - Acidosis Metabólica Severa:</text>
      <text x="35" y="224" fill="#334155" font-size="8">pH &lt; 7.15 refractario a tratamiento médico</text>
      <text x="35" y="242" fill="#dc2626" font-size="8.5" font-weight="700">E - Electrolitos (Hiperkalemia Severa):</text>
      <text x="35" y="256" fill="#334155" font-size="8">K &gt; 6.5 mEq/L con cambios en ECG refractario</text>

      <text x="275" y="210" fill="#dc2626" font-size="8.5" font-weight="700">I - Intoxicaciones Agudas Exógenas:</text>
      <text x="275" y="224" fill="#334155" font-size="8">Metanol, Etilenglicol, Litio, Salicilatos</text>
      <text x="275" y="242" fill="#dc2626" font-size="8.5" font-weight="700">O - Overload (Sobrecarga de Volumen):</text>
      <text x="275" y="256" fill="#334155" font-size="8">Edema Pulmonar Agudo refractario a diuréticos</text>

      <text x="515" y="210" fill="#dc2626" font-size="8.5" font-weight="700">U - Uremia Grave / Sintomática:</text>
      <text x="515" y="224" fill="#334155" font-size="8">• Encefalopatía urémica (asterixis, estupor)</text>
      <text x="515" y="238" fill="#334155" font-size="8">• Pericarditis urémica (frote pericárdico)</text>
      <text x="515" y="252" fill="#334155" font-size="8">• Sangrado por disfunción plaquetaria urémica</text>
    </g>
  `)
};

for (const [filename, svgContent] of Object.entries(newDiagrams)) {
  const p = path.join(svgDir, filename);
  fs.writeFileSync(p, svgContent);
  console.log(`✅ Created SVG: ${filename}`);
}
