import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import { DISHA_ZONES, DISHA_DISTRICTS, GOALS_YEAR, PREVIOUS_YEAR, districtsIn } from '@/data/disha'
import { ZONE, ARRFC_ROLE_LONG } from '@/data/zone6'
import {
  REPORT_CATEGORIES, REPORT_FIELDS, fieldsInCategory, achievedFor,
  SOURCED_FIELDS, UNSOURCED_FIELDS,
} from '@/data/reportFields'
import { targetValue, useTargetCount } from '@/data/dishaTargets'
import { dishaNumber } from '@/lib/disha'
import { LevelBanner, Kpi, Card, Bar, DataNote } from '@/components/Bits'
import WheelGauge from '@/components/WheelGauge'
import GoalMatrix from '@/components/GoalMatrix'

const AREA_COLOR = {
  membership: '#003DA5', foundation: '#F7A81B', publicimage: '#9333EA',
  projects: '#009739', newgen: '#0891B2',
}

// The four figures the Director sees first. All four are reported for every district, so the
// page still says something before a single goal exists.
const HEADLINE = [
  { id: 'membersStart', tone: 'royal' },
  { id: 'clubsStart',   tone: 'royal' },
  { id: 'totalGiving',  tone: 'gold' },
  { id: 'rotaractors',  tone: 'green' },
]

// What each area leads with while there is nothing to attain against. Public Image and Projects
// are absent because the portal carries no column for either — there is nothing to put there.
const AREA_LEAD = { membership: 'membersStart', foundation: 'totalGiving', newgen: 'rotaractors' }

/** A reported figure summed across districts. Blanks are skipped rather than read as zero, so a
 *  set with nothing on file sums to null. */
function liveTotal(fieldId, districts) {
  const f = REPORT_FIELDS.find((x) => x.id === fieldId)
  const vals = districts.map((d) => achievedFor(f, d)).filter((v) => v != null)
  return {
    label: f.label, unit: f.unit, reporting: vals.length,
    sum: vals.length ? vals.reduce((s, v) => s + v, 0) : null,
  }
}

const liveText = (t) => dishaNumber(t.sum, t.unit) ?? '—'

/** Mean attainment over a set of fields, each held between 0 and 100 — the cap so one
 *  overachiever cannot mask the rest, the floor so a field that fell backwards reads as nothing
 *  attained rather than a negative percentage. Null when nothing in the set can be scored. */
function attain(fields, districts) {
  const pcts = []
  for (const f of fields)
    for (const d of districts) {
      const a = achievedFor(f, d)
      const t = targetValue(d.id, f.id)
      if (a != null && t) pcts.push(Math.min(Math.max((a / t) * 100, 0), 100))
    }
  return pcts.length ? { pct: pcts.reduce((s, p) => s + p, 0) / pcts.length, scored: pcts.length } : null
}

const byNumber = (n) => DISHA_DISTRICTS.find((d) => d.number === String(n)) ?? null
const ZONE6 = districtsIn(2)

/** What a coordinator's districts add up to. Each district counts once towards attainment,
 *  whatever it contributes; members come along so the column has something to carry before
 *  any goal is set. */
function coordinatorTotals(numbers) {
  const ds = numbers.map(byNumber).filter(Boolean)
  const each = ds.map((d) => attain(REPORT_FIELDS, [d])?.pct).filter((v) => v != null)
  return {
    score: each.length ? each.reduce((s, v) => s + v, 0) / each.length : null,
    members: liveTotal('membersStart', ds).sum,
  }
}

export default function AdminDashboard() {
  const [zoneId, setZoneId] = useState(null)
  // Targets are entered live during the event, so the page follows the store rather than a load.
  // The count itself is never shown: it spans every scope, including clubs and zone metrics that
  // nothing on this page scores. What the page says, it says from `overall` below.
  useTargetCount()
  const districts = zoneId ? districtsIn(zoneId) : DISHA_DISTRICTS

  const overall = attain(REPORT_FIELDS, districts)
  const byArea = REPORT_CATEGORIES.map((c) => {
    const s = attain(fieldsInCategory(c.id), districts)
    return { c, s, lead: !s && AREA_LEAD[c.id] ? liveTotal(AREA_LEAD[c.id], districts) : null }
  })

  const coordinators = [
    { ...ZONE.rrfc, lead: true, supports: ZONE6.map((d) => d.number) },
    ...ZONE.coordinators,
  ].map((c) => ({ ...c, ...coordinatorTotals(c.supports) }))

  return (
    <>
      <LevelBanner
        eyebrow={`RI Director Office · monthly coordinator report · ${GOALS_YEAR}`}
        title="Goal Progress"
        sub={`${DISHA_ZONES.map((z) => z.name).join(' & ')} · ${DISHA_DISTRICTS.length} districts · what they achieved in ${PREVIOUS_YEAR}, against the targets governors set for ${GOALS_YEAR}`}
      />

      {/* Reported figures lead: they are on file whether or not a goal has been set against them */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {HEADLINE.map(({ id, tone }) => {
          const t = liveTotal(id, districts)
          return (
            <Kpi key={id} label={t.label} value={liveText(t)} tone={tone}
                 sub={`${t.reporting} of ${districts.length} districts · ${PREVIOUS_YEAR}`} />
          )
        })}
      </div>

      {/* Achievement — the wheel fills as districts close on their targets */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(10,26,51,0.04)] p-5 sm:p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-8">
          {overall ? (
            <div className="flex items-center gap-5">
              <WheelGauge value={overall.pct} />
              <div className="min-w-0">
                {/* Not "to date": these are last year's figures set against this year's targets,
                    not progress made inside the target year. */}
                <p className="eyebrow text-slate-400">Attainment against target</p>
                <p className="font-display text-2xl font-bold text-ink leading-tight mt-1.5">
                  {districts.length} districts reporting
                </p>
                <p className="text-[13px] text-slate-500 mt-1">
                  {overall.scored} field-district pair{overall.scored === 1 ? '' : 's'} scored
                </p>
                <p className="text-[11px] text-slate-400 mt-2.5 max-w-sm leading-relaxed">
                  Each pair is capped at 100% before averaging, so one district far past its target
                  cannot mask the ones falling short.
                </p>
              </div>
            </div>
          ) : (
            // A wheel at zero would read as every district having achieved nothing. Nothing has
            // been aimed at yet, which is a different thing and worth saying in words.
            <div className="max-w-sm">
              <p className="eyebrow text-slate-400">Goal setting</p>
              <p className="font-display text-2xl font-bold text-ink leading-tight mt-1.5">
                No goals set yet
              </p>
              <p className="text-[13px] text-slate-500 mt-1">
                {districts.length} districts reporting their figures
              </p>
              <p className="text-[11px] text-slate-400 mt-2.5 leading-relaxed">
                District Governors set their targets at the goal-setting event. The wheel and the
                attainment figures fill in as those targets are entered.
              </p>
            </div>
          )}

          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 lg:border-l lg:border-slate-100 lg:pl-8">
            {byArea.map(({ c, s, lead }) => (
              <div key={c.id}>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="flex items-center gap-2 text-[12px] font-semibold text-slate-600">
                    <span className="h-[3px] w-4 rounded-full" style={{ background: AREA_COLOR[c.id] }} />
                    {c.label}
                  </span>
                  <span className="font-data text-[13px] font-semibold text-ink">
                    {s ? `${s.pct.toFixed(0)}%` : lead ? liveText(lead) : <span className="text-slate-300">—</span>}
                  </span>
                </div>
                {s && <Bar value={s.pct} max={100} color={AREA_COLOR[c.id]} height="h-2" />}
                <p className="text-[10px] text-slate-400 mt-1.5">
                  {s ? `${s.scored} scored`
                     : lead ? `${lead.label} · ${PREVIOUS_YEAR}`
                     : 'not collected in the portal'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <GoalMatrix
        categories={REPORT_CATEGORIES.map((c) => ({ id: c.id, label: c.label }))}
        fields={(catId) => fieldsInCategory(catId).map((f) => ({ ...f }))}
        entities={districts.map((d) => ({ id: d.id, label: d.number, to: `/ri/districts/${d.id}` }))}
        achieved={(f, e) => achievedFor(f, DISHA_DISTRICTS.find((d) => d.id === e.id))}
        target={(f, e) => targetValue(e.id, f.id)}
        format={dishaNumber}
        sub={`${districts.length} districts across`}
        right={
          <div className="flex gap-0.5 bg-slate-100/80 rounded-xl p-1">
            <Tab on={zoneId === null} go={() => setZoneId(null)}>Both zones</Tab>
            {DISHA_ZONES.map((z) => (
              <Tab key={z.id} on={zoneId === z.id} go={() => setZoneId(z.id)}>{z.name}</Tab>
            ))}
          </div>
        }
      />

      {/* Who is accountable — read after the districts they answer for */}
      <CoordinatorsCard coordinators={coordinators} scored={coordinators.some((c) => c.score != null)} />

      <div className="mt-5 space-y-2">
        <DataNote>
          {/* Keyed on `overall`, the same figure the wheel above is keyed on, so the two cannot
              contradict each other on screen. */}
          {!overall ? (
            <><strong>Nothing is scored against a {GOALS_YEAR} target yet</strong> — District
            Governors set the targets at the goal-setting event. Attainment, progress bars and
            rankings appear as those targets are entered against the {PREVIOUS_YEAR} figures
            above.</>
          ) : (
            <>Attainment sets the {PREVIOUS_YEAR} figures against the {overall.scored}{' '}
            field-district pair{overall.scored === 1 ? '' : 's'} that carry a {GOALS_YEAR} target.
            A field with no target is left out of the averages rather than counted as missed.</>
          )}
        </DataNote>
        <DataNote tone="slate">
          Fields come from the Zone 6 monthly coordinator report. The Zone 5 &amp; 6 portal carries
          reported figures for {SOURCED_FIELDS} of the {REPORT_FIELDS.length}; the
          other {UNSOURCED_FIELDS.length}, including all four Public Image fields, are not
          collected in the portal and show as a dash.
        </DataNote>
      </div>
    </>
  )
}

/** The Zone 6 Foundation team. Names link through to that coordinator's own view. */
function CoordinatorsCard({ coordinators, scored }) {
  return (
    <Card
      className="mt-6"
      title="Foundation Coordinators"
      sub={`${ZONE.name} · 1 RRFC and ${ZONE.coordinators.length} ARRFCs · ${ARRFC_ROLE_LONG}`}
      right={
        <Link to="/ri/coordinators"
              className="text-[12px] font-semibold text-royal hover:underline whitespace-nowrap">
          Full view →
        </Link>
      }
    >
      <div className="overflow-x-auto -mx-5">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="eyebrow text-slate-400 border-b border-slate-200">
              <th className="text-left font-medium pb-2.5 pl-5">Coordinator</th>
              <th className="text-left font-medium pb-2.5 px-3">Role</th>
              <th className="text-left font-medium pb-2.5 px-3">Districts supported</th>
              {/* Attainment needs goals. Until they exist the column carries a figure that is real. */}
              <th className="text-left font-medium pb-2.5 px-3 w-44">{scored ? 'Attainment' : 'Members'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {coordinators.map((c) => (
              <tr key={c.id} className={`hover:bg-slate-50/70 ${c.lead ? 'bg-gold/[0.05]' : ''}`}>
                <td className="py-3 pl-5">
                  <span className="flex items-center gap-2">
                    {c.lead && <Star size={13} className="text-gold flex-shrink-0" fill="#F7A81B" />}
                    <Link to={`/ri/coordinators/${c.id}`} className="font-semibold text-royal hover:underline">
                      {c.name}
                    </Link>
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">Home D{c.homeDistrict}</p>
                </td>
                <td className="py-3 px-3">
                  <span className={`eyebrow px-2 py-0.5 rounded ${
                    c.lead ? 'bg-royal text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {c.role}
                  </span>
                </td>
                <td className="py-3 px-3 font-data text-[12px] text-slate-600">
                  {c.lead ? `all ${ZONE6.length}` : c.supports.join(' · ')}
                </td>
                <td className="py-3 px-3">
                  {scored ? <Attainment score={c.score} /> : (
                    <span className="font-data text-[12px] font-semibold text-ink">
                      {dishaNumber(c.members, 'nos') ?? <span className="text-slate-300 font-normal">—</span>}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
        {scored
          ? 'Attainment is the mean of the districts a coordinator supports, each counted once — goals are set per district and a coordinator answers for each equally.'
          : `Attainment appears here once goals are set; the column meanwhile carries the members those districts reported for ${PREVIOUS_YEAR}.`}
        {' '}D{ZONE.rrfc.homeDistrict} sits under both the RRFC and ARRFC Jhunjhunuwala; zone
        totals elsewhere still count it once.
      </p>
    </Card>
  )
}

function Attainment({ score }) {
  if (score == null) return <span className="font-data text-[12px] text-slate-300">—</span>
  return (
    <div className="flex items-center gap-2">
      <span className="flex-1 min-w-[70px]"><Bar value={score} max={100} /></span>
      <span className="w-11 text-right font-data text-[12px] font-semibold text-ink">
        {score.toFixed(0)}%
      </span>
    </div>
  )
}

function Tab({ on, go, children }) {
  return (
    <button onClick={go}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all whitespace-nowrap ${
              on ? 'bg-royal text-white shadow-sm' : 'text-slate-500 hover:text-ink hover:bg-white'
            }`}>
      {children}
    </button>
  )
}
