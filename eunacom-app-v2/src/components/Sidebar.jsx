import React, { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { fetchProgress, fetchUserProfile } from '../lib/api'
import { XP_PER_CORRECT, XP_PER_INCORRECT, calculateLevelUp, getLevelTitle } from '../utils/xpSystem'
import {
    Home, CalendarDays, FileText, Stethoscope, Target,
    Clock, BarChart3, CreditCard, RotateCcw, Settings,
    LogOut, ChevronDown, Menu, X, Video, Shield, Users
} from 'lucide-react'

const Sidebar = ({ mobileOpen, onToggle }) => {
    const { signOut, user, isAdmin } = useAuth()
    const navigate = useNavigate()
    const [examenesOpen, setExamenesOpen] = useState(false)
    const [userLevel, setUserLevel] = useState(1)
    const [displayName, setDisplayName] = useState(null)

    useEffect(() => {
        if (user) {
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
        }
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
                <NavLink to="/study-plan" data-tour="study-plan" className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} onClick={onToggle}>
                    <CalendarDays size={18} /> Plan de Estudio
                </NavLink>

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
                    <Clock size={18} /> Historial Tests
                </NavLink>
                <NavLink to="/stats" data-tour="stats" className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} onClick={onToggle}>
                    <BarChart3 size={18} /> Estadísticas
                </NavLink>
                <NavLink to="/flashcards" className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} onClick={onToggle}>
                    <CreditCard size={18} /> Flashcards
                </NavLink>
                <NavLink to="/review" className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} onClick={onToggle}>
                    <RotateCcw size={18} /> Repasar Errores
                </NavLink>

                <div className="sidebar__section-title">Aprendizaje</div>
                <NavLink to="/mis-clases" data-tour="mis-clases" className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} onClick={onToggle}>
                    <Video size={18} /> Mis Clases
                </NavLink>
                <NavLink to="/biblioteca" className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} onClick={onToggle}>
                    <Shield size={18} /> Biblioteca EUNACOM
                </NavLink>
            </nav>

            <div className="sidebar__footer">
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
                        {(displayName || user?.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div className="sidebar__user-name">{displayName || user?.email?.split('@')[0] || 'Usuario'}</div>
                        <div className="sidebar__user-level">Nivel {userLevel} · {getLevelTitle(userLevel)}</div>
                    </div>
                </div>
                <button onClick={handleLogout} className="sidebar__logout">
                    <LogOut size={16} /> Cerrar Sesión
                </button>
            </div>
        </aside>
    )
}

export default Sidebar
