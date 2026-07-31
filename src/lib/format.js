export const usd = (v) =>
  v == null ? '—' :
  Math.abs(v) >= 1_000_000 ? `$${(v / 1_000_000).toFixed(2)}M` :
  Math.abs(v) >= 10_000 ? `$${Math.round(v).toLocaleString('en-US')}` :
  `$${v.toLocaleString('en-US', { maximumFractionDigits: 0 })}`

export const usdExact = (v) => (v == null ? '—' : `$${Math.round(v).toLocaleString('en-US')}`)

export const inr = (v) =>
  v == null ? '—' :
  v >= 1e7 ? `₹${(v / 1e7).toFixed(2)}Cr` :
  v >= 1e5 ? `₹${(v / 1e5).toFixed(1)}L` :
  v >= 1e3 ? `₹${Math.round(v / 1e3)}K` :
  `₹${Math.round(v).toLocaleString('en-IN')}`

export const num = (v) => (v == null ? '—' : Math.round(v).toLocaleString('en-IN'))

export const pct = (v, dp = 0) => (v == null ? '—' : `${v.toFixed(dp)}%`)

/** Format a value according to its metric unit. Yes/No is handled by the caller as a badge. */
export function fmt(value, unit) {
  if (value == null) return '—'
  if (unit === 'USD') return usdExact(value)
  if (unit === 'INR') return inr(value)
  if (unit === 'percent') return pct(value, 1)
  return num(value)
}

export const initials = (s = '') =>
  s.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('')
