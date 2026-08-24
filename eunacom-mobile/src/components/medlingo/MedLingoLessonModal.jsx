import React, { useState, useEffect } from 'react'
import { 
  X, Heart, Sparkles, Flame, CheckCircle2, AlertCircle, 
  ArrowRight, Trophy, Star, Stethoscope, Zap, Shield, Check, PartyPopper, Lightbulb
} from 'lucide-react'
import { DOCTOR_CHARACTERS } from '../../utils/doctorAvatars'
import { 
  playCorrectSound, 
  playIncorrectSound, 
  playComboSound, 
  playLevelCompleteSound, 
  playTapSound,
  playChestOpenSound
} from '../../utils/medlingoAudio'
import MedLingoMentorWidget from './MedLingoMentorWidget'

export default function MedLingoLessonModal({
  node,
  unit,
  moduleData,
  questions = [],
  state,
  onClose,
  onDeductHeart,
  onFinishLesson,
  onOpenShop
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [combo, setCombo] = useState(0)
  const [mistakesCount, setMistakesCount] = useState(0)
  const [showVictory, setShowVictory] = useState(false)
  const [outOfHearts, setOutOfHearts] = useState(false)
  const [showHint, setShowHint] = useState(false)

  // Current question interaction state
  const [selectedChoice, setSelectedChoice] = useState(null)
  const [userPairs, setUserPairs] = useState([]) // matched pair indices
  const [selectedLeft, setSelectedLeft] = useState(null)
  const [shuffledRightItems, setShuffledRightItems] = useState([])
  const [orderedStepIds, setOrderedStepIds] = useState([])
  const [filledBlanks, setFilledBlanks] = useState([])
  const [selectedWordBank, setSelectedWordBank] = useState([])

  // Answer status: 'idle' | 'checking' | 'correct' | 'incorrect'
  const [answerStatus, setAnswerStatus] = useState('idle')

  const currentQuestion = questions[currentIndex] || questions[0]
  const totalQuestions = questions.length || 1
  const isConceptCard = currentQuestion?.type === 'concept_card'
  
  // Doctor Mentor for this question
  const activeMentor = DOCTOR_CHARACTERS.find(d => d.id === (currentQuestion?.mentorId || state.activeMentorId)) || DOCTOR_CHARACTERS[1]
  const mentorImage = activeMentor.image || (activeMentor.id === 'dr_yang' ? '/assets/medlingo/dra_yang.jpg' : activeMentor.id === 'dr_house' ? '/assets/medlingo/dr_house.jpg' : '/assets/medlingo/dr_murphy.jpg')

  const progressPercent = Math.min(100, Math.round(((currentIndex) / totalQuestions) * 100))

  // Calculated stars
  const earnedStars = mistakesCount === 0 ? 3 : mistakesCount <= 2 ? 2 : 1

  // Initialize interactive question state when moving to next question
  useEffect(() => {
    if (!currentQuestion) return
    setSelectedChoice(null)
    setUserPairs([])
    setSelectedLeft(null)
    setAnswerStatus('idle')
    setShowHint(false)

    if (currentQuestion.type === 'concept_card') {
      playChestOpenSound()
    }

    if (currentQuestion.type === 'match_pairs' && currentQuestion.pairs) {
      const rights = currentQuestion.pairs.map((p, idx) => ({ id: idx, text: p.right }))
      setShuffledRightItems([...rights].sort(() => Math.random() - 0.5))
    }

    if (currentQuestion.type === 'order_sequence' && currentQuestion.steps) {
      const shuffled = [...currentQuestion.steps].sort(() => Math.random() - 0.5)
      setOrderedStepIds(shuffled)
    }

    if (currentQuestion.type === 'fill_blanks') {
      setFilledBlanks([])
      setSelectedWordBank([])
    }
  }, [currentIndex, currentQuestion])

  // Check if answer is ready for evaluation
  const canCheck = () => {
    if (isConceptCard) return true
    if (answerStatus !== 'idle') return true
    if (!currentQuestion) return false
    if (currentQuestion.type === 'flash_mcq' || currentQuestion.type === 'speed_true_false') {
      return selectedChoice !== null
    }
    if (currentQuestion.type === 'match_pairs') {
      return userPairs.length === currentQuestion.pairs?.length
    }
    if (currentQuestion.type === 'order_sequence') {
      return orderedStepIds.length === currentQuestion.steps?.length
    }
    if (currentQuestion.type === 'fill_blanks') {
      return filledBlanks.length === (currentQuestion.blanks?.length || 0)
    }
    return false
  }

  // Handle checking user answer or advancing concept slide
  const handleCheckAnswer = () => {
    if (isConceptCard) {
      playTapSound()
      handleNextQuestion()
      return
    }

    if (answerStatus === 'correct' || answerStatus === 'incorrect') {
      handleNextQuestion()
      return
    }

    let isCorrect = false

    if (currentQuestion.type === 'flash_mcq') {
      const chosen = currentQuestion.choices?.find(c => c.id === selectedChoice)
      isCorrect = !!chosen?.isCorrect
    } else if (currentQuestion.type === 'speed_true_false') {
      isCorrect = selectedChoice === currentQuestion.isCorrect
    } else if (currentQuestion.type === 'match_pairs') {
      isCorrect = userPairs.length === currentQuestion.pairs?.length
    } else if (currentQuestion.type === 'order_sequence') {
      isCorrect = orderedStepIds.every((s, idx) => s.correctOrder === idx + 1)
    } else if (currentQuestion.type === 'fill_blanks') {
      isCorrect = filledBlanks.every((word, idx) => word === currentQuestion.blanks?.[idx])
    }

    if (isCorrect) {
      const nextCombo = combo + 1
      setCombo(nextCombo)
      setAnswerStatus('correct')
      if (nextCombo > 1) {
        playComboSound(nextCombo)
      } else {
        playCorrectSound()
      }
    } else {
      setCombo(0)
      setMistakesCount(prev => prev + 1)
      setAnswerStatus('incorrect')
      playIncorrectSound()
      onDeductHeart()

      if (state.hearts <= 1) {
        setTimeout(() => {
          setOutOfHearts(true)
        }, 1200)
      }
    }
  }

  // Next question or finish
  const handleNextQuestion = () => {
    if (currentIndex + 1 < totalQuestions) {
      setCurrentIndex(prev => prev + 1)
    } else {
      // Level Completed!
      playLevelCompleteSound()
      setShowVictory(true)
      const stars = mistakesCount === 0 ? 3 : mistakesCount <= 2 ? 2 : 1
      const scorePercent = Math.max(0, Math.round(((totalQuestions - mistakesCount) / totalQuestions) * 100))
      onFinishLesson({
        nodeId: node.id,
        stars,
        scorePercent,
        xpEarned: node.xpReward || 25,
        gemsEarned: node.gemsReward || 10
      })
    }
  }

  // Match pairs tap
  const handleLeftPairClick = (idx) => {
    playTapSound()
    setSelectedLeft(idx)
  }

  const handleRightPairClick = (rightItem) => {
    if (selectedLeft === null) return
    playTapSound()
    const correctPair = currentQuestion.pairs[selectedLeft]
    if (correctPair.right === rightItem.text) {
      setUserPairs(prev => [...prev, selectedLeft])
      setSelectedLeft(null)
      playCorrectSound()
    } else {
      setSelectedLeft(null)
      playIncorrectSound()
    }
  }

  // Fill in blanks tap
  const handleTapWordBank = (word) => {
    playTapSound()
    if (filledBlanks.length < (currentQuestion.blanks?.length || 0)) {
      setFilledBlanks(prev => [...prev, word])
      setSelectedWordBank(prev => [...prev, word])
    }
  }

  const handleRemoveFilledBlank = (index) => {
    playTapSound()
    const wordToRemove = filledBlanks[index]
    setFilledBlanks(prev => prev.filter((_, i) => i !== index))
    setSelectedWordBank(prev => {
      const idx = prev.indexOf(wordToRemove)
      if (idx !== -1) {
        const copy = [...prev]
        copy.splice(idx, 1)
        return copy
      }
      return prev
    })
  }

  // Order sequence swap
  const handleMoveStep = (idx, direction) => {
    playTapSound()
    const targetIdx = idx + direction
    if (targetIdx < 0 || targetIdx >= orderedStepIds.length) return
    const copy = [...orderedStepIds]
    const temp = copy[idx]
    copy[idx] = copy[targetIdx]
    copy[targetIdx] = temp
    setOrderedStepIds(copy)
  }

  return (
    <div className="medlingo-modal-overlay">
      <div className="medlingo-modal-container">
        
        {/* ── Top Header: Close, Animated Progress Bar, Hearts ── */}
        <div className="medlingo-lesson-topbar">
          <button 
            className="medlingo-close-btn"
            onClick={() => {
              playTapSound()
              onClose()
            }}
            title="Salir de la lección"
          >
            <X size={24} />
          </button>

          <div className="medlingo-progressbar-track">
            <div 
              className="medlingo-progressbar-fill"
              style={{ width: `${progressPercent}%`, backgroundColor: moduleData.themeColor || '#58cc02' }}
            />
          </div>

          <div className="medlingo-hearts-display">
            <Heart size={22} className="heart-icon filled" />
            <span className="hearts-count">{state.hearts}</span>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            CELEBRATION VICTORY SCREEN (ANIMATED POPUP & CONFETTI)
           ══════════════════════════════════════════════════════════════ */}
        {showVictory ? (
          <div className="medlingo-victory-card animate-victory-pop">
            
            {/* Confetti Sparkles Burst */}
            <div className="confetti-burst-container">
              <span className="confetti-particle p1">🎉</span>
              <span className="confetti-particle p2">✨</span>
              <span className="confetti-particle p3">🩺</span>
              <span className="confetti-particle p4">💎</span>
              <span className="confetti-particle p5">⭐</span>
              <span className="confetti-particle p6">🔥</span>
            </div>

            {/* Glowing 3D Trophy */}
            <div className="medlingo-victory-trophy-wrap">
              <div className="trophy-halo-glow" />
              <Trophy size={82} className="trophy-gold-icon" />
            </div>

            {/* 3 Sequential Bouncing Stars */}
            <div className="medlingo-stars-celebration">
              {[1, 2, 3].map((s) => (
                <div 
                  key={s} 
                  className={`star-bounce-item s${s} ${s <= earnedStars ? 'earned' : 'missed'}`}
                >
                  <Star size={36} className="star-icon filled" />
                </div>
              ))}
            </div>

            <div className="victory-text-header">
              <h2 className="medlingo-victory-title">¡Turno de Guardia Superado!</h2>
              <p className="medlingo-victory-sub">
                Has demostrado dominio clínico en <strong>{node.title}</strong>
              </p>
            </div>

            {/* Stats Grid */}
            <div className="medlingo-victory-stats-grid">
              <div className="medlingo-victory-stat-box stat-xp">
                <span className="stat-label">EXP Ganada</span>
                <span className="stat-val xp">+{node.xpReward || 25} XP</span>
              </div>
              <div className="medlingo-victory-stat-box stat-gems">
                <span className="stat-label">Gemas</span>
                <div className="stat-val gems">
                  <Sparkles size={16} />
                  <span>+{node.gemsReward || 10}</span>
                </div>
              </div>
              <div className="medlingo-victory-stat-box stat-streak">
                <span className="stat-label">Racha</span>
                <div className="stat-val streak">
                  <Flame size={16} />
                  <span>{state.currentStreak || 1} Días</span>
                </div>
              </div>
            </div>

            {/* Mentor Encouragement Banner */}
            <div className="victory-mentor-cheer">
              <div className="cheer-avatar-frame">
                <img src={mentorImage} alt={activeMentor.name} onError={(e) => { e.target.style.display = 'none' }} />
              </div>
              <div className="cheer-quote">
                <strong>{activeMentor.name}:</strong> "¡Diagnóstico impecable! Cada acierto te acerca más a tu puntaje soñado."
              </div>
            </div>

            <button 
              className="medlingo-action-btn primary full duo-big-btn"
              onClick={() => {
                playTapSound()
                onClose()
              }}
            >
              CONTINUAR EN EL SENDERO <ArrowRight size={20} />
            </button>
          </div>
        ) : outOfHearts ? (
          /* ── Out of Hearts Overlay ── */
          <div className="medlingo-out-of-hearts-card animate-scale-up">
            <div className="heart-broken-icon">💔</div>
            <h2>¡Te has quedado sin vidas!</h2>
            <p>Necesitas al menos 1 vida para continuar este turno de guardia.</p>
            
            <div className="out-of-hearts-actions">
              <button 
                className="medlingo-action-btn primary full duo-big-btn"
                onClick={() => {
                  playTapSound()
                  onOpenShop()
                }}
              >
                RECARGAR VIDAS (💎 100)
              </button>
              <button 
                className="medlingo-action-btn secondary full"
                onClick={() => {
                  playTapSound()
                  onClose()
                }}
              >
                VOLVER AL SENDERO
              </button>
            </div>
          </div>
        ) : (
          /* ── Main Content Area ── */
          <div className="medlingo-question-content">
            
            {/* ══════════════════════════════════════════════════════════════
                SLIDE TYPE 0: TEACH FIRST (CLEAN DUOLINGO CONCEPT SLIDE)
               ══════════════════════════════════════════════════════════════ */}
            {isConceptCard ? (
              <div className="medlingo-duo-concept-hero animate-slide-up">
                
                {/* Prominent Standing Character + Speech Bubble */}
                <div className="duo-hero-character-row">
                  <div className="duo-hero-mascot-standing">
                    <img 
                      src={mentorImage} 
                      alt={activeMentor.name} 
                      className="duo-standing-avatar-img"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'flex'
                      }}
                    />
                    <div className="duo-standing-avatar-fallback" style={{ display: 'none', background: activeMentor.avatarBg }}>
                      <span>{activeMentor.emoji}</span>
                    </div>
                  </div>

                  <div className="duo-hero-speech-bubble">
                    <div className="duo-speech-badge">
                      <Stethoscope size={13} />
                      <span>{activeMentor.name}</span>
                    </div>
                    <h2 className="duo-speech-title">{currentQuestion.title}</h2>
                    <p className="duo-speech-quote">"{currentQuestion.dialogue}"</p>
                  </div>
                </div>

                {/* High-Yield Key Points Cards */}
                <div className="duo-concept-cards-stack">
                  {currentQuestion.keyPoints?.map((point, pIdx) => {
                    // Smart parser for clinical keypoints
                    let cleanStr = point.replace(/^[🩺🫀🫁⚡✦\s]+/, '').trim()
                    let emoji = '🩺'
                    if (point.includes('Aórtico') || point.includes('Parvus') || point.includes('Celer')) emoji = '🫀'
                    else if (point.includes('Pulmonar') || point.includes('Paradójico')) emoji = '🫁'
                    else if (point.includes('Mitral') || point.includes('Alternante')) emoji = '⚡'
                    else if (point.includes('R3') || point.includes('R4')) emoji = '🩺'

                    let title = cleanStr
                    let desc = ''
                    let diagnosis = ''

                    if (cleanStr.includes(':')) {
                      const parts = cleanStr.split(':')
                      title = parts[0].trim()
                      const remainder = parts.slice(1).join(':').trim()
                      if (remainder.includes('=')) {
                        const subparts = remainder.split('=')
                        desc = subparts[0].trim()
                        diagnosis = subparts.slice(1).join('=').trim()
                      } else {
                        desc = remainder
                      }
                    }

                    return (
                      <div key={pIdx} className="duo-keypoint-card-clean">
                        <div className="card-emoji-badge">
                          <span>{emoji}</span>
                        </div>
                        <div className="card-content-wrap">
                          <div className="card-title-row">
                            <span className="card-main-title">{title}</span>
                            {diagnosis && (
                              <span className="card-diagnosis-pill">
                                🎯 {diagnosis}
                              </span>
                            )}
                          </div>
                          {desc && <p className="card-desc-text">{desc}</p>}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Mnemonic High-Yield Gold Ribbon */}
                {currentQuestion.mnemonic && (
                  <div className="duo-mnemonic-ribbon">
                    <Sparkles size={20} className="ribbon-sparkle" />
                    <div className="ribbon-text-wrap">
                      <span className="ribbon-tag">REGLA NEMOTÉCNICA EUNACOM</span>
                      <p className="ribbon-rule">{currentQuestion.mnemonic.replace(/💡.*?:\s*/, '')}</p>
                    </div>
                  </div>
                )}

              </div>
            ) : (
              /* ══════════════════════════════════════════════════════════════
                  INTERACTIVE PRACTICE QUESTIONS
                 ══════════════════════════════════════════════════════════════ */
              <>
                {/* Question Prompt with Doctor Buddy in header */}
                <div className="medlingo-question-header-row">
                  <div className="question-mentor-mini" title={`Mentor: ${activeMentor.name}`}>
                    <img src={mentorImage} alt={activeMentor.name} className="mini-avatar-img" onError={(e) => { e.target.style.display = 'none' }} />
                  </div>
                  <div className="question-prompt-text-wrap">
                    <div className="prompt-header-top-row">
                      <div className="prompt-type-badge">
                        {currentQuestion.type === 'flash_mcq' && 'Caso Clínico Flash'}
                        {currentQuestion.type === 'match_pairs' && 'Empareja los Conceptos'}
                        {currentQuestion.type === 'order_sequence' && 'Ordena el Algoritmo'}
                        {currentQuestion.type === 'fill_blanks' && 'Completa la Norma'}
                        {currentQuestion.type === 'speed_true_false' && 'Triage Rápido V/F'}
                      </div>
                      {currentQuestion.hint && answerStatus === 'idle' && (
                        <button
                          type="button"
                          className={`medlingo-inline-hint-pill ${showHint ? 'active' : ''}`}
                          onClick={() => {
                            playTapSound()
                            setShowHint(prev => !prev)
                          }}
                          title="Ver pista clínica"
                        >
                          <Lightbulb size={13} />
                          <span>{showHint ? 'Ocultar Pista' : 'Pista'}</span>
                        </button>
                      )}
                    </div>
                    <h3>{currentQuestion.prompt}</h3>
                    {showHint && currentQuestion.hint && answerStatus === 'idle' && (
                      <div className="medlingo-inline-hint-card animate-scale-up">
                        <div className="hint-card-header">
                          <Lightbulb size={14} color="#eab308" />
                          <span>Pista de Guardia ({activeMentor.name})</span>
                        </div>
                        <p className="hint-card-body">{currentQuestion.hint}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Type 1: Flash Multiple Choice ── */}
                {currentQuestion.type === 'flash_mcq' && (
                  <div className="medlingo-mcq-grid">
                    {currentQuestion.choices?.map((choice) => {
                      const isSelected = selectedChoice === choice.id
                      let btnClass = 'medlingo-choice-card'
                      if (isSelected) btnClass += ' selected'
                      if (answerStatus !== 'idle') {
                        if (choice.isCorrect) btnClass += ' correct'
                        else if (isSelected && !choice.isCorrect) btnClass += ' wrong'
                      }

                      return (
                        <button
                          key={choice.id}
                          className={btnClass}
                          disabled={answerStatus !== 'idle'}
                          onClick={() => {
                            playTapSound()
                            setSelectedChoice(choice.id)
                          }}
                        >
                          <span className="choice-badge">{choice.id}</span>
                          <span className="choice-text">{choice.text}</span>
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* ── Type 2: Speed True / False ── */}
                {currentQuestion.type === 'speed_true_false' && (
                  <div className="medlingo-tf-container">
                    <div className="medlingo-tf-statement-card">
                      "{currentQuestion.statement}"
                    </div>
                    <div className="medlingo-tf-buttons">
                      <button
                        className={`medlingo-tf-btn true ${selectedChoice === true ? 'selected' : ''}`}
                        disabled={answerStatus !== 'idle'}
                        onClick={() => {
                          playTapSound()
                          setSelectedChoice(true)
                        }}
                      >
                        VERDADERO
                      </button>
                      <button
                        className={`medlingo-tf-btn false ${selectedChoice === false ? 'selected' : ''}`}
                        disabled={answerStatus !== 'idle'}
                        onClick={() => {
                          playTapSound()
                          setSelectedChoice(false)
                        }}
                      >
                        FALSO
                      </button>
                    </div>
                  </div>
                )}

                {/* ── Type 3: Match Pairs ── */}
                {currentQuestion.type === 'match_pairs' && (
                  <div className="medlingo-pairs-grid">
                    <div className="pairs-col">
                      {currentQuestion.pairs?.map((pair, idx) => {
                        const isMatched = userPairs.includes(idx)
                        const isSelected = selectedLeft === idx
                        return (
                          <button
                            key={idx}
                            className={`pair-card ${isMatched ? 'matched' : ''} ${isSelected ? 'selected' : ''}`}
                            disabled={isMatched}
                            onClick={() => handleLeftPairClick(idx)}
                          >
                            <span>{pair.left}</span>
                            {isMatched && <Check size={16} className="pair-check" />}
                          </button>
                        )
                      })}
                    </div>
                    <div className="pairs-col">
                      {shuffledRightItems.map((item) => {
                        const isMatched = userPairs.some(pIdx => currentQuestion.pairs[pIdx].right === item.text)
                        return (
                          <button
                            key={item.id}
                            className={`pair-card right ${isMatched ? 'matched' : ''}`}
                            disabled={isMatched || selectedLeft === null}
                            onClick={() => handleRightPairClick(item)}
                          >
                            <span>{item.text}</span>
                            {isMatched && <Check size={16} className="pair-check" />}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* ── Type 4: Order Sequence ── */}
                {currentQuestion.type === 'order_sequence' && (
                  <div className="medlingo-order-list">
                    {orderedStepIds.map((step, idx) => (
                      <div key={step.id} className="order-step-item">
                        <span className="step-num">{idx + 1}</span>
                        <span className="step-text">{step.text}</span>
                        <div className="step-arrows">
                          <button 
                            disabled={idx === 0 || answerStatus !== 'idle'}
                            onClick={() => handleMoveStep(idx, -1)}
                          >
                            ▲
                          </button>
                          <button 
                            disabled={idx === orderedStepIds.length - 1 || answerStatus !== 'idle'}
                            onClick={() => handleMoveStep(idx, 1)}
                          >
                            ▼
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── Type 5: Fill in the Blanks ── */}
                {currentQuestion.type === 'fill_blanks' && (
                  <div className="medlingo-fill-blanks-container">
                    <div className="fill-blanks-sentence">
                      {currentQuestion.textTemplate?.split(/\{(\d+)\}/).map((part, i) => {
                        if (i % 2 === 1) {
                          const blankIdx = parseInt(part, 10)
                          const filledWord = filledBlanks[blankIdx]
                          return (
                            <span 
                              key={i} 
                              className={`blank-slot ${filledWord ? 'filled' : 'empty'}`}
                              onClick={() => filledWord && handleRemoveFilledBlank(blankIdx)}
                            >
                              {filledWord || '______'}
                            </span>
                          )
                        }
                        return <span key={i}>{part}</span>
                      })}
                    </div>

                    <div className="word-bank-tray">
                      {currentQuestion.wordBank?.map((word, idx) => {
                        const isUsed = selectedWordBank.includes(word)
                        return (
                          <button
                            key={idx}
                            className={`word-chip ${isUsed ? 'used' : ''}`}
                            disabled={isUsed || answerStatus !== 'idle'}
                            onClick={() => handleTapWordBank(word)}
                          >
                            {word}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </>
            )}

          </div>
        )}

        {/* ── Floating Corner Character Mascot with Speech & Hints (Desktop idle only) ── */}
        {!showVictory && !outOfHearts && !isConceptCard && answerStatus === 'idle' && (
          <MedLingoMentorWidget
            mentorId={currentQuestion?.mentorTip?.mentorId || state.activeMentorId}
            hintText={currentQuestion?.hint}
            mentorQuote={currentQuestion?.mentorTip?.dialogue}
            combo={combo}
            isCorrect={null}
          />
        )}

        {/* ── Bottom Feedback / Action Drawer ── */}
        {!showVictory && !outOfHearts && (
          <div className={`medlingo-bottom-drawer ${isConceptCard ? 'concept' : answerStatus}`}>
            {isConceptCard ? (
              <div className="feedback-content concept">
                <button 
                  className="medlingo-action-btn primary full duo-big-btn"
                  onClick={handleCheckAnswer}
                >
                  ¡ENTENDIDO, VAMOS A LA PRÁCTICA! <ArrowRight size={20} />
                </button>
              </div>
            ) : answerStatus === 'correct' ? (
              <div className="feedback-content correct animate-slide-up">
                <div className="feedback-header">
                  <CheckCircle2 size={28} className="feedback-icon" />
                  <span className="feedback-title">¡Excelente Diagnóstico!</span>
                </div>
                {currentQuestion.minsalPearl && (
                  <div className="feedback-pearl">
                    <strong>Perla MINSAL:</strong> {currentQuestion.minsalPearl}
                  </div>
                )}
                <button 
                  className="medlingo-action-btn success full duo-big-btn"
                  onClick={handleCheckAnswer}
                >
                  CONTINUAR <ArrowRight size={20} />
                </button>
              </div>
            ) : answerStatus === 'incorrect' ? (
              <div className="feedback-content incorrect animate-slide-up">
                <div className="feedback-header">
                  <AlertCircle size={28} className="feedback-icon" />
                  <span className="feedback-title">¡Atención Clínica! (-1 Vida)</span>
                </div>
                <div className="feedback-explanation">
                  {currentQuestion.explanation}
                </div>
                <button 
                  className="medlingo-action-btn danger full duo-big-btn"
                  onClick={handleCheckAnswer}
                >
                  ENTENDIDO <ArrowRight size={20} />
                </button>
              </div>
            ) : (
              <div className="feedback-content idle">
                <button 
                  className="medlingo-action-btn primary full duo-big-btn"
                  disabled={!canCheck()}
                  onClick={handleCheckAnswer}
                >
                  COMPROBAR
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
