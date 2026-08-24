import React, { useState } from 'react'
import { Lightbulb, MessageCircle, Sparkles, X } from 'lucide-react'
import { DOCTOR_CHARACTERS } from '../../utils/doctorAvatars'
import { playTapSound, playChestOpenSound } from '../../utils/medlingoAudio'

export default function MedLingoMentorWidget({
  mentorId = 'dr_house',
  hintText = null,
  mentorQuote = null,
  combo = 0,
  isCorrect = null,
  onOpenPicker
}) {
  const [bubbleOpen, setBubbleOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('hint') // 'hint' | 'pearl'

  const mentor = DOCTOR_CHARACTERS.find(d => d.id === mentorId) || DOCTOR_CHARACTERS[1]

  // Determine speech text
  const getSpeechText = () => {
    if (combo >= 3) {
      return `🔥 ¡${combo} aciertos seguidos! ¡Diagnóstico clínico impecable, doctor(a)!`
    }
    if (isCorrect === false) {
      return `¡Cuidado con ese error! Recuerda la guía MINSAL. Toca "Pista" si necesitas ayuda.`
    }
    if (activeTab === 'hint' && hintText) {
      return hintText
    }
    return mentorQuote || mentor.quote
  }

  const handleToggleBubble = (tab = 'hint') => {
    playTapSound()
    setActiveTab(tab)
    setBubbleOpen(prev => (tab === activeTab ? !prev : true))
  }

  return (
    <div className="medlingo-corner-mentor">
      {/* ── Speech Bubble (Pop-out) ── */}
      {bubbleOpen && (
        <div className="medlingo-corner-bubble animate-scale-up">
          <div className="bubble-header">
            <div className="bubble-mentor-tag">
              <span className="mentor-name-text">{mentor.name}</span>
              <span className="mentor-spec-text">{mentor.specialty}</span>
            </div>
            <button 
              className="bubble-close-btn"
              onClick={() => {
                playTapSound()
                setBubbleOpen(false)
              }}
            >
              <X size={14} />
            </button>
          </div>

          <div className="bubble-body">
            {activeTab === 'hint' ? (
              <div className="bubble-hint-content">
                <div className="hint-pill">
                  <Lightbulb size={14} /> Pista de Guardia
                </div>
                <p className="hint-message">{hintText || 'Analiza con cuidado las opciones y descarta las contraindicaciones.'}</p>
              </div>
            ) : (
              <div className="bubble-pearl-content">
                <div className="pearl-pill">
                  <Sparkles size={14} /> Perla Clínica
                </div>
                <p className="pearl-message">{mentorQuote || mentor.quote}</p>
              </div>
            )}
          </div>

          <div className="bubble-footer">
            <button 
              className={`bubble-tab-btn ${activeTab === 'hint' ? 'active' : ''}`}
              onClick={() => handleToggleBubble('hint')}
            >
              <Lightbulb size={13} /> Pista
            </button>
            <button 
              className={`bubble-tab-btn ${activeTab === 'pearl' ? 'active' : ''}`}
              onClick={() => handleToggleBubble('pearl')}
            >
              <Sparkles size={13} /> Consejo
            </button>
          </div>
        </div>
      )}

      {/* ── Mascot Avatar & Action Buttons ── */}
      <div className="medlingo-mascot-actions">
        {hintText && (
          <button 
            className="medlingo-hint-btn animate-bounce"
            onClick={() => handleToggleBubble('hint')}
            title="Pedir pista al mentor"
          >
            <Lightbulb size={18} />
            <span className="hint-label">Pista</span>
          </button>
        )}

        <div 
          className="medlingo-mascot-avatar-btn"
          style={{ background: mentor.avatarBg }}
          onClick={() => handleToggleBubble(activeTab)}
          title={`Mentor: ${mentor.name}`}
        >
          <span className="mascot-emoji">{mentor.emoji}</span>
          {combo >= 2 && (
            <div className="combo-flame-badge">
              🔥{combo}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
