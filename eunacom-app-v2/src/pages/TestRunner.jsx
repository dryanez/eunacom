import React, { useState, useEffect } from 'react'
import { ChevronLeft, MoreHorizontal, Flag, Lightbulb, ChevronRight, Zap, PlayCircle } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { saveTestProgress, completeTest, insertProgress, genId } from '../lib/api'
import { XP_PER_CORRECT, XP_PER_INCORRECT } from '../utils/xpSystem'

const TestRunner = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { user } = useAuth()
    const questions = location.state?.questions || []

    const isSimulation = !!location.state?.isSimulation
    const startFinished = !!location.state?.startFinished
    const mode = location.state?.mode || 'tutor'
    const isTutorMode = mode === 'tutor'

    const [currentIndex, setCurrentIndex] = useState(location.state?.savedIndex || 0)
    const [answers, setAnswers] = useState(location.state?.savedAnswers || {})
    const initTutorState = location.state?.tutorState || { firstAttempts: {}, wrongAttempts: {} }
    const initialWrongAttempts = Object.fromEntries(
        Object.entries(initTutorState.wrongAttempts || {}).map(([k,v]) => [k, new Set(v)])
    )
    
    const [firstAttempts, setFirstAttempts] = useState(initTutorState.firstAttempts || {}) // tutor mode: records first pick only (for scoring)
    const [wrongAttempts, setWrongAttempts] = useState(initialWrongAttempts) // tutor mode: { [questionId]: Set of wrong optionIds tried }
    const [fullscreenImage, setFullscreenImage] = useState(null)
    const [flaggedQuestions, setFlaggedQuestions] = useState(new Set())
    const [timeElapsed, setTimeElapsed] = useState(0)
    const timeLimitSeconds = location.state?.timeLimitSeconds || 0
    const [timeLeft, setTimeLeft] = useState(location.state?.timeLeftSeconds !== undefined ? location.state.timeLeftSeconds : timeLimitSeconds)
    const [isFinished, setIsFinished] = useState(startFinished)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showExitModal, setShowExitModal] = useState(false)
    const [showExplanation, setShowExplanation] = useState({}) // tutor mode: show explanation panel per question

    useEffect(() => { /* nothing to reset per question now */ }, [currentIndex])

    useEffect(() => {
        if (isFinished || questions.length === 0 || isTutorMode) return
        const timer = setInterval(() => {
            if (timeLimitSeconds > 0) {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timer)
                        document.getElementById('auto-submit-btn')?.click()
                        return 0
                    }
                    return prev - 1
                })
            } else {
                setTimeElapsed(prev => prev + 1)
            }
        }, 1000)
        return () => clearInterval(timer)
    }, [isFinished, questions.length, isTutorMode, timeLimitSeconds])

    const formatTime = (s) => {
        const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60
        return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
    }

    if (questions.length === 0) return <div style={{ padding: '2rem', color: 'white', textAlign: 'center' }}>No hay preguntas disponibles.</div>

    const currentQuestion = questions[currentIndex]
    const totalQuestions = questions.length

    const handleSelectOption = (optionId) => {
        const isCorrect = optionId.toLowerCase() === currentQuestion.correctAnswer?.toLowerCase()
        const qid = currentQuestion.id

        if (isTutorMode) {
            // Record first attempt only for scoring
            if (!(qid in firstAttempts)) {
                setFirstAttempts(prev => ({ ...prev, [qid]: optionId }))
            }

            if (isCorrect) {
                // Lock on correct answer
                setAnswers(prev => ({ ...prev, [qid]: optionId }))
                setShowExplanation(prev => ({ ...prev, [qid]: true }))
            } else {
                // Add to wrong attempts — DO NOT update answers (keep last correct or null)
                setWrongAttempts(prev => {
                    const set = new Set(prev[qid] || [])
                    set.add(optionId)
                    return { ...prev, [qid]: set }
                })
                // Show hint after first wrong attempt
                setShowExplanation(prev => ({ ...prev, [qid]: true }))
            }
            
            // Save progress in tutor mode too
            if (location.state?.testId) {
                // Must calculate new tutorState since state updates are async
                const newFirstAttempts = qid in firstAttempts ? firstAttempts : { ...firstAttempts, [qid]: optionId }
                const newWrongAttempts = isCorrect ? wrongAttempts : { 
                    ...wrongAttempts, 
                    [qid]: new Set([...(wrongAttempts[qid] || []), optionId]) 
                }
                const serializedWrongAttempts = Object.fromEntries(
                    Object.entries(newWrongAttempts).map(([k,v]) => [k, Array.from(v)])
                )
                const newAnswers = isCorrect ? { ...answers, [qid]: optionId } : answers
                const tutorState = { firstAttempts: newFirstAttempts, wrongAttempts: serializedWrongAttempts }
                saveTestProgress(location.state.testId, newAnswers, currentIndex, timeLeft, tutorState).catch(console.error)
            }
        } else {
            const newAnswers = { ...answers, [qid]: optionId }
            setAnswers(newAnswers)
            if (location.state?.testId) saveTestProgress(location.state.testId, newAnswers, currentIndex, timeLeft, null).catch(console.error)
        }
    }

    const getTutorState = () => {
        if (!isTutorMode) return null
        const serializedWrongAttempts = Object.fromEntries(
            Object.entries(wrongAttempts).map(([k,v]) => [k, Array.from(v)])
        )
        return { firstAttempts, wrongAttempts: serializedWrongAttempts }
    }

    const handleNext = async () => {
        if (currentIndex < totalQuestions - 1) {
            const nextIndex = currentIndex + 1
            setCurrentIndex(nextIndex)
            if (location.state?.testId) {
                saveTestProgress(location.state.testId, answers, nextIndex, timeLeft, getTutorState()).catch(console.error)
            }
        } else {
            setIsSubmitting(true)
            await finishTest()
            setIsFinished(true)
            setIsSubmitting(false)
        }
    }

    const finishTest = async () => {
        let score = 0
        const scoreSource = (isTutorMode && !startFinished) ? firstAttempts : answers
        questions.forEach(q => { if (scoreSource[q.id]?.toLowerCase() === q.correctAnswer?.toLowerCase()) score++ })
        const pct = Math.round((score / totalQuestions) * 100)

        if (location.state?.testId) {
            try {
                if (user) {
                    await completeTest(location.state.testId, answers, currentIndex, pct)
                    for (const q of questions) {
                        const firstAns = isTutorMode ? firstAttempts[q.id] : answers[q.id]
                        const isCorrect = firstAns?.toLowerCase() === q.correctAnswer?.toLowerCase()
                        const isOmitted = !firstAns
                        await insertProgress(user.id, q.id, isCorrect, isOmitted).catch(() => {})
                    }
                }
            } catch (e) { console.error('Error finishing test:', e) }
        }
    }

    const handlePrev = () => { 
        if (currentIndex > 0) {
            const prevIndex = currentIndex - 1
            setCurrentIndex(prevIndex)
            if (location.state?.testId) {
                saveTestProgress(location.state.testId, answers, prevIndex, timeLeft, getTutorState()).catch(console.error)
            }
        }
    }

    const handleShowHint = () => {
        const qid = currentQuestion.id
        setShowExplanation(prev => ({ ...prev, [qid]: !prev[qid] }))
    }

    const handleSaveAndExit = async () => {
        setIsSubmitting(true)
        if (location.state?.testId) {
            const serializedWrongAttempts = Object.fromEntries(
                Object.entries(wrongAttempts).map(([k,v]) => [k, Array.from(v)])
            )
            const tutorState = isTutorMode ? { firstAttempts, wrongAttempts: serializedWrongAttempts } : null
            await saveTestProgress(location.state.testId, answers, currentIndex, timeLeft, tutorState).catch(console.error)
        }
        setIsSubmitting(false)
        setShowExitModal(false)
        navigate('/dashboard')
    }

    const handleSubmitTest = async () => {
        setIsSubmitting(true)
        await finishTest()
        setIsFinished(true)
        setIsSubmitting(false)
    }

    if (isFinished) {
        let score = 0
        // On review (startFinished), firstAttempts is empty — always use saved answers
        const results = questions.map(q => {
            const firstAns = (!startFinished && isTutorMode) ? firstAttempts[q.id] : answers[q.id]
            const userAns = firstAns  // show first attempt in review
            const correct = userAns?.toLowerCase() === q.correctAnswer?.toLowerCase()
            if (correct) score++
            const userChoice = q.choices?.find(c => c.id === userAns)
            const correctChoice = q.choices?.find(c => c.id.toLowerCase() === q.correctAnswer?.toLowerCase())
            return { q, userAns, correct, omitted: !userAns, userChoice, correctChoice }
        })
        const pct = Math.round((score / totalQuestions) * 100)
        const wrongResults = results.filter(r => !r.correct)
        const incorrectCount = results.filter(r => !r.correct && !r.omitted).length
        const sessionXP = (score * XP_PER_CORRECT) + (incorrectCount * XP_PER_INCORRECT)

        return (
            <div className="test-review-page" style={{ padding: '1rem' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <div className="card text-center" style={{ marginBottom: '1.5rem', width: '100%', padding: '2rem 1rem' }}>
                        <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>
                            {startFinished ? 'Revisión del Examen' : '¡Examen Finalizado!'}
                        </h1>
                        {!startFinished && <p style={{ color: 'var(--surface-300)', marginBottom: '1rem' }}>Tiempo: {timeLimitSeconds > 0 ? formatTime(timeLimitSeconds - timeLeft) : formatTime(timeElapsed)}</p>}
                        
                        {!startFinished && (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(251,191,36,0.15)', color: 'var(--accent-amber)', padding: '0.5rem 1rem', borderRadius: '2rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                                <Zap size={18} fill="currentColor" /> +{sessionXP} XP Obtenida
                            </div>
                        )}

                        <div style={{ fontSize: '4rem', fontWeight: 800, color: pct >= 60 ? 'var(--accent-green)' : 'var(--accent-red)', marginBottom: '0.5rem' }}>
                            {pct}%
                        </div>
                        <p style={{ color: 'var(--surface-300)', marginBottom: '1.5rem' }}>
                            {score} de {totalQuestions} correctas
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                            <div style={{ textAlign: 'center', padding: '0.75rem 1.5rem', background: 'rgba(52,211,153,0.1)', borderRadius: 'var(--radius)' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-green)' }}>{score}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--surface-400)' }}>Correctas</div>
                            </div>
                            <div style={{ textAlign: 'center', padding: '0.75rem 1.5rem', background: 'rgba(248,113,113,0.1)', borderRadius: 'var(--radius)' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-red)' }}>{results.filter(r => !r.correct && !r.omitted).length}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--surface-400)' }}>Incorrectas</div>
                            </div>
                            <div style={{ textAlign: 'center', padding: '0.75rem 1.5rem', background: 'rgba(251,191,36,0.1)', borderRadius: 'var(--radius)' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-amber)' }}>{results.filter(r => r.omitted).length}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--surface-400)' }}>Omitidas</div>
                            </div>
                        </div>
                    </div>

                    {/* Question grid navigator */}
                    <div className="card" style={{ marginBottom: '1.5rem' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--surface-400)', letterSpacing: '0.07em', marginBottom: '0.75rem' }}>
                            VISTA RÁPIDA — {totalQuestions} PREGUNTAS
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {results.map((r, i) => {
                                const wrongIdx = wrongResults.findIndex(wr => wr.q.id === r.q.id)
                                const isWrongOrOmitted = wrongIdx !== -1
                                const color = r.correct ? '#34d399' : (r.omitted ? '#fbbf24' : '#f87171')
                                const bg = r.correct ? 'rgba(52,211,153,0.15)' : (r.omitted ? 'rgba(251,191,36,0.15)' : 'rgba(248,113,113,0.15)')
                                return (
                                    <button
                                        key={r.q.id}
                                        title={`P${i + 1}: ${r.correct ? 'Correcta' : (r.omitted ? 'Omitida' : 'Incorrecta')}`}
                                        onClick={() => isWrongOrOmitted && document.getElementById(`review-wrong-${wrongIdx}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                                        style={{
                                            width: 28, height: 28, borderRadius: 4, border: 'none',
                                            background: bg, color, fontSize: '0.6rem', fontWeight: 700,
                                            cursor: isWrongOrOmitted ? 'pointer' : 'default',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            transition: 'filter 0.15s',
                                        }}
                                        onMouseEnter={e => { if (isWrongOrOmitted) e.currentTarget.style.filter = 'brightness(1.4)' }}
                                        onMouseLeave={e => { e.currentTarget.style.filter = 'none' }}
                                    >
                                        {i + 1}
                                    </button>
                                )
                            })}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem 1.5rem', marginTop: '0.75rem', fontSize: '0.75rem' }}>
                            <span style={{ color: '#34d399' }}>■ Correctas: {score}</span>
                            <span style={{ color: '#f87171' }}>■ Incorrectas: {results.filter(r => !r.correct && !r.omitted).length}</span>
                            <span style={{ color: '#fbbf24' }}>■ Omitidas: {results.filter(r => r.omitted).length}</span>
                        </div>
                    </div>

                    {wrongResults.length > 0 && (
                        <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '1.5rem' }}>
                            <div className="test-review-header">
                                <h3 style={{ margin: 0, fontSize: '1rem' }}>Preguntas para Repasar ({wrongResults.length})</h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                                {wrongResults.map(({ q, userChoice, correctChoice, omitted }, i) => (
                                    <div key={q.id} id={`review-wrong-${i}`} className="test-review-item" style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                                        <p style={{ margin: '0 0 0.75rem', fontSize: '0.93rem', lineHeight: 1.5, color: 'var(--surface-100)' }}>
                                            <strong style={{ color: 'var(--surface-400)', marginRight: '0.5rem' }}>{i + 1}.</strong>
                                            {q.question}
                                        </p>
                                        {q.imageUrl && (
                                            <div style={{ marginBottom: '1rem', cursor: 'zoom-in' }} onClick={() => setFullscreenImage(q.imageUrl)}>
                                                <img src={q.imageUrl} alt="Pregunta" style={{ maxWidth: '100%', maxHeight: '250px', borderRadius: '6px', border: '1px solid var(--surface-700)' }} />
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.85rem' }}>
                                            {!omitted && (
                                                <div style={{ color: 'var(--accent-red)', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                                    <span style={{ flexShrink: 0 }}>✗ Tu respuesta:</span>
                                                    <span>{userChoice ? `${userChoice.id}. ${userChoice.text}` : userChoice?.id}</span>
                                                </div>
                                            )}
                                            {omitted && <div style={{ color: 'var(--accent-amber)' }}>⊘ Omitida</div>}
                                            <div style={{ color: 'var(--accent-green)', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                                <span style={{ flexShrink: 0 }}>✓ Correcta:</span>
                                                <span>{correctChoice ? `${correctChoice.id}. ${correctChoice.text}` : q.correctAnswer}</span>
                                            </div>
                                            {q.explanation && (
                                                <div style={{ marginTop: '0.75rem', padding: '0.85rem', background: 'rgba(99, 102, 241, 0.08)', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--surface-300)', lineHeight: 1.6 }}>
                                                    💡 {q.explanation}
                                                </div>
                                            )}
                                            {q.videoUrl && (
                                                <a href={q.videoUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.75rem', padding: '0.6rem 1rem', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}>
                                                    <PlayCircle size={16} /> Ver clase en video
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <button className="btn-primary btn-primary--full" onClick={() => navigate('/dashboard')} style={{ padding: '1rem' }}>
                        Volver al Dashboard
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div style={{ background: 'var(--surface-900)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <button id="auto-submit-btn" style={{ display: 'none' }} onClick={() => {
                setIsSubmitting(true)
                finishTest().then(() => {
                    setIsFinished(true)
                    setIsSubmitting(false)
                    alert('¡El tiempo ha finalizado!')
                })
            }} />
            {/* Top bar */}
            <div style={{ background: 'var(--surface-800)', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--surface-700)' }}>
                    <button onClick={() => setShowExitModal(true)} style={{ background: 'transparent', border: 'none', color: 'var(--surface-50)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.5rem' }}>
                        <ChevronLeft size={20} /> Volver
                    </button>
                <div style={{ fontWeight: 700 }}>Examen EUNACOM — {currentQuestion.topic}</div>
                <button style={{ background: 'transparent', border: 'none', color: 'var(--primary-400)', cursor: 'pointer' }}><MoreHorizontal size={24} /></button>
            </div>

            {/* Status bar */}
            <div style={{ background: 'var(--primary-600)', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'white' }}>
                <div style={{ fontWeight: 700, fontSize: '1.2rem' }}>Q {currentIndex + 1} / {totalQuestions}</div>
                {isTutorMode
                    ? <div style={{ fontWeight: 600, fontSize: '0.9rem', opacity: 0.9 }}>💡 Modo Tutor</div>
                    : <div style={{ fontWeight: 700, fontSize: '1.2rem', fontFamily: 'monospace', color: (timeLimitSeconds > 0 && timeLeft < 60) ? '#f87171' : 'white' }}>
                        {timeLimitSeconds > 0 ? formatTime(timeLeft) : formatTime(timeElapsed)}
                      </div>
                }
            </div>
            <div style={{ height: '4px', background: 'rgba(0,0,0,0.2)' }}>
                <div style={{ height: '100%', width: `${((currentIndex + 1) / totalQuestions) * 100}%`, background: 'white', transition: 'width 0.3s' }} />
            </div>

            {/* Content */}
            <div className="test-runner-content">
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <p style={{ fontSize: '1.1rem', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>{currentQuestion.question}</p>
                    {currentQuestion.imageUrl && (
                        <div style={{ marginTop: '1rem', cursor: 'zoom-in' }} onClick={() => setFullscreenImage(currentQuestion.imageUrl)}>
                            <img src={currentQuestion.imageUrl} alt="Pregunta" style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '8px', border: '1px solid var(--surface-600)' }} />
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                    {currentQuestion.choices.map(opt => {
                        const qid = currentQuestion.id
                        const isCorrectOpt = opt.id.toLowerCase() === currentQuestion.correctAnswer?.toLowerCase()
                        
                        let isSelected = false
                        let hasAnswered = false
                        let tutorSolved = false
                        let isWrongAttempt = false
                        
                        if (isFinished) {
                            // In Review Mode (finished test), we show their FIRST attempt in tutor mode, or their final answer in timed mode.
                            const userFinalAnswer = (isTutorMode && firstAttempts[qid]) ? firstAttempts[qid] : answers[qid]
                            isSelected = userFinalAnswer === opt.id
                            hasAnswered = !!userFinalAnswer
                        } else {
                            // In Active Mode
                            if (isTutorMode) {
                                tutorSolved = answers[qid]?.toLowerCase() === currentQuestion.correctAnswer?.toLowerCase()
                                isWrongAttempt = (wrongAttempts[qid] || new Set()).has(opt.id)
                            } else {
                                hasAnswered = !!answers[qid]
                                isSelected = answers[qid] === opt.id
                            }
                        }

                        // Disable: if finished, OR in active tutor mode if already got correct, or if this option was already tried wrong, OR in active timed mode if answered
                        const isDisabled = isFinished || (isTutorMode && !isFinished && (tutorSolved || isWrongAttempt)) || (!isTutorMode && !isFinished && hasAnswered)

                        let bg = 'var(--surface-800)'
                        let border = 'var(--surface-600)'
                        let dotColor = 'var(--surface-400)'
                        let showDot = false

                        if (isFinished) {
                            // Review Mode styling (same for both Timed and Tutor)
                            if (isCorrectOpt) { bg = 'rgba(52,211,153,0.15)'; border = '#34d399'; dotColor = '#34d399'; showDot = true; }
                            else if (isSelected) { bg = 'rgba(248,113,113,0.15)'; border = '#f87171'; dotColor = '#f87171'; showDot = true; }
                        } else {
                            // Active Mode styling
                            if (isTutorMode) {
                                if (tutorSolved && isCorrectOpt) { bg = 'rgba(52,211,153,0.15)'; border = '#34d399'; dotColor = '#34d399'; showDot = true; }
                                else if (isWrongAttempt) { bg = 'rgba(248,113,113,0.1)'; border = 'rgba(248,113,113,0.5)'; dotColor = '#f87171'; showDot = true; }
                            } else if (hasAnswered) {
                                if (isCorrectOpt) { bg = 'rgba(52,211,153,0.15)'; border = '#34d399'; dotColor = '#34d399'; showDot = true; }
                                else if (isSelected) { bg = 'rgba(248,113,113,0.15)'; border = '#f87171'; dotColor = '#f87171'; showDot = true; }
                            } else if (isSelected) {
                                bg = 'rgba(19,91,236,0.15)'; border = 'var(--primary-500)'; dotColor = 'var(--primary-400)'; showDot = true;
                            }
                        }

                        return (
                            <button key={opt.id} className="test-runner-option" onClick={() => !isDisabled && handleSelectOption(opt.id)} style={{
                                background: bg,
                                border: `2px solid ${border}`,
                                borderRadius: 'var(--radius)', color: isDisabled && !isCorrectOpt && !isWrongAttempt && !isSelected ? 'var(--surface-400)' : 'white', fontSize: '1.05rem',
                                display: 'flex', alignItems: 'center', gap: '1rem',
                                cursor: isDisabled ? 'default' : 'pointer', transition: 'all 0.1s',
                                opacity: isDisabled && !isWrongAttempt && !isCorrectOpt && !isSelected ? 0.45 : 1,
                            }}>
                                <div style={{ minWidth: '24px', height: '24px', borderRadius: '50%', border: `2px solid ${dotColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    {showDot && <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: dotColor }} />}
                                </div>
                                <span>
                                    <strong style={{ color: 'var(--surface-300)', marginRight: '0.5rem' }}>{opt.id}.</strong>
                                    {opt.text}
                                </span>
                                {isTutorMode && isWrongAttempt && <span style={{ marginLeft: 'auto', fontSize: '0.85rem', color: '#f87171', flexShrink: 0 }}>✗ Incorrecto</span>}
                                {isTutorMode && tutorSolved && isCorrectOpt && <span style={{ marginLeft: 'auto', fontSize: '0.85rem', color: '#34d399', flexShrink: 0 }}>✓ Correcto</span>}
                            </button>
                        )
                    })}
                </div>

                {/* Tutor mode feedback panel */}
                {isTutorMode && (() => {
                    const qid = currentQuestion.id
                    const tutorSolved = answers[qid]?.toLowerCase() === currentQuestion.correctAnswer?.toLowerCase()
                    const wrongCount = (wrongAttempts[qid] || new Set()).size
                    const hasTriedWrong = wrongCount > 0
                    const isShowingExplanation = showExplanation[qid]
                    const correctChoice = currentQuestion.choices?.find(c => c.id.toLowerCase() === currentQuestion.correctAnswer?.toLowerCase())

                    if (!tutorSolved && !hasTriedWrong) return null // nothing yet

                    return (
                        <div className="tutor-feedback-panel" style={{
                            background: tutorSolved ? 'rgba(52,211,153,0.08)' : 'rgba(248,113,113,0.08)',
                            border: `1px solid ${tutorSolved ? 'rgba(52,211,153,0.3)' : 'rgba(248,113,113,0.3)'}`,
                        }}>
                            {tutorSolved ? (
                                <>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontWeight: 700, marginBottom: currentQuestion.explanation ? '0.75rem' : 0, fontSize: '1rem' }}>
                                        ✅ ¡Correcto! {wrongCount > 0 && <span style={{ fontWeight: 400, fontSize: '0.85rem', color: '#6ee7b7' }}>({wrongCount} intento{wrongCount > 1 ? 's' : ''} previo{wrongCount > 1 ? 's' : ''})</span>}
                                    </div>
                                    {currentQuestion.explanation && (
                                        <div style={{ color: 'var(--surface-200)', lineHeight: 1.6, fontSize: '0.93rem' }}>
                                            💡 {currentQuestion.explanation}
                                        </div>
                                    )}
                                    {currentQuestion.videoUrl && (
                                        <a href={currentQuestion.videoUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.75rem', padding: '0.5rem 0.85rem', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>
                                            <PlayCircle size={14} /> Ver clase en video
                                        </a>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div style={{ color: '#f87171', fontWeight: 700, marginBottom: '0.5rem', fontSize: '1rem' }}>
                                        ❌ Incorrecto — inténtalo de nuevo
                                    </div>
                                    {isShowingExplanation && currentQuestion.explanation && (
                                        <div style={{ color: 'var(--surface-300)', lineHeight: 1.6, fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                            💡 <em>Pista:</em> {currentQuestion.explanation}
                                        </div>
                                    )}
                                    {isShowingExplanation && currentQuestion.videoUrl && (
                                        <a href={currentQuestion.videoUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.75rem', padding: '0.5rem 0.85rem', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>
                                            <PlayCircle size={14} /> Ver clase en video
                                        </a>
                                    )}
                                    {!isShowingExplanation && (
                                        <button onClick={handleShowHint} style={{ background: 'none', border: '1px solid rgba(248,113,113,0.4)', color: '#f87171', borderRadius: 6, padding: '4px 12px', fontSize: '0.8rem', cursor: 'pointer', marginTop: '0.25rem' }}>
                                            💡 Ver pista
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    )
                })()}

                {/* Non-tutor explanation panel (lightbulb) */}
                {!isTutorMode && showExplanation[currentQuestion.id] && currentQuestion.explanation && (
                    <div className="tutor-feedback-panel" style={{ background: 'rgba(8,145,178,0.08)', border: '1px solid rgba(8,145,178,0.3)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#06b6d4', fontWeight: 700, marginBottom: '0.75rem' }}>
                            <Lightbulb size={18} /> Explicación
                        </div>
                        <div style={{ color: 'var(--surface-200)', lineHeight: 1.6, fontSize: '0.93rem' }}>
                            {currentQuestion.explanation}
                        </div>
                        {currentQuestion.videoUrl && (
                            <a href={currentQuestion.videoUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: '1rem', padding: '0.5rem 0.85rem', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>
                                <PlayCircle size={14} /> Ver clase en video
                            </a>
                        )}
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                    <button onClick={handlePrev} disabled={currentIndex === 0} style={{ padding: '1rem', borderRadius: 'var(--radius)', background: 'var(--surface-800)', color: 'white', border: 'none', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: currentIndex === 0 ? 0.3 : 1, cursor: currentIndex === 0 ? 'default' : 'pointer' }}>
                        <ChevronLeft size={20} /> Anterior
                    </button>
                    <button onClick={handleNext} disabled={isSubmitting} style={{ padding: '1rem', borderRadius: 'var(--radius)', background: 'var(--primary-600)', color: 'white', border: 'none', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: isSubmitting ? 'wait' : 'pointer', fontWeight: 600, opacity: isSubmitting ? 0.7 : 1 }}>
                        {isSubmitting ? 'Guardando...' : currentIndex < totalQuestions - 1 ? 'Siguiente' : 'Finalizar Examen'} <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Floating buttons */}
            <div style={{ position: 'fixed', bottom: '2rem', right: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <button
                    onClick={() => setFlaggedQuestions(prev => {
                        const next = new Set(prev)
                        if (next.has(currentQuestion.id)) next.delete(currentQuestion.id)
                        else next.add(currentQuestion.id)
                        return next
                    })}
                    style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--surface-800)', color: flaggedQuestions.has(currentQuestion.id) ? 'var(--accent-amber)' : 'var(--surface-300)', border: `1px solid ${flaggedQuestions.has(currentQuestion.id) ? 'var(--accent-amber)' : 'var(--surface-700)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <Flag size={20} />
                </button>
                {!isSimulation && !isTutorMode && (
                    <button onClick={handleShowHint} style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--surface-800)', color: showExplanation[currentQuestion.id] ? 'var(--primary-400)' : 'var(--surface-300)', border: '1px solid var(--surface-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', cursor: 'pointer', transition: 'all 0.2s' }}>
                        <Lightbulb size={24} />
                    </button>
                )}
            </div>
            {fullscreenImage && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', padding: '2rem', cursor: 'zoom-out' }} onClick={() => setFullscreenImage(null)}>
                    <img src={fullscreenImage} alt="Fullscreen" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '8px' }} />
                </div>
            )}
            {showExitModal && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div style={{ background: 'var(--surface-800)', padding: '2rem', borderRadius: '16px', maxWidth: '400px', width: '100%', border: '1px solid var(--surface-600)', textAlign: 'center' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>¿Estás seguro que deseas salir?</h2>
                        <p style={{ color: 'var(--surface-300)', marginBottom: '2rem', lineHeight: 1.5 }}>
                            Puedes guardar tu progreso para continuar después, o terminar el test ahora mismo.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <button onClick={handleSaveAndExit} disabled={isSubmitting} style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: 'none', background: 'var(--primary-600)', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
                                {isSubmitting ? 'Guardando...' : 'Guardar y salir'}
                            </button>
                            <button onClick={() => { setShowExitModal(false); handleSubmitTest(); }} disabled={isSubmitting} style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid var(--surface-600)', background: 'transparent', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
                                Terminar test
                            </button>
                            <button onClick={() => setShowExitModal(false)} disabled={isSubmitting} style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: 'none', background: 'var(--surface-700)', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default TestRunner
