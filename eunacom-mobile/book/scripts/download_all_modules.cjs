const https = require('https');
const fs = require('fs');
const path = require('path');

function fetchFollow(urlStr) {
  return new Promise((resolve, reject) => {
    const req = https.get(urlStr, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const nextUrl = res.headers.location.startsWith('http') ? res.headers.location : new URL(res.headers.location, urlStr).toString();
        return resolve(fetchFollow(nextUrl));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
  });
}

const specialtiesToDownload = [
  // Módulo 2
  { module: 'Módulo 2', sub: 'Cirugía General y Anestesia', key: 'm2_cirugia_anestesia', altSubs: ['Cirugía General', 'Cirugía General y Anestesia'] },
  { module: 'Módulo 2', sub: 'Traumatología', key: 'm2_traumatologia' },
  { module: 'Módulo 2', sub: 'Urología', key: 'm2_urologia' },
  { module: 'Módulo 2', sub: 'Dermatología', key: 'm2_dermatologia' },
  { module: 'Módulo 2', sub: 'Oftalmología', key: 'm2_oftalmologia' },
  { module: 'Módulo 2', sub: 'Otorrinolaringología', key: 'm2_otorrinolaringologia' },
  { module: 'Módulo 2', sub: 'Psiquiatría General', key: 'm2_psiquiatria' },
  { module: 'Módulo 2', sub: 'Salud Pública', key: 'm2_salud_publica' },

  // Módulo 3
  { module: 'Módulo 3', sub: 'Pediatría', key: 'm3_pediatria' },
  { module: 'Módulo 3', sub: 'Ginecología', key: 'm3_ginecologia' },
  { module: 'Módulo 3', sub: 'Obstetricia', key: 'm3_obstetricia' }
];

async function main() {
  console.log("Fetching full classes list from API...");
  const listRes = await fetchFollow('https://www.eunacomapp.cl/api/clases');
  const allClasses = listRes.data || [];
  console.log(`Total classes in API: ${allClasses.length}`);

  const outDir = path.join(__dirname, 'online_classes');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  for (const spec of specialtiesToDownload) {
    console.log(`\n--- Fetching: [${spec.module}] ${spec.sub} ---`);
    const specClasses = allClasses.filter(c => {
      if (c.specialty !== spec.module) return false;
      if (spec.altSubs) return spec.altSubs.includes(c.subsystem);
      return c.subsystem === spec.sub;
    });

    console.log(`Found ${specClasses.length} classes for ${spec.sub}`);

    const detailedList = [];
    for (let i = 0; i < specClasses.length; i++) {
      const item = specClasses[i];
      process.stdout.write(`  [${i+1}/${specClasses.length}] ${item.topic}... `);
      try {
        const detailRes = await fetchFollow(`https://www.eunacomapp.cl/api/clases?id=${encodeURIComponent(item.id)}`);
        if (detailRes.data) {
          detailedList.push(detailRes.data);
          console.log("OK");
        } else {
          console.log("NO DATA");
        }
      } catch (e) {
        console.log(`ERROR: ${e.message}`);
      }
    }

    const outPath = path.join(outDir, `${spec.key}_online_classes.json`);
    fs.writeFileSync(outPath, JSON.stringify(detailedList, null, 2));
    console.log(`✅ Saved ${detailedList.length} classes to ${outPath}`);
  }

  console.log("\n🎉 All classes for Modules 2 & 3 downloaded successfully!");
}

main().catch(console.error);
