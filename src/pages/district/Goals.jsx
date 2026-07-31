import { useParams } from 'react-router-dom'
import { ZONE } from '@/data/zone6'
import { FOUNDATION } from '@/data/metrics'
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
        title={`District ${districtId} Goals`}
        sub="Targets are fixed, with the zone target beside them for context"
      />

      <div className="mb-4">
        <DataNote tone="slate">
          Both target columns are read-only — your own and what {ZONE.name} has committed to. Enter the
          achieved figures; the gap between a district target and its share of the zone target is meant
          to be visible, not blocked.
        </DataNote>
      </div>

      <GoalTable
        scope="district"
        scopeId={districtId}
        metrics={FOUNDATION}
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
