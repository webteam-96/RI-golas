import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PREVIOUS_YEAR, GOALS_YEAR } from '@/data/disha'
import { TARGETS_ARE_PROVISIONAL } from '@/data/dishaTargets'
import { Card } from './Bits'

const OK = '#009739', WARN = '#B85400', BAD = '#C8102E', NONE = '#94A3B8'

/** Colour the achieved figure by where it stands, inverted for fields where less is better. */
export const pctTone = (pct, lowerIsBetter) => {
  if (pct == null) return NONE
  if (lowerIsBetter) return pct <= 100 ? OK : pct <= 133 ? WARN : BAD
  return pct >= 100 ? OK : pct >= 75 ? WARN : BAD
}

/**
 * Goal progress as a matrix: the fields of one category down the left, the entities being
 * compared across the top, and both numbers in every cell — what has been achieved and what
 * it is measured against. A figure on its own says nothing about whether it is enough.
 *
 * Used at every level. Only the entities change: districts under a zone, clubs under a
 * district, the districts a coordinator supports.
 *
 * Required props
 *   categories  [{ id, label, badge? }]
 *   fields      (categoryId) => [{ id, label, unit, lowerIsBetter?, muted? }]
 *   entities    [{ id, label, to? }]
 *   achieved    (field, entity) => number | null
 *   target      (field, entity) => number | null
 *   format      (value, unit) => string | null
 */
export default function GoalMatrix({
  categories, fields, entities, achieved, target, format,
  // The right-hand column always reads Total. It holds the same thing at every level, so
  // naming it after whatever is being summed only made it drift page to page.
  title, sub, right, entityHeading = 'Field', totalLabel = 'Total', footer,
  // Most callers feed figures from the DISHA seed, which does state its period — hence the
  // default. Callers reading src/data/clubs.js cannot claim it: that file carries no
  // reporting period anywhere, so they pass a label that does not assert one.
  achievedLabel = `Achieved in ${PREVIOUS_YEAR}`,
}) {
  const [catId, setCatId] = useState(categories[0]?.id)
  const rows = fields(catId)
  const category = categories.find((c) => c.id === catId) ?? categories[0]

  const totals = (f) => {
    let a = null, t = null
    for (const e of entities) {
      const av = achieved(f, e)
      const tv = target(f, e)
      if (av != null) a = (a ?? 0) + av
      if (tv != null) t = (t ?? 0) + tv
    }
    return { a, t }
  }

  return (
    <>
      <div className="flex gap-1.5 flex-wrap mb-4">
        {categories.map((c) => {
          const on = c.id === catId
          return (
            <button
              key={c.id}
              onClick={() => setCatId(c.id)}
              className={`px-5 py-2.5 rounded-xl text-[13px] font-semibold border transition-all ${
                on ? 'bg-royal text-white border-royal shadow-sm'
                   : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-ink'
              }`}
            >
              {c.label}
            </button>
          )
        })}
      </div>

      <Card title={title ?? category.label} sub={sub} right={right}>
        {/* Every cell reads the same way, so the years — and the provenance of the second figure —
            are stated once for the table rather than on all 27 rows. Without the first sentence the
            achieved figure, which is last year's reported position, is read as progress against the
            year the targets are for. Without the second, a figure this app worked out is read as a
            target the client supplied, which is the one mistake this screen must not make. */}
        <p className="text-[11px] text-slate-400 mb-3">
          {achievedLabel}, over the target for {GOALS_YEAR}.{' '}
          {TARGETS_ARE_PROVISIONAL &&
            `Targets are provisional — worked out from each column's own reported figure, not from the
             portal, which seeds none because governors set them at the goal-setting event. A target
             entered on a Goals screen replaces the provisional one.`}
        </p>
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-[13px] border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="eyebrow text-slate-400 text-left py-3 pl-5 pr-4 sticky left-0 z-30 bg-white
                               border-b-2 border-slate-200 min-w-[230px] shadow-[3px_0_6px_-3px_rgba(10,26,51,0.16)]">
                  {entityHeading}
                </th>
                {entities.map((e) => (
                  <th key={e.id} className="py-3 px-3 min-w-[92px] text-right border-b-2 border-slate-200">
                    {e.to ? (
                      <Link to={e.to} className="font-data text-[13px] font-semibold text-ink hover:text-royal hover:underline">
                        {e.label}
                      </Link>
                    ) : (
                      <span className="font-data text-[13px] font-semibold text-ink">{e.label}</span>
                    )}
                  </th>
                ))}
                <th className="eyebrow text-right py-3 px-4 min-w-[104px] border-b-2 border-royal text-royal bg-royal/[0.06]">
                  {totalLabel}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((f, i) => {
                const tot = totals(f)
                // Opaque, not a tint. A sticky cell with a translucent background lets the
                // columns scrolling underneath show through, which reads as the field name
                // vanishing the moment you scroll sideways.
                const zebra = i % 2 ? 'bg-[#F8FAFC]' : 'bg-white'
                return (
                  <tr key={f.id} className="group">
                    <td className={`py-3 pl-5 pr-4 text-slate-700 sticky left-0 z-20 border-b border-slate-100
                                    ${zebra} group-hover:bg-[#EAF0FA]
                                    shadow-[3px_0_6px_-3px_rgba(10,26,51,0.16)]`}>
                      {f.label}
                      {f.muted && <span className="ml-2 text-[10px] text-slate-300">{f.muted}</span>}
                    </td>
                    {entities.map((e) => (
                      <Cell key={e.id} zebra={zebra} unit={f.unit} format={format}
                            lowerIsBetter={f.lowerIsBetter}
                            achieved={achieved(f, e)} target={target(f, e)} />
                    ))}
                    <td className="py-3 px-4 text-right border-b border-slate-100 bg-royal/[0.06] whitespace-nowrap">
                      <span className="font-data text-[13px] font-bold text-royal block leading-tight">
                        {format(tot.a, f.unit) ?? <span className="text-slate-300 font-normal">—</span>}
                      </span>
                      {tot.t != null && (
                        <span className="font-data text-[10px] text-slate-400 block leading-tight mt-0.5">
                          of {format(tot.t, f.unit)}
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {footer}
      </Card>
    </>
  )
}

function Cell({ achieved, target, unit, format, zebra, lowerIsBetter }) {
  const pct = achieved != null && target ? (achieved / target) * 100 : null
  return (
    <td className={`py-3 px-3 text-right border-b border-slate-100 whitespace-nowrap ${zebra} group-hover:bg-[#EAF0FA]`}>
      {achieved == null ? (
        <span className="font-data text-[13px] text-slate-300 block leading-tight">—</span>
      ) : (
        <span className="font-data text-[13px] font-semibold block leading-tight"
              style={{ color: pctTone(pct, lowerIsBetter) }}>
          {format(achieved, unit)}
        </span>
      )}
      {/* The target stands on its own. Most fields carry no achieved figure yet, and nesting
          this inside the achieved branch hid every entered target behind a dash — while the
          Total column, which sums targets separately, still printed it. */}
      {target != null && (
        <span className="font-data text-[10px] text-slate-400 block leading-tight mt-0.5">
          of {format(target, unit)}
        </span>
      )}
    </td>
  )
}
