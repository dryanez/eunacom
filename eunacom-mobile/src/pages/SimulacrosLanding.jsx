import React, { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Clock, Target, CheckCircle2, BarChart3, AlertCircle,
  Award, Shield, ArrowRight, Play, BookOpen, Layers
} from 'lucide-react'
import { usePageSeo } from '../lib/seo'

export default function SimulacrosLanding() {
  const navigate = useNavigate()

  usePageSeo({
    title: 'Simulacros Oficiales EUNACOM 2026 | Banco de +10.000 Preguntas Clínicas',
    description: 'Practica con simulacros de 180 preguntas cronometradas idénticas al examen EUNACOM-ST oficial de ASOFAMECH. Retroalimentación justificada con Guías GES y MINSAL vigentes.',
    canonical: 'https://www.eunacomapp.cl/simulacros-eunacom'
  })

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const AREAS = [
    { name: 'Medicina Interna', pct: '30%', count: '54 preguntas', color: '#0284c7' },
    { name: 'Pediatría', pct: '18%', count: '32 preguntas', color: '#16a34a' },
    { name: 'Obstetricia y Ginecología', pct: '15%', count: '27 preguntas', color: '#db2777' },
    { name: 'Cirugía', pct: '12%', count: '22 preguntas', color: '#ea580c' },
    { name: 'Psiquiatría y Salud Mental', pct: '10%', count: '18 preguntas', color: '#7c3aed' },
    { name: 'Especialidades Médicas', pct: '8%', count: '14 preguntas', color: '#0891b2' },
    { name: 'Salud Pública y Epidemiología', pct: '7%', count: '13 preguntas', color: '#d97706' },
  ]

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
          <Link to="/guia-eunacom-2026" style={{ color: '#475569', fontSize: '0.88rem', fontWeight: 600, textDecoration: 'none' }}>Guía 2026</Link>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              backgroundColor: '#0284c7', color: '#ffffff', border: 'none',
              padding: '8px 16px', borderRadius: 8, fontSize: '0.86rem', fontWeight: 700, cursor: 'pointer'
            }}
          >
            Iniciar Simulacro
          </button>
        </nav>
      </header>

      {/* ── HERO ── */}
      <section style={{ padding: '50px 20px 30px', maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0',
          color: '#166534', padding: '6px 14px', borderRadius: 9999,
          fontSize: '0.82rem', fontWeight: 600, marginBottom: 16
        }}>
          <Clock size={15} color="#16a34a" />
          <span>Simulación Exacta · 180 Preguntas en 4 Horas</span>
        </div>

        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 18 }}>
          Simulacros Oficiales del <span style={{ color: '#0284c7' }}>EUNACOM 2026</span>
        </h1>

        <p style={{ fontSize: '1.1rem', color: '#475569', maxWidth: '780px', margin: '0 auto 30px', lineHeight: 1.6 }}>
          Entrena bajo condiciones 100% idénticas al examen real de ASOFAMECH. Pon a prueba tus conocimientos clínicos, gestiona tu tiempo y analiza tus errores con explicaciones fundamentadas.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 40 }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              backgroundColor: '#0284c7', color: '#ffffff', border: 'none',
              padding: '14px 28px', borderRadius: 10, fontSize: '1rem', fontWeight: 700, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 8
            }}
          >
            <Play size={18} /> Probar Simulacro Gratis
          </button>
          <Link
            to="/#planes"
            style={{
              backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', color: '#334155',
              padding: '14px 24px', borderRadius: 10, fontSize: '1rem', fontWeight: 600, textDecoration: 'none'
            }}
          >
            Ver Planes desde $14.990
          </Link>
        </div>
      </section>

      {/* ── AREA BREAKDOWN ── */}
      <section style={{ padding: '20px 20px 60px', maxWidth: '1100px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, textAlign: 'center', marginBottom: 12 }}>
          Estructura Oficial del Examen EUNACOM-ST
        </h2>
        <p style={{ textAlign: 'center', color: '#64748b', maxWidth: '650px', margin: '0 auto 32px', fontSize: '0.95rem' }}>
          Nuestros simulacros respetan rigurosamente la ponderación oficial por especialidad establecida por ASOFAMECH.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {AREAS.map((area, idx) => (
            <div key={idx} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '20px', borderLeft: `5px solid ${area.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                <span style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>{area.name}</span>
                <span style={{ fontWeight: 800, fontSize: '1.1rem', color: area.color }}>{area.pct}</span>
              </div>
              <span style={{ fontSize: '0.84rem', color: '#64748b' }}>{area.count} en cada simulacro completo</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: '60px 20px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, textAlign: 'center', marginBottom: 40 }}>
            Herramientas que marcan la diferencia
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            <div style={{ backgroundColor: '#ffffff', padding: '28px', borderRadius: 14, border: '1px solid #e2e8f0' }}>
              <Clock size={28} color="#0284c7" style={{ marginBottom: 14 }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 8 }}>Temporizador Oficial de 4 Horas</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                Aprende a responder en un promedio de 80 segundos por pregunta para llegar con holgura al final de las 180 preguntas.
              </p>
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: '28px', borderRadius: 14, border: '1px solid #e2e8f0' }}>
              <BarChart3 size={28} color="#16a34a" style={{ marginBottom: 14 }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 8 }}>Métricas por Área Médica</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                Descubre tus puntos débiles en tiempo real y enfoca tus horas de estudio en las especialidades donde necesitas mayor puntaje.
              </p>
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: '28px', borderRadius: 14, border: '1px solid #e2e8f0' }}>
              <AlertCircle size={28} color="#ea580c" style={{ marginBottom: 14 }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 8 }}>Revisión de Errores Clínicos</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                Guarda tus respuestas fallidas en un cuaderno inteligente de errores para repasarlas antes del examen oficial.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0', padding: '36px 20px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 14, flexWrap: 'wrap' }}>
          <Link to="/" style={{ color: '#475569', textDecoration: 'none', fontWeight: 600 }}>Inicio</Link>
          <Link to="/curso-eunacom-2026" style={{ color: '#475569', textDecoration: 'none', fontWeight: 600 }}>Mejor Curso 2026</Link>
          <Link to="/simulacros-eunacom" style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 700 }}>Simulacros</Link>
          <Link to="/guia-eunacom-2026" style={{ color: '#475569', textDecoration: 'none', fontWeight: 600 }}>Guía EUNACOM</Link>
          <Link to="/reconstrucciones-eunacom" style={{ color: '#475569', textDecoration: 'none', fontWeight: 600 }}>Reconstrucciones</Link>
          <Link to="/convenios" style={{ color: '#475569', textDecoration: 'none', fontWeight: 600 }}>Convenios</Link>
          <Link to="/faq" style={{ color: '#475569', textDecoration: 'none', fontWeight: 600 }}>FAQ</Link>
          <Link to="/blog" style={{ color: '#475569', textDecoration: 'none', fontWeight: 600 }}>Blog</Link>
        </div>
        <p style={{ margin: 0 }}>© {new Date().getFullYear()} Eunacom App · eunacomapp.cl · Todos los derechos reservados · Chile</p>
      </footer>
    </div>
  )
}
