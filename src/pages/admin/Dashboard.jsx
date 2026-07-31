import { useState, Fragment } from 'react'
import {
  DISHA_ZONES, DISHA_DISTRICTS, DISHA_CATEGORIES, GOALS_YEAR, PREVIOUS_YEAR,
  districtsIn, prevValue,
} from '@/data/disha'
import { targetValue } from '@/data/dishaTargets'
import { sections, dishaNumber, totalFor, TARGET_FIELDS } from '@/lib/disha'
import { STATUS_META } from '@/lib/rollup'
import { LevelBanner, Kpi, Card, DataNote } from '@/components/Bits'

const num = (v) => {
  const n = typeof v === 'string' ? parseFloat(v) : v
  return typeof n === 'number' && Number.isFinite(n) ? n : null
}

const toneFor = (pct) =>
  pct == null ? STATUS_META.nodata.color
  : pct >= 100 ? STATUS_META.achieved.color
  : pct >= 75 ? STATUS_META.atrisk.color
  : STATUS_META.behind.color

/**
 * Consolidated goal progress. Fields down the left, districts across the top, and every cell
 * carries both numbers — what the district has achieved and what it is aiming at — because a
 * figure on its own says nothing about whether it is enough.
 */
export default function AdminDashboard() {
  const [categoryId, setCategoryId] = useState(2)      // open on TRF
  const [zoneId, setZoneId] = useState(null)           // null = both zones

  const districts = zoneId ? districtsIn(zoneId) : DISHA_DISTRICTS
  const ids = districts.map((d) => d.id)
  const groups = sections(categoryId)
  const category = DISHA_CATEGORIES.find((c) => c.id === categoryId)

  return (
    <>
      <LevelBanner
        eyebrow={`Goal setting ${GOALS_YEAR}`}
        title="Goal Progress"
        sub={`${DISHA_ZONES.map((z) => z.name).join(' & ')} · ${DISHA_DISTRICTS.length} districts · achieved against target, field by field`}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Kpi label="Districts" value={DISHA_DISTRICTS.length} tone="royal"
             sub={DISHA_ZONES.map((z) => `${z.name.replace('Zone ', 'Z')} ${districtsIn(z.id).length}`).join(' · ')} />
        <Kpi label="Categories" value={DISHA_CATEGORIES.length} tone="gold"
             sub={DISHA_CATEGORIES.map((c) => c.name).join(' · ')} />
        <Kpi label="Fields tracked" value={TARGET_FIELDS.length} tone="purple" sub="per district" />
        <Kpi label="Rotary Year" value={GOALS_YEAR} tone="slate" sub={`against ${PREVIOUS_YEAR}`} />
      </div>

      {/* Category listing — picking one swaps the rows, the districts stay put */}
      <div className="flex gap-1 flex-wrap bg-white border border-slate-200/80 rounded-xl p-1.5 mb-4 shadow-sm">
        {DISHA_CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategoryId(c.id)}
            className={`px-4 py-2.5 rounded-lg text-[13px] font-semibold transition-all ${
              categoryId === c.id ? 'bg-royal text-white shadow-sm' : 'text-slate-500 hover:text-ink hover:bg-slate-50'
            }`}
          >
            {c.name}
            <span className={`ml-2 text-[10px] ${categoryId === c.id ? 'text-blue-200' : 'text-slate-400'}`}>
              {sections(c.id).reduce((n, s) => n + s.fields.filter((f) => f.dataType !== 'text').length, 0)}
            </span>
          </button>
        ))}
      </div>

      <Card
        title={`${category.name} — achieved vs target`}
        sub={`${districts.length} districts across · achieved on top, target beneath`}
        right={
          <div className="flex gap-0.5 bg-slate-100/80 rounded-xl p-1">
            <ZoneTab active={zoneId === null} onClick={() => setZoneId(null)}>Both</ZoneTab>
            {DISHA_ZONES.map((z) => (
              <ZoneTab key={z.id} active={zoneId === z.id} onClick={() => setZoneId(z.id)}>{z.name}</ZoneTab>
            ))}
          </div>
        }
      >
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b-2 border-slate-200 bg-slate-50">
                <th className="eyebrow text-slate-400 text-left py-3 pl-5 pr-3 sticky left-0 bg-slate-50 min-w-[260px]">
                  Field
                </th>
                {districts.map((d) => (
                  <th key={d.id} className="py-2.5 px-2 min-w-[86px] text-right">
                    <span className="font-data text-[12px] font-semibold text-slate-700 block">{d.number}</span>
                    <span className="text-[9px] text-slate-400 font-normal block truncate max-w-[80px]"
                          title={d.governor}>
                      {(d.governor ?? '').replace(/^Rtn\.?\s*(Dr\.|Ms\.|MD\.?|CA)?\s*/i, '')}
                    </span>
                  </th>
                ))}
                <th className="eyebrow text-white text-right py-3 px-3 min-w-[96px] bg-royal">Zone</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((section) => (
                <Fragment key={section.name}>
                  <tr>
                    <td colSpan={districts.length + 2}
                        className="eyebrow text-royal bg-royal/[0.05] py-2 pl-5 sticky left-0">
                      {section.name}
                    </td>
                  </tr>
                  {section.fields.filter((f) => f.dataType !== 'text').map((f) => {
                    const totAch = totalFor(f.id, ids)
                    const totTgt = ids.reduce((s, id) => {
                      const t = targetValue(id, f.id)
                      return t == null ? s : (s ?? 0) + t
                    }, null)
                    const totPct = totAch != null && totTgt ? (totAch / totTgt) * 100 : null
                    return (
                      <tr key={f.id} className="border-b border-slate-100 hover:bg-slate-50/70 align-top">
                        <td className="py-2.5 pl-5 pr-3 text-slate-700 sticky left-0 bg-white">{f.label}</td>
                        {districts.map((d) => (
                          <Cell key={d.id}
                                achieved={num(prevValue(d.id, f.id))}
                                target={targetValue(d.id, f.id)}
                                unit={f.unit} />
                        ))}
                        <td className="py-2.5 px-3 text-right bg-royal/[0.04] whitespace-nowrap">
                          <span className="font-data text-[12px] font-bold text-royal block">
                            {dishaNumber(totAch, f.unit) ?? <span className="text-slate-300">—</span>}
                          </span>
                          {totTgt != null && (
                            <span className="font-data text-[10px] text-slate-400 block">
                              / {dishaNumber(totTgt, f.unit)}
                              {totPct != null && <span className="ml-1">{Math.round(totPct)}%</span>}
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mt-5 space-y-2">
        <DataNote>
          <strong>Targets shown are placeholders.</strong> The portal holds none — District Governors
          set them live at the goal-setting event. These are derived from each district&apos;s own
          existing figure so the layout can be read, and are replaced the moment real targets arrive.
        </DataNote>
        <DataNote tone="slate">
          Achieved is the {PREVIOUS_YEAR} figure on file. A dash means the source cell was blank, which
          is not zero and is left out of the zone total. Yes/No and free-text fields are not shown here.
        </DataNote>
      </div>
    </>
  )
}

/** Achieved on top, target beneath, with a hairline showing how far along it is. */
function Cell({ achieved, target, unit }) {
  const pct = achieved != null && target ? (achieved / target) * 100 : null
  if (achieved == null && target == null)
    return <td className="py-2.5 px-2 text-right text-slate-300">—</td>

  return (
    <td className="py-2.5 px-2 text-right whitespace-nowrap">
      <span className="font-data text-[12px] font-semibold text-ink block leading-tight">
        {dishaNumber(achieved, unit) ?? <span className="text-slate-300 font-normal">—</span>}
      </span>
      <span className="font-data text-[10px] text-slate-400 block leading-tight">
        {target != null ? `/ ${dishaNumber(target, unit)}` : ''}
      </span>
      {pct != null && (
        <span className="mt-1 block h-[3px] rounded-full bg-slate-100 overflow-hidden">
          <span className="block h-[3px] rounded-full"
                style={{ width: `${Math.min(pct, 100)}%`, background: toneFor(pct) }} />
        </span>
      )}
    </td>
  )
}

function ZoneTab({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all whitespace-nowrap ${
        active ? 'bg-royal text-white shadow-sm' : 'text-slate-500 hover:text-ink hover:bg-white'
      }`}
    >
      {children}
    </button>
  )
}
