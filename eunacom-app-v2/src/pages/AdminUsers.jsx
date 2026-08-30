import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  fetchAdminUsers, fetchAdminUserDetail, grantPremiumAccess,
  fetchAppSettings, updateAppSetting, fetchPaypalTransactions,
  downloadPaypalCsv, fetchAdminFinances, downloadFinancesCsv
} from '../lib/api'
import {
  Users, Search, Globe, Calendar, Clock, BarChart3,
  ChevronDown, ChevronUp, X, BookOpen, ClipboardList,
  CheckCircle, AlertCircle, Phone, Mail, Star, Key, Send, Settings,
  Download, CreditCard, HelpCircle, Building2, DollarSign,
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  Sparkles, RefreshCw, Filter, CheckCircle2, XCircle, Tag as TagIcon,
  Layers, ArrowRight
} from 'lucide-react'
import CampaignModal from '../components/CampaignModal'
import AdminEmailMarketing from '../components/AdminEmailMarketing'
import { UserInstitutionBadge } from '../utils/universityAndCountry'

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

const fmtCLP = (val) => {
  if (val === null || val === undefined) return '$0 CLP'
  return `$${Math.round(Number(val)).toLocaleString('es-CL')} CLP`
}

const fmtUSD = (val) => {
  if (val === null || val === undefined) return '$0.00 USD'
  return `$${Number(val).toFixed(2)} USD`
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

const UserPanel = ({ user, detail, onClose, onGrantPremium }) => {
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

  const [granting, setGranting] = useState(false)

  const handleGrant = async (months) => {
    if (!window.confirm(`¿Seguro que deseas dar ${months} mes(es) de acceso Premium a ${user.email}?`)) return
    setGranting(true)
    try {
      await onGrantPremium(user.id, months)
    } finally {
      setGranting(false)
    }
  }

  const isPremium = user.is_premium === 1 && (!user.premium_until || new Date(user.premium_until) > new Date())


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
            <div style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <UserInstitutionBadge user={user} size={20} />
              <span>{user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user.email}</span>
              {user.plan_months === 1200 && <span style={{ background: '#fbbf24', color: '#000', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px', fontWeight: 800, verticalAlign: 'middle' }}>Founder 🚀</span>}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--surface-400)', marginTop: 2 }}>{user.email}</div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
              {user.university && <Tag icon={<Building2 size={12} />} label={`${user.university} ${user.sede ? `(${user.sede})` : ''}`} color="var(--primary-300)" />}
              {user.country && <Tag icon={<Globe size={12} />} label={user.country} />}
              {user.exam_month && <Tag icon={<Calendar size={12} />} label={`${user.exam_month} ${user.exam_year || ''}`} />}
              {user.prep_months && <Tag icon={<Clock size={12} />} label={`${user.prep_months} meses prep`} />}
              {user.ayuda_inscripcion && <Tag icon={<HelpCircle size={12} />} label={`Ayuda Inscripción: ${user.ayuda_inscripcion}`} color={user.ayuda_inscripcion === 'Sí' ? '#a855f7' : 'var(--surface-400)'} />}
              {user.onboarding_done
                ? <Tag icon={<CheckCircle size={12} />} label="Onboarding ✓" color="var(--accent-green)" />
                : <Tag icon={<AlertCircle size={12} />} label="Sin onboarding" color="var(--surface-400)" />
              }
              {isPremium
                ? <Tag icon={<Star size={12} fill="var(--accent-amber)" />} label={`Premium (hasta ${fmtDate(user.premium_until)})`} color="var(--accent-amber)" />
                : <Tag icon={<Star size={12} />} label="Gratis / Vencido" color="var(--surface-500)" />
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

        {/* Administrar Acceso */}
        <div style={{ padding: '1.25rem 1.5rem', background: 'rgba(234, 179, 8, 0.05)' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--accent-amber)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Key size={13} />
            Administrar Acceso Premium
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--surface-300)', marginBottom: '1rem' }}>
            Activa o extiende manualmente la suscripción de este usuario.
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button disabled={granting} onClick={() => handleGrant(1)} style={{ padding: '0.5rem 1rem', background: 'var(--surface-700)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius)', color: '#fff', fontSize: '0.8rem', cursor: granting ? 'wait' : 'pointer', fontWeight: 600 }}>+1 Mes</button>
            <button disabled={granting} onClick={() => handleGrant(3)} style={{ padding: '0.5rem 1rem', background: 'var(--surface-700)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius)', color: '#fff', fontSize: '0.8rem', cursor: granting ? 'wait' : 'pointer', fontWeight: 600 }}>+3 Meses</button>
            <button disabled={granting} onClick={() => handleGrant(6)} style={{ padding: '0.5rem 1rem', background: 'var(--surface-700)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius)', color: '#fff', fontSize: '0.8rem', cursor: granting ? 'wait' : 'pointer', fontWeight: 600 }}>+6 Meses</button>
            <button disabled={granting} onClick={() => handleGrant(12)} style={{ padding: '0.5rem 1rem', background: 'var(--surface-700)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius)', color: '#fff', fontSize: '0.8rem', cursor: granting ? 'wait' : 'pointer', fontWeight: 600 }}>+1 Año</button>
            <button disabled={granting} onClick={() => handleGrant(1200)} style={{ padding: '0.5rem 1rem', background: 'var(--accent-blue)', border: 'none', borderRadius: 'var(--radius)', color: '#fff', fontSize: '0.8rem', cursor: granting ? 'wait' : 'pointer', fontWeight: 700 }}>⭐ De Por Vida</button>
          </div>
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
  const [filterPremium, setFilterPremium] = useState('premium')
  const [sortKey, setSortKey] = useState('created_at')
  const [sortDir, setSortDir] = useState('desc')
  const [selectedUser, setSelectedUser] = useState(null)
  const [detailData, setDetailData] = useState({ tests: [], clases: [], loading: false })
  const [showCampaignModal, setShowCampaignModal] = useState(false)
  const [freemiumMode, setFreemiumMode] = useState('strict')
  const [updatingMode, setUpdatingMode] = useState(false)
  const [activeTab, setActiveTab] = useState('users') // 'users' | 'finances' | 'paypal'
  const [paypalTxns, setPaypalTxns] = useState([])
  const [paypalLoading, setPaypalLoading] = useState(false)
  const [financesData, setFinancesData] = useState({ kpis: null, monthly: [], globalPlans: {}, transactions: [] })
  const [financesLoading, setFinancesLoading] = useState(false)
  const [financesSearch, setFinancesSearch] = useState('')
  const [financesGateway, setFinancesGateway] = useState('all')
  const [financesStatus, setFinancesStatus] = useState('all')
  const [financesMonth, setFinancesMonth] = useState('all')
  const [financesPlan, setFinancesPlan] = useState('all')

  useEffect(() => {
    if (user && isAdmin()) {
      loadUsers()
      loadSettings()
      loadPaypalTxns()
      loadFinances()
    }
  }, [user])

  const loadFinances = async () => {
    setFinancesLoading(true)
    try {
      const data = await fetchAdminFinances(user.email)
      setFinancesData(data)
    } catch (e) {
      console.error('Error loading finances:', e)
    } finally {
      setFinancesLoading(false)
    }
  }

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

  const loadSettings = async () => {
    try {
      const settings = await fetchAppSettings()
      if (settings.freemium_mode) {
        setFreemiumMode(settings.freemium_mode)
      }
    } catch (e) {
      console.error('Error loading app settings:', e)
    }
  }

  const loadPaypalTxns = async () => {
    setPaypalLoading(true)
    try {
      const data = await fetchPaypalTransactions(user.email)
      setPaypalTxns(data)
    } catch (e) {
      console.error('Error loading PayPal transactions:', e)
    } finally {
      setPaypalLoading(false)
    }
  }

  const handleModeChange = async (mode) => {
    setUpdatingMode(true)
    try {
      await updateAppSetting(user.email, 'freemium_mode', mode)
      setFreemiumMode(mode)
      alert(`Modo Freemium actualizado a: ${mode === 'strict' ? 'Estricto' : 'Por Uso'}`)
    } catch (e) {
      console.error('Error updating setting:', e)
      alert('Error al actualizar el modo freemium.')
    } finally {
      setUpdatingMode(false)
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

  const handleGrantPremium = async (targetUserId, months) => {
    try {
      const res = await grantPremiumAccess(user.email, targetUserId, months)
      if (res.success) {
        // Update local state to reflect new premium status
        setUsers(prev => prev.map(u => u.id === targetUserId ? { ...u, is_premium: 1, premium_until: res.premium_until, plan_months: res.plan_months } : u))
        if (selectedUser?.id === targetUserId) {
          setSelectedUser(prev => ({ ...prev, is_premium: 1, premium_until: res.premium_until, plan_months: res.plan_months }))
        }
        alert(`¡Acceso Premium otorgado exitosamente hasta ${fmtDate(res.premium_until)}!`)
      } else {
        alert('Error al otorgar acceso.')
      }
    } catch (e) {
      console.error(e)
      alert('Error de conexión al otorgar acceso.')
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
    // 1. Premium Filter
    const isPremium = u.is_premium === 1 && (!u.premium_until || new Date(u.premium_until) > new Date())
    let passPremium = true
    if (filterPremium === 'premium') passPremium = isPremium
    else if (filterPremium === '1200') passPremium = isPremium && Number(u.plan_months) === 1200
    else if (filterPremium === '12') passPremium = isPremium && Number(u.plan_months) === 12
    else if (filterPremium === '6') passPremium = isPremium && Number(u.plan_months) === 6
    else if (filterPremium === '3') passPremium = isPremium && Number(u.plan_months) === 3
    else if (filterPremium === '1') passPremium = isPremium && Number(u.plan_months) === 1
    else if (filterPremium === 'all') passPremium = true
    else if (filterPremium === 'free') passPremium = !isPremium

    if (!passPremium) return false

    // 2. Text Search
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
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Administración</h1>
          <p style={{ color: 'var(--surface-400)', fontSize: '0.85rem', margin: 0 }}>{users.length} usuarios registrados</p>
        </div>
      </div>

      {/* Tab Selector */}
      <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--surface-800)', padding: '0.25rem', borderRadius: 'var(--radius)', marginBottom: '1.5rem', width: 'fit-content', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('users')}
          style={{
            padding: '0.6rem 1.25rem', border: 'none', borderRadius: 6, fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            background: activeTab === 'users' ? 'var(--primary-600)' : 'transparent',
            color: activeTab === 'users' ? '#fff' : 'var(--surface-400)'
          }}
        >
          <Users size={16} /> Usuarios ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('finances')}
          style={{
            padding: '0.6rem 1.25rem', border: 'none', borderRadius: 6, fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            background: activeTab === 'finances' ? 'linear-gradient(135deg, #059669, #10b981)' : 'transparent',
            color: activeTab === 'finances' ? '#fff' : 'var(--surface-400)'
          }}
        >
          <DollarSign size={16} /> Finanzas & Ingresos {financesData?.kpis?.totalRevenueCLP ? `(${fmtCLP(financesData.kpis.totalRevenueCLP).replace(' CLP', '')})` : ''}
        </button>
        <button
          onClick={() => setActiveTab('paypal')}
          style={{
            padding: '0.6rem 1.25rem', border: 'none', borderRadius: 6, fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            background: activeTab === 'paypal' ? '#003087' : 'transparent',
            color: activeTab === 'paypal' ? '#fff' : 'var(--surface-400)'
          }}
        >
          <CreditCard size={16} /> PayPal ({paypalTxns.length})
        </button>
        <button
          onClick={() => setActiveTab('marketing')}
          style={{
            padding: '0.6rem 1.25rem', border: 'none', borderRadius: 6, fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            background: activeTab === 'marketing' ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'transparent',
            color: activeTab === 'marketing' ? '#fff' : 'var(--surface-400)'
          }}
        >
          <Mail size={16} /> Email Marketing
        </button>
      </div>

      {/* ═══ USERS TAB ═══ */}
      {activeTab === 'users' && (
      <>
      {/* Global Config Panel */}
      <div style={{
        background: 'rgba(59, 130, 246, 0.05)',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        borderRadius: 'var(--radius)',
        padding: '1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--primary-400)', marginBottom: '0.25rem' }}>
            <Settings size={18} />
            Configuración Global: Estrategia Freemium
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--surface-300)' }}>
            Controla cómo los usuarios gratuitos interactúan con la plataforma.
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--surface-800)', padding: '0.25rem', borderRadius: 'var(--radius)' }}>
          <button
            onClick={() => handleModeChange('strict')}
            disabled={updatingMode}
            style={{
              padding: '0.5rem 1rem',
              background: freemiumMode === 'strict' ? 'var(--primary-600)' : 'transparent',
              color: freemiumMode === 'strict' ? '#fff' : 'var(--surface-400)',
              border: 'none', borderRadius: 4, fontSize: '0.85rem', fontWeight: 600,
              cursor: updatingMode ? 'wait' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Modo Estricto (1 Módulo)
          </button>
          <button
            onClick={() => handleModeChange('usage')}
            disabled={updatingMode}
            style={{
              padding: '0.5rem 1rem',
              background: freemiumMode === 'usage' ? 'var(--primary-600)' : 'transparent',
              color: freemiumMode === 'usage' ? '#fff' : 'var(--surface-400)',
              border: 'none', borderRadius: 4, fontSize: '0.85rem', fontWeight: 600,
              cursor: updatingMode ? 'wait' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Modo por Uso (Todo Visible)
          </button>
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

      {/* Search and Filter */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setShowCampaignModal(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.65rem 1rem', background: 'var(--primary-600)',
            border: 'none', borderRadius: 'var(--radius)', color: '#fff',
            fontWeight: 600, cursor: 'pointer', outline: 'none'
          }}
        >
          <Send size={16} /> Nueva Campaña
        </button>

        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
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
        <div style={{ width: '200px' }}>
          <select
            value={filterPremium}
            onChange={e => setFilterPremium(e.target.value)}
            style={{
              width: '100%', padding: '0.65rem 1rem',
              background: 'var(--surface-700)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 'var(--radius)', color: 'var(--surface-50)', fontSize: '0.9rem',
              fontFamily: 'var(--font)', outline: 'none', cursor: 'pointer', appearance: 'none',
              backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239CA3AF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
              backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem top 50%', backgroundSize: '0.65rem auto'
            }}
          >
            <option value="premium">Premium (Todos)</option>
            <option value="1200">Founder (De por vida)</option>
            <option value="12">Premium: 1 Año</option>
            <option value="6">Premium: 6 Meses</option>
            <option value="3">Premium: 3 Meses</option>
            <option value="1">Premium: 1 Mes</option>
            <option value="all">Ver Todos (Gratis y Premium)</option>
            <option value="free">Gratis / Vencidos</option>
          </select>
        </div>
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
                <Th label="Premium" col="premium_until" onClick={handleSort}><SortIcon col="premium_until" /></Th>
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
                    <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <UserInstitutionBadge user={u} size={18} />
                      <span>{u.first_name ? `${u.first_name} ${u.last_name || ''}`.trim() : '—'}</span>
                      {u.plan_months === 1200 && <span style={{ background: '#fbbf24', color: '#000', fontSize: '0.6rem', padding: '2px 4px', borderRadius: '4px', marginLeft: '6px', fontWeight: 800 }}>Founder 🚀</span>}
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
                  <TD>
                    {u.is_premium === 1 && (!u.premium_until || new Date(u.premium_until) > new Date())
                      ? <Star size={14} fill="var(--accent-amber)" color="var(--accent-amber)" />
                      : <span style={{ color: 'var(--surface-600)' }}>—</span>}
                  </TD>
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
          onGrantPremium={handleGrantPremium}
        />
      )}

      <CampaignModal
        isOpen={showCampaignModal}
        onClose={() => setShowCampaignModal(false)}
        targetUsers={filtered}
        adminEmail={user?.email}
      />
    </>
      )}

      {/* ═══ FINANCES & REVENUE TAB ═══ */}
      {activeTab === 'finances' && (() => {
        const kpis = financesData?.kpis || {}
        const monthly = financesData?.monthly || []
        const globalPlans = financesData?.globalPlans || {}
        const txns = financesData?.transactions || []

        const filteredFinancesTxns = txns.filter(t => {
          if (financesGateway !== 'all' && t.gateway !== financesGateway) return false
          const isApproved = t.status === 'approved' || t.status === 'completed' || t.status === 'COMPLETED'
          const isRejected = t.status === 'rejected' || t.status === 'cancelled'
          if (financesStatus === 'approved' && !isApproved) return false
          if (financesStatus === 'rejected' && !isRejected) return false
          if (financesStatus === 'pending' && (isApproved || isRejected)) return false
          if (financesMonth !== 'all' && !(t.date || '').startsWith(financesMonth)) return false
          if (financesPlan !== 'all' && t.plan_id !== financesPlan) return false
          if (financesSearch.trim()) {
            const q = financesSearch.toLowerCase()
            const match =
              (t.payer_name || '').toLowerCase().includes(q) ||
              (t.payer_email || '').toLowerCase().includes(q) ||
              (t.user_name || '').toLowerCase().includes(q) ||
              (t.user_email || '').toLowerCase().includes(q) ||
              (t.id || '').toLowerCase().includes(q) ||
              (t.user_university || '').toLowerCase().includes(q) ||
              (t.user_country || '').toLowerCase().includes(q) ||
              (t.user_whatsapp || '').toLowerCase().includes(q) ||
              (t.external_reference || '').toLowerCase().includes(q)
            if (!match) return false
          }
          return true
        })

        const maxMonthRevenue = Math.max(1, ...monthly.map(m => m.totalEstimatedCLP || 0))

        return (
          <>
            {/* Finances Header Controls */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.08), rgba(16, 185, 129, 0.04))',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: 'var(--radius)', padding: '1.25rem', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: '#34d399', fontSize: '1.1rem' }}>
                  <DollarSign size={20} /> Control de Ingresos & Facturación EUNACOM
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--surface-300)', marginTop: '0.2rem' }}>
                  Recaudación exclusiva de la app mediante Mercado Pago (CLP) y PayPal (USD) · Tasa ref: 1 USD ≈ ${kpis.usdToClpRate || 930} CLP
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => downloadFinancesCsv(user.email)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.65rem 1.25rem', background: '#059669',
                    border: 'none', borderRadius: 'var(--radius)', color: '#fff',
                    fontWeight: 700, cursor: 'pointer', outline: 'none', fontSize: '0.88rem',
                    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
                  }}
                >
                  <Download size={16} /> Descargar Reporte CSV
                </button>
                <button
                  onClick={loadFinances}
                  disabled={financesLoading}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.65rem 1rem', background: 'var(--surface-700)',
                    border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius)', color: 'var(--surface-200)',
                    fontWeight: 600, cursor: financesLoading ? 'wait' : 'pointer', outline: 'none', fontSize: '0.88rem'
                  }}
                >
                  <RefreshCw size={15} style={{ animation: financesLoading ? 'spin 1s linear infinite' : 'none' }} />
                  {financesLoading ? 'Actualizando...' : 'Refrescar'}
                </button>
              </div>
            </div>

            {/* Global KPI Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem', marginBottom: '1.75rem' }}>
              <div style={{ background: 'var(--surface-700)', borderRadius: 'var(--radius)', padding: '1.1rem', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--surface-400)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Facturado</span>
                  <Sparkles size={16} color="#34d399" />
                </div>
                <div style={{ fontSize: '1.55rem', fontWeight: 900, color: '#34d399' }}>
                  {fmtCLP(kpis.totalEstimatedCLP)}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--surface-400)', marginTop: '0.3rem' }}>
                  CLP + USD equivalentes
                </div>
              </div>

              <div style={{ background: 'var(--surface-700)', borderRadius: 'var(--radius)', padding: '1.1rem', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--surface-400)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mercado Pago</span>
                  <CreditCard size={16} color="#38bdf8" />
                </div>
                <div style={{ fontSize: '1.55rem', fontWeight: 900, color: '#38bdf8' }}>
                  {fmtCLP(kpis.totalRevenueCLP)}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--surface-400)', marginTop: '0.3rem' }}>
                  Neto estimado: <strong style={{ color: '#bae6fd' }}>{fmtCLP(kpis.totalNetCLP)}</strong>
                </div>
              </div>

              <div style={{ background: 'var(--surface-700)', borderRadius: 'var(--radius)', padding: '1.1rem', border: '1px solid rgba(96, 165, 250, 0.25)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--surface-400)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>PayPal Directo</span>
                  <Globe size={16} color="#60a5fa" />
                </div>
                <div style={{ fontSize: '1.55rem', fontWeight: 900, color: '#60a5fa' }}>
                  {fmtUSD(kpis.totalRevenueUSD)}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--surface-400)', marginTop: '0.3rem' }}>
                  ≈ {fmtCLP((kpis.totalRevenueUSD || 0) * (kpis.usdToClpRate || 930))}
                </div>
              </div>

              <div style={{ background: 'var(--surface-700)', borderRadius: 'var(--radius)', padding: '1.1rem', border: '1px solid rgba(251, 191, 36, 0.25)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--surface-400)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{kpis.currentMonth?.monthLabel || 'Mes Actual'}</span>
                  <Calendar size={16} color="#fbbf24" />
                </div>
                <div style={{ fontSize: '1.55rem', fontWeight: 900, color: '#fbbf24' }}>
                  {fmtCLP(kpis.currentMonth?.totalEstimatedCLP)}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--surface-400)', marginTop: '0.3rem' }}>
                  {kpis.currentMonth?.successfulCount || 0} compras este mes
                </div>
              </div>

              <div style={{ background: 'var(--surface-700)', borderRadius: 'var(--radius)', padding: '1.1rem', border: '1px solid rgba(168, 85, 247, 0.25)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--surface-400)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ticket Promedio</span>
                  <BarChart3 size={16} color="#c084fc" />
                </div>
                <div style={{ fontSize: '1.55rem', fontWeight: 900, color: '#c084fc' }}>
                  {fmtCLP(kpis.averageTicketCLP)}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--surface-400)', marginTop: '0.3rem' }}>
                  Por compra aprobada
                </div>
              </div>

              <div style={{ background: 'var(--surface-700)', borderRadius: 'var(--radius)', padding: '1.1rem', border: '1px solid rgba(236, 72, 153, 0.25)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--surface-400)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tasa de Conversión</span>
                  <CheckCircle size={16} color="#f472b6" />
                </div>
                <div style={{ fontSize: '1.55rem', fontWeight: 900, color: '#f472b6' }}>
                  {kpis.totalApprovedCount > 0 ? `${Math.round((kpis.totalApprovedCount / (kpis.totalApprovedCount + (kpis.totalRejectedCount || 0))) * 100)}%` : '0%'}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--surface-400)', marginTop: '0.3rem' }}>
                  {kpis.totalApprovedCount || 0} exitosas · {kpis.totalRejectedCount || 0} rechazadas
                </div>
              </div>
            </div>

            {/* Monthly Evolution Section */}
            <div style={{
              background: 'var(--surface-800)', borderRadius: 'var(--radius)', padding: '1.5rem',
              border: '1px solid rgba(255,255,255,0.06)', marginBottom: '1.75rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={18} color="var(--primary-400)" /> Facturación Mes a Mes
                  </h2>
                  <p style={{ fontSize: '0.8rem', color: 'var(--surface-400)', margin: '0.2rem 0 0 0' }}>
                    Desglose cronológico de ingresos por pasarela y planes vendidos
                  </p>
                </div>
                {financesMonth !== 'all' && (
                  <button
                    onClick={() => setFinancesMonth('all')}
                    style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 4, padding: '4px 8px', color: '#fff', fontSize: '0.78rem', cursor: 'pointer' }}
                  >
                    Mostrar todos los meses ✕
                  </button>
                )}
              </div>

              {financesLoading ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--surface-400)' }}>Cargando desglose mensual...</div>
              ) : monthly.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--surface-400)' }}>No hay datos mensuales registrados aún.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {monthly.map(m => {
                    const pct = Math.round((m.totalEstimatedCLP / maxMonthRevenue) * 100)
                    const isSelectedMonth = financesMonth === m.monthKey
                    return (
                      <div
                        key={m.monthKey}
                        style={{
                          background: isSelectedMonth ? 'rgba(5, 150, 105, 0.12)' : 'var(--surface-700)',
                          border: isSelectedMonth ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255,255,255,0.05)',
                          borderRadius: 'var(--radius)', padding: '1.1rem', transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.65rem' }}>
                          <div>
                            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--surface-100)', marginRight: '0.75rem' }}>
                              {m.monthLabel}
                            </span>
                            <span style={{ fontSize: '0.78rem', background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: 4, color: 'var(--surface-300)' }}>
                              {m.successfulCount} compras exitosas
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#34d399' }}>
                                {fmtCLP(m.totalEstimatedCLP)}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--surface-400)' }}>
                                MP: {fmtCLP(m.mpTotalCLP)} {m.paypalTotalUSD > 0 ? `· PayPal: ${fmtUSD(m.paypalTotalUSD)}` : ''}
                              </div>
                            </div>
                            <button
                              onClick={() => setFinancesMonth(isSelectedMonth ? 'all' : m.monthKey)}
                              style={{
                                padding: '0.4rem 0.8rem',
                                background: isSelectedMonth ? '#059669' : 'rgba(255,255,255,0.08)',
                                border: 'none', borderRadius: 4, color: '#fff', fontSize: '0.78rem', fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              {isSelectedMonth ? 'Filtrado ✓' : 'Filtrar transacciones'}
                            </button>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden', marginBottom: '0.75rem' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #059669, #10b981)', borderRadius: 3 }} />
                        </div>

                        {/* Plan Badges for this month */}
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {m.plans['1m']?.count > 0 && (
                            <span style={{ fontSize: '0.74rem', background: 'rgba(59, 130, 246, 0.15)', color: '#93c5fd', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
                              {m.plans['1m'].count}x 1 Mes ({fmtCLP(m.plans['1m'].totalCLP)})
                            </span>
                          )}
                          {m.plans['3m']?.count > 0 && (
                            <span style={{ fontSize: '0.74rem', background: 'rgba(168, 85, 247, 0.15)', color: '#d8b4fe', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
                              {m.plans['3m'].count}x 3 Meses ({fmtCLP(m.plans['3m'].totalCLP)})
                            </span>
                          )}
                          {m.plans['6m']?.count > 0 && (
                            <span style={{ fontSize: '0.74rem', background: 'rgba(236, 72, 153, 0.15)', color: '#f472b6', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
                              {m.plans['6m'].count}x 6 Meses ({fmtCLP(m.plans['6m'].totalCLP)})
                            </span>
                          )}
                          {m.plans['1y']?.count > 0 && (
                            <span style={{ fontSize: '0.74rem', background: 'rgba(251, 191, 36, 0.15)', color: '#fcd34d', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
                              {m.plans['1y'].count}x 1 Año ({fmtCLP(m.plans['1y'].totalCLP)})
                            </span>
                          )}
                          {m.plans['offer']?.count > 0 && (
                            <span style={{ fontSize: '0.74rem', background: 'rgba(20, 184, 166, 0.15)', color: '#5eead4', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
                              {m.plans['offer'].count}x Oferta ({fmtCLP(m.plans['offer'].totalCLP)})
                            </span>
                          )}
                          {m.plans['donation']?.count > 0 && (
                            <span style={{ fontSize: '0.74rem', background: 'rgba(249, 115, 22, 0.15)', color: '#fdba74', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
                              {m.plans['donation'].count}x Donación ({fmtCLP(m.plans['donation'].totalCLP)})
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Plan Distribution Breakdown */}
            <div style={{
              background: 'var(--surface-800)', borderRadius: 'var(--radius)', padding: '1.5rem',
              border: '1px solid rgba(255,255,255,0.06)', marginBottom: '1.75rem'
            }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Layers size={18} color="var(--primary-400)" /> Distribución Global por Plan
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem' }}>
                {Object.entries(globalPlans).map(([pId, p]) => (
                  <div
                    key={pId}
                    onClick={() => setFinancesPlan(financesPlan === pId ? 'all' : pId)}
                    style={{
                      background: financesPlan === pId ? 'rgba(5, 150, 105, 0.15)' : 'var(--surface-700)',
                      border: financesPlan === pId ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.06)',
                      borderRadius: 'var(--radius)', padding: '1rem', cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ fontSize: '0.78rem', color: 'var(--surface-400)', fontWeight: 600 }}>{p.name}</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--surface-100)', marginTop: '0.2rem' }}>
                      {fmtCLP(p.totalCLP)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600, marginTop: '0.2rem' }}>
                      {p.count} ventas {financesPlan === pId ? '✓' : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Unified Transactions Table with Filters */}
            <div style={{
              background: 'var(--surface-800)', borderRadius: 'var(--radius)', padding: '1.5rem',
              border: '1px solid rgba(255,255,255,0.06)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                    Historial Unificado de Pagos ({filteredFinancesTxns.length})
                  </h2>
                  <p style={{ fontSize: '0.8rem', color: 'var(--surface-400)', margin: '0.2rem 0 0 0' }}>
                    Todas las transacciones registradas en Mercado Pago y PayPal
                  </p>
                </div>

                {/* Filter Pills / Selectors */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  {/* Search */}
                  <div style={{ position: 'relative', width: '220px' }}>
                    <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--surface-400)' }} />
                    <input
                      type="text"
                      placeholder="Buscar por nombre, email, RUT..."
                      value={financesSearch}
                      onChange={e => setFinancesSearch(e.target.value)}
                      style={{
                        width: '100%', padding: '0.45rem 0.5rem 0.45rem 1.9rem',
                        background: 'var(--surface-700)', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 6, color: '#fff', fontSize: '0.8rem', outline: 'none'
                      }}
                    />
                  </div>

                  {/* Gateway */}
                  <select
                    value={financesGateway}
                    onChange={e => setFinancesGateway(e.target.value)}
                    style={{
                      padding: '0.45rem 0.65rem', background: 'var(--surface-700)',
                      border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#fff', fontSize: '0.8rem', outline: 'none'
                    }}
                  >
                    <option value="all">Todas las Pasarelas</option>
                    <option value="mercadopago">Mercado Pago</option>
                    <option value="paypal">PayPal</option>
                  </select>

                  {/* Status */}
                  <select
                    value={financesStatus}
                    onChange={e => setFinancesStatus(e.target.value)}
                    style={{
                      padding: '0.45rem 0.65rem', background: 'var(--surface-700)',
                      border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#fff', fontSize: '0.8rem', outline: 'none'
                    }}
                  >
                    <option value="all">Todos los Estados</option>
                    <option value="approved">Aprobados / Completados</option>
                    <option value="rejected">Rechazados / Fallidos</option>
                    <option value="pending">Pendientes</option>
                  </select>

                  {/* Month */}
                  <select
                    value={financesMonth}
                    onChange={e => setFinancesMonth(e.target.value)}
                    style={{
                      padding: '0.45rem 0.65rem', background: 'var(--surface-700)',
                      border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#fff', fontSize: '0.8rem', outline: 'none'
                    }}
                  >
                    <option value="all">Todos los Meses</option>
                    {monthly.map(m => (
                      <option key={m.monthKey} value={m.monthKey}>{m.monthLabel}</option>
                    ))}
                  </select>

                  {/* Plan */}
                  <select
                    value={financesPlan}
                    onChange={e => setFinancesPlan(e.target.value)}
                    style={{
                      padding: '0.45rem 0.65rem', background: 'var(--surface-700)',
                      border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#fff', fontSize: '0.8rem', outline: 'none'
                    }}
                  >
                    <option value="all">Todos los Planes</option>
                    <option value="1m">1 Mes ($14.990)</option>
                    <option value="3m">3 Meses ($34.990)</option>
                    <option value="6m">6 Meses ($54.990)</option>
                    <option value="1y">1 Año ($89.990)</option>
                    <option value="offer">Oferta 1 Mes ($5.000)</option>
                    <option value="donation">Donación ($9.000)</option>
                  </select>
                </div>
              </div>

              {financesLoading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--surface-400)' }}>Cargando transacciones...</div>
              ) : filteredFinancesTxns.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--surface-400)' }}>
                  No se encontraron transacciones con los filtros seleccionados.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem' }}>
                    <thead>
                      <tr>
                        <th style={thStyle}>Fecha</th>
                        <th style={thStyle}>Pasarela</th>
                        <th style={thStyle}>Plan / Concepto</th>
                        <th style={thStyle}>Monto</th>
                        <th style={thStyle}>Estado</th>
                        <th style={thStyle}>Pagador</th>
                        <th style={thStyle}>Usuario Plataforma</th>
                        <th style={thStyle}>Universidad / País</th>
                        <th style={thStyle}>ID / Ref</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFinancesTxns.map(t => {
                        const isApproved = t.status === 'approved' || t.status === 'completed' || t.status === 'COMPLETED'
                        const isRejected = t.status === 'rejected' || t.status === 'cancelled'

                        return (
                          <tr key={`${t.gateway}_${t.id}`} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <TD style={{ whiteSpace: 'nowrap' }}>
                              {fmtDateTime(t.date)}
                            </TD>

                            <TD>
                              <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 700,
                                background: t.gateway === 'mercadopago' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(0, 48, 135, 0.3)',
                                color: t.gateway === 'mercadopago' ? '#38bdf8' : '#93c5fd',
                                border: t.gateway === 'mercadopago' ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid rgba(0, 48, 135, 0.5)'
                              }}>
                                {t.gateway === 'mercadopago' ? 'Mercado Pago' : 'PayPal'}
                              </span>
                            </TD>

                            <TD>
                              <span style={{
                                background: t.plan_id === '1y' ? 'rgba(251, 191, 36, 0.15)' : t.plan_id === '6m' ? 'rgba(236, 72, 153, 0.15)' : t.plan_id === '3m' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                                color: t.plan_id === '1y' ? '#fcd34d' : t.plan_id === '6m' ? '#f472b6' : t.plan_id === '3m' ? '#d8b4fe' : 'var(--accent-blue)',
                                padding: '2px 8px', borderRadius: 4, fontSize: '0.76rem', fontWeight: 600
                              }}>
                                {t.plan_name}
                              </span>
                            </TD>

                            <TD style={{ fontWeight: 800, whiteSpace: 'nowrap' }}>
                              <div>{t.currency === 'USD' ? fmtUSD(t.amount) : fmtCLP(t.amount)}</div>
                              {t.fee > 0 && (
                                <div style={{ fontSize: '0.7rem', color: 'var(--surface-400)', fontWeight: 400 }}>
                                  Neto: {fmtCLP(t.net_amount)}
                                </div>
                              )}
                            </TD>

                            <TD>
                              <span style={{
                                background: isApproved ? 'rgba(16, 185, 129, 0.15)' : isRejected ? 'rgba(239, 68, 68, 0.15)' : 'rgba(251, 191, 36, 0.15)',
                                color: isApproved ? '#34d399' : isRejected ? '#f87171' : '#fcd34d',
                                padding: '2px 8px', borderRadius: 4, fontSize: '0.74rem', fontWeight: 700
                              }}>
                                {isApproved ? 'Aprobado ✓' : isRejected ? 'Rechazado ✕' : (t.status || 'Pendiente')}
                              </span>
                            </TD>

                            <TD>
                              <div style={{ fontWeight: 600, color: 'var(--surface-100)' }}>{t.payer_name || '—'}</div>
                              <div style={{ fontSize: '0.74rem', color: 'var(--surface-400)' }}>{t.payer_email || '—'}</div>
                            </TD>

                            <TD>
                              {t.user_id ? (
                                <div>
                                  <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                                    {t.is_user_premium ? <Star size={12} fill="var(--accent-amber)" color="var(--accent-amber)" /> : null}
                                    <span>{t.user_name || t.user_email}</span>
                                  </div>
                                  <div style={{ fontSize: '0.74rem', color: 'var(--surface-400)' }}>{t.user_email}</div>
                                </div>
                              ) : (
                                <span style={{ color: 'var(--surface-500)', fontSize: '0.75rem' }}>No registrado</span>
                              )}
                            </TD>

                            <TD>
                              <div>{t.user_university || t.user_country || '—'}</div>
                              {t.user_whatsapp && <div style={{ fontSize: '0.72rem', color: 'var(--surface-400)' }}>{t.user_whatsapp}</div>}
                            </TD>

                            <TD style={{ fontSize: '0.72rem', color: 'var(--surface-400)', fontFamily: 'monospace' }}>
                              <span title={t.id}>{t.id?.slice(0, 12)}...</span>
                            </TD>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )
      })()}

      {/* ═══ PAYPAL TRANSACTIONS TAB ═══ */}
      {activeTab === 'paypal' && (
        <>
          {/* PayPal Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <SummaryCard label="Total Transacciones" value={paypalTxns.length} color="#003087" />
            <SummaryCard label="Usuarios Matcheados" value={paypalTxns.filter(t => t.user_id).length} color="var(--accent-green)" />
            <SummaryCard label="Sin Match" value={paypalTxns.filter(t => !t.user_id).length} color="var(--accent-red)" />
            <SummaryCard label="Completados" value={paypalTxns.filter(t => t.status === 'COMPLETED' || t.status === 'completed').length} color="var(--accent-teal)" />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => downloadPaypalCsv(user.email)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.65rem 1.25rem', background: '#003087',
                border: 'none', borderRadius: 'var(--radius)', color: '#fff',
                fontWeight: 600, cursor: 'pointer', outline: 'none', fontSize: '0.9rem'
              }}
            >
              <Download size={16} /> Descargar Excel / CSV
            </button>
            <button
              onClick={loadPaypalTxns}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.65rem 1rem', background: 'var(--surface-700)',
                border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius)', color: 'var(--surface-200)',
                fontWeight: 600, cursor: 'pointer', outline: 'none', fontSize: '0.9rem'
              }}
            >
              Refrescar
            </button>
          </div>

          {/* Transactions Table */}
          {paypalLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--surface-400)' }}>Cargando transacciones PayPal...</div>
          ) : paypalTxns.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--surface-400)' }}>
              <CreditCard size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
              <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>No hay transacciones PayPal aún</p>
              <p style={{ fontSize: '0.85rem' }}>Las transacciones aparecerán aquí automáticamente cuando se configure el webhook de PayPal.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Fecha</th>
                    <th style={thStyle}>Nombre</th>
                    <th style={thStyle}>Email PayPal</th>
                    <th style={thStyle}>Plan</th>
                    <th style={thStyle}>Monto</th>
                    <th style={thStyle}>Estado</th>
                    <th style={thStyle}>Usuario Match</th>
                    <th style={thStyle}>País</th>
                    <th style={thStyle}>ID Transacción</th>
                  </tr>
                </thead>
                <tbody>
                  {paypalTxns.map(t => (
                    <tr key={t.transaction_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <TD>{fmtDateTime(t.payment_date || t.created_at)}</TD>
                      <TD style={{ fontWeight: 600 }}>{t.payer_name || '—'}</TD>
                      <TD>{t.payer_email || '—'}</TD>
                      <TD>
                        <span style={{
                          background: t.plan_id ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.05)',
                          color: t.plan_id ? 'var(--accent-blue)' : 'var(--surface-400)',
                          padding: '2px 8px', borderRadius: 4, fontSize: '0.78rem', fontWeight: 600
                        }}>
                          {t.plan_id === '1m' ? '1 Mes' : t.plan_id === '3m' ? '3 Meses' : t.plan_id === '6m' ? '6 Meses' : t.plan_id === '1y' ? '1 Año' : t.plan_id || '—'}
                        </span>
                      </TD>
                      <TD style={{ fontWeight: 700 }}>{t.amount ? `${t.currency || 'USD'} ${t.amount}` : '—'}</TD>
                      <TD>
                        <span style={{
                          background: (t.status === 'COMPLETED' || t.status === 'completed') ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                          color: (t.status === 'COMPLETED' || t.status === 'completed') ? '#34d399' : '#f87171',
                          padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600
                        }}>
                          {t.status || '—'}
                        </span>
                      </TD>
                      <TD>
                        {t.user_id ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <CheckCircle size={14} color="var(--accent-green)" />
                            <span style={{ fontSize: '0.78rem' }}>{t.profile_name || t.profile_email || t.user_id.slice(0, 8)}</span>
                          </span>
                        ) : (
                          <span style={{ color: 'var(--surface-500)', fontSize: '0.78rem' }}>Sin match</span>
                        )}
                      </TD>
                      <TD>{t.payer_country || t.profile_country || '—'}</TD>
                      <TD style={{ fontSize: '0.72rem', color: 'var(--surface-400)', fontFamily: 'monospace' }}>{t.transaction_id?.slice(0, 16)}...</TD>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ═══ EMAIL MARKETING TAB ═══ */}
      {activeTab === 'marketing' && (
        <AdminEmailMarketing adminEmail={user?.email || 'dr.felipeyanez@gmail.com'} />
      )}
    </div>
  )
}

const thStyle = {
  padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 700,
  fontSize: '0.78rem', color: 'var(--surface-300)',
  borderBottom: '2px solid rgba(255,255,255,0.08)',
  whiteSpace: 'nowrap', textTransform: 'uppercase',
  letterSpacing: '0.05em',
}

export default AdminUsers
