import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Sidebar from '../components/Sidebar'
import '../styles/dashboard.css'

function Simulation() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [questionCount, setQuestionCount] = useState(0)

    useEffect(() => {
        fetchQuestionCount()
    }, [])

    const fetchQuestionCount = async () => {
        try {
            const { count, error } = await supabase
                .from('questions')
                .select('*', { count: 'exact', head: true })

            if (error) throw error
            setQuestionCount(count || 0)
        } catch (error) {
            console.error('Error fetching question count:', error)
        }
    }

    const handleCreateSimulation = async () => {
        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('No user found')


            // Fetch ALL questions (ID and Text for deduplication)
            const { data: allQuestions, error: qError } = await supabase
                .from('questions')
                .select('id, question_text')

            if (qError) throw qError

            // DEDUPLICATE: Ensure strictly unique questions by text
            // This prevents "Cross-Topic" duplicates (e.g. Surgery/Urology split) from appearing twice in one exam
            const uniqueMap = new Map()
            allQuestions.forEach(q => {
                if (q.question_text) {
                    const text = q.question_text.trim()
                    if (!uniqueMap.has(text)) {
                        uniqueMap.set(text, q)
                    }
                }
            })
            const uniqueQuestions = Array.from(uniqueMap.values())

            if (uniqueQuestions.length < 180) {
                alert(`No hay suficientes preguntas únicas. Se necesitan 180, pero solo hay ${uniqueQuestions.length} disponibles.`)
                setLoading(false)
                return
            }

            // Shuffle and select 180 random UNIQUE questions
            const shuffled = uniqueQuestions.sort(() => 0.5 - Math.random())
            const selected180 = shuffled.slice(0, 180)

            // Split into two sections of 90 each
            const section1 = selected180.slice(0, 90).map(q => q.id)
            const section2 = selected180.slice(90, 180).map(q => q.id)

            // Create test session with sections
            const { data, error } = await supabase
                .from('tests')
                .insert({
                    user_id: user.id,
                    mode: 'simulation',
                    time_limit_seconds: 180 * 60, // 180 minutes total (1 min per question)
                    total_questions: 180,
                    questions: selected180.map(q => q.id),

                    metadata: {
                        section1: section1,
                        section2: section2
                    },
                    status: 'in_progress'
                })
                .select()

            if (error) throw error

            // Redirect to test runner
            if (data && data.length > 0) {
                navigate(`/test-runner/${data[0].id}`)
            } else {
                navigate('/history')
            }

        } catch (error) {
            console.error('Error creating simulation:', error)
            alert('Error al crear la simulación. Por favor intenta de nuevo.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="dashboard-main">
                <header className="dashboard__header" style={{ justifyContent: 'space-between' }}>
                    <h2 style={{ color: 'white', margin: 0, fontSize: '1.25rem' }}>Simulación EUNACOM</h2>
                    <div className="header-user">
                        <span>Usuario</span>
                    </div>
                </header>

                <div className="dashboard-content">
                    <div className="status-card-full" style={{
                        background: 'white',
                        borderRadius: '12px',
                        padding: '2rem',
                        maxWidth: '800px',
                        margin: '0 auto',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎯</div>
                        <h1 style={{ fontSize: '2rem', color: '#333', marginBottom: '1rem' }}>Simulación EUNACOM</h1>

                        <div style={{
                            background: '#f8f9fa',
                            borderRadius: '8px',
                            padding: '1.5rem',
                            marginBottom: '2rem',
                            textAlign: 'left'
                        }}>
                            <h3 style={{ color: '#4EBDDB', marginBottom: '1rem' }}>📋 Detalles de la Simulación</h3>
                            <ul style={{ color: '#555', lineHeight: '1.8', paddingLeft: '1.5rem' }}>
                                <li><strong>Total de preguntas:</strong> 180 preguntas</li>
                                <li><strong>Sección 1:</strong> 90 preguntas aleatorias</li>
                                <li><strong>Sección 2:</strong> 90 preguntas aleatorias</li>
                                <li><strong>Tiempo total:</strong> 180 minutos (1 minuto por pregunta)</li>
                                <li><strong>Modo:</strong> Simulación (sin feedback inmediato)</li>
                            </ul>
                        </div>

                        <div style={{
                            background: '#fff3cd',
                            border: '1px solid #ffc107',
                            borderRadius: '8px',
                            padding: '1rem',
                            marginBottom: '2rem',
                            color: '#856404'
                        }}>
                            <strong>⚠️ Importante:</strong> Esta es una simulación completa del examen EUNACOM.
                            No podrás ver las respuestas correctas hasta finalizar el examen.
                        </div>

                        <div style={{ marginBottom: '1.5rem', color: '#777' }}>
                            <strong>Preguntas disponibles en el banco:</strong> {questionCount}
                        </div>

                        <button
                            onClick={handleCreateSimulation}
                            disabled={loading || questionCount < 180}
                            style={{
                                padding: '1.25rem 3rem',
                                background: questionCount < 180 ? '#ccc' : '#4EBDDB',
                                color: 'white',
                                border: 'none',
                                borderRadius: '30px',
                                fontWeight: '700',
                                fontSize: '1.1rem',
                                cursor: questionCount < 180 ? 'not-allowed' : 'pointer',
                                boxShadow: questionCount < 180 ? 'none' : '0 4px 12px rgba(78, 189, 219, 0.3)',
                                transition: 'all 0.3s'
                            }}
                        >
                            {loading ? 'Creando simulación...' : 'INICIAR SIMULACIÓN'}
                        </button>

                        {questionCount < 180 && (
                            <p style={{ color: '#d32f2f', marginTop: '1rem', fontSize: '0.9rem' }}>
                                Se necesitan al menos 180 preguntas para crear una simulación.
                            </p>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}

export default Simulation
