import React, { useState, useEffect, useMemo } from 'react'
import {
    PlayCircle, Clock, CheckCircle2, Circle, AlertCircle, Flag,
    ChevronDown, ChevronRight, ChevronLeft, RefreshCw, BookOpen, Loader2,
    Sparkles, ArrowRight, ArrowLeft, Check, Timer, Lightbulb, Crown,
    ListChecks, FolderTree, Hash, Filter, Layers
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useSubscription } from '../contexts/SubscriptionContext'
import PaymentModal from '../components/PaymentModal'
import { fetchProgress, createTest, genId } from '../lib/api'
import LoginGateModal from '../components/LoginGateModal'
import LoadingScreen from '../components/LoadingScreen'
import BancoPerfil from '../components/banco/BancoPerfil'
import { fetchBancoIndex, fetchBancoByIds, toRunnerQuestion, TIPO_NAMES_CORTOS, TIPO_ORDER } from '../lib/banco'
import { useSearchParams } from 'react-router-dom'
import '../components/redesign/testcreator.css'

const TestCreator = () => {
    const navigate = useNavigate()
    const { user } = useAuth()
    const { isPremium, usageStats, hasExceededQuestions, freemiumMode } = useSubscription()
    const [mode, setMode] = useState('tutor')
    // Modo de navegación del banco: 'examen' (crear examen, el de siempre) | 'arbol' (por área y tema) | 'codigo' (por código del Perfil)
    const [searchParams, setSearchParams] = useSearchParams()
    const [bancoMode, setBancoModeState] = useState(() => {
        const fromUrl = searchParams.get('modo')
        if (['examen', 'arbol', 'codigo'].includes(fromUrl)) return fromUrl
        try { const saved = localStorage.getItem('eunacom_banco_mode'); if (['examen', 'arbol', 'codigo'].includes(saved)) return saved } catch { /* sin storage */ }
        return 'examen'
    })
    const setBancoMode = (m) => {
        setBancoModeState(m)
        try { localStorage.setItem('eunacom_banco_mode', m) } catch { /* sin storage */ }
        setSearchParams(m === 'examen' ? {} : { modo: m }, { replace: true })
    }
    const [numQuestions, setNumQuestions] = useState('10')
    const [loading, setLoading] = useState(true)
    const [isCreating, setIsCreating] = useState(false)
    const [createError, setCreateError] = useState('')
    const [userProgress, setUserProgress] = useState({})
    const [propioDB, setPropioDB] = useState([])        // questionDB.json (banco propio)
    const [bancoIdx, setBancoIdx] = useState({ rows: [], propioTipo: {}, tipos: TIPO_NAMES_CORTOS }) // índice liviano (nuevas + tipo de las propias)
    // Banco completo, sin distinguir fuente; cada pregunta lleva su tipo de situación ('1'..'5', '0' sin clasificar)
    // Salud Pública es el Módulo 4 del EUNACOM (en los datos venía dentro del Módulo 2)
    const toModulo = q => (/salud p[uú]blica/i.test(q.topic || '') ? { ...q, category: 'Módulo 4' } : q)
    const questionDB = useMemo(() => [
        ...propioDB.map(q => toModulo({ ...q, tipo: bancoIdx.propioTipo[q.id] || '0' })),
        ...bancoIdx.rows.map(toModulo),
    ], [propioDB, bancoIdx])
    // Tipos de situación excluidos dentro de una especialidad marcada: { [cat]: { [topic]: { [tipo]: true } } }
    const [excludedTipos, setExcludedTipos] = useState({})
    const toggleTipo = (cat, topic, tipo) => setExcludedTipos(prev => {
        const cur = prev[cat]?.[topic] || {}
        return { ...prev, [cat]: { ...prev[cat], [topic]: { ...cur, [tipo]: !cur[tipo] } } }
    })
    const [showLoginGate, setShowLoginGate] = useState(false)
    const [showPaymentModal, setShowPaymentModal] = useState(false)

    // Mobile Step-by-Step State (Step 1: Modo, Step 2: Estado, Step 3: Temas, Step 4: Cantidad)
    const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 768)
    const [mobileStep, setMobileStep] = useState(1)

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

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
            const [db, idx] = await Promise.all([
                fetch('/data/questionDB.json').then(r => r.json()),
                fetchBancoIndex(),
            ])
            setPropioDB(db)
            setBancoIdx(idx)

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
    const { counts, filteredByStatus, subjects, topicCounts, tipoCounts } = useMemo(() => {
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

        // Build per-topic and per-tipo counts (questions that pass status filter)
        const tipoMap = {} // cat -> topic -> tipo -> count
        questionDB.forEach(q => {
            if (!filteredIds.has(q.id)) return
            const cat = q.category || 'General'
            const topic = q.topic || 'Sin categoría'
            if (!topicMap[cat]) topicMap[cat] = {}
            topicMap[cat][topic] = (topicMap[cat][topic] || 0) + 1
            const tm = (tipoMap[cat] ??= {})[topic] ??= {}
            tm[q.tipo || '0'] = (tm[q.tipo || '0'] || 0) + 1
        })

        const subjects = Object.entries(topicMap).reduce((acc, [cat, topics]) => {
            Object.entries(topics).forEach(([topic, count]) => {
                acc.push({ cat, topic, count })
            })
            return acc
        }, [])

        return { counts, filteredByStatus: filteredIds, subjects, topicCounts: topicMap, tipoCounts: tipoMap }
    }, [questionDB, userProgress, statusFilters])

    // --- Questions currently selected by tab + topic checkboxes ---
    const selectedQuestions = useMemo(() => {
        const result = []
        questionDB.forEach(q => {
            if (!filteredByStatus.has(q.id)) return
            const cat = q.category || 'General'
            const topic = q.topic || 'Sin categoría'
            if (!selectedTopics[cat]?.[topic]) return
            if (excludedTipos[cat]?.[topic]?.[q.tipo || '0']) return
            result.push(q)
        })
        return result
    }, [questionDB, filteredByStatus, selectedTopics, excludedTipos])

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
        if (!isPremium && remainingFreeQuestions <= 0) {
            setShowPaymentModal(true)
            setCreateError('Has alcanzado el límite de 20 preguntas respondidas en tu Plan Gratuito. ¡Actualiza a Premium para responder más preguntas!')
            return
        }
        const requestedNum = parseInt(numQuestions) || 1
        if (!isPremium && requestedNum > remainingFreeQuestions) {
            setShowPaymentModal(true)
            setCreateError(`Te quedan ${remainingFreeQuestions} preguntas disponibles en tu Plan Gratuito (límite total de 20). ¡Pásate a Premium para responder sin límites!`)
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
            let picked = shuffled.slice(0, n)
            // Las preguntas nuevas (rs2026) vienen del índice sin enunciado: se bajan de la API por id
            const rsIds = picked.filter(q => q.fuente === 'rs2026').map(q => q.id)
            if (rsIds.length) {
                const byId = Object.fromEntries((await fetchBancoByIds(rsIds)).map(q => [q.id, toRunnerQuestion(q)]))
                picked = picked.map(q => (q.fuente === 'rs2026' ? byId[q.id] : q)).filter(Boolean)
            }
            const questionIds = picked.map(q => q.id)
            const total = picked.length
            const testId = genId()

            await createTest({
                id: testId,
                userId: user.id,
                mode,
                timeLimitSeconds: mode === 'timed' ? total * 60 : null,
                totalQuestions: total,
                questions: questionIds
            })

            navigate('/test-runner', { state: { testId, questions: picked } })
        } catch (err) {
            console.error('Full error:', err)
            setCreateError('Error al crear el examen: ' + (err.message || String(err)))
            setIsCreating(false)
        }
    }

    const remainingFreeQuestions = useMemo(() => {
        if (isPremium) return 99999
        return Math.max(0, 20 - (usageStats?.customQuestionsAnswered || 0))
    }, [isPremium, usageStats?.customQuestionsAnswered])

    const statusConfig = [
        { key: 'unused', label: 'Sin usar', color: '#38bdf8', icon: BookOpen },
        { key: 'incorrect', label: 'Incorrectas', color: '#f87171', icon: AlertCircle },
        { key: 'omitted', label: 'Omitidas', color: '#fbbf24', icon: Clock },
        { key: 'marked', label: 'Marcadas', color: '#a78bfa', icon: Flag },
        { key: 'correct', label: 'Correctas', color: '#34d399', icon: CheckCircle2 }
    ]

    if (loading && bancoMode === 'examen') return <LoadingScreen context="test" message="Cargando base de preguntas..." />
    if (isCreating) return <LoadingScreen context="test" message="Generando tu examen..." />

    // ── Toggle de navegación del banco (Crear examen | Por área y tema | Por código) ──
    const BANCO_MODES = [
        { id: 'examen', label: 'Crear examen', short: 'Examen', icon: ListChecks, hint: 'Elige temas, estado y cantidad' },
        { id: 'arbol', label: 'Por área y tema', short: 'Área y tema', icon: FolderTree, hint: 'Área › Especialidad › Tipo › Tema del Perfil 2026' },
        { id: 'codigo', label: 'Por código', short: 'Código', icon: Hash, hint: 'Escribe un código del Perfil (p. ej. 1.01.2)' },
    ]
    const renderBancoToggle = () => (
        <div role="tablist" aria-label="Modo del banco" className="mn-tc-tabs">
            {BANCO_MODES.map(m => {
                const active = bancoMode === m.id
                const Icon = m.icon
                return (
                    <button key={m.id} type="button" role="tab" aria-selected={active} title={m.hint} onClick={() => setBancoMode(m.id)} className={`mn-tc-tab${active ? ' is-on' : ''}`}>
                        <Icon size={16} />
                        <span className="l">{m.label}</span>
                        <span className="s">{m.short}</span>
                    </button>
                )
            })}
        </div>
    )

    const renderHero = (eyebrow, title, subtitle, extra) => (
        <div className="mn-tc-hero">
            <div className="mn-tc-eyebrow">{eyebrow}</div>
            <div className="mn-tc-hero-row">
                <h1 className="mn-tc-title">{title}</h1>
                {extra}
            </div>
            <p className="mn-tc-sub">{subtitle}</p>
        </div>
    )

    const renderBancoPerfil = () => (
        <div className="mn-tc">
            {renderHero('Banco de preguntas', bancoMode === 'arbol' ? 'Banco por área y tema' : 'Banco por código', bancoMode === 'arbol' ? 'Navega el Perfil de Conocimientos EUNACOM 2026 y practica un tema completo' : 'Busca un código del Perfil (o un prefijo) y practica todas sus preguntas')}
            {renderBancoToggle()}
            <div className="mn-tc-perfil">
                <BancoPerfil modo={bancoMode} />
            </div>
        </div>
    )

    const renderCardHead = (Icon, title, sub, right) => (
        <div className="mn-tc-card-h">
            <span className="ico"><Icon size={17} /></span>
            <div className="txt">
                <h3>{title}</h3>
                {sub}
            </div>
            {right}
        </div>
    )

    // ── SUB-COMPONENT: Mode Section ──
    const renderModeSection = () => (
        <section className="mn-tc-card">
            {renderCardHead(PlayCircle, 'Modo de Examen')}
            <div className="mn-tc-modes">
                {[
                    { id: 'tutor', label: 'Modo Tutor', icon: Lightbulb, desc: 'Feedback inmediato y explicaciones clínicas después de cada respuesta.' },
                    { id: 'timed', label: 'Modo Tiempo', icon: Timer, desc: 'Simula condiciones reales del EUNACOM (1 min por pregunta).' }
                ].map(m => {
                    const isActive = mode === m.id
                    const Icon = m.icon
                    return (
                        <button key={m.id} type="button" onClick={() => setMode(m.id)} aria-pressed={isActive} className={`mn-tc-mode${isActive ? ' is-on' : ''}`}>
                            <span className="mi"><Icon size={18} /></span>
                            <span className="mt">
                                <span className="mh">
                                    <span className="ml">{m.label}</span>
                                    {isActive ? <CheckCircle2 size={18} className="mc on" /> : <Circle size={18} className="mc" />}
                                </span>
                                <span className="md">{m.desc}</span>
                            </span>
                        </button>
                    )
                })}
            </div>
        </section>
    )

    // ── SUB-COMPONENT: Status Filters ──
    const renderStatusFilters = () => (
        <section className="mn-tc-card">
            {renderCardHead(Filter, 'Estado de Preguntas',
                <p>Filtra qué preguntas incluir según tu historial</p>,
                !loading && (
                    <button type="button" onClick={fetchData} className="mn-tc-icobtn" title="Actualizar" aria-label="Actualizar">
                        <RefreshCw size={15} />
                    </button>
                )
            )}
            <div className="mn-tc-status">
                {statusConfig.map(({ key, label, color, icon: Icon }) => {
                    const isChecked = !!statusFilters[key]
                    return (
                        <button
                            key={key}
                            type="button"
                            onClick={() => toggleStatus(key)}
                            aria-pressed={isChecked}
                            className={`mn-tc-st${isChecked ? ' is-on' : ''}`}
                            style={{ '--c': color }}
                        >
                            <Icon size={15} className="si" />
                            <span className="sl">{label}</span>
                            <span className="sn">{counts[key]}</span>
                        </button>
                    )
                })}
            </div>
        </section>
    )

    // ── SUB-COMPONENT: Topics & Categories ──
    const renderTopicsSection = () => (
        <section className="mn-tc-card">
            {renderCardHead(Layers, 'Temas y Especialidades',
                <p className={maxQuestions > 0 ? 'mn-tc-ok' : 'mn-tc-warn'}>
                    {maxQuestions} pregunta{maxQuestions !== 1 ? 's' : ''} disponibles seleccionadas
                </p>,
                <button
                    type="button"
                    onClick={allTopicsSelected ? handleDeselectAll : handleSelectAllTopics}
                    className="mn-tc-link"
                >
                    {allTopicsSelected ? 'Deseleccionar todo' : 'Seleccionar todo'}
                </button>
            )}
            <div className="mn-tc-cats">
                {Object.keys(categories).sort().map(cat => {
                    const topics = categories[cat]
                    const topicList = Object.keys(topics).sort()
                    const isExpanded = !!expandedCategories[cat]
                    const totalCatCount = topicList.reduce((acc, t) => acc + (topicCounts[cat]?.[t] || 0), 0)
                    const selectedCount = topicList.filter(t => selectedTopics[cat]?.[t]).length
                    const allCatSelected = topicList.length > 0 && selectedCount === topicList.length

                    return (
                        <div key={cat} className={`mn-tc-cat${isExpanded ? ' is-open' : ''}`}>
                            <div className="mn-tc-cat-h">
                                <button
                                    type="button"
                                    onClick={() => toggleCategoryExpand(cat)}
                                    className="mn-tc-exp"
                                    aria-label={isExpanded ? "Colapsar categoría" : "Expandir categoría"}
                                >
                                    {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                </button>
                                <label className="mn-tc-cat-l">
                                    <input
                                        type="checkbox"
                                        className="mn-tc-chk"
                                        checked={allCatSelected}
                                        onChange={() => toggleCategorySelection(cat)}
                                    />
                                    <strong>{cat}</strong>
                                    <span className={`mn-tc-badge${selectedCount > 0 ? ' is-on' : ''}`}>
                                        {selectedCount}/{topicList.length} ({totalCatCount} pgs)
                                    </span>
                                </label>
                            </div>
                            {isExpanded && (
                                <div className="mn-tc-topics">
                                    {topicList.map(topic => {
                                        const topicCount = topicCounts[cat]?.[topic] || 0
                                        const isChecked = !!selectedTopics[cat]?.[topic]
                                        const porTipo = tipoCounts[cat]?.[topic] || {}
                                        const tiposDelTema = TIPO_ORDER.filter(t => porTipo[t] > 0)
                                        const excl = excludedTipos[cat]?.[topic] || {}
                                        const topicSel = tiposDelTema.reduce((acc, t) => acc + (excl[t] ? 0 : porTipo[t]), 0)
                                        return (
                                            <div key={topic}>
                                            <label className={`mn-tc-topic${isChecked ? ' is-on' : ''}${topicCount === 0 ? ' is-off' : ''}`}>
                                                <input
                                                    type="checkbox"
                                                    className="mn-tc-chk sm"
                                                    checked={isChecked}
                                                    onChange={() => topicCount > 0 && toggleTopicSelection(cat, topic)}
                                                    disabled={topicCount === 0}
                                                />
                                                <span className="tt">{topic}</span>
                                                <span className="tn">({isChecked && topicSel !== topicCount ? `${topicSel}/${topicCount}` : topicCount})</span>
                                            </label>
                                            {isChecked && tiposDelTema.length > 1 && (
                                                <div className="mn-tc-tipos">
                                                    {tiposDelTema.map(t => {
                                                        const on = !excl[t]
                                                        return (
                                                            <button key={t} type="button" onClick={() => toggleTipo(cat, topic, t)} aria-pressed={on} className={`mn-tc-tipo${on ? ' is-on' : ''}`}>
                                                                {on ? <Check size={12} /> : null}{TIPO_NAMES_CORTOS[t]} <span>{porTipo[t]}</span>
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            )}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </section>
    )

    // ── SUB-COMPONENT: Number of Questions ──
    const renderQuestionsCount = () => (
        <section className="mn-tc-card">
            {renderCardHead(Hash, 'Nº de Preguntas', null,
                !isPremium && (
                    <span className={`mn-tc-used${hasExceededQuestions ? ' is-over' : ''}`}>
                        Usadas: {usageStats.customQuestionsAnswered} / 20
                    </span>
                )
            )}
            <div className="mn-tc-count">
                <input
                    type="number"
                    className="mn-tc-num"
                    min={1}
                    max={!isPremium ? Math.min(remainingFreeQuestions, maxQuestions || 1) : (maxQuestions || 1)}
                    value={numQuestions}
                    onChange={e => {
                        const val = e.target.value
                        const num = parseInt(val) || 0
                        if (!isPremium && num > remainingFreeQuestions) {
                            setShowPaymentModal(true)
                            setNumQuestions(String(Math.max(1, remainingFreeQuestions)))
                            return
                        }
                        setNumQuestions(val)
                    }}
                    onBlur={e => {
                        const val = parseInt(e.target.value) || 1
                        let clamped = Math.min(Math.max(val, 1), Math.max(1, maxQuestions))
                        if (!isPremium && clamped > remainingFreeQuestions) {
                            setShowPaymentModal(true)
                            clamped = Math.max(1, remainingFreeQuestions)
                        }
                        setNumQuestions(String(clamped))
                    }}
                />
                <div className="mn-tc-meta">
                    <div>
                        Disponibles: <strong>{!isPremium ? Math.min(remainingFreeQuestions, maxQuestions) : maxQuestions}</strong> {!isPremium && maxQuestions > remainingFreeQuestions && `(Free restante: ${remainingFreeQuestions})`}
                    </div>
                    <div>
                        <Clock size={13} /> Tiempo estimado: <strong>
                            {timeEstimateH > 0 ? `${timeEstimateH}h ` : ''}{timeEstimateRem}min
                        </strong>
                    </div>
                </div>
                <div className="mn-tc-presets">
                    {[10, 20, 40, 'Todas'].map(n => {
                        const targetVal = n === 'Todas' ? Math.max(1, maxQuestions) : Math.min(n, Math.max(1, maxQuestions))
                        const currentVal = parseInt(numQuestions) || 0
                        const isActive = n === 'Todas' ? currentVal === maxQuestions && maxQuestions > 0 : currentVal === n

                        return (
                            <button
                                key={n}
                                type="button"
                                aria-pressed={isActive}
                                className={`mn-tc-preset${isActive ? ' is-on' : ''}`}
                                onClick={() => {
                                    if (!isPremium && (n === 'Todas' || (typeof n === 'number' && n > remainingFreeQuestions) || targetVal > remainingFreeQuestions)) {
                                        setShowPaymentModal(true)
                                        setNumQuestions(String(Math.max(1, Math.min(20, remainingFreeQuestions))))
                                        return
                                    }
                                    setNumQuestions(String(targetVal))
                                }}
                            >
                                {n}
                            </button>
                        )
                    })}
                </div>
            </div>
            {!isPremium && (
                <div className="mn-tc-free sm">
                    <span><Crown size={14} /> Plan Gratuito: máximo 20 preguntas por examen.</span>
                    <button type="button" onClick={() => setShowPaymentModal(true)}>
                        Desbloquear Ilimitado
                    </button>
                </div>
            )}
        </section>
    )

    // ── SUB-COMPONENT: Start Button & Errors ──
    const renderStartButton = () => (
        <div className="mn-tc-startwrap">
            {createError && (
                <div className="mn-tc-err" role="alert">
                    <AlertCircle size={18} />
                    <span>{createError}</span>
                </div>
            )}
            <button
                type="button"
                onClick={handleStartExam}
                disabled={maxQuestions === 0 || isCreating}
                className="mn-tc-start"
            >
                <span className="r">
                    {isCreating ? (
                        <>
                            <Loader2 size={20} className="spin" />
                            <span>Creando examen...</span>
                        </>
                    ) : maxQuestions === 0 ? (
                        <>
                            <PlayCircle size={20} />
                            <span>Selecciona temas para comenzar</span>
                        </>
                    ) : (
                        <>
                            <PlayCircle size={20} />
                            <span>Comenzar Examen · {Math.min(activeNum, maxQuestions)} Preguntas</span>
                        </>
                    )}
                </span>
                {maxQuestions > 0 && !isCreating && (
                    <span className="s">
                        {mode === 'timed' ? <><Timer size={12} /> Modo Tiempo · 1 min/pregunta</> : <><Lightbulb size={12} /> Modo Tutor · Feedback inmediato</>}
                    </span>
                )}
            </button>
        </div>
    )

    // ── MOBILE STEP WIZARD RENDER ──
    const mobileStepsList = [
        { num: 1, title: 'Modo', desc: 'Tutor o Tiempo' },
        { num: 2, title: 'Estado', desc: 'Filtros de preguntas' },
        { num: 3, title: 'Temas', desc: 'Especialidades' },
        { num: 4, title: 'Cantidad', desc: 'Resumen e Inicio' },
    ]

    const renderMobileWizard = () => (
        <div className="mn-tc mn-tc--wiz">
            {renderHero('Banco de preguntas', 'Crear Examen', 'Configura tu examen personalizado',
                <span className="mn-tc-steppill">Paso {mobileStep} de 4</span>
            )}
            {renderBancoToggle()}

            {/* Interactive Step Pills */}
            <div className="mn-tc-steps">
                {mobileStepsList.map(s => {
                    const isCurrent = mobileStep === s.num
                    const isPassed = mobileStep > s.num
                    return (
                        <button
                            key={s.num}
                            type="button"
                            onClick={() => setMobileStep(s.num)}
                            className={`mn-tc-step${isCurrent ? ' is-on' : ''}${isPassed ? ' is-done' : ''}`}
                            aria-current={isCurrent ? 'step' : undefined}
                        >
                            <i>{isPassed ? <Check size={11} strokeWidth={3} /> : s.num}</i>
                            <span>{s.title}</span>
                        </button>
                    )
                })}
            </div>

            {/* Step 1: Mode */}
            {mobileStep === 1 && (
                <div>
                    {renderModeSection()}
                    <div className="mn-tc-nav">
                        <button type="button" onClick={() => setMobileStep(2)} className="mn-tc-nb pri full">
                            <span>Siguiente: Estado de Preguntas</span>
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            )}

            {/* Step 2: Question Status Filters */}
            {mobileStep === 2 && (
                <div>
                    {renderStatusFilters()}
                    <div className="mn-tc-nav">
                        <button type="button" onClick={() => setMobileStep(1)} className="mn-tc-nb">
                            <ArrowLeft size={16} /> Modo
                        </button>
                        <button type="button" onClick={() => setMobileStep(3)} className="mn-tc-nb pri">
                            <span>Siguiente: Temas</span>
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Topics & Specialties */}
            {mobileStep === 3 && (
                <div>
                    {renderTopicsSection()}
                    <div className="mn-tc-nav">
                        <button type="button" onClick={() => setMobileStep(2)} className="mn-tc-nb">
                            <ArrowLeft size={16} /> Estado
                        </button>
                        <button type="button" onClick={() => setMobileStep(4)} disabled={maxQuestions === 0} className="mn-tc-nb pri">
                            <span>Siguiente: Cantidad ({maxQuestions})</span>
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Step 4: Number of Questions & Final Start */}
            {mobileStep === 4 && (
                <div>
                    {/* Summary Card */}
                    <div className="mn-tc-sum">
                        <div className="mn-tc-eyebrow"><Sparkles size={13} /> Resumen de tu Examen</div>
                        <div className="row">
                            <span>Modo</span>
                            <strong>{mode === 'timed' ? <><Timer size={13} /> Tiempo (1 min/Q)</> : <><Lightbulb size={13} /> Modo Tutor</>}</strong>
                        </div>
                        <div className="row">
                            <span>Preguntas en banco seleccionadas</span>
                            <strong className="ok">{maxQuestions} disponibles</strong>
                        </div>
                    </div>

                    {renderQuestionsCount()}

                    <div className="mn-tc-nav mn-tc-nav--end">
                        <button type="button" onClick={() => setMobileStep(3)} className="mn-tc-nb">
                            <ArrowLeft size={16} /> Temas
                        </button>
                        <div className="grow">
                            {renderStartButton()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )

    // ── DESKTOP UNIFIED VIEW RENDER ──
    const renderDesktopView = () => (
        <div className="mn-tc">
            {renderHero('Banco de preguntas', 'Crear Examen', 'Configura tu examen personalizado')}
            {renderBancoToggle()}

            {!isPremium && (
                <div className="mn-tc-free">
                    <span>
                        <Crown size={15} /> Plan Gratuito: {usageStats?.customQuestionsAnswered || 0} de 20 preguntas respondidas en total. {remainingFreeQuestions > 0 ? `(Te quedan ${remainingFreeQuestions} preguntas disponibles)` : '(Has alcanzado el límite free)'}
                    </span>
                    <button type="button" onClick={() => setShowPaymentModal(true)}>
                        Desbloquear Ilimitado
                    </button>
                </div>
            )}

            {renderModeSection()}
            {renderStatusFilters()}
            {renderTopicsSection()}
            {renderQuestionsCount()}
            {renderStartButton()}
        </div>
    )

    return (
        <>
            {showPaymentModal && <PaymentModal onClose={() => setShowPaymentModal(false)} />}
            {bancoMode !== 'examen' ? renderBancoPerfil() : isMobile ? renderMobileWizard() : renderDesktopView()}
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
