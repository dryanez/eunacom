import React from 'react'
import { X, Check, Stethoscope } from 'lucide-react'
import { DOCTOR_CHARACTERS } from '../../utils/doctorAvatars'
import { playTapSound } from '../../utils/medlingoAudio'

export default function MedLingoMentorPickerModal({
  activeMentorId,
  onSelectMentor,
  onClose
}) {
  return (
    <div className="medlingo-modal-overlay">
      <div className="medlingo-modal-container mentor-picker animate-scale-up">
        
        {/* Header */}
        <div className="medlingo-shop-header">
          <div className="shop-title-wrap">
            <Stethoscope size={22} className="shop-gold-sparkle" />
            <h2>Elige a tu Mentor Clínico</h2>
          </div>
          <button 
            className="medlingo-close-btn"
            onClick={() => {
              playTapSound()
              onClose()
            }}
            title="Cerrar"
          >
            <X size={22} />
          </button>
        </div>

        <p className="mentor-picker-sub">
          Tu mentor te acompañará en cada lección con consejos de guardia, nemotecnias y pistas clínicas.
        </p>

        {/* Grid of Mentors */}
        <div className="mentors-grid">
          {DOCTOR_CHARACTERS.map((doc) => {
            const isSelected = doc.id === activeMentorId
            return (
              <div
                key={doc.id}
                className={`mentor-card ${isSelected ? 'selected' : ''}`}
                onClick={() => {
                  playTapSound()
                  onSelectMentor(doc.id)
                  onClose()
                }}
              >
                <div className="mentor-avatar-frame">
                  {doc.image ? (
                    <img 
                      src={doc.image} 
                      alt={doc.name} 
                      className="mentor-avatar-img"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'flex'
                      }}
                    />
                  ) : null}
                  <div 
                    className="mentor-avatar-fallback" 
                    style={{ 
                      display: doc.image ? 'none' : 'flex',
                      background: doc.avatarBg 
                    }}
                  >
                    <span>{doc.emoji}</span>
                  </div>
                  {isSelected && (
                    <div className="selected-check-badge">
                      <Check size={14} strokeWidth={3} />
                    </div>
                  )}
                </div>

                <div className="mentor-card-body">
                  <div className="mentor-name-title">{doc.name}</div>
                  <div className="mentor-spec-badge">{doc.specialty}</div>
                  <div className="mentor-quote-text">"{doc.quote}"</div>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}
