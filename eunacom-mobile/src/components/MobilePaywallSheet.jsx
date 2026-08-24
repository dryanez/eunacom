import React, { useState } from 'react'
import { 
  X, Check, Sparkles, ShieldCheck, Star, 
  Lock, ArrowRight, Loader2, Zap, BookOpen, Layers, CheckCircle2 
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { createCheckoutSession } from '../lib/api'

const PLANS = [
  { 
    id: 'trial_6m', 
    name: 'Prueba de 3 Días', 
    badge: 'GRATIS',
    badgeColor: '#10b981',
    price: 'GRATIS', 
    subtext: 'luego $9.165/mes ($54.990 semestral)',
    popular: true, 
    paypal: 'https://www.paypal.com/ncp/payment/UE9AAX3JRPS7Y' 
  },
  { 
    id: '1y', 
    name: 'Plan Anual', 
    badge: 'AHORRA 55%',
    badgeColor: '#ef4444',
    price: '$89.990', 
    subtext: '$7.499/mes facturado anualmente',
    bestValue: true, 
    paypal: 'https://www.paypal.com/ncp/payment/XWTMQC3CJ4V9L' 
  },
  { 
    id: '1m', 
    name: 'Plan Mensual', 
    badge: null,
    price: '$14.990', 
    subtext: 'acceso completo por 30 días',
    paypal: 'https://www.paypal.com/ncp/payment/KMT3QCWH9M96A' 
  }
]

const VALUE_PROPS = [
  { icon: BookOpen, title: '+650 Masterclasses Perfil V3', desc: 'Clases concisas de 10-15 min con audio y diapositivas' },
  { icon: Sparkles, title: '+10.000 Preguntas Oficiales', desc: 'Con justificaciones clínicas y guías de manejo' },
  { icon: Layers, title: 'Simulacros 180 Preguntas', desc: 'Cronometrados con ranking y cálculo de puntaje real' },
  { icon: Lock, title: 'Fijación Activa de Errores', desc: 'Algoritmo inteligente para no volver a fallar' }
]

export default function MobilePaywallSheet({ onClose }) {
  const { user, openAuthModal } = useAuth()
  const [selectedPlan, setSelectedPlan] = useState(PLANS[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleCheckout = async () => {
    if (!user) {
      if (openAuthModal) openAuthModal('login')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const planId = selectedPlan.id === 'trial_6m' ? '6m' : selectedPlan.id
      const res = await createCheckoutSession(user.id, planId)
      if (res && res.init_point) {
        window.location.href = res.init_point
      } else {
        throw new Error('No se pudo generar la sesión de pago')
      }
    } catch (err) {
      console.error(err)
      setError('Error al conectar con la pasarela. Intenta con PayPal.')
      setLoading(false)
    }
  }

  return (
    <div
      className="mobile-paywall-overlay"
      onClick={onClose}
      style={{
        inset: 0,
        zIndex: 99999,
        background: 'rgba(5, 10, 20, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: 0
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '500px',
          maxHeight: '92dvh',
          background: 'var(--surface-800, #0f172a)',
          borderTopLeftRadius: '28px',
          borderTopRightRadius: '28px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Top Close Button & Drag indicator */}
        <div style={{
          padding: '0.85rem 1.25rem 0.25rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
          <div style={{
            width: '36px',
            height: '4px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '2px',
            marginRight: '32px'
          }} />
          <div style={{ width: '0px' }} />
        </div>

        {/* Scrollable Body */}
        <div style={{
          padding: '0.25rem 1.5rem 1.25rem 1.5rem',
          overflowY: 'auto',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '1.15rem'
        }}>
          {/* Header Icon with PRO Badge */}
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '0.75rem' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '18px',
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.15))',
                border: '1.5px solid rgba(245, 158, 11, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(245, 158, 11, 0.2)'
              }}>
                <img src="/logo.png" alt="Logo" style={{ width: '38px', height: '38px', objectFit: 'contain' }} onError={(e) => { e.currentTarget.style.display = 'none' }} />
              </div>
              <span style={{
                position: 'absolute',
                top: '-6px',
                right: '-10px',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: 'white',
                fontSize: '0.62rem',
                fontWeight: 900,
                padding: '2px 7px',
                borderRadius: '8px',
                letterSpacing: '0.04em',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)'
              }}>
                PRO
              </span>
            </div>

            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'white', margin: 0, letterSpacing: '-0.02em' }}>
              Acceso Ilimitado
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '0.25rem 0 0 0' }}>
              Todo lo que necesitas para aprobar el EUNACOM 2026
            </p>
          </div>

          {/* Value Propositions List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {VALUE_PROPS.map((prop, idx) => {
              const Icon = prop.icon
              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '10px',
                    background: 'rgba(56, 189, 248, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}>
                    <Icon size={16} color="#38bdf8" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white' }}>
                      {prop.title}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#94a3b8', lineHeight: '1.3' }}>
                      {prop.desc}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pricing Options Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {PLANS.map((plan) => {
              const isSelected = selectedPlan.id === plan.id
              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan)}
                  style={{
                    border: isSelected ? '2px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.1)',
                    background: isSelected ? 'rgba(59, 130, 246, 0.12)' : 'rgba(30, 41, 59, 0.5)',
                    borderRadius: '14px',
                    padding: '0.85rem 1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'white' }}>
                        {plan.name}
                      </span>
                      {plan.badge && (
                        <span style={{
                          fontSize: '0.62rem',
                          fontWeight: 800,
                          padding: '2px 6px',
                          borderRadius: '6px',
                          background: `${plan.badgeColor}25`,
                          color: plan.badgeColor
                        }}>
                          {plan.badge}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                      {plan.subtext}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div style={{
                      fontSize: plan.price === 'GRATIS' ? '0.95rem' : '1.15rem',
                      fontWeight: 800,
                      color: plan.price === 'GRATIS' ? '#10b981' : '#38bdf8'
                    }}>
                      {plan.price}
                    </div>
                    {isSelected ? (
                      <CheckCircle2 size={20} color="#3b82f6" />
                    ) : (
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '1.5px solid #64748b' }} />
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {error && (
            <div style={{
              background: '#ef444420',
              border: '1px solid #ef444450',
              borderRadius: '8px',
              padding: '0.5rem 0.75rem',
              color: '#fca5a5',
              fontSize: '0.75rem'
            }}>
              {error}
            </div>
          )}
        </div>

        {/* Sticky Action Footer */}
        <div style={{
          padding: '0.85rem 1.5rem max(1rem, env(safe-area-inset-bottom, 1rem)) 1.5rem',
          background: 'rgba(15, 23, 42, 0.95)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem',
          flexShrink: 0
        }}>
          <button
            onClick={handleCheckout}
            disabled={loading}
            style={{
              width: '100%',
              minHeight: '48px',
              background: selectedPlan.id.includes('trial')
                ? 'linear-gradient(135deg, #10b981, #059669)'
                : 'linear-gradient(135deg, #3b82f6, #2563eb)',
              color: 'white',
              border: 'none',
              borderRadius: '14px',
              fontSize: '1rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: selectedPlan.id.includes('trial')
                ? '0 8px 20px -4px rgba(16, 185, 129, 0.5)'
                : '0 8px 20px -4px rgba(59, 130, 246, 0.5)'
            }}
          >
            {loading ? (
              <Loader2 size={20} className="spin" />
            ) : selectedPlan.id.includes('trial') ? (
              'Comenzar 3 Días Gratis'
            ) : (
              <>
                Continuar con {selectedPlan.name} <ArrowRight size={18} />
              </>
            )}
          </button>

          {/* Legal / App Store Footer Links */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.85rem',
            fontSize: '0.7rem',
            color: '#64748b'
          }}>
            <button onClick={() => alert('Compras restauradas exitosamente')} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0, fontSize: 'inherit' }}>
              Restaurar
            </button>
            <span>•</span>
            <a href="/faq" style={{ color: '#64748b', textDecoration: 'none' }}>Términos</a>
            <span>•</span>
            <a href="/faq" style={{ color: '#64748b', textDecoration: 'none' }}>Privacidad</a>
          </div>
        </div>
      </div>
    </div>
  )
}
