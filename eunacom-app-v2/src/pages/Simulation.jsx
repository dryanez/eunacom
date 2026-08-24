import React, { useState } from 'react'
import {
  Clock, LightbulbOff, PlayCircle, Award, Sparkles, ShieldCheck,
  Target, BarChart3, ArrowRight, Zap, CheckCircle2, AlertTriangle,
  Stethoscope
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useSubscription } from '../contexts/SubscriptionContext'
import PaymentModal from '../components/PaymentModal'
import LoadingScreen from '../components/LoadingScreen'
import LoginGateModal from '../components/LoginGateModal'
import { createTest, genId } from '../lib/api'
import { getQuestionDB } from '../lib/questionDB'
import '../styles/proMaxPages.css'

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

    return (
        <div className="promax-page-wrapper" style={{ paddingBottom: '4rem' }}>
            {/* Ambient Backdrop Glows */}
            <div className="promax-ambient-bg">
                <div className="promax-ambient-glow promax-glow-amber" style={{ top: -70, left: '10%', width: 500, height: 350 }} />
                <div className="promax-ambient-glow promax-glow-cyan" style={{ top: 180, right: '8%', width: 460, height: 320 }} />
                <div className="promax-ambient-glow promax-glow-purple" style={{ top: 550, left: '25%', width: 440, height: 300 }} />
            </div>

            <div className="promax-content-layer" style={{ maxWidth: '880px', margin: '0 auto' }}>
                {/* Hero Bento Header */}
                <div className="promax-hero-bento" style={{
                    '--hero-accent-gradient': 'linear-gradient(90deg, #f59e0b 0%, #38bdf8 50%, #10b981 100%)'
                }}>
                    <div className="promax-hero-header-row">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.1rem', flex: 1, minWidth: 260 }}>
                            <div className="promax-hero-avatar-box" style={{
                                '--avatar-bg': 'linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(249, 115, 22, 0.25) 100%)',
                                '--avatar-border': 'rgba(245, 158, 11, 0.45)',
                                '--avatar-color': '#fbbf24',
                                '--avatar-glow': 'rgba(245, 158, 11, 0.35)'
                            }}>
                                <Award size={28} />
                            </div>
                            <div className="promax-hero-titles">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
                                    <h1>Simulación Oficial EUNACOM 2026</h1>
                                    <span className="promax-badge-pill promax-badge-amber">
                                        <Sparkles size={11} /> Algoritmo ASOFAMECH
                                    </span>
                                </div>
                                <p>
                                    180 preguntas ponderadas · 4 horas cronometradas · Sin pistas durante la prueba
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Simulation Conditions Bento Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '1rem',
                    marginBottom: '1.75rem'
                }}>
                    {/* Condition 1 */}
                    <div className="promax-bento-card promax-theme-amber" style={{ minHeight: 'auto', padding: '1.3rem' }}>
                        <div className="promax-card-ambient-tint" />
                        <div className="promax-card-top-line" />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.5rem' }}>
                            <div className="promax-card-icon-box" style={{ width: 44, height: 44, borderRadius: 12 }}>
                                <Clock size={22} />
                            </div>
                            <div>
                                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#ffffff' }}>4 Horas (240 min)</div>
                                <div style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 700 }}>1.33 min / pregunta</div>
                            </div>
                        </div>
                        <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0, lineHeight: 1.45 }}>
                            Tiempo cronometrado idéntico al examen real para entrenar el ritmo de respuesta y control de fatiga.
                        </p>
                    </div>

                    {/* Condition 2 */}
                    <div className="promax-bento-card promax-theme-indigo" style={{ minHeight: 'auto', padding: '1.3rem' }}>
                        <div className="promax-card-ambient-tint" />
                        <div className="promax-card-top-line" />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.5rem' }}>
                            <div className="promax-card-icon-box" style={{ width: 44, height: 44, borderRadius: 12 }}>
                                <LightbulbOff size={22} />
                            </div>
                            <div>
                                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#ffffff' }}>Modo Ciego Real</div>
                                <div style={{ fontSize: '0.75rem', color: '#a5b4fc', fontWeight: 700 }}>Sin pistas ni ayudas</div>
                            </div>
                        </div>
                        <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0, lineHeight: 1.45 }}>
                            Sin retroalimentación instantánea para medir tu nivel real. La pauta completa se libera al finalizar.
                        </p>
                    </div>

                    {/* Condition 3 */}
                    <div className="promax-bento-card promax-theme-emerald" style={{ minHeight: 'auto', padding: '1.3rem' }}>
                        <div className="promax-card-ambient-tint" />
                        <div className="promax-card-top-line" />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.5rem' }}>
                            <div className="promax-card-icon-box" style={{ width: 44, height: 44, borderRadius: 12 }}>
                                <Target size={22} />
                            </div>
                            <div>
                                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#ffffff' }}>Blueprint Oficial</div>
                                <div style={{ fontSize: '0.75rem', color: '#6ee7b7', fontWeight: 700 }}>Ponderación exacta</div>
                            </div>
                        </div>
                        <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0, lineHeight: 1.45 }}>
                            Distribución rigurosa según el porcentaje oficial de preguntas establecido por ASOFAMECH.
                        </p>
                    </div>
                </div>

                {/* Blueprint Breakdown Bento */}
                <div className="promax-bento-card" style={{
                    padding: '1.75rem',
                    minHeight: 'auto',
                    marginBottom: '1.75rem',
                    cursor: 'default'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                                Distribución Oficial del Examen (Blueprint)
                            </h3>
                            <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '0.2rem 0 0' }}>
                                Proporción exacta de 180 preguntas en las 5 grandes especialidades médicas
                            </p>
                        </div>
                        <span className="promax-badge-pill promax-badge-cyan">
                            <BarChart3 size={11} /> 100% Ponderado
                        </span>
                    </div>

                    {/* Segmented multi-colored bar */}
                    <div style={{
                        display: 'flex', height: 10, borderRadius: 9999, overflow: 'hidden',
                        marginBottom: '1.5rem', background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                        {blueprint.map(area => (
                            <div
                                key={area.name}
                                style={{
                                    width: `${area.percent}%`,
                                    background: area.color,
                                    transition: 'width 0.4s'
                                }}
                                title={`${area.name}: ${area.percent}% (${area.qty} preguntas)`}
                            />
                        ))}
                    </div>

                    {/* Breakdown list */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                        {blueprint.map(area => (
                            <div key={area.name} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '0.75rem 1rem', background: 'rgba(255, 255, 255, 0.03)',
                                borderRadius: 14, border: '1px solid rgba(255, 255, 255, 0.06)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: area.color, flexShrink: 0 }} />
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#f8fafc' }}>{area.name}</div>
                                        <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>{area.qty} preguntas</div>
                                    </div>
                                </div>
                                <div style={{
                                    fontWeight: 900, fontSize: '0.95rem', color: area.color,
                                    background: 'rgba(255, 255, 255, 0.05)', padding: '0.2rem 0.6rem', borderRadius: 8
                                }}>
                                    {area.percent}%
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Launch Action Card */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    borderRadius: 24,
                    padding: '1.75rem',
                    textAlign: 'center',
                    boxShadow: '0 12px 36px rgba(0, 0, 0, 0.4)'
                }}>
                    <button
                        onClick={handleStartSimulation}
                        disabled={isStarting}
                        style={{
                            width: '100%',
                            padding: '1.2rem',
                            fontSize: '1.1rem',
                            fontWeight: 800,
                            borderRadius: 16,
                            border: 'none',
                            cursor: isStarting ? 'wait' : 'pointer',
                            background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
                            color: '#ffffff',
                            boxShadow: '0 8px 24px rgba(2, 132, 199, 0.45), 0 0 16px rgba(56, 189, 248, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.6rem',
                            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                            opacity: isStarting ? 0.7 : 1
                        }}
                        onMouseEnter={e => { if (!isStarting) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(2, 132, 199, 0.6), 0 0 24px rgba(56, 189, 248, 0.5)' } }}
                        onMouseLeave={e => { if (!isStarting) { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(2, 132, 199, 0.45), 0 0 16px rgba(56, 189, 248, 0.3)' } }}
                    >
                        <PlayCircle size={24} /> {isStarting ? 'Generando simulación...' : 'Iniciar Simulación Oficial EUNACOM'}
                    </button>
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                        fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.9rem'
                    }}>
                        <ShieldCheck size={14} color="#38bdf8" /> Tu resultado oficial y análisis de fortalezas/debilidades se guardará en tu perfil.
                    </div>
                </div>

                {showPaymentModal && <PaymentModal onClose={() => setShowPaymentModal(false)} />}
                {showLoginGate && <LoginGateModal onClose={() => setShowLoginGate(false)} message="Inicia sesión o regístrate gratis para realizar tu examen de Simulación Oficial." />}
            </div>
        </div>
    )
}

export default Simulation

