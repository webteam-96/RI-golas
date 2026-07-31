import { useState, Fragment } from 'react'
import {
  DISHA_ZONES, DISHA_DISTRICTS, DISHA_CATEGORIES, GOALS_YEAR, PREVIOUS_YEAR,
  goalValue, prevValue,
} from '@/data/disha'
import { completion, zoneStats, sections, dishaNumber, piPoints, districtGoals, TARGET_FIELDS } from '@/lib/disha'
import { LevelBanner, Kpi, Card, Bar, DataNote } from '@/components/Bits'

/**
 * Consolidated goal view across both zones — fields down, districts across, grouped by the
 * section headings the goal forms use. This is the shape the DISHA portal's admin view has,
 * on the same field catalogue and the same seeded figures.
 */
export default function AdminDashboard() {
  const [categoryId, setCategoryId] = useState(1)
  const [showPrev, setShowPrev] = useState(false)

  const stats = DISHA_DISTRICTS.map((d) => ({ d, c: completion(d.id) }))
  const completed = stats.filter((x) => x.c.complete).length
  const inProgress = stats.filter((x) => x.c.started && !x.c.complete).length
  const notStarted = stats.filter((x) => !x.c.started).length

  const isPI = categoryId === 3
  const groups = sections(categoryId)

  return (
    <>
      <LevelBanner
        eyebrow={`Goal setting ${GOALS_YEAR}`}
        title="Consolidated Goals"
        sub={`${DISHA_ZONES.map((z) => z.name).join(' & ')} · ${DISHA_DISTRICTS.length} districts · ${DISHA_CATEGORIES.length} categories`}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Kpi label="Districts" value={DISHA_DISTRICTS.length} tone="royal" />
        <Kpi label="Complete" value={completed} tone="green" sub={`all ${TARGET_FIELDS.length} targets set`} />
        <Kpi label="In progress" value={inProgress} tone="gold" sub="some targets set" />
        <Kpi label="Not started" value={notStarted} tone="slate" />
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        {DISHA_ZONES.map((z) => {
          const s = zoneStats(z.id)
          return (
            <Card key={z.id} title={z.name} sub={`${s.districts} districts`}>
              <div className="space-y-1.5 text-[13px] mb-4">
                <Row label="Complete" value={s.completed} tone="text-[#00702A]" />
                <Row label="In progress" value={s.started - s.completed} tone="text-[#B85400]" />
                <Row label="Not started" value={s.districts - s.started} tone="text-slate-500" />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1.5">
                <span>Targets set</span>
                <span className="font-data font-semibold text-slate-600">{s.pct.toFixed(0)}%</span>
              </div>
              <Bar value={s.pct} max={100} height="h-2" />
            </Card>
          )
        })}
      </div>

      <Card
        title="Consolidated view"
        sub={`${GOALS_YEAR} targets · ${DISHA_DISTRICTS.length} districts across`}
        right={
          <div className="flex items-center gap-3">
            {!isPI && (
              <label className="flex items-center gap-1.5 text-[11px] text-slate-500 cursor-pointer">
                <input type="checkbox" checked={showPrev} onChange={(e) => setShowPrev(e.target.checked)}
                       className="accent-royal" />
                Show {PREVIOUS_YEAR}
              </label>
            )}
            <div className="flex gap-1 bg-slate-100/80 rounded-xl p-1">
              {DISHA_CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategoryId(c.id)}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
                    categoryId === c.id ? 'bg-royal text-white shadow-sm' : 'text-slate-500 hover:text-ink hover:bg-white'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        }
      >
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b-2 border-slate-200 bg-slate-50">
                <th className="eyebrow text-slate-400 text-left py-3 pl-5 pr-3 sticky left-0 bg-slate-50 min-w-[260px]">
                  Field
                </th>
                {DISHA_DISTRICTS.map((d) => (
                  <th key={d.id} className="font-data text-[12px] font-semibold text-slate-600 text-right py-3 px-2.5 min-w-[84px]">
                    {d.number}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {groups.map((section) => (
                <Fragment key={section.name}>
                  <tr>
                    <td colSpan={DISHA_DISTRICTS.length + 1}
                        className="eyebrow text-royal bg-royal/[0.05] py-2 pl-5 sticky left-0">
                      {section.name}
                    </td>
                  </tr>
                  {section.fields.filter((f) => f.dataType !== 'text').map((f) => (
                    <tr key={f.id} className="border-b border-slate-100 hover:bg-slate-50/70">
                      <td className="py-2.5 pl-5 pr-3 text-slate-700 sticky left-0 bg-white">
                        {f.label}
                        {f.readonly && <span className="ml-1.5 text-[10px] text-slate-300">computed</span>}
                      </td>
                      {DISHA_DISTRICTS.map((d) => {
                        const target = goalValue(d.id, f.id)
                        const prev = prevValue(d.id, f.id)
                        const shown = showPrev && !isPI ? prev : target
                        const text = dishaNumber(shown, f.unit)
                        return (
                          <td key={d.id} className="py-2.5 px-2.5 text-right tabular-nums text-slate-800">
                            {text ?? <span className="text-slate-300">—</span>}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </Fragment>
              ))}

              {isPI && (
                <tr className="border-t-2 border-slate-200 bg-gold/[0.06] font-semibold">
                  <td className="py-3 pl-5 pr-3 text-ink sticky left-0 bg-[#FEF9EF]">
                    Total Public Image Points
                  </td>
                  {DISHA_DISTRICTS.map((d) => {
                    const pts = piPoints(districtGoals(d.id))
                    return (
                      <td key={d.id} className="py-3 px-2.5 text-right tabular-nums text-ink">
                        {pts ? dishaNumber(pts) : <span className="text-slate-300 font-normal">—</span>}
                      </td>
                    )
                  })}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mt-5 space-y-2">
        {isPI && (
          <DataNote>
            Public Image has no pre-loaded figures — districts enter these live, and the points total
            is computed from the entries. Every column reads as a dash until then.
          </DataNote>
        )}
        <DataNote tone="slate">
          A dash means the cell was blank in the source, not zero. {PREVIOUS_YEAR} reference figures are
          the five-year averages carried in the goal workbooks and exist for Membership and TRF only.
        </DataNote>
      </div>
    </>
  )
}

function Row({ label, value, tone }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">{label}</span>
      <span className={`font-semibold font-data ${tone}`}>{value}</span>
    </div>
  )
}
