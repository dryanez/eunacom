import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { fetchClases, fetchClase, fetchPerfil, fetchClaseProgress, saveClaseProgress, fetchEunacomQuestions } from '../lib/api'
import { getVideoUrl } from '../lib/videoMap'
import VideoPlayer from '../components/VideoPlayer'
import {
  Video, ChevronRight, ChevronLeft, BookOpen, HelpCircle,
  CheckCircle2, XCircle, ArrowRight, ArrowLeft, Lightbulb,
  Target, Award, RotateCcw, FolderOpen, Folder, FileText, Stethoscope,
  Presentation, Play, ClipboardList, BarChart3, Trophy, Clock, Hash,
  HeartPulse, Brain, Droplets, FlaskConical, Wind, Bone, Microscope,
  Eye, Ear, Baby, Scissors, Pill, Syringe, Activity, Shield,
  Hospital, Ambulance, Thermometer, Dna, Ribbon, Scale, Beaker,
  TestTubes, ScanHeart, Cross, Tablets, PersonStanding, Sparkles, Zap
} from 'lucide-react'

/* ════════════════════════════════════════════════════════════════
   PROGRESS RING
   ════════════════════════════════════════════════════════════════ */
function ProgressRing({ percent, size = 32, stroke = 3 }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (percent / 100) * circ
  const color = percent >= 100 ? '#10b981' : percent > 0 ? '#f59e0b' : 'var(--surface-500)'
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--surface-600)" strokeWidth={stroke} />
      {percent > 0 && <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.5s' }} />}
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central" style={{ transform: 'rotate(90deg)', transformOrigin: 'center', fontSize: size * 0.3, fontWeight: 700, fill: color }}>{percent}%</text>
    </svg>
  )
}

/* ════════════════════════════════════════════════════════════════
   STEP PROGRESS BAR
   ════════════════════════════════════════════════════════════════ */
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

/* ════════════════════════════════════════════════════════════════
   BOLD TEXT HELPER
   ════════════════════════════════════════════════════════════════ */
function BoldText({ text, onNavigate }) {
  // Parse **bold** and [[wiki links]]
  const parts = text.split(/(\*\*[^*]+\*\*|\[\[[^\]]+\]\])/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ color: 'var(--text-primary)' }}>{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('[[') && part.endsWith(']]')) {
      const linkText = part.slice(2, -2)
      return (
        <span key={i} onClick={(e) => { e.stopPropagation(); onNavigate?.(linkText) }}
          style={{
            color: 'var(--primary-500)', cursor: onNavigate ? 'pointer' : 'default',
            borderBottom: '1px dashed var(--primary-500)',
            fontWeight: 600, transition: 'opacity 0.2s',
          }}
          title={`Ver: ${linkText}`}
        >
          {linkText}
        </span>
      )
    }
    return <span key={i}>{part}</span>
  })
}

/* ════════════════════════════════════════════════════════════════
   RESUMEN SECTION
   ════════════════════════════════════════════════════════════════ */
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
          <p key={i} style={{ fontSize: '0.93rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
            <BoldText text={p} />
          </p>
        ))}
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   PUNTOS CLAVE SECTION
   ════════════════════════════════════════════════════════════════ */
function PuntosClaveSection({ keyPoints }) {
  const [flipped, setFlipped] = useState({})

  const cardStyles = [
    { gradient: 'linear-gradient(135deg, rgba(59,130,246,0.10) 0%, rgba(59,130,246,0.03) 100%)', accent: '#3b82f6', glow: 'rgba(59,130,246,0.15)' },
    { gradient: 'linear-gradient(135deg, rgba(16,185,129,0.10) 0%, rgba(16,185,129,0.03) 100%)', accent: '#10b981', glow: 'rgba(16,185,129,0.15)' },
    { gradient: 'linear-gradient(135deg, rgba(245,158,11,0.10) 0%, rgba(245,158,11,0.03) 100%)', accent: '#f59e0b', glow: 'rgba(245,158,11,0.15)' },
    { gradient: 'linear-gradient(135deg, rgba(139,92,246,0.10) 0%, rgba(139,92,246,0.03) 100%)', accent: '#8b5cf6', glow: 'rgba(139,92,246,0.15)' },
    { gradient: 'linear-gradient(135deg, rgba(236,72,153,0.10) 0%, rgba(236,72,153,0.03) 100%)', accent: '#ec4899', glow: 'rgba(236,72,153,0.15)' },
    { gradient: 'linear-gradient(135deg, rgba(14,165,233,0.10) 0%, rgba(14,165,233,0.03) 100%)', accent: '#0ea5e9', glow: 'rgba(14,165,233,0.15)' },
    { gradient: 'linear-gradient(135deg, rgba(244,63,94,0.10) 0%, rgba(244,63,94,0.03) 100%)', accent: '#f43f5e', glow: 'rgba(244,63,94,0.15)' },
    { gradient: 'linear-gradient(135deg, rgba(34,197,94,0.10) 0%, rgba(34,197,94,0.03) 100%)', accent: '#22c55e', glow: 'rgba(34,197,94,0.15)' },
  ]

  // Split a point into a "headline" and optional "detail" at the first colon, period, or dash pattern
  const splitPoint = (text) => {
    // Try splitting at patterns like "Word = explanation", "Word: explanation"
    const colonMatch = text.match(/^([^:.=]+[:.=])\s*(.+)$/s)
    if (colonMatch && colonMatch[1].length < 80) {
      return { headline: colonMatch[1].replace(/[:.=]$/, '').trim(), detail: colonMatch[2].trim() }
    }
    // If the text is short enough, it's all headline
    if (text.length < 100) return { headline: text, detail: null }
    // Otherwise split at first sentence
    const sentenceMatch = text.match(/^([^.]+\.)\s*(.+)$/s)
    if (sentenceMatch) return { headline: sentenceMatch[1], detail: sentenceMatch[2] }
    return { headline: text, detail: null }
  }

  const toggleFlip = (i) => setFlipped(prev => ({ ...prev, [i]: !prev[i] }))

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8, background: 'rgba(251,191,36,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Lightbulb size={17} style={{ color: '#f59e0b' }} />
        </div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Puntos Clave</h3>
      </div>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: '1.25rem', marginLeft: '2.75rem' }}>
        Toca una tarjeta para ver el detalle
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '0.85rem',
      }}>
        {keyPoints.map((point, i) => {
          const s = cardStyles[i % cardStyles.length]
          const { headline, detail } = splitPoint(point)
          const isFlipped = flipped[i]

          return (
            <div
              key={i}
              onClick={() => detail && toggleFlip(i)}
              className="card"
              style={{
                padding: 0,
                background: isFlipped ? s.gradient : 'var(--surface-700)',
                border: `1px solid ${isFlipped ? s.accent + '40' : 'var(--border-color)'}`,
                borderRadius: '14px',
                cursor: detail ? 'pointer' : 'default',
                transition: 'all 0.3s ease',
                overflow: 'hidden',
                boxShadow: isFlipped ? `0 4px 20px ${s.glow}` : 'none',
                transform: isFlipped ? 'scale(1.02)' : 'scale(1)',
              }}
            >
              {/* Top accent bar */}
              <div style={{ height: 3, background: s.accent, opacity: isFlipped ? 1 : 0.4, transition: 'opacity 0.3s' }} />

              <div style={{ padding: '1.1rem 1.2rem' }}>
                {/* Number badge + headline */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <div style={{
                    minWidth: 26, height: 26, borderRadius: '8px',
                    background: s.accent + '20',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.72rem', fontWeight: 800, color: s.accent, flexShrink: 0,
                    marginTop: '0.1rem',
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '0.88rem', fontWeight: 700, lineHeight: 1.5,
                      color: 'var(--text-primary)',
                    }}>
                      <BoldText text={headline} />
                    </div>

                    {/* Detail — shown when flipped */}
                    {detail && isFlipped && (
                      <div style={{
                        marginTop: '0.6rem', paddingTop: '0.6rem',
                        borderTop: `1px dashed ${s.accent}30`,
                        fontSize: '0.83rem', lineHeight: 1.7, color: 'var(--text-secondary)',
                        animation: 'fadeIn 0.3s ease',
                      }}>
                        <BoldText text={detail} />
                      </div>
                    )}

                    {/* Expand hint */}
                    {detail && !isFlipped && (
                      <div style={{
                        marginTop: '0.4rem', fontSize: '0.72rem', color: s.accent,
                        opacity: 0.7, fontWeight: 500,
                      }}>
                        ver más →
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Inline animation */}
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   PREGUNTAS EUNACOM — Real past-exam questions for this class
   ════════════════════════════════════════════════════════════════ */
function EunacomQuestionsSection({ claseId, eunacomCode }) {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentQ, setCurrentQ] = useState(0)
  const [selected, setSelected] = useState({})
  const [showScore, setShowScore] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(null)
    setSelected({})
    setCurrentQ(0)
    setShowScore(false)
    const params = claseId ? { claseId } : eunacomCode ? { eunacomCode } : null
    if (!params) { setLoading(false); return }
    fetchEunacomQuestions({ ...params, limit: 50 })
      .then(qs => setQuestions(qs))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [claseId, eunacomCode])

  if (loading) return (
    <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
      Cargando preguntas EUNACOM…
    </div>
  )
  if (error) return (
    <div className="card" style={{ padding: '2rem', color: 'var(--danger-500)' }}>Error: {error}</div>
  )
  if (!questions.length) return (
    <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
      <Target size={36} style={{ color: 'var(--text-tertiary)', marginBottom: '1rem' }} />
      <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
        Sin preguntas EUNACOM para esta clase
      </div>
      <div style={{ fontSize: '0.83rem', color: 'var(--text-tertiary)' }}>
        Las preguntas se asignan por código EUNACOM. Esta clase aún no tiene preguntas de banco asociadas.
      </div>
    </div>
  )

  const total = questions.length
  const q = questions[currentQ]
  const picked = selected[currentQ]
  const answered = !!picked
  const correctCount = Object.entries(selected).filter(([qi, optId]) => {
    const qq = questions[Number(qi)]
    return qq && qq.respuestaCorrecta && optId === qq.respuestaCorrecta
  }).length
  const allAnswered = Object.keys(selected).length === total

  const handleSelect = (optId) => { if (!answered) setSelected(prev => ({ ...prev, [currentQ]: optId })) }
  const goNext = () => { if (currentQ < total - 1) setCurrentQ(q => q + 1); else if (allAnswered) setShowScore(true) }
  const goPrev = () => { if (currentQ > 0) setCurrentQ(q => q - 1) }
  const reset = () => { setSelected({}); setCurrentQ(0); setShowScore(false) }

  const qColors = [
    { accent: '#0ea5e9', bg: 'rgba(14,165,233,0.06)' },
    { accent: '#8b5cf6', bg: 'rgba(139,92,246,0.06)' },
    { accent: '#f59e0b', bg: 'rgba(245,158,11,0.06)' },
    { accent: '#10b981', bg: 'rgba(16,185,129,0.06)' },
    { accent: '#ec4899', bg: 'rgba(236,72,153,0.06)' },
  ]
  const qColor = qColors[currentQ % qColors.length]

  if (showScore) {
    const pct = Math.round((correctCount / total) * 100)
    return (
      <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: pct >= 60 ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Award size={36} style={{ color: pct >= 60 ? 'var(--success-500)' : 'var(--danger-500)' }} />
        </div>
        <div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{pct}%</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            {pct >= 80 ? 'Excelente' : pct >= 60 ? 'Bien' : 'Sigue practicando'}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
            {correctCount} de {total} correctas · Banco EUNACOM
          </div>
        </div>
        <button onClick={reset} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.5rem', borderRadius: '10px', border: 'none', background: 'var(--primary-500)', color: '#fff', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
          <RotateCcw size={16} /> Reintentar
        </button>
      </div>
    )
  }

  const isCorrectOpt = (opt) => q.respuestaCorrecta && opt.id === q.respuestaCorrecta
  const isWrongPick  = (opt) => picked === opt.id && !isCorrectOpt(opt)

  return (
    <div>
      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <Target size={17} style={{ color: qColor.accent }} />
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          Pregunta {currentQ + 1} de {total} · Banco EUNACOM
        </span>
        {q.eunacomCode && (
          <span style={{ marginLeft: 'auto', fontSize: '0.72rem', fontWeight: 700, color: '#10b981', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 6, padding: '0.2rem 0.5rem' }}>
            {q.eunacomCode}
          </span>
        )}
      </div>

      {/* Progress dots */}
      <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {questions.map((_, i) => {
          const s = selected[i]
          const isOk = s && s === questions[i].respuestaCorrecta
          return (
            <div key={i} onClick={() => setCurrentQ(i)} style={{
              width: i === currentQ ? 22 : 9, height: 9, borderRadius: 5, cursor: 'pointer', transition: 'all 0.3s',
              background: !s ? (i === currentQ ? qColor.accent : 'var(--surface-600)') : isOk ? 'var(--success-500)' : 'var(--danger-500)',
            }} />
          )
        })}
      </div>

      <div className="card" style={{ padding: '2rem', borderTop: `3px solid ${qColor.accent}`, background: qColor.bg }}>
        <p style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '1.5rem', lineHeight: 1.6, color: 'var(--text-primary)' }}>
          {q.pregunta}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {q.opciones.map(opt => {
            const isCorrect = isCorrectOpt(opt)
            const isWrong   = isWrongPick(opt)
            let bg = 'var(--surface-700)', border = 'var(--border-color)', leftBar = 'transparent'
            if (answered) {
              if (isCorrect) { bg = 'rgba(52,211,153,0.12)'; border = 'var(--success-500)'; leftBar = 'var(--success-500)' }
              else if (isWrong) { bg = 'rgba(248,113,113,0.12)'; border = 'var(--danger-500)'; leftBar = 'var(--danger-500)' }
              else { bg = 'var(--surface-800)' }
            }
            return (
              <div key={opt.id}>
                <button onClick={() => handleSelect(opt.id)} disabled={answered} style={{
                  width: '100%', textAlign: 'left', padding: '0.9rem 1.1rem',
                  background: bg, border: `1px solid ${border}`, borderLeft: `4px solid ${leftBar}`,
                  borderRadius: '10px', color: 'var(--text-primary)',
                  cursor: answered ? 'default' : 'pointer',
                  opacity: answered && !isCorrect && !isWrong ? 0.4 : 1,
                  transition: 'all 0.2s', fontSize: '0.9rem',
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.8rem', fontWeight: 700,
                    background: answered && (isCorrect || isWrong) ? (isCorrect ? 'var(--success-500)' : 'var(--danger-500)') : `${qColor.accent}22`,
                    color: answered && (isCorrect || isWrong) ? '#fff' : qColor.accent,
                  }}>
                    {answered && isCorrect ? <CheckCircle2 size={15} /> : answered && isWrong ? <XCircle size={15} /> : opt.id}
                  </div>
                  <span>{opt.text}</span>
                </button>
                {answered && isCorrect && q.explicacion && (
                  <div style={{ padding: '0.75rem 1rem', marginTop: '0.4rem', borderRadius: '8px', marginLeft: '2.5rem', fontSize: '0.83rem', lineHeight: 1.6, background: 'rgba(52,211,153,0.08)', color: 'var(--success-500)', borderLeft: '3px solid var(--success-500)' }}>
                    <strong>Correcto:</strong> {q.explicacion}
                  </div>
                )}
                {answered && isWrong && (
                  <div style={{ padding: '0.75rem 1rem', marginTop: '0.4rem', borderRadius: '8px', marginLeft: '2.5rem', fontSize: '0.83rem', lineHeight: 1.6, background: 'rgba(248,113,113,0.08)', color: 'var(--danger-500)', borderLeft: '3px solid var(--danger-500)' }}>
                    <strong>Incorrecto.</strong> La respuesta correcta es la opción {q.respuestaCorrecta}.
                    {q.explicacionIncorrectas
                      ? (() => {
                          // Find the explanation for this specific wrong option
                          const letter = opt.id;
                          const re = new RegExp(`\\*?\\*?\\s*${letter}[:\\.][\\s\\S]*?(?=\\*?\\*?\\s*[BCDE]:|$)`, 'i');
                          const m = q.explicacionIncorrectas.match(re);
                          const text = m ? m[0].replace(/\*\*/g, '').replace(/^\s*[A-E][:.]\s*/i, '').trim() : null;
                          return text ? <span> {text}</span> : null;
                        })()
                      : q.explicacion ? <span> {q.explicacion}</span> : null
                    }
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: currentQ === 0 ? 'flex-end' : 'space-between', marginTop: '1rem' }}>
        {currentQ > 0 && (
          <button onClick={goPrev} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1.2rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--surface-700)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
            <ArrowLeft size={16} /> Anterior
          </button>
        )}
        <button
          onClick={goNext}
          disabled={!answered}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1.2rem', borderRadius: '10px', border: 'none', background: answered ? 'var(--primary-500)' : 'var(--surface-600)', color: answered ? '#fff' : 'var(--text-tertiary)', cursor: answered ? 'pointer' : 'not-allowed', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s' }}
        >
          {currentQ < total - 1 ? 'Siguiente' : 'Ver resultados'} <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   QUIZ SECTION — One question at a time
   ════════════════════════════════════════════════════════════════ */
function QuizSection({ quiz, onComplete }) {
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

  const handleSelect = (optId) => { if (!answered) setSelected(prev => ({ ...prev, [currentQ]: optId })) }
  const goNext = () => {
    if (currentQ < total - 1) setCurrentQ(currentQ + 1)
    else if (allAnswered) {
      setShowScore(true)
      const pct = Math.round((correctCount / total) * 100)
      const wrongIndices = Object.entries(selected).filter(([qi, optId]) => !quiz[Number(qi)]?.options.find(o => o.id === optId)?.isCorrect).map(([qi]) => Number(qi))
      onComplete?.(pct, correctCount, total, wrongIndices)
    }
  }
  const goPrev = () => { if (currentQ > 0) setCurrentQ(currentQ - 1) }
  const resetQuiz = () => { setSelected({}); setCurrentQ(0); setShowScore(false) }

  const qColors = [
    { accent: '#3b82f6', bg: 'rgba(59,130,246,0.06)' },
    { accent: '#8b5cf6', bg: 'rgba(139,92,246,0.06)' },
    { accent: '#ec4899', bg: 'rgba(236,72,153,0.06)' },
    { accent: '#f59e0b', bg: 'rgba(245,158,11,0.06)' },
    { accent: '#10b981', bg: 'rgba(16,185,129,0.06)' },
  ]
  const qColor = qColors[currentQ % qColors.length]

  if (showScore) {
    const pct = Math.round((correctCount / total) * 100)
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
          <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            {pct >= 80 ? 'Excelente' : pct >= 60 ? 'Bien' : 'Sigue practicando'}
          </div>
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

      <div className="card" style={{ padding: '2rem', borderTop: `3px solid ${qColor.accent}`, background: qColor.bg }}>
        <p style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '1.5rem', lineHeight: 1.6, color: 'var(--text-primary)' }}>
          {q.questionText}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {q.options.map(opt => {
            const isSelected = picked === opt.id
            const isCorrect = opt.isCorrect
            let bg = 'var(--surface-700)', border = 'var(--border-color)', leftBar = 'transparent'
            if (answered) {
              if (isCorrect) { bg = 'rgba(52,211,153,0.12)'; border = 'var(--success-500)'; leftBar = 'var(--success-500)' }
              else if (isSelected) { bg = 'rgba(248,113,113,0.12)'; border = 'var(--danger-500)'; leftBar = 'var(--danger-500)' }
              else { bg = 'var(--surface-800)' }
            }
            return (
              <div key={opt.id}>
                <button onClick={() => handleSelect(opt.id)} disabled={answered} style={{
                  width: '100%', textAlign: 'left', padding: '0.9rem 1.1rem',
                  background: bg, border: `1px solid ${border}`, borderLeft: `4px solid ${leftBar}`,
                  borderRadius: '10px', color: 'var(--text-primary)',
                  cursor: answered ? 'default' : 'pointer',
                  opacity: answered && !isCorrect && !isSelected ? 0.4 : 1,
                  transition: 'all 0.2s', fontSize: '0.9rem',
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.8rem', fontWeight: 700,
                    background: (answered && (isSelected || isCorrect))
                      ? (isCorrect ? 'var(--success-500)' : 'var(--danger-500)') : `${qColor.accent}22`,
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

/* ════════════════════════════════════════════════════════════════
   TRANSCRIPT SECTION — The actual class content
   ════════════════════════════════════════════════════════════════ */
/* Callout box styles */
const calloutStyles = {
  tip: { bg: 'rgba(16,185,129,0.08)', border: '#10b981', icon: '💡', label: 'PRO TIP', color: '#10b981' },
  important: { bg: 'rgba(239,68,68,0.08)', border: '#ef4444', icon: '🎯', label: 'CLAVE EUNACOM', color: '#ef4444' },
  warning: { bg: 'rgba(245,158,11,0.08)', border: '#f59e0b', icon: '⚠️', label: 'OJO', color: '#f59e0b' },
  note: { bg: 'rgba(59,130,246,0.08)', border: '#3b82f6', icon: '📝', label: 'NOTA', color: '#3b82f6' },
}

function CalloutBox({ type, children, onNavigate }) {
  const s = calloutStyles[type] || calloutStyles.note
  return (
    <div style={{
      padding: '1rem 1.25rem', borderRadius: 10, margin: '0.5rem 0',
      background: s.bg, borderLeft: `4px solid ${s.border}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 800, color: s.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {s.icon} {s.label}
      </div>
      <div style={{ fontSize: '0.88rem', lineHeight: 1.75, color: 'var(--text-primary)', fontWeight: 500 }}>
        {children}
      </div>
    </div>
  )
}

function TranscriptSection({ transcript, summary, onNavigate }) {
  const content = transcript || summary || ''
  const lines = content.split('\n')

  // Parse into blocks: headings, paragraphs, bullets, callouts
  const blocks = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i].trim()
    if (!line) { i++; continue }

    // Heading
    if (line.startsWith('## ')) {
      blocks.push({ type: 'heading', text: line.slice(3) })
      i++; continue
    }

    // Callout block :::tip / :::important / :::warning / :::note
    const calloutMatch = line.match(/^:::(tip|important|warning|note)$/)
    if (calloutMatch) {
      const calloutType = calloutMatch[1]
      const calloutLines = []
      i++
      while (i < lines.length && lines[i].trim() !== ':::') {
        calloutLines.push(lines[i].trim())
        i++
      }
      i++ // skip closing :::
      blocks.push({ type: 'callout', calloutType, text: calloutLines.join('\n') })
      continue
    }

    // Bullet list (collect consecutive - lines)
    if (line.startsWith('- ')) {
      const items = []
      while (i < lines.length && lines[i].trim().startsWith('- ')) {
        items.push(lines[i].trim().slice(2))
        i++
      }
      blocks.push({ type: 'bullets', items })
      continue
    }

    // Numbered list (collect consecutive 1. 2. lines)
    if (/^\d+[\.\)]\s/.test(line)) {
      const items = []
      while (i < lines.length && /^\d+[\.\)]\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+[\.\)]\s/, ''))
        i++
      }
      blocks.push({ type: 'numbered', items })
      continue
    }

    // Table (lines starting with |)
    if (line.startsWith('|')) {
      const rows = []
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        const row = lines[i].trim()
        if (!row.match(/^\|[\s-:|]+\|$/)) { // skip separator rows like |---|---|
          rows.push(row.split('|').filter(c => c.trim()).map(c => c.trim()))
        }
        i++
      }
      if (rows.length > 0) blocks.push({ type: 'table', header: rows[0], rows: rows.slice(1) })
      continue
    }

    // Regular paragraph
    blocks.push({ type: 'paragraph', text: line })
    i++
  }

  const sectionColors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#0ea5e9', '#f43f5e', '#22c55e']
  let headingIndex = 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {blocks.map((block, bi) => {
        if (block.type === 'heading') {
          const color = sectionColors[headingIndex++ % sectionColors.length]
          return (
            <div key={bi} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: bi > 0 ? '0.75rem' : 0 }}>
              <div style={{ width: 4, height: 24, borderRadius: 2, background: color }} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                {block.text}
              </h3>
            </div>
          )
        }

        if (block.type === 'callout') {
          return (
            <CalloutBox key={bi} type={block.calloutType} onNavigate={onNavigate}>
              <BoldText text={block.text} onNavigate={onNavigate} />
            </CalloutBox>
          )
        }

        if (block.type === 'bullets') {
          return (
            <div key={bi} style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {block.items.map((item, ii) => (
                <div key={ii} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.9rem', lineHeight: 1.75, color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--primary-500)', fontSize: '0.7rem', marginTop: '0.45rem', flexShrink: 0 }}>●</span>
                  <span><BoldText text={item} onNavigate={onNavigate} /></span>
                </div>
              ))}
            </div>
          )
        }

        if (block.type === 'numbered') {
          return (
            <div key={bi} style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {block.items.map((item, ii) => (
                <div key={ii} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.9rem', lineHeight: 1.75, color: 'var(--text-secondary)' }}>
                  <span style={{
                    minWidth: 22, height: 22, borderRadius: 6, background: 'rgba(59,130,246,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary-500)', flexShrink: 0, marginTop: '0.2rem',
                  }}>
                    {ii + 1}
                  </span>
                  <span><BoldText text={item} onNavigate={onNavigate} /></span>
                </div>
              ))}
            </div>
          )
        }

        // Table
        if (block.type === 'table') {
          return (
            <div key={bi} style={{ overflowX: 'auto', margin: '0.5rem 0', paddingLeft: '1.25rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr>
                    {block.header.map((h, hi) => (
                      <th key={hi} style={{
                        padding: '0.6rem 0.8rem', textAlign: 'left', fontWeight: 700,
                        color: 'var(--text-primary)', borderBottom: '2px solid var(--primary-500)',
                        background: 'rgba(59,130,246,0.06)', whiteSpace: 'nowrap',
                      }}>
                        <BoldText text={h} onNavigate={onNavigate} />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row, ri) => (
                    <tr key={ri} style={{ background: ri % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                      {row.map((cell, ci) => (
                        <td key={ci} style={{
                          padding: '0.5rem 0.8rem', borderBottom: '1px solid var(--border-color)',
                          color: ci === 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
                          fontWeight: ci === 0 ? 600 : 400, lineHeight: 1.6,
                        }}>
                          <BoldText text={cell} onNavigate={onNavigate} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }

        // Paragraph
        return (
          <p key={bi} style={{ fontSize: '0.92rem', lineHeight: 1.85, color: 'var(--text-secondary)', margin: 0, paddingLeft: '1.25rem' }}>
            <BoldText text={block.text} onNavigate={onNavigate} />
          </p>
        )
      })}

      {!transcript && summary && (
        <div style={{
          padding: '0.75rem 1rem', borderRadius: 8, marginTop: '0.5rem',
          background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
          fontSize: '0.8rem', color: '#f59e0b',
        }}>
          Esta clase muestra solo el resumen. El contenido completo de la clase estará disponible próximamente.
        </div>
      )}
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   CLASS DETAIL VIEW
   ════════════════════════════════════════════════════════════════ */
function PerfilBadge({ label, prefix }) {
  const colors = {
    'Específico': { bg: 'rgba(16,185,129,0.12)', color: '#10b981' },
    'Sospecha': { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
    'Completo': { bg: 'rgba(59,130,246,0.12)', color: '#3b82f6' },
    'Inicial': { bg: 'rgba(168,85,247,0.12)', color: '#8b5cf6' },
    'Derivar': { bg: 'rgba(236,72,153,0.12)', color: '#ec4899' },
    'No requiere': { bg: 'rgba(107,114,128,0.12)', color: '#6b7280' },
  }
  const c = colors[label] || colors['No requiere']
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.2rem 0.5rem', borderRadius: 6, fontSize: '0.7rem', fontWeight: 600, background: c.bg, color: c.color }}>
      <span style={{ opacity: 0.7 }}>{prefix}:</span> {label}
    </span>
  )
}

function ClaseDetail({ clase, onBack, onNavigateToTopic, onTrackProgress, onQuizComplete, onVideoWatched, progressMap }) {
  const [step, setStep] = useState(0)
  const [showQuizPrompt, setShowQuizPrompt] = useState(false)
  const hasTranscript = !!clase.cleanTranscript
  const videoUrl = getVideoUrl(clase.subsystem, clase.lessonNumber)
  const isVideoWatched = !!(progressMap?.[clase.id]?.video_watched)

  const steps = [
    { id: 'clase',     label: 'Clase',             icon: <BookOpen size={14} /> },
    { id: 'puntos',    label: 'Puntos Clave',       icon: <Lightbulb size={14} /> },
    { id: 'quiz',      label: 'Quiz',               icon: <Target size={14} /> },
    { id: 'preguntas', label: 'Banco EUNACOM',      icon: <HelpCircle size={14} /> },
  ]
  const maxStep = steps.length - 1

  // Track progress when changing tabs
  const handleStep = (newStep) => {
    setStep(newStep)
    setShowQuizPrompt(false)
    if (newStep === 0) onTrackProgress?.(clase.id, 'read_clase')
    if (newStep === 1) onTrackProgress?.(clase.id, 'read_puntos')
  }
  // Track initial tab visit
  useEffect(() => { onTrackProgress?.(clase.id, 'read_clase') }, [clase.id])

  const goNext = () => { if (step < maxStep) handleStep(step + 1) }
  const goPrev = () => { if (step > 0) handleStep(step - 1) }

  const handleVideoWatched = () => {
    onVideoWatched?.(clase.id)
    setShowQuizPrompt(true)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <button onClick={onBack} style={{
          background: 'var(--surface-700)', border: '1px solid var(--border-color)',
          borderRadius: '10px', padding: '0.5rem 1rem', color: 'var(--text-primary)',
          cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem'
        }}>
          <ChevronLeft size={16} /> Volver
        </button>
      </div>

      <div className="card" style={{
        padding: '1.5rem 1.75rem', marginBottom: '1.5rem',
        background: 'linear-gradient(135deg, rgba(19,91,236,0.06) 0%, rgba(168,85,247,0.06) 100%)',
        borderLeft: '4px solid var(--primary-500)'
      }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary-500)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {clase.specialty} / {clase.subsystem}
        </div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
          Clase {clase.lessonNumber}: {clase.topic}
        </h2>
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
          {clase.quiz?.length > 0 && <span>{clase.quiz.length} preguntas</span>}
          {clase.keyPoints?.length > 0 && <span>{clase.keyPoints.length} puntos clave</span>}
          {videoUrl && (
            <span style={{ color: isVideoWatched ? '#10b981' : 'var(--primary-400)', fontWeight: 600 }}>
              {isVideoWatched ? '✓ Video visto' : '▶ Video disponible'}
            </span>
          )}
        </div>
        {/* Perfil EUNACOM badges — show only the primary (first) match */}
        {clase.perfilData && clase.perfilData.length > 0 && (() => {
          const p = clase.perfilData[0] // Primary perfil item for this class
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', padding: '0.5rem 0.8rem', borderRadius: 8, background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                EUNACOM {p.codigo}:
              </span>
              {p.diagnostico && <PerfilBadge label={p.diagnostico} prefix="Dx" />}
              {p.tratamiento && <PerfilBadge label={p.tratamiento} prefix="Tx" />}
              {p.seguimiento && <PerfilBadge label={p.seguimiento} prefix="Seg" />}
            </div>
          )
        })()}
      </div>

      {/* ─── VIDEO PLAYER (above tabs) ─── */}
      {videoUrl && (
        <VideoPlayer
          src={videoUrl}
          title={`Clase ${clase.lessonNumber}: ${clase.topic}`}
          watched={isVideoWatched}
          onWatched={handleVideoWatched}
        />
      )}

      {/* ─── POST-VIDEO QUIZ PROMPT ─── */}
      {showQuizPrompt && !isVideoWatched && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '1rem',
          padding: '1rem 1.25rem', borderRadius: 14, marginBottom: '1.25rem',
          background: 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(19,91,236,0.08) 100%)',
          border: '1px solid rgba(16,185,129,0.3)',
          animation: 'slideIn 0.4s ease',
        }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Zap size={20} style={{ color: '#10b981' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>¡+50 XP obtenidos!</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>Ahora responde el quiz para ganar los 50 XP restantes.</div>
          </div>
          <button onClick={() => { setShowQuizPrompt(false); handleStep(2) }} style={{
            padding: '0.6rem 1.2rem', borderRadius: 10, border: 'none',
            background: '#10b981', color: '#fff', cursor: 'pointer',
            fontSize: '0.85rem', fontWeight: 700, whiteSpace: 'nowrap',
            boxShadow: '0 2px 12px rgba(16,185,129,0.4)',
          }}>
            Ir al Quiz →
          </button>
          <button onClick={() => setShowQuizPrompt(false)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-tertiary)', fontSize: '1.2rem', lineHeight: 1, padding: '0.25rem',
          }}>×</button>
        </div>
      )}
      {showQuizPrompt && isVideoWatched && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '1rem',
          padding: '1rem 1.25rem', borderRadius: 14, marginBottom: '1.25rem',
          background: 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(19,91,236,0.08) 100%)',
          border: '1px solid rgba(16,185,129,0.3)',
          animation: 'slideIn 0.4s ease',
        }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Zap size={20} style={{ color: '#10b981' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>¡+50 XP obtenidos!</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>Ahora responde el quiz para ganar los 50 XP restantes.</div>
          </div>
          <button onClick={() => { setShowQuizPrompt(false); handleStep(2) }} style={{
            padding: '0.6rem 1.2rem', borderRadius: 10, border: 'none',
            background: '#10b981', color: '#fff', cursor: 'pointer',
            fontSize: '0.85rem', fontWeight: 700, whiteSpace: 'nowrap',
            boxShadow: '0 2px 12px rgba(16,185,129,0.4)',
          }}>
            Ir al Quiz →
          </button>
          <button onClick={() => setShowQuizPrompt(false)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-tertiary)', fontSize: '1.2rem', lineHeight: 1, padding: '0.25rem',
          }}>×</button>
        </div>
      )}

      <style>{`
        @keyframes slideIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <StepBar steps={steps} current={step} onStep={handleStep} />

      {step === 0 && (
        <div className="card" style={{ padding: '2rem', borderLeft: '4px solid var(--primary-500)' }}>
          <TranscriptSection transcript={clase.cleanTranscript} summary={clase.summary} onNavigate={onNavigateToTopic} />
        </div>
      )}
      {step === 1 && <PuntosClaveSection keyPoints={clase.keyPoints} />}
      {step === 2 && clase.quiz?.length > 0 && <QuizSection quiz={clase.quiz} onComplete={(score, correct, total, wrong) => onQuizComplete?.(clase.id, score, correct, total, wrong)} />}
      {step === 3 && <EunacomQuestionsSection claseId={clase.id} eunacomCode={clase.eunacomCode} />}

      {step < maxStep && (
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
            fontSize: '0.85rem', fontWeight: 600, boxShadow: '0 2px 8px rgba(19,91,236,0.3)',
          }}>
            {steps[step + 1].label} <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   PRUEBAS PROGRESS HELPERS  (localStorage)
   ════════════════════════════════════════════════════════════════ */
const PRUEBA_KEY = 'eunacom_prueba_progress'
function loadPruebaProgress() {
  try { return JSON.parse(localStorage.getItem(PRUEBA_KEY) || '{}') } catch { return {} }
}
function savePruebaProgress(pruebaId, data) {
  const all = loadPruebaProgress()
  all[pruebaId] = { ...all[pruebaId], ...data, updatedAt: Date.now() }
  localStorage.setItem(PRUEBA_KEY, JSON.stringify(all))
  return all
}

/* ════════════════════════════════════════════════════════════════
   PRUEBAS VIEW — shown when user picks "Pruebas" on a subsystem
   Shows all available Pruebas with progress + score, and runs the
   test inline when one is selected.
   ════════════════════════════════════════════════════════════════ */
function PruebasView({ specialty, subsystem, subsystemStyle, onBack }) {
  const [index, setIndex] = useState(null)
  const [loading, setLoading] = useState(true)
  const [topicData, setTopicData] = useState(null)
  const [activePrueba, setActivePrueba] = useState(null) // prueba object being taken
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState({})        // { qIndex: 'A'|'B'|… } — final correct answer
  const [showResult, setShowResult] = useState(false)
  const [pruebaProgress, setPruebaProgress] = useState(loadPruebaProgress())
  const [attempts, setAttempts] = useState({})       // { qIndex: ['C','D'] } — wrong attempts
  const [correctFound, setCorrectFound] = useState({}) // { qIndex: true } — correct answer found
  const [answerStats, setAnswerStats] = useState({}) // { questionId: { A: 5, B: 3 } }

  // Load pruebas index
  useEffect(() => {
    fetch('/data/pruebas/index.json')
      .then(r => r.json())
      .then(idx => { setIndex(idx); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  // Match subsystem name to pruebas index key (fuzzy)
  const norm = s => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '')
  const findTopicKey = () => {
    if (!index || !index[specialty]) return null
    const topics = index[specialty]
    const target = norm(subsystem)
    // exact match first
    if (topics[subsystem]) return subsystem
    // fuzzy
    return Object.keys(topics).find(k => norm(k) === target) || Object.keys(topics).find(k => norm(k).includes(target) || target.includes(norm(k))) || null
  }

  const topicKey = index ? findTopicKey() : null
  const topicMeta = topicKey ? index[specialty][topicKey] : null

  // Lazy-load topic questions when entering a prueba
  const loadTopic = async () => {
    if (topicData || !topicMeta) return topicData
    const r = await fetch(`/data/pruebas/${topicMeta.slug}.json`)
    const d = await r.json()
    setTopicData(d)
    return d
  }

  const startPrueba = async (pruebaMeta) => {
    const data = topicData || await loadTopic()
    if (!data) return
    const pruebas = data.pruebas
    const p = Array.isArray(pruebas)
      ? pruebas.find(pp => pp.id === pruebaMeta.id)
      : Object.values(pruebas).find(pp => pp.id === pruebaMeta.id)
    if (!p) return
    setActivePrueba(p)
    setCurrentQ(0)
    setAnswers({})
    setShowResult(false)
    setAttempts({})
    setCorrectFound({})
    // Pre-fetch answer stats for all questions in this prueba
    const qIds = p.questions.map(q => `${p.id}_${q.numero}`)
    fetch('/api/answer-stats', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionIds: qIds })
    }).then(r => r.json()).then(d => setAnswerStats(d.data || {})).catch(() => {})
  }

  const selectAnswer = (qIdx, optId) => {
    if (correctFound[qIdx]) return // already got it right
    const q = activePrueba.questions[qIdx]
    const questionId = `${activePrueba.id}_${q.numero}`

    // Record this pick in answer stats (fire and forget)
    fetch('/api/answer-stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId, optionId: optId })
    }).then(r => r.json()).then(() => {
      // Update local stats cache
      setAnswerStats(prev => {
        const qStats = { ...(prev[questionId] || {}) }
        qStats[optId] = (qStats[optId] || 0) + 1
        return { ...prev, [questionId]: qStats }
      })
    }).catch(() => {})

    if (optId === q.respuestaCorrecta) {
      // Correct!
      setAnswers(prev => ({ ...prev, [qIdx]: optId }))
      setCorrectFound(prev => ({ ...prev, [qIdx]: true }))
    } else {
      // Wrong — record this attempt
      setAttempts(prev => ({
        ...prev,
        [qIdx]: [...(prev[qIdx] || []), optId]
      }))
    }
  }

  const finishPrueba = () => {
    if (!activePrueba) return
    const qs = activePrueba.questions
    let correct = 0
    qs.forEach((q, i) => {
      if (correctFound[i]) correct++
    })
    const answered = Object.keys(correctFound).length + Object.keys(attempts).filter(k => !correctFound[k]).length
    const score = qs.length > 0 ? Math.round((correct / qs.length) * 100) : 0
    const pct = Math.round((answered / qs.length) * 100)
    const updated = savePruebaProgress(activePrueba.id, { done: pct, score, correct, total: qs.length, answered })
    setPruebaProgress(updated)
    setShowResult(true)
  }

  const resetPrueba = () => {
    setCurrentQ(0)
    setAnswers({})
    setShowResult(false)
    setAttempts({})
    setCorrectFound({})
  }

  // ─── If taking a prueba ───
  if (activePrueba) {
    const qs = activePrueba.questions
    const q = qs[currentQ]
    const totalQ = qs.length

    // ─── Results screen ───
    if (showResult) {
      let correct = 0
      qs.forEach((qq, i) => { if (correctFound[i]) correct++ })
      const attempted = Object.keys(correctFound).length + Object.keys(attempts).filter(k => !correctFound[k]).length
      const score = qs.length > 0 ? Math.round((correct / qs.length) * 100) : 0
      const wrong = qs.map((qq, i) => ({ ...qq, idx: i })).filter(qq => !correctFound[qq.idx] && (attempts[qq.idx]?.length > 0))
      const omitted = qs.length - attempted

      return (
        <div style={{ paddingBottom: '2rem' }}>
          <button onClick={() => setActivePrueba(null)} style={{
            background: 'var(--surface-700)', border: '1px solid var(--border-color)',
            borderRadius: 10, padding: '0.5rem 1rem', color: 'var(--text-primary)',
            cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem',
            marginBottom: '1.25rem'
          }}>
            <ChevronLeft size={16} /> Volver a Pruebas
          </button>

          <div className="card" style={{
            padding: '2rem', textAlign: 'center',
            background: score >= 70 ? 'linear-gradient(135deg, rgba(16,185,129,0.06) 0%, rgba(59,130,246,0.06) 100%)' : 'linear-gradient(135deg, rgba(239,68,68,0.06) 0%, rgba(245,158,11,0.06) 100%)',
            borderTop: `4px solid ${score >= 70 ? '#10b981' : '#f59e0b'}`
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{score >= 70 ? '🎉' : '📝'}</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              {activePrueba.name} — {score}%
            </h2>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              {correct} correctas · {wrong.length} incorrectas · {omitted} omitidas
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={resetPrueba} style={{
                padding: '0.6rem 1.5rem', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: 'var(--primary-500)', color: '#fff', fontWeight: 600, fontSize: '0.9rem',
                display: 'flex', alignItems: 'center', gap: '0.4rem'
              }}>
                <RotateCcw size={15} /> Repetir
              </button>
              <button onClick={() => setActivePrueba(null)} style={{
                padding: '0.6rem 1.5rem', borderRadius: 10, border: '1px solid var(--border-color)',
                background: 'var(--surface-700)', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem',
                cursor: 'pointer'
              }}>
                Volver a Pruebas
              </button>
            </div>
          </div>

          {/* Wrong answers review */}
          {wrong.length > 0 && (
            <div style={{ marginTop: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <XCircle size={18} style={{ color: '#ef4444' }} /> Respuestas Incorrectas ({wrong.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {wrong.map((wq) => {
                  const wrongAttempts = attempts[wq.idx] || []
                  return (
                  <div key={wq.idx} className="card" style={{ padding: '1.25rem', borderLeft: '3px solid #ef4444' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.6rem' }}>
                      {wq.numero}. {wq.pregunta}
                    </div>
                    {wrongAttempts.map((wa, wi) => (
                      <div key={wi} style={{ fontSize: '0.8rem', color: '#ef4444', marginBottom: '0.25rem' }}>
                        ✗ Intento {wi + 1}: {wa}) {wq.opciones?.find(o => o.id === wa)?.text || ''}
                      </div>
                    ))}
                    <div style={{ fontSize: '0.8rem', color: '#10b981', marginBottom: '0.5rem' }}>
                      ✓ Correcta: {wq.respuestaCorrecta}) {wq.opciones?.find(o => o.id === wq.respuestaCorrecta)?.text || ''}
                    </div>
                    {wq.explicacion && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', lineHeight: 1.6, background: 'var(--surface-700)', borderRadius: 8, padding: '0.75rem', marginTop: '0.4rem', whiteSpace: 'pre-wrap' }}>
                        {wq.explicacion}
                      </div>
                    )}
                  </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )
    }

    // ─── Question view ───
    const isCorrect = correctFound[currentQ]
    const wrongAttempts = attempts[currentQ] || []
    const selectedOpt = answers[currentQ]
    const questionId = `${activePrueba.id}_${q.numero}`
    const qStats = answerStats[questionId] || {}
    const statsTotal = Object.values(qStats).reduce((s, v) => s + v, 0)
    const answered = Object.keys(correctFound).length + Object.keys(attempts).filter(k => !correctFound[k]).length
    return (
      <div style={{ paddingBottom: '2rem' }}>
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <button onClick={() => { if (window.confirm('¿Salir de la prueba? Tu progreso parcial se guardará.')) { finishPrueba(); setActivePrueba(null) }}} style={{
            background: 'var(--surface-700)', border: '1px solid var(--border-color)',
            borderRadius: 10, padding: '0.5rem 1rem', color: 'var(--text-primary)',
            cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem'
          }}>
            <ChevronLeft size={16} /> Salir
          </button>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {activePrueba.name}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
            {answered}/{totalQ}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 4, background: 'var(--surface-600)', borderRadius: 2, marginBottom: '1.5rem', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(answered / totalQ) * 100}%`, background: 'var(--primary-500)', borderRadius: 2, transition: 'width 0.3s' }} />
        </div>

        {/* Question card */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary-500)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
            Pregunta {currentQ + 1} de {totalQ}
          </div>
          <p style={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.7, color: 'var(--text-primary)', marginBottom: '1.25rem', whiteSpace: 'pre-wrap' }}>
            {q.pregunta}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {(q.opciones || []).map(opt => {
              const isThisCorrect = opt.id === q.respuestaCorrecta
              const wasAttempted = wrongAttempts.includes(opt.id)
              const isSelectedCorrect = isCorrect && opt.id === selectedOpt
              let bg = 'var(--surface-700)'
              let border = 'var(--border-color)'
              let color = 'var(--text-primary)'
              let disabled = false

              if (isCorrect) {
                // Question solved — show correct in green, wrong attempts in red, rest neutral
                if (isThisCorrect) { bg = 'rgba(16,185,129,0.12)'; border = '#10b981'; color = '#10b981' }
                else if (wasAttempted) { bg = 'rgba(239,68,68,0.08)'; border = '#ef4444'; color = '#ef4444' }
                disabled = true
              } else if (wasAttempted) {
                // Wrong attempt — grey it out
                bg = 'rgba(239,68,68,0.06)'; border = '#ef444480'; color = 'var(--text-tertiary)'
                disabled = true
              }

              return (
                <button key={opt.id} onClick={() => selectAnswer(currentQ, opt.id)} disabled={disabled} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                  padding: '0.85rem 1rem', borderRadius: 10,
                  background: bg, border: `1.5px solid ${border}`,
                  cursor: disabled ? 'default' : 'pointer',
                  textAlign: 'left', transition: 'all 0.2s', color,
                  opacity: disabled && !isThisCorrect && !wasAttempted ? 0.5 : 1,
                }}>
                  <span style={{
                    minWidth: 26, height: 26, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.78rem', fontWeight: 800, flexShrink: 0,
                    background: isCorrect && isThisCorrect ? '#10b981' : wasAttempted ? '#ef4444' : 'var(--surface-600)',
                    color: (isCorrect && isThisCorrect) || wasAttempted ? '#fff' : 'var(--text-secondary)',
                  }}>
                    {isCorrect && isThisCorrect ? <CheckCircle2 size={14} /> : wasAttempted ? <XCircle size={14} /> : opt.id}
                  </span>
                  <span style={{ fontSize: '0.88rem', lineHeight: 1.5, fontWeight: isCorrect && isThisCorrect ? 700 : 400, flex: 1 }}>
                    {opt.text}
                  </span>
                  {/* Show answer stats percentages when correct found AND 10+ total responses */}
                  {isCorrect && statsTotal >= 10 && (
                    <span style={{
                      fontSize: '0.72rem', fontWeight: 700, flexShrink: 0,
                      color: isThisCorrect ? '#10b981' : 'var(--text-tertiary)',
                      background: isThisCorrect ? 'rgba(16,185,129,0.1)' : 'var(--surface-600)',
                      padding: '2px 8px', borderRadius: 999,
                    }}>
                      {statsTotal > 0 ? Math.round(((qStats[opt.id] || 0) / statsTotal) * 100) : 0}%
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Wrong attempt feedback */}
          {wrongAttempts.length > 0 && !isCorrect && (() => {
            const lastWrong = wrongAttempts[wrongAttempts.length - 1]
            const lastWrongOpt = (q.opciones || []).find(o => o.id === lastWrong)
            // Try to find per-option explanation from explicacionIncorrectas
            const wrongExplanation = q.explicacionIncorrectas
              ? (() => {
                  // Try to extract explanation for the specific option
                  const regex = new RegExp(`(?:${lastWrong}\\)|${lastWrong}\\.|${lastWrong}\\s*[-–—])\\s*(.+?)(?=\\s*(?:[A-E]\\)|[A-E]\\.|$))`, 'is')
                  const match = q.explicacionIncorrectas.match(regex)
                  return match ? match[1].trim() : null
                })()
              : null
            return (
              <div style={{
                marginTop: '1rem', padding: '1rem', borderRadius: 10,
                background: 'rgba(239,68,68,0.06)', borderLeft: '3px solid #ef4444',
              }}>
                <div style={{ fontWeight: 700, color: '#ef4444', marginBottom: '0.4rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <XCircle size={15} /> Incorrecto
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  <strong>{lastWrong}) {lastWrongOpt?.text || ''}</strong> no es la respuesta correcta.
                  {wrongExplanation && <span style={{ display: 'block', marginTop: '0.4rem', color: 'var(--text-tertiary)' }}>{wrongExplanation}</span>}
                  <span style={{ display: 'block', marginTop: '0.5rem', color: 'var(--primary-400)', fontWeight: 600, fontSize: '0.8rem' }}>
                    Intenta de nuevo · {q.opciones.length - wrongAttempts.length - 1} opciones restantes
                  </span>
                </div>
              </div>
            )
          })()}

          {/* Full explanation shown when correct answer is found */}
          {isCorrect && q.explicacion && (
            <div style={{
              marginTop: '1rem', padding: '1rem', borderRadius: 10,
              background: 'var(--surface-700)', borderLeft: '3px solid #10b981',
              fontSize: '0.83rem', lineHeight: 1.7, color: 'var(--text-secondary)',
            }}>
              <div style={{ fontWeight: 700, color: '#10b981', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={14} /> {wrongAttempts.length === 0 ? '¡Correcto!' : '¡Correcto al intento ' + (wrongAttempts.length + 1) + '!'}
              </div>
              <div style={{ whiteSpace: 'pre-wrap' }}>{q.explicacion}</div>
            </div>
          )}

          {/* Show why other options are incorrect — only after getting correct */}
          {isCorrect && q.explicacionIncorrectas && (
            <div style={{
              marginTop: '0.75rem', padding: '1rem', borderRadius: 10,
              background: 'rgba(245,158,11,0.04)', borderLeft: '3px solid #f59e0b',
              fontSize: '0.8rem', lineHeight: 1.6, color: 'var(--text-tertiary)',
            }}>
              <div style={{ fontWeight: 700, color: '#f59e0b', marginBottom: '0.4rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Lightbulb size={14} /> ¿Por qué las otras opciones son incorrectas?
              </div>
              <div style={{ whiteSpace: 'pre-wrap' }}>{q.explicacionIncorrectas}</div>
            </div>
          )}

          {/* Answer stats summary when correct + 10+ respondents */}
          {isCorrect && statsTotal >= 10 && (
            <div style={{
              marginTop: '0.75rem', padding: '0.75rem 1rem', borderRadius: 10,
              background: 'var(--surface-700)', fontSize: '0.78rem', color: 'var(--text-tertiary)',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}>
              <BarChart3 size={14} style={{ color: 'var(--primary-400)', flexShrink: 0 }} />
              <span>{statsTotal} personas han respondido esta pregunta</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}>
          <button onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0} style={{
            flex: 1, padding: '0.7rem', borderRadius: 10, border: '1px solid var(--border-color)',
            background: 'var(--surface-700)', color: currentQ === 0 ? 'var(--text-tertiary)' : 'var(--text-primary)',
            cursor: currentQ === 0 ? 'default' : 'pointer', fontWeight: 600, fontSize: '0.85rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
            opacity: currentQ === 0 ? 0.4 : 1,
          }}>
            <ArrowLeft size={15} /> Anterior
          </button>
          {currentQ < totalQ - 1 ? (
            <button onClick={() => setCurrentQ(currentQ + 1)} style={{
              flex: 1, padding: '0.7rem', borderRadius: 10, border: 'none',
              background: 'var(--primary-500)', color: '#fff',
              cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem'
            }}>
              Siguiente <ArrowRight size={15} />
            </button>
          ) : (
            <button onClick={finishPrueba} style={{
              flex: 1, padding: '0.7rem', borderRadius: 10, border: 'none',
              background: '#10b981', color: '#fff',
              cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem'
            }}>
              <Trophy size={15} /> Finalizar Prueba
            </button>
          )}
        </div>

        {/* Question dots navigator */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '1rem',
          padding: '0.75rem', borderRadius: 10, background: 'var(--surface-700)',
          justifyContent: 'center',
        }}>
          {qs.map((_, i) => {
            const isAnsweredCorrect = correctFound[i]
            const hasWrongAttempts = (attempts[i]?.length || 0) > 0
            const isCurrent = i === currentQ
            return (
              <button key={i} onClick={() => setCurrentQ(i)} style={{
                width: 28, height: 28, borderRadius: '50%', border: 'none', cursor: 'pointer',
                fontSize: '0.65rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isCurrent ? 'var(--primary-500)' : isAnsweredCorrect ? 'rgba(16,185,129,0.2)' : hasWrongAttempts ? 'rgba(239,68,68,0.2)' : 'var(--surface-600)',
                color: isCurrent ? '#fff' : isAnsweredCorrect ? '#10b981' : hasWrongAttempts ? '#ef4444' : 'var(--text-tertiary)',
                outline: isCurrent ? '2px solid var(--primary-500)' : 'none',
                outlineOffset: 2,
              }}>
                {i + 1}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // ─── Pruebas list ───
  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--primary-500)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
        <p style={{ color: 'var(--text-tertiary)', marginTop: '1rem' }}>Cargando pruebas...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!topicMeta) {
    return (
      <div>
        <button onClick={onBack} style={{
          background: 'var(--surface-700)', border: '1px solid var(--border-color)',
          borderRadius: 10, padding: '0.5rem 1rem', color: 'var(--text-primary)',
          cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem',
          marginBottom: '1.25rem'
        }}>
          <ChevronLeft size={16} /> Volver
        </button>
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <ClipboardList size={40} style={{ color: 'var(--text-tertiary)', opacity: 0.5, marginBottom: '0.75rem' }} />
          <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>No hay pruebas disponibles para {subsystem}</p>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.82rem', marginTop: '0.5rem' }}>Estamos preparando las pruebas para este tema.</p>
        </div>
      </div>
    )
  }

  const pruebas = topicMeta.pruebas
  const totalQs = pruebas.reduce((s, p) => s + p.questionCount, 0)
  const doneCount = pruebas.filter(p => (pruebaProgress[p.id]?.done || 0) >= 100).length
  const overallPct = pruebas.length ? Math.round((doneCount / pruebas.length) * 100) : 0
  const avgScore = (() => {
    const done = pruebas.filter(p => pruebaProgress[p.id]?.score !== undefined)
    if (done.length === 0) return null
    return Math.round(done.reduce((s, p) => s + pruebaProgress[p.id].score, 0) / done.length)
  })()

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <button onClick={onBack} style={{
        background: 'var(--surface-700)', border: '1px solid var(--border-color)',
        borderRadius: 10, padding: '0.5rem 1rem', color: 'var(--text-primary)',
        cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem',
        marginBottom: '1.25rem'
      }}>
        <ChevronLeft size={16} /> Volver
      </button>

      {/* Overview card */}
      <div className="card" style={{
        padding: '1.5rem', marginBottom: '1.25rem',
        background: `linear-gradient(135deg, ${subsystemStyle.bg} 0%, transparent 100%)`,
        borderLeft: `4px solid ${subsystemStyle.color}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12, background: subsystemStyle.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: subsystemStyle.color, border: `1px solid ${subsystemStyle.color}25`,
              }}>
                {subsystemStyle.icon}
              </div>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Pruebas de {subsystem}
                </h2>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: '0.1rem' }}>
                  {pruebas.length} pruebas · {totalQs} preguntas
                </div>
              </div>
            </div>
          </div>
          <ProgressRing percent={overallPct} size={50} stroke={4} />
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
            <CheckCircle2 size={14} style={{ color: '#10b981' }} />
            <span style={{ color: 'var(--text-secondary)' }}>{doneCount}/{pruebas.length} completadas</span>
          </div>
          {avgScore !== null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
              <BarChart3 size={14} style={{ color: avgScore >= 70 ? '#10b981' : '#f59e0b' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Promedio: <strong style={{ color: avgScore >= 70 ? '#10b981' : '#f59e0b' }}>{avgScore}%</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* Pruebas grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
        {pruebas.map((p, i) => {
          const prog = pruebaProgress[p.id] || {}
          const done = prog.done || 0
          const score = prog.score
          const hasScore = score !== undefined
          return (
            <div key={p.id} className="card" onClick={() => startPrueba(p)} style={{
              padding: '1.1rem 1.25rem', cursor: 'pointer', transition: 'all 0.25s',
              borderLeft: `3px solid ${done >= 100 ? '#10b981' : hasScore ? '#f59e0b' : subsystemStyle.color}`,
              position: 'relative', overflow: 'hidden',
            }}>
              {/* Completed badge */}
              {done >= 100 && (
                <div style={{
                  position: 'absolute', top: 8, right: 8,
                  background: 'rgba(16,185,129,0.12)', borderRadius: '50%',
                  width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <CheckCircle2 size={14} style={{ color: '#10b981' }} />
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: done >= 100 ? 'rgba(16,185,129,0.12)' : subsystemStyle.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.85rem', fontWeight: 800,
                  color: done >= 100 ? '#10b981' : subsystemStyle.color,
                }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {p.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.15rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Hash size={11} /> {p.questionCount} preguntas
                    </span>
                    {hasScore && (
                      <span style={{
                        display: 'flex', alignItems: 'center', gap: '0.25rem',
                        fontWeight: 700, color: score >= 70 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'
                      }}>
                        <Target size={11} /> {score}%
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight size={16} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
              </div>

              {/* Mini progress bar */}
              {done > 0 && (
                <div style={{ height: 3, background: 'var(--surface-600)', borderRadius: 2, marginTop: '0.75rem', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 2, transition: 'width 0.3s',
                    width: `${done}%`,
                    background: done >= 100 ? '#10b981' : '#f59e0b',
                  }} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   SPECIALTY ICONS
   ════════════════════════════════════════════════════════════════ */
const specialtyConfig = {
  'Módulo 1': { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', icon: <Stethoscope size={22} /> }, // Medicina Interna
  'Módulo 2': { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: <Sparkles size={22} /> }, // Cirugía, Psiquiatría, Especialidades
  'Módulo 3': { color: '#ec4899', bg: 'rgba(236,72,153,0.1)', icon: <Baby size={22} /> }, // Pediatría, Ginecología, Obstetricia
}

// Subsystem-specific icons and colors
const subsystemConfig = {
  'Cardiología': { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: <HeartPulse size={20} /> },
  'Diabetes': { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: <Droplets size={20} /> },
  'Endocrinología': { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', icon: <Activity size={20} /> },
  'Gastroenterología': { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', icon: <Beaker size={20} /> },
  'Hematología': { color: '#dc2626', bg: 'rgba(220,38,38,0.1)', icon: <Droplets size={20} /> },
  'Infectología': { color: '#f97316', bg: 'rgba(249,115,22,0.1)', icon: <Microscope size={20} /> },
  'Nefrología': { color: '#06b6d4', bg: 'rgba(6,182,212,0.1)', icon: <FlaskConical size={20} /> },
  'Neurología y Geriatría': { color: '#a855f7', bg: 'rgba(168,85,247,0.1)', icon: <Brain size={20} /> },
  'Respiratorio': { color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)', icon: <Wind size={20} /> },
  'Reumatología': { color: '#ec4899', bg: 'rgba(236,72,153,0.1)', icon: <Bone size={20} /> },
  'Cirugia General': { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: <Scissors size={20} /> },
  'Traumatología': { color: '#f97316', bg: 'rgba(249,115,22,0.1)', icon: <Bone size={20} /> },
  'Urología': { color: '#6366f1', bg: 'rgba(99,102,241,0.1)', icon: <FlaskConical size={20} /> },
  'Dermatología': { color: '#f43f5e', bg: 'rgba(244,63,94,0.1)', icon: <ScanHeart size={20} /> },
  'Oftalmología': { color: '#14b8a6', bg: 'rgba(20,184,166,0.1)', icon: <Eye size={20} /> },
  'Otorrinolaringología': { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', icon: <Ear size={20} /> },
  'Psiquiatría': { color: '#a855f7', bg: 'rgba(168,85,247,0.1)', icon: <Brain size={20} /> },
  'Pediatría': { color: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: <Baby size={20} /> },
  'Obstetricia': { color: '#ec4899', bg: 'rgba(236,72,153,0.1)', icon: <Ribbon size={20} /> },
}

function getSpecialtyStyle(name) {
  return specialtyConfig[name] || { color: 'var(--primary-500)', bg: 'rgba(19,91,236,0.1)', icon: <Stethoscope size={22} /> }
}

function getSubsystemStyle(name) {
  return subsystemConfig[name] || { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', icon: <FileText size={20} /> }
}

/* ════════════════════════════════════════════════════════════════
   PRUEBAS BROWSER — Standalone topic selector for /banco-eunacom
   ════════════════════════════════════════════════════════════════ */
function PruebasBrowser() {
  const [index, setIndex] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedModule, setSelectedModule] = useState(null)
  const [selectedTopic, setSelectedTopic] = useState(null) // { specialty, subsystem }

  useEffect(() => {
    fetch('/data/pruebas/index.json')
      .then(r => r.json())
      .then(idx => { setIndex(idx); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  // If a topic is selected, render PruebasView
  if (selectedTopic) {
    return (
      <PruebasView
        specialty={selectedTopic.specialty}
        subsystem={selectedTopic.subsystem}
        subsystemStyle={getSubsystemStyle(selectedTopic.subsystem)}
        onBack={() => setSelectedTopic(null)}
      />
    )
  }

  if (loading) {
    return (
      <div style={{ paddingBottom: '2rem' }}>
        <h1 className="page__title">Banco EUNACOM</h1>
        <p className="page__subtitle" style={{ marginBottom: '1.5rem' }}>Cargando pruebas...</p>
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {[1,2,3,4].map(i => (
            <div key={i} className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: 'var(--surface-600)', animation: 'pulse 1.5s infinite' }} />
              <div style={{ flex: 1 }}>
                <div style={{ width: `${50 + i * 10}%`, height: 14, borderRadius: 6, background: 'var(--surface-600)', marginBottom: 8, animation: 'pulse 1.5s infinite' }} />
                <div style={{ width: '30%', height: 10, borderRadius: 6, background: 'var(--surface-600)', animation: 'pulse 1.5s infinite' }} />
              </div>
            </div>
          ))}
        </div>
        <style>{`@keyframes pulse { 0%,100% { opacity: 0.4; } 50% { opacity: 0.8; } }`}</style>
      </div>
    )
  }

  if (!index) {
    return (
      <div style={{ paddingBottom: '2rem' }}>
        <h1 className="page__title">Banco EUNACOM</h1>
        <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
          <HelpCircle size={48} style={{ color: 'var(--text-tertiary)', opacity: 0.5 }} />
          <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '1rem' }}>No se pudieron cargar las pruebas</p>
        </div>
      </div>
    )
  }

  const modules = Object.keys(index)
  const pruebaProgress = loadPruebaProgress()

  // Breadcrumb
  const breadcrumb = [
    { label: 'Banco EUNACOM', onClick: selectedModule ? () => setSelectedModule(null) : null },
  ]
  if (selectedModule) breadcrumb.push({ label: selectedModule, onClick: null })

  // Module colors
  const moduleStyles = {
    'Módulo 1': { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', icon: <Stethoscope size={22} /> },
    'Módulo 2': { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', icon: <Scissors size={22} /> },
    'Módulo 3': { color: '#ec4899', bg: 'rgba(236,72,153,0.1)', icon: <Baby size={22} /> },
  }

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
        <h1 className="page__title">Banco EUNACOM</h1>
        {(() => {
          let totalPruebas = 0, completedPruebas = 0
          Object.values(index).forEach(topics => {
            Object.values(topics).forEach(t => {
              t.pruebas.forEach(p => {
                totalPruebas++
                if (pruebaProgress[p.id]?.completed) completedPruebas++
              })
            })
          })
          const pct = totalPruebas ? Math.round((completedPruebas / totalPruebas) * 100) : 0
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', textAlign: 'right' }}>
                <span style={{ fontWeight: 700, color: pct > 0 ? '#10b981' : 'var(--text-secondary)' }}>{completedPruebas}</span>/{totalPruebas} pruebas
              </div>
              <ProgressRing percent={pct} size={40} stroke={3} />
            </div>
          )
        })()}
      </div>
      <p className="page__subtitle" style={{ marginBottom: '1rem' }}>
        Sets de preguntas tipo examen con explicaciones detalladas.
      </p>

      {/* Breadcrumb */}
      {selectedModule && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '1.25rem', fontSize: '0.82rem' }}>
          {breadcrumb.map((b, i) => (
            <React.Fragment key={i}>
              {i > 0 && <ChevronRight size={14} style={{ color: 'var(--text-tertiary)' }} />}
              {b.onClick ? (
                <button onClick={b.onClick} style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem 0.4rem',
                  borderRadius: '4px', color: 'var(--primary-500)', fontWeight: 600,
                }}>
                  {b.label}
                </button>
              ) : (
                <span style={{ color: 'var(--text-primary)', fontWeight: 600, padding: '0.2rem 0.4rem' }}>{b.label}</span>
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {!selectedModule ? (
        /* ─── Module cards ─── */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {modules.map(mod => {
            const style = moduleStyles[mod] || { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', icon: <FileText size={22} /> }
            const topics = Object.keys(index[mod])
            let totalQ = 0, totalP = 0, completedP = 0
            Object.values(index[mod]).forEach(t => {
              t.pruebas.forEach(p => {
                totalP++
                totalQ += p.questionCount
                if (pruebaProgress[p.id]?.completed) completedP++
              })
            })
            const pct = totalP ? Math.round((completedP / totalP) * 100) : 0
            return (
              <div key={mod} className="card" onClick={() => setSelectedModule(mod)} style={{
                padding: '1.5rem', cursor: 'pointer', transition: 'all 0.25s',
                borderLeft: `4px solid ${style.color}`,
                background: `linear-gradient(135deg, ${style.bg} 0%, transparent 100%)`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 14, background: style.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: style.color, border: `1px solid ${style.color}25`,
                  }}>
                    {style.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>{mod}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: '0.1rem' }}>
                      {totalP} pruebas · {totalQ} preguntas · {topics.length} temas
                    </div>
                  </div>
                  <ProgressRing percent={pct} size={42} stroke={3} />
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {topics.map(topic => {
                    const subStyle = getSubsystemStyle(topic)
                    return (
                      <span key={topic} style={{
                        fontSize: '0.72rem', padding: '0.2rem 0.6rem', borderRadius: '50px',
                        background: subStyle.bg, color: subStyle.color, fontWeight: 600,
                        display: 'flex', alignItems: 'center', gap: '0.3rem',
                      }}>
                        {React.cloneElement(subStyle.icon, { size: 11 })} {topic}
                      </span>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* ─── Topic cards for selected module ─── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {Object.entries(index[selectedModule]).map(([topic, meta]) => {
            const subStyle = getSubsystemStyle(topic)
            const totalP = meta.pruebas.length
            const completedP = meta.pruebas.filter(p => pruebaProgress[p.id]?.completed).length
            const totalQ = meta.pruebas.reduce((s, p) => s + p.questionCount, 0)
            const pct = totalP ? Math.round((completedP / totalP) * 100) : 0
            return (
              <div key={topic} className="card" onClick={() => setSelectedTopic({ specialty: selectedModule, subsystem: topic })} style={{
                padding: '1.25rem 1.5rem', cursor: 'pointer', transition: 'all 0.2s',
                borderLeft: `3px solid ${subStyle.color}`,
                background: `linear-gradient(135deg, ${subStyle.bg} 0%, transparent 100%)`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, background: subStyle.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: subStyle.color, border: `1px solid ${subStyle.color}25`,
                    }}>
                      {subStyle.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{topic}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '0.1rem' }}>
                        {totalP} pruebas · {totalQ} preguntas · {completedP} completadas
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ProgressRing percent={pct} size={36} stroke={3} />
                    <ChevronRight size={18} style={{ color: 'var(--text-tertiary)' }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   MAIN PAGE — Folder Navigation
   ════════════════════════════════════════════════════════════════ */
const MisClases = ({ initialView = null }) => {
  const { user } = useAuth()
  const [clases, setClases] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState(null)
  const [currentSpecialty, setCurrentSpecialty] = useState(null)
  const [currentSubsystem, setCurrentSubsystem] = useState(null)
  const [subView, setSubView] = useState(initialView) // null | 'clases' | 'pruebas'

  // Normalize quiz questions from any format to: { questionText, options: [{id, text, isCorrect, explanation}] }
  const normalizeQuiz = (rawQuiz) => {
    if (!rawQuiz || !Array.isArray(rawQuiz)) return []
    return rawQuiz.map(q => {
      // Already in expected format
      if (q.questionText && Array.isArray(q.options) && q.options[0]?.id) return q

      const questionText = q.questionText || q.question || ''

      // Format: options as array with "letter" instead of "id"
      if (Array.isArray(q.options) && q.options[0]?.letter) {
        return {
          questionText,
          options: q.options.map(o => ({
            id: o.letter || o.id,
            text: o.text,
            isCorrect: !!o.isCorrect,
            explanation: o.explanation || ''
          }))
        }
      }

      // Format: options as dict {A: "text", B: "text"} + correctAnswer
      if (q.options && !Array.isArray(q.options)) {
        return {
          questionText,
          options: Object.entries(q.options).map(([letter, text]) => ({
            id: letter,
            text,
            isCorrect: letter === q.correctAnswer,
            explanation: letter === q.correctAnswer ? (q.explanation || '') : ''
          }))
        }
      }

      return { questionText, options: q.options || [] }
    })
  }

  const [selectedClase, setSelectedClase] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [progressMap, setProgressMap] = useState({}) // { claseId: { read_clase, read_puntos, quiz_completed, quiz_score } }
  const [aggregateQuiz, setAggregateQuiz] = useState(null) // { subsystem, questions: [{...q, claseId, claseTopic}] }

  // List: only fetches lightweight metadata (no summary/quiz/keyPoints)
  // Classes are shared catalog — available to ALL users
  // Progress is per-user and loaded separately
  const loadData = async () => {
    try {
      const [rows, progress] = await Promise.all([
        fetchClases(),
        user ? fetchClaseProgress(user.id).catch(() => []) : Promise.resolve([])
      ])
      setClases(rows.map(r => ({
        id: r.id,
        savedAt: r.saved_at,
        specialty: r.specialty || 'General',
        subsystem: r.subsystem || 'General',
        lessonNumber: r.lesson_number || 1,
        topic: r.topic,
        slidesFile: r.slides_file || null,
        videoDir: r.video_dir || null,
      })))
      // Build progress map
      const pMap = {}
      progress.forEach(p => {
        pMap[p.clase_id] = p
      })
      setProgressMap(pMap)
    } catch (err) {
      console.error('Error loading clases:', err)
    } finally {
      setLoading(false)
    }
  }

  // Calculate progress percentage for a class
  // NEW formula: 50% from video watched + 50% from quiz score
  // Falls back to old 3-step formula if no video exists for this class
  const getProgress = (claseId) => {
    const p = progressMap[claseId]
    if (!p) return 0
    const c = clases.find(cl => cl.id === claseId)
    const hasVideo = !!(c && getVideoUrl(c.subsystem, c.lessonNumber))

    if (hasVideo) {
      const videoPct  = p.video_watched ? 50 : 0
      const quizPct   = p.quiz_completed
        ? Math.round((p.quiz_score ?? 0) / 100 * 50)
        : 0
      return videoPct + quizPct
    }
    // Legacy formula for classes without video
    let pct = 0
    if (p.read_clase)     pct += 33
    if (p.read_puntos)    pct += 33
    if (p.quiz_completed) pct += 34
    return pct
  }

  // Track a step and save (per-user, persisted to Turso)
  const trackProgress = async (claseId, field) => {
    if (!user) return
    const current = progressMap[claseId] || {}
    if (current[field]) return // already tracked
    const fieldMap = {
      read_clase:    'readClase',
      read_puntos:   'readPuntos',
      quiz_completed:'quizCompleted',
      video_watched: 'videoWatched',
    }
    const apiField = fieldMap[field]
    if (!apiField) return
    const update = { userId: user.id, claseId, [apiField]: 1 }
    try {
      await saveClaseProgress(update)
      setProgressMap(prev => ({ ...prev, [claseId]: { ...prev[claseId], [field]: 1 } }))
    } catch {}
  }

  // Detail: fetch full data for one class on demand
  const openClase = async (id) => {
    setSelectedId(id)
    setLoadingDetail(true)
    try {
      const r = await fetchClase(id)
      if (r) {
        const rawQuiz = typeof r.quiz === 'string' ? JSON.parse(r.quiz) : (r.quiz || [])
        const perfilCodes = r.perfil_codes ? (typeof r.perfil_codes === 'string' ? JSON.parse(r.perfil_codes) : r.perfil_codes) : []

        // Fetch perfil data only for THIS class's own codes (not hyperlinked topics)
        let perfilData = []
        if (perfilCodes.length > 0) {
          try {
            const perfilResult = await fetchPerfil({ codes: perfilCodes.join(',') })
            perfilData = (perfilResult.data || []).filter(p =>
              p.seccion?.includes('Situaciones clínicas') // Only show clinical situation badges
            )
          } catch {}
        }

        setSelectedClase({
          id: r.id,
          savedAt: r.saved_at,
          specialty: r.specialty || 'General',
          subsystem: r.subsystem || 'General',
          lessonNumber: r.lesson_number || 1,
          topic: r.topic,
          summary: r.summary || '',
          cleanTranscript: r.article_content || r.clean_transcript || '',
          keyPoints: typeof r.key_points === 'string' ? JSON.parse(r.key_points) : (r.key_points || []),
          quiz: normalizeQuiz(rawQuiz),
          slidesFile: r.slides_file || null,
          videoDir: r.video_dir || null,
          perfilCodes,
          perfilData,
        })
      }
    } catch (err) {
      console.error('Error loading clase detail:', err)
    } finally {
      setLoadingDetail(false)
    }
  }

  // Navigate to another class by topic name (from [[wiki links]])
  const navigateToTopic = (topicName) => {
    const norm = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    const target = clases.find(c => {
      const ct = norm(c.topic)
      const tn = norm(topicName)
      return ct === tn || ct.includes(tn) || tn.includes(ct)
    })
    if (target) {
      openClase(target.id)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const closeDetail = () => {
    setSelectedId(null)
    setSelectedClase(null)
  }

  // Launch aggregate quiz for a subsystem
  const startAggregateQuiz = async (subsystem) => {
    const lessons = clases.filter(c => c.subsystem === subsystem)
    // Fetch full data for all classes in this subsystem
    const allQuestions = []
    for (const lesson of lessons) {
      try {
        const r = await fetchClase(lesson.id)
        if (r) {
          const rawQuiz = typeof r.quiz === 'string' ? JSON.parse(r.quiz) : (r.quiz || [])
          const normalized = normalizeQuiz(rawQuiz)
          normalized.forEach(q => {
            allQuestions.push({ ...q, claseId: lesson.id, claseTopic: lesson.topic })
          })
        }
      } catch {}
    }
    // Shuffle
    for (let i = allQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]]
    }
    setAggregateQuiz({ subsystem, questions: allQuestions })
  }

  useEffect(() => { loadData() }, [user])

  // ─── Banco EUNACOM direct access ───
  if (initialView === 'pruebas') {
    return <PruebasBrowser />
  }

  // ─── Aggregate Quiz view ───
  if (aggregateQuiz) {
    const { subsystem, questions } = aggregateQuiz
    return (
      <div style={{ paddingBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <button onClick={() => setAggregateQuiz(null)} style={{
            background: 'var(--surface-700)', border: '1px solid var(--border-color)',
            borderRadius: '10px', padding: '0.5rem 1rem', color: 'var(--text-primary)',
            cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem'
          }}>
            <ChevronLeft size={16} /> Volver
          </button>
        </div>
        <div className="card" style={{
          padding: '1.5rem', marginBottom: '1.5rem',
          background: 'linear-gradient(135deg, rgba(16,185,129,0.06) 0%, rgba(59,130,246,0.06) 100%)',
          borderLeft: '4px solid #10b981'
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#10b981', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
            Quiz Agregado
          </div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
            {subsystem}
          </h2>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>
            {questions.length} preguntas de todas las clases · Orden aleatorio
          </div>
        </div>
        <QuizSection
          quiz={questions}
          onComplete={(score, correct, total, wrongIndices) => {
            // Save progress per class
            const byClase = {}
            questions.forEach((q, i) => {
              if (!byClase[q.claseId]) byClase[q.claseId] = { correct: 0, total: 0, wrong: [], topic: q.claseTopic }
              byClase[q.claseId].total++
              if (wrongIndices.includes(i)) byClase[q.claseId].wrong.push(i)
              else byClase[q.claseId].correct++
            })
            // Save each class's quiz result
            Object.entries(byClase).forEach(async ([claseId, data]) => {
              const claseScore = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0
              try {
                await saveClaseProgress({ userId: user.id, claseId, quizCompleted: 1, quizScore: claseScore, quizCorrect: data.correct, quizTotal: data.total })
                setProgressMap(prev => ({ ...prev, [claseId]: { ...prev[claseId], quiz_completed: 1, quiz_score: claseScore } }))
              } catch {}
            })
            // Show review after quiz ends (the QuizSection shows its own score screen)
          }}
        />
      </div>
    )
  }

  // ─── Detail view ───
  if (selectedId) {
    if (loadingDetail || !selectedClase) {
      return (
        <div style={{ paddingBottom: '2rem' }}>
          <button onClick={closeDetail} style={{
            background: 'var(--surface-700)', border: '1px solid var(--border-color)',
            borderRadius: '10px', padding: '0.5rem 1rem', color: 'var(--text-primary)',
            cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem',
            marginBottom: '1.25rem'
          }}>
            <ChevronLeft size={16} /> Volver
          </button>
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', padding: '2rem 0' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--primary-500)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Cargando clase...</span>
            </div>
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )
    }
    return (
      <div style={{ paddingBottom: '2rem' }}>
        <ClaseDetail
          clase={selectedClase}
          onBack={closeDetail}
          onNavigateToTopic={navigateToTopic}
          onTrackProgress={trackProgress}
          progressMap={progressMap}
          onVideoWatched={async (claseId) => {
            try {
              await saveClaseProgress({ userId: user.id, claseId, videoWatched: 1 })
              setProgressMap(prev => ({ ...prev, [claseId]: { ...prev[claseId], video_watched: 1 } }))
            } catch {}
          }}
          onQuizComplete={async (claseId, score, correct, total, wrongAnswers) => {
            try {
              await saveClaseProgress({ userId: user.id, claseId, quizCompleted: 1, quizScore: score, quizCorrect: correct, quizTotal: total, quizAnswers: wrongAnswers })
              setProgressMap(prev => ({ ...prev, [claseId]: { ...prev[claseId], quiz_completed: 1, quiz_score: score } }))
            } catch {}
          }}
        />
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ paddingBottom: '2rem' }}>
        <h1 className="page__title">Mis Clases</h1>
        <p className="page__subtitle" style={{ marginBottom: '1.5rem' }}>Cargando tu contenido...</p>
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {[1,2,3,4].map(i => (
            <div key={i} className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: 'var(--surface-600)', animation: 'pulse 1.5s infinite' }} />
              <div style={{ flex: 1 }}>
                <div style={{ width: `${50 + i * 10}%`, height: 14, borderRadius: 6, background: 'var(--surface-600)', marginBottom: 8, animation: 'pulse 1.5s infinite' }} />
                <div style={{ width: '30%', height: 10, borderRadius: 6, background: 'var(--surface-600)', animation: 'pulse 1.5s infinite' }} />
              </div>
            </div>
          ))}
        </div>
        <style>{`@keyframes pulse { 0%,100% { opacity: 0.4; } 50% { opacity: 0.8; } }`}</style>
      </div>
    )
  }

  // ─── Build folder tree ───
  const tree = {}
  clases.forEach(c => {
    if (!tree[c.specialty]) tree[c.specialty] = {}
    if (!tree[c.specialty][c.subsystem]) tree[c.specialty][c.subsystem] = []
    tree[c.specialty][c.subsystem].push(c)
  })
  // Sort lessons by number
  Object.values(tree).forEach(subs => Object.values(subs).forEach(lessons => lessons.sort((a, b) => a.lessonNumber - b.lessonNumber)))

  const specialties = Object.keys(tree)

  // ─── Breadcrumb ───
  const breadcrumb = []
  breadcrumb.push({ label: 'Mis Clases', onClick: () => { setCurrentSpecialty(null); setCurrentSubsystem(null); setSubView(null) } })
  if (currentSpecialty) breadcrumb.push({ label: currentSpecialty, onClick: () => { setCurrentSubsystem(null); setSubView(null) } })
  if (currentSubsystem) breadcrumb.push({ label: currentSubsystem, onClick: () => setSubView(null) })
  if (subView) breadcrumb.push({ label: subView === 'clases' ? 'Clases' : 'Pruebas', onClick: null })

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
        <h1 className="page__title">Mis Clases</h1>
        {(() => {
          const totalClases = clases.length
          const completedClases = clases.filter(c => getProgress(c.id) >= 100).length
          const pct = totalClases ? Math.round((completedClases / totalClases) * 100) : 0
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', textAlign: 'right' }}>
                <span style={{ fontWeight: 700, color: pct > 0 ? '#10b981' : 'var(--text-secondary)' }}>{completedClases}</span>/{totalClases} completadas
              </div>
              <ProgressRing percent={pct} size={40} stroke={3} />
            </div>
          )
        })()}
      </div>
      <p className="page__subtitle" style={{ marginBottom: '1rem' }}>
        {clases.length} clases disponibles · Tu progreso se guarda automáticamente.
      </p>

      {/* Breadcrumb */}
      {(currentSpecialty || currentSubsystem) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '1.25rem', fontSize: '0.82rem' }}>
          {breadcrumb.map((b, i) => (
            <React.Fragment key={i}>
              {i > 0 && <ChevronRight size={14} style={{ color: 'var(--text-tertiary)' }} />}
              {b.onClick ? (
                <button onClick={b.onClick} style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem 0.4rem',
                  borderRadius: '4px', color: 'var(--primary-500)', fontWeight: 600,
                }}>
                  {b.label}
                </button>
              ) : (
                <span style={{ color: 'var(--text-primary)', fontWeight: 600, padding: '0.2rem 0.4rem' }}>{b.label}</span>
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {clases.length === 0 ? (
        <div className="card" style={{
          padding: '3rem 2rem', textAlign: 'center',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem'
        }}>
          {loading ? (
            <>
              <div className="spinner" style={{ width: 40, height: 40, border: '3px solid var(--border-color)', borderTop: '3px solid var(--primary-500)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              <p style={{ fontSize: '0.95rem', color: 'var(--text-tertiary)' }}>Cargando clases...</p>
            </>
          ) : (
            <>
              <Video size={48} style={{ color: 'var(--text-tertiary)', opacity: 0.5 }} />
              <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>No hay clases disponibles</p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)', maxWidth: 400 }}>
                Las clases estarán disponibles pronto. Mientras tanto, puedes practicar con las Pruebas EUNACOM.
              </p>
            </>
          )}
        </div>
      ) : !currentSpecialty ? (
        /* ─── Level 1: Specialties ─── */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {specialties.map(spec => {
            const style = getSpecialtyStyle(spec)
            const subsCount = Object.keys(tree[spec]).length
            const lessonCount = Object.values(tree[spec]).reduce((sum, l) => sum + l.length, 0)
            const completedCount = Object.values(tree[spec]).flat().filter(l => getProgress(l.id) >= 100).length
            const specPct = lessonCount ? Math.round((completedCount / lessonCount) * 100) : 0
            return (
              <div key={spec} className="card" onClick={() => setCurrentSpecialty(spec)} style={{
                padding: '1.5rem', cursor: 'pointer', transition: 'all 0.25s',
                borderLeft: `4px solid ${style.color}`,
                background: `linear-gradient(135deg, ${style.bg} 0%, transparent 100%)`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 14, background: style.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: style.color, border: `1px solid ${style.color}25`,
                  }}>
                    {style.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>{spec}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: '0.1rem' }}>
                      {lessonCount} clases · {completedCount > 0 ? `${completedCount} completadas` : `${subsCount} subsistemas`}
                    </div>
                  </div>
                  <ProgressRing percent={specPct} size={42} stroke={3} />
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {Object.keys(tree[spec]).map(sub => {
                    const subStyle = getSubsystemStyle(sub)
                    return (
                      <span key={sub} style={{
                        fontSize: '0.72rem', padding: '0.2rem 0.6rem', borderRadius: '50px',
                        background: subStyle.bg, color: subStyle.color, fontWeight: 600,
                        display: 'flex', alignItems: 'center', gap: '0.3rem',
                      }}>
                        {React.cloneElement(subStyle.icon, { size: 11 })} {sub}
                      </span>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      ) : !currentSubsystem ? (
        /* ─── Level 2: Subsystems ─── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {Object.entries(tree[currentSpecialty]).map(([sub, lessons]) => {
            const subStyle = getSubsystemStyle(sub)
            const completed = lessons.filter(l => getProgress(l.id) >= 100).length
            const subPct = lessons.length ? Math.round((completed / lessons.length) * 100) : 0
            return (
              <div key={sub} className="card" onClick={() => setCurrentSubsystem(sub)} style={{
                padding: '1.25rem 1.5rem', cursor: 'pointer', transition: 'all 0.2s',
                borderLeft: `3px solid ${subStyle.color}`,
                background: `linear-gradient(135deg, ${subStyle.bg} 0%, transparent 100%)`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, background: subStyle.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: subStyle.color, border: `1px solid ${subStyle.color}25`,
                    }}>
                      {subStyle.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{sub}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '0.1rem' }}>
                        {lessons.length} clases · {completed} completadas
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ProgressRing percent={subPct} size={36} stroke={3} />
                    <ChevronRight size={18} style={{ color: 'var(--text-tertiary)' }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : subView === 'pruebas' ? (
        /* ─── Pruebas View ─── */
        <PruebasView
          specialty={currentSpecialty}
          subsystem={currentSubsystem}
          subsystemStyle={getSubsystemStyle(currentSubsystem)}
          onBack={() => setSubView(null)}
        />
      ) : subView === 'clases' ? (
        /* ─── Level 3: Lessons ─── */
        <div style={{ paddingBottom: '2rem' }}>
          <button onClick={() => setSubView(null)} style={{
            background: 'var(--surface-700)', border: '1px solid var(--border-color)',
            borderRadius: 10, padding: '0.5rem 1rem', color: 'var(--text-primary)',
            cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem',
            marginBottom: '1.25rem'
          }}>
            <ChevronLeft size={16} /> Volver
          </button>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {tree[currentSpecialty][currentSubsystem].map(clase => {
              const style = getSpecialtyStyle(currentSpecialty)
              const pct = getProgress(clase.id)
              return (
                <div key={clase.id} className="card" onClick={() => openClase(clase.id)} style={{
                  padding: '1.25rem 1.5rem', cursor: 'pointer', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  borderLeft: `3px solid ${pct >= 100 ? '#10b981' : style.color}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 0 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10, background: pct >= 100 ? 'rgba(16,185,129,0.12)' : style.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1rem', fontWeight: 800, color: pct >= 100 ? '#10b981' : style.color,
                    }}>
                      {pct >= 100 ? <CheckCircle2 size={20} /> : clase.lessonNumber}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {clase.topic}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: '0.15rem' }}>
                        {pct > 0 && pct < 100 && <span style={{ color: '#f59e0b', fontWeight: 600 }}>{pct}% · </span>}
                        Clase {clase.lessonNumber}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {pct > 0 && <ProgressRing percent={pct} size={36} stroke={3} />}
                    <ChevronRight size={18} style={{ color: 'var(--text-tertiary)' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        /* ─── Choice Screen: Clases vs Pruebas ─── */
        (() => {
          const subStyle = getSubsystemStyle(currentSubsystem)
          const lessons = tree[currentSpecialty]?.[currentSubsystem] || []
          const completed = lessons.filter(l => getProgress(l.id) >= 100).length
          const subPct = lessons.length ? Math.round((completed / lessons.length) * 100) : 0
          // Get prueba stats from localStorage
          const pruebaProgress = loadPruebaProgress()
          const pruebaIndex = (() => {
            try { return JSON.parse(sessionStorage.getItem('_prueba_idx') || 'null') } catch { return null }
          })()
          // We'll show a simple count hint
          return (
            <div style={{ paddingBottom: '2rem' }}>
              {/* Subject header */}
              <div className="card" style={{
                padding: '1.5rem', marginBottom: '1.5rem',
                background: `linear-gradient(135deg, ${subStyle.bg} 0%, transparent 100%)`,
                borderLeft: `4px solid ${subStyle.color}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 14, background: subStyle.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: subStyle.color, border: `1px solid ${subStyle.color}25`,
                  }}>
                    {subStyle.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {currentSubsystem}
                    </h2>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '0.15rem' }}>
                      {currentSpecialty} · {lessons.length} clases
                    </div>
                  </div>
                  <ProgressRing percent={subPct} size={46} stroke={3} />
                </div>
              </div>

              {/* Two big cards: Clases and Pruebas */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                {/* Clases card */}
                <div className="card" onClick={() => setSubView('clases')} style={{
                  padding: '1.5rem', cursor: 'pointer', transition: 'all 0.25s',
                  borderTop: `4px solid ${subStyle.color}`,
                  textAlign: 'center',
                }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 16, margin: '0 auto 1rem',
                    background: subStyle.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: subStyle.color,
                  }}>
                    <Presentation size={26} />
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                    Clases
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                    Videos, resúmenes y puntos clave de cada tema
                  </p>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                    padding: '0.4rem 1rem', borderRadius: 50, fontSize: '0.78rem', fontWeight: 600,
                    background: completed === lessons.length && lessons.length > 0 ? 'rgba(16,185,129,0.12)' : subStyle.bg,
                    color: completed === lessons.length && lessons.length > 0 ? '#10b981' : subStyle.color,
                  }}>
                    {completed === lessons.length && lessons.length > 0 ? (
                      <><CheckCircle2 size={13} /> Completadas</>
                    ) : (
                      <>{completed}/{lessons.length} completadas</>
                    )}
                  </div>
                </div>

                {/* Pruebas card */}
                <div className="card" onClick={() => setSubView('pruebas')} style={{
                  padding: '1.5rem', cursor: 'pointer', transition: 'all 0.25s',
                  borderTop: '4px solid #10b981',
                  textAlign: 'center',
                }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 16, margin: '0 auto 1rem',
                    background: 'rgba(16,185,129,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#10b981',
                  }}>
                    <ClipboardList size={26} />
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                    Pruebas EUNACOM
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                    Sets de preguntas tipo examen con explicaciones
                  </p>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                    padding: '0.4rem 1rem', borderRadius: 50, fontSize: '0.78rem', fontWeight: 600,
                    background: 'rgba(16,185,129,0.12)', color: '#10b981',
                  }}>
                    <Target size={13} /> Practica ahora
                  </div>
                </div>
              </div>
            </div>
          )
        })()
      )}
    </div>
  )
}

export default MisClases
