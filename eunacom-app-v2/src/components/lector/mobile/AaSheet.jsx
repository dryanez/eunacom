import React from 'react'
import { Moon, Sun, X, LayoutList, Table2 } from 'lucide-react'
import { SIZES } from '../../../lib/lector/userData'

// Hoja «Aa»: tamaño de letra, claro/oscuro, cómo se ven las tablas en el teléfono y los enlaces entre libros.
export default function AaSheet({ prefs, store, onClose }) {
  const set = patch => store.setPrefs(patch)
  return (
    <>
      <div className="lw-dim" onClick={onClose} />
      <div className="lw-sheet lw-aa" role="dialog" aria-label="Letra y tema">
        <div className="lw-sheet-h"><strong>Letra y tema</strong><button onClick={onClose} aria-label="Cerrar" className="lw-sheet-x"><X size={18} /></button></div>
        <h6>Tamaño de la letra</h6>
        <div className="lw-seg">
          <button onClick={() => set({ size: prefs.size - 1 })} disabled={prefs.size <= 0} aria-label="Letra más chica" style={{ fontSize: 14 }}>A−</button>
          <span className="lw-size">{prefs.size + 1} de {SIZES.length}</span>
          <button onClick={() => set({ size: prefs.size + 1 })} disabled={prefs.size >= SIZES.length - 1} aria-label="Letra más grande" style={{ fontSize: 19 }}>A+</button>
        </div>
        <h6>Tema</h6>
        <div className="lw-seg">
          <button className={!prefs.dark ? 'on' : ''} onClick={() => set({ dark: false })}><Sun size={16} />Claro</button>
          <button className={prefs.dark ? 'on' : ''} onClick={() => set({ dark: true })}><Moon size={16} />Oscuro</button>
        </div>
        <h6>Tablas</h6>
        <div className="lw-seg">
          <button className={prefs.tablas !== 'tabla' ? 'on' : ''} onClick={() => set({ tablas: 'tarjetas' })}><LayoutList size={16} />En tarjetas</button>
          <button className={prefs.tablas === 'tabla' ? 'on' : ''} onClick={() => set({ tablas: 'tabla' })}><Table2 size={16} />Como tabla</button>
        </div>
        <p className="lw-aa-note">En tarjetas, cada fila de la tabla se lee sin moverse hacia los lados.</p>
        <h6>Enlaces</h6>
        <button className="lw-switch" role="switch" aria-checked={prefs.links !== false} onClick={() => set({ links: prefs.links === false })}>
          <span>Enlaces entre libros<small>Toca un término subrayado para ver qué es, su clase y dónde aparece en tus libros.</small></span><i aria-hidden="true" />
        </button>
      </div>
    </>
  )
}
