import { useState, useSyncExternalStore } from 'react'
import { MessageSquare, RotateCcw, Save } from 'lucide-react'
import { useGoals } from '@/context/GoalsProvider'
import { setTarget, targetIn, subscribe, getTargets } from '@/data/dishaTargets'
import { GOALS_YEAR, PREVIOUS_YEAR } from '@/data/disha'
import { DATA_AS_OF } from '@/data/zone6'
import { percentAchieved, STATUS_META } from '@/lib/rollup'
import { fmt, pct } from '@/lib/format'
import { AREAS, metricsInArea } from '@/data/metrics'
import { AREA_COLOR } from '@/data/headline'
import { StatusPill, YesNoPill, Card, Bar } from './Bits'

/**
 * Status without pace, as ReportGoalForm and the monthly report's "% of target" column.
 *
 * goalStatus() judges against MONTHS_ELAPSED, which is right for progress inside the running
 * year and wrong here: achieved is the workbook figure for PREVIOUS_YEAR and the target is for
 * GOALS_YEAR, a year in which no month has elapsed. Against a nine-month pace an ambitious
 * target turns the row red and a modest one reads "On Track" for a year yet to begin. The plain
 * ratio, nothing else.
 *
 * No lower-is-better branch: percentAchieved() has already inverted those, so 100 is the good
 * end either way and a second inversion here would score every one of them achieved.
 */
const statusOf = (percent, achieved) => {
  // A null percent has two causes and they read differently: a reported figure with no target is
  // the goal-setting event not yet held, not missing data.
  if (percent == null) return achieved == null ? 'nodata' : 'notset'
  return percent >= 100 ? 'achieved' : percent >= 75 ? 'ontrack' : percent >= 50 ? 'atrisk' : 'behind'
}

/**
 * Goal entry + display for one level's own metrics.
 *
 * Target is entered here and goes to the single target store (src/data/dishaTargets) under a
 * scope of its own — `${scope}-metric`. These are workbook metric ids; the district and club
 * targets in that store are keyed by monthly-report field id, and the two id spaces do not
 * overlap, so they must not share a scope either.
 *
 * Achieved is the reported figure, overridable here. The override and the row comment live in
 * the local entry store and are seen by this screen alone — no other view reads them.
 */
export default function GoalTable({ scope, scopeId, metrics, editable = true }) {
  const { read, patch, clearScope, notify } = useGoals()
  const [openComment, setOpenComment] = useState(null)
  // Redraw whenever a target is set anywhere. The snapshot object identity changes on every
  // write, so overwriting an existing target refreshes too — a count would not, and the row
  // beside the input would sit on the figure typed by the first keystroke.
  useSyncExternalStore(subscribe, getTargets, getTargets)

  const targetScope = `${scope}-metric`
  const targetOf = (metricId) => targetIn(targetScope, scopeId, metricId)

  const groups = AREAS.map((a) => ({ a, rows: metricsInArea(metrics, a.id) })).filter((g) => g.rows.length)
  // Said in the header rather than left for the reader to infer from a column of dashes.
  const withTargets = metrics.filter((m) => targetOf(m.id) != null).length

  const onTarget = (metricId) => (e) => {
    const raw = e.target.value
    if (raw === '') return setTarget(targetScope, scopeId, metricId, null)
    const v = Number(raw)
    // Nothing divides by a zero target, so a 0 would sit in the row looking set while never
    // scoring. Refused here rather than stored and ignored — as on the district form.
    if (!Number.isFinite(v) || v <= 0) return
    setTarget(targetScope, scopeId, metricId, v)
  }

  const onAchieved = (metricId) => (e) => {
    const raw = e.target.value
    if (raw === '') return patch(scope, scopeId, metricId, 'actual', null)
    const v = Number(raw)
    if (!Number.isFinite(v) || v < 0) return      // reject negatives and junk at the keypress
    patch(scope, scopeId, metricId, 'actual', v)
  }

  // Clears this level only. Targets set on a district or club page live in the same store and
  // are none of this card's business.
  const clearHere = () => {
    metrics.forEach((m) => setTarget(targetScope, scopeId, m.id, null))
    clearScope(scope, scopeId)
    notify(`Cleared for this ${scope} — targets set elsewhere are untouched.`)
  }

  return (
    <Card
      title="Goals"
      sub={`${metrics.length} metrics · ${
        withTargets ? `${withTargets} with a target set for ${GOALS_YEAR}` : `no targets set yet for ${GOALS_YEAR}`
      } · achieved is the workbook figure as at ${DATA_AS_OF}, within ${PREVIOUS_YEAR}`}
      right={
        editable && (
          <div className="flex gap-2">
            <button
              onClick={clearHere}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <RotateCcw size={13} /> Clear
            </button>
            <button
              onClick={() => notify('Targets saved on this device — this screen is the only one that reads them.')}
              className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg text-white shadow-sm hover:opacity-90 transition-opacity"
              style={{ background: '#003DA5' }}
            >
              <Save size={13} /> Save Goals
            </button>
          </div>
        )
      }
    >
      <div className="overflow-x-auto -mx-5">
        <table className="w-full text-sm min-w-[760px]">
          <thead>
            <tr className="text-[10px] uppercase tracking-widest text-slate-400 border-b border-slate-200">
              <th className="text-left font-bold pb-2.5 pl-5 pr-3">Goal</th>
              <th className="text-right font-bold pb-2.5 px-3 w-28">Target</th>
              <th className="text-right font-bold pb-2.5 px-3 w-32">Achieved</th>
              {/* Neither column may read as progress made inside GOALS_YEAR: this is last
                  year's figure measured against next year's target — how far the target
                  reaches beyond where the zone already stands. Same wording as the report. */}
              <th className="text-left font-bold pb-2.5 px-3 w-44">% of target</th>
              <th className="text-left font-bold pb-2.5 px-3 w-28">Status</th>
              <th className="text-center font-bold pb-2.5 px-2 w-20">Near&nbsp;target</th>
              <th className="w-10 pr-4" />
            </tr>
          </thead>

          {groups.map(({ a, rows }) => (
            <tbody key={a.id} className="divide-y divide-slate-100">
              <tr>
                <td colSpan={7} className="pt-5 pb-1.5 pl-5">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-1 w-5 rounded-full" style={{ background: AREA_COLOR[a.id] }} />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                      {a.label}
                    </span>
                    <span className="text-[10px] text-slate-300">{rows.length}</span>
                  </span>
                </td>
              </tr>

              {rows.map((m) => {
                const g = read(scope, scopeId, m.id)
                const isYesNo = m.unit === 'yesno'
                const t = isYesNo ? null : targetOf(m.id)
                const percent = percentAchieved(t, g.actual, m.higherIsBetter !== false)
                const status = statusOf(percent, g.actual)
                const open = openComment === m.id

                return (
                  <tr key={m.id} className={`align-middle transition-colors ${open ? 'bg-blue-50/40' : 'hover:bg-slate-50/70'}`}>
                    <td className="py-2.5 pl-5 pr-3">
                      <span className="text-slate-700 font-medium">{m.label}</span>
                      {g.total > 0 && g.reporting < g.total && (
                        <span className="text-[10px] text-slate-400 ml-1.5 whitespace-nowrap">
                          ({g.reporting}/{g.total} reporting)
                        </span>
                      )}
                      {g.comment && !open && (
                        <p className="text-[11px] text-slate-400 italic truncate max-w-[260px]">{g.comment}</p>
                      )}
                    </td>

                    {/* Target — set here, for GOALS_YEAR. A Yes/No metric has nothing to
                        divide by, so it takes no target rather than a meaningless 1. */}
                    <td className="py-2.5 px-3 text-right">
                      {isYesNo ? (
                        <span className="text-slate-300 tabular-nums">—</span>
                      ) : editable ? (
                        <input
                          type="number" min="1" inputMode="numeric"
                          value={t ?? ''}
                          onChange={onTarget(m.id)}
                          placeholder="—"
                          title={`The zone target agreed at the goal-setting event, for ${GOALS_YEAR}. It must be more than zero — a zero target cannot be scored against.`}
                          className={`w-28 text-right tabular-nums font-semibold rounded-lg border px-2.5 py-1.5 text-sm transition-colors
                                      focus:outline-none focus:ring-2 focus:ring-[#003DA5]/25 focus:border-[#003DA5]
                                      ${t != null
                                        ? 'border-[#003DA5]/40 bg-[#003DA5]/[0.04] text-slate-900'
                                        : 'border-slate-200 text-slate-800 hover:border-slate-300'}`}
                        />
                      ) : (
                        <span className="tabular-nums text-slate-500">{fmt(t, m.unit)}</span>
                      )}
                    </td>

                    {/* Achieved — last year's workbook figure, the baseline a target is set against */}
                    <td className="py-2.5 px-3 text-right">
                      {isYesNo ? (
                        // "0 of 9" and "nobody answered" are different answers. Only the first
                        // is a count; the second has no denominator worth printing.
                        g.reporting ? (
                          <span className="text-slate-600 text-xs font-semibold tabular-nums">
                            {g.actual} of {g.total}
                          </span>
                        ) : (
                          <span className="text-slate-300" title="not collected">—</span>
                        )
                      ) : editable ? (
                        <input
                          type="number" min="0" inputMode="numeric"
                          value={g.actual ?? ''}
                          onChange={onAchieved(m.id)}
                          placeholder="—"
                          title={g.isOverridden ? 'Entered here, overriding the reported figure' : `From the ${DATA_AS_OF} workbook`}
                          className={`w-28 text-right tabular-nums font-semibold rounded-lg border px-2.5 py-1.5 text-sm transition-colors
                                      focus:outline-none focus:ring-2 focus:ring-[#003DA5]/25 focus:border-[#003DA5]
                                      ${g.isOverridden
                                        ? 'border-amber-300 bg-amber-50 text-amber-900'
                                        : 'border-slate-200 text-slate-800 hover:border-slate-300'}`}
                        />
                      ) : (
                        <span className="tabular-nums text-slate-800 font-semibold">{fmt(g.actual, m.unit)}</span>
                      )}
                    </td>

                    {/* The baseline against the new target, not progress within GOALS_YEAR */}
                    <td className="py-2.5 px-3">
                      {percent == null ? (
                        <span className="text-slate-300 text-xs">not scored</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          {/* The shared Bar, not a local one: it floors as well as ceilings the
                              width, so a negative figure cannot paint a full track. */}
                          <div className="flex-1"><Bar value={percent} max={100} color={STATUS_META[status].color} /></div>
                          <span className="w-10 text-right text-xs font-bold tabular-nums text-slate-700">
                            {pct(percent)}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* No target is not "no data" — the achieved figure may well be there, and
                        statusOf tells the two apart, so the pill can say which is missing. */}
                    <td className="py-2.5 px-3">
                      {isYesNo ? <YesNoPill value={g.reporting ? g.actual > 0 : null} />
                        : <StatusPill status={status} />}
                    </td>

                    <td className="py-2.5 px-2 text-center font-bold text-xs">
                      {/* Same 90% test the monthly report uses. Reading Y off the status pill put
                          the threshold at 75 here and 90 there, so one row could answer the same
                          question differently on two screens. percentAchieved has already
                          inverted lower-is-better, so one comparison covers both. */}
                      {percent == null ? (
                        <span className="text-slate-300">—</span>
                      ) : (
                        <span className={percent >= 90 ? 'text-emerald-600' : 'text-rose-600'}>
                          {percent >= 90 ? 'Y' : 'N'}
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 pr-4 text-right">
                      <button
                        onClick={() => setOpenComment(open ? null : m.id)}
                        title={g.comment || 'Add a comment'}
                        className={`p-1.5 rounded-lg transition-colors ${
                          g.comment || open
                            ? 'text-[#003DA5] bg-blue-50'
                            : 'text-slate-300 hover:text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <MessageSquare size={14} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          ))}
        </table>
      </div>

      {openComment && (
        <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-3">
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Comment — {metrics.find((m) => m.id === openComment)?.label}
            </span>
            <div className="flex items-center gap-2 mt-1.5">
              <input
                autoFocus
                value={read(scope, scopeId, openComment).comment}
                onChange={(e) => patch(scope, scopeId, openComment, 'comment', e.target.value)}
                placeholder="Feeds the Comments column of the monthly coordinator report"
                className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-[#003DA5]/25 focus:border-[#003DA5]"
              />
              <button onClick={() => setOpenComment(null)}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-2">
                Done
              </button>
            </div>
          </label>
        </div>
      )}
    </Card>
  )
}
