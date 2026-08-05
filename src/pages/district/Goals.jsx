import { useParams, Navigate } from 'react-router-dom'
import { DISHA_DISTRICTS, GOALS_YEAR, PREVIOUS_YEAR } from '@/data/disha'
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
        sub="Each Target arrives pre-filled with a provisional figure. Replace it with the one agreed at the goal-setting event."
      />

      <div className="mb-4">
        <DataNote tone="slate">
          Every <strong>Target</strong> here starts as a <strong>provisional</strong> figure, grown
          from this district&apos;s own {PREVIOUS_YEAR} number so the screens have something to
          measure against. It is not a client target and the portal holds none — District Governors
          set theirs at the goal-setting event. Type the agreed {GOALS_YEAR} figure over it: what
          you enter is kept, and it replaces the provisional one everywhere that field appears. The{' '}
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
        savedMessage="Goals saved — the district, zone and RI views recompute immediately."
      />

      <div className="mt-5">
        <DataNote>
          The portal carries {SOURCED_FIELDS} of the {REPORT_FIELDS.length} fields on the monthly
          report. The remaining {REPORT_FIELDS.length - SOURCED_FIELDS}, Public Image included, are
          not collected in it, so they read as a dash and get no provisional target either — there
          is no figure to grow one from. A governor can still type a target against them.
        </DataNote>
      </div>
    </>
  )
}
