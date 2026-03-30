// Frontend HTTP client — calls our Vercel API routes (or local vite-node proxy in dev)
// Never exposes Turso credentials to the browser.

const BASE = import.meta.env.PROD ? '' : ''  // always relative — works locally + on Vercel

async function apiFetch(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`API error ${res.status}: ${err}`)
  }
  return res.json()
}

// ── USER PROGRESS ─────────────────────────────────────────────────────────────

export async function fetchProgress(userId) {
  const data = await apiFetch(`/api/progress?userId=${userId}`)
  return data.data || []
}

export async function insertProgress(userId, questionId, isCorrect, isOmitted = false) {
  return apiFetch('/api/progress', {
    method: 'POST',
    body: JSON.stringify({ userId, questionId, isCorrect, isOmitted })
  })
}

// ── TESTS ─────────────────────────────────────────────────────────────────────

export async function fetchTests(userId) {
  const data = await apiFetch(`/api/tests?userId=${userId}`)
  return data.data || []
}

export async function createTest(testObj) {
  // testObj: { id, userId, mode, timeLimitSeconds, totalQuestions, questions }
  return apiFetch('/api/tests', {
    method: 'POST',
    body: JSON.stringify(testObj)
  })
}

export async function saveTestProgress(id, answers, currentIndex) {
  return apiFetch('/api/tests', {
    method: 'PATCH',
    body: JSON.stringify({ id, answers, currentIndex })
  })
}

export async function completeTest(id, answers, currentIndex, score) {
  return apiFetch('/api/tests', {
    method: 'PATCH',
    body: JSON.stringify({ id, answers, currentIndex, status: 'completed', score })
  })
}

export async function deleteTest(id) {
  return apiFetch(`/api/tests?id=${id}`, { method: 'DELETE' })
}

// ── AI TUTOR ──────────────────────────────────────────────────────────────────

export async function askTutor(payload) {
  const data = await apiFetch('/api/tutor', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
  return data.message || data.error
}

// ── HELPERS ───────────────────────────────────────────────────────────────────

export function genId() {
  return crypto.randomUUID()
}
