import React, { useState, useEffect } from 'react'
import {
  Stethoscope, GraduationCap, Building2, User, Phone,
  ChevronRight, ChevronLeft, Sparkles, CheckCircle2,
  Calendar, Award, Target, Flame, HeartPulse, Clock,
  ArrowRight, ShieldCheck, X, Loader2
} from 'lucide-react'
import { EunacomLogo, EunacomLogoIcon } from './EunacomLogo'
import { CHILEAN_UNIVERSITIES, getSedesForUniversity, UserInstitutionBadge, COUNTRIES } from '../utils/universityAndCountry'

// ─── COUNTRY CODES & PHONE VALIDATION ────────────────────────────────────
const COUNTRY_CODES = [
  { code: '+56', country: 'Chile', flag: '🇨🇱', minDigits: 9, maxDigits: 9, placeholder: '9 1234 5678' },
  { code: '+54', country: 'Argentina', flag: '🇦🇷', minDigits: 10, maxDigits: 11, placeholder: '9 11 1234 5678' },
  { code: '+57', country: 'Colombia', flag: '🇨🇴', minDigits: 10, maxDigits: 10, placeholder: '300 123 4567' },
  { code: '+51', country: 'Perú', flag: '🇵🇪', minDigits: 9, maxDigits: 9, placeholder: '912 345 678' },
  { code: '+58', country: 'Venezuela', flag: '🇻🇪', minDigits: 10, maxDigits: 10, placeholder: '412 123 4567' },
  { code: '+593', country: 'Ecuador', flag: '🇪🇨', minDigits: 9, maxDigits: 9, placeholder: '91 234 5678' },
  { code: '+591', country: 'Bolivia', flag: '🇧🇴', minDigits: 8, maxDigits: 8, placeholder: '7123 4567' },
  { code: '+52', country: 'México', flag: '🇲🇽', minDigits: 10, maxDigits: 10, placeholder: '55 1234 5678' },
  { code: '+53', country: 'Cuba', flag: '🇨🇺', minDigits: 8, maxDigits: 8, placeholder: '5 123 4567' },
  { code: '+34', country: 'España', flag: '🇪🇸', minDigits: 9, maxDigits: 9, placeholder: '612 345 678' },
  { code: '+1', country: 'Estados Unidos / Canadá', flag: '🇺🇸', minDigits: 10, maxDigits: 10, placeholder: '202 555 0123' },
  { code: '+', country: 'Otro', flag: '🌐', minDigits: 7, maxDigits: 12, placeholder: '123456789' },
]

function validatePhone(rawNumber, selectedCode) {
  const digits = (rawNumber || '').replace(/\D/g, '')
  if (!digits) return { valid: false, message: 'Ingresa tu número de WhatsApp.' }

  const isRepeating = /^(\d)\1+$/.test(digits)
  const isSequence = '01234567890123456789'.includes(digits) || '98765432109876543210'.includes(digits)
  if (isRepeating || isSequence || digits.length < 7) {
    return { valid: false, message: 'Por favor ingresa un número de WhatsApp real.' }
  }

  const rule = COUNTRY_CODES.find(c => c.code === selectedCode) || COUNTRY_CODES[0]
  if (rule.minDigits && digits.length < rule.minDigits) {
    return { valid: false, message: `El número para ${rule.country} debe tener al menos ${rule.minDigits} dígitos.` }
  }
  if (rule.maxDigits && digits.length > rule.maxDigits) {
    return { valid: false, message: `El número para ${rule.country} no debe superar ${rule.maxDigits} dígitos.` }
  }

  return { valid: true }
}

const TOTAL_INTERACTIVE_STEPS = 4

const Onboarding = ({ user, onComplete }) => {
  // Step: 1 (Name/WA) | 2 (Academic profile/Uni) | 3 (Goal/Date) | 4 (Focus/Time) | 5 (Calculating Plan) | 6 (Plan Ready Reveal)
  const [step, setStep] = useState(1)

  // Form State
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [countryCode, setCountryCode] = useState('+56')
  const [whatsapp, setWhatsapp] = useState('')

  // Academic Profile State (Matching user screenshot)
  const [studyLocation, setStudyLocation] = useState('chile') // 'chile' | 'extranjero'
  const [studyCountry, setStudyCountry] = useState('Colombia')
  const [profileType, setProfileType] = useState('Médico Titulado (Chile)')
  const [graduationYear, setGraduationYear] = useState('2025')
  const [university, setUniversity] = useState('')
  const [sede, setSede] = useState('')
  const [customUniversity, setCustomUniversity] = useState('')

  // Goal & Exam Date
  const [goal, setGoal] = useState('beca') // 'pass_51' | 'beca' | 'reval'
  const [examMonth, setExamMonth] = useState('Diciembre')
  const [examYear, setExamYear] = useState('2026')
  const [inscrito, setInscrito] = useState('Sí')

  // Focus & Study Pace
  const [weakArea, setWeakArea] = useState('Medicina Interna / Cardiología')
  const [studyHours, setStudyHours] = useState('45 min/día (Recomendado)')

  // Calculation screen simulation states
  const [calcProgress, setCalcProgress] = useState(15)
  const [calcTextIdx, setCalcTextIdx] = useState(0)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Calculation animation trigger when entering step 5
  useEffect(() => {
    if (step === 5) {
      const interval = setInterval(() => {
        setCalcProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setTimeout(() => setStep(6), 600)
            return 100
          }
          return prev + 18
        })
      }, 450)

      const textTimer1 = setTimeout(() => setCalcTextIdx(1), 900)
      const textTimer2 = setTimeout(() => setCalcTextIdx(2), 1800)

      return () => {
        clearInterval(interval)
        clearTimeout(textTimer1)
        clearTimeout(textTimer2)
      }
    }
  }, [step])

  const selectedRule = COUNTRY_CODES.find(c => c.code === countryCode) || COUNTRY_CODES[0]
  const phoneValidation = validatePhone(whatsapp, countryCode)

  const handleNextFromStep1 = () => {
    if (!firstName.trim()) { setError('Por favor ingresa tu nombre.'); return }
    if (!lastName.trim()) { setError('Por favor ingresa tu apellido.'); return }
    if (!phoneValidation.valid) { setError(phoneValidation.message); return }
    setError('')
    setStep(2)
  }

  const handleNextFromStep2 = () => {
    if (studyLocation === 'chile') {
      if (!profileType) { setError('Por favor selecciona tu tipo de perfil.'); return }
      if (!graduationYear) { setError('Por favor selecciona tu año de egreso.'); return }
      if (!university) { setError('Por favor selecciona tu universidad.'); return }
    } else {
      if (!studyCountry) { setError('Por favor selecciona el país donde estudiaste.'); return }
      if (!graduationYear) { setError('Por favor selecciona tu año de egreso.'); return }
    }
    setError('')
    setStep(3)
  }

  const handleNextFromStep3 = () => {
    if (!goal) { setError('Por favor selecciona tu objetivo en el examen.'); return }
    if (!examMonth || !examYear) { setError('Por favor selecciona la fecha de tu examen.'); return }
    setError('')
    setStep(4)
  }

  const handleGeneratePlan = () => {
    setError('')
    setStep(5)
  }

  const handleFinish = async () => {
    setSaving(true)
    try {
      const fullPhone = `${countryCode} ${whatsapp.trim().replace(/\D/g, '')}`
      const finalUni = studyLocation === 'chile'
        ? university
        : (customUniversity.trim() ? `${studyCountry} - ${customUniversity.trim()}` : `Universidad en ${studyCountry}`)
      
      const finalCountry = studyLocation === 'chile' ? 'Chile' : studyCountry

      await onComplete({
        id: user.id,
        email: user.email,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        country_code: countryCode,
        whatsapp: fullPhone,
        nationality: finalCountry,
        country: finalCountry,
        profile_type: studyLocation === 'chile' ? profileType : 'Médico Extranjero (Revalidación)',
        graduation_year: graduationYear,
        university: finalUni,
        sede: studyLocation === 'chile' ? (sede || 'Sede Principal') : (studyCountry || 'Extranjero'),
        goal,
        exam_month: examMonth,
        exam_year: examYear,
        inscrito_eunacom: inscrito,
        ayuda_inscripcion: inscrito === 'No' ? 'Sí' : 'No',
        weak_area: weakArea,
        study_hours: studyHours,
        xp: 50, // +50 XP bonus given
        onboarding_done: true,
      })
    } catch (e) {
      console.error('Onboarding save error:', e)
      setError('Error al guardar tu perfil. Intenta de nuevo.')
      setSaving(false)
    }
  }

  // Calculation texts
  const calcMessages = [
    'Ponderando materias con mayor peso oficial del Perfil EUNACOM 2026...',
    `Calibrando algoritmo para tu meta (${goal === 'beca' ? 'Beca de Especialidad >75%' : goal === 'pass_51' ? 'Aprobación Segura 51%' : 'Revalidación'})...`,
    'Asignando tus primeros casos clínicos y plan de repaso personalizado...',
  ]

  return (
    <>
      {/* Backdrop */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99990,
        backgroundColor: 'rgba(9, 14, 26, 0.85)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }} />

      {/* Main Modal Layout */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99991,
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px 14px calc(16px + env(safe-area-inset-bottom))',
        paddingTop: 'max(16px, env(safe-area-inset-top))',
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          padding: '2rem 1.6rem',
          maxWidth: '460px',
          width: '100%',
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.45), 0 0 30px rgba(37, 99, 235, 0.15)',
          border: '1px solid rgba(226, 232, 240, 0.9)',
          position: 'relative',
          margin: 'auto',
          animation: 'onboardingPop 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
          <style>{`
            @keyframes onboardingPop {
              0% { transform: scale(0.95) translateY(12px); opacity: 0; }
              100% { transform: scale(1) translateY(0); opacity: 1; }
            }
            .ob-input-row {
              background: #f8fafc;
              border: 1.5px solid #e2e8f0;
              border-radius: 14px;
              padding: 0.75rem 1rem;
              display: flex;
              align-items: center;
              gap: 0.75rem;
              transition: all 0.2s ease;
            }
            .ob-input-row:focus-within {
              border-color: #2563eb;
              background: #ffffff;
              box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
            }
            .ob-choice-card {
              border: 1.5px solid #e2e8f0;
              background: #ffffff;
              border-radius: 14px;
              padding: 0.85rem 1rem;
              cursor: pointer;
              transition: all 0.18s ease;
              display: flex;
              align-items: center;
              gap: 0.75rem;
              text-align: left;
              width: 100%;
            }
            .ob-choice-card:hover {
              border-color: #93c5fd;
              background: #f8fafc;
            }
            .ob-choice-card.selected {
              border-color: #2563eb;
              background: #eff6ff;
              box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
            }
          `}</style>

          {/* Top Branding & Gamification Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.1rem',
          }}>
            <EunacomLogo size={28} />

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: '999px',
              padding: '3px 10px',
              fontSize: '0.74rem',
              fontWeight: 700,
              color: '#065f46',
            }}>
              <span>🎉</span>
              <span>+50 XP</span>
            </div>
          </div>

          {/* Top Progress Pill Bar (Matching user screenshot) */}
          {step <= TOTAL_INTERACTIVE_STEPS && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginBottom: '1.5rem',
            }}>
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  style={{
                    height: '6px',
                    borderRadius: '999px',
                    width: s === step ? '26px' : '7px',
                    backgroundColor: s === step ? '#2563eb' : s < step ? '#93c5fd' : '#e2e8f0',
                    transition: 'all 0.3s ease',
                  }}
                />
              ))}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              STEP 1: NOMBRE Y CONTACTO AMABLE
          ═══════════════════════════════════════════════════════════════ */}
          {step === 1 && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  ¡Bienvenido(a)! 🩺
                </h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {/* Nombre */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                    Tu Nombre
                  </label>
                  <div className="ob-input-row">
                    <User size={18} color="#94a3b8" />
                    <input
                      type="text"
                      placeholder="Nombre"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.95rem', color: '#1e293b', fontWeight: 600 }}
                    />
                  </div>
                </div>

                {/* Apellido */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                    Tu Apellido
                  </label>
                  <div className="ob-input-row">
                    <User size={18} color="#94a3b8" />
                    <input
                      type="text"
                      placeholder="Apellido"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.95rem', color: '#1e293b', fontWeight: 600 }}
                    />
                  </div>
                </div>

                {/* WhatsApp */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                    WhatsApp
                  </label>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      style={{
                        padding: '0.75rem 0.5rem',
                        backgroundColor: '#f8fafc',
                        border: '1.5px solid #e2e8f0',
                        borderRadius: '14px',
                        color: '#1e293b',
                        fontSize: '0.88rem',
                        fontWeight: 600,
                        outline: 'none',
                        width: '115px',
                        flexShrink: 0,
                      }}
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code + c.country} value={c.code}>
                          {c.flag} {c.code}
                        </option>
                      ))}
                    </select>

                    <div className="ob-input-row" style={{ flex: 1 }}>
                      <Phone size={16} color="#94a3b8" />
                      <input
                        type="tel"
                        inputMode="tel"
                        placeholder={selectedRule.placeholder}
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.95rem', color: '#1e293b', fontWeight: 600 }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div style={{ marginTop: '0.85rem', color: '#dc2626', fontSize: '0.8rem', textAlign: 'center', fontWeight: 600 }}>
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={handleNextFromStep1}
                style={{
                  width: '100%',
                  marginTop: '1.4rem',
                  padding: '0.85rem',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '14px',
                  fontSize: '0.96rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                  transition: 'all 0.2s',
                }}
              >
                <span>Continuar</span>
                <ChevronRight size={18} />
              </button>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              STEP 2: FORMACIÓN MÉDICA & UNIVERSIDAD (CLEAN & SHORT)
          ═══════════════════════════════════════════════════════════════ */}
          {step === 2 && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '1.1rem' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Formación Médica 🩺
                </h2>
              </div>

              {/* Location Toggle */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginBottom: '0.85rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setStudyLocation('chile')
                    setProfileType('Médico Titulado (Chile)')
                  }}
                  style={{
                    padding: '0.65rem 0.5rem',
                    borderRadius: '12px',
                    border: studyLocation === 'chile' ? '1.5px solid #2563eb' : '1.5px solid #e2e8f0',
                    backgroundColor: studyLocation === 'chile' ? '#eff6ff' : '#f8fafc',
                    color: studyLocation === 'chile' ? '#1d4ed8' : '#64748b',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>🇨🇱</span>
                  <span>Estudié en Chile</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStudyLocation('extranjero')
                    setProfileType('Médico Extranjero (Revalidación)')
                    setGoal('reval')
                  }}
                  style={{
                    padding: '0.65rem 0.5rem',
                    borderRadius: '12px',
                    border: studyLocation === 'extranjero' ? '1.5px solid #2563eb' : '1.5px solid #e2e8f0',
                    backgroundColor: studyLocation === 'extranjero' ? '#eff6ff' : '#f8fafc',
                    color: studyLocation === 'extranjero' ? '#1d4ed8' : '#64748b',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>🌎</span>
                  <span>Fuera de Chile</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {studyLocation === 'chile' ? (
                  <>
                    <div className="ob-input-row">
                      <Stethoscope size={20} color="#2563eb" style={{ flexShrink: 0 }} />
                      <select
                        value={profileType}
                        onChange={(e) => setProfileType(e.target.value)}
                        style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.92rem', color: '#1e293b', fontWeight: 600, cursor: 'pointer' }}
                      >
                        <option value="Médico Titulado (Chile)">Médico Titulado (Chile)</option>
                        <option value="Interno de Medicina (Chile)">Interno de Medicina (Chile)</option>
                        <option value="Estudiante de Medicina">Estudiante de Medicina</option>
                      </select>
                    </div>

                    <div className="ob-input-row">
                      <GraduationCap size={20} color="#2563eb" style={{ flexShrink: 0 }} />
                      <select
                        value={graduationYear}
                        onChange={(e) => setGraduationYear(e.target.value)}
                        style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.92rem', color: '#1e293b', fontWeight: 600, cursor: 'pointer' }}
                      >
                        <option value="" disabled>Año Egreso...</option>
                        {['2027', '2026', '2025', '2024', '2023', '2022', '2021', '2020 o anterior'].map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>

                    <div className="ob-input-row">
                      <Building2 size={20} color="#2563eb" style={{ flexShrink: 0 }} />
                      <select
                        value={university}
                        onChange={(e) => {
                          const val = e.target.value
                          setUniversity(val)
                          const sedes = getSedesForUniversity(val)
                          if (sedes && sedes.length > 0) {
                            setSede(sedes[0])
                          }
                        }}
                        style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.92rem', color: university ? '#1e293b' : '#94a3b8', fontWeight: 600, cursor: 'pointer' }}
                      >
                        <option value="" disabled>Selecciona tu universidad...</option>
                        {CHILEAN_UNIVERSITIES.map((u) => (
                          <option key={u.id} value={u.name} style={{ color: '#1e293b' }}>
                            {u.flag} {u.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {university && (
                      <div className="ob-input-row">
                        <Building2 size={20} color="#0284c7" style={{ flexShrink: 0 }} />
                        <select
                          value={sede}
                          onChange={(e) => setSede(e.target.value)}
                          style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.92rem', color: '#1e293b', fontWeight: 600, cursor: 'pointer' }}
                        >
                          <option value="" disabled>Selecciona tu sede / campus...</option>
                          {getSedesForUniversity(university).map((s) => (
                            <option key={s} value={s} style={{ color: '#1e293b' }}>
                              📍 Sede: {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="ob-input-row">
                      <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>🌎</span>
                      <select
                        value={studyCountry}
                        onChange={(e) => setStudyCountry(e.target.value)}
                        style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.92rem', color: '#1e293b', fontWeight: 600, cursor: 'pointer' }}
                      >
                        {COUNTRIES.filter(c => c.name !== 'Chile').map((c) => (
                          <option key={c.code} value={c.name}>{c.flag} {c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="ob-input-row">
                      <GraduationCap size={20} color="#2563eb" style={{ flexShrink: 0 }} />
                      <select
                        value={graduationYear}
                        onChange={(e) => setGraduationYear(e.target.value)}
                        style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.92rem', color: '#1e293b', fontWeight: 600, cursor: 'pointer' }}
                      >
                        <option value="" disabled>Año Egreso...</option>
                        {['2027', '2026', '2025', '2024', '2023', '2022', '2021', '2020 o anterior'].map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>

                    <div className="ob-input-row">
                      <Building2 size={20} color="#2563eb" style={{ flexShrink: 0 }} />
                      <input
                        type="text"
                        placeholder="Nombre de tu universidad (ej: UCV, UBA, UNMSM...)"
                        value={customUniversity}
                        onChange={(e) => setCustomUniversity(e.target.value)}
                        style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.92rem', color: '#1e293b', fontWeight: 600 }}
                      />
                    </div>
                  </>
                )}

                {/* Live Preview Badge */}
                <div style={{
                  marginTop: '0.5rem',
                  padding: '0.65rem 0.85rem',
                  background: 'rgba(37, 99, 235, 0.05)',
                  borderRadius: '12px',
                  border: '1px solid rgba(37, 99, 235, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem'
                }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                    Insignia en tu perfil & ranking:
                  </span>
                  <UserInstitutionBadge
                    user={{
                      university: studyLocation === 'chile' ? university : customUniversity,
                      sede: studyLocation === 'chile' ? (sede || 'Sede Principal') : (studyCountry || 'Extranjero'),
                      country: studyLocation === 'chile' ? 'Chile' : studyCountry
                    }}
                    size={26}
                    showLabel={true}
                    labelStyle={{ color: '#1e293b', fontWeight: 700, fontSize: '0.8rem', maxWidth: '170px' }}
                  />
                </div>
              </div>

              {error && (
                <div style={{ marginTop: '0.85rem', color: '#dc2626', fontSize: '0.8rem', textAlign: 'center', fontWeight: 600 }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.4rem' }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{ padding: '0.85rem 1rem', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '14px', fontWeight: 600, cursor: 'pointer' }}
                >
                  <ChevronLeft size={18} />
                </button>

                <button
                  type="button"
                  onClick={handleNextFromStep2}
                  style={{
                    flex: 1,
                    padding: '0.85rem',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '14px',
                    fontSize: '0.96rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                    transition: 'all 0.2s',
                  }}
                >
                  <span>Continuar</span>
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              STEP 3: OBJETIVO & FECHA (CLEAN & SHORT, NO SUBTITLES)
          ═══════════════════════════════════════════════════════════════ */}
          {step === 3 && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '1.1rem' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Tu Meta 🎯
                </h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {/* Option 1 */}
                <div
                  className={`ob-choice-card ${goal === 'beca' ? 'selected' : ''}`}
                  onClick={() => setGoal('beca')}
                  style={{ padding: '0.85rem 1rem' }}
                >
                  <div style={{ fontSize: '1.35rem' }}>🏆</div>
                  <div style={{ flex: 1, fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>
                    Beca de Especialidad (&gt; 75 - 80%)
                  </div>
                  {goal === 'beca' && <CheckCircle2 size={18} color="#2563eb" />}
                </div>

                {/* Option 2 */}
                <div
                  className={`ob-choice-card ${goal === 'pass_51' ? 'selected' : ''}`}
                  onClick={() => setGoal('pass_51')}
                  style={{ padding: '0.85rem 1rem' }}
                >
                  <div style={{ fontSize: '1.35rem' }}>🎯</div>
                  <div style={{ flex: 1, fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>
                    Aprobar EUNACOM (≥ 51%)
                  </div>
                  {goal === 'pass_51' && <CheckCircle2 size={18} color="#2563eb" />}
                </div>

                {/* Option 3 */}
                <div
                  className={`ob-choice-card ${goal === 'reval' ? 'selected' : ''}`}
                  onClick={() => setGoal('reval')}
                  style={{ padding: '0.85rem 1rem' }}
                >
                  <div style={{ fontSize: '1.35rem' }}>🩺</div>
                  <div style={{ flex: 1, fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>
                    Revalidación de Título
                  </div>
                  {goal === 'reval' && <CheckCircle2 size={18} color="#2563eb" />}
                </div>

                {/* Fecha Examen */}
                <div style={{ marginTop: '0.4rem' }}>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                    <Calendar size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} /> ¿Cuándo rindes el examen?
                  </label>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <select
                      value={examMonth}
                      onChange={(e) => setExamMonth(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '0.65rem 0.5rem',
                        backgroundColor: '#f8fafc',
                        border: '1.5px solid #e2e8f0',
                        borderRadius: '12px',
                        fontSize: '0.88rem',
                        fontWeight: 600,
                        color: '#1e293b',
                        outline: 'none',
                      }}
                    >
                      <option value="Julio">Julio</option>
                      <option value="Diciembre">Diciembre</option>
                    </select>

                    <select
                      value={examYear}
                      onChange={(e) => setExamYear(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '0.65rem 0.5rem',
                        backgroundColor: '#f8fafc',
                        border: '1.5px solid #e2e8f0',
                        borderRadius: '12px',
                        fontSize: '0.88rem',
                        fontWeight: 600,
                        color: '#1e293b',
                        outline: 'none',
                      }}
                    >
                      <option value="2025">2025</option>
                      <option value="2026">2026</option>
                      <option value="2027">2027</option>
                    </select>
                  </div>
                </div>
              </div>

              {error && (
                <div style={{ marginTop: '0.85rem', color: '#dc2626', fontSize: '0.8rem', textAlign: 'center', fontWeight: 600 }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.3rem' }}>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  style={{ padding: '0.85rem 1rem', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '14px', fontWeight: 600, cursor: 'pointer' }}
                >
                  <ChevronLeft size={18} />
                </button>

                <button
                  type="button"
                  onClick={handleNextFromStep3}
                  style={{
                    flex: 1,
                    padding: '0.85rem',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '14px',
                    fontSize: '0.96rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                    transition: 'all 0.2s',
                  }}
                >
                  <span>Continuar</span>
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              STEP 4: ENFOQUE & RITMO DIARIO (CLEAN & SHORT)
          ═══════════════════════════════════════════════════════════════ */}
          {step === 4 && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '1.1rem' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Enfoque de Estudio ⚡
                </h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                {[
                  { title: 'Medicina Interna', badge: '37%', icon: '❤️' },
                  { title: 'Pediatría', badge: 'Frecuente', icon: '👶' },
                  { title: 'Ginecología y Obstetricia', badge: 'GES', icon: '🤰' },
                  { title: 'Cirugía General', badge: 'Frecuente', icon: '🔪' },
                  { title: 'Salud Pública', badge: 'Fija', icon: '📊' },
                ].map((item) => (
                  <div
                    key={item.title}
                    className={`ob-choice-card ${weakArea.startsWith(item.title) ? 'selected' : ''}`}
                    onClick={() => setWeakArea(item.title)}
                    style={{ padding: '0.75rem 0.9rem' }}
                  >
                    <span style={{ fontSize: '1.15rem' }}>{item.icon}</span>
                    <div style={{ flex: 1, fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                      {item.title}
                    </div>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: weakArea.startsWith(item.title) ? '#1d4ed8' : '#64748b',
                      background: weakArea.startsWith(item.title) ? '#dbeafe' : '#f1f5f9',
                      padding: '2px 8px',
                      borderRadius: '6px',
                    }}>
                      {item.badge}
                    </span>
                  </div>
                ))}

                {/* Tiempo de estudio */}
                <div style={{ marginTop: '0.4rem' }}>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                    <Clock size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Tiempo diario disponible:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.4rem' }}>
                    {[
                      { label: '15-20 min', sub: 'Express' },
                      { label: '45 min', sub: 'Recomendado' },
                      { label: '2+ horas', sub: 'Intensivo' },
                    ].map((opt) => (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => setStudyHours(`${opt.label}/día (${opt.sub})`)}
                        style={{
                          padding: '0.55rem 0.2rem',
                          textAlign: 'center',
                          borderRadius: '12px',
                          border: studyHours.includes(opt.label) ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                          backgroundColor: studyHours.includes(opt.label) ? '#eff6ff' : '#f8fafc',
                          color: studyHours.includes(opt.label) ? '#1d4ed8' : '#475569',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                        }}
                      >
                        <div>{opt.label}</div>
                        <div style={{ fontSize: '0.66rem', fontWeight: 500, color: '#64748b' }}>{opt.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.3rem' }}>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  style={{ padding: '0.85rem 1rem', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '14px', fontWeight: 600, cursor: 'pointer' }}
                >
                  <ChevronLeft size={18} />
                </button>

                <button
                  type="button"
                  onClick={handleGeneratePlan}
                  style={{
                    flex: 1,
                    padding: '0.85rem',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '14px',
                    fontSize: '0.96rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                    transition: 'all 0.2s',
                  }}
                >
                  <span>Generar Plan</span>
                  <Sparkles size={18} />
                </button>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              STEP 5: ANIMACIÓN "IKEA EFFECT" (CALCULANDO TU PLAN)
          ═══════════════════════════════════════════════════════════════ */}
          {step === 5 && (
            <div style={{ textAlign: 'center', padding: '1.5rem 0.5rem' }}>
              <div style={{
                width: '64px',
                height: '64px',
                margin: '0 auto 1.25rem',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                border: '2px solid #bfdbfe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Loader2 size={32} color="#2563eb" className="spin" />
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
                Generando tu Plan Personalizado...
              </h3>

              <p style={{ fontSize: '0.85rem', color: '#2563eb', fontWeight: 600, minHeight: '44px', padding: '0 0.5rem' }}>
                {calcMessages[calcTextIdx]}
              </p>

              {/* Progress bar */}
              <div style={{
                width: '100%',
                height: '8px',
                backgroundColor: '#e2e8f0',
                borderRadius: '999px',
                overflow: 'hidden',
                marginTop: '1.25rem',
              }}>
                <div style={{
                  height: '100%',
                  width: `${calcProgress}%`,
                  backgroundColor: '#2563eb',
                  borderRadius: '999px',
                  transition: 'width 0.4s ease',
                }} />
              </div>

              <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.75rem', fontWeight: 600 }}>
                {calcProgress}% Completado
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              STEP 6: REVEAL FINAL & BOTÓN DE ARRANQUE (PREMIUM REDESIGN)
          ═══════════════════════════════════════════════════════════════ */}
          {step === 6 && (
            <div>
              {/* Header with Celebration Badge */}
              <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#ecfdf5',
                  border: '1px solid #6ee7b7',
                  borderRadius: '999px',
                  padding: '4px 14px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#047857',
                  marginBottom: '0.75rem',
                }}>
                  <span>✨</span>
                  <span>Plan Personalizado 2026</span>
                </div>

                <h2 style={{
                  fontSize: '1.45rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  margin: '0 0 0.35rem 0',
                  letterSpacing: '-0.02em',
                }}>
                  ¡Listo, Dr(a). {firstName || 'Doctor(a)'}! 🚀
                </h2>

                <p style={{ fontSize: '0.84rem', color: '#64748b', margin: 0 }}>
                  Tu algoritmo de estudio ha sido calibrado a tu meta.
                </p>
              </div>

              {/* Main Plan Pass Card */}
              <div style={{
                background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
                borderRadius: '18px',
                padding: '1.2rem',
                color: '#ffffff',
                boxShadow: '0 12px 30px rgba(15, 23, 42, 0.25)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                marginBottom: '1.25rem',
                position: 'relative',
                overflow: 'hidden',
              }}>
                {/* Decorative background glow */}
                <div style={{
                  position: 'absolute',
                  top: '-30px',
                  right: '-30px',
                  width: '100px',
                  height: '100px',
                  background: 'radial-gradient(circle, rgba(37,99,235,0.4) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }} />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <EunacomLogoIcon size={24} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
                      eunacom<span style={{ color: '#38bdf8' }}>app</span>
                    </span>
                  </div>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    backgroundColor: 'rgba(37,99,235,0.3)',
                    border: '1px solid rgba(56,189,248,0.4)',
                    color: '#38bdf8',
                    padding: '2px 8px',
                    borderRadius: '6px',
                  }}>
                    Perfil 2026
                  </span>
                </div>

                {/* 2x2 Grid for Clean Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '0.65rem 0.75rem' }}>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, marginBottom: '2px' }}>🎯 Objetivo</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>
                      {goal === 'beca' ? 'Beca >75-80%' : goal === 'pass_51' ? 'Aprobar ≥51%' : 'Revalidación'}
                    </div>
                  </div>

                  <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '0.65rem 0.75rem' }}>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, marginBottom: '2px' }}>📅 Fecha Examen</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>
                      {examMonth} {examYear}
                    </div>
                  </div>

                  <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '0.65rem 0.75rem' }}>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, marginBottom: '2px' }}>🏛️ Formación</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {studyLocation === 'chile' ? (university || 'Chile') : (studyCountry || 'Extranjero')}
                    </div>
                  </div>

                  <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '0.65rem 0.75rem' }}>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, marginBottom: '2px' }}>⚡ Prioridad</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#38bdf8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {weakArea.split('/')[0].trim()}
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div style={{ marginBottom: '0.85rem', color: '#dc2626', fontSize: '0.8rem', textAlign: 'center', fontWeight: 600 }}>
                  {error}
                </div>
              )}

              {/* High-Converting Launch Button */}
              <button
                type="button"
                onClick={handleFinish}
                disabled={saving}
                style={{
                  width: '100%',
                  padding: '0.95rem 1rem',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '16px',
                  fontSize: '1.02rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.6rem',
                  cursor: saving ? 'wait' : 'pointer',
                  boxShadow: '0 8px 24px rgba(37, 99, 235, 0.4)',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                {saving ? (
                  <>
                    <Loader2 size={20} className="spin" />
                    <span>Guardando tu plan...</span>
                  </>
                ) : (
                  <>
                    <span>¡Empezar a Estudiar Ahora!</span>
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Onboarding
