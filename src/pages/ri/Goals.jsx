import { DISTRICTS } from '@/data/zone6'
import { metricsFor } from '@/data/metrics'
import { LevelBanner, DataNote } from '@/components/Bits'
import GoalTable from '@/components/GoalTable'

export default function RiGoals() {
  return (
    <>
      <LevelBanner
        eyebrow="RI Director Office · goal entry"
        title="RI Targets"
        sub="Foundation, Membership, Public Image and Projects — the same four areas at every level"
      />

      <div className="mb-4">
        <DataNote tone="slate">
          The <strong>District commitment</strong> column is the sum of what the {DISTRICTS.length}{' '}
          districts have individually committed to. It sits beside the RI target rather than replacing
          it — the gap between the two is the point.
        </DataNote>
      </div>

      <GoalTable
        scope="ri"
        scopeId="ri"
        metrics={metricsFor('ri')}
        childScope="district"
        childIds={DISTRICTS.map((d) => d.id)}
        childLabel="District commitment"
      />
    </>
  )
}
