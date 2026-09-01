import React from 'react';
import { X, CheckCircle2, BookOpen, Clock, Calendar, ArrowRight } from 'lucide-react';

export default function CourseDetailModal({ course, onClose, onSelectCourse }) {
  if (!course) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(8, 54, 95, 0.75)',
      backdropFilter: 'blur(6px)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '750px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div style={{
          backgroundColor: '#08365f',
          color: '#ffffff',
          padding: '24px 30px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div>
            <span style={{
              backgroundColor: '#0b5ea8',
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: '700',
              padding: '3px 10px',
              borderRadius: '6px',
              display: 'inline-block',
              marginBottom: '6px'
            }}>
              {course.badge}
            </span>
            <h3 style={{ fontSize: '1.35rem', fontWeight: '800', margin: 0, color: '#ffffff' }}>
              Temario Oficial: {course.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '28px 30px', overflowY: 'auto', flex: 1 }}>
          <div style={{
            display: 'flex',
            gap: '20px',
            backgroundColor: '#eef5fb',
            padding: '16px 20px',
            borderRadius: '12px',
            marginBottom: '24px',
            fontSize: '0.88rem',
            color: '#08365f'
          }}>
            <div><strong>Duración:</strong> {course.duration}</div>
            <div><strong>Meta:</strong> {course.targetExam}</div>
            <div><strong>Inversión:</strong> {course.priceCLP}</div>
          </div>

          <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#08365f', marginBottom: '16px' }}>
            Desglose de Módulos y Clases Grabadas ({course.syllabus.length} Módulos)
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {course.syllabus.map((module, idx) => (
              <div
                key={idx}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '18px 20px',
                  backgroundColor: '#ffffff'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '10px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      backgroundColor: '#0b5ea8',
                      color: '#ffffff',
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: '700'
                    }}>
                      {idx + 1}
                    </div>
                    <span style={{ fontWeight: '700', fontSize: '1rem', color: '#08365f' }}>
                      {module.module}
                    </span>
                  </div>
                  <span style={{
                    fontSize: '0.8rem',
                    color: '#0b5ea8',
                    fontWeight: '700',
                    backgroundColor: '#eef5fb',
                    padding: '3px 10px',
                    borderRadius: '6px'
                  }}>
                    {module.classes}
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  paddingLeft: '36px'
                }}>
                  {module.topics.map((topic, tIdx) => (
                    <span
                      key={tIdx}
                      style={{
                        backgroundColor: '#f1f5f9',
                        color: '#475569',
                        fontSize: '0.8rem',
                        padding: '3px 10px',
                        borderRadius: '6px',
                        fontWeight: '500'
                      }}
                    >
                      • {topic}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '18px 30px',
          borderTop: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: '10px 20px', fontSize: '0.9rem' }}
          >
            Cerrar
          </button>
          <button
            onClick={() => {
              onClose();
              onSelectCourse(course);
            }}
            className="btn btn-primary"
            style={{ padding: '10px 24px', fontSize: '0.9rem' }}
          >
            <span>Inscribirme en {course.name}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
