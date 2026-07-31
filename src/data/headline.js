// Extension included so this module also loads under plain node for the checks in src/lib.
import { FOUNDATION, CLUB_METRICS, AREAS } from './metrics.js'

const all = [...FOUNDATION, ...CLUB_METRICS]
const byId = (id) => all.find((m) => m.id === id)

// One lead metric per area — the number that headlines an area card.
export const AREA_LEAD = {
  foundation: 'annualFund',
  membership: 'members',
  publicimage: 'piInitiatives',
  projects: 'projects',
}

// The supporting metrics shown under each area card and as table columns.
export const AREA_METRIC_IDS = {
  foundation: ['annualFund', 'phf', 'majorDonors', 'phsmPaulHarrisSocietyMember', 'endowment'],
  membership: ['members', 'netChange', 'female', 'myRotaryPct'],
  publicimage: ['piInitiatives', 'piNewsletters', 'piOcv'],
  projects: ['projects', 'volunteers', 'rotaract', 'interact'],
}

export const areaMetrics = (areaId) => (AREA_METRIC_IDS[areaId] ?? []).map(byId).filter(Boolean)
export const areaLead = (areaId) => byId(AREA_LEAD[areaId])

export const AREA_TONE = {
  foundation: 'gold',
  membership: 'blue',
  publicimage: 'purple',
  projects: 'green',
}

export const AREA_COLOR = {
  foundation: '#F7A81B',
  membership: '#003DA5',
  publicimage: '#9333EA',
  projects: '#16A34A',
}

// Foundation metrics that carry data across all 9 districts. The other workbook rows
// (DDF, Polio Plus Society, Hall of Honor) are blank everywhere and would render as a wall
// of dashes on a summary screen — they still appear in the full grid.
export const HEADLINE_IDS = [
  'annualFund', 'phf', 'majorDonors', 'phsmPaulHarrisSocietyMember',
  'endowment', 'annualFundPerCapitaContribution25', 'csrProjectWithRfi',
]

export const HEADLINE = HEADLINE_IDS.map(byId).filter(Boolean)

export const SHORT_LABEL = {
  annualFund: 'Annual Fund',
  phf: 'PHF',
  majorDonors: 'Major Donors',
  phsmPaulHarrisSocietyMember: 'PHSM',
  endowment: 'Endowment',
  annualFundPerCapitaContribution25: 'Per capita $25+',
  csrProjectWithRfi: 'CSR w/ RFI',
  directedGift: 'Directed Gift',
  epf: 'EPF',
  bequestSociety: 'Bequest',
  archKlumpSociety: 'Arch Klump',
  members: 'Members',
  netChange: 'Net change',
  female: 'Female',
  myRotaryPct: 'My Rotary',
  piInitiatives: 'PI initiatives',
  piNewsletters: 'Newsletters',
  piOcv: 'Online visibility',
  projects: 'Projects',
  volunteers: 'Volunteers',
  rotaract: 'Rotaract',
  interact: 'Interact',
}

export const shortLabel = (m) => SHORT_LABEL[m.id] ?? m.label

export { AREAS }
