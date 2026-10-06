// Cyber Week 2026 — 50% off every plan. Prices go back to normal automatically after END.
// Keep in sync with api/_promo.js (server applies the same discount at checkout).
export const PROMO = {
  id: 'cyber_week_2026',
  name: 'Cyber Week',
  percent: 50,
  start: '2026-10-05T03:00:00Z', // lunes 5 oct, 00:00 hora Chile
  end: '2026-10-12T02:59:59Z',   // domingo 11 oct, 23:59 hora Chile
  endLabel: 'domingo 11 de octubre, 23:59 h',
}

export function isPromoActive(now = new Date()) {
  return now >= new Date(PROMO.start) && now <= new Date(PROMO.end)
}

export function promoPrice(clpString, percent = PROMO.percent) {
  const num = parseInt(String(clpString).replace(/\D/g, ''), 10)
  return `$${Math.round(num * (1 - percent / 100)).toLocaleString('es-CL')}`
}
