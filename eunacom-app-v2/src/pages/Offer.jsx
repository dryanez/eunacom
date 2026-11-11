import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useAuth } from '../contexts/AuthContext';
import { SALE_PLANS, PRODUCTS, RECON_JUL2026, fmtClp, looseValue } from '../config/tienda';
import { getEmailDiscount } from '../lib/api';
import { fmtExpiry, LIB_ITEMS, LIB_COVERS } from '../components/PaymentModal';
import { nextExam } from '../config/examen';
import { track } from '../lib/analytics';

// Página de los correos de descuento (/oferta?discount=30|40|50) y de las promos.
// Muestra la oferta con su diseño; el pago se abre recién cuando la persona elige un plan
// (con ese plan ya marcado). Sin sesión, elegir un plan pide iniciar sesión y luego abre el pago.
const NAVY = '#0b2545', CYAN = '#22d3ee';
// 21 Manuales + 21 Repaso Final + 23 Libros Gordos + 19 Atlas + Reconstrucciones + Perfil V3
const BOOKS = 21 + 21 + 23 + 19 + 1 + 1;
const off = (price, pct) => (pct ? Math.round(price * (1 - pct / 100)) : price);

const CSS = `
.of{min-height:100vh;background:#eef3f9;font-family:var(--font,Montserrat,Arial,sans-serif);color:#0f172a}
.of-hero{background:${NAVY};color:#fff;padding:28px 18px 120px;text-align:center;position:relative;overflow:hidden}
.of-hero:after{content:"";position:absolute;inset:auto -20% -60% -20%;height:70%;background:radial-gradient(closest-side,rgba(34,211,238,.25),transparent);pointer-events:none}
.of-wrap{max-width:1040px;margin:0 auto;position:relative;z-index:1}
.of-pill{display:inline-block;background:${CYAN};color:${NAVY};font-size:12px;font-weight:900;letter-spacing:2px;padding:6px 14px;border-radius:99px}
.of-big{font-size:clamp(56px,12vw,104px);font-weight:900;line-height:1;margin:14px 0 4px;letter-spacing:-2px}
.of-sub{font-size:18px;color:#bfdbfe;font-weight:700}
.of-ok{margin-top:14px;font-size:15px;line-height:1.6}
.of-count{display:inline-block;margin-top:18px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18);border-radius:14px;padding:10px 16px;font-weight:700}
.of-count b{font-size:26px;vertical-align:-3px;color:${CYAN};font-weight:900}
.of-plans{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;max-width:1040px;margin:-90px auto 0;padding:0 16px;position:relative;z-index:2}
.of-card{background:#fff;border-radius:20px;padding:24px 20px;box-shadow:0 12px 32px rgba(11,37,69,.12);display:flex;flex-direction:column;border:2px solid transparent}
.of-card.star{border-color:${CYAN};transform:translateY(-12px);box-shadow:0 20px 44px rgba(11,37,69,.22)}
.of-rib{align-self:center;margin:-38px 0 12px;background:${CYAN};color:${NAVY};font-weight:900;font-size:12px;letter-spacing:1px;padding:6px 14px;border-radius:99px}
.of-name{font-size:22px;font-weight:900;color:${NAVY}}
.of-tag{font-size:14px;color:#475569;margin-top:2px;min-height:20px}
.of-was{color:#94a3b8;text-decoration:line-through;font-size:16px;margin-top:14px;min-height:20px}
.of-price{font-size:40px;font-weight:900;color:${NAVY};line-height:1.05}
.of-pm{font-size:13px;color:#2563eb;font-weight:800;min-height:18px}
.of-feat{list-style:none;padding:0;margin:16px 0;font-size:14px;line-height:1.5;flex:1}
.of-feat li{padding:4px 0}.of-feat .of-r26{background:#ecfeff;border:1px solid #a5f3fc;border-radius:10px;padding:7px 10px;margin:4px 0}.of-feat .of-r26 span{color:#64748b;font-size:12px}
.of-r26band{max-width:1008px;margin:-90px auto 16px;position:relative;z-index:2;display:flex;gap:16px;align-items:center;background:#0b2545;color:#fff;border:2px solid #22d3ee;border-radius:16px;padding:12px 18px}.of-r26band img{width:64px;border-radius:3px 6px 6px 3px;box-shadow:0 8px 18px rgba(0,0,0,.4)}.of-r26band div{display:flex;flex-direction:column;gap:2px}.of-r26band span{font-size:12px;font-weight:800;color:#22d3ee;letter-spacing:.04em}.of-r26band b{font-size:17px;line-height:1.25}.of-r26band small{color:#bfdbfe;font-size:13px}@media(max-width:640px){.of-r26band{margin:-90px 16px 14px}.of-r26band b{font-size:15px}}.of-feat .no{color:#94a3b8}
.of-btn{width:100%;border:none;border-radius:12px;padding:15px 0;font-size:16px;font-weight:900;cursor:pointer;background:#e2e8f0;color:${NAVY}}
.of-card.star .of-btn{background:${NAVY};color:#fff}
.of-sec{max-width:1040px;margin:40px auto 0;padding:0 16px}
.of-row{display:grid;grid-template-columns:1.2fr 1fr;gap:20px;align-items:center;background:#fff;border-radius:20px;padding:20px;box-shadow:0 6px 20px rgba(11,37,69,.08)}
.of-row img{width:100%;border-radius:14px;display:block}
.of-h{font-size:24px;font-weight:900;color:${NAVY};margin:0 0 8px}
.of-p{font-size:15px;color:#334155;line-height:1.55;margin:0}
.of-brand{display:inline-flex;align-items:center;gap:10px;margin-bottom:16px;font-weight:900;font-size:20px}
.of-brand img{background:#fff;border-radius:10px;padding:4px;object-fit:contain}.of-brand b{color:${CYAN}}
.of-lib{background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:10px 12px !important;margin-top:6px;display:flex;flex-direction:column;gap:3px}
.of-lib b{color:#9a3412}.of-lib span{font-size:13px;color:#475569}.of-libval b{color:#16a34a}
.of-lib button{align-self:flex-start;background:none;border:none;color:#ea580c;font-weight:800;padding:2px 0;cursor:pointer;font-size:13px}
.of-libfan{display:flex;justify-content:center;margin:18px 0 6px}
.of-libfan img{width:min(17%,120px);border-radius:6px;box-shadow:0 10px 22px rgba(0,0,0,.3);margin:0 -10px}
.of-libgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:18px}
.of-libgrid div{background:#f1f5f9;border-radius:12px;padding:12px;display:flex;flex-direction:column;gap:2px}
.of-libgrid b{font-size:24px;color:#ea580c;font-weight:900}.of-libgrid strong{color:${NAVY}}.of-libgrid span{font-size:13px;color:#475569}
.of-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;text-align:center}
.of-stats b{display:block;font-size:26px;color:${NAVY};font-weight:900}.of-stats span{font-size:11px;font-weight:800;letter-spacing:1px;color:#2563eb}
.of-links{text-align:center;padding:28px 16px 48px;font-size:14px}
.of-links button{background:none;border:none;color:#475569;cursor:pointer;font-size:14px;padding:6px 10px}
@media (max-width:820px){
 .of-plans{grid-template-columns:1fr;margin-top:-90px}
 .of-card.star{order:-1;transform:none}
 .of-row{grid-template-columns:1fr}
 .of-stats{grid-template-columns:repeat(2,1fr)}
 .of-libgrid{grid-template-columns:1fr 1fr}
}`;

const Offer = () => {
  const navigate = useNavigate();
  const { setShowPaymentModal, promo, isPremium, coupon } = useSubscription();
  const { user, loading, openAuthModal } = useAuth();
  const exam = nextExam();
  const libRef = useRef(null);
  // Solo en localhost: ?verplanes=1 muestra los planes aunque la cuenta (admin) sea Premium
  const forcePlans = import.meta.env.DEV && new URLSearchParams(window.location.search).has('verplanes');

  // Cupón del correo (?discount=30|40|50). Se muestra de inmediato; con sesión se confirma que es suyo y que no venció.
  const [emailPct] = useState(() => {
    try {
      const d = Number(new URLSearchParams(window.location.search).get('discount') || localStorage.getItem('eunacom_pending_discount'));
      if ([30, 40, 50].includes(d)) { localStorage.setItem('eunacom_pending_discount', String(d)); return d; }
    } catch {}
    return 0;
  });
  const [email, setEmail] = useState({ percent: emailPct, expiresAt: null, expired: false, checked: false });
  const loggedIn = !!user && !loading;

  useEffect(() => {
    if (!loggedIn || !emailPct) return;
    getEmailDiscount(user.id, emailPct).then(r => {
      setEmail({ percent: r?.percent || 0, expiresAt: r?.expiresAt || null, expired: !!r?.expired, checked: true });
      if (!r?.percent) { try { localStorage.removeItem('eunacom_pending_discount'); } catch {} }
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedIn]);

  useEffect(() => { track('offer_viewed', { discount_percent: emailPct, logged_in: loggedIn }); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Promo admin, código de redes o cupón del correo: gana el mayor (igual que el checkout)
  const usingEmail = email.percent > Math.max(promo?.percent || 0, coupon?.percent || 0);
  const usingCoupon = !usingEmail && !!coupon && coupon.percent > (promo?.percent || 0);
  const percent = Math.max(promo?.percent || 0, coupon?.percent || 0, email.percent);
  const badge = usingEmail ? 'TU CUPÓN DEL CORREO' : usingCoupon ? `CÓDIGO ${coupon.code}` : promo ? promo.name.toUpperCase() : null;

  const pick = (planId) => {
    track('offer_plan_clicked', { plan: planId, discount_percent: percent });
    try { sessionStorage.setItem('eunacom_plan_pick', planId); } catch {}
    if (loggedIn) return setShowPaymentModal(true);
    try { sessionStorage.setItem('eunacom_open_checkout', '1'); } catch {}
    openAuthModal('login', percent ? `Inicia sesión para usar tu ${percent}% de descuento` : 'Inicia sesión para elegir tu plan');
  };

  return (
    <div className="of">
      <style>{CSS}</style>

      <header className="of-hero">
        <div className="of-wrap">
          <div className="of-brand"><img src="/logo.png" alt="" width="40" height="40" /><span>EUNACOM<b>App</b></span></div>
          {percent ? (
            <>
              <div><span className="of-pill">{badge}</span></div>
              <div className="of-big">−{percent}%</div>
              <div className="of-sub">en todos los planes</div>
              <div className="of-ok">
                ✓ Ya viene aplicado: no tienes que escribir ningún código.
                {usingEmail && email.expiresAt && <><br />⏳ Vence el <strong>{fmtExpiry(email.expiresAt)}</strong></>}
                {!usingEmail && !usingCoupon && promo?.endLabel && <><br />⏳ Hasta el <strong>{promo.endLabel}</strong></>}
                {usingEmail && !loggedIn && <><br />Inicia sesión con el correo donde lo recibiste.</>}
              </div>
            </>
          ) : (
            <>
              <h1 style={{ fontSize: 'clamp(30px,6vw,46px)', fontWeight: 900, margin: '6px 0' }}>Prepara tu EUNACOM</h1>
              <div className="of-sub">Clases, preguntas, reconstrucciones y libros en un solo lugar</div>
              {email.checked && emailPct > 0 && (
                <div className="of-ok" style={{ color: '#bfdbfe' }}>
                  {email.expired ? '⏳ El descuento de tu correo ya venció. Estos son los precios de hoy.' : 'Este descuento no está asociado a tu cuenta. Revisa que entraste con el mismo correo.'}
                </div>
              )}
            </>
          )}
          {exam && exam.days <= 120 && (
            <div className="of-count">⏳ Faltan <b>{exam.days}</b> días para el EUNACOM del {exam.label}</div>
          )}
        </div>
      </header>

      {isPremium && loggedIn && !forcePlans ? (
        <div className="of-sec" style={{ marginTop: -70, position: 'relative', zIndex: 2 }}>
          <div className="of-card" style={{ textAlign: 'center' }}>
            <div className="of-name">✅ Ya tienes Premium activo</div>
            <button className="of-btn" style={{ marginTop: 14, background: NAVY, color: '#fff' }} onClick={() => navigate('/dashboard')}>Ir a estudiar →</button>
          </div>
        </div>
      ) : (
        <>
        <div className="of-r26band">
          <img src={RECON_JUL2026.cover} alt="Reconstrucción EUNACOM Julio 2026" />
          <div><span>🆕 Nueva · la última antes de tu examen</span><b>Reconstrucción EUNACOM Julio 2026 gratis con cualquier plan</b><small>180 preguntas con explicación · suelta vale {fmtClp(RECON_JUL2026.price)}</small></div>
        </div>
        <section className="of-plans" style={{ marginTop: 0 }}>
          {SALE_PLANS.map(p => {
            const final = off(p.price, percent);
            const perMonth = p.lifetime || p.months === 1 ? null : Math.round(final / p.months);
            return (
              <div key={p.id} className={`of-card ${p.popular ? 'star' : ''}`}>
                {p.popular && <span className="of-rib">⭐ EL MÁS ELEGIDO</span>}
                <div className="of-name">{p.name}</div>
                <div className="of-tag">{p.tagline}</div>
                <div className="of-was">{percent ? fmtClp(p.price) : ''}</div>
                <div className="of-price">{fmtClp(final)}</div>
                <div className="of-pm">{p.lifetime ? 'Un solo pago, para siempre' : perMonth ? `≈ ${fmtClp(perMonth)} al mes` : '30 días de acceso'}</div>
                <ul className="of-feat">
                  <li>✓ +650 clases en video</li>
                  <li>✓ +47.000 preguntas y simulacros</li>
                  <li>✓ Reconstrucciones 2013–2026</li>
                  <li className="of-r26">🆕 <b>Reconstrucción Julio 2026 gratis</b> <span>(suelta {fmtClp(RECON_JUL2026.price)})</span></li>
                  {p.includesLibrary
                    ? <li className="of-lib">
                        <b>📚 + Biblioteca completa: {BOOKS} libros</b>
                        <span>Manuales, Repaso Final, Libros Gordos, Atlas y Reconstrucciones 2013–2026</span>
                        <span className="of-libval">Valen <s>{fmtClp(looseValue('biblioteca'))}</s> por separado · <b>incluida</b></span>
                        <button type="button" onClick={() => libRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>Ver qué libros trae →</button>
                      </li>
                    : <li className="no">✕ Biblioteca de libros</li>}
                  {p.lifetime && <li>✓ Todas las actualizaciones, hasta que apruebes</li>}
                </ul>
                <button className="of-btn" onClick={() => pick(p.id)}>
                  {percent ? `Elegir con ${percent}% →` : 'Elegir →'}
                </button>
              </div>
            );
          })}
        </section>
        </>
      )}

      <section className="of-sec">
        <div className="of-row">
          <img src="/oferta/clase-neumotorax.gif" alt="Clase en 3D: neumotórax a tensión" loading="lazy" />
          <div>
            <h2 className="of-h">Clases que se mueven</h2>
            <p className="of-p">Anatomía en 3D explicada para el EUNACOM: ves lo que pasa en el cuerpo, no solo lo lees. +650 clases en las 21 especialidades del Perfil V3.</p>
          </div>
        </div>
      </section>

      <section className="of-sec" ref={libRef}>
        <div className="of-row" style={{ display: 'block' }}>
          <h2 className="of-h" style={{ textAlign: 'center' }}>📚 La Biblioteca: {BOOKS} libros incluidos</h2>
          <p className="of-p" style={{ textAlign: 'center' }}>Viene con 3 meses y De por vida. Se leen en la app, en el computador o el celular. Por separado valen <s>{fmtClp(looseValue('biblioteca'))}</s>.</p>
          <div className="of-libfan">{LIB_COVERS.map((c, k) => <img key={c} src={c} alt="" loading="lazy" style={{ transform: `rotate(${(k - 3) * 5}deg) translateY(${Math.abs(k - 3) * 6}px)`, zIndex: 10 - Math.abs(k - 3) }} />)}</div>
          <div className="of-libgrid">
            {LIB_ITEMS.map(x => (
              <div key={x.t}><b>{x.n}</b><strong>{x.t}</strong><span>{x.d}</span></div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <button className="of-btn" style={{ maxWidth: 320, background: NAVY, color: '#fff' }} onClick={() => navigate('/biblioteca')}>Ver la biblioteca completa →</button>
          </div>
        </div>
      </section>

      <section className="of-sec">
        <div className="of-row" style={{ display: 'block' }}>
          <div className="of-stats">
            <div><b>+650</b><span>CLASES EN VIDEO</span></div>
            <div><b>+47.000</b><span>PREGUNTAS</span></div>
            <div><b>2013–26</b><span>RECONSTRUCCIONES</span></div>
            <div><b>21</b><span>ESPECIALIDADES</span></div>
          </div>
        </div>
      </section>

      <div className="of-links">
        {!loggedIn && <button onClick={() => openAuthModal('register')} style={{ color: '#2563eb', fontWeight: 800 }}>¿No tienes cuenta? Créala gratis</button>}
        <button onClick={() => navigate('/biblioteca')}>¿Solo quieres los libros? {PRODUCTS.biblioteca.name} {fmtClp(PRODUCTS.biblioteca.price)} →</button>
        <button onClick={() => navigate('/dashboard')}>Ir a mi panel</button>
        <div style={{ color: '#64748b', fontSize: 12, marginTop: 10 }}>🔒 Pago único · Webpay, Mercado Pago, PayPal o transferencia · activación inmediata</div>
      </div>
    </div>
  );
};

export default Offer;
