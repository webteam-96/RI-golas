import { useParams } from 'react-router-dom'
import { CLUBS } from '@/data/clubs'
import { ZONE } from '@/data/zone6'
import { CLUB_METRICS } from '@/data/metrics'
import { LevelBanner, DataNote } from '@/components/Bits'
import GoalTable from '@/components/GoalTable'

export default function ClubGoals() {
  const { clubId } = useParams()
  const club = CLUBS.find((c) => c.id === clubId)

  return (
    <>
      <LevelBanner
        eyebrow={`${ZONE.name} · District ${club.districtId} · goal entry`}
        title={`Goals — ${club.name}`}
        sub="Set your club's targets. Actuals come from reported data; override any of them if needed."
      />

      <div className="mb-4">
        <DataNote tone="slate">
          Change a target and save — the District, Zone and RI views recompute immediately. An actual you
          type over the reported figure is highlighted amber so it is never mistaken for source data.
        </DataNote>
      </div>

      <GoalTable scope="club" scopeId={clubId} metrics={CLUB_METRICS} />
    </>
  )
}
