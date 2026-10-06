// Server copy of src/config/promo.js — checkout applies this discount during the promo window.
export const PROMO = {
  id: 'cyber_week_2026',
  percent: 50,
  start: '2026-10-05T03:00:00Z',
  end: '2026-10-12T02:59:59Z',
}

export function activePromoPercent(now = new Date()) {
  return now >= new Date(PROMO.start) && now <= new Date(PROMO.end) ? PROMO.percent : 0
}
