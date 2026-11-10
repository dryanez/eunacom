import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, ChevronDown, Search, Loader2, PlayCircle, Hash, FolderTree, AlertCircle, Sparkles, BookOpen, Stethoscope, Scissors, Baby, Users } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useSubscription } from '../../contexts/SubscriptionContext'
import { createTest, genId } from '../../lib/api'
import { fetchBancoTree, fetchBancoQuestions, buildTree, allTemas, total, isCodePrefix, norm, toRunnerQuestion } from '../../lib/banco'
import LoginGateModal from '../LoginGateModal'
import PaymentModal from '../PaymentModal'

const FREE_LIMIT = 20

// Áreas del Perfil (1.. 7) agrupadas en los 4 módulos del EUNACOM, igual que en Mis clases
const MODULOS = [
  { key: 'm1', name: 'Módulo 1', sub: 'Medicina Interna', areas: ['1'], Icon: Stethoscope, tone: '#38bdf8' },
  { key: 'm2', name: 'Módulo 2', sub: 'Cirugía, Psiquiatría y especialidades', areas: ['4', '5', '6'], Icon: Scissors, tone: '#fbbf24' },
  { key: 'm3', name: 'Módulo 3', sub: 'Pediatría, Obstetricia y Ginecología', areas: ['2', '3'], Icon: Baby, tone: '#f472b6' },
  { key: 'm4', name: 'Módulo 4', sub: 'Salud Pública', areas: ['7'], Icon: Users, tone: '#34d399' },
]
const MAX_PER_TEST = 300

const mono = { fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '0.78rem', color: 'var(--primary-400)', fontWeight: 700 }
const rowStyle = { width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12, padding: '0.8rem 1rem', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(30,41,59,0.45)', color: 'var(--surface-100)', cursor: 'pointer', fontSize: '0.92rem' }

// Total de preguntas del nodo según la fuente elegida (sin desglose: en móvil no cabe)
function Counts({ n, fuente }) {
  const t = total(n, fuente)
  return (
    <span style={{ marginLeft: 'auto', flexShrink: 0, fontSize: '0.8rem', fontWeight: 800, color: t ? 'var(--surface-100)' : 'var(--surface-500)', minWidth: 28, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
      {t.toLocaleString('es-CL')}
    </span>
  )
}

/**
 * Banco por Perfil EUNACOM 2026.
 *   modo="arbol"  → Área › Especialidad › Tipo de situación › Tema (código)
 *   modo="codigo" → buscar un código o prefijo (p. ej. 1.01.2) o un nombre de tema
 * Al elegir un tema/código se practica el conjunto completo (modo examen: claves y explicaciones al enviar).
 */
export default function BancoPerfil({ modo = 'arbol' }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isPremium, usageStats } = useSubscription()
  const [tree, setTree] = useState(null)
  const [loadError, setLoadError] = useState('')
  const fuente = 'all' // sin filtro de fuente: el banco se muestra completo, sin distinguir preguntas
  const [path, setPath] = useState([]) // [areaKey, specKey, tipoKey]
  const [query, setQuery] = useState('')
  const [target, setTarget] = useState(null) // { kind: 'code'|'prefix'|'sinCodigo', value, name, n }
  const [runnerMode, setRunnerMode] = useState('exam')
  const [starting, setStarting] = useState(false)
  const [startError, setStartError] = useState('')
  const [showLoginGate, setShowLoginGate] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [openMods, setOpenMods] = useState({ m1: true })

  useEffect(() => {
    let alive = true
    fetchBancoTree().then(c => alive && setTree(buildTree(c))).catch(e => alive && setLoadError(e.message || String(e)))
    return () => { alive = false }
  }, [])

  // Al elegir un tema, llevar el panel de inicio a la vista (la lista puede estar muy abajo)
  const panelRef = React.useRef(null)
  useEffect(() => { if (target) panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }, [target])

  const remainingFree = isPremium ? Infinity : Math.max(0, FREE_LIMIT - (usageStats?.customQuestionsAnswered || 0))

  const area = tree?.areas.find(a => a.key === path[0])
  const spec = area?.specs.find(s => s.key === path[1])
  const tipo = spec?.tipos.find(t => t.key === path[2])

  const temas = useMemo(() => tree ? allTemas(tree) : [], [tree])
  const search = useMemo(() => {
    const v = query.trim()
    if (!tree || !v) return null
    if (isCodePrefix(v)) {
      const hits = temas.filter(t => t.code && t.code.startsWith(v))
      const n = hits.reduce((acc, t) => { for (const [k, x] of Object.entries(t.n)) acc[k] = (acc[k] || 0) + x; return acc }, {})
      return { prefix: v, hits, n }
    }
    const nv = norm(v)
    return { hits: temas.filter(t => norm(t.name).includes(nv) || norm(t.spec.name).includes(nv)).slice(0, 80) }
  }, [query, temas, tree])

  const startTest = async () => {
    if (!target) return
    setStartError('')
    if (!user) { setShowLoginGate(true); return }
    if (!isPremium && remainingFree <= 0) { setShowPaymentModal(true); return }
    setStarting(true)
    try {
      const params = { fuente, limit: MAX_PER_TEST }
      if (target.kind === 'code') params.code = target.value
      else if (target.kind === 'prefix') params.prefix = target.value
      else params.sinCodigo = target.value
      const r = await fetchBancoQuestions(params)
      let qs = (r.data || []).map(toRunnerQuestion)
      if (!qs.length) { setStartError('No hay preguntas para esa selección.'); setStarting(false); return }
      if (!isPremium && qs.length > remainingFree) qs = qs.slice(0, remainingFree)
      const testId = genId()
      await createTest({ id: testId, userId: user.id, mode: runnerMode, timeLimitSeconds: null, totalQuestions: qs.length, questions: qs.map(q => q.id) })
      navigate('/test-runner', { state: { testId, questions: qs, mode: runnerMode, bancoLabel: target.name } })
    } catch (e) {
      console.error(e)
      setStartError('Error al preparar la práctica: ' + (e.message || String(e)))
      setStarting(false)
    }
  }

  const pick = (t) => setTarget(t.code
    ? { kind: 'code', value: t.code, name: `${t.code} ${t.name}`, n: t.n }
    : { kind: 'sinCodigo', value: t.sinCodigo, name: t.name, n: t.n })

  // ── Aviso solo en desarrollo, cuando la base aún no tiene la columna fuente ──
  const header = tree && !tree.fuenteDisponible ? (
    <div className="card" style={{ marginBottom: '1rem', padding: '0.75rem 1.25rem', fontSize: '0.78rem', color: '#fbbf24' }}>
      Las preguntas nuevas 2026 aún no están importadas en esta base; se muestra solo el banco propio.
    </div>
  ) : null

  const startPanel = target && (
    <div ref={panelRef} className="card" style={{ marginBottom: '1rem', padding: '1rem 1.25rem', border: '1px solid rgba(56,189,248,0.35)', scrollMarginTop: 80 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <PlayCircle size={20} color="#38bdf8" />
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontWeight: 800, color: 'var(--surface-100)' }}>{target.name}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--surface-400)' }}>
            {total(target.n, fuente).toLocaleString('es-CL')} preguntas
            {total(target.n, fuente) > MAX_PER_TEST ? ` · se practican ${MAX_PER_TEST} al azar` : ''}
            {!isPremium && remainingFree < total(target.n, fuente) ? ` · Plan Gratuito: te quedan ${remainingFree}` : ''}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[{ id: 'exam', label: 'Examen', hint: 'Respondes todo y ves claves y explicaciones al enviar' }, { id: 'tutor', label: 'Tutor', hint: 'Feedback inmediato en cada pregunta' }].map(m => (
            <button key={m.id} type="button" title={m.hint} onClick={() => setRunnerMode(m.id)} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid', borderColor: runnerMode === m.id ? 'var(--primary-500)' : 'var(--surface-600)', background: runnerMode === m.id ? 'rgba(56,189,248,0.15)' : 'transparent', color: runnerMode === m.id ? '#38bdf8' : 'var(--surface-300)', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>{m.label}</button>
          ))}
        </div>
        <button type="button" className="btn-primary" disabled={starting || !total(target.n, fuente)} onClick={startTest} style={{ padding: '0.7rem 1.2rem', borderRadius: 10, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, opacity: total(target.n, fuente) ? 1 : 0.5 }}>
          {starting ? <Loader2 size={18} className="spin" /> : <PlayCircle size={18} />} Practicar {Math.min(total(target.n, fuente), MAX_PER_TEST)}
        </button>
        <button type="button" onClick={() => setTarget(null)} style={{ background: 'none', border: 'none', color: 'var(--surface-400)', cursor: 'pointer', fontSize: '0.8rem' }}>Cancelar</button>
      </div>
      {startError && <div style={{ marginTop: 8, color: '#f87171', fontSize: '0.82rem', display: 'flex', gap: 6, alignItems: 'center' }}><AlertCircle size={14} /> {startError}</div>}
    </div>
  )

  if (loadError) return <div className="card" style={{ color: '#f87171' }}>No se pudo cargar el banco por código: {loadError}</div>
  if (!tree) return <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--surface-300)' }}><Loader2 size={18} className="spin" /> Cargando árbol del Perfil EUNACOM 2026…</div>

  // ── Modo «Por código» ──
  if (modo === 'codigo') {
    return (
      <>
        {header}
        {startPanel}
        <div className="card" style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(15,23,42,0.6)', border: '1px solid var(--surface-600)', borderRadius: 12, padding: '0.6rem 0.9rem' }}>
            <Search size={18} color="var(--surface-400)" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Código o prefijo del Perfil (1.01.1.018, 1.01.2, 4.03…) o nombre del tema" autoFocus
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--surface-100)', fontSize: '0.95rem' }} />
          </label>
          <div style={{ marginTop: 8, fontSize: '0.75rem', color: 'var(--surface-400)' }}>
            Estructura del código: <span style={mono}>área.especialidad.tipo.tema</span> · tipos: 1 situaciones clínicas, 2 urgencias, 3 conocimientos generales, 4 exámenes, 5 procedimientos.
          </div>
        </div>
        {search?.prefix && search.hits.length > 1 && (
          <button type="button" onClick={() => setTarget({ kind: 'prefix', value: search.prefix, name: `Todo el prefijo ${search.prefix} (${search.hits.length} temas)`, n: search.n })} style={{ ...rowStyle, marginBottom: 8, border: '1px solid rgba(56,189,248,0.35)' }}>
            <Hash size={16} color="#38bdf8" /> <span style={{ flex: 1, minWidth: 0 }}><strong>Practicar todo <span style={mono}>{search.prefix}</span></strong> <span style={{ color: 'var(--surface-400)', fontSize: '0.8rem' }}>· {search.hits.length} temas</span></span>
            <Counts n={search.n} fuente={fuente} />
          </button>
        )}
        {search && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {search.hits.length === 0 && <div style={{ color: 'var(--surface-400)', padding: '1rem' }}>Ningún tema del Perfil coincide con «{query}».</div>}
            {search.hits.map(t => (
              <button key={t.code || t.sinCodigo} type="button" onClick={() => pick(t)} style={rowStyle}>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <div style={mono}>{t.code || '—'}</div>
                  <div>{t.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--surface-400)' }}>{t.area.name} › {t.spec.name} › {t.tipo.name}</div>
                </span>
                <Counts n={t.n} fuente={fuente} />
              </button>
            ))}
          </div>
        )}
        {!search && (
          <div style={{ color: 'var(--surface-400)', fontSize: '0.85rem', padding: '0.5rem 0.25rem' }}>
            Escribe un código del Perfil de Conocimientos EUNACOM 2026 o parte de él. Ejemplos: <span style={mono}>1.01.1.018</span> (Insuficiencia cardíaca), <span style={mono}>1.01.2</span> (urgencias de Cardiología), <span style={mono}>7.01</span> (Salud Pública).
          </div>
        )}
      </>
    )
  }

  // ── Modo «Por área y tema» ──
  const crumbs = [{ label: 'Módulos', to: [] }]
  if (area) crumbs.push({ label: area.name, to: [area.key] })
  if (spec) crumbs.push({ label: spec.name, to: [area.key, spec.key] })
  if (tipo) crumbs.push({ label: tipo.name, to: [area.key, spec.key, tipo.key] })

  return (
    <>
      {header}
      {startPanel}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', marginBottom: '0.9rem', fontSize: '0.85rem' }}>
        <FolderTree size={16} color="var(--surface-400)" />
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <ChevronRight size={14} color="var(--surface-500)" />}
            <button type="button" onClick={() => setPath(c.to)} style={{ background: 'none', border: 'none', padding: '2px 4px', cursor: 'pointer', color: i === crumbs.length - 1 ? 'var(--surface-100)' : 'var(--primary-400)', fontWeight: i === crumbs.length - 1 ? 800 : 600 }}>{c.label}</button>
          </React.Fragment>
        ))}
      </nav>

      {!area && (() => {
        const known = new Set(MODULOS.flatMap(m => m.areas))
        const otros = tree.areas.filter(a => !known.has(a.key))
        const mods = otros.length ? [...MODULOS, { key: 'otros', name: 'Otros', sub: 'Sin módulo', areas: otros.map(a => a.key), Icon: FolderTree, tone: '#94a3b8' }] : MODULOS
        return (
          <div className="mn-bm-list">
            {mods.map(m => {
              const areas = m.areas.map(k => tree.areas.find(a => a.key === k)).filter(Boolean)
              const count = areas.reduce((sum, a) => sum + total(a.n, fuente), 0)
              const open = !!openMods[m.key]
              return (
                <div key={m.key} className={`mn-bm ${open ? 'open' : ''}`}>
                  <button type="button" className="mn-bm-h" aria-expanded={open} onClick={() => setOpenMods(o => ({ ...o, [m.key]: !o[m.key] }))}>
                    <span className="mn-bm-ic" style={{ color: m.tone, background: `${m.tone}1a`, borderColor: `${m.tone}40` }}><m.Icon size={19} /></span>
                    <span className="mn-bm-t"><b>{m.name}</b><small>{m.sub}</small></span>
                    <span className="mn-bm-n">{count.toLocaleString('es-CL')}</span>
                    <ChevronDown size={18} className="mn-bm-chev" />
                  </button>
                  {open && (
                    <div className="mn-bm-body">
                      {areas.length === 0 && <div className="mn-bm-empty">Sin preguntas en este módulo todavía.</div>}
                      {areas.map(a => (
                        <button key={a.key} type="button" onClick={() => setPath([a.key])} className="mn-bm-row">
                          <span className="mn-bm-k">{a.key}</span>
                          <span className="mn-bm-t"><b>{a.name}</b><small>{a.specs.length} especialidad{a.specs.length === 1 ? '' : 'es'}</small></span>
                          <Counts n={a.n} fuente={fuente} />
                          <ChevronRight size={16} color="var(--surface-500)" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )
      })()}

      {area && !spec && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {area.specs.map(s => (
            <button key={s.key} type="button" onClick={() => setPath([area.key, s.key])} style={rowStyle}>
              <span style={mono}>{s.pseudo ? '' : s.key}</span>
              <span style={{ flex: 1, minWidth: 0, fontWeight: 700, color: s.pseudo ? 'var(--surface-300)' : undefined }}>{s.name}</span>
              <Counts n={s.n} fuente={fuente} />
              <ChevronRight size={16} color="var(--surface-500)" />
            </button>
          ))}
        </div>
      )}

      {spec && !tipo && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {spec.tipos.map(t => (
            <button key={t.key} type="button" onClick={() => setPath([area.key, spec.key, t.key])} style={rowStyle}>
              <span style={mono}>{t.pseudo ? '' : `${spec.key}.${t.key}`}</span>
              <span style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 700 }}>{t.name}</div><div style={{ fontSize: '0.72rem', color: 'var(--surface-400)' }}>{t.temas.length} tema{t.temas.length === 1 ? '' : 's'}</div></span>
              <Counts n={t.n} fuente={fuente} />
              <ChevronRight size={16} color="var(--surface-500)" />
            </button>
          ))}
          {!spec.pseudo && (
            <button type="button" onClick={() => setTarget({ kind: 'prefix', value: spec.key, name: `Toda ${spec.name} (${spec.key})`, n: spec.n })} style={{ ...rowStyle, border: '1px dashed var(--surface-600)', color: 'var(--surface-300)' }}>
              <Sparkles size={16} color="#38bdf8" /> <span style={{ flex: 1, minWidth: 0 }}>Practicar toda la especialidad al azar</span><Counts n={spec.n} fuente={fuente} />
            </button>
          )}
        </div>
      )}

      {tipo && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {tipo.temas.map(t => {
            const n = total(t.n, fuente)
            const active = target && ((t.code && target.value === t.code) || (t.sinCodigo && target.value === t.sinCodigo))
            return (
              <button key={t.code || t.sinCodigo} type="button" onClick={() => pick(t)} disabled={!n} style={{ ...rowStyle, opacity: n ? 1 : 0.5, cursor: n ? 'pointer' : 'default', borderColor: active ? 'var(--primary-500)' : undefined, background: active ? 'rgba(56,189,248,0.12)' : rowStyle.background }}>
                {!t.code && <BookOpen size={16} color="var(--surface-400)" />}
                <span style={{ flex: 1, minWidth: 0 }}>
                  {t.code && <div style={mono}>{t.code}</div>}
                  <div>{t.name}{t.extra && <span title="Código presente en el banco nuevo pero no en el codemap oficial" style={{ marginLeft: 6, fontSize: '0.68rem', color: '#fbbf24' }}>no en Perfil</span>}</div>
                </span>
                <Counts n={t.n} fuente={fuente} />
              </button>
            )
          })}
          {!tipo.pseudo && tipo.temas.length > 1 && (
            <button type="button" onClick={() => setTarget({ kind: 'prefix', value: `${spec.key}.${tipo.key}`, name: `${tipo.name} de ${spec.name} (${spec.key}.${tipo.key})`, n: tipo.n })} style={{ ...rowStyle, border: '1px dashed var(--surface-600)', color: 'var(--surface-300)' }}>
              <Sparkles size={16} color="#38bdf8" /> <span style={{ flex: 1, minWidth: 0 }}>Practicar todo este tipo al azar</span><Counts n={tipo.n} fuente={fuente} />
            </button>
          )}
        </div>
      )}

      {showPaymentModal && <PaymentModal onClose={() => setShowPaymentModal(false)} />}
      {showLoginGate && <LoginGateModal onClose={() => setShowLoginGate(false)} message="Inicia sesión para practicar por área y código del Perfil." />}
    </>
  )
}
