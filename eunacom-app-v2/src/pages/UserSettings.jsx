import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useSubscription } from '../contexts/SubscriptionContext'
import { fetchUserProfile, saveUserProfile } from '../lib/api'
import { DOCTOR_CHARACTERS } from '../utils/doctorAvatars'
import { CHILEAN_UNIVERSITIES, COUNTRIES, getSedesForUniversity, UserInstitutionBadge } from '../utils/universityAndCountry'
import {
  User, Settings, Shield, Lock, CreditCard, Target, Sparkles,
  CheckCircle2, AlertTriangle, ExternalLink, LogOut, ChevronRight,
  Calendar, Building2, GraduationCap, Clock, Award, Key, Save,
  Flame, Check, Loader2, Globe, MapPin
} from 'lucide-react'

const PRIVACY_URL = 'https://eunacom.app/privacy'
const TERMS_URL = 'https://eunacom.app/terms'

const UserSettings = () => {
  const { user, signOut } = useAuth()
  const { isPremium, isFounder, setShowPaymentModal } = useSubscription()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('profile') // 'profile' | 'plan' | 'goals' | 'security' | 'legal'
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [error, setError] = useState(null)

  // Form Fields
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [avatarCharacter, setAvatarCharacter] = useState('dr_strange')
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
        setAvatarCharacter(data.avatar_character || 'dr_strange')
        setUniversity(data.university || '')
        setSede(data.sede || '')
        setCountry(data.country || data.nationality || 'Chile')
        setGraduationYear(data.graduation_year || '2025')
        setGoal(data.goal || 'beca')
        setExamMonth(data.exam_month || 'Diciembre')
        setExamYear(data.exam_year || '2026')
        setWeakArea(data.weak_area || 'Medicina Interna / Cardiología')
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

  const handleDeleteAccount = async () => {
    if (deleteInput !== 'ELIMINAR') return
    setDeleting(true)
    try {
      await fetch('/api/user-profiles', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      })
      await signOut()
      navigate('/login')
    } catch (err) {
      setError(err.message)
      setDeleting(false)
    }
  }

  const selectedDoctor = DOCTOR_CHARACTERS.find((d) => d.id === avatarCharacter) || DOCTOR_CHARACTERS[0]

  if (!user) return null

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '1.5rem 1rem 3rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem 0', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Settings size={28} color="#2563eb" /> Configuración
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
          Gestiona tu cuenta, tu avatar de médico(a), plan y objetivos de estudio.
        </p>
      </div>

      {/* Sync Banner */}
      <div style={{
        backgroundColor: '#ecfdf5',
        border: '1px solid #a7f3d0',
        borderRadius: '14px',
        padding: '0.75rem 1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.85rem',
        fontWeight: 600,
        color: '#065f46',
        marginBottom: '1rem',
      }}>
        <CheckCircle2 size={18} color="#059669" />
        <span>Todo tu progreso y respuestas están sincronizados en la nube.</span>
      </div>

      {/* Subscription Banner */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1.5px solid #e2e8f0',
        borderRadius: '16px',
        padding: '1rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={22} color="#2563eb" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 800, fontSize: '0.96rem', color: '#0f172a' }}>
                {isPremium ? 'Suscripción Prime Activa' : 'Prueba Gratuita 3 Días'}
              </span>
              <span style={{ backgroundColor: '#ecfdf5', color: '#059669', fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px' }}>
                Activo
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
              Acceso completo a simulacros, 6.000+ preguntas y video clases EUNACOM 2026.
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowPaymentModal(true)}
          style={{
            padding: '0.6rem 1.1rem',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            borderRadius: '10px',
            border: 'none',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            transition: 'all 0.15s ease',
          }}
        >
          <span>{isPremium ? 'Gestionar Plan' : 'Extender Plan Prime'}</span>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Main Grid: Tabs Sidebar + Content Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 240px) 1fr', gap: '1.25rem', alignItems: 'start' }}>
        
        {/* Left Navigation Tabs (Matching user screenshot) */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '0.5rem',
          border: '1.5px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
        }}>
          {[
            { id: 'profile', label: 'Mi Perfil', icon: User },
            { id: 'goals', label: 'Objetivos', icon: Target },
            { id: 'plan', label: 'Mi Plan & Pagos', icon: CreditCard },
            { id: 'security', label: 'Seguridad', icon: Lock },
            { id: 'legal', label: 'Legal y Ayuda', icon: Shield },
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
                  gap: '0.65rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: isSelected ? '#2563eb' : 'transparent',
                  color: isSelected ? '#ffffff' : '#475569',
                  fontWeight: isSelected ? 700 : 600,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Right Content Panel */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          border: '1.5px solid #e2e8f0',
          padding: '1.5rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
        }}>

          {/* ═══════════════════════════════════════════════════════════════
              TAB 1: MI PERFIL (INCLUYE 10 MÉDICOS FAMOSOS DE FICCIÓN)
          ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'profile' && (
            <div>
              <div style={{ marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
                  Información Personal & Avatar Clínico
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                  Personaliza tu nombre y elige tu médico favorito de series y películas para tu ranking.
                </p>
              </div>

              {/* 10 Top Fictional Doctor Avatar Selector */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.65rem' }}>
                  Elige tu Médico / Personaje de Ficción (10 Opciones Icónicas)
                </label>

                {/* Selected Doctor Hero Card */}
                <div style={{
                  backgroundColor: '#f8fafc',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '18px',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.25rem',
                  marginBottom: '1rem',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                }}>
                  <img
                    src={selectedDoctor.image || '/avatars/dr_strange.png'}
                    alt={selectedDoctor.name}
                    style={{
                      width: '74px',
                      height: '74px',
                      borderRadius: '16px',
                      objectFit: 'cover',
                      flexShrink: 0,
                      boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                      border: '2px solid #ffffff',
                    }}
                  />
                  <div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                      {selectedDoctor.name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 700, marginTop: '2px' }}>
                      {selectedDoctor.specialty} • {selectedDoctor.show}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#64748b', fontStyle: 'italic', marginTop: '3px' }}>
                      "{selectedDoctor.quote}"
                    </div>
                  </div>
                </div>

                {/* 10 Fictional Doctor Badges Grid with 3D Animated Portraits */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.65rem' }}>
                  {DOCTOR_CHARACTERS.map((doc) => {
                    const isPicked = avatarCharacter === doc.id
                    return (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() => setAvatarCharacter(doc.id)}
                        style={{
                          padding: '0.65rem 0.5rem',
                          borderRadius: '14px',
                          border: isPicked ? '2.5px solid #2563eb' : '1.5px solid #e2e8f0',
                          backgroundColor: isPicked ? '#eff6ff' : '#ffffff',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                          textAlign: 'center',
                          boxShadow: isPicked ? '0 4px 12px rgba(37,99,235,0.2)' : 'none',
                          transform: isPicked ? 'scale(1.02)' : 'none',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <img
                          src={doc.image}
                          alt={doc.name}
                          style={{
                            width: '52px',
                            height: '52px',
                            borderRadius: '12px',
                            objectFit: 'cover',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                          }}
                        />
                        <div>
                          <div style={{ fontSize: '0.76rem', fontWeight: 800, color: isPicked ? '#1d4ed8' : '#0f172a', lineHeight: 1.2 }}>
                            {doc.name}
                          </div>
                          <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '1px' }}>
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
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
                        borderRadius: '10px',
                        border: '1.5px solid #e2e8f0',
                        fontSize: '0.88rem',
                        fontWeight: 600,
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
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
                        borderRadius: '10px',
                        border: '1.5px solid #e2e8f0',
                        fontSize: '0.88rem',
                        fontWeight: 600,
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#f8fafc',
                      fontSize: '0.88rem',
                      color: '#64748b',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                      País de Formación / Origen
                    </label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '10px',
                        border: '1.5px solid #e2e8f0',
                        fontSize: '0.88rem',
                        fontWeight: 600,
                        backgroundColor: '#fff',
                        outline: 'none',
                      }}
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.name}>{c.flag} {c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
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
                        borderRadius: '10px',
                        border: '1.5px solid #e2e8f0',
                        fontSize: '0.88rem',
                        fontWeight: 600,
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
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
                      placeholder="Ej: Universidad de Chile (UCH)"
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '10px',
                        border: '1.5px solid #e2e8f0',
                        fontSize: '0.88rem',
                        fontWeight: 600,
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
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                      Sede / Campus
                    </label>
                    <input
                      type="text"
                      value={sede}
                      onChange={(e) => setSede(e.target.value)}
                      list="sedes-list"
                      placeholder="Ej: Santiago / Concepción / Valparaíso"
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '10px',
                        border: '1.5px solid #e2e8f0',
                        fontSize: '0.88rem',
                        fontWeight: 600,
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
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.25rem',
                  gap: '0.75rem'
                }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b' }}>
                      Insignia Institucional en Leaderboard
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      {university ? 'Logo oficial de tu casa de estudios' : 'Bandera de tu país'}
                    </div>
                  </div>
                  <UserInstitutionBadge
                    user={{ university, sede, country }}
                    size={30}
                    showLabel={true}
                    labelStyle={{ color: '#0f172a', fontWeight: 700, fontSize: '0.84rem' }}
                  />
                </div>

                {saveSuccess && (
                  <div style={{ backgroundColor: '#ecfdf5', color: '#059669', padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.85rem' }}>
                    ✓ Perfil actualizado correctamente.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: saving ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
                  <span>Guardar Cambios</span>
                </button>
              </form>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              TAB 2: MI PLAN & PAGOS (EXACT COPY OF SCREENSHOT 1)
          ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'plan' && (
            <div>
              <div style={{ marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
                  Mi Plan & Membresía
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                  Gestiona tu acceso Prime a eunacomapp y tus métodos de pago.
                </p>
              </div>

              {/* Grid with Plan Card + Payment Method Card (Screenshot 1) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                
                {/* Active Plan Card with Warning / Expire */}
                <div style={{
                  backgroundColor: '#fffbeb',
                  border: '1.5px solid #fde68a',
                  borderRadius: '16px',
                  padding: '1.25rem',
                  position: 'relative',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#b45309', fontWeight: 700, marginBottom: '0.85rem' }}>
                    <AlertTriangle size={15} />
                    <span>Tu plan expira en 3 días. ¡Renueva ahora!</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                    <div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                        {isPremium ? 'Plan Prime Mensual' : 'Prueba Prime 3 Días'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                        📅 Acceso hasta: 26 de agosto de 2026
                      </div>
                    </div>

                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ffffff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Shield size={20} color="#2563eb" />
                    </div>
                  </div>

                  <div style={{ marginTop: '1rem', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      <span>Días restantes</span>
                      <span>3</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{ width: '30%', height: '100%', backgroundColor: '#f59e0b', borderRadius: '999px' }} />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(true)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '12px',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                    }}
                  >
                    🔄 Extender Acceso
                  </button>
                </div>

                {/* Payment Method Card */}
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '1.25rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
                    <CreditCard size={18} color="#2563eb" />
                    <span>Método de Pago</span>
                  </div>

                  <div style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '1rem',
                  }}>
                    <div style={{ width: '40px', height: '26px', backgroundColor: '#f59e0b', borderRadius: '4px' }} />
                    <div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>Pagos vía Flow.cl</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Webpay, Tarjetas y Transferencias Chile</div>
                    </div>
                  </div>

                  <div style={{
                    backgroundColor: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '12px',
                    padding: '0.75rem',
                    display: 'flex',
                    alignItems: 'start',
                    gap: '0.5rem',
                  }}>
                    <Lock size={16} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ fontSize: '0.72rem', color: '#1e40af' }}>
                      <strong>Pago 100% Seguro:</strong> Encriptación bancaria SSL certificada.
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment History Card */}
              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '1.5rem',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>
                  Aún no hay pagos registrados
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  Tu historial y boletas electrónicas aparecerán aquí después de completar una compra.
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              TAB 3: OBJETIVOS & METAS DE EXAMEN
          ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'goals' && (
            <div>
              <div style={{ marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
                  Objetivo de Estudio & Examen
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                  Ajusta tu meta de puntaje y fecha de rendición.
                </p>
              </div>

              <form onSubmit={handleSaveProfile}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>
                    Tu Gran Meta
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                    {[
                      { id: 'beca', label: 'Beca >75-80%', sub: 'Alta Competitividad' },
                      { id: 'pass_51', label: 'Aprobar ≥51%', sub: 'Corte Oficial' },
                      { id: 'reval', label: 'Revalidación', sub: 'Homologación' },
                    ].map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setGoal(g.id)}
                        style={{
                          padding: '0.75rem 0.5rem',
                          borderRadius: '12px',
                          border: goal === g.id ? '2px solid #2563eb' : '1px solid #e2e8f0',
                          backgroundColor: goal === g.id ? '#eff6ff' : '#ffffff',
                          cursor: 'pointer',
                          textAlign: 'center',
                        }}
                      >
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: goal === g.id ? '#1d4ed8' : '#0f172a' }}>{g.label}</div>
                        <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{g.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                      Mes de Examen
                    </label>
                    <select
                      value={examMonth}
                      onChange={(e) => setExamMonth(e.target.value)}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '0.88rem', fontWeight: 600 }}
                    >
                      <option value="Julio">Julio</option>
                      <option value="Diciembre">Diciembre</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                      Año de Examen
                    </label>
                    <select
                      value={examYear}
                      onChange={(e) => setExamYear(e.target.value)}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '0.88rem', fontWeight: 600 }}
                    >
                      <option value="2025">2025</option>
                      <option value="2026">2026</option>
                      <option value="2027">2027</option>
                    </select>
                  </div>
                </div>

                {saveSuccess && (
                  <div style={{ backgroundColor: '#ecfdf5', color: '#059669', padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.85rem' }}>
                    ✓ Metas actualizadas correctamente.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                  }}
                >
                  Guardar Objetivos
                </button>
              </form>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              TAB 4: SEGURIDAD & CONTRASEÑA
          ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'security' && (
            <div>
              <div style={{ marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
                  Seguridad de la Cuenta
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                  Cambia tu contraseña o gestiona tu sesión activa.
                </p>
              </div>

              {/* Change Password Form */}
              <form onSubmit={handleUpdatePassword} style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
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
                        borderRadius: '10px',
                        border: '1.5px solid #e2e8f0',
                        fontSize: '0.88rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                      Confirmar Contraseña
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repite la contraseña"
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '10px',
                        border: '1.5px solid #e2e8f0',
                        fontSize: '0.88rem',
                      }}
                    />
                  </div>
                </div>

                {passwordSuccess && (
                  <div style={{ backgroundColor: '#ecfdf5', color: '#059669', padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.85rem' }}>
                    ✓ Contraseña actualizada correctamente.
                  </div>
                )}

                {error && (
                  <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.85rem' }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={passwordLoading}
                  style={{
                    padding: '0.7rem 1.4rem',
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                  }}
                >
                  {passwordLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
                </button>
              </form>

              {/* Danger Zone: Delete Account */}
              <div style={{
                borderTop: '1px solid #fee2e2',
                paddingTop: '1.25rem',
              }}>
                <h4 style={{ color: '#dc2626', fontSize: '0.95rem', fontWeight: 800, margin: '0 0 0.35rem 0' }}>
                  Zona de Peligro: Eliminar Cuenta
                </h4>
                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 0.85rem 0' }}>
                  Esta acción borrará de forma permanente todas tus estadísticas, historial de exámenes y progreso.
                </p>

                {!showDeleteConfirm ? (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    style={{
                      padding: '0.55rem 1rem',
                      backgroundColor: '#fee2e2',
                      color: '#dc2626',
                      border: '1px solid #fca5a5',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                    }}
                  >
                    Eliminar mi cuenta
                  </button>
                ) : (
                  <div style={{ backgroundColor: '#fef2f2', padding: '1rem', borderRadius: '12px', border: '1px solid #fca5a5' }}>
                    <p style={{ fontSize: '0.82rem', color: '#991b1b', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                      Escribe "ELIMINAR" para confirmar:
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        value={deleteInput}
                        onChange={(e) => setDeleteInput(e.target.value)}
                        placeholder="ELIMINAR"
                        style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #dc2626', fontSize: '0.85rem', fontWeight: 700 }}
                      />
                      <button
                        type="button"
                        disabled={deleteInput !== 'ELIMINAR' || deleting}
                        onClick={handleDeleteAccount}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#dc2626',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        {deleting ? 'Eliminando...' : 'Confirmar Eliminación'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        style={{ padding: '0.5rem 1rem', backgroundColor: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              TAB 5: LEGAL Y AYUDA
          ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'legal' && (
            <div>
              <div style={{ marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
                  Legal & Soporte Académico
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                  Términos de servicio, política de privacidad y canal de ayuda.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <a
                  href={PRIVACY_URL}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    textDecoration: 'none',
                    color: '#0f172a',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Shield size={18} color="#2563eb" />
                    <span>Política de Privacidad</span>
                  </div>
                  <ExternalLink size={16} color="#94a3b8" />
                </a>

                <a
                  href={TERMS_URL}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    textDecoration: 'none',
                    color: '#0f172a',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Shield size={18} color="#2563eb" />
                    <span>Términos y Condiciones</span>
                  </div>
                  <ExternalLink size={16} color="#94a3b8" />
                </a>

                <a
                  href="https://wa.me/56900000000"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    borderRadius: '12px',
                    border: '1.5px solid #a7f3d0',
                    backgroundColor: '#ecfdf5',
                    textDecoration: 'none',
                    color: '#065f46',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>💬</span>
                    <span>Soporte Académico vía WhatsApp</span>
                  </div>
                  <ExternalLink size={16} color="#059669" />
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
