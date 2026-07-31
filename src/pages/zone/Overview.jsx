import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart, Bar as RBar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ZONE, DISTRICTS, DATA_AS_OF, RY } from '@/data/zone6'
import { AREAS, areaLead, AREA_COLOR, shortLabel } from '@/data/headline'
import { actualFor, clubsIn } from '@/lib/rollup'
import { fmt } from '@/lib/format'
import { LevelBanner, Card, DataNote } from '@/components/Bits'
import { AreaCardStrip, AreaGoalTable } from '@/components/AreaCards'

export default function ZoneOverview() {
  const [area, setArea] = useState('foundation')
  const lead = areaLead(area)

  const chartData = DISTRICTS.map((d) => ({
    district: d.id,
    [shortLabel(lead)]: actualFor(lead.id, 'district', d.id).value ?? 0,
  }))

  return (
    <>
      <LevelBanner
        eyebrow={`Zone ${ZONE.number} · ${DISTRICTS.length} districts`}
        title={ZONE.name}
        sub={`RRFC ${ZONE.rrfc.name} (D ${ZONE.rrfc.homeDistrict}) · ${ZONE.coordinators.length} ARRFCs · RY ${RY}, data as of ${DATA_AS_OF}`}
      />

      <AreaCardStrip scope="zone" scopeId={ZONE.id} area={area} onSelect={setArea} />

      <AreaGoalTable
        scope="zone"
        scopeId={ZONE.id}
        area={area}
        title="Goal Progress vs. Zone Target"
        sub="Mirrors section 6 of the Zone 6 monthly coordinator report"
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <Card title={`${shortLabel(lead)} by District`}
              sub={`${AREAS.find((a) => a.id === area).label} · RY ${RY} to ${DATA_AS_OF}`}
              className="xl:col-span-2">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 4, right: 8, left: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="district" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} width={60}
                     tickFormatter={(v) => fmt(v, lead.unit)} />
              <Tooltip formatter={(v) => fmt(v, lead.unit)}
                       contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <RBar dataKey={shortLabel(lead)} fill={AREA_COLOR[area]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Districts" sub="Click through to any district">
          <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
            {DISTRICTS.map((d) => {
              const v = actualFor(lead.id, 'district', d.id).value
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
                  <span className="text-sm font-bold tabular-nums text-[#003DA5]">{fmt(v, lead.unit)}</span>
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
