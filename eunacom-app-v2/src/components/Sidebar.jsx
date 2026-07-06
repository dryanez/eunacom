import React, { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useSubscription } from '../contexts/SubscriptionContext'
import { fetchProgress, fetchUserProfile } from '../lib/api'
import { XP_PER_CORRECT, XP_PER_INCORRECT, calculateLevelUp, getLevelTitle } from '../utils/xpSystem'
import {
    Home, CalendarDays, FileText, Stethoscope, Target,
    Clock, BarChart3, CreditCard, RotateCcw, Settings,
    LogOut, LogIn, ChevronDown, Menu, X, Video, Shield, Users, Flame, Eye, EyeOff
} from 'lucide-react'

const Sidebar = ({ mobileOpen, onToggle }) => {
    const { signOut, user, isAdmin, isRealAdmin, adminPreviewMode, toggleAdminPreview } = useAuth()
    const { isPremium, usageStats } = useSubscription()
    const navigate = useNavigate()
    const [examenesOpen, setExamenesOpen] = useState(false)
    const [userLevel, setUserLevel] = useState(1)
    const [displayName, setDisplayName] = useState(null)

    useEffect(() => {
        if (!user) return
        fetchProgress(user.id).then(data => {
            const correct = data.filter(p => p.is_correct).length
            const totalXP = (correct * XP_PER_CORRECT) + ((data.length - correct) * XP_PER_INCORRECT)
            const { newLevel } = calculateLevelUp(totalXP, 1)
            setUserLevel(newLevel)
        }).catch(() => {})
        fetchUserProfile(user.id).then(profile => {
            if (profile?.first_name) {
                setDisplayName(`${profile.first_name} ${profile.last_name || ''}`.trim())
            }
        }).catch(() => {})
    }, [user])

    const handleLogout = async () => {
        await signOut()
        navigate('/login')
    }

    return (
        <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
            <div className="sidebar__brand">
                <img src="/logo.png" alt="Eunacom-Examen" />
                <span className="sidebar__brand-name">Eunacom-Examen</span>
            </div>

            <nav className="sidebar__nav">
                <NavLink to="/dashboard" data-tour="dashboard" className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} onClick={onToggle}>
                    <Home size={18} /> Inicio
                </NavLink>
                {isAdmin() && (
                    <NavLink to="/study-plan" data-tour="study-plan" className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} onClick={onToggle}>
                        <CalendarDays size={18} /> Plan de Estudio
                    </NavLink>
                )}

                <div className="sidebar__section-title">Aprendizaje</div>
                <NavLink to="/mis-clases" data-tour="mis-clases" className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} onClick={onToggle}>
                    <Video size={18} /> Mis Clases
                </NavLink>
                {isAdmin() && (
                    <NavLink to="/biblioteca" className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} onClick={onToggle}>
                        <Shield size={18} /> Biblioteca EUNACOM
                    </NavLink>
                )}
                {isAdmin() && (
                    <NavLink to="/study-guides" className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} onClick={onToggle} style={{ color: '#f97316' }}>
                        <Flame size={18} /> Study Guides High Yield!
                    </NavLink>
                )}

                <div className="sidebar__section-title">Exámenes</div>
                <div
                    className="sidebar__link"
                    onClick={() => setExamenesOpen(!examenesOpen)}
                    style={{ cursor: 'pointer', justifyContent: 'space-between' }}
                >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <FileText size={18} /> Exámenes
                    </span>
                    <ChevronDown size={14} style={{ transform: examenesOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
                </div>
                {examenesOpen && (
                    <div style={{ paddingLeft: '1rem' }}>
                        <NavLink to="/test" data-tour="test" className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} onClick={onToggle}>
                            <FileText size={16} /> Crear Examen
                        </NavLink>
                        <NavLink to="/reconstructions" className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} onClick={onToggle}>
                            <Stethoscope size={16} /> Reconstrucciones
                        </NavLink>
                        <NavLink to="/simulation" className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} onClick={onToggle}>
                            <Target size={16} /> Simulación
                        </NavLink>
                    </div>
                )}

                <NavLink to="/history" className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} onClick={onToggle}>
                    <Clock size={18} /> Historial de Exámenes
                </NavLink>
                <NavLink to="/stats" data-tour="stats" className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} onClick={onToggle}>
                    <BarChart3 size={18} /> Estadísticas
                </NavLink>
                {isAdmin() && (
                    <NavLink to="/flashcards" className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} onClick={onToggle}>
                        <CreditCard size={18} /> Flashcards
                    </NavLink>
                )}
                <NavLink to="/review" className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} onClick={onToggle}>
                    <RotateCcw size={18} /> Repasar Errores
                </NavLink>
            </nav>

            <div className="sidebar__footer">
                {!isPremium && user && (
                    <div style={{ marginBottom: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--surface-300)', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                            <span>Preguntas Gratis</span>
                            <span>{Math.min(usageStats?.customQuestionsAnswered || 0, 100)}/100</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: 'var(--surface-600)', borderRadius: '4px', overflow: 'hidden', marginBottom: '1rem' }}>
                            <div style={{ 
                                height: '100%', 
                                width: `${Math.min(((usageStats?.customQuestionsAnswered || 0) / 100) * 100, 100)}%`, 
                                background: (usageStats?.customQuestionsAnswered || 0) >= 100 ? '#ef4444' : '#10b981',
                                transition: 'width 0.3s ease-in-out'
                            }} />
                        </div>
                        <NavLink to="/oferta" style={{ 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                            background: '#2563eb', color: '#fff', padding: '0.6rem', borderRadius: '8px', 
                            fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none', transition: 'background 0.2s'
                        }} onClick={onToggle}>
                            <Flame size={14} /> ¡Pasar a Premium!
                        </NavLink>
                    </div>
                )}
                {user ? (
                    <>
                        {isAdmin() && (
                            <>
                                <div className="sidebar__section-title" style={{ marginTop: 0 }}>Admin</div>
                                <NavLink to="/admin/users" className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} onClick={onToggle}>
                                    <Users size={18} /> Usuarios
                                </NavLink>
                            </>
                        )}
                        <div className="sidebar__user">
                            <div className="sidebar__avatar">
                                {(displayName || user.email || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div className="sidebar__user-name">{displayName || user.email?.split('@')[0] || 'Usuario'}</div>
                                <div className="sidebar__user-level">Nivel {userLevel} · {getLevelTitle(userLevel)}</div>
                            </div>
                        </div>
                        {isRealAdmin && isRealAdmin() && (
                            <button 
                                onClick={toggleAdminPreview} 
                                className="sidebar__logout" 
                                style={{ 
                                    marginBottom: '0.5rem',
                                    color: adminPreviewMode ? '#f59e0b' : 'inherit'
                                }}
                            >
                                {adminPreviewMode ? <EyeOff size={16} /> : <Eye size={16} />}
                                {adminPreviewMode ? 'Salir de Vista Usuario' : 'Ver como Usuario'}
                            </button>
                        )}
                        <button onClick={handleLogout} className="sidebar__logout">
                            <LogOut size={16} /> Cerrar Sesión
                        </button>
                    </>
                ) : (
                    <NavLink to="/login" className="sidebar__logout" style={{ textDecoration: 'none', justifyContent: 'center' }} onClick={onToggle}>
                        <LogIn size={16} /> Iniciar Sesión
                    </NavLink>
                )}
            </div>
        </aside>
    )
}

export default Sidebar
