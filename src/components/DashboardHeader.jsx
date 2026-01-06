import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getAvatarUrl } from '../config/avatars'

const DashboardHeader = ({ profile }) => {
    const { user, signOut } = useAuth()
    const navigate = useNavigate()
    const [showUserMenu, setShowUserMenu] = useState(false)

    const handleLogout = async () => {
        await signOut()
        navigate('/login')
    }

    const userName = profile?.display_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Guest'
    const userAvatar = profile?.avatar_id || 'house'

    return (
        <header className="dashboard__header">
            <div className="header-user" style={{ position: 'relative', marginLeft: 'auto' }}>
                <div
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                >
                    <img
                        src={getAvatarUrl(userAvatar)}
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
                            Cerrar Sesión
                        </button>
                    </div>
                )}
            </div>
        </header>
    )
}

export default DashboardHeader
