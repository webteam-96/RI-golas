import { Link } from 'react-router-dom'
import { ZONE, ARRFC_ROLE_LONG, signedInCoordinator } from '@/data/zone6'
import { DISHA_DISTRICTS, GOALS_YEAR, PREVIOUS_YEAR } from '@/data/disha'
import { REPORT_CATEGORIES, REPORT_FIELDS, fieldsInCategory, achievedFor, SOURCED_FIELDS } from '@/data/reportFields'
import { targetValue, useTargetCount } from '@/data/dishaTargets'
import { dishaNumber } from '@/lib/disha'
import { LevelBanner, Kpi, Card, Bar, DataNote } from '@/components/Bits'
import GoalMatrix from '@/components/GoalMatrix'

const byNumber = (n) => DISHA_DISTRICTS.find((d) => d.number === String(n)) ?? null

const LEAD = {
  membership: 'membersStart', foundation: 'annualFund', publicimage: 'piEvents',
  projects: 'serviceProjects', newgen: 'rotaractClubs',
}
const leadField = (catId) => REPORT_FIELDS.find((f) => f.id === LEAD[catId])

/**
 * Mean attainment over one district's fields, each held between 0 and 100. Null until targets
 * are entered — with nothing to divide by there is no percentage to show. The floor matters as
 * much as the cap: a field that fell backwards is 0% attained, not a negative percentage.
 */
function districtPct(d) {
  const p = []
  for (const f of REPORT_FIELDS) {
    const a = achievedFor(f, d)
    const t = targetValue(d.id, f.id)
    if (a != null && t) p.push(Math.min(Math.max((a / t) * 100, 0), 100))
  }
  return p.length ? p.reduce((s, v) => s + v, 0) / p.length : null
}

/**
 * The Zone Coordinator role is one ARRFC signed in, so this page is theirs alone — their
 * districts, their figures. The whole team is the RI Director's view, not this one.
 */
export default function ZoneCoordinators() {
  const c = signedInCoordinator()
  useTargetCount() // targets are entered elsewhere; re-render when they are. The count it returns
                   // is every scope's, not this coordinator's, so the note below uses `scores`.
  const districts = c.supports.map(byNumber).filter(Boolean)

  const scores = districts.map(districtPct).filter((v) => v != null)
  const attainment = scores.length ? scores.reduce((s, v) => s + v, 0) / scores.length : null

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
        eyebrow={`${ZONE.name} · ${ARRFC_ROLE_LONG} · ${GOALS_YEAR}`}
        title={c.name}
        sub={`Home district ${c.homeDistrict} · supporting ${c.supports.join(', ')} · reporting to RRFC ${ZONE.rrfc.name}`}
      />

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-5">
        <Kpi label="Districts" value={districts.length} tone="royal" sub="supported" />
        {REPORT_CATEGORIES.map((cat) => {
          const f = leadField(cat.id)
          const v = sumOver(f)
          return (
            <Kpi key={cat.id} label={cat.label}
                 sub={v == null ? `${f?.label} · not collected` : f?.label}
                 value={dishaNumber(v, f?.unit) ?? '—'}
                 tone={cat.id === 'foundation' ? 'gold' : cat.id === 'membership' ? 'blue'
                       : cat.id === 'publicimage' ? 'purple' : cat.id === 'projects' ? 'green' : 'royal'} />
          )
        })}
      </div>

      <Card className="mb-6" title="My districts" sub="Attainment per district, each counted once">
        <div className="space-y-2">
          {districts.map((d) => {
            const pct = districtPct(d)
            return (
              <Link key={d.id} to={`/district/${d.number}/overview`}
                    className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-50 transition-colors group">
                <span className="w-16 font-data text-[13px] font-semibold text-slate-700 group-hover:text-royal">
                  {d.number}
                </span>
                <span className="flex-1 min-w-0 text-[12px] text-slate-500 truncate">{d.governor ?? '—'}</span>
                <span className="w-40">
                  {/* No target, no bar — a rail at zero width reads as a district on nothing */}
                  {pct == null
                    ? <span className="text-[11px] text-slate-400">no target set</span>
                    : <Bar value={pct} max={100} />}
                </span>
                <span className="w-12 text-right font-data text-[12px] font-semibold text-ink">
                  {pct == null ? '—' : `${pct.toFixed(0)}%`}
                </span>
              </Link>
            )
          })}
        </div>
        <p className="text-[11px] text-slate-400 mt-3">
          {attainment == null ? (
            'Attainment is shown once targets are set against these districts.'
          ) : (
            <>
              Mean across {scores.length} district{scores.length > 1 ? 's' : ''}:{' '}
              <strong className="text-slate-600">{attainment.toFixed(1)}%</strong>
            </>
          )}
        </p>
      </Card>

      <GoalMatrix
        categories={REPORT_CATEGORIES.map((cat) => ({ id: cat.id, label: cat.label }))}
        fields={(catId) => fieldsInCategory(catId).map((f) => ({ ...f, muted: f.src ? null : 'not collected' }))}
        entities={districts.map((d) => ({ id: d.id, label: d.number, to: `/district/${d.number}/overview` }))}
        achieved={(f, e) => achievedFor(f, DISHA_DISTRICTS.find((d) => d.id === e.id))}
        target={(f, e) => targetValue(e.id, f.id)}
        format={dishaNumber}
        title="My districts"
        sub={`${districts.length} supported · achieved ${PREVIOUS_YEAR}, targets for ${GOALS_YEAR} once set`}
      />

      <div className="mt-5 space-y-2">
        <DataNote>
          The figures here are what these districts achieved in {PREVIOUS_YEAR}; targets are set by
          District Governors for {GOALS_YEAR} at the goal-setting event.{' '}
          {scores.length
            ? `Attainment is showing for ${scores.length} of the ${districts.length} districts here; the rest read as a dash.`
            : 'None are scored yet, so every attainment figure reads as a dash.'}
        </DataNote>
        <DataNote tone="slate">
          This is {c.name}&apos;s view — the {districts.length} districts they support. The full Zone{' '}
          {ZONE.number} team, and the zone totals, sit with the RI Director. The portal carries{' '}
          {SOURCED_FIELDS} of the {REPORT_FIELDS.length} fields on the monthly report; Public Image
          is not collected in it at all.
        </DataNote>
      </div>
    </>
  )
}
