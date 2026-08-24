import React, { useState } from 'react'
import { Target, Trophy, Sparkles, Shield, Clock, ArrowUp, ArrowDown, Award, Flame } from 'lucide-react'
import { playChestOpenSound, playTapSound } from '../../utils/medlingoAudio'
import { LEAGUE_TIERS, getLeagueCohort, getWeeklyResetTimeLeft } from '../../utils/leagueSystem'

export default function MedLingoMissions({
  state,
  onClaimReward
}) {
  const [activeTab, setActiveTab] = useState('missions') // 'missions' | 'league'
  const quests = state.dailyQuests || {}
  const claimed = quests.claimed || {}

  const q1Progress = Math.min(2, quests.lessonsCompleted || 0)
  const q1Done = q1Progress >= 2
  const q1Claimed = !!claimed.q1

  const q2Progress = Math.min(1, quests.perfectLessons || 0)
  const q2Done = q2Progress >= 1
  const q2Claimed = !!claimed.q2

  const q3Progress = Math.min(50, quests.xpGainedToday || 0)
  const q3Done = q3Progress >= 50
  const q3Claimed = !!claimed.q3

  const currentTier = LEAGUE_TIERS[1] // Residente
  const cohort = getLeagueCohort(quests.xpGainedToday || 35, 1, currentTier.id)
  const timeLeft = getWeeklyResetTimeLeft()

  return (
    <aside className="medlingo-sidebar-panel">
      
      {/* ── Tabs: Misiones vs Liga ── */}
      <div className="medlingo-panel-tab-bar">
        <button 
          className={`panel-tab-btn ${activeTab === 'missions' ? 'active' : ''}`}
          onClick={() => {
            playTapSound()
            setActiveTab('missions')
          }}
        >
          <Target size={16} /> Misiones Diarias
        </button>
        <button 
          className={`panel-tab-btn ${activeTab === 'league' ? 'active' : ''}`}
          onClick={() => {
            playTapSound()
            setActiveTab('league')
          }}
        >
          <Trophy size={16} /> Liga EUNACOM
        </button>
      </div>

      {activeTab === 'missions' ? (
        /* ── Daily Quests Card ── */
        <div className="medlingo-panel-card animate-slide-up">
          <div className="medlingo-panel-card__header">
            <Target size={20} color="#38bdf8" />
            <h3>Misiones Diarias de Guardia</h3>
          </div>

          <div className="medlingo-quests-list">
            {/* Mission 1 */}
            <div className="medlingo-quest-item">
              <div className="quest-meta">
                <span className="quest-text">Completa 2 micro-lecciones</span>
                <span className="quest-reward">+20 💎</span>
              </div>
              <div className="quest-bar-wrap">
                <div className="quest-bar" style={{ width: `${(q1Progress / 2) * 100}%` }} />
              </div>
              <div className="quest-status">
                <span className="quest-count">{q1Progress}/2</span>
                {q1Done ? (
                  q1Claimed ? (
                    <span className="quest-badge claimed">Reclamado ✓</span>
                  ) : (
                    <button 
                      className="quest-claim-btn"
                      onClick={() => {
                        playChestOpenSound()
                        onClaimReward('q1', 20)
                      }}
                    >
                      Reclamar
                    </button>
                  )
                ) : null}
              </div>
            </div>

            {/* Mission 2 */}
            <div className="medlingo-quest-item">
              <div className="quest-meta">
                <span className="quest-text">Consigue 1 turno perfecto (3 ⭐)</span>
                <span className="quest-reward">+30 💎</span>
              </div>
              <div className="quest-bar-wrap">
                <div className="quest-bar" style={{ width: `${(q2Progress / 1) * 100}%` }} />
              </div>
              <div className="quest-status">
                <span className="quest-count">{q2Progress}/1</span>
                {q2Done ? (
                  q2Claimed ? (
                    <span className="quest-badge claimed">Reclamado ✓</span>
                  ) : (
                    <button 
                      className="quest-claim-btn"
                      onClick={() => {
                        playChestOpenSound()
                        onClaimReward('q2', 30)
                      }}
                    >
                      Reclamar
                    </button>
                  )
                ) : null}
              </div>
            </div>

            {/* Mission 3 */}
            <div className="medlingo-quest-item">
              <div className="quest-meta">
                <span className="quest-text">Gana 50 XP en el día</span>
                <span className="quest-reward">+50 💎</span>
              </div>
              <div className="quest-bar-wrap">
                <div className="quest-bar" style={{ width: `${(q3Progress / 50) * 100}%` }} />
              </div>
              <div className="quest-status">
                <span className="quest-count">{q3Progress}/50 XP</span>
                {q3Done ? (
                  q3Claimed ? (
                    <span className="quest-badge claimed">Reclamado ✓</span>
                  ) : (
                    <button 
                      className="quest-claim-btn"
                      onClick={() => {
                        playChestOpenSound()
                        onClaimReward('q3', 50)
                      }}
                    >
                      Reclamar
                    </button>
                  )
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── Real-time Weekly League Leaderboard ── */
        <div className="medlingo-panel-card animate-slide-up">
          <div className="medlingo-panel-card__header league">
            <div className="league-title-box">
              <span className="league-icon-emoji">{currentTier.icon}</span>
              <div>
                <h3>{currentTier.name}</h3>
                <span className="league-time-tag">
                  <Clock size={12} /> Cierra en {timeLeft}
                </span>
              </div>
            </div>
          </div>

          <div className="league-table-list">
            {cohort.map((player) => {
              const isPromotion = player.zone === 'promotion'
              const isDemotion = player.zone === 'demotion'

              return (
                <div 
                  key={player.rank}
                  className={`league-row ${player.isUser ? 'user-highlight' : ''} ${player.zone}`}
                >
                  <span className="league-rank-num">
                    {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : player.rank === 3 ? '🥉' : `#${player.rank}`}
                  </span>
                  <span className="league-player-avatar">{player.avatar}</span>
                  <span className="league-player-name">{player.name}</span>
                  <span className="league-player-xp">{player.xp} XP</span>

                  {isPromotion && (
                    <ArrowUp size={14} className="zone-arrow promo" title="Zona de ascenso" />
                  )}
                  {isDemotion && (
                    <ArrowDown size={14} className="zone-arrow demo" title="Zona de descenso" />
                  )}
                </div>
              )
            })}
          </div>

          <div className="league-footer-notice">
            <ArrowUp size={12} color="#10b981" />
            <span>Los 3 primeros ascienden a la <strong>Liga Becado (Oro)</strong> el domingo.</span>
          </div>
        </div>
      )}

    </aside>
  )
}
