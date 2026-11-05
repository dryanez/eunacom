// Libros Gordos online: las 1.890 preguntas de los 21 Libros Gordos (90 por especialidad) como
// ensayos con enlace de acceso. Viven en su propia tabla (libro_gordo_questions), aparte del banco
// de 6.099 (eunacom_questions), para no inflar el banco principal.
//
// Acceso: un enlace /libro-gordo/<token> por comprador (tabla libro_gordo_links). El primer usuario
// que entra con sesión lo reclama; después solo esa cuenta puede usarlo. Revocar = revoked_at.
// Los enlaces se crean/revocan con scripts/libro-gordo/links.mjs.
//
// Se monta dentro de /api/tests?lg=... (Vercel ya está en el límite de funciones).
//   GET /api/tests?lg=link&token=…&userId=…                 → libro(s) del enlace + intentos del usuario
//   GET /api/tests?lg=questions&book=…&userId=…[&token=…]   → preguntas en formato TestRunner
// Los intentos se guardan en la tabla tests con id "lg-<libro>-<uuid>" (lg=test pasa al handler normal).

export const GRAN_LIBRO = 'gran'

// key = sufijo del archivo ENSAYO_90Q_<KEY>.json en minúsculas
export const LIBROS_GORDOS = [
  { key: 'cardiologia', name: 'Cardiología' },
  { key: 'diabetes', name: 'Diabetes' },
  { key: 'endocrinologia', name: 'Endocrinología' },
  { key: 'gastroenterologia', name: 'Gastroenterología' },
  { key: 'hematologia', name: 'Hematología' },
  { key: 'infectologia', name: 'Infectología' },
  { key: 'nefrologia', name: 'Nefrología' },
  { key: 'neurologia', name: 'Neurología' },
  { key: 'neumologia', name: 'Respiratorio' },
  { key: 'reumatologia', name: 'Reumatología' },
  { key: 'cirugia', name: 'Cirugía' },
  { key: 'traumatologia', name: 'Traumatología' },
  { key: 'urologia', name: 'Urología' },
  { key: 'otorrino', name: 'Otorrinolaringología' },
  { key: 'oftalmologia', name: 'Oftalmología' },
  { key: 'dermatologia', name: 'Dermatología' },
  { key: 'psiquiatria', name: 'Psiquiatría' },
  { key: 'pediatria', name: 'Pediatría' },
  { key: 'obstetricia', name: 'Obstetricia' },
  { key: 'ginecologia', name: 'Ginecología' },
  { key: 'saludpublica', name: 'Salud Pública' },
]

export const bookName = key => key === GRAN_LIBRO
  ? 'Gran Libro Gordo'
  : (LIBROS_GORDOS.find(b => b.key === key)?.name || key)

export const isBookKey = key => key === GRAN_LIBRO || LIBROS_GORDOS.some(b => b.key === key)

export async function ensureLibroGordoTables(db) {
  await db.execute(`CREATE TABLE IF NOT EXISTS libro_gordo_questions (
    id TEXT PRIMARY KEY,
    book TEXT NOT NULL,
    number INTEGER,
    source TEXT DEFAULT 'libro_gordo',
    source_id TEXT,
    specialty TEXT,
    topic TEXT,
    perfil_code TEXT,
    pregunta TEXT NOT NULL,
    opcion_a TEXT, opcion_b TEXT, opcion_c TEXT, opcion_d TEXT, opcion_e TEXT,
    respuesta_correcta TEXT,
    explicacion TEXT,
    active INTEGER DEFAULT 1,
    review_note TEXT,
    imported_at TEXT DEFAULT (datetime('now'))
  )`)
  await db.execute('CREATE INDEX IF NOT EXISTS idx_lgq_book ON libro_gordo_questions(book, number)')
  await db.execute(`CREATE TABLE IF NOT EXISTS libro_gordo_links (
    token TEXT PRIMARY KEY,
    book TEXT NOT NULL,
    buyer_email TEXT,
    note TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    revoked_at TEXT,
    claimed_user_id TEXT,
    claimed_at TEXT,
    last_used_at TEXT
  )`)
}

const LETTERS = ['a', 'b', 'c', 'd', 'e']

export function toRunnerQuestion(row) {
  const choices = LETTERS
    .map(l => ({ id: l.toUpperCase(), text: row[`opcion_${l}`] }))
    .filter(c => c.text)
  return {
    id: row.id,
    question: row.pregunta,
    choices,
    correctAnswer: row.respuesta_correcta,
    explanation: row.explicacion || '',
    topic: row.topic || bookName(row.book),
    category: `Libro Gordo · ${bookName(row.book)}`,
    specialty: row.specialty,
  }
}

// Error de acceso → { status, error } para que el cliente muestre el mensaje correcto
async function checkLink(db, token, userId) {
  if (!token) return { status: 400, error: 'token_required' }
  const r = await db.execute({ sql: 'SELECT * FROM libro_gordo_links WHERE token = ?', args: [token] })
  const link = r.rows[0]
  if (!link) return { status: 404, error: 'not_found' }
  if (link.revoked_at) return { status: 410, error: 'revoked' }
  if (!userId) return { status: 401, error: 'login_required', link }
  if (link.claimed_user_id && link.claimed_user_id !== userId) return { status: 409, error: 'claimed_by_other' }
  if (!link.claimed_user_id) {
    // Solo reclama si nadie lo hizo entre medio
    await db.execute({
      sql: `UPDATE libro_gordo_links SET claimed_user_id = ?, claimed_at = datetime('now') WHERE token = ? AND claimed_user_id IS NULL`,
      args: [userId, token]
    })
    const again = await db.execute({ sql: 'SELECT claimed_user_id FROM libro_gordo_links WHERE token = ?', args: [token] })
    if (again.rows[0]?.claimed_user_id !== userId) return { status: 409, error: 'claimed_by_other' }
  }
  await db.execute({ sql: `UPDATE libro_gordo_links SET last_used_at = datetime('now') WHERE token = ?`, args: [token] })
  return { link }
}

const linkCovers = (link, book) => link.book === GRAN_LIBRO || link.book === book

// Sin token (p. ej. desde el Historial): vale cualquier enlace vigente reclamado por el usuario, o plan premium vigente
async function userHasAccess(db, userId, book) {
  if (!userId) return false
  const links = await db.execute({
    sql: 'SELECT book FROM libro_gordo_links WHERE claimed_user_id = ? AND revoked_at IS NULL',
    args: [userId]
  })
  if (links.rows.some(l => linkCovers(l, book))) return true
  try {
    const p = await db.execute({ sql: 'SELECT is_premium, premium_until FROM user_profiles WHERE id = ?', args: [userId] })
    const profile = p.rows[0]
    return !!profile && Number(profile.is_premium) === 1 && (!profile.premium_until || new Date(profile.premium_until) > new Date())
  } catch {
    return false
  }
}

async function bookCounts(db) {
  const r = await db.execute('SELECT book, COUNT(*) AS n FROM libro_gordo_questions WHERE active = 1 GROUP BY book')
  return Object.fromEntries(r.rows.map(x => [x.book, Number(x.n)]))
}

export async function handleLibroGordo(db, req, res) {
  await ensureLibroGordoTables(db)
  const { lg, token, userId, book } = req.query

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  if (lg === 'link') {
    const check = await checkLink(db, token, userId)
    if (check.error) {
      return res.status(check.status).json({ error: check.error, book: check.link?.book || null, bookName: check.link ? bookName(check.link.book) : null })
    }
    const counts = await bookCounts(db)
    const books = (check.link.book === GRAN_LIBRO ? LIBROS_GORDOS : LIBROS_GORDOS.filter(b => b.key === check.link.book))
      .map(b => ({ ...b, questions: counts[b.key] || 0 }))
    const attempts = await db.execute({
      sql: `SELECT id, mode, status, score, total_questions, current_question_index, answers, tutor_state,
                   time_limit_seconds, time_left_seconds, created_at, completed_at
            FROM tests WHERE user_id = ? AND id LIKE 'lg-%' ORDER BY created_at DESC`,
      args: [userId]
    }).catch(() => ({ rows: [] }))
    return res.json({
      book: check.link.book,
      bookName: bookName(check.link.book),
      books,
      attempts: attempts.rows
        .map(t => ({ ...t, book: String(t.id).split('-')[1] }))
        .filter(t => linkCovers(check.link, t.book)),
    })
  }

  if (lg === 'questions') {
    if (!book || book === GRAN_LIBRO || !isBookKey(book)) return res.status(400).json({ error: 'book_required' })
    if (token) {
      const check = await checkLink(db, token, userId)
      if (check.error) return res.status(check.status).json({ error: check.error })
      if (!linkCovers(check.link, book)) return res.status(403).json({ error: 'book_not_in_link' })
    } else if (!(await userHasAccess(db, userId, book))) {
      return res.status(403).json({ error: 'no_access' })
    }
    const r = await db.execute({
      sql: 'SELECT * FROM libro_gordo_questions WHERE book = ? AND active = 1 ORDER BY number',
      args: [book]
    })
    return res.json({ book, bookName: bookName(book), data: r.rows.map(toRunnerQuestion) })
  }

  return res.status(400).json({ error: 'unknown lg action' })
}
