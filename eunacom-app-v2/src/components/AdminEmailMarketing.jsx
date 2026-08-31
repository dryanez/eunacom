import React, { useState, useEffect } from 'react';
import {
  Mail, Send, AlertCircle, CheckCircle2, Clock, Sparkles,
  RefreshCw, Users, ShieldAlert, ArrowRight, Play, Eye
} from 'lucide-react';
import { fetchEmailMarketingStats, triggerMarketingDrip, sendTestMarketingEmail } from '../lib/api';

export default function AdminEmailMarketing({ adminEmail }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [dryRunData, setDryRunData] = useState(null);
  const [runningDrip, setRunningDrip] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);
  const [testSending, setTestSending] = useState(false);
  const [selectedTestType, setSelectedTestType] = useState('discount_30');

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await fetchEmailMarketingStats(adminEmail);
      setStats(data);
    } catch (e) {
      console.error('Error loading email marketing stats:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [adminEmail]);

  const handleRunDrip = async (isDryRun) => {
    setRunningDrip(true);
    setStatusMsg(null);
    try {
      const res = await triggerMarketingDrip(adminEmail, isDryRun);
      if (isDryRun) {
        setDryRunData(res);
        setStatusMsg({ type: 'info', text: `Simulación completada: ${res.summary?.totalFreeUsers || 0} médicos evaluados.` });
      } else {
        setStatusMsg({ type: 'success', text: `¡Ciclo ejecutado! Se despacharon ${res.totalDispatched || 0} correos.` });
        loadStats();
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setRunningDrip(false);
    }
  };

  const handleSendTest = async () => {
    setTestSending(true);
    setStatusMsg(null);
    try {
      const res = await sendTestMarketingEmail(adminEmail, adminEmail, selectedTestType);
      if (res.sendResult?.error) {
        throw new Error(res.sendResult.error.message || 'Error al enviar por Resend');
      }
      setStatusMsg({ type: 'success', text: `Correo de prueba (${selectedTestType}) enviado con éxito a ${adminEmail}!` });
      loadStats();
    } catch (err) {
      setStatusMsg({ type: 'error', text: `Error de envío: ${err.message}` });
    } finally {
      setTestSending(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--surface-400)' }}>
        <RefreshCw className="animate-spin" size={24} style={{ margin: '0 auto 1rem' }} />
        <p>Cargando métricas de Email Marketing...</p>
      </div>
    );
  }

  const counts = stats?.counts || {};
  const eligible = stats?.eligible || { totalFree: 0, week1_30: 0, week2_40: 0, week3_50: 0 };
  const logs = stats?.logs || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header & Actions */}
      <div style={{
        background: 'var(--surface-700)', borderRadius: 'var(--radius)', padding: '1.5rem',
        border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexWrap: 'wrap',
        justifyContent: 'space-between', alignItems: 'center', gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Mail size={22} style={{ color: 'var(--accent-blue)' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--surface-50)', margin: 0 }}>
              Email Marketing & Retención Automatizada
            </h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--surface-400)', margin: 0 }}>
            Los 7 Motores de Email Marketing Médico para EUNACOM App (Onboarding, Retención, Joya Diaria y Urgencia).
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleRunDrip(true)}
            disabled={runningDrip}
            style={{
              padding: '0.55rem 1rem', background: 'var(--surface-600)',
              border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px',
              fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}
          >
            <Eye size={16} /> Simular Embudo (Dry Run)
          </button>

          <button
            onClick={() => {
              if (confirm('¿Estás seguro de disparar los correos de retención a todos los médicos elegibles ahora?')) {
                handleRunDrip(false);
              }
            }}
            disabled={runningDrip}
            style={{
              padding: '0.55rem 1rem', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              border: 'none', color: '#fff', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
              boxShadow: '0 4px 12px rgba(37,99,235,0.3)'
            }}
          >
            <Play size={16} /> Ejecutar Ciclo Ahora
          </button>

          <button
            onClick={loadStats}
            style={{
              padding: '0.55rem 0.75rem', background: 'var(--surface-600)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'var(--surface-200)', borderRadius: '8px', cursor: 'pointer'
            }}
            title="Recargar métricas"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {statusMsg && (
        <div style={{
          padding: '0.85rem 1.25rem', borderRadius: '8px', fontSize: '0.88rem',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          background: statusMsg.type === 'success' ? 'rgba(34,197,94,0.15)' : statusMsg.type === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(59,130,246,0.15)',
          border: `1px solid ${statusMsg.type === 'success' ? '#22c55e' : statusMsg.type === 'error' ? '#ef4444' : '#3b82f6'}`,
          color: statusMsg.type === 'success' ? '#86efac' : statusMsg.type === 'error' ? '#fca5a5' : '#93c5fd'
        }}>
          {statusMsg.type === 'success' ? <CheckCircle2 size={18} /> : statusMsg.type === 'error' ? <ShieldAlert size={18} /> : <AlertCircle size={18} />}
          {statusMsg.text}
        </div>
      )}

      {/* Funnel Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        <div style={{ background: 'var(--surface-700)', padding: '1.2rem', borderRadius: 'var(--radius)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--surface-400)', fontWeight: 700, textTransform: 'uppercase' }}>Médicos No-Premium</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--surface-50)', marginTop: '0.25rem' }}>{eligible.totalFree}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--surface-400)', marginTop: '0.25rem' }}>Cuentas gratuitas activas</div>
        </div>

        <div style={{ background: 'var(--surface-700)', padding: '1.2rem', borderRadius: 'var(--radius)', border: '1px solid rgba(59,130,246,0.3)', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ fontSize: '0.78rem', color: '#93c5fd', fontWeight: 700, textTransform: 'uppercase' }}>Semana 1 · 30% DCTO</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#3b82f6', marginTop: '0.25rem' }}>{eligible.week1_30}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--surface-400)', marginTop: '0.25rem' }}>Día 7 a 13 desde registro</div>
        </div>

        <div style={{ background: 'var(--surface-700)', padding: '1.2rem', borderRadius: 'var(--radius)', border: '1px solid rgba(168,85,247,0.3)', borderLeft: '4px solid #a855f7' }}>
          <div style={{ fontSize: '0.78rem', color: '#d8b4fe', fontWeight: 700, textTransform: 'uppercase' }}>Semana 2 · 40% DCTO</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#a855f7', marginTop: '0.25rem' }}>{eligible.week2_40}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--surface-400)', marginTop: '0.25rem' }}>Día 14 a 20 desde registro</div>
        </div>

        <div style={{ background: 'var(--surface-700)', padding: '1.2rem', borderRadius: 'var(--radius)', border: '1px solid rgba(239,68,68,0.3)', borderLeft: '4px solid #ef4444' }}>
          <div style={{ fontSize: '0.78rem', color: '#fca5a5', fontWeight: 700, textTransform: 'uppercase' }}>Semana 3+ · 50% DCTO</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ef4444', marginTop: '0.25rem' }}>{eligible.week3_50}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--surface-400)', marginTop: '0.25rem' }}>Último push (&gt;21 días)</div>
        </div>

        <div style={{ background: 'var(--surface-700)', padding: '1.2rem', borderRadius: 'var(--radius)', border: '1px solid rgba(249,115,22,0.3)', borderLeft: '4px solid #f97316' }}>
          <div style={{ fontSize: '0.78rem', color: '#fdba74', fontWeight: 700, textTransform: 'uppercase' }}>🔥 Rachas en Riesgo</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f97316', marginTop: '0.25rem' }}>{eligible.streakWarning || 0}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--surface-400)', marginTop: '0.25rem' }}>Racha ≥3 días sin test hoy</div>
        </div>
      </div>

      {/* Directory of the 7 Elite Engines */}
      <div style={{
        background: 'var(--surface-700)', borderRadius: 'var(--radius)', padding: '1.5rem',
        border: '1px solid rgba(255,255,255,0.06)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--surface-50)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={18} style={{ color: '#f59e0b' }} /> Los 7 Motores de Email Marketing & Retención
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--surface-400)', margin: '0.25rem 0 0' }}>
              Arquitectura de campañas inspirada en UWorld, Amboss y Duolingo para maximizar DAU y conversión.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {ELITE_ENGINES.map((engine) => (
            <div
              key={engine.id}
              style={{
                background: 'var(--surface-800)', borderRadius: '10px', padding: '1rem',
                border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column',
                justifyContent: 'space-between', gap: '0.75rem', position: 'relative'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.3rem' }}>{engine.icon}</span>
                  <span style={{
                    fontSize: '0.68rem', fontWeight: 800, padding: '2px 8px', borderRadius: '10px',
                    background: `${engine.badgeColor}22`, color: engine.badgeColor, border: `1px solid ${engine.badgeColor}44`,
                    textTransform: 'uppercase'
                  }}>
                    {engine.badge}
                  </span>
                </div>
                <div style={{ fontWeight: 700, color: 'var(--surface-100)', fontSize: '0.92rem' }}>
                  {engine.title}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#93c5fd', marginTop: '2px' }}>
                  {engine.subtitle}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--surface-400)', marginTop: '6px', lineHeight: 1.4 }}>
                  <strong>Trigger:</strong> {engine.trigger}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--surface-500)', marginTop: '4px', fontStyle: 'italic', lineHeight: 1.3 }}>
                  💡 {engine.psychology}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.6rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '0.72rem', color: '#86efac', fontWeight: 600 }}>
                  📈 {engine.benchmark}
                </span>
                <button
                  onClick={() => handleSendSpecificTest(engine.type)}
                  disabled={testSending}
                  style={{
                    padding: '0.35rem 0.65rem', background: 'var(--surface-700)', border: '1px solid rgba(255,255,255,0.12)',
                    color: '#fff', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '0.3rem'
                  }}
                  title="Enviar correo de prueba a tu buzón"
                >
                  <Send size={12} /> Probar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Test Email Dispatcher Card */}
      <div style={{
        background: 'var(--surface-700)', borderRadius: 'var(--radius)', padding: '1.25rem',
        border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexWrap: 'wrap',
        alignItems: 'center', justifyContent: 'space-between', gap: '1rem'
      }}>
        <div>
          <div style={{ fontWeight: 700, color: 'var(--surface-100)', fontSize: '0.95rem' }}>
            🧪 Probador Universal de Plantillas en tu Buzón
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--surface-400)', marginTop: '2px' }}>
            Envía una copia de prueba a <strong>{adminEmail}</strong> para auditar la experiencia en tu teléfono o PC.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <select
            value={selectedTestType}
            onChange={e => setSelectedTestType(e.target.value)}
            style={{
              padding: '0.5rem 0.75rem', background: 'var(--surface-600)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff', borderRadius: '6px', fontSize: '0.85rem'
            }}
          >
            <option value="welcome">1. Onboarding · Bienvenida + Diagnóstico (10 preg)</option>
            <option value="streak_warning">2. Racha en Riesgo · Loss Aversion (3 Días)</option>
            <option value="weakness_sniper">3. Francotirador · Duda Clínica en Cardiología</option>
            <option value="joya">4. Joya del Día · Micro-Newsletter Click-to-Reveal</option>
            <option value="weekly_digest">5. Domingo de Rendimiento · Semáforo & Ranking</option>
            <option value="cart_abandonment">6. Carrito Abandonado · Asistencia WhatsApp</option>
            <option value="discount_30">7a. Retención 30% OFF · Beca Bienvenida (Día 7)</option>
            <option value="discount_40">7b. Retención 40% OFF · Plan Flex Turnos (Día 14)</option>
            <option value="discount_50">7c. Retención 50% OFF · Subsidio Emergencia (Día 21+)</option>
            <option value="exam_countdown">8. Cuenta Regresiva · T-30 Días EUNACOM</option>
          </select>

          <button
            onClick={handleSendTest}
            disabled={testSending}
            style={{
              padding: '0.5rem 1rem', background: 'var(--accent-blue)', color: '#fff',
              border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '0.85rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}
          >
            <Send size={15} /> {testSending ? 'Enviando...' : 'Enviar Prueba'}
          </button>
        </div>
      </div>

      {/* Dry Run Details (if simulated) */}
      {dryRunData && (
        <div style={{
          background: 'var(--surface-800)', borderRadius: 'var(--radius)', padding: '1.25rem',
          border: '1px solid rgba(59,130,246,0.3)'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#93c5fd', margin: '0 0 0.75rem' }}>
            📋 Muestra de Destinatarios de la Simulación
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div>
              <strong style={{ fontSize: '0.82rem', color: '#3b82f6' }}>Semana 1 (30% DCTO):</strong>
              <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {dryRunData.samples?.week1_30?.map((s, i) => (
                  <div key={i} style={{ fontSize: '0.78rem', color: 'var(--surface-300)', background: 'var(--surface-700)', padding: '4px 8px', borderRadius: '4px' }}>
                    {s.email} ({s.name || 'Sin nombre'}) · Hace {s.days} días
                  </div>
                ))}
              </div>
            </div>

            <div>
              <strong style={{ fontSize: '0.82rem', color: '#a855f7' }}>Semana 2 (40% DCTO):</strong>
              <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {dryRunData.samples?.week2_40?.map((s, i) => (
                  <div key={i} style={{ fontSize: '0.78rem', color: 'var(--surface-300)', background: 'var(--surface-700)', padding: '4px 8px', borderRadius: '4px' }}>
                    {s.email} ({s.name || 'Sin nombre'}) · Hace {s.days} días
                  </div>
                ))}
              </div>
            </div>

            <div>
              <strong style={{ fontSize: '0.82rem', color: '#ef4444' }}>Semana 3 (50% DCTO):</strong>
              <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {dryRunData.samples?.week3_50?.map((s, i) => (
                  <div key={i} style={{ fontSize: '0.78rem', color: 'var(--surface-300)', background: 'var(--surface-700)', padding: '4px 8px', borderRadius: '4px' }}>
                    {s.email} ({s.name || 'Sin nombre'}) · Hace {s.days} días
                  </div>
                ))}
              </div>
            </div>

            <div>
              <strong style={{ fontSize: '0.82rem', color: '#f97316' }}>🔥 Racha en Riesgo (≥3 días):</strong>
              <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {dryRunData.samples?.streak_warning?.map((s, i) => (
                  <div key={i} style={{ fontSize: '0.78rem', color: 'var(--surface-300)', background: 'var(--surface-700)', padding: '4px 8px', borderRadius: '4px' }}>
                    {s.email} ({s.name || 'Colega'}) · Racha: {s.streak} días
                  </div>
                ))}
                {(!dryRunData.samples?.streak_warning || dryRunData.samples?.streak_warning?.length === 0) && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--surface-400)', fontStyle: 'italic' }}>
                    No hay rachas en riesgo pendientes de aviso hoy.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History of Sent Campaigns */}
      <div style={{
        background: 'var(--surface-700)', borderRadius: 'var(--radius)', padding: '1.25rem',
        border: '1px solid rgba(255,255,255,0.06)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--surface-50)', margin: 0 }}>
            📜 Registro de Envíos Recientes
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--surface-400)' }}>
            Últimos {logs.length} envíos
          </span>
        </div>

        {logs.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--surface-400)', fontSize: '0.85rem' }}>
            No hay registros de envíos aún en <code>email_campaign_logs</code>.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', textAlign: 'left', color: 'var(--surface-400)' }}>
                  <th style={{ padding: '0.5rem 0.75rem' }}>Tipo Campaña</th>
                  <th style={{ padding: '0.5rem 0.75rem' }}>Destinatario</th>
                  <th style={{ padding: '0.5rem 0.75rem' }}>Asunto</th>
                  <th style={{ padding: '0.5rem 0.75rem' }}>Fecha de Envío</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  let badgeColor = '#3b82f6';
                  let badgeLabel = log.campaign_type;
                  if (log.campaign_type === 'welcome') { badgeColor = '#10b981'; badgeLabel = 'Bienvenida'; }
                  else if (log.campaign_type === 'discount_30') { badgeColor = '#3b82f6'; badgeLabel = '30% OFF'; }
                  else if (log.campaign_type === 'discount_40') { badgeColor = '#a855f7'; badgeLabel = '40% OFF'; }
                  else if (log.campaign_type === 'discount_50') { badgeColor = '#ef4444'; badgeLabel = '50% OFF'; }
                  else if (log.campaign_type === 'streak_warning') { badgeColor = '#f97316'; badgeLabel = '🔥 Racha en Riesgo'; }
                  else if (log.campaign_type === 'joya_daily') { badgeColor = '#f59e0b'; badgeLabel = 'Joya del Día'; }

                  return (
                    <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '0.6rem 0.75rem' }}>
                        <span style={{
                          fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px',
                          background: `${badgeColor}22`, color: badgeColor, border: `1px solid ${badgeColor}44`,
                          fontWeight: 700
                        }}>
                          {badgeLabel}
                        </span>
                      </td>
                      <td style={{ padding: '0.6rem 0.75rem', color: 'var(--surface-200)' }}>
                        {log.email}
                      </td>
                      <td style={{ padding: '0.6rem 0.75rem', color: 'var(--surface-300)' }}>
                        {log.subject}
                      </td>
                      <td style={{ padding: '0.6rem 0.75rem', color: 'var(--surface-400)', whiteSpace: 'nowrap' }}>
                        {log.sent_at}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
