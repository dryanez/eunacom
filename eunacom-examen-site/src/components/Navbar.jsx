import React, { useState } from 'react';
import { ShieldCheck, PhoneCall, Menu, X, ArrowRight, BookOpen, GraduationCap, Stethoscope } from 'lucide-react';

export default function Navbar({ onOpenMentorship, onSelectCourse }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      backgroundColor: '#08365f',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 4px 20px rgba(8, 54, 95, 0.2)'
    }}>
      {/* Top Banner */}
      <div style={{
        backgroundColor: '#05223c',
        color: '#a9d3f5',
        fontSize: '0.78rem',
        padding: '6px 0',
        textAlign: 'center',
        fontWeight: '600',
        letterSpacing: '0.02em',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <span>📢 Convocatorias Oficiales EUNACOM: Diciembre 2026 y Julio 2027 · Inscripciones y Becas Abiertas</span>
      </div>

      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '12px',
        paddingBottom: '12px'
      }}>
        {/* Brand Logo */}
        <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: '#0b5ea8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: '900',
            fontSize: '1.25rem',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)'
          }}>
            E
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.02em', lineHeight: '1.1' }}>
              EUNACOM <span style={{ color: '#a9d3f5' }}>EXAMEN</span>
            </div>
            <div style={{ fontSize: '0.68rem', color: '#a9d3f5', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Dr. Felipe Yáñez · RNPI 642819
            </div>
          </div>
        </a>

        {/* Desktop Nav Links */}
        <nav style={{ display: 'none', alignItems: 'center', gap: '22px' }} className="desktop-nav">
          <a href="#cursos" style={{ color: '#e2e8f0', textDecoration: 'none', fontSize: '0.88rem', fontWeight: '700', transition: 'color 0.2s' }}>
            Cursos 2026-2027
          </a>
          <a href="#diagnostico" style={{ color: '#e2e8f0', textDecoration: 'none', fontSize: '0.88rem', fontWeight: '700', transition: 'color 0.2s' }}>
            Diagnóstico Gratis
          </a>
          <a href="#revalidacion" style={{ color: '#e2e8f0', textDecoration: 'none', fontSize: '0.88rem', fontWeight: '700', transition: 'color 0.2s' }}>
            Revalidación
          </a>
          <a href="#clase-magistral" style={{ color: '#e2e8f0', textDecoration: 'none', fontSize: '0.88rem', fontWeight: '700', transition: 'color 0.2s' }}>
            Masterclass Video
          </a>
          <a href="#blog" style={{ color: '#e2e8f0', textDecoration: 'none', fontSize: '0.88rem', fontWeight: '700', transition: 'color 0.2s' }}>
            Guías Clínicas
          </a>
          <a href="#faq" style={{ color: '#e2e8f0', textDecoration: 'none', fontSize: '0.88rem', fontWeight: '700', transition: 'color 0.2s' }}>
            FAQ
          </a>
        </nav>

        {/* Action Buttons */}
        <div style={{ display: 'none', alignItems: 'center', gap: '10px' }} className="desktop-actions">
          <button
            onClick={onOpenMentorship}
            className="btn btn-whatsapp"
            style={{
              padding: '8px 14px',
              fontSize: '0.82rem',
              fontWeight: '700'
            }}
          >
            <PhoneCall size={15} />
            <span>Tutoría WhatsApp</span>
          </button>

          <a
            href="#cursos"
            className="btn btn-primary"
            style={{
              padding: '8px 16px',
              fontSize: '0.82rem',
              fontWeight: '700'
            }}
          >
            <span>Ver Cursos</span>
            <ArrowRight size={15} />
          </a>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display: 'block',
            background: 'none',
            border: 'none',
            color: '#ffffff',
            cursor: 'pointer',
            padding: '6px'
          }}
          className="mobile-toggle"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: '#05223c',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          <a
            href="#cursos"
            onClick={() => setMobileMenuOpen(false)}
            style={{ color: '#ffffff', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '700', padding: '6px 0' }}
          >
            Cursos y Precios 2026 - 2027
          </a>
          <a
            href="#diagnostico"
            onClick={() => setMobileMenuOpen(false)}
            style={{ color: '#ffffff', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '700', padding: '6px 0' }}
          >
            Simulacro Diagnóstico Gratuito (5 Preguntas)
          </a>
          <a
            href="#revalidacion"
            onClick={() => setMobileMenuOpen(false)}
            style={{ color: '#ffffff', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '700', padding: '6px 0' }}
          >
            Matriz de Revalidación & Apostilla
          </a>
          <a
            href="#clase-magistral"
            onClick={() => setMobileMenuOpen(false)}
            style={{ color: '#ffffff', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '700', padding: '6px 0' }}
          >
            Clase Magistral de Cardiología EUNACOM
          </a>
          <a
            href="#blog"
            onClick={() => setMobileMenuOpen(false)}
            style={{ color: '#ffffff', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '700', padding: '6px 0' }}
          >
            Centro de Inteligencia & Blog
          </a>
          <a
            href="#faq"
            onClick={() => setMobileMenuOpen(false)}
            style={{ color: '#ffffff', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '700', padding: '6px 0' }}
          >
            Preguntas Frecuentes
          </a>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenMentorship();
              }}
              className="btn btn-whatsapp"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <PhoneCall size={16} />
              <span>Consultar por WhatsApp Directo</span>
            </button>
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 900px) {
          .desktop-nav { display: flex !important; }
          .desktop-actions { display: flex !important; }
          .mobile-toggle { display: none !important; }
        }
      `}</style>
    </header>
  );
}
