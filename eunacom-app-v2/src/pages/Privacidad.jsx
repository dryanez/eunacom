import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { usePageSeo } from '../lib/seo'
import '../components/redesign/legal.css'

// Política de privacidad de EUNACOM App (web y app Android/iOS). Actualizada 10-nov-2026.
export default function Privacidad() {
  usePageSeo({
    title: 'Política de Privacidad | Eunacom App',
    description: 'Cómo Eunacom App recopila, usa y protege tus datos personales, y cómo ejercer tus derechos o eliminar tu cuenta.',
    canonical: 'https://www.eunacomapp.cl/privacidad',
  })
  return (
    <div className="lg-page">
      <div className="lg-wrap">
        <Link to="/" className="lg-back"><ArrowLeft size={16} /> Volver</Link>
        <span className="lg-eyebrow"><ShieldCheck size={14} /> Legal</span>
        <h1>Política de Privacidad</h1>
        <p className="lg-date">Última actualización: 10 de noviembre de 2026</p>

        <p>Esta política explica qué datos personales recopila <b>Eunacom App</b> (sitio web www.eunacomapp.cl y aplicaciones para Android e iOS), para qué los usamos y qué derechos tienes. Al usar Eunacom App aceptas esta política.</p>

        <h2>1. Responsable</h2>
        <p>WIACKOWSKA GROUP SpA, RUT 78.355.717-7, Av. Borgoño de Montemar 30, Of. 316, Edificio Soho, Viña del Mar, Chile. Contacto: <a href="mailto:eunacomapp@gmail.com">eunacomapp@gmail.com</a>.</p>

        <h2>2. Datos que recopilamos</h2>
        <ul>
          <li><b>Datos de cuenta:</b> nombre, apellido, correo electrónico y contraseña (guardada cifrada) o tu cuenta de Google si inicias sesión con Google.</li>
          <li><b>Datos de perfil que tú ingresas:</b> número de WhatsApp, país, universidad y sede, año de egreso, fecha del examen y metas de estudio.</li>
          <li><b>Actividad de estudio:</b> preguntas respondidas y resultados, clases vistas, progreso, exámenes, racha y puntaje en la tabla de clasificación.</li>
          <li><b>Compras:</b> plan o libros comprados, montos y fechas. Los pagos los procesan Mercado Pago, PayPal o Google Play; nosotros <b>no recibimos ni guardamos</b> los datos de tu tarjeta.</li>
          <li><b>Datos técnicos y de uso:</b> tipo de dispositivo y navegador, páginas visitadas y eventos de uso, mediante Google Analytics y PostHog (cookies o identificadores similares). En la web puedes rechazar las cookies opcionales.</li>
        </ul>

        <h2>3. Para qué los usamos</h2>
        <ul>
          <li>Crear y administrar tu cuenta y darte acceso a las clases, preguntas y libros.</li>
          <li>Guardar tu progreso y personalizar tu plan de estudio.</li>
          <li>Procesar compras y suscripciones y dar soporte.</li>
          <li>Enviarte correos sobre tu cuenta y, si no te das de baja, novedades y ofertas (cada correo tiene un enlace para darte de baja).</li>
          <li>Mostrar la tabla de clasificación: aparece tu nombre de pila con la inicial del apellido, tu nivel, país y universidad.</li>
          <li>Medir el uso de la app para mejorarla y prevenir fraude o abuso.</li>
        </ul>
        <p>No vendemos tus datos personales ni mostramos publicidad de terceros dentro de la app.</p>

        <h2>4. Con quién los compartimos</h2>
        <p>Solo con proveedores que nos prestan servicios y bajo sus condiciones de seguridad: Supabase (inicio de sesión), Turso y Vercel (base de datos y servidores), Cloudflare (videos), Resend y Amazon SES (correos), Google Analytics y PostHog (estadísticas), y Mercado Pago, PayPal y Google Play (pagos). También podemos entregarlos si la ley o una autoridad competente lo exige. Algunos de estos proveedores están fuera de Chile.</p>

        <h2>5. Seguridad y conservación</h2>
        <p>Los datos viajan cifrados (HTTPS) y el acceso está restringido. Conservamos tus datos mientras tengas una cuenta. Si eliminas tu cuenta, borramos tus datos personales y de estudio dentro de 30 días, salvo los registros de compras que la ley tributaria nos obliga a guardar.</p>

        <h2>6. Tus derechos</h2>
        <p>Puedes pedir acceso, corrección o eliminación de tus datos, u oponerte a su uso para marketing, conforme a la Ley N° 19.628 sobre Protección de la Vida Privada. Escríbenos a <a href="mailto:eunacomapp@gmail.com">eunacomapp@gmail.com</a>. Para borrar tu cuenta y tus datos, sigue los pasos en <Link to="/eliminar-cuenta">Eliminar mi cuenta</Link>.</p>

        <h2>7. Menores de edad</h2>
        <p>Eunacom App está dirigida a estudiantes de medicina y médicos mayores de 18 años. No recopilamos a sabiendas datos de menores.</p>

        <h2>8. Cambios</h2>
        <p>Si cambiamos esta política, publicaremos la nueva versión en esta página con su fecha de actualización.</p>
      </div>
    </div>
  )
}
