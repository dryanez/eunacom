import React, { useState } from 'react'
import { Tag } from 'lucide-react'
import { useSubscription } from '../contexts/SubscriptionContext'
import { updateAppSetting } from '../lib/api'
import { parsePromoSetting, resolvePromo } from '../config/promo'

const MODES = [
  { id: 'auto', label: 'Automático', hint: 'Se activa solo cada Cyber week en Chile (1ª semana de junio y de octubre).' },
  { id: 'on', label: 'Encendido', hint: 'Activo ahora hasta que lo apagues.' },
  { id: 'off', label: 'Apagado', hint: 'Sin descuento, aunque sea Cyber week.' },
]

// Admin switch for the Cyber Week discount (app_settings.promo). Prices, pop-up,
// Webpay/MercadoPago and PayPal all follow this setting.
export default function AdminPromoToggle({ adminEmail }) {
  const { promoSetting, setPromoSetting } = useSubscription()
  const cfg = parsePromoSetting(promoSetting)
  const live = resolvePromo(promoSetting)
  const [percent, setPercent] = useState(cfg.percent)
  const [saving, setSaving] = useState(false)

  const save = async (patch) => {
    const next = { ...cfg, percent: Number(percent) || cfg.percent, ...patch }
    setSaving(true)
    try {
      const value = JSON.stringify(next)
      await updateAppSetting(adminEmail, 'promo', value)
      setPromoSetting(value)
    } catch (e) {
      console.error('Error updating promo:', e)
      alert('Error al actualizar el descuento.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{
      background: 'var(--surface-700)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-lg)',
      padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem'
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--primary-400)', marginBottom: '0.25rem' }}>
          <Tag size={18} />
          Descuento Cyber Week
          <span style={{
            fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: 999,
            background: live ? '#16a34a' : 'var(--surface-600)', color: '#fff'
          }}>
            {live ? `ACTIVO −${live.percent}%${live.endLabel ? ` · hasta el ${live.endLabel}` : ''}` : 'INACTIVO'}
          </span>
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--surface-300)' }}>
          {MODES.find(m => m.id === cfg.mode)?.hint}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <label style={{ fontSize: '0.85rem', color: 'var(--surface-300)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          %
          <input
            type="number" min="5" max="90" step="5" value={percent}
            onChange={e => setPercent(e.target.value)}
            onBlur={() => Number(percent) !== cfg.percent && save({})}
            style={{ width: 64, padding: '0.4rem', background: 'var(--surface-800)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 4 }}
          />
        </label>
        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--surface-800)', padding: '0.25rem', borderRadius: 'var(--radius)' }}>
          {MODES.map(m => (
            <button
              key={m.id}
              onClick={() => save({ mode: m.id })}
              disabled={saving}
              style={{
                padding: '0.5rem 1rem',
                background: cfg.mode === m.id ? 'var(--primary-600)' : 'transparent',
                color: cfg.mode === m.id ? '#fff' : 'var(--surface-400)',
                border: 'none', borderRadius: 4, fontSize: '0.85rem', fontWeight: 600,
                cursor: saving ? 'wait' : 'pointer'
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
