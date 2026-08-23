import React, { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Building2, Users, Handshake, CheckCircle2,
  Mail, ShieldCheck, ArrowRight, Percent
} from 'lucide-react'
import { usePageSeo } from '../lib/seo'

export default function ConveniosLanding() {
  const navigate = useNavigate()

  usePageSeo({
    title: 'Convenios y Descuentos para Médicos e Instituciones | Eunacom App',
    description: 'Convenios especiales y tarifas grupales para médicos extranjeros, agrupaciones profesionales, centros de salud y clínicas en Chile para la preparación del EUNACOM.',
    canonical: 'https://www.eunacomapp.cl/convenios'
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
            Acceder
          </button>
        </nav>
      </header>

      {/* ── HERO ── */}
      <section style={{ padding: '50px 20px 30px', maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0',
          color: '#166534', padding: '6px 14px', borderRadius: 9999,
          fontSize: '0.82rem', fontWeight: 600, marginBottom: 16
        }}>
          <Handshake size={15} color="#16a34a" />
          <span>Alianzas Estratégicas y Descuentos Grupales</span>
        </div>

        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 18 }}>
          Convenios para <span style={{ color: '#0284c7' }}>Médicos e Instituciones</span>
        </h1>

        <p style={{ fontSize: '1.1rem', color: '#475569', maxWidth: '750px', margin: '0 auto 30px', lineHeight: 1.6 }}>
          Facilitamos el proceso de homologación y habilitación profesional en Chile mediante alianzas preferenciales para grupos de estudio, asociaciones de médicos y centros asistenciales.
        </p>
      </section>

      {/* ── TYPES OF CONVENIOS ── */}
      <section style={{ padding: '20px 20px 60px', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Users size={22} color="#0284c7" />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 10 }}>Grupos de Estudio (3+ Médicos)</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 16 }}>
              Si estás preparando el EUNACOM junto a tus colegas o compañeros de internado, obtén descuentos especiales de hasta un 30% en planes semestrales y anuales.
            </p>
          </div>

          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Building2 size={22} color="#16a34a" />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 10 }}>Asociaciones Médicas</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 16 }}>
              Convenios directos con agrupaciones de médicos extranjeros residentes en Chile (Venezuela, Colombia, Cuba, Ecuador, Perú, etc.) con tarifas preferenciales.
            </p>
          </div>

          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Percent size={22} color="#d97706" />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 10 }}>Clínicas y Redes de Salud</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 16 }}>
              Planes corporativos con panel de seguimiento para capacitar a médicos generales y personal de salud en proceso de regularización profesional.
            </p>
          </div>
        </div>

        {/* Contact box */}
        <div style={{ marginTop: 40, padding: '36px', backgroundColor: '#f8fafc', borderRadius: 16, border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 8 }}>¿Deseas solicitar un convenio o descuento grupal?</h3>
          <p style={{ color: '#64748b', fontSize: '0.95rem', maxWidth: '600px', margin: '0 auto 20px', lineHeight: 1.6 }}>
            Escríbenos directamente indicando la cantidad de médicos o el nombre de tu institución para enviarte una cotización personalizada en menos de 24 horas.
          </p>
          <a
            href="mailto:contacto@eunacomapp.cl?subject=Solicitud%20de%20Convenio%20EUNACOM%20APP"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              backgroundColor: '#0284c7', color: '#ffffff', textDecoration: 'none',
              padding: '12px 24px', borderRadius: 8, fontSize: '0.95rem', fontWeight: 700
            }}
          >
            <Mail size={18} /> Contactar a Soporte Institucional
          </a>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0', padding: '36px 20px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 14, flexWrap: 'wrap' }}>
          <Link to="/" style={{ color: '#475569', textDecoration: 'none', fontWeight: 600 }}>Inicio</Link>
          <Link to="/curso-eunacom-2026" style={{ color: '#475569', textDecoration: 'none', fontWeight: 600 }}>Mejor Curso 2026</Link>
          <Link to="/simulacros-eunacom" style={{ color: '#475569', textDecoration: 'none', fontWeight: 600 }}>Simulacros</Link>
          <Link to="/guia-eunacom-2026" style={{ color: '#475569', textDecoration: 'none', fontWeight: 600 }}>Guía EUNACOM</Link>
          <Link to="/reconstrucciones-eunacom" style={{ color: '#475569', textDecoration: 'none', fontWeight: 600 }}>Reconstrucciones</Link>
          <Link to="/convenios" style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 700 }}>Convenios</Link>
          <Link to="/faq" style={{ color: '#475569', textDecoration: 'none', fontWeight: 600 }}>FAQ</Link>
          <Link to="/blog" style={{ color: '#475569', textDecoration: 'none', fontWeight: 600 }}>Blog</Link>
        </div>
        <p style={{ margin: 0 }}>© {new Date().getFullYear()} Eunacom App · eunacomapp.cl · Todos los derechos reservados · Chile</p>
      </footer>
    </div>
  )
}
