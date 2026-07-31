import { DISHA_FIELDS, DISHA_DISTRICTS, prevValue } from './disha.js'

/**
 * DEMO TARGETS — not client data.
 *
 * The Disha56 seed carries no targets: District Governors enter them live at the goal-setting
 * event, which is the point of the event. Nothing to show against "achieved" until then, so
 * these are derived from each district's own existing figure by a per-section uplift.
 *
 * Every one is replaced the moment real targets arrive. They are flagged as demo wherever
 * they appear so nobody reads them as commitments anyone has made.
 */

// Growth expected of each field, keyed by the section it sits in. A district asked to add
// clubs is not being asked for the same stretch as one asked to lift women's membership.
const UPLIFT = {
  'New Clubs': 1.08,
  'Women Membership': 1.15,
  'RAG Analysis': 1.10,
  Total: 1.07,
  Summary: 1.07,
  'Annual Fund (Last Five Years)': 1.20,
  'Polio Plus Fund': 1.25,
  'Endowment Fund': 1.15,
  'Major Gifts': 1.20,
  AKS: 1.10,
  CSR: 1.20,
  'Total Giving': 1.18,
  Rotaract: 1.15,
  Interact: 1.15,
  RCC: 1.12,
  'Yet to Sponsor': 1.10,
}

const numeric = (v) => {
  const n = typeof v === 'string' ? parseFloat(v) : v
  return typeof n === 'number' && Number.isFinite(n) ? n : null
}

/** districtId -> fieldId -> target */
export const DEMO_TARGETS = (() => {
  const out = {}
  for (const d of DISHA_DISTRICTS) {
    for (const f of DISHA_FIELDS) {
      if (f.dataType === 'text' || f.dataType === 'boolean') continue
      const base = numeric(prevValue(d.id, f.id))
      if (base === null || base === 0) continue
      const factor = UPLIFT[f.section] ?? 1.10
      const raised = base * factor
      // Percentages stay percentages; counts and currency round to something a person would say.
      const target = f.dataType === 'percentage'
        ? Math.min(Math.round(raised * 10) / 10, 100)
        : raised >= 1000 ? Math.round(raised / 100) * 100 : Math.ceil(raised)
      out[String(d.id)] ??= {}
      out[String(d.id)][String(f.id)] = target
    }
  }
  return out
})()

export const targetValue = (districtId, fieldId) =>
  DEMO_TARGETS[String(districtId)]?.[String(fieldId)] ?? null

export const TARGETS_ARE_DEMO = true
