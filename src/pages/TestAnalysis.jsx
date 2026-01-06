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
                <div style={{ padding: '2rem', maxWidth: '100%', margin: '0 auto' }}>
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

                    {loading ? (
                        <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando análisis...</div>
                    ) : !stats ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#e53e3e' }}>Error al cargar los datos.</div>
                    ) : (
                        <>
                            {/* Stats Grid - 2 Columns */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '380px 1fr',
                                gap: '2rem',
                                marginBottom: '2rem',
                                width: '100%'
                            }}>
                                {/* Left Column: Your Score */}
                                <div style={{
                                    background: '#fff',
                                    borderRadius: '8px',
                                    padding: '1.5rem',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                }}>
                                    <h3 style={{ fontSize: '1rem', color: '#1a3b5c', marginBottom: '1.5rem', fontWeight: '600' }}>Your Score</h3>

                                    {/* Score Circle */}
                                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                        <div style={{ position: 'relative', width: '160px', height: '160px' }}>
                                            <svg width="160" height="160" viewBox="0 0 100 100">
                                                <circle cx="50" cy="50" r="45" fill="none" stroke="#f0f0f0" strokeWidth="5" />
                                                <circle
                                                    cx="50" cy="50" r="45" fill="none" stroke="#48bb78" strokeWidth="5"
                                                    strokeDasharray={`${(stats.score / 100) * 283} 283`}
                                                    transform="rotate(-90 50 50)"
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                            <div style={{
                                                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                <span style={{ fontSize: '2.2rem', fontWeight: 'bold', color: '#1a3b5c' }}>{stats.score}%</span>
                                                <span style={{ fontSize: '0.85rem', color: '#999' }}>Correct</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats List */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #f0f0f0' }}>
                                            <span style={{ color: '#666', fontSize: '0.9rem' }}>Total Correct</span>
                                            <span style={{
                                                background: '#f5f5f5',
                                                color: '#666',
                                                padding: '0.2rem 0.6rem',
                                                borderRadius: '10px',
                                                fontSize: '0.85rem',
                                                fontWeight: '600',
                                                minWidth: '30px',
                                                textAlign: 'center'
                                            }}>{stats.correct}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #f0f0f0' }}>
                                            <span style={{ color: '#666', fontSize: '0.9rem' }}>Total Incorrect</span>
                                            <span style={{
                                                background: '#f5f5f5',
                                                color: '#666',
                                                padding: '0.2rem 0.6rem',
                                                borderRadius: '10px',
                                                fontSize: '0.85rem',
                                                fontWeight: '600',
                                                minWidth: '30px',
                                                textAlign: 'center'
                                            }}>{stats.incorrect}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0' }}>
                                            <span style={{ color: '#666', fontSize: '0.9rem' }}>Total Omitted</span>
                                            <span style={{
                                                background: '#f5f5f5',
                                                color: '#666',
                                                padding: '0.2rem 0.6rem',
                                                borderRadius: '10px',
                                                fontSize: '0.85rem',
                                                fontWeight: '600',
                                                minWidth: '30px',
                                                textAlign: 'center'
                                            }}>{stats.omitted}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Answer Changes */}
                                <div style={{
                                    background: '#fff',
                                    borderRadius: '8px',
                                    padding: '1.5rem',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                }}>
                                    <h3 style={{ fontSize: '1rem', color: '#1a3b5c', marginBottom: '1.5rem', fontWeight: '600' }}>Answer Changes</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #f0f0f0' }}>
                                            <span style={{ color: '#666', fontSize: '0.9rem' }}>Correct to Incorrect</span>
                                            <span style={{
                                                background: '#f5f5f5',
                                                color: '#666',
                                                padding: '0.2rem 0.6rem',
                                                borderRadius: '10px',
                                                fontSize: '0.85rem',
                                                fontWeight: '600',
                                                minWidth: '30px',
                                                textAlign: 'center'
                                            }}>0</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #f0f0f0' }}>
                                            <span style={{ color: '#666', fontSize: '0.9rem' }}>Incorrect to Correct</span>
                                            <span style={{
                                                background: '#f5f5f5',
                                                color: '#666',
                                                padding: '0.2rem 0.6rem',
                                                borderRadius: '10px',
                                                fontSize: '0.85rem',
                                                fontWeight: '600',
                                                minWidth: '30px',
                                                textAlign: 'center'
                                            }}>0</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0' }}>
                                            <span style={{ color: '#666', fontSize: '0.9rem' }}>Incorrect to Incorrect</span>
                                            <span style={{
                                                background: '#f5f5f5',
                                                color: '#666',
                                                padding: '0.2rem 0.6rem',
                                                borderRadius: '10px',
                                                fontSize: '0.85rem',
                                                fontWeight: '600',
                                                minWidth: '30px',
                                                textAlign: 'center'
                                            }}>0</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Subjects Table */}
                            <div style={{
                                background: '#fff',
                                borderRadius: '8px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                overflow: 'hidden'
                            }}>
                                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ fontSize: '1rem', color: '#1a3b5c', margin: 0, fontWeight: '600' }}>Subjects</h3>
                                    <button style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: '1.2rem' }}>^</button>
                                </div>

                                {/* Table Header */}
                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '0.75rem 1.5rem', background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                                    <div style={{ fontSize: '0.85rem', color: '#999', fontWeight: '600' }}>NAME</div>
                                    <div style={{ fontSize: '0.85rem', color: '#999', textAlign: 'center', fontWeight: '600' }}>TOTAL Q</div>
                                    <div style={{ fontSize: '0.85rem', color: '#999', textAlign: 'center', fontWeight: '600' }}>CORRECT Q</div>
                                    <div style={{ fontSize: '0.85rem', color: '#999', textAlign: 'center', fontWeight: '600' }}>INCORRECT Q</div>
                                    <div style={{ fontSize: '0.85rem', color: '#999', textAlign: 'center', fontWeight: '600' }}>OMITTED Q</div>
                                </div>

                                {/* Table Rows */}
                                {topicBreakdown.map((topic, idx) => (
                                    <div key={idx}>
                                        <div
                                            onClick={() => toggleTopic(topic.name)}
                                            style={{
                                                display: 'grid',
                                                gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                                                padding: '1rem 1.5rem',
                                                borderBottom: '1px solid #f5f5f5',
                                                cursor: 'pointer',
                                                background: expandedTopics.has(topic.name) ? '#fafafa' : '#fff'
                                            }}
                                        >
                                            <div style={{ fontSize: '0.9rem', color: '#333', fontWeight: '500' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                    <span>{expandedTopics.has(topic.name) ? '▼' : '▶'}</span>
                                                    {topic.name}
                                                </div>
                                                {/* Progress Bar */}
                                                <div style={{ width: '90%', height: '6px', background: '#f0f0f0', borderRadius: '3px', overflow: 'hidden', marginLeft: '1.5rem' }}>
                                                    <div style={{
                                                        width: `${topic.total > 0 ? (topic.correct / topic.total) * 100 : 0}%`,
                                                        height: '100%',
                                                        background: '#48bb78',
                                                        transition: 'width 0.3s ease'
                                                    }} />
                                                </div>
                                            </div>
                                            <div style={{ fontSize: '0.9rem', color: '#666', textAlign: 'center' }}>{topic.total}</div>
                                            <div style={{ fontSize: '0.9rem', color: '#666', textAlign: 'center' }}>
                                                {topic.correct} ({topic.total > 0 ? Math.round((topic.correct / topic.total) * 100) : 0}%)
                                            </div>
                                            <div style={{ fontSize: '0.9rem', color: '#666', textAlign: 'center' }}>
                                                {topic.incorrect} ({topic.total > 0 ? Math.round((topic.incorrect / topic.total) * 100) : 0}%)
                                            </div>
                                            <div style={{ fontSize: '0.9rem', color: '#666', textAlign: 'center' }}>
                                                {topic.omitted} ({topic.total > 0 ? Math.round((topic.omitted / topic.total) * 100) : 0}%)
                                            </div>
                                        </div>

                                        {/* Expanded Codes */}
                                        {expandedTopics.has(topic.name) && (
                                            <div style={{ background: '#fcfcfc', padding: '1rem 3rem' }}>
                                                {topic.codes.map((code, cIdx) => (
                                                    <div key={cIdx} style={{
                                                        padding: '0.75rem 0',
                                                        borderBottom: cIdx === topic.codes.length - 1 ? 'none' : '1px solid #f0f0f0',
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center'
                                                    }}>
                                                        <div>
                                                            <div style={{ fontWeight: '500', color: '#4a5568', fontSize: '0.85rem', marginBottom: '0.2rem' }}>
                                                                {code.name}
                                                            </div>
                                                            <div style={{ fontSize: '0.75rem', color: '#999' }}>
                                                                {code.total} {code.total === 1 ? 'question' : 'questions'}
                                                            </div>
                                                        </div>

                                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                                                                {code.questions.map((q, qIdx) => (
                                                                    <div key={qIdx}
                                                                        title={`Your answer: ${q.userAns || 'Omitted'}`}
                                                                        style={{
                                                                            width: '10px', height: '10px', borderRadius: '50%',
                                                                            background: q.isCorrect ? '#48bb78' : q.isOmitted ? '#cbd5e0' : '#f56565'
                                                                        }}
                                                                    />
                                                                ))}
                                                            </div>
                                                            <div style={{ fontSize: '0.85rem', fontWeight: '600', color: code.correct === code.total ? '#48bb78' : '#666' }}>
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
                        </>
                    )}
                </div>
            </main>
        </div>
    )
}

export default TestAnalysis
