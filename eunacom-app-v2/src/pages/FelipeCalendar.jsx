import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getVideoUrl } from '../lib/videoMap'
import videoIndex from '../lib/videoIndex.json'
import {
  ChevronLeft, ChevronRight, Play, Check, X,
  Clock, BookOpen, Zap, Target, Trophy, Flame,
  RotateCcw, FileText, Star, Lock
} from 'lucide-react'

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const EXAM_DATE    = '2026-07-08'
const REVIEW_START = '2026-07-03'
const PLAN_START   = '2026-04-29'
const DR_EMAIL    = 'dr.felipeyanez@gmail.com'
const STORAGE_KEY = 'fc_v1'

// ─── SUBJECTS (yield-ordered) ─────────────────────────────────────────────────
const SUBJECTS = [
  // Phase 1 ── highest yield
  { id:'pediatria',    name:'Pediatría',              phase:1, icon:'👶', examQs:29, videoKey:'Pediatría',             total:18, startFrom:18, videoHours:5.75,  pruebaSlug:'modulo-3-pediatria' },
  { id:'endocrinologia',name:'Endocrinología',        phase:1, icon:'🔋', examQs:4,  videoKey:'Endocrinología',        total:16, startFrom:16, videoHours:2.47,  pruebaSlug:'modulo-1-endocrinologia' },
  { id:'diabetes',     name:'Diabetes',               phase:1, icon:'🍭', examQs:6,  videoKey:'Diabetes',              total:24, startFrom:0,  videoHours:4.71,  pruebaSlug:'modulo-1-endocrinologia' },
  { id:'ginecologia',  name:'Ginecología',            phase:1, icon:'🔬', examQs:15, videoKey:'Ginecología',           total:20, startFrom:0,  videoHours:4.64,  pruebaSlug:'modulo-3-ginecologia' },
  { id:'hematologia',  name:'Hematología',            phase:1, icon:'🩸', examQs:5,  videoKey:'Hematología',           total:18, startFrom:0,  videoHours:2.04,  pruebaSlug:'modulo-1-hematologia' },
  { id:'cirugia',      name:'Cirugía y Anestesia',    phase:1, icon:'⚕️', examQs:10, videoKey:'Cirugia General',       total:13, startFrom:0,  videoHours:4.02,  pruebaSlug:'modulo-2-cirugia-y-anestesia' },
  { id:'urologia',     name:'Urología',               phase:1, icon:'💧', examQs:5,  videoKey:'Urología',              total:15, startFrom:0,  videoHours:2.28,  pruebaSlug:'modulo-2-urologia' },
  { id:'neuro_geri',   name:'Neurología + Geriatría', phase:1, icon:'🧠', examQs:9,  videoKey:'Neurología y Geriatría', total:11, startFrom:0,  videoHours:3.98,  pruebaSlug:'modulo-1-neurologia' },
  // Phase 2 ── medium yield
  { id:'salud_pub',    name:'Salud Pública',          phase:2, icon:'🏥', examQs:9,  videoKey:'Salud Pública',         total:15, startFrom:0,  videoHours:5.14,  pruebaSlug:'modulo-2-salud-publica' },
  { id:'psiquiatria',  name:'Psiquiatría',            phase:2, icon:'🧬', examQs:14, videoKey:'Psiquiatría',           total:24, startFrom:0,  videoHours:9.10,  pruebaSlug:'modulo-2-psiquiatria' },
  { id:'obstetricia',  name:'Obstetricia',            phase:2, icon:'🤰', examQs:14, videoKey:'Obstetricia',           total:54, startFrom:0,  videoHours:9.42,  pruebaSlug:'modulo-3-obstetricia' },
  { id:'cardiologia',  name:'Cardiología',            phase:2, icon:'❤️', examQs:10, videoKey:'Cardiología',           total:47, startFrom:0,  videoHours:7.11,  pruebaSlug:'modulo-1-cardiologia' },
  { id:'gastro',       name:'Gastroenterología',      phase:2, icon:'🫁', examQs:10, videoKey:'Gastroenterología',     total:23, startFrom:0,  videoHours:7.42,  pruebaSlug:'modulo-1-gastroenterologia' },
  // Phase 3 ── lower yield
  { id:'dermato',      name:'Dermatología',           phase:3, icon:'🩺', examQs:4,  videoKey:'Dermatología',          total:24, startFrom:0,  videoHours:3.34,  pruebaSlug:'modulo-2-dermatologia' },
  { id:'tmt',          name:'Traumatología',          phase:3, icon:'🦴', examQs:5,  videoKey:'Traumatología',         total:15, startFrom:0,  videoHours:4.22,  pruebaSlug:'modulo-2-traumatologia' },
  { id:'nefro',        name:'Nefrología',             phase:3, icon:'🫘', examQs:5,  videoKey:'Nefrología',            total:26, startFrom:0,  videoHours:4.55,  pruebaSlug:'modulo-1-nefrologia' },
  { id:'respiratorio', name:'Respiratorio',           phase:3, icon:'🌬️', examQs:10, videoKey:'Respiratorio',          total:66, startFrom:0,  videoHours:10.06, pruebaSlug:'modulo-1-respiratorio' },
  { id:'oftalmo',      name:'Oftalmología',           phase:3, icon:'👁️', examQs:4,  videoKey:'Oftalmología',          total:24, startFrom:0,  videoHours:4.46,  pruebaSlug:'modulo-2-oftalmologia' },
  { id:'reumato',      name:'Reumatología',           phase:3, icon:'🦷', examQs:4,  videoKey:'Reumatología',          total:36, startFrom:0,  videoHours:4.75,  pruebaSlug:'modulo-1-reumatologia' },
  { id:'orl',          name:'ORL',                    phase:3, icon:'👂', examQs:4,  videoKey:'Otorrinolaringología',   total:47, startFrom:0,  videoHours:7.33,  pruebaSlug:'modulo-2-otorrinolaringologia' },
  { id:'infecto',      name:'Infectología',           phase:3, icon:'🦠', examQs:4,  videoKey:'Infectología',          total:24, startFrom:0,  videoHours:7.20,  pruebaSlug:'modulo-1-infectologia' },
]

const PHASE_META = {
  1: { label:'Fase 1', sublabel:'Mayor Rendimiento', color:'#10b981', dim:'#064e3b', text:'#6ee7b7' },
  2: { label:'Fase 2', sublabel:'Rendimiento Medio',  color:'#3b82f6', dim:'#1e3a5f', text:'#93c5fd' },
  3: { label:'Fase 3', sublabel:'Completar Temario',  color:'#f59e0b', dim:'#451a03', text:'#fcd34d' },
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const toStr   = d => d.toISOString().split('T')[0]
const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r }
const diffDays = (a, b) => Math.ceil((new Date(b) - new Date(a)) / 86400000)
const dayOfWeek = ds => new Date(ds + 'T12:00:00').getDay() // 0=Sun
const isWeekend = ds => { const d = dayOfWeek(ds); return d === 0 || d === 6 }
const isSat = ds => dayOfWeek(ds) === 6
const fmtMonth = d => d.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })
const fmtFull  = ds => new Date(ds + 'T12:00:00').toLocaleDateString('es-CL', { weekday:'long', day:'numeric', month:'long' })

// cap_mins: weekday=120, Saturday=90, Sunday=60
function vpdCapped(subject, capMins) {
  if (subject.total - subject.startFrom <= 0) return 0
  const avgMin = (subject.videoHours * 60) / subject.total
  return Math.max(1, Math.round(capMins / avgMin))
}
function dayCap(ds) {
  const wd = dayOfWeek(ds)
  if (wd === 6) return 90  // Saturday
  if (wd === 0) return 60  // Sunday
  return 120               // weekday
}

// ─── SCHEDULE GENERATOR ───────────────────────────────────────────────────────
function buildSchedule() {
  const sched = {}
  let cur = new Date(PLAN_START + 'T12:00:00')
  const reviewStart = new Date(REVIEW_START + 'T12:00:00')
  const examDate    = new Date(EXAM_DATE    + 'T12:00:00')

  for (const subj of SUBJECTS) {
    let vNum = subj.startFrom + 1
    while (vNum <= subj.total && cur < reviewStart) {
      const ds = toStr(cur)
      const cap = dayCap(ds)
      const count = Math.min(vpdCapped(subj, cap), subj.total - vNum + 1)
      const type = isSat(ds) ? 'study_sat' : dayOfWeek(ds) === 0 ? 'study_sun' : 'study'
      if (!sched[ds]) sched[ds] = { type, videos:[], subjects:[] }
      for (let i = 0; i < count && vNum <= subj.total; i++, vNum++) {
        const path = videoIndex[subj.videoKey]?.[String(vNum)]
        const rawTitle = path ? path.split('/').pop().replace(/\.mp4$/i,'') : `Clase ${vNum}`
        const title = rawTitle.replace(/^\d+[\.\-\s]+/, '').trim()
        sched[ds].videos.push({ subjectId: subj.id, subjectName: subj.name, phase: subj.phase, videoKey: subj.videoKey, videoNum: vNum, title })
      }
      if (!sched[ds].subjects.includes(subj.name)) sched[ds].subjects.push(subj.name)
      cur = addDays(cur, 1)
    }
  }

  // Fill remaining days
  let d = new Date(PLAN_START + 'T12:00:00')
  while (d <= examDate) {
    const ds = toStr(d)
    if (!sched[ds]) {
      if (ds === EXAM_DATE)         sched[ds] = { type:'exam_day',    videos:[], subjects:[] }
      else if (ds >= REVIEW_START)  sched[ds] = { type: isWeekend(ds) ? 'exam' : 'review', videos:[], subjects:[] }
      else if (isSat(ds))           sched[ds] = { type:'exam',        videos:[], subjects:[] }
      else if (dayOfWeek(ds) === 0) sched[ds] = { type:'exam_review', videos:[], subjects:[] }
      else                          sched[ds] = { type:'questions',   videos:[], subjects:['Preguntas + Repaso Flashcards'] }
    }
    d = addDays(d, 1)
  }
  return sched
}

const SCHEDULE = buildSchedule()

// ─── DAY DETAIL PANEL ─────────────────────────────────────────────────────────
function DayPanel({ ds, onClose, done, toggleVideo }) {
  const day = SCHEDULE[ds]
  if (!day) return null
  const isToday  = ds === toStr(new Date())
  const isPast   = ds < toStr(new Date())
  const subjects = [...new Set(day.videos.map(v => v.subjectName))]
  const phase    = day.videos[0]?.phase || null
  const meta     = phase ? PHASE_META[phase] : null
  const totalVideos = day.videos.length
  const doneVideos  = day.videos.filter(v => done[`${v.videoKey}_${v.videoNum}`]).length
  const pct = totalVideos > 0 ? Math.round((doneVideos / totalVideos) * 100) : 0

  // Estimated schedule — use real avg minutes from subject data
  const subj = SUBJECTS.find(x => x.id === day.videos[0]?.subjectId)
  const avgMinsPerVideo = subj ? (subj.videoHours * 60) / subj.total : 12
  const videoMins = Math.round(totalVideos * avgMinsPerVideo)
  const pruebaSlug = subj?.pruebaSlug || null
  const schedule  = [
    { time:'10:00',                             label:'🎬 Videos',          detail:`${totalVideos} video${totalVideos!==1?'s':''} (~${videoMins} min)`, color:'#3b82f6', link: null },
    { time: addHHMM('10:00', videoMins),        label:'✍️ Flashcards',      detail:'Escribir fichas de los videos', color:'#a855f7', link: null },
    { time: addHHMM('10:00', videoMins+30),     label:'❓ Preguntas app',   detail:`Prueba generada por IA (~40 preguntas)`, color:'#f59e0b', link: '/test' },
    { time: addHHMM('10:00', videoMins+75),     label:'📋 Prueba EUNACOM',  detail:`Preguntas reales de ${subj?.name || 'la especialidad'}`, color:'#ec4899', link: pruebaSlug ? `/pruebas/${pruebaSlug}` : '/test' },
    { time: addHHMM('10:00', videoMins+120),    label:'🃏 Repaso FC',       detail:'Revisar flashcards del día', color:'#10b981', link: null },
  ]

  return (
    <div style={{ position:'fixed', inset:0, zIndex:1000, display:'flex', alignItems:'flex-start', justifyContent:'flex-end', pointerEvents:'none' }}>
      {/* Overlay */}
      <div onClick={onClose} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.45)', pointerEvents:'all' }} />
      {/* Panel */}
      <div style={{
        position:'relative', pointerEvents:'all', width:'min(480px, 95vw)', height:'100vh',
        background:'#111827', borderLeft:'1px solid rgba(255,255,255,0.08)',
        overflowY:'auto', display:'flex', flexDirection:'column', animation:'slideInRight 0.22s ease-out'
      }}>
        {/* Header */}
        <div style={{ padding:'1.25rem 1.5rem 1rem', borderBottom:'1px solid rgba(255,255,255,0.07)', position:'sticky', top:0, background:'#111827', zIndex:1 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.5rem' }}>
            <div>
              <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'1.05rem', textTransform:'capitalize' }}>{fmtFull(ds)}</div>
              {isToday && <span style={{ fontSize:'0.7rem', background:'#3b82f6', color:'#fff', padding:'2px 8px', borderRadius:99, fontWeight:600 }}>HOY</span>}
            </div>
            <button onClick={onClose} style={{ background:'rgba(255,255,255,0.07)', border:'none', color:'#94a3b8', borderRadius:8, width:32, height:32, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <X size={16} />
            </button>
          </div>
          {meta && (
            <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:meta.dim, border:`1px solid ${meta.color}33`, borderRadius:99, padding:'3px 10px', fontSize:'0.72rem', color:meta.text, fontWeight:600 }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:meta.color }} />
              {meta.label} · {meta.sublabel}
            </div>
          )}
        </div>

        {/* Day type: exam / review */}
        {day.type === 'exam_day' && (
          <div style={{ margin:'1.5rem', padding:'1.5rem', background:'linear-gradient(135deg,#78350f,#92400e)', borderRadius:12, textAlign:'center' }}>
            <div style={{ fontSize:'2.5rem' }}>🏆</div>
            <div style={{ color:'#fcd34d', fontWeight:800, fontSize:'1.2rem', marginTop:8 }}>DÍA DEL EXAMEN</div>
            <div style={{ color:'#fde68a', fontSize:'0.85rem', marginTop:4 }}>EUNACOM — 8 de Julio 2026</div>
          </div>
        )}

        {(day.type === 'exam' || day.type === 'exam_review') && (
          <div style={{ margin:'1.5rem', padding:'1.5rem', background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.3)', borderRadius:12 }}>
            <div style={{ color:'#a5b4fc', fontWeight:700, fontSize:'1rem', marginBottom:8 }}>{isSat(ds) ? '📝 Examen Completo (Sábado)' : '📊 Revisión Examen (Domingo)'}</div>
            <ul style={{ color:'#c7d2fe', fontSize:'0.85rem', margin:0, paddingLeft:'1.2rem', lineHeight:1.8 }}>
              {isSat(ds) ? (
                <>
                  <li>10:00 — Simulacro completo 180 preguntas (cronometrado)</li>
                  <li>13:30 — Almuerzo</li>
                  <li>14:30 — Repasar preguntas incorrectas</li>
                  <li>16:00 — Libre</li>
                </>
              ) : (
                <>
                  <li>10:00 — Revisar errores del examen del sábado</li>
                  <li>11:30 — Reconstrucciones (app)</li>
                  <li>13:00 — Repaso flashcards semanales</li>
                  <li>14:00 — Libre</li>
                </>
              )}
            </ul>
          </div>
        )}

        {/* Weekend study day: videos in morning + simulacro/review after */}
        {(day.type === 'study_sat' || day.type === 'study_sun') && day.videos.length > 0 && (
          <div style={{ margin:'1.5rem 1.5rem 0', padding:'1rem 1.25rem', background:'rgba(99,102,241,0.08)', border:'1px solid rgba(99,102,241,0.25)', borderRadius:12 }}>
            <div style={{ color:'#a5b4fc', fontWeight:700, fontSize:'0.9rem', marginBottom:6 }}>
              {day.type === 'study_sat' ? '📝 Tarde: Simulacro' : '📊 Tarde: Revisión + Flashcards'}
            </div>
            <div style={{ color:'#c7d2fe', fontSize:'0.8rem' }}>
              {day.type === 'study_sat'
                ? 'Después de los videos: simulacro cronometrado (180 preguntas)'
                : 'Después de los videos: revisar errores del sábado y flashcards semanales'}
            </div>
          </div>
        )}

        {day.type === 'review' && (
          <div style={{ margin:'1.5rem', padding:'1.5rem', background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.25)', borderRadius:12 }}>
            <div style={{ color:'#6ee7b7', fontWeight:700, fontSize:'1rem', marginBottom:8 }}>🔁 Semana de Repaso Final</div>
            <ul style={{ color:'#a7f3d0', fontSize:'0.85rem', margin:0, paddingLeft:'1.2rem', lineHeight:1.8 }}>
              <li>10:00 — Repaso flashcards por tema</li>
              <li>11:30 — Reconstrucciones de la app</li>
              <li>13:00 — Preguntas tema débil</li>
              <li>14:30 — Libre</li>
            </ul>
          </div>
        )}

        {day.type === 'questions' && (
          <div style={{ margin:'1.5rem', padding:'1.25rem', background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.25)', borderRadius:12 }}>
            <div style={{ color:'#fcd34d', fontWeight:700, fontSize:'0.95rem', marginBottom:8 }}>❓ Día de Preguntas</div>
            <ul style={{ color:'#fde68a', fontSize:'0.84rem', margin:0, paddingLeft:'1.2rem', lineHeight:1.8 }}>
              <li>10:00 — 50 preguntas (app) — tema más débil</li>
              <li>11:15 — Repaso flashcards</li>
              <li>12:00 — Reconstrucciones</li>
              <li>13:00 — Libre</li>
            </ul>
          </div>
        )}

        {/* Study day: videos + schedule */}
        {['study','study_sat','study_sun'].includes(day.type) && day.videos.length > 0 && (
          <div style={{ padding:'0 1.5rem 1.5rem' }}>
            {/* Progress bar */}
            <div style={{ marginTop:'1.25rem', marginBottom:'1.5rem' }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.8rem', color:'#94a3b8', marginBottom:6 }}>
                <span>Progreso del día</span>
                <span style={{ color: pct===100 ? '#10b981' : '#f1f5f9', fontWeight:600 }}>{doneVideos}/{totalVideos} videos · {pct}%</span>
              </div>
              <div style={{ height:6, background:'rgba(255,255,255,0.08)', borderRadius:99, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${pct}%`, background: pct===100 ? '#10b981' : '#3b82f6', borderRadius:99, transition:'width 0.4s ease' }} />
              </div>
            </div>

            {/* Time schedule */}
            <div style={{ marginBottom:'1.5rem' }}>
              <div style={{ color:'#64748b', fontSize:'0.72rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>Horario</div>
              {schedule.map((s, i) => (
                <div key={i} style={{ display:'flex', gap:12, marginBottom:8, alignItems:'flex-start' }}>
                  <div style={{ color:'#475569', fontSize:'0.78rem', width:42, flexShrink:0, paddingTop:2, fontFamily:'monospace' }}>{s.time}</div>
                  <div style={{ flex:1, background:'rgba(255,255,255,0.03)', borderLeft:`2px solid ${s.color}55`, borderRadius:'0 6px 6px 0', padding:'6px 10px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
                    <div>
                      <div style={{ color:'#e2e8f0', fontSize:'0.85rem', fontWeight:600 }}>{s.label}</div>
                      <div style={{ color:'#64748b', fontSize:'0.76rem' }}>{s.detail}</div>
                    </div>
                    {s.link && (
                      <a href={s.link} style={{ flexShrink:0, fontSize:'0.7rem', color:s.color, background:`${s.color}15`, border:`1px solid ${s.color}40`, borderRadius:6, padding:'3px 8px', textDecoration:'none', fontWeight:600, whiteSpace:'nowrap' }}>
                        Ir →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Video list */}
            <div style={{ color:'#64748b', fontSize:'0.72rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 }}>
              Videos del día
            </div>
            {day.videos.map((v, i) => {
              const key   = `${v.videoKey}_${v.videoNum}`
              const isDone = done[key]
              const url   = getVideoUrl(v.videoKey, v.videoNum)
              return (
                <div key={i} style={{
                  display:'flex', alignItems:'center', gap:10, padding:'10px 12px',
                  background: isDone ? 'rgba(16,185,129,0.07)' : 'rgba(255,255,255,0.03)',
                  borderRadius:10, marginBottom:6,
                  border: `1px solid ${isDone ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.05)'}`,
                  transition:'all 0.15s'
                }}>
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleVideo(key)}
                    style={{
                      width:22, height:22, borderRadius:6, border:`2px solid ${isDone ? '#10b981' : '#334155'}`,
                      background: isDone ? '#10b981' : 'transparent', flexShrink:0, cursor:'pointer',
                      display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s'
                    }}>
                    {isDone && <Check size={13} color="#fff" strokeWidth={3} />}
                  </button>
                  {/* Info */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ color:'#475569', fontSize:'0.7rem', fontFamily:'monospace' }}>#{v.videoNum}</span>
                      <span style={{ color: isDone ? '#6ee7b7' : '#e2e8f0', fontSize:'0.84rem', fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {v.title}
                      </span>
                    </div>
                    <div style={{ color:'#475569', fontSize:'0.7rem', marginTop:2 }}>{v.subjectName}</div>
                  </div>
                  {/* Play button */}
                  {url && (
                    <a href={url} target="_blank" rel="noopener noreferrer"
                      style={{ flexShrink:0, width:30, height:30, borderRadius:8, background:'rgba(59,130,246,0.15)', border:'1px solid rgba(59,130,246,0.3)', display:'flex', alignItems:'center', justifyContent:'center', textDecoration:'none', transition:'all 0.15s' }}
                      onMouseOver={e => { e.currentTarget.style.background='rgba(59,130,246,0.3)' }}
                      onMouseOut={e  => { e.currentTarget.style.background='rgba(59,130,246,0.15)' }}>
                      <Play size={13} color="#60a5fa" fill="#60a5fa" />
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// simple HH:MM adder
function addHHMM(start, mins) {
  const [h, m] = start.split(':').map(Number)
  const total = h * 60 + m + mins
  return `${String(Math.floor(total / 60)).padStart(2,'0')}:${String(total % 60).padStart(2,'0')}`
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function FelipeCalendar() {
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [currentMonth, setCurrentMonth] = useState(new Date('2026-04-01'))
  const [selectedDay, setSelectedDay]   = useState(null)
  const [done, setDone] = useState({})

  // Gate: only for dr.felipeyanez@gmail.com
  useEffect(() => {
    if (user && !isAdmin()) navigate('/study-plan', { replace: true })
  }, [user])

  // Load completions from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setDone(JSON.parse(raw))
    } catch {}
  }, [])

  const toggleVideo = useCallback((key) => {
    setDone(prev => {
      const next = { ...prev, [key]: !prev[key] }
      if (!next[key]) delete next[key]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  // ── Calendar grid ──
  const calendarDays = useMemo(() => {
    const y = currentMonth.getFullYear()
    const m = currentMonth.getMonth()
    const firstDay = new Date(y, m, 1)
    const lastDay  = new Date(y, m + 1, 0)
    const startOffset = (firstDay.getDay() + 6) % 7 // Mon=0
    const days = []
    for (let i = 0; i < startOffset; i++) days.push(null)
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const ds = `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
      days.push(ds)
    }
    return days
  }, [currentMonth])

  // ── Stats ──
  const stats = useMemo(() => {
    const today = toStr(new Date())
    const daysLeft = Math.max(0, diffDays(today, EXAM_DATE))
    // Total videos across all subjects (including already-finished ones)
    const totalVideos  = SUBJECTS.reduce((s, subj) => s + subj.total, 0)
    const alreadyDone  = SUBJECTS.reduce((s, subj) => s + subj.startFrom, 0)
    const allScheduleVideos = Object.values(SCHEDULE).flatMap(d => d.videos)
    const scheduleDone = allScheduleVideos.filter(v => done[`${v.videoKey}_${v.videoNum}`]).length
    const doneCount = alreadyDone + scheduleDone
    const pct = totalVideos > 0 ? Math.round((doneCount / totalVideos) * 100) : 0
    // Week progress
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - ((weekStart.getDay()+6)%7))
    let weekTotal = 0, weekDone = 0
    for (let i = 0; i < 7; i++) {
      const ds = toStr(addDays(weekStart, i))
      const day = SCHEDULE[ds]
      if (!day) continue
      weekTotal += day.videos.length
      weekDone  += day.videos.filter(v => done[`${v.videoKey}_${v.videoNum}`]).length
    }
    const weekPct = weekTotal > 0 ? Math.round((weekDone / weekTotal) * 100) : 0
    return { daysLeft, pct, doneCount, totalVideos, weekPct, weekDone, weekTotal }
  }, [done])

  // ── Day cell style ──
  function dayCellStyle(ds) {
    const day = SCHEDULE[ds]
    if (!ds || !day) return {}
    const isToday = ds === toStr(new Date())
    const isPast  = ds < toStr(new Date())
    const type    = day.type
    const phase   = day.videos[0]?.phase
    const meta    = phase ? PHASE_META[phase] : null
    const bgColor = type === 'exam_day'   ? 'rgba(120,53,15,0.5)'   :
                    type === 'exam'        ? 'rgba(67,56,202,0.15)'   :
                    type === 'exam_review' ? 'rgba(67,56,202,0.08)'   :
                    type === 'review'      ? 'rgba(16,185,129,0.08)'  :
                    type === 'questions'   ? 'rgba(245,158,11,0.06)'  :
                    type === 'study_sat'   ? meta ? `${meta.dim}88` : 'rgba(67,56,202,0.10)' :
                    type === 'study_sun'   ? meta ? `${meta.dim}66` : 'rgba(67,56,202,0.06)' :
                    meta                   ? `${meta.dim}55`          : 'transparent'
    return {
      background: bgColor,
      borderColor: isToday ? '#3b82f6' :
                   type === 'exam_day' ? '#f59e0b' :
                   meta ? `${meta.color}30` : 'rgba(255,255,255,0.05)',
      opacity: isPast ? 0.6 : 1,
    }
  }

  function dayLabel(ds) {
    const day = SCHEDULE[ds]
    if (!day) return null
    const type = day.type
    if (type === 'exam_day')    return { icon:'🏆', text:'EXAMEN' }
    if (type === 'exam')        return { icon:'📝', text:'Simulacro' }
    if (type === 'exam_review') return { icon:'📊', text:'Revisión' }
    if (type === 'review')      return { icon:'🔁', text:'Repaso' }
    if (type === 'questions')   return { icon:'❓', text:'Preguntas' }
    if (type === 'study_sat' && day.subjects.length) return { icon: SUBJECTS.find(s=>s.name===day.subjects[0])?.icon||'📚', text: day.subjects[0] + ' + Simulacro' }
    if (type === 'study_sun' && day.subjects.length) return { icon: SUBJECTS.find(s=>s.name===day.subjects[0])?.icon||'📚', text: day.subjects[0] + ' + Repaso' }
    if (day.subjects.length)    return { icon: SUBJECTS.find(s=>s.name===day.subjects[0])?.icon||'📚', text: day.subjects[0] }
    return null
  }

  return (
    <div style={{ minHeight:'100vh', background:'#0a0f1e', color:'#f1f5f9', fontFamily:'Inter, sans-serif', padding:'1.5rem' }}>
      <style>{`
        @keyframes slideInRight { from { transform: translateX(100%) } to { transform: translateX(0) } }
        .day-cell:hover { border-color: rgba(59,130,246,0.5) !important; background: rgba(59,130,246,0.07) !important; transform: scale(1.01); cursor:pointer; }
        .day-cell { transition: all 0.12s ease; }
        .play-btn:hover { background: rgba(59,130,246,0.3) !important; }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{ maxWidth:1400, margin:'0 auto' }}>
        <div style={{ display:'flex', flexWrap:'wrap', gap:'1rem', alignItems:'center', justifyContent:'space-between', marginBottom:'1.5rem' }}>
          <div>
            <h1 style={{ margin:0, fontSize:'1.6rem', fontWeight:800, background:'linear-gradient(90deg,#60a5fa,#a78bfa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              Plan de Estudio — Dr. Yáñez
            </h1>
            <div style={{ color:'#64748b', fontSize:'0.85rem', marginTop:4 }}>EUNACOM · Julio 8, 2026 · Basado en rendimiento real por hora</div>
          </div>
          {/* Stats pills */}
          <div style={{ display:'flex', flexWrap:'wrap', gap:'0.75rem' }}>
            <StatPill icon={<Flame size={15}/>} label="Días restantes" value={stats.daysLeft} color="#f59e0b" />
            <StatPill icon={<Target size={15}/>} label="Videos totales" value={`${stats.doneCount}/${stats.totalVideos}`} color="#3b82f6" />
            <StatPill icon={<Trophy size={15}/>} label="Progreso total" value={`${stats.pct}%`} color="#10b981" />
            <StatPill icon={<Zap size={15}/>}    label="Esta semana"   value={`${stats.weekPct}%`} color="#a855f7" />
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom:'1.75rem', background:'rgba(255,255,255,0.04)', borderRadius:12, padding:'1rem 1.25rem' }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.8rem', color:'#64748b', marginBottom:8 }}>
            <span style={{ color:'#f1f5f9', fontWeight:600 }}>Progreso general</span>
            <span>{stats.pct}% completado</span>
          </div>
          <div style={{ height:8, background:'rgba(255,255,255,0.07)', borderRadius:99, overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${stats.pct}%`, background:'linear-gradient(90deg,#3b82f6,#a855f7)', borderRadius:99, transition:'width 0.6s ease' }} />
          </div>
          <div style={{ display:'flex', gap:'1.5rem', marginTop:10, flexWrap:'wrap' }}>
            {Object.entries(PHASE_META).map(([p, m]) => (
              <div key={p} style={{ display:'flex', alignItems:'center', gap:6, fontSize:'0.75rem', color:m.text }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:m.color }} />
                {m.label} — {m.sublabel}
              </div>
            ))}
            <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:'0.75rem', color:'#a5b4fc' }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:'#6366f1' }} />
              Fin de semana (Simulacro/Revisión)
            </div>
          </div>
        </div>

        {/* ── CALENDAR ── */}
        <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:16, overflow:'hidden' }}>
          {/* Month nav */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1rem 1.25rem', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
            <button onClick={() => setCurrentMonth(m => addDays(new Date(m.getFullYear(), m.getMonth(), 1), -1))}
              style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'#94a3b8', borderRadius:8, width:34, height:34, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <ChevronLeft size={16}/>
            </button>
            <span style={{ fontWeight:700, fontSize:'1.05rem', color:'#f1f5f9', textTransform:'capitalize' }}>{fmtMonth(currentMonth)}</span>
            <button onClick={() => setCurrentMonth(m => addDays(new Date(m.getFullYear(), m.getMonth()+1, 1), 0))}
              style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'#94a3b8', borderRadius:8, width:34, height:34, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <ChevronRight size={16}/>
            </button>
          </div>

          {/* Day headers */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
            {['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map(d => (
              <div key={d} style={{ textAlign:'center', padding:'0.6rem 0', fontSize:'0.72rem', fontWeight:600, color:'#475569', textTransform:'uppercase', letterSpacing:'0.05em' }}>{d}</div>
            ))}
          </div>

          {/* Grid */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)' }}>
            {calendarDays.map((ds, i) => {
              if (!ds) return <div key={`empty-${i}`} style={{ minHeight:110, borderRight:'1px solid rgba(255,255,255,0.04)', borderBottom:'1px solid rgba(255,255,255,0.04)' }} />
              const cellStyle  = dayCellStyle(ds)
              const label      = dayLabel(ds)
              const day        = SCHEDULE[ds]
              const isToday    = ds === toStr(new Date())
              const phase      = day?.videos[0]?.phase
              const meta       = phase ? PHASE_META[phase] : null
              const dayNum     = parseInt(ds.split('-')[2])
              const totalV     = day?.videos?.length || 0
              const doneV      = day?.videos?.filter(v => done[`${v.videoKey}_${v.videoNum}`]).length || 0
              return (
                <div key={ds} className="day-cell" onClick={() => setSelectedDay(ds)}
                  style={{
                    minHeight:110, padding:'0.5rem', borderRight:'1px solid rgba(255,255,255,0.04)',
                    borderBottom:'1px solid rgba(255,255,255,0.04)', display:'flex', flexDirection:'column', gap:4,
                    border:`1px solid ${cellStyle.borderColor||'rgba(255,255,255,0.04)'}`,
                    background: cellStyle.background, opacity: cellStyle.opacity,
                    boxShadow: isToday ? '0 0 0 2px #3b82f6 inset' : 'none',
                  }}>
                  {/* Day number */}
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <span style={{
                      width:24, height:24, borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:'0.78rem', fontWeight: isToday ? 800 : 500,
                      background: isToday ? '#3b82f6' : 'transparent',
                      color: isToday ? '#fff' : ds === EXAM_DATE ? '#fcd34d' : '#94a3b8',
                    }}>{dayNum}</span>
                    {meta && totalV > 0 && (
                      <span style={{ fontSize:'0.62rem', color:meta.text, background:meta.dim, borderRadius:99, padding:'1px 5px', fontWeight:600 }}>F{phase}</span>
                    )}
                  </div>
                  {/* Label */}
                  {label && (
                    <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                      <span style={{ fontSize:'0.9rem' }}>{label.icon}</span>
                      <span style={{ fontSize:'0.7rem', color:'#cbd5e1', fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1 }}>{label.text}</span>
                    </div>
                  )}
                  {/* Video count + mini progress */}
                  {totalV > 0 && (
                    <div style={{ marginTop:'auto' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.62rem', color:'#475569', marginBottom:3 }}>
                        <span>▶ {totalV} video{totalV!==1?'s':''}</span>
                        {doneV > 0 && <span style={{ color:'#10b981' }}>{doneV}/{totalV} ✓</span>}
                      </div>
                      <div style={{ height:3, background:'rgba(255,255,255,0.06)', borderRadius:99, overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${totalV>0?Math.round(doneV/totalV*100):0}%`, background: meta?.color||'#3b82f6', borderRadius:99 }} />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Phase subject summary */}
        <div style={{ marginTop:'1.5rem', display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'0.75rem' }}>
          {/* Done */}
          {/* Subjects by phase */}
          {[1,2,3].map(ph => {
            const subjsInPhase = SUBJECTS.filter(s => s.phase === ph)
            const meta = PHASE_META[ph]
            return (
              <div key={ph} style={{ background:`${meta.dim}55`, border:`1px solid ${meta.color}25`, borderRadius:10, padding:'0.75rem 1rem', gridColumn: ph===3 ? 'span 3' : undefined }}>
                <div style={{ color:meta.text, fontSize:'0.72rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:8 }}>{meta.label} · {meta.sublabel}</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                  {subjsInPhase.map(s => {
                    const qph = s.videoHours > 0 ? (s.examQs / s.videoHours).toFixed(1) : '—'
                    return (
                      <div key={s.id} style={{ fontSize:'0.71rem', color:meta.text, background:`${meta.color}15`, border:`1px solid ${meta.color}30`, borderRadius:8, padding:'4px 8px', lineHeight:1.4 }}>
                        <div style={{ fontWeight:600 }}>{s.icon} {s.name}</div>
                        <div style={{ opacity:0.7 }}>{s.videoHours}h · {s.examQs} Qs · {qph} q/h</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Day detail panel */}
      {selectedDay && (
        <DayPanel ds={selectedDay} onClose={() => setSelectedDay(null)} done={done} toggleVideo={toggleVideo} />
      )}
    </div>
  )
}

function StatPill({ icon, label, value, color }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, padding:'0.5rem 1rem' }}>
      <span style={{ color }}>{icon}</span>
      <div>
        <div style={{ color:'#475569', fontSize:'0.65rem', textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</div>
        <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'0.95rem' }}>{value}</div>
      </div>
    </div>
  )
}
