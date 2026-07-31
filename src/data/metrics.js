import { FOUNDATION_METRICS } from './foundationGoals.js'

// ── Club-entered metrics ──────────────────────────────────────────────────────
// `rollup` decides how children combine into a parent:
//   sum          — counts and currency
//   weightedMean — percentages, weighted by member count (NEVER a plain average)
//   recompute    — derived from the level's own totals, not from children's values
//
// `get` reads the value off a normalised club (src/data/clubs.js). Returning null means
// "not reported" and the club drops out of BOTH numerator and denominator.
export const CLUB_METRICS = [
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
  { id: 'myRotaryPct',  area: 'engagement', label: 'My Rotary registration', unit: 'percent', rollup: 'weightedMean',
    get: (c) => (!c.membership.current || c.membership.myRotary == null ? null : (c.membership.myRotary / c.membership.current) * 100),
    higherIsBetter: true },
  { id: 'attendance',   area: 'engagement', label: 'Meeting attendance',   unit: 'percent', rollup: 'weightedMean',
    get: (c) => c.membership.attendance, higherIsBetter: true },
  { id: 'clubTrfUSD',   area: 'foundation', label: 'Club TRF giving',      unit: 'USD',     rollup: 'sum',
    get: (c) => c.trf.totalUSD, higherIsBetter: true },
  { id: 'trfPerCapita', area: 'foundation', label: 'TRF per capita',       unit: 'USD',     rollup: 'recompute',
    get: (c) => (!c.membership.current ? null : c.trf.totalUSD / c.membership.current),
    recompute: (t) => (!t.members ? null : t.clubTrfUSD / t.members),
    higherIsBetter: true },
  { id: 'projects',     area: 'service',    label: 'Service projects',     unit: 'count',   rollup: 'sum',
    get: (c) => c.service.projects, higherIsBetter: true },
  { id: 'volunteers',   area: 'service',    label: 'Volunteers',           unit: 'count',   rollup: 'sum',
    get: (c) => c.service.volunteers, higherIsBetter: true },
  { id: 'goalsSet',     area: 'engagement', label: 'Club Central goals set',       unit: 'count', rollup: 'sum',
    get: (c) => c.excellence.goalsSet, higherIsBetter: true },
  { id: 'goalsDone',    area: 'engagement', label: 'Club Central goals completed', unit: 'count', rollup: 'sum',
    get: (c) => c.excellence.goalsCompleted, higherIsBetter: true },
  { id: 'rotaract',     area: 'youth',      label: 'Rotaract clubs sponsored', unit: 'count', rollup: 'sum',
    get: (c) => c.sponsored.rotaract, higherIsBetter: true },
  { id: 'interact',     area: 'youth',      label: 'Interact clubs sponsored', unit: 'count', rollup: 'sum',
    get: (c) => c.sponsored.interact, higherIsBetter: true },
]

// Foundation metrics come from the workbook and are entered at DISTRICT level.
export const FOUNDATION = FOUNDATION_METRICS.map((m) => ({ ...m, area: 'foundation', source: 'workbook' }))

export const AREAS = [
  { id: 'foundation', label: 'Foundation' },
  { id: 'membership', label: 'Membership' },
  { id: 'service',    label: 'Service' },
  { id: 'engagement', label: 'Engagement' },
  { id: 'youth',      label: 'Youth' },
]

export const clubMetric = (id) => CLUB_METRICS.find((m) => m.id === id) ?? null
export const foundationMetric = (id) => FOUNDATION.find((m) => m.id === id) ?? null
export const anyMetric = (id) => foundationMetric(id) ?? clubMetric(id)

// ── Seeded zone targets ───────────────────────────────────────────────────────
// Demo values, not client-supplied. Every one is editable in the UI; the point of the
// prototype is that these move. Chosen as round numbers just above the March 2026 actual
// so the pace-based status spread (On Track / At Risk / Behind) is visible on screen.
export const SEED_ZONE_TARGETS = {
  annualFund: 700000,
  phf: 800,
  majorDonors: 40,
  phsmPaulHarrisSocietyMember: 35,
  endowment: 12,
  annualFundPerCapitaContribution25: 200,
  csrProjectWithRfi: 10,
  directedGift: 6,
  epf: 8,
  bequestSociety: 3,
  archKlumpSociety: 2,
}

// Seeded district targets: each district's share of the zone target, weighted by its actual,
// then rounded. Districts that are already carrying the zone get proportionally bigger asks.
export const SEED_DISTRICT_TARGET_FACTOR = 1.15
