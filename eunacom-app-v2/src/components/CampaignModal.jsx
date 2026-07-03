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
        <li>✅ <strong>7.000+ preguntas</strong> explicadas.</li>
        <li>✅ <strong>Reconstrucciones completas</strong> de exámenes pasados.</li>
        <li>✅ Modo Simulacro con tiempo real.</li>
      </ul>
      
      <p><strong>Todo por solo $5.000 CLP (o $5 USD).</strong></p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://eunacom.app/oferta" style="background-color: #2563eb; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px; display: inline-block;">Activar mi Acceso por $5.000</a>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl shadow-2xl w-full max-w-2xl text-white">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-blue-400">Nueva Campaña (Resend)</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">&times;</button>
        </div>

        <div className="mb-4">
          <p className="text-slate-300">
            Destinatarios: <span className="font-semibold text-white">{targetEmails.length} usuarios</span> (tomados del filtro actual)
          </p>
        </div>

        <div className="bg-slate-800 p-4 rounded-lg mb-6 text-sm">
          <p className="mb-2"><span className="text-slate-400">Asunto:</span> {subject}</p>
          <div className="border-t border-slate-700 my-2"></div>
          <p className="text-slate-400 mb-1">Previsualización (HTML):</p>
          <div className="bg-white text-black p-4 rounded" dangerouslySetInnerHTML={{ __html: htmlContent }} />
        </div>

        {statusMsg && (
          <div className={`p-3 rounded-lg mb-4 text-sm ${statusMsg.type === 'error' ? 'bg-red-900/50 text-red-200 border border-red-500' : 'bg-green-900/50 text-green-200 border border-green-500'}`}>
            {statusMsg.text}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition"
            disabled={isSending}
          >
            Cancelar
          </button>
          <button
            onClick={handleSend}
            disabled={isSending || targetEmails.length === 0}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition disabled:opacity-50 flex items-center gap-2"
          >
            {isSending ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enviando...
              </>
            ) : 'Enviar Campaña'}
          </button>
        </div>
      </div>
    </div>
  )
}
