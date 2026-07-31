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
        sub="Targets are fixed. Enter what your club has achieved against each one."
      />

      <div className="mb-4">
        <DataNote tone="slate">
          The <strong>Target</strong> column is locked. Enter an achieved figure and save — the district,
          zone and RI views recompute immediately. Anything typed over the reported figure is highlighted
          amber so it is never mistaken for source data.
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
