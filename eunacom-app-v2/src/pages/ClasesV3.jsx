// Mis clases (V3): las clases animadas en R2, ordenadas como los libros: especialidad (tomo) → bloques → clases.
// El video se detiene en sus propias preguntas; al responder, «Ver la explicación» salta a la explicación en vivo.
// Test de 20 preguntas al final de cada bloque y ensayo de 90 al final de cada especialidad.
// Datos estáticos en /data/clases-v3 (los genera ~/Documents/Archive/clases-app-v3/gen_data.cjs).
// Las clases antiguas del Dr. Guevara siguen en /clases-guevara.
import '../styles/clasesV3.css'
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useSubscription } from '../contexts/SubscriptionContext'
import { fetchClaseProgress, saveClaseProgress } from '../lib/api'
import LoginGateModal from '../components/LoginGateModal'
import PaymentModal from '../components/PaymentModal'

const BASE = '/data/clases-v3'
const FREE = 3                       // clases gratis sin plan (igual que antes)
const LS = 'cv3_progress'
const cache = {}
const getJSON = url => (cache[url] = cache[url] || fetch(url).then(r => { if (!r.ok) throw new Error(r.status); return r.json() }))

const mm = t => { t = Math.max(0, Math.round(t || 0)); return Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0') }
const lvl = n => (n >= 12 ? 4 : n >= 6 ? 3 : n >= 2 ? 2 : n >= 1 ? 1 : 0)
const hexSoft = (hex, a = 0.14) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})` }
const specStyle = s => (s ? { '--spec': s.color, '--spec-soft': hexSoft(s.color) } : undefined)
const LETTERS = 'ABCDE'

/* ── avance: localStorage + servidor (clase_progress, ids «v3:<clase>» y «v3test:<esp>:<bloque>») ── */
const readLocal = () => { try { return JSON.parse(localStorage.getItem(LS)) || { done: {}, pos: {}, tests: {} } } catch { return { done: {}, pos: {}, tests: {} } } }
function useProgress(user) {
  const [p, setP] = useState(readLocal)
  useEffect(() => {
    if (!user?.id) return
    fetchClaseProgress(user.id).then(rows => {
      const cur = readLocal()
      for (const r of rows || []) {
        if (r.clase_id?.startsWith('v3:') && r.video_watched === 1) cur.done[r.clase_id.slice(3)] = 1
        if (r.clase_id?.startsWith('v3test:') && r.quiz_completed === 1) {
          const k = r.clase_id.slice(7); const old = cur.tests[k]
          if (!old || (r.quiz_correct || 0) > old.ok) cur.tests[k] = { ok: r.quiz_correct || 0, n: r.quiz_total || 0 }
        }
      }
      localStorage.setItem(LS, JSON.stringify(cur)); setP(cur)
    }).catch(() => {})
  }, [user?.id])
  const update = useCallback(fn => setP(prev => { const n = fn(JSON.parse(JSON.stringify(prev))); localStorage.setItem(LS, JSON.stringify(n)); return n }), [])
  const markDone = useCallback(id => {
    update(n => { n.done[id] = 1; return n })
    if (user?.id) saveClaseProgress({ userId: user.id, claseId: 'v3:' + id, videoWatched: 1 }).catch(() => {})
  }, [user?.id, update])
  const savePos = useCallback((id, t) => update(n => { n.pos[id] = Math.round(t); return n }), [update])
  const saveTest = useCallback((key, ok, total, answers) => {
    update(n => { const o = n.tests[key]; if (!o || ok >= o.ok) n.tests[key] = { ok, n: total }; return n })
    if (user?.id) saveClaseProgress({ userId: user.id, claseId: 'v3test:' + key, quizCompleted: 1, quizScore: Math.round(100 * ok / total), quizCorrect: ok, quizTotal: total, quizAnswers: JSON.stringify(answers) }).catch(() => {})
  }, [user?.id, update])
  return { p, markDone, savePos, saveTest }
}

/* ── piezas ── */
const Imp = ({ c }) => (
  <span className="imp" data-l={lvl(c.imp)}>
    <span className="bar"><i /><i /><i /><i /></span>
    <span>{c.imp ? <>Salió <b>{c.imp}</b> {c.imp === 1 ? 'vez' : 'veces'} · {c.exams} de 17 exámenes</> : 'No ha salido en el examen'}</span>
  </span>
)
const Legend = () => (
  <div className="legend"><span>Cuánto lo pregunta el EUNACOM (2013–2026):</span>
    {['1 vez', '2 a 5', '6 a 11', '12 o más'].map((t, i) => <span key={t} className="imp" data-l={i + 1}><span className="bar"><i /><i /><i /><i /></span>{t}</span>)}
  </div>
)
const Back = ({ to, children }) => <Link className="cv3-back" to={to}><ChevronLeft size={16} />{children}</Link>

function Options({ q, picked, onPick }) {
  return (
    <div className="opts">
      {q.options.map((o, j) => {
        const id = o.id || LETTERS[j]
        const cls = picked ? (id === q.correct ? 'ok' : id === picked ? 'bad' : '') : ''
        return <button key={id} className={'opt ' + cls} disabled={!!picked} onClick={() => onPick(id)}><i>{id}</i><span>{o.text}</span></button>
      })}
    </div>
  )
}
function Question({ q, label }) {
  const [pick, setPick] = useState(null)
  return (
    <div className="cv3-rq">
      <div className="k">{label || q.src}</div>
      {q.image && <img src={q.image} alt="" loading="lazy" />}
      <p>{q.stem}{q.question ? <><br /><b>{q.question}</b></> : null}</p>
      <Options q={q} picked={pick} onPick={setPick} />
      {pick && <div className="exp"><b>{pick === q.correct ? 'Correcto. ' : `La correcta es la ${q.correct}. `}</b>{q.explanation}</div>}
    </div>
  )
}

/* ── datos ── */
function useIndex() {
  const [idx, setIdx] = useState(null)
  useEffect(() => { getJSON(BASE + '/index.json').then(setIdx).catch(() => setIdx(false)) }, [])
  return useMemo(() => {
    if (!idx) return { idx }
    const specs = {}, byId = {}
    idx.modules.forEach((m, mi) => m.specialties.forEach(s => {
      specs[s.key] = { ...s, module: m.name, mi }
      s.classes.forEach(c => { byId[c.id] = c })
      s.blocks.forEach(b => b.ids.forEach(id => { byId[id] = { ...byId[id], spec: s.key, block: b.n } }))
    }))
    return { idx, specs, byId }
  }, [idx])
}
const orderedIds = s => s.blocks.flatMap(b => b.ids)

/* ════════ INICIO ════════ */
function Home({ data, prog }) {
  const { idx, specs, byId } = data
  const all = Object.values(specs)
  const total = all.reduce((a, s) => a + s.classes.length, 0)
  const done = Object.keys(prog.done).filter(id => byId[id]).length
  // dónde quedaste: la última clase vista con posición guardada
  const last = Object.keys(prog.pos).filter(id => byId[id] && !prog.done[id]).pop()
  const lc = last && byId[last], ls = lc && specs[lc.spec]
  return (
    <>
      <div className="cv3-hero">
        <div>
          <div className="k" style={{ color: '#38bdf8' }}>Clases en video · Perfil EUNACOM V3</div>
          <h1>Mis clases</h1>
          <p>{total} clases animadas en el orden de tus 21 tomos. Cada video se detiene en sus preguntas para que respondas; cada bloque termina con un test de 20 preguntas y cada especialidad con un ensayo de 90.</p>
        </div>
        <div className="cv3-prog" style={{ minWidth: 240 }}>
          <div className="row" style={{ margin: 0 }}><span>Tu avance</span><b>{done} de {total}</b></div>
          <div className="meter"><i style={{ width: `${100 * done / total}%`, background: '#38bdf8' }} /></div>
        </div>
      </div>
      {lc && (
        <Link className="cv3-cont" style={specStyle(ls)} to={`/mis-clases/${ls.key}/${lc.id}`}>
          <div><small>Sigue donde quedaste · {ls.name}</small><b>{lc.num} · {lc.title}</b></div>
          <span className="btn">Continuar</span>
        </Link>
      )}
      {idx.modules.map(m => (
        <section className="cv3-mod" key={m.name}>
          <h2>{m.name}</h2>
          <div className="cv3-specs">
            {m.specialties.map(s => {
              const d = s.classes.filter(c => prog.done[c.id]).length
              const mins = s.classes.reduce((a, c) => a + c.minutes, 0)
              return (
                <Link key={s.key} className="cv3-spec" style={specStyle(s)} to={`/mis-clases/${s.key}`}>
                  <span className="tomo">Tomo {Number(s.tomo) || ''}</span>
                  <b>{s.name}</b>
                  <small>{s.classes.length} clases · {s.blocks.length} {s.blocks.length === 1 ? 'bloque' : 'bloques'} · {Math.floor(mins / 60)} h {mins % 60} min</small>
                  <div className="meter" style={{ marginTop: 4 }}><i style={{ width: `${100 * d / s.classes.length}%` }} /></div>
                  <small>{d ? `${d} de ${s.classes.length} vistas` : 'Sin empezar'}</small>
                </Link>
              )
            })}
          </div>
        </section>
      ))}
      <Link className="cv3-old" to="/clases-guevara">
        <div><b>Clases del Dr. Guevara</b><small>Las clases grabadas anteriores siguen disponibles, con sus resúmenes y pruebas.</small></div>
        <span className="btn ghost">Abrir</span>
      </Link>
    </>
  )
}

/* ════════ TOMO (Ruta) ════════ */
function Tomo({ s, prog }) {
  const ids = orderedIds(s)
  const byId = Object.fromEntries(s.classes.map(c => [c.id, c]))
  const doneN = ids.filter(id => prog.done[id]).length
  const now = ids.find(id => !prog.done[id])
  const mins = s.classes.reduce((a, c) => a + c.minutes, 0), tot = s.classes.reduce((a, c) => a + c.imp, 0)
  const nb = s.blocks.length
  return (
    <>
      <Back to="/mis-clases">Mis clases</Back>
      <div className="cv3-tomo-head">
        <div>
          <div className="k">{s.module} · Tomo {Number(s.tomo)}</div>
          <h1>{s.name}</h1>
          <p>{s.classes.length} clases en {nb} {nb === 1 ? 'bloque' : 'bloques'}, en el mismo orden que tu Tomo {Number(s.tomo)}. Al final de cada bloque, un test de 20 preguntas; al final, el ensayo de 90.</p>
        </div>
        <div className="cv3-prog">
          <div className="row" style={{ margin: 0 }}><span>Tu avance</span><b>{doneN} de {ids.length} clases</b></div>
          <div className="meter"><i style={{ width: `${100 * doneN / ids.length}%` }} /></div>
          <div className="row"><span>Duración total</span><b>{Math.floor(mins / 60)} h {mins % 60} min</b></div>
          <div className="row"><span>Preguntas reales del tema</span><b>{tot}</b></div>
        </div>
      </div>
      <Legend />
      <div className="cv3-route">
        {s.blocks.map(b => {
          const t = prog.tests[`${s.key}:${b.n}`]
          return (
            <React.Fragment key={b.n}>
              <div className="cv3-blk"><span className="dot">{b.n}</span><div className="k">Bloque {b.n}</div><h2>{b.name}</h2></div>
              {b.ids.map(id => {
                const c = byId[id]
                return (
                  <Link key={id} className={'cv3-cls ' + (prog.done[id] ? 'done' : id === now ? 'now' : '')} to={`/mis-clases/${s.key}/${id}`}>
                    <span><span className="t">{c.num} · {c.title}</span><br />
                      <small>{c.minutes} min{prog.done[id] ? <> · <span className="ok">Vista</span></> : id === now ? ' · Sigue aquí' : prog.pos[id] ? ` · Vas en ${mm(prog.pos[id])}` : ''}</small></span>
                    <Imp c={c} />
                  </Link>
                )
              })}
              {b.test > 0 && (
                <Link className="cv3-test" to={`/mis-clases/${s.key}/test/${b.n}`}>
                  <span>Test del bloque {b.n} · {b.test} preguntas{t ? <small> · tu mejor resultado: {t.ok} de {t.n}</small> : null}</span><span>›</span>
                </Link>
              )}
            </React.Fragment>
          )
        })}
        <div className="cv3-blk"><span className="dot">{nb + 1}</span><div className="k">Final</div><h2>Ensayo de {s.final} preguntas</h2></div>
      </div>
      {s.final > 0 && (
        <div className="cv3-final">
          <div><div className="k">Al terminar {s.name}</div><h2 style={{ marginTop: 4 }}>Ensayo final · {s.final} preguntas</h2>
            <p>Como el examen: todas las preguntas seguidas, con tu puntaje total y las clases que conviene repasar.{prog.tests[`${s.key}:final`] ? ` Tu mejor resultado: ${prog.tests[`${s.key}:final`].ok} de ${prog.tests[`${s.key}:final`].n}.` : ''}</p></div>
          <Link className="btn" to={`/mis-clases/${s.key}/test/final`}>Hacer el ensayo</Link>
        </div>
      )}
    </>
  )
}

/* ════════ CLASE ════════ */
function Written({ c, onJump }) {
  if (!c.written?.length) return <p className="mute">Esta clase todavía no tiene versión escrita.</p>
  const at = title => (c.chapters.find(h => h.title === title) || {}).t
  return c.written.map((s, i) => {
    const t = at(s.title)
    return (
      <div className="cv3-w" key={i}>
        {t != null ? <button className="jump" onClick={() => onJump(t)}>▶ {mm(t)}</button> : <span />}
        <div>
          <h4>{s.title}</h4>
          {s.say && <p>{s.say}</p>}
          {s.type === 'points' && Array.isArray(s.body) && (
            <div className="cv3-wcards">{s.body.map((cd, j) => (
              <div className="cv3-wcard" key={j}>{cd.h && <h5>{cd.h}</h5>}<ul>{cd.items.map((it, k) => <li key={k}><b>{it.t}</b>{it.d && <span>{it.d}</span>}</li>)}</ul></div>
            ))}</div>
          )}
          {s.type === 'table' && s.body?.rows && (
            <div style={{ overflowX: 'auto' }}><table className="cv3-wtable">
              {s.body.head && <thead><tr>{s.body.head.map((h, j) => <th key={j}>{h}</th>)}</tr></thead>}
              <tbody>{s.body.rows.map((r, j) => <tr key={j}>{(r || []).map((x, k) => <td key={k}>{typeof x === 'object' ? x?.t || x?.text || '' : x}</td>)}</tr>)}</tbody>
            </table></div>
          )}
          {(s.type === 'flow' || s.type === 'image') && Array.isArray(s.body) && s.body.some(n => n.t) && (
            <div className="cv3-wflow">{s.body.filter(n => n.t).map((n, j) => <div key={j}><b>{n.t}</b>{n.s && <span>{n.s}</span>}</div>)}</div>
          )}
        </div>
      </div>
    )
  })
}

function Clase({ s, id, prog, gate }) {
  const [c, setC] = useState(null)
  const [tab, setTab] = useState(0)
  const [ask, setAsk] = useState(null)        // índice de la pregunta abierta
  const [pick, setPick] = useState({})        // respuestas en el video
  const [time, setTime] = useState(0)
  const v = useRef(null), shown = useRef({}), lastSave = useRef(0)
  const nav = useNavigate()
  useEffect(() => { setC(null); setTab(0); setAsk(null); setPick({}); shown.current = {}; getJSON(`${BASE}/c/${id}.json`).then(setC).catch(() => setC(false)) }, [id])
  const ids = orderedIds(s)
  const bl = s.blocks.find(b => b.ids.includes(id))
  const sum = s.classes.find(x => x.id === id)
  const nextId = bl.ids[bl.ids.indexOf(id) + 1]
  const next = nextId && s.classes.find(x => x.id === nextId)

  const seek = t => { const el = v.current; if (!el) return; el.currentTime = t; el.play().catch(() => {}) }
  const onTime = () => {
    const el = v.current; if (!el || !c) return
    const t = el.currentTime; setTime(t)
    c.quizzes.forEach((q, i) => {
      if (!shown.current[i] && t >= q.tPause && t < q.tPause + 1.5) { shown.current[i] = 1; el.pause(); setAsk(i) }
    })
    if (t - lastSave.current > 10 || t < lastSave.current) { lastSave.current = t; prog.savePos(id, t) }
    if (!prog.p.done[id] && t > (c.total || el.duration) * 0.9) prog.markDone(id)
  }
  const onLoaded = () => { const t = prog.p.pos[id]; if (t && !prog.p.done[id] && v.current && t < (c?.total || 1e9) - 20) v.current.currentTime = t }
  const chapterOn = c ? c.chapters.reduce((k, h, i) => (time >= h.t ? i : k), 0) : 0
  const q = ask != null && c ? c.quizzes[ask] : null

  if (gate) return gate
  return (
    <>
      <Back to={`/mis-clases/${s.key}`}>{s.name}</Back>
      <div className="cv3-cl-head">
        <div className="k">Bloque {bl.n} · {bl.name} · Clase {sum.num} · {sum.minutes} min</div>
        <h1>{sum.title}</h1>
      </div>
      {c === false && <p className="mute">No se pudo cargar la clase. Revisa tu conexión y vuelve a intentar.</p>}
      {c && (
        <div className="cv3-grid">
          <div>
            <div className="cv3-player">
              <video ref={v} src={c.video} controls playsInline preload="metadata" onTimeUpdate={onTime} onLoadedMetadata={onLoaded}
                onEnded={() => { if (!prog.p.done[id]) prog.markDone(id) }} />
              {q && (
                <div className="cv3-ask">
                  <div className="cv3-ask-in">
                    <div className="k">{q.kicker || q.src} · responde para seguir</div>
                    {q.image && <img src={q.image} alt="" style={{ maxWidth: '100%', maxHeight: 220, borderRadius: 10, margin: '10px 0' }} />}
                    <p>{q.stem}</p>
                    {q.question && <p style={{ marginTop: 0 }}><b>{q.question}</b></p>}
                    <Options q={q} picked={pick[ask]} onPick={l => setPick(p => ({ ...p, [ask]: l }))} />
                    <div className="cv3-ask-foot">
                      <span className={'verdict ' + (pick[ask] ? (pick[ask] === q.correct ? 'ok' : 'bad') : '')}>
                        {pick[ask] ? (pick[ask] === q.correct ? 'Correcto' : `La correcta es la ${q.correct}`) : ''}
                      </span>
                      {pick[ask]
                        ? <button className="btn" onClick={() => { setAsk(null); seek(q.tAnswer) }}>Ver la explicación ▶</button>
                        : <button className="btn ghost" onClick={() => { setAsk(null); seek(q.tAnswer) }}>Saltar</button>}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="cv3-track" onClick={e => { const r = e.currentTarget.getBoundingClientRect(); seek(c.total * (e.clientX - r.left) / r.width) }}>
              <div className="f" style={{ width: `${Math.min(100, 100 * time / c.total)}%` }} />
              {c.quizzes.map((qq, i) => <i key={i} className={'m ' + (pick[i] ? (pick[i] === qq.correct ? 'ok' : 'bad') : '')} style={{ left: `${100 * qq.tPause / c.total}%` }} />)}
            </div>
            <div className="cv3-track-l">
              <span>{c.quizzes.length ? `La clase se detiene en sus ${c.quizzes.length} preguntas para que las respondas` : 'Clase en video'}</span>
              <span>{mm(time)} / {mm(c.total)}</span>
            </div>
            {c.codes?.length > 0 && <div className="chips">{c.codes.map(x => <span className="chip" key={x.code}><b>{x.code}</b>{x.name}</span>)}</div>}
            <Imp c={sum} />
            <div className="cv3-tabs">
              <button className={tab === 0 ? 'on' : ''} onClick={() => setTab(0)}>Clase escrita</button>
              <button className={tab === 1 ? 'on' : ''} onClick={() => setTab(1)}>Preguntas reales ({c.real.length})</button>
              {c.practice?.length > 0 && <button className={tab === 2 ? 'on' : ''} onClick={() => setTab(2)}>Practica ({c.practice.length})</button>}
            </div>
            <div className="cv3-pane">
              {tab === 0 && <Written c={c} onJump={t => { seek(t); window.scrollTo({ top: 0, behavior: 'smooth' }) }} />}
              {tab === 1 && (c.real.length ? c.real.map((qq, i) => <Question key={id + 'r' + i} q={qq} />) : <p className="mute">Este tema todavía no ha salido en el EUNACOM.</p>)}
              {tab === 2 && c.practice.map((qq, i) => <Question key={id + 'p' + i} q={qq} label={`Pregunta de la clase · ${i + 1}`} />)}
            </div>
          </div>
          <aside className="cv3-side">
            <h3>Capítulos</h3>
            <div className="list">
              {c.chapters.map((h, i) => (
                <button key={i} className={'ch ' + (h.q ? 'q ' : '') + (i === chapterOn ? 'on' : '')} onClick={() => seek(h.t)}>
                  <span className="tm">{mm(h.t)}</span><span>{h.title}</span>
                </button>
              ))}
            </div>
            {next
              ? <Link className="cv3-next" to={`/mis-clases/${s.key}/${next.id}`}><small>Siguiente clase</small><b>{next.num} · {next.title}</b></Link>
              : <Link className="cv3-next" to={`/mis-clases/${s.key}/test/${bl.n}`}><small>Terminaste el bloque {bl.n}</small><b>Hacer el test de {bl.test} preguntas</b></Link>}
          </aside>
        </div>
      )}
      {c === null && <div className="cv3-loading">Cargando la clase…</div>}
    </>
  )
}

/* ════════ TEST ════════ */
function Test({ s, n, prog }) {
  const [qs, setQs] = useState(null)
  const [i, setI] = useState(0)
  const [ans, setAns] = useState({})
  const [fin, setFin] = useState(false)
  const isFinal = n === 'final'
  const bl = !isFinal && s.blocks.find(b => String(b.n) === String(n))
  useEffect(() => { setI(0); setAns({}); setFin(false); getJSON(`${BASE}/t/${s.key}.json`).then(t => setQs(isFinal ? t.final : t.blocks[n] || [])).catch(() => setQs([])) }, [s.key, n])
  const key = `${s.key}:${isFinal ? 'final' : n}`
  const finish = () => {
    const ok = qs.filter((q, k) => ans[k] === q.correct).length
    prog.saveTest(key, ok, qs.length, ans); setFin(true); window.scrollTo(0, 0)
  }
  const title = isFinal ? `Ensayo final · ${s.name}` : `Test del bloque ${n}`
  if (!qs) return <><Back to={`/mis-clases/${s.key}`}>{s.name}</Back><div className="cv3-loading">Cargando…</div></>
  if (!qs.length) return <><Back to={`/mis-clases/${s.key}`}>{s.name}</Back><p className="mute">Este test todavía no tiene preguntas.</p></>
  const byId = Object.fromEntries(s.classes.map(c => [c.id, c]))

  if (fin) {
    const ok = qs.filter((q, k) => ans[k] === q.correct).length
    const per = {}
    qs.forEach((q, k) => { if (!q.clase || !byId[q.clase]) return; const r = per[q.clase] = per[q.clase] || { ok: 0, n: 0 }; r.n++; if (ans[k] === q.correct) r.ok++ })
    const rows = Object.entries(per).map(([id, r]) => ({ c: byId[id], ...r, pct: r.ok / r.n })).sort((a, b) => a.pct - b.pct)
    const pass = ok / qs.length >= 0.75
    const nextBlock = !isFinal && s.blocks[s.blocks.indexOf(bl) + 1]
    return (
      <div className="cv3-t">
        <Back to={`/mis-clases/${s.key}`}>{s.name}</Back>
        <div className="k">{title} · tu resultado</div>
        <div className="cv3-score">{ok}<small>/{qs.length}</small></div>
        <p className="mute" style={{ marginTop: 10 }}>{pass ? (isFinal ? `${s.name} lista.` : `Bloque listo.${nextBlock ? ` Sigue con el bloque ${nextBlock.n}.` : ' Ya puedes hacer el ensayo final.'}`) : 'Vuelve a ver las clases en rojo antes de seguir: ahí están tus errores.'}</p>
        <div className="cv3-res-grid">
          {rows.map(r => (
            <Link key={r.c.id} className={'cv3-res ' + (r.pct < 0.6 ? 'low' : '')} to={`/mis-clases/${s.key}/${r.c.id}`}>
              <b>{r.c.num} · {r.c.title}</b><small>{r.ok} de {r.n} correctas{r.pct < 0.6 ? ' · volver a ver' : ''}</small>
              <div className="meter"><i style={{ width: `${100 * r.pct}%` }} /></div>
            </Link>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 22, flexWrap: 'wrap' }}>
          <button className="btn ghost" onClick={() => { setAns({}); setI(0); setFin(false) }}>Repetir</button>
          {nextBlock
            ? <Link className="btn" to={`/mis-clases/${s.key}/${nextBlock.ids[0]}`}>Seguir con el bloque {nextBlock.n}</Link>
            : !isFinal ? <Link className="btn" to={`/mis-clases/${s.key}/test/final`}>Hacer el ensayo final</Link>
              : <Link className="btn" to="/mis-clases">Elegir otra especialidad</Link>}
        </div>
      </div>
    )
  }

  const q = qs[i], a = ans[i]
  const answered = Object.keys(ans).length
  return (
    <div className="cv3-t">
      <Back to={`/mis-clases/${s.key}`}>{s.name}</Back>
      <div className="k">{title}</div>
      <h2>{isFinal ? `${qs.length} preguntas de todo el tomo` : bl?.name}</h2>
      <div className="cv3-t-top"><span>Pregunta {i + 1} de {qs.length}</span><span>{answered} respondidas</span></div>
      <div className="cv3-t-bar"><i style={{ width: `${100 * (i + 1) / qs.length}%` }} /></div>
      <div className="cv3-tq">
        <div className="k">{q.src}{q.clase && byId[q.clase] ? ` · Clase ${byId[q.clase].num}` : ''}</div>
        {q.image && <img src={q.image} alt="" />}
        <p>{q.stem}{q.question ? <><br /><b>{q.question}</b></> : null}</p>
        <Options q={q} picked={a} onPick={l => setAns(p => ({ ...p, [i]: l }))} />
        {a && <div className="exp"><b>{a === q.correct ? 'Correcto. ' : `La correcta es la ${q.correct}. `}</b>{q.explanation}</div>}
      </div>
      <div className="cv3-t-nav">
        <button className="btn ghost" disabled={!i} onClick={() => { setI(i - 1); window.scrollTo(0, 0) }}>Anterior</button>
        {i < qs.length - 1
          ? <button className="btn" onClick={() => { setI(i + 1); window.scrollTo(0, 0) }}>Siguiente</button>
          : <button className="btn" onClick={finish}>Ver mi resultado</button>}
      </div>
    </div>
  )
}

/* ════════ PÁGINA ════════ */
export default function ClasesV3() {
  const { spec, id, n } = useParams()
  const loc = useLocation()
  const { user } = useAuth()
  const { isPremium } = useSubscription()
  const data = useIndex()
  const prog = useProgress(user)
  const [modal, setModal] = useState(null)
  useEffect(() => { window.scrollTo(0, 0) }, [spec, id, n])

  // enlaces antiguos (libros, plan de estudio, dashboard) → clases del Dr. Guevara
  const st = loc.state || {}
  const sp = new URLSearchParams(loc.search)
  if (!spec && (sp.get('subsystem') || sp.get('lesson') || st.openSubsystem || st.openClaseId || st.subsystem || st.specialty))
    return <Navigate to={'/clases-guevara' + loc.search} state={st} replace />


  if (data.idx === false) return <div className="cv3"><p className="mute">No se pudieron cargar las clases. Revisa tu conexión y recarga la página.</p></div>
  if (!data.idx) return <div className="cv3"><div className="cv3-loading">Cargando clases…</div></div>
  const s = spec && data.specs[spec]
  if (spec && !s) return <Navigate to="/mis-clases" replace />

  let gate = null
  if (s && id) {
    const doneN = Object.keys(prog.p.done).length
    const open = isPremium || prog.p.done[id] || (user && doneN < FREE)
    if (!open) gate = (
      <>
        <Back to={`/mis-clases/${s.key}`}>{s.name}</Back>
        <div className="cv3-lock">
          <div className="k">{user ? 'Ya viste tus clases gratis' : 'Inicia sesión para ver la clase'}</div>
          <h2>{data.byId[id]?.title}</h2>
          <p>{user ? `Con cualquier plan tienes las ${Object.values(data.specs).reduce((a, x) => a + x.classes.length, 0)} clases, los tests de cada bloque y los ensayos de 90 preguntas.` : `Crea tu cuenta gratis y mira ${FREE} clases completas.`}</p>
          <button className="btn" onClick={() => setModal(user ? 'pay' : 'login')}>{user ? 'Ver planes' : 'Iniciar sesión'}</button>
        </div>
      </>
    )
  }

  return (
    <div className="cv3" style={specStyle(s)}>
      {!s && <Home data={data} prog={prog.p} />}
      {s && !id && !n && <Tomo s={s} prog={prog.p} />}
      {s && id && <Clase key={id} s={s} id={id} prog={prog} gate={gate} />}
      {s && n && <Test key={n} s={s} n={n} prog={prog} />}
      {modal === 'login' && <LoginGateModal onClose={() => setModal(null)} message="Inicia sesión para ver las clases en video y hacer los tests de cada bloque." />}
      {modal === 'pay' && <PaymentModal onClose={() => setModal(null)} />}
    </div>
  )
}
