import React, { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { fetchReviewQuestions } from '../lib/api'
import { RotateCcw, AlertCircle, BookOpen, Target, ChevronDown, ChevronUp, Layers, Tag } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const ReviewErrors = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedQ, setExpandedQ] = useState(null)
  const [filterSpecialty, setFilterSpecialty] = useState('all')

  useEffect(() => {
    if (user) loadData()
  }, [user])

  const loadData = async () => {
    try {
      setLoading(true)
      const data = await fetchReviewQuestions(user.id)
      setQuestions(data)
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
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={20} color="var(--accent-amber)" /> Tus Puntos Débiles
            </h2>
            <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
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
                  <div key={q.id} className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div 
                      style={{ padding: '1.2rem', cursor: 'pointer', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}
                      onClick={() => setExpandedQ(isExpanded ? null : q.id)}
                    >
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 700 }}>
                        {idx + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.7rem', padding: '2px 8px', background: 'var(--surface-700)', borderRadius: 12, color: 'var(--surface-200)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Layers size={12} /> {q.specialty || 'General'}
                          </span>
                          {q.tags && q.tags.split(',').map(t => (
                            <span key={t} style={{ fontSize: '0.7rem', padding: '2px 8px', background: 'rgba(14, 165, 233, 0.1)', borderRadius: 12, color: 'var(--primary-300)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Tag size={12} /> {t.trim()}
                            </span>
                          ))}
                          <span style={{ fontSize: '0.7rem', color: 'var(--surface-400)', marginLeft: 'auto' }}>
                            {new Date(q.answeredAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div style={{ fontSize: '1rem', color: 'var(--surface-50)', lineHeight: 1.5 }}>
                          {q.pregunta}
                        </div>
                      </div>
                      <div style={{ color: 'var(--surface-400)' }}>
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div style={{ padding: '1.2rem', borderTop: '1px solid var(--surface-700)', background: 'var(--surface-900)' }}>
                        <div style={{ marginBottom: '1.5rem' }}>
                          <h4 style={{ fontSize: '0.85rem', color: 'var(--surface-300)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Respuesta Correcta</h4>
                          <div style={{ padding: '1rem', background: 'rgba(16,185,129,0.05)', borderLeft: '4px solid #10b981', borderRadius: '0 8px 8px 0', color: 'var(--surface-50)' }}>
                            {q.opciones?.find(o => o.id.toLowerCase() === q.respuestaCorrecta?.toLowerCase())?.text || `Opción ${q.respuestaCorrecta}`}
                          </div>
                        </div>

                        {q.explicacion && (
                          <div style={{ marginBottom: '1.5rem' }}>
                            <h4 style={{ fontSize: '0.85rem', color: 'var(--surface-300)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Explicación</h4>
                            <div style={{ fontSize: '0.95rem', color: 'var(--surface-200)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                              {q.explicacion}
                            </div>
                          </div>
                        )}

                        {q.claseId && (
                          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button 
                              className="btn-premium"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/mis-clases`); // In a real scenario, scroll or focus to the specific module using q.claseId
                              }}
                            >
                              <BookOpen size={18} /> Ir a la Clase
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        </>
      )}
    </div>
  )
}

export default ReviewErrors
