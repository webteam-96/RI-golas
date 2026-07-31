import { useParams, Navigate } from 'react-router-dom'
import { DISHA_DISTRICTS, GOALS_YEAR } from '@/data/disha'
import { REPORT_CATEGORIES, fieldsInCategory, achievedFor } from '@/data/reportFields'
import { targetValue } from '@/data/dishaTargets'
import { useGoals } from '@/context/GoalsProvider'
import { LevelBanner, DataNote } from '@/components/Bits'
import ReportGoalForm from '@/components/ReportGoalForm'

export default function DistrictGoals() {
  const { districtId } = useParams()
  const { notify } = useGoals()
  const d = DISHA_DISTRICTS.find((x) => x.number === String(districtId))
  if (!d) return <Navigate to="/ri/districts" replace />

  return (
    <>
      <LevelBanner
        eyebrow={`District ${d.number} · goal entry · ${GOALS_YEAR}`}
        title={`District ${d.number} Goals`}
        sub="Targets are fixed. Enter what the district has achieved against each one."
      />

      <div className="mb-4">
        <DataNote tone="slate">
          The <strong>Target</strong> column is locked — it comes from the goal-setting event. Enter an
          achieved figure and it recomputes here and on every level above.
        </DataNote>
      </div>

      <ReportGoalForm
        categories={REPORT_CATEGORIES}
        fields={(catId) => fieldsInCategory(catId).map((f) => ({ ...f }))}
        scopeKey={`district:${d.id}`}
        achieved={(f) => achievedFor(f, d)}
        target={(f) => targetValue(d.id, f.id)}
        notify={notify}
      />

      <div className="mt-5">
        <DataNote>
          Achieved figures start from the data on file. Anything typed over one is
          highlighted amber so it is never mistaken for source data.
        </DataNote>
      </div>
    </>
  )
}
