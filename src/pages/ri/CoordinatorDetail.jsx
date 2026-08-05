import { useParams, Link, Navigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { ZONE, ARRFC_ROLE_LONG } from '@/data/zone6'
import { DISHA_DISTRICTS, districtsIn, GOALS_YEAR, PREVIOUS_YEAR } from '@/data/disha'
import { REPORT_CATEGORIES, REPORT_FIELDS, SOURCED_FIELDS, fieldsInCategory, achievedFor } from '@/data/reportFields'
import { targetValue, useTargetCount } from '@/data/dishaTargets'
import { dishaNumber } from '@/lib/disha'
import { LevelBanner, Kpi, Card, Bar, DataNote } from '@/components/Bits'
import GoalMatrix from '@/components/GoalMatrix'

const ZONE6 = districtsIn(2)
const byNumber = (n) => DISHA_DISTRICTS.find((d) => d.number === String(n)) ?? null

const LEAD = {
  membership: 'membersStart', foundation: 'annualFund', publicimage: 'piEvents',
  projects: 'serviceProjects', newgen: 'rotaractClubs',
}
const leadField = (catId) => REPORT_FIELDS.find((f) => f.id === LEAD[catId])

/**
 * The list of supported districts used to rank them by mean attainment. Attainment needs a
 * target, no target is set until the goal-setting event, so that ranking scored nothing and
 * every row read as a dash. It compares size instead — members on file, the one figure every
 * district in the zone carries — scaled against the largest district in Zone 6 so a
 * coordinator with a single district gets a proportionate bar rather than a full one.
 */
const MEMBERS = REPORT_FIELDS.find((f) => f.id === 'membersStart')
const ZONE_MAX_MEMBERS = Math.max(...ZONE6.map((d) => achievedFor(MEMBERS, d) ?? 0))

/** Targets set against a given set of districts. The store's own count spans every scope —
 *  clubs and zone metrics included — and this page scores none of those. */
const targetsOver = (districts) =>
  districts.reduce((n, d) => n + REPORT_FIELDS.filter((f) => targetValue(d.id, f.id)).length, 0)

/** One coordinator: the districts they answer for, and what those districts have on file. */
export default function CoordinatorDetail() {
  const { coordinatorId } = useParams()
  const all = [
    { ...ZONE.rrfc, lead: true, supports: ZONE6.map((d) => d.number) },
    ...ZONE.coordinators,
  ]
  const c = all.find((x) => x.id === coordinatorId)
  useTargetCount() // re-render on entry; the number shown comes from this coordinator's districts
  if (!c) return <Navigate to="/ri/coordinators" replace />

  const districts = c.supports.map(byNumber).filter(Boolean)
  const targetsSet = targetsOver(districts)

  const sumOver = (f) => {
    let s = null
    for (const d of districts) {
      const v = achievedFor(f, d)
      if (v != null) s = (s ?? 0) + v
    }
    return s
  }

  return (
    <>
      <LevelBanner
        eyebrow={`${ZONE.name} · ${c.lead ? c.roleLong : ARRFC_ROLE_LONG} · ${GOALS_YEAR}`}
        title={c.name}
        sub={`Home district ${c.homeDistrict} · supporting ${c.lead ? `all ${ZONE6.length} districts` : c.supports.join(', ')}`}
        right={
          <Link to="/ri/coordinators"
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-white/15 border border-white/30 hover:bg-white/25">
            <ArrowLeft size={13} /> All coordinators
          </Link>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-5">
        <Kpi label="Role" value={c.role} tone={c.lead ? 'gold' : 'royal'}
             sub={`${districts.length} district${districts.length > 1 ? 's' : ''}`} />
        {REPORT_CATEGORIES.map((cat) => {
          const f = leadField(cat.id)
          return (
            <Kpi key={cat.id} label={cat.label}
                 sub={f?.src ? f.label : 'not collected in the portal'}
                 value={dishaNumber(sumOver(f), f?.unit) ?? '—'}
                 tone={cat.id === 'foundation' ? 'gold' : cat.id === 'membership' ? 'blue'
                       : cat.id === 'publicimage' ? 'purple' : cat.id === 'projects' ? 'green' : 'royal'} />
          )
        })}
      </div>

      <Card className="mb-6" title="Districts supported"
            sub={c.lead ? 'The RRFC answers for the whole zone' : 'Each district counted once'}>
        <div className="space-y-2">
          {districts.map((d) => {
            const members = achievedFor(MEMBERS, d)
            return (
              <Link key={d.id} to={`/ri/districts/${d.id}`}
                    className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-50 transition-colors group">
                <span className="w-16 font-data text-[13px] font-semibold text-slate-700 group-hover:text-royal">
                  {d.number}
                </span>
                <span className="flex-1 min-w-0 text-[12px] text-slate-500 truncate">{d.governor ?? '—'}</span>
                {/* Unreported stays unreported: '?? 0' would draw a district as measured at nothing */}
                <span className="w-40"><Bar value={members} max={ZONE_MAX_MEMBERS} /></span>
                <span className="w-12 text-right font-data text-[12px] font-semibold text-ink">
                  {dishaNumber(members, MEMBERS.unit) ?? <span className="text-slate-300 font-normal">—</span>}
                </span>
              </Link>
            )
          })}
        </div>
        <p className="text-[11px] text-slate-400 mt-3">
          Bars compare members reported for {PREVIOUS_YEAR} against the largest district
          in {ZONE.name}, not against a goal.
        </p>
      </Card>

      <GoalMatrix
        categories={REPORT_CATEGORIES.map((cat) => ({ id: cat.id, label: cat.label }))}
        fields={(catId) => fieldsInCategory(catId).map((f) => ({ ...f }))}
        entities={districts.map((d) => ({ id: d.id, label: d.number, to: `/ri/districts/${d.id}` }))}
        achieved={(f, e) => achievedFor(f, DISHA_DISTRICTS.find((d) => d.id === e.id))}
        target={(f, e) => targetValue(e.id, f.id)}
        format={dishaNumber}
        title={`${c.name} — districts`}
        sub={`Achieved ${PREVIOUS_YEAR} · ${targetsSet ? `target ${GOALS_YEAR} where one is set` : `no targets set for ${GOALS_YEAR} yet`}`}
      />

      <div className="mt-5">
        <DataNote tone="slate">
          {targetsSet === 0
            ? `District Governors set their ${GOALS_YEAR} targets at the goal-setting event, and none are set against these districts yet, so these are the ${PREVIOUS_YEAR} figures with nothing yet to measure them against. `
            : `${targetsSet} ${GOALS_YEAR} target${targetsSet === 1 ? ' has' : 's have'} been entered against these districts so far, to measure the ${PREVIOUS_YEAR} figures by; the rest are still to be set at the goal-setting event. `}
          The portal carries {SOURCED_FIELDS} of the {REPORT_FIELDS.length} fields on this report, and no
          Public Image data at all, so those rows read as a dash.
        </DataNote>
      </div>
    </>
  )
}
