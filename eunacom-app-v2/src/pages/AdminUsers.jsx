import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { fetchAdminUsers } from '../lib/api'
import { Users, Search, Mail, Phone, Globe, Calendar, Clock, BarChart3, ChevronDown, ChevronUp } from 'lucide-react'

const AdminUsers = () => {
  const { user, isAdmin } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState('created_at')
  const [sortDir, setSortDir] = useState('desc')
  const [expanded, setExpanded] = useState(null)

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
    if (sortKey === 'total_answers' || sortKey === 'correct_answers' || sortKey === 'total_tests') {
      return sortDir === 'asc' ? (Number(av) - Number(bv)) : (Number(bv) - Number(av))
    }
    return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av))
  })

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return null
    return sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
  }

  const fmtDate = (d) => {
    if (!d) return '—'
    try {
      return new Date(d).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })
    } catch { return d }
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <SummaryCard label="Total Usuarios" value={users.length} color="var(--primary-400)" />
        <SummaryCard label="Con Onboarding" value={users.filter(u => u.onboarding_done).length} color="var(--accent-green)" />
        <SummaryCard label="Con WhatsApp" value={users.filter(u => u.whatsapp).length} color="var(--accent-teal)" />
        <SummaryCard label="Total Preguntas" value={users.reduce((s, u) => s + Number(u.total_answers || 0), 0)} color="var(--accent-amber)" />
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
          <table style={tableStyles.table}>
            <thead>
              <tr>
                <Th label="Nombre" col="first_name" onClick={handleSort}><SortIcon col="first_name" /></Th>
                <Th label="Email" col="email" onClick={handleSort}><SortIcon col="email" /></Th>
                <Th label="País" col="country" onClick={handleSort}><SortIcon col="country" /></Th>
                <Th label="Examen" col="exam_month" onClick={handleSort}><SortIcon col="exam_month" /></Th>
                <Th label="Preguntas" col="total_answers" onClick={handleSort}><SortIcon col="total_answers" /></Th>
                <Th label="Tests" col="total_tests" onClick={handleSort}><SortIcon col="total_tests" /></Th>
                <Th label="Registro" col="created_at" onClick={handleSort}><SortIcon col="created_at" /></Th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((u) => (
                <React.Fragment key={u.id}>
                  <tr
                    onClick={() => setExpanded(expanded === u.id ? null : u.id)}
                    style={{ cursor: 'pointer', background: expanded === u.id ? 'rgba(19,91,236,0.05)' : 'transparent' }}
                  >
                    <td style={tableStyles.td}>
                      <div style={{ fontWeight: 600 }}>
                        {u.first_name ? `${u.first_name} ${u.last_name || ''}` : '—'}
                      </div>
                    </td>
                    <td style={tableStyles.td}><span style={{ fontSize: '0.85rem' }}>{u.email}</span></td>
                    <td style={tableStyles.td}>{u.country || '—'}</td>
                    <td style={tableStyles.td}>
                      {u.exam_month ? `${u.exam_month} ${u.exam_year || ''}` : '—'}
                    </td>
                    <td style={tableStyles.td}>
                      <span style={{ fontWeight: 700 }}>{u.total_answers || 0}</span>
                      <span style={{ color: 'var(--surface-400)', fontSize: '0.8rem' }}>
                        {' '}({u.correct_answers || 0} ✓)
                      </span>
                    </td>
                    <td style={tableStyles.td}>{u.total_tests || 0}</td>
                    <td style={tableStyles.td}>{fmtDate(u.created_at)}</td>
                  </tr>
                  {expanded === u.id && (
                    <tr>
                      <td colSpan={7} style={{ padding: '1rem 1.5rem', background: 'var(--surface-800)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
                          <DetailItem icon={<Globe size={14} />} label="Nacionalidad" value={u.nationality} />
                          <DetailItem icon={<Clock size={14} />} label="Preparación" value={u.prep_months ? `${u.prep_months} meses` : null} />
                          <DetailItem icon={<Phone size={14} />} label="WhatsApp" value={u.whatsapp ? `${u.country_code || ''} ${u.whatsapp}` : null} />
                          <DetailItem icon={<Calendar size={14} />} label="Último update" value={fmtDate(u.updated_at)} />
                          <DetailItem icon={<BarChart3 size={14} />} label="% Correcto" value={
                            u.total_answers > 0
                              ? `${Math.round((u.correct_answers / u.total_answers) * 100)}%`
                              : null
                          } />
                          <DetailItem icon={<Mail size={14} />} label="Onboarding" value={u.onboarding_done ? '✅ Completo' : '⏳ Pendiente'} />
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
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
    </div>
  )
}

const SummaryCard = ({ label, value, color }) => (
  <div style={{
    background: 'var(--surface-700)', borderRadius: 'var(--radius)', padding: '1rem',
    border: '1px solid rgba(255,255,255,0.06)',
  }}>
    <div style={{ fontSize: '0.75rem', color: 'var(--surface-400)', fontWeight: 600, marginBottom: '0.25rem' }}>{label}</div>
    <div style={{ fontSize: '1.5rem', fontWeight: 800, color }}>{value.toLocaleString()}</div>
  </div>
)

const DetailItem = ({ icon, label, value }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
    <span style={{ color: 'var(--surface-400)' }}>{icon}</span>
    <span style={{ color: 'var(--surface-400)' }}>{label}:</span>
    <span style={{ fontWeight: 600, color: 'var(--surface-200)' }}>{value || '—'}</span>
  </div>
)

const Th = ({ label, col, onClick, children }) => (
  <th
    onClick={() => onClick(col)}
    style={{
      ...tableStyles.th,
      cursor: 'pointer',
      userSelect: 'none',
    }}
  >
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      {label} {children}
    </span>
  </th>
)

const tableStyles = {
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.9rem',
  },
  th: {
    padding: '0.75rem 1rem',
    textAlign: 'left',
    fontWeight: 700,
    fontSize: '0.8rem',
    color: 'var(--surface-300)',
    borderBottom: '2px solid rgba(255,255,255,0.08)',
    whiteSpace: 'nowrap',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  td: {
    padding: '0.65rem 1rem',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    color: 'var(--surface-200)',
  },
}

export default AdminUsers
