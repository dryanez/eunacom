import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, Menu, Heart, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const DONATION_LINKS = [
  { name: 'PayPal', url: 'https://www.paypal.com/donate/?hosted_button_id=R8LN5TXP8XYNG', emoji: '💳' },
  { name: 'Mercado Pago (Chile)', url: 'https://link.mercadopago.cl/donacioneunacom', emoji: '🟡' },
]

const DashboardHeader = ({ onMenuToggle }) => {
    const { user, signOut } = useAuth()
    const navigate = useNavigate()
    const [showMenu, setShowMenu] = useState(false)
    const [showDonate, setShowDonate] = useState(false)
    const [bannerDismissed, setBannerDismissed] = useState(() => {
        try { return sessionStorage.getItem('donate_banner_dismissed') === '1' } catch { return false }
    })

    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Guest'

    const handleLogout = async () => {
        await signOut()
        navigate('/login')
    }

    const dismissBanner = () => {
        setBannerDismissed(true)
        try { sessionStorage.setItem('donate_banner_dismissed', '1') } catch {}
    }

    return (
        <>
            {/* Donation Banner */}
            {!bannerDismissed && (
                <div style={{
                    background: 'linear-gradient(90deg, rgba(19,91,236,0.15) 0%, rgba(168,85,247,0.12) 50%, rgba(239,68,68,0.1) 100%)',
                    padding: '0.5rem 2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.75rem',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    flexWrap: 'wrap',
                    position: 'relative',
                }}>
                    <Heart size={14} color="var(--accent-red)" fill="var(--accent-red)" />
                    <span style={{ fontSize: '0.82rem', color: 'var(--surface-200)', fontFamily: 'var(--font)' }}>
                        Para mantener esta app <strong>gratuita</strong>, ¡considera donar!
                    </span>
                    <button
                        onClick={() => setShowDonate(true)}
                        style={{
                            padding: '0.3rem 0.85rem',
                            background: 'var(--gradient-primary)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            fontFamily: 'var(--font)',
                        }}
                    >
                        ☕ Donar
                    </button>
                    <button
                        onClick={dismissBanner}
                        style={{
                            position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                            background: 'none', border: 'none', color: 'var(--surface-400)', cursor: 'pointer', padding: 4,
                        }}
                    >
                        <X size={14} />
                    </button>
                </div>
            )}

            {/* Header bar */}
            <header className="header">
                <button className="mobile-menu-btn" onClick={onMenuToggle}>
                    <Menu size={24} />
                </button>

                {/* Compact donate button if banner dismissed */}
                {bannerDismissed && (
                    <button
                        onClick={() => setShowDonate(true)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            padding: '0.35rem 0.75rem', background: 'rgba(239,68,68,0.1)',
                            border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-full)',
                            color: 'var(--accent-red)', fontSize: '0.78rem', fontWeight: 600,
                            cursor: 'pointer', fontFamily: 'var(--font)', marginRight: 'auto',
                        }}
                    >
                        <Heart size={12} fill="var(--accent-red)" /> Donar
                    </button>
                )}

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

            {/* Donation Modal */}
            {showDonate && (
                <div
                    onClick={() => setShowDonate(false)}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 9998,
                        background: 'rgba(11,17,32,0.8)', backdropFilter: 'blur(8px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
                    }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: 'var(--surface-700)', borderRadius: 'var(--radius-xl)',
                            padding: '2rem', maxWidth: 420, width: '100%',
                            border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                            textAlign: 'center',
                        }}
                    >
                        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>☕</div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--surface-50)', marginBottom: '0.5rem', fontFamily: 'var(--font)' }}>
                            ¡Ayúdanos a seguir gratis!
                        </h2>
                        <p style={{ fontSize: '0.9rem', color: 'var(--surface-300)', lineHeight: 1.6, marginBottom: '1.5rem', fontFamily: 'var(--font)' }}>
                            EUNACOM-Examen es 100% gratuito. Tu donación nos ayuda a mantener los servidores, agregar más preguntas y seguir mejorando la plataforma.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {DONATION_LINKS.map(d => (
                                <a
                                    key={d.name}
                                    href={d.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                        padding: '0.75rem 1rem',
                                        background: 'var(--surface-600)', borderRadius: 'var(--radius)',
                                        color: 'var(--surface-50)', fontWeight: 600, fontSize: '0.9rem',
                                        textDecoration: 'none', fontFamily: 'var(--font)',
                                        border: '1px solid rgba(255,255,255,0.06)',
                                        transition: 'background 0.2s',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-500)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-600)'}
                                >
                                    <span>{d.emoji}</span> {d.name}
                                </a>
                            ))}
                        </div>
                        <button
                            onClick={() => setShowDonate(false)}
                            style={{
                                marginTop: '1.25rem', background: 'none', border: 'none',
                                color: 'var(--surface-400)', fontSize: '0.85rem', cursor: 'pointer',
                                fontFamily: 'var(--font)', textDecoration: 'underline',
                            }}
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}

export default DashboardHeader
