import { CLUBS } from './clubs.js'
import { REPORT_FIELDS } from './reportFields.js'
import { enteredTarget, provisionalFrom } from './dishaTargets.js'

/**
 * The monthly report's fields read against a single club.
 *
 * Most of the form is district-level — you cannot ask one club how many clubs it has — so only
 * the rows a club can answer are mapped. The rest return null and are hidden on club screens
 * rather than shown as dashes on every row.
 */
const FROM_CLUB = {
  membersStart:    (c) => c.membership.current,
  womenMembers:    (c) => c.membership.female,
  newMembers:      (c) => c.membership.newMembers,
  terminated:      (c) => c.membership.terminated,
  netChange:       (c) => (c.membership.current == null || c.membership.atRYStart == null
                            ? null : c.membership.current - c.membership.atRYStart),
  annualFund:      (c) => c.trf.annualUSD,
  polioPlus:       (c) => c.trf.polioUSD,
  endowment:       (c) => c.trf.endowmentUSD,
  totalGiving:     (c) => c.trf.totalUSD,
  piEvents:        (c) => c.publicImage?.initiatives ?? null,
  socialGrowth:    (c) => c.publicImage?.ocv ?? null,
  mediaMentions:   (c) => c.publicImage?.newsletters ?? null,
  serviceProjects: (c) => c.service.projects,
  rotaractClubs:   (c) => c.sponsored?.rotaract ?? null,
  interactClubs:   (c) => c.sponsored?.interact ?? null,
}

/** Fields a club can actually answer — what the club and district screens show. */
export const CLUB_FIELDS = REPORT_FIELDS.filter((f) => FROM_CLUB[f.id])

export const clubFieldsIn = (catId) => CLUB_FIELDS.filter((f) => f.cat === catId)

/** Categories that have at least one club-answerable field. */
export const clubCategories = (categories) =>
  categories.filter((c) => clubFieldsIn(c.id).length > 0)

const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null)

export function clubAchieved(field, club) {
  const fn = FROM_CLUB[field.id]
  return fn ? num(fn(club)) : null
}

/**
 * Target for a club field: what the president entered, or a provisional figure grown from the
 * club's own reported number until they do. Same two-source rule as the districts', so a club
 * cell reads the same way as every other cell in the app.
 */
export function clubTarget(clubId, fieldId) {
  const entered = enteredTarget('club', clubId, fieldId)
  if (entered != null) return entered

  const club = CLUBS.find((c) => c.id === clubId)
  const field = CLUB_FIELDS.find((f) => f.id === fieldId)
  if (!club || !field) return null
  return provisionalFrom(clubAchieved(field, club), field)
}

/** Roll a club field up to a district — the sum across its clubs, blanks left out. */
export function districtFromClubs(field, clubs) {
  let s = null
  for (const c of clubs) {
    const v = clubAchieved(field, c)
    if (v != null) s = (s ?? 0) + v
  }
  return s
}
