import React, { useState, useEffect } from 'react'
import { Search, Filter, Play, Trash2 } from 'lucide-react'
import { fetchTests as apiFetchTests, deleteTest } from '../lib/api'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { loadTestQuestions, getQuestionDB } from '../lib/questionDB'

const HistoryCard = ({ test }) => {
    // Logic for score colors
    let scoreColor = 'var(--primary-400)'
    if (test.status === 'Completado') {
        scoreColor = test.score >= 50 ? 'var(--accent-green)' : 'var(--accent-red)'
    }
    
    const scoreText = test.status === 'Completado' ? (test.score >= 50 ? 'Aprobado' : 'Reprobado') : 'Progreso'

    // Reconstrucciones vs regular markers
    const typeColor = test.isReconstruction ? 'rgba(139, 92, 246, 0.15)' : 'rgba(19, 91, 236, 0.15)'
    const typeTextColor = test.isReconstruction ? '#a78bfa' : 'var(--primary-300)'
    const typeLabel = test.isReconstruction ? 'Reconstrucción' : 'Práctica'

    return (
        <div className="card" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', padding: '1.25rem', marginBottom: '1rem', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div className="donut-wrapper" style={{ width: '60px', height: '60px' }}>
                    <svg viewBox="0 0 36 36" className="circular-chart">
                    <path className="circle-bg"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none" stroke="var(--surface-600)" strokeWidth="4"
                    />
                    <path className="circle"
                        strokeDasharray={`${test.score}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none" stroke={scoreColor} strokeWidth="4" strokeLinecap="round"
                    />
                    </svg>
                    <div className="donut-center" style={{ fontSize: '0.9rem', fontWeight: 700, color: scoreColor }}>
                        {test.score}%
                    </div>
                </div>
                {test.status === 'Completado' && (
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: scoreColor, textTransform: 'uppercase' }}>
                        {scoreText}
                    </span>
                )}
            </div>
            
            <div style={{ flex: '1 1 200px' }}>
                <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.2rem', color: 'white' }}>
                    {test.title}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--surface-300)', marginBottom: '0.75rem' }}>
                    {test.date}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <span style={{ 
                        fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 600,
                        background: typeColor, color: typeTextColor
                    }}>
                        {typeLabel}
                    </span>
                    <span style={{ 
                        fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 600,
                        background: test.mode === 'Tutor' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        color: test.mode === 'Tutor' ? 'var(--accent-amber)' : 'var(--accent-green)'
                    }}>
                        {test.mode}
                    </span>
                    <span style={{ 
                        fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 600,
                        background: test.status === 'Completado' ? 'rgba(22, 163, 74, 0.15)' : 'rgba(6, 182, 212, 0.15)',
                        color: test.status === 'Completado' ? 'var(--accent-green)' : 'var(--accent-teal)'
                    }}>
                        {test.status}
                    </span>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', flex: '1 1 100%' }}>
                <button 
                    onClick={() => test.onContinue(test)}
                    style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                    background: test.status === 'En Progreso' ? 'var(--primary-500)' : 'var(--accent-green)',
                    color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600, border: 'none', cursor: 'pointer',
                    flex: 1
                }}>
                    <Play size={14} /> {test.status === 'En Progreso' ? 'Continuar' : 'Revisar'}
                </button>
                <button 
                    onClick={() => test.onDelete(test.id)}
                    style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: 'var(--accent-red)', padding: '0.5rem 1rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600, border: 'none', cursor: 'pointer',
                    flex: 1
                }}>
                    <Trash2 size={14} /> Eliminar
                </button>
            </div>
        </div>
    )
}

const History = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [tests, setTests] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user) loadTests()
    }, [user])

    const loadTests = async () => {
        setLoading(true)
        try {
            const [data, db] = await Promise.all([
                apiFetchTests(user.id),
                getQuestionDB()
            ])

            const qMap = new Map(db.map(q => [q.id, q.topic || 'Sin categoría']))

            const formatted = (data || []).map(t => {
                const questions = typeof t.questions === 'string' ? JSON.parse(t.questions) : (t.questions || [])
                let isReconstruction = false
                let testTitle = "Examen Aleatorio"
                
                if (questions.length > 0) {
                    const firstQ = questions[0]
                    if (typeof firstQ === 'string' && firstQ.includes('_q')) {
                        isReconstruction = true
                        const prefix = firstQ.split('_q')[0]
                        testTitle = prefix.split(/[-_]/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                    } else {
                        // Find topics
                        const topics = new Set()
                        questions.forEach(qid => {
                            if (qMap.has(qid)) topics.add(qMap.get(qid))
                        })
                        
                        if (topics.size > 0 && topics.size < 5) {
                            testTitle = Array.from(topics).join(', ')
                        } else {
                            testTitle = "Examen Aleatorio"
                        }
                    }
                }
                
                return {
                    id: t.id,
                    date: new Date(t.created_at).toLocaleDateString(),
                    mode: t.mode === 'timed' ? 'Tiempo' : 'Tutor',
                    status: t.status === 'completed' ? 'Completado' : 'En Progreso',
                    score: t.score || 0,
                    questions,
                    savedAnswers: typeof t.answers === 'string' ? JSON.parse(t.answers) : (t.answers || {}),
                    currentQuestionIndex: t.current_question_index || 0,
                    title: testTitle,
                    isReconstruction
                }
            })
            setTests(formatted)
        } catch (error) {
            console.error('Error fetching history:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('¿Seguro que deseas eliminar este examen?')) return
        try {
            await deleteTest(id)
            setTests(prev => prev.filter(t => t.id !== id))
        } catch (error) {
            console.error('Error deleting test:', error)
        }
    }

    const handleContinue = async (test) => {
        const testQuestions = await loadTestQuestions(test.questions)
        const isCompleted = test.status === 'Completado'

        if (testQuestions.length === 0) {
            alert('No se pudieron cargar las preguntas originales.')
            return
        }

        navigate('/test-runner', {
            state: {
                testId: test.id,
                questions: testQuestions,
                savedAnswers: test.savedAnswers || {},
                savedIndex: test.currentQuestionIndex || 0,
                startFinished: isCompleted,
            }
        })
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 className="page__title">Historial de Exámenes</h1>
            <p className="page__subtitle">Revisa tus exámenes pasados y en progreso</p>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--surface-400)' }} />
                    <input 
                        type="text" 
                        placeholder="Buscar por ID o fecha..." 
                        style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.8rem', background: 'var(--surface-700)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius)', color: 'white', outline: 'none' }}
                    />
                </div>
                <button style={{ background: 'var(--surface-700)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius)', padding: '0 1rem', color: 'var(--surface-200)', cursor: 'pointer' }}>
                    <Filter size={20} />
                </button>
            </div>

            <div>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--surface-400)' }}>Cargando historial...</div>
                ) : tests.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--surface-400)' }}>
                        No hay exámenes en tu historial.
                    </div>
                ) : (
                    tests.map(test => (
                        <HistoryCard key={test.id} test={{...test, onDelete: handleDelete, onContinue: handleContinue}} />
                    ))
                )}
            </div>
        </div>
    )
}

export default History
