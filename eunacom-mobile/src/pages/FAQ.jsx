import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, ArrowLeft, BookOpen, HelpCircle, ArrowRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { usePageSeo } from '../lib/seo'

const FAQ_SECTIONS = [
  {
    section: '📋 Sobre el Examen EUNACOM',
    items: [
      {
        q: '¿Qué es el EUNACOM?',
        a: 'El EUNACOM (Examen Único Nacional de Conocimientos de Medicina) es la prueba oficial exigida en Chile para revalidar títulos de Medicina emitidos en el extranjero, ejercer en el sistema de salud público (FONASA, hospitales, CESFAM, consultorios) y postular a becas de especialidad del Estado. Está a cargo de ASOFAMECH.',
      },
      {
        q: '¿Cuándo es el EUNACOM 2026?',
        a: 'El EUNACOM 2026 se rinde habitualmente en dos convocatorias anuales: la primera en Julio y la segunda en Diciembre. Las fechas exactas de inscripción y rendición son publicadas por ASOFAMECH en eunacom.cl con semanas de antelación.',
      },
      {
        q: '¿Cuántas preguntas tiene el examen teórico (EUNACOM-ST)?',
        a: 'El componente teórico EUNACOM-ST consta de 180 preguntas de selección múltiple con 5 alternativas (A, B, C, D, E). Se rinde en una sesión de 4 horas.',
      },
      {
        q: '¿Cuáles son las 7 áreas temáticas evaluadas?',
        a: 'Las preguntas se distribuyen en: (1) Medicina Interna (~30%), (2) Pediatría (~18%), (3) Obstetricia y Ginecología (~15%), (4) Cirugía (~12%), (5) Psiquiatría (~10%), (6) Especialidades ambulatorias (~8%) y (7) Salud Pública (~7%).',
      },
      {
        q: '¿Cuál es el puntaje mínimo para aprobar el EUNACOM?',
        a: 'El puntaje de corte para aprobar el EUNACOM teórico es 51% de respuestas correctas (al menos 92 de 180 preguntas correctas).',
      },
      {
        q: '¿Qué médicos deben rendir el examen?',
        a: 'Todos los egresados de escuelas de medicina en Chile (como requisito de titulación/habilitación) y todos los médicos titulados en el extranjero que deseen ejercer la profesión médica legalmente en Chile.',
      },
    ],
  },
  {
    section: '💻 Sobre la Plataforma Eunacom App',
    items: [
      {
        q: '¿Qué incluye Eunacom App?',
        a: 'Es un Curso Completo Todo-en-Uno que incluye el Curso Audiovisual de +650 Clases en Video (100% alineadas al Perfil de Conocimientos EUNACOM), Banco de +10.000 preguntas de casos clínicos justificadas, reconstrucciones oficiales de exámenes pasados, simulacros completos de 180 preguntas cronometrados y plan de estudio inteligente.',
      },
      {
        q: '¿Por qué las reconstrucciones de exámenes son tan efectivas?',
        a: 'Porque ASOFAMECH mantiene patrones de redacción, distractores y guías GES específicas. Practicar con reconstrucciones reales te permite familiarizarte con el examen exacto y evitar sorpresas en el día de la prueba.',
      },
      {
        q: '¿Cuánto cuesta el acceso y qué incluye cada plan?',
        a: 'Ofrecemos planes desde $14.990 CLP (1 Mes), $34.990 CLP (3 Meses), $54.990 CLP (6 Meses) hasta $89.990 CLP (1 Año). TODOS los planes incluyen acceso total al Curso de +650 Clases en Video + Banco de +10.000 Preguntas + Reconstrucciones + Simulacros. El pago es único sin renovaciones automáticas mediante Webpay/MercadoPago y PayPal.',
      },
      {
        q: '¿Se renueva automáticamente mi suscripción?',
        a: 'No. No realizamos cobros automáticos ni guardamos tus datos de pago. Solo pagas una vez por el período que decides estudiar.',
      },
      {
        q: '¿Puedo usar la plataforma desde mi celular?',
        a: 'Sí. Eunacom App es una Progressive Web App (PWA). Puedes instalarla directamente en la pantalla de inicio de tu iPhone, iPad o Android y estudiar cómodamente en cualquier lugar.',
      },
    ],
  },
]

export default function FAQ() {
  const navigate = useNavigate()
  const [openIndex, setOpenIndex] = useState(null)

  usePageSeo({
    title: 'Preguntas Frecuentes EUNACOM 2026 | Respuestas y Dudas Oficiales – Eunacom App',
    description: 'Encuentra respuestas a todas las dudas sobre el examen EUNACOM teórico (ST) y práctico (SP), fechas 2026, puntajes de aprobación, temarios y uso de la plataforma Eunacom App.',
    canonical: 'https://www.eunacomapp.cl/faq'
  })

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_SECTIONS.flatMap(s =>
      s.items.map(item => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      }))
    ),
  }

  const toggleItem = (secIdx, itemIdx) => {
    const key = `${secIdx}-${itemIdx}`
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div style={{ backgroundColor: '#ffffff', color: '#0f172a', fontFamily: 'Lexend, -apple-system, sans-serif', minHeight: '100vh' }}>
      {/* Schema SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Nav */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e2e8f0',
        padding: '0 24px', height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        maxWidth: '1200px', margin: '0 auto'
      }}>
        <button
          onClick={() => navigate('/')}
          style={{ background: 'none', border: 'none', color: '#475569', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <ArrowLeft size={18} /> Volver al Inicio
        </button>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => openAuthModal('login')}
            style={{ background: 'none', border: '1px solid #cbd5e1', color: '#334155', padding: '6px 14px', borderRadius: 8, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => openAuthModal('register')}
            style={{ backgroundColor: '#0284c7', color: '#ffffff', border: 'none', padding: '6px 16px', borderRadius: 8, fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
          >
            Crear Cuenta
          </button>
        </div>
      </header>

      {/* Main Header */}
      <div style={{ padding: '60px 24px 32px', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          backgroundColor: '#f0f9ff', border: '1px solid #bae6fd',
          color: '#0369a1', padding: '4px 14px', borderRadius: 9999,
          fontSize: '0.8rem', fontWeight: 600, marginBottom: 16
        }}>
          <HelpCircle size={14} color="#0284c7" /> Centro de Ayuda & FAQ
        </div>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 800, color: '#0f172a', marginBottom: 12, letterSpacing: '-0.02em' }}>
          Preguntas Frecuentes EUNACOM
        </h1>
        <p style={{ fontSize: '1rem', color: '#64748b', lineHeight: 1.6, maxWidth: '600px', margin: '0 auto' }}>
          Todo lo que necesitas saber sobre el examen, ponderaciones, habilitación profesional y cómo estudiar con nuestra plataforma.
        </p>
      </div>

      {/* Content */}
      <main style={{ maxWidth: '860px', margin: '0 auto', padding: '0 24px 60px' }}>
        {FAQ_SECTIONS.map((sec, secIdx) => (
          <div key={secIdx} style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: 16, borderBottom: '2px solid #f1f5f9', paddingBottom: 8 }}>
              {sec.section}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {sec.items.map((item, itemIdx) => {
                const isOpen = openItems[`${secIdx}-${itemIdx}`]
                return (
                  <div
                    key={itemIdx}
                    onClick={() => toggleItem(secIdx, itemIdx)}
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: 12,
                      padding: '16px 20px',
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0, paddingRight: 12 }}>{item.q}</h3>
                      <ChevronDown size={18} color="#64748b" style={{ flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                    </div>
                    {isOpen && (
                      <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.65, marginTop: 12, marginBottom: 0 }}>
                        {item.a}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {/* CTA Card */}
        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 20,
          padding: '36px',
          textAlign: 'center',
          marginTop: 48
        }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>¿Listo para comenzar a practicar?</h3>
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: 24, maxWidth: '500px', margin: '0 auto 24px' }}>
            Accede a más de 10.000 preguntas reales y simulacros oficiales desde $14.990 CLP.
          </p>
          <button
            onClick={() => openAuthModal('register')}
            style={{
              backgroundColor: '#0284c7', color: '#ffffff', border: 'none',
              padding: '12px 28px', borderRadius: 10, fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 8
            }}
          >
            Crear Cuenta Ahora <ArrowRight size={16} />
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0', padding: '36px 24px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
        <p style={{ margin: 0 }}>© {new Date().getFullYear()} Eunacom App · eunacomapp.cl · Todos los derechos reservados · Chile</p>
      </footer>
    </div>
  )
}
