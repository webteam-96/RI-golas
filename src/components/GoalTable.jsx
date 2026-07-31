import { useState } from 'react'
import { Pencil, RotateCcw, Save } from 'lucide-react'
import { useGoals } from '@/context/GoalsProvider'
import { percentAchieved, goalStatus, onTrackYN } from '@/lib/rollup'
import { fmt, pct } from '@/lib/format'
import { AREAS, metricsInArea } from '@/data/metrics'
import { StatusPill, YesNoPill, Coverage, Card, EmptyState } from './Bits'

/**
 * Goal entry + display. One component, four scopes.
 *
 * `contextLabel` / `contextRead` render a read-only comparison column — a district shows the
 * zone target beside its own, which is the whole point of the PDF's section 6.
 * `childScope` / `childIds` render the rolled-up commitment of the level below, BESIDE the
 * level's own target, never instead of it. The gap between the two is the interesting part.
 */
export default function GoalTable({
  scope, scopeId, metrics, editable = true,
  childScope, childIds, childLabel = 'Children',
  contextLabel, contextScope, contextId,
}) {
  const { read, patch, reset, rolledUpTarget, notify } = useGoals()
  const [openComment, setOpenComment] = useState(null)

  // The same four areas at every level, so the tab strip never changes shape as you drill.
  const areas = AREAS.filter((a) => metricsInArea(metrics, a.id).length > 0)
  const [area, setArea] = useState(areas[0]?.id ?? 'foundation')
  const rows = metricsInArea(metrics, area)

  const showChild = !!(childScope && childIds?.length)
  const showContext = !!(contextLabel && contextScope && contextId)

  const onNumber = (metricId, field) => (e) => {
    const raw = e.target.value
    if (raw === '') return patch(scope, scopeId, metricId, field, null)
    const v = Number(raw)
    if (!Number.isFinite(v) || v < 0) return          // reject negatives and junk at the keypress
    patch(scope, scopeId, metricId, field, v)
  }

  return (
    <Card
      title="Goals"
      sub={`${rows.length} metrics in ${AREAS.find((a) => a.id === area)?.label} · targets are editable and roll up immediately`}
      right={
        editable && (
          <div className="flex gap-2">
            <button
              onClick={() => { reset(); notify('Targets reset to seeded values.') }}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <RotateCcw size={13} /> Reset
            </button>
            <button
              onClick={() => notify('Goals saved — District, Zone and RI views updated.')}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-white"
              style={{ background: '#003DA5' }}
            >
              <Save size={13} /> Save Goals
            </button>
          </div>
        )
      }
    >
      <div className="flex gap-1 flex-wrap bg-slate-100 rounded-xl p-1 mb-4">
        {areas.map((a) => {
          const active = a.id === area
          return (
            <button
              key={a.id}
              onClick={() => setArea(a.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                active ? 'text-white shadow-sm font-semibold' : 'text-slate-500 hover:text-slate-800 hover:bg-white'
              }`}
              style={active ? { backgroundColor: '#003DA5' } : {}}
            >
              {a.label}
              <span className={`ml-1.5 text-[10px] ${active ? 'text-blue-200' : 'text-slate-400'}`}>
                {metricsInArea(metrics, a.id).length}
              </span>
            </button>
          )
        })}
      </div>

      {!rows.length && <EmptyState>No metrics in this area yet.</EmptyState>}

      <div className="overflow-x-auto -mx-5 px-5">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="text-[10px] uppercase tracking-widest text-slate-400 border-b border-slate-200">
              <th className="text-left font-bold pb-2 pr-3">Metric</th>
              <th className="text-right font-bold pb-2 px-2 w-32">Target</th>
              {showChild && <th className="text-right font-bold pb-2 px-2 w-32">{childLabel}</th>}
              {showContext && <th className="text-right font-bold pb-2 px-2 w-32">{contextLabel}</th>}
              <th className="text-right font-bold pb-2 px-2 w-32">Actual</th>
              <th className="text-right font-bold pb-2 px-2 w-20">%</th>
              <th className="text-left font-bold pb-2 px-2 w-28">Status</th>
              <th className="text-center font-bold pb-2 px-2 w-16">On&nbsp;Track</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((m) => {
              const g = read(scope, scopeId, m.id)
              const isYesNo = m.unit === 'yesno'
              const percent = isYesNo ? null : percentAchieved(g.target, g.actual, m.higherIsBetter !== false)
              const status = isYesNo ? (g.actual > 0 ? 'achieved' : 'nodata') : goalStatus(percent)
              const childSum = showChild ? rolledUpTarget(m.id, childScope, childIds) : null
              const ctx = showContext ? read(contextScope, contextId, m.id) : null

              return (
                <tr key={m.id} className="hover:bg-slate-50/70 align-middle">
                  <td className="py-2.5 pr-3">
                    <span className="text-slate-700 font-medium">{m.label}</span>
                    {m.code != null && (
                      <span className="ml-2 text-[9px] text-slate-300 font-mono">#{m.code}</span>
                    )}
                    {g.total > 0 && <Coverage reporting={g.reporting} total={g.total} />}
                  </td>

                  {/* Target */}
                  <td className="py-2.5 px-2 text-right">
                    {isYesNo ? (
                      <span className="text-slate-300 text-xs">—</span>
                    ) : editable ? (
                      <input
                        type="number" min="0" inputMode="numeric"
                        value={g.target ?? ''}
                        onChange={onNumber(m.id, 'target')}
                        placeholder="—"
                        className="w-28 text-right tabular-nums rounded-lg border border-slate-200 px-2 py-1 text-sm
                                   focus:outline-none focus:ring-2 focus:ring-[#003DA5]/30 focus:border-[#003DA5]"
                      />
                    ) : (
                      <span className="tabular-nums text-slate-700">{fmt(g.target, m.unit)}</span>
                    )}
                  </td>

                  {showChild && (
                    <td className="py-2.5 px-2 text-right tabular-nums text-slate-500">
                      {childSum == null ? <span className="text-slate-300">—</span> : fmt(childSum, m.unit)}
                    </td>
                  )}

                  {showContext && (
                    <td className="py-2.5 px-2 text-right tabular-nums text-slate-500">
                      {ctx?.target == null ? <span className="text-slate-300">—</span> : fmt(ctx.target, m.unit)}
                    </td>
                  )}

                  {/* Actual */}
                  <td className="py-2.5 px-2 text-right">
                    {isYesNo ? (
                      <span className="text-slate-600 text-xs font-semibold tabular-nums">
                        {g.actual ?? 0} of {g.total}
                      </span>
                    ) : editable ? (
                      <input
                        type="number" min="0" inputMode="numeric"
                        value={g.actual ?? ''}
                        onChange={onNumber(m.id, 'actual')}
                        placeholder="—"
                        title={g.isOverridden ? 'Manually overridden' : 'From reported data'}
                        className={`w-28 text-right tabular-nums rounded-lg border px-2 py-1 text-sm
                                    focus:outline-none focus:ring-2 focus:ring-[#003DA5]/30 focus:border-[#003DA5]
                                    ${g.isOverridden ? 'border-amber-300 bg-amber-50' : 'border-slate-200'}`}
                      />
                    ) : (
                      <span className="tabular-nums text-slate-700 font-medium">{fmt(g.actual, m.unit)}</span>
                    )}
                  </td>

                  <td className="py-2.5 px-2 text-right tabular-nums font-semibold text-slate-700">
                    {percent == null ? <span className="text-slate-300 font-normal">—</span> : pct(percent)}
                  </td>

                  <td className="py-2.5 px-2">
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

                  <td className="py-2.5 pl-1">
                    <button
                      onClick={() => setOpenComment(openComment === m.id ? null : m.id)}
                      title={g.comment || 'Add a comment'}
                      className={`p-1 rounded transition-colors ${g.comment ? 'text-[#003DA5]' : 'text-slate-300 hover:text-slate-500'}`}
                    >
                      <Pencil size={13} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {openComment && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
            Comment — {metrics.find((m) => m.id === openComment)?.label}
          </span>
          <input
            autoFocus
            value={read(scope, scopeId, openComment).comment}
            onChange={(e) => patch(scope, scopeId, openComment, 'comment', e.target.value)}
            placeholder="Feeds the Comments column of the monthly coordinator report"
            className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm
                       focus:outline-none focus:ring-2 focus:ring-[#003DA5]/30 focus:border-[#003DA5]"
          />
          <button onClick={() => setOpenComment(null)} className="text-xs text-slate-400 hover:text-slate-700 px-2">
            Done
          </button>
        </div>
      )}
    </Card>
  )
}
