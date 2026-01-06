import React from 'react'

const TestSidebar = ({
    questions = [],
    currentQuestionIndex,
    startIndex = 0, // NEW PROP
    answers = {},
    flags = {},
    feedback = {}, // { questionId: { isCorrect: true/false } }
    onNavigate
}) => {
    return (
        <div style={{
            width: '260px',
            backgroundColor: '#fff',
            borderRight: '1px solid #eef2f5',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflowY: 'auto',
            padding: '1.5rem',
            position: 'relative'
        }}>
            <h3 style={{ marginBottom: '1.5rem', color: '#333', fontSize: '1.1rem' }}>Preguntas</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {questions.map((q, index) => {
                    const globalIndex = startIndex + index // Calculate global index
                    const isFlagged = flags[q.id]
                    const isAnswered = answers[q.id] !== undefined
                    const qFeedback = feedback[q.id]

                    // Determine border/bg color
                    let borderColor = '#ddd'
                    let bgColor = '#fff'
                    let textColor = '#555'

                    if (qFeedback) {
                        if (qFeedback.isCorrect) {
                            borderColor = '#48bb78' // Green
                            bgColor = '#f0fff4'
                            textColor = '#2f855a'
                        } else {
                            borderColor = '#f56565' // Red
                            bgColor = '#fff5f5'
                            textColor = '#c53030'
                        }
                    }

                    if (globalIndex === currentQuestionIndex) {
                        borderColor = '#4EBDDB'
                        // Keep the feedback bg color if available, otherwise blue tint
                        bgColor = qFeedback ? bgColor : '#eefcfd'
                        // Text color priority to current active
                        textColor = '#1a3b5c'
                    }

                    // Truncate question text to ~60 characters
                    const questionPreview = q.question_text?.length > 60
                        ? q.question_text.substring(0, 60) + '...'
                        : q.question_text || 'Sin texto'

                    return (
                        <button
                            key={q.id}
                            onClick={() => onNavigate(globalIndex)}
                            style={{
                                width: '100%',
                                minHeight: '60px',
                                border: `2px solid ${borderColor}`,
                                borderRadius: '8px',
                                background: bgColor,
                                color: textColor,
                                fontWeight: globalIndex === currentQuestionIndex ? '600' : '400',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'flex-start',
                                padding: '10px 12px',
                                textAlign: 'left',
                                gap: '10px',
                                transition: 'all 0.2s'
                            }}
                        >
                            {/* Question Number */}
                            <div style={{
                                minWidth: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                border: `2px solid ${borderColor}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                flexShrink: 0,
                                marginTop: '2px'
                            }}>
                                {startIndex + index + 1}
                            </div>

                            {/* Question Preview Text */}
                            <div style={{
                                flex: 1,
                                fontSize: '0.8rem',
                                lineHeight: '1.4',
                                color: index === currentQuestionIndex ? '#1a3b5c' : '#666',
                                overflow: 'hidden',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical'
                            }}>
                                {questionPreview}
                            </div>

                            {/* Indicators */}
                            <div style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                display: 'flex',
                                gap: '4px',
                                alignItems: 'center'
                            }}>
                                {/* Flag */}
                                {isFlagged && (
                                    <span style={{ fontSize: '0.9rem' }}>🚩</span>
                                )}

                                {/* Result Indicator */}
                                {qFeedback && (
                                    <span style={{ fontSize: '0.9rem' }}>
                                        {qFeedback.isCorrect ? '✅' : '❌'}
                                    </span>
                                )}

                                {/* Answered dot */}
                                {isAnswered && !qFeedback && (
                                    <div style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        background: '#4EBDDB'
                                    }} />
                                )}
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

export default TestSidebar
