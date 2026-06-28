const fs = require('fs')
const questionDB = JSON.parse(fs.readFileSync('public/data/questionDB.json', 'utf8'))
const videoIndex = JSON.parse(fs.readFileSync('src/lib/videoIndex.json', 'utf8'))

let matched = 0
let unmatched = 0

const allVideoPaths = Object.values(videoIndex).flatMap(obj => Object.values(obj))

for (const q of questionDB) {
  const ex = q.explanation || ''
  const inEx = q.incorrectExplanations || ''
  const text = ex + ' ' + inEx
  
  // Look for something like "video 7. Disección aórtica"
  const match = text.match(/video (\d+)[.-]\s*([^.,]+)/i)
  
  if (match) {
    const num = match[1]
    const title = match[2].trim().toLowerCase()
    const topic = q.topic
    
    // Find a path that contains the number AND the title words
    const titleWords = title.split(/\s+/).filter(w => w.length > 3)
    const possible = allVideoPaths.find(p => {
      const lowerP = p.toLowerCase()
      // Needs to match the lesson number format
      if (!lowerP.includes(`/${num}. `) && !lowerP.includes(`/${num}-`) && !lowerP.includes(`/${num} `)) return false
      // And should match at least some words from the title
      return titleWords.some(w => lowerP.includes(w))
    })
    
    if (possible) {
      console.log(`FOUND: ${match[0]} -> ${possible}`)
      matched++
    } else {
      console.log(`NOT FOUND: ${match[0]} (topic: ${topic})`)
      unmatched++
    }
  }
}

console.log(`Matched: ${matched}, Unmatched: ${unmatched}`)
