import React, { useState, useEffect } from 'react'
import { fetchPerfil } from '../lib/api'
import {
  Search, BookOpen, ChevronRight, Stethoscope, AlertTriangle,
  Brain, FileText, Wrench, Filter, X, Shield, ArrowRight,
  Activity, Eye, Clipboard
} from 'lucide-react'

/* ════════════════════════════════════════════════════════════════
   LEVEL BADGES
   ════════════════════════════════════════════════════════════════ */
const levelColors = {
  'Específico': { bg: 'rgba(16,185,129,0.12)', color: '#10b981', border: 'rgba(16,185,129,0.3)' },
  'Sospecha': { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: 'rgba(245,158,11,0.3)' },
  'Completo': { bg: 'rgba(59,130,246,0.12)', color: '#3b82f6', border: 'rgba(59,130,246,0.3)' },
  'Inicial': { bg: 'rgba(168,85,247,0.12)', color: '#8b5cf6', border: 'rgba(168,85,247,0.3)' },
  'Derivar': { bg: 'rgba(236,72,153,0.12)', color: '#ec4899', border: 'rgba(236,72,153,0.3)' },
  'No requiere': { bg: 'rgba(107,114,128,0.12)', color: '#6b7280', border: 'rgba(107,114,128,0.3)' },
  'Realizar': { bg: 'rgba(16,185,129,0.12)', color: '#10b981', border: 'rgba(16,185,129,0.3)' },
  'Derivar a especialista': { bg: 'rgba(236,72,153,0.12)', color: '#ec4899', border: 'rgba(236,72,153,0.3)' },
  'Realiza, interpreta y emplea': { bg: 'rgba(16,185,129,0.12)', color: '#10b981', border: 'rgba(16,185,129,0.3)' },
  'Interpreta y emplea': { bg: 'rgba(59,130,246,0.12)', color: '#3b82f6', border: 'rgba(59,130,246,0.3)' },
  'Emplea informe': { bg: 'rgba(168,85,247,0.12)', color: '#8b5cf6', border: 'rgba(168,85,247,0.3)' },
}

function Badge({ label }) {
  const style = levelColors[label] || { bg: 'var(--surface-600)', color: 'var(--text-tertiary)', border: 'var(--border-color)' }
  return (
    <span style={{
      display: 'inline-flex', padding: '0.2rem 0.6rem', borderRadius: 6,
      fontSize: '0.7rem', fontWeight: 600, whiteSpace: 'nowrap',
      background: style.bg, color: style.color, border: `1px solid ${style.border}`,
    }}>
      {label}
    </span>
  )
}

/* ════════════════════════════════════════════════════════════════
   SECTION ICONS
   ════════════════════════════════════════════════════════════════ */
const sectionIcons = {
  'Situaciones clínicas': <Stethoscope size={14} />,
  'Situaciones clínicas de urgencia': <AlertTriangle size={14} />,
  'Conocimientos generales': <Brain size={14} />,
  'Exámenes e imagenología': <Eye size={14} />,
  'Procedimientos diagnósticos y terapéuticos': <Wrench size={14} />,
}

const sectionColors = {
  'Situaciones clínicas': '#3b82f6',
  'Situaciones clínicas de urgencia': '#ef4444',
  'Conocimientos generales': '#8b5cf6',
  'Exámenes e imagenología': '#0ea5e9',
  'Procedimientos diagnósticos y terapéuticos': '#10b981',
}

/* ════════════════════════════════════════════════════════════════
   ITEM CARD
   ════════════════════════════════════════════════════════════════ */
function ItemCard({ item }) {
  const [expanded, setExpanded] = useState(false)
  const secColor = sectionColors[item.seccion] || '#6b7280'
  const isUrgencia = item.seccion.includes('urgencia')

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      className="card"
      style={{
        padding: '0.9rem 1.1rem', cursor: 'pointer',
        borderLeft: `3px solid ${secColor}`,
        transition: 'all 0.2s',
        background: expanded ? `${secColor}08` : 'var(--surface-700)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <div style={{
          fontSize: '0.65rem', fontFamily: 'monospace', color: secColor,
          background: `${secColor}15`, padding: '0.15rem 0.4rem', borderRadius: 4,
          fontWeight: 600, whiteSpace: 'nowrap', marginTop: '0.15rem',
        }}>
          {item.codigo}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)',
            display: 'flex', alignItems: 'center', gap: '0.4rem',
          }}>
            {isUrgencia && <AlertTriangle size={13} style={{ color: '#ef4444', flexShrink: 0 }} />}
            {item.situacion}
          </div>

          {/* Badges row */}
          {(item.diagnostico || item.nivel) && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.5rem' }}>
              {item.diagnostico && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>Dx:</span>
                  <Badge label={item.diagnostico} />
                </div>
              )}
              {item.tratamiento && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>Tx:</span>
                  <Badge label={item.tratamiento} />
                </div>
              )}
              {item.seguimiento && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>Seg:</span>
                  <Badge label={item.seguimiento} />
                </div>
              )}
              {item.nivel && <Badge label={item.nivel} />}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   STATS BAR
   ════════════════════════════════════════════════════════════════ */
function StatsBar({ items }) {
  const total = items.length
  const especifico = items.filter(i => i.diagnostico === 'Específico').length
  const sospecha = items.filter(i => i.diagnostico === 'Sospecha').length
  const completo = items.filter(i => i.tratamiento === 'Completo').length
  const urgencias = items.filter(i => i.seccion?.includes('urgencia')).length

  return (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
      {[
        { label: 'Total', value: total, color: 'var(--text-primary)' },
        { label: 'Dx Específico', value: especifico, color: '#10b981' },
        { label: 'Dx Sospecha', value: sospecha, color: '#f59e0b' },
        { label: 'Tx Completo', value: completo, color: '#3b82f6' },
        { label: 'Urgencias', value: urgencias, color: '#ef4444' },
      ].map(s => (
        <div key={s.label} style={{
          padding: '0.5rem 0.9rem', borderRadius: 10, background: 'var(--surface-700)',
          border: '1px solid var(--border-color)', fontSize: '0.78rem',
        }}>
          <div style={{ fontWeight: 800, fontSize: '1.1rem', color: s.color }}>{s.value}</div>
          <div style={{ color: 'var(--text-tertiary)', fontWeight: 500 }}>{s.label}</div>
        </div>
      ))}
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════════════════════════ */
const Biblioteca = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterArea, setFilterArea] = useState('')
  const [filterSpecialty, setFilterSpecialty] = useState('')
  const [filterSeccion, setFilterSeccion] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(t)
  }, [search])

  // Fetch data
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const params = {}
        if (filterArea) params.area = filterArea
        if (filterSpecialty) params.specialty = filterSpecialty
        if (filterSeccion) params.seccion = filterSeccion
        if (debouncedSearch) params.q = debouncedSearch
        const result = await fetchPerfil(params)
        setItems(result.data || [])
      } catch (err) {
        console.error('Error fetching perfil:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [filterArea, filterSpecialty, filterSeccion, debouncedSearch])

  // Get unique values for filters
  const areas = [...new Set(items.map(i => i.area))].sort()
  const specialties = [...new Set(items.filter(i => !filterArea || i.area === filterArea).map(i => i.specialty))].sort()
  const secciones = [...new Set(items.map(i => i.seccion))].sort()

  // Group by section
  const grouped = {}
  items.forEach(item => {
    if (!grouped[item.seccion]) grouped[item.seccion] = []
    grouped[item.seccion].push(item)
  })

  const sectionOrder = [
    'Situaciones clínicas',
    'Situaciones clínicas de urgencia',
    'Conocimientos generales',
    'Exámenes e imagenología',
    'Procedimientos diagnósticos y terapéuticos',
  ]

  const hasFilters = filterArea || filterSpecialty || filterSeccion || debouncedSearch
  const clearFilters = () => { setFilterArea(''); setFilterSpecialty(''); setFilterSeccion(''); setSearch('') }

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="page__title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Shield size={24} style={{ color: 'var(--primary-500)' }} />
          Biblioteca EUNACOM
        </h1>
        <p className="page__subtitle">
          1542 ítems del Perfil de Conocimientos — lo que necesitas saber para el examen.
        </p>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <Search size={18} style={{
          position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
          color: 'var(--text-tertiary)',
        }} />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por tema o código (ej: diabetes, 1.02.1.005)..."
          style={{
            width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem',
            borderRadius: 12, border: '1px solid var(--border-color)',
            background: 'var(--surface-700)', color: 'var(--text-primary)',
            fontSize: '0.9rem', outline: 'none',
          }}
        />
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <select value={filterArea} onChange={e => { setFilterArea(e.target.value); setFilterSpecialty('') }}
          style={{ padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--surface-700)', color: 'var(--text-primary)', fontSize: '0.82rem' }}>
          <option value="">Todas las áreas</option>
          {['Medicina Interna','Pediatría','Obstetricia y ginecología','Cirugía','Psiquiatría','Especialidades','Salud Pública'].map(a =>
            <option key={a} value={a}>{a}</option>
          )}
        </select>

        {filterArea && (
          <select value={filterSpecialty} onChange={e => setFilterSpecialty(e.target.value)}
            style={{ padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--surface-700)', color: 'var(--text-primary)', fontSize: '0.82rem' }}>
            <option value="">Todas las especialidades</option>
            {specialties.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        )}

        <select value={filterSeccion} onChange={e => setFilterSeccion(e.target.value)}
          style={{ padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--surface-700)', color: 'var(--text-primary)', fontSize: '0.82rem' }}>
          <option value="">Todas las secciones</option>
          {sectionOrder.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        {hasFilters && (
          <button onClick={clearFilters} style={{
            display: 'flex', alignItems: 'center', gap: '0.3rem',
            padding: '0.5rem 0.75rem', borderRadius: 8, border: 'none',
            background: 'rgba(239,68,68,0.1)', color: '#ef4444',
            cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
          }}>
            <X size={14} /> Limpiar
          </button>
        )}
      </div>

      {/* Stats */}
      {!loading && <StatsBar items={items} />}

      {/* Loading */}
      {loading && (
        <div style={{ padding: '3rem', textAlign: 'center' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--primary-500)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
          <span style={{ color: 'var(--text-secondary)' }}>Cargando biblioteca...</span>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Results grouped by section */}
      {!loading && sectionOrder.filter(s => grouped[s]).map(seccion => (
        <div key={seccion} style={{ marginBottom: '1.5rem' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            marginBottom: '0.75rem', padding: '0.5rem 0',
            borderBottom: `2px solid ${sectionColors[seccion] || '#6b7280'}20`,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: `${sectionColors[seccion]}15`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: sectionColors[seccion],
            }}>
              {sectionIcons[seccion]}
            </div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              {seccion}
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>
              ({grouped[seccion].length})
            </span>
          </div>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {grouped[seccion].map(item => (
              <ItemCard key={item.codigo} item={item} />
            ))}
          </div>
        </div>
      ))}

      {/* Empty state */}
      {!loading && items.length === 0 && (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <Search size={32} style={{ color: 'var(--text-tertiary)', marginBottom: '1rem' }} />
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            No se encontraron ítems con esos filtros.
          </div>
        </div>
      )}
    </div>
  )
}

export default Biblioteca
