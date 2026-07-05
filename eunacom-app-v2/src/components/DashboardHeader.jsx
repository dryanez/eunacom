import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, Menu, LogIn } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useSubscription } from '../contexts/SubscriptionContext'


const DashboardHeader = ({ onMenuToggle }) => {
    const { user, signOut } = useAuth()
    const { isFounder } = useSubscription()
    const navigate = useNavigate()
    const [showMenu, setShowMenu] = useState(false)

    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Guest'
    console.log("BANNER REMOVED VERIFICATION");

    const handleLogout = async () => {
        await signOut()
        navigate('/login')
    }



    return (
        <>


            {/* Header bar */}
            <header className="header">
                <button className="mobile-menu-btn" onClick={onMenuToggle} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Menu size={20} />
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.03em', color: 'var(--surface-200)' }}>Menú</span>
                </button>



                <div style={{ marginLeft: 'auto', position: 'relative' }}>
                    {user ? (
                        <>
                            <div className="header__user-pill" onClick={() => setShowMenu(!showMenu)}>
                                <img src="/logo.png" alt={userName} />
                                <span>{userName}</span>
                                {isFounder && <span style={{ background: '#fbbf24', color: '#000', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px', fontWeight: 800 }}>Founder 🚀</span>}
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
                        </>
                    ) : (
                        <button
                            onClick={() => navigate('/login')}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.4rem',
                                padding: '0.45rem 1rem',
                                background: 'var(--gradient-primary)', border: 'none',
                                borderRadius: 'var(--radius-full)', color: '#fff',
                                fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
                                fontFamily: 'var(--font)',
                            }}
                        >
                            <LogIn size={15} /> Iniciar Sesión
                        </button>
                    )}
                </div>
            </header>


        </>
    )
}

export default DashboardHeader
