import React from 'react'

const QuestionDetailsModal = ({ question, onClose }) => {
    if (!question) return null

    const isMissing = (value) => !value || value === '' || value === 'N/A'

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }}>
            <div style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '12px',
                width: '90%',
                maxWidth: '800px',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                    <h2 style={{ margin: 0, color: '#333' }}>Detalles de la Pregunta #{question.id}</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                </div>

                <div style={{ display: 'grid', gap: '1.5rem' }}>

                    {/* Metadata Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', background: '#f8f9fa', padding: '1rem', borderRadius: '8px' }}>
                        <div>
                            <strong>Tema:</strong> {question.topic}
                        </div>
                        <div>
                            <strong>Capítulo:</strong> {question.chapter || <span style={{ color: 'red' }}>Faltante</span>}
                        </div>
                        <div>
                            <strong>Fuente:</strong> {question.file_source || <span style={{ color: 'red' }}>Faltante</span>}
                        </div>
                        <div>
                            <strong>Código EUNACOM:</strong> {question.eunacom_code || <span style={{ color: 'orange' }}>N/A</span>}
                        </div>
                        <div>
                            <strong>Modelo AI:</strong> {question.ai_model || <span style={{ color: '#999' }}>Desconocido</span>}
                        </div>
                    </div>

                    {/* Question & Options */}
                    <div>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#666' }}>Pregunta</h4>
                        <div style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>{question.question_text}</div>

                        <div style={{ display: 'grid', gap: '0.5rem' }}>
                            {['a', 'b', 'c', 'd', 'e'].map(opt => (
                                <div key={opt} style={{
                                    padding: '0.5rem',
                                    borderRadius: '4px',
                                    background: question.correct_answer === opt.toUpperCase() ? '#d4edda' : '#f8f9fa',
                                    border: question.correct_answer === opt.toUpperCase() ? '1px solid #c3e6cb' : '1px solid #eee'
                                }}>
                                    <strong>{opt.toUpperCase()})</strong> {question[`option_${opt}`]}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Explanations */}
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <div>
                            <h4 style={{ margin: '0 0 0.5rem 0', color: '#28a745' }}>Explicación Correcta</h4>
                            {isMissing(question.explanation) ? (
                                <div style={{ color: 'red', fontStyle: 'italic' }}>⚠️ Falta explicación</div>
                            ) : (
                                <div style={{ whiteSpace: 'pre-wrap' }}>{question.explanation}</div>
                            )}
                        </div>

                        {question.incorrect_explanations && (
                            <div>
                                <h4 style={{ margin: '0 0 0.5rem 0', color: '#dc3545' }}>Por qué son incorrectas</h4>
                                <div style={{ whiteSpace: 'pre-wrap' }}>{question.incorrect_explanations}</div>
                            </div>
                        )}
                    </div>

                    {/* Multimedia & Tags */}
                    <div style={{ borderTop: '1px solid #eee', paddingTop: '1rem', display: 'grid', gap: '1rem' }}>
                        <div>
                            <strong>Video Recomendado: </strong>
                            {question.video_url ? (
                                <a href={question.video_url} target="_blank" rel="noopener noreferrer" style={{ color: '#4EBDDB', textDecoration: 'underline' }}>
                                    Ver Video ↗
                                </a>
                            ) : (
                                <span style={{ color: 'orange' }}>No asignado</span>
                            )}
                        </div>

                        <div>
                            <strong>Tags: </strong>
                            {question.tags ? (
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                                    {question.tags.split(',').map((tag, i) => (
                                        <span key={i} style={{ background: '#e9ecef', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.85rem' }}>
                                            {tag.trim()}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <span style={{ color: '#999', fontStyle: 'italic' }}>Sin tags</span>
                            )}
                        </div>
                    </div>

                </div>

                <div style={{ marginTop: '2rem', textAlign: 'right' }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '0.5rem 1.5rem',
                            background: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    )
}

export default QuestionDetailsModal
