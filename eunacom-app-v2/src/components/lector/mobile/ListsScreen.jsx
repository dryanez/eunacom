import React from 'react'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { HL_COLORS, hlColor } from '../../../lib/lector/userData'
import { topicTextBetween } from '../../../lib/lector/content'

// «Mis destacados» (por color), «Notas» y «Marcadores» del libro. Tocar uno lleva al lugar.
export default function ListsScreen({ bookKey, topics, data, store, tab, onTab, onBack, onOpenId, hidden = false }) {
  const byId = Object.fromEntries(topics.map(t => [t.id, t]))
  const order = (a, b) => ((byId[a.topicId]?.index ?? 1e6) - (byId[b.topicId]?.index ?? 1e6)) || (a.start - b.start)
  const hl = data.highlights.filter(h => h.bookKey === bookKey && byId[h.topicId]).sort(order)
  const notes = hl.filter(h => h.note)
  const marks = data.bookmarks.filter(b => b.bookKey === bookKey && byId[b.topicId]).sort((a, b) => byId[a.topicId].index - byId[b.topicId].index)
  const where = id => `${byId[id].label} · ${byId[id].title}`
  const go = h => onOpenId(h.topicId, { focus: { start: h.start, end: h.end } })
  // texto con espacio entre celdas (los destacados viejos se guardaron con las celdas pegadas)
  const txt = h => topicTextBetween(byId[h.topicId], h.start, h.end) || h.text

  return (
    <div className="lw-over" style={hidden ? { visibility: 'hidden' } : undefined} aria-hidden={hidden || undefined}>
      <div className="lw-top">
        <button className="lw-ib plain" onClick={onBack} aria-label="Volver"><ArrowLeft size={20} /></button>
        <div className="lw-top-t"><b>Mis apuntes</b></div>
      </div>
      <div className="lw-tabs" role="tablist">
        {[['hl', `Destacados (${hl.length})`], ['notes', `Notas (${notes.length})`], ['marks', `Marcadores (${marks.length})`]].map(([id, label]) => (
          <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'on' : ''} onClick={() => onTab(id)}>{label}</button>
        ))}
      </div>
      <div className="lw-scroll">
        <div className="lw-list">
          {tab === 'hl' && (hl.length === 0
            ? <div className="lw-empty"><b>Todavía no destacas nada</b>Mantén el dedo sobre una palabra, ajusta la selección y elige un color: Importante, Ya lo sé o Repasar.</div>
            : HL_COLORS.map(c => {
              const list = hl.filter(h => h.color === c.id)
              if (!list.length) return null
              return (
                <section key={c.id}>
                  <div className="lw-group"><i style={{ background: c.color }} />{c.label}<span>{list.length}</span></div>
                  {list.map(h => (
                    <button key={h.id} className="lw-item" style={{ '--c': c.color }} onClick={() => go(h)}>
                      <span className="q">{txt(h)}</span>
                      {h.note && <span className="q small">Nota: {h.note}</span>}
                      <small>{where(h.topicId)}</small>
                    </button>
                  ))}
                </section>
              )
            }))}

          {tab === 'notes' && (notes.length === 0
            ? <div className="lw-empty"><b>Sin notas todavía</b>Selecciona un texto y toca «Nota» para escribir algo sobre él.</div>
            : notes.map(h => (
              <button key={h.id} className="lw-item" style={{ '--c': hlColor(h.color).color, marginTop: 12 }} onClick={() => go(h)}>
                <span className="note">{h.note}</span>
                <span className="q small">«{txt(h)}»</span>
                <small>{where(h.topicId)}</small>
              </button>
            )))}

          {tab === 'marks' && (marks.length === 0
            ? <div className="lw-empty"><b>Sin marcadores todavía</b>Toca el marcador de arriba a la derecha en un tema para guardarlo aquí.</div>
            : <div style={{ marginTop: 12 }}>{marks.map(b => (
              <div key={b.id} className="lw-row">
                <button className="lw-item" onClick={() => onOpenId(b.topicId)}>
                  <span className="q" style={{ fontFamily: 'inherit', fontWeight: 700 }}>{where(b.topicId)}</span>
                  <small>Bloque {byId[b.topicId].block.n} · {byId[b.topicId].block.name}</small>
                </button>
                <button className="lw-rm" onClick={() => store.toggleBookmark({ bookKey, topicId: b.topicId })} aria-label="Quitar marcador"><Trash2 size={16} /></button>
              </div>
            ))}</div>)}
        </div>
      </div>
    </div>
  )
}
