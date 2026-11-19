import React, { useEffect, useRef, useState } from 'react'
import { Plus, X, Check, MoreHorizontal } from 'lucide-react'
import { useEscapeLayer } from '../render/useProtection'

// Temas abiertos como pestañas. La «+» abre el buscador para elegir otro tema. Se ordenan arrastrándolas;
// si no caben, se desplazan (rueda del mouse) y un degradado en el borde avisa que hay más.
// Clic derecho en una pestaña (o el botón «…») abre su menú: cerrar esta pestaña, cerrar las demás.
// «+» y «…» quedan fuera de la parte que se desplaza: siempre a la vista.

function TabMenu({ menu, tabs, byId, onClose, onCloseOthers, onDone }) {
  const ref = useRef(null)
  useEscapeLayer(onDone) // Escape cierra solo el menú
  useEffect(() => {
    const down = e => { if (!ref.current?.contains(e.target)) onDone() }
    document.addEventListener('pointerdown', down, true)
    ref.current?.querySelector('button')?.focus()
    return () => document.removeEventListener('pointerdown', down, true)
  }, [onDone])
  const t = byId[menu.id]
  const x = Math.min(menu.x, window.innerWidth - 230)
  return (
    <div ref={ref} className="lwd-tabmenu" role="menu" aria-label={t ? `Pestaña ${t.label}` : 'Pestañas'} style={{ left: Math.max(8, x), top: menu.y }}>
      <button role="menuitem" disabled={tabs.length < 2} onClick={() => { onClose(menu.id); onDone() }}><X size={14} />Cerrar esta pestaña</button>
      <button role="menuitem" disabled={tabs.length < 2} onClick={() => { onCloseOthers(menu.id); onDone() }}>Cerrar las demás</button>
    </div>
  )
}

export default function TabsBar({ tabs, byId, active, done, onSelect, onClose, onCloseOthers, onAdd, onMove }) {
  const [menu, setMenu] = useState(null) // { id, x, y }
  const closeMenu = React.useCallback(() => setMenu(null), [])
  const ref = useRef(null)
  const [more, setMore] = useState({ l: false, r: false })
  const [drag, setDrag] = useState(null) // { id, over, side }

  // degradados según lo que queda fuera
  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const check = () => setMore(m => {
      const l = el.scrollLeft > 2, r = el.scrollLeft + el.clientWidth < el.scrollWidth - 2
      return m.l === l && m.r === r ? m : { l, r }
    })
    check()
    el.addEventListener('scroll', check, { passive: true })
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(check) : null
    ro?.observe(el)
    // rueda vertical → desplazamiento lateral
    const wheel = e => { if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && el.scrollWidth > el.clientWidth) { el.scrollLeft += e.deltaY; e.preventDefault() } }
    el.addEventListener('wheel', wheel, { passive: false })
    return () => { el.removeEventListener('scroll', check); el.removeEventListener('wheel', wheel); ro?.disconnect() }
  }, [tabs.length])
  // la pestaña activa siempre a la vista
  useEffect(() => { ref.current?.querySelector('.lwd-tab.on')?.scrollIntoView({ block: 'nearest', inline: 'nearest' }) }, [active, tabs.length])

  const drop = () => {
    if (drag?.over && drag.over !== drag.id) {
      const to = tabs.indexOf(drag.over) + (drag.side === 'r' ? 1 : 0)
      onMove?.(drag.id, to)
    }
    setDrag(null)
  }

  return (
    <div className="lwd-tabs-row">
     <div className={`lwd-tabs-w ${more.l ? 'more-l' : ''} ${more.r ? 'more-r' : ''}`}>
      <div ref={ref} className={`lwd-tabs ${tabs.length >= 6 ? 'many' : ''}`} role="tablist" aria-label="Temas abiertos">
        {tabs.map(id => {
          const t = byId[id]
          if (!t) return null
          const on = id === active
          const dropCls = drag && drag.over === id && drag.id !== id ? `drop-${drag.side}` : ''
          return (
            <div key={id} className={`lwd-tab ${on ? 'on' : ''} ${drag?.id === id ? 'drag' : ''} ${dropCls}`} role="tab" aria-selected={on} tabIndex={0} title={`${t.label} · ${t.title}`}
              draggable={tabs.length > 1}
              onDragStart={e => { e.stopPropagation(); try { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', '') } catch { /* nada */ } setDrag({ id, over: null, side: 'l' }) }}
              onDragOver={e => {
                if (!drag) return
                e.preventDefault()
                const r = e.currentTarget.getBoundingClientRect()
                const side = e.clientX > r.left + r.width / 2 ? 'r' : 'l'
                if (drag.over !== id || drag.side !== side) setDrag(d => ({ ...d, over: id, side }))
              }}
              onDrop={e => { e.preventDefault(); drop() }}
              onDragEnd={() => setDrag(null)}
              onClick={() => onSelect(id)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(id) } }}
              onAuxClick={e => { if (e.button === 1 && tabs.length > 1) { e.preventDefault(); onClose(id) } }}
              onContextMenu={e => { e.preventDefault(); e.stopPropagation(); setMenu({ id, x: e.clientX, y: e.clientY + 4 }) }}>
              <i>{t.label}</i>
              <span>{t.title}</span>
              {done?.[id] && <Check size={13} strokeWidth={3} className="ok" aria-label="Estudiado" />}
              {tabs.length > 1 && (
                <button onClick={e => { e.stopPropagation(); onClose(id) }} aria-label={`Cerrar la pestaña ${t.label}`}><X size={13} /></button>
              )}
            </div>
          )
        })}
      </div>
     </div>
      <div className="lwd-tabs-x">
        <button className="lwd-tab-add" onClick={onAdd} aria-label="Abrir otro tema en una pestaña nueva" title="Abrir otro tema en una pestaña nueva"><Plus size={16} /></button>
        {tabs.length > 1 && (
          <button className="lwd-tab-add" aria-haspopup="menu" aria-expanded={!!menu} aria-label="Más opciones de pestañas" title="Más opciones de pestañas"
            onClick={e => { const r = e.currentTarget.getBoundingClientRect(); setMenu(m => (m ? null : { id: active, x: r.right - 220, y: r.bottom + 4 })) }}><MoreHorizontal size={16} /></button>
        )}
      </div>
      {menu && <TabMenu menu={menu} tabs={tabs} byId={byId} onClose={onClose} onCloseOthers={onCloseOthers} onDone={closeMenu} />}
    </div>
  )
}
