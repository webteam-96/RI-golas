import { useParams, Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { ZONE, DISTRICTS, getDistrict, coordinatorsForDistrict } from '@/data/zone6'
import { DISTRICT_DATA_SUBSTITUTIONS } from '@/data/foundationGoals'
import { HEADLINE, shortLabel } from '@/data/headline'
import { actualFor, percentAchieved, goalStatus, onTrackYN, clubsIn } from '@/lib/rollup'
import { useGoals } from '@/context/GoalsProvider'
import { fmt, usdExact, num, pct } from '@/lib/format'
import { LevelBanner, Kpi, Card, StatusPill, DataNote, EmptyState } from '@/components/Bits'

export default function DistrictOverview() {
  const { districtId } = useParams()
  const { read } = useGoals()
  const d = getDistrict(districtId)
  const clubs = clubsIn(districtId)
  const arrfc = coordinatorsForDistrict(districtId)
  const sub = DISTRICT_DATA_SUBSTITUTIONS[districtId]

  const rank = [...DISTRICTS]
    .map((x) => ({ id: x.id, v: actualFor('annualFund', 'district', x.id).value ?? 0 }))
    .sort((a, b) => b.v - a.v)
    .findIndex((x) => x.id === districtId) + 1

  return (
    <>
      <LevelBanner
        eyebrow={`${ZONE.name} · rank ${rank} of ${DISTRICTS.length}`}
        title={`District ${districtId}`}
        sub={`${d.region} · ARRFC ${arrfc.map((c) => c.name).join(', ') || '—'}`}
        right={
          <Link to="/zone/overview"
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-white/15 border border-white/30 hover:bg-white/25">
            View {ZONE.name} <ArrowUpRight size={13} />
          </Link>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3 mb-5">
        {HEADLINE.slice(0, 5).map((m) => (
          <Kpi key={m.id} label={shortLabel(m)} value={fmt(actualFor(m.id, 'district', districtId).value, m.unit)}
               tone={m.id === 'annualFund' ? 'gold' : 'blue'} />
        ))}
        <Kpi label="Clubs" value={clubs.length || '—'} tone="slate"
             sub={clubs.length ? 'roster loaded' : 'not loaded'} />
      </div>

      {sub && (
        <div className="mb-5">
          <DataNote>
            District <strong>{districtId}</strong> has no column in the Foundation workbook. Every figure on
            this page is sourced from column <strong>{sub}</strong>.
          </DataNote>
        </div>
      )}

      <Card
        title="Goal Progress vs. District Target"
        sub="The zone target sits alongside, so you can see whether this district clears the zone bar"
        className="mb-5"
      >
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-slate-400 border-b border-slate-200">
                <th className="text-left font-bold pb-2">Goal Area</th>
                <th className="text-right font-bold pb-2 px-3">District Target</th>
                <th className="text-right font-bold pb-2 px-3">Zone Target</th>
                <th className="text-right font-bold pb-2 px-3">Actual</th>
                <th className="text-right font-bold pb-2 px-3">%</th>
                <th className="text-left font-bold pb-2 px-3">Status</th>
                <th className="text-center font-bold pb-2">On Track</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {HEADLINE.map((m) => {
                const g = read('district', districtId, m.id)
                const z = read('zone', ZONE.id, m.id)
                const p = percentAchieved(g.target, g.actual, true)
                const s = goalStatus(p)
                return (
                  <tr key={m.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 font-medium text-slate-700">{shortLabel(m)}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-slate-700">{fmt(g.target, m.unit)}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-slate-400">{fmt(z.target, m.unit)}</td>
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

      <Card title="Clubs" sub={clubs.length ? `${clubs.length} clubs · top 8 by membership` : undefined}
            right={clubs.length ? <Link to={`/district/${districtId}/clubs`} className="text-xs font-semibold text-[#003DA5] hover:underline">View all →</Link> : null}>
        {clubs.length ? (
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-sm min-w-[520px]">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-slate-400 border-b border-slate-200">
                  <th className="text-left font-bold pb-2">Club</th>
                  <th className="text-right font-bold pb-2 px-3">Members</th>
                  <th className="text-right font-bold pb-2 px-3">TRF (USD)</th>
                  <th className="text-right font-bold pb-2 px-3">Projects</th>
                  <th className="text-right font-bold pb-2">Goals</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[...clubs].sort((a, b) => (b.membership.current ?? 0) - (a.membership.current ?? 0)).slice(0, 8).map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70">
                    <td className="py-2">
                      <Link to={`/club/${c.id}/overview`} className="font-medium text-[#003DA5] hover:underline">{c.name}</Link>
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums">{num(c.membership.current)}</td>
                    <td className="py-2 px-3 text-right tabular-nums">{usdExact(c.trf.totalUSD)}</td>
                    <td className="py-2 px-3 text-right tabular-nums">{num(c.service.projects)}</td>
                    <td className="py-2 text-right tabular-nums text-slate-500">
                      {c.excellence.goalsCompleted}/{c.excellence.goalsSet}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState>
            Club-level data has not been loaded for District {districtId}. District Foundation figures above are real.
          </EmptyState>
        )}
      </Card>
    </>
  )
}
