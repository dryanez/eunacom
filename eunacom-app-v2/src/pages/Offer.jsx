import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../contexts/SubscriptionContext';

const Offer = () => {
  const navigate = useNavigate();
  const { setShowPaymentModal } = useSubscription();

  useEffect(() => {
    // Enable global payment modal
    setShowPaymentModal(true);
    // Redirect to dashboard (or wherever the user was)
    navigate('/dashboard', { replace: true });
  }, [navigate, setShowPaymentModal]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-900)' }} />
  );
};

export default Offer;
