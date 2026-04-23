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

// Cache for reconstruction files
const reconstructionCache = {}

const LETTERS = ['A', 'B', 'C', 'D', 'E']

function convertReconstructionQuestion(q, id) {
  const rawOptions = q.options || q.opciones || []
  const choices = rawOptions.map((text, i) => ({ id: LETTERS[i] || String(i), text }))

  let correctAnswer = null
  const rc = q.correctAnswer || q.respuesta_correcta
  if (rc != null) {
    if (typeof rc === 'string' && /^[A-Ea-e]$/.test(rc)) {
      correctAnswer = rc.toUpperCase()
    } else if (typeof rc === 'number' && rc < choices.length) {
      correctAnswer = LETTERS[rc]
    }
  }

  return {
    id,
    question: q.question || q.pregunta || '',
    choices,
    correctAnswer,
    explanation: q.explanation || q.explicacion || q.respuesta_texto || '',
  }
}

async function getReconstructionDB(examId) {
  if (reconstructionCache[examId]) return reconstructionCache[examId]
  const res = await fetch(`/data/reconstrucciones/${examId}.json`)
  if (!res.ok) throw new Error(`Reconstruction ${examId} not found`)
  const data = await res.json()
  const qs = data.questions || data
  reconstructionCache[examId] = qs
  return qs
}

/**
 * Load full question objects for a list of stored question IDs.
 * Handles both UUID-based IDs (from questionDB.json) and
 * reconstruction IDs like "eunacom-jul-2025_q42".
 */
export async function loadTestQuestions(questionIds) {
  if (!questionIds?.length) return []

  // Split IDs by source
  const uuidIds = []
  const reconstructionGroups = {}   // examId → [{id, qNum}]

  for (const id of questionIds) {
    const match = String(id).match(/^(.+)_q(\d+)$/)
    if (match) {
      const examId = match[1]
      if (!reconstructionGroups[examId]) reconstructionGroups[examId] = []
      reconstructionGroups[examId].push({ id, qNum: parseInt(match[2], 10) })
    } else {
      uuidIds.push(id)
    }
  }

  const resultMap = {}

  // Load UUID questions from questionDB.json
  if (uuidIds.length > 0) {
    const db = await getQuestionDB()
    const idSet = new Set(uuidIds)
    for (const q of db) {
      if (idSet.has(q.id)) resultMap[q.id] = q
    }
  }

  // Load reconstruction questions
  for (const [examId, items] of Object.entries(reconstructionGroups)) {
    try {
      const qs = await getReconstructionDB(examId)
      const qByNum = {}
      for (const q of qs) qByNum[q.id] = q
      for (const { id, qNum } of items) {
        const q = qByNum[qNum]
        if (q) resultMap[id] = convertReconstructionQuestion(q, id)
      }
    } catch (e) {
      console.error(`loadTestQuestions: failed to load reconstruction "${examId}":`, e)
    }
  }

  // Return in original order, drop any not found
  return questionIds.map(id => resultMap[id]).filter(Boolean)
}
