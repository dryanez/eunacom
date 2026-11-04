import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { usePageSeo } from '../lib/seo'

export const REFUND_POLICY_EFFECTIVE_DATE = '1 de noviembre de 2026'

const SECTIONS = [
  {
    title: '1. Producto digital con activación inmediata',
    body: 'Eunacom App es un servicio 100% digital. Al confirmarse el pago (Webpay, Mercado Pago, PayPal o transferencia validada), tu cuenta pasa a Premium de forma inmediata y obtienes acceso completo a las clases en video, el banco de preguntas, las reconstrucciones y los simulacros durante el período del plan que elegiste.',
  },
  {
    title: '2. Sin reembolsos una vez activado el acceso',
    body: 'Como el contenido queda disponible en el mismo momento del pago, no realizamos reembolsos totales ni parciales una vez activado el acceso Premium, ni por tiempo no utilizado del plan. Al pagar, aceptas expresamente que el servicio comienza a prestarse de inmediato y que, de acuerdo con el artículo 3 bis letra b) de la Ley N° 19.496, no procede el derecho de retracto.',
  },
  {
    title: '3. Excepciones',
    items: [
      'Cobro duplicado o monto cobrado distinto al precio publicado: devolvemos la diferencia o el cobro duplicado.',
      'Pago confirmado sin que tu cuenta se active, y no logramos activarla dentro de 5 días hábiles desde que nos contactas: devolvemos el 100% del pago.',
      'Falla técnica de nuestra plataforma que te impida acceder al contenido y que no podamos resolver dentro de 5 días hábiles desde que nos contactas: devolvemos el 100% del pago.',
    ],
  },
  {
    title: '4. Sin renovaciones automáticas',
    body: 'Todos los planes son de pago único. No guardamos tus datos de pago ni hacemos cobros recurrentes: al terminar tu plan, el acceso Premium simplemente expira.',
  },
  {
    title: '5. Antes de abrir un reclamo, escríbenos',
    body: 'Si tienes cualquier problema con tu acceso o con un cobro, contáctanos primero para resolverlo. Respondemos en un plazo máximo de 2 días hábiles.',
    contact: true,
  },
]

export default function Reembolsos() {
  const navigate = useNavigate()

  usePageSeo({
    title: 'Política de Reembolsos | Eunacom App',
    description: 'Política de reembolsos de Eunacom App: acceso digital con activación inmediata, sin reembolsos una vez activado el acceso Premium, excepciones por cobro duplicado o falla técnica.',
    canonical: 'https://www.eunacomapp.cl/reembolsos'
  })

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
          <ShieldCheck size={14} color="#0284c7" /> Términos de compra
        </div>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 800, color: '#0f172a', marginBottom: 12, letterSpacing: '-0.02em' }}>
          Política de Reembolsos
        </h1>
        <p style={{ fontSize: '0.95rem', color: '#64748b', margin: 0 }}>
          Vigente desde el {REFUND_POLICY_EFFECTIVE_DATE}
        </p>
      </div>

      {/* Content */}
      <main style={{ maxWidth: '760px', margin: '0 auto', padding: '0 24px 60px' }}>
        {SECTIONS.map((sec) => (
          <section key={sec.title} style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: 10, borderBottom: '2px solid #f1f5f9', paddingBottom: 8 }}>
              {sec.title}
            </h2>
            {sec.body && (
              <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.7, margin: 0 }}>{sec.body}</p>
            )}
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
