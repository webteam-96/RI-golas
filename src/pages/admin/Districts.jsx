import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { DISHA_ZONES, DISHA_DISTRICTS, GOALS_YEAR, PREVIOUS_YEAR } from '@/data/disha'
import { REPORT_CATEGORIES, REPORT_FIELDS, fieldsInCategory, achievedFor } from '@/data/reportFields'
import { targetValue } from '@/data/dishaTargets'
import { coverage, dishaNumber } from '@/lib/disha'
import { LevelBanner, Card, Bar, DataNote } from '@/components/Bits'

const zoneName = (id) => DISHA_ZONES.find((z) => z.id === id)?.name ?? '—'

const attainmentOf = (d) => {
  const scored = REPORT_FIELDS
    .map((f) => ({ a: achievedFor(f, d), t: targetValue(d.id, f.id) }))
    .filter((r) => r.a != null && r.t)
  return scored.length
    ? scored.reduce((s, r) => s + Math.min((r.a / r.t) * 100, 100), 0) / scored.length
    : null
}

export default function AdminDistricts() {
  const [q, setQ] = useState('')

  const rows = DISHA_DISTRICTS
    .map((d) => ({ ...d, cov: coverage(d.id), att: attainmentOf(d) }))
    .filter((d) => d.number.includes(q.trim()) || (d.governor ?? '').toLowerCase().includes(q.trim().toLowerCase()))

  return (
    <>
      <LevelBanner
        eyebrow={`RI Director Office · goal setting ${GOALS_YEAR}`}
        title="Districts"
        sub={`${DISHA_DISTRICTS.length} districts and their governors across ${DISHA_ZONES.length} zones`}
        right={
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search district or governor…"
            className="rounded-lg px-3 py-2 text-sm bg-white/15 border border-white/30 text-white placeholder:text-blue-200
                       focus:outline-none focus:bg-white/25 w-56"
          />
        }
      />

      <Card title="District Governors" sub="Click a district number to open everything it reports">
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="eyebrow text-slate-400 border-b border-slate-200">
                <th className="text-left font-medium py-3 pl-5">District</th>
                <th className="text-left font-medium py-3 px-3">Zone</th>
                <th className="text-left font-medium py-3 px-3">District Governor</th>
                <th className="text-right font-medium py-3 px-3">Data on file</th>
                <th className="text-left font-medium py-3 px-3 w-44">Coverage</th>
                <th className="text-right font-medium py-3 px-3">Attainment</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((d) => (
                <tr key={d.id} className="hover:bg-royal/[0.04] transition-colors">
                  <td className="py-2.5 pl-5">
                    <Link to={`/ri/districts/${d.id}`}
                          className="font-data font-semibold text-royal hover:underline">
                      {d.number}
                    </Link>
                  </td>
                  <td className="py-2.5 px-3 text-slate-500">{zoneName(d.zoneId)}</td>
                  <td className="py-2.5 px-3 text-slate-700">{d.governor ?? <span className="text-slate-300">not assigned</span>}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-slate-600">
                    {d.cov.filled} / {d.cov.total}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <span className="flex-1"><Bar value={d.cov.pct} max={100} /></span>
                      <span className="w-9 text-right font-data text-[12px] font-semibold text-slate-600">
                        {d.cov.pct.toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-right font-data font-semibold text-slate-700">
                    {d.att == null ? <span className="text-slate-300">—</span> : `${d.att.toFixed(0)}%`}
                  </td>
                  <td className="py-2.5 pr-4 text-right">
                    <Link to={`/ri/districts/${d.id}`} className="text-slate-300 hover:text-royal inline-block">
                      <ArrowRight size={15} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mt-5">
        <DataNote tone="slate">
          Coverage is how much of the {PREVIOUS_YEAR} reference data a district carries — the base its
          {' '}{GOALS_YEAR} targets will be set against. Attainment measures those figures against the
          placeholder targets, so it moves once real targets are entered.
        </DataNote>
      </div>
    </>
  )
}
