import { Link } from 'react-router-dom'
import { ZONE, ARRFC_ROLE_LONG, signedInCoordinator } from '@/data/zone6'
import { DISHA_DISTRICTS, GOALS_YEAR } from '@/data/disha'
import { REPORT_CATEGORIES, REPORT_FIELDS, fieldsInCategory, achievedFor } from '@/data/reportFields'
import { targetValue } from '@/data/dishaTargets'
import { dishaNumber } from '@/lib/disha'
import { LevelBanner, Kpi, Card, Bar, DataNote } from '@/components/Bits'
import GoalMatrix from '@/components/GoalMatrix'

const byNumber = (n) => DISHA_DISTRICTS.find((d) => d.number === String(n)) ?? null

const LEAD = {
  membership: 'membersStart', foundation: 'annualFund', publicimage: 'piEvents',
  projects: 'serviceProjects', newgen: 'rotaractClubs',
}
const leadField = (catId) => REPORT_FIELDS.find((f) => f.id === LEAD[catId])

/** Mean attainment over one district's fields, each capped at 100. */
function districtPct(d) {
  const p = []
  for (const f of REPORT_FIELDS) {
    const a = achievedFor(f, d)
    const t = targetValue(d.id, f.id)
    if (a != null && t) p.push(Math.min((a / t) * 100, 100))
  }
  return p.length ? p.reduce((s, v) => s + v, 0) / p.length : null
}

/**
 * The Zone Coordinator role is one ARRFC signed in, so this page is theirs alone — their
 * districts, their figures. The whole team is the RI Director's view, not this one.
 */
export default function ZoneCoordinators() {
  const c = signedInCoordinator()
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
          return (
            <Kpi key={cat.id} label={cat.label} sub={f?.label}
                 value={dishaNumber(sumOver(f), f?.unit) ?? '—'}
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
                <span className="w-40"><Bar value={pct ?? 0} max={100} /></span>
                <span className="w-12 text-right font-data text-[12px] font-semibold text-ink">
                  {pct == null ? '—' : `${pct.toFixed(0)}%`}
                </span>
              </Link>
            )
          })}
        </div>
        {attainment != null && (
          <p className="text-[11px] text-slate-400 mt-3">
            Mean across {scores.length} district{scores.length > 1 ? 's' : ''}:{' '}
            <strong className="text-slate-600">{attainment.toFixed(1)}%</strong>
          </p>
        )}
      </Card>

      <GoalMatrix
        categories={REPORT_CATEGORIES.map((cat) => ({ id: cat.id, label: cat.label }))}
        fields={(catId) => fieldsInCategory(catId).map((f) => ({ ...f }))}
        entities={districts.map((d) => ({ id: d.id, label: d.number, to: `/district/${d.number}/overview` }))}
        achieved={(f, e) => achievedFor(f, DISHA_DISTRICTS.find((d) => d.id === e.id))}
        target={(f, e) => targetValue(e.id, f.id)}
        format={dishaNumber}
        title="My districts"
        sub={`${districts.length} supported · achieved over target`}
      />

      <div className="mt-5">
        <DataNote tone="slate">
          This is {c.name}&apos;s view — the {districts.length} districts they support. The full Zone{' '}
          {ZONE.number} team, and the zone totals, sit with the RI Director.
        </DataNote>
      </div>
    </>
  )
}
