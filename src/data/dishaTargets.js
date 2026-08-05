import { useSyncExternalStore } from 'react'
import { DISHA_DISTRICTS } from './disha.js'
import { REPORT_FIELDS, achievedFor } from './reportFields.js'

/**
 * Targets — the second figure in every cell.
 *
 * There are two sources, in this order:
 *
 *   1. An ENTERED target, typed on a Goals screen. Real, and it always wins.
 *   2. A PROVISIONAL target, worked out from the district's own 2025-26 figure and a growth
 *      uplift, so every cell has something to measure against before the event.
 *
 * The provisional ones are NOT client data and are labelled as such wherever they appear. The
 * DISHA portal seeds no targets at all — its `goals` table holds a single test row, and every
 * Target column in both consolidated workbooks is blank — because District Governors set their
 * targets live at the goal-setting event. Until they do, a provisional figure is the only way
 * the screens can show what a goal looks like.
 *
 * Replacing them with the real 2026-27 targets is a change to this one file: fill REAL_TARGETS
 * and everything above it — cells, totals, attainment, status — follows.
 */

const KEY = 'goalseek.targets.v1'

const read = () => {
  try {
    return JSON.parse(globalThis.localStorage?.getItem(KEY) ?? '{}')
  } catch {
    return {} // corrupt or unavailable storage is the same as no targets set
  }
}

// Held in memory so useSyncExternalStore sees a stable reference between writes.
let snapshot = read()
const listeners = new Set()

const emit = () => {
  try { globalThis.localStorage?.setItem(KEY, JSON.stringify(snapshot)) } catch { /* private mode */ }
  for (const l of listeners) l()
}

/** Scope keeps district 3120 and club 3120-something from colliding. */
const cell = (scope, scopeId, fieldId) => `${scope}:${scopeId}:${fieldId}`

export const subscribe = (fn) => {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export const getTargets = () => snapshot

export function setTarget(scope, scopeId, fieldId, value) {
  const k = cell(scope, scopeId, fieldId)
  if (value == null) {
    if (!(k in snapshot)) return
    const { [k]: _dropped, ...rest } = snapshot
    snapshot = rest
  } else {
    if (snapshot[k] === value) return
    snapshot = { ...snapshot, [k]: value }
  }
  emit()
}

export function clearTargets() {
  if (!Object.keys(snapshot).length) return
  snapshot = {}
  emit()
}

/** An entered target alone — null if nobody has typed one. */
export const enteredTarget = (scope, scopeId, fieldId) => snapshot[cell(scope, scopeId, fieldId)] ?? null

// ---------------------------------------------------------------------------
// Provisional targets
// ---------------------------------------------------------------------------

/**
 * What each field is asked to grow by. Money stretches further than club counts, and the two
 * lower-is-better fields sit BELOW what happened — fewer terminations and fewer closures is the
 * goal, so a target above the current figure would be a target to get worse.
 */
const UPLIFT = {
  membersStart: 1.07, womenMembers: 1.15, clubsStart: 1.05,
  newMembers: 1.20, netChange: 1.30, clubsChartered: 1.40, newPHF: 1.20, ereyPct: 1.25,
  annualFund: 1.20, polioPlus: 1.25, endowment: 1.15,
  majorGifts: 1.20, aks: 1.10, csr: 1.20, totalGiving: 1.18,
  mediaMentions: 1.30, socialGrowth: 1.35, piEvents: 1.25, brandReviews: 1.30,
  rotaractClubs: 1.15, rotaractors: 1.20, interactClubs: 1.15, rccClubs: 1.12,
  serviceProjects: 1.20, newClubsDev: 1.25,
  terminated: 0.85, clubsClosed: 0.7,
}

/**
 * Round in the direction of the goal. Rounding a lower-is-better target UP undid the reduction
 * on small numbers — 2 terminations × 0.85 is 1.7, and ceiling that back to 2 handed the club a
 * target identical to what already happened, which then scored 100% and announced that it had
 * achieved its goal of losing two members.
 */
export const roundTarget = (n, unitLabel, down = false) =>
  unitLabel === '%' ? Math.min(Math.round(n * 10) / 10, 100)
  : n >= 1000 ? Math.round(n / 100) * 100
  : down ? Math.max(0, Math.floor(n))
  : Math.max(1, Math.ceil(n))

/**
 * A target worked out from a figure that was actually reported. Null when there is no figure to
 * grow from — the thirteen fields the portal does not carry get no invented target either, so a
 * blank row stays blank on both sides rather than gaining half a number.
 */
export function provisionalFrom(base, field) {
  if (base == null) return null

  // A count sitting at zero still has an obvious goal — get the first one. A multiplier cannot
  // express that, since anything times zero is zero. Money is left alone: with nothing to scale
  // from, any dollar figure would be picked out of the air, and lower-is-better fields already
  // have zero as their best possible answer.
  if (base === 0) return field.unit === 'nos' && !field.lowerIsBetter ? 1 : null

  return roundTarget(base * (UPLIFT[field.id] ?? 1.10), field.unit, field.lowerIsBetter)
}

/** districtId -> fieldId -> provisional target. Built once from the portal's own figures. */
const PROVISIONAL = (() => {
  const out = {}
  for (const d of DISHA_DISTRICTS) {
    for (const f of REPORT_FIELDS) {
      const t = provisionalFrom(achievedFor(f, d), f)
      if (t == null) continue
      out[String(d.id)] ??= {}
      out[String(d.id)][f.id] = t
    }
  }
  return out
})()

export const provisionalTarget = (districtId, fieldId) =>
  PROVISIONAL[String(districtId)]?.[fieldId] ?? null

/**
 * Target for a district field: what the governor entered, or the provisional figure until they
 * do. This is what every cell, total and attainment reads.
 */
export const targetValue = (districtId, fieldId) =>
  enteredTarget('district', districtId, fieldId) ?? provisionalTarget(districtId, fieldId)

/** Whether a given district target is the real, entered one. Pages use this to say so. */
export const isEntered = (scope, scopeId, fieldId) =>
  enteredTarget(scope, scopeId, fieldId) != null

/** Re-render on entry. The snapshot's identity changes on every write, so a count would not. */
export function useTargets() {
  return useSyncExternalStore(subscribe, getTargets, getTargets)
}

/** Older name for enteredTarget, kept so call sites reading the entered store alone still work. */
export const targetIn = enteredTarget

/**
 * How many targets have been entered, and a re-render on every write. Subscribes through
 * useTargets so overwriting an existing target repaints — subscribing to the count alone left
 * a screen frozen on the first keystroke's value.
 */
export function useTargetCount() {
  return Object.keys(useTargets()).length
}

export const anyTargetsSet = () => Object.keys(snapshot).length > 0

/** How many targets have actually been set, within one scope. */
export function enteredCountIn(scope, scopeId) {
  const prefix = `${scope}:${scopeId}:`
  return Object.keys(snapshot).filter((k) => k.startsWith(prefix)).length
}

/** Total entered across every scope — for a global "n set so far" line. */
export const enteredCount = () => Object.keys(snapshot).length

/**
 * Targets on screen are provisional until the goal-setting event fills them in. Pages read this
 * to caption them; it stops being true one file at a time as real figures arrive.
 */
export const TARGETS_ARE_PROVISIONAL = true
