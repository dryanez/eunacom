import React, { useState } from 'react'
import {
  Clock, LightbulbOff, PlayCircle, Award, ShieldCheck, Target, BarChart3
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useSubscription } from '../contexts/SubscriptionContext'
import PaymentModal from '../components/PaymentModal'
import LoadingScreen from '../components/LoadingScreen'
import LoginGateModal from '../components/LoginGateModal'
import { createTest, genId } from '../lib/api'
import { getQuestionDB } from '../lib/questionDB'
import '../components/redesign/midnight.css'
import '../components/redesign/clase.css'
import '../components/redesign/sim-recon.css'

const Simulation = () => {
    const navigate = useNavigate()
    const { user } = useAuth()
    const { isPremium, hasExceededSimulations, freemiumMode } = useSubscription()
    const [isStarting, setIsStarting] = useState(false)
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [showLoginGate, setShowLoginGate] = useState(false)

    if (isStarting) return <LoadingScreen context="test" message="Generando Simulacro EUNACOM (180 preguntas)..." />

    const blueprint = [
        { name: 'Medicina Interna', qty: 54, percent: 30, color: '#38bdf8', category: 'Medicina Interna' },
        { name: 'Cirugía y Anestesia', qty: 27, percent: 15, color: '#34d399', category: 'Cirugía' },
        { name: 'Pediatría', qty: 27, percent: 15, color: '#fbbf24', category: 'Pediatría' },
        { name: 'Ginecología y Obstetricia', qty: 27, percent: 15, color: '#c084fc', category: 'Ginecología' },
        { name: 'Salud Pública y Psiquiatría', qty: 36, percent: 20, color: '#f87171', category: 'Salud Pública' },
    ]

    const handleStartSimulation = async () => {
        if (!user) {
            setShowLoginGate(true)
            return
        }
        const isLocked = freemiumMode === 'strict' ? !isPremium : hasExceededSimulations;
        if (isLocked) {
            setShowPaymentModal(true)
            return
        }
        
        setIsStarting(true)
        try {
            const questionDB = await getQuestionDB()

            // Build 180-question exam from blueprint proportions
            const picked = []
            for (const area of blueprint) {
                const categoryQuestions = questionDB.filter(q =>
                    q.category && q.category.toLowerCase().includes(area.category.toLowerCase())
                )
                const shuffled = [...categoryQuestions].sort(() => Math.random() - 0.5)
                picked.push(...shuffled.slice(0, area.qty))
            }

            // If we don't have enough questions, fill remaining from any category
            if (picked.length < 180) {
                const pickedIds = new Set(picked.map(q => q.id))
                const remaining = questionDB.filter(q => !pickedIds.has(q.id)).sort(() => Math.random() - 0.5)
                picked.push(...remaining.slice(0, 180 - picked.length))
            }

            // Final shuffle
            const finalQuestions = picked.sort(() => Math.random() - 0.5).slice(0, 180)
            const questionIds = finalQuestions.map(q => q.id)
            const testId = genId()

            await createTest({
                id: testId,
                userId: user.id,
                mode: 'simulation',
                timeLimitSeconds: 4 * 60 * 60, // 4 hours
                totalQuestions: finalQuestions.length,
                questions: questionIds
            })

            navigate('/test-runner', { state: { testId, questions: finalQuestions, isSimulation: true } })
        } catch (err) {
            alert('Error al iniciar simulación: ' + (err.message || String(err)))
        } finally {
            setIsStarting(false)
        }
    }

    const conditions = [
        { icon: Clock, title: '4 Horas (240 min)', sub: '1.33 min / pregunta', text: 'Tiempo cronometrado idéntico al examen real para entrenar el ritmo de respuesta y control de fatiga.' },
        { icon: LightbulbOff, title: 'Modo Ciego Real', sub: 'Sin pistas ni ayudas', text: 'Sin retroalimentación instantánea para medir tu nivel real. La pauta completa se libera al finalizar.' },
        { icon: Target, title: 'Blueprint Oficial', sub: 'Ponderación exacta', text: 'Distribución rigurosa según el porcentaje oficial de preguntas establecido por ASOFAMECH.' },
    ]

    return (
        <div className="sr-page">
            {/* Hero */}
            <div className="mn-cl-hero">
                <div className="sr-hero-row">
                    <div className="sr-hero-ic"><Award size={24} /></div>
                    <div className="sr-hero-main">
                        <div className="mn-cl-eyebrow">Simulación · Algoritmo ASOFAMECH</div>
                        <h1 className="mn-cl-title">Simulación Oficial EUNACOM 2026</h1>
                        <div className="mn-cl-chips">
                            <span className="mn-cl-chip"><BarChart3 size={13} /> 180 preguntas ponderadas</span>
                            <span className="mn-cl-chip"><Clock size={13} /> 4 horas cronometradas</span>
                            <span className="mn-cl-chip"><LightbulbOff size={13} /> Sin pistas durante la prueba</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Condiciones */}
            <div className="sr-conds">
                {conditions.map(c => (
                    <div key={c.title} className="sr-card sr-cond">
                        <div className="sr-cond-top">
                            <div className="sr-ic"><c.icon size={20} /></div>
                            <div><b>{c.title}</b><span>{c.sub}</span></div>
                        </div>
                        <p>{c.text}</p>
                    </div>
                ))}
            </div>

            {/* Blueprint */}
            <div className="sr-sec sr-card">
                <div className="sr-sec-head">
                    <h3>Distribución Oficial del Examen (Blueprint)</h3>
                    <span className="sr-pill"><BarChart3 size={11} /> 100% Ponderado</span>
                    <p>Proporción exacta de 180 preguntas en las 5 grandes especialidades médicas</p>
                </div>

                <div className="sr-seg">
                    {blueprint.map(area => (
                        <i
                            key={area.name}
                            style={{ width: `${area.percent}%`, background: area.color }}
                            title={`${area.name}: ${area.percent}% (${area.qty} preguntas)`}
                        />
                    ))}
                </div>

                <div className="sr-bp">
                    {blueprint.map(area => (
                        <div key={area.name} className="sr-bp-row">
                            <span className="sr-dot" style={{ background: area.color }} />
                            <div className="sr-bp-t">
                                <b>{area.name}</b>
                                <span>{area.qty} preguntas</span>
                            </div>
                            <span className="sr-bp-pct" style={{ color: area.color }}>{area.percent}%</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Lanzar */}
            <div className="sr-launch">
                <button
                    className="mn-cl-nb pri"
                    onClick={handleStartSimulation}
                    disabled={isStarting}
                    style={{ cursor: isStarting ? 'wait' : 'pointer' }}
                >
                    <PlayCircle size={22} /> {isStarting ? 'Generando simulación...' : 'Iniciar Simulación Oficial EUNACOM'}
                </button>
                <div className="sr-note">
                    <ShieldCheck size={14} /> Tu resultado oficial y análisis de fortalezas/debilidades se guardará en tu perfil.
                </div>
            </div>

            {showPaymentModal && <PaymentModal onClose={() => setShowPaymentModal(false)} />}
            {showLoginGate && <LoginGateModal onClose={() => setShowLoginGate(false)} message="Inicia sesión o regístrate gratis para realizar tu examen de Simulación Oficial." />}
        </div>
    )
}

export default Simulation

