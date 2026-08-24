import React, { useState, useEffect } from 'react'
import {
    ChevronLeft, MoreHorizontal, Flag, Lightbulb, ChevronRight,
    Zap, PlayCircle, Check, X, CheckCircle, AlertCircle, Flame, Award, Sparkles
} from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { saveTestProgress, completeTest, insertProgress, genId } from '../lib/api'
import { XP_PER_CORRECT, XP_PER_INCORRECT } from '../utils/xpSystem'
import LoadingScreen from '../components/LoadingScreen'

const TestRunner = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { user } = useAuth()
    const { isDark } = useTheme()
    const questions = location.state?.questions || []

    const isSimulation = !!location.state?.isSimulation
    const startFinished = !!location.state?.startFinished
    const mode = location.state?.mode || 'tutor'
    const isTutorMode = mode === 'tutor'

    const [answers, setAnswers] = useState(location.state?.savedAnswers || {})
    const initTutorState = location.state?.tutorState || { firstAttempts: {}, wrongAttempts: {} }
    
    let firstUnanswered = -1
    if (questions && questions.length > 0) {
        for (let i = 0; i < questions.length; i++) {
            const qid = questions[i].id
            if (!(location.state?.savedAnswers || {})[qid] && !(initTutorState.firstAttempts || {})[qid]) {
                firstUnanswered = i
                break
            }
        }
    }
    const computedInitialIndex = firstUnanswered !== -1 
        ? Math.max(location.state?.savedIndex || 0, firstUnanswered)
        : (location.state?.savedIndex || 0)

    const [currentIndex, setCurrentIndex] = useState(computedInitialIndex)
    
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

    if (isSubmitting) return <LoadingScreen context="test" message="Finalizando y guardando tu examen..." />
    if (questions.length === 0) return <LoadingScreen context="test" message="Cargando preguntas del examen..." />

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
        const results = questions.map(q => {
            const firstAns = (!startFinished && isTutorMode) ? firstAttempts[q.id] : answers[q.id]
            const userAns = firstAns
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
            <div className="test-review-page" style={{ padding: '1.5rem 1rem', background: 'var(--surface-900)', minHeight: '100vh' }}>
                <div style={{ maxWidth: '860px', margin: '0 auto' }}>
                    <div className="card text-center" style={{ marginBottom: '1.5rem', width: '100%', padding: '2.5rem 1.5rem', borderRadius: 20 }}>
                        <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>
                            {startFinished ? 'Revisión del Examen' : '¡Examen Finalizado!'}
                        </h1>
                        {!startFinished && <p style={{ color: 'var(--surface-300)', marginBottom: '1rem' }}>Tiempo: {timeLimitSeconds > 0 ? formatTime(timeLimitSeconds - timeLeft) : formatTime(timeElapsed)}</p>}
                        
                        {!startFinished && (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(251,191,36,0.15)', color: 'var(--accent-amber)', padding: '0.5rem 1.25rem', borderRadius: '2rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                                <Zap size={18} fill="currentColor" /> +{sessionXP} XP Obtenida
                            </div>
                        )}

                        <div style={{ fontSize: '4.5rem', fontWeight: 900, color: pct >= 60 ? '#10b981' : '#ef4444', marginBottom: '0.5rem', lineHeight: 1 }}>
                            {pct}%
                        </div>
                        <p style={{ color: 'var(--surface-300)', marginBottom: '1.5rem', fontSize: '1.05rem' }}>
                            {score} de {totalQuestions} correctas
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                            <div style={{ textAlign: 'center', padding: '0.75rem 1.5rem', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 12, minWidth: 100 }}>
                                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981' }}>{score}</div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--surface-300)', fontWeight: 600 }}>Correctas</div>
                            </div>
                            <div style={{ textAlign: 'center', padding: '0.75rem 1.5rem', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 12, minWidth: 100 }}>
                                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ef4444' }}>{results.filter(r => !r.correct && !r.omitted).length}</div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--surface-300)', fontWeight: 600 }}>Incorrectas</div>
                            </div>
                            <div style={{ textAlign: 'center', padding: '0.75rem 1.5rem', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 12, minWidth: 100 }}>
                                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fbbf24' }}>{results.filter(r => r.omitted).length}</div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--surface-300)', fontWeight: 600 }}>Omitidas</div>
                            </div>
                        </div>
                    </div>

                    {/* Question grid navigator */}
                    <div className="card" style={{ marginBottom: '1.5rem', borderRadius: 18, padding: '1.25rem' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--surface-400)', letterSpacing: '0.07em', marginBottom: '0.75rem' }}>
                            VISTA RÁPIDA — {totalQuestions} PREGUNTAS
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                            {results.map((r, i) => {
                                const wrongIdx = wrongResults.findIndex(wr => wr.q.id === r.q.id)
                                const isWrongOrOmitted = wrongIdx !== -1
                                const color = r.correct ? '#10b981' : (r.omitted ? '#fbbf24' : '#ef4444')
                                const bg = r.correct ? 'rgba(16,185,129,0.15)' : (r.omitted ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)')
                                return (
                                    <button
                                        key={r.q.id}
                                        title={`P${i + 1}: ${r.correct ? 'Correcta' : (r.omitted ? 'Omitida' : 'Incorrecta')}`}
                                        onClick={() => isWrongOrOmitted && document.getElementById(`review-wrong-${wrongIdx}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                                        style={{
                                            width: 30, height: 30, borderRadius: 6, border: 'none',
                                            background: bg, color, fontSize: '0.7rem', fontWeight: 700,
                                            cursor: isWrongOrOmitted ? 'pointer' : 'default',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            transition: 'filter 0.15s',
                                        }}
                                        onMouseEnter={e => { if (isWrongOrOmitted) e.currentTarget.style.filter = 'brightness(1.3)' }}
                                        onMouseLeave={e => { e.currentTarget.style.filter = 'none' }}
                                    >
                                        {i + 1}
                                    </button>
                                )
                            })}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem 1.5rem', marginTop: '0.85rem', fontSize: '0.78rem', fontWeight: 600 }}>
                            <span style={{ color: '#10b981' }}>■ Correctas: {score}</span>
                            <span style={{ color: '#ef4444' }}>■ Incorrectas: {results.filter(r => !r.correct && !r.omitted).length}</span>
                            <span style={{ color: '#fbbf24' }}>■ Omitidas: {results.filter(r => r.omitted).length}</span>
                        </div>
                    </div>

                    {wrongResults.length > 0 && (
                        <div style={{ marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem', color: 'var(--surface-100)', fontWeight: 800, fontSize: '1.2rem' }}>
                                <AlertCircle size={22} color="#ef4444" /> Preguntas para Repasar ({wrongResults.length})
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                {wrongResults.map(({ q, userChoice, correctChoice, omitted }, i) => {
                                    const qArea = [q.category, q.topic || q.specialty].filter(Boolean).join(' · ') || q.topic || q.specialty || q.category || 'Medicina General'
                                    return (
                                        <div key={q.id} id={`review-wrong-${i}`} style={{
                                            backgroundColor: isDark ? '#0f172a' : '#ffffff',
                                            border: isDark ? '1px solid #334155' : '1px solid #cbd5e1',
                                            borderRadius: 18,
                                            padding: '24px 20px',
                                            boxShadow: isDark ? '0 10px 28px -4px rgba(0, 0, 0, 0.4)' : '0 10px 28px -4px rgba(0, 0, 0, 0.14)'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <span style={{ background: isDark ? '#1e293b' : '#f1f5f9', color: isDark ? '#94a3b8' : '#475569', fontWeight: 800, fontSize: '0.76rem', padding: '3px 10px', borderRadius: 9999 }}>
                                                        #{i + 1}
                                                    </span>
                                                    <span style={{ backgroundColor: isDark ? 'rgba(14, 165, 233, 0.15)' : '#e0f2fe', border: isDark ? '1px solid rgba(14, 165, 233, 0.3)' : '1px solid #bae6fd', color: isDark ? '#38bdf8' : '#0369a1', fontSize: '0.74rem', fontWeight: 700, padding: '3px 10px', borderRadius: 9999 }}>
                                                        {qArea}
                                                    </span>
                                                </div>
                                                <span style={{
                                                    backgroundColor: omitted ? (isDark ? 'rgba(245, 158, 11, 0.15)' : '#fef3c7') : (isDark ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2'),
                                                    border: omitted ? (isDark ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid #fde68a') : (isDark ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid #fecaca'),
                                                    color: omitted ? (isDark ? '#fbbf24' : '#92400e') : (isDark ? '#f87171' : '#dc2626'),
                                                    fontSize: '0.74rem', fontWeight: 700, padding: '3px 10px', borderRadius: 9999, display: 'flex', alignItems: 'center', gap: 4
                                                }}>
                                                    {omitted ? '⊘ Omitida' : '✗ Incorrecta'}
                                                </span>
                                            </div>

                                            <p style={{ margin: '0 0 16px', fontSize: '1rem', lineHeight: 1.65, color: isDark ? '#f8fafc' : '#1e293b', fontWeight: 500 }}>
                                                {q.question}
                                            </p>

                                            {q.imageUrl && (
                                                <div style={{ marginBottom: '1.25rem', cursor: 'zoom-in' }} onClick={() => setFullscreenImage(q.imageUrl)}>
                                                    <img src={q.imageUrl} alt="Pregunta" style={{ maxWidth: '100%', maxHeight: '280px', borderRadius: '10px', border: isDark ? '1px solid #334155' : '1px solid #cbd5e1' }} />
                                                </div>
                                            )}

                                            {/* Options list in Hero Shot style */}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 14 }}>
                                                {q.choices?.map((opt, optIdx) => {
                                                    const isCorrectOpt = opt.id.toLowerCase() === q.correctAnswer?.toLowerCase()
                                                    const isUserPick = opt.id === userChoice?.id
                                                    
                                                    let bg = isDark ? 'rgba(30, 41, 59, 0.5)' : '#ffffff'
                                                    let border = isDark ? '#334155' : '#e2e8f0'
                                                    let textColor = isDark ? '#cbd5e1' : '#334155'
                                                    let badgeContent = <span style={{ color: isDark ? '#94a3b8' : '#64748b', fontWeight: 700, fontSize: '0.82rem' }}>{opt.id || String.fromCharCode(65 + optIdx)}</span>
                                                    let statusLabel = null

                                                    if (isCorrectOpt) {
                                                        bg = isDark ? 'rgba(16, 185, 129, 0.16)' : '#ecfdf5'
                                                        border = '#10b981'
                                                        textColor = isDark ? '#34d399' : '#065f46'
                                                        badgeContent = <Check size={15} color="#10b981" strokeWidth={2.5} />
                                                        statusLabel = <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: isDark ? '#34d399' : '#059669', fontWeight: 700, flexShrink: 0 }}>✓ Respuesta Correcta</span>
                                                    } else if (isUserPick && !omitted) {
                                                        bg = isDark ? 'rgba(239, 68, 68, 0.16)' : '#fef2f2'
                                                        border = '#ef4444'
                                                        textColor = isDark ? '#f87171' : '#991b1b'
                                                        badgeContent = <X size={15} color="#ef4444" strokeWidth={2.5} />
                                                        statusLabel = <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: isDark ? '#f87171' : '#dc2626', fontWeight: 700, flexShrink: 0 }}>✗ Tu Selección</span>
                                                    }

                                                    return (
                                                        <div key={opt.id} style={{
                                                            padding: '12px 16px',
                                                            borderRadius: 12,
                                                            border: `1.5px solid ${border}`,
                                                            backgroundColor: bg,
                                                            color: textColor,
                                                            fontSize: '0.92rem',
                                                            lineHeight: 1.5,
                                                            display: 'flex',
                                                            alignItems: 'flex-start',
                                                            gap: 12,
                                                            opacity: (!isCorrectOpt && !isUserPick) ? 0.45 : 1
                                                        }}>
                                                            <div style={{
                                                                width: 26, height: 26, minWidth: 26, borderRadius: 8,
                                                                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                                                                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.06)',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                flexShrink: 0, marginTop: 1
                                                            }}>
                                                                {badgeContent}
                                                            </div>
                                                            <span style={{ flex: 1, paddingTop: 1 }}>{opt.text}</span>
                                                            {statusLabel}
                                                        </div>
                                                    )
                                                })}
                                            </div>

                                            {/* Retroalimentación clínica official card */}
                                            {q.explanation && (
                                                <div style={{
                                                    marginTop: 16,
                                                    padding: '16px 18px',
                                                    backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#f0fdf4',
                                                    border: isDark ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid #bbf7d0',
                                                    borderRadius: 14
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: isDark ? '#34d399' : '#166534', fontWeight: 700, fontSize: '0.9rem', marginBottom: 8 }}>
                                                        <CheckCircle size={17} color={isDark ? '#34d399' : '#16a34a'} /> Retroalimentación Clínica (Guías GES / MINSAL)
                                                    </div>
                                                    <p style={{ fontSize: '0.9rem', color: isDark ? '#a7f3d0' : '#15803d', lineHeight: 1.65, margin: 0 }}>
                                                        {q.explanation}
                                                    </p>
                                                    {q.videoUrl && (
                                                        <div style={{ marginTop: 12 }}>
                                                            <a href={q.videoUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 16px', background: '#0284c7', border: 'none', color: '#ffffff', borderRadius: 8, fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none' }}>
                                                                <PlayCircle size={15} /> Ver clase en video
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    <button className="btn-primary btn-primary--full" onClick={() => navigate('/dashboard')} style={{ padding: '1rem', borderRadius: 12, fontWeight: 700 }}>
                        Volver al Dashboard
                    </button>
                </div>
            </div>
        )
    }

    const areaBadge = [currentQuestion.category, currentQuestion.topic || currentQuestion.specialty]
        .filter(Boolean)
        .join(' · ') || currentQuestion.topic || currentQuestion.specialty || currentQuestion.category || 'Medicina General'

    const isRecon = location.state?.testId?.includes('recon') || (currentQuestion.id && String(currentQuestion.id).includes('_q'))

    const highYieldBadge = isSimulation
        ? { label: 'Simulacro Oficial 180Q', icon: <Flame size={12} color="#f59e0b" /> }
        : isRecon
            ? { label: 'Reconstrucción EUNACOM', icon: <Award size={12} color="#f59e0b" /> }
            : isTutorMode
                ? { label: 'Modo Tutor Clínico', icon: <Sparkles size={12} color="#f59e0b" /> }
                : { label: 'Alta Frecuencia EUNACOM', icon: <Flame size={12} color="#f59e0b" /> }

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
            <div style={{ background: 'var(--surface-800)', padding: '0.9rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--surface-700)' }}>
                <button onClick={() => setShowExitModal(true)} style={{ background: 'transparent', border: 'none', color: 'var(--surface-50)', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', padding: '0.4rem 0.6rem', borderRadius: 8, fontSize: '0.9rem', fontWeight: 600 }}>
                    <ChevronLeft size={20} /> Volver
                </button>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--surface-100)' }}>Examen EUNACOM — {currentQuestion.topic || 'Práctica'}</div>
                <button style={{ background: 'transparent', border: 'none', color: 'var(--primary-400)', cursor: 'pointer' }}><MoreHorizontal size={22} /></button>
            </div>

            {/* Status bar */}
            <div style={{ background: '#0284c7', padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'white' }}>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.01em' }}>Pregunta {currentIndex + 1} de {totalQuestions}</div>
                {isTutorMode
                    ? <div style={{ fontWeight: 700, fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.15)', padding: '3px 10px', borderRadius: 9999 }}>💡 Modo Tutor</div>
                    : <div style={{ fontWeight: 800, fontSize: '1.15rem', fontFamily: 'monospace', color: (timeLimitSeconds > 0 && timeLeft < 60) ? '#fca5a5' : 'white' }}>
                        {timeLimitSeconds > 0 ? formatTime(timeLeft) : formatTime(timeElapsed)}
                      </div>
                }
            </div>
            <div style={{ height: '4px', background: 'rgba(0,0,0,0.25)' }}>
                <div style={{ height: '100%', width: `${((currentIndex + 1) / totalQuestions) * 100}%`, background: '#38bdf8', transition: 'width 0.3s' }} />
            </div>

            {/* Main Content Area */}
            <div className="test-runner-content" style={{ maxWidth: '820px', margin: '0 auto', padding: '1.5rem 1rem 6rem', width: '100%' }}>
                
                {/* ── Floating Question Card (Night/Light Theme) ── */}
                <div style={{
                    backgroundColor: isDark ? '#0f172a' : '#ffffff',
                    border: isDark ? '1px solid #334155' : '1px solid #cbd5e1',
                    borderRadius: 18,
                    padding: '24px 20px',
                    boxShadow: isDark ? '0 12px 32px -4px rgba(0, 0, 0, 0.5)' : '0 12px 32px -4px rgba(0, 0, 0, 0.18)',
                    marginBottom: '1.5rem'
                }}>
                    {/* Header Badges */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                        <span style={{
                            backgroundColor: isDark ? 'rgba(14, 165, 233, 0.15)' : '#e0f2fe',
                            border: isDark ? '1px solid rgba(14, 165, 233, 0.3)' : '1px solid #bae6fd',
                            color: isDark ? '#38bdf8' : '#0369a1',
                            fontSize: '0.76rem', fontWeight: 700, padding: '4px 12px', borderRadius: 9999
                        }}>
                            {areaBadge}
                        </span>
                        <span style={{
                            backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : '#fef3c7',
                            border: isDark ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid #fde68a',
                            color: isDark ? '#fbbf24' : '#92400e',
                            fontSize: '0.76rem', fontWeight: 700, padding: '4px 12px', borderRadius: 9999, display: 'flex', alignItems: 'center', gap: 5
                        }}>
                            {highYieldBadge.icon} {highYieldBadge.label}
                        </span>
                    </div>

                    {/* Question text */}
                    <p style={{ fontSize: '1.02rem', lineHeight: 1.65, color: isDark ? '#f8fafc' : '#1e293b', marginBottom: 18, whiteSpace: 'pre-wrap', fontWeight: 500 }}>
                        {currentQuestion.question}
                    </p>

                    {currentQuestion.imageUrl && (
                        <div style={{ marginBottom: '1.25rem', cursor: 'zoom-in' }} onClick={() => setFullscreenImage(currentQuestion.imageUrl)}>
                            <img src={currentQuestion.imageUrl} alt="Pregunta" style={{ maxWidth: '100%', maxHeight: '350px', borderRadius: '10px', border: isDark ? '1px solid #334155' : '1px solid #cbd5e1' }} />
                        </div>
                    )}

                    {/* Options list */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {currentQuestion.choices.map((opt, i) => {
                            const qid = currentQuestion.id
                            const isCorrectOpt = opt.id.toLowerCase() === currentQuestion.correctAnswer?.toLowerCase()
                            
                            let isSelected = false
                            let hasAnswered = false
                            let tutorSolved = false
                            let isWrongAttempt = false
                            
                            if (isTutorMode) {
                                tutorSolved = answers[qid]?.toLowerCase() === currentQuestion.correctAnswer?.toLowerCase()
                                isWrongAttempt = (wrongAttempts[qid] || new Set()).has(opt.id)
                            } else {
                                hasAnswered = !!answers[qid]
                                isSelected = answers[qid] === opt.id
                            }

                            const isDisabled = (isTutorMode && (tutorSolved || isWrongAttempt)) || (!isTutorMode && hasAnswered)

                            let bg = isDark ? 'rgba(30, 41, 59, 0.6)' : '#ffffff'
                            let border = isDark ? '#334155' : '#e2e8f0'
                            let textColor = isDark ? '#e2e8f0' : '#334155'
                            let badgeContent = <span style={{ color: isDark ? '#94a3b8' : '#64748b', fontWeight: 700, fontSize: '0.88rem' }}>{opt.id || String.fromCharCode(65 + i)}</span>

                            if (isTutorMode) {
                                if (tutorSolved && isCorrectOpt) {
                                    bg = isDark ? 'rgba(16, 185, 129, 0.18)' : '#ecfdf5'
                                    border = '#10b981'
                                    textColor = isDark ? '#34d399' : '#065f46'
                                    badgeContent = <Check size={16} color="#10b981" strokeWidth={2.5} />
                                } else if (isWrongAttempt) {
                                    bg = isDark ? 'rgba(239, 68, 68, 0.18)' : '#fef2f2'
                                    border = '#ef4444'
                                    textColor = isDark ? '#fca5a5' : '#991b1b'
                                    badgeContent = <X size={16} color="#ef4444" strokeWidth={2.5} />
                                } else if (tutorSolved) {
                                    bg = isDark ? 'rgba(15, 23, 42, 0.4)' : '#f8fafc'
                                    border = isDark ? '#1e293b' : '#f1f5f9'
                                    textColor = isDark ? '#64748b' : '#94a3b8'
                                    badgeContent = <span style={{ color: isDark ? '#475569' : '#cbd5e1', fontWeight: 700, fontSize: '0.88rem' }}>{opt.id || String.fromCharCode(65 + i)}</span>
                                }
                            } else {
                                if (isSelected) {
                                    bg = isDark ? 'rgba(14, 165, 233, 0.2)' : '#f0f9ff'
                                    border = '#0284c7'
                                    textColor = isDark ? '#38bdf8' : '#0369a1'
                                    badgeContent = <span style={{ color: isDark ? '#38bdf8' : '#0284c7', fontWeight: 800, fontSize: '0.88rem' }}>{opt.id || String.fromCharCode(65 + i)}</span>
                                }
                            }

                            return (
                                <button
                                    key={opt.id}
                                    onClick={() => !isDisabled && handleSelectOption(opt.id)}
                                    disabled={isDisabled}
                                    style={{
                                        textAlign: 'left',
                                        padding: '13px 16px',
                                        borderRadius: 14,
                                        border: `1.5px solid ${border}`,
                                        backgroundColor: bg,
                                        color: textColor,
                                        fontSize: '0.94rem',
                                        lineHeight: 1.5,
                                        cursor: isDisabled ? 'default' : 'pointer',
                                        transition: 'all 0.15s ease',
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: 12,
                                        minHeight: '48px',
                                        width: '100%',
                                        opacity: (isTutorMode && tutorSolved && !isCorrectOpt) ? 0.45 : 1,
                                    }}
                                >
                                    <div style={{
                                        width: 26,
                                        height: 26,
                                        minWidth: 26,
                                        borderRadius: 8,
                                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0,0,0,0.03)',
                                        border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0,0,0,0.06)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        marginTop: 1,
                                    }}>
                                        {badgeContent}
                                    </div>
                                    <span style={{ flex: 1, paddingTop: 1 }}>{opt.text}</span>
                                    {isTutorMode && isWrongAttempt && (
                                        <span style={{ marginLeft: 'auto', fontSize: '0.82rem', color: isDark ? '#f87171' : '#dc2626', fontWeight: 700, flexShrink: 0, marginTop: 3 }}>
                                            ✗ Incorrecto
                                        </span>
                                    )}
                                    {isTutorMode && tutorSolved && isCorrectOpt && (
                                        <span style={{ marginLeft: 'auto', fontSize: '0.82rem', color: isDark ? '#34d399' : '#059669', fontWeight: 700, flexShrink: 0, marginTop: 3 }}>
                                            ✓ Correcto
                                        </span>
                                    )}
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

                        if (!tutorSolved && !hasTriedWrong) return null

                        return tutorSolved ? (
                            <div style={{
                                marginTop: '20px',
                                padding: '18px 20px',
                                backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#f0fdf4',
                                border: isDark ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid #bbf7d0',
                                borderRadius: 14
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: isDark ? '#34d399' : '#166534', fontWeight: 700, fontSize: '0.94rem', marginBottom: 8 }}>
                                    <CheckCircle size={18} color={isDark ? '#34d399' : '#16a34a'} />
                                    <span>Retroalimentación Clínica (Guías GES / MINSAL)</span>
                                    {wrongCount > 0 && (
                                        <span style={{ fontWeight: 500, fontSize: '0.8rem', color: isDark ? '#a7f3d0' : '#15803d', marginLeft: 4 }}>
                                            ({wrongCount} intento{wrongCount > 1 ? 's' : ''} previo{wrongCount > 1 ? 's' : ''})
                                        </span>
                                    )}
                                </div>
                                {currentQuestion.explanation && (
                                    <p style={{ fontSize: '0.9rem', color: isDark ? '#a7f3d0' : '#15803d', lineHeight: 1.65, margin: 0 }}>
                                        {currentQuestion.explanation}
                                    </p>
                                )}
                                {currentQuestion.videoUrl && (
                                    <div style={{ marginTop: 14 }}>
                                        <a
                                            href={currentQuestion.videoUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                                padding: '8px 16px', background: '#0284c7',
                                                border: 'none', color: '#ffffff',
                                                borderRadius: 8, fontSize: '0.84rem', fontWeight: 700, textDecoration: 'none'
                                            }}
                                        >
                                            <PlayCircle size={16} /> Ver clase en video
                                        </a>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div style={{
                                marginTop: '20px',
                                padding: '18px 20px',
                                backgroundColor: isDark ? 'rgba(245, 158, 11, 0.1)' : '#fffbeb',
                                border: isDark ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid #fde68a',
                                borderRadius: 14
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: isShowingExplanation ? 8 : 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: isDark ? '#fbbf24' : '#92400e', fontWeight: 700, fontSize: '0.94rem' }}>
                                        <AlertCircle size={18} color={isDark ? '#fbbf24' : '#d97706'} />
                                        <span>Respuesta Incorrecta — Revisa el caso e inténtalo de nuevo</span>
                                    </div>
                                    {!isShowingExplanation && (
                                        <button
                                            onClick={handleShowHint}
                                            style={{
                                                background: isDark ? 'rgba(245, 158, 11, 0.2)' : '#fef3c7',
                                                border: isDark ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid #fde68a',
                                                color: isDark ? '#fbbf24' : '#b45309', borderRadius: 8, padding: '6px 14px', fontSize: '0.8rem',
                                                fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5
                                            }}
                                        >
                                            <Lightbulb size={14} /> Ver pista
                                        </button>
                                    )}
                                </div>
                                {isShowingExplanation && currentQuestion.explanation && (
                                    <div style={{ marginTop: 8 }}>
                                        <div style={{ fontSize: '0.88rem', color: isDark ? '#fde68a' : '#78350f', lineHeight: 1.6 }}>
                                            💡 <strong>Pista clínica:</strong> {currentQuestion.explanation}
                                        </div>
                                    </div>
                                )}
                                {isShowingExplanation && currentQuestion.videoUrl && (
                                    <div style={{ marginTop: 12 }}>
                                        <a
                                            href={currentQuestion.videoUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                                padding: '8px 16px', background: '#0284c7',
                                                border: 'none', color: '#ffffff',
                                                borderRadius: 8, fontSize: '0.84rem', fontWeight: 700, textDecoration: 'none'
                                            }}
                                        >
                                            <PlayCircle size={16} /> Ver clase en video
                                        </a>
                                    </div>
                                )}
                            </div>
                        )
                    })()}

                    {/* Non-tutor explanation panel (lightbulb toggle) */}
                    {!isTutorMode && showExplanation[currentQuestion.id] && currentQuestion.explanation && (
                        <div style={{
                            marginTop: '20px',
                            padding: '18px 20px',
                            backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#f0fdf4',
                            border: isDark ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid #bbf7d0',
                            borderRadius: 14
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: isDark ? '#34d399' : '#166534', fontWeight: 700, fontSize: '0.94rem', marginBottom: 8 }}>
                                <CheckCircle size={18} color={isDark ? '#34d399' : '#16a34a'} />
                                <span>Retroalimentación Clínica (Guías GES / MINSAL)</span>
                            </div>
                            <p style={{ fontSize: '0.9rem', color: isDark ? '#a7f3d0' : '#15803d', lineHeight: 1.65, margin: 0 }}>
                                {currentQuestion.explanation}
                            </p>
                            {currentQuestion.videoUrl && (
                                <div style={{ marginTop: 14 }}>
                                    <a
                                        href={currentQuestion.videoUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            display: 'inline-flex', alignItems: 'center', gap: 6,
                                            padding: '8px 16px', background: '#0284c7',
                                            border: 'none', color: '#ffffff',
                                            borderRadius: 8, fontSize: '0.84rem', fontWeight: 700, textDecoration: 'none'
                                        }}
                                    >
                                        <PlayCircle size={16} /> Ver clase en video
                                    </a>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Bottom Navigation Buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                    <button
                        onClick={handlePrev}
                        disabled={currentIndex === 0}
                        style={{
                            padding: '1rem', borderRadius: 12, background: 'var(--surface-800)',
                            color: 'white', border: '1px solid var(--surface-700)', flex: 1,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                            opacity: currentIndex === 0 ? 0.3 : 1, cursor: currentIndex === 0 ? 'default' : 'pointer',
                            fontWeight: 600
                        }}
                    >
                        <ChevronLeft size={20} /> Anterior
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={isSubmitting}
                        style={{
                            padding: '1rem', borderRadius: 12, background: '#0284c7',
                            color: 'white', border: 'none', flex: 1,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                            cursor: isSubmitting ? 'wait' : 'pointer', fontWeight: 700,
                            opacity: isSubmitting ? 0.7 : 1, boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)'
                        }}
                    >
                        {isSubmitting ? 'Guardando...' : currentIndex < totalQuestions - 1 ? 'Siguiente' : 'Finalizar Examen'} <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Floating Quick Action Buttons */}
            <div style={{ position: 'fixed', bottom: '2rem', right: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', zIndex: 40 }}>
                <button
                    onClick={() => setFlaggedQuestions(prev => {
                        const next = new Set(prev)
                        if (next.has(currentQuestion.id)) next.delete(currentQuestion.id)
                        else next.add(currentQuestion.id)
                        return next
                    })}
                    title="Marcar pregunta"
                    style={{
                        width: '48px', height: '48px', borderRadius: '50%',
                        background: 'var(--surface-800)',
                        color: flaggedQuestions.has(currentQuestion.id) ? 'var(--accent-amber)' : 'var(--surface-300)',
                        border: `1px solid ${flaggedQuestions.has(currentQuestion.id) ? 'var(--accent-amber)' : 'var(--surface-700)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.4)', cursor: 'pointer', transition: 'all 0.2s'
                    }}
                >
                    <Flag size={18} />
                </button>
                {!isSimulation && !isTutorMode && (
                    <button
                        onClick={handleShowHint}
                        title="Ver explicación"
                        style={{
                            width: '48px', height: '48px', borderRadius: '50%',
                            background: 'var(--surface-800)',
                            color: showExplanation[currentQuestion.id] ? '#38bdf8' : 'var(--surface-300)',
                            border: `1px solid ${showExplanation[currentQuestion.id] ? '#38bdf8' : 'var(--surface-700)'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.4)', cursor: 'pointer', transition: 'all 0.2s'
                        }}
                    >
                        <Lightbulb size={20} />
                    </button>
                )}
            </div>

            {fullscreenImage && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', cursor: 'zoom-out' }} onClick={() => setFullscreenImage(null)}>
                    <img src={fullscreenImage} alt="Fullscreen" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '10px' }} />
                </div>
            )}

            {showExitModal && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div style={{ background: 'var(--surface-800)', padding: '2rem', borderRadius: '20px', maxWidth: '420px', width: '100%', border: '1px solid var(--surface-600)', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.75rem', color: 'white' }}>¿Deseas salir del examen?</h2>
                        <p style={{ color: 'var(--surface-300)', marginBottom: '1.75rem', lineHeight: 1.5, fontSize: '0.92rem' }}>
                            Puedes guardar tu progreso para continuar después, o terminar el test ahora mismo.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <button onClick={handleSaveAndExit} disabled={isSubmitting} style={{ width: '100%', padding: '0.9rem', borderRadius: '10px', border: 'none', background: '#0284c7', color: 'white', fontWeight: 700, cursor: 'pointer' }}>
                                {isSubmitting ? 'Guardando...' : 'Guardar y salir'}
                            </button>
                            <button onClick={() => { setShowExitModal(false); handleSubmitTest(); }} disabled={isSubmitting} style={{ width: '100%', padding: '0.9rem', borderRadius: '10px', border: '1px solid var(--surface-600)', background: 'transparent', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
                                Terminar test
                            </button>
                            <button onClick={() => setShowExitModal(false)} disabled={isSubmitting} style={{ width: '100%', padding: '0.9rem', borderRadius: '10px', border: 'none', background: 'var(--surface-700)', color: 'var(--surface-200)', fontWeight: 600, cursor: 'pointer' }}>
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
