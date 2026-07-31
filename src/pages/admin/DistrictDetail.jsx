import { useParams, Link, Navigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { DISHA_ZONES, DISHA_DISTRICTS, GOALS_YEAR, PREVIOUS_YEAR, districtsIn } from '@/data/disha'
import { REPORT_CATEGORIES, REPORT_FIELDS, fieldsInCategory, achievedFor } from '@/data/reportFields'
import { targetValue } from '@/data/dishaTargets'
import { dishaNumber } from '@/lib/disha'
import { pctTone } from '@/components/GoalMatrix'
import { LevelBanner, Kpi, Card, Bar, DataNote } from '@/components/Bits'

/** One district, everything it reports — the four report sections, achieved against target. */
export default function DistrictDetail() {
  const { districtId } = useParams()
  const d = DISHA_DISTRICTS.find((x) => String(x.id) === String(districtId))
  if (!d) return <Navigate to="/ri/districts" replace />

  const zone = DISHA_ZONES.find((z) => z.id === d.zoneId)
  const peers = districtsIn(d.zoneId)

  const rows = REPORT_FIELDS.map((f) => ({
    f,
    a: achievedFor(f, d),
    t: targetValue(d.id, f.id),
  }))
  const scored = rows.filter((r) => r.a != null && r.t)
  const attainment = scored.length
    ? scored.reduce((s, r) => s + Math.min((r.a / r.t) * 100, 100), 0) / scored.length
    : null

  return (
    <>
      <LevelBanner
        eyebrow={`RI Director Office · ${zone?.name} · ${GOALS_YEAR}`}
        title={`District ${d.number}`}
        sub={`${d.governor ?? 'Governor not assigned'} · ${PREVIOUS_YEAR} figures against ${GOALS_YEAR} targets`}
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
             sub={`${scored.length} goals scored`} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {REPORT_CATEGORIES.map((c) => (
          <Card key={c.id} title={c.label} sub={`Section ${c.pdf} of the monthly report`}>
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
                {fieldsInCategory(c.id).map((f) => {
                  const a = achievedFor(f, d)
                  const t = targetValue(d.id, f.id)
                  const pct = a != null && t ? (a / t) * 100 : null
                  return (
                    <tr key={f.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 text-slate-700">
                        {f.label}
                        {!f.src && <span className="ml-2 text-[10px] text-slate-300">demo</span>}
                      </td>
                      <td className="py-2.5 px-3 text-right font-data font-semibold"
                          style={{ color: a == null ? '#CBD5E1' : pctTone(pct, f.lowerIsBetter) }}>
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
                            <span className="flex-1"><Bar value={Math.min(pct, 100)} max={100}
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
        ))}
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
                <Bar value={mine ?? 0} max={max || 1} height="h-2" />
              </div>
            )
          })}
        </div>
      </Card>

      <div className="mt-5">
        <DataNote>
          Targets are placeholders — the portal holds none until the governor sets them at the
          goal-setting event. Rows marked <strong>demo</strong> carry a stand-in achieved figure too,
          because no dataset covers them yet.
        </DataNote>
      </div>
    </>
  )
}
