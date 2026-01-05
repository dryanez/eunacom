import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import TestSidebar from '../components/TestSidebar'
import QuestionArea from '../components/QuestionArea'
import '../styles/dashboard.css' // Ensure styles

function TestRunner() {
    const { id } = useParams()
    const navigate = useNavigate()

    // Test Data
    const [test, setTest] = useState(null)
    const [questionsData, setQuestionsData] = useState([])
    const [loading, setLoading] = useState(true)

    // User State
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [answers, setAnswers] = useState({}) // { questionId: optionKey }
    const [flags, setFlags] = useState({})     // { questionId: boolean }
    const [feedback, setFeedback] = useState({}) // { questionId: { isCorrect: bool } } -> Tutor mode only
    const [answerStats, setAnswerStats] = useState({}) // { questionId: { A: count, B: count, ... } }

    const [showFinishModal, setShowFinishModal] = useState(false)

    useEffect(() => {
        fetchTestSession()
    }, [id])

    const fetchTestSession = async () => {
        try {
            setLoading(true)

            // 1. Fetch Test Session
            const { data: testData, error: testError } = await supabase
                .from('tests')
                .select('*')
                .eq('id', id)
                .single()

            if (testError) throw testError
            setTest(testData)

            // Initialize local state from DB if resuming (answers are JSONB)
            if (testData.answers) setAnswers(testData.answers)
            // Restore current question index if resuming
            if (testData.current_question_index !== null && testData.current_question_index !== undefined) {
                setCurrentQuestionIndex(testData.current_question_index)
            }
            // Restore submitted questions (those that have been "checked")
            if (testData.submitted_questions && Array.isArray(testData.submitted_questions)) {
                // Rebuild feedback state for submitted questions
                const restoredFeedback = {}
                testData.submitted_questions.forEach(qId => {
                    const question = testData.questions.find(id => id === qId)
                    if (question && testData.answers && testData.answers[qId]) {
                        // We'll need to fetch the question to check if answer is correct
                        // For now, mark as submitted (we'll update this after questions load)
                        restoredFeedback[qId] = { isCorrect: null } // Placeholder
                    }
                })
                setFeedback(restoredFeedback)
            }
            // We need to add 'flags' column to DB if we want persistence, 
            // for now let's keep it local or assume it's part of metadata later.
            // Let's assume ephemeral for MVP or add to answers object if needed.

            // 2. Fetch Questions Details
            // testData.questions is array of IDs
            if (testData.questions && testData.questions.length > 0) {
                const { data: qData, error: qError } = await supabase
                    .from('questions')
                    .select('*')
                    .in('id', testData.questions)

                if (qError) throw qError

                // Sort qData to match the order in testData.questions
                const sortedQuestions = testData.questions.map(id => {
                    const q = qData.find(q => q.id === id)
                    if (!q) return null
                    return {
                        ...q,
                        options: {
                            A: q.option_a,
                            B: q.option_b,
                            C: q.option_c,
                            D: q.option_d,
                            E: q.option_e
                        },
                        correct_option: q.correct_answer
                    }
                }).filter(Boolean)
                setQuestionsData(sortedQuestions)

                // Now update feedback with correct/incorrect for submitted questions
                if (testData.submitted_questions && testData.submitted_questions.length > 0) {
                    const updatedFeedback = {}
                    testData.submitted_questions.forEach(qId => {
                        const question = sortedQuestions.find(q => q.id === qId)
                        if (question && testData.answers && testData.answers[qId]) {
                            updatedFeedback[qId] = {
                                isCorrect: testData.answers[qId] === question.correct_option
                            }
                        }
                    })
                    setFeedback(updatedFeedback)
                }
            }

        } catch (error) {
            console.error('Error fetching test:', error)
            alert('Error al cargar el examen.')
            navigate('/history')
        } finally {
            setLoading(false)
        }
    }

    // Auto-save interactions
    const saveProgress = useCallback(async (newAnswers, questionIndex = null) => {
        if (!test) return

        // Silent save - include current question index
        const updateData = { answers: newAnswers }
        if (questionIndex !== null) {
            updateData.current_question_index = questionIndex
        }

        const { error } = await supabase
            .from('tests')
            .update(updateData)
            .eq('id', test.id)

        if (error) console.error('Error saving progress:', error)
    }, [test])

    // Handlers
    const handleSelectOption = (optionKey) => {
        // Prevent changing answer if feedback already shown in Tutor Mode? 
        // Or allowing change until checked? Let's allow change until checked.
        const currentQ = questionsData[currentQuestionIndex]
        if (feedback[currentQ.id]) return

        const newAnswers = { ...answers, [currentQ.id]: optionKey }
        setAnswers(newAnswers)
        saveProgress(newAnswers)
    }

    const handleFlag = () => {
        const currentQ = questionsData[currentQuestionIndex]
        setFlags(prev => ({ ...prev, [currentQ.id]: !prev[currentQ.id] }))
    }

    const handleSubmitAnswer = async () => {
        // Only for TUTOR mode individual check
        const currentQ = questionsData[currentQuestionIndex]
        const selected = answers[currentQ.id]
        if (!selected) return

        const isCorrect = selected === currentQ.correct_option
        setFeedback(prev => ({
            ...prev,
            [currentQ.id]: { isCorrect }
        }))

        // Save to user_progress with selected_answer
        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser()
            console.log('🔐 Auth user:', user?.id, authError)

            if (user) {
                const insertData = {
                    user_id: user.id,
                    question_id: currentQ.id,
                    selected_answer: selected,
                    is_correct: isCorrect,
                    is_omitted: false,
                    is_flagged: !!flags[currentQ.id]
                }
                console.log('📝 Attempting to insert:', insertData)

                const { data: upsertData, error: upsertError } = await supabase
                    .from('user_progress')
                    .upsert(insertData)

                if (upsertError) {
                    console.error('❌ Upsert error:', upsertError)
                    throw upsertError
                }
                console.log('✅ Upsert successful:', upsertData)

                // Wait for trigger to complete (small delay to ensure DB trigger has fired)
                await new Promise(resolve => setTimeout(resolve, 500))

                // Fetch answer statistics
                const { data: stats } = await supabase
                    .from('answer_statistics')
                    .select('option_selected, count')
                    .eq('question_id', currentQ.id)

                if (stats) {
                    const statsObj = {}
                    stats.forEach(s => {
                        statsObj[s.option_selected] = s.count
                    })
                    setAnswerStats(prev => ({
                        ...prev,
                        [currentQ.id]: statsObj
                    }))
                }

                // Mark this question as submitted (locked)
                const { error: submitError } = await supabase
                    .from('tests')
                    .update({
                        submitted_questions: supabase.rpc('array_append', {
                            arr: test.submitted_questions || [],
                            elem: currentQ.id
                        })
                    })
                    .eq('id', test.id)

                if (submitError) {
                    console.error('Error marking question as submitted:', submitError)
                    // Fallback: use direct array update
                    const currentSubmitted = test.submitted_questions || []
                    if (!currentSubmitted.includes(currentQ.id)) {
                        await supabase
                            .from('tests')
                            .update({
                                submitted_questions: [...currentSubmitted, currentQ.id]
                            })
                            .eq('id', test.id)
                    }
                }
            } else {
                console.error('❌ No user found - not authenticated')
            }
        } catch (error) {
            console.error('💥 Error saving progress:', error)
        }
    }

    const handleFinishAttempt = () => {
        setShowFinishModal(true)
    }

    const confirmFinishTest = async () => {
        setLoading(true)
        try {
            // Calculate score (simple version)
            let correctCount = 0
            questionsData.forEach(q => {
                if (answers[q.id] === q.correct_option) correctCount++
            })
            const score = Math.round((correctCount / questionsData.length) * 100)

            const { error } = await supabase
                .from('tests')
                .update({
                    status: 'completed',
                    score: score
                })
                .eq('id', test.id)

            if (error) throw error
            navigate('/history')

        } catch (error) {
            console.error('Error finishing test:', error)
            alert('Error al finalizar el examen.')
            setLoading(false)
            setShowFinishModal(false)
        }
    }

    if (loading) return <div className="loading-screen">Cargando examen...</div>
    if (!test || questionsData.length === 0) return <div>No se encontraron preguntas.</div>

    const currentQuestion = questionsData[currentQuestionIndex]
    const unansweredCount = questionsData.length - Object.keys(answers).length

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', background: '#fff' }}>

            {/* Top Navigation Bar */}
            <div style={{
                height: '60px',
                borderBottom: '1px solid #eef2f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 2rem',
                flexShrink: 0
            }}>
                <button
                    onClick={() => navigate('/dashboard')}
                    style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#777', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem'
                    }}
                >
                    ← Volver al Dashboard
                </button>

                <div style={{ fontWeight: '600', color: '#333' }}>
                    {test.mode === 'timed' ? 'Modo: Con Tiempo' : 'Modo: Tutor'}
                </div>

                <button
                    onClick={handleFinishAttempt}
                    style={{
                        background: '#e53e3e', color: 'white', border: 'none',
                        padding: '0.5rem 1.5rem', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer'
                    }}
                >
                    Finalizar Examen
                </button>
            </div>

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* Left Sidebar */}
                <TestSidebar
                    questions={questionsData}
                    currentQuestionIndex={currentQuestionIndex}
                    answers={answers}
                    flags={flags}
                    feedback={feedback}
                    onNavigate={setCurrentQuestionIndex}
                />

                {/* Main Content */}
                <QuestionArea
                    question={currentQuestion}
                    currentIndex={currentQuestionIndex}
                    totalQuestions={questionsData.length}
                    selectedOption={answers[currentQuestion.id]}
                    isFlagged={!!flags[currentQuestion.id]}
                    testMode={test.mode}
                    feedback={feedback[currentQuestion.id]}
                    showFeedback={!!feedback[currentQuestion.id] || test.mode === 'review'}
                    answerStats={answerStats[currentQuestion.id]}

                    onNext={() => {
                        if (currentQuestionIndex < questionsData.length - 1) {
                            const newIndex = currentQuestionIndex + 1
                            setCurrentQuestionIndex(newIndex)
                            saveProgress(answers, newIndex)
                        }
                    }}
                    onPrev={() => {
                        if (currentQuestionIndex > 0) {
                            const newIndex = currentQuestionIndex - 1
                            setCurrentQuestionIndex(newIndex)
                            saveProgress(answers, newIndex)
                        }
                    }}
                    onFlag={handleFlag}
                    onSelectOption={handleSelectOption}
                    onSubmit={handleSubmitAnswer}
                />
            </div>

            {/* Confirmation Modal */}
            {showFinishModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'white', padding: '2rem', borderRadius: '12px', width: '400px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.2)', textAlign: 'center'
                    }}>
                        <h3 style={{ marginTop: 0, fontSize: '1.25rem', color: '#333' }}>¿Finalizar Examen?</h3>

                        {unansweredCount > 0 ? (
                            <p style={{ color: '#666', marginBottom: '2rem' }}>
                                Tienes <strong style={{ color: '#e53e3e' }}>{unansweredCount}</strong> preguntas sin responder. <br />
                                ¿Estás seguro de que deseas terminar?
                            </p>
                        ) : (
                            <p style={{ color: '#666', marginBottom: '2rem' }}>
                                Has respondido todas las preguntas. <br />
                                ¿Estás listo para ver tus resultados?
                            </p>
                        )}

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button
                                onClick={() => setShowFinishModal(false)}
                                style={{
                                    padding: '0.75rem 1.5rem', background: '#f0f0f0', border: 'none',
                                    borderRadius: '8px', color: '#555', fontWeight: '600', cursor: 'pointer'
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmFinishTest}
                                style={{
                                    padding: '0.75rem 1.5rem', background: '#4EBDDB', border: 'none',
                                    borderRadius: '8px', color: 'white', fontWeight: '600', cursor: 'pointer'
                                }}
                            >
                                Finalizar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default TestRunner
