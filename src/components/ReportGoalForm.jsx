import { useState, useEffect } from 'react'
import { MessageSquare, RotateCcw, Save } from 'lucide-react'
import { dishaNumber } from '@/lib/disha'
import { GOALS_YEAR, PREVIOUS_YEAR } from '@/data/disha'
import { setTarget, useTargets, isEntered, enteredCountIn } from '@/data/dishaTargets'
import { Bar, Card, StatusPill } from './Bits'
import { pctTone } from './GoalMatrix'

const KEY = 'goalseek.report.v1'

const load = () => {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '{}') } catch { return {} }
}

// pct is null for two different reasons and they read very differently to a governor: 14 of the
// 27 fields carry a live achieved figure, so "No data" on those rows is simply untrue — what is
// missing is the target.
//
// pct is computed from the two-source target, so a reported figure with a provisional target is
// scored like any other. "No target" now only reaches a row that genuinely has none — the handful
// where the reported figure is a zero no uplift can grow, and the thirteen fields with no figure
// to grow from at all (those show "No data", the achieved side being the missing half).
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
 * The Target input arrives pre-filled with a provisional figure rather than blank, so the two
 * states have to be told apart on sight: an entered target is settled — royal, solid, dark — and
 * a provisional one is unconfirmed — grey, dashed. Typing replaces the provisional figure;
 * emptying the input drops back to it rather than leaving the row unscored.
 *
 * The two columns sit in different years and the headers say so: achieved is what the portal
 * recorded in PREVIOUS_YEAR, the target being typed beside it is for GOALS_YEAR. Nowhere is
 * this more worth stating than here, where the two are a keystroke apart.
 *
 * Targets go to the shared store so every other screen moves with them; comments stay local
 * to this form. Both survive a refresh mid-presentation.
 */
// savedMessage is a prop because the two callers are not equivalent: a district target does feed
// the levels above it, a club target does not. The shared string claimed both.
export default function ReportGoalForm({
  categories, fields, scopeKey, achieved, target, notify,
  savedMessage = 'Goals saved.',
}) {
  const [edits, setEdits] = useState(load)
  const [catId, setCatId] = useState(categories[0]?.id)
  const [openComment, setOpenComment] = useState(null)

  // Redraw whenever a target is set anywhere. The snapshot object identity changes on every
  // write, so overwriting an existing target refreshes too — a count would not.
  useTargets()

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

  // How many targets on this district or club are real rather than provisional. Read after
  // useTargets() so it repaints on every keystroke.
  const entered = enteredCountIn(scope, scopeId)

  // Clears this district or this club only. The store holds both zones, so emptying all of it
  // from a card that shows one scope would take out targets entered on another screen. Clearing
  // removes what was typed; it does not empty the column, since the provisional figures return.
  const clearScope = () => {
    categories.forEach((c) => fields(c.id).forEach((f) => setTarget(scope, scopeId, f.id, null)))
    notify?.(`Entered targets cleared for this ${scope} — the provisional figures show again, and targets set elsewhere are untouched.`)
  }

  return (
    <Card
      title="Goals"
      sub={`${rowCount} · achieved is the figure reported in ${PREVIOUS_YEAR}; the target is for ${GOALS_YEAR} · ${
        entered ? `${entered} entered so far` : 'none entered yet'
      } — a grey, dashed target is provisional, worked out from the figure beside it rather than supplied by the client, and whatever you type replaces it`}
      right={
        <div className="flex gap-2">
          <button
            onClick={clearScope}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <RotateCcw size={13} /> Clear targets
          </button>
          <button
            onClick={() => notify?.(savedMessage)}
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
              // Whether that figure is the governor's own. Everything else in the row treats the
              // two the same — only the input says which it is looking at.
              const own = isEntered(scope, scopeId, f.id)
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
                      // The box arrives pre-filled, so select on focus: one keystroke replaces the
                      // provisional figure instead of landing in the middle of it.
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => {
                        const raw = e.target.value
                        // Emptying the box removes the entered target only. The provisional figure
                        // comes back and the row stays scored — clearing must not blank a cell.
                        if (raw === '') return setTarget(scope, scopeId, f.id, null)
                        const v = Number(raw)
                        // Nothing divides by a zero target, so a 0 would sit in the row looking
                        // set while never scoring. Refused here rather than stored and ignored.
                        if (!Number.isFinite(v) || v <= 0) return
                        setTarget(scope, scopeId, f.id, v)
                      }}
                      placeholder="—"
                      title={own
                        ? `Entered here as the ${GOALS_YEAR} target. Empty the box to go back to the provisional figure.`
                        : t != null
                          ? `Provisional — grown from the ${PREVIOUS_YEAR} figure beside it, not supplied by the client. Type the target agreed at the goal-setting event to replace it.`
                          : `No target for ${GOALS_YEAR}, and no figure to work one out from. It must be more than zero — a zero target cannot be scored against.`}
                      className={`w-24 text-right font-data font-semibold rounded-lg border px-2.5 py-1.5 text-[13px] transition-colors
                                  focus:outline-none focus:ring-2 focus:ring-[#003DA5]/25 focus:border-[#003DA5]
                                  ${own ? 'border-royal/50 bg-royal/[0.05] text-ink'
                                        : t != null ? 'border-dashed border-slate-300 text-slate-400 hover:border-slate-400 focus:text-ink'
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
                        {/* Where less is better the raw ratio runs the wrong way — 2 terminations
                            against a target of 1 is 200%, which filled the track completely and
                            drew total failure as a completed goal. Flipped so the bar always
                            means the same thing: full is good. */}
                        <div className="flex-1">
                          <Bar value={f.lowerIsBetter ? Math.max(0, 200 - pct) : pct} max={100}
                               color={pctTone(pct, f.lowerIsBetter)} />
                        </div>
                        {/* Floored the same way the Bar floors its width. Without this a net
                            change of -9 against a target of 10 paints an empty track next to a
                            caption reading "-90%" — the mark and its label disagreeing on one
                            line. Over 100% is left uncapped: the bar is full and the number
                            still says by how much. */}
                        {/* Capped as well as floored. The target is written on every keystroke, so
                            typing 2700 passes through a target of 2 — 112772%, seven digits in a
                            40px box, shoving the row sideways on stage before it settles. */}
                        <span className="w-10 text-right font-data text-[12px] font-bold text-slate-700">
                          {pct > 999 ? '999+' : `${Math.round(Math.max(pct, 0))}%`}
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
