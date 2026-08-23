import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Video, Target, Shield, Menu, FileText, BarChart2, CheckSquare, Calendar, Clock, Flame } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const BottomNavigation = ({ onMenuToggle }) => {
    const { isAdmin } = useAuth()

    return (
        <nav className="bottom-nav">
            <NavLink to="/dashboard" className={({ isActive }) => `bottom-nav__link ${isActive ? 'bottom-nav__link--active' : ''}`}>
                <Home size={22} />
                <span>Inicio</span>
            </NavLink>
            <NavLink to="/medlingo" className={({ isActive }) => `bottom-nav__link ${isActive ? 'bottom-nav__link--active' : ''}`} style={{ color: '#f97316' }}>
                <Flame size={22} />
                <span>Racha 🔥</span>
            </NavLink>
            {isAdmin() && (
                <NavLink to="/study-plan" className={({ isActive }) => `bottom-nav__link ${isActive ? 'bottom-nav__link--active' : ''}`}>
                    <Calendar size={22} />
                    <span>Plan</span>
                </NavLink>
            )}
            <NavLink to="/mis-clases" className={({ isActive }) => `bottom-nav__link ${isActive ? 'bottom-nav__link--active' : ''}`}>
                <Video size={22} />
                <span>Clases</span>
            </NavLink>
            <NavLink to="/reconstructions" className={({ isActive }) => `bottom-nav__link ${isActive ? 'bottom-nav__link--active' : ''}`}>
                <FileText size={22} />
                <span>Rec.</span>
            </NavLink>
            <NavLink to="/simulation" className={({ isActive }) => `bottom-nav__link ${isActive ? 'bottom-nav__link--active' : ''}`}>
                <Target size={22} />
                <span>Simulación</span>
            </NavLink>
            <NavLink to="/test" className={({ isActive }) => `bottom-nav__link ${isActive ? 'bottom-nav__link--active' : ''}`}>
                <CheckSquare size={22} />
                <span>Pruebas</span>
            </NavLink>
            <NavLink to="/stats" className={({ isActive }) => `bottom-nav__link ${isActive ? 'bottom-nav__link--active' : ''}`}>
                <BarChart2 size={22} />
                <span>Stats</span>
            </NavLink>
            <NavLink to="/history" className={({ isActive }) => `bottom-nav__link ${isActive ? 'bottom-nav__link--active' : ''}`}>
                <Clock size={22} />
                <span>Historial</span>
            </NavLink>
            {isAdmin() && (
                <NavLink to="/biblioteca" className={({ isActive }) => `bottom-nav__link ${isActive ? 'bottom-nav__link--active' : ''}`}>
                    <Shield size={22} />
                    <span>Admin</span>
                </NavLink>
            )}
            <button className="bottom-nav__link bottom-nav__menu-btn" onClick={onMenuToggle}>
                <Menu size={22} />
                <span>Menú</span>
            </button>
        </nav>
    )
}

export default BottomNavigation
