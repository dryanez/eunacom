import React, { useState, useEffect } from 'react'
import { PieChart, FileText, Target, Activity, CreditCard, RotateCcw, Flame } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { fetchProgress } from '../lib/api'
import { XP_PER_CORRECT, XP_PER_INCORRECT, calculateLevelUp, getXPForLevel, getLevelTitle, getLevelProgress } from '../utils/xpSystem'

const Dashboard = () => {
    const { user } = useAuth()
    
    const [stats, setStats] = useState({
        totalAnswered: 0,
        correctAnswers: 0,
        xp: 0,
        level: 1,
        streak: 0
    })

    useEffect(() => {
        if (user) {
            fetchStats()
        }
    }, [user])

    const fetchStats = async () => {
        try {
            const progressData = await fetchProgress(user.id)
            const total = progressData.length
            const correct = progressData.filter(p => p.is_correct).length
            const totalXP = (correct * XP_PER_CORRECT) + ((total - correct) * XP_PER_INCORRECT)
            const { newLevel, remainingXP } = calculateLevelUp(totalXP, 1)
            setStats({ totalAnswered: total, correctAnswers: correct, xp: remainingXP, totalXP, level: newLevel, streak: 0 })
        } catch (e) { console.error('Error fetching dashboard stats:', e) }
    }

    const accuracy = stats.totalAnswered > 0
        ? Math.round((stats.correctAnswers / stats.totalAnswered) * 100)
        : 0

    // Gamification calc
    const levelCapXP = getXPForLevel(stats.level + 1)
    const xpProgress = getLevelProgress(stats.xp, stats.level)
    const levelTitle = getLevelTitle(stats.level)
    
    return (
        <div style={{ paddingBottom: '2rem' }}>
            <h1 className="page__title">User Dashboard</h1>
            <p className="page__subtitle">Tu progreso general</p>

            <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', marginBottom: '2rem', background: 'var(--surface-700)' }}>
                <div style={{ flex: 1, marginRight: '2rem' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--primary-300)', fontWeight: 600, marginBottom: '0.25rem' }}>Nivel {stats.level} · {levelTitle}</div>
                    <div className="xp-labels">
                        <span>{Math.max(0, levelCapXP - stats.xp)} XP para subir de nivel</span>
                        <span>{stats.xp}/{levelCapXP} XP</span>
                    </div>
                    <div className="xp-bar">
                        <div className="xp-bar__fill" style={{ width: `${xpProgress}%` }}></div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '2rem', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
                    <Flame size={32} color={stats.streak > 0 ? "var(--accent-amber)" : "var(--surface-500)"} />
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--surface-400)', fontWeight: 600 }}>Racha</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{stats.streak} días</div>
                    </div>
                </div>
            </div>

            <div className="stats-grid" style={{ marginBottom: '2rem' }}>
                <div className="stat-card">
                    <div className="stat-card__label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <div style={{ padding: '0.5rem', background: 'var(--surface-600)', borderRadius: 'var(--radius)' }}>
                            <PieChart size={20} color="var(--primary-300)" />
                        </div>
                        Current Score
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem 0' }}>
                         <div className="donut-wrapper">
                            <svg viewBox="0 0 36 36" className="circular-chart">
                            <path className="circle-bg"
                                d="M18 2.0845
                                a 15.9155 15.9155 0 0 1 0 31.831
                                a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none" stroke="var(--surface-600)" strokeWidth="3"
                            />
                            <path className="circle"
                                strokeDasharray={`${accuracy}, 100`}
                                d="M18 2.0845
                                a 15.9155 15.9155 0 0 1 0 31.831
                                a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none" stroke="var(--primary-400)" strokeWidth="3" strokeLinecap="round"
                            />
                            </svg>
                            <div className="donut-center">
                                <div className="donut-value" style={{ fontSize: '1.2rem'}}>{accuracy}%</div>
                                <div className="donut-label">Correctas</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                     <div className="stat-card__label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <div style={{ padding: '0.5rem', background: 'var(--surface-600)', borderRadius: 'var(--radius)' }}>
                            <FileText size={20} color="var(--primary-300)" />
                        </div>
                        Questions Answered
                    </div>
                    <div style={{ padding: '1rem 0', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100px' }}>
                        <div className="stat-card__value">{stats.totalAnswered}</div>
                        <div className="stat-card__sub">Total</div>
                    </div>
                </div>

                <div className="stat-card">
                     <div className="stat-card__label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <div style={{ padding: '0.5rem', background: 'var(--surface-600)', borderRadius: 'var(--radius)' }}>
                            <Target size={20} color="var(--primary-300)" />
                        </div>
                        Daily Goal
                    </div>
                    <div style={{ padding: '1rem 0', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100px' }}>
                        <div className="stat-card__value" style={{ color: 'var(--surface-50)', WebkitTextFillColor: 'initial', background: 'none' }}>
                            0<span style={{ color: 'var(--surface-400)', fontSize: '1.5rem', fontWeight: 600 }}>/50</span>
                        </div>
                        <div className="stat-card__sub">Questions</div>
                    </div>
                </div>
            </div>

            <div className="action-grid">
                <a href="/test" className="action-card">
                    <div className="action-card__icon" style={{ background: 'rgba(19, 91, 236, 0.15)' }}>
                        <FileText size={24} color="var(--primary-400)" />
                    </div>
                    <div className="action-card__label">Exámenes</div>
                </a>
                
                <a href="/stats" className="action-card">
                    <div className="action-card__icon" style={{ background: 'rgba(19, 91, 236, 0.15)' }}>
                        <Activity size={24} color="var(--primary-400)" />
                    </div>
                    <div className="action-card__label">Estadísticas</div>
                </a>

                <a href="/flashcards" className="action-card">
                    <div className="action-card__icon" style={{ background: 'rgba(19, 91, 236, 0.15)' }}>
                        <CreditCard size={24} color="var(--primary-400)" />
                    </div>
                    <div className="action-card__label">Flashcards</div>
                </a>

                <a href="/review" className="action-card">
                    <div className="action-card__icon" style={{ background: 'rgba(19, 91, 236, 0.15)' }}>
                        <RotateCcw size={24} color="var(--primary-400)" />
                    </div>
                    <div className="action-card__label">Repasar Errores</div>
                </a>
            </div>
        </div>
    )
}

export default Dashboard
