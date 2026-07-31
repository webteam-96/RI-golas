import { useState, Fragment } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, ChevronDown, ArrowRight } from 'lucide-react'
import { ZONE, DISTRICTS, coordinatorsForDistrict } from '@/data/zone6'
import { DISTRICT_DATA_SUBSTITUTIONS } from '@/data/foundationGoals'
import { HEADLINE, shortLabel } from '@/data/headline'
import { actualFor, zoneTotal, clubsIn } from '@/lib/rollup'
import { fmt, usdExact, num } from '@/lib/format'
import { LevelBanner, DataNote, EmptyState } from '@/components/Bits'

export default function ZoneDistricts() {
  const [open, setOpen] = useState('3120')
  const [q, setQ] = useState('')

  const rows = DISTRICTS.filter((d) => d.id.includes(q.trim()) || d.region.toLowerCase().includes(q.trim().toLowerCase()))

  return (
    <>
      <LevelBanner
        eyebrow={`Zone ${ZONE.number}`}
        title="Districts"
        sub="Expand a district to see its clubs without leaving this page"
        right={
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search district…"
            className="rounded-lg px-3 py-1.5 text-sm bg-white/15 border border-white/30 text-white placeholder:text-blue-200
                       focus:outline-none focus:bg-white/25 w-44"
          />
        }
      />

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[880px]">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-slate-400 border-b border-slate-200 bg-slate-50">
                <th className="text-left font-bold py-3 pl-5 pr-2">District</th>
                <th className="text-left font-bold py-3 px-2">ARRFC</th>
                {HEADLINE.map((m) => (
                  <th key={m.id} className="text-right font-bold py-3 px-2">{shortLabel(m)}</th>
                ))}
                <th className="text-right font-bold py-3 px-2">Clubs</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((d) => {
                const clubs = clubsIn(d.id)
                const isOpen = open === d.id
                const arrfc = coordinatorsForDistrict(d.id)[0]
                const sub = DISTRICT_DATA_SUBSTITUTIONS[d.id]
                return (
                  <Fragment key={d.id}>
                    <tr className="hover:bg-slate-50/70">
                      <td className="py-3 pl-5 pr-2">
                        <button
                          onClick={() => setOpen(isOpen ? null : d.id)}
                          className="flex items-center gap-1.5 font-bold text-slate-800"
                          disabled={!clubs.length}
                        >
                          {clubs.length
                            ? (isOpen ? <ChevronDown size={15} className="text-slate-400" />
                                      : <ChevronRight size={15} className="text-slate-400" />)
                            : <span className="w-[15px]" />}
                          {d.id}
                        </button>
                        <p className="text-[11px] text-slate-400 pl-[21px]">
                          {d.region}
                          {sub && <span className="text-amber-600 font-semibold ml-1">ⓘ data from {sub}</span>}
                        </p>
                      </td>
                      <td className="py-3 px-2 text-xs text-slate-500 max-w-[170px] truncate" title={arrfc?.name}>
                        {arrfc?.name ?? '—'}
                      </td>
                      {HEADLINE.map((m) => (
                        <td key={m.id} className="py-3 px-2 text-right tabular-nums text-slate-700">
                          {fmt(actualFor(m.id, 'district', d.id).value, m.unit)}
                        </td>
                      ))}
                      <td className="py-3 px-2 text-right tabular-nums text-slate-500">
                        {clubs.length || <span className="text-slate-300">—</span>}
                      </td>
                      <td className="py-3 pr-4 text-right">
                        <Link to={`/district/${d.id}/overview`} className="text-slate-300 hover:text-[#003DA5] inline-block">
                          <ArrowRight size={15} />
                        </Link>
                      </td>
                    </tr>

                    {isOpen && (
                      <tr>
                        <td colSpan={HEADLINE.length + 4} className="bg-slate-50/80 px-5 py-4">
                          {clubs.length ? (
                            <>
                              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2">
                                Clubs in District {d.id} · {clubs.length}
                              </p>
                              <div className="overflow-x-auto">
                                <table className="w-full text-xs min-w-[560px]">
                                  <thead>
                                    <tr className="text-slate-400 border-b border-slate-200">
                                      <th className="text-left font-semibold pb-1.5">Club</th>
                                      <th className="text-right font-semibold pb-1.5 px-2">Members</th>
                                      <th className="text-right font-semibold pb-1.5 px-2">Net</th>
                                      <th className="text-right font-semibold pb-1.5 px-2">TRF (USD)</th>
                                      <th className="text-right font-semibold pb-1.5 px-2">Projects</th>
                                      <th className="text-right font-semibold pb-1.5 px-2">Goals</th>
                                      <th className="w-6" />
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-200">
                                    {clubs.map((c) => {
                                      const net = c.membership.current - c.membership.atRYStart
                                      return (
                                        <tr key={c.id} className="hover:bg-white">
                                          <td className="py-1.5 font-medium text-slate-700">{c.name}</td>
                                          <td className="py-1.5 px-2 text-right tabular-nums">{num(c.membership.current)}</td>
                                          <td className={`py-1.5 px-2 text-right tabular-nums font-semibold ${net > 0 ? 'text-emerald-600' : net < 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                                            {net > 0 ? `+${net}` : net}
                                          </td>
                                          <td className="py-1.5 px-2 text-right tabular-nums">{usdExact(c.trf.totalUSD)}</td>
                                          <td className="py-1.5 px-2 text-right tabular-nums">{num(c.service.projects)}</td>
                                          <td className="py-1.5 px-2 text-right tabular-nums text-slate-500">
                                            {c.excellence.goalsCompleted}/{c.excellence.goalsSet}
                                          </td>
                                          <td className="py-1.5 text-right">
                                            <Link to={`/club/${c.id}/overview`} className="text-slate-300 hover:text-[#003DA5] inline-block">
                                              <ArrowRight size={13} />
                                            </Link>
                                          </td>
                                        </tr>
                                      )
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </>
                          ) : (
                            <EmptyState>Club-level data not yet loaded for District {d.id}.</EmptyState>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-bold text-slate-800 border-t-2 border-slate-300">
                <td className="py-3 pl-5 pr-2">ZONE 6</td>
                <td className="py-3 px-2 text-xs text-slate-500 font-normal">{DISTRICTS.length} districts</td>
                {HEADLINE.map((m) => (
                  <td key={m.id} className="py-3 px-2 text-right tabular-nums">{fmt(zoneTotal(m.id), m.unit)}</td>
                ))}
                <td className="py-3 px-2 text-right tabular-nums">
                  {DISTRICTS.reduce((s, x) => s + clubsIn(x.id).length, 0)}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="mt-4">
        <DataNote tone="slate">
          Club rosters are loaded for D3120 and D3030. The remaining seven districts show
          district-level Foundation figures with no club layer beneath them yet.
        </DataNote>
      </div>
    </>
  )
}
