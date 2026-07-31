import { useState } from 'react'
import { DISHA_ZONES, DISHA_DISTRICTS, DISHA_CATEGORIES, GOALS_YEAR, goalValue, fieldsIn } from '@/data/disha'
import { completion, dishaNumber, piPoints, districtGoals } from '@/lib/disha'
import { LevelBanner, Card, Bar, StatusPill, DataNote } from '@/components/Bits'

const zoneName = (id) => DISHA_ZONES.find((z) => z.id === id)?.name ?? '—'

export default function AdminDistricts() {
  const [open, setOpen] = useState(null)
  const [q, setQ] = useState('')

  const rows = DISHA_DISTRICTS
    .map((d) => ({ ...d, c: completion(d.id), pi: piPoints(districtGoals(d.id)) }))
    .filter((d) => d.number.includes(q.trim()) || (d.governor ?? '').toLowerCase().includes(q.trim().toLowerCase()))

  return (
    <>
      <LevelBanner
        eyebrow={`Goal setting ${GOALS_YEAR}`}
        title="Districts"
        sub={`${DISHA_DISTRICTS.length} districts across ${DISHA_ZONES.length} zones`}
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

      <Card title="Goal completion" sub="Click a district to see every target it has set">
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="eyebrow text-slate-400 border-b border-slate-200">
                <th className="text-left font-medium py-3 pl-5">District</th>
                <th className="text-left font-medium py-3 px-3">Zone</th>
                <th className="text-left font-medium py-3 px-3">Governor</th>
                <th className="text-right font-medium py-3 px-3">Targets set</th>
                <th className="text-right font-medium py-3 px-3">PI points</th>
                <th className="text-left font-medium py-3 px-3 w-48">Progress</th>
                <th className="text-left font-medium py-3 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((d) => (
                <tr key={d.id}
                    onClick={() => setOpen(open === d.id ? null : d.id)}
                    className={`cursor-pointer transition-colors ${open === d.id ? 'bg-royal/[0.04]' : 'hover:bg-slate-50/70'}`}>
                  <td className="py-2.5 pl-5 font-data font-semibold text-ink">{d.number}</td>
                  <td className="py-2.5 px-3 text-slate-500">{zoneName(d.zoneId)}</td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {d.governor?.startsWith('TBD') ? <span className="text-slate-300">not assigned</span> : d.governor}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-slate-700">
                    {d.c.filled} / {d.c.total}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-slate-700">
                    {d.pi ? dishaNumber(d.pi) : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <span className="flex-1"><Bar value={d.c.pct} max={100} /></span>
                      <span className="w-9 text-right font-data text-[12px] font-semibold text-slate-600">
                        {d.c.pct.toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <StatusPill status={d.c.complete ? 'achieved' : d.c.started ? 'atrisk' : 'nodata'} />
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
          Status reflects how many target fields carry a value, not whether the targets are any good.
          Public Image is entered live, so no district shows complete until that session has run.
        </DataNote>
      </div>
    </>
  )
}

function DistrictDetail({ districtId }) {
  const d = DISHA_DISTRICTS.find((x) => x.id === districtId)
  return (
    <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
      {DISHA_CATEGORIES.map((c) => (
        <Card key={c.id} title={c.name} sub={`District ${d.number}`}>
          <dl className="space-y-1.5">
            {fieldsIn(c.id).filter((f) => f.dataType !== 'text').map((f) => {
              const v = dishaNumber(goalValue(d.id, f.id), f.unit)
              return (
                <div key={f.id} className="flex items-baseline justify-between gap-3 text-[12px]">
                  <dt className="text-slate-500 leading-snug">{f.label}</dt>
                  <dd className={`font-data font-semibold whitespace-nowrap ${v ? 'text-ink' : 'text-slate-300'}`}>
                    {v ?? '—'}
                  </dd>
                </div>
              )
            })}
            {c.id === 3 && (
              <div className="flex items-baseline justify-between gap-3 text-[12px] pt-2 mt-1 border-t border-slate-100">
                <dt className="font-semibold text-ink">Total points</dt>
                <dd className="font-data font-bold text-royal">{piPoints(districtGoals(d.id))}</dd>
              </div>
            )}
          </dl>
        </Card>
      ))}
    </div>
  )
}
