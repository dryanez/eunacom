import React, { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './redesign/midnight.css'
import { useSubscription } from '../contexts/SubscriptionContext'
import { fetchProgress, fetchUserProfile } from '../lib/api'
import { calculateUserOverallStats, getLevelTitle } from '../utils/xpSystem'
import {
    Home, CalendarDays, FileText, Stethoscope, Target,
    Clock, BarChart3, CreditCard, RotateCcw, Settings,
    LogOut, LogIn, ChevronDown, Menu, X, Video, Shield, Users, Flame, Eye, EyeOff, BookOpen, Layers, Archive, Film } from 'lucide-react'
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

// Midnight Pro: menú agrupado (Estudiar · Practicar · Mi progreso). Sin emojis.
// Quita un «Dr.»/«Dra.»/«Dr(a).» que ya venga en el nombre, para no mostrarlo dos veces
const noTitle = n => String(n || '').replace(/^\s*(dr\(a\)|dra?)\.?\s+/i, '').trim()

const NAV_GROUPS = [
    { title: 'Estudiar', items: [
        { to: '/dashboard', label: 'Inicio', icon: Home, tour: 'dashboard' },
        { to: '/study-plan', label: 'Plan de estudio', icon: CalendarDays, tour: 'study-plan', admin: true },
        { to: '/mis-clases', label: 'Mis clases', icon: Video, tour: 'mis-clases' },
        { to: '/clases-guevara', label: 'Clases Dr. Guevara', icon: Film },
        { to: '/biblioteca', label: 'Biblioteca', icon: BookOpen, tour: 'libros' },
        { to: '/flashcards', label: 'Flashcards', icon: Layers },
        { to: '/medlingo', label: 'MedLingo', icon: Flame, tour: 'medlingo' },
    ] },
    { title: 'Practicar', items: [
        { to: '/test', label: 'Preguntas', icon: FileText, tour: 'test' },
        { to: '/reconstructions', label: 'Reconstrucciones', icon: Archive },
        { to: '/simulation', label: 'Simulación', icon: Target },
        { to: '/review', label: 'Repasar errores', icon: RotateCcw },
    ] },
    { title: 'Mi progreso', items: [
        { to: '/stats', label: 'Estadísticas', icon: BarChart3, tour: 'stats' },
        { to: '/history', label: 'Historial', icon: Clock },
    ] },
    { title: 'Admin', items: [
        { to: '/studio', label: 'Studio Creator V3', icon: Stethoscope, admin: true },
        { to: '/study-guides', label: 'Study Guides', icon: FileText, admin: true },
    ] },
]

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
        Promise.all([
            fetchUserProfile(user.id).catch(() => null),
            calculateUserOverallStats(user.id).catch(() => ({ level: 1 }))
        ]).then(([profile, stats]) => {
            const userLvl = stats?.level || 1
            setUserLevel(userLvl)
            if (profile?.first_name) {
                setDisplayName(`Dr(a). ${noTitle(`${profile.first_name} ${profile.last_name || ''}`)}`.trim())
            } else if (user.user_metadata?.full_name) {
                setDisplayName(`Dr(a). ${noTitle(user.user_metadata.full_name)}`)
            }
            const doc = getDoctorAvatar(profile || user, userLvl)
            if (doc?.image) setAvatarImage(doc.image)
        }).catch(() => {
            const doc = getDoctorAvatar(user, 1)
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
                    <EunacomLogo size={collapsed ? 28 : 30} showWordmark={!collapsed} textColor="var(--surface-50)" accentColor="#38bdf8" />
                </div>

                <button
                    type="button"
                    onClick={toggleCollapse}
                    title={collapsed ? "Expandir barra lateral" : "Minimizar barra lateral"}
                    style={{
                        background: 'var(--sidebar-btn-bg, rgba(255, 255, 255, 0.08))',
                        border: '1px solid var(--sidebar-btn-border, rgba(255, 255, 255, 0.15))',
                        borderRadius: '8px',
                        color: 'var(--sidebar-btn-color, rgba(255, 255, 255, 0.8))',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s ease',
                        flexShrink: 0,
                    }}
                >
                    {collapsed ? <ChevronDown style={{ transform: 'rotate(-90deg)' }} size={16} /> : <ChevronDown style={{ transform: 'rotate(90deg)' }} size={16} />}
                </button>
            </div>

            <nav className="sidebar__nav">
                {NAV_GROUPS.map(group => {
                    const items = group.items.filter(it => !it.admin || isAdmin())
                    if (!items.length) return null
                    return (
                        <React.Fragment key={group.title}>
                            <div className="sidebar__section-title">{group.title}</div>
                            {collapsed && <div className="sidebar__section-divider" />}
                            {items.map(({ to, label, icon: Icon, tour }) => (
                                <NavLink
                                    key={to}
                                    to={to}
                                    data-tour={tour}
                                    title={label}
                                    className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
                                    onClick={onToggle}
                                >
                                    <Icon size={18} /> {!collapsed && <span>{label}</span>}
                                </NavLink>
                            ))}
                        </React.Fragment>
                    )
                })}
            </nav>

            {/* Sidebar Footer */}
            <div className="sidebar__footer">
                {!isPremium && !isAdmin() && !loadingPremium && !authLoading && user && !collapsed && (
                    <div style={{ marginBottom: '0.65rem', padding: '0.65rem 0.75rem', background: 'var(--sidebar-card-bg, rgba(255,255,255,0.05))', borderRadius: '10px', border: '1px solid var(--sidebar-card-border, rgba(255,255,255,0.1))' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--surface-50, #f8fafc)', fontWeight: 800, marginBottom: '0.4rem', textAlign: 'center', letterSpacing: '0.5px' }}>
                            TU PLAN GRATUITO
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem 0.5rem', marginBottom: '0.5rem' }}>
                            <div style={{ fontSize: '0.72rem', color: 'var(--surface-400, #94a3b8)', display: 'flex', justifyContent: 'space-between' }}>
                                <span>Preguntas:</span>
                                <span style={{ color: (usageStats?.customQuestionsAnswered || 0) >= 20 ? '#ef4444' : '#38bdf8', fontWeight: 700 }}>{Math.min(usageStats?.customQuestionsAnswered || 0, 20)}/20</span>
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--surface-400, #94a3b8)', display: 'flex', justifyContent: 'space-between' }}>
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
