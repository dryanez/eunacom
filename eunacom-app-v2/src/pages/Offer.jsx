import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useAuth } from '../contexts/AuthContext';
import PaymentModal from '../components/PaymentModal';
import { track } from '../lib/analytics';

// /oferta y /planes (correos de descuento, Instagram, Reconstrucción Julio 2026…).
// Muestra exactamente los mismos planes que la ventana de planes de la app, con o sin sesión:
// el descuento del correo (?discount=) y el código (?code=) los lee la misma ventana; al pagar sin sesión pide crear cuenta.
const Offer = () => {
  const navigate = useNavigate();
  const { isPremium } = useSubscription();
  const { user, loading } = useAuth();
  const loggedIn = !!user && !loading;
  // Solo en localhost: ?verplanes=1 muestra los planes aunque la cuenta (admin) sea Premium
  const forcePlans = import.meta.env.DEV && new URLSearchParams(window.location.search).has('verplanes');

  useEffect(() => {
    try {
      const d = Number(new URLSearchParams(window.location.search).get('discount'));
      if ([30, 40, 50].includes(d)) localStorage.setItem('eunacom_pending_discount', String(d));
    } catch {}
    track('offer_viewed', { logged_in: loggedIn });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (isPremium && loggedIn && !forcePlans) {
    return (
      <div className="plan-checkout" style={{ alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center', color: '#e2e8f0' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>✅ Ya tienes Premium activo</div>
          <button className="t-btn fill" style={{ marginTop: 16 }} onClick={() => navigate('/dashboard')}>Ir a estudiar →</button>
        </div>
      </div>
    );
  }
  return <PaymentModal onClose={() => navigate(loggedIn ? '/dashboard' : '/')} />;
};

export default Offer;
