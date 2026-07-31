import { CLUBS } from './clubs.js'
import { REPORT_FIELDS } from './reportFields.js'

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

// Same uplift idea as the district targets: a club is asked to grow on its own figure.
const UPLIFT = {
  membersStart: 1.08, womenMembers: 1.18, newMembers: 1.20, netChange: 1.30,
  annualFund: 1.20, polioPlus: 1.25, endowment: 1.15, totalGiving: 1.18,
  piEvents: 1.30, socialGrowth: 1.35, mediaMentions: 1.30,
  serviceProjects: 1.20, rotaractClubs: 1.25, interactClubs: 1.25,
  terminated: 0.85,
}

const round = (n) => (n >= 1000 ? Math.round(n / 100) * 100 : Math.max(1, Math.ceil(n)))

/** clubId -> fieldId -> target. Demo, like every other target in the prototype. */
export const CLUB_TARGETS = (() => {
  const out = {}
  for (const c of CLUBS)
    for (const f of CLUB_FIELDS) {
      const base = clubAchieved(f, c)
      if (base === null || base === 0) continue
      out[c.id] ??= {}
      out[c.id][f.id] = round(base * (UPLIFT[f.id] ?? 1.10))
    }
  return out
})()

export const clubTarget = (clubId, fieldId) => CLUB_TARGETS[clubId]?.[fieldId] ?? null

/** Roll a club field up to a district — the sum across its clubs, blanks left out. */
export function districtFromClubs(field, clubs) {
  let s = null
  for (const c of clubs) {
    const v = clubAchieved(field, c)
    if (v != null) s = (s ?? 0) + v
  }
  return s
}
