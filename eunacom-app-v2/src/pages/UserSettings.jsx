import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useSubscription } from '../contexts/SubscriptionContext'
import { fetchUserProfile, saveUserProfile } from '../lib/api'
import { DOCTOR_CHARACTERS, getRandomDoctorAvatar, getDoctorAvatar } from '../utils/doctorAvatars'
import { CHILEAN_UNIVERSITIES, COUNTRIES, getSedesForUniversity, UserInstitutionBadge } from '../utils/universityAndCountry'
import {
  User, Settings, Shield, Lock, CreditCard, Target,
  CheckCircle2, AlertTriangle, ExternalLink, LogOut, ChevronRight,
  Calendar, Building2, GraduationCap, Clock, Award, Key, Save,
  Flame, Check, Loader2, Globe, MapPin, Shuffle, Sparkles, RefreshCw
} from 'lucide-react'

const PRIVACY_URL = 'https://eunacom.app/privacy'
const TERMS_URL = 'https://eunacom.app/terms'

const UserSettings = () => {
  const { user, signOut } = useAuth()
  const { isPremium, isFounder, setShowPaymentModal } = useSubscription()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('profile')
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [error, setError] = useState(null)

  // Form Fields
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [avatarCharacter, setAvatarCharacter] = useState('dr_house')
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
    fetchUserProfile(user.id).then((data) => {
      if (data) {
        setProfile(data)
        setFirstName(data.first_name || user.user_metadata?.full_name?.split(' ')[0] || '')
        setLastName(data.last_name || user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '')
        setAvatarCharacter(data.avatar_character || getDoctorAvatar(data).id)
        setUniversity(data.university || '')
        setSede(data.sede || '')
        setCountry(data.country || data.nationality || 'Chile')
        setGraduationYear(data.graduation_year || '2025')
        setGoal(data.goal || 'beca')
        setExamMonth(data.exam_month || 'Diciembre')
        setExamYear(data.exam_year || '2026')
        setWeakArea(data.weak_area || 'Medicina Interna / Cardiología')
      } else {
        const defaultDoc = getDoctorAvatar(user)
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
    const randomDoc = getRandomDoctorAvatar()
    setAvatarCharacter(randomDoc.id)
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
      const { supabase } = await import('../lib/supabase')
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
      <style>{`
        .settings-layout {
          display: grid;
          grid-template-columns: 210px 1fr;
          gap: 1.25rem;
          align-items: start;
        }
        .settings-tabs-list {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .settings-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.85rem;
          margin-bottom: 1rem;
        }
        .doctor-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
          gap: 0.65rem;
        }
        @media (max-width: 768px) {
          .settings-layout {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          .settings-tabs-list {
            flex-direction: row;
            overflow-x: auto;
            scrollbar-width: none;
            padding-bottom: 0.35rem;
            white-space: nowrap;
            -webkit-overflow-scrolling: touch;
          }
          .settings-tabs-list button {
            flex-shrink: 0;
          }
          .settings-form-grid {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }
          .doctor-grid {
            grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
            gap: 0.5rem;
          }
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 0.3rem 0', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Settings size={24} color="#38bdf8" /> Configuración
        </h1>
        <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
          Gestiona tu cuenta, tu avatar de médico(a), plan y objetivos de estudio
        </p>
      </div>

      {/* Main Grid: Tabs Sidebar + Content Panel */}
      <div className="settings-layout">
        
        {/* Left Navigation Tabs */}
        <div style={{
          backgroundColor: 'rgba(30, 41, 59, 0.45)',
          backdropFilter: 'blur(10px)',
          borderRadius: '14px',
          padding: '0.5rem',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}>
          <div className="settings-tabs-list">
            {[
              { id: 'profile', label: 'Mi Perfil', icon: User },
              { id: 'goals', label: 'Objetivos', icon: Target },
              { id: 'plan', label: 'Plan & Pagos', icon: CreditCard },
              { id: 'security', label: 'Seguridad', icon: Lock },
              { id: 'legal', label: 'Legal & Ayuda', icon: Shield },
            ].map((tab) => {
              const Icon = tab.icon
              const isSelected = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                    color: isSelected ? '#38bdf8' : '#94a3b8',
                    boxShadow: isSelected ? 'inset 0 0 0 1px rgba(56, 189, 248, 0.3)' : 'none',
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right Content Panel */}
        <div style={{
          backgroundColor: 'rgba(30, 41, 59, 0.45)',
          backdropFilter: 'blur(12px)',
          borderRadius: '14px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '1.25rem',
        }}>

          {/* ═══════════════════════════════════════════════════════════════
              TAB 1: MI PERFIL (AVATAR + INFO)
          ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'profile' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                    Información Personal & Avatar Clínico
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '2px 0 0' }}>
                    Personaliza tu nombre y tu avatar de médico para la comunidad y el ranking
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRandomAvatar}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.4rem 0.8rem',
                    background: 'rgba(56, 189, 248, 0.12)',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                    borderRadius: '8px',
                    color: '#38bdf8',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(56, 189, 248, 0.2)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(56, 189, 248, 0.12)' }}
                >
                  <Shuffle size={13} />
                  <span>Avatar Aleatorio</span>
                </button>
              </div>

              {/* Selected Doctor Hero Card */}
              <div style={{
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                borderRadius: '12px',
                padding: '0.85rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1rem',
              }}>
                <img
                  src={selectedDoctor.image || '/avatars/dr_strange.png'}
                  alt={selectedDoctor.name}
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '12px',
                    objectFit: 'cover',
                    flexShrink: 0,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    border: '1.5px solid rgba(56, 189, 248, 0.4)',
                  }}
                />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: '0.98rem', fontWeight: 700, color: '#f8fafc' }}>
                    {selectedDoctor.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600, marginTop: '1px' }}>
                    {selectedDoctor.specialty} · {selectedDoctor.show}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#94a3b8', fontStyle: 'italic', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    "{selectedDoctor.quote}"
                  </div>
                </div>
              </div>

              {/* 10 Fictional Doctor Badges Grid */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem' }}>
                  Selecciona tu personaje médico favorito:
                </label>
                <div className="doctor-grid">
                  {DOCTOR_CHARACTERS.map((doc) => {
                    const isPicked = avatarCharacter === doc.id
                    return (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() => setAvatarCharacter(doc.id)}
                        style={{
                          padding: '0.55rem 0.45rem',
                          borderRadius: '10px',
                          border: isPicked ? '1.5px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
                          backgroundColor: isPicked ? 'rgba(56, 189, 248, 0.15)' : 'rgba(15, 23, 42, 0.5)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px',
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <img
                          src={doc.image}
                          alt={doc.name}
                          style={{
                            width: '46px',
                            height: '46px',
                            borderRadius: '10px',
                            objectFit: 'cover',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                          }}
                        />
                        <div style={{ width: '100%' }}>
                          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: isPicked ? '#38bdf8' : '#f8fafc', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {doc.name.split(' ')[1] || doc.name}
                          </div>
                          <div style={{ fontSize: '0.64rem', color: '#94a3b8', marginTop: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {doc.show}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Form inputs */}
              <form onSubmit={handleSaveProfile}>
                <div className="settings-form-grid">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Tu nombre"
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        backgroundColor: 'rgba(15, 23, 42, 0.6)',
                        color: '#f8fafc',
                        fontSize: '0.86rem',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>
                      Apellido
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Tu apellido"
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        backgroundColor: 'rgba(15, 23, 42, 0.6)',
                        color: '#f8fafc',
                        fontSize: '0.86rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>
                    Correo Electrónico (Registrado)
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      backgroundColor: 'rgba(15, 23, 42, 0.3)',
                      color: '#64748b',
                      fontSize: '0.86rem',
                    }}
                  />
                </div>

                <div className="settings-form-grid">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>
                      País de Formación / Origen
                    </label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        color: '#f8fafc',
                        fontSize: '0.86rem',
                        outline: 'none',
                      }}
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.name}>{c.flag} {c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>
                      Año de Egreso
                    </label>
                    <input
                      type="text"
                      value={graduationYear}
                      onChange={(e) => setGraduationYear(e.target.value)}
                      placeholder="Ej: 2025"
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        backgroundColor: 'rgba(15, 23, 42, 0.6)',
                        color: '#f8fafc',
                        fontSize: '0.86rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                <div className="settings-form-grid">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>
                      Universidad / Escuela Médica
                    </label>
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
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        backgroundColor: 'rgba(15, 23, 42, 0.6)',
                        color: '#f8fafc',
                        fontSize: '0.86rem',
                        outline: 'none',
                      }}
                    />
                    <datalist id="universities-list">
                      {CHILEAN_UNIVERSITIES.map((u) => (
                        <option key={u.id} value={u.name} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>
                      Sede / Campus
                    </label>
                    <input
                      type="text"
                      value={sede}
                      onChange={(e) => setSede(e.target.value)}
                      list="sedes-list"
                      placeholder="Ej: Santiago / Central"
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        backgroundColor: 'rgba(15, 23, 42, 0.6)',
                        color: '#f8fafc',
                        fontSize: '0.86rem',
                        outline: 'none',
                      }}
                    />
                    <datalist id="sedes-list">
                      {getSedesForUniversity(university).map((s) => (
                        <option key={s} value={s} />
                      ))}
                    </datalist>
                  </div>
                </div>

                {/* Badge Preview */}
                <div style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: 'rgba(15, 23, 42, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.25rem',
                  gap: '0.75rem'
                }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f8fafc' }}>
                      Insignia en el Ranking
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                      {university ? 'Escuela médica oficial' : 'País de origen'}
                    </div>
                  </div>
                  <UserInstitutionBadge
                    user={{ university, sede, country }}
                    size={28}
                    showLabel={true}
                    labelStyle={{ color: '#f8fafc', fontWeight: 600, fontSize: '0.82rem' }}
                  />
                </div>

                {saveSuccess && (
                  <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.85rem' }}>
                    ✓ Perfil actualizado correctamente.
                  </div>
                )}

                {error && (
                  <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.85rem' }}>
                    ✕ {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: '0.65rem 1.35rem',
                    backgroundColor: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    cursor: saving ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#0369a1' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#0284c7' }}
                >
                  {saving ? <Loader2 size={15} className="spin" /> : <Save size={15} />}
                  <span>Guardar Cambios</span>
                </button>
              </form>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              TAB 2: PLAN & PAGOS
          ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'plan' && (
            <div>
              <div style={{ marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                  Mi Plan & Membresía
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '2px 0 0' }}>
                  Estado de tu suscripción y acceso a la plataforma
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  border: isPremium ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(56, 189, 248, 0.25)',
                  borderRadius: '12px',
                  padding: '1.1rem',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
                        {isPremium ? 'Plan Prime Ilimitado' : 'Acceso Estándar'}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '2px' }}>
                        {isPremium ? 'Membresía completa activa' : 'Preguntas, clases y simulacros'}
                      </div>
                    </div>
                    <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
                      <Shield size={18} />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(true)}
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      backgroundColor: '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <span>{isPremium ? 'Gestionar Membresía' : 'Ver Planes Prime'}</span>
                    <ChevronRight size={14} />
                  </button>
                </div>

                <div style={{
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '1.1rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', fontWeight: 600, color: '#f8fafc', marginBottom: '0.75rem' }}>
                    <CreditCard size={16} color="#38bdf8" />
                    <span>Pagos Seguros</span>
                  </div>
                  <p style={{ fontSize: '0.76rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
                    Transacciones encriptadas mediante Webpay y Flow.cl con boleta electrónica automática.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              TAB 3: OBJETIVOS
          ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'goals' && (
            <div>
              <div style={{ marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                  Objetivo de Estudio & Examen
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '2px 0 0' }}>
                  Ajusta tu meta de puntaje y fecha de rendición
                </p>
              </div>

              <form onSubmit={handleSaveProfile}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem' }}>
                    Meta de Rendimiento
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem' }}>
                    {[
                      { id: 'beca', label: 'Beca >75%', sub: 'Especialidad' },
                      { id: 'pass_51', label: 'Aprobar ≥51%', sub: 'Corte Oficial' },
                      { id: 'reval', label: 'Revalidación', sub: 'Homologación' },
                    ].map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setGoal(g.id)}
                        style={{
                          padding: '0.65rem 0.5rem',
                          borderRadius: '8px',
                          border: goal === g.id ? '1.5px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
                          backgroundColor: goal === g.id ? 'rgba(56, 189, 248, 0.15)' : 'rgba(15, 23, 42, 0.5)',
                          cursor: 'pointer',
                          textAlign: 'center',
                        }}
                      >
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: goal === g.id ? '#38bdf8' : '#f8fafc' }}>{g.label}</div>
                        <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{g.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="settings-form-grid">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>
                      Mes de Examen
                    </label>
                    <select
                      value={examMonth}
                      onChange={(e) => setExamMonth(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        color: '#f8fafc',
                        fontSize: '0.86rem',
                      }}
                    >
                      <option value="Julio">Julio</option>
                      <option value="Diciembre">Diciembre</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>
                      Año de Examen
                    </label>
                    <select
                      value={examYear}
                      onChange={(e) => setExamYear(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        color: '#f8fafc',
                        fontSize: '0.86rem',
                      }}
                    >
                      <option value="2025">2025</option>
                      <option value="2026">2026</option>
                      <option value="2027">2027</option>
                    </select>
                  </div>
                </div>

                {saveSuccess && (
                  <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.85rem' }}>
                    ✓ Metas actualizadas correctamente.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: '0.65rem 1.35rem',
                    backgroundColor: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                  }}
                >
                  Guardar Objetivos
                </button>
              </form>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              TAB 4: SEGURIDAD
          ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'security' && (
            <div>
              <div style={{ marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                  Seguridad & Contraseña
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '2px 0 0' }}>
                  Actualiza tu contraseña de acceso
                </p>
              </div>

              <form onSubmit={handleUpdatePassword} style={{ marginBottom: '1.5rem' }}>
                <div className="settings-form-grid">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>
                      Nueva Contraseña
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        backgroundColor: 'rgba(15, 23, 42, 0.6)',
                        color: '#f8fafc',
                        fontSize: '0.86rem',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>
                      Confirmar Contraseña
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repite tu contraseña"
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        backgroundColor: 'rgba(15, 23, 42, 0.6)',
                        color: '#f8fafc',
                        fontSize: '0.86rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={passwordLoading}
                  style={{
                    padding: '0.65rem 1.35rem',
                    backgroundColor: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                  }}
                >
                  {passwordLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
                </button>
              </form>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              TAB 5: LEGAL & AYUDA
          ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'legal' && (
            <div>
              <div style={{ marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                  Información Legal & Soporte
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '2px 0 0' }}>
                  Políticas y canales oficiales de asistencia médica
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <a
                  href={PRIVACY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    backgroundColor: 'rgba(15, 23, 42, 0.5)',
                    textDecoration: 'none',
                    color: '#f8fafc',
                    fontWeight: 600,
                    fontSize: '0.86rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Shield size={16} color="#38bdf8" />
                    <span>Política de Privacidad</span>
                  </div>
                  <ExternalLink size={14} color="#94a3b8" />
                </a>

                <a
                  href={TERMS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    backgroundColor: 'rgba(15, 23, 42, 0.5)',
                    textDecoration: 'none',
                    color: '#f8fafc',
                    fontWeight: 600,
                    fontSize: '0.86rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Shield size={16} color="#38bdf8" />
                    <span>Términos y Condiciones de Uso</span>
                  </div>
                  <ExternalLink size={14} color="#94a3b8" />
                </a>

                <a
                  href="https://wa.me/56900000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    borderRadius: '10px',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    backgroundColor: 'rgba(16, 185, 129, 0.12)',
                    textDecoration: 'none',
                    color: '#34d399',
                    fontWeight: 600,
                    fontSize: '0.86rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>💬</span>
                    <span>Soporte Académico vía WhatsApp</span>
                  </div>
                  <ExternalLink size={14} color="#34d399" />
                </a>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default UserSettings
