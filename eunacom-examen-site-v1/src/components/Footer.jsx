import React from 'react';
import { ShieldCheck, PhoneCall, Mail, MapPin, Award, BookOpen, ExternalLink, Heart } from 'lucide-react';

export default function Footer({ onOpenMentorship, onOpenSEOStudio }) {
  return (
    <footer style={{ backgroundColor: '#05223c', color: '#ffffff', paddingTop: '60px', paddingBottom: '36px' }}>
      <div className="container">
        {/* Main Footer Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '40px',
          marginBottom: '50px'
        }}>
          {/* Col 1: Brand & Authority */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#0b5ea8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: '900',
                fontSize: '1.1rem'
              }}>
                E
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: '900', letterSpacing: '-0.02em', color: '#ffffff' }}>
                EUNACOM <span style={{ color: '#a9d3f5' }}>EXAMEN</span>
              </span>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: '1.6', marginBottom: '18px' }}>
              Preparación para el EUNACOM Teórico dirigida a médicos nacionales y extranjeros que rinden en Chile.
            </p>

            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              borderRadius: '12px',
              padding: '12px 16px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <ShieldCheck size={24} color="#a9d3f5" />
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#ffffff' }}>
                  Dirección Médica y Docente
                </div>
                <div style={{ fontSize: '0.75rem', color: '#a9d3f5' }}>
                  Academia Examen EUNACOM
                </div>
              </div>
            </div>
          </div>

          {/* Col 2: Programas & Cursos */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#ffffff', marginBottom: '18px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Cursos y Preparación
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
              <li><a href="#cursos" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Curso Anual EUNACOM 2027</a></li>
              <li><a href="#cursos" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Semestral Intensivo Julio 2027</a></li>
              <li><a href="#cursos" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Intensivo Diciembre 2026</a></li>
              <li><a href="#cursos" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Simulador QBank 4.000+ Preguntas</a></li>
              <li><a href="#diagnostico" style={{ color: '#a9d3f5', fontWeight: '700', textDecoration: 'none' }}>→ Diagnóstico Gratuito 5 Preguntas</a></li>
            </ul>
          </div>

          {/* Col 3: Guías Clínicas & Normativa */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#ffffff', marginBottom: '18px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Guías & Revalidación
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
              <li><a href="#revalidacion" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Matriz de Revalidación de Título</a></li>
              <li><a href="#blog" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Fechas Oficiales EUNACOM 2026-2027</a></li>
              <li><a href="#blog" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Guía EUNACOM Práctico (ECOE)</a></li>
              <li><a href="#blog" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Requisitos de Apostilla y Legalización</a></li>
              <li><a href="#blog" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Sueldos Médicos y Sistema de Salud</a></li>
              <li><a href="#faq" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Preguntas Frecuentes (FAQ)</a></li>
            </ul>
          </div>

          {/* Col 4: Contacto Directo & Triage */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#ffffff', marginBottom: '18px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Atención Médica Directa
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.5', marginBottom: '16px' }}>
              ¿Dudas con tu país de egreso o convalidación de título? Escríbenos y te respondemos.
            </p>

            <button
              onClick={onOpenMentorship}
              className="btn btn-whatsapp"
              style={{
                width: '100%',
                padding: '10px 16px',
                fontSize: '0.88rem',
                marginBottom: '12px'
              }}
            >
              <PhoneCall size={16} />
              <span>WhatsApp: +56 9 7669 4606</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#94a3b8' }}>
              <Mail size={14} color="#a9d3f5" />
              <span>contacto@eunacom-examen.cl</span>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          paddingTop: '24px',
          marginBottom: '24px',
          fontSize: '0.76rem',
          color: '#64748b',
          lineHeight: '1.5',
          textAlign: 'justify'
        }}>
          <strong>Aviso de Independencia y Responsabilidad Académica:</strong> EUNACOM Examen Chile (eunacom-examen.cl) es una academia médica independiente de formación y entrenamiento clínico. No forma parte orgánica ni representa a la Asociación de Facultades de Medicina de Chile (ASOFAMECH), al Ministerio de Salud (MINSAL) ni al Ministerio de Relaciones Exteriores (MINREL). Las referencias a marcas, normativas y nombres de exámenes se efectúan con propósitos educativos, informativos y de orientación técnica según la Ley 19.039 de Propiedad Industrial de Chile.
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          fontSize: '0.78rem',
          color: '#94a3b8'
        }}>
          <div>
            © {new Date().getFullYear()} EUNACOM Examen Chile (eunacom-examen.cl). Todos los derechos reservados.
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={onOpenSEOStudio}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                fontSize: '0.76rem',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              SEO Studio & Lab
            </button>
            <span>Santiago de Chile</span>
            <span>Certificado SSL 256-Bit</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
