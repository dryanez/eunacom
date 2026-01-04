import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Sidebar from '../components/Sidebar'
import QuestionDetailsModal from '../components/QuestionDetailsModal'
import '../styles/dashboard.css'

function AdminPanel() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()

  // State
  const [currentTab, setCurrentTab] = useState('data') // 'data' | 'stats'
  const [questions, setQuestions] = useState([])
  const [allStatsQuestions, setAllStatsQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(false)

  // Filters
  const [selectedChapter, setSelectedChapter] = useState('all')
  const [selectedTopic, setSelectedTopic] = useState('all')
  const [selectedFile, setSelectedFile] = useState('all')

  // Editing & Visiting
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [viewingQuestion, setViewingQuestion] = useState(null)

  // Redirect non-admin users
  useEffect(() => {
    if (!isAdmin()) {
      navigate('/dashboard')
    }
  }, [isAdmin, navigate])

  // Initial Fetch based on active tab
  useEffect(() => {
    if (currentTab === 'data') {
      fetchQuestions()
    } else {
      fetchStatistics()
    }
  }, [currentTab, selectedChapter, selectedTopic, selectedFile])

  const fetchQuestions = async () => {
    setLoading(true)
    try {
      let query = supabase.from('questions').select('*')

      if (selectedChapter !== 'all') query = query.eq('chapter', selectedChapter)
      if (selectedTopic !== 'all') query = query.eq('topic', selectedTopic)
      if (selectedFile !== 'all') query = query.eq('file_source', selectedFile)

      const { data, error } = await query.order('id', { ascending: true }).limit(100)

      if (error) throw error
      setQuestions(data || [])
    } catch (error) {
      console.error('Error fetching questions:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStatistics = async () => {
    setStatsLoading(true)
    try {
      // Fetch minimal data for statistics aggregation
      const { data, error } = await supabase
        .from('questions')
        .select('id, file_source, chapter, topic, video_url, explanation, tags')

      if (error) throw error
      setAllStatsQuestions(data || [])
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setStatsLoading(false)
    }
  }

  // Derive Statistics Grouped by File
  const fileStats = useMemo(() => {
    const stats = {}

    allStatsQuestions.forEach(q => {
      const file = q.file_source || 'Desconocido'
      if (!stats[file]) {
        stats[file] = {
          name: file,
          chapter: q.chapter || 'N/A',
          count: 0,
          missingVideo: 0,
          missingExplanation: 0,
          missingTags: 0
        }
      }
      stats[file].count++
      if (!q.video_url) stats[file].missingVideo++
      if (!q.explanation) stats[file].missingExplanation++
      if (!q.tags) stats[file].missingTags++
    })

    return Object.values(stats).sort((a, b) => a.chapter.localeCompare(b.chapter))
  }, [allStatsQuestions])

  // Derive unique lists for filters
  const fileSources = useMemo(() => {
    const sources = new Set(questions.map(q => q.file_source).filter(Boolean))
    return Array.from(sources).sort()
  }, [questions])

  // Actions
  const handleEdit = (question) => {
    setEditingId(question.id)
    setEditForm(question)
  }

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('questions')
        .update(editForm)
        .eq('id', editingId)

      if (error) throw error

      setQuestions(questions.map(q => q.id === editingId ? editForm : q))
      setEditingId(null)
      setEditForm({})
    } catch (error) {
      console.error('Error saving:', error)
      alert('Error al guardar.')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar pregunta?')) return
    try {
      const { error } = await supabase.from('questions').delete().eq('id', id)
      if (error) throw error
      setQuestions(questions.filter(q => q.id !== id))
    } catch (error) {
      console.error('Error deleting:', error)
    }
  }

  const chapters = ['Capítulo 1', 'Capítulo 2', 'Capítulo 3', 'Capítulo 4']
  const topics = ['Neurología', 'Endocrinología', 'Infectología', 'Dermatología', 'Cardiología', 'Respiratorio', 'Gastroenterología']

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard__header" style={{ justifyContent: 'space-between' }}>
          <h2 style={{ color: 'white', margin: 0 }}>Panel de Administración</h2>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => setCurrentTab('data')}
              style={{ padding: '0.5rem 1rem', borderRadius: '20px', border: 'none', background: currentTab === 'data' ? 'white' : 'rgba(255,255,255,0.2)', color: currentTab === 'data' ? '#4EBDDB' : 'white', cursor: 'pointer', fontWeight: 'bold' }}
            >
              📊 Explorador de Datos
            </button>
            <button
              onClick={() => setCurrentTab('stats')}
              style={{ padding: '0.5rem 1rem', borderRadius: '20px', border: 'none', background: currentTab === 'stats' ? 'white' : 'rgba(255,255,255,0.2)', color: currentTab === 'stats' ? '#4EBDDB' : 'white', cursor: 'pointer', fontWeight: 'bold' }}
            >
              📈 Estadísticas de Carga
            </button>
          </div>
        </header>

        <div className="dashboard-content" style={{ padding: '2rem' }}>

          {/* TAB: DATA EXPLORER */}
          {currentTab === 'data' && (
            <>
              {/* Filters */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '600' }}>Capítulo</label>
                  <select value={selectedChapter} onChange={e => setSelectedChapter(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px' }}>
                    <option value="all">Todos</option>
                    {chapters.map(ch => <option key={ch} value={ch}>{ch}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '600' }}>Tema</label>
                  <select value={selectedTopic} onChange={e => setSelectedTopic(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px' }}>
                    <option value="all">Todos</option>
                    {topics.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '600' }}>Archivo Fuente</label>
                  <select value={selectedFile} onChange={e => setSelectedFile(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px' }}>
                    <option value="all">Todos</option>
                    {/* Unique sources from current filtered set or fetch separately? For now uses current fetched set + distinct query if implemented properly. Here implies simple client filter logic for demo */}
                    <option disabled>Selecciona un archivo (filtra primero)</option>
                  </select>
                </div>
                <button onClick={fetchQuestions} style={{ background: '#4EBDDB', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Actualizar</button>
              </div>

              {/* Table */}
              {loading ? <div>Cargando preguntas...</div> : (
                <div style={{ overflowX: 'auto', background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                      <tr>
                        <th style={{ padding: '1rem', textAlign: 'left' }}>ID</th>
                        <th style={{ padding: '1rem', textAlign: 'left' }}>Pregunta</th>
                        <th style={{ padding: '1rem', textAlign: 'left' }}>Video?</th>
                        <th style={{ padding: '1rem', textAlign: 'left' }}>Tags?</th>
                        <th style={{ padding: '1rem', textAlign: 'left' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {questions.map(q => (
                        <tr key={q.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '1rem' }}>{q.id}</td>
                          <td style={{ padding: '1rem', maxWidth: '400px' }}>
                            {editingId === q.id ? (
                              <textarea value={editForm.question_text} onChange={e => setEditForm({ ...editForm, question_text: e.target.value })} style={{ width: '100%' }} />
                            ) : (
                              <div>
                                <div style={{ fontSize: '0.95rem' }}>{q.question_text?.substring(0, 80)}...</div>
                                <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.2rem' }}>{q.file_source} | {q.chapter}</div>
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '1rem' }}>{q.video_url ? '✅' : '❌'}</td>
                          <td style={{ padding: '1rem' }}>{q.tags ? '✅' : '❌'}</td>
                          <td style={{ padding: '1rem' }}>
                            {editingId === q.id ? (
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={handleSave} style={{ background: '#28a745', color: 'white', border: 'none', padding: '0.3rem 0.8rem', borderRadius: '4px' }}>Guardar</button>
                                <button onClick={() => setEditingId(null)} style={{ background: '#6c757d', color: 'white', border: 'none', padding: '0.3rem 0.8rem', borderRadius: '4px' }}>X</button>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={() => setViewingQuestion(q)} style={{ background: '#17a2b8', color: 'white', border: 'none', padding: '0.3rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}>👁️ Ver Info</button>
                                <button onClick={() => handleEdit(q)} style={{ background: '#ffc107', color: '#333', border: 'none', padding: '0.3rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}>✏️</button>
                                <button onClick={() => handleDelete(q.id)} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '0.3rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}>🗑️</button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {questions.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>No hay preguntas para estos filtros.</div>}
                </div>
              )}
            </>
          )}

          {/* TAB: STATISTICS */}
          {currentTab === 'stats' && (
            <div>
              {statsLoading ? <div>Analizando base de datos...</div> : (
                <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#343a40', color: 'white' }}>
                      <tr>
                        <th style={{ padding: '1rem', textAlign: 'left' }}>Archivo Fuente (CSV)</th>
                        <th style={{ padding: '1rem', textAlign: 'left' }}>Capítulo</th>
                        <th style={{ padding: '1rem', textAlign: 'center' }}>Total Preguntas</th>
                        <th style={{ padding: '1rem', textAlign: 'center' }}>% Videos</th>
                        <th style={{ padding: '1rem', textAlign: 'center' }}>% Explicaciones</th>
                        <th style={{ padding: '1rem', textAlign: 'center' }}>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fileStats.map((stat, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '1rem', fontWeight: '600' }}>{stat.name}</td>
                          <td style={{ padding: '1rem' }}>{stat.chapter}</td>
                          <td style={{ padding: '1rem', textAlign: 'center', fontSize: '1.2rem' }}>{stat.count}</td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            <span style={{ color: stat.missingVideo === 0 ? 'green' : 'orange' }}>
                              {Math.round(((stat.count - stat.missingVideo) / stat.count) * 100)}%
                            </span>
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            <span style={{ color: stat.missingExplanation === 0 ? 'green' : 'red' }}>
                              {Math.round(((stat.count - stat.missingExplanation) / stat.count) * 100)}%
                            </span>
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            {stat.missingVideo === 0 && stat.missingExplanation === 0 ? '✅ Completo' : '⚠️ Faltan Datos'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {fileStats.length === 0 && <div style={{ padding: '2rem', textAlign: 'center' }}>No hay datos subidos aún.</div>}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal */}
        {viewingQuestion && (
          <QuestionDetailsModal
            question={viewingQuestion}
            onClose={() => setViewingQuestion(null)}
          />
        )}
      </main>
    </div>
  )
}

export default AdminPanel
