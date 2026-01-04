import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import '../styles/neumorphism.css'

const Sidebar = () => {
    const { signOut, user } = useAuth()
    const navigate = useNavigate()
    const [isMobileOpen, setIsMobileOpen] = React.useState(false)

    const handleLogout = async () => {
        await signOut()
        navigate('/login')
    }

    const toggleMobileMenu = () => {
        setIsMobileOpen(!isMobileOpen)
    }

    const menuItems = [
        { path: '/dashboard', icon: '🏠', label: 'Inicio' },
        { path: '/practice', icon: '❓', label: 'Pregunta Aleatoria' },
        { path: '/simulations', icon: '📝', label: 'Simulaciones' },
        { path: '/history', icon: '🕒', label: 'Historial Tests' },
        { path: '/reconstructions', icon: '🏥', label: 'Reconstrucciones' },
        { path: '/flashcards', icon: '🃏', label: 'Flashcards' },
        { path: '/stats', icon: '📊', label: 'Estadísticas' },
        { path: '/review', icon: '🔄', label: 'Repasar Errores' },
    ]

    return (
        <aside className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
            <div className="sidebar__header-mobile" style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="sidebar__logo" style={{ marginBottom: 0, padding: 0 }}>
                    <span className="sidebar__logo-icon">🩺</span>
                    <span className="sidebar__logo-text">Eunacom<span style={{ color: 'var(--color-primary-500)' }}>App</span></span>
                </div>
                <button
                    className="mobile-toggle"
                    onClick={toggleMobileMenu}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        fontSize: '1.5rem',
                        cursor: 'pointer'
                    }}
                >
                    {isMobileOpen ? '✕' : '☰'}
                </button>
            </div>

            <nav className="sidebar__nav">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `sidebar__item ${isActive ? 'sidebar__item--active' : ''}`
                        }
                        onClick={() => setIsMobileOpen(false)} // Close on click
                    >
                        <span className="sidebar__item-icon">{item.icon}</span>
                        <span className="sidebar__item-label">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar__footer">
                <div className="sidebar__user">
                    <div className="sidebar__avatar">
                        {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="sidebar__user-info">
                        <span className="sidebar__username">{user?.email?.split('@')[0] || 'Usuario'}</span>
                        <span className="sidebar__level">Nivel 1</span>
                    </div>
                </div>
                <button onClick={handleLogout} className="sidebar__logout">
                    🚪 Cerrar Sesión
                </button>
            </div>
        </aside>
    )
}

export default Sidebar
