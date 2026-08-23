import React, { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useSubscription } from '../contexts/SubscriptionContext'
import { fetchProgress, fetchUserProfile } from '../lib/api'
import { calculateUserOverallStats, getLevelTitle } from '../utils/xpSystem'
import {
    Home, CalendarDays, FileText, Stethoscope, Target,
    Clock, BarChart3, CreditCard, RotateCcw, Settings,
    LogOut, LogIn, ChevronDown, Menu, X, Video, Shield, Users, Flame, Eye, EyeOff
} from 'lucide-react'
import { EunacomLogo } from './EunacomLogo'
import { DOCTOR_CHARACTERS, getDoctorAvatar } from '../utils/doctorAvatars'

const ProgressItem = ({ label, used, total }) => {
    const isMaxed = used >= total;
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '0.5rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--surface-300)', display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                <span>{label}</span>
                <span style={{ color: isMaxed ? '#ef4444' : 'inherit' }}>{Math.min(used, total)}/{total}</span>
            </div>
            <div style={{ width: '100%', height: '4px', background: 'var(--surface-600)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ 
                    height: '100%', 
                    width: `${Math.min((used / total) * 100, 100)}%`, 
                    background: isMaxed ? '#ef4444' : '#10b981',
                    transition: 'width 0.3s ease-in-out'
                }} />
            </div>
        </div>
    );
};

const Sidebar = ({ mobileOpen, onToggle }) => {
    const { signOut, user, isAdmin, isRealAdmin, adminPreviewMode, toggleAdminPreview, openAuthModal, loading: authLoading } = useAuth()
    const { isPremium, usageStats, setShowPaymentModal, loadingPremium } = useSubscription()
    const navigate = useNavigate()
    const [userLevel, setUserLevel] = useState(1)
    const [displayName, setDisplayName] = useState(null)
    const [avatarEmoji, setAvatarEmoji] = useState('🩺')
    const [avatarImage, setAvatarImage] = useState('/avatars/dr_strange.png')
    const [collapsed, setCollapsed] = useState(() => {
        try {
            return localStorage.getItem('sidebar_collapsed') === 'true'
        } catch {
            return false
        }
    })

    const toggleCollapse = () => {
        const nextState = !collapsed
        setCollapsed(nextState)
        try {
            localStorage.setItem('sidebar_collapsed', nextState ? 'true' : 'false')
        } catch {}
    }

    useEffect(() => {
        if (!user) return
        calculateUserOverallStats(user.id).then(stats => {
            if (stats?.level) setUserLevel(stats.level)
        }).catch(() => {})
        fetchUserProfile(user.id).then(profile => {
            if (profile?.first_name) {
                setDisplayName(`Dr(a). ${profile.first_name} ${profile.last_name || ''}`.trim())
            } else if (user.user_metadata?.full_name) {
                setDisplayName(`Dr(a). ${user.user_metadata.full_name}`)
            }
            const doc = getDoctorAvatar(profile || user)
            if (doc?.image) setAvatarImage(doc.image)
        }).catch(() => {
            const doc = getDoctorAvatar(user)
            if (doc?.image) setAvatarImage(doc.image)
        })
    }, [user])

    const handleLogout = async () => {
        await signOut()
        navigate('/login')
    }

    return (
        <aside className={`sidebar ${mobileOpen ? 'open' : ''} ${collapsed ? 'sidebar--collapsed' : ''}`}>
            {/* Header / Brand & Collapse Toggle */}
            <div className="sidebar__brand">
                <div 
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', overflow: 'hidden' }} 
                    onClick={() => navigate('/dashboard')}
                    title="eunacomapp"
                >
                    <EunacomLogo size={collapsed ? 28 : 30} showWordmark={!collapsed} textColor="#ffffff" accentColor="#38bdf8" />
                </div>

                <button
                    type="button"
                    onClick={toggleCollapse}
                    title={collapsed ? "Expandir barra lateral" : "Minimizar barra lateral"}
                    style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '8px',
                        color: 'rgba(255, 255, 255, 0.8)',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background 0.15s ease',
                        flexShrink: 0,
                    }}
                >
                    {collapsed ? <ChevronDown style={{ transform: 'rotate(-90deg)' }} size={16} /> : <ChevronDown style={{ transform: 'rotate(90deg)' }} size={16} />}
                </button>
            </div>

            <nav className="sidebar__nav">
                <NavLink 
                    to="/dashboard" 
                    data-tour="dashboard" 
                    title="Inicio" 
                    className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} 
                    onClick={onToggle}
                >
                    <Home size={18} /> {!collapsed && <span>Inicio</span>}
                </NavLink>

                {isAdmin() && (
                    <NavLink 
                        to="/study-plan" 
                        data-tour="study-plan" 
                        title="Plan de Estudio" 
                        className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} 
                        onClick={onToggle}
                    >
                        <CalendarDays size={18} /> {!collapsed && <span>Plan de Estudio</span>}
                    </NavLink>
                )}

                {/* Section: Aprendizaje */}
                <div className="sidebar__section-title">Aprendizaje</div>
                {collapsed && <div className="sidebar__section-divider" />}

                <NavLink 
                    to="/mis-clases" 
                    data-tour="mis-clases" 
                    title="Mis Clases" 
                    className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} 
                    onClick={onToggle}
                    style={{ color: '#818cf8', fontWeight: 700 }}
                >
                    <Video size={18} style={{ color: '#818cf8' }} /> {!collapsed && <span>Mis Clases 📺</span>}
                </NavLink>

                <NavLink 
                    to="/medlingo" 
                    data-tour="medlingo" 
                    title="MedLingo" 
                    className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} 
                    onClick={onToggle}
                    style={{ color: '#f97316', fontWeight: 700 }}
                >
                    <Flame size={18} style={{ color: '#f97316' }} /> {!collapsed && <span>MedLingo 🔥</span>}
                </NavLink>

                {isAdmin() && (
                    <NavLink 
                        to="/studio" 
                        title="Studio Creator V3" 
                        className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} 
                        onClick={onToggle} 
                        style={{ color: '#38bdf8', fontWeight: 700 }}
                    >
                        <Flame size={18} /> {!collapsed && <span>Studio Creator V3</span>}
                    </NavLink>
                )}

                {isAdmin() && (
                    <NavLink 
                        to="/biblioteca" 
                        title="Biblioteca EUNACOM" 
                        className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} 
                        onClick={onToggle}
                    >
                        <Shield size={18} /> {!collapsed && <span>Biblioteca EUNACOM</span>}
                    </NavLink>
                )}

                {isAdmin() && (
                    <NavLink 
                        to="/study-guides" 
                        title="Study Guides High Yield!" 
                        className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} 
                        onClick={onToggle} 
                        style={{ color: '#f97316' }}
                    >
                        <Flame size={18} /> {!collapsed && <span>Study Guides</span>}
                    </NavLink>
                )}

                {/* Section: Exámenes */}
                <div className="sidebar__section-title">Exámenes</div>
                {collapsed && <div className="sidebar__section-divider" />}

                <NavLink 
                    to="/test" 
                    data-tour="test" 
                    title="Preguntas EUNACOM" 
                    className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} 
                    onClick={onToggle}
                >
                    <FileText size={18} /> {!collapsed && <span>Preguntas</span>}
                </NavLink>

                <NavLink 
                    to="/reconstructions" 
                    title="Reconstrucciones" 
                    className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} 
                    onClick={onToggle}
                >
                    <Stethoscope size={18} /> {!collapsed && <span>Reconstrucciones</span>}
                </NavLink>

                <NavLink 
                    to="/simulation" 
                    title="Simulación Oficial" 
                    className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} 
                    onClick={onToggle}
                >
                    <Target size={18} /> {!collapsed && <span>Simulación</span>}
                </NavLink>

                <NavLink 
                    to="/history" 
                    title="Historial de Exámenes" 
                    className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} 
                    onClick={onToggle}
                >
                    <Clock size={18} /> {!collapsed && <span>Historial</span>}
                </NavLink>

                <NavLink 
                    to="/stats" 
                    data-tour="stats" 
                    title="Estadísticas & Rendimiento" 
                    className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} 
                    onClick={onToggle}
                >
                    <BarChart3 size={18} /> {!collapsed && <span>Estadísticas</span>}
                </NavLink>

                {isAdmin() && (
                    <NavLink 
                        to="/flashcards" 
                        title="Flashcards" 
                        className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} 
                        onClick={onToggle}
                    >
                        <CreditCard size={18} /> {!collapsed && <span>Flashcards</span>}
                    </NavLink>
                )}

                <NavLink 
                    to="/review" 
                    title="Repasar Errores" 
                    className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} 
                    onClick={onToggle}
                >
                    <RotateCcw size={18} /> {!collapsed && <span>Repasar Errores</span>}
                </NavLink>
            </nav>

            {/* Sidebar Footer */}
            <div className="sidebar__footer">
                {!isPremium && !isAdmin() && !loadingPremium && !authLoading && user && !collapsed && (
                    <div style={{ marginBottom: '0.65rem', padding: '0.65rem 0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ fontSize: '0.72rem', color: '#f8fafc', fontWeight: 800, marginBottom: '0.4rem', textAlign: 'center', letterSpacing: '0.5px' }}>
                            TU PLAN GRATUITO
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem 0.5rem', marginBottom: '0.5rem' }}>
                            <div style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
                                <span>Preguntas:</span>
                                <span style={{ color: (usageStats?.customQuestionsAnswered || 0) >= 20 ? '#ef4444' : '#38bdf8', fontWeight: 700 }}>{Math.min(usageStats?.customQuestionsAnswered || 0, 20)}/20</span>
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
                                <span>Clases:</span>
                                <span style={{ color: (usageStats?.clasesOpened || 0) >= 3 ? '#ef4444' : '#38bdf8', fontWeight: 700 }}>{Math.min(usageStats?.clasesOpened || 0, 3)}/3</span>
                            </div>
                        </div>

                        <button 
                            onClick={() => {
                                setShowPaymentModal(true);
                                onToggle();
                            }}
                            style={{ 
                                display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                                background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)', color: '#fff', padding: '0.45rem 0.6rem', borderRadius: '8px', 
                                fontSize: '0.78rem', fontWeight: 800, border: 'none', cursor: 'pointer', boxShadow: '0 2px 8px rgba(6,182,212,0.3)'
                            }}
                        >
                            <Flame size={13} /> ¡Pasar a Premium!
                        </button>
                    </div>
                )}

                {user ? (
                    <>
                        {isAdmin() && !collapsed && (
                            <>
                                <NavLink to="/admin/users" className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} onClick={onToggle}>
                                    <Users size={18} /> Usuarios
                                </NavLink>
                            </>
                        )}

                        {/* User Profile Card */}
                        <div 
                            className="sidebar__user" 
                            style={{ 
                                cursor: 'pointer', 
                                transition: 'background 0.15s ease',
                                justifyContent: collapsed ? 'center' : 'flex-start',
                                padding: collapsed ? '0.5rem 0.25rem' : '0.75rem',
                            }}
                            onClick={() => {
                                navigate('/settings')
                                if (onToggle) onToggle()
                            }}
                            title={displayName ? `${displayName} · Ver Configuración & Plan` : "Ver mi perfil y configuración"}
                        >
                            <div className="sidebar__avatar" style={{ padding: 0, overflow: 'hidden', border: '1.5px solid rgba(255,255,255,0.25)', flexShrink: 0 }}>
                                <img src={avatarImage} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            {!collapsed && (
                                <div style={{ overflow: 'hidden' }}>
                                    <div className="sidebar__user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {displayName || user.email?.split('@')[0] || 'Usuario'}
                                    </div>
                                    <div className="sidebar__user-level">Nivel {userLevel} · {getLevelTitle(userLevel)}</div>
                                </div>
                            )}
                        </div>

                        {/* Configuración & Plan Link */}
                        <NavLink 
                            to="/settings" 
                            title="Configuración & Plan" 
                            className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} 
                            onClick={onToggle} 
                            style={{ marginTop: '0.25rem' }}
                        >
                            <Settings size={18} /> {!collapsed && <span>Configuración & Plan</span>}
                        </NavLink>

                        {isRealAdmin && isRealAdmin() && !collapsed && (
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

                        {/* Logout Button */}
                        <button 
                            onClick={handleLogout} 
                            className="sidebar__logout"
                            title="Cerrar Sesión"
                            style={{
                                padding: collapsed ? '0.6rem 0' : '0.6rem',
                                justifyContent: 'center',
                            }}
                        >
                            <LogOut size={16} /> {!collapsed && <span>Cerrar Sesión</span>}
                        </button>
                    </>
                ) : (
                    <button 
                        onClick={() => {
                            openAuthModal('login')
                            if (onToggle) onToggle()
                        }} 
                        className="sidebar__logout" 
                        title="Iniciar Sesión"
                        style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', justifyContent: 'center' }}
                    >
                        <LogIn size={16} /> {!collapsed && <span>Iniciar Sesión</span>}
                    </button>
                )}
            </div>
        </aside>
    )
}

export default Sidebar
