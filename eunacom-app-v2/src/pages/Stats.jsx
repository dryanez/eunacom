import React, { useState, useEffect, useMemo } from 'react'
import { BarChart3, AlertCircle, TrendingUp } from 'lucide-react'
import { fetchProgress, fetchTests } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { getQuestionDB } from '../lib/questionDB'
import '../components/redesign/midnight.css'
import '../components/redesign/stats-history.css'

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
        questionDB.forEach(q => { qMap[q.id] = q.topic || 'General' })

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

        const weak = [...arr].sort((a, b) => a.percentage - b.percentage).filter(a => a.percentage < 60).slice(0, 10)
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
          ` L ${chartPoints[chartPoints.length - 1].x},180 L ${chartPoints[0].x},180 Z`
        : ''

    const totalAnswered = progressData.length
    const totalCorrect = progressData.filter(p => p.is_correct).length
    const overallPct = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0
    const fmt = n => (n || 0).toLocaleString('es-CL')
    const tone = pct => pct < 50 ? 'red' : pct < 75 ? 'amber' : 'green'
    const toneText = { red: 'sh-bad', amber: 'sh-mid', green: 'sh-good' }

    return (
        <section className="sh-page">
            <h1 className="mn-h1">Estadísticas</h1>
            <p className="mn-sub">{loading ? 'Seguimiento detallado de tu rendimiento' : `${fmt(totalAnswered)} preguntas respondidas`}</p>

            <div className="mn-stats sh-3">
                <div className="mn-stat"><b className="mn-blue">{loading ? '–' : `${overallPct}%`}</b><span>Correctas</span></div>
                <div className="mn-stat"><b>{loading ? '–' : fmt(totalAnswered)}</b><span>Respondidas</span></div>
                <div className="mn-stat"><b>{loading ? '–' : fmt(testHistory.length)}</b><span>Completados</span></div>
            </div>

            {/* ── Rendimiento por especialidad ── */}
            <div className="mn-card">
                <div className="sh-head"><h2>Por especialidad</h2><BarChart3 size={18} /></div>
                {loading ? (
                    <div className="sh-empty">Cargando estadísticas...</div>
                ) : barData.length === 0 ? (
                    <div className="sh-empty">No hay suficientes datos. Responde más preguntas.</div>
                ) : barData.map(item => {
                    const t = tone(item.percentage)
                    return (
                        <div key={item.name} className="sh-spec">
                            <div className="sh-spec-top">
                                <span>{item.name}</span>
                                <small>{item.correct}/{item.total}</small>
                                <b className={toneText[t]}>{item.score}</b>
                            </div>
                            <span className={`mn-bar${t === 'green' ? '' : ` sh-bar-${t}`}`}><b style={{ width: `${Math.max(2, item.percentage)}%`, transition: 'width 1s ease-out' }} /></span>
                        </div>
                    )
                })}
            </div>

            {/* ── Evolución de puntaje (datos reales) ── */}
            <div className="mn-card">
                <div className="sh-head"><h2>Evolución de puntaje</h2><TrendingUp size={18} /></div>
                <p className="mn-sub">Tus últimos {Math.min(10, testHistory.length) || ''} exámenes completados</p>
                {loading ? (
                    <div className="sh-empty">Cargando...</div>
                ) : chartPoints.length < 2 ? (
                    <div className="sh-empty">Completa al menos 2 exámenes para ver tu evolución.</div>
                ) : (
                    <div className="sh-chart">
                        <svg viewBox="0 0 400 240">
                            <defs>
                                <linearGradient id="shAreaGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="rgba(56,189,248,0.32)" />
                                    <stop offset="100%" stopColor="rgba(37,99,235,0)" />
                                </linearGradient>
                            </defs>
                            {[0, 25, 50, 75, 100].map((pct, i) => {
                                const y = Math.round((1 - pct / 100) * 160) + 20
                                return (
                                    <g key={i}>
                                        <line x1="0" y1={y} x2="400" y2={y} stroke="#1e2a44" strokeWidth="1" />
                                        <text x="2" y={y - 3} fill="#64748b" fontSize="10" fontWeight="500">{pct}%</text>
                                    </g>
                                )
                            })}
                            {area && <path d={area} fill="url(#shAreaGradient)" />}
                            {polyline && <polyline points={polyline} fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />}
                            {chartPoints.map((p, i) => (
                                <g key={i}>
                                    <circle cx={p.x} cy={p.y} r="4.5" fill="#38bdf8" stroke="#0b1120" strokeWidth="2.5" />
                                    <title>{p.date}: {p.score}%</title>
                                    <text x={p.x} y={200} fill="#64748b" fontSize="11" textAnchor="end" transform={`rotate(-45, ${p.x}, 200)`}>
                                        {p.date}
                                    </text>
                                </g>
                            ))}
                        </svg>
                    </div>
                )}
            </div>

            {/* ── Puntos débiles ── */}
            <div className="mn-card">
                <div className="sh-head"><h2>Puntos débiles</h2><AlertCircle size={18} /></div>
                <p className="mn-sub">Temas bajo 60% de acierto</p>
                {loading ? null : weaknesses.length === 0 ? (
                    <div className="sh-empty">Sin puntos débiles por ahora. Sigue practicando.</div>
                ) : (
                    <div className="mn-list" style={{ padding: 0, marginTop: '.3rem' }}>
                        {weaknesses.map(item => (
                            <div key={item.name} className="mn-li sh-static">
                                <span className="sh-weak-ic"><AlertCircle size={17} /></span>
                                <span className="mn-li-txt">{item.name}<small>{item.correct} correctas de {item.total} respondidas</small></span>
                                <span className="sh-score sh-bad">{item.score}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}

export default Stats
