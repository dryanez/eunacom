import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useSubscription } from '../contexts/SubscriptionContext'
import { fetchUserProfile } from '../lib/api'
import { Settings, Trash2, ExternalLink, LogOut, Shield, FileText, AlertTriangle, Loader2 } from 'lucide-react'

const PRIVACY_URL = 'https://eunacom-examen.com/privacy'
const TERMS_URL = 'https://eunacom-examen.com/terms'

const UserSettings = () => {
  const { user, signOut } = useAuth()
  const { isPremium } = useSubscription()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  useEffect(() => {
    if (user) {
      fetchUserProfile(user.id).then(setProfile).catch(() => {})
    }
  }, [user])

  const handleDeleteAccount = async () => {
    if (deleteInput !== 'ELIMINAR') return
    setDeleting(true)
    setDeleteError(null)
    try {
      const res = await fetch('/api/user-profiles', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al eliminar la cuenta')
      }
      await signOut()
      navigate('/login')
    } catch (err) {
      setDeleteError(err.message)
      setDeleting(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  if (!user) return null

  return (
    <div>
      <h1 className="page__title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Settings size={24} /> Configuración
      </h1>
      <p className="page__subtitle">Administra tu cuenta y preferencias</p>

      {/* Account Info */}
      <div className="settings-section">
        <h3>Cuenta</h3>
        <div className="settings-item">
          <span className="settings-item__label">Email</span>
          <span className="settings-item__value">{user.email}</span>
        </div>
        <div className="settings-item">
          <span className="settings-item__label">Nombre</span>
          <span className="settings-item__value">
            {profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : 'No configurado'}
          </span>
        </div>
        <div className="settings-item">
          <span className="settings-item__label">Plan</span>
          <span className="settings-item__value" style={{ color: isPremium ? '#10b981' : 'var(--surface-400)' }}>
            {isPremium ? '⭐ Premium' : 'Gratuito'}
          </span>
        </div>
      </div>

      {/* Legal */}
      <div className="settings-section">
        <h3>Legal</h3>
        <a
          href={PRIVACY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="settings-item"
          style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
        >
          <span className="settings-item__label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={16} /> Política de Privacidad
          </span>
          <ExternalLink size={14} style={{ color: 'var(--surface-400)' }} />
        </a>
        <a
          href={TERMS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="settings-item"
          style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
        >
          <span className="settings-item__label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={16} /> Términos y Condiciones
          </span>
          <ExternalLink size={14} style={{ color: 'var(--surface-400)' }} />
        </a>
      </div>

      {/* Session */}
      <div className="settings-section">
        <h3>Sesión</h3>
        <button
          onClick={handleLogout}
          style={{
            width: '100%', padding: '0.75rem', background: 'var(--surface-600)',
            color: 'var(--surface-100)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 'var(--radius)', fontSize: '0.95rem', fontWeight: 600,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '0.5rem', minHeight: '44px', fontFamily: 'var(--font)'
          }}
        >
          <LogOut size={16} /> Cerrar Sesión
        </button>
      </div>

      {/* Danger Zone */}
      <div className="settings-section" style={{ border: '1px solid rgba(239, 68, 68, 0.2)' }}>
        <h3 style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={16} /> Zona de Peligro
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--surface-400)', marginBottom: '1rem', lineHeight: 1.6 }}>
          Eliminar tu cuenta es una acción permanente. Se borrarán todos tus datos, progreso, exámenes e historial.
          Esta acción no se puede deshacer.
        </p>

        {!showDeleteConfirm ? (
          <button className="btn-danger" onClick={() => setShowDeleteConfirm(true)}>
            <Trash2 size={16} /> Eliminar mi Cuenta
          </button>
        ) : (
          <div style={{ background: 'rgba(239,68,68,0.08)', padding: '1.25rem', borderRadius: 'var(--radius)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <p style={{ fontSize: '0.9rem', color: '#fca5a5', marginBottom: '1rem', fontWeight: 600 }}>
              Para confirmar, escribe ELIMINAR en el campo:
            </p>
            <input
              type="text"
              value={deleteInput}
              onChange={e => setDeleteInput(e.target.value)}
              placeholder="Escribe ELIMINAR"
              style={{
                width: '100%', padding: '0.75rem 1rem', background: 'var(--surface-700)',
                border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius)',
                color: 'var(--surface-50)', fontFamily: 'var(--font)', fontSize: '0.9rem',
                marginBottom: '1rem'
              }}
            />
            {deleteError && (
              <div style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{deleteError}</div>
            )}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); setDeleteError(null) }}
                style={{
                  flex: 1, padding: '0.75rem', background: 'var(--surface-600)',
                  color: 'var(--surface-100)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 'var(--radius)', fontSize: '0.9rem', fontWeight: 600,
                  cursor: 'pointer', minHeight: '44px', fontFamily: 'var(--font)'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteInput !== 'ELIMINAR' || deleting}
                className="btn-danger"
                style={{ flex: 1, opacity: deleteInput !== 'ELIMINAR' || deleting ? 0.5 : 1 }}
              >
                {deleting ? <><Loader2 size={16} className="spin" /> Eliminando...</> : <><Trash2 size={16} /> Confirmar</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserSettings
