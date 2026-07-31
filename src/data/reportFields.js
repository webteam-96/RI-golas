import { prevValue } from './disha.js'

/**
 * Field catalogue taken from Zone6_Coordinator_Monthly_Report_Template.pdf — the form
 * coordinators actually file. Four sections, matching the PDF's own numbering:
 *
 *   §2 Membership · §3 Rotary Foundation (TRF) Giving · §4 Public Image
 *   §5 Service & New Club Development
 *
 * The DISHA portal's RAG Analysis and Summary sections are deliberately absent — they are a
 * goal-setting device, not part of the monthly report.
 *
 * `src` is the DISHA Zone 5 & 6 field id a district's achieved figure comes from. A field with
 * no `src` is on the form but not collected anywhere yet, and renders as a dash rather than an
 * invented number.
 */

const val = (fieldId) => (d) => {
  const v = prevValue(d.id, fieldId)
  const n = typeof v === 'string' ? parseFloat(v) : v
  return typeof n === 'number' && Number.isFinite(n) ? n : null
}

export const REPORT_CATEGORIES = [
  { id: 'membership',  pdf: 2, label: 'Membership' },
  { id: 'foundation',  pdf: 3, label: 'Foundation' },
  { id: 'publicimage', pdf: 4, label: 'Public Image' },
  { id: 'projects',    pdf: 5, label: 'Projects' },
]

export const REPORT_FIELDS = [
  // §2 Membership
  { id: 'membersStart',   cat: 'membership', label: 'Members',                 unit: 'nos', src: 11 },
  { id: 'womenMembers',   cat: 'membership', label: 'Women members',           unit: 'nos', src: 3 },
  { id: 'clubsStart',     cat: 'membership', label: 'Clubs',                   unit: 'nos', src: 1 },
  { id: 'newMembers',     cat: 'membership', label: 'New members',             unit: 'nos', src: null },
  { id: 'terminated',     cat: 'membership', label: 'Terminated / resigned',   unit: 'nos', src: null, lowerIsBetter: true },
  { id: 'netChange',      cat: 'membership', label: 'Net change',              unit: 'nos', src: null },
  { id: 'clubsChartered', cat: 'membership', label: 'New clubs chartered',     unit: 'nos', src: null },
  { id: 'clubsClosed',    cat: 'membership', label: 'Clubs closed',            unit: 'nos', src: null, lowerIsBetter: true },

  // §3 Rotary Foundation (TRF) Giving
  { id: 'annualFund', cat: 'foundation', label: 'Annual Fund contributions', unit: '$',   src: 18 },
  { id: 'polioPlus',  cat: 'foundation', label: 'PolioPlus Fund',            unit: '$',   src: 21 },
  { id: 'endowment',  cat: 'foundation', label: 'Endowment Fund',            unit: '$',   src: 24 },
  { id: 'majorGifts', cat: 'foundation', label: 'Major gifts',               unit: 'nos', src: 26 },
  { id: 'aks',        cat: 'foundation', label: 'Arch Klumph Society',       unit: 'nos', src: 28 },
  { id: 'csr',        cat: 'foundation', label: 'CSR',                       unit: '$',   src: 30 },
  { id: 'totalGiving', cat: 'foundation', label: 'Total giving',             unit: '$',   src: 32 },
  { id: 'newPHF',     cat: 'foundation', label: 'New Paul Harris Fellows',   unit: 'nos', src: null },
  { id: 'ereyPct',    cat: 'foundation', label: 'EREY participation',        unit: '%',   src: null },

  // §4 Public Image
  { id: 'mediaMentions', cat: 'publicimage', label: 'Media / press mentions',    unit: 'nos', src: null },
  { id: 'socialGrowth',  cat: 'publicimage', label: 'Social media growth',       unit: 'nos', src: null },
  { id: 'piEvents',      cat: 'publicimage', label: 'Public image events held',  unit: 'nos', src: null },
  { id: 'brandReviews',  cat: 'publicimage', label: 'Brand consistency reviews', unit: 'nos', src: null },

  // §5 Service & New Club Development
  { id: 'rotaractClubs', cat: 'projects', label: 'Rotaract clubs',            unit: 'nos', src: 39 },
  { id: 'rotaractors',   cat: 'projects', label: 'Rotaractors',               unit: 'nos', src: 40 },
  { id: 'interactClubs', cat: 'projects', label: 'Interact clubs',            unit: 'nos', src: 45 },
  { id: 'rccClubs',      cat: 'projects', label: 'Rotary Community Corps',    unit: 'nos', src: 48 },
  { id: 'serviceProjects', cat: 'projects', label: 'Active service projects', unit: 'nos', src: null },
  { id: 'newClubsDev',   cat: 'projects', label: 'New clubs in development',  unit: 'nos', src: null },
].map((f) => ({ ...f, get: f.src ? val(f.src) : () => null }))

export const fieldsInCategory = (catId) => REPORT_FIELDS.filter((f) => f.cat === catId)

export const achievedFor = (field, district) => field.get(district)

/** How much of the form is backed by data — worth stating on the page rather than hiding. */
export const SOURCED_FIELDS = REPORT_FIELDS.filter((f) => f.src).length
