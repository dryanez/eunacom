// Product analytics (PostHog). PostHog loads from index.html only after cookie consent, so every call
// is a no-op when window.posthog is missing; the stub queues calls made before posthog.init finishes.
// Funnel events: sign_up_completed → plans_viewed → checkout_started → payment_succeeded / payment_failed.
// Only the Supabase user id is sent to PostHog — no email, name or phone.

function ph() {
  return typeof window !== 'undefined' ? window.posthog : null
}

export function track(event, props = {}) {
  try { ph()?.capture?.(event, props) } catch {}
}

export function identifyUser(user) {
  if (!user?.id || String(user.id).startsWith('dev_')) return
  try {
    ph()?.identify?.(user.id, {}, { signup_method: user.app_metadata?.provider || 'email' })
  } catch {}
}

export function resetAnalytics() {
  try { ph()?.reset?.() } catch {}
}
