import { useState } from 'react'
import { sendCampaign } from '../lib/api'

export default function CampaignModal({ isOpen, onClose, targetUsers, adminEmail }) {
  const [isSending, setIsSending] = useState(false)
  const [statusMsg, setStatusMsg] = useState(null)
  
  if (!isOpen) return null

  // We extract just the emails that exist
  const targetEmails = targetUsers
    .map(u => u.email)
    .filter(email => email && email.includes('@'))

  const subject = "⏳ Queda 1 semana: Asegura tu puntaje EUNACOM"
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
      <p>Hola,</p>
      
      <p>El EUNACOM es el próximo 9 de julio. Estás en la última semana, y la mejor estrategia ahora es entrenar con <strong>preguntas reales</strong>.</p>
      
      <p>Hemos habilitado un <strong>Acceso de Último Minuto</strong>:</p>
      <ul style="list-style-type: none; padding-left: 0;">
        <li style="background-color: #fce7f3; padding: 12px; border-radius: 8px; color: #be185d; margin-bottom: 12px; border: 1px solid #f9a8d4;">✅ <strong>Reconstrucciones completas</strong> de exámenes pasados. <br><span style="font-size: 12px; text-transform: uppercase; font-weight: 900;">⭐ LO MÁS IMPORTANTE</span></li>
        <li style="padding: 6px 12px;">✅ <strong>7.000+ preguntas</strong> explicadas.</li>
        <li style="padding: 6px 12px;">✅ Modo Simulacro con tiempo real.</li>
      </ul>
      
      <p><strong>Todo por solo $5.000 CLP (o $5 USD).</strong></p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://eunacom.vercel.app/oferta" style="background-color: #2563eb; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px; display: inline-block;">Activar mi Acceso por $5.000</a>
      </div>
      
      <p>No dejes que los nervios te jueguen en contra. Asegura tu preparación hoy mismo.</p>
      <p>El equipo de EUNACOM App</p>
    </div>
  `

  const handleSend = async () => {
    if (targetEmails.length === 0) {
      setStatusMsg({ type: 'error', text: 'No hay correos válidos para enviar.' })
      return
    }

    if (!confirm(`¿Estás seguro de enviar esta campaña a ${targetEmails.length} usuarios?`)) {
      return
    }

    setIsSending(true)
    setStatusMsg(null)

    try {
      const res = await sendCampaign(adminEmail, targetEmails, subject, htmlContent)
      if (res.error) throw new Error(res.error)
      
      setStatusMsg({ type: 'success', text: '¡Campaña enviada con éxito!' })
      setTimeout(() => {
        onClose()
        setStatusMsg(null)
      }, 2000)
    } catch (err) {
      console.error(err)
      setStatusMsg({ type: 'error', text: err.message || 'Error al enviar campaña' })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'var(--surface-800, #1e293b)', border: '1px solid var(--border-color, #334155)',
        padding: '1.5rem', borderRadius: '12px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        width: '100%', maxWidth: '600px', color: '#fff'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary-400, #60a5fa)', margin: 0 }}>Nueva Campaña (Resend)</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <p style={{ color: '#cbd5e1', margin: 0 }}>
            Destinatarios: <span style={{ fontWeight: 600, color: '#fff' }}>{targetEmails.length} usuarios</span> (tomados del filtro actual)
          </p>
        </div>

        <div style={{ backgroundColor: 'var(--surface-700, #334155)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          <p style={{ margin: '0 0 0.5rem 0' }}><span style={{ color: '#94a3b8' }}>Asunto:</span> {subject}</p>
          <div style={{ borderTop: '1px solid #475569', margin: '0.5rem 0' }}></div>
          <p style={{ color: '#94a3b8', margin: '0 0 0.25rem 0' }}>Previsualización (HTML):</p>
          <div style={{ backgroundColor: '#fff', color: '#000', padding: '1rem', borderRadius: '4px' }} dangerouslySetInnerHTML={{ __html: htmlContent }} />
        </div>

        {statusMsg && (
          <div style={{
            padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem',
            backgroundColor: statusMsg.type === 'error' ? 'rgba(127, 29, 29, 0.5)' : 'rgba(20, 83, 45, 0.5)',
            color: statusMsg.type === 'error' ? '#fecaca' : '#bbf7d0',
            border: `1px solid ${statusMsg.type === 'error' ? '#ef4444' : '#22c55e'}`
          }}>
            {statusMsg.text}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            onClick={onClose}
            disabled={isSending}
            style={{
              padding: '0.5rem 1rem', backgroundColor: 'var(--surface-700, #334155)', border: 'none',
              borderRadius: '8px', color: '#fff', cursor: isSending ? 'not-allowed' : 'pointer'
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSend}
            disabled={isSending || targetEmails.length === 0}
            style={{
              padding: '0.5rem 1rem', backgroundColor: 'var(--primary-600, #2563eb)', border: 'none',
              borderRadius: '8px', color: '#fff', fontWeight: 500, cursor: (isSending || targetEmails.length === 0) ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: (isSending || targetEmails.length === 0) ? 0.5 : 1
            }}
          >
            {isSending ? 'Enviando...' : 'Enviar Campaña'}
          </button>
        </div>
      </div>
    </div>
  )
}
