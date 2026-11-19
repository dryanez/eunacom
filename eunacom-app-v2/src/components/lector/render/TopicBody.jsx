// Cuerpo de un tema: el HTML del libro + tablas como tarjetas, ampliar algoritmos/fotos, preguntas que se
// responden en el lugar, destacados y notas. Lo usan el lector de teléfono y el de computador.
//
// <TopicBody userId bookKey book topic query? focus? onReady? />
//   query: texto buscado → se marcan todas sus apariciones en el tema
//   focus: { start, end, n } → baja hasta ese tramo del texto y lo hace parpadear (n cambia para repetir)
// Debe ir dentro de un contenedor con desplazamiento de clase `lw-scroll` y bajo una raíz `.lw`.
import React, { memo, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { answersFor, highlightsFor, useUserData } from '../../../lib/lector/userData'
import { norm } from '../../../lib/lector/content'
import { bodyText, findAll, paint, rangeAt, unpaint } from './anchors'
import { useHighlighter } from './SelectionMenu'
import ZoomViewer from './ZoomViewer'
import TermCard from './TermCard'
import { useLinks } from './links'
import { contextFor, linkTerms, loadDetails, unlinkTerms, useRed } from '../../../lib/lector/red'
import { urlWith, useHistoryLayer, whenSettled } from '../../../lib/lector/nav'
import './render.css'

// Deja el HTML del tema listo para usarse (una vez por tema). No cambia el texto: lo que se agrega lleva data-lw-ui.
function decorate(body) {
  body.querySelectorAll('.m-tbl').forEach(t => {
    const hs = [...t.querySelectorAll('thead th')].map(th => th.textContent.trim())
    t.querySelectorAll('tbody tr').forEach(tr => [...tr.children].forEach((td, i) => td.setAttribute('data-label', hs[i] || '')))
    const h = t.querySelector('.m-tbl-h')
    if (h && !h.querySelector('.m-tbl-mode')) {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'm-tbl-mode'; b.setAttribute('data-lw-ui', ''); h.appendChild(b)
    }
  })
  body.querySelectorAll('.m-algo-b, .m-fig').forEach(el => el.setAttribute('data-zoom', ''))
  // Algoritmos: el SVG viene a todo el ancho (620 de ancho, letra de 7,5–10): en el teléfono la letra quedaba en 4–5 px.
  // Se le da un ancho mínimo para que su letra más común se lea a ≥ 11 px; si no cabe, se desliza de lado (con aviso)
  // y «Ampliar» sigue abriendo el visor.
  body.querySelectorAll('.m-algo-b').forEach(box => {
    const svg = box.querySelector('svg')
    const vbW = Number(String(svg?.getAttribute('viewBox') || '').trim().split(/[\s,]+/)[2]) || 0
    if (!svg || !vbW) return
    const count = new Map()
    // tamaño de letra del SVG (en unidades del viewBox; viene de su <style>), pesado por la cantidad de letras
    svg.querySelectorAll('text').forEach(el => {
      const f = parseFloat(el.getAttribute('font-size')) || parseFloat(getComputedStyle(el).fontSize)
      if (f > 0) count.set(f, (count.get(f) || 0) + (el.textContent.length || 1))
    })
    const fs = [...count.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || 10
    const minW = Math.round(vbW * Math.max(1, ALGO_MIN_PX / fs))
    svg.style.setProperty('--lw-algo-min', `${minW}px`)
    box.classList.add('lw-algo-s')
    if (!box.parentElement?.querySelector(':scope > .lw-algo-f')) {
      const f = document.createElement('div'); f.className = 'lw-algo-f'; f.setAttribute('data-lw-ui', '')
      const hint = document.createElement('span'); hint.className = 'lw-algo-hint'; hint.textContent = 'Desliza para ver todo el algoritmo'
      const zb = document.createElement('button'); zb.type = 'button'; zb.className = 'lw-algo-zoom'; zb.textContent = 'Ampliar'
      zb.setAttribute('aria-label', 'Ampliar el algoritmo')
      f.append(hint, zb)
      box.after(f)
    }
  })
  body.querySelectorAll('img').forEach(img => img.setAttribute('draggable', 'false'))
  // Preguntas: la respuesta correcta y la explicación no quedan en la página antes de responder. La letra correcta
  // se guarda en memoria (keys) y el texto de .m-ans se cambia por relleno del mismo largo (las posiciones de los
  // destacados se cuentan sobre ese texto, así que el largo no puede cambiar); al responder vuelve el texto real.
  const keys = { right: [], ans: [] }
  keyStore.set(body, keys)
  body.querySelectorAll('.m-q').forEach((q, i) => {
    q.setAttribute('data-q', String(i))
    q.removeAttribute('data-right')
    const ans = q.querySelector('.m-ans')
    keys.right[i] = (ans?.textContent.match(/Respuesta:\s*([A-E])/) || [])[1] || ''
    keys.ans[i] = ans ? ans.innerHTML : ''
    if (ans) maskAnswer(ans)
    q.querySelectorAll('.m-opts > li').forEach(li => { li.setAttribute('role', 'button'); li.setAttribute('tabindex', '0') })
    if (!q.querySelector('.lw-q-res')) {
      const res = document.createElement('div'); res.className = 'lw-q-res'; res.setAttribute('data-lw-ui', '')
      q.querySelector('.m-opts')?.after(res)
    }
  })
}

// respuesta de cada pregunta, fuera del DOM: cuerpo del tema → { right: ['A'…], ans: [html de .m-ans] }
const keyStore = new WeakMap()
const FILL = '\u2007' // relleno de la respuesta oculta: mismo largo, no coincide con nada que se busque
function maskAnswer(ans) {
  const w = document.createTreeWalker(ans, NodeFilter.SHOW_TEXT)
  for (let n = w.nextNode(); n; n = w.nextNode()) n.data = FILL.repeat(n.data.length)
  ans.setAttribute('data-lw-masked', '')
}

// ¿Todas las marcas de ese destacado están dentro de este término? (el destacado es solo el término)
function onlyIn(body, id, term) {
  if (!body || !id) return false
  const marks = body.querySelectorAll(`mark[data-lw="hl"][data-id="${CSS.escape(id)}"]`)
  return marks.length > 0 && [...marks].every(m => term.contains(m))
}
const wide = () => !!window.matchMedia?.('(min-width: 1024px)').matches

const ALGO_MIN_PX = 11 // letra mínima de los algoritmos en la página (px)

// ¿El algoritmo cabe? Si no, se muestra «Desliza…» bajo él.
function markOverflow(body) {
  body.querySelectorAll('.m-algo-b.lw-algo-s').forEach(box => {
    const over = box.scrollWidth > box.clientWidth + 4
    box.parentElement?.classList.toggle('lw-algo-over', over)
    // los algoritmos van centrados: se parte mostrando el centro (el inicio del diagrama), no el borde izquierdo vacío
    if (over && !box.dataset.lwCentered) { box.dataset.lwCentered = '1'; box.scrollLeft = (box.scrollWidth - box.clientWidth) / 2 }
  })
}

// Estado de las preguntas según lo respondido: { [nº]: 'A'… }
// (las marcas de destacados y búsqueda se quitan antes de cambiar el texto de una respuesta; el efecto que pinta corre después)
function applyAnswers(body, answers) {
  const keys = keyStore.get(body) || { right: [], ans: [] }
  let unpainted = false
  body.querySelectorAll('.m-q').forEach(q => {
    const n = Number(q.getAttribute('data-q'))
    const picked = answers[n] || '', right = picked ? keys.right[n] || '' : ''
    const ans = q.querySelector('.m-ans'), res = q.querySelector('.lw-q-res')
    if (ans && !!picked === ans.hasAttribute('data-lw-masked')) {
      if (!unpainted) { unpainted = true; unpaint(body, 'hit'); unpaint(body, 'hl'); unpaint(body, 'flash') }
      if (picked) { ans.innerHTML = keys.ans[n] || ''; ans.removeAttribute('data-lw-masked') } else maskAnswer(ans)
    }
    q.classList.toggle('lw-answered', !!picked)
    q.querySelectorAll('.m-opts > li').forEach(li => {
      const id = li.getAttribute('data-id')
      li.classList.toggle('lw-ok', !!picked && id === right)
      li.classList.toggle('lw-bad', !!picked && id === picked && id !== right)
      li.setAttribute('aria-disabled', picked ? 'true' : 'false')
    })
    if (ans) { if (picked) ans.setAttribute('open', ''); else ans.removeAttribute('open') }
    if (res) {
      res.textContent = ''
      if (picked) {
        const ok = picked === right
        const b = document.createElement('b'); b.className = ok ? 'ok' : 'bad'
        b.textContent = ok ? 'Correcto' : right ? `Incorrecto: la respuesta es ${right}` : 'Respuesta registrada'
        const retry = document.createElement('button'); retry.type = 'button'; retry.className = 'lw-q-retry'; retry.textContent = 'Reintentar'
        res.append(b, retry)
      } else {
        const hint = document.createElement('span'); hint.textContent = 'Elige una alternativa para ver la respuesta'
        res.append(hint)
      }
    }
  })
}

function TopicBody({ userId, bookKey, book, topic, query = '', focus = null, mark = '', onReady }) {
  const [data, store] = useUserData(userId)
  const ref = useRef(null)
  const [zoomed, setZoomed] = useState(null)
  const [host, setHost] = useState(null)
  useEffect(() => { setHost(ref.current?.closest('.lw') || document.body) }, [])

  const highlights = highlightsFor(data, bookKey, topic.id)
  const hlSig = highlights.map(h => `${h.id}:${h.start}:${h.end}:${h.color}:${h.note ? 1 : 0}`).join('|')
  const answers = answersFor(data, bookKey, topic.id)
  const ansSig = JSON.stringify(answers)
  const { element: menu, onMarkTap } = useHighlighter({ rootRef: ref, store, bookKey, topic, highlights })

  // «Red de temas»: términos enlazados (preferencia «Enlaces entre libros», sí de partida)
  const linksOn = data.prefs.links !== false
  const red = useRed(userId, linksOn)
  const linkSig = linksOn && red ? 'on' : 'off'
  const links = useLinks()
  const navigate = useNavigate()
  const [card, setCard] = useState(null) // { id, rect }
  const [after, setAfter] = useState(null) // { fn }: lo que se hace cuando la tarjeta ya salió del historial
  useHistoryLayer(!!card, () => setCard(null))
  useEffect(() => { if (!card && after) { setAfter(null); whenSettled(after.fn) } }, [card, after])
  useEffect(() => { setCard(null) }, [topic.id])
  const closeThen = fn => { setAfter({ fn }); setCard(null) }

  // El HTML se pone a mano (no con dangerouslySetInnerHTML): React no debe volver a escribirlo, porque encima
  // van las marcas y el estado de las preguntas. Los efectos de abajo corren después, en este orden.
  useLayoutEffect(() => {
    const body = ref.current
    if (!body) return
    body.innerHTML = topic.html
    decorate(body)
    markOverflow(body)
    onReady?.(body)
  }, [topic.id]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const body = ref.current
    if (!body || typeof ResizeObserver === 'undefined') return undefined
    const ro = new ResizeObserver(() => markOverflow(body))
    ro.observe(body)
    return () => ro.disconnect()
  }, [topic.id])
  // botón de vista de tabla: texto real (es data-lw-ui: no cuenta para las posiciones del texto)
  const tablas = data.prefs.tablas === 'tabla'
  useLayoutEffect(() => {
    ref.current?.querySelectorAll('.m-tbl-mode').forEach(b => { b.textContent = tablas ? 'Ver en tarjetas' : 'Ver como tabla' })
  }, [topic.id, tablas])
  useLayoutEffect(() => { if (ref.current) applyAnswers(ref.current, answers) }, [topic.id, ansSig]) // eslint-disable-line react-hooks/exhaustive-deps

  // enlaces de la red de temas: envuelven nodos de texto que ya existen (el texto no cambia). Antes se quitan las marcas
  // (un término puede quedar partido por un destacado); el efecto de abajo las vuelve a pintar encima.
  useLayoutEffect(() => {
    const body = ref.current
    if (!body) return
    const had = body.querySelector('span.lw-term')
    if (!had && linkSig === 'off') return
    unpaint(body, 'hit'); unpaint(body, 'hl'); unpaint(body, 'flash')
    unlinkTerms(body)
    if (linkSig === 'on') {
      const r = linkTerms(body, red, contextFor(red, bookKey, topic, book))
      if (import.meta.env.DEV) body.dataset.lwLinks = `${r.links}:${r.ms.toFixed(1)}`
    }
  }, [topic.id, linkSig]) // eslint-disable-line react-hooks/exhaustive-deps

  // destacados + apariciones de lo buscado
  useLayoutEffect(() => {
    const body = ref.current
    if (!body) return
    unpaint(body, 'hit'); unpaint(body, 'hl')
    paint(body, highlights.map(h => ({ start: h.start, end: h.end, id: h.id, note: !!h.note, cls: `lw-hl lw-hl-${h.color}` })), 'hl')
    const q = norm(query.trim())
    if (q.length >= 2) paint(body, findAll(norm(bodyText(body)), q).map(r => ({ ...r, cls: 'lw-hit' })), 'hit')
  }, [topic.id, hlSig, query, ansSig, linkSig]) // eslint-disable-line react-hooks/exhaustive-deps

  // ir a un tramo del texto
  useEffect(() => {
    const body = ref.current
    if (!body || !focus || !(focus.end > focus.start)) return undefined
    const r = rangeAt(body, focus.start, focus.end)
    const el = r && (r.startContainer.nodeType === 1 ? r.startContainer : r.startContainer.parentElement)
    if (!el) return undefined
    const go = () => {
      const sc = body.closest('.lw-scroll')
      const range = rangeAt(body, focus.start, focus.end)
      let rect = range?.getBoundingClientRect()
      if (rect && !rect.width && !rect.height) {
        // el tramo no se ve (p. ej. dentro de algo oculto): se baja hasta lo visible más cercano que lo contiene
        let n = range.startContainer.nodeType === 1 ? range.startContainer : range.startContainer.parentElement
        while (n && n !== body && n.offsetParent === null) n = n.parentElement
        rect = n && n !== body ? n.getBoundingClientRect() : null
      }
      if (!sc || !rect || (!rect.width && !rect.height)) return
      const box = sc.getBoundingClientRect()
      sc.scrollTop += rect.top - box.top - box.height * 0.3
    }
    go()
    paint(body, [{ start: focus.start, end: focus.end, cls: 'lw-flash' }], 'flash')
    // las fotos terminan de medirse después: se corrige el lugar una vez más
    const t1 = setTimeout(go, 350)
    const t2 = setTimeout(() => unpaint(body, 'flash'), 2200)
    return () => { clearTimeout(t1); clearTimeout(t2); unpaint(body, 'flash') }
  }, [topic.id, focus?.start, focus?.end, focus?.n]) // eslint-disable-line react-hooks/exhaustive-deps

  const answer = (q, li) => {
    if (q.classList.contains('lw-answered')) return
    if (!window.getSelection()?.isCollapsed) return // estaba seleccionando texto, no respondiendo
    store.setAnswer(bookKey, topic.id, q.getAttribute('data-q'), li.getAttribute('data-id'))
  }
  const onClick = e => {
    const t = e.target
    if (t.closest('.m-tbl-mode')) { store.setPrefs({ tablas: data.prefs.tablas === 'tabla' ? 'tarjetas' : 'tabla' }); return }
    const retry = t.closest('.lw-q-retry')
    if (retry) { store.setAnswer(bookKey, topic.id, retry.closest('.m-q').getAttribute('data-q'), null); return }
    const li = t.closest('.m-opts > li'), q = li?.closest('.m-q')
    if (li && q && !q.classList.contains('lw-answered')) { answer(q, li); return }
    const term = t.closest('span.lw-term')
    const hl = t.closest('mark[data-lw="hl"]')
    // sobre un término: la tarjeta. Si el destacado es solo ese término, su menú (para poder editarlo) con
    // «Ver qué es …» para abrir la tarjeta igual (mismo gesto en teléfono y computador)
    if (term && !(hl && onlyIn(ref.current, hl.dataset.id, term))) { openTerm(term); return }
    if (hl) {
      const tt = term && red?.terms.get(term.dataset.term)
      onMarkTap(hl.dataset.id, hl, tt ? { label: `Ver qué es ${tt.name.length > 34 ? `${tt.name.slice(0, 33).trimEnd()}…` : tt.name}`, run: () => openTerm(term) } : null)
      return
    }
    if (t.closest('a')) { e.preventDefault(); return }
    const zb = t.closest('.lw-algo-zoom')
    const algo = zb ? zb.closest('.lw-algo-f')?.previousElementSibling : t.closest('.m-algo-b')
    if (algo?.matches?.('.m-algo-b')) { const svg = algo.querySelector('svg')?.cloneNode(true); if (svg) { svg.style.removeProperty('--lw-algo-min'); setZoomed({ svg: svg.outerHTML, title: algo.previousElementSibling?.textContent || '' }) } return }
    const fig = t.closest('.m-fig')
    if (fig) { const img = fig.querySelector('img'); if (img) setZoomed({ img: img.src, title: fig.querySelector('figcaption')?.textContent || '' }) }
  }
  const openTerm = el => {
    if (!red || !window.getSelection()?.isCollapsed) return // estaba seleccionando texto
    const term = red.terms.get(el.dataset.term)
    if (!term) return
    loadDetails(userId, term.spec) // lo de la tarjeta (t/<spec>.json), en paralelo con abrirla
    setCard({ id: term.id, rect: el.getBoundingClientRect() })
  }
  const onClass = route => closeThen(() => navigate(route))
  const onBook = (target, { same } = {}) => {
    if (same && wide()) {
      // el mismo libro en el computador: en otra pestaña (este queda como está)
      setCard(null)
      window.open(urlWith({ leer: `${target.item}:${target.fileIdx}`, t: target.topicId, pdf: null }), '_blank', 'noopener')
      return
    }
    if (!links?.openBook) return
    closeThen(() => links.openBook(target))
  }
  const onKeyDown = e => {
    if (e.key !== 'Enter' && e.key !== ' ') return
    const term = e.target.closest?.('span.lw-term')
    if (term) { e.preventDefault(); openTerm(term); return }
    const li = e.target.closest?.('.m-opts > li')
    const q = li?.closest('.m-q')
    if (q) { e.preventDefault(); answer(q, li) }
  }

  return (
    <>
      <div ref={ref} key={topic.id} className={`lw-body ${data.prefs.tablas === 'tabla' ? 'lw-tabla' : 'lw-cards'}`}
        onClick={onClick} onKeyDown={onKeyDown} />
      {/* el menú y el visor van en la raíz del lector (.lw), fuera del texto: no heredan su letra ni su tamaño */}
      {host ? createPortal(<>{menu}{zoomed && <ZoomViewer z={zoomed} style={book?.theme} mark={mark} onClose={() => setZoomed(null)} />}
        {card && red?.terms.get(card.id) && (
          <TermCard term={red.terms.get(card.id)} red={red} userId={userId} here={links?.here} topicId={topic.id} wide={wide()} rect={card.rect}
            onClose={() => setCard(null)} onClass={onClass} onBook={onBook} />
        )}</>, host) : null}
    </>
  )
}

export default memo(TopicBody)
