import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Sidebar from '../components/Sidebar'
import { getAvatar, getAvatarUrl } from '../config/avatars'
import { getLevelTitle, getXPForLevel, getLevelProgress, formatXP } from '../utils/xpSystem'
import {
    Play,
    HelpCircle,
    FileText,
    Puzzle,
    PenTool,
    RotateCcw,
    Trophy,
    Flame,
    ChevronDown,
    Target,
    TrendingUp
} from 'lucide-react'
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
    const [profile, setProfile] = useState({
        level: 1,
        xp: 0,
        avatar_id: 'house',
        display_name: ''
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
            // Fetch user progress
            const { data, error } = await supabase
                .from('user_progress')
                .select('*')
                .eq('user_id', user.id)

            if (error) throw error

            const total = data.length
            const correct = data.filter(q => q.is_correct).length

            setStats({
                totalAnswered: total,
                correctAnswers: correct,
                streak: 0
            })

            // Fetch user profile for gamification data
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('level, xp, avatar_id, display_name')
                .eq('user_id', user.id)
                .single()

            if (!profileError && profileData) {
                setProfile(profileData)
            }
        } catch (error) {
            console.error('Error fetching stats:', error)
        } finally {
            setLoading(false)
        }
    }

    const accuracy = stats.totalAnswered > 0
        ? Math.round((stats.correctAnswers / stats.totalAnswered) * 100)
        : 0

    // Gamification data from profile
    const levelTitle = getLevelTitle(profile.level)
    const xpForNextLevel = getXPForLevel(profile.level + 1)
    const levelProgress = getLevelProgress(profile.xp, profile.level)
    const avatar = getAvatar(profile.avatar_id)

    const userName = profile.display_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Guest'

    const handleLogout = async () => {
        await signOut()
        navigate('/login')
    }

    const actionCards = [
        {
            path: '/test',
            icon: Play,
            label: 'Continuar',
            gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
        },
        {
            path: '/history',
            icon: HelpCircle,
            label: 'Pregunta aleatoria',
            gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)'
        },
        {
            path: '/test',
            icon: FileText,
            label: 'Crear Examen',
            gradient: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)'
        },
        {
            path: '/reconstructions',
            icon: Puzzle,
            label: 'Reconstrucciones',
            gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
        },
        {
            path: '/essays',
            icon: PenTool,
            label: 'Ensayos',
            gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)'
        },
        {
            path: '/review',
            icon: RotateCcw,
            label: 'Repasar',
            gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
        },
    ]

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
                            <img
                                src={getAvatarUrl(profile.avatar_id)}
                                alt={userName}
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    border: '2px solid rgba(139, 92, 246, 0.3)'
                                }}
                            />
                            <span>{userName}</span>
                            <ChevronDown size={16} />
                        </div>

                        {showUserMenu && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                right: 0,
                                marginTop: '0.5rem',
                                background: 'white',
                                borderRadius: '12px',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                                minWidth: '200px',
                                zIndex: 1000,
                                overflow: 'hidden'
                            }}>
                                <button
                                    onClick={handleLogout}
                                    style={{
                                        width: '100%',
                                        padding: '0.875rem 1.25rem',
                                        border: 'none',
                                        background: 'transparent',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        fontSize: '0.95rem',
                                        color: '#ef4444',
                                        fontWeight: '600',
                                        transition: 'background 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                    onMouseEnter={(e) => e.target.style.background = '#fef2f2'}
                                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                >
                                    🚪 Cerrar Sesión
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                <div className="dashboard-content">
                    {/* PROFILE CARD */}
                    <div className="profile-card">
                        <div className="profile-card-top">
                            <div className="profile-avatar-large">
                                <img
                                    src={getAvatarUrl(profile.avatar_id)}
                                    alt={avatar.name}
                                    title={`${avatar.name} (${avatar.show})`}
                                    style={{ width: '100%', height: '100%', borderRadius: '50%' }}
                                />
                                <div className="profile-avatar-badge">
                                    <Trophy size={20} color="#f59e0b" />
                                </div>
                            </div>
                            <div className="profile-info">
                                <div className="profile-name">{userName}</div>
                                <div className="profile-level">
                                    {levelTitle} - Nivel {profile.level}
                                </div>
                            </div>
                        </div>

                        <div className="xp-container">
                            <div className="xp-text">
                                <span>{formatXP(xpForNextLevel - profile.xp)} XP para subir de nivel</span>
                                <span>{formatXP(profile.xp)}/{formatXP(xpForNextLevel)} XP</span>
                            </div>
                            <div className="xp-bar-container">
                                <div className="xp-bar-fill" style={{ width: `${levelProgress}%` }}></div>
                            </div>
                        </div>
                    </div>

                    {/* STATS ROW */}
                    <div className="stats-row">
                        {/* Ranking */}
                        <div className="stat-card-new">
                            <div className="stat-card-title">Tu Nivel</div>
                            <div className="stat-card-value">
                                <Trophy className="stat-icon" size={40} color="#f59e0b" />
                                {profile.level}
                            </div>
                        </div>

                        {/* Performance Breakdown */}
                        <div className="stat-card-new" style={{ flexDirection: 'row', gap: '1.5rem', padding: '2rem' }}>
                            {/* Donut Chart */}
                            <div style={{ position: 'relative', width: '120px', height: '120px', flexShrink: 0 }}>
                                <svg width="120" height="120" viewBox="0 0 36 36">
                                    <path
                                        d="M18 2.0845
                                        a 15.9155 15.9155 0 0 1 0 31.831
                                        a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="#e5e7eb"
                                        strokeWidth="3"
                                    />
                                    <path
                                        d="M18 2.0845
                                        a 15.9155 15.9155 0 0 1 0 31.831
                                        a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="url(#gradient)"
                                        strokeWidth="3"
                                        strokeDasharray={`${accuracy}, 100`}
                                    />
                                    <defs>
                                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#8b5cf6" />
                                            <stop offset="100%" stopColor="#06b6d4" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    textAlign: 'center'
                                }}>
                                    <div style={{
                                        fontSize: '1.75rem',
                                        fontWeight: 'bold',
                                        background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent'
                                    }}>
                                        {accuracy}%
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 600 }}>Correctas</div>
                                </div>
                            </div>

                            {/* Stats List */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                                <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#374151', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <TrendingUp size={20} color="#8b5cf6" />
                                    Tu Puntaje
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#6b7280', borderBottom: '1px solid #f3f4f6', paddingBottom: '0.5rem' }}>
                                    <span style={{ fontWeight: 500 }}>Correctas</span>
                                    <span style={{
                                        background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                                        color: 'white',
                                        padding: '2px 10px',
                                        borderRadius: '6px',
                                        fontWeight: 700,
                                        fontSize: '0.8rem'
                                    }}>
                                        {stats.correctAnswers}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#6b7280', borderBottom: '1px solid #f3f4f6', paddingBottom: '0.5rem' }}>
                                    <span style={{ fontWeight: 500 }}>Incorrectas</span>
                                    <span style={{
                                        background: '#fef2f2',
                                        color: '#ef4444',
                                        padding: '2px 10px',
                                        borderRadius: '6px',
                                        fontWeight: 700,
                                        fontSize: '0.8rem'
                                    }}>
                                        {stats.totalAnswered - stats.correctAnswers}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#6b7280' }}>
                                    <span style={{ fontWeight: 500 }}>Omitidas</span>
                                    <span style={{
                                        background: '#f3f4f6',
                                        color: '#6b7280',
                                        padding: '2px 10px',
                                        borderRadius: '6px',
                                        fontWeight: 700,
                                        fontSize: '0.8rem'
                                    }}>
                                        0
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Streak */}
                        <div className="stat-card-new">
                            <div className="stat-card-title">Racha</div>
                            <div style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '1rem', textAlign: 'center', lineHeight: 1.5 }}>
                                Compra una suscripción para comenzar la racha diaria
                            </div>
                            <button className="purchase-btn">Purchase</button>
                        </div>
                    </div>

                    {/* ACTIONS GRID */}
                    <div className="actions-grid-custom">
                        {actionCards.map((card) => {
                            const Icon = card.icon
                            return (
                                <Link key={card.path + card.label} to={card.path} className="action-card-custom">
                                    <span className="action-icon-custom">
                                        <Icon size={48} strokeWidth={1.5} style={{
                                            color: 'transparent',
                                            stroke: 'url(#icon-gradient-' + card.label + ')'
                                        }} />
                                        <svg width="0" height="0">
                                            <defs>
                                                <linearGradient id={'icon-gradient-' + card.label} x1="0%" y1="0%" x2="100%" y2="100%">
                                                    <stop offset="0%" stopColor="#8b5cf6" />
                                                    <stop offset="100%" stopColor="#06b6d4" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                    </span>
                                    <span className="action-label-custom">{card.label}</span>
                                </Link>
                            )
                        })}
                    </div>

                    {/* CHALLENGES SECTION */}
                    <div style={{ marginTop: '2rem' }}>
                        <h3 style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            fontSize: '1.5rem',
                            fontWeight: '800',
                            color: '#1f2937',
                            marginBottom: '1rem'
                        }}>
                            <Target size={28} style={{ color: '#8b5cf6' }} />
                            <span className="gradient-text">Desafíos semanal</span>
                        </h3>
                        <p style={{ color: '#6b7280', marginLeft: '2.5rem', fontSize: '0.95rem' }}>
                            Completa las tareas y gana puntos.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default Dashboard
