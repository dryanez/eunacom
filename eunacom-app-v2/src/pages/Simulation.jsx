import React, { useState } from 'react'
import { Clock, LightbulbOff, PlayCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { createTest, genId } from '../lib/api'
import { getQuestionDB } from '../lib/questionDB'

const Simulation = () => {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [isStarting, setIsStarting] = useState(false)

    const blueprint = [
        { name: 'Medicina Interna', qty: 54, percent: 30, color: 'var(--accent-green)', category: 'Medicina Interna' },
        { name: 'Pediatría', qty: 36, percent: 20, color: 'var(--surface-400)', category: 'Pediatría' },
        { name: 'Cirugía', qty: 27, percent: 15, color: 'var(--accent-amber)', category: 'Cirugía' },
        { name: 'Ginecología y Obstetricia', qty: 27, percent: 15, color: 'var(--primary-400)', category: 'Ginecología' },
        { name: 'Salud Pública y Psiquiatría', qty: 36, percent: 20, color: 'var(--accent-red)', category: 'Salud Pública' },
    ]

    const handleStartSimulation = async () => {
        setIsStarting(true)
        try {
            if (!user) throw new Error('Debes iniciar sesión.')
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
                mode: 'timed',
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
        <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem' }}>
            <h1 className="page__title">Simulación Oficial de Examen</h1>
            <p className="page__subtitle">Evalúa tu preparación real</p>

            <div className="card" style={{ padding: '2rem' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Simulación Oficial: EUNACOM 2026</h2>
                    <p style={{ color: 'var(--surface-300)', fontSize: '1.05rem', lineHeight: 1.5 }}>Prepárate para el examen real. 180 preguntas, tiempo limitado.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-800)', padding: '1.5rem', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                        <Clock size={32} color="var(--primary-300)" style={{ marginBottom: '1rem' }} />
                        <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.25rem' }}>4 Horas (240 min)</div>
                        <div style={{ color: 'var(--surface-400)', fontSize: '0.85rem' }}>Con Tiempo Límite</div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-800)', padding: '1.5rem', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                        <LightbulbOff size={32} color="var(--primary-300)" style={{ marginBottom: '1rem' }} />
                        <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.25rem' }}>Sin Pistas ni Ayudas</div>
                        <div style={{ color: 'var(--surface-400)', fontSize: '0.85rem' }}>Modo Realista</div>
                    </div>
                </div>

                <div style={{ background: 'var(--surface-800)', padding: '1.5rem', borderRadius: 'var(--radius)', marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--surface-50)' }}>Desglose del Plan de Examen (Blueprint)</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {blueprint.map(area => (
                            <div key={area.name}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '1rem' }}>{area.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--surface-400)' }}>{area.qty} preguntas</div>
                                    </div>
                                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>{area.percent}%</div>
                                </div>
                                <div className="xp-bar" style={{ height: '6px' }}>
                                    <div className="xp-bar__fill" style={{ width: `${area.percent}%`, background: area.color }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    onClick={handleStartSimulation}
                    disabled={isStarting}
                    className="btn-primary btn-primary--full"
                    style={{ padding: '1.25rem', fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: isStarting ? 0.7 : 1, cursor: isStarting ? 'wait' : 'pointer' }}>
                    <PlayCircle size={22} /> {isStarting ? 'Preparando simulación...' : 'Iniciar Simulación Oficial'}
                </button>
            </div>
        </div>
    )
}

export default Simulation
