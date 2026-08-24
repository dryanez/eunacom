import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, Menu, LogIn, Settings, CreditCard, User, Shield } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useSubscription } from '../contexts/SubscriptionContext'
import { fetchUserProfile } from '../lib/api'
import { getDoctorAvatar } from '../utils/doctorAvatars'
import { calculateUserOverallStats } from '../utils/xpSystem'
import { UserInstitutionBadge } from '../utils/universityAndCountry'

const DashboardHeader = ({ onMenuToggle }) => {
    const { user, signOut, openAuthModal } = useAuth()
    const { isFounder, isPremium } = useSubscription()
    const navigate = useNavigate()
    const [showMenu, setShowMenu] = useState(false)
    const [displayName, setDisplayName] = useState('')
    const [avatarImage, setAvatarImage] = useState('/avatars/dr_dorian.png')
    const [userProfile, setUserProfile] = useState(null)

    useEffect(() => {
        if (!user) return
        Promise.all([
            fetchUserProfile(user.id).catch(() => null),
            calculateUserOverallStats(user.id).catch(() => ({ level: 1 }))
        ]).then(([profile, stats]) => {
            const userLvl = stats?.level || 1
            if (profile) setUserProfile(profile)
            if (profile?.first_name) {
                setDisplayName(`Dr(a). ${profile.first_name} ${profile.last_name || ''}`.trim())
            } else if (user.user_metadata?.full_name) {
                setDisplayName(`Dr(a). ${user.user_metadata.full_name}`)
            } else {
                setDisplayName(user.email?.split('@')[0] || 'Doctor')
            }
            const doc = getDoctorAvatar(profile || user, userLvl)
            if (doc?.image) setAvatarImage(doc.image)
        }).catch(() => {
            const doc = getDoctorAvatar(user, 1)
            if (doc?.image) setAvatarImage(doc.image)
            setDisplayName(user.email?.split('@')[0] || 'Doctor')
        })
    }, [user])

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
                            <div className="header__user-pill" onClick={() => setShowMenu(!showMenu)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                                    <img
                                        src={avatarImage}
                                        alt="Avatar"
                                        style={{
                                            width: '28px',
                                            height: '28px',
                                            borderRadius: '50%',
                                            objectFit: 'cover',
                                            border: '1.5px solid rgba(255, 255, 255, 0.4)',
                                        }}
                                    />
                                    <div style={{ position: 'absolute', bottom: -3, right: -4 }}>
                                        <UserInstitutionBadge user={userProfile} size={15} />
                                    </div>
                                </div>
                                <span style={{ fontWeight: 700 }}>{displayName || 'Doctor'}</span>
                                {isFounder && <span style={{ background: '#fbbf24', color: '#000', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', marginLeft: '2px', fontWeight: 800 }}>Founder 🚀</span>}
                                <ChevronDown size={14} style={{ color: 'var(--surface-400)' }} />
                            </div>
                            {showMenu && (
                                <div style={{
                                    position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem',
                                    background: 'var(--surface-700)', borderRadius: 'var(--radius)',
                                    boxShadow: 'var(--shadow-lg)', minWidth: '200px', zIndex: 1000,
                                    border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden'
                                }}>
                                    <button 
                                        onClick={() => {
                                            setShowMenu(false)
                                            navigate('/settings')
                                        }} 
                                        style={{
                                            width: '100%', padding: '0.75rem 1rem', background: 'transparent',
                                            color: '#f8fafc', fontWeight: 600, fontSize: '0.86rem', textAlign: 'left',
                                            border: 'none', cursor: 'pointer', fontFamily: 'var(--font)',
                                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                                            borderBottom: '1px solid rgba(255,255,255,0.06)'
                                        }}
                                    >
                                        <User size={15} color="#38bdf8" />
                                        <span>Mi Perfil & Objetivos</span>
                                    </button>

                                    <button 
                                        onClick={() => {
                                            setShowMenu(false)
                                            navigate('/mi-plan')
                                        }} 
                                        style={{
                                            width: '100%', padding: '0.75rem 1rem', background: 'transparent',
                                            color: '#f8fafc', fontWeight: 600, fontSize: '0.86rem', textAlign: 'left',
                                            border: 'none', cursor: 'pointer', fontFamily: 'var(--font)',
                                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                                            borderBottom: '1px solid rgba(255,255,255,0.06)'
                                        }}
                                    >
                                        <CreditCard size={15} color="#10b981" />
                                        <span>Mi Plan & Pagos</span>
                                    </button>

                                    <button onClick={handleLogout} style={{
                                        width: '100%', padding: '0.75rem 1rem', background: 'transparent',
                                        color: '#ef4444', fontWeight: 600, fontSize: '0.86rem', textAlign: 'left',
                                        border: 'none', cursor: 'pointer', fontFamily: 'var(--font)'
                                    }}>
                                        Cerrar Sesión
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <button
                            onClick={() => openAuthModal('login')}
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
