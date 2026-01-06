import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Play, Eye, BarChart2, Trash2, Search, ChevronDown } from 'lucide-react'
import '../styles/dashboard.css'

function TestHistory() {
    const navigate = useNavigate()
    const [tests, setTests] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchTests()
    }, [])

    const fetchTests = async () => {
        try {
            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) return

            const { data, error } = await supabase
                .from('tests')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            setTests(data)
        } catch (error) {
            console.error('Error fetching tests:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return '-'
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const getModeLabel = (mode, timeLimit) => {
        if (mode === 'timed') return `Con Tiempo (${timeLimit / 60}m)`
        return 'Tutor (Sin límite)'
    }

    const handleDelete = async (e, id) => {
        e.stopPropagation()
        if (!confirm('¿Estás seguro de que quieres eliminar este examen permanentemente?')) return

        try {
            const { error } = await supabase.from('tests').delete().eq('id', id)
            if (error) throw error
            setTests(tests.filter(t => t.id !== id))
        } catch (error) {
            console.error('Error deleting test:', error)
            alert('Error al eliminar. Intenta nuevamente.')
        }
    }

    const filteredTests = tests.filter(test =>
        test.id.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="dashboard-layout">
            <Sidebar />

            <main className="dashboard-main">
                <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
                    {/* Header */}
                    <div style={{
                        marginBottom: '2rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '1rem'
                    }}>
                        <h1 style={{
                            fontSize: '2rem',
                            fontWeight: '800',
                            background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            margin: 0
                        }}>
                            Historial de Exámenes
                        </h1>
                        <button
                            onClick={() => navigate('/test')}
                            style={{
                                background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                                color: 'white',
                                border: 'none',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '12px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                        >
                            <Play size={18} />
                            Nuevo Examen
                        </button>
                    </div>

                    {/* Main Card */}
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        padding: '2rem',
                        border: '1px solid var(--color-gray-200)'
                    }}>
                        {/* Search Bar */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '2rem',
                            flexWrap: 'wrap',
                            gap: '1rem'
                        }}>
                            <div style={{
                                position: 'relative',
                                flex: '1 1 300px',
                                maxWidth: '400px'
                            }}>
                                <Search
                                    size={18}
                                    style={{
                                        position: 'absolute',
                                        left: '1rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: '#9ca3af'
                                    }}
                                />
                                <input
                                    type="text"
                                    placeholder="Buscar por ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem 0.75rem 3rem',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '12px',
                                        outline: 'none',
                                        fontSize: '0.95rem',
                                        transition: 'all 0.2s'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                />
                            </div>
                            <div style={{
                                color: '#6b7280',
                                fontSize: '0.9rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <span style={{ fontWeight: '600' }}>{filteredTests.length}</span>
                                exámenes
                            </div>
                        </div>

                        {/* Table */}
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                <thead>
                                    <tr style={{
                                        color: '#6b7280',
                                        textTransform: 'uppercase',
                                        fontSize: '0.75rem',
                                        fontWeight: '700',
                                        letterSpacing: '0.05em',
                                        borderBottom: '2px solid #f3f4f6'
                                    }}>
                                        <th style={{ padding: '1rem', textAlign: 'left' }}>Puntaje</th>
                                        <th style={{ padding: '1rem', textAlign: 'left' }}>ID</th>
                                        <th style={{ padding: '1rem', textAlign: 'left' }}>Fecha</th>
                                        <th style={{ padding: '1rem', textAlign: 'left' }}>Modo</th>
                                        <th style={{ padding: '1rem', textAlign: 'left' }}>Preguntas</th>
                                        <th style={{ padding: '1rem', textAlign: 'center' }}>Estado</th>
                                        <th style={{ padding: '1rem', textAlign: 'right' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
                                                Cargando...
                                            </td>
                                        </tr>
                                    ) : filteredTests.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
                                                {searchTerm ? 'No se encontraron exámenes con ese ID.' : 'No has creado exámenes aún.'}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredTests.map(test => (
                                            <tr
                                                key={test.id}
                                                style={{
                                                    borderBottom: '1px solid #f3f4f6',
                                                    transition: 'background 0.2s',
                                                    cursor: 'pointer'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{
                                                        width: '50px',
                                                        height: '50px',
                                                        borderRadius: '12px',
                                                        background: `linear-gradient(135deg, ${test.score >= 70 ? '#10b981' : test.score >= 50 ? '#f59e0b' : '#ef4444'}, ${test.score >= 70 ? '#059669' : test.score >= 50 ? '#d97706' : '#dc2626'})`,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '0.9rem',
                                                        fontWeight: '700',
                                                        color: 'white',
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                                    }}>
                                                        {test.score || 0}%
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem', fontWeight: '600', color: '#374151', fontFamily: 'monospace' }}>
                                                    #{test.id.slice(0, 8)}
                                                </td>
                                                <td style={{ padding: '1rem', color: '#6b7280' }}>
                                                    {formatDate(test.created_at)}
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <span style={{
                                                        padding: '0.375rem 0.75rem',
                                                        borderRadius: '8px',
                                                        fontSize: '0.8rem',
                                                        fontWeight: '500',
                                                        background: test.mode === 'timed' ? '#fef3c7' : '#dbeafe',
                                                        color: test.mode === 'timed' ? '#92400e' : '#1e40af'
                                                    }}>
                                                        {getModeLabel(test.mode, test.time_limit_seconds)}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1rem', fontWeight: '600', color: '#374151' }}>
                                                    {test.total_questions}
                                                </td>
                                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                    <span style={{
                                                        padding: '0.375rem 0.875rem',
                                                        borderRadius: '20px',
                                                        fontSize: '0.8rem',
                                                        fontWeight: '600',
                                                        background: test.status === 'completed' ? '#dcfce7' : '#e0f2fe',
                                                        color: test.status === 'completed' ? '#166534' : '#0369a1'
                                                    }}>
                                                        {test.status === 'completed' ? 'Completado' : 'En Progreso'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                        {test.status !== 'completed' ? (
                                                            <button
                                                                onClick={() => navigate(`/test-runner/${test.id}`)}
                                                                style={{
                                                                    background: 'linear-gradient(135deg, #10b981, #059669)',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    padding: '0.5rem',
                                                                    borderRadius: '8px',
                                                                    cursor: 'pointer',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    transition: 'all 0.2s',
                                                                    boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)'
                                                                }}
                                                                title="Reanudar"
                                                                onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                                                                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                                                            >
                                                                <Play size={16} />
                                                            </button>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    onClick={() => navigate(`/test-runner/${test.id}`)}
                                                                    style={{
                                                                        background: '#f3f4f6',
                                                                        color: '#6b7280',
                                                                        border: 'none',
                                                                        padding: '0.5rem',
                                                                        borderRadius: '8px',
                                                                        cursor: 'pointer',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        transition: 'all 0.2s'
                                                                    }}
                                                                    title="Revisar Respuestas"
                                                                    onMouseEnter={(e) => {
                                                                        e.target.style.background = '#8b5cf6'
                                                                        e.target.style.color = 'white'
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        e.target.style.background = '#f3f4f6'
                                                                        e.target.style.color = '#6b7280'
                                                                    }}
                                                                >
                                                                    <Eye size={16} />
                                                                </button>
                                                                <button
                                                                    onClick={() => navigate(`/analysis/${test.id}`)}
                                                                    style={{
                                                                        background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                                                                        color: 'white',
                                                                        border: 'none',
                                                                        padding: '0.5rem',
                                                                        borderRadius: '8px',
                                                                        cursor: 'pointer',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        transition: 'all 0.2s',
                                                                        boxShadow: '0 2px 4px rgba(139, 92, 246, 0.3)'
                                                                    }}
                                                                    title="Ver Análisis"
                                                                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                                                                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                                                                >
                                                                    <BarChart2 size={16} />
                                                                </button>
                                                            </>
                                                        )}
                                                        <button
                                                            onClick={(e) => handleDelete(e, test.id)}
                                                            style={{
                                                                background: '#fee2e2',
                                                                color: '#dc2626',
                                                                border: 'none',
                                                                padding: '0.5rem',
                                                                borderRadius: '8px',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                transition: 'all 0.2s'
                                                            }}
                                                            title="Eliminar"
                                                            onMouseEnter={(e) => {
                                                                e.target.style.background = '#dc2626'
                                                                e.target.style.color = 'white'
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.target.style.background = '#fee2e2'
                                                                e.target.style.color = '#dc2626'
                                                            }}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default TestHistory
