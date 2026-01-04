import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Sidebar from '../components/Sidebar'
import '../styles/dashboard.css'

function AdminPanel() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()

  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedChapter, setSelectedChapter] = useState('all')
  const [selectedTopic, setSelectedTopic] = useState('all')
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})

  // Redirect non-admin users
  useEffect(() => {
    if (!isAdmin()) {
      navigate('/dashboard')
    }
  }, [isAdmin, navigate])

  useEffect(() => {
    fetchQuestions()
  }, [selectedChapter, selectedTopic])

  const fetchQuestions = async () => {
    setLoading(true)
    try {
      let query = supabase.table('questions').select('*')

      if (selectedChapter !== 'all') {
        query = query.eq('chapter', selectedChapter)
      }
      if (selectedTopic !== 'all') {
        query = query.eq('topic', selectedTopic)
      }

      const { data, error } = await query.order('id', { ascending: true }).limit(100)

      if (error) throw error
      setQuestions(data || [])
    } catch (error) {
      console.error('Error fetching questions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (question) => {
    setEditingId(question.id)
    setEditForm(question)
  }

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .table('questions')
        .update(editForm)
        .eq('id', editingId)

      if (error) throw error

      setQuestions(questions.map(q => q.id === editingId ? editForm : q))
      setEditingId(null)
      setEditForm({})
    } catch (error) {
      console.error('Error saving question:', error)
      alert('Error al guardar. Por favor intenta de nuevo.')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta pregunta?')) return

    try {
      const { error } = await supabase.table('questions').delete().eq('id', id)
      if (error) throw error
      setQuestions(questions.filter(q => q.id !== id))
    } catch (error) {
      console.error('Error deleting question:', error)
      alert('Error al eliminar. Por favor intenta de nuevo.')
    }
  }

  const chapters = ['Capítulo 1', 'Capítulo 2', 'Capítulo 3', 'Capítulo 4']
  const topics = ['Neurología', 'Endocrinología', 'Infectología', 'Dermatología']

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard__header">
          <h2 style={{ color: 'white', margin: 0 }}>Panel de Administración</h2>
        </header>

        <div className="dashboard-content" style={{ padding: '2rem' }}>
          {/* Filters */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Capítulo:</label>
              <select
                value={selectedChapter}
                onChange={(e) => setSelectedChapter(e.target.value)}
                style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #ddd' }}
              >
                <option value="all">Todos</option>
                {chapters.map(ch => (
                  <option key={ch} value={ch}>{ch}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Tema:</label>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #ddd' }}
              >
                <option value="all">Todos</option>
                {topics.map(topic => (
                  <option key={topic} value={topic}>{topic}</option>
                ))}
              </select>
            </div>

            <button
              onClick={fetchQuestions}
              style={{
                padding: '0.5rem 1.5rem',
                background: '#4EBDDB',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                alignSelf: 'flex-end'
              }}
            >
              Actualizar
            </button>
          </div>

          {/* Questions Count */}
          <div style={{ marginBottom: '1rem', color: '#666' }}>
            <strong>{questions.length}</strong> preguntas encontradas
          </div>

          {/* Questions Table */}
          {loading ? (
            <div>Cargando...</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '8px', overflow: 'hidden' }}>
                <thead style={{ background: '#f8f9fa' }}>
                  <tr>
                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>ID</th>
                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Pregunta</th>
                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Respuesta</th>
                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Tema</th>
                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Capítulo</th>
                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map(q => (
                    <tr key={q.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                      <td style={{ padding: '1rem' }}>{q.id}</td>
                      <td style={{ padding: '1rem', maxWidth: '300px' }}>
                        {editingId === q.id ? (
                          <textarea
                            value={editForm.question_text || ''}
                            onChange={(e) => setEditForm({ ...editForm, question_text: e.target.value })}
                            style={{ width: '100%', minHeight: '60px', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                          />
                        ) : (
                          <div style={{ fontSize: '0.9rem' }}>{q.question_text?.substring(0, 100)}...</div>
                        )}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {editingId === q.id ? (
                          <input
                            value={editForm.correct_answer || ''}
                            onChange={(e) => setEditForm({ ...editForm, correct_answer: e.target.value })}
                            style={{ width: '50px', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                          />
                        ) : (
                          <span style={{ fontWeight: 'bold', color: '#4EBDDB' }}>{q.correct_answer}</span>
                        )}
                      </td>
                      <td style={{ padding: '1rem' }}>{q.topic}</td>
                      <td style={{ padding: '1rem' }}>{q.chapter || 'N/A'}</td>
                      <td style={{ padding: '1rem' }}>
                        {editingId === q.id ? (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={handleSave} style={{ padding: '0.25rem 0.75rem', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                              Guardar
                            </button>
                            <button onClick={() => setEditingId(null)} style={{ padding: '0.25rem 0.75rem', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => handleEdit(q)} style={{ padding: '0.25rem 0.75rem', background: '#4EBDDB', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                              Editar
                            </button>
                            <button onClick={() => handleDelete(q.id)} style={{ padding: '0.25rem 0.75rem', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                              Eliminar
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default AdminPanel
