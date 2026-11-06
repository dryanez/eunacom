import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ShieldCheck } from 'lucide-react'

// Página legal simple (Reembolsos, Privacidad). sections: [{ id?, title, body?, paragraphs?, items?, contact? }]
export default function PolicyPage({ badge, title, effectiveDate, sections }) {
  const navigate = useNavigate()
  // La página carga diferida: el navegador ya intentó ir al #ancla, así que se hace aquí (#eliminar-datos)
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1))
    if (id) document.getElementById(id)?.scrollIntoView()
  }, [])

  return (
    <div style={{ backgroundColor: '#ffffff', color: '#0f172a', fontFamily: 'Lexend, -apple-system, sans-serif', minHeight: '100vh' }}>
      {/* Nav */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e2e8f0',
        padding: '0 24px', height: '64px',
        display: 'flex', alignItems: 'center',
        maxWidth: '1200px', margin: '0 auto'
      }}>
        <button
          onClick={() => navigate('/')}
          style={{ background: 'none', border: 'none', color: '#475569', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <ArrowLeft size={18} /> Volver al Inicio
        </button>
      </header>

      {/* Main Header */}
      <div style={{ padding: '60px 24px 32px', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          backgroundColor: '#f0f9ff', border: '1px solid #bae6fd',
          color: '#0369a1', padding: '4px 14px', borderRadius: 9999,
          fontSize: '0.8rem', fontWeight: 600, marginBottom: 16
        }}>
          <ShieldCheck size={14} color="#0284c7" /> {badge}
        </div>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 800, color: '#0f172a', marginBottom: 12, letterSpacing: '-0.02em' }}>
          {title}
        </h1>
        <p style={{ fontSize: '0.95rem', color: '#64748b', margin: 0 }}>
          Vigente desde el {effectiveDate}
        </p>
      </div>

      {/* Content */}
      <main style={{ maxWidth: '760px', margin: '0 auto', padding: '0 24px 60px' }}>
        {sections.map((sec) => (
          <section key={sec.title} id={sec.id} style={{ marginBottom: 32, scrollMarginTop: 80 }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: 10, borderBottom: '2px solid #f1f5f9', paddingBottom: 8 }}>
              {sec.title}
            </h2>
            {sec.body && (
              <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.7, margin: 0 }}>{sec.body}</p>
            )}
            {sec.paragraphs && sec.paragraphs.map(p => (
              <p key={p} style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.7, margin: '0 0 10px' }}>{p}</p>
            ))}
            {sec.items && (
              <ul style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.7, margin: 0, paddingLeft: 20 }}>
                {sec.items.map(item => <li key={item} style={{ marginBottom: 6 }}>{item}</li>)}
              </ul>
            )}
            {sec.contact && (
              <ul style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.7, margin: '10px 0 0', paddingLeft: 20 }}>
                <li>Correo: <a href="mailto:contacto@eunacomapp.cl" style={{ color: '#0284c7' }}>contacto@eunacomapp.cl</a></li>
                <li>WhatsApp: +1 (929) 360-3799</li>
              </ul>
            )}
          </section>
        ))}
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0', padding: '36px 24px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
        <p style={{ margin: 0 }}>© {new Date().getFullYear()} Eunacom App · eunacomapp.cl · Todos los derechos reservados · Chile</p>
      </footer>
    </div>
  )
}
