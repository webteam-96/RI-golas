import { useState, useEffect, useSyncExternalStore } from 'react'
import { MessageSquare, RotateCcw, Save } from 'lucide-react'
import { dishaNumber } from '@/lib/disha'
import { GOALS_YEAR, PREVIOUS_YEAR } from '@/data/disha'
import { setTarget, subscribe, getTargets } from '@/data/dishaTargets'
import { Bar, Card, StatusPill } from './Bits'
import { pctTone } from './GoalMatrix'

const KEY = 'goalseek.report.v1'

const load = () => {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '{}') } catch { return {} }
}

// pct is null for two different reasons and they read very differently to a governor: 14 of the
// 27 fields carry a live achieved figure, so "No data" on those rows is simply untrue — what is
// missing is the target.
const statusOf = (pct, achievedValue, lowerIsBetter) => {
  if (pct == null) return achievedValue == null ? 'nodata' : 'notset'
  if (lowerIsBetter) return pct <= 100 ? 'achieved' : pct <= 133 ? 'atrisk' : 'behind'
  return pct >= 100 ? 'achieved' : pct >= 75 ? 'ontrack' : pct >= 50 ? 'atrisk' : 'behind'
}

/**
 * Goal entry on the monthly report's own fields.
 *
 * This screen is the goal-setting event: the target is what gets entered here, because the
 * portal seeds none. Achieved is the figure already reported and is read-only — a dash where
 * the portal carries no column for that field. A comment can be added against any row and
 * feeds section 6 of the report.
 *
 * The two columns sit in different years and the headers say so: achieved is what the portal
 * recorded in PREVIOUS_YEAR, the target being typed beside it is for GOALS_YEAR. Nowhere is
 * this more worth stating than here, where the two are a keystroke apart.
 *
 * Targets go to the shared store so every other screen moves with them; comments stay local
 * to this form. Both survive a refresh mid-presentation.
 */
export default function ReportGoalForm({ categories, fields, scopeKey, achieved, target, notify }) {
  const [edits, setEdits] = useState(load)
  const [catId, setCatId] = useState(categories[0]?.id)
  const [openComment, setOpenComment] = useState(null)

  // Redraw whenever a target is set anywhere. The snapshot object identity changes on every
  // write, so overwriting an existing target refreshes too — a count would not.
  useSyncExternalStore(subscribe, getTargets, getTargets)

  // Already `${scope}:${scopeId}` from both calling pages — split once for the target store.
  const [scope, scopeId] = scopeKey.split(':')

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(edits)) } catch { /* private mode */ }
  }, [edits])

  const cell = (fieldId) => edits[`${scopeKey}:${fieldId}`] ?? {}
  const patch = (fieldId, part) =>
    setEdits((e) => ({ ...e, [`${scopeKey}:${fieldId}`]: { ...(e[`${scopeKey}:${fieldId}`] ?? {}), ...part } }))

  const rows = fields(catId)
  // Projects carries exactly one field, so a hardcoded plural reads "1 fields" on the
  // district goals screen before anyone has touched anything.
  const rowCount = `${rows.length} field${rows.length === 1 ? '' : 's'}`

  // Clears this district or this club only. The store holds both zones, so emptying all of it
  // from a card that shows one scope would take out targets entered on another screen.
  const clearScope = () => {
    categories.forEach((c) => fields(c.id).forEach((f) => setTarget(scope, scopeId, f.id, null)))
    notify?.(`Targets cleared for this ${scope} — targets set elsewhere are untouched.`)
  }

  return (
    <Card
      title="Goals"
      sub={`${rowCount} · achieved is the figure reported in ${PREVIOUS_YEAR}; the target you enter is for ${GOALS_YEAR}`}
      right={
        <div className="flex gap-2">
          <button
            onClick={clearScope}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <RotateCcw size={13} /> Clear targets
          </button>
          <button
            onClick={() => notify?.('Goals saved — the levels above recompute immediately.')}
            className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg text-white shadow-sm hover:opacity-90 transition-opacity"
            style={{ background: '#003DA5' }}
          >
            <Save size={13} /> Save Goals
          </button>
        </div>
      }
    >
      <div className="flex gap-1.5 flex-wrap mb-4">
        {categories.map((c) => {
          const on = c.id === catId
          return (
            <button key={c.id} onClick={() => setCatId(c.id)}
                    className={`px-5 py-2.5 rounded-xl text-[13px] font-semibold border transition-all ${
                      on ? 'bg-royal text-white border-royal shadow-sm'
                         : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-ink'
                    }`}>
              {c.label}
            </button>
          )
        })}
      </div>

      <div className="overflow-x-auto -mx-5">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="eyebrow text-slate-400 border-b-2 border-slate-200">
              <th className="text-left font-medium py-3 pl-5 pr-4">Goal</th>
              {/* Both columns are too narrow to carry the year inline, so it goes on a second
                  line — the one place a governor cannot miss it while typing. */}
              <th className="text-right font-medium py-3 px-3 w-32">
                Target
                <span className="block tracking-normal text-royal/60">{GOALS_YEAR}</span>
              </th>
              <th className="text-right font-medium py-3 px-3 w-28">
                Achieved
                <span className="block tracking-normal text-slate-300">{PREVIOUS_YEAR}</span>
              </th>
              <th className="text-left font-medium py-3 px-3 w-40">Progress</th>
              <th className="text-left font-medium py-3 px-3 w-28">Status</th>
              <th className="w-12" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((f) => {
              const t = target(f)
              const stored = cell(f.id)
              const a = achieved(f)
              const pct = a != null && t ? (a / t) * 100 : null
              const open = openComment === f.id

              return (
                <tr key={f.id} className={open ? 'bg-royal/[0.04]' : 'hover:bg-slate-50/70'}>
                  <td className="py-2.5 pl-5 pr-4 text-slate-700">
                    {f.label}
                    {f.muted && <span className="ml-2 text-[10px] text-slate-300">{f.muted}</span>}
                    {stored.comment && !open && (
                      <p className="text-[11px] text-slate-400 italic truncate max-w-[280px]">{stored.comment}</p>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <input
                      type="number" min="1" inputMode="numeric"
                      value={t ?? ''}
                      onChange={(e) => {
                        const raw = e.target.value
                        if (raw === '') return setTarget(scope, scopeId, f.id, null)
                        const v = Number(raw)
                        // Nothing divides by a zero target, so a 0 would sit in the row looking
                        // set while never scoring. Refused here rather than stored and ignored.
                        if (!Number.isFinite(v) || v <= 0) return
                        setTarget(scope, scopeId, f.id, v)
                      }}
                      placeholder="—"
                      title={`The target agreed at the goal-setting event for ${GOALS_YEAR}. It must be more than zero — a zero target cannot be scored against.`}
                      className={`w-24 text-right font-data font-semibold rounded-lg border px-2.5 py-1.5 text-[13px] transition-colors
                                  focus:outline-none focus:ring-2 focus:ring-[#003DA5]/25 focus:border-[#003DA5]
                                  ${t != null ? 'border-royal/40 bg-royal/[0.04] text-ink'
                                              : 'border-slate-200 text-slate-800 hover:border-slate-300'}`}
                    />
                  </td>
                  <td className="py-2.5 px-3 text-right font-data">
                    {a == null ? (
                      <span className="text-slate-300" title={`Not carried in the portal for this field in ${PREVIOUS_YEAR}`}>—</span>
                    ) : (
                      <span className="text-slate-700 font-semibold">{dishaNumber(a, f.unit)}</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    {pct == null ? (
                      <span className="text-[11px] text-slate-300">not scored</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        {/* The shared Bar, not a local one: it floors the width at 0, so a
                            negative net change no longer paints a full track. */}
                        <div className="flex-1"><Bar value={pct} max={100} color={pctTone(pct, f.lowerIsBetter)} /></div>
                        {/* Floored the same way the Bar floors its width. Without this a net
                            change of -9 against a target of 10 paints an empty track next to a
                            caption reading "-90%" — the mark and its label disagreeing on one
                            line. Over 100% is left uncapped: the bar is full and the number
                            still says by how much. */}
                        <span className="w-10 text-right font-data text-[12px] font-bold text-slate-700">
                          {Math.round(Math.max(pct, 0))}%
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="py-2.5 px-3"><StatusPill status={statusOf(pct, a, f.lowerIsBetter)} /></td>
                  <td className="py-2.5 pr-4 text-right">
                    <button
                      onClick={() => setOpenComment(open ? null : f.id)}
                      title={stored.comment || 'Add a comment'}
                      className={`p-1.5 rounded-lg transition-colors ${
                        stored.comment || open ? 'text-royal bg-blue-50'
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
        </table>
      </div>

      {openComment && (
        <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-3">
          <span className="eyebrow text-slate-400">
            Comment — {rows.find((f) => f.id === openComment)?.label}
          </span>
          <div className="flex items-center gap-2 mt-1.5">
            <input
              autoFocus
              value={cell(openComment).comment ?? ''}
              onChange={(e) => patch(openComment, { comment: e.target.value })}
              placeholder="Feeds the Comments column of the monthly coordinator report"
              className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-[#003DA5]/25 focus:border-[#003DA5]"
            />
            <button onClick={() => setOpenComment(null)}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-2">
              Done
            </button>
          </div>
        </div>
      )}
    </Card>
  )
}
