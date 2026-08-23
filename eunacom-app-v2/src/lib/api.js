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

export async function fetchReviewQuestions(userId) {
  const data = await apiFetch(`/api/questions?reviewUserId=${userId}`)
  return data.data || []
}

export async function createTest(testObj) {
  // testObj: { id, userId, mode, timeLimitSeconds, totalQuestions, questions }
  return apiFetch('/api/tests', {
    method: 'POST',
    body: JSON.stringify(testObj)
  })
}

export async function saveTestProgress(id, answers, currentIndex, timeLeftSeconds, tutorState = null) {
  return apiFetch('/api/tests', {
    method: 'PATCH',
    body: JSON.stringify({ id, answers, currentIndex, timeLeftSeconds, tutorState })
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

// ── MIS CLASES (MedScribe & Catalog) ──────────────────────────────────────────
let _cachedCatalog = null

async function getLocalClassesCatalog() {
  if (_cachedCatalog) return _cachedCatalog
  try {
    const res = await fetch('/data/classesCatalog.json')
    if (res.ok) {
      _cachedCatalog = await res.json()
      return _cachedCatalog
    }
  } catch {}
  return []
}

async function clasesFetch(path, options = {}) {
  return apiFetch(path, options)
}

export async function fetchClases() {
  try {
    const data = await clasesFetch('/api/clases')
    if (data && Array.isArray(data.data) && data.data.length > 0) {
      return data.data
    }
  } catch (err) {
    console.warn('API /api/clases error, using bundled catalog:', err)
  }
  // Fallback to bundled catalog
  const catalog = await getLocalClassesCatalog()
  return catalog.map(r => ({
    id: r.id,
    saved_at: r.saved_at,
    specialty: r.specialty || 'General',
    subsystem: r.subsystem || 'General',
    lesson_number: r.lesson_number || 1,
    topic: r.topic,
    slides_file: r.slides_file || null,
    video_dir: r.video_dir || null,
  }))
}

export async function fetchClase(id) {
  try {
    const data = await clasesFetch(`/api/clases?id=${id}`)
    if (data && data.data) {
      return data.data
    }
  } catch (err) {
    console.warn('API /api/clases?id error, checking bundled catalog:', err)
  }
  // Fallback to bundled catalog
  const catalog = await getLocalClassesCatalog()
  const norm = s => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const found = catalog.find(c => c.id === id || norm(c.id) === norm(id) || norm(c.topic) === norm(id))
  return found || null
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

export async function fetchLeaderboard(options = {}, maybeUserId = null) {
  let period = 'all'
  let userId = null
  let university = null
  let sede = null
  let country = null

  if (typeof options === 'string') {
    period = options
    userId = maybeUserId
  } else if (typeof options === 'object' && options !== null) {
    period = options.period || 'all'
    userId = options.userId || null
    university = options.university || null
    sede = options.sede || null
    country = options.country || null
  }

  const params = new URLSearchParams({ period })
  if (userId) params.set('userId', userId)
  if (university) params.set('university', university)
  if (sede) params.set('sede', sede)
  if (country) params.set('country', country)

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

export async function fetchAdminUserDetail(userId, adminEmail) {
  const params = new URLSearchParams({ userId, adminEmail })
  return apiFetch(`/api/admin-users?${params.toString()}`)
}

export async function grantPremiumAccess(adminEmail, targetUserId, months) {
  return apiFetch('/api/admin-users', {
    method: 'PATCH',
    body: JSON.stringify({ adminEmail, userId: targetUserId, months })
  })
}

// ── PAYMENTS (Mercado Pago) ───────────────────────────────────────────────────

export async function createCheckoutSession(userId, planId) {
  return apiFetch('/api/user-profiles', {
    method: 'POST',
    body: JSON.stringify({ action: 'checkout', userId, planId })
  })
}

export async function createDonationSession(userId) {
  return apiFetch('/api/user-profiles', {
    method: 'POST',
    body: JSON.stringify({ action: 'donate', userId })
  })
}

// ── PAYPAL TRANSACTIONS (Admin) ───────────────────────────────────────────────

export async function fetchPaypalTransactions(adminEmail) {
  const data = await apiFetch(`/api/paypal-export?adminEmail=${encodeURIComponent(adminEmail)}`)
  return data.data || []
}

export function downloadPaypalCsv(adminEmail) {
  window.open(`/api/paypal-export?adminEmail=${encodeURIComponent(adminEmail)}&format=csv`, '_blank')
}

// ── MAILING CAMPAIGNS ─────────────────────────────────────────────────────────

export async function sendCampaign(adminEmail, targetEmails, subject, htmlContent) {
  return apiFetch('/api/admin-users', {
    method: 'POST',
    body: JSON.stringify({ adminEmail, targetEmails, subject, htmlContent })
  })
}

// ── APP SETTINGS ─────────────────────────────────────────────────────────────────

export async function fetchAppSettings() {
  const data = await apiFetch('/api/admin-users?action=settings')
  return data.settings || {}
}

export async function updateAppSetting(adminEmail, key, value) {
  return apiFetch('/api/admin-users', {
    method: 'POST',
    body: JSON.stringify({ adminEmail, action: 'settings', key, value })
  })
}

// ── HELPERS ───────────────────────────────────────────────────────────────────

export function genId() {
  return crypto.randomUUID()
}
