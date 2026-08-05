import { FOUNDATION_METRICS } from './foundationGoals.js'

// ── The four goal areas ───────────────────────────────────────────────────────
// The same four at every level — RI, Zone, District and Club. A club president and an
// RI Director talk about the same four things; only the scope of the numbers changes.
export const AREAS = [
  { id: 'foundation', label: 'Foundation' },
  { id: 'membership', label: 'Membership' },
  { id: 'publicimage', label: 'Public Image' },
  { id: 'projects', label: 'Projects' },
]

// ── Club-entered metrics ──────────────────────────────────────────────────────
// `rollup` decides how children combine into a parent:
//   sum          — counts and currency
//   weightedMean — percentages, weighted by member count (NEVER a plain average)
//   recompute    — derived from the level's own totals, not from children's values
//
// `get` reads the value off a normalised club (src/data/clubs.js). Returning null means
// "not reported" and the club drops out of BOTH numerator and denominator.
export const CLUB_METRICS = [
  // ── Foundation ──
  { id: 'clubTrfUSD',   area: 'foundation', label: 'Club TRF giving',      unit: 'USD',     rollup: 'sum',
    get: (c) => c.trf.totalUSD, higherIsBetter: true },
  { id: 'trfAnnualUSD', area: 'foundation', label: 'Annual Fund giving',   unit: 'USD',     rollup: 'sum',
    get: (c) => c.trf.annualUSD, higherIsBetter: true },
  { id: 'trfPolioUSD',  area: 'foundation', label: 'PolioPlus giving',     unit: 'USD',     rollup: 'sum',
    get: (c) => c.trf.polioUSD, higherIsBetter: true },
  { id: 'trfPerCapita', area: 'foundation', label: 'TRF per capita',       unit: 'USD',     rollup: 'recompute',
    get: (c) => (!c.membership.current ? null : c.trf.totalUSD / c.membership.current),
    recompute: (t) => (!t.members ? null : t.clubTrfUSD / t.members),
    higherIsBetter: true },
  { id: 'trfDonors',    area: 'foundation', label: 'TRF donors',           unit: 'count',   rollup: 'sum',
    get: (c) => c.trf.donors, higherIsBetter: true },

  // ── Membership ──
  { id: 'members',      area: 'membership', label: 'Members',              unit: 'count',   rollup: 'sum',
    get: (c) => c.membership.current, higherIsBetter: true },
  { id: 'netChange',    area: 'membership', label: 'Net change',           unit: 'count',   rollup: 'sum',
    get: (c) => (c.membership.current == null || c.membership.atRYStart == null ? null : c.membership.current - c.membership.atRYStart),
    higherIsBetter: true },
  { id: 'newMembers',   area: 'membership', label: 'New members',          unit: 'count',   rollup: 'sum',
    get: (c) => c.membership.newMembers, higherIsBetter: true },
  { id: 'terminated',   area: 'membership', label: 'Terminated / resigned', unit: 'count',  rollup: 'sum',
    get: (c) => c.membership.terminated, higherIsBetter: false },
  { id: 'female',       area: 'membership', label: 'Female members',       unit: 'count',   rollup: 'sum',
    get: (c) => c.membership.female, higherIsBetter: true },
  { id: 'growth',       area: 'membership', label: 'Membership growth',    unit: 'percent', rollup: 'recompute',
    get: (c) => (!c.membership.atRYStart ? null : ((c.membership.current - c.membership.atRYStart) / c.membership.atRYStart) * 100),
    recompute: (t) => (!t.membersAtStart ? null : ((t.members - t.membersAtStart) / t.membersAtStart) * 100),
    higherIsBetter: true },
  { id: 'myRotaryPct',  area: 'membership', label: 'My Rotary registration', unit: 'percent', rollup: 'weightedMean',
    get: (c) => (!c.membership.current || c.membership.myRotary == null ? null : (c.membership.myRotary / c.membership.current) * 100),
    higherIsBetter: true },
  { id: 'attendance',   area: 'membership', label: 'Meeting attendance',   unit: 'percent', rollup: 'weightedMean',
    get: (c) => c.membership.attendance, higherIsBetter: true },

  // ── Public Image ──
  { id: 'piInitiatives',  area: 'publicimage', label: 'Public image initiatives', unit: 'count', rollup: 'sum',
    get: (c) => c.publicImage?.initiatives ?? null, higherIsBetter: true },
  { id: 'piNewsletters',  area: 'publicimage', label: 'Newsletters published',    unit: 'count', rollup: 'sum',
    get: (c) => c.publicImage?.newsletters ?? null, higherIsBetter: true },
  { id: 'piAnnouncements', area: 'publicimage', label: 'Public announcements',    unit: 'count', rollup: 'sum',
    get: (c) => c.publicImage?.announcements ?? null, higherIsBetter: true },
  { id: 'piOcv',          area: 'publicimage', label: 'Online club visibility',   unit: 'count', rollup: 'sum',
    get: (c) => c.publicImage?.ocv ?? null, higherIsBetter: true },

  // ── Projects ──
  { id: 'projects',     area: 'projects', label: 'Service projects',       unit: 'count',   rollup: 'sum',
    get: (c) => c.service.projects, higherIsBetter: true },
  { id: 'volunteers',   area: 'projects', label: 'Volunteers engaged',     unit: 'count',   rollup: 'sum',
    get: (c) => c.service.volunteers, higherIsBetter: true },
  { id: 'manHours',     area: 'projects', label: 'Volunteer hours',        unit: 'count',   rollup: 'sum',
    get: (c) => c.service.manHours, higherIsBetter: true },
  { id: 'projectCost',  area: 'projects', label: 'Project spend',          unit: 'USD',     rollup: 'sum',
    get: (c) => c.service.cost, higherIsBetter: true },
  { id: 'rotaract',     area: 'projects', label: 'Rotaract clubs sponsored', unit: 'count', rollup: 'sum',
    get: (c) => c.sponsored.rotaract, higherIsBetter: true },
  { id: 'interact',     area: 'projects', label: 'Interact clubs sponsored', unit: 'count', rollup: 'sum',
    get: (c) => c.sponsored.interact, higherIsBetter: true },
]

// The 24 workbook metrics are all Foundation and are entered at DISTRICT level.
export const FOUNDATION = FOUNDATION_METRICS.map((m) => ({ ...m, area: 'foundation', source: 'workbook' }))

/** Every metric available at a given scope, in area order. */
export function metricsFor(scope) {
  const club = CLUB_METRICS
  // Club officers report club figures; the workbook rows are district-and-above.
  return scope === 'club' ? club : [...FOUNDATION, ...club]
}

export const metricsInArea = (metrics, areaId) => metrics.filter((m) => m.area === areaId)

export const clubMetric = (id) => CLUB_METRICS.find((m) => m.id === id) ?? null
export const foundationMetric = (id) => FOUNDATION.find((m) => m.id === id) ?? null
export const anyMetric = (id) => foundationMetric(id) ?? clubMetric(id)

// This file defines metrics, not targets. There are deliberately no target values here: the
// source carries none, and District Governors set them live at the goal-setting event.
