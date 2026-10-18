import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle2, XCircle, ArrowRight, Target, Clock, BarChart3 } from 'lucide-react'
import { usePageSeo } from '../lib/seo'
import { getQuestionDB } from '../lib/questionDB'
import { useAuth } from '../contexts/AuthContext'

// Free 30-question diagnostic (no login). Top-of-funnel entry point for every marketing channel:
// share links as /ensayo-gratis?utm_source=<channel>&utm_campaign=<campaign>.

const PASS_MARK = 51 // EUNACOM-ST passing score (%)
const RESULT_KEY = 'eunacom_diagnostic_result'

const AREAS = [
  { name: 'Medicina Interna', qty: 10, topics: ['Medicina Interna', 'Endocrinología', 'Gastroenterología', 'Cardiología', 'Infectología', 'Nefrología', 'Hematología', 'Respiratorio', 'Neurología', 'Reumatología'] },
  { name: 'Pediatría', qty: 4, topics: ['Pediatría', 'Neonatología'] },
  { name: 'Ginecología y Obstetricia', qty: 4, topics: ['Ginecología', 'Obstetricia'] },
  { name: 'Cirugía', qty: 4, topics: ['Cirugía y Anestesia', 'Cirugía', 'Traumatología', 'Urología'] },
  { name: 'Psiquiatría y Salud Pública', qty: 4, topics: ['Psiquiatría', 'Salud Pública'] },
  { name: 'Especialidades', qty: 4, topics: ['Especialidades', 'Dermatología', 'Oftalmología', 'Otorrinolaringología'] },
]

const shuffle = arr => [...arr].sort(() => Math.random() - 0.5)
const plain = text => String(text || '').replace(/\*\*/g, '')
// Questions were imported from PDFs with hard line wraps: join single newlines, keep paragraphs
const unwrap = text => plain(text).replace(/([^\n])\n(?!\n)/g, '$1 ')

function buildDiagnostic(db) {
  const usable = db.filter(q => q.correctAnswer && (q.choices || []).length >= 4)
  const picked = []
  for (const area of AREAS) {
    const pool = usable.filter(q => area.topics.includes(q.topic))
    picked.push(...shuffle(pool).slice(0, area.qty).map(q => ({ ...q, area: area.name })))
  }
  return picked
}

const card = { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 20 }
const primaryBtn = {
  backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: 10,
  fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8
}

export default function EnsayoGratis() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [questions, setQuestions] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const [started, setStarted] = useState(false)
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState({})

  usePageSeo({
    title: 'Ensayo EUNACOM Gratis 2026 | Diagnóstico de 30 Preguntas con Resultado al Instante',
    description: 'Haz gratis un ensayo EUNACOM de 30 preguntas tipo examen, sin registrarte. Conoce tu puntaje proyectado, tus áreas débiles y si hoy aprobarías el EUNACOM-ST.',
    canonical: 'https://www.eunacomapp.cl/ensayo-gratis'
  })

  useEffect(() => {
    window.scrollTo(0, 0)
    getQuestionDB()
      .then(db => setQuestions(buildDiagnostic(db)))
      .catch(err => setLoadError(err.message || String(err)))
  }, [])

  const finished = questions && index >= questions.length
  const current = questions && !finished ? questions[index] : null
  const picked = current ? answers[current.id] : null

  const result = useMemo(() => {
    if (!finished) return null
    const byArea = AREAS.map(area => {
      const qs = questions.filter(q => q.area === area.name)
      const correct = qs.filter(q => answers[q.id] === q.correctAnswer).length
      return { name: area.name, correct, total: qs.length, pct: qs.length ? Math.round((correct / qs.length) * 100) : 0 }
    })
    const correct = byArea.reduce((s, a) => s + a.correct, 0)
    const score = Math.round((correct / questions.length) * 100)
    const weakest = [...byArea].filter(a => a.total).sort((a, b) => a.pct - b.pct).slice(0, 2)
    return { score, correct, total: questions.length, byArea, weakest }
  }, [finished, questions, answers])

  useEffect(() => {
    if (!result) return
    try {
      localStorage.setItem(RESULT_KEY, JSON.stringify({ ...result, at: new Date().toISOString() }))
    } catch {}
  }, [result])

  const pageStyle = { backgroundColor: '#f8fafc', color: '#0f172a', fontFamily: 'Lexend, -apple-system, sans-serif', minHeight: '100vh' }
  const wrap = { maxWidth: 760, margin: '0 auto', padding: '24px 16px 64px' }

  const header = (
    <header style={{ background: '#fff', borderBottom: '1px solid #e2e8f0' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 16px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: '#0f172a', fontWeight: 800 }}>
          <img src="/logo.png" alt="Eunacom App" style={{ width: 30, height: 30, borderRadius: 8 }} />
          EUNACOM APP
        </Link>
        {questions && started && !finished && (
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>{index + 1} / {questions.length}</span>
        )}
      </div>
    </header>
  )

  if (!started) {
    return (
      <div style={pageStyle}>
        {header}
        <main style={wrap}>
          <h1 style={{ fontSize: '1.9rem', lineHeight: 1.2, margin: '12px 0', color: '#0f172a' }}>Ensayo EUNACOM gratis: ¿aprobarías hoy?</h1>
          <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.6 }}>
            30 preguntas tipo examen con la distribución del EUNACOM-ST. Sin registro y sin tarjeta.
            Al terminar ves tu puntaje proyectado, tus áreas más débiles y la explicación de cada respuesta.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, margin: '20px 0' }}>
            {[[Clock, '~25 minutos'], [Target, `Aprobación: ${PASS_MARK}%`], [BarChart3, 'Resultado por área']].map(([Icon, label]) => (
              <div key={label} style={{ ...card, display: 'flex', alignItems: 'center', gap: 10, padding: 14 }}>
                <Icon size={20} color="#0284c7" /> <strong style={{ fontSize: '0.92rem' }}>{label}</strong>
              </div>
            ))}
          </div>
          {loadError && <p style={{ color: '#dc2626' }}>No pudimos cargar las preguntas. Recarga la página.</p>}
          <button style={{ ...primaryBtn, opacity: questions ? 1 : 0.6 }} disabled={!questions} onClick={() => setStarted(true)}>
            {questions ? 'Comenzar ensayo gratis' : 'Cargando preguntas…'} <ArrowRight size={18} />
          </button>
        </main>
      </div>
    )
  }

  if (finished && result) {
    const passes = result.score >= PASS_MARK
    return (
      <div style={pageStyle}>
        {header}
        <main style={wrap}>
          <div style={{ ...card, textAlign: 'center' }}>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Tu puntaje proyectado</div>
            <div style={{ fontSize: '3.2rem', fontWeight: 800, color: passes ? '#16a34a' : '#dc2626' }}>{result.score}%</div>
            <div style={{ color: '#475569' }}>{result.correct} de {result.total} correctas · aprobación {PASS_MARK}%</div>
            <p style={{ marginTop: 12, fontWeight: 600 }}>
              {passes
                ? 'Hoy estarías sobre el puntaje de aprobación. Ahora toca asegurar el margen con simulacros completos de 180 preguntas.'
                : `Hoy estarías ${PASS_MARK - result.score} puntos bajo la aprobación. Con un plan enfocado en tus áreas débiles se puede revertir.`}
            </p>
          </div>

          <h2 style={{ fontSize: '1.2rem', margin: '24px 0 10px', color: '#0f172a' }}>Resultado por área</h2>
          <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {result.byArea.map(a => (
              <div key={a.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', fontWeight: 600 }}>
                  <span>{a.name}</span><span>{a.correct}/{a.total}</span>
                </div>
                <div style={{ height: 8, background: '#e2e8f0', borderRadius: 4, marginTop: 4 }}>
                  <div style={{ width: `${a.pct}%`, height: '100%', borderRadius: 4, background: a.pct >= PASS_MARK ? '#16a34a' : '#f59e0b' }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ ...card, marginTop: 20, background: '#0f172a', color: '#fff', border: 'none' }}>
            <h2 style={{ fontSize: '1.2rem', margin: 0, color: '#fff' }}>Tu foco: {result.weakest.map(a => a.name).join(' y ')}</h2>
            <p style={{ color: '#cbd5e1', lineHeight: 1.6 }}>
              {user
                ? 'Sigue practicando estas áreas en tu panel, con clases en video y simulacros completos.'
                : 'Crea tu cuenta gratis para guardar este resultado y recibir un plan de estudio hasta tu fecha de examen, con +10.000 preguntas, +650 clases y reconstrucciones.'}
            </p>
            <button style={primaryBtn} onClick={() => navigate(user ? '/dashboard' : '/register?from=ensayo-gratis')}>
              {user ? 'Ir a mi panel' : 'Guardar mi resultado gratis'} <ArrowRight size={18} />
            </button>
          </div>
        </main>
      </div>
    )
  }

  if (!current) return null

  return (
    <div style={pageStyle}>
      {header}
      <main style={wrap}>
        <div style={{ height: 6, background: '#e2e8f0', borderRadius: 3, marginBottom: 16 }}>
          <div style={{ width: `${(index / questions.length) * 100}%`, height: '100%', background: '#0284c7', borderRadius: 3 }} />
        </div>
        <div style={{ fontSize: '0.8rem', color: '#0284c7', fontWeight: 700, marginBottom: 8 }}>{current.area}</div>
        <div style={card}>
          <p style={{ whiteSpace: 'pre-line', lineHeight: 1.6, marginTop: 0, fontSize: '1.02rem' }}>{unwrap(current.question)}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {current.choices.map(choice => {
              const isCorrect = choice.id === current.correctAnswer
              const isPicked = choice.id === picked
              let border = '#e2e8f0', bg = '#fff'
              if (picked && isCorrect) { border = '#16a34a'; bg = '#f0fdf4' }
              else if (isPicked) { border = '#dc2626'; bg = '#fef2f2' }
              return (
                <button
                  key={choice.id}
                  disabled={!!picked}
                  onClick={() => setAnswers(a => ({ ...a, [current.id]: choice.id }))}
                  style={{
                    textAlign: 'left', padding: '12px 14px', borderRadius: 10, border: `2px solid ${border}`, background: bg,
                    cursor: picked ? 'default' : 'pointer', fontSize: '0.95rem', color: '#0f172a', display: 'flex', gap: 10, alignItems: 'flex-start'
                  }}
                >
                  <strong>{choice.id}.</strong>
                  <span style={{ flex: 1 }}>{plain(choice.text)}</span>
                  {picked && isCorrect && <CheckCircle2 size={18} color="#16a34a" />}
                  {isPicked && !isCorrect && <XCircle size={18} color="#dc2626" />}
                </button>
              )
            })}
          </div>
          {picked && current.explanation && (
            <div style={{ marginTop: 14, padding: 14, background: '#f1f5f9', borderRadius: 10, whiteSpace: 'pre-line', lineHeight: 1.55, fontSize: '0.92rem', color: '#334155' }}>
              {plain(current.explanation)}
            </div>
          )}
        </div>
        {picked && (
          <div style={{ marginTop: 16, textAlign: 'right' }}>
            <button style={primaryBtn} onClick={() => { setIndex(i => i + 1); window.scrollTo(0, 0) }}>
              {index + 1 === questions.length ? 'Ver mi resultado' : 'Siguiente'} <ArrowRight size={18} />
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
