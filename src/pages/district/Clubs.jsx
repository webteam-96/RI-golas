import { useParams, Link, Navigate } from 'react-router-dom'
import { DISHA_DISTRICTS, GOALS_YEAR } from '@/data/disha'
import { REPORT_CATEGORIES } from '@/data/reportFields'
import { CLUB_FIELDS, clubFieldsIn, clubCategories, clubAchieved, clubTarget } from '@/data/clubFigures'
import { enteredCountIn, useTargetCount } from '@/data/dishaTargets'
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
  // Entered targets only. clubTarget also returns a provisional figure for every reported field,
  // so counting through it would claim hundreds are set when no president has typed one.
  const entered = clubs.reduce((n, c) => n + enteredCountIn('club', c.id), 0)

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
        // PREVIOUS_YEAR would invent a period the data does not carry. Targets are provisional,
        // grown from each club's own figure, until a president enters one on the club's goals screen.
        achievedLabel="Achieved as each club last reported it (the club dataset states no period)"
      />

      <div className="mt-5">
        <DataNote tone="slate">
          Clubs answer {CLUB_FIELDS.length} of the report&apos;s fields — the rest are district-level and
          are left off this page. The <strong>targets are provisional</strong>: each is worked out
          from that club&apos;s own reported figure, not supplied by the client and not held in the
          portal, which seeds none. A target entered on a club&apos;s Goals screen is the real one and
          replaces the provisional figure for that field
          {entered ? `, and ${entered} ${entered === 1 ? 'has' : 'have'} been entered across these clubs` : ''}.
          A field the club has not reported carries no target either and stays blank on both sides.
        </DataNote>
      </div>
    </>
  )
}
