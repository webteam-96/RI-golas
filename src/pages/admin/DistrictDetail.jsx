import { useParams, Link, Navigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { DISHA_ZONES, DISHA_DISTRICTS, GOALS_YEAR, PREVIOUS_YEAR, districtsIn } from '@/data/disha'
import { REPORT_CATEGORIES, REPORT_FIELDS, fieldsInCategory, achievedFor, SOURCED_FIELDS } from '@/data/reportFields'
import { targetValue, useTargetCount } from '@/data/dishaTargets'
import { dishaNumber } from '@/lib/disha'
import { pctTone } from '@/components/GoalMatrix'
import { LevelBanner, Kpi, Card, Bar, DataNote, Coverage } from '@/components/Bits'

/** One district, everything it reports — the report sections, figure by figure. */
export default function DistrictDetail() {
  const { districtId } = useParams()
  useTargetCount() // targets are entered on the district's own goals screen; re-render when they are
  const d = DISHA_DISTRICTS.find((x) => String(x.id) === String(districtId))
  if (!d) return <Navigate to="/ri/districts" replace />

  const zone = DISHA_ZONES.find((z) => z.id === d.zoneId)
  const peers = districtsIn(d.zoneId)

  const rows = REPORT_FIELDS.map((f) => ({
    f,
    a: achievedFor(f, d),
    t: targetValue(d.id, f.id),
  }))
  const withTarget = rows.filter((r) => r.t).length
  const scored = rows.filter((r) => r.a != null && r.t)
  // Floored as well as capped: a figure below zero — net change, say — is 0% attained, not a
  // negative attainment dragging the mean under.
  const attainment = scored.length
    ? scored.reduce((s, r) => s + Math.min(Math.max((r.a / r.t) * 100, 0), 100), 0) / scored.length
    : null

  return (
    <>
      <LevelBanner
        eyebrow={`RI Director Office · ${zone?.name} · ${GOALS_YEAR}`}
        title={`District ${d.number}`}
        sub={`${d.governor ?? 'Governor not assigned'} · achieved ${PREVIOUS_YEAR} · targets for ${GOALS_YEAR}`}
        right={
          <Link to="/ri/districts"
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-white/15 border border-white/30 hover:bg-white/25">
            <ArrowLeft size={13} /> All districts
          </Link>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Kpi label="Zone" value={zone?.name ?? '—'} tone="royal" sub={`${peers.length} districts`} />
        <Kpi label="Governor" value={(d.governor ?? '—').replace(/^Rtn\.?\s*/i, '')} tone="gold" />
        <Kpi label="Fields reported" value={`${rows.filter((r) => r.a != null).length} / ${REPORT_FIELDS.length}`}
             tone="purple" sub="with data on file" />
        <Kpi label="Attainment" value={attainment == null ? '—' : `${attainment.toFixed(0)}%`}
             tone={attainment == null ? 'slate' : attainment >= 90 ? 'green' : attainment >= 70 ? 'gold' : 'rose'}
             sub={attainment != null ? `${scored.length} goal${scored.length === 1 ? '' : 's'} scored`
                  : withTarget ? 'nothing reported against those targets' : 'no targets set yet'} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {REPORT_CATEGORIES.map((c) => {
          const fields = fieldsInCategory(c.id)
          const reported = fields.filter((f) => achievedFor(f, d) != null).length
          return (
            <Card key={c.id} title={c.label} sub={`Section ${c.pdf} of the monthly report`}
                  right={<Coverage reporting={reported} total={fields.length} />}>
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="eyebrow text-slate-400 border-b border-slate-200">
                    <th className="text-left font-medium pb-2">Field</th>
                    <th className="text-right font-medium pb-2 px-3 w-24">Achieved</th>
                    <th className="text-right font-medium pb-2 px-3 w-24">Target</th>
                    <th className="text-left font-medium pb-2 pl-3 w-28">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {fields.map((f) => {
                    const a = achievedFor(f, d)
                    const t = targetValue(d.id, f.id)
                    const pct = a != null && t ? (a / t) * 100 : null
                    return (
                      <tr key={f.id} className="hover:bg-slate-50/70">
                        <td className="py-2.5 text-slate-700">
                          {f.label}
                        </td>
                        {/* Colour here means standing against a target. With none set there is
                            nothing to stand against, so the figure stays plain rather than red. */}
                        <td className={`py-2.5 px-3 text-right font-data font-semibold ${
                              a == null ? 'text-slate-300' : pct == null ? 'text-ink' : ''}`}
                            style={pct == null ? undefined : { color: pctTone(pct, f.lowerIsBetter) }}>
                          {dishaNumber(a, f.unit) ?? '—'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-data text-slate-400">
                          {dishaNumber(t, f.unit) ?? '—'}
                        </td>
                        <td className="py-2.5 pl-3">
                          {pct == null ? (
                            <span className="text-[11px] text-slate-300">—</span>
                          ) : (
                            <div className="flex items-center gap-2">
                              {/* Floored: a negative width is invalid CSS, which leaves the fill
                                  at its natural full width — a shortfall reading as complete. */}
                              <span className="flex-1"><Bar value={Math.max(pct, 0)} max={100}
                                                            color={pctTone(pct, f.lowerIsBetter)} /></span>
                              <span className="w-9 text-right font-data text-[11px] font-semibold text-slate-600">
                                {Math.round(pct)}%
                              </span>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </Card>
          )
        })}
      </div>

      <Card className="mt-4" title={`Against the rest of ${zone?.name}`} sub="Where this district sits on each headline field">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          {['membersStart', 'clubsStart', 'annualFund', 'totalGiving'].map((id) => {
            const f = REPORT_FIELDS.find((x) => x.id === id)
            if (!f) return null
            const mine = achievedFor(f, d)
            const vals = peers.map((p) => achievedFor(f, p)).filter((v) => v != null)
            const max = Math.max(...vals, 0)
            const rank = vals.filter((v) => v > (mine ?? -1)).length + 1
            return (
              <div key={id}>
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className="text-[12px] font-semibold text-slate-600">{f.label}</span>
                  <span className="font-data text-[12px] text-slate-500">
                    {mine == null ? '—' : `${dishaNumber(mine, f.unit)} · rank ${rank} of ${vals.length}`}
                  </span>
                </div>
                <Bar value={mine} max={max} height="h-2" />
              </div>
            )
          })}
        </div>
      </Card>

      <div className="mt-5 space-y-2">
        <DataNote>
          The Achieved column is what this district reported for {PREVIOUS_YEAR}; targets are set by
          District Governors for {GOALS_YEAR} at the goal-setting event.{' '}
          {withTarget
            ? `${withTarget} of the ${REPORT_FIELDS.length} fields ${withTarget === 1 ? 'carries' : 'carry'} one here; the rest leave the target and progress columns empty.`
            : 'None are set for this district yet, so the target and progress columns are empty.'}
        </DataNote>
        <DataNote tone="slate">
          The portal carries {SOURCED_FIELDS} of the {REPORT_FIELDS.length} fields on the monthly
          report. The other {REPORT_FIELDS.length - SOURCED_FIELDS}, Public Image among them, are
          not collected there and show a dash rather than a figure.
        </DataNote>
      </div>
    </>
  )
}
