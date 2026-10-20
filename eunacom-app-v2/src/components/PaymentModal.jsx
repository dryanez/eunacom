import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, CheckCircle2, BookOpen, Tag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { createCheckoutSession, createPaypalOrder } from '../lib/api';
import { useSubscription } from '../contexts/SubscriptionContext';
import { APP_PLANS, PRODUCTS, TRANSFER, MIN_CHARGE_CLP, TOMOS, EXTRAS, fmtClp, creditApplies, looseValue } from '../config/tienda';
import PayButtons from './PayButtons';
import '../styles/tienda.css';

const DAYS = { 1: 30, 3: 90, 6: 180, 12: 365 };
const PLANS = APP_PLANS.map(p => ({ ...p, price: fmtClp(p.price), days: DAYS[p.months] }));
const BIBLIOTECA = PRODUCTS.biblioteca;
const LIB_COVERS = [TOMOS[0].cover, TOMOS[17].cover, EXTRAS[3].cover, EXTRAS[0].cover, EXTRAS[1].cover, EXTRAS[2].cover, EXTRAS[4].cover];
const LIB_ITEMS = [
  { n: '21', t: 'Tomos AEE', d: 'Toda la teoría del Perfil V3, especialidad por especialidad, con algoritmos y tablas.' },
  { n: '16', t: 'EUNACOM reconstruidos', d: 'Gran Libro de Reconstrucciones 2013–2025: 2.739 preguntas reales con explicación.' },
  { n: '23', t: 'Libros Gordos', d: 'El Gran Libro Gordo + 22 libros de 90 preguntas por tema.' },
  { n: '21', t: 'Repaso Final', d: 'Un libro de repaso por especialidad: lo que más se pregunta, para la última semana.' },
  { n: '1.569', t: 'Códigos explicados', d: 'Perfil V3 código por código: qué te pueden preguntar de cada uno.' },
  { n: '86', t: 'Imágenes de dermatología', d: 'Atlas comentado: lo que hay que reconocer en cada foto.' },
];

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
      const final = credit && creditApplies(p.id) ? Math.max(MIN_CHARGE_CLP, discounted - credit) : discounted;
      // Precio tachado: sin promo, lo que costaría pagando mes a mes (el ahorro real del plan largo)
      const monthly = APP_PLANS[0].price * p.months;
      const anchor = final !== num ? num : (p.months > 1 ? monthly : null);
      const save = anchor ? Math.round((1 - final / anchor) * 100) : 0;
      return { ...p, oldPrice: anchor ? fmtClp(anchor) : null, anchorIsMonthly: final === num && !!anchor, price: fmtClp(final), save, creditApplied: discounted - final };
    });
  }, [discountPercent, credit]);

  const applyCoupon = () => {
    if (!couponInput.trim()) { setCoupon(null); setCouponError(''); return; }
    const c = setCoupon(couponInput);
    setCouponError(c ? '' : 'Código no válido');
  };

  const [selectedPlanId, setSelectedPlanId] = useState('6m'); // Default 6 months
  const selectedPlan = plansToDisplay.find(p => p.id === selectedPlanId) || plansToDisplay[2];
  const payRef = React.useRef(null);
  const libRef = React.useRef(null);
  const scrollToPay = () => payRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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


  useEffect(() => {
    const onKey = e => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  const planValue = id => {
    const p = plansToDisplay.find(x => x.id === id);
    return parseInt(String(p.price).replace(/\D/g, ''), 10);
  };

  return (
    <div className="plan-checkout" role="dialog" aria-modal="true" aria-label="Planes EUNACOM App">
      <div className="plan-checkout__bar">
        <div>
          <div className="plan-checkout__title">Curso Completo Todo-en-Uno ⭐</div>
          <div className="plan-checkout__sub">+650 clases en video · +10.000 preguntas · simulacros · reconstrucciones</div>
        </div>
        <button onClick={onClose} aria-label="Cerrar" className="plan-checkout__close"><X size={20} /></button>
      </div>

      <div className="plan-checkout__body">
        {discountPercent > 0 && (
          <div className="plan-banner promo">
            <span>
              {isPromoDiscount ? `🔥 ${promo.name}: ${discountPercent}% DCTO${promo.endLabel ? ` hasta el ${promo.endLabel}` : ''}` : isSocialCoupon ? `🏷️ Código ${coupon.code}: ${discountPercent}% DCTO aplicado` : `🏷️ Cupón Exclusivo: ${discountPercent}% DCTO Aplicado`}
            </span>
            <span className="pill">VÁLIDO</span>
          </div>
        )}
        {credit > 0 && (
          <div className="plan-banner credit">
            📚 Compraste libros hace poco: te descontamos <strong>{fmtClp(credit)}</strong> de los planes de 6 meses y 1 año
            {upgradeCredit?.until ? ` (válido hasta el ${new Date(upgradeCredit.until).toLocaleDateString('es-CL')})` : ''}.
          </div>
        )}

        <h2 className="plan-checkout__h2">Elige tu plan</h2>
        <p className="plan-checkout__lead">Todos los planes incluyen acceso total al curso. Los de 6 meses y 1 año traen además la biblioteca completa de libros.</p>

        <div className="plan-grid">
          {plansToDisplay.map(plan => {
            const selected = selectedPlan.id === plan.id;
            const perMonth = Math.round(planValue(plan.id) / plan.months);
            return (
              <div
                key={plan.id}
                className={`pack-card plan-card ${plan.popular ? 'star' : ''} ${selected ? 'selected' : ''}`}
                onClick={() => setSelectedPlanId(plan.id)}
              >
                {plan.popular && <span className="pack-ribbon">⭐ Más popular</span>}
                <h3>{plan.name}</h3>
                <p className="desc">{plan.days} días de acceso</p>
                <div className="pack-price">
                  {plan.price}
                  {plan.oldPrice && <span className="was">{plan.oldPrice}</span>}
                </div>
                <div className="plan-permonth">
                  {plan.months > 1 ? `≈ ${fmtClp(perMonth)} al mes` : '\u00a0'}
                  {plan.save > 0 && <span className="pack-save">Ahorras {plan.save} %</span>}
                </div>
                {plan.anchorIsMonthly && <div className="plan-anchor-note">vs. {plan.oldPrice} pagando mes a mes</div>}
                <ul className="pack-feat">
                  <li><i>✓</i>+650 clases en video</li>
                  <li><i>✓</i>+10.000 preguntas y simulacros</li>
                  <li><i>✓</i>16 reconstrucciones resueltas</li>
                  {plan.includesLibrary
                    ? <li><i>✓</i><span><b>Biblioteca completa de libros</b> <span className="plan-libval">(valor {fmtClp(BIBLIOTECA.price)})</span></span></li>
                    : <li className="no"><i>✕</i>Biblioteca de libros</li>}
                </ul>
                {plan.includesLibrary && (
                  <button className="plan-libstrip" onClick={e => { e.stopPropagation(); libRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }}>
                    <span className="covers">{LIB_COVERS.slice(0, 4).map(c => <img key={c} src={c} alt="" className="book-cover" />)}</span>
                    <span>Tomos, reconstrucciones, Libros Gordos, Repaso Final y más <u>¿Qué trae? →</u></span>
                  </button>
                )}
                <button
                  className={`t-btn ${selected ? 'fill' : ''}`}
                  onClick={e => { e.stopPropagation(); setSelectedPlanId(plan.id); scrollToPay(); }}
                >
                  {selected ? '✓ Elegido · Pagar' : 'Elegir'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Qué es la biblioteca (para que se entienda qué traen 6 meses y 1 año) */}
        <div ref={libRef} className="plan-lib">
          <div className="plan-lib__covers" aria-hidden="true">
            {LIB_COVERS.map((c, i) => (
              <img key={c} src={c} alt="" className="book-cover" style={{ transform: `rotate(${(i - 2.5) * 5}deg)`, zIndex: 6 - Math.abs(Math.round(i - 2.5)) }} />
            ))}
          </div>
          <div className="plan-lib__text">
            <span className="tienda-kick">📚 Incluida en 6 meses y 1 año</span>
            <h3>¿Qué es la Biblioteca EUNACOM?</h3>
            <p>Los libros de Academia Examen EUNACOM para estudiar el Perfil V3. Se leen dentro de la app, en el computador o el celular.</p>
            <div className="plan-lib__grid">
              {LIB_ITEMS.map(x => (
                <div key={x.t}><b>{x.n}</b><strong>{x.t}</strong><span>{x.d}</span></div>
              ))}
            </div>
            <div className="plan-lib__value">
              Por separado: <s>{fmtClp(looseValue('biblioteca'))}</s> libro por libro, o <strong>{fmtClp(BIBLIOTECA.price)}</strong> el pack. Con el plan de 6 meses o 1 año <strong>viene incluida</strong>.
            </div>
          </div>
        </div>

        <div className="plan-extras">
          <div>
            {!showCouponBox ? (
              <button onClick={() => setShowCouponBox(true)} className="plan-link">
                <Tag size={13} /> ¿Tienes un código de descuento?
              </button>
            ) : (
              <div>
                <div style={{ display: 'flex', gap: '0.4rem', maxWidth: 360 }}>
                  <input
                    value={couponInput}
                    onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }}
                    onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                    placeholder="Ej: SHORTS20"
                    aria-label="Código de descuento"
                    className="plan-input"
                  />
                  <button onClick={applyCoupon} className="plan-apply">Aplicar</button>
                </div>
                {couponError && <div style={{ color: '#f87171', fontSize: '0.75rem', marginTop: 4 }}>{couponError}</div>}
                {coupon && !couponError && discountPercent > socialPercent && (
                  <div style={{ color: 'var(--surface-400)', fontSize: '0.75rem', marginTop: 4 }}>Ya tienes un descuento mayor aplicado; los códigos no se suman.</div>
                )}
              </div>
            )}
          </div>

          {/* Libros como opción secundaria (en /biblioteca el orden es al revés) */}
          {!onBooksPage && !libraryIncluded && (
            <button onClick={() => { onClose(); navigate('/biblioteca'); }} className="plan-books">
              <BookOpen size={18} style={{ color: '#fbbf24', flexShrink: 0 }} />
              <span>
                ¿Solo quieres los libros? <strong>{BIBLIOTECA.name} {fmtClp(BIBLIOTECA.price)}</strong>
                <span className="plan-books__sub">Tomos, reconstrucciones, Libros Gordos, Repaso Final y Atlas, en la app →</span>
              </span>
            </button>
          )}
        </div>

        {/* Pago */}
        <div ref={payRef} className="plan-pay">
          <h3 className="plan-pay__title">
            Completar pago: <span>{selectedPlan.name} · {selectedPlan.price}</span>
          </h3>

          <div className="plan-country">
            <button onClick={() => setCountry('CL')} className={country === 'CL' ? 'on' : ''}>🇨🇱 Chile</button>
            <button onClick={() => setCountry('BO')} className={country === 'BO' ? 'on' : ''}>🇧🇴 Bolivia / Int.</button>
          </div>

          <div className="plan-banner credit" style={{ textAlign: 'center' }}>
            <CheckCircle2 size={15} style={{ verticalAlign: 'text-bottom', marginRight: 4 }} />
            <strong>Activación inmediata</strong>&nbsp;al terminar el pago.
          </div>

          {country === 'CL' ? (
            <>
              <PayButtons loading={loadingMp} onMercadoPago={handleMercadoPago} onPaypal={handlePaypal} />
              {selectedPlan.oldPrice && !selectedPlan.anchorIsMonthly && (
                <div style={{ color: 'var(--surface-400)', fontSize: '0.72rem', marginTop: '0.3rem', textAlign: 'center' }}>
                  Si PayPal te muestra el precio sin descuento, paga con Mercado Pago o transferencia, o escríbenos por WhatsApp.
                </div>
              )}
              {errorMp && <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.4rem', textAlign: 'center' }}>{errorMp}</div>}

              <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '1rem 0' }} />
              <h4 className="plan-pay__h4">Transferencia directa</h4>
              <div className="plan-transfer">
                <p>Puedes transferir directamente <strong>{selectedPlan.price}</strong> a:</p>
                <ul>
                  <li><strong>Banco:</strong> {TRANSFER.bank}</li>
                  <li><strong>{TRANSFER.account}:</strong> {TRANSFER.number}</li>
                  <li><strong>Nombre:</strong> {TRANSFER.name}</li>
                  <li><strong>Monto:</strong> {selectedPlan.price}</li>
                </ul>
                <p className="ok">IMPORTANTE: Envía tu comprobante por WhatsApp al {TRANSFER.whatsapp}.</p>
              </div>
            </>
          ) : (
            <>
              <p style={{ color: 'var(--surface-300)', fontSize: '0.85rem', margin: '0 0 0.8rem', lineHeight: 1.45, textAlign: 'center' }}>
                Para estudiantes de Bolivia y otros países, procesamos los pagos de forma segura a través de <strong>PayPal</strong> en dólares (USD). Puedes pagar con Apple Pay, Google Pay o tarjeta.
              </p>
              <PayButtons showMercadoPago={false} loading={loadingMp} onPaypal={handlePaypal} />
              {errorMp && <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.4rem', textAlign: 'center' }}>{errorMp}</div>}
            </>
          )}
        </div>
      </div>

      {isMobile && (
        <div className="plan-mobile-cta">
          <button onClick={scrollToPay}>Pagar {selectedPlan.name} · {selectedPlan.price} →</button>
        </div>
      )}
    </div>
  );
};

export default PaymentModal;
