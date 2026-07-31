import { useState, useEffect } from 'react'
import { MessageSquare, RotateCcw, Save } from 'lucide-react'
import { dishaNumber } from '@/lib/disha'
import { Card, StatusPill } from './Bits'
import { pctTone } from './GoalMatrix'

const KEY = 'goalseek.report.v1'

const load = () => {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '{}') } catch { return {} }
}

const statusOf = (pct, lowerIsBetter) => {
  if (pct == null) return 'nodata'
  if (lowerIsBetter) return pct <= 100 ? 'achieved' : pct <= 133 ? 'atrisk' : 'behind'
  return pct >= 100 ? 'achieved' : pct >= 75 ? 'ontrack' : pct >= 50 ? 'atrisk' : 'behind'
}

/**
 * Goal entry on the monthly report's own fields.
 *
 * The target is fixed — it comes from the goal-setting event, not from this screen. What is
 * entered here is the achieved figure, plus a comment that feeds section 6 of the report.
 * Entries live in localStorage so they survive a refresh mid-presentation.
 */
export default function ReportGoalForm({ categories, fields, scopeKey, achieved, target, notify }) {
  const [edits, setEdits] = useState(load)
  const [catId, setCatId] = useState(categories[0]?.id)
  const [openComment, setOpenComment] = useState(null)

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(edits)) } catch { /* private mode */ }
  }, [edits])

  const cell = (fieldId) => edits[`${scopeKey}:${fieldId}`] ?? {}
  const patch = (fieldId, part) =>
    setEdits((e) => ({ ...e, [`${scopeKey}:${fieldId}`]: { ...(e[`${scopeKey}:${fieldId}`] ?? {}), ...part } }))

  const rows = fields(catId)

  return (
    <Card
      title="Goals"
      sub={`${rows.length} fields · target is fixed; enter what has been achieved`}
      right={
        <div className="flex gap-2">
          <button
            onClick={() => { setEdits({}); notify?.('Entries cleared — achieved figures back to reported data.') }}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <RotateCcw size={13} /> Clear
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
              <th className="text-right font-medium py-3 px-3 w-28">Target</th>
              <th className="text-right font-medium py-3 px-3 w-32">Achieved</th>
              <th className="text-left font-medium py-3 px-3 w-40">Progress</th>
              <th className="text-left font-medium py-3 px-3 w-28">Status</th>
              <th className="w-12" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((f) => {
              const t = target(f)
              const stored = cell(f.id)
              const a = stored.actual ?? achieved(f)
              const overridden = stored.actual != null
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
                  <td className="py-2.5 px-3 text-right font-data text-slate-500">
                    {dishaNumber(t, f.unit) ?? '—'}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <input
                      type="number" min="0" inputMode="numeric"
                      value={a ?? ''}
                      onChange={(e) => {
                        const raw = e.target.value
                        if (raw === '') return patch(f.id, { actual: null })
                        const v = Number(raw)
                        if (!Number.isFinite(v) || v < 0) return
                        patch(f.id, { actual: v })
                      }}
                      placeholder="—"
                      title={overridden ? 'Entered here, overriding the reported figure' : 'From reported data'}
                      className={`w-28 text-right font-data font-semibold rounded-lg border px-2.5 py-1.5 text-[13px] transition-colors
                                  focus:outline-none focus:ring-2 focus:ring-[#003DA5]/25 focus:border-[#003DA5]
                                  ${overridden ? 'border-amber-300 bg-amber-50 text-amber-900'
                                               : 'border-slate-200 text-slate-800 hover:border-slate-300'}`}
                    />
                  </td>
                  <td className="py-2.5 px-3">
                    {pct == null ? (
                      <span className="text-[11px] text-slate-300">not scored</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <span className="block h-1.5 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(pct, 100)}%`, background: pctTone(pct, f.lowerIsBetter) }} />
                        </span>
                        <span className="w-10 text-right font-data text-[12px] font-bold text-slate-700">
                          {Math.round(pct)}%
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="py-2.5 px-3"><StatusPill status={statusOf(pct, f.lowerIsBetter)} /></td>
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
