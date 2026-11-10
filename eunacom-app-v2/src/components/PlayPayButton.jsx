import React, { useEffect, useState } from 'react';
import { buyPlanWithPlay, getPlayPrices } from '../lib/playBilling';

// Android app checkout: Google Play subscription (Google Pay, card or Play balance in Google's
// sheet). Play sets the final price per country, so we show Play's price, not the web price.
// Google requires the renewal terms next to the button.
const PERIOD = { '1m': 'cada mes', '3m': 'cada 3 meses', '6m': 'cada 6 meses', '1y': 'cada año' }
export default function PlayPayButton({ plan, userId }) {
  const [prices, setPrices] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { getPlayPrices().then(setPrices).catch(() => {}); }, []);

  const pay = async () => {
    setBusy(true); setError('');
    try {
      await buyPlanWithPlay(plan.id, userId);
      window.location.reload(); // reload the profile with the new plan
    } catch (e) {
      // Closing Google's sheet is not an error worth showing
      if (!/cancel/i.test(String(e?.message || e))) setError(e?.message || 'No se pudo completar el pago');
      setBusy(false);
    }
  };

  const price = prices[plan.id];
  return (
    <div style={{ textAlign: 'center' }}>
      <button
        onClick={pay}
        disabled={busy || !userId}
        style={{
          width: '100%', padding: '0.95rem 1rem', borderRadius: 12, border: 'none', cursor: 'pointer',
          background: '#fff', color: '#111', fontWeight: 700, fontSize: '1rem', opacity: busy ? 0.6 : 1,
        }}
      >
        {busy ? 'Abriendo Google Play…' : `${plan.id === 'life' ? 'Comprar' : 'Suscribirme'} con Google Play${price ? ` · ${price}` : ''}`}
      </button>
      <p style={{ color: 'var(--surface-300)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
        {plan.id === 'life'
          ? `${price ? `${price} ` : ''}un solo pago, sin renovación: acceso para siempre. Paga con Google Pay, tarjeta o saldo de Google Play.`
          : <>{price ? `${price} ` : ''}{PERIOD[plan.id]}, se renueva automáticamente hasta que la canceles.
        Cancela cuando quieras en Google Play → Pagos y suscripciones. Paga con Google Pay, tarjeta o saldo de Google Play.</>}
      </p>
      {error && <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.4rem' }}>{error}</div>}
    </div>
  );
}
