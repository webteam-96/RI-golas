import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, ChevronDown, Star } from 'lucide-react'
import { ZONE, ARRFC_ROLE_LONG } from '@/data/zone6'
import { DISHA_DISTRICTS, districtsIn } from '@/data/disha'
import { REPORT_CATEGORIES, REPORT_FIELDS, fieldsInCategory, achievedFor } from '@/data/reportFields'
import { targetValue } from '@/data/dishaTargets'
import { dishaNumber } from '@/lib/disha'
import { Kpi, DataNote } from './Bits'
import GoalMatrix from './GoalMatrix'

const ZONE6 = districtsIn(2)                       // the ten real Zone 6 districts
const byNumber = (n) => DISHA_DISTRICTS.find((d) => d.number === String(n)) ?? null

// One headline field per category, for the summary figures on each card.
const LEAD = {
  membership: 'membersStart',
  foundation: 'annualFund',
  publicimage: 'piEvents',
  projects: 'serviceProjects',
  newgen: 'rotaractClubs',
}
const leadField = (catId) => REPORT_FIELDS.find((f) => f.id === LEAD[catId])

const sumOver = (field, districts) => {
  let s = null
  for (const d of districts) {
    const v = achievedFor(field, d)
    if (v != null) s = (s ?? 0) + v
  }
  return s
}

/**
 * Coordinator → the districts they support → that district's figures, on the same data and
 * the same matrix as the Overview. Expanding a coordinator opens the five categories over
 * their districts.
 */
export default function CoordinatorList() {
  const [open, setOpen] = useState(ZONE.coordinators[0].id)

  const assigned = new Set(ZONE.coordinators.flatMap((c) => c.supports))
  const unassigned = ZONE6.filter((d) => !assigned.has(d.number))

  return (
    <>
      {/* Zone 6 totals — the same counter as every other page */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        {REPORT_CATEGORIES.map((c) => {
          const f = leadField(c.id)
          return (
            <Kpi key={c.id} label={c.label} sub={f?.label}
                 value={dishaNumber(sumOver(f, ZONE6), f?.unit) ?? '—'}
                 tone={c.id === 'foundation' ? 'gold' : c.id === 'membership' ? 'blue'
                       : c.id === 'publicimage' ? 'purple' : c.id === 'projects' ? 'green' : 'royal'} />
          )
        })}
      </div>

      {/* RRFC — leads the zone, so the figures above are already theirs */}
      <div className="rounded-2xl p-5 mb-6 bg-white border border-gold/40 shadow-[0_1px_2px_rgba(10,26,51,0.04)]
                      relative overflow-hidden">
        <span className="absolute left-0 top-0 bottom-0 w-1 bg-gold" />
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
              responsible for all {ZONE6.length} districts
            </p>
          </div>
        </div>
      </div>

      <p className="eyebrow text-slate-400 mb-2.5 px-1">ARRFC — {ARRFC_ROLE_LONG}</p>

      <div className="space-y-3">
        {ZONE.coordinators.map((c) => {
          const isOpen = open === c.id
          const districts = c.supports.map(byNumber).filter(Boolean)
          return (
            <div key={c.id} className={`bg-white rounded-2xl border overflow-hidden transition-all ${
                   isOpen ? 'border-royal/30 shadow-[0_2px_8px_rgba(0,61,165,0.07)]' : 'border-slate-200/80'
                 }`}>
              <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50/70 transition-colors">
                <div className="flex items-start gap-3 min-w-0">
                  <button onClick={() => setOpen(isOpen ? null : c.id)}
                          title={isOpen ? 'Collapse' : 'Expand districts'}
                          className="mt-1 flex-shrink-0">
                    {isOpen ? <ChevronDown size={17} className="text-royal" />
                            : <ChevronRight size={17} className="text-slate-300 hover:text-slate-500" />}
                  </button>
                  <div className="min-w-0">
                    <Link to={`/ri/coordinators/${c.id}`}
                          className="font-display font-semibold text-ink hover:text-royal hover:underline text-[15px] sm:text-[17px] leading-tight">
                      {c.name}
                    </Link>
                    <p className="text-[12px] text-slate-500 mt-1">
                      Home D{c.homeDistrict} · Supporting{' '}
                      <strong className="font-data text-slate-700 font-medium">{c.supports.join(' · ')}</strong>
                    </p>
                  </div>
                </div>
                <button onClick={() => setOpen(isOpen ? null : c.id)}
                        className="flex gap-5 text-right flex-shrink-0">
                  {REPORT_CATEGORIES.slice(0, 3).map((cat) => {
                    const f = leadField(cat.id)
                    return (
                      <div key={cat.id}>
                        <p className="eyebrow text-slate-400" style={{ fontSize: '0.5625rem' }}>{cat.label}</p>
                        <p className="font-data text-[15px] font-semibold text-ink mt-0.5">
                          {dishaNumber(sumOver(f, districts), f?.unit) ?? '—'}
                        </p>
                      </div>
                    )
                  })}
                </button>
              </div>

              {isOpen && (
                <div className="border-t border-slate-100 px-5 py-4 bg-slate-50/60">
                  <GoalMatrix
                    categories={REPORT_CATEGORIES.map((cat) => ({ id: cat.id, label: cat.label }))}
                    fields={(catId) => fieldsInCategory(catId).map((f) => ({ ...f }))}
                    entities={districts.map((d) => ({ id: d.id, label: d.number, to: `/ri/districts/${d.id}` }))}
                    achieved={(f, e) => achievedFor(f, DISHA_DISTRICTS.find((d) => d.id === e.id))}
                    target={(f, e) => targetValue(e.id, f.id)}
                    format={dishaNumber}
                    title={`${c.name} — districts`}
                    sub={`${districts.length} supported · achieved over target`}
                    totalLabel="Supported"
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-5 space-y-2">
        {unassigned.length > 0 && (
          <DataNote>
            <strong>
              District{unassigned.length > 1 ? 's' : ''} {unassigned.map((d) => d.number).join(', ')}
            </strong>{' '}
            {unassigned.length > 1 ? 'have' : 'has'} no ARRFC in the coordinator list supplied. The RRFC
            covers {unassigned.length > 1 ? 'them' : 'it'} as part of the zone, but no assistant is named.
          </DataNote>
        )}
        <DataNote tone="slate">
          Zone totals sum the {ZONE6.length} districts directly, never through the coordinator rows —
          D{ZONE.rrfc.homeDistrict} is both the RRFC&apos;s home district and an ARRFC&apos;s supported
          district, so adding the rows together would count it twice.
        </DataNote>
      </div>
    </>
  )
}
