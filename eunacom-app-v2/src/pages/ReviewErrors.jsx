import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { fetchReviewQuestions } from '../lib/api'
import {
  RotateCcw, AlertCircle, BookOpen, Target, ChevronDown, ChevronUp,
  Layers, Tag, Video, ChevronLeft, ChevronRight, Check, CheckCircle
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import '../components/redesign/clase.css'
import '../components/redesign/misc-pages.css'

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
    <div className="mn-mp">
      <header className="mn-cl-hero">
        <div className="mn-cl-eyebrow">Repaso</div>
        <h1 className="mn-cl-title">Repasar errores</h1>
        <p className="mn-mp-sub">Revisa las preguntas en las que te has equivocado y fortalece tus puntos débiles.</p>
        {!loading && questions.length > 0 && (
          <div className="mn-cl-chips">
            <span className="mn-cl-chip"><RotateCcw size={13} /> {questions.length} errores</span>
            <span className="mn-cl-chip"><Layers size={13} /> {specialtyStats.length} especialidades</span>
          </div>
        )}
      </header>

      {loading ? (
        <div className="mn-mp-spin"><i /></div>
      ) : questions.length === 0 ? (
        <div className="mn-mp-card mn-mp-empty">
          <div className="mn-mp-bigic ok"><Target size={30} /></div>
          <h2>¡Excelente trabajo!</h2>
          <p>No tienes errores registrados recientes. Sigue practicando en Simulacros o Mis Clases.</p>
        </div>
      ) : (
        <>
          {/* Weakest Topics Dashboard */}
          <section>
            <div className="mn-mp-head">
              <h2 className="mn-mp-h2"><AlertCircle size={19} style={{ color: '#fbbf24' }} /> Tus puntos débiles</h2>
              <div className="mn-row" style={{ gap: '.4rem' }}>
                <button className="mn-mp-iconbtn" onClick={scrollLeft} aria-label="Anterior"><ChevronLeft size={18} /></button>
                <button className="mn-mp-iconbtn" onClick={scrollRight} aria-label="Siguiente"><ChevronRight size={18} /></button>
              </div>
            </div>
            <div ref={scrollContainerRef} className="mn-re-scroll">
              <button
                className={`mn-re-stat${filterSpecialty === 'all' ? ' on' : ''}`}
                onClick={() => setFilterSpecialty('all')}
              >
                <span>Todas</span>
                <b>{questions.length}</b>
                <small>Errores totales</small>
              </button>

              {specialtyStats.map(([spec, count]) => (
                <button
                  key={spec}
                  className={`mn-re-stat${filterSpecialty === spec ? ' on-red' : ''}`}
                  onClick={() => setFilterSpecialty(spec)}
                >
                  <span>{spec}</span>
                  <b>{count}</b>
                  <small>Errores</small>
                </button>
              ))}
            </div>
          </section>

          {/* Question List */}
          <section>
            <div className="mn-mp-head">
              <h2 className="mn-mp-h2"><BookOpen size={19} /> Preguntas a repasar ({filteredQuestions.length})</h2>
            </div>

            <div className="mn-re-list">
              {filteredQuestions.map((q, idx) => {
                const isExpanded = expandedQ === q.id

                return (
                  <div key={q.id} className={`mn-re-q${isExpanded ? ' open' : ''}`}>
                    <div className="mn-re-qhead" onClick={() => setExpandedQ(isExpanded ? null : q.id)}>
                      <div className="mn-re-qn">{idx + 1}</div>
                      <div className="mn-re-qmain">
                        <div className="mn-re-tags">
                          <span className="mn-re-tag"><Layers size={12} /> {q.specialty || 'General'}</span>
                          {q.tags && q.tags.split(',').map(t => (
                            <span key={t} className="mn-re-tag amber"><Tag size={11} /> {t.trim()}</span>
                          ))}
                          <span className="mn-re-date">{new Date(q.answeredAt).toLocaleDateString()}</span>
                        </div>
                        <div className="mn-re-text">
                          {q.pregunta}
                          {q.imageUrl && (
                            <div className="mn-re-img" onClick={(e) => { e.stopPropagation(); setFullscreenImage(q.imageUrl) }}>
                              <img src={q.imageUrl} alt="Pregunta" />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mn-re-chev">
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mn-re-body">
                        {q.opciones && q.opciones.length > 0 && (
                          <div style={{ marginBottom: '1rem' }}>
                            <div className="mn-mp-label">Alternativas del examen</div>
                            {q.opciones.map((opt, optIdx) => {
                              const isCorrect = opt.id.toLowerCase() === q.respuestaCorrecta?.toLowerCase()
                              return (
                                <div key={opt.id} className={`mn-cl-opt ${isCorrect ? 'ok' : 'dim'}`}>
                                  <span className="l">
                                    {isCorrect ? <Check size={15} strokeWidth={2.5} /> : (opt.id || String.fromCharCode(65 + optIdx))}
                                  </span>
                                  <span className="t">{opt.text}</span>
                                  {isCorrect && <span className="tag"><Check size={13} strokeWidth={2.5} /> Correcta</span>}
                                </div>
                              )
                            })}
                          </div>
                        )}

                        {q.explicacion && (
                          <div className="mn-cl-fb">
                            <div className="mn-cl-fb-h"><CheckCircle size={16} /> Retroalimentación clínica (Guías GES / MINSAL)</div>
                            <p className="mn-re-fb-text">{q.explicacion}</p>
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
                              <div className="mn-re-go">
                                <button
                                  className="mn-cl-nb pri"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate('/mis-clases', { state: { openSubsystem: targetSubsystem, openLesson: lessonNumber } });
                                  }}
                                >
                                  <Video size={18} /> Ver video de la clase
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
        <div className="mn-re-full" onClick={() => setFullscreenImage(null)}>
          <img src={fullscreenImage} alt="Fullscreen" />
        </div>
      )}
    </div>
  )
}

export default ReviewErrors
