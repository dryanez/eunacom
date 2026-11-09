import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useSubscription } from '../contexts/SubscriptionContext'
import { useTheme } from '../contexts/ThemeContext'
import '../components/redesign/midnight.css'
import '../components/redesign/settings.css'
import { fetchUserProfile, saveUserProfile } from '../lib/api'
import { supabase } from '../lib/supabase'
import { DOCTOR_CHARACTERS, getRandomDoctorAvatar, getDoctorAvatar, isDoctorUnlocked } from '../utils/doctorAvatars'
import { calculateUserOverallStats, getDoctorForLevel } from '../utils/xpSystem'
import { CHILEAN_UNIVERSITIES, COUNTRIES, getSedesForUniversity, UserInstitutionBadge } from '../utils/universityAndCountry'
import {
  User, Settings, Shield, Lock, CreditCard, Target,
  CheckCircle2, AlertTriangle, ExternalLink, LogOut, ChevronRight,
  Calendar, Building2, GraduationCap, Clock, Award, Key, Save,
  Flame, Check, Loader2, Globe, MapPin, Shuffle, Sparkles, RefreshCw,
  Sun, Moon, Palette, BarChart3, History, MessageCircle
} from 'lucide-react'

const PRIVACY_URL = 'https://eunacom.app/privacy'
const TERMS_URL = 'https://eunacom.app/terms'

const UserSettings = () => {
  const { user, signOut } = useAuth()
  const { isPremium, isFounder, setShowPaymentModal, planMonths = 0 } = useSubscription()
  const { theme, isDark, toggleTheme, setTheme } = useTheme()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('profile')
  const [profile, setProfile] = useState(null)
  const [userLevel, setUserLevel] = useState(1)
  const [lockNotice, setLockNotice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [error, setError] = useState(null)

  // Form Fields
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [avatarCharacter, setAvatarCharacter] = useState('dr_dorian')
  const [university, setUniversity] = useState('')
  const [sede, setSede] = useState('')
  const [country, setCountry] = useState('Chile')
  const [graduationYear, setGraduationYear] = useState('')
  const [goal, setGoal] = useState('beca')
  const [examMonth, setExamMonth] = useState('Diciembre')
  const [examYear, setExamYear] = useState('2026')
  const [weakArea, setWeakArea] = useState('Medicina Interna / Cardiología')

  // Password Change State
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  // Delete Account State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!user) return
    Promise.all([
      fetchUserProfile(user.id).catch(() => null),
      calculateUserOverallStats(user.id).catch(() => ({ level: 1 }))
    ]).then(([data, stats]) => {
      const currentLevel = stats?.level || 1
      setUserLevel(currentLevel)
      if (data) {
        setProfile(data)
        setFirstName(data.first_name || user.user_metadata?.full_name?.split(' ')[0] || '')
        setLastName(data.last_name || user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '')
        
        // Ensure chosen avatar is unlocked for user's level
        const defaultDoc = getDoctorForLevel(currentLevel)
        const chosen = data.avatar_character
        if (chosen && isDoctorUnlocked(chosen, currentLevel)) {
          setAvatarCharacter(chosen)
        } else {
          setAvatarCharacter(defaultDoc.id)
        }
        
        setUniversity(data.university || '')
        setSede(data.sede || '')
        setCountry(data.country || data.nationality || 'Chile')
        setGraduationYear(data.graduation_year || '2025')
        setGoal(data.goal || 'beca')
        setExamMonth(data.exam_month || 'Diciembre')
        setExamYear(data.exam_year || '2026')
        setWeakArea(data.weak_area || 'Medicina Interna / Cardiología')
      } else {
        const defaultDoc = getDoctorForLevel(currentLevel)
        setAvatarCharacter(defaultDoc.id)
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [user])

  const handleSaveProfile = async (e) => {
    e?.preventDefault()
    setSaving(true)
    setError(null)
    setSaveSuccess(false)
    try {
      await saveUserProfile({
        id: user.id,
        email: user.email,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        avatar_character: avatarCharacter,
        university,
        sede,
        country,
        nationality: country,
        graduation_year: graduationYear,
        goal,
        exam_month: examMonth,
        exam_year: examYear,
        weak_area: weakArea,
      })
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      setError('Error al guardar cambios: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleRandomAvatar = () => {
    const unlockedDocs = DOCTOR_CHARACTERS.filter(d => (d.level || 1) <= userLevel)
    if (unlockedDocs.length > 0) {
      const randomDoc = unlockedDocs[Math.floor(Math.random() * unlockedDocs.length)]
      setAvatarCharacter(randomDoc.id)
      setLockNotice(null)
    }
  }

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    if (!newPassword || newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }
    setPasswordLoading(true)
    setError(null)
    setPasswordSuccess(false)
    try {
      const { error: passErr } = await supabase.auth.updateUser({ password: newPassword })
      if (passErr) throw passErr
      setPasswordSuccess(true)
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPasswordSuccess(false), 3500)
    } catch (err) {
      setError('Error al actualizar contraseña: ' + err.message)
    } finally {
      setPasswordLoading(false)
    }
  }

  const selectedDoctor = DOCTOR_CHARACTERS.find((d) => d.id === avatarCharacter) || DOCTOR_CHARACTERS[0]

  if (!user) return null

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto', padding: '1rem 1rem 3rem' }}>

      {/* ─── Yo (Midnight Pro): perfil, plan y accesos ─── */}
      <section className="mn-yo">
        <div className="mn-row" style={{ gap: '.9rem' }}>
          <div className="mn-yo-avatar">{(profile?.first_name || user?.email || 'D').trim()[0].toUpperCase()}</div>
          <div style={{ minWidth: 0 }}>
            <h1 className="mn-h1" style={{ margin: 0 }}>
              {profile?.first_name ? `Dr(a). ${profile.first_name} ${profile.last_name || ''}`.trim() : (user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Mi cuenta')}
            </h1>
            <p className="mn-sub">{[profile?.university, `Nivel ${userLevel}`].filter(Boolean).join(' · ')}</p>
          </div>
        </div>

        <div className="mn-card mn-yo-plan">
          <div className="mn-sub">Tu plan</div>
          {isPremium ? (
            <>
              <b>{isFounder ? 'Founder · acceso total' : planMonths >= 1200 ? 'Acceso total' : planMonths ? `${planMonths} ${planMonths === 1 ? 'mes' : 'meses'} · Premium` : 'Premium'}</b>
              {profile?.premium_until && planMonths < 1200 && (
                <div className="mn-sub" style={{ marginTop: 4 }}>Vence el {new Date(profile.premium_until).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              )}
            </>
          ) : (
            <>
              <b>Plan gratuito</b>
              <button className="mn-btn" style={{ marginTop: '.6rem' }} onClick={() => setShowPaymentModal(true)}>Ver planes</button>
            </>
          )}
        </div>

        <div className="mn-card mn-list">
          {[
            { label: 'Estadísticas', icon: BarChart3, go: () => navigate('/stats') },
            { label: 'Historial', icon: History, go: () => navigate('/history') },
            { label: 'Mi meta y fecha de examen', icon: Target, go: () => setActiveTab('goals') },
            { label: 'Mi plan y pagos', icon: CreditCard, go: () => setActiveTab('plan') },
          ].map(({ label, icon: Icon, go }) => (
            <button key={label} className="mn-li" onClick={go}>
              <span className="mn-ic"><Icon size={18} /></span>
              <span className="mn-li-txt">{label}</span>
              <ChevronRight size={16} className="mn-li-go" />
            </button>
          ))}
        </div>

        <button className="mn-logout" onClick={async () => { await signOut(); navigate('/login') }}>
          <LogOut size={16} /> Cerrar sesión
        </button>

        <h2 className="mn-yo-sec">Configuración</h2>
      </section>

      {/* ─── Configuración (Midnight Pro): pestañas en chips + contenido ─── */}
      <div className="mn-set">
        <div className="mn-chips mn-set-tabs" role="tablist">
          {[
            { id: 'profile', label: 'Mi perfil', icon: User },
            { id: 'appearance', label: 'Apariencia', icon: isDark ? Moon : Sun },
            { id: 'goals', label: 'Objetivos', icon: Target },
            { id: 'plan', label: 'Plan y pagos', icon: CreditCard },
            { id: 'security', label: 'Seguridad', icon: Lock },
            { id: 'legal', label: 'Legal y ayuda', icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                className={activeTab === tab.id ? 'on' : ''}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        <div className="mn-set-body">

          {/* ═══ MI PERFIL (avatar + datos) ═══ */}
          {activeTab === 'profile' && (
            <div>
              <div className="mn-set-head">
                <div>
                  <h3>Perfil y avatar</h3>
                  <p>Tu nombre y tu personaje médico en la comunidad y el ranking.</p>
                </div>
                <button type="button" className="mn-set-ghost" onClick={handleRandomAvatar}>
                  <Shuffle size={13} />
                  <span>Aleatorio</span>
                </button>
              </div>

              <div className="mn-set-card mn-set-current">
                <img src={selectedDoctor.image || '/avatars/dr_strange.png'} alt={selectedDoctor.name} />
                <div>
                  <b>{selectedDoctor.name}</b>
                  <small>{selectedDoctor.specialty} · {selectedDoctor.show}</small>
                </div>
              </div>

              <div className="mn-set-row">
                <span className="mn-set-label">Elige tu personaje</span>
                <span className="mn-set-count">
                  Nivel {userLevel} · {DOCTOR_CHARACTERS.filter(d => (d.level || 1) <= userLevel).length}/{DOCTOR_CHARACTERS.length}
                </span>
              </div>

              {lockNotice && (
                <div className="mn-set-msg mn-set-msg--err">
                  <Lock size={14} />
                  <span>{lockNotice}</span>
                </div>
              )}

              <div className="mn-set-avatars">
                {DOCTOR_CHARACTERS.map((doc) => {
                  const isPicked = avatarCharacter === doc.id
                  const isUnlocked = (doc.level || 1) <= userLevel
                  return (
                    <button
                      key={doc.id}
                      type="button"
                      className={`mn-set-av${isPicked ? ' on' : ''}${isUnlocked ? '' : ' locked'}`}
                      aria-pressed={isPicked}
                      title={isUnlocked ? doc.name : `${doc.name} · se desbloquea en Nivel ${doc.level}`}
                      onClick={() => {
                        if (isUnlocked) {
                          setAvatarCharacter(doc.id)
                          setLockNotice(null)
                        } else {
                          setLockNotice(`${doc.name} se desbloquea al alcanzar el Nivel ${doc.level} (${doc.minXp} XP). Actualmente eres Nivel ${userLevel}.`)
                        }
                      }}
                    >
                      <span className="mn-set-av-img">
                        <img src={doc.image} alt={doc.name} />
                        {!isUnlocked && (
                          <span className="mn-set-av-lock"><Lock size={13} /></span>
                        )}
                        {isUnlocked && isPicked && (
                          <span className="mn-set-av-check"><Check size={10} strokeWidth={3} /></span>
                        )}
                      </span>
                      <span className="mn-set-av-name">{doc.name.split(' ')[1] || doc.name}</span>
                      <span className="mn-set-av-lv">Nv. {doc.level}</span>
                    </button>
                  )
                })}
              </div>

              <form onSubmit={handleSaveProfile}>
                <div className="mn-set-grid">
                  <label className="mn-set-field">
                    <span>Nombre</span>
                    <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Tu nombre" />
                  </label>
                  <label className="mn-set-field">
                    <span>Apellido</span>
                    <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Tu apellido" />
                  </label>
                </div>

                <label className="mn-set-field">
                  <span>Correo electrónico</span>
                  <input type="email" value={user.email} disabled />
                </label>

                <div className="mn-set-grid">
                  <label className="mn-set-field">
                    <span>País de formación</span>
                    <select value={country} onChange={(e) => setCountry(e.target.value)}>
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </label>
                  <label className="mn-set-field">
                    <span>Año de egreso</span>
                    <input type="text" value={graduationYear} onChange={(e) => setGraduationYear(e.target.value)} placeholder="Ej: 2025" />
                  </label>
                </div>

                <div className="mn-set-grid">
                  <label className="mn-set-field">
                    <span>Universidad</span>
                    <input
                      type="text"
                      value={university}
                      onChange={(e) => {
                        const val = e.target.value
                        setUniversity(val)
                        const sedes = getSedesForUniversity(val)
                        if (sedes && sedes.length > 0 && !sede) {
                          setSede(sedes[0])
                        }
                      }}
                      list="universities-list"
                      placeholder="Ej: Universidad de Chile"
                    />
                    <datalist id="universities-list">
                      {CHILEAN_UNIVERSITIES.map((u) => (
                        <option key={u.id} value={u.name} />
                      ))}
                    </datalist>
                  </label>
                  <label className="mn-set-field">
                    <span>Sede</span>
                    <input type="text" value={sede} onChange={(e) => setSede(e.target.value)} list="sedes-list" placeholder="Ej: Santiago / Central" />
                    <datalist id="sedes-list">
                      {getSedesForUniversity(university).map((s) => (
                        <option key={s} value={s} />
                      ))}
                    </datalist>
                  </label>
                </div>

                <div className="mn-set-card mn-set-badge">
                  <div>
                    <b>Insignia en el ranking</b>
                    <small>{university ? 'Escuela médica oficial' : 'País de origen'}</small>
                  </div>
                  <UserInstitutionBadge
                    user={{ university, sede, country }}
                    size={28}
                    showLabel={true}
                    labelStyle={{ color: '#f8fafc', fontWeight: 600, fontSize: '0.82rem' }}
                  />
                </div>

                {saveSuccess && (
                  <div className="mn-set-msg mn-set-msg--ok"><CheckCircle2 size={14} /><span>Perfil actualizado.</span></div>
                )}
                {error && (
                  <div className="mn-set-msg mn-set-msg--err"><AlertTriangle size={14} /><span>{error}</span></div>
                )}

                <button type="submit" className="mn-set-btn" disabled={saving}>
                  {saving ? <Loader2 size={15} className="spin" /> : <Save size={15} />}
                  <span>Guardar cambios</span>
                </button>
              </form>
            </div>
          )}

          {/* ═══ APARIENCIA ═══ */}
          {activeTab === 'appearance' && (
            <div>
              <div className="mn-set-head">
                <div>
                  <h3>Tema</h3>
                  <p>Cómo se ven las preguntas, simulacros y toda la plataforma.</p>
                </div>
              </div>

              <div className="mn-set-themes">
                {[
                  { id: 'dark', on: isDark, icon: Moon, title: 'Modo noche', sub: 'Recomendado · menos fatiga visual' },
                  { id: 'light', on: !isDark, icon: Sun, title: 'Modo claro', sub: 'Ideal en ambientes iluminados' },
                ].map((t) => {
                  const Icon = t.icon
                  return (
                    <button
                      key={t.id}
                      type="button"
                      className={`mn-set-theme mn-set-theme--${t.id}${t.on ? ' on' : ''}`}
                      aria-pressed={t.on}
                      onClick={() => setTheme(t.id)}
                    >
                      <span className="mn-set-theme-prev">
                        <i /><i /><i />
                      </span>
                      <span className="mn-set-theme-txt">
                        <Icon size={16} />
                        <span>
                          <b>{t.title}</b>
                          <small>{t.sub}</small>
                        </span>
                        {t.on && <span className="mn-set-tick"><Check size={11} strokeWidth={3} /></span>}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* ═══ PLAN Y PAGOS ═══ */}
          {activeTab === 'plan' && (
            <div>
              <div className="mn-set-head">
                <div>
                  <h3>Plan y membresía</h3>
                  <p>Estado de tu suscripción y acceso a la plataforma.</p>
                </div>
              </div>

              <div className={`mn-set-card${isPremium ? ' mn-set-card--ok' : ''}`}>
                <div className="mn-set-cardrow">
                  <span className="mn-ic"><Shield size={18} /></span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <b>{isPremium ? 'Plan Prime ilimitado' : 'Acceso estándar'}</b>
                    <small>{isPremium ? 'Membresía completa activa' : 'Preguntas, clases y simulacros'}</small>
                  </div>
                </div>
                <button type="button" className="mn-set-btn mn-set-btn--full" onClick={() => setShowPaymentModal(true)}>
                  <span>{isPremium ? 'Gestionar membresía' : 'Ver planes Prime'}</span>
                  <ChevronRight size={15} />
                </button>
              </div>

              <div className="mn-set-card">
                <div className="mn-set-cardrow">
                  <span className="mn-ic"><CreditCard size={18} /></span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <b>Pagos seguros</b>
                    <small>Webpay y Flow.cl, con boleta electrónica automática.</small>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══ OBJETIVOS ═══ */}
          {activeTab === 'goals' && (
            <div>
              <div className="mn-set-head">
                <div>
                  <h3>Objetivo de estudio</h3>
                  <p>Tu meta de puntaje y la fecha en que rindes.</p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile}>
                <span className="mn-set-label">Meta de rendimiento</span>
                <div className="mn-set-goals">
                  {[
                    { id: 'beca', label: 'Beca >75%', sub: 'Especialidad' },
                    { id: 'pass_51', label: 'Aprobar ≥51%', sub: 'Corte oficial' },
                    { id: 'reval', label: 'Revalidación', sub: 'Homologación' },
                  ].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      className={goal === g.id ? 'on' : ''}
                      aria-pressed={goal === g.id}
                      onClick={() => setGoal(g.id)}
                    >
                      <b>{g.label}</b>
                      <small>{g.sub}</small>
                    </button>
                  ))}
                </div>

                <div className="mn-set-grid">
                  <label className="mn-set-field">
                    <span>Mes de examen</span>
                    <select value={examMonth} onChange={(e) => setExamMonth(e.target.value)}>
                      <option value="Julio">Julio</option>
                      <option value="Diciembre">Diciembre</option>
                    </select>
                  </label>
                  <label className="mn-set-field">
                    <span>Año de examen</span>
                    <select value={examYear} onChange={(e) => setExamYear(e.target.value)}>
                      <option value="2025">2025</option>
                      <option value="2026">2026</option>
                      <option value="2027">2027</option>
                    </select>
                  </label>
                </div>

                {saveSuccess && (
                  <div className="mn-set-msg mn-set-msg--ok"><CheckCircle2 size={14} /><span>Metas actualizadas.</span></div>
                )}
                {error && (
                  <div className="mn-set-msg mn-set-msg--err"><AlertTriangle size={14} /><span>{error}</span></div>
                )}

                <button type="submit" className="mn-set-btn" disabled={saving}>
                  {saving ? <Loader2 size={15} className="spin" /> : <Save size={15} />}
                  <span>Guardar objetivos</span>
                </button>
              </form>
            </div>
          )}

          {/* ═══ SEGURIDAD ═══ */}
          {activeTab === 'security' && (
            <div>
              <div className="mn-set-head">
                <div>
                  <h3>Contraseña</h3>
                  <p>Actualiza tu contraseña de acceso.</p>
                </div>
              </div>

              <form onSubmit={handleUpdatePassword}>
                <div className="mn-set-grid">
                  <label className="mn-set-field">
                    <span>Nueva contraseña</span>
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Mínimo 6 caracteres" autoComplete="new-password" />
                  </label>
                  <label className="mn-set-field">
                    <span>Confirmar contraseña</span>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repite tu contraseña" autoComplete="new-password" />
                  </label>
                </div>

                {passwordSuccess && (
                  <div className="mn-set-msg mn-set-msg--ok"><CheckCircle2 size={14} /><span>Contraseña actualizada.</span></div>
                )}
                {error && (
                  <div className="mn-set-msg mn-set-msg--err"><AlertTriangle size={14} /><span>{error}</span></div>
                )}

                <button type="submit" className="mn-set-btn" disabled={passwordLoading}>
                  {passwordLoading ? <Loader2 size={15} className="spin" /> : <Key size={15} />}
                  <span>{passwordLoading ? 'Actualizando...' : 'Actualizar contraseña'}</span>
                </button>
              </form>
            </div>
          )}

          {/* ═══ LEGAL Y AYUDA ═══ */}
          {activeTab === 'legal' && (
            <div>
              <div className="mn-set-head">
                <div>
                  <h3>Legal y soporte</h3>
                  <p>Políticas y canales oficiales de ayuda.</p>
                </div>
              </div>

              <div className="mn-card mn-list" style={{ marginTop: 0 }}>
                {[
                  { href: PRIVACY_URL, label: 'Política de privacidad', icon: Shield },
                  { href: TERMS_URL, label: 'Términos y condiciones', icon: Shield },
                  { href: 'https://wa.me/56900000000', label: 'Soporte por WhatsApp', icon: MessageCircle },
                ].map(({ href, label, icon: Icon }) => (
                  <a key={label} className="mn-li" href={href} target="_blank" rel="noopener noreferrer">
                    <span className="mn-ic"><Icon size={18} /></span>
                    <span className="mn-li-txt">{label}</span>
                    <ExternalLink size={15} className="mn-li-go" />
                  </a>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default UserSettings
