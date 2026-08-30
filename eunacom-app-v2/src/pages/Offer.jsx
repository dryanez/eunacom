import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../contexts/SubscriptionContext';

const Offer = () => {
  const navigate = useNavigate();
  const { setShowPaymentModal } = useSubscription();

  useEffect(() => {
    // Extract discount parameter if present (30, 40, 50)
    try {
      const params = new URLSearchParams(window.location.search);
      const discount = params.get('discount');
      if (discount) {
        localStorage.setItem('eunacom_pending_discount', discount);
      }
    } catch {}

    // Enable global payment modal
    setShowPaymentModal(true);
    // Redirect to dashboard with discount query preserved
    navigate(`/dashboard${window.location.search}`, { replace: true });
  }, [navigate, setShowPaymentModal]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-900)' }} />
  );
};

export default Offer;
