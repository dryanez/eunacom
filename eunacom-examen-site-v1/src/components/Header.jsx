import React, { useState } from 'react';
import { Stethoscope, Menu, X, PhoneCall, BookOpen, GraduationCap, FileCheck2, Video } from 'lucide-react';

export default function Header({ onOpenMentorship, onSelectCourse }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      boxShadow: '0 2px 8px rgba(8, 54, 95, 0.06)'
    }}>
      {/* Top Notification Bar */}
      <div style={{
        backgroundColor: '#08365f',
        color: '#ffffff',
        padding: '6px 16px',
        fontSize: '0.8rem',
        textAlign: 'center',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
      }}>
        <span style={{
          backgroundColor: '#0b5ea8',
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '0.75rem',
          fontWeight: '700'
        }}>CONVOCATORIAS 2026 - 2027</span>
        <span>Inscripciones abiertas para cursos teóricos y prácticos EUNACOM con seguimiento médico personalizado.</span>
      </div>

      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '74px'
      }}>
        {/* Logo */}
        <a href="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          textDecoration: 'none'
        }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #08365f 0%, #0b5ea8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 10px rgba(8, 54, 95, 0.2)'
          }}>
            <Stethoscope size={24} />
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.25rem',
              fontWeight: '800',
              color: '#08365f',
              letterSpacing: '-0.02em',
              lineHeight: '1.1'
            }}>
              EUNACOM <span style={{ color: '#0b5ea8' }}>EXAMEN</span>
            </div>
            <div style={{
              fontSize: '0.7rem',
              color: '#64748b',
              fontWeight: '600',
              letterSpacing: '0.04em',
              textTransform: 'uppercase'
            }}>
              Preparación & Revalidación Médica
            </div>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav style={{
          display: 'none',
          alignItems: 'center',
          gap: '28px'
        }} className="desktop-nav">
          <a href="#cursos" style={{ fontWeight: '600', fontSize: '0.9rem', color: '#41556b' }}>Cursos 2027</a>
          <a href="#revalidacion" style={{ fontWeight: '600', fontSize: '0.9rem', color: '#41556b' }}>Revalidación</a>
          <a href="#diagnostico" style={{ fontWeight: '600', fontSize: '0.9rem', color: '#41556b' }}>Simulacro Gratis</a>
          <a href="#masterclass" style={{ fontWeight: '600', fontSize: '0.9rem', color: '#41556b' }}>Masterclass Video</a>
          <a href="#blog" style={{ fontWeight: '600', fontSize: '0.9rem', color: '#41556b' }}>Guías & Blog</a>
          <a href="#faq" style={{ fontWeight: '600', fontSize: '0.9rem', color: '#41556b' }}>Preguntas</a>
        </nav>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onOpenMentorship}
            className="btn btn-secondary"
            style={{
              padding: '8px 16px',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <PhoneCall size={15} color="#0b5ea8" />
            <span>Hablar con un Doctor</span>
          </button>

          <a
            href="#cursos"
            className="btn btn-primary"
            style={{
              padding: '9px 18px',
              fontSize: '0.85rem',
              display: 'none'
            }}
            className="desktop-enroll-btn"
          >
            Ver Cursos
          </a>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#08365f',
              padding: '6px'
            }}
            className="mobile-menu-toggle"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: '#ffffff',
          borderTop: '1px solid #e2e8f0',
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
        }}>
          <a
            href="#cursos"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontWeight: '600', color: '#08365f', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <GraduationCap size={18} color="#0b5ea8" /> Cursos Teóricos y Prácticos
          </a>
          <a
            href="#revalidacion"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontWeight: '600', color: '#08365f', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <FileCheck2 size={18} color="#0b5ea8" /> Matriz de Revalidación Médica
          </a>
          <a
            href="#diagnostico"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontWeight: '600', color: '#08365f', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <BookOpen size={18} color="#0b5ea8" /> Simulacro Diagnóstico Gratis
          </a>
          <a
            href="#masterclass"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontWeight: '600', color: '#08365f', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Video size={18} color="#0b5ea8" /> Masterclass Video Player
          </a>
          <a
            href="#blog"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontWeight: '600', color: '#08365f', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <BookOpen size={18} color="#0b5ea8" /> Artículos & Blog SEO
          </a>
          <div style={{ paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenMentorship();
              }}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Consultar con la academia
            </button>
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 900px) {
          .desktop-nav {
            display: flex !important;
          }
          .desktop-enroll-btn {
            display: inline-flex !important;
          }
        }
        @media (max-width: 899px) {
          .mobile-menu-toggle {
            display: block !important;
          }
        }
      `}</style>
    </header>
  );
}
