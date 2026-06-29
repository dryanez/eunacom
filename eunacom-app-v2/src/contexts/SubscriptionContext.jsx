import React, { createContext, useContext, useState, useEffect } from 'react';

const SubscriptionContext = createContext();

export function useSubscription() {
  return useContext(SubscriptionContext);
}

export function SubscriptionProvider({ children }) {
  // Check localStorage for a saved state to persist toggling across reloads during testing
  const [isPremium, setIsPremium] = useState(() => {
    const saved = localStorage.getItem('isPremium');
    return saved === 'true' || false;
  });

  const togglePremium = () => {
    setIsPremium(prev => !prev);
  };

  useEffect(() => {
    localStorage.setItem('isPremium', isPremium.toString());
  }, [isPremium]);

  return (
    <SubscriptionContext.Provider value={{ isPremium, togglePremium }}>
      {children}
    </SubscriptionContext.Provider>
  );
}
