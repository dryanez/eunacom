import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
    Home,
    Clock,
    CreditCard,
    BarChart3,
    RotateCcw,
    FileText,
    Stethoscope,
    Target,
    ChevronDown,
    Settings,
    LogOut,
    Menu,
    X,
    GraduationCap
} from 'lucide-react'
import '../styles/neumorphism.css'

const Sidebar = () => {
    const { signOut, user, isAdmin } = useAuth()
    const navigate = useNavigate()
    const [isMobileOpen, setIsMobileOpen] = React.useState(false)
    const [examenesOpen, setExamenesOpen] = React.useState(true)

    const handleLogout = async () => {
        await signOut()
        navigate('/login')
    }

    const toggleMobileMenu = () => {
        setIsMobileOpen(!isMobileOpen)
    }

    const menuItems = [
        { path: '/dashboard', icon: Home, label: 'Inicio' },
        { path: '/history', icon: Clock, label: 'Historial Tests' },
        { path: '/flashcards', icon: CreditCard, label: 'Flashcards' },
        { path: '/stats', icon: BarChart3, label: 'Estadísticas' },
        { path: '/review', icon: RotateCcw, label: 'Repasar Errores' },
    ]

    const examenesItems = [
        { path: '/test', icon: FileText, label: 'Crear Examen' },
        { path: '/reconstructions', icon: Stethoscope, label: 'Reconstrucciones' },
        { path: '/simulation', icon: Target, label: 'Simulación' },
    ]

    return (
        <aside className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
            <div className="sidebar__header-mobile" style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="sidebar__logo" style={{ marginBottom: 0, padding: 0 }}>
                    <span className="sidebar__logo-icon">
                        <img
                            src="/logo.png"
                            alt="Eunacom-Examen Logo"
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '8px',
                                filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.3))'
                            }}
                        />
                    </span>
                    <span className="sidebar__logo-text">
                        Eunacom-<span style={{ fontWeight: '900' }}>Examen</span>
                    </span>
                </div>
                <button
                    className="mobile-toggle"
                    onClick={toggleMobileMenu}
                    style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'white',
                        padding: '0.5rem',
                        borderRadius: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            <nav className="sidebar__nav">
                {menuItems.map((item) => {
                    const Icon = item.icon
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `sidebar__item ${isActive ? 'sidebar__item--active' : ''}`
                            }
                            onClick={() => setIsMobileOpen(false)}
                        >
                            <span className="sidebar__item-icon">
                                <Icon size={20} />
                            </span>
                            <span className="sidebar__item-label">{item.label}</span>
                        </NavLink>
                    )
                })}

                {/* Exámenes Collapsible Section */}
                <div style={{ marginTop: '0.5rem' }}>
                    <div
                        onClick={() => setExamenesOpen(!examenesOpen)}
                        className="sidebar__item"
                        style={{
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span className="sidebar__item-icon">
                                <FileText size={20} />
                            </span>
                            <span className="sidebar__item-label">Exámenes</span>
                        </div>
                        <span style={{
                            transform: examenesOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s',
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            <ChevronDown size={16} />
                        </span>
                    </div>

                    {examenesOpen && (
                        <div style={{ paddingLeft: '1rem', marginTop: '0.25rem' }}>
                            {examenesItems.map((item) => {
                                const Icon = item.icon
                                return (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        className={({ isActive }) =>
                                            `sidebar__item ${isActive ? 'sidebar__item--active' : ''}`
                                        }
                                        onClick={() => setIsMobileOpen(false)}
                                        style={{ fontSize: '0.9rem' }}
                                    >
                                        <span className="sidebar__item-icon">
                                            <Icon size={18} />
                                        </span>
                                        <span className="sidebar__item-label">{item.label}</span>
                                    </NavLink>
                                )
                            })}
                        </div>
                    )}
                </div>
            </nav>

            <div className="sidebar__footer">
                {/* Admin Link - Only visible for admin users */}
                {isAdmin() && (
                    <NavLink
                        to="/admin"
                        className={({ isActive }) =>
                            `sidebar__item ${isActive ? 'sidebar__item--active' : ''}`
                        }
                        onClick={() => setIsMobileOpen(false)}
                        style={{ marginBottom: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}
                    >
                        <span className="sidebar__item-icon">
                            <Settings size={20} />
                        </span>
                        <span className="sidebar__item-label">Admin</span>
                    </NavLink>
                )}

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
                    <LogOut size={18} />
                    <span>Cerrar Sesión</span>
                </button>
            </div>
        </aside>
    )
}

export default Sidebar
