import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, GraduationCap, Clock, CheckCircle2, PlayCircle, Lock, BookOpen, RotateCcw } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { createTest, genId, fetchTests, fetchLibroGordoQuestions } from '../../lib/api'
import './midnight.css'
import './clase.css'

// Pruebas por especialidad (Midnight Pro): las 90 preguntas EUNACOM del Libro Gordo de la
// especialidad, repartidas en 4 días. Cada intento se guarda como test "lg-<libro>-d<N>-<uuid>",
// así aparece en Historial igual que los Libros Gordos online.

const DAYS = 4

const ALIASES = {
  respiratorio: 'neumologia', neumologia: 'neumologia',
  otorrinolaringologia: 'otorrino', otorrino: 'otorrino',
  saludpublica: 'saludpublica',
}
const BOOKS = ['cardiologia', 'diabetes', 'endocrinologia', 'gastroenterologia', 'hematologia', 'infectologia',
  'nefrologia', 'neurologia', 'neumologia', 'reumatologia', 'cirugia', 'traumatologia', 'urologia', 'otorrino',
  'oftalmologia', 'dermatologia', 'psiquiatria', 'pediatria', 'obstetricia', 'ginecologia', 'saludpublica']

export function bookKeyFor(subsystem) {
  const n = String(subsystem || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  const compact = n.replace(/[^a-z]/g, '')
  if (ALIASES[compact]) return ALIASES[compact]
  const first = n.split(/[^a-z]+/).filter(Boolean)[0] // «Cirugía General y Anestesia» → cirugia
  if (ALIASES[first]) return ALIASES[first]
  return BOOKS.includes(first) ? first : null
}

// 90 → 23 · 23 · 22 · 22
function splitDays(questions) {
  const out = []
  let start = 0
  for (let d = 0; d < DAYS; d++) {
    const size = Math.floor(questions.length / DAYS) + (d < questions.length % DAYS ? 1 : 0)
    out.push(questions.slice(start, start + size))
    start += size
  }
  return out
}

const parseJson = (v, fb) => { try { return typeof v === 'string' ? JSON.parse(v) : (v ?? fb) } catch { return fb } }

export default function PruebasDias({ subsystem, onBack, onUpgrade }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const book = bookKeyFor(subsystem)
  const [questions, setQuestions] = useState(null)
  const [error, setError] = useState(null)
  const [tests, setTests] = useState([])
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!book || !user) return
    let alive = true
    setQuestions(null); setError(null)
    fetchLibroGordoQuestions(book, user.id).then(res => {
      if (!alive) return
      if (res.error) setError(res.error)
      else setQuestions(res.data || [])
    })
    fetchTests(user.id).then(t => alive && setTests(t || [])).catch(() => {})
    return () => { alive = false }
  }, [book, user?.id])

  const days = useMemo(() => (questions ? splitDays(questions) : []), [questions])

  // último intento por día
  const attempts = useMemo(() => {
    const map = {}
    for (const t of tests) {
      const m = String(t.id).match(new RegExp(`^lg-${book}-d(\\d)-`))
      if (!m) continue
      const d = Number(m[1])
      const prev = map[d]
      if (!prev || String(t.created_at) > String(prev.created_at)) map[d] = t
    }
    return map
  }, [tests, book])

  const doneCount = Object.values(attempts).filter(a => a.status === 'completed').length

  const run = (dayIdx, qs, extra) => navigate('/test-runner', {
    state: { questions: qs, returnTo: '/mis-clases', ...extra },
  })

  const start = async (dayIdx, mode) => {
    const qs = days[dayIdx]
    if (!qs?.length || busy) return
    setBusy(true)
    try {
      const testId = `lg-${book}-d${dayIdx + 1}-${genId()}`
      const timeLimitSeconds = mode === 'exam' ? qs.length * 60 : 0
      await createTest({ id: testId, userId: user.id, mode, timeLimitSeconds, totalQuestions: qs.length, questions: qs.map(q => q.id) })
      run(dayIdx, qs, { testId, mode, isSimulation: mode === 'exam', timeLimitSeconds })
    } catch (e) {
      alert('Error: ' + (e.message || String(e)))
    } finally { setBusy(false) }
  }

  const resume = (dayIdx, a) => {
    const done = a.status === 'completed'
    run(dayIdx, days[dayIdx], {
      testId: a.id, mode: a.mode, isSimulation: a.mode === 'exam', startFinished: done,
      timeLimitSeconds: a.time_limit_seconds || 0, timeLeftSeconds: a.time_left_seconds ?? undefined,
      tutorState: parseJson(a.tutor_state, null), savedIndex: a.current_question_index || 0,
      savedAnswers: parseJson(a.answers, {}),
    })
  }

  const total = questions?.length || 0
  const pct = Math.round((doneCount / DAYS) * 100)

  return (
    <div className="mn-cl mn-pd">
      <button className="mn-cl-back" onClick={onBack}><ChevronLeft size={16} /> Volver</button>

      <div className="mn-cl-hero">
        <div className="mn-cl-eyebrow">Libro Gordo · Preguntas EUNACOM</div>
        <h2 className="mn-cl-title">Pruebas de {subsystem}</h2>
        <div className="mn-cl-chips">
          <span className="mn-cl-chip"><BookOpen size={13} /> {total || 90} preguntas</span>
          <span className="mn-cl-chip"><Clock size={13} /> {DAYS} días</span>
          <span className={`mn-cl-chip ${doneCount === DAYS ? 'mn-cl-chip--ok' : ''}`}><CheckCircle2 size={13} /> {doneCount}/{DAYS} completados</span>
        </div>
        <div className="mn-pd-bar"><i style={{ width: `${pct}%` }} /></div>
      </div>

      {!book && <div className="mn-cl-soon">Esta especialidad todavía no tiene su libro de 90 preguntas.</div>}

      {book && error && (
        <div className="mn-pd-lock">
          <Lock size={22} />
          <div>
            <b>{error === 'no_access' ? 'Disponible con tu plan' : 'No se pudieron cargar las preguntas'}</b>
            <span>{error === 'no_access' ? 'Las 90 preguntas del libro, en 4 días, están incluidas en el plan premium.' : `Intenta de nuevo (${error}).`}</span>
          </div>
          {error === 'no_access' && onUpgrade && <button className="mn-cl-nb pri" onClick={onUpgrade}>Ver planes</button>}
        </div>
      )}

      {book && !error && !questions && <div className="mn-cl-soon" style={{ color: 'var(--mn-mut)', background: 'var(--mn-tile)', borderColor: 'var(--mn-tline)' }}>Cargando preguntas…</div>}

      {days.length > 0 && (
        <div className="mn-pd-days">
          {days.map((qs, i) => {
            const a = attempts[i + 1]
            const done = a?.status === 'completed'
            const from = days.slice(0, i).reduce((n, d) => n + d.length, 0) + 1
            return (
              <div key={i} className={`mn-pd-day ${done ? 'is-done' : ''}`}>
                <div className="mn-pd-day-top">
                  <span className="mn-pd-num">{done ? <CheckCircle2 size={18} /> : i + 1}</span>
                  <div className="mn-pd-day-t">
                    <b>Día {i + 1}</b>
                    <span>{qs.length} preguntas · {from}–{from + qs.length - 1}</span>
                  </div>
                  {a && (
                    <span className={`mn-pd-score ${done ? (a.score >= 60 ? 'ok' : 'bad') : ''}`}>
                      {done ? `${a.score}%` : 'En curso'}
                    </span>
                  )}
                </div>
                <div className="mn-pd-actions">
                  {a && !done ? (
                    <button className="mn-cl-nb pri" disabled={busy} onClick={() => resume(i, a)}><PlayCircle size={16} /> Continuar</button>
                  ) : (
                    <>
                      <button className="mn-cl-nb pri" disabled={busy} onClick={() => start(i, 'tutor')}><GraduationCap size={16} /> {done ? 'Repetir' : 'Practicar'}</button>
                      <button className="mn-cl-nb" disabled={busy} onClick={() => start(i, 'exam')}><Clock size={16} /> Modo examen</button>
                    </>
                  )}
                  {done && <button className="mn-cl-nb" disabled={busy} onClick={() => resume(i, a)}><RotateCcw size={15} /> Revisar</button>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
