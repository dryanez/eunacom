import React, { useState, useEffect, useRef, useCallback } from 'react'
import { saveUserProfile } from '../lib/api'
import { ChevronRight, ChevronLeft, User, Calendar, Globe, Phone, Stethoscope, Sparkles } from 'lucide-react'

// ─── TOUR SLIDES ─────────────────────────────────────────────────────────
const SLIDES = [
  {
    title: '¡Bienvenido a EUNACOM Prep! 🎉',
    text: 'Tu plataforma de preparación para el EUNACOM con clases en video, miles de preguntas y un plan de estudio personalizado.',
    selector: null,
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
  const [inscrito, setInscrito] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const slide = SLIDES[slideIdx]
  // Register user early so they appear in admin even before finishing
  useEffect(() => {
    if (!user?.id || !user?.email) return
    saveUserProfile({
      id: user.id,
      email: user.email,
      first_name: '',
      last_name: '',
      onboarding_done: false,
    }).catch(() => {})
  }, [user])

  const updateHighlight = useCallback(() => {
    if (!slide.selector) {
      setHighlightRect(null)
      return
    }

    // On very small screens skip the spotlight — just center the card
    if (window.innerWidth < 500) {
      setHighlightRect(null)
      return
    }

    // Force sidebar open on mobile so elements are visible
    const sidebar = document.querySelector('.sidebar')
    if (sidebar && !sidebar.classList.contains('sidebar--open')) {
      sidebar.classList.add('sidebar--open')
    }

    const el = document.querySelector(slide.selector)
    if (!el) { setHighlightRect(null); return }

    const rect = el.getBoundingClientRect()
    const pad = 6
    const hr = {
      top: rect.top - pad,
      left: rect.left - pad,
      width: rect.width + pad * 2,
      height: rect.height + pad * 2,
    }
    setHighlightRect(hr)

    // Tooltip: right of element on wide screens, below on narrow
    const TW = 320
    const isNarrow = window.innerWidth < 700
    if (isNarrow) {
      const left = Math.max(12, Math.min(window.innerWidth - TW - 12, rect.left))
      const top = Math.min(rect.bottom + 12, window.innerHeight - 200)
      setTooltipPos({ top, left })
    } else {
      const left = rect.right + 20
      const fitsRight = left + TW < window.innerWidth - 12
      setTooltipPos({
        top: Math.max(12, Math.min(rect.top - 20, window.innerHeight - 260)),
        left: fitsRight ? left : rect.left - TW - 20,
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
    if (slideIdx < SLIDES.length - 1) setSlideIdx(slideIdx + 1)
    else setPhase('form')
  }
  const prevSlide = () => { if (slideIdx > 0) setSlideIdx(slideIdx - 1) }

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Por favor ingresa tu nombre.'); return }
    setError('')
    setSaving(true)
    try {
      const parts = name.trim().split(/\s+/)
      const firstName = parts[0] || user.email?.split('@')[0] || 'Estudiante'
      const lastName  = parts.slice(1).join(' ') || null
      await onComplete({
        id: user.id,
        email: user.email,
        first_name: firstName,
        last_name: lastName,
        exam_month: examMonth,
        exam_year: examYear,
        nationality,
        country: nationality,
        whatsapp,
        inscrito_eunacom: inscrito,
        onboarding_done: true,
      })
    } catch (e) {
      console.error('Onboarding save error:', e)
      setError('Error al guardar. Intenta de nuevo.')
    }
    setSaving(false)
  }

  // ─── TOUR PHASE ───────────────────────────────────────────────────────
  if (phase === 'tour') {
    const centered = !highlightRect

    return (
      <>
        {/* Backdrop */}
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9990,
          background: 'rgba(11,17,32,0.75)',
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
            boxShadow: '0 0 0 9999px rgba(11,17,32,0.8), 0 0 30px 4px rgba(19,91,236,0.4)',
            pointerEvents: 'none',
            transition: 'all 0.35s ease',
          }} />
        )}

        {/* Tooltip card */}
        <div style={{
          position: 'fixed',
          zIndex: 9992,
          ...(centered
            ? { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
            : { top: tooltipPos.top, left: tooltipPos.left }
          ),
          background: 'var(--surface-700)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.25rem 1.5rem',
          width: Math.min(340, window.innerWidth - 24),
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          transition: 'all 0.3s ease',
        }}>
          {slideIdx === 0 && (
            <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
              <Stethoscope size={38} color="var(--primary-400)" />
            </div>
          )}

          <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.4rem', paddingRight: '1.5rem', fontFamily: 'var(--font)' }}>
            {slide.title}
          </h3>
          <p style={{ fontSize: '0.84rem', color: 'var(--surface-300)', lineHeight: 1.55, marginBottom: '1rem', fontFamily: 'var(--font)' }}>
            {slide.text}
          </p>

          {/* Progress dots + navigation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '0.3rem' }}>
              {SLIDES.map((_, i) => (
                <div key={i} style={{
                  width: i === slideIdx ? 16 : 6, height: 6,
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

  // ─── FORM PHASE ───────────────────────────────────────────────────────
  return (
    <>
      {/* Backdrop */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9990,
        background: 'rgba(11,17,32,0.88)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
      }} />

      {/* Scrollable container — key fix for mobile/small screens */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9991,
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        display: 'flex',
        alignItems: 'flex-start',   // not center — lets content scroll above fold
        justifyContent: 'center',
        padding: '16px 16px calc(16px + env(safe-area-inset-bottom))',
        paddingTop: 'max(16px, env(safe-area-inset-top))',
      }}>
        <div style={{
          background: 'var(--surface-700)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.75rem 1.5rem',
          maxWidth: 440,
          width: '100%',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          // Small top margin so card isn't glued to top on large screens
          marginTop: 'auto',
          marginBottom: 'auto',
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <Sparkles size={30} color="var(--accent-amber)" style={{ marginBottom: '0.5rem' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.25rem', fontFamily: 'var(--font)' }}>
              Completa tu perfil
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--surface-400)', fontFamily: 'var(--font)' }}>
              Para personalizar tu experiencia
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Name */}
            <div>
              <label htmlFor="ob-name" style={labelStyle}>
                <User size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Nombre completo
              </label>
              <input
                id="ob-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Tu nombre"
                style={inputStyle}
              />
            </div>

            {/* Exam date */}
            <div>
              <label style={labelStyle}>
                <Calendar size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} /> ¿Cuándo das el EUNACOM?
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select
                  value={examMonth}
                  onChange={e => setExamMonth(e.target.value)}
                  style={{ ...inputStyle, flex: 1 }}
                  aria-label="Mes del examen"
                >
                  <option value="Julio">Julio</option>
                  <option value="Diciembre">Diciembre</option>
                </select>
                <select
                  value={examYear}
                  onChange={e => setExamYear(e.target.value)}
                  style={{ ...inputStyle, flex: 1 }}
                  aria-label="Año del examen"
                >
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                </select>
              </div>
            </div>

            {/* Nationality */}
            <div>
              <label htmlFor="ob-country" style={labelStyle}>
                <Globe size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} /> País
              </label>
              <select
                id="ob-country"
                value={nationality}
                onChange={e => setNationality(e.target.value)}
                style={inputStyle}
              >
                {['Chile','Argentina','Colombia','Perú','Venezuela','Ecuador','Bolivia','México','Otro'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* WhatsApp */}
            <div>
              <label htmlFor="ob-wa" style={labelStyle}>
                <Phone size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} /> WhatsApp <span style={{ fontWeight: 400, color: 'var(--surface-400)' }}>(opcional)</span>
              </label>
              <input
                id="ob-wa"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={whatsapp}
                onChange={e => setWhatsapp(e.target.value)}
                placeholder="+56 9 1234 5678"
                style={inputStyle}
              />
            </div>

            {/* Inscrito */}
            <div>
              <label style={labelStyle}>¿Ya estás inscrito/a en el EUNACOM?</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['Sí', 'No', 'Aún no sé'].map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setInscrito(opt)}
                    style={{
                      flex: 1, textAlign: 'center', cursor: 'pointer',
                      padding: '0.6rem 0.25rem',
                      minHeight: 44,
                      background: inscrito === opt ? 'rgba(19,91,236,0.2)' : 'var(--surface-600)',
                      border: inscrito === opt ? '1.5px solid var(--primary-400)' : '1px solid var(--surface-500)',
                      borderRadius: 'var(--radius)',
                      color: inscrito === opt ? 'var(--primary-300)' : 'var(--surface-200)',
                      fontWeight: inscrito === opt ? 700 : 500,
                      fontSize: '0.82rem',
                      fontFamily: 'var(--font)',
                      transition: 'all 0.15s',
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p style={{ marginTop: '0.75rem', fontSize: '0.82rem', color: 'var(--danger-400)', textAlign: 'center' }}>
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving || !name.trim()}
            style={{
              ...btnPrimary,
              width: '100%',
              justifyContent: 'center',
              marginTop: '1.5rem',
              padding: '0.85rem',
              fontSize: '0.95rem',
              minHeight: 48,
              opacity: !name.trim() ? 0.5 : 1,
              cursor: (!name.trim() || saving) ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'Guardando...' : '¡Empezar a estudiar! 🚀'}
          </button>
        </div>
      </div>
    </>
  )
}

// ─── Shared styles ────────────────────────────────────────────────────────
const btnPrimary = {
  display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
  padding: '0.6rem 1rem', background: 'var(--gradient-primary)',
  color: '#fff', border: 'none', borderRadius: 'var(--radius)',
  fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
  fontFamily: 'var(--font)', minHeight: 44,
}
const btnSecondary = {
  display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
  padding: '0.6rem 0.75rem', background: 'var(--surface-600)',
  color: 'var(--surface-300)', border: 'none', borderRadius: 'var(--radius)',
  fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
  fontFamily: 'var(--font)', minHeight: 44,
}
const labelStyle = {
  display: 'block', fontSize: '0.82rem', fontWeight: 700,
  color: 'var(--surface-200)', marginBottom: '0.4rem', fontFamily: 'var(--font)',
}
const inputStyle = {
  width: '100%', padding: '0.65rem 0.75rem',
  background: 'var(--surface-600)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 'var(--radius)',
  color: 'var(--surface-100)', fontSize: '1rem',  // 1rem = no iOS zoom on focus
  fontFamily: 'var(--font)', outline: 'none', boxSizing: 'border-box',
  minHeight: 44,
}

export default Onboarding
