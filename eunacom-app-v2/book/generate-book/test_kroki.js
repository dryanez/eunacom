const zlib = require('zlib');
const fs = require('fs');
const https = require('https');

const puml = `@startuml
skinparam handwritten false
skinparam backgroundColor #ffffff
skinparam Monochrome false
skinparam shadowing false
skinparam defaultFontName Arial
skinparam defaultFontSize 12
skinparam ActivityBackgroundColor #ffffff
skinparam ActivityBorderColor #1e293b
skinparam ActivityFontColor #0f172a
skinparam DecisionBackgroundColor #ffffff
skinparam DecisionBorderColor #2563eb
skinparam DecisionFontColor #1e3a8a

start
:Paciente con Arritmia en Urgencias;
if (¿Presenta Inestabilidad Hemodinámica?\n(Hipotensión, Choque, Angina, Edema Pulmonar, Síncope)) then (SÍ - Inestable)
  partition "#fef2f2" {
    :CARDIOVERSIÓN ELÉCTRICA SINCRONIZADA INMEDIATA (Taquicardia)\no Atropina 0.5-1mg EV / Marcapaso (Bradicardia);
  }
  stop
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
endif
stop
@enduml`;

const deflated = zlib.deflateSync(puml, { level: 9 });
const base64url = deflated.toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
const krokiUrl = 'https://kroki.io/plantuml/svg/' + base64url;
console.log('Kroki URL:', krokiUrl);

https.get(krokiUrl, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    fs.writeFileSync('kroki_diagram_sample.svg', data);
    console.log('Successfully saved kroki_diagram_sample.svg (', data.length, 'bytes)');
  });
});
