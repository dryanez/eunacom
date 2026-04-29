import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import AuthLayout from './layouts/AuthLayout'
import DashboardLayout from './layouts/DashboardLayout'
import PublicLayout from './layouts/PublicLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import TestCreator from './pages/TestCreator'
import History from './pages/History'
import StudyPlan from './pages/StudyPlan'
import FelipeCalendar from './pages/FelipeCalendar'
import Stats from './pages/Stats'
import Simulation from './pages/Simulation'
import TestRunner from './pages/TestRunner'
import Register from './pages/Register'
import MisClases from './pages/MisClases'
import Biblioteca from './pages/Biblioteca'
import ScriptProgress from './pages/ScriptProgress'
import AdminUsers from './pages/AdminUsers'
import Reconstructions from './pages/Reconstructions'
import './index.css'

function StudyPlanRoute() {
  const { user } = useAuth()
  return user?.email === 'dr.felipeyanez@gmail.com' ? <FelipeCalendar /> : <StudyPlan />
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Public Routes — visible without login, content gated inside each page */}
          <Route element={<PublicLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/reconstructions" element={<Reconstructions />} />
            <Route path="/mis-clases" element={<MisClases />} />
            <Route path="/test" element={<TestCreator />} />
          </Route>

          {/* Protected Routes — require login */}
          <Route element={<DashboardLayout />}>
            <Route path="/study-plan" element={<StudyPlanRoute />} />
            <Route path="/simulation" element={<Simulation />} />
            <Route path="/test-runner" element={<TestRunner />} />
            <Route path="/history" element={<History />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/flashcards" element={<div className="page"><h1 className="page__title">Flashcards</h1></div>} />
            <Route path="/review" element={<div className="page"><h1 className="page__title">Repasar Errores</h1></div>} />
            <Route path="/biblioteca" element={<Biblioteca />} />
            <Route path="/script-progress" element={<ScriptProgress />} />
            <Route path="/admin/users" element={<AdminUsers />} />
          </Route>

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
