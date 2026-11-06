import React from 'react'
import PolicyPage from '../components/PolicyPage'
import { usePageSeo } from '../lib/seo'

// También es la URL de política de privacidad y de eliminación de datos de la app de Meta «eunacomapp»
// (bot de Instagram, api/_ig-bot.js): https://www.eunacomapp.cl/privacidad y …/privacidad#eliminar-datos
export const PRIVACY_POLICY_EFFECTIVE_DATE = '6 de noviembre de 2026'

const SECTIONS = [
  {
    title: '1. Quiénes somos',
    body: 'Esta política explica cómo Eunacom App (eunacomapp.cl) y Academia Examen EUNACOM (eunacom-examen.cl, @academiaeunacom en Instagram) tratan tus datos personales cuando usas la app, compras en la tienda, pides un libro gratis o interactúas con nuestra cuenta de Instagram. Aplicamos la Ley N° 19.628 sobre Protección de la Vida Privada de Chile.',
  },
  {
    title: '2. Qué datos recogemos',
    items: [
      'Cuenta: correo, nombre y los datos que completas en tu perfil (país, universidad, fecha de examen, WhatsApp, etc.).',
      'Uso de la app: tus respuestas, progreso, clases vistas y resultados de simulacros, para mostrarte tu avance.',
      'Pagos: plan o libro comprado, monto y estado del pago. Los datos de tu tarjeta los procesa Mercado Pago o PayPal; nosotros nunca los vemos ni los guardamos.',
      'Libros gratis: nombre, correo o WhatsApp, y de dónde llegaste (por ejemplo, el reel de Instagram).',
      'Instagram: si comentas una palabra en una publicación de @academiaeunacom, recibimos de Meta tu nombre de usuario, tu identificador de Instagram y el texto del comentario, para mandarte el libro por mensaje directo y responder tu comentario.',
      'Datos técnicos y de navegación: dispositivo, navegador y páginas visitadas, mediante Google Analytics, PostHog y Vercel Analytics.',
    ],
  },
  {
    title: '3. Para qué los usamos',
    items: [
      'Darte acceso a la app y a tu plan Premium, y mostrarte tu progreso.',
      'Procesar compras y enviarte los libros que pediste.',
      'Responder tus comentarios y mensajes en Instagram con el material que solicitaste.',
      'Enviarte correos sobre tu cuenta, tu compra o tu libro gratis y, si no te das de baja, novedades y ofertas de estudio. Cada correo trae un link para darte de baja.',
      'Mejorar la app y entender qué contenido sirve más.',
    ],
  },
  {
    title: '4. Con quién los compartimos',
    body: 'No vendemos ni arrendamos tus datos. Solo los compartimos con los proveedores que necesitamos para funcionar, que los tratan por cuenta nuestra: Supabase (inicio de sesión), Turso (base de datos), Vercel (hosting), Cloudflare R2 (archivos), Resend y Amazon SES (correos), Mercado Pago y PayPal (pagos), Google Analytics, PostHog y Vercel Analytics (estadísticas) y Meta (Instagram). También podemos entregarlos si una autoridad competente lo exige por ley.',
  },
  {
    title: '5. Cuánto tiempo los guardamos',
    body: 'Los datos de tu cuenta se guardan mientras la tengas activa. Los registros de pago se guardan el tiempo que exige la ley tributaria. Los datos de libros gratis y de comentarios de Instagram se guardan hasta que pidas eliminarlos.',
  },
  {
    title: '6. Tus derechos',
    body: 'Puedes pedir en cualquier momento acceder a tus datos, corregirlos, eliminarlos u oponerte a que los usemos para enviarte ofertas. Escríbenos y respondemos en un plazo máximo de 2 días hábiles.',
    contact: true,
  },
  {
    id: 'eliminar-datos',
    title: '7. Cómo eliminar tus datos',
    paragraphs: [
      'Escribe a contacto@eunacomapp.cl con el asunto «Eliminar mis datos» e indica tu correo y, si nos escribiste por Instagram, tu usuario. Borramos tu cuenta, tus datos de libros gratis y los registros de tus comentarios en Instagram dentro de 30 días, y te confirmamos por correo.',
      'Si usaste Instagram, también puedes quitar el acceso desde Instagram: Configuración → Seguridad → Apps y sitios web.',
    ],
  },
  {
    title: '8. Cambios a esta política',
    body: 'Si cambiamos esta política, publicaremos la nueva versión en esta página con su fecha de vigencia.',
  },
]

export default function Privacidad() {
  usePageSeo({
    title: 'Política de Privacidad | Eunacom App',
    description: 'Política de privacidad de Eunacom App y Academia Examen EUNACOM: qué datos recogemos, para qué los usamos, con quién los compartimos y cómo eliminarlos.',
    canonical: 'https://www.eunacomapp.cl/privacidad'
  })

  return <PolicyPage badge="Tus datos" title="Política de Privacidad" effectiveDate={PRIVACY_POLICY_EFFECTIVE_DATE} sections={SECTIONS} />
}
