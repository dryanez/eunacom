// Promo (Cyber Week) rules — single source for the API and the client (src/config/promo.js re-exports this).
//
// Admin controls it with the app_settings row `promo` (JSON):
//   { mode: 'auto' | 'on' | 'off', percent: 50, name: 'Cyber Week', start?: ISO, end?: ISO }
//   auto → runs on its own every Cyber week in Chile (see CYBER_WEEKS), or between start/end if given
//   on   → runs now until switched off (or until `end`, if given)
//   off  → no promo
// No row at all behaves as { mode: 'auto', percent: 50 }.

export const DEFAULT_PROMO = { mode: 'auto', percent: 50, name: 'Cyber Week' }

// Chile's two CCS cyber events start on the first Monday of June (CyberDay) and of October (CyberMonday).
// We run the discount the whole week: Monday 00:00 → Sunday 23:59, Chile time.
// utcOffset: Chile is UTC-4 in June (winter) and UTC-3 in October (summer time).
const CYBER_WEEKS = [
  { month: 5, utcOffset: -4 }, // June
  { month: 9, utcOffset: -3 }, // October
]

const MONTHS_ES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
const DAYS_ES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']

function cyberWeek(year, { month, utcOffset }) {
  const first = new Date(Date.UTC(year, month, 1))
  const day = 1 + ((8 - first.getUTCDay()) % 7) // first Monday
  const start = new Date(Date.UTC(year, month, day, -utcOffset, 0, 0))
  const end = new Date(Date.UTC(year, month, day + 6, 23 - utcOffset, 59, 59))
  return { start, end, utcOffset }
}

// Chile-time label like "domingo 11 de octubre, 23:59 h"
function endLabel(end, utcOffset) {
  const local = new Date(end.getTime() + utcOffset * 3600 * 1000)
  return `${DAYS_ES[local.getUTCDay()]} ${local.getUTCDate()} de ${MONTHS_ES[local.getUTCMonth()]}, 23:59 h`
}

export function parsePromoSetting(raw) {
  if (!raw) return { ...DEFAULT_PROMO }
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    return { ...DEFAULT_PROMO, ...parsed }
  } catch {
    return { ...DEFAULT_PROMO }
  }
}

// Returns the running promo ({ name, percent, end, endLabel }) or null.
export function resolvePromo(setting, now = new Date()) {
  const cfg = parsePromoSetting(setting)
  const percent = Math.min(Math.max(Number(cfg.percent) || 0, 0), 90)
  if (cfg.mode === 'off' || !percent) return null

  const start = cfg.start ? new Date(cfg.start) : null
  const end = cfg.end ? new Date(cfg.end) : null
  const base = { name: cfg.name || DEFAULT_PROMO.name, percent }

  if (cfg.mode === 'on') {
    if (end && now > end) return null
    return { ...base, end, endLabel: end ? endLabel(end, -3) : null }
  }

  // auto: explicit dates win, otherwise the yearly Chilean cyber weeks
  if (start && end) {
    return now >= start && now <= end ? { ...base, end, endLabel: endLabel(end, -3) } : null
  }
  for (const rule of CYBER_WEEKS) {
    const w = cyberWeek(now.getUTCFullYear(), rule)
    if (now >= w.start && now <= w.end) return { ...base, end: w.end, endLabel: endLabel(w.end, w.utcOffset) }
  }
  return null
}

export function discountedClp(clp, percent) {
  return Math.round(clp * (1 - percent / 100))
}

// Server helper: read the admin setting from Turso and resolve it.
export async function getActivePromo(db) {
  try {
    const r = await db.execute({ sql: `SELECT value FROM app_settings WHERE key = 'promo'`, args: [] })
    return resolvePromo(r.rows?.[0]?.value)
  } catch {
    return resolvePromo(null)
  }
}
