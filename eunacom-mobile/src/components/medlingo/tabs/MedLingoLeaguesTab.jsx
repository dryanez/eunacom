import React, { useState } from 'react'
import { Trophy, Clock, Sparkles, ArrowUp, ArrowDown, Crown } from 'lucide-react'
import { LEAGUE_TIERS, getLeagueCohort, getWeeklyResetTimeLeft } from '../../../utils/leagueSystem'
import { playTapSound } from '../../../utils/medlingoAudio'
import { UserInstitutionBadge } from '../../../utils/universityAndCountry'

export default function MedLingoLeaguesTab({ state, onOpenShop }) {
  const [selectedLeagueIndex, setSelectedLeagueIndex] = useState(0)

  const currentTier = LEAGUE_TIERS[0]
  const displayedTier = LEAGUE_TIERS[selectedLeagueIndex] || currentTier

  // Get weekly cohort rankings
  const cohort = getLeagueCohort(state?.xp || 120, 1, displayedTier.id, state?.profile || null)
  const resetTimeLeft = getWeeklyResetTimeLeft()

  return (
    <div className="medlingo-tab-content leagues animate-scale-up">
      
      {/* ── Top League Hero ── */}
      <div 
        className="league-hero-header"
        style={{ 
          background: displayedTier.badgeBg,
          borderColor: displayedTier.color 
        }}
      >
        <div className="league-hero-top">
          <div className="league-tier-icon-big">
            <span>{displayedTier.icon}</span>
          </div>
          <div className="league-hero-info">
            <div className="league-tag-pill" style={{ color: displayedTier.color }}>
              DIVISIÓN SEMANAL
            </div>
            <h2>{displayedTier.name}</h2>
            <p>{displayedTier.description}</p>
          </div>
        </div>

        {/* Weekly Countdown Bar */}
        <div className="league-timer-bar">
          <div className="timer-left">
            <Clock size={16} color="#38bdf8" />
            <span>Finaliza en: <strong>{resetTimeLeft}</strong></span>
          </div>
          <div className="prizes-badge">
            <Sparkles size={14} color="#eab308" />
            <span>Premios: Top 3 ganan hasta 💎 300</span>
          </div>
        </div>
      </div>

      {/* ── League Tiers Carousel / Selector ── */}
      <div className="league-tiers-selector-row">
        {LEAGUE_TIERS.map((tier, idx) => {
          const isSelected = selectedLeagueIndex === idx

          return (
            <button
              key={tier.id}
              className={`tier-pill-btn ${isSelected ? 'active' : ''}`}
              style={{ '--tier-accent': tier.color }}
              onClick={() => {
                playTapSound()
                setSelectedLeagueIndex(idx)
              }}
            >
              <span className="tier-emoji">{tier.icon}</span>
              <span className="tier-name">{tier.name.split('(')[0]}</span>
              {idx === 0 && <span className="current-dot">TU LIGA</span>}
            </button>
          )
        })}
      </div>

      {/* ── Cohort Standings Table ── */}
      <div className="league-standings-card">
        <div className="standings-header-row">
          <span className="col-rank">#</span>
          <span className="col-doctor">Médico / Casa de Estudios</span>
          <span className="col-xp">EXP Semanal</span>
        </div>

        <div className="standings-list">
          {cohort.map((player, idx) => {
            const isUser = player.isUser
            const isPromotion = idx < 3
            const isDemotion = idx >= cohort.length - 2 && displayedTier.id !== 'interno'

            let rowClass = 'standings-row'
            if (isUser) rowClass += ' user-row'
            if (isPromotion) rowClass += ' promo-zone'
            if (isDemotion) rowClass += ' demo-zone'

            return (
              <div key={player.name || idx} className={rowClass}>
                <div className="rank-badge-cell">
                  {idx === 0 && <Crown size={18} color="#eab308" className="crown-icon" />}
                  {idx === 1 && <span className="medal-emoji">🥈</span>}
                  {idx === 2 && <span className="medal-emoji">🥉</span>}
                  {idx > 2 && <span className="rank-num">{idx + 1}</span>}
                </div>

                <div className="doctor-info-cell" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{ position: 'relative', display: 'inline-flex' }}>
                    <img
                      src={player.avatarImage || '/avatars/dr_house.png'}
                      alt={player.name}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: isUser ? '2px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.15)',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                        background: 'rgba(30, 41, 59, 0.8)',
                        display: 'block'
                      }}
                    />
                    <div style={{ position: 'absolute', bottom: -3, right: -5 }}>
                      <UserInstitutionBadge
                        user={{ university: player.university, sede: player.sede, country: player.country }}
                        size={16}
                      />
                    </div>
                  </div>
                  <div className="doctor-meta">
                    <span className="doctor-name" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      {player.name}
                    </span>
                    <span className="doctor-streak" style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                      {player.university?.split('(')[0] || player.country} · {player.sede || player.country}
                    </span>
                  </div>
                </div>

                <div className="xp-cell">
                  <span className="xp-value">{player.xp} XP</span>
                  {isPromotion && <span className="zone-indicator up">⬆ Ascenso</span>}
                  {isDemotion && <span className="zone-indicator down">⬇ Descenso</span>}
                </div>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="standings-legend">
          <div className="legend-item promo">
            <ArrowUp size={14} /> Los 3 primeros ascienden el domingo
          </div>
          {displayedTier.id !== 'interno' && (
            <div className="legend-item demo">
              <ArrowDown size={14} /> Los 2 últimos descienden de división
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
