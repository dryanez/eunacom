import React, { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Sidebar from '../components/Sidebar'
import DashboardHeader from '../components/DashboardHeader'
import Onboarding from '../components/Onboarding'
import { fetchUserProfile, saveUserProfile } from '../lib/api'

// Layout for pages that are visible without login (dashboard, reconstructions list)
// but gate actual content actions behind LoginGateModal inside each page.
const PublicLayout = () => {
  const { user, loading: authLoading } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [profileChecked, setProfileChecked] = useState(false)

  // If a user is logged in, check if they completed onboarding
  useEffect(() => {
    if (!user) { setProfileChecked(true); return }
    fetchUserProfile(user.id).then(profile => {
      if (!profile || !profile.onboarding_done) {
        setShowOnboarding(true)
      }
      setProfileChecked(true)
    }).catch(() => {
      setShowOnboarding(true)
      setProfileChecked(true)
    })
  }, [user])

  const handleOnboardingComplete = async (profileData) => {
    await saveUserProfile(profileData)
    setShowOnboarding(false)
  }

  if (authLoading || !profileChecked) return null

  return (
    <div className="app-layout">
      <Sidebar mobileOpen={mobileOpen} onToggle={() => setMobileOpen(false)} />
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999 }}
          className="sidebar-backdrop"
        />
      )}
      <div className="main-content">
        <DashboardHeader onMenuToggle={() => setMobileOpen(!mobileOpen)} />
        <div className="page">
          <Outlet />
        </div>
      </div>
      {showOnboarding && (
        <Onboarding user={user} onComplete={handleOnboardingComplete} />
      )}
    </div>
  )
}

export default PublicLayout
