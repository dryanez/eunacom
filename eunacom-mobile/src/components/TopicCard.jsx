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
        borderRadius: '14px',
        background: 'var(--card-bg, rgba(30, 41, 59, 0.5))',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid var(--card-border, rgba(255, 255, 255, 0.08))',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '160px',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.3)'
        e.currentTarget.style.boxShadow = 'var(--shadow-md)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.borderColor = 'var(--card-border, rgba(255, 255, 255, 0.08))'
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
      }}
    >
      {/* Subtle Background Watermark Vector Illustration */}
      <div
        style={{
          position: 'absolute',
          top: -5,
          right: -5,
          width: '130px',
          height: '100px',
          opacity: 0.35,
          pointerEvents: 'none',
          maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 100%)',
        }}
      >
        <MedicalIllustration name={topic || specialty} />
      </div>

      {/* Card Content Top Header */}
      <div style={{ padding: '1.1rem 1.1rem 0.4rem', position: 'relative', zIndex: 2 }}>
        {/* Optional Tag or Specialty Sub-label */}
        {tag && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: '0.02em',
              padding: '0.15rem 0.5rem',
              borderRadius: '6px',
              background: 'rgba(56, 189, 248, 0.12)',
              color: '#0284c7',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              marginBottom: '0.4rem',
            }}
          >
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#0284c7' }} />
            {tag}
          </div>
        )}

        {/* Topic Title */}
        <h3
          style={{
            fontSize: '1.05rem',
            fontWeight: 700,
            color: 'var(--surface-50, #f8fafc)',
            margin: '0 0 0.4rem',
            letterSpacing: '-0.01em',
            paddingRight: '40px',
            lineHeight: 1.3,
          }}
        >
          {topic}
        </h3>

        {/* Dual Progress Bar */}
        <div style={{ marginTop: '0.6rem', marginBottom: '0.2rem' }}>
          <div
            style={{
              height: '4px',
              width: '100%',
              background: 'var(--surface-600, rgba(255, 255, 255, 0.08))',
              borderRadius: '4px',
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
                  background: '#10b981',
                  borderRadius: redPct > 0 ? '4px 0 0 4px' : '4px',
                  transition: 'width 0.3s ease',
                }}
              />
            )}
            {/* Red Bar (Errors to review) */}
            {redPct > 0 && (
              <div
                style={{
                  height: '100%',
                  width: `${redPct}%`,
                  background: '#ef4444',
                  borderRadius: greenPct > 0 ? '0 4px 4px 0' : '4px',
                  transition: 'width 0.3s ease',
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Card Footer: Detailed Stats Row */}
      <div
        style={{
          padding: '0.5rem 1.1rem 0.9rem',
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.4rem',
        }}
      >
        {/* Left Stats: Question count + Classes count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.75rem', color: 'var(--surface-400, #94a3b8)', fontWeight: 600 }}>
          {questionsCount > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} title={`${questionsCount} preguntas disponibles`}>
              <Target size={12} color="#0284c7" />
              <span>{questionsCount.toLocaleString()}</span>
            </span>
          )}
          {classesCount > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} title={`${classesCount} clases disponibles`}>
              <BookOpen size={12} color="#9333ea" />
              <span>{classesCount}</span>
            </span>
          )}
        </div>

        {/* Right Badges: Mastered pill + ✓ Correct + ✕ Errors */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
          {/* Mastered / Dominio Pill */}
          <div
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '0.18rem 0.5rem',
              borderRadius: '6px',
              background: displayMastery >= 70 ? 'rgba(16, 185, 129, 0.12)' : displayMastery > 0 ? 'rgba(56, 189, 248, 0.12)' : 'var(--surface-700, rgba(255, 255, 255, 0.05))',
              color: displayMastery >= 70 ? '#059669' : displayMastery > 0 ? '#0284c7' : 'var(--surface-400, #94a3b8)',
              border: `1px solid ${displayMastery >= 70 ? 'rgba(16, 185, 129, 0.3)' : displayMastery > 0 ? 'rgba(56, 189, 248, 0.3)' : 'var(--surface-600, rgba(255, 255, 255, 0.06))'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '0.2rem',
            }}
          >
            <span>{displayMastery}% dominio</span>
          </div>

          {/* Correct count pill */}
          {correctCount > 0 && (
            <div
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0.18rem 0.4rem',
                borderRadius: '6px',
                background: 'rgba(16, 185, 129, 0.12)',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                gap: '0.15rem',
              }}
              title={`${correctCount} respuestas correctas`}
            >
              <Check size={11} strokeWidth={2.5} />
              <span>{correctCount}</span>
            </div>
          )}

          {/* Wrong count pill */}
          {wrongCount > 0 && (
            <div
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0.18rem 0.4rem',
                borderRadius: '6px',
                background: 'rgba(239, 68, 68, 0.12)',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                gap: '0.15rem',
              }}
              title={`${wrongCount} respuestas incorrectas por repasar`}
            >
              <X size={11} strokeWidth={2.5} />
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
                background: 'var(--surface-700, rgba(255, 255, 255, 0.05))',
                border: '1px solid var(--surface-600, rgba(255, 255, 255, 0.08))',
                borderRadius: '6px',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--surface-400, #94a3b8)',
                cursor: 'pointer',
                transition: 'all 0.15s',
                padding: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(56, 189, 248, 0.15)'
                e.currentTarget.style.color = '#0284c7'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--surface-700, rgba(255, 255, 255, 0.05))'
                e.currentTarget.style.color = 'var(--surface-400, #94a3b8)'
              }}
              title="Ir a clases de este tema"
            >
              <ChevronRight size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default TopicCard
