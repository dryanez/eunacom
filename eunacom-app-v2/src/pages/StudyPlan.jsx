import React from 'react'
import { ChevronLeft, ChevronRight, Activity, Baby, ActivitySquare, Pill } from 'lucide-react'

const StudyPlan = () => {
    // Generate an array of 31 days
    const days = Array.from({ length: 31 }, (_, i) => i + 1)
    
    const getDotColor = (day) => {
        if ([1, 2, 3, 7, 8, 9, 10, 14].includes(day)) return 'var(--accent-green)'
        if ([4, 5, 12, 16, 17, 21].includes(day)) return 'var(--accent-amber)'
        if ([18, 19, 20, 22, 23].includes(day)) return 'var(--accent-red)'
        return null
    }

    const agenda = [
        { name: 'Cardiología', icon: <Activity size={20} />, color: 'rgba(139, 92, 246, 0.2)', iconColor: '#8b5cf6', progress: 75 },
        { name: 'Pediatría', icon: <Baby size={20} />, color: 'rgba(245, 158, 11, 0.2)', iconColor: '#f59e0b', progress: 50 },
        { name: 'Ginecología y Obstetricia', icon: <ActivitySquare size={20} />, color: 'rgba(236, 72, 153, 0.2)', iconColor: '#ec4899', progress: 20 },
        { name: 'Medicina Interna', icon: <Pill size={20} />, color: 'rgba(14, 165, 233, 0.2)', iconColor: '#0ea5e9', progress: 10 },
    ]

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem' }}>
            <h1 className="page__title">Plan de Estudio</h1>
            <p className="page__subtitle">Mayo 2026</p>

            <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Mayo 2026</h3>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button style={{ background: 'transparent', border: 'none', color: 'var(--surface-400)', cursor: 'pointer' }}><ChevronLeft size={20} /></button>
                        <button style={{ background: 'transparent', border: 'none', color: 'var(--surface-400)', cursor: 'pointer' }}><ChevronRight size={20} /></button>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1rem', textAlign: 'center', marginBottom: '1rem' }}>
                    {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
                        <div key={d} style={{ color: 'var(--surface-400)', fontSize: '0.85rem', fontWeight: 600 }}>{d}</div>
                    ))}
                    {days.map(day => {
                        const dotColor = getDotColor(day)
                        return (
                            <div key={day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', padding: '0.5rem 0' }}>
                                <div style={{ fontSize: '1rem', fontWeight: 500 }}>{day}</div>
                                <div style={{ 
                                    width: '8px', height: '8px', borderRadius: '50%', 
                                    background: dotColor || 'transparent' 
                                }} />
                            </div>
                        )
                    })}
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--surface-300)' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-green)' }} /> Verde: Completado
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--surface-300)' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-amber)' }} /> Amarillo: Planificado
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--surface-300)' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-red)' }} /> Rojo: Perdido
                    </div>
                </div>
            </div>

            <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>Agenda Diaria</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {agenda.map(item => (
                    <div key={item.name} className="card" style={{ padding: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ background: item.color, color: item.iconColor, padding: '0.5rem', borderRadius: 'var(--radius)' }}>
                                    {item.icon}
                                </div>
                                <span style={{ fontWeight: 600 }}>{item.name}</span>
                            </div>
                            <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{item.progress}%</span>
                        </div>
                        <div className="xp-bar">
                            <div className="xp-bar__fill" style={{ width: `${item.progress}%`, background: 'var(--primary-400)' }}></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default StudyPlan
