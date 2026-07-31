import { FOUNDATION } from './metrics'

// The metrics that actually carry data across all 9 Zone 6 districts. The other workbook
// rows (DDF, Polio Plus Society, Hall of Honor) are blank for every district and would
// render as a wall of dashes on a summary screen — they still appear in the full grid.
export const HEADLINE_IDS = [
  'annualFund',
  'phf',
  'majorDonors',
  'phsmPaulHarrisSocietyMember',
  'endowment',
  'annualFundPerCapitaContribution25',
  'csrProjectWithRfi',
]

export const HEADLINE = HEADLINE_IDS.map((id) => FOUNDATION.find((m) => m.id === id)).filter(Boolean)

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
}

export const shortLabel = (m) => SHORT_LABEL[m.id] ?? m.label
