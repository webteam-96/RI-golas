import { useState } from 'react'
import { DISHA_ZONES, DISHA_DISTRICTS, GOALS_YEAR, PREVIOUS_YEAR, districtsIn } from '@/data/disha'
import { REPORT_CATEGORIES, REPORT_FIELDS, fieldsInCategory, achievedFor, SOURCED_FIELDS } from '@/data/reportFields'
import { targetValue } from '@/data/dishaTargets'
import { dishaNumber } from '@/lib/disha'
import { LevelBanner, Kpi, Bar, DataNote } from '@/components/Bits'
import WheelGauge from '@/components/WheelGauge'
import GoalMatrix from '@/components/GoalMatrix'

const AREA_COLOR = { membership: '#003DA5', foundation: '#F7A81B', publicimage: '#9333EA', projects: '#009739' }

/** Mean attainment over a set of fields, each capped at 100 so one overachiever cannot mask
 *  the rest. Returns null when nothing in the set can be scored. */
function attain(fields, districts) {
  const pcts = []
  for (const f of fields)
    for (const d of districts) {
      const a = achievedFor(f, d)
      const t = targetValue(d.id, f.id)
      if (a != null && t) pcts.push(Math.min((a / t) * 100, 100))
    }
  return pcts.length ? { pct: pcts.reduce((s, p) => s + p, 0) / pcts.length, scored: pcts.length } : null
}

export default function AdminDashboard() {
  const [zoneId, setZoneId] = useState(null)
  const districts = zoneId ? districtsIn(zoneId) : DISHA_DISTRICTS

  const overall = attain(REPORT_FIELDS, districts)
  const byArea = REPORT_CATEGORIES.map((c) => ({ c, s: attain(fieldsInCategory(c.id), districts) }))

  return (
    <>
      <LevelBanner
        eyebrow={`RI Director Office · monthly coordinator report · ${GOALS_YEAR}`}
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

      {/* Achievement — the wheel fills as districts close on their targets */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(10,26,51,0.04)] p-5 sm:p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-8">
          <div className="flex items-center gap-5">
            <WheelGauge value={overall?.pct ?? null} />
            <div className="min-w-0">
              <p className="eyebrow text-slate-400">Attainment to date</p>
              <p className="font-display text-2xl font-bold text-ink leading-tight mt-1.5">
                {districts.length} districts reporting
              </p>
              <p className="text-[13px] text-slate-500 mt-1">
                {overall ? `${overall.scored} field-district pairs scored` : 'nothing scored yet'}
              </p>
              <p className="text-[11px] text-slate-400 mt-2.5 max-w-sm leading-relaxed">
                Each pair is capped at 100% before averaging, so one district far past its target
                cannot mask the ones falling short.
              </p>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 lg:border-l lg:border-slate-100 lg:pl-8">
            {byArea.map(({ c, s }) => (
              <div key={c.id}>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="flex items-center gap-2 text-[12px] font-semibold text-slate-600">
                    <span className="h-[3px] w-4 rounded-full" style={{ background: AREA_COLOR[c.id] }} />
                    {c.label}
                  </span>
                  <span className="font-data text-[13px] font-semibold text-ink">
                    {s ? `${s.pct.toFixed(0)}%` : '—'}
                  </span>
                </div>
                <Bar value={s?.pct ?? 0} max={100} color={AREA_COLOR[c.id]} height="h-2" />
                <p className="text-[10px] text-slate-400 mt-1.5">
                  {s ? `${s.scored} scored` : 'not collected yet'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <GoalMatrix
        categories={REPORT_CATEGORIES.map((c) => ({ id: c.id, label: c.label, badge: c.pdf }))}
        fields={(catId) => fieldsInCategory(catId).map((f) => ({ ...f, muted: f.src ? null : 'not collected' }))}
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
