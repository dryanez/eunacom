import React, { useState, useEffect } from 'react'
import {
  Flame, CheckCircle2, XCircle, ChevronRight, Sparkles,
  Trophy, ArrowRight, Zap, RefreshCw, X, ShieldAlert, Award
} from 'lucide-react'
import { insertProgress } from '../lib/api'
import { loadGamificationState, saveGamificationState, getTodayDateString } from '../utils/gamificationStore'
import '../styles/streakRisk.css'

const FALLBACK_QUESTIONS = [
  {
    id: 'streak_q1_cardio',
    topic: 'Cardiología',
    question: 'Hombre de 64 años con antecedente de HTA consulta por dolor torácico opresivo de 50 minutos de evolución irradiado a mandíbula y brazo izquierdo. ECG muestra supradesnivel del segmento ST de 3 mm en derivaciones V1 a V4. El centro asistencial no cuenta con pabellón de hemodinamia y el traslado al hospital base tomará 45 minutos. ¿Cuál es la conducta inicial prioritaria?',
    options: {
      a: 'Iniciar fibrinolisis inmediata con tenecteplasa en el centro actual',
      b: 'Trasladar de inmediato para angioplastia primaria (PCI) en hospital base',
      c: 'Indicar ecocardiograma transtorácico de urgencia antes de definir reperfusión',
      d: 'Administrar heparina no fraccionada en infusión y observar evolución del dolor',
      e: 'Indicar nitroglicerina sublingual seriada y esperar biomarcadores'
    },
    correctAnswer: 'b',
    explanation: 'En IAMCEST, la angioplastia primaria (PCI) es de elección si el tiempo desde el diagnóstico hasta el balón es < 120 minutos (aquí el traslado demora 45 min, por lo que se cumple holgadamente el criterio de < 120 min para PCI primaria).'
  },
  {
    id: 'streak_q2_resp',
    topic: 'Respiratorio',
    question: 'Mujer de 28 años asmática conocida consulta al servicio de urgencia por disnea y sibilancias audibles tras cuadro gripal. Al examen: FR 26 rpm, FC 102 lpm, SatO2 93% ambiental, uso leve de musculatura accesoria. Murmullo pulmonar con sibilancias espiratorias difusas. ¿Cuál es el pilar de tratamiento farmacológico de primera línea para esta crisis asmática moderada?',
    options: {
      a: 'Salbutamol en aerosol presurizado con aerocámara (4 a 8 puff cada 20 min) + Corticoide sistémico oral',
      b: 'Nebulización continua con Bromuro de Ipratropio exclusivo sin corticoides',
      c: 'Corticoides inhalados en dosis bajas y alta domiciliaria con reposo',
      d: 'Antibioterapia empírica con Amoxicilina/Clavulánico y control ambulatorio',
      e: 'Aminofilina endovenosa en bolo seguida de infusión continua'
    },
    correctAnswer: 'a',
    explanation: 'El manejo de primera línea en la crisis asmática moderada en urgencia consiste en Salbutamol MDI con aerocámara (4-8 puff cada 20 minutos durante la primera hora) asociado a Corticoide sistémico (prednisona 40-50 mg VO o hidrocortisona EV) para reducir la inflamación y prevenir recaídas.'
  },
  {
    id: 'streak_q3_infecto',
    topic: 'Infectología',
    question: 'Mujer de 32 años, cursando embarazo de 14 semanas, asintomática, en su control prenatal presenta urocultivo de rutina positivo para Escherichia coli > 100.000 UFC/ml sensible a cefalosporinas y nitrofurantoína. ¿Cuál es la indicación correcta?',
    options: {
      a: 'Tratar de inmediato con antibióticos guiados por antibiograma (ej. Cefuroximo o Nitrofurantoína)',
      b: 'No tratar por tratarse de una bacteriuria asintomática sin riesgo clínico',
      c: 'Repetir el urocultivo a las 28 semanas de gestación antes de indicar antibióticos',
      d: 'Indicar ciprofloxacino 500 mg cada 12 horas por 7 días',
      e: 'Indicar ingesta abundante de agua y ácido ascórbico como acidificante urinario'
    },
    correctAnswer: 'a',
    explanation: 'En la mujer embarazada, toda bacteriuria asintomática (BA) DEBE tratarse siempre con esquema antibiótico completo (ej. cefalosporinas de 1ra/2da generación o nitrofurantoína en 2do trimestre) debido al alto riesgo de progresar a pielonefritis aguda (20-40%), parto prematuro y bajo peso al nacer.'
  }
]

export default function StreakSaverModal({
  isOpen,
  onClose,
  userId,
  userFirstName = 'Colega',
  currentStreak = 3,
  onStreakSaved
}) {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false)
  const [answersLog, setAnswersLog] = useState([])
  const [isCompleted, setIsCompleted] = useState(false)
  const [savingProgress, setSavingProgress] = useState(false)

  // Load 3 quick high yield questions on open
  useEffect(() => {
    if (!isOpen) return

    setCurrentIndex(0)
    setSelectedOption(null)
    setIsAnswerSubmitted(false)
    setAnswersLog([])
    setIsCompleted(false)
    setLoading(true)

    const fetchQuickQuestions = async () => {
      try {
        const res = await fetch('/data/questionDB.json')
        if (res.ok) {
          const allQuestions = await res.json()
          if (Array.isArray(allQuestions) && allQuestions.length >= 3) {
            // Pick 3 diverse questions (Cardio, Resp, Infecto/Med Interna)
            const shuffled = [...allQuestions].sort(() => 0.5 - Math.random())
            const picked = shuffled.slice(0, 3).map((q, idx) => ({
              id: q.id || `quick_q_${idx}`,
              topic: q.topic || q.category || 'Medicina Interna',
              question: q.question || q.pregunta || '',
              options: q.options || {
                a: q.option_a || q.opcion_a,
                b: q.option_b || q.opcion_b,
                c: q.option_c || q.opcion_c,
                d: q.option_d || q.opcion_d,
                e: q.option_e || q.opcion_e
              },
              correctAnswer: (q.correctAnswer || q.respuesta_correcta || 'a').toLowerCase(),
              explanation: q.explanation || q.explicacion_correcta || 'Respuesta basada en guías clínicas y perfil de conocimientos EUNACOM.'
            }))
            setQuestions(picked)
            setLoading(false)
            return
          }
        }
        setQuestions(FALLBACK_QUESTIONS)
      } catch (err) {
        console.warn('Using fallback questions for streak rescue:', err)
        setQuestions(FALLBACK_QUESTIONS)
      } finally {
        setLoading(false)
      }
    }

    fetchQuickQuestions()
  }, [isOpen])

  if (!isOpen) return null

  const currentQ = questions[currentIndex] || FALLBACK_QUESTIONS[0]
  const isLastQuestion = currentIndex >= (questions.length - 1)

  const handleSelectOption = (key) => {
    if (isAnswerSubmitted) return
    setSelectedOption(key)
  }

  const handleConfirmAnswer = () => {
    if (!selectedOption || isAnswerSubmitted) return
    setIsAnswerSubmitted(true)

    const isCorrect = selectedOption.toLowerCase() === currentQ.correctAnswer.toLowerCase()
    setAnswersLog(prev => [...prev, {
      questionId: currentQ.id,
      isCorrect,
      selectedOption
    }])
  }

  const handleNext = async () => {
    if (!isLastQuestion) {
      setCurrentIndex(prev => prev + 1)
      setSelectedOption(null)
      setIsAnswerSubmitted(false)
    } else {
      // Finished all 3 questions!
      setSavingProgress(true)
      try {
        const uid = userId || 'guest_user'
        const today = getTodayDateString()

        // 1. Sync answers to user_progress in DB
        for (const ans of [...answersLog]) {
          try {
            await insertProgress(uid, ans.questionId, ans.isCorrect, false)
          } catch (e) {
            console.warn('Non-blocking progress insert error:', e)
          }
        }

        // 2. Update Gamification Store
        const gState = loadGamificationState(uid)
        let updatedStreak = gState.currentStreak || currentStreak || 1
        if (gState.lastStudyDate) {
          const lastDate = new Date(gState.lastStudyDate)
          const todayDate = new Date(today)
          const diffDays = Math.round((todayDate - lastDate) / (1000 * 60 * 60 * 24))
          if (diffDays >= 1) {
            updatedStreak += 1
          }
        } else {
          updatedStreak = Math.max(1, updatedStreak)
        }

        const nextState = {
          ...gState,
          currentStreak: updatedStreak,
          longestStreak: Math.max(gState.longestStreak || 1, updatedStreak),
          lastStudyDate: today,
          streakFrozen: false,
          xp: (gState.xp || 0) + 50,
          gems: (gState.gems || 0) + 15
        }
        await saveGamificationState(uid, nextState)

        setIsCompleted(true)
        if (onStreakSaved) {
          onStreakSaved({
            streak: updatedStreak,
            savedToday: true,
            answersCount: questions.length
          })
        }
      } catch (err) {
        console.error('Streak save error:', err)
        setIsCompleted(true)
      } finally {
        setSavingProgress(false)
      }
    }
  }

  return (
    <div className="streak-modal-overlay">
      <div className="streak-modal-card animate-streak-pop">
        {/* Ambient Top Glow */}
        <div className="streak-modal-ambient-glow" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="streak-modal-close-btn"
          title="Cerrar"
        >
          <X size={18} />
        </button>

        {!isCompleted ? (
          <>
            {/* Header */}
            <div className="streak-modal-header">
              <div className="streak-flame-badge-animated">
                <Flame size={20} className="flame-flicker" />
                <span>Racha en Riesgo</span>
              </div>
              <h2 className="streak-modal-title">
                Salva tu Racha de {currentStreak || 3} Días 🔥
              </h2>
              <p className="streak-modal-subtitle">
                "Solo necesitas responder 3 preguntas rápidas para mantener tu récord activo."
              </p>

              {/* Progress Bar 1/3, 2/3, 3/3 */}
              <div className="streak-step-indicator">
                <div className="streak-step-labels">
                  <span>Pregunta {currentIndex + 1} de {questions.length || 3}</span>
                  <span className="streak-step-xp">+50 XP al completar</span>
                </div>
                <div className="streak-step-bar-bg">
                  <div
                    className="streak-step-bar-fill"
                    style={{ width: `${((currentIndex + (isAnswerSubmitted ? 1 : 0.5)) / (questions.length || 3)) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Question Body */}
            {loading ? (
              <div className="streak-modal-loading">
                <RefreshCw size={28} className="animate-spin text-orange-500" />
                <p>Cargando preguntas de alta frecuencia...</p>
              </div>
            ) : (
              <div className="streak-modal-body">
                <div className="streak-question-tag">
                  <span>🩺 {currentQ.topic}</span>
                </div>

                <p className="streak-question-text">
                  {currentQ.question}
                </p>

                {/* Options List */}
                <div className="streak-options-list">
                  {Object.entries(currentQ.options || {}).map(([key, text]) => {
                    if (!text) return null
                    const isSelected = selectedOption === key
                    const isCorrect = key.toLowerCase() === currentQ.correctAnswer.toLowerCase()

                    let optionClass = 'streak-option-btn'
                    if (isAnswerSubmitted) {
                      if (isCorrect) optionClass += ' correct'
                      else if (isSelected && !isCorrect) optionClass += ' incorrect'
                      else optionClass += ' dim'
                    } else if (isSelected) {
                      optionClass += ' selected'
                    }

                    return (
                      <button
                        key={key}
                        onClick={() => handleSelectOption(key)}
                        disabled={isAnswerSubmitted}
                        className={optionClass}
                      >
                        <span className="streak-opt-key">{key.toUpperCase()}</span>
                        <span className="streak-opt-text">{text}</span>
                        {isAnswerSubmitted && isCorrect && (
                          <CheckCircle2 size={18} className="streak-opt-icon text-emerald-400" />
                        )}
                        {isAnswerSubmitted && isSelected && !isCorrect && (
                          <XCircle size={18} className="streak-opt-icon text-rose-400" />
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Explanation Card */}
                {isAnswerSubmitted && (
                  <div className="streak-explanation-card animate-fade-in">
                    <div className="streak-expl-header">
                      <Sparkles size={16} color="#f97316" />
                      <strong>Justificación Clínica EUNACOM:</strong>
                    </div>
                    <p className="streak-expl-text">
                      {currentQ.explanation}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Footer Action */}
            <div className="streak-modal-footer">
              {!isAnswerSubmitted ? (
                <button
                  onClick={handleConfirmAnswer}
                  disabled={!selectedOption || loading}
                  className="streak-confirm-btn"
                >
                  <span>Confirmar Respuesta</span>
                  <ArrowRight size={18} />
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={savingProgress}
                  className="streak-next-btn"
                >
                  {savingProgress ? (
                    <span>Guardando progreso...</span>
                  ) : isLastQuestion ? (
                    <>
                      <span>¡Completar y Salvar Racha! 🎉</span>
                      <Zap size={18} />
                    </>
                  ) : (
                    <>
                      <span>Siguiente Pregunta</span>
                      <ChevronRight size={18} />
                    </>
                  )}
                </button>
              )}
            </div>
          </>
        ) : (
          /* Victory Celebration Screen */
          <div className="streak-victory-container animate-fade-in">
            <div className="streak-victory-flame-hero">
              <span className="victory-fire-emoji">🔥</span>
              <div className="victory-halo-glow" />
            </div>

            <div className="streak-victory-badge">
              <Trophy size={16} color="#fbbf24" />
              <span>¡RÉCORD SALVADO!</span>
            </div>

            <h2 className="streak-victory-title">
              ¡Racha Protegida con Éxito!
            </h2>

            <p className="streak-victory-desc">
              Completaste tus 3 preguntas diarias. Tu récord de <strong>{currentStreak + 1} días consecutivos</strong> sigue activo y blindado hasta mañana.
            </p>

            <div className="streak-rewards-row">
              <div className="streak-reward-chip gems">
                <Award size={18} color="#38bdf8" />
                <span>+50 XP Ganados</span>
              </div>
              <div className="streak-reward-chip flame">
                <Flame size={18} color="#f97316" />
                <span>Racha: {currentStreak + 1} Días</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="streak-victory-done-btn"
            >
              <span>¡Continuar Estudiando!</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
