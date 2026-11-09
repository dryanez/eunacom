import React, { useState, useEffect } from 'react'
import {
  Stethoscope, GraduationCap, Building2, User, Phone,
  ChevronRight, ChevronLeft, Sparkles, CheckCircle2,
  Calendar, Clock, ArrowRight, Loader2, PartyPopper,
  MapPin, Globe2, Trophy, Target, HeartPulse, Baby, Venus,
  Scissors, BarChart3, Landmark, Zap
} from 'lucide-react'
import { EunacomLogo, EunacomLogoIcon } from './EunacomLogo'
import './redesign/onboarding.css'
import { track } from '../lib/analytics'
import { CHILEAN_UNIVERSITIES, getSedesForUniversity, UserInstitutionBadge, getUserInstitutionBadge, COUNTRIES } from '../utils/universityAndCountry'

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
      track('sign_up_completed', {
        signup_method: user.app_metadata?.provider || 'email',
        study_location: studyLocation,
        country: finalCountry,
        goal,
        exam_month: examMonth,
        exam_year: examYear,
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

  // "Dr(a)." solo una vez: si el nombre ya trae Dr/Dra/Dr(a)., no se agrega otro
  const greetName = firstName.trim()
  const alreadyDr = /^dr(a|\(a\))?\.?(\s|$)/i.test(greetName)
  const greeting = greetName
    ? (alreadyDr ? greetName : `Dr(a). ${greetName}`)
    : 'Doctor(a)'

  return (
    <>
      {/* Backdrop */}
      <div className="ob-mn-backdrop" />

      {/* Main Modal Layout */}
      <div className="ob-mn-overlay">
        <div className="ob-mn" role="dialog" aria-modal="true">

          {/* Top Branding & Gamification Bar */}
          <div className="ob-mn-top">
            <EunacomLogo size={28} textColor="#f1f5f9" accentColor="#38bdf8" />
            <div className="ob-mn-xp">
              <PartyPopper size={13} />
              <span>+50 XP</span>
            </div>
          </div>

          {/* Step dots */}
          {step <= TOTAL_INTERACTIVE_STEPS && (
            <div className="ob-mn-dots">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className={`ob-mn-dot ${s === step ? 'is-on' : s < step ? 'is-done' : ''}`} />
              ))}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              STEP 1: NOMBRE Y CONTACTO
          ═══════════════════════════════════════════════════════════════ */}
          {step === 1 && (
            <div>
              <div className="ob-mn-head">
                <span className="ob-mn-eyebrow">Paso 1 de {TOTAL_INTERACTIVE_STEPS}</span>
                <h2 className="ob-mn-h">¡Bienvenido(a)!</h2>
              </div>

              <div className="ob-mn-stack">
                {/* Nombre */}
                <div>
                  <label className="ob-mn-label">Tu Nombre</label>
                  <div className="ob-mn-field">
                    <User size={18} />
                    <input
                      type="text"
                      placeholder="Nombre"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                </div>

                {/* Apellido */}
                <div>
                  <label className="ob-mn-label">Tu Apellido</label>
                  <div className="ob-mn-field">
                    <User size={18} />
                    <input
                      type="text"
                      placeholder="Apellido"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>

                {/* WhatsApp */}
                <div>
                  <label className="ob-mn-label">WhatsApp</label>
                  <div className="ob-mn-row">
                    <select
                      className="ob-mn-select code"
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code + c.country} value={c.code}>
                          {c.flag} {c.code}
                        </option>
                      ))}
                    </select>

                    <div className="ob-mn-field" style={{ flex: 1 }}>
                      <Phone size={16} />
                      <input
                        type="tel"
                        inputMode="tel"
                        placeholder={selectedRule.placeholder}
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {error && <div className="ob-mn-err">{error}</div>}

              <button type="button" className="ob-mn-btn solo" onClick={handleNextFromStep1}>
                <span>Continuar</span>
                <ChevronRight size={18} />
              </button>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              STEP 2: FORMACIÓN MÉDICA & UNIVERSIDAD
          ═══════════════════════════════════════════════════════════════ */}
          {step === 2 && (
            <div>
              <div className="ob-mn-head">
                <span className="ob-mn-eyebrow">Paso 2 de {TOTAL_INTERACTIVE_STEPS}</span>
                <h2 className="ob-mn-h">Formación Médica</h2>
              </div>

              {/* Location Toggle */}
              <div className="ob-mn-grid2" style={{ marginBottom: '0.85rem' }}>
                <button
                  type="button"
                  className={`ob-mn-seg ${studyLocation === 'chile' ? 'is-on' : ''}`}
                  onClick={() => {
                    setStudyLocation('chile')
                    setProfileType('Médico Titulado (Chile)')
                  }}
                >
                  <MapPin size={15} />
                  <span>En Chile</span>
                </button>

                <button
                  type="button"
                  className={`ob-mn-seg ${studyLocation === 'extranjero' ? 'is-on' : ''}`}
                  onClick={() => {
                    setStudyLocation('extranjero')
                    setProfileType('Médico Extranjero (Revalidación)')
                    setGoal('reval')
                  }}
                >
                  <Globe2 size={15} />
                  <span>Fuera de Chile</span>
                </button>
              </div>

              <div className="ob-mn-stack">
                {studyLocation === 'chile' ? (
                  <>
                    <div className="ob-mn-field accent">
                      <Stethoscope size={19} />
                      <select value={profileType} onChange={(e) => setProfileType(e.target.value)}>
                        <option value="Médico Titulado (Chile)">Médico Titulado (Chile)</option>
                        <option value="Interno de Medicina (Chile)">Interno de Medicina (Chile)</option>
                        <option value="Estudiante de Medicina">Estudiante de Medicina</option>
                      </select>
                    </div>

                    <div className="ob-mn-field accent">
                      <GraduationCap size={19} />
                      <select value={graduationYear} onChange={(e) => setGraduationYear(e.target.value)}>
                        <option value="" disabled>Año Egreso...</option>
                        {['2027', '2026', '2025', '2024', '2023', '2022', '2021', '2020 o anterior'].map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>

                    <div className="ob-mn-field accent">
                      <Building2 size={19} />
                      <select
                        className={university ? '' : 'is-empty'}
                        value={university}
                        onChange={(e) => {
                          const val = e.target.value
                          setUniversity(val)
                          const sedes = getSedesForUniversity(val)
                          if (sedes && sedes.length > 0) {
                            setSede(sedes[0])
                          }
                        }}
                      >
                        <option value="" disabled>Selecciona tu universidad...</option>
                        {CHILEAN_UNIVERSITIES.map((u) => (
                          <option key={u.id} value={u.name}>
                            {u.flag} {u.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {university && (
                      <div className="ob-mn-field accent">
                        <MapPin size={19} />
                        <select value={sede} onChange={(e) => setSede(e.target.value)}>
                          <option value="" disabled>Selecciona tu sede / campus...</option>
                          {getSedesForUniversity(university).map((s) => (
                            <option key={s} value={s}>
                              Sede: {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="ob-mn-field accent">
                      <Globe2 size={19} />
                      <select value={studyCountry} onChange={(e) => setStudyCountry(e.target.value)}>
                        {COUNTRIES.filter(c => c.name !== 'Chile').map((c) => (
                          <option key={c.code} value={c.name}>{c.flag} {c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="ob-mn-field accent">
                      <GraduationCap size={19} />
                      <select value={graduationYear} onChange={(e) => setGraduationYear(e.target.value)}>
                        <option value="" disabled>Año Egreso...</option>
                        {['2027', '2026', '2025', '2024', '2023', '2022', '2021', '2020 o anterior'].map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>

                    <div className="ob-mn-field accent">
                      <Building2 size={19} />
                      <input
                        type="text"
                        placeholder="Nombre de tu universidad (ej: UCV, UBA, UNMSM...)"
                        value={customUniversity}
                        onChange={(e) => setCustomUniversity(e.target.value)}
                      />
                    </div>
                  </>
                )}

                {/* Live Preview Badge */}
                <div className="ob-mn-preview">
                  <span>Insignia de perfil:</span>
                  <div>
                    <UserInstitutionBadge
                      user={{
                        university: studyLocation === 'chile' ? university : customUniversity,
                        sede: studyLocation === 'chile' ? (sede || 'Sede Principal') : (studyCountry || 'Extranjero'),
                        country: studyLocation === 'chile' ? 'Chile' : studyCountry
                      }}
                      size={26}
                      showLabel={true}
                      labelStyle={{ color: '#e2e8f0', fontWeight: 700, fontSize: '0.8rem', maxWidth: '150px' }}
                    />
                  </div>
                </div>
              </div>

              {error && <div className="ob-mn-err">{error}</div>}

              <div className="ob-mn-actions">
                <button type="button" className="ob-mn-back" onClick={() => setStep(1)} aria-label="Volver">
                  <ChevronLeft size={18} />
                </button>
                <button type="button" className="ob-mn-btn" onClick={handleNextFromStep2}>
                  <span>Continuar</span>
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              STEP 3: OBJETIVO & FECHA
          ═══════════════════════════════════════════════════════════════ */}
          {step === 3 && (
            <div>
              <div className="ob-mn-head">
                <span className="ob-mn-eyebrow">Paso 3 de {TOTAL_INTERACTIVE_STEPS}</span>
                <h2 className="ob-mn-h">Tu Meta</h2>
              </div>

              <div className="ob-mn-stack tight">
                {[
                  { id: 'beca', label: 'Beca de Especialidad (> 75 - 80%)', Icon: Trophy },
                  { id: 'pass_51', label: 'Aprobar EUNACOM (≥ 51%)', Icon: Target },
                  { id: 'reval', label: 'Revalidación de Título', Icon: Stethoscope },
                ].map(({ id, label, Icon }) => (
                  <div
                    key={id}
                    className={`ob-mn-choice ${goal === id ? 'is-on' : ''}`}
                    onClick={() => setGoal(id)}
                  >
                    <span className="ob-mn-ic"><Icon size={18} /></span>
                    <div className="ob-mn-choice-t">{label}</div>
                    {goal === id && <CheckCircle2 size={18} className="ob-mn-check" />}
                  </div>
                ))}

                {/* Fecha Examen */}
                <div style={{ marginTop: '0.4rem' }}>
                  <label className="ob-mn-label">
                    <Calendar size={13} /> ¿Cuándo rindes el examen?
                  </label>
                  <div className="ob-mn-grid2">
                    <select className="ob-mn-select" value={examMonth} onChange={(e) => setExamMonth(e.target.value)}>
                      <option value="Julio">Julio</option>
                      <option value="Diciembre">Diciembre</option>
                    </select>

                    <select className="ob-mn-select" value={examYear} onChange={(e) => setExamYear(e.target.value)}>
                      <option value="2025">2025</option>
                      <option value="2026">2026</option>
                      <option value="2027">2027</option>
                    </select>
                  </div>
                </div>
              </div>

              {error && <div className="ob-mn-err">{error}</div>}

              <div className="ob-mn-actions">
                <button type="button" className="ob-mn-back" onClick={() => setStep(2)} aria-label="Volver">
                  <ChevronLeft size={18} />
                </button>
                <button type="button" className="ob-mn-btn" onClick={handleNextFromStep3}>
                  <span>Continuar</span>
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              STEP 4: ENFOQUE & RITMO DIARIO
          ═══════════════════════════════════════════════════════════════ */}
          {step === 4 && (
            <div>
              <div className="ob-mn-head">
                <span className="ob-mn-eyebrow">Paso 4 de {TOTAL_INTERACTIVE_STEPS}</span>
                <h2 className="ob-mn-h">Enfoque de Estudio</h2>
              </div>

              <div className="ob-mn-stack tight">
                {[
                  { title: 'Medicina Interna', badge: '37%', Icon: HeartPulse },
                  { title: 'Pediatría', badge: 'Frecuente', Icon: Baby },
                  { title: 'Ginecología y Obstetricia', badge: 'GES', Icon: Venus },
                  { title: 'Cirugía General', badge: 'Frecuente', Icon: Scissors },
                  { title: 'Salud Pública', badge: 'Fija', Icon: BarChart3 },
                ].map(({ title, badge, Icon }) => (
                  <div
                    key={title}
                    className={`ob-mn-choice ${weakArea.startsWith(title) ? 'is-on' : ''}`}
                    onClick={() => setWeakArea(title)}
                  >
                    <span className="ob-mn-ic"><Icon size={17} /></span>
                    <div className="ob-mn-choice-t">{title}</div>
                    <span className="ob-mn-tag">{badge}</span>
                  </div>
                ))}

                {/* Tiempo de estudio */}
                <div style={{ marginTop: '0.4rem' }}>
                  <label className="ob-mn-label">
                    <Clock size={13} /> Tiempo diario disponible:
                  </label>
                  <div className="ob-mn-grid3">
                    {[
                      { label: '15-20 min', sub: 'Express' },
                      { label: '45 min', sub: 'Recomendado' },
                      { label: '2+ horas', sub: 'Intensivo' },
                    ].map((opt) => (
                      <button
                        key={opt.label}
                        type="button"
                        className={`ob-mn-seg stacked ${studyHours.includes(opt.label) ? 'is-on' : ''}`}
                        onClick={() => setStudyHours(`${opt.label}/día (${opt.sub})`)}
                      >
                        <span>{opt.label}</span>
                        <small>{opt.sub}</small>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="ob-mn-actions">
                <button type="button" className="ob-mn-back" onClick={() => setStep(3)} aria-label="Volver">
                  <ChevronLeft size={18} />
                </button>
                <button type="button" className="ob-mn-btn" onClick={handleGeneratePlan}>
                  <span>Generar Plan</span>
                  <Sparkles size={18} />
                </button>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              STEP 5: CALCULANDO TU PLAN
          ═══════════════════════════════════════════════════════════════ */}
          {step === 5 && (
            <div className="ob-mn-calc">
              <div className="ob-mn-orb">
                <Loader2 size={32} className="ob-mn-spin" />
              </div>

              <h3 className="ob-mn-h">Generando tu Plan Personalizado...</h3>

              <p className="ob-mn-calc-msg">{calcMessages[calcTextIdx]}</p>

              <div className="ob-mn-bar">
                <b style={{ width: `${calcProgress}%` }} />
              </div>

              <div className="ob-mn-pct">{calcProgress}% Completado</div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              STEP 6: REVEAL FINAL & BOTÓN DE ARRANQUE
          ═══════════════════════════════════════════════════════════════ */}
          {step === 6 && (() => {
            const userBadge = getUserInstitutionBadge({
              university: studyLocation === 'chile' ? university : (customUniversity || studyCountry),
              sede: studyLocation === 'chile' ? (sede || 'Sede Principal') : (studyCountry || 'Extranjero'),
              country: studyLocation === 'chile' ? 'Chile' : studyCountry
            })

            const formationDisplay = studyLocation === 'chile'
              ? (userBadge.primaryLabel || university || 'Chile')
              : (customUniversity.trim() || studyCountry || 'Extranjero')

            const formationFull = studyLocation === 'chile'
              ? (university || 'Chile')
              : (customUniversity.trim() ? `${studyCountry} - ${customUniversity.trim()}` : studyCountry)

            const goalDisplay = goal === 'beca'
              ? 'Beca >75%'
              : goal === 'pass_51'
                ? 'Aprobar ≥51%'
                : 'Revalidación'

            const priorityDisplay = weakArea.split('/')[0].trim()

            return (
              <div>
                <div className="ob-mn-head" style={{ marginBottom: '1.1rem' }}>
                  <div className="ob-mn-chip">
                    <Sparkles size={13} />
                    <span>Plan Personalizado 2026</span>
                  </div>
                  <h2 className="ob-mn-h">¡Listo, {greeting}!</h2>
                  <p className="ob-mn-p">Tu algoritmo de estudio ha sido calibrado a tu meta.</p>
                </div>

                {/* Plan Pass Card */}
                <div className="ob-mn-pass">
                  <div className="ob-mn-pass-top">
                    <div className="ob-mn-pass-brand">
                      <EunacomLogoIcon size={22} />
                      <span>eunacom<em>app</em></span>
                    </div>
                    <span className="ob-mn-pass-tag">Perfil 2026</span>
                  </div>

                  <div className="ob-mn-stats">
                    <div className="ob-mn-stat" title={`Meta: ${goalDisplay}`}>
                      <div className="ob-mn-stat-k"><Target size={12} /> Objetivo</div>
                      <div className="ob-mn-stat-v"><span>{goalDisplay}</span></div>
                    </div>

                    <div className="ob-mn-stat" title={`Examen: ${examMonth} ${examYear}`}>
                      <div className="ob-mn-stat-k"><Calendar size={12} /> Fecha Examen</div>
                      <div className="ob-mn-stat-v"><span>{examMonth} {examYear}</span></div>
                    </div>

                    <div className="ob-mn-stat" title={formationFull}>
                      <div className="ob-mn-stat-k"><Landmark size={12} /> Formación</div>
                      <div className="ob-mn-stat-v">
                        {userBadge.flag && <span style={{ flexShrink: 0, fontSize: '0.75rem' }}>{userBadge.flag}</span>}
                        <span>{formationDisplay}</span>
                      </div>
                    </div>

                    <div className="ob-mn-stat" title={`Prioridad: ${weakArea}`}>
                      <div className="ob-mn-stat-k"><Zap size={12} /> Prioridad</div>
                      <div className="ob-mn-stat-v sky"><span>{priorityDisplay}</span></div>
                    </div>
                  </div>

                  <div className="ob-mn-pass-foot">
                    <span>
                      <Clock size={13} />
                      <span>{studyHours.split('(')[0].trim()}</span>
                    </span>
                    <span className="ob-mn-ok">
                      <CheckCircle2 size={12} />
                      <span>Algoritmo activo</span>
                    </span>
                  </div>
                </div>

                {error && <div className="ob-mn-err" style={{ marginTop: 0, marginBottom: '0.85rem' }}>{error}</div>}

                <button type="button" className="ob-mn-btn" onClick={handleFinish} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 size={18} className="ob-mn-spin" />
                      <span>Guardando tu plan...</span>
                    </>
                  ) : (
                    <>
                      <span>¡Empezar a Estudiar Ahora!</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            )
          })()}
        </div>
      </div>
    </>
  )
}

export default Onboarding
