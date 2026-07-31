import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { DISTRICTS, RY, DATA_AS_OF } from '@/data/zone6'
import { DISTRICT_DATA_SUBSTITUTIONS } from '@/data/foundationGoals'
import { AREAS, areaMetrics, areaLead, AREA_COLOR, shortLabel } from '@/data/headline'
import { actualFor, percentAchieved, goalStatus, onTrackYN, clubsIn, achievement } from '@/lib/rollup'
import { useGoals } from '@/context/GoalsProvider'
import { fmt, num, pct } from '@/lib/format'
import { LevelBanner, Kpi, Card, StatusPill, Bar, DataNote } from '@/components/Bits'

/**
 * RI Director view. No zone layer — the Director looks straight at the four goal areas and
 * then straight at the districts. All four areas render expanded; nothing is behind a click.
 */
export default function RiOverview() {
  const { read } = useGoals()
  const totalClubs = DISTRICTS.reduce((s, d) => s + clubsIn(d.id).length, 0)

  // "How much have we achieved" — per area and overall.
  const scoreFor = (metrics) =>
    achievement(metrics.map((m) => ({ ...read('ri', 'ri', m.id), higherIsBetter: m.higherIsBetter })))

  const areaScores = AREAS.map((a) => ({ a, metrics: areaMetrics(a.id), score: scoreFor(areaMetrics(a.id)) }))
  const overall = scoreFor(AREAS.flatMap((a) => areaMetrics(a.id)))

  return (
    <>
      <LevelBanner
        eyebrow="RI Director Office"
        title="Global Overview"
        sub={`${DISTRICTS.length} districts · RY ${RY}, data as of ${DATA_AS_OF}`}
      />

      {/* Counts */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-4">
        <Kpi label="Districts" value={DISTRICTS.length} tone="slate" />
        <Kpi label="Clubs" value={totalClubs} tone="slate" sub="rosters loaded" />
        {AREAS.map((a) => {
          const m = areaLead(a.id)
          return (
            <Kpi
              key={a.id}
              label={a.label}
              value={fmt(actualFor(m.id, 'ri', 'ri').value, m.unit)}
              sub={shortLabel(m)}
              tone={a.id === 'foundation' ? 'gold' : a.id === 'membership' ? 'blue' : a.id === 'publicimage' ? 'purple' : 'green'}
            />
          )
        })}
      </div>

      {/* How much has been achieved */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 mb-6">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Achievement to date</p>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-4xl font-extrabold tabular-nums" style={{ color: '#003DA5' }}>
                {overall.attainment == null ? '—' : pct(overall.attainment)}
              </span>
              <span className="text-sm text-slate-500">
                <strong className="text-slate-800">{overall.onTrack}</strong> of{' '}
                <strong className="text-slate-800">{overall.total}</strong> goals on track ·{' '}
                <strong className="text-emerald-600">{overall.achieved}</strong> fully achieved
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 max-w-xs leading-relaxed">
            Average attainment across all goals, each capped at 100% so one overachieving goal cannot
            mask the ones falling short.
            {overall.scored < overall.total && (
              <> {overall.total - overall.scored} goal{overall.total - overall.scored === 1 ? '' : 's'} not
              scored — no target set or nothing reported.</>
            )}
          </p>
        </div>

        <Bar value={overall.attainment ?? 0} max={100} color="#003DA5" height="h-3" />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          {areaScores.map(({ a, score }) => (
            <div key={a.id}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                  <span className="h-1 w-4 rounded-full" style={{ background: AREA_COLOR[a.id] }} />
                  {a.label}
                </span>
                <span className="text-sm font-extrabold tabular-nums text-slate-800">
                  {score.attainment == null ? '—' : pct(score.attainment)}
                </span>
              </div>
              <Bar value={score.attainment ?? 0} max={100} color={AREA_COLOR[a.id]} />
              <p className="text-[10px] text-slate-400 mt-1">
                {score.onTrack} of {score.total} on track
                {score.scored < score.total && ` · ${score.total - score.scored} unscored`}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* All four goal areas, expanded */}
      {areaScores.map(({ a, metrics, score }) => {
        const lead = areaLead(a.id)
        const rows = DISTRICTS
          .map((d) => ({ ...d, lead: actualFor(lead.id, 'district', d.id).value }))
          .sort((x, y) => (y.lead ?? -1) - (x.lead ?? -1))
        const max = Math.max(...rows.map((r) => r.lead ?? 0), 0)

        return (
          <div key={a.id} className="mb-6">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="h-1 w-8 rounded-full" style={{ background: AREA_COLOR[a.id] }} />
              <h2 className="text-lg font-extrabold text-slate-800">{a.label}</h2>
              <span className="text-sm font-extrabold tabular-nums" style={{ color: AREA_COLOR[a.id] }}>
                {score.attainment == null ? '—' : `${pct(score.attainment)} achieved`}
              </span>
              <span className="text-xs text-slate-400">
                {score.onTrack} of {score.total} goals on track
                {score.achieved > 0 && ` · ${score.achieved} fully achieved`}
              </span>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <Card title="Goal Progress" sub="RI target against the reported actual">
                <div className="overflow-x-auto -mx-5 px-5">
                  <table className="w-full text-sm min-w-[520px]">
                    <thead>
                      <tr className="text-[10px] uppercase tracking-widest text-slate-400 border-b border-slate-200">
                        <th className="text-left font-bold pb-2">Goal</th>
                        <th className="text-right font-bold pb-2 px-3">Target</th>
                        <th className="text-right font-bold pb-2 px-3">Actual</th>
                        <th className="text-right font-bold pb-2 px-3">%</th>
                        <th className="text-left font-bold pb-2 px-3">Status</th>
                        <th className="text-center font-bold pb-2">On&nbsp;Track</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {metrics.map((m) => {
                        const g = read('ri', 'ri', m.id)
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

              <Card title={`${shortLabel(lead)} by District`} sub="Highest first · click a district to drill in">
                <div className="space-y-1.5">
                  {rows.map((d) => (
                    <Link
                      key={d.id}
                      to={`/district/${d.id}/overview`}
                      className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors group"
                    >
                      <span className="w-14 text-sm font-semibold text-slate-700 group-hover:text-[#003DA5]">
                        {d.id}
                        {DISTRICT_DATA_SUBSTITUTIONS[d.id] && (
                          <span className="text-[9px] text-amber-600 font-semibold ml-0.5"
                                title={`Figures sourced from column ${DISTRICT_DATA_SUBSTITUTIONS[d.id]}`}>ⓘ</span>
                        )}
                      </span>
                      <span className="flex-1"><Bar value={d.lead ?? 0} max={max} color={AREA_COLOR[a.id]} /></span>
                      <span className="w-24 text-right text-sm font-bold tabular-nums text-slate-700">
                        {fmt(d.lead, lead.unit)}
                      </span>
                      <ArrowRight size={13} className="text-slate-300 group-hover:text-[#003DA5]" />
                    </Link>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )
      })}

      {/* All districts, every area side by side */}
      <Card title="Districts" sub={`All ${DISTRICTS.length} districts across the four goal areas`}>
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-sm min-w-[680px]">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-slate-400 border-b border-slate-200">
                <th className="text-left font-bold pb-2">District</th>
                {AREAS.map((a) => (
                  <th key={a.id} className="text-right font-bold pb-2 px-3">{a.label}</th>
                ))}
                <th className="text-right font-bold pb-2 px-3">Clubs</th>
                <th className="text-left font-bold pb-2 px-3 w-40">Achieved</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {DISTRICTS.map((d) => {
                const score = achievement(
                  AREAS.flatMap((a) => areaMetrics(a.id)).map((m) => ({
                    ...read('district', d.id, m.id),
                    higherIsBetter: m.higherIsBetter,
                  })),
                )
                return (
                  <tr key={d.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5">
                      <Link to={`/district/${d.id}/overview`} className="font-bold text-slate-800 hover:text-[#003DA5] hover:underline">
                        {d.id}
                      </Link>
                      <p className="text-[11px] text-slate-400">{d.region}</p>
                    </td>
                    {AREAS.map((a) => {
                      const m = areaLead(a.id)
                      return (
                        <td key={a.id} className="py-2.5 px-3 text-right tabular-nums text-slate-700">
                          {fmt(actualFor(m.id, 'district', d.id).value, m.unit)}
                        </td>
                      )
                    })}
                    <td className="py-2.5 px-3 text-right tabular-nums text-slate-400">{clubsIn(d.id).length || '—'}</td>
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
                      <Link to={`/district/${d.id}/overview`} className="text-slate-300 hover:text-[#003DA5] inline-block">
                        <ArrowRight size={15} />
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 font-bold text-slate-800 border-t-2 border-slate-200">
                <td className="py-3">ALL DISTRICTS</td>
                {AREAS.map((a) => {
                  const m = areaLead(a.id)
                  return (
                    <td key={a.id} className="py-3 px-3 text-right tabular-nums">
                      {fmt(actualFor(m.id, 'ri', 'ri').value, m.unit)}
                    </td>
                  )
                })}
                <td className="py-3 px-3 text-right tabular-nums">{num(totalClubs)}</td>
                <td className="py-3 px-3 text-right tabular-nums" style={{ color: '#003DA5' }}>
                  {overall.attainment == null ? '—' : pct(overall.attainment)}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      <div className="mt-5 space-y-2">
        <DataNote>
          <strong>D3292</strong> has no column in the Foundation workbook. Its figures are sourced from
          column <strong>3291</strong> and are flagged wherever they appear.
        </DataNote>
        <DataNote tone="slate">
          Foundation figures are reported for all nine districts. Membership, Public Image and Projects
          roll up from club reports, so they show a dash where no roster is loaded rather than a zero.
        </DataNote>
      </div>
    </>
  )
}
