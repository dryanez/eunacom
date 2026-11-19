import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, Columns2, Plus, Search, X } from 'lucide-react'
import { norm } from '../../../lib/lector/content'

// Índice del libro: avance, filtro rápido y temas por bloque. Clic = abrir; ⌘/Ctrl-clic o «+» = pestaña nueva.
export default function Sidebar({ book, title, topics, done = {}, currentId, openIds, splitId, onOpen, onNewTab, onBeside }) {
  const [filter, setFilter] = useState('')
  // Solo el primer bloque abierto (y el del tema que estás leyendo); el resto se abre con un clic
  const curBlock = topics.find(t => t.id === currentId)?.block.n
  const [opened, setOpened] = useState(() => new Set([book.blocks?.[0]?.n, curBlock].filter(n => n != null)))
  const listRef = useRef(null)
  const nDone = topics.filter(t => done?.[t.id]).length
  const pct = topics.length ? Math.round((nDone / topics.length) * 100) : 0
  const q = norm(filter.trim())

  const blocks = useMemo(() => (book.blocks || []).map(b => {
    const all = topics.filter(t => t.block.n === b.n)
    const blockHit = q && norm(b.name).includes(q)
    const list = !q || blockHit ? all : all.filter(t => norm(t.title).includes(q) || t.label.startsWith(q))
    return { ...b, all, list }
  }).filter(b => b.list.length), [book, topics, q])

  // el tema abierto siempre a la vista (abre su bloque si estaba cerrado)
  useEffect(() => {
    if (curBlock != null) setOpened(s => s.has(curBlock) ? s : new Set(s).add(curBlock))
  }, [curBlock])
  useEffect(() => {
    listRef.current?.querySelector('.lwd-toc-t.cur')?.scrollIntoView({ block: 'nearest' })
  }, [currentId])

  const toggle = n => setOpened(s => { const x = new Set(s); if (x.has(n)) x.delete(n); else x.add(n); return x })
  const click = (e, id) => { if (e.metaKey || e.ctrlKey) onNewTab(id); else onOpen(id) }

  return (
    <aside className="lwd-side" aria-label="Índice del libro">
      <div className="lwd-side-h">
        <b>{title || book.title}</b>
        <div className="lwd-prog-l"><span><strong>{nDone}</strong> de {topics.length} temas estudiados</span><span>{pct} %</span></div>
        <div className="lwd-prog" role="progressbar" aria-valuemin={0} aria-valuemax={topics.length} aria-valuenow={nDone}><i style={{ width: `${pct}%` }} /></div>
        <label className="lwd-filter">
          <Search size={15} />
          <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Filtrar el índice" aria-label="Filtrar el índice" autoComplete="off" spellCheck={false}
            onKeyDown={e => { if (e.key === 'Enter' && blocks[0]?.list[0]) onOpen(blocks[0].list[0].id) }} />
          {filter && <button onClick={() => setFilter('')} aria-label="Borrar el filtro"><X size={14} /></button>}
        </label>
      </div>

      <div className="lwd-toc" ref={listRef}>
        {blocks.length === 0 && <p className="lwd-none">Ningún tema coincide con «{filter.trim()}».</p>}
        {blocks.map(b => {
          const isClosed = !q && !opened.has(b.n)
          return (
            <section key={b.n}>
              <button className="lwd-toc-b" onClick={() => toggle(b.n)} aria-expanded={!isClosed}>
                <ChevronDown size={14} className={isClosed ? 'shut' : ''} />
                <span>Bloque {b.n} · {b.name}</span>
                <em>{b.all.filter(t => done?.[t.id]).length}/{b.all.length}</em>
              </button>
              {!isClosed && b.list.map(t => {
                const cur = t.id === currentId
                return (
                  <div key={t.id} className={`lwd-toc-t ${cur ? 'cur' : ''} ${openIds.includes(t.id) || t.id === splitId ? 'open' : ''}`}>
                    <button className="lwd-toc-go" onClick={e => click(e, t.id)} onAuxClick={e => { if (e.button === 1) { e.preventDefault(); onNewTab(t.id) } }}
                      aria-current={cur ? 'true' : undefined}>
                      <i>{t.label}</i>
                      <span>{t.title}</span>
                    </button>
                    <span className="lwd-toc-x">
                      <button onClick={() => onNewTab(t.id)} aria-label={`Abrir ${t.label} en una pestaña nueva`} title="Abrir en una pestaña nueva"><Plus size={14} /></button>
                      <button onClick={() => onBeside(t.id)} aria-label={`Abrir ${t.label} al lado`} title="Abrir al lado, para comparar"><Columns2 size={14} /></button>
                    </span>
                    <span className={`lwd-tick ${done?.[t.id] ? 'on' : ''}`} role="img" aria-label={done?.[t.id] ? 'Estudiado' : 'Sin estudiar'}><Check size={12} strokeWidth={3.2} /></span>
                  </div>
                )
              })}
            </section>
          )
        })}
      </div>
    </aside>
  )
}
