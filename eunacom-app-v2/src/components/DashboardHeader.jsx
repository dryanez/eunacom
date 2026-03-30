import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, Menu } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const DashboardHeader = ({ onMenuToggle }) => {
    const { user, signOut } = useAuth()
    const navigate = useNavigate()
    const [showMenu, setShowMenu] = useState(false)

    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Guest'

    const handleLogout = async () => {
        await signOut()
        navigate('/login')
    }

    return (
        <header className="header">
            <button className="mobile-menu-btn" onClick={onMenuToggle}>
                <Menu size={24} />
            </button>
            <div style={{ marginLeft: 'auto', position: 'relative' }}>
                <div className="header__user-pill" onClick={() => setShowMenu(!showMenu)}>
                    <img src="/logo.png" alt={userName} />
                    <span>{userName}</span>
                    <ChevronDown size={14} style={{ color: 'var(--surface-400)' }} />
                </div>
                {showMenu && (
                    <div style={{
                        position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem',
                        background: 'var(--surface-700)', borderRadius: 'var(--radius)',
                        boxShadow: 'var(--shadow-lg)', minWidth: '180px', zIndex: 1000,
                        border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden'
                    }}>
                        <button onClick={handleLogout} style={{
                            width: '100%', padding: '0.75rem 1rem', background: 'transparent',
                            color: '#ef4444', fontWeight: 600, fontSize: '0.9rem', textAlign: 'left',
                            border: 'none', cursor: 'pointer', fontFamily: 'var(--font)'
                        }}>
                            Cerrar Sesión
                        </button>
                    </div>
                )}
            </div>
        </header>
    )
}

export default DashboardHeader
