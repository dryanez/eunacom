import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, CheckCircle2, BookOpen, Tag, Hourglass } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { createCheckoutSession, createPaypalOrder, getEmailDiscount } from '../lib/api';
import { isAndroidApp, PLAY_BASE_PLANS } from '../lib/playBilling';
import PlayPayButton from './PlayPayButton';
import Paywall from './Paywall';
import { useSubscription } from '../contexts/SubscriptionContext';
import { APP_PLANS, SALE_PLANS, PRODUCTS, TRANSFER, RECON_JUL2026, MIN_CHARGE_CLP, TOMOS, EXTRAS, fmtClp, creditApplies, looseValue } from '../config/tienda';
import PayButtons from './PayButtons';
import '../styles/tienda.css';
import { track } from '../lib/analytics';
import { nextExam } from '../config/examen';

const DAYS = { 1: 30, 3: 90, 6: 180, 12: 365 };
export const fmtExpiry = iso => new Date(iso).toLocaleString('es-CL', { timeZone: 'America/Santiago', weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }) + ' h';
const PLANS = SALE_PLANS.map(p => ({ ...p, price: fmtClp(p.price), days: DAYS[p.months] }));
const BIBLIOTECA = PRODUCTS.biblioteca;
export { LIB_COVERS, LIB_ITEMS } from '../config/biblioteca';
import { LIB_COVERS, LIB_ITEMS } from '../config/biblioteca';

const PaymentModal = ({ onClose }) => {
  const androidApp = isAndroidApp();
  const { user, openAuthModal } = useAuth();
  const exam = nextExam();
  const { promo, coupon, setCoupon, upgradeCredit, libraryIncluded } = useSubscription();
  const navigate = useNavigate();
  const location = useLocation();
  const onBooksPage = location.pathname.startsWith('/biblioteca') || location.pathname.startsWith('/libros');
  const [couponInput, setCouponInput] = useState(coupon?.code || '');
  const [couponError, setCouponError] = useState('');
  const [showCouponBox, setShowCouponBox] = useState(!!coupon);
  const credit = upgradeCredit?.amount || 0;
  
  // Read discount from URL or localStorage (30, 40, 50)
  const [couponPercent, setCouponPercent] = useState(() => {
    try {
      const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const qDiscount = urlParams?.get('discount');
      if (qDiscount && [30, 40, 50].includes(Number(qDiscount))) return Number(qDiscount);
      const stored = localStorage.getItem('eunacom_pending_discount');
      if (stored && [30, 40, 50].includes(Number(stored))) return Number(stored);
    } catch {}
    return 0;
  });
  // The email coupon only counts if it was emailed to this user and hasn't expired (the server checks the same)
  const [emailExpires, setEmailExpires] = useState(null);
  const [emailExpired, setEmailExpired] = useState(false);
  useEffect(() => {
    if (!user?.id || !couponPercent) return;
    let alive = true;
    getEmailDiscount(user.id, couponPercent).then(r => {
      if (!alive) return;
      if (r?.percent) { setEmailExpires(r.expiresAt); return; }
      setCouponPercent(0); setEmailExpired(!!r?.expired);
      try { localStorage.removeItem('eunacom_pending_discount'); } catch {}
    }).catch(() => {});
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);
  const socialPercent = coupon?.percent || 0;
  const discountPercent = Math.max(couponPercent, promo?.percent || 0, socialPercent);
  const isPromoDiscount = !!promo && discountPercent === promo.percent;
  const isSocialCoupon = !!coupon && discountPercent === socialPercent && !isPromoDiscount;

  // Mismo cálculo que el servidor (planPricing): descuento mayor y luego el crédito por libros
  const plansToDisplay = React.useMemo(() => {
    // En la app Android se paga con Google Play: solo los planes que existen ahí (De por vida no)
    return PLANS.filter(p => !androidApp || PLAY_BASE_PLANS[p.id] || p.id === 'life').map(p => {
      const num = APP_PLANS.find(x => x.id === p.id).price;
      const discounted = discountPercent ? Math.round(num * (1 - discountPercent / 100)) : num;
      const final = credit && creditApplies(p.id) ? Math.max(MIN_CHARGE_CLP, discounted - credit) : discounted;
      // Precio tachado: sin promo, lo que costaría pagando mes a mes (el ahorro real del plan largo)
      const monthly = APP_PLANS[0].price * p.months;
      const anchor = final !== num ? num : (p.months > 1 && !p.lifetime ? monthly : null);
      const save = anchor ? Math.round((1 - final / anchor) * 100) : 0;
      return { ...p, oldPrice: anchor ? fmtClp(anchor) : null, anchorIsMonthly: final === num && !!anchor, price: fmtClp(final), save, creditApplied: discounted - final };
    });
  }, [discountPercent, credit]);

  const applyCoupon = () => {
    if (!couponInput.trim()) { setCoupon(null); setCouponError(''); return; }
    const c = setCoupon(couponInput);
    setCouponError(c ? '' : 'Código no válido');
  };

  const [selectedPlanId, setSelectedPlanId] = useState(() => {
    // /oferta deja marcado el plan que la persona eligió; si no, el plan marcado «Más elegido» (6 meses)
    try {
      const pick = sessionStorage.getItem('eunacom_plan_pick');
      if (pick) { sessionStorage.removeItem('eunacom_plan_pick'); if (PLANS.some(p => p.id === pick)) return pick; }
    } catch {}
    return SALE_PLANS.find(p => p.popular)?.id || '3m';
  });
  const selectedPlan = plansToDisplay.find(p => p.id === selectedPlanId) || plansToDisplay[2];
  const payRef = React.useRef(null);
  const libRef = React.useRef(null);
  const scrollToPay = () => payRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [loadingMp, setLoadingMp] = useState(false);
  const [errorMp, setErrorMp] = useState(null);
  

  useEffect(() => {
    track('plans_viewed', { discount_percent: discountPercent || 0, logged_in: !!user });
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // In-app PayPal order (charges the promo price). Falls back to the fixed-price PayPal link
  // if the PayPal API isn't configured on the server.
  // Sin sesión (p. ej. en /oferta) se ven los mismos planes; al pagar se pide entrar o crear cuenta y se queda en el plan elegido
  const askLogin = () => {
    try { sessionStorage.setItem('eunacom_plan_pick', selectedPlan.id); } catch {}
    track('checkout_login_prompt', { plan: selectedPlan.id });
    openAuthModal('register', `Crea tu cuenta (o inicia sesión) para pagar ${selectedPlan.name} · ${selectedPlan.price}`);
  };

  const handlePaypal = async () => {
    if (!user) return askLogin();
    setLoadingMp(true);
    setErrorMp(null);
    try {
      track('checkout_started', { gateway: 'paypal', plan: selectedPlan.id, discount_percent: discountPercent || 0 });
      const res = await createPaypalOrder(user.id, selectedPlan.id, coupon?.code, couponPercent || null);
      if (!res.approve_url) throw new Error('No approve_url');
      window.location.href = res.approve_url;
    } catch (err) {
      console.error(err);
      if (selectedPlan.paypal) window.location.href = selectedPlan.paypal;
      else setErrorMp('No pudimos abrir PayPal. Prueba con Mercado Pago o transferencia, o escríbenos por WhatsApp.');
    }
  };

  const handleMercadoPago = async () => {
    if (!user) return askLogin();
    setLoadingMp(true);
    setErrorMp(null);
    try {
      track('checkout_started', { gateway: 'mercadopago', plan: selectedPlan.id, discount_percent: discountPercent || 0 });
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
        </div>
        <button onClick={onClose} aria-label="Cerrar" className="plan-checkout__close"><X size={20} /></button>
      </div>

      {exam && exam.days <= 120 && (
        <div className="plan-countdown">
          <Hourglass size={17} />
          <span>Faltan <b>{exam.days} días</b> para el EUNACOM del {exam.label}</span>
        </div>
      )}

      <div className="plan-checkout__body">
        <div className="plan-r26">
          <img src={RECON_JUL2026.cover} alt="Reconstrucción EUNACOM Julio 2026" />
          <div><span>🆕 Nueva · la última antes de tu examen</span><b>Reconstrucción EUNACOM Julio 2026 gratis con cualquier plan</b><small>180 preguntas con explicación · suelta vale {fmtClp(RECON_JUL2026.price)}</small></div>
        </div>
        {discountPercent > 0 && (
          <div className="plan-banner promo">
            <span>
              {isPromoDiscount ? `🔥 ${promo.name}: ${discountPercent}% DCTO${promo.endLabel ? ` hasta el ${promo.endLabel}` : ''}` : isSocialCoupon ? `🏷️ Código ${coupon.code}: ${discountPercent}% DCTO aplicado` : `🏷️ Tu ${discountPercent}% del correo ya está aplicado${emailExpires ? ` · vence el ${fmtExpiry(emailExpires)}` : ''}`}
            </span>
            <span className="pill">VÁLIDO</span>
          </div>
        )}
        {emailExpired && !discountPercent && (
          <div className="plan-banner credit">⏳ El descuento de tu correo ya venció. Estos son los precios de hoy.</div>
        )}
        {credit > 0 && (
          <div className="plan-banner credit">
            📚 Compraste libros hace poco: te descontamos <strong>{fmtClp(credit)}</strong> de los planes de 3 meses y de por vida
            {upgradeCredit?.until ? ` (válido hasta el ${new Date(upgradeCredit.until).toLocaleDateString('es-CL')})` : ''}.
          </div>
        )}

        <h2 className="plan-checkout__h2">Elige tu plan</h2>
        <p className="plan-checkout__lead">Todos traen el curso completo. <b>Desde 3 meses</b> incluyen además la biblioteca de libros.</p>

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
                {plan.popular && <span className="pack-ribbon">⭐ Más elegido</span>}
                <h3>{plan.name}</h3>
                <p className="desc">{plan.lifetime ? 'Acceso para siempre' : `${plan.days} días de acceso`}</p>
                {plan.tagline && <p className="desc" style={{ fontWeight: 700 }}>{plan.tagline}</p>}
                <div className="pack-price">
                  {plan.price}
                  {plan.oldPrice && <span className="was">{plan.oldPrice}</span>}
                </div>
                <div className="plan-permonth">
                  {plan.lifetime ? 'Un solo pago' : plan.months > 1 ? `≈ ${fmtClp(perMonth)} al mes` : '\u00a0'}
                  {plan.save > 0 && <span className="pack-save">Ahorras {plan.save} %</span>}
                </div>
                {plan.anchorIsMonthly && <div className="plan-anchor-note">vs. {plan.oldPrice} pagando mes a mes</div>}
                <ul className="pack-feat">
                  <li><i>✓</i>+650 clases en video</li>
                  <li><i>✓</i>+47.000 preguntas y simulacros</li>
                  <li><i>✓</i>+15.900 flashcards tipo Anki</li>
                  <li><i>✓</i>Reconstrucciones 2013–2026</li>
                  <li><i>✓</i><span><b>Reconstrucción Julio 2026 gratis</b> <span className="plan-libval">(suelta $12.999)</span></span></li>
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

        {/* Qué es la biblioteca (para que se entienda qué traen 3 meses y de por vida) */}
        <div ref={libRef} className="plan-lib">
          <div className="plan-lib__covers" aria-hidden="true">
            {LIB_COVERS.map((c, i) => (
              <img key={c} src={c} alt="" className="book-cover" style={{ transform: `rotate(${(i - 2.5) * 5}deg)`, zIndex: 6 - Math.abs(Math.round(i - 2.5)) }} />
            ))}
          </div>
          <div className="plan-lib__text">
            <span className="tienda-kick">📚 Incluida desde 3 meses</span>
            <h3>¿Qué es la Biblioteca EUNACOM?</h3>
            <p>Los libros de Academia Examen EUNACOM para estudiar el Perfil V3. Se leen dentro de la app, en el computador o el celular.</p>
            <div className="plan-lib__grid">
              {LIB_ITEMS.map(x => (
                <div key={x.t}><b>{x.n}</b><strong>{x.t}</strong><span>{x.d}</span></div>
              ))}
            </div>
            <div className="plan-lib__value">
              Por separado: <s>{fmtClp(looseValue('biblioteca'))}</s> libro por libro, o <strong>{fmtClp(BIBLIOTECA.price)}</strong> el pack. Con 3 meses, 6 meses o De por vida <strong>viene incluida</strong>.
            </div>
          </div>
        </div>

        <div className="plan-extras">
          <div style={androidApp ? { display: 'none' } : undefined}>
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
          <div className="plan-pay__sum">
            <div className="plan-pay__plan">
              <small>Completar pago</small>
              <b>{selectedPlan.name}</b>
              <span>{selectedPlan.lifetime ? 'Acceso para siempre' : `${selectedPlan.days} días de acceso`}{selectedPlan.includesLibrary ? ' · con biblioteca' : ''}</span>
            </div>
            <div className="plan-pay__amt">
              {selectedPlan.oldPrice && !selectedPlan.anchorIsMonthly && <s>{selectedPlan.oldPrice}</s>}
              <strong>{selectedPlan.price}</strong>
              <small>CLP · pago único</small>
            </div>
          </div>

          {androidApp ? (
            <PlayPayButton plan={selectedPlan} userId={user?.id} />
          ) : (<>
          <p className="plan-refund">
            Al pagar aceptas nuestra <a href="/reembolsos" target="_blank" rel="noopener noreferrer">Política de Reembolsos</a>: como el acceso se activa de inmediato, no hay reembolsos una vez activado.
          </p>
          <PayButtons
            loading={loadingMp}
            onMercadoPago={handleMercadoPago}
            onPaypal={handlePaypal}
            transferAmount={selectedPlan.price}
            transferWhat={`plan ${selectedPlan.name}`}
          />
          {selectedPlan.oldPrice && !selectedPlan.anchorIsMonthly && (
            <div style={{ color: 'var(--surface-400)', fontSize: '0.72rem', marginTop: '0.5rem', textAlign: 'center' }}>
              Si PayPal te muestra el precio sin descuento, paga con Mercado Pago o transferencia, o escríbenos por WhatsApp.
            </div>
          )}
          {errorMp && <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.4rem', textAlign: 'center' }}>{errorMp}</div>}
          </>)}
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

// En la app Android se muestra el paywall con slides (Paywall.jsx). En la web, para verlo:
// localStorage.eunacom_paywall_preview = '1'
const PlansEntry = props => {
  let preview = false;
  try { preview = localStorage.getItem('eunacom_paywall_preview') === '1'; } catch {}
  return isAndroidApp() || preview ? <Paywall {...props} /> : <PaymentModal {...props} />;
};

export default PlansEntry;
