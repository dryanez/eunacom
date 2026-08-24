const https = require('https');
const fs = require('fs');
const path = require('path');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

const specialties = [
  { name: 'Diabetes', key: 'diabetes' },
  { name: 'Endocrinología', key: 'endocrinologia' },
  { name: 'Gastroenterología', key: 'gastroenterologia' },
  { name: 'Hematología', key: 'hematologia' },
  { name: 'Infectología', key: 'infectologia' },
  { name: 'Nefrología', key: 'nefrologia' },
  { name: 'Neurología y Geriatría', key: 'neurologia_geriatria' },
  { name: 'Respiratorio', key: 'respiratorio' },
  { name: 'Reumatología', key: 'reumatologia' }
];

async function main() {
  console.log("Fetching all classes list from Vercel API...");
  const listRes = await fetchUrl('https://eunacom.vercel.app/api/clases');
  const allClasses = listRes.data || [];
  console.log(`Total classes in API: ${allClasses.length}`);

  const outDir = path.join(__dirname, 'online_classes');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  for (const spec of specialties) {
    console.log(`\n--- Fetching Specialty: ${spec.name} ---`);
    const specClasses = allClasses.filter(c => 
      c.specialty === 'Módulo 1' && c.subsystem === spec.name
    );
    console.log(`Found ${specClasses.length} classes for ${spec.name}`);

    const detailedList = [];
    for (let i = 0; i < specClasses.length; i++) {
      const item = specClasses[i];
      process.stdout.write(`  [${i+1}/${specClasses.length}] ${item.topic}... `);
      try {
        const detailRes = await fetchUrl(`https://eunacom.vercel.app/api/clases?id=${encodeURIComponent(item.id)}`);
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

  console.log("\n🎉 All Module 1 classes downloaded successfully!");
}

main().catch(console.error);
