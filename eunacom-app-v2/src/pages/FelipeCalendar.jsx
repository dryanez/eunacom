import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getVideoUrl } from '../lib/videoMap'
import videoIndex from '../lib/videoIndex.json'
import { fetchStudyPlanSettings, saveStudyPlanSettings } from '../lib/api'
import {
  ChevronLeft, ChevronRight, Play, Check, X,
  Target, Trophy, Flame, Zap, Settings, Info, CheckCircle,
} from 'lucide-react'

// ─── SUBJECTS (sorted by examQs/videoHours ratio, high → low within each phase) ─
const SUBJECTS = [
  // Phase 1 — highest yield
  { id:'pediatria',      name:'Pediatría',              phase:1, icon:'👶', examQs:29, videoKey:'Pediatría',              total:18, videoHours:5.75,  pruebaSlug:'modulo-3-pediatria' },
  { id:'ginecologia',    name:'Ginecología',            phase:1, icon:'🔬', examQs:15, videoKey:'Ginecología',            total:20, videoHours:4.64,  pruebaSlug:'modulo-3-ginecologia' },
  { id:'cirugia',        name:'Cirugía y Anestesia',    phase:1, icon:'⚕️', examQs:10, videoKey:'Cirugia General',        total:13, videoHours:4.02,  pruebaSlug:'modulo-2-cirugia-y-anestesia' },
  { id:'hematologia',    name:'Hematología',            phase:1, icon:'🩸', examQs:5,  videoKey:'Hematología',            total:18, videoHours:2.04,  pruebaSlug:'modulo-1-hematologia' },
  { id:'neuro_geri',     name:'Neurología + Geriatría', phase:1, icon:'🧠', examQs:9,  videoKey:'Neurología y Geriatría', total:11, videoHours:3.98,  pruebaSlug:'modulo-1-neurologia' },
  { id:'urologia',       name:'Urología',               phase:1, icon:'💧', examQs:5,  videoKey:'Urología',               total:15, videoHours:2.28,  pruebaSlug:'modulo-2-urologia' },
  { id:'endocrinologia', name:'Endocrinología',         phase:1, icon:'🔋', examQs:4,  videoKey:'Endocrinología',         total:16, videoHours:2.47,  pruebaSlug:'modulo-1-endocrinologia' },
  { id:'diabetes',       name:'Diabetes',               phase:1, icon:'🍭', examQs:6,  videoKey:'Diabetes',               total:24, videoHours:4.71,  pruebaSlug:'modulo-1-endocrinologia' },
  // Phase 2 — medium yield
  { id:'salud_pub',      name:'Salud Pública',          phase:2, icon:'🏥', examQs:9,  videoKey:'Salud Pública',          total:15, videoHours:5.14,  pruebaSlug:'modulo-2-salud-publica' },
  { id:'psiquiatria',    name:'Psiquiatría',            phase:2, icon:'🧬', examQs:14, videoKey:'Psiquiatría',            total:24, videoHours:9.10,  pruebaSlug:'modulo-2-psiquiatria' },
  { id:'obstetricia',    name:'Obstetricia',            phase:2, icon:'🤰', examQs:14, videoKey:'Obstetricia',            total:54, videoHours:9.42,  pruebaSlug:'modulo-3-obstetricia' },
  { id:'cardiologia',    name:'Cardiología',            phase:2, icon:'❤️', examQs:10, videoKey:'Cardiología',            total:47, videoHours:7.11,  pruebaSlug:'modulo-1-cardiologia' },
  { id:'gastro',         name:'Gastroenterología',      phase:2, icon:'🫁', examQs:10, videoKey:'Gastroenterología',      total:23, videoHours:7.42,  pruebaSlug:'modulo-1-gastroenterologia' },
  // Phase 3 — complete the curriculum
  { id:'dermato',        name:'Dermatología',           phase:3, icon:'🩺', examQs:4,  videoKey:'Dermatología',           total:24, videoHours:3.34,  pruebaSlug:'modulo-2-dermatologia' },
  { id:'tmt',            name:'Traumatología',          phase:3, icon:'🦴', examQs:5,  videoKey:'Traumatología',          total:15, videoHours:4.22,  pruebaSlug:'modulo-2-traumatologia' },
  { id:'nefro',          name:'Nefrología',             phase:3, icon:'🫘', examQs:5,  videoKey:'Nefrología',             total:26, videoHours:4.55,  pruebaSlug:'modulo-1-nefrologia' },
  { id:'respiratorio',   name:'Respiratorio',           phase:3, icon:'🌬️', examQs:10, videoKey:'Respiratorio',           total:66, videoHours:10.06, pruebaSlug:'modulo-1-respiratorio' },
  { id:'oftalmo',        name:'Oftalmología',           phase:3, icon:'👁️', examQs:4,  videoKey:'Oftalmología',           total:24, videoHours:4.46,  pruebaSlug:'modulo-2-oftalmologia' },
  { id:'reumato',        name:'Reumatología',           phase:3, icon:'🦷', examQs:4,  videoKey:'Reumatología',           total:36, videoHours:4.75,  pruebaSlug:'modulo-1-reumatologia' },
  { id:'orl',            name:'ORL',                    phase:3, icon:'👂', examQs:4,  videoKey:'Otorrinolaringología',   total:47, videoHours:7.33,  pruebaSlug:'modulo-2-otorrinolaringologia' },
  { id:'infecto',        name:'Infectología',           phase:3, icon:'🦠', examQs:4,  videoKey:'Infectología',           total:24, videoHours:7.20,  pruebaSlug:'modulo-1-infectologia' },
]

const PHASE_META = {
  1: { label:'Fase 1', sublabel:'Mayor Rendimiento', color:'#10b981', dim:'#064e3b', text:'#6ee7b7',
       desc:'Especialidades con más preguntas EUNACOM por hora de video. Se estudian primero para maximizar los ciclos de repaso de flashcards.' },
  2: { label:'Fase 2', sublabel:'Rendimiento Medio',  color:'#3b82f6', dim:'#1e3a5f', text:'#93c5fd',
       desc:'Especialidades con alto peso en el examen pero mayor volumen de video. Se estudian después de cubrir los temas de mayor rendimiento.' },
  3: { label:'Fase 3', sublabel:'Completar Temario',  color:'#f59e0b', dim:'#451a03', text:'#fcd34d',
       desc:'Especialidades de menor densidad de preguntas. Se estudian al final para cubrir el 100% del temario antes del repaso.' },
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const toStr    = d  => d.toISOString().split('T')[0]
const addDays  = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r }
const diffDays = (a, b) => Math.ceil((new Date(b) - new Date(a)) / 86400000)
const dayOfWeek = ds => new Date(ds + 'T12:00:00').getDay()
const isWeekend = ds => { const d = dayOfWeek(ds); return d === 0 || d === 6 }
const isSat     = ds => dayOfWeek(ds) === 6
const fmtMonth  = d  => d.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })
const fmtFull   = ds => new Date(ds + 'T12:00:00').toLocaleDateString('es-CL', { weekday:'long', day:'numeric', month:'long' })

function addHHMM(start, mins) {
  const [h, m] = start.split(':').map(Number)
  const total  = h * 60 + m + mins
  return `${String(Math.floor(total / 60)).padStart(2,'0')}:${String(total % 60).padStart(2,'0')}`
}

function vpdCapped(subj, capMins) {
  const remaining = subj.total - subj.startFrom
  if (remaining <= 0) return 0
  const avgMin = (subj.videoHours * 60) / subj.total
  return Math.max(1, Math.round(capMins / avgMin))
}

// ─── SCHEDULE GENERATOR ──────────────────────────────────────────────────────
function buildSchedule(completedIds, planStart, examDate, dayCapFn) {
  const reviewStart     = toStr(addDays(new Date(examDate + 'T12:00:00'), -5))
  const reviewStartDate = new Date(reviewStart + 'T12:00:00')
  const examDateObj     = new Date(examDate    + 'T12:00:00')
  const sched = {}
  let cur = new Date(planStart + 'T12:00:00')

  for (const subj of SUBJECTS) {
    const startFrom = completedIds.includes(subj.id) ? subj.total : 0
    const s = { ...subj, startFrom }
    if (vpdCapped(s, 999) === 0) continue
    let vNum = startFrom + 1
    while (vNum <= subj.total && cur < reviewStartDate) {
      const ds  = toStr(cur)
      const cap = dayCapFn(ds)
      if (cap === 0) { cur = addDays(cur, 1); continue }
      const count = Math.min(vpdCapped(s, cap), subj.total - vNum + 1)
      const type  = isSat(ds) ? 'study_sat' : dayOfWeek(ds) === 0 ? 'study_sun' : 'study'
      if (!sched[ds]) sched[ds] = { type, videos: [], subjects: [] }
      for (let i = 0; i < count && vNum <= subj.total; i++, vNum++) {
        const path     = videoIndex[subj.videoKey]?.[String(vNum)]
        const rawTitle = path ? path.split('/').pop().replace(/\.mp4$/i, '') : `Clase ${vNum}`
        const title    = rawTitle.replace(/^\d+[\.\-\s]+/, '').trim()
        sched[ds].videos.push({ subjectId: subj.id, subjectName: subj.name, phase: subj.phase, videoKey: subj.videoKey, videoNum: vNum, title })
      }
      if (!sched[ds].subjects.includes(subj.name)) sched[ds].subjects.push(subj.name)
      cur = addDays(cur, 1)
    }
  }

  // Fill unfilled days from planStart to examDate
  let d = new Date(planStart + 'T12:00:00')
  while (d <= examDateObj) {
    const ds  = toStr(d)
    const cap = dayCapFn(ds)
    if (!sched[ds]) {
      if (ds === examDate)        sched[ds] = { type: 'exam_day',  videos: [], subjects: [] }
      else if (ds >= reviewStart) sched[ds] = { type: isWeekend(ds) ? 'exam' : 'review', videos: [], subjects: [] }
      else if (cap === 0)         sched[ds] = { type: 'rest',      videos: [], subjects: [] }
      else                        sched[ds] = { type: 'questions', videos: [], subjects: ['Preguntas + Repaso Flashcards'] }
    }
    d = addDays(d, 1)
  }
  return sched
}

// ─── OPTION BUTTON (shared by SetupModal) ────────────────────────────────────
function OptBtn({ val, cur, set, label }) {
  const active = cur === val
  return (
    <button onClick={() => set(val)} style={{
      padding: '0.45rem 0.9rem', borderRadius: 8, border: 'none',
      background: active ? '#3b82f6' : 'rgba(255,255,255,0.07)',
      color: active ? '#fff' : '#94a3b8',
      fontWeight: active ? 700 : 400, cursor: 'pointer',
      fontSize: '0.85rem', fontFamily: 'inherit', transition: 'all 0.12s',
    }}>{label}</button>
  )
}

// ─── SETUP MODAL (3-step onboarding) ─────────────────────────────────────────
function SetupModal({ onSave, initial }) {
  const [step, setStep] = useState(1)
  const [examDate,   setExamDate]   = useState(initial?.exam_date      || '2026-07-08')
  const [customDate, setCustomDate] = useState('')
  const [weekdayH,   setWeekdayH]   = useState(initial?.weekday_minutes  ? initial.weekday_minutes  / 60 : 2)
  const [satH,       setSatH]       = useState(initial?.saturday_minutes !== undefined ? initial.saturday_minutes / 60 : 1.5)
  const [sunH,       setSunH]       = useState(initial?.sunday_minutes   !== undefined ? initial.sunday_minutes   / 60 : 1)
  const [completed,  setCompleted]  = useState(() => {
    try { return initial?.completed_subjects ? JSON.parse(initial.completed_subjects) : [] } catch { return [] }
  })
  const [saving, setSaving] = useState(false)

  const finalDate  = customDate || examDate
  const daysLeft   = Math.max(0, diffDays(toStr(new Date()), finalDate))
  const wMins      = Math.round(weekdayH * 60)
  const sMins      = Math.round(satH     * 60)
  const suMins     = Math.round(sunH     * 60)

  const pendingHrs = SUBJECTS.filter(s => !completed.includes(s.id))
                              .reduce((sum, s) => sum + s.videoHours, 0)
  const avgDailyH  = (weekdayH * 5 + satH + sunH) / 7
  const daysNeeded = avgDailyH > 0 ? Math.ceil(pendingHrs / avgDailyH) : Infinity
  const fits       = daysNeeded <= daysLeft

  const toggle = id => setCompleted(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])

  const handleSave = async () => {
    setSaving(true)
    await onSave({
      examDate: finalDate,
      weekdayMinutes: wMins,
      saturdayMinutes: sMins,
      sundayMinutes: suMins,
      completedSubjects: completed,
      planStart: toStr(new Date()),
    })
    setSaving(false)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000, background: '#070d1a',
      overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '2.5rem 1rem',
    }}>
      {/* Step bar */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2.5rem' }}>
        {[1, 2, 3].map(n => (
          <div key={n} style={{
            width: 40, height: 4, borderRadius: 99,
            background: n <= step ? '#3b82f6' : 'rgba(255,255,255,0.1)',
            transition: 'background 0.25s',
          }} />
        ))}
      </div>

      <div style={{ maxWidth: 460, width: '100%' }}>

        {/* ── Step 1: Exam date ── */}
        {step === 1 && (
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '0.35rem' }}>
              ¿Cuándo rindés el EUNACOM?
            </div>
            <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '2rem' }}>
              El plan se adapta automáticamente al tiempo disponible.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.25rem' }}>
              {[
                { date: '2026-07-08',  label: 'Julio 8, 2026',      sub: 'Próximo EUNACOM' },
                { date: '2026-12-16',  label: 'Diciembre 16, 2026', sub: 'Segunda fecha 2026' },
              ].map(opt => {
                const active = examDate === opt.date && !customDate
                return (
                  <button key={opt.date} onClick={() => { setExamDate(opt.date); setCustomDate('') }} style={{
                    padding: '1rem 1.25rem', borderRadius: 12,
                    border: `2px solid ${active ? '#3b82f6' : 'rgba(255,255,255,0.08)'}`,
                    background: active ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.03)',
                    color: '#f1f5f9', cursor: 'pointer', textAlign: 'left',
                    fontFamily: 'inherit', display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', transition: 'all 0.15s',
                  }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1rem' }}>{opt.label}</div>
                      <div style={{ color: '#64748b', fontSize: '0.78rem', marginTop: 2 }}>{opt.sub}</div>
                    </div>
                    {active && <CheckCircle size={20} color="#3b82f6" />}
                  </button>
                )
              })}

              <div>
                <label style={{ color: '#475569', fontSize: '0.78rem', display: 'block', marginBottom: '0.35rem' }}>
                  Otra fecha
                </label>
                <input type="date" value={customDate}
                  onChange={e => setCustomDate(e.target.value)}
                  min="2026-01-01" max="2027-12-31"
                  style={{
                    padding: '0.6rem 0.85rem', borderRadius: 8, width: '100%',
                    background: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${customDate ? '#3b82f6' : 'rgba(255,255,255,0.1)'}`,
                    color: '#f1f5f9', fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none',
                  }}
                />
              </div>
            </div>

            <div style={{ color: '#475569', fontSize: '0.8rem', marginBottom: '1.75rem' }}>
              {daysLeft > 0 ? `${daysLeft} días hasta el examen` : 'Selecciona una fecha válida'}
            </div>

            <button onClick={() => setStep(2)} disabled={daysLeft <= 0} style={{
              width: '100%', padding: '0.9rem', borderRadius: 10, border: 'none',
              background: 'linear-gradient(90deg, #2563eb, #7c3aed)',
              color: '#fff', fontWeight: 700, fontSize: '1rem',
              cursor: daysLeft > 0 ? 'pointer' : 'not-allowed',
              fontFamily: 'inherit', opacity: daysLeft > 0 ? 1 : 0.45,
            }}>Siguiente →</button>
          </div>
        )}

        {/* ── Step 2: Study hours ── */}
        {step === 2 && (
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '0.35rem' }}>
              ¿Cuánto puedes estudiar al día?
            </div>
            <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '2rem' }}>
              Incluye videos + flashcards + preguntas. Sé realista — es mejor poco constante que mucho esporádico.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem', marginBottom: '1.5rem' }}>
              {[
                { label: 'Lunes a Viernes', val: weekdayH, set: setWeekdayH, opts: [[1,'1h'],[1.5,'1.5h'],[2,'2h'],[3,'3h'],[4,'4h']] },
                { label: 'Sábados',          val: satH,     set: setSatH,     opts: [[0,'Libre'],[1,'1h'],[1.5,'1.5h'],[2,'2h'],[3,'3h']] },
                { label: 'Domingos',         val: sunH,     set: setSunH,     opts: [[0,'Libre'],[0.5,'30min'],[1,'1h'],[1.5,'1.5h']] },
              ].map(row => (
                <div key={row.label}>
                  <div style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.5rem' }}>{row.label}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {row.opts.map(([v, lbl]) => (
                      <OptBtn key={v} val={v} cur={row.val} set={row.set} label={lbl} />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Coverage estimate */}
            <div style={{
              padding: '0.85rem 1rem', borderRadius: 10, marginBottom: '1.75rem',
              background: fits ? 'rgba(16,185,129,0.07)' : 'rgba(245,158,11,0.07)',
              border: `1px solid ${fits ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.25)'}`,
              fontSize: '0.82rem',
            }}>
              <div style={{ color: fits ? '#6ee7b7' : '#fcd34d', fontWeight: 700, marginBottom: 3 }}>
                {fits ? '✓ Tiempo suficiente' : '⚠ Tiempo ajustado'}
              </div>
              <div style={{ color: '#94a3b8', lineHeight: 1.55 }}>
                {avgDailyH === 0
                  ? 'Selecciona al menos un día de estudio.'
                  : fits
                    ? `Con este horario cubrirás todos los videos en ~${daysNeeded} días. Te quedan ${daysLeft - daysNeeded} días para repasos.`
                    : `Necesitas ~${daysNeeded} días pero solo tienes ${daysLeft}. Aumenta las horas o marca especialidades ya estudiadas en el paso siguiente.`
                }
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => setStep(1)} style={{
                flex: 1, padding: '0.75rem', borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontFamily: 'inherit',
              }}>← Atrás</button>
              <button onClick={() => setStep(3)} style={{
                flex: 2, padding: '0.75rem', borderRadius: 10, border: 'none',
                background: 'linear-gradient(90deg, #2563eb, #7c3aed)',
                color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              }}>Siguiente →</button>
            </div>
          </div>
        )}

        {/* ── Step 3: Completed subjects ── */}
        {step === 3 && (
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '0.35rem' }}>
              ¿Ya dominás alguna especialidad?
            </div>
            <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
              Márcalas para excluirlas del plan. El orden sigue el rendimiento (preguntas por hora).
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.6rem' }}>
              <button onClick={() => setCompleted([])} style={{
                background: 'none', border: 'none', color: '#475569',
                cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'inherit',
              }}>Deseleccionar todo</button>
            </div>

            {[1, 2, 3].map(ph => {
              const meta = PHASE_META[ph]
              const group = SUBJECTS.filter(s => s.phase === ph)
              return (
                <div key={ph} style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.45rem' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: meta.color }} />
                    <span style={{ color: meta.text, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {meta.label} — {meta.sublabel}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    {group.map(s => {
                      const done = completed.includes(s.id)
                      return (
                        <div key={s.id} onClick={() => toggle(s.id)} style={{
                          display: 'flex', alignItems: 'center', gap: '0.65rem',
                          padding: '0.55rem 0.8rem', borderRadius: 9, cursor: 'pointer',
                          background: done ? `${meta.dim}99` : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${done ? meta.color + '44' : 'rgba(255,255,255,0.06)'}`,
                          transition: 'all 0.12s',
                        }}>
                          <div style={{
                            width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                            border: `2px solid ${done ? meta.color : '#334155'}`,
                            background: done ? meta.color : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.12s',
                          }}>
                            {done && <Check size={11} color="#fff" strokeWidth={3} />}
                          </div>
                          <span style={{ fontSize: '0.95rem' }}>{s.icon}</span>
                          <span style={{ flex: 1, color: done ? meta.text : '#cbd5e1', fontSize: '0.86rem', fontWeight: done ? 600 : 400 }}>
                            {s.name}
                          </span>
                          <span style={{ color: '#475569', fontSize: '0.72rem' }}>{s.total} clases</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => setStep(2)} style={{
                flex: 1, padding: '0.75rem', borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontFamily: 'inherit',
              }}>← Atrás</button>
              <button onClick={handleSave} disabled={saving} style={{
                flex: 2, padding: '0.75rem', borderRadius: 10, border: 'none',
                background: 'linear-gradient(90deg, #2563eb, #7c3aed)',
                color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                opacity: saving ? 0.7 : 1,
              }}>{saving ? 'Creando plan...' : '🚀 Crear mi plan'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── DAY DETAIL PANEL ─────────────────────────────────────────────────────────
function DayPanel({ ds, schedule, examDate, onClose, done, toggleVideo }) {
  const day = schedule[ds]
  if (!day) return null

  const isToday     = ds === toStr(new Date())
  const subjects    = [...new Set(day.videos.map(v => v.subjectName))]
  const phase       = day.videos[0]?.phase || null
  const meta        = phase ? PHASE_META[phase] : null
  const totalVideos = day.videos.length
  const doneVideos  = day.videos.filter(v => done[`${v.videoKey}_${v.videoNum}`]).length
  const pct         = totalVideos > 0 ? Math.round((doneVideos / totalVideos) * 100) : 0

  const subj        = SUBJECTS.find(x => x.id === day.videos[0]?.subjectId)
  const avgMins     = subj ? (subj.videoHours * 60) / subj.total : 12
  const videoMins   = Math.round(totalVideos * avgMins)
  const pruebaSlug  = subj?.pruebaSlug || null

  const daySchedule = [
    { time: '10:00',                            label: '🎬 Videos',         detail: `${totalVideos} video${totalVideos !== 1 ? 's' : ''} (~${videoMins} min)`, color: '#3b82f6', link: null },
    { time: addHHMM('10:00', videoMins),        label: '✍️ Flashcards',     detail: 'Escribir fichas de los videos', color: '#a855f7', link: null },
    { time: addHHMM('10:00', videoMins + 30),   label: '❓ Preguntas app',  detail: 'Prueba generada por IA (~40 preguntas)', color: '#f59e0b', link: '/test' },
    { time: addHHMM('10:00', videoMins + 75),   label: '📋 Prueba EUNACOM', detail: `Preguntas reales de ${subj?.name || 'la especialidad'}`, color: '#ec4899', link: pruebaSlug ? `/pruebas/${pruebaSlug}` : '/test' },
    { time: addHHMM('10:00', videoMins + 120),  label: '🃏 Repaso FC',      detail: 'Revisar flashcards del día', color: '#10b981', link: null },
  ]

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', pointerEvents: 'none' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', pointerEvents: 'all' }} />
      <div style={{
        position: 'relative', pointerEvents: 'all', width: 'min(480px, 95vw)', height: '100vh',
        background: '#111827', borderLeft: '1px solid rgba(255,255,255,0.08)',
        overflowY: 'auto', display: 'flex', flexDirection: 'column',
        animation: 'slideInRight 0.22s ease-out',
      }}>
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.07)', position: 'sticky', top: 0, background: '#111827', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <div>
              <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1.05rem', textTransform: 'capitalize' }}>{fmtFull(ds)}</div>
              {isToday && <span style={{ fontSize: '0.7rem', background: '#3b82f6', color: '#fff', padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>HOY</span>}
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.07)', border: 'none', color: '#94a3b8', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={16} />
            </button>
          </div>
          {meta && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: meta.dim, border: `1px solid ${meta.color}33`, borderRadius: 99, padding: '3px 10px', fontSize: '0.72rem', color: meta.text, fontWeight: 600 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: meta.color }} />
              {meta.label} · {meta.sublabel}
            </div>
          )}
        </div>

        {/* Special day types */}
        {day.type === 'exam_day' && (
          <div style={{ margin: '1.5rem', padding: '1.5rem', background: 'linear-gradient(135deg,#78350f,#92400e)', borderRadius: 12, textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem' }}>🏆</div>
            <div style={{ color: '#fcd34d', fontWeight: 800, fontSize: '1.2rem', marginTop: 8 }}>DÍA DEL EXAMEN</div>
            <div style={{ color: '#fde68a', fontSize: '0.85rem', marginTop: 4 }}>EUNACOM — {new Date(examDate + 'T12:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
          </div>
        )}

        {(day.type === 'exam' || day.type === 'exam_review') && (
          <div style={{ margin: '1.5rem', padding: '1.5rem', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 12 }}>
            <div style={{ color: '#a5b4fc', fontWeight: 700, fontSize: '1rem', marginBottom: 8 }}>
              {isSat(ds) ? '📝 Simulacro Completo (Sábado)' : '📊 Revisión Simulacro (Domingo)'}
            </div>
            <ul style={{ color: '#c7d2fe', fontSize: '0.85rem', margin: 0, paddingLeft: '1.2rem', lineHeight: 1.8 }}>
              {isSat(ds) ? (
                <><li>10:00 — Simulacro 180 preguntas (cronometrado)</li><li>13:30 — Almuerzo</li><li>14:30 — Revisar preguntas incorrectas</li><li>16:00 — Libre</li></>
              ) : (
                <><li>10:00 — Revisar errores del simulacro</li><li>11:30 — Reconstrucciones (app)</li><li>13:00 — Repaso flashcards semanales</li><li>14:00 — Libre</li></>
              )}
            </ul>
          </div>
        )}

        {day.type === 'rest' && (
          <div style={{ margin: '1.5rem', padding: '1.5rem', background: 'rgba(100,116,139,0.08)', border: '1px solid rgba(100,116,139,0.2)', borderRadius: 12, textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>😴</div>
            <div style={{ color: '#94a3b8', fontWeight: 700 }}>Día de descanso</div>
            <div style={{ color: '#475569', fontSize: '0.82rem', marginTop: 4 }}>Recuperá energía. La consistencia es más importante que la intensidad.</div>
          </div>
        )}

        {day.type === 'review' && (
          <div style={{ margin: '1.5rem', padding: '1.5rem', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 12 }}>
            <div style={{ color: '#6ee7b7', fontWeight: 700, fontSize: '1rem', marginBottom: 8 }}>🔁 Semana de Repaso Final</div>
            <ul style={{ color: '#a7f3d0', fontSize: '0.85rem', margin: 0, paddingLeft: '1.2rem', lineHeight: 1.8 }}>
              <li>10:00 — Repaso flashcards por tema</li>
              <li>11:30 — Reconstrucciones (app)</li>
              <li>13:00 — Preguntas tema débil</li>
              <li>14:30 — Libre</li>
            </ul>
          </div>
        )}

        {day.type === 'questions' && (
          <div style={{ margin: '1.5rem', padding: '1.25rem', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 12 }}>
            <div style={{ color: '#fcd34d', fontWeight: 700, fontSize: '0.95rem', marginBottom: 8 }}>❓ Día de Preguntas</div>
            <ul style={{ color: '#fde68a', fontSize: '0.84rem', margin: 0, paddingLeft: '1.2rem', lineHeight: 1.8 }}>
              <li>10:00 — 50 preguntas (app) — tema más débil</li>
              <li>11:15 — Repaso flashcards</li>
              <li>12:00 — Reconstrucciones</li>
              <li>13:00 — Libre</li>
            </ul>
          </div>
        )}

        {/* Weekend study label */}
        {(day.type === 'study_sat' || day.type === 'study_sun') && day.videos.length > 0 && (
          <div style={{ margin: '1.5rem 1.5rem 0', padding: '0.85rem 1.1rem', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.22)', borderRadius: 10 }}>
            <div style={{ color: '#a5b4fc', fontWeight: 700, fontSize: '0.88rem' }}>
              {day.type === 'study_sat' ? '📝 Tarde: Simulacro cronometrado' : '📊 Tarde: Revisión + Flashcards'}
            </div>
          </div>
        )}

        {/* Study day: schedule + video list */}
        {['study', 'study_sat', 'study_sun'].includes(day.type) && day.videos.length > 0 && (
          <div style={{ padding: '0 1.5rem 1.5rem' }}>
            {/* Progress bar */}
            <div style={{ marginTop: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94a3b8', marginBottom: 6 }}>
                <span>Progreso del día</span>
                <span style={{ color: pct === 100 ? '#10b981' : '#f1f5f9', fontWeight: 600 }}>{doneVideos}/{totalVideos} videos · {pct}%</span>
              </div>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#10b981' : '#3b82f6', borderRadius: 99, transition: 'width 0.4s ease' }} />
              </div>
            </div>

            {/* Time schedule */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Horario sugerido</div>
              {daySchedule.map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 8, alignItems: 'flex-start' }}>
                  <div style={{ color: '#475569', fontSize: '0.78rem', width: 42, flexShrink: 0, paddingTop: 2, fontFamily: 'monospace' }}>{s.time}</div>
                  <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', borderLeft: `2px solid ${s.color}55`, borderRadius: '0 6px 6px 0', padding: '6px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <div>
                      <div style={{ color: '#e2e8f0', fontSize: '0.85rem', fontWeight: 600 }}>{s.label}</div>
                      <div style={{ color: '#64748b', fontSize: '0.76rem' }}>{s.detail}</div>
                    </div>
                    {s.link && (
                      <a href={s.link} style={{ flexShrink: 0, fontSize: '0.7rem', color: s.color, background: `${s.color}15`, border: `1px solid ${s.color}40`, borderRadius: 6, padding: '3px 8px', textDecoration: 'none', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        Ir →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Video list */}
            <div style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
              Videos del día
            </div>
            {day.videos.map((v, i) => {
              const key    = `${v.videoKey}_${v.videoNum}`
              const isDone = done[key]
              const url    = getVideoUrl(v.videoKey, v.videoNum)
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                  background: isDone ? 'rgba(16,185,129,0.07)' : 'rgba(255,255,255,0.03)',
                  borderRadius: 10, marginBottom: 6,
                  border: `1px solid ${isDone ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.05)'}`,
                  transition: 'all 0.15s',
                }}>
                  <button onClick={() => toggleVideo(key)} style={{
                    width: 22, height: 22, borderRadius: 6,
                    border: `2px solid ${isDone ? '#10b981' : '#334155'}`,
                    background: isDone ? '#10b981' : 'transparent', flexShrink: 0, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
                  }}>
                    {isDone && <Check size={13} color="#fff" strokeWidth={3} />}
                  </button>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ color: '#475569', fontSize: '0.7rem', fontFamily: 'monospace' }}>#{v.videoNum}</span>
                      <span style={{ color: isDone ? '#6ee7b7' : '#e2e8f0', fontSize: '0.84rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {v.title}
                      </span>
                    </div>
                    <div style={{ color: '#475569', fontSize: '0.7rem', marginTop: 2 }}>{v.subjectName}</div>
                  </div>
                  {url && (
                    <a href={url} target="_blank" rel="noopener noreferrer"
                      style={{ flexShrink: 0, width: 30, height: 30, borderRadius: 8, background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
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

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function FelipeCalendar() {
  const { user } = useAuth()
  const [settingsLoading, setSettingsLoading] = useState(true)
  const [settings, setSettings]       = useState(null)
  const [showSetup, setShowSetup]     = useState(false)
  const [showPhaseInfo, setShowPhaseInfo] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDay, setSelectedDay]   = useState(null)
  const [done, setDone] = useState({})

  // Load settings from DB — auto-seed Dr. Yáñez's known plan if missing
  useEffect(() => {
    if (!user) return
    fetchStudyPlanSettings(user.id).then(async data => {
      if ((!data || !data.plan_start) && user.email === 'dr.felipeyanez@gmail.com') {
        await saveStudyPlanSettings({
          userId: user.id,
          examDate: '2026-07-08',
          weekdayMinutes: 120,
          saturdayMinutes: 90,
          sundayMinutes: 60,
          completedSubjects: ['pediatria', 'endocrinologia'],
          planStart: '2026-04-29',
        })
        data = await fetchStudyPlanSettings(user.id)
      }
      setSettings(data)
      if (!data || !data.plan_start) setShowSetup(true)
      setSettingsLoading(false)
    }).catch(() => {
      if (user.email !== 'dr.felipeyanez@gmail.com') setShowSetup(true)
      setSettingsLoading(false)
    })
  }, [user])

  // Load video completions from localStorage (migrate from old fc_v1 key)
  useEffect(() => {
    if (!user) return
    const key = `fc_${user.id}`
    try {
      let raw = localStorage.getItem(key)
      if (!raw) {
        const old = localStorage.getItem('fc_v1')
        if (old) { localStorage.setItem(key, old); localStorage.removeItem('fc_v1'); raw = old }
      }
      if (raw) setDone(JSON.parse(raw))
    } catch {}
  }, [user])

  const toggleVideo = useCallback((key) => {
    setDone(prev => {
      const next = { ...prev, [key]: !prev[key] }
      if (!next[key]) delete next[key]
      if (user) localStorage.setItem(`fc_${user.id}`, JSON.stringify(next))
      return next
    })
  }, [user])

  const handleSaveSetup = useCallback(async (setupData) => {
    await saveStudyPlanSettings({ userId: user.id, ...setupData })
    const saved = await fetchStudyPlanSettings(user.id)
    setSettings(saved)
    setShowSetup(false)
  }, [user])

  // Build schedule from settings
  const schedule = useMemo(() => {
    if (!settings?.plan_start || !settings?.exam_date) return {}
    const planStart  = settings.plan_start
    const examDate   = settings.exam_date
    const wMins      = settings.weekday_minutes  ?? 120
    const sMins      = settings.saturday_minutes ?? 90
    const suMins     = settings.sunday_minutes   ?? 60
    const completed  = (() => { try { return JSON.parse(settings.completed_subjects || '[]') } catch { return [] } })()
    const dayCapFn   = ds => {
      const wd = dayOfWeek(ds)
      if (wd === 6) return sMins
      if (wd === 0) return suMins
      return wMins
    }
    return buildSchedule(completed, planStart, examDate, dayCapFn)
  }, [settings])

  // Calendar grid
  const calendarDays = useMemo(() => {
    const y = currentMonth.getFullYear()
    const m = currentMonth.getMonth()
    const firstDay    = new Date(y, m, 1)
    const lastDay     = new Date(y, m + 1, 0)
    const startOffset = (firstDay.getDay() + 6) % 7
    const days = []
    for (let i = 0; i < startOffset; i++) days.push(null)
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(`${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`)
    }
    return days
  }, [currentMonth])

  // Stats
  const stats = useMemo(() => {
    if (!settings?.exam_date) return { daysLeft: 0, pct: 0, doneCount: 0, totalVideos: 0, weekPct: 0 }
    const today     = toStr(new Date())
    const daysLeft  = Math.max(0, diffDays(today, settings.exam_date))
    const completed = (() => { try { return JSON.parse(settings.completed_subjects || '[]') } catch { return [] } })()
    const totalVideos  = SUBJECTS.reduce((s, subj) => s + subj.total, 0)
    const alreadyDone  = SUBJECTS.filter(s => completed.includes(s.id)).reduce((s, subj) => s + subj.total, 0)
    const allVids      = Object.values(schedule).flatMap(d => d.videos)
    const scheduleDone = allVids.filter(v => done[`${v.videoKey}_${v.videoNum}`]).length
    const doneCount    = alreadyDone + scheduleDone
    const pct          = totalVideos > 0 ? Math.round((doneCount / totalVideos) * 100) : 0
    const weekStart    = new Date()
    weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7))
    let weekTotal = 0, weekDone = 0
    for (let i = 0; i < 7; i++) {
      const ds = toStr(addDays(weekStart, i))
      const day = schedule[ds]
      if (!day) continue
      weekTotal += day.videos.length
      weekDone  += day.videos.filter(v => done[`${v.videoKey}_${v.videoNum}`]).length
    }
    return { daysLeft, pct, doneCount, totalVideos, weekPct: weekTotal > 0 ? Math.round((weekDone / weekTotal) * 100) : 0 }
  }, [done, schedule, settings])

  function dayCellStyle(ds) {
    const day  = schedule[ds]
    if (!ds || !day) return {}
    const isToday = ds === toStr(new Date())
    const isPast  = ds < toStr(new Date())
    const type    = day.type
    const phase   = day.videos[0]?.phase
    const meta    = phase ? PHASE_META[phase] : null
    const bg =
      type === 'exam_day'   ? 'rgba(120,53,15,0.5)'  :
      type === 'exam'        ? 'rgba(67,56,202,0.15)'  :
      type === 'exam_review' ? 'rgba(67,56,202,0.08)'  :
      type === 'review'      ? 'rgba(16,185,129,0.08)' :
      type === 'rest'        ? 'rgba(100,116,139,0.05)':
      type === 'questions'   ? 'rgba(245,158,11,0.06)' :
      meta                   ? `${meta.dim}55`          : 'transparent'
    return {
      background: bg,
      borderColor: isToday ? '#3b82f6' : type === 'exam_day' ? '#f59e0b' : meta ? `${meta.color}30` : 'rgba(255,255,255,0.05)',
      opacity: isPast ? 0.6 : 1,
    }
  }

  function dayLabel(ds) {
    const day = schedule[ds]
    if (!day) return null
    const t = day.type
    if (t === 'exam_day')    return { icon: '🏆', text: 'EXAMEN' }
    if (t === 'exam')        return { icon: '📝', text: 'Simulacro' }
    if (t === 'exam_review') return { icon: '📊', text: 'Revisión' }
    if (t === 'review')      return { icon: '🔁', text: 'Repaso' }
    if (t === 'rest')        return { icon: '😴', text: 'Libre' }
    if (t === 'questions')   return { icon: '❓', text: 'Preguntas' }
    if (day.subjects.length) {
      const subj = SUBJECTS.find(s => s.name === day.subjects[0])
      const suffix = t === 'study_sat' ? ' + Simul.' : t === 'study_sun' ? ' + Repaso' : ''
      return { icon: subj?.icon || '📚', text: day.subjects[0] + suffix }
    }
    return null
  }

  if (settingsLoading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.9rem' }}>
        Cargando tu plan...
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e', color: '#f1f5f9', fontFamily: 'Inter, sans-serif', padding: '1.5rem' }}>
      <style>{`
        @keyframes slideInRight { from { transform: translateX(100%) } to { transform: translateX(0) } }
        .day-cell:hover { border-color: rgba(59,130,246,0.5) !important; background: rgba(59,130,246,0.07) !important; transform: scale(1.01); cursor: pointer; }
        .day-cell { transition: all 0.12s ease; }
      `}</style>

      {showSetup && <SetupModal onSave={handleSaveSetup} initial={settings} />}

      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, background: 'linear-gradient(90deg,#60a5fa,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Mi Plan de Estudio EUNACOM
            </h1>
            <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: 4 }}>
              {settings?.exam_date
                ? `Examen: ${new Date(settings.exam_date + 'T12:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })} · Ordenado por rendimiento (preguntas/hora)`
                : 'Configura tu plan para comenzar'}
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
            <StatPill icon={<Flame size={15} />}  label="Días restantes" value={stats.daysLeft}                   color="#f59e0b" />
            <StatPill icon={<Target size={15} />} label="Videos"         value={`${stats.doneCount}/${stats.totalVideos}`} color="#3b82f6" />
            <StatPill icon={<Trophy size={15} />} label="Progreso"       value={`${stats.pct}%`}                  color="#10b981" />
            <StatPill icon={<Zap size={15} />}    label="Esta semana"    value={`${stats.weekPct}%`}              color="#a855f7" />
            <button onClick={() => setShowSetup(true)} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '0.45rem 0.9rem',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8, color: '#94a3b8', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'inherit',
            }}>
              <Settings size={14} /> Modificar plan
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: '1.25rem', background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '1rem 1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b', marginBottom: 8 }}>
            <span style={{ color: '#f1f5f9', fontWeight: 600 }}>Progreso general</span>
            <span>{stats.pct}% completado</span>
          </div>
          <div style={{ height: 8, background: 'rgba(255,255,255,0.07)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${stats.pct}%`, background: 'linear-gradient(90deg,#3b82f6,#a855f7)', borderRadius: 99, transition: 'width 0.6s ease' }} />
          </div>
          {/* Phase legend */}
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: 10, flexWrap: 'wrap' }}>
            {Object.entries(PHASE_META).map(([p, m]) => (
              <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: m.text }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: m.color }} />
                {m.label} — {m.sublabel}
              </div>
            ))}
          </div>
        </div>

        {/* Phase explainer (collapsible) */}
        <div style={{ marginBottom: '1.25rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}>
          <button onClick={() => setShowPhaseInfo(v => !v)} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '0.75rem 1.1rem',
            background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontFamily: 'inherit',
            fontSize: '0.8rem', fontWeight: 600, textAlign: 'left',
          }}>
            <Info size={14} />
            ¿Por qué este orden de estudio?
            <span style={{ marginLeft: 'auto' }}>{showPhaseInfo ? '▲' : '▼'}</span>
          </button>
          {showPhaseInfo && (
            <div style={{ padding: '0 1.1rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {Object.entries(PHASE_META).map(([p, m]) => (
                <div key={p} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: m.color, flexShrink: 0, marginTop: 4 }} />
                  <div>
                    <span style={{ color: m.text, fontWeight: 700, fontSize: '0.83rem' }}>{m.label} — {m.sublabel}: </span>
                    <span style={{ color: '#94a3b8', fontSize: '0.83rem' }}>{m.desc}</span>
                  </div>
                </div>
              ))}
              <div style={{ color: '#475569', fontSize: '0.78rem', marginTop: '0.25rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                El plan asigna más videos por día a especialidades con videos cortos, y menos a las de videos largos, para mantener el tiempo diario constante.
              </div>
            </div>
          )}
        </div>

        {/* Calendar */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden' }}>
          {/* Month nav */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <button onClick={() => setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))} style={navBtn}>
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#f1f5f9', textTransform: 'capitalize' }}>{fmtMonth(currentMonth)}</span>
            <button onClick={() => setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))} style={navBtn}>
              <ChevronRight size={16} />
            </button>
          </div>
          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map(d => (
              <div key={d} style={{ textAlign: 'center', padding: '0.6rem 0', fontSize: '0.72rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{d}</div>
            ))}
          </div>
          {/* Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)' }}>
            {calendarDays.map((ds, i) => {
              if (!ds) return <div key={`e-${i}`} style={{ minHeight: 110, border: '1px solid rgba(255,255,255,0.04)' }} />
              const cs     = dayCellStyle(ds)
              const lbl    = dayLabel(ds)
              const day    = schedule[ds]
              const isToday = ds === toStr(new Date())
              const phase  = day?.videos[0]?.phase
              const meta   = phase ? PHASE_META[phase] : null
              const dayNum = parseInt(ds.split('-')[2])
              const totalV = day?.videos?.length || 0
              const doneV  = day?.videos?.filter(v => done[`${v.videoKey}_${v.videoNum}`]).length || 0
              return (
                <div key={ds} className="day-cell" onClick={() => setSelectedDay(ds)}
                  style={{
                    minHeight: 110, padding: '0.5rem',
                    border: `1px solid ${cs.borderColor || 'rgba(255,255,255,0.04)'}`,
                    background: cs.background, opacity: cs.opacity,
                    boxShadow: isToday ? '0 0 0 2px #3b82f6 inset' : 'none',
                    display: 'flex', flexDirection: 'column', gap: 4,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: isToday ? 700 : 400, color: isToday ? '#60a5fa' : '#94a3b8' }}>{dayNum}</span>
                    {meta && <div style={{ width: 7, height: 7, borderRadius: '50%', background: meta.color }} />}
                  </div>
                  {lbl && (
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.8rem' }}>{lbl.icon}</div>
                      <div style={{ fontSize: '0.68rem', color: meta ? meta.text : '#94a3b8', lineHeight: 1.3, marginTop: 2, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {lbl.text}
                      </div>
                    </div>
                  )}
                  {totalV > 0 && (
                    <div style={{ marginTop: 'auto' }}>
                      <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.round((doneV / totalV) * 100)}%`, background: doneV === totalV ? '#10b981' : meta?.color || '#3b82f6', borderRadius: 99 }} />
                      </div>
                      <div style={{ fontSize: '0.62rem', color: '#475569', marginTop: 2 }}>{doneV}/{totalV} videos</div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {selectedDay && (
        <DayPanel
          ds={selectedDay}
          schedule={schedule}
          examDate={settings?.exam_date || '2026-07-08'}
          onClose={() => setSelectedDay(null)}
          done={done}
          toggleVideo={toggleVideo}
        />
      )}
    </div>
  )
}

const StatPill = ({ icon, label, value, color }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '0.45rem 0.85rem' }}>
    <span style={{ color }}>{icon}</span>
    <div>
      <div style={{ fontSize: '0.65rem', color: '#475569', lineHeight: 1 }}>{label}</div>
      <div style={{ fontSize: '0.9rem', fontWeight: 700, color }}>{value}</div>
    </div>
  </div>
)

const navBtn = {
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
  color: '#94a3b8', borderRadius: 8, width: 34, height: 34, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}
