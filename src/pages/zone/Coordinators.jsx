import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, ChevronDown, Star, ArrowRight } from 'lucide-react'
import { ZONE, ARRFC_ROLE_LONG, DISTRICTS } from '@/data/zone6'
import { DISTRICT_DATA_SUBSTITUTIONS } from '@/data/foundationGoals'
import { HEADLINE, shortLabel } from '@/data/headline'
import { actualFor, coordinatorTotal, zoneTotal, clubsIn } from '@/lib/rollup'
import { fmt, usdExact, num } from '@/lib/format'
import { LevelBanner, Card, DataNote } from '@/components/Bits'

/**
 * The screen the client asked for: coordinator name -> the districts they support ->
 * that district's data, expanded in place.
 */
export default function Coordinators() {
  const [open, setOpen] = useState(ZONE.coordinators[0].id)

  return (
    <>
      <LevelBanner
        eyebrow={`Zone ${ZONE.number} · Rotary Foundation team`}
        title="Foundation Coordinators"
        sub={`1 RRFC · ${ZONE.coordinators.length} ARRFCs · ${DISTRICTS.length} districts`}
      />

      {/* RRFC — leads the zone */}
      <div className="rounded-2xl border-2 p-5 mb-5 bg-white shadow-sm" style={{ borderColor: '#F7A81B' }}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: '#F7A81B' }}>
              <Star size={18} className="text-[#1e3a5f]" fill="#1e3a5f" />
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
                      style={{ background: '#003DA5', color: 'white' }}>
                  RRFC
                </span>
                <h2 className="text-lg font-extrabold text-slate-800">{ZONE.rrfc.name}</h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {ZONE.rrfc.roleLong} · home district <strong>{ZONE.rrfc.homeDistrict}</strong> ·
                responsible for all {DISTRICTS.length} districts
              </p>
            </div>
          </div>
          <div className="flex gap-5 text-right">
            <Metric label="Annual Fund" value={usdExact(zoneTotal('annualFund'))} />
            <Metric label="PHF" value={num(zoneTotal('phf'))} />
            <Metric label="Major Donors" value={num(zoneTotal('majorDonors'))} />
          </div>
        </div>
      </div>

      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2 px-1">
        ARRFC — {ARRFC_ROLE_LONG}
      </p>

      <div className="space-y-3">
        {ZONE.coordinators.map((c) => {
          const isOpen = open === c.id
          return (
            <div key={c.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <button
                onClick={() => setOpen(isOpen ? null : c.id)}
                className="w-full flex flex-wrap items-center justify-between gap-4 px-5 py-4 text-left hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start gap-3 min-w-0">
                  {isOpen ? <ChevronDown size={18} className="text-slate-400 mt-1 flex-shrink-0" />
                          : <ChevronRight size={18} className="text-slate-400 mt-1 flex-shrink-0" />}
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-800 text-sm sm:text-base">{c.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Home: D {c.homeDistrict} · Supporting:{' '}
                      <strong className="text-slate-700">{c.supports.join(' · ')}</strong>
                    </p>
                  </div>
                </div>
                <div className="flex gap-5 text-right flex-shrink-0">
                  <Metric label="Annual Fund" value={usdExact(coordinatorTotal('annualFund', c))} />
                  <Metric label="PHF" value={num(coordinatorTotal('phf', c))} />
                  <Metric label="Major Donors" value={num(coordinatorTotal('majorDonors', c))} />
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-slate-100 px-5 py-4 bg-slate-50/60">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[640px]">
                      <thead>
                        <tr className="text-[10px] uppercase tracking-widest text-slate-400 border-b border-slate-200">
                          <th className="text-left font-bold pb-2">District</th>
                          {HEADLINE.map((m) => (
                            <th key={m.id} className="text-right font-bold pb-2 px-2">{shortLabel(m)}</th>
                          ))}
                          <th className="text-right font-bold pb-2 pl-2">Clubs</th>
                          <th className="w-8" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {c.supports.map((d) => {
                          const sub = DISTRICT_DATA_SUBSTITUTIONS[d]
                          const clubs = clubsIn(d).length
                          return (
                            <tr key={d} className="hover:bg-white transition-colors">
                              <td className="py-2.5">
                                <Link to={`/district/${d}/overview`}
                                      className="font-semibold text-[#003DA5] hover:underline">
                                  {d}
                                </Link>
                                {sub && (
                                  <span className="ml-1.5 text-[9px] text-amber-600 font-semibold" title={`Figures sourced from column ${sub}`}>
                                    ⓘ {sub}
                                  </span>
                                )}
                              </td>
                              {HEADLINE.map((m) => (
                                <td key={m.id} className="py-2.5 px-2 text-right tabular-nums text-slate-700">
                                  {fmt(actualFor(m.id, 'district', d).value, m.unit)}
                                </td>
                              ))}
                              <td className="py-2.5 pl-2 text-right tabular-nums text-slate-400">
                                {clubs || '—'}
                              </td>
                              <td className="py-2.5 pl-1 text-right">
                                <Link to={`/district/${d}/overview`} className="text-slate-300 hover:text-[#003DA5] inline-block">
                                  <ArrowRight size={15} />
                                </Link>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <Card className="mt-5" title="Zone 6 total" sub="9 districts, each counted exactly once">
        <div className="flex flex-wrap gap-6">
          {HEADLINE.map((m) => (
            <div key={m.id}>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">{shortLabel(m)}</p>
              <p className="text-xl font-extrabold tabular-nums text-[#003DA5]">
                {fmt(zoneTotal(m.id), m.unit)}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-4 space-y-2">
        <DataNote tone="slate">
          <strong>D3120 appears twice</strong> — it is RRFC {ZONE.rrfc.name}&apos;s home district and is also
          supported by ARRFC Jhunjhunuwala. The zone total sums the 9 districts directly, so D3120 is
          counted once. Adding the coordinator rows together would double-count it.
        </DataNote>
        <DataNote>
          <strong>D3292</strong> has no column in the Foundation workbook; its figures are taken from
          column <strong>3291</strong>. Confirm whether this is a typo in the source or a genuine gap.
        </DataNote>
      </div>
    </>
  )
}

function Metric({ label, value }) {
  return (
    <div>
      <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">{label}</p>
      <p className="text-sm font-extrabold tabular-nums text-slate-800">{value}</p>
    </div>
  )
}
