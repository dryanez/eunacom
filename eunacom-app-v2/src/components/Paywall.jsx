import React, { useEffect, useRef, useState } from 'react';
import { X, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { buyPlanWithPlay, getPlayPrices, finishPendingPlayPurchases, isAndroidApp } from '../lib/playBilling';
import { APP_PLANS, SALE_PLANS, PRODUCTS, TOMOS, EXTRAS, fmtClp, looseValue } from '../config/tienda';
import { LIB_ITEMS, LIB_COVERS } from '../config/biblioteca';
import { nextExam } from '../config/examen';
import { track } from '../lib/analytics';
import '../styles/paywall.css';

// App-style paywall for the Android app: benefit slides on top, plan picker and one big
// button below. Pays through Google Play (lib/playBilling.js); Play sets the price per country.
const PERIOD = { '1m': 'cada mes', '3m': 'cada 3 meses', '6m': 'cada 6 meses' };
const COVERS = LIB_COVERS.slice(0, 5);
const LIB = PRODUCTS.biblioteca;

const SLIDES = [
  { k: 'clases', img: '/oferta/clase-neumotorax.gif', kind: 'wide', t: '+650 clases en video', d: 'Todo el Perfil V3 explicado, código por código, con animaciones.' },
  { k: 'libros', kind: 'covers', t: 'Toda la biblioteca de regalo', d: `+100 libros: 21 Tomos, Libros Gordos, Repaso Final, Atlas y Perfil V3. Gratis con 3 meses, 6 meses y De por vida.` },
  { k: 'preguntas', img: '/landing/app-cardiologia.webp', kind: 'phone', t: '+47.000 preguntas', d: 'Practica por especialidad y entiende cada respuesta con su explicación.' },
  { k: 'recons', img: EXTRAS[0].cover, kind: 'book', t: 'Los EUNACOM reales', d: 'Del 2013 al 2026, reconstruidos pregunta por pregunta, y simulacros con tiempo.' },
];

export default function Paywall({ onClose }) {
  const { user } = useAuth();
  const exam = nextExam();
  const android = isAndroidApp();
  const plans = SALE_PLANS;
  const [planId, setPlanId] = useState(() => SALE_PLANS.find(p => p.popular)?.id || '3m');
  const [slide, setSlide] = useState(0);
  const [prices, setPrices] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const track_ = useRef(null);
  const touched = useRef(false);

  useEffect(() => { track('paywall_viewed', { android }); if (android) getPlayPrices().then(setPrices).catch(() => {}); }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = e => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [onClose]);

  // Slides advance by themselves until the person swipes
  useEffect(() => {
    const t = setInterval(() => {
      if (touched.current) return;
      const el = track_.current; if (!el) return;
      const next = (Math.round(el.scrollLeft / el.clientWidth) + 1) % SLIDES.length;
      el.scrollTo({ left: next * el.clientWidth, behavior: 'smooth' });
    }, 3800);
    return () => clearInterval(t);
  }, []);
  const onScroll = e => setSlide(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth));
  const goSlide = i => { touched.current = true; const el = track_.current; el?.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' }); };

  const priceOf = id => prices[id] || fmtClp(APP_PLANS.find(p => p.id === id).price);
  const perMonth = p => (p.lifetime || p.months <= 1 || prices[p.id]) ? null : fmtClp(Math.round(p.price / p.months));
  const save = p => (p.lifetime || p.months <= 1) ? 0 : Math.round((1 - p.price / (APP_PLANS[0].price * p.months)) * 100);
  const plan = plans.find(p => p.id === planId);

  const pay = async () => {
    if (!user?.id) { setError('Inicia sesión para continuar.'); return; }
    if (!android) { setError('Este pago es dentro de la app de Android.'); return; }
    setBusy(true); setError('');
    track('checkout_started', { gateway: 'google_play', plan: planId, source: 'paywall' });
    try {
      await buyPlanWithPlay(planId, user.id);
      window.location.reload();
    } catch (e) {
      if (!/cancel/i.test(String(e?.message || e))) setError(e?.message || 'No se pudo completar el pago');
      setBusy(false);
    }
  };
  const restore = async () => {
    if (!user?.id || !android) return;
    setBusy(true); setError('');
    try { await finishPendingPlayPurchases(user.id); window.location.reload(); }
    catch { setError('No encontramos compras para restaurar.'); setBusy(false); }
  };

  return (
    <div className="pw" role="dialog" aria-modal="true" aria-label="EUNACOM Premium">
      <button className="pw-close" onClick={onClose} aria-label="Cerrar"><X size={20} /></button>

      <div className="pw-slides" ref={track_} onScroll={onScroll} onTouchStart={() => { touched.current = true; }}>
        {SLIDES.map(s => (
          <section key={s.k} className="pw-slide">
            <div className={`pw-art pw-art--${s.kind}`}>
              {s.kind === 'covers'
                ? COVERS.map((c, i) => <img key={c} src={c} alt="" style={{ transform: `translateX(${(i - 2) * 44}px) rotate(${(i - 2) * 8}deg)`, zIndex: 5 - Math.abs(i - 2) }} />)
                : <img src={s.img} alt="" />}
            </div>
            <h2>{s.t}</h2>
            <p>{s.d}</p>
          </section>
        ))}
      </div>
      <div className="pw-dots">
        {SLIDES.map((s, i) => <button key={s.k} className={i === slide ? 'on' : ''} onClick={() => goSlide(i)} aria-label={`Ver ${s.t}`} />)}
      </div>

      <div className="pw-sheet">
        {exam && exam.days <= 150 && <div className="pw-exam">⏳ Faltan <b>{exam.days} días</b> para el EUNACOM del {exam.label}</div>}

        <div className="pw-plans">
          {plans.map(p => {
            const on = p.id === planId;
            const pm = perMonth(p);
            const s = save(p);
            return (
              <button key={p.id} className={`pw-plan ${on ? 'on' : ''} ${p.popular ? 'star' : ''}`} onClick={() => setPlanId(p.id)}>
                {p.popular && <span className="pw-badge">⭐ Más elegido</span>}
                <span className="pw-radio">{on && <Check size={14} strokeWidth={3} />}</span>
                <span className="pw-plan__main">
                  <b>{p.name}</b>
                  <small>{p.lifetime ? 'Un solo pago, para siempre' : 'Curso completo'}</small>
                  {p.includesLibrary ? <span className="pw-libchip">📚 + Biblioteca de regalo</span> : <span className="pw-nolib">Sin biblioteca</span>}
                </span>
                <span className="pw-plan__price">
                  <b>{priceOf(p.id)}</b>
                  {pm ? <small>≈ {pm}/mes</small> : s > 0 ? <small className="save">Ahorras {s} %</small> : null}
                  {pm && s > 0 && <small className="save">Ahorras {s} %</small>}
                </span>
              </button>
            );
          })}
        </div>

        <div className="pw-lib">
          <div className="pw-lib__covers" aria-hidden="true">
            {LIB_COVERS.map((c, i) => <img key={c} src={c} alt="" style={{ transform: `rotate(${(i - 3) * 6}deg)`, zIndex: 7 - Math.abs(i - 3) }} />)}
          </div>
          <h3>📚 La biblioteca completa viene de regalo</h3>
          <p>Con 3 meses, 6 meses o De por vida te llevas todos los libros de Academia Examen EUNACOM, para leer en la app:</p>
          <div className="pw-lib__grid">
            {LIB_ITEMS.map(x => <div key={x.t}><b>{x.n}</b><strong>{x.t}</strong><span>{x.d}</span></div>)}
          </div>
          <div className="pw-lib__value">Libro por libro costaría <s>{fmtClp(looseValue('biblioteca'))}</s>. Con tu plan: <b>$0</b>.</div>
        </div>

        <div className="pw-foot">
        <button className="pw-cta" onClick={pay} disabled={busy}>
          {busy ? 'Abriendo Google Play…' : plan.lifetime ? 'Comprar De por vida' : `Empezar con ${plan.name}`}
        </button>
        <p className="pw-terms">
          {plan.lifetime
            ? `${priceOf(plan.id)} un solo pago, sin renovación.`
            : `${priceOf(plan.id)} ${PERIOD[plan.id]}. Se renueva automáticamente hasta que la canceles en Google Play → Pagos y suscripciones.`}
          {' '}Pagas con Google Pay, tarjeta o saldo de Google Play.
        </p>
        {error && <div className="pw-error">{error}</div>}
        <div className="pw-links">
          {android && <button onClick={restore} disabled={busy}>Restaurar compras</button>}
          <a href="/privacidad">Privacidad</a>
          <a href="/reembolsos">Reembolsos</a>
        </div>
        </div>
      </div>
    </div>
  );
}
