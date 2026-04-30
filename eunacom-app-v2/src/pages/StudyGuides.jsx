import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { BookOpen, Brain, Download, ChevronDown, ChevronRight, CheckCircle, XCircle, RotateCcw, Eye, EyeOff, Zap } from 'lucide-react'

const OWNER_EMAIL = 'dr.felipeyanez@gmail.com'

// ── Flashcard component (cloze-style reveal) ──────────────────────────────
function FlashCard({ card, index }) {
  const [revealed, setRevealed] = useState(false)
  const [status, setStatus] = useState(null) // 'correct' | 'wrong' | null

  const clozeDisplay = revealed
    ? card.cloze.replace(/\{\{c\d+::(.*?)\}\}/g, '<mark style="background:#fef08a;padding:0 3px;border-radius:3px;">$1</mark>')
    : card.cloze.replace(/\{\{c\d+::(.*?)\}\}/g, '<span style="background:#374151;color:#374151;padding:0 12px;border-radius:3px;cursor:pointer;">????</span>')

  return (
    <div style={{
      background: '#1e293b',
      border: `1px solid ${status === 'correct' ? '#10b981' : status === 'wrong' ? '#ef4444' : '#334155'}`,
      borderRadius: 10,
      padding: '14px 16px',
      marginBottom: 10,
      transition: 'border-color 0.2s',
    }}>
      <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: 6 }}>Tarjeta {index + 1}</div>
      <div
        style={{ fontSize: '0.9rem', color: '#e2e8f0', lineHeight: 1.6 }}
        dangerouslySetInnerHTML={{ __html: clozeDisplay }}
        onClick={() => setRevealed(true)}
      />
      {!revealed && (
        <button
          onClick={() => setRevealed(true)}
          style={{ marginTop: 10, padding: '5px 14px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, fontSize: '0.78rem', cursor: 'pointer' }}
        >
          Revelar respuesta
        </button>
      )}
      {revealed && (
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <button
            onClick={() => setStatus('correct')}
            style={{ padding: '4px 12px', background: status === 'correct' ? '#10b981' : 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid #10b981', borderRadius: 6, fontSize: '0.75rem', cursor: 'pointer' }}
          >
            <CheckCircle size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />Lo sabía
          </button>
          <button
            onClick={() => setStatus('wrong')}
            style={{ padding: '4px 12px', background: status === 'wrong' ? '#ef4444' : 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid #ef4444', borderRadius: 6, fontSize: '0.75rem', cursor: 'pointer' }}
          >
            <XCircle size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />A repasar
          </button>
          <button
            onClick={() => { setRevealed(false); setStatus(null) }}
            style={{ padding: '4px 12px', background: 'rgba(100,116,139,0.15)', color: '#64748b', border: '1px solid #334155', borderRadius: 6, fontSize: '0.75rem', cursor: 'pointer' }}
          >
            <RotateCcw size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />Resetear
          </button>
        </div>
      )}
    </div>
  )
}

// ── MCQ Question ──────────────────────────────────────────────────────────
function QuestionItem({ q, index }) {
  const [selected, setSelected] = useState(null)

  const getOptStyle = (optId) => {
    if (!selected) return { background: 'rgba(51,65,85,0.5)', border: '1px solid #334155', color: '#cbd5e1' }
    if (optId === q.respuestaCorrecta) return { background: 'rgba(16,185,129,0.15)', border: '1px solid #10b981', color: '#6ee7b7' }
    if (optId === selected) return { background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', color: '#fca5a5' }
    return { background: 'rgba(51,65,85,0.3)', border: '1px solid #1e293b', color: '#64748b' }
  }

  return (
    <div style={{ background: '#0f172a', borderRadius: 10, padding: '14px 16px', marginBottom: 12, border: '1px solid #1e293b' }}>
      <div style={{ fontSize: '0.72rem', color: '#475569', marginBottom: 6 }}>Pregunta {index + 1}</div>
      <p style={{ color: '#e2e8f0', fontSize: '0.88rem', lineHeight: 1.55, margin: '0 0 10px' }}>{q.pregunta}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {(q.opciones || []).map(opt => (
          <button
            key={opt.id}
            onClick={() => !selected && setSelected(opt.id)}
            style={{
              ...getOptStyle(opt.id),
              borderRadius: 7,
              padding: '7px 12px',
              textAlign: 'left',
              cursor: selected ? 'default' : 'pointer',
              fontSize: '0.83rem',
              transition: 'all 0.15s',
            }}
          >
            <strong style={{ marginRight: 6 }}>{opt.id}.</strong>{opt.text}
          </button>
        ))}
      </div>
      {selected && (
        <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(15,23,42,0.8)', borderRadius: 8, border: '1px solid #1e293b' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#10b981', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Explicación</div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.6 }}
            dangerouslySetInnerHTML={{ __html: q.explicacion?.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#e2e8f0">$1</strong>').replace(/\n/g, '<br>') || '' }}
          />
        </div>
      )}
    </div>
  )
}

// ── Topic Panel ──────────────────────────────────────────────────────────
function TopicPanel({ topic, isOpen, onToggle }) {
  const [view, setView] = useState('pearls') // 'pearls' | 'flashcards' | 'questions'

  return (
    <div style={{
      background: '#1e293b',
      borderRadius: 14,
      border: `1px solid ${isOpen ? topic.color : '#1e293b'}`,
      marginBottom: 10,
      overflow: 'hidden',
      transition: 'border-color 0.2s',
    }}>
      {/* Header */}
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          padding: '14px 18px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: '1.3rem' }}>{topic.icon}</span>
          <div style={{ textAlign: 'left' }}>
            <div style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '0.95rem' }}>{topic.title}</div>
            <div style={{ color: '#64748b', fontSize: '0.72rem' }}>
              {topic.questionCount} preguntas · {topic.flashcardCount} flashcards · {topic.pearls?.length || 0} perlas
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            background: topic.color + '22',
            color: topic.color,
            border: `1px solid ${topic.color}44`,
            borderRadius: 20,
            padding: '2px 10px',
            fontSize: '0.7rem',
            fontWeight: 600,
          }}>
            High Yield
          </span>
          {isOpen ? <ChevronDown size={16} color="#64748b" /> : <ChevronRight size={16} color="#64748b" />}
        </div>
      </button>

      {/* Content */}
      {isOpen && (
        <div style={{ padding: '0 18px 18px' }}>
          {/* Tab nav */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 16, borderBottom: '1px solid #334155', paddingBottom: 12 }}>
            {['pearls', 'flashcards', 'questions'].map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  padding: '5px 14px',
                  borderRadius: 20,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  fontWeight: view === v ? 700 : 400,
                  background: view === v ? topic.color : 'rgba(51,65,85,0.5)',
                  color: view === v ? '#fff' : '#94a3b8',
                  transition: 'all 0.15s',
                }}
              >
                {v === 'pearls' && `Perlas (${topic.pearls?.length || 0})`}
                {v === 'flashcards' && `Flashcards (${topic.flashcardCount})`}
                {v === 'questions' && `Preguntas (${topic.questionCount})`}
              </button>
            ))}
          </div>

          {/* Pearls */}
          {view === 'pearls' && (
            <div>
              {(topic.pearls || []).length === 0 && <p style={{ color: '#475569', fontSize: '0.85rem' }}>Sin perlas disponibles aún.</p>}
              {(topic.pearls || []).map((p, i) => (
                <div key={i} style={{
                  display: 'flex',
                  gap: 10,
                  marginBottom: 10,
                  padding: '10px 14px',
                  background: '#0f172a',
                  borderRadius: 9,
                  borderLeft: `3px solid ${topic.color}`,
                }}>
                  <Zap size={14} color={topic.color} style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontSize: '0.7rem', color: topic.color, fontWeight: 600, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{p.cat}</div>
                    <div style={{ color: '#cbd5e1', fontSize: '0.85rem', lineHeight: 1.5 }}>{p.pearl}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Flashcards */}
          {view === 'flashcards' && (
            <div>
              {(topic.flashcards || []).length === 0 && <p style={{ color: '#475569', fontSize: '0.85rem' }}>Flashcards próximamente.</p>}
              {(topic.flashcards || []).map((fc, i) => (
                <FlashCard key={fc.id || i} card={fc} index={i} />
              ))}
            </div>
          )}

          {/* Questions */}
          {view === 'questions' && (
            <div>
              {(topic.questions || []).map((q, i) => (
                <QuestionItem key={i} q={q} index={i} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function StudyGuides() {
  const { user } = useAuth()
  const [guideData, setGuideData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [openTopic, setOpenTopic] = useState(null)
  const [search, setSearch] = useState('')
  const [downloading, setDownloading] = useState(false)

  const isOwner = user?.email === OWNER_EMAIL

  useEffect(() => {
    if (!isOwner) return
    fetch('/data/study-guides/pediatria-high-yield.json')
      .then(r => r.json())
      .then(d => { setGuideData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [isOwner])

  const handleDownloadAnki = useCallback(async () => {
    if (downloading) return
    setDownloading(true)
    try {
      const res = await fetch('/data/study-guides/pediatria-anki.apkg')
      if (!res.ok) throw new Error('Archivo no generado aún')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'Pediatria-High-Yield-Cloze.apkg'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('El archivo Anki aún no está disponible. Contacta a Dr. Yáñez.')
    } finally {
      setDownloading(false)
    }
  }, [downloading])

  if (!isOwner) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', color: '#475569' }}>
          <BookOpen size={48} style={{ marginBottom: 16, opacity: 0.4 }} />
          <h2 style={{ color: '#64748b', marginBottom: 8 }}>Acceso restringido</h2>
          <p style={{ fontSize: '0.9rem' }}>Esta sección es privada.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Cargando guía de estudio...</div>
      </div>
    )
  }

  const filteredTopics = (guideData?.topics || []).filter(t =>
    !search || t.title.toLowerCase().includes(search.toLowerCase()) ||
    (t.pearls || []).some(p => p.pearl.toLowerCase().includes(search.toLowerCase()))
  )

  const totalFC = guideData?.meta?.totalFlashcards || 0
  const totalQ = guideData?.meta?.totalQuestions || 0

  return (
    <div className="page" style={{ maxWidth: 860, margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <div>
            <h1 style={{ color: '#f1f5f9', fontSize: '1.7rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
              Study Guides High Yield! 🔥
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '6px 0 0' }}>
              Pediatría EUNACOM · {totalQ} preguntas · {totalFC} flashcards · {guideData?.topics?.length || 0} tópicos
            </p>
          </div>
          <button
            onClick={handleDownloadAnki}
            disabled={downloading}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 18px',
              background: downloading ? 'rgba(124,58,237,0.3)' : 'rgba(124,58,237,0.15)',
              color: '#a78bfa',
              border: '1px solid rgba(124,58,237,0.4)',
              borderRadius: 10,
              cursor: downloading ? 'default' : 'pointer',
              fontSize: '0.82rem',
              fontWeight: 600,
              transition: 'all 0.15s',
            }}
          >
            <Download size={15} />
            {downloading ? 'Descargando...' : 'Descargar Anki (.apkg)'}
          </button>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
          {[
            { label: 'Preguntas EUNACOM', val: totalQ, color: '#3b82f6' },
            { label: 'Flashcards Cloze', val: totalFC, color: '#a855f7' },
            { label: 'Tópicos', val: guideData?.topics?.length || 0, color: '#10b981' },
          ].map(s => (
            <div key={s.label} style={{
              padding: '10px 16px',
              background: '#1e293b',
              borderRadius: 10,
              border: `1px solid ${s.color}33`,
              display: 'flex', flexDirection: 'column', gap: 2,
              minWidth: 110,
            }}>
              <div style={{ color: s.color, fontWeight: 800, fontSize: '1.4rem' }}>{s.val}</div>
              <div style={{ color: '#64748b', fontSize: '0.7rem' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Buscar tópico o perla clínica..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 14px',
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 10,
            color: '#e2e8f0',
            fontSize: '0.88rem',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Topic list */}
      <div>
        {filteredTopics.map(topic => (
          <TopicPanel
            key={topic.id}
            topic={topic}
            isOpen={openTopic === topic.id}
            onToggle={() => setOpenTopic(openTopic === topic.id ? null : topic.id)}
          />
        ))}
        {filteredTopics.length === 0 && (
          <div style={{ textAlign: 'center', color: '#475569', padding: '40px 0' }}>
            No se encontraron tópicos para "{search}"
          </div>
        )}
      </div>

      {/* Anki instructions */}
      <div style={{
        marginTop: 24,
        padding: '14px 18px',
        background: 'rgba(124,58,237,0.08)',
        border: '1px solid rgba(124,58,237,0.2)',
        borderRadius: 12,
      }}>
        <div style={{ color: '#a78bfa', fontWeight: 600, fontSize: '0.82rem', marginBottom: 6 }}>
          Cómo usar las tarjetas Anki
        </div>
        <div style={{ color: '#64748b', fontSize: '0.78rem', lineHeight: 1.6 }}>
          1. Descarga el archivo <strong style={{ color: '#94a3b8' }}>.apkg</strong> con el botón de arriba.<br />
          2. En Anki desktop: <strong style={{ color: '#94a3b8' }}>Archivo → Importar</strong> o doble click en el archivo.<br />
          3. Las tarjetas son tipo <strong style={{ color: '#94a3b8' }}>Cloze</strong> con múltiples deletions (<code style={{ color: '#c084fc' }}>{'{{c1::}} {{c2::}}'}</code>…).<br />
          4. Aparecen en el mazo <strong style={{ color: '#94a3b8' }}>Pediatría High Yield EUNACOM</strong>.
        </div>
      </div>
    </div>
  )
}
