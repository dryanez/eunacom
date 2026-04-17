import React from 'react'
import { useNavigate } from 'react-router-dom'
import { LogIn, UserPlus, X, Stethoscope } from 'lucide-react'

const LoginGateModal = ({ onClose, message = 'Inicia sesión para acceder al material de estudio.' }) => {
  const navigate = useNavigate()

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(11,17,32,0.85)', backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--surface-800)', borderRadius: 'var(--radius-xl)',
          padding: '2.5rem 2rem', maxWidth: 400, width: '100%',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 40px rgba(19,91,236,0.08)',
          textAlign: 'center', position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 12, right: 12,
            background: 'none', border: 'none', color: 'var(--surface-400)',
            cursor: 'pointer', padding: 4, borderRadius: 4,
          }}
        >
          <X size={18} />
        </button>

        {/* Icon */}
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'rgba(19,91,236,0.15)',
          border: '2px solid rgba(19,91,236,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.25rem',
        }}>
          <Stethoscope size={28} color="var(--primary-400)" />
        </div>

        <h2 style={{
          fontSize: '1.2rem', fontWeight: 800,
          color: 'var(--surface-50)', marginBottom: '0.6rem',
        }}>
          Acceso exclusivo para miembros
        </h2>

        <p style={{
          fontSize: '0.88rem', color: 'var(--surface-300)',
          lineHeight: 1.6, marginBottom: '2rem',
        }}>
          {message}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              padding: '0.8rem 1rem',
              background: 'var(--gradient-primary)', border: 'none',
              borderRadius: 'var(--radius)', color: '#fff',
              fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer',
              fontFamily: 'var(--font)',
            }}
          >
            <LogIn size={18} /> Iniciar Sesión
          </button>

          <button
            onClick={() => navigate('/register')}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              padding: '0.8rem 1rem',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 'var(--radius)', color: 'var(--surface-100)',
              fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer',
              fontFamily: 'var(--font)',
            }}
          >
            <UserPlus size={18} /> Crear cuenta gratis
          </button>
        </div>

        <p style={{ fontSize: '0.75rem', color: 'var(--surface-500)', marginTop: '1.25rem' }}>
          Es completamente gratis. Sin tarjeta de crédito.
        </p>
      </div>
    </div>
  )
}

export default LoginGateModal
