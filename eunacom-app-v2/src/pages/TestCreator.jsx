import React, { useState, useEffect, useMemo } from 'react'
import { PlayCircle, Clock, CheckCircle2, Circle, AlertCircle, Flag, ChevronDown, ChevronRight, RefreshCw, BookOpen, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useSubscription } from '../contexts/SubscriptionContext'
import PaymentModal from '../components/PaymentModal'
import { fetchProgress, createTest, genId } from '../lib/api'
import LoginGateModal from '../components/LoginGateModal'

const TestCreator = () => {
    const navigate = useNavigate()
    const { user } = useAuth()
    const { isPremium, usageStats, hasExceededQuestions, freemiumMode } = useSubscription()
    const [mode, setMode] = useState('tutor')
    const [numQuestions, setNumQuestions] = useState('10')
    const [loading, setLoading] = useState(true)
    const [isCreating, setIsCreating] = useState(false)
    const [createError, setCreateError] = useState('')
    const [userProgress, setUserProgress] = useState({})
    const [questionDB, setQuestionDB] = useState([])
    const [showLoginGate, setShowLoginGate] = useState(false)
    const [showPaymentModal, setShowPaymentModal] = useState(false)

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
        fetchData()
    }, [user])

    const fetchData = async () => {
        setLoading(true)
        try {
            const db = await fetch('/data/questionDB.json').then(r => r.json())
            setQuestionDB(db)

            if (user) {
                const progress = await fetchProgress(user.id)
                const progressMap = {}
                progress.forEach(p => {
                    progressMap[p.question_id] = {
                        is_correct: p.is_correct,
                        is_omitted: p.is_omitted,
                        is_marked: p.is_flagged
                    }
                })
                setUserProgress(progressMap)
            }
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
    }, [questionDB, filteredByStatus, selectedTopics])

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
        if (Object.keys(categories).length === 0) return false
        return Object.entries(categories).every(([cat, topics]) =>
            Object.keys(topics).every(t => selectedTopics[cat]?.[t])
        )
    }, [categories, selectedTopics])

    // --- Time estimation ---
    const activeNum = Math.max(1, parseInt(numQuestions) || 1)
    const timeEstimateM = Math.max(1, activeNum)
    const timeEstimateH = Math.floor(timeEstimateM / 60)
    const timeEstimateRem = timeEstimateM % 60

    // --- Create Test ---
    const handleStartExam = async () => {
        setCreateError('')
        if (!user) { setShowLoginGate(true); return }
        const isLocked = freemiumMode === 'strict' ? !isPremium : hasExceededQuestions;
        if (isLocked) {
            setShowPaymentModal(true)
            return
        }
        const requestedNum = parseInt(numQuestions) || 1
        if (!isPremium && requestedNum > 20) {
            setShowPaymentModal(true)
            setCreateError('El Plan Gratuito está limitado a un máximo de 20 preguntas por examen. ¡Actualiza a Premium para exámenes ilimitados!')
            return
        }
        if (maxQuestions === 0) {
            setCreateError('Selecciona al menos un tema y un estado con preguntas disponibles.')
            return
        }
        const n = Math.min(Math.max(1, parseInt(numQuestions) || 1), maxQuestions)
        setIsCreating(true)
        try {
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
            setCreateError('Error al crear el examen: ' + (err.message || String(err)))
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
        <>
        {showPaymentModal && <PaymentModal onClose={() => setShowPaymentModal(false)} />}
        <div style={{ paddingBottom: '8rem', maxWidth: '860px', margin: '0 auto' }}>
            <h1 className="page__title">Crear Examen</h1>
            <p className="page__subtitle">Configura tu examen personalizado</p>

            {/* ── MODE ── */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700 }}>Modo de Examen</h3>
                <div className="grid-2-responsive">
                    {[
                        { id: 'tutor', label: 'Modo Tutor', desc: 'Feedback inmediato después de cada respuesta.' },
                        { id: 'timed', label: 'Modo Tiempo', desc: 'Simula condiciones reales del EUNACOM (1 min/pregunta).' }
                    ].map(m => {
                        const isActive = mode === m.id
                        return (
                            <button key={m.id} onClick={() => setMode(m.id)} style={{
                                position: 'relative',
                                padding: '1.1rem 1.25rem', borderRadius: 'var(--radius-xl)',
                                border: `2px solid ${isActive ? 'var(--primary-400)' : 'var(--surface-600)'}`,
                                background: isActive ? 'rgba(19,91,236,0.18)' : 'var(--surface-800)',
                                color: 'white', textAlign: 'left', cursor: 'pointer',
                                boxShadow: isActive ? '0 0 16px rgba(19,91,236,0.3)' : 'none',
                                transition: 'all 0.2s ease',
                                outline: 'none'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                    <span style={{ fontWeight: 800, fontSize: '1rem', color: isActive ? '#fff' : 'var(--surface-200)' }}>{m.label}</span>
                                    {isActive ? (
                                        <CheckCircle2 size={20} color="var(--primary-400)" style={{ flexShrink: 0 }} />
                                    ) : (
                                        <Circle size={18} color="var(--surface-500)" style={{ flexShrink: 0 }} />
                                    )}
                                </div>
                                <div style={{ fontSize: '0.82rem', color: isActive ? 'var(--surface-200)' : 'var(--surface-400)', lineHeight: 1.4 }}>{m.desc}</div>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* ── STATUS FILTERS ── */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Estado de Preguntas</h3>
                    {loading && <span style={{ color: 'var(--surface-400)', fontSize: '0.85rem' }}>Cargando...</span>}
                    {!loading && <button onClick={fetchData} style={{ background: 'transparent', border: 'none', color: 'var(--primary-400)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', fontWeight: 600 }}>
                        <RefreshCw size={14} /> Actualizar
                    </button>}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                    {statusConfig.map(({ key, label, color, icon: Icon }) => {
                        const isChecked = !!statusFilters[key]
                        return (
                            <button
                                key={key}
                                type="button"
                                onClick={() => toggleStatus(key)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.55rem', cursor: 'pointer',
                                    padding: '0.65rem 1rem', borderRadius: 'var(--radius-full)',
                                    border: `2px solid ${isChecked ? color : 'var(--surface-600)'}`,
                                    background: isChecked ? `${color}22` : 'var(--surface-800)',
                                    color: isChecked ? '#fff' : 'var(--surface-300)',
                                    fontWeight: isChecked ? 700 : 500,
                                    fontSize: '0.88rem',
                                    boxShadow: isChecked ? `0 0 12px ${color}33` : 'none',
                                    transition: 'all 0.18s ease'
                                }}
                            >
                                {isChecked ? <CheckCircle2 size={16} color={color} /> : <Circle size={16} color="var(--surface-500)" />}
                                <span>{label}</span>
                                <span style={{
                                    background: isChecked ? color : 'var(--surface-700)',
                                    color: isChecked ? '#000' : 'var(--surface-300)',
                                    borderRadius: '999px', padding: '2px 8px', fontSize: '0.78rem', fontWeight: 800
                                }}>{counts[key]}</span>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* ── TOPICS ── */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Temas y Especialidades</h3>
                        <span style={{ fontSize: '0.82rem', color: maxQuestions > 0 ? 'var(--accent-green)' : 'var(--accent-amber)', fontWeight: 600 }}>
                            {maxQuestions} pregunta{maxQuestions !== 1 ? 's' : ''} disponibles seleccionadas
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={allTopicsSelected ? handleDeselectAll : handleSelectAllTopics}
                        style={{ background: 'rgba(19,91,236,0.1)', border: '1px solid rgba(19,91,236,0.3)', color: 'var(--primary-400)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, padding: '0.4rem 0.85rem', borderRadius: 'var(--radius-full)' }}
                    >
                        {allTopicsSelected ? 'Deseleccionar todo' : 'Seleccionar todo'}
                    </button>
                </div>
                <div style={{ maxHeight: '420px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                    {Object.keys(categories).sort().map(cat => {
                        const topics = categories[cat]
                        const topicList = Object.keys(topics).sort()
                        const isExpanded = !!expandedCategories[cat]
                        const totalCatCount = topicList.reduce((acc, t) => {
                            return acc + (questionDB.filter(q => q.category === cat && q.topic === t && filteredByStatus.has(q.id)).length)
                        }, 0)
                        const selectedCount = topicList.filter(t => selectedTopics[cat]?.[t]).length
                        const allCatSelected = topicList.length > 0 && selectedCount === topicList.length

                        return (
                            <div key={cat} style={{ marginBottom: '0.6rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius)', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.85rem', background: 'var(--surface-800)' }}>
                                    <button
                                        type="button"
                                        onClick={() => toggleCategoryExpand(cat)}
                                        style={{ background: 'transparent', border: 'none', color: 'var(--surface-300)', padding: 4, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                        aria-label={isExpanded ? "Colapsar categoría" : "Expandir categoría"}
                                    >
                                        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                    </button>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', flex: 1, minHeight: '36px' }}>
                                        <input
                                            type="checkbox"
                                            checked={allCatSelected}
                                            onChange={() => toggleCategorySelection(cat)}
                                            style={{ width: '19px', height: '19px', accentColor: 'var(--primary-400)', cursor: 'pointer' }}
                                        />
                                        <strong style={{ fontWeight: 700, fontSize: '0.95rem' }}>{cat}</strong>
                                        <span style={{
                                            background: selectedCount > 0 ? 'rgba(19,91,236,0.2)' : 'var(--surface-700)',
                                            color: selectedCount > 0 ? 'var(--primary-300)' : 'var(--surface-400)',
                                            borderRadius: '999px', padding: '2px 10px', fontSize: '0.75rem', fontWeight: 700, marginLeft: 'auto'
                                        }}>
                                            {selectedCount}/{topicList.length} temas ({totalCatCount} pgs)
                                        </span>
                                    </label>
                                </div>
                                {isExpanded && (
                                    <div style={{ padding: '0.5rem 0.85rem 0.6rem 2.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                        {topicList.map(topic => {
                                            const topicCount = questionDB.filter(q => q.category === cat && q.topic === topic && filteredByStatus.has(q.id)).length
                                            const isChecked = !!selectedTopics[cat]?.[topic]
                                            return (
                                                <label
                                                    key={topic}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                                                        cursor: topicCount === 0 ? 'not-allowed' : 'pointer',
                                                        opacity: topicCount === 0 ? 0.35 : 1,
                                                        padding: '0.45rem 0.65rem',
                                                        borderRadius: 'var(--radius)',
                                                        background: isChecked ? 'rgba(19,91,236,0.12)' : 'transparent',
                                                        border: `1px solid ${isChecked ? 'rgba(19,91,236,0.3)' : 'transparent'}`,
                                                        transition: 'all 0.15s ease',
                                                        minHeight: '40px'
                                                    }}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => topicCount > 0 && toggleTopicSelection(cat, topic)}
                                                        disabled={topicCount === 0}
                                                        style={{ width: '17px', height: '17px', accentColor: 'var(--primary-400)', cursor: topicCount === 0 ? 'not-allowed' : 'pointer' }}
                                                    />
                                                    <span style={{ fontSize: '0.9rem', fontWeight: isChecked ? 600 : 400, flex: 1 }}>{topic}</span>
                                                    <span style={{ color: isChecked ? 'var(--primary-300)' : 'var(--surface-400)', fontSize: '0.8rem', fontWeight: 600 }}>({topicCount})</span>
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Nº de Preguntas</h3>
                    {!isPremium && (
                        <span style={{ fontSize: '0.85rem', color: hasExceededQuestions ? 'var(--accent-red)' : 'var(--primary-400)', fontWeight: 600 }}>
                            Preguntas usadas: {usageStats.customQuestionsAnswered} / 20
                        </span>
                    )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <input
                        type="number"
                        min={1}
                        max={!isPremium ? Math.min(20, maxQuestions || 1) : (maxQuestions || 1)}
                        value={numQuestions}
                        onChange={e => {
                            const val = e.target.value
                            const num = parseInt(val) || 0
                            if (!isPremium && num > 20) {
                                setShowPaymentModal(true)
                                setNumQuestions('20')
                                return
                            }
                            setNumQuestions(val)
                        }}
                        onBlur={e => {
                            const val = parseInt(e.target.value) || 1
                            let clamped = Math.min(Math.max(val, 1), Math.max(1, maxQuestions))
                            if (!isPremium && clamped > 20) {
                                setShowPaymentModal(true)
                                clamped = 20
                            }
                            setNumQuestions(String(clamped))
                        }}
                        style={{
                            width: '90px', padding: '0.75rem', fontSize: '1.4rem', fontWeight: 800,
                            textAlign: 'center', background: 'var(--surface-800)', color: 'white',
                            border: '2px solid var(--primary-400)', borderRadius: 'var(--radius-xl)', outline: 'none',
                            boxShadow: '0 0 10px rgba(19,91,236,0.2)'
                        }}
                    />
                    <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--surface-400)' }}>
                            Máximo disponible: <strong style={{ color: 'white' }}>{!isPremium ? Math.min(20, maxQuestions) : maxQuestions}</strong> {!isPremium && maxQuestions > 20 && '(Límite free: 20)'}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--surface-400)', marginTop: '0.25rem' }}>
                            Tiempo estimado: <strong style={{ color: 'white' }}>
                                {timeEstimateH > 0 ? `${timeEstimateH}h ` : ''}{timeEstimateRem}min
                            </strong>
                        </div>
                    </div>
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {[10, 20, 40, 'Todas'].map(n => {
                            const targetVal = n === 'Todas' ? Math.max(1, maxQuestions) : Math.min(n, Math.max(1, maxQuestions))
                            const currentVal = parseInt(numQuestions) || 0
                            const isActive = n === 'Todas' ? currentVal === maxQuestions && maxQuestions > 0 : currentVal === n
                            
                            return (
                                <button
                                    key={n}
                                    type="button"
                                    onClick={() => {
                                        if (!isPremium && (n === 'Todas' || (typeof n === 'number' && n > 20) || targetVal > 20)) {
                                            setShowPaymentModal(true)
                                            setNumQuestions('20')
                                            return
                                        }
                                        setNumQuestions(String(targetVal))
                                    }}
                                    style={{
                                        padding: '0.5rem 0.9rem', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', fontWeight: 700,
                                        border: `2px solid ${isActive ? 'var(--primary-400)' : 'var(--surface-600)'}`,
                                        background: isActive ? 'var(--gradient-primary)' : 'var(--surface-800)',
                                        color: isActive ? '#fff' : 'var(--surface-300)', cursor: 'pointer',
                                        boxShadow: isActive ? '0 4px 12px rgba(19,91,236,0.4)' : 'none',
                                        transition: 'all 0.18s ease'
                                    }}
                                >
                                    {n}
                                </button>
                            )
                        })}
                    </div>
                </div>
                {!isPremium && (
                    <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#fef08a', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', padding: '0.5rem 0.85rem', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                        <span>👑 Plan Gratuito: máximo 20 preguntas por examen.</span>
                        <button type="button" onClick={() => setShowPaymentModal(true)} style={{ background: 'none', border: 'none', color: '#f59e0b', cursor: 'pointer', textDecoration: 'underline', fontWeight: 700, padding: 0 }}>
                            Desbloquear Ilimitado
                        </button>
                    </div>
                )}
            </div>

            {/* ── START BUTTON + ERROR WARNING ── */}
            <div style={{ marginTop: '1.5rem' }}>
                {createError && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.18)', border: '1.5px solid #ef4444',
                        borderRadius: 'var(--radius)', padding: '0.85rem 1rem', marginBottom: '0.75rem',
                        color: '#fca5a5', fontSize: '0.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem'
                    }}>
                        <AlertCircle size={18} color="#ef4444" style={{ flexShrink: 0 }} />
                        <span>{createError}</span>
                    </div>
                )}
                <button
                    onClick={handleStartExam}
                    disabled={maxQuestions === 0 || isCreating}
                    className="btn-primary btn-primary--full"
                    style={{
                        padding: '1.1rem', fontSize: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem',
                        opacity: (maxQuestions === 0 || isCreating) ? 0.5 : 1,
                        cursor: (maxQuestions === 0 || isCreating) ? 'not-allowed' : 'pointer',
                        boxShadow: (maxQuestions > 0 && !isCreating) ? '0 8px 25px rgba(19,91,236,0.45)' : 'none',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {isCreating ? (
                            <>
                                <Loader2 size={20} className="spin" />
                                <span>Creando examen...</span>
                            </>
                        ) : maxQuestions === 0 ? (
                            <>
                                <PlayCircle size={20} />
                                <span>Selecciona temas arriba para comenzar</span>
                            </>
                        ) : (
                            <>
                                <PlayCircle size={20} />
                                <span>Comenzar Examen · {Math.min(activeNum, maxQuestions)} Preguntas</span>
                            </>
                        )}
                    </div>
                    {maxQuestions > 0 && !isCreating && (
                        <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
                            {mode === 'timed' ? '⏱ Modo Tiempo · 1 min/pregunta' : '💡 Modo Tutor · Feedback inmediato'}
                        </span>
                    )}
                </button>
            </div>
        </div>
        {showLoginGate && (
            <LoginGateModal
                onClose={() => setShowLoginGate(false)}
                message="Inicia sesión para crear y guardar tus exámenes personalizados."
            />
        )}
        </>
    )
}

export default TestCreator

