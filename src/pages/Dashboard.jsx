import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Sidebar from '../components/Sidebar'
import '../styles/neumorphism.css'
import '../styles/dashboard.css'

const Dashboard = () => {
    const { user, loading: authLoading, signOut } = useAuth()
    const navigate = useNavigate()
    const [stats, setStats] = useState({
        totalAnswered: 0,
        correctAnswers: 0,
        streak: 0
    })
    const [loading, setLoading] = useState(true)
    const [showUserMenu, setShowUserMenu] = useState(false)

    useEffect(() => {
        if (authLoading) return

        if (!user) {
            navigate('/login')
            return
        }

        fetchUserStats()
    }, [user, authLoading, navigate])

    const fetchUserStats = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('user_progress')
                .select('*')
                .eq('user_id', user.id)

            if (error) throw error

            const total = data.length
            const correct = data.filter(q => q.is_correct).length
            // Calculate streak logic here or fetch from user_stats table if exists

            setStats({
                totalAnswered: total,
                correctAnswers: correct,
                streak: 0 // Placeholder
            })
        } catch (error) {
            console.error('Error fetching stats:', error)
        } finally {
            setLoading(false)
        }
    }

    const accuracy = stats.totalAnswered > 0
        ? Math.round((stats.correctAnswers / stats.totalAnswered) * 100)
        : 0

    // Mock data for display (mimicking the screenshot)
    const level = 1
    const xpCurrent = 0
    const xpMax = 100
    const rank = 0
    const eunacoins = 0
    const streak = "Compra una suscripción para comenzar" // Or mock number if active

    const userName = user?.user_metadata?.full_name || user?.email || 'Guest'

    const handleLogout = async () => {
        await signOut()
        navigate('/login')
    }

    return (
        <div className="dashboard-layout">
            <Sidebar />

            <main className="dashboard-main">
                <header className="dashboard__header">
                    <div className="header-user" style={{ position: 'relative' }}>
                        <div
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                        >
                            <img src={`https://ui-avatars.com/api/?name=${userName}&background=random`} alt="User" />
                            <span>{userName}</span>
                            <span>▼</span>
                        </div>

                        {showUserMenu && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                right: 0,
                                marginTop: '0.5rem',
                                background: 'white',
                                borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                minWidth: '180px',
                                zIndex: 1000
                            }}>
                                <button
                                    onClick={handleLogout}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        border: 'none',
                                        background: 'transparent',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        fontSize: '0.95rem',
                                        color: '#d32f2f',
                                        fontWeight: '500',
                                        borderRadius: '8px',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.target.style.background = '#ffebee'}
                                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                >
                                    🚪 Cerrar Sesión
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                <div className="dashboard-content">

                    {/* FULL WIDTH PROFILE CARD */}
                    <div className="profile-card">
                        <div className="profile-card-top">
                            <div className="profile-avatar-large">
                                <img
                                    src={`https://ui-avatars.com/api/?name=${userName}&background=0D8ABC&color=fff&size=128`}
                                    alt="Profile"
                                    style={{ width: '100%', height: '100%', borderRadius: '50%' }}
                                />
                                <div className="profile-avatar-badge">🔥</div>
                            </div>
                            <div className="profile-info">
                                <div className="profile-name">Estudiante</div>
                                <div className="profile-level">Nivel {level}</div>
                            </div>
                        </div>

                        <div className="xp-container">
                            <div className="xp-text">
                                <span>{xpMax} XP para subir de nivel</span>
                                <span>{xpCurrent}/{xpMax} XP</span>
                            </div>
                            <div className="xp-bar-container">
                                <div className="xp-bar-fill" style={{ width: `${(xpCurrent / xpMax) * 100}%` }}></div>
                            </div>
                        </div>
                    </div>

                    {/* STATS ROW WITH PERFORMANCE CHART */}
                    <div className="stats-row" style={{ gridTemplateColumns: '1fr 1.5fr 1fr', alignItems: 'stretch' }}>
                        {/* 1. Ranking */}
                        <div className="stat-card-new">
                            <div className="stat-card-title">Ranking Mensual</div>
                            <div className="stat-card-value">
                                <span className="stat-icon">🏆</span> {rank}
                            </div>
                        </div>

                        {/* 2. Performance Breakdown (Donut Chart) */}
                        <div className="stat-card-new" style={{ flexDirection: 'row', gap: '1.5rem', padding: '1rem' }}>
                            {/* Donut Chart SVG */}
                            <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                                <svg width="100" height="100" viewBox="0 0 36 36">
                                    <path
                                        d="M18 2.0845
                                        a 15.9155 15.9155 0 0 1 0 31.831
                                        a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="#eee"
                                        strokeWidth="3"
                                    />
                                    <path
                                        d="M18 2.0845
                                        a 15.9155 15.9155 0 0 1 0 31.831
                                        a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke={accuracy >= 50 ? "#66bb6a" : "#ef5350"}
                                        strokeWidth="3"
                                        strokeDasharray={`${accuracy}, 100`}
                                    />
                                </svg>
                                <div style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#333' }}>{accuracy}%</div>
                                    <div style={{ fontSize: '0.6rem', color: '#999' }}>Correctas</div>
                                </div>
                            </div>

                            {/* Stats List */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#333', marginBottom: '0.25rem' }}>Tu Puntaje</div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#777', borderBottom: '1px solid #f0f0f0', paddingBottom: '4px' }}>
                                    <span>Correctas</span>
                                    <span style={{ background: '#f0f0f0', padding: '1px 6px', borderRadius: '4px' }}>{stats.correctAnswers}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#777', borderBottom: '1px solid #f0f0f0', paddingBottom: '4px' }}>
                                    <span>Incorrectas</span>
                                    <span style={{ background: '#f0f0f0', padding: '1px 6px', borderRadius: '4px' }}>{stats.totalAnswered - stats.correctAnswers}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#777' }}>
                                    <span>Omitidas</span>
                                    <span style={{ background: '#f0f0f0', padding: '1px 6px', borderRadius: '4px' }}>0</span>
                                </div>
                            </div>
                        </div>

                        {/* 3. Streak */}
                        <div className="stat-card-new">
                            <div className="stat-card-title">Racha</div>
                            <div style={{ fontSize: '0.9rem', color: '#777', marginBottom: '0.5rem', textAlign: 'center' }}>
                                Compra una suscripción para comenzar la racha diaria
                            </div>
                            <button className="purchase-btn">Purchase</button>
                        </div>
                    </div>

                    {/* ACTIONS GRID */}
                    <div className="actions-grid-custom">
                        <Link to="/test" className="action-card-custom">
                            <span className="action-icon-custom">▶️</span>
                            <span className="action-label-custom">Continuar</span>
                        </Link>
                        <Link to="/history" className="action-card-custom">
                            <span className="action-icon-custom">❓</span>
                            <span className="action-label-custom">Pregunta aleatoria</span>
                        </Link>
                        <Link to="/test" className="action-card-custom">
                            <span className="action-icon-custom">📄</span>
                            <span className="action-label-custom">Crear Examen</span>
                        </Link>
                        <Link to="/reconstructions" className="action-card-custom">
                            <span className="action-icon-custom">🧩</span>
                            <span className="action-label-custom">Reconstrucciones</span>
                        </Link>
                        {/* Extra cards from screenshot logic */}
                        <Link to="/essays" className="action-card-custom">
                            <span className="action-icon-custom">✏️</span>
                            <span className="action-label-custom">Ensayos</span>
                        </Link>
                        <Link to="/review" className="action-card-custom">
                            <span className="action-icon-custom">↻</span>
                            <span className="action-label-custom">Repasar</span>
                        </Link>
                    </div>

                    {/* CHALLENGES / GRAPH PLACEHOLDER */}
                    <div>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontWeight: '700', color: '#333' }}>
                            <span style={{ color: '#4EBDDB' }}>🎯</span> Desafíos semanal
                        </h3>
                        <p style={{ color: '#777', marginLeft: '2rem' }}>Completa las tareas y gana puntos.</p>
                        {/* ... challenges list ... */}
                    </div>

                </div>
            </main>
        </div>
    )
}

export default Dashboard
