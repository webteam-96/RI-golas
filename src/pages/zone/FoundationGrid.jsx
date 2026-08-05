import { Link } from 'react-router-dom'
import { ZONE, DISTRICTS, DATA_AS_OF } from '@/data/zone6'
import { FOUNDATION } from '@/data/metrics'
import { PREVIOUS_YEAR } from '@/data/disha'
import { DISTRICT_DATA_SUBSTITUTIONS } from '@/data/foundationGoals'
import { actualFor } from '@/lib/rollup'
import { fmt } from '@/lib/format'
import { LevelBanner, YesNoPill, DataNote } from '@/components/Bits'

/**
 * The workbook's own layout: 24 metrics down, 9 districts across. A coordinator who fills in
 * the Excel every month recognises this instantly, which is most of the argument for adopting it.
 */
export default function FoundationGrid() {
  return (
    <>
      <LevelBanner
        eyebrow={`Zone ${ZONE.number} · all 24 metrics`}
        title="Foundation Goals Grid"
        sub={`Same shape as the Foundation goals workbook — metrics down, districts across. Figures as reported at ${DATA_AS_OF}, within ${PREVIOUS_YEAR}.`}
      />

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[1000px]">
            <thead>
              <tr className="border-b-2 border-slate-200 bg-slate-50">
                <th className="text-left font-bold py-3 pl-5 pr-3 text-[10px] uppercase tracking-widest text-slate-400
                               sticky left-0 z-30 bg-slate-50 min-w-[280px]
                               shadow-[3px_0_6px_-3px_rgba(10,26,51,0.16)]">
                  Metric
                </th>
                <th className="text-center font-bold py-3 px-2 text-[10px] uppercase tracking-widest text-slate-400 w-14">
                  Code
                </th>
                {DISTRICTS.map((d) => (
                  <th key={d.id} className="text-right font-bold py-3 px-2 text-[11px] text-slate-600 w-[86px]">
                    <Link to={`/district/${d.id}/overview`} className="hover:text-[#003DA5] hover:underline">
                      {d.id}
                    </Link>
                    {DISTRICT_DATA_SUBSTITUTIONS[d.id] && (
                      <span className="block text-[8px] text-amber-600 font-semibold">
                        ⓘ {DISTRICT_DATA_SUBSTITUTIONS[d.id]}
                      </span>
                    )}
                  </th>
                ))}
                <th className="text-right font-bold py-3 px-3 text-[11px] text-white w-[100px]" style={{ background: '#003DA5' }}>
                  TOTAL
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {FOUNDATION.map((m) => {
                const zoneVal = actualFor(m.id, 'zone', ZONE.id)
                return (
                  <tr key={m.id} className="group hover:bg-[#EAF0FA]">
                    {/* Opaque: a translucent sticky cell lets the scrolling columns show through it */}
                    <td className="py-2 pl-5 pr-3 text-slate-700 sticky left-0 z-20 bg-white group-hover:bg-[#EAF0FA]
                                   shadow-[3px_0_6px_-3px_rgba(10,26,51,0.16)]">
                      {m.label}
                    </td>
                    <td className="py-2 px-2 text-center text-slate-300 font-mono text-[10px]">{m.code}</td>
                    {DISTRICTS.map((d) => {
                      const v = m.actuals[d.id]
                      return (
                        <td key={d.id} className="py-2 px-2 text-right tabular-nums">
                          {m.unit === 'yesno'
                            ? <YesNoPill value={v} />
                            : v == null
                              ? <span className="text-slate-300">—</span>
                              : <span className={v === 0 ? 'text-slate-300' : 'text-slate-700'}>{fmt(v, m.unit)}</span>}
                        </td>
                      )
                    })}
                    <td className="py-2 px-3 text-right tabular-nums font-bold text-[#003DA5] bg-blue-50/60">
                      {/* A column nobody answered is not nine districts answering No, so it
                          gets the same dash as a blank cell rather than "0 of 9". */}
                      {m.unit !== 'yesno' ? fmt(zoneVal.value, m.unit)
                        : zoneVal.reporting ? `${zoneVal.value} of ${zoneVal.total}`
                        : <span className="text-slate-300 font-normal">—</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <DataNote tone="slate">
          A dash means <strong>not collected</strong> (the workbook cell was blank) and is excluded from
          every total. A greyed <strong>0</strong> means reported as zero. These are different things and
          are never merged — DDF, Polio Plus Society and Hall of Honor are blank for all nine districts.
        </DataNote>
        <DataNote tone="slate">
          Yes/No metrics roll up as <strong>&ldquo;n of 9 districts&rdquo;</strong>, never as a percentage.
        </DataNote>
      </div>
    </>
  )
}
