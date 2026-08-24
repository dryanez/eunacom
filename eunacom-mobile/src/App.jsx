import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { SubscriptionProvider } from './contexts/SubscriptionContext'
import { ThemeProvider } from './contexts/ThemeContext'
import AuthLayout from './layouts/AuthLayout'
import MobileAppLayout from './layouts/MobileAppLayout'
import LoginIOS from './pages/Login-ios'
import RegisterIOS from './pages/Register-ios'
import Dashboard from './pages/Dashboard'
import MisClases from './pages/MisClases'
import MobilePracticeHub from './pages/MobilePracticeHub'
import MedLingoPage from './pages/MedLingoPage'
import UserSettings from './pages/UserSettings'
import TestCreator from './pages/TestCreator'
import TestRunner from './pages/TestRunner'
import Simulation from './pages/Simulation'
import Reconstructions from './pages/Reconstructions'
import ReviewErrors from './pages/ReviewErrors'
import History from './pages/History'
import Stats from './pages/Stats'
import FelipeCalendar from './pages/FelipeCalendar'
import StudyGuides from './pages/StudyGuides'
import Biblioteca from './pages/Biblioteca'
import ScriptProgress from './pages/ScriptProgress'
import AdminUsers from './pages/AdminUsers'
import Offer from './pages/Offer'
import OfflineBanner from './components/OfflineBanner'

// Import Mobile Native Stylesheet
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
      <ThemeProvider>
        <AuthProvider>
          <SubscriptionProvider>
            <Routes>
              {/* Auth Routes */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginIOS />} />
                <Route path="/register" element={<RegisterIOS />} />
              </Route>

              {/* Core Mobile App Layout */}
              <Route element={<MobileAppLayout />}>
                {/* 5 Mobbin-Standard Core Tabs */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/mis-clases" element={<MisClases />} />
                <Route path="/practica" element={<MobilePracticeHub />} />
                <Route path="/medlingo" element={<MedLingoPage />} />
                <Route path="/settings" element={<UserSettings />} />

                {/* Sub-routes & Practice Features */}
                <Route path="/test" element={<TestCreator />} />
                <Route path="/test-runner" element={<TestRunner />} />
                <Route path="/simulation" element={<Simulation />} />
                <Route path="/reconstructions" element={<Reconstructions />} />
                <Route path="/review" element={<ReviewErrors />} />
                <Route path="/history" element={<History />} />
                <Route path="/stats" element={<Stats />} />
                <Route path="/study-plan" element={<FelipeCalendar />} />
                <Route path="/study-guides" element={<StudyGuides />} />
                <Route path="/oferta" element={<Offer />} />

                {/* Admin/Internal Tools */}
                <Route path="/biblioteca" element={<Biblioteca />} />
                <Route path="/script-progress" element={<ScriptProgress />} />
                <Route path="/admin/users" element={<AdminUsers />} />
              </Route>

              {/* Default Redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </SubscriptionProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
