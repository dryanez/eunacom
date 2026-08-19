import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, Clock, ArrowRight, BookOpen } from 'lucide-react'
import { BLOG_POSTS } from '../data/blogPosts'

const CATEGORY_COLORS = {
  'Estrategia de Estudio': { bg: '#e0f2fe', text: '#0369a1', border: '#bae6fd' },
  'Información EUNACOM': { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' },
  'Recursos': { bg: '#f3e8ff', text: '#7e22ce', border: '#e9d5ff' },
}

export default function Blog() {
  const navigate = useNavigate()

  return (
    <div style={{ backgroundColor: '#ffffff', color: '#0f172a', fontFamily: 'Lexend, -apple-system, sans-serif', minHeight: '100vh' }}>
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
            onClick={() => navigate('/login')}
            style={{ background: 'none', border: '1px solid #cbd5e1', color: '#334155', padding: '6px 14px', borderRadius: 8, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => navigate('/register')}
            style={{ backgroundColor: '#0284c7', color: '#ffffff', border: 'none', padding: '6px 16px', borderRadius: 8, fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
          >
            Crear Cuenta
          </button>
        </div>
      </header>

      {/* Header */}
      <div style={{ padding: '60px 24px 36px', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          backgroundColor: '#f0f9ff', border: '1px solid #bae6fd',
          color: '#0369a1', padding: '4px 14px', borderRadius: 9999,
          fontSize: '0.8rem', fontWeight: 600, marginBottom: 16
        }}>
          <BookOpen size={14} color="#0284c7" /> Artículos & Guías Médicas
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: 12 }}>
          Blog EUNACOM 2026
        </h1>
        <p style={{ color: '#64748b', fontSize: '1.05rem', lineHeight: 1.6 }}>
          Estrategias de estudio, temarios oficiales, fechas de rendición y consejos de médicos aprobados en Chile.
        </p>
      </div>

      {/* Articles Grid */}
      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
          {BLOG_POSTS.map((post) => {
            const catStyle = CATEGORY_COLORS[post.category] || { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' }
            return (
              <article
                key={post.slug}
                onClick={() => navigate(`/blog/${post.slug}`)}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 18,
                  padding: '28px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#0284c7'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 12px 20px -4px rgba(0,0,0,0.06)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0'
                  e.currentTarget.style.transform = 'none'
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)'
                }}
              >
                <div style={{
                  display: 'inline-block',
                  backgroundColor: catStyle.bg,
                  color: catStyle.text,
                  border: `1px solid ${catStyle.border}`,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: 9999,
                  marginBottom: 16,
                  alignSelf: 'flex-start'
                }}>
                  {post.category}
                </div>

                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.4, marginBottom: 10 }}>
                  {post.title}
                </h2>

                <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: 24, flex: 1 }}>
                  {post.excerpt}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: '0.78rem', color: '#94a3b8' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={12} /> {post.date}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={12} /> {post.readTime}
                    </span>
                  </div>
                  <div style={{ color: '#0284c7', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700, fontSize: '0.85rem' }}>
                    Leer <ArrowRight size={14} />
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0', padding: '36px 24px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
        <p style={{ margin: 0 }}>© {new Date().getFullYear()} Eunacom App · eunacomapp.cl · Todos los derechos reservados · Chile</p>
      </footer>
    </div>
  )
}
