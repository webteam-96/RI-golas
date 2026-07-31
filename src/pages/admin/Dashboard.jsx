import { useState, Fragment } from 'react'
import { DISHA_ZONES, DISHA_DISTRICTS, GOALS_YEAR, PREVIOUS_YEAR, districtsIn } from '@/data/disha'
import { REPORT_CATEGORIES, REPORT_FIELDS, fieldsInCategory, achievedFor, SOURCED_FIELDS } from '@/data/reportFields'
import { targetValue } from '@/data/dishaTargets'
import { dishaNumber } from '@/lib/disha'
import { LevelBanner, Kpi, Card, DataNote } from '@/components/Bits'

const OK = '#009739', WARN = '#B85400', BAD = '#C8102E'
const pctTone = (p) => (p == null ? '#94A3B8' : p >= 100 ? OK : p >= 75 ? WARN : BAD)

/**
 * Goal progress from the Zone 6 coordinator report: the form's fields down the left, the
 * districts across the top, and both numbers in every cell — what a district has achieved and
 * what it is aiming at. A figure on its own says nothing about whether it is enough.
 */
export default function AdminDashboard() {
  const [catId, setCatId] = useState('foundation')
  const [zoneId, setZoneId] = useState(null)

  const districts = zoneId ? districtsIn(zoneId) : DISHA_DISTRICTS
  const fields = fieldsInCategory(catId)
  const category = REPORT_CATEGORIES.find((c) => c.id === catId)

  const rowTotals = (f) => {
    let a = null, t = null
    for (const d of districts) {
      const av = achievedFor(f, d)
      const tv = targetValue(d.id, f.id)
      if (av != null) a = (a ?? 0) + av
      if (tv != null) t = (t ?? 0) + tv
    }
    return { a, t, pct: a != null && t ? (a / t) * 100 : null }
  }

  return (
    <>
      <LevelBanner
        eyebrow={`Monthly coordinator report · ${GOALS_YEAR}`}
        title="Goal Progress"
        sub={`${DISHA_ZONES.map((z) => z.name).join(' & ')} · ${DISHA_DISTRICTS.length} districts · achieved against target, field by field`}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Kpi label="Districts" value={DISHA_DISTRICTS.length} tone="royal"
             sub={DISHA_ZONES.map((z) => `${z.name.replace('Zone ', 'Z')} ${districtsIn(z.id).length}`).join(' · ')} />
        <Kpi label="Categories" value={REPORT_CATEGORIES.length} tone="gold"
             sub={REPORT_CATEGORIES.map((c) => c.label).join(' · ')} />
        <Kpi label="Fields on the form" value={REPORT_FIELDS.length} tone="purple"
             sub={`${SOURCED_FIELDS} with data behind them`} />
        <Kpi label="Reporting period" value={PREVIOUS_YEAR} tone="slate" sub={`targets for ${GOALS_YEAR}`} />
      </div>

      {/* Category listing — swaps the rows; the district columns stay put */}
      <div className="flex gap-1.5 flex-wrap mb-4">
        {REPORT_CATEGORIES.map((c) => {
          const on = catId === c.id
          return (
            <button
              key={c.id}
              onClick={() => setCatId(c.id)}
              className={`flex items-baseline gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold border transition-all ${
                on ? 'bg-royal text-white border-royal shadow-sm'
                   : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-ink'
              }`}
            >
              <span className={`font-data text-[10px] ${on ? 'text-blue-200' : 'text-slate-300'}`}>
                {c.pdf}
              </span>
              {c.label}
              <span className={`font-data text-[10px] ${on ? 'text-blue-200' : 'text-slate-400'}`}>
                {fieldsInCategory(c.id).length}
              </span>
            </button>
          )
        })}
      </div>

      <Card
        title={category.label}
        sub={`Section ${category.pdf} of the monthly report · ${districts.length} districts`}
        right={
          <div className="flex gap-0.5 bg-slate-100/80 rounded-xl p-1">
            <Tab on={zoneId === null} go={() => setZoneId(null)}>Both zones</Tab>
            {DISHA_ZONES.map((z) => (
              <Tab key={z.id} on={zoneId === z.id} go={() => setZoneId(z.id)}>{z.name}</Tab>
            ))}
          </div>
        }
      >
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-[13px] border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="eyebrow text-slate-400 text-left py-3 pl-5 pr-4 sticky left-0 z-10 bg-white
                               border-b-2 border-slate-200 min-w-[230px] shadow-[2px_0_4px_-2px_rgba(10,26,51,0.10)]">
                  Field
                </th>
                {districts.map((d) => (
                  <th key={d.id} className="py-3 px-3 min-w-[92px] text-right border-b-2 border-slate-200">
                    <span className="font-data text-[13px] font-semibold text-ink">{d.number}</span>
                  </th>
                ))}
                <th className="eyebrow text-right py-3 px-4 min-w-[104px] border-b-2 border-royal text-royal bg-royal/[0.06]">
                  All
                </th>
              </tr>
            </thead>
            <tbody>
              {fields.map((f, i) => {
                const tot = rowTotals(f)
                const zebra = i % 2 ? 'bg-slate-50/50' : 'bg-white'
                return (
                  <tr key={f.id} className="group">
                    <td className={`py-3 pl-5 pr-4 text-slate-700 sticky left-0 z-10 border-b border-slate-100
                                    ${zebra} group-hover:bg-royal/[0.04]
                                    shadow-[2px_0_4px_-2px_rgba(10,26,51,0.10)]`}>
                      {f.label}
                      {!f.src && <span className="ml-2 text-[10px] text-slate-300">not collected</span>}
                    </td>
                    {districts.map((d) => (
                      <Cell key={d.id} zebra={zebra}
                            achieved={achievedFor(f, d)}
                            target={targetValue(d.id, f.id)}
                            unit={f.unit} />
                    ))}
                    <td className={`py-3 px-4 text-right border-b border-slate-100 bg-royal/[0.06] whitespace-nowrap`}>
                      <span className="font-data text-[13px] font-bold text-royal block leading-tight">
                        {dishaNumber(tot.a, f.unit) ?? <span className="text-slate-300 font-normal">—</span>}
                      </span>
                      {tot.t != null && (
                        <span className="font-data text-[10px] text-slate-400 block leading-tight mt-0.5">
                          of {dishaNumber(tot.t, f.unit)}
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mt-5 space-y-2">
        <DataNote>
          <strong>Targets are placeholders.</strong> The portal holds none — District Governors set them
          live at the goal-setting event. These are derived from each district&apos;s own figure so the
          layout can be read, and are replaced the moment real targets arrive.
        </DataNote>
        <DataNote tone="slate">
          Fields come from the Zone 6 monthly coordinator report. {REPORT_FIELDS.length - SOURCED_FIELDS} of
          the {REPORT_FIELDS.length} are on the form but not collected in any dataset yet — they are marked
          and left blank rather than filled with a zero.
        </DataNote>
      </div>
    </>
  )
}

/** Achieved reads first and is coloured by how it stands against the target beneath it. */
function Cell({ achieved, target, unit, zebra }) {
  const pct = achieved != null && target ? (achieved / target) * 100 : null
  return (
    <td className={`py-3 px-3 text-right border-b border-slate-100 whitespace-nowrap ${zebra} group-hover:bg-royal/[0.04]`}>
      {achieved == null ? (
        <span className="text-slate-300">—</span>
      ) : (
        <>
          <span className="font-data text-[13px] font-semibold block leading-tight"
                style={{ color: pctTone(pct) }}>
            {dishaNumber(achieved, unit)}
          </span>
          {target != null && (
            <span className="font-data text-[10px] text-slate-400 block leading-tight mt-0.5">
              of {dishaNumber(target, unit)}
            </span>
          )}
        </>
      )}
    </td>
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
