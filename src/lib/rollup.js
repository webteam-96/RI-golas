// Relative imports (not the @/ alias) so this module and its check can run under plain node.
import { CLUBS, CLUBS_BY_DISTRICT } from '../data/clubs.js'
import { clubMetric, foundationMetric } from '../data/metrics.js'
import { ZONE, DISTRICTS, MONTHS_ELAPSED } from '../data/zone6.js'

// ─────────────────────────────────────────────────────────────────────────────
// Two rules run through everything below and are the reason this file exists.
//
//  1. null is not zero. A club that did not report a figure is excluded from the
//     numerator AND the denominator. Coercing it to 0 silently drags averages down.
//  2. Percentages are weighted by member count, never plain-averaged. A 13-member club
//     and a 324-member club do not get an equal vote. See lib/rollup.test.js.
// ─────────────────────────────────────────────────────────────────────────────

const isNum = (v) => typeof v === 'number' && Number.isFinite(v)

/** Clubs belonging to a district (may be empty — most Zone 6 districts have no club data). */
export const clubsIn = (districtId) => CLUBS_BY_DISTRICT[districtId] ?? []

/** Every club in the zone. */
export const clubsInZone = () => CLUBS

/**
 * Combine a club-entered metric across a set of clubs.
 * Returns { value, reporting, total } so callers can state coverage honestly.
 */
export function aggregateClubs(metric, clubs) {
  const total = clubs.length
  const vals = clubs.map((c) => ({ c, v: metric.get(c) })).filter((x) => isNum(x.v))
  const reporting = vals.length
  if (!reporting) return { value: null, reporting: 0, total }

  if (metric.rollup === 'weightedMean') {
    // Weight by member count. Clubs with no member count cannot be weighted, so they
    // drop out rather than defaulting to weight 1 (which would be a plain average again).
    const w = vals.filter((x) => isNum(x.c.membership.current))
    if (!w.length) return { value: null, reporting: 0, total }
    const num = w.reduce((s, x) => s + x.v * x.c.membership.current, 0)
    const den = w.reduce((s, x) => s + x.c.membership.current, 0)
    return { value: den ? num / den : null, reporting: w.length, total }
  }

  if (metric.rollup === 'recompute') {
    const t = {
      members: sumBy(clubs, (c) => c.membership.current),
      membersAtStart: sumBy(clubs, (c) => c.membership.atRYStart),
      clubTrfUSD: sumBy(clubs, (c) => c.trf.totalUSD),
    }
    return { value: metric.recompute(t), reporting, total }
  }

  return { value: vals.reduce((s, x) => s + x.v, 0), reporting, total }
}

const sumBy = (arr, f) => arr.reduce((s, x) => { const v = f(x); return isNum(v) ? s + v : s }, 0)

/**
 * Actual for any metric at any scope.
 * scope: 'club' | 'district' | 'zone' | 'ri'
 */
export function actualFor(metricId, scope, scopeId) {
  const fm = foundationMetric(metricId)
  if (fm) return foundationActual(fm, scope, scopeId)

  const cm = clubMetric(metricId)
  if (!cm) return { value: null, reporting: 0, total: 0 }

  if (scope === 'club') {
    const club = CLUBS.find((c) => c.id === scopeId)
    const v = club ? cm.get(club) : null
    return { value: isNum(v) ? v : null, reporting: isNum(v) ? 1 : 0, total: 1 }
  }
  if (scope === 'district') return aggregateClubs(cm, clubsIn(scopeId))
  return aggregateClubs(cm, clubsInZone()) // zone and ri
}

function foundationActual(m, scope, scopeId) {
  if (scope === 'club') return { value: null, reporting: 0, total: 0 } // district-level metric

  const ids = scope === 'district' ? [scopeId] : ZONE.districtIds
  const vals = ids.map((d) => m.actuals[d])
  const present = vals.filter((v) => v !== null && v !== undefined)

  if (m.unit === 'yesno') {
    // Yes/No never becomes a percentage. It reports "n of m districts achieved".
    const yes = present.filter((v) => v === true).length
    return { value: yes, reporting: present.length, total: ids.length, isYesNo: true }
  }
  const nums = present.filter(isNum)
  if (!nums.length) return { value: null, reporting: 0, total: ids.length }
  return { value: nums.reduce((s, v) => s + v, 0), reporting: nums.length, total: ids.length }
}

/**
 * Zone total summed DIRECTLY over districts. Never route this through ZONE.coordinators —
 * D3120 is supported by the RRFC and by ARRFC Jhunjhunuwala, so a coordinator-path sum
 * double-counts it. The coordinator layer is a filter, not an arithmetic path.
 */
export const zoneTotal = (metricId) => actualFor(metricId, 'zone', ZONE.id).value

/** A coordinator's slice: their supported districts only, each counted once. */
export function coordinatorTotal(metricId, coordinator) {
  const fm = foundationMetric(metricId)
  if (fm) {
    const vals = coordinator.supports.map((d) => fm.actuals[d]).filter((v) => v !== null && v !== undefined)
    if (fm.unit === 'yesno') return vals.filter((v) => v === true).length
    const nums = vals.filter(isNum)
    return nums.length ? nums.reduce((s, v) => s + v, 0) : null
  }
  const cm = clubMetric(metricId)
  if (!cm) return null
  const clubs = coordinator.supports.flatMap(clubsIn)
  return aggregateClubs(cm, clubs).value
}

export function percentAchieved(target, actual, higherIsBetter = true) {
  if (!isNum(target) || target === 0 || !isNum(actual)) return null
  const pct = (actual / target) * 100
  if (higherIsBetter) return pct
  // Lower-is-better: staying at or under target is 100%. Overshooting scales down.
  return actual <= target ? 100 : (target / actual) * 100
}

/**
 * Pace-aware status. 60% achieved means something very different in August than in May,
 * so raw percent alone would mislabel almost everything early in the Rotary year.
 */
export function goalStatus(percent, monthsElapsed = MONTHS_ELAPSED) {
  if (percent === null) return 'nodata'
  if (percent >= 100) return 'achieved'
  const expected = Math.min(Math.max(monthsElapsed, 1), 12) / 12
  const pace = percent / (expected * 100)
  if (pace >= 0.9) return 'ontrack'
  if (pace >= 0.7) return 'atrisk'
  return 'behind'
}

/**
 * Scorecard for a set of goals — "how much have we achieved".
 *
 * `attainment` caps each goal at 100% before averaging. Without the cap one goal sitting at
 * 400% would drag the average above 100 and hide three goals that are failing, which is the
 * opposite of what a Director is looking at this number for.
 *
 * Goals with no target or no actual are counted in `total` but excluded from the average,
 * so "3 of 9 scored" is visible rather than silently improving the number.
 */
export function achievement(goals, monthsElapsed = MONTHS_ELAPSED) {
  const pcts = goals
    .map((g) => percentAchieved(g.target, g.actual, g.higherIsBetter !== false))
    .filter((p) => p !== null)

  const onTrack = pcts.filter((p) => {
    const s = goalStatus(p, monthsElapsed)
    return s === 'achieved' || s === 'ontrack'
  }).length

  return {
    total: goals.length,
    scored: pcts.length,
    onTrack,
    achieved: pcts.filter((p) => p >= 100).length,
    attainment: pcts.length ? pcts.reduce((s, p) => s + Math.min(p, 100), 0) / pcts.length : null,
  }
}

// Colours are Rotary's own official secondary palette — Grass, Orange, Cranberry — rather
// than generic greens and reds, so status reads as part of the brand rather than bolted on.
export const STATUS_META = {
  achieved: { label: 'Achieved', color: '#009739', cls: 'bg-[#009739]/10 text-[#00702A] border-[#009739]/25' },
  ontrack:  { label: 'On Track', color: '#009739', cls: 'bg-[#009739]/10 text-[#00702A] border-[#009739]/25' },
  atrisk:   { label: 'At Risk',  color: '#FF7600', cls: 'bg-[#FF7600]/10 text-[#B85400] border-[#FF7600]/25' },
  behind:   { label: 'Behind',   color: '#C8102E', cls: 'bg-[#C8102E]/10 text-[#9B0C23] border-[#C8102E]/25' },
  nodata:   { label: 'No data',  color: '#B5B5B5', cls: 'bg-slate-100 text-slate-500 border-slate-200' },
  // A reported figure with no target yet is not missing data — the goal-setting event simply
  // has not happened for that row. Same calm grey, different sentence.
  notset:   { label: 'No target', color: '#B5B5B5', cls: 'bg-slate-100 text-slate-500 border-slate-200' },
}

/** onTrack maps to the PDF's "On Track (Y/N)" column. */
export const onTrackYN = (status) => (status === 'achieved' || status === 'ontrack' ? 'Y' : 'N')

/** Districts with no club-level data — surfaced as an explicit state, never as a zero. */
export const districtsWithoutClubs = () => DISTRICTS.filter((d) => clubsIn(d.id).length === 0).map((d) => d.id)
