import React, { useState, useEffect } from 'react'
import { ChevronLeft, MoreHorizontal, Flag, Lightbulb, ChevronRight } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { saveTestProgress, completeTest, insertProgress, askTutor, genId } from '../lib/api'
import masterQuestionDB from '../data/questionDB.json'

const TestRunner = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const questions = location.state?.questions || masterQuestionDB

    const [currentIndex, setCurrentIndex] = useState(0)
    const [answers, setAnswers] = useState({})
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
                const { data: { user } } = await supabase.auth.getUser()
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
        questions.forEach(q => { if (answers[q.id]?.toLowerCase() === q.correctAnswer?.toLowerCase()) score++ })
        return (
            <div style={{ background: 'var(--surface-900)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="card" style={{ maxWidth: '600px', width: '100%', padding: '3rem', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>¡Examen Finalizado!</h1>
                    <p style={{ color: 'var(--surface-300)', marginBottom: '2rem' }}>Tiempo: {formatTime(timeElapsed)}</p>
                    <div style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--primary-400)', marginBottom: '1rem' }}>{score}/{totalQuestions}</div>
                    <p style={{ marginBottom: '3rem', color: 'var(--surface-300)' }}>{Math.round((score / totalQuestions) * 100)}%</p>
                    <button className="btn-primary" onClick={() => navigate('/dashboard')}>Volver al Dashboard</button>
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
                <button style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--surface-800)', color: 'var(--surface-300)', border: '1px solid var(--surface-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', cursor: 'pointer' }}>
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
