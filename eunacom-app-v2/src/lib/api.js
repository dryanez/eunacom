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

async function clasesFetch(path, options = {}) {
  return apiFetch(path, options)
}

export async function fetchClases() {
  const data = await clasesFetch('/api/clases')
  return data.data || []
}

export async function fetchClase(id) {
  const data = await clasesFetch(`/api/clases?id=${id}`)
  return data.data || null
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

// ── CLASE PROGRESS ──────────────────────────────────────────────

export async function fetchClaseProgress(userId) {
  const data = await apiFetch(`/api/clase-progress?userId=${userId}`)
  return data.data || []
}

export async function saveClaseProgress(payload) {
  // payload may include: userId, claseId, readClase, readPuntos,
  // quizCompleted, quizScore, quizCorrect, quizTotal, quizAnswers, videoWatched
  return apiFetch('/api/clase-progress', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

// ── EUNACOM QUESTIONS ────────────────────────────────────────────

export async function fetchEunacomQuestions({ claseId, eunacomCode, specialty, limit = 50, offset = 0 } = {}) {
  const params = new URLSearchParams()
  if (claseId) params.set('clase_id', claseId)
  else if (eunacomCode) params.set('eunacom_code', eunacomCode)
  else if (specialty) params.set('specialty', specialty)
  params.set('limit', String(limit))
  params.set('offset', String(offset))
  const data = await apiFetch(`/api/questions?${params.toString()}`)
  return data.data || []
}

// ── PERFIL EUNACOM (Biblioteca) ──────────────────────────────────

export async function fetchPerfil(params = {}) {
  const qs = new URLSearchParams(params).toString()
  return apiFetch(`/api/perfil${qs ? '?' + qs : ''}`)
}

// ── LEADERBOARD & STREAKS ────────────────────────────────────────────────────

export async function fetchLeaderboard(period = 'all', userId = null) {
  const params = new URLSearchParams({ period })
  if (userId) params.set('userId', userId)
  return apiFetch(`/api/leaderboard?${params.toString()}`)
}

// ── STUDY PLAN SETTINGS ──────────────────────────────────────────────────────

export async function fetchStudyPlanSettings(userId) {
  const data = await apiFetch(`/api/study-plan?userId=${userId}`)
  return data.data || null
}

export async function saveStudyPlanSettings(payload) {
  return apiFetch('/api/study-plan', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

// ── USER PROFILES (Onboarding) ──────────────────────────────────────────────

export async function fetchUserProfile(userId) {
  const data = await apiFetch(`/api/user-profiles?userId=${userId}`)
  return data.data || null
}

export async function saveUserProfile(profile) {
  return apiFetch('/api/user-profiles', {
    method: 'POST',
    body: JSON.stringify(profile)
  })
}

// ── ADMIN: ALL USERS ─────────────────────────────────────────────────────────

export async function fetchAdminUsers(adminEmail) {
  const data = await apiFetch(`/api/admin-users?adminEmail=${encodeURIComponent(adminEmail)}`)
  return data.data || []
}

// ── HELPERS ───────────────────────────────────────────────────────────────────

export function genId() {
  return crypto.randomUUID()
}
