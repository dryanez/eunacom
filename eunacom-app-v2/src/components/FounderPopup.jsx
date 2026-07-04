import React, { useState, useEffect } from 'react'
import { Heart, X, Sparkles } from 'lucide-react'
import { fetchUserProfile } from '../lib/api'

const FounderPopup = ({ user }) => {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!user?.id) return

    // Check if already shown
    const storageKey = `founder_thank_you_v2_${user.id}`
    if (localStorage.getItem(storageKey)) return

    // Only show to founder users (plan_months === 1200)
    fetchUserProfile(user.id).then(profile => {
      if (profile?.plan_months === 1200) {
        // Show after a small delay to not collide with other UI things
        setTimeout(() => setShow(true), 2000)
      }
    }).catch(console.error)
  }, [user?.id])

  if (!show) return null

  const handleClose = () => {
    localStorage.setItem(`founder_thank_you_v2_${user.id}`, '1')
    setShow(false)
  }

  return (
    <div
      onClick={handleClose}
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
          boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 40px rgba(234,179,8,0.2)',
          textAlign: 'center', position: 'relative',
        }}
      >
        <button
          onClick={handleClose}
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

        <div style={{
          display: 'inline-flex', padding: '1rem', borderRadius: 'var(--radius-full)',
          background: 'rgba(234,179,8,0.1)', marginBottom: '1.25rem',
        }}>
          <Sparkles size={40} color="var(--accent-amber)" style={{ animation: 'pulse 2s infinite' }} />
        </div>

        <h2 style={{
          fontSize: '1.3rem', fontWeight: 800, color: 'var(--surface-50)',
          marginBottom: '0.5rem', fontFamily: 'var(--font)',
        }}>
          ¡Muchas gracias, Founder!
        </h2>

        <p style={{
          fontSize: '0.95rem', color: 'var(--surface-200)', lineHeight: 1.6,
          marginBottom: '1rem', fontFamily: 'var(--font)',
        }}>
          Por tu generosa donación, ahora eres <strong>Miembro Premium de por vida</strong>. 
          Tu apoyo fue fundamental para mantener EUNACOM Prep vivo en sus inicios.
        </p>

        <div style={{
          background: 'rgba(19,91,236,0.08)', borderRadius: 'var(--radius)',
          padding: '1rem', marginBottom: '1.5rem',
          border: '1px solid rgba(19,91,236,0.15)',
        }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--primary-300)', fontFamily: 'var(--font)', margin: 0, fontStyle: 'italic', fontWeight: 600 }}>
            "Todo lo puedo en Cristo que me fortalece."<br/>
            <span style={{ fontSize: '0.8rem', color: 'var(--primary-400)', fontWeight: 400 }}>- Filipenses 4:13</span>
          </p>
        </div>

        <p style={{
          fontSize: '1rem', color: 'var(--surface-100)', fontWeight: 700,
          marginBottom: '1.5rem', fontFamily: 'var(--font)',
        }}>
          ¡Mucho éxito en tu examen, tú puedes lograrlo! 💪
        </p>

        <button
          onClick={handleClose}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            padding: '0.85rem 2rem', background: 'var(--gradient-primary)',
            borderRadius: 'var(--radius)', color: '#fff', fontWeight: 700,
            fontSize: '1rem', cursor: 'pointer', border: 'none',
            fontFamily: 'var(--font)', width: '100%',
          }}
        >
          ¡A estudiar!
        </button>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
      `}</style>
    </div>
  )
}

export default FounderPopup
