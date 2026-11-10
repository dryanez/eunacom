import React, { useState, useEffect } from 'react'
import {
    ChevronLeft, MoreHorizontal, Flag, Lightbulb, ChevronRight,
    Zap, PlayCircle, Check, X, CheckCircle, AlertCircle, Flame, Award, Sparkles, Clock, GraduationCap
} from 'lucide-react'
import '../components/redesign/midnight.css'
import '../components/redesign/runner.css'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { saveTestProgress, completeTest, insertProgress, genId } from '../lib/api'
import { XP_PER_CORRECT, XP_PER_INCORRECT } from '../utils/xpSystem'
import LoadingScreen from '../components/LoadingScreen'
import LibroGordoUpsell from '../components/LibroGordoUpsell'

const TestRunner = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { user } = useAuth()
    const { isDark } = useTheme()
    const questions = location.state?.questions || []

    const isSimulation = !!location.state?.isSimulation
    const startFinished = !!location.state?.startFinished
    const mode = location.state?.mode || 'tutor'
    const isTutorMode = mode === 'tutor'
    // Libros Gordos online: modo bloqueado, sin volver al dashboard; { token, book, bookName, returnTo }
    const locked = location.state?.locked || null
    const exitPath = locked ? locked.returnTo : (location.state?.returnTo || '/dashboard')

    const [answers, setAnswers] = useState(location.state?.savedAnswers || {})
    const initTutorState = location.state?.tutorState || { firstAttempts: {}, wrongAttempts: {} }
    
    let firstUnanswered = -1
    if (questions && questions.length > 0) {
        for (let i = 0; i < questions.length; i++) {
            const qid = questions[i].id
            if (!(location.state?.savedAnswers || {})[qid] && !(initTutorState.firstAttempts || {})[qid]) {
                firstUnanswered = i
                break
            }
        }
    }
    const computedInitialIndex = firstUnanswered !== -1 
        ? Math.max(location.state?.savedIndex || 0, firstUnanswered)
        : (location.state?.savedIndex || 0)

    const [currentIndex, setCurrentIndex] = useState(computedInitialIndex)
    
    const initialWrongAttempts = Object.fromEntries(
        Object.entries(initTutorState.wrongAttempts || {}).map(([k,v]) => [k, new Set(v)])
    )
    
    const [firstAttempts, setFirstAttempts] = useState(initTutorState.firstAttempts || {}) // tutor mode: records first pick only (for scoring)
    const [wrongAttempts, setWrongAttempts] = useState(initialWrongAttempts) // tutor mode: { [questionId]: Set of wrong optionIds tried }
    const [fullscreenImage, setFullscreenImage] = useState(null)
    const [flaggedQuestions, setFlaggedQuestions] = useState(new Set())
    const [timeElapsed, setTimeElapsed] = useState(0)
    const timeLimitSeconds = location.state?.timeLimitSeconds || 0
    const [timeLeft, setTimeLeft] = useState(location.state?.timeLeftSeconds !== undefined ? location.state.timeLeftSeconds : timeLimitSeconds)
    const [isFinished, setIsFinished] = useState(startFinished)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showExitModal, setShowExitModal] = useState(false)
    const [showExplanation, setShowExplanation] = useState({}) // tutor mode: show explanation panel per question
    const [reviewAll, setReviewAll] = useState(false) // revisión final: ver también las correctas (claves + explicaciones de todo el tema)

    useEffect(() => { /* nothing to reset per question now */ }, [currentIndex])

    useEffect(() => {
        if (isFinished || questions.length === 0 || isTutorMode) return
        const timer = setInterval(() => {
            if (timeLimitSeconds > 0) {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timer)
                        document.getElementById('auto-submit-btn')?.click()
                        return 0
                    }
                    return prev - 1
                })
            } else {
                setTimeElapsed(prev => prev + 1)
            }
        }, 1000)
        return () => clearInterval(timer)
    }, [isFinished, questions.length, isTutorMode, timeLimitSeconds])

    const formatTime = (s) => {
        const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60
        return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
    }

    if (isSubmitting) return <LoadingScreen context="test" message="Finalizando y guardando tu examen..." />
    if (questions.length === 0) return <LoadingScreen context="test" message="Cargando preguntas del examen..." />

    const currentQuestion = questions[currentIndex]
    const totalQuestions = questions.length

    const handleSelectOption = (optionId) => {
        const isCorrect = optionId.toLowerCase() === currentQuestion.correctAnswer?.toLowerCase()
        const qid = currentQuestion.id

        if (isTutorMode) {
            // Record first attempt only for scoring
            if (!(qid in firstAttempts)) {
                setFirstAttempts(prev => ({ ...prev, [qid]: optionId }))
            }

            if (isCorrect) {
                // Lock on correct answer
                setAnswers(prev => ({ ...prev, [qid]: optionId }))
                setShowExplanation(prev => ({ ...prev, [qid]: true }))
            } else {
                // Add to wrong attempts — DO NOT update answers (keep last correct or null)
                setWrongAttempts(prev => {
                    const set = new Set(prev[qid] || [])
                    set.add(optionId)
                    return { ...prev, [qid]: set }
                })
                // Show hint after first wrong attempt
                setShowExplanation(prev => ({ ...prev, [qid]: true }))
            }
            
            // Save progress in tutor mode too
            if (location.state?.testId) {
                const newFirstAttempts = qid in firstAttempts ? firstAttempts : { ...firstAttempts, [qid]: optionId }
                const newWrongAttempts = isCorrect ? wrongAttempts : { 
                    ...wrongAttempts, 
                    [qid]: new Set([...(wrongAttempts[qid] || []), optionId]) 
                }
                const serializedWrongAttempts = Object.fromEntries(
                    Object.entries(newWrongAttempts).map(([k,v]) => [k, Array.from(v)])
                )
                const newAnswers = isCorrect ? { ...answers, [qid]: optionId } : answers
                const tutorState = { firstAttempts: newFirstAttempts, wrongAttempts: serializedWrongAttempts }
                saveTestProgress(location.state.testId, newAnswers, currentIndex, timeLeft, tutorState).catch(console.error)
            }
        } else {
            const newAnswers = { ...answers, [qid]: optionId }
            setAnswers(newAnswers)
            if (location.state?.testId) saveTestProgress(location.state.testId, newAnswers, currentIndex, timeLeft, null).catch(console.error)
        }
    }

    const getTutorState = () => {
        if (!isTutorMode) return null
        const serializedWrongAttempts = Object.fromEntries(
            Object.entries(wrongAttempts).map(([k,v]) => [k, Array.from(v)])
        )
        return { firstAttempts, wrongAttempts: serializedWrongAttempts }
    }

    const handleNext = async () => {
        if (currentIndex < totalQuestions - 1) {
            const nextIndex = currentIndex + 1
            setCurrentIndex(nextIndex)
            if (location.state?.testId) {
                saveTestProgress(location.state.testId, answers, nextIndex, timeLeft, getTutorState()).catch(console.error)
            }
        } else {
            setIsSubmitting(true)
            await finishTest()
            setIsFinished(true)
            setIsSubmitting(false)
        }
    }

    const finishTest = async () => {
        let score = 0
        const scoreSource = (isTutorMode && !startFinished) ? firstAttempts : answers
        questions.forEach(q => { if (scoreSource[q.id]?.toLowerCase() === q.correctAnswer?.toLowerCase()) score++ })
        const pct = Math.round((score / totalQuestions) * 100)

        if (location.state?.testId) {
            try {
                if (user) {
                    await completeTest(location.state.testId, answers, currentIndex, pct)
                    // Libro Gordo: el puntaje queda en tests; no se mezcla con el progreso del banco principal
                    if (!locked) for (const q of questions) {
                        const firstAns = isTutorMode ? firstAttempts[q.id] : answers[q.id]
                        const isCorrect = firstAns?.toLowerCase() === q.correctAnswer?.toLowerCase()
                        const isOmitted = !firstAns
                        await insertProgress(user.id, q.id, isCorrect, isOmitted).catch(() => {})
                    }
                }
            } catch (e) { console.error('Error finishing test:', e) }
        }
    }

    const handlePrev = () => { 
        if (currentIndex > 0) {
            const prevIndex = currentIndex - 1
            setCurrentIndex(prevIndex)
            if (location.state?.testId) {
                saveTestProgress(location.state.testId, answers, prevIndex, timeLeft, getTutorState()).catch(console.error)
            }
        }
    }

    const handleShowHint = () => {
        const qid = currentQuestion.id
        setShowExplanation(prev => ({ ...prev, [qid]: !prev[qid] }))
    }

    const handleSaveAndExit = async () => {
        setIsSubmitting(true)
        if (location.state?.testId) {
            const serializedWrongAttempts = Object.fromEntries(
                Object.entries(wrongAttempts).map(([k,v]) => [k, Array.from(v)])
            )
            const tutorState = isTutorMode ? { firstAttempts, wrongAttempts: serializedWrongAttempts } : null
            await saveTestProgress(location.state.testId, answers, currentIndex, timeLeft, tutorState).catch(console.error)
        }
        setIsSubmitting(false)
        setShowExitModal(false)
        navigate(exitPath)
    }

    const handleSubmitTest = async () => {
        setIsSubmitting(true)
        await finishTest()
        setIsFinished(true)
        setIsSubmitting(false)
    }

    if (isFinished) {
        let score = 0
        const results = questions.map(q => {
            const firstAns = (!startFinished && isTutorMode) ? firstAttempts[q.id] : answers[q.id]
            const userAns = firstAns
            const correct = userAns?.toLowerCase() === q.correctAnswer?.toLowerCase()
            if (correct) score++
            const userChoice = q.choices?.find(c => c.id === userAns)
            const correctChoice = q.choices?.find(c => c.id.toLowerCase() === q.correctAnswer?.toLowerCase())
            return { q, userAns, correct, omitted: !userAns, userChoice, correctChoice }
        })
        const pct = Math.round((score / totalQuestions) * 100)
        const wrongResults = results.filter(r => !r.correct)
        const reviewList = reviewAll ? results : wrongResults
        const incorrectCount = results.filter(r => !r.correct && !r.omitted).length
        const sessionXP = (score * XP_PER_CORRECT) + (incorrectCount * XP_PER_INCORRECT)

        const nIncorrect = results.filter(r => !r.correct && !r.omitted).length
        const nOmitted = results.filter(r => r.omitted).length
        const exitLabel = locked ? 'Volver a mi Libro Gordo' : location.state?.returnTo === '/mis-clases' ? 'Volver a Mis clases' : 'Volver al inicio'

        return (
            <div className="mn-res test-review-page">
                <div className="mn-res-hero">
                    <small>{locked ? `Libro Gordo · ${locked.bookName}` : isSimulation ? 'Simulacro EUNACOM' : 'Resultados'}</small>
                    <h1>{startFinished ? 'Revisión del examen' : 'Examen finalizado'}</h1>
                    {!startFinished && <div className="mn-res-time">Tiempo: {timeLimitSeconds > 0 ? formatTime(timeLimitSeconds - timeLeft) : formatTime(timeElapsed)}</div>}
                    <div className={`mn-res-pct ${pct >= 60 ? 'ok' : 'bad'}`}>{pct}%</div>
                    <div className="mn-res-sub">{score} de {totalQuestions} correctas</div>
                    {!startFinished && <div className="mn-res-xp"><Zap size={15} /> +{sessionXP} XP</div>}
                    <div className="mn-res-stats">
                        <div className="mn-res-stat ok"><b>{score}</b><span>Correctas</span></div>
                        <div className="mn-res-stat bad"><b>{nIncorrect}</b><span>Incorrectas</span></div>
                        <div className="mn-res-stat om"><b>{nOmitted}</b><span>Omitidas</span></div>
                    </div>
                </div>

                {locked && <LibroGordoUpsell bookName={locked.bookName} pct={pct} />}

                <div className="mn-res-box">
                    <div className="mn-res-box-h">Vista rápida · {totalQuestions} preguntas</div>
                    <div className="mn-res-grid">
                        {results.map((r, i) => {
                            const idx = reviewList.findIndex(wr => wr.q.id === r.q.id)
                            return (
                                <button key={r.q.id} type="button"
                                    className={r.correct ? 'ok' : r.omitted ? 'om' : 'bad'}
                                    title={`P${i + 1}: ${r.correct ? 'Correcta' : (r.omitted ? 'Omitida' : 'Incorrecta')}`}
                                    onClick={() => idx !== -1 && document.getElementById(`review-wrong-${idx}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>
                                    {i + 1}
                                </button>
                            )
                        })}
                    </div>
                    <div className="mn-res-legend">
                        <span><i style={{ background: '#34d399' }} />Correctas: {score}</span>
                        <span><i style={{ background: '#f87171' }} />Incorrectas: {nIncorrect}</span>
                        <span><i style={{ background: '#fbbf24' }} />Omitidas: {nOmitted}</span>
                    </div>
                </div>

                {results.length > 0 && (
                    <>
                        <div className="mn-res-rh">
                            <h2><AlertCircle size={20} /> {reviewAll ? `Claves y explicaciones (${results.length})` : `Preguntas para repasar (${wrongResults.length})`}</h2>
                            <button type="button" onClick={() => setReviewAll(v => !v)}>{reviewAll ? 'Ver solo las falladas' : 'Ver todas con explicación'}</button>
                        </div>
                        <div className="mn-res-list">
                            {reviewList.map(({ q, userChoice, omitted, correct }, i) => {
                                const qArea = [q.eunacomCode, q.category, q.topic || q.specialty, q.fuente === 'rs2026' ? 'Nueva 2026' : null].filter(Boolean).join(' · ') || q.topic || q.specialty || q.category || 'Medicina General'
                                return (
                                    <div key={q.id} id={`review-wrong-${i}`} className="mn-run-card" style={{ marginBottom: 0 }}>
                                        <div className="mn-run-tags" style={{ alignItems: 'center' }}>
                                            <span className="mn-res-n">#{i + 1}</span>
                                            <span className="mn-run-tag">{qArea}</span>
                                            <span className={`mn-res-st ${correct ? 'ok' : omitted ? 'om' : 'bad'}`}>
                                                {correct ? <><Check size={12} /> Correcta</> : omitted ? 'Omitida' : <><X size={12} /> Incorrecta</>}
                                            </span>
                                        </div>
                                        <p className="mn-run-q">{q.question}</p>
                                        {q.imageUrl && (
                                            <div className="mn-run-img" onClick={() => setFullscreenImage(q.imageUrl)}>
                                                <img src={q.imageUrl} alt="Pregunta" style={{ maxHeight: 280 }} />
                                                {q.imageNote && <div>{q.imageNote}{q.imageCredit ? ` · ${q.imageCredit}` : ''}</div>}
                                            </div>
                                        )}
                                        <div className="mn-run-opts">
                                            {q.choices?.map((opt, optIdx) => {
                                                const isCorrectOpt = opt.id.toLowerCase() === q.correctAnswer?.toLowerCase()
                                                const isUserPick = opt.id === userChoice?.id && !omitted
                                                const cls = isCorrectOpt ? 'ok' : isUserPick ? 'bad' : 'dim'
                                                return (
                                                    <div key={opt.id} className={`mn-run-opt ${cls}`} style={{ cursor: 'default' }}>
                                                        <span className="l">{isCorrectOpt ? <Check size={15} strokeWidth={2.5} /> : isUserPick ? <X size={15} strokeWidth={2.5} /> : (opt.id || String.fromCharCode(65 + optIdx))}</span>
                                                        <span className="t">{opt.text}</span>
                                                        {isCorrectOpt && <span className="tag">Respuesta correcta</span>}
                                                        {!isCorrectOpt && isUserPick && <span className="tag">Tu respuesta</span>}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                        {q.explanation && (
                                            <div className="mn-run-fb ok">
                                                <div className="mn-run-fb-h"><CheckCircle size={16} /> Retroalimentación clínica (Guías GES / MINSAL)</div>
                                                <p>{q.explanation}</p>
                                                {q.videoUrl && <a className="mn-run-video" href={q.videoUrl} target="_blank" rel="noopener noreferrer"><PlayCircle size={15} /> Ver clase en video</a>}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </>
                )}

                <button className="mn-run-nb pri" style={{ width: '100%' }} onClick={() => navigate(exitPath)}>{exitLabel}</button>

                {fullscreenImage && (
                    <div className="mn-run-zoom" onClick={() => setFullscreenImage(null)}><img src={fullscreenImage} alt="Imagen ampliada" /></div>
                )}
            </div>
        )
    }

    const areaBadge = [currentQuestion.category, currentQuestion.topic || currentQuestion.specialty, currentQuestion.fuente === 'rs2026' ? 'Nueva 2026' : null]
        .filter(Boolean)
        .join(' · ') || currentQuestion.topic || currentQuestion.specialty || currentQuestion.category || 'Medicina General'

    const isRecon = location.state?.testId?.includes('recon') || (currentQuestion.id && String(currentQuestion.id).includes('_q'))

    const highYieldBadge = locked
        ? { label: `Libro Gordo · ${locked.bookName}`, icon: <Award size={12} color="#f59e0b" /> }
        : isSimulation
        ? { label: 'Simulacro Oficial 180Q', icon: <Flame size={12} color="#f59e0b" /> }
        : isRecon
            ? { label: 'Reconstrucción EUNACOM', icon: <Award size={12} color="#f59e0b" /> }
            : isTutorMode
                ? { label: 'Modo Tutor Clínico', icon: <Sparkles size={12} color="#f59e0b" /> }
                : { label: 'Alta Frecuencia EUNACOM', icon: <Flame size={12} color="#f59e0b" /> }

    const qid = currentQuestion.id
    const tutorSolvedQ = isTutorMode && answers[qid]?.toLowerCase() === currentQuestion.correctAnswer?.toLowerCase()
    const wrongCountQ = isTutorMode ? (wrongAttempts[qid] || new Set()).size : 0
    const lowTime = timeLimitSeconds > 0 && timeLeft < 60
    const progressPct = ((currentIndex + 1) / totalQuestions) * 100
    const videoLink = currentQuestion.videoUrl && (
        <a className="mn-run-video" href={currentQuestion.videoUrl} target="_blank" rel="noopener noreferrer"><PlayCircle size={15} /> Ver clase en video</a>
    )

    return (
        <div className="mn-run">
            <button id="auto-submit-btn" style={{ display: 'none' }} onClick={() => {
                setIsSubmitting(true)
                finishTest().then(() => {
                    setIsFinished(true)
                    setIsSubmitting(false)
                    alert('¡El tiempo ha finalizado!')
                })
            }} />

            <div className="mn-run-top">
                <div className="mn-run-top-in">
                    <button className="mn-run-x" onClick={() => setShowExitModal(true)}><ChevronLeft size={17} /> Salir</button>
                    <div className="mn-run-ttl">
                        <small>{highYieldBadge.label}</small>
                        <b>{locked ? locked.bookName : (currentQuestion.topic || 'Práctica EUNACOM')}</b>
                    </div>
            <div className="mn-run-tools">
                        <button title="Marcar pregunta" className={flaggedQuestions.has(qid) ? 'on' : ''}
                            onClick={() => setFlaggedQuestions(prev => {
                                const next = new Set(prev)
                                if (next.has(qid)) next.delete(qid)
                                else next.add(qid)
                                return next
                            })}>
                            <Flag size={18} />
                        </button>
                        {!isSimulation && !isTutorMode && (
                            <button title="Ver explicación" className={showExplanation[qid] ? 'on-sky' : ''} onClick={handleShowHint}>
                                <Lightbulb size={19} />
                            </button>
                        )}
                    </div>
                    {isTutorMode
                        ? <span className="mn-run-clock tutor"><GraduationCap size={15} /><span className="txt">Tutor</span></span>
                        : <span className={`mn-run-clock ${lowTime ? 'low' : ''}`}><Clock size={14} /> {timeLimitSeconds > 0 ? formatTime(timeLeft) : formatTime(timeElapsed)}</span>}
                </div>
                <div className="mn-run-prog">
                    <span>Pregunta {currentIndex + 1} de {totalQuestions}</span>
                    <span className="bar"><i style={{ width: `${progressPct}%` }} /></span>
                    <span>{Math.round(progressPct)}%</span>
                </div>
            </div>

            <div className="mn-run-main test-runner-content">
                <div className="mn-run-card">
                    <div className="mn-run-tags">
                        <span className="mn-run-tag">{areaBadge}</span>
                    </div>

                    <p className="mn-run-q">{currentQuestion.question}</p>

                    {currentQuestion.imageUrl && (
                        <div className="mn-run-img" onClick={() => setFullscreenImage(currentQuestion.imageUrl)}>
                            <img src={currentQuestion.imageUrl} alt="Pregunta" />
                            {currentQuestion.imageNote && <div>{currentQuestion.imageNote}{currentQuestion.imageCredit ? ` · ${currentQuestion.imageCredit}` : ''}</div>}
                        </div>
                    )}

                    <div className="mn-run-opts">
                        {currentQuestion.choices.map((opt, i) => {
                            const isCorrectOpt = opt.id.toLowerCase() === currentQuestion.correctAnswer?.toLowerCase()
                            const isWrongAttempt = isTutorMode && (wrongAttempts[qid] || new Set()).has(opt.id)
                            const hasAnswered = !isTutorMode && !!answers[qid]
                            const isSelected = !isTutorMode && answers[qid] === opt.id
                            const isDisabled = (isTutorMode && (tutorSolvedQ || isWrongAttempt)) || (!isTutorMode && hasAnswered)
                            let cls = ''
                            if (isTutorMode) {
                                if (tutorSolvedQ && isCorrectOpt) cls = 'ok'
                                else if (isWrongAttempt) cls = 'bad'
                                else if (tutorSolvedQ) cls = 'dim'
                            } else if (isSelected) cls = 'sel'
                            const letter = opt.id || String.fromCharCode(65 + i)
                            return (
                                <button key={opt.id} className={`mn-run-opt ${cls}`} disabled={isDisabled}
                                    onClick={() => !isDisabled && handleSelectOption(opt.id)}>
                                    <span className="l">{cls === 'ok' ? <Check size={16} strokeWidth={2.5} /> : cls === 'bad' ? <X size={16} strokeWidth={2.5} /> : letter}</span>
                                    <span className="t">{opt.text}</span>
                                    {cls === 'bad' && <span className="tag">Incorrecta</span>}
                                    {cls === 'ok' && <span className="tag">Correcta</span>}
                                </button>
                            )
                        })}
                    </div>

                    {isTutorMode && tutorSolvedQ && (
                        <div className="mn-run-fb ok">
                            <div className="mn-run-fb-h">
                                <CheckCircle size={17} /> Retroalimentación clínica (Guías GES / MINSAL)
                                {wrongCountQ > 0 && <small>({wrongCountQ} intento{wrongCountQ > 1 ? 's' : ''} previo{wrongCountQ > 1 ? 's' : ''})</small>}
                            </div>
                            {currentQuestion.explanation && <p>{currentQuestion.explanation}</p>}
                            {videoLink}
                        </div>
                    )}
                    {isTutorMode && !tutorSolvedQ && wrongCountQ > 0 && (
                        <div className="mn-run-fb warn">
                            <div className="mn-run-fb-h">
                                <AlertCircle size={17} /> Respuesta incorrecta. Revisa el caso e inténtalo de nuevo
                                {!showExplanation[qid] && <button className="mn-run-hint" onClick={handleShowHint}><Lightbulb size={14} /> Ver pista</button>}
                            </div>
                            {showExplanation[qid] && currentQuestion.explanation && <p><strong>Pista clínica:</strong> {currentQuestion.explanation}</p>}
                            {showExplanation[qid] && videoLink}
                        </div>
                    )}
                    {!isTutorMode && showExplanation[qid] && currentQuestion.explanation && (
                        <div className="mn-run-fb ok">
                            <div className="mn-run-fb-h"><CheckCircle size={17} /> Retroalimentación clínica (Guías GES / MINSAL)</div>
                            <p>{currentQuestion.explanation}</p>
                            {videoLink}
                        </div>
                    )}
                </div>

                <div className="mn-run-nav">
                    <button className="mn-run-nb" onClick={handlePrev} disabled={currentIndex === 0}><ChevronLeft size={19} /> Anterior</button>
                    <button className="mn-run-nb pri" onClick={handleNext} disabled={isSubmitting}>
                        {isSubmitting ? 'Guardando…' : currentIndex < totalQuestions - 1 ? 'Siguiente' : 'Finalizar examen'} <ChevronRight size={19} />
                    </button>
                </div>
            </div>

            {fullscreenImage && (
                <div className="mn-run-zoom" onClick={() => setFullscreenImage(null)}><img src={fullscreenImage} alt="Imagen ampliada" /></div>
            )}

            {showExitModal && (
                <div className="mn-run-modal">
                    <div className="mn-run-modal-c">
                        <h2>¿Salir del examen?</h2>
                        <p>Puedes guardar tu progreso para continuar después, o terminar el test ahora.</p>
                        <div className="col">
                            <button className="mn-run-nb pri" onClick={handleSaveAndExit} disabled={isSubmitting}>{isSubmitting ? 'Guardando…' : 'Guardar y salir'}</button>
                            <button className="mn-run-nb" onClick={() => { setShowExitModal(false); handleSubmitTest(); }} disabled={isSubmitting}>Terminar test</button>
                            <button className="mn-run-nb" style={{ border: 0, background: '#0b1120', color: '#94a3b8' }} onClick={() => setShowExitModal(false)} disabled={isSubmitting}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default TestRunner
