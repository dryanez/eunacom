import React, { useState, useEffect } from 'react';
import {
  Mail, Send, AlertCircle, CheckCircle2, Clock, Sparkles,
  RefreshCw, Users, ShieldAlert, X,
  Smartphone, Monitor, Eye,
  TrendingUp, Zap, Flame, Target, ShoppingCart, Award, Search, ExternalLink
} from 'lucide-react';
import {
  fetchEmailMarketingStats, triggerMarketingDrip,
  sendTestMarketingEmail, fetchTemplatePreview, sendCampaign
} from '../lib/api';

export default function AdminEmailMarketing({ adminEmail }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [dryRunData, setDryRunData] = useState(null);
  const [runningDrip, setRunningDrip] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);
  const [testSending, setTestSending] = useState(false);
  const [selectedTestType, setSelectedTestType] = useState('discount_30');

  // Preview Modal State
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewType, setPreviewType] = useState('discount_30');
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewDevice, setPreviewDevice] = useState('desktop');

  // Broadcast Composer State
  const [showBroadcastComposer, setShowBroadcastComposer] = useState(false);
  const [broadcastSubject, setBroadcastSubject] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [broadcastSegment, setBroadcastSegment] = useState('all_free');
  const [broadcastSending, setBroadcastSending] = useState(false);

  // Search in Dry Run
  const [sampleSearch, setSampleSearch] = useState('');

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

  const handleOpenPreview = async (type) => {
    setPreviewType(type);
    setPreviewModalOpen(true);
    setPreviewLoading(true);
    try {
      const res = await fetchTemplatePreview(adminEmail, type);
      setPreviewHtml(res.html || '<p>No se pudo generar la vista previa.</p>');
    } catch (err) {
      setPreviewHtml(`<p style="color:red;padding:20px;">Error al cargar plantilla: ${err.message}</p>`);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleRunDrip = async (isDryRun) => {
    setRunningDrip(true);
    setStatusMsg(null);
    try {
      const res = await triggerMarketingDrip(adminEmail, isDryRun);
      if (isDryRun) {
        setDryRunData(res);
        setStatusMsg({ type: 'info', text: `Simulación completada: ${res.summary?.totalFreeUsers || 0} médicos analizados en tiempo real.` });
      } else {
        setStatusMsg({ type: 'success', text: `¡Ciclo ejecutado! Se despacharon ${res.totalDispatched || 0} correos a los alumnos.` });
        loadStats();
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setRunningDrip(false);
    }
  };

  const handleSendTest = async (typeOverride = null) => {
    const type = typeOverride || selectedTestType;
    setTestSending(true);
    setStatusMsg(null);
    try {
      const res = await sendTestMarketingEmail(adminEmail, adminEmail, type);
      if (res.sendResult?.error) {
        throw new Error(res.sendResult.error.message || 'Error al enviar por Resend');
      }
      setStatusMsg({ type: 'success', text: `¡Correo de prueba (${type}) enviado con éxito a ${adminEmail}!` });
      loadStats();
    } catch (err) {
      setStatusMsg({ type: 'error', text: `Error de envío: ${err.message}` });
    } finally {
      setTestSending(false);
    }
  };

  const handleSendBroadcast = async () => {
    if (!broadcastSubject.trim() || !broadcastBody.trim()) {
      alert('Por favor ingresa un asunto y el contenido del mensaje.');
      return;
    }
    setBroadcastSending(true);
    try {
      const targetEmails = [adminEmail];
      await sendCampaign(adminEmail, targetEmails, broadcastSubject, broadcastBody);
      setStatusMsg({ type: 'success', text: `Campaña enviada a ${targetEmails.length} destinatarios.` });
      setShowBroadcastComposer(false);
      setBroadcastSubject('');
      setBroadcastBody('');
      loadStats();
    } catch (err) {
      setStatusMsg({ type: 'error', text: `Error en broadcast: ${err.message}` });
    } finally {
      setBroadcastSending(false);
    }
  };

  const ELITE_ENGINES = [
    { id: 'welcome', type: 'welcome', title: '1. Onboarding de Dopamina', subtitle: 'Diagnóstico Express', trigger: 'Inmediato (Minuto 0)', psychology: 'Completar 15 preguntas aumenta retención 3.4x', benchmark: '65% Apertura', badge: 'Automático', badgeColor: '#10b981', icon: <Sparkles size={20} color="#10b981" />, gradient: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(16,185,129,0.02) 100%)', borderColor: 'rgba(16,185,129,0.25)' },
    { id: 'streak_warning', type: 'streak_warning', title: '2. Alerta Racha en Riesgo', subtitle: 'Loss Aversion', trigger: 'Diario 20:30', psychology: 'Duele 2x perder el récord', benchmark: '58% Apertura', badge: 'Automático', badgeColor: '#f97316', icon: <Flame size={20} color="#f97316" />, gradient: 'linear-gradient(135deg, rgba(249,115,22,0.1) 0%, rgba(249,115,22,0.02) 100%)', borderColor: 'rgba(249,115,22,0.25)' },
    { id: 'weakness_sniper', type: 'weakness_sniper', title: '3. Francotirador Puntos Ciegos', subtitle: 'Algoritmo de fallos', trigger: 'Al detectar 3 fallos', psychology: 'Feedback inmediato 300% mejor', benchmark: '62% Apertura', badge: 'Inteligente', badgeColor: '#06b6d4', icon: <Target size={20} color="#06b6d4" />, gradient: 'linear-gradient(135deg, rgba(6,182,212,0.1) 0%, rgba(6,182,212,0.02) 100%)', borderColor: 'rgba(6,182,212,0.25)' },
    { id: 'joya', type: 'joya', title: '4. Joya EUNACOM del Día', subtitle: 'Click-to-Reveal', trigger: 'Diario 20:00', psychology: 'Multiplica DAU con misterio', benchmark: '48% Apertura', badge: 'IA Autónoma', badgeColor: '#8b5cf6', icon: <Award size={20} color="#8b5cf6" />, gradient: 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(139,92,246,0.02) 100%)', borderColor: 'rgba(139,92,246,0.25)' },
    { id: 'weekly_digest', type: 'weekly_digest', title: '5. Domingo de Rendimiento', subtitle: 'Semáforo semanal', trigger: 'Domingos 20:00', psychology: 'Prueba social y planificación', benchmark: '56% Apertura', badge: 'Programado', badgeColor: '#3b82f6', icon: <TrendingUp size={20} color="#3b82f6" />, gradient: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(59,130,246,0.02) 100%)', borderColor: 'rgba(59,130,246,0.25)' },
    { id: 'cart_abandonment', type: 'cart_abandonment', title: '6. Recuperación Carrito', subtitle: 'Soporte humano', trigger: '45m tras abandono', psychology: 'Cero fricción en checkout', benchmark: '45% Apertura', badge: 'Conversión', badgeColor: '#ec4899', icon: <ShoppingCart size={20} color="#ec4899" />, gradient: 'linear-gradient(135deg, rgba(236,72,153,0.1) 0%, rgba(236,72,153,0.02) 100%)', borderColor: 'rgba(236,72,153,0.25)' },
    { id: 'discount_ladder', type: 'discount_30', title: '7. Escalera de Retención', subtitle: '30% → 40% → 50%', trigger: 'Día 7, 14, 21', psychology: 'Reason-Why (Becas)', benchmark: '38% Apertura', badge: 'Embudo', badgeColor: '#eab308', icon: <Zap size={20} color="#eab308" />, gradient: 'linear-gradient(135deg, rgba(234,179,8,0.1) 0%, rgba(234,179,8,0.02) 100%)', borderColor: 'rgba(234,179,8,0.25)' },
    { id: 'exam_countdown', type: 'exam_countdown', title: '8. Cuenta Regresiva', subtitle: 'Urgencia T-30', trigger: 'A 30, 14, 7 días', psychology: 'La resistencia al pago se desploma', benchmark: '52% Apertura', badge: 'Estacional', badgeColor: '#6366f1', icon: <Clock size={20} color="#6366f1" />, gradient: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(99,102,241,0.02) 100%)', borderColor: 'rgba(99,102,241,0.25)' }
  ];

  if (loading) return <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>Cargando Centro de Mando...</div>;

  const eligible = stats?.eligible || { totalFree: 0, week1_30: 0, week2_40: 0, week3_50: 0 };
  const logs = stats?.logs || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', width: '100%' }}>
      {/* Executive Header */}
      <div style={{ background: '#111827', borderRadius: '16px', padding: '1.75rem', border: '1px solid #374151', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', color: '#fff', margin: 0 }}>Email Marketing & Retención Médica</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Daemon de retención para {eligible.totalFree} médicos activos.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => setShowBroadcastComposer(!showBroadcastComposer)} style={{ padding: '0.6rem 1rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Broadcast</button>
          <button onClick={() => handleRunDrip(true)} style={{ padding: '0.6rem 1rem', background: '#374151', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Simular</button>
        </div>
      </div>

      {statusMsg && (
        <div style={{ padding: '1rem', background: 'rgba(59,130,246,0.1)', border: '1px solid #3b82f6', borderRadius: '8px', color: '#93c5fd' }}>
          {statusMsg.text}
        </div>
      )}

      {showBroadcastComposer && (
        <div style={{ background: '#0f172a', padding: '1.5rem', borderRadius: '12px', border: '1px solid #3b82f6' }}>
          <input type="text" value={broadcastSubject} onChange={(e) => setBroadcastSubject(e.target.value)} placeholder="Asunto..." style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem' }} />
          <textarea value={broadcastBody} onChange={(e) => setBroadcastBody(e.target.value)} placeholder="Contenido..." style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem' }} rows={4} />
          <button onClick={handleSendBroadcast} disabled={broadcastSending} style={{ padding: '0.6rem', background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: '6px' }}>Despachar</button>
        </div>
      )}

      {/* Metrics Ribbon */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        {[ {title: 'Libres', val: eligible.totalFree}, {title: 'S1 30%', val: eligible.week1_30}, {title: 'S2 40%', val: eligible.week2_40}, {title: 'S3 50%', val: eligible.week3_50} ].map(m => (
          <div key={m.title} style={{ background: '#111827', padding: '1rem', borderRadius: '12px', border: '1px solid #374151' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.7rem' }}>{m.title}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>{m.val}</div>
          </div>
        ))}
      </div>

      {/* Engines Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1rem' }}>
        {ELITE_ENGINES.map((e) => (
          <div key={e.id} style={{ background: e.gradient, padding: '1.25rem', borderRadius: '12px', border: `1px solid ${e.borderColor}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {e.icon}
              <button onClick={() => handleOpenPreview(e.type)} style={{ fontSize: '0.7rem' }}>Ver</button>
            </div>
            <h4 style={{ color: '#fff', margin: '0.5rem 0' }}>{e.title}</h4>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{e.psychology}</p>
          </div>
        ))}
      </div>

      {/* History Table */}
      <div style={{ background: '#111827', borderRadius: '16px', padding: '1.5rem', border: '1px solid #374151' }}>
        <h3 style={{ color: '#fff', margin: '0 0 1rem' }}>Historial</h3>
        <table style={{ width: '100%', color: '#d1d5db', fontSize: '0.85rem' }}>
          <thead><tr style={{ textAlign: 'left', borderBottom: '1px solid #374151' }}><th>Tipo</th><th>Correo</th><th>Asunto</th><th>Fecha</th></tr></thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} style={{ borderBottom: '1px solid #1f2937' }}>
                <td style={{ padding: '0.5rem' }}>{l.campaign_type}</td>
                <td style={{ padding: '0.5rem' }}>{l.email}</td>
                <td style={{ padding: '0.5rem' }}>{l.subject}</td>
                <td style={{ padding: '0.5rem' }}>{l.sent_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Preview Modal */}
      {previewModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', width: '80%', height: '80vh', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '1rem', background: '#eee', display: 'flex', justifyContent: 'space-between' }}>
              <span>Preview</span>
              <button onClick={() => setPreviewModalOpen(false)}>Cerrar</button>
            </div>
            <iframe srcDoc={previewHtml} style={{ width: '100%', height: '100%' }} />
          </div>
        </div>
      )}
    </div>
  );
}
