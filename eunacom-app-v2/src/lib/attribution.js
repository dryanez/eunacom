// First-touch marketing attribution: where did this visitor first come from?
// Stored once per browser and sent with the first profile save (see saveUserProfile).
const KEY = 'eunacom_first_touch'

export function captureAttribution() {
  try {
    if (localStorage.getItem(KEY)) return
    const params = new URLSearchParams(window.location.search)
    let referrer = ''
    try {
      const ref = document.referrer ? new URL(document.referrer) : null
      if (ref && ref.hostname !== window.location.hostname) referrer = ref.hostname
    } catch {}
    localStorage.setItem(KEY, JSON.stringify({
      source: params.get('utm_source') || '',
      medium: params.get('utm_medium') || '',
      campaign: params.get('utm_campaign') || '',
      ref: params.get('ref') || '',
      referrer,
      landing: window.location.pathname,
    }))
  } catch {}
}

export function getAttribution() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || 'null')
  } catch {
    return null
  }
}
