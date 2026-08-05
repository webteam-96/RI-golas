import { useSyncExternalStore } from 'react'
import { ZONE, DATA_AS_OF } from '@/data/zone6'
import { FOUNDATION } from '@/data/metrics'
import { GOALS_YEAR, PREVIOUS_YEAR } from '@/data/disha'
import { subscribe, getTargets, targetIn } from '@/data/dishaTargets'
import { LevelBanner, DataNote } from '@/components/Bits'
import GoalTable from '@/components/GoalTable'

export default function ZoneGoals() {
  // Re-render on every write, not only on the first: the count below has to move as targets
  // are entered, and the snapshot identity changes where a key count would not.
  useSyncExternalStore(subscribe, getTargets, getTargets)

  // This page's own targets. The global store also holds district and club ones, entered on
  // other screens and scored nowhere on this page, so the store-wide count would overstate it.
  // Scope matches the `${scope}-metric` GoalTable writes under for scope="zone".
  const targetsSet = FOUNDATION.filter((m) => targetIn('zone-metric', ZONE.id, m.id) != null).length

  return (
    <>
      <LevelBanner
        eyebrow={`Zone ${ZONE.number} · goal entry · ${GOALS_YEAR}`}
        title="Zone Goals"
        sub={`Targets are set at the goal-setting event. ${
          targetsSet
            ? `${targetsSet} set so far for ${GOALS_YEAR}.`
            : 'None are set yet, so nothing here is scored — enter the zone target beside each metric.'
        }`}
      />

      <div className="mb-4">
        <DataNote tone="slate">
          <strong>Achieved</strong> is what the nine Zone 6 districts had reported in the Foundation
          goals workbook as at {DATA_AS_OF} — part-way through {PREVIOUS_YEAR}, and the baseline a
          target is set against rather than progress within {GOALS_YEAR}. <strong>Target</strong> is
          the zone&apos;s own figure for {GOALS_YEAR}. District targets are set on each district&apos;s
          goals page against the monthly report&apos;s fields, which are not these workbook metrics,
          so they are not summed into this screen.
        </DataNote>
      </div>

      <GoalTable scope="zone" scopeId={ZONE.id} metrics={FOUNDATION} />
    </>
  )
}
