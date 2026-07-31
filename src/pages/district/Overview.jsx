import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { ZONE, DISTRICTS, getDistrict, coordinatorsForDistrict } from '@/data/zone6'
import { DISTRICT_DATA_SUBSTITUTIONS } from '@/data/foundationGoals'
import { AREAS, areaLead } from '@/data/headline'
import { actualFor, clubsIn } from '@/lib/rollup'
import { usdExact, num } from '@/lib/format'
import { LevelBanner, Card, DataNote, EmptyState } from '@/components/Bits'
import { AreaCardStrip, AreaGoalTable } from '@/components/AreaCards'

export default function DistrictOverview() {
  const { districtId } = useParams()
  const [area, setArea] = useState('foundation')
  const d = getDistrict(districtId)
  const clubs = clubsIn(districtId)
  const arrfc = coordinatorsForDistrict(districtId)
  const sub = DISTRICT_DATA_SUBSTITUTIONS[districtId]

  const lead = areaLead(area)
  const rank = [...DISTRICTS]
    .map((x) => ({ id: x.id, v: actualFor(lead.id, 'district', x.id).value ?? 0 }))
    .sort((a, b) => b.v - a.v)
    .findIndex((x) => x.id === districtId) + 1

  return (
    <>
      <LevelBanner
        eyebrow={`${ZONE.name} · ${AREAS.find((a) => a.id === area).label} rank ${rank} of ${DISTRICTS.length}`}
        title={`District ${districtId}`}
        sub={`${d.region} · ARRFC ${arrfc.map((c) => c.name).join(', ') || '—'}`}
        right={
          <Link to="/zone/overview"
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-white/15 border border-white/30 hover:bg-white/25">
            View {ZONE.name} <ArrowUpRight size={13} />
          </Link>
        }
      />

      <AreaCardStrip scope="district" scopeId={districtId} area={area} onSelect={setArea} />

      {sub && (
        <div className="mb-5">
          <DataNote>
            District <strong>{districtId}</strong> has no column in the Foundation workbook. Every figure on
            this page is sourced from column <strong>{sub}</strong>.
          </DataNote>
        </div>
      )}

      <AreaGoalTable
        scope="district"
        scopeId={districtId}
        area={area}
        contextScope="zone"
        contextId={ZONE.id}
        contextLabel="Zone target"
        title="Goal Progress vs. District Target"
        sub="The zone target sits alongside, so you can see whether this district clears the zone bar"
      />

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
