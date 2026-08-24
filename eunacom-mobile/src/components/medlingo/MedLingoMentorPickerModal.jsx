import React, { useState } from 'react'
import { X, Check, Stethoscope, Sparkles, Lock } from 'lucide-react'
import { DOCTOR_CHARACTERS } from '../../utils/doctorAvatars'
import { playTapSound } from '../../utils/medlingoAudio'

export default function MedLingoMentorPickerModal({
  activeMentorId,
  userLevel = 1,
  onSelectMentor,
  onClose
}) {
  const [lockedAlert, setLockedAlert] = useState(null)

  return (
    <div className="medlingo-modal-overlay" onClick={onClose}>
      <div 
        className="medlingo-modal-container mentor-picker animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="mentor-picker-header">
          <div className="mentor-picker-title-group">
            <div className="mentor-picker-icon-badge">
              <Stethoscope size={20} color="#38bdf8" />
            </div>
            <div>
              <h2>Elige a tu Mentor</h2>
              <p>Desbloqueados hasta tu Nivel {userLevel}</p>
            </div>
          </div>
          <button 
            className="mentor-picker-close-btn"
            onClick={() => {
              playTapSound()
              onClose()
            }}
            title="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        {lockedAlert && (
          <div style={{
            margin: '0.5rem 1rem 0',
            padding: '0.5rem 0.75rem',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            color: '#fca5a5',
            fontSize: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}>
            <Lock size={13} />
            <span>{lockedAlert}</span>
          </div>
        )}

        {/* Snappy List of Mentors */}
        <div className="mentor-picker-list">
          {DOCTOR_CHARACTERS.map((doc) => {
            const isSelected = doc.id === activeMentorId
            const isUnlocked = (doc.level || 1) <= userLevel
            return (
              <button
                key={doc.id}
                type="button"
                className={`mentor-picker-item ${isSelected ? 'active' : ''} ${!isUnlocked ? 'locked' : ''}`}
                style={{
                  opacity: isUnlocked ? 1 : 0.45,
                  cursor: isUnlocked ? 'pointer' : 'not-allowed',
                  filter: isUnlocked ? 'none' : 'grayscale(0.6)'
                }}
                onClick={() => {
                  if (isUnlocked) {
                    playTapSound()
                    onSelectMentor(doc.id)
                    onClose()
                  } else {
                    setLockedAlert(`🔒 ${doc.name} se desbloquea en Nivel ${doc.level}. Eres Nivel ${userLevel}.`)
                  }
                }}
              >
                {/* Avatar Frame */}
                <div className="mentor-picker-avatar-wrap" style={{ position: 'relative' }}>
                  {doc.image ? (
                    <img 
                      src={doc.image} 
                      alt={doc.name} 
                      className="mentor-picker-avatar-img"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'
                      }}
                    />
                  ) : null}
                  {!isUnlocked && (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(0,0,0,0.5)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fbbf24'
                    }}>
                      <Lock size={14} />
                    </div>
                  )}
                  <div 
                    className="mentor-picker-avatar-fallback" 
                    style={{ 
                      display: doc.image ? 'none' : 'flex',
                      background: doc.avatarBg 
                    }}
                  >
                    <span>{doc.emoji}</span>
                  </div>
                </div>

                {/* Doctor Info */}
                <div className="mentor-picker-info">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span className="mentor-picker-name">{doc.name}</span>
                    <span style={{ fontSize: '0.68rem', color: isUnlocked ? '#38bdf8' : '#eab308', fontWeight: 600 }}>
                      Nv.{doc.level}
                    </span>
                  </div>
                  <div className="mentor-picker-meta">
                    <span className="mentor-picker-show">{doc.show}</span>
                    <span className="mentor-picker-dot">·</span>
                    <span className="mentor-picker-spec">{doc.shortSpec || doc.specialty}</span>
                  </div>
                </div>

                {/* Selection Indicator */}
                <div className={`mentor-picker-indicator ${isSelected ? 'selected' : ''}`}>
                  {isSelected ? <Check size={16} strokeWidth={3} /> : !isUnlocked ? <Lock size={14} color="#eab308" /> : null}
                </div>
              </button>
            )
          })}
        </div>

      </div>
    </div>
  )
}
