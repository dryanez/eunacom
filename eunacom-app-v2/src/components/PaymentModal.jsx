import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { createCheckoutSession } from '../lib/api';

const PLANS = [
  { id: '1m', name: '1 Mes', price: '$14.990', desc: 'Para repaso rápido' },
  { id: '3m', name: '3 Meses', price: '$34.990', desc: 'Preparación intensiva' },
  { id: '6m', name: '6 Meses', price: '$54.990', desc: 'Estudio con calma', popular: true },
  { id: '1y', name: '1 Año', price: '$89.990', desc: 'Acceso total sin apuros' }
];

const PaymentModal = ({ onClose }) => {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState(PLANS[2]); // Default 6 months
  const [step, setStep] = useState(1);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [loadingMp, setLoadingMp] = useState(false);
  const [errorMp, setErrorMp] = useState(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMercadoPago = async () => {
    if (!user) {
      setErrorMp("Debes iniciar sesión para suscribirte.");
      return;
    }
    setLoadingMp(true);
    setErrorMp(null);
    try {
      const res = await createCheckoutSession(user.id, selectedPlan.id);
      if (res.init_point) {
        window.location.href = res.init_point;
      } else {
        throw new Error("No se pudo obtener el link de pago.");
      }
    } catch (err) {
      console.error(err);
      setErrorMp("Ocurrió un error al procesar el pago. Inténtalo de nuevo.");
      setLoadingMp(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(11,17,32,0.8)', backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--surface-700)', borderRadius: 'var(--radius-xl)',
          width: '100%', maxWidth: '800px',
          border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
          overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh'
        }}
      >
        {/* Header */}
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--surface-50)', margin: 0, fontFamily: 'var(--font)' }}>
            Actualiza a Premium ⭐
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--surface-400)', cursor: 'pointer', padding: '0.5rem' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', overflowY: 'auto' }}>
          {/* Left Side: Plans */}
          {(!isMobile || step === 1) && (
            <div style={{ flex: '1 1 350px', padding: '2rem', borderRight: isMobile ? 'none' : '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.2)' }}>
              <p style={{ color: 'var(--surface-300)', marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: 1.5 }}>
                Desbloquea el acceso ilimitado a todas las reconstrucciones interactivas, clases, resúmenes y nuestra IA predictiva.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {PLANS.map(plan => (
                  <div
                    key={plan.id}
                    onClick={() => {
                      setSelectedPlan(plan);
                      if (isMobile) setStep(2);
                    }}
                    style={{
                      padding: '1rem', borderRadius: '12px', border: `2px solid ${selectedPlan.id === plan.id ? 'var(--accent-blue)' : 'rgba(255,255,255,0.1)'}`,
                      background: selectedPlan.id === plan.id ? 'rgba(59,130,246,0.1)' : 'var(--surface-600)',
                      cursor: 'pointer', position: 'relative', transition: 'all 0.2s',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}
                  >
                    {plan.popular && (
                      <span style={{ position: 'absolute', top: -10, right: 15, background: '#ef4444', color: 'white', fontSize: '0.65rem', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>
                        MÁS POPULAR
                      </span>
                    )}
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--surface-50)', fontWeight: 700 }}>{plan.name}</h4>
                      <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--surface-400)' }}>{plan.desc}</p>
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: selectedPlan.id === plan.id ? 'var(--accent-blue)' : 'var(--surface-50)' }}>
                      {plan.price}
                    </div>
                  </div>
                ))}
              </div>
              
              {isMobile && (
                <button
                  onClick={() => setStep(2)}
                  style={{
                    width: '100%', padding: '1rem', background: 'var(--accent-blue)', color: 'white',
                    border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 700,
                    marginTop: '1.5rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center'
                  }}
                >
                  Continuar al Pago
                </button>
              )}
            </div>
          )}

          {/* Right Side: Payment Methods */}
          {(!isMobile || step === 2) && (
            <div style={{ flex: '1 1 350px', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {isMobile && (
                <button
                  onClick={() => setStep(1)}
                  style={{
                    background: 'none', border: 'none', color: 'var(--surface-300)',
                    textAlign: 'left', marginBottom: '1.5rem', fontSize: '0.95rem',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem'
                  }}
                >
                  <ArrowLeft size={18} /> Volver a los planes
                </button>
              )}
              
              <h3 style={{ fontSize: '1.1rem', color: 'var(--surface-50)', marginBottom: '1rem', marginTop: 0, textAlign: 'center' }}>
                Completar pago: <span style={{ color: 'var(--accent-blue)' }}>{selectedPlan.name}</span>
              </h3>

              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#34d399', lineHeight: 1.5, textAlign: 'center' }}>
                  <CheckCircle2 size={18} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '0.5rem' }} />
                  <strong>Activación Inmediata</strong> al finalizar el pago seguro con Webpay o Tarjetas.
                </p>
              </div>

              {/* Mercado Libre */}
              <div style={{ textAlign: 'center' }}>
                <button 
                  onClick={handleMercadoPago}
                  disabled={loadingMp}
                  style={{
                    width: '100%', padding: '1rem', background: '#009ee3', color: 'white', border: 'none', borderRadius: '8px',
                    fontSize: '1.1rem', fontWeight: 700, cursor: loadingMp ? 'not-allowed' : 'pointer', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    opacity: loadingMp ? 0.8 : 1, transition: 'all 0.2s'
                  }}>
                  {loadingMp ? <><Loader2 size={18} className="spin" /> Procesando...</> : "Pagar Seguro con Webpay"}
                </button>
                {errorMp && (
                  <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.5rem' }}>{errorMp}</div>
                )}
              </div>

              <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '1.5rem 0' }} />

              {/* Transferencia */}
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--surface-200)', fontSize: '0.95rem' }}>Transferencia Directa (Solo Chile)</h4>
                <div style={{ background: 'var(--surface-600)', padding: '1rem', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.2)' }}>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--surface-300)' }}>
                    Puedes transferir directamente <strong>{selectedPlan.price}</strong> a:
                  </p>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--surface-100)', lineHeight: 1.6 }}>
                    <li><strong>Banco:</strong> BancoEstado</li>
                    <li><strong>Cuenta RUT:</strong> 18.842-443-0</li>
                    <li><strong>Nombre:</strong> Felipe Yanez</li>
                    <li><strong>Monto:</strong> {selectedPlan.price}</li>
                  </ul>
                  <p style={{ margin: '0.75rem 0 0 0', fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>
                    IMPORTANTE: Al transferir, debes enviar tu comprobante por WhatsApp al +1 (929) 360-3799 para activación manual.
                  </p>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
