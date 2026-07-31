import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, ChevronDown, Star, ArrowRight } from 'lucide-react'
import { ZONE, ARRFC_ROLE_LONG, DISTRICTS } from '@/data/zone6'
import { DISTRICT_DATA_SUBSTITUTIONS } from '@/data/foundationGoals'
import { HEADLINE, shortLabel } from '@/data/headline'
import { actualFor, coordinatorTotal, zoneTotal, clubsIn } from '@/lib/rollup'
import { fmt, usdExact, num } from '@/lib/format'
import { Card, DataNote, StatPlate } from './Bits'

/**
 * Coordinator name → the districts they support → that district's data, expanded in place.
 * Written once and used by both the Zone and RI Director views, which show the same roster.
 */
export default function CoordinatorList() {
  const [open, setOpen] = useState(ZONE.coordinators[0].id)

  return (
    <>
      {/* RRFC — leads the zone */}
      <div className="rounded-2xl p-5 mb-6 bg-white border border-gold/40 shadow-[0_1px_2px_rgba(10,26,51,0.04)]
                      relative overflow-hidden">
        <span className="absolute left-0 top-0 bottom-0 w-1 bg-gold" />
        {/* No figures here — the RRFC covers the whole zone, and the zone total sits
            directly below. Repeating it on the card would say the same thing twice. */}
        <div className="flex items-start gap-3.5 pl-2">
          <span className="h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-gold">
            <Star size={19} className="text-ink" fill="#0A1A33" />
          </span>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="eyebrow px-2 py-0.5 rounded bg-royal text-white">RRFC</span>
              <h2 className="font-display text-[1.3rem] font-bold text-ink leading-none">{ZONE.rrfc.name}</h2>
            </div>
            <p className="text-[12px] text-slate-500 mt-1.5">
              {ZONE.rrfc.roleLong} · home district <strong className="text-slate-700">{ZONE.rrfc.homeDistrict}</strong> ·
              responsible for all {DISTRICTS.length} districts
            </p>
          </div>
        </div>
      </div>

      {/* The figure the RRFC is accountable for */}
      <StatPlate
        title={`${ZONE.name} total`}
        sub={`${DISTRICTS.length} districts · each counted exactly once`}
        columns="lg:grid-cols-7"
        items={HEADLINE.map((m) => ({ label: shortLabel(m), value: fmt(zoneTotal(m.id), m.unit) }))}
      />

      <p className="eyebrow text-slate-400 mb-2.5 px-1">ARRFC — {ARRFC_ROLE_LONG}</p>

      <div className="space-y-3">
        {ZONE.coordinators.map((c) => {
          const isOpen = open === c.id
          return (
            <div key={c.id} className={`bg-white rounded-2xl border overflow-hidden transition-all ${
                   isOpen ? 'border-royal/30 shadow-[0_2px_8px_rgba(0,61,165,0.07)]' : 'border-slate-200/80'
                 }`}>
              <button
                onClick={() => setOpen(isOpen ? null : c.id)}
                className="w-full flex flex-wrap items-center justify-between gap-4 px-5 py-4 text-left hover:bg-slate-50/70 transition-colors"
              >
                <div className="flex items-start gap-3 min-w-0">
                  {isOpen ? <ChevronDown size={17} className="text-royal mt-1 flex-shrink-0" />
                          : <ChevronRight size={17} className="text-slate-300 mt-1 flex-shrink-0" />}
                  <div className="min-w-0">
                    <h3 className="font-display font-semibold text-ink text-[15px] sm:text-[17px] leading-tight">{c.name}</h3>
                    <p className="text-[12px] text-slate-500 mt-1">
                      Home D{c.homeDistrict} · Supporting{' '}
                      <strong className="font-data text-slate-700 font-medium">{c.supports.join(' · ')}</strong>
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
                        <tr className="eyebrow text-slate-400 border-b border-slate-200">
                          <th className="text-left font-medium pb-2">District</th>
                          {HEADLINE.map((m) => (
                            <th key={m.id} className="text-right font-medium pb-2 px-2">{shortLabel(m)}</th>
                          ))}
                          <th className="text-right font-medium pb-2 pl-2">Clubs</th>
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
                                <Link to={`/district/${d}/overview`} className="font-semibold text-royal hover:underline">
                                  {d}
                                </Link>
                                {sub && (
                                  <span className="ml-1.5 text-[9px] text-[#B85400] font-semibold"
                                        title={`Figures sourced from column ${sub}`}>
                                    ⓘ {sub}
                                  </span>
                                )}
                              </td>
                              {HEADLINE.map((m) => (
                                <td key={m.id} className="py-2.5 px-2 text-right tabular-nums text-slate-700">
                                  {fmt(actualFor(m.id, 'district', d).value, m.unit)}
                                </td>
                              ))}
                              <td className="py-2.5 pl-2 text-right tabular-nums text-slate-400">{clubs || '—'}</td>
                              <td className="py-2.5 pl-1 text-right">
                                <Link to={`/district/${d}/overview`} className="text-slate-300 hover:text-royal inline-block">
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

      <div className="mt-5 space-y-2">
        <DataNote tone="slate">
          <strong>D{ZONE.rrfc.homeDistrict} appears twice</strong> — it is RRFC {ZONE.rrfc.name}&apos;s home
          district and is also supported by ARRFC Jhunjhunuwala. The zone total sums the {DISTRICTS.length}{' '}
          districts directly, so it is counted once. Adding the coordinator rows together would double-count it.
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
      <p className="eyebrow text-slate-400" style={{ fontSize: '0.5625rem' }}>{label}</p>
      <p className="font-data text-[15px] font-semibold text-ink mt-0.5">{value}</p>
    </div>
  )
}
