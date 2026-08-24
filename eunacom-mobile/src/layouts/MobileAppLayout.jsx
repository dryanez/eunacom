import React, { useState, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useSubscription } from '../contexts/SubscriptionContext'
import MobileHeader from '../components/MobileHeader'
import BottomNavigation from '../components/BottomNavigation'
import Onboarding from '../components/Onboarding'
import FounderPopup from '../components/FounderPopup'
import MobilePaywallSheet from '../components/MobilePaywallSheet'
import AuthModal from '../components/AuthModal'
import { fetchUserProfile, saveUserProfile } from '../lib/api'

const LoadingScreen = () => (
  <div style={{
    height: '100dvh',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--surface-900, #0b1120)',
    color: 'white',
    fontFamily: 'var(--font)'
  }}>
    <div className="spin" style={{
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      border: '3px solid rgba(255,255,255,0.1)',
      borderTopColor: '#38bdf8',
      marginBottom: '1rem'
    }} />
    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#94a3b8' }}>Preparando EUNACOM...</div>
  </div>
)

export default function MobileAppLayout() {
  const { user, loading: authLoading } = useAuth()
  const { showPaymentModal, setShowPaymentModal } = useSubscription()
  const navigate = useNavigate()
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [profileChecked, setProfileChecked] = useState(false)

  // Check if user has completed onboarding
  useEffect(() => {
    if (!user) {
      setProfileChecked(true)
      return
    }
    const sessionKey = `onboarding_checked_${user.id}`
    if (sessionStorage.getItem(sessionKey)) {
      setProfileChecked(true)
      return
    }
    fetchUserProfile(user.id).then((profile) => {
      if (!profile || !profile.onboarding_done) {
        setShowOnboarding(true)
      } else {
        sessionStorage.setItem(sessionKey, '1')
      }
      setProfileChecked(true)
    }).catch(() => {
      setShowOnboarding(true)
      setProfileChecked(true)
    })
  }, [user?.id])

  const handleOnboardingComplete = async (profileData) => {
    if (user) {
      await saveUserProfile(profileData)
      sessionStorage.setItem(`onboarding_checked_${user.id}`, '1')
    }
    setShowOnboarding(false)
  }

  if (authLoading || !profileChecked) return <LoadingScreen />

  return (
    <div className="mobile-app-shell">
      {/* Top Mobile Header */}
      <MobileHeader />

      {/* Scrollable Page Content */}
      <main className="mobile-page-content">
        <Outlet />
      </main>

      {/* 5-Tab Bottom Navigation Bar */}
      <BottomNavigation />

      {/* Onboarding Flow */}
      {showOnboarding && (
        <Onboarding user={user} onComplete={handleOnboardingComplete} />
      )}

      {/* Mobbin-Grade Paywall Bottom Sheet */}
      {showPaymentModal && (
        <MobilePaywallSheet onClose={() => setShowPaymentModal(false)} />
      )}

      {/* Mobile Login / Register Modal */}
      <AuthModal />

      {/* Founder Popup */}
      <FounderPopup user={user} />
    </div>
  )
}
