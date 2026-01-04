import { useState, useEffect } from 'react'
import '../App.css' // Adjusted path since it's now in pages/

function AdminPanel() {
  const [view, setView] = useState('chapters') // chapters, topics, files, content
  const [chapters, setChapters] = useState([])
  const [selectedChapter, setSelectedChapter] = useState(null)

  const [topics, setTopics] = useState([])
  const [selectedTopic, setSelectedTopic] = useState(null)

  const [files, setFiles] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [fileContent, setFileContent] = useState(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const API_URL = 'http://localhost:8000'

  const fetchChapters = async () => {
    try {
      const res = await fetch(`${API_URL}/chapters`)
      const data = await res.json()
      if (Array.isArray(data)) {
        setChapters(data)
      } else {
        console.error("Invalid chapters response:", data)
      }
    } catch (e) { console.error(e) }
  }

  const fetchTopics = async (chapter) => {
    try {
      const res = await fetch(`${API_URL}/topics?chapter=${chapter}`)
      const data = await res.json()
      if (Array.isArray(data)) {
        setTopics(data)
      } else {
        console.error("Invalid topics response:", data)
        setTopics([])
      }
    } catch (e) {
      console.error(e)
      setTopics([])
    }
  }

  const fetchFiles = async (topic) => {
    try {
      if (!topic) return
      // We could pass chapter here too, but backend file listing is flat for now
      const res = await fetch(`${API_URL}/files/${topic}?chapter=${selectedChapter}`)
      const data = await res.json()
      setFiles(data)
    } catch (e) {
      console.error("Error fetching files", e)
    }
  }

  const fetchFileContent = async (topic, filename) => {
    try {
      const res = await fetch(`${API_URL}/file/${topic}/${filename}?chapter=${selectedChapter}`)
      const data = await res.json()
      setFileContent(data)
      setSelectedFile(filename)
      setView('content')
    } catch (e) {
      console.error("Error fetching file content", e)
    }
  }

  const [logs, setLogs] = useState([])

  const fetchLogs = async () => {
    try {
      const res = await fetch(`${API_URL}/logs`)
      const data = await res.json()
      setLogs(data.logs)
    } catch (e) {
      console.error("Error fetching logs", e)
    }
  }

  const [processStatus, setProcessStatus] = useState('stopped')

  const checkProcess = async () => {
    try {
      const res = await fetch(`${API_URL}/process_status`)
      const data = await res.json()
      setProcessStatus(data.status)
    } catch (e) {
      console.error(e)
    }
  }

  const handleStart = async () => {
    if (!selectedTopic || !selectedChapter) {
      alert("Select a chapter and topic first!")
      return
    }
    await fetch(`${API_URL}/start?topic=${selectedTopic}&chapter=${selectedChapter}`, { method: 'POST' })
    checkProcess()
  }

  const handleStop = async () => {
    await fetch(`${API_URL}/stop`, { method: 'POST' })
    checkProcess()
  }

  // Initial Load
  useEffect(() => {
    fetchChapters()
    fetchLogs()
    checkProcess()
  }, [])

  // Auto Refresh
  useEffect(() => {
    const interval = setInterval(() => {
      if (autoRefresh) {
        fetchLogs()
        checkProcess()
        if (selectedTopic && view !== 'chapters') {
          fetchFiles(selectedTopic)
        }
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [autoRefresh, selectedTopic, view])

  // Navigation Handlers
  const selectChapter = (chapter) => {
    setSelectedChapter(chapter)
    fetchTopics(chapter)
    setView('topics')
  }

  const selectTopic = (topic) => {
    setSelectedTopic(topic)
    fetchFiles(topic)
    setView('files')
  }

  const goBackToChapters = () => {
    setSelectedChapter(null)
    setTopics([])
    setView('chapters')
  }

  const goBackToTopics = () => {
    setSelectedTopic(null)
    setFiles([])
    setView('topics')
  }

  const goBackToFiles = () => {
    setSelectedFile(null)
    setFileContent(null)
    setView('files')
  }

  return (
    <div className="container">
      <header>
        <div className="header-left">
          <h1>⚡ EUNACOM Processing</h1>
          {selectedChapter && <span className="chapter-badge">{selectedChapter}</span>}
          {selectedTopic && <span className="current-topic-badge">{selectedTopic}</span>}

          <div className="controls">
            {processStatus === 'running' ? (
              <button className="control-btn stop" onClick={handleStop}>⏸️ Pause</button>
            ) : (
              <button className="control-btn start" onClick={handleStart} disabled={!selectedTopic}>
                ▶️ Start {selectedTopic ? selectedTopic : ''}
              </button>
            )}
            <span className={`status-indicator ${processStatus}`}>
              {processStatus === 'running' ? '● Running' : '● Stopped'}
            </span>
          </div>
        </div>

        <div className="status-bar">
          <button
            className={`toggle-btn ${autoRefresh ? 'active' : ''}`}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? 'Live ON' : 'Live OFF'}
          </button>
        </div>
      </header>

      <div className="main-layout">
        <div className="activity-feed">
          <h3>🔴 Live Activity</h3>
          <div className="logs-window">
            {logs.slice().reverse().map((log, i) => (
              <div key={i} className="log-line">{log}</div>
            ))}
          </div>
        </div>

        {/* VIEW: CHAPTERS LIST */}
        {view === 'chapters' && (
          <div className="topics-grid">
            <h2>📚 Select a Chapter</h2>
            <div className="grid">
              {chapters.map(c => (
                <div key={c} className="topic-card chapter-card" onClick={() => selectChapter(c)}>
                  <h3>{c}</h3>
                  <p>Browse content</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW: TOPICS LIST */}
        {view === 'topics' && (
          <div className="topics-grid">
            <button className="back-btn" onClick={goBackToChapters}>← Back to Chapters</button>
            <h2>Select a Topic ({selectedChapter})</h2>
            <div className="grid">
              {topics.map(t => (
                <div key={t} className="topic-card" onClick={() => selectTopic(t)}>
                  <h3>{t}</h3>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW: FILES LIST */}
        {view === 'files' && (
          <div className="files-view">
            <button className="back-btn" onClick={goBackToTopics}>← Back to Categories</button>
            <h2>Files in {selectedTopic}</h2>
            <div className="file-list">
              {files.length === 0 ? <p>No files found (Run Start to process)</p> :
                files.map(file => (
                  <div
                    key={file.filename}
                    className={`file-item ${file.status.toLowerCase()}`}
                    onClick={() => fetchFileContent(selectedTopic, file.filename)}
                  >
                    <div className="file-name">{file.filename}</div>
                    <div className="file-meta">
                      <span className={`badge ${file.status.toLowerCase()}`}>{file.status}</span>
                      <span className="progress-text">
                        {file.processed_questions} / {file.total_questions}
                      </span>
                    </div>
                    <div className="mini-progress">
                      <div className="fill" style={{ width: `${file.progress}%` }}></div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* VIEW: CONTENT DETAILS */}
        {view === 'content' && (
          <div className="content-view">
            <div className="content-header-nav">
              <button className="back-btn" onClick={goBackToFiles}>← Back to Files</button>
              <h2>{selectedFile}</h2>
            </div>

            <div className="questions-list">
              {fileContent ? (
                fileContent.map((row, idx) => (
                  <div key={idx} className="question-card">
                    <div className="q-header">
                      <span className="q-num">#{row.numero}</span>
                      <span className="q-text">{row.pregunta}</span>
                    </div>
                    <div className="options">
                      {['A', 'B', 'C', 'D', 'E'].map(opt => (
                        <div
                          key={opt}
                          className={`option ${row.respuesta_correcta === opt ? 'correct' : ''}`}
                        >
                          <strong>{opt})</strong> {row[`opcion_${opt.toLowerCase()}`]}
                        </div>
                      ))}
                    </div>
                    {row.explicacion_correcta && (
                      <div className="ai-enrichment">
                        <div className="section-title">🤖 AI Explanation</div>
                        <div className="explanation" dangerouslySetInnerHTML={{ __html: row.explicacion_correcta.replace(/\n/g, '<br/>') }}></div>

                        {row.por_que_incorrectas && (
                          <>
                            <div className="section-title">Why others are incorrect</div>
                            <div className="explanation" dangerouslySetInnerHTML={{ __html: row.por_que_incorrectas.replace(/\n/g, '<br/>') }}></div>
                          </>
                        )}

                        <div className="meta-tags">
                          {row.codigo_eunacom && <span className="tag code">🏷️ {row.codigo_eunacom}</span>}
                          {row.video_recomendado && <span className="tag video">📺 {row.video_recomendado}</span>}
                          {row.tags && <span className="tag topic">📌 {row.tags}</span>}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : <p>Loading...</p>}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default AdminPanel
