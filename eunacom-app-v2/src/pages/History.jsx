import React, { useState, useEffect } from 'react'
import { Search, Filter, Play, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { fetchTests as apiFetchTests, deleteTest } from '../lib/api'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import questionDB from '../data/questionDB.json'

const HistoryCard = ({ test }) => {
    return (
        <div className="card" style={{ display: 'flex', alignItems: 'center', padding: '1.25rem', marginBottom: '1rem', gap: '1.5rem' }}>
            <div className="donut-wrapper" style={{ width: '60px', height: '60px' }}>
                <svg viewBox="0 0 36 36" className="circular-chart">
                <path className="circle-bg"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" stroke="var(--surface-600)" strokeWidth="4"
                />
                <path className="circle"
                    strokeDasharray={`${test.score}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" stroke="var(--primary-400)" strokeWidth="4" strokeLinecap="round"
                />
                </svg>
                <div className="donut-center" style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                    {test.score}%
                </div>
            </div>
            
            <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--surface-50)' }}>{test.date}</div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <span style={{ 
                        fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 600,
                        background: test.mode.includes('Tutor') ? 'rgba(19, 91, 236, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: test.mode.includes('Tutor') ? 'var(--primary-300)' : 'var(--accent-amber)'
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button 
                    onClick={() => test.onContinue(test)}
                    style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                    background: test.status === 'En Progreso' ? 'var(--primary-500)' : 'var(--accent-green)',
                    color: 'white', padding: '0.4rem 0.75rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, border: 'none', cursor: 'pointer'
                }}>
                    <Play size={14} /> {test.status === 'En Progreso' ? 'Continuar' : 'Revisar'}
                </button>
                <button 
                    onClick={() => test.onDelete(test.id)}
                    style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: 'var(--accent-red)', padding: '0.4rem 0.75rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, border: 'none', cursor: 'pointer'
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
            const data = await apiFetchTests(user.id)
            const formatted = (data || []).map(t => ({
                id: t.id,
                date: new Date(t.created_at).toLocaleDateString(),
                mode: t.mode === 'timed' ? 'Tiempo' : 'Tutor',
                status: t.status === 'completed' ? 'Completado' : 'En Progreso',
                score: t.score || 0,
                questions: typeof t.questions === 'string' ? JSON.parse(t.questions) : (t.questions || []),
                savedAnswers: typeof t.answers === 'string' ? JSON.parse(t.answers) : (t.answers || {}),
                currentQuestionIndex: t.current_question_index || 0
            }))
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

    const handleContinue = (test) => {
        const testQuestions = test.questions.map(id => questionDB.find(q => q.id === id)).filter(Boolean)

        if (testQuestions.length === 0) {
            alert('No se pudieron cargar las preguntas originales.')
            return
        }

        navigate('/test-runner', {
            state: {
                testId: test.id,
                questions: testQuestions,
                savedAnswers: test.savedAnswers || {},
                savedIndex: test.currentQuestionIndex || 0
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
