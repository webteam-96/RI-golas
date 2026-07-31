import { DISHA_FIELDS, DISHA_DISTRICTS, GOALS, goalValue } from '../data/disha.js'

/**
 * Public Image is scored, not measured. Ported from the DISHA portal's calculatePIPoints
 * so the two agree field for field — the field ids are the portal's own.
 */
export function piPoints(goalsForDistrict = {}) {
  const g = (id) => goalsForDistrict[String(id)]
  const yes = (id) => String(g(id) ?? '').toUpperCase() === 'YES'
  const int = (id) => parseInt(g(id), 10) || 0
  const num = (id) => parseFloat(g(id)) || 0

  let points = 0
  if (yes(23)) points += 250                       // District PI seminar
  points += int(24) * 100                          // Learning sessions
  if (yes(25)) points += 500                       // District social media
  if (num(26) >= 33) points += 200                 // 33% of clubs on social media
  if (yes(27)) points += 500                       // Brand-compliant district website
  if (num(28) >= 33) points += 200
  if (yes(29)) points += 500                       // Radio / TV / electronic
  if (num(30) >= 33) points += 200

  // Projects: 100 each to 5, 200 each for 6-10, 300 each beyond 10.
  const projects = int(31)
  if (projects <= 5) points += projects * 100
  else if (projects <= 10) points += 500 + (projects - 5) * 200
  else points += 1500 + (projects - 10) * 300

  // Display: 100 each to 5, 200 each beyond.
  const displays = int(32)
  points += displays <= 5 ? displays * 100 : 500 + (displays - 5) * 200

  if (yes(33)) points += 500                       // Monthly district bulletin
  if (num(34) >= 33) points += 200
  points += int(35) * 100                          // Print media coverage
  return points
}

/** Target fields only — readonly and computed fields are not something a district fills in. */
export const TARGET_FIELDS = DISHA_FIELDS.filter((f) => f.isTarget && f.dataType !== 'text')

/**
 * How far a district has got. `filled` counts target fields carrying a value; blank cells in
 * the source stay blank rather than counting as a zero someone entered.
 */
export function completion(districtId) {
  const filled = TARGET_FIELDS.filter((f) => {
    const v = goalValue(districtId, f.id)
    return v !== null && v !== undefined && v !== ''
  }).length
  return {
    filled,
    total: TARGET_FIELDS.length,
    pct: TARGET_FIELDS.length ? (filled / TARGET_FIELDS.length) * 100 : 0,
    complete: filled === TARGET_FIELDS.length,
    started: filled > 0,
  }
}

export function zoneStats(zoneId) {
  const ds = DISHA_DISTRICTS.filter((d) => d.zoneId === zoneId)
  const stats = ds.map((d) => completion(d.id))
  const completed = stats.filter((s) => s.complete).length
  return {
    districts: ds.length,
    completed,
    started: stats.filter((s) => s.started).length,
    locked: 0,
    pct: ds.length ? stats.reduce((s, x) => s + x.pct, 0) / ds.length : 0,
  }
}

/** Group a category's fields under their section headings, in source order. */
export function sections(categoryId) {
  const out = []
  const seen = new Map()
  for (const f of DISHA_FIELDS.filter((x) => x.categoryId === categoryId).sort((a, b) => a.order - b.order)) {
    if (!seen.has(f.section)) {
      const s = { name: f.section, fields: [] }
      seen.set(f.section, s)
      out.push(s)
    }
    seen.get(f.section).fields.push(f)
  }
  return out
}

/** Indian grouping, full numbers to 999,999, millions only above that. Matches the portal. */
export function dishaNumber(v, unit) {
  if (v === null || v === undefined || v === '') return null
  if (typeof v === 'string' && !/^-?[\d.]+$/.test(v)) return v      // YES/NO and free text
  const n = Number(v)
  if (!Number.isFinite(n)) return String(v)
  const body = Math.abs(n) >= 1_000_000
    ? `${(n / 1_000_000).toFixed(2)} mn`
    : n.toLocaleString('en-IN', { maximumFractionDigits: 2 })
  return unit === '$' ? `$${body}` : unit === '%' ? `${body}%` : body
}

export const districtGoals = (districtId) => GOALS[String(districtId)] ?? {}
