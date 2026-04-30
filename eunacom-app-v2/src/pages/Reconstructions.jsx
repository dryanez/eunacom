import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { createTest, genId, fetchProgress } from '../lib/api'
import { Stethoscope, CheckCircle2, FileText, AlertCircle, ChevronRight, TrendingUp, BookOpen, X, ChevronDown, ChevronUp, PlayCircle, ArrowLeft } from 'lucide-react'
import LoadingScreen from '../components/LoadingScreen'
import LoginGateModal from '../components/LoginGateModal'

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
  return { id: `${examId}_q${q.id}`, question: q.question || q.pregunta, choices, correctAnswer, explanation: q.explanation || q.explicacion || q.respuesta_texto || '' }
}

/* ── Inline Quiz ── */
function InlineQuiz({ questions, title, onClose }) {
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)
  const q = questions[idx]

  const handleReveal = () => {
    if (!selected) return
    setRevealed(true)
    if (selected === q.correctAnswer) setScore(s => s + 1)
  }
  const handleNext = () => {
    if (idx + 1 >= questions.length) { setDone(true); return }
    setIdx(i => i + 1); setSelected(null); setRevealed(false)
  }

  if (done) return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <div style={{ fontSize: '3.5rem', fontWeight: 900, color: score/questions.length >= 0.6 ? 'var(--accent-green)' : 'var(--accent-red)', marginBottom: '0.25rem' }}>{Math.round(score/questions.length*100)}%</div>
      <div style={{ color: 'var(--surface-300)', marginBottom: '1.5rem' }}>{score} / {questions.length} correctas</div>
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="btn-primary" onClick={() => { setIdx(0); setSelected(null); setRevealed(false); setScore(0); setDone(false) }}>Repetir</button>
        <button onClick={onClose} style={{ padding: '0.65rem 1.5rem', borderRadius: 8, background: 'var(--surface-700)', color: 'var(--surface-200)', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Cerrar</button>
      </div>
    </div>
  )

  return (
    <div style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--surface-400)', fontWeight: 700 }}>{idx+1}/{questions.length}</span>
        <div style={{ flex: 1, height: 4, background: 'var(--surface-700)', borderRadius: 2 }}>
          <div style={{ height: '100%', width: `${((idx+1)/questions.length)*100}%`, background: 'var(--primary-500)', borderRadius: 2, transition: 'width 0.3s' }} />
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--surface-400)', cursor: 'pointer', padding: 4 }}><X size={16}/></button>
      </div>
      <p style={{ fontSize: '1rem', lineHeight: 1.65, color: 'var(--surface-100)', marginBottom: '1.25rem' }}>{q.question}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
        {q.choices.map(opt => {
          let bg = 'var(--surface-800)', border = 'var(--surface-600)', color = 'var(--surface-100)'
          if (revealed) {
            if (opt.id === q.correctAnswer) { bg = 'rgba(52,211,153,0.1)'; border = 'var(--accent-green)'; color = 'var(--accent-green)' }
            else if (opt.id === selected) { bg = 'rgba(248,113,113,0.1)'; border = 'var(--accent-red)'; color = 'var(--accent-red)' }
          } else if (opt.id === selected) { bg = 'rgba(99,102,241,0.15)'; border = 'var(--primary-400)' }
          return (
            <button key={opt.id} onClick={() => !revealed && setSelected(opt.id)} style={{ textAlign: 'left', padding: '0.85rem 1rem', background: bg, border: `2px solid ${border}`, borderRadius: 8, color, fontSize: '0.9rem', cursor: revealed ? 'default' : 'pointer', transition: 'all 0.15s', display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}>
              <strong style={{ flexShrink: 0, opacity: 0.7, minWidth: 16 }}>{opt.id}.</strong>{opt.text}
            </button>
          )
        })}
      </div>
      {revealed && q.explanation && (
        <div style={{ padding: '0.85rem', background: 'rgba(99,102,241,0.08)', borderRadius: 8, marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--surface-300)', lineHeight: 1.6 }}>
          💡 {q.explanation}
        </div>
      )}
      {!revealed
        ? <button onClick={handleReveal} disabled={!selected} className="btn-primary btn-primary--full" style={{ opacity: selected ? 1 : 0.4 }}>Ver respuesta</button>
        : <button onClick={handleNext} className="btn-primary btn-primary--full">{idx+1 >= questions.length ? '🏁 Ver resultado' : 'Siguiente →'}</button>
      }
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
function SubjectCard({ subject, onSelectTopic }) {
  const [open, setOpen] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? subject.topics : subject.topics.slice(0, 5)

  return (
    <div style={{ background: 'var(--surface-800)', borderRadius: 10, border: '1px solid var(--surface-700)', overflow: 'hidden', marginBottom: '0.75rem' }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
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
  const [index, setIndex] = useState(null)
  const [topicIndex, setTopicIndex] = useState(null)
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(null)
  const [examResults, setExamResults] = useState({})
  const [showLoginGate, setShowLoginGate] = useState(false)
  const [activeTab, setActiveTab] = useState('exams')
  const [selectedTopic, setSelectedTopic] = useState(null)   // topic drill-down
  const [activeQuiz, setActiveQuiz] = useState(null)         // { questions, title }

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
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const handleStartExam = async (exam) => {
    if (!user) { setShowLoginGate(true); return }
    setStarting(exam.id)
    try {
      const res = await fetch(`/data/reconstrucciones/${exam.file}`)
      const data = await res.json()
      const valid = data.questions.filter(q => (q.opciones || q.options || []).length >= 2)
      if (!valid.length) { alert('Sin preguntas disponibles.'); return }
      const questions = valid.map(q => toTestRunnerFormat(q, exam.id))
      const testId = genId()
      await createTest({ id: testId, userId: user.id, mode: 'tutor', timeLimitSeconds: 0, totalQuestions: questions.length, questions: questions.map(q => q.id) })
      navigate('/test-runner', { state: { testId, questions, isReconstruction: true, examName: exam.name } })
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

  return (
    <div className="page" style={{ paddingBottom: '3rem' }}>
      {showLoginGate && <LoginGateModal onClose={() => setShowLoginGate(false)} message="Inicia sesión para practicar con los exámenes EUNACOM reales."/>}

      {/* Quiz Modal */}
      {activeQuiz && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'var(--surface-800)', borderRadius: 14, border: '1px solid var(--surface-600)', width: '100%', maxWidth: 640, maxHeight: '92vh', overflow: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}>
            <div style={{ padding: '0.9rem 1.25rem', borderBottom: '1px solid var(--surface-700)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={16} color="var(--primary-400)"/>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', flex: 1, color: 'var(--surface-200)' }}>{activeQuiz.title}</span>
            </div>
            <InlineQuiz questions={activeQuiz.questions} title={activeQuiz.title} onClose={() => setActiveQuiz(null)}/>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <h1 className="page__title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Stethoscope size={26}/> Reconstrucciones EUNACOM
          </h1>
          <p style={{ color: 'var(--surface-400)', fontSize: '0.88rem', marginTop: '0.2rem' }}>
            {index.total_exams} exámenes reales · {index.total_questions.toLocaleString()} preguntas
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          {[
            { icon: <FileText size={16}/>, label: 'Exámenes', value: index.total_exams, color: 'var(--primary-400)' },
            { icon: <AlertCircle size={16}/>, label: 'Preguntas', value: index.total_questions.toLocaleString(), color: 'var(--accent-amber)' },
            { icon: <CheckCircle2 size={16}/>, label: 'Completados', value: Object.keys(examResults).length, color: 'var(--accent-green)' },
          ].map(s => (
            <div key={s.label} style={{ flex: '1 1 110px', background: 'var(--surface-800)', borderRadius: 'var(--radius)', padding: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.65rem', border: '1px solid var(--surface-700)' }}>
              <div style={{ color: s.color }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--surface-100)' }}>{s.value}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--surface-400)' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, marginBottom: '1.25rem', borderBottom: '1px solid var(--surface-700)' }}>
          {[
            { id: 'exams', label: '📋 Por examen' },
            { id: 'topics', label: '🔥 Temas más preguntados' },
          ].map(tab => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSelectedTopic(null) }} style={{ padding: '0.6rem 1.1rem', background: 'none', border: 'none', borderBottom: `2px solid ${activeTab===tab.id ? 'var(--primary-400)' : 'transparent'}`, color: activeTab===tab.id ? 'var(--primary-400)' : 'var(--surface-400)', fontWeight: activeTab===tab.id ? 700 : 500, cursor: 'pointer', fontSize: '0.88rem', marginBottom: '-1px', transition: 'all 0.15s' }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab: Exams */}
        {activeTab === 'exams' && years.map(year => (
          <div key={year} style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--surface-300)', marginBottom: '0.6rem', paddingBottom: '0.4rem', borderBottom: '1px solid var(--surface-700)' }}>{year}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {examsByYear[year].map(exam => {
                const result = examResults[exam.id]
                const pct = result?.pct
                return (
                  <div key={exam.id} style={{ background: 'var(--surface-800)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', border: `1px solid ${result ? 'var(--surface-600)' : 'var(--surface-700)'}`, cursor: 'pointer', transition: 'all 0.15s' }}
                    onClick={() => handleStartExam(exam)}
                    onMouseEnter={e => { e.currentTarget.style.borderColor='var(--primary-400)'; e.currentTarget.style.transform='translateY(-1px)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor=result?'var(--surface-600)':'var(--surface-700)'; e.currentTarget.style.transform='none' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--surface-100)' }}>{exam.name}</span>
                        {!exam.questions_with_answers && <span style={{ fontSize: '0.62rem', padding: '0.12rem 0.45rem', borderRadius: '999px', background: 'rgba(251,191,36,0.15)', color: 'var(--accent-amber)' }}>Sin pauta</span>}
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--surface-400)' }}>
                        <span>{exam.total_questions} preguntas</span>
                        {exam.month && <span>{exam.month} {exam.year}</span>}
                        {exam.questions_with_answers > 0 && <span style={{ color: 'var(--accent-green)' }}>{exam.questions_with_answers} con respuesta</span>}
                      </div>
                      {result && (
                        <div style={{ marginTop: '0.5rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--surface-400)', marginBottom: '0.2rem' }}>
                            <span>{result.correct}/{result.answered} correctas</span>
                            <span style={{ color: pct>=60?'var(--accent-green)':'var(--accent-red)', fontWeight: 700 }}>{pct}%</span>
                          </div>
                          <div style={{ height: 3, borderRadius: 2, background: 'var(--surface-700)', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: pct>=60?'var(--accent-green)':'var(--accent-red)', transition: 'width 0.3s' }}/>
                          </div>
                        </div>
                      )}
                    </div>
                    <div style={{ color: 'var(--primary-400)', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem', flexShrink: 0 }}>
                      {result ? 'Repetir' : 'Iniciar'}<ChevronRight size={15}/>
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
                <div style={{ marginBottom: '1.25rem', padding: '0.85rem 1rem', background: 'rgba(99,102,241,0.08)', borderRadius: 10, border: '1px solid rgba(99,102,241,0.2)', fontSize: '0.84rem', color: 'var(--surface-300)', lineHeight: 1.6 }}>
                  🔥 <strong style={{ color: 'var(--primary-300)' }}>Practica por tema.</strong> Haz clic en una especialidad para ver los temas más preguntados. Luego entra en un tema para ver el desglose exacto por subtema y practicar.
                </div>
                {topicIndex ? topicIndex.map(subject => (
                  <SubjectCard key={subject.subject} subject={subject} onSelectTopic={setSelectedTopic}/>
                )) : <p style={{ color: 'var(--surface-400)' }}>Cargando...</p>}
              </>
            ) : (
              <TopicDetail topic={selectedTopic} onPractice={handlePractice} onBack={() => setSelectedTopic(null)}/>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Reconstructions
