import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  BookOpen, Video, FileText, Calendar, BarChart2, ChevronDown,
  CheckCircle, ArrowRight, Star, Target, Check, X, Award, Stethoscope, Flame, Menu,
  GraduationCap, Database, PlayCircle, Library, Archive,
} from 'lucide-react'

import { usePageSeo } from '../lib/seo'
import { promoPrice } from '../config/promo'
import { useSubscription } from '../contexts/SubscriptionContext'
import SpecialtyIcon from '../components/redesign/SpecialtyIcon'
import '../components/redesign/landing.css'

// ─── SAMPLE INTERACTIVE QUESTION DEMO ──────────────────────────────────────────
const DEMO_QUESTION = {
  area: 'Medicina Interna · Cardiología',
  highYield: 'Alta Frecuencia EUNACOM',
  vignette:
    'Hombre de 58 años, hipertenso y diabético tipo 2, consulta por dolor torácico opresivo de 45 minutos de evolución, irradiado a mandíbula y brazo izquierdo, acompañado de diaforesis. Al examen: PA 140/90 mmHg, FC 88 lpm, saturación 97%. El ECG muestra supradesnivel del segmento ST de 2.5 mm en derivadas DII, DIII y aVF.',
  question: '¿Cuál es la conducta inicial prioritaria y el diagnóstico más probable?',
  options: [
    { text: 'A) Infarto agudo al miocardio con supradesnivel ST de pared inferior; activar protocolo de reperfusión inmediata (Angioplastía primaria o Trombolisis).', correct: true },
    { text: 'B) Angina inestable de alto riesgo; iniciar heparina sódica y solicitar troponinas seriadas a las 6 horas.', correct: false },
    { text: 'C) Pericarditis aguda; iniciar Ibuprofeno 600 mg cada 8 horas y Colquicina.', correct: false },
    { text: 'D) Disección aórtica tipo B; solicitar Angio-TAC de tórax antes de cualquier antitrombótico.', correct: false },
    { text: 'E) Tromboembolismo pulmonar masivo; administrar anticoagulación oral y ecocardiograma transesofágico.', correct: false },
  ],
  explanation:
    'Diagnóstico: IAMCEST de pared inferior (DII, DIII, aVF). La conducta prioritaria en Chile (Guía Clínica GES Infarto Agudo del Miocardio) es la reperfusión urgente: angioplastía primaria si el tiempo puerta-balón es < 120 min, o trombolisis si es > 120 min. En el EUNACOM se evalúa frecuentemente el reconocimiento electrocardiográfico y los tiempos GES de reperfusión.',
}

// ─── PRICING PLANS ────────────────────────────────────────────────────────────
// Cifras reales (nov-2026): 47.271 preguntas en Turso → «+47.000».
const PLANS = [
  {
    id: '1m',
    name: '1 Mes',
    price: '$14.990',
    unit: 'pago único',
    badge: 'Express',
    desc: 'Curso completo con videos y preguntas para repaso final intensivo.',
    features: [
      'Curso Completo: +650 Clases en Video (Perfil EUNACOM)',
      '+47.000 preguntas clínicas clasificadas por especialidad',
      'Acceso total a reconstrucciones de exámenes reales',
      'Simulacros cronometrados oficiales de 180 preguntas',
      'Retroalimentación explicada por alternativa y Guías GES',
      'App PWA instalable para estudiar en celular y PC',
    ],
    popular: false,
    cta: 'Elegir 1 Mes',
  },
  {
    id: '3m',
    name: '3 Meses',
    price: '$34.990',
    unit: 'pago único (~$11.660/mes)',
    badge: 'Ahorro 22%',
    desc: 'El período óptimo para ver el curso completo y resolver todo el banco.',
    features: [
      'Todo lo incluido en 1 Mes (+650 Videos + 47k Preguntas)',
      'Estadísticas de rendimiento y diagnóstico por área médica',
      'Módulo de revisión de errores recurrentes',
      'Simulacros ilimitados con ranking en tiempo real',
      'Acceso prioritario a nuevas reconstrucciones',
      'Estudio 24/7 sin límites en todos tus dispositivos',
    ],
    popular: false,
    cta: 'Elegir 3 Meses',
  },
  {
    id: '6m',
    name: '6 Meses',
    price: '$54.990',
    unit: 'pago único (~$9.165/mes)',
    badge: 'Más Popular',
    desc: 'Preparación integral desde cero con calendario adaptativo y guías clínicas.',
    features: [
      'Todo lo incluido en 3 Meses (+650 Videos + 47k Preguntas)',
      'Plan de estudio inteligente adaptativo a tu fecha de examen',
      'Guías clínicas y resúmenes descargables en PDF',
      'Banco de preguntas y clases actualizado periódicamente',
      'Soporte prioritario para dudas de plataforma',
      'Cobertura completa de Medicina Interna, Cirugía, Gine y Pedia',
    ],
    popular: true,
    cta: 'Empezar con 6 Meses',
  },
  {
    id: '1y',
    name: '1 Año',
    price: '$89.990',
    unit: 'pago único (~$7.499/mes)',
    badge: 'Mejor Valor',
    desc: 'Acceso total extendido para asegurar tu aprobación en cualquier convocatoria.',
    features: [
      'Todo lo incluido en 6 Meses (+650 Videos + 47k Preguntas)',
      'Acceso irrestricto por 12 meses completos (Julio & Diciembre)',
      'Todas las futuras clases y nuevos módulos incluidos sin costo',
      'Garantía de contenido según normativas MINSAL/ASOFAMECH',
      'Máxima flexibilidad para estudiar con total tranquilidad',
    ],
    popular: false,
    cta: 'Elegir 1 Año',
  },
]

// ─── FAQ DATA ────────────────────────────────────────────────────────────────
const FAQ_ITEMS = [
  {
    q: '¿Qué es el EUNACOM y por qué es obligatorio?',
    a: 'El EUNACOM (Examen Único Nacional de Conocimientos de Medicina) es la evaluación legal exigida en Chile para revalidar el título médico extranjero, ejercer en el sistema público de salud (FONASA, hospitales, CESFAM) y postular a especialidades médicas del MINSAL.',
  },
  {
    q: '¿Cuántas preguntas tiene la plataforma y qué fuentes utilizan?',
    a: 'Eunacom App cuenta con más de 47.000 preguntas que abarcan las 7 áreas oficiales de ASOFAMECH. Nuestro contenido se basa en reconstrucciones de exámenes pasados, guías clínicas GES/MINSAL y casos clínicos de alta frecuencia.',
  },
  {
    q: '¿Qué diferencia a Eunacom App de cursos tradicionales como Guevara o EUNAMED?',
    a: 'Los cursos tradicionales suelen costar entre $400.000 y más de $1.000.000 CLP con clases en horarios fijos. Eunacom App te da acceso 24/7 desde cualquier dispositivo a un banco más de 10x más grande (+47.000 preguntas), simulacros reales, videos y calendario personalizado desde solo $14.990 CLP.',
  },
  {
    q: '¿Es un cobro recurrente o pago único?',
    a: 'Es 100% pago único por el tiempo que elijas (1, 3, 6 o 12 meses). No guardamos tarjetas ni realizamos cobros automáticos sorpresivos.',
  },
  {
    q: '¿Qué son las reconstrucciones de exámenes reales?',
    a: 'Son preguntas recopiladas directamente de convocatorias anteriores del EUNACOM. Son el recurso de estudio más valioso porque reflejan la redacción exacta, el estilo de distractores y la dificultad real del examen oficial.',
  },
  {
    q: '¿Puedo estudiar desde el celular?',
    a: 'Sí. Nuestra plataforma es una PWA 100% responsiva optimizada para iPhone, iPad, Android y computadores. Puedes instalarla como app en tu pantalla de inicio y resolver preguntas en cualquier momento libre.',
  },
]

const METRICS = [
  { icon: Database, value: '+47.000', label: 'Preguntas con Guías', tone: 'blue' },
  { icon: PlayCircle, value: '650+', label: 'Videoclases', tone: 'green' },
  { icon: Library, value: '~100 libros', label: 'Biblioteca', tone: 'amber' },
  { icon: Archive, value: '16', label: 'Reconstrucciones reales', tone: 'violet' },
  { icon: Award, value: 'Perfil V3', label: 'Diciembre 2026 100% OK', tone: 'pink' },
]

const FEATURES = [
  { icon: BookOpen, tone: 'blue', title: '+47.000 Preguntas Clínicas', text: 'Banco categorizado por especialidad y tema. Cada pregunta incluye justificación detallada y referencias a Guías Clínicas GES/MINSAL.' },
  { icon: FileText, tone: 'green', title: 'Reconstrucciones Oficiales', text: 'Practica con preguntas extraídas de exámenes reales pasados. Aprende el patrón de preguntas y los distractores más comunes de ASOFAMECH.' },
  { icon: Video, tone: 'violet', title: 'Clases en Video & Guías', text: 'Módulos explicativos por especialidad médica para reforzar los conceptos complejos y los protocolos de manejo de urgencia en Chile.' },
  { icon: Calendar, tone: 'amber', title: 'Plan de Estudio Adaptativo', text: 'Ingresa tu fecha de examen y el sistema organizará tus semanas de estudio, priorizando Medicina Interna, Pediatría y tus puntos débiles.' },
  { icon: Target, tone: 'red', title: 'Simulacros 180 Preguntas', text: 'Entrena en condiciones idénticas al EUNACOM real: 180 preguntas, cronómetro de 4 horas y distribución exacta por ponderación oficial.' },
  { icon: BarChart2, tone: 'blue', title: 'Módulo de Errores & Stats', text: 'Visualiza tu porcentaje de acierto por especialidad y repasa exclusivamente las preguntas que tuviste malas para fijar el conocimiento.' },
]

const SPECIALTIES = ['Cardiología', 'Neurología', 'Respiratorio', 'Gastroenterología', 'Nefrología', 'Endocrinología', 'Cirugía', 'Traumatología', 'Pediatría', 'Obstetricia', 'Ginecología', 'Psiquiatría', 'Salud Pública']

const COMPARISON = [
  { label: 'Arancel / Precio', us: 'Desde $14.990 CLP (Pago único)', them: '$450.000 a $1.200.000+ CLP', bold: true },
  { label: 'Banco de Preguntas', us: '+47.000 preguntas con justificación', them: '1.000 – 3.000 preguntas', bold: false },
  { label: 'Clases en Video', us: '+650 videoclases modulares organizadas por subespecialidad', them: 'Clases sincrónicas largas sin videoteca modular', bold: true },
  { label: 'Reconstrucciones Reales', us: 'Completas de todas las convocatorias', them: 'Desactualizadas o restringidas', bold: false },
  { label: 'Flexibilidad de Horarios', us: '24/7 a tu propio ritmo en celular/PC', them: 'Clases sincrónicas rígidas', bold: false },
  { label: 'Plan de Estudio Adaptativo', us: 'Se ajusta a tus errores y fecha', them: 'Mismo temario plano para todos', bold: false },
]

const UNIS_ROW_1 = [
  { file: 'uchile.png', name: 'Universidad de Chile' },
  { file: 'uc.png', name: 'Pontificia Univ. Católica (UC)' },
  { file: 'udec.png', name: 'Univ. de Concepción' },
  { file: 'uandes.png', name: 'Univ. de los Andes' },
  { file: 'udd.png', name: 'Univ. del Desarrollo' },
  { file: 'unab.png', name: 'Univ. Andrés Bello' },
  { file: 'uv.png', name: 'Univ. de Valparaíso' },
  { file: 'usach.png', name: 'Univ. de Santiago (USACH)' },
  { file: 'uaustral.png', name: 'Univ. Austral de Chile' },
  { file: 'ucn.png', name: 'Univ. Católica del Norte' },
  { file: 'umayor.png', name: 'Univ. Mayor' },
  { file: 'udp.png', name: 'Univ. Diego Portales' },
  { file: 'uss.png', name: 'Univ. San Sebastián' },
  { file: 'ufro.png', name: 'Univ. de La Frontera' },
]

const UNIS_ROW_2 = [
  { file: 'uautonoma.png', name: 'Universidad Autónoma' },
  { file: 'uantofa.png', name: 'Univ. de Antofagasta' },
  { file: 'uoh.png', name: 'Univ. de O’Higgins' },
  { file: 'uft.png', name: 'Univ. Finis Terrae' },
  { file: 'uboh.png', name: 'Univ. Bernardo O’Higgins' },
  { file: 'ucm.png', name: 'Univ. Católica del Maule' },
  { file: 'uta.png', name: 'Univ. de Tarapacá' },
  { file: 'uatacama.png', name: 'Univ. de Atacama' },
  { file: 'umag.png', name: 'Univ. de Magallanes' },
  { file: 'utalca.png', name: 'Univ. de Talca' },
  { file: 'ucsc.png', name: 'Univ. Católica de la Santísima Concepción' },
  { file: 'ucentral.png', name: 'Univ. Central de Chile' },
  { file: 'pucv.png', name: 'Pontificia Univ. Católica de Valparaíso' },
]

// Fila del marquee: la lista va duplicada para el loop continuo (la copia queda oculta a lectores de pantalla)
function UniTrack({ unis, dir }) {
  return (
    <div className={`ln-track ln-track-${dir}`}>
      {[...unis, ...unis].map((uni, idx) => {
        const dup = idx >= unis.length
        return (
          <div key={idx} className="ln-uni" aria-hidden={dup || undefined} data-dup={dup || undefined}>
            <span className="ln-uni-chip">
              <img src={`/img/unis_clean/${uni.file}`} alt={dup ? '' : uni.name} loading="lazy" />
            </span>
            <span>{uni.name}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function LandingPage() {
  const navigate = useNavigate()
  const { user, openAuthModal } = useAuth()
  const { promo } = useSubscription()
  const promoOn = !!promo
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  usePageSeo({
    title: 'EUNACOM 2026 | El Curso y Plataforma #1 en Chile de Preparación – Eunacom App (+650 Videos y +47.000 Preguntas)',
    description: 'Eunacom App (eunacomapp.cl) es la plataforma y curso #1 en Chile para la preparación del EUNACOM 2026. Incluye +650 clases en video según Perfil ASOFAMECH, el banco #1 con +47.000 preguntas, reconstrucciones y simulacros. Desde $14.990 CLP.',
    canonical: 'https://www.eunacomapp.cl/'
  })

  // ── Auto-redirect logged-in users straight to their dashboard ──
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, navigate])

  const handleSelectOption = (index) => {
    if (selectedAnswer !== null) return
    setSelectedAnswer(index)
    setShowExplanation(true)
  }

  const closeMenu = () => setMobileMenuOpen(false)

  return (
    <div className="ln">

      {/* ── TOP ANNOUNCEMENT BAR ── */}
      <div className="ln-announce">
        <GraduationCap size={15} />
        <span>100% Actualizado al <strong>Perfil de Conocimientos V3 2026</strong> (Convocatoria Diciembre & Julio) · +47.000 preguntas y +650 clases en video</span>
        <a href="#planes">Ver planes desde $14.990 <ArrowRight size={13} /></a>
      </div>

      {/* ── HEADER / NAVIGATION ── */}
      <header className="ln-header">
        <div className="ln-wrap ln-header-in">
          <button type="button" className="ln-brand" onClick={() => navigate('/')}>
            <img src="/logo.png" alt="Eunacom App" />
            <span>
              <b>EUNACOM <em>APP</em></b>
              <small>Plataforma Médica Chile</small>
            </span>
          </button>

          {/* Desktop Nav */}
          <nav className="ln-nav">
            <Link to="/curso-eunacom-2026">Mejor Curso 2026</Link>
            <Link to="/simulacros-eunacom">Simulacros</Link>
            <Link to="/guia-eunacom-2026">Guía EUNACOM</Link>
            <Link to="/reconstrucciones-eunacom">Reconstrucciones</Link>
            <a href="#planes">Planes</a>
            <Link to="/faq">FAQ</Link>
            <Link to="/blog">Blog</Link>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="ln-auth">
            <button type="button" className="ln-btn-ghost ln-btn-sm" onClick={() => openAuthModal('login')}>
              Iniciar Sesión
            </button>
            <button type="button" className="ln-btn ln-btn-sm" onClick={() => openAuthModal('register')}>
              Probar App Gratis
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            className="ln-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Abrir Menú"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="ln-drawer">
          <Link to="/curso-eunacom-2026" onClick={closeMenu}>Mejor Curso 2026</Link>
          <Link to="/simulacros-eunacom" onClick={closeMenu}>Simulacros Oficiales</Link>
          <Link to="/guia-eunacom-2026" onClick={closeMenu}>Guía EUNACOM 2026</Link>
          <Link to="/reconstrucciones-eunacom" onClick={closeMenu}>Reconstrucciones Reales</Link>
          <Link to="/convenios" onClick={closeMenu}>Convenios Institucionales</Link>
          <a href="#planes" onClick={closeMenu}>Planes & Precios</a>
          <Link to="/faq" onClick={closeMenu}>Preguntas Frecuentes (FAQ)</Link>
          <Link to="/blog" onClick={closeMenu}>Blog EUNACOM</Link>
          <div className="ln-drawer-auth">
            <button type="button" className="ln-btn-ghost" onClick={() => { closeMenu(); openAuthModal('login') }}>
              Iniciar Sesión
            </button>
            <button type="button" className="ln-btn" onClick={() => { closeMenu(); openAuthModal('register') }}>
              Crear Cuenta
            </button>
          </div>
        </div>
      )}

      {/* ── HERO SECTION ── */}
      <section className="ln-hero">
        <div className="ln-wrap">
          <div className="ln-pill ln-in">
            <Stethoscope size={14} />
            <span>La plataforma y curso #1 en Chile de preparación EUNACOM 2026</span>
          </div>

          <h1 className="ln-h1 ln-in ln-d1">
            La Plataforma y Curso <span className="ln-grad">#1 en Chile</span> de Preparación EUNACOM: <span className="ln-grad">+650 Clases en Video</span> y <span className="ln-grad">+47.000 Preguntas</span>
          </h1>

          <p className="ln-lead ln-in ln-d2">
            El estándar de preparación médica en Chile para aprobar tu examen: curso on-demand con más de 650 clases en video (Perfil EUNACOM V3), reconstrucciones de exámenes oficiales, el banco #1 con +47.000 preguntas justificadas y plan adaptativo. Sin mensualidades abusivas.
          </p>

          <div className="ln-hero-ctas ln-in ln-d3">
            <button type="button" className="ln-btn" onClick={() => navigate('/dashboard')}>
              Comenzar ahora (Ver App) <ArrowRight size={18} />
            </button>
            <a href="#planes" className="ln-btn-ghost">
              Ver Planes desde $14.990
            </a>
          </div>

          {/* ── KEY METRICS BADGES ── */}
          <div className="ln-metrics ln-in ln-d4">
            {METRICS.map(({ icon: Icon, value, label, tone }) => (
              <div key={label} className="ln-metric">
                <div className={`ln-metric-ic ln-tone-${tone}`}><Icon size={17} /></div>
                <b>{value}</b>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── UNIVERSITIES INFINITE MOVING MARQUEE (GRAYSCALE TO COLOR HOVER) ── */}
      <section className="ln-unis">
        <div className="ln-wrap ln-head ln-reveal" style={{ marginBottom: 24 }}>
          <span className="ln-eyebrow">Confianza en Todo Chile</span>
          <h2 className="ln-h2">Médicos de las mejores facultades de Chile se preparan con nosotros</h2>
          <p className="ln-sub">
            Internos y egresados de más de 25 escuelas de medicina y facultades extranjeras estudian con Eunacom App.
          </p>
        </div>

        <div className="ln-marquee">
          <UniTrack unis={UNIS_ROW_1} dir="l" />
          <UniTrack unis={UNIS_ROW_2} dir="r" />
        </div>
      </section>

      {/* ── INTERACTIVE LIVE PREVIEW (DEMO CASE) ── */}
      <section id="simulador-demo" className="ln-sec">
        <div className="ln-wrap ln-narrow">
          <div className="ln-head ln-reveal">
            <span className="ln-eyebrow">Pruébalo en tu celular o PC</span>
            <h2 className="ln-h2">Simula una pregunta real del EUNACOM</h2>
            <p className="ln-sub">Toca la alternativa correcta para ver la justificación clínica oficial.</p>
          </div>

          {/* Interactive Card */}
          <div className="ln-demo">
            <div className="ln-demo-tags">
              <span className="ln-tag ln-tag-sky">{DEMO_QUESTION.area}</span>
              <span className="ln-tag ln-tag-amber"><Flame size={12} /> {DEMO_QUESTION.highYield}</span>
            </div>

            <p className="ln-vignette">{DEMO_QUESTION.vignette}</p>
            <p className="ln-question">{DEMO_QUESTION.question}</p>

            <div className="ln-opts">
              {DEMO_QUESTION.options.map((opt, i) => {
                const isSelected = selectedAnswer === i
                const answered = selectedAnswer !== null
                let state = ''
                if (answered) {
                  if (opt.correct) state = 'is-ok'
                  else if (isSelected) state = 'is-bad'
                  else state = 'is-dim'
                }

                return (
                  <button
                    key={i}
                    type="button"
                    className={`ln-opt ${state}`}
                    onClick={() => handleSelectOption(i)}
                    disabled={answered}
                  >
                    <span className="ln-opt-k">
                      {answered && opt.correct && <Check size={14} />}
                      {answered && isSelected && !opt.correct && <X size={14} />}
                      {(!answered || (!opt.correct && !isSelected)) && String.fromCharCode(65 + i)}
                    </span>
                    <span>{opt.text}</span>
                  </button>
                )
              })}
            </div>

            {showExplanation && (
              <div className="ln-expl">
                <div className="ln-expl-t">
                  <CheckCircle size={16} /> Retroalimentación Clínica (Guías GES)
                </div>
                <p>{DEMO_QUESTION.explanation}</p>
                <button type="button" className="ln-btn ln-btn-block" onClick={() => navigate('/dashboard')}>
                  Ver +47.000 Preguntas en la App <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── CORE FEATURES GRID ── */}
      <section id="caracteristicas" className="ln-sec ln-sec-alt">
        <div className="ln-wrap">
          <div className="ln-head ln-reveal">
            <span className="ln-eyebrow">Todo en un Solo Lugar</span>
            <h2 className="ln-h2">Herramientas diseñadas para médicos</h2>
            <p className="ln-sub">
              Estudia de forma activa con el mayor banco de preguntas y clases de especialidad en Chile.
            </p>
          </div>

          <div className="ln-feats">
            {FEATURES.map(({ icon: Icon, tone, title, text }) => (
              <div key={title} className="ln-feat ln-reveal">
                <div className={`ln-feat-ic ln-tone-${tone}`}><Icon size={22} /></div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>

          <div className="ln-specs ln-reveal">
            <p>Cobertura completa de Medicina Interna, Cirugía, Gine y Pedia</p>
            <div className="ln-specs-row">
              {SPECIALTIES.map(name => (
                <div key={name} className="ln-spec">
                  <SpecialtyIcon name={name} size={44} />
                  <span>{name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── COMPARISON TABLE ── */}
      <section className="ln-sec">
        <div className="ln-wrap" style={{ maxWidth: 1000 }}>
          <div className="ln-head ln-reveal">
            <span className="ln-eyebrow">Comparativa de Valor</span>
            <h2 className="ln-h2">¿Por qué pagar más de $500.000 por un curso antiguo?</h2>
            <p className="ln-sub">Eunacom App combina tecnología moderna, preguntas reales y precios justos.</p>
          </div>

          <div className="ln-table-box ln-reveal">
            <table className="ln-table">
              <thead>
                <tr>
                  <th>Característica</th>
                  <th className="us">Eunacom App</th>
                  <th>Cursos tradicionales (Guevara / EUNAMED)</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.label}</td>
                    <td className={`us${row.bold ? ' b' : ''}`}>
                      <div>
                        <Check size={15} />
                        <span>{row.us}</span>
                      </div>
                    </td>
                    <td className="them">{row.them}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <span className="ln-scroll-hint">Desliza la tabla para ver la comparación completa</span>
        </div>
      </section>

      {/* ── PRICING SECTION ── */}
      <section id="planes" className="ln-sec ln-sec-alt">
        <div className="ln-wrap">
          <div className="ln-head ln-reveal">
            <span className="ln-pill"><GraduationCap size={14} /> Curso completo todo-en-uno (videos + preguntas)</span>
            <h2 className="ln-h2" style={{ marginTop: 16 }}>Planes Todo-en-Uno: Curso con +650 Videos y +47.000 Preguntas</h2>
            <p className="ln-sub" style={{ maxWidth: 700 }}>
              <strong>Todos los planes</strong> incluyen acceso ilimitado a las <strong>+650 Clases en Video</strong> organizadas por subespecialidad (según el Perfil EUNACOM), Banco de <strong>+47.000 Preguntas</strong>, Reconstrucciones y Simulacros. ¡Estudia la teoría viendo clases y practica a tu propio ritmo!
            </p>
          </div>

          <div className="ln-plans">
            {PLANS.map((plan) => (
              <div key={plan.id} className={`ln-plan${plan.popular ? ' is-pop' : ''}`}>
                {plan.badge && (
                  <div className="ln-plan-badge">
                    {plan.popular && <Star size={12} fill="currentColor" />}
                    {plan.badge}
                  </div>
                )}

                <h3>{plan.name}</h3>
                <p className="ln-plan-desc">{plan.desc}</p>

                <div>
                  {promoOn && <div className="ln-price-old">{plan.price}</div>}
                  <div className={`ln-price${promoOn ? ' is-promo' : ''}`}>{promoOn ? promoPrice(plan.price, promo.percent) : plan.price}</div>
                  {promoOn && <div className="ln-promo-tag">{promo.name.toUpperCase()} −{promo.percent}%</div>}
                  <div className="ln-price-unit">{promoOn ? 'pago único' : plan.unit}</div>
                </div>

                <div className="ln-plan-feats">
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="ln-plan-feat">
                      <Check size={15} />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className={`${plan.popular ? 'ln-btn' : 'ln-btn-ghost'} ln-btn-block`}
                  onClick={() => openAuthModal('register')}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ACCORDION ── */}
      <section className="ln-sec">
        <div className="ln-wrap" style={{ maxWidth: 820 }}>
          <div className="ln-head ln-reveal">
            <span className="ln-eyebrow">Resolución de Dudas</span>
            <h2 className="ln-h2">Preguntas Frecuentes sobre el EUNACOM</h2>
            <p className="ln-sub">
              ¿Tienes más dudas? Consulta nuestra sección de preguntas.{' '}
              <button type="button" className="ln-link" onClick={() => navigate('/faq')}>
                Ver todas las preguntas <ArrowRight size={14} />
              </button>
            </p>
          </div>

          <div className="ln-faq">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaq === idx
              return (
                <div key={idx} className={`ln-faq-item${isOpen ? ' is-open' : ''}`}>
                  <button
                    type="button"
                    className="ln-faq-q"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                  >
                    <h3>{item.q}</h3>
                    <ChevronDown size={18} />
                  </button>
                  {isOpen && <p className="ln-faq-a">{item.a}</p>}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── FINAL CALL TO ACTION ── */}
      <section className="ln-sec" style={{ paddingTop: 0 }}>
        <div className="ln-wrap" style={{ maxWidth: 1000 }}>
          <div className="ln-cta ln-reveal">
            <h2 className="ln-h2">Empieza a preparar tu EUNACOM hoy</h2>
            <p className="ln-sub">
              Únete a los médicos que están practicando con preguntas reales y asegura tu habilitación profesional en Chile.
            </p>
            <div className="ln-cta-btns">
              <button type="button" className="ln-btn ln-btn-white" onClick={() => openAuthModal('register')}>
                Explorar Plataforma Gratis <ArrowRight size={18} />
              </button>
              <button type="button" className="ln-btn-ghost" onClick={() => openAuthModal('login')}>
                Iniciar Sesión
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="ln-footer">
        <div className="ln-wrap">
          <div className="ln-footer-links">
            <Link to="/">Inicio</Link>
            <Link to="/curso-eunacom-2026">Mejor Curso EUNACOM 2026</Link>
            <Link to="/simulacros-eunacom">Simulacros Oficiales</Link>
            <Link to="/guia-eunacom-2026">Guía Completa 2026</Link>
            <Link to="/reconstrucciones-eunacom">Reconstrucciones Reales</Link>
            <Link to="/convenios">Convenios</Link>
            <a href="#planes">Planes</a>
            <Link to="/faq">FAQ</Link>
            <Link to="/reembolsos">Política de Reembolsos</Link>
            <Link to="/blog">Blog EUNACOM</Link>
            <a href="/login" onClick={(e) => { e.preventDefault(); openAuthModal('login') }}>Iniciar Sesión</a>
          </div>
          <p>© {new Date().getFullYear()} Eunacom App · eunacomapp.cl · Todos los derechos reservados · Chile</p>
        </div>
      </footer>
    </div>
  )
}
