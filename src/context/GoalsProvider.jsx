import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { FOUNDATION, CLUB_METRICS } from '@/data/metrics'
import { seedTargets, goalKey } from '@/data/seedTargets'
import { actualFor } from '@/lib/rollup'

// Bumped when the seeded target set changes, so a stale localStorage copy from an earlier
// shape does not leave half the goals blank on someone's machine.
const KEY = 'goalseek.goals.v2'
const Ctx = createContext(null)

export function GoalsProvider({ children }) {
  const [goals, setGoals] = useState(() => {
    try {
      const saved = localStorage.getItem(KEY)
      if (saved) return JSON.parse(saved)
    } catch {
      /* corrupt or unavailable storage falls through to a clean seed */
    }
    return seedTargets()
  })
  const [toast, setToast] = useState(null)

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(goals)) } catch { /* private mode */ }
  }, [goals])

  const patch = useCallback((scope, scopeId, metricId, field, value) => {
    setGoals((g) => {
      const k = goalKey(scope, scopeId, metricId)
      return { ...g, [k]: { ...(g[k] ?? {}), [field]: value } }
    })
  }, [])

  const reset = useCallback(() => setGoals(seedTargets()), [])

  const notify = useCallback((msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3200)
  }, [])

  /** Everything a goal row needs. `actual` is the data unless the user has overridden it. */
  const read = useCallback((scope, scopeId, metricId) => {
    const stored = goals[goalKey(scope, scopeId, metricId)] ?? {}
    const computed = actualFor(metricId, scope, scopeId)
    return {
      target: stored.target ?? null,
      actual: stored.actual ?? computed.value,
      isOverridden: stored.actual != null,
      comment: stored.comment ?? '',
      reporting: computed.reporting,
      total: computed.total,
      isYesNo: computed.isYesNo ?? false,
    }
  }, [goals])

  /** Sum of children's targets — shown beside a level's own target, never instead of it. */
  const rolledUpTarget = useCallback((metricId, childScope, childIds) => {
    let sum = null
    for (const id of childIds) {
      const t = goals[goalKey(childScope, id, metricId)]?.target
      if (typeof t === 'number') sum = (sum ?? 0) + t
    }
    return sum
  }, [goals])

  const value = useMemo(
    () => ({ goals, read, patch, reset, rolledUpTarget, notify, toast, metrics: { FOUNDATION, CLUB_METRICS } }),
    [goals, read, patch, reset, rolledUpTarget, notify, toast],
  )

  return (
    <Ctx.Provider value={value}>
      {children}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] rounded-xl px-5 py-3 text-sm font-medium text-white shadow-2xl"
             style={{ background: '#003DA5' }}>
          {toast}
        </div>
      )}
    </Ctx.Provider>
  )
}

export const useGoals = () => {
  const c = useContext(Ctx)
  if (!c) throw new Error('useGoals must be used inside <GoalsProvider>')
  return c
}
