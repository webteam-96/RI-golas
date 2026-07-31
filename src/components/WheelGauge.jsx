/**
 * The Rotary wheel as the achievement gauge.
 *
 * The emblem is a 24-cog gear. Here the cogs light in proportion to attainment, so the
 * organisation's own mark fills up as goals are met — 61.7% is 15 of 24 cogs lit. A donut
 * chart would carry the same number and none of the meaning.
 */
export default function WheelGauge({ value, size = 168, label = 'Achieved' }) {
  const COGS = 24
  const pctValue = value == null ? 0 : Math.max(0, Math.min(value, 100))
  const lit = Math.round((pctValue / 100) * COGS)

  const c = size / 2
  const rOuter = c - 4
  const cogLen = size * 0.105
  const cogW = size * 0.052
  const rRing = rOuter - cogLen
  const ringW = size * 0.05

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img"
           aria-label={`${label}: ${value == null ? 'not scored' : `${value.toFixed(1)} percent`}`}>
        {/* Cogs */}
        {Array.from({ length: COGS }, (_, i) => {
          const on = i < lit
          const angle = (i / COGS) * 360 - 90
          return (
            <rect
              key={i}
              x={c - cogW / 2}
              y={c - rOuter}
              width={cogW}
              height={cogLen}
              rx={cogW * 0.3}
              fill={on ? 'var(--gold)' : '#DDE4F0'}
              transform={`rotate(${angle + 90} ${c} ${c})`}
              style={{ transition: 'fill 500ms ease' }}
            />
          )
        })}

        {/* Ring — the wheel's rim */}
        <circle cx={c} cy={c} r={rRing - ringW / 2} fill="none" stroke="#DDE4F0" strokeWidth={ringW} />
        <circle
          cx={c} cy={c} r={rRing - ringW / 2}
          fill="none" stroke="var(--royal)" strokeWidth={ringW} strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * (rRing - ringW / 2)}`}
          strokeDashoffset={`${2 * Math.PI * (rRing - ringW / 2) * (1 - pctValue / 100)}`}
          transform={`rotate(-90 ${c} ${c})`}
          style={{ transition: 'stroke-dashoffset 700ms ease' }}
        />

        {/* Hub */}
        <circle cx={c} cy={c} r={rRing - ringW - size * 0.035} fill="#fff" />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="font-display font-bold leading-none text-royal" style={{ fontSize: size * 0.235 }}>
          {value == null ? '—' : Math.round(value)}
          {value != null && <span style={{ fontSize: size * 0.11 }} className="align-top">%</span>}
        </span>
        <span className="eyebrow text-slate-400 mt-1" style={{ fontSize: size * 0.055 }}>
          {label}
        </span>
      </div>
    </div>
  )
}
