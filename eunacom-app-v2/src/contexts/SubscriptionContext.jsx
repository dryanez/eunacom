import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { fetchUserProfile, fetchTests, fetchClaseProgress, fetchAppSettings, capturePaypalOrder, fetchUserBooks } from '../lib/api';
import PaymentModal from '../components/PaymentModal';
import { resolvePromo } from '../config/promo';
import { expandSkus, resolveCoupon, LIBRARY_ITEMS, LIBRARY_MIN_PLAN_MONTHS } from '../config/tienda';

const COUPON_KEY = 'eunacom_coupon';

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
  const [promoSetting, setPromoSetting] = useState(null); // admin app_settings.promo (JSON)
  const [promoLoaded, setPromoLoaded] = useState(false);
  const promo = promoLoaded ? resolvePromo(promoSetting) : null;

  // Plan y libros comprados (tienda /biblioteca)
  const [planMonths, setPlanMonths] = useState(0);
  const [books, setBooks] = useState({ skus: [], planLibrary: false, credit: { amount: 0, until: null } });
  const [booksVersion, setBooksVersion] = useState(0);
  const refreshBooks = () => setBooksVersion(v => v + 1);

  // Cupón de redes (SHORTS20): llega por ?code= / ?cupon= o se escribe en el checkout
  const [coupon, setCouponState] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const fromUrl = resolveCoupon(params.get('code') || params.get('cupon') || params.get('coupon'));
      if (fromUrl) { localStorage.setItem(COUPON_KEY, fromUrl.code); return fromUrl; }
      return resolveCoupon(localStorage.getItem(COUPON_KEY));
    } catch { return null; }
  });
  const setCoupon = (code) => {
    const c = resolveCoupon(code);
    setCouponState(c);
    try { c ? localStorage.setItem(COUPON_KEY, c.code) : localStorage.removeItem(COUPON_KEY); } catch {}
    return c;
  };
  
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

  // Came from an offer link (/oferta) before logging in → open checkout once the user is logged in
  useEffect(() => {
    if (!user?.id) return;
    try {
      if (sessionStorage.getItem('eunacom_open_checkout')) {
        sessionStorage.removeItem('eunacom_open_checkout');
        setShowPaymentModal(true);
      }
    } catch {}
  }, [user?.id]);

  // Buyer returns from an in-app PayPal order (?paypal=return&token=ORDER_ID): capture it, then
  // hand over to the normal ?payment=success flow, which reloads the premium status.
  useEffect(() => {
    if (!user?.id) return;
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('token');
    if (params.get('paypal') !== 'return' || !orderId) return;
    capturePaypalOrder(user.id, orderId)
      .then(() => window.location.replace('/dashboard?payment=success'))
      .catch(err => {
        console.error('PayPal capture failed:', err);
        window.location.replace('/dashboard?payment=failure');
      });
  }, [user?.id]);

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
        if (mounted) {
          setPromoSetting(settings.promo || null);
          setPromoLoaded(true);
        }
      })
      .catch(err => {
        console.error("Error fetching app settings:", err);
        if (mounted) setPromoLoaded(true); // fall back to the default yearly schedule
      });

    if (user) {
      if (!isUserAdmin) {
        setLoadingPremium(true);
      }

      // Detect payment redirect from Mercado Pago / PayPal
      const searchParams = new URLSearchParams(window.location.search)
      const hasPaymentSuccessParam = 
        searchParams.get('payment') === 'success' ||
        searchParams.get('collection_status') === 'approved' ||
        searchParams.get('status') === 'approved' ||
        searchParams.has('payment_id')

      if (hasPaymentSuccessParam) {
        try {
          localStorage.removeItem(`eunacom_cached_is_premium_${user.id}`)
        } catch (e) {}
      }

      const loadUserData = async (pollAttempt = 0) => {
        try {
          const [profile, tests, claseProgress] = await Promise.all([
            fetchUserProfile(user.id),
            fetchTests(user.id).catch(() => []),
            fetchClaseProgress(user.id).catch(() => [])
          ])

          if (!mounted) return

          if (profile) {
            let valid = false
            if (isUserAdmin) {
              valid = true
            } else if (profile.is_premium === 1) {
              if (profile.premium_until) {
                const expiresAt = new Date(profile.premium_until)
                if (expiresAt > new Date()) valid = true
              } else {
                valid = true
              }
            }

            // If user just paid but webhook has not finished writing to Turso yet, poll up to 3 times
            if (!valid && hasPaymentSuccessParam && pollAttempt < 3) {
              setTimeout(() => {
                if (mounted) loadUserData(pollAttempt + 1)
              }, 2000)
              return
            }

            setIsPremium(valid)
            setPlanMonths(valid ? Number(profile.plan_months || 0) : 0)
            setIsFounder(isUserAdmin || (valid && profile.plan_months === 1200))
            try {
              localStorage.setItem(`eunacom_cached_is_premium_${user.id}`, JSON.stringify(valid))
            } catch (e) {}

            // Clean up payment query params once processed
            if (hasPaymentSuccessParam && valid) {
              window.history.replaceState(null, '', window.location.pathname)
            }
          }

          if (tests && claseProgress) {
            const clasesOpened = claseProgress.length
            const reconstructionsCompleted = tests.filter(t => {
              const qStr = typeof t.questions === 'string' ? t.questions : JSON.stringify(t.questions || [])
              return t.mode !== 'simulation' && (t.mode === 'reconstruction' || qStr.includes('_q'))
            }).length
            const simulationsCompleted = tests.filter(t => t.mode === 'simulation').length
            let customQuestionsAnswered = 0
            const customTests = tests.filter(t => {
              const qStr = typeof t.questions === 'string' ? t.questions : JSON.stringify(t.questions || [])
              return t.mode !== 'simulation' && !qStr.includes('_q')
            })
            customTests.forEach(t => {
              try {
                const qList = typeof t.questions === 'string' ? JSON.parse(t.questions) : (t.questions || [])
                const count = t.total_questions || t.totalQuestions || (Array.isArray(qList) ? qList.length : 0)
                customQuestionsAnswered += count
              } catch (e) {
                if (t.total_questions) customQuestionsAnswered += t.total_questions
              }
            })
            setUsageStats({
              clasesOpened,
              reconstructionsCompleted,
              simulationsCompleted,
              customQuestionsAnswered
            })
          }
        } catch (err) {
          console.error("Error fetching premium status & usage:", err)
        } finally {
          if (mounted) setLoadingPremium(false)
        }
      }

      loadUserData(0)
    } else {
      setIsPremium(false);
      setIsFounder(false);
      setLoadingPremium(false);
      setUsageStats({ clasesOpened: 0, reconstructionsCompleted: 0, simulationsCompleted: 0, customQuestionsAnswered: 0 });
    }
    
    return () => { mounted = false; };
  }, [user, isUserAdmin]);

  useEffect(() => {
    if (!user?.id) { setBooks({ skus: [], planLibrary: false, credit: { amount: 0, until: null } }); return; }
    let mounted = true;
    fetchUserBooks(user.id)
      .then(data => { if (mounted && data) setBooks({ skus: data.skus || [], planLibrary: !!data.planLibrary, credit: data.credit || { amount: 0, until: null } }); })
      .catch(err => console.error('Error fetching books:', err));
    return () => { mounted = false; };
  }, [user?.id, booksVersion]);

  const effectiveIsPremium = isUserAdmin || isPremium;
  const effectiveIsFounder = isUserAdmin || isFounder;
  // Planes de 6 meses o más (y admin) traen la biblioteca completa; si no, solo lo comprado
  const libraryIncluded = isUserAdmin || books.planLibrary || (isPremium && planMonths >= LIBRARY_MIN_PLAN_MONTHS);
  const ownedBooks = libraryIncluded ? new Set(LIBRARY_ITEMS) : expandSkus(books.skus);

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
      setShowPaymentModal,
      promo,
      promoSetting,
      setPromoSetting,
      planMonths: isUserAdmin ? 1200 : planMonths,
      libraryIncluded,
      ownedBooks,
      purchasedBookSkus: books.skus,
      upgradeCredit: books.credit,
      refreshBooks,
      coupon,
      setCoupon
    }}>
      {children}
      {/* Checkout needs a logged-in user; a pending open waits until login */}
      {showPaymentModal && user && <PaymentModal onClose={() => setShowPaymentModal(false)} />}
    </SubscriptionContext.Provider>
  );
}
