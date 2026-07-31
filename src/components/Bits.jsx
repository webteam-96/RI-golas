import { STATUS_META } from '@/lib/rollup'
import { Info } from 'lucide-react'

/**
 * Level identity. Each dashboard opens with the same masthead so the viewer always knows
 * which rung of the hierarchy they are standing on — the eyebrow states it outright.
 */
export function LevelBanner({ eyebrow, title, sub, right }) {
  return (
    <header className="relative overflow-hidden rounded-2xl px-6 sm:px-8 py-6 mb-5 text-white shadow-lg shadow-royal/20"
            style={{ background: 'linear-gradient(135deg, #002A73 0%, #003DA5 55%, #0067C8 100%)' }}>
      {/* A quiet echo of the wheel, off the right edge */}
      <svg className="absolute -right-10 -top-12 opacity-[0.07] pointer-events-none" width="260" height="260" viewBox="0 0 100 100" aria-hidden="true">
        {Array.from({ length: 24 }, (_, i) => (
          <rect key={i} x="48.4" y="2" width="3.2" height="9" rx="1" fill="#fff"
                transform={`rotate(${(i / 24) * 360} 50 50)`} />
        ))}
        <circle cx="50" cy="50" r="33" fill="none" stroke="#fff" strokeWidth="7" />
      </svg>

      <div className="relative">
        <div className="flex items-center gap-2.5 mb-2.5">
          <span className="h-[3px] w-9 rounded-full bg-gold" />
          <span className="eyebrow text-blue-100/90">{eyebrow}</span>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-[1.75rem] sm:text-[2.125rem] font-bold leading-none">{title}</h1>
            {sub && <p className="text-blue-100/80 mt-2 text-[13px] leading-relaxed max-w-3xl">{sub}</p>}
          </div>
          {right}
        </div>
      </div>
    </header>
  )
}

/**
 * The counter. One design used on every page — an engraved dark plate rather than a row of
 * white tiles, so the headline figures read as one instrument and not as separate cards.
 * `items` is [{ label, value, sub }].
 */
export function StatPlate({ title, sub, items = [], columns = 'lg:grid-cols-6' }) {
  return (
    <section className="rounded-2xl bg-ink text-white mb-6 overflow-hidden shadow-[0_2px_10px_rgba(10,26,51,0.18)]">
      {(title || sub) && (
        <>
          <div className="flex flex-wrap items-baseline justify-between gap-2 px-5 pt-4 pb-3">
            {title && (
              <h3 className="font-display text-[15px] font-semibold flex items-center gap-2.5">
                <span className="h-[3px] w-6 rounded-full bg-gold" />
                {title}
              </h3>
            )}
            {sub && <p className="text-[11px] text-slate-400">{sub}</p>}
          </div>
          <div className="h-px bg-white/10 mx-5" />
        </>
      )}
      <dl className={`grid grid-cols-2 sm:grid-cols-3 ${columns} gap-x-6 gap-y-5 px-5 py-5`}>
        {items.map((it) => (
          <div key={it.label}>
            <dt className="eyebrow text-slate-400">{it.label}</dt>
            <dd className="font-display text-[1.4rem] font-bold tabular-nums text-white mt-1.5 leading-none">
              {it.value}
            </dd>
            {it.sub && <p className="text-[11px] text-slate-500 mt-1">{it.sub}</p>}
          </div>
        ))}
      </dl>
    </section>
  )
}

export function StatusPill({ status }) {
  const s = STATUS_META[status] ?? STATUS_META.nodata
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-full border font-semibold whitespace-nowrap ${s.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
      {s.label}
    </span>
  )
}

export function YesNoPill({ value }) {
  if (value === null || value === undefined) return <span className="text-slate-300">—</span>
  return value
    ? <span className="inline-block text-[11px] px-2.5 py-0.5 rounded-full border font-semibold bg-[#009739]/10 text-[#00702A] border-[#009739]/25">Yes</span>
    : <span className="inline-block text-[11px] px-2.5 py-0.5 rounded-full border font-medium bg-slate-100 text-slate-500 border-slate-200">No</span>
}

export function Card({ title, sub, right, children, className = '' }) {
  return (
    <section className={`bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_2px_rgba(10,26,51,0.04)] p-5 ${className}`}>
      {(title || right) && (
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            {title && <h3 className="font-display text-[15px] font-semibold text-ink">{title}</h3>}
            {sub && <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{sub}</p>}
          </div>
          {right}
        </div>
      )}
      {children}
    </section>
  )
}

/** Data caveats are shown, never hidden — a wrong number nobody flagged is worse than a gap. */
export function DataNote({ children, tone = 'gold' }) {
  const tones = {
    gold: 'bg-gold/[0.07] border-gold/30 text-[#7A5200]',
    slate: 'bg-slate-50 border-slate-200 text-slate-600',
  }
  return (
    <div className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-[12px] leading-relaxed ${tones[tone]}`}>
      <Info size={14} className="mt-0.5 flex-shrink-0 opacity-70" />
      <div>{children}</div>
    </div>
  )
}

export function Coverage({ reporting, total }) {
  if (!total || reporting === total) return null
  return (
    <span className="font-data text-[10px] text-slate-400 ml-1.5 whitespace-nowrap">
      {reporting}/{total} reporting
    </span>
  )
}

export function Bar({ value, max, color = '#003DA5', height = 'h-1.5' }) {
  const w = max > 0 ? Math.min((value / max) * 100, 100) : 0
  return (
    <div className={`bg-slate-100 rounded-full overflow-hidden ${height}`}>
      <div className={`${height} rounded-full transition-all duration-700 ease-out`}
           style={{ width: `${w}%`, background: color }} />
    </div>
  )
}

export function EmptyState({ children }) {
  return (
    <div className="flex items-center justify-center py-12 px-4 text-[13px] text-slate-400 text-center">
      {children}
    </div>
  )
}
