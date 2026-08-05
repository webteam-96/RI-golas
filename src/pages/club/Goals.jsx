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
        sub="Set a target against each goal. The achieved figure is what the club has reported."
      />

      <div className="mb-4">
        <DataNote tone="slate">
          The club sets its own targets, so every <strong>Target</strong> starts blank — enter one
          and the progress and status columns fill in here and on the district&apos;s Clubs page.
          A club target does not roll into the district&apos;s own goals: those are set by the
          governor against the district&apos;s figures, not summed from its clubs.{' '}
          <strong>Achieved</strong> is the club&apos;s reported figure and reads &mdash; where nothing
          has been reported.
        </DataNote>
      </div>

      <ReportGoalForm
        categories={clubCategories(REPORT_CATEGORIES)}
        fields={clubFieldsIn}
        scopeKey={`club:${club.id}`}
        achieved={(f) => clubAchieved(f, club)}
        target={(f) => clubTarget(club.id, f.id)}
        notify={notify}
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
