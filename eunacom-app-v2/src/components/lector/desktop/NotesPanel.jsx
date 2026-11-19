import React, { useEffect, useState } from 'react'
import { Bookmark, Pencil, Trash2, X } from 'lucide-react'
import { HL_COLORS, hlColor } from '../../../lib/lector/userData'
import { topicTextBetween } from '../../../lib/lector/content'

// «Mis notas y destacados»: del tema abierto o de todo el libro, por color. Clic en un texto = ir al lugar.
// La nota se edita aquí mismo; también están los marcadores del libro.
export default function NotesPanel({ bookKey, topics, byId, topic, data, store, escRef, onJump, onOpen, onClose }) {
  const [scope, setScope] = useState('tema') // 'tema' | 'libro' | 'marcas'
  const [color, setColor] = useState('all')
  const [editing, setEditing] = useState(null) // { id, value }
  const [asking, setAsking] = useState(null) // id del destacado que se está por quitar

  const order = (a, b) => ((byId[a.topicId]?.index ?? 1e6) - (byId[b.topicId]?.index ?? 1e6)) || (a.start - b.start)
  const all = data.highlights.filter(h => h.bookKey === bookKey && byId[h.topicId]).sort(order)
  const here = all.filter(h => h.topicId === topic.id)
  const marks = data.bookmarks.filter(b => b.bookKey === bookKey && byId[b.topicId]).sort((a, b) => byId[a.topicId].index - byId[b.topicId].index)
  const base = scope === 'libro' ? all : here
  const list = color === 'all' ? base : color === 'notas' ? base.filter(h => h.note) : base.filter(h => h.color === color)

  // Escape: primero deja de editar la nota
  useEffect(() => {
    escRef.current = editing || asking ? () => { setEditing(null); setAsking(null); return true } : null
    return () => { escRef.current = null }
  }, [editing, asking, escRef])
  useEffect(() => {
    if (!asking) return undefined
    const t = setTimeout(() => setAsking(null), 5000)
    return () => clearTimeout(t)
  }, [asking])

  const saveNote = () => { if (editing) store.updateHighlight(editing.id, { note: editing.value.trim() }); setEditing(null) }
  const card = h => {
    const c = hlColor(h.color)
    const edit = editing?.id === h.id
    return (
      <div key={h.id} className="lwd-hl" style={{ '--c': c.color }}>
        <button className="lwd-hl-q" onClick={() => onJump(h)} title="Ir a este texto">{topicTextBetween(byId[h.topicId], h.start, h.end) || h.text}</button>
        {edit ? (
          <div className="lwd-hl-edit">
            <textarea autoFocus value={editing.value} maxLength={2000} rows={3} placeholder="Escribe tu nota sobre este texto…" aria-label="Nota"
              onFocus={e => { const n = e.target.value.length; e.target.setSelectionRange(n, n) }}
              onChange={e => setEditing({ id: h.id, value: e.target.value })}
              onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); saveNote() } }} />
            <div><button className="pri" onClick={saveNote}>Guardar</button><button onClick={() => setEditing(null)}>Cancelar</button></div>
          </div>
        ) : h.note ? (
          <button className="lwd-hl-note" onClick={() => setEditing({ id: h.id, value: h.note })} title="Editar la nota">{h.note}</button>
        ) : null}
        <div className="lwd-hl-f">
          <small>{c.label}</small>
          {!edit && (
            <button onClick={() => setEditing({ id: h.id, value: h.note || '' })} aria-label={h.note ? 'Editar la nota' : 'Agregar una nota'} title={h.note ? 'Editar la nota' : 'Agregar una nota'}>
              <Pencil size={13} />{h.note ? '' : 'Nota'}
            </button>
          )}
          {asking === h.id
            ? <button className="del sure" onClick={() => { store.removeHighlight(h.id); setAsking(null) }}>Quitar</button>
            : <button className="del" onClick={() => setAsking(h.id)} aria-label="Quitar el destacado" title="Quitar el destacado"><Trash2 size={13} /></button>}
        </div>
      </div>
    )
  }

  return (
    <aside className="lwd-notes" aria-label="Mis notas y destacados">
      <div className="lwd-notes-h">
        <b>Mis notas y destacados</b>
        <button onClick={onClose} aria-label="Cerrar el panel"><X size={17} /></button>
      </div>
      <div className="lwd-ntabs" role="tablist">
        {[['tema', `Este tema · ${here.length}`], ['libro', `Todo el libro · ${all.length}`], ['marcas', `Marcadores · ${marks.length}`]].map(([id, label]) => (
          <button key={id} role="tab" aria-selected={scope === id} className={scope === id ? 'on' : ''} onClick={() => setScope(id)}>{label}</button>
        ))}
      </div>

      {scope !== 'marcas' && (
        <div className="lwd-chips">
          <button className={color === 'all' ? 'on' : ''} onClick={() => setColor('all')}>Todos</button>
          {HL_COLORS.map(c => <button key={c.id} className={color === c.id ? 'on' : ''} onClick={() => setColor(c.id)}><i style={{ background: c.color }} />{c.label}</button>)}
          <button className={color === 'notas' ? 'on' : ''} onClick={() => setColor('notas')}>Con nota</button>
        </div>
      )}

      <div className="lwd-notes-s">
        {scope === 'tema' && <p className="lwd-where">{topic.label} · {topic.title}</p>}
        {scope !== 'marcas' && (list.length === 0 ? (
          <div className="lwd-none">
            <b>{base.length ? 'Nada con ese filtro' : scope === 'tema' ? 'Todavía no destacas nada en este tema' : 'Todavía no destacas nada en este libro'}</b>
            {!base.length && 'Selecciona un texto con el mouse y elige un color: Importante, Ya lo sé o Repasar. Con «Nota» puedes escribir algo sobre ese texto.'}
          </div>
        ) : scope === 'libro' ? (
          // todo el libro: por tema (en el orden del libro); dentro de cada tema, el color se ve en cada tarjeta
          [...new Set(list.map(h => h.topicId))].map(id => {
            const group = list.filter(h => h.topicId === id)
            return (
              <section key={id}>
                <div className="lwd-group topic"><b>{byId[id].label}</b>{byId[id].title}<span>{group.length}</span></div>
                {group.map(card)}
              </section>
            )
          })
        ) : HL_COLORS.map(c => {
          const group = list.filter(h => h.color === c.id)
          if (!group.length) return null
          return (
            <section key={c.id}>
              <div className="lwd-group"><i style={{ background: c.color }} />{c.label}<span>{group.length}</span></div>
              {group.map(card)}
            </section>
          )
        }))}

        {scope === 'marcas' && (marks.length === 0 ? (
          <div className="lwd-none"><b>Sin marcadores todavía</b>Usa el marcador de la barra del tema (o la tecla B) para guardar un tema aquí.</div>
        ) : marks.map(b => (
          <div key={b.id} className="lwd-bm">
            <button className="lwd-bm-go" onClick={() => onOpen(b.topicId)}>
              <Bookmark size={15} fill="currentColor" />
              <span><b>{byId[b.topicId].label} · {byId[b.topicId].title}</b><small>Bloque {byId[b.topicId].block.n} · {byId[b.topicId].block.name}</small></span>
            </button>
            <button className="del" onClick={() => store.toggleBookmark({ bookKey, topicId: b.topicId })} aria-label="Quitar el marcador" title="Quitar el marcador"><Trash2 size={14} /></button>
          </div>
        )))}
      </div>
    </aside>
  )
}
