import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ChevronDown, Play, Settings, Filter, CheckCircle } from 'lucide-react'
import '../styles/dashboard.css'

const AccordionSection = ({ title, children, defaultOpen = true, extraHeaderContent = null }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen)

    return (
        <div style={{
            background: 'white',
            borderRadius: '16px',
            overflow: 'hidden',
            marginBottom: '1.5rem',
            border: '1px solid #e5e7eb',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    padding: '1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.03), rgba(6, 182, 212, 0.03))',
                    transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, rgba(139, 92, 246, 0.06), rgba(6, 182, 212, 0.06))'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, rgba(139, 92, 246, 0.03), rgba(6, 182, 212, 0.03))'}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                    <h3 style={{
                        fontSize: '1.1rem',
                        color: '#374151',
                        margin: 0,
                        fontWeight: '700'
                    }}>{title}</h3>
                    {extraHeaderContent}
                </div>
                <ChevronDown
                    size={20}
                    color="#8b5cf6"
                    style={{
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease'
                    }}
                />
            </div>

            {isOpen && (
                <div style={{ padding: '1.5rem', borderTop: '1px solid #f3f4f6' }}>
                    {children}
                </div>
            )}
        </div>
    )
}

function TestEngine() {
    const [tutorMode, setTutorMode] = useState(true)
    const [timedMode, setTimedMode] = useState(false)
    const [selectedSubjects, setSelectedSubjects] = useState({})
    const navigate = useNavigate()

    // Raw Data
    const [allQuestions, setAllQuestions] = useState([])
    const [userProgress, setUserProgress] = useState({})
    const [loading, setLoading] = useState(true)

    // Filters
    const [statusFilters, setStatusFilters] = useState({
        unused: true,
        incorrect: false,
        marked: false,
        omitted: false,
        correct: false
    })

    const [numQuestions, setNumQuestions] = useState(0)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)

            // Helper for pagination
            const fetchAll = async (table, select, order = 'id') => {
                let allRows = []
                let page = 0
                const size = 1000
                while (true) {
                    const { data, error } = await supabase
                        .from(table)
                        .select(select)
                        .order(order, { ascending: true })
                        .range(page * size, (page + 1) * size - 1)

                    if (error) throw error
                    if (!data || data.length === 0) break

                    allRows = [...allRows, ...data]
                    if (data.length < size) break
                    page++
                }
                return allRows
            }

            console.log('🔄 Fetching all questions (paginated)...')
            // FETCH TEXT FOR DEDUPLICATION
            const questions = await fetchAll('questions', 'id, topic, chapter, question_text', 'created_at')
            console.log(`✅ Loaded ${questions.length} questions.`)

            console.log('🔄 Fetching all progress (paginated)...')
            // Note: progress might not have 'created_at', use 'id' or 'question_id' if possible?
            // user_progress usually has id. unique key is (user_id, question_id).
            // Let's assume 'id' exists or use 'question_id' for order? 
            // Better to use default order if PK exists. 
            // Check user_progress PK. Usually 'id'.
            // If not, order by question_id.
            const progress = await fetchAll('user_progress', 'question_id, is_correct, is_omitted, is_flagged', 'question_id')
            console.log(`✅ Loaded ${progress.length} progress records.`)

            // Map progress for O(1) lookup
            const progressMap = {}
            progress.forEach(p => {
                progressMap[p.question_id] = {
                    is_correct: p.is_correct,
                    is_marked: p.is_flagged || false,
                    is_omitted: p.is_omitted || false
                }
            })

            setAllQuestions(questions)
            setUserProgress(progressMap)

        } catch (error) {
            console.error('Error fetching data:', error)
            alert('Error cargando datos. Revisa la consola.')
        } finally {
            setLoading(false)
        }
    }

    // Dynamic filtering logic
    const { subjects, counts, totalAvailable } = useMemo(() => {
        const tempCounts = { unused: 0, incorrect: 0, marked: 0, omitted: 0, correct: 0 }
        const topicCounts = {}

        // Initialize topic counts
        allQuestions.forEach(q => {
            const topic = q.topic || 'Sin categoría';
            if (!topicCounts[topic]) topicCounts[topic] = 0;
        })

        allQuestions.forEach(q => {
            const status = userProgress[q.id]

            // Determine PRIMARY status for the count badges
            // A question can be multiple things (e.g. Incorrect AND Flagged).
            // We increment counters for ALL that apply.

            if (!status) { // Question has no entry in user_progress, thus "unused"
                tempCounts.unused++
            } else {
                if (status.is_omitted) tempCounts.omitted++
                if (status.is_marked) tempCounts.marked++

                // Correct/Incorrect logic (mutually exclusive usually, but check data)
                // If omitted, is it incorrect? Usually yes or neither. 
                // Let's assume if omitted, it's NOT correct or incorrect in this context, or just 'omitted'.
                // But typically user_progress has is_correct boolean.

                if (!status.is_omitted) { // Only count as correct/incorrect if not omitted
                    if (status.is_correct) tempCounts.correct++
                    else tempCounts.incorrect++
                }
            }

            // Filter Logic (OR)
            // Is this question included based on ACTIVE filters?

            let isIncludedByFilter = false

            if (!status) { // Question is unused
                if (statusFilters.unused) isIncludedByFilter = true
            } else { // Question has progress
                if (statusFilters.omitted && status.is_omitted) isIncludedByFilter = true
                if (statusFilters.marked && status.is_marked) isIncludedByFilter = true

                if (!status.is_omitted) { // Only consider correct/incorrect if not omitted
                    if (statusFilters.correct && status.is_correct) isIncludedByFilter = true
                    if (statusFilters.incorrect && !status.is_correct) isIncludedByFilter = true
                }
            }

            // Special case: If NO filters are checked, usually we show nothing (0).
            const anyFilterActive = Object.values(statusFilters).some(f => f)
            if (!anyFilterActive) isIncludedByFilter = false

            if (isIncludedByFilter) {
                const topic = q.topic || 'Sin categoría'
                topicCounts[topic] = (topicCounts[topic] || 0) + 1
            }
        })

        // Format subjects list
        const subjectList = Object.keys(topicCounts).map(topic => ({
            name: topic,
            count: topicCounts[topic]
        })).sort((a, b) => a.name.localeCompare(b.name))

        const totalAvailable = subjectList.reduce((acc, s) => acc + s.count, 0)

        return { subjects: subjectList, counts: tempCounts, totalAvailable }
    }, [allQuestions, userProgress, statusFilters])


    // ... useMemo block ends

    const EUNACOM_BLUEPRINT = [
        // Medicina Interna (67 q)
        { dbTopic: 'Cardiología', count: 10 },
        { dbTopic: 'Respiratorio', count: 10 },
        { dbTopic: 'Gastroenterología', count: 10 },
        { dbTopic: 'Endocrinología', count: 10 }, // Merged Diabetes (5) + Endo (5)
        { dbTopic: 'Neurología', count: 5 },
        { dbTopic: 'Nefrología', count: 5 },
        { dbTopic: 'Hematología', count: 5 },
        { dbTopic: 'Infectología', count: 4 },
        { dbTopic: 'Reumatología', count: 4 },
        { dbTopic: 'Geriatría', count: 4, fallback: 'Medicina Interna' }, // Fallback if missing

        // Cirugía (20 q)
        { dbTopic: 'Cirugía y Anestesia', count: 10 },
        { dbTopic: 'Traumatología', count: 5 },
        { dbTopic: 'Urología', count: 5 },

        // Pediatría (29 q)
        { dbTopic: 'Pediatría', count: 20 }, // Includes General Ped
        { dbTopic: 'Neonatología', count: 9 }, // Explicit Neonatología slice

        // Obs/Gin (29 q)
        { dbTopic: 'Ginecología', count: 15 },
        { dbTopic: 'Obstetricia', count: 14 },

        // Others
        { dbTopic: 'Psiquiatría', count: 14 },
        { dbTopic: 'Salud Pública', count: 9 },

        // Especialidades (12 q)
        { dbTopic: 'Dermatología', count: 4 },
        { dbTopic: 'Oftalmología', count: 4 },
        { dbTopic: 'Otorrinolaringología', count: 4 }
    ]

    const handleGenerateSimulacro = () => {
        if (loading) return

        const selectedIds = []
        const usedIndices = new Set()

        // Helper to pick N random questions for a topic
        const pickRandom = (topic, n, fallbackTopic = null) => {
            // Filter candidates: Matches Topic AND Unused in this test AND (Ideally) Unused in history?
            // For Simulacro, we usually allow reused questions, but prioritize new?
            // Let's just pick random from available.

            let candidates = allQuestions.filter(q =>
                (q.topic === topic || (q.topic && q.topic.includes(topic)))
            )

            // Fallback
            if (candidates.length < n && fallbackTopic) {
                const fallbackCandidates = allQuestions.filter(q => q.topic === fallbackTopic)
                candidates = [...candidates, ...fallbackCandidates]
            }

            // Shuffle
            for (let i = candidates.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
            }

            // Select
            let count = 0
            for (const q of candidates) {
                if (count >= n) break
                if (!usedIndices.has(q.id)) {
                    selectedIds.push(q.id)
                    usedIndices.add(q.id)
                    count++
                }
            }

            // Log shortage
            if (count < n) console.warn(`Simulacro: Not enough questions for ${topic}. Wanted ${n}, got ${count}.`)
        }

        console.log('🚀 Generating Simulacro EUNACOM...')

        EUNACOM_BLUEPRINT.forEach(item => {
            pickRandom(item.dbTopic, item.count, item.fallback)
        })

        console.log(`✅ Generated ${selectedIds.length} questions.`)

        // Navigate to Test Taker
        // Assuming we pass IDs via state or specific route? 
        // Existing logic likely passes filters.
        // If we want exact IDs, we might need to modify TestTaker or pass them in state.
        navigate('/test-taker', { state: { mode: 'simulacro', questionIds: selectedIds } })
    }

    const handleCreateTest = async () => {
        if (!numQuestions || numQuestions <= 0) {
            alert('Por favor, ingresa el número de preguntas.')
            return
        }

        // Check if any status filter is active
        const anyStatusFilterActive = Object.values(statusFilters).some(f => f)
        const anySubjectSelected = Object.keys(selectedSubjects).length > 0

        // If NO status filter is active AND no subjects selected, show error
        if (!anyStatusFilterActive && !anySubjectSelected) {
            alert('Por favor, selecciona al menos un filtro de estado o una asignatura.')
            return
        }

        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('No user found')


            // 1. Filter Questions
            const eligibleCandidates = [] // Full objects, not just IDs

            // Re-run filtering logic to get Candidates
            allQuestions.forEach(q => {
                const topic = q.topic || 'Sin categoría'

                // Subject Filter Logic:
                const shouldIncludeSubject = anyStatusFilterActive && !anySubjectSelected
                    ? true
                    : selectedSubjects[topic]

                if (!shouldIncludeSubject) return

                // Status Filter logic
                const status = userProgress[q.id]
                let isIncludedByFilter = false

                if (!status) { // Unused
                    if (statusFilters.unused) isIncludedByFilter = true
                } else {
                    if (statusFilters.omitted && status.is_omitted) isIncludedByFilter = true
                    if (statusFilters.marked && status.is_marked) isIncludedByFilter = true

                    if (!status.is_omitted) {
                        if (statusFilters.correct && status.is_correct) isIncludedByFilter = true
                        if (statusFilters.incorrect && !status.is_correct) isIncludedByFilter = true
                    }
                }

                // If no filter selected, exclude
                const anyFilterActive = Object.values(statusFilters).some(f => f)
                if (!anyFilterActive) isIncludedByFilter = false

                if (isIncludedByFilter) {
                    eligibleCandidates.push(q)
                }
            })

            if (eligibleCandidates.length === 0) {
                alert('No hay preguntas disponibles con los filtros seleccionados.')
                setLoading(false)
                return
            }

            // DEDUPLICATE CANDIDATES BY TEXT
            const uniqueMap = new Map()
            eligibleCandidates.forEach(q => {
                const text = q.question_text ? q.question_text.trim() : `MISSING_TEXT_${q.id}`
                if (!uniqueMap.has(text)) {
                    uniqueMap.set(text, q)
                }
            })
            const uniqueCandidates = Array.from(uniqueMap.values())
            const eligibleQuestionIds = uniqueCandidates.map(q => q.id)

            // 2. Select Random Questions
            // Shuffle array
            const shuffled = eligibleQuestionIds.sort(() => 0.5 - Math.random())
            // Slice to numQuestions
            const selectedIds = shuffled.slice(0, parseInt(numQuestions))

            // 3. Create Test Session
            const { data, error } = await supabase
                .from('tests')
                .insert({
                    user_id: user.id,
                    mode: timedMode ? 'timed' : 'tutor',
                    time_limit_seconds: timedMode ? selectedIds.length * 60 : null, // 1 min per question
                    total_questions: selectedIds.length,
                    questions: selectedIds,
                    status: 'in_progress'
                })
                .select() // Important: Return the inserted row

            if (error) throw error

            // 4. Redirect
            if (data && data.length > 0) {
                navigate(`/test-runner/${data[0].id}`)
            } else {
                navigate('/history')
            }

        } catch (error) {
            console.error('Error creating test:', error)
            alert('Error al crear el examen. Por favor intenta de nuevo.')
        } finally {
            setLoading(false)
        }
    }

    const toggleSubject = (name) => {
        // Only allow toggling if count > 0
        const subject = subjects.find(s => s.name === name)
        if (subject && subject.count === 0) return

        setSelectedSubjects(prev => ({
            ...prev,
            [name]: !prev[name]
        }))
    }

    const handleSelectAll = (e) => {
        e.stopPropagation();
        // Only select those with count > 0
        const viableSubjects = subjects.filter(s => s.count > 0)
        const allSelected = viableSubjects.every(s => selectedSubjects[s.name])

        const newSelection = {}
        viableSubjects.forEach(s => newSelection[s.name] = !allSelected)
        setSelectedSubjects(newSelection)
    }

    const toggleStatusFilter = (key) => {
        setStatusFilters(prev => ({ ...prev, [key]: !prev[key] }))
    }

    // Max questions logic: Sum of counts of SELECTED subjects
    const maxQuestions = subjects
        .filter(s => selectedSubjects[s.name])
        .reduce((acc, s) => acc + s.count, 0)

    const viableSubjects = subjects.filter(s => s.count > 0)
    const allSelected = viableSubjects.length > 0 && viableSubjects.every(s => selectedSubjects[s.name])

    // State for recent tests
    const [recentTests, setRecentTests] = useState([])

    useEffect(() => {
        fetchData()
        fetchRecentTests()
    }, [])

    const fetchRecentTests = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from('tests')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(5)

            if (error) throw error
            setRecentTests(data || [])
        } catch (error) {
            console.error('Error fetching recent tests:', error)
        }
    }

    // ... (Existing Functions) ...

    return (
        <div className="dashboard-content">
            <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{
                        fontSize: '2rem',
                        fontWeight: '800',
                        background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        margin: 0
                    }}>
                        Motor de Exámenes
                    </h1>
                    <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
                        Configura tu examen personalizado
                    </p>
                </div>


                {/* Test Mode Accordion */}

                <AccordionSection title="Modo de Examen">
                    <div style={{ display: 'flex', gap: '2rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                            <div
                                onClick={() => setTutorMode(!tutorMode)}
                                style={{
                                    width: '40px', height: '24px', background: tutorMode ? '#4EBDDB' : '#ddd',
                                    borderRadius: '20px', position: 'relative', transition: 'background 0.2s'
                                }}
                            >
                                <div style={{
                                    width: '18px', height: '18px', background: 'white', borderRadius: '50%',
                                    position: 'absolute', top: '3px', left: tutorMode ? '19px' : '3px', transition: 'left 0.2s'
                                }} />
                            </div>
                            <span style={{ color: '#555', fontWeight: '500' }}>Tutor</span>
                        </label>

                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                            <div
                                onClick={() => setTimedMode(!timedMode)}
                                style={{
                                    width: '40px', height: '24px', background: timedMode ? '#4EBDDB' : '#ddd',
                                    borderRadius: '20px', position: 'relative', transition: 'background 0.2s'
                                }}
                            >
                                <div style={{
                                    width: '18px', height: '18px', background: 'white', borderRadius: '50%',
                                    position: 'absolute', top: '3px', left: timedMode ? '19px' : '3px', transition: 'left 0.2s'
                                }} />
                            </div>
                            <span style={{ color: '#555', fontWeight: '500' }}>Con tiempo</span>
                        </label>
                    </div>
                </AccordionSection>

                {/* Question Status Filters */}
                <AccordionSection title="Estado de Preguntas">
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center' }}>
                        {/* Unused */}
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={statusFilters.unused}
                                onChange={() => toggleStatusFilter('unused')}
                                style={{ width: '20px', height: '20px', accentColor: '#4EBDDB' }}
                            />
                            <span style={{ color: '#555' }}>Sin usar</span>
                            <span style={{ border: '1px solid #ddd', borderRadius: '12px', padding: '1px 8px', fontSize: '0.8rem', color: '#4EBDDB', fontWeight: 'bold' }}>{counts.unused}</span>
                        </label>

                        {/* Incorrect */}
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={statusFilters.incorrect}
                                onChange={() => toggleStatusFilter('incorrect')}
                                style={{ width: '20px', height: '20px', accentColor: '#4EBDDB' }}
                            />
                            <span style={{ color: '#555' }}>Incorrectas</span>
                            <span style={{ border: '1px solid #ddd', borderRadius: '12px', padding: '1px 8px', fontSize: '0.8rem', color: '#999' }}>{counts.incorrect}</span>
                        </label>

                        {/* Marked */}
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={statusFilters.marked}
                                onChange={() => toggleStatusFilter('marked')}
                                style={{ width: '20px', height: '20px', accentColor: '#4EBDDB' }}
                            />
                            <span style={{ color: '#555' }}>Marcadas</span>
                            <span style={{ border: '1px solid #ddd', borderRadius: '12px', padding: '1px 8px', fontSize: '0.8rem', color: '#999' }}>{counts.marked}</span>
                        </label>

                        {/* Omitted */}
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={statusFilters.omitted}
                                onChange={() => toggleStatusFilter('omitted')}
                                style={{ width: '20px', height: '20px', accentColor: '#4EBDDB' }}
                            />
                            <span style={{ color: '#555' }}>Omitidas</span>
                            <span style={{ border: '1px solid #ddd', borderRadius: '12px', padding: '1px 8px', fontSize: '0.8rem', color: '#999' }}>{counts.omitted}</span>
                        </label>

                        {/* Correct */}
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={statusFilters.correct}
                                onChange={() => toggleStatusFilter('correct')}
                                style={{ width: '20px', height: '20px', accentColor: '#4EBDDB' }}
                            />
                            <span style={{ color: '#555' }}>Correctas</span>
                            <span style={{ border: '1px solid #ddd', borderRadius: '12px', padding: '1px 8px', fontSize: '0.8rem', color: '#999' }}>{counts.correct}</span>
                        </label>
                    </div>
                </AccordionSection>


                {/* Subjects Accordion */}
                <AccordionSection
                    title="Asignaturas"
                    extraHeaderContent={
                        <span style={{ fontSize: '0.9rem', color: '#777', fontWeight: '400' }}>
                            Total Filtrado <span style={{ background: '#eefcfd', color: '#4EBDDB', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '600' }}>{totalAvailable}</span>
                        </span>
                    }
                >
                    <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                            onClick={handleSelectAll}
                            style={{ background: 'none', border: 'none', color: '#4EBDDB', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem' }}
                        >
                            {allSelected ? 'Deseleccionar todo' : 'Seleccionar todo'}
                        </button>
                    </div>

                    {loading ? (
                        <div>Cargando asignaturas...</div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem 2rem' }}>
                            {subjects.map(subject => {
                                const isDisabled = subject.count === 0
                                return (
                                    <label
                                        key={subject.name}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            cursor: isDisabled ? 'not-allowed' : 'pointer',
                                            padding: '0.25rem 0',
                                            opacity: isDisabled ? 0.5 : 1
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={!!selectedSubjects[subject.name] && !isDisabled}
                                            onChange={() => toggleSubject(subject.name)}
                                            disabled={isDisabled}
                                            style={{ width: '18px', height: '18px', accentColor: '#4EBDDB', cursor: isDisabled ? 'not-allowed' : 'pointer' }}
                                        />
                                        <span style={{ color: '#444', fontSize: '0.95rem', flex: 1 }}>{subject.name}</span>
                                        <span style={{ background: isDisabled ? '#f0f0f0' : '#eefcfd', color: isDisabled ? '#999' : '#4EBDDB', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600' }}>
                                            {subject.count}
                                        </span>
                                    </label>
                                )
                            })}
                        </div>
                    )}
                </AccordionSection>

                {/* Number of Questions Accordion */}
                <AccordionSection title="Nº de Preguntas">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <input
                            type="number"
                            value={numQuestions}
                            onChange={(e) => setNumQuestions(e.target.value)}
                            style={{
                                padding: '0.75rem',
                                border: '2px solid #4EBDDB',
                                borderRadius: '8px',
                                width: '100px',
                                fontSize: '1.2rem',
                                fontWeight: 'bold',
                                color: '#333',
                                background: '#fff',
                                textAlign: 'center'
                            }}
                        />
                        <span style={{ color: '#777', fontSize: '1rem' }}>
                            Max permitido: <span style={{ fontWeight: '600', color: '#333' }}>{maxQuestions}</span>
                        </span>
                    </div>
                </AccordionSection>

                {/* Submit Buttons */}
                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button
                        onClick={handleCreateTest}
                        style={{
                            padding: '1rem 3rem',
                            background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontWeight: '700',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            boxShadow: '0 4px 16px rgba(139, 92, 246, 0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                    >
                        <Play size={20} />
                        CREAR EXAMEN
                    </button>
                </div>

            </div>
        </main >
        </div >
    )
}


export default TestEngine
