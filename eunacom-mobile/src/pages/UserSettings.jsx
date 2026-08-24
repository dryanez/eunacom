import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useSubscription } from '../contexts/SubscriptionContext'
import { useTheme } from '../contexts/ThemeContext'
import { fetchUserProfile, saveUserProfile } from '../lib/api'
import { DOCTOR_CHARACTERS, getDoctorAvatar, isDoctorUnlocked } from '../utils/doctorAvatars'
import { calculateUserOverallStats, getDoctorForLevel } from '../utils/xpSystem'
import { CHILEAN_UNIVERSITIES, COUNTRIES, UserInstitutionBadge } from '../utils/universityAndCountry'
import {
  User, Settings, Shield, Lock, CreditCard, Target,
  CheckCircle2, AlertTriangle, ExternalLink, LogOut, ChevronRight,
  Calendar, Building2, GraduationCap, Clock, Award, Key, Save,
  Flame, Check, Loader2, Globe, MapPin, Shuffle, Sparkles, RefreshCw,
  Sun, Moon, LogIn, Heart
} from 'lucide-react'

export default function UserSettings() {
  const { user, signOut, openAuthModal } = useAuth()
  const { isPremium, isFounder, setShowPaymentModal } = useSubscription()
  const { theme, isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const [profile, setProfile] = useState(null)
  const [userLevel, setUserLevel] = useState(1)
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
  const [graduationYear, setGraduationYear] = useState('2025')
  const [goal, setGoal] = useState('beca')
  const [examMonth, setExamMonth] = useState('Diciembre')
  const [examYear, setExamYear] = useState('2026')
  const [weakArea, setWeakArea] = useState('Medicina Interna / Cardiología')

  // Password & Delete Account States
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
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
        const chosen = data.avatar_character
        if (chosen && isDoctorUnlocked(chosen, currentLevel)) {
          setAvatarCharacter(chosen)
        } else {
          setAvatarCharacter(getDoctorForLevel(currentLevel).id)
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
        setAvatarCharacter(getDoctorForLevel(currentLevel).id)
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [user])

  const handleSaveProfile = async (e) => {
    e?.preventDefault()
    if (!user) return
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
  const docAvatar = getDoctorAvatar(profile || user || { avatar_character: avatarCharacter }, userLevel)

  // ── GUEST / NON-LOGGED-IN VIEW ──
  if (!user) {
    return (
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '6rem' }}>
        {/* Guest Header Card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95))',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          padding: '1.5rem 1.25rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.85rem'
        }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'rgba(56, 189, 248, 0.15)',
            border: '2px solid rgba(56, 189, 248, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <User size={36} color="#38bdf8" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'white', margin: 0 }}>
              Modo Doctor Invitado
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '0.35rem 0 0 0', lineHeight: '1.4' }}>
              Inicia sesión o crea tu cuenta para guardar tu progreso médico, historial de respuestas y estadísticas oficiales.
            </p>
          </div>

          <button
            onClick={() => openAuthModal ? openAuthModal('login') : navigate('/login')}
            style={{
              width: '100%',
              minHeight: '46px',
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              color: 'white',
              border: 'none',
              borderRadius: '14px',
              fontSize: '0.95rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(59, 130, 246, 0.4)'
            }}
          >
            <LogIn size={18} /> Iniciar Sesión / Registrarme
          </button>
        </div>

        {/* Apple HIG Inset Settings List */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '18px',
          overflow: 'hidden'
        }}>
          {/* Plan Pro */}
          <div
            onClick={() => setShowPaymentModal(true)}
            style={{
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={18} color="#fbbf24" />
              </div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'white' }}>Planes EUNACOM PRO ⭐</div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Acceso ilimitado a +650 videos y +10k preguntas</div>
              </div>
            </div>
            <ChevronRight size={18} color="#64748b" />
          </div>

          {/* Theme Toggle */}
          <div
            onClick={toggleTheme}
            style={{
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isDark ? <Moon size={18} color="#a855f7" /> : <Sun size={18} color="#fbbf24" />}
              </div>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'white' }}>
                Tema ({isDark ? 'Oscuro' : 'Claro'})
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600 }}>Cambiar</span>
          </div>
        </div>
      </div>
    )
  }

  // ── LOGGED-IN DOCTOR PROFILE VIEW ──
  return (
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '6rem' }}>
      {/* Top Doctor Avatar & Level Card */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95))',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '20px',
        padding: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <div style={{ position: 'relative' }}>
          <img
            src={docAvatar?.image || '/avatars/dr_dorian.png'}
            alt="Doctor Avatar"
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2.5px solid #38bdf8'
            }}
          />
          <button
            onClick={handleRandomAvatar}
            title="Cambiar avatar aleatorio"
            style={{
              position: 'absolute',
              bottom: '-2px',
              right: '-2px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <Shuffle size={12} />
          </button>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'white', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Dr(a). {firstName || 'Doctor'} {lastName}
            </h2>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
            {university || 'Universidad de Chile'} • Nivel {userLevel}
          </div>
          <div style={{ marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            {isPremium ? (
              <span style={{ fontSize: '0.68rem', fontWeight: 800, background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', padding: '2px 8px', borderRadius: '8px' }}>
                SUSCRIPCIÓN PRO ACTIVA ⭐
              </span>
            ) : (
              <span style={{ fontSize: '0.68rem', fontWeight: 800, background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', padding: '2px 8px', borderRadius: '8px', cursor: 'pointer' }} onClick={() => setShowPaymentModal(true)}>
                PLAN GRATUITO (MEJORAR A PRO)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      <form onSubmit={handleSaveProfile} style={{
        background: 'rgba(30, 41, 59, 0.6)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '18px',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem'
      }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#e2e8f0', marginBottom: '0.2rem' }}>
          Información del Perfil
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8' }}>Nombre</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              style={{ width: '100%', padding: '0.55rem', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'white', fontSize: '0.82rem', marginTop: '2px' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8' }}>Apellido</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              style={{ width: '100%', padding: '0.55rem', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'white', fontSize: '0.82rem', marginTop: '2px' }}
            />
          </div>
        </div>

        <div>
          <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8' }}>Universidad</label>
          <input
            type="text"
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
            placeholder="Ej: Universidad de Chile, UBA, etc."
            style={{ width: '100%', padding: '0.55rem', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'white', fontSize: '0.82rem', marginTop: '2px' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8' }}>Meta de Examen</label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              style={{ width: '100%', padding: '0.55rem', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'white', fontSize: '0.82rem', marginTop: '2px' }}
            >
              <option value="beca">Beca de Especialidad (&gt;75%)</option>
              <option value="pass_51">Aprobación Segura (51%)</option>
              <option value="reval">Revalidación Extranjero</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8' }}>Fecha de Examen</label>
            <select
              value={examMonth}
              onChange={(e) => setExamMonth(e.target.value)}
              style={{ width: '100%', padding: '0.55rem', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'white', fontSize: '0.82rem', marginTop: '2px' }}
            >
              <option value="Julio">Julio 2026</option>
              <option value="Diciembre">Diciembre 2026</option>
            </select>
          </div>
        </div>

        {error && (
          <div style={{ background: '#ef444420', border: '1px solid #ef444450', borderRadius: '8px', padding: '0.5rem', color: '#fca5a5', fontSize: '0.75rem' }}>
            {error}
          </div>
        )}

        {saveSuccess && (
          <div style={{ background: '#10b98120', border: '1px solid #10b98150', borderRadius: '8px', padding: '0.5rem', color: '#6ee7b7', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Check size={14} /> Cambios guardados exitosamente.
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          style={{
            marginTop: '0.35rem',
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '0.65rem',
            fontSize: '0.88rem',
            fontWeight: 800,
            cursor: saving ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem'
          }}
        >
          {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
          Guardar Cambios
        </button>
      </form>

      {/* Logout & Actions */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.6)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '18px',
        overflow: 'hidden'
      }}>
        <div
          onClick={toggleTheme}
          style={{ padding: '0.9rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {isDark ? <Moon size={18} color="#a855f7" /> : <Sun size={18} color="#fbbf24" />}
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'white' }}>Tema</span>
          </div>
          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{isDark ? 'Oscuro' : 'Claro'}</span>
        </div>

        <div
          onClick={async () => {
            await signOut()
            navigate('/dashboard')
          }}
          style={{ padding: '0.9rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#ef4444' }}>
            <LogOut size={18} />
            <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>Cerrar Sesión</span>
          </div>
          <ChevronRight size={18} color="#ef4444" />
        </div>
      </div>
    </div>
  )
}
