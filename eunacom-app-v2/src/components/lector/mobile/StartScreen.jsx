import React from 'react'
import { X, Search, ChevronRight, Check, Highlighter, StickyNote, Bookmark, FileText, BookOpen } from 'lucide-react'
import { bookCover } from '../../../lib/lector/content'

// Inicio del libro: portada, «Continuar donde quedaste», avance e índice por bloque.
export default function StartScreen({ item, fileIdx = 0, title, book, bookKey, topics, data, prog, onClose, onOpen, onOpenId, onLists, onSearch, onAa, onPdf }) {
  const done = prog?.done || {}
  const nDone = topics.filter(t => done[t.id]).length
  const last = prog?.topicId ? topics.find(t => t.id === prog.topicId) : null
  const hl = data.highlights.filter(h => h.bookKey === bookKey)
  const notes = hl.filter(h => h.note).length
  const marks = data.bookmarks.filter(b => b.bookKey === bookKey).length
  const pct = topics.length ? Math.round((nDone / topics.length) * 100) : 0
  const cover = bookCover(item, fileIdx)
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`

  return (
    <>
      <div className="lw-top">
        <button className="lw-ib plain" onClick={onClose} aria-label="Cerrar el libro"><X size={20} /></button>
        <div className="lw-top-t"><b>{title || book.title}</b></div>
        <button className="lw-ib" onClick={onSearch} aria-label="Buscar en el libro"><Search size={18} /></button>
        <button className="lw-ib" onClick={onAa} aria-label="Letra y tema">Aa</button>
      </div>
      <div className="lw-scroll">
        <div className="lw-start">
          <header className="lw-hero">
            {cover && <img src={cover} alt="" draggable={false} />}
            <div>
              <div className="lw-hero-k">{book.module}</div>
              <h1>{book.title}</h1>
              {book.subtitle && <p>{book.subtitle}</p>}
            </div>
          </header>

          <button className="lw-continue" onClick={() => (last ? onOpenId(last.id, { scroll: prog.scroll }) : onOpen(0))}>
            <BookOpen size={22} />
            <span>
              <small>{last ? 'Continuar donde quedaste' : 'Empezar a leer'}</small>
              <b>{last ? `${last.label} · ${last.title}` : topics[0] ? `${topics[0].label} · ${topics[0].title}` : ''}</b>
            </span>
            <ChevronRight size={20} />
          </button>

          <div className="lw-prog">
            <div className="lw-prog-l"><span><b>{nDone}</b> de {topics.length} temas estudiados</span><span>{pct} %</span></div>
            <div className="lw-bar" role="progressbar" aria-valuemin={0} aria-valuemax={topics.length} aria-valuenow={nDone}><i style={{ width: `${pct}%` }} /></div>
          </div>

          <div className="lw-quick">
            <button onClick={() => onLists('hl')}><Highlighter size={18} /><b>Mis destacados</b><small>{plural(hl.length, 'texto', 'textos')}</small></button>
            <button onClick={() => onLists('notes')}><StickyNote size={18} /><b>Notas</b><small>{plural(notes, 'nota', 'notas')}</small></button>
            <button onClick={() => onLists('marks')}><Bookmark size={18} /><b>Marcadores</b><small>{plural(marks, 'tema', 'temas')}</small></button>
          </div>

          {(book.blocks || []).map(b => {
            const list = topics.filter(t => t.block.n === b.n)
            return (
              <section key={b.n}>
                <div className="lw-toc-b"><div>Bloque {b.n} · {b.name}</div><span>{list.filter(t => done[t.id]).length}/{list.length}</span></div>
                <div className="lw-toc">
                  {list.map(t => (
                    <button key={t.id} className={`lw-toc-t ${last?.id === t.id ? 'cur' : ''}`} onClick={() => onOpen(t.index)}>
                      <span className="lw-toc-n">{t.label}</span>
                      <span>{t.title}</span>
                      <span className={`lw-tick ${done[t.id] ? 'on' : ''}`} aria-label={done[t.id] ? 'Estudiado' : 'Sin estudiar'}><Check size={14} strokeWidth={3} /></span>
                    </button>
                  ))}
                </div>
              </section>
            )
          })}

          <button className="lw-btn lw-start-pdf" onClick={onPdf}><FileText size={16} />PDF original</button>
        </div>
      </div>
    </>
  )
}
