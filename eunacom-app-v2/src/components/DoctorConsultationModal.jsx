import React, { useState } from 'react'
import { X, MessageCircle, Calendar, Award, CheckCircle2, ShieldCheck, Phone, Stethoscope, ArrowRight, UserCheck } from 'lucide-react'
import '../styles/eunacomSitioTheme.css'

export default function DoctorConsultationModal({ isOpen, onClose, defaultTopic = 'Estrategia EUNACOM' }) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [originCountry, setOriginCountry] = useState('Médico Extranjero')
  const [currentScore, setCurrentScore] = useState('Primera vez rindiendo')
  const [examDate, setExamDate] = useState('Julio 2026')
  const [submitted, setSubmitted] = useState(false)

  if (!isOpen) return null

  const handleWhatsAppDirect = (e) => {
    e.preventDefault()
    const message = encodeURIComponent(
      `Hola Dr. Felipe Yáñez / Equipo Académico EUNACOM. Mi nombre es ${fullName || 'Médico Postulante'}, me gradué en ${originCountry} y me estoy preparando para el EUNACOM (${examDate}). Mi puntaje actual o situación es: ${currentScore}. Quisiera solicitar mi orientación diagnóstica 1 a 1.`
    )
    window.open(`https://wa.me/56976694606?text=${message}`, '_blank')
    setSubmitted(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden relative">
        {/* Header with Navy gradient */}
        <div className="bg-gradient-to-r from-[var(--eunacom-navy)] to-[var(--eunacom-blue)] p-6 sm:p-7 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-inner">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-sky-200">
                Orientación Médica 1 a 1
              </div>
              <h3 className="text-xl font-bold text-white">Conecta con la Dirección Académica</h3>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-sky-100 mt-1">
            Sesión diagnóstica personalizada con el Dr. Felipe Yáñez (RNPI Nº 642819) para revisar tu puntaje, debilidades clínicas y plan de 90 días.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-7 max-h-[80vh] overflow-y-auto">
          {submitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-[var(--eunacom-navy)] mb-2">
                ¡Solicitud de Orientación Enviada!
              </h4>
              <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
                Te hemos redirigido a WhatsApp para coordinar tu horario de consulta directa. Uno de nuestros médicos docentes te responderá en breve.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-[var(--eunacom-navy)] text-white rounded-xl font-bold text-sm hover:bg-[var(--eunacom-navy-dark)] transition"
              >
                Volver al Blog
              </button>
            </div>
          ) : (
            <form onSubmit={handleWhatsAppDirect} className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-3">
                <div className="text-2xl">👨‍⚕️</div>
                <div className="text-xs text-slate-600">
                  <span className="font-bold text-[var(--eunacom-navy)]">
                    Atención Médica Directa · Sin intermediarios
                  </span>
                  <br />
                  Evaluamos tus simulacros, plazos de ASOFAMECH y convalidación de documentos.
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Dr(a). Nombre y Apellido"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-[var(--eunacom-blue)] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    País de Formación
                  </label>
                  <select
                    value={originCountry}
                    onChange={(e) => setOriginCountry(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-[var(--eunacom-blue)] focus:outline-none"
                  >
                    <option value="Médico Graduado en Chile">Chile</option>
                    <option value="Venezuela">Venezuela</option>
                    <option value="Colombia">Colombia</option>
                    <option value="Ecuador">Ecuador</option>
                    <option value="Perú">Perú</option>
                    <option value="España / Europa">España / Europa</option>
                    <option value="Argentina / Bolivia">Argentina / Bolivia</option>
                    <option value="Cuba">Cuba</option>
                    <option value="Otro País">Otro País</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Convocatoria Objetivo
                  </label>
                  <select
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-[var(--eunacom-blue)] focus:outline-none"
                  >
                    <option value="Julio 2026 (Invierno)">Julio 2026 (Invierno)</option>
                    <option value="Diciembre 2026 (Verano)">Diciembre 2026 (Verano)</option>
                    <option value="Julio 2027">Julio 2027</option>
                    <option value="Práctico ECOE">EUNACOM Práctico (SP)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Situación / Último Puntaje en Simulacro
                </label>
                <select
                  value={currentScore}
                  onChange={(e) => setCurrentScore(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-[var(--eunacom-blue)] focus:outline-none"
                >
                  <option value="Primera vez rindiendo (Partiendo de cero)">
                    Primera vez rindiendo (Partiendo de cero)
                  </option>
                  <option value="Menos de 50 puntos en simulacros">
                    Menos de 50 puntos en simulacros (&lt;50%)
                  </option>
                  <option value="Entre 51 y 65 puntos (Buscando asegurar aprobación)">
                    Entre 51 y 65 puntos (Buscando asegurar aprobación)
                  </option>
                  <option value="Más de 70 puntos (Buscando Beca de Especialidad CONISS/EDF)">
                    Más de 70 puntos (Buscando Beca de Especialidad)
                  </option>
                  <option value="Rendir nuevamente tras reprobación">
                    Rendir nuevamente tras reprobación previa
                  </option>
                </select>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Iniciar Triage & Orientación en WhatsApp
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
                <p className="text-center text-xs text-slate-400 mt-2">
                  Atención confidencial de lunes a domingo · Sin compromiso comercial
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
