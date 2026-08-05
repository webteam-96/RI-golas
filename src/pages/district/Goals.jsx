import { useParams, Navigate } from 'react-router-dom'
import { DISHA_DISTRICTS, GOALS_YEAR } from '@/data/disha'
import { REPORT_CATEGORIES, REPORT_FIELDS, fieldsInCategory, achievedFor, SOURCED_FIELDS } from '@/data/reportFields'
import { targetValue } from '@/data/dishaTargets'
import { useGoals } from '@/context/GoalsProvider'
import { LevelBanner, DataNote } from '@/components/Bits'
import ReportGoalForm from '@/components/ReportGoalForm'

/** Where a governor sets the district's targets, against the achieved figures already on file. */
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
        sub="Set a target for each field. Achieved is the figure already reported."
      />

      <div className="mb-4">
        <DataNote tone="slate">
          Enter the <strong>Target</strong> agreed at the goal-setting event. The portal seeds none, so
          every field starts blank and nothing is scored until a target is entered. The{' '}
          <strong>Achieved</strong> column is the reported figure and is read-only.
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
          The portal carries {SOURCED_FIELDS} of the {REPORT_FIELDS.length} fields on the monthly
          report. The remaining {REPORT_FIELDS.length - SOURCED_FIELDS}, Public Image included, are
          not collected in it, so they read as a dash — a target can still be set against them.
        </DataNote>
      </div>
    </>
  )
}
