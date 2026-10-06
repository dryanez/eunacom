// Client side of the promo rules. The rules live in api/_promo.js (shared with checkout);
// the live promo comes from useSubscription().promo, which reads the admin setting.
export { resolvePromo, parsePromoSetting, DEFAULT_PROMO } from '../../api/_promo.js'

export function promoPrice(clpString, percent) {
  const num = parseInt(String(clpString).replace(/\D/g, ''), 10)
  return `$${Math.round(num * (1 - percent / 100)).toLocaleString('es-CL')}`
}
