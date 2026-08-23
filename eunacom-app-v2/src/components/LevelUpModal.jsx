import React, { useEffect } from 'react'
import { Sparkles, Trophy, Star, ArrowRight, Zap, Award, X, Check } from 'lucide-react'
import { getDoctorForLevel } from '../utils/xpSystem'
import { playVictoryFanfare, playTapSound } from '../utils/medlingoAudio'
import '../styles/levelUpModal.css'

export default function LevelUpModal({
  isOpen,
  onClose,
  oldLevel = 1,
  newLevel = 2,
  earnedGems = 100,
  onEquipDoctor = null
}) {
  if (!isOpen) return null

  const doctor = getDoctorForLevel(newLevel)

  useEffect(() => {
    playVictoryFanfare()
  }, [])

  return (
    <div className="levelup-modal-overlay">
      <div className="levelup-modal-card animate-levelup-pop">
        
        {/* Ambient Glows & Confetti */}
        <div className="levelup-ambient-glow" style={{ background: doctor.avatarBg }} />
        <div className="levelup-confetti-container">
          <span className="confetti-item c1">✨</span>
          <span className="confetti-item c2">🎉</span>
          <span className="confetti-item c3">⭐</span>
          <span className="confetti-item c4">🌟</span>
          <span className="confetti-item c5">💎</span>
          <span className="confetti-item c6">🎊</span>
        </div>

        {/* Close Button */}
        <button className="levelup-close-btn" onClick={onClose} title="Cerrar">
          <X size={20} />
        </button>

        {/* Level Up Pill Badge */}
        <div className="levelup-top-badge">
          <Sparkles size={14} />
          <span>¡SUBISTE DE NIVEL!</span>
        </div>

        {/* Level Progression Indicator */}
        <div className="levelup-transition-row">
          <div className="lvl-pill prev">Nivel {oldLevel}</div>
          <div className="lvl-arrow">➔</div>
          <div className="lvl-pill next">Nivel {newLevel}</div>
        </div>

        {/* Unlocked Doctor Persona Card */}
        <div className="levelup-doctor-card">
          <div className="levelup-avatar-frame" style={{ background: doctor.avatarBg }}>
            <img 
              src={doctor.image} 
              alt={doctor.name} 
              onError={(e) => { e.target.src = '/avatars/dr_house.png' }}
            />
            <div className="levelup-doctor-emoji-badge">
              <span>{doctor.emoji}</span>
            </div>
          </div>

          <div className="levelup-doctor-info">
            <span className="levelup-unlock-tag">🔓 Nuevo Personaje Desbloqueado</span>
            <h3 className="levelup-doctor-name">{doctor.name}</h3>
            <span className="levelup-doctor-title">{doctor.title}</span>
            <p className="levelup-doctor-quote">"{doctor.quote}"</p>
          </div>
        </div>

        {/* Rewards Earned Box */}
        <div className="levelup-rewards-box">
          <span className="rewards-title">Recompensas Obtenidas:</span>
          <div className="rewards-badges-row">
            <div className="reward-chip gems">
              <Sparkles size={16} color="#fbbf24" />
              <span>+{doctor.rewardGems || earnedGems} Gemas</span>
            </div>
            <div className="reward-chip rank">
              <Award size={16} color="#38bdf8" />
              <span>{doctor.badgeText}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="levelup-actions-row">
          {onEquipDoctor && (
            <button 
              className="levelup-equip-btn"
              onClick={() => {
                playTapSound()
                onEquipDoctor(doctor.id)
                onClose()
              }}
            >
              <Check size={18} />
              <span>Equipar como Mentor</span>
            </button>
          )}

          <button 
            className="levelup-continue-btn"
            onClick={() => {
              playTapSound()
              onClose()
            }}
          >
            <span>¡Continuar Preparación!</span>
            <ArrowRight size={18} />
          </button>
        </div>

      </div>
    </div>
  )
}
