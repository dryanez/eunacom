import React, { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  FileCheck2, Award, Sparkles, CheckCircle2,
  BookOpen, Layers, ArrowRight, ShieldCheck
} from 'lucide-react'
import { usePageSeo } from '../lib/seo'

export default function ReconstruccionesLanding() {
  const navigate = useNavigate()

  usePageSeo({
    title: 'Reconstrucciones EUNACOM Reales 2024-2026 | Exámenes Anteriores Explicados',
    description: 'Accede a la recopilación más completa de reconstrucciones reales del EUNACOM. Practica con preguntas oficiales de exámenes anteriores justificadas por alternativa.',
    canonical: 'https://www.eunacomapp.cl/reconstrucciones-eunacom'
  })

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div style={{ backgroundColor: '#ffffff', color: '#0f172a', fontFamily: 'Lexend, -apple-system, sans-serif', minHeight: '100vh' }}>
      {/* ── HEADER ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e2e8f0',
        padding: '0 20px', height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        maxWidth: '1280px', margin: '0 auto'
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <img src="/logo.png" alt="Eunacom App" style={{ width: 34, height: 34, borderRadius: 8, objectFit: 'contain' }} />
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1 }}>EUNACOM APP</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 500 }}>Plataforma Médica Chile</div>
          </div>
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link to="/" style={{ color: '#475569', fontSize: '0.88rem', fontWeight: 600, textDecoration: 'none' }}>Inicio</Link>
          <Link to="/curso-eunacom-2026" style={{ color: '#475569', fontSize: '0.88rem', fontWeight: 600, textDecoration: 'none' }}>Mejor Curso</Link>
          <Link to="/simulacros-eunacom" style={{ color: '#475569', fontSize: '0.88rem', fontWeight: 600, textDecoration: 'none' }}>Simulacros</Link>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              backgroundColor: '#0284c7', color: '#ffffff', border: 'none',
              padding: '8px 16px', borderRadius: 8, fontSize: '0.86rem', fontWeight: 700, cursor: 'pointer'
            }}
          >
            Ver Reconstrucciones
          </button>
        </nav>
      </header>

      {/* ── HERO ── */}
      <section style={{ padding: '50px 20px 30px', maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          backgroundColor: '#fef3c7', border: '1px solid #fde68a',
          color: '#92400e', padding: '6px 14px', borderRadius: 9999,
          fontSize: '0.82rem', fontWeight: 600, marginBottom: 16
        }}>
          <FileCheck2 size={15} color="#d97706" />
          <span>Exámenes Reales Recopilados y Verificados</span>
        </div>

        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 18 }}>
          Reconstrucciones <span style={{ color: '#0284c7' }}>EUNACOM Reales</span>
        </h1>

        <p style={{ fontSize: '1.1rem', color: '#475569', maxWidth: '780px', margin: '0 auto 30px', lineHeight: 1.6 }}>
          La clave para aprobar el examen médico en Chile es conocer el estilo, los patrones de preguntas y los distractores típicos de ASOFAMECH. Entrena con exámenes reales de los últimos años.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 40 }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              backgroundColor: '#0284c7', color: '#ffffff', border: 'none',
              padding: '14px 28px', borderRadius: 10, fontSize: '1rem', fontWeight: 700, cursor: 'pointer'
            }}
          >
            Explorar Reconstrucciones Gratis →
          </button>
          <Link
            to="/#planes"
            style={{
              backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', color: '#334155',
              padding: '14px 24px', borderRadius: 10, fontSize: '1rem', fontWeight: 600, textDecoration: 'none'
            }}
          >
            Planes desde $14.990
          </Link>
        </div>
      </section>

      {/* ── BENEFITS ── */}
      <section style={{ padding: '20px 20px 60px', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          <div style={{ padding: '24px', backgroundColor: '#f8fafc', borderRadius: 14, border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Formato Exacto ASOFAMECH</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
              Preguntas de 5 alternativas con casos clínicos ambientados en la realidad hospitalaria y de atención primaria de Chile.
            </p>
          </div>

          <div style={{ padding: '24px', backgroundColor: '#f8fafc', borderRadius: 14, border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Justificación por Alternativa</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
              No solo sabrás cuál es la correcta, sino por qué las otras 4 opciones son distractores incorrectos según la bibliografía oficial.
            </p>
          </div>

          <div style={{ padding: '24px', backgroundColor: '#f8fafc', borderRadius: 14, border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Filtro por Años y Áreas</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
              Practica exámenes completos o filtra solo las preguntas de reconstrucción de Cardiología, Pediatría o Cirugía.
            </p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0', padding: '36px 20px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 14, flexWrap: 'wrap' }}>
          <Link to="/" style={{ color: '#475569', textDecoration: 'none', fontWeight: 600 }}>Inicio</Link>
          <Link to="/curso-eunacom-2026" style={{ color: '#475569', textDecoration: 'none', fontWeight: 600 }}>Mejor Curso 2026</Link>
          <Link to="/simulacros-eunacom" style={{ color: '#475569', textDecoration: 'none', fontWeight: 600 }}>Simulacros</Link>
          <Link to="/guia-eunacom-2026" style={{ color: '#475569', textDecoration: 'none', fontWeight: 600 }}>Guía EUNACOM</Link>
          <Link to="/reconstrucciones-eunacom" style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 700 }}>Reconstrucciones</Link>
          <Link to="/convenios" style={{ color: '#475569', textDecoration: 'none', fontWeight: 600 }}>Convenios</Link>
          <Link to="/faq" style={{ color: '#475569', textDecoration: 'none', fontWeight: 600 }}>FAQ</Link>
          <Link to="/blog" style={{ color: '#475569', textDecoration: 'none', fontWeight: 600 }}>Blog</Link>
        </div>
        <p style={{ margin: 0 }}>© {new Date().getFullYear()} Eunacom App · eunacomapp.cl · Todos los derechos reservados · Chile</p>
      </footer>
    </div>
  )
}
