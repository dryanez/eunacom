import React from 'react'
import { Clock, LightbulbOff, PlayCircle } from 'lucide-react'

const Simulation = () => {
    const blueprint = [
        { name: 'Medicina Interna', qty: 54, percent: 30, color: 'var(--accent-green)' },
        { name: 'Pediatría', qty: 36, percent: 20, color: 'var(--surface-400)' },
        { name: 'Cirugía', qty: 27, percent: 15, color: 'var(--accent-amber)' },
        { name: 'Ginecología y Obstetricia', qty: 27, percent: 15, color: 'var(--primary-400)' },
        { name: 'Salud Pública y Psiquiatría', qty: 36, percent: 20, color: 'var(--accent-red)' },
    ]

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

                <button className="btn-primary btn-primary--full" style={{ padding: '1.25rem', fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <PlayCircle size={22} /> Iniciar Simulación Oficial
                </button>
            </div>
        </div>
    )
}

export default Simulation
