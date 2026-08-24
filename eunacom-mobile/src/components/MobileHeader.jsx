import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Flame, Sparkles, ChevronLeft, User, Shield } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useSubscription } from '../contexts/SubscriptionContext'
import { fetchUserProfile, fetchProgress } from '../lib/api'
import { getDoctorAvatar } from '../utils/doctorAvatars'
import { calculateUserOverallStats } from '../utils/xpSystem'
import { UserInstitutionBadge } from '../utils/universityAndCountry'

export default function MobileHeader() {
  const { user, isAdmin } = useAuth()
  const { isPremium, setShowPaymentModal } = useSubscription()
  const navigate = useNavigate()
  const location = useLocation()
  
  const [streak, setStreak] = useState(1)
  const [avatarImage, setAvatarImage] = useState('/avatars/dr_dorian.png')
  const [userProfile, setUserProfile] = useState(null)

  const isMainTab = ['/dashboard', '/mis-clases', '/practica', '/medlingo', '/settings'].includes(location.pathname)

  useEffect(() => {
    if (!user) return
    Promise.all([
      fetchUserProfile(user.id).catch(() => null),
      calculateUserOverallStats(user.id).catch(() => ({ level: 1 })),
      fetchProgress(user.id).catch(() => null)
    ]).then(([profile, stats, progress]) => {
      if (profile) setUserProfile(profile)
      const doc = getDoctorAvatar(profile || user, stats?.level || 1)
      if (doc?.image) setAvatarImage(doc.image)
      if (progress?.streak_days) setStreak(progress.streak_days)
    }).catch(() => {})
  }, [user])

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard': return 'EUNACOM 2026'
      case '/mis-clases': return 'Masterclasses'
      case '/practica': return 'Centro de Práctica'
      case '/medlingo': return 'MedLingo'
      case '/settings': return 'Mi Perfil'
      case '/test': return 'Prueba Personalizada'
      case '/simulation': return 'Simulacro Oficial'
      case '/reconstructions': return 'Reconstrucciones'
      case '/review': return 'Repaso de Errores'
      case '/stats': return 'Estadísticas'
      case '/history': return 'Historial de Pruebas'
      default: return 'EUNACOM'
    }
  }

  return (
    <header className="mobile-app-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        {!isMainTab ? (
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              borderRadius: '10px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            <ChevronLeft size={22} />
          </button>
        ) : (
          <div
            onClick={() => navigate('/dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer' }}
          >
            <img
              src="/logo.png"
              alt="EUNACOM Logo"
              style={{ width: '28px', height: '28px', objectFit: 'contain' }}
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
          </div>
        )}

        <h1 style={{
          fontSize: isMainTab ? '1.15rem' : '1.05rem',
          fontWeight: 800,
          color: 'white',
          margin: 0,
          fontFamily: 'var(--font)',
          letterSpacing: '-0.02em'
        }}>
          {getPageTitle()}
        </h1>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {/* Streak Flame */}
        <div
          onClick={() => navigate('/medlingo')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            background: 'rgba(249, 115, 22, 0.15)',
            border: '1px solid rgba(249, 115, 22, 0.3)',
            borderRadius: '12px',
            padding: '0.3rem 0.55rem',
            cursor: 'pointer'
          }}
        >
          <Flame size={16} color="#f97316" fill="#f97316" />
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#fed7aa' }}>
            {streak}
          </span>
        </div>

        {/* PRO / Upgrade Badge */}
        {!isPremium ? (
          <button
            onClick={() => setShowPaymentModal(true)}
            style={{
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              padding: '0.32rem 0.65rem',
              fontSize: '0.72rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
            }}
          >
            <Sparkles size={13} /> PRO
          </button>
        ) : (
          <div style={{
            background: 'rgba(59, 130, 246, 0.15)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            color: '#38bdf8',
            borderRadius: '10px',
            padding: '0.25rem 0.5rem',
            fontSize: '0.68rem',
            fontWeight: 800,
            textTransform: 'uppercase'
          }}>
            PRO ⭐
          </div>
        )}

        {/* User Avatar */}
        <div
          onClick={() => navigate('/settings')}
          style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <img
            src={avatarImage}
            alt="Doctor Avatar"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid rgba(56, 189, 248, 0.5)'
            }}
          />
          {userProfile && (
            <div style={{ position: 'absolute', bottom: -2, right: -4 }}>
              <UserInstitutionBadge user={userProfile} size={13} />
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
