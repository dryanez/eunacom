// Tarjeta de un término de la «Red de temas»: qué es (de los libros de Felipe), sus clases, dónde más aparece en los
// libros que el usuario tiene y la ficha completa del Perfil V3. Teléfono: hoja desde abajo. Computador: junto a la palabra.
// La capa del historial (Atrás la cierra) la maneja TopicBody; aquí solo se dibuja.
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { BookOpen, ChevronRight, ExternalLink, Loader2, PlayCircle, X } from 'lucide-react'
import { useSubscription } from '../../../contexts/SubscriptionContext'
import { loadClassRoutes, norm } from '../../../lib/lector/content'
import { bookTitle, canonLoc, codeSpec, ownedTarget, useTermDetails } from '../../../lib/lector/red'
import { useEscapeLayer } from './useProtection'

const KIND_ORDER = { tomo: 0, repaso: 1, atlas: 2 }
const PER_BOOK = 3 // filas por libro antes de «Ver más» (teléfono: 2, o 1 con 3 libros o más)
const CLASSES = 2 // clases antes de «Ver más»
const BOOKS = 3 // libros antes de «Ver más libros»
const routeSpec = route => (String(route || '').match(/^\/mis-clases\/([^/]+)\//) || [])[1] || ''
const words = s => norm(String(s || '')).split(/[^a-z0-9]+/).filter(w => w.length >= 5)
const W = 380

function place(rect) {
  const vw = window.innerWidth, vh = window.innerHeight
  const w = Math.min(W, vw - 24)
  const x = Math.min(vw - w - 12, Math.max(12, (rect?.left ?? vw / 2) + (rect?.width ?? 0) / 2 - w / 2))
  const roomBelow = vh - (rect?.bottom ?? vh / 2) - 16, roomAbove = (rect?.top ?? vh / 2) - 16
  const below = roomBelow >= 420 || roomBelow >= roomAbove
  const maxH = Math.max(220, Math.min(520, (below ? roomBelow : roomAbove) - 8))
  return below ? { left: x, top: (rect?.bottom ?? vh / 2) + 8, width: w, maxHeight: maxH } : { left: x, bottom: vh - (rect?.top ?? vh / 2) + 8, width: w, maxHeight: maxH }
}

/**
 * <TermCard term red userId here topicId wide rect onClose onClass(route) onBook(target, { same }) />
 *  term: el del índice ({ id, name, code, spec }); lo demás (qué es, clases, libros) llega con la primera tarjeta de su
 *  especialidad (t/<spec>.json) y mientras tanto se muestra «Cargando…».
 *  here: { item, fileIdx } del libro que se lee; topicId: el tema (o ficha) que se lee (no se ofrece «ir» ahí mismo)
 */
export default function TermCard({ term, red, userId, here, topicId, wide, rect, onClose, onClass, onBook }) {
  const { status, d, retry } = useTermDetails(userId, term)
  const { ownedBooks } = useSubscription() || {}
  const [routes, setRoutes] = useState(null)
  const [more, setMore] = useState({})
  const ref = useRef(null)
  useEscapeLayer(onClose)
  useEffect(() => { let live = true; loadClassRoutes().then(m => live && setRoutes(m)); return () => { live = false } }, [])
  useLayoutEffect(() => { ref.current?.focus({ preventScroll: true }) }, [term.id])
  // en el computador va junto a la palabra: si el texto se desplaza, se cierra (no queda flotando lejos)
  useEffect(() => {
    if (!wide) return undefined
    const on = e => { if (!ref.current?.contains(e.target)) onClose() }
    window.addEventListener('scroll', on, true)
    return () => window.removeEventListener('scroll', on, true)
  }, [wide, onClose])

  const hereLoc = here ? canonLoc(here.item, here.fileIdx) : ''
  // clases que existen hoy (si el índice de clases no se pudo leer, las del archivo)
  // primero las de la especialidad del propio código y las que lo nombran en el título (el archivo trae el orden del Perfil)
  const clases = useMemo(() => {
    const own = codeSpec(red, term), name = words(term.name)
    const score = c => (routeSpec(c.route) === own ? 2 : 0) + (name.some(w => norm(c.title || '').includes(w)) ? 1 : 0)
    return d.clases
      .map(c => ({ ...c, route: routes?.get(c.id) || c.route }))
      .filter(c => !routes || !routes.size || routes.has(c.id))
      .map((c, i) => ({ c, i, s: score(c) }))
      .sort((a, b) => b.s - a.s || a.i - b.i)
      .map(x => x.c)
  }, [d, red, term, routes])

  // «En tus libros»: solo lo que el usuario tiene, agrupado por libro, sin el lugar donde ya está
  const groups = useMemo(() => {
    const map = new Map()
    for (const l of d.libros) {
      if (l.kind === 'perfil') continue
      const to = ownedTarget(l, ownedBooks)
      if (!to) continue
      const loc = `${l.item}:${l.fileIdx}`
      const t = l.caseId || l.topicId
      if (loc === hereLoc && (t === topicId || l.topicId === topicId)) continue
      if (!map.has(loc)) map.set(loc, { loc, kind: l.kind, title: bookTitle(l.item, l.fileIdx), to, rows: [] })
      const g = map.get(loc)
      if (!g.rows.some(r => r.t === t)) g.rows.push({ t, label: l.label, title: l.title || l.label })
    }
    // primero los libros de la especialidad del término (su Tomo, su Repaso, su Atlas), luego este libro, luego el resto;
    // dentro de cada grupo, Tomo → Repaso → Atlas y el orden del archivo
    const spec = term.spec || codeSpec(red, term)
    // Sin libro de su especialidad se respeta el orden del archivo (el generador ya pone primero los temas que nombran el
    // término: TVP → Tomo 1 5.10, su Repaso y su Atlas); fuera del grupo propio tampoco se reordena por Tomo → Repaso → Atlas.
    const rank = g => (spec && red?.books.get(canonLoc(...g.loc.split(':'))) === spec ? 0 : g.loc === hereLoc ? 1 : 2)
    const list = [...map.values()].map((g, i) => ({ ...g, own: rank(g) === 0, r: rank(g), i }))
    if (!list.some(g => g.own)) return list
    return list.sort((a, b) => a.r - b.r || (a.r === 0 ? KIND_ORDER[a.kind] - KIND_ORDER[b.kind] : 0) || a.i - b.i)
  }, [d, ownedBooks, hereLoc, topicId, red, term])

  // ficha completa del Perfil V3 (si tiene el Perfil)
  const perfil = useMemo(() => {
    for (const l of d.libros) {
      if (l.kind !== 'perfil') continue
      const to = ownedTarget(l, ownedBooks)
      if (to && !(`${l.item}:${l.fileIdx}` === hereLoc && l.topicId === topicId)) return { ...to, topicId: l.topicId, title: bookTitle(to.item, to.fileIdx) }
    }
    return null
  }, [d, ownedBooks, hereLoc, topicId])

  const go = (g, row) => onBook({ ...g.to, topicId: row.t, title: bookTitle(g.to.item, g.to.fileIdx) }, { same: g.loc === hereLoc })
  const style = wide ? place(rect) : undefined
  const loading = status === 'loading'
  const empty = status === 'ok' && !d.explica.length && !clases.length && !groups.length && !perfil
  const shownClases = more._clases ? clases : clases.slice(0, CLASSES)
  // «Ver N libros más» nunca esconde un libro de la especialidad del término
  const shownGroups = more._books ? groups : groups.slice(0, Math.max(BOOKS, groups.filter(g => g.own).length))
  // filas por libro: en el teléfono 2, o 1 si se ven 3 libros o más (la hoja no pasa de ~1,5 pantallas)
  const perBook = wide ? PER_BOOK : shownGroups.length >= 3 ? 1 : 2

  const card = (
    <div ref={ref} tabIndex={-1} className={`lw-tc ${wide ? 'pop' : 'sheet'}`} style={style} role="dialog" aria-label={term.name} data-lw-ui="">
      <div className="lw-tc-h">
        <div className="lw-tc-t">
          {term.code && <small>Perfil V3 · {term.code}</small>}
          <strong>{term.name}</strong>
        </div>
        <button className="lw-sheet-x" onClick={onClose} aria-label="Cerrar"><X size={18} /></button>
      </div>
      <div className="lw-tc-b">
        {loading && <p className="lw-tc-load" role="status"><Loader2 size={16} className="lw-spin" />Cargando…</p>}
        {status === 'error' && (
          <p className="lw-tc-empty">No pudimos cargar la explicación. <button className="lw-tc-more" onClick={retry}>Reintentar</button></p>
        )}
        {d.explica.length > 0 && (
          <section>
            <h6>Qué es</h6>
            <ul className="lw-tc-ex">{d.explica.map((x, i) => <li key={i}>{x}</li>)}</ul>
          </section>
        )}
        {clases.length === 1 && (
          <section>
            <h6>Clase</h6>
            <button className="lw-tc-clase one" onClick={() => onClass(clases[0].route)}>
              <PlayCircle size={18} /><span><b>Ver la clase</b><small>{clases[0].title}</small></span><ChevronRight size={17} />
            </button>
          </section>
        )}
        {clases.length > 1 && (
          <section>
            <h6>Clases ({clases.length})</h6>
            <div className="lw-tc-list">
              {shownClases.map(c => (
                <button key={c.id} className="lw-tc-clase" onClick={() => onClass(c.route)}>
                  <PlayCircle size={16} /><span>{c.title}</span><ChevronRight size={16} />
                </button>
              ))}
              {shownClases.length < clases.length && (
                <button className="lw-tc-more" onClick={() => setMore(m => ({ ...m, _clases: true }))}>Ver {clases.length - shownClases.length} más</button>
              )}
            </div>
          </section>
        )}
        {groups.length > 0 && (
          <section>
            <h6>En tus libros</h6>
            {shownGroups.map(g => {
              const open = more[g.loc] || g.rows.length <= perBook + 1
              const rows = open ? g.rows : g.rows.slice(0, perBook)
              const same = g.loc === hereLoc
              return (
                <div key={g.loc} className="lw-tc-book">
                  <div className="lw-tc-bk"><BookOpen size={14} />{same ? `${g.title} (este libro)` : g.title}</div>
                  <div className="lw-tc-list">
                    {rows.map(r => (
                      <button key={r.t} className="lw-tc-row" onClick={() => go(g, r)}>
                        {r.label && <span className="lw-tc-n">{r.label}</span>}
                        <span className="lw-tc-rt">{r.title}</span>
                        {same && wide ? <ExternalLink size={15} aria-label="Se abre en otra pestaña" /> : <ChevronRight size={16} />}
                      </button>
                    ))}
                    {!open && <button className="lw-tc-more" onClick={() => setMore(m => ({ ...m, [g.loc]: true }))}>Ver {g.rows.length - perBook} más</button>}
                  </div>
                </div>
              )
            })}
            {shownGroups.length < groups.length && (
              <button className="lw-tc-more" onClick={() => setMore(m => ({ ...m, _books: true }))}>Ver {groups.length - shownGroups.length} libros más</button>
            )}
          </section>
        )}
        {empty && <p className="lw-tc-empty">Aún no hay más sobre este término en tus libros.</p>}
      </div>
      {perfil && (
        <div className="lw-tc-f">
          <button className="lw-btn pri" onClick={() => onBook(perfil, { same: canonLoc(perfil.item, perfil.fileIdx) === hereLoc })}>Ver ficha completa</button>
        </div>
      )}
    </div>
  )
  return (
    <div className="lw-tc-wrap" data-lw-ui="">
      <div className={wide ? 'lw-tc-catch' : 'lw-dim'} onClick={onClose} />
      {card}
    </div>
  )
}
