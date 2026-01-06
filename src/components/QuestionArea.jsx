import React from 'react'

const QuestionArea = ({
    question,
    currentIndex,
    totalQuestions,
    selectedOption,
    isFlagged,
    onNext,
    onPrev,
    onFlag,
    onSelectOption,
    onSubmit,
    feedback,
    showFeedback, // Boolean: If true, show explanation and correct/incorrect styles
    testMode,
    answerStats // { A: count, B: count, C: count, D: count, E: count }
}) => {
    const explanationRef = React.useRef(null)

    React.useEffect(() => {
        if (showFeedback && explanationRef.current) {
            explanationRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
    }, [showFeedback])

    // Parse incorrect explanations
    // Needs to handle various formats from DB:
    // 1. "a) Text"
    // 2. "**A)** Text"
    // 3. "* **B:** Text"
    // 4. "**C) 9m, D) 10m:** Text" (Grouped inline)
    const getIncorrectExplanation = (optionKey) => {
        if (!question.incorrect_explanations || !showFeedback) return null

        const lowerKey = optionKey.toLowerCase()

        // Final Ultimate Regex:
        // (?:^|[\n,\s]) -> Start, Newline, Comma, or Space (handles inline grouping)
        // [\*\s]*       -> Optional bullets (*) or whitespace
        // (?:\*\*)?     -> Optional bold start
        //    -> The letter (a, b, c...)
        // (?:\*\*)?     -> Optional bold end
        // [\)\:]        -> Separator ( ) or : )

        const regex = new RegExp(
            `(?:^|[\\n,\\s])[\\*\\s]*(?:\\*\\*)?${lowerKey}(?:\\*\\*)?[\\)\\:][\\s\\S]*?(?=(?:\\n)[\\*\\s]*(?:\\*\\*)?[a-e](?:\\*\\*)?[\\)\\:]|$)`,
            'gi'
        )

        const match = question.incorrect_explanations.match(regex)

        if (match && match[0]) {
            // Clean up the prefix
            return match[0].replace(
                new RegExp(`^(?:[\\n,\\s])?[\\*\\s]*(?:\\*\\*)?${lowerKey}(?:\\*\\*)?[\\)\\:][\\s]*`, 'i'),
                ''
            ).replace(/\*\*/g, '').trim()
        }

        return null
    }

    // Calculate percentage for each option
    const getStat = (optKey) => {
        if (!answerStats || !showFeedback) return null

        const total = Object.values(answerStats).reduce((sum, count) => sum + count, 0)
        if (total === 0) return 0

        const count = answerStats[optKey] || 0
        return Math.round((count / total) * 100)
    }

    return (
        <div style={{ flex: 1, padding: '2rem 4rem', overflowY: 'auto' }}>
            {/* Header: Nav + Flag */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={onPrev} disabled={currentIndex === 0} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.5rem', color: currentIndex === 0 ? '#ddd' : '#555' }}>
                        ←
                    </button>
                    <button onClick={onNext} disabled={currentIndex === totalQuestions - 1} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.5rem', color: currentIndex === totalQuestions - 1 ? '#ddd' : '#555' }}>
                        →
                    </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: '#777', fontSize: '0.9rem' }}>Pregunta {currentIndex + 1} de {totalQuestions}</span>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                        type="checkbox"
                        checked={isFlagged}
                        onChange={onFlag}
                        style={{ display: 'none' }}
                    />
                    <span style={{ fontSize: '1.5rem', opacity: isFlagged ? 1 : 0.3, filter: 'grayscale(0)' }}>🚩</span>
                    <span style={{ color: isFlagged ? '#e53e3e' : '#999', fontWeight: '600' }}>Marcar duda</span>
                </label>
            </div>

            {/* Question Text */}
            <div style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', lineHeight: '1.6', color: '#1a3b5c', fontWeight: '500' }}>
                    {question.question_text}
                </h2>
            </div>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                {Object.entries(question.options || {}).map(([key, text]) => {
                    const isSelected = selectedOption === key
                    const isCorrect = key === question.correct_option
                    const incorrectExp = getIncorrectExplanation(key)

                    // Style determination
                    let borderColor = '#e2e8f0'
                    let bgColor = '#fff'
                    let textColor = '#444'

                    if (showFeedback) {
                        if (isCorrect) {
                            borderColor = '#48bb78' // Green
                            bgColor = '#f0fff4'
                        } else if (isSelected && !isCorrect) {
                            borderColor = '#f56565' // Red
                            bgColor = '#fff5f5'
                        }
                    } else {
                        if (isSelected) {
                            borderColor = '#4EBDDB'
                            bgColor = '#eefcfd'
                            textColor = '#1a3b5c'
                        }
                    }

                    return (
                        <div key={key} style={{ marginBottom: showFeedback && incorrectExp && !isCorrect ? '0.5rem' : '0' }}>
                            <div
                                onClick={() => !showFeedback && onSelectOption(key)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    border: `2px solid ${borderColor}`,
                                    borderRadius: '12px',
                                    padding: '1rem 1.5rem',
                                    cursor: showFeedback ? 'default' : 'pointer',
                                    background: bgColor,
                                    transition: 'all 0.2s',
                                    color: textColor
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        width: '24px', height: '24px',
                                        borderRadius: '50%',
                                        border: `2px solid ${isSelected || (showFeedback && isCorrect) ? borderColor : '#cbd5e0'}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: 'bold', fontSize: '0.8rem',
                                        color: isSelected || (showFeedback && isCorrect) ? borderColor : '#cbd5e0'
                                    }}>
                                        {key}
                                    </div>
                                    <span style={{ fontSize: '1rem' }}>{text}</span>
                                </div>

                                {/* Stats with percentage bar (only shown after feedback) */}
                                {showFeedback && answerStats && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: '150px' }}>
                                        {/* Percentage Bar */}
                                        <div style={{
                                            flex: 1,
                                            height: '8px',
                                            background: '#e2e8f0',
                                            borderRadius: '4px',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                width: `${getStat(key)}%`,
                                                height: '100%',
                                                background: isCorrect ? '#48bb78' : (isSelected ? '#4EBDDB' : '#cbd5e0'),
                                                transition: 'width 0.5s ease-out'
                                            }} />
                                        </div>

                                        {/* Percentage Text */}
                                        <div style={{
                                            color: isCorrect ? '#48bb78' : (isSelected ? '#4EBDDB' : '#999'),
                                            fontSize: '0.9rem',
                                            fontWeight: '600',
                                            minWidth: '45px',
                                            textAlign: 'right'
                                        }}>
                                            {getStat(key)}%
                                            {isSelected && ' ←'}
                                            {isCorrect && ' ✓'}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Incorrect Explanation (only shown for wrong answers when feedback is visible) */}
                            {showFeedback && incorrectExp && !isCorrect && (
                                <div style={{
                                    marginTop: '0.5rem',
                                    marginLeft: '2.5rem',
                                    padding: '0.75rem 1rem',
                                    background: '#fff9f9',
                                    borderLeft: '3px solid #f56565',
                                    borderRadius: '0 8px 8px 0',
                                    fontSize: '0.9rem',
                                    color: '#666',
                                    lineHeight: '1.5'
                                }}>
                                    <strong style={{ color: '#e53e3e' }}>Por qué no:</strong> {incorrectExp}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Footer Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', alignItems: 'center' }}>
                {testMode === 'tutor' && !showFeedback && (
                    <button
                        onClick={onSubmit}
                        disabled={!selectedOption}
                        style={{
                            background: selectedOption ? '#4EBDDB' : '#ccc',
                            color: 'white',
                            border: 'none',
                            padding: '0.75rem 2rem',
                            borderRadius: '30px',
                            fontWeight: 'bold',
                            cursor: selectedOption ? 'pointer' : 'not-allowed',
                            fontSize: '1rem'
                        }}
                    >
                        Comprobar
                    </button>
                )}
            </div>

            {/* Explanation Area */}
            {showFeedback && (
                <div ref={explanationRef} style={{ marginTop: '2rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ margin: '0 0 1rem 0', color: '#1a3b5c' }}>Explicación</h4>
                    <p style={{ lineHeight: '1.8', color: '#4a5568', whiteSpace: 'pre-wrap' }}>
                        {question.explanation
                            ? question.explanation
                                .replace(/\*\*/g, '') // Remove bold markers
                                .replace(/(?:\s|^)(\d+\.\s)/g, '\n\n$1') // Double newline before "1. ", "2. "
                                .replace(/(?:\s|^)(En resumen|Por lo tanto|Conclusión)/g, '\n\n$1') // Newline before summary phrases
                            : "No hay explicación disponible para esta pregunta."
                        }
                    </p>
                </div>
            )}
        </div>
    )
}

export default QuestionArea
