import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { fetchProgress, fetchClaseProgress, fetchStudyPlanSettings, saveStudyPlanSettings, fetchUserProfile } from '../lib/api'
import {
  CalendarDays, ChevronLeft, ChevronRight, Settings, CheckCircle,
  Circle, BookOpen, FileText, Target, Flame, X, Save, RotateCcw, Zap, Clock, AlertTriangle
} from 'lucide-react'

// ─── CURRICULUM DATA ──────────────────────────────────────────────────────
// EUNACOM exam dates
const EXAM_DATES = { 'Julio': '2026-07-10', 'Diciembre': '2026-12-16' }

// All topics with their weight (approx EUNACOM %) and class+question counts
const CURRICULUM = [
  { module: 1, topic: 'Cardiología', slug: 'cardiologia', classes: 43, questions: 418, weight: 8 },
  { module: 1, topic: 'Endocrinología', slug: 'endocrinologia', classes: 30, questions: 529, weight: 7 },
  { module: 1, topic: 'Gastroenterología', slug: 'gastroenterologia', classes: 28, questions: 420, weight: 7 },
  { module: 1, topic: 'Hematología', slug: 'hematologia', classes: 20, questions: 389, weight: 5 },
  { module: 1, topic: 'Infectología', slug: 'infectologia', classes: 22, questions: 389, weight: 6 },
  { module: 1, topic: 'Nefrología', slug: 'nefrologia', classes: 18, questions: 341, weight: 5 },
  { module: 1, topic: 'Neurología', slug: 'neurologia', classes: 20, questions: 300, weight: 5 },
  { module: 1, topic: 'Respiratorio', slug: 'respiratorio', classes: 20, questions: 353, weight: 5 },
  { module: 1, topic: 'Reumatología', slug: 'reumatologia', classes: 16, questions: 302, weight: 4 },
  { module: 2, topic: 'Cirugía y Anestesia', slug: 'cirugia', classes: 25, questions: 330, weight: 6 },
  { module: 2, topic: 'Dermatología', slug: 'dermatologia', classes: 15, questions: 218, weight: 3 },
  { module: 2, topic: 'Oftalmología', slug: 'oftalmologia', classes: 14, questions: 239, weight: 3 },
  { module: 2, topic: 'Otorrinolaringología', slug: 'otorrino', classes: 14, questions: 239, weight: 3 },
  { module: 2, topic: 'Psiquiatría', slug: 'psiquiatria', classes: 16, questions: 241, weight: 4 },
  { module: 2, topic: 'Salud Pública', slug: 'salud-publica', classes: 15, questions: 241, weight: 5 },
  { module: 2, topic: 'Traumatología', slug: 'traumatologia', classes: 14, questions: 221, weight: 3 },
  { module: 2, topic: 'Urología', slug: 'urologia', classes: 14, questions: 228, weight: 3 },
  { module: 3, topic: 'Ginecología', slug: 'ginecologia', classes: 18, questions: 259, weight: 5 },
  { module: 3, topic: 'Obstetricia', slug: 'obstetricia', classes: 16, questions: 240, weight: 5 },
  { module: 3, topic: 'Pediatría', slug: 'pediatria', classes: 25, questions: 301, weight: 8 },
  { module: 3, topic: 'Neonatología', slug: 'neonatologia', classes: 15, questions: 294, weight: 4 },
]

// ─── HELPERS ──────────────────────────────────────────────────────────────
function getDateStr(d) { return d.toISOString().split('T')[0] }
function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r }
function diffDays(a, b) { return Math.ceil((b - a) / 86400000) }
function fmtDate(str) {
  const d = new Date(str + 'T12:00:00')
  return d.toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' })
}
function fmtMonth(d) {
  return d.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })
}

const COLORS = ['#3f7bf0','#06b6d4','#16a34a','#f59e0b','#ef4444','#a855f7','#ec4899','#0ea5e9','#8b5cf6','#f97316','#14b8a6','#e11d48','#6366f1','#84cc16','#f43f5e','#22d3ee','#c084fc','#fb923c','#4ade80','#facc15','#94a3b8']

// ─── COMPONENT ────────────────────────────────────────────────────────────
const StudyPlan = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [settings, setSettings] = useState(null)
  const [profile, setProfile] = useState(null)
  const [progress, setProgress] = useState([])
  const [claseProgress, setClaseProgress] = useState([])
  const [showSettings, setShowSettings] = useState(false)
  const [excluded, setExcluded] = useState([])
  const [dailyGoal, setDailyGoal] = useState(50)
  const [examDate, setExamDate] = useState('2026-07-10')
  const [saving, setSaving] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(getDateStr(new Date()))
  const [loading, setLoading] = useState(true)

  // Load all data
  useEffect(() => {
    if (!user) return
    Promise.all([
      fetchStudyPlanSettings(user.id).catch(() => null),
      fetchUserProfile(user.id).catch(() => null),
      fetchProgress(user.id).catch(() => []),
      fetchClaseProgress(user.id).catch(() => []),
    ]).then(([sett, prof, prog, cProg]) => {
      if (sett) {
        setExamDate(sett.exam_date || '2026-07-10')
        setExcluded(JSON.parse(sett.excluded_topics || '[]'))
        setDailyGoal(sett.daily_question_goal || 50)
        setSettings(sett)
      } else if (prof) {
        // Auto-detect from profile
        const month = prof.exam_month || 'Julio'
        const year = prof.exam_year || '2026'
        const ed = month === 'Diciembre' ? `${year}-12-16` : `${year}-07-10`
        setExamDate(ed)
      }
      setProfile(prof)
      setProgress(prog)
      setClaseProgress(cProg)
      setLoading(false)
    })
  }, [user])

  // ─── Generate the study schedule ───
  const schedule = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const exam = new Date(examDate + 'T12:00:00')
    const totalDays = Math.max(diffDays(today, exam), 7)

    // Filter out excluded topics
    const activeCurriculum = CURRICULUM.filter(c => !excluded.includes(c.slug))
    if (activeCurriculum.length === 0) return {}

    // Calculate total work units (classes + question batches of 20)
    const topicWork = activeCurriculum.map(c => ({
      ...c,
      totalUnits: c.classes + Math.ceil(c.questions / 20), // each unit = 1 clase or 20 questions
    }))
    const totalUnits = topicWork.reduce((s, t) => s + t.totalUnits, 0)

    // Distribute across days
    const dailySchedule = {}
    let dayIndex = 0

    for (const topic of topicWork) {
      // Allocate proportional days
      const topicDays = Math.max(1, Math.round((topic.totalUnits / totalUnits) * totalDays))
      const classesPerDay = Math.max(1, Math.ceil(topic.classes / topicDays))
      const questionsPerDay = Math.max(20, Math.ceil(topic.questions / topicDays))

      for (let d = 0; d < topicDays && dayIndex < totalDays; d++) {
        const date = getDateStr(addDays(today, dayIndex))
        if (!dailySchedule[date]) dailySchedule[date] = { topics: [], totalClasses: 0, totalQuestions: 0 }

        const classStart = d * classesPerDay
        const classEnd = Math.min(classStart + classesPerDay, topic.classes)
        const qStart = d * questionsPerDay
        const qEnd = Math.min(qStart + questionsPerDay, topic.questions)

        if (classEnd > classStart || qEnd > qStart) {
          dailySchedule[date].topics.push({
            ...topic,
            dayClasses: Math.max(0, classEnd - classStart),
            dayQuestions: Math.max(0, qEnd - qStart),
            classRange: [classStart + 1, classEnd],
            questionRange: [qStart + 1, qEnd],
          })
          dailySchedule[date].totalClasses += Math.max(0, classEnd - classStart)
          dailySchedule[date].totalQuestions += Math.max(0, qEnd - qStart)
        }
        dayIndex++
      }
    }

    // Fill remaining days with review
    while (dayIndex < totalDays) {
      const date = getDateStr(addDays(today, dayIndex))
      dailySchedule[date] = { topics: [], totalClasses: 0, totalQuestions: 0, isReview: true }
      dayIndex++
    }

    return dailySchedule
  }, [examDate, excluded])

  // ─── Calendar data for current month ───
  const calendarData = useMemo(() => {
    const y = currentMonth.getFullYear()
    const m = currentMonth.getMonth()
    const firstDay = new Date(y, m, 1)
    const lastDay = new Date(y, m + 1, 0)
    const startOffset = (firstDay.getDay() + 6) % 7 // Mon=0
    const days = []

    for (let i = 0; i < startOffset; i++) days.push(null)
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateStr = getDateStr(new Date(y, m, d))
      const hasSchedule = schedule[dateStr] && schedule[dateStr].topics.length > 0
      const isToday = dateStr === getDateStr(new Date())
      const isPast = new Date(dateStr) < new Date(getDateStr(new Date()))
      const isExam = dateStr === examDate
      days.push({ day: d, dateStr, hasSchedule, isToday, isPast, isExam })
    }
    return days
  }, [currentMonth, schedule, examDate])

  // ─── Progress calculations ───
  const progressByTopic = useMemo(() => {
    const answeredCount = progress.length
    const classesCompleted = claseProgress.filter(c => c.quiz_completed).length
    // Simple: total completed / total planned
    const activeCurriculum = CURRICULUM.filter(c => !excluded.includes(c.slug))
    const totalClasses = activeCurriculum.reduce((s, c) => s + c.classes, 0)
    const totalQuestions = activeCurriculum.reduce((s, c) => s + c.questions, 0)
    return {
      classesCompleted,
      totalClasses,
      questionsCompleted: answeredCount,
      totalQuestions,
      classPct: totalClasses > 0 ? Math.round((classesCompleted / totalClasses) * 100) : 0,
      questionPct: totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0,
      overallPct: (totalClasses + totalQuestions) > 0 ? Math.round(((classesCompleted + answeredCount) / (totalClasses + totalQuestions)) * 100) : 0,
    }
  }, [progress, claseProgress, excluded])

  const daysLeft = Math.max(0, diffDays(new Date(), new Date(examDate + 'T12:00:00')))
  const todaySchedule = schedule[getDateStr(new Date())]
  const selectedSchedule = schedule[selectedDay]

  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      await saveStudyPlanSettings({
        userId: user.id,
        examDate,
        excludedTopics: excluded,
        dailyQuestionGoal: dailyGoal,
      })
      setShowSettings(false)
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  const toggleExclude = (slug) => {
    setExcluded(prev => prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug])
  }

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--surface-400)' }}>Cargando plan...</div>

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', paddingBottom: '4rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h1 className="page__title" style={{ marginBottom: 0 }}>Plan de Estudio</h1>
          <p className="page__subtitle" style={{ margin: 0 }}>
            {daysLeft > 0 ? `${daysLeft} días para el EUNACOM` : 'EUNACOM es hoy — ¡mucho éxito!'} · {new Date(examDate).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button onClick={() => setShowSettings(true)} style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem',
          background: 'var(--surface-700)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 'var(--radius)', color: 'var(--surface-200)', fontWeight: 600,
          fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'var(--font)',
        }}>
          <Settings size={14} /> Personalizar
        </button>
      </div>

      {/* Customizable banner */}
      {!settings && (
        <div onClick={() => setShowSettings(true)} style={{
          background: 'rgba(19,91,236,0.08)', border: '1px solid rgba(19,91,236,0.2)',
          borderRadius: 'var(--radius)', padding: '0.75rem 1rem', marginBottom: '1rem',
          display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer',
        }}>
          <AlertTriangle size={18} color="var(--accent-amber)" />
          <span style={{ fontSize: '0.85rem', color: 'var(--surface-200)', fontFamily: 'var(--font)' }}>
            <strong>¿Ya estudiaste algunos temas?</strong> Personaliza tu plan para excluir materias que ya dominas y recalcular tu calendario.
          </span>
        </div>
      )}

      {/* ─── Progress overview ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <ProgressCard label="Progreso Total" value={`${progressByTopic.overallPct}%`} color="var(--primary-400)" icon={<Target size={18} />} bar={progressByTopic.overallPct} />
        <ProgressCard label="Clases" value={`${progressByTopic.classesCompleted}/${progressByTopic.totalClasses}`} color="var(--accent-teal)" icon={<BookOpen size={18} />} bar={progressByTopic.classPct} />
        <ProgressCard label="Preguntas" value={`${progressByTopic.questionsCompleted}/${progressByTopic.totalQuestions}`} color="var(--accent-green)" icon={<FileText size={18} />} bar={progressByTopic.questionPct} />
        <ProgressCard label="Días Restantes" value={daysLeft} color={daysLeft < 30 ? 'var(--accent-red)' : 'var(--accent-amber)'} icon={<Clock size={18} />} bar={null} />
      </div>

      {/* ─── Calendar ─── */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} style={navBtn}><ChevronLeft size={18} /></button>
          <h3 style={{ margin: 0, fontSize: '1.05rem', textTransform: 'capitalize' }}>{fmtMonth(currentMonth)}</h3>
          <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} style={navBtn}><ChevronRight size={18} /></button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
          {['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map(d => (
            <div key={d} style={{ color: 'var(--surface-400)', fontSize: '0.75rem', fontWeight: 700, paddingBottom: '0.25rem' }}>{d}</div>
          ))}
          {calendarData.map((d, i) => {
            if (!d) return <div key={'e'+i} />
            const isSelected = d.dateStr === selectedDay
            return (
              <div key={d.dateStr} onClick={() => setSelectedDay(d.dateStr)} style={{
                padding: '0.4rem 0', cursor: 'pointer', borderRadius: 'var(--radius)',
                background: isSelected ? 'var(--primary-500)' : d.isExam ? 'rgba(239,68,68,0.15)' : d.isToday ? 'rgba(19,91,236,0.1)' : 'transparent',
                border: d.isToday && !isSelected ? '1px solid var(--primary-400)' : '1px solid transparent',
                transition: 'all 0.15s',
              }}>
                <div style={{ fontSize: '0.85rem', fontWeight: d.isToday ? 700 : 400, color: isSelected ? '#fff' : d.isExam ? 'var(--accent-red)' : 'var(--surface-200)' }}>{d.day}</div>
                <div style={{ width: 6, height: 6, borderRadius: '50%', margin: '2px auto 0',
                  background: d.isExam ? 'var(--accent-red)' : d.hasSchedule ? 'var(--accent-green)' : 'transparent' }} />
              </div>
            )
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.75rem', color: 'var(--surface-400)' }}>
          <span><span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-green)', marginRight: 4 }} />Planificado</span>
          <span><span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-red)', marginRight: 4 }} />Examen</span>
          <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 'var(--radius)', border: '1px solid var(--primary-400)', marginRight: 4 }} />Hoy</span>
        </div>
      </div>

      {/* ─── Selected day schedule ─── */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CalendarDays size={18} color="var(--primary-300)" />
          {selectedDay === getDateStr(new Date()) ? 'Plan de hoy' : fmtDate(selectedDay)}
        </h2>

        {!selectedSchedule || selectedSchedule.topics.length === 0 ? (
          <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
            {selectedSchedule?.isReview ? (
              <>
                <RotateCcw size={32} color="var(--accent-teal)" style={{ marginBottom: '0.5rem' }} />
                <p style={{ color: 'var(--surface-300)', fontSize: '0.9rem', fontFamily: 'var(--font)' }}>Día de repaso — Revisa tus errores y refuerza temas débiles.</p>
                <button onClick={() => navigate('/review')} style={{ ...btnPrimary, marginTop: '0.75rem' }}>
                  <RotateCcw size={14} /> Repasar Errores
                </button>
              </>
            ) : (
              <p style={{ color: 'var(--surface-400)', fontSize: '0.9rem' }}>No hay actividades planificadas para este día.</p>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {selectedSchedule.topics.map((t, i) => (
              <div key={t.slug + i} className="card" style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[CURRICULUM.findIndex(c => c.slug === t.slug) % COLORS.length] }} />
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{t.topic}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--surface-400)', background: 'var(--surface-600)', padding: '0.1rem 0.4rem', borderRadius: 'var(--radius-full)' }}>Módulo {t.module}</span>
                  </div>
                </div>

                {t.dayClasses > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'rgba(6,182,212,0.06)', borderRadius: 'var(--radius)', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <BookOpen size={14} color="var(--accent-teal)" />
                      <span style={{ fontSize: '0.85rem', color: 'var(--surface-200)' }}>
                        {t.dayClasses} clase{t.dayClasses > 1 ? 's' : ''} (#{t.classRange[0]}–{t.classRange[1]})
                      </span>
                    </div>
                    <button onClick={() => navigate('/mis-clases')} style={{ ...btnSmall, background: 'rgba(6,182,212,0.15)', color: 'var(--accent-teal)' }}>
                      Ir a clases →
                    </button>
                  </div>
                )}

                {t.dayQuestions > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'rgba(19,91,236,0.06)', borderRadius: 'var(--radius)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FileText size={14} color="var(--primary-300)" />
                      <span style={{ fontSize: '0.85rem', color: 'var(--surface-200)' }}>
                        {t.dayQuestions} preguntas
                      </span>
                    </div>
                    <button onClick={() => navigate('/test')} style={{ ...btnSmall, background: 'rgba(19,91,236,0.15)', color: 'var(--primary-300)' }}>
                      Practicar →
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── SETTINGS MODAL ─── */}
      {showSettings && (
        <div onClick={() => setShowSettings(false)} style={{
          position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(11,17,32,0.85)',
          backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'var(--surface-700)', borderRadius: 'var(--radius-xl)',
            padding: '2rem', maxWidth: 540, width: '100%', maxHeight: '85vh', overflowY: 'auto',
            border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, fontFamily: 'var(--font)' }}>
                <Settings size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Personalizar Plan
              </h2>
              <button onClick={() => setShowSettings(false)} style={{ background: 'none', border: 'none', color: 'var(--surface-400)', cursor: 'pointer' }}><X size={18} /></button>
            </div>

            {/* Exam date */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={labelStyle}>Fecha del examen</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => setExamDate('2026-07-10')} style={{ ...tagBtn, background: examDate === '2026-07-10' ? 'var(--primary-500)' : 'var(--surface-600)', color: examDate === '2026-07-10' ? '#fff' : 'var(--surface-300)' }}>
                  Julio 10, 2026
                </button>
                <button onClick={() => setExamDate('2026-12-16')} style={{ ...tagBtn, background: examDate === '2026-12-16' ? 'var(--primary-500)' : 'var(--surface-600)', color: examDate === '2026-12-16' ? '#fff' : 'var(--surface-300)' }}>
                  Diciembre 16, 2026
                </button>
              </div>
            </div>

            {/* Daily goal */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={labelStyle}>Meta diaria de preguntas</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[25, 50, 75, 100].map(g => (
                  <button key={g} onClick={() => setDailyGoal(g)} style={{ ...tagBtn, background: dailyGoal === g ? 'var(--primary-500)' : 'var(--surface-600)', color: dailyGoal === g ? '#fff' : 'var(--surface-300)' }}>
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Exclude topics */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Materias a estudiar</label>
              <p style={{ fontSize: '0.78rem', color: 'var(--surface-400)', marginBottom: '0.75rem', fontFamily: 'var(--font)' }}>
                Desmarca las materias que ya dominas. El plan se recalculará automáticamente.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {CURRICULUM.map((c, i) => {
                  const isExcluded = excluded.includes(c.slug)
                  return (
                    <div key={c.slug} onClick={() => toggleExclude(c.slug)} style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius)', cursor: 'pointer',
                      background: isExcluded ? 'rgba(255,255,255,0.02)' : 'rgba(19,91,236,0.05)',
                      border: `1px solid ${isExcluded ? 'rgba(255,255,255,0.04)' : 'rgba(19,91,236,0.15)'}`,
                      opacity: isExcluded ? 0.5 : 1, transition: 'all 0.15s',
                    }}>
                      {isExcluded ? <Circle size={16} color="var(--surface-500)" /> : <CheckCircle size={16} color="var(--primary-400)" />}
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                      <span style={{ flex: 1, fontSize: '0.85rem', fontWeight: 500, color: isExcluded ? 'var(--surface-400)' : 'var(--surface-100)' }}>{c.topic}</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--surface-400)' }}>M{c.module} · {c.classes} clases · {c.questions} preg.</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => setShowSettings(false)} style={{ flex: 1, ...tagBtn, background: 'var(--surface-600)', color: 'var(--surface-200)' }}>Cancelar</button>
              <button onClick={handleSaveSettings} disabled={saving} style={{ flex: 1, ...tagBtn, background: 'var(--gradient-primary)', color: '#fff', fontWeight: 700 }}>
                {saving ? 'Guardando...' : <><Save size={14} /> Guardar Plan</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────
const ProgressCard = ({ label, value, color, icon, bar }) => (
  <div className="card" style={{ padding: '0.85rem', textAlign: 'center' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
      <span style={{ color }}>{icon}</span>
      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--surface-400)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{label}</span>
    </div>
    <div style={{ fontSize: '1.3rem', fontWeight: 800, color }}>{value}</div>
    {bar !== null && bar !== undefined && (
      <div style={{ marginTop: '0.4rem' }}>
        <div className="xp-bar" style={{ height: 5 }}>
          <div className="xp-bar__fill" style={{ width: `${bar}%`, background: color }} />
        </div>
      </div>
    )}
  </div>
)

// ─── Shared styles ──────────────────────────────────────────────────────
const navBtn = { background: 'var(--surface-600)', border: 'none', color: 'var(--surface-300)', cursor: 'pointer', borderRadius: 'var(--radius)', padding: '0.4rem', display: 'flex' }
const labelStyle = { display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--surface-200)', marginBottom: '0.5rem', fontFamily: 'var(--font)' }
const tagBtn = { display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.5rem 1rem', borderRadius: 'var(--radius)', border: 'none', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)', transition: 'all 0.15s' }
const btnPrimary = { display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.2rem', background: 'var(--gradient-primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'var(--font)' }
const btnSmall = { padding: '0.3rem 0.6rem', border: 'none', borderRadius: 'var(--radius)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)' }

export default StudyPlan
