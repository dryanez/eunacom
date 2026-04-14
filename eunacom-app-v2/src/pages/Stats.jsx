import React, { useState, useEffect, useMemo } from 'react'
import { ChevronDown, AlertCircle, TrendingUp } from 'lucide-react'
import { fetchProgress, fetchTests } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { getQuestionDB } from '../lib/questionDB'

const Stats = () => {
    const { user } = useAuth()
    const [progressData, setProgressData] = useState([])
    const [testHistory, setTestHistory] = useState([])
    const [loading, setLoading] = useState(true)
    const [questionDB, setQuestionDB] = useState([])

    useEffect(() => {
        if (user) loadAll()
    }, [user])

    const loadAll = async () => {
        setLoading(true)
        try {
            const [progress, tests, db] = await Promise.all([
                fetchProgress(user.id),
                fetchTests(user.id),
                getQuestionDB()
            ])
            setQuestionDB(db)
            setProgressData(progress || [])
            setTestHistory((tests || []).filter(t => t.status === 'completed').sort((a, b) => new Date(a.created_at) - new Date(b.created_at)))
        } catch (error) {
            console.error('Error fetching stats:', error)
        } finally {
            setLoading(false)
        }
    }

    // ── Per-specialty bar data ──────────────────────────────────────
    const { barData, weaknesses } = useMemo(() => {
        const qMap = {}
        questionDB.forEach(q => { qMap[q.id] = q.category || 'General' })

        const catStats = {}
        progressData.forEach(p => {
            const cat = qMap[p.question_id]
            if (!cat) return
            if (!catStats[cat]) catStats[cat] = { total: 0, correct: 0 }
            catStats[cat].total++
            if (p.is_correct) catStats[cat].correct++
        })

        const arr = Object.entries(catStats).map(([name, s]) => {
            const pct = Math.round((s.correct / s.total) * 100)
            return {
                name,
                score: `${pct}%`,
                width: `${pct}%`,
                color: pct < 50 ? 'var(--accent-red)' : pct < 75 ? 'var(--accent-amber)' : 'var(--accent-green)',
                percentage: pct,
                total: s.total,
                correct: s.correct,
            }
        }).sort((a, b) => b.percentage - a.percentage)

        const weak = [...arr].sort((a, b) => a.percentage - b.percentage).filter(a => a.percentage < 60).slice(0, 3)
        return { barData: arr, weaknesses: weak }
    }, [progressData])

    // ── Real score evolution from completed tests ───────────────────
    const chartPoints = useMemo(() => {
        if (testHistory.length === 0) return []
        const last10 = testHistory.slice(-10)
        return last10.map((t, i) => ({
            x: Math.round((i / Math.max(last10.length - 1, 1)) * 380) + 10,
            y: Math.round((1 - (t.score || 0) / 100) * 160) + 20,
            score: t.score || 0,
            date: new Date(t.created_at).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })
        }))
    }, [testHistory])

    const polyline = chartPoints.map(p => `${p.x},${p.y}`).join(' ')
    const area = chartPoints.length > 0
        ? `M ${chartPoints[0].x},${chartPoints[0].y} ` +
          chartPoints.slice(1).map(p => `L ${p.x},${p.y}`).join(' ') +
          ` L ${chartPoints[chartPoints.length - 1].x},200 L ${chartPoints[0].x},200 Z`
        : ''

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem' }}>
            <h1 className="page__title">Estadísticas Avanzadas</h1>
            <p className="page__subtitle">Seguimiento detallado de tu rendimiento</p>

            {/* ── Rendimiento por Especialidad ── */}
            <div className="card" style={{ padding: 0, marginBottom: '1.5rem', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', background: 'rgba(255,255,255,0.03)' }}>
                    <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Rendimiento por Especialidad</h3>
                    <ChevronDown size={20} color="var(--surface-400)" />
                </div>
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {loading ? (
                        <div style={{ color: 'var(--surface-400)', textAlign: 'center' }}>Cargando estadísticas...</div>
                    ) : barData.length === 0 ? (
                        <div style={{ color: 'var(--surface-400)', textAlign: 'center' }}>No hay suficientes datos. Responde más preguntas.</div>
                    ) : barData.map(item => (
                        <div key={item.name} style={{ width: '100%', marginBottom: '0.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.85rem', color: 'var(--surface-300)' }}>
                                <span>{item.name}</span>
                                <span style={{ color: 'var(--surface-400)', fontSize: '0.78rem' }}>
                                    {item.correct}/{item.total} &nbsp;
                                    <strong style={{ color: item.color }}>{item.score}</strong>
                                </span>
                            </div>
                            <div style={{ width: '100%', background: 'var(--surface-600)', borderRadius: '4px', height: '10px', overflow: 'hidden' }}>
                                <div style={{ width: item.width, background: item.color, height: '100%', borderRadius: '4px', transition: 'width 1s ease-out' }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Evolución de Puntaje (real data) ── */}
            <div className="card" style={{ padding: 0, marginBottom: '1.5rem', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', background: 'rgba(255,255,255,0.03)' }}>
                    <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Evolución de Puntaje</h3>
                    <TrendingUp size={20} color="var(--surface-400)" />
                </div>
                <div style={{ padding: '1.5rem' }}>
                    {loading ? (
                        <div style={{ color: 'var(--surface-400)', textAlign: 'center' }}>Cargando...</div>
                    ) : chartPoints.length < 2 ? (
                        <div style={{ color: 'var(--surface-400)', textAlign: 'center', padding: '2rem 0' }}>
                            Completa al menos 2 exámenes para ver tu evolución.
                        </div>
                    ) : (
                        <div style={{ position: 'relative', width: '100%', height: '200px' }}>
                            <svg viewBox="0 0 400 200" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                                <defs>
                                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="rgba(59,130,246,0.35)" />
                                        <stop offset="100%" stopColor="rgba(59,130,246,0)" />
                                    </linearGradient>
                                </defs>
                                {[0, 25, 50, 75, 100].map((pct, i) => {
                                    const y = Math.round((1 - pct / 100) * 160) + 20
                                    return (
                                        <g key={i}>
                                            <line x1="0" y1={y} x2="400" y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                                            <text x="2" y={y - 3} fill="rgba(255,255,255,0.25)" fontSize="9">{pct}%</text>
                                        </g>
                                    )
                                })}
                                {area && <path d={area} fill="url(#areaGradient)" />}
                                {polyline && <polyline points={polyline} fill="none" stroke="var(--primary-400)" strokeWidth="2.5" strokeLinejoin="round" />}
                                {chartPoints.map((p, i) => (
                                    <g key={i}>
                                        <circle cx={p.x} cy={p.y} r="4" fill="var(--primary-400)" stroke="var(--surface-900)" strokeWidth="2" />
                                        <title>{p.date}: {p.score}%</title>
                                    </g>
                                ))}
                            </svg>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', paddingLeft: '2%', paddingRight: '2%' }}>
                                {chartPoints.map((p, i) => (
                                    <span key={i} style={{ fontSize: '0.7rem', color: 'var(--surface-400)', textAlign: 'center', flex: 1 }}>{p.date}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Puntos Débiles ── */}
            <div className="card" style={{ padding: 0, marginBottom: '1.5rem', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', background: 'rgba(255,255,255,0.03)' }}>
                    <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Puntos Débiles</h3>
                    <ChevronDown size={20} color="var(--surface-400)" />
                </div>
                <div style={{ padding: '0.5rem 1.5rem 1.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {loading ? null : weaknesses.length === 0 ? (
                        <div style={{ color: 'var(--surface-400)', textAlign: 'center', padding: '1rem 0' }}>
                            ¡Sin puntos débiles por ahora! Sigue practicando.
                        </div>
                    ) : weaknesses.map(item => (
                        <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <div>
                                <span style={{ fontWeight: 500, color: 'var(--surface-200)' }}>{item.name} </span>
                                <span style={{ color: 'var(--accent-red)', fontWeight: 600 }}>({item.score})</span>
                                <div style={{ fontSize: '0.78rem', color: 'var(--surface-400)', marginTop: '0.2rem' }}>
                                    {item.correct} correctas de {item.total} respondidas
                                </div>
                            </div>
                            <AlertCircle size={20} color="var(--accent-red)" fill="rgba(239,68,68,0.2)" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Stats