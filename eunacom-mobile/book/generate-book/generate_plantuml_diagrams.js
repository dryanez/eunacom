const zlib = require('zlib');
const fs = require('fs');
const https = require('https');
const path = require('path');

const svgDir = path.join(__dirname, 'svg_diagrams');
fs.mkdirSync(svgDir, { recursive: true });

// Modern PlantUML syntax using :Node text;<<#ffe4e6>> styling after the semicolon
const diagrams = [
  {
    filename: 'algo_urgencias.svg',
    puml: `@startuml
skinparam backgroundColor #ffffff
skinparam Monochrome false
skinparam shadowing false
skinparam defaultFontName Arial
skinparam defaultFontSize 11
skinparam ActivityBackgroundColor #ffffff
skinparam ActivityBorderColor #1e293b
skinparam ActivityFontColor #0f172a

start
:Paciente con Arritmia en Urgencias;
if (¿Presenta Inestabilidad Hemodinámica?\n(Hipotensión, Choque, Angina, Edema Pulmonar, Síncope)) then (SÍ - Inestable)
  :CARDIOVERSIÓN ELÉCTRICA SINCRONIZADA INMEDIATA (Taquicardia)\no Atropina 0.5-1mg EV / Marcapaso (Bradicardia);<<#ffe4e6>>
  :Derivación Urgente a UCI;
  detach
else (NO - Estable)
  :Tomar ECG de 12 derivaciones y evaluar ancho del QRS;
  if (¿QRS Angosto < 0.12s o Ancho >= 0.12s?) then (QRS Angosto)
    :Maniobras Vagales (Valsalva modificada);
    :Adenosina 6mg EV bolo rápido;
    :Betabloqueador / Verapamilo;
  else (QRS Ancho)
    :Tratar como Taquicardia Ventricular;
    :Amiodarona 150mg EV en 10 min;
  endif
  :Evaluación Ambulatoria por Cardiología;
  detach
endif
@enduml`
  },
  {
    filename: 'algo_pcr.svg',
    puml: `@startuml
skinparam backgroundColor #ffffff
skinparam Monochrome false
skinparam shadowing false
skinparam defaultFontName Arial
skinparam defaultFontSize 11

start
:Paciente Inconsciente sin Pulso ni Respiración Normal;
:Iniciar RCP de Alta Calidad (30:2) + Conectar Monitor Desfibrilador;
if (¿El Ritmo es Desfibrilable?) then (SÍ - FV / TVsp)
  :DESFIBRILACIÓN 200J (Bifásico);<<#ffe4e6>>
  :RCP de Alta Calidad por 2 minutos;
  :Adrenalina 1mg EV c/3-5 min + Amiodarona 300mg EV en 3° descarga;
else (NO - Asistolia / AESP)
  :RCP de Alta Calidad por 2 minutos;
  :Adrenalina 1mg EV de INMEDIATO c/3-5 min;
  :Buscar y Tratar Causas Reversibles (5 H y 5 T);
endif
:Reevaluar Ritmo y Pulso cada 2 minutos;
detach
@enduml`
  },
  {
    filename: 'algo_bav.svg',
    puml: `@startuml
skinparam backgroundColor #ffffff
skinparam Monochrome false
skinparam shadowing false
skinparam defaultFontName Arial
skinparam defaultFontSize 11

start
:Paciente con Bradicardia (<60x') o Síncope en Urgencias;
:ECG 12 derivaciones: Evaluar relación ondas P y QRS;
if (¿Todas las P conducen con PR > 0.20s?) then (SÍ)
  :BAV 1° Grado (Observación / Benigno);
  detach
else (NO)
  if (¿PR se alarga progresivamente antes del bloqueo?) then (SÍ)
    :BAV 2° Mobitz I / Wenckebach (Observar / Tratar causa);
    detach
  else (NO)
    :INDICACIÓN DE MARCAPASO DEFINITIVO (Garantía GES N° 25)\nAtropina / Isoproterenol / Marcapaso Transitorio como puente;<<#ffe4e6>>
    :Hospitalizar en Unidad Monitorizada;
    detach
  endif
endif
@enduml`
  },
  {
    filename: 'algo_fa.svg',
    puml: `@startuml
skinparam backgroundColor #ffffff
skinparam Monochrome false
skinparam shadowing false
skinparam defaultFontName Arial
skinparam defaultFontSize 11

start
:Diagnóstico de Fibrilación Auricular (ECG: R-R irregular, sin P);
:Estratificación de Riesgo Embolígeno (Escala CHA2DS2-VASc);
if (¿Puntaje CHA2DS2-VASc >= 2 Hombres / >= 3 Mujeres?) then (SÍ)
  :ANTICOAGULACIÓN ORAL A PERMANENCIA (Acenocumarol / Warfarina / DOACs);<<#e0f2fe>>
else (NO)
  :Evaluar Anticoagulación según puntaje 1 en hombres;
endif
:Selección de Estrategia Terapéutica;
if (¿Control de Frecuencia o Ritmo?) then (Frecuencia)
  :Betabloqueador / Verapamilo / Digoxina;
else (Ritmo)
  :Amiodarona / Flecainida / Ablación Venas Pulmonares;
endif
:Seguimiento en Programa Cardiovascular (APS);
detach
@enduml`
  },
  {
    filename: 'algo_tpsv.svg',
    puml: `@startuml
skinparam backgroundColor #ffffff
skinparam Monochrome false
skinparam shadowing false
skinparam defaultFontName Arial
skinparam defaultFontSize 11

start
:Taquicardia Paroxística Supraventricular (QRS angosto regular 150-220x');
if (¿Inestabilidad Hemodinámica?) then (SÍ)
  :CARDIOVERSIÓN ELÉCTRICA SINCRONIZADA (50-100J);<<#ffe4e6>>
  detach
else (NO - Estable)
  :1° LÍNEA: Maniobra de Valsalva Modificada;
  if (¿Revierte a Ritmo Sinusal?) then (SÍ)
    :Ritmo Sinusal Restaurado;
    detach
  else (NO)
    :2° LÍNEA: Adenosina 6mg EV Bolo Rápido;
    if (¿Persiste TPSV?) then (SÍ)
      :Repetir Adenosina 12mg EV Bolo;
      :3° LÍNEA: Verapamilo 5mg EV / Diltiazem;
    endif
    :Evaluación por Electrofisiología / Ablación;
    detach
  endif
endif
@enduml`
  },
  {
    filename: 'algo_tv.svg',
    puml: `@startuml
skinparam backgroundColor #ffffff
skinparam Monochrome false
skinparam shadowing false
skinparam defaultFontName Arial
skinparam defaultFontSize 11

start
:Taquicardia de Complejo QRS Ancho (>=0.12s);
if (¿Tiene Pulso Carotídeo?) then (NO)
  :DESFIBRILACIÓN NO SINCRONIZADA INMEDIATA (200J) + RCP;<<#ffe4e6>>
  detach
else (SÍ - Con Pulso)
  if (¿Inestabilidad Hemodinámica?) then (SÍ)
    :CARDIOVERSIÓN ELÉCTRICA SINCRONIZADA (100-200J);<<#ffe4e6>>
    detach
  else (NO - Estable)
    :Tratar como Taquicardia Ventricular Monomórfica;
    :Amiodarona 150mg EV en 10 min o Procainamida EV;
    :Ingreso a Unidad de Cuidados Coronarios;
    detach
  endif
endif
@enduml`
  }
];

function fetchSvg(d) {
  return new Promise((resolve, reject) => {
    const deflated = zlib.deflateSync(d.puml, { level: 9 });
    const base64url = deflated.toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
    const krokiUrl = 'https://kroki.io/plantuml/svg/' + base64url;
    const fpath = path.join(svgDir, d.filename);

    https.get(krokiUrl, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        fs.writeFileSync(fpath, data);
        console.log(`Saved ${d.filename} (${data.length} bytes)`);
        resolve();
      });
    }).on('error', err => reject(err));
  });
}

async function main() {
  console.log("Generating Modern PlantUML SVG diagrams using :Node text;<<#ffe4e6>> syntax...");
  for (const d of diagrams) {
    await fetchSvg(d);
  }
  console.log("All Modern PlantUML SVG diagrams generated successfully!");
}

main().catch(console.error);
