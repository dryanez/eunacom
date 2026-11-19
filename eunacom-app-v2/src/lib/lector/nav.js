// Lector web · historial del navegador. Cada capa que el botón «Atrás» debe cerrar (el libro abierto, un tema,
// las listas, el buscador, el visor de imágenes, la hoja de nota…) es una entrada del historial con
// history.state.lwNav = profundidad (1 = el libro, 2 = el tema…). «Atrás» cierra la capa de arriba; cerrar una
// capa con su botón (X, flecha, Escape) vuelve atrás en el historial, así no quedan entradas muertas.
//
// Las operaciones van en fila: un history.go() es asíncrono, y lo que se abre en el mismo momento
// (p. ej. elegir un resultado del buscador: se cierra el buscador y se abre el tema) espera a que termine.
// El resto del estado del historial (el de react-router) se conserva tal cual.
import { createContext, useContext, useEffect, useRef } from 'react'

const win = typeof window !== 'undefined' ? window : null
const st = () => (win?.history.state && typeof win.history.state === 'object' ? win.history.state : {})
/** Profundidad de la entrada actual (0 = fuera del lector). */
export const navDepth = () => Number(st().lwNav) || 0

// Ámbito de un libro abierto (ver «libros uno encima de otro» al final)
export const NavScope = createContext(null)

const layers = [] // capas abiertas, de abajo hacia arriba: { depth, onBack, closed }
const queue = []
let busy = false
let waitingPop = null

function next() { busy = false; run() }
function run() {
  if (busy || !win) return
  const op = queue.shift()
  if (!op) return
  busy = true
  try {
    if (op.type === 'go') {
      const to = op.layer.depth == null ? null : op.layer.depth - 1
      const n = to == null ? 0 : to - navDepth()
      if (n >= 0) return next()
      const done = () => { if (waitingPop === done) { waitingPop = null; next() } }
      waitingPop = done
      win.history.go(n)
      setTimeout(done, 700) // por si el navegador no avisa (no debería)
      return
    }
    if (op.type === 'open') {
      const l = op.layer
      if (l.closed) return next()
      const below = layers.reduce((m, x) => (x !== l && x.depth != null ? Math.max(m, x.depth) : m), 0)
      if (op.adoptDepth && navDepth() >= op.adoptDepth) l.depth = op.adoptDepth // entrada conocida (libro de la pila al recargar)
      else if (op.adopt && navDepth() >= below + 1) l.depth = below + 1 // la entrada ya existe (recarga, vuelta desde una clase)
      else {
        const d = navDepth() + 1
        let extra = null
        try { extra = typeof op.state === 'function' ? op.state(d) : op.state } catch { extra = null }
        win.history.pushState({ ...st(), ...(extra || {}), lwNav: d }, '', op.url || win.location.href)
        l.depth = d
      }
      return next()
    }
    if (op.type === 'call') { try { op.fn() } catch { /* nada */ } return next() }
    if (op.type === 'replace') {
      const l = op.layer
      if (!l || (!l.closed && l.depth != null && l.depth === navDepth())) win.history.replaceState({ ...st(), lwNav: l ? l.depth : navDepth() }, '', op.url)
      return next()
    }
  } catch { /* historial no disponible */ }
  next()
}
// lo que se abre espera a lo que se cierra en el mismo momento (efectos de un mismo render)
const later = op => Promise.resolve().then(() => { queue.push(op); run() })

// «Adelante» del navegador: la entrada nueva es más profunda que lo que hay en pantalla (una capa que ya se cerró).
// Sin capas abiertas, la página dueña del lector puede reabrirlo desde la dirección (setForwardHandler); si no puede,
// o si hay capas abiertas, se vuelve a la entrada que corresponde a lo que se ve: dirección y pantalla no se separan.
let forwardHandler = null
/** La página que abre el lector (el estante) reabre el libro de la dirección al ir «Adelante». fn(depth) → true si lo reabrió. */
export function setForwardHandler(fn) {
  forwardHandler = fn
  return () => { if (forwardHandler === fn) forwardHandler = null }
}
const topDepth = () => layers.reduce((m, x) => (x.depth != null ? Math.max(m, x.depth) : m), 0)

if (win) {
  win.addEventListener('popstate', () => {
    const d = navDepth()
    // se cierran (de arriba hacia abajo) las capas que quedaron más arriba que la entrada actual
    const gone = []
    for (let i = layers.length - 1; i >= 0; i--) {
      const l = layers[i]
      if (l.depth != null && l.depth > d) { layers.splice(i, 1); l.closed = true; gone.push(l); try { l.onBack?.() } catch { /* nada */ } }
    }
    // la capa que vuelve a quedar arriba (se cerró lo que tenía encima) y quiere saberlo: onReturn(capas cerradas)
    layers.filter(l => l.depth === d && !l.closed && l.onReturn).forEach(l => { try { l.onReturn(gone) } catch { /* nada */ } })
    if (waitingPop) { waitingPop(); return }
    const top = topDepth()
    if (d <= top || queue.length || layers.some(l => l.depth == null)) return
    if (!layers.length) {
      // nada abierto: el estante (si está en pantalla) reabre el libro; si no está, la página que llega se encarga
      if (!forwardHandler) return
      let reopened = false
      try { reopened = !!forwardHandler(d) } catch { /* nada */ }
      if (reopened) return
    } else if (layers[layers.length - 1].path && layers[layers.length - 1].path !== win.location.pathname) return
    try { win.history.go(top - d) } catch { /* nada */ }
  })
}

/** Abre una capa: nueva entrada del historial (o adopta la que ya existe si `adopt` y hay entrada; con `adoptDepth`,
 *  la de esa profundidad si existe). `state`: datos extra de la entrada nueva (objeto o fn(profundidad) → objeto). */
export function openLayer(onBack, { url = null, adopt = false, adoptDepth = 0, state = null } = {}) {
  const layer = { depth: null, onBack, closed: false }
  layers.push(layer)
  later({ type: 'open', layer, url, adopt, adoptDepth, state })
  return layer
}
/** Cierra una capa desde la interfaz: vuelve en el historial hasta la entrada de abajo (cierra también las de arriba). */
export function closeLayer(layer) {
  if (!layer || layer.closed) return
  // se cierran ella y las que están más arriba en el historial (no las que esperan abrirse: van después de esta vuelta)
  for (let i = layers.length - 1; i >= 0; i--) {
    const l = layers[i]
    if (l === layer || (l.depth != null && layer.depth != null && l.depth > layer.depth)) { layers.splice(i, 1); l.closed = true }
  }
  layer.closed = true
  queue.push({ type: 'go', layer })
  run()
}
/** Olvida una capa sin tocar el historial (el componente se desmontó porque la app cambió de página). */
export function releaseLayer(layer) {
  if (!layer || layer.closed) return
  const i = layers.indexOf(layer)
  if (i >= 0) layers.splice(i, 1)
  layer.closed = true
}
/** Llama a `fn` cuando terminen las operaciones del historial que ya están en fila (y las que se pidan en este mismo
 *  momento): p. ej. ir a una clase después de que se cierre la tarjeta de un término. */
export function whenSettled(fn) { later({ type: 'call', fn }) }
/** Cambia la dirección de la entrada de la capa (si es la de arriba), sin crear otra: p. ej. pasar al tema siguiente. */
export function replaceLayerUrl(layer, url) { if (layer && url) later({ type: 'replace', layer, url }) }
/** Cambia la dirección de la entrada actual (fuera de toda capa). Con `depth`, solo si la entrada actual es esa;
 *  depth = 'base': la entrada de la capa de más abajo (el libro), sea cual sea su profundidad. */
export function replaceUrl(url, depth = null) {
  if (!url) return
  if (depth == null) { queue.push({ type: 'replace', layer: null, url }); run(); return }
  if (depth === 'base') {
    later({ type: 'replace', layer: { get depth() { const b = layers.find(l => !l.closed && l.depth != null); return b ? b.depth : -1 }, closed: false }, url })
    return
  }
  later({ type: 'replace', layer: { depth, closed: false }, url })
}

/** Dirección actual con estos parámetros (null = quitarlo). */
export function urlWith(params) {
  if (!win) return ''
  const u = new URL(win.location.href)
  for (const [k, v] of Object.entries(params)) { if (v == null || v === '') u.searchParams.delete(k); else u.searchParams.set(k, String(v)) }
  return `${u.pathname}${u.search}${u.hash}`
}

/**
 * useHistoryLayer(active, onBack, { url, adopt })
 *  - active: la capa está abierta. Al abrirse se agrega una entrada al historial; «Atrás» llama a onBack().
 *    Al cerrarse por la interfaz (active → false) se vuelve atrás en el historial.
 *  - url: dirección de la entrada (si cambia mientras está abierta, se reemplaza: no se agregan entradas).
 *  - adopt: al abrir por primera vez, usar la entrada que ya existe (recarga de la página).
 *  - onReturn: se llama cuando «Atrás» (o el cierre de una capa de encima) deja otra vez arriba la entrada de esta capa.
 *  Si el componente se desmonta con la capa abierta: en la misma página, la capa se cierra (vuelve atrás: el visor
 *  que se cierra con su X, el lector que cambia de teléfono a computador); si la app cambió de página
 *  («Ver la clase») solo se olvida, para que «Atrás» desde la clase vuelva al mismo tema.
 */
export function useHistoryLayer(active, onBack, { url = null, adopt = false, adoptDepth = 0, state = null, onReturn = null } = {}) {
  const cb = useRef(onBack)
  cb.current = onBack
  const ret = useRef(onReturn)
  ret.current = onReturn
  const ref = useRef(null)
  const opened = useRef(false)
  const scope = useContext(NavScope)
  const opts = useRef({ url, adopt, adoptDepth, state })
  opts.current = { url, adopt, adoptDepth, state }

  useEffect(() => {
    const cur = ref.current
    if (!active) {
      if (cur) { clearTimeout(cur.releasing); ref.current = null; closeLayer(cur) }
      return undefined
    }
    let l = cur
    if (l && !l.closed) { clearTimeout(l.releasing); l.releasing = 0 } // StrictMode: el mismo componente vuelve a montarse
    else {
      const o = opts.current
      l = openLayer(() => { if (ref.current === l) ref.current = null; cb.current?.() }, { url: o.url, adopt: o.adopt, adoptDepth: o.adoptDepth, state: o.state })
      l.path = win?.location.pathname
      l.onReturn = gone => ret.current?.(gone)
      // la primera capa que abre este hook adoptando la entrada (el tema con que se abrió el libro): «initial»
      l.initial = !opened.current && !!(o.adopt || o.adoptDepth)
      l.token = scope?.token || null
      opened.current = true
      ref.current = l
    }
    return () => {
      // se decide un instante después: si el componente vuelve a montarse (StrictMode) la capa sigue
      l.releasing = setTimeout(() => {
        l.releasing = 0
        if (ref.current === l) ref.current = null
        if (win && win.location.pathname === l.path) closeLayer(l); else releaseLayer(l)
      }, 0)
    }
  }, [active]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const l = ref.current
    if (active && l && url) replaceLayerUrl(l, url)
  }, [url]) // eslint-disable-line react-hooks/exhaustive-deps
  return ref
}

/* ───────── libros uno encima de otro («Red de temas») ───────── */
// Cada libro abierto (el de abajo y los que se abren encima desde la tarjeta de un término) es un ámbito: su entrada del
// historial (layer: ref a la capa; null = la del estante, la de más abajo), su dirección (leer) y si hay otro libro encima.

/** La dirección de la entrada del libro con estos parámetros (p. ej. { t: tema }), sin crear entradas. Solo cuando el
 *  libro está arriba (con otro encima no se toca: la dirección es la del de encima) y otra vez al volver a quedar arriba. */
export function useBookUrl(params) {
  const scope = useContext(NavScope)
  const sig = params ? JSON.stringify(params) : ''
  const covered = !!scope?.covered
  useEffect(() => {
    if (covered || !sig) return undefined
    // un instante después: si se acaba de cerrar el libro de encima, su vuelta en el historial va primero
    const t = setTimeout(() => {
      const url = urlWith({ ...(scope?.leer ? { leer: scope.leer } : {}), ...JSON.parse(sig) })
      const l = scope?.layer?.current
      if (l) replaceLayerUrl(l, url); else replaceUrl(url, 'base')
    }, 0)
    return () => clearTimeout(t)
  }, [sig, covered]) // eslint-disable-line react-hooks/exhaustive-deps
}
