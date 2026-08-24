import React from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Flame, Sparkles, Trophy, Shield, Heart, Award, ChevronRight, Stethoscope, Zap, Star, Home } from 'lucide-react'
import { DOCTOR_CHARACTERS } from '../../../utils/doctorAvatars'
import { LEAGUE_TIERS } from '../../../utils/leagueSystem'
import { playTapSound } from '../../../utils/medlingoAudio'

export default function MedLingoProfileTab({
  state,
  onOpenMentorPicker,
  onOpenShop
}) {
  const navigate = useNavigate()
  const activeMentor = DOCTOR_CHARACTERS.find(d => d.id === state.activeMentorId) || DOCTOR_CHARACTERS[0]
  const currentTier = LEAGUE_TIERS[state.leagueTierIndex || 0] || LEAGUE_TIERS[0]
  const mentorImage = activeMentor.image || '/avatars/dr_house.png'

  // Weekly XP Data (Mon - Sun)
  const weeklyData = [
    { day: 'L', xp: 280, active: true },
    { day: 'M', xp: 450, active: true },
    { day: 'M', xp: 190, active: true },
    { day: 'J', xp: 620, active: true },
    { day: 'V', xp: 380, active: true },
    { day: 'S', xp: 520, active: true },
    { day: 'D', xp: 410, active: true }
  ]

  const totalWeeklyXp = weeklyData.reduce((acc, curr) => acc + curr.xp, 0)
  const maxY = 800

  // SVG Line Chart Points calculation (width: 320, height: 140)
  const chartWidth = 320
  const chartHeight = 130
  const paddingX = 25
  const stepX = (chartWidth - paddingX * 2) / (weeklyData.length - 1)

  const points = weeklyData.map((d, i) => {
    const x = paddingX + i * stepX
    const y = chartHeight - 20 - (d.xp / maxY) * (chartHeight - 40)
    return { x, y, ...d }
  })

  const pathD = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '')

  return (
    <div className="medlingo-tab-content profile animate-scale-up">
      
      {/* ── Profile Header with Standing Mentor Mascot ── */}
      <div className="profile-hero-card">
        <div className="profile-hero-avatar-wrap">
          <img 
            src={mentorImage} 
            alt={activeMentor.name} 
            className="profile-standing-avatar"
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'flex'
            }}
          />
          <div className="profile-avatar-fallback" style={{ display: 'none', background: activeMentor.avatarBg }}>
            <span>{activeMentor.emoji}</span>
          </div>
          <div className="mentor-change-floating-btn" onClick={onOpenMentorPicker}>
            <Stethoscope size={14} />
            <span>Cambiar</span>
          </div>
        </div>

        <div className="profile-hero-details">
          <div className="profile-badge-tier" style={{ color: currentTier.color }}>
            {currentTier.emoji} {currentTier.name.toUpperCase()}
          </div>
          <h2 className="profile-doctor-name">{activeMentor.name}</h2>
          <p className="profile-doctor-quote">"{activeMentor.quote}"</p>
          
          <div className="profile-stats-row">
            <div className="p-stat">
              <span className="p-stat-val">6</span>
              <span className="p-stat-lbl">Especialidades</span>
            </div>
            <div className="p-stat">
              <span className="p-stat-val streak">🔥 {state.currentStreak || 1}</span>
              <span className="p-stat-lbl">Días Racha</span>
            </div>
            <div className="p-stat">
              <span className="p-stat-val gems">💎 {state.gems || 0}</span>
              <span className="p-stat-lbl">Gemas</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── WEEKLY PROGRESS GRAPH (DUOLINGO STYLE) ── */}
      <div className="profile-progress-chart-card">
        <div className="chart-header">
          <div className="chart-title-wrap">
            <span className="chart-title">PROGRESO SEMANAL</span>
            <span className="chart-subtitle">Actividad clínica diaria en lecciones</span>
          </div>
          <div className="chart-total-xp">
            <strong>{totalWeeklyXp.toLocaleString()} XP</strong>
          </div>
        </div>

        {/* SVG Interactive Line Chart */}
        <div className="chart-svg-container">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="progress-svg">
            
            {/* Horizontal Grid lines */}
            <line x1={paddingX} y1={25} x2={chartWidth - paddingX} y2={25} className="chart-grid-line" />
            <text x={paddingX - 6} y={28} className="chart-axis-label">800</text>

            <line x1={paddingX} y1={60} x2={chartWidth - paddingX} y2={60} className="chart-grid-line" />
            <text x={paddingX - 6} y={63} className="chart-axis-label">400</text>

            <line x1={paddingX} y1={95} x2={chartWidth - paddingX} y2={95} className="chart-grid-line" />
            <text x={paddingX - 6} y={98} className="chart-axis-label">200</text>

            <line x1={paddingX} y1={chartHeight - 15} x2={chartWidth - paddingX} y2={chartHeight - 15} className="chart-grid-line zero" />
            <text x={paddingX - 6} y={chartHeight - 12} className="chart-axis-label">0</text>

            {/* Glowing Trend Line */}
            <path d={pathD} fill="none" className="chart-line-glow" />
            <path d={pathD} fill="none" className="chart-line-main" />

            {/* Day Dots and Labels */}
            {points.map((p, idx) => (
              <g key={idx}>
                <circle 
                  cx={p.x} 
                  cy={p.y} 
                  r={5} 
                  className="chart-dot" 
                />
                <circle 
                  cx={p.x} 
                  cy={p.y} 
                  r={2.5} 
                  className="chart-dot-inner" 
                />
                <text 
                  x={p.x} 
                  y={chartHeight - 2} 
                  className={`chart-day-label ${p.active ? 'active' : ''}`}
                >
                  {p.day}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* ── MedLingo Badges & Achievements ── */}
      <div className="profile-achievements-card">
        <h3 className="section-title">Logros de Guardia</h3>
        <div className="achievements-list">
          
          <div className="achievement-item unlocked">
            <div className="achieve-icon-frame gold">
              <Star size={24} />
            </div>
            <div className="achieve-details">
              <strong>Primer Auscultador</strong>
              <p>Completa tu primera lección de semiología con 3 estrellas.</p>
            </div>
            <span className="achieve-badge">Desbloqueado</span>
          </div>

          <div className="achievement-item unlocked">
            <div className="achieve-icon-frame flame">
              <Flame size={24} />
            </div>
            <div className="achieve-details">
              <strong>Racha Inquebrantable</strong>
              <p>Mantén tu racha de estudio activa por 7 días seguidos.</p>
            </div>
            <span className="achieve-badge">En Curso</span>
          </div>

          <div className="achievement-item">
            <div className="achieve-icon-frame locked">
              <Trophy size={24} />
            </div>
            <div className="achieve-details">
              <strong>Maestro EUNACOM</strong>
              <p>Alcanza la liga de Honor y completa todas las 6 especialidades.</p>
            </div>
            <span className="achieve-badge locked">Bloqueado</span>
          </div>

        </div>
      </div>

      {/* ── Return to Platform Button ── */}
      <button 
        className="profile-exit-to-dashboard-btn"
        onClick={() => {
          playTapSound()
          navigate('/dashboard')
        }}
      >
        <Home size={18} />
        <span>Volver a la Plataforma Principal</span>
      </button>

    </div>
  )
}
