import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { AREAS, areaMetricsFor, areaLeadFor, AREA_COLOR, shortLabel } from '@/data/headline'
import { actualFor, percentAchieved, goalStatus, onTrackYN, achievement } from '@/lib/rollup'
import { useGoals } from '@/context/GoalsProvider'
import { fmt, pct } from '@/lib/format'
import { Card, StatusPill, Bar, EmptyState } from './Bits'
import WheelGauge from './WheelGauge'

/**
 * The goal half of every dashboard: achievement summary, then all four areas expanded, then
 * the children ranked and scored. Written once and used by RI, Zone, District and Club so the
 * four areas cannot drift apart between levels. Nothing here is behind a click.
 *
 * `children` is the level below — districts for a zone, clubs for a district, none for a club.
 */
export default function GoalDashboard({ scope, scopeId, childScope, items = [], itemsTitle }) {
  const { read } = useGoals()
  const hasItems = items.length > 0

  const scoreOf = (s, id, metrics) =>
    achievement(metrics.map((m) => ({ ...read(s, id, m.id), higherIsBetter: m.higherIsBetter })))

  const areaBlocks = AREAS.map((a) => {
    const metrics = areaMetricsFor(scope, a.id)
    return { a, metrics, lead: areaLeadFor(scope, a.id), score: scoreOf(scope, scopeId, metrics) }
  })
  const allMetrics = areaBlocks.flatMap((b) => b.metrics)
  const overall = scoreOf(scope, scopeId, allMetrics)

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

      {/* All four areas, expanded */}
      {areaBlocks.map(({ a, metrics, lead, score }) => {
        const ranked = hasItems
          ? items
              .map((it) => ({ ...it, lead: actualFor(lead.id, childScope, it.id).value }))
              .sort((x, y) => (y.lead ?? -1) - (x.lead ?? -1))
          : []
        const max = Math.max(...ranked.map((r) => r.lead ?? 0), 0)

        return (
          <div key={a.id} className="mb-6">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-3 pb-2.5 border-b border-slate-200/70">
              <span className="h-[3px] w-8 rounded-full self-center" style={{ background: AREA_COLOR[a.id] }} />
              <h2 className="font-display text-[1.15rem] font-semibold text-ink">{a.label}</h2>
              <span className="font-data text-[13px] font-semibold" style={{ color: AREA_COLOR[a.id] }}>
                {score.attainment == null ? '—' : `${pct(score.attainment)} achieved`}
              </span>
              <span className="text-[11px] text-slate-400">
                {score.onTrack} of {score.total} goals on track
                {score.achieved > 0 && ` · ${score.achieved} fully achieved`}
              </span>
            </div>

            <div className={`grid grid-cols-1 gap-4 ${hasItems ? 'xl:grid-cols-2' : ''}`}>
              <Card title="Goal Progress" sub="Target against the reported achievement">
                <div className="overflow-x-auto -mx-5 px-5">
                  <table className="w-full text-sm min-w-[520px]">
                    <thead>
                      <tr className="text-[10px] uppercase tracking-widest text-slate-400 border-b border-slate-200">
                        <th className="text-left font-bold pb-2">Goal</th>
                        <th className="text-right font-bold pb-2 px-3">Target</th>
                        <th className="text-right font-bold pb-2 px-3">Achieved</th>
                        <th className="text-right font-bold pb-2 px-3">%</th>
                        <th className="text-left font-bold pb-2 px-3">Status</th>
                        <th className="text-center font-bold pb-2">On&nbsp;Track</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {metrics.map((m) => {
                        const g = read(scope, scopeId, m.id)
                        const p = percentAchieved(g.target, g.actual, m.higherIsBetter !== false)
                        const s = goalStatus(p)
                        return (
                          <tr key={m.id} className="hover:bg-slate-50/70">
                            <td className="py-2.5 text-slate-700 font-medium">{m.label}</td>
                            <td className="py-2.5 px-3 text-right tabular-nums text-slate-500">{fmt(g.target, m.unit)}</td>
                            <td className="py-2.5 px-3 text-right tabular-nums font-semibold text-slate-800">{fmt(g.actual, m.unit)}</td>
                            <td className="py-2.5 px-3 text-right tabular-nums font-semibold">{p == null ? '—' : pct(p)}</td>
                            <td className="py-2.5 px-3"><StatusPill status={s} /></td>
                            <td className={`py-2.5 text-center font-bold text-xs ${p == null ? 'text-slate-300' : onTrackYN(s) === 'Y' ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {p == null ? '—' : onTrackYN(s)}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>

              {hasItems && (
                <Card title={`${shortLabel(lead)} by ${itemsTitle}`} sub="Highest first · click to drill in">
                  <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-1">
                    {ranked.map((it) => (
                      <Link
                        key={it.id}
                        to={it.to}
                        className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors group"
                      >
                        <span className="w-28 text-sm font-semibold text-slate-700 group-hover:text-[#003DA5] truncate"
                              title={it.label}>
                          {it.label}
                          {it.note && (
                            <span className="text-[9px] text-amber-600 font-semibold ml-0.5"
                                  title={`Figures sourced from column ${it.note}`}>ⓘ</span>
                          )}
                        </span>
                        <span className="flex-1"><Bar value={it.lead ?? 0} max={max} color={AREA_COLOR[a.id]} /></span>
                        <span className="w-24 text-right text-sm font-bold tabular-nums text-slate-700">
                          {fmt(it.lead, lead.unit)}
                        </span>
                        <ArrowRight size={13} className="text-slate-300 group-hover:text-[#003DA5]" />
                      </Link>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </div>
        )
      })}

      {/* Children across all four areas, each scored */}
      {hasItems && (
        <Card title={itemsTitle} sub={`All ${items.length} across the four goal areas`}>
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-sm min-w-[720px]">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-slate-400 border-b border-slate-200">
                  <th className="text-left font-bold pb-2">{itemsTitle.replace(/s$/, '')}</th>
                  {AREAS.map((a) => (
                    <th key={a.id} className="text-right font-bold pb-2 px-3">{a.label}</th>
                  ))}
                  <th className="text-left font-bold pb-2 px-3 w-40">Achieved</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((it) => {
                  const score = scoreOf(childScope, it.id, allMetrics)
                  return (
                    <tr key={it.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5">
                        <Link to={it.to} className="font-bold text-slate-800 hover:text-[#003DA5] hover:underline">
                          {it.label}
                        </Link>
                        {it.sub && <p className="text-[11px] text-slate-400">{it.sub}</p>}
                      </td>
                      {AREAS.map((a) => {
                        const m = areaLeadFor(childScope, a.id)
                        return (
                          <td key={a.id} className="py-2.5 px-3 text-right tabular-nums text-slate-700">
                            {fmt(actualFor(m.id, childScope, it.id).value, m.unit)}
                          </td>
                        )
                      })}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className="flex-1 min-w-[70px]">
                            <Bar value={score.attainment ?? 0} max={100} />
                          </span>
                          <span className="w-11 text-right text-xs font-bold tabular-nums text-slate-700">
                            {score.attainment == null ? '—' : pct(score.attainment)}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {score.onTrack} of {score.total} on track
                        </p>
                      </td>
                      <td className="py-2.5 text-right">
                        <Link to={it.to} className="text-slate-300 hover:text-[#003DA5] inline-block">
                          <ArrowRight size={15} />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 font-bold text-slate-800 border-t-2 border-slate-200">
                  <td className="py-3">TOTAL</td>
                  {AREAS.map((a) => {
                    const m = areaLeadFor(scope, a.id)
                    return (
                      <td key={a.id} className="py-3 px-3 text-right tabular-nums">
                        {fmt(actualFor(m.id, scope, scopeId).value, m.unit)}
                      </td>
                    )
                  })}
                  <td className="py-3 px-3 text-right tabular-nums" style={{ color: '#003DA5' }}>
                    {overall.attainment == null ? '—' : pct(overall.attainment)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      )}

      {!hasItems && !allMetrics.length && <EmptyState>No goals defined at this level.</EmptyState>}
    </>
  )
}
