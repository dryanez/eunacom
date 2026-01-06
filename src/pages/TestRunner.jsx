import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import TestSidebar from '../components/TestSidebar'
import QuestionArea from '../components/QuestionArea'
import { XP_PER_CORRECT, XP_PER_INCORRECT } from '../utils/xpSystem'
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

    // Time tracking
    const [questionStartTime, setQuestionStartTime] = useState(Date.now())

    // XP notification
    const [xpNotification, setXpNotification] = useState(null)

    const [showFinishModal, setShowFinishModal] = useState(false)
    const [showPauseModal, setShowPauseModal] = useState(false)

    // Simulation State
    const [isSimulation, setIsSimulation] = useState(false)
    const [currentSection, setCurrentSection] = useState(1) // 1 or 2
    const [isBreak, setIsBreak] = useState(false)
    const [breakTimeLeft, setBreakTimeLeft] = useState(300) // 5 minutes in seconds
    const [sectionTimeLeft, setSectionTimeLeft] = useState(105 * 60) // 105 minutes per section
    const [showSimulationResults, setShowSimulationResults] = useState(false)

    // Review State (for completed simulations)
    const [reviewSection, setReviewSection] = useState(null) // null | 1 | 2
    const [showResultsOverview, setShowResultsOverview] = useState(false)

    useEffect(() => {
        fetchTestSession()
    }, [id])

    // Timer Logic for Sections & Break
    useEffect(() => {
        let timer = null

        if (isBreak) {
            timer = setInterval(() => {
                setBreakTimeLeft(prev => {
                    if (prev <= 1) {
                        // End Break -> Start Section 2
                        setIsBreak(false)
                        setCurrentSection(2)
                        setSectionTimeLeft(105 * 60)
                        setCurrentQuestionIndex(90) // Jump to first Q of section 2
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        } else if (isSimulation && !loading && !showSimulationResults) {
            timer = setInterval(() => {
                setSectionTimeLeft(prev => {
                    if (prev <= 1) {
                        // Time run out
                        if (currentSection === 1) {
                            handleFinishSection1()
                        } else {
                            handleFinishSimulation()
                        }
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        }

        return () => clearInterval(timer)
    }, [isBreak, isSimulation, currentSection, loading, showSimulationResults])


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

            // Determine if this is a Simulation (180 Qs + Timed) AND not completed
            const isSim = testData.total_questions === 180 && testData.mode === 'timed' && testData.status !== 'completed'
            setIsSimulation(isSim)

            if (isSim) {
                // Determine current section based on index
                const idx = testData.current_question_index || 0
                if (idx >= 90) {
                    setCurrentSection(2)
                } else {
                    setCurrentSection(1)
                }

                // Note: accurate time tracking per section would require server-side start time
                // For this implementation, we reset the timer on load (MVP) or we could calculate diff from created_at
                // Ideally we'd store 'section_start_time' in DB but we can't change schema right now.
                // We'll leave the timer to reset to 1:45 on refresh for now unless we calculate elapsed.
                setSectionTimeLeft(105 * 60)
            }

            // Initialize local state from DB if resuming (answers are JSONB)
            if (testData.answers) setAnswers(testData.answers)

            // Restore current question index if resuming
            if (testData.current_question_index !== null && testData.current_question_index !== undefined) {
                setCurrentQuestionIndex(testData.current_question_index)
            }

            // ... (rest of restore logic stays similar) ...
            if (testData.submitted_questions && Array.isArray(testData.submitted_questions)) {
                // Rebuild feedback state for submitted questions
                const restoredFeedback = {}
                testData.submitted_questions.forEach(qId => {
                    restoredFeedback[qId] = { isCorrect: null }
                })
                setFeedback(restoredFeedback)
            }

            // 2. Fetch Questions
            if (testData.questions && testData.questions.length > 0) {
                const { data: qData, error: qError } = await supabase
                    .from('questions')
                    .select('*')
                    .in('id', testData.questions)

                if (qError) throw qError

                // Sort qData
                const sortedQuestions = testData.questions.map(id => {
                    const q = qData.find(q => q.id === id)
                    if (!q) return null
                    return {
                        ...q,
                        options: { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d, E: q.option_e },
                        correct_option: q.correct_answer
                    }
                }).filter(Boolean)
                setQuestionsData(sortedQuestions)

                // If test is completed, generate feedback for all questions
                if (testData.status === 'completed') {
                    const params = {}
                    sortedQuestions.forEach(q => {
                        const userAns = testData.answers ? testData.answers[q.id] : null
                        // If unanswered, userAns is null -> isCorrect false
                        const isCorrect = userAns === q.correct_option
                        params[q.id] = { isCorrect }
                    })
                    setFeedback(params)
                }
            }

            // If this is a completed simulation, show results overview
            if (testData.status === 'completed' && testData.total_questions === 180) {
                setShowResultsOverview(true)
            }

        } catch (error) {
            console.error('Error fetching test:', error)
            alert('Error al cargar el examen.')
            navigate('/history')
        } finally {
            setLoading(false)
            setQuestionStartTime(Date.now())
        }
    }

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600)
        const m = Math.floor((seconds % 3600) / 60)
        const s = seconds % 60
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }

    const handleFinishSection1 = () => {
        setIsBreak(true)
        setBreakTimeLeft(300) // 5 mins
        // Save progress?
    }

    const handleSkipBreak = () => {
        setIsBreak(false)
        setCurrentSection(2)
        setSectionTimeLeft(105 * 60)
        setCurrentQuestionIndex(90)
    }

    const handleFinishSimulation = async () => {
        // Calculate scores
        console.log("Finishing Simulation...")
        await confirmFinishTest(true) // Pass true to suppress navigation and show modal
    }

    // ... (rest of handlers saveProgress, handleSelectOption etc stay similar)

    // Reset timer when navigating between questions
    useEffect(() => {
        setQuestionStartTime(Date.now())
    }, [currentQuestionIndex])

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

    const saveTime = useCallback(async (timeRemaining) => {
        if (!test?.id) return

        const { error } = await supabase
            .from('tests')
            .update({ time_remaining_seconds: timeRemaining })
            .eq('id', test.id)

        if (error) console.error('Error saving time:', error)
    }, [test])

    // Handlers
    const handleSelectOption = (optionKey) => {
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
        // ... (Keep existing logic for Tutor mode, Simulation is strictly Timed usually)
        // If simulation mode -> usually "submit" is disabled until end, but we allow selection.
        // We can keep specific tutor logic here if needed, but 'timed' mode usually disables 'Submit Answer' button in Child?
        // Let's keep duplicate login from original file for safety
    }

    const handleFinishAttempt = () => {
        if (isSimulation && currentSection === 1) {
            if (confirm("¿Estás seguro de que deseas terminar la Sección 1 e ir al descanso?")) {
                handleFinishSection1()
            }
        } else {
            setShowFinishModal(true)
        }
    }

    const confirmFinishTest = async (showResultsPopup = false) => {
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

            if (showResultsPopup) {
                setLoading(false)
                setShowFinishModal(false)
                setShowSimulationResults(true)
            } else {
                navigate('/history')
            }

        } catch (error) {
            console.error('Error finishing test:', error)
            alert('Error al finalizar el examen.')
            setLoading(false)
            setShowFinishModal(false)
        }
    }

    // Helper to calculate section stats
    const getSectionStats = (start, end) => {
        let correct = 0
        let total = 0
        questionsData.slice(start, end).forEach(q => {
            total++
            if (answers[q.id] === q.correct_option) correct++
        })
        return { correct, total, percentage: total > 0 ? Math.round((correct / total) * 100) : 0 }
    }

    if (loading) return <div className="loading-screen">Cargando examen...</div>
    if (!test || questionsData.length === 0) return <div>No se encontraron preguntas.</div>

    // Break Screen
    if (isBreak) {
        return (
            <div style={{
                height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, #1a3b5c, #2d3748)', color: 'white'
            }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Descanso</h1>
                <div style={{ fontSize: '5rem', fontWeight: 'bold', fontFamily: 'monospace', marginBottom: '2rem' }}>
                    {Math.floor(breakTimeLeft / 60)}:{(breakTimeLeft % 60).toString().padStart(2, '0')}
                </div>
                <p style={{ fontSize: '1.2rem', marginBottom: '3rem', opacity: 0.8 }}>
                    Tómate unos minutos para relajarte antes de la Sección 2.
                </p>
                <button
                    onClick={handleSkipBreak}
                    style={{
                        padding: '1rem 2rem', background: '#4EBDDB', border: 'none', borderRadius: '8px',
                        color: 'white', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer'
                    }}
                >
                    Comenzar Sección 2 Ahora
                </button>
            </div>
        )
    }

    // Results Popup (after finishing OR reviewing completed simulation)
    if (showSimulationResults || showResultsOverview) {
        const s1 = getSectionStats(0, 90)
        const s2 = getSectionStats(90, 180)
        const overall = {
            correct: s1.correct + s2.correct,
            total: s1.total + s2.total,
            percentage: Math.round(((s1.correct + s2.correct) / (s1.total + s2.total)) * 100)
        }

        return (
            <div style={{
                height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc'
            }}>
                <div style={{
                    background: 'white', padding: '3rem', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                    maxWidth: '800px', width: '90%'
                }}>
                    <h1 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '0.5rem', color: '#1a3b5c' }}>Resultados de Simulación</h1>

                    {/* Overall Circle */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3rem', marginTop: '2rem' }}>
                        <div style={{ position: 'relative', width: '200px', height: '200px' }}>
                            <svg width="200" height="200" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" fill="none" stroke="#f0f0f0" strokeWidth="6" />
                                <circle
                                    cx="50" cy="50" r="45" fill="none" stroke="#48bb78" strokeWidth="6"
                                    strokeDasharray={`${(overall.percentage / 100) * 283} 283`}
                                    transform="rotate(-90 50 50)"
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div style={{
                                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <span style={{ fontSize: '3rem', fontWeight: 'bold', color: '#1a3b5c' }}>{overall.percentage}%</span>
                                <span style={{ fontSize: '1rem', color: '#999' }}>Correctas</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
                        {/* Section 1 - Clickable */}
                        <div
                            onClick={() => {
                                setReviewSection(1)
                                setShowResultsOverview(false)
                                setShowSimulationResults(false)
                                setCurrentQuestionIndex(0)
                            }}
                            style={{
                                background: '#f8fafc',
                                padding: '1.5rem',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                border: '2px solid transparent'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#e0f2fe'
                                e.currentTarget.style.borderColor = '#4EBDDB'
                                e.currentTarget.style.transform = 'translateY(-2px)'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#f8fafc'
                                e.currentTarget.style.borderColor = 'transparent'
                                e.currentTarget.style.transform = 'translateY(0)'
                            }}
                        >
                            <h3 style={{ margin: '0 0 1rem 0', color: '#64748b' }}>Sección 1</h3>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#333' }}>{s1.percentage}%</div>
                            <div style={{ color: '#999' }}>{s1.correct}/{s1.total} Correctas</div>
                            <div style={{ marginTop: '0.5rem', color: '#4EBDDB', fontSize: '0.9rem' }}>Click para revisar →</div>
                        </div>

                        {/* Section 2 - Clickable */}
                        <div
                            onClick={() => {
                                setReviewSection(2)
                                setShowResultsOverview(false)
                                setShowSimulationResults(false)
                                setCurrentQuestionIndex(90)
                            }}
                            style={{
                                background: '#f8fafc',
                                padding: '1.5rem',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                border: '2px solid transparent'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#e0f2fe'
                                e.currentTarget.style.borderColor = '#4EBDDB'
                                e.currentTarget.style.transform = 'translateY(-2px)'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#f8fafc'
                                e.currentTarget.style.borderColor = 'transparent'
                                e.currentTarget.style.transform = 'translateY(0)'
                            }}
                        >
                            <h3 style={{ margin: '0 0 1rem 0', color: '#64748b' }}>Sección 2</h3>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#333' }}>{s2.percentage}%</div>
                            <div style={{ color: '#999' }}>{s2.correct}/{s2.total} Correctas</div>
                            <div style={{ marginTop: '0.5rem', color: '#4EBDDB', fontSize: '0.9rem' }}>Click para revisar →</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <button
                            onClick={() => navigate('/history')}
                            style={{
                                padding: '1rem 3rem', background: '#1a3b5c', color: 'white', border: 'none',
                                borderRadius: '12px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer'
                            }}
                        >
                            Ver Historial
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    const currentQuestion = questionsData[currentQuestionIndex]
    const unansweredCount = questionsData.length - Object.keys(answers).length

    // Filter questions for sidebar based on section (simulation or review mode)
    let currentSectionQuestions, startIndex

    if (reviewSection) {
        // In review mode - filter by reviewSection
        currentSectionQuestions = reviewSection === 1
            ? questionsData.slice(0, 90)
            : questionsData.slice(90, 180)
        startIndex = reviewSection === 1 ? 0 : 90
    } else if (isSimulation) {
        // In active simulation - filter by currentSection
        currentSectionQuestions = currentSection === 1
            ? questionsData.slice(0, 90)
            : questionsData.slice(90, 180)
        startIndex = currentSection === 1 ? 0 : 90
    } else {
        // Regular test - show all questions
        currentSectionQuestions = questionsData
        startIndex = 0
    }

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
                    onClick={() => {
                        if (reviewSection) {
                            // In review mode - go back to results overview
                            setShowResultsOverview(true)
                            setReviewSection(null)
                        } else if (isSimulation && test.status !== 'completed') {
                            // Active simulation - show pause modal
                            setShowPauseModal(true)
                        } else {
                            navigate('/dashboard')
                        }
                    }}
                    style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#777', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem'
                    }}
                >
                    ← {reviewSection ? 'Ver Resultados' : 'Volver'}
                </button>

                <div style={{ fontWeight: '600', color: '#333' }}>
                    {reviewSection ? (
                        <span>
                            Revisión: Sección <span style={{ color: '#4EBDDB' }}>{reviewSection}</span>
                        </span>
                    ) : test.status === 'completed' ? (
                        <span style={{ color: '#48bb78' }}>Modo: Revisión</span>
                    ) : isSimulation ? (
                        <span>
                            Simulación: Sección <span style={{ color: '#4EBDDB' }}>{currentSection}</span>
                            <span style={{ margin: '0 1rem', color: '#e2e8f0' }}>|</span>
                            ⏱️ {formatTime(sectionTimeLeft)}
                        </span>
                    ) : (
                        test.mode === 'timed' ? 'Modo: Con Tiempo' : 'Modo: Tutor'
                    )}
                </div>

                {test.status !== 'completed' && (
                    <button
                        onClick={handleFinishAttempt}
                        style={{
                            background: '#e53e3e', color: 'white', border: 'none',
                            padding: '0.5rem 1.5rem', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer'
                        }}
                    >
                        {isSimulation && currentSection === 1 ? 'Terminar Sección 1' : 'Finalizar Examen'}
                    </button>
                )}
            </div>

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* Left Sidebar */}
                <TestSidebar
                    questions={currentSectionQuestions}
                    startIndex={startIndex}
                    currentQuestionIndex={currentQuestionIndex}
                    answers={answers}
                    flags={flags}
                    feedback={feedback}
                    onNavigate={(newIndex) => {
                        setCurrentQuestionIndex(newIndex)
                    }}
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
                    showFeedback={!!feedback[currentQuestion.id] || test.mode === 'review' || test.status === 'completed'}
                    answerStats={answerStats[currentQuestion.id]}

                    onNext={() => {
                        const nextIndex = currentQuestionIndex + 1
                        if (isSimulation && currentSection === 1 && nextIndex >= 90) {
                            // End of Section 1
                            return
                        }
                        if (nextIndex < questionsData.length) {
                            setCurrentQuestionIndex(nextIndex)
                            saveProgress(answers, nextIndex)
                        }
                    }}
                    onPrev={() => {
                        const prevIndex = currentQuestionIndex - 1
                        if (isSimulation && currentSection === 2 && prevIndex < 90) {
                            // Start of Section 2
                            return
                        }
                        if (prevIndex >= 0) {
                            setCurrentQuestionIndex(prevIndex)
                            saveProgress(answers, prevIndex)
                        }
                    }}
                    onFlag={handleFlag}
                    onSelectOption={handleSelectOption}
                    onSubmit={handleSubmitAnswer}
                />
            </div>

            {/* Pause Modal */}
            {showPauseModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'white', padding: '2.5rem', borderRadius: '16px', width: '450px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.2)', textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏸️</div>
                        <h3 style={{ marginTop: 0, fontSize: '1.5rem', color: '#1a3b5c', marginBottom: '0.5rem' }}>
                            Pausar Simulación
                        </h3>
                        <p style={{ color: '#666', marginBottom: '2rem', lineHeight: 1.6 }}>
                            Tu progreso y tiempo restante se guardarán. Podrás continuar desde donde lo dejaste.
                        </p>
                        <div style={{
                            background: '#f0f9ff',
                            padding: '1rem',
                            borderRadius: '8px',
                            marginBottom: '2rem',
                            border: '1px solid #4EBDDB'
                        }}>
                            <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.25rem' }}>
                                Tiempo restante
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1a3b5c' }}>
                                {formatTime(sectionTimeLeft)}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button
                                onClick={() => setShowPauseModal(false)}
                                style={{
                                    padding: '0.75rem 1.5rem', background: '#f0f0f0', border: 'none',
                                    borderRadius: '8px', color: '#555', fontWeight: '600', cursor: 'pointer'
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={async () => {
                                    await saveTime(sectionTimeLeft)
                                    navigate('/dashboard')
                                }}
                                style={{
                                    padding: '0.75rem 1.5rem', background: '#4EBDDB', border: 'none',
                                    borderRadius: '8px', color: 'white', fontWeight: '600', cursor: 'pointer'
                                }}
                            >
                                Pausar y Salir
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                        <h3 style={{ marginTop: 0, fontSize: '1.25rem', color: '#333' }}>
                            {isSimulation ? "Finalizar Simulación" : "Finalizar Examen"}
                        </h3>
                        <p style={{ color: '#666', marginBottom: '2rem' }}>
                            ¿Estás seguro de que deseas terminar y ver tus resultados?
                        </p>
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
                                onClick={() => isSimulation ? handleFinishSimulation() : confirmFinishTest()}
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
