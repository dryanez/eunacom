import { nextExam } from '../../config/examen'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Database, PenLine, Flame, Star,
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

// guest: mismo Inicio, pero cada botón pide crear cuenta (onAuth('register'|'login'))
export default function InicioMidnight({ name, streak = 0, accuracy = 0, todayAnswers = 0, dailyGoal = 50, answered = 0, level = 1, levelTitle = '', xp = 0, levelPct = 0, avatar, guest = false, onAuth }) {
  const navigate = useNavigate()
  const go = to => () => (guest ? onAuth?.('register') : navigate(to))
  const dailyPct = Math.min(100, Math.round((todayAnswers / dailyGoal) * 100))
  const ex = nextExam()
  const cls = useNextClass()

  return (
    <section className="mn-inicio mn2">
      <div className="mn2-hola">
        <div>
          {ex && ex.days <= 120 && <small>Faltan {ex.days} días para el EUNACOM del {ex.label}</small>}
          <h1 className="mn-h1">Hola, {name || 'Doctor'}</h1>
          {guest && <p className="mn-sub">Crea tu cuenta gratis y empieza a prepararte para el EUNACOM</p>}
        </div>
        {!guest && (
          <div className="mn2-lvl">
            {avatar && <img src={avatar} alt="" />}
            <div><b>Nivel {level}{levelTitle ? ` · ${levelTitle}` : ''}</b><i>{Number(xp || 0).toLocaleString('es-CL')} XP</i><span className="mn2-lvbar"><em style={{ width: `${Math.max(3, levelPct)}%` }} /></span></div>
          </div>
        )}
      </div>

      {guest && (
        <div className="mn-guest-cta">
          <button className="mn-btn" onClick={() => onAuth?.('register')}><UserPlus size={16} /> Crear cuenta gratis</button>
          <button className="mn-btn mn-btn-ghost" onClick={() => onAuth?.('login')}><LogIn size={16} /> Iniciar sesión</button>
        </div>
      )}

      <div className="mn2-stats">
        <div className="s"><Star size={16} className="i" style={{ color: '#38bdf8' }} /><b style={{ color: '#38bdf8' }}>{accuracy}%</b><small>Correctas · de tus respuestas</small></div>
        <div className="s"><Database size={16} className="i" /><b>{Number(answered || 0).toLocaleString('es-CL')}</b><small>Preguntas respondidas</small></div>
        <div className="s"><Flame size={16} className="i" style={{ color: '#fb923c' }} /><b style={{ color: '#fb923c' }}>{streak} {streak === 1 ? 'día' : 'días'}</b><small>Racha · días seguidos</small></div>
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

        <button className="mn2-card mn2-q" onClick={go('/test')}>
          <div className="mn2-t">
            <small>Banco · 47.000+ preguntas</small>
            <b>{accuracy}% correctas</b>
            <span className="mn2-go blue"><PenLine size={13} /> Crear test</span>
          </div>
          <Ring pct={accuracy} />
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
