import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { X, ZoomIn, ZoomOut, Loader2, List, Search, ChevronLeft, ChevronRight, Smartphone } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { fetchBookRead } from '../../lib/api'
import { itemFiles } from '../../config/tienda'
import LectorMovil from './LectorMovil'

// Lector en línea de los libros: solo lectura en la app (sin descarga ni impresión).
// Las páginas se dibujan en <canvas> (no hay texto que copiar), con marca de agua del usuario,
// sin clic derecho, arrastre, selección ni atajos de guardar/imprimir/copiar. El PDF llega por
// un link temporal (10 min) que el servidor firma solo si el usuario tiene el libro.
// Índice: public/libros-indice/<ruta>.json (scripts/build-book-index.mjs). Búsqueda: texto del PDF en el navegador.
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
const GAP = 12
const MIN_ZOOM = 0.6
const MAX_ZOOM = 3
const clampZoom = z => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(z * 100) / 100))
const norm = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

function Page({ pdf, n, width, ratio, mark, hits }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  const [base, setBase] = useState(null)

  // Solo se dibujan las páginas cerca de la pantalla; las lejanas se liberan (memoria en el celular)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: '1200px 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const canvas = ref.current?.querySelector('canvas')
    if (!visible || !width) {
      if (canvas) { canvas.width = 0; canvas.height = 0 }
      return
    }
    let task, cancelled = false
    pdf.getPage(n).then(page => {
      if (cancelled || !canvas) return
      const vp1 = page.getViewport({ scale: 1 })
      setBase({ w: vp1.width, h: vp1.height })
      // nitidez: densidad real de la pantalla + un extra, con tope para no reventar la memoria
      const dpr = window.devicePixelRatio || 1
      const target = Math.min(dpr * 1.5, 3)
      const maxPx = 4096
      const scale = Math.min((width / vp1.width) * target, maxPx / vp1.width, maxPx / vp1.height)
      const viewport = page.getViewport({ scale })
      const off = document.createElement('canvas')
      off.width = Math.floor(viewport.width)
      off.height = Math.floor(viewport.height)
      task = page.render({ canvasContext: off.getContext('2d'), viewport })
      task.promise.then(() => {
        if (cancelled) return
        canvas.width = off.width
        canvas.height = off.height
        canvas.getContext('2d').drawImage(off, 0, 0)
      }).catch(() => {})
    })
    return () => { cancelled = true; task?.cancel() }
  }, [visible, width, pdf, n])

  return (
    <div ref={ref} data-page={n} style={{ position: 'relative', width, height: Math.round(width * ratio), margin: `0 auto ${GAP}px`, background: '#fff', boxShadow: '0 6px 20px rgba(0,0,0,0.35)' }}>
      <canvas style={{ width: '100%', height: '100%', display: 'block' }} />
      {base && hits?.map((r, i) => (
        <div key={i} style={{ position: 'absolute', left: `${(r.x / base.w) * 100}%`, top: `${((base.h - r.y - r.h * 0.85) / base.h) * 100}%`, width: `${(r.w / base.w) * 100}%`, height: `${((r.h * 1.15) / base.h) * 100}%`, background: 'rgba(250,204,21,0.38)', borderRadius: 2, pointerEvents: 'none' }} />
      ))}
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

// Modo celular (texto adaptable) para los manuales. La app detecta si es teléfono o computador:
// en el teléfono parte en modo celular y en el computador en el PDF completo. La elección se recuerda
// por separado para cada tipo de equipo (lector-modo-telefono / lector-modo-computador).
const hasMovil = item => itemFiles(item).length === 1 && /^01_Tomos\//.test(itemFiles(item)[0]?.file || '')
export function tipoEquipo() {
  // teléfono = pantalla táctil y chica; con mouse es computador aunque la ventana sea angosta
  if (!window.matchMedia) return window.innerWidth < 640 ? 'telefono' : 'computador'
  const tactil = window.matchMedia('(pointer: coarse)').matches
  const corto = Math.min(window.screen?.width || 9999, window.screen?.height || 9999)
  return tactil && corto < 600 ? 'telefono' : 'computador'
}
export default function LectorLibro(props) {
  const movilOk = hasMovil(props.item)
  const equipo = tipoEquipo()
  const key = `lector-modo-${equipo}`
  const [modo, setModo] = useState(() => {
    let p = null
    try { p = localStorage.getItem(key) } catch { /* modo privado */ }
    return movilOk && (p ? p === 'movil' : equipo === 'telefono') ? 'movil' : 'pdf'
  })
  const cambiar = m => { setModo(m); try { localStorage.setItem(key, m) } catch { /* modo privado */ } }
  if (movilOk && modo === 'movil') return <LectorMovil item={props.item} title={props.title} equipo={equipo} onClose={props.onClose} onPdf={() => cambiar('pdf')} />
  return <LectorPdf {...props} onMovil={movilOk ? () => cambiar('movil') : null} />
}

function LectorPdf({ item, title, initialFileIdx = 0, onClose, onMovil }) {
  const { user } = useAuth()
  const [fileIdx, setFileIdx] = useState(initialFileIdx)
  const [files, setFiles] = useState([])
  const [pdf, setPdf] = useState(null)
  const [ratio, setRatio] = useState(1.414)
  const [error, setError] = useState(null)
  const [zoom, setZoom] = useState(1)
  const [boxWidth, setBoxWidth] = useState(0)
  const [narrow, setNarrow] = useState(() => window.innerWidth < 760)
  const [panel, setPanel] = useState(null) // 'toc' | 'search' | null
  const [toc, setToc] = useState([])
  const [page, setPage] = useState(1)
  const [pageInput, setPageInput] = useState('1')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null) // { q, list: [{ p, snippet }], done, scanned }
  const [hitsByPage, setHitsByPage] = useState({})
  const boxRef = useRef(null)
  const pagesRef = useRef(null)
  const textCache = useRef({})
  const anchor = useRef(null) // posición a conservar al cambiar el zoom
  const searchRun = useRef(0)
  const mark = `${user?.email || 'EUNACOM App'} · ${new Date().toLocaleDateString('es-CL')} · eunacomapp.cl`

  // Bloqueos mientras el lector está abierto
  useEffect(() => {
    const onKey = e => {
      const k = e.key?.toLowerCase()
      if ((e.metaKey || e.ctrlKey) && ['s', 'p', 'c', 'a', 'x'].includes(k)) { e.preventDefault(); e.stopPropagation() }
      if ((e.metaKey || e.ctrlKey) && k === 'f') { e.preventDefault(); setPanel('search') }
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

  const sidePanel = panel && !narrow
  useEffect(() => {
    const measure = () => {
      setNarrow(window.innerWidth < 760)
      setBoxWidth(Math.min((boxRef.current?.clientWidth || 800) - 24, 900))
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (boxRef.current) ro.observe(boxRef.current)
    return () => ro.disconnect()
  }, [sidePanel])

  // Libro + índice
  useEffect(() => {
    let doc, cancelled = false
    setPdf(null)
    setError(null)
    setToc([])
    setResults(null)
    setHitsByPage({})
    setPage(1)
    textCache.current = {}
    const file = itemFiles(item)[fileIdx]?.file
    if (file) {
      fetch(`/libros-indice/${file.split('/').map(encodeURIComponent).join('__')}.json`)
        .then(r => r.ok ? r.json() : null).then(j => !cancelled && j && setToc(j.toc || [])).catch(() => {})
    }
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
    return () => { cancelled = true; searchRun.current++; doc?.destroy() }
  }, [item, fileIdx, user?.id])

  const width = Math.round(boxWidth * zoom)
  const pageH = Math.round(width * ratio) + GAP

  const goTo = useCallback((n, yFrac = 0) => {
    const box = boxRef.current
    if (!box || !pdf) return
    const p = Math.min(Math.max(1, n), pdf.numPages)
    box.scrollTop = (p - 1) * pageH + Math.max(0, yFrac * (pageH - GAP) - box.clientHeight * 0.3)
    setPage(p)
    setPageInput(String(p))
    if (narrow) setPanel(null)
  }, [pdf, pageH, narrow])

  const onScroll = () => {
    const box = boxRef.current
    if (!box || !pageH) return
    const p = Math.min(pdf?.numPages || 1, Math.floor((box.scrollTop + box.clientHeight * 0.35) / pageH) + 1)
    if (p !== page) { setPage(p); setPageInput(String(p)) }
  }

  // Zoom sin perder el lugar: se guarda la posición relativa y se restaura tras el nuevo ancho
  const applyZoom = useCallback(fn => {
    const box = boxRef.current
    if (box && pageH) anchor.current = { frac: (box.scrollTop + box.clientHeight / 2) / (pageH * (pdf?.numPages || 1)), x: box.scrollLeft / Math.max(1, box.scrollWidth - box.clientWidth) }
    setZoom(z => clampZoom(fn(z)))
  }, [pageH, pdf])

  useLayoutEffect(() => {
    const box = boxRef.current
    const a = anchor.current
    if (!box || !a || !pdf) return
    anchor.current = null
    box.scrollTop = a.frac * pageH * pdf.numPages - box.clientHeight / 2
    box.scrollLeft = a.x * (box.scrollWidth - box.clientWidth)
  }, [width, pageH, pdf])

  // Pellizco: trackpad (ctrl + rueda) y dos dedos en el celular. Mientras dura se escala con CSS; al soltar se redibuja nítido.
  useEffect(() => {
    const box = boxRef.current
    const inner = pagesRef.current
    if (!box || !inner) return
    let wheelTimer, wheelScale = 1, pinch = null
    const preview = s => { inner.style.transformOrigin = 'center top'; inner.style.transform = `scale(${s})` }
    const commit = s => { inner.style.transform = ''; if (Math.abs(s - 1) > 0.02) applyZoom(z => z * s) }
    const onWheel = e => {
      if (!e.ctrlKey && !e.metaKey) return
      e.preventDefault()
      wheelScale = Math.min(MAX_ZOOM / zoom, Math.max(MIN_ZOOM / zoom, wheelScale * Math.exp(-e.deltaY * 0.01)))
      preview(wheelScale)
      clearTimeout(wheelTimer)
      wheelTimer = setTimeout(() => { commit(wheelScale); wheelScale = 1 }, 160)
    }
    const dist = t => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY)
    const onStart = e => { if (e.touches.length === 2) pinch = { d: dist(e.touches), s: 1 } }
    const onMove = e => {
      if (!pinch || e.touches.length !== 2) return
      e.preventDefault()
      pinch.s = Math.min(MAX_ZOOM / zoom, Math.max(MIN_ZOOM / zoom, dist(e.touches) / pinch.d))
      preview(pinch.s)
    }
    const onEnd = e => { if (pinch && e.touches.length < 2) { commit(pinch.s); pinch = null } }
    box.addEventListener('wheel', onWheel, { passive: false })
    box.addEventListener('touchstart', onStart, { passive: true })
    box.addEventListener('touchmove', onMove, { passive: false })
    box.addEventListener('touchend', onEnd)
    box.addEventListener('touchcancel', onEnd)
    return () => {
      clearTimeout(wheelTimer)
      box.removeEventListener('wheel', onWheel)
      box.removeEventListener('touchstart', onStart)
      box.removeEventListener('touchmove', onMove)
      box.removeEventListener('touchend', onEnd)
      box.removeEventListener('touchcancel', onEnd)
    }
  }, [zoom, applyZoom, pdf])

  // Búsqueda en todo el libro (sin tildes ni mayúsculas); marca en amarillo las líneas encontradas
  const pageText = async n => {
    if (!textCache.current[n]) {
      const pg = await pdf.getPage(n)
      const ph = pg.getViewport({ scale: 1 }).height
      const tc = await pg.getTextContent()
      textCache.current[n] = tc.items.filter(i => i.str.trim()).map(i => ({ s: i.str, x: i.transform[4], y: i.transform[5], w: i.width, h: Math.abs(i.transform[3]), f: 1 - i.transform[5] / ph }))
    }
    return textCache.current[n]
  }
  const runSearch = async e => {
    e?.preventDefault()
    const q = norm(query.trim())
    const run = ++searchRun.current
    if (!pdf || q.length < 2) { setResults(null); setHitsByPage({}); return }
    const list = [], hits = {}
    setResults({ q, list, done: false, scanned: 0 })
    for (let n = 1; n <= pdf.numPages; n++) {
      const items = await pageText(n)
      if (run !== searchRun.current) return
      const joined = items.map(i => i.s).join(' ')
      const nj = norm(joined)
      let at = nj.indexOf(q)
      if (at >= 0) {
        hits[n] = items.filter(i => norm(i.s).includes(q) || (q.includes(' ') && q.split(' ').some(w => w.length > 3 && norm(i.s).includes(w))))
        let count = 0
        while (at >= 0 && count < 3) {
          // posición vertical aproximada del resultado dentro de la página (para llegar justo ahí)
          let acc = 0
          const it = items.find(x => (acc += x.s.length + 1) > at) || items[0]
          list.push({ p: n, f: it.f, snippet: joined.slice(Math.max(0, at - 40), at + q.length + 60).replace(/\s+/g, ' ').trim() })
          at = nj.indexOf(q, at + q.length)
          count++
        }
      }
      if (n % 8 === 0 || n === pdf.numPages) {
        setResults({ q, list: [...list], done: n === pdf.numPages, scanned: n })
        setHitsByPage({ ...hits })
      }
    }
  }

  // al abrir el índice, mostrar el tema donde va el lector
  useEffect(() => {
    if (panel === 'toc') document.querySelector('[data-toc-current]')?.scrollIntoView({ block: 'center' })
  }, [panel])

  const tocCurrent = toc.reduce((acc, e, i) => (e.p <= page ? i : acc), -1)

  const panelBody = panel === 'toc' ? (
    <div style={{ padding: '0.4rem 0' }}>
      {toc.length === 0 && <p style={muted}>Este libro no tiene índice todavía. Usa el buscador o salta a una página.</p>}
      {toc.map((e, i) => (
        <button key={i} onClick={() => goTo(e.p)} data-toc-current={i === tocCurrent || undefined}
          style={{ ...tocBtn, paddingLeft: e.l === 1 ? 14 : 26, fontWeight: e.l === 1 ? 800 : 500, color: i === tocCurrent ? '#fbbf24' : e.l === 1 ? '#f1f5f9' : '#cbd5e1', background: i === tocCurrent ? 'rgba(251,191,36,0.08)' : 'transparent' }}>
          <span style={{ flex: 1 }}>{e.t}</span>
          <span style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 600 }}>{e.p}</span>
        </button>
      ))}
    </div>
  ) : panel === 'search' ? (
    <div>
      <form onSubmit={runSearch} style={{ display: 'flex', gap: 6, padding: '0.6rem 0.75rem', position: 'sticky', top: 0, background: '#111827' }}>
        <input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar en el libro (ej: warfarina)" enterKeyHint="search"
          style={{ flex: 1, minWidth: 0, background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '0.5rem 0.6rem', fontSize: 16, userSelect: 'text', WebkitUserSelect: 'text' }} />
        <button type="submit" style={{ ...tb, padding: '0.4rem 0.7rem', background: '#2563eb', borderColor: '#2563eb' }}><Search size={16} /></button>
      </form>
      {results && (
        <p style={{ ...muted, paddingTop: 0 }}>
          {results.done ? (results.list.length ? `${results.list.length} resultado${results.list.length === 1 ? '' : 's'}` : 'Sin resultados')  : `Buscando… (pág. ${results.scanned} de ${pdf?.numPages})`}
        </p>
      )}
      {results?.list.map((r, i) => (
        <button key={i} onClick={() => goTo(r.p, r.f)} style={{ ...tocBtn, flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
          <span style={{ color: '#fbbf24', fontSize: '0.72rem', fontWeight: 700 }}>Página {r.p}</span>
          <span style={{ color: '#cbd5e1', fontSize: '0.8rem', lineHeight: 1.35 }}>…{r.snippet}…</span>
        </button>
      ))}
    </div>
  ) : null

  const numPages = pdf?.numPages || 0

  return (
    <div
      onContextMenu={block} onDragStart={block} onCopy={block} onCut={block} data-version="pdf"
      style={{ position: 'fixed', inset: 0, zIndex: 10001, background: '#0b1120', display: 'flex', flexDirection: 'column', userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none' }}
    >
      {/* Barra superior */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.7rem', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0' }}>
        <button onClick={() => setPanel(p => p === 'toc' ? null : 'toc')} aria-label="Índice" style={{ ...tb, ...(panel === 'toc' ? tbOn : null) }}><List size={17} />{!narrow && <span style={tbLabel}>Índice</span>}</button>
        <button onClick={() => setPanel(p => p === 'search' ? null : 'search')} aria-label="Buscar" style={{ ...tb, ...(panel === 'search' ? tbOn : null) }}><Search size={16} />{!narrow && <span style={tbLabel}>Buscar</span>}</button>
        <strong style={{ fontSize: '0.88rem', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginLeft: 4 }}>{title}</strong>
        {files.length > 1 && !narrow && (
          <select value={fileIdx} onChange={e => setFileIdx(Number(e.target.value))} aria-label="Libro"
            style={{ background: '#1e293b', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '0.3rem 0.5rem', fontSize: '0.8rem', maxWidth: 200 }}>
            {files.map((f, i) => <option key={f} value={i}>{f}</option>)}
          </select>
        )}
        {!narrow && (
          <>
            <button onClick={() => applyZoom(z => z - 0.2)} aria-label="Alejar" style={tb}><ZoomOut size={16} /></button>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', minWidth: 38, textAlign: 'center' }}>{Math.round(zoom * 100)}%</span>
            <button onClick={() => applyZoom(z => z + 0.2)} aria-label="Acercar" style={tb}><ZoomIn size={16} /></button>
          </>
        )}
        {onMovil && <button onClick={onMovil} aria-label="Modo celular" style={{ ...tb, background: '#2563eb', borderColor: '#2563eb' }}><Smartphone size={16} /><span style={tbLabel}>{narrow ? 'Celular' : 'Modo celular'}</span></button>}
        <button onClick={onClose} aria-label="Cerrar lector" style={tb}><X size={18} /></button>
      </div>

      <div style={{ flex: 1, display: 'flex', minHeight: 0, position: 'relative' }}>
        {panel && (
          <div style={narrow
            ? { position: 'absolute', inset: 0, zIndex: 3, background: '#111827', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }
            : { width: 320, flexShrink: 0, background: '#111827', borderRight: '1px solid rgba(255,255,255,0.08)', overflowY: 'auto' }}>
            {narrow && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.75rem 0', color: '#f1f5f9' }}>
                <strong style={{ fontSize: '0.95rem' }}>{panel === 'toc' ? 'Índice' : 'Buscar en el libro'}</strong>
                <button onClick={() => setPanel(null)} aria-label="Cerrar panel" style={tb}><X size={16} /></button>
              </div>
            )}
            {narrow && panel === 'toc' && files.length > 1 && (
              <div style={{ padding: '0.5rem 0.75rem 0' }}>
                <select value={fileIdx} onChange={e => setFileIdx(Number(e.target.value))} aria-label="Libro"
                  style={{ width: '100%', background: '#1e293b', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '0.45rem 0.5rem', fontSize: 16 }}>
                  {files.map((f, i) => <option key={f} value={i}>{f}</option>)}
                </select>
              </div>
            )}
            {panelBody}
          </div>
        )}

        <div ref={boxRef} onScroll={onScroll} style={{ flex: 1, overflow: 'auto', padding: '12px 12px 70px', WebkitOverflowScrolling: 'touch', touchAction: 'pan-x pan-y' }}>
          {error && <div style={{ color: '#fca5a5', textAlign: 'center', marginTop: '3rem' }}>{error}</div>}
          {!pdf && !error && (
            <div style={{ color: '#94a3b8', textAlign: 'center', marginTop: '3rem', display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center' }}>
              <Loader2 size={18} className="spin" /> Abriendo libro...
            </div>
          )}
          <div ref={pagesRef} style={{ width: Math.max(width, boxWidth), margin: '0 auto' }}>
            {pdf && width > 0 && Array.from({ length: numPages }, (_, i) => (
              <Page key={`${fileIdx}-${i}`} pdf={pdf} n={i + 1} width={width} ratio={ratio} mark={mark} hits={hitsByPage[i + 1]} />
            ))}
          </div>
        </div>

        {/* Navegación de páginas (abajo, cómoda en el celular) */}
        {pdf && (
          <div style={{ position: 'absolute', left: '50%', bottom: 14, transform: 'translateX(-50%)', zIndex: 2, display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(15,23,42,0.92)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 999, padding: '4px 6px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)', color: '#e2e8f0', marginLeft: sidePanel ? 160 : 0 }}>
            <button onClick={() => goTo(page - 1)} disabled={page <= 1} aria-label="Página anterior" style={{ ...tb, border: 'none', borderRadius: 999, opacity: page <= 1 ? 0.4 : 1 }}><ChevronLeft size={18} /></button>
            <form onSubmit={e => { e.preventDefault(); goTo(parseInt(pageInput, 10) || page) }} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem' }}>
              <input value={pageInput} onChange={e => setPageInput(e.target.value.replace(/\D/g, ''))} onFocus={e => e.target.select()} inputMode="numeric" enterKeyHint="go" aria-label="Ir a la página"
                style={{ width: 44, textAlign: 'center', background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, padding: '3px 2px', fontSize: 16, userSelect: 'text', WebkitUserSelect: 'text' }} />
              <span style={{ color: '#94a3b8', whiteSpace: 'nowrap' }}>/ {numPages}</span>
            </form>
            <button onClick={() => goTo(page + 1)} disabled={page >= numPages} aria-label="Página siguiente" style={{ ...tb, border: 'none', borderRadius: 999, opacity: page >= numPages ? 0.4 : 1 }}><ChevronRight size={18} /></button>
            {narrow && (
              <>
                <span style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.15)', margin: '0 2px' }} />
                <button onClick={() => applyZoom(z => z - 0.25)} aria-label="Alejar" style={{ ...tb, border: 'none', borderRadius: 999 }}><ZoomOut size={16} /></button>
                <button onClick={() => applyZoom(z => z + 0.25)} aria-label="Acercar" style={{ ...tb, border: 'none', borderRadius: 999 }}><ZoomIn size={16} /></button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const tb = { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#e2e8f0', borderRadius: 8, padding: '0.35rem 0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }
const tbOn = { background: 'rgba(37,99,235,0.35)', borderColor: 'rgba(96,165,250,0.6)' }
const tbLabel = { fontSize: '0.8rem', fontWeight: 600 }
const tocBtn = { display: 'flex', width: '100%', gap: 10, alignItems: 'baseline', textAlign: 'left', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.04)', padding: '0.55rem 0.9rem', fontSize: '0.82rem', lineHeight: 1.3, cursor: 'pointer', background: 'transparent', color: '#cbd5e1' }
const muted = { color: '#94a3b8', fontSize: '0.8rem', padding: '0.6rem 0.9rem', margin: 0 }
