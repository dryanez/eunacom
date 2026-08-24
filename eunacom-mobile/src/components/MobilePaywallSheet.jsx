import React, { useState } from 'react'
import { 
  X, Check, Sparkles, ShieldCheck, Star, 
  Lock, ArrowRight, Loader2, Zap, HeartHandshake, CheckCircle2 
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { createCheckoutSession } from '../lib/api'

const PLANS = [
  { 
    id: '6m', 
    name: '6 Meses', 
    period: 'Plan Semestral', 
    price: '$54.990', 
    monthlyEquivalent: '$9.165/mes',
    discount: '40% Dcto',
    popular: true, 
    paypal: 'https://www.paypal.com/ncp/payment/UE9AAX3JRPS7Y' 
  },
  { 
    id: '1y', 
    name: '1 Año', 
    period: 'Plan Anual', 
    price: '$89.990', 
    monthlyEquivalent: '$7.499/mes',
    discount: '55% Dcto',
    bestValue: true, 
    paypal: 'https://www.paypal.com/ncp/payment/XWTMQC3CJ4V9L' 
  },
  { 
    id: '3m', 
    name: '3 Meses', 
    period: 'Plan Trimestral', 
    price: '$34.990', 
    monthlyEquivalent: '$11.663/mes',
    discount: null,
    paypal: 'https://www.paypal.com/ncp/payment/FJSVXQV45GHWC' 
  },
  { 
    id: '1m', 
    name: '1 Mes', 
    period: 'Plan Mensual', 
    price: '$14.990', 
    monthlyEquivalent: '$14.990/mes',
    discount: null,
    paypal: 'https://www.paypal.com/ncp/payment/KMT3QCWH9M96A' 
  }
]

const FEATURES = [
  'Acceso ilimitado a +650 Masterclasses (Perfil V3)',
  'Banco de +10.000 preguntas con explicaciones clínicas',
  'Simulacros Oficiales 180 preguntas cronometrados',
  'MedLingo gamificado con vidas y rachas diarias',
  'Historial de errores y diagnóstico por especialidad'
]

const REVIEWS = [
  { name: 'Dr. Matías R.', uni: 'U. de Chile', score: '88 pts', text: 'El formato de video y preguntas me permitió estudiar en los tiempos libres del internado. Aprobé en el 90° percentil.' },
  { name: 'Dra. Camila S.', uni: 'U. de Concepción', score: '84 pts', text: 'Las explicaciones justificadas son clave. Los simulacros son idénticos al examen real.' }
]

export default function MobilePaywallSheet({ onClose }) {
  const { user, openAuthModal } = useAuth()
  const [selectedPlan, setSelectedPlan] = useState(PLANS[0]) // Default 6 months
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
      const res = await createCheckoutSession(user.id, selectedPlan.id)
      if (res && res.init_point) {
        window.location.href = res.init_point
      } else {
        throw new Error('No se pudo generar la sesión de pago')
      }
    } catch (err) {
      console.error(err)
      setError('Hubo un problema al conectar con la pasarela. Intenta con PayPal o recarga la página.')
      setLoading(false)
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
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
          maxWidth: '520px',
          maxHeight: '92dvh',
          background: 'var(--surface-800, #0f172a)',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Top Drag Handle & Close */}
        <div style={{
          padding: '0.75rem 1rem 0.25rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <div style={{
            width: '36px',
            height: '4px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '2px',
            margin: '0 auto',
            marginLeft: 'calc(50% - 18px)'
          }} />
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
        </div>

        {/* Scrollable Content */}
        <div style={{
          padding: '0.5rem 1.25rem 1.25rem 1.25rem',
          overflowY: 'auto',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {/* Header Title */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.15))',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              padding: '0.3rem 0.75rem',
              borderRadius: '20px',
              color: '#fbbf24',
              fontSize: '0.75rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.5rem'
            }}>
              <Sparkles size={14} /> Acceso Ilimitado EUNACOM
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'white', margin: 0 }}>
              Asegura tu Aprobación Médica
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '0.35rem 0 0 0' }}>
              Estudia con el estándar oficial de 10.000+ preguntas y 650+ clases.
            </p>
          </div>

          {/* Value Checklist */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.7)',
            borderRadius: '14px',
            padding: '0.85rem 1rem',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.45rem'
          }}>
            {FEATURES.map((feat, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.78rem', color: '#e2e8f0' }}>
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: '#10b98125',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Check size={12} color="#10b981" strokeWidth={3} />
                </div>
                <span>{feat}</span>
              </div>
            ))}
          </div>

          {/* Plan Selector */}
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Selecciona tu plan
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.65rem' }}>
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
                      padding: '0.85rem 0.75rem',
                      cursor: 'pointer',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {plan.popular && (
                      <div style={{
                        position: 'absolute',
                        top: '-9px',
                        right: '8px',
                        background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                        color: 'white',
                        fontSize: '0.62rem',
                        fontWeight: 800,
                        padding: '2px 7px',
                        borderRadius: '10px'
                      }}>
                        MÁS POPULAR
                      </div>
                    )}
                    {plan.bestValue && (
                      <div style={{
                        position: 'absolute',
                        top: '-9px',
                        right: '8px',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        color: 'white',
                        fontSize: '0.62rem',
                        fontWeight: 800,
                        padding: '2px 7px',
                        borderRadius: '10px'
                      }}>
                        MEJOR VALOR
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'white' }}>
                        {plan.name}
                      </span>
                      {isSelected ? (
                        <CheckCircle2 size={16} color="#3b82f6" />
                      ) : (
                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '1.5px solid #64748b' }} />
                      )}
                    </div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#38bdf8' }}>
                      {plan.price}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600 }}>
                      {plan.monthlyEquivalent}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Social Proof */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '0.75rem 0.85rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.35rem' }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={13} fill="#fbbf24" color="#fbbf24" />
              ))}
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#fbbf24', marginLeft: '0.25rem' }}>
                4.9 / 5.0 (Médicos Egresados)
              </span>
            </div>
            <div style={{ fontSize: '0.73rem', color: '#cbd5e1', fontStyle: 'italic', lineHeight: '1.3' }}>
              "{REVIEWS[0].text}"
            </div>
            <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '0.25rem', fontWeight: 600 }}>
              — {REVIEWS[0].name}, {REVIEWS[0].uni} ({REVIEWS[0].score})
            </div>
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
          padding: '0.85rem 1.25rem max(1rem, env(safe-area-inset-bottom, 1rem)) 1.25rem',
          background: 'rgba(15, 23, 42, 0.95)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          flexShrink: 0
        }}>
          <button
            onClick={handleCheckout}
            disabled={loading}
            style={{
              width: '100%',
              minHeight: '48px',
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
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
              boxShadow: '0 8px 20px -4px rgba(59, 130, 246, 0.5)'
            }}
          >
            {loading ? (
              <Loader2 size={20} className="spin" />
            ) : (
              <>
                Desbloquear por {selectedPlan.price} <ArrowRight size={18} />
              </>
            )}
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            fontSize: '0.68rem',
            color: '#64748b'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <ShieldCheck size={13} color="#10b981" /> Pago Seguro SSL
            </span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Lock size={12} /> Webpay / Mercado Pago / PayPal
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
