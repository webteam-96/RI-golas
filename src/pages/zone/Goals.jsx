import { ZONE, DISTRICTS } from '@/data/zone6'
import { FOUNDATION } from '@/data/metrics'
import { LevelBanner, DataNote } from '@/components/Bits'
import GoalTable from '@/components/GoalTable'

export default function ZoneGoals() {
  return (
    <>
      <LevelBanner
        eyebrow={`Zone ${ZONE.number} · goal entry`}
        title="Zone Goals"
        sub="Targets are fixed. Enter what the zone has achieved against each one."
      />

      <div className="mb-4">
        <DataNote tone="slate">
          The <strong>District commitment</strong> column is the sum of the 9 districts&apos; own targets.
          It sits beside the zone target rather than replacing it — the gap between the two is what a
          coordinator needs to see.
        </DataNote>
      </div>

      <GoalTable
        scope="zone"
        scopeId={ZONE.id}
        metrics={FOUNDATION}
        childScope="district"
        childIds={DISTRICTS.map((d) => d.id)}
        childLabel="District commitment"
      />
    </>
  )
}
