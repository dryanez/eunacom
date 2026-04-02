import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { fetchClases, saveClase, deleteClase, genId } from '../lib/api'
import {
  Video, ChevronRight, ChevronLeft, BookOpen, HelpCircle, Trash2,
  Upload, CheckCircle2, XCircle, ArrowRight, ArrowLeft, Lightbulb,
  Target, Award, RotateCcw
} from 'lucide-react'

/* ─── Step Progress Bar ─── */
function StepBar({ steps, current, onStep }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: '2rem' }}>
      {steps.map((s, i) => {
        const isActive = i === current
        const isDone = i < current
        return (
          <React.Fragment key={s.id}>
            {i > 0 && (
              <div style={{
                flex: 1, height: 2, margin: '0 -1px',
                background: isDone ? 'var(--primary-500)' : 'var(--border-color)',
                transition: 'background 0.3s'
              }} />
            )}
            <button onClick={() => onStep(i)} style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.6rem 1.2rem', borderRadius: '50px', border: 'none', cursor: 'pointer',
              fontSize: '0.82rem', fontWeight: 600, whiteSpace: 'nowrap',
              background: isActive ? 'var(--primary-500)' : isDone ? 'rgba(19,91,236,0.15)' : 'var(--surface-700)',
              color: isActive ? '#fff' : isDone ? 'var(--primary-500)' : 'var(--text-tertiary)',
              transition: 'all 0.3s', transform: isActive ? 'scale(1.05)' : 'scale(1)',
              boxShadow: isActive ? '0 4px 12px rgba(19,91,236,0.3)' : 'none',
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%', fontSize: '0.7rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isActive ? 'rgba(255,255,255,0.25)' : isDone ? 'var(--primary-500)' : 'var(--surface-600)',
                color: isActive || isDone ? '#fff' : 'var(--text-tertiary)',
              }}>
                {isDone ? <CheckCircle2 size={13} /> : i + 1}
              </div>
              {s.label}
            </button>
          </React.Fragment>
        )
      })}
    </div>
  )
}

/* ─── Bold keywords helper ─── */
function BoldText({ text }) {
  // Bold text between ** ** and terms after : or terms in ALL CAPS
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ color: 'var(--text-primary)' }}>{part.slice(2, -2)}</strong>
    }
    // Bold medical terms (words before colons, and key patterns)
    return <span key={i}>{part}</span>
  })
}

/* ─── Resumen Section ─── */
function ResumenSection({ summary }) {
  const paragraphs = summary.split('\n').filter(p => p.trim())
  return (
    <div className="card" style={{ padding: '2rem', borderLeft: '4px solid var(--primary-500)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8, background: 'rgba(19,91,236,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <BookOpen size={17} style={{ color: 'var(--primary-500)' }} />
        </div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Resumen de la Clase</h3>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {paragraphs.map((p, i) => (
          <p key={i} style={{
            fontSize: '0.93rem', lineHeight: 1.8, color: 'var(--text-secondary)',
            paddingLeft: i > 0 ? '0' : '0',
          }}>
            <BoldText text={p} />
          </p>
        ))}
      </div>
    </div>
  )
}

/* ─── Puntos Clave Section ─── */
function PuntosClaveSection({ keyPoints }) {
  const colors = [
    { bg: 'rgba(19,91,236,0.08)', border: 'rgba(19,91,236,0.2)', icon: 'var(--primary-500)' },
    { bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.2)', icon: 'var(--success-500)' },
    { bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.2)', icon: '#f59e0b' },
    { bg: 'rgba(168,85,247,0.08)', border: 'rgba(168,85,247,0.2)', icon: '#a855f7' },
    { bg: 'rgba(236,72,153,0.08)', border: 'rgba(236,72,153,0.2)', icon: '#ec4899' },
  ]
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8, background: 'rgba(251,191,36,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Lightbulb size={17} style={{ color: '#f59e0b' }} />
        </div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Puntos Clave para Memorizar</h3>
      </div>
      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {keyPoints.map((point, i) => {
          const c = colors[i % colors.length]
          return (
            <div key={i} className="card" style={{
              padding: '1.1rem 1.25rem', display: 'flex', alignItems: 'flex-start', gap: '1rem',
              background: c.bg, borderLeft: `3px solid ${c.border}`,
              transition: 'transform 0.2s',
            }}>
              <div style={{
                minWidth: 28, height: 28, borderRadius: '50%', background: c.border,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: 700, color: c.icon, flexShrink: 0
              }}>
                {i + 1}
              </div>
              <span style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-primary)', fontWeight: 500 }}>
                <BoldText text={point} />
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Quiz Section — One question at a time ─── */
function QuizSection({ quiz }) {
  const [currentQ, setCurrentQ] = useState(0)
  const [selected, setSelected] = useState({})
  const [showScore, setShowScore] = useState(false)

  const total = quiz.length
  const q = quiz[currentQ]
  const picked = selected[currentQ]
  const answered = !!picked

  const correctCount = Object.entries(selected).filter(
    ([qi, optId]) => quiz[Number(qi)]?.options.find(o => o.id === optId)?.isCorrect
  ).length

  const allAnswered = Object.keys(selected).length === total

  const handleSelect = (optId) => {
    if (answered) return
    setSelected(prev => ({ ...prev, [currentQ]: optId }))
  }

  const goNext = () => {
    if (currentQ < total - 1) setCurrentQ(currentQ + 1)
    else if (allAnswered) setShowScore(true)
  }
  const goPrev = () => { if (currentQ > 0) setCurrentQ(currentQ - 1) }

  const resetQuiz = () => {
    setSelected({})
    setCurrentQ(0)
    setShowScore(false)
  }

  const questionColors = [
    { accent: '#3b82f6', bg: 'rgba(59,130,246,0.06)' },
    { accent: '#8b5cf6', bg: 'rgba(139,92,246,0.06)' },
    { accent: '#ec4899', bg: 'rgba(236,72,153,0.06)' },
    { accent: '#f59e0b', bg: 'rgba(245,158,11,0.06)' },
    { accent: '#10b981', bg: 'rgba(16,185,129,0.06)' },
  ]
  const qColor = questionColors[currentQ % questionColors.length]

  if (showScore) {
    const pct = Math.round((correctCount / total) * 100)
    const emoji = pct >= 80 ? 'Excelente' : pct >= 60 ? 'Bien' : 'Sigue practicando'
    return (
      <div className="card" style={{
        padding: '3rem 2rem', textAlign: 'center',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem'
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: pct >= 60 ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Award size={36} style={{ color: pct >= 60 ? 'var(--success-500)' : 'var(--danger-500)' }} />
        </div>
        <div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{pct}%</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{emoji}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
            {correctCount} de {total} correctas
          </div>
        </div>
        <button onClick={resetQuiz} style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.7rem 1.5rem', borderRadius: '10px', border: 'none',
          background: 'var(--primary-500)', color: '#fff', cursor: 'pointer',
          fontSize: '0.9rem', fontWeight: 600
        }}>
          <RotateCcw size={16} /> Reintentar Quiz
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Progress dots */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <Target size={17} style={{ color: qColor.accent }} />
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          Pregunta {currentQ + 1} de {total}
        </span>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          {quiz.map((_, i) => {
            const s = selected[i]
            const isCorrect = s && quiz[i].options.find(o => o.id === s)?.isCorrect
            return (
              <div key={i} onClick={() => setCurrentQ(i)} style={{
                width: i === currentQ ? 24 : 10, height: 10, borderRadius: 5,
                cursor: 'pointer', transition: 'all 0.3s',
                background: !s ? (i === currentQ ? qColor.accent : 'var(--surface-600)')
                  : isCorrect ? 'var(--success-500)' : 'var(--danger-500)',
              }} />
            )
          })}
        </div>
      </div>

      {/* Question card */}
      <div className="card" style={{
        padding: '2rem', borderTop: `3px solid ${qColor.accent}`,
        background: qColor.bg,
      }}>
        <p style={{
          fontWeight: 700, fontSize: '1.05rem', marginBottom: '1.5rem',
          lineHeight: 1.6, color: 'var(--text-primary)'
        }}>
          {q.questionText}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {q.options.map(opt => {
            const isSelected = picked === opt.id
            const isCorrect = opt.isCorrect
            let bg = 'var(--surface-700)'
            let border = 'var(--border-color)'
            let leftBar = 'transparent'
            if (answered) {
              if (isCorrect) { bg = 'rgba(52,211,153,0.12)'; border = 'var(--success-500)'; leftBar = 'var(--success-500)' }
              else if (isSelected) { bg = 'rgba(248,113,113,0.12)'; border = 'var(--danger-500)'; leftBar = 'var(--danger-500)' }
              else { bg = 'var(--surface-800)' }
            }
            return (
              <div key={opt.id}>
                <button
                  onClick={() => handleSelect(opt.id)}
                  disabled={answered}
                  style={{
                    width: '100%', textAlign: 'left', padding: '0.9rem 1.1rem',
                    background: bg, border: `1px solid ${border}`,
                    borderLeft: `4px solid ${leftBar}`,
                    borderRadius: '10px', color: 'var(--text-primary)',
                    cursor: answered ? 'default' : 'pointer',
                    opacity: answered && !isCorrect && !isSelected ? 0.4 : 1,
                    transition: 'all 0.2s', fontSize: '0.9rem',
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                  }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.8rem', fontWeight: 700,
                    background: isSelected && answered
                      ? (isCorrect ? 'var(--success-500)' : 'var(--danger-500)')
                      : answered && isCorrect ? 'var(--success-500)'
                      : `${qColor.accent}22`,
                    color: (answered && (isSelected || isCorrect)) ? '#fff' : qColor.accent,
                  }}>
                    {answered && isCorrect ? <CheckCircle2 size={15} /> :
                     answered && isSelected ? <XCircle size={15} /> : opt.id}
                  </div>
                  <span>{opt.text}</span>
                </button>
                {answered && (isSelected || isCorrect) && (
                  <div style={{
                    padding: '0.75rem 1rem', marginTop: '0.4rem', borderRadius: '8px',
                    marginLeft: '2.5rem', fontSize: '0.83rem', lineHeight: 1.6,
                    background: isCorrect ? 'rgba(52,211,153,0.08)' : 'rgba(248,113,113,0.08)',
                    color: isCorrect ? 'var(--success-500)' : 'var(--danger-500)',
                    borderLeft: `3px solid ${isCorrect ? 'var(--success-500)' : 'var(--danger-500)'}`,
                  }}>
                    <strong>{isCorrect ? 'Correcto' : 'Incorrecto'}:</strong> {opt.explanation}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Nav buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.25rem' }}>
        <button onClick={goPrev} disabled={currentQ === 0} style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          padding: '0.6rem 1.2rem', borderRadius: '10px',
          border: '1px solid var(--border-color)', background: 'var(--surface-700)',
          color: currentQ === 0 ? 'var(--text-tertiary)' : 'var(--text-primary)',
          cursor: currentQ === 0 ? 'default' : 'pointer', fontSize: '0.85rem', fontWeight: 600,
          opacity: currentQ === 0 ? 0.5 : 1,
        }}>
          <ArrowLeft size={16} /> Anterior
        </button>
        <button onClick={goNext} disabled={!answered} style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          padding: '0.6rem 1.2rem', borderRadius: '10px', border: 'none',
          background: answered ? 'var(--primary-500)' : 'var(--surface-600)',
          color: answered ? '#fff' : 'var(--text-tertiary)',
          cursor: answered ? 'pointer' : 'default', fontSize: '0.85rem', fontWeight: 600,
          boxShadow: answered ? '0 2px 8px rgba(19,91,236,0.3)' : 'none',
        }}>
          {currentQ === total - 1 && allAnswered ? 'Ver Resultado' : 'Siguiente'} <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}

/* ─── Single Class Detail View ─── */
function ClaseDetail({ clase, onBack, onDelete }) {
  const [step, setStep] = useState(0)
  const steps = [
    { id: 'resumen', label: 'Resumen', icon: BookOpen },
    { id: 'puntos', label: 'Puntos Clave', icon: Lightbulb },
    { id: 'quiz', label: 'Quiz EUNACOM', icon: HelpCircle },
  ]

  const goNext = () => { if (step < 2) setStep(step + 1) }
  const goPrev = () => { if (step > 0) setStep(step - 1) }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <button onClick={onBack} style={{
          background: 'var(--surface-700)', border: '1px solid var(--border-color)',
          borderRadius: '10px', padding: '0.5rem 1rem', color: 'var(--text-primary)',
          cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem'
        }}>
          <ChevronLeft size={16} /> Mis Clases
        </button>
        <button onClick={() => onDelete(clase.id)} style={{
          background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)',
          borderRadius: '10px', padding: '0.5rem 1rem', color: 'var(--danger-500)',
          cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem'
        }}>
          <Trash2 size={14} /> Eliminar
        </button>
      </div>

      {/* Header card */}
      <div className="card" style={{
        padding: '1.5rem 1.75rem', marginBottom: '1.5rem',
        background: 'linear-gradient(135deg, rgba(19,91,236,0.06) 0%, rgba(168,85,247,0.06) 100%)',
        borderLeft: '4px solid var(--primary-500)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: 'rgba(19,91,236,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Video size={18} style={{ color: 'var(--primary-500)' }} />
          </div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>{clase.topic}</h2>
        </div>
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-tertiary)', paddingLeft: '2.8rem' }}>
          <span>{new Date(clase.savedAt).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          {clase.quiz?.length > 0 && <span>{clase.quiz.length} preguntas</span>}
          {clase.keyPoints?.length > 0 && <span>{clase.keyPoints.length} puntos clave</span>}
        </div>
      </div>

      {/* Step navigation */}
      <StepBar steps={steps} current={step} onStep={setStep} />

      {/* Content */}
      {step === 0 && <ResumenSection summary={clase.summary} />}
      {step === 1 && <PuntosClaveSection keyPoints={clase.keyPoints} />}
      {step === 2 && clase.quiz?.length > 0 && <QuizSection quiz={clase.quiz} />}

      {/* Section nav arrows */}
      {step < 2 && (
        <div style={{ display: 'flex', justifyContent: step === 0 ? 'flex-end' : 'space-between', marginTop: '1.5rem' }}>
          {step > 0 && (
            <button onClick={goPrev} style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.7rem 1.3rem', borderRadius: '10px',
              border: '1px solid var(--border-color)', background: 'var(--surface-700)',
              color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
            }}>
              <ArrowLeft size={16} /> {steps[step - 1].label}
            </button>
          )}
          <button onClick={goNext} style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.7rem 1.3rem', borderRadius: '10px', border: 'none',
            background: 'var(--primary-500)', color: '#fff', cursor: 'pointer',
            fontSize: '0.85rem', fontWeight: 600,
            boxShadow: '0 2px 8px rgba(19,91,236,0.3)',
          }}>
            {steps[step + 1].label} <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}

/* ─── Main Page ─── */
const MisClases = () => {
  const { user } = useAuth()
  const [clases, setClases] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState(null)
  const fileInputRef = useRef(null)

  const loadData = async () => {
    if (!user) return
    try {
      const rows = await fetchClases(user.id)
      setClases(rows.map(r => ({
        id: r.id,
        savedAt: r.saved_at,
        topic: r.topic,
        summary: r.summary || '',
        keyPoints: typeof r.key_points === 'string' ? JSON.parse(r.key_points) : (r.key_points || []),
        quiz: typeof r.quiz === 'string' ? JSON.parse(r.quiz) : (r.quiz || []),
      })))
    } catch (err) {
      console.error('Error loading clases:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user])

  const handleImport = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const data = JSON.parse(reader.result)
        const id = genId()
        await saveClase({
          id,
          userId: user.id,
          topic: data.topic || 'Sin título',
          summary: data.summary || '',
          keyPoints: data.keyPoints || [],
          quiz: data.quiz || [],
        })
        await loadData()
        setSelectedId(id)
      } catch {
        alert('Error: el archivo no tiene el formato correcto.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleDelete = async (id) => {
    try {
      await deleteClase(id)
      setClases(prev => prev.filter(c => c.id !== id))
      setSelectedId(null)
    } catch (err) {
      console.error('Error deleting clase:', err)
    }
  }

  const selectedClase = clases.find(c => c.id === selectedId)

  if (selectedClase) {
    return (
      <div style={{ paddingBottom: '2rem' }}>
        <ClaseDetail
          clase={selectedClase}
          onBack={() => setSelectedId(null)}
          onDelete={handleDelete}
        />
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
        Cargando clases...
      </div>
    )
  }

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
        <h1 className="page__title">Mis Clases</h1>
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            background: 'var(--primary-500)', border: 'none', borderRadius: '10px',
            padding: '0.6rem 1.2rem', color: '#fff', cursor: 'pointer',
            fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem'
          }}
        >
          <Upload size={16} /> Importar Clase
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          style={{ display: 'none' }}
        />
      </div>
      <p className="page__subtitle" style={{ marginBottom: '1.5rem' }}>
        Resúmenes, puntos clave y preguntas EUNACOM generados desde tus videos con MedScribe.
      </p>

      {clases.length === 0 ? (
        <div className="card" style={{
          padding: '3rem 2rem', textAlign: 'center',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem'
        }}>
          <Video size={48} style={{ color: 'var(--text-tertiary)', opacity: 0.5 }} />
          <div>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
              No tienes clases guardadas
            </p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)', maxWidth: 400 }}>
              Usa MedScribe para analizar un video de clase y guarda los resultados aquí como archivo JSON.
            </p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              marginTop: '0.5rem', background: 'var(--surface-700)', border: '1px solid var(--border-color)',
              borderRadius: '10px', padding: '0.7rem 1.5rem', color: 'var(--text-primary)',
              cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500
            }}
          >
            Importar archivo JSON
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {clases.map(clase => (
            <div
              key={clase.id}
              className="card"
              onClick={() => setSelectedId(clase.id)}
              style={{
                padding: '1.25rem 1.5rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                transition: 'all 0.2s', borderLeft: '3px solid var(--primary-500)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 10,
                  background: 'rgba(19,91,236,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <Video size={20} style={{ color: 'var(--primary-500)' }} />
                </div>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {clase.topic}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '0.15rem' }}>
                    {new Date(clase.savedAt).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {clase.quiz?.length > 0 && ` · ${clase.quiz.length} preguntas`}
                    {clase.keyPoints?.length > 0 && ` · ${clase.keyPoints.length} puntos clave`}
                  </div>
                </div>
              </div>
              <ChevronRight size={18} style={{ color: 'var(--text-tertiary)' }} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MisClases
