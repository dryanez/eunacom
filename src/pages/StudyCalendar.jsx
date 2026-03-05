import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { STUDY_SCHEDULE, CHAPTERS, getScheduleForDate } from '../data/studySchedule'
import { ChevronLeft, ChevronRight, Play, BookOpen, Pencil, X } from 'lucide-react'
import '../styles/studyCalendar.css'

const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const DAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

const StudyCalendar = () => {
    const navigate = useNavigate()
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
    const [selectedDate, setSelectedDate] = useState(null)
    const [selectedDay, setSelectedDay] = useState(null)
    const [activeVideo, setActiveVideo] = useState(null)
    const [notes, setNotes] = useState({})
    const [saveIndicator, setSaveIndicator] = useState(false)
    const panelBodyRef = useRef(null)

    // When a video is selected, scroll the panel body to top so player is visible
    const handleSelectVideo = useCallback((vid) => {
        setActiveVideo(vid)
        // Scroll panel body to top after render
        setTimeout(() => {
            if (panelBodyRef.current) {
                panelBodyRef.current.scrollTop = 0
            }
        }, 50)
    }, [])

    // Today's date string
    const todayStr = useMemo(() => new Date().toISOString().split('T')[0], [])
    const todaySchedule = useMemo(() => getScheduleForDate(todayStr), [todayStr])

    // Load notes from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem('eunacom_study_notes')
            if (saved) setNotes(JSON.parse(saved))
        } catch (e) { /* ignore */ }
    }, [])

    // Save notes to localStorage
    const saveNotes = useCallback((dateStr, text) => {
        const updated = { ...notes, [dateStr]: text }
        setNotes(updated)
        localStorage.setItem('eunacom_study_notes', JSON.stringify(updated))
        setSaveIndicator(true)
        setTimeout(() => setSaveIndicator(false), 2000)
    }, [notes])

    // Progress calculation
    const progress = useMemo(() => {
        const today = new Date()
        const start = new Date(2026, 2, 4)
        const end = new Date(2026, 6, 8)
        const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
        const elapsed = Math.max(0, Math.ceil((today - start) / (1000 * 60 * 60 * 24)))
        return {
            elapsed: Math.min(elapsed, totalDays),
            total: totalDays,
            percent: Math.min(100, Math.round((elapsed / totalDays) * 100)),
        }
    }, [])

    // Generate calendar grid for current month
    const calendarGrid = useMemo(() => {
        const firstDay = new Date(currentYear, currentMonth, 1)
        const lastDay = new Date(currentYear, currentMonth + 1, 0)
        const daysInMonth = lastDay.getDate()

        // Monday-based: 0=Mon, 6=Sun
        let startDow = firstDay.getDay() - 1
        if (startDow < 0) startDow = 6

        const cells = []

        // Empty cells before first day
        for (let i = 0; i < startDow; i++) {
            cells.push({ empty: true, key: `empty-${i}` })
        }

        // Day cells
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
            const schedule = getScheduleForDate(dateStr)
            const isToday = dateStr === todayStr
            const isPast = dateStr < todayStr

            cells.push({
                empty: false,
                key: dateStr,
                day: d,
                dateStr,
                schedule,
                isToday,
                isPast,
                isExam: schedule?.isExamDay,
            })
        }

        return cells
    }, [currentMonth, currentYear, todayStr])

    const handleDayClick = (cell) => {
        if (cell.empty || !cell.schedule) return
        setSelectedDate(cell.dateStr)
        setSelectedDay(cell.schedule)
        setActiveVideo(null)
    }

    const closePanel = () => {
        setSelectedDate(null)
        setSelectedDay(null)
        setActiveVideo(null)
    }

    const getChapterColor = (chapter) => chapter?.color || '#9ca3af'

    const goToPrevMonth = () => {
        if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) }
        else setCurrentMonth(m => m - 1)
    }

    const goToNextMonth = () => {
        if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) }
        else setCurrentMonth(m => m + 1)
    }

    const formatDateLong = (dateStr) => {
        const d = new Date(dateStr + 'T12:00:00')
        const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
        return `${days[d.getDay()]} ${d.getDate()} de ${MONTH_NAMES[d.getMonth()]}, ${d.getFullYear()}`
    }

    return (
        <div className="study-calendar">
            {/* Header */}
            <div className="study-calendar__header">
                <h1 className="study-calendar__title">📅 Plan de Estudio</h1>
                <div className="study-calendar__progress">
                    <div className="study-calendar__progress-bar">
                        <div
                            className="study-calendar__progress-fill"
                            style={{ width: `${progress.percent}%` }}
                        />
                    </div>
                    <span className="study-calendar__progress-text">
                        Día {progress.elapsed} de {progress.total} ({progress.percent}%)
                    </span>
                </div>
            </div>

            {/* Today's Summary */}
            {todaySchedule && (
                <div className="study-calendar__today-card">
                    <span className="study-calendar__today-emoji">{todaySchedule.emoji}</span>
                    <div className="study-calendar__today-info">
                        <h3>Hoy: {todaySchedule.topic}</h3>
                        <p>
                            {todaySchedule.videos.length > 0 && `${todaySchedule.videos.length} videos · `}
                            {todaySchedule.questionCount > 0 && `${todaySchedule.questionCount} preguntas · `}
                            {todaySchedule.weekLabel}
                        </p>
                    </div>
                    <button
                        className="study-calendar__today-btn"
                        onClick={() => handleDayClick({ dateStr: todayStr, schedule: todaySchedule, empty: false })}
                    >
                        Ver detalle →
                    </button>
                </div>
            )}

            {/* Week Navigation */}
            <div className="study-calendar__week-nav">
                {Array.from({ length: 18 }, (_, i) => i + 1).map(w => {
                    const weekDays = STUDY_SCHEDULE.filter(d => d.week === w)
                    const currentWeek = todaySchedule?.week === w
                    const firstTopic = weekDays[0]?.topic?.split(' + ')[0]?.split(':').pop()?.trim() || ''
                    return (
                        <button
                            key={w}
                            className={`study-calendar__week-btn ${currentWeek ? 'study-calendar__week-btn--current' : ''}`}
                            onClick={() => {
                                const firstDate = weekDays[0]?.date
                                if (firstDate) {
                                    const d = new Date(firstDate + 'T12:00:00')
                                    setCurrentMonth(d.getMonth())
                                    setCurrentYear(d.getFullYear())
                                }
                            }}
                            title={firstTopic}
                        >
                            S{w}
                        </button>
                    )
                })}
            </div>

            {/* Month Header */}
            <div className="study-calendar__month-header">
                <button className="study-calendar__month-btn" onClick={goToPrevMonth}>
                    <ChevronLeft size={18} />
                </button>
                <h2 className="study-calendar__month-title">
                    {MONTH_NAMES[currentMonth]} {currentYear}
                </h2>
                <button className="study-calendar__month-btn" onClick={goToNextMonth}>
                    <ChevronRight size={18} />
                </button>
            </div>

            {/* Calendar Grid */}
            <div className="study-calendar__grid">
                {DAY_LABELS.map(d => (
                    <div key={d} className="study-calendar__day-label">{d}</div>
                ))}
                {calendarGrid.map(cell => (
                    <div
                        key={cell.key}
                        className={`study-calendar__day ${cell.empty ? 'study-calendar__day--empty' : ''} ${cell.isToday ? 'study-calendar__day--today' : ''} ${cell.isPast ? 'study-calendar__day--past' : ''} ${cell.isExam ? 'study-calendar__day--exam' : ''} ${selectedDate === cell.dateStr ? 'study-calendar__day--selected' : ''}`}
                        onClick={() => handleDayClick(cell)}
                        style={cell.schedule ? { backgroundColor: `${getChapterColor(cell.schedule.chapter)}12` } : {}}
                    >
                        {!cell.empty && (
                            <>
                                <span className="study-calendar__day-number">{cell.day}</span>
                                {cell.schedule && <span className="study-calendar__day-emoji">{cell.schedule.emoji}</span>}
                                {cell.schedule && (
                                    <span
                                        className="study-calendar__day-dot"
                                        style={{ backgroundColor: getChapterColor(cell.schedule.chapter) }}
                                    />
                                )}
                            </>
                        )}
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '0.5rem', marginBottom: '2rem' }}>
                {Object.values(CHAPTERS).map(ch => (
                    <div key={ch.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#6b7280' }}>
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: ch.color, display: 'inline-block' }} />
                        {ch.label}
                    </div>
                ))}
            </div>

            {/* Day Detail Modal */}
            {selectedDay && (
                <div className="study-calendar__panel-overlay" onClick={closePanel}>
                    <div className="study-calendar__panel" onClick={e => e.stopPropagation()}>
                        {/* Panel Header */}
                        <div className="study-calendar__panel-header">
                            <div>
                                <div className="study-calendar__panel-date">{formatDateLong(selectedDate)}</div>
                                <div className="study-calendar__panel-topic">
                                    {selectedDay.emoji} {selectedDay.topic}
                                </div>
                                <span
                                    className="study-calendar__panel-badge"
                                    style={{ backgroundColor: getChapterColor(selectedDay.chapter) }}
                                >
                                    {selectedDay.weekLabel} · {selectedDay.chapter.label}
                                </span>
                            </div>
                            <button className="study-calendar__panel-close" onClick={closePanel}>
                                <X size={18} />
                            </button>
                        </div>

                        {/* Video Player — pinned above scrollable body */}
                        {activeVideo && (
                            <div className="study-calendar__player">
                                <div style={{ padding: '0.75rem 2rem 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6b7280' }}>▶ {activeVideo.filename.replace('.mp4', '')}</span>
                                    <button
                                        onClick={() => setActiveVideo(null)}
                                        style={{ background: 'none', color: '#9ca3af', fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                                    >
                                        Cerrar video ✕
                                    </button>
                                </div>
                                <video
                                    key={activeVideo.path}
                                    controls
                                    autoPlay
                                    src={activeVideo.path}
                                    style={{ width: '100%', minHeight: '280px', maxHeight: '420px', background: '#000' }}
                                >
                                    Tu navegador no soporta video.
                                </video>
                            </div>
                        )}

                        {/* Panel Body — scrollable */}
                        <div className="study-calendar__panel-body" ref={panelBodyRef}>

                            {/* Videos List */}
                            {selectedDay.videos.length > 0 && (
                                <div>
                                    <div className="study-calendar__section-title">
                                        <Play size={14} /> Videos del día ({selectedDay.videos.length})
                                    </div>
                                    <div className="study-calendar__video-list">
                                        {selectedDay.videos.map((vid, i) => (
                                            <div
                                                key={i}
                                                className={`study-calendar__video-item ${activeVideo?.path === vid.path ? 'study-calendar__video-item--playing' : ''}`}
                                                onClick={() => handleSelectVideo(vid)}
                                            >
                                                <div className="study-calendar__video-icon">
                                                    <Play size={16} />
                                                </div>
                                                <span className="study-calendar__video-name">
                                                    {vid.filename.replace('.mp4', '')}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedDay.videos.length === 0 && !selectedDay.isExamDay && (
                                <div className="study-calendar__empty">
                                    <div className="study-calendar__empty-emoji">{selectedDay.emoji}</div>
                                    <p>{selectedDay.dayType === 'rest' ? 'Día de descanso — recarga energías 🌿' : selectedDay.dayType === 'simulacro' ? 'Haz un simulacro completo en modo Examen' : 'Día de repaso — enfócate en tus áreas débiles'}</p>
                                </div>
                            )}

                            {selectedDay.isExamDay && (
                                <div className="study-calendar__empty">
                                    <div className="study-calendar__empty-emoji">🏆</div>
                                    <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>¡Hoy es el EUNACOM! Tú puedes. 💪</p>
                                </div>
                            )}

                            {/* Questions */}
                            {selectedDay.questionCount > 0 && selectedDay.questionsTopic && (
                                <div>
                                    <div className="study-calendar__section-title">
                                        <BookOpen size={14} /> Preguntas
                                    </div>
                                    <div className="study-calendar__questions-card">
                                        <div className="study-calendar__questions-info">
                                            <div className="study-calendar__questions-topic">{selectedDay.questionsTopic}</div>
                                            <div className="study-calendar__questions-count">{selectedDay.questionCount} preguntas para hoy</div>
                                        </div>
                                        <button
                                            className="study-calendar__questions-btn"
                                            onClick={() => navigate('/test')}
                                        >
                                            Iniciar Preguntas →
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Notes */}
                            <div className="study-calendar__notes">
                                <div className="study-calendar__section-title">
                                    <Pencil size={14} /> Mis Notas
                                </div>
                                <textarea
                                    placeholder="Escribe tus notas aquí... Se guardan automáticamente."
                                    value={notes[selectedDate] || ''}
                                    onChange={e => saveNotes(selectedDate, e.target.value)}
                                />
                                {saveIndicator && (
                                    <div className="study-calendar__notes-saved">✓ Guardado</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default StudyCalendar
