import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { fetchClases, saveClase, deleteClase, genId } from '../lib/api'
import {
  Video, ChevronRight, BookOpen, HelpCircle, Trash2,
  Upload, X, ChevronDown, ChevronUp, CheckCircle2, XCircle
} from 'lucide-react'

/* ─── Interactive Quiz ─── */
function QuizSection({ quiz }) {
  const [selected, setSelected] = useState({})

  const handleSelect = (qi, optId) => {
    if (selected[qi]) return
    setSelected(prev => ({ ...prev, [qi]: optId }))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {quiz.map((q, qi) => {
        const picked = selected[qi]
        const answered = !!picked
        return (
          <div key={qi} className="card" style={{ padding: '1.25rem' }}>
            <p style={{ fontWeight: 600, marginBottom: '1rem', lineHeight: 1.5 }}>
              {qi + 1}. {q.questionText}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {q.options.map(opt => {
                const isSelected = picked === opt.id
                const isCorrect = opt.isCorrect
                let bg = 'var(--surface-700)'
                let border = 'var(--border-color)'
                if (answered) {
                  if (isCorrect) { bg = 'rgba(52,211,153,0.12)'; border = 'var(--success-500)' }
                  else if (isSelected) { bg = 'rgba(248,113,113,0.12)'; border = 'var(--danger-500)' }
                  else { bg = 'var(--surface-800)'; border = 'var(--border-color)' }
                }
                return (
                  <div key={opt.id}>
                    <button
                      onClick={() => handleSelect(qi, opt.id)}
                      disabled={answered}
                      style={{
                        width: '100%', textAlign: 'left', padding: '0.75rem 1rem',
                        background: bg, border: `1px solid ${border}`,
                        borderRadius: '8px', color: 'var(--text-primary)',
                        cursor: answered ? 'default' : 'pointer',
                        opacity: answered && !isCorrect && !isSelected ? 0.45 : 1,
                        transition: 'all 0.2s', fontSize: '0.9rem'
                      }}
                    >
                      <strong style={{ marginRight: '0.5rem' }}>{opt.id})</strong>{opt.text}
                    </button>
                    {answered && (isSelected || isCorrect) && (
                      <div style={{
                        padding: '0.6rem 0.8rem', marginTop: '0.3rem', borderRadius: '6px',
                        fontSize: '0.82rem', lineHeight: 1.5,
                        background: isCorrect ? 'rgba(52,211,153,0.08)' : 'rgba(248,113,113,0.08)',
                        color: isCorrect ? 'var(--success-500)' : 'var(--danger-500)',
                        display: 'flex', alignItems: 'flex-start', gap: '0.4rem'
                      }}>
                        {isCorrect ? <CheckCircle2 size={14} style={{ marginTop: 2, flexShrink: 0 }} /> : <XCircle size={14} style={{ marginTop: 2, flexShrink: 0 }} />}
                        <span>{opt.explanation}</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ─── Single Class Detail View ─── */
function ClaseDetail({ clase, onBack, onDelete }) {
  const [tab, setTab] = useState('resumen')
  const tabs = [
    { id: 'resumen', label: 'Resumen', icon: BookOpen },
    { id: 'puntos', label: 'Puntos Clave', icon: ChevronRight },
    { id: 'quiz', label: 'Quiz EUNACOM', icon: HelpCircle },
  ]

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <button onClick={onBack} style={{
          background: 'var(--surface-700)', border: '1px solid var(--border-color)',
          borderRadius: '8px', padding: '0.5rem 1rem', color: 'var(--text-primary)',
          cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem'
        }}>
          ← Volver
        </button>
        <button onClick={() => onDelete(clase.id)} style={{
          background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
          borderRadius: '8px', padding: '0.5rem 1rem', color: 'var(--danger-500)',
          cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem'
        }}>
          <Trash2 size={14} /> Eliminar
        </button>
      </div>

      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
          <Video size={20} style={{ color: 'var(--primary-500)' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>{clase.topic}</h2>
        </div>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>
          Guardada el {new Date(clase.savedAt).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}
          {clase.quiz?.length > 0 && ` · ${clase.quiz.length} preguntas`}
          {clase.keyPoints?.length > 0 && ` · ${clase.keyPoints.length} puntos clave`}
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '0.6rem 1.2rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
            fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem',
            background: tab === t.id ? 'var(--primary-500)' : 'var(--surface-700)',
            color: tab === t.id ? '#fff' : 'var(--text-secondary)',
            transition: 'all 0.2s'
          }}>
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'resumen' && (
        <div className="card" style={{ padding: '1.5rem', lineHeight: 1.7, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          {clase.summary.split('\n').map((p, i) => p.trim() ? <p key={i} style={{ marginBottom: '0.8rem' }}>{p}</p> : null)}
        </div>
      )}

      {tab === 'puntos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {clase.keyPoints.map((point, i) => (
            <div key={i} className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <ChevronRight size={16} style={{ color: 'var(--primary-500)', marginTop: 3, flexShrink: 0 }} />
              <span style={{ fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>{point}</span>
            </div>
          ))}
        </div>
      )}

      {tab === 'quiz' && clase.quiz?.length > 0 && (
        <QuizSection quiz={clase.quiz} />
      )}
    </div>
  )
}

/* ─── Main Page ─── */
const MisClases = () => {
  const { user } = useAuth()
  const [clases, setClases] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState(null)
  const fileInputRef = useRef(null)

  const loadData = async () => {
    if (!user) return
    try {
      const rows = await fetchClases(user.id)
      setClases(rows.map(r => ({
        id: r.id,
        savedAt: r.saved_at,
        topic: r.topic,
        summary: r.summary || '',
        keyPoints: typeof r.key_points === 'string' ? JSON.parse(r.key_points) : (r.key_points || []),
        quiz: typeof r.quiz === 'string' ? JSON.parse(r.quiz) : (r.quiz || []),
      })))
    } catch (err) {
      console.error('Error loading clases:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user])

  const handleImport = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const data = JSON.parse(reader.result)
        const id = genId()
        await saveClase({
          id,
          userId: user.id,
          topic: data.topic || 'Sin título',
          summary: data.summary || '',
          keyPoints: data.keyPoints || [],
          quiz: data.quiz || [],
        })
        await loadData()
        setSelectedId(id)
      } catch {
        alert('Error: el archivo no tiene el formato correcto.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleDelete = async (id) => {
    try {
      await deleteClase(id)
      setClases(prev => prev.filter(c => c.id !== id))
      setSelectedId(null)
    } catch (err) {
      console.error('Error deleting clase:', err)
    }
  }

  const selectedClase = clases.find(c => c.id === selectedId)

  if (selectedClase) {
    return (
      <div style={{ paddingBottom: '2rem' }}>
        <ClaseDetail
          clase={selectedClase}
          onBack={() => setSelectedId(null)}
          onDelete={handleDelete}
        />
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
        Cargando clases...
      </div>
    )
  }

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
        <h1 className="page__title">Mis Clases</h1>
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            background: 'var(--primary-500)', border: 'none', borderRadius: '10px',
            padding: '0.6rem 1.2rem', color: '#fff', cursor: 'pointer',
            fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem'
          }}
        >
          <Upload size={16} /> Importar Clase
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          style={{ display: 'none' }}
        />
      </div>
      <p className="page__subtitle" style={{ marginBottom: '1.5rem' }}>
        Resúmenes, puntos clave y preguntas EUNACOM generados desde tus videos con MedScribe.
      </p>

      {clases.length === 0 ? (
        <div className="card" style={{
          padding: '3rem 2rem', textAlign: 'center',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem'
        }}>
          <Video size={48} style={{ color: 'var(--text-tertiary)', opacity: 0.5 }} />
          <div>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
              No tienes clases guardadas
            </p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)', maxWidth: 400 }}>
              Usa MedScribe para analizar un video de clase y guarda los resultados aquí como archivo JSON.
            </p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              marginTop: '0.5rem', background: 'var(--surface-700)', border: '1px solid var(--border-color)',
              borderRadius: '10px', padding: '0.7rem 1.5rem', color: 'var(--text-primary)',
              cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500
            }}
          >
            Importar archivo JSON
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {clases.map(clase => (
            <div
              key={clase.id}
              className="card"
              onClick={() => setSelectedId(clase.id)}
              style={{
                padding: '1.25rem 1.5rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                transition: 'all 0.2s', borderLeft: '3px solid var(--primary-500)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 10,
                  background: 'rgba(19,91,236,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <Video size={20} style={{ color: 'var(--primary-500)' }} />
                </div>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {clase.topic}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '0.15rem' }}>
                    {new Date(clase.savedAt).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {clase.quiz?.length > 0 && ` · ${clase.quiz.length} preguntas`}
                    {clase.keyPoints?.length > 0 && ` · ${clase.keyPoints.length} puntos clave`}
                  </div>
                </div>
              </div>
              <ChevronRight size={18} style={{ color: 'var(--text-tertiary)' }} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MisClases
