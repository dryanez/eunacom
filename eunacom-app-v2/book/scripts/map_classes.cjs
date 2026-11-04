// Quick script to map 47 online classes to 23 canonical classes
const fs = require('fs');
const online = JSON.parse(fs.readFileSync('d:/Anti/Eunacom/eunacom-app-v2/book/cardio_online_classes.json', 'utf8'));
online.forEach((c, i) => {
  const artLen = (c.article_content || '').length;
  const transLen = (c.clean_transcript || '').length;
  console.log(`${String(i+1).padStart(2)}. ${c.topic.substring(0,70).padEnd(70)} | art:${String(artLen).padStart(6)} | trans:${String(transLen).padStart(6)}`);
});
