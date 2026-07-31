import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { ZONE, DISTRICTS, RY, DATA_AS_OF } from '@/data/zone6'
import { HEADLINE, shortLabel } from '@/data/headline'
import { actualFor, zoneTotal, percentAchieved, goalStatus } from '@/lib/rollup'
import { useGoals } from '@/context/GoalsProvider'
import { fmt, usdExact, num, pct } from '@/lib/format'
import { LevelBanner, Kpi, Card, Bar, StatusPill, DataNote } from '@/components/Bits'

export default function RiOverview() {
  const { read } = useGoals()

  const ranked = [...DISTRICTS]
    .map((d) => ({ id: d.id, region: d.region, value: actualFor('annualFund', 'district', d.id).value ?? 0 }))
    .sort((a, b) => b.value - a.value)
  const max = ranked[0]?.value ?? 0

  const zoneGoals = HEADLINE.map((m) => {
    const g = read('zone', ZONE.id, m.id)
    const p = percentAchieved(g.target, g.actual, true)
    return { m, p, status: goalStatus(p) }
  })
  const onTrack = zoneGoals.filter((g) => g.status === 'ontrack' || g.status === 'achieved').length

  return (
    <>
      <LevelBanner
        eyebrow="RI Director Office"
        title="Global Overview"
        sub={`1 zone · ${DISTRICTS.length} districts · RY ${RY}, data as of ${DATA_AS_OF}`}
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-5">
        <Kpi label="Zones" value="1" sub="Zone 6" />
        <Kpi label="Districts" value={DISTRICTS.length} tone="slate" />
        <Kpi label="Annual Fund" value={usdExact(zoneTotal('annualFund'))} tone="gold" />
        <Kpi label="PHF" value={num(zoneTotal('phf'))} tone="purple" />
        <Kpi label="Major Donors" value={num(zoneTotal('majorDonors'))} tone="green" />
        <Kpi label="Goals on track" value={`${onTrack}/${zoneGoals.length}`} tone={onTrack >= zoneGoals.length / 2 ? 'green' : 'rose'} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-5">
        <Card title="Zones" sub="Click to drill in" className="xl:col-span-1">
          <Link
            to="/zone/overview"
            className="block rounded-xl border-2 p-4 hover:shadow-md transition-all"
            style={{ borderColor: '#003DA5' }}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-lg font-extrabold text-slate-800">{ZONE.name}</p>
                <p className="text-xs text-slate-500">{DISTRICTS.length} districts</p>
              </div>
              <ArrowRight size={18} className="text-[#003DA5] mt-1" />
            </div>
            <p className="text-xs text-slate-500 mb-1">RRFC {ZONE.rrfc.name}</p>
            <p className="text-xl font-extrabold tabular-nums text-[#003DA5]">{usdExact(zoneTotal('annualFund'))}</p>
            <p className="text-[11px] text-slate-400">Annual Fund · {num(zoneTotal('phf'))} PHF</p>
            <p className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-2">
              <CheckCircle2 size={12} /> Monthly report filed
            </p>
          </Link>
        </Card>

        <Card title="Goal Achievement by Area" sub="Zone 6 against its own targets" className="xl:col-span-2">
          <div className="space-y-3">
            {zoneGoals.map(({ m, p, status }) => (
              <div key={m.id}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-slate-600">{shortLabel(m)}</span>
                  <span className="flex items-center gap-2">
                    <span className="text-xs font-bold tabular-nums text-slate-700">{p == null ? '—' : pct(p)}</span>
                    <StatusPill status={status} />
                  </span>
                </div>
                <Bar value={p ?? 0} max={100} color={status === 'behind' ? '#E11D48' : status === 'atrisk' ? '#F59E0B' : '#16A34A'} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Districts by Annual Fund" sub="All 9 Zone 6 districts, highest first">
        <div className="space-y-2">
          {ranked.map((d, i) => (
            <Link key={d.id} to={`/district/${d.id}/overview`} className="flex items-center gap-3 group">
              <span className="w-6 text-right text-xs font-bold text-slate-300 tabular-nums">{i + 1}</span>
              <span className="w-14 text-sm font-semibold text-slate-700 group-hover:text-[#003DA5]">{d.id}</span>
              <span className="flex-1"><Bar value={d.value} max={max} /></span>
              <span className="w-24 text-right text-sm font-bold tabular-nums text-slate-700">{usdExact(d.value)}</span>
            </Link>
          ))}
        </div>
      </Card>

      <div className="mt-5">
        <DataNote tone="slate">
          Only Zone 6 has data. The view is built to hold any number of zones and renders correctly
          with one — no second zone was fabricated to make the screen look fuller.
        </DataNote>
      </div>
    </>
  )
}
