import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, Menu, LogIn, Settings, CreditCard, User, Shield } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import './redesign/midnight.css'
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

                <a href="/dashboard" className="mn-header-logo"><img src="/logo.png" alt="" /><span>eunacom<em>app</em></span></a>
                {!user && (
                    <div style={{ marginLeft: 'auto' }}>
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
                    </div>
                )}
            </header>


        </>
    )
}

export default DashboardHeader
