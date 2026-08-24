const https = require('https');
const fs = require('fs');

async function getUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function scrape() {
  console.log('Fetching eunapass landing HTML...');
  const html = await getUrl('https://eunapass.com/landing');
  
  // Find all script chunks
  const scriptMatches = html.match(/src="(\/_next\/static\/chunks\/[^"]+)"/g) || [];
  console.log('Found chunks:', scriptMatches.length);
  
  const allImages = new Set();
  
  for (const s of scriptMatches) {
    const chunkPath = s.replace('src="', '').replace('"', '');
    const chunkUrl = 'https://eunapass.com' + chunkPath;
    try {
      const chunkCode = await getUrl(chunkUrl);
      // search for image URLs, r2.dev URLs, or svg/png in chunk
      const imgs = chunkCode.match(/https?:\/\/[^"'\s\)]+\.(?:png|svg|webp|jpg)/gi) || [];
      imgs.forEach(img => allImages.add(img));
      
      const relativeImgs = chunkCode.match(/["'](\/[^"'\s\)]+\.(?:png|svg|webp|jpg))["']/gi) || [];
      relativeImgs.forEach(img => allImages.add('https://eunapass.com' + img.replace(/["']/g, '')));
    } catch (e) {
      console.log('Error chunk:', chunkUrl, e.message);
    }
  }
  
  console.log('Extracted unique image URLs:', allImages.size);
  allImages.forEach(img => console.log(' ->', img));
}

scrape();
