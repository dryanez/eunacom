import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Trash2, Mail } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { usePageSeo } from '../lib/seo'
import '../components/redesign/legal.css'

// Página pública para pedir la eliminación de la cuenta (requisito de Google Play).
export default function EliminarCuenta() {
  const { user } = useAuth()
  usePageSeo({
    title: 'Eliminar mi cuenta | Eunacom App',
    description: 'Cómo solicitar la eliminación de tu cuenta de Eunacom App y de tus datos.',
    canonical: 'https://www.eunacomapp.cl/eliminar-cuenta',
  })
  const email = user?.email || ''
  const subject = encodeURIComponent('Eliminar mi cuenta de Eunacom App')
  const body = encodeURIComponent(`Hola, quiero eliminar mi cuenta de Eunacom App y todos mis datos.\n\nCorreo de la cuenta: ${email}\n`)
  return (
    <div className="lg-page">
      <div className="lg-wrap">
        <Link to={user ? '/settings' : '/'} className="lg-back"><ArrowLeft size={16} /> Volver</Link>
        <span className="lg-eyebrow"><Trash2 size={14} /> Cuenta</span>
        <h1>Eliminar mi cuenta</h1>
        <p>Puedes pedir que eliminemos tu cuenta de <b>Eunacom App</b> (WIACKOWSKA GROUP SpA) y todos tus datos cuando quieras.</p>

        <h2>Cómo pedirlo</h2>
        <ol>
          <li>Escríbenos desde el correo con el que creaste tu cuenta a <a href="mailto:eunacomapp@gmail.com">eunacomapp@gmail.com</a>, con el asunto «Eliminar mi cuenta». El botón de abajo arma el correo por ti.</li>
          <li>Te confirmamos por correo que recibimos la solicitud.</li>
          <li>Eliminamos tu cuenta y tus datos dentro de 30 días.</li>
        </ol>
        <a className="lg-btn" href={`mailto:eunacomapp@gmail.com?subject=${subject}&body=${body}`}><Mail size={17} /> Pedir eliminación por correo</a>

        <h2>Qué se elimina</h2>
        <ul>
          <li>Tu cuenta y datos de perfil: nombre, correo, WhatsApp, universidad, país y fecha de examen.</li>
          <li>Tu actividad: respuestas, exámenes, clases vistas, progreso y posición en la tabla de clasificación.</li>
        </ul>
        <h2>Qué se conserva</h2>
        <ul>
          <li>El registro de tus compras (monto, fecha y producto), que la ley tributaria chilena nos obliga a guardar hasta 6 años.</li>
        </ul>
        <p>Eliminar la cuenta no cancela una suscripción de Google Play: cancélala antes en Google Play → Pagos y suscripciones. Más detalles en la <Link to="/privacidad">Política de Privacidad</Link>.</p>
      </div>
    </div>
  )
}
