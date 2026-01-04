import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import '../styles/neumorphism.css'

const Practice = () => {
    const [question, setQuestion] = useState(null)
    const [selectedAnswer, setSelectedAnswer] = useState(null)
    const [showExplanation, setShowExplanation] = useState(false)
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({ correct: 0, total: 0 })
    const { user, loading: authLoading, signOut } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (authLoading) return

        if (!user) {
            navigate('/login')
            return
        }
        fetchRandomQuestion()
    }, [user, authLoading, navigate])

    const fetchRandomQuestion = async () => {
        setLoading(true)
        setSelectedAnswer(null)
        setShowExplanation(false)

        try {
            // Get a random question
            const { data, error } = await supabase
                .from('questions')
                .select('*')
                .limit(1)
                .order('id', { ascending: false })

            if (error) throw error

            if (data && data.length > 0) {
                // Get a truly random question by fetching count first
                const { count } = await supabase
                    .from('questions')
                    .select('*', { count: 'exact', head: true })

                const randomOffset = Math.floor(Math.random() * count)

                const { data: randomData, error: randomError } = await supabase
                    .from('questions')
                    .select('*')
                    .range(randomOffset, randomOffset)

                if (randomError) throw randomError
                setQuestion(randomData[0])
            }
        } catch (error) {
            console.error('Error fetching question:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAnswerSelect = async (answer) => {
        if (showExplanation) return // Already answered

        setSelectedAnswer(answer)
        setShowExplanation(true)

        const isCorrect = answer === question.correct_answer

        // Update stats
        setStats(prev => ({
            correct: prev.correct + (isCorrect ? 1 : 0),
            total: prev.total + 1
        }))

        // Save progress to Supabase
        try {
            await supabase
                .from('user_progress')
                .insert({
                    user_id: user.id,
                    question_id: question.id,
                    is_correct: isCorrect
                })
        } catch (error) {
            console.error('Error saving progress:', error)
        }
    }

    const handleLogout = async () => {
        await signOut()
        navigate('/login')
    }

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
                <div className="neu-card" style={{ padding: '2rem' }}>
                    <p style={{ color: 'var(--color-text-main)' }}>Cargando pregunta...</p>
                </div>
            </div>
        )
    }

    if (!question) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
                <div className="neu-card" style={{ padding: '2rem' }}>
                    <p style={{ color: 'var(--color-text-main)' }}>No se encontraron preguntas</p>
                </div>
            </div>
        )
    }

    const options = [
        { letter: 'A', text: question.option_a },
        { letter: 'B', text: question.option_b },
        { letter: 'C', text: question.option_c },
        { letter: 'D', text: question.option_d },
        { letter: 'E', text: question.option_e },
    ]

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg)', padding: '2rem' }}>
            {/* Header */}
            <div style={{ maxWidth: '900px', margin: '0 auto', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-neutral-900)', marginBottom: '0.5rem' }}>
                        Práctica EUNACOM
                    </h1>
                    <p style={{ color: 'var(--color-text-light)' }}>
                        {question.topic} • {stats.total > 0 ? `${Math.round((stats.correct / stats.total) * 100)}% correctas` : 'Comienza a practicar'}
                    </p>
                </div>
                <button onClick={handleLogout} className="btn-neu" style={{ padding: '0.75rem 1.5rem' }}>
                    Cerrar Sesión
                </button>
            </div>

            {/* Question Card */}
            <div className="neu-card" style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <span style={{ background: 'var(--gradient-primary)', color: 'white', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.9rem', fontWeight: '600' }}>
                        {question.topic}
                    </span>
                </div>

                <p style={{ fontSize: '1.2rem', lineHeight: '1.8', color: 'var(--color-neutral-900)', marginBottom: '2rem', whiteSpace: 'pre-wrap' }}>
                    {question.question_text}
                </p>

                {/* Options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                    {options.map((option) => {
                        const isSelected = selectedAnswer === option.letter
                        const isCorrect = option.letter === question.correct_answer
                        const showCorrect = showExplanation && isCorrect
                        const showIncorrect = showExplanation && isSelected && !isCorrect

                        return (
                            <button
                                key={option.letter}
                                onClick={() => handleAnswerSelect(option.letter)}
                                disabled={showExplanation}
                                className="neu-card"
                                style={{
                                    padding: '1.5rem',
                                    textAlign: 'left',
                                    cursor: showExplanation ? 'default' : 'pointer',
                                    border: showCorrect ? '2px solid var(--color-success-500)' : showIncorrect ? '2px solid #e57373' : 'none',
                                    background: showCorrect ? 'rgba(0, 230, 118, 0.1)' : showIncorrect ? 'rgba(229, 115, 115, 0.1)' : 'var(--color-bg)',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                    <span style={{
                                        fontWeight: '700',
                                        color: showCorrect ? 'var(--color-success-500)' : showIncorrect ? '#e57373' : 'var(--color-primary-500)',
                                        minWidth: '30px'
                                    }}>
                                        {option.letter}.
                                    </span>
                                    <span style={{ color: 'var(--color-neutral-900)', flex: 1 }}>{option.text}</span>
                                    {showCorrect && <span style={{ color: 'var(--color-success-500)' }}>✓</span>}
                                    {showIncorrect && <span style={{ color: '#e57373' }}>✗</span>}
                                </div>
                            </button>
                        )
                    })}
                </div>

                {/* Explanation */}
                {showExplanation && question.explanation && (
                    <div className="neu-card" style={{ padding: '1.5rem', background: 'rgba(78, 189, 219, 0.05)', border: '1px solid rgba(78, 189, 219, 0.2)' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-primary-500)', marginBottom: '0.75rem' }}>
                            Explicación
                        </h3>
                        <p style={{ color: 'var(--color-neutral-900)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                            {question.explanation}
                        </p>
                    </div>
                )}

                {/* Next Button */}
                {showExplanation && (
                    <button
                        onClick={fetchRandomQuestion}
                        className="btn-neu"
                        style={{
                            width: '100%',
                            padding: '1.2rem',
                            marginTop: '2rem',
                            fontSize: '1.1rem',
                            fontWeight: '700',
                            background: 'var(--gradient-primary)',
                            color: 'white'
                        }}
                    >
                        Siguiente Pregunta →
                    </button>
                )}
            </div>
        </div>
    )
}

export default Practice
