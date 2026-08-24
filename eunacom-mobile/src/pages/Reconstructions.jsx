import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { createTest, genId, fetchProgress, fetchTests } from '../lib/api'
import {
  Stethoscope, CheckCircle2, FileText, AlertCircle, ChevronRight, TrendingUp,
  BookOpen, X, ChevronDown, ChevronUp, PlayCircle, ArrowLeft, Clock,
  GraduationCap, Lock, Check, CheckCircle, Flame, Award, Sparkles
} from 'lucide-react'
import LoadingScreen from '../components/LoadingScreen'
import LoginGateModal from '../components/LoginGateModal'
import PaymentModal from '../components/PaymentModal'
import { useSubscription } from '../contexts/SubscriptionContext'
import { useTheme } from '../contexts/ThemeContext'
import '../styles/proMaxPages.css'

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
  return { id: `${examId}_q${q.id}`, question: q.question || q.pregunta, choices, correctAnswer, explanation: q.explanation || q.explicacion || q.respuesta_texto || '', imageUrl: q.imageUrl }
}

/* ── Inline Quiz (Hero Shot Style) ── */
function InlineQuiz({ questions, title, onClose }) {
  const { isDark } = useTheme()
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
    <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
      <div style={{ fontSize: '3.8rem', fontWeight: 900, color: score/questions.length >= 0.6 ? '#10b981' : '#ef4444', marginBottom: '0.5rem', lineHeight: 1 }}>
        {Math.round(score/questions.length*100)}%
      </div>
      <div style={{ color: 'var(--surface-300)', marginBottom: '1.75rem', fontSize: '1rem' }}>
        {score} de {questions.length} correctas
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="btn-primary" onClick={() => { setIdx(0); setSelected(null); setRevealed(false); setScore(0); setDone(false) }} style={{ padding: '0.75rem 1.5rem', borderRadius: 10, fontWeight: 700 }}>
          Repetir Práctica
        </button>
        <button onClick={onClose} style={{ padding: '0.75rem 1.5rem', borderRadius: 10, background: 'var(--surface-700)', color: 'var(--surface-200)', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
          Cerrar
        </button>
      </div>
    </div>
  )

  const isCorrectChoice = selected && selected.toLowerCase() === q.correctAnswer?.toLowerCase()

  return (
    <div style={{ padding: '1.25rem' }}>
      {/* Top progress & close header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--surface-300)', fontWeight: 700 }}>{idx+1} de {questions.length}</span>
        <div style={{ flex: 1, height: 6, background: 'var(--surface-700)', borderRadius: 9999, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${((idx+1)/questions.length)*100}%`, background: '#0284c7', borderRadius: 9999, transition: 'width 0.3s' }} />
        </div>
        <button onClick={onClose} style={{ background: 'var(--surface-700)', border: 'none', color: 'var(--surface-300)', cursor: 'pointer', padding: 6, borderRadius: 8, display: 'flex', alignItems: 'center' }}>
          <X size={16}/>
        </button>
      </div>

      {/* Question Card (Night/Light Theme) */}
      <div style={{
        backgroundColor: isDark ? '#0f172a' : '#ffffff',
        border: isDark ? '1px solid #334155' : '1px solid #cbd5e1',
        borderRadius: 18,
        padding: '22px 18px',
        boxShadow: isDark ? '0 10px 28px -4px rgba(0, 0, 0, 0.4)' : '0 10px 28px -4px rgba(0, 0, 0, 0.15)',
        marginBottom: '1.25rem'
      }}>
        {/* Badges row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 6 }}>
          <span style={{
            backgroundColor: isDark ? 'rgba(14, 165, 233, 0.15)' : '#e0f2fe',
            border: isDark ? '1px solid rgba(14, 165, 233, 0.3)' : '1px solid #bae6fd',
            color: isDark ? '#38bdf8' : '#0369a1',
            fontSize: '0.74rem', fontWeight: 700, padding: '3px 10px', borderRadius: 9999
          }}>
            {title || 'Reconstrucción EUNACOM'}
          </span>
          <span style={{
            backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : '#fef3c7',
            border: isDark ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid #fde68a',
            color: isDark ? '#fbbf24' : '#92400e',
            fontSize: '0.74rem', fontWeight: 700, padding: '3px 10px', borderRadius: 9999, display: 'flex', alignItems: 'center', gap: 4
          }}>
            <Award size={12} color={isDark ? '#fbbf24' : '#d97706'} /> Reconstrucción Oficial
          </span>
        </div>

        {/* Question Text */}
        <p style={{ fontSize: '0.98rem', lineHeight: 1.65, color: isDark ? '#f8fafc' : '#1e293b', marginBottom: 16, fontWeight: 500 }}>
          {q.question}
        </p>

        {q.imageUrl && (
          <div style={{ marginBottom: '1.25rem' }}>
            <img src={q.imageUrl} alt="Pregunta" style={{ maxWidth: '100%', maxHeight: '250px', borderRadius: '8px', border: isDark ? '1px solid #334155' : '1px solid #cbd5e1' }} />
          </div>
        )}

        {/* Options list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {q.choices.map((opt, i) => {
            const isCorrectOpt = opt.id.toLowerCase() === q.correctAnswer?.toLowerCase()
            const isSelected = opt.id === selected
            
            let bg = isDark ? 'rgba(30, 41, 59, 0.6)' : '#ffffff'
            let border = isDark ? '#334155' : '#e2e8f0'
            let textColor = isDark ? '#e2e8f0' : '#334155'
            let badgeContent = <span style={{ color: isDark ? '#94a3b8' : '#64748b', fontWeight: 700, fontSize: '0.84rem' }}>{opt.id || String.fromCharCode(65 + i)}</span>

            if (revealed) {
              if (isCorrectOpt) {
                bg = isDark ? 'rgba(16, 185, 129, 0.18)' : '#ecfdf5'
                border = '#10b981'
                textColor = isDark ? '#34d399' : '#065f46'
                badgeContent = <Check size={15} color="#10b981" strokeWidth={2.5} />
              } else if (isSelected && !isCorrectOpt) {
                bg = isDark ? 'rgba(239, 68, 68, 0.18)' : '#fef2f2'
                border = '#ef4444'
                textColor = isDark ? '#f87171' : '#991b1b'
                badgeContent = <X size={15} color="#ef4444" strokeWidth={2.5} />
              } else {
                bg = isDark ? 'rgba(15, 23, 42, 0.4)' : '#f8fafc'
                border = isDark ? '#1e293b' : '#f1f5f9'
                textColor = isDark ? '#64748b' : '#94a3b8'
                badgeContent = <span style={{ color: isDark ? '#475569' : '#cbd5e1', fontWeight: 700, fontSize: '0.84rem' }}>{opt.id || String.fromCharCode(65 + i)}</span>
              }
            }

            return (
              <button
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                disabled={revealed}
                style={{
                  textAlign: 'left',
                  padding: '12px 14px',
                  borderRadius: 12,
                  border: `1.5px solid ${border}`,
                  backgroundColor: bg,
                  color: textColor,
                  fontSize: '0.92rem',
                  lineHeight: 1.5,
                  cursor: revealed ? 'default' : 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  width: '100%',
                  opacity: (revealed && !isCorrectOpt && !isSelected) ? 0.45 : 1
                }}
              >
                <div style={{
                  width: 24, height: 24, minWidth: 24, borderRadius: 7,
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0,0,0,0.03)',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0,0,0,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, marginTop: 1
                }}>
                  {badgeContent}
                </div>
                <span style={{ flex: 1, paddingTop: 1 }}>{opt.text}</span>
                {revealed && isCorrectOpt && (
                  <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: isDark ? '#34d399' : '#059669', fontWeight: 700, flexShrink: 0, marginTop: 2 }}>
                    ✓ Correcto
                  </span>
                )}
                {revealed && isSelected && !isCorrectOpt && (
                  <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: isDark ? '#f87171' : '#dc2626', fontWeight: 700, flexShrink: 0, marginTop: 2 }}>
                    ✗ Incorrecto
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Retroalimentación Clínica Official Card */}
        {revealed && q.explanation && (
          <div style={{
            marginTop: 16,
            padding: '16px 18px',
            backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#f0fdf4',
            border: isDark ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid #bbf7d0',
            borderRadius: 14
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: isDark ? '#34d399' : '#166534', fontWeight: 700, fontSize: '0.9rem', marginBottom: 6 }}>
              <CheckCircle size={16} color={isDark ? '#34d399' : '#16a34a'} /> Retroalimentación Clínica (Guías GES / MINSAL)
            </div>
            <p style={{ fontSize: '0.88rem', color: isDark ? '#a7f3d0' : '#15803d', lineHeight: 1.6, margin: 0 }}>
              {q.explanation}
            </p>
          </div>
        )}
      </div>

      {/* Action CTA */}
      {revealed && (
        <button onClick={handleNext} className="btn-primary btn-primary--full" style={{ padding: '0.9rem', borderRadius: 10, fontWeight: 700, fontSize: '0.95rem' }}>
          {idx+1 >= questions.length ? '🏁 Ver resultado del bloque' : 'Siguiente Pregunta →'}
        </button>
      )}
    </div>
  )
}

/* ── Topic Detail Panel (3rd level: sub-topics) ── */
function TopicDetail({ topic, onPractice, onBack }) {
  return (
    <div>
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', color: 'var(--primary-400)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem', padding: 0 }}>
        <ArrowLeft size={15}/> Volver
      </button>
      <div style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--surface-100)' }}>{topic.name}</h3>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--surface-400)' }}>{topic.count} preguntas en total</p>
      </div>
      {/* Practice all */}
      <button onClick={() => onPractice(topic.questions, topic.name + ' — Todo')} style={{ width: '100%', padding: '0.85rem', marginBottom: '1.25rem', background: 'var(--primary-600)', border: 'none', borderRadius: 10, color: 'white', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
        <PlayCircle size={18}/> Practicar todo ({topic.count} preguntas)
      </button>
      {/* Sub-topics */}
      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--surface-500)', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>DESGLOSE POR SUBTEMA</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {topic.subtopics.map(st => (
          <div key={st.name} style={{ background: 'var(--surface-800)', borderRadius: 10, border: '1px solid var(--surface-700)', padding: '0.9rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--surface-100)' }}>{st.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--surface-500)', marginTop: '0.15rem' }}>{st.count} preguntas</div>
            </div>
            <button onClick={() => onPractice(st.questions, st.name)} style={{ padding: '0.4rem 0.9rem', borderRadius: 7, background: 'rgba(99,102,241,0.15)', color: 'var(--primary-300)', border: '1px solid rgba(99,102,241,0.3)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
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
    <div style={{ background: 'var(--surface-800)', borderRadius: 10, border: '1px solid var(--surface-700)', overflow: 'hidden', marginBottom: '0.75rem', position: 'relative' }}>
      {isLocked && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(11,17,32,0.6)', backdropFilter: 'blur(2px)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={onShowPayment}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface-700)', padding: '0.5rem 1rem', borderRadius: '10px', color: 'white', fontWeight: 600, fontSize: '0.85rem' }}>
            <Lock size={16} color="#fbbf24" /> Upgrade to Full Access
          </div>
        </div>
      )}
      <button onClick={() => setOpen(o => !o)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', opacity: isLocked ? 0.5 : 1 }}>
        <span style={{ fontSize: '1.4rem' }}>{subject.emoji}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--surface-100)' }}>{subject.subject}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--surface-400)', marginTop: '0.1rem' }}>{subject.total} preguntas · {subject.topics.length} temas</div>
        </div>
        {open ? <ChevronUp size={18} color="var(--surface-400)"/> : <ChevronDown size={18} color="var(--surface-400)"/>}
      </button>
      {open && (
        <div style={{ borderTop: '1px solid var(--surface-700)' }}>
          {visible.map((t, i) => (
            <div key={t.name} onClick={() => onSelectTopic(t)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--surface-700)', cursor: 'pointer', transition: 'background 0.1s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <span style={{ minWidth: 22, fontSize: '0.72rem', fontWeight: 700, color: 'var(--surface-500)' }}>#{i+1}</span>
              <span style={{ flex: 1, fontSize: '0.9rem', color: 'var(--surface-200)' }}>{t.name}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--surface-400)', marginRight: '0.25rem' }}>{t.count}</span>
              <ChevronRight size={15} color="var(--primary-400)"/>
            </div>
          ))}
          {subject.topics.length > 5 && (
            <button onClick={e => { e.stopPropagation(); setShowAll(a => !a) }} style={{ width: '100%', padding: '0.6rem', background: 'none', border: 'none', color: 'var(--primary-400)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
              {showAll ? '▲ Mostrar menos' : `▼ Ver ${subject.topics.length - 5} temas más`}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Main ── */
const Reconstructions = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isPremium, hasExceededReconstructions } = useSubscription()
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
    if (!activeTest && !isPremium && hasExceededReconstructions) {
      setShowPaymentModal(true)
      return
    }
    setStarting(exam.id)
    setSelectedExam(null)
    try {
      const res = await fetch(`/data/reconstrucciones/${exam.file}`)
      const data = await res.json()
      const valid = data.questions.filter(q => (q.opciones || q.options || []).length >= 2)
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
    setActiveQuiz({ questions, title })
  }, [])

  if (loading) return <LoadingScreen context="test"/>
  if (starting) return <LoadingScreen context="test"/>
  if (!index?.exams?.length) return <div className="page"><h1 className="page__title">Reconstrucciones EUNACOM</h1></div>

  const examsByYear = {}
  index.exams.forEach(e => { if (!examsByYear[e.year]) examsByYear[e.year] = []; examsByYear[e.year].push(e) })
  const years = Object.keys(examsByYear).sort((a,b) => Number(b)-Number(a))

  const completedExamsCount = Object.keys(examResults).length
  const avgScoreAcrossExams = completedExamsCount > 0
    ? Math.round(Object.values(examResults).reduce((sum, r) => sum + r.pct, 0) / completedExamsCount)
    : null

  return (
    <div className="promax-page-wrapper" style={{ paddingBottom: '3.5rem' }}>
      {/* Ambient Backdrop Glows */}
      <div className="promax-ambient-bg">
        <div className="promax-ambient-glow promax-glow-cyan" style={{ top: -80, left: '8%', width: 520, height: 380 }} />
        <div className="promax-ambient-glow promax-glow-indigo" style={{ top: 180, right: '6%', width: 460, height: 340 }} />
        <div className="promax-ambient-glow promax-glow-emerald" style={{ top: 600, left: '20%', width: 420, height: 300 }} />
      </div>

      <div className="promax-content-layer">
        {showLoginGate && <LoginGateModal onClose={() => setShowLoginGate(false)} message="Inicia sesión para practicar con los exámenes EUNACOM reales."/>}
        {showPaymentModal && <PaymentModal onClose={() => setShowPaymentModal(false)} />}

        {/* Quiz Modal */}
        {activeQuiz && (
          <div className="promax-modal-backdrop">
            <div className="promax-modal-panel" style={{ maxWidth: 680, maxHeight: '92vh', overflow: 'auto' }}>
              <div className="promax-modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <BookOpen size={18} color="#38bdf8" />
                  <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#f8fafc' }}>{activeQuiz.title}</span>
                </div>
                <button onClick={() => setActiveQuiz(null)} className="promax-modal-close-btn">
                  <X size={18} />
                </button>
              </div>
              <InlineQuiz questions={activeQuiz.questions} title={activeQuiz.title} onClose={() => setActiveQuiz(null)}/>
            </div>
          </div>
        )}

        {/* Exam Mode Modal */}
        {selectedExam && !resumePrompt && (
          <div className="promax-modal-backdrop">
            <div className="promax-modal-panel" style={{ maxWidth: 500 }}>
              <div className="promax-modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Award size={18} color="#38bdf8" />
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>Modo de Examen</h3>
                </div>
                <button onClick={() => setSelectedExam(null)} className="promax-modal-close-btn">
                  <X size={18} />
                </button>
              </div>
              <div style={{ padding: '1.6rem' }}>
                <p style={{ color: '#94a3b8', marginBottom: '1.4rem', fontSize: '0.92rem', lineHeight: 1.5 }}>
                  Estás a punto de comenzar <strong style={{ color: '#ffffff' }}>{selectedExam.name}</strong> ({selectedExam.total_questions} preguntas). Selecciona tu método de entrenamiento:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <button
                    onClick={() => handleStartExam(selectedExam, 'tutor')}
                    style={{
                      display: 'flex', gap: '1rem', padding: '1.25rem',
                      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(15, 23, 42, 0.7) 100%)',
                      border: '1px solid rgba(99, 102, 241, 0.35)',
                      borderRadius: 16, cursor: 'pointer', textAlign: 'left',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#818cf8'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.35)'; e.currentTarget.style.transform = 'none' }}
                  >
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: 'rgba(99, 102, 241, 0.25)', border: '1px solid rgba(99, 102, 241, 0.4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#a5b4fc', flexShrink: 0
                    }}>
                      <GraduationCap size={22} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '1rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        Modo Tutor <span className="promax-badge-pill promax-badge-indigo">Recomendado</span>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.45 }}>
                        Sin límite de tiempo. Obtén pistas y explicaciones en tiempo real para aprender de tus errores al instante.
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleStartExam(selectedExam, 'exam')}
                    style={{
                      display: 'flex', gap: '1rem', padding: '1.25rem',
                      background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(15, 23, 42, 0.7) 100%)',
                      border: '1px solid rgba(245, 158, 11, 0.35)',
                      borderRadius: 16, cursor: 'pointer', textAlign: 'left',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#fbbf24'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.35)'; e.currentTarget.style.transform = 'none' }}
                  >
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: 'rgba(245, 158, 11, 0.25)', border: '1px solid rgba(245, 158, 11, 0.4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fde68a', flexShrink: 0
                    }}>
                      <Clock size={22} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '1rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        Modo Simulacro <span className="promax-badge-pill promax-badge-amber">Cronometrado</span>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.45 }}>
                        Igual que el EUNACOM. Tiempo calculado ({selectedExam.total_questions} minutos). Sin pistas hasta el final de la prueba.
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Resume Prompt Modal */}
        {resumePrompt && (
          <div className="promax-modal-backdrop">
            <div className="promax-modal-panel" style={{ maxWidth: 440 }}>
              <div className="promax-modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={18} color="#fbbf24" />
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>Examen en Curso</h3>
                </div>
                <button onClick={() => setResumePrompt(null)} className="promax-modal-close-btn">
                  <X size={18} />
                </button>
              </div>
              <div style={{ padding: '1.5rem' }}>
                <p style={{ color: '#94a3b8', marginBottom: '1.5rem', fontSize: '0.92rem', lineHeight: 1.5 }}>
                  Tienes un intento previo de este examen. ¿Deseas retomarlo donde lo dejaste o empezar uno nuevo desde cero?
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <button
                    onClick={() => handleResumeChoice(true)}
                    className="btn-primary"
                    style={{ padding: '0.9rem', fontWeight: 700, fontSize: '0.95rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', borderRadius: 12 }}
                  >
                    <PlayCircle size={18}/> Continuar examen
                  </button>
                  <button
                    onClick={() => handleResumeChoice(false)}
                    style={{
                      padding: '0.85rem', background: 'rgba(255, 255, 255, 0.05)', color: '#cbd5e1',
                      border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: 12, fontWeight: 700,
                      fontSize: '0.92rem', cursor: 'pointer', transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                  >
                    Empezar de nuevo
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          {/* Hero Bento Header */}
          <div className="promax-hero-bento" style={{
            '--hero-accent-gradient': 'linear-gradient(90deg, #38bdf8 0%, #818cf8 50%, #10b981 100%)'
          }}>
            <div className="promax-hero-header-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.1rem', flex: 1, minWidth: 260 }}>
                <div className="promax-hero-avatar-box" style={{
                  '--avatar-bg': 'linear-gradient(135deg, rgba(56, 189, 248, 0.25) 0%, rgba(99, 102, 241, 0.25) 100%)',
                  '--avatar-border': 'rgba(56, 189, 248, 0.4)',
                  '--avatar-color': '#38bdf8',
                  '--avatar-glow': 'rgba(56, 189, 248, 0.3)'
                }}>
                  <Stethoscope size={28} />
                </div>
                <div className="promax-hero-titles">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
                    <h1>Reconstrucciones EUNACOM</h1>
                    <span className="promax-badge-pill promax-badge-cyan">
                      <Sparkles size={11} /> Exámenes Oficiales
                    </span>
                  </div>
                  <p>
                    {index.total_exams} exámenes recopilados y verificados · {index.total_questions.toLocaleString()} preguntas reales
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Exámenes Rendidos
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffffff', marginTop: '0.15rem' }}>
                    {completedExamsCount} <span style={{ color: '#64748b', fontSize: '0.85rem' }}>/ {index.total_exams}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Bento Grid */}
          <div className="promax-stats-grid">
            <div className="promax-stat-card">
              <div className="promax-stat-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                <FileText size={20} />
              </div>
              <div>
                <div className="promax-stat-val">{index.total_exams}</div>
                <div className="promax-stat-lbl">Exámenes</div>
              </div>
            </div>

            <div className="promax-stat-card">
              <div className="promax-stat-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                <AlertCircle size={20} />
              </div>
              <div>
                <div className="promax-stat-val">{index.total_questions.toLocaleString()}</div>
                <div className="promax-stat-lbl">Preguntas</div>
              </div>
            </div>

            <div className="promax-stat-card">
              <div className="promax-stat-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                <CheckCircle2 size={20} />
              </div>
              <div>
                <div className="promax-stat-val">{completedExamsCount}</div>
                <div className="promax-stat-lbl">Completados</div>
              </div>
            </div>

            <div className="promax-stat-card">
              <div className="promax-stat-icon-wrap" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
                <TrendingUp size={20} />
              </div>
              <div>
                <div className="promax-stat-val" style={{ color: avgScoreAcrossExams >= 60 ? '#34d399' : '#ffffff' }}>
                  {avgScoreAcrossExams !== null ? `${avgScoreAcrossExams}%` : '—'}
                </div>
                <div className="promax-stat-lbl">Promedio</div>
              </div>
            </div>
          </div>

          {/* Pro Max Tabs Switcher */}
          <div className="promax-tab-bar">
            <button
              onClick={() => { setActiveTab('exams'); setSelectedTopic(null) }}
              className={`promax-tab-btn ${activeTab === 'exams' ? 'active' : ''}`}
            >
              <FileText size={16} /> Por Examen Oficial
            </button>
            <button
              onClick={() => { setActiveTab('topics'); setSelectedTopic(null) }}
              className={`promax-tab-btn ${activeTab === 'topics' ? 'active' : ''}`}
            >
              <Flame size={16} /> Temas Más Preguntados
            </button>
          </div>

          {/* Tab: Exams */}
          {activeTab === 'exams' && years.map(year => (
            <div key={year} style={{ marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>{year}</h2>
                <span className="promax-badge-pill promax-badge-cyan" style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem' }}>
                  {examsByYear[year].length} {examsByYear[year].length === 1 ? 'Examen' : 'Exámenes'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {examsByYear[year].map(exam => {
                  const result = examResults[exam.id]
                  const pct = result?.pct
                  const isLocked = hasExceededReconstructions;

                  return (
                    <div
                      key={exam.id}
                      className="promax-bento-card"
                      style={{
                        padding: '1.25rem 1.5rem',
                        minHeight: 'auto',
                        borderLeft: `4px solid ${result ? (pct >= 60 ? '#10b981' : '#ef4444') : '#38bdf8'}`,
                        '--card-glow': 'rgba(56, 189, 248, 0.25)',
                      }}
                      onClick={() => isLocked ? setShowPaymentModal(true) : setSelectedExam(exam)}
                    >
                      {isLocked && (
                        <div style={{
                          position: 'absolute', inset: 0, background: 'rgba(11, 17, 32, 0.75)',
                          backdropFilter: 'blur(3px)', zIndex: 10, display: 'flex',
                          alignItems: 'center', justifyContent: 'center', borderRadius: 24
                        }}>
                          <div style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            background: 'rgba(30, 41, 59, 0.95)', border: '1px solid rgba(251, 191, 36, 0.4)',
                            padding: '0.6rem 1.2rem', borderRadius: 12, color: '#ffffff',
                            fontWeight: 700, fontSize: '0.88rem', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
                          }}>
                            <Lock size={16} color="#fbbf24" /> Desbloquear Acceso Ilimitado
                          </div>
                        </div>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: 240, opacity: isLocked ? 0.4 : 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 800, fontSize: '1rem', color: '#ffffff' }}>
                              {exam.name}
                            </span>
                            {!exam.questions_with_answers ? (
                              <span className="promax-badge-pill promax-badge-amber" style={{ fontSize: '0.65rem' }}>
                                Sin pauta
                              </span>
                            ) : (
                              <span className="promax-badge-pill promax-badge-emerald" style={{ fontSize: '0.65rem' }}>
                                <Check size={11} /> Con pauta oficial
                              </span>
                            )}
                          </div>

                          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem', color: '#94a3b8', flexWrap: 'wrap' }}>
                            <span>{exam.total_questions} preguntas oficiales</span>
                            {exam.month && <span>· {exam.month} {exam.year}</span>}
                            {exam.questions_with_answers > 0 && (
                              <span style={{ color: '#34d399', fontWeight: 600 }}>
                                · {exam.questions_with_answers} justificadas
                              </span>
                            )}
                          </div>

                          {result && (
                            <div style={{ marginTop: '0.75rem', maxWidth: 380 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                                <span>{result.correct} de {result.answered} correctas</span>
                                <span style={{ color: pct >= 60 ? '#34d399' : '#f87171', fontWeight: 800 }}>{pct}%</span>
                              </div>
                              <div style={{ height: 6, borderRadius: 9999, background: 'rgba(255, 255, 255, 0.08)', overflow: 'hidden' }}>
                                <div style={{
                                  height: '100%', width: `${pct}%`,
                                  background: pct >= 60 ? 'linear-gradient(90deg, #10b981 0%, #34d399 100%)' : 'linear-gradient(90deg, #ef4444 0%, #f87171 100%)',
                                  borderRadius: 9999, transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                                }}/>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="promax-card-action-btn" style={{ flexShrink: 0 }}>
                          {result ? 'Repetir' : 'Iniciar'} <ChevronRight size={15}/>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Tab: Topics */}
          {activeTab === 'topics' && (
            <div>
              {!selectedTopic ? (
                <>
                  <div style={{
                    marginBottom: '1.5rem', padding: '1rem 1.25rem',
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(15, 23, 42, 0.7) 100%)',
                    borderRadius: 18, border: '1px solid rgba(99, 102, 241, 0.25)',
                    fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.6
                  }}>
                    🔥 <strong style={{ color: '#a5b4fc' }}>Práctica Estratégica por Tema.</strong> Haz clic en una especialidad para ver los temas más preguntados de exámenes anteriores y practica por subtema.
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
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
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
      </div>
    </div>
  )
}

export default Reconstructions
