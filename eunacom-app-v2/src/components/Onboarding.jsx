import React, { useState } from 'react'
import { ChevronRight, ChevronLeft, FileText, BarChart3, Video, Target, CheckCircle, Heart } from 'lucide-react'

// Country codes for WhatsApp dropdown
const COUNTRY_CODES = [
  { code: '+56', country: 'Chile', flag: '🇨🇱' },
  { code: '+54', country: 'Argentina', flag: '🇦🇷' },
  { code: '+57', country: 'Colombia', flag: '🇨🇴' },
  { code: '+51', country: 'Perú', flag: '🇵🇪' },
  { code: '+52', country: 'México', flag: '🇲🇽' },
  { code: '+593', country: 'Ecuador', flag: '🇪🇨' },
  { code: '+58', country: 'Venezuela', flag: '🇻🇪' },
  { code: '+591', country: 'Bolivia', flag: '🇧🇴' },
  { code: '+595', country: 'Paraguay', flag: '🇵🇾' },
  { code: '+598', country: 'Uruguay', flag: '🇺🇾' },
  { code: '+506', country: 'Costa Rica', flag: '🇨🇷' },
  { code: '+507', country: 'Panamá', flag: '🇵🇦' },
  { code: '+502', country: 'Guatemala', flag: '🇬🇹' },
  { code: '+503', country: 'El Salvador', flag: '🇸🇻' },
  { code: '+504', country: 'Honduras', flag: '🇭🇳' },
  { code: '+505', country: 'Nicaragua', flag: '🇳🇮' },
  { code: '+53', country: 'Cuba', flag: '🇨🇺' },
  { code: '+1', country: 'Rep. Dominicana', flag: '🇩🇴' },
  { code: '+34', country: 'España', flag: '🇪🇸' },
  { code: '+1', country: 'Estados Unidos', flag: '🇺🇸' },
  { code: '+55', country: 'Brasil', flag: '🇧🇷' },
]

const COUNTRIES = [
  'Chile', 'Argentina', 'Colombia', 'Perú', 'México', 'Ecuador', 'Venezuela',
  'Bolivia', 'Paraguay', 'Uruguay', 'Costa Rica', 'Panamá', 'Guatemala',
  'El Salvador', 'Honduras', 'Nicaragua', 'Cuba', 'República Dominicana',
  'España', 'Estados Unidos', 'Brasil', 'Otro'
]

const NATIONALITIES = [
  'Chilena', 'Argentina', 'Colombiana', 'Peruana', 'Mexicana', 'Ecuatoriana',
  'Venezolana', 'Boliviana', 'Paraguaya', 'Uruguaya', 'Costarricense',
  'Panameña', 'Guatemalteca', 'Salvadoreña', 'Hondureña', 'Nicaragüense',
  'Cubana', 'Dominicana', 'Española', 'Estadounidense', 'Brasileña', 'Otra'
]

// Tour slides showing app features
const TOUR_SLIDES = [
  {
    icon: <Target size={48} color="var(--primary-400)" />,
    title: '¡Bienvenido a EUNACOM-Examen!',
    desc: 'Tu plataforma integral de preparación para el EUNACOM. Te guiaremos por las funciones principales.',
    highlight: null,
  },
  {
    icon: <FileText size={48} color="var(--primary-400)" />,
    title: 'Banco de Preguntas',
    desc: 'Accede a +9,000 preguntas organizadas por especialidad. Crea exámenes personalizados o practica con pruebas oficiales reconstruidas.',
    highlight: 'exams',
  },
  {
    icon: <Video size={48} color="var(--accent-teal)" />,
    title: 'Clases y Videos',
    desc: 'Clases organizadas por subsistema con puntos clave, quiz interactivo y acceso al Banco EUNACOM de cada especialidad.',
    highlight: 'clases',
  },
  {
    icon: <BarChart3 size={48} color="var(--accent-green)" />,
    title: 'Estadísticas Detalladas',
    desc: 'Sigue tu progreso por especialidad, identifica tus puntos débiles y mejora con cada sesión de estudio.',
    highlight: 'stats',
  },
  {
    icon: <Heart size={48} color="var(--accent-red)" />,
    title: 'Modo Tutor con IA',
    desc: 'Recibe explicaciones personalizadas después de cada pregunta. Aprende de tus errores en tiempo real.',
    highlight: 'tutor',
  },
]

const currentYear = new Date().getFullYear()
const EXAM_YEARS = [String(currentYear), String(currentYear + 1), String(currentYear + 2)]

const Onboarding = ({ user, onComplete }) => {
  const [step, setStep] = useState('tour') // 'tour' | 'form'
  const [tourSlide, setTourSlide] = useState(0)

  // Form state
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [examMonth, setExamMonth] = useState('')
  const [examYear, setExamYear] = useState(String(currentYear))
  const [prepMonths, setPrepMonths] = useState('')
  const [nationality, setNationality] = useState('')
  const [country, setCountry] = useState('')
  const [countryCode, setCountryCode] = useState('+56')
  const [whatsapp, setWhatsapp] = useState('')
  const [saving, setSaving] = useState(false)

  const handleTourNext = () => {
    if (tourSlide < TOUR_SLIDES.length - 1) {
      setTourSlide(tourSlide + 1)
    } else {
      setStep('form')
    }
  }

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) return
    setSaving(true)
    try {
      await onComplete({
        id: user.id,
        email: user.email,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        exam_month: examMonth,
        exam_year: examYear,
        prep_months: prepMonths,
        nationality,
        country,
        country_code: countryCode,
        whatsapp: whatsapp.trim(),
        onboarding_done: true,
      })
    } finally {
      setSaving(false)
    }
  }

  const slide = TOUR_SLIDES[tourSlide]

  // ─── Tour view ───
  if (step === 'tour') {
    return (
      <div style={styles.overlay}>
        <div style={styles.card}>
          {/* Progress dots */}
          <div style={styles.dots}>
            {TOUR_SLIDES.map((_, i) => (
              <div key={i} style={{
                ...styles.dot,
                background: i === tourSlide ? 'var(--primary-400)' : 'var(--surface-600)',
                width: i === tourSlide ? '24px' : '8px',
              }} />
            ))}
          </div>

          <div style={styles.iconBox}>{slide.icon}</div>
          <h2 style={styles.title}>{slide.title}</h2>
          <p style={styles.desc}>{slide.desc}</p>

          {/* Mockup illustration */}
          {slide.highlight && (
            <div style={styles.mockup}>
              <div style={styles.mockupBar}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a' }} />
              </div>
              <div style={styles.mockupContent}>
                {slide.highlight === 'exams' && (
                  <>
                    <div style={{ ...styles.mockupItem, background: 'rgba(19,91,236,0.2)', width: '80%' }} />
                    <div style={{ ...styles.mockupItem, background: 'rgba(19,91,236,0.15)', width: '60%' }} />
                    <div style={{ ...styles.mockupItem, background: 'rgba(19,91,236,0.1)', width: '70%' }} />
                  </>
                )}
                {slide.highlight === 'clases' && (
                  <>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <div style={{ ...styles.mockupItem, background: 'rgba(6,182,212,0.2)', flex: 1 }} />
                      <div style={{ ...styles.mockupItem, background: 'rgba(6,182,212,0.15)', flex: 1 }} />
                    </div>
                    <div style={{ ...styles.mockupItem, background: 'rgba(6,182,212,0.1)', width: '90%' }} />
                  </>
                )}
                {slide.highlight === 'stats' && (
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', height: 60 }}>
                    {[40, 60, 35, 80, 55, 70, 90].map((h, i) => (
                      <div key={i} style={{ flex: 1, height: `${h}%`, background: `rgba(22,163,74,${0.2 + i * 0.05})`, borderRadius: 4 }} />
                    ))}
                  </div>
                )}
                {slide.highlight === 'tutor' && (
                  <>
                    <div style={{ ...styles.mockupItem, background: 'rgba(239,68,68,0.15)', width: '70%', marginLeft: 'auto' }} />
                    <div style={{ ...styles.mockupItem, background: 'rgba(19,91,236,0.2)', width: '85%' }} />
                  </>
                )}
              </div>
            </div>
          )}

          <div style={styles.btnRow}>
            {tourSlide > 0 && (
              <button onClick={() => setTourSlide(tourSlide - 1)} style={styles.btnSecondary}>
                <ChevronLeft size={16} /> Atrás
              </button>
            )}
            <button onClick={handleTourNext} style={styles.btnPrimary}>
              {tourSlide < TOUR_SLIDES.length - 1 ? (
                <><span>Siguiente</span> <ChevronRight size={16} /></>
              ) : (
                <><CheckCircle size={16} /> <span>¡Comenzar!</span></>
              )}
            </button>
          </div>

          <button onClick={() => setStep('form')} style={styles.skipBtn}>
            Omitir tour →
          </button>
        </div>
      </div>
    )
  }

  // ─── Form view ───
  return (
    <div style={styles.overlay}>
      <div style={{ ...styles.card, maxWidth: 520 }}>
        <h2 style={styles.title}>Completa tu perfil</h2>
        <p style={styles.desc}>Necesitamos algunos datos para personalizar tu experiencia.</p>

        <div style={styles.formGrid}>
          <div style={styles.field}>
            <label style={styles.label}>Nombre *</label>
            <input
              style={styles.input}
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              placeholder="Tu nombre"
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Apellido *</label>
            <input
              style={styles.input}
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              placeholder="Tu apellido"
            />
          </div>
        </div>

        <div style={styles.formGrid}>
          <div style={styles.field}>
            <label style={styles.label}>¿Cuándo darás el EUNACOM?</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select style={{ ...styles.input, flex: 1 }} value={examMonth} onChange={e => setExamMonth(e.target.value)}>
                <option value="">Mes</option>
                <option value="Julio">Julio</option>
                <option value="Diciembre">Diciembre</option>
              </select>
              <select style={{ ...styles.input, flex: 1 }} value={examYear} onChange={e => setExamYear(e.target.value)}>
                {EXAM_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Meses preparándote</label>
            <select style={styles.input} value={prepMonths} onChange={e => setPrepMonths(e.target.value)}>
              <option value="">Seleccionar</option>
              <option value="0">Recién empiezo</option>
              <option value="1-3">1–3 meses</option>
              <option value="3-6">3–6 meses</option>
              <option value="6-12">6–12 meses</option>
              <option value="12+">Más de 1 año</option>
            </select>
          </div>
        </div>

        <div style={styles.formGrid}>
          <div style={styles.field}>
            <label style={styles.label}>Nacionalidad</label>
            <select style={styles.input} value={nationality} onChange={e => setNationality(e.target.value)}>
              <option value="">Seleccionar</option>
              {NATIONALITIES.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>País donde resides</label>
            <select style={styles.input} value={country} onChange={e => setCountry(e.target.value)}>
              <option value="">Seleccionar</option>
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>WhatsApp (para grupo oficial)</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <select
              style={{ ...styles.input, width: 130, flexShrink: 0 }}
              value={countryCode}
              onChange={e => setCountryCode(e.target.value)}
            >
              {COUNTRY_CODES.map(c => (
                <option key={c.code + c.country} value={c.code}>{c.flag} {c.code}</option>
              ))}
            </select>
            <input
              style={{ ...styles.input, flex: 1 }}
              value={whatsapp}
              onChange={e => setWhatsapp(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="912345678"
              inputMode="tel"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={!firstName.trim() || !lastName.trim() || saving}
          style={{
            ...styles.btnPrimary,
            width: '100%',
            marginTop: '1.5rem',
            opacity: (!firstName.trim() || !lastName.trim() || saving) ? 0.5 : 1,
          }}
        >
          {saving ? 'Guardando...' : '🚀 Empezar a estudiar'}
        </button>
      </div>
    </div>
  )
}

// ─── Styles ────────────────────────────────────────────────────────────────
const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    background: 'rgba(11, 17, 32, 0.95)',
    backdropFilter: 'blur(20px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
  },
  card: {
    background: 'var(--surface-700)',
    borderRadius: 'var(--radius-xl)',
    padding: '2.5rem 2rem',
    maxWidth: 460,
    width: '100%',
    textAlign: 'center',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  dots: {
    display: 'flex',
    justifyContent: 'center',
    gap: '6px',
    marginBottom: '2rem',
  },
  dot: {
    height: 8,
    borderRadius: 4,
    transition: 'all 0.3s',
  },
  iconBox: {
    display: 'inline-flex',
    padding: '1rem',
    borderRadius: 'var(--radius-lg)',
    background: 'rgba(19,91,236,0.1)',
    marginBottom: '1.5rem',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 800,
    color: 'var(--surface-50)',
    marginBottom: '0.75rem',
    fontFamily: 'var(--font)',
  },
  desc: {
    fontSize: '0.95rem',
    color: 'var(--surface-300)',
    lineHeight: 1.6,
    marginBottom: '1.5rem',
    fontFamily: 'var(--font)',
  },
  mockup: {
    background: 'var(--surface-800)',
    borderRadius: 'var(--radius)',
    overflow: 'hidden',
    marginBottom: '1.5rem',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  mockupBar: {
    display: 'flex',
    gap: 6,
    padding: '8px 12px',
    background: 'var(--surface-900)',
  },
  mockupContent: {
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  mockupItem: {
    height: 12,
    borderRadius: 4,
  },
  btnRow: {
    display: 'flex',
    gap: '0.75rem',
    justifyContent: 'center',
    marginTop: '0.5rem',
  },
  btnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    background: 'var(--gradient-primary)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius)',
    fontWeight: 700,
    fontSize: '0.95rem',
    cursor: 'pointer',
    fontFamily: 'var(--font)',
    transition: 'transform 0.15s',
  },
  btnSecondary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    background: 'var(--surface-600)',
    color: 'var(--surface-200)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 'var(--radius)',
    fontWeight: 600,
    fontSize: '0.95rem',
    cursor: 'pointer',
    fontFamily: 'var(--font)',
  },
  skipBtn: {
    display: 'block',
    margin: '1rem auto 0',
    background: 'none',
    border: 'none',
    color: 'var(--surface-400)',
    fontSize: '0.85rem',
    cursor: 'pointer',
    fontFamily: 'var(--font)',
    textDecoration: 'underline',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.75rem',
    marginBottom: '0.75rem',
    textAlign: 'left',
  },
  field: {
    marginBottom: '0.75rem',
    textAlign: 'left',
  },
  label: {
    display: 'block',
    fontSize: '0.8rem',
    fontWeight: 600,
    color: 'var(--surface-300)',
    marginBottom: '0.35rem',
    fontFamily: 'var(--font)',
  },
  input: {
    width: '100%',
    padding: '0.6rem 0.75rem',
    background: 'var(--surface-800)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 'var(--radius)',
    color: 'var(--surface-50)',
    fontSize: '0.9rem',
    fontFamily: 'var(--font)',
    outline: 'none',
  },
}

export default Onboarding
