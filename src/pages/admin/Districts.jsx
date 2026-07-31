import { useState } from 'react'
import { DISHA_ZONES, DISHA_DISTRICTS, DISHA_CATEGORIES, GOALS_YEAR, PREVIOUS_YEAR, fieldsIn, prevValue } from '@/data/disha'
import { coverage, dishaNumber } from '@/lib/disha'
import { LevelBanner, Card, Bar, DataNote } from '@/components/Bits'

const zoneName = (id) => DISHA_ZONES.find((z) => z.id === id)?.name ?? '—'

export default function AdminDistricts() {
  const [open, setOpen] = useState(null)
  const [q, setQ] = useState('')

  const rows = DISHA_DISTRICTS
    .map((d) => ({ ...d, cov: coverage(d.id) }))
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

      <Card title="District Governors" sub="Click a row to see the existing figures that district starts from">
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="eyebrow text-slate-400 border-b border-slate-200">
                <th className="text-left font-medium py-3 pl-5">District</th>
                <th className="text-left font-medium py-3 px-3">Zone</th>
                <th className="text-left font-medium py-3 px-3">District Governor</th>
                <th className="text-right font-medium py-3 px-3">Data on file</th>
                <th className="text-left font-medium py-3 px-3 w-48">Coverage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((d) => (
                <tr key={d.id}
                    onClick={() => setOpen(open === d.id ? null : d.id)}
                    className={`cursor-pointer transition-colors ${open === d.id ? 'bg-royal/[0.04]' : 'hover:bg-slate-50/70'}`}>
                  <td className="py-2.5 pl-5 font-data font-semibold text-ink">{d.number}</td>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {open && <DistrictDetail districtId={open} />}

      <div className="mt-5">
        <DataNote tone="slate">
          Coverage is how much of the {PREVIOUS_YEAR} reference data a district carries — the base its
          {' '}{GOALS_YEAR} targets will be set against. Targets themselves are entered live.
        </DataNote>
      </div>
    </>
  )
}

function DistrictDetail({ districtId }) {
  const d = DISHA_DISTRICTS.find((x) => x.id === districtId)
  return (
    <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
      {DISHA_CATEGORIES.map((c) => {
        const fields = fieldsIn(c.id).filter((f) => f.showPrev)
        return (
          <Card key={c.id} title={c.name} sub={`District ${d.number} · ${PREVIOUS_YEAR}`}>
            {fields.length ? (
              <dl className="space-y-1.5">
                {fields.map((f) => {
                  const v = dishaNumber(prevValue(d.id, f.id), f.unit)
                  return (
                    <div key={f.id} className="flex items-baseline justify-between gap-3 text-[12px]">
                      <dt className="text-slate-500 leading-snug">
                        <span className="text-slate-300 mr-1">{f.section}</span>
                        {f.label}
                      </dt>
                      <dd className={`font-data font-semibold whitespace-nowrap ${v ? 'text-ink' : 'text-slate-300'}`}>
                        {v ?? '—'}
                      </dd>
                    </div>
                  )
                })}
              </dl>
            ) : (
              <p className="text-[12px] text-slate-400 py-4 text-center">
                Entered live — nothing pre-loaded for this category.
              </p>
            )}
          </Card>
        )
      })}
    </div>
  )
}
