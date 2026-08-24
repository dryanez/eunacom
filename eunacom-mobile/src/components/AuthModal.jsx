import React, { useState, useEffect } from 'react'
import {
  X, Sparkles, CheckCircle2,
  Mail, Lock, User, Eye, EyeOff, ArrowRight,
  ShieldCheck, AlertCircle, Loader2
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function AuthModal({
  isOpen: propIsOpen,
  onClose: propOnClose,
  initialMode = 'register',
  message: propMessage = ''
}) {
  const {
    user,
    authModal,
    closeAuthModal,
    signInWithGoogle,
    signIn,
    signUp,
    createDevTestUser
  } = useAuth()

  const isControlled = propIsOpen !== undefined
  const isOpen = isControlled ? propIsOpen : authModal?.isOpen
  const handleClose = propOnClose || closeAuthModal
  const message = propMessage || authModal?.message || ''

  const targetInitialMode = isControlled ? initialMode : (authModal?.mode || initialMode || 'register')
  const [mode, setMode] = useState(targetInitialMode) // 'register' | 'login'
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  useEffect(() => {
    if (isOpen) {
      const activeMode = isControlled ? (initialMode || 'register') : (authModal?.mode || 'register')
      setMode(activeMode)
      setError(null)
      setSuccessMsg(null)
    }
  }, [isOpen, isControlled, initialMode, authModal?.mode])

  useEffect(() => {
    if (user && isOpen) {
      handleClose()
    }
  }, [user, isOpen, handleClose])

  if (!isOpen) return null

  const handleGoogleAuth = async () => {
    setError(null)
    setLoading(true)
    try {
      const { error: gErr } = await signInWithGoogle()
      if (gErr) setError(gErr.message || 'Error al conectar con Google.')
    } catch (err) {
      setError(err.message || 'Error de autenticación.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)

    if (!email || !password) {
      setError('Por favor completa todos los campos.')
      return
    }

    if (mode === 'register') {
      if (!fullName.trim()) {
        setError('Por favor ingresa tu nombre completo.')
        return
      }
      if (password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres.')
        return
      }
      if (!acceptTerms) {
        setError('Debes aceptar los Términos de Uso.')
        return
      }

      setLoading(true)
      try {
        const { error: sErr } = await signUp({
          email: email.trim().toLowerCase(),
          password,
          options: { data: { full_name: fullName.trim() } }
        })
        if (sErr) throw sErr
        setSuccessMsg('¡Cuenta creada! Revisa tu correo o inicia sesión.')
        setTimeout(() => setMode('login'), 1500)
      } catch (err) {
        setError(err.message || 'Error al crear la cuenta.')
      } finally {
        setLoading(false)
      }
    } else {
      setLoading(true)
      try {
        const { error: logErr } = await signIn({
          email: email.trim().toLowerCase(),
          password
        })
        if (logErr) throw logErr
        handleClose()
      } catch (err) {
        setError(err.message || 'Credenciales incorrectas.')
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div
      className="auth-modal-overlay"
      onClick={handleClose}
      style={{
        inset: 0,
        zIndex: 99999,
        background: 'rgba(5, 10, 20, 0.85)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        overflowY: 'auto'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          maxWidth: '440px',
          width: '100%',
          backgroundColor: 'var(--surface-800, #0f172a)',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Header & Close */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <img src="/logo.png" alt="Logo" style={{ width: '28px', height: '28px', objectFit: 'contain' }} onError={(e) => { e.currentTarget.style.display = 'none' }} />
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>
              EUNACOM
            </span>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Title */}
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'white', margin: 0 }}>
            {mode === 'register' ? 'Crea tu Cuenta Médica' : 'Iniciar Sesión'}
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0.25rem 0 0 0' }}>
            {mode === 'register' ? 'Accede a +650 Masterclasses y banco de preguntas' : 'Continúa tu preparación y sincroniza tu progreso'}
          </p>
        </div>

        {/* Tab Mode Switcher */}
        <div style={{
          display: 'flex',
          background: 'rgba(30, 41, 59, 0.7)',
          padding: '3px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.06)'
        }}>
          <button
            type="button"
            onClick={() => setMode('register')}
            style={{
              flex: 1,
              padding: '0.5rem',
              border: 'none',
              borderRadius: '10px',
              background: mode === 'register' ? '#3b82f6' : 'transparent',
              color: 'white',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'background 0.15s ease'
            }}
          >
            Registrarme
          </button>
          <button
            type="button"
            onClick={() => setMode('login')}
            style={{
              flex: 1,
              padding: '0.5rem',
              border: 'none',
              borderRadius: '10px',
              background: mode === 'login' ? '#3b82f6' : 'transparent',
              color: 'white',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'background 0.15s ease'
            }}
          >
            Ya tengo cuenta
          </button>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={loading}
          style={{
            width: '100%',
            minHeight: '44px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '12px',
            color: 'white',
            fontSize: '0.88rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.6rem',
            cursor: 'pointer'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          Continuar con Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
          <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>o con correo</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
        </div>

        {/* Email / Password Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {mode === 'register' && (
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8' }}>Nombre Completo</label>
              <input
                type="text"
                placeholder="Dr(a). Nombre y Apellido"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '12px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: 'white',
                  fontSize: '0.85rem',
                  marginTop: '3px'
                }}
              />
            </div>
          )}

          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8' }}>Correo Electrónico</label>
            <input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '12px',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: 'white',
                fontSize: '0.85rem',
                marginTop: '3px'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8' }}>Contraseña</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 2.5rem 0.65rem 0.85rem',
                  borderRadius: '12px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: 'white',
                  fontSize: '0.85rem',
                  marginTop: '3px'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '2px'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              background: '#ef444420',
              border: '1px solid #ef444450',
              borderRadius: '10px',
              padding: '0.6rem 0.85rem',
              color: '#fca5a5',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div style={{
              background: '#10b98120',
              border: '1px solid #10b98150',
              borderRadius: '10px',
              padding: '0.6rem 0.85rem',
              color: '#6ee7b7',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}>
              <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '0.25rem',
              width: '100%',
              minHeight: '46px',
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              color: 'white',
              border: 'none',
              borderRadius: '14px',
              fontSize: '0.95rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 16px rgba(59, 130, 246, 0.4)'
            }}
          >
            {loading ? (
              <Loader2 size={18} className="spin" />
            ) : mode === 'register' ? (
              'Crear Cuenta'
            ) : (
              'Entrar a la Plataforma'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
