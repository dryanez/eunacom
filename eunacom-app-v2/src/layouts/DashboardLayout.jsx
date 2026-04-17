import React, { useState, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Sidebar from '../components/Sidebar'
import DashboardHeader from '../components/DashboardHeader'
import Onboarding from '../components/Onboarding'
import DonatePopup from '../components/DonatePopup'
import { fetchUserProfile, saveUserProfile } from '../lib/api'

const DashboardLayout = () => {
    const { user, loading: authLoading } = useAuth()
    const navigate = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [showOnboarding, setShowOnboarding] = useState(false)
    const [profileChecked, setProfileChecked] = useState(false)

    React.useEffect(() => {
        if (authLoading) return
        if (!user) navigate('/login')
    }, [user, authLoading, navigate])

    // Check if user has completed onboarding
    useEffect(() => {
        if (!user) return
        fetchUserProfile(user.id).then(profile => {
            if (!profile || !profile.onboarding_done) {
                setShowOnboarding(true)
            }
            setProfileChecked(true)
        }).catch(() => {
            setProfileChecked(true)
        })
    }, [user])

    const handleOnboardingComplete = async (profileData) => {
        await saveUserProfile(profileData)
        setShowOnboarding(false)
    }

    if (authLoading || !user) return null

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
            {profileChecked && showOnboarding && (
                <Onboarding user={user} onComplete={handleOnboardingComplete} />
            )}
            <DonatePopup />
        </div>
    )
}

export default DashboardLayout
