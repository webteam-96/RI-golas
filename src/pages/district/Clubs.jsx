import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { clubsIn, actualFor } from '@/lib/rollup'
import { usdExact, num, pct } from '@/lib/format'
import { LevelBanner, Card, EmptyState, DataNote, Coverage } from '@/components/Bits'

const COLS = [
  { key: 'name',    label: 'Club',       align: 'left',  get: (c) => c.name },
  { key: 'members', label: 'Members',    align: 'right', get: (c) => c.membership.current },
  { key: 'net',     label: 'Net',        align: 'right', get: (c) => (c.membership.current ?? 0) - (c.membership.atRYStart ?? 0) },
  { key: 'female',  label: 'Female',     align: 'right', get: (c) => c.membership.female },
  { key: 'myrot',   label: 'My Rotary',  align: 'right', get: (c) => c.membership.myRotary },
  { key: 'trf',     label: 'TRF (USD)',  align: 'right', get: (c) => c.trf.totalUSD },
  { key: 'proj',    label: 'Projects',   align: 'right', get: (c) => c.service.projects },
  { key: 'goals',   label: 'Goals',      align: 'right', get: (c) => c.excellence.goalsSet },
]

export default function DistrictClubs() {
  const { districtId } = useParams()
  const clubs = clubsIn(districtId)
  const [sort, setSort] = useState({ key: 'members', dir: -1 })

  const sorted = [...clubs].sort((a, b) => {
    const col = COLS.find((c) => c.key === sort.key)
    const av = col.get(a), bv = col.get(b)
    if (typeof av === 'string') return av.localeCompare(bv) * sort.dir
    return ((av ?? -Infinity) - (bv ?? -Infinity)) * sort.dir
  })

  const totals = COLS.slice(1).reduce((acc, col) => {
    acc[col.key] = clubs.reduce((s, c) => s + (col.get(c) ?? 0), 0)
    return acc
  }, {})

  const myRotaryPct = actualFor('myRotaryPct', 'district', districtId)

  if (!clubs.length) {
    return (
      <>
        <LevelBanner eyebrow={`District ${districtId}`} title="Clubs" />
        <Card>
          <EmptyState>
            Club-level data has not been loaded for District {districtId}. Only D3120 and D3030 carry
            club rosters in this prototype.
          </EmptyState>
        </Card>
      </>
    )
  }

  return (
    <>
      <LevelBanner
        eyebrow={`District ${districtId}`}
        title="Clubs"
        sub={`${clubs.length} clubs · click any column header to sort`}
      />

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[820px]">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-slate-400 border-b border-slate-200 bg-slate-50">
                {COLS.map((c) => (
                  <th
                    key={c.key}
                    onClick={() => setSort((s) => ({ key: c.key, dir: s.key === c.key ? -s.dir : -1 }))}
                    className={`font-bold py-3 cursor-pointer select-none hover:text-slate-600 ${
                      c.align === 'left' ? 'text-left pl-5' : 'text-right px-3'
                    }`}
                  >
                    {c.label}
                    {sort.key === c.key && <span className="ml-1">{sort.dir === -1 ? '▾' : '▴'}</span>}
                  </th>
                ))}
                <th className="w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sorted.map((c) => {
                const net = (c.membership.current ?? 0) - (c.membership.atRYStart ?? 0)
                return (
                  <tr key={c.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 pl-5">
                      <Link to={`/club/${c.id}/overview`} className="font-medium text-slate-700 hover:text-[#003DA5] hover:underline">
                        {c.name}
                      </Link>
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums">{num(c.membership.current)}</td>
                    <td className={`py-2.5 px-3 text-right tabular-nums font-semibold ${net > 0 ? 'text-emerald-600' : net < 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                      {net > 0 ? `+${net}` : net}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-slate-500">{num(c.membership.female)}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-slate-500">{num(c.membership.myRotary)}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">{usdExact(c.trf.totalUSD)}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">{num(c.service.projects)}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-slate-500">
                      {c.excellence.goalsCompleted}/{c.excellence.goalsSet}
                    </td>
                    <td className="py-2.5 pr-4 text-right">
                      <Link to={`/club/${c.id}/overview`} className="text-slate-300 hover:text-[#003DA5] inline-block">
                        <ArrowRight size={15} />
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-bold text-slate-800 border-t-2 border-slate-300">
                <td className="py-3 pl-5">DISTRICT {districtId}</td>
                <td className="py-3 px-3 text-right tabular-nums">{num(totals.members)}</td>
                <td className="py-3 px-3 text-right tabular-nums">{totals.net > 0 ? `+${totals.net}` : totals.net}</td>
                <td className="py-3 px-3 text-right tabular-nums">{num(totals.female)}</td>
                <td className="py-3 px-3 text-right tabular-nums">{num(totals.myrot)}</td>
                <td className="py-3 px-3 text-right tabular-nums">{usdExact(totals.trf)}</td>
                <td className="py-3 px-3 text-right tabular-nums">{num(totals.proj)}</td>
                <td className="py-3 px-3 text-right tabular-nums">{num(totals.goals)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="mt-4">
        <DataNote tone="slate">
          District My&nbsp;Rotary registration is <strong>{pct(myRotaryPct.value, 1)}</strong> — a mean
          weighted by each club&apos;s member count
          <Coverage reporting={myRotaryPct.reporting} total={myRotaryPct.total} />. Plain-averaging the
          clubs&apos; percentages would let a 13-member club outvote a 324-member one and overstate this
          by roughly 15 points.
        </DataNote>
      </div>
    </>
  )
}
