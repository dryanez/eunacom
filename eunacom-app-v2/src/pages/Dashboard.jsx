import React, { useState, useEffect } from 'react'
import { PieChart, FileText, Target, Activity, CreditCard, RotateCcw, Flame, Trophy, Medal, Crown, ChevronDown, Zap, TrendingUp } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { fetchProgress, fetchLeaderboard } from '../lib/api'
import { XP_PER_CORRECT, XP_PER_INCORRECT, calculateLevelUp, getXPForLevel, getLevelTitle, getLevelProgress, formatXP } from '../utils/xpSystem'

const PERIODS = [
  { key: 'today', label: 'Hoy' },
  { key: 'week', label: 'Semana' },
  { key: 'all', label: 'General' },
]

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({ totalAnswered: 0, correctAnswers: 0, xp: 0, totalXP: 0, level: 1, streak: 0 })
  const [leaderboard, setLeaderboard] = useState([])
  const [lbPeriod, setLbPeriod] = useState('week')
  const [todayAnswers, setTodayAnswers] = useState(0)
  const [todayCorrect, setTodayCorrect] = useState(0)
  const [lbLoading, setLbLoading] = useState(true)
  const DAILY_GOAL = 50

  useEffect(() => {
    if (user) fetchStats()
    loadLeaderboard('week')
  }, [user])

  const fetchStats = async () => {
    try {
      const progressData = await fetchProgress(user.id)
      const total = progressData.length
      const correct = progressData.filter(p => p.is_correct).length
      const totalXP = (correct * XP_PER_CORRECT) + ((total - correct) * XP_PER_INCORRECT)
      const { newLevel, remainingXP } = calculateLevelUp(totalXP, 1)
      setStats({ totalAnswered: total, correctAnswers: correct, xp: remainingXP, totalXP, level: newLevel, streak: 0 })
    } catch (e) { console.error('Dashboard stats error:', e) }
  }

  const loadLeaderboard = async (period) => {
    setLbPeriod(period)
    setLbLoading(true)
    try {
      const data = await fetchLeaderboard(period, user?.id || null)
      setLeaderboard(data.leaderboard || [])
      if (user) {
        setStats(prev => ({ ...prev, streak: data.streak || 0 }))
        setTodayAnswers(data.todayAnswers || 0)
        setTodayCorrect(data.todayCorrect || 0)
      }
    } catch (e) { console.error('Leaderboard error:', e) }
    setLbLoading(false)
  }

  const accuracy = stats.totalAnswered > 0 ? Math.round((stats.correctAnswers / stats.totalAnswered) * 100) : 0
  const levelCapXP = getXPForLevel(stats.level + 1)
  const xpProgress = getLevelProgress(stats.xp, stats.level)
  const levelTitle = getLevelTitle(stats.level)
  const dailyPct = Math.min((todayAnswers / DAILY_GOAL) * 100, 100)

  // Find user's rank in leaderboard
  const myRank = leaderboard.findIndex(u => u.user_id === user?.id) + 1

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <h1 className="page__title">Inicio</h1>
      <p className="page__subtitle">{user ? 'Tu progreso general' : 'La plataforma de estudio EUNACOM más completa de Chile'}</p>

      {/* ─── GUEST CTA ─── */}
      {!user && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(19,91,236,0.15) 0%, rgba(6,182,212,0.1) 100%)',
          border: '1px solid rgba(19,91,236,0.25)', borderRadius: 'var(--radius-xl)',
          padding: '1.75rem 1.5rem', marginBottom: '1.5rem', textAlign: 'center',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🩺</div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--surface-50)', margin: '0 0 0.5rem' }}>
            Únete gratis y prepara tu EUNACOM
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--surface-300)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
            Más de 2.800 preguntas reales, exámenes completos, clases en video y ranking en tiempo real.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/register" style={{
              padding: '0.65rem 1.5rem', background: 'var(--gradient-primary)', color: '#fff',
              borderRadius: 'var(--radius-full)', fontWeight: 700, fontSize: '0.9rem',
              textDecoration: 'none', border: 'none',
            }}>Crear cuenta gratis</a>
            <a href="/login" style={{
              padding: '0.65rem 1.5rem', background: 'rgba(255,255,255,0.06)', color: 'var(--surface-100)',
              borderRadius: 'var(--radius-full)', fontWeight: 600, fontSize: '0.9rem',
              textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)',
            }}>Iniciar sesión</a>
          </div>
        </div>
      )}

      {/* ─── XP + STREAK BAR (logged-in only) ─── */}
      {user && (
        <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', marginBottom: '1.5rem', background: 'var(--surface-700)', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--primary-300)', fontWeight: 600, marginBottom: '0.25rem' }}>
              <Zap size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
              Nivel {stats.level} · {levelTitle}
            </div>
            <div className="xp-labels">
              <span>{formatXP(Math.max(0, levelCapXP - stats.xp))} XP para subir</span>
              <span>{formatXP(stats.xp)}/{formatXP(levelCapXP)} XP</span>
            </div>
            <div className="xp-bar"><div className="xp-bar__fill" style={{ width: `${xpProgress}%` }} /></div>
            <div style={{ fontSize: '0.72rem', color: 'var(--surface-400)', marginTop: 4 }}>Total: {formatXP(stats.totalXP)} XP</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '1.5rem', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
            <Flame size={36} color={stats.streak > 0 ? 'var(--accent-amber)' : 'var(--surface-500)'} fill={stats.streak > 0 ? 'var(--accent-amber)' : 'none'} />
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--surface-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Racha</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: stats.streak > 0 ? 'var(--accent-amber)' : 'var(--surface-300)' }}>{stats.streak}<span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--surface-400)' }}> días</span></div>
            </div>
          </div>
        </div>
      )}

      {/* ─── STATS GRID (logged-in only) ─── */}
      {user && (
        <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
          {/* Accuracy */}
          <div className="stat-card">
            <div className="stat-card__label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <div style={{ padding: '0.4rem', background: 'var(--surface-600)', borderRadius: 'var(--radius)' }}><PieChart size={18} color="var(--primary-300)" /></div>
              Puntaje
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '0.75rem 0' }}>
              <div className="donut-wrapper">
                <svg viewBox="0 0 36 36" className="circular-chart">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--surface-600)" strokeWidth="3" />
                  <path strokeDasharray={`${accuracy}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={accuracy >= 70 ? 'var(--accent-green)' : accuracy >= 50 ? 'var(--accent-amber)' : 'var(--primary-400)'} strokeWidth="3" strokeLinecap="round" />
                </svg>
                <div className="donut-center">
                  <div className="donut-value" style={{ fontSize: '1.1rem' }}>{accuracy}%</div>
                  <div className="donut-label">Correctas</div>
                </div>
              </div>
            </div>
          </div>

          {/* Total questions */}
          <div className="stat-card">
            <div className="stat-card__label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <div style={{ padding: '0.4rem', background: 'var(--surface-600)', borderRadius: 'var(--radius)' }}><FileText size={18} color="var(--primary-300)" /></div>
              Respondidas
            </div>
            <div style={{ padding: '0.75rem 0', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: 90 }}>
              <div className="stat-card__value">{stats.totalAnswered.toLocaleString()}</div>
              <div className="stat-card__sub">{stats.correctAnswers} correctas</div>
            </div>
          </div>

          {/* Daily goal */}
          <div className="stat-card">
            <div className="stat-card__label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <div style={{ padding: '0.4rem', background: 'var(--surface-600)', borderRadius: 'var(--radius)' }}><Target size={18} color={dailyPct >= 100 ? 'var(--accent-green)' : 'var(--primary-300)'} /></div>
              Meta Diaria
            </div>
            <div style={{ padding: '0.75rem 0', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: 90 }}>
              <div className="stat-card__value" style={{ color: dailyPct >= 100 ? 'var(--accent-green)' : 'var(--surface-50)', WebkitTextFillColor: 'initial', background: 'none' }}>
                {todayAnswers}<span style={{ color: 'var(--surface-400)', fontSize: '1.5rem', fontWeight: 600 }}>/{DAILY_GOAL}</span>
              </div>
              <div style={{ margin: '0.5rem auto 0', width: '80%' }}>
                <div className="xp-bar" style={{ height: 6 }}>
                  <div className="xp-bar__fill" style={{ width: `${dailyPct}%`, background: dailyPct >= 100 ? 'var(--accent-green)' : 'var(--primary-400)' }} />
                </div>
              </div>
              {dailyPct >= 100 && <div style={{ fontSize: '0.75rem', color: 'var(--accent-green)', fontWeight: 600, marginTop: 4 }}>✅ ¡Meta cumplida!</div>}
            </div>
          </div>
        </div>
      )}

      {/* ─── LEADERBOARD ─── */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Trophy size={20} color="var(--accent-amber)" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Leaderboard</h3>
            {myRank > 0 && <span style={{ fontSize: '0.78rem', color: 'var(--primary-300)', fontWeight: 600, background: 'rgba(19,91,236,0.1)', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)' }}>Tú #{myRank}</span>}
          </div>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {PERIODS.map(p => (
              <button key={p.key} onClick={() => loadLeaderboard(p.key)} style={{
                padding: '0.3rem 0.65rem', borderRadius: 'var(--radius-full)', border: 'none',
                background: lbPeriod === p.key ? 'var(--primary-500)' : 'var(--surface-600)',
                color: lbPeriod === p.key ? '#fff' : 'var(--surface-300)',
                fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)',
              }}>{p.label}</button>
            ))}
          </div>
        </div>

        {lbLoading ? (
          <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--surface-400)', fontSize: '0.85rem' }}>Cargando...</div>
        ) : leaderboard.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--surface-400)', fontSize: '0.85rem' }}>
            Aún no hay actividad {lbPeriod === 'today' ? 'hoy' : lbPeriod === 'week' ? 'esta semana' : ''}. ¡Sé el primero!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {leaderboard.slice(0, 10).map((u, i) => {
              const isMe = u.user_id === user?.id
              const name = (u.first_name ? `${u.first_name} ${(u.last_name || '').charAt(0)}.` : u.email?.split('@')[0] || 'Anónimo')
              const rankIcon = i === 0 ? <Crown size={16} color="#FFD700" /> : i === 1 ? <Medal size={16} color="#C0C0C0" /> : i === 2 ? <Medal size={16} color="#CD7F32" /> : null
              return (
                <div key={u.user_id} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius)',
                  background: isMe ? 'rgba(19,91,236,0.08)' : i < 3 ? 'rgba(255,255,255,0.02)' : 'transparent',
                  border: isMe ? '1px solid rgba(19,91,236,0.2)' : '1px solid transparent',
                }}>
                  <div style={{ width: 28, textAlign: 'center', fontWeight: 800, fontSize: '0.85rem', color: i < 3 ? 'var(--accent-amber)' : 'var(--surface-400)' }}>
                    {rankIcon || (i + 1)}
                  </div>
                  <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-full)', background: isMe ? 'var(--primary-500)' : 'var(--surface-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', color: '#fff', flexShrink: 0 }}>
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: isMe ? 700 : 500, fontSize: '0.88rem', color: 'var(--surface-100)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {name} {isMe && <span style={{ fontSize: '0.72rem', color: 'var(--primary-300)' }}>(tú)</span>}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--surface-400)' }}>
                      {u.correct}/{u.total_answers} correctas · {Math.round((u.correct / Math.max(u.total_answers, 1)) * 100)}%
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Zap size={14} /> {Number(u.xp).toLocaleString()}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ─── QUICK ACTIONS ─── */}
      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--surface-200)' }}>Accesos Rápidos</h3>
      <div className="action-grid">
        <a href="/test" className="action-card">
          <div className="action-card__icon" style={{ background: 'rgba(19,91,236,0.15)' }}><FileText size={24} color="var(--primary-400)" /></div>
          <div className="action-card__label">Exámenes</div>
        </a>
        <a href="/study-plan" className="action-card">
          <div className="action-card__icon" style={{ background: 'rgba(16,163,74,0.15)' }}><TrendingUp size={24} color="var(--accent-green)" /></div>
          <div className="action-card__label">Plan de Estudio</div>
        </a>
        <a href="/stats" className="action-card">
          <div className="action-card__icon" style={{ background: 'rgba(19,91,236,0.15)' }}><Activity size={24} color="var(--primary-400)" /></div>
          <div className="action-card__label">Estadísticas</div>
        </a>
        <a href="/mis-clases" className="action-card">
          <div className="action-card__icon" style={{ background: 'rgba(6,182,212,0.15)' }}><CreditCard size={24} color="var(--accent-teal)" /></div>
          <div className="action-card__label">Mis Clases</div>
        </a>
      </div>
    </div>
  )
}

export default Dashboard
