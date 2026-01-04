import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import LandingPage from './pages/LandingPage'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import TestEngine from './pages/TestEngine'
import TestHistory from './pages/TestHistory'
import AdminPanel from './pages/AdminPanel'
import TestRunner from './pages/TestRunner'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/app-landing" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/test" element={<TestEngine />} />
          <Route path="/history" element={<TestHistory />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/test-runner/:id" element={<TestRunner />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App

