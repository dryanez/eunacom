import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Flame, Heart, Sparkles, ShoppingBag, ChevronDown, Award, ArrowLeft } from 'lucide-react'
import { MAX_HEARTS, getNextHeartCountdownSeconds } from '../../utils/gamificationStore'
import { DOCTOR_CHARACTERS } from '../../utils/doctorAvatars'
import { MEDLINGO_MODULES } from '../../data/medlingo/modulePaths'
import { playTapSound } from '../../utils/medlingoAudio'

export default function MedLingoHeader({
  state,
  currentModuleId,
  onSelectModule,
  onOpenShop,
  onOpenMentorPicker
}) {
  const [countdownSecs, setCountdownSecs] = useState(0)
  const [moduleDropdownOpen, setModuleDropdownOpen] = useState(false)

  const activeMentor = DOCTOR_CHARACTERS.find(d => d.id === state.activeMentorId) || DOCTOR_CHARACTERS[0]
  const currentModule = MEDLINGO_MODULES.find(m => m.id === currentModuleId) || MEDLINGO_MODULES[0]

  // Calculate module completion %
  const totalNodesInModule = currentModule.units.flatMap(u => u.nodes.filter(n => n.type !== 'chest')).length
  const completedInModule = currentModule.units.flatMap(u => u.nodes)
    .filter(n => state.completedNodes?.[n.id]?.stars > 0).length
  const moduleProgressPercent = Math.min(100, Math.round((completedInModule / (totalNodesInModule || 1)) * 100))

  useEffect(() => {
    const updateCountdown = () => {
      const secs = getNextHeartCountdownSeconds(state)
      setCountdownSecs(secs)
    }
    updateCountdown()
    const timer = setInterval(updateCountdown, 1000)
    return () => clearInterval(timer)
  }, [state])

  const formatCountdown = (secs) => {
    if (secs <= 0) return 'Lleno'
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${String(s).padStart(2, '0')}`
  }

  return (
    <header className="medlingo-header">
      {/* ── Left: Back Arrow to Main App + Module Selector ── */}
      <div className="medlingo-header__left">
        <Link 
          to="/dashboard" 
          className="medlingo-exit-to-app-btn"
          title="Salir de MedLingo y volver a la plataforma EUNACOM"
          onClick={playTapSound}
        >
          <ArrowLeft size={18} strokeWidth={2.8} />
        </Link>

        <div 
          className="medlingo-header__module-btn"
          onClick={() => {
            playTapSound()
            setModuleDropdownOpen(!moduleDropdownOpen)
          }}
        >
          <span className="medlingo-header__module-emoji">{currentModule.emoji}</span>
          <div className="medlingo-header__module-info">
            <span className="medlingo-header__module-name">{currentModule.name}</span>
            <div className="medlingo-header__module-bar-wrap">
              <div 
                className="medlingo-header__module-bar"
                style={{ width: `${moduleProgressPercent}%`, backgroundColor: currentModule.themeColor }}
              />
            </div>
          </div>
          <ChevronDown size={15} className={`medlingo-header__chevron ${moduleDropdownOpen ? 'rotate' : ''}`} />
        </div>

        {/* Dropdown for selecting module */}
        {moduleDropdownOpen && (
          <div className="medlingo-header__dropdown">
            <div className="medlingo-header__dropdown-title">Elige Especialidad EUNACOM</div>
            <div className="medlingo-header__dropdown-list">
              {MEDLINGO_MODULES.map(m => {
                const isSelected = m.id === currentModuleId
                const totalNodes = m.units.flatMap(u => u.nodes.filter(n => n.type !== 'chest')).length
                const completed = m.units.flatMap(u => u.nodes).filter(n => state.completedNodes?.[n.id]?.stars > 0).length
                const pct = Math.round((completed / (totalNodes || 1)) * 100)

                return (
                  <div
                    key={m.id}
                    className={`medlingo-header__dropdown-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      playTapSound()
                      onSelectModule(m.id)
                      setModuleDropdownOpen(false)
                    }}
                  >
                    <span className="medlingo-header__dropdown-emoji">{m.emoji}</span>
                    <div className="medlingo-header__dropdown-meta">
                      <span className="medlingo-header__dropdown-name">{m.name}</span>
                      <span className="medlingo-header__dropdown-sub">{pct}% completado ({completed}/{totalNodes})</span>
                    </div>
                    {pct === 100 && <Award size={16} color="#eab308" />}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Right: Stats, Hearts, Streak & Gems ── */}
      <div className="medlingo-header__right">
        {/* Streak 🔥 */}
        <div 
          className="medlingo-stat-pill medlingo-stat-pill--streak"
          title={`Racha actual: ${state.currentStreak || 1} días ininterrumpidos`}
        >
          <Flame size={17} className="flame-icon animated" />
          <span className="medlingo-stat-val">{state.currentStreak || 1}</span>
        </div>

        {/* Gems 💎 */}
        <div 
          className="medlingo-stat-pill medlingo-stat-pill--gems"
          onClick={() => {
            playTapSound()
            onOpenShop()
          }}
          title="Gemas de guardia. Toca para abrir la tienda."
        >
          <Sparkles size={15} className="sparkle-icon" />
          <span className="medlingo-stat-val">{state.gems || 0}</span>
        </div>

        {/* Hearts 💖 */}
        <div 
          className={`medlingo-stat-pill medlingo-stat-pill--hearts ${state.hearts <= 1 ? 'critical' : ''}`}
          onClick={() => {
            playTapSound()
            onOpenShop()
          }}
          title={`Vidas: ${state.hearts}/${MAX_HEARTS}. ${state.hearts < MAX_HEARTS ? `Próxima recarga en ${formatCountdown(countdownSecs)}` : 'Vidas al máximo'}`}
        >
          <Heart size={16} className="heart-icon filled" />
          <span className="medlingo-stat-val">{state.hearts}</span>
        </div>

        {/* Active Doctor Mentor (Desktop only) */}
        <div 
          className="medlingo-mentor-badge desktop-only-item"
          onClick={() => {
            playTapSound()
            onOpenMentorPicker()
          }}
          title={`Mentor actual: ${activeMentor.name}. Toca para cambiar de mentor.`}
        >
          <div className="medlingo-mentor-avatar" style={{ background: activeMentor.avatarBg }}>
            <img src={activeMentor.image} alt={activeMentor.name} onError={(e) => { e.target.style.display = 'none' }} />
          </div>
        </div>

        {/* Shop Button (Desktop only) */}
        <button 
          className="medlingo-shop-btn desktop-only-item"
          onClick={() => {
            playTapSound()
            onOpenShop()
          }}
          title="Tienda de Guardia"
        >
          <ShoppingBag size={18} />
        </button>
      </div>
    </header>
  )
}
