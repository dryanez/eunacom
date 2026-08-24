import React, { useState, useEffect } from 'react'

const AFFIRMATIONS = [
  '¡Lo harás muy bien en el EUNACOM!',
  'Cada pregunta te acerca más a tu meta.',
  'La constancia es la clave del éxito.',
  'Confía en tu preparación.',
  '¡Estás más cerca de lo que crees!',
  'Tu esfuerzo vale la pena.',
  'Un médico más para Chile.',
  '¡Tú puedes con esto!',
]

const HeartbeatIcon = () => (
  <svg viewBox="0 0 80 40" width="120" height="60" style={{ overflow: 'visible' }}>
    <polyline
      points="0,20 15,20 22,4 29,36 36,20 45,20 52,8 58,32 64,20 80,20"
      fill="none"
      stroke="url(#hbGrad)"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ animation: 'hb-draw 2s ease-in-out infinite' }}
    />
    <defs>
      <linearGradient id="hbGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#135bec" />
        <stop offset="100%" stopColor="#06b6d4" />
      </linearGradient>
    </defs>
  </svg>
)

const LoadingScreen = ({ message = 'Cargando…', context = 'test' }) => {
  const [affirmIdx, setAffirmIdx] = useState(() => Math.floor(Math.random() * AFFIRMATIONS.length))
  const [fade, setFade] = useState(true)
  const [dots, setDots] = useState(1)

  useEffect(() => {
    const anim = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setAffirmIdx(i => (i + 1) % AFFIRMATIONS.length)
        setFade(true)
      }, 400)
    }, 3000)
    return () => clearInterval(anim)
  }, [])

  useEffect(() => {
    const d = setInterval(() => setDots(n => n === 3 ? 1 : n + 1), 500)
    return () => clearInterval(d)
  }, [])

  const contextMsg = context === 'clases'
    ? 'Preparando tus clases'
    : context === 'test'
    ? 'Cargando tus preguntas'
    : message.replace(/…$/, '')

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--surface-900)',
      zIndex: 9999,
      gap: '2rem',
    }}>
      {/* Glowing ring */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(19,91,236,0.18) 0%, transparent 70%)',
          position: 'absolute',
          animation: 'ls-pulse 2s ease-in-out infinite',
        }} />
        <div style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'var(--surface-800)',
          border: '2px solid rgba(19,91,236,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 30px rgba(19,91,236,0.2)',
        }}>
          <HeartbeatIcon />
        </div>
      </div>

      {/* Text block */}
      <div style={{ textAlign: 'center', maxWidth: 320 }}>
        <div style={{
          fontSize: '1rem',
          fontWeight: 600,
          color: 'var(--surface-200)',
          marginBottom: '0.4rem',
          letterSpacing: '0.01em',
        }}>
          {contextMsg}<span style={{ opacity: 0.6 }}>{'•'.repeat(dots)}</span>
        </div>

        <div style={{
          fontSize: '0.85rem',
          color: 'var(--primary-300)',
          fontStyle: 'italic',
          transition: 'opacity 0.4s ease',
          opacity: fade ? 1 : 0,
          minHeight: '1.4em',
        }}>
          {AFFIRMATIONS[affirmIdx]}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        width: 200,
        height: 3,
        borderRadius: 99,
        background: 'var(--surface-700)',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          borderRadius: 99,
          background: 'linear-gradient(90deg, #135bec, #06b6d4)',
          animation: 'ls-bar 1.8s ease-in-out infinite',
        }} />
      </div>
    </div>
  )
}

export default LoadingScreen
