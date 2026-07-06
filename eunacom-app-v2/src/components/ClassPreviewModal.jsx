import React from 'react'
import { Play, Lock, ExternalLink, X } from 'lucide-react'

const ClassPreviewModal = ({ item, onClose }) => {
  // item: { type: 'specialty' | 'subsystem' | 'clase' | 'exam', title: '...', specialty: '...', lessonNumber: 1, duration: '...', etc }
  if (!item) return null

  const getDetails = () => {
    switch (item.type) {
      case 'specialty':
        return {
          header: 'Módulo Completo',
          desc: `Accede a todas las clases, cuestionarios y videos de ${item.title}. Domina esta especialidad paso a paso con nuestro material de alto rendimiento.`,
          level: 'Nivel: Todos los niveles',
          instructor: 'Dr. Felipe Yáñez & Equipo EUNACOM'
        }
      case 'subsystem':
        return {
          header: 'Sección del Curso',
          desc: `Desbloquea todas las clases de ${item.title} pertenecientes a ${item.specialty}. Aprende lo esencial para el examen EUNACOM con clases directas al grano.`,
          level: 'Nivel: EUNACOM-ST',
          instructor: 'Dr. Felipe Yáñez'
        }
      case 'clase':
        return {
          header: `Clase ${item.lessonNumber || ''} • ${item.specialty || ''}`,
          desc: `Clase de alto rendimiento sobre ${item.title}. Incluye transcripción, resumen en puntos clave, video interactivo y cuestionario evaluativo.`,
          level: 'Nivel: EUNACOM-ST',
          instructor: 'Dr. Felipe Yáñez'
        }
      case 'exam':
        return {
          header: 'Simulaciones y Exámenes',
          desc: `Acceso ilimitado al creador de exámenes y a simulaciones completas. Evalúa tu progreso con miles de preguntas con retroalimentación instantánea.`,
          level: 'Nivel: Práctica Avanzada',
          instructor: 'Plataforma EUNACOM'
        }
      default:
        return {
          header: 'Contenido Premium',
          desc: 'Este contenido es exclusivo para alumnos premium.',
          level: 'Nivel: Premium',
          instructor: 'Plataforma EUNACOM'
        }
    }
  }

  const details = getDetails()

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(11, 17, 32, 0.7)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: '1rem',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      
      <div style={{
        background: 'var(--surface-800)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        width: '100%', maxWidth: '500px',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        animation: 'slideUp 0.3s ease-out',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button onClick={onClose} style={{
          position: 'absolute', top: '1rem', right: '1rem', zIndex: 10,
          background: 'rgba(15, 23, 42, 0.5)', border: 'none',
          color: '#fff', borderRadius: '50%', width: '32px', height: '32px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'all 0.2s', backdropFilter: 'blur(4px)'
        }}
        onMouseOver={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
        onMouseOut={e => e.currentTarget.style.background = 'rgba(15, 23, 42, 0.5)'}>
          <X size={18} />
        </button>

        {/* Hero Banner / Thumbnail */}
        <div style={{
          height: '220px', width: '100%',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
          position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          {/* Faux Play Button for video feel */}
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'var(--primary-600)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 16px rgba(0,0,0,0.3)', cursor: 'pointer',
            transition: 'transform 0.2s'
          }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
             onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
            <Play size={32} color="#fff" fill="#fff" style={{ marginLeft: '4px' }} />
          </div>

          <div style={{
            position: 'absolute', bottom: '1rem', left: '1.5rem', right: '1.5rem',
          }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(0,0,0,0.6)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, color: '#fff', marginBottom: '0.5rem' }}>
              <Lock size={12} color="#fbbf24" /> Curso Premium
            </div>
            <h2 style={{ margin: 0, color: '#fff', fontSize: '1.4rem', fontWeight: 800, textShadow: '0 2px 4px rgba(0,0,0,0.5)', lineHeight: 1.2 }}>
              {item.title}
            </h2>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Docente:</span> {details.instructor}
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Módulo:</span> {details.header}
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Nivel:</span> {details.level}
            </div>
          </div>

          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            {details.desc}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
            <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Suscripción EUNACOM</span>
            <span style={{ display: 'flex', alignItems: 'center', color: '#f59e0b', fontSize: '0.9rem', gap: '0.2rem' }}>
              ★ 4.9 (Estudiantes)
            </span>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button 
              onClick={() => window.open('https://eunacom.cl/', '_blank')}
              style={{
                width: '100%', padding: '0.85rem', background: 'var(--primary-600)',
                color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem',
                fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                transition: 'all 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.background = 'var(--primary-500)'}
              onMouseOut={e => e.currentTarget.style.background = 'var(--primary-600)'}
            >
              Comprar en eunacom.cl <ExternalLink size={18} />
            </button>

            <button 
              onClick={onClose}
              style={{
                width: '100%', padding: '0.85rem', background: 'var(--surface-700)',
                color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '1rem',
                fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.background = 'var(--surface-600)'}
              onMouseOut={e => e.currentTarget.style.background = 'var(--surface-700)'}
            >
              Volver a la versión Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClassPreviewModal
