import React, { useState, useEffect } from 'react';
import {
  Globe, TrendingUp, TrendingDown, Eye, MousePointerClick,
  Sparkles, RefreshCw, ArrowUpRight, Search, BarChart3,
  CheckCircle2, AlertCircle, ExternalLink, Lightbulb, Target,
  ArrowRight, ShieldCheck, Zap
} from 'lucide-react';
import { fetchAdminSeo } from '../lib/api';

export default function AdminSeo({ adminEmail }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [filterPage, setFilterPage] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminSeo(adminEmail);
      setData(res);
    } catch (e) {
      console.error('Error fetching SEO data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [adminEmail]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--surface-400)' }}>
        <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 1rem', display: 'block' }} />
        Cargando métricas de Google Search Console...
      </div>
    );
  }

  const kpis = data?.kpis || { totalClicks: 0, totalImpressions: 0, avgCtr: 0, avgPosition: 0 };
  const timeline = data?.timeline || [];
  const pages = data?.pages || [];
  const queries = data?.queries || [];

  // Filter pages
  const filteredPages = pages.filter(p => {
    if (filterPage === 'top10') return p.position <= 10;
    if (filterPage === 'striking') return p.position > 10 && p.position <= 20;
    return true;
  });

  // Filter queries
  const filteredQueries = queries.filter(q => 
    q.query.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Maximum values for timeline graph scale
  const maxImp = Math.max(...timeline.map(t => t.impressions), 10);
  const maxClicks = Math.max(...timeline.map(t => t.clicks), 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* ── Top Header & Actions ── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(16, 185, 129, 0.05))',
        border: '1px solid rgba(59, 130, 246, 0.25)',
        borderRadius: 'var(--radius)',
        padding: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '1.3rem' }}>🌐</span>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', margin: 0 }}>
              Google Search Console — Rendimiento Orgánico
            </h2>
            <span style={{
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.2rem 0.6rem',
              borderRadius: '999px',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}>
              Conectado (sc-domain:eunacomapp.cl)
            </span>
          </div>
          <p style={{ color: 'var(--surface-300)', fontSize: '0.88rem', margin: 0 }}>
            Monitoreo en tiempo real de clics, impresiones en Google, CTR y posiciones en el ranking de búsqueda.
          </p>
        </div>

        <button
          onClick={loadData}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'var(--surface-700)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'var(--surface-100)',
            padding: '0.6rem 1.1rem',
            borderRadius: 'var(--radius)',
            cursor: 'pointer',
            fontSize: '0.88rem',
            fontWeight: 600
          }}
        >
          <RefreshCw size={15} /> Actualizar
        </button>
      </div>

      {/* ── KPI Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{
          background: 'var(--surface-800)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 'var(--radius)',
          padding: '1.2rem',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--surface-400)', fontSize: '0.8rem', fontWeight: 600 }}>
            <span>CLICS TOTALES (Google)</span>
            <MousePointerClick size={16} color="#38bdf8" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#38bdf8', marginTop: '0.4rem' }}>
            {kpis.totalClicks.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.3rem' }}>
            Visitas directas desde el buscador
          </div>
        </div>

        <div style={{
          background: 'var(--surface-800)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 'var(--radius)',
          padding: '1.2rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--surface-400)', fontSize: '0.8rem', fontWeight: 600 }}>
            <span>IMPRESIONES (Vistas)</span>
            <Eye size={16} color="#a855f7" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#c084fc', marginTop: '0.4rem' }}>
            {kpis.totalImpressions.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.3rem' }}>
            Veces que aparecimos en resultados
          </div>
        </div>

        <div style={{
          background: 'var(--surface-800)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 'var(--radius)',
          padding: '1.2rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--surface-400)', fontSize: '0.8rem', fontWeight: 600 }}>
            <span>CTR PROMEDIO</span>
            <TrendingUp size={16} color="#34d399" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#34d399', marginTop: '0.4rem' }}>
            {kpis.avgCtr}%
          </div>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.3rem' }}>
            Tasa de clics por impresión
          </div>
        </div>

        <div style={{
          background: 'var(--surface-800)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 'var(--radius)',
          padding: '1.2rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--surface-400)', fontSize: '0.8rem', fontWeight: 600 }}>
            <span>POSICIÓN PROMEDIO</span>
            <Target size={16} color="#fbbf24" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fbbf24', marginTop: '0.4rem' }}>
            #{kpis.avgPosition}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.3rem' }}>
            Ranking global en Google Search
          </div>
        </div>
      </div>

      {/* ── Visual Bar Graph: Daily Impressions & Clicks ── */}
      <div style={{
        background: 'var(--surface-800)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 'var(--radius)',
        padding: '1.5rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart3 size={18} color="var(--primary-400)" /> Evolución Diaria de Tráfico (Impresiones vs Clicks)
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--surface-400)' }}>Tendencia últimos 14 días</span>
          </div>

          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: '#a855f7' }} />
              <span style={{ color: 'var(--surface-300)' }}>Impresiones</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: '#38bdf8' }} />
              <span style={{ color: 'var(--surface-300)' }}>Clics</span>
            </div>
          </div>
        </div>

        {/* CSS Bar Chart */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '0.5rem',
          height: '160px',
          paddingTop: '1rem',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          overflowX: 'auto'
        }}>
          {timeline.map((t, idx) => {
            const impHeight = Math.max(8, (t.impressions / maxImp) * 120);
            const clickHeight = Math.max(t.clicks > 0 ? 12 : 0, (t.clicks / maxClicks) * 90);
            const shortDate = t.date ? t.date.slice(5) : '';

            return (
              <div key={idx} style={{ flex: 1, minWidth: '36px', display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '130px' }}>
                  {/* Impressions bar */}
                  <div
                    title={`${t.date}: ${t.impressions} impresiones`}
                    style={{
                      width: '12px',
                      height: `${impHeight}px`,
                      background: 'linear-gradient(to top, #7e22ce, #c084fc)',
                      borderRadius: '3px 3px 0 0',
                      transition: 'height 0.3s ease'
                    }}
                  />
                  {/* Clicks bar */}
                  <div
                    title={`${t.date}: ${t.clicks} clics`}
                    style={{
                      width: '12px',
                      height: `${clickHeight}px`,
                      background: 'linear-gradient(to top, #0284c7, #38bdf8)',
                      borderRadius: '3px 3px 0 0',
                      transition: 'height 0.3s ease'
                    }}
                  />
                </div>
                <span style={{ fontSize: '0.68rem', color: 'var(--surface-400)', marginTop: '0.4rem', whiteSpace: 'nowrap' }}>
                  {shortDate}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Strategic Recommendations Box ── */}
      <div style={{
        background: 'rgba(234, 179, 8, 0.06)',
        border: '1px solid rgba(234, 179, 8, 0.25)',
        borderRadius: 'var(--radius)',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#facc15' }}>
          <Lightbulb size={18} /> Oportunidades de Impacto Inmediato (Quick Wins)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem', fontSize: '0.85rem' }}>
          <div style={{ background: 'var(--surface-800)', padding: '0.85rem', borderRadius: 'var(--radius)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontWeight: 700, color: '#38bdf8', marginBottom: '0.2rem' }}>🎯 Páginas en Top 10 (Pos 6 - 9)</div>
            <p style={{ color: 'var(--surface-300)', margin: 0 }}>
              <code style={{ color: '#34d399' }}>/simulacros-eunacom</code> (#9.0) y <code style={{ color: '#34d399' }}>/curso-eunacom-2026</code> (#8.8) ya están en página 1. Agregar FAQ Schema subirá el CTR de inmediato.
            </p>
          </div>
          <div style={{ background: 'var(--surface-800)', padding: '0.85rem', borderRadius: 'var(--radius)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontWeight: 700, color: '#c084fc', marginBottom: '0.2rem' }}>🔗 Consolidación Canonical www vs no-www</div>
            <p style={{ color: 'var(--surface-300)', margin: 0 }}>
              Google indexa <code style={{ color: '#fbbf24' }}>eunacomapp.cl</code> y <code style={{ color: '#fbbf24' }}>www.eunacomapp.cl</code>. Redirigir al 100% hacia www consolidará la autoridad de dominio.
            </p>
          </div>
        </div>
      </div>

      {/* ── Table: Top Landing Pages ── */}
      <div style={{
        background: 'var(--surface-800)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 'var(--radius)',
        padding: '1.25rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
            📄 Páginas Indexadas y Rendimiento
          </h3>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setFilterPage('all')}
              style={{
                padding: '0.35rem 0.75rem', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 600, border: 'none', cursor: 'pointer',
                background: filterPage === 'all' ? 'var(--primary-600)' : 'var(--surface-700)',
                color: filterPage === 'all' ? '#fff' : 'var(--surface-400)'
              }}
            >
              Todas ({pages.length})
            </button>
            <button
              onClick={() => setFilterPage('top10')}
              style={{
                padding: '0.35rem 0.75rem', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 600, border: 'none', cursor: 'pointer',
                background: filterPage === 'top10' ? '#059669' : 'var(--surface-700)',
                color: filterPage === 'top10' ? '#fff' : 'var(--surface-400)'
              }}
            >
              Top 10 (Página 1)
            </button>
            <button
              onClick={() => setFilterPage('striking')}
              style={{
                padding: '0.35rem 0.75rem', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 600, border: 'none', cursor: 'pointer',
                background: filterPage === 'striking' ? '#d97706' : 'var(--surface-700)',
                color: filterPage === 'striking' ? '#fff' : 'var(--surface-400)'
              }}
            >
              Distancia de Impacto (Pos 11-20)
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'var(--surface-400)', textAlign: 'left' }}>
                <th style={{ padding: '0.6rem 0.8rem' }}>URL / RUTA</th>
                <th style={{ padding: '0.6rem 0.8rem', textAlign: 'center' }}>CLICS</th>
                <th style={{ padding: '0.6rem 0.8rem', textAlign: 'center' }}>IMPRESIONES</th>
                <th style={{ padding: '0.6rem 0.8rem', textAlign: 'center' }}>CTR</th>
                <th style={{ padding: '0.6rem 0.8rem', textAlign: 'center' }}>POSICIÓN</th>
                <th style={{ padding: '0.6rem 0.8rem' }}>RECOMENDACIÓN IA</th>
              </tr>
            </thead>
            <tbody>
              {filteredPages.map((p, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '0.75rem 0.8rem', fontWeight: 600, color: 'var(--surface-100)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span>{p.path}</span>
                      <a href={p.url} target="_blank" rel="noreferrer" style={{ color: 'var(--surface-400)' }}>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem 0.8rem', textAlign: 'center', color: '#38bdf8', fontWeight: 700 }}>
                    {p.clicks}
                  </td>
                  <td style={{ padding: '0.75rem 0.8rem', textAlign: 'center', color: '#c084fc', fontWeight: 700 }}>
                    {p.impressions}
                  </td>
                  <td style={{ padding: '0.75rem 0.8rem', textAlign: 'center', color: '#34d399', fontWeight: 600 }}>
                    {p.ctr}%
                  </td>
                  <td style={{ padding: '0.75rem 0.8rem', textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '0.2rem 0.55rem',
                      borderRadius: '999px',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      background: p.position <= 10 ? 'rgba(16, 185, 129, 0.15)' : (p.position <= 20 ? 'rgba(234, 179, 8, 0.15)' : 'rgba(255,255,255,0.05)'),
                      color: p.position <= 10 ? '#34d399' : (p.position <= 20 ? '#fbbf24' : 'var(--surface-300)')
                    }}>
                      #{p.position}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 0.8rem', color: 'var(--surface-300)', fontSize: '0.8rem' }}>
                    {p.recommendation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Table: Top Search Queries ── */}
      <div style={{
        background: 'var(--surface-800)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 'var(--radius)',
        padding: '1.25rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Search size={16} /> Palabras Clave y Consultas de Búsqueda
          </h3>

          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Filtrar por término..."
            style={{
              padding: '0.4rem 0.75rem',
              background: 'var(--surface-700)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 'var(--radius)',
              color: '#fff',
              fontSize: '0.82rem',
              outline: 'none'
            }}
          />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'var(--surface-400)', textAlign: 'left' }}>
                <th style={{ padding: '0.6rem 0.8rem' }}>CONSULTA DE BÚSQUEDA (Query)</th>
                <th style={{ padding: '0.6rem 0.8rem', textAlign: 'center' }}>CLICS</th>
                <th style={{ padding: '0.6rem 0.8rem', textAlign: 'center' }}>IMPRESIONES</th>
                <th style={{ padding: '0.6rem 0.8rem', textAlign: 'center' }}>CTR</th>
                <th style={{ padding: '0.6rem 0.8rem', textAlign: 'center' }}>POSICIÓN</th>
              </tr>
            </thead>
            <tbody>
              {filteredQueries.map((q, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '0.75rem 0.8rem', fontWeight: 600, color: 'var(--surface-100)' }}>
                    "{q.query}"
                  </td>
                  <td style={{ padding: '0.75rem 0.8rem', textAlign: 'center', color: '#38bdf8', fontWeight: 700 }}>
                    {q.clicks}
                  </td>
                  <td style={{ padding: '0.75rem 0.8rem', textAlign: 'center', color: '#c084fc', fontWeight: 700 }}>
                    {q.impressions}
                  </td>
                  <td style={{ padding: '0.75rem 0.8rem', textAlign: 'center', color: '#34d399', fontWeight: 600 }}>
                    {q.ctr}%
                  </td>
                  <td style={{ padding: '0.75rem 0.8rem', textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '0.2rem 0.55rem',
                      borderRadius: '999px',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      background: q.position <= 10 ? 'rgba(16, 185, 129, 0.15)' : (q.position <= 20 ? 'rgba(234, 179, 8, 0.15)' : 'rgba(255,255,255,0.05)'),
                      color: q.position <= 10 ? '#34d399' : (q.position <= 20 ? '#fbbf24' : 'var(--surface-300)')
                    }}>
                      #{q.position}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
