import React, { useState } from 'react'
import progressData from '../data/script_progress.json'

const STATUS_COLORS = {
  done: '#22c55e',
  partial: '#f59e0b',
  pending: '#ef4444',
}

function SpecialtyRow({ group, expanded, onToggle }) {
  const pct = Math.round((group.done / group.total) * 100)
  const allDone = group.done === group.total
  const color = allDone ? STATUS_COLORS.done : group.done > 0 ? STATUS_COLORS.partial : STATUS_COLORS.pending

  return (
    <div style={{ marginBottom: 8 }}>
      <div
        onClick={onToggle}
        style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
          background: '#1a1a2e', borderRadius: 8, cursor: 'pointer',
          border: `1px solid ${color}33`,
        }}
      >
        <span style={{ fontSize: 12, color, fontWeight: 700, minWidth: 36 }}>{pct}%</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 500 }}>{group.label}</div>
          <div style={{ marginTop: 4, height: 4, background: '#2d2d4e', borderRadius: 2 }}>
            <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 2, transition: 'width 0.3s' }} />
          </div>
        </div>
        <span style={{ fontSize: 12, color: '#94a3b8' }}>{group.done}/{group.total}</span>
        <span style={{ fontSize: 12, color: '#64748b' }}>{expanded ? '▲' : '▼'}</span>
      </div>

      {expanded && (
        <div style={{ marginTop: 4, marginLeft: 16, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {group.lessons.map(l => {
            const isDone = l.done
            const isPartial = !isDone && l.partsFound.length > 0
            const dotColor = isDone ? STATUS_COLORS.done : isPartial ? STATUS_COLORS.partial : STATUS_COLORS.pending
            const partsLabel = l.expectedParts === 1
              ? (l.hasShort ? '✓' : '✗')
              : `${l.partsFound.length}/${l.expectedParts} parts`

            return (
              <div key={l.folder} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '6px 12px', background: '#12122a', borderRadius: 6,
                borderLeft: `3px solid ${dotColor}`,
              }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 12, color: '#cbd5e1' }}>{l.topic}</span>
                <span style={{ fontSize: 11, color: '#64748b', minWidth: 70, textAlign: 'right' }}>
                  {partsLabel} · {Math.round(l.transcriptLen / 1000)}k
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function ScriptProgress() {
  const { summary, specialties, lastProcessed, generatedAt } = progressData
  const [expanded, setExpanded] = useState({})
  const [filter, setFilter] = useState('all') // all | pending | done

  const toggle = (label) => setExpanded(e => ({ ...e, [label]: !e[label] }))

  const filtered = specialties
    .filter(g => {
      if (filter === 'pending') return g.done < g.total
      if (filter === 'done') return g.done === g.total
      return true
    })

  const overallPct = summary.pctDone

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '24px 16px', fontFamily: 'system-ui, sans-serif' }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, color: '#f1f5f9', fontWeight: 700 }}>
          Script Generation Progress
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>
          Updated {new Date(generatedAt).toLocaleString('es-CL')} · Run <code style={{ background: '#1a1a2e', padding: '1px 5px', borderRadius: 4 }}>node update_progress.cjs</code> to refresh
        </p>
      </div>

      {/* Overall bar */}
      <div style={{ background: '#1a1a2e', borderRadius: 12, padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 }}>
          <div>
            <span style={{ fontSize: 36, fontWeight: 800, color: '#f1f5f9' }}>{overallPct}%</span>
            <span style={{ fontSize: 14, color: '#94a3b8', marginLeft: 8 }}>complete</span>
          </div>
          <div style={{ textAlign: 'right', fontSize: 13, color: '#94a3b8' }}>
            <div><span style={{ color: STATUS_COLORS.done }}>●</span> {summary.done} done</div>
            <div><span style={{ color: STATUS_COLORS.pending }}>●</span> {summary.pending} pending</div>
          </div>
        </div>
        <div style={{ height: 10, background: '#2d2d4e', borderRadius: 5 }}>
          <div style={{
            width: `${overallPct}%`, height: '100%',
            background: `linear-gradient(90deg, #6366f1, #22c55e)`,
            borderRadius: 5, transition: 'width 0.5s'
          }} />
        </div>
      </div>

      {/* Checkpoint */}
      {lastProcessed && (
        <div style={{
          background: '#1a1a2e', border: '1px solid #f59e0b44', borderRadius: 10,
          padding: '12px 16px', marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 12
        }}>
          <span style={{ fontSize: 20 }}>📍</span>
          <div>
            <div style={{ fontSize: 12, color: '#f59e0b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Last checkpoint — restart here if session ends</div>
            <div style={{ fontSize: 14, color: '#f1f5f9', marginTop: 2 }}>{lastProcessed.topic}</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>{lastProcessed.specialty} · {lastProcessed.folder}</div>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['all', 'pending', 'done'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12,
            background: filter === f ? '#6366f1' : '#1a1a2e',
            color: filter === f ? '#fff' : '#94a3b8',
            fontWeight: filter === f ? 600 : 400,
          }}>
            {f === 'all' ? `All (${specialties.length})` : f === 'pending' ? `Pending (${specialties.filter(g => g.done < g.total).length})` : `Done (${specialties.filter(g => g.done === g.total).length})`}
          </button>
        ))}
      </div>

      {/* Specialty list */}
      <div>
        {filtered.map(group => (
          <SpecialtyRow
            key={group.label}
            group={group}
            expanded={!!expanded[group.label]}
            onToggle={() => toggle(group.label)}
          />
        ))}
      </div>

      <p style={{ fontSize: 11, color: '#334155', textAlign: 'center', marginTop: 24 }}>
        {summary.total} total lessons · {specialties.length} specialties
      </p>
    </div>
  )
}
