const https = require('https');
const fs = require('fs');
const path = require('path');

const UNIS = [
  { file: 'uchile.png', url: 'https://eunapass.com/icons/universities/icono-universidad-de-chile.png', name: 'Universidad de Chile' },
  { file: 'uc.png', url: 'https://eunapass.com/icons/universities/icono-uc.png', name: 'Pontificia Universidad Católica (UC)' },
  { file: 'udec.png', url: 'https://eunapass.com/icons/universities/icono-universidad-de-concepcion.png', name: 'Universidad de Concepción' },
  { file: 'uandes.png', url: 'https://eunapass.com/icons/universities/icono-uandes.png', name: 'Universidad de los Andes' },
  { file: 'udd.png', url: 'https://eunapass.com/icons/universities/universidad-del-desarrollo.png', name: 'Universidad del Desarrollo' },
  { file: 'unab.png', url: 'https://eunapass.com/icons/universities/icono-unab.png', name: 'Universidad Andrés Bello' },
  { file: 'uv.png', url: 'https://eunapass.com/icons/universities/icono-uval.png', name: 'Universidad de Valparaíso' },
  { file: 'usach.png', url: 'https://eunapass.com/icons/universities/icono-universidad-de-santiago.png', name: 'Universidad de Santiago (USACH)' },
  { file: 'uaustral.png', url: 'https://eunapass.com/icons/universities/icono-uaustral.png', name: 'Universidad Austral de Chile' },
  { file: 'ucn.png', url: 'https://eunapass.com/icons/universities/icono-ucn.png', name: 'Universidad Católica del Norte' },
  { file: 'umayor.png', url: 'https://eunapass.com/icons/universities/icono-universidad-mayor.png', name: 'Universidad Mayor' },
  { file: 'udp.png', url: 'https://eunapass.com/icons/universities/icono-udp.png', name: 'Universidad Diego Portales' },
  { file: 'uss.png', url: 'https://eunapass.com/icons/universities/icono-uss.png', name: 'Universidad San Sebastián' },
  { file: 'ufro.png', url: 'https://eunapass.com/icons/universities/icono-ufro1.png', name: 'Universidad de La Frontera' },
  { file: 'uautonoma.png', url: 'https://eunapass.com/icons/universities/icono-uautonoma.png', name: 'Universidad Autónoma' },
  { file: 'uantofa.png', url: 'https://eunapass.com/icons/universities/icono-uantofa.png', name: 'Universidad de Antofagasta' },
  { file: 'uoh.png', url: 'https://eunapass.com/icons/universities/icono-uoh.png', name: 'Universidad de O’Higgins' },
  { file: 'uft.png', url: 'https://eunapass.com/icons/universities/icono-ft.png', name: 'Universidad Finis Terrae' },
  { file: 'uboh.png', url: 'https://eunapass.com/icons/universities/icono-uboh.png', name: 'Universidad Bernardo O’Higgins' },
  { file: 'ucm.png', url: 'https://eunapass.com/icons/universities/icono-uc-del-maule.png', name: 'Universidad Católica del Maule' },
  { file: 'uta.png', url: 'https://eunapass.com/icons/universities/icono-universidad-de-tarapaca.png', name: 'Universidad de Tarapacá' },
  { file: 'uatacama.png', url: 'https://eunapass.com/icons/universities/icono-universidad-atac.png', name: 'Universidad de Atacama' },
  { file: 'umag.png', url: 'https://eunapass.com/icons/universities/icono-umag.png', name: 'Universidad de Magallanes' },
  { file: 'utalca.png', url: 'https://eunapass.com/icons/universities/icono-utalca.png', name: 'Universidad de Talca' },
  { file: 'ucsc.png', url: 'https://eunapass.com/icons/universities/icono-universidad-catolica-de-la-santisima-concepcion.png', name: 'Universidad Católica de la Santísima Concepción' },
  { file: 'ucentral.png', url: 'https://eunapass.com/icons/universities/icono-universidad-central.png', name: 'Universidad Central de Chile' },
  { file: 'pucv.png', url: 'https://eunapass.com/icons/universities/icono-pucv.png', name: 'Pontificia Univ. Católica de Valparaíso' }
];

const destDir = path.resolve('public/img/unis_hd');
fs.mkdirSync(destDir, { recursive: true });

async function downloadAll() {
  for (const uni of UNIS) {
    const dest = path.join(destDir, uni.file);
    try {
      await new Promise((resolve, reject) => {
        https.get(uni.url, res => {
          if (res.statusCode === 200) {
            const fileStream = fs.createWriteStream(dest);
            res.pipe(fileStream);
            fileStream.on('finish', () => {
              fileStream.close();
              resolve();
            });
          } else {
            reject(new Error(`Status ${res.statusCode}`));
          }
        }).on('error', reject);
      });
      console.log('Downloaded:', uni.file);
    } catch (e) {
      console.log('Failed:', uni.file, e.message);
    }
  }
}

downloadAll();
