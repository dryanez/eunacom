// Lazy-loads questionDB.json from public/data/ and caches it in memory.
// Use instead of static import to keep it out of the JS bundle.

let cache = null
let fetchPromise = null

export async function getQuestionDB() {
  if (cache) return cache
  if (!fetchPromise) {
    fetchPromise = fetch('/data/questionDB.json')
      .then(r => r.json())
      .then(data => { cache = data; return data })
  }
  return fetchPromise
}
