// "Hasta tu examen" plan: one-time price, premium until the day after the next EUNACOM sitting.
// Keep in sync with src/config/examPlan.js. Update both after each sitting (next: July 2027).
export const EXAM_PLAN = {
  id: 'exam',
  title: 'EUNACOM Examen - Acceso hasta el 16 de diciembre',
  price: 49990,
  usd: 54,
  examDate: '2026-12-16',
  // End of 17 Dec in Chile (UTC-3 in summer): one day of slack after the exam
  until: '2026-12-18T03:00:00.000Z',
}

export function examPlanOpen(now = new Date()) {
  return now < new Date(`${EXAM_PLAN.examDate}T03:00:00.000Z`)
}

// Never shortens access the user already has
export function examPlanUntil(currentUntil) {
  const until = new Date(EXAM_PLAN.until)
  const current = currentUntil ? new Date(currentUntil) : null
  return (current && current > until ? current : until).toISOString()
}
