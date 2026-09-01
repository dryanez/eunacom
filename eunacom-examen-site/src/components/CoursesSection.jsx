import React, { useState } from 'react';
import { COURSES } from '../data/coursesData';
import { Check, Star, BookOpen, Calendar, Clock, ArrowRight, Shield, Sparkles, HelpCircle } from 'lucide-react';

const THEORETICAL_SLUGS = ['anual', 'seis-julio', 'seis-diciembre'];
const PRACTICAL_SLUGS = ['practico', 'banco'];

export default function CoursesSection({ onSelectCourse, onViewDetails, onOpenMentorship }) {
  const [filter, setFilter] = useState('all');

  const filteredCourses = COURSES.filter(course => {
    if (filter === 'theoretical') return THEORETICAL_SLUGS.includes(course.slug);
    if (filter === 'practical') return PRACTICAL_SLUGS.includes(course.slug);
    return true;
  });

  return (
    <section id="cursos" style={{ padding: '80px 0', backgroundColor: '#f8fafc' }}>
      <div className="container">

        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 48px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#eef5fb',
            color: '#08365f',
            padding: '6px 16px',
            borderRadius: '9999px',
            fontSize: '0.85rem',
            fontWeight: '700',
            marginBottom: '14px',
            border: '1px solid rgba(11, 94, 168, 0.2)'
          }}>
            <Sparkles size={16} color="#0b5ea8" />
            <span>PROGRAMAS ACADÉMICOS HOMOLOGADOS</span>
          </div>

          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(1.9rem, 3.2vw, 2.7rem)',
            fontWeight: '900',
            color: '#08365f',
            lineHeight: '1.2',
            marginBottom: '16px'
          }}>
            Cursos de Preparación EUNACOM <span style={{ color: '#0b5ea8' }}>2026 - 2027</span>
          </h2>

          <p style={{
            fontSize: '1.05rem',
            color: '#41556b',
            lineHeight: '1.6'
          }}>
            Selecciona el plan que se ajusta a tu fecha de examen. Todos los programas teóricos incluyen acceso completo a la plataforma, simulacros con análisis de distractores y tutoría médica.
          </p>

          {/* Filter Pills */}
          <div style={{
            display: 'inline-flex',
            gap: '8px',
            backgroundColor: '#e2e8f0',
            padding: '4px',
            borderRadius: '12px',
            marginTop: '24px'
          }}>
            <button
              onClick={() => setFilter('all')}
              style={{
                border: 'none',
                padding: '8px 18px',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: filter === 'all' ? '#08365f' : 'transparent',
                color: filter === 'all' ? '#ffffff' : '#41556b'
              }}
            >
              Todos los Programas ({COURSES.length})
            </button>
            <button
              onClick={() => setFilter('theoretical')}
              style={{
                border: 'none',
                padding: '8px 18px',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: filter === 'theoretical' ? '#08365f' : 'transparent',
                color: filter === 'theoretical' ? '#ffffff' : '#41556b'
              }}
            >
              Examen Teórico (ST)
            </button>
            <button
              onClick={() => setFilter('practical')}
              style={{
                border: 'none',
                padding: '8px 18px',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: filter === 'practical' ? '#08365f' : 'transparent',
                color: filter === 'practical' ? '#ffffff' : '#41556b'
              }}
            >
              ECOE Práctico & Banco
            </button>
          </div>
        </div>

        {/* Course Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '28px',
          alignItems: 'stretch'
        }}>
          {filteredCourses.map((course) => {
            const isFeatured = course.destacado;

            return (
              <div
                key={course.slug}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  border: isFeatured ? '2.5px solid #0b5ea8' : '1px solid #e2e8f0',
                  boxShadow: isFeatured ? '0 16px 36px rgba(11, 94, 168, 0.15)' : '0 4px 14px rgba(0,0,0,0.04)',
                  borderRadius: '20px',
                  backgroundColor: '#ffffff',
                  padding: '32px'
                }}
              >
                {/* Popular Ribbon */}
                {isFeatured && (
                  <div style={{
                    position: 'absolute',
                    top: '-14px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#0b5ea8',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: '800',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    padding: '4px 16px',
                    borderRadius: '9999px',
                    boxShadow: '0 4px 10px rgba(11, 94, 168, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <Star size={13} fill="#ffffff" />
                    <span>MÁS ELEGIDO POR MÉDICOS</span>
                  </div>
                )}

                <div>
                  {/* Badge & Target */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '16px',
                    gap: '8px'
                  }}>
                    <span style={{
                      backgroundColor: isFeatured ? '#0b5ea8' : '#08365f',
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      padding: '4px 10px',
                      borderRadius: '6px'
                    }}>
                      {course.badge}
                    </span>
                    <span style={{
                      fontSize: '0.8rem',
                      color: '#64748b',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Calendar size={14} />
                      {course.examen}
                    </span>
                  </div>

                  {/* Course Title */}
                  <h3 style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.4rem',
                    fontWeight: '800',
                    color: '#08365f',
                    marginBottom: '10px',
                    lineHeight: '1.25'
                  }}>
                    {course.nombre}
                  </h3>

                  <p style={{
                    fontSize: '0.9rem',
                    color: '#64748b',
                    lineHeight: '1.5',
                    marginBottom: '20px'
                  }}>
                    {course.resumen}
                  </p>

                  {/* Pricing Box */}
                  <div style={{
                    backgroundColor: '#f1f5f9',
                    padding: '16px 20px',
                    borderRadius: '14px',
                    marginBottom: '24px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                      <span style={{
                        fontSize: '1.8rem',
                        fontWeight: '900',
                        color: '#08365f'
                      }}>
                        {course.precioClp}
                      </span>
                      <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '600' }}>
                        / {course.precioUsd}
                      </span>
                    </div>
                    <div style={{
                      fontSize: '0.8rem',
                      color: '#0b5ea8',
                      fontWeight: '600',
                      marginTop: '4px'
                    }}>
                      {course.precioNota}
                    </div>
                  </div>

                  {/* Features List */}
                  <div style={{ marginBottom: '28px' }}>
                    <div style={{
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      color: '#41556b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      marginBottom: '12px'
                    }}>
                      ¿Qué incluye el programa?
                    </div>

                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {(course.incluye || []).map((feature, idx) => (
                        <li key={idx} style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '10px',
                          fontSize: '0.88rem',
                          color: '#1e293b',
                          lineHeight: '1.4'
                        }}>
                          <Check size={16} color="#0b5ea8" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button
                    onClick={() => onSelectCourse(course)}
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      padding: '12px 20px',
                      fontSize: '0.95rem',
                      fontWeight: '700',
                      boxShadow: isFeatured ? '0 6px 18px rgba(11, 94, 168, 0.25)' : 'none'
                    }}
                  >
                    <span>Inscribirme en este Curso</span>
                    <ArrowRight size={16} />
                  </button>

                  <button
                    onClick={() => onViewDetails(course)}
                    className="btn btn-secondary"
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      fontSize: '0.85rem'
                    }}
                  >
                    <BookOpen size={15} />
                    <span>Ver Temario y Módulos ({(course.temario || []).length})</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* Guarantee Banner */}
        <div style={{
          marginTop: '56px',
          backgroundColor: '#08365f',
          color: '#ffffff',
          borderRadius: '20px',
          padding: '32px 40px',
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '24px',
          alignItems: 'center'
        }} className="guarantee-grid">
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '16px',
              backgroundColor: 'rgba(169, 211, 245, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Shield size={32} color="#a9d3f5" />
            </div>
            <div>
              <h4 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '6px', color: '#ffffff' }}>
                Garantía de Acompañamiento Continuo
              </h4>
              <p style={{ fontSize: '0.9rem', color: '#eef5fb', margin: 0, lineHeight: '1.5' }}>
                Si te inscribes en el Curso Anual y necesitas rendir en la convocatoria siguiente, mantienes tu acceso a clases, simuladores y tutoría médica sin ningún cargo adicional.
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'right' }} className="guarantee-cta">
            <button
              onClick={onOpenMentorship}
              className="btn btn-secondary"
              style={{
                backgroundColor: '#ffffff',
                color: '#08365f',
                fontWeight: '700',
                padding: '12px 24px',
                whiteSpace: 'nowrap'
              }}
            >
              <span>Consultar con un Asesor Médico</span>
            </button>
          </div>
        </div>

      </div>

      <style>{`
        @media (min-width: 900px) {
          .guarantee-grid {
            grid-template-columns: 1fr auto !important;
          }
        }
        @media (max-width: 899px) {
          .guarantee-cta {
            text-align: left !important;
          }
        }
      `}</style>
    </section>
  );
}
