import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Search, CornerDownLeft } from 'lucide-react'
import { searchBook } from '../../../lib/lector/content'

const MAX_TOPICS = 40
const SNIPPETS = 3 // fragmentos por tema; «Ver N más» muestra el resto (hasta SNIPPETS_MAX)
const SNIPPETS_MAX = 30

// Buscador del libro (⌘K / Ctrl+K): temas por número o título y texto de todo el libro.
// ↑ ↓ para moverse, Enter abre en el lugar, ⌘/Ctrl+Enter en una pestaña nueva.
// newTab: se abrió con «+» (Abrir otro tema): Enter abre en una pestaña nueva.
export default function Palette({ book, topics, isMac, newTab: alwaysNew = false, onOpen, onClose }) {
  const [more, setMore] = useState(() => new Set()) // temas con todos sus fragmentos a la vista
  const [q, setQ] = useState('')
  const [query, setQuery] = useState('') // lo que ya se buscó (se busca al dejar de escribir)
  const [sel, setSel] = useState(0)
  const listRef = useRef(null)

  useEffect(() => {
    const t = setTimeout(() => setQuery(q.trim()), 160)
    return () => clearTimeout(t)
  }, [q])

  // el texto del libro se prepara al abrir (no al escribir la primera búsqueda)
  useEffect(() => { const t = setTimeout(() => searchBook(book, 'zz', { perTopic: 0 }), 60); return () => clearTimeout(t) }, [book])
  // filas: el tema (va a la primera aparición) y debajo sus fragmentos
  const { rows, total, nTopics } = useMemo(() => {
    const out = []
    if (query.length < 1) return { rows: out, total: 0, nTopics: 0 }
    const seen = new Set()
    // por número de tema («3.2»)
    if (/^\d/.test(query)) for (const t of topics) if (t.label.startsWith(query) && out.length < 12) { out.push({ topic: t, hit: null, head: true, count: 0 }); seen.add(t.id) }
    const res = query.length >= 2 ? searchBook(book, query, { perTopic: SNIPPETS_MAX }) : []
    let total = 0
    for (const r of res) total += r.count
    for (const r of res.slice(0, MAX_TOPICS)) {
      if (!seen.has(r.topic.id)) out.push({ topic: r.topic, hit: r.hits[0] || null, head: true, count: r.count })
      const all = more.has(r.topic.id)
      for (const h of all ? r.hits : r.hits.slice(0, SNIPPETS)) out.push({ topic: r.topic, hit: h })
      if (!all && r.hits.length > SNIPPETS) out.push({ topic: r.topic, more: r.hits.length - SNIPPETS })
    }
    return { rows: out, total, nTopics: res.length }
  }, [book, topics, query, more])

  useEffect(() => { setSel(0); setMore(new Set()) }, [query])
  useEffect(() => { listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' }) }, [sel, rows])

  const go = (row, newTab) => {
    if (!row) return
    if (row.more) { setMore(m => new Set(m).add(row.topic.id)); return }
    onOpen(row.topic.id, row.hit, row.hit ? query : '', newTab || alwaysNew)
  }
  const onKey = e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSel(s => Math.min(rows.length - 1, s + 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSel(s => Math.max(0, s - 1)) }
    else if (e.key === 'Enter') { e.preventDefault(); if (q.trim() !== query) return; go(rows[sel], e.metaKey || e.ctrlKey) }
  }

  return (
    <div className="lwd-pal-back" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="lwd-pal" role="dialog" aria-label="Buscar en el libro">
        <div className="lwd-pal-in">
          <Search size={18} />
          <input autoFocus value={q} maxLength={120} onChange={e => setQ(e.target.value)} onKeyDown={onKey} placeholder="Busca un tema o una palabra (ej.: amiodarona, 3.2)"
            role="combobox" aria-expanded="true" aria-controls="lwd-pal-list" aria-label="Buscar en el libro" autoComplete="off" autoCorrect="off" spellCheck={false} />
          <kbd>Esc</kbd>
        </div>
        <div className="lwd-pal-list" id="lwd-pal-list" role="listbox" ref={listRef}>
          {query.length < 2 && rows.length === 0 && q.trim().length >= 2 && <p className="lwd-pal-none" aria-live="polite"><b>Cargando…</b>Preparando el buscador del libro.</p>}
          {query.length < 2 && rows.length === 0 && q.trim().length < 2 && <p className="lwd-pal-none"><b>Busca en todo el libro</b>Escribe al menos dos letras, o el número de un tema. No importan las tildes ni las mayúsculas.</p>}
          {query.length >= 2 && rows.length === 0 && <p className="lwd-pal-none"><b>Sin resultados</b>No encontramos «{query.length > 60 ? `${query.slice(0, 60)}…` : query}» en este libro.</p>}
          {rows.map((r, i) => (
            <button key={i} role="option" aria-selected={i === sel} className={`lwd-pal-r ${r.head ? 'head' : ''} ${r.more ? 'more' : ''}`}
              onMouseMove={() => { if (sel !== i) setSel(i) }} onClick={e => go(r, e.metaKey || e.ctrlKey)}>
              {r.more
                ? <span>Ver {r.more} más en este tema</span>
                : r.head
                ? <><i>{r.topic.label}</i><span>{r.topic.title}</span>{r.count > 0 && <em>{r.count} {r.count === 1 ? 'vez' : 'veces'}</em>}</>
                : <span className="frag">…{r.hit.pre}<mark>{r.hit.match}</mark>{r.hit.post}…</span>}
              {i === sel && <CornerDownLeft size={14} className="ret" />}
            </button>
          ))}
        </div>
        <div className="lwd-pal-f">
          <span>{total > 0 ? `${total} ${total === 1 ? 'aparición' : 'apariciones'} en ${nTopics} ${nTopics === 1 ? 'tema' : 'temas'}` : ' '}</span>
          <span><kbd>↑</kbd><kbd>↓</kbd> moverse</span>{alwaysNew
            ? <span><kbd>Enter</kbd> abrir en una pestaña nueva</span>
            : <><span><kbd>Enter</kbd> abrir</span><span><kbd>{isMac ? '⌘' : 'Ctrl'}</kbd><kbd>Enter</kbd> pestaña nueva</span></>}
        </div>
      </div>
    </div>
  )
}
