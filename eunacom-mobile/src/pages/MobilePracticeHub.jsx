import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Target, CheckSquare, FileText, RotateCcw, Flame, 
  Sparkles, Trophy, ChevronRight, Zap, BookOpen, Clock, ShieldCheck 
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useSubscription } from '../contexts/SubscriptionContext'
import { fetchProgress, fetchTests } from '../lib/api'

export default function MobilePracticeHub() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isPremium, setShowPaymentModal } = useSubscription()
  const [stats, setStats] = useState({ totalAnswered: 0, accuracy: 0, testsCount: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    Promise.all([
      fetchProgress(user.id).catch(() => null),
      fetchTests(user.id).catch(() => [])
    ]).then(([progress, tests]) => {
      if (progress) {
        const total = progress.total_questions_answered || 0
        const correct = progress.total_correct_answers || 0
        const acc = total > 0 ? Math.round((correct / total) * 100) : 0
        setStats({
          totalAnswered: total,
          accuracy: acc,
          testsCount: Array.isArray(tests) ? tests.length : 0
        })
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [user])

  const practiceModes = [
    {
      id: 'custom-test',
      title: 'Crear Prueba Personalizada',
      subtitle: 'Elige especialidad, modo tutor o examen y cantidad',
      icon: CheckSquare,
      color: '#3b82f6',
      badge: 'Flexible',
      path: '/test',
      tagline: '+10.000 preguntas'
    },
    {
      id: 'simulation',
      title: 'Simulacro Oficial EUNACOM',
      subtitle: '180 preguntas cronometradas con puntaje real',
      icon: Target,
      color: '#ec4899',
      badge: 'Examen Real',
      path: '/simulation',
      tagline: '180 preguntas'
    },
    {
      id: 'reconstructions',
      title: 'Reconstrucciones Oficiales',
      subtitle: 'Preguntas reales recopiladas de exámenes anteriores',
      icon: FileText,
      color: '#8b5cf6',
      badge: 'Histórico',
      path: '/reconstructions',
      tagline: '2020 - 2025'
    },
    {
      id: 'review-errors',
      title: 'Repaso de Errores',
      subtitle: 'Entrena solo las preguntas que fallaste anteriormente',
      icon: RotateCcw,
      color: '#f59e0b',
      badge: 'Smart Review',
      path: '/review',
      tagline: 'Fijación activa'
    },
    {
      id: 'medlingo',
      title: 'MedLingo Rápido',
      subtitle: 'Micro-preguntas gamificadas en 3 minutos',
      icon: Flame,
      color: '#f97316',
      badge: 'Gamificado',
      path: '/medlingo',
      tagline: 'Mantén tu racha'
    }
  ]

  return (
    <div style={{ padding: '1rem', maxWidth: '640px', margin: '0 auto', paddingBottom: '5.5rem' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.12))',
        border: '1px solid rgba(59, 130, 246, 0.25)',
        borderRadius: '16px',
        padding: '1.25rem',
        marginBottom: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Zap size={20} color="#38bdf8" />
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#38bdf8' }}>
                Centro de Práctica
              </span>
            </div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white', margin: '0.25rem 0 0 0' }}>
              Entrenamiento EUNACOM
            </h1>
          </div>
          {!isPremium && (
            <button
              onClick={() => setShowPaymentModal(true)}
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: 'white',
                border: 'none',
                padding: '0.4rem 0.75rem',
                borderRadius: '10px',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                cursor: 'pointer'
              }}
            >
              <Sparkles size={14} /> PRO
            </button>
          )}
        </div>

        {/* Quick Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.5rem',
          background: 'rgba(15, 23, 42, 0.6)',
          borderRadius: '12px',
          padding: '0.75rem 0.5rem',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8' }}>
              {stats.totalAnswered}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600 }}>Respondidas</div>
          </div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981' }}>
              {stats.accuracy}%
            </div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600 }}>Precisión</div>
          </div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#a855f7' }}>
              {stats.testsCount}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600 }}>Pruebas</div>
          </div>
        </div>
      </div>

      {/* Practice Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {practiceModes.map((mode) => {
          const Icon = mode.icon
          return (
            <div
              key={mode.id}
              onClick={() => navigate(mode.path)}
              style={{
                background: 'var(--surface-800, #1e293b)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                padding: '1rem 1.15rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Left Color Accent Pill */}
              <div style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: '4px',
                background: mode.color
              }} />

              {/* Icon */}
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: `${mode.color}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Icon size={22} color={mode.color} />
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'white' }}>
                    {mode.title}
                  </span>
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '6px',
                    background: `${mode.color}25`,
                    color: mode.color
                  }}>
                    {mode.badge}
                  </span>
                </div>
                <div style={{
                  fontSize: '0.78rem',
                  color: 'var(--surface-400, #94a3b8)',
                  lineHeight: '1.25',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap'
                }}>
                  {mode.subtitle}
                </div>
              </div>

              {/* Right Arrow */}
              <div style={{ color: 'var(--surface-500, #64748b)' }}>
                <ChevronRight size={20} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Official Guarantee Note */}
      <div style={{
        marginTop: '1.5rem',
        padding: '0.85rem 1rem',
        borderRadius: '12px',
        background: 'rgba(16, 185, 129, 0.08)',
        border: '1px solid rgba(16, 185, 129, 0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <ShieldCheck size={24} color="#10b981" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '0.75rem', color: '#a7f3d0', lineHeight: '1.35' }}>
          <strong>Preguntas calibradas al estándar ASOFAMECH / EUNACOM 2026</strong> con justificaciones clínicas paso a paso.
        </div>
      </div>
    </div>
  )
}
