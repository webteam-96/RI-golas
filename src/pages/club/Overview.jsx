import { useParams, Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { CLUBS } from '@/data/clubs'
import { ZONE } from '@/data/zone6'
import { AREAS, areaLeadFor, shortLabel } from '@/data/headline'
import { CLUB_METRICS } from '@/data/metrics'
import { actualFor } from '@/lib/rollup'
import { fmt, usdExact, num, pct } from '@/lib/format'
import { LevelBanner, Kpi, Card, Bar } from '@/components/Bits'
import GoalDashboard from '@/components/GoalDashboard'

// Metrics worth comparing a club against the levels above it.
const COMPARE = ['myRotaryPct', 'trfPerCapita', 'growth']

export default function ClubOverview() {
  const { clubId } = useParams()
  const club = CLUBS.find((c) => c.id === clubId)
  const net = (club.membership.current ?? 0) - (club.membership.atRYStart ?? 0)
  const president = typeof club.president === 'string' ? club.president : club.president?.name

  return (
    <>
      <LevelBanner
        eyebrow={`${ZONE.name} · District ${club.districtId}`}
        title={club.name}
        sub={`Club ID ${club.id}${club.charterDate ? ` · chartered ${club.charterDate}` : ''}${president ? ` · President ${president}` : ''}`}
        right={
          <Link to={`/district/${club.districtId}/overview`}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-white/15 border border-white/30 hover:bg-white/25">
            District {club.districtId} <ArrowUpRight size={13} />
          </Link>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 mb-4">
        <Kpi label="Members" value={num(club.membership.current)} sub={`${net > 0 ? '+' : ''}${net} this year`}
             tone={net > 0 ? 'green' : net < 0 ? 'rose' : 'blue'} />
        {AREAS.map((a) => {
          const m = areaLeadFor('club', a.id)
          return (
            <Kpi key={a.id} label={a.label} sub={shortLabel(m)}
                 value={fmt(actualFor(m.id, 'club', clubId).value, m.unit)}
                 tone={a.id === 'foundation' ? 'gold' : a.id === 'membership' ? 'blue' : a.id === 'publicimage' ? 'purple' : 'green'} />
          )
        })}
      </div>

      <GoalDashboard scope="club" scopeId={clubId} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Card title="How we compare" sub="This club against its district and zone">
          <div className="space-y-4">
            {COMPARE.map((id) => {
              const m = CLUB_METRICS.find((x) => x.id === id)
              const mine = m.get(club)
              const dist = actualFor(id, 'district', club.districtId).value
              const zone = actualFor(id, 'zone', ZONE.id).value
              const max = Math.max(mine ?? 0, dist ?? 0, zone ?? 0) * 1.15 || 1
              const f = (v) => (v == null ? '—' : m.unit === 'percent' ? pct(v, 1) : m.unit === 'USD' ? usdExact(v) : num(v))
              return (
                <div key={id}>
                  <p className="text-xs font-semibold text-slate-600 mb-2">{m.label}</p>
                  {[
                    { label: 'My club', v: mine, c: '#003DA5' },
                    { label: `District ${club.districtId}`, v: dist, c: '#0891B2' },
                    { label: ZONE.name, v: zone, c: '#94A3B8' },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center gap-2 mb-1">
                      <span className="w-24 text-[11px] text-slate-500 truncate">{row.label}</span>
                      <span className="flex-1"><Bar value={row.v ?? 0} max={max} color={row.c} /></span>
                      <span className="w-20 text-right text-[11px] font-bold tabular-nums text-slate-700">{f(row.v)}</span>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </Card>

        <Card title="TRF breakdown" sub="Contribution by fund, US dollars">
          <div className="space-y-3">
            {[
              { label: 'Annual Fund', v: club.trf.annualUSD, c: '#003DA5' },
              { label: 'PolioPlus', v: club.trf.polioUSD, c: '#F7A81B' },
              { label: 'Endowment', v: club.trf.endowmentUSD, c: '#9333EA' },
              { label: 'Other funds', v: club.trf.otherUSD, c: '#0891B2' },
            ].map((f) => (
              <div key={f.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">{f.label}</span>
                  <span className="font-bold tabular-nums text-slate-800">{usdExact(f.v)}</span>
                </div>
                <Bar value={f.v} max={club.trf.totalUSD || 1} color={f.c} />
              </div>
            ))}
            <div className="pt-2 border-t border-slate-100 flex justify-between text-sm">
              <span className="font-semibold text-slate-700">Total</span>
              <span className="font-extrabold tabular-nums text-[#003DA5]">{usdExact(club.trf.totalUSD)}</span>
            </div>
          </div>
          <Link to={`/club/${clubId}/goals`}
                className="mt-4 block text-center text-xs font-semibold text-[#003DA5] hover:underline">
            Set this club&apos;s goals →
          </Link>
        </Card>
      </div>
    </>
  )
}
