import React from 'react'
import { X, Play, BookOpen, Target, CheckCircle2, ChevronRight, Sparkles, Award, ArrowRight } from 'lucide-react'
import { MedicalIllustration } from './MedicalIllustrations'

/**
 * TopicQuickModal - "Popping Up Bigger" modal for examining a topic/specialty
 * Shows:
 * - Large medical artwork header
 * - Detailed mastery stats & progress breakdown
 * - Sub-topics & lessons list
 * - Direct navigation actions into classes and exams
 */
export const TopicQuickModal = ({
  isOpen,
  onClose,
  topicData,
  onOpenClass,
  onNavigateToSubsystem,
}) => {
  if (!isOpen || !topicData) return null

  const {
    topic,
    specialty,
    lessons = [],
    questionsCount = 0,
    classesCount = 0,
    correctCount = 0,
    wrongCount = 0,
    masteryPct = 0,
    completedClasses = 0,
    progressMap = {},
  } = topicData

  const totalAnswered = correctCount + wrongCount
  const displayMastery = masteryPct > 0 ? masteryPct : totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        background: 'rgba(2, 6, 23, 0.82)',
        backdropFilter: 'blur(10px)',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          background: 'var(--surface-800)',
          borderRadius: '24px',
          border: '1.5px solid var(--surface-600)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          animation: 'scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @keyframes scaleUp {
            from { transform: scale(0.92); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}</style>

        {/* Modal Top Banner with Medical Artwork */}
        <div
          style={{
            position: 'relative',
            padding: '1.5rem 1.75rem 1.25rem',
            background: 'var(--surface-700)',
            borderBottom: '1px solid var(--surface-600)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          {/* Subtle Ambient Orb */}
          <div
            style={{
              position: 'absolute',
              top: '-20px',
              left: '-20px',
              width: '160px',
              height: '160px',
              background: 'radial-gradient(circle, rgba(56, 189, 248, 0.2) 0%, transparent 70%)',
              filter: 'blur(20px)',
              pointerEvents: 'none',
            }}
          />

          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1.25rem',
              right: '1.25rem',
              background: 'var(--surface-600)',
              border: '1px solid var(--surface-500)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--surface-400)',
              cursor: 'pointer',
              zIndex: 10,
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--surface-50)'; e.currentTarget.style.background = 'var(--surface-500)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--surface-400)'; e.currentTarget.style.background = 'var(--surface-600)' }}
          >
            <X size={18} />
          </button>

          {/* Left Info */}
          <div style={{ flex: 1, position: 'relative', zIndex: 2, paddingRight: '40px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#0284c7',
                background: 'rgba(56, 189, 248, 0.12)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                padding: '0.2rem 0.6rem',
                borderRadius: '100px',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              <Sparkles size={12} /> {specialty || 'EUNACOM'}
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--surface-50)', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              {topic}
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--surface-400)', margin: '0.35rem 0 0', fontWeight: 500 }}>
              {lessons.length || classesCount} clases interactivas · {questionsCount > 0 ? `${questionsCount.toLocaleString()} preguntas reales` : 'Contenido completo de examen'}
            </p>
          </div>

          {/* Right Vector Illustration */}
          <div style={{ width: '90px', height: '80px', flexShrink: 0, position: 'relative', zIndex: 2 }}>
            <MedicalIllustration name={topic} />
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div style={{ padding: '1.25rem 1.75rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Key Metrics Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '0.75rem',
            }}
          >
            {/* Dominio Card */}
            <div
              style={{
                background: 'var(--surface-700)',
                border: '1px solid var(--surface-600)',
                borderRadius: '14px',
                padding: '0.85rem',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '0.72rem', color: 'var(--surface-400)', fontWeight: 700, textTransform: 'uppercase' }}>Dominio</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: displayMastery >= 70 ? '#059669' : '#0284c7', marginTop: '0.2rem' }}>
                {displayMastery}%
              </div>
            </div>

            {/* Aciertos Card */}
            <div
              style={{
                background: 'var(--surface-700)',
                border: '1px solid var(--surface-600)',
                borderRadius: '14px',
                padding: '0.85rem',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '0.72rem', color: 'var(--surface-400)', fontWeight: 700, textTransform: 'uppercase' }}>Aciertos</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#059669', marginTop: '0.2rem' }}>
                ✓ {correctCount}
              </div>
            </div>

            {/* Por Repasar Card */}
            <div
              style={{
                background: 'var(--surface-700)',
                border: '1px solid var(--surface-600)',
                borderRadius: '14px',
                padding: '0.85rem',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '0.72rem', color: 'var(--surface-400)', fontWeight: 700, textTransform: 'uppercase' }}>Errores</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: wrongCount > 0 ? '#dc2626' : 'var(--surface-400)', marginTop: '0.2rem' }}>
                ✕ {wrongCount}
              </div>
            </div>
          </div>

          {/* List of Lessons / Classes inside */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--surface-50)', margin: 0 }}>
                Clases del Tema ({lessons.length})
              </h4>
              <span style={{ fontSize: '0.78rem', color: 'var(--surface-400)', fontWeight: 600 }}>
                {completedClasses} completadas
              </span>
            </div>

            {lessons.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--surface-400)', fontSize: '0.85rem', background: 'var(--surface-700)', borderRadius: '12px' }}>
                No hay clases registradas en este tema aún.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '220px', overflowY: 'auto', paddingRight: '4px' }}>
                {lessons.map((lesson, idx) => {
                  const p = progressMap[lesson.id]
                  const isDone = p && (p.video_watched === 1 || p.quiz_completed === 1)
                  return (
                    <div
                      key={lesson.id || idx}
                      onClick={() => onOpenClass && onOpenClass(lesson.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.65rem 0.85rem',
                        background: 'var(--surface-700)',
                        border: '1px solid var(--surface-600)',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(56, 189, 248, 0.1)'
                        e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.3)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'var(--surface-700)'
                        e.currentTarget.style.borderColor = 'var(--surface-600)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '8px',
                            background: isDone ? 'rgba(16, 185, 129, 0.15)' : 'var(--surface-600)',
                            color: isDone ? '#059669' : 'var(--surface-400)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {isDone ? <CheckCircle2 size={16} /> : (lesson.lessonNumber || idx + 1)}
                        </div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--surface-50)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {lesson.topic}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0284c7', fontSize: '0.75rem', fontWeight: 700 }}>
                        <span>Ver</span>
                        <ChevronRight size={14} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div
          style={{
            padding: '1rem 1.75rem',
            background: 'var(--surface-700)',
            borderTop: '1px solid var(--surface-600)',
            display: 'flex',
            gap: '0.75rem',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={() => {
              onClose()
              if (onNavigateToSubsystem) onNavigateToSubsystem(topic, specialty)
            }}
            style={{
              flex: 1,
              padding: '0.75rem 1.25rem',
              background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
              color: '#ffffff',
              borderRadius: '100px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(6, 182, 212, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            <span>Ir a Clases de {topic}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default TopicQuickModal
