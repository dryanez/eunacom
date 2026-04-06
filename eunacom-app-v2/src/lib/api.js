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

// ── MIS CLASES (MedScribe) ───────────────────────────────────────────────────
// In production: calls Vercel API (Turso). In dev: calls MedScribe backend (port 3001).

const MEDSCRIBE_BASE = import.meta.env.PROD ? '' : `http://${window.location.hostname}:3001`

async function clasesFetch(path, options = {}) {
  // Try MedScribe backend first (local dev), fall back to Vercel API
  try {
    const res = await fetch(MEDSCRIBE_BASE + path, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    })
    if (res.ok) return res.json()
  } catch {}
  // Fallback to Vercel API
  return apiFetch(path, options)
}

export async function fetchClases(userId) {
  const data = await clasesFetch(`/api/clases?userId=${userId}`)
  return data.data || []
}

export async function saveClase({ id, userId, topic, summary, keyPoints, quiz }) {
  return clasesFetch('/api/clases', {
    method: 'POST',
    body: JSON.stringify({ id, topic, summary, keyPoints, quiz })
  })
}

export async function deleteClase(id) {
  return clasesFetch(`/api/clases?id=${id}`, { method: 'DELETE' })
}

// ── HELPERS ───────────────────────────────────────────────────────────────────

export function genId() {
  return crypto.randomUUID()
}
