import { useParams, Navigate } from 'react-router-dom'
import { CLUBS } from '@/data/clubs'
import { GOALS_YEAR } from '@/data/disha'
import { REPORT_CATEGORIES } from '@/data/reportFields'
import { CLUB_FIELDS, clubFieldsIn, clubCategories, clubAchieved, clubTarget } from '@/data/clubFigures'
import { useGoals } from '@/context/GoalsProvider'
import { LevelBanner, DataNote } from '@/components/Bits'
import ReportGoalForm from '@/components/ReportGoalForm'

export default function ClubGoals() {
  const { clubId } = useParams()
  const { notify } = useGoals()
  const club = CLUBS.find((c) => c.id === clubId)
  if (!club) return <Navigate to="/ri/overview" replace />

  return (
    <>
      <LevelBanner
        eyebrow={`District ${club.districtId} · goal entry · ${GOALS_YEAR}`}
        title={`Goals — ${club.name}`}
        sub="Each Target arrives pre-filled with a provisional figure. Replace it with the one the club agrees."
      />

      <div className="mb-4">
        <DataNote tone="slate">
          Every <strong>Target</strong> here starts as a <strong>provisional</strong> figure, grown
          from the club&apos;s own reported number so there is something to measure against. It is
          not a client target and the portal holds none. Type the figure the club agrees for{' '}
          {GOALS_YEAR} over it: what you enter is kept, and it replaces the provisional one here and
          on the district&apos;s Clubs page. A club target does not roll into the district&apos;s own
          goals — those are set by the governor against the district&apos;s figures, not summed from
          its clubs. <strong>Achieved</strong> is the club&apos;s reported figure and reads &mdash;
          where nothing has been reported; those fields carry no target either.
        </DataNote>
      </div>

      <ReportGoalForm
        categories={clubCategories(REPORT_CATEGORIES)}
        fields={clubFieldsIn}
        scopeKey={`club:${club.id}`}
        achieved={(f) => clubAchieved(f, club)}
        target={(f) => clubTarget(club.id, f.id)}
        notify={notify}
        savedMessage="Goals saved on this club — the district sets its own goals separately."
      />

      <div className="mt-5">
        <DataNote tone="slate">
          A club answers {CLUB_FIELDS.length} of the report&apos;s fields. The rest are district-level and
          are not shown here.
        </DataNote>
      </div>
    </>
  )
}
