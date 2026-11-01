import React from 'react'
import { Award, ShieldCheck, Stethoscope, MessageSquare, ExternalLink } from 'lucide-react'
import '../styles/eunacomSitioTheme.css'

export default function DoctorProfileCard({ onOpenConsultation }) {
  return (
    <div className="bg-white rounded-2xl border border-[var(--eunacom-card-border)] p-6 shadow-md hover:shadow-lg transition">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--eunacom-navy)] to-[var(--eunacom-blue)] flex items-center justify-center text-white text-2xl font-bold shadow-md shrink-0">
          FY
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h4 className="text-lg font-bold text-[var(--eunacom-navy)]">
              Dr. Felipe Yáñez
            </h4>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              RNPI Nº 642819
            </span>
          </div>
          <div className="text-xs font-medium text-slate-500">
            Médico Cirujano · Director Académico Eunacom App
          </div>
          <div className="text-xs text-slate-600 mt-2 leading-relaxed">
            Especialista en docencia médica y preparación del EUNACOM. Más de 8 años guiando a médicos chilenos y extranjeros a aprobar con excelencia y convalidar en el sistema de salud chileno.
          </div>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <Stethoscope className="w-4 h-4 text-[var(--eunacom-blue)]" />
          Registro Superintendencia de Salud de Chile
        </div>
        <button
          type="button"
          onClick={onOpenConsultation}
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[var(--eunacom-sky-light)] hover:bg-sky-100 text-[var(--eunacom-navy)] text-xs font-bold border border-[var(--eunacom-sky-border)] transition flex items-center justify-center gap-2"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Solicitar Revisión de Diagnóstico
        </button>
      </div>
    </div>
  )
}
