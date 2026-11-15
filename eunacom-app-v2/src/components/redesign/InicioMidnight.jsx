import { nextExam } from '../../config/examen'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Database, PenLine, Flame,
  LogIn, UserPlus,
} from 'lucide-react'
import './midnight.css'
import { LIB_3D, LIB_BOOK_COUNT } from '../../config/biblioteca'

// Inicio (rediseño nov-2026): arriba los números (dominio, respondidas, racha, meta), después tarjetas grandes
// (clase con el video andando, banco, biblioteca con libros 3D que se deslizan, reconstrucciones) y accesos rápidos.
// Accesos rápidos: cada uno con su propio dibujo (libros 3D reales, logo de Anki y mini-escenas), no íconos genéricos.
const ArtSim = () => (
  <svg viewBox="0 0 64 64" className="qa-svg">
    <rect x="8" y="10" width="34" height="44" rx="5" fill="#f8fafc" transform="rotate(-6 25 32)" />
    <g transform="rotate(-6 25 32)" fill="#cbd5e1"><rect x="13" y="17" width="20" height="3" rx="1.5" /><rect x="13" y="24" width="24" height="2.4" rx="1.2" /><rect x="13" y="30" width="18" height="2.4" rx="1.2" /><rect x="13" y="36" width="22" height="2.4" rx="1.2" /></g>
    <circle cx="44" cy="42" r="15" fill="#f59e0b" /><circle cx="44" cy="42" r="11.5" fill="#fff7ed" />
    <rect x="41" y="23" width="6" height="5" rx="1.5" fill="#f59e0b" />
    <path d="M44 42 L44 33.5" stroke="#0f172a" strokeWidth="2.4" strokeLinecap="round" /><path d="M44 42 L50 45" stroke="#ea580c" strokeWidth="2.4" strokeLinecap="round" className="qa-hand" />
    <circle cx="44" cy="42" r="2" fill="#0f172a" />
  </svg>
)
const ArtErr = () => (
  <svg viewBox="0 0 64 64" className="qa-svg">
    <rect x="6" y="9" width="46" height="46" rx="7" fill="#f8fafc" transform="rotate(5 29 32)" />
    <g transform="rotate(5 29 32)">
      <rect x="11" y="15" width="30" height="3" rx="1.5" fill="#cbd5e1" />
      <rect x="11" y="23" width="36" height="9" rx="3" fill="#fee2e2" stroke="#f87171" strokeWidth="1.2" /><path d="M14 25.5l4 4m0-4l-4 4" stroke="#dc2626" strokeWidth="1.8" strokeLinecap="round" /><rect x="21" y="26.5" width="18" height="2" rx="1" fill="#fca5a5" />
      <rect x="11" y="36" width="36" height="9" rx="3" fill="#dcfce7" stroke="#4ade80" strokeWidth="1.2" /><path d="M13.5 40.5l2.3 2.3 4-4.3" stroke="#16a34a" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" /><rect x="21" y="39.5" width="20" height="2" rx="1" fill="#86efac" />
    </g>
    <circle cx="50" cy="14" r="9" fill="#ec4899" /><path d="M46 14a4 4 0 1 0 1.3-3" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" /><path d="M46.6 9.6l.8 2.4 2.4-.6" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const ArtPlan = () => {
  const d = new Date().getDate()
  return (
    <svg viewBox="0 0 64 64" className="qa-svg">
      <rect x="9" y="12" width="46" height="44" rx="7" fill="#f8fafc" />
      <path d="M9 19a7 7 0 0 1 7-7h32a7 7 0 0 1 7 7v5H9z" fill="#14b8a6" />
      <rect x="19" y="7" width="4" height="10" rx="2" fill="#0f766e" /><rect x="41" y="7" width="4" height="10" rx="2" fill="#0f766e" />
      <text x="32" y="47" textAnchor="middle" fontSize="20" fontWeight="800" fill="#0f172a" fontFamily="Lexend,sans-serif">{d}</text>
      <circle cx="32" cy="40" r="12.5" fill="none" stroke="#f43f5e" strokeWidth="2" strokeDasharray="62 8" transform="rotate(-30 32 40)" />
    </svg>
  )
}
const MORE = [
  { to: '/reconstructions', img: '/tienda/3d/rec_JUL2026.webp', cls: 'book', title: 'Reconstrucciones', sub: '17 exámenes', tone: 'red' },
  { to: '/flashcards', img: '/tienda/anki.webp', title: 'Flashcards', sub: '21 mazos Anki', tone: 'violet', cls: 'anki' },
  { to: '/simulation', Art: ArtSim, title: 'Simulación', sub: 'Examen con tiempo', tone: 'amber' },
  { to: '/review', Art: ArtErr, title: 'Repasar errores', sub: 'Por tema', tone: 'pink' },
  { to: '/study-plan', Art: ArtPlan, title: 'Plan de estudio', sub: 'Lo de hoy', tone: 'teal' },
  { to: '/biblioteca?sec=atlas', img: '/tienda/3d/atlas_cardiologia.webp', cls: 'book', title: '19 Atlas', sub: '1.144 fotos', tone: 'green' },
]
const PASS = 51 // % para aprobar el EUNACOM
const R2V = 'https://pub-779a681676944ef9acf0f9492f86ba03.r2.dev/Clases_V3/'
const mm = t => { t = Math.max(0, Math.round(t || 0)); return Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0') }

function Ring({ pct, color = '#38bdf8', size = 64 }) {
  const r = 18, c = 2 * Math.PI * r
  return (
    <svg className="mn2-ring" width={size} height={size} viewBox="0 0 44 44">
      <circle cx="22" cy="22" r={r} fill="none" stroke="#1e293b" strokeWidth="4" />
      <circle cx="22" cy="22" r={r} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeDasharray={`${Math.max(.5, c * pct / 100)} ${c}`} transform="rotate(-90 22 22)" />
      <text x="22" y="26" textAnchor="middle" fontSize="11" fontWeight="700" fill="#e2e8f0">{pct}%</text>
    </svg>
  )
}

// La clase donde quedaste (o la primera que falta), desde el avance de «Mis clases»
function useNextClass() {
  const [c, setC] = useState(null)
  useEffect(() => {
    let p = { done: {}, pos: {} }
    try { p = JSON.parse(localStorage.getItem('cv3_progress')) || p } catch {}
    fetch('/data/clases-v3/index.json').then(r => r.json()).then(idx => {
      const all = []
      idx.modules.forEach(m => m.specialties.forEach(s => s.blocks.forEach(b => b.ids.forEach(id => {
        const cl = s.classes.find(x => x.id === id); if (cl) all.push({ ...cl, spec: s.key, specName: s.name })
      }))))
      const started = Object.keys(p.pos || {}).filter(id => !p.done?.[id]).pop()
      const pick = all.find(x => x.id === started) || all.find(x => !p.done?.[x.id]) || all[0]
      if (pick) setC({ ...pick, pos: started === pick.id ? (p.pos?.[pick.id] || 0) : 0, total: all.length })
    }).catch(() => {})
  }, [])
  return c
}

// Tarjeta del Banco de preguntas: medidor con tu % de correctas en todos los tests,
// verde si está sobre el 51 % para aprobar, rojo si está bajo. La rayita blanca marca el 51 %.
function BankCard({ pct: realPct, onOpen, answered = 0, streak = 0, today = 0, goal = 50 }) {
  const qs = new URLSearchParams(window.location.search)
  const pct = import.meta.env.DEV && qs.get('pct') ? Number(qs.get('pct')) : realPct  // solo en local, para ver el verde y el rojo
  const ok = pct >= PASS, c = ok ? '#4ade80' : '#f87171', c2 = ok ? '#16a34a' : '#dc2626'
  const state = ok ? `Sobre el ${PASS} % para aprobar` : `Bajo el ${PASS} % para aprobar`
  const L = Math.PI * 70, ang = Math.PI * (1 - PASS / 100)
  return (
    <button className={`bk bk4 ${ok ? 'ok' : 'bad'}`} style={{ '--c': c, '--c2': c2 }} onClick={onOpen}>
      <div className="bk-t"><b>Banco de preguntas</b><span>47.271 preguntas tipo EUNACOM</span></div>
      <div className="bk-body">
        <div className="bk-gauge"><svg viewBox="0 0 180 104" width="170">
          <path d="M20 92 A70 70 0 0 1 160 92" fill="none" stroke="#1e293b" strokeWidth="14" strokeLinecap="round" />
          <path d="M20 92 A70 70 0 0 1 160 92" fill="none" stroke={c} strokeWidth="14" strokeLinecap="round" strokeDasharray={`${Math.max(1, L * pct / 100)} ${L}`} />
          <line x1={90 + 58 * Math.cos(ang)} y1={92 - 58 * Math.sin(ang)} x2={90 + 82 * Math.cos(ang)} y2={92 - 82 * Math.sin(ang)} stroke="#fff" strokeWidth="3" strokeLinecap="round" /></svg>
          <div className="bk-gv"><b>{pct}%</b><span>{ok ? 'Aprobando' : `Bajo ${PASS} %`}</span></div></div>
        <div className="bk-st">
          <div><Database size={15} /><b>{Number(answered || 0).toLocaleString('es-CL')}</b><small>respondidas</small></div>
          <div><Flame size={15} style={{ color: '#fb923c' }} /><b style={{ color: '#fb923c' }}>{streak}</b><small>{streak === 1 ? 'día' : 'días'} de racha</small></div>
          <div><PenLine size={15} style={{ color: '#fbbf24' }} /><b style={{ color: '#fbbf24' }}>{today}<em>/{goal}</em></b><small>hoy</small></div>
        </div>
      </div>
      <span className="bk-cta"><PenLine size={18} /><span>Crear test</span><span aria-hidden="true">→</span></span>
    </button>
  )
}

// guest: mismo Inicio, pero cada botón pide crear cuenta (onAuth('register'|'login'))
export default function InicioMidnight({ name, streak = 0, accuracy = 0, todayAnswers = 0, dailyGoal = 50, answered = 0, level = 1, levelTitle = '', xp = 0, levelPct = 0, avatar, guest = false, onAuth }) {
  const navigate = useNavigate()
  const go = to => () => (guest ? onAuth?.('register') : navigate(to))
  const dailyPct = Math.min(100, Math.round((todayAnswers / dailyGoal) * 100))
  const ex = nextExam()
  const cls = useNextClass()

  return (
    <section className="mn-inicio mn2">
      {ex && ex.days <= 120 && <small className="mn2-days">Faltan {ex.days} días para el EUNACOM del {ex.label}</small>}
      <div className="mn2-hola">
        {!guest && avatar && <img className="mn2-av" src={avatar} alt="" />}
        <div className="mn2-who">
          <h1 className="mn-h1">Hola, {name || 'Doctor'}</h1>
          {guest ? <p className="mn-sub">Crea tu cuenta gratis y empieza a prepararte para el EUNACOM</p>
            : <div className="mn2-lv"><b>Nivel {level}{levelTitle ? ` · ${levelTitle}` : ''}</b><i>{Number(xp || 0).toLocaleString('es-CL')} XP</i><span className="mn2-lvbar"><em style={{ width: `${Math.max(3, levelPct)}%` }} /></span></div>}
        </div>
      </div>

      {guest && (
        <div className="mn-guest-cta">
          <button className="mn-btn" onClick={() => onAuth?.('register')}><UserPlus size={16} /> Crear cuenta gratis</button>
          <button className="mn-btn mn-btn-ghost" onClick={() => onAuth?.('login')}><LogIn size={16} /> Iniciar sesión</button>
        </div>
      )}

      <BankCard pct={accuracy} onOpen={go('/test')} answered={answered} streak={streak} today={todayAnswers} goal={dailyGoal} />
      <h3 className="mn2-sec">Accesos rápidos</h3>
      <div className="mn2-acc">
        {MORE.map(m => (
          <button key={m.to} className={`mn2-a mn-tone-${m.tone}`} onClick={go(m.to)}>
            <span className={`qa-art ${m.cls || ''}`}>{m.img ? <img src={m.img} alt="" loading="lazy" /> : <m.Art />}</span>
            <span><b>{m.title}</b><small>{m.sub}</small></span>
          </button>
        ))}
      </div>

      <div className="mn2-cards">
        {/* Clase: el video se reproduce (sin sonido) y sale un poco de la tarjeta */}
        <button className="mn2-card mn2-cls" onClick={go(cls ? `/mis-clases/${cls.spec}/${cls.id}` : '/mis-clases')}>
          <div className="mn2-t">
            <small>{cls?.pos ? 'Sigue tu clase' : 'Clases en video'} · {cls?.specName || 'Mis clases'}</small>
            <b>{cls ? `${cls.num} · ${cls.title}` : 'Clases animadas'}</b>
            <span>{cls?.pos ? `Vas en ${mm(cls.pos)} de ${cls.minutes} min` : `${cls?.total || 468} clases animadas`}</span>
            <span className="mn2-go">▶ {cls?.pos ? 'Continuar' : 'Empezar'}</span>
          </div>
          {cls && (
            <span className="mn2-vid">
              <video src={`${R2V}${cls.id.split('-')[0]}/${cls.id}.mp4#t=${Math.max(5, cls.pos || 60)}`} autoPlay muted loop playsInline preload="metadata" />
              <i className="live">Reproduciendo</i>
              {cls.pos ? <i className="bar" style={{ width: `${Math.min(100, 100 * cls.pos / (cls.minutes * 60))}%` }} /> : null}
            </span>
          )}
        </button>

        <button className="mn2-card mn2-lib" onClick={go('/biblioteca')}>
          <div className="mn2-t">
            <small>Biblioteca AEE</small>
            <b>{LIB_BOOK_COUNT} libros</b>
            <span>Tomos, Repaso Final, Libros Gordos y atlas</span>
          </div>
          <div className="mn2-mq" aria-hidden="true"><div className="mn2-tr">{[...LIB_3D, ...LIB_3D].map((s, i) => <img key={i} src={s} alt="" loading="lazy" />)}</div></div>
        </button>

        <button className="mn2-card mn2-rec" onClick={go('/reconstructions')}>
          <span className="mn2-stripe" />
          <div className="mn2-t">
            <small>Reconstrucciones · 17 exámenes</small>
            <b>Nueva: Julio 2026</b>
            <span className="mn2-go amber">Gratis con tu plan ›</span>
          </div>
          <img className="mn2-recbook" src="/tienda/3d/rec_JUL2026.webp" alt="Reconstrucción Julio 2026" />
        </button>
      </div>

    </section>
  )
}
