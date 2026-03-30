import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
    Home, CalendarDays, FileText, Stethoscope, Target,
    Clock, BarChart3, CreditCard, RotateCcw, Settings,
    LogOut, ChevronDown, Menu, X
} from 'lucide-react'

const Sidebar = ({ mobileOpen, onToggle }) => {
    const { signOut, user, isAdmin } = useAuth()
    const navigate = useNavigate()
    const [examenesOpen, setExamenesOpen] = useState(false)

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
                <NavLink to="/dashboard" className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} onClick={onToggle}>
                    <Home size={18} /> Inicio
                </NavLink>
                <NavLink to="/study-plan" className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} onClick={onToggle}>
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
                        <NavLink to="/test" className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} onClick={onToggle}>
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
                <NavLink to="/stats" className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} onClick={onToggle}>
                    <BarChart3 size={18} /> Estadísticas
                </NavLink>
                <NavLink to="/flashcards" className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} onClick={onToggle}>
                    <CreditCard size={18} /> Flashcards
                </NavLink>
                <NavLink to="/review" className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} onClick={onToggle}>
                    <RotateCcw size={18} /> Repasar Errores
                </NavLink>
            </nav>

            <div className="sidebar__footer">
                {isAdmin() && (
                    <NavLink to="/admin" className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}>
                        <Settings size={18} /> Admin
                    </NavLink>
                )}
                <div className="sidebar__user">
                    <div className="sidebar__avatar">
                        {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                        <div className="sidebar__user-name">{user?.email?.split('@')[0] || 'Usuario'}</div>
                        <div className="sidebar__user-level">Nivel 1</div>
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
