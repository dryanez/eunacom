import React, { useState, useEffect, useMemo } from 'react'
import {
  User, Phone, ChevronDown, ChevronLeft, ArrowRight, Search, Check, Loader2,
  Zap, Target, Flame, Clock, Star, Globe2,
} from 'lucide-react'
import { EunacomLogo } from './EunacomLogo'
import Flag from './Flag'
import SpecialtyIcon from './redesign/SpecialtyIcon'
import './redesign/onboarding.css'
import { track } from '../lib/analytics'
import { saveUserProfile, fetchUserProfile } from '../lib/api'

// Registro (opción 4, nov-2026): 3 pasos — datos, universidad (país → región → escudo), enfoque — y el plan listo.
// Se guarda lo respondido al final de cada paso, y desde el paso 2 se puede «Saltar» y entrar igual a la app.

// ─── WhatsApp: códigos y validación ──────────────────────────────────────
const COUNTRY_CODES = [
  { code: '+56', iso: 'CL', country: 'Chile', minDigits: 9, maxDigits: 9, placeholder: '9 1234 5678' },
  { code: '+591', iso: 'BO', country: 'Bolivia', minDigits: 8, maxDigits: 8, placeholder: '7123 4567' },
  { code: '+593', iso: 'EC', country: 'Ecuador', minDigits: 9, maxDigits: 9, placeholder: '91 234 5678' },
  { code: '+58', iso: 'VE', country: 'Venezuela', minDigits: 10, maxDigits: 10, placeholder: '412 123 4567' },
  { code: '+54', iso: 'AR', country: 'Argentina', minDigits: 10, maxDigits: 11, placeholder: '9 11 1234 5678' },
  { code: '+57', iso: 'CO', country: 'Colombia', minDigits: 10, maxDigits: 10, placeholder: '300 123 4567' },
  { code: '+51', iso: 'PE', country: 'Perú', minDigits: 9, maxDigits: 9, placeholder: '912 345 678' },
  { code: '+53', iso: 'CU', country: 'Cuba', minDigits: 8, maxDigits: 8, placeholder: '5 123 4567' },
  { code: '+52', iso: 'MX', country: 'México', minDigits: 10, maxDigits: 10, placeholder: '55 1234 5678' },
  { code: '+34', iso: 'ES', country: 'España', minDigits: 9, maxDigits: 9, placeholder: '612 345 678' },
  { code: '+595', iso: 'PY', country: 'Paraguay', minDigits: 9, maxDigits: 9, placeholder: '981 123 456' },
  { code: '+598', iso: 'UY', country: 'Uruguay', minDigits: 8, maxDigits: 8, placeholder: '94 123 456' },
  { code: '+1809', iso: 'DO', country: 'República Dominicana', minDigits: 7, maxDigits: 7, placeholder: '123 4567' },
  { code: '+502', iso: 'GT', country: 'Guatemala', minDigits: 8, maxDigits: 8, placeholder: '5123 4567' },
  { code: '+504', iso: 'HN', country: 'Honduras', minDigits: 8, maxDigits: 8, placeholder: '9123 4567' },
  { code: '+503', iso: 'SV', country: 'El Salvador', minDigits: 8, maxDigits: 8, placeholder: '7123 4567' },
  { code: '+505', iso: 'NI', country: 'Nicaragua', minDigits: 8, maxDigits: 8, placeholder: '8123 4567' },
  { code: '+506', iso: 'CR', country: 'Costa Rica', minDigits: 8, maxDigits: 8, placeholder: '8312 3456' },
  { code: '+507', iso: 'PA', country: 'Panamá', minDigits: 8, maxDigits: 8, placeholder: '6123 4567' },
  { code: '+1', iso: 'PR', country: 'EE.UU. / Puerto Rico', minDigits: 10, maxDigits: 10, placeholder: '787 555 0123' },
  { code: '+', iso: '', country: 'Otro', minDigits: 7, maxDigits: 13, placeholder: '123456789' },
]

function validatePhone(rawNumber, selectedCode) {
  const digits = (rawNumber || '').replace(/\D/g, '')
  if (!digits) return { valid: false, message: 'Ingresa tu número de WhatsApp.' }
  const isRepeating = /^(\d)\1+$/.test(digits)
  const isSequence = '01234567890123456789'.includes(digits) || '98765432109876543210'.includes(digits)
  if (isRepeating || isSequence || digits.length < 7) return { valid: false, message: 'Por favor ingresa un número de WhatsApp real.' }
  const rule = COUNTRY_CODES.find(c => c.code === selectedCode) || COUNTRY_CODES[0]
  if (rule.minDigits && digits.length < rule.minDigits) return { valid: false, message: `El número para ${rule.country} debe tener al menos ${rule.minDigits} dígitos.` }
  if (rule.maxDigits && digits.length > rule.maxDigits) return { valid: false, message: `El número para ${rule.country} no debe superar ${rule.maxDigits} dígitos.` }
  return { valid: true }
}

const AREAS = [
  { title: 'Medicina Interna', icon: 'Cardiología', note: '37% del examen' },
  { title: 'Pediatría', icon: 'Pediatría', note: 'Muy frecuente' },
  { title: 'Ginecología y Obstetricia', icon: 'Obstetricia', note: 'Muy frecuente' },
  { title: 'Cirugía General', icon: 'Cirugía', note: 'Muy frecuente' },
  { title: 'Salud Pública', icon: 'Salud Pública', note: 'Fija en cada examen' },
]
const PACES = [
  { label: '15-20 min', sub: 'Express', Icon: Zap },
  { label: '45 min', sub: 'Recomendado', Icon: Target },
  { label: '2+ horas', sub: 'Intensivo', Icon: Flame },
]
const SITUACIONES_CL = ['Médico Titulado (Chile)', 'Interno de Medicina (Chile)', 'Estudiante de Medicina']
const SITUACION_LABEL = { 'Médico Titulado (Chile)': 'Titulado(a)', 'Interno de Medicina (Chile)': 'Interno(a)', 'Estudiante de Medicina': 'Estudiante' }
const YEARS = ['2027', '2026', '2025', '2024', '2023', '2022', '2021', '2020 o anterior']

// Datos de escuelas (país → región → escuela con escudo). Se cargan una vez.
let schoolsCache = null
function useSchools() {
  const [data, setData] = useState(schoolsCache)
  useEffect(() => {
    if (schoolsCache) return
    fetch('/data/escuelas-medicina.json').then(r => r.json()).then(d => { schoolsCache = d; setData(d) }).catch(() => setData([]))
  }, [])
  return data
}

function Crest({ school, size = 52 }) {
  const s = { width: size, height: size }
  if (!school?.logo) {
    const sig = school?.sigla || '?'
    return <span className="ob4-crest is-text" style={{ ...s, fontSize: sig.length <= 4 ? size * 0.25 : size * 0.18 }}>{sig}</span>
  }
  return (
    <span className={`ob4-crest ${school.dark ? 'is-dark' : ''}`} style={s}>
      <img src={school.logo} alt="" loading="lazy" style={{ maxWidth: size * 0.74, maxHeight: size * 0.74 }} />
    </span>
  )
}

const Onboarding = ({ user, onComplete }) => {
  const schools = useSchools()
  const [step, setStep] = useState(1) // 1 datos · 2 país · 3 universidad · 4 enfoque · 5 plan listo

  const [firstName, setFirstName] = useState(() => (user?.user_metadata?.full_name || '').split(' ')[0] || '')
  const [lastName, setLastName] = useState(() => (user?.user_metadata?.full_name || '').split(' ').slice(1).join(' ') || '')
  const [countryCode, setCountryCode] = useState('+56')
  const [codeOpen, setCodeOpen] = useState(false)
  const [whatsapp, setWhatsapp] = useState('')

  const [countryIso, setCountryIso] = useState('')
  const [region, setRegion] = useState('ALL')
  const [query, setQuery] = useState('')
  const [schoolId, setSchoolId] = useState('')
  const [customUni, setCustomUni] = useState('')
  const [notListed, setNotListed] = useState(false)
  const [situacion, setSituacion] = useState('Médico Titulado (Chile)')
  const [graduationYear, setGraduationYear] = useState('2025')

  const [weakArea, setWeakArea] = useState('Medicina Interna')
  const [pace, setPace] = useState('45 min')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Si ya había empezado (se guardó un paso y se fue), retoma con lo que respondió y en el paso que le falta
  const [resumed, setResumed] = useState(false)
  useEffect(() => {
    if (!schools || resumed || !user?.id) return
    setResumed(true)
    fetchUserProfile(user.id).then(p => {
      if (!p) return
      if (p.first_name) setFirstName(p.first_name)
      if (p.last_name) setLastName(p.last_name)
      const wa = String(p.whatsapp || '').trim().match(/^(\+\d*)\s+(\d+)$/)
      if (wa && COUNTRY_CODES.some(c => c.code === wa[1])) { setCountryCode(wa[1]); setWhatsapp(wa[2]) }
      const c = schools.find(x => x.name === p.country)
      let s = null
      if (c) {
        setCountryIso(c.code)
        const uni = String(p.university || '').replace(`${c.name} - `, '')
        s = c.schools.find(x => x.name === uni)
        if (s) setSchoolId(s.id)
        else if (uni) { setNotListed(true); setCustomUni(uni) }
      } else if (p.country === 'Otro') { setCountryIso('OTRO'); setCustomUni(String(p.university || '').replace(/^[^-]+ - /, '')) }
      if (SITUACIONES_CL.includes(p.profile_type)) setSituacion(p.profile_type)
      if (YEARS.includes(p.graduation_year)) setGraduationYear(p.graduation_year)
      const hasData = p.first_name && p.last_name && wa
      if (hasData) setStep(p.university ? 4 : (c ? 3 : 2))
    }).catch(() => {})
  }, [schools, resumed, user?.id])

  const country = useMemo(() => (schools || []).find(c => c.code === countryIso) || null, [schools, countryIso])
  const school = country?.schools.find(s => s.id === schoolId) || null
  const isChile = countryIso === 'CL'
  const rule = COUNTRY_CODES.find(c => c.code === countryCode) || COUNTRY_CODES[0]

  const regions = useMemo(() => {
    if (!country) return []
    const m = new Map()
    country.schools.forEach(s => s.regions.forEach(r => m.set(r, (m.get(r) || 0) + 1)))
    return [...m.entries()].sort((a, b) => b[1] - a[1])
  }, [country])

  const visibleSchools = useMemo(() => {
    if (!country) return []
    const q = query.trim().toLowerCase()
    return country.schools.filter(s =>
      (q ? (s.sigla + ' ' + s.name + ' ' + (s.short || '')).toLowerCase().includes(q) : (region === 'ALL' || s.regions.includes(region))))
  }, [country, region, query])

  const universityString = () => {
    if (notListed || !country) return customUni.trim() ? (isChile ? customUni.trim() : `${country?.name || 'Extranjero'} - ${customUni.trim()}`) : ''
    if (!school) return ''
    return isChile ? school.name : `${country.name} - ${school.name}`
  }

  const buildProfile = (done) => {
    const countryName = country?.name || (countryIso === 'OTRO' ? 'Otro' : '')
    const regionName = region !== 'ALL' ? region : (school?.regions?.[0] || '')
    return {
      id: user.id,
      email: user.email,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      country_code: countryCode,
      whatsapp: `${countryCode} ${whatsapp.trim().replace(/\D/g, '')}`,
      nationality: countryName || undefined,
      country: countryName || undefined,
      profile_type: countryIso ? (isChile ? situacion : 'Médico Extranjero (Revalidación)') : undefined,
      goal: countryIso ? (isChile ? 'pass_51' : 'reval') : undefined,
      graduation_year: countryIso ? graduationYear : undefined,
      university: universityString() || undefined,
      sede: countryIso ? (regionName || countryName) : undefined,
      weak_area: step >= 4 ? weakArea : undefined,
      study_hours: step >= 4 ? `${pace}/día (${PACES.find(p => p.label === pace)?.sub})` : undefined,
      xp: 50,
      onboarding_done: done,
    }
  }

  // Guarda lo respondido hasta ahora sin cerrar el cuestionario (si se va, no pierde lo hecho)
  const saveProgress = () => { saveUserProfile(buildProfile(false)).catch(() => {}) }

  const next1 = () => {
    if (!firstName.trim()) return setError('Por favor ingresa tu nombre.')
    if (!lastName.trim()) return setError('Por favor ingresa tu apellido.')
    const v = validatePhone(whatsapp, countryCode)
    if (!v.valid) return setError(v.message)
    setError(''); saveProgress(); setStep(2)
  }
  const pickCountry = (iso) => {
    setCountryIso(iso); setRegion('ALL'); setQuery(''); setSchoolId(''); setNotListed(false); setError('')
  }
  const next2 = () => {
    if (!countryIso) return setError('Elige el país donde estudiaste Medicina.')
    setError(''); setStep(3)
  }
  const next3 = () => {
    if (!universityString()) return setError(notListed || !country ? 'Escribe el nombre de tu universidad.' : 'Elige tu universidad (o toca «No está mi universidad»).')
    setError(''); saveProgress(); setStep(4)
  }

  const finish = async () => {
    setSaving(true); setError('')
    try {
      await onComplete(buildProfile(true))
      track('sign_up_completed', {
        signup_method: user.app_metadata?.provider || 'email',
        study_location: isChile ? 'chile' : 'extranjero',
        country: country?.name || 'Otro',
        university_from_list: Boolean(school),
      })
    } catch (e) {
      console.error('Onboarding save error:', e)
      setError('No se pudo guardar. Revisa tu conexión e intenta de nuevo.')
      setSaving(false)
    }
  }
  const skip = async () => {
    setSaving(true); setError('')
    try { await onComplete(buildProfile(true)); track('onboarding_skipped', { step }) }
    catch { setSaving(false); setError('No se pudo guardar. Intenta de nuevo.') }
  }

  const progress = { 1: 25, 2: 50, 3: 75, 4: 100 }[step]
  const greet = firstName.trim() ? (/^dr(a|\(a\))?\.?(\s|$)/i.test(firstName.trim()) ? firstName.trim() : `Dr(a). ${firstName.trim()}`) : 'Doctor(a)'

  return (
    <>
      <div className="ob-mn-backdrop" />
      <div className="ob-mn-overlay">
        <div className="ob-mn ob4" role="dialog" aria-modal="true">

          {step <= 4 && (
            <div className="ob4-top">
              {step > 1 ? (
                <button type="button" className="ob4-icon" onClick={() => { setError(''); setStep(step - 1) }} aria-label="Volver"><ChevronLeft size={20} /></button>
              ) : <EunacomLogo size={24} textColor="#f1f5f9" accentColor="#38bdf8" />}
              <div className="ob4-prog"><i style={{ width: `${progress}%` }} /></div>
              {step > 1
                ? <button type="button" className="ob4-skip" onClick={skip} disabled={saving}>Saltar</button>
                : <span className="ob4-xp">+50 XP</span>}
            </div>
          )}

          {/* ── PASO 1: DATOS ── */}
          {step === 1 && (
            <div className="ob4-body">
              <h2 className="ob4-h">¿Cómo te llamas?</h2>
              <p className="ob4-p">Y tu WhatsApp para avisarte de simulacros y clases en vivo.</p>
              <label className="ob4-label">Nombre</label>
              <div className="ob4-field"><User size={16} /><input type="text" placeholder="Nombre" value={firstName} onChange={e => setFirstName(e.target.value)} autoComplete="given-name" /></div>
              <label className="ob4-label">Apellido</label>
              <div className="ob4-field"><User size={16} /><input type="text" placeholder="Apellido" value={lastName} onChange={e => setLastName(e.target.value)} autoComplete="family-name" /></div>
              <label className="ob4-label">WhatsApp</label>
              <div className="ob4-row">
                <div className="ob4-code">
                  <button type="button" className="ob4-field ob4-code-btn" onClick={() => setCodeOpen(o => !o)} aria-expanded={codeOpen}>
                    <Flag code={rule.iso} size={22} /><span>{rule.code}</span><ChevronDown size={14} />
                  </button>
                  {codeOpen && (
                    <div className="ob4-code-list" role="listbox">
                      {COUNTRY_CODES.map(c => (
                        <button key={c.code + c.country} type="button" role="option" aria-selected={c.code === countryCode}
                          className={c.code === countryCode ? 'on' : ''} onClick={() => { setCountryCode(c.code); setCodeOpen(false) }}>
                          <Flag code={c.iso} size={22} /><span>{c.country}</span><small>{c.code}</small>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="ob4-field" style={{ flex: 1 }}><Phone size={15} /><input type="tel" inputMode="tel" placeholder={rule.placeholder} value={whatsapp} onChange={e => setWhatsapp(e.target.value)} autoComplete="tel-national" /></div>
              </div>
              {error && <div className="ob-mn-err">{error}</div>}
              <button type="button" className="ob4-btn" onClick={next1}>Continuar <ArrowRight size={17} /></button>
            </div>
          )}

          {/* ── PASO 2: PAÍS ── */}
          {step === 2 && (
            <div className="ob4-body">
              <h2 className="ob4-h">¿Dónde estudiaste Medicina?</h2>
              {!schools ? <div className="ob4-loading"><Loader2 className="ob-mn-spin" size={22} /></div> : (
                <div className="ob4-flags">
                  {schools.map(c => (
                    <button key={c.code} type="button" className={`ob4-fl ${countryIso === c.code ? 'on' : ''}`} onClick={() => pickCountry(c.code)}>
                      <Flag code={c.code} size={36} radius={4} />
                      <span>{c.name === 'República Dominicana' ? 'R. Dominicana' : c.name}</span>
                    </button>
                  ))}
                  <button type="button" className={`ob4-fl ${countryIso === 'OTRO' ? 'on' : ''}`} onClick={() => pickCountry('OTRO')}>
                    <Globe2 size={24} strokeWidth={1.6} /><span>Otro país</span>
                  </button>
                </div>
              )}
              {error && <div className="ob-mn-err">{error}</div>}
              <button type="button" className="ob4-btn" onClick={next2}>Continuar <ArrowRight size={17} /></button>
            </div>
          )}

          {/* ── PASO 3: UNIVERSIDAD ── */}
          {step === 3 && (
            <div className="ob4-body">
              <button type="button" className="ob4-chosen" onClick={() => setStep(2)}>
                {country ? <Flag code={country.code} size={24} /> : <Globe2 size={20} />}
                <b>{country?.name || 'Otro país'}</b><span>Cambiar</span>
              </button>
              <h2 className="ob4-h" style={{ marginTop: '.8rem' }}>Tu universidad</h2>

              {country && !notListed && (
                <>
                  <div className="ob4-search"><Search size={15} /><input type="search" placeholder="Busca tu universidad" value={query} onChange={e => setQuery(e.target.value)} /></div>
                  {!query && (
                    <div className="ob4-chips">
                      <button type="button" className={region === 'ALL' ? 'on' : ''} onClick={() => setRegion('ALL')}>Todas<i>{country.schools.length}</i></button>
                      {regions.map(([r, n]) => (
                        <button key={r} type="button" className={region === r ? 'on' : ''} onClick={() => setRegion(r)}>{r}<i>{n}</i></button>
                      ))}
                    </div>
                  )}
                  <div className="ob4-unis">
                    {visibleSchools.map(s => (
                      <button key={s.id} type="button" className={`ob4-uni ${schoolId === s.id ? 'on' : ''}`} onClick={() => { setSchoolId(s.id); setError('') }} title={s.name}>
                        <Crest school={s} />
                        <b>{s.sigla}</b>
                        <small>{s.short || s.name}</small>
                      </button>
                    ))}
                    {!visibleSchools.length && <p className="ob4-p" style={{ gridColumn: '1/-1' }}>No encontramos «{query}».</p>}
                  </div>
                  <button type="button" className="ob4-link" onClick={() => { setNotListed(true); setSchoolId(''); setCustomUni(query) }}>No está mi universidad</button>
                </>
              )}

              {(notListed || !country) && (
                <>
                  <label className="ob4-label">Nombre de tu universidad</label>
                  <div className="ob4-field"><Search size={15} /><input type="text" placeholder="Ej: Universidad Nacional de…" value={customUni} onChange={e => setCustomUni(e.target.value)} autoFocus /></div>
                  {country && <button type="button" className="ob4-link" onClick={() => setNotListed(false)}>Volver a la lista</button>}
                </>
              )}

              {(school || notListed || !country) && (
                <div className="ob4-extra">
                  {isChile && (
                    <div className="ob4-seg">
                      {SITUACIONES_CL.map(s => (
                        <button key={s} type="button" className={situacion === s ? 'on' : ''} onClick={() => setSituacion(s)}>{SITUACION_LABEL[s]}</button>
                      ))}
                    </div>
                  )}
                  <div className="ob4-year">
                    <span>Año de egreso</span>
                    <select value={graduationYear} onChange={e => setGraduationYear(e.target.value)}>
                      {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {error && <div className="ob-mn-err">{error}</div>}
              <button type="button" className="ob4-btn" onClick={next3}>Continuar <ArrowRight size={17} /></button>
            </div>
          )}

          {/* ── PASO 4: ENFOQUE ── */}
          {step === 4 && (
            <div className="ob4-body">
              <h2 className="ob4-h">¿Qué área te cuesta más?</h2>
              <div className="ob4-areas">
                {AREAS.map(a => (
                  <button key={a.title} type="button" className={`ob4-area ${weakArea === a.title ? 'on' : ''}`} onClick={() => setWeakArea(a.title)}>
                    <SpecialtyIcon name={a.icon} size={34} />
                    <span><b>{a.title}</b><small>{a.note}</small></span>
                    {weakArea === a.title && <Check size={17} />}
                  </button>
                ))}
              </div>
              <label className="ob4-label">Tiempo al día</label>
              <div className="ob4-pace">
                {PACES.map(({ label, sub, Icon }) => (
                  <button key={label} type="button" className={pace === label ? 'on' : ''} onClick={() => setPace(label)}>
                    <Icon size={15} /><b>{label}</b><small>{sub}</small>
                  </button>
                ))}
              </div>
              {error && <div className="ob-mn-err">{error}</div>}
              <button type="button" className="ob4-btn" onClick={() => { setError(''); setStep(5) }}>Crear mi plan <ArrowRight size={17} /></button>
            </div>
          )}

          {/* ── PLAN LISTO ── */}
          {step === 5 && (
            <div className="ob4-body ob4-done">
              <div className="ob4-ok"><Check size={30} strokeWidth={2.6} /></div>
              <h2 className="ob4-h" style={{ textAlign: 'center' }}>¡Listo, {greet}!</h2>
              <p className="ob4-p" style={{ textAlign: 'center' }}>Tu plan ya está activo.</p>
              <div className="ob4-sum">
                <div><SpecialtyIcon name={AREAS.find(a => a.title === weakArea)?.icon} size={30} /><span><small>Prioridad</small><b>{weakArea}</b></span></div>
                <div><Clock size={18} /><span><small>Tiempo al día</small><b>{pace}</b></span></div>
                <div>
                  {school ? <Crest school={school} size={30} /> : (country ? <Flag code={country.code} size={22} /> : <Globe2 size={18} />)}
                  <span><small>Formación</small><b>{school ? `${school.sigla} · ${country.name}` : (universityString() || country?.name || '—')}</b></span>
                </div>
                <div><Star size={18} /><span><small>Bono de bienvenida</small><b className="ob4-green">+50 XP</b></span></div>
              </div>
              {error && <div className="ob-mn-err">{error}</div>}
              <button type="button" className="ob4-btn" onClick={finish} disabled={saving}>
                {saving ? <><Loader2 size={17} className="ob-mn-spin" /> Guardando…</> : <>Empezar a estudiar <ArrowRight size={17} /></>}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Onboarding
