import React from 'react'
import { X, Check, Stethoscope, Sparkles } from 'lucide-react'
import { DOCTOR_CHARACTERS } from '../../utils/doctorAvatars'
import { playTapSound } from '../../utils/medlingoAudio'

export default function MedLingoMentorPickerModal({
  activeMentorId,
  onSelectMentor,
  onClose
}) {
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
              <p>Te acompañará en cada lección clínica</p>
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

        {/* Snappy List of Mentors */}
        <div className="mentor-picker-list">
          {DOCTOR_CHARACTERS.map((doc) => {
            const isSelected = doc.id === activeMentorId
            return (
              <button
                key={doc.id}
                type="button"
                className={`mentor-picker-item ${isSelected ? 'active' : ''}`}
                onClick={() => {
                  playTapSound()
                  onSelectMentor(doc.id)
                  onClose()
                }}
              >
                {/* Avatar Frame */}
                <div className="mentor-picker-avatar-wrap">
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
                  <span className="mentor-picker-name">{doc.name}</span>
                  <div className="mentor-picker-meta">
                    <span className="mentor-picker-show">{doc.show}</span>
                    <span className="mentor-picker-dot">·</span>
                    <span className="mentor-picker-spec">{doc.shortSpec || doc.specialty}</span>
                  </div>
                </div>

                {/* Selection Indicator */}
                <div className={`mentor-picker-indicator ${isSelected ? 'selected' : ''}`}>
                  {isSelected ? <Check size={16} strokeWidth={3} /> : null}
                </div>
              </button>
            )
          })}
        </div>

      </div>
    </div>
  )
}
