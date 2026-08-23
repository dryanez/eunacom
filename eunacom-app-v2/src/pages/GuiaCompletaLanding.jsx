import React, { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Calendar, FileText, CheckCircle, HelpCircle,
  Stethoscope, BookOpen, Clock, AlertTriangle, ArrowRight
} from 'lucide-react'
import { usePageSeo } from '../lib/seo'

export default function GuiaCompletaLanding() {
  const navigate = useNavigate()

  usePageSeo({
    title: 'Guía Completa EUNACOM 2026 | Temario Oficial V3, Fechas y Requisitos ASOFAMECH',
    description: 'Guía oficial y completa del EUNACOM 2026 en Chile. Requisitos para médicos extranjeros, fechas de inscripción, temario oficial ASOFAMECH y estrategias de aprobación.',
    canonical: 'https://www.eunacomapp.cl/guia-eunacom-2026'
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
            Estudiar Gratis
          </button>
        </nav>
      </header>

      {/* ── HERO ── */}
      <section style={{ padding: '50px 20px 30px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          backgroundColor: '#f0f9ff', border: '1px solid #bae6fd',
          color: '#0369a1', padding: '6px 14px', borderRadius: 9999,
          fontSize: '0.82rem', fontWeight: 600, marginBottom: 16
        }}>
          <BookOpen size={15} color="#0284c7" />
          <span>Guía Informativa y Temario Actualizado 2026</span>
        </div>

        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 18 }}>
          Guía Completa <span style={{ color: '#0284c7' }}>EUNACOM 2026</span>: Fechas, Temario y Requisitos
        </h1>

        <p style={{ fontSize: '1.05rem', color: '#475569', lineHeight: 1.65, marginBottom: 30 }}>
          El Examen Único Nacional de Conocimientos de Medicina (EUNACOM) es la evaluación estandarizada que habilita legalmente el ejercicio de la medicina en el sistema público y privado de Chile. Aquí encontrarás toda la información oficial sintetizada.
        </p>
      </section>

      {/* ── MAIN CONTENT ── */}
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px 60px' }}>
        {/* Section 1 */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '30px', marginBottom: 24 }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: 14 }}>
            1. ¿Qué es el EUNACOM y por qué es obligatorio?
          </h2>
          <p style={{ color: '#475569', fontSize: '0.94rem', lineHeight: 1.7, marginBottom: 12 }}>
            El EUNACOM es un examen de habilitación profesional administrado por la Asociación de Facultades de Medicina de Chile (<strong>ASOFAMECH</strong>). Consta de dos secciones:
          </p>
          <ul style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.7, paddingLeft: 20, margin: 0 }}>
            <li><strong>EUNACOM-ST (Sección Teórica):</strong> 180 preguntas de opción múltiple en 4 horas. Puntaje mínimo de aprobación: 51% (92 preguntas correctas).</li>
            <li><strong>EUNACOM-SP (Sección Práctica):</strong> 4 etapas clínicas con pacientes simulados (OSCE) en Medicina Interna, Pediatría, Cirugía y Obstetricia/Ginecología.</li>
          </ul>
        </div>

        {/* Section 2 */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '30px', marginBottom: 24 }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: 14 }}>
            2. Convocatorias Oficiales 2026
          </h2>
          <p style={{ color: '#475569', fontSize: '0.94rem', lineHeight: 1.7, marginBottom: 12 }}>
            ASOFAMECH establece habitualmente dos llamados al año para el examen teórico:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginTop: 16 }}>
            <div style={{ padding: '18px', backgroundColor: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
              <span style={{ fontWeight: 700, color: '#0284c7', display: 'block', marginBottom: 4 }}>Convocatoria de Julio 2026</span>
              <span style={{ fontSize: '0.86rem', color: '#64748b' }}>Inscripciones abiertas usualmente entre abril y mayo en eunacom.cl.</span>
            </div>
            <div style={{ padding: '18px', backgroundColor: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
              <span style={{ fontWeight: 700, color: '#0284c7', display: 'block', marginBottom: 4 }}>Convocatoria de Diciembre 2026</span>
              <span style={{ fontSize: '0.86rem', color: '#64748b' }}>Inscripciones abiertas habitualmente entre septiembre y octubre.</span>
            </div>
          </div>
        </div>

        {/* Section 3 */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '30px', marginBottom: 24 }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: 14 }}>
            3. Requisitos para Médicos Graduados en el Extranjero
          </h2>
          <p style={{ color: '#475569', fontSize: '0.94rem', lineHeight: 1.7, marginBottom: 12 }}>
            Los médicos titulados fuera de Chile deben presentar ante ASOFAMECH:
          </p>
          <ul style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.7, paddingLeft: 20 }}>
            <li>Título profesional de Médico Cirujano apostillado o legalizado por Cancillería.</li>
            <li>Certificado de notas y concentración académica apostillada.</li>
            <li>Documento de identidad vigente (Pasaporte o Cédula de Identidad chilena).</li>
            <li>Pago del arancel de inscripción oficial fijado por ASOFAMECH.</li>
          </ul>
        </div>

        {/* Section 4 */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '30px', marginBottom: 24 }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: 14 }}>
            4. Cómo Estudiar de Manera Efectiva
          </h2>
          <p style={{ color: '#475569', fontSize: '0.94rem', lineHeight: 1.7, marginBottom: 14 }}>
            La tasa de aprobación en el primer intento aumenta más de un 80% cuando se entrena con preguntas de casos clínicos reales y reconstrucciones de exámenes pasados.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                backgroundColor: '#0284c7', color: '#ffffff', border: 'none',
                padding: '12px 24px', borderRadius: 8, fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer'
              }}
            >
              Comenzar a Practicar Gratis →
            </button>
            <Link
              to="/simulacros-eunacom"
              style={{
                backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', color: '#334155',
                padding: '12px 20px', borderRadius: 8, fontSize: '0.95rem', fontWeight: 600, textDecoration: 'none'
              }}
            >
              Ver Simulacros Disponibles
            </Link>
          </div>
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer style={{ backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0', padding: '36px 20px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 14, flexWrap: 'wrap' }}>
          <Link to="/" style={{ color: '#475569', textDecoration: 'none', fontWeight: 600 }}>Inicio</Link>
          <Link to="/curso-eunacom-2026" style={{ color: '#475569', textDecoration: 'none', fontWeight: 600 }}>Mejor Curso 2026</Link>
          <Link to="/simulacros-eunacom" style={{ color: '#475569', textDecoration: 'none', fontWeight: 600 }}>Simulacros</Link>
          <Link to="/guia-eunacom-2026" style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 700 }}>Guía EUNACOM</Link>
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
