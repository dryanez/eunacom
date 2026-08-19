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

async function main() {
  console.log("Fetching all classes list from Vercel API...");
  const listRes = await fetchUrl('https://eunacom.vercel.app/api/clases');
  const allClasses = listRes.data || [];
  console.log(`Total classes in API: ${allClasses.length}`);

  // Filter Cardiology classes
  const cardioClasses = allClasses.filter(c => 
    (c.subsystem && c.subsystem.toLowerCase().includes('cardio')) ||
    (c.id && c.id.toLowerCase().includes('cardio')) ||
    (c.specialty && c.specialty.toLowerCase().includes('cardio'))
  );

  console.log(`Found ${cardioClasses.length} Cardiology classes.`);

  const detailedCardio = [];
  for (let i = 0; i < cardioClasses.length; i++) {
    const item = cardioClasses[i];
    console.log(`[${i+1}/${cardioClasses.length}] Fetching ${item.topic} (ID: ${item.id})...`);
    try {
      const detailRes = await fetchUrl(`https://eunacom.vercel.app/api/clases?id=${encodeURIComponent(item.id)}`);
      if (detailRes.data) {
        detailedCardio.push(detailRes.data);
      }
    } catch (e) {
      console.error(`Failed to fetch ${item.id}:`, e.message);
    }
  }

  const outPath = path.join(__dirname, 'cardio_online_classes.json');
  fs.writeFileSync(outPath, JSON.stringify(detailedCardio, null, 2));
  console.log(`Saved ${detailedCardio.length} full cardiology classes to ${outPath}`);
}

main().catch(console.error);
