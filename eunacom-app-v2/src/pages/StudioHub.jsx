import React, { useState, useEffect, useRef } from 'react'
import {
  Video, Play, Pause, RotateCcw, Monitor, FileText, CheckCircle2,
  Clock, Flame, Shield, ArrowRight, ExternalLink, Sparkles, Sliders,
  Volume2, Mic, Settings, Search, ChevronRight, Eye, RefreshCw, Copy, Check
} from 'lucide-react'
import catalogData from '../data/studio/perfil_v3_catalog.json'

const STATUS_LABELS = {
  planned: { label: 'Planificado', color: '#64748b', bg: 'rgba(100, 116, 139, 0.15)' },
  script_ready: { label: 'Guión Listo', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
  ready_to_record: { label: 'Listo para Grabar', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.15)' },
  recorded: { label: 'Grabado (Audio/Video)', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
  published: { label: 'Publicado en R2', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)' },
}

export default function StudioHub() {
  const [selectedSpecialty, setSelectedSpecialty] = useState(catalogData.specialties[0])
  const [selectedClass, setSelectedClass] = useState(catalogData.specialties[0].classes[0])
  const [activeTab, setActiveTab] = useState('teleprompter') // teleprompter | slides | studio_guide
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedScript, setCopiedScript] = useState(false)

  // Teleprompter state
  const [isScrolling, setIsScrolling] = useState(false)
  const [scrollSpeed, setScrollSpeed] = useState(2)
  const [fontSize, setFontSize] = useState(26)
  const [mirrorMode, setMirrorMode] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)

  const prompterRef = useRef(null)

  // Auto-scroll loop
  useEffect(() => {
    let interval = null
    if (isScrolling) {
      interval = setInterval(() => {
        if (prompterRef.current) {
          prompterRef.current.scrollTop += scrollSpeed
        }
      }, 30)
    }
    return () => clearInterval(interval)
  }, [isScrolling, scrollSpeed])

  // Recording timer loop
  useEffect(() => {
    let interval = null
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(s => s + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning])

  const formatTimer = (secs) => {
    const mins = Math.floor(secs / 60)
    const rem = secs % 60
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`
  }

  const handleCopyScript = () => {
    if (selectedClass.teleprompterScript) {
      navigator.clipboard.writeText(selectedClass.teleprompterScript)
      setCopiedScript(true)
      setTimeout(() => setCopiedScript(false), 2000)
    }
  }

  const filteredClasses = selectedSpecialty.classes.filter(c => {
    const q = searchQuery.toLowerCase();
    const titleMatch = c.title?.toLowerCase().includes(q);
    const codeMatch = typeof c.perfilCode === 'string' ? c.perfilCode.toLowerCase().includes(q) : false;
    const codesMatch = Array.isArray(c.perfilCodes) ? c.perfilCodes.some(cd => cd.toLowerCase().includes(q)) : false;
    return titleMatch || codeMatch || codesMatch;
  });

  const readyCount = selectedSpecialty.classes.filter(c => c.status === 'ready_to_record').length
  const recordedCount = selectedSpecialty.classes.filter(c => c.status === 'recorded' || c.status === 'published').length

  return (
    <div style={{ maxWidth: 1600, margin: '0 auto', padding: '24px 20px', fontFamily: 'system-ui, sans-serif', color: '#f8fafc' }}>
      
      {/* Studio Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, background: '#0e131f', padding: '20px 24px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ background: 'linear-gradient(135deg, #0284c7, #06b6d4)', color: '#fff', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 800, letterSpacing: '0.05em' }}>
              EUNACOM CREATOR STUDIO
            </span>
            <span style={{ fontSize: 13, color: '#94a3b8' }}>Perfil V3 (2026 Updated)</span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: '6px 0 0', color: '#fff' }}>
            Production Suite: {selectedSpecialty.name}
          </h1>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '10px 18px', borderRadius: 10, textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#38bdf8' }}>{selectedSpecialty.totalClasses}</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>Total Clases</div>
          </div>
          <div style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.3)', padding: '10px 18px', borderRadius: 10, textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#06b6d4' }}>{readyCount}</div>
            <div style={{ fontSize: 11, color: '#38bdf8' }}>Listas para Grabar</div>
          </div>
          <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', padding: '10px 18px', borderRadius: 10, textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#10b981' }}>{recordedCount}</div>
            <div style={{ fontSize: 11, color: '#34d399' }}>Grabadas</div>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 24 }}>
        
        {/* Left Sidebar: Class Selector */}
        <div style={{ background: '#0e131f', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', padding: 18, height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ marginBottom: 14 }}>
            {/* Specialty Switcher */}
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', display: 'block', marginBottom: 6 }}>
                Especialidad Perfil V3
              </label>
              <select
                value={selectedSpecialty.specialtyId}
                onChange={(e) => {
                  const spec = catalogData.specialties.find(s => s.specialtyId === e.target.value);
                  if (spec) {
                    setSelectedSpecialty(spec);
                    setSelectedClass(spec.classes[0]);
                  }
                }}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'rgba(2, 132, 199, 0.15)',
                  border: '1px solid #0284c7',
                  borderRadius: 8,
                  color: '#38bdf8',
                  fontSize: 13,
                  fontWeight: 800,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {catalogData.specialties.map(spec => (
                  <option key={spec.specialtyId} value={spec.specialtyId} style={{ background: '#0e131f', color: '#fff' }}>
                    {spec.specialtyName} ({spec.totalClasses} Clases)
                  </option>
                ))}
              </select>
            </div>

            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#64748b' }} />
              <input
                type="text"
                placeholder="Buscar clase o código..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  color: '#fff',
                  fontSize: 13,
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, paddingRight: 4 }}>
            {filteredClasses.map(c => {
              const isSelected = selectedClass?.id === c.id
              const status = STATUS_LABELS[c.status] || STATUS_LABELS.planned

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedClass(c)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 10,
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(6, 182, 212, 0.12)' : 'rgba(255,255,255,0.02)',
                    border: isSelected ? '1px solid #06b6d4' : '1px solid rgba(255,255,255,0.05)',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8' }}>
                      CLASE {c.lessonNumber} · {c.durationEstimate}
                    </span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: status.bg, color: status.color }}>
                      {status.label}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: isSelected ? '#fff' : '#cbd5e1', lineHeight: 1.3 }}>
                    {c.title}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                    Perfil: {c.perfilCode}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Studio Workspace */}
        <div style={{ background: '#0e131f', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', padding: 24, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)' }}>
          
          {/* Workspace Tab Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 16, marginBottom: 20 }}>
            
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setActiveTab('teleprompter')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: activeTab === 'teleprompter' ? '#06b6d4' : 'rgba(255,255,255,0.05)',
                  color: activeTab === 'teleprompter' ? '#000' : '#cbd5e1',
                  fontWeight: 700, fontSize: 13
                }}
              >
                <Mic size={16} /> Teleprompter / Guión
              </button>

              <button
                onClick={() => setActiveTab('slides')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: activeTab === 'slides' ? '#06b6d4' : 'rgba(255,255,255,0.05)',
                  color: activeTab === 'slides' ? '#000' : '#cbd5e1',
                  fontWeight: 700, fontSize: 13
                }}
              >
                <Monitor size={16} /> Slides 16:9 (frontend-slides)
              </button>

              <button
                onClick={() => setActiveTab('studio_guide')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: activeTab === 'studio_guide' ? '#06b6d4' : 'rgba(255,255,255,0.05)',
                  color: activeTab === 'studio_guide' ? '#000' : '#cbd5e1',
                  fontWeight: 700, fontSize: 13
                }}
              >
                <Settings size={16} /> Setup de Grabación & Audio
              </button>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <a
                href={`/videos/${selectedClass.id}.mp4`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 8,
                  background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', textDecoration: 'none',
                  fontSize: 13, fontWeight: 800, border: '1px solid #34d399', boxShadow: '0 4px 14px rgba(16,185,129,0.3)'
                }}
              >
                🎥 Ver Video MP4 Generado (1080p)
              </a>

              <a
                href={`/deck/${selectedClass.id}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 8,
                  background: 'linear-gradient(135deg, #e11d48, #be123c)', color: '#fff', textDecoration: 'none',
                  fontSize: 13, fontWeight: 800, border: '1px solid #f43f5e', boxShadow: '0 4px 14px rgba(225,29,72,0.3)'
                }}
              >
                ⚡ Presentación Interactiva (Lápiz + Presentador)
              </a>

              {selectedClass.slidesFile && (
                <a
                  href={selectedClass.slidesFile}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8,
                    background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', textDecoration: 'none',
                    fontSize: 12, fontWeight: 700, border: '1px solid rgba(59, 130, 246, 0.3)'
                  }}
                >
                  <ExternalLink size={14} /> Slides Capsule (1920x1080)
                </a>
              )}
            </div>
          </div>

          {/* TAB 1: TELEPROMPTER */}
          {activeTab === 'teleprompter' && (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              
              {/* Teleprompter Control Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '12px 18px', borderRadius: 12, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <button
                    onClick={() => {
                      setIsScrolling(!isScrolling)
                      if (!isTimerRunning && !isScrolling) setIsTimerRunning(true)
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                      background: isScrolling ? '#ef4444' : '#10b981', color: '#fff', fontWeight: 800, fontSize: 13
                    }}
                  >
                    {isScrolling ? <Pause size={16} /> : <Play size={16} />} {isScrolling ? 'Pausar (Space)' : 'Iniciar Auto-Scroll'}
                  </button>

                  <button
                    onClick={() => {
                      if (prompterRef.current) prompterRef.current.scrollTop = 0
                      setIsScrolling(false)
                    }}
                    style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', padding: '8px 12px', borderRadius: 8, cursor: 'pointer' }}
                  >
                    <RotateCcw size={14} />
                  </button>

                  {/* Speed slider */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#94a3b8' }}>
                    <span>Velocidad:</span>
                    <input
                      type="range"
                      min="1"
                      max="6"
                      step="0.5"
                      value={scrollSpeed}
                      onChange={e => setScrollSpeed(parseFloat(e.target.value))}
                      style={{ width: 90 }}
                    />
                    <span style={{ fontWeight: 700, color: '#38bdf8' }}>{scrollSpeed}x</span>
                  </div>

                  {/* Font size slider */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#94a3b8' }}>
                    <span>Texto:</span>
                    <input
                      type="range"
                      min="18"
                      max="42"
                      value={fontSize}
                      onChange={e => setFontSize(parseInt(e.target.value))}
                      style={{ width: 80 }}
                    />
                    <span style={{ fontWeight: 700, color: '#38bdf8' }}>{fontSize}px</span>
                  </div>

                  {/* Mirror mode toggle */}
                  <button
                    onClick={() => setMirrorMode(!mirrorMode)}
                    style={{
                      fontSize: 11, fontWeight: 700, padding: '6px 10px', borderRadius: 6, cursor: 'pointer',
                      background: mirrorMode ? '#f59e0b' : 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)', color: mirrorMode ? '#000' : '#94a3b8'
                    }}
                  >
                    Modo Espejo Prompter
                  </button>
                </div>

                {/* Recording Timer & Copy */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'monospace', fontSize: 16, fontWeight: 800, color: isTimerRunning ? '#10b981' : '#94a3b8', background: 'rgba(0,0,0,0.3)', padding: '6px 12px', borderRadius: 8 }}>
                    <Clock size={16} /> {formatTimer(timerSeconds)}
                  </div>
                  <button
                    onClick={handleCopyScript}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12 }}
                  >
                    {copiedScript ? <Check size={14} color="#10b981" /> : <Copy size={14} />} {copiedScript ? 'Copiado' : 'Copiar Guión'}
                  </button>
                </div>
              </div>

              {/* Prompter Text Stage */}
              <div
                ref={prompterRef}
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  background: '#07090e',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 12,
                  padding: '40px 60px',
                  lineHeight: 1.65,
                  fontSize: fontSize,
                  color: '#e2e8f0',
                  transform: mirrorMode ? 'scaleX(-1)' : 'none',
                  whiteSpace: 'pre-line'
                }}
              >
                {selectedClass.teleprompterScript ? (
                  selectedClass.teleprompterScript.split(/\r?\n/).map((line, idx) => {
                    if (line.startsWith('[SLIDE') || line.startsWith('[VIÑETA') || line.startsWith('[DESCARTE')) {
                      return (
                        <div key={idx} style={{ color: '#06b6d4', fontWeight: 800, margin: '24px 0 8px', fontSize: fontSize * 0.85, textTransform: 'uppercase', letterSpacing: '0.05em', borderLeft: '3px solid #06b6d4', paddingLeft: 12 }}>
                          {line}
                        </div>
                      )
                    }
                    if (line.startsWith('Perla') || line.startsWith('⭐') || line.startsWith('💡')) {
                      return (
                        <div key={idx} style={{ color: '#fbbf24', fontWeight: 700, margin: '14px 0', background: 'rgba(245,158,11,0.1)', padding: '10px 16px', borderRadius: 8 }}>
                          {line}
                        </div>
                      )
                    }
                    return <div key={idx} style={{ marginBottom: 12 }}>{line}</div>
                  })
                ) : (
                  <div style={{ color: '#64748b', textAlign: 'center', marginTop: 100 }}>
                    Guión en fase de planificación para esta clase.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SLIDES 16:9 VIEW */}
          {activeTab === 'slides' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#000', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
              {selectedClass.slidesFile ? (
                <iframe
                  src={selectedClass.slidesFile}
                  title="Slide Deck Viewer"
                  style={{ width: '100%', height: '100%', border: 'none' }}
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', gap: 12 }}>
                  <Monitor size={48} />
                  <div style={{ fontSize: 16 }}>Las slides para esta clase se generarán en la siguiente etapa.</div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: STUDIO RECORDING & VOICE-OVER SETUP */}
          {activeTab === 'studio_guide' && (
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20, padding: 10 }}>
              
              <div style={{ background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.3)', padding: 20, borderRadius: 12 }}>
                <h3 style={{ margin: '0 0 10px', color: '#38bdf8', fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Mic size={20} /> Opciones de Grabación de Voz Recomendadas
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 14 }}>
                  <div style={{ background: '#07090e', padding: 16, borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontWeight: 800, color: '#fff', marginBottom: 6 }}>Opción 1: Grabación en Vivo con Teleprompter</div>
                    <ul style={{ fontSize: 13, color: '#94a3b8', paddingLeft: 18, lineHeight: 1.5 }}>
                      <li>Abre el teleprompter en la pestaña o en una pantalla secundaria / iPad.</li>
                      <li>Usa <strong>OBS Studio</strong> o <strong>ScreenFlow / QuickTime</strong> para capturar la ventana de slides a 1920x1080 60fps.</li>
                      <li>Mantén un tono clínico seguro, enérgico y conversacional.</li>
                    </ul>
                  </div>
                  <div style={{ background: '#07090e', padding: 16, borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontWeight: 800, color: '#fff', marginBottom: 6 }}>Opción 2: Clon de Voz IA (ElevenLabs)</div>
                    <ul style={{ fontSize: 13, color: '#94a3b8', paddingLeft: 18, lineHeight: 1.5 }}>
                      <li>Copia el guión estructurado con un clic desde el botón superior.</li>
                      <li>Pégalo en ElevenLabs con tu clon de voz (o voz médica profesional en español neutro / chileno).</li>
                      <li>Monta el audio sincronizado con la presentación en CapCut / Premiere.</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: 20, borderRadius: 12 }}>
                <h3 style={{ margin: '0 0 12px', color: '#fff', fontSize: 16 }}>
                  Workflow para Grabar Cada Video (Paso a Paso)
                </h3>
                <ol style={{ fontSize: 14, color: '#cbd5e1', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8, lineHeight: 1.5 }}>
                  <li>Haz clic en <strong>"Abrir Slides en Ventana Completa"</strong> para tener la presentación en 16:9 limpia.</li>
                  <li>En OBS o CapCut, selecciona capturar esa ventana a <strong>1080p (1920×1080)</strong>.</li>
                  <li>Inicia el Auto-Scroll del Teleprompter a la velocidad que te resulte cómoda (ej. 2x o 2.5x).</li>
                  <li>Avanza las slides con las flechas del teclado a medida que lees los marcadores <code>[SLIDE 1]</code>, <code>[SLIDE 2]</code>.</li>
                  <li>En la última slide, lee la pregunta EUNACOM e interactúa con las opciones haciendo clic para mostrar el descarte paso a paso.</li>
                  <li>Guarda el video final (.mp4) y súbelo a Cloudflare R2 con la nomenclatura estandarizada.</li>
                </ol>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  )
}
