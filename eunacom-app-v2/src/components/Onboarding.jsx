import React, { useState, useEffect, useRef, useCallback } from 'react'
import { saveUserProfile } from '../lib/api'
import { ChevronRight, ChevronLeft, X, User, Calendar, Globe, Phone, Stethoscope, Sparkles } from 'lucide-react'

// ─── TOUR SLIDES ─────────────────────────────────────────────────────────
const SLIDES = [
  {
    title: '¡Bienvenido a EUNACOM Prep! 🎉',
    text: 'Tu plataforma de preparación para el EUNACOM con clases en video, miles de preguntas y un plan de estudio personalizado.',
    selector: null, // Welcome slide — no highlight
  },
  {
    title: 'Inicio',
    text: 'Tu panel principal con estadísticas, ranking, racha de estudio y progreso diario.',
    selector: '[data-tour="dashboard"]',
  },
  {
    title: 'Plan de Estudio',
    text: 'Un calendario personalizado que distribuye todas las materias hasta tu examen. ¡Sigue el plan y no te quedes atrás!',
    selector: '[data-tour="study-plan"]',
  },
  {
    title: 'Crear Examen',
    text: 'Crea exámenes por materia, cantidad de preguntas y dificultad. Incluye modo tutor con explicaciones.',
    selector: '[data-tour="test"]',
  },
  {
    title: 'Estadísticas',
    text: 'Revisa tu rendimiento por materia, identifica temas débiles y mide tu progreso.',
    selector: '[data-tour="stats"]',
  },
  {
    title: 'Mis Clases',
    text: 'Más de 500 clases en video organizadas por módulo y tema. Cada clase tiene quiz integrado.',
    selector: '[data-tour="mis-clases"]',
  },
]

// ─── COMPONENT ───────────────────────────────────────────────────────────
const Onboarding = ({ user, onComplete }) => {
  const [phase, setPhase] = useState('tour') // 'tour' | 'form'
  const [slideIdx, setSlideIdx] = useState(0)
  const [highlightRect, setHighlightRect] = useState(null)
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 })

  // Form state
  const [name, setName] = useState('')
  const [examMonth, setExamMonth] = useState('Julio')
  const [examYear, setExamYear] = useState('2026')
  const [nationality, setNationality] = useState('Chile')
  const [whatsapp, setWhatsapp] = useState('')
  const [saving, setSaving] = useState(false)

  const slide = SLIDES[slideIdx]

  // ─── Highlight sidebar element ───
  const updateHighlight = useCallback(() => {
    if (!slide.selector) {
      setHighlightRect(null)
      return
    }

    // Force sidebar open on mobile
    const sidebar = document.querySelector('.sidebar')
    if (sidebar && !sidebar.classList.contains('sidebar--open')) {
      sidebar.classList.add('sidebar--open')
    }

    const el = document.querySelector(slide.selector)
    if (!el) {
      setHighlightRect(null)
      return
    }

    const rect = el.getBoundingClientRect()
    const pad = 6
    setHighlightRect({
      top: rect.top - pad,
      left: rect.left - pad,
      width: rect.width + pad * 2,
      height: rect.height + pad * 2,
    })

    // Position tooltip to the right of the element, or below on narrow screens
    const isNarrow = window.innerWidth < 700
    if (isNarrow) {
      setTooltipPos({
        top: rect.bottom + 16,
        left: Math.max(16, Math.min(window.innerWidth - 340, rect.left)),
      })
    } else {
      setTooltipPos({
        top: Math.max(16, rect.top - 20),
        left: rect.right + 20,
      })
    }
  }, [slide])

  useEffect(() => {
    if (phase !== 'tour') return
    updateHighlight()
    window.addEventListener('resize', updateHighlight)
    return () => window.removeEventListener('resize', updateHighlight)
  }, [phase, slideIdx, updateHighlight])

  const nextSlide = () => {
    if (slideIdx < SLIDES.length - 1) {
      setSlideIdx(slideIdx + 1)
    } else {
      setPhase('form')
    }
  }
  const prevSlide = () => { if (slideIdx > 0) setSlideIdx(slideIdx - 1) }

  const handleSubmit = async () => {
    setSaving(true)
    try {
      await onComplete({
        userId: user.id,
        email: user.email,
        displayName: name || user.email?.split('@')[0] || 'Estudiante',
        examMonth,
        examYear,
        nationality,
        whatsapp,
        onboardingDone: true,
      })
    } catch (e) {
      console.error('Onboarding save error:', e)
    }
    setSaving(false)
  }

  // ─── TOUR PHASE ───
  if (phase === 'tour') {
    return (
      <>
        {/* Backdrop */}
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9990,
          background: 'rgba(11,17,32,0.7)',
          transition: 'opacity 0.3s',
        }} />

        {/* Spotlight cutout */}
        {highlightRect && (
          <div style={{
            position: 'fixed',
            top: highlightRect.top,
            left: highlightRect.left,
            width: highlightRect.width,
            height: highlightRect.height,
            zIndex: 9991,
            borderRadius: 'var(--radius)',
            boxShadow: '0 0 0 9999px rgba(11,17,32,0.75), 0 0 30px 4px rgba(19,91,236,0.4)',
            pointerEvents: 'none',
            transition: 'all 0.35s ease',
          }} />
        )}

        {/* Tooltip / card */}
        <div style={{
          position: 'fixed',
          top: highlightRect ? tooltipPos.top : '50%',
          left: highlightRect ? tooltipPos.left : '50%',
          transform: highlightRect ? 'none' : 'translate(-50%, -50%)',
          zIndex: 9992,
          background: 'var(--surface-700)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.5rem',
          maxWidth: 340,
          width: highlightRect ? 320 : '90vw',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          transition: 'all 0.35s ease',
        }}>
          {/* Skip button */}
          <button onClick={() => setPhase('form')} style={{
            position: 'absolute', top: 10, right: 10, background: 'none',
            border: 'none', color: 'var(--surface-400)', cursor: 'pointer',
          }}>
            <X size={16} />
          </button>

          {/* Slide content */}
          {slideIdx === 0 && (
            <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
              <Stethoscope size={40} color="var(--primary-400)" />
            </div>
          )}
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.5rem', fontFamily: 'var(--font)' }}>
            {slide.title}
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--surface-300)', lineHeight: 1.5, marginBottom: '1rem', fontFamily: 'var(--font)' }}>
            {slide.text}
          </p>

          {/* Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '0.3rem' }}>
              {SLIDES.map((_, i) => (
                <div key={i} style={{
                  width: i === slideIdx ? 18 : 6, height: 6,
                  borderRadius: 'var(--radius-full)',
                  background: i === slideIdx ? 'var(--primary-400)' : 'var(--surface-500)',
                  transition: 'all 0.2s',
                }} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {slideIdx > 0 && (
                <button onClick={prevSlide} style={btnSecondary}>
                  <ChevronLeft size={14} /> Atrás
                </button>
              )}
              <button onClick={nextSlide} style={btnPrimary}>
                {slideIdx === SLIDES.length - 1 ? 'Completar perfil' : 'Siguiente'} <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }

  // ─── FORM PHASE ───
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9990,
      background: 'rgba(11,17,32,0.85)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{
        background: 'var(--surface-700)', borderRadius: 'var(--radius-xl)',
        padding: '2rem', maxWidth: 440, width: '100%',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <Sparkles size={32} color="var(--accent-amber)" style={{ marginBottom: '0.5rem' }} />
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.25rem', fontFamily: 'var(--font)' }}>
            Completa tu perfil
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--surface-400)', fontFamily: 'var(--font)' }}>
            Para personalizar tu experiencia
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Name */}
          <div>
            <label style={labelStyle}><User size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Nombre</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="Tu nombre" style={inputStyle} />
          </div>

          {/* Exam date */}
          <div>
            <label style={labelStyle}><Calendar size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> ¿Cuándo das el EUNACOM?</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select value={examMonth} onChange={e => setExamMonth(e.target.value)} style={{ ...inputStyle, flex: 1 }}>
                <option value="Julio">Julio</option>
                <option value="Diciembre">Diciembre</option>
              </select>
              <select value={examYear} onChange={e => setExamYear(e.target.value)} style={{ ...inputStyle, flex: 1 }}>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
              </select>
            </div>
          </div>

          {/* Nationality */}
          <div>
            <label style={labelStyle}><Globe size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> País</label>
            <select value={nationality} onChange={e => setNationality(e.target.value)} style={inputStyle}>
              {['Chile','Argentina','Colombia','Perú','Venezuela','Ecuador','Bolivia','México','Otro'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* WhatsApp */}
          <div>
            <label style={labelStyle}><Phone size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> WhatsApp (opcional)</label>
            <input type="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value)}
              placeholder="+56 9 1234 5678" style={inputStyle} />
          </div>
        </div>

        <button onClick={handleSubmit} disabled={saving || !name.trim()} style={{
          ...btnPrimary, width: '100%', justifyContent: 'center', marginTop: '1.5rem',
          padding: '0.75rem', fontSize: '0.95rem',
          opacity: !name.trim() ? 0.5 : 1,
        }}>
          {saving ? 'Guardando...' : '¡Empezar a estudiar! 🚀'}
        </button>
      </div>
    </div>
  )
}

// ─── Shared styles ──────────────────────────────────────────────────────
const btnPrimary = {
  display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
  padding: '0.5rem 1rem', background: 'var(--gradient-primary)',
  color: '#fff', border: 'none', borderRadius: 'var(--radius)',
  fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'var(--font)',
}
const btnSecondary = {
  display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
  padding: '0.5rem 0.75rem', background: 'var(--surface-600)',
  color: 'var(--surface-300)', border: 'none', borderRadius: 'var(--radius)',
  fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'var(--font)',
}
const labelStyle = {
  display: 'block', fontSize: '0.82rem', fontWeight: 700,
  color: 'var(--surface-200)', marginBottom: '0.4rem', fontFamily: 'var(--font)',
}
const inputStyle = {
  width: '100%', padding: '0.6rem 0.75rem', background: 'var(--surface-600)',
  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius)',
  color: 'var(--surface-100)', fontSize: '0.9rem', fontFamily: 'var(--font)',
  outline: 'none', boxSizing: 'border-box',
}

export default Onboarding
