import { useState } from 'react'
import { MessageSquare, RotateCcw, Save } from 'lucide-react'
import { useGoals } from '@/context/GoalsProvider'
import { percentAchieved, goalStatus, onTrackYN, STATUS_META } from '@/lib/rollup'
import { fmt, pct } from '@/lib/format'
import { AREAS, metricsInArea } from '@/data/metrics'
import { AREA_COLOR } from '@/data/headline'
import { StatusPill, YesNoPill, Card } from './Bits'

/**
 * Goal entry + display. One component, four scopes.
 *
 * Target is read-only — it comes from the goal-setting process, not from this screen. What is
 * entered here is the achieved figure, plus a comment that feeds section 6 of the coordinator
 * report.
 *
 * `contextLabel` shows a second, read-only target for comparison — a district sees the zone's
 * beside its own. `childScope`/`childIds` show the rolled-up commitment of the level below,
 * BESIDE this level's target, never instead of it. The gap is the interesting part.
 */
export default function GoalTable({
  scope, scopeId, metrics, editable = true,
  childScope, childIds, childLabel = 'Children',
  contextLabel, contextScope, contextId,
}) {
  const { read, patch, reset, rolledUpTarget, notify } = useGoals()
  const [openComment, setOpenComment] = useState(null)

  const showChild = !!(childScope && childIds?.length)
  const showContext = !!(contextLabel && contextScope && contextId)
  const groups = AREAS.map((a) => ({ a, rows: metricsInArea(metrics, a.id) })).filter((g) => g.rows.length)
  const extraCols = (showChild ? 1 : 0) + (showContext ? 1 : 0)

  const onAchieved = (metricId) => (e) => {
    const raw = e.target.value
    if (raw === '') return patch(scope, scopeId, metricId, 'actual', null)
    const v = Number(raw)
    if (!Number.isFinite(v) || v < 0) return      // reject negatives and junk at the keypress
    patch(scope, scopeId, metricId, 'actual', v)
  }

  return (
    <Card
      title="Goals"
      sub={`${metrics.length} metrics · target is fixed; enter what has been achieved and it rolls up immediately`}
      right={
        editable && (
          <div className="flex gap-2">
            <button
              onClick={() => { reset(); notify('Entries cleared — achieved figures back to reported data.') }}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <RotateCcw size={13} /> Clear
            </button>
            <button
              onClick={() => notify('Goals saved — District, Zone and RI views updated.')}
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
              {showChild && <th className="text-right font-bold pb-2.5 px-3 w-28">{childLabel}</th>}
              {showContext && <th className="text-right font-bold pb-2.5 px-3 w-28">{contextLabel}</th>}
              <th className="text-right font-bold pb-2.5 px-3 w-32">Achieved</th>
              <th className="text-left font-bold pb-2.5 px-3 w-44">Progress</th>
              <th className="text-left font-bold pb-2.5 px-3 w-28">Status</th>
              <th className="text-center font-bold pb-2.5 px-2 w-14">On&nbsp;Track</th>
              <th className="w-10 pr-4" />
            </tr>
          </thead>

          {groups.map(({ a, rows }) => (
            <tbody key={a.id} className="divide-y divide-slate-100">
              <tr>
                <td colSpan={7 + extraCols} className="pt-5 pb-1.5 pl-5">
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
                const percent = isYesNo ? null : percentAchieved(g.target, g.actual, m.higherIsBetter !== false)
                const status = isYesNo ? (g.actual > 0 ? 'achieved' : 'nodata') : goalStatus(percent)
                const childSum = showChild ? rolledUpTarget(m.id, childScope, childIds) : null
                const ctx = showContext ? read(contextScope, contextId, m.id) : null
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

                    {/* Target — fixed, so it reads as a label rather than a field */}
                    <td className="py-2.5 px-3 text-right tabular-nums text-slate-500">
                      {isYesNo ? <span className="text-slate-300">—</span> : fmt(g.target, m.unit)}
                    </td>

                    {showChild && (
                      <td className="py-2.5 px-3 text-right tabular-nums text-slate-400">
                        {childSum == null ? <span className="text-slate-300">—</span> : fmt(childSum, m.unit)}
                      </td>
                    )}

                    {showContext && (
                      <td className="py-2.5 px-3 text-right tabular-nums text-slate-400">
                        {ctx?.target == null ? <span className="text-slate-300">—</span> : fmt(ctx.target, m.unit)}
                      </td>
                    )}

                    {/* Achieved — the one field on this screen */}
                    <td className="py-2.5 px-3 text-right">
                      {isYesNo ? (
                        <span className="text-slate-600 text-xs font-semibold tabular-nums">
                          {g.actual ?? 0} of {g.total}
                        </span>
                      ) : editable ? (
                        <input
                          type="number" min="0" inputMode="numeric"
                          value={g.actual ?? ''}
                          onChange={onAchieved(m.id)}
                          placeholder="—"
                          title={g.isOverridden ? 'Entered here, overriding the reported figure' : 'From reported data'}
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

                    {/* Progress */}
                    <td className="py-2.5 px-3">
                      {percent == null ? (
                        <span className="text-slate-300 text-xs">not scored</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <span className="block h-1.5 rounded-full transition-all duration-500"
                                  style={{ width: `${Math.min(percent, 100)}%`, background: STATUS_META[status].color }} />
                          </span>
                          <span className="w-10 text-right text-xs font-bold tabular-nums text-slate-700">
                            {pct(percent)}
                          </span>
                        </div>
                      )}
                    </td>

                    <td className="py-2.5 px-3">
                      {isYesNo ? <YesNoPill value={g.actual > 0} /> : <StatusPill status={status} />}
                    </td>

                    <td className="py-2.5 px-2 text-center font-bold text-xs">
                      {percent == null ? (
                        <span className="text-slate-300">—</span>
                      ) : (
                        <span className={onTrackYN(status) === 'Y' ? 'text-emerald-600' : 'text-rose-600'}>
                          {onTrackYN(status)}
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
