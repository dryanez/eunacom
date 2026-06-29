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
  const [isFounder, setIsFounder] = useState(false);
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
            // Check if user is premium and hasn't expired
            let valid = false;
            if (profile.is_premium === 1) {
              if (profile.premium_until) {
                const expiresAt = new Date(profile.premium_until);
                if (expiresAt > new Date()) {
                  valid = true;
                }
              } else {
                // Legacy or manually activated users with no expiration date
                valid = true;
              }
            }
            setIsPremium(valid);
            setIsFounder(valid && profile.plan_months === 1200);
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
    <SubscriptionContext.Provider value={{ isPremium, isFounder, togglePremium, loadingPremium }}>
      {children}
    </SubscriptionContext.Provider>
  );
}
