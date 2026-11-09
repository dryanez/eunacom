import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import videoIndex from '../lib/videoIndex.json'
import { fetchStudyPlanSettings, saveStudyPlanSettings, fetchEunacomQuestions, createTest, genId } from '../lib/api'
import {
  ChevronLeft, ChevronRight, Play, Check, X,
  Target, Trophy, Flame, Zap, Settings, Info, CheckCircle,
  ChevronUp, ChevronDown, Rocket, AlertTriangle, Coffee, Video, PenLine, ClipboardList, Layers,
  FileText, BarChart3, RefreshCw, Moon, HelpCircle, BookOpen,
  Baby, Microscope, Syringe, Droplet, Brain, Droplets, BatteryCharging, Candy, Hospital, Dna,
  HeartPulse, Heart, Soup, Stethoscope, Bone, Bean, Wind, Eye, Hand, Ear, Bug,
} from 'lucide-react'
import '../components/redesign/clase.css'
import '../components/redesign/misc-pages.css'

// ─── SUBJECTS (sorted by examQs/videoHours ratio, high → low within each phase) ─
const SUBJECTS = [
  // Phase 1 — highest yield
  { id:'pediatria',      name:'Pediatría',              phase:1, icon:Baby, examQs:29, videoKey:'Pediatría',              total:18, videoHours:5.75,  pruebaSlug:'modulo-3-pediatria' },
  { id:'ginecologia',    name:'Ginecología',            phase:1, icon:Microscope, examQs:15, videoKey:'Ginecología',            total:20, videoHours:4.64,  pruebaSlug:'modulo-3-ginecologia' },
  { id:'cirugia',        name:'Cirugía y Anestesia',    phase:1, icon:Syringe, examQs:10, videoKey:'Cirugia General',        total:13, videoHours:4.02,  pruebaSlug:'modulo-2-cirugia-y-anestesia' },
  { id:'hematologia',    name:'Hematología',            phase:1, icon:Droplet, examQs:5,  videoKey:'Hematología',            total:18, videoHours:2.04,  pruebaSlug:'modulo-1-hematologia' },
  { id:'neuro_geri',     name:'Neurología + Geriatría', phase:1, icon:Brain, examQs:9,  videoKey:'Neurología y Geriatría', total:11, videoHours:3.98,  pruebaSlug:'modulo-1-neurologia' },
  { id:'urologia',       name:'Urología',               phase:1, icon:Droplets, examQs:5,  videoKey:'Urología',               total:15, videoHours:2.28,  pruebaSlug:'modulo-2-urologia' },
  { id:'endocrinologia', name:'Endocrinología',         phase:1, icon:BatteryCharging, examQs:4,  videoKey:'Endocrinología',         total:16, videoHours:2.47,  pruebaSlug:'modulo-1-endocrinologia' },
  { id:'diabetes',       name:'Diabetes',               phase:1, icon:Candy, examQs:6,  videoKey:'Diabetes',               total:24, videoHours:4.71,  pruebaSlug:'modulo-1-endocrinologia' },
  // Phase 2 — medium yield
  { id:'salud_pub',      name:'Salud Pública',          phase:2, icon:Hospital, examQs:9,  videoKey:'Salud Pública',          total:15, videoHours:5.14,  pruebaSlug:'modulo-2-salud-publica' },
  { id:'psiquiatria',    name:'Psiquiatría',            phase:2, icon:Dna, examQs:14, videoKey:'Psiquiatría',            total:24, videoHours:9.10,  pruebaSlug:'modulo-2-psiquiatria' },
  { id:'obstetricia',    name:'Obstetricia',            phase:2, icon:HeartPulse, examQs:14, videoKey:'Obstetricia',            total:54, videoHours:9.42,  pruebaSlug:'modulo-3-obstetricia' },
  { id:'cardiologia',    name:'Cardiología',            phase:2, icon:Heart, examQs:10, videoKey:'Cardiología',            total:47, videoHours:7.11,  pruebaSlug:'modulo-1-cardiologia' },
  { id:'gastro',         name:'Gastroenterología',      phase:2, icon:Soup, examQs:10, videoKey:'Gastroenterología',      total:23, videoHours:7.42,  pruebaSlug:'modulo-1-gastroenterologia' },
  // Phase 3 — complete the curriculum
  { id:'dermato',        name:'Dermatología',           phase:3, icon:Stethoscope, examQs:4,  videoKey:'Dermatología',           total:24, videoHours:3.34,  pruebaSlug:'modulo-2-dermatologia' },
  { id:'tmt',            name:'Traumatología',          phase:3, icon:Bone, examQs:5,  videoKey:'Traumatología',          total:15, videoHours:4.22,  pruebaSlug:'modulo-2-traumatologia' },
  { id:'nefro',          name:'Nefrología',             phase:3, icon:Bean, examQs:5,  videoKey:'Nefrología',             total:26, videoHours:4.55,  pruebaSlug:'modulo-1-nefrologia' },
  { id:'respiratorio',   name:'Respiratorio',           phase:3, icon:Wind, examQs:10, videoKey:'Respiratorio',           total:66, videoHours:10.06, pruebaSlug:'modulo-1-respiratorio' },
  { id:'oftalmo',        name:'Oftalmología',           phase:3, icon:Eye, examQs:4,  videoKey:'Oftalmología',           total:24, videoHours:4.46,  pruebaSlug:'modulo-2-oftalmologia' },
  { id:'reumato',        name:'Reumatología',           phase:3, icon:Hand, examQs:4,  videoKey:'Reumatología',           total:36, videoHours:4.75,  pruebaSlug:'modulo-1-reumatologia' },
  { id:'orl',            name:'ORL',                    phase:3, icon:Ear, examQs:4,  videoKey:'Otorrinolaringología',   total:47, videoHours:7.33,  pruebaSlug:'modulo-2-otorrinolaringologia' },
  { id:'infecto',        name:'Infectología',           phase:3, icon:Bug, examQs:4,  videoKey:'Infectología',           total:24, videoHours:7.20,  pruebaSlug:'modulo-1-infectologia' },
]

const PHASE_META = {
  1: { label:'Fase 1', sublabel:'Mayor Rendimiento', color:'#10b981', dim:'#064e3b', text:'#6ee7b7', pct: 46,
       desc:'Especialidades con más preguntas EUNACOM por hora de video. Se estudian primero para maximizar los ciclos de repaso de flashcards.' },
  2: { label:'Fase 2', sublabel:'Rendimiento Medio',  color:'#3b82f6', dim:'#1e3a5f', text:'#93c5fd', pct: 32,
       desc:'Especialidades con alto peso en el examen pero mayor volumen de video. Se estudian después de cubrir los temas de mayor rendimiento.' },
  3: { label:'Fase 3', sublabel:'Completar Temario',  color:'#f59e0b', dim:'#451a03', text:'#fcd34d', pct: 22,
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
    <button onClick={() => set(val)} className={`mn-sp-pill${active ? ' on' : ''}`}>{label}</button>
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
    <div className="mn-sp-setup">
      {/* Step bar */}
      <div className="mn-sp-steps">
        {[1, 2, 3].map(n => <i key={n} className={n <= step ? 'on' : ''} />)}
      </div>

      <div className="mn-sp-setup-in" key={step}>

        {/* ── Step 1: Exam date ── */}
        {step === 1 && (
          <div>
            <div className="mn-cl-eyebrow">Paso 1 de 3</div>
            <h2>¿Cuándo rindes el EUNACOM?</h2>
            <p className="mn-sp-setup-p">El plan se adapta automáticamente al tiempo disponible.</p>

            <div className="mn-sp-opts">
              {[
                { date: '2026-07-08',  label: 'Julio 8, 2026',      sub: 'Próximo EUNACOM' },
                { date: '2026-12-16',  label: 'Diciembre 16, 2026', sub: 'Segunda fecha 2026' },
              ].map(opt => {
                const active = examDate === opt.date && !customDate
                return (
                  <button key={opt.date} onClick={() => { setExamDate(opt.date); setCustomDate('') }} className={`mn-sp-date${active ? ' on' : ''}`}>
                    <div>
                      <b>{opt.label}</b>
                      <small>{opt.sub}</small>
                    </div>
                    {active && <CheckCircle size={20} />}
                  </button>
                )
              })}

              <div className="mn-sp-field">
                <label>Otra fecha</label>
                <input type="date" value={customDate}
                  onChange={e => setCustomDate(e.target.value)}
                  min="2026-01-01" max="2027-12-31"
                  className={customDate ? 'on' : ''}
                />
              </div>
            </div>

            <div className="mn-sp-hint">
              {daysLeft > 0 ? `${daysLeft} días hasta el examen` : 'Selecciona una fecha válida'}
            </div>

            <div className="mn-sp-nav full">
              <button className="mn-cl-nb pri" onClick={() => setStep(2)} disabled={daysLeft <= 0}>
                Siguiente <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Study hours ── */}
        {step === 2 && (
          <div>
            <div className="mn-cl-eyebrow">Paso 2 de 3</div>
            <h2>¿Cuánto puedes estudiar al día?</h2>
            <p className="mn-sp-setup-p">
              Incluye videos + flashcards + preguntas. Sé realista: es mejor poco constante que mucho esporádico.
            </p>

            <div className="mn-sp-hours">
              {[
                { label: 'Lunes a Viernes', val: weekdayH, set: setWeekdayH, opts: [[1,'1h'],[1.5,'1.5h'],[2,'2h'],[3,'3h'],[4,'4h']] },
                { label: 'Sábados',          val: satH,     set: setSatH,     opts: [[0,'Libre'],[1,'1h'],[1.5,'1.5h'],[2,'2h'],[3,'3h']] },
                { label: 'Domingos',         val: sunH,     set: setSunH,     opts: [[0,'Libre'],[0.5,'30min'],[1,'1h'],[1.5,'1.5h']] },
              ].map(row => (
                <div key={row.label}>
                  <div className="mn-sp-hours-l">{row.label}</div>
                  <div className="mn-sp-pills">
                    {row.opts.map(([v, lbl]) => (
                      <OptBtn key={v} val={v} cur={row.val} set={row.set} label={lbl} />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Coverage estimate */}
            <div className={`mn-sp-fit ${fits ? 'ok' : 'warn'}`}>
              <div className="mn-sp-fit-h">
                {fits ? <><CheckCircle size={15} /> Tiempo suficiente</> : <><AlertTriangle size={15} /> Tiempo ajustado</>}
              </div>
              <p>
                {avgDailyH === 0
                  ? 'Selecciona al menos un día de estudio.'
                  : fits
                    ? `Con este horario cubrirás todos los videos en ~${daysNeeded} días. Te quedan ${daysLeft - daysNeeded} días para repasos.`
                    : `Necesitas ~${daysNeeded} días pero solo tienes ${daysLeft}. Aumenta las horas o marca especialidades ya estudiadas en el paso siguiente.`
                }
              </p>
            </div>

            <div className="mn-sp-nav">
              <button className="mn-cl-nb" onClick={() => setStep(1)}><ChevronLeft size={16} /> Atrás</button>
              <button className="mn-cl-nb pri" onClick={() => setStep(3)}>Siguiente <ChevronRight size={16} /></button>
            </div>
          </div>
        )}

        {/* ── Step 3: Completed subjects ── */}
        {step === 3 && (
          <div>
            <div className="mn-cl-eyebrow">Paso 3 de 3</div>
            <h2>¿Ya dominas alguna especialidad?</h2>
            <p className="mn-sp-setup-p" style={{ marginBottom: '1.1rem' }}>
              Márcalas para excluirlas del plan. El orden sigue el rendimiento (preguntas por hora).
            </p>

            <div className="mn-sp-clear">
              <button onClick={() => setCompleted([])}>Deseleccionar todo</button>
            </div>

            {[1, 2, 3].map(ph => {
              const meta = PHASE_META[ph]
              const group = SUBJECTS.filter(s => s.phase === ph)
              return (
                <div key={ph} className="mn-sp-ph">
                  <div className="mn-sp-ph-h" style={{ color: meta.text }}>
                    <span className="mn-sp-dot" style={{ background: meta.color }} />
                    {meta.label} · {meta.sublabel}
                  </div>
                  <div className="mn-sp-subjs">
                    {group.map(s => {
                      const done = completed.includes(s.id)
                      const SubjIcon = s.icon
                      return (
                        <button key={s.id} onClick={() => toggle(s.id)} className="mn-sp-subj" style={done ? {
                          background: `${meta.dim}99`, borderColor: `${meta.color}55`,
                        } : undefined}>
                          <span className="mn-sp-box2" style={done ? { borderColor: meta.color, background: meta.color } : undefined}>
                            {done && <Check size={11} color="#fff" strokeWidth={3} />}
                          </span>
                          <SubjIcon size={16} style={done ? { color: meta.text } : undefined} />
                          <span className="mn-sp-subj-n" style={done ? { color: meta.text, fontWeight: 600 } : undefined}>
                            {s.name}
                          </span>
                          <small>{s.total} clases</small>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            <div className="mn-sp-nav" style={{ marginTop: '1.5rem' }}>
              <button className="mn-cl-nb" onClick={() => setStep(2)}><ChevronLeft size={16} /> Atrás</button>
              <button className="mn-cl-nb pri" onClick={handleSave} disabled={saving}>
                {saving ? 'Creando plan...' : <><Rocket size={16} /> Crear mi plan</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── DAY DETAIL PANEL ─────────────────────────────────────────────────────────
function DayPanel({ ds, schedule, examDate, onClose, done, toggleVideo, userId }) {
  const navigate = useNavigate()
  const [creating45, setCreating45] = useState(false)
  const [creatingPrueba, setCreatingPrueba] = useState(false)

  const day         = schedule[ds]
  const phase       = day?.videos[0]?.phase || null
  const meta        = phase ? PHASE_META[phase] : null
  const totalVideos = day?.videos.length || 0
  const doneVideos  = day?.videos.filter(v => done[`${v.videoKey}_${v.videoNum}`]).length || 0
  const pct         = totalVideos > 0 ? Math.round((doneVideos / totalVideos) * 100) : 0
  const subj        = SUBJECTS.find(x => x.id === day?.videos[0]?.subjectId)
  const avgMins     = subj ? (subj.videoHours * 60) / subj.total : 12
  const videoMins   = Math.round(totalVideos * avgMins)
  const pruebaSlug  = subj?.pruebaSlug || null

  // Build horario with automatic pomodoro breaks every ~55 min of work
  const daySchedule = useMemo(() => {
    const items = []
    let t = '10:00'
    let sinceBreak = 0
    const addWork = (mins, item) => {
      items.push({ ...item, time: t })
      sinceBreak += mins
      t = addHHMM(t, mins)
      if (sinceBreak >= 55) {
        items.push({ time: t, label: 'Pomodoro', Icon: Coffee, detail: '5 min de descanso activo', color: '#ef4444', isBreak: true })
        t = addHHMM(t, 5)
        sinceBreak = 0
      }
    }
    addWork(videoMins, { label: 'Videos', Icon: Video, detail: `${totalVideos} video${totalVideos !== 1 ? 's' : ''} (~${videoMins} min)`, color: '#3b82f6' })
    addWork(30,  { label: 'Flashcards', Icon: PenLine, detail: 'Escribir fichas de los videos', color: '#a855f7' })
    addWork(45,  { label: 'Bloque de 45 preguntas random', Icon: Target, detail: 'Todos los tópicos — distribución proporcional EUNACOM', color: '#f59e0b', action: 'create45' })
    addWork(45,  { label: 'Prueba EUNACOM', Icon: ClipboardList, detail: `Preguntas reales de ${subj?.name || 'la especialidad'}`, color: '#ec4899', action: 'prueba' })
    addWork(30,  { label: 'Repaso FC', Icon: Layers, detail: 'Revisar flashcards del día', color: '#10b981' })
    return items
  }, [videoMins, totalVideos, subj])

  const handle45Questions = useCallback(async () => {
    if (creating45) return
    setCreating45(true)
    try {
      const results = await Promise.all(
        SUBJECTS.map(async s => {
          const n = Math.round(s.examQs / 180 * 45)
          if (n === 0) return []
          const qs = await fetchEunacomQuestions({ specialty: s.videoKey, limit: Math.min(n * 4, 100) })
          return [...qs].sort(() => Math.random() - 0.5).slice(0, n).map(q => ({
            id: q.id,
            question: q.pregunta,
            choices: q.opciones,
            correctAnswer: q.respuestaCorrecta,
            explanation: q.explicacion,
            specialty: q.specialty,
          }))
        })
      )
      const allQs = results.flat().sort(() => Math.random() - 0.5)
      if (allQs.length === 0) { alert('No hay preguntas disponibles aún.'); return }
      const testId = genId()
      await createTest({ id: testId, userId, mode: 'practice', totalQuestions: allQs.length, questions: allQs })
      navigate('/test-runner', { state: { testId, questions: allQs } })
    } catch (e) {
      console.error(e)
      alert('Error al crear el bloque de preguntas.')
    } finally {
      setCreating45(false)
    }
  }, [creating45, userId, navigate])

  const handlePrueba = useCallback(async () => {
    if (!pruebaSlug || creatingPrueba) return
    setCreatingPrueba(true)
    try {
      const resp = await fetch(`/data/pruebas/${pruebaSlug}.json`)
      if (!resp.ok) throw new Error('archivo no encontrado')
      const data = await resp.json()
      const pruebasList = data.pruebas || []
      if (pruebasList.length === 0) throw new Error('sin preguntas')
      const prueba = pruebasList[Math.floor(Math.random() * pruebasList.length)]
      const questions = (prueba.questions || []).map(q => ({
        id: q.codigoEunacom || `${pruebaSlug}_${q.numero}`,
        question: q.pregunta,
        choices: q.opciones,
        correctAnswer: q.respuestaCorrecta,
        explanation: q.explicacion,
      }))
      const testId = genId()
      await createTest({ id: testId, userId, mode: 'practice', totalQuestions: questions.length, questions })
      navigate('/test-runner', { state: { testId, questions } })
    } catch (e) {
      console.error(e)
      alert('Error al cargar la prueba EUNACOM.')
    } finally {
      setCreatingPrueba(false)
    }
  }, [pruebaSlug, creatingPrueba, userId, navigate])

  if (!day) return null

  const isToday = ds === toStr(new Date())

  return (
    <div className="mn-sp-panel-wrap">
      <div className="mn-sp-panel-bg" onClick={onClose} />
      <div className="mn-sp-panel">
        {/* Header */}
        <div className="mn-sp-panel-head">
          <div className="mn-sp-panel-head-row">
            <div>
              <div className="mn-sp-panel-date">{fmtFull(ds)}</div>
              {isToday && <span className="mn-sp-today">HOY</span>}
            </div>
            <button className="mn-mp-iconbtn" onClick={onClose} aria-label="Cerrar"><X size={16} /></button>
          </div>
          {meta && (
            <span className="mn-sp-phase" style={{ background: meta.dim, borderColor: `${meta.color}44`, color: meta.text }}>
              <span className="mn-sp-dot" style={{ width: 6, height: 6, background: meta.color }} />
              {meta.label} · {meta.sublabel}
            </span>
          )}
        </div>

        <div className="mn-sp-panel-body">
          {/* Special day types */}
          {day.type === 'exam_day' && (
            <div className="mn-sp-box gold center">
              <Trophy size={36} color="#fcd34d" />
              <div className="mn-sp-box-h" style={{ marginTop: '.5rem' }}>DÍA DEL EXAMEN</div>
              <p>EUNACOM · {new Date(examDate + 'T12:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          )}

          {(day.type === 'exam' || day.type === 'exam_review') && (
            <div className="mn-sp-box indigo">
              <div className="mn-sp-box-h">
                {isSat(ds) ? <><FileText size={17} /> Simulacro completo (sábado)</> : <><BarChart3 size={17} /> Revisión simulacro (domingo)</>}
              </div>
              <ul>
                {isSat(ds) ? (
                  <><li>10:00 · Simulacro 180 preguntas (cronometrado)</li><li>13:30 · Almuerzo</li><li>14:30 · Revisar preguntas incorrectas</li><li>16:00 · Libre</li></>
                ) : (
                  <><li>10:00 · Revisar errores del simulacro</li><li>11:30 · Reconstrucciones (app)</li><li>13:00 · Repaso flashcards semanales</li><li>14:00 · Libre</li></>
                )}
              </ul>
            </div>
          )}

          {day.type === 'rest' && (
            <div className="mn-sp-box slate center">
              <Moon size={30} color="#94a3b8" />
              <div className="mn-sp-box-h" style={{ marginTop: '.5rem' }}>Día de descanso</div>
              <p>Recupera energía. La consistencia es más importante que la intensidad.</p>
            </div>
          )}

          {day.type === 'review' && (
            <div className="mn-sp-box green">
              <div className="mn-sp-box-h"><RefreshCw size={17} /> Semana de repaso final</div>
              <ul>
                <li>10:00 · Repaso flashcards por tema</li>
                <li>11:30 · Reconstrucciones (app)</li>
                <li>13:00 · Preguntas tema débil</li>
                <li>14:30 · Libre</li>
              </ul>
            </div>
          )}

          {day.type === 'questions' && (
            <div className="mn-sp-box amber">
              <div className="mn-sp-box-h"><HelpCircle size={17} /> Día de preguntas</div>
              <ul>
                <li>10:00 · 50 preguntas (app), tema más débil</li>
                <li>11:15 · Repaso flashcards</li>
                <li>12:00 · Reconstrucciones</li>
                <li>13:00 · Libre</li>
              </ul>
            </div>
          )}

          {/* Weekend study label */}
          {(day.type === 'study_sat' || day.type === 'study_sun') && day.videos.length > 0 && (
            <div className="mn-sp-box indigo slim">
              <div className="mn-sp-box-h">
                {day.type === 'study_sat' ? <><FileText size={16} /> Tarde: simulacro cronometrado</> : <><BarChart3 size={16} /> Tarde: revisión + flashcards</>}
              </div>
            </div>
          )}

          {/* Study day: schedule + video list */}
          {['study', 'study_sat', 'study_sun'].includes(day.type) && day.videos.length > 0 && (
            <div>
              {/* Progress bar */}
              <div style={{ marginTop: '1.25rem' }}>
                <div className="mn-sp-prog-top">
                  <span>Progreso del día</span>
                  <b style={{ color: pct === 100 ? '#34d399' : '#fff' }}>{doneVideos}/{totalVideos} videos · {pct}%</b>
                </div>
                <div className={`mn-sp-bar${pct === 100 ? ' ok' : ''}`}><i style={{ width: `${pct}%` }} /></div>
              </div>

              {/* Time schedule */}
              <div className="mn-sp-sec">Horario sugerido</div>
              {daySchedule.map((s, i) => {
                const SlotIcon = s.Icon
                return (
                  <div key={i} className="mn-sp-slot">
                    <div className="mn-sp-slot-time">{s.time}</div>
                    {s.isBreak ? (
                      <div className="mn-sp-slot-box brk">
                        <div className="mn-sp-slot-l">
                          {SlotIcon && <SlotIcon size={15} color="#fca5a5" />}
                          <div><b>{s.label}</b><small>{s.detail}</small></div>
                        </div>
                      </div>
                    ) : (
                      <div className="mn-sp-slot-box" style={{ borderLeftColor: `${s.color}aa` }}>
                        <div className="mn-sp-slot-l">
                          {SlotIcon && <SlotIcon size={15} color={s.color} />}
                          <div><b>{s.label}</b><small>{s.detail}</small></div>
                        </div>
                        {s.action === 'create45' && (
                          <button className="mn-sp-go" onClick={handle45Questions} disabled={creating45}>
                            {creating45 ? 'Creando…' : <>Ir <ChevronRight size={13} /></>}
                          </button>
                        )}
                        {s.action === 'prueba' && (
                          <button className="mn-sp-go" onClick={handlePrueba} disabled={creatingPrueba || !pruebaSlug}>
                            {creatingPrueba ? 'Cargando…' : <>Ir <ChevronRight size={13} /></>}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Video list */}
              <div className="mn-sp-sec">Videos del día</div>
              {day.videos.map((v, i) => {
                const key    = `${v.videoKey}_${v.videoNum}`
                const isDone = done[key]
                return (
                  <div key={i} className={`mn-sp-vid${isDone ? ' done' : ''}`}>
                    <button className="mn-sp-check" onClick={() => toggleVideo(key)} aria-label={isDone ? 'Marcar como no visto' : 'Marcar como visto'}>
                      {isDone && <Check size={13} color="#fff" strokeWidth={3} />}
                    </button>
                    <div className="mn-sp-vid-t">
                      <div>
                        <em>#{v.videoNum}</em>
                        <b>{v.title}</b>
                      </div>
                      <small>{v.subjectName}</small>
                    </div>
                    <button
                      className="mn-sp-play"
                      aria-label="Ver clase"
                      onClick={() => navigate('/mis-clases', { state: { openSubsystem: v.videoKey, openLesson: v.videoNum } })}>
                      <Play size={13} fill="#fff" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
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
      if ((!data || !data.plan_start) && user.email && btoa(user.email) === 'ZHIuZmVsaXBleWFuZXpAZ21haWwuY29t') {
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
      if (!(user.email && btoa(user.email) === 'ZHIuZmVsaXBleWFuZXpAZ21haWwuY29t')) setShowSetup(true)
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
      meta                   ? `${meta.dim}55`          : 'rgba(17,26,46,0.6)'
    return {
      background: bg,
      borderColor: isToday ? '#38bdf8' : type === 'exam_day' ? '#f59e0b' : meta ? `${meta.color}30` : 'rgba(30,42,68,0.6)',
      opacity: isPast ? 0.6 : 1,
    }
  }

  function dayLabel(ds) {
    const day = schedule[ds]
    if (!day) return null
    const t = day.type
    if (t === 'exam_day')    return { icon: Trophy, text: 'EXAMEN' }
    if (t === 'exam')        return { icon: FileText, text: 'Simulacro' }
    if (t === 'exam_review') return { icon: BarChart3, text: 'Revisión' }
    if (t === 'review')      return { icon: RefreshCw, text: 'Repaso' }
    if (t === 'rest')        return { icon: Moon, text: 'Libre' }
    if (t === 'questions')   return { icon: HelpCircle, text: 'Preguntas' }
    if (day.subjects.length) {
      const subj = SUBJECTS.find(s => s.name === day.subjects[0])
      const suffix = t === 'study_sat' ? ' + Simul.' : t === 'study_sun' ? ' + Repaso' : ''
      return { icon: subj?.icon || BookOpen, text: day.subjects[0] + suffix }
    }
    return null
  }

  if (settingsLoading) {
    return <div className="mn-sp-loading">Cargando tu plan...</div>
  }

  return (
    <div className="mn-sp">
      {showSetup && <SetupModal onSave={handleSaveSetup} initial={settings} />}

      {/* Header */}
      <header className="mn-cl-hero">
        <div className="mn-sp-hero-row">
          <div style={{ minWidth: 0 }}>
            <div className="mn-cl-eyebrow">Plan de estudio</div>
            <h1 className="mn-cl-title">Mi plan de estudio EUNACOM</h1>
            <p className="mn-sp-hero-sub">
              {settings?.exam_date
                ? `Examen: ${new Date(settings.exam_date + 'T12:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })} · Ordenado por rendimiento (preguntas/hora)`
                : 'Configura tu plan para comenzar'}
            </p>
          </div>
          <button className="mn-cl-nb" onClick={() => setShowSetup(true)}>
            <Settings size={15} /> Modificar plan
          </button>
        </div>
        <div className="mn-sp-stats">
          <StatPill icon={<Flame size={16} />}  label="Días restantes" value={stats.daysLeft}                   color="#f59e0b" />
          <StatPill icon={<Target size={16} />} label="Videos"         value={`${stats.doneCount}/${stats.totalVideos}`} color="#38bdf8" />
          <StatPill icon={<Trophy size={16} />} label="Progreso"       value={`${stats.pct}%`}                  color="#10b981" />
          <StatPill icon={<Zap size={16} />}    label="Esta semana"    value={`${stats.weekPct}%`}              color="#a78bfa" />
        </div>
      </header>

      {/* Progress bar */}
      <div className="mn-mp-card mn-sp-card">
        <div className="mn-sp-prog-top">
          <b>Progreso general</b>
          <span>{stats.pct}% completado</span>
        </div>
        <div className="mn-sp-bar"><i style={{ width: `${stats.pct}%` }} /></div>
        {/* Phase legend */}
        <div className="mn-sp-legend">
          {Object.entries(PHASE_META).map(([p, m]) => (
            <span key={p} style={{ color: m.text }}>
              <span className="mn-sp-dot" style={{ background: m.color }} />
              {m.label} · {m.sublabel}
              <small>({m.pct}% EUNACOM)</small>
            </span>
          ))}
        </div>
      </div>

      {/* Phase explainer (collapsible) */}
      <div className="mn-mp-card mn-sp-card mn-sp-info">
        <button className="mn-sp-info-btn" onClick={() => setShowPhaseInfo(v => !v)}>
          <Info size={15} />
          ¿Por qué este orden de estudio?
          {showPhaseInfo ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {showPhaseInfo && (
          <div className="mn-sp-info-body">
            {Object.entries(PHASE_META).map(([p, m]) => (
              <div key={p} className="row">
                <span className="mn-sp-dot" style={{ background: m.color }} />
                <div>
                  <span style={{ color: m.text, fontWeight: 700 }}>{m.label} · {m.sublabel}: </span>
                  <span>{m.desc}</span>
                </div>
              </div>
            ))}
            <div className="mn-sp-info-foot">
              El plan asigna más videos por día a especialidades con videos cortos, y menos a las de videos largos, para mantener el tiempo diario constante.
            </div>
          </div>
        )}
      </div>

      {/* Calendar */}
      <div className="mn-mp-card mn-sp-cal">
        {/* Month nav */}
        <div className="mn-sp-month">
          <button className="mn-mp-iconbtn" aria-label="Mes anterior" onClick={() => setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))}>
            <ChevronLeft size={16} />
          </button>
          <span>{fmtMonth(currentMonth)}</span>
          <button className="mn-mp-iconbtn" aria-label="Mes siguiente" onClick={() => setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))}>
            <ChevronRight size={16} />
          </button>
        </div>
        {/* Day headers */}
        <div className="mn-sp-wd">
          {['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map(d => <div key={d}>{d}</div>)}
        </div>
        {/* Grid */}
        <div className="mn-sp-grid">
          {calendarDays.map((ds, i) => {
            if (!ds) return <div key={`e-${i}`} className="mn-sp-cell empty" />
            const cs     = dayCellStyle(ds)
            const lbl    = dayLabel(ds)
            const day    = schedule[ds]
            const isToday = ds === toStr(new Date())
            const phase  = day?.videos[0]?.phase
            const meta   = phase ? PHASE_META[phase] : null
            const dayNum = parseInt(ds.split('-')[2])
            const totalV = day?.videos?.length || 0
            const doneV  = day?.videos?.filter(v => done[`${v.videoKey}_${v.videoNum}`]).length || 0
            const LblIcon = lbl?.icon
            return (
              <div key={ds} className={`mn-sp-cell day${isToday ? ' today' : ''}`} onClick={() => setSelectedDay(ds)}
                style={{
                  borderColor: cs.borderColor || undefined,
                  background: cs.background, opacity: cs.opacity,
                }}
              >
                <div className="mn-sp-cell-top">
                  <span className="mn-sp-cell-n">{dayNum}</span>
                  {meta && <span className="mn-sp-dot" style={{ width: 7, height: 7, background: meta.color }} />}
                </div>
                {lbl && (
                  <div className="mn-sp-cell-lbl">
                    {LblIcon && <LblIcon size={14} color={meta ? meta.text : '#94a3b8'} />}
                    <div className="mn-sp-cell-txt" style={{ color: meta ? meta.text : '#94a3b8' }}>
                      {lbl.text}
                    </div>
                  </div>
                )}
                {totalV > 0 && (
                  <div className="mn-sp-cell-prog">
                    <div className="mn-sp-bar">
                      <i style={{ width: `${Math.round((doneV / totalV) * 100)}%`, background: doneV === totalV ? '#10b981' : meta?.color || '#38bdf8', boxShadow: 'none' }} />
                    </div>
                    <small>{doneV}/{totalV} videos</small>
                  </div>
                )}
              </div>
            )
          })}
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
          userId={user?.id}
        />
      )}
    </div>
  )
}

const StatPill = ({ icon, label, value, color }) => (
  <div className="mn-sp-stat">
    <span className="mn-sp-stat-ic" style={{ color, background: `${color}1f` }}>{icon}</span>
    <div style={{ minWidth: 0 }}>
      <small>{label}</small>
      <b>{value}</b>
    </div>
  </div>
)
