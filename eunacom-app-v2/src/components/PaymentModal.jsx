import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { createCheckoutSession } from '../lib/api';

const PLANS = [
  { id: '1m', name: '1 Mes', price: '$14.990', desc: 'Para repaso rápido', paypal: 'https://www.paypal.com/ncp/payment/KMT3QCWH9M96A' },
  { id: '3m', name: '3 Meses', price: '$34.990', desc: 'Preparación intensiva', paypal: 'https://www.paypal.com/ncp/payment/FJSVXQV45GHWC' },
  { id: '6m', name: '6 Meses', price: '$54.990', desc: 'Estudio con calma', popular: true, paypal: 'https://www.paypal.com/ncp/payment/UE9AAX3JRPS7Y' },
  { id: '1y', name: '1 Año', price: '$89.990', desc: 'Acceso total sin apuros', paypal: 'https://www.paypal.com/ncp/payment/XWTMQC3CJ4V9L' }
];

const PaymentModal = ({ onClose }) => {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState(PLANS[2]); // Default 6 months
  const [step, setStep] = useState(1);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [loadingMp, setLoadingMp] = useState(false);
  const [errorMp, setErrorMp] = useState(null);
  
  // Bolivia QR State
  const [country, setCountry] = useState('CL'); // 'CL' | 'BO'


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
        background: 'rgba(11,17,32,0.85)', backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: isMobile ? '0.35rem' : '1rem',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--surface-700)', borderRadius: 'var(--radius-xl)',
          width: '100%', maxWidth: '800px',
          border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
          overflow: 'hidden', display: 'flex', flexDirection: 'column',
          maxHeight: isMobile ? '82dvh' : '90vh',
          height: isMobile ? '82dvh' : 'auto'
        }}
      >
        {/* Header */}
        <div style={{
          padding: isMobile ? '0.65rem 0.85rem' : '1.25rem 1.75rem',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexShrink: 0
        }}>
          <h2 style={{ fontSize: isMobile ? '1.1rem' : '1.4rem', fontWeight: 800, color: 'var(--surface-50)', margin: 0, fontFamily: 'var(--font)' }}>
            Actualiza a Premium ⭐
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--surface-400)', cursor: 'pointer', padding: '0.25rem' }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {/* Left Side: Plans */}
          {(!isMobile || step === 1) && (
            <div style={{
              flex: '1 1 350px',
              borderRight: isMobile ? 'none' : '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(0,0,0,0.2)',
              display: 'flex', flexDirection: 'column',
              height: '100%', minHeight: 0, overflow: 'hidden'
            }}>
              {/* Scrollable plans section */}
              <div style={{
                flex: 1, minHeight: 0, overflowY: 'auto',
                padding: isMobile ? '0.6rem 0.85rem' : '1.5rem'
              }}>
                <p style={{
                  color: 'var(--surface-300)',
                  marginBottom: isMobile ? '0.45rem' : '1rem',
                  fontSize: isMobile ? '0.78rem' : '0.9rem',
                  lineHeight: 1.35
                }}>
                  Acceso ilimitado a reconstrucciones, clases e IA predictiva.
                </p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '0.35rem' : '0.75rem' }}>
                  {PLANS.map(plan => (
                    <div
                      key={plan.id}
                      onClick={() => {
                        setSelectedPlan(plan);
                        if (isMobile) setStep(2);
                      }}
                      style={{
                        padding: isMobile ? '0.5rem 0.75rem' : '0.85rem',
                        borderRadius: '10px',
                        border: `2px solid ${selectedPlan.id === plan.id ? 'var(--accent-blue)' : 'rgba(255,255,255,0.1)'}`,
                        background: selectedPlan.id === plan.id ? 'rgba(59,130,246,0.18)' : 'var(--surface-600)',
                        cursor: 'pointer', position: 'relative', transition: 'all 0.2s',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        touchAction: 'manipulation'
                      }}
                    >
                      {plan.popular && (
                        <span style={{ position: 'absolute', top: -8, right: 10, background: '#ef4444', color: 'white', fontSize: '0.58rem', padding: '1px 5px', borderRadius: '6px', fontWeight: 800 }}>
                          MÁS POPULAR
                        </span>
                      )}
                      <div>
                        <h4 style={{ margin: 0, fontSize: isMobile ? '0.9rem' : '1.05rem', color: 'var(--surface-50)', fontWeight: 700 }}>{plan.name}</h4>
                        <p style={{ margin: '0.05rem 0 0 0', fontSize: isMobile ? '0.7rem' : '0.78rem', color: 'var(--surface-400)' }}>{plan.desc}</p>
                      </div>
                      <div style={{ fontSize: isMobile ? '0.98rem' : '1.15rem', fontWeight: 800, color: selectedPlan.id === plan.id ? 'var(--accent-blue)' : 'var(--surface-50)' }}>
                        {plan.price}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fixed bottom footer for Continuar al Pago button on mobile */}
              {isMobile && (
                <div style={{
                  padding: '0.5rem 0.85rem',
                  background: 'var(--surface-800)',
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                  flexShrink: 0
                }}>
                  <button
                    onClick={() => setStep(2)}
                    style={{
                      width: '100%', padding: '0.7rem', background: 'var(--accent-blue)', color: 'white',
                      border: 'none', borderRadius: '8px', fontSize: '0.92rem', fontWeight: 800,
                      cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center',
                      boxShadow: '0 4px 12px rgba(59,130,246,0.4)',
                      touchAction: 'manipulation'
                    }}
                  >
                    Continuar al Pago ({selectedPlan.name} · {selectedPlan.price}) →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Right Side: Payment Methods */}
          {(!isMobile || step === 2) && (
            <div style={{
              flex: '1 1 350px',
              padding: isMobile ? '0.75rem 0.85rem' : '1.5rem',
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
              overflowY: 'auto', flex: 1, minHeight: 0
            }}>
              {isMobile && (
                <button
                  onClick={() => setStep(1)}
                  style={{
                    background: 'none', border: 'none', color: 'var(--surface-300)',
                    textAlign: 'left', marginBottom: '0.65rem', fontSize: '0.85rem',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem',
                    padding: 0
                  }}
                >
                  <ArrowLeft size={15} /> Volver a los planes
                </button>
              )}
              
              <h3 style={{ fontSize: '0.98rem', color: 'var(--surface-50)', marginBottom: '0.6rem', marginTop: 0, textAlign: 'center' }}>
                Completar pago: <span style={{ color: 'var(--accent-blue)' }}>{selectedPlan.name} ({selectedPlan.price})</span>
              </h3>

              {/* Selector de País */}
              <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.75rem', background: 'var(--surface-600)', padding: '0.15rem', borderRadius: '8px' }}>
                <button
                  onClick={() => setCountry('CL')}
                  style={{
                    flex: 1, padding: '0.4rem', border: 'none', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                    background: country === 'CL' ? 'var(--surface-500)' : 'transparent',
                    color: country === 'CL' ? 'white' : 'var(--surface-300)'
                  }}
                >
                  🇨🇱 Chile
                </button>
                <button
                  onClick={() => setCountry('BO')}
                  style={{
                    flex: 1, padding: '0.4rem', border: 'none', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                    background: country === 'BO' ? 'var(--surface-500)' : 'transparent',
                    color: country === 'BO' ? 'white' : 'var(--surface-300)'
                  }}
                >
                  🇧🇴 Bolivia / Int.
                </button>
              </div>

              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '0.6rem 0.75rem', borderRadius: '8px', marginBottom: '0.75rem' }}>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#34d399', lineHeight: 1.35, textAlign: 'center' }}>
                  <CheckCircle2 size={15} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '0.3rem' }} />
                  <strong>Activación Inmediata</strong> al finalizar el pago seguro {country === 'CL' ? 'con Webpay o Tarjetas' : 'con Pago Simple / PayPal'}.
                </p>
              </div>

              {country === 'CL' ? (
                <>
                  {/* Mercado Libre */}
                  <div style={{ textAlign: 'center' }}>
                    <button 
                      onClick={handleMercadoPago}
                      disabled={loadingMp}
                      style={{
                        width: '100%', padding: '0.75rem', background: '#009ee3', color: 'white', border: 'none', borderRadius: '8px',
                        fontSize: '0.95rem', fontWeight: 700, cursor: loadingMp ? 'not-allowed' : 'pointer', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                        opacity: loadingMp ? 0.8 : 1, transition: 'all 0.2s'
                      }}>
                      {loadingMp ? <><Loader2 size={16} className="spin" /> Procesando...</> : "Pagar Seguro con Webpay"}
                    </button>

                    <button 
                      onClick={() => {
                        if (!user) {
                          setErrorMp("Debes iniciar sesión para suscribirte.");
                          return;
                        }
                        window.location.href = selectedPlan.paypal;
                      }}
                      style={{
                        width: '100%', padding: '0.75rem', background: '#003087', color: 'white', border: 'none', borderRadius: '8px',
                        fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', marginTop: '0.2rem', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                        transition: 'all 0.2s'
                      }}>
                      Pagar Internacional con PayPal
                    </button>
                    
                    {errorMp && (
                      <div style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '0.35rem' }}>{errorMp}</div>
                    )}
                  </div>

                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '0.75rem 0' }} />

                  {/* Transferencia */}
                  <div>
                    <h4 style={{ margin: '0 0 0.35rem 0', color: 'var(--surface-200)', fontSize: '0.85rem' }}>Transferencia Directa</h4>
                    <div style={{ background: 'var(--surface-600)', padding: '0.65rem 0.75rem', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.2)' }}>
                      <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.78rem', color: 'var(--surface-300)' }}>
                        Puedes transferir directamente <strong>{selectedPlan.price}</strong> a:
                      </p>
                      <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.78rem', color: 'var(--surface-100)', lineHeight: 1.45 }}>
                        <li><strong>Banco:</strong> BancoEstado</li>
                        <li><strong>Cuenta RUT:</strong> 18.842-443-0</li>
                        <li><strong>Nombre:</strong> Felipe Yanez</li>
                        <li><strong>Monto:</strong> {selectedPlan.price}</li>
                      </ul>
                      <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>
                        IMPORTANTE: Envía tu comprobante por WhatsApp al +1 (929) 360-3799.
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Bolivia / Internacional */}
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ color: 'var(--surface-300)', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: 1.45 }}>
                      Para estudiantes de Bolivia y otros países, procesamos los pagos de forma segura a través de <strong>PayPal</strong> en dólares (USD). Solo necesitas una tarjeta habilitada para compras internacionales.
                    </p>
                    <button 
                      onClick={() => {
                        if (!user) {
                          alert("Debes iniciar sesión para suscribirte.");
                          return;
                        }
                        window.location.href = selectedPlan.paypal;
                      }}
                      style={{
                        width: '100%', padding: '0.75rem', background: '#003087', color: 'white', border: 'none', borderRadius: '8px',
                        fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                        transition: 'all 0.2s'
                      }}>
                      Pagar con PayPal (USD)
                    </button>
                  </div>
                </>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
