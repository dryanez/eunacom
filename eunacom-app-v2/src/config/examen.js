// Fechas del EUNACOM-ST (eunacom.cl). Agregar la siguiente cuando se publique (julio 2027 aún sin fecha oficial).
export const EXAM_DATES = ['2026-07-08', '2026-12-16'];
const LABEL = d => new Date(`${d}T12:00:00-03:00`).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', timeZone: 'America/Santiago' });

// Próximo examen y cuántos días faltan (hora de Chile). null si no hay fecha publicada.
export function nextExam(now = new Date()) {
  const today = new Date(now.toLocaleString('en-US', { timeZone: 'America/Santiago' }));
  today.setHours(0, 0, 0, 0);
  for (const d of EXAM_DATES) {
    const exam = new Date(`${d}T00:00:00`);
    const days = Math.round((exam - today) / 86400000);
    if (days >= 0) return { date: d, days, label: LABEL(d) };
  }
  return null;
}
