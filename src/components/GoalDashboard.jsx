import { AREAS, areaMetricsFor, AREA_COLOR } from '@/data/headline'
import { achievement } from '@/lib/rollup'
import { useGoals } from '@/context/GoalsProvider'
import { fmt, pct } from '@/lib/format'
import { Bar } from './Bits'
import WheelGauge from './WheelGauge'
import GoalMatrix from './GoalMatrix'

/**
 * The goal half of every dashboard: how much has been achieved, then the same matrix used
 * everywhere else — the four areas' fields down the left, the level below across the top,
 * achieved over target in each cell.
 *
 * `items` is the level below: districts under RI or a zone, clubs under a district. A club has
 * none, so it measures itself.
 */
export default function GoalDashboard({ scope, scopeId, childScope, items = [], itemsTitle = 'All' }) {
  const { read } = useGoals()
  const hasItems = items.length > 0

  // With no level below, the matrix compares the level against itself — one column, still the
  // same shape, so a club page reads like every other page.
  const columnScope = hasItems ? childScope : scope
  const columns = hasItems ? items : [{ id: scopeId, label: 'This level' }]

  const scoreOf = (metrics) =>
    achievement(metrics.map((m) => ({ ...read(scope, scopeId, m.id), higherIsBetter: m.higherIsBetter })))

  const areaBlocks = AREAS.map((a) => ({ a, score: scoreOf(areaMetricsFor(scope, a.id)) }))
  const overall = scoreOf(AREAS.flatMap((a) => areaMetricsFor(scope, a.id)))

  return (
    <>
      {/* Achievement — the wheel fills as goals are met */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(10,26,51,0.04)] p-5 sm:p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-8">
          <div className="flex items-center gap-5">
            <WheelGauge value={overall.attainment} />
            <div className="min-w-0">
              <p className="eyebrow text-slate-400">Achievement to date</p>
              <p className="font-display text-2xl font-bold text-ink leading-tight mt-1.5">
                {overall.onTrack} of {overall.total} goals on track
              </p>
              <p className="text-[13px] text-slate-500 mt-1">
                <span className="font-semibold text-[#00702A]">{overall.achieved}</span> fully achieved
                {overall.scored < overall.total && (
                  <> · <span className="font-semibold text-slate-600">{overall.total - overall.scored}</span> not scored</>
                )}
              </p>
              <p className="text-[11px] text-slate-400 mt-2.5 max-w-sm leading-relaxed">
                Each goal is capped at 100% before averaging, so one overachieving goal cannot mask the
                ones falling short.
              </p>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 lg:border-l lg:border-slate-100 lg:pl-8">
            {areaBlocks.map(({ a, score }) => (
              <div key={a.id}>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="flex items-center gap-2 text-[12px] font-semibold text-slate-600">
                    <span className="h-[3px] w-4 rounded-full" style={{ background: AREA_COLOR[a.id] }} />
                    {a.label}
                  </span>
                  <span className="font-data text-[13px] font-semibold text-ink">
                    {score.attainment == null ? '—' : pct(score.attainment)}
                  </span>
                </div>
                <Bar value={score.attainment ?? 0} max={100} color={AREA_COLOR[a.id]} height="h-2" />
                <p className="text-[10px] text-slate-400 mt-1.5">
                  {score.onTrack} of {score.total} on track
                  {score.scored < score.total && ` · ${score.total - score.scored} unscored`}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <GoalMatrix
        categories={AREAS.map((a) => ({ id: a.id, label: a.label }))}
        fields={(areaId) => areaMetricsFor(columnScope, areaId).map((m) => ({
          id: m.id, label: m.label, unit: m.unit, lowerIsBetter: m.higherIsBetter === false,
        }))}
        entities={columns}
        achieved={(f, e) => read(columnScope, e.id, f.id).actual}
        target={(f, e) => read(columnScope, e.id, f.id).target}
        format={fmt}
        sub={hasItems ? `${items.length} ${itemsTitle.toLowerCase()} across` : 'This level only'}
        totalLabel={hasItems ? itemsTitle : 'Total'}
      />
    </>
  )
}
