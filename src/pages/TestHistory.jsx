import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Sidebar from '../components/Sidebar'
import '../styles/dashboard.css'

function TestHistory() {
    const navigate = useNavigate()
    const [tests, setTests] = useState([])
    const [loading, setLoading] = useState(true)

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

    return (
        <div className="dashboard-layout">
            <Sidebar />

            <main className="dashboard-main">
                <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
                    <div className="header-section" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h1 style={{ fontSize: '2rem', color: '#1a3b5c', fontWeight: '700' }}>Historial de Exámenes</h1>
                        <span style={{ color: '#777' }}>Inicio</span>
                    </div>

                    <div className="history-card" style={{
                        background: '#fff',
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        padding: '1.5rem'
                    }}>

                        <div className="controls" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <div className="dropdown">
                                <span style={{ color: '#777', fontSize: '0.9rem' }}>Mostrar: Columnas ▼</span>
                            </div>
                            <div className="search">
                                <input
                                    type="text"
                                    placeholder="Buscar..."
                                    style={{
                                        padding: '0.5rem 1rem',
                                        border: '1px solid #ddd',
                                        borderRadius: '20px',
                                        outline: 'none'
                                    }}
                                />
                            </div>
                        </div>

                        <div className="table-responsive">
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                <thead>
                                    <tr style={{ color: '#999', textTransform: 'uppercase', fontSize: '0.8rem', borderBottom: '1px solid #f0f0f0' }}>
                                        <th style={{ padding: '1rem', textAlign: 'left' }}>Puntaje</th>
                                        <th style={{ padding: '1rem', textAlign: 'left' }}>Nombre/ID</th>
                                        <th style={{ padding: '1rem', textAlign: 'left' }}>Fecha</th>
                                        <th style={{ padding: '1rem', textAlign: 'left' }}>Modo</th>
                                        <th style={{ padding: '1rem', textAlign: 'left' }}># Preguntas</th>
                                        <th style={{ padding: '1rem', textAlign: 'center' }}>Estado</th>
                                        <th style={{ padding: '1rem', textAlign: 'right' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="7" style={{ padding: '2rem', textAlign: 'center' }}>Cargando...</td></tr>
                                    ) : tests.length === 0 ? (
                                        <tr><td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: '#777' }}>No has creado exámenes aún.</td></tr>
                                    ) : (
                                        tests.map(test => (
                                            <tr key={test.id} style={{ borderBottom: '1px solid #f5f5f5', color: '#444' }}>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{
                                                        width: '40px', height: '40px',
                                                        borderRadius: '50%',
                                                        background: '#f0f0f0',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: '0.8rem', fontWeight: 'bold', color: '#666'
                                                    }}>
                                                        {test.score || 0}%
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem', fontWeight: '500' }}>#{test.id.slice(0, 8)}</td>
                                                <td style={{ padding: '1rem' }}>{formatDate(test.created_at)}</td>
                                                <td style={{ padding: '1rem' }}>{getModeLabel(test.mode, test.time_limit_seconds)}</td>
                                                <td style={{ padding: '1rem' }}>{test.total_questions}</td>
                                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                    <span style={{
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: '20px',
                                                        fontSize: '0.8rem',
                                                        background: test.status === 'completed' ? '#dcfce7' : '#e0f2fe',
                                                        color: test.status === 'completed' ? '#166534' : '#0369a1'
                                                    }}>
                                                        {test.status === 'completed' ? 'Completado' : 'En Progreso'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                    {test.status !== 'completed' ? (
                                                        <button
                                                            onClick={() => navigate(`/test-runner/${test.id}`)}
                                                            style={{
                                                                background: 'none', border: 'none', cursor: 'pointer',
                                                                color: '#4EBDDB', fontSize: '1.2rem', marginRight: '0.5rem'
                                                            }}
                                                            title="Reanudar"
                                                        >
                                                            ▶️
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => navigate(`/test-runner/${test.id}`)} // Re-visit for review
                                                            style={{
                                                                background: 'none', border: 'none', cursor: 'pointer',
                                                                color: '#666', fontSize: '1.2rem', marginRight: '0.5rem'
                                                            }}
                                                            title="Analizar"
                                                        >
                                                            📊
                                                        </button>
                                                    )}
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
