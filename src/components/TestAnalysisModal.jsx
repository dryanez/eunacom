import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const TestAnalysisModal = ({ testId, onClose }) => {
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState(null)
    const [topicBreakdown, setTopicBreakdown] = useState([])
    const [expandedTopics, setExpandedTopics] = useState(new Set())

    useEffect(() => {
        fetchAnalysis()
    }, [testId])

    const fetchAnalysis = async () => {
        try {
            setLoading(true)

            // 1. Fetch test details
            const { data: testData, error: testError } = await supabase
                .from('tests')
                .select('*')
                .eq('id', testId)
                .single()

            if (testError) throw testError

            const questionIds = testData.questions || []
            const userAnswers = testData.answers || {}

            // 2. Fetch question details (adding eunacom_code)
            const { data: questionsData, error: qError } = await supabase
                .from('questions')
                .select('id, topic, correct_answer, eunacom_code')
                .in('id', questionIds)

            if (qError) throw qError

            // 3. Compute Stats
            let correctCount = 0
            let incorrectCount = 0
            let omittedCount = 0
            const topicMap = {}

            // Initialize topic map
            questionsData.forEach(q => {
                const topic = q.topic || 'General'
                if (!topicMap[topic]) {
                    topicMap[topic] = {
                        total: 0,
                        correct: 0,
                        incorrect: 0,
                        omitted: 0,
                        questions: [] // Store individual query details
                    }
                }
            })

            // Iterate through questions to score them
            questionsData.forEach(q => {
                const topic = q.topic || 'General'
                const userAns = userAnswers[q.id]
                const isCorrect = userAns === q.correct_answer
                const isOmitted = !userAns

                topicMap[topic].total += 1
                topicMap[topic].questions.push({
                    id: q.id,
                    code: q.eunacom_code || 'S/C', // Sin Codigo
                    isCorrect,
                    isOmitted,
                    userAns,
                    correctAns: q.correct_answer
                })

                if (isOmitted) {
                    omittedCount++
                    topicMap[topic].omitted += 1
                } else if (isCorrect) {
                    correctCount++
                    topicMap[topic].correct += 1
                } else {
                    incorrectCount++
                    topicMap[topic].incorrect += 1
                }
            })

            // Sort questions within each topic by EUNACOM code
            Object.values(topicMap).forEach(topicData => {
                topicData.questions.sort((a, b) => {
                    // Try to extract numbers for better sorting (e.g. EUNA-2020 vs EUNA-2019)
                    // Simple string sort for now usually works for EUNA-20XX format
                    return a.code.localeCompare(b.code, undefined, { numeric: true, sensitivity: 'base' })
                })
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

            // Convert map to array and sort by Topic Name
            setTopicBreakdown(Object.entries(topicMap)
                .map(([name, data]) => ({ name, ...data }))
                .sort((a, b) => a.name.localeCompare(b.name)))

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

    if (!testId) return null

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div style={{
                background: '#fff', width: '800px', maxWidth: '90%', maxHeight: '90vh',
                borderRadius: '12px', padding: '2rem', overflowY: 'auto',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)', position: 'relative'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: '1rem', right: '1rem', background: 'none',
                        border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#666'
                    }}
                >
                    ×
                </button>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>Cargando análisis...</div>
                ) : !stats ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#e53e3e' }}>Error al cargar los datos. Intenta nuevamente.</div>
                ) : (
                    <>
                        <h2 style={{ color: '#1a3b5c', marginBottom: '2rem', textAlign: 'center' }}>Resultados del Examen</h2>

                        <div style={{ display: 'flex', gap: '3rem', marginBottom: '3rem', justifyContent: 'center', alignItems: 'center' }}>
                            {/* Score Circle */}
                            <div style={{ position: 'relative', width: '150px', height: '150px' }}>
                                <svg width="150" height="150" viewBox="0 0 100 100">
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
                                    <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1a3b5c' }}>{stats.score}%</span>
                                    <span style={{ fontSize: '0.8rem', color: '#777' }}>Correcto</span>
                                </div>
                            </div>

                            {/* Summary Stats */}
                            <div style={{ minWidth: '250px' }}>
                                <h3 style={{ fontSize: '0.9rem', color: '#4EBDDB', marginBottom: '1rem', textTransform: 'uppercase' }}>Resumen</h3>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                                    <span style={{ color: '#666' }}>Correctas</span>
                                    <span style={{ fontWeight: 'bold', color: '#48bb78' }}>{stats.correct}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                                    <span style={{ color: '#666' }}>Incorrectas</span>
                                    <span style={{ fontWeight: 'bold', color: '#f56565' }}>{stats.incorrect}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#666' }}>Omitidas</span>
                                    <span style={{ fontWeight: 'bold', color: '#a0aec0' }}>{stats.omitted}</span>
                                </div>
                            </div>
                        </div>

                        {/* Subject Breakdown */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 style={{ fontSize: '1.2rem', color: '#1a3b5c', margin: 0 }}>Rendimiento por Tema</h3>
                                <span style={{ fontSize: '0.8rem', color: '#777' }}>Click para ver detalles</span>
                            </div>

                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #f0f0f0', textAlign: 'left', color: '#777' }}>
                                        <th style={{ padding: '0.75rem' }}>Tema</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'center' }}>Total P</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'center' }}>Correctas</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'center' }}>Incorrectas</th>
                                        <th style={{ padding: '0.75rem', width: '30px' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topicBreakdown.map((t, idx) => (
                                        <React.Fragment key={idx}>
                                            <tr
                                                onClick={() => toggleTopic(t.name)}
                                                style={{ borderBottom: '1px solid #f5f5f5', cursor: 'pointer', background: expandedTopics.has(t.name) ? '#f8fafc' : 'transparent' }}
                                            >
                                                <td style={{ padding: '0.75rem', fontWeight: '500', color: '#444' }}>{t.name}</td>
                                                <td style={{ padding: '0.75rem', textAlign: 'center' }}>{t.total}</td>
                                                <td style={{ padding: '0.75rem', textAlign: 'center', color: '#48bb78' }}>
                                                    {t.correct} ({t.total > 0 ? Math.round((t.correct / t.total) * 100) : 0}%)
                                                </td>
                                                <td style={{ padding: '0.75rem', textAlign: 'center', color: '#f56565' }}>
                                                    {t.incorrect} ({t.total > 0 ? Math.round((t.incorrect / t.total) * 100) : 0}%)
                                                </td>
                                                <td style={{ padding: '0.75rem', textAlign: 'center', color: '#aaa', fontSize: '0.8rem' }}>
                                                    {expandedTopics.has(t.name) ? '▼' : '▶'}
                                                </td>
                                            </tr>
                                            {/* Expanded Row Details */}
                                            {expandedTopics.has(t.name) && (
                                                <tr>
                                                    <td colSpan="5" style={{ padding: '0', background: '#fcfcfc' }}>
                                                        <div style={{ padding: '1rem 2rem', borderBottom: '1px solid #eee' }}>
                                                            <h5 style={{ margin: '0 0 0.5rem 0', color: '#666', fontSize: '0.85rem' }}>Preguntas:</h5>
                                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                                {t.questions.map((q, qIdx) => (
                                                                    <div key={qIdx} style={{
                                                                        padding: '0.25rem 0.75rem',
                                                                        borderRadius: '15px',
                                                                        fontSize: '0.8rem',
                                                                        background: q.isCorrect ? '#dcfce7' : q.isOmitted ? '#edf2f7' : '#fee2e2',
                                                                        color: q.isCorrect ? '#166534' : q.isOmitted ? '#4a5568' : '#991b1b',
                                                                        border: '1px solid',
                                                                        borderColor: q.isCorrect ? '#bbf7d0' : q.isOmitted ? '#cbd5e0' : '#fecaca'
                                                                    }}>
                                                                        {q.code}
                                                                        {q.userAns ? ` (${q.userAns})` : ''}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                    {topicBreakdown.length === 0 && (
                                        <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>No data available</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default TestAnalysisModal
