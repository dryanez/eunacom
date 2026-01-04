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

  // Views: 'files' (list of CSVs) | 'questions' (list of questions for a file)
  const [currentView, setCurrentView] = useState('files')
  const [selectedFileObj, setSelectedFileObj] = useState(null) // The file object being viewed

  // Data
  const [allQuestionsRaw, setAllQuestionsRaw] = useState([]) // Minimal data for stats
  const [fileQuestions, setFileQuestions] = useState([]) // Full data for current file
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingQuestions, setLoadingQuestions] = useState(false)

  // Question Editing
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [viewingQuestion, setViewingQuestion] = useState(null)

  // Filters (Global for Files List)
  const [selectedChapter, setSelectedChapter] = useState('all')
  const [selectedTopic, setSelectedTopic] = useState('all')

  // Auth Check
  useEffect(() => {
    if (!isAdmin()) navigate('/dashboard')
  }, [isAdmin, navigate])

  // Load ALL Stats Data on Mount (Columns: id, file_source, chapter, topic, flags)
  useEffect(() => {
    fetchStatsData()
  }, [])

  const fetchStatsData = async () => {
    setLoadingStats(true)
    try {
      // Fetch lightweight data for the "Files" overview
      const { data, error } = await supabase
        .from('questions')
        .select('id, file_source, chapter, topic, video_url, explanation, tags')

      if (error) throw error
      setAllQuestionsRaw(data || [])
    } catch (error) {
      console.error('Error fetching global stats:', error)
    } finally {
      setLoadingStats(false)
    }
  }

  // Load Questions for a Specific File
  const fetchQuestionsForFile = async (filename) => {
    setLoadingQuestions(true)
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('file_source', filename)
        .order('id', { ascending: true })

      if (error) throw error
      setFileQuestions(data || [])
    } catch (error) {
      console.error('Error fetching file questions:', error)
    } finally {
      setLoadingQuestions(false)
    }
  }

  // Derived: List of Files with Stats
  const fileList = useMemo(() => {
    const stats = {}

    allQuestionsRaw.forEach(q => {
      // Filter logic applied to the FILE LIST
      if (selectedChapter !== 'all' && q.chapter !== selectedChapter) return
      if (selectedTopic !== 'all' && q.topic !== selectedTopic) return

      const file = q.file_source || 'Sin Archivo'
      if (!stats[file]) {
        stats[file] = {
          name: file,
          chapter: q.chapter || 'N/A',
          topic: q.topic || 'N/A',
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

    return Object.values(stats).sort((a, b) => {
      // Sort by Chapter then Topic then Name
      if (a.chapter !== b.chapter) return a.chapter.localeCompare(b.chapter)
      if (a.topic !== b.topic) return a.topic.localeCompare(b.topic)
      return a.name.localeCompare(b.name)
    })
  }, [allQuestionsRaw, selectedChapter, selectedTopic])

  // Derived: Filtering lists
  const chapters = ['Capítulo 1', 'Capítulo 2', 'Capítulo 3', 'Capítulo 4']
  const topics = Array.from(new Set(allQuestionsRaw.map(q => q.topic).filter(Boolean))).sort()

  // Navigation Handlers
  const handleOpenFile = (fileStats) => {
    setSelectedFileObj(fileStats)
    fetchQuestionsForFile(fileStats.name)
    setCurrentView('questions')
  }

  const handleBack = () => {
    setCurrentView('files')
    setSelectedFileObj(null)
    setFileQuestions([])
  }

  // Actions
  const handleSave = async () => {
    try {
      const { error } = await supabase.from('questions').update(editForm).eq('id', editingId)
      if (error) throw error
      setFileQuestions(fileQuestions.map(q => q.id === editingId ? editForm : q))
      setEditingId(null)
      setEditForm({})
    } catch (error) {
      alert('Error al guardar')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar?')) return
    try {
      await supabase.from('questions').delete().eq('id', id)
      setFileQuestions(fileQuestions.filter(q => q.id !== id))
    } catch (error) { alert('Error al eliminar') }
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard__header" style={{ justifyContent: 'space-between' }}>
          <h2 style={{ color: 'white', margin: 0 }}>
            {currentView === 'files' ? 'Gestor de Archivos CSV' : `📂 ${selectedFileObj?.name}`}
          </h2>
          {currentView === 'questions' && (
            <button onClick={handleBack} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}>
              ⬅️ Volver a Archivos
            </button>
          )}
        </header>

        <div className="dashboard-content" style={{ padding: '2rem' }}>

          {/* VIEW 1: FILES LIST */}
          {currentView === 'files' && (
            <>
              {/* Global Filters */}
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <select value={selectedChapter} onChange={e => setSelectedChapter(e.target.value)} style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #ddd', minWidth: '150px' }}>
                  <option value="all">Todos los Capítulos</option>
                  {chapters.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={selectedTopic} onChange={e => setSelectedTopic(e.target.value)} style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #ddd', minWidth: '150px' }}>
                  <option value="all">Todos los Temas</option>
                  {topics.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <button onClick={fetchStatsData} style={{ background: '#4EBDDB', color: 'white', border: 'none', padding: '0 1rem', borderRadius: '8px', cursor: 'pointer' }}>🔄</button>
              </div>

              {loadingStats ? <div>Analizando base de datos...</div> : (
                <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f1f3f5' }}>
                      <tr>
                        <th style={{ padding: '1rem', textAlign: 'left' }}>Archivo CSV</th>
                        <th style={{ padding: '1rem', textAlign: 'left' }}>Capítulo / Tema</th>
                        <th style={{ padding: '1rem', textAlign: 'center' }}>Preguntas</th>
                        <th style={{ padding: '1rem', textAlign: 'center' }}>Videos</th>
                        <th style={{ padding: '1rem', textAlign: 'center' }}>Tags</th>
                        <th style={{ padding: '1rem', textAlign: 'right' }}>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fileList.map((file, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #eee', transition: 'background 0.2s' }} className="hover-row">
                          <td style={{ padding: '1rem', fontWeight: '600', color: '#333' }}>
                            📄 {file.name}
                          </td>
                          <td style={{ padding: '1rem', color: '#666', fontSize: '0.9rem' }}>
                            {file.chapter} <br /> {file.topic}
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 'bold' }}>
                            {file.count}
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            <span style={{ color: file.missingVideo === 0 ? '#28a745' : '#ffc107', fontWeight: 'bold' }}>
                              {Math.round(((file.count - file.missingVideo) / file.count) * 100)}%
                            </span>
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            <span style={{ color: file.missingTags === 0 ? '#28a745' : '#ffc107', fontWeight: 'bold' }}>
                              {Math.round(((file.count - file.missingTags) / file.count) * 100)}%
                            </span>
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'right' }}>
                            <button
                              onClick={() => handleOpenFile(file)}
                              style={{ background: '#4EBDDB', color: 'white', border: 'none', padding: '0.4rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                            >
                              Ver Preguntas ↣
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {fileList.length === 0 && <div style={{ padding: '2rem', textAlign: 'center' }}>No se encontraron archivos cargados.</div>}
                </div>
              )}
            </>
          )}

          {/* VIEW 2: QUESTIONS LIST */}
          {currentView === 'questions' && (
            <>
              <div style={{ marginBottom: '1rem', display: 'flex', gap: '2rem', background: '#e9ecef', padding: '1rem', borderRadius: '8px' }}>
                <div><strong>Archivo:</strong> {selectedFileObj.name}</div>
                <div><strong>Total:</strong> {selectedFileObj.count} preguntas</div>
              </div>

              {loadingQuestions ? <div>Cargando preguntas de {selectedFileObj.name}...</div> : (
                <div style={{ overflowX: 'auto', background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f8f9fa' }}>
                      <tr>
                        <th style={{ padding: '1rem', textAlign: 'left', width: '50px' }}>ID</th>
                        <th style={{ padding: '1rem', textAlign: 'left' }}>Pregunta</th>
                        <th style={{ padding: '1rem', textAlign: 'center' }}>Video</th>
                        <th style={{ padding: '1rem', textAlign: 'center' }}>Tags</th>
                        <th style={{ padding: '1rem', textAlign: 'right' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fileQuestions.map(q => (
                        <tr key={q.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '1rem' }}>{q.id}</td>
                          <td style={{ padding: '1rem' }}>
                            {editingId === q.id ? (
                              <textarea value={editForm.question_text || ''} onChange={e => setEditForm({ ...editForm, question_text: e.target.value })} style={{ width: '100%', minHeight: '60px' }} />
                            ) : (
                              <div style={{ maxHeight: '80px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                                {q.question_text}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>{q.video_url ? '✅' : '❌'}</td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>{q.tags ? '✅' : '❌'}</td>
                          <td style={{ padding: '1rem', textAlign: 'right' }}>
                            {editingId === q.id ? (
                              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                <button onClick={handleSave} style={{ background: '#28a745', color: 'white', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px' }}>Guardar</button>
                                <button onClick={() => setEditingId(null)} style={{ background: '#6c757d', color: 'white', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px' }}>X</button>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                <button onClick={() => setViewingQuestion(q)} style={{ background: '#17a2b8', color: 'white', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer' }}>👁️</button>
                                <button onClick={() => { setEditingId(q.id); setEditForm(q); }} style={{ background: '#ffc107', color: 'black', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer' }}>✏️</button>
                                <button onClick={() => handleDelete(q.id)} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer' }}>🗑️</button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

        </div>

        {/* Modal */}
        {viewingQuestion && <QuestionDetailsModal question={viewingQuestion} onClose={() => setViewingQuestion(null)} />}
      </main>
    </div>
  )
}

export default AdminPanel
