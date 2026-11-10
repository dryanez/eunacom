import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { createTest, genId, fetchProgress, fetchTests } from '../lib/api'
import {
  Stethoscope, CheckCircle2, FileText, AlertCircle, ChevronRight, TrendingUp,
  BookOpen, X, ChevronDown, ChevronUp, PlayCircle, ArrowLeft, Clock,
  GraduationCap, Lock, Check, CheckCircle, Flame, Award, RotateCcw, Flag, ArrowRight
} from 'lucide-react'
import LoadingScreen from '../components/LoadingScreen'
import LoginGateModal from '../components/LoginGateModal'
import PaymentModal from '../components/PaymentModal'
import { useSubscription } from '../contexts/SubscriptionContext'
import '../components/redesign/midnight.css'
import '../components/redesign/clase.css'
import '../components/redesign/sim-recon.css'

const LETTERS = ['A','B','C','D','E']

function toTestRunnerFormat(q, examId) {
  const rawOptions = q.options || q.opciones || []
  const choices = rawOptions.map((text, i) => ({ id: LETTERS[i] || String(i), text }))
  let correctAnswer = null
  const rc = q.correctAnswer || q.respuesta_correcta
  if (rc != null) {
    if (typeof rc === 'string' && /^[A-Ea-e]$/.test(rc)) correctAnswer = rc.toUpperCase()
    else if (typeof rc === 'number' && rc < choices.length) correctAnswer = LETTERS[rc]
  }
  return { id: `${examId}_q${q.id}`, question: q.question || q.pregunta, choices, correctAnswer, explanation: q.explanation || q.explicacion || q.respuesta_texto || '', imageUrl: q.imageUrl || q.image?.src, imageNote: q.image?.nota, imageCredit: q.image?.credit }
}

/* ── Inline Quiz ── */
function InlineQuiz({ questions, title, onClose }) {
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)
  const q = questions[idx]

  const handleSelect = (optId) => {
    if (revealed) return
    setSelected(optId)
    setRevealed(true)
    if (optId.toLowerCase() === q.correctAnswer?.toLowerCase()) {
      setScore(s => s + 1)
    }
  }

  const handleNext = () => {
    if (idx + 1 >= questions.length) { setDone(true); return }
    setIdx(i => i + 1); setSelected(null); setRevealed(false)
  }

  if (done) return (
    <div className="sr-done">
      <div className={`sr-done-pct ${score/questions.length >= 0.6 ? 'ok' : 'bad'}`}>
        {Math.round(score/questions.length*100)}%
      </div>
      <p>{score} de {questions.length} correctas</p>
      <div className="sr-done-act">
        <button className="mn-cl-nb pri" onClick={() => { setIdx(0); setSelected(null); setRevealed(false); setScore(0); setDone(false) }}>
          <RotateCcw size={16}/> Repetir Práctica
        </button>
        <button className="mn-cl-nb" onClick={onClose}>Cerrar</button>
      </div>
    </div>
  )

  return (
    <div className="sr-quiz">
      <div className="sr-quiz-top">
        <span>{idx+1} de {questions.length}</span>
        <div className="sr-bar"><i style={{ width: `${((idx+1)/questions.length)*100}%` }} /></div>
        <button onClick={onClose} className="sr-x" aria-label="Cerrar"><X size={16}/></button>
      </div>

      <div className="sr-q">
        <div className="sr-q-badges">
          <span className="sr-pill">{title || 'Reconstrucción EUNACOM'}</span>
          <span className="sr-pill warn"><Award size={12} /> Reconstrucción Oficial</span>
        </div>

        <p className="sr-q-text">{q.question}</p>

        {(q.imageUrl || q.image?.src) && (
          <div className="sr-q-img">
            <img src={q.imageUrl || q.image.src} alt="Pregunta" />
            {q.image?.nota && <div>{q.image.nota}{q.image.credit ? ` · ${q.image.credit}` : ''}</div>}
          </div>
        )}

        <div className="sr-opts">
          {q.choices.map((opt, i) => {
            const isCorrectOpt = opt.id.toLowerCase() === q.correctAnswer?.toLowerCase()
            const isSelected = opt.id === selected
            let cls = ''
            if (revealed) cls = isCorrectOpt ? 'is-ok' : (isSelected ? 'is-bad' : 'is-off')
            return (
              <button key={opt.id} onClick={() => handleSelect(opt.id)} disabled={revealed} className={`sr-opt ${cls}`}>
                <span className="sr-opt-l">
                  {revealed && isCorrectOpt ? <Check size={15} strokeWidth={2.5} />
                    : revealed && isSelected ? <X size={15} strokeWidth={2.5} />
                    : (opt.id || String.fromCharCode(65 + i))}
                </span>
                <span className="sr-opt-tx">{opt.text}</span>
                {revealed && isCorrectOpt && <span className="sr-opt-tag">Correcto</span>}
                {revealed && isSelected && !isCorrectOpt && <span className="sr-opt-tag">Incorrecto</span>}
              </button>
            )
          })}
        </div>

        {revealed && q.explanation && (
          <div className="sr-expl">
            <div><CheckCircle size={16} /> Retroalimentación Clínica (Guías GES / MINSAL)</div>
            <p>{q.explanation}</p>
          </div>
        )}
      </div>

      {revealed && (
        <button onClick={handleNext} className="mn-cl-nb pri full">
          {idx+1 >= questions.length ? <><Flag size={16}/> Ver resultado del bloque</> : <>Siguiente Pregunta <ArrowRight size={16}/></>}
        </button>
      )}
    </div>
  )
}

/* ── Topic Detail Panel (3rd level: sub-topics) ── */
function TopicDetail({ topic, onPractice, onBack }) {
  return (
    <div>
      <button onClick={onBack} className="mn-cl-back">
        <ArrowLeft size={15}/> Volver
      </button>
      <div className="sr-sec-head">
        <h3>{topic.name}</h3>
        <p>{topic.count} preguntas en total</p>
      </div>
      <button onClick={() => onPractice(topic.questions, topic.name + ' — Todo')} className="mn-cl-nb pri" style={{ width: '100%', marginBottom: '1.1rem' }}>
        <PlayCircle size={18}/> Practicar todo ({topic.count} preguntas)
      </button>
      <div className="sr-label">Desglose por subtema</div>
      <div className="sr-subj">
        {topic.subtopics.map(st => (
          <div key={st.name} className="sr-row" style={{ cursor: 'default' }}>
            <span>{st.name}<br/><em style={{ fontStyle: 'normal', fontSize: '.74rem', color: 'var(--mn-dim)' }}>{st.count} preguntas</em></span>
            <button onClick={() => onPractice(st.questions, st.name)} className="mn-cl-nb" style={{ padding: '.45rem .8rem', fontSize: '.8rem' }}>
              <PlayCircle size={13}/> Practicar
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Subject Card (2nd level: topics list) ── */
function SubjectCard({ subject, onSelectTopic, isLocked, onShowPayment }) {
  const [open, setOpen] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? subject.topics : subject.topics.slice(0, 5)

  return (
    <div className="sr-subj">
      {isLocked && (
        <div className="sr-lock" style={{ cursor: 'pointer' }} onClick={onShowPayment}>
          <span><Lock size={16} /> Desbloquear Acceso Ilimitado</span>
        </div>
      )}
      <button onClick={() => setOpen(o => !o)} className="sr-subj-head" style={{ opacity: isLocked ? 0.5 : 1 }}>
        <span className="sr-ic"><BookOpen size={18} /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '.95rem', color: '#fff' }}>{subject.subject}</div>
          <div style={{ fontSize: '.75rem', color: 'var(--mn-mut)', marginTop: '.1rem' }}>{subject.total} preguntas · {subject.topics.length} temas</div>
        </div>
        {open ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
      </button>
      {open && (
        <div>
          {visible.map((t, i) => (
            <div key={t.name} onClick={() => onSelectTopic(t)} className="sr-row">
              <small>#{i+1}</small>
              <span>{t.name}</span>
              <em>{t.count}</em>
              <ChevronRight size={15}/>
            </div>
          ))}
          {subject.topics.length > 5 && (
            <button onClick={e => { e.stopPropagation(); setShowAll(a => !a) }} className="sr-more">
              {showAll ? <><ChevronUp size={14}/> Mostrar menos</> : <><ChevronDown size={14}/> Ver {subject.topics.length - 5} temas más</>}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// Exámenes con fecha de salida (Julio 2026): «próximamente» hasta el día de salida, hora Chile
const isSoon = e => !!e.coming_soon && Date.now() < Date.parse(`${e.release_date}T00:00:00-03:00`)

/* ── Main ── */
const Reconstructions = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isPremium, hasExceededReconstructions, ownedBooks } = useSubscription()
  const [index, setIndex] = useState(null)
  const [topicIndex, setTopicIndex] = useState(null)
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(null)
  const [examResults, setExamResults] = useState({})
  const [activeTests, setActiveTests] = useState({})
  const [showLoginGate, setShowLoginGate] = useState(false)
  const [activeTab, setActiveTab] = useState('exams')
  const [selectedTopic, setSelectedTopic] = useState(null)   // topic drill-down
  const [activeQuiz, setActiveQuiz] = useState(null)         // { questions, title }
  const [selectedExam, setSelectedExam] = useState(null)     // exam mode modal
  const [resumePrompt, setResumePrompt] = useState(null)     // { exam, selectedMode, activeTest, questions }
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  useEffect(() => { loadData() }, [user])

  const loadData = async () => {
    setLoading(true)
    try {
      const [idxRes, topicRes] = await Promise.all([
        fetch('/data/reconstrucciones/index.json'),
        fetch('/data/reconstrucciones/topic_index.json')
      ])
      const idxData = await idxRes.json()
      const topicData = await topicRes.json()
      setIndex(idxData)
      setTopicIndex(topicData)
      if (user) {
        const progress = await fetchProgress(user.id)
        const pMap = {}
        progress.forEach(p => { pMap[p.question_id] = p })
        const results = {}
        for (const exam of idxData.exams) {
          let total = 0, correct = 0
          for (let i = 1; i <= exam.total_questions; i++) {
            const qid = `${exam.id}_q${i}`
            if (pMap[qid]) { total++; if (pMap[qid].is_correct) correct++ }
          }
          if (total > 0) results[exam.id] = { answered: total, correct, pct: Math.round((correct/total)*100) }
        }
        setExamResults(results)

        // Fetch active tests
        const userTests = await fetchTests(user.id)
        const active = {}
        for (const t of userTests) {
          if (t.status === 'in_progress') {
            const qIds = typeof t.questions === 'string' ? JSON.parse(t.questions) : t.questions || []
            if (qIds.length > 0 && qIds[0].includes('_q')) {
              const examId = qIds[0].split('_q')[0]
              if (!active[examId]) active[examId] = {}
              active[examId][t.mode] = {
                ...t,
                answers: typeof t.answers === 'string' ? JSON.parse(t.answers) : t.answers || {}
              }
            }
          }
        }
        setActiveTests(active)
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const handleStartExam = async (exam, selectedMode) => {
    if (!user) { setShowLoginGate(true); return }
    const activeTest = activeTests[exam.id]?.[selectedMode]
    if (isSoon(exam)) return
    // Julio 2026: gratis con cualquier plan, o comprada suelta en la Tienda (no usa la reconstrucción gratis)
    if (exam.requires_sku && !isPremium && !ownedBooks?.has(exam.requires_sku)) { setSelectedExam(null); navigate('/biblioteca'); return }
    if (!activeTest && !isPremium && hasExceededReconstructions) {
      setShowPaymentModal(true)
      return
    }
    setStarting(exam.id)
    setSelectedExam(null)
    try {
      const res = await fetch(`/data/reconstrucciones/${exam.file}`)
      const data = await res.json()
      const valid = data.questions.filter(q => !q.excluir && (q.opciones || q.options || []).length >= 2)
      if (!valid.length) { alert('Sin preguntas disponibles.'); return }
      const questions = valid.map(q => toTestRunnerFormat(q, exam.id))
      if (activeTest) {
        setResumePrompt({ exam, selectedMode, activeTest, questions })
        return
      }

      const testId = genId()
      const timeLimitSeconds = selectedMode === 'exam' ? questions.length * 60 : 0

      await createTest({ id: testId, userId: user.id, mode: selectedMode, timeLimitSeconds, totalQuestions: questions.length, questions: questions.map(q => q.id) })
      navigate('/test-runner', { state: { testId, questions, isReconstruction: true, examName: exam.name, mode: selectedMode, isSimulation: selectedMode === 'exam', timeLimitSeconds } })
    } catch (e) { alert('Error: ' + (e.message || String(e))) }
    finally { setStarting(null) }
  }

  const handleResumeChoice = async (resume) => {
    if (!resumePrompt) return
    const { exam, selectedMode, activeTest, questions } = resumePrompt
    setResumePrompt(null)
    setStarting(exam.id)

    if (resume) {
      navigate('/test-runner', {
        state: {
          testId: activeTest.id,
          questions,
          isReconstruction: true,
          examName: exam.name,
          mode: selectedMode,
          isSimulation: selectedMode === 'exam',
          timeLimitSeconds: selectedMode === 'exam' ? questions.length * 60 : 0,
          timeLeftSeconds: activeTest.time_left_seconds !== null ? activeTest.time_left_seconds : undefined,
          tutorState: activeTest.tutor_state ? JSON.parse(activeTest.tutor_state) : null,
          savedIndex: activeTest.current_question_index || 0,
          savedAnswers: typeof activeTest.answers === 'string' ? JSON.parse(activeTest.answers) : (activeTest.answers || {})
        }
      })
      setStarting(null)
      return
    }

    // Start new
    if (!isPremium && hasExceededReconstructions) {
      setShowPaymentModal(true)
      return
    }
    try {
      const testId = genId()
      const timeLimitSeconds = selectedMode === 'exam' ? questions.length * 60 : 0
      await createTest({ id: testId, userId: user.id, mode: selectedMode, timeLimitSeconds, totalQuestions: questions.length, questions: questions.map(q => q.id) })
      navigate('/test-runner', { state: { testId, questions, isReconstruction: true, examName: exam.name, mode: selectedMode, isSimulation: selectedMode === 'exam', timeLimitSeconds } })
    } catch (e) { alert('Error: ' + (e.message || String(e))) }
    finally { setStarting(null) }
  }

  const handlePractice = useCallback((questions, title) => {
    setActiveQuiz({ questions: questions.filter(q => !q.excluir), title })
  }, [])

  if (loading) return <LoadingScreen context="test"/>
  if (starting) return <LoadingScreen context="test"/>
  if (!index?.exams?.length) return <div className="sr-page"><div className="mn-cl-hero"><div className="mn-cl-eyebrow">Exámenes oficiales</div><h1 className="mn-cl-title" style={{ margin: 0 }}>Reconstrucciones EUNACOM</h1></div></div>

  const examsByYear = {}
  index.exams.forEach(e => { if (!examsByYear[e.year]) examsByYear[e.year] = []; examsByYear[e.year].push(e) })
  const years = Object.keys(examsByYear).sort((a,b) => Number(b)-Number(a))

  const completedExamsCount = Object.keys(examResults).length
  const avgScoreAcrossExams = completedExamsCount > 0
    ? Math.round(Object.values(examResults).reduce((sum, r) => sum + r.pct, 0) / completedExamsCount)
    : null

  return (
    <div className="sr-page">
      {showLoginGate && <LoginGateModal onClose={() => setShowLoginGate(false)} message="Inicia sesión para practicar con los exámenes EUNACOM reales."/>}
      {showPaymentModal && <PaymentModal onClose={() => setShowPaymentModal(false)} />}

      {/* Quiz Modal */}
      {activeQuiz && (
        <div className="sr-modal">
          <div className="sr-modal-panel wide">
            <div className="sr-modal-head">
              <div>
                <BookOpen size={18} />
                <span>{activeQuiz.title}</span>
              </div>
              <button onClick={() => setActiveQuiz(null)} className="sr-x" aria-label="Cerrar"><X size={18} /></button>
            </div>
            <InlineQuiz questions={activeQuiz.questions} title={activeQuiz.title} onClose={() => setActiveQuiz(null)}/>
          </div>
        </div>
      )}

      {/* Exam Mode Modal */}
      {selectedExam && !resumePrompt && (
        <div className="sr-modal">
          <div className="sr-modal-panel">
            <div className="sr-modal-head">
              <div>
                <Award size={18} />
                <h3>Modo de Examen</h3>
              </div>
              <button onClick={() => setSelectedExam(null)} className="sr-x" aria-label="Cerrar"><X size={18} /></button>
            </div>
            <div className="sr-modal-body">
              <p>
                Estás a punto de comenzar <strong>{selectedExam.name}</strong> ({selectedExam.total_questions} preguntas). Selecciona tu método de entrenamiento:
              </p>
              <div className="sr-modes">
                <button className="sr-mode" onClick={() => handleStartExam(selectedExam, 'tutor')}>
                  <div className="sr-ic"><GraduationCap size={20} /></div>
                  <div className="sr-mode-t">
                    <b>Modo Tutor <span className="sr-pill">Recomendado</span></b>
                    <span>Sin límite de tiempo. Obtén pistas y explicaciones en tiempo real para aprender de tus errores al instante.</span>
                  </div>
                </button>
                <button className="sr-mode amber" onClick={() => handleStartExam(selectedExam, 'exam')}>
                  <div className="sr-ic"><Clock size={20} /></div>
                  <div className="sr-mode-t">
                    <b>Modo Simulacro <span className="sr-pill warn">Cronometrado</span></b>
                    <span>Igual que el EUNACOM. Tiempo calculado ({selectedExam.total_questions} minutos). Sin pistas hasta el final de la prueba.</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resume Prompt Modal */}
      {resumePrompt && (
        <div className="sr-modal">
          <div className="sr-modal-panel narrow">
            <div className="sr-modal-head">
              <div>
                <Clock size={18} style={{ color: '#fbbf24' }} />
                <h3>Examen en Curso</h3>
              </div>
              <button onClick={() => setResumePrompt(null)} className="sr-x" aria-label="Cerrar"><X size={18} /></button>
            </div>
            <div className="sr-modal-body">
              <p>Tienes un intento previo de este examen. ¿Deseas retomarlo donde lo dejaste o empezar uno nuevo desde cero?</p>
              <div className="sr-stack">
                <button onClick={() => handleResumeChoice(true)} className="mn-cl-nb pri">
                  <PlayCircle size={18}/> Continuar examen
                </button>
                <button onClick={() => handleResumeChoice(false)} className="mn-cl-nb">
                  <RotateCcw size={16}/> Empezar de nuevo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <div className="mn-cl-hero">
        <div className="sr-hero-row">
          <div className="sr-hero-ic"><Stethoscope size={24} /></div>
          <div className="sr-hero-main">
            <div className="mn-cl-eyebrow">Exámenes oficiales</div>
            <h1 className="mn-cl-title">Reconstrucciones EUNACOM</h1>
            <p className="sr-hero-sub">
              {index.total_exams} exámenes recopilados y verificados · {index.total_questions.toLocaleString('es-CL')} preguntas reales
            </p>
          </div>
          <div className="sr-hero-side">
            <small>Exámenes rendidos</small>
            <b>{completedExamsCount} <span>/ {index.total_exams}</span></b>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="sr-stats">
        <div className="sr-stat">
          <div className="sr-ic"><FileText size={18} /></div>
          <div><b>{index.total_exams}</b><span>Exámenes</span></div>
        </div>
        <div className="sr-stat">
          <div className="sr-ic"><AlertCircle size={18} /></div>
          <div><b>{index.total_questions.toLocaleString('es-CL')}</b><span>Preguntas</span></div>
        </div>
        <div className="sr-stat">
          <div className="sr-ic"><CheckCircle2 size={18} /></div>
          <div><b>{completedExamsCount}</b><span>Completados</span></div>
        </div>
        <div className="sr-stat">
          <div className="sr-ic"><TrendingUp size={18} /></div>
          <div>
            <b className={avgScoreAcrossExams >= 60 ? 'ok' : ''}>{avgScoreAcrossExams !== null ? `${avgScoreAcrossExams}%` : '—'}</b>
            <span>Promedio</span>
          </div>
        </div>
      </div>

      {/* Midnight Pro: solo «Por examen oficial» (se quitó «Temas más preguntados») */}

      {/* Tab: Exams */}
      {activeTab === 'exams' && years.map(year => (
        <div key={year} className="sr-sec">
          <div className="sr-sec-head">
            <h2 className="sr-year">{year}</h2>
            <span className="sr-pill">
              {examsByYear[year].length} {examsByYear[year].length === 1 ? 'Examen' : 'Exámenes'}
            </span>
          </div>

          <div className="sr-exams">
            {examsByYear[year].map((exam, i) => {
              const result = examResults[exam.id]
              const pct = result?.pct
              const soon = isSoon(exam)
              const hasSku = !exam.requires_sku || isPremium || ownedBooks?.has(exam.requires_sku)
              const isLocked = !soon && (exam.requires_sku ? !hasSku : hasExceededReconstructions);
              const state = result ? (pct >= 60 ? 'is-pass' : 'is-fail') : ''

              return (
                <div
                  key={exam.id}
                  className={`sr-exam ${state} ${isLocked ? 'is-locked' : ''} ${soon ? 'is-soon' : ''}`}
                  onClick={() => soon ? (!isPremium && setShowPaymentModal(true)) : isLocked ? (exam.requires_sku ? navigate('/biblioteca') : setShowPaymentModal(true)) : setSelectedExam(exam)}
                >
                  {exam.requires_sku && (
                    <div className="sr-new">
                      <span className="sr-pill ok">Nuevo</span>
                      <span>{soon ? `Llega el ${new Date(exam.release_date + 'T12:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'long' })} · ` : ''}{isPremium ? 'Incluida gratis en tu plan' : 'Gratis con cualquier plan o $12.999 suelta'}</span>
                    </div>
                  )}
                  {isLocked && (
                    <div className="sr-lock">
                      <span><Lock size={16} /> {exam.requires_sku ? 'Gratis con tu plan · o $12.999 en la Tienda' : 'Desbloquear Acceso Ilimitado'}</span>
                    </div>
                  )}

                  <div className="sr-exam-top">
                    <div className="mn-pd-num">{result ? <CheckCircle2 size={18} /> : <FileText size={18} />}</div>
                    <div className="sr-exam-t">
                      <b>{exam.name}</b>
                      <div className="sr-exam-meta">
                        <span>{exam.total_questions} preguntas oficiales</span>
                        {exam.month && <span>{exam.month} {exam.year}</span>}
                        {exam.questions_with_answers > 0 && (
                          <span className="ok">{exam.questions_with_answers} justificadas</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {result && (
                    <div>
                      <div className="sr-res-top">
                        <span>{result.correct} de {result.answered} correctas</span>
                        <b className={pct >= 60 ? 'ok' : 'bad'}>{pct}%</b>
                      </div>
                      <div className="sr-bar"><i className={pct >= 60 ? '' : 'bad'} style={{ width: `${pct}%` }} /></div>
                    </div>
                  )}

                  <div className="sr-exam-foot">
                    {soon ? (
                      <span className="sr-pill warn">Próximamente</span>
                    ) : !exam.questions_with_answers ? (
                      <span className="sr-pill warn">Sin pauta</span>
                    ) : (
                      <span className="sr-pill ok"><Check size={11} /> Con pauta oficial</span>
                    )}
                    {soon ? (
                      <span className="mn-cl-nb">{isPremium ? 'Te avisamos' : 'Ver planes'}</span>
                    ) : (
                    <span className={`mn-cl-nb ${result ? '' : 'pri'}`}>
                      {result ? <RotateCcw size={14}/> : <PlayCircle size={14}/>} {result ? 'Repetir' : 'Iniciar'}
                    </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* Tab: Topics */}
      {activeTab === 'topics' && (
        <div className="sr-sec">
          {!selectedTopic ? (
            <>
              <div className="sr-callout">
                <Flame size={18} />
                <div><strong>Práctica Estratégica por Tema.</strong> Haz clic en una especialidad para ver los temas más preguntados de exámenes anteriores y practica por subtema.</div>
              </div>
              {topicIndex ? topicIndex.map((subject, i) => (
                <SubjectCard
                  key={subject.subject}
                  subject={subject}
                  onSelectTopic={setSelectedTopic}
                  isLocked={hasExceededReconstructions}
                  onShowPayment={() => setShowPaymentModal(true)}
                />
              )) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--mn-mut)' }}>
                  Cargando índice de temas...
                </div>
              )}
            </>
          ) : (
            <TopicDetail topic={selectedTopic} onPractice={handlePractice} onBack={() => setSelectedTopic(null)}/>
          )}
        </div>
      )}
    </div>
  )
}

export default Reconstructions
