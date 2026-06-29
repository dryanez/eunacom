import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { fetchUserProfile } from '../lib/api';

const SubscriptionContext = createContext();

export function useSubscription() {
  return useContext(SubscriptionContext);
}

export function SubscriptionProvider({ children }) {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [loadingPremium, setLoadingPremium] = useState(true);

  // We keep this for testing purposes, but default it to false
  const togglePremium = () => {
    setIsPremium(prev => !prev);
  };

  useEffect(() => {
    let mounted = true;
    if (user) {
      setLoadingPremium(true);
      fetchUserProfile(user.id)
        .then(profile => {
          if (mounted && profile) {
            setIsPremium(profile.is_premium === 1);
          }
        })
        .catch(err => console.error("Error fetching premium status:", err))
        .finally(() => {
          if (mounted) setLoadingPremium(false);
        });
    } else {
      setIsPremium(false);
      setLoadingPremium(false);
    }
    
    return () => { mounted = false; };
  }, [user]);

  return (
    <SubscriptionContext.Provider value={{ isPremium, togglePremium, loadingPremium }}>
      {children}
    </SubscriptionContext.Provider>
  );
}
