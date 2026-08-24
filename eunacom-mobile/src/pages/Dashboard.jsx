import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Play, Sparkles, Flame, Target, Trophy, ChevronRight, 
  Clock, CheckCircle2, Award, Zap, BookOpen, AlertCircle 
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useSubscription } from '../contexts/SubscriptionContext'
import { fetchProgress, fetchUserProfile } from '../lib/api'
import { calculateUserOverallStats, getLevelTitle, getDoctorForLevel } from '../utils/xpSystem'
import { getDoctorAvatar } from '../utils/doctorAvatars'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isPremium, setShowPaymentModal } = useSubscription()
  
  const [stats, setStats] = useState({
    totalAnswered: 0,
    accuracy: 0,
    streak: 1,
    level: 1,
    todayGoal: 20,
    todayCompleted: 12
  })
  const [userProfile, setUserProfile] = useState(null)
  const [avatarImage, setAvatarImage] = useState('/avatars/dr_dorian.png')

  useEffect(() => {
    if (!user) return
    Promise.all([
      fetchUserProfile(user.id).catch(() => null),
      calculateUserOverallStats(user.id).catch(() => ({ level: 1 })),
      fetchProgress(user.id).catch(() => null)
    ]).then(([profile, overallStats, progress]) => {
      if (profile) setUserProfile(profile)
      const userLvl = overallStats?.level || 1
      const doc = getDoctorAvatar(profile || user, userLvl)
      if (doc?.image) setAvatarImage(doc.image)

      const answered = progress?.total_questions_answered || 0
      const correct = progress?.total_correct_answers || 0
      const acc = answered > 0 ? Math.round((correct / answered) * 100) : 0

      setStats({
        totalAnswered: answered,
        accuracy: acc,
        streak: progress?.streak_days || 1,
        level: userLvl,
        todayGoal: 20,
        todayCompleted: Math.min(answered % 20, 20) || 8
      })
    }).catch(() => {})
  }, [user])

  const goalPercent = Math.min(Math.round((stats.todayCompleted / stats.todayGoal) * 100), 100)

  return (
    <div style={{
      padding: '1rem',
      maxWidth: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      boxSizing: 'border-box'
    }}>
      {/* ── Apple HIG Hero: Daily Goal Card ── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95))',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '20px',
        padding: '1.25rem',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem'
      }}>
        {/* Top Doctor Greeting */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Meta de Estudio Diaria
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', marginTop: '2px' }}>
              Hola, {userProfile?.first_name ? `Dr(a). ${userProfile.first_name}` : 'Doctor(a)'} 👋
            </div>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            background: 'rgba(249, 115, 22, 0.15)',
            border: '1px solid rgba(249, 115, 22, 0.3)',
            padding: '0.35rem 0.65rem',
            borderRadius: '12px'
          }}>
            <Flame size={16} color="#f97316" fill="#f97316" />
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fed7aa' }}>
              {stats.streak} días
            </span>
          </div>
        </div>

        {/* Progress Bar & Counter */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem' }}>
            <span style={{ color: '#e2e8f0' }}>Progreso de Hoy</span>
            <span style={{ color: '#38bdf8' }}>{stats.todayCompleted} / {stats.todayGoal} preguntas</span>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{
              width: `${goalPercent}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #38bdf8, #3b82f6)',
              borderRadius: '4px',
              transition: 'width 0.5s ease-out'
            }} />
          </div>
        </div>

        {/* Quick CTA button */}
        <button
          onClick={() => navigate('/test')}
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '0.65rem 1rem',
            fontSize: '0.85rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)'
          }}
        >
          <Play size={16} fill="white" /> Continuar Preguntas de Hoy
        </button>
      </div>

      {/* ── Apple HIG 2x2 Quick Actions Grid ── */}
      <div>
        <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#94a3b8', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Acceso Rápido
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.65rem' }}>
          {/* Card 1: Masterclasses */}
          <div
            onClick={() => navigate('/mis-clases')}
            style={{
              background: 'rgba(30, 41, 59, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '0.9rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              cursor: 'pointer',
              transition: 'transform 0.12s ease'
            }}
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(129, 140, 248, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BookOpen size={18} color="#818cf8" />
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'white' }}>
                Masterclasses
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                +650 Clases en Video
              </div>
            </div>
          </div>

          {/* Card 2: Simulacro */}
          <div
            onClick={() => navigate('/simulation')}
            style={{
              background: 'rgba(30, 41, 59, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '0.9rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              cursor: 'pointer',
              transition: 'transform 0.12s ease'
            }}
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(236, 72, 153, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Target size={18} color="#ec4899" />
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'white' }}>
                Simulacro 180
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                Examen Real EUNACOM
              </div>
            </div>
          </div>

          {/* Card 3: Reconstrucciones */}
          <div
            onClick={() => navigate('/reconstructions')}
            style={{
              background: 'rgba(30, 41, 59, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '0.9rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              cursor: 'pointer',
              transition: 'transform 0.12s ease'
            }}
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(139, 92, 246, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Award size={18} color="#8b5cf6" />
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'white' }}>
                Reconstrucciones
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                Años 2020 - 2025
              </div>
            </div>
          </div>

          {/* Card 4: MedLingo */}
          <div
            onClick={() => navigate('/medlingo')}
            style={{
              background: 'rgba(30, 41, 59, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '0.9rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              cursor: 'pointer',
              transition: 'transform 0.12s ease'
            }}
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(249, 115, 22, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Zap size={18} color="#f97316" />
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'white' }}>
                MedLingo
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                Práctica en 3 minutos
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Apple HIG Inset Grouped Section: Especialidades EUNACOM ── */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.6)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '18px',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '0.85rem 1rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          fontSize: '0.82rem',
          fontWeight: 800,
          color: '#cbd5e1',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>Módulos con Mayor Ponderación</span>
          <span style={{ fontSize: '0.72rem', color: '#38bdf8', cursor: 'pointer' }} onClick={() => navigate('/mis-clases')}>
            Ver todos
          </span>
        </div>

        {[
          { name: 'Medicina Interna (Cardio & Resp)', weight: '45%', color: '#38bdf8', icon: Target },
          { name: 'Pediatría y Neonatología', weight: '20%', color: '#ec4899', icon: Sparkles },
          { name: 'Cirugía General & Urgencias', weight: '18%', color: '#f59e0b', icon: Zap },
          { name: 'Gineco-Obstetricia', weight: '17%', color: '#8b5cf6', icon: BookOpen },
        ].map((item, idx) => {
          const Icon = item.icon
          return (
            <div
              key={idx}
              onClick={() => navigate('/mis-clases')}
              style={{
                padding: '0.8rem 1rem',
                borderBottom: idx < 3 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '8px',
                  background: `${item.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon size={16} color={item.color} />
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white' }}>
                  {item.name}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: item.color,
                  background: `${item.color}15`,
                  padding: '2px 6px',
                  borderRadius: '6px'
                }}>
                  {item.weight}
                </span>
                <ChevronRight size={16} color="#64748b" />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
