import { DISHA_DISTRICTS } from './disha.js'
import { REPORT_FIELDS, achievedFor } from './reportFields.js'

/**
 * DEMO TARGETS — not client data.
 *
 * The portal seeds none: District Governors set targets live at the goal-setting event, which
 * is the point of the event. Until then there is nothing to measure "achieved" against, so
 * these are derived from each district's own figure by a per-field uplift.
 *
 * They are flagged as placeholders on every page they appear, and live in this one file so a
 * real target set replaces them in a single swap.
 */

// What each field is being asked to grow by. Money stretches further than club counts.
const UPLIFT = {
  membersStart: 1.07, womenMembers: 1.15, clubsStart: 1.05,
  annualFund: 1.20, polioPlus: 1.25, endowment: 1.15,
  majorGifts: 1.20, aks: 1.10, csr: 1.20, totalGiving: 1.18,
  rotaractClubs: 1.15, rotaractors: 1.20, interactClubs: 1.15, rccClubs: 1.12,
}

const round = (n, unit) =>
  unit === '%' ? Math.min(Math.round(n * 10) / 10, 100)
  : n >= 1000 ? Math.round(n / 100) * 100
  : Math.ceil(n)

/** districtId -> fieldId -> target */
export const DEMO_TARGETS = (() => {
  const out = {}
  for (const d of DISHA_DISTRICTS) {
    for (const f of REPORT_FIELDS) {
      const base = achievedFor(f, d)
      if (base === null || base === 0) continue
      out[String(d.id)] ??= {}
      out[String(d.id)][f.id] = round(base * (UPLIFT[f.id] ?? 1.10), f.unit)
    }
  }
  return out
})()

export const targetValue = (districtId, fieldId) =>
  DEMO_TARGETS[String(districtId)]?.[fieldId] ?? null

export const TARGETS_ARE_DEMO = true
