import React from 'react'
import { Target, Sparkles, CheckCircle2, Shield, Zap } from 'lucide-react'
import { playChestOpenSound } from '../../../utils/medlingoAudio'

const DAILY_QUESTS_DATA = [
  { id: 'q1', title: 'Completa 2 turnos de guardia', key: 'lessonsCompleted', target: 2, rewardGems: 20 },
  { id: 'q2', title: 'Logra 1 diagnóstico perfecto (3★)', key: 'perfectLessons', target: 1, rewardGems: 30 },
  { id: 'q3', title: 'Gana 50 puntos de EXP hoy', key: 'xpGainedToday', target: 50, rewardGems: 50 }
]

export default function MedLingoMissionsTab({ state, onUpdateState, onOpenShop }) {
  const questsState = state.dailyQuests || {}
  const claimedMap = questsState.claimed || {}

  const handleClaim = (questId, rewardGems) => {
    playChestOpenSound()
    onUpdateState(prev => {
      const q = { ...(prev.dailyQuests || {}) }
      const c = { ...(q.claimed || {}) }
      c[questId] = true
      q.claimed = c

      return {
        ...prev,
        gems: (prev.gems || 0) + rewardGems,
        dailyQuests: q
      }
    })
  }

  const completedCount = DAILY_QUESTS_DATA.filter(q => claimedMap[q.id]).length
  const totalCount = DAILY_QUESTS_DATA.length

  return (
    <div className="medlingo-tab-content missions animate-scale-up">
      
      {/* ── Top Hero ── */}
      <div className="missions-hero-banner">
        <div className="missions-hero-left">
          <div className="missions-badge">
            <Target size={16} />
            <span>Misiones de Turno</span>
          </div>
          <h2>Misiones del Día</h2>
          <p>Completa tus objetivos diarios de guardia para ganar gemas de recarga y subir en la liga.</p>
        </div>

        <div className="missions-progress-circle-wrap">
          <div className="missions-counter">
            <span className="count-num">{completedCount}/{totalCount}</span>
            <span className="count-label">Listas</span>
          </div>
        </div>
      </div>

      {/* ── Daily Quests List ── */}
      <div className="missions-card-container">
        <h3 className="section-title">Desafíos de Hoy</h3>
        <div className="missions-list">
          {DAILY_QUESTS_DATA.map((quest) => {
            const currentProgress = questsState[quest.key] || 0
            const percent = Math.min(100, Math.round((currentProgress / quest.target) * 100))
            const isClaimed = !!claimedMap[quest.id]
            const isReadyToClaim = currentProgress >= quest.target && !isClaimed

            return (
              <div key={quest.id} className={`mission-item-card ${isClaimed ? 'claimed' : ''}`}>
                <div className="mission-icon-box">
                  {isClaimed ? (
                    <CheckCircle2 size={28} color="#10b981" />
                  ) : (
                    <Target size={28} color="#f97316" />
                  )}
                </div>

                <div className="mission-details">
                  <div className="mission-title-row">
                    <h4 className="mission-title">{quest.title}</h4>
                    <div className="mission-reward-tag">
                      <Sparkles size={14} color="#eab308" />
                      <span>+{quest.rewardGems} Gemas</span>
                    </div>
                  </div>

                  <div className="mission-bar-track">
                    <div 
                      className="mission-bar-fill"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="mission-status-row">
                    <span className="mission-count-text">{currentProgress} / {quest.target}</span>
                    {isClaimed ? (
                      <span className="claimed-badge">¡Completada! ✨</span>
                    ) : isReadyToClaim ? (
                      <button 
                        className="claim-reward-btn animate-bounce"
                        onClick={() => handleClaim(quest.id, quest.rewardGems)}
                      >
                        ¡RECLAMAR +{quest.rewardGems} 💎!
                      </button>
                    ) : (
                      <span className="in-progress-text">En progreso</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Inventory & Streak Buffs ── */}
      <div className="missions-buffs-card">
        <h3 className="section-title">Tu Equipamiento de Guardia</h3>
        <div className="buffs-grid">
          
          <div className="buff-item" onClick={onOpenShop}>
            <div className="buff-icon-box freeze">
              <Shield size={24} />
            </div>
            <div className="buff-info">
              <strong>Protector de Racha</strong>
              <span>{state.streakFreezeTokens || 1} disponibles</span>
            </div>
            <button className="buff-action-btn">+</button>
          </div>

          <div className="buff-item" onClick={onOpenShop}>
            <div className="buff-icon-box potion">
              <Zap size={24} />
            </div>
            <div className="buff-info">
              <strong>Poción Doble XP</strong>
              <span>
                {state.inventory?.doubleXpActiveUntil && new Date(state.inventory.doubleXpActiveUntil) > new Date()
                  ? 'Activa 🔥'
                  : 'Tienda'}
              </span>
            </div>
            <button className="buff-action-btn">+</button>
          </div>

        </div>
      </div>

    </div>
  )
}
