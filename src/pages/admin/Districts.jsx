import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { DISHA_ZONES, DISHA_DISTRICTS, GOALS_YEAR, PREVIOUS_YEAR } from '@/data/disha'
import { REPORT_FIELDS, achievedFor, SOURCED_FIELDS } from '@/data/reportFields'
import { targetValue, useTargetCount } from '@/data/dishaTargets'
import { LevelBanner, Card, Bar, DataNote } from '@/components/Bits'

const zoneName = (id) => DISHA_ZONES.find((z) => z.id === id)?.name ?? '—'

/**
 * Coverage counts the fields on this report that the portal actually carries for a district.
 * It used to measure the portal's own reference form, which answered a question nobody on this
 * page was asking — the columns beside it are the report's 27 fields, so coverage should be too.
 */
const coverageOf = (d) => REPORT_FIELDS.filter((f) => achievedFor(f, d) != null).length

/** Null for a district until targets are entered against it, which is the starting state. */
const attainmentOf = (d) => {
  const scored = REPORT_FIELDS
    .map((f) => ({ a: achievedFor(f, d), t: targetValue(d.id, f.id) }))
    .filter((r) => r.a != null && r.t)
  // Floored as well as capped: a field below zero is 0% attained, not a negative percentage.
  return scored.length
    ? scored.reduce((s, r) => s + Math.min(Math.max((r.a / r.t) * 100, 0), 100), 0) / scored.length
    : null
}

export default function AdminDistricts() {
  const [q, setQ] = useState('')
  useTargetCount() // targets are entered elsewhere; re-render when they are. The count it returns
                   // spans every scope — club and zone-metric targets included — so the note below
                   // counts the districts this table actually scores instead.

  // Kept in the portal's own order — zone, then district number. Nothing here sorts on
  // attainment: that column is null wherever no target has been set, which is most of it.
  const rows = DISHA_DISTRICTS
    .map((d) => ({ ...d, cov: coverageOf(d), att: attainmentOf(d) }))
    .filter((d) => d.number.includes(q.trim()) || (d.governor ?? '').toLowerCase().includes(q.trim().toLowerCase()))

  const scored = rows.filter((d) => d.att != null).length

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
                <th className="text-right font-medium py-3 px-3">Fields reported</th>
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
                    {d.cov} / {REPORT_FIELDS.length}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <span className="flex-1"><Bar value={d.cov} max={REPORT_FIELDS.length} /></span>
                      <span className="w-9 text-right font-data text-[12px] font-semibold text-slate-600">
                        {((d.cov / REPORT_FIELDS.length) * 100).toFixed(0)}%
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

      <div className="mt-5 space-y-2">
        <DataNote>
          Fields reported and Attainment stand on what each district achieved in {PREVIOUS_YEAR};
          targets are set by District Governors for {GOALS_YEAR} at the goal-setting event.{' '}
          {scored
            ? `Attainment is showing for ${scored} of the ${rows.length} district${rows.length === 1 ? '' : 's'} listed; the rest read as a dash until a target is set against a field they report.`
            : 'None are scored yet, so Attainment is blank for every district.'}
        </DataNote>
        <DataNote tone="slate">
          Coverage is how many of the {REPORT_FIELDS.length} fields on the monthly report the portal
          carries for a district. Only {SOURCED_FIELDS} of them are collected there at all, and
          Public Image is not among them.
        </DataNote>
      </div>
    </>
  )
}
