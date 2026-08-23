import React from 'react'
import { Check, X, Target, BookOpen, ChevronRight, Play, Sparkles } from 'lucide-react'
import { MedicalIllustration } from './MedicalIllustrations'

/**
 * TopicCard - MedSchool / MEDZZY styled interactive topic card
 * Features:
 * - Themed medical vector illustration header
 * - Title of specialty / subsystem
 * - Dual-color progress bar (green for correct/mastered, red for errors)
 * - Stat badges (questions count, classes count, mastery %, correct ✓, wrong ✕)
 * - Click to open pop-up preview modal or navigate directly
 */
export const TopicCard = ({
  topic,
  specialty,
  questionsCount = 0,
  classesCount = 0,
  correctCount = 0,
  wrongCount = 0,
  masteryPct = 0,
  completedClasses = 0,
  onClick,
  onDirectNavigate,
  accentColor = '#38bdf8',
  tag,
}) => {
  const totalAnswered = correctCount + wrongCount
  const hasAttempts = totalAnswered > 0 || completedClasses > 0

  // Calculate dual progress bar percentages (0 to 100)
  // Green bar: based on mastery or correct ratio
  // Red bar: based on incorrect ratio
  let greenPct = 0
  let redPct = 0

  if (totalAnswered > 0) {
    greenPct = Math.round((correctCount / (totalAnswered || 1)) * (masteryPct > 0 ? (masteryPct / 100) * 100 : 100))
    redPct = Math.round((wrongCount / (totalAnswered || 1)) * 30) // subtle red chunk for error review
    // Cap combined to 100%
    if (greenPct + redPct > 100) {
      redPct = Math.max(0, 100 - greenPct)
    }
  } else if (classesCount > 0 && completedClasses > 0) {
    greenPct = Math.round((completedClasses / classesCount) * 100)
  }

  // Display mastery % (fallback to calculated accuracy if masteryPct not explicitly provided)
  const displayMastery = masteryPct > 0 ? masteryPct : totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0

  return (
    <div
      onClick={onClick}
      className="medschool-topic-card"
      style={{
        position: 'relative',
        borderRadius: '20px',
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '175px',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px) scale(1.01)'
        e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.35)'
        e.currentTarget.style.boxShadow = '0 14px 30px rgba(0, 0, 0, 0.4), 0 0 20px rgba(56, 189, 248, 0.15)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)'
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.25)'
      }}
    >
      {/* Background Themed Illustration on the top-right */}
      <div
        style={{
          position: 'absolute',
          top: -10,
          right: -10,
          width: '150px',
          height: '115px',
          opacity: 0.8,
          pointerEvents: 'none',
          maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)',
        }}
      >
        <MedicalIllustration name={topic || specialty} />
      </div>

      {/* Card Content Top Header */}
      <div style={{ padding: '1.25rem 1.25rem 0.5rem', position: 'relative', zIndex: 2 }}>
        {/* Optional Tag or Specialty Sub-label */}
        {tag && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.68rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              padding: '0.2rem 0.55rem',
              borderRadius: '100px',
              background: 'rgba(56, 189, 248, 0.12)',
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              marginBottom: '0.4rem',
            }}
          >
            <Sparkles size={11} /> {tag}
          </div>
        )}

        {/* Topic Title */}
        <h3
          style={{
            fontSize: '1.15rem',
            fontWeight: 800,
            color: '#f8fafc',
            margin: '0 0 0.5rem',
            letterSpacing: '-0.02em',
            paddingRight: '60px',
            lineHeight: 1.25,
            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
          }}
        >
          {topic}
        </h3>

        {/* Dual Progress Bar (Green correct/mastered + Red errors + Neutral track) */}
        <div style={{ marginTop: '0.75rem', marginBottom: '0.35rem' }}>
          <div
            style={{
              height: '6px',
              width: '100%',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '100px',
              overflow: 'hidden',
              display: 'flex',
              position: 'relative',
            }}
          >
            {/* Green Bar (Correct/Mastered) */}
            {greenPct > 0 && (
              <div
                style={{
                  height: '100%',
                  width: `${greenPct}%`,
                  background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
                  borderRadius: redPct > 0 ? '100px 0 0 100px' : '100px',
                  transition: 'width 0.4s ease',
                  boxShadow: '0 0 8px rgba(16, 185, 129, 0.5)',
                }}
              />
            )}
            {/* Red Bar (Errors to review) */}
            {redPct > 0 && (
              <div
                style={{
                  height: '100%',
                  width: `${redPct}%`,
                  background: 'linear-gradient(90deg, #ef4444 0%, #f87171 100%)',
                  borderRadius: greenPct > 0 ? '0 100px 100px 0' : '100px',
                  transition: 'width 0.4s ease',
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Card Footer: Detailed Stats Row matching reference */}
      <div
        style={{
          padding: '0.6rem 1.25rem 1rem',
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        {/* Left Stats: Question count + Classes count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>
          {questionsCount > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }} title={`${questionsCount} preguntas disponibles`}>
              <Target size={13} color="#38bdf8" />
              <span>{questionsCount.toLocaleString()}</span>
            </span>
          )}
          {classesCount > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }} title={`${classesCount} clases disponibles`}>
              <BookOpen size={13} color="#a855f7" />
              <span>{classesCount}</span>
            </span>
          )}
        </div>

        {/* Right Badges: Mastered pill + ✓ Correct + ✕ Errors */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          {/* Mastered / Dominio Pill */}
          <div
            style={{
              fontSize: '0.74rem',
              fontWeight: 700,
              padding: '0.22rem 0.55rem',
              borderRadius: '100px',
              background: displayMastery >= 70 ? 'rgba(16, 185, 129, 0.15)' : displayMastery > 0 ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255, 255, 255, 0.06)',
              color: displayMastery >= 70 ? '#34d399' : displayMastery > 0 ? '#38bdf8' : '#94a3b8',
              border: `1px solid ${displayMastery >= 70 ? 'rgba(16, 185, 129, 0.3)' : displayMastery > 0 ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.08)'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <span>Dominio: {displayMastery}%</span>
          </div>

          {/* Correct count pill */}
          {correctCount > 0 && (
            <div
              style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                padding: '0.22rem 0.45rem',
                borderRadius: '100px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                display: 'flex',
                alignItems: 'center',
                gap: '0.15rem',
              }}
              title={`${correctCount} respuestas correctas`}
            >
              <Check size={12} strokeWidth={3} />
              <span>{correctCount}</span>
            </div>
          )}

          {/* Wrong count pill */}
          {wrongCount > 0 && (
            <div
              style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                padding: '0.22rem 0.45rem',
                borderRadius: '100px',
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#f87171',
                display: 'flex',
                alignItems: 'center',
                gap: '0.15rem',
              }}
              title={`${wrongCount} respuestas incorrectas por repasar`}
            >
              <X size={12} strokeWidth={3} />
              <span>{wrongCount}</span>
            </div>
          )}

          {/* Quick Direct Arrow Action */}
          {onDirectNavigate && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDirectNavigate()
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '50%',
                width: '26px',
                height: '26px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#f8fafc',
                cursor: 'pointer',
                transition: 'background 0.2s',
                padding: 0,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(56, 189, 248, 0.25)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)' }}
              title="Ir directo a clases de este tema"
            >
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default TopicCard
