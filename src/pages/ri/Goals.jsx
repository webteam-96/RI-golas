import { ZONE } from '@/data/zone6'
import { FOUNDATION } from '@/data/metrics'
import { LevelBanner, DataNote } from '@/components/Bits'
import GoalTable from '@/components/GoalTable'

export default function RiGoals() {
  return (
    <>
      <LevelBanner
        eyebrow="RI Director Office · goal entry"
        title="RI Targets"
        sub="Top-level targets. The Zone commitment column is what the zones have actually signed up to."
      />

      <div className="mb-4">
        <DataNote tone="slate">
          Actuals here are the sum of every zone. With one zone loaded they equal Zone 6&apos;s figures.
        </DataNote>
      </div>

      <GoalTable
        scope="ri"
        scopeId="ri"
        metrics={FOUNDATION}
        childScope="zone"
        childIds={[ZONE.id]}
        childLabel="Zone commitment"
      />
    </>
  )
}
