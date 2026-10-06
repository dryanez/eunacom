import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useAuth } from '../contexts/AuthContext';
import { promoPrice } from '../config/promo';

const PRICES = [
  { name: '1 Mes', price: '$14.990' },
  { name: '3 Meses', price: '$34.990' },
  { name: '6 Meses', price: '$54.990', popular: true },
  { name: '1 Año', price: '$89.990' },
];

// Landing for campaign email links (/oferta?discount=50). Shows the offer itself, then opens
// checkout (logged in) or login (logged out). Stays on this page so an expired cached session
// ends in the login box here instead of an empty dashboard.
const Offer = () => {
  const navigate = useNavigate();
  const { setShowPaymentModal, promo, isPremium } = useSubscription();
  const { user, loading, openAuthModal } = useAuth();
  useEffect(() => {
    try {
      const discount = new URLSearchParams(window.location.search).get('discount');
      if (discount) localStorage.setItem('eunacom_pending_discount', discount);
    } catch {}
  }, []);

  const loggedIn = !!user && !loading;

  const askLogin = () => {
    // SubscriptionContext opens checkout as soon as the user logs in
    try { sessionStorage.setItem('eunacom_open_checkout', '1') } catch {}
    openAuthModal('login', 'Inicia sesión para activar tu descuento');
  };

  // Open checkout right away for a logged-in user. If the cached user's session turns out to be
  // expired, AuthContext clears the user, checkout closes and we ask to log in on this same page.
  useEffect(() => {
    if (loading) return;
    if (user) {
      if (!isPremium) setShowPaymentModal(true);
    } else {
      askLogin();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, !!user]);

  const claim = () => (loggedIn ? setShowPaymentModal(true) : askLogin());
  const percent = promo?.percent || 0;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '32px 16px' }}>
      <div style={{
        width: '100%', maxWidth: 460, background: '#ffffff', borderRadius: 20, overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)', fontFamily: 'var(--font, Arial, sans-serif)',
      }}>
        <div style={{ background: '#0f2a5c', padding: '28px 20px 24px', textAlign: 'center' }}>
          <img src="/logo.png" alt="EUNACOM App" width="54" height="41" style={{ display: 'block', margin: '0 auto 10px', background: '#ffffff', borderRadius: 10, padding: 4 }} />
          {percent ? (
            <>
              <div style={{ display: 'inline-block', background: '#22d3ee', color: '#0f2a5c', fontSize: 12, fontWeight: 800, letterSpacing: 1.5, padding: '5px 12px', borderRadius: 999 }}>
                {promo.name.toUpperCase()}
              </div>
              <div style={{ fontSize: 48, lineHeight: 1, fontWeight: 800, color: '#ffffff', marginTop: 12 }}>{percent}% DCTO</div>
              <div style={{ fontSize: 15, color: '#c7d6f5', marginTop: 8 }}>en todos los planes</div>
              {promo.endLabel && <div style={{ fontSize: 13, color: '#ffffff', marginTop: 10 }}>⏳ Hasta el <strong>{promo.endLabel}</strong></div>}
            </>
          ) : (
            <div style={{ fontSize: 26, fontWeight: 800, color: '#ffffff' }}>Planes EUNACOM App</div>
          )}
        </div>

        <div style={{ padding: '18px 20px 22px' }}>
          {PRICES.map(p => (
            <div key={p.name} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', marginBottom: 6,
              borderRadius: 10, background: p.popular ? '#e6efff' : '#f5f8fe', border: p.popular ? '2px solid #2563eb' : '2px solid transparent',
            }}>
              <span style={{ fontWeight: 700, color: '#1f2937', fontSize: 14 }}>{p.name}</span>
              <span>
                {percent > 0 && <span style={{ color: '#8a94a6', textDecoration: 'line-through', fontSize: 13, marginRight: 10 }}>{p.price}</span>}
                <span style={{ color: '#2563eb', fontWeight: 800, fontSize: 17 }}>{percent ? promoPrice(p.price, percent) : p.price}</span>
              </span>
            </div>
          ))}
          <div style={{ fontSize: 12.5, color: '#4b5563', lineHeight: 1.5, margin: '10px 2px 14px' }}>
            +10.600 preguntas · 16 reconstrucciones de exámenes reales · 21 libros por especialidad · +650 videos · nueva plataforma de clases la próxima semana.
          </div>

          {isPremium && loggedIn ? (
            <div style={{ textAlign: 'center', color: '#166534', fontWeight: 700, padding: '10px 0' }}>✅ Ya tienes Premium activo.</div>
          ) : (
            <button onClick={claim} style={{
              width: '100%', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: 12,
              padding: '14px 0', fontSize: 16, fontWeight: 800, cursor: 'pointer',
            }}>
              {loggedIn
                ? (percent ? `Activar mi ${percent}% DCTO →` : 'Ver planes →')
                : (percent ? `Inicia sesión y activa tu ${percent}% DCTO →` : 'Iniciar sesión →')}
            </button>
          )}
          {!loggedIn && (
            <button onClick={() => openAuthModal('register')} style={{
              width: '100%', background: 'none', border: 'none', color: '#2563eb', fontSize: 13.5, fontWeight: 700, marginTop: 8, cursor: 'pointer', padding: 6,
            }}>
              ¿No tienes cuenta? Créala gratis
            </button>
          )}
          <button onClick={() => navigate('/dashboard')} style={{
            width: '100%', background: 'none', border: 'none', color: '#6b7280', fontSize: 13, marginTop: 4, cursor: 'pointer', padding: 6,
          }}>
            Ir a mi panel
          </button>
        </div>
      </div>
    </div>
  );
};

export default Offer;
