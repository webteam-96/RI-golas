import { useParams, Link, Navigate } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { DISHA_DISTRICTS, districtsIn, GOALS_YEAR, PREVIOUS_YEAR } from '@/data/disha'
import { REPORT_CATEGORIES, REPORT_FIELDS, fieldsInCategory, achievedFor } from '@/data/reportFields'
import { targetValue } from '@/data/dishaTargets'
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
  const d = DISHA_DISTRICTS.find((x) => x.number === String(districtId))
  if (!d) return <Navigate to="/ri/districts" replace />

  const zoneDistricts = districtsIn(d.zoneId)
  const clubs = clubsIn(d.number)

  return (
    <>
      <LevelBanner
        eyebrow={`District ${d.number} · ${GOALS_YEAR}`}
        title={`District ${d.number}`}
        sub={`${d.governor ?? 'Governor not assigned'} · ${PREVIOUS_YEAR} figures against ${GOALS_YEAR} targets`}
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
          return (
            <Kpi key={c.id} label={c.label} sub={f?.label}
                 value={dishaNumber(achievedFor(f, d), f?.unit) ?? '—'}
                 tone={c.id === 'foundation' ? 'gold' : c.id === 'membership' ? 'blue'
                       : c.id === 'publicimage' ? 'purple' : c.id === 'projects' ? 'green' : 'royal'} />
          )
        })}
      </div>

      {/* This district against the rest of its zone */}
      <GoalMatrix
        categories={REPORT_CATEGORIES.map((c) => ({ id: c.id, label: c.label }))}
        fields={(catId) => fieldsInCategory(catId).map((f) => ({ ...f, muted: f.src ? null : 'demo' }))}
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
        totalLabel="Zone"
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
          <EmptyState>No club roster is loaded for District {d.number}.</EmptyState>
        )}
      </Card>

      <div className="mt-5">
        <DataNote>
          Targets are placeholders until the governor sets them at the goal-setting event. Rows marked
          <strong> demo</strong> carry a stand-in achieved figure too, because no dataset covers them yet.
        </DataNote>
      </div>
    </>
  )
}
