import React, { useState, useEffect } from 'react'
import { ChevronDown, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import questionDB from '../data/questionDB.json'
const Stats = () => {
    const { user } = useAuth()
    const [barData, setBarData] = useState([])
    const [weaknesses, setWeaknesses] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user) fetchCategoryStats()
    }, [user])

    const fetchCategoryStats = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('user_progress')
                .select('*')
                .eq('user_id', user.id)

            if (error) throw error

            const categoryStats = {}
            
            // Generate lookup map for questions -> topics
            const qMap = {}
            questionDB.forEach(q => {
                qMap[q.id] = q.topic || q.category // fallback to category if topic undefined
            })

            data.forEach(p => {
                const topic = qMap[p.question_id]
                if (topic) {
                    if (!categoryStats[topic]) categoryStats[topic] = { total: 0, correct: 0 }
                    categoryStats[topic].total += 1
                    if (p.is_correct) categoryStats[topic].correct += 1
                }
            })

            const statsArray = Object.keys(categoryStats).map(topic => {
                const stat = categoryStats[topic]
                const percentage = Math.round((stat.correct / stat.total) * 100)
                let color = 'var(--primary-400)'
                if (percentage < 50) color = 'var(--accent-red)'
                else if (percentage < 75) color = 'var(--accent-amber)'
                else color = 'var(--accent-green)'

                return {
                    name: topic,
                    score: `${percentage}%`,
                    width: `${percentage}%`,
                    color,
                    percentage
                }
            }).sort((a,b) => b.percentage - a.percentage)

            setBarData(statsArray)

            // Calculate weaknesses (bottom 3 categories under 60%)
            const weakArray = [...statsArray]
                .sort((a,b) => a.percentage - b.percentage)
                .filter(a => a.percentage < 60)
                .slice(0, 3)

            setWeaknesses(weakArray)

        } catch (error) {
            console.error('Error fetching stats:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem' }}>
            <h1 className="page__title">Estadísticas Avanzadas</h1>
            <p className="page__subtitle">Seguimiento detallado de tu rendimiento</p>

            <div className="card" style={{ padding: 0, marginBottom: '1.5rem', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', background: 'rgba(255,255,255,0.03)' }}>
                    <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Rendimiento por Especialidad</h3>
                    <ChevronDown size={20} color="var(--surface-400)" />
                </div>
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {loading ? (
                        <div style={{color: 'var(--surface-400)', textAlign: 'center'}}>Cargando estadísticas...</div>
                    ) : barData.length === 0 ? (
                        <div style={{color: 'var(--surface-400)', textAlign: 'center'}}>No hay suficientes datos. Responde más preguntas.</div>
                    ) : (
                        barData.map(item => (
                            <div key={item.name} style={{ width: '100%', marginBottom: '0.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.85rem', color: 'var(--surface-300)' }}>
                                    <span>{item.name}</span>
                                    <span style={{ fontWeight: 'bold' }}>{item.score}</span>
                                </div>
                                <div style={{ width: '100%', background: 'var(--surface-600)', borderRadius: '4px', height: '12px', overflow: 'hidden' }}>
                                    <div style={{
                                        width: item.width,
                                        background: item.color,
                                        height: '100%',
                                        borderRadius: '4px',
                                        transition: 'width 1s ease-out'
                                    }} />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="card" style={{ padding: 0, marginBottom: '1.5rem', overflow: 'hidden' }}>
                 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', background: 'rgba(255,255,255,0.03)' }}>
                    <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Evolución de Puntaje</h3>
                    <ChevronDown size={20} color="var(--surface-400)" />
                </div>
                <div style={{ padding: '2rem 1.5rem' }}>
                    {/* SVG Line Chart Representation */}
                    <div style={{ position: 'relative', width: '100%', height: '200px' }}>
                        <svg viewBox="0 0 400 200" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                            {/* Grid lines */}
                            {[0, 1, 2, 3, 4].map(i => (
                                <line key={i} x1="0" y1={i * 40} x2="400" y2={i * 40} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                            ))}
                            {/* Area Gradient */}
                            <defs>
                                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="rgba(59, 130, 246, 0.3)" />
                                    <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
                                </linearGradient>
                            </defs>
                            <path d="M 0 160 Q 50 120 100 140 T 200 110 T 300 130 T 400 40 L 400 200 L 0 200 Z" fill="url(#areaGradient)" />
                            {/* Line */}
                            <path d="M 0 160 Q 50 120 100 140 T 200 110 T 300 130 T 400 40" fill="none" stroke="var(--primary-400)" strokeWidth="3" />
                            <path d="M 0 180 Q 50 140 100 160 T 200 130 T 300 150 T 400 60" fill="none" stroke="var(--primary-600)" strokeWidth="2" />
                            {/* Data Points */}
                            <circle cx="0" cy="160" r="4" fill="var(--primary-400)" />
                            <circle cx="100" cy="140" r="4" fill="var(--primary-400)" />
                            <circle cx="200" cy="110" r="4" fill="var(--primary-400)" />
                            <circle cx="300" cy="130" r="4" fill="var(--primary-400)" />
                            <circle cx="400" cy="40" r="4" fill="var(--primary-400)" />
                        </svg>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', color: 'var(--surface-400)', fontSize: '0.8rem' }}>
                            <span>Ene</span><span>Feb</span><span>Mar</span><span>Abr</span><span>May</span><span>Jun</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card" style={{ padding: 0, marginBottom: '1.5rem', overflow: 'hidden' }}>
                 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', background: 'rgba(255,255,255,0.03)' }}>
                    <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Puntos Débiles</h3>
                    <ChevronDown size={20} color="var(--surface-400)" />
                </div>
                <div style={{ padding: '0.5rem 1.5rem 1.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {weaknesses.map(item => (
                        <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ borderBottom: '2px solid var(--accent-red)', paddingBottom: '0.2rem' }}>
                                <span style={{ fontWeight: 500, color: 'var(--surface-200)' }}>{item.name} </span>
                                <span style={{ color: 'var(--accent-red)', fontWeight: 600 }}>({item.score})</span>
                            </div>
                            <AlertCircle size={20} color="var(--accent-red)" fill="rgba(239, 68, 68, 0.2)" />
                        </div>
                    ))}
                </div>
            </div>

        </div>
    )
}

export default Stats
