import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { createTest, genId, fetchProgress } from '../lib/api'
import { Stethoscope, PlayCircle, CheckCircle2, Clock, FileText, AlertCircle, ChevronRight } from 'lucide-react'

const LETTERS = ['A', 'B', 'C', 'D', 'E']

/**
 * Convert a reconstruction JSON question to the TestRunner format.
 * Supports both formats:
 *   ES: { id, pregunta, opciones: [], respuesta_correcta, explicacion }
 *   EN: { id, question, options: [], correctAnswer, explanation }
 */
function toTestRunnerFormat(q, examId) {
  // Support both Spanish (old) and English (new) field names
  const rawOptions = q.options || q.opciones || []
  const choices = rawOptions.map((text, i) => ({
    id: LETTERS[i] || String(i),
    text
  }))

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
    id: `${examId}_q${q.id}`,
    question: q.question || q.pregunta,
    choices,
    correctAnswer,
    explanation: q.explanation || q.explicacion || q.respuesta_texto || ''
  }
}

const Reconstructions = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [index, setIndex] = useState(null)
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(null) // exam id being started
  const [userProgress, setUserProgress] = useState({})
  const [examResults, setExamResults] = useState({}) // examId -> {total, correct, pct}

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/data/reconstrucciones/index.json')
      const data = await res.json()
      setIndex(data)

      // Load user progress to show completion status
      if (user) {
        const progress = await fetchProgress(user.id)
        const pMap = {}
        progress.forEach(p => {
          pMap[p.question_id] = p
        })
        setUserProgress(pMap)

        // Calculate per-exam results from progress
        const results = {}
        for (const exam of data.exams) {
          let total = 0, correct = 0
          for (let i = 1; i <= exam.total_questions; i++) {
            const qid = `${exam.id}_q${i}`
            if (pMap[qid]) {
              total++
              if (pMap[qid].is_correct) correct++
            }
          }
          if (total > 0) {
            results[exam.id] = {
              answered: total,
              correct,
              pct: Math.round((correct / total) * 100)
            }
          }
        }
        setExamResults(results)
      }
    } catch (e) {
      console.error('Error loading reconstructions:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleStartExam = async (exam) => {
    if (!user) {
      alert('Debes iniciar sesión para comenzar un examen.')
      return
    }
    setStarting(exam.id)
    try {
      // Load exam questions
      const res = await fetch(`/data/reconstrucciones/${exam.file}`)
      const data = await res.json()

      // Filter to questions that have choices (at least 2 options)
      const validQuestions = data.questions.filter(
        q => q.opciones && q.opciones.length >= 2
      )

      if (validQuestions.length === 0) {
        alert('Este examen no tiene preguntas con alternativas disponibles aún.')
        setStarting(null)
        return
      }

      // Convert to TestRunner format
      const questions = validQuestions.map(q => toTestRunnerFormat(q, exam.id))

      // Create test record
      const testId = genId()
      await createTest({
        id: testId,
        userId: user.id,
        mode: 'tutor',
        timeLimitSeconds: 0,
        totalQuestions: questions.length,
        questions: questions.map(q => q.id)
      })

      navigate('/test-runner', {
        state: {
          testId,
          questions,
          isReconstruction: true,
          examName: exam.name
        }
      })
    } catch (e) {
      console.error('Error starting exam:', e)
      alert('Error al cargar el examen: ' + (e.message || String(e)))
    } finally {
      setStarting(null)
    }
  }

  if (loading) {
    return (
      <div className="page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="spinner" />
      </div>
    )
  }

  if (!index || !index.exams?.length) {
    return (
      <div className="page">
        <h1 className="page__title">Reconstrucciones EUNACOM</h1>
        <p style={{ color: 'var(--surface-400)' }}>No hay reconstrucciones disponibles.</p>
      </div>
    )
  }

  // Group exams by year
  const examsByYear = {}
  index.exams.forEach(e => {
    if (!examsByYear[e.year]) examsByYear[e.year] = []
    examsByYear[e.year].push(e)
  })
  const years = Object.keys(examsByYear).sort((a, b) => Number(b) - Number(a))

  return (
    <div className="page" style={{ paddingBottom: '3rem' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 className="page__title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Stethoscope size={28} />
            Reconstrucciones EUNACOM
          </h1>
          <p style={{ color: 'var(--surface-400)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Practica con exámenes EUNACOM reales reconstruidos ({index.total_exams} exámenes, {index.total_questions.toLocaleString()} preguntas)
          </p>
        </div>

        {/* Stats bar */}
        <div style={{
          display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap'
        }}>
          <StatCard
            icon={<FileText size={18} />}
            label="Exámenes"
            value={index.total_exams}
            color="var(--primary-400)"
          />
          <StatCard
            icon={<AlertCircle size={18} />}
            label="Preguntas"
            value={index.total_questions.toLocaleString()}
            color="var(--accent-amber)"
          />
          <StatCard
            icon={<CheckCircle2 size={18} />}
            label="Completados"
            value={Object.keys(examResults).length}
            color="var(--accent-green)"
          />
        </div>

        {/* Exams list by year */}
        {years.map(year => (
          <div key={year} style={{ marginBottom: '1.5rem' }}>
            <h2 style={{
              fontSize: '1.1rem',
              fontWeight: 700,
              color: 'var(--surface-200)',
              marginBottom: '0.75rem',
              paddingBottom: '0.5rem',
              borderBottom: '1px solid var(--surface-700)'
            }}>
              {year}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {examsByYear[year].map(exam => (
                <ExamCard
                  key={exam.id}
                  exam={exam}
                  result={examResults[exam.id]}
                  isStarting={starting === exam.id}
                  onStart={() => handleStartExam(exam)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Sub-components ─── */

function StatCard({ icon, label, value, color }) {
  return (
    <div style={{
      flex: '1 1 120px',
      background: 'var(--surface-800)',
      borderRadius: 'var(--radius)',
      padding: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      border: '1px solid var(--surface-700)'
    }}>
      <div style={{ color }}>{icon}</div>
      <div>
        <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--surface-100)' }}>{value}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--surface-400)' }}>{label}</div>
      </div>
    </div>
  )
}

function ExamCard({ exam, result, isStarting, onStart }) {
  const hasAnswers = exam.questions_with_answers > 0
  const totalUsable = exam.total_questions // even without answers, user can still practice
  const pct = result?.pct

  return (
    <div
      style={{
        background: 'var(--surface-800)',
        borderRadius: 'var(--radius)',
        padding: '1rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        border: `1px solid ${result ? 'var(--surface-600)' : 'var(--surface-700)'}`,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
      onClick={onStart}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary-400)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = result ? 'var(--surface-600)' : 'var(--surface-700)'; e.currentTarget.style.transform = 'none' }}
    >
      {/* Left: exam info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--surface-100)' }}>
            {exam.name}
          </span>
          {!hasAnswers && (
            <span style={{
              fontSize: '0.65rem',
              padding: '0.15rem 0.5rem',
              borderRadius: '999px',
              background: 'rgba(251,191,36,0.15)',
              color: 'var(--accent-amber)',
              whiteSpace: 'nowrap'
            }}>
              Sin pauta
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem', color: 'var(--surface-400)' }}>
          <span>{exam.total_questions} preguntas</span>
          {exam.month && <span>{exam.month} {exam.year}</span>}
          {hasAnswers && (
            <span style={{ color: 'var(--accent-green)' }}>
              {exam.questions_with_answers} con respuesta
            </span>
          )}
        </div>

        {/* Progress bar if attempted */}
        {result && (
          <div style={{ marginTop: '0.5rem' }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontSize: '0.72rem', color: 'var(--surface-400)', marginBottom: '0.25rem'
            }}>
              <span>{result.correct}/{result.answered} correctas</span>
              <span style={{ color: pct >= 60 ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 700 }}>
                {pct}%
              </span>
            </div>
            <div style={{
              height: 4, borderRadius: 2,
              background: 'var(--surface-700)',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${pct}%`,
                borderRadius: 2,
                background: pct >= 60 ? 'var(--accent-green)' : 'var(--accent-red)',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        )}
      </div>

      {/* Right: start button */}
      <div style={{ flexShrink: 0 }}>
        {isStarting ? (
          <div className="spinner" style={{ width: 24, height: 24 }} />
        ) : (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.3rem',
            color: 'var(--primary-400)', fontSize: '0.85rem', fontWeight: 600
          }}>
            {result ? 'Repetir' : 'Iniciar'}
            <ChevronRight size={16} />
          </div>
        )}
      </div>
    </div>
  )
}

export default Reconstructions
