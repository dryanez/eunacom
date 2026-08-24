import React, { useState, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import SidebarIOS from '../components/Sidebar-ios'
import DashboardHeader from '../components/DashboardHeader'
import Onboarding from '../components/Onboarding'
import FounderPopup from '../components/FounderPopup'
import { fetchUserProfile, saveUserProfile } from '../lib/api'

// Simple full screen loader for iOS
const LoadingScreen = () => (
  <div style={{
    height: '100dvh', width: '100%', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', background: 'var(--surface-800)',
    color: 'white', fontFamily: 'var(--font)'
  }}>
    <div className="spin" style={{
      width: '40px', height: '40px', borderRadius: '50%',
      border: '3px solid rgba(255,255,255,0.1)',
      borderTopColor: '#3b82f6', marginBottom: '1rem'
    }} />
    <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>Cargando...</div>
  </div>
)

const DashboardLayoutIOS = () => {
    const { user, loading: authLoading } = useAuth()
    const navigate = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [showOnboarding, setShowOnboarding] = useState(false)
    const [profileChecked, setProfileChecked] = useState(false)

    useEffect(() => {
        if (authLoading) return
        if (!user) navigate('/login')
    }, [user, authLoading, navigate])

    // Check if user has completed onboarding — only once per session
    useEffect(() => {
        if (!user) return
        // If already checked this session, don't re-fetch
        const sessionKey = `onboarding_checked_${user.id}`
        if (sessionStorage.getItem(sessionKey)) {
            setProfileChecked(true)
            return
        }
        fetchUserProfile(user.id).then(profile => {
            if (!profile || !profile.onboarding_done) {
                setShowOnboarding(true)
            } else {
                // Mark as checked so we never re-fetch this session
                sessionStorage.setItem(sessionKey, '1')
            }
            setProfileChecked(true)
        }).catch(() => {
            setShowOnboarding(true)
            setProfileChecked(true)
        })
    }, [user?.id])

    const handleOnboardingComplete = async (profileData) => {
        await saveUserProfile(profileData)
        sessionStorage.setItem(`onboarding_checked_${user.id}`, '1')
        setShowOnboarding(false)
    }

    if (authLoading || !user) return <LoadingScreen />
    // Don't render the app until we know whether onboarding is needed
    if (!profileChecked) return <LoadingScreen />

    return (
        <div className="app-layout">
            <SidebarIOS mobileOpen={mobileOpen} onToggle={() => setMobileOpen(false)} />
            {mobileOpen && (
                <div
                    onClick={() => setMobileOpen(false)}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999 }}
                    className="sidebar-backdrop"
                />
            )}
            <main className="main-content">
                <DashboardHeader onMenuToggle={() => setMobileOpen(!mobileOpen)} />
                <div className="page">
                    <Outlet />
                </div>
            </main>
            {showOnboarding && (
                <Onboarding user={user} onComplete={handleOnboardingComplete} />
            )}
            <FounderPopup user={user} />
        </div>
    )
}

export default DashboardLayoutIOS
