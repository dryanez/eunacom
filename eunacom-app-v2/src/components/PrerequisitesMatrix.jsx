import React, { useState } from 'react'
import { CheckCircle, AlertTriangle, FileText, Globe, GraduationCap, Clock, Award, ShieldCheck, ChevronRight, HelpCircle } from 'lucide-react'
import '../styles/eunacomSitioTheme.css'

export default function PrerequisitesMatrix({ onOpenConsultation }) {
  const [originCountry, setOriginCountry] = useState('abroad-general')
  const [hasSpecialty, setHasSpecialty] = useState(false)
  const [checkedDocs, setCheckedDocs] = useState({
    docTitle: false,
    docGrades: false,
    docCurriculum: false,
    docEthics: false,
    docId: false,
  })

  const toggleDoc = (key) => {
    setCheckedDocs((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const completedDocsCount = Object.values(checkedDocs).filter(Boolean).length

  return (
    <div className="bg-white rounded-2xl border border-[var(--eunacom-card-border)] shadow-xl overflow-hidden my-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[var(--eunacom-navy)] to-[var(--eunacom-blue)] p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sky-200 text-xs font-semibold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-4 h-4" />
            Matriz Oficial de Convalidación & Requisitos 2026-2027
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            ¿Cómo revalidar y ejercer como médico en Chile?
          </h2>
          <p className="text-sky-100 text-sm sm:text-base mt-2 max-w-2xl">
            Simulador interactivo de requisitos legales, vías oficiales (ASOFAMECH, CONACEM, U. de Chile, Convenios Bilaterales) y lista de cotejo para tu título.
          </p>
        </div>
      </div>

      <div className="p-6 sm:p-8">
        {/* Step 1: Scenario Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--eunacom-text-secondary)] mb-2">
              1. ¿Dónde obtuviste tu título médico?
            </label>
            <select
              value={originCountry}
              onChange={(e) => setOriginCountry(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[var(--eunacom-card-border)] bg-slate-50 text-[var(--eunacom-text-primary)] font-medium focus:ring-2 focus:ring-[var(--eunacom-blue)] focus:outline-none transition"
            >
              <option value="chile">Chile (Universidad Nacional Acreditada)</option>
              <option value="abroad-general">Extranjero (País con Convenio de La Haya / Apostilla)</option>
              <option value="treaty-spain-colombia">España / Colombia / Ecuador / Uruguay (Tratados Bilaterales)</option>
              <option value="abroad-no-treaty">Extranjero (País sin Apostilla - Requiere Legalización Consular)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--eunacom-text-secondary)] mb-2">
              2. ¿Cuentas con especialidad médica certificada (+3-5 años)?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setHasSpecialty(false)}
                className={`py-3 px-4 rounded-xl text-sm font-semibold border transition ${
                  !hasSpecialty
                    ? 'bg-[var(--eunacom-sky-light)] border-[var(--eunacom-blue)] text-[var(--eunacom-navy)] shadow-sm'
                    : 'border-[var(--eunacom-card-border)] text-slate-600 hover:bg-slate-50'
                }`}
              >
                Médico General
              </button>
              <button
                type="button"
                onClick={() => setHasSpecialty(true)}
                className={`py-3 px-4 rounded-xl text-sm font-semibold border transition ${
                  hasSpecialty
                    ? 'bg-[var(--eunacom-sky-light)] border-[var(--eunacom-blue)] text-[var(--eunacom-navy)] shadow-sm'
                    : 'border-[var(--eunacom-card-border)] text-slate-600 hover:bg-slate-50'
                }`}
              >
                Especialista
              </button>
            </div>
          </div>
        </div>

        {/* Pathway Recommendation Card */}
        <div className="bg-slate-50 border border-[var(--eunacom-sky-border)] rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[var(--eunacom-navy)] text-white rounded-xl shadow-md">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded-full bg-[var(--eunacom-blue)] text-white">
                  Ruta Recomendada
                </span>
                <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Tiempo estimado:{' '}
                  {originCountry === 'chile'
                    ? '1 mes'
                    : hasSpecialty
                    ? '6 - 12 meses (CONACEM / EUNACOM)'
                    : '6 - 10 meses (ASOFAMECH)'}
                </span>
              </div>
              <h3 className="text-lg font-bold text-[var(--eunacom-navy)]">
                {originCountry === 'chile'
                  ? 'Examen EUNACOM-ST (Teórico) + Convalidación Directa de Práctico'
                  : hasSpecialty
                  ? 'Vía Dual: EUNACOM Ley 20.261 o Certificación Directa CONACEM'
                  : 'Vía EUNACOM Nacional (ASOFAMECH Ley 20.261: Teórico ST + Práctico SP)'}
              </h3>
              <p className="text-sm text-[var(--eunacom-text-secondary)] mt-2 leading-relaxed">
                {originCountry === 'chile' &&
                  'Al titularte de una universidad chilena acreditada por la CNA, tus internados de pregrado convalidan automáticamente la sección práctica (EUNACOM-SP). Solo debes inscribirte y rendir el examen teórico (ST) para obtener tu puntaje de postulación a CONISS/EDF.'}
                {originCountry === 'abroad-general' &&
                  'Debes validar tu título apostillado ante ASOFAMECH. Esta vía te habilita para rendir el EUNACOM-ST (180 preguntas teóricas) y posteriormente el EUNACOM-SP (ECOE de 4 ramas en hospital universitario). Es la vía universal que te permite ejercer en todo el sistema público (CESFAM, Hospitales) y privado (Clínicas, Bonos FONASA).'}
                {originCountry === 'treaty-spain-colombia' &&
                  'Cuentas con reconocimiento diplomático de título mediante Cancillería (MINREL). Sin embargo, conforme a la Ley 20.261, para ser contratado en el Sistema Nacional de Servicios de Salud (FONASA, APS, CESFAM y Hospitales públicos) es mandatorio contar con la aprobación del EUNACOM.'}
                {originCountry === 'abroad-no-treaty' &&
                  'Tus documentos deben pasar por legalización consular en tu país de origen y posterior timbraje en el Ministerio de Relaciones Exteriores de Chile (MINREL) antes de solicitar tu inscripción ante ASOFAMECH o la Universidad de Chile.'}
              </p>
            </div>
          </div>
        </div>

        {/* Step 2: Interactive Document Checklist */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-base font-bold text-[var(--eunacom-navy)] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[var(--eunacom-blue)]" />
              Lista de Cotejo de Documentos (Requisitos de Inscripción)
            </h4>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
              {completedDocsCount} de 5 Listos
            </span>
          </div>

          <div className="space-y-3">
            {[
              {
                id: 'docTitle',
                title: 'Título Profesional de Médico Cirujano',
                desc: 'Original o copia legalizada ante notario en Chile con Apostilla de La Haya electrónica.',
              },
              {
                id: 'docGrades',
                title: 'Concentración de Notas / Certificado de Calificaciones',
                desc: 'Detalle de asignaturas cursadas, escala de notas y nota mínima de aprobación.',
              },
              {
                id: 'docCurriculum',
                title: 'Malla Curricular & Carga Horaria de Internado',
                desc: 'Documento oficial con desglose de horas prácticas en Medicina, Cirugía, Pediatría y Gineco-Obstetricia.',
              },
              {
                id: 'docEthics',
                title: 'Certificado de Ética y Habilitación Profesional (Good Standing)',
                desc: 'Emitido por el Colegio Médico o Ministerio de Salud del país de origen (antigüedad máxima 90-180 días).',
              },
              {
                id: 'docId',
                title: 'Cédula de Identidad Chilena (RUN) o Pasaporte Vigente',
                desc: 'Documento de identidad con el que te registrarás en la plataforma oficial de ASOFAMECH.',
              },
            ].map((doc) => (
              <label
                key={doc.id}
                onClick={() => toggleDoc(doc.id)}
                className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition select-none ${
                  checkedDocs[doc.id]
                    ? 'bg-emerald-50/70 border-emerald-300'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checkedDocs[doc.id]}
                  onChange={() => {}}
                  className="mt-1 w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-[var(--eunacom-text-primary)]">
                    {doc.title}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{doc.desc}</div>
                </div>
                {checkedDocs[doc.id] && (
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                )}
              </label>
            ))}
          </div>
        </div>

        {/* CTA Box */}
        <div className="mt-8 p-6 rounded-xl bg-gradient-to-br from-[var(--eunacom-sky-light)] to-blue-50 border border-[var(--eunacom-sky-border)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h5 className="font-bold text-[var(--eunacom-navy)] text-base">
              ¿Dudas con la legalización o plazos de tu país?
            </h5>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Nuestro equipo médico y directores académicos revisan tus antecedentes sin costo.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenConsultation}
            className="shrink-0 px-5 py-2.5 rounded-xl bg-[var(--eunacom-blue)] hover:bg-[var(--eunacom-blue-hover)] text-white text-sm font-bold shadow-md hover:shadow-lg transition flex items-center gap-2"
          >
            Orientación Médica 1 a 1
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
