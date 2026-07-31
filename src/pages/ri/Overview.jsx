import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import { ZONE, DISTRICTS, ARRFC_ROLE_LONG, RY, DATA_AS_OF } from '@/data/zone6'
import { DISTRICT_DATA_SUBSTITUTIONS } from '@/data/foundationGoals'
import { AREAS, areaLead, areaMetricsFor, shortLabel } from '@/data/headline'
import { actualFor, clubsIn, achievement } from '@/lib/rollup'
import { useGoals } from '@/context/GoalsProvider'
import { fmt, pct } from '@/lib/format'
import { LevelBanner, Kpi, Card, Bar, DataNote } from '@/components/Bits'
import GoalDashboard from '@/components/GoalDashboard'

/** RI Director view. No zone layer — straight from the four goal areas to the districts. */
export default function RiOverview() {
  const { read } = useGoals()
  const totalClubs = DISTRICTS.reduce((s, d) => s + clubsIn(d.id).length, 0)
  const allMetrics = AREAS.flatMap((a) => areaMetricsFor('district', a.id))

  /**
   * A coordinator's score is the mean of their districts' attainment, not a re-summed total.
   * Goals are set per district, and the coordinator is accountable for each district equally,
   * so averaging the district scores is the honest reading — and it avoids summing rates,
   * which would be meaningless.
   */
  const scoreDistricts = (ids) => {
    const scores = ids
      .map((d) => achievement(allMetrics.map((m) => ({ ...read('district', d, m.id), higherIsBetter: m.higherIsBetter }))))
      .map((s) => s.attainment)
      .filter((v) => v != null)
    if (!scores.length) return null
    return scores.reduce((a, b) => a + b, 0) / scores.length
  }

  const coordinators = [
    { ...ZONE.rrfc, lead: true },
    ...ZONE.coordinators,
  ].map((c) => ({ ...c, score: scoreDistricts(c.supports) }))

  const items = DISTRICTS.map((d) => ({
    id: d.id,
    label: `District ${d.id}`,
    sub: d.region,
    to: `/district/${d.id}/overview`,
    note: DISTRICT_DATA_SUBSTITUTIONS[d.id],
  }))

  return (
    <>
      <LevelBanner
        eyebrow="RI Director Office"
        title="Global Overview"
        sub={`${DISTRICTS.length} districts · RY ${RY}, data as of ${DATA_AS_OF}`}
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-4">
        <Kpi label="Districts" value={DISTRICTS.length} tone="slate" />
        <Kpi label="Clubs" value={totalClubs} tone="slate" sub="rosters loaded" />
        {AREAS.map((a) => {
          const m = areaLead(a.id)
          return (
            <Kpi key={a.id} label={a.label} sub={shortLabel(m)}
                 value={fmt(actualFor(m.id, 'ri', 'ri').value, m.unit)}
                 tone={a.id === 'foundation' ? 'gold' : a.id === 'membership' ? 'blue' : a.id === 'publicimage' ? 'purple' : 'green'} />
          )
        })}
      </div>

      <GoalDashboard scope="ri" scopeId="ri" childScope="district" items={items} itemsTitle="Districts" />

      {/* Who is accountable for what */}
      <Card
        className="mt-6"
        title="Foundation Coordinators"
        sub={`1 RRFC and ${ZONE.coordinators.length} ARRFCs across ${DISTRICTS.length} districts`}
        right={
          <Link to="/zone/coordinators"
                className="text-[12px] font-semibold text-royal hover:underline whitespace-nowrap">
            Full view →
          </Link>
        }
      >
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="eyebrow text-slate-400 border-b border-slate-200">
                <th className="text-left font-medium pb-2.5">Coordinator</th>
                <th className="text-left font-medium pb-2.5 px-3">Role</th>
                <th className="text-left font-medium pb-2.5 px-3">Districts supported</th>
                <th className="text-right font-medium pb-2.5 px-3">Annual Fund</th>
                <th className="text-right font-medium pb-2.5 px-3">PHF</th>
                <th className="text-left font-medium pb-2.5 px-3 w-40">Achieved</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {coordinators.map((c) => (
                <tr key={c.id} className={`hover:bg-slate-50/70 ${c.lead ? 'bg-gold/[0.04]' : ''}`}>
                  <td className="py-3">
                    <span className="flex items-center gap-2">
                      {c.lead && <Star size={13} className="text-gold flex-shrink-0" fill="#F7A81B" />}
                      <span className="font-semibold text-ink">{c.name}</span>
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Home D{c.homeDistrict}
                    </p>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`eyebrow px-2 py-0.5 rounded ${
                      c.lead ? 'bg-royal text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {c.role}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-data text-[12px] text-slate-600">
                    {c.lead ? `all ${DISTRICTS.length}` : c.supports.join(' · ')}
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums text-slate-700">
                    {fmt(c.supports.reduce((s, d) => s + (actualFor('annualFund', 'district', d).value ?? 0), 0), 'USD')}
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums text-slate-700">
                    {fmt(c.supports.reduce((s, d) => s + (actualFor('phf', 'district', d).value ?? 0), 0), 'count')}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span className="flex-1 min-w-[70px]"><Bar value={c.score ?? 0} max={100} /></span>
                      <span className="w-11 text-right font-data text-[12px] font-semibold text-ink">
                        {c.score == null ? '—' : pct(c.score)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
          {ARRFC_ROLE_LONG}. Achieved is the mean attainment of the districts a coordinator supports —
          goals are set per district, so the districts are averaged rather than re-summed.
          D{ZONE.rrfc.homeDistrict} sits under the RRFC and under ARRFC Jhunjhunuwala; the zone totals
          elsewhere count it once.
        </p>
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
