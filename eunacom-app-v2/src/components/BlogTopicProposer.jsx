import React, { useState } from 'react'
import { Sparkles, TrendingUp, Search, FileText, CheckCircle2, Copy, ArrowRight, Lightbulb, Compass } from 'lucide-react'
import '../styles/eunacomSitioTheme.css'

export default function BlogTopicProposer({ onSelectTopic }) {
  const [selectedKeyword, setSelectedKeyword] = useState('reconstrucciones eunacom')
  const [copied, setCopied] = useState(false)

  const strikingKeywords = [
    {
      query: 'reconstrucciones eunacom',
      pos: '#20.5',
      intent: 'Transaccional / Educativo',
      volume: 'Alto',
      title: 'Reconstrucciones EUNACOM: Qué Son y Cómo Resolver Preguntas Reales de Exámenes Anteriores',
      h2s: [
        '¿Qué es una reconstrucción del EUNACOM y por qué es 100% legal estudiarla?',
        'Patrones recurrentes: Los 15 temas que ASOFAMECH repite cada año',
        'Diferencias entre el Harrison clásico y las conductas exigidas en las reconstrucciones',
        'Cómo practicar con exámenes cronometrados en Eunacom App',
      ],
      faqs: [
        {
          q: '¿Dónde puedo encontrar reconstrucciones con justificación clínica?',
          a: 'En la plataforma Eunacom App (+10.000 preguntas justificadas según Guías GES y MINSAL).',
        },
      ],
    },
    {
      query: 'eunacom sp',
      pos: '#10.5',
      intent: 'Informativo / Trámite',
      volume: 'Medio-Alto',
      title: 'EUNACOM Práctico (SP): Rúbricas ECOE, Estaciones Clínicas y Sedes Hospitalarias',
      h2s: [
        'Estructura de las 4 ramas: Medicina, Cirugía, Pediatría y Obstetricia',
        'Las estaciones ECOE con actores simulados: Lo que los evaluadores califican',
        'Exención del práctico para médicos con internado nacional acreditado',
        'Plazos de inscripción y qué hacer si repruebas una sola rama',
      ],
      faqs: [
        {
          q: '¿Se puede trabajar con el EUNACOM Teórico aprobado mientras se rinde el Práctico?',
          a: 'En el sector público la ley exige la aprobación completa (ST + SP). Existen contratos transitorios en urgencias según necesidad del servicio de salud.',
        },
      ],
    },
    {
      query: 'fechas eunacom 2026',
      pos: '#11.0',
      intent: 'Informativo Urgente',
      volume: 'Muy Alto',
      title: 'Fechas Oficiales EUNACOM 2026: Inscripción de Invierno y Verano en ASOFAMECH',
      h2s: [
        'Calendario oficial ASOFAMECH 2026-2027',
        'Plazos fatales de entrega de títulos apostillados',
        'Aranceles actualizados y medios de pago',
        'Cómo elegir la sede de rendición antes de que se agoten los cupos',
      ],
      faqs: [
        {
          q: '¿Cuándo se publica la lista oficial de sedes?',
          a: 'ASOFAMECH publica las sedes definitivas aproximadamente 3 semanas antes del examen.',
        },
      ],
    },
    {
      query: 'sueldo medico cesfam chile',
      pos: '#18.0',
      intent: 'Comparativo Laboral',
      volume: 'Alto',
      title: 'Sueldo de un Médico General en CESFAM y APS en Chile (Tabla Actualizada 2026)',
      h2s: [
        'Escala de sueldos según Ley 19.378 (Estatuto de Atención Primaria)',
        'Diferencia entre 44 horas, turnos SAPU y asignaciones de zona extrema',
        'Requisitos de contratación: RNPI y EUNACOM aprobado',
        'Proyección para postular a becas de especialidad (EDF / Médicos Generales de Zona)',
      ],
      faqs: [
        {
          q: '¿Cuánto gana un médico recién egresado en un CESFAM?',
          a: 'Entre $2.800.000 y $3.900.000 CLP líquidos mensuales en jornada de 44 horas.',
        },
      ],
    },
  ]

  const currentData =
    strikingKeywords.find((k) => k.query === selectedKeyword) || strikingKeywords[0]

  const handleCopyMarkdown = () => {
    const markdown = `# Propuesta Editorial SEO: ${currentData.title}
**Palabra Clave Principal:** \`${currentData.query}\`
**Posición Actual en GSC:** ${currentData.pos}
**Intención de Búsqueda:** ${currentData.intent}

## Estructura de Encabezados H2 Recomendada:
${currentData.h2s.map((h, i) => `${i + 1}. ${h}`).join('\n')}

## Preguntas Frecuentes Sugeridas (Schema FAQPage):
${currentData.faqs.map((f) => `### P: ${f.q}\n**R:** ${f.a}`).join('\n\n')}
`
    navigator.clipboard.writeText(markdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="bg-white rounded-2xl border border-[var(--eunacom-card-border)] p-6 shadow-xl my-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--eunacom-blue)] mb-1">
            <Compass className="w-4 h-4" />
            SEO Intelligence & Content Studio
          </div>
          <h3 className="text-xl font-bold text-[var(--eunacom-navy)]">
            Generador de Temas de Alto Rendimiento (Striking Distance)
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
            Sincronizado con GSC
          </span>
        </div>
      </div>

      {/* Query Selector Tabs */}
      <div className="mt-5">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Consultas en Distancia de Ataque (Posición #10 - #25):
        </label>
        <div className="flex flex-wrap gap-2">
          {strikingKeywords.map((k) => (
            <button
              key={k.query}
              type="button"
              onClick={() => setSelectedKeyword(k.query)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
                selectedKeyword === k.query
                  ? 'bg-[var(--eunacom-navy)] text-white border-[var(--eunacom-navy)] shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>{k.query}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  selectedKeyword === k.query ? 'bg-white/20 text-sky-200' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {k.pos}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Generated Content Outline Card */}
      <div className="mt-6 p-5 rounded-2xl bg-slate-50 border border-[var(--eunacom-sky-border)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--eunacom-blue)]">
            Título H1 Optimizado para CTR
          </span>
          <span className="text-xs font-medium text-slate-500">
            Intención: <strong className="text-slate-800">{currentData.intent}</strong>
          </span>
        </div>
        <h4 className="text-base sm:text-lg font-bold text-[var(--eunacom-navy)] mb-4">
          {currentData.title}
        </h4>

        <div className="space-y-4">
          <div>
            <div className="text-xs font-bold uppercase text-slate-600 mb-2">
              Estructura de Secciones (H2s Recomendados):
            </div>
            <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700">
              {currentData.h2s.map((h, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[var(--eunacom-sky-light)] text-[var(--eunacom-navy)] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-xs font-bold uppercase text-slate-600 mb-2">
              Bloque FAQ Propuesto (Google Rich Snippets):
            </div>
            {currentData.faqs.map((f, i) => (
              <div key={i} className="p-3 bg-white rounded-xl border border-slate-200 text-xs">
                <div className="font-bold text-[var(--eunacom-navy)]">P: {f.q}</div>
                <div className="text-slate-600 mt-1">R: {f.a}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-300 transition flex items-center justify-center gap-2 shadow-sm"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ¡Esquema Copiado al Portapapeles!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-500" />
                Copiar Esquema en Markdown
              </>
            )}
          </button>

          <span className="text-xs text-slate-500 text-center sm:text-right">
            Sugerencia automatizada generada por el motor de SEO Intelligence
          </span>
        </div>
      </div>
    </div>
  )
}
