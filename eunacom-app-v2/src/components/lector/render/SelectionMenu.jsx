// Selección de texto → menú chico (Importante / Ya lo sé / Repasar / Nota). Sobre un destacado: cambiar color,
// editar la nota o quitarlo. No hay «Copiar»: copiar y cortar están bloqueados (useProtection).
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { BookOpen, Pencil, Trash2, X } from 'lucide-react'
import { HL_COLORS, hlColor } from '../../../lib/lector/userData'
import { plainText } from '../../../lib/lector/content'
import { displayBetween, selectionOffsets } from './anchors'
import { isTouch, useEscapeLayer } from './useProtection'
import { useHistoryLayer } from '../../../lib/lector/nav'

const menuW = () => Math.min(344, window.innerWidth - 16)

function place(rect, rows = 1) {
  const h = rows * 44 + 8
  const w = menuW()
  const x = Math.min(window.innerWidth - w - 8, Math.max(8, rect.left + rect.width / 2 - w / 2))
  // en táctil va debajo de la selección: arriba aparece el menú del sistema
  const below = rect.bottom + (isTouch() ? 26 : 10), above = rect.top - h - 10
  const fitsBelow = below + h < window.innerHeight - 70, fitsAbove = above > 56
  const y = isTouch() ? (fitsBelow ? below : fitsAbove ? above : window.innerHeight - h - 80) : (fitsAbove ? above : below)
  return { x, y }
}

export function NoteSheet({ hl, onSave, onRemoveNote, onClose }) {
  const [v, setV] = useState(hl.note || '')
  const [warn, setWarn] = useState(false) // se quiso cerrar con texto sin guardar
  const c = hlColor(hl.color)
  const dirty = v.trim() !== (hl.note || '').trim()
  const live = useRef({})
  live.current = { v, dirty }
  const save = () => onSave(v.trim())
  // cerrar con Escape, la X o tocando fuera: si hay texto sin guardar, primero se pregunta
  const dismiss = () => { if (live.current.dirty && !warn) setWarn(true); else onClose() }
  useEscapeLayer(dismiss) // Escape cierra solo la hoja
  // «Atrás» del teléfono no puede esperar una respuesta: guarda lo escrito (no se pierde) y cierra
  useHistoryLayer(true, () => { if (live.current.dirty) onSave(live.current.v.trim()); else onClose() })
  return (
    <div data-lw-ui="">
      <div className="lw-dim" onClick={dismiss} />
      <div className="lw-sheet" role="dialog" aria-label="Nota">
        <div className="lw-sheet-h"><strong>Nota</strong><button onClick={dismiss} aria-label="Cerrar" className="lw-sheet-x"><X size={18} /></button></div>
        <p className="lw-sheet-q" style={{ borderLeftColor: c.color }}>«{hl.text}»</p>
        <textarea autoFocus value={v} onChange={e => { setV(e.target.value); setWarn(false) }} placeholder="Escribe tu nota sobre este texto…" maxLength={2000} rows={4}
          onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); save() } }} />
        {warn ? (
          <div className="lw-sheet-b lw-sheet-warn" role="alert">
            <span>Tienes una nota sin guardar.</span>
            <button className="lw-btn" onClick={onClose}>Descartar</button>
            <button className="lw-btn pri" onClick={save}>Guardar</button>
          </div>
        ) : (
          <div className="lw-sheet-b">
            {hl.id && hl.note && <button className="lw-btn" onClick={onRemoveNote}><Trash2 size={15} />Quitar nota</button>}
            <button className="lw-btn pri" onClick={save}>Guardar</button>
          </div>
        )}
      </div>
    </div>
  )
}

// Mientras el menú de colores está abierto, Escape lo cierra solo a él (no cierra el tema ni el lector)
function MenuEscape({ onEscape }) { useEscapeLayer(onEscape); return null }

/**
 * useHighlighter({ rootRef, store, bookKey, topic, highlights, enabled })
 * → { element, onMarkTap(id, el, extra?), hide() }.  `element` va dentro del lector (posición fija).
 *   extra: { label, run } → una acción más en el menú del destacado (p. ej. «Ver qué es …» cuando el destacado cubre un término).
 */
export function useHighlighter({ rootRef, store, bookKey, topic, highlights, enabled = true }) {
  const [bar, setBar] = useState(null) // { mode: 'new', sel, x, y } | { mode: 'edit', id, x, y }
  const [noteFor, setNoteFor] = useState(null) // destacado existente, o { isNew, start, end, text, color }
  const busy = useRef(0)
  const live = useRef({})
  live.current = { highlights, topic }

  // selección → menú
  useEffect(() => {
    if (!enabled) return undefined
    let t = 0
    const read = () => {
      const root = rootRef.current
      if (!root) return
      const sel = window.getSelection()
      const range = sel && sel.rangeCount && !sel.isCollapsed ? sel.getRangeAt(0) : null
      const s = range && range.intersectsNode(root) ? selectionOffsets(root, range) : null
      if (s) setBar({ mode: 'new', sel: s, ...place(s.rect) })
      else if (Date.now() - busy.current > 700) setBar(b => (b?.mode === 'new' ? null : b))
    }
    const onSel = () => { clearTimeout(t); t = setTimeout(read, 220) }
    document.addEventListener('selectionchange', onSel)
    return () => { clearTimeout(t); document.removeEventListener('selectionchange', onSel) }
  }, [rootRef, enabled])

  // el menú de un destacado se cierra al tocar fuera o al desplazar
  useEffect(() => {
    if (!bar) return undefined
    const down = e => { if (e.target.closest?.('.lw-selmenu')) return; if (bar.mode === 'edit' && !e.target.closest?.('mark[data-lw="hl"]')) setBar(null) }
    const scroll = () => setBar(b => (b?.mode === 'edit' ? null : b))
    document.addEventListener('pointerdown', down, true)
    const sc = rootRef.current?.closest('.lw-scroll')
    sc?.addEventListener('scroll', scroll, { passive: true })
    return () => { document.removeEventListener('pointerdown', down, true); sc?.removeEventListener('scroll', scroll) }
  }, [bar, rootRef])

  useEffect(() => { setBar(null); setNoteFor(null) }, [topic?.id])

  const clearSel = () => { try { window.getSelection()?.removeAllRanges() } catch { /* nada */ } }
  // texto del destacado unido (al juntar varios): lo visible, con espacio entre celdas y párrafos
  const textOf = useCallback((s, e) => (rootRef.current ? displayBetween(rootRef.current, s, e) : plainText(live.current.topic).slice(s, e).replace(/\s+/g, ' ').trim().slice(0, 400)), [rootRef])
  const create = useCallback((sel, color, note) =>
    store.mergeHighlight({ bookKey, topicId: live.current.topic.id, start: sel.start, end: sel.end, color, text: sel.text, ...(note != null ? { note } : {}) }, textOf),
  [store, bookKey, textOf])

  const current = bar?.mode === 'edit' ? highlights.find(h => h.id === bar.id) : null
  const pick = color => {
    if (bar.mode === 'new') { create(bar.sel, color); clearSel() }
    else if (current) store.updateHighlight(current.id, { color })
    setBar(null)
  }
  const note = () => {
    if (bar.mode === 'new') { setNoteFor({ ...bar.sel, color: 'imp', isNew: true }); clearSel() }
    else if (current) setNoteFor(current)
    setBar(null)
  }
  const remove = () => { if (current) store.removeHighlight(current.id); setBar(null) }

  const onMarkTap = useCallback((id, el, extra = null) => {
    if (!window.getSelection()?.isCollapsed) return
    const hl = live.current.highlights.find(h => h.id === id)
    if (!hl) return
    setBar({ mode: 'edit', id, extra, ...place(el.getBoundingClientRect(), extra ? 3 : 2) })
  }, [])

  const hold = e => { e.preventDefault(); busy.current = Date.now() }
  const element = (
    <>
      {bar && (bar.mode === 'new' || current) && (
        <MenuEscape onEscape={() => { if (bar.mode === 'new') clearSel(); busy.current = 0; setBar(null) }} />
      )}
      {bar && (bar.mode === 'new' || current) && (
        <div className={`lw-selmenu ${bar.mode}`} data-lw-ui="" style={{ left: bar.x, top: bar.y, width: menuW() }} role="toolbar" aria-label="Destacar"
          onPointerDown={hold} onMouseDown={e => e.preventDefault()}>
          {HL_COLORS.map(c => (
            <button key={c.id} type="button" className={`lw-selc${current?.color === c.id ? ' on' : ''}`} onClick={() => pick(c.id)}>
              <i style={{ background: c.color }} />{c.label}
            </button>
          ))}
          <button type="button" className="lw-selc nota" onClick={note}><Pencil size={13} />{current?.note ? 'Editar nota' : 'Nota'}</button>
          {bar.mode === 'edit' && <button type="button" className="lw-selc del" onClick={remove}><Trash2 size={13} />Quitar</button>}
          {bar.mode === 'edit' && bar.extra && (
            <button type="button" className="lw-selc lw-selx" onClick={() => { const run = bar.extra.run; setBar(null); run() }}>
              <BookOpen size={14} /><span>{bar.extra.label}</span>
            </button>
          )}
        </div>
      )}
      {noteFor && (
        <NoteSheet hl={noteFor} onClose={() => setNoteFor(null)}
          onRemoveNote={() => { store.updateHighlight(noteFor.id, { note: '' }); setNoteFor(null) }}
          onSave={v => {
            if (noteFor.isNew) { if (v) create(noteFor, noteFor.color, v) }
            else store.updateHighlight(noteFor.id, { note: v })
            setNoteFor(null)
          }} />
      )}
    </>
  )
  return { element, onMarkTap, hide: () => setBar(null) }
}

export default useHighlighter
