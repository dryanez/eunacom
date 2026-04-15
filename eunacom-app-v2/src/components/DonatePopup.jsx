import React, { useState, useEffect } from 'react'
import { Heart, X, Gift } from 'lucide-react'

const DONATION_LINKS = [
  { name: 'PayPal', url: 'https://www.paypal.com/donate/?hosted_button_id=R8LN5TXP8XYNG', emoji: '💳' },
  { name: 'Mercado Pago (Chile)', url: 'https://link.mercadopago.cl/donacioneunacom', emoji: '🟡' },
]

const DonatePopup = () => {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Only show once per session — check sessionStorage
    try {
      if (sessionStorage.getItem('donate_popup_shown') === '1') return
    } catch { /* ignore */ }

    // Show after 30s of use (let them settle in first)
    const timer = setTimeout(() => {
      setShow(true)
      try { sessionStorage.setItem('donate_popup_shown', '1') } catch {}
    }, 30000)

    return () => clearTimeout(timer)
  }, [])

  if (!show) return null

  return (
    <div
      onClick={() => setShow(false)}
      style={{
        position: 'fixed', inset: 0, zIndex: 9990,
        background: 'rgba(11,17,32,0.85)', backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem', animation: 'fadeIn 0.3s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--surface-700)', borderRadius: 'var(--radius-xl)',
          padding: '2.5rem 2rem', maxWidth: 440, width: '100%',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 40px rgba(19,91,236,0.1)',
          textAlign: 'center', position: 'relative',
        }}
      >
        {/* Close button */}
        <button
          onClick={() => setShow(false)}
          style={{
            position: 'absolute', top: 12, right: 12,
            background: 'var(--surface-600)', border: 'none',
            borderRadius: 'var(--radius-full)', width: 28, height: 28,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--surface-300)',
          }}
        >
          <X size={14} />
        </button>

        {/* Heart icon with pulse */}
        <div style={{
          display: 'inline-flex', padding: '1rem', borderRadius: 'var(--radius-full)',
          background: 'rgba(239,68,68,0.1)', marginBottom: '1.25rem',
        }}>
          <Heart size={40} color="var(--accent-red)" fill="var(--accent-red)" style={{ animation: 'pulse 2s infinite' }} />
        </div>

        <h2 style={{
          fontSize: '1.3rem', fontWeight: 800, color: 'var(--surface-50)',
          marginBottom: '0.5rem', fontFamily: 'var(--font)',
        }}>
          ¡Ayúdanos a seguir siendo gratis!
        </h2>

        <p style={{
          fontSize: '0.9rem', color: 'var(--surface-300)', lineHeight: 1.7,
          marginBottom: '0.75rem', fontFamily: 'var(--font)',
        }}>
          EUNACOM-Examen es <strong style={{ color: 'var(--surface-100)' }}>100% gratuito</strong> para todos. 
          Mantenemos +9,000 preguntas, clases y estadísticas sin cobrar un peso.
        </p>

        <div style={{
          background: 'rgba(19,91,236,0.08)', borderRadius: 'var(--radius)',
          padding: '0.75rem 1rem', marginBottom: '1.25rem',
          border: '1px solid rgba(19,91,236,0.15)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Gift size={16} color="var(--primary-300)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-300)', fontFamily: 'var(--font)' }}>
              Beneficio especial
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--surface-200)', fontFamily: 'var(--font)', margin: 0, lineHeight: 1.5 }}>
            Todos los que donen tendrán la app <strong>gratis de por vida</strong>, incluso cuando comencemos a cobrar después de Julio 2026.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
          {DONATION_LINKS.map(d => (
            <a
              key={d.name}
              href={d.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                padding: '0.75rem 1rem', background: 'var(--gradient-primary)',
                borderRadius: 'var(--radius)', color: '#fff', fontWeight: 700,
                fontSize: '0.95rem', textDecoration: 'none', fontFamily: 'var(--font)',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = 'var(--shadow-glow)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <span>{d.emoji}</span> Donar con {d.name}
            </a>
          ))}
        </div>

        <button
          onClick={() => setShow(false)}
          style={{
            background: 'none', border: 'none', color: 'var(--surface-400)',
            fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'var(--font)',
            textDecoration: 'underline', padding: '0.5rem',
          }}
        >
          Quizás más tarde
        </button>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
      `}</style>
    </div>
  )
}

export default DonatePopup
