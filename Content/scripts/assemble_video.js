const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const OUT_DIR = '/Users/felipeyanez/Desktop/NEWeunacom/Content/Finished';
const TMP_DIR = '/tmp/animated_calido_engine';
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

console.log('=== MOTOR DE ANIMACIÓN EDITORIAL DEFINITIVO (CÁLIDO CHILENO) ===');
console.log('1. Escena 4: Pantalla completa fija y armónica (Respuesta C + Regla de Oro + Lead Magnet CTA desde el inicio).');
console.log('2. Cero desbordes tipográficos.');
console.log('3. Cero partes vacías o desapariciones de elementos.');

const scripts = {
  s1: "El 80% de los médicos duda en esta pregunta de infarto del EUNACOM: ¿trombolizar o trasladar? Pon mucha atención.",
  s2: "Hombre de 58 años, dolor torácico de dos horas. Electrocardiograma: supradesnivel del ST en V1 a V4. Pero el traslado a hemodinamia demora 150 minutos. ¿Cuál es la conducta inmediata que salva la vida?",
  s3: "Pausa el video y deja tu respuesta en los comentarios. Tienes cinco segundos para decidir la conducta correcta.",
  s4: "Respuesta correcta: C, trombólisis inmediata. Si el traslado supera los 120 minutos, trombolizas en menos de diez minutos aguja. Comenta INFARTO para enviarte el mini simulacro gratis."
};

const audioFiles = {};
for (const [key, text] of Object.entries(scripts)) {
  const aiff = path.join(TMP_DIR, `${key}.aiff`);
  const wav = path.join(TMP_DIR, `${key}.wav`);
  if (!fs.existsSync(wav)) {
    execSync(`say -v "Paulina" -r 175 "${text}" -o "${aiff}"`);
    execSync(`ffmpeg -y -i "${aiff}" -ar 44100 -ac 2 "${wav}" 2>/dev/null`);
  }
  const dur = parseFloat(execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${wav}"`).toString().trim());
  audioFiles[key] = { wav, dur: Math.ceil(dur * 10) / 10 + 0.2 };
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

const FPS = 20;

// ==========================================
// ESCENA 1: HOOK (0:00 - 0:08)
// ==========================================
function renderScene1() {
  console.log(`\nRenderizando Escena 1 (Hook) a ${FPS} fps...`);
  const scDir = path.join(TMP_DIR, 'sc1_frames');
  if (!fs.existsSync(scDir)) fs.mkdirSync(scDir, { recursive: true });

  const totalFrames = Math.round(audioFiles.s1.dur * FPS);

  for (let f = 0; f < totalFrames; f++) {
    const sec = f / FPS;

    const tBadge = clamp(sec / 0.5, 0, 1);
    const opBadge = easeOutCubic(tBadge);
    const yBadge = Math.round(20 * (1 - opBadge));

    const tTitle1 = clamp((sec - 0.2) / 0.6, 0, 1);
    const opTitle1 = easeOutCubic(tTitle1);
    const yTitle1 = Math.round(25 * (1 - opTitle1));

    const tTitle2 = clamp((sec - 1.6) / 0.6, 0, 1);
    const opTitle2 = easeOutCubic(tTitle2);
    const yTitle2 = Math.round(25 * (1 - opTitle2));

    const tAvatar = clamp((sec - 2.8) / 0.8, 0, 1);
    const opAvatar = easeOutCubic(tAvatar);
    const yAvatar = Math.round(30 * (1 - opAvatar));

    const tBottom = clamp((sec - 4.0) / 0.6, 0, 1);
    const opBottom = easeOutCubic(tBottom);

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
      <defs>
        <pattern id="stripeNavy" width="24" height="24" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="24" stroke="#22314C" stroke-width="12" />
          <line x1="12" y1="0" x2="12" y2="24" stroke="#27384F" stroke-width="12" />
        </pattern>
      </defs>

      <rect width="1080" height="1920" fill="#1A2740"/>

      <g transform="translate(94, ${360 + yBadge})" opacity="${opBadge.toFixed(2)}">
        <circle cx="16" cy="16" r="16" fill="#D9764A"/>
        <text x="48" y="24" fill="#F7ECE0" font-family="'Work Sans', -apple-system, sans-serif" font-size="28" font-weight="700" letter-spacing="4">
          QUIZ CLÍNICO · CARDIOLOGÍA
        </text>
      </g>

      <g transform="translate(94, ${490 + yTitle1})" opacity="${opTitle1.toFixed(2)}">
        <text x="0" y="0" fill="#F7ECE0" font-family="'DM Serif Display', Georgia, serif" font-size="70" font-weight="400" letter-spacing="-0.5">
          El 80% de los médicos
        </text>
      </g>

      <g transform="translate(94, ${580 + yTitle2})" opacity="${opTitle2.toFixed(2)}">
        <text x="0" y="0" fill="#E8C46A" font-family="'DM Serif Display', Georgia, serif" font-size="70" font-weight="400" letter-spacing="-0.5">
          falla esta pregunta
        </text>
      </g>

      <g transform="translate(94, ${680 + yAvatar})" opacity="${opAvatar.toFixed(2)}">
        <rect width="892" height="680" rx="36" fill="url(#stripeNavy)"/>
        <rect width="892" height="680" rx="36" fill="none" stroke="#2B3E5C" stroke-width="3"/>
        
        <circle cx="446" cy="300" r="140" fill="#1A2740" stroke="#D9764A" stroke-width="6"/>
        <path d="M446,210 C410,210 380,240 380,280 C380,315 405,340 435,348 L435,365 L400,380 L360,430 L532,430 L492,380 L457,365 L457,348 C487,340 512,315 512,280 C512,240 482,210 446,210 Z" fill="#7C95B5"/>
        <path d="M410,330 C410,360 482,360 482,330" stroke="#F7ECE0" stroke-width="6" fill="none" stroke-linecap="round"/>
        <circle cx="446" cy="375" r="14" fill="#E8C46A"/>

        <rect x="236" y="580" width="420" height="54" rx="27" fill="#1A2740" stroke="#7C95B5" stroke-width="2"/>
        <text x="446" y="616" text-anchor="middle" fill="#A8B8CE" font-family="'IBM Plex Mono', monospace" font-size="22" font-weight="700" letter-spacing="2">
          DR. MENTOR · A CÁMARA
        </text>
      </g>

      <g transform="translate(94, 1420)" opacity="${opBottom.toFixed(2)}">
        <rect width="892" height="120" rx="28" fill="#22314C"/>
        <g transform="translate(44, 46)">
          <text x="0" y="0" fill="#F7ECE0" font-family="'DM Serif Display', Georgia, serif" font-size="34">
            Cardiología · EUNACOM
          </text>
          <text x="0" y="38" fill="#A8B8CE" font-family="'Work Sans', -apple-system, sans-serif" font-size="22" font-weight="600" letter-spacing="3">
            EUNACOMAPP.CL
          </text>
        </g>
        <text x="848" y="68" text-anchor="end" fill="#E8C46A" font-family="'IBM Plex Mono', monospace" font-size="26" font-weight="700">
          0:00–0:08 · HOOK
        </text>
      </g>
    </svg>`;

    const sPath = path.join(scDir, `f_${String(f).padStart(4, '0')}.svg`);
    const pPath = path.join(scDir, `f_${String(f).padStart(4, '0')}.png`);
    fs.writeFileSync(sPath, svg);
    execSync(`sips -s format png "${sPath}" --out "${pPath}" 2>/dev/null`);
    fs.unlinkSync(sPath);
  }

  const mp4Path = path.join(TMP_DIR, 'sc1_anim.mp4');
  execSync(`ffmpeg -y -framerate ${FPS} -i "${scDir}/f_%04d.png" -i "${audioFiles.s1.wav}" -c:v libx264 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest "${mp4Path}" 2>/dev/null`);
  console.log(`Escena 1 lista: ${mp4Path}`);
  return mp4Path;
}

// ==========================================
// ESCENA 2: VIÑETA CLÍNICA (0:08 - 0:28)
// ==========================================
function renderScene2() {
  console.log(`\nRenderizando Escena 2 (Viñeta) a ${FPS} fps...`);
  const scDir = path.join(TMP_DIR, 'sc2_frames');
  if (!fs.existsSync(scDir)) fs.mkdirSync(scDir, { recursive: true });

  const totalFrames = Math.round(audioFiles.s2.dur * FPS);

  for (let f = 0; f < totalFrames; f++) {
    const sec = f / FPS;

    const tBase = clamp(sec / 0.6, 0, 1);
    const opBase = easeOutCubic(tBase);

    const tR2 = clamp((sec - 1.2) / 0.5, 0, 1);
    const opR2 = easeOutCubic(tR2);
    const yR2 = Math.round(15 * (1 - opR2));

    const tR1 = clamp((sec - 4.2) / 0.6, 0, 1);
    const opR1 = easeOutCubic(tR1);
    const yR1 = Math.round(15 * (1 - opR1));

    const tR3 = clamp((sec - 9.5) / 0.6, 0, 1);
    const opR3 = easeOutCubic(tR3);
    const yR3 = Math.round(15 * (1 - opR3));

    const tDilema = clamp((sec - 13.5) / 0.6, 0, 1);
    const opDilema = easeOutCubic(tDilema);
    const yDilema = Math.round(20 * (1 - opDilema));

    const tPip = clamp((sec - 1.0) / 0.6, 0, 1);
    const opPip = easeOutCubic(tPip);

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
      <defs>
        <filter id="calidoShadow" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="16" stdDeviation="28" flood-color="#1A2740" flood-opacity="0.08"/>
        </filter>
      </defs>

      <rect width="1080" height="1920" fill="#F7ECE0"/>

      <g transform="translate(94, 360)" opacity="${opBase.toFixed(2)}">
        <text x="0" y="28" fill="#D9764A" font-family="'Work Sans', -apple-system, sans-serif" font-size="28" font-weight="700" letter-spacing="4">
          VIÑETA CLÍNICA · GES 1.01.2.002
        </text>
        <text x="0" y="105" fill="#1A2740" font-family="'DM Serif Display', Georgia, serif" font-size="56" font-weight="400">
          Hombre 58 años, dolor torácico 2 hrs
        </text>
      </g>

      <g transform="translate(94, 530)" opacity="${opBase.toFixed(2)}" filter="url(#calidoShadow)">
        <rect width="892" height="660" rx="36" fill="#FFFFFF"/>
        <rect x="0" y="0" width="16" height="660" rx="8" fill="#D9764A"/>

        <g transform="translate(64, 60)">
          <!-- Fila 1: ECG -->
          <g transform="translate(0, ${yR1})" opacity="${opR1.toFixed(2)}">
            <text x="0" y="32" fill="#6B7891" font-family="'Work Sans', -apple-system, sans-serif" font-size="32">
              ECG de Urgencia
            </text>
            <text x="760" y="32" text-anchor="end" fill="#D9764A" font-family="'Work Sans', -apple-system, sans-serif" font-size="40" font-weight="700">
              Supra ST V1–V4
            </text>
            <line x1="0" y1="85" x2="760" y2="85" stroke="#ECE3D8" stroke-width="2"/>
          </g>

          <!-- Fila 2: Tiempo de Evolución -->
          <g transform="translate(0, ${yR2})" opacity="${opR2.toFixed(2)}">
            <text x="0" y="145" fill="#6B7891" font-family="'Work Sans', -apple-system, sans-serif" font-size="32">
              Tiempo de Evolución
            </text>
            <text x="760" y="145" text-anchor="end" fill="#1A2740" font-family="'Work Sans', -apple-system, sans-serif" font-size="40" font-weight="700">
              2 Horas
            </text>
            <line x1="0" y1="200" x2="760" y2="200" stroke="#ECE3D8" stroke-width="2"/>
          </g>

          <!-- Fila 3: Traslado Hemodinamia -->
          <g transform="translate(0, ${yR3})" opacity="${opR3.toFixed(2)}">
            <text x="0" y="260" fill="#6B7891" font-family="'Work Sans', -apple-system, sans-serif" font-size="32">
              Traslado a Hemodinamia
            </text>
            <text x="760" y="260" text-anchor="end" fill="#D9764A" font-family="'Work Sans', -apple-system, sans-serif" font-size="40" font-weight="700">
              150 min
            </text>
            <line x1="0" y1="315" x2="760" y2="315" stroke="#ECE3D8" stroke-width="2"/>
          </g>

          <!-- Dilema -->
          <g transform="translate(0, ${375 + yDilema})" opacity="${opDilema.toFixed(2)}">
            <rect width="760" height="180" rx="24" fill="#F7ECE0"/>
            <text x="380" y="58" text-anchor="middle" fill="#8A8275" font-family="'IBM Plex Mono', monospace" font-size="22" font-weight="700" letter-spacing="2">
              DILEMA QUE DEFINE EL EXAMEN
            </text>
            <text x="380" y="125" text-anchor="middle" fill="#1A2740" font-family="'DM Serif Display', Georgia, serif" font-size="36">
              ¿Trombólisis inmediata o traslado?
            </text>
          </g>
        </g>
      </g>

      <!-- PiP Banner -->
      <g transform="translate(94, 1220)" filter="url(#calidoShadow)" opacity="${opPip.toFixed(2)}">
        <rect width="580" height="150" rx="30" fill="#1A2740"/>
        <g transform="translate(36, 52)">
          <text x="0" y="0" fill="#A8B8CE" font-family="'IBM Plex Mono', monospace" font-size="18" font-weight="700" letter-spacing="2">
            ENFOQUE DEL EXAMINADOR:
          </text>
          <text x="0" y="44" fill="#E8C46A" font-family="'Work Sans', -apple-system, sans-serif" font-size="28" font-weight="700">
            ¿Angioplastia o Trombólisis?
          </text>
        </g>
      </g>

      <!-- PiP Bubble -->
      <g transform="translate(720, 1205)" filter="url(#calidoShadow)" opacity="${opPip.toFixed(2)}">
        <circle cx="85" cy="85" r="85" fill="#1A2740" stroke="#D9764A" stroke-width="6"/>
        <path d="M85,35 C65,35 48,52 48,74 C48,93 62,108 80,112 L80,122 L55,135 L30,165 L140,165 L115,135 L90,122 L90,112 C108,108 122,93 122,74 C122,52 105,35 85,35 Z" fill="#7C95B5"/>
        <rect x="15" y="140" width="140" height="28" rx="14" fill="#D9764A"/>
        <text x="85" y="159" text-anchor="middle" fill="#FFFFFF" font-family="'Work Sans', -apple-system, sans-serif" font-size="14" font-weight="800" letter-spacing="1">
          DR. MENTOR
        </text>
      </g>

      <g transform="translate(94, 1420)">
        <text x="0" y="0" fill="#8A8275" font-family="'Work Sans', -apple-system, sans-serif" font-size="26" font-weight="700" letter-spacing="4">
          EUNACOMAPP.CL
        </text>
        <text x="892" y="0" text-anchor="end" fill="#D9764A" font-family="'Work Sans', -apple-system, sans-serif" font-size="26" font-weight="600">
          0:08–0:28 · VIÑETA
        </text>
      </g>
    </svg>`;

    const sPath = path.join(scDir, `f_${String(f).padStart(4, '0')}.svg`);
    const pPath = path.join(scDir, `f_${String(f).padStart(4, '0')}.png`);
    fs.writeFileSync(sPath, svg);
    execSync(`sips -s format png "${sPath}" --out "${pPath}" 2>/dev/null`);
    fs.unlinkSync(sPath);
  }

  const mp4Path = path.join(TMP_DIR, 'sc2_anim.mp4');
  execSync(`ffmpeg -y -framerate ${FPS} -i "${scDir}/f_%04d.png" -i "${audioFiles.s2.wav}" -c:v libx264 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest "${mp4Path}" 2>/dev/null`);
  console.log(`Escena 2 lista: ${mp4Path}`);
  return mp4Path;
}

// ==========================================
// ESCENA 3: EL RETO (0:28 - 0:35)
// ==========================================
function renderScene3() {
  console.log(`\nRenderizando Escena 3 (Reto) a ${FPS} fps...`);
  const scDir = path.join(TMP_DIR, 'sc3_frames');
  if (!fs.existsSync(scDir)) fs.mkdirSync(scDir, { recursive: true });

  const totalFrames = Math.round(audioFiles.s3.dur * FPS);

  for (let f = 0; f < totalFrames; f++) {
    const sec = f / FPS;

    let countdownStr = "00:05";
    if (sec >= 3.4) {
      const elapsedCountdown = Math.floor(sec - 3.4);
      const remaining = Math.max(5 - elapsedCountdown, 0);
      countdownStr = `00:0${remaining}`;
    }

    const opA = easeOutCubic(clamp(sec / 0.5, 0, 1));
    const opB = easeOutCubic(clamp((sec - 0.5) / 0.5, 0, 1));
    const opC = easeOutCubic(clamp((sec - 1.0) / 0.5, 0, 1));
    const opD = easeOutCubic(clamp((sec - 1.5) / 0.5, 0, 1));

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
      <defs>
        <filter id="calidoShadow" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="16" stdDeviation="28" flood-color="#1A2740" flood-opacity="0.08"/>
        </filter>
      </defs>

      <rect width="1080" height="1920" fill="#F7ECE0"/>

      <g transform="translate(94, 360)">
        <text x="0" y="28" fill="#1A2740" font-family="'Work Sans', -apple-system, sans-serif" font-size="30" font-weight="700" letter-spacing="4">
          ¿CUÁL ES LA CONDUCTA?
        </text>
        <text x="892" y="28" text-anchor="end" fill="#D9764A" font-family="'Work Sans', -apple-system, sans-serif" font-size="38" font-weight="800">
          ${countdownStr}
        </text>

        <text x="0" y="105" fill="#1A2740" font-family="'DM Serif Display', Georgia, serif" font-size="58" font-weight="400">
          Pausa el video y deja tu opción:
        </text>
      </g>

      <g transform="translate(94, 530)" filter="url(#calidoShadow)">
        <g transform="translate(0, 0)" opacity="${opA.toFixed(2)}">
          <rect width="892" height="106" rx="53" fill="#FFFFFF"/>
          <circle cx="56" cy="53" r="28" fill="#F7ECE0"/>
          <text x="56" y="63" text-anchor="middle" fill="#7C95B5" font-family="'Work Sans', -apple-system, sans-serif" font-size="30" font-weight="700">A</text>
          <text x="105" y="62" fill="#1A2740" font-family="'Work Sans', -apple-system, sans-serif" font-size="25" font-weight="600">
            · Traslado urgente para Angioplastia Primaria
          </text>
        </g>

        <g transform="translate(0, 130)" opacity="${opB.toFixed(2)}">
          <rect width="892" height="106" rx="53" fill="#FFFFFF"/>
          <circle cx="56" cy="53" r="28" fill="#F7ECE0"/>
          <text x="56" y="63" text-anchor="middle" fill="#7C95B5" font-family="'Work Sans', -apple-system, sans-serif" font-size="30" font-weight="700">B</text>
          <text x="105" y="62" fill="#1A2740" font-family="'Work Sans', -apple-system, sans-serif" font-size="25" font-weight="600">
            · Esperar confirmación de troponinas en box
          </text>
        </g>

        <!-- Opción C NEUTRA -->
        <g transform="translate(0, 260)" opacity="${opC.toFixed(2)}">
          <rect width="892" height="106" rx="53" fill="#FFFFFF"/>
          <circle cx="56" cy="53" r="28" fill="#F7ECE0"/>
          <text x="56" y="63" text-anchor="middle" fill="#7C95B5" font-family="'Work Sans', -apple-system, sans-serif" font-size="30" font-weight="700">C</text>
          <text x="105" y="62" fill="#1A2740" font-family="'Work Sans', -apple-system, sans-serif" font-size="25" font-weight="600">
            · Trombólisis inmediata con Tenecteplase
          </text>
        </g>

        <g transform="translate(0, 390)" opacity="${opD.toFixed(2)}">
          <rect width="892" height="106" rx="53" fill="#FFFFFF"/>
          <circle cx="56" cy="53" r="28" fill="#F7ECE0"/>
          <text x="56" y="63" text-anchor="middle" fill="#7C95B5" font-family="'Work Sans', -apple-system, sans-serif" font-size="30" font-weight="700">D</text>
          <text x="105" y="62" fill="#1A2740" font-family="'Work Sans', -apple-system, sans-serif" font-size="25" font-weight="600">
            · Iniciar anticoagulación y derivar ambulatorio
          </text>
        </g>
      </g>

      <g transform="translate(94, 1120)">
        <text x="446" y="45" text-anchor="middle" fill="#D9764A" font-family="'DM Serif Display', Georgia, serif" font-style="italic" font-size="44">
          Pausa el video y deja tu respuesta abajo
        </text>
        
        <rect x="20" y="80" width="852" height="100" rx="28" fill="#1A2740"/>
        <text x="446" y="125" text-anchor="middle" fill="#F7ECE0" font-family="'Work Sans', -apple-system, sans-serif" font-size="23" font-weight="600">
          El <tspan fill="#E8C46A" font-weight="800">70% de los postulantes elige la A</tspan>
        </text>
        <text x="446" y="156" text-anchor="middle" fill="#A8B8CE" font-family="'Work Sans', -apple-system, sans-serif" font-size="21" font-weight="500">
          y reprueba por exceso en el tiempo de traslado.
        </text>
      </g>

      <g transform="translate(94, 1420)">
        <text x="0" y="0" fill="#8A8275" font-family="'Work Sans', -apple-system, sans-serif" font-size="26" font-weight="700" letter-spacing="4">
          EUNACOMAPP.CL
        </text>
        <text x="892" y="0" text-anchor="end" fill="#D9764A" font-family="'Work Sans', -apple-system, sans-serif" font-size="26" font-weight="600">
          0:28–0:35 · RETO
        </text>
      </g>
    </svg>`;

    const sPath = path.join(scDir, `f_${String(f).padStart(4, '0')}.svg`);
    const pPath = path.join(scDir, `f_${String(f).padStart(4, '0')}.png`);
    fs.writeFileSync(sPath, svg);
    execSync(`sips -s format png "${sPath}" --out "${pPath}" 2>/dev/null`);
    fs.unlinkSync(sPath);
  }

  const mp4Path = path.join(TMP_DIR, 'sc3_anim.mp4');
  execSync(`ffmpeg -y -framerate ${FPS} -i "${scDir}/f_%04d.png" -i "${audioFiles.s3.wav}" -c:v libx264 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest "${mp4Path}" 2>/dev/null`);
  console.log(`Escena 3 lista: ${mp4Path}`);
  return mp4Path;
}

// ==========================================
// ESCENA 4: PAUTA MINSAL COMPLETA Y FIJA (0:35 - 0:52)
// ¡TODOS LOS BLOQUES VISIBLES DE FORMA ARMÓNICA COMO EN EL BRAND BOOK!
// ==========================================
function renderScene4() {
  console.log(`\nRenderizando Escena 4 (Pauta completa y permanente) a ${FPS} fps...`);
  const scDir = path.join(TMP_DIR, 'sc4_frames');
  if (!fs.existsSync(scDir)) fs.mkdirSync(scDir, { recursive: true });

  const totalFrames = Math.round(audioFiles.s4.dur * FPS);

  for (let f = 0; f < totalFrames; f++) {
    const sec = f / FPS;

    // Transición suave de entrada de la escena completa en los primeros 0.4s
    const tFade = clamp(sec / 0.4, 0, 1);
    const op = easeOutCubic(tFade);

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
      <defs>
        <filter id="darkCardShadow" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="16" stdDeviation="28" flood-color="#000000" flood-opacity="0.35"/>
        </filter>
      </defs>

      <rect width="1080" height="1920" fill="#1A2740"/>

      <!-- 1. HEADER: RESPUESTA CORRECTA C -->
      <g transform="translate(94, 360)" opacity="${op.toFixed(2)}">
        <rect width="460" height="56" rx="28" fill="#E8C46A"/>
        <text x="230" y="38" text-anchor="middle" fill="#1A2740" font-family="'Work Sans', -apple-system, sans-serif" font-size="25" font-weight="800" letter-spacing="3">
          RESPUESTA CORRECTA · C
        </text>

        <text x="0" y="140" fill="#F7ECE0" font-family="'DM Serif Display', Georgia, serif" font-size="68" font-weight="400" letter-spacing="-0.5">
          Trombólisis inmediata
        </text>
      </g>

      <!-- 2. TARJETA BLANCA: REGLA DE ORO MINSAL (100% dentro del lienzo sin desbordes) -->
      <g transform="translate(94, 570)" opacity="${op.toFixed(2)}" filter="url(#darkCardShadow)">
        <rect width="892" height="430" rx="36" fill="#FFFFFF"/>
        <rect x="0" y="0" width="16" height="430" rx="8" fill="#E8C46A"/>

        <g transform="translate(64, 52)">
          <text x="0" y="24" fill="#D9764A" font-family="'Work Sans', -apple-system, sans-serif" font-size="24" font-weight="700" letter-spacing="2">
            REGLA DE ORO · GUÍA CLÍNICA MINSAL
          </text>

          <text x="0" y="80" fill="#1A2740" font-family="'Work Sans', -apple-system, sans-serif" font-size="28" font-weight="700">
            Si el traslado supera los 120 minutos:
          </text>
          <text x="0" y="135" fill="#D9764A" font-family="'DM Serif Display', Georgia, serif" font-size="40">
            Trombolizar de inmediato (&lt; 10 min aguja)
          </text>

          <line x1="0" y1="180" x2="760" y2="180" stroke="#ECE3D8" stroke-width="2"/>

          <!-- 2 líneas limpias que nunca sobrepasan el margen -->
          <text x="0" y="230" fill="#6B7891" font-family="'Work Sans', -apple-system, sans-serif" font-size="24" font-weight="600">
            Solo si el traslado es &lt; 120 min la conducta es
          </text>
          <text x="0" y="265" fill="#1A2740" font-family="'Work Sans', -apple-system, sans-serif" font-size="26" font-weight="800">
            Angioplastia Primaria.
          </text>
          
          <text x="0" y="315" fill="#8A8275" font-family="'Work Sans', -apple-system, sans-serif" font-size="21">
            Guía Clínica GES: Infarto Agudo del Miocardio con Supradesnivel ST.
          </text>
        </g>
      </g>

      <!-- 3. BLOQUE CTA: SIEMPRE VISIBLE Y FIJO (Idéntico a tu imagen del Brand Book) -->
      <g transform="translate(94, 1040)" opacity="${op.toFixed(2)}" filter="url(#darkCardShadow)">
        <rect width="892" height="280" rx="32" fill="#22314C" stroke="rgba(255,255,255,0.1)" stroke-width="2"/>

        <g transform="translate(56, 56)">
          <text x="0" y="32" fill="#F7ECE0" font-family="'DM Serif Display', Georgia, serif" font-size="48">
            +10.000 preguntas oficiales
          </text>
          <text x="0" y="88" fill="#A8B8CE" font-family="'Work Sans', -apple-system, sans-serif" font-size="26" font-weight="600">
            Comenta "INFARTO" para enviarte el simulacro gratis
          </text>

          <g transform="translate(0, 122)">
            <rect width="480" height="54" rx="27" fill="#E8C46A"/>
            <text x="240" y="36" text-anchor="middle" fill="#1A2740" font-family="'Work Sans', -apple-system, sans-serif" font-size="23" font-weight="800" letter-spacing="2">
              EUNACOMAPP.CL · LINK EN BIO
            </text>
          </g>
        </g>
      </g>

      <!-- 4. FOOTER -->
      <g transform="translate(94, 1420)" opacity="${op.toFixed(2)}">
        <text x="0" y="0" fill="#7C95B5" font-family="'Work Sans', -apple-system, sans-serif" font-size="26" font-weight="700" letter-spacing="4">
          EUNACOMAPP.CL
        </text>
        <text x="892" y="0" text-anchor="end" fill="#E8C46A" font-family="'Work Sans', -apple-system, sans-serif" font-size="26" font-weight="600">
          0:35–0:52 · PAUTA + CTA
        </text>
      </g>
    </svg>`;

    const sPath = path.join(scDir, `f_${String(f).padStart(4, '0')}.svg`);
    const pPath = path.join(scDir, `f_${String(f).padStart(4, '0')}.png`);
    fs.writeFileSync(sPath, svg);
    execSync(`sips -s format png "${sPath}" --out "${pPath}" 2>/dev/null`);
    fs.unlinkSync(sPath);
  }

  const mp4Path = path.join(TMP_DIR, 'sc4_anim.mp4');
  execSync(`ffmpeg -y -framerate ${FPS} -i "${scDir}/f_%04d.png" -i "${audioFiles.s4.wav}" -c:v libx264 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest "${mp4Path}" 2>/dev/null`);
  console.log(`Escena 4 lista: ${mp4Path}`);
  return mp4Path;
}

const v1 = renderScene1();
const v2 = renderScene2();
const v3 = renderScene3();
const v4 = renderScene4();

console.log('\nConcatenando las 4 escenas...');
const concatList = path.join(TMP_DIR, 'concat_list.txt');
fs.writeFileSync(concatList, [v1, v2, v3, v4].map(f => `file '${f}'`).join('\n'), 'utf8');

const finalMp4 = path.join(OUT_DIR, 'vid-01_REEL_CALIDO_CHILENO_EDITORIAL.mp4');
execSync(`ffmpeg -y -f concat -safe 0 -i "${concatList}" -c:v libx264 -preset fast -crf 18 -c:a aac -b:a 192k "${finalMp4}" 2>/dev/null`);

fs.copyFileSync(__filename, '/Users/felipeyanez/Desktop/NEWeunacom/Content/scripts/assemble_video.js');

console.log(`\n======================================================`);
console.log(`¡REEL DEFINITIVO 100% FIEL AL BRAND BOOK GENERADO!`);
console.log(`Archivo: ${finalMp4}`);
console.log(`======================================================\n`);
