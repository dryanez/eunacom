import { nextExam } from '../../config/examen'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Database, PenLine, Flame,
  Layers, Timer, RotateCcw, CalendarDays, Image as ImageIcon, LogIn, UserPlus, Archive,
} from 'lucide-react'
import './midnight.css'
import { LIB_3D, LIB_BOOK_COUNT } from '../../config/biblioteca'

// Inicio (rediseño nov-2026): arriba los números (dominio, respondidas, racha, meta), después tarjetas grandes
// (clase con el video andando, banco, biblioteca con libros 3D que se deslizan, reconstrucciones) y accesos rápidos.
const MORE = [
  { to: '/reconstructions', icon: Archive, title: 'Reconstrucciones', sub: '17 exámenes', tone: 'red' },
  { to: '/flashcards', icon: Layers, title: 'Flashcards', sub: '21 mazos Anki', tone: 'violet' },
  { to: '/simulation', icon: Timer, title: 'Simulación', sub: 'Examen con tiempo', tone: 'amber' },
  { to: '/review', icon: RotateCcw, title: 'Repasar errores', sub: 'Por tema', tone: 'pink' },
  { to: '/study-plan', icon: CalendarDays, title: 'Plan de estudio', sub: 'Lo de hoy', tone: 'teal' },
  { to: '/biblioteca?sec=atlas', icon: ImageIcon, title: '19 Atlas', sub: '1.144 fotos', tone: 'green' },
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

// Tarjeta del Banco de preguntas: verde si tu promedio está sobre el 51 %, rojo si está bajo.
// Variantes para elegir el diseño: ?banco=1..5 (por ahora; luego queda solo la elegida)
function BankCard({ pct: realPct, onOpen }) {
  const qs = new URLSearchParams(window.location.search)
  const v = Number(qs.get('banco')) || 1
  const pct = import.meta.env.DEV && qs.get('pct') ? Number(qs.get('pct')) : realPct  // solo en local, para ver el verde y el rojo
  const ok = pct >= PASS, c = ok ? '#4ade80' : '#f87171', c2 = ok ? '#16a34a' : '#dc2626'
  const state = ok ? `Sobre el ${PASS} % para aprobar` : `Bajo el ${PASS} % para aprobar`
  const cta = <span className="bk-cta"><PenLine size={18} /><span>Crear test</span><span aria-hidden="true">→</span></span>
  const title = <div className="bk-t"><b>Banco de preguntas</b><span>47.271 preguntas tipo EUNACOM</span></div>
  const r = 52, C = 2 * Math.PI * r
  const ring = size => (
    <svg width={size} height={size} viewBox="0 0 120 120" className="bk-ring">
      <circle cx="60" cy="60" r={r} fill="none" stroke="#1e293b" strokeWidth="11" />
      <circle cx="60" cy="60" r={r} fill="none" stroke={c} strokeWidth="11" strokeLinecap="round" strokeDasharray={`${Math.max(1, C * pct / 100)} ${C}`} transform="rotate(-90 60 60)" />
      <line x1="60" y1="1" x2="60" y2="19" stroke="#fff" strokeWidth="3" strokeLinecap="round" transform={`rotate(${3.6 * PASS} 60 60)`} />
      <text x="60" y="64" textAnchor="middle" fontSize="27" fontWeight="800" fill={c}>{pct}%</text>
      <text x="60" y="82" textAnchor="middle" fontSize="10" fill="#94a3b8">correctas</text>
    </svg>
  )
  const L = Math.PI * 70, ang = Math.PI * (1 - PASS / 100)
  return (
    <button className={`bk bk${v} ${ok ? 'ok' : 'bad'}`} style={{ '--c': c, '--c2': c2 }} onClick={onOpen}>
      {v === 1 && <><div className="bk-row">{ring(124)}<div>{title}<span className="bk-state">{state}</span></div></div>{cta}</>}
      {v === 2 && <><div className="bk-glow" />{title}<div className="bk-big"><b>{pct}%</b><span>correctas en tus tests</span></div>
        <div className="bk-bar"><i style={{ width: `${Math.max(2, pct)}%` }} /><em style={{ left: `${PASS}%` }} /></div><div className="bk-bl"><span style={{ left: `${PASS}%` }}>aprobar {PASS} %</span></div>{cta}</>}
      {v === 3 && <><div className="bk-q"><span className="tag">Cardiología</span><p>Una paciente presenta un ECG con QRS ancho, PR corto y onda delta. Tendrá alto riesgo de:</p>
        <div className="op ok"><b>A</b>Muerte súbita</div><div className="op"><b>B</b>Fibrilación auricular</div></div>
        <div className="bk-row2">{title}<span className="bk-pill">{pct}%</span></div><span className="bk-state">{state}</span>{cta}</>}
      {v === 4 && <>{title}<div className="bk-gauge"><svg viewBox="0 0 180 104" width="250">
        <path d="M20 92 A70 70 0 0 1 160 92" fill="none" stroke="#1e293b" strokeWidth="14" strokeLinecap="round" />
        <path d="M20 92 A70 70 0 0 1 160 92" fill="none" stroke={c} strokeWidth="14" strokeLinecap="round" strokeDasharray={`${Math.max(1, L * pct / 100)} ${L}`} />
        <line x1={90 + 58 * Math.cos(ang)} y1={92 - 58 * Math.sin(ang)} x2={90 + 82 * Math.cos(ang)} y2={92 - 82 * Math.sin(ang)} stroke="#fff" strokeWidth="3" strokeLinecap="round" /></svg>
        <div className="bk-gv"><b>{pct}%</b><span>{state}</span></div></div>{cta}</>}
      {v === 5 && <><div className="bk-side"><b>{pct}%</b><span>{ok ? 'Aprobando' : `Bajo ${PASS} %`}</span></div><div className="bk-main">{title}{cta}</div></>}
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

      <BankCard pct={accuracy} onOpen={go('/test')} />

      <div className="mn2-stats mn2-stats3">
        <div className="s"><Database size={16} className="i" /><b>{Number(answered || 0).toLocaleString('es-CL')}</b><small>Respondidas</small></div>
        <div className="s"><Flame size={16} className="i" style={{ color: '#fb923c' }} /><b style={{ color: '#fb923c' }}>{streak} {streak === 1 ? 'día' : 'días'}</b><small>Días de racha</small></div>
        <div className="s"><PenLine size={16} className="i" style={{ color: '#fbbf24' }} /><b style={{ color: '#fbbf24' }}>{todayAnswers}<em>/{dailyGoal}</em></b><small>Preguntas hoy</small><span className="mini"><em style={{ width: `${Math.max(3, dailyPct)}%` }} /></span></div>
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

      <h3 className="mn2-sec">Accesos rápidos</h3>
      <div className="mn2-acc">
        {MORE.map(m => (
          <button key={m.to} className={`mn2-a mn-tone-${m.tone}`} onClick={go(m.to)}>
            <span className="mn2-ib"><m.icon size={20} /></span>
            <span><b>{m.title}</b><small>{m.sub}</small></span>
          </button>
        ))}
      </div>
    </section>
  )
}
