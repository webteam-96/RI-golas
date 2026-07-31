import { Link } from 'react-router-dom'
import { BarChart, Bar as RBar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ZONE, DISTRICTS, DATA_AS_OF, RY } from '@/data/zone6'
import { HEADLINE, shortLabel } from '@/data/headline'
import { actualFor, zoneTotal, percentAchieved, goalStatus, onTrackYN, clubsIn } from '@/lib/rollup'
import { useGoals } from '@/context/GoalsProvider'
import { fmt, usdExact, num, pct } from '@/lib/format'
import { LevelBanner, Kpi, StatusPill, Card, DataNote } from '@/components/Bits'

export default function ZoneOverview() {
  const { read } = useGoals()

  const chartData = DISTRICTS.map((d) => ({
    district: d.id,
    'Annual Fund': actualFor('annualFund', 'district', d.id).value ?? 0,
  }))

  return (
    <>
      <LevelBanner
        eyebrow={`Zone ${ZONE.number} · ${DISTRICTS.length} districts`}
        title={ZONE.name}
        sub={`RRFC ${ZONE.rrfc.name} (D ${ZONE.rrfc.homeDistrict}) · ${ZONE.coordinators.length} ARRFCs · RY ${RY}, data as of ${DATA_AS_OF}`}
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-5">
        <Kpi label="Districts" value={DISTRICTS.length} sub="in Zone 6" />
        <Kpi label="Annual Fund" value={usdExact(zoneTotal('annualFund'))} tone="gold" sub="zone total" />
        <Kpi label="PHF" value={num(zoneTotal('phf'))} tone="purple" sub="Paul Harris Fellows" />
        <Kpi label="Major Donors" value={num(zoneTotal('majorDonors'))} tone="green" />
        <Kpi label="PHSM" value={num(zoneTotal('phsmPaulHarrisSocietyMember'))} tone="blue" />
        <Kpi label="Coordinators" value={1 + ZONE.coordinators.length} tone="slate" sub="1 RRFC · 5 ARRFC" />
      </div>

      <Card
        title="Goal Progress vs. Zone Target"
        sub="Mirrors section 6 of the Zone 6 monthly coordinator report"
        className="mb-5"
      >
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-sm min-w-[680px]">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-slate-400 border-b border-slate-200">
                <th className="text-left font-bold pb-2">Goal Area</th>
                <th className="text-right font-bold pb-2 px-3">Zone Target</th>
                <th className="text-right font-bold pb-2 px-3">Achieved to Date</th>
                <th className="text-right font-bold pb-2 px-3">% Achieved</th>
                <th className="text-left font-bold pb-2 px-3">Status</th>
                <th className="text-center font-bold pb-2 px-3">On Track</th>
                <th className="text-left font-bold pb-2">Comments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {HEADLINE.map((m) => {
                const g = read('zone', ZONE.id, m.id)
                const p = percentAchieved(g.target, g.actual, true)
                const s = goalStatus(p)
                return (
                  <tr key={m.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 text-slate-700 font-medium">{shortLabel(m)}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-slate-500">{fmt(g.target, m.unit)}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums font-semibold text-slate-800">{fmt(g.actual, m.unit)}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums font-semibold">{p == null ? '—' : pct(p)}</td>
                    <td className="py-2.5 px-3"><StatusPill status={s} /></td>
                    <td className={`py-2.5 px-3 text-center font-bold text-xs ${onTrackYN(s) === 'Y' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {onTrackYN(s)}
                    </td>
                    <td className="py-2.5 text-xs text-slate-400 max-w-[180px] truncate">{g.comment || '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <Card title="Annual Fund by District" sub="US dollars, RY 2025-26 to March 2026" className="xl:col-span-2">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 4, right: 8, left: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="district" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} width={60}
                     tickFormatter={(v) => (v >= 1000 ? `$${Math.round(v / 1000)}k` : `$${v}`)} />
              <Tooltip formatter={(v) => usdExact(v)} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <RBar dataKey="Annual Fund" fill="#003DA5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Districts" sub="Click through to any district">
          <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
            {DISTRICTS.map((d) => {
              const af = actualFor('annualFund', 'district', d.id).value
              const clubs = clubsIn(d.id).length
              return (
                <Link
                  key={d.id}
                  to={`/district/${d.id}/overview`}
                  className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-700">District {d.id}</p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {clubs ? `${clubs} clubs` : 'district-level data only'}
                    </p>
                  </div>
                  <span className="text-sm font-bold tabular-nums text-[#003DA5]">{usdExact(af)}</span>
                </Link>
              )
            })}
          </div>
        </Card>
      </div>

      <div className="mt-5 space-y-2">
        <DataNote>
          <strong>D3292</strong> has no column in the Foundation workbook. The figures shown for it are
          sourced from column <strong>3291</strong> and are flagged wherever they appear.
        </DataNote>
        <DataNote tone="slate">
          Zone totals sum the 9 districts directly. They are <strong>not</strong> summed through the
          coordinator list, because D3120 is both the RRFC&apos;s home district and an ARRFC&apos;s
          supported district — routing the arithmetic through coordinators would count it twice.
        </DataNote>
      </div>
    </>
  )
}
