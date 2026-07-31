import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { DISTRICTS, RY, DATA_AS_OF } from '@/data/zone6'
import { DISTRICT_DATA_SUBSTITUTIONS } from '@/data/foundationGoals'
import { AREAS, areaMetrics, areaLead, AREA_COLOR, shortLabel } from '@/data/headline'
import { actualFor, clubsIn } from '@/lib/rollup'
import { fmt } from '@/lib/format'
import { LevelBanner, Card, Bar, DataNote } from '@/components/Bits'
import { AreaCardStrip, AreaGoalTable } from '@/components/AreaCards'

/**
 * RI Director view. Deliberately no zone layer — the Director looks straight at the four
 * goal areas and then straight at the districts.
 */
export default function RiOverview() {
  const [area, setArea] = useState('foundation')

  const cols = areaMetrics(area)
  const lead = areaLead(area)

  const rows = DISTRICTS.map((d) => ({
    ...d,
    lead: actualFor(lead.id, 'district', d.id).value ?? 0,
    clubs: clubsIn(d.id).length,
  })).sort((a, b) => b.lead - a.lead)
  const max = rows[0]?.lead ?? 0

  return (
    <>
      <LevelBanner
        eyebrow="RI Director Office"
        title="Global Overview"
        sub={`${DISTRICTS.length} districts · RY ${RY}, data as of ${DATA_AS_OF}`}
      />

      <AreaCardStrip scope="ri" scopeId="ri" area={area} onSelect={setArea} />

      <AreaGoalTable scope="ri" scopeId="ri" area={area} sub="RI target against the reported actual" />

      <Card
        title="Districts"
        sub={`All ${DISTRICTS.length} districts · ${AREAS.find((a) => a.id === area).label} · click any row to drill in`}
      >
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-slate-400 border-b border-slate-200">
                <th className="text-left font-bold pb-2">District</th>
                {cols.map((m) => (
                  <th key={m.id} className="text-right font-bold pb-2 px-2">{shortLabel(m)}</th>
                ))}
                <th className="text-right font-bold pb-2 px-2">Clubs</th>
                <th className="text-left font-bold pb-2 px-3 w-32">{shortLabel(lead)}</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/70">
                  <td className="py-2.5">
                    <Link to={`/district/${d.id}/overview`} className="font-bold text-slate-800 hover:text-[#003DA5] hover:underline">
                      {d.id}
                    </Link>
                    {DISTRICT_DATA_SUBSTITUTIONS[d.id] && (
                      <span className="ml-1.5 text-[9px] text-amber-600 font-semibold"
                            title={`Figures sourced from column ${DISTRICT_DATA_SUBSTITUTIONS[d.id]}`}>
                        ⓘ {DISTRICT_DATA_SUBSTITUTIONS[d.id]}
                      </span>
                    )}
                    <p className="text-[11px] text-slate-400">{d.region}</p>
                  </td>
                  {cols.map((m) => (
                    <td key={m.id} className="py-2.5 px-2 text-right tabular-nums text-slate-700">
                      {fmt(actualFor(m.id, 'district', d.id).value, m.unit)}
                    </td>
                  ))}
                  <td className="py-2.5 px-2 text-right tabular-nums text-slate-400">{d.clubs || '—'}</td>
                  <td className="py-2.5 px-3">
                    <Bar value={d.lead} max={max} color={AREA_COLOR[area]} />
                  </td>
                  <td className="py-2.5 text-right">
                    <Link to={`/district/${d.id}/overview`} className="text-slate-300 hover:text-[#003DA5] inline-block">
                      <ArrowRight size={15} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 font-bold text-slate-800 border-t-2 border-slate-200">
                <td className="py-3">ALL DISTRICTS</td>
                {cols.map((m) => (
                  <td key={m.id} className="py-3 px-2 text-right tabular-nums">
                    {fmt(actualFor(m.id, 'ri', 'ri').value, m.unit)}
                  </td>
                ))}
                <td className="py-3 px-2 text-right tabular-nums">
                  {DISTRICTS.reduce((s, d) => s + clubsIn(d.id).length, 0)}
                </td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      <div className="mt-5 space-y-2">
        {(area === 'publicimage' || area === 'membership' || area === 'projects') && (
          <DataNote>
            {AREAS.find((a) => a.id === area).label} figures roll up from club reports. Only D3120 and
            D3030 have club rosters loaded, so the other seven districts show a dash rather than a zero.
          </DataNote>
        )}
        <DataNote>
          <strong>D3292</strong> has no column in the Foundation workbook. Its figures are sourced from
          column <strong>3291</strong> and are flagged wherever they appear.
        </DataNote>
      </div>
    </>
  )
}
