import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Sidebar from '../components/Sidebar'
import DashboardHeader from '../components/DashboardHeader'

// Layout for pages that are visible without login (dashboard, reconstructions list)
// but gate actual content actions behind LoginGateModal inside each page.
const PublicLayout = () => {
  const { loading: authLoading } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  if (authLoading) return null

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

export default PublicLayout
