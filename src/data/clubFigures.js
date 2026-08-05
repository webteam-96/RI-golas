import { REPORT_FIELDS } from './reportFields.js'
import { targetIn } from './dishaTargets.js'

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
 * Target for a club field. Same store as the districts', same rule: null until a president
 * sets it. Club targets used to be the club's own figure times an uplift, which measured
 * nothing except the uplift.
 */
export const clubTarget = (clubId, fieldId) => targetIn('club', clubId, fieldId)

/** Roll a club field up to a district — the sum across its clubs, blanks left out. */
export function districtFromClubs(field, clubs) {
  let s = null
  for (const c of clubs) {
    const v = clubAchieved(field, c)
    if (v != null) s = (s ?? 0) + v
  }
  return s
}
