import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  BookOpen, Video, FileText, Calendar, BarChart2, ChevronDown,
  CheckCircle, ArrowRight, Star, Target, Clock, Users, Zap, Shield,
  Sparkles, Check, X, Award, Stethoscope, HelpCircle, Flame, Layers, ExternalLink, Menu
} from 'lucide-react'

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
const PLANS = [
  {
    id: '1m',
    name: '1 Mes',
    price: '$14.990',
    unit: 'pago único',
    badge: 'Express',
    desc: 'Para repaso final intensivo en las últimas semanas antes de rendir.',
    features: [
      '+10.000 preguntas clasificadas por especialidad',
      'Acceso completo a reconstrucciones reales',
      'Simulacros cronometrados de 180 preguntas',
      'Retroalimentación explicada por alternativa',
      'App PWA instalable en celular y PC',
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
    desc: 'El período óptimo para estudiar el temario completo con ritmo constante.',
    features: [
      'Todo lo incluido en el plan de 1 Mes',
      'Clases en video por especialidad clínica',
      'Módulo de revisión de errores recurrentes',
      'Estadísticas de rendimiento por área médica',
      'Simulacros ilimitados con ranking',
    ],
    popular: false,
    cta: 'Elegir 3 Meses',
  },
  {
    id: '6m',
    name: '6 Meses',
    price: '$54.990',
    unit: 'pago único (~$9.165/mes)',
    badge: 'Más Popular ⭐',
    desc: 'Preparación integral desde cero con calendario adaptativo y guías clínicas.',
    features: [
      'Todo lo incluido en el plan de 3 Meses',
      'Plan de estudio inteligente según tu fecha',
      'Guías clínicas y resúmenes descargables en PDF',
      'Banco de preguntas actualizado periódicamente',
      'Soporte prioritario para dudas de plataforma',
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
    desc: 'Acceso total para internistas y egresados preparando ambas convocatorias.',
    features: [
      'Acceso irrestricto por 12 meses completos',
      'Todas las actualizaciones de preguntas y clases',
      'Cobertura para convocatorias de Julio y Diciembre',
      'Garantía de contenido según Guías GES vigentes',
      'Máxima flexibilidad para estudiar sin límites',
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
    a: 'Eunacom App cuenta con más de 10.000 preguntas que abarcan las 7 áreas oficiales de ASOFAMECH. Nuestro contenido se basa en reconstrucciones de exámenes pasados, guías clínicas GES/MINSAL y casos clínicos de alta frecuencia.',
  },
  {
    q: '¿Qué diferencia a Eunacom App de cursos tradicionales como Guevara o EUNAMED?',
    a: 'Los cursos tradicionales suelen costar entre $400.000 y más de $1.000.000 CLP con clases en horarios fijos. Eunacom App te da acceso 24/7 desde cualquier dispositivo a un banco 10x más grande (+10.000 preguntas), simulacros reales, videos y calendario personalizado desde solo $14.990 CLP.',
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

export default function LandingPage() {
  const navigate = useNavigate()
  const { user, openAuthModal } = useAuth()
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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

  return (
    <div style={{ backgroundColor: '#ffffff', color: '#0f172a', fontFamily: 'Lexend, -apple-system, sans-serif', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ── TOP ANNOUNCEMENT BAR ── */}
      <div style={{ background: 'linear-gradient(90deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', padding: '10px 16px', textAlign: 'center', fontSize: '0.84rem', fontWeight: 500 }}>
        <span>🎓 100% Actualizado al <strong>Perfil de Conocimientos V3 2026</strong> (Convocatoria Diciembre & Julio) · +10.000 preguntas y +650 clases en video </span>
        <a href="#planes" style={{ color: '#ffffff', fontWeight: 700, textDecoration: 'underline', marginLeft: 6 }}>Ver planes desde $14.990 →</a>
      </div>

      {/* ── HEADER / NAVIGATION ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e2e8f0',
        padding: '0 20px', height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        maxWidth: '1280px', margin: '0 auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <img src="/logo.png" alt="Eunacom App" style={{ width: 34, height: 34, borderRadius: 8, objectFit: 'contain' }} />
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1 }}>EUNACOM APP</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 500 }}>Plataforma Médica Chile</div>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Link to="/curso-eunacom-2026" style={{ color: '#475569', fontSize: '0.88rem', fontWeight: 600, textDecoration: 'none' }}>Mejor Curso 2026</Link>
          <Link to="/simulacros-eunacom" style={{ color: '#475569', fontSize: '0.88rem', fontWeight: 600, textDecoration: 'none' }}>Simulacros</Link>
          <Link to="/guia-eunacom-2026" style={{ color: '#475569', fontSize: '0.88rem', fontWeight: 600, textDecoration: 'none' }}>Guía EUNACOM</Link>
          <Link to="/reconstrucciones-eunacom" style={{ color: '#475569', fontSize: '0.88rem', fontWeight: 600, textDecoration: 'none' }}>Reconstrucciones</Link>
          <a href="#planes" style={{ color: '#475569', fontSize: '0.88rem', fontWeight: 600, textDecoration: 'none' }}>Planes</a>
          <Link to="/faq" style={{ color: '#475569', fontSize: '0.88rem', fontWeight: 600, textDecoration: 'none' }}>FAQ</Link>
          <Link to="/blog" style={{ color: '#475569', fontSize: '0.88rem', fontWeight: 600, textDecoration: 'none' }}>Blog</Link>
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="desktop-auth" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => openAuthModal('login')}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid #cbd5e1',
              color: '#334155',
              padding: '7px 16px',
              borderRadius: 10,
              fontSize: '0.86rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => openAuthModal('register')}
            style={{
              backgroundColor: '#0284c7',
              border: 'none',
              color: '#ffffff',
              padding: '8px 18px',
              borderRadius: 10,
              fontSize: '0.86rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
            }}
          >
            Probar App Gratis
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="mobile-toggle" style={{ display: 'none' }}>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ background: 'none', border: '1px solid #e2e8f0', padding: '6px 10px', borderRadius: 8, color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            aria-label="Abrir Menú"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          boxShadow: '0 10px 20px rgba(0,0,0,0.05)'
        }}>
          <Link to="/curso-eunacom-2026" onClick={() => setMobileMenuOpen(false)} style={{ color: '#334155', fontSize: '0.95rem', fontWeight: 600, textDecoration: 'none', padding: '6px 0' }}>Mejor Curso 2026</Link>
          <Link to="/simulacros-eunacom" onClick={() => setMobileMenuOpen(false)} style={{ color: '#334155', fontSize: '0.95rem', fontWeight: 600, textDecoration: 'none', padding: '6px 0' }}>Simulacros Oficiales</Link>
          <Link to="/guia-eunacom-2026" onClick={() => setMobileMenuOpen(false)} style={{ color: '#334155', fontSize: '0.95rem', fontWeight: 600, textDecoration: 'none', padding: '6px 0' }}>Guía EUNACOM 2026</Link>
          <Link to="/reconstrucciones-eunacom" onClick={() => setMobileMenuOpen(false)} style={{ color: '#334155', fontSize: '0.95rem', fontWeight: 600, textDecoration: 'none', padding: '6px 0' }}>Reconstrucciones Reales</Link>
          <Link to="/convenios" onClick={() => setMobileMenuOpen(false)} style={{ color: '#334155', fontSize: '0.95rem', fontWeight: 600, textDecoration: 'none', padding: '6px 0' }}>Convenios Institucionales</Link>
          <a href="#planes" onClick={() => setMobileMenuOpen(false)} style={{ color: '#334155', fontSize: '0.95rem', fontWeight: 600, textDecoration: 'none', padding: '6px 0' }}>Planes & Precios</a>
          <Link to="/faq" onClick={() => setMobileMenuOpen(false)} style={{ color: '#334155', fontSize: '0.95rem', fontWeight: 600, textDecoration: 'none', padding: '6px 0' }}>Preguntas Frecuentes (FAQ)</Link>
          <Link to="/blog" onClick={() => setMobileMenuOpen(false)} style={{ color: '#334155', fontSize: '0.95rem', fontWeight: 600, textDecoration: 'none', padding: '6px 0' }}>Blog EUNACOM</Link>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button
              onClick={() => { setMobileMenuOpen(false); openAuthModal('login') }}
              style={{ flex: 1, backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', color: '#334155', padding: '12px 0', borderRadius: 10, fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer' }}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); openAuthModal('register') }}
              style={{ flex: 1, backgroundColor: '#0284c7', border: 'none', color: '#ffffff', padding: '12px 0', borderRadius: 10, fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer' }}
            >
              Crear Cuenta
            </button>
          </div>
        </div>
      )}

      {/* ── HERO SECTION ── */}
      <section style={{ padding: '48px 16px 36px', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          backgroundColor: '#f0f9ff', border: '1px solid #bae6fd',
          color: '#0369a1', padding: '6px 14px', borderRadius: 9999,
          fontSize: '0.8rem', fontWeight: 600, marginBottom: 20
        }}>
          <Stethoscope size={15} color="#0284c7" />
          <span>La plataforma #1 en Chile · Actualizada con el Perfil de Conocimientos V3 2026</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(2rem, 6vw, 3.8rem)',
          fontWeight: 800,
          color: '#0f172a',
          lineHeight: 1.15,
          letterSpacing: '-0.03em',
          maxWidth: '960px',
          margin: '0 auto 18px'
        }}>
          Aprueba el EUNACOM 2026 entrenando con <span style={{ color: '#0284c7' }}>+10.000 preguntas reales</span>
        </h1>

        <p style={{
          fontSize: 'clamp(0.98rem, 2.5vw, 1.2rem)',
          color: '#475569',
          lineHeight: 1.65,
          maxWidth: '720px',
          margin: '0 auto 30px'
        }}>
          El banco más completo de Chile con reconstrucciones oficiales, más de 650 clases en video y plan adaptativo 100% alineado al Perfil V3 de Diciembre 2026. Sin mensualidades abusivas.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 40 }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              backgroundColor: '#0284c7',
              color: '#ffffff',
              border: 'none',
              padding: '15px 32px',
              borderRadius: 12,
              fontSize: '1rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 8,
              boxShadow: '0 8px 24px -4px rgba(2, 132, 199, 0.35)',
              width: 'auto',
              minWidth: '200px',
              justifyContent: 'center'
            }}
          >
            Comenzar ahora (Ver App) <ArrowRight size={18} />
          </button>
          <a
            href="#planes"
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              color: '#334155',
              padding: '15px 28px',
              borderRadius: 12,
              fontSize: '1rem',
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: 8,
              justifyContent: 'center'
            }}
          >
            Ver Planes desde $14.990
          </a>
        </div>

        {/* ── KEY METRICS BADGES ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 12,
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 18,
          padding: '18px 14px',
          maxWidth: '900px',
          margin: '0 auto'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0284c7' }}>+10.000</div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>Preguntas con Guías</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#059669' }}>100%</div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>Reconstrucciones Reales</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#7c3aed' }}>+650</div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>Clases en Video</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#d97706' }}>Perfil V3</div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>Diciembre 2026 100% OK</div>
          </div>
        </div>
      </section>

      {/* ── UNIVERSITIES INFINITE MOVING MARQUEE (GRAYSCALE TO COLOR HOVER) ── */}
      <section style={{ padding: '36px 0 48px', backgroundColor: '#ffffff', overflow: 'hidden', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto 24px', textAlign: 'center', padding: '0 20px' }}>
          <span style={{ color: '#0284c7', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Confianza en Todo Chile
          </span>
          <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', fontWeight: 800, color: '#0f172a', marginTop: 4, marginBottom: 6 }}>
            Médicos de las mejores facultades de Chile se preparan con nosotros
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '600px', margin: '0 auto' }}>
            Internos y egresados de más de 25 escuelas de medicina y facultades extranjeras estudian con Eunacom App.
          </p>
        </div>

        {/* Marquee Wrapper with side gradient masks */}
        <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
          {/* Left / Right Fades */}
          <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '80px', zIndex: 10, background: 'linear-gradient(to right, #ffffff 20%, transparent)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '80px', zIndex: 10, background: 'linear-gradient(to left, #ffffff 20%, transparent)', pointerEvents: 'none' }} />

          {/* Row 1 (Moves Left) */}
          <div className="marquee-track marquee-left" style={{ display: 'flex', gap: '14px', width: 'max-content', marginBottom: '14px' }}>
            {[
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
              // Duplicate for seamless loop
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
            ].map((uni, idx) => (
              <div key={idx} className="uni-badge-card">
                <img
                  src={`/img/unis_clean/${uni.file}`}
                  alt={uni.name}
                  className="uni-badge-img"
                  loading="lazy"
                />
                <span className="uni-badge-text">
                  {uni.name}
                </span>
              </div>
            ))}
          </div>

          {/* Row 2 (Moves Right) */}
          <div className="marquee-track marquee-right" style={{ display: 'flex', gap: '14px', width: 'max-content' }}>
            {[
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
              // Duplicate for seamless loop
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
            ].map((uni, idx) => (
              <div key={idx} className="uni-badge-card">
                <img
                  src={`/img/unis_clean/${uni.file}`}
                  alt={uni.name}
                  className="uni-badge-img"
                  loading="lazy"
                />
                <span className="uni-badge-text">
                  {uni.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE LIVE PREVIEW (DEMO CASE) ── */}
      <section id="simulador-demo" style={{ padding: '48px 16px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <span style={{ color: '#0284c7', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pruébalo en tu celular o PC</span>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', fontWeight: 800, color: '#0f172a', marginTop: 4, marginBottom: 8 }}>
              Simula una pregunta real del EUNACOM
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Toca la alternativa correcta para ver la justificación clínica oficial.</p>
          </div>

          {/* Interactive Card */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: 18,
            padding: '24px 18px',
            boxShadow: '0 8px 24px -4px rgba(0,0,0,0.06)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 6 }}>
              <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', fontSize: '0.74rem', fontWeight: 700, padding: '3px 10px', borderRadius: 9999 }}>
                {DEMO_QUESTION.area}
              </span>
              <span style={{ backgroundColor: '#fef3c7', color: '#92400e', fontSize: '0.74rem', fontWeight: 700, padding: '3px 10px', borderRadius: 9999, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Flame size={12} /> {DEMO_QUESTION.highYield}
              </span>
            </div>

            <p style={{ fontSize: '0.94rem', lineHeight: 1.65, color: '#1e293b', marginBottom: 14, fontWeight: 500 }}>
              {DEMO_QUESTION.vignette}
            </p>
            <p style={{ fontSize: '0.96rem', fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>
              {DEMO_QUESTION.question}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {DEMO_QUESTION.options.map((opt, i) => {
                const isSelected = selectedAnswer === i
                let bg = '#ffffff'
                let border = '#e2e8f0'
                let textColor = '#334155'

                if (selectedAnswer !== null) {
                  if (opt.correct) {
                    bg = '#ecfdf5'
                    border = '#10b981'
                    textColor = '#065f46'
                  } else if (isSelected && !opt.correct) {
                    bg = '#fef2f2'
                    border = '#ef4444'
                    textColor = '#991b1b'
                  }
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleSelectOption(i)}
                    style={{
                      textAlign: 'left',
                      padding: '12px 14px',
                      borderRadius: 12,
                      border: `1.5px solid ${border}`,
                      backgroundColor: bg,
                      color: textColor,
                      fontSize: '0.88rem',
                      lineHeight: 1.45,
                      cursor: selectedAnswer === null ? 'pointer' : 'default',
                      transition: 'all 0.15s',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      minHeight: '44px'
                    }}
                  >
                    <div style={{ flexShrink: 0, marginTop: 2 }}>
                      {selectedAnswer !== null && opt.correct && <Check size={16} color="#10b981" />}
                      {selectedAnswer !== null && isSelected && !opt.correct && <X size={16} color="#ef4444" />}
                      {selectedAnswer === null && <span style={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.85rem' }}>{String.fromCharCode(65 + i)}</span>}
                    </div>
                    <span>{opt.text}</span>
                  </button>
                )
              })}
            </div>

            {showExplanation && (
              <div style={{ marginTop: 20, padding: '16px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#166534', fontWeight: 700, fontSize: '0.9rem', marginBottom: 6 }}>
                  <CheckCircle size={16} color="#16a34a" /> Retroalimentación Clínica (Guías GES)
                </div>
                <p style={{ fontSize: '0.85rem', color: '#15803d', lineHeight: 1.6, margin: 0 }}>
                  {DEMO_QUESTION.explanation}
                </p>
                <div style={{ marginTop: 14, textAlign: 'right' }}>
                  <button
                    onClick={() => navigate('/dashboard')}
                    style={{
                      backgroundColor: '#0284c7', color: '#ffffff', border: 'none',
                      padding: '10px 18px', borderRadius: 8, fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', width: '100%'
                    }}
                  >
                    Ver +10.000 Preguntas en la App →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── CORE FEATURES GRID ── */}
      <section id="caracteristicas" style={{ padding: '60px 16px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <span style={{ color: '#0284c7', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Todo en un Solo Lugar</span>
          <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.5rem)', fontWeight: 800, color: '#0f172a', marginTop: 4, marginBottom: 10 }}>
            Herramientas diseñadas para médicos
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem', maxWidth: '580px', margin: '0 auto' }}>
            Estudia de forma activa con el mayor banco de preguntas y clases de especialidad en Chile.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 18, padding: '24px' }}>
            <div style={{ width: 44, height: 44, backgroundColor: '#e0f2fe', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <BookOpen size={22} color="#0284c7" />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>+10.000 Preguntas Clínicas</h3>
            <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.6 }}>
              Banco categorizado por especialidad y tema. Cada pregunta incluye justificación detallada y referencias a Guías Clínicas GES/MINSAL.
            </p>
          </div>

          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 18, padding: '24px' }}>
            <div style={{ width: 44, height: 44, backgroundColor: '#dcfce7', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <FileText size={22} color="#059669" />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>Reconstrucciones Oficiales</h3>
            <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.6 }}>
              Practica con preguntas extraídas de exámenes reales pasados. Aprende el patrón de preguntas y los distractores más comunes de ASOFAMECH.
            </p>
          </div>

          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 18, padding: '24px' }}>
            <div style={{ width: 44, height: 44, backgroundColor: '#f3e8ff', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Video size={22} color="#7c3aed" />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>Clases en Video & Guías</h3>
            <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.6 }}>
              Módulos explicativos por especialidad médica para reforzar los conceptos complejos y los protocolos de manejo de urgencia en Chile.
            </p>
          </div>

          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 18, padding: '24px' }}>
            <div style={{ width: 44, height: 44, backgroundColor: '#fef3c7', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Calendar size={22} color="#d97706" />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>Plan de Estudio Adaptativo</h3>
            <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.6 }}>
              Ingresa tu fecha de examen y el sistema organizará tus semanas de estudio, priorizando Medicina Interna, Pediatría y tus puntos débiles.
            </p>
          </div>

          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 18, padding: '24px' }}>
            <div style={{ width: 44, height: 44, backgroundColor: '#fee2e2', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Target size={22} color="#dc2626" />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>Simulacros 180 Preguntas</h3>
            <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.6 }}>
              Entrena en condiciones idénticas al EUNACOM real: 180 preguntas, cronómetro de 4 horas y distribución exacta por ponderación oficial.
            </p>
          </div>

          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 18, padding: '24px' }}>
            <div style={{ width: 44, height: 44, backgroundColor: '#e0f2fe', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <BarChart2 size={22} color="#0284c7" />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>Módulo de Errores & Stats</h3>
            <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.6 }}>
              Visualiza tu porcentaje de acierto por especialidad y repasa exclusivamente las preguntas que tuviste malas para fijar el conocimiento.
            </p>
          </div>
        </div>
      </section>

      {/* ── COMPARISON TABLE ── */}
      <section style={{ padding: '60px 16px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <span style={{ color: '#0284c7', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Comparativa de Valor</span>
            <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.3rem)', fontWeight: 800, color: '#0f172a', marginTop: 4, marginBottom: 10 }}>
              ¿Por qué pagar más de $500.000 por un curso antiguo?
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Eunacom App combina tecnología moderna, preguntas reales y precios justos.</p>
          </div>

          <div style={{ backgroundColor: '#ffffff', borderRadius: 18, border: '1px solid #e2e8f0', overflowX: 'auto', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '480px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '14px 16px', color: '#475569', fontSize: '0.82rem', fontWeight: 700 }}>CARACTERÍSTICA</th>
                  <th style={{ padding: '14px 16px', color: '#0284c7', fontSize: '0.86rem', fontWeight: 800, backgroundColor: '#e0f2fe' }}>EUNACOM APP</th>
                  <th style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.82rem', fontWeight: 700 }}>CURSOS TRADICIONALES (GUEVARA / EUNAMED)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'Arancel / Precio', us: 'Desde $14.990 CLP (Pago único)', them: '$450.000 a $1.200.000+ CLP', bold: true },
                  { label: 'Banco de Preguntas', us: '+10.000 preguntas con justificación', them: '1.000 – 3.000 preguntas', bold: false },
                  { label: 'Clases en Video', us: '+650 videoclases modulares organizadas por subespecialidad', them: 'Clases sincrónicas largas sin videoteca modular', bold: true },
                  { label: 'Reconstrucciones Reales', us: 'Completas de todas las convocatorias', them: 'Desactualizadas o restringidas', bold: false },
                  { label: 'Flexibilidad de Horarios', us: '24/7 a tu propio ritmo en celular/PC', them: 'Clases sincrónicas rígidas', bold: false },
                  { label: 'Plan de Estudio Adaptativo', us: 'Se ajusta a tus errores y fecha', them: 'Mismo temario plano para todos', bold: false },
                ].map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px', color: '#1e293b', fontWeight: 600, fontSize: '0.86rem' }}>{row.label}</td>
                    <td style={{ padding: '14px 16px', color: '#0284c7', fontWeight: row.bold ? 800 : 700, fontSize: '0.86rem', backgroundColor: '#f0f9ff' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Check size={15} color="#0284c7" />
                        <span>{row.us}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.84rem' }}>{row.them}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── PRICING SECTION ── */}
      <section id="planes" style={{ padding: '72px 16px', maxWidth: '1240px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <span style={{ color: '#0284c7', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Precios Claros</span>
          <h2 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.6rem)', fontWeight: 800, color: '#0f172a', marginTop: 4, marginBottom: 10 }}>
            Elige el plan ideal para tu preparación
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem', maxWidth: '540px', margin: '0 auto' }}>
            Pago único por el período que elijas. Sin renovaciones automáticas ni letras chicas.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20, alignItems: 'stretch' }}>
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              style={{
                backgroundColor: '#ffffff',
                border: plan.popular ? '2px solid #0284c7' : '1px solid #e2e8f0',
                borderRadius: 18,
                padding: '28px 20px',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                boxShadow: plan.popular ? '0 12px 30px -4px rgba(2, 132, 199, 0.18)' : '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              {plan.badge && (
                <div style={{
                  position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)',
                  backgroundColor: plan.popular ? '#0284c7' : '#f1f5f9',
                  color: plan.popular ? '#ffffff' : '#475569',
                  fontSize: '0.72rem', fontWeight: 700,
                  padding: '3px 12px', borderRadius: 9999,
                  border: plan.popular ? 'none' : '1px solid #cbd5e1'
                }}>
                  {plan.badge}
                </div>
              )}

              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>{plan.name}</h3>
              <p style={{ color: '#64748b', fontSize: '0.82rem', lineHeight: 1.5, minHeight: 38, marginBottom: 14 }}>{plan.desc}</p>

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>{plan.price}</div>
                <div style={{ color: '#64748b', fontSize: '0.78rem', fontWeight: 500 }}>{plan.unit}</div>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 16, marginBottom: 24, flex: 1 }}>
                {plan.features.map((feat, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10, fontSize: '0.84rem', color: '#334155', lineHeight: 1.4 }}>
                    <Check size={15} color="#0284c7" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => openAuthModal('register')}
                style={{
                  width: '100%',
                  backgroundColor: plan.popular ? '#0284c7' : '#f8fafc',
                  border: plan.popular ? 'none' : '1px solid #cbd5e1',
                  color: plan.popular ? '#ffffff' : '#334155',
                  padding: '13px 0',
                  borderRadius: 10,
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: plan.popular ? '0 4px 14px rgba(2, 132, 199, 0.3)' : 'none',
                }}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ACCORDION ── */}
      <section style={{ padding: '60px 16px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <span style={{ color: '#0284c7', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Resolución de Dudas</span>
            <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.3rem)', fontWeight: 800, color: '#0f172a', marginTop: 4, marginBottom: 10 }}>
              Preguntas Frecuentes sobre el EUNACOM
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              ¿Tienes más dudas? Consulta nuestra sección de preguntas.{' '}
              <span onClick={() => navigate('/faq')} style={{ color: '#0284c7', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>
                Ver todas las preguntas →
              </span>
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaq === idx
              return (
                <div
                  key={idx}
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 14,
                    padding: '16px 20px',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '0.94rem', fontWeight: 700, color: '#0f172a', margin: 0, paddingRight: 12 }}>{item.q}</h3>
                    <ChevronDown size={18} color="#64748b" style={{ flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                  </div>
                  {isOpen && (
                    <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.6, marginTop: 10, marginBottom: 0 }}>
                      {item.a}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── FINAL CALL TO ACTION ── */}
      <section style={{ padding: '60px 16px', backgroundColor: '#0284c7', color: '#ffffff', textAlign: 'center' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800, color: '#ffffff', marginBottom: 12 }}>
            Empieza a preparar tu EUNACOM hoy
          </h2>
          <p style={{ fontSize: '1rem', color: '#e0f2fe', lineHeight: 1.6, marginBottom: 30 }}>
            Únete a los médicos que están practicando con preguntas reales y asegura tu habilitación profesional en Chile.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={() => openAuthModal('register')}
              style={{
                backgroundColor: '#ffffff',
                color: '#0284c7',
                border: 'none',
                padding: '14px 32px',
                borderRadius: 10,
                fontSize: '1rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 6px 16px rgba(0,0,0,0.12)'
              }}
            >
              Explorar Plataforma Gratis →
            </button>
            <button
              onClick={() => openAuthModal('login')}
              style={{
                backgroundColor: 'transparent',
                border: '1.5px solid #ffffff',
                color: '#ffffff',
                padding: '14px 26px',
                borderRadius: 10,
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0', padding: '40px 16px', textAlign: 'center', color: '#64748b', fontSize: '0.84rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 16, flexWrap: 'wrap' }}>
          <Link to="/" style={{ color: '#475569', textDecoration: 'none', fontWeight: 600 }}>Inicio</Link>
          <Link to="/curso-eunacom-2026" style={{ color: '#475569', textDecoration: 'none', fontWeight: 600 }}>Mejor Curso EUNACOM 2026</Link>
          <Link to="/simulacros-eunacom" style={{ color: '#475569', textDecoration: 'none', fontWeight: 600 }}>Simulacros Oficiales</Link>
          <Link to="/guia-eunacom-2026" style={{ color: '#475569', textDecoration: 'none', fontWeight: 600 }}>Guía Completa 2026</Link>
          <Link to="/reconstrucciones-eunacom" style={{ color: '#475569', textDecoration: 'none', fontWeight: 600 }}>Reconstrucciones Reales</Link>
          <Link to="/convenios" style={{ color: '#475569', textDecoration: 'none', fontWeight: 600 }}>Convenios</Link>
          <a href="#planes" style={{ color: '#475569', textDecoration: 'none', fontWeight: 600 }}>Planes</a>
          <Link to="/faq" style={{ color: '#475569', textDecoration: 'none', fontWeight: 600 }}>FAQ</Link>
          <Link to="/blog" style={{ color: '#475569', textDecoration: 'none', fontWeight: 600 }}>Blog EUNACOM</Link>
          <a href="/login" onClick={(e) => { e.preventDefault(); openAuthModal('login') }} style={{ color: '#475569', textDecoration: 'none', fontWeight: 600 }}>Iniciar Sesión</a>
        </div>
        <p style={{ margin: 0 }}>© {new Date().getFullYear()} Eunacom App · eunacomapp.cl · Todos los derechos reservados · Chile</p>
      </footer>

      {/* Responsive Breakpoints & Marquee CSS */}
      <style>{`
        @keyframes marqueeLeft {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marqueeRight {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .marquee-left {
          animation: marqueeLeft 40s linear infinite;
        }
        .marquee-right {
          animation: marqueeRight 40s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .desktop-auth { display: none !important; }
          .mobile-toggle { display: block !important; }
          .marquee-left { animation-duration: 25s; }
          .marquee-right { animation-duration: 25s; }
        }
      `}</style>
    </div>
  )
}
