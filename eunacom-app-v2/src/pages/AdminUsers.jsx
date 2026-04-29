import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { fetchAdminUsers, fetchAdminUserDetail } from '../lib/api'
import {
  Users, Search, Globe, Calendar, Clock, BarChart3,
  ChevronDown, ChevronUp, X, BookOpen, ClipboardList,
  CheckCircle, AlertCircle, Phone, Mail,
} from 'lucide-react'

const NUM_KEYS = ['total_answers', 'correct_answers', 'total_tests', 'total_pruebas', 'total_classes']

const fmtDate = (d) => {
  if (!d) return '—'
  try { return new Date(d).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' }) }
  catch { return d }
}

const fmtDateTime = (d) => {
  if (!d) return '—'
  try { return new Date(d).toLocaleString('es-CL', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) }
  catch { return d }
}

const modeLabel = (mode) => {
  const MAP = {
    simulation: 'Simulacro', simulacro: 'Simulacro',
    prueba: 'Prueba', tutor: 'Tutor IA',
    custom: 'Personalizado', timed: 'Cronometrado',
    untimed: 'Sin tiempo', review: 'Repaso',
  }
  return MAP[mode] || mode || '—'
}

// ── Sub-components ──────────────────────────────────────────────────────────

const SummaryCard = ({ label, value, color }) => (
  <div style={{
    background: 'var(--surface-700)', borderRadius: 'var(--radius)', padding: '1rem',
    border: '1px solid rgba(255,255,255,0.06)',
  }}>
    <div style={{ fontSize: '0.75rem', color: 'var(--surface-400)', fontWeight: 600, marginBottom: '0.25rem' }}>{label}</div>
    <div style={{ fontSize: '1.5rem', fontWeight: 800, color }}>{Number(value).toLocaleString()}</div>
  </div>
)

const Th = ({ label, col, onClick, children }) => (
  <th onClick={() => onClick(col)} style={{
    padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 700,
    fontSize: '0.8rem', color: 'var(--surface-300)',
    borderBottom: '2px solid rgba(255,255,255,0.08)',
    whiteSpace: 'nowrap', textTransform: 'uppercase',
    letterSpacing: '0.05em', cursor: 'pointer', userSelect: 'none',
  }}>
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>{label} {children}</span>
  </th>
)

const TD = ({ children, style }) => (
  <td style={{ padding: '0.65rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.04)', color: 'var(--surface-200)', ...style }}>
    {children}
  </td>
)

const Tag = ({ icon, label, color = 'var(--surface-300)' }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color, fontWeight: 500 }}>
    {icon} {label}
  </span>
)

const StatCard = ({ label, value, sub, color }) => (
  <div style={{
    background: 'var(--surface-700)', borderRadius: 'var(--radius)',
    padding: '0.75rem', border: '1px solid rgba(255,255,255,0.06)',
  }}>
    <div style={{ fontSize: '0.72rem', color: 'var(--surface-400)', fontWeight: 600, marginBottom: 2 }}>{label}</div>
    <div style={{ fontSize: '1.3rem', fontWeight: 800, color }}>{value}</div>
    {sub && <div style={{ fontSize: '0.72rem', color: 'var(--surface-400)', marginTop: 2 }}>{sub}</div>}
  </div>
)

const TestRow = ({ test }) => {
  const isCompleted = test.status === 'completed'
  const score = Number(test.score || 0)
  const scoreColor = score >= 60 ? 'var(--accent-green)' : score >= 45 ? 'var(--accent-amber)' : 'var(--accent-red)'
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.75rem',
      padding: '0.5rem 0.75rem',
      background: 'var(--surface-800)', borderRadius: 6,
      border: '1px solid rgba(255,255,255,0.04)', fontSize: '0.82rem',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontWeight: 600 }}>{modeLabel(test.mode)}</span>
        <span style={{ color: 'var(--surface-400)', marginLeft: '0.5rem' }}>{test.total_questions || '?'} pregs</span>
      </div>
      {isCompleted
        ? <span style={{ fontWeight: 700, color: scoreColor, minWidth: 36, textAlign: 'right' }}>{score}%</span>
        : <span style={{ fontSize: '0.75rem', color: 'var(--surface-400)', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: 4 }}>En curso</span>
      }
      <span style={{ color: 'var(--surface-400)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
        {fmtDateTime(test.completed_at || test.created_at)}
      </span>
    </div>
  )
}

const ClaseRow = ({ clase }) => {
  const name = clase.topic || clase.clase_id?.slice(0, 20) || '—'
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.5rem',
      padding: '0.4rem 0.75rem',
      background: 'var(--surface-800)', borderRadius: 6,
      border: '1px solid rgba(255,255,255,0.04)', fontSize: '0.82rem',
    }}>
      <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--surface-200)' }}>
        {name}
      </span>
      <span title="Video" style={{ fontSize: '0.72rem', color: clase.video_watched ? 'var(--accent-teal)' : 'var(--surface-600)' }}>
        {clase.video_watched ? '🎬✓' : '🎬'}
      </span>
      {clase.quiz_completed
        ? <span style={{ fontSize: '0.72rem', color: 'var(--accent-green)', fontWeight: 600, whiteSpace: 'nowrap' }}>
            Quiz {clase.quiz_score || 0}%
          </span>
        : <span style={{ fontSize: '0.72rem', color: 'var(--surface-600)' }}>Quiz —</span>
      }
    </div>
  )
}

// ── UserPanel ────────────────────────────────────────────────────────────────

const UserPanel = ({ user, detail, onClose }) => {
  const pct = user.total_answers > 0
    ? Math.round((Number(user.correct_answers) / Number(user.total_answers)) * 100) : 0

  const completedTests = detail.tests.filter(t => t.status === 'completed')
  const avgScore = completedTests.length > 0
    ? Math.round(completedTests.reduce((s, t) => s + Number(t.score || 0), 0) / completedTests.length) : 0

  const videosDone = detail.clases.filter(c => c.video_watched).length
  const quizzesDone = detail.clases.filter(c => c.quiz_completed).length

  const initials = [user.first_name, user.last_name]
    .filter(Boolean).map(s => s[0]).join('').toUpperCase() || (user.email || '?')[0].toUpperCase()

  const pctColor = pct >= 60 ? 'var(--accent-green)' : pct >= 45 ? 'var(--accent-amber)' : 'var(--accent-red)'

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 999 }} />
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: 'min(640px, 100vw)',
        background: 'var(--surface-900, #0f172a)',
        borderLeft: '1px solid rgba(255,255,255,0.08)',
        zIndex: 1000, overflowY: 'auto',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'flex-start', gap: '1rem', flexShrink: 0,
          position: 'sticky', top: 0, background: 'var(--surface-900, #0f172a)', zIndex: 1,
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary-400, #3b82f6), var(--primary-600, #1d4ed8))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.2rem', fontWeight: 800, color: '#fff', flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>
              {user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user.email}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--surface-400)', marginTop: 2 }}>{user.email}</div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
              {user.country && <Tag icon={<Globe size={12} />} label={user.country} />}
              {user.exam_month && <Tag icon={<Calendar size={12} />} label={`${user.exam_month} ${user.exam_year || ''}`} />}
              {user.prep_months && <Tag icon={<Clock size={12} />} label={`${user.prep_months} meses prep`} />}
              {user.onboarding_done
                ? <Tag icon={<CheckCircle size={12} />} label="Onboarding ✓" color="var(--accent-green)" />
                : <Tag icon={<AlertCircle size={12} />} label="Sin onboarding" color="var(--surface-400)" />
              }
            </div>
            {user.whatsapp && (
              <div style={{ marginTop: '0.4rem' }}>
                <Tag icon={<Phone size={12} />} label={`${user.country_code || ''} ${user.whatsapp}`} color="var(--surface-400)" />
              </div>
            )}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--surface-400)', padding: '0.25rem', flexShrink: 0 }}>
            <X size={22} />
          </button>
        </div>

        {/* Stats grid */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--surface-400)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.65rem' }}>
            Actividad total
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
            <StatCard label="Preguntas" value={(Number(user.total_answers) || 0).toLocaleString()} sub={`${Number(user.correct_answers) || 0} correctas`} color="var(--accent-amber)" />
            <StatCard label="% Correcto" value={`${pct}%`} sub={`score tests: ${avgScore}%`} color={pctColor} />
            <StatCard label="Tests total" value={Number(user.total_tests) || 0} sub={`${completedTests.length} completos`} color="var(--primary-400)" />
            <StatCard label="Pruebas ✓" value={Number(user.total_pruebas) || 0} color="#ec4899" />
            <StatCard label="Videos" value={detail.loading ? '…' : videosDone} color="var(--accent-teal)" />
            <StatCard label="Quizzes" value={detail.loading ? '…' : quizzesDone} color="#a855f7" />
          </div>
        </div>

        {/* Test history */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--surface-400)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ClipboardList size={13} />
            Historial de exámenes{detail.loading ? '' : ` (${detail.tests.length})`}
          </div>
          {detail.loading ? (
            <div style={{ color: 'var(--surface-400)', fontSize: '0.85rem' }}>Cargando...</div>
          ) : detail.tests.length === 0 ? (
            <div style={{ color: 'var(--surface-400)', fontSize: '0.85rem' }}>Sin exámenes registrados.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: 340, overflowY: 'auto' }}>
              {detail.tests.map(t => <TestRow key={t.id} test={t} />)}
            </div>
          )}
        </div>

        {/* Clase progress */}
        <div style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--surface-400)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <BookOpen size={13} />
            Clases{detail.loading ? '' : ` (${detail.clases.length})`}
          </div>
          {detail.loading ? (
            <div style={{ color: 'var(--surface-400)', fontSize: '0.85rem' }}>Cargando...</div>
          ) : detail.clases.length === 0 ? (
            <div style={{ color: 'var(--surface-400)', fontSize: '0.85rem' }}>Sin clases registradas.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', maxHeight: 320, overflowY: 'auto' }}>
              {detail.clases.map(c => <ClaseRow key={c.clase_id} clase={c} />)}
            </div>
          )}
        </div>

        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '0.75rem', color: 'var(--surface-500)' }}>
          Registro: {fmtDate(user.created_at)} · Último update: {fmtDate(user.updated_at)}
        </div>
      </div>
    </>
  )
}

// ── Main component ──────────────────────────────────────────────────────────

const AdminUsers = () => {
  const { user, isAdmin } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState('created_at')
  const [sortDir, setSortDir] = useState('desc')
  const [selectedUser, setSelectedUser] = useState(null)
  const [detailData, setDetailData] = useState({ tests: [], clases: [], loading: false })

  useEffect(() => {
    if (user && isAdmin()) loadUsers()
  }, [user])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const data = await fetchAdminUsers(user.email)
      setUsers(data)
    } catch (e) {
      console.error('Error loading users:', e)
    } finally {
      setLoading(false)
    }
  }

  const openUser = useCallback(async (u) => {
    setSelectedUser(u)
    setDetailData({ tests: [], clases: [], loading: true })
    try {
      const data = await fetchAdminUserDetail(u.id, user.email)
      setDetailData({ tests: data.tests || [], clases: data.clases || [], loading: false })
    } catch (e) {
      console.error('Error loading user detail:', e)
      setDetailData({ tests: [], clases: [], loading: false })
    }
  }, [user])

  if (!isAdmin()) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--accent-red)' }}>Acceso Denegado</h2>
        <p style={{ color: 'var(--surface-400)' }}>Solo administradores pueden ver esta página.</p>
      </div>
    )
  }

  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    return (
      (u.email || '').toLowerCase().includes(q) ||
      (u.first_name || '').toLowerCase().includes(q) ||
      (u.last_name || '').toLowerCase().includes(q) ||
      (u.country || '').toLowerCase().includes(q) ||
      (u.nationality || '').toLowerCase().includes(q)
    )
  })

  const sorted = [...filtered].sort((a, b) => {
    const av = a[sortKey] || ''
    const bv = b[sortKey] || ''
    if (NUM_KEYS.includes(sortKey)) {
      return sortDir === 'asc' ? (Number(av) - Number(bv)) : (Number(bv) - Number(av))
    }
    return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av))
  })

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return null
    return sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <Users size={28} color="var(--primary-400)" />
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Usuarios</h1>
          <p style={{ color: 'var(--surface-400)', fontSize: '0.85rem', margin: 0 }}>{users.length} usuarios registrados</p>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <SummaryCard label="Total Usuarios" value={users.length} color="var(--primary-400)" />
        <SummaryCard label="Con Onboarding" value={users.filter(u => u.onboarding_done).length} color="var(--accent-green)" />
        <SummaryCard label="Total Preguntas" value={users.reduce((s, u) => s + Number(u.total_answers || 0), 0)} color="var(--accent-amber)" />
        <SummaryCard label="Total Clases" value={users.reduce((s, u) => s + Number(u.total_classes || 0), 0)} color="var(--accent-teal)" />
        <SummaryCard label="Pruebas ✓" value={users.reduce((s, u) => s + Number(u.total_pruebas || 0), 0)} color="#ec4899" />
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--surface-400)' }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre, email, país..."
          style={{
            width: '100%', padding: '0.65rem 0.75rem 0.65rem 2.5rem',
            background: 'var(--surface-700)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 'var(--radius)', color: 'var(--surface-50)', fontSize: '0.9rem',
            fontFamily: 'var(--font)', outline: 'none',
          }}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--surface-400)' }}>Cargando usuarios...</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr>
                <Th label="Nombre" col="first_name" onClick={handleSort}><SortIcon col="first_name" /></Th>
                <Th label="Email" col="email" onClick={handleSort}><SortIcon col="email" /></Th>
                <Th label="País" col="country" onClick={handleSort}><SortIcon col="country" /></Th>
                <Th label="Examen" col="exam_month" onClick={handleSort}><SortIcon col="exam_month" /></Th>
                <Th label="Preguntas" col="total_answers" onClick={handleSort}><SortIcon col="total_answers" /></Th>
                <Th label="Clases" col="total_classes" onClick={handleSort}><SortIcon col="total_classes" /></Th>
                <Th label="Pruebas ✓" col="total_pruebas" onClick={handleSort}><SortIcon col="total_pruebas" /></Th>
                <Th label="Tests" col="total_tests" onClick={handleSort}><SortIcon col="total_tests" /></Th>
                <Th label="Registro" col="created_at" onClick={handleSort}><SortIcon col="created_at" /></Th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((u) => (
                <tr
                  key={u.id}
                  onClick={() => openUser(u)}
                  style={{
                    cursor: 'pointer',
                    background: selectedUser?.id === u.id ? 'rgba(19,91,236,0.08)' : 'transparent',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => { if (selectedUser?.id !== u.id) e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
                  onMouseLeave={e => { if (selectedUser?.id !== u.id) e.currentTarget.style.background = 'transparent' }}
                >
                  <TD>
                    <div style={{ fontWeight: 600 }}>
                      {u.first_name ? `${u.first_name} ${u.last_name || ''}`.trim() : '—'}
                    </div>
                  </TD>
                  <TD><span style={{ fontSize: '0.85rem' }}>{u.email}</span></TD>
                  <TD>{u.country || '—'}</TD>
                  <TD>{u.exam_month ? `${u.exam_month} ${u.exam_year || ''}` : '—'}</TD>
                  <TD>
                    <span style={{ fontWeight: 700 }}>{Number(u.total_answers) || 0}</span>
                    {Number(u.total_answers) > 0 && (
                      <span style={{ color: 'var(--surface-400)', fontSize: '0.8rem' }}>
                        {' '}({Math.round((Number(u.correct_answers) / Number(u.total_answers)) * 100)}%)
                      </span>
                    )}
                  </TD>
                  <TD><span style={{ fontWeight: 600, color: 'var(--accent-teal)' }}>{Number(u.total_classes) || 0}</span></TD>
                  <TD><span style={{ fontWeight: 600, color: '#ec4899' }}>{Number(u.total_pruebas) || 0}</span></TD>
                  <TD>{Number(u.total_tests) || 0}</TD>
                  <TD>{fmtDate(u.created_at)}</TD>
                </tr>
              ))}
            </tbody>
          </table>
          {sorted.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--surface-400)' }}>
              {search ? 'No se encontraron usuarios.' : 'No hay usuarios registrados.'}
            </div>
          )}
        </div>
      )}

      {selectedUser && (
        <UserPanel
          user={selectedUser}
          detail={detailData}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  )
}

export default AdminUsers
