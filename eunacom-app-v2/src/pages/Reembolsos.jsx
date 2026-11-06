import React from 'react'
import PolicyPage from '../components/PolicyPage'
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
  usePageSeo({
    title: 'Política de Reembolsos | Eunacom App',
    description: 'Política de reembolsos de Eunacom App: acceso digital con activación inmediata, sin reembolsos una vez activado el acceso Premium, excepciones por cobro duplicado o falla técnica.',
    canonical: 'https://www.eunacomapp.cl/reembolsos'
  })

  return <PolicyPage badge="Términos de compra" title="Política de Reembolsos" effectiveDate={REFUND_POLICY_EFFECTIVE_DATE} sections={SECTIONS} />
}
