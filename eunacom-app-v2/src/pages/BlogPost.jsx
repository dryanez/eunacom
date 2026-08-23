import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Calendar, Clock, ArrowRight, BookOpen } from 'lucide-react'
import { BLOG_POSTS } from '../data/blogPosts'
import { usePageSeo } from '../lib/seo'

function renderMarkdown(md) {
  if (!md) return ''
  let html = md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/^---$/gm, '<hr />')
    .replace(/\n\n/g, '</p><p>')

  html = html.replace(/(<li>.*<\/li>(\n|$))+/g, (match) => `<ul>${match}</ul>`)
  return `<p>${html}</p>`
}

export default function BlogPost() {
  const navigate = useNavigate()
  const { slug } = useParams()
  const post = BLOG_POSTS.find(p => p.slug === slug)

  usePageSeo({
    title: post?.metaTitle || 'Artículo EUNACOM | Blog Eunacom App',
    description: post?.metaDescription || 'Guías y artículos de preparación para el EUNACOM.',
    canonical: `https://www.eunacomapp.cl/blog/${slug}`,
    ogType: 'article'
  })

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  if (!post) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', color: '#0f172a', fontFamily: 'Lexend, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <h2>Artículo no encontrado</h2>
        <button onClick={() => navigate('/blog')} style={{ backgroundColor: '#0284c7', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer' }}>
          Volver al Blog
        </button>
      </div>
    )
  }

  const related = BLOG_POSTS.filter(p => p.slug !== slug).slice(0, 3)

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
          onClick={() => navigate('/blog')}
          style={{ background: 'none', border: 'none', color: '#475569', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <ArrowLeft size={18} /> Volver al Blog
        </button>
        <button
          onClick={() => navigate('/register')}
          style={{ backgroundColor: '#0284c7', color: '#ffffff', border: 'none', padding: '6px 16px', borderRadius: 8, fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
        >
          Crear Cuenta
        </button>
      </header>

      {/* Article Content */}
      <article style={{ maxWidth: '780px', margin: '0 auto', padding: '56px 24px 80px' }}>
        <div style={{
          display: 'inline-block',
          backgroundColor: '#e0f2fe',
          color: '#0369a1',
          border: '1px solid #bae6fd',
          fontSize: '0.78rem',
          fontWeight: 700,
          padding: '4px 12px',
          borderRadius: 9999,
          marginBottom: 20
        }}>
          {post.category}
        </div>

        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.7rem)', fontWeight: 800, color: '#0f172a', lineHeight: 1.2, letterSpacing: '-0.02em', marginBottom: 20 }}>
          {post.title}
        </h1>

        <div style={{ display: 'flex', gap: 16, alignItems: 'center', color: '#64748b', fontSize: '0.85rem', marginBottom: 40, borderBottom: '1px solid #f1f5f9', paddingBottom: 20 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Calendar size={14} /> {post.date}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={14} /> {post.readTime}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <BookOpen size={14} /> Redacción Médica
          </span>
        </div>

        <div
          className="blog-light-content"
          style={{ color: '#334155', lineHeight: 1.85, fontSize: '1.02rem' }}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
        />

        {/* CTA Banner */}
        <div style={{
          backgroundColor: '#f0f9ff',
          border: '1px solid #bae6fd',
          borderRadius: 20,
          padding: '36px',
          textAlign: 'center',
          marginTop: 64
        }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Prepárate para el EUNACOM con +10.000 preguntas</h3>
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: 24, maxWidth: '520px', margin: '0 auto 24px' }}>
            Accede a reconstrucciones oficiales, clases en video y simulacros cronometrados desde $14.990 CLP.
          </p>
          <button
            onClick={() => navigate('/register')}
            style={{
              backgroundColor: '#0284c7', color: '#ffffff', border: 'none',
              padding: '13px 32px', borderRadius: 10, fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 8
            }}
          >
            Comenzar a Practicar <ArrowRight size={16} />
          </button>
        </div>
      </article>

      {/* Related Posts */}
      {related.length > 0 && (
        <section style={{ maxWidth: '780px', margin: '0 auto', padding: '0 24px 80px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: 20 }}>Otros Artículos de Interés</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {related.map(rp => (
              <div
                key={rp.slug}
                onClick={() => navigate(`/blog/${rp.slug}`)}
                style={{
                  backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14,
                  padding: '18px', cursor: 'pointer', transition: 'all 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#0284c7'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'none' }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0f172a', lineHeight: 1.4, marginBottom: 8 }}>{rp.title}</div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={11} /> {rp.readTime}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer style={{ backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0', padding: '36px 24px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
        <p style={{ margin: 0 }}>© {new Date().getFullYear()} Eunacom App · eunacomapp.cl · Todos los derechos reservados · Chile</p>
      </footer>

      {/* Styles for article markdown content */}
      <style>{`
        .blog-light-content h2 {
          color: #0f172a;
          font-size: 1.5rem;
          font-weight: 800;
          margin: 40px 0 16px;
          letter-spacing: -0.02em;
        }
        .blog-light-content h3 {
          color: #1e293b;
          font-size: 1.2rem;
          font-weight: 700;
          margin: 28px 0 12px;
        }
        .blog-light-content p {
          margin-bottom: 20px;
        }
        .blog-light-content strong {
          color: #0f172a;
          font-weight: 700;
        }
        .blog-light-content em {
          color: #0284c7;
          font-style: italic;
        }
        .blog-light-content ul, .blog-light-content ol {
          padding-left: 24px;
          margin-bottom: 24px;
        }
        .blog-light-content li {
          margin-bottom: 8px;
        }
        .blog-light-content a {
          color: #0284c7;
          text-decoration: underline;
        }
        .blog-light-content hr {
          border: none;
          border-top: 1px solid #e2e8f0;
          margin: 36px 0;
        }
      `}</style>
    </div>
  )
}
