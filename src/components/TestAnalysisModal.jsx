import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const TestAnalysisModal = ({ testId, onClose }) => {
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState(null)
    const [topicBreakdown, setTopicBreakdown] = useState([])

    useEffect(() => {
        fetchAnalysis()
    }, [testId])

    const fetchAnalysis = async () => {
        try {
            setLoading(true)

            // 1. Fetch test details (score, etc)
            const { data: testData, error: testError } = await supabase
                .from('tests')
                .select('*')
                .eq('id', testId)
                .single()

            if (testError) throw testError

            // 2. Fetch user progress (answers)
            const { data: progressData, error: progressError } = await supabase
                .from('user_progress')
                .select('*')
                .eq('test_id', testId)

            if (progressError) throw progressError

            // 3. Fetch topics for these questions (Two-step query to avoid JOIN issues)
            const questionIds = progressData.map(p => p.question_id)
            let questionMap = {}

            if (questionIds.length > 0) {
                const { data: questionData, error: qError } = await supabase
                    .from('questions')
                    .select('id, topic')
                    .in('id', questionIds)

                if (qError) throw qError

                // Create lookup map
                questionData.forEach(q => {
                    questionMap[q.id] = q.topic
                })
            }

            // Calculate Stats
            const totalQ = testData.total_questions || 0
            const correct = progressData.filter(p => p.is_correct).length
            const incorrect = progressData.filter(p => !p.is_correct).length
            const omitted = totalQ - (correct + incorrect)

            // Calculate Topic Breakdown
            const topicMap = {}

            progressData.forEach(p => {
                const topic = questionMap[p.question_id] || 'General' // Use the map
                if (!topicMap[topic]) topicMap[topic] = { total: 0, correct: 0, incorrect: 0, omitted: 0 }

                topicMap[topic].total += 1
                if (p.is_correct) topicMap[topic].correct += 1
                else topicMap[topic].incorrect += 1
            })

            setStats({
                score: testData.score || 0,
                total: totalQ,
                correct,
                incorrect,
                omitted
            })

            setTopicBreakdown(Object.entries(topicMap).map(([name, data]) => ({ name, ...data })))

        } catch (error) {
            console.error('Error analyzing test:', error)
            setStats(null)
        } finally {
            setLoading(false)
        }
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
                                <span style={{ fontSize: '0.8rem', color: '#777' }}>Mostrando todo</span>
                            </div>

                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #f0f0f0', textAlign: 'left', color: '#777' }}>
                                        <th style={{ padding: '0.75rem' }}>Tema</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'center' }}>Total P</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'center' }}>Correctas</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'center' }}>Incorrectas</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topicBreakdown.map((t, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                            <td style={{ padding: '0.75rem', fontWeight: '500', color: '#444' }}>{t.name}</td>
                                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>{t.total}</td>
                                            <td style={{ padding: '0.75rem', textAlign: 'center', color: '#48bb78' }}>
                                                {t.correct} ({t.total > 0 ? Math.round((t.correct / t.total) * 100) : 0}%)
                                            </td>
                                            <td style={{ padding: '0.75rem', textAlign: 'center', color: '#f56565' }}>
                                                {t.incorrect} ({t.total > 0 ? Math.round((t.incorrect / t.total) * 100) : 0}%)
                                            </td>
                                        </tr>
                                    ))}
                                    {topicBreakdown.length === 0 && (
                                        <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>No data available</td></tr>
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
