import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, ShieldCheck, BookOpen, ArrowRight } from 'lucide-react'
import { useSubscription } from '../contexts/SubscriptionContext'

// Cupón de api/_tienda.js (COUPONS). /oferta lo lee de ?code= y lo aplica en el checkout.
export const LIBRO_GORDO_COUPON = 'LIBROGORDO20'

// Upsell al terminar un Libro Gordo online (modo bloqueado): 20 % en EUNACOMapp completo.
export default function LibroGordoUpsell({ bookName, pct }) {
    const navigate = useNavigate()
    const { setCoupon } = useSubscription()
    // El cupón de ?code= solo se lee al cargar la app; en una navegación interna hay que fijarlo aquí
    const claim = () => { setCoupon(LIBRO_GORDO_COUPON); navigate(`/oferta?code=${LIBRO_GORDO_COUPON}`) }
    return (
        <div className="card" style={{
            marginBottom: '1.5rem', borderRadius: 20, padding: '1.75rem 1.5rem',
            background: 'linear-gradient(135deg, rgba(2,132,199,0.18), rgba(139,92,246,0.18))',
            border: '1px solid rgba(56,189,248,0.35)',
        }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f59e0b', color: '#1f2937', fontWeight: 800, fontSize: '0.78rem', padding: '4px 12px', borderRadius: 9999, marginBottom: '0.9rem', letterSpacing: '0.04em' }}>
                <Sparkles size={14} /> 20 % DE DESCUENTO EN EUNACOMAPP
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 900, margin: '0 0 0.5rem', color: 'var(--surface-50)' }}>
                {pct >= 60 ? '¡Buen resultado! Ahora ve por el examen completo' : 'Sigue practicando con el banco completo'}
            </h2>
            <p style={{ color: 'var(--surface-200)', margin: '0 0 1.1rem', lineHeight: 1.55 }}>
                Terminaste el Libro Gordo de <strong>{bookName}</strong>. Con EUNACOMapp tienes las <strong>10.890 preguntas</strong> (banco, reconstrucciones y los 21 Libros Gordos), clases y material de estudio, con un 20 % de descuento por ser lector.
            </p>
            <div style={{ display: 'grid', gap: '0.6rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', color: 'var(--surface-100)' }}>
                    <ShieldCheck size={20} color="#10b981" style={{ flexShrink: 0, marginTop: 1 }} />
                    <span><strong>No pierdas tus puntajes:</strong> tus resultados quedan guardados en tu cuenta y puedes revisarlos cuando quieras.</span>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', color: 'var(--surface-100)' }}>
                    <BookOpen size={20} color="#38bdf8" style={{ flexShrink: 0, marginTop: 1 }} />
                    <span>Modo tutor y simulacro cronometrado, estadísticas por especialidad y repaso de tus errores.</span>
                </div>
            </div>
            <button
                className="btn-primary btn-primary--full"
                onClick={claim}
                style={{ padding: '1rem', borderRadius: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
                Quiero el 20 % de descuento <ArrowRight size={18} />
            </button>
        </div>
    )
}
