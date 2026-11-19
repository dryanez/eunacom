import React, { useEffect, useRef, useState } from 'react'
import { ArrowLeft, X } from 'lucide-react'
import { searchBook } from '../../../lib/lector/content'

// Buscador en todo el libro: resultados por tema, con el fragmento donde aparece. Tocar uno lleva al lugar.
// state = { q, results } vive en el lector, así al volver se conserva la búsqueda.
// Por tema se ven 3 fragmentos; «Ver N más» muestra el resto (hasta SNIPPETS_MAX; después, el tema las marca todas).
const SNIPPETS = 3
const SNIPPETS_MAX = 30
export default function SearchScreen({ book, state, onState, onBack, onOpen, hidden = false }) {
  const { q, results } = state
  const timer = useRef(0)
  const [more, setMore] = useState(() => new Set()) // temas con todos sus fragmentos a la vista
  useEffect(() => { setMore(new Set()) }, [results?.q])
  useEffect(() => () => clearTimeout(timer.current), [])
  // el texto del libro se prepara al abrir el buscador (no al escribir la primera búsqueda)
  useEffect(() => { if (hidden) return undefined; const t = setTimeout(() => searchBook(book, 'zz', { perTopic: 0 }), 60); return () => clearTimeout(t) }, [book, hidden])

  const run = value => {
    clearTimeout(timer.current)
    onState(s => ({ ...s, q: value }))
    // el texto del libro se prepara una sola vez; se busca cuando se deja de escribir
    timer.current = setTimeout(() => {
      const query = value.trim()
      onState(s => (s.q === value ? { ...s, results: query.length < 2 ? null : { q: query, list: searchBook(book, query, { perTopic: SNIPPETS_MAX }) } } : s))
    }, 220)
  }
  const total = results?.list.reduce((a, r) => a + r.count, 0) || 0

  return (
    <div className="lw-over" style={hidden ? { visibility: 'hidden' } : undefined} aria-hidden={hidden || undefined}>
      <form className="lw-top" onSubmit={e => { e.preventDefault(); e.currentTarget.querySelector('input')?.blur() }} role="search">
        <button type="button" className="lw-ib plain" onClick={onBack} aria-label="Volver"><ArrowLeft size={20} /></button>
        <input className="lw-search-in" autoFocus value={q} maxLength={120} onChange={e => run(e.target.value)} placeholder="Buscar en el libro (ej.: amiodarona)" enterKeyHint="search"
          autoComplete="off" autoCorrect="off" spellCheck={false} aria-label="Buscar en el libro" />
        {q && <button type="button" className="lw-ib" onClick={() => run('')} aria-label="Borrar"><X size={17} /></button>}
      </form>
      <div className="lw-scroll">
        <div className="lw-list">
          {!results && q.trim().length >= 2 && <div className="lw-empty" aria-live="polite"><b>Cargando…</b>Preparando el buscador del libro.</div>}
          {!results && q.trim().length < 2 && <div className="lw-empty"><b>Busca en todo el libro</b>Escribe al menos dos letras. No importan las tildes ni las mayúsculas.</div>}
          {results && results.list.length === 0 && <div className="lw-empty"><b>Sin resultados</b>No encontramos «{results.q.length > 60 ? `${results.q.slice(0, 60)}…` : results.q}» en este libro.</div>}
          {results && results.list.length > 0 && (
            <p className="lw-count">{total} {total === 1 ? 'aparición' : 'apariciones'} en {results.list.length} {results.list.length === 1 ? 'tema' : 'temas'}</p>
          )}
          {results?.list.map(r => (
            <section key={r.topic.id}>
              <button className="lw-res-h" onClick={() => onOpen(r.topic.index, r.hits[0] || null, results.q)}>
                <i>{r.topic.label}</i><span>{r.topic.title}</span>{r.count > 0 && <em>{r.count}</em>}
              </button>
              {(more.has(r.topic.id) ? r.hits : r.hits.slice(0, SNIPPETS)).map((h, i) => (
                <button key={i} className="lw-res" onClick={() => onOpen(r.topic.index, h, results.q)}>
                  …{h.pre}<mark>{h.match}</mark>{h.post}…
                </button>
              ))}
              {r.hits.length > SNIPPETS && !more.has(r.topic.id) && (
                <button className="lw-res-more" onClick={() => setMore(m => new Set(m).add(r.topic.id))}>
                  Ver {r.hits.length - SNIPPETS} más en este tema
                </button>
              )}
              {more.has(r.topic.id) && r.count > r.hits.length && (
                <button className="lw-res-more" onClick={() => onOpen(r.topic.index, r.hits[r.hits.length - 1], results.q)}>
                  Abrir el tema para ver las {r.count - r.hits.length} restantes
                </button>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
