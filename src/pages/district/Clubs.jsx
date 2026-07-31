import { useParams, Link, Navigate } from 'react-router-dom'
import { DISHA_DISTRICTS, GOALS_YEAR } from '@/data/disha'
import { REPORT_CATEGORIES } from '@/data/reportFields'
import { CLUB_FIELDS, clubFieldsIn, clubCategories, clubAchieved, clubTarget } from '@/data/clubFigures'
import { clubsIn } from '@/lib/rollup'
import { dishaNumber } from '@/lib/disha'
import { LevelBanner, Card, EmptyState, DataNote } from '@/components/Bits'
import GoalMatrix from '@/components/GoalMatrix'

/** Every club in the district, on the same five categories as the levels above. */
export default function DistrictClubs() {
  const { districtId } = useParams()
  const d = DISHA_DISTRICTS.find((x) => x.number === String(districtId))
  if (!d) return <Navigate to="/ri/districts" replace />

  const clubs = clubsIn(d.number)
  const cats = clubCategories(REPORT_CATEGORIES)

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
        sub={`${clubs.length} across · achieved over target`}
        totalLabel="District"
      />

      <div className="mt-5">
        <DataNote tone="slate">
          Clubs answer {CLUB_FIELDS.length} of the report&apos;s fields — the rest are district-level and
          are left off this page. Targets are placeholders derived from each club&apos;s own figure.
        </DataNote>
      </div>
    </>
  )
}
