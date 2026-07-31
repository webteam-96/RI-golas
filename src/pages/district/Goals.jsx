import { useParams } from 'react-router-dom'
import { ZONE } from '@/data/zone6'
import { metricsFor } from '@/data/metrics'
import { clubsIn } from '@/lib/rollup'
import { LevelBanner, DataNote } from '@/components/Bits'
import GoalTable from '@/components/GoalTable'

export default function DistrictGoals() {
  const { districtId } = useParams()
  const clubIds = clubsIn(districtId).map((c) => c.id)

  return (
    <>
      <LevelBanner
        eyebrow={`${ZONE.name} · goal entry`}
        title={`District ${districtId} Targets`}
        sub="Your targets, with the zone target beside them for context"
      />

      <div className="mb-4">
        <DataNote tone="slate">
          The <strong>Zone target</strong> column is read-only — it is what {ZONE.name} has committed to.
          Nothing stops a district target sitting below its share of it; the gap is meant to be visible,
          not blocked.
        </DataNote>
      </div>

      <GoalTable
        scope="district"
        scopeId={districtId}
        metrics={metricsFor('district')}
        contextLabel="Zone target"
        contextScope="zone"
        contextId={ZONE.id}
        childScope={clubIds.length ? 'club' : undefined}
        childIds={clubIds}
        childLabel="Club commitment"
      />
    </>
  )
}
