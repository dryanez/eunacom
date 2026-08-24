import React, { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Check, X, Star, ArrowRight, Shield, Award, Users, BookOpen,
  Video, HelpCircle, Zap, ChevronRight, ArrowLeft
} from 'lucide-react'
import { usePageSeo } from '../lib/seo'

export default function CursoComparativa() {
  const navigate = useNavigate()

  usePageSeo({
    title: 'Mejor Curso EUNACOM 2026 | Tabla Comparativa y Plataforma #1 en Chile',
    description: 'Compara los mejores cursos EUNACOM en Chile 2026. Descubre por qué Eunacom App supera a Guevara, EUNAMED y Dr. EUNACOM con +10.000 preguntas reales, 650+ clases y precios desde $14.990 CLP.',
    canonical: 'https://www.eunacomapp.cl/curso-eunacom-2026'
  })

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const COMPARISON_DATA = [
    {
      feature: 'Banco de Preguntas Clínicas',
      eunacomApp: '+10.000 preguntas justificadas',
      competitors: '1.500 – 3.000 preguntas',
      traditional: '800 – 1.200 preguntas en PDF',
    },
    {
      feature: 'Precio y Modalidad de Pago',
      eunacomApp: 'Desde $14.990 CLP (Pago único transparente)',
      competitors: '$49.990 – $89.990 / mes',
      traditional: '$450.000 – $1.200.000+ CLP',
    },
    {
      feature: 'Reconstrucciones Oficiales 2024-2026',
      eunacomApp: 'Sí, completas y explicadas por alternativa',
      competitors: 'Parciales o desactualizadas',
      traditional: 'Solo disponibles al final del curso',
    },
    {
      feature: 'Clases en Video por Especialidad',
      eunacomApp: '+650 clases organizadas por área clínica',
      competitors: 'Videos limitados o solo resúmenes',
      traditional: 'Clases en vivo con horarios rígidos',
    },
    {
      feature: 'Actualizado a Perfil V3 (2026)',
      eunacomApp: '100% alineado a normativa vigente ASOFAMECH',
      competitors: 'Parcialmente adaptado',
      traditional: 'En proceso de actualización',
    },
    {
      feature: 'Acceso Multiplataforma (PWA / Móvil)',
      eunacomApp: 'App instalable en iOS, Android, Mac y PC',
      competitors: 'Solo versión web básica',
      traditional: 'Plataformas web antiguas (Moodle)',
    },
    {
      feature: 'Simulacros Oficiales de 180 Preguntas',
      eunacomApp: 'Ilimitados con cronómetro y ranking',
      competitors: '3 a 5 simulacros por período',
      traditional: '2 a 4 ensayos presenciales/online',
    },
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
          <Link to="/simulacros-eunacom" style={{ color: '#475569', fontSize: '0.88rem', fontWeight: 600, textDecoration: 'none' }}>Simulacros</Link>
          <Link to="/guia-eunacom-2026" style={{ color: '#475569', fontSize: '0.88rem', fontWeight: 600, textDecoration: 'none' }}>Guía 2026</Link>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              backgroundColor: '#0284c7', color: '#ffffff', border: 'none',
              padding: '8px 16px', borderRadius: 8, fontSize: '0.86rem', fontWeight: 700, cursor: 'pointer'
            }}
          >
            Probar Gratis
          </button>
        </nav>
      </header>

      {/* ── HERO ── */}
      <section style={{ padding: '50px 20px 30px', maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          backgroundColor: '#f0f9ff', border: '1px solid #bae6fd',
          color: '#0369a1', padding: '6px 14px', borderRadius: 9999,
          fontSize: '0.82rem', fontWeight: 600, marginBottom: 16
        }}>
          <Award size={15} color="#0284c7" />
          <span>Análisis Comparativo Independiente · Convocatoria 2026</span>
        </div>

        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 18 }}>
          ¿Cuál es el <span style={{ color: '#0284c7' }}>Mejor Curso EUNACOM 2026</span> en Chile?
        </h1>

        <p style={{ fontSize: '1.1rem', color: '#475569', maxWidth: '780px', margin: '0 auto 30px', lineHeight: 1.6 }}>
          Analizamos en detalle las principales alternativas del mercado chileno (Eunacom App, Cursos Tradicionales y otras plataformas) para ayudarte a elegir la preparación más efectiva, actualizada y económica.
        </p>
      </section>

      {/* ── COMPARISON TABLE ── */}
      <section style={{ padding: '0 20px 60px', maxWidth: '1160px', margin: '0 auto' }}>
        <div style={{ overflowX: 'auto', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '18px 20px', fontSize: '0.95rem', fontWeight: 700, color: '#334155', width: '32%' }}>Característica / Criterio</th>
                <th style={{ padding: '18px 20px', fontSize: '1rem', fontWeight: 800, color: '#0284c7', backgroundColor: '#f0f9ff', width: '28%', borderLeft: '2px solid #0284c7', borderRight: '2px solid #0284c7' }}>
                  ⭐ Eunacom App
                  <div style={{ fontSize: '0.75rem', fontWeight: 500, color: '#0369a1' }}>Recomendado 2026</div>
                </th>
                <th style={{ padding: '18px 20px', fontSize: '0.9rem', fontWeight: 600, color: '#64748b', width: '20%' }}>Otras Apps / IA</th>
                <th style={{ padding: '18px 20px', fontSize: '0.9rem', fontWeight: 600, color: '#64748b', width: '20%' }}>Cursos Tradicionales</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_DATA.map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                  <td style={{ padding: '16px 20px', fontWeight: 600, color: '#1e293b', fontSize: '0.92rem' }}>
                    {row.feature}
                  </td>
                  <td style={{ padding: '16px 20px', fontWeight: 700, color: '#0369a1', backgroundColor: '#f0f9ff', borderLeft: '2px solid #0284c7', borderRight: '2px solid #0284c7', fontSize: '0.92rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Check size={18} color="#0284c7" style={{ flexShrink: 0 }} />
                      <span>{row.eunacomApp}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px', color: '#64748b', fontSize: '0.88rem' }}>
                    {row.competitors}
                  </td>
                  <td style={{ padding: '16px 20px', color: '#64748b', fontSize: '0.88rem' }}>
                    {row.traditional}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── WHY CHOOSE EUNACOM APP ── */}
      <section style={{ padding: '40px 20px 60px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, textAlign: 'center', marginBottom: 12 }}>
            Por qué más de 2.000 médicos eligen Eunacom App
          </h2>
          <p style={{ textAlign: 'center', color: '#64748b', maxWidth: '650px', margin: '0 auto 40px', fontSize: '0.95rem' }}>
            La preparación moderna para el examen médico en Chile combina tecnología interactiva, casos clínicos reales y total flexibilidad horaria.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: 14, border: '1px solid #e2e8f0' }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <BookOpen size={22} color="#0284c7" />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>El Banco de Preguntas Más Grande</h3>
              <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>
                Más de 10.000 preguntas de casos clínicos minuciosamente categorizadas en las 7 áreas oficiales de ASOFAMECH con justificación basada en Guías Clínicas GES y MINSAL.
              </p>
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: 14, border: '1px solid #e2e8f0' }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <Video size={22} color="#16a34a" />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>+650 Clases en Video (Perfil EUNACOM)</h3>
              <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>
                Estudia la teoría médica completa viendo videoclases modulares de Medicina Interna, Pediatría, Ginecología, Cirugía, Psiquiatría y Salud Pública, organizadas 100% según el temario oficial ASOFAMECH.
              </p>
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: 14, border: '1px solid #e2e8f0' }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <Zap size={22} color="#d97706" />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>Curso Todo-en-Uno desde $14.990</h3>
              <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>
                Sin contratos amarrados ni mensualidades de $600.000+. Todos los planes desde $14.990 CLP te dan acceso total al Curso en Video (+650 clases) + Banco de Preguntas (+10.000) + Reconstrucciones y Simulacros.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '60px 20px', backgroundColor: '#0284c7', color: '#ffffff', textAlign: 'center' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', marginBottom: 12 }}>
            Empieza a preparar tu EUNACOM 2026 hoy
          </h2>
          <p style={{ color: '#e0f2fe', fontSize: '1rem', lineHeight: 1.6, marginBottom: 28 }}>
            Prueba la plataforma sin costo y comprueba por qué somos la herramienta preferida por médicos nacionales y extranjeros.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                backgroundColor: '#ffffff', color: '#0284c7', border: 'none',
                padding: '14px 28px', borderRadius: 10, fontSize: '1rem', fontWeight: 800, cursor: 'pointer'
              }}
            >
              Explorar Plataforma Gratis →
            </button>
            <Link
              to="/#planes"
              style={{
                backgroundColor: 'transparent', border: '2px solid #ffffff', color: '#ffffff',
                padding: '12px 24px', borderRadius: 10, fontSize: '1rem', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center'
              }}
            >
              Ver Planes y Precios
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0', padding: '36px 20px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 14, flexWrap: 'wrap' }}>
          <Link to="/" style={{ color: '#475569', textDecoration: 'none', fontWeight: 600 }}>Inicio</Link>
          <Link to="/curso-eunacom-2026" style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 700 }}>Mejor Curso 2026</Link>
          <Link to="/simulacros-eunacom" style={{ color: '#475569', textDecoration: 'none', fontWeight: 600 }}>Simulacros</Link>
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
