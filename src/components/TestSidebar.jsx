import React from 'react'

const TestSidebar = ({
    questions = [],
    currentQuestionIndex,
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {questions.map((q, index) => {
                    const isFlagged = flags[q.id]
                    const isAnswered = answers[q.id] !== undefined
                    const qFeedback = feedback[q.id]

                    // Determine border/bg color
                    let borderColor = '#ddd'
                    let bgColor = '#fff'
                    let textColor = '#555'

                    if (index === currentQuestionIndex) {
                        borderColor = '#4EBDDB'
                        textColor = '#4EBDDB'
                        bgColor = '#eefcfd'
                    }

                    return (
                        <button
                            key={q.id}
                            onClick={() => onNavigate(index)}
                            style={{
                                width: '100%',
                                aspectRatio: '1/1',
                                border: `2px solid ${borderColor}`,
                                borderRadius: '8px',
                                background: bgColor,
                                color: textColor,
                                fontWeight: '600',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            {index + 1}

                            {/* Indicators Overlay */}
                            <div style={{ position: 'absolute', top: '-4px', right: '-4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                {/* Flag */}
                                {isFlagged && (
                                    <span style={{ fontSize: '0.8rem' }}>🚩</span>
                                )}
                            </div>

                            {/* Result Indicator (Bottom Right) */}
                            {qFeedback && (
                                <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', background: 'white', borderRadius: '50%', padding: '2px' }}>
                                    {qFeedback.isCorrect ? '✅' : '❌'}
                                </div>
                            )}

                            {/* Answered but no feedback yet (Timed mode or Tutor before check) */}
                            {isAnswered && !qFeedback && !isFlagged && (
                                <div style={{
                                    position: 'absolute',
                                    bottom: '4px',
                                    right: '4px',
                                    width: '6px',
                                    height: '6px',
                                    borderRadius: '50%',
                                    background: '#4EBDDB'
                                }} />
                            )}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

export default TestSidebar
