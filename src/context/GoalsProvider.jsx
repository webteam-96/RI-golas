import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { FOUNDATION, CLUB_METRICS } from '@/data/metrics'
import { actualFor } from '@/lib/rollup'

// v3 drops the fabricated seed the earlier versions shipped with. The bump is what clears it:
// any machine that opened v2 has ~1,100 invented targets committed to localStorage and would
// keep rendering them against a clean source.
//
// This store holds ENTRIES ONLY — an achieved figure typed over the reported one, and a row
// comment. Targets are not here: they live in src/data/dishaTargets, which every scoring
// screen reads. A `target` key written here would be invisible to all of them.
const KEY = 'goalseek.goals.v3'
const Ctx = createContext(null)

export const goalKey = (scope, scopeId, metricId) => `${scope}:${scopeId}:${metricId}`

export function GoalsProvider({ children }) {
  const [goals, setGoals] = useState(() => {
    try {
      const saved = localStorage.getItem(KEY)
      if (saved) return JSON.parse(saved)
    } catch {
      /* corrupt or unavailable storage falls through to an empty store */
    }
    return {}
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

  /** Clears one scope. A global wipe from a card showing one level would take out entries
   *  made on another screen, which is not what a Clear button on that card offers. */
  const clearScope = useCallback((scope, scopeId) => {
    const prefix = `${scope}:${scopeId}:`
    setGoals((g) => Object.fromEntries(Object.entries(g).filter(([k]) => !k.startsWith(prefix))))
  }, [])

  const notify = useCallback((msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3200)
  }, [])

  /** Everything a goal row needs. `actual` is the data unless the user has overridden it. */
  const read = useCallback((scope, scopeId, metricId) => {
    const stored = goals[goalKey(scope, scopeId, metricId)] ?? {}
    const computed = actualFor(metricId, scope, scopeId)
    return {
      actual: stored.actual ?? computed.value,
      isOverridden: stored.actual != null,
      comment: stored.comment ?? '',
      reporting: computed.reporting,
      total: computed.total,
      isYesNo: computed.isYesNo ?? false,
    }
  }, [goals])

  const value = useMemo(
    () => ({ goals, read, patch, clearScope, notify, toast, metrics: { FOUNDATION, CLUB_METRICS } }),
    [goals, read, patch, clearScope, notify, toast],
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
