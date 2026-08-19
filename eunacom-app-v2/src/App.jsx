import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { SubscriptionProvider } from './contexts/SubscriptionContext'
import AuthLayout from './layouts/AuthLayout'
import DashboardLayout from './layouts/DashboardLayout'
import PublicLayout from './layouts/PublicLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import TestCreator from './pages/TestCreator'
import History from './pages/History'
import FelipeCalendar from './pages/FelipeCalendar'
import Stats from './pages/Stats'
import Simulation from './pages/Simulation'
import TestRunner from './pages/TestRunner'
import Register from './pages/Register'
import Offer from './pages/Offer'
import MisClases from './pages/MisClases'
import Biblioteca from './pages/Biblioteca'
import ScriptProgress from './pages/ScriptProgress'
import AdminUsers from './pages/AdminUsers'
import Reconstructions from './pages/Reconstructions'
import StudyGuides from './pages/StudyGuides'
import ReviewErrors from './pages/ReviewErrors'
// SEO Public pages
import LandingPage from './pages/LandingPage'
import FAQ from './pages/FAQ'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import CursoComparativa from './pages/CursoComparativa'
import SimulacrosLanding from './pages/SimulacrosLanding'
import GuiaCompletaLanding from './pages/GuiaCompletaLanding'
import ReconstruccionesLanding from './pages/ReconstruccionesLanding'
import ConveniosLanding from './pages/ConveniosLanding'
import AuthModal from './components/AuthModal'
import './index.css'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SubscriptionProvider>
          <AuthModal />
          <Routes>
            {/* ── SEO Public Pages (no layout wrapper, standalone) ── */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/curso-eunacom-2026" element={<CursoComparativa />} />
            <Route path="/simulacros-eunacom" element={<SimulacrosLanding />} />
            <Route path="/guia-eunacom-2026" element={<GuiaCompletaLanding />} />
            <Route path="/reconstrucciones-eunacom" element={<ReconstruccionesLanding />} />
            <Route path="/convenios" element={<ConveniosLanding />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />

            {/* ── Auth Routes ── */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* ── Public Routes — visible without login, content gated inside each page ── */}
            <Route element={<PublicLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/reconstructions" element={<Reconstructions />} />
              <Route path="/mis-clases" element={<MisClases />} />
              <Route path="/test" element={<TestCreator />} />
              <Route path="/simulation" element={<Simulation />} />
              <Route path="/oferta" element={<Offer />} />
            </Route>

            {/* ── Protected Routes — require login ── */}
            <Route element={<DashboardLayout />}>
              <Route path="/study-plan" element={<FelipeCalendar />} />
              <Route path="/test-runner" element={<TestRunner />} />
              <Route path="/history" element={<History />} />
              <Route path="/stats" element={<Stats />} />
              <Route path="/flashcards" element={<div className="page"><h1 className="page__title">Flashcards</h1></div>} />
              <Route path="/review" element={<ReviewErrors />} />
              <Route path="/biblioteca" element={<Biblioteca />} />
              <Route path="/script-progress" element={<ScriptProgress />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/study-guides" element={<StudyGuides />} />
            </Route>

            {/* ── Catch-all ── */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </SubscriptionProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
