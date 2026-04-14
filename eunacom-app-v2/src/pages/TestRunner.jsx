import React, { useState, useEffect } from 'react'
import { ChevronLeft, MoreHorizontal, Flag, Lightbulb, ChevronRight } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { saveTestProgress, completeTest, insertProgress, askTutor, genId } from '../lib/api'
import masterQuestionDB from '../data/questionDB.json'

const TestRunner = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { user } = useAuth()
    const questions = location.state?.questions || masterQuestionDB

    const [currentIndex, setCurrentIndex] = useState(location.state?.savedIndex || 0)
    const [answers, setAnswers] = useState(location.state?.savedAnswers || {})
    const [flaggedQuestions, setFlaggedQuestions] = useState(new Set())
    const [timeElapsed, setTimeElapsed] = useState(0)
    const [isFinished, setIsFinished] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [tutorMessage, setTutorMessage] = useState(null)
    const [isTutorLoading, setIsTutorLoading] = useState(false)

    useEffect(() => { setTutorMessage(null) }, [currentIndex])

    useEffect(() => {
        if (isFinished || questions.length === 0) return
        const timer = setInterval(() => setTimeElapsed(prev => prev + 1), 1000)
        return () => clearInterval(timer)
    }, [isFinished, questions.length])

    const formatTime = (s) => {
        const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60
        return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
    }

    if (questions.length === 0) return <div style={{ padding: '2rem', color: 'white', textAlign: 'center' }}>No hay preguntas disponibles.</div>

    const currentQuestion = questions[currentIndex]
    const totalQuestions = questions.length

    const handleSelectOption = (optionId) => {
        const newAnswers = { ...answers, [currentQuestion.id]: optionId }
        setAnswers(newAnswers)
        if (location.state?.testId) saveTestProgress(location.state.testId, newAnswers, currentIndex).catch(console.error)
    }

    const handleNext = async () => {
        if (currentIndex < totalQuestions - 1) {
            setCurrentIndex(ci => ci + 1)
        } else {
            setIsSubmitting(true)
            await finishTest()
            setIsFinished(true)
            setIsSubmitting(false)
        }
    }

    const finishTest = async () => {
        let score = 0
        questions.forEach(q => { if (answers[q.id]?.toLowerCase() === q.correctAnswer?.toLowerCase()) score++ })
        const pct = Math.round((score / totalQuestions) * 100)

        if (location.state?.testId) {
            try {
                if (user) {
                    await completeTest(location.state.testId, answers, currentIndex, pct)
                    for (const q of questions) {
                        const isCorrect = answers[q.id]?.toLowerCase() === q.correctAnswer?.toLowerCase()
                        const isOmitted = !answers[q.id]
                        await insertProgress(user.id, q.id, isCorrect, isOmitted).catch(() => {})
                    }
                }
            } catch (e) { console.error('Error finishing test:', e) }
        }
    }

    const handlePrev = () => { if (currentIndex > 0) setCurrentIndex(ci => ci - 1) }

    const handleTutorRequest = async () => {
        const userAnswerId = answers[currentQuestion.id]
        if (!userAnswerId) { setTutorMessage('Por favor selecciona una respuesta primero.'); return }
        if (userAnswerId.toLowerCase() === currentQuestion.correctAnswer?.toLowerCase()) {
            setTutorMessage('¡Tu respuesta es correcta! No necesitas tutoría para esta pregunta.'); return
        }
        setIsTutorLoading(true); setTutorMessage(null)
        const userAnswerObj = currentQuestion.choices?.find(c => c.id === userAnswerId)
        const correctAnswerObj = currentQuestion.choices?.find(c => c.id.toLowerCase() === currentQuestion.correctAnswer?.toLowerCase())
        try {
            const msg = await askTutor({
                question: currentQuestion.question,
                options: currentQuestion.choices?.map(c => c.text),
                userAnswer: userAnswerObj ? userAnswerObj.text : userAnswerId,
                correctAnswer: correctAnswerObj ? correctAnswerObj.text : currentQuestion.correctAnswer,
                explanation: currentQuestion.explanation || ''
            })
            setTutorMessage(msg)
        } catch (e) { setTutorMessage('Error conectando con el tutor de IA.') }
        finally { setIsTutorLoading(false) }
    }

    if (isFinished) {
        let score = 0
        const results = questions.map(q => {
            const userAns = answers[q.id]
            const correct = userAns?.toLowerCase() === q.correctAnswer?.toLowerCase()
            if (correct) score++
            const userChoice = q.choices?.find(c => c.id === userAns)
            const correctChoice = q.choices?.find(c => c.id.toLowerCase() === q.correctAnswer?.toLowerCase())
            return { q, userAns, correct, omitted: !userAns, userChoice, correctChoice }
        })
        const pct = Math.round((score / totalQuestions) * 100)
        const wrongResults = results.filter(r => !r.correct)

        return (
            <div style={{ background: 'var(--surface-900)', minHeight: '100vh', padding: '2rem 1rem', paddingBottom: '4rem' }}>
                <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                    <div className="card" style={{ padding: '2.5rem', textAlign: 'center', marginBottom: '1.5rem' }}>
                        <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>¡Examen Finalizado!</h1>
                        <p style={{ color: 'var(--surface-300)', marginBottom: '1.5rem' }}>Tiempo: {formatTime(timeElapsed)}</p>
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

                    {wrongResults.length > 0 && (
                        <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '1.5rem' }}>
                            <div style={{ padding: '1.25rem 1.5rem', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--surface-700)' }}>
                                <h3 style={{ margin: 0, fontSize: '1rem' }}>Preguntas para Repasar ({wrongResults.length})</h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                                {wrongResults.map(({ q, userChoice, correctChoice, omitted }, i) => (
                                    <div key={q.id} style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--surface-700)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                                        <p style={{ margin: '0 0 0.75rem', fontSize: '0.93rem', lineHeight: 1.5, color: 'var(--surface-100)' }}>
                                            <strong style={{ color: 'var(--surface-400)', marginRight: '0.5rem' }}>{i + 1}.</strong>
                                            {q.question}
                                        </p>
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
                                                <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: 'rgba(255,255,255,0.04)', borderRadius: '6px', color: 'var(--surface-300)', lineHeight: 1.5 }}>
                                                    💡 {q.explanation}
                                                </div>
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
            {/* Top bar */}
            <div style={{ background: 'var(--surface-800)', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--surface-700)' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: 'var(--primary-400)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '1rem', fontWeight: 500, cursor: 'pointer' }}>
                    <ChevronLeft size={20} /> Volver
                </button>
                <div style={{ fontWeight: 700 }}>Examen EUNACOM — {currentQuestion.topic}</div>
                <button style={{ background: 'transparent', border: 'none', color: 'var(--primary-400)', cursor: 'pointer' }}><MoreHorizontal size={24} /></button>
            </div>

            {/* Status bar */}
            <div style={{ background: 'var(--primary-600)', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'white' }}>
                <div style={{ fontWeight: 700, fontSize: '1.2rem' }}>Q {currentIndex + 1} / {totalQuestions}</div>
                <div style={{ fontWeight: 700, fontSize: '1.2rem', fontFamily: 'monospace' }}>{formatTime(timeElapsed)}</div>
            </div>
            <div style={{ height: '4px', background: 'rgba(0,0,0,0.2)' }}>
                <div style={{ height: '100%', width: `${((currentIndex + 1) / totalQuestions) * 100}%`, background: 'white', transition: 'width 0.3s' }} />
            </div>

            {/* Content */}
            <div style={{ padding: '1.5rem', flex: 1, maxWidth: '800px', margin: '0 auto', width: '100%', paddingBottom: '6rem' }}>
                <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                    <p style={{ fontSize: '1.1rem', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>{currentQuestion.question}</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                    {currentQuestion.choices.map(opt => {
                        const isSelected = answers[currentQuestion.id] === opt.id
                        return (
                            <button key={opt.id} onClick={() => handleSelectOption(opt.id)} style={{
                                width: '100%', textAlign: 'left', padding: '1.25rem 1rem',
                                background: isSelected ? 'rgba(19,91,236,0.15)' : 'var(--surface-800)',
                                border: `2px solid ${isSelected ? 'var(--primary-500)' : 'var(--surface-600)'}`,
                                borderRadius: 'var(--radius)', color: 'white', fontSize: '1.05rem',
                                display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', transition: 'all 0.1s'
                            }}>
                                <div style={{ minWidth: '24px', height: '24px', borderRadius: '50%', border: `2px solid ${isSelected ? 'var(--primary-400)' : 'var(--surface-400)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {isSelected && <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--primary-400)' }} />}
                                </div>
                                <span><strong style={{ color: 'var(--surface-300)', marginRight: '0.5rem' }}>{opt.id}.</strong>{opt.text}</span>
                            </button>
                        )
                    })}
                </div>

                {(isTutorLoading || tutorMessage) && (
                    <div style={{ marginBottom: '2rem', padding: '1.5rem', borderRadius: 'var(--radius)', background: 'rgba(8,145,178,0.1)', border: '1px solid rgba(8,145,178,0.3)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#06b6d4', fontWeight: 'bold', marginBottom: '1rem' }}>
                            <Lightbulb size={20} /> Tutor Médico (Gemini 2.0)
                        </div>
                        {isTutorLoading
                            ? <div style={{ color: 'var(--surface-200)' }}>Analizando tu respuesta...</div>
                            : <div style={{ color: 'var(--surface-100)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{tutorMessage}</div>
                        }
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
                <button onClick={handleTutorRequest} style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--surface-800)', color: (isTutorLoading || tutorMessage) ? 'var(--primary-400)' : 'var(--surface-300)', border: '1px solid var(--surface-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <Lightbulb size={24} />
                </button>
            </div>
        </div>
    )
}

export default TestRunner
