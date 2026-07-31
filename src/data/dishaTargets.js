import { DISHA_DISTRICTS, prevValue } from './disha.js'
import { REPORT_FIELDS, demoRef } from './reportFields.js'

/**
 * DEMO FIGURES — not client data.
 *
 * Two gaps are filled here, both flagged on every page they appear:
 *
 *  1. Targets. The portal seeds none; District Governors set them live at the goal-setting
 *     event. Until then there is nothing to measure an achieved figure against.
 *  2. Achieved figures for the fields on the monthly report that no dataset carries yet —
 *     the whole Public Image section, and a few Membership and Projects rows. Without these
 *     those categories render as a wall of dashes.
 *
 * Everything here is derived, deterministic and replaceable in one file.
 */

/** Stable hash → 0..1. No Math.random: a figure that changes on refresh is worse than none. */
function unit(districtId, fieldId) {
  let h = 2166136261
  for (const ch of `${districtId}:${fieldId}`) {
    h ^= ch.charCodeAt(0)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) % 10000) / 10000
}

/** District size, used to keep invented figures proportionate to the district. */
const membersOf = (d) => {
  const v = parseFloat(prevValue(d.id, 11))
  return Number.isFinite(v) ? v : 2500
}

// Plausible range for each field with no dataset behind it, as [min, max] for a mid-sized
// district. Scaled by how big the district actually is.
const RANGE = {
  newMembers:      [60, 420],
  terminated:      [40, 300],
  netChange:       [10, 160],
  clubsChartered:  [0, 7],
  clubsClosed:     [0, 4],
  newPHF:          [30, 260],
  ereyPct:         [18, 62],
  mediaMentions:   [6, 70],
  socialGrowth:    [250, 4200],
  piEvents:        [3, 26],
  brandReviews:    [1, 14],
  serviceProjects: [40, 520],
  newClubsDev:     [0, 9],
}

const round = (n, unitLabel) =>
  unitLabel === '%' ? Math.round(n * 10) / 10
  : n >= 1000 ? Math.round(n / 10) * 10
  : Math.round(n)

/** Achieved figure for a field the datasets do not cover. Null for anything they do. */
export function demoAchieved(field, district) {
  const range = RANGE[field.id]
  if (!range || field.src) return null
  const [lo, hi] = range
  const scale = field.unit === '%' ? 1 : Math.min(Math.max(membersOf(district) / 2500, 0.35), 2.2)
  return round((lo + unit(district.id, field.id) * (hi - lo)) * scale, field.unit)
}

// reportFields.achievedFor falls back to this for the rows no dataset covers.
demoRef.fn = demoAchieved

// What each field is asked to grow by. Money stretches further than club counts.
const UPLIFT = {
  membersStart: 1.07, womenMembers: 1.15, clubsStart: 1.05,
  newMembers: 1.20, netChange: 1.30, clubsChartered: 1.40, newPHF: 1.20, ereyPct: 1.25,
  annualFund: 1.20, polioPlus: 1.25, endowment: 1.15,
  majorGifts: 1.20, aks: 1.10, csr: 1.20, totalGiving: 1.18,
  mediaMentions: 1.30, socialGrowth: 1.35, piEvents: 1.25, brandReviews: 1.30,
  rotaractClubs: 1.15, rotaractors: 1.20, interactClubs: 1.15, rccClubs: 1.12,
  serviceProjects: 1.20, newClubsDev: 1.25,
  // Fewer is better here, so the target sits below what has happened.
  terminated: 0.85, clubsClosed: 0.7,
}

const roundTarget = (n, unitLabel) =>
  unitLabel === '%' ? Math.min(Math.round(n * 10) / 10, 100)
  : n >= 1000 ? Math.round(n / 100) * 100
  : Math.max(1, Math.ceil(n))

/** districtId -> fieldId -> target */
export const DEMO_TARGETS = (() => {
  const out = {}
  for (const d of DISHA_DISTRICTS) {
    for (const f of REPORT_FIELDS) {
      const base = f.get(d) ?? demoAchieved(f, d)
      if (base === null || base === 0) continue
      out[String(d.id)] ??= {}
      out[String(d.id)][f.id] = roundTarget(base * (UPLIFT[f.id] ?? 1.10), f.unit)
    }
  }
  return out
})()

export const targetValue = (districtId, fieldId) =>
  DEMO_TARGETS[String(districtId)]?.[fieldId] ?? null

export const TARGETS_ARE_DEMO = true
