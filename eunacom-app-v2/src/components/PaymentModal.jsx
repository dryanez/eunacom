import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, CheckCircle2, Loader2, ArrowLeft, BookOpen, Tag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { createCheckoutSession, createPaypalOrder } from '../lib/api';
import { useSubscription } from '../contexts/SubscriptionContext';
import { APP_PLANS, PRODUCTS, TRANSFER, MIN_CHARGE_CLP, fmtClp } from '../config/tienda';

const DAYS = { 1: 30, 3: 90, 6: 180, 12: 365 };
const PLANS = APP_PLANS.map(p => ({
  ...p,
  price: fmtClp(p.price),
  desc: p.includesLibrary
    ? `Curso +650 videos + 10k preguntas + biblioteca completa de libros (${DAYS[p.months]} días)`
    : `Curso +650 videos + 10k preguntas (${DAYS[p.months]} días)`
}));
const BIBLIOTECA = PRODUCTS.biblioteca;

const PaymentModal = ({ onClose }) => {
  const { user } = useAuth();
  const { promo, coupon, setCoupon, upgradeCredit, libraryIncluded } = useSubscription();
  const navigate = useNavigate();
  const location = useLocation();
  const onBooksPage = location.pathname.startsWith('/biblioteca') || location.pathname.startsWith('/libros');
  const [couponInput, setCouponInput] = useState(coupon?.code || '');
  const [couponError, setCouponError] = useState('');
  const [showCouponBox, setShowCouponBox] = useState(!!coupon);
  const credit = upgradeCredit?.amount || 0;
  
  // Read discount from URL or localStorage (30, 40, 50)
  const [couponPercent] = useState(() => {
    try {
      const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const qDiscount = urlParams?.get('discount');
      if (qDiscount && [30, 40, 50].includes(Number(qDiscount))) return Number(qDiscount);
      const stored = localStorage.getItem('eunacom_pending_discount');
      if (stored && [30, 40, 50].includes(Number(stored))) return Number(stored);
    } catch {}
    return 0;
  });
  const socialPercent = coupon?.percent || 0;
  const discountPercent = Math.max(couponPercent, promo?.percent || 0, socialPercent);
  const isPromoDiscount = !!promo && discountPercent === promo.percent;
  const isSocialCoupon = !!coupon && discountPercent === socialPercent && !isPromoDiscount;

  // Mismo cálculo que el servidor (planPricing): descuento mayor y luego el crédito por libros
  const plansToDisplay = React.useMemo(() => {
    return PLANS.map(p => {
      const num = APP_PLANS.find(x => x.id === p.id).price;
      const discounted = discountPercent ? Math.round(num * (1 - discountPercent / 100)) : num;
      const final = credit ? Math.max(MIN_CHARGE_CLP, discounted - credit) : discounted;
      if (final === num) return p;
      return { ...p, oldPrice: p.price, price: fmtClp(final), creditApplied: discounted - final };
    });
  }, [discountPercent, credit]);

  const applyCoupon = () => {
    if (!couponInput.trim()) { setCoupon(null); setCouponError(''); return; }
    const c = setCoupon(couponInput);
    setCouponError(c ? '' : 'Código no válido');
  };

  const [selectedPlanId, setSelectedPlanId] = useState('6m'); // Default 6 months
  const selectedPlan = plansToDisplay.find(p => p.id === selectedPlanId) || plansToDisplay[2];
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

  // In-app PayPal order (charges the promo price). Falls back to the fixed-price PayPal link
  // if the PayPal API isn't configured on the server.
  const handlePaypal = async () => {
    if (!user) {
      setErrorMp("Debes iniciar sesión para suscribirte.");
      return;
    }
    setLoadingMp(true);
    setErrorMp(null);
    try {
      const res = await createPaypalOrder(user.id, selectedPlan.id, coupon?.code);
      if (!res.approve_url) throw new Error('No approve_url');
      window.location.href = res.approve_url;
    } catch (err) {
      console.error(err);
      window.location.href = selectedPlan.paypal;
    }
  };

  const handleMercadoPago = async () => {
    if (!user) {
      setErrorMp("Debes iniciar sesión para suscribirte.");
      return;
    }
    setLoadingMp(true);
    setErrorMp(null);
    try {
      const res = await createCheckoutSession(user.id, selectedPlan.id, couponPercent, coupon?.code);
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
          <div>
            <h2 style={{ fontSize: isMobile ? '1.1rem' : '1.35rem', fontWeight: 800, color: 'var(--surface-50)', margin: 0, fontFamily: 'var(--font)' }}>
              Curso Completo Todo-en-Uno ⭐
            </h2>
            <div style={{ fontSize: isMobile ? '0.72rem' : '0.8rem', color: '#38bdf8', fontWeight: 600, marginTop: '2px' }}>
              +650 Clases en Video (Perfil EUNACOM) + Banco de +10.000 Preguntas
            </div>
          </div>
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
                  fontSize: isMobile ? '0.78rem' : '0.88rem',
                  lineHeight: 1.4
                }}>
                  <strong>Todos los planes</strong> incluyen acceso total e ilimitado al <strong>Curso de +650 Videos</strong>, +10.000 preguntas, reconstrucciones y simulacros.
                </p>
                
                {discountPercent > 0 && (
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(37,99,235,0.2) 0%, rgba(29,78,216,0.3) 100%)',
                    border: '1px solid #3b82f6',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#93c5fd' }}>
                      {isPromoDiscount ? `🔥 ${promo.name}: ${discountPercent}% DCTO${promo.endLabel ? ` hasta el ${promo.endLabel}` : ''}` : isSocialCoupon ? `🏷️ Código ${coupon.code}: ${discountPercent}% DCTO aplicado` : `🏷️ Cupón Exclusivo: ${discountPercent}% DCTO Aplicado`}
                    </span>
                    <span style={{ fontSize: '0.72rem', background: '#2563eb', color: 'white', padding: '2px 8px', borderRadius: '12px', fontWeight: 800 }}>
                      VÁLIDO
                    </span>
                  </div>
                )}

                {credit > 0 && (
                  <div style={{
                    background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.35)', borderRadius: '8px',
                    padding: '8px 12px', marginBottom: '12px', fontSize: '0.78rem', color: '#6ee7b7', fontWeight: 600, lineHeight: 1.4
                  }}>
                    📚 Compraste libros hace poco: te descontamos <strong>{fmtClp(credit)}</strong> del plan
                    {upgradeCredit?.until ? ` (válido hasta el ${new Date(upgradeCredit.until).toLocaleDateString('es-CL')})` : ''}.
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '0.35rem' : '0.75rem' }}>
                  {plansToDisplay.map(plan => (
                    <div
                      key={plan.id}
                      onClick={() => {
                        setSelectedPlanId(plan.id);
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
                        <h4 style={{ margin: 0, fontSize: isMobile ? '0.9rem' : '1.05rem', color: 'var(--surface-50)', fontWeight: 700 }}>
                          {plan.name}
                          {plan.includesLibrary && (
                            <span style={{ marginLeft: 6, fontSize: '0.6rem', fontWeight: 800, color: '#fbbf24', background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.35)', padding: '1px 6px', borderRadius: 6, verticalAlign: 'middle' }}>
                              📚 + LIBROS
                            </span>
                          )}
                        </h4>
                        <p style={{ margin: '0.05rem 0 0 0', fontSize: isMobile ? '0.7rem' : '0.78rem', color: 'var(--surface-400)' }}>{plan.desc}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        {plan.oldPrice && (
                          <div style={{ textDecoration: 'line-through', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
                            {plan.oldPrice}
                          </div>
                        )}
                        <div style={{ fontSize: isMobile ? '0.98rem' : '1.15rem', fontWeight: 800, color: selectedPlan.id === plan.id ? 'var(--accent-blue)' : 'var(--surface-50)' }}>
                          {plan.price}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Código de descuento (SHORTS20) */}
                <div style={{ marginTop: isMobile ? '0.5rem' : '0.9rem' }}>
                  {!showCouponBox ? (
                    <button onClick={() => setShowCouponBox(true)} style={{ background: 'none', border: 'none', color: '#93c5fd', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Tag size={13} /> ¿Tienes un código de descuento?
                    </button>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <input
                          value={couponInput}
                          onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }}
                          onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                          placeholder="Ej: SHORTS20"
                          aria-label="Código de descuento"
                          style={{ flex: 1, minWidth: 0, padding: '0.45rem 0.65rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'var(--surface-600)', color: 'var(--surface-50)', fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.04em' }}
                        />
                        <button onClick={applyCoupon} style={{ padding: '0.45rem 0.8rem', borderRadius: 8, border: 'none', background: 'var(--surface-500)', color: 'white', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
                          Aplicar
                        </button>
                      </div>
                      {couponError && <div style={{ color: '#f87171', fontSize: '0.72rem', marginTop: 4 }}>{couponError}</div>}
                      {coupon && !couponError && discountPercent > socialPercent && (
                        <div style={{ color: 'var(--surface-400)', fontSize: '0.72rem', marginTop: 4 }}>Ya tienes un descuento mayor aplicado; los códigos no se suman.</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Libros como opción secundaria (en /biblioteca el orden es al revés) */}
                {!onBooksPage && !libraryIncluded && (
                  <button
                    onClick={() => { onClose(); navigate('/biblioteca'); }}
                    style={{
                      marginTop: isMobile ? '0.6rem' : '1rem', width: '100%', display: 'flex', alignItems: 'center', gap: '0.6rem',
                      padding: '0.6rem 0.75rem', borderRadius: 10, border: '1px dashed rgba(255,255,255,0.18)', background: 'transparent',
                      color: 'var(--surface-300)', cursor: 'pointer', textAlign: 'left'
                    }}
                  >
                    <BookOpen size={18} style={{ color: '#fbbf24', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.78rem', lineHeight: 1.35 }}>
                      ¿Solo quieres los libros? <strong style={{ color: 'var(--surface-50)' }}>{BIBLIOTECA.name} {fmtClp(BIBLIOTECA.price)}</strong>
                      <span style={{ display: 'block', color: 'var(--surface-400)', fontSize: '0.7rem' }}>21 tomos + reconstrucciones + Libros Gordos, en PDF →</span>
                    </span>
                  </button>
                )}
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
                      onClick={handlePaypal}
                      disabled={loadingMp}
                      style={{
                        width: '100%', padding: '0.75rem', background: '#003087', color: 'white', border: 'none', borderRadius: '8px',
                        fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', marginTop: '0.2rem', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                        transition: 'all 0.2s'
                      }}>
                      Pagar Internacional con PayPal
                    </button>
                    {selectedPlan.oldPrice && (
                      <div style={{ color: 'var(--surface-400)', fontSize: '0.7rem', marginTop: '0.25rem' }}>
                        Si PayPal te muestra el precio sin descuento, paga con Webpay o transferencia, o escríbenos por WhatsApp.
                      </div>
                    )}
                    
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
                        <li><strong>Banco:</strong> {TRANSFER.bank}</li>
                        <li><strong>{TRANSFER.account}:</strong> {TRANSFER.number}</li>
                        <li><strong>Nombre:</strong> {TRANSFER.name}</li>
                        <li><strong>Monto:</strong> {selectedPlan.price}</li>
                      </ul>
                      <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>
                        IMPORTANTE: Envía tu comprobante por WhatsApp al {TRANSFER.whatsapp}.
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
                      onClick={handlePaypal}
                      disabled={loadingMp}
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
