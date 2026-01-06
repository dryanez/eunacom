import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Sidebar from '../components/Sidebar'
import { TrendingUp, Target, Award, Clock, CheckCircle, XCircle, Circle } from 'lucide-react'
import '../styles/dashboard.css'

const Statistics = () => {
    const { user, loading: authLoading } = useAuth()
    const navigate = useNavigate()
    const [stats, setStats] = useState({
        totalCorrect: 0,
        totalIncorrect: 0,
        totalOmitted: 0,
        usedQuestions: 0,
        unusedQuestions: 0,
        totalQuestions: 0,
        testsCreated: 0,
        testsCompleted: 0,
        suspendedTests: 0,
        percentileRank: 0,
        medianScore: 0,
        avgTimeSpent: 0,
        othersAvgTime: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (authLoading) return
        if (!user) {
            navigate('/login')
            return
        }
        fetchStats()
    }, [user, authLoading, navigate])

    const fetchStats = async () => {
        try {
            setLoading(true)

            // Fetch user progress
            const { data: progress, error: progressError } = await supabase
                .from('user_progress')
                .select('*')
                .eq('user_id', user.id)

            if (progressError) throw progressError

            const totalCorrect = progress?.filter(p => p.is_correct).length || 0
            const totalIncorrect = progress?.filter(p => !p.is_correct && !p.is_omitted).length || 0
            const totalOmitted = progress?.filter(p => p.is_omitted).length || 0
            const usedQuestions = progress?.length || 0

            // Fetch total questions
            const { count: totalQuestions } = await supabase
                .from('questions')
                .select('*', { count: 'exact', head: true })

            // Fetch tests
            const { data: tests, error: testsError } = await supabase
                .from('tests')
                .select('*')
                .eq('user_id', user.id)

            if (testsError) throw testsError

            const testsCreated = tests?.length || 0
            const testsCompleted = tests?.filter(t => t.status === 'completed').length || 0
            const suspendedTests = tests?.filter(t => t.status === 'in_progress').length || 0

            // Calculate user's accuracy
            const userAccuracy = totalCorrect + totalIncorrect + totalOmitted > 0
                ? Math.round((totalCorrect / (totalCorrect + totalIncorrect + totalOmitted)) * 100)
                : 0

            // REAL PERCENTILE CALCULATION
            // Fetch all users' scores
            const { data: allUserScores, error: scoresError } = await supabase
                .rpc('get_all_user_scores')

            let percentileRank = 0
            let medianScore = 63 // fallback

            if (!scoresError && allUserScores && allUserScores.length > 0) {
                // Calculate percentile: what % of users have lower score than current user
                const lowerScores = allUserScores.filter(u => u.score < userAccuracy).length
                percentileRank = Math.floor((lowerScores / allUserScores.length) * 100)

                // Calculate median score
                const sortedScores = allUserScores.map(u => u.score).sort((a, b) => a - b)
                const midIndex = Math.floor(sortedScores.length / 2)
                medianScore = sortedScores[midIndex]
            } else {
                console.warn('Could not fetch user scores for percentile, using user accuracy as percentile')
                percentileRank = Math.min(userAccuracy, 99)
            }

            // REAL TIME CALCULATION
            // User's average time
            const { data: userTimes, error: userTimesError } = await supabase
                .from('user_progress')
                .select('time_spent_seconds')
                .eq('user_id', user.id)
                .not('time_spent_seconds', 'is', null)
                .gt('time_spent_seconds', 0)
                .lt('time_spent_seconds', 600) // Filter unrealistic times

            let avgTimeSpent = 0
            if (!userTimesError && userTimes && userTimes.length > 0) {
                const totalTime = userTimes.reduce((sum, t) => sum + t.time_spent_seconds, 0)
                avgTimeSpent = Math.floor(totalTime / userTimes.length)
            }

            // All users' average time
            const { data: timeStats, error: timeStatsError } = await supabase
                .rpc('get_time_statistics')

            let othersAvgTime = 73 // fallback
            if (!timeStatsError && timeStats && timeStats.length > 0) {
                othersAvgTime = Math.floor(timeStats[0].avg_time_all_users || 73)
            }

            setStats({
                totalCorrect,
                totalIncorrect,
                totalOmitted,
                usedQuestions,
                unusedQuestions: (totalQuestions || 0) - usedQuestions,
                totalQuestions: totalQuestions || 0,
                testsCreated,
                testsCompleted,
                suspendedTests,
                percentileRank,
                medianScore: Math.round(medianScore),
                avgTimeSpent,
                othersAvgTime
            })

        } catch (error) {
            console.error('Error fetching stats:', error)
        } finally {
            setLoading(false)
        }
    }

    const accuracy = stats.totalCorrect + stats.totalIncorrect + stats.totalOmitted > 0
        ? Math.round((stats.totalCorrect / (stats.totalCorrect + stats.totalIncorrect + stats.totalOmitted)) * 100)
        : 0

    const usagePercent = stats.totalQuestions > 0
        ? Math.round((stats.usedQuestions / stats.totalQuestions) * 100)
        : 0

    // Donut Chart Component
    const DonutChart = ({ percent, label, color = 'url(#gradient-primary)' }) => {
        const circumference = 2 * Math.PI * 15.9155
        const strokeDasharray = `${(percent / 100) * circumference} ${circumference}`

        return (
            <div style={{ position: 'relative', width: '180px', height: '180px' }}>
                <svg width="180" height="180" viewBox="0 0 36 36">
                    <defs>
                        <linearGradient id="gradient-primary" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#8b5cf6" />
                            <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                        <linearGradient id="gradient-usage" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#06b6d4" />
                            <stop offset="100%" stopColor="#14b8a6" />
                        </linearGradient>
                    </defs>
                    <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="3.5"
                    />
                    <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke={color}
                        strokeWidth="3.5"
                        strokeDasharray={strokeDasharray}
                        strokeLinecap="round"
                    />
                </svg>
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center'
                }}>
                    <div style={{
                        fontSize: '2.5rem',
                        fontWeight: '800',
                        background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        {percent}%
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500', marginTop: '0.25rem' }}>
                        {label}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="dashboard-layout">
            <Sidebar />

            <main className="dashboard-main">
                <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
                    {/* Header */}
                    <div style={{ marginBottom: '2rem' }}>
                        <h1 style={{
                            fontSize: '2rem',
                            fontWeight: '800',
                            background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            margin: 0
                        }}>
                            Estadísticas
                        </h1>
                        <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
                            Resumen completo de tu rendimiento
                        </p>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '4rem', color: '#9ca3af' }}>
                            Cargando estadísticas...
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '2rem' }}>
                            {/* Top Row - Performance & QBank */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '2rem' }}>
                                {/* Performance Card */}
                                <div style={{
                                    background: 'white',
                                    borderRadius: '20px',
                                    padding: '2rem',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                    border: '1px solid var(--color-gray-200)'
                                }}>
                                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                                        <DonutChart percent={accuracy} label="Correctas" />

                                        <div style={{ flex: 1 }}>
                                            <h3 style={{
                                                fontSize: '1.25rem',
                                                fontWeight: '700',
                                                color: '#374151',
                                                marginBottom: '1.5rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}>
                                                <TrendingUp size={24} color="#8b5cf6" />
                                                Tu Rendimiento
                                            </h3>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280' }}>
                                                        <CheckCircle size={16} color="#10b981" />
                                                        <span>Total Correctas</span>
                                                    </div>
                                                    <span style={{
                                                        background: '#d1fae5',
                                                        color: '#065f46',
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: '12px',
                                                        fontWeight: '700',
                                                        fontSize: '0.9rem'
                                                    }}>
                                                        {stats.totalCorrect}
                                                    </span>
                                                </div>

                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280' }}>
                                                        <XCircle size={16} color="#ef4444" />
                                                        <span>Total Incorrectas</span>
                                                    </div>
                                                    <span style={{
                                                        background: '#fee2e2',
                                                        color: '#991b1b',
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: '12px',
                                                        fontWeight: '700',
                                                        fontSize: '0.9rem'
                                                    }}>
                                                        {stats.totalIncorrect}
                                                    </span>
                                                </div>

                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280' }}>
                                                        <Circle size={16} color="#9ca3af" />
                                                        <span>Total Omitidas</span>
                                                    </div>
                                                    <span style={{
                                                        background: '#f3f4f6',
                                                        color: '#4b5563',
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: '12px',
                                                        fontWeight: '700',
                                                        fontSize: '0.9rem'
                                                    }}>
                                                        {stats.totalOmitted}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* QBank Usage Card */}
                                <div style={{
                                    background: 'white',
                                    borderRadius: '20px',
                                    padding: '2rem',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                    border: '1px solid var(--color-gray-200)'
                                }}>
                                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                                        <DonutChart percent={usagePercent} label="Usadas" color="url(#gradient-usage)" />

                                        <div style={{ flex: 1 }}>
                                            <h3 style={{
                                                fontSize: '1.25rem',
                                                fontWeight: '700',
                                                color: '#374151',
                                                marginBottom: '1.5rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}>
                                                <Target size={24} color="#06b6d4" />
                                                Uso del QBank
                                            </h3>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ color: '#6b7280' }}>Preguntas Usadas</span>
                                                    <span style={{
                                                        background: 'linear-gradient(135deg, #06b6d4, #14b8a6)',
                                                        color: 'white',
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: '12px',
                                                        fontWeight: '700',
                                                        fontSize: '0.9rem'
                                                    }}>
                                                        {stats.usedQuestions}
                                                    </span>
                                                </div>

                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ color: '#6b7280' }}>Preguntas Sin Usar</span>
                                                    <span style={{
                                                        background: '#f3f4f6',
                                                        color: '#4b5563',
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: '12px',
                                                        fontWeight: '700',
                                                        fontSize: '0.9rem'
                                                    }}>
                                                        {stats.unusedQuestions}
                                                    </span>
                                                </div>

                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ color: '#6b7280' }}>Total de Preguntas</span>
                                                    <span style={{
                                                        background: '#fef3c7',
                                                        color: '#92400e',
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: '12px',
                                                        fontWeight: '700',
                                                        fontSize: '0.9rem'
                                                    }}>
                                                        {stats.totalQuestions}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Row - Test Count & Percentile */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                                {/* Test Count Card */}
                                <div style={{
                                    background: 'white',
                                    borderRadius: '20px',
                                    padding: '2rem',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                    border: '1px solid var(--color-gray-200)'
                                }}>
                                    <h3 style={{
                                        fontSize: '1.25rem',
                                        fontWeight: '700',
                                        color: '#374151',
                                        marginBottom: '1.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        <Clock size={24} color="#f59e0b" />
                                        Contador de Exámenes
                                    </h3>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ color: '#6b7280' }}>Exámenes Creados</span>
                                            <span style={{
                                                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                                                color: 'white',
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '12px',
                                                fontWeight: '700',
                                                fontSize: '0.9rem',
                                                minWidth: '50px',
                                                textAlign: 'center'
                                            }}>
                                                {stats.testsCreated}
                                            </span>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ color: '#6b7280' }}>Exámenes Completados</span>
                                            <span style={{
                                                background: '#d1fae5',
                                                color: '#065f46',
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '12px',
                                                fontWeight: '700',
                                                fontSize: '0.9rem',
                                                minWidth: '50px',
                                                textAlign: 'center'
                                            }}>
                                                {stats.testsCompleted}
                                            </span>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ color: '#6b7280' }}>Exámenes Suspendidos</span>
                                            <span style={{
                                                background: '#fef3c7',
                                                color: '#92400e',
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '12px',
                                                fontWeight: '700',
                                                fontSize: '0.9rem',
                                                minWidth: '50px',
                                                textAlign: 'center'
                                            }}>
                                                {stats.suspendedTests}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Percentile Rank Card */}
                                <div style={{
                                    background: 'white',
                                    borderRadius: '20px',
                                    padding: '2rem',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                    border: '1px solid var(--color-gray-200)'
                                }}>
                                    <h3 style={{
                                        fontSize: '1.25rem',
                                        fontWeight: '700',
                                        color: '#374151',
                                        marginBottom: '1.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        <Award size={24} color="#f59e0b" />
                                        Ranking Percentil
                                    </h3>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <div style={{
                                                    width: '12px',
                                                    height: '12px',
                                                    borderRadius: '50%',
                                                    background: 'linear-gradient(135deg, #10b981, #059669)'
                                                }} />
                                                <span style={{ color: '#6b7280' }}>Tu Puntuación (Percentil {stats.percentileRank})</span>
                                            </div>
                                            <span style={{
                                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                                color: 'white',
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '12px',
                                                fontWeight: '700',
                                                fontSize: '0.9rem'
                                            }}>
                                                {accuracy}%
                                            </span>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <div style={{
                                                    width: '12px',
                                                    height: '12px',
                                                    borderRadius: '50%',
                                                    background: '#3b82f6'
                                                }} />
                                                <span style={{ color: '#6b7280' }}>Puntuación Mediana (Percentil 49)</span>
                                            </div>
                                            <span style={{
                                                background: '#dbeafe',
                                                color: '#1e40af',
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '12px',
                                                fontWeight: '700',
                                                fontSize: '0.9rem'
                                            }}>
                                                {stats.medianScore}%
                                            </span>
                                        </div>

                                        <div style={{ height: '1px', background: '#e5e7eb', margin: '0.5rem 0' }} />

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Tu Tiempo Promedio (seg)</span>
                                            <span style={{
                                                background: '#f3f4f6',
                                                color: '#374151',
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '12px',
                                                fontWeight: '600',
                                                fontSize: '0.85rem'
                                            }}>
                                                {stats.avgTimeSpent}
                                            </span>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Tiempo Promedio Otros (seg)</span>
                                            <span style={{
                                                background: '#f3f4f6',
                                                color: '#374151',
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '12px',
                                                fontWeight: '600',
                                                fontSize: '0.85rem'
                                            }}>
                                                {stats.othersAvgTime}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

export default Statistics
