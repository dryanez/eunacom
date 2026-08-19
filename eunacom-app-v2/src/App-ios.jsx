import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { SubscriptionProvider } from './contexts/SubscriptionContext'
import AuthLayout from './layouts/AuthLayout'
import DashboardLayoutIOS from './layouts/DashboardLayout-ios'
import PublicLayoutIOS from './layouts/PublicLayout-ios'
import LoginIOS from './pages/Login-ios'
import Dashboard from './pages/Dashboard'
import TestCreator from './pages/TestCreator'
import History from './pages/History'
import FelipeCalendar from './pages/FelipeCalendar'
import Stats from './pages/Stats'
import Simulation from './pages/Simulation'
import TestRunner from './pages/TestRunner'
import RegisterIOS from './pages/Register-ios'
import Offer from './pages/Offer'
import MisClases from './pages/MisClases'
import Biblioteca from './pages/Biblioteca'
import ScriptProgress from './pages/ScriptProgress'
import AdminUsers from './pages/AdminUsers'
import Reconstructions from './pages/Reconstructions'
import StudyGuides from './pages/StudyGuides'
import ReviewErrors from './pages/ReviewErrors'
import UserSettings from './pages/UserSettings'
import OfflineBanner from './components/OfflineBanner'

// Import the iOS-specific CSS (which imports index.css itself)
import './ios.css'

function App() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <BrowserRouter>
      {isOffline && <OfflineBanner />}
      <AuthProvider>
        <SubscriptionProvider>
          <Routes>
            {/* Auth Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginIOS />} />
              <Route path="/register" element={<RegisterIOS />} />
            </Route>

            {/* Public Routes — visible without login, content gated inside each page */}
            <Route element={<PublicLayoutIOS />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/reconstructions" element={<Reconstructions />} />
              <Route path="/mis-clases" element={<MisClases />} />
              <Route path="/test" element={<TestCreator />} />
              <Route path="/oferta" element={<Offer />} />
            </Route>

            {/* Protected Routes — require login */}
            <Route element={<DashboardLayoutIOS />}>
              <Route path="/study-plan" element={<FelipeCalendar />} />
              <Route path="/simulation" element={<Simulation />} />
              <Route path="/test-runner" element={<TestRunner />} />
              <Route path="/history" element={<History />} />
              <Route path="/stats" element={<Stats />} />
              <Route path="/review" element={<ReviewErrors />} />
              <Route path="/biblioteca" element={<Biblioteca />} />
              <Route path="/script-progress" element={<ScriptProgress />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/study-guides" element={<StudyGuides />} />
              <Route path="/settings" element={<UserSettings />} />
            </Route>

            {/* Default Route */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </SubscriptionProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
