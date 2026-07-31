import { STATUS_META } from '@/lib/rollup'
import { Info } from 'lucide-react'

export function LevelBanner({ eyebrow, title, sub, right }) {
  return (
    <div className="rounded-2xl px-6 py-5 mb-5 text-white" style={{ background: '#003DA5' }}>
      <div className="flex items-center gap-2 mb-2">
        <span className="h-1 w-8 rounded-full" style={{ background: '#F7A81B' }} />
        <span className="text-[11px] font-bold tracking-widest uppercase text-blue-200">{eyebrow}</span>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{title}</h1>
          {sub && <p className="text-blue-200 mt-1 text-sm font-medium">{sub}</p>}
        </div>
        {right}
      </div>
    </div>
  )
}

export function Kpi({ label, value, sub, tone = 'blue' }) {
  const tones = {
    blue: 'text-[#003DA5]', gold: 'text-amber-600', green: 'text-emerald-600',
    purple: 'text-purple-600', slate: 'text-slate-500', rose: 'text-rose-600',
  }
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-4 py-3.5">
      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{label}</p>
      <p className={`text-xl sm:text-2xl font-extrabold leading-tight mt-1 tabular-nums ${tones[tone]}`}>{value}</p>
      {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
    </div>
  )
}

export function StatusPill({ status }) {
  const s = STATUS_META[status] ?? STATUS_META.nodata
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full border font-semibold whitespace-nowrap ${s.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
      {s.label}
    </span>
  )
}

export function YesNoPill({ value }) {
  if (value === null || value === undefined)
    return <span className="text-slate-300">—</span>
  return value
    ? <span className="inline-block text-[11px] px-2 py-0.5 rounded-full border font-semibold bg-emerald-100 text-emerald-700 border-emerald-300">Yes</span>
    : <span className="inline-block text-[11px] px-2 py-0.5 rounded-full border font-medium bg-slate-100 text-slate-500 border-slate-200">No</span>
}

export function Card({ title, sub, right, children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-5 ${className}`}>
      {(title || right) && (
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            {title && <h3 className="text-base font-semibold text-slate-800">{title}</h3>}
            {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
          </div>
          {right}
        </div>
      )}
      {children}
    </div>
  )
}

/** Data caveats are shown, never hidden — a wrong number nobody flagged is worse than a gap. */
export function DataNote({ children, tone = 'amber' }) {
  const tones = {
    amber: 'bg-amber-50 border-amber-200 text-amber-800',
    slate: 'bg-slate-50 border-slate-200 text-slate-600',
  }
  return (
    <div className={`flex items-start gap-2 rounded-xl border px-3.5 py-2.5 text-xs leading-relaxed ${tones[tone]}`}>
      <Info size={14} className="mt-0.5 flex-shrink-0" />
      <div>{children}</div>
    </div>
  )
}

export function Coverage({ reporting, total }) {
  if (!total || reporting === total) return null
  return (
    <span className="text-[10px] text-slate-400 ml-1.5 whitespace-nowrap">
      ({reporting} of {total} reporting)
    </span>
  )
}

export function Bar({ value, max, color = '#003DA5', height = 'h-2' }) {
  const w = max > 0 ? Math.min((value / max) * 100, 100) : 0
  return (
    <div className={`bg-slate-100 rounded-full overflow-hidden ${height}`}>
      <div className={`${height} rounded-full transition-all duration-500`} style={{ width: `${w}%`, background: color }} />
    </div>
  )
}

export function EmptyState({ children }) {
  return (
    <div className="flex items-center justify-center py-10 px-4 text-sm text-slate-400 text-center">
      {children}
    </div>
  )
}
