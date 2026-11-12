import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { SubscriptionProvider } from './contexts/SubscriptionContext'
import { ThemeProvider } from './contexts/ThemeContext'
import AuthLayout from './layouts/AuthLayout'
import DashboardLayout from './layouts/DashboardLayout'
import PublicLayout from './layouts/PublicLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import TestCreator from './pages/TestCreator'
import History from './pages/History'
import FelipeCalendar from './pages/FelipeCalendar'
import Stats from './pages/Stats'
import Flashcards from './pages/Flashcards'
import Simulation from './pages/Simulation'
import TestRunner from './pages/TestRunner'
import Register from './pages/Register'
import Offer from './pages/Offer'
import MisClases from './pages/MisClases'
import ClasesV3 from './pages/ClasesV3'
import Biblioteca from './pages/Biblioteca'
import Links from './pages/Links'
import Regalo from './pages/Regalo'
import ScriptProgress from './pages/ScriptProgress'
import AdminUsers from './pages/AdminUsers'
import Reconstructions from './pages/Reconstructions'
import StudyGuides from './pages/StudyGuides'
import ReviewErrors from './pages/ReviewErrors'
import StudioHub from './pages/StudioHub'
import DeckRunner from './slides/DeckRunner'
import UserSettings from './pages/UserSettings'
import MedLingoPage from './pages/MedLingoPage'
// SEO Public pages
import LandingPage from './pages/LandingPage'
import FAQ from './pages/FAQ'
import Reembolsos from './pages/Reembolsos'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import CursoComparativa from './pages/CursoComparativa'
import SimulacrosLanding from './pages/SimulacrosLanding'
import GuiaCompletaLanding from './pages/GuiaCompletaLanding'
import ReconstruccionesLanding from './pages/ReconstruccionesLanding'
import ReconJulio2026 from './pages/ReconJulio2026'
import ConveniosLanding from './pages/ConveniosLanding'
import Privacidad from './pages/Privacidad'
import EliminarCuenta from './pages/EliminarCuenta'
import LibroGordo, { LibroGordoRunner } from './pages/LibroGordo'
import { useAuth } from './contexts/AuthContext'
import AuthModal from './components/AuthModal'
import CyberWeekPopup from './components/CyberWeekPopup'
import './index.css'
const DevPaywall = React.lazy(() => import('./components/Paywall')) // solo en desarrollo: /dev/paywall

const AdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth()
  const isExport = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('export') === 'true'
  const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || import.meta.env.DEV)
  if (isExport || isLocal) return children // Allows local development & headless CLI video rendering
  if (loading) return null
  if (!user || !isAdmin()) {
    return <Navigate to="/dashboard" replace />
  }
  return children
}

// Browsers with an older cached build open email offer links (/oferta?discount=…) with the old
// Offer page, which jumped to /dashboard?discount=…; send those visits back to the offer page.
function DashboardDiscountRoute() {
  const { search } = useLocation()
  if (new URLSearchParams(search).has('discount')) return <Navigate to={`/oferta${search}`} replace />
  return <Dashboard />
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <SubscriptionProvider>
            <AuthModal />
            <CyberWeekPopup />
            <Routes>
              {/* ── SEO Public Pages (no layout wrapper, standalone) ── */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/curso-eunacom-2026" element={<CursoComparativa />} />
              <Route path="/simulacros-eunacom" element={<SimulacrosLanding />} />
              <Route path="/guia-eunacom-2026" element={<GuiaCompletaLanding />} />
              <Route path="/reconstrucciones-eunacom" element={<ReconstruccionesLanding />} />
              <Route path="/reconstruccion-julio-2026" element={<ReconJulio2026 />} />
              <Route path="/convenios" element={<ConveniosLanding />} />
              <Route path="/privacidad" element={<Privacidad />} />
              <Route path="/politica-de-privacidad" element={<Privacidad />} />
              <Route path="/eliminar-cuenta" element={<EliminarCuenta />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/reembolsos" element={<Reembolsos />} />
              {import.meta.env.DEV && <Route path="/dev/paywall" element={<React.Suspense fallback={null}><DevPaywall onClose={() => window.history.back()} /></React.Suspense>} />}
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />

              {/* ── Admin-Only Presentation Engine & Studio Hub (Fullscreen) ── */}
              <Route path="/deck/:classId" element={
                <AdminRoute>
                  <DeckRunner />
                </AdminRoute>
              } />
              <Route path="/studio" element={
                <AdminRoute>
                  <StudioHub />
                </AdminRoute>
              } />

              <Route path="/links" element={<Links />} />
              <Route path="/regalo/:slug" element={<Regalo />} />
              {/* Libros Gordos online: modo bloqueado, sin layout ni menú */}
              <Route path="/libro-gordo/:token" element={<LibroGordo />} />
              <Route path="/libro-gordo/:token/examen" element={<LibroGordoRunner />} />
              {/* ── Auth Routes ── */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>

              {/* ── Public App Pages ── */}
              <Route element={<PublicLayout />}>
                <Route path="/dashboard" element={<DashboardDiscountRoute />} />
                <Route path="/medlingo" element={<MedLingoPage />} />
                <Route path="/racha" element={<MedLingoPage />} />
                <Route path="/reconstructions" element={<Reconstructions />} />
                <Route path="/mis-clases" element={<ClasesV3 />} />
                <Route path="/mis-clases/:spec" element={<ClasesV3 />} />
                <Route path="/mis-clases/:spec/test/:n" element={<ClasesV3 />} />
                <Route path="/mis-clases/:spec/:id" element={<ClasesV3 />} />
                <Route path="/clases-guevara" element={<MisClases />} />
                <Route path="/test" element={<TestCreator />} />
                <Route path="/simulation" element={<Simulation />} />
                <Route path="/oferta" element={<Offer />} />
                <Route path="/planes" element={<Offer />} />
                <Route path="/biblioteca" element={<Biblioteca />} />
                <Route path="/libros" element={<Biblioteca />} />
              </Route>

              {/* ── Protected Routes — require login ── */}
              <Route element={<DashboardLayout />}>
                <Route path="/study-plan" element={<FelipeCalendar />} />
                <Route path="/test-runner" element={<TestRunner />} />
                <Route path="/history" element={<History />} />
                <Route path="/stats" element={<Stats />} />
                <Route path="/flashcards" element={<Flashcards />} />
                <Route path="/review" element={<ReviewErrors />} />
                <Route path="/script-progress" element={<ScriptProgress />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/study-guides" element={<StudyGuides />} />
                <Route path="/settings" element={<UserSettings />} />
                <Route path="/configuracion" element={<UserSettings />} />
                <Route path="/mi-plan" element={<UserSettings />} />
              </Route>

              {/* ── Catch-all ── */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </SubscriptionProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
