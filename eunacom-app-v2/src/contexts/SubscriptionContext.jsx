import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { fetchUserProfile, fetchTests, fetchClaseProgress, fetchAppSettings } from '../lib/api';
import PaymentModal from '../components/PaymentModal';

const SubscriptionContext = createContext();

export function useSubscription() {
  return useContext(SubscriptionContext);
}

export function SubscriptionProvider({ children }) {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isFounder, setIsFounder] = useState(true);
  const [loadingPremium, setLoadingPremium] = useState(false);
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

    // Always fetch global settings, regardless of user auth state
    fetchAppSettings()
      .then(settings => {
        if (mounted && settings.freemium_mode) {
          setFreemiumMode(settings.freemium_mode);
        }
      })
      .catch(err => console.error("Error fetching app settings:", err));

    if (user) {
      setLoadingPremium(true);
      
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
          
          if (mounted && tests && claseProgress) {
            const clasesOpened = claseProgress.length;
            
            // Reconstructions: completed tests with a question ID containing '_q'
            const reconstructionsCompleted = tests.filter(t => 
              t.status === 'completed' && 
              t.questions && t.questions.includes('_q') &&
              t.mode !== 'simulation' // just in case
            ).length;
            
            // Simulations: completed tests with mode 'simulation'
            const simulationsCompleted = tests.filter(t => 
              t.status === 'completed' && t.mode === 'simulation'
            ).length;
            
            // Custom Questions: answered questions in non-reconstruction, non-simulation tests
            let customQuestionsAnswered = 0;
            const customTests = tests.filter(t => 
              t.mode !== 'simulation' && !(t.questions && t.questions.includes('_q'))
            );
            
            customTests.forEach(t => {
              try {
                const answers = typeof t.answers === 'string' ? JSON.parse(t.answers) : (t.answers || {});
                customQuestionsAnswered += Object.keys(answers).length;
              } catch (e) {}
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
      setLoadingPremium(false);
      setUsageStats({ clasesOpened: 0, reconstructionsCompleted: 0, simulationsCompleted: 0, customQuestionsAnswered: 0 });
    }
    
    return () => { mounted = false; };
  }, [user]);

  // Convenience flags for the UI
  const hasExceededClasses = !isPremium && usageStats.clasesOpened >= 5;
  const hasExceededReconstructions = !isPremium && usageStats.reconstructionsCompleted >= 1;
  const hasExceededSimulations = !isPremium && usageStats.simulationsCompleted >= 1;
  const hasExceededQuestions = !isPremium && usageStats.customQuestionsAnswered >= 100;

  return (
    <SubscriptionContext.Provider value={{ 
      isPremium, 
      isFounder, 
      togglePremium, 
      loadingPremium,
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
