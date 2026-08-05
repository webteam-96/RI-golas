import { useSyncExternalStore } from 'react'

/**
 * Targets — the goals themselves.
 *
 * The DISHA Zone 5 & 6 portal seeds none. Its `goals` table is created and left empty, and
 * every Target column in the two consolidated workbooks is blank, because District Governors
 * set their targets live at the goal-setting event. That is the whole point of the event.
 *
 * So there is nothing here to read from a file. A target exists once someone enters it, and
 * until then it is null and renders as a dash. This module is that store: the same shape the
 * portal's `goals` table has, kept in localStorage so entries survive a refresh.
 *
 * It replaces a generated set of targets — each district's own figure times an uplift — which
 * made every district look 80-something per cent attained and none of it meant anything.
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

export const targetIn = (scope, scopeId, fieldId) => snapshot[cell(scope, scopeId, fieldId)] ?? null

/** Target for a district field. Null until a governor sets it. */
export const targetValue = (districtId, fieldId) => targetIn('district', districtId, fieldId)

/** Re-render on entry. Returns the count so a page can say how many goals are set. */
export function useTargetCount() {
  return useSyncExternalStore(
    subscribe,
    () => Object.keys(snapshot).length,
    () => 0,
  )
}

/** No target anywhere is the starting state, and pages say so rather than showing empty charts. */
export const anyTargetsSet = () => Object.keys(snapshot).length > 0
