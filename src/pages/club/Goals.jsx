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
        sub="Targets are set for you. Enter what your club has achieved against each one."
      />

      <div className="mb-4">
        <DataNote tone="slate">
          The <strong>Target</strong> column is locked. Enter an achieved figure and save — the District,
          Zone and RI views recompute immediately. Anything you type over the reported figure is
          highlighted amber so it is never mistaken for source data.
        </DataNote>
      </div>

      <GoalTable scope="club" scopeId={clubId} metrics={CLUB_METRICS} />
    </>
  )
}
