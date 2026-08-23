import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { fetchUserProfile, fetchTests, fetchClaseProgress, fetchAppSettings } from '../lib/api';
import PaymentModal from '../components/PaymentModal';

const SubscriptionContext = createContext();

export function useSubscription() {
  return useContext(SubscriptionContext);
}

export function SubscriptionProvider({ children }) {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const isUserAdmin = typeof isAdmin === 'function' && isAdmin();

  const [isPremium, setIsPremium] = useState(() => {
    if (isUserAdmin) return true;
    if (user?.id) {
      try {
        const cached = localStorage.getItem(`eunacom_cached_is_premium_${user.id}`);
        if (cached !== null) return JSON.parse(cached);
      } catch (e) {}
    }
    return false;
  });

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isFounder, setIsFounder] = useState(() => isUserAdmin);
  const [loadingPremium, setLoadingPremium] = useState(() => !isUserAdmin && !!user);
  const [freemiumMode, setFreemiumMode] = useState('strict'); // strict or usage
  
  // Freemium usage tracking
  const [usageStats, setUsageStats] = useState({
    clasesOpened: 0,
    reconstructionsCompleted: 0,
    simulationsCompleted: 0,
    customQuestionsAnswered: 0
  });

  // We keep this for testing purposes, but default it to false
  const togglePremium = () => {
    setIsPremium(prev => !prev);
  };

  useEffect(() => {
    let mounted = true;

    // If admin is active, immediately ensure premium without waiting for server response
    if (isUserAdmin) {
      setIsPremium(true);
      setIsFounder(true);
      setLoadingPremium(false);
    }

    // Always fetch global settings, regardless of user auth state
    fetchAppSettings()
      .then(settings => {
        if (mounted && settings.freemium_mode) {
          setFreemiumMode(settings.freemium_mode);
        }
      })
      .catch(err => console.error("Error fetching app settings:", err));

    if (user) {
      if (!isUserAdmin) {
        setLoadingPremium(true);
      }
      
      // Fetch profile and usage stats in parallel
      Promise.all([
        fetchUserProfile(user.id),
        fetchTests(user.id).catch(() => []),
        fetchClaseProgress(user.id).catch(() => [])
      ])
        .then(([profile, tests, claseProgress]) => {
          if (mounted && profile) {
            // Check if user is premium and hasn't expired
            let valid = false;
            if (isUserAdmin) {
              valid = true;
            } else if (profile.is_premium === 1) {
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
            setIsFounder(isUserAdmin || (valid && profile.plan_months === 1200));
            try {
              localStorage.setItem(`eunacom_cached_is_premium_${user.id}`, JSON.stringify(valid));
            } catch (e) {}
          }
          
          if (mounted && tests && claseProgress) {
            const clasesOpened = claseProgress.length;
            
            // Reconstructions: ALL created tests with '_q' in questions or mode 'reconstruction'
            const reconstructionsCompleted = tests.filter(t => {
              const qStr = typeof t.questions === 'string' ? t.questions : JSON.stringify(t.questions || []);
              return t.mode !== 'simulation' && (t.mode === 'reconstruction' || qStr.includes('_q'));
            }).length;
            
            // Simulations: ALL created tests with mode 'simulation'
            const simulationsCompleted = tests.filter(t => 
              t.mode === 'simulation'
            ).length;
            
            // Custom Questions: count ALL questions in created custom tests
            let customQuestionsAnswered = 0;
            const customTests = tests.filter(t => {
              const qStr = typeof t.questions === 'string' ? t.questions : JSON.stringify(t.questions || []);
              return t.mode !== 'simulation' && !qStr.includes('_q');
            });
            
            customTests.forEach(t => {
              try {
                const qList = typeof t.questions === 'string' ? JSON.parse(t.questions) : (t.questions || []);
                const count = t.total_questions || t.totalQuestions || (Array.isArray(qList) ? qList.length : 0);
                customQuestionsAnswered += count;
              } catch (e) {
                if (t.total_questions) customQuestionsAnswered += t.total_questions;
              }
            });
            
            setUsageStats({
              clasesOpened,
              reconstructionsCompleted,
              simulationsCompleted,
              customQuestionsAnswered
            });
          }
        })
        .catch(err => console.error("Error fetching premium status & usage:", err))
        .finally(() => {
          if (mounted) setLoadingPremium(false);
        });
    } else {
      setIsPremium(false);
      setIsFounder(false);
      setLoadingPremium(false);
      setUsageStats({ clasesOpened: 0, reconstructionsCompleted: 0, simulationsCompleted: 0, customQuestionsAnswered: 0 });
    }
    
    return () => { mounted = false; };
  }, [user, isUserAdmin]);

  const effectiveIsPremium = isUserAdmin || isPremium;
  const effectiveIsFounder = isUserAdmin || isFounder;

  // Convenience flags for the UI
  const hasExceededClasses = !effectiveIsPremium && usageStats.clasesOpened >= 3;
  const hasExceededReconstructions = !effectiveIsPremium && usageStats.reconstructionsCompleted >= 1;
  const hasExceededSimulations = !effectiveIsPremium && usageStats.simulationsCompleted >= 1;
  const hasExceededQuestions = !effectiveIsPremium && usageStats.customQuestionsAnswered >= 20;

  return (
    <SubscriptionContext.Provider value={{ 
      isPremium: effectiveIsPremium, 
      isFounder: effectiveIsFounder, 
      togglePremium, 
      loadingPremium: loadingPremium || authLoading,
      freemiumMode,
      usageStats,
      hasExceededClasses,
      hasExceededReconstructions,
      hasExceededSimulations,
      hasExceededQuestions,
      showPaymentModal,
      setShowPaymentModal
    }}>
      {children}
      {showPaymentModal && <PaymentModal onClose={() => setShowPaymentModal(false)} />}
    </SubscriptionContext.Provider>
  );
}
