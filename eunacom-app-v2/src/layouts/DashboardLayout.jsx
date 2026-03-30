import React, { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Sidebar from '../components/Sidebar'
import DashboardHeader from '../components/DashboardHeader'

const DashboardLayout = () => {
    const { user, loading: authLoading } = useAuth()
    const navigate = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)

    React.useEffect(() => {
        if (authLoading) return
        if (!user) navigate('/login')
    }, [user, authLoading, navigate])

    if (authLoading || !user) return null

    return (
        <div className="app-layout">
            <Sidebar mobileOpen={mobileOpen} onToggle={() => setMobileOpen(false)} />
            <div className="main-content">
                <DashboardHeader onMenuToggle={() => setMobileOpen(!mobileOpen)} />
                <div className="page">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}

export default DashboardLayout
