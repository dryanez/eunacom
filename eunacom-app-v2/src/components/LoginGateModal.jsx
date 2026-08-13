import React, { useState } from 'react'
import { X, Stethoscope, Sparkles, LogIn } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const LoginGateModal = ({ onClose, message = 'Inicia sesión para acceder al material de estudio.' }) => {
  const { signInWithGoogle } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleGoogle = async () => {
    setLoading(true)
    await signInWithGoogle()
    setLoading(false)
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(7, 10, 20, 0.88)', backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative',
          background: 'linear-gradient(135deg, rgba(15,23,42,0.98) 0%, rgba(19,31,60,0.98) 100%)',
          borderRadius: '24px',
          padding: '2.75rem 2rem', maxWidth: 440, width: '100%',
          border: '1.5px solid rgba(56, 189, 248, 0.4)',
          boxShadow: '0 25px 70px rgba(0,0,0,0.7), 0 0 45px rgba(6,182,212,0.25)',
          textAlign: 'center', overflow: 'hidden'
        }}
      >
        {/* Subtle glowing ambient orb background */}
        <div style={{
          position: 'absolute', top: '-30px', left: '50%', transform: 'translateX(-50%)',
          width: '200px', height: '120px',
          background: 'radial-gradient(ellipse at center, rgba(56, 189, 248, 0.3) 0%, rgba(19, 91, 236, 0.15) 50%, transparent 80%)',
          filter: 'blur(25px)', pointerEvents: 'none'
        }} />

        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16,
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#94a3b8',
            cursor: 'pointer', padding: 6, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s ease', zIndex: 10
          }}
        >
          <X size={18} />
        </button>

        {/* Hero Stethoscope Badge */}
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2) 0%, rgba(19, 91, 236, 0.25) 100%)',
          border: '2px solid rgba(56, 189, 248, 0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.25rem',
          boxShadow: '0 0 25px rgba(6, 182, 212, 0.3)',
          position: 'relative'
        }}>
          <Stethoscope size={34} color="#38bdf8" />
        </div>

        {/* Top Pill Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          padding: '0.3rem 0.8rem', borderRadius: '100px',
          background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.3)',
          color: '#38bdf8', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.04em',
          marginBottom: '1rem', textTransform: 'uppercase'
        }}>
          <Sparkles size={13} /> Preparación EUNACOM
        </div>

        <h2 style={{
          fontSize: '1.4rem', fontWeight: 800,
          color: '#ffffff', marginBottom: '0.6rem', letterSpacing: '-0.02em'
        }}>
          Únete gratis y prepara tu EUNACOM
        </h2>

        <p style={{
          fontSize: '0.9rem', color: '#94a3b8',
          lineHeight: 1.6, marginBottom: '2rem',
        }}>
          {message}
        </p>

        <button
          onClick={handleGoogle}
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.9rem 1.5rem',
            background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
            color: '#ffffff',
            borderRadius: '100px',
            fontWeight: 700,
            fontSize: '1rem',
            border: 'none',
            boxShadow: '0 8px 25px rgba(6, 182, 212, 0.4)',
            cursor: loading ? 'wait' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: 22, height: 22, background: '#fff', borderRadius: '50%', padding: 2 }} />
          {loading ? 'Redirigiendo...' : 'Crear cuenta gratis con Google'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '1.25rem' }}>
          <a href="/login" style={{ fontSize: '0.85rem', color: '#38bdf8', textDecoration: 'underline', fontWeight: 600 }}>
            ¿Ya tienes cuenta? Iniciar sesión
          </a>
        </div>

        <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '1rem' }}>
          100% Gratis · Sin tarjeta de crédito
        </p>
      </div>
    </div>
  )
}

export default LoginGateModal
