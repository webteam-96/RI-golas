import { useParams, Link, Navigate } from 'react-router-dom'
import { DISHA_DISTRICTS, GOALS_YEAR } from '@/data/disha'
import { REPORT_CATEGORIES } from '@/data/reportFields'
import { CLUB_FIELDS, clubFieldsIn, clubCategories, clubAchieved, clubTarget } from '@/data/clubFigures'
import { useTargetCount } from '@/data/dishaTargets'
import { clubsIn } from '@/lib/rollup'
import { dishaNumber } from '@/lib/disha'
import { LevelBanner, Card, EmptyState, DataNote } from '@/components/Bits'
import GoalMatrix from '@/components/GoalMatrix'

/** Every club in the district, on the same five categories as the levels above. */
export default function DistrictClubs() {
  const { districtId } = useParams()
  useTargetCount() // clubs enter targets on their own goals screen; re-render when they do. The
                   // count it returns spans every scope, so the note below counts these clubs'.
  const d = DISHA_DISTRICTS.find((x) => x.number === String(districtId))
  if (!d) return <Navigate to="/ri/districts" replace />

  const clubs = clubsIn(d.number)
  const cats = clubCategories(REPORT_CATEGORIES)
  const withTarget = clubs.reduce(
    (n, c) => n + CLUB_FIELDS.filter((f) => clubTarget(c.id, f.id)).length, 0)

  if (!clubs.length) {
    return (
      <>
        <LevelBanner eyebrow={`District ${d.number} · ${GOALS_YEAR}`} title="Clubs"
                     sub={d.governor ?? undefined} />
        <Card>
          <EmptyState>
            No club roster is loaded for District {d.number}. Only D3120 and D3030 carry one in this
            prototype; the district-level figures are on the Overview.
          </EmptyState>
        </Card>
      </>
    )
  }

  return (
    <>
      <LevelBanner
        eyebrow={`District ${d.number} · ${GOALS_YEAR}`}
        title="Clubs"
        sub={`${clubs.length} clubs · ${d.governor ?? 'governor not assigned'}`}
      />

      <GoalMatrix
        categories={cats.map((c) => ({ id: c.id, label: c.label }))}
        fields={(catId) => clubFieldsIn(catId)}
        entities={clubs.map((c) => ({ id: c.id, label: c.name, to: `/club/${c.id}/overview` }))}
        achieved={(f, e) => clubAchieved(f, clubs.find((c) => c.id === e.id))}
        target={(f, e) => clubTarget(e.id, f.id)}
        format={dishaNumber}
        entityHeading="Field"
        title={`District ${d.number} clubs`}
        sub={`${clubs.length} across · figures from the AG-module club dataset`}
        // Not the district's default. These figures come from src/data/clubs.js, not the DISHA
        // portal, and that file states no reporting period anywhere — claiming them for
        // PREVIOUS_YEAR would invent a period the data does not carry. The target half of the
        // caption stands: club targets are entered on each club's own goals screen, for GOALS_YEAR.
        achievedLabel="Achieved as each club last reported it (the club dataset states no period)"
      />

      <div className="mt-5">
        <DataNote tone="slate">
          Clubs answer {CLUB_FIELDS.length} of the report&apos;s fields — the rest are district-level and
          are left off this page.{' '}
          {withTarget
            ? `${withTarget} target${withTarget === 1 ? ' is' : 's are'} set across these clubs — a figure with one is scored against it, the rest are shown on their own.`
            : 'No targets are set for these clubs yet, so each figure is shown on its own.'}
        </DataNote>
      </div>
    </>
  )
}
