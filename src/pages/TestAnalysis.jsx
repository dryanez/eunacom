import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Sidebar from '../components/Sidebar'
import '../styles/dashboard.css'

const TestAnalysis = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState(null)
    const [topicBreakdown, setTopicBreakdown] = useState([])
    const [expandedTopics, setExpandedTopics] = useState(new Set())
    const [userName, setUserName] = useState('')

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('first_name')
                    .eq('id', user.id)
                    .single()
                setUserName(profile ? profile.first_name : 'Usuario')
            }
        }
        getUser()
        fetchAnalysis()
    }, [id])

    const fetchAnalysis = async () => {
        try {
            setLoading(true)

            // 1. Fetch test details
            const { data: testData, error: testError } = await supabase
                .from('tests')
                .select('*')
                .eq('id', id)
                .single()

            if (testError) throw testError

            const questionIds = testData.questions || []
            const userAnswers = testData.answers || {}

            // 2. Fetch question details
            const { data: questionsData, error: qError } = await supabase
                .from('questions')
                .select('id, topic, correct_answer, eunacom_code, question_text')
                .in('id', questionIds)

            if (qError) throw qError

            // 3. Compute Stats & Grouping
            let correctCount = 0
            let incorrectCount = 0
            let omittedCount = 0

            // Structure: Topic -> Code -> Questions
            const topicMap = {}

            // Initialize topic map
            questionsData.forEach(q => {
                const topic = q.topic || 'General'
                if (!topicMap[topic]) {
                    topicMap[topic] = {
                        total: 0, correct: 0, incorrect: 0, omitted: 0,
                        codes: {} // { "CodeName": { total, correct, incorrect, questions: [] } }
                    }
                }
            })

            // Iterate through questions
            questionsData.forEach(q => {
                const topic = q.topic || 'General'
                const code = q.eunacom_code || 'Sin Código Oficial'

                // Initialize code grouping if needed
                if (!topicMap[topic].codes[code]) {
                    topicMap[topic].codes[code] = {
                        name: code,
                        total: 0, correct: 0, incorrect: 0, omitted: 0,
                        questions: []
                    }
                }

                const userAns = userAnswers[q.id]
                const isCorrect = userAns === q.correct_answer
                const isOmitted = !userAns

                // Update Topic Totals
                topicMap[topic].total += 1
                if (isOmitted) topicMap[topic].omitted += 1
                else if (isCorrect) topicMap[topic].correct += 1
                else topicMap[topic].incorrect += 1

                // Update Code Totals
                topicMap[topic].codes[code].total += 1
                if (isOmitted) topicMap[topic].codes[code].omitted += 1
                else if (isCorrect) topicMap[topic].codes[code].correct += 1
                else topicMap[topic].codes[code].incorrect += 1

                // Push question to Code List
                topicMap[topic].codes[code].questions.push({
                    id: q.id,
                    text: q.question_text ? q.question_text.substring(0, 50) + '...' : 'Pregunta sin texto',
                    isCorrect,
                    isOmitted,
                    userAns,
                    correctAns: q.correct_answer
                })

                // Global Stats
                if (isOmitted) omittedCount++
                else if (isCorrect) correctCount++
                else incorrectCount++
            })

            const score = questionIds.length > 0
                ? Math.round((correctCount / questionIds.length) * 100)
                : 0

            setStats({
                score: score,
                total: questionIds.length,
                correct: correctCount,
                incorrect: incorrectCount,
                omitted: omittedCount
            })

            // Sort Topics A-Z
            const sortedTopics = Object.entries(topicMap)
                .map(([name, data]) => {
                    // Convert codes dict to array and sort
                    const sortedCodes = Object.values(data.codes).sort((a, b) =>
                        a.name.localeCompare(b.name, undefined, { numeric: true })
                    )
                    return { name, ...data, codes: sortedCodes }
                })
                .sort((a, b) => a.name.localeCompare(b.name))

            setTopicBreakdown(sortedTopics)

        } catch (error) {
            console.error('Error analyzing test:', error)
            setStats(null)
        } finally {
            setLoading(false)
        }
    }

    const toggleTopic = (topicName) => {
        setExpandedTopics(prev => {
            const newSet = new Set(prev)
            if (newSet.has(topicName)) newSet.delete(topicName)
            else newSet.add(topicName)
            return newSet
        })
    }

    return (
        <div className="dashboard-layout">
            <Sidebar userName={userName} />

            <main className="dashboard-main">
                <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
                    <div className="header-section" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button
                            onClick={() => navigate('/history')}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', fontSize: '1.2rem', display: 'flex', alignItems: 'center' }}
                        >
                            ←
                        </button>
                        <div>
                            <h1 style={{ fontSize: '2rem', color: '#1a3b5c', fontWeight: '700', margin: 0 }}>Análisis de Examen</h1>
                            <p style={{ margin: 0, color: '#666' }}>Detalle de rendimiento por tema y código EUNACOM</p>
                        </div>
                    </div>
                    <div className="dashboard-content" style={{ padding: '0 2rem 2rem', flex: 1 }}>
                        {loading ? (
                            <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando análisis...</div>
                        ) : !stats ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#e53e3e' }}>Error al cargar los datos.</div>
                        ) : (
                            <div style={{
                                width: '100%',
                                margin: '0',
                                background: '#fff',
                                borderRadius: '12px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                padding: '2rem',
                                minHeight: '80vh'
                            }}>

                                {/* Stats Grid - Now Full Width */}
                                <div className="stats-grid" style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                    gap: '2rem',
                                    marginBottom: '3rem'
                                }}>
                                    {/* Score Circle Card */}
                                    <div className="stat-card" style={{
                                        boxShadow: 'none', border: '1px solid #f0f0f0',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem'
                                    }}>
                                        <h3 style={{ marginBottom: '2rem' }}>Puntaje Total</h3>

                                        <div style={{ position: 'relative', width: '200px', height: '200px' }}>
                                            <svg width="200" height="200" viewBox="0 0 100 100">
                                                <circle cx="50" cy="50" r="45" fill="none" stroke="#f0f0f0" strokeWidth="8" />
                                                <circle
                                                    cx="50" cy="50" r="45" fill="none" stroke="#48bb78" strokeWidth="8"
                                                    strokeDasharray={`${(stats.score / 100) * 283} 283`}
                                                    transform="rotate(-90 50 50)"
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                            <div style={{
                                                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                <span style={{ fontSize: '3rem', fontWeight: 'bold', color: '#1a3b5c' }}>{stats.score}%</span>
                                                <span style={{ fontSize: '1rem', color: '#777' }}>Correcto</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Answers Summary Card */}
                                    <div className="stat-card" style={{ boxShadow: 'none', border: '1px solid #f0f0f0', padding: '2rem' }}>
                                        <h3 style={{ marginBottom: '2rem' }}>Resumen de Preguntas</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', justifyContent: 'center', height: '100%' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.2rem' }}>
                                                <span style={{ color: '#666' }}>Correctas</span>
                                                <span style={{ fontWeight: 'bold', color: '#48bb78', fontSize: '1.5rem' }}>{stats.correct}</span>
                                            </div>
                                            <div style={{ width: '100%', height: '10px', background: '#f0f0f0', borderRadius: '5px', overflow: 'hidden' }}>
                                                <div style={{ width: `${(stats.correct / stats.total) * 100}%`, height: '100%', background: '#48bb78' }} />
                                            </div>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.2rem' }}>
                                                <span style={{ color: '#666' }}>Incorrectas</span>
                                                <span style={{ fontWeight: 'bold', color: '#f56565', fontSize: '1.5rem' }}>{stats.incorrect}</span>
                                            </div>
                                            <div style={{ width: '100%', height: '10px', background: '#f0f0f0', borderRadius: '5px', overflow: 'hidden' }}>
                                                <div style={{ width: `${(stats.incorrect / stats.total) * 100}%`, height: '100%', background: '#f56565' }} />
                                            </div>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.2rem' }}>
                                                <span style={{ color: '#666' }}>Omitidas</span>
                                                <span style={{ fontWeight: 'bold', color: '#a0aec0', fontSize: '1.5rem' }}>{stats.omitted}</span>
                                            </div>
                                            <div style={{ width: '100%', height: '10px', background: '#f0f0f0', borderRadius: '5px', overflow: 'hidden' }}>
                                                <div style={{ width: `${(stats.omitted / stats.total) * 100}%`, height: '100%', background: '#a0aec0' }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Topics List */}
                                <div className="data-table-container" style={{ boxShadow: 'none', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                                    <h3 style={{ padding: '1.5rem', margin: 0, borderBottom: '1px solid #f0f0f0', color: '#1a3b5c' }}>Desglose por Tema</h3>
                                    <div style={{ background: '#fff' }}>
                                        {topicBreakdown.map((topic, idx) => (
                                            <div key={idx} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                                {/* Topic Header Row */}
                                                <div
                                                    onClick={() => toggleTopic(topic.name)}
                                                    style={{
                                                        padding: '1.2rem 1.5rem',
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        cursor: 'pointer',
                                                        background: expandedTopics.has(topic.name) ? '#f8fafc' : '#fff'
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <span style={{ fontWeight: '600', fontSize: '1.05rem', color: '#2d3748' }}>{topic.name}</span>
                                                        <span style={{
                                                            background: '#edf2f7', padding: '0.1rem 0.5rem', borderRadius: '10px',
                                                            fontSize: '0.75rem', color: '#4a5568'
                                                        }}>
                                                            {topic.total} pregs
                                                        </span>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                                                        <div style={{ width: '100px', textAlign: 'right' }}>
                                                            <span style={{ color: '#48bb78', fontWeight: 'bold' }}>
                                                                {topic.total > 0 ? Math.round((topic.correct / topic.total) * 100) : 0}%
                                                            </span>
                                                            <span style={{ fontSize: '0.8rem', color: '#cbd5e0', marginLeft: '0.25rem' }}>Correcto</span>
                                                        </div>
                                                        <div style={{ color: '#a0aec0' }}>
                                                            {expandedTopics.has(topic.name) ? '▲' : '▼'}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Expandable Codes List */}
                                                {expandedTopics.has(topic.name) && (
                                                    <div style={{ background: '#fcfcfc', borderTop: '1px solid #edf2f7' }}>
                                                        {topic.codes.map((code, cIdx) => (
                                                            <div key={cIdx} style={{
                                                                padding: '1rem 1.5rem 1rem 3rem',
                                                                borderBottom: cIdx === topic.codes.length - 1 ? 'none' : '1px solid #edf2f7',
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center'
                                                            }}>
                                                                <div>
                                                                    <div style={{ fontWeight: '500', color: '#4a5568', marginBottom: '0.2rem' }}>
                                                                        {code.name}
                                                                    </div>
                                                                    <div style={{ fontSize: '0.8rem', color: '#718096' }}>
                                                                        {code.total} {code.total === 1 ? 'pregunta' : 'preguntas'}
                                                                    </div>
                                                                </div>

                                                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                                    {/* Visual Pills for Questions */}
                                                                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                                                                        {code.questions.map((q, qIdx) => (
                                                                            <div key={qIdx}
                                                                                title={`Tu respuesta: ${q.userAns || 'Omitida'}`}
                                                                                style={{
                                                                                    width: '12px', height: '12px', borderRadius: '50%',
                                                                                    background: q.isCorrect ? '#48bb78' : q.isOmitted ? '#cbd5e0' : '#f56565'
                                                                                }}
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                    <div style={{ fontSize: '0.9rem', width: '60px', textAlign: 'right', fontWeight: '500', color: code.correct === code.total ? '#48bb78' : '#718096' }}>
                                                                        {Math.round((code.correct / code.total) * 100)}%
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}

export default TestAnalysis
