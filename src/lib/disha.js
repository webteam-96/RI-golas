import { DISHA_FIELDS, DISHA_DISTRICTS, PREVIOUS, prevValue } from '../data/disha.js'

/** Fields a district actually fills in. Read-only reference rows and free text are not targets. */
export const TARGET_FIELDS = DISHA_FIELDS.filter((f) => f.isTarget && f.dataType !== 'text')

/**
 * How far a district has got. Targets are entered live at the goal-setting event, so before
 * it runs every district reads 0 of n — that is the true state, not a bug.
 */
export function completion(districtId, targets = {}) {
  const filled = TARGET_FIELDS.filter((f) => {
    const v = targets[String(f.id)]
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

/** Existing figures a district carries — how much of its reference data is on file. */
export function coverage(districtId) {
  const prevFields = DISHA_FIELDS.filter((f) => f.showPrev)
  const filled = prevFields.filter((f) => prevValue(districtId, f.id) != null).length
  return { filled, total: prevFields.length, pct: prevFields.length ? (filled / prevFields.length) * 100 : 0 }
}

export function zoneStats(zoneId) {
  const ds = DISHA_DISTRICTS.filter((d) => d.zoneId === zoneId)
  const cov = ds.map((d) => coverage(d.id))
  return {
    districts: ds.length,
    withData: cov.filter((c) => c.filled > 0).length,
    pct: ds.length ? cov.reduce((s, x) => s + x.pct, 0) / ds.length : 0,
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

/** Sum one field across a set of districts, skipping blanks so they never read as zero. */
export function totalFor(fieldId, districtIds) {
  let sum = null
  for (const id of districtIds) {
    const v = prevValue(id, fieldId)
    const n = typeof v === 'string' ? parseFloat(v) : v
    if (typeof n === 'number' && Number.isFinite(n)) sum = (sum ?? 0) + n
  }
  return sum
}

export const districtPrev = (districtId) => PREVIOUS[String(districtId)] ?? {}
