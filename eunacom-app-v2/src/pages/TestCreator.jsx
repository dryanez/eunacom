import React, { useState, useEffect, useMemo } from 'react'
import { PlayCircle, Clock, CheckCircle2, AlertCircle, Flag, ChevronDown, ChevronRight, RefreshCw, BookOpen } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { fetchProgress, createTest, genId } from '../lib/api'

const TestCreator = () => {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [mode, setMode] = useState('tutor')
    const [numQuestions, setNumQuestions] = useState('10')
    const [loading, setLoading] = useState(true)
    const [isCreating, setIsCreating] = useState(false)
    const [userProgress, setUserProgress] = useState({})
    const [recentTests, setRecentTests] = useState([])
    const [questionDB, setQuestionDB] = useState([])

    const [statusFilters, setStatusFilters] = useState({
        unused: true,
        incorrect: false,
        omitted: false,
        marked: false,
        correct: false
    })

    const [expandedCategories, setExpandedCategories] = useState({})
    const [selectedTopics, setSelectedTopics] = useState({})

    // --- Data Fetching ---
    useEffect(() => {
        if (user) fetchData()
    }, [user])

    const fetchData = async () => {
        setLoading(true)
        try {
            if (!user) return

            const [progress, db] = await Promise.all([
                fetchProgress(user.id),
                fetch('/data/questionDB.json').then(r => r.json())
            ])
            setQuestionDB(db)
            const progressMap = {}
            progress.forEach(p => {
                progressMap[p.question_id] = {
                    is_correct: p.is_correct,
                    is_omitted: p.is_omitted,
                    is_marked: p.is_flagged
                }
            })
            setUserProgress(progressMap)
        } catch (e) {
            console.error('Error fetching data:', e)
        } finally {
            setLoading(false)
        }
    }

    // --- Category/Topic structure from questionDB ---
    const categories = useMemo(() => {
        const map = {}
        questionDB.forEach(q => {
            const cat = q.category || 'General'
            const topic = q.topic || 'Sin categoría'
            if (!map[cat]) map[cat] = {}
            if (!map[cat][topic]) map[cat][topic] = []
            map[cat][topic].push(q.id)
        })
        return map
    }, [questionDB])

    // --- Status counts & filtered questions ---
    const { counts, filteredByStatus, subjects } = useMemo(() => {
        const counts = { unused: 0, incorrect: 0, omitted: 0, marked: 0, correct: 0 }
        const filteredIds = new Set()
        const topicMap = {} // cat -> topic -> count

        const anyFilterActive = Object.values(statusFilters).some(f => f)

        questionDB.forEach(q => {
            const status = userProgress[q.id]
            const cat = q.category || 'General'
            const topic = q.topic || 'Sin categoría'

            if (!status) {
                counts.unused++
                if (statusFilters.unused) filteredIds.add(q.id)
            } else {
                if (status.is_omitted) {
                    counts.omitted++
                    if (statusFilters.omitted) filteredIds.add(q.id)
                }
                if (status.is_marked) {
                    counts.marked++
                    if (statusFilters.marked) filteredIds.add(q.id)
                }
                if (!status.is_omitted) {
                    if (status.is_correct) {
                        counts.correct++
                        if (statusFilters.correct) filteredIds.add(q.id)
                    } else {
                        counts.incorrect++
                        if (statusFilters.incorrect) filteredIds.add(q.id)
                    }
                }
            }
        })

        if (!anyFilterActive) filteredIds.clear()

        // Build per-topic counts (questions that pass status filter)
        questionDB.forEach(q => {
            if (!filteredIds.has(q.id)) return
            const cat = q.category || 'General'
            const topic = q.topic || 'Sin categoría'
            if (!topicMap[cat]) topicMap[cat] = {}
            topicMap[cat][topic] = (topicMap[cat][topic] || 0) + 1
        })

        const subjects = Object.entries(topicMap).reduce((acc, [cat, topics]) => {
            Object.entries(topics).forEach(([topic, count]) => {
                acc.push({ cat, topic, count })
            })
            return acc
        }, [])

        return { counts, filteredByStatus: filteredIds, subjects }
    }, [questionDB, userProgress, statusFilters])

    // --- Questions currently selected by tab + topic checkboxes ---
    const selectedQuestions = useMemo(() => {
        const result = []
        questionDB.forEach(q => {
            if (!filteredByStatus.has(q.id)) return
            const cat = q.category || 'General'
            const topic = q.topic || 'Sin categoría'
            if (selectedTopics[cat]?.[topic]) result.push(q)
        })
        return result
    }, [filteredByStatus, selectedTopics])

    const maxQuestions = selectedQuestions.length

    // --- Toggle helpers ---
    const toggleStatus = key => setStatusFilters(prev => ({ ...prev, [key]: !prev[key] }))
    const toggleCategoryExpand = cat => setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }))

    const toggleTopicSelection = (cat, topic) => {
        setSelectedTopics(prev => ({
            ...prev,
            [cat]: { ...prev[cat], [topic]: !prev[cat]?.[topic] }
        }))
    }

    const toggleCategorySelection = (cat) => {
        const topicsInCat = categories[cat] ? Object.keys(categories[cat]) : []
        const isAllSelected = topicsInCat.every(t => selectedTopics[cat]?.[t])
        const newTopics = {}
        topicsInCat.forEach(t => newTopics[t] = !isAllSelected)
        setSelectedTopics(prev => ({ ...prev, [cat]: newTopics }))
    }

    const handleSelectAllTopics = () => {
        const allCats = Object.keys(categories)
        const newSelected = {}
        allCats.forEach(cat => {
            newSelected[cat] = {}
            Object.keys(categories[cat]).forEach(t => {
                newSelected[cat][t] = true
            })
        })
        setSelectedTopics(newSelected)
    }

    const handleDeselectAll = () => setSelectedTopics({})

    const allTopicsSelected = useMemo(() => {
        return Object.entries(categories).every(([cat, topics]) =>
            Object.keys(topics).every(t => selectedTopics[cat]?.[t])
        )
    }, [categories, selectedTopics])

    // --- Time estimation ---
    const timeEstimateM = Math.max(1, parseInt(numQuestions) || 1)
    const timeEstimateH = Math.floor(timeEstimateM / 60)
    const timeEstimateRem = timeEstimateM % 60

    // --- Create Test ---
    const handleStartExam = async () => {
        if (maxQuestions === 0) {
            alert('Selecciona al menos un tema y un estado de preguntas.')
            return
        }
        const n = Math.min(parseInt(numQuestions) || 1, maxQuestions)
        setIsCreating(true)
        try {
            if (!user) throw new Error('Debes iniciar sesión.')

            const shuffled = [...selectedQuestions].sort(() => 0.5 - Math.random())
            const picked = shuffled.slice(0, n)
            const questionIds = picked.map(q => q.id)
            const testId = genId()

            await createTest({
                id: testId,
                userId: user.id,
                mode,
                timeLimitSeconds: mode === 'timed' ? n * 60 : null,
                totalQuestions: n,
                questions: questionIds
            })

            navigate('/test-runner', { state: { testId, questions: picked } })
        } catch (err) {
            console.error('Full error:', err)
            alert('Error al crear el examen: ' + (err.message || String(err)))
        } finally {
            setIsCreating(false)
        }
    }

    const statusConfig = [
        { key: 'unused', label: 'Sin usar', color: 'var(--primary-400)', icon: BookOpen },
        { key: 'incorrect', label: 'Incorrectas', color: '#f87171', icon: AlertCircle },
        { key: 'omitted', label: 'Omitidas', color: '#fbbf24', icon: Clock },
        { key: 'marked', label: 'Marcadas', color: '#a78bfa', icon: Flag },
        { key: 'correct', label: 'Correctas', color: '#34d399', icon: CheckCircle2 }
    ]

    return (
        <div style={{ paddingBottom: '8rem', maxWidth: '860px', margin: '0 auto' }}>
            <h1 className="page__title">Crear Examen</h1>
            <p className="page__subtitle">Configura tu examen personalizado</p>

            {/* ── MODE ── */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700 }}>Modo de Examen</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {[
                        { id: 'tutor', label: 'Modo Tutor', desc: 'Feedback inmediato después de cada respuesta.' },
                        { id: 'timed', label: 'Modo Tiempo', desc: 'Simula condiciones reales del EUNACOM.' }
                    ].map(m => (
                        <button key={m.id} onClick={() => setMode(m.id)} style={{
                            padding: '1rem', borderRadius: 'var(--radius)',
                            border: `2px solid ${mode === m.id ? 'var(--primary-500)' : 'var(--surface-600)'}`,
                            background: mode === m.id ? 'rgba(19,91,236,0.12)' : 'transparent',
                            color: 'white', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s'
                        }}>
                            <div style={{ fontWeight: 700 }}>{m.label}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--surface-400)', marginTop: '0.25rem' }}>{m.desc}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* ── STATUS FILTERS ── */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Estado de Preguntas</h3>
                    {loading && <span style={{ color: 'var(--surface-400)', fontSize: '0.85rem' }}>Cargando...</span>}
                    {!loading && <button onClick={fetchData} style={{ background: 'transparent', border: 'none', color: 'var(--primary-400)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem' }}>
                        <RefreshCw size={14} /> Actualizar
                    </button>}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                    {statusConfig.map(({ key, label, color, icon: Icon }) => (
                        <label key={key} style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer',
                            padding: '0.6rem 1rem', borderRadius: 'var(--radius)',
                            border: `1px solid ${statusFilters[key] ? color : 'var(--surface-600)'}`,
                            background: statusFilters[key] ? `${color}18` : 'transparent',
                            transition: 'all 0.2s'
                        }}>
                            <input type="checkbox" checked={statusFilters[key]} onChange={() => toggleStatus(key)} style={{ display: 'none' }} />
                            <Icon size={16} color={statusFilters[key] ? color : 'var(--surface-400)'} />
                            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{label}</span>
                            <span style={{
                                background: statusFilters[key] ? color : 'var(--surface-700)',
                                color: statusFilters[key] ? '#000' : 'var(--surface-300)',
                                borderRadius: '999px', padding: '1px 8px', fontSize: '0.8rem', fontWeight: 700
                            }}>{counts[key]}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* ── TOPICS ── */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Temas</h3>
                        <span style={{ fontSize: '0.8rem', color: 'var(--surface-400)' }}>
                            {maxQuestions} pregunta{maxQuestions !== 1 ? 's' : ''} disponibles con estos filtros
                        </span>
                    </div>
                    <button
                        onClick={allTopicsSelected ? handleDeselectAll : handleSelectAllTopics}
                        style={{ background: 'transparent', border: 'none', color: 'var(--primary-400)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
                    >
                        {allTopicsSelected ? 'Deseleccionar todo' : 'Seleccionar todo'}
                    </button>
                </div>
                <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
                    {Object.entries(categories).map(([cat, topics]) => {
                        const topicList = Object.keys(topics)
                        const isExpanded = expandedCategories[cat] !== false // default expanded
                        const totalCatCount = topicList.reduce((acc, t) => {
                            return acc + (questionDB.filter(q => q.category === cat && q.topic === t && filteredByStatus.has(q.id)).length)
                        }, 0)
                        const allCatSelected = topicList.every(t => selectedTopics[cat]?.[t])

                        return (
                            <div key={cat} style={{ marginBottom: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0' }}>
                                    <button onClick={() => toggleCategoryExpand(cat)}
                                        style={{ background: 'transparent', border: 'none', color: 'var(--surface-300)', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                        {isExpanded ? <ChevronDown size={17} /> : <ChevronRight size={17} />}
                                    </button>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', flex: 1 }}>
                                        <input type="checkbox" checked={allCatSelected} onChange={() => toggleCategorySelection(cat)}
                                            style={{ width: '17px', height: '17px', accentColor: 'var(--primary-400)' }} />
                                        <strong style={{ fontWeight: 700 }}>{cat}</strong>
                                        <span style={{ background: 'var(--surface-700)', color: 'var(--surface-300)', borderRadius: '999px', padding: '1px 8px', fontSize: '0.75rem', fontWeight: 600 }}>
                                            {totalCatCount}
                                        </span>
                                    </label>
                                </div>
                                {isExpanded && (
                                    <div style={{ paddingLeft: '2.5rem', borderLeft: '1px solid rgba(255,255,255,0.08)', marginLeft: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.25rem', marginBottom: '0.5rem' }}>
                                        {topicList.map(topic => {
                                            const topicCount = questionDB.filter(q => q.category === cat && q.topic === topic && filteredByStatus.has(q.id)).length
                                            return (
                                                <label key={topic} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: topicCount === 0 ? 'not-allowed' : 'pointer', opacity: topicCount === 0 ? 0.4 : 1 }}>
                                                    <input type="checkbox"
                                                        checked={!!selectedTopics[cat]?.[topic]}
                                                        onChange={() => topicCount > 0 && toggleTopicSelection(cat, topic)}
                                                        disabled={topicCount === 0}
                                                        style={{ width: '15px', height: '15px', accentColor: 'var(--primary-400)' }} />
                                                    <span style={{ fontSize: '0.93rem' }}>{topic}</span>
                                                    <span style={{ color: 'var(--surface-400)', fontSize: '0.8rem' }}>({topicCount})</span>
                                                </label>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* ── NUMBER OF QUESTIONS ── */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700 }}>Nº de Preguntas</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <input
                        type="number"
                        min={1}
                        max={maxQuestions || 1}
                        value={numQuestions}
                        onChange={e => setNumQuestions(e.target.value)}
                        onBlur={e => {
                            const val = parseInt(e.target.value) || 1
                            setNumQuestions(String(Math.min(Math.max(val, 1), maxQuestions || 1)))
                        }}
                        style={{
                            width: '90px', padding: '0.75rem', fontSize: '1.4rem', fontWeight: 800,
                            textAlign: 'center', background: 'var(--surface-800)', color: 'white',
                            border: '2px solid var(--primary-500)', borderRadius: 'var(--radius)', outline: 'none'
                        }}
                    />
                    <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--surface-400)' }}>
                            Máximo disponible: <strong style={{ color: 'white' }}>{maxQuestions}</strong>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--surface-400)', marginTop: '0.25rem' }}>
                            Tiempo estimado: <strong style={{ color: 'white' }}>
                                {timeEstimateH > 0 ? `${timeEstimateH}h ` : ''}{timeEstimateRem}min
                            </strong>
                        </div>
                    </div>
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
                        {[10, 25, 40].map(n => (
                            <button key={n} onClick={() => setNumQuestions(String(Math.min(n, maxQuestions)))} style={{
                                padding: '0.4rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600,
                                border: `1px solid ${parseInt(numQuestions) === n ? 'var(--primary-400)' : 'var(--surface-600)'}`,
                                background: parseInt(numQuestions) === n ? 'rgba(19,91,236,0.2)' : 'transparent',
                                color: parseInt(numQuestions) === n ? 'var(--primary-400)' : 'var(--surface-400)', cursor: 'pointer'
                            }}>{n}</button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── START BUTTON ── */}
            <div style={{ position: 'sticky', bottom: '1.5rem', zIndex: 10 }}>
                <button
                    onClick={handleStartExam}
                    disabled={maxQuestions === 0 || isCreating}
                    className="btn-primary btn-primary--full"
                    style={{ padding: '1.25rem', fontSize: '1.05rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', opacity: maxQuestions === 0 ? 0.45 : 1 }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <PlayCircle size={22} />
                        {isCreating ? 'Creando examen...' : `Comenzar Examen · ${Math.min(numQuestions, maxQuestions)} Preguntas`}
                    </div>
                    {maxQuestions > 0 && (
                        <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
                            {mode === 'timed' ? '⏱ Modo Tiempo · 1 min/pregunta' : '💡 Modo Tutor · Feedback inmediato'}
                        </span>
                    )}
                </button>
            </div>
        </div>
    )
}

export default TestCreator
