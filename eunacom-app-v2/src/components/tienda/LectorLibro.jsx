import React, { useEffect, useRef, useState } from 'react'
import { X, ZoomIn, ZoomOut, Loader2 } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { fetchBookRead } from '../../lib/api'

// Lector en línea de los libros: solo lectura en la app (sin descarga ni impresión).
// Las páginas se dibujan en <canvas> (no hay texto que copiar), con marca de agua del usuario,
// sin clic derecho, arrastre, selección ni atajos de guardar/imprimir/copiar. El PDF llega por
// un link temporal (10 min) que el servidor firma solo si el usuario tiene el libro.
let pdfjsPromise = null
function loadPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = Promise.all([import('pdfjs-dist'), import('pdfjs-dist/build/pdf.worker.min.mjs?url')]).then(([lib, worker]) => {
      lib.GlobalWorkerOptions.workerSrc = worker.default
      return lib
    })
  }
  return pdfjsPromise
}

const block = e => e.preventDefault()

function Page({ pdf, n, width, ratio, mark }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), { rootMargin: '600px 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!visible || !width) return
    let task, cancelled = false
    pdf.getPage(n).then(page => {
      if (cancelled) return
      const base = page.getViewport({ scale: 1 })
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const viewport = page.getViewport({ scale: (width / base.width) * dpr })
      const canvas = ref.current?.querySelector('canvas')
      if (!canvas) return
      canvas.width = viewport.width
      canvas.height = viewport.height
      task = page.render({ canvasContext: canvas.getContext('2d'), viewport })
      task.promise.catch(() => {})
    })
    return () => { cancelled = true; task?.cancel() }
  }, [visible, width, pdf, n])

  return (
    <div ref={ref} style={{ position: 'relative', width, height: width * ratio, margin: '0 auto 12px', background: '#fff', boxShadow: '0 6px 20px rgba(0,0,0,0.35)' }}>
      <canvas style={{ width: '100%', height: '100%', display: 'block' }} />
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {[0.18, 0.5, 0.82].map(top => (
          <div key={top} style={{ position: 'absolute', left: '50%', top: `${top * 100}%`, transform: 'translate(-50%,-50%) rotate(-28deg)', whiteSpace: 'nowrap', fontSize: Math.max(11, width / 38), fontWeight: 700, color: 'rgba(30,58,138,0.13)', fontFamily: 'sans-serif' }}>
            {mark}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function LectorLibro({ item, title, onClose }) {
  const { user } = useAuth()
  const [fileIdx, setFileIdx] = useState(0)
  const [files, setFiles] = useState([])
  const [pdf, setPdf] = useState(null)
  const [ratio, setRatio] = useState(1.414)
  const [error, setError] = useState(null)
  const [zoom, setZoom] = useState(1)
  const [boxWidth, setBoxWidth] = useState(0)
  const boxRef = useRef(null)
  const mark = `${user?.email || 'EUNACOM App'} · ${new Date().toLocaleDateString('es-CL')} · eunacomapp.cl`

  // Bloqueos mientras el lector está abierto
  useEffect(() => {
    const onKey = e => {
      const k = e.key?.toLowerCase()
      if ((e.metaKey || e.ctrlKey) && ['s', 'p', 'c', 'a', 'x'].includes(k)) { e.preventDefault(); e.stopPropagation() }
      if (k === 'printscreen') { e.preventDefault(); try { navigator.clipboard?.writeText('') } catch { /* sin permiso */ } }
      if (k === 'escape') onClose()
    }
    window.addEventListener('keydown', onKey, true)
    const style = document.createElement('style')
    style.textContent = '@media print { body * { visibility: hidden !important; } }'
    document.head.appendChild(style)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey, true); style.remove(); document.body.style.overflow = prevOverflow }
  }, [onClose])

  useEffect(() => {
    const measure = () => setBoxWidth(Math.min((boxRef.current?.clientWidth || 800) - 24, 900))
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  useEffect(() => {
    let doc, cancelled = false
    setPdf(null)
    setError(null)
    ;(async () => {
      try {
        const { url, files: list } = await fetchBookRead(user.id, item, fileIdx)
        if (cancelled) return
        setFiles(list || [])
        const lib = await loadPdfjs()
        doc = await lib.getDocument({ url, disableAutoFetch: true }).promise
        const first = (await doc.getPage(1)).getViewport({ scale: 1 })
        if (cancelled) return doc.destroy()
        setRatio(first.height / first.width)
        setPdf(doc)
      } catch (err) {
        console.error(err)
        if (!cancelled) setError(String(err.message || '').includes('403') ? 'No tienes este libro en tu cuenta.' : 'No pudimos abrir el libro. Inténtalo de nuevo en un momento.')
      }
    })()
    return () => { cancelled = true; doc?.destroy() }
  }, [item, fileIdx, user?.id])

  const width = Math.round(boxWidth * zoom)

  return (
    <div
      onContextMenu={block} onDragStart={block} onCopy={block} onCut={block}
      style={{ position: 'fixed', inset: 0, zIndex: 10001, background: '#0b1120', display: 'flex', flexDirection: 'column', userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.55rem 0.8rem', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', flexWrap: 'wrap' }}>
        <strong style={{ fontSize: '0.9rem', flex: 1, minWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</strong>
        {files.length > 1 && (
          <select value={fileIdx} onChange={e => setFileIdx(Number(e.target.value))} aria-label="Libro"
            style={{ background: '#1e293b', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '0.3rem 0.5rem', fontSize: '0.8rem' }}>
            {files.map((f, i) => <option key={f} value={i}>{f}</option>)}
          </select>
        )}
        {pdf && <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{pdf.numPages} págs.</span>}
        <button onClick={() => setZoom(z => Math.max(0.6, +(z - 0.2).toFixed(1)))} aria-label="Alejar" style={tb}><ZoomOut size={16} /></button>
        <button onClick={() => setZoom(z => Math.min(2.2, +(z + 0.2).toFixed(1)))} aria-label="Acercar" style={tb}><ZoomIn size={16} /></button>
        <button onClick={onClose} aria-label="Cerrar lector" style={tb}><X size={18} /></button>
      </div>
      <div ref={boxRef} style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
        {error && <div style={{ color: '#fca5a5', textAlign: 'center', marginTop: '3rem' }}>{error}</div>}
        {!pdf && !error && (
          <div style={{ color: '#94a3b8', textAlign: 'center', marginTop: '3rem', display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center' }}>
            <Loader2 size={18} className="spin" /> Abriendo libro...
          </div>
        )}
        {pdf && width > 0 && Array.from({ length: pdf.numPages }, (_, i) => (
          <Page key={`${fileIdx}-${i}`} pdf={pdf} n={i + 1} width={width} ratio={ratio} mark={mark} />
        ))}
      </div>
    </div>
  )
}

const tb = { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#e2e8f0', borderRadius: 8, padding: '0.3rem 0.45rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }
