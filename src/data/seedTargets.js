import { FOUNDATION, CLUB_METRICS, anyMetric, SEED_ZONE_TARGETS, SEED_DISTRICT_TARGET_FACTOR } from './metrics.js'
import { ZONE } from './zone6.js'
import { CLUBS_BY_DISTRICT } from './clubs.js'
import { actualFor } from '../lib/rollup.js'

export const goalKey = (scope, scopeId, metricId) => `${scope}:${scopeId}:${metricId}`

/**
 * A rate is not a total. Percentages and per-capita figures must carry the SAME target down
 * the hierarchy — every district should be aiming at 70% My Rotary registration, not at its
 * proportional slice of 70. Splitting a rate the way a count is split produces nonsense.
 */
const isRate = (metricId) => {
  const m = anyMetric(metricId)
  return m?.unit === 'percent' || m?.rollup === 'recompute'
}

/**
 * Split a total across children in proportion to what each already contributes, with a floor.
 *
 * The floor matters: a pure proportional split hands a child contributing nothing a target of
 * zero, which leaves it *unscored* rather than *behind* — so the worst performers would drop
 * out of the achievement figure entirely, flattering it. The floor is a quarter of an equal
 * share, so a district doing nothing still has a bar to be measured against.
 */
function splitTotal(total, target, shares) {
  const floor = Math.max(1, Math.round((target / shares.length) * 0.25))
  return shares.map(({ id, v }) => ({
    id,
    target: total > 0 ? Math.max(floor, Math.round((v / total) * target * SEED_DISTRICT_TARGET_FACTOR)) : floor,
  }))
}

/**
 * Seed the demo targets. Zone and RI take the round numbers from metrics.js; districts and
 * clubs derive theirs from those.
 *
 * Lives outside GoalsProvider so the checks in src/lib can run it under plain node.
 */
export function seedTargets() {
  const out = {}

  for (const [metricId, zoneTarget] of Object.entries(SEED_ZONE_TARGETS)) {
    out[goalKey('zone', ZONE.id, metricId)] = { target: zoneTarget }
    out[goalKey('ri', 'ri', metricId)] = { target: zoneTarget }

    const fm = FOUNDATION.find((x) => x.id === metricId)
    if (fm?.unit === 'yesno') continue

    const isClubMetric = CLUB_METRICS.some((m) => m.id === metricId)
    const rate = isRate(metricId)

    const dShares = ZONE.districtIds.map((d) => {
      const v = actualFor(metricId, 'district', d).value
      return { id: d, v: typeof v === 'number' ? v : 0 }
    })
    const dTotal = dShares.reduce((s, x) => s + x.v, 0)

    const dTargets = rate
      ? dShares.map(({ id }) => ({ id, target: zoneTarget }))
      : splitTotal(dTotal, zoneTarget, dShares)

    for (const { id: d, target: t } of dTargets) {
      out[goalKey('district', d, metricId)] = { target: t }

      if (!isClubMetric) continue
      const clubs = CLUBS_BY_DISTRICT[d] ?? []
      if (!clubs.length) continue

      const cShares = clubs.map((c) => {
        const cv = actualFor(metricId, 'club', c.id).value
        return { id: c.id, v: typeof cv === 'number' ? cv : 0 }
      })
      const cTotal = cShares.reduce((s, x) => s + x.v, 0)

      const cTargets = rate
        ? cShares.map(({ id }) => ({ id, target: zoneTarget }))
        : splitTotal(cTotal, t, cShares)

      for (const { id, target } of cTargets) out[goalKey('club', id, metricId)] = { target }
    }
  }
  return out
}
