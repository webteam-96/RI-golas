import { AREAS, areaMetrics, areaLead, AREA_COLOR, shortLabel } from '@/data/headline'
import { percentAchieved, goalStatus, onTrackYN } from '@/lib/rollup'
import { useGoals } from '@/context/GoalsProvider'
import { fmt, pct } from '@/lib/format'
import { StatusPill, Bar, Card } from './Bits'

/**
 * The four goal areas, identical at RI, Zone, District and Club. Written once so the strip
 * cannot drift between levels — a Director and a club president should be looking at the
 * same four headings.
 */
export function AreaCardStrip({ scope, scopeId, area, onSelect }) {
  const { read } = useGoals()
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
      {AREAS.map((a) => {
        const m = areaLead(a.id)
        const g = read(scope, scopeId, m.id)
        const p = percentAchieved(g.target, g.actual, m.higherIsBetter !== false)
        const status = goalStatus(p)
        const active = a.id === area
        return (
          <button
            key={a.id}
            onClick={() => onSelect(a.id)}
            className={`text-left bg-white rounded-2xl border-2 shadow-sm p-4 transition-all hover:shadow-md ${
              active ? '' : 'border-slate-200'
            }`}
            style={active ? { borderColor: AREA_COLOR[a.id] } : {}}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-6 rounded-full" style={{ background: AREA_COLOR[a.id] }} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{a.label}</span>
            </div>
            <p className="text-2xl font-extrabold tabular-nums text-slate-800 leading-tight">
              {fmt(g.actual, m.unit)}
            </p>
            <p className="text-[11px] text-slate-400 mb-2">
              {shortLabel(m)} · target {fmt(g.target, m.unit)}
            </p>
            <Bar value={p ?? 0} max={100} color={AREA_COLOR[a.id]} />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs font-bold tabular-nums text-slate-600">{p == null ? '—' : pct(p)}</span>
              <StatusPill status={status} />
            </div>
          </button>
        )
      })}
    </div>
  )
}

/** Goal Progress table for one area — the shape of section 6 of the coordinator report. */
export function AreaGoalTable({ scope, scopeId, area, contextScope, contextId, contextLabel, title, sub }) {
  const { read } = useGoals()
  const rows = areaMetrics(area)
  const showContext = !!(contextLabel && contextScope && contextId)

  return (
    <Card title={title ?? `${AREAS.find((a) => a.id === area).label} — Goal Progress`} sub={sub} className="mb-5">
      <div className="overflow-x-auto -mx-5 px-5">
        <table className="w-full text-sm min-w-[680px]">
          <thead>
            <tr className="text-[10px] uppercase tracking-widest text-slate-400 border-b border-slate-200">
              <th className="text-left font-bold pb-2">Goal Area</th>
              <th className="text-right font-bold pb-2 px-3">Target</th>
              {showContext && <th className="text-right font-bold pb-2 px-3">{contextLabel}</th>}
              <th className="text-right font-bold pb-2 px-3">Actual to Date</th>
              <th className="text-right font-bold pb-2 px-3">% Achieved</th>
              <th className="text-left font-bold pb-2 px-3">Status</th>
              <th className="text-center font-bold pb-2 px-3">On Track</th>
              <th className="text-left font-bold pb-2">Comments</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((m) => {
              const g = read(scope, scopeId, m.id)
              const ctx = showContext ? read(contextScope, contextId, m.id) : null
              const p = percentAchieved(g.target, g.actual, m.higherIsBetter !== false)
              const s = goalStatus(p)
              return (
                <tr key={m.id} className="hover:bg-slate-50/70">
                  <td className="py-2.5 text-slate-700 font-medium">{m.label}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-slate-700">{fmt(g.target, m.unit)}</td>
                  {showContext && (
                    <td className="py-2.5 px-3 text-right tabular-nums text-slate-400">{fmt(ctx?.target, m.unit)}</td>
                  )}
                  <td className="py-2.5 px-3 text-right tabular-nums font-semibold text-slate-800">{fmt(g.actual, m.unit)}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-semibold">{p == null ? '—' : pct(p)}</td>
                  <td className="py-2.5 px-3"><StatusPill status={s} /></td>
                  <td className={`py-2.5 px-3 text-center font-bold text-xs ${p == null ? 'text-slate-300' : onTrackYN(s) === 'Y' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {p == null ? '—' : onTrackYN(s)}
                  </td>
                  <td className="py-2.5 text-xs text-slate-400 max-w-[160px] truncate">{g.comment || '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
