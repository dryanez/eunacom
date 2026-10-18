// Keep in sync with api/_exam-plan.js
export const EXAM_PLAN = {
  id: 'exam',
  name: 'Hasta el 16 de diciembre',
  price: '$49.990',
  desc: 'Pago único · acceso total hasta tu EUNACOM del 16/12',
  examDate: '2026-12-16',
}

export function examPlanOpen(now = new Date()) {
  return now < new Date(`${EXAM_PLAN.examDate}T03:00:00.000Z`)
}
