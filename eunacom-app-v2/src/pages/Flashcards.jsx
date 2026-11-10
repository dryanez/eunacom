import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { ChevronRight, ChevronLeft, Layers, Check, RotateCcw } from 'lucide-react'

const LS_KEY = 'eunacom_flashcards_v1'
const NEW_PER_DAY = 20
const MIN = 1 / 1440
const SKY = '#38bdf8'

const MODULES = {
  1: 'Módulo 1 · Medicina Interna',
  2: 'Módulo 2 · Cirugía y especialidades',
  3: 'Módulo 3 · Materno-infantil',
  4: 'Módulo 4 · Salud Pública',
}
const ABBR = { respiratorio: 'RES', otorrinolaringologia: 'ORL', 'salud-publica': 'SAP', gastroenterologia: 'GAS', ginecologia: 'GIN' }
const PALETTE = [
  ['rgba(239,68,68,.15)', '#f87171'], ['rgba(167,139,250,.15)', '#a78bfa'], ['rgba(245,158,11,.15)', '#fbbf24'],
  ['rgba(34,197,94,.15)', '#4ade80'], ['rgba(56,189,248,.15)', '#38bdf8'], ['rgba(236,72,153,.15)', '#f472b6'],
  ['rgba(20,184,166,.15)', '#2dd4bf'],
]

const todayStr = () => new Date().toISOString().slice(0, 10)

function loadStore() {
  try {
    const s = JSON.parse(localStorage.getItem(LS_KEY))
    if (s && s.cards) return s
  } catch { /* ignore */ }
  return { cards: {}, newDay: { date: todayStr(), n: {} } }
}
function saveStore(s) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(s)) } catch { /* ignore */ }
}
function normDay(s) {
  if (s.newDay?.date !== todayStr()) s.newDay = { date: todayStr(), n: {} }
  return s
}

// ---- scheduling -------------------------------------------------------
// state: { due (ms), interval (days, fractional for minutes), ease }
function nextState(st, grade) {
  const now = Date.now()
  const ease = st?.ease || 2.5
  const iv = st?.interval || 0
  const learning = iv < 1
  let interval, e = ease
  if (grade === 0) { interval = MIN; e = Math.max(1.3, ease - 0.2) }
  else if (learning) interval = grade === 1 ? 10 * MIN : grade === 2 ? 1 : 4
  else if (grade === 1) { interval = Math.max(1, iv * 1.2); e = Math.max(1.3, ease - 0.15) }
  else if (grade === 2) interval = Math.max(iv + 1, iv * ease)
  else { interval = Math.max(iv + 2, iv * ease * 1.3); e = ease + 0.15 }
  return { due: now + interval * 86400000, interval, ease: e }
}
function fmt(days) {
  if (days < 1) { const m = Math.round(days * 1440); return m < 60 ? `${m} min` : `${Math.round(m / 60)} h` }
  const d = Math.round(days)
  if (d < 30) return d === 1 ? '1 día' : `${d} días`
  if (d < 365) { const m = Math.round(d / 30); return m === 1 ? '1 mes' : `${m} meses` }
  const y = Math.round((d / 365) * 10) / 10
  return `${y} años`
}

// ---- cloze rendering ----------------------------------------------------
function renderCloze(text, active, revealed) {
  const clean = text.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<img[^>]*>/gi, '')
  return clean.replace(/\{\{c(\d+)::([\s\S]*?)(?:::[^}]*)?\}\}/g, (_, n, ans) => {
    if (Number(n) !== active) return ans
    return revealed ? `<span class="fc-ans">${ans}</span>` : '<span class="fc-pill">[...]</span>'
  })
}

const CSS = `
.fc{min-height:100%;background:#0b1120;color:#e2e8f0;font-family:'Lexend',system-ui,sans-serif;padding:20px 16px 48px}
.fc__in{max-width:720px;margin:0 auto}
.fc h2{margin:0;font-size:26px;font-weight:700;color:#f1f5f9}
.fc__sub{color:#94a3b8;font-size:13px;margin-top:4px}
.fc__btn{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;margin:18px 0 6px;padding:14px;border:0;border-radius:16px;
 background:linear-gradient(135deg,#2563eb,#38bdf8);color:#fff;font:600 15px 'Lexend',sans-serif;cursor:pointer}
.fc__btn:disabled{opacity:.45;cursor:default}
.fc__mod{margin:24px 4px 8px;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#94a3b8;font-weight:600}
.fc__card{background:rgba(30,41,59,.55);border:1px solid rgba(56,189,248,.14);border-radius:20px;padding:4px 14px}
.fc__li{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid rgba(148,163,184,.1);cursor:pointer;width:100%;background:none;border-left:0;border-right:0;border-top:0;color:inherit;text-align:left;font-family:inherit}
.fc__li:last-child{border-bottom:0}
.fc__ab{width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex:none}
.fc__nm{flex:1;font-size:15px;font-weight:500;color:#f1f5f9}
.fc__nm small{display:block;color:#94a3b8;font-size:12px;font-weight:400;margin-top:2px}
.fc__due{color:${SKY};font-size:13px;display:flex;align-items:center;gap:2px;white-space:nowrap}
.fc__due.z{color:#64748b}
.fc__top{display:flex;justify-content:space-between;align-items:center;color:#94a3b8;font-size:13px}
.fc__back{display:flex;align-items:center;gap:4px;background:none;border:0;color:#94a3b8;font:inherit;cursor:pointer;padding:4px 0}
.fc__bar{height:4px;border-radius:4px;background:rgba(148,163,184,.15);margin:12px 0 16px;overflow:hidden}
.fc__bar i{display:block;height:100%;background:linear-gradient(135deg,#2563eb,#38bdf8)}
.fc__study{background:rgba(30,41,59,.55);border:1px solid rgba(56,189,248,.14);border-radius:22px;padding:28px 22px;min-height:240px;
 display:flex;flex-direction:column;justify-content:center;cursor:pointer;user-select:none}
.fc__study small{color:${SKY};font-size:11px;letter-spacing:.06em;text-transform:uppercase;margin-bottom:14px}
.fc__txt{font-size:19px;line-height:1.55;color:#f1f5f9}
.fc-pill{display:inline-block;padding:1px 12px;border-radius:10px;background:rgba(56,189,248,.14);color:${SKY};font-weight:600}
.fc-ans{display:inline;padding:2px 8px;border-radius:8px;background:rgba(56,189,248,.15);color:${SKY};font-weight:600}
.fc__hint{margin-top:18px;color:#64748b;font-size:12px;text-align:center}
.fc__meta{margin-top:16px;color:#94a3b8;font-size:12px}
.fc__chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.fc__chip{padding:4px 10px;border-radius:999px;background:rgba(56,189,248,.08);border:1px solid rgba(56,189,248,.14);font-size:11px;color:#cbd5e1}
.fc__chip b{color:${SKY};font-weight:600;margin-right:4px}
.fc__grades{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:20px}
.fc__g{padding:12px 0;border-radius:14px;border:0;font:500 13px 'Lexend',sans-serif;cursor:pointer;text-align:center}
.fc__g small{display:block;color:#94a3b8;font-size:11px;margin-top:3px}
.fc__done{text-align:center;padding:48px 16px}
.fc__done h3{font-size:22px;margin:14px 0 6px;color:#f1f5f9}
@media(min-width:600px){.fc{padding-top:32px}.fc__txt{font-size:21px}}
`

const GRADES = [
  ['Otra vez', 'rgba(239,68,68,.15)', '#fca5a5'],
  ['Difícil', 'rgba(245,158,11,.15)', '#fcd34d'],
  ['Bien', 'rgba(34,197,94,.15)', '#86efac'],
  ['Fácil', 'rgba(56,189,248,.15)', SKY],
]

export default function Flashcards() {
  const [decks, setDecks] = useState(null)
  const [err, setErr] = useState(null)
  const [store, setStore] = useState(() => normDay(loadStore()))
  const [session, setSession] = useState(null) // { title, queue:[card], total, done }
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    fetch('/data/flashcards/index.json').then(r => r.json()).then(setDecks).catch(e => setErr(String(e)))
  }, [])

  const stats = useMemo(() => {
    // eslint-disable-next-line react-hooks/purity
    const now = Date.now()
    const out = {}
    for (const d of decks || []) {
      let seen = 0, due = 0
      const prefix = d.id + '-'
      for (const id in store.cards) {
        if (id.startsWith(prefix)) { seen++; if (store.cards[id].due <= now) due++ }
      }
      const used = store.newDay.n[d.id] || 0
      const newAvail = Math.max(0, Math.min(NEW_PER_DAY - used, d.count - seen))
      out[d.id] = { due, newAvail, today: due + newAvail }
    }
    return out
  }, [decks, store, session]) // eslint-disable-line react-hooks/exhaustive-deps

  const totalToday = Object.values(stats).reduce((a, s) => a + s.today, 0)
  const totalCards = (decks || []).reduce((a, d) => a + d.count, 0)

  const buildQueue = useCallback(async (list) => {
    const now = Date.now()
    const dueQ = [], newQ = []
    for (const d of list) {
      const cards = await fetch(`/data/flashcards/${d.id}.json`).then(r => r.json())
      const prefix = d.id + '-'
      let used = store.newDay.n[d.id] || 0
      for (const c of cards) {
        const st = store.cards[c.id]
        if (st) { if (st.due <= now) dueQ.push({ ...c, deck: d.id }) }
        else if (used < NEW_PER_DAY) { newQ.push({ ...c, deck: d.id }); used++ }
      }
      void prefix
    }
    dueQ.sort((a, b) => store.cards[a.id].due - store.cards[b.id].due)
    return [...dueQ, ...newQ]
  }, [store])

  const start = async (list, title) => {
    const queue = await buildQueue(list)
    setRevealed(false)
    setSession({ title, queue, total: queue.length, done: 0 })
  }

  const card = session?.queue[0]

  const answer = useCallback((grade) => {
    if (!card) return
    setStore(prev => {
      const s = normDay({ cards: { ...prev.cards }, newDay: { ...prev.newDay, n: { ...prev.newDay.n } } })
      const wasNew = !s.cards[card.id]
      const ns = nextState(s.cards[card.id], grade)
      s.cards[card.id] = ns
      if (wasNew) s.newDay.n[card.deck] = (s.newDay.n[card.deck] || 0) + 1
      saveStore(s)
      return s
    })
    setSession(prev => {
      const [cur, ...rest] = prev.queue
      const ns = nextState(store.cards[cur.id], grade)
      const again = ns.due - Date.now() <= 20 * 60000
      return { ...prev, queue: again ? [...rest, cur] : rest, done: again ? prev.done : prev.done + 1 }
    })
    setRevealed(false)
  }, [card, store])

  useEffect(() => {
    if (!card) return
    const onKey = (e) => {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setRevealed(true) }
      else if (revealed && '1234'.includes(e.key)) answer(Number(e.key) - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [card, revealed, answer])

  const colorOf = (i) => PALETTE[i % PALETTE.length]
  const abbr = (d) => ABBR[d.id] || d.name.normalize('NFD').replace(/[̀-ͯ]/g, '').slice(0, 3).toUpperCase()

  // ---- study view
  if (session) {
    const finished = !card
    const st = card ? store.cards[card.id] : null
    return (
      <div className="fc"><style>{CSS}</style><div className="fc__in">
        <div className="fc__top">
          <button className="fc__back" onClick={() => setSession(null)}><ChevronLeft size={18} />{session.title}</button>
          <span>{Math.min(session.done + 1, session.total)} / {session.total}</span>
        </div>
        <div className="fc__bar"><i style={{ width: `${session.total ? (session.done / session.total) * 100 : 100}%` }} /></div>
        {finished ? (
          <div className="fc__done">
            <Check size={44} color={SKY} />
            <h3>{session.total ? '¡Repaso terminado!' : 'Nada para repasar hoy'}</h3>
            <div className="fc__sub">{session.total ? `${session.total} tarjetas repasadas.` : 'Vuelve mañana por más tarjetas.'}</div>
            <button className="fc__btn" onClick={() => setSession(null)}>Volver a los mazos</button>
          </div>
        ) : (
          <>
            <div className="fc__study" onClick={() => setRevealed(true)}>
              <small>{(decks.find(d => d.id === card.deck) || {}).name} · {st ? 'Repaso' : 'Nueva'}</small>
              <div className="fc__txt" dangerouslySetInnerHTML={{ __html: renderCloze(card.text, card.cloze, revealed) }} />
              {!revealed && <div className="fc__hint">Toca para ver la respuesta</div>}
            </div>
            {revealed && (
              <>
                {(card.source || card.codes.length > 0) && (
                  <div className="fc__meta">
                    {card.source && <div>{card.source}</div>}
                    {card.codes.length > 0 && (
                      <div className="fc__chips">
                        {card.codes.map(c => <span key={c.code} className="fc__chip"><b>{c.code}</b>{c.name}</span>)}
                      </div>
                    )}
                  </div>
                )}
                <div className="fc__grades">
                  {GRADES.map(([label, bg, col], i) => (
                    <button key={label} className="fc__g" style={{ background: bg, color: col }} onClick={() => answer(i)}>
                      {label}<small>{fmt(nextState(st, i).interval)}</small>
                    </button>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div></div>
    )
  }

  // ---- deck list
  return (
    <div className="fc"><style>{CSS}</style><div className="fc__in">
      <h2>Flashcards</h2>
      <div className="fc__sub">{decks ? `${totalCards.toLocaleString('es-CL')} tarjetas · ${totalToday} para repasar hoy` : err ? 'No se pudieron cargar los mazos' : 'Cargando...'}</div>
      <button className="fc__btn" disabled={!decks || totalToday === 0} onClick={() => start(decks.filter(d => stats[d.id].today > 0), 'Repaso de hoy')}>
        <Layers size={18} />Repasar las {totalToday} de hoy
      </button>
      {[1, 2, 3, 4].map(m => {
        const list = (decks || []).filter(d => d.module === m)
        if (!list.length) return null
        return (
          <div key={m}>
            <div className="fc__mod">{MODULES[m]}</div>
            <div className="fc__card">
              {list.map(d => {
                const [bg, col] = colorOf(decks.indexOf(d))
                const s = stats[d.id]
                return (
                  <button key={d.id} className="fc__li" onClick={() => start([d], d.name)}>
                    <span className="fc__ab" style={{ background: bg, color: col }}>{abbr(d)}</span>
                    <span className="fc__nm">{d.name}<small>{d.count.toLocaleString('es-CL')} tarjetas</small></span>
                    <span className={`fc__due${s.today ? '' : ' z'}`}>{s.today} para hoy<ChevronRight size={16} /></span>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div></div>
  )
}
