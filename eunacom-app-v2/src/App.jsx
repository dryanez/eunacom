import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import AuthLayout from './layouts/AuthLayout'
import DashboardLayout from './layouts/DashboardLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import TestCreator from './pages/TestCreator'
import History from './pages/History'
import StudyPlan from './pages/StudyPlan'
import Stats from './pages/Stats'
import Simulation from './pages/Simulation'
import TestRunner from './pages/TestRunner'
import Register from './pages/Register'
import MisClases from './pages/MisClases'
import Biblioteca from './pages/Biblioteca'
import ScriptProgress from './pages/ScriptProgress'
import './index.css'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Protected Routes */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            {/* Fallbacks for side menu */}
            <Route path="/study-plan" element={<StudyPlan />} />
            <Route path="/test" element={<TestCreator />} />
            <Route path="/simulation" element={<Simulation />} />
            <Route path="/test-runner" element={<TestRunner />} />
            <Route path="/history" element={<History />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/flashcards" element={<div className="page"><h1 className="page__title">Flashcards</h1></div>} />
            <Route path="/review" element={<div className="page"><h1 className="page__title">Repasar Errores</h1></div>} />
            <Route path="/mis-clases" element={<MisClases />} />
            <Route path="/biblioteca" element={<Biblioteca />} />
            <Route path="/script-progress" element={<ScriptProgress />} />
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
