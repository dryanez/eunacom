import React, { useState, useEffect } from 'react'
import {
  X, Sparkles, CheckCircle2,
  Mail, Lock, User, Eye, EyeOff, ArrowRight,
  ShieldCheck, HelpCircle, AlertCircle
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const AuthModal = ({
  isOpen: propIsOpen,
  onClose: propOnClose,
  initialMode = 'register',
  message: propMessage = ''
}) => {
  const {
    user,
    authModal,
    closeAuthModal,
    signInWithGoogle,
    signIn,
    signUp
  } = useAuth()

  // Determine whether we are controlled via props or global authModal context
  const isControlled = propIsOpen !== undefined
  const isOpen = isControlled ? propIsOpen : authModal.isOpen
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

  // Sync mode strictly whenever the modal opens or the requested mode changes
  useEffect(() => {
    if (isOpen) {
      const activeMode = isControlled ? (initialMode || 'register') : (authModal?.mode || 'register')
      setMode(activeMode)
      setError(null)
      setSuccessMsg(null)
    }
  }, [isOpen, isControlled, initialMode, authModal?.mode])

  // Auto-close if user is logged in
  useEffect(() => {
    if (user && isOpen) {
      handleClose()
    }
  }, [user, isOpen, handleClose])

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleClose])

  if (!isOpen) return null

  const handleGoogleAuth = async () => {
    setError(null)
    setLoading(true)
    try {
      const { error } = await signInWithGoogle()
      if (error) {
        setError(error.message || 'Error al conectar con Google.')
      }
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
      setError('Por favor completa todos los campos requeridos.')
      return
    }

    if (mode === 'register') {
      if (!fullName.trim()) {
        setError('Por favor ingresa tu nombre completo.')
        return
      }
      if (password.length < 8) {
        setError('La contraseña debe tener al menos 8 caracteres.')
        return
      }
      if (!acceptTerms) {
        setError('Debes aceptar los Términos de Uso y la Política de Privacidad.')
        return
      }

      setLoading(true)
      try {
        const { data, error } = await signUp(email.trim(), password, fullName.trim())
        if (error) {
          if (error.message.includes('already registered')) {
            setError('Este correo ya está registrado. Por favor inicia sesión.')
          } else {
            setError(error.message)
          }
        } else {
          if (data?.session) {
            handleClose()
          } else {
            setSuccessMsg('¡Cuenta creada con éxito! Si es necesario, verifica el enlace enviado a tu correo.')
          }
        }
      } catch (err) {
        setError(err.message || 'Error al crear la cuenta.')
      } finally {
        setLoading(false)
      }
    } else {
      // Login mode
      setLoading(true)
      try {
        const { data, error } = await signIn(email.trim(), password)
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setError('Correo o contraseña incorrectos.')
          } else {
            setError(error.message)
          }
        } else {
          if (data?.session) {
            handleClose()
          }
        }
      } catch (err) {
        setError(err.message || 'Error al iniciar sesión.')
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div
      onClick={handleClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(5, 9, 20, 0.88)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        overflowY: 'auto',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          maxWidth: '920px',
          width: '100%',
          backgroundColor: '#ffffff',
          borderRadius: '26px',
          overflow: 'hidden',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.6), 0 0 50px rgba(2, 132, 199, 0.2)',
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 1fr) minmax(360px, 1.15fr)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          margin: 'auto',
          animation: 'authModalPop 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className="auth-modal-grid"
      >
        {/* Inline CSS for responsive grid & animation */}
        <style>{`
          @keyframes authModalPop {
            0% { transform: scale(0.96) translateY(10px); opacity: 0; }
            100% { transform: scale(1) translateY(0); opacity: 1; }
          }
          @media (max-width: 768px) {
            .auth-modal-grid {
              grid-template-columns: 1fr !important;
              max-width: 460px !important;
              border-radius: 22px !important;
            }
            .auth-modal-left {
              display: none !important;
            }
            .auth-modal-mobile-brand {
              display: flex !important;
            }
            .auth-modal-right {
              padding: 2rem 1.4rem !important;
            }
          }
          @media (min-width: 769px) {
            .auth-modal-mobile-brand {
              display: none !important;
            }
          }
        `}</style>

        {/* ── LEFT COLUMN: BRAND & VALUE PROPOSITION (DESKTOP) ── */}
        <div
          className="auth-modal-left"
          style={{
            background: 'linear-gradient(170deg, #091124 0%, #060c1c 100%)',
            backgroundImage: `
              radial-gradient(rgba(255, 255, 255, 0.13) 1.2px, transparent 1.2px),
              linear-gradient(170deg, #091124 0%, #060c1c 100%)
            `,
            backgroundSize: '20px 20px, 100% 100%',
            padding: '2.6rem 2.25rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            color: '#ffffff',
            position: 'relative',
            borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          {/* Top Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
              <img
                src="/logo.png"
                alt="Dr. EUNACOM Logo"
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: '11px',
                  objectFit: 'contain',
                  background: 'rgba(255,255,255,0.06)',
                  padding: '2px',
                  border: '1.5px solid rgba(56, 189, 248, 0.4)',
                  boxShadow: '0 0 16px rgba(56, 189, 248, 0.3)',
                }}
              />
              <div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Dr.</span> <span style={{ color: '#38bdf8' }}>EUNACOM</span>
                </div>
                <div style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 500 }}>
                  Tu camino hacia la aprobación
                </div>
              </div>
            </div>

            {/* Headline */}
            <h2
              style={{
                fontSize: '1.65rem',
                fontWeight: 800,
                lineHeight: 1.25,
                letterSpacing: '-0.03em',
                marginBottom: '1rem',
                color: '#ffffff',
              }}
            >
              No todos los temas valen lo mismo.
            </h2>

            {/* Description */}
            <p
              style={{
                fontSize: '0.86rem',
                lineHeight: 1.6,
                color: '#cbd5e1',
                marginBottom: '2rem',
              }}
            >
              Medicina Interna es el 37% del examen; Salud Pública, el 5%. La IA cruza esa ponderación con tus áreas débiles y te arma el plan de hoy, razonando sobre las Guías Clínicas GES/MINSAL y la evidencia internacional vigente.
            </p>
          </div>

          {/* Bottom Highlight Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* Card 1 */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                padding: '0.85rem 1rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                backdropFilter: 'blur(8px)',
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: 2,
                }}
              >
                <CheckCircle2 size={16} color="#34d399" />
              </div>
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#f8fafc', marginBottom: 2 }}>
                  Guías GES/MINSAL + evidencia internacional
                </div>
                <div style={{ fontSize: '0.76rem', color: '#94a3b8', lineHeight: 1.45 }}>
                  La evidencia internacional te da el fundamento; las guías chilenas, el criterio con que te van a evaluar.
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                padding: '0.85rem 1rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                backdropFilter: 'blur(8px)',
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: 2,
                }}
              >
                <CheckCircle2 size={16} color="#34d399" />
              </div>
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#f8fafc', marginBottom: 2 }}>
                  Alineado al Perfil de Conocimientos v3
                </div>
                <div style={{ fontSize: '0.76rem', color: '#94a3b8', lineHeight: 1.45 }}>
                  El nuevo temario del EUNACOM, vigente desde el examen de diciembre 2026.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: FORM & ACTIONS (DESKTOP & MOBILE) ── */}
        <div
          className="auth-modal-right"
          style={{
            padding: '2.5rem 2.25rem',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            backgroundColor: '#ffffff',
          }}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            aria-label="Cerrar modal"
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
              cursor: 'pointer',
              transition: 'all 0.2s',
              zIndex: 10,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#e2e8f0'
              e.currentTarget.style.color = '#0f172a'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f1f5f9'
              e.currentTarget.style.color = '#64748b'
            }}
          >
            <X size={18} />
          </button>

          {/* Mobile-Only Brand Header Pill */}
          <div
            className="auth-modal-mobile-brand"
            style={{
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '1rem',
            }}
          >
            <img src="/logo.png" alt="Logo" style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'contain' }} />
            <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>
              Dr. <span style={{ color: '#0284c7' }}>EUNACOM</span>
            </span>
          </div>

          {/* Form Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            <h2
              style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                color: '#0f172a',
                letterSpacing: '-0.02em',
                marginBottom: '0.35rem',
              }}
            >
              {mode === 'register' ? 'Crear Cuenta' : 'Iniciar Sesión'}
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0 }}>
              {message || (mode === 'register'
                ? 'Únete a la plataforma de estudio más avanzada de Chile.'
                : 'Inicia sesión para continuar con tu preparación.')}
            </p>
          </div>

          {/* Top Promo Badge */}
          {mode === 'register' && (
            <div
              style={{
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: '12px',
                padding: '0.65rem 1rem',
                textAlign: 'center',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: '#065f46',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
              }}
            >
              <span>🎁</span> <span>Empieza tus 3 días gratis. Sin tarjeta de crédito.</span>
            </div>
          )}

          {/* Google Auth Button */}
          <button
            onClick={handleGoogleAuth}
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              backgroundColor: '#ffffff',
              border: '1.5px solid #e2e8f0',
              borderRadius: '12px',
              color: '#1e293b',
              fontWeight: 700,
              fontSize: '0.92rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              cursor: loading ? 'wait' : 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              marginBottom: '1.25rem',
              minHeight: '46px',
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#f8fafc'
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#ffffff'
            }}
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              style={{ width: 18, height: 18 }}
            />
            <span>{mode === 'register' ? 'Registrarse con Google' : 'Continuar con Google'}</span>
          </button>

          {/* Divider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              textAlign: 'center',
              marginBottom: '1.25rem',
              color: '#94a3b8',
              fontSize: '0.78rem',
              fontWeight: 500,
            }}
          >
            <div style={{ flex: 1, height: 1, backgroundColor: '#e2e8f0' }} />
            <span style={{ padding: '0 12px' }}>
              {mode === 'register' ? 'O regístrate con tu correo' : 'O inicia sesión con tu correo'}
            </span>
            <div style={{ flex: 1, height: 1, backgroundColor: '#e2e8f0' }} />
          </div>

          {/* Error / Success Alerts */}
          {error && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '10px',
                padding: '0.65rem 0.85rem',
                color: '#b91c1c',
                fontSize: '0.82rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div
              style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '10px',
                padding: '0.65rem 0.85rem',
                color: '#15803d',
                fontSize: '0.82rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {/* Full Name (Register only) */}
            {mode === 'register' && (
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                    display: 'flex',
                  }}
                >
                  <User size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Nombre completo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.6rem',
                    borderRadius: '12px',
                    border: '1.5px solid #e2e8f0',
                    fontSize: '0.9rem',
                    color: '#1e293b',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box',
                    minHeight: '46px',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
                  onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
                />
              </div>
            )}

            {/* Email */}
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                  display: 'flex',
                }}
              >
                <Mail size={18} />
              </div>
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.6rem',
                  borderRadius: '12px',
                  border: '1.5px solid #e2e8f0',
                  fontSize: '0.9rem',
                  color: '#1e293b',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box',
                  minHeight: '46px',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
                onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
              />
            </div>

            {/* Password */}
            <div>
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                    display: 'flex',
                  }}
                >
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={mode === 'register' ? 'Contraseña (mín. 8 caracteres)' : 'Tu contraseña'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  style={{
                    width: '100%',
                    padding: '0.75rem 2.6rem 0.75rem 2.6rem',
                    borderRadius: '12px',
                    border: '1.5px solid #e2e8f0',
                    fontSize: '0.9rem',
                    color: '#1e293b',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box',
                    minHeight: '46px',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
                  onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    display: 'flex',
                    padding: 4,
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Helper text for register */}
              {mode === 'register' && (
                <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.35rem', marginLeft: '0.25rem' }}>
                  Mínimo 8 caracteres · Evita contraseñas comunes
                </div>
              )}
            </div>

            {/* Terms Checkbox (Register only) */}
            {mode === 'register' && (
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                  fontSize: '0.76rem',
                  color: '#475569',
                  cursor: 'pointer',
                  marginTop: '0.2rem',
                }}
              >
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  style={{ marginTop: 2, accentColor: '#3b82f6' }}
                />
                <span>
                  He leído y acepto los <span style={{ color: '#2563eb', fontWeight: 600 }}>Términos de Uso</span> y la{' '}
                  <span style={{ color: '#2563eb', fontWeight: 600 }}>Política de Privacidad</span>.
                </span>
              </label>
            )}

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.82rem 1.5rem',
                backgroundColor: '#7c9bf5',
                backgroundImage: 'linear-gradient(135deg, #7c9bf5 0%, #6382f7 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '0.96rem',
                fontWeight: 700,
                cursor: loading ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 14px rgba(99, 130, 247, 0.35)',
                transition: 'all 0.2s',
                marginTop: '0.4rem',
                minHeight: '46px',
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.filter = 'brightness(1.05)'
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.filter = 'none'
              }}
            >
              <span>{loading ? 'Procesando...' : mode === 'register' ? 'Crear Cuenta' : 'Iniciar Sesión'}</span>
              <ArrowRight size={18} />
            </button>
          </form>

          {/* Mode Switcher Link */}
          <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.84rem', color: '#64748b' }}>
            {mode === 'register' ? (
              <span>
                ¿Ya tienes cuenta?{' '}
                <button
                  onClick={() => setMode('login')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2563eb',
                    fontWeight: 700,
                    cursor: 'pointer',
                    padding: 0,
                    fontSize: 'inherit',
                  }}
                >
                  Inicia Sesión
                </button>
              </span>
            ) : (
              <span>
                ¿No tienes cuenta?{' '}
                <button
                  onClick={() => setMode('register')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2563eb',
                    fontWeight: 700,
                    cursor: 'pointer',
                    padding: 0,
                    fontSize: 'inherit',
                  }}
                >
                  Crear Cuenta gratis
                </button>
              </span>
            )}
          </div>

          {/* Support Link */}
          <div style={{ textAlign: 'center', marginTop: '0.85rem' }}>
            <a
              href="mailto:contacto@eunacom.cl?subject=Soporte%20EUNACOM"
              style={{
                fontSize: '0.78rem',
                color: '#64748b',
                textDecoration: 'none',
                fontWeight: 500,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#0f172a')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
            >
              ¿Necesitas ayuda? <span style={{ textDecoration: 'underline' }}>Contactar Soporte</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthModal
