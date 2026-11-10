import React, { useState, useEffect } from 'react'
import { Search, Play, Trash2, ChevronRight, BookOpen, Archive, Timer, ClipboardCheck, PenLine } from 'lucide-react'
import { fetchTests as apiFetchTests, deleteTest } from '../lib/api'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { loadTestQuestions, getQuestionDB } from '../lib/questionDB'
import { fetchLibroGordoQuestions } from '../lib/api'
import { bookName as libroGordoName } from '../../api/_libro-gordo.js'
import '../components/redesign/midnight.css'
import '../components/redesign/stats-history.css'

const scoreTone = pct => pct >= 70 ? 'sh-good' : pct >= 50 ? 'sh-mid' : 'sh-bad'

const typeIcon = test => {
    if (test.libroGordo) return { Icon: BookOpen, cls: 'sh-ic-amber' }
    if (test.isReconstruction) return { Icon: Archive, cls: 'sh-ic-violet' }
    if (test.mode === 'Tiempo') return { Icon: Timer, cls: '' }
    if (test.mode === 'Examen') return { Icon: ClipboardCheck, cls: '' }
    return { Icon: PenLine, cls: '' }
}

const HistoryRow = ({ test }) => {
    const completed = test.status === 'Completado'
    let displayScore = 0
    if (completed) {
        displayScore = test.score
    } else {
        const answeredKeys = new Set([
            ...Object.keys(test.savedAnswers || {}),
            ...Object.keys(test.tutorState?.firstAttempts || {})
        ])
        const totalCount = test.questions.length
        displayScore = totalCount > 0 ? Math.round((answeredKeys.size / totalCount) * 100) : 0
    }
    const scoreText = completed ? (test.score >= 50 ? 'Aprobado' : 'Reprobado') : 'En curso'
    const typeLabel = test.libroGordo ? 'Libro Gordo' : test.isReconstruction ? 'Reconstrucción' : null
    const nQ = test.questions.length
    const { Icon, cls } = typeIcon(test)
    const meta = [typeLabel, test.mode, test.time, `${nQ} ${nQ === 1 ? 'pregunta' : 'preguntas'}`].filter(Boolean).join(' · ')

    return (
        <div className="sh-row">
            <button className="mn-li" onClick={() => test.onContinue(test)} title={`${completed ? 'Revisar' : 'Continuar'} · #${test.id.split('-')[0]}`}>
                <span className={`mn-ic ${cls}`}>{completed ? <Icon size={18} /> : <Play size={17} />}</span>
                <span className="mn-li-txt">
                    <span>{test.title}</span>
                    <small>{meta}</small>
                </span>
                <span className={`sh-score ${completed ? scoreTone(displayScore) : 'sh-prog'}`}>
                    {displayScore}%<small>{scoreText}</small>
                </span>
                <ChevronRight size={16} className="mn-li-go" />
            </button>
            <button className="sh-del" onClick={() => test.onDelete(test.id)} aria-label="Eliminar examen" title="Eliminar">
                <Trash2 size={16} />
            </button>
        </div>
    )
}

const dayKey = d => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
const dayLabel = d => {
    const today = new Date()
    const yest = new Date(); yest.setDate(today.getDate() - 1)
    if (dayKey(d) === dayKey(today)) return 'Hoy'
    if (dayKey(d) === dayKey(yest)) return 'Ayer'
    return d.toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short', year: d.getFullYear() === today.getFullYear() ? undefined : 'numeric' })
}

const History = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [tests, setTests] = useState([])
    const [loading, setLoading] = useState(true)
    const [query, setQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')

    useEffect(() => {
        if (user) loadTests()
    }, [user])

    const loadTests = async () => {
        setLoading(true)
        try {
            const [data, db] = await Promise.all([
                apiFetchTests(user.id),
                getQuestionDB()
            ])

            const qMap = new Map(db.map(q => [q.id, q.topic || 'Sin categoría']))

            const formatted = (data || []).map(t => {
                const questions = typeof t.questions === 'string' ? JSON.parse(t.questions) : (t.questions || [])
                let isReconstruction = false
                let testTitle = "Examen Aleatorio"
                // Libros Gordos online: id "lg-<libro>-<uuid>"
                const libroGordo = String(t.id).startsWith('lg-') ? String(t.id).split('-')[1] : null

                if (libroGordo) {
                    testTitle = `Libro Gordo · ${libroGordoName(libroGordo)}`
                } else if (questions.length > 0) {
                    const firstQ = questions[0]
                    if (typeof firstQ === 'string' && firstQ.includes('_q')) {
                        isReconstruction = true
                        const prefix = firstQ.split('_q')[0]
                        testTitle = prefix.split(/[-_]/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                    } else {
                        // Find topics
                        const topics = new Set()
                        questions.forEach(qid => {
                            if (qMap.has(qid)) topics.add(qMap.get(qid))
                        })
                        
                        if (topics.size > 0 && topics.size < 5) {
                            testTitle = Array.from(topics).join(', ')
                        } else {
                            testTitle = "Examen Aleatorio"
                        }
                    }
                }
                
                return {
                    id: t.id,
                    date: new Date(t.created_at).toLocaleDateString(),
                    createdAt: new Date(t.created_at),
                    time: new Date(t.created_at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false }),
                    mode: t.mode === 'timed' ? 'Tiempo' : t.mode === 'exam' ? 'Examen' : 'Tutor',
                    status: t.status === 'completed' ? 'Completado' : 'En Progreso',
                    score: t.score || 0,
                    questions,
                    savedAnswers: typeof t.answers === 'string' ? JSON.parse(t.answers) : (t.answers || {}),
                    currentQuestionIndex: t.current_question_index || 0,
                    timeLimitSeconds: t.time_limit_seconds || 0,
                    timeLeftSeconds: t.time_left_seconds !== null ? t.time_left_seconds : undefined,
                    tutorState: t.tutor_state ? JSON.parse(t.tutor_state) : null,
                    title: testTitle,
                    libroGordo,
                    isReconstruction
                }
            })
            setTests(formatted)
        } catch (error) {
            console.error('Error fetching history:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('¿Seguro que deseas eliminar este examen?')) return
        try {
            await deleteTest(id)
            setTests(prev => prev.filter(t => t.id !== id))
        } catch (error) {
            console.error('Error deleting test:', error)
        }
    }

    const handleContinue = async (test) => {
        let testQuestions
        if (test.libroGordo) {
            // Preguntas fuera del banco: el servidor revisa que el enlace siga vigente (o plan premium)
            const res = await fetchLibroGordoQuestions(test.libroGordo, user.id)
            if (res.error) { navigate('/oferta'); return }
            testQuestions = res.data
        } else {
            testQuestions = await loadTestQuestions(test.questions)
        }
        const isCompleted = test.status === 'Completado'

        if (testQuestions.length === 0) {
            alert('No se pudieron cargar las preguntas originales.')
            return
        }

        navigate('/test-runner', {
            state: {
                testId: test.id,
                questions: testQuestions,
                savedAnswers: test.savedAnswers || {},
                savedIndex: test.currentQuestionIndex || 0,
                startFinished: isCompleted,
                timeLimitSeconds: test.timeLimitSeconds,
                timeLeftSeconds: test.timeLeftSeconds,
                tutorState: test.tutorState,
                isReconstruction: test.isReconstruction,
                mode: test.mode === 'Tutor' ? 'tutor' : 'exam',
                isSimulation: test.mode === 'Tiempo'
            }
        })
    }

    const q = query.trim().toLowerCase()
    const visible = tests.filter(t =>
        (statusFilter === 'all' || t.status === statusFilter) &&
        (!q || t.id.toLowerCase().includes(q) || t.date.toLowerCase().includes(q) || (t.title || '').toLowerCase().includes(q))
    )
    const groups = []
    visible
        .slice()
        .sort((a, b) => b.createdAt - a.createdAt)
        .forEach(t => {
            const k = isNaN(t.createdAt) ? 'sin-fecha' : dayKey(t.createdAt)
            let g = groups[groups.length - 1]
            if (!g || g.key !== k) { g = { key: k, label: isNaN(t.createdAt) ? 'Sin fecha' : dayLabel(t.createdAt), items: [] }; groups.push(g) }
            g.items.push(t)
        })

    return (
        <section className="sh-page">
            <h1 className="mn-h1">Historial</h1>
            <p className="mn-sub">Tus exámenes pasados y en progreso</p>

            <label className="sh-search">
                <Search size={17} />
                <input type="text" placeholder="Buscar por tema, ID o fecha..." value={query} onChange={e => setQuery(e.target.value)} />
            </label>
            <div className="mn-chips">
                {[
                    { id: 'all', label: 'Todos' },
                    { id: 'En Progreso', label: 'En progreso' },
                    { id: 'Completado', label: 'Completados' },
                ].map(c => (
                    <button key={c.id} className={statusFilter === c.id ? 'on' : ''} onClick={() => setStatusFilter(c.id)}>{c.label}</button>
                ))}
            </div>

            {loading ? (
                <div className="sh-empty">Cargando historial...</div>
            ) : tests.length === 0 ? (
                <div className="sh-empty">No hay exámenes en tu historial.</div>
            ) : visible.length === 0 ? (
                <div className="sh-empty">Ningún examen coincide con la búsqueda.</div>
            ) : (
                groups.map(g => (
                    <React.Fragment key={g.key}>
                        <div className="sh-day">{g.label}</div>
                        <div className="mn-card mn-list">
                            {g.items.map(test => (
                                <HistoryRow key={test.id} test={{ ...test, onDelete: handleDelete, onContinue: handleContinue }} />
                            ))}
                        </div>
                    </React.Fragment>
                ))
            )}
        </section>
    )
}

export default History
