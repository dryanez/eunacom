import React from 'react';
import { Award, ShieldCheck, CheckCircle2, ArrowRight, Play, Users, Star, Sparkles } from 'lucide-react';

export default function Hero({ onOpenMentorship, onStartDiagnostic }) {
  return (
    <section style={{
      background: 'linear-gradient(180deg, #08365f 0%, #0b5ea8 60%, #1275d3 100%)',
      color: '#ffffff',
      padding: '70px 0 90px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Decorative Circles */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-5%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(169, 211, 245, 0.15) 0%, rgba(8, 54, 95, 0) 70%)',
        pointerEvents: 'none'
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '40px',
          alignItems: 'center'
        }} className="hero-grid">

          <div>
            {/* Pill Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(8px)',
              padding: '6px 14px',
              borderRadius: '9999px',
              border: '1px solid rgba(169, 211, 245, 0.4)',
              fontSize: '0.85rem',
              fontWeight: '600',
              marginBottom: '20px'
            }}>
              <ShieldCheck size={16} color="#a9d3f5" />
              <span>Convocatorias Oficiales EUNACOM Julio y Diciembre 2026 - 2027</span>
            </div>

            <h1 style={{
              fontSize: 'clamp(2.1rem, 4vw, 3.4rem)',
              fontWeight: '900',
              lineHeight: '1.15',
              color: '#ffffff',
              marginBottom: '20px',
              letterSpacing: '-0.02em'
            }}>
              Aprueba el <span style={{ color: '#a9d3f5' }}>EUNACOM</span> con el método que ordena tu tiempo y asegura tu habilitación médica
            </h1>

            <p style={{
              fontSize: '1.15rem',
              color: '#eef5fb',
              lineHeight: '1.6',
              marginBottom: '32px',
              maxWidth: '640px',
              fontWeight: '400'
            }}>
              Preparación integral para médicos nacionales y extranjeros. 86 clases grabadas del perfil oficial ASOFAMECH, banco de 4.000+ preguntas comentadas, simuladores ECOE práctico y tutoría médica individualizada.
            </p>

            {/* CTAs */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px',
              marginBottom: '40px'
            }}>
              <a
                href="#cursos"
                className="btn"
                style={{
                  backgroundColor: '#ffffff',
                  color: '#08365f',
                  fontWeight: '700',
                  fontSize: '1.05rem',
                  padding: '14px 28px',
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)'
                }}
              >
                <span>Ver Cursos 2026 - 2027</span>
                <ArrowRight size={18} />
              </a>

              <button
                onClick={onStartDiagnostic}
                className="btn"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  border: '1.5px solid rgba(255, 255, 255, 0.4)',
                  backdropFilter: 'blur(6px)',
                  fontWeight: '600',
                  fontSize: '1rem',
                  padding: '14px 24px'
                }}
              >
                <Play size={17} color="#a9d3f5" />
                <span>Simulacro Diagnóstico Gratis</span>
              </button>
            </div>

            {/* Key Value Checklist */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '12px',
              fontSize: '0.9rem',
              color: '#eef5fb'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} color="#a9d3f5" />
                <span>86 clases del temario ASOFAMECH</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} color="#a9d3f5" />
                <span>4.000+ preguntas con justificación</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} color="#a9d3f5" />
                <span>Entrenamiento ECOE práctico</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} color="#a9d3f5" />
                <span>Tutoría con Director Académico</span>
              </div>
            </div>
          </div>

          {/* Right Authority Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(12px)',
            border: '1.5px solid rgba(169, 211, 245, 0.25)',
            borderRadius: '24px',
            padding: '32px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ffffff 0%, #a9d3f5 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#08365f',
                fontWeight: '900',
                fontSize: '1.5rem',
                border: '3px solid #ffffff',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}>
                FY
              </div>
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#ffffff' }}>
                  Dr. Felipe Yáñez
                </div>
                <div style={{ fontSize: '0.85rem', color: '#a9d3f5', fontWeight: '600' }}>
                  Director Académico EUNACOM
                </div>
                <div style={{ fontSize: '0.75rem', color: '#eef5fb', opacity: 0.9 }}>
                  Médico Cirujano USACH · RNPI Nº 642819
                </div>
              </div>
            </div>

            <p style={{
              fontSize: '0.95rem',
              color: '#eef5fb',
              lineHeight: '1.6',
              marginBottom: '24px',
              fontStyle: 'italic',
              borderLeft: '3px solid #a9d3f5',
              paddingLeft: '14px'
            }}>
              "El EUNACOM no se aprueba acumulando manuales, sino conociendo el perfil epidemiológico de Chile, entrenando la resistencia a las 3 horas de examen y analizando por qué cada distractor parece correcto."
            </p>

            <button
              onClick={onOpenMentorship}
              className="btn btn-whatsapp"
              style={{
                width: '100%',
                padding: '13px 20px',
                fontSize: '0.95rem',
                fontWeight: '700'
              }}
            >
              <span>Solicitar Evaluación de Perfil por WhatsApp</span>
            </button>
          </div>

        </div>

        {/* Live Metrics Strip */}
        <div style={{
          marginTop: '60px',
          paddingTop: '36px',
          borderTop: '1px solid rgba(169, 211, 245, 0.2)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '24px',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ fontSize: '2.4rem', fontWeight: '900', color: '#ffffff' }}>4.000+</div>
            <div style={{ fontSize: '0.85rem', color: '#a9d3f5', fontWeight: '600', textTransform: 'uppercase' }}>Preguntas Comentadas</div>
          </div>
          <div>
            <div style={{ fontSize: '2.4rem', fontWeight: '900', color: '#ffffff' }}>86</div>
            <div style={{ fontSize: '0.85rem', color: '#a9d3f5', fontWeight: '600', textTransform: 'uppercase' }}>Clases Temario Oficial</div>
          </div>
          <div>
            <div style={{ fontSize: '2.4rem', fontWeight: '900', color: '#ffffff' }}>94.2%</div>
            <div style={{ fontSize: '0.85rem', color: '#a9d3f5', fontWeight: '600', textTransform: 'uppercase' }}>Tasa de Aprobación</div>
          </div>
          <div>
            <div style={{ fontSize: '2.4rem', fontWeight: '900', color: '#ffffff' }}>12 Meses</div>
            <div style={{ fontSize: '0.85rem', color: '#a9d3f5', fontWeight: '600', textTransform: 'uppercase' }}>Acompañamiento Continuo</div>
          </div>
        </div>

      </div>

      <style>{`
        @media (min-width: 900px) {
          .hero-grid {
            grid-template-columns: 1.25fr 0.85fr !important;
          }
        }
      `}</style>
    </section>
  );
}
