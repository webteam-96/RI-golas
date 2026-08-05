import { useParams, Link, Navigate } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { DISHA_DISTRICTS, districtsIn, GOALS_YEAR, PREVIOUS_YEAR } from '@/data/disha'
import { REPORT_CATEGORIES, REPORT_FIELDS, fieldsInCategory, achievedFor, SOURCED_FIELDS } from '@/data/reportFields'
import { targetValue, useTargetCount } from '@/data/dishaTargets'
import { clubsIn } from '@/lib/rollup'
import { dishaNumber } from '@/lib/disha'
import { LevelBanner, Kpi, DataNote, EmptyState, Card } from '@/components/Bits'
import GoalMatrix from '@/components/GoalMatrix'

const LEAD = {
  membership: 'membersStart', foundation: 'annualFund', publicimage: 'piEvents',
  projects: 'serviceProjects', newgen: 'rotaractClubs',
}
const leadField = (catId) => REPORT_FIELDS.find((f) => f.id === LEAD[catId])

/** One district on the same data and the same five categories as every other level. */
export default function DistrictOverview() {
  const { districtId } = useParams()
  useTargetCount() // targets are entered on the goals screen; re-render when they are. The count
                   // it returns is global — a club or zone-metric target would inflate it — so the
                   // note below counts the districts this page actually shows.
  const d = DISHA_DISTRICTS.find((x) => x.number === String(districtId))
  if (!d) return <Navigate to="/ri/districts" replace />

  const zoneDistricts = districtsIn(d.zoneId)
  const clubs = clubsIn(d.number)

  // The tiles are this district's and the matrix is its zone, so both are covered by counting
  // over the districts on screen.
  const withTarget = zoneDistricts.reduce(
    (n, x) => n + REPORT_FIELDS.filter((f) => targetValue(x.id, f.id)).length, 0)

  return (
    <>
      <LevelBanner
        eyebrow={`District ${d.number} · ${GOALS_YEAR}`}
        title={`District ${d.number}`}
        sub={`${d.governor ?? 'Governor not assigned'} · achieved ${PREVIOUS_YEAR} · targets for ${GOALS_YEAR}`}
        right={
          <Link to="/ri/overview"
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-white/15 border border-white/30 hover:bg-white/25">
            All districts <ArrowUpRight size={13} />
          </Link>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
        {REPORT_CATEGORIES.map((c) => {
          const f = leadField(c.id)
          // Public Image and Projects lead on a field the portal has no column for, so those two
          // tiles are a dash on every district. The sub line says why, otherwise a bare em-dash
          // reads as something that failed to load.
          return (
            <Kpi key={c.id} label={c.label} sub={f && (f.src ? f.label : `${f.label} · not collected`)}
                 value={dishaNumber(achievedFor(f, d), f?.unit) ?? '—'}
                 tone={c.id === 'foundation' ? 'gold' : c.id === 'membership' ? 'blue'
                       : c.id === 'publicimage' ? 'purple' : c.id === 'projects' ? 'green' : 'royal'} />
          )
        })}
      </div>

      {/* This district against the rest of its zone */}
      <GoalMatrix
        categories={REPORT_CATEGORIES.map((c) => ({ id: c.id, label: c.label }))}
        fields={(catId) => fieldsInCategory(catId).map((f) => ({ ...f }))}
        entities={zoneDistricts.map((x) => ({
          id: x.id,
          label: x.number === d.number ? `${x.number} ●` : x.number,
          to: `/district/${x.number}/overview`,
        }))}
        achieved={(f, e) => achievedFor(f, DISHA_DISTRICTS.find((x) => x.id === e.id))}
        target={(f, e) => targetValue(e.id, f.id)}
        format={dishaNumber}
        title={`District ${d.number} in its zone`}
        sub={`${zoneDistricts.length} districts · this one marked ●`}
      />

      <Card className="mt-5" title="Clubs" sub={clubs.length ? `${clubs.length} on file` : undefined}
            right={clubs.length ? (
              <Link to={`/district/${d.number}/clubs`} className="text-[12px] font-semibold text-royal hover:underline">
                View all →
              </Link>
            ) : null}>
        {clubs.length ? (
          <div className="flex flex-wrap gap-2">
            {clubs.slice(0, 24).map((c) => (
              <Link key={c.id} to={`/club/${c.id}/overview`}
                    className="text-[12px] px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600
                               hover:border-royal hover:text-royal transition-colors">
                {c.name}
              </Link>
            ))}
            {clubs.length > 24 && (
              <span className="text-[12px] px-3 py-1.5 text-slate-400">+{clubs.length - 24} more</span>
            )}
          </div>
        ) : (
          <EmptyState>
            No club roster is loaded for District {d.number} — only D3120 and D3030 carry one.
          </EmptyState>
        )}
      </Card>

      <div className="mt-5">
        <DataNote>
          Every figure here is what was achieved in {PREVIOUS_YEAR}; targets are set by District
          Governors for {GOALS_YEAR} at the goal-setting event.{' '}
          {withTarget
            ? `${withTarget} ${withTarget === 1 ? 'is' : 'are'} set across these ${zoneDistricts.length} districts — a field with one is scored against it, the rest are shown on their own.`
            : 'None are set for these districts yet, so nothing here is scored against one.'}{' '}
          The portal carries {SOURCED_FIELDS} of
          the {REPORT_FIELDS.length} fields on the monthly report; the rest, Public Image included,
          are not collected in it at all and read as a dash.
        </DataNote>
      </div>
    </>
  )
}
