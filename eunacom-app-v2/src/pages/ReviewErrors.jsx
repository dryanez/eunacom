import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { fetchReviewQuestions } from '../lib/api'
import {
  RotateCcw, AlertCircle, BookOpen, Target, ChevronDown, ChevronUp,
  Layers, Tag, Video, ChevronLeft, ChevronRight, Check, CheckCircle, PlayCircle, Flame, Award
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const ReviewErrors = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedQ, setExpandedQ] = useState(null)
  const [fullscreenImage, setFullscreenImage] = useState(null)
  const [filterSpecialty, setFilterSpecialty] = useState('all')
  const scrollContainerRef = useRef(null)

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' })
    }
  }

  useEffect(() => {
    if (user) loadData()
  }, [user])

  const loadData = async () => {
    try {
      setLoading(true)
      const [progressRes, dbRes] = await Promise.all([
        fetch('/api/progress?userId=' + user.id).then(r => r.json()),
        fetch('/data/questionDB.json').then(r => r.json())
      ])
      
      const progressList = progressRes.data || []
      const allQs = dbRes || []
      
      const errorQMap = new Map()
      progressList.forEach(p => {
        if (p.is_correct === 0 || p.is_omitted === 1) {
          // If multiple attempts, keep the latest
          const existing = errorQMap.get(p.question_id)
          const currentDate = p.answered_at ? new Date(p.answered_at.replace(' ', 'T') + 'Z').getTime() : 0
          const existingDate = existing ? new Date(existing.replace(' ', 'T') + 'Z').getTime() : 0
          if (!existing || currentDate > existingDate) {
            errorQMap.set(p.question_id, p.answered_at)
          }
        }
      })
      
      const errorQuestions = allQs
        .filter(q => errorQMap.has(q.id))
        .map(q => {
          const rawDate = errorQMap.get(q.id)
          const safeDateStr = rawDate ? rawDate.replace(' ', 'T') + 'Z' : new Date().toISOString()
          return {
            id: q.id,
            pregunta: q.question,
            opciones: q.choices,
            respuestaCorrecta: q.correctAnswer,
            explicacion: q.explanation,
            explicacionIncorrectas: q.incorrectExplanations,
            specialty: q.topic || 'General',
            topic: q.topic || '',
            category: q.category || '',
            tags: q.tags || '',
            answeredAt: safeDateStr,
            imageUrl: q.imageUrl
          }
        })
        .sort((a, b) => new Date(b.answeredAt).getTime() - new Date(a.answeredAt).getTime())
        
      setQuestions(errorQuestions)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  // Aggregate stats by specialty
  const specialtyStats = useMemo(() => {
    const stats = {}
    questions.forEach(q => {
      const spec = q.specialty || 'General'
      if (!stats[spec]) stats[spec] = 0
      stats[spec]++
    })
    return Object.entries(stats).sort((a, b) => b[1] - a[1])
  }, [questions])

  const filteredQuestions = useMemo(() => {
    if (filterSpecialty === 'all') return questions
    return questions.filter(q => (q.specialty || 'General') === filterSpecialty)
  }, [questions, filterSpecialty])

  if (!user) return null

  return (
    <div className="page" style={{ paddingBottom: '4rem' }}>
      <header className="page__header">
        <h1 className="page__title">
          <RotateCcw style={{ color: 'var(--primary-400)' }} /> Repasar Errores
        </h1>
        <p className="page__subtitle">Revisa las preguntas en las que te has equivocado y fortalece tus puntos débiles.</p>
      </header>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--primary-500)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : questions.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#10b981' }}>
            <Target size={40} />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>¡Excelente trabajo!</h2>
          <p style={{ color: 'var(--surface-300)', maxWidth: 400, margin: '0 auto' }}>
            No tienes errores registrados recientes. Sigue practicando en Simulacros o Mis Clases.
          </p>
        </div>
      ) : (
        <>
          {/* Weakest Topics Dashboard */}
          <section style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={20} color="var(--accent-amber)" /> Tus Puntos Débiles
              </h2>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={scrollLeft} style={{ background: 'var(--surface-700)', border: 'none', color: 'var(--surface-200)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <ChevronLeft size={20} />
                </button>
                <button onClick={scrollRight} style={{ background: 'var(--surface-700)', border: 'none', color: 'var(--surface-200)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
            <div 
              ref={scrollContainerRef}
              style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              className="hide-scrollbar"
            >
              <div 
                className={`glass-card ${filterSpecialty === 'all' ? 'active-filter' : ''}`}
                style={{ 
                  padding: '1rem', minWidth: 140, cursor: 'pointer', flexShrink: 0,
                  border: filterSpecialty === 'all' ? '1px solid var(--primary-500)' : '1px solid var(--surface-600)',
                  background: filterSpecialty === 'all' ? 'rgba(14, 165, 233, 0.1)' : 'var(--surface-800)'
                }}
                onClick={() => setFilterSpecialty('all')}
              >
                <div style={{ fontSize: '0.85rem', color: 'var(--surface-300)', marginBottom: '0.5rem' }}>Todas</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{questions.length}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--surface-400)', marginTop: '0.5rem' }}>Errores totales</div>
              </div>

              {specialtyStats.map(([spec, count]) => (
                <div 
                  key={spec}
                  className={`glass-card`}
                  style={{ 
                    padding: '1rem', minWidth: 160, cursor: 'pointer', flexShrink: 0,
                    border: filterSpecialty === spec ? '1px solid var(--accent-red)' : '1px solid var(--surface-600)',
                    background: filterSpecialty === spec ? 'rgba(239, 68, 68, 0.1)' : 'var(--surface-800)'
                  }}
                  onClick={() => setFilterSpecialty(spec)}
                >
                  <div style={{ fontSize: '0.85rem', color: filterSpecialty === spec ? 'var(--accent-red)' : 'var(--surface-300)', marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {spec}
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{count}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--surface-400)', marginTop: '0.5rem' }}>Errores</div>
                </div>
              ))}
            </div>
          </section>

          {/* Question List */}
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.2rem' }}>Preguntas a Repasar ({filteredQuestions.length})</h2>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredQuestions.map((q, idx) => {
                const isExpanded = expandedQ === q.id
                
                return (
                  <div key={q.id} className="glass-card" style={{ padding: 0, overflow: 'hidden', borderRadius: 16, border: '1px solid var(--surface-700)' }}>
                    <div 
                      style={{ padding: '1rem', cursor: 'pointer', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}
                      onClick={() => setExpandedQ(isExpanded ? null : q.id)}
                    >
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(239,68,68,0.15)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 800, fontSize: '0.85rem' }}>
                        {idx + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.74rem', padding: '2px 10px', background: 'rgba(14, 165, 233, 0.12)', border: '1px solid rgba(14, 165, 233, 0.3)', borderRadius: 12, color: '#38bdf8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Layers size={12} /> {q.specialty || 'General'}
                          </span>
                          {q.tags && q.tags.split(',').map(t => (
                            <span key={t} style={{ fontSize: '0.72rem', padding: '2px 8px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: 12, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Tag size={11} /> {t.trim()}
                            </span>
                          ))}
                          <span style={{ fontSize: '0.74rem', color: 'var(--surface-400)', marginLeft: 'auto' }}>
                            {new Date(q.answeredAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.98rem', color: 'var(--surface-50)', lineHeight: 1.6, fontWeight: 500 }}>
                          {q.pregunta}
                          {q.imageUrl && (
                              <div style={{ marginTop: '0.75rem', cursor: 'zoom-in' }} onClick={(e) => { e.stopPropagation(); setFullscreenImage(q.imageUrl) }}>
                                  <img src={q.imageUrl} alt="Pregunta" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', border: '1px solid var(--surface-700)' }} />
                              </div>
                          )}
                        </div>
                      </div>
                      <div style={{ color: 'var(--surface-400)', marginTop: 2 }}>
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div style={{ padding: '1.25rem 1.25rem 1.5rem', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
                        {/* Options rendered in Hero Shot style */}
                        {q.opciones && q.opciones.length > 0 && (
                          <div style={{ marginBottom: '1.25rem' }}>
                            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.6rem' }}>
                              Alternativas del Examen
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              {q.opciones.map((opt, optIdx) => {
                                const isCorrect = opt.id.toLowerCase() === q.respuestaCorrecta?.toLowerCase()
                                return (
                                  <div
                                    key={opt.id}
                                    style={{
                                      padding: '11px 14px',
                                      borderRadius: 12,
                                      border: isCorrect ? '1.5px solid #10b981' : '1.5px solid #e2e8f0',
                                      backgroundColor: isCorrect ? '#ecfdf5' : '#ffffff',
                                      color: isCorrect ? '#065f46' : '#475569',
                                      fontSize: '0.9rem',
                                      lineHeight: 1.5,
                                      display: 'flex',
                                      alignItems: 'flex-start',
                                      gap: 10,
                                      opacity: isCorrect ? 1 : 0.6
                                    }}
                                  >
                                    <div style={{
                                      width: 24, height: 24, minWidth: 24, borderRadius: 7,
                                      backgroundColor: 'rgba(0,0,0,0.03)',
                                      border: '1px solid rgba(0,0,0,0.06)',
                                      color: isCorrect ? '#10b981' : '#64748b',
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      flexShrink: 0, marginTop: 1
                                    }}>
                                      {isCorrect ? <Check size={15} color="#10b981" strokeWidth={2.5} /> : <span style={{ fontWeight: 700, fontSize: '0.8rem' }}>{opt.id || String.fromCharCode(65 + optIdx)}</span>}
                                    </div>
                                    <span style={{ flex: 1, paddingTop: 1 }}>{opt.text}</span>
                                    {isCorrect && (
                                      <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: '#059669', fontWeight: 700, flexShrink: 0 }}>
                                        ✓ Correcta
                                      </span>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        {/* Retroalimentación Clínica Official Card */}
                        {q.explicacion && (
                          <div style={{
                            marginTop: 14,
                            padding: '14px 16px',
                            backgroundColor: '#f0fdf4',
                            border: '1px solid #bbf7d0',
                            borderRadius: 12
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#166534', fontWeight: 700, fontSize: '0.88rem', marginBottom: 6 }}>
                              <CheckCircle size={16} color="#16a34a" /> Retroalimentación Clínica (Guías GES / MINSAL)
                            </div>
                            <p style={{ fontSize: '0.88rem', color: '#15803d', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
                              {q.explicacion}
                            </p>
                          </div>
                        )}

                        {(() => {
                          const topic = q.topic || '';
                          const cat = q.category || '';
                          const targetSubsystem = topic === 'Cirugía y Anestesia' ? 'Cirugía General y Anestesia' 
                                                : topic === 'Neurología' ? 'Neurología y Geriatría' 
                                                : topic;
                          const lessonNumStr = cat.replace(/[^0-9]/g, '');
                          const lessonNumber = lessonNumStr ? parseInt(lessonNumStr, 10) : null;
                          
                          if (targetSubsystem && lessonNumber) {
                            return (
                              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                <button 
                                  className="btn-premium"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate('/mis-clases', { state: { openSubsystem: targetSubsystem, openLesson: lessonNumber } });
                                  }}
                                >
                                  <Video size={18} /> Ver Video de la Clase
                                </button>
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        </>
      )}

      {fullscreenImage && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', cursor: 'zoom-out' }} onClick={() => setFullscreenImage(null)}>
              <img src={fullscreenImage} alt="Fullscreen" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '8px' }} />
          </div>
      )}
    </div>
  )
}

export default ReviewErrors
