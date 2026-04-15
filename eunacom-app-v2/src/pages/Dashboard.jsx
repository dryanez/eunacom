import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Target, Flame, Trophy, Crown, Medal, ChevronRight, BookOpen, BarChart3, Calendar } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { fetchProgress, fetchLeaderboard } from '../lib/api'
import { XP_PER_CORRECT, XP_PER_INCORRECT, getLevelTitle, getLevelProgress, getXPForLevel } from '../utils/xpSystem'

const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ total: 0, correct: 0, xp: 0 })
  const [leaderboard, setLeaderboard] = useState([])
  const [streak, setStreak] = useState(0)
  const [todayAnswers, setTodayAnswers] = useState(0)
  const [lbPeriod, setLbPeriod] = useState('week')
  const [myRank, setMyRank] = useState(null)
  const [loading, setLoading] = useState(true)
  const dailyGoal = 50

  useEffect(() => {
    if (!user) return
    Promise.all([
      fetchProgress(user.id).catch(() => []),
      fetchLeaderboard(lbPeriod, user.id).catch(() => ({ leaderboard: [], streak: 0, todayAnswers: 0, todayCorrect: 0 })),
    ]).then(([prog, lb]) => {
      const correct = prog.filter(p => p.is_correct).length
      const total = prog.length
      const xp = correct * XP_PER_CORRECT + (total - correct) * XP_PER_INCORRECT
      setStats({ total, correct, xp })
      if (lb) {
        setLeaderboard(lb.leaderboard || [])
        setStreak(lb.streak || 0)
        setTodayAnswers(lb.todayAnswers || 0)
        const idx = (lb.leaderboard || []).findIndex(u => u.user_id === user.id)
        setMyRank(idx >= 0 ? idx + 1 : null)
      }
      setLoading(false)
    })
  }, [user, lbPeriod])

  useEffect(() => {
    if (!user || loading) return
    fetchLeaderboard(lbPeriod, user.id).then(lb => {
      if (lb) {
        setLeaderboard(lb.leaderboard || [])
        const idx = (lb.leaderboard || []).findIndex(u => u.user_id === user.id)
        setMyRank(idx >= 0 ? idx + 1 : null)
      }
    }).catch(() => {})
  }, [lbPeriod])

  const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0
  const lvl = getLevelProgress(stats.xp)
  const goalPct = Math.min(100, Math.round((todayAnswers / dailyGoal) * 100))

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      {/* XP + Level bar */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Trophy size={20} color="var(--accent-amber)" />
          <span style={{ fontWeight: 800, fontSize: '1rem' }}>{getLevelTitle(stats.xp)}</span>
        </div>
        <div style={{ flex: 1, minWidth: 120 }}>
          <div className="xp-bar" style={{ height: 8 }}>
            <div className="xp-bar__fill" style={{ width: lvl.progress + '%' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--surface-400)', marginTop: 2 }}>
            <span>{stats.xp} XP</span>
            <span>Nivel {lvl.level} → {getXPForLevel(lvl.level + 1)} XP</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-full)', background: streak > 0 ? 'rgba(245,158,11,0.1)' : 'var(--surface-600)', border: '1px solid ' + (streak > 0 ? 'rgba(245,158,11,0.25)' : 'rgba(255,255,255,0.05)') }}>
          <Flame size={16} color={streak > 0 ? 'var(--accent-amber)' : 'var(--surface-500)'} fill={streak > 0 ? 'var(--accent-amber)' : 'none'} />
          <span style={{ fontWeight: 800, fontSize: '0.9rem', color: streak > 0 ? 'var(--accent-amber)' : 'var(--surface-500)' }}>{streak}</span>
          <span style={{ fontSize: '0.72rem', color: 'var(--surface-400)' }}>días</span>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ position: 'relative', width: 64, height: 64, margin: '0 auto 0.5rem' }}>
            <svg viewBox="0 0 36 36" style={{ width: 64, height: 64, transform: 'rotate(-90deg)' }}>
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--surface-600)" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.9" fill="none" stroke={accuracy >= 70 ? 'var(--accent-green)' : accuracy >= 50 ? 'var(--accent-amber)' : 'var(--accent-red)'} strokeWidth="3" strokeDasharray={accuracy + ' ' + (100 - accuracy)} strokeLinecap="round" />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.95rem' }}>{accuracy}%</div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--surface-400)', fontWeight: 600, textTransform: 'uppercase' }}>Precisión</div>
        </div>
        <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
          <FileText size={28} color="var(--primary-300)" style={{ margin: '0 auto 0.5rem' }} />
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats.total.toLocaleString()}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--surface-400)', fontWeight: 600, textTransform: 'uppercase' }}>Respondidas</div>
        </div>
        <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
          <Target size={28} color={goalPct >= 100 ? 'var(--accent-green)' : 'var(--accent-teal)'} style={{ margin: '0 auto 0.5rem' }} />
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{goalPct >= 100 ? '✅' : todayAnswers + '/' + dailyGoal}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--surface-400)', fontWeight: 600, textTransform: 'uppercase' }}>Meta Diaria</div>
          <div className="xp-bar" style={{ height: 5, marginTop: '0.5rem' }}>
            <div className="xp-bar__fill" style={{ width: goalPct + '%', background: goalPct >= 100 ? 'var(--accent-green)' : 'var(--accent-teal)' }} />
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Crown size={18} color="var(--accent-amber)" /> Ranking
          </h2>
          <div style={{ display: 'flex', background: 'var(--surface-600)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
            {[['today','Hoy'],['week','Semana'],['all','General']].map(function([key, label]) {
              return React.createElement('button', {
                key: key,
                onClick: function() { setLbPeriod(key) },
                style: { padding: '0.35rem 0.75rem', border: 'none', fontSize: '0.78rem', fontWeight: 600, background: lbPeriod === key ? 'var(--primary-500)' : 'transparent', color: lbPeriod === key ? '#fff' : 'var(--surface-400)', cursor: 'pointer', fontFamily: 'var(--font)', transition: 'all 0.15s' }
              }, label)
            })}
          </div>
        </div>
        {leaderboard.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--surface-400)', fontSize: '0.85rem', padding: '1rem 0' }}>No hay datos aún. ¡Responde preguntas para aparecer!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {leaderboard.slice(0, 10).map(function(entry, i) {
              var isMe = entry.user_id === (user && user.id)
              var rank = i + 1
              return (
                <div key={entry.user_id} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius)', background: isMe ? 'rgba(19,91,236,0.08)' : 'transparent', border: isMe ? '1px solid rgba(19,91,236,0.2)' : '1px solid transparent' }}>
                  <div style={{ width: 24, textAlign: 'center', fontWeight: 800, fontSize: '0.85rem', color: rank <= 3 ? ['var(--accent-amber)','#94a3b8','#cd7f32'][rank-1] : 'var(--surface-400)' }}>
                    {rank === 1 ? <Crown size={16} /> : rank <= 3 ? <Medal size={16} /> : rank}
                  </div>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'hsl(' + ((entry.user_id || '').charCodeAt(0) * 37 % 360) + ', 60%, 45%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#fff' }}>
                    {(entry.display_name || 'A')[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{entry.display_name || 'Estudiante'}{isMe ? ' (tú)' : ''}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--surface-400)' }}>{entry.total_questions} preg. · {entry.accuracy}% precisión</div>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--accent-amber)' }}>{entry.xp} XP</div>
                </div>
              )
            })}
          </div>
        )}
        {myRank && myRank > 10 && (
          <div style={{ textAlign: 'center', marginTop: '0.75rem', padding: '0.5rem', background: 'rgba(19,91,236,0.05)', borderRadius: 'var(--radius)', fontSize: '0.82rem', color: 'var(--surface-300)' }}>
            Tu posición: <strong>#{myRank}</strong>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
        {[
          { label: 'Exámenes', icon: React.createElement(FileText, {size:20}), path: '/test', color: 'var(--primary-400)' },
          { label: 'Plan de Estudio', icon: React.createElement(Calendar, {size:20}), path: '/study-plan', color: 'var(--accent-teal)' },
          { label: 'Estadísticas', icon: React.createElement(BarChart3, {size:20}), path: '/stats', color: 'var(--accent-green)' },
          { label: 'Mis Clases', icon: React.createElement(BookOpen, {size:20}), path: '/mis-clases', color: 'var(--accent-amber)' },
        ].map(function(a) {
          return (
            <button key={a.path} onClick={function(){navigate(a.path)}} className="card" style={{ padding: '1rem', border: 'none', cursor: 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font)', background: 'var(--surface-700)' }}>
              <span style={{ color: a.color }}>{a.icon}</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--surface-200)' }}>{a.label}</span>
              <ChevronRight size={14} color="var(--surface-500)" />
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default Dashboard
